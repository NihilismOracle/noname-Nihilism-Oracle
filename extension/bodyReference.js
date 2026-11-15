import { lib, game, get } from '../../../noname.js';

// 诸神寰宇 · 本体素材引用（墟系列武将）
//
// 规则：
// 1. 只处理名字以「墟」开头的扩展武将，其他武将一律不碰；
// 2. 扩展内没有对应立绘/阵亡语音时，按「扩展包 / 武将id后缀 → 对应本体包 + 同名武将」引用本体素材；
// 3. 同名武将有多个本体时，先取对应本体包的，再按 id 检测，最后按官方包顺序；
// 4. 同源技能按技能名匹配本体技能，扩展缺语音文件时补引本体技能语音（只补缺，不覆盖已有）。
//
// 说明：本模块在 extension/content.js 的 content() 开头执行，此时所有武将包、技能与翻译均已注册。

const EXT_NAME = '诸神寰宇';
const EXT_PACKS = new Set([
    'zshy_AA', 'zshy_AB', 'zshy_AC', 'zshy_AD', 'zshy_AE', 'zshy_AF',
    'zshy_AG', 'zshy_AH', 'zshy_CCXH', 'zshy_XDZS', 'zshy_YDB', 'Nihilism',
]);

// 名字对不上、但确实是同一武将的别名（墟名 → 本体名）
const NAME_ALIAS = new Map([
    ['墟甄姬', '甄宓'],
    ['墟蔡文姬', '蔡琰'],
    ['墟伏皇后', '伏寿'],
    ['墟卧龙诸葛', '卧龙'],
    ['墟剻良剻越', '蒯良蒯越'],
]);

// 扩展包 → 对应本体包（移动版用本体移动版、璀璨星河用 sp、兵势篇用 bingshi/sp）
const PACK_PREF = new Map([
    ['zshy_YDB', ['mobile']],
    ['zshy_CCXH', ['sp']],
    ['zshy_AH', ['bingshi', 'sp']],
]);

// 武将 id 后缀 → 对应本体包
const SUFFIX_PREF = new Map([
    ['CCXH', ['shiji']],
    ['OL', ['sp']],
    ['JIN', ['sp']],
    ['MB', ['mobile']],
    ['BSP', ['bingshi', 'sp']],
    ['SP', ['sp2']],
    ['SHZL', ['shenhua']],
    ['YJCM', ['yijiang']],
    ['BZ', ['standard']],
    ['WDWB', ['yingbian']],
    ['SJP', ['shiji']],
    ['YCXS', ['clan']],
    ['YCZS', ['clan']],
    ['CLWS', ['clan']],
    ['JMGX', ['xianding']],
    ['SBFM', ['sb']],
    ['WMXL', []],
    ['CCZS', []],
]);
const SUFFIX_ORDER = [...SUFFIX_PREF.keys()].sort((a, b) => b.length - a.length);

// id 同名裁决时尝试的本体 id 前缀
const BASE_PREFIXES = ['pot_', 'mb_', 'sp_', 'ol_', 'jin_', 'sb_', 're_', 'old_', 'jsp_', 'jsrg_', 'huan_', 'dc_', 'tw_', 'clan_', 'yj_', 'yl_'];

// 官方武将包顺序：同名多本体时兜底
const PACK_ORDER = [
    'standard', 'shenhua', 'extra', 'yijiang', 'refresh', 'sp', 'sp2', 'newjiang', 'onlyOL', 'yingbian',
    'clan', 'huicui', 'xianding', 'mobile', 'shiji', 'sb', 'bingshi', 'tw', 'collab', 'old', 'offline',
    'jsrg', 'sxrm', 'sixiang', 'diy', 'key',
];

function translate(id) {
    const value = lib.translate ? lib.translate[id] : undefined;
    return typeof value === 'string' ? value : '';
}

function rawSkills(id, data) {
    if (Array.isArray(data)) return Array.isArray(data[3]) ? data[3] : [];
    return Array.isArray(data?.skills) ? data.skills : [];
}

function splitExtId(id) {
    let token = id.replace(/^zshy_(?:AAAA|AAYA|AAZZ)/, '');
    let suffix = '';
    for (const item of SUFFIX_ORDER) {
        if (token.endsWith(item) && token.length > item.length) {
            suffix = item;
            token = token.slice(0, -item.length);
            break;
        }
    }
    return { token, suffix };
}

function preferredPacks(character) {
    const result = [];
    const { suffix } = splitExtId(character.id);
    if (SUFFIX_PREF.has(suffix)) result.push(...SUFFIX_PREF.get(suffix));
    if (PACK_PREF.has(character.pack)) result.push(...PACK_PREF.get(character.pack));
    return [...new Set(result)];
}

function packRank(pack) {
    const index = PACK_ORDER.indexOf(pack);
    return index < 0 ? 999 : index;
}

