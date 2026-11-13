import { lib, get } from '../../../noname.js';

// 唤魂·名字库：统一登记武将“基础名”，供同名「魂」池使用（兼容不写 names 的扩展包）
const PREFIXES = ['经典神', '经典', '会玩', '手杀神', '手杀', '旧界', '旧谋', '长安神', '长安', '渭南神', '渭南', '骏骊神', '骏骊', 'TW神', 'TW', '用间', '承', '牢', '忍', '狂', '忠', 'RE', '新杀', 'SP', 'OL', 'MB', '界', '族', '势', '武', '魔', '仙', '龙', '圣', '皇', '王', '传说', '史诗', '稀有', '普通', '神', '冥', '幻', '墟', '烬', '威', '谋'];
const manual = new Map();   // 武将 id → 手动指定的基础名
// 异名同人：别名表（双向），其他扩展可用 registerAlias 追加
const ALIASES = new Map();
const ALIAS_PAIRS = [['甄姬', '甄宓']];
for (const [a, b] of ALIAS_PAIRS) { ALIASES.set(a, b); ALIASES.set(b, a); }
const aliases = new Map();  // 别名/基础名的其他写法 → 标准基础名
let cache = null;

function validCharacter(id) {
    const character = lib.character[id];
    if (!character || id === 'zshy_WXGYHun') return false;
    if (lib.config.banned && lib.config.banned.includes(id)) return false;
    if (character.isMinskin || character.isBoss || character.isHiddenBoss || character.isUnseen) return false;
    return true;
}

export function displayBase(id) {
    const data = lib.character[id] || {};
    let name = data.names ? String(data.names).replace(/[|｜]/g, '') : (lib.translate[id] || get.translation(id) || '');
    name = String(name).replace(/<[^>]*>/g, '');
    name = name.replace(/^[^\u4e00-\u9fa5A-Za-z]+/, '');
    for (const prefix of PREFIXES) {
        if (name.length > prefix.length && name.startsWith(prefix)) {
            name = name.slice(prefix.length);
            break;
        }
    }
    return name;
}

function pinyinKey(str) {
    try {
        const result = get.pinyin(str, false);
        return Array.isArray(result) ? result.join('').toLowerCase() : String(result).toLowerCase();
    } catch (e) {
        return '';
    }
}

function idPinyin(id) {
    const parts = String(id).split('_');
    let tail = parts[parts.length - 1] || String(id);
    tail = tail.replace(/^[A-Z]+/, '');
    return tail.toLowerCase();
}

function normalizeVariants(raw) {
    const out = new Set();
    if (!raw) return out;
    let name = String(raw).replace(/<[^>]*>/g, '').replace(/[|｜]/g, '').replace(/^[^\u4e00-\u9fa5A-Za-z]+/, '');
    if (!name) return out;
    out.add(name);
    let changed = true;
    while (changed) {
        changed = false;
        for (const prefix of PREFIXES) {
            if (name.length > prefix.length && name.startsWith(prefix)) {
                name = name.slice(prefix.length);
                out.add(name);
                changed = true;
                break;
            }
        }
    }
    return out;
}

// 同名池用：同时看 names 与 translate，循环剥前缀，返回候选基础名集合
export function baseVariants(id) {
    const data = lib.character[id] || {};
    const out = new Set();
    for (const raw of [data.names, lib.translate[id], lib.translate[id + '_ab']]) {
        for (const v of normalizeVariants(raw)) out.add(v);
    }
    for (const v of [...out]) {
        const alias = ALIASES.get(v);
        if (alias) out.add(alias);
    }
    if (cache && cache.baseSet) {
        for (const v of [...out]) {
            const resolved = suffixResolve(v, cache.baseSet);
            if (resolved !== v) out.add(resolved);
        }
    }
    return out;
}

function suffixResolve(name, baseSet) {
    let n = name;
    let guard = 0;
    while (guard++ < 5) {
        let best = null;
        for (const b of baseSet) {
            if (b === n || b.length < 2 || b.length >= n.length) continue;
            if (!n.endsWith(b)) continue;
            const prefix = n.slice(0, n.length - b.length);
            if (baseSet.has(prefix)) continue; // 前缀本身是另一个武将名：不拆
            let blocked = false;
            for (const x of baseSet) {
                if (x.length >= 2 && prefix.includes(x)) { blocked = true; break; }
            }
            if (blocked) continue; // 前缀里含其他武将名（如“烈袁绍”）：不拆
            if (!best || b.length > best.length) best = b;
        }
        if (!best) break;
        n = best;
    }
    return n;
}

function build() {
    const byId = new Map();
    const names = new Set();
    const pinyins = new Map();
    const allIds = new Set(Object.keys(lib.character));
    if (lib.characterPack) {
        for (const pack of Object.values(lib.characterPack)) {
            for (const id of Object.keys(pack)) allIds.add(id);
        }
    }
    for (const id of allIds) {
        if (!validCharacter(id)) continue;
        const base = manual.get(id) || displayBase(id);
        if (!base) continue;
        byId.set(id, base);
        names.add(base);
        const key = pinyinKey(base);
        if (key) pinyins.set(key, base);
    }
    // 后缀回退：经典曹操→曹操、手杀神华佗→华佗
    const firstBaseSet = new Set(byId.values());
    for (const [id, base] of byId) byId.set(id, suffixResolve(base, firstBaseSet));
    const finalBaseSet = new Set(byId.values());
    for (const id of [...byId.keys()]) {
        const resolved = suffixResolve(byId.get(id), finalBaseSet);
        if (resolved !== byId.get(id)) byId.set(id, resolved);
    }

    // 没有 names 且显示名对不上的：用别名 / 显示名拼音 / id 末段拼音兜底
    for (const [id, base] of byId) {
        if (manual.has(id) || (lib.character[id] && lib.character[id].names)) continue;
        let resolved = aliases.get(base);
        if (!resolved && names.has(base)) resolved = base;
        if (!resolved) {
            for (const key of [pinyinKey(base), idPinyin(id)]) {
                if (key && pinyins.has(key)) { resolved = pinyins.get(key); break; }
            }
        }
        if (resolved) byId.set(id, resolved);
    }
    cache = { byId, names, pinyins, baseSet: new Set(byId.values()) };
    return cache;
}

// 手动登记/修正某个武将的基础名（供其他扩展包做兼容）
export function registerBaseName(id, base, aliasList) {
    manual.set(id, base);
    aliases.set(base, base);
    if (Array.isArray(aliasList)) {
        for (const alias of aliasList) if (alias) aliases.set(alias, base);
    }
    cache = null;
}

export function registerAlias(a, b) {
    if (!a || !b || a === b) return;
    ALIASES.set(a, b);
    ALIASES.set(b, a);
    cache = null;
}

export function refreshNameLibrary() {
    cache = null;
    return build();
}

export function getBaseName(id) {
    const index = cache || build();
    return index.byId.get(id) || manual.get(id) || displayBase(id) || '';
}

// 暴露给其他扩展包使用
export const nameLibrary = { getBaseName, displayBase, baseVariants, registerAlias, registerBaseName, refreshNameLibrary };
if (typeof lib !== 'undefined') lib.zshyNameLibrary = nameLibrary;
