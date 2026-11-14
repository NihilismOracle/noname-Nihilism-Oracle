import { lib, game, get, _status } from '../../../../noname.js';
import { installSkillProtection } from '../../extension/skillProtection.js';

export const ANJING = 'Nihilism_AAAAanjing';
export const ANTianhen = 'zshy_AAAAantianhen';
const ownSkills = new Set(['zshy_AJshenzun', 'zshy_AJshenzun_enter', 'zshy_AJxuwu', 'zshy_AJjinmie', 'zshy_AJhuanhun', 'zshy_AllSkill', 'zshy_AAAAkuiming', 'zshy_ATHmingying']);
const owners = new Set();
const installed = new WeakMap();
const participants = () => [...new Set([...(game.players || []), ...(game.dead || []), ...(game.additionaldead || [])])];
const currentOwners = () => participants().filter(player => owners.has(player));
const validIdentity = value => typeof value === 'string' && value.length > 0 && value !== 'unknown';
export const isAnjing = player => owners.has(player);

// 安璟的专属规则。绝恒技的获得/移除保护仍由 arenaReady 的公共词条层负责。
function lockNumber(player, key) {
    const descriptor = Object.getOwnPropertyDescriptor(player, key);
    if (descriptor?.get?.zshyAnjing) return;
    const getter = function () { return Infinity; };
    getter.zshyAnjing = true;
    // 保留可配置性，避免破坏引擎的对象生命周期；每次事件入口复核被重定义的字段。
    Object.defineProperty(player, key, { configurable: true, enumerable: true, get: getter, set() {} });
}

export function protectAnjing(player) {
    if (!isAnjing(player)) return;
    for (const key of ['hp', 'maxHp', 'hujia']) lockNumber(player, key);
    player.nodying = true;
}

function wrap(object, key, make) {
    const original = object?.[key];
    if (typeof original !== 'function') return;
    let methods = installed.get(object);
    if (!methods) installed.set(object, methods = new Map());
    if (methods.get(key) === original) return;
    const replacement = make(original);
    methods.set(key, replacement);
    object[key] = replacement;
}

// Infinity 与 Infinity 会同级，故在本体生成的待触发列表中稳定前移，不能仅加大数值。
export function prioritizeAnjing(event) {
    if (!event?.doingList) return;
    const first = event.doingList.find(item => item.player === 'firstDo');
    if (!first) return;
    const front = [];
    for (const bucket of event.doingList) {
        bucket.todoList = bucket.todoList.filter(item => {
            if (!isAnjing(item.player) || !ownSkills.has(get.sourceSkillFor?.(item.skill) || item.skill)) return true;
            item.priority = Infinity;
            front.push(item);
            return false;
        });
    }
    front.sort((a, b) => Number(b.skill === 'zshy_AJhuanhun') - Number(a.skill === 'zshy_AJhuanhun'));
    first.todoList.unshift(...front);
}

function installRuntime() {
    const prototype = lib.element.GameEvent?.prototype || lib.element.event;
    wrap(prototype, 'trigger', original => function (...args) {
        for (const player of currentOwners()) protectAnjing(player);
        if (isAnjing(this.player)) {
            for (const key of ['changedHp', 'changedMaxHp', 'loseHp']) if (Number.isNaN(this[key])) this[key] = 0;
            if (this.name === 'changeHp' && Number.isNaN(this.num)) this.num = 0;
        }
        const next = original.apply(this, args);
        prioritizeAnjing(next);
        return next;
    });
    wrap(prototype, 'addTrigger', original => function (...args) {
        const value = original.apply(this, args);
        prioritizeAnjing(this.getParent?.('arrangeTrigger'));
        return value;
    });
    wrap(game, 'checkMod', original => function (...args) {
        const type = args.at(-2), player = args[1];
        if (isAnjing(player) && ['cardEnabled', 'cardEnabled2', 'cardRespondable', 'cardSavable'].includes(type)) return true;
        if (isAnjing(player) && type === 'cardUsable') return Infinity;
        if (isAnjing(player) && type === 'targetInRange') return true;
        if (type === 'canBeDiscarded' && isAnjing(args[2]) && args[1] !== args[2]) return false;
        return original.apply(this, args);
    });
    // 此函数会由本体发送到客机，函数体只引用已注册的全局入口，不闭包捕获 original。
    if (game.over !== runtime.over) {
        runtime.baseOver ??= game.over;
        game.over = runtime.over;
    }
    if (game.checkOnlineResult !== runtime.onlineResult) {
        runtime.baseOnlineResult ??= game.checkOnlineResult;
        game.checkOnlineResult = runtime.onlineResult;
    }
}