function buildBaseIndex() {
    const byId = new Map();
    for (const [pack, packCharacters] of Object.entries(lib.characterPack || {})) {
        if (EXT_PACKS.has(pack) || !packCharacters || typeof packCharacters !== 'object') continue;
        for (const [id, data] of Object.entries(packCharacters)) {
            const name = translate(id);
            if (!name || name.includes('<')) continue;
            const info = { id, pack, name, skills: rawSkills(id, data) };
            const previous = byId.get(id);
            if (!previous || packRank(pack) < packRank(previous.pack)) byId.set(id, info);
        }
    }
    const nameIndex = new Map();
    for (const info of byId.values()) {
        if (!nameIndex.has(info.name)) nameIndex.set(info.name, []);
        nameIndex.get(info.name).push(info);
    }
    return { nameIndex, characters: byId };
}

function getExtensionCharacters() {
    const packOf = new Map();
    const packs = lib.characterPack || {};
    for (const pack of EXT_PACKS) {
        const packCharacters = packs[pack];
        if (!packCharacters) continue;
        for (const id of Object.keys(packCharacters)) {
            if (!packOf.has(id)) packOf.set(id, pack);
        }
    }
    const result = [];
    for (const [id, data] of Object.entries(lib.character || {})) {
        const name = translate(id);
        if (!name.startsWith('墟') || !packOf.has(id)) continue;
        result.push({ id, name, pack: packOf.get(id), data, skills: rawSkills(id, data) });
    }
    return result;
}

function resolveBase(character, index) {
    const baseName = NAME_ALIAS.get(character.name) || character.name.slice(1);
    const exact = index.nameIndex.get(baseName) || [];
    const loose = [];
    for (const [name, list] of index.nameIndex) {
        if (name === baseName || !name.endsWith(baseName)) continue;
        for (const item of list) loose.push(item);
    }
    const preferred = preferredPacks(character);
    const pickPreferred = (list) => {
        for (const pack of preferred) {
            const hit = list.find((item) => item.pack === pack);
            if (hit) return hit;
        }
        return null;
    };
    const byPack = pickPreferred([...exact, ...loose]);
    if (byPack) return byPack;
    if (exact.length === 1) return exact[0];
    if (exact.length > 1) {
        const { token } = splitExtId(character.id);
        for (const prefix of ['', ...BASE_PREFIXES]) {
            const hit = exact.find((item) => item.id === prefix + token);
            if (hit) return hit;
        }
        exact.sort((a, b) => packRank(a.pack) - packRank(b.pack));
        return exact[0];
    }
    if (!loose.length) return null;
    loose.sort((a, b) => packRank(a.pack) - packRank(b.pack));
    return loose[0];
}

function normalizeExtensionPath(value) {
    if (typeof value !== 'string' || !value) return null;
    let path = value;
    if (path.startsWith('ext:')) path = `extension/${path.slice(4)}`;
    const prefix = `extension/${EXT_NAME}/`;
    if (!path.startsWith(prefix)) return null;
    return path.slice(prefix.length);
}

async function readExtensionFiles() {
    if (typeof game.getFileList !== 'function') return null;
    const list = (dir) => {
        if (game.promises && typeof game.promises.getFileList === 'function') return game.promises.getFileList(dir);
        return new Promise((resolve, reject) => {
            try {
                game.getFileList(dir, (folders, files) => resolve([folders, files]), reject);
            } catch (error) {
                reject(error);
            }
        });
    };
    try {
        const art = new Set();
        const artNames = new Set();
        const audio = new Set();
        const audioNames = new Set();
        const [folders, rootFiles] = await list(`extension/${EXT_NAME}/image/character`);
        for (const file of rootFiles || []) {
            art.add(`image/character/${file}`);
            artNames.add(file.toLowerCase());
        }
        for (const folder of folders || []) {
            const [subFolders, files] = await list(`extension/${EXT_NAME}/image/character/${folder}`);
            for (const file of files || []) {
                art.add(`image/character/${folder}/${file}`);
                artNames.add(file.toLowerCase());
            }
            for (const sub of subFolders || []) {
                const [, subFiles] = await list(`extension/${EXT_NAME}/image/character/${folder}/${sub}`);
                for (const file of subFiles || []) {
                    art.add(`image/character/${folder}/${sub}/${file}`);
                    artNames.add(file.toLowerCase());
                }
            }
        }
        const [, audioFiles] = await list(`extension/${EXT_NAME}/audio/character`);
        for (const file of audioFiles || []) {
            audio.add(`audio/character/${file}`);
            audioNames.add(file.toLowerCase());
        }
        // 读不到任何文件时视为「没有文件系统权限」，退回按武将数据声明判断，避免把全部武将误判成缺素材。
        if (!art.size || !audio.size) return null;
        return { art, artNames, audio, audioNames };
    } catch (error) {
        console.warn(`[${EXT_NAME}] 读取扩展素材目录失败，改用武将数据声明判断：`, error);
        return null;
    }
}

