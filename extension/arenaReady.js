import { lib, game, get } from '../../../noname.js';

/**
 * 绝恒技（NihilismSkill）免疫系统。
 *
 * 规则：
 * 1. 获得：只有该技能的「专属武将」能通过正常途径获得，其他角色拿不到；
 * 2. 移除：任何角色、任何途径都移除不掉（removeSkill / tempBanSkill / disableSkill / awakenSkill / changeSkills / skillBlocker）。
 *
 * 实现方式：给 lib.element.player 上的相关方法套一层 Proxy，调用前先把受保护的技能过滤掉。
 */

/** 取技能列表第 index 个参数（引擎里既可能是字符串也可能是数组）。 */
function getSkillArgs(args, index) {
    const value = args[index];
    if (Array.isArray(value)) return [...value];
    if (typeof value === 'string') return [value];
    return [];
}

export async function arenaReady() {
    /** 设置：提前创建 viewAsToUse 函数内部传参技能的翻译 */
    function createViewAsToUseTranslation() {
        const skillNames = Object.keys(lib.skill).filter((skill) => {
            const name = lib.translate[skill];
            const info = lib.translate[`${skill}_info`];
            return typeof name === 'string' && typeof info === 'string';
        });
        for (const skill of skillNames) {
            const newName = `${skill}viewAsToUse`;
            const newInfo = `${newName}_info`;
            if (!lib.translate[newName]) lib.translate[newName] = lib.translate[skill];
            if (!lib.translate[newInfo]) lib.translate[newInfo] = lib.translate[skill + '_info'];
        }
    }

    /** 设置：为本体新增 DIY 功能性技能标签（目前只用到 NihilismSkill 绝恒技） */
    function addSkilltag(skilltag, { addSkill = true, removeSkill = true, tempBanSkill = true, disableSkill = true, awakenSkill = true, skillBlocker = true } = {}) {
        const newfuncName = `${skilltag}getTagSkills`;

        /** 扫描 lib.skill：收集带该标签的技能，并记录每个技能的专属武将名单。 */
        function updateTagSkills() {
            const result = [];
            const sourceSkilllist = [];
            const taggedSkills = Object.keys(lib.skill).filter((skill) => {
                const info = get.info(skill);
                const skilltype = info?.[skilltag];
                if (!info || !skilltype) return false;
                return (typeof skilltype === 'boolean' && skilltype === true) || typeof skilltype === 'function';
            });
            for (const skill of taggedSkills) {
                const charlotteKey = `${skilltag}_charlotte`;
                if (!lib.skill[skill][charlotteKey]) lib.skill[skill][charlotteKey] = [];
                const charlotteList = lib.skill[skill][charlotteKey];
                const sourceSkill = get.sourceSkillFor(skill);
                for (const name of Object.keys(lib.character)) {
                    const info = lib.character[name] || get.character(name);
                    if (info && Array.isArray(info.skills) && info.skills.includes(sourceSkill) && !charlotteList.includes(name)) {
                        charlotteList.push(name);
                    }
                }
                if (!sourceSkilllist.includes(sourceSkill)) {
                    sourceSkilllist.push(sourceSkill);
                    result.push(get.info(sourceSkill));
                }
            }
            return result;
        }

        /**
         * 核心判定：返回这批技能里需要拦截（过滤掉）的那些。
         * @param {string|string[]} skills 技能名或技能名数组
         * @param {Player} player 调用者
         * @param {boolean} isAdd true=获得技能时判定（专属武将可保留自己的绝恒技），false=移除/封印等一律拦截
         * @param {{ all?: boolean }} [options] all=true 时返回所有带标签技能，不再按专属过滤
         */
        function filterTagSkillNames(skills, player, isAdd, options) {
            if (get.itemtype(player) !== 'player') return [];
            const skillList = [];
            for (const item of Array.isArray(skills) ? skills : [skills]) {
                if (typeof item === 'string') skillList.push(item);
                else if (Array.isArray(item) && item.every((name) => typeof name === 'string')) skillList.push(...item);
            }
            // 适配多将（owner 用来判断「技能是不是这个武将的专属技能」）
            const names = [];
            for (let i = 0; i < 6; i++) {
                const name = i === 0 ? player.name : player[`name${i}`];
                if (name && typeof name === 'string' && !names.includes(name)) names.push(name);
            }
            return skillList.filter((skill) => {
                const info = get.info(skill);
                const skilltype = info?.[skilltag];
                if (!info || !skilltype) return false;
                const hasTag = (typeof skilltype === 'boolean' && skilltype) || (typeof skilltype === 'function' && skilltype(skill, player));
                if (!hasTag) return false;
                if (options?.all) return true;
                if (!isAdd) return true;
                // 获得：专属武将可以拿到自己的绝恒技，其他人一律拿不到
                let charlotteList = info?.[`${skilltag}_charlotte`];
                if (!Array.isArray(charlotteList)) {
                    charlotteList = [];
                    const sourceSkill = get.sourceSkillFor(skill);
                    for (const name in lib.character) {
                        const charInfo = lib.character[name] || get.character(name);
                        if (charInfo && Array.isArray(charInfo.skills) && charInfo.skills.includes(sourceSkill)) charlotteList.push(name);
                    }
                }
                return !names.some((name) => charlotteList.includes(name));
            });
        }

        // 对外暴露成 game.<标签>getTagSkills(...)，其它扩展/技能可以直接查
        game[newfuncName] = (skills, player, isAdd = false, options) => filterTagSkillNames(skills, player, isAdd, options);

        /** 过滤参数里的技能列表，返回是否被过滤以及剩余技能。 */
        function filterArg(args, index, player, isAdd) {
            const first = args[index];
            const skills = getSkillArgs(args, index);
            // filterTagSkillNames 返回的是「需要拦截的技能」，可用技能要取差集
            const blocked = filterTagSkillNames(skills, player, isAdd);
            if (!blocked.length) return { changed: false, remain: skills, first };
            const remain = skills.filter((skill) => !blocked.includes(skill));
            args[index] = typeof first === 'string' ? remain[0] : remain;
            return { changed: true, remain, first };
        }

        /**
         * 统一包装玩家方法：调用前过滤技能参数。
         * @param {string} methodName 方法名
         * @param {number} skillIndex 技能参数所在下标
         * @param {boolean} isAdd 是否按「获得技能」规则过滤
         * @param {'player'|'event'|'firstOrArray'|'firstIfString'} emptyMode 过滤后为空时的处理方式
         */
        function guardMethod(methodName, skillIndex, isAdd, emptyMode = 'player') {
            const backupKey = `${skilltag}_${methodName}`;
            if (!lib[backupKey]) lib[backupKey] = lib.element.player[methodName];
            lib.element.player[methodName] = new Proxy(lib[backupKey], {
                apply(target, thisArg, args) {
                    const { changed, remain, first } = filterArg(args, skillIndex, thisArg, isAdd);
                    if (changed && !remain.length) {
                        if (emptyMode === 'event') {
                            // 返回真正的无操作事件，保留 await / .set() 契约。
                            return thisArg.changeSkills([], []).set('popup', false).set('log', false);
                        }
                        if (emptyMode === 'player') return thisArg;
                        if (emptyMode === 'firstOrArray') return typeof first === 'string' ? first : [];
                        if (emptyMode === 'firstIfString' && typeof first === 'string') return first;
                        // 'firstIfString' 且参数是数组时继续调用（数组已被清空）
                    }
                    return Reflect.apply(target, thisArg, args);
                },
            });
        }

        /** 兜底：把角色身上从任何入口带进来的受保护绝恒技统一清出去。 */
        function cleanPlayer(player) {
            if (!player || !Array.isArray(player.skills)) return;
            const owned = new Set(player.skills);
            for (const list of [player.hiddenSkills, player.invisibleSkills]) {
                if (Array.isArray(list)) for (const skill of list) owned.add(skill);
            }
            for (const skill of Object.keys(player.tempSkills || {})) owned.add(skill);
            for (const value of Object.values(player.additionalSkills || {})) {
                if (Array.isArray(value)) for (const skill of value) owned.add(skill);
                else if (value) owned.add(value);
            }
            // 用「获得」规则判定：专属武将自己的绝恒技合法保留，其他角色身上的一律清掉
            const tagged = filterTagSkillNames([...owned], player, true);
            if (!tagged.length) return;
            for (const skill of tagged) {
                player.skills.remove(skill);
                player.hiddenSkills?.remove(skill);
                player.invisibleSkills?.remove(skill);
                if (player.tempSkills) delete player.tempSkills[skill];
                if (player.additionalSkills) {
                    for (const key in player.additionalSkills) {
                        const value = player.additionalSkills[key];
                        if (Array.isArray(value)) value.remove(skill);
                        else if (value === skill) delete player.additionalSkills[key];
                    }
                }
            }
        }

        const cleanAllPlayers = () => {
            for (const player of game.players.concat(game.dead)) cleanPlayer(player);
        };

        // 登记标签，并在开局时把已经在场上的角色统一扫一遍
        if (!lib.skill[newfuncName]) lib.skill[newfuncName] = {};
        const tagHolder = lib.skill[newfuncName];
        tagHolder.tags = tagHolder.tags || [];
        if (!tagHolder.tags.includes(skilltag)) tagHolder.tags.push(skilltag);
        game.broadcastAll(cleanAllPlayers);

        // —— 获得技能相关 ——
        if (addSkill) {
            // addSkill：专属武将放行自己的绝恒技，其他人拿不到；过滤后为空则直接结束
            guardMethod('addSkill', 0, true, 'player');
            // addTempSkill：旧版签名 (skill, expire, checkConflict)，过滤后为空时按原参数类型返回
            guardMethod('addTempSkill', 0, true, 'firstOrArray');
            // addTempSkills：过滤后为空也必须返回 GameEvent。
            guardMethod('addTempSkills', 0, true, 'event');
            // addAdditionalSkill：技能在第二个参数，过滤后为空直接结束
            guardMethod('addAdditionalSkill', 1, true, 'player');
        }

        // —— 移除/封印/禁用/觉醒相关 ——
        if (removeSkill) {
            // removeSkill：字符串被保护时直接返回技能名；数组则过滤掉受保护技能后继续
            guardMethod('removeSkill', 0, false, 'firstIfString');
            // $removeAdditionalSkills：整体清空时把受保护技能留在清单里，只移除其余部分
            const $removeAdditionalSkillsKey = `${skilltag}_$removeAdditionalSkills`;
            if (!lib[$removeAdditionalSkillsKey]) lib[$removeAdditionalSkillsKey] = lib.element.player.$removeAdditionalSkills;
            lib.element.player.$removeAdditionalSkills = new Proxy(lib[$removeAdditionalSkillsKey], {
                apply(target, thisArg, args) {
                    const [skill, targetSkill] = args;
                    const channelProtected = filterTagSkillNames([targetSkill], thisArg, false);
                    if (channelProtected.length) return undefined;
                    const additionalSkills = thisArg?.additionalSkills?.[skill];
                    if (!targetSkill && Array.isArray(additionalSkills) && additionalSkills.length) {
                        const keep = filterTagSkillNames(additionalSkills, thisArg, false);
                        if (keep.length) {
                            const remain = additionalSkills.filter((name) => keep.includes(name));
                            game.broadcastAll((player, key, list) => {
                                if (!player.additionalSkills[key]) player.additionalSkills[key] = [];
                                player.additionalSkills[key].length = 0;
                                player.additionalSkills[key].push(...list);
                            }, thisArg, skill, remain);
                            cleanPlayer(thisArg);
                            return undefined;
                        }
                    }
                    return Reflect.apply(target, thisArg, args);
                },
            });
        }
        if (tempBanSkill) guardMethod('tempBanSkill', 0, false, 'firstOrArray');
        if (disableSkill) guardMethod('disableSkill', 1, false, 'player');
        if (awakenSkill) guardMethod('awakenSkill', 0, false, 'player');

        // —— changeSkills：addSkills / removeSkills / addTempSkills / addAdditionalSkills 等封装方法最终都会走到这里 ——
        if (addSkill || removeSkill) {
            const changeSkillsKey = `${skilltag}_changeSkills`;
            if (!lib[changeSkillsKey]) lib[changeSkillsKey] = lib.element.player.changeSkills;
            lib.element.player.changeSkills = new Proxy(lib[changeSkillsKey], {
                apply(target, thisArg, args) {
                    if (!Array.isArray(args[0])) args[0] = [];
                    if (!Array.isArray(args[1])) args[1] = [];
                    // 获得：专属限制依然生效（非专属武将同样拿不到）
                    if (addSkill) {
                        const addTags = filterTagSkillNames(args[0], thisArg, true);
                        if (addTags.length) args[0] = args[0].filter((skill) => !addTags.includes(skill));
                    }
                    // 移除：受保护技能不允许被移除
                    if (removeSkill) {
                        const removeTags = filterTagSkillNames(args[1], thisArg, false);
                        if (removeTags.length) args[1] = args[1].filter((skill) => !removeTags.includes(skill));
                    }
                    if (!args[0].length && !args[1].length) {
                        // 过滤后无事可做，但绝不能伪造返回值：
                        // addAdditionalSkills 等会继续在返回值上 .set('$handle', fn)，所以仍然创建真实事件再把清单清空。
                        const next = Reflect.apply(target, thisArg, args);
                        if (next && typeof next.set === 'function') {
                            next.addSkill = [];
                            next.removeSkill = [];
                            next.popup = false;
                            next.log = false;
                        }
                        return next;
                    }
                    return Reflect.apply(target, thisArg, args);
                },
            });
        }

        // —— skillBlocker：受保护技能不会被 skillBlocker 判定为失效 ——
        if (skillBlocker) {
            /** 给一个技能（或子技能）的 skillBlocker 套上「绝恒技免疫」逻辑。 */
            const guardSkillBlocker = (holder, name) => {
                const originalBlocker = holder.skillBlocker;
                if (!originalBlocker || typeof originalBlocker !== 'function') return;
                const backupKey = `${skilltag}_${name}`;
                if (!lib[backupKey]) lib[backupKey] = originalBlocker;
                holder.skillBlocker = new Proxy(lib[backupKey], {
                    apply(target, thisArg, args) {
                        let result = Reflect.apply(target, thisArg, args);
                        let player, skill;
                        for (const arg of args) {
                            if (get.itemtype(arg) === 'player') player = arg;
                            else if (typeof arg === 'string') skill = arg;
                        }
                        if (get.itemtype(player) === 'player' && typeof skill === 'string') {
                            const protectedSkills = filterTagSkillNames([skill], player, false, { all: true });
                            if (protectedSkills.length && result === true) result = false;
                        }
                        return result;
                    },
                });
                const intro = holder.intro;
                if (intro && typeof intro.content === 'function') {
                    const originalContent = intro.content;
                    intro.content = function (...args) {
                        const player = args.find((arg) => get.itemtype(arg) === 'player');
                        if (!player) return originalContent.apply(this, args);
                        const disabled = player.getSkills(null, false, false).filter((skill) => holder.skillBlocker(skill, player));
                        return disabled.length ? `已失效技能：${get.translation(disabled)}` : '无失效技能';
                    };
                }
            };
            for (const skillName of Object.keys(lib.skill)) {
                const info = get.info(skillName);
                if (!info) continue;
                guardSkillBlocker(info, skillName);
                const subSkill = info.subSkill;
                if (subSkill && typeof subSkill === 'object') {
                    for (const key of Object.keys(subSkill)) guardSkillBlocker(subSkill[key], `${skillName}_${key}`);
                }
            }
        }

        return updateTagSkills();
    }

    game.broadcastAll((runSettings1, runSettings2) => {
        runSettings1();
        runSettings2();
    }, createViewAsToUseTranslation, () => addSkilltag('NihilismSkill'));
}