export function registerAnjing(player) {
    if (!player || (!owners.has(player) && ![player.name, player.name1, player.name2].includes(ANJING))) return;
    owners.add(player);
    installSkillProtection();
    protectAnjing(player);
    installRuntime();
    wrap(player, 'uninit', original => function (...args) {
        if (isAnjing(this)) return this;
        return original.apply(this, args);
    });
    wrap(player, 'init', original => function (...args) {
        if (isAnjing(this)) args.splice(0, 2, ANJING, ANTianhen);
        const value = original.apply(this, args);
        protectAnjing(this);
        return value;
    });
    wrap(player, 'reinit', original => function (from, to, ...args) {
        if (isAnjing(this) && to !== (from === this.name2 ? ANTianhen : ANJING)) return this;
        const value = original.call(this, from, to, ...args);
        protectAnjing(this);
        return value;
    });
    for (const method of ['reinit2', 'changeCharacter']) wrap(player, method, original => function (pairs, ...args) {
        return original.call(this, isAnjing(this) ? [ANJING, ANTianhen] : pairs, ...args);
    });
    wrap(player, 'die', original => function (...args) {
        const event = original.apply(this, args);
        if (isAnjing(this)) {
            event.reserveOut = true;
            event.noDieAfter = event.noDieAfter2 = true;
            // 即使其他技能取消了触发列表，死亡事件本体仍不能执行普通死亡清理。
            event.setContent(async (event, trigger, player) => {
                // 救援必须有独立父事件：不能在 die 自己的 content 内 cancel 自己后再排子事件。
                const rescue = game.createEvent('zshy_AJhuanhun', false);
                rescue.player = player;
                rescue.forceDie = rescue.includeOut = true;
                rescue.setContent(async () => { await rescueAnjing(event, player); });
                await rescue;
            });
        }
        return event;
    });
    wrap(player, 'out', original => function (...args) {
        if (isAnjing(this) && !this._zshyAnjingRestoring) return this;
        return original.apply(this, args);
    });
}

export async function restoreAnjing(player) {
    registerAnjing(player);
    protectAnjing(player);
    if (player.name1 !== ANJING || player.name2 !== ANTianhen) {
        // reinit2 支持单将变双将，不清空 storage、回合统计或既有牌。
        player.reinit2([ANJING, ANTianhen]);
    }
    for (const [key, value] of [['name', ANJING], ['name1', ANJING], ['name2', ANTianhen]]) {
        Object.defineProperty(player, key, { configurable: true, enumerable: true, get() { return value; }, set() {} });
    }
    const skills = [ANJING, ANTianhen].flatMap(name => lib.character[name]?.skills || lib.character[name]?.[3] || []);
    for (const skill of skills) if (!player.hasSkill(skill, null, null, false)) player.addSkill(skill);
    if (!player.isDisabledJudge()) await player.disableJudge();
    if (player.isTurnedOver()) await player.turnOver(false);
    if (player.isLinked()) await player.link(false);
    if (player.isDead()) player.revive(Infinity, false);
    if (player.isOut() && !player._zshyAnjingRestoring) {
        if (_status._rest_return?.[player.playerid]) await player.restEnd({ hp: Infinity });
        player.in(true);
    }
    protectAnjing(player);
    player.update();
}

export async function insertAnjingPhase(player) {
    await restoreAnjing(player);
    const next = player.phaseUse();
    next._zshyAnjingInserted = true;
    next.forceDie = true;
    next.includeOut = true;
    // 留在当前技能事件内并等待：在被打断的事件及其后续触发技之前完整执行。
    await next;
}

export async function kuimingEffect(player) {
    if (isAnjing(player)) protectAnjing(player);
    else {
        if (player.isDead()) player.revive(1, false);
        player.maxHp = player.hp = 1;
        player.update();
    }
    for (const target of game.filterPlayer(current => current !== player).sortBySeat()) {
        const value = Math.max(0, target.hp - 1);
        if (target.maxHp > value) await target.loseMaxHp(target.maxHp - value);
        else if (target.maxHp < value) await target.gainMaxHp(value - target.maxHp);
        // 不再次手动濒死；本体 loseMaxHp 已负责上限归零后的死亡。
    }
    if (isAnjing(player)) await insertAnjingPhase(player);
    else await player.phaseUse();
}

