import { lib, game, ui, get, ai, _status } from '../../../../noname.js'
import { registerAnjing, isAnjing, restoreAnjing, enterAnjing, rescueAnjing, insertAnjingPhase, restoreKuimingOwner, kuimingEffect, chooseKuimingTargets, sameCamp, unifiedWith, convertToAnjing, finishAnjingVictory, xuwuCards } from './anjing.js';
//新版引擎的lib.character[i]是Character对象（没有数组下标4），旧版是六段数组。
//Character的[4]是Proxy getter，每读一次都要重建整个trash数组，遍历时绝不能反复读。
const NihilismCharacterFlags = character => {
    if (!character) return [];
    if (Array.isArray(character)) return character[4] || [];
    const flags = [];
    if (character.isBoss) flags.push('boss');
    if (character.isMinskin) flags.push('minskin');
    if (character.isHiddenBoss) flags.push('hiddenboss');
    if (character.isHiddenInStoneMode) flags.push('stonehidden');
    if (character.isAiForbidden) flags.push('Unaffected');
    if (character.isUnseen) flags.push('unseen');
    if (character.isBossAllowed) flags.push('bossallowed');
    return flags;
};
const NihilismShouldSkipCharacter = character => {
    const flags = NihilismCharacterFlags(character);
    return ['boss', 'minskin', 'hiddenboss', 'Unaffected', 'stonehidden'].some(flag => flags.includes(flag));
};
const NihilismSkillList = character => {
    if (!character) return [];
    if (Array.isArray(character)) return character[3] || [];
    return character.skills || [];
};
//以下三个小工具由百变 / 戏魂 / 削强共用，保留在模块级；单技能私有逻辑一律写回技能内部。
const 远古遗神 = {
    //百变
    zshy_baibian: {//百变
        trigger: {
            global: 'phaseBegin',
        },
        NihilismSkill: true,
        forced: true,
        async content(event, trigger, player) {
            await player.chooseDrawRecover(true);
            let list = [];
            for (const i in lib.character) {
                if (NihilismShouldSkipCharacter(lib.character[i])) continue;
                const skills = NihilismSkillList(lib.character[i]);
                for (let j = 0; j < skills.length; j++) {
                    const info = lib.skill[skills[j]];
                    if (info && !info.silent && !info.NihilismSkill) {
                        list.add(skills[j]);
                    }
                };
            };
            list.remove(player.getSkills());
            const link = list.randomGet();
            if (!link) return;
            if (player.getSkills().length < 6) {
                await player.addSkillLog(link);
            } else {
                const skill = player.getSkills(true, false).filter(skill => {
                    if (player.getOriginalSkills().includes(skill)) return false;
                    if (skill == 'zshy_baibian' || skill == 'jiu') return false;
                    if (!lib.translate[skill + '_info']) return false;
                    if (lib.translate[skill + '_info'] == '') return false;
                    let info = get.info(skill);
                    if (!info) return false;
                    return true;
                }).randomGet();
                if (skill) await player.changeSkills([link], [skill]);
                else await player.addSkillLog(link);
            };
        },
    },
    //安璟
    zshy_Nihilism: {//封印
        skillTrigger(triggerName, player, skill) {
            var next = game.createEvent(triggerName, false);
            next.player = player;
            next.skill = skill;
            next.setContent(async (event, trigger, player) => {
                event.trigger(event.name);
            });
        },
        init(player, skill) {
            lib.skill[skill].skillTrigger('zshy_Nihilism_init', player, skill);
        },
        onremove(player, skill) {
            lib.skill[skill].skillTrigger('zshy_Nihilism_removeSkill', player, skill);
        },
        superCharlotte: true,
        NihilismSkill: true,
        charlotte: true,
        forceDie: true,
        firstDo: true,
        forced: true,
        fixed: true,
        global: 'zshy_Nihilism_global',
        subSkill: {
            global: {
                trigger: {
                    player: ['zshy_Nihilism_init', 'zshy_Nihilism_removeSkill'],
                },
                filter(event, player) {
                    return (event.skill == 'zshy_Nihilism' && get.is.playerNames(player, ['Nihilism_AAAAanjing'])) || game.Nihilism_AAAAanjing?.players?.includes(player);
                },
                superCharlotte: true,
                charlotte: true,
                forceDie: true,
                firstDo: true,
                forced: true,
                popup: false,
                async content(event, trigger, player) {
                    switch (event.triggername) {
                        case 'zshy_Nihilism_init':
                            game.Nihilism_AAAAanjing = game.Nihilism_AAAAanjing || {
                                skills: 0,
                                players: [],
                            };
                            game.Nihilism_AAAAanjing.players.add(player);
                            break;
                        case 'zshy_Nihilism_removeSkill':
                            //addSkills是同步方法，await其返回值（undefined）无害；此处显式分支以避免误改
                            player.addSkills(event.skill);
                            break;
                    };
                },
            },
        },
    },
    zshy_AJshenzun: {//神尊
        audio: 'ext:诸神寰宇/audio/character:2',
        superCharlotte: true,
        NihilismSkill: true,
        charlotte: true,
        nobracket: true,
        ruleSkill: true,
        forceDie: true,
        firstDo: true,
        unique: true,
        locked: true,
        fixed: true,
        priority: Infinity,
        init(player) {
            registerAnjing(player);
        },
        forceOut: true,
        group: 'zshy_AJshenzun_enter',
        subSkill: {
            enter: {
                trigger: { global: ['gameStart', 'phaseBefore'], player: 'enterGame' },
                forced: true,
                firstDo: true,
                priority: Infinity,
                charlotte: true,
                superCharlotte: true,
                forceDie: true,
                forceOut: true,
                filter(event, player) { return !player.storage.zshyAnjingEntered && !player.storage.zshyAnjingEntering; },
                async content(event, trigger, player) { await enterAnjing(player); },
            },
        },
        trigger: {
            global: ['dieBefore', 'roundStart', 'changeHpBefore', 'damageBefore', 'loseHpBefore', 'recoverBefore', 'gainMaxHpBefore', 'loseMaxHpBefore'],
        },
        filter(event, player, name) {
            // damage/recover/loseHp 结算内部都会再走 changeHp，同一次结算只提示一次。
            if (name !== 'changeHpBefore') return true;
            const parent = event.getParent?.();
            return !parent || !['damage', 'recover', 'loseHp'].includes(parent.name);
        },
        async cost(event, trigger, player) {
            event.result = await player.chooseBool()
                .set('prompt', get.prompt(event.skill))
                .set('prompt2', '立即插入并执行一个出牌阶段')
                .set('ai', function () {
                    // 真人仍可无限嵌套；托管在已插入阶段内默认不继续套娃。
                    return !get.event().getParent('phaseUse')?._zshyAnjingInserted;
                }).forResult();
        },
        async content(event, trigger, player) {
            await insertAnjingPhase(player);
        },
        ai: {
            nogain: true,
            nolose: true,
            //本身就是最高威胁：所有 AI 都应该优先处理
            threaten: 2,
        },
    },
    zshy_AJxuwu: {//虚无
        audio: 'ext:诸神寰宇/audio/character:2',
        superCharlotte: true,
        NihilismSkill: true,
        charlotte: true,
        nobracket: true,
        ruleSkill: true,
        forceDie: true,
        firstDo: true,
        unique: true,
        forced: true,
        fixed: true,
        priority: Infinity,
        enable: ['chooseToUse', 'chooseToRespond'],
        hiddenCard(player, name) {
            return lib.inpile.includes(name) && ['basic', 'trick', 'delay', 'zshy_feisheng'].includes(get.type2(name));
        },
        filter(event, player) { return xuwuCards(event, player).length > 0; },
        prompt(event, player) {
            return '发动〖虚无〗，视为使用或打出一张基本/锦囊/飞升牌';
        },
        chooseButton: {
            dialog(event, player) {
                const list = xuwuCards(event, player).map(card => [get.type2(card.name), '', card.name, card.nature]);
                return ui.create.dialog('虚无', [list, 'vcard'], 'hidden');
            },
            filter(button, player) {
                const parent = _status.event.getParent();
                return parent.filterCard({ name: button.link[2], nature: button.link[3], isCard: true }, player, parent);
            },
            check(button) {
                const player = _status.event.player;
                //带上属性，让化出来的【杀】等按真实收益评估
                return player.getUseValue({ name: button.link[2], nature: button.link[3] }) + 1;
            },
            backup(links, player) {
                return {
                    // 本体给 viewAs 的 filterCard 套的包装会先问 game.checkMod(..., "cardEnabled2")，
                    // 安璟的 cardEnabled2 恒真会让 filterCard 直接失效；叠加 selectCard:-1（本体语义为
                    // 自动选中全部可选牌），选完牌名后所有手牌会被选中并随虚拟牌打出（gameEvent.js:757-772）。
                    ignoreMod: true,
                    filterCard() { return false },
                    selectCard: -1,
                    viewAs: {
                        name: links[0][2],
                        nature: links[0][3],
                    },
                    popname: true,
                    precontent() {
                        //player.logSkill('zshy_AAAanjing_Jinmie');
                    },
                }
            },
            prompt(links, player) {
                return '将' + get.translation(links[0][2]) + '使用或打出';
            },
        },
        mod: {
            cardEnabled() {
                return true;
            },
            ignoredHandcard() {
                return true;
            },
            cardEnabled2() { return true; },
            cardRespondable() { return true; },
            cardSavable() { return true; },
            canBeDiscarded(card, player, target) {
                if (player !== target) return false;
            },
            maxHandcardBase() {
                return Infinity;
            },
            targetInRange() {
                return true;
            },
            cardUsable() {
                return Infinity;
            },
            aiOrder(player, card) {
                if (get.name(card) == 'sha') return Infinity;
            },
        },
        ai: {
            nogain: true,
            nolose: true,
            //可视为使用任意牌，AI 永远优先走〖虚无〗，用 Infinity 表达“最高优先”
            order: Infinity,
            noh: true,
            respondSha: true,
            respondShan: true,
            fireAttack: true,
            result: {
                player(player) {
                    if (_status.event.type == 'dying') {
                        return get.attitude(player, _status.event.dying);
                    }
                    return 1;
                },
            },
        },
    },
    zshy_AJjinmie: {//烬灭
        audio: 'ext:诸神寰宇/audio/character:2',
        superCharlotte: true,
        NihilismSkill: true,
        charlotte: true,
        nobracket: true,
        ruleSkill: true,
        forceDie: true,
        firstDo: true,
        ai: { nogain: true, nolose: true },
        unique: true,
        locked: true,
        fixed: true,
        priority: Infinity,
        trigger: {
            player: 'useCardToPlayered',
            global: 'phaseBefore',
        },
        filter(event, player, name) {
            const target = name === 'phaseBefore' ? event.player : event.target;
            return target && target !== player && target.isIn() && (!sameCamp(target, player) || target.group !== player.group || target.identity !== player.identity);
        },
        prompt2(event, player, name) {
            const target = name === 'phaseBefore' ? event.player : event.target;
            return '令' + get.translation(target) + '的势力、身份与阵营改为与你相同' + (name === 'phaseBefore' ? '' : '，且此牌对其无效');
        },
        check() { return true; },
        async content(event, trigger, player) {
            if (event.triggername === 'useCardToPlayered') trigger.excluded.add(trigger.target);
            const target = event.triggername === 'phaseBefore' ? trigger.player : trigger.target;
            convertToAnjing(target, player);
            if (unifiedWith(player)) finishAnjingVictory(player);
        },
    },
    zshy_AJhuanhun: {//唤魂
        audio: 'ext:诸神寰宇/audio/character:2',
        superCharlotte: true,
        NihilismSkill: true,
        charlotte: true,
        nobracket: true,
        ruleSkill: true,
        forceDie: true,
        firstDo: true,
        ai: { nogain: true, nolose: true },
        unique: true,
        forced: true,
        fixed: true,
        popup: false,
        priority: Infinity,
        forceOut: true,
        trigger: {
            global: ['phaseAnyBefore'],
            player: ['dieBefore', 'dyingBefore', 'turnOverAfter', 'linkAfter', 'changeCharacterAfter', 'rest'],
        },
        filter(event, player, name) {
            return !player._zshyAnjingRestoring;
        },
        async content(event, trigger, player) {
            if (event.triggername === 'dieBefore') await rescueAnjing(trigger, player);
            else {
                if (event.triggername === 'dyingBefore') trigger.cancel();
                await restoreAnjing(player);
            }
        },
    },
    zshy_AJshenzuninfo: {//神尊
        audio: 'ext:诸神寰宇/audio/character:2',
        superCharlotte: true,
        NihilismSkill: true,
        charlotte: true,
        nobracket: true,
        ruleSkill: true,
        forceDie: true,
        firstDo: true,
        ai: { nogain: true, nolose: true },
        unique: true,
        locked: true,
        fixed: true,
        priority: Infinity,
    },
    zshy_AJxuwuinfo: {//虚无
        audio: 'ext:诸神寰宇/audio/character:2',
        superCharlotte: true,
        NihilismSkill: true,
        charlotte: true,
        nobracket: true,
        ruleSkill: true,
        forceDie: true,
        firstDo: true,
        ai: { nogain: true, nolose: true },
        unique: true,
        locked: true,
        fixed: true,
        priority: Infinity,
    },
    zshy_AJjinmieinfo: {//烬灭
        audio: 'ext:诸神寰宇/audio/character:2',
        superCharlotte: true,
        NihilismSkill: true,
        charlotte: true,
        nobracket: true,
        ruleSkill: true,
        forceDie: true,
        firstDo: true,
        ai: { nogain: true, nolose: true },
        unique: true,
        locked: true,
        fixed: true,
        priority: Infinity,
    },
    zshy_AJhuanhuninfo: {//唤魂
        audio: 'ext:诸神寰宇/audio/character:2',
        superCharlotte: true,
        NihilismSkill: true,
        charlotte: true,
        nobracket: true,
        ruleSkill: true,
        forceDie: true,
        firstDo: true,
        ai: { nogain: true, nolose: true },
        unique: true,
        locked: true,
        fixed: true,
        priority: Infinity,
    },

    //安天痕
    zshy_AllSkill: {//神选
        NihilismSkill: true,
        forced: true,
        async init(player) {
            if (!player.isDisabledJudge()) {
                await player.disableJudge();
            };
        },
        // ②按“其他角色使用牌指定你为目标”触发；套娃只由“可使用一张牌”这一句限制：其没有〖神选〗才可出牌。
        trigger: {
            target: 'useCardToTargeted',
        },
        filter(event, player) {
            return event.player !== player;
        },
        async content(event, trigger, player) {
            await player.chooseDrawRecover(true);
            if (!trigger.player.hasSkill('zshy_AllSkill')) {
                await player.chooseToUse().set('prompt', '【神选】：可使用一张牌').set('ai1', card => {
                    //托管：桃/闪/无懈这类防守牌不用；其余按正常使用价值挑收益最高的。
                    if (!card || typeof card === 'string') return -1;
                    if (['tao', 'shan', 'wuxie'].includes(get.name(card))) return -1;
                    return get.order(card, player);
                });
            }
        },
        mod: {
            targetInRange() {
                return true;
            },
            cardUsable() {
                return Infinity;
            },
            maxHandcardBase(player, num) {
                return num + 4;
            }
        },
        // ①按描述在登场后执行；init 只负责技能获得时的兜底，开局与重新登场由本体事件补齐。
        group: 'zshy_AllSkill_enter',
        subSkill: {
            enter: {
                trigger: {
                    global: ['gameStart'],
                    player: ['enterGame'],
                },
                forced: true,
                filter(event, player) {
                    return !player.isDisabledJudge();
                },
                async content(event, trigger, player) {
                    await player.disableJudge();
                },
            },
        },
    },
    zshy_AAAAkuiming: {//馈命
        audio: 'ext:诸神寰宇/audio/character:2',
        NihilismSkill: true,
        forced: true,
        trigger: { player: 'dieBefore' },
        async content(event, trigger, player) {
            trigger.cancel(isAnjing(player) ? false : undefined);
            // 描述顺序：先防止死亡并把体力与体力上限调整为1，再选择其他角色调整其体力上限。
            await restoreKuimingOwner(player);
            const targets = await chooseKuimingTargets(player);
            await kuimingEffect(player, targets);
        },
        ai: {
            maixie: true,
            maixie_hp: true,
            effect: {
                target(card, player, target) {
                    if (get.tag(card, 'save') || get.tag(card, 'recover')) return 'zeroplayertarget';
                },
                player(card, player, target) {
                    // 只有把救援/回复牌用在自己身上才没有意义；救队友按正常收益评估。
                    if (target === player && (get.tag(card, 'save') || get.tag(card, 'recover'))) return 'zeroplayer';
                }
            },
        },
    },
    zshy_ATHmingying: {//命影
        audio: 'ext:诸神寰宇/audio/character:2',
        NihilismSkill: true,
        forced: true,
        // ①按「其他角色的体力值/体力上限变化」触发；镜像自伤只在体力值减少时发生，并给伤害打标记防止多持有者互触。
        trigger: {
            global: ['changeHpAfter', 'gainMaxHpAfter', 'loseMaxHpAfter'],
        },
        filter(event, player) {
            if (event.player === player) return false;
            if (event.name === 'changeHp') {
                // 自己的镜像自伤（伤害事件带标记）不再反向触发，避免双持有者/自伤互触。
                if (event.getParent?.()?._zshyMingying) return false;
                return Math.abs(Number(event.num) || 0) > 0;
            }
            return (Number(event.num) || 0) > 0;
        },
        async content(event, trigger, player) {
            //工具函数写在技能内部，避免在 skill.js 顶部散落武将专用函数。
            const mark = 'zshy_ATHmingying_ying';
            const total = 'zshy_ATHyingTotal';
            const gainYing = num => {
                player.addMark(mark, num);
                player.storage[total] = (Number(player.storage[total]) || 0) + num;
            };
            //觉醒时机为获得「影」后；走 useSkill 才有本体觉醒技的动画/日志/语音。
            const tryAwaken = async () => {
                if (!player.hasSkill('zshy_ATHdengshen')) return;
                if (player.hasSkill('zshy_ATHtiying')) return;
                if ((Number(player.storage[total]) || 0) < 6) return;
                await player.useSkill('zshy_ATHdengshen');
            };
            const num = Number(trigger.num) || 0;
            const amount = Math.abs(num);
            if (amount < 1) return;
            gainYing(amount);
            await tryAwaken();
            //体力值减少才镜像承受等量无来源伤害；回复与体力上限变化只给「影」（上限变化不自伤，避免与〖馈命〗互相循环）。
            if (trigger.name === 'changeHp' && num < 0) {
                const damage = player.damage(amount, 'nosource', 'nocard');
                damage._zshyMingying = true;
                await damage;
            }
        },
        // ③拆为子技能；可移去任意枚，不设每回合次数。
        group: 'zshy_ATHmingying_yingyong',
        subSkill: {
            // 只用于「影」标记的显示与说明，不作为独立技能获得。
            ying: {
                mark: true,
                charlotte: true,
                intro: {
                    content: '其他角色的体力值或体力上限变化后获得等量「影」，体力值减少时承受等量伤害；出牌阶段可移去任意枚「影」，令一名角色摸等量牌、回复等量体力，或对一名其他角色造成等量伤害。',
                },
            },
            yingyong: {
                audio: 'ext:诸神寰宇/audio/character:2',
                enable: 'phaseUse',
                filter(event, player) {
                    return player.countMark('zshy_ATHmingying_ying') > 0;
                },
                check(event, player) {
                    return true;
                },
                prompt: '出牌阶段，你可移去任意枚「影」，然后选择一项：令一名角色摸等量的牌；令一名角色回复等量体力；对一名其他角色造成等量伤害',
                async content(event, trigger, player) {
                    const mark = 'zshy_ATHmingying_ying';
                    const count = player.countMark(mark);
                    if (count < 1) return;
                    const numberResult = await player
                        //子技能的 event.skill 是 zshy_ATHmingying_yingyong，取提示文本要用母技能 id
                        .chooseNumbers(get.prompt('zshy_ATHmingying'), [
                            {
                                prompt: '选择移去的「影」数量',
                                min: 1,
                                max: count,
                            },
                        ])
                        .set('processAI', () => {
                            // 「影」只用于本项，越多收益越高：AI 默认全部移去
                            return [count];
                        })
                        .forResult();
                    const amount = numberResult?.numbers?.[0];
                    if (!amount || amount < 1) return;
                    const options = ['摸牌', '回复体力', '造成伤害'];
                    const picked = await player.chooseControl(options)
                        .set('prompt', `【命影】：移去${amount}枚「影」，选择一项`)
                        .set('ai', () => {
                            if (game.hasPlayer?.(target => target !== player && target.isIn() && get.attitude(player, target) < 0)) return '造成伤害';
                            if (player.isDamaged?.()) return '回复体力';
                            return '摸牌';
                        }).forResult();
                    const option = picked?.control;
                    if (!options.includes(option)) return;
                    const prompt = option === '造成伤害'
                        ? `【命影】：选择一名其他角色，对其造成${amount}点伤害`
                        : `【命影】：选择一名角色，令其${option === '摸牌' ? `摸${amount}张牌` : `回复${amount}点体力`}`;
                    const result = await player.chooseTarget(prompt, [1, 1], (card, player, target) => {
                        if (!target || (target.isIn && !target.isIn())) return false;
                        return option === '造成伤害' ? target !== player : true;
                    }).set('ai', target => {
                        if (!target) return 0;
                        if (option === '造成伤害') return -get.attitude(player, target);
                        const attitude = get.attitude(player, target);
                        return option === '回复体力' && !target.isDamaged?.() ? attitude * 0.2 : attitude;
                    }).forResult();
                    const target = result?.targets?.[0];
                    if (!target) return;
                    // 先支付再结算：③造成的伤害即使插入〖馈命〗的出牌阶段，也无法重复发动。
                    player.removeMark(mark, amount);
                    if (option === '摸牌') await target.draw(amount);
                    else if (option === '回复体力') await target.recover(amount);
                    else await target.damage(amount);
                },
                ai: {
                    order: 8,
                },
            },
        },
        ai: {
            //被动替所有人分担伤害，且濒死会触发复活：自己越挨打越强
            maixie: true,
            maixie_hp: true,
            effect: {
                target(card, player, target) {
                    if (get.tag(card, 'damage')) return [0.5, 1];
                },
                player(card, player, target) {
                    if (get.tag(card, 'damage')) return [0.5, 1];
                },
            },
        },
    },
    zshy_ATHdengshen: {//登神
        audio: 'ext:诸神寰宇/audio/character:2',
        juexingji: true,
        //觉醒技授予的固定技能（与 zshy001 觉醒技写法一致）
        derivation: ['zshy_ATHtiying'],
        skillAnimation: true,
        animationColor: 'thunder',
        forced: true,
        // 觉醒时机为「获得影后」：由〖命影〗获得「影」时走 useSkill 调用本技能（带觉醒特效）。
        async content(event, trigger, player) {
            player.awakenSkill('zshy_ATHdengshen');
            const count = player.countMark('zshy_ATHmingying_ying');
            if (count > 0) player.removeMark('zshy_ATHmingying_ying', count);
            player.addSkill('zshy_ATHtiying');
            player.update();
        },
    },
    zshy_ATHtiying: {//替影
        audio: 'ext:诸神寰宇/audio/character:2',
        //替影自用工具（技能对象上的自定义字段，引擎忽略）：X值、可用牌筛选、目标选择都写在本技能内。
        tools: (() => {
            const limit = target => {
                let max = target.maxHp - target.hp + 1;
                if (!Number.isFinite(max)) max = 1;
                return Math.max(1, Math.floor(max));
            };
            const usable = (target, event) => {
                return target.getCards('h').filter(card => {
                    try {
                        if (!lib.filter.cardEnabled(card, target, event)) return false;
                        if (!lib.filter.cardUsable(card, target, event)) return false;
                        // updateUsable === 'phaseUse' 的牌（【杀】等）在引擎里按父级 phaseUse 事件判次数；
                        // 此处没有合法父事件，改为手动按「本出牌阶段已用次数」校验，避免次数用完仍能替出。
                        const info = get.info(card) || {};
                        if (info.updateUsable === 'phaseUse') {
                            const card2 = get.autoViewAs ? get.autoViewAs(card) : card;
                            let num = info.usable;
                            if (typeof num === 'function') num = num(card2, target);
                            num = game.checkMod(card2, target, num, 'cardUsable', target);
                            if (typeof num === 'number' && target.countUsed(card2) >= num) return false;
                        }
                        return true;
                    } catch (e) {
                        return false;
                    }
                });
            };
            //由安天痕替出牌者决定牌的目标；无合法目标时返回 null 表示不能使用该牌。
            const chooseTargets = async (chooser, user, card) => {
                const info = get.info(card) || {};
                if (info.notarget) return [];
                let range;
                if (typeof info.selectTarget === 'function') range = info.selectTarget(card, user);
                else if (typeof info.selectTarget === 'number') range = [info.selectTarget, info.selectTarget];
                else if (Array.isArray(info.selectTarget)) range = info.selectTarget.slice();
                else range = info.filterTarget == null ? [0, 0] : [1, 1];
                if (typeof range === 'number') range = [range, range];
                if (!range) range = [0, 0];
                game.checkMod(card, user, range, 'selectTarget', user);
                const upper = range[1] === -1 ? Infinity : Number(range[1]);
                if (!upper || upper <= 0) return [];
                const candidates = game.players.filter(target => lib.filter.targetEnabled2(card, user, target));
                if (!candidates.length) return Number(range[0]) > 0 ? null : [];
                const max = Math.min(upper, candidates.length);
                const min = Math.max(1, Math.min(Number(range[0]) || 1, max));
                const result = await chooser.chooseTarget(
                    `【替影】：为${get.translation(user)}的${get.translation(card)}选择目标`,
                    [min, max],
                    (card2, player, target) => lib.filter.targetEnabled2(card, user, target)
                ).set('ai', target => (target ? get.effect_use(target, card, user, chooser) : 0)).forResult();
                const targets = result?.targets || [];
                return targets.length ? targets : null;
            };
            //AI 估值：这张牌由 user 替出时，安天痕（chooser）视角下的最佳收益。
            const score = (card, user, chooser) => {
                const info = get.info(card) || {};
                if (info.notarget) return get.effect_use(user, card, user, chooser);
                const candidates = game.players.filter(target => lib.filter.targetEnabled2(card, user, target));
                if (!candidates.length) return 0;
                let best = -Infinity;
                for (const target of candidates) {
                    best = Math.max(best, get.effect_use(target, card, user, chooser));
                }
                return Number.isFinite(best) ? best : 0;
            };
            return { limit, usable, score, chooseTargets };
        })(),
        trigger: { global: 'phaseUseBegin' },
        filter(event, player) {
            const target = event.player;
            return target && target !== player && target.isIn() && target.countCards('h') > 0;
        },
        // 「你可」：可选发动；AI 按最佳收益决定是否发动，不再固定关闭。
        async cost(event, trigger, player) {
            const { limit, usable, score } = get.info('zshy_ATHtiying').tools;
            const target = trigger.player;
            if (!usable(target, trigger).length) {
                event.result = { bool: false };
                return;
            }
            event.result = await player.chooseBool()
                .set('prompt', `【替影】：是否观看${get.translation(target)}的手牌，并替其使用至多${get.cnNumber(limit(target))}张牌？`)
                .set('ai', () => usable(target, trigger).some(card => score(card, target, player) > 0))
                .forResult();
        },
        async content(event, trigger, player) {
            const { limit, usable, score, chooseTargets } = get.info('zshy_ATHtiying').tools;
            const target = trigger.player;
            const max = limit(target);
            // 观看其手牌（正面，仅发动者可见）
            const hand = target.getCards('h');
            if (hand.length) await player.viewCards(`【替影】：观看${get.translation(target)}的手牌`, hand);
            for (let i = 0; i < max; i++) {
                if (!target.isIn()) break;
                const cards = usable(target, trigger);
                if (!cards.length) break;
                // 只能从「当前可以使用」的牌里选（不可使用的牌只在观看窗口里展示）
                const picked = await player.chooseButton([
                    `【替影】：选择替${get.translation(target)}使用的第${i + 1}张牌（至多${get.cnNumber(max)}张）`,
                    [cards.slice(), 'vcard'],
                ], [1, 1], false).set('ai', button => score(button.link, target, player)).forResult();
                const card = picked?.links?.[0];
                if (!card) break;
                const targets = await chooseTargets(player, target, card);
                if (targets === null) break;
                await target.useCard(card, [card], targets);
            }
        },
    },

    //灭魂
    zshy_MHxihun: {//戏魂
        audio: 'ext:诸神寰宇/audio/character:2',
        //戏魂自用的「幕」系统（技能对象上的自定义字段，引擎只读已知字段）：戏目池、选择、谢幕结算与换将重入保护都在这里。
        tools: (() => {
            //〖戏魂〗的传说品质副将牌：随机展示至多三名已加载的传说武将，由玩家选择一名（AI 按技能评级与体力评分），避免换到不存在的武将。
            const chooseLegendGeneral = async (player, prompt) => {
                const pool = (lib.rank?.rarity?.legend || []).filter(name => lib.character[name]);
                if (!pool.length) return null;
                const names = pool.randomGets(3);
                if (names.length === 1) return names[0];
                const result = await player.chooseButton([prompt, [names, 'character']], true).set('ai', button => {
                    const info = lib.character[button.link];
                    if (!info || !info.skills || !info.skills.length) return 0;
                    return info.skills.reduce((sum, skill) => sum + get.skillRank(skill, 'in') + get.skillRank(skill, 'out'), 0) + (info.hp || 0);
                }).forResult();
                const picked = result?.links?.[0];
                return picked && names.includes(picked) ? picked : names.randomGet();
            };
            //〖戏魂〗「戏目」池：按触发时机分登场/演出/谢幕三块，每次死亡时从当前技能池实时构建。
            const dramaTriggerNames = info => {
                const names = [];
                for (const key of Object.keys(info.trigger || {})) {
                    const value = info.trigger[key];
                    if (Array.isArray(value)) names.push(...value.filter(name => typeof name === 'string'));
                    else if (typeof value === 'string') names.push(value);
                }
                return names;
            };
            const dramaBlockOf = info => {
                const names = dramaTriggerNames(info);
                if (names.includes('enterGame')) return 'enter';
                if (!names.length) return info.mod ? 'play' : null;
                if (names.some(name => name.startsWith('die') || name.startsWith('dying') || name.startsWith('rest') || name === 'out' || name.startsWith('out'))) return 'exit';
                //纯 gameStart 技能在重新登场时不会触发，放进池里等于空奖励。
                if (names.includes('gameStart')) return null;
                return 'play';
            };
            const dramaSkillPools = player => {
                const pools = { enter: [], play: [], exit: [] };
                const seen = new Set();
                for (const character in lib.character) {
                    if (NihilismShouldSkipCharacter(lib.character[character])) continue;
                    for (const skill of NihilismSkillList(lib.character[character])) {
                        if (seen.has(skill)) continue;
                        seen.add(skill);
                        if (player.hasSkill(skill)) continue;
                        const info = lib.skill[skill];
                        if (!info || info.silent || info.NihilismSkill) continue;
                        if (!lib.translate[skill] || !lib.translate[skill + '_info']) continue;
                        if (info.sub || info.charlotte || info.superCharlotte || info.fixed) continue;
                        if (info.unique || info.limited || info.juexingji || info.zhuSkill || info.ruleSkill || info.equipSkill) continue;
                        if (info.enable || info.viewAs) continue;
                        const block = dramaBlockOf(info);
                        if (block) pools[block].push(skill);
                    }
                }
                return pools;
            };
            const dramaFallback = {
                enter: '摸两张牌',
                play: '回复1点体力并摸一张牌',
            };
            const dramaPickScore = skill => get.skillRank(skill, 'in') + get.skillRank(skill, 'out') + 1;
            //从某一块随机展示至多三张候选，选一张永久获得；无候选时改用兜底效果。
            const chooseDrama = async (player, block, prompt) => {
                const names = dramaSkillPools(player)[block].randomGets(3);
                if (!names.length) return { block, fallback: dramaFallback[block] };
                if (names.length === 1) return { block, skill: names[0] };
                const list = names.map((skill, index) => [String(index), `<div class="popup text" style="width:calc(100%-10px);display:inline-block"><div class="skill">【${get.translation(skill)}】</div><div>${lib.translate[skill + '_info'] || ''}</div></div>`]);
                const result = await player.chooseButton([prompt, [list, 'textbutton']], true).set('ai', button => {
                    const skill = names[Number(button.link)];
                    return skill ? dramaPickScore(skill) : 0;
                }).forResult();
                const skill = names[Number(result?.links?.[0])] || names.randomGet();
                return { block, skill };
            };
            const resolveDramaFallback = async (player, block) => {
                if (block === 'enter') {
                    await player.draw(2);
                } else {
                    await player.recover(1);
                    await player.draw(1);
                }
            };
            //谢幕：自上次登场以来演出过才可选择体力上限压制，否则只能替换副将牌。
            const doCurtain = async (player, performed) => {
                let mode = '替换副将牌';
                if (performed) {
                    const picked = await player.chooseControl(['替换副将牌', '执行谢幕'])
                        .set('prompt', '【戏魂】：选择「谢幕」的方式')
                        .set('ai', () => {
                            const others = game.filterPlayer(current => current !== player);
                            return others.some(current => current.hp <= 1) || others.length >= 2 ? '执行谢幕' : '替换副将牌';
                        }).forResult();
                    if (picked?.control === '执行谢幕') mode = '执行谢幕';
                }
                if (mode === '执行谢幕') {
                    for (const target of game.filterPlayer(function (current) {
                        return current != player;
                    }).sortBySeat()) {
                        const num = Math.max(0, target.hp - 1);
                        if (target.maxHp > num) await target.loseMaxHp(target.maxHp - num);
                        else if (target.maxHp < num) await target.gainMaxHp(num - target.maxHp);
                    }
                    return '体力上限压制';
                }
                const legend = await chooseLegendGeneral(player, '【戏魂】：选择一张传说品质的武将牌替换副将');
                if (legend) {
                    const pairs = ['zshy_AAAAmiehun', legend];
                    const current = [player.name1, player.name2].filter(Boolean);
                    if (current.join('|') !== pairs.join('|')) await player.changeCharacter(pairs);
                }
                return '替换副将牌';
            };
            return { chooseLegendGeneral, chooseDrama, resolveDramaFallback, doCurtain };
        })(),
        NihilismSkill: true,
        forced: true,
        //①按描述在登场后执行：init 钩子会嵌在本体 player.init 内，不能用来换将；改由 gameStart/enterGame 触发。
        group: 'zshy_MHxihun_enter',
        trigger: { player: 'dieBegin' },
        async content(event, trigger, player) {
            const { chooseDrama, resolveDramaFallback, doCurtain } = get.info('zshy_MHxihun').tools;
            trigger.cancel();
            //重入保护：changeCharacter/changeSkills 会再次命中本技能，同一轮直接返回（存 player.storage，避免把 WeakSet 放进被冻结保护的技能定义里）。
            if (player.storage.zshy_MHxihun_restoring) return;
            player.storage.zshy_MHxihun_restoring = true;
            try {
                player.storage.zshy_MHxihun_entered = true;
                player.addMark('zshy_MHxihun_mu', 1);
                const act = player.countMark('zshy_MHxihun_mu');
                const record = { act, stage: '', detail: '' };
                const open = player.storage.zshy_MHxihun_stage === 'open';
                if (!open) {
                    //登场：首次或上一幕谢幕后，必须先重新登场
                    const pick = await chooseDrama(player, 'enter', '【戏魂】：选择一张「登场」戏目永久获得');
                    if (pick.skill) {
                        await player.addSkillLog(pick.skill);
                        record.detail = get.translation(pick.skill);
                    } else {
                        await resolveDramaFallback(player, 'enter');
                        record.detail = pick.fallback;
                    }
                    record.stage = '登场';
                    player.storage.zshy_MHxihun_stage = 'open';
                    player.storage.zshy_MHxihun_performed = false;
                    await restoreKuimingOwner(player);
                    await game.triggerEnter(player);
                } else {
                    const path = await player.chooseControl(['演出', '谢幕'])
                        .set('prompt', '【戏魂】：选择「演出」或「谢幕」')
                        .set('ai', () => {
                            const performed = !!player.storage.zshy_MHxihun_performed;
                            const others = game.filterPlayer(current => current !== player);
                            return performed && (others.some(current => current.hp <= 1) || others.length >= 2) ? '谢幕' : '演出';
                        }).forResult();
                    if (path?.control === '谢幕') {
                        const performed = !!player.storage.zshy_MHxihun_performed;
                        record.stage = '谢幕';
                        record.detail = await doCurtain(player, performed);
                        player.storage.zshy_MHxihun_stage = 'closed';
                        player.storage.zshy_MHxihun_performed = false;
                        await restoreKuimingOwner(player);
                    } else {
                        const pick = await chooseDrama(player, 'play', '【戏魂】：选择一张「演出」戏目永久获得');
                        if (pick.skill) {
                            await player.addSkillLog(pick.skill);
                            record.detail = get.translation(pick.skill);
                        } else {
                            await resolveDramaFallback(player, 'play');
                            record.detail = pick.fallback;
                        }
                        record.stage = '演出';
                        player.storage.zshy_MHxihun_performed = true;
                        await restoreKuimingOwner(player);
                    }
                }
                const summary = `第${act}幕：${record.stage}·${record.detail}`;
                player.storage.zshy_MHxihun_acts = (player.storage.zshy_MHxihun_acts || []).concat(summary);
                game.log(player, '记录', '#g' + summary);
            } finally {
                delete player.storage.zshy_MHxihun_restoring;
            }
            await game.delay();
            await player.phaseUse();
        },
        ai: {
            maixie: true,
            maixie_hp: true,
            effect: {
                target(card, player, target) {
                    if (get.tag(card, 'save') || get.tag(card, 'recover')) return `zeroplayertarget`;
                },
                player(card, player, target) {
                    //只有把救援/回复牌用在自己身上才没有意义；救队友按正常收益评估。
                    if (target === player && (get.tag(card, 'save') || get.tag(card, 'recover'))) return 'zeroplayer';
                }
            },
        },
        subSkill: {
            enter: {
                trigger: { global: 'gameStart', player: 'enterGame' },
                forced: true,
                filter(event, player) {
                    if (player.storage.zshy_MHxihun_entered) return false;
                    return [player.name1, player.name2].includes('zshy_AAAAmiehun');
                },
                async content(event, trigger, player) {
                    const { chooseLegendGeneral } = get.info('zshy_MHxihun').tools;
                    if (player.storage.zshy_MHxihun_restoring) return;
                    player.storage.zshy_MHxihun_restoring = true;
                    try {
                        player.storage.zshy_MHxihun_entered = true;
                        const legend = await chooseLegendGeneral(player, '【戏魂】：选择一张传说品质的武将牌作为副将');
                        if (!legend) return;
                        const pairs = ['zshy_AAAAmiehun', legend];
                        const current = [player.name1, player.name2].filter(Boolean);
                        if (current.join('|') === pairs.join('|')) return;
                        await player.changeCharacter(pairs);
                        //①与旧实现保持一致：登场换副将后回到满体力。
                        player.hp = player.maxHp;
                        await player.update();
                    } finally {
                        delete player.storage.zshy_MHxihun_restoring;
                    }
                },
            },
            mu: {
                name: '幕',
                mark: true,
                charlotte: true,
                intro: {
                    //标记内容在点开时实时渲染，不需要改动被保护的技能定义。
                    content(storage, player) {
                        const acts = player.storage.zshy_MHxihun_acts || [];
                        let stage;
                        if (player.storage.zshy_MHxihun_stage !== 'open') stage = '未开戏（下一幕必须登场）';
                        else if (player.storage.zshy_MHxihun_performed) stage = '演出中（可继续演出或谢幕）';
                        else stage = '已登场（可演出或谢幕）';
                        const lines = [`当前：${stage}`];
                        if (acts.length) {
                            lines.push('—— 戏幕记录 ——');
                            lines.push(...acts.slice(-10));
                            if (acts.length > 10) lines.push(`（仅显示最近10幕，共${acts.length}幕）`);
                        }
                        return lines.join('<br>');
                    },
                },
            },
        },
    },

    //盅墨
    zshy_ZMxuemo: {//血墨
        audio: 'ext:诸神寰宇/audio/character:2',
        //血墨自用的「墨」体系（技能对象上的自定义字段，引擎只读已知字段）：标记、可夺技能与死亡选项都在这里。
        tools: (() => {
            const MO = 'zshy_ZMxuemo_mo';
            const inkCount = target => target.countMark(MO);
            //可从目标身上夺走的技能：排除隐藏技/子技能与你已经拥有的技能。
            const stealable = (player, target) => target.getSkills().filter(skill => {
                const info = lib.skill[skill];
                if (!info || !lib.translate[skill] || !lib.translate[skill + '_info']) return false;
                if (info.sub || info.charlotte) return false;
                return !player.hasSkill(skill);
            });
            //可被〖临摹〗临时借来的技能：绝恒技属于规则层不借；其余技能（含纯 mod 技）都可借，纯 mod 技没有「使用」时点，借来后不会失去。
            const borrowable = (player, target) => stealable(player, target).filter(skill => {
                const info = lib.skill[skill] || {};
                return !(info.NihilismSkill || info.equipSkill || info.zhuSkill || info.ruleSkill);
            });
            const inkedPlayers = player => game.filterPlayer(target => target !== player && target.isIn() && inkCount(target) > 0);
            const totalInk = () => game.players.reduce((sum, target) => sum + inkCount(target), 0);
            const removeAllInk = () => {
                for (const target of game.players.concat(game.dead)) {
                    const num = inkCount(target);
                    if (num > 0) target.removeMark(MO, num, false);
                }
            };
            //死亡结算的可用选项；一项都不可用时返回空数组。
            const deathChoices = player => {
                const inked = inkedPlayers(player);
                const choices = [];
                if (inked.length) choices.push('令所有有「墨」的其他角色的体力上限-1');
                if (inked.some(target => stealable(player, target).length)) choices.push('获得每名有「墨」的角色各一个技能');
                if (totalInk() > 0) choices.push('摸等量的牌，然后移去场上所有「墨」');
                return { inked, choices };
            };
            return { MO, inkCount, stealable, borrowable, inkedPlayers, totalInk, removeAllInk, deathChoices };
        })(),
        NihilismSkill: true,
        forced: true,
        //①按描述在登场后执行：从 init 钩子移到 gameStart/enterGame，避免在 player.init 内嵌套异步选人。
        group: 'zshy_ZMxuemo_enter',
        subSkill: {
            enter: {
                trigger: { global: 'gameStart', player: 'enterGame' },
                forced: true,
                filter(event, player) {
                    return !player.storage.zshy_ZMxuemo_entered;
                },
                async content(event, trigger, player) {
                    const { MO, stealable } = get.info('zshy_ZMxuemo').tools;
                    player.storage.zshy_ZMxuemo_entered = true;
                    await game.delay(0.2);
                    if (!game.hasPlayer(target => target !== player && target.isIn() && stealable(player, target).length)) return;
                    const result = await player.chooseTarget(`###【血墨】：是否选择任意名其他角色？###你夺取其一个技能（其失去该技能），然后其获得1枚「墨」`, [1, Infinity], (card, chooser, target) => {
                        return target !== player && target.isIn() && stealable(player, target).length > 0;
                    }).set('ai', target => {
                        if (!target) return 0;
                        const player = _status.event.player;
                        if (get.attitude(player, target) >= 0) return 0;
                        return stealable(player, target).reduce((sum, skill) => sum + get.skillRank(skill, 'in') + get.skillRank(skill, 'out'), 0);
                    }).forResult();
                    if (!result?.targets?.length) return;
                    for (const target of result.targets.slice(0).sortBySeat()) {
                        if (!target.isIn()) continue;
                        const list = stealable(player, target);
                        if (!list.length) continue;
                        const picked = await player.chooseButton([
                            `【血墨】：夺取${get.translation(target)}的一个技能`,
                            [list.map(skill => [skill, '<div class="popup text" style="width:calc(100%-10px);display:inline-block"><div class="skill">【' + get.translation(skill) + '】</div><div>' + (lib.translate[skill + '_info'] || '') + '</div></div>']), 'textbutton'],
                        ], [1, 1], true).set('ai', button => get.skillRank(button.link, 'in') + get.skillRank(button.link, 'out') + 1).forResult();
                        const skill = picked?.links?.[0];
                        if (!skill) continue;
                        target.removeSkills([skill]);
                        player.addSkills([skill]);
                        target.addMark(MO, 1, false);
                        await game.delay(0.2);
                    }
                    await player.update();
                    await game.delay();
                },
            },
            mo: {
                //只用于「墨」标记的显示与说明，不作为独立技能获得。
                mark: true,
                charlotte: true,
                intro: {
                    content: '一名其他角色使用牌后获得1枚「墨」；有「墨」的角色可以使用牌指定盅墨为目标。',
                },
            },
        },
        trigger: { player: 'dieBegin' },
        async content(event, trigger, player) {
            const { stealable, removeAllInk, totalInk, deathChoices } = get.info('zshy_ZMxuemo').tools;
            trigger.cancel();
            player.maxHp = 1;
            await player.recoverTo(player.maxHp);
            const { inked, choices } = deathChoices(player);
            if (choices.length) {
                let choice = choices[0];
                if (choices.length > 1) {
                    const result = await player.chooseControl(choices).set('prompt', '【血墨】：防止死亡并调整体力上限后，请选择一项').set('ai', () => {
                        const enemies = inked.filter(target => get.attitude(player, target) < 0);
                        if (enemies.length && (enemies.length > inked.length - enemies.length || enemies.some(target => target.maxHp <= 1))) return '令所有有「墨」的其他角色的体力上限-1';
                        if (choices.includes('获得每名有「墨」的角色各一个技能')) return '获得每名有「墨」的角色各一个技能';
                        return '摸等量的牌，然后移去场上所有「墨」';
                    }).forResult();
                    if (choices.includes(result?.control)) choice = result.control;
                }
                if (choice.startsWith('令所有')) {
                    for (const target of inked.slice(0).sortBySeat()) {
                        if (target.isIn()) await target.loseMaxHp(1);
                    }
                } else if (choice.startsWith('获得每名')) {
                    for (const target of inked.slice(0).sortBySeat()) {
                        if (!target.isIn()) continue;
                        const list = stealable(player, target);
                        if (!list.length) continue;
                        const picked = await player.chooseButton([
                            `【血墨】：夺取${get.translation(target)}的一个技能`,
                            [list.map(skill => [skill, '<div class="popup text" style="width:calc(100%-10px);display:inline-block"><div class="skill">【' + get.translation(skill) + '】</div><div>' + (lib.translate[skill + '_info'] || '') + '</div></div>']), 'textbutton'],
                        ], [1, 1], true).set('ai', button => get.skillRank(button.link, 'in') + get.skillRank(button.link, 'out') + 1).forResult();
                        const skill = picked?.links?.[0];
                        if (!skill) continue;
                        target.removeSkills([skill]);
                        player.addSkills([skill]);
                    }
                } else {
                    const num = totalInk();
                    if (num > 0) await player.draw(num);
                    removeAllInk();
                }
                await player.update();
            }
            await game.delay();
        },
        ai: {
            maixie: true,
            maixie_hp: true,
            effect: {
                target(card, player, target) {
                    if (get.tag(card, 'save') || get.tag(card, 'recover')) return `zeroplayertarget`;
                },
                player(card, player, target) {
                    //只有把救援/回复牌用在自己身上才没有意义；救队友按正常收益评估。
                    if (target === player && (get.tag(card, 'save') || get.tag(card, 'recover'))) return 'zeroplayer';
                }
            },
        },
    },
    zshy_ZMluomo: {//落墨
        NihilismSkill: true,
        forced: true,
        trigger: { global: 'useCard' },
        filter(event, player) {
            return !!event.player && event.player !== player;
        },
        async content(event, trigger, player) {
            trigger.player.addMark('zshy_ZMxuemo_mo', 1, false);
        },
        mod: {
            targetEnabled(card, player, target) {
                if (target === player) return;
                if (!player?.hasMark?.('zshy_ZMxuemo_mo')) return false;
            },
        },
    },
    zshy_ZMlinmo: {//临摹
        prompt: '你使用或打出手牌时，可移去一名角色的1枚「墨」，将这张手牌当本轮其他角色使用或打出过的一张基本牌或普通锦囊牌使用或打出',
        NihilismSkill: true,
        enable: ['chooseToUse', 'chooseToRespond'],
        group: ['zshy_ZMlinmo_get', 'zshy_ZMlinmo_pay', 'zshy_ZMlinmo_watch'],
        //临摹自用的工具：可摹的牌、支付「墨」、可借技能者都在这里。
        tools: (() => {
            const bloodTools = () => get.info('zshy_ZMxuemo').tools;
            const MO = 'zshy_ZMxuemo_mo';
            //本轮（当前 round 起点之后）其他角色使用或打出过的基本牌与普通锦囊，按牌名+属性去重。
            const copyPool = player => {
                const list = [], seen = new Set();
                const push = card => {
                    if (!card) return;
                    const type = get.type(card);
                    if (type !== 'basic' && type !== 'trick') return;
                    const name = get.name(card), nature = get.nature(card);
                    if (!lib.card[name]) return;
                    const key = name + '|' + (nature || '');
                    if (seen.has(key)) return;
                    seen.add(key);
                    if (!lib.filter.cardEnabled(get.autoViewAs({ name, nature }), player)) return;
                    list.push([type, '', name, nature]);
                };
                const history = _status.globalHistory || [];
                for (let i = history.length - 1; i >= 0; i--) {
                    for (const evt of history[i].useCard || []) {
                        if (!evt?.player || evt.player === player) continue;
                        push(evt.card);
                    }
                    if (history[i].isRound) break;
                }
                for (const target of game.players.concat(game.dead)) {
                    if (typeof target.getRoundHistory !== 'function') continue;
                    for (const evt of target.getRoundHistory('respond')) {
                        if (!evt?.player || evt.player === player) continue;
                        push(evt.card);
                    }
                }
                return list;
            };
            const borrowTargets = player => game.filterPlayer(target => target !== player && target.isIn() && target.countMark(bloodTools().MO) > 0 && bloodTools().borrowable(player, target).length);
            const canCopy = player => player.countCards('h') > 0 && game.hasPlayer(target => target.countMark(bloodTools().MO) > 0) && copyPool(player).length > 0;
            const canBorrow = player => borrowTargets(player).length > 0;
            return { copyPool, borrowTargets, canCopy, canBorrow };
        })(),
        filter(event, player) {
            return get.info('zshy_ZMlinmo').tools.canCopy(player);
        },
        chooseButton: {
            dialog(event, player) {
                const pool = get.info('zshy_ZMlinmo').tools.copyPool(player);
                return ui.create.dialog('临摹', [pool, 'vcard'], 'hidden');
            },
            filter(button, player) {
                const parent = _status.event.getParent();
                return parent.filterCard({ name: button.link[2], nature: button.link[3], isCard: true }, player, parent);
            },
            check(button) {
                const player = _status.event.player;
                return player.getUseValue({ name: button.link[2], nature: button.link[3], isCard: true }) + 1;
            },
            backup(links, player) {
                return {
                    filterCard(card) {
                        return true;
                    },
                    selectCard: [1, 1],
                    position: 'h',
                    viewAs: { name: links[0][2], nature: links[0][3] },
                    popname: true,
                };
            },
            prompt(links, player) {
                return '【临摹】：将一张手牌当【' + get.translation(links[0][2]) + '】使用或打出';
            },
        },
        ai: {
            order: 6,
        },
        subSkill: {
            //出牌阶段：移去1枚「墨」，获得目标一个技能，直到使用后失去。
            get: {
                enable: 'phaseUse',
                filter(event, player) {
                    return get.info('zshy_ZMlinmo').tools.canBorrow(player);
                },
                check(event, player) {
                    const { canBorrow } = get.info('zshy_ZMlinmo').tools;
                    if (!canBorrow(player)) return false;
                    const used = player.getHistory ? player.getHistory('useSkill', evt => evt.skill === 'zshy_ZMlinmo_get').length : 0;
                    return used < 2;
                },
                ai: {
                    order: 8,
                },
                async content(event, trigger, player) {
                    const { MO, borrowable } = get.info('zshy_ZMxuemo').tools;
                    const { borrowTargets } = get.info('zshy_ZMlinmo').tools;
                    const candidates = borrowTargets(player);
                    if (!candidates.length) return;
                    const result = await player.chooseTarget(`###${get.prompt('zshy_ZMlinmo_get')}###你获得其一个技能（已拥有的技能与绝恒技不能选择），直到你使用该技能后失去`, [1, 1], (card, chooser, target) => candidates.includes(target)).set('ai', target => {
                        if (!target) return 0;
                        const list = borrowable(player, target);
                        return list.reduce((sum, skill) => sum + get.skillRank(skill, 'in') + get.skillRank(skill, 'out'), 0) / Math.max(1, list.length) + target.countMark(MO) * 0.2;
                    }).forResult();
                    const payer = result?.targets?.[0];
                    if (!payer) return;
                    payer.removeMark(MO, 1, false);
                    const list = borrowable(player, payer);
                    const picked = await player.chooseButton([
                        `【临摹】：获得${get.translation(payer)}的一个技能（使用后失去）`,
                        [list.map(skill => [skill, '<div class="popup text" style="width:calc(100%-10px);display:inline-block"><div class="skill">【' + get.translation(skill) + '】</div><div>' + (lib.translate[skill + '_info'] || '') + '</div></div>']), 'textbutton'],
                    ], [1, 1], true).set('ai', button => get.skillRank(button.link, 'in') + get.skillRank(button.link, 'out') + 1).forResult();
                    const skill = picked?.links?.[0];
                    if (!skill) {
                        payer.addMark(MO, 1, false);
                        return;
                    }
                    player.storage.zshy_ZM_borrowed = (player.storage.zshy_ZM_borrowed || []).concat(skill);
                    player.addSkillLog(skill);
                },
            },
            //支付：临摹使用或打出一张牌后，移去1枚「墨」。
            pay: {
                charlotte: true,
                silent: true,
                forced: true,
                trigger: { player: ['useCard', 'respond'] },
                filter(event, player) {
                    if (typeof event.skill !== 'string') return false;
                    if (get.sourceSkillFor(event.skill) !== 'zshy_ZMlinmo') return false;
                    return game.hasPlayer(target => target.countMark('zshy_ZMxuemo_mo') > 0);
                },
                async content(event, trigger, player) {
                    const { MO } = get.info('zshy_ZMxuemo').tools;
                    const targets = game.filterPlayer(target => target.countMark(MO) > 0);
                    if (!targets.length) return;
                    let target = targets[0];
                    if (targets.length > 1) {
                        const result = await player.chooseTarget('【临摹】：移去一名角色的1枚「墨」', [1, 1], (card, chooser, current) => current.countMark(MO) > 0).set('ai', current => {
                            if (!current) return 0;
                            const attitude = get.attitude(player, current);
                            return (attitude < 0 ? 2 : 0) + current.countMark(MO) * 0.5;
                        }).forResult();
                        if (result?.targets?.length) target = result.targets[0];
                    }
                    target.removeMark(MO, 1);
                },
            },
            //借来的技能被使用/触发后失去。
            watch: {
                charlotte: true,
                silent: true,
                forced: true,
                trigger: { player: ['useSkillAfter', 'logSkill'] },
                filter(event, player) {
                    const list = player.storage.zshy_ZM_borrowed;
                    if (!Array.isArray(list) || !list.length) return false;
                    if (typeof event.skill !== 'string') return false;
                    return list.includes(get.sourceSkillFor(event.skill));
                },
                async content(event, trigger, player) {
                    const skill = get.sourceSkillFor(trigger.skill);
                    const list = player.storage.zshy_ZM_borrowed || [];
                    if (!list.includes(skill)) return;
                    player.storage.zshy_ZM_borrowed = list.filter(item => item !== skill);
                    player.removeSkillLog(skill);
                    if (!player.storage.zshy_ZM_borrowed.length) delete player.storage.zshy_ZM_borrowed;
                    await game.delay();
                },
            },
        },
    },

    //罪恋
    zshy_ZLyehuo: {//业火
        audio: 'ext:诸神寰宇/audio/character:2',
        NihilismSkill: true,
        forced: true,
        trigger: { player: 'dieBegin' },
        async content(event, trigger, player) {
            trigger.cancel();
            player.maxHp = 1;
            await player.recoverTo(player.maxHp);
            //只引爆「罪」：AOE 排除自己，避免1血自伤反复触发〖业火〗。
            const targets = game.filterPlayer(function (target) {
                return target != player && target.hasMark('zshy_ZLfenzui_zui');
            }).sortBySeat();
            for (const i of targets) {
                await i.damage(1, 'kami', player);
            }
        },
        ai: {
            maixie: true,
            maixie_hp: true,
            effect: {
                target(card, player, target) {
                    if (get.tag(card, 'save') || get.tag(card, 'recover')) return `zeroplayertarget`;
                },
                player(card, player, target) {
                    //只有把救援/回复牌用在自己身上才没有意义；救队友按正常收益评估。
                    if (target === player && (get.tag(card, 'save') || get.tag(card, 'recover'))) return 'zeroplayer';
                }
            },
        },
    },
    zshy_ZLfenzui: {//焚罪
        audio: 'ext:诸神寰宇/audio/character:2',
        NihilismSkill: true,
        //①其他角色造成伤害后获得1枚「罪」；②一名角色的回合结束时，所有有「罪」的角色受到1点火焰伤害，然后移去1枚「罪」。
        group: ['zshy_ZLfenzui_get', 'zshy_ZLfenzui_burn'],
        subSkill: {
            //只用于「罪」标记的显示与说明，不作为独立技能获得。
            zui: {
                charlotte: true,
                intro: {
                    content: '回合结束时受到1点火焰伤害，然后移去1枚「罪」。',
                },
            },
            //①其他角色造成伤害后，其获得1枚「罪」；已有「赦」的角色不再获得。
            get: {
                forced: true,
                trigger: { global: 'damageSource' },
                filter(event, player) {
                    return event.source && event.source != player && event.source.isIn() && event.num > 0 && !event.source.hasMark('zshy_ZLpanfa_she');
                },
                async content(event, trigger, player) {
                    //〖判罚〗的「罪印」：每枚让获得的「罪」翻一倍（指数增长）。
                    const stack = trigger.source.countMark('zshy_ZLpanfa_yin');
                    await trigger.source.addMark('zshy_ZLfenzui_zui', 2 ** stack);
                },
            },
            //②一名角色的回合结束时，所有有「罪」的角色受到1点火焰伤害，然后移去1枚「罪」。
            burn: {
                forced: true,
                trigger: { global: 'phaseJieshuBegin' },
                filter(event, player) {
                    return game.hasPlayer(function (target) {
                        return target.hasMark('zshy_ZLfenzui_zui');
                    });
                },
                async content(event, trigger, player) {
                    const mark = 'zshy_ZLfenzui_zui';
                    const targets = game.filterPlayer(function (target) {
                        return target.hasMark(mark);
                    }).sortBySeat();
                    for (const target of targets) {
                        await target.damage(1, 'fire', 'nosource', 'nocard');
                        target.removeMark(mark, 1);
                    }
                },
            },
        },
    },
    zshy_ZLpanfa: {//判罚
        audio: 'ext:诸神寰宇/audio/character:2',
        NihilismSkill: true,
        enable: 'phaseUse',
        usable: 1,
        filter(event, player) {
            //没有「自己以外的、尚未获得「赦」的角色」时不可发动。
            return game.hasPlayer(function (target) {
                return target !== player && (!target.isIn || target.isIn()) && !target.hasMark('zshy_ZLpanfa_she');
            });
        },
        prompt: '出牌阶段限一次，你可选择一名其他角色，然后选择一项：1.令其获得1枚「罪印」；2.若其没有「罪」，也没有「罪印」，则其获得「赦」，本局不再获得「罪」',
        async content(event, trigger, player) {
            const mark = 'zshy_ZLfenzui_zui';
            const she = 'zshy_ZLpanfa_she';
            const yin = 'zshy_ZLpanfa_yin';
            const result = await player.chooseTarget('【判罚】：选择一名其他角色', [1, 1], function (card, player, target) {
                //不能选择自己，也不能选择已经获得「赦」的角色。
                return target && target !== player && (!target.isIn || target.isIn()) && !target.hasMark(she);
            }).set('ai', function (target) {
                const player = _status.event.player;
                if (!target || target === player) return 0;
                const attitude = get.attitude(player, target);
                //敌方：定罪叠倍率；友方：只有“无「罪」也无「罪印」”时才值得选中（去赦免）。
                if (attitude < 0) return 1 + target.countMark(yin);
                if (target.countMark(mark) === 0 && target.countMark(yin) === 0) return 1;
                return 0;
            }).forResult();
            if (!result?.bool || !result.targets?.length) return;
            const target = result.targets[0];
            //有「罪」或已有「罪印」的角色不能被赦免。
            const options = ['定罪'];
            if (target.countMark(mark) === 0 && target.countMark(yin) === 0) options.push('赦免');
            const picked = await player.chooseControl(options).set('prompt', '【判罚】：选择一项').set('ai', function () {
                if (get.attitude(player, target) < 0) return '定罪';
                return options.includes('赦免') ? '赦免' : '定罪';
            }).forResult();
            const choice = picked?.control;
            if (choice === '定罪') {
                //定罪：叠一层「罪印」，之后获得的「罪」按 2^枚数 结算；多次定罪指数增长。
                await target.addMark(yin, 1);
                game.log(target, '获得的「罪」翻倍（×' + 2 ** target.countMark(yin) + '）');
            } else if (choice === '赦免') {
                //赦免：本局不再获得「罪」。
                await target.addMark(she, 1);
            }
        },
        subSkill: {
            //只用于「罪印」标记的显示与说明，不作为独立技能获得。
            yin: {
                charlotte: true,
                intro: {
                    content: '之后获得的「罪」翻倍（每枚「罪印」再翻一倍）。',
                },
            },
            //只用于「赦」标记的显示与说明，不作为独立技能获得。
            she: {
                charlotte: true,
                intro: {
                    content: '不会获得「罪」。',
                },
            },
        },
        ai: {
            order: 6,
        },
    },
};
const 江山多殇 = {
    zshy_AAABSkill: {//魂殇
        NihilismSkill: true,
        forced: true,
        async init(player) {
            if (!player.isDisabledJudge()) {
                await player.disableJudge();
            };
            player.maxHp = 7;
            player.hp = 7;
            player.update();
        },
        trigger: {
            player: ['useCard', 'respond'],
        },
        async content(event, trigger, player) {
            await player.chooseDrawRecover(true);
        },
        mod: {
            targetInRange() {
                return true;
            },
            cardUsable() {
                return Infinity;
            },
        },
    },

    //黯日
    zshy_ARjunwei: {//君威
        NihilismSkill: true,
        //君威自用工具（技能对象上的自定义字段，引擎忽略）：可失效技能、失效登记与到期都在这里。
        tools: (() => {
            const PAN = 'zshy_ARzuifa_pan';
            const FAIL = 'zshy_ARjunwei_fail';
            //可被失效的技能：绝恒技已由 arenaReady 的免疫系统全局拦截（获得/移除/封禁/失效/skillBlocker），这里再显式跳过一层，保证描述与实现一致；隐藏技、子技能、状态技与本体固定技同样跳过。
            const disableable = target => target.getSkills().filter(skill => {
                const info = lib.skill[skill];
                if (!info || !lib.translate[skill] || !lib.translate[skill + '_info']) return false;
                if (info.NihilismSkill || info.sub || info.charlotte || info.superCharlotte || info.fixed) return false;
                return skill !== FAIL;
            });
            const failed = target => (target.storage.zshy_ARjunwei_failed || []).slice();
            const fail = (target, skills) => {
                target.storage.zshy_ARjunwei_failed = failed(target).concat(skills).unique();
                target.addSkillBlocker(FAIL);
            };
            const clear = target => {
                const list = failed(target);
                if (!list.length) return list;
                target.storage.zshy_ARjunwei_failed = [];
                target.removeSkillBlocker(FAIL);
                return list;
            };
            return { PAN, FAIL, disableable, failed, fail, clear };
        })(),
        trigger: {
            player: 'useCardToTargeted',
        },
        filter(event, player) {
            const target = event.target;
            if (!target || target == player || (target.isIn && !target.isIn())) return false;
            //每名角色每回合限一次
            if ((player.storage.zshy_ARjunwei_used || []).includes(target.playerid)) return false;
            //至少要有一项可选：有牌可交，或身上有可失效的技能
            return target.countCards('he') > 0 || get.info('zshy_ARjunwei').tools.disableable(target).length > 0;
        },
        prompt2(event, player) {
            return '令' + get.translation(event.target) + '选择：交给你一张牌，或令你选择并失效其一个技能直到你的回合开始，然后其受到1点神属性伤害并获得1枚「叛」';
        },
        check(event, player) {
            return get.attitude(player, event.target) < 0;
        },
        async content(event, trigger, player) {
            const target = trigger.target;
            const { PAN, disableable, fail } = get.info('zshy_ARjunwei').tools;
            player.storage.zshy_ARjunwei_used = (player.storage.zshy_ARjunwei_used || []).concat([target.playerid]);
            //失效持续到黯日下个回合开始：本回合内发动则须等下一轮，否则到黯日下个回合的第一个阶段即解除。
            player.storage.zshy_ARjunwei_stamp = { round: game.roundNumber, self: _status.currentPhase === player };
            const list = disableable(target);
            const canGive = target.countCards('he') > 0;
            const options = [];
            if (canGive) options.push('交给黯日一张牌');
            options.push('被黯日失效一个技能');
            const picked = await target.chooseControl(options)
                .set('prompt', '【君威】：选择一项')
                .set('ai', () => {
                    //有牌且技能比牌值钱时交牌；没牌或没有可失效技能时只能吃选项2
                    if (canGive && (list.length == 0 || target.countCards('he') > 2)) return options[0];
                    return options[options.length - 1];
                }).forResult();
            if (picked?.control == '交给黯日一张牌') {
                const result = await target.chooseCard('【君威】：选择交给黯日的一张牌', 'he').set('ai', card => {
                    if (!card) return 0;
                    return -get.value(card, target);
                }).forResult();
                if (result?.cards?.length) await player.gain(result.cards, target, 'giveAuto');
                return;
            }
            if (list.length) {
                const buttons = list.map(skill => [skill, '<div class="popup text" style="width:calc(100%-10px);display:inline-block"><div class="skill">【' + get.translation(skill) + '】</div><div>' + (lib.translate[skill + '_info'] || '') + '</div></div>']);
                const pick = await player.chooseButton(['【君威】：选择失效' + get.translation(target) + '的一个技能，直到你的回合开始', [buttons, 'textbutton']], [1, 1], true)
                    .set('ai', button => get.skillRank(button.link, 'in') + get.skillRank(button.link, 'out') + 1).forResult();
                const skill = pick?.links?.[0] || list.randomGet();
                if (skill) {
                    fail(target, [skill]);
                    game.log(target, '的', '#g【' + get.translation(skill) + '】', '失效');
                }
            }
            await target.damage(1, 'kami');
            await target.addMark(PAN, 1);
        },
        ai: {
            expose: 0.5,
            threaten: 1.5,
        },
        group: ['zshy_ARjunwei_expire', 'zshy_ARjunwei_reset'],
        subSkill: {
            //失效到期：黯日回合的第一个阶段开始即解除（本回合内发动的等下一轮）。
            expire: {
                charlotte: true,
                forced: true,
                trigger: {
                    player: ['phaseZhunbeiBegin', 'phaseUseBegin', 'phaseJieshuBegin'],
                },
                filter(event, player) {
                    if (!game.hasPlayer(target => get.info('zshy_ARjunwei').tools.failed(target).length > 0)) return false;
                    const stamp = player.storage.zshy_ARjunwei_stamp;
                    if (!stamp) return true;
                    return !stamp.self || game.roundNumber > stamp.round;
                },
                async content(event, trigger, player) {
                    for (const target of game.players) {
                        const list = get.info('zshy_ARjunwei').tools.clear(target);
                        if (!list.length) continue;
                        game.log(target, '的技能', ...list.map(skill => '#g【' + get.translation(skill) + '】'), '恢复');
                    }
                    delete player.storage.zshy_ARjunwei_stamp;
                },
            },
            //每名角色每回合限一次的登记在每个回合结束时清空。
            reset: {
                charlotte: true,
                forced: true,
                trigger: {
                    global: ['phaseJieshuBegin'],
                },
                filter(event, player) {
                    return (player.storage.zshy_ARjunwei_used || []).length > 0;
                },
                async content(event, trigger, player) {
                    player.storage.zshy_ARjunwei_used = [];
                },
            },
            //只作为失效登记的载体：被登记的技能会从 getSkills 中滤除，表现为失效。
            fail: {
                charlotte: true,
                skillBlocker(skill, player) {
                    return (player.storage.zshy_ARjunwei_failed || []).includes(skill);
                },
            },
        },
    },
    zshy_ARzuifa: {//罪罚
        NihilismSkill: true,
        forced: true,
        //罪罚自用工具：可失去的技能与「叛」标记都在这里。
        tools: (() => {
            const PAN = 'zshy_ARzuifa_pan';
            //裁决时可失去的技能：绝恒技已由 arenaReady 全局拦截（changeSkills 双向过滤），这里同样显式跳过；隐藏技/子技能/状态技与本体固定技跳过。
            const losable = target => target.getSkills().filter(skill => {
                const info = lib.skill[skill];
                if (!info || !lib.translate[skill] || !lib.translate[skill + '_info']) return false;
                if (info.NihilismSkill || info.sub || info.charlotte || info.superCharlotte || info.fixed) return false;
                return true;
            });
            return { PAN, losable };
        })(),
        trigger: {
            global: ['phaseJieshuBegin'],
        },
        filter(event, player) {
            return game.hasPlayer(target => (!target.isIn || target.isIn()) && target.countMark('zshy_ARzuifa_pan') >= 3);
        },
        async content(event, trigger, player) {
            const { PAN, losable } = get.info('zshy_ARzuifa').tools;
            const targets = game.filterPlayer(target => target.isIn() && target.countMark(PAN) >= 3).sortBySeat();
            for (const target of targets) {
                const num = target.countMark(PAN);
                if (num < 3) continue;
                target.removeMark(PAN, num);
                const list = losable(target);
                const options = [];
                if (list.length) options.push('随机失去1个技能');
                options.push('受到' + num + '点神属性伤害');
                const picked = await target.chooseControl(options)
                    .set('prompt', '【罪罚】：移去' + num + '枚「叛」，选择一项')
                    .set('ai', () => {
                        //技能多且血线还高时先丢技能；体力吃紧时宁可挨打
                        if (options.length < 2) return options[0];
                        if (target.hp > num + 2) return options[0];
                        return options[options.length - 1];
                    }).forResult();
                if (picked?.control == '随机失去1个技能' && list.length) {
                    await target.removeSkills(list.randomGet());
                } else {
                    await target.damage(num, 'kami');
                }
                player.storage.zshy_ARrishi_count = (Number(player.storage.zshy_ARrishi_count) || 0) + 1;
                if (player.hasSkill('zshy_ARrishi') && !player.hasSkill('zshy_ARducai') && player.storage.zshy_ARrishi_count >= 2) {
                    await player.useSkill('zshy_ARrishi');
                }
            }
        },
        ai: {
            expose: 1,
            threaten: 1.5,
        },
        subSkill: {
            //只用于「叛」标记的显示与说明，不作为独立技能获得。
            pan: {
                charlotte: true,
                intro: {
                    content: '回合结束时若达到3枚，〖罪罚〗执行「裁决」：移去所有「叛」，然后选择失去1个技能或受到等量点神属性伤害。',
                },
            },
        },
    },
    zshy_ARrishi: {//日蚀
        juexingji: true,
        derivation: ['zshy_ARducai'],
        skillAnimation: true,
        animationColor: 'thunder',
        forced: true,
        async content(event, trigger, player) {
            player.awakenSkill('zshy_ARrishi');
            for (const target of game.players.concat(game.dead)) {
                const num = target.countMark('zshy_ARzuifa_pan');
                if (num > 0) target.removeMark('zshy_ARzuifa_pan', num);
            }
            await player.loseMaxHp(2);
            player.addSkill('zshy_ARducai');
            player.update();
        },
    },
    zshy_ARducai: {//独裁
        locked: true,
        forced: true,
        trigger: {
            player: 'useCard',
        },
        async content(event, trigger, player) {
            await trigger.directHit.addArray(game.players);
        },
    },

    //苍澜
    zshy_CLguying: {//孤影
        NihilismSkill: true,
        forced: true,
        trigger: {
            global: ['useCard', 'respond'],
        },
        async content(event, trigger, player) {
            await player.addMark('zshy_CLguying', 1);
        },
        marktext: '影',
        intro: {
            content: '已积蓄#枚暗影之力',
        },
        group: ['zshy_CLguying_LoseHp'],
        subSkill: {
            LoseHp: {
                NihilismSkill: true,
                forced: true,
                trigger: {
                    player: ['loseHpBegin'],
                },
                async content(event, trigger, player) {
                    trigger.cancel();
                    await player.recover(trigger.num);
                },
                ai: {
                    order: 10,
                    maixie_hp: true,
                    effect: {
                        //失去体力会被改成回复体力：对敌人用这类牌等于帮他回血，翻转收益让 AI 别再用
                        target(card, player, target) {
                            if (get.tag(card, 'losehp')) return -1;
                        },
                        player(card, player, target) {
                            if (get.tag(card, 'losehp')) return -1;
                        },
                    },
                },
            },
        },
    },
    zshy_CLanxing: {//暗行
        NihilismSkill: true,
        locked: true,
        lastDo: true,
        trigger: {
            player: ['damageBefore', 'loseMaxHpBefore'],
        },
        filter(event, player, name) {
            const need = name == 'damageBefore' ? (event.num || 1) : 1;
            return player.countMark('zshy_CLguying') >= need;
        },
        prompt2(event, player, name) {
            if (name == 'damageBefore') return `弃置${event.num || 1}枚「影」防止你受到伤害，然后你摸一张牌并使用一张手牌`;
            return '弃置1枚「影」防止你减少体力上限，然后你摸一张牌并使用一张手牌';
        },
        check(event, player, name) {
            if (name == 'loseMaxHpBefore') return true;
            return get.damageEffect(player, event.source, player, event.nature) < 0;
        },
        async content(event, trigger, player) {
            const num = event.triggername == 'damageBefore' ? (trigger.num || 1) : 1;
            trigger.cancel();
            player.removeMark('zshy_CLguying', num);
            await player.draw();
            await player.chooseToUse();
        },
        ai: {
            order: 9,
            combo: 'zshy_CLguying',
        },
        group: ['zshy_CLanxing_Usecard'],
        subSkill: {
            Usecard: {
                audio: 'zshy_CLanxing',
                superCharlotte: true,
                charlotte: true,
                firstDo: true,
                forced: true,
                fixed: true,
                trigger: {
                    player: 'useCard',
                },
                async content(event, trigger, player) {
                    await trigger.directHit.addArray(game.players);
                    if (player.countMark('zshy_CLguying') >= player.hp) trigger.baseDamage += Math.ceil(player.countMark('zshy_CLguying') / player.maxHp);
                },
                ai: {
                    directHit: true,
                    directHit_ai: true,
                    effect: {
                        player(card, player, target) {
                            const att = get.attitude(player, target);
                            if (att < 0) return -player.countMark('zshy_CLguying') + target.hp;
                            return;
                        }
                    },
                }
            },
        },
    },

    //金牛座
    zshy_JNZxingyuan: {//星垣
        NihilismSkill: true,
        trigger: {
            player: ['damageBegin4', 'loseHpBegin'],
        },
        filter(event, player) {
            return player.maxHp > 1;
        },
        prompt2: `减少1点体力上限防止之`,
        check(event, player) {
            //会进入濒死、或伤害超过1点、或已经受伤时，用1点体力上限换掉
            if (player.hp - event.num <= 0) return true;
            if (event.num > 1) return true;
            return player.isDamaged();
        },
        async content(event, trigger, player) {
            trigger.cancel();
            await player.loseMaxHp();
        },
    },
    zshy_JNZfaquan: {//伐权
        NihilismSkill: true,
        trigger: {
            global: ['changeHp'],
        },
        filter(event, player) {
            return event.player != player;
        },
        prompt2(event) {
            return `夺取${get.translation(event.player)}1点体力上限`
        },
        check(event, player) {
            //只从敌人身上夺取体力上限，避免误伤队友
            if (event.player.maxHp <= 1) return false;
            return get.attitude(player, event.player) < 0;
        },
        async content(event, trigger, player) {
            const num = 1;
            await trigger.player.loseMaxHp(num);
            await player.gainMaxHp(num);
            await player.recover(num);
        },
    },

    //莉莉姆
    zshy_LLMmingqi: {//命契*
        NihilismSkill: true,
        forced: true,
        trigger: { player: 'dieBegin' },
        async content(event, trigger, player) {
            trigger.cancel();
            await player.loseMaxHp();
            player.hp = player.maxHp;
            await player.draw(4);
        },
    },
    zshy_LLMhunyue: {//魂约
        NihilismSkill: true,
        trigger: {
            global: 'roundStart',
        },
        async cost(event, trigger, player) {
            const str = '选择任意名其他角色复制其所有技能';
            event.result = await player.chooseTarget(get.prompt('zshy_LLMhunyue'), str, [1, Infinity], function (card, player, target) {
                return target != player;
            }).set('ai', function (target) {
                const player = _status.event.player;
                //复制到的未拥有技能越多越值钱
                return target.getSkills().filter(skill => !player.hasSkill(skill)).length;
            }).forResult();
        },
        async content(event, trigger, player) {
            for (const i of event.targets.sortBySeat()) {
                const skill = i.getSkills();
                await player.addSkills(skill);
            }
        },
    },
};
const 异界来客 = {
    //初音未来
    zshy_CYWLxuni: {//虚拟
        NihilismSkill: true,
        forced: true,
        trigger: {
            player: ['damageBegin4', 'loseHpBefore', 'loseMaxHpBefore'],
        },
        filter(event, player) {
            if (event.name == 'damage') return !event.hasNature('thunder');
            return true;
        },
        async content(event, trigger, player) {
            trigger.cancel();
            if (trigger.triggername == 'damageBegin4') {
                const str = '请选择一名其他角色替你受到' + trigger.num + '点同属性伤害，然后你摸' + trigger.num + '张牌';
                const result = await player.chooseTarget(get.prompt('zshy_CYWLxuni'), str, function (card, player, target) {
                    return target != player;
                }).set('ai', function (target) {
                    //把伤害转给敌人，收益按对该角色的伤害计算
                    return get.damageEffect(target, trigger.source || player, player, trigger.nature);
                }).forResult();
                if (result.bool) {
                    const next = await result.targets[0].damage(trigger.num, trigger.nature);
                    next.source = trigger.source;
                    await player.draw(trigger.num);
                };
            }
        },
        ai: {
            threaten: 4.2,
            maixie: true,
            effect: {
                target(card, player, target) {
                    //雷属性以外的伤害会被直接取消并反弹，对拥有者几乎无效
                    if (!get.tag(card, 'thunderdamage')) return 'zeroplayertarget';
                },
            },
        },
    },
    zshy_CYWLyindong: {//音动*
        NihilismSkill: true,
        forced: true,
        trigger: {
            global: 'damageAfter',
        },
        filter(event, player) {
            return event.hasNature('thunder');
        },
        async content(event, trigger, player) {
            let prompt = '选择任意名其他角色依次失去' + trigger.num + '点体力，剩余其他角色依次回复' + trigger.num + '点体力';
            const result = await player.chooseTarget(prompt, [1, Infinity],
                function (event, target, player) {
                    return target != player;
                }).set('ai', target => {
                    return get.effect(target, { name: 'losehp' }, player, player);
                }).forResult();
            if (result.bool) {
                for (const i of result.targets.sortBySeat()) {
                    await i.loseHp(trigger.num);
                }
                const rplayer = game.filterPlayer(current =>
                    current != player && !result.targets.includes(current)
                ).sortBySeat();
                for (const i of rplayer) {
                    await i.recover(trigger.num);
                }
            } else {
                const rplayer = game.filterPlayer(current => current != player).sortBySeat();
                for (const i of rplayer) {
                    await i.recover(trigger.num);
                }
            };
            player.insertPhase();
        },
    },
    zshy_CYWLzouming: {//奏鸣
        NihilismSkill: true,
        forced: true,
        trigger: {
            player: ['useCard', 'respond'],
        },
        getLastUsed(player, event) {
            var history = player.getAllHistory('useCard');
            var index;
            if (event) index = history.indexOf(event) - 1;
            else index = history.length - 1;
            if (index >= 0) return history[index];
            return false;
        },
        filter(event, player) {
            let evt = lib.skill.zshy_CYWLzouming.getLastUsed(player, event);
            if (!evt || !evt.card) return false;
            return get.color(evt.card) != get.color(event.card);
        },
        async content(event, trigger, player) {
            let color = get.color(trigger.card);
            switch (color) {
                case 'red':
                    for (const i of game.filterPlayer(function (current) {
                        return current != player;
                    })) {
                        await i.damage('fire');
                    }
                    break;
                case 'black':
                    for (const i of game.filterPlayer(function (current) {
                        return current != player;
                    })) {
                        await i.damage('ice');
                    }
                    break;
                case 'none':
                    for (const i of game.filterPlayer(function (current) {
                        return current != player;
                    })) {
                        await i.damage('kami');
                    }
                    break;
            };
            await player.chooseDrawRecover(2, true);
        },
    },

    //古月方源
    zshy_GYFYliandao: {//炼道
        NihilismSkill: true,
        forced: true,
        trigger: {
            global: ['useCardEnd', 'respondEnd'],
        },
        filter(event, player) {
            const name = get.name(event.card);
            return !player.getStorage('zshy_GYFYliandao').includes(name);
        },
        async content(event, trigger, player) {
            const name = get.name(trigger.card);
            await player.markAuto('zshy_GYFYliandao', [name]);
            game.log(player, '记录了', '#y' + get.translation(name));
        },
        intro: {
            content: '已记录牌名：$',
        },
        ai: {
            order: 12,
            expose: 0.3,
            threaten: 1.8,
        },
    },
    zshy_GYFYcanlian: {//残炼
        NihilismSkill: true,
        trigger: {
            global: 'useCard',
        },
        filter(event, player) {
            return player.getStorage('zshy_GYFYliandao').includes(get.name(event.card)) && event.player != player;
        },
        prompt2(event, player, card) {
            return '令' + get.translation(event.player) + '选择弃置所有同名牌或令该牌无效'
        },
        check(event, player) {
            //以我的立场判断这张牌是否在伤害我方
            const targets = (event.targets || []).filter(target => get.itemtype(target) == 'player');
            if (!targets.length) return get.attitude(player, event.player) < 0;
            let effect = 0;
            for (const target of targets) {
                effect += get.effect(target, event.card, event.player, player);
            }
            return effect < 0;
        },
        async content(event, trigger, player) {
            if (trigger.player.countCards('he', { name: trigger.card.name }) == 0) {
                trigger.targets.length = 0;
                trigger.all_excluded = true;
                game.log(player, '令', trigger.card, '无效了');
            } else {
                const result = await trigger.player.chooseBool().set('ai', function () {
                    return get.attitude(_status.event.player, player) < 0;
                }).set('prompt', '是否弃置所有与' + get.translation(trigger.card) + '同名的牌，否则取消之').forResult();
                if (result.bool) {
                    const name = trigger.card.name;
                    const cards = trigger.player.getCards('he', { name: name });
                    trigger.player.discard(cards);
                } else {
                    trigger.targets.length = 0;
                    trigger.all_excluded = true;
                    game.log(player, '令', trigger.card, '无效了');
                }
            }
        },
        ai: {
            effect: {
                target(card, player, target) {
                    if (get.attitude(player, target) < 0) {
                        if (!player.getCards('h', {
                            name: card.name
                        }).includes(card)) return [0, 1];
                    }
                },
            },
        },
    },
    zshy_GYFYdaozhu: {//道主
        NihilismSkill: true,
        forced: true,
        trigger: {
            player: 'damageBegin4',
        },
        filter(event, player) {
            return player.getStorage('zshy_GYFYliandao').length > 0;
        },
        async content(event, trigger, player) {
            trigger.cancel();
            await player.chooseDrawRecover(2, true);
            const list = player.getStorage('zshy_GYFYliandao').randomGet();
            if (list) player.storage.zshy_GYFYliandao.remove(list);
        },
    },

    //龙裔
    zshy_LYmoyi: {//末裔*
        NihilismSkill: true,
        forced: true,
        trigger: {
            global: ['roundStart', 'dying'],
        },
        filter(event, player, name) {
            if (name == 'roundStart') return true;
            return event.player != player;
        },
        async content(event, trigger, player) {
            await player.addMark('zshy_LYmoyi', 1);
            await player.chooseDrawRecover(true);
        },
        marktext: '龙魂',
        intro: {
            name2:  '龙魂',
            content: '血脉中的龙魂被激发出来，拥有非比寻常的力量。<br>当前拥有龙魂：#颗。<br>当前手牌上限+#。<br>当前出【杀】次数+#。',
        },
        group: ['zshy_LYmoyi_Die'],
        subSkill: {
            Die: {
                NihilismSkill: true,
                forced: true,
                trigger: {
                    player: ['dieBefore'],
                },
                filter(event, player) {
                    return player.countMark('zshy_LYmoyi') > 0;
                },
                async content(event, trigger, player) {
                    trigger.cancel();
                    await player.removeMark('zshy_LYmoyi', 1);
                    await player.gainMaxHp();
                    await player.recoverTo(player.maxHp);
                    await player.drawTo(player.maxHp);
                },
            },
        },
    },
    zshy_LYbaitong: {//百通*
        NihilismSkill: true,
        forced: true,
        trigger: {
            player: ['useCardAfter', 'respondAfter'],
        },
        filter(event, player, target) {
            return player != _status.currentPhase;
        },
        async content(event, trigger, player) {
            await player.draw(player.countMark('zshy_LYmoyi'));
            if (player.countCards('h')) {
                await player.chooseToUse({
                    filterCard(card) {
                        if (get.itemtype(card) != 'card' || get.position(card) != 'h' && get.position(card) != 's') return false;
                        if (get.type(card) == get.type(trigger.card)) return false;
                        return lib.filter.filterCard.apply(this, arguments);
                    },
                    prompt: '百通：选择一张牌使用'
                });
            };
        },
        mod: {
            maxHandcard(player, num) {
                return num + player.countMark('zshy_LYmoyi');
            },
            cardUsable(card, player, num) {
                if (card.name == 'sha') return num + player.countMark('zshy_LYmoyi');
            },
        },
    },

    //苏晓
    zshy_SXdaoshu: {//刀术
        NihilismSkill: true,
        trigger: {
            player: 'useCard',
        },
        prompt2(event, player) {
            return '你可重铸任意张牌，然后根据重铸牌对应类型数令此牌强化对应效果：①基本牌，额外结算+1次；②锦囊牌，额外指定目标+1（无距离限制）；③装备牌，基础数值+1。'
        },
        check(event, player) {
            //重铸本身还能补牌，所以只要这刀是砍向敌人就值得强化
            return (event.targets || []).some(target => get.damageEffect(target, player, player) > 0);
        },
        filter(event, player) {
            return get.name(event.card) == 'sha' && player.countCards('he') > 0 && (event.targets || []).some(target => target != player);
        },
        async content(event, trigger, player) {
            //AI：按“刚好击杀 + 1 点余量（防一张桃）”计算要重铸的牌
            let directcards;
            if (!player.isUnderControl()) {
                const used = trigger.cards || [];
                const pool = player.getCards('he').filter(card => !used.includes(card));
                const byValue = arr => arr.slice().sort((a, b) => get.value(a, player) - get.value(b, player));
                const valueSum = arr => arr.reduce((sum, card) => sum + get.value(card, player), 0);
                const basics = byValue(pool.filter(card => get.type(card) == 'basic'));
                const equips = byValue(pool.filter(card => get.type(card) == 'equip'));
                const base = trigger.baseDamage || 1;
                const baseCount = 1 + (trigger.effectCount || 0);
                const enemies = (trigger.targets || []).filter(target => target.isIn() && get.attitude(player, target) < 0);
                const already = enemies.some(target => base * baseCount >= target.hp + (target.hujia || 0) + 1);
                if (already) directcards = [];
                else {
                    let best = null;
                    for (const target of enemies) {
                        const need = target.hp + (target.hujia || 0) + 1;
                        for (let b = 0; b <= basics.length; b++) {
                            //装备牌每张令基础数值+1，基本牌每张令结算次数+1
                            const e = Math.max(0, Math.ceil(need / (baseCount + b)) - base);
                            if (e > equips.length || (!b && !e)) continue;
                            const cards = basics.slice(0, b).concat(equips.slice(0, e));
                            const cost = valueSum(cards);
                            if (!best || cost < best.cost || (cost === best.cost && cards.length < best.cards.length)) best = { cards, cost };
                        }
                    }
                    if (best) directcards = best.cards;
                    else {
                        //杀不掉也给这张【杀】一点强化，只取最便宜的一张基本/装备
                        const pick = byValue(basics.concat(equips))[0];
                        if (pick) directcards = [pick];
                    }
                }
            }
            const next = player.chooseCard('类型效果：', 'he', [1, Infinity])
                .set('prompt2', '①基本牌，额外结算1次；②锦囊牌，额外指定任意目标（无距离限制）；③装备牌，基础数值+1。')
                .set('ai', function (card) {
                    return 7 - get.value(card);
                });
            //AI 传了方案（含空数组＝不需要重铸）就按方案结算，人类照常自己选
            if (directcards) next.set('directresult', directcards);
            const result = await next.forResult();
            if (result && result.cards) {
                player.recast(result.cards);
                let bh = 0, th = 0, eh = 0;
                for (const i of result.cards) {
                    if (get.type(i) == 'basic') bh++;
                    if (get.type2(i) == 'trick') th++;
                    if (get.type(i) == 'equip') eh++;
                }
                trigger.baseDamage += eh;
                trigger.effectCount += bh;
                if (th > 0) {
                    var prompt2 = '刀术：为' + get.translation(trigger.card) + '增加至多' + th + '个目标';
                    const result1 = await player.chooseTarget(prompt2, [1, th], function (card, player, target) {
                        var player = _status.event.source;
                        return !_status.event.targets.includes(target) && lib.filter.targetEnabled2(_status.event.card, player, target);
                    }).set('ai', function (target) {
                        var trigger = _status.event.getTrigger();
                        var player = _status.event.source;
                        return get.effect(target, trigger.card, player, _status.event.player);
                    }).set('targets', trigger.targets).set('card', trigger.card)
                        .set('source', trigger.player)
                        .setHiddenSkill(event.name)
                        .forResult();
                    if (result1 && result1.bool) {
                        if (!event.isMine() && !event.isOnline()) {
                            game.delayx();
                        }
                        player.logSkill(event.name, result1.targets);
                        trigger.targets.addArray(result1.targets);
                        game.log(result1.targets, '也成为了', trigger.card, '的目标');
                    }
                }
            }
        },
        mod: {
            targetEnabled(card, player, target) {
                //只限制自己使用延时锦囊，不能影响别人对第三人使用
                if (player !== target && get.type(card) == 'delay' && _status.event.player === target) return false;
            },
        },
    },
    zshy_SXmiefa: {//灭法
        NihilismSkill: true,
        trigger: {
            player: 'useCardToTargeted',
        },
        prompt2(event, player) {
            return '令' + get.translation(event.target) + '本回合所有非状态技失效且不能使用或打出手牌，然后将其区域内的所有『属性』牌移出游戏并对其造成X点伤害（X为移出牌数），最后你回复1点体力或摸一张牌'
        },
        check(event, player) {
            //封技能+拆属性牌+摸牌回复，只有对敌人用才划算
            return get.attitude(player, event.target) < 0 && get.effect(event.target, { name: 'guohe' }, player, player) > 0;
        },
        filter(event, player) {
            return event.target != player;
        },
        async content(event, trigger, player) {
            trigger.target.addTempSkill('zshy_SXmiefa_Nocard');
            trigger.target.addTempSkill('baiban');
            const cards = trigger.target.getCards('hejs', function (card) {
                return get.tag(card, 'natureDamage');
            });
            if (cards.length) {
                trigger.target.$throw(cards);
                game.log(cards, '被移出了游戏');
                await trigger.target.lose(cards, ui.special);
                trigger.target.damage(cards.length);
            };
            await player.chooseDrawRecover(true);
        },
        ai: {
            directHit: true,
            directHit_ai: true,
        },
        group: ['zshy_SXmiefa_Gain'],
        subSkill: {
            Gain: {
                audio: 'zshy_SXmiefa',
                superCharlotte: true,
                charlotte: true,
                forced: true,
                fixed: true,
                enable: 'phaseUse',
                filterCard(card) {
                    return get.tag(card, 'natureDamage');
                },
                selectCard: [1, Infinity],
                filter(event, player) {
                    return player.countCards('h', function (card) {
                        return get.tag(card, 'natureDamage');
                    }) > 0;
                },
                prompt: '出牌阶段，你可将任意张『属性』牌移出游戏，然后回复等量体力并摸等量张牌',
                checkCard(card) {
                    return get.tag(card, 'natureDamage');
                },
                async content(event, trigger, player) {
                    const cards = event.cards;
                    player.$throw(cards);
                    game.log(cards, '被移出了游戏');
                    await player.lose(cards, ui.special);
                    await player.recover(cards.length);
                    await player.draw(cards.length);
                },
                ai: {
                    order: 9,
                    result: {
                        player: 1,
                    },
                },
            },
            Nocard: {
                mark: true,
                popup: false,
                forced: true,
                charlotte: true,
                mod: {
                    cardEnabled2(card) {
                        if (get.position(card) == 'h') return false;
                    },
                },
                intro: {
                    content: '不能使用或打出手牌',
                },
            },
        },
    },
    zshy_SXjuemo: {//绝魔
        NihilismSkill: true,
        trigger: {
            target: 'useCardToTargeted',
        },
        check(event, player) {
            //以我的立场判断：这张牌是否对我不利
            return get.effect(player, event.card, event.player, player) < 0;
        },
        filter(event, player) {
            return (get.tag(event.card, 'natureDamage')) && event.player != player;
        },
        'prompt2'(event, player) {
            return '令' + get.translation(event.card) + '对你无效';
        },
        async content(event, trigger, player) {
            await trigger.excluded.push(player);
        },
        mod: {
            cardEnabled2(card) {
                if (get.tag(card, 'natureDamage')) return false;
            },
            aiValue(card) {
                if (get.tag(card, 'natureDamage')) return 0;
            },
            aiUseful(card) {
                if (get.tag(card, 'natureDamage')) return 0;
            },
        },
        ai: {
            notrick: true,
            effect: {
                target(card, player, target) {
                    if ((get.tag(card, 'natureDamage')) && get.attitude(player, target) < 0) return 'zeroplayertarget';
                    return;
                },
            },
        },
        group: ['zshy_SXjuemo_Damage'],
        subSkill: {
            Damage: {
                audio: 'zshy_SXjuemo',
                superCharlotte: true,
                charlotte: true,
                forced: true,
                fixed: true,
                trigger: {
                    player: 'damageBegin4',
                },
                filter(event, player) {
                    return event.hasNature() && game.roundNumber > 0;
                },
                async content(event, trigger, player) {
                    trigger.num -= game.roundNumber;
                },
                ai: {
                    noice: true,
                    nofire: true,
                    nothunder: true,
                    effect: {
                        target(card, player, target) {
                            if (get.tag(card, 'natureDamage')) return 'zeroplayertarget';
                        },
                    },
                },
            },
        },
    },
    zshy_SXxueshou: {//血兽
        NihilismSkill: true,
        frequent: true,
        trigger: {
            source: 'damageBegin3',
            player: 'damageBegin4',
        },
        prompt2(event, player) {
            if (event.source == player) {
                return '令你造成的伤害+' + (player.getDamagedHp() + 1);
            } else {
                return '令你受到的伤害-' + (player.getDamagedHp() + 1);
            }
        },
        check(event, player) {
            if (event.source == player) {
                return event.player != player && get.damageEffect(event.player, player, player) > 0;
            }
            return event.num > 0;
        },
        async content(event, trigger, player) {
            let num = player.getDamagedHp() + 1;
            if (trigger.source == player) {
                trigger.num += num;
            } else {
                trigger.num -= num;
            }
        },
    },

    //杨间
    zshy_YJguiqu: {//鬼躯
        NihilismSkill: true,
        forced: true,
        trigger: {
            source: ['damageEnd'],
        },
        async content(event, trigger, player) {
            const target = trigger.player;
            const num = trigger.num;
            if (!target || !target.isIn() || target == player) return;
            const usable = skill => {
                if (skill == 'jiu') return false;
                if (!lib.translate[skill + '_info']) return false;
                if (lib.translate[skill + '_info'] == '') return false;
                if (!get.info(skill)) return false;
                return true;
            };
            const removeList = target.getSkills(true, false).filter(usable);
            const gainList = removeList.filter(skill => !player.hasSkill(skill));
            const controls = [], choiceList = [], enabled = {};
            if (num >= 1) {
                controls.push('选项一');
                enabled['选项一'] = true;
                choiceList.push(`令${get.translation(target)}减少${num}点体力上限，然后回复${num}点体力或摸${num * 2}张牌`);
            }
            else {
                choiceList.push(`<span style="opacity:0.5">令${get.translation(target)}减少${num}点体力上限，然后回复${num}点体力或摸${num * 2}张牌</span>`);
            }
            if (removeList.length) {
                controls.push('选项二');
                enabled['选项二'] = true;
                choiceList.push('移除' + get.translation(target) + '武将牌的1个技能并摸两张牌并回复1点体力');
            }
            else {
                choiceList.push(`<span style="opacity:0.5">移除${get.translation(target)}武将牌的1个技能并摸两张牌并回复1点体力</span>`);
            }
            if (gainList.length) {
                controls.push('选项三');
                enabled['选项三'] = true;
                choiceList.push('获得并移除' + get.translation(target) + '武将牌1个技能');
            }
            else {
                choiceList.push(`<span style="opacity:0.5">获得并移除${get.translation(target)}武将牌1个技能</span>`);
            }
            if (!controls.length) return;
            const pickSkill = async (lists, tip) => {
                if (!lists || !lists.length) return null;
                event.videoId = lib.status.videoId++;
                if (player == game.me) {
                    const dialog = ui.create.dialog('forcebutton');
                    dialog.videoId = event.videoId;
                    dialog.add(tip);
                    for (const skill of lists) {
                        const info = lib.translate[skill + '_info'];
                        if (!info) continue;
                        dialog.add('<div class="popup pointerdiv" style="width:80%;display:inline-block"><div class="skill">【' +
                            get.translation(skill) + '】</div><div>' + info + '</div></div>');
                    }
                    dialog.addText('<br>');
                }
                const result = await player.chooseControl(lists.slice(), true)
                    .set('prompt', tip)
                    .set('ai', () => lib.skill.zshy_YJguiqu.getBestSkill(lists))
                    .forResult();
                if (event.videoId != null) {
                    game.broadcastAll('closeDialog', event.videoId);
                    event.videoId = null;
                }
                const link = result?.control;
                if (link && lists.includes(link)) return link;
                return null;
            };
            if (!player.hasSkill('zshy_YJguiqu')) return;
            const result = await player.chooseControl(controls, 'cancel2')
                .set('choiceList', choiceList)
                .set('prompt', get.prompt2('zshy_YJguiqu'))
                .set('ai', () => {
                    const att = get.attitude(player, target);
                    if (att >= 0) return 'cancel2';
                    const rank = skill => skill ? get.skillRank(skill, 'in') + get.skillRank(skill, 'out') : 0;
                    if (gainList.length) return '选项三';
                    if (removeList.length && rank(lib.skill.zshy_YJguiqu.getBestSkill(removeList)) > 0) return '选项二';
                    if (num >= 1) return '选项一';
                    if (removeList.length) return '选项二';
                    return 'cancel2';
                })
                .forResult();
            const control = result?.control;
            if (!enabled[control]) return;
            if (!player.hasSkill('zshy_YJguiqu')) return;
            event.target = target;
            player.logSkill('zshy_YJguiqu', target);
            if (control == '选项一') {
                await target.loseMaxHp(num);
                if (!target.isIn()) return;
                await player.chooseDrawRecover(num * 2, num, true);
                return;
            }
            if (control == '选项二') {
                const link = await pickSkill(removeList, '鬼躯：请选择要移除的1个技能，然后摸两张牌并回复1点体力');
                if (!link) return;
                target.popup(link);
                await target.removeSkills(link);
                await player.draw(2);
                await player.recover();
                game.log(target, '失去了技能', '【' + get.translation(link) + '】');
                return;
            }
            const link = await pickSkill(gainList, '鬼躯：请选择要获得并移除的1个技能');
            if (!link) return;
            await player.addSkills(link);
            target.popup(link);
            await target.removeSkills(link);
            game.log(target, '失去了技能', '【' + get.translation(link) + '】');
        },
        getBestSkill(lists) {
            //无论“移除”还是“获得并移除”，都优先挑对方最强的技能
            const rank = skill => get.skillRank(skill, 'in') + get.skillRank(skill, 'out');
            const sorted = lists.slice().sort((a, b) => rank(b) - rank(a));
            return sorted[0] || lists.randomGet();
        },
        group: ['zshy_YJguiqu_effect'],
        subSkill: {
            effect: {
                superCharlotte: true,
                charlotte: true,
                forced: true,
                fixed: true,
                trigger: { player: 'useCardToPlayered' },
                popup: false,
                logTarget: 'target',
                filter(event, player) {
                    return player.maxHp >= event.target.maxHp;
                },
                async content(event, trigger, player) {
                    game.log(trigger.target, '不能响应', trigger.card);
                    trigger.directHit.push(trigger.target);
                },
            },
        },
    },
    zshy_YJguiyan: {//鬼眼
        NihilismSkill: true,
        forced: true,
        trigger: {
            player: ['gainMaxHpEnd'],
        },
        filter(event, player) {
            return player.maxHp > 10;
        },
        async content(event, trigger, player) {
            await player.die();
        },
        group: ['zshy_YJguiyan_dying', 'zshy_YJguiyan_HaveLook'],
        subSkill: {
            dying: {
                NihilismSkill: true,
                forced: true,
                trigger: {
                    player: 'dying',
                },
                async content(event, trigger, player) {
                    trigger.cancel();
                    await player.gainMaxHp();
                    await player.recoverTo(1);
                    if (trigger.source && trigger.source != player) {
                        await trigger.source.damage(player.maxHp);
                    }
                },
                mod: {
                    aiOrder(player, card, num) {
                        if (get.tag(card, 'multitarget')) {
                            if (player.countCards('h', { type: 'basic' })) {
                                return num / 10;
                            }
                            return num * 10;
                        }
                        if (get.type(card) === 'basic') {
                            return num + 10;
                        }
                    },
                    aiValue(player, card, num) {
                        if (['shan', 'tao', 'jiu'].includes(card.name)) {
                            if (player.countCards('hs') > 1) {
                                return 0.01;
                            }
                            return num / 2;
                        }
                        if (get.tag(card, 'multitarget')) {
                            return num + game.players.length;
                        }
                    },
                    aiUseful(player, card, num) {
                        if (card.name === 'zhangba') {
                            return 114514;
                        }
                        if (get.name(card, player) === 'shan') {
                            if (
                                player.countCards('hs', i => {
                                    if (card === i || (card.cards && card.cards.includes(i))) {
                                        return false;
                                    }
                                    return get.name(i, player) === 'shan';
                                })
                            ) {
                                return -1;
                            }
                            return num / Math.pow(Math.max(1, player.hp), 2);
                        }
                    },
                },
            },
            HaveLook: {
                NihilismSkill: true,
                forced: true,
                trigger: {
                    global: 'phaseBefore',
                    player: 'enterGame',
                },
                firstDo: true,
                filter(event, player) {
                    return !player.hasSkill('zshy_YJguiyan_Look');
                },
                async content(event, trigger, player) {
                    player.addSkill('zshy_YJguiyan_Look');
                    //体力上限走gain/loseMaxHp事件链，直接赋值会绕过所有maxHp变动触发
                    if (player.maxHp > 1) {
                        await player.loseMaxHp(player.maxHp - 1);
                    } else if (player.maxHp < 1) {
                        await player.gainMaxHp(1 - player.maxHp);
                    }
                    if (player.hp > player.maxHp) {
                        player.hp = player.maxHp;
                    }
                },
                mod: {
                    maxHandcard(player, num) {
                        return num += player.maxHp;
                    },
                },
            },
            Look: {
                superCharlotte: true,
                charlotte: true,
                forced: true,
                fixed: true,
                mark: true,
                marktext: '鬼眼',
                intro: {
                    mark(dialog, content, player) {
                        if (player != game.me) return '۩' + get.translation(player) + '观看牌堆中';
                        var list = [];
                        var num1 = Math.min(player.maxHp, ui.cardPile.childElementCount);
                        for (var i = 0; i < num1; i++) {
                            list.push(ui.cardPile.childNodes[i]);
                        }
                        dialog.addSmall(list);
                    },
                },
            },
        },
    },

    //异乡人
    zshy_YXRxueyuan: {//血源
        NihilismSkill: true,
        forced: true,
        trigger: {
            player: ['loseHpBefore', 'loseMaxHpBefore'],
        },
        derivation: ['zshy_YXRxuezhou'],
        global: 'zshy_YXRxuezhou',
        async content(event, trigger, player) {
            trigger.cancel()
        },
        ai: {
            //失去体力/上限会被直接取消，属于「打不死」类型
            maixie_hp: true,
            filterDamage: true,
            effect: {
                target(card, player, target, current) {
                    if (player.hasSkillTag('jueqing', false, target)) return 0;
                    if (get.tag(card, 'loseHp')) return 0;
                },
            },
        },
    },
    zshy_YXRlieshen: {//猎神
        NihilismSkill: true,
        forced: true,
        trigger: {
            global: 'dieBegin',
        },
        direct: true,
        filter(event, player) {
            return event.player != player;
        },
        async content(event, trigger, player) {
            const list = [];
            const skills = trigger.player.getSkills(true, false).filter(skill => {
                if (skill == 'jiu') return false;
                if (skill == 'zshy_YXRxuezhou') return false;
                if (player.hasSkill(skill)) return false;
                if (!lib.translate[skill + '_info']) return false;
                if (lib.translate[skill + '_info'] == '') return false;
                const info = get.info(skill);
                if (!info) return false;
                return true;
            });
            if (!skills.length) {
                event.finish();
                return;
            }
            else {
                for (const skill of skills) {
                    list.push([skill,
                        '<div class="popup text" style="width:calc(100%-10px);display:inline-block"><div class="skill">【' +
                        get.translation(skill) + '】</div><div>' + lib.translate[skill + '_info'] + '</div></div>',
                    ])
                }
                const result = await player.chooseButton(['猎神：请选择获得任意个技能', [list, 'textbutton']])
                    .set('forced', false).set('selectButton', [0, skills.length]).set('ai', function (button) {
                        //白拿技能，按价值从高到低全拿
                        return get.skillRank(button.link, 'in') + get.skillRank(button.link, 'out') + 1;
                    }).set('skills', skills).forResult();
                if (result && result.bool) {
                    const skills = result.links;
                    player.logSkill('zshy_YXRlieshen', trigger.player);
                    await player.addSkills(skills.slice(0));
                    game.log(player, '获得了以下技能：', '#g' + get.translation(skills));
                    await player.gainMaxHp();
                    await player.recover();
                }
            }
        },
    },
    zshy_YXRxunying: {//迅影*
        NihilismSkill: true,
        trigger: {
            target: 'useCardToTargeted',
        },
        usable(event, player) {
            return player.maxHp;
        },
        check(event, player) {
            //以我的立场判断：这张牌是否对我不利
            return get.effect(player, event.card, event.player, player) < 0;
        },
        filter(event, player) {
            return event.player != player;
        },
        'prompt2'(event, player) {
            return '令' + get.translation(event.card) + '对你无效，然后回复1点体力或摸一张牌';
        },
        async content(event, trigger, player) {
            await trigger.excluded.push(player);
            await player.chooseDrawRecover(player.maxHp, true);
        },
        mod: {
            aiOrder(player, card, num) {
                if (get.tag(card, 'multitarget')) {
                    if (player.countCards('h', { type: 'basic' })) {
                        return num / 10;
                    }
                    return num * 10;
                }
                if (get.type(card) === 'basic') {
                    return num + 10;
                }
            },
            aiValue(player, card, num) {
                if (['shan', 'tao', 'jiu'].includes(card.name)) {
                    if (player.countCards('hs') > 1) {
                        return 0.01;
                    }
                    return num / 2;
                }
                if (get.tag(card, 'multitarget')) {
                    return num + game.players.length;
                }
            },
            aiUseful(player, card, num) {
                if (get.name(card, player) === 'shan') {
                    if (
                        player.countCards('hs', i => {
                            if (card === i || (card.cards && card.cards.includes(i))) {
                                return false;
                            }
                            return get.name(i, player) === 'shan';
                        })
                    ) {
                        return -1;
                    }
                    return num / Math.pow(Math.max(1, player.hp), 2);
                }
            },
        },
    },
    zshy_YXRxuezhou: {//血咒
        superCharlotte: true,
        charlotte: true,
        forced: true,
        fixed: true,
        trigger: {
            player: ['phaseZhunbeiBegin', 'recoverEnd'],
        },
        async content(event, trigger, player) {
            await player.loseMaxHp();
        },
        mark: true,
        marktext: '血咒',
        intro: {
            content: '受到鲜血的诅咒，时日无多……',
        },
    },

    //天选之子
    zshy_TXZZkuruo: {//哭弱
        trigger: {
            player: 'damageBefore',
        },
        NihilismSkill: true,
        filter(event, player) {
            //无来源伤害也要能发动，避免读取 undefined
            return !!event.source && event.source.hp > player.hp;
        },
        prompt2(event, player) {
            return '防止本次伤害，然后回复1点体力或摸一张牌';
        },
        check(event, player) {
            return get.damageEffect(player, event.source, player) < 0;
        },
        async content(event, trigger, player) {
            trigger.cancel();
            player.chat([
                '阴418了！',
                '这……这不对吧！',
                '这对吗？',
            ].randomGet());
            await player.chooseDrawRecover(true);
        },
    },
    zshy_TXZZxueqiang: {//削强
        trigger: {
            global: 'phaseUseEnd',
        },
        NihilismSkill: true,
        prompt2(event, player) {
            return '替换' + get.translation(event.player) + '的1个技能';
        },
        check(event, player) {
            return get.attitude(player, event.player) < 0;
        },
        async content(event, trigger, player) {
            player.chat([
                '太阴了！削弱！',
                '桀桀桀，能造成伤害还是太强辣！',
                '最重要的就是设计思路！设计思路你懂嘛！',
            ].randomGet());
            const candidates = trigger.player.getSkills(true, false).filter(skill => {
                if (skill == 'jiu') return false;
                if (!lib.translate[skill + '_info']) return false;
                if (lib.translate[skill + '_info'] == '') return false;
                var info = get.info(skill);
                if (!info) return false;
                return true;
            });
            if (!candidates.length) return;
            //削强：优先削掉对方最强的技能
            const rank = skill => get.skillRank(skill, 'in') + get.skillRank(skill, 'out');
            const skill1 = candidates.slice().sort((a, b) => rank(b) - rank(a))[0];
            var list = [];
            for (var i in lib.character) {
                if (NihilismShouldSkipCharacter(lib.character[i])) continue;
                var skills = NihilismSkillList(lib.character[i]);
                for (var j = 0; j < skills.length; j++) {
                    var info = lib.skill[skills[j]];
                    if (info && !info.silent) list.add(skills[j]);
                }
            }
            var skill2 = list.randomGet();
            if (!skill2) return;
            await trigger.player.changeSkills([skill2], [skill1]);
        },
    },
};
const Vsinger = {
    zshy_Vsingertianlai: {//天籁
        trigger: {
            global: ['phaseJieshuBegin'],
        },
        NihilismSkill: true,
        clanSkill: true,
        lastDo: true,
        forced: true,
        filter(event, player) {
            return player.countMark('zshy_Vsingertianlai_Mark') > 0;
        },
        async content(event, trigger, player) {
            const str = `移除任意枚「天籁」并选择等量Vsinger角色，令其依次增加1点体力上限，回复1点体力或摸两张牌`;
            const result = await player.chooseTarget(get.prompt('zshy_Vsingertianlai'), str, [1, player.countMark('zshy_Vsingertianlai_Mark')], function (card, player, target) {
                return target == player || target.hasClan('Vsinger');
            }).set('ai', function (target) {
                const att = get.attitude(_status.event.player, target);
                if (att <= 0) return 0;
                //优先给自己或受伤的队友
                return att + (target.hp < target.maxHp ? 1 : 0);
            }).forResult()
            if (result && result.targets) {
                await player.removeMark('zshy_Vsingertianlai_Mark', result.targets.length);
                const targets = result.targets.sortBySeat();
                for (const i of targets) {
                    await i.gainMaxHp();
                    await i.chooseDrawRecover(2, true);
                };
            }
        },
        group: ['zshy_Vsingertianlai_Mark'],
        subSkill: {
            Mark: {
                charlotte: true,
                onremove: true,
                marktext: '天籁',
                intro: {
                    content: '<li>一起歌唱吧~',
                },
            },
        },
    },
    //洛天依
    zshy_LTYchihuo: {//吃货
        trigger: {
            player: ['useCard', 'respond'],
        },
        NihilismSkill: true,
        forced: true,
        filter(event, player) {
            return get.type(event.card) == 'basic';
        },
        async content(event, trigger, player) {
            if (player.isDamaged()) {
                await player.recover();
            }
            else {
                await player.changeHujia();
            }
        },
    },
    zshy_LTYxiediao: {//谐调
        trigger: {
            global: ['changeHp'],
        },
        NihilismSkill: true,
        forced: true,
        direct: true,
        filter(event, player, name) {
            if (event.player == player && !event.player.isIn()) {
                return false;
            }
            return event.player.countCards('h') != player.countCards('h') || event.player.hp != player.hp;
        },
        async content(event, trigger, player) {
            let ths = trigger.player.countCards('h');
            let phs = player.countCards('h');
            let num = Math.abs(ths - phs);
            if (ths != phs && trigger.player.isIn()) {
                let str = '谐调：是否令' + get.translation(trigger.player);
                if (ths > phs) {
                    str += `弃置${num}张牌`;
                } else {
                    str += `摸${num}张牌`;
                };
                const result = await player.chooseBool().set('prompt', str)
                    .set('ai', function () {
                        if (ths > phs) {
                            if (num * get.effect(trigger.player, { name: 'guohe_copy2' }, player, player) > 0) {
                                return true;
                            }
                            return false;
                        } else {
                            if (num * get.effect(trigger.player, { name: 'draw' }, player, player) > 0) {
                                return true;
                            };
                            return false;
                        }
                    }).forResult();
                if (result && result.bool) {
                    player.logSkill('zshy_LTYxiediao', trigger.player);
                    if (ths > phs) {
                        await trigger.player.chooseToDiscard('h', num, true);
                    } else {
                        await trigger.player.drawTo(phs);
                    }
                };
            }
            let thp = trigger.player.hp;
            let php = player.hp;
            let num1 = Math.abs(thp - php);
            if ((thp > php || (php > thp && trigger.player.isDamaged())) && trigger.player.isIn()) {
                let str1 = '谐调：是否令' + get.translation(trigger.player);
                if (thp > php) {
                    str1 += `失去${num1}点体力`;
                } else {
                    if (num1 > trigger.player.getDamagedHp()) {
                        str1 += `回复${trigger.player.getDamagedHp()}点体力`;
                    } else {
                        str1 += `回复${num1}点体力`;
                    }
                };
                const result1 = await player.chooseBool().set('prompt', str1)
                    .set('ai', function () {
                        if (thp > php) {
                            if (num1 * get.effect(trigger.player, { name: 'losehp' }, player, player) > 0) {
                                return true;
                            }
                            return false;
                        } else {
                            if (num1 * get.recoverEffect(trigger.player, player, player) > 0) {
                                return true;
                            };
                            return false;
                        }
                    }).forResult();
                if (result1 && result1.bool) {
                    player.logSkill('zshy_LTYxiediao', trigger.player);
                    if (thp > php) {
                        await trigger.player.loseHp(num1);
                    } else {
                        await trigger.player.recoverTo(player.hp);
                    }
                }
            }
        },
        ai: {
            threaten: 5,
        },
    },
    zshy_LTYgongming: {//共鸣
        trigger: {
            player: ['changeHp', 'useCard', 'respond'],
        },
        NihilismSkill: true,
        frequent: true,
        prompt2(event, player) {
            if (player.isMaxHp() && player.isMaxHandcard()) {
                return '获得1枚「天籁」';
            };
            let str = '';
            if (!player.isMaxHandcard()) {
                str += `将手牌摸至全场最多`;
            }
            if (!player.isMaxHandcard() && !player.isMaxHp()) {
                str += `或`;
            }
            if (!player.isMaxHp()) {
                str += `将体力回复至全场最大`;
            }
            return str;
        },
        async content(event, trigger, player) {
            if (player.isMaxHp() && player.isMaxHandcard()) {
                player.addMark('zshy_Vsingertianlai_Mark', 1);
            } else {
                if (!player.isMaxHandcard() && (player.isMaxHp() || player.isHealthy())) {
                    var num = 0;
                    game.countPlayer(function (current) {
                        var num2 = current.countCards('h');
                        if (num2 > num) num = num2;
                    });
                    await player.drawTo(num);
                }
                else if (!player.isMaxHp() && player.isMaxHandcard()) {
                    var num = 0;
                    game.countPlayer(function (current) {
                        var num2 = current.hp;
                        if (num2 > num) num = num2;
                    });
                    await player.recoverTo(num);
                } else {
                    let fateOptions = [
                        '将手牌摸至最多',
                        '回复体力至最大',
                    ];
                    let buttons = fateOptions.map((option, index) => [index + 1,
                    '<div class="popup text" style="width:calc(100% - 10px);display:inline-block"><div>' + option + '</div></div>'
                    ]);
                    const result = await player.chooseButton(['共鸣：选择一项执行', [buttons, 'textbutton']], null)
                        .set('selectButton', 1)
                        .set('forced', true)
                        .set('ai', function () {
                            if (player.isDamaged()) return 2;
                            else return 1;
                        }).forResult();
                    if (result.bool) {
                        const selectedIndex = result.links[0];
                        switch (selectedIndex) {
                            case 1:
                                var num = 0;
                                game.countPlayer(function (current) {
                                    var num2 = current.countCards('h');
                                    if (num2 > num) num = num2;
                                });
                                await player.drawTo(num);
                                break;
                            case 2:
                                var num = 0;
                                game.countPlayer(function (current) {
                                    var num2 = current.hp;
                                    if (num2 > num) num = num2;
                                });
                                await player.recoverTo(num);
                                break;
                            default:
                                break;
                        }
                    }
                }
            }
        },
        ai: {
            noh(player, card) {
                return !player.isMaxHandcard();
            },
            effect: {
                target(card, player, target) {
                    if (!target.isMaxHp() && get.tag(card, 'damage')) {
                        return [0, 1];
                    }
                },
            },
        },
    },

    //言和
    zshy_YHfengsu: {//风速
        trigger: {
            global: 'phaseEnd',
            player: 'damageEnd',
        },
        NihilismSkill: true,
        forced: true,
        filter(event, player) {
            if (event.name == 'damage') {
                return true;
            }
            return event.player != player;
        },
        async content(event, trigger, player) {
            if (event.triggername == 'damageEnd') {
                let next = player.phaseUse();
                event.next.remove(next);
                trigger.next.push(next);
            }
            player.insertPhase();
        },
    },
    zshy_YHtiaolv: {//调律
        trigger: {
            player: ['phaseJieshuBegin'],
        },
        NihilismSkill: true,
        filter(event, player) {
            return game.countPlayer(function (target) {
                return player.countCards('h') >= target.countCards('h') && target != player;
            }) > 0;
        },
        async cost(event, trigger, player) {
            const str = '选择一名手牌数不大于你的其他角色，然后将任意张牌交给其。最后若你与其手牌相等，你回复1点体力';
            event.result = await player.chooseTarget(get.prompt('zshy_YHtiaolv'), str, function (card, player, target) {
                return player.countCards('h') >= target.countCards('h') && target != player;
            }).set('ai', function (target) {
                const att = get.attitude(_status.event.player, target);
                if (att <= 0) return 0;
                //队友手牌越少，越容易把双方手牌凑平
                return att + (player.countCards('h') - target.countCards('h'));
            }).forResult();
        },
        async content(event, trigger, player) {
            const target = event.targets[0];
            if (!target) return;
            //给出的张数决定双方手牌是否相等：diff 张差距需要交出 ceil(diff/2) 张
            const diff = player.countCards('h') - target.countCards('h');
            const num = Math.max(1, Math.ceil(diff / 2));
            const next = player.chooseCard('选择任意张牌，然后交给' + get.translation(target), 'h', [1, Infinity])
                .set('ai', function (card) {
                    return 7 - get.value(card);
                });
            if (!player.isUnderControl()) {
                //AI 只交出刚好凑平的张数，避免把整手牌送出去
                next.set('selectCard', [num, num]);
            }
            const result1 = await next.forResult();
            if (result1 && result1.cards) {
                await target.gain(result1.cards, 'giveAuto');
            }
            if (target.countCards('h') == player.countCards('h')) {
                await player.recover();
            }
        },
    },
    zshy_YHgongming: {//共鸣
        trigger: {
            player: ['changeHp', 'useCard', 'respond'],
        },
        NihilismSkill: true,
        frequent: true,
        prompt2(event, player) {
            if (player.isMaxHp() && player.isMaxHandcard()) {
                return '获得1枚「天籁」';
            };
            if (!player.isMaxHandcard()) {
                return `将手牌摸至全场最多`;
            }
        },
        filter(event, player) {
            return (player.isMaxHp() && player.isMaxHandcard()) || !player.isMaxHandcard();
        },
        async content(event, trigger, player) {
            if (player.isMaxHp() && player.isMaxHandcard()) {
                player.addMark('zshy_Vsingertianlai_Mark', 1);
            }
            if (!player.isMaxHandcard()) {
                var num = 0;
                game.countPlayer(function (current) {
                    var num2 = current.countCards('h');
                    if (num2 > num) num = num2;
                });
                await player.drawTo(num);
            };
        },
        ai: {
            noh(player, card) {
                return !player.isMaxHandcard();
            },
        },
    },

    //乐正绫
    zshy_YZLfenyin: {//焚音
        trigger: {
            target: ['useCardToTargeted'],
        },
        NihilismSkill: true,
        filter(event, player) {
            return event.player != player;
        },
        prompt2(event, player) {
            return '对' + get.translation(event.player) + '造成1点火焰伤害';
        },
        check(event, player) {
            return get.damageEffect(event.player, player, player, 'fire') > 0;
        },
        logTarget(event, player) {
            return event.player;
        },
        async content(event, trigger, player) {
            await trigger.player.damage('fire');
        },
        ai: {
            directHit: true,
            directHit_ai: true,
        },
    },
    zshy_YZLjingxian: {//惊弦
        enable: 'phaseUse',
        NihilismSkill: true,
        filterTarget(event, player, target) {
            return target != player && target.countCards('h') >= player.countCards('h') && target.countCards('h') != 0;
        },
        selectTarget: [1, Infinity],
        filter(event, player) {
            return game.countPlayer(function (target) {
                return target.countCards('h') >= player.countCards('h') && target != player && target.countCards('h') != 0;
            }) > 0;
        },
        prompt(event, player) {
            return '出牌阶段，你可弃置任意名手牌数不小于你的角色的一张手牌，若弃置的牌为伤害牌，则你对其造成1点火焰伤害';
        },
        async content(event, trigger, player) {
            //该技能是多目标：selectTarget为[1, Infinity]，必须遍历event.targets
            const targets = (event.targets || []).slice().sort((a, b) => {
                const ea = get.damageEffect(a, player, player, 'fire');
                const eb = get.damageEffect(b, player, player, 'fire');
                return eb - ea;
            });
            for (const target of targets) {
                if (!target || !target.isIn()) continue;
                const result = await player.discardPlayerCard(target, 'h', true).forResult();
                if (!result?.cards || !result.cards.length) continue;
                if (result.cards.some(i => get.tag(i, 'damage') > 0.5)) {
                    await target.damage('fire');
                };
            };
        },
        ai: {
            order: 9,
            result: {
                target(player, target) {
                    const att = get.attitude(player, target);
                    if (att > 0 || target.hasSkillTag('nofire')) {
                        return 0;
                    };
                    return -1;
                },
            },
        },
    },
    zshy_YZLgongming: {//共鸣
        trigger: {
            player: ['changeHp', 'useCard', 'respond'],
        },
        NihilismSkill: true,
        frequent: true,
        prompt2(event, player) {
            if (player.isMaxHp() && player.isMaxHandcard()) {
                return '获得1枚「天籁」';
            };
            if (!player.isMaxHp()) {
                return `将体力回复至全场最大`;
            };
        },
        filter(event, player) {
            return (player.isMaxHp() && player.isMaxHandcard()) || !player.isMaxHp();
        },
        async content(event, trigger, player) {
            if (player.isMaxHp() && player.isMaxHandcard()) {
                player.addMark('zshy_Vsingertianlai_Mark', 1);
            }
            if (!player.isMaxHp()) {
                var num = 0;
                game.countPlayer(function (current) {
                    var num2 = current.hp;
                    if (num2 > num) num = num2;
                });
                await player.recoverTo(num);
            }
        },
        ai: {
            effect: {
                target(card, player, target) {
                    if (!target.isMaxHp() && get.tag(card, 'damage')) {
                        return [0, 1];
                    }
                },
            },
        },
    },
};
const SlayTheSpire = {
    zshy_Sjibu: {//疾步
        enable: `phaseUse`,
        filterCard: true,
        selectCard: [1, Infinity],
        position: `he`,
        check(card) {
            //AI：弃置 sha+1 张最便宜的牌 → 摸 1 张，把 sha 张牌换成 sha 点出杀次数
            const player = _status.event.player;
            const selected = ui.selected.cards || [];
            if (selected.includes(card)) return -1;
            //【杀】要留着：弃掉反而少换出杀次数
            if (get.name(card) == 'sha') return -1;
            const sha = player.countCards('he', cardx => get.name(cardx) == 'sha');
            //手里没【杀】可配，或出杀次数已经够用：不发动
            if (sha <= 0) return -1;
            if (player.countMark('zshy_Sjibu_Mark') >= sha) return -1;
            const pool = player.getCards('he').filter(cardx => !selected.includes(cardx) && get.name(cardx) != 'sha');
            const need = Math.min(pool.length, sha + 1);
            const remain = need - selected.length;
            if (remain <= 0) return -1;
            pool.sort((a, b) => get.value(a) - get.value(b));
            if (pool.slice(0, remain).includes(card)) return 1;
            return -1;
        },
        filter(event, player) {
            return player.countCards(`he`) > 0;
        },
        async content(event, trigger, player) {
            player.addTempSkill('zshy_Sjibu_Mark');
            const cardsnum = event.cards.length;
            const result = await player
                .chooseNumbers(get.prompt(event.skill), [
                    {
                        prompt: '选择你摸的牌数',
                        min: 1,
                        max: cardsnum,
                    },
                ])
                .set('processAI', () => {
                    //手里的【杀】越多，越应该把弃牌换成「疾」而不是摸牌
                    const sha = player.countCards('he', card => card.name == 'sha');
                    let num = Math.max(1, Math.min(cardsnum, cardsnum - sha));
                    return [num];
                })
                .forResult();
            if (result?.numbers?.[0] > 0) {
                const number = result.numbers[0];
                await player.draw(number);
                const num = cardsnum - number;
                if (num > 0) {
                    await player.addMark('zshy_Sjibu_Mark', num, false);
                };
            }
            else {
                await player.addMark('zshy_Sjibu_Mark', cardsnum, false);
            };
        },
        mod: {
            aiOrder(player, card, num) {
                if (num <= 0 || get.itemtype(card) !== 'card' || get.type(card) !== 'equip') {
                    return num;
                }
                let eq = player.getEquip(get.subtype(card));
                if (eq && get.equipValue(card) - get.equipValue(eq) < Math.max(1.2, 6 - player.hp)) {
                    return 0;
                }
            },
        },
        ai: {
            order: 1,
            result: {
                player: 1,
            },
            threaten: 1.5,
        },
        subSkill: {
            Mark: {
                marktext: `疾`,
                intro: {
                    content: `出杀次数+#`,
                },
                mod: {
                    cardUsable(card, player, num) {
                        if (card.name == 'sha') {
                            return num + player.countMark('zshy_Sjibu_Mark');
                        };
                        return num;
                    },
                },
            },
        },
    },
};
const skill = {
    ...远古遗神, ...江山多殇, ...异界来客, ...Vsinger, ...SlayTheSpire,
};
export default skill;