function hasExtensionArt(character, files) {
    const data = character.data;
    const candidates = [];
    if (typeof data.img === 'string') candidates.push(data.img);
    if (Array.isArray(data.trashBin)) {
        for (const item of data.trashBin) {
            if (typeof item !== 'string') continue;
            if (item.startsWith('img:')) candidates.push(item.slice(4));
            else if (item.startsWith('ext:')) candidates.push(item);
        }
    }
    let declared = false;
    for (const value of candidates) {
        const relative = normalizeExtensionPath(value);
        if (!relative) continue;
        declared = true;
        if (!relative.startsWith('image/character/')) return true;
        if (!files) return true;
        if (files.art.has(relative)) return true;
    }
    if (declared || !files) return false;
    return files.artNames.has(`${character.id}.jpg`) || files.artNames.has(`${character.id}.png`);
}

function hasExtensionDie(character, files) {
    const list = Array.isArray(character.data.dieAudios) ? character.data.dieAudios : [];
    let declared = false;
    for (const value of list) {
        const relative = normalizeExtensionPath(value);
        if (!relative) continue;
        declared = true;
        if (!files) return true;
        if (files.audio.has(relative)) return true;
    }
    if (declared || !files) return false;
    return files.audioNames.has(`${character.id}.mp3`);
}

function hasExtensionSkillAudio(skill, files) {
    if (!files) return false;
    const lower = skill.toLowerCase();
    for (const file of files.audioNames) {
        if (!file.startsWith(lower)) continue;
        if (/^(_[a-z0-9_]+)?\d*\.mp3$/.test(file.slice(lower.length))) return true;
    }
    return false;
}

function skillOwnAudio(skill, files, seen = new Set()) {
    if (seen.has(skill)) return true;
    seen.add(skill);
    const info = (lib.skill || {})[skill] || get.info(skill);
    if (!info) return true;
    const audio = info.audio;
    if (audio === false || audio === null) return true;
    if (Array.isArray(audio)) return true;
    if (typeof audio === 'number' || audio === true) return hasExtensionSkillAudio(skill, files);
    if (typeof audio === 'string') {
        if (audio.endsWith('.mp3')) return true;
        if (audio.includes('/') || audio.includes(':')) {
            if (!files) return true;
            return hasExtensionSkillAudio(skill, files);
        }
        // 本扩展技能之间的互相引用才继续解析；其余（本体技能 id）视为已引用本体语音。
        if (audio.startsWith('zshy_')) return skillOwnAudio(audio, files, seen);
        return true;
    }
    return files ? hasExtensionSkillAudio(skill, files) : false;
}

function setBaseArt(character, base) {
    const data = (lib.character || {})[base.id] || (lib.characterPack || {})[base.pack]?.[base.id];
    let img = data?.img;
    if (typeof img === 'string' && img.startsWith('ext:')) img = img.replace(/^ext:/, 'extension/');
    if (typeof img !== 'string' || !img) img = `../../../../image/character/${base.id}.jpg`;
    character.data.img = img;
}

function setBaseDie(character, base) {
    character.data.dieAudios = [base.id];
}

function getBaseSkillNames(base) {
    const map = new Map();
    for (const skill of base.skills) {
        const name = translate(skill);
        if (name && !map.has(name)) map.set(name, skill);
    }
    return map;
}

export async function applyBodyReference() {
    if (lib.config?.mode === 'connect') return;
    if (!lib.characterPack || !lib.character) return;
    const index = buildBaseIndex();
    const characters = getExtensionCharacters();
    if (!characters.length) return;
    const files = await readExtensionFiles();
    const stats = { characters: 0, art: 0, die: 0, skills: 0, unresolved: 0 };
    const skillNames = new Map();
    const proposals = new Map();

    for (const character of characters) {
        const base = resolveBase(character, index);
        if (!base) {
            stats.unresolved++;
            continue;
        }
        stats.characters++;
        if (!hasExtensionArt(character, files)) {
            setBaseArt(character, base);
            stats.art++;
        }
        if (!hasExtensionDie(character, files)) {
            setBaseDie(character, base);
            stats.die++;
        }
        let names = skillNames.get(base.id);
        if (!names) {
            names = getBaseSkillNames(base);
            skillNames.set(base.id, names);
        }
        for (const skill of character.skills) {
            if (!(lib.skill || {})[skill] || skillOwnAudio(skill, files)) continue;
            const name = translate(skill);
            if (!name) continue;
            const baseSkill = names.get(name);
            if (!baseSkill) continue;
            const previous = proposals.get(skill);
            if (previous && previous.skill !== baseSkill) {
                proposals.set(skill, { conflict: true });
                continue;
            }
            if (!previous) proposals.set(skill, { skill: baseSkill, character: character.name });
        }
    }

    for (const [skill, proposal] of proposals) {
        if (proposal.conflict) {
            console.warn(`[${EXT_NAME}] 同源技能「${skill}」对应到多个本体技能，已跳过自动引用。`);
            continue;
        }
        lib.skill[skill].audio = proposal.skill;
        stats.skills++;
    }

    if (stats.characters || stats.skills) {
        console.log(`[${EXT_NAME}] 本体素材引用：${stats.characters} 名墟将；立绘 ${stats.art}、阵亡语音 ${stats.die}、同源技能语音 ${stats.skills}${stats.unresolved ? `；未找到本体 ${stats.unresolved}` : ''}`);
    }
}