export async function rescueAnjing(trigger, player) {
    if (trigger._zshyAnjingRescued || player._zshyAnjingRestoring) {
        trigger.cancel();
        return;
    }
    trigger._zshyAnjingRescued = true;
    trigger.reserveOut = true;
    trigger.noDieAfter = trigger.noDieAfter2 = true;
    trigger.cancel();
    player._zshyAnjingRestoring = true;
    try {
        protectAnjing(player);
        // 采用十常侍的原生休整状态，但不经过死亡弃牌/杀人奖惩，也不等待下回合。
        await player.rest({ type: 'phase', count: -1 });
        await player.restEnd({ hp: Infinity });
    } finally {
        delete player._zshyAnjingRestoring;
    }
    await restoreAnjing(player);
    await kuimingEffect(player);
}

function identityCamp(player) {
    const identity = player.identity;
    if (_status.mode === 'purple') {
        if (['rZhu', 'rZhong', 'bNei'].includes(identity)) return 'purple:red';
        if (['bZhu', 'bZhong', 'rNei'].includes(identity)) return 'purple:blue';
        return player;
    }
    if (['zhu', 'zhong', 'mingzhong'].includes(identity)) return 'identity:loyal';
    if (identity === 'fan') return 'identity:rebel';
    return player; // 内奸、野心家、未知身份不因字符串相同自动成为队友。
}

export function sameCamp(player, owner) {
    if (!player || !owner) return false;
    if (player === owner) return true;
    if (player.storage?.zshyAnjingAlly === owner.playerid && owner.playerid != null) return true;
    if (player.storage?.zshyAnjingAlly != null && player.storage.zshyAnjingAlly === owner.storage?.zshyAnjingAlly) return true;
    const mode = get.mode();
    if (mode === 'identity') return identityCamp(player) === identityCamp(owner);
    if (mode === 'guozhan') return player.isFriendOf(owner);
    if (mode === 'doudizhu') return validIdentity(player.identity) && player.identity === owner.identity;
    if (player.side != null && owner.side != null) return player.side === owner.side;
    if (mode === 'single') return false;
    if (typeof player.isFriendOf === 'function' && player.isFriendOf(owner)) return true;
    return validIdentity(player.identity) && player.identity === owner.identity;
}

export function unifiedWith(player) {
    // 临时休整/离场角色仍属存活角色，不能借其暂离场提前宣告统一。
    return (game.players || []).every(target => sameCamp(target, player));
}

export function convertToAnjing(target, player) {
    game.broadcastAll((target, player) => {
        target.group = player.group;
        if (player.identity && player.identity !== 'unknown') target.identity = player.identity;
        if ('trueIdentity' in target) target.trueIdentity = target.identity;
        if (player.side != null) target.side = player.side;
        target.storage.zshyAnjingAlly = player.playerid;
        target.identityShown = true;
        if (target.ai) target.ai.shown = 1;
        target.setIdentity();
    }, target, player);
    syncIdentityLeaders();
}

function syncIdentityLeaders() {
    game.broadcastAll(mode => {
        if (mode !== 'identity' && mode !== 'doudizhu') return;
        const roles = mode === 'identity' ? ['zhu', 'rZhu', 'bZhu'] : ['zhu'];
        for (const role of roles) {
            if (game[role]?.identity === role) continue;
            const candidate = game.players.find(target => target.identity === role);
            // 斗地主本体仍会读取原地主指针；无人再保留地主身份时由统一终局入口判胜。
            if (candidate || mode === 'identity') game[role] = candidate;
        }
        for (const target of [...game.players, ...game.dead]) {
            target.isZhu = roles.some(role => game[role] === target && target.identity === role);
        }
    }, get.mode());
}

