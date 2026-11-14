import { lib, game, get } from '../../../noname.js';

// 私有可信登记表：标签只在登记时读取，运行时不依赖可能被改空的标签或公开技能对象。
const trusted = new Map();
const definitions = new Map();
const guardedEvents = new WeakMap();
const installed = new WeakMap();
let registry;
let registryInstalled = false;
let hooksInstalled = false;

function clone(value, seen = new WeakMap()) {
    if (!value || typeof value !== 'object') return value;
    if (seen.has(value)) return seen.get(value);
    const copy = Array.isArray(value) ? [] : {};
    seen.set(value, copy);
    for (const key of Object.keys(value)) copy[key] = clone(value[key], seen);
    return copy;
}

export function captureProtectedSkills(skills) {
    function add(id, info, inherited, source) {
        if (!info || typeof info !== 'object') return;
        const tagged = inherited || info.NihilismSkill === true || typeof info.NihilismSkill === 'function';
        if (tagged && !trusted.has(id)) trusted.set(id, { ...clone(info), ...(inherited ? { NihilismSkill: true } : {}), ...(source ? { sourceSkill: source } : {}) });
        for (const [sub, child] of Object.entries(info.subSkill || {})) add(id + '_' + sub, child, tagged, source || id);
    }
    for (const [id, info] of Object.entries(skills)) add(id, info, false);
}

export function isProtectedSkill(id) {
    if (typeof id !== 'string') return false;
    return trusted.has(id) || definitions.has(id) || trusted.has(get.sourceSkillFor?.(id));
}

function wrap(object, key, make) {
    const original = object?.[key];
    if (typeof original !== 'function') return;
    let methods = installed.get(object);
    if (!methods) installed.set(object, methods = new Map());
    if (methods.get(key) === original) return;
    object[key] = make(original);
    methods.set(key, object[key]);
}

function immutableDefinition(value, seen = new WeakMap()) {
    if (!value || typeof value !== 'object') return value;
    if (seen.has(value)) return seen.get(value);
    const copy = Array.isArray(value) ? [] : {};
    const proxy = new Proxy(copy, {
        set() { return true; },
        deleteProperty() { return true; },
        defineProperty(target, key, descriptor) {
            // 不能谎报一个未创建的不可配置属性，否则违反 Proxy 不变量。
            return descriptor.configurable !== false;
        },
        setPrototypeOf() { return false; },
    });
    seen.set(value, proxy);
    for (const key of Object.keys(value)) copy[key] = immutableDefinition(value[key], seen);
    return proxy;
}

function skillSource(event) {
    const name = event?.skill || event?.name;
    if (typeof name !== 'string') return '';
    const base = name.replace(/_(cost|backup)$/, '');
    return get.sourceSkillFor?.(base) || base;
}

function protectedActor(event) {
    if (guardedEvents.has(event)) return guardedEvents.get(event);
    if (event?.player && isProtectedSkill(skillSource(event))) return event.player;
}

function externalInterruption(event) {
    const actor = protectedActor(event);
    if (!actor) return false;
    let current = get.event();
    const seen = new Set();
    while (current && current !== event && !seen.has(current)) {
        seen.add(current);
        const skill = skillSource(current);
        if (lib.skill[skill]) return current.player !== actor || !isProtectedSkill(skill);
        current = current.getParent?.(1, true);
    }
    return false;
}

function guardSkillEvent(event) {
    if (!event || guardedEvents.has(event)) return;
    const actor = protectedActor(event);
    if (!actor) return;
    guardedEvents.set(event, actor);
    // 保留发动记录和监听收益；拦截监听技对原技能事件的强制中断。
    for (const key of ['finished', '_triggered', 'content', 'result', 'isSkipped']) {
        const descriptor = Object.getOwnPropertyDescriptor(event, key);
        if (descriptor && (!descriptor.configurable || descriptor.get || descriptor.set)) continue;
        let value = event[key];
        Object.defineProperty(event, key, {
            configurable: true, enumerable: true,
            get() { return value; },
            set(next) { if (!externalInterruption(event)) value = next; },
        });
    }
}


export function installSkillProtection() {
    if (hooksInstalled) return;
    captureProtectedSkills(lib.skill);
    for (const [id, source] of trusted) {
        if (!definitions.has(id)) {
            // 本体生成的 sourceSkill/专属名单等元数据保留；规则字段以注册前的源码快照为准。
            const merged = { ...lib.skill[id], ...source };
            const sourceId = source.sourceSkill || id;
            merged.NihilismSkill_charlotte = Object.keys(lib.character).filter(name => {
                const character = lib.character[name];
                return (character?.skills || character?.[3] || []).includes(sourceId);
            });
            lib.skill[id] = merged;
            definitions.set(id, immutableDefinition(merged));
        }
    }
    if (!registryInstalled) {
        const makeRegistry = target => new Proxy(target, {
            get(target, key, receiver) { return definitions.has(key) ? definitions.get(key) : Reflect.get(target, key, receiver); },
            set(target, key, value) { return definitions.has(key) || Reflect.set(target, key, value, target); },
            deleteProperty(target, key) { return definitions.has(key) || Reflect.deleteProperty(target, key); },
            defineProperty(target, key, descriptor) {
                if (!definitions.has(key)) return Reflect.defineProperty(target, key, descriptor);
                return descriptor.configurable !== false;
            },
        });
        registry = makeRegistry(lib.skill);
        Object.defineProperty(lib, 'skill', {
            configurable: false, enumerable: true,
            get() { return registry; },
            set(next) {
                if (!next || typeof next !== 'object') return;
                const copy = { ...registry, ...next };
                for (const [id, info] of definitions) copy[id] = info;
                registry = makeRegistry(copy);
            },
        });
        registryInstalled = true;
    }
    const prototype = lib.element.GameEvent?.prototype || lib.element.event;
    wrap(prototype, 'trigger', original => function (...args) {
        let parent = this;
        const seen = new Set();
        while (parent && !seen.has(parent)) {
            seen.add(parent);
            guardSkillEvent(parent);
            parent = parent.getParent?.(1, true);
        }
        return original.apply(this, args);
    });
    for (const method of ['cancel', 'finish', 'untrigger', 'setContent', 'resolve']) wrap(prototype, method, original => function (...args) {
        if (externalInterruption(this)) return method === 'setContent' || method === 'untrigger' ? this : undefined;
        return original.apply(this, args);
    });
    wrap(lib.filter, 'filterTrigger', original => function (event, player, name, skill, ...args) {
        if (!isProtectedSkill(skill)) return original.call(this, event, player, name, skill, ...args);
        const hooks = player._hookTrigger, blocked = event._notrigger;
        try {
            player._hookTrigger = [];
            if (Array.isArray(blocked)) event._notrigger = blocked.filter(target => target !== player);
            return original.call(this, event, player, name, skill, ...args);
        } finally {
            player._hookTrigger = hooks;
            event._notrigger = blocked;
        }
    });
    hooksInstalled = true;
}