export async function enterAnjing(player) {
    await restoreAnjing(player);
    if (player.storage.zshyAnjingEntered) return;
    player.storage.zshyAnjingEntered = true;
    const targets = [...game.players].sortBySeat();
    // 先明置国战武将，防止之后明置把刚分配的身份再次覆盖。
    for (const target of targets) if (target.isUnseen?.()) await target.showCharacter(2);
    game.showIdentity?.();
    const identities = [...new Set(targets.map(target => target.identity).filter(validIdentity))];
    const byIdentity = new Map(targets.map(target => [target.identity, { side: target.side, group: target.group }]));
    if (identities.length > 0) {
        for (const target of targets) {
            const result = await player.chooseControl(identities).set('prompt', '〖神尊〗：分配' + get.translation(target) + '的身份').set('ai', () => player.identity).forResult();
            if (!identities.includes(result.control)) continue;
            const identity = result.control, data = byIdentity.get(identity);
            game.broadcastAll((target, identity, data, mode) => {
                target.identity = identity;
                if ('trueIdentity' in target) target.trueIdentity = identity;
                target.identityShown = true;
                if (target.ai) target.ai.shown = 1;
                if (data.side != null) target.side = data.side;
                if (mode === 'guozhan') target.group = data.group;
                delete target.storage.zshyAnjingAlly;
                target.setIdentity();
            }, target, identity, data, get.mode());
        }
        // 神尊敕封的同身份角色归入同一阵营，包括通常各自为战的内奸/野心家。
        for (const target of targets) if (target.identity === player.identity) convertToAnjing(target, player);
    } else {
        // 无身份牌的队伍模式按开局已有队伍分配，避免 undefined === undefined 直接全场获胜。
        const sides = [...new Set(targets.map(target => target.side).filter(side => side != null))];
        for (const target of targets) {
            if (!sides.length) break;
            const labels = sides.map((side, i) => '阵营' + (i + 1));
            const result = await player.chooseControl(labels).set('prompt', '〖神尊〗：分配' + get.translation(target) + '的阵营').set('ai', () => labels[sides.indexOf(player.side)] || labels[0]).forResult();
            const index = labels.indexOf(result.control);
            if (index >= 0) game.broadcastAll((target, side) => { target.side = side; }, target, sides[index]);
        }
    }
    syncIdentityLeaders();
    if (unifiedWith(player)) {
        const result = await player.chooseBool('〖神尊〗：是否令你及同阵营角色获胜？').forResult();
        if (result.bool) finishAnjingVictory(player);
    }
}

function recordWinners(selectedOwners) {
    const winners = participants().filter(target => selectedOwners.some(owner => sameCamp(target, owner)));
    game.broadcastAll((winners, owner) => {
        _status.zshyAnjingWinners = winners.map(player => player.playerid).filter(id => id != null);
        _status.winner = winners;
        _status.loser = [...game.players, ...game.dead].filter(player => !winners.includes(player));
        game.winner_id = owner.playerid;
    }, winners, selectedOwners[0]);
    return winners;
}

export function finishAnjingVictory(player) {
    if (_status.over) return;
    installRuntime();
    // 多名安璟并存时都受无敌保护；各自阵营均列入胜者，避免彼此互斥导致无法结束。
    const selectedOwners = [...new Set([player, ...currentOwners()])];
    recordWinners(selectedOwners);
    return runtime.baseOver.call(game, runtime.onlineResult(game.me?._trueMe || game.me));
}

const runtime = {
    // 客机可能在本地技能初始化前收到主机的结束函数，先保存本体入口供其使用。
    clientOver: game.over,
    baseOver: null,
    baseOnlineResult: null,
    over: function (result, bool) {
        // 保持本体客机 HTML + bool + poptipData 协议；不把 HTML 当成主机的胜负。
        if (game.online) return (game.zshyAnjingRuntime.baseOver || game.zshyAnjingRuntime.clientOver).apply(game, arguments);
        return game.zshyAnjingRuntime.finish(arguments);
    },
    finish(args) {
        if (_status.over) return;
        const protectedPlayers = currentOwners();
        if (!protectedPlayers.length) return this.baseOver.apply(game, args);
        // 不阻止终局而悬挂对局：任何模式走到终局入口时，安璟及其阵营获胜。
        recordWinners(protectedPlayers);
        return this.baseOver.call(game, this.onlineResult(game.me?._trueMe || game.me));
    },
    onlineResult(player) {
        if (_status.zshyAnjingWinners) return _status.winner?.includes(player) || (player?.playerid != null && _status.zshyAnjingWinners.includes(player.playerid));
        return game.zshyAnjingRuntime.baseOnlineResult?.call(game, player);
    },
};
game.zshyAnjingRuntime = runtime;

export function xuwuCards(event, player) {
    const list = [];
    for (const name of lib.inpile) {
        const type = get.type2(name);
        if (!['basic', 'trick', 'delay', 'zshy_feisheng'].includes(type)) continue;
        for (const nature of name === 'sha' ? [undefined, ...lib.inpile_nature] : [undefined]) {
            if (!event?.filterCard || event.filterCard({ name, nature, isCard: true }, player, event)) list.push({ name, nature });
        }
    }
    return list;
}

export function fromMingying(event) {
    return !!event._zshyMingying || !!event.getParent?.(parent => parent._zshyMingying, true);
}
