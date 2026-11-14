import { lib, game, ui, get, ai, _status } from '../../../../noname.js'
import { getBaseName, refreshNameLibrary } from '../../extension/name-library.js';
import { chooseCharacterConfirmed, requireCharacterConfirmation } from '../../extension/characterSelection.js';
// 运行时牌池缓存与受保护的技能定义分离，避免把规则定义当作可变存储。
let yicePoolCache = null;
let huashenPoolCache = null;
const 光阴长河 = {
    zshy_jinmie: {//烬灭
        audio: 'ext:诸神寰宇/audio/character:1',
        audioname2: {
            zshy_AAYAcaopi: 'zshy_jinmie_zshy_AAYAcaopi',
        },
        NihilismSkill: true,
        trigger: {
            target: 'useCardToTargeted',
            player: ['loseMaxHpBegin', 'turnOverBegin'],
        },
        check(event, player, name) {
            if (name == 'useCardToTargeted') {
                if (event.player == player) return false;
                //以「我」为立场评估这张牌：对我明显有利时才放它过去（抵消本身还白拿一张牌）
                if (get.effect(player, event.card, event.player, player) > 0.5) return false;
                //【影幕】已能处理黑色牌/锦囊牌时交给影幕，避免重复弹窗
                if (player.hasSkill('zshy_yingmu') && (get.type2(event.card) == 'trick' || get.color(event.card) == 'black')) return false;
                return true;
            };
            return true;
        },
        filter(event, player, name) {
            if (name == 'loseMaxHpBegin' || name == 'turnOverBegin') {
                return true;
            }
            return event.player != player;
        },
        prompt2(event, player, name) {
            let str = `你展示牌顶一张牌并获得之，若结果不为黑桃，则你`;
            if (name == 'useCardToTargeted') {
                return str += `令${get.translation(event.card)}对你无效。`
            };
            return str += `防止之。`;
        },
        async content(event, trigger, player) {
            let card = get.cards()[0];
            await player.showCards(card, '烬灭')
            await player.gain(card, 'gain2');
            if (get.suit(card) != 'spade') {
                if (event.triggername == 'useCardToTargeted') {
                    trigger.excluded.push(player);
                } else {
                    trigger.cancel();
                }
            };
        },
        mod: {
            //①你使用或打出的牌无距离与次数限制
            targetInRange() {
                return true;
            },
            cardUsable() {
                return Infinity;
            },
        },
        ai: {
            freeShan: true,
            noturn: true,
            noTurnover: true,
            effect: {
                target(card, player, target) {
                    //除黑桃外即可无条件抵消，伤害牌与锦囊牌对【烬灭】持有者的价值都要打折
                    if (get.tag(card, 'damage')) return 0.5;
                    if (get.type2(card) == 'trick' || get.type(card) == 'delay') return 0.5;
                },
            },
        },
    },

    //烬曹丕
    zshy_jinmie_zshy_AAYAcaopi: {//烬灭
        audio: 'ext:诸神寰宇/audio/character:1',
    },
    zshy_shenzhu: {//神逐
        audio: 'ext:诸神寰宇/audio/character:2',
        NihilismSkill: true,
        trigger: {
            global: `phaseZhunbeiBegin`,
            player: `damageEnd`,
        },
        filter(event, player, name) {
            //受到伤害后必须存在伤害来源才可发动
            if (name == 'damageEnd') return !!event.source;
            return true;
        },
        async cost(event, trigger, player) {
            let target;
            if (event.triggername == 'damageEnd') {
                //受到伤害后，目标固定为伤害来源，无需选择
                target = trigger.source;
                if (!target) {
                    event.result = { bool: false };
                    return;
                }
            } else {
                const resulttarget = await player.chooseTarget(get.prompt(event.skill), `选择一名角色，然后令其执行一项`)
                    .set('ai', function (target) {
                        const player = _status.event.player;
                        const att = get.attitude(player, target);
                        if (att > 0) {
                            //队友：只有在能为其解开翻面时才有价值
                            return target.isTurnedOver() ? 1.2 : 0.4;
                        }
                        //敌人：威胁越大（手牌多、体力高）越优先
                        return (1 - att / 2) * (1 + Math.min(target.countCards('h'), 6) / 10);
                    }).forResult()
                if (!resulttarget?.bool || !resulttarget.targets?.length) {
                    event.result = { bool: false };
                    return;
                }
                target = resulttarget.targets[0];
            }
            //选项改为对话框内的按钮，直接点击选择
            const options = [
                '不能打出手牌至本轮结束',
                '武将技能失效至本轮结束',
                '将武将牌翻面',
                '回复1点体力或摸一张牌',
            ];
            const list = options.map((text, i) => {
                const link = '选项' + get.cnNumber(i + 1, true);
                return [link, `<div class="popup text" style="width:calc(100% - 10px);display:inline-block"><div class="skill">${link}</div><div>${text}</div></div>`];
            });
            const result = await player.chooseButton([`【${get.translation('zshy_shenzhu')}】请选择一项令${get.translation(target)}执行`, [list, 'textbutton']])
                .set('selectButton', 1)
                .set('ai', function (button) {
                    let index = lib.skill.zshy_shenzhu.chooseOption(_status.event.player, target);
                    if (typeof index !== 'number') index = 0;
                    return button.link == '选项' + get.cnNumber(index + 1, true) ? 1 : 0;
                }).forResult();
            if (!result?.bool || !result.links?.length) {
                event.result = { bool: false };
                return;
            }
            event.result = {
                bool: true,
                targets: [target],
                cost_data: result.links[0],
            };
        },
        chooseOption(player, target) {
            const att = get.attitude(player, target);
            if (att > 0) {
                //队友：翻面状态下翻回来，否则令其摸一张牌或回复
                return target.isTurnedOver() ? 2 : 3;
            }
            const canTurn = !target.isTurnedOver() && !target.hasSkillTag('noturn');
            const isCurrent = _status.currentPhase == target;
            const hand = target.countCards('h');
            //统计其可被禁用的主动技能数，判断封技能是否划算
            const skills = target.getSkills().filter(skill => {
                const info = get.info(skill);
                if (!info) return false;
                if (info.charlotte || info.superCharlotte || info.locked) return false;
                return !!lib.translate[skill + '_info'];
            });
            if (isCurrent) {
                //正在行动的敌人：封手牌或封技能能直接掐掉其本回合
                if (canTurn && hand <= 2 && skills.length <= 1) return 2;
                if (hand >= 3 && hand >= skills.length + 1) return 0;
                if (skills.length) return 1;
                if (canTurn) return 2;
                return 0;
            }
            //不在行动中的敌人：翻面令其少一个回合，通常收益最大
            if (canTurn) return 2;
            if (hand >= 3) return 0;
            if (skills.length) return 1;
            return 0;
        },
        async content(event, trigger, player) {
            switch (event.cost_data) {
                case '选项一':
                    await event.targets[0].addTempSkill('zshy_shenzhu_ban', { global: 'roundEnd' });
                    break;
                case '选项二':
                    const skills = event.targets[0].getSkills();
                    await event.targets[0].tempBanSkill(skills, { global: 'roundEnd' });
                    break;
                case '选项三':
                    await event.targets[0].turnOver();
                    break;
                case '选项四':
                    await event.targets[0].chooseDrawRecover(true);
                    break;
                default:
                    break;
            }
        },
        getIndex(event) {
            return event.num || 1;
        },
        subSkill: {
            ban: {
                forced: true,
                charlotte: true,
                mark: true,
                mod: {
                    cardEnabled2(card) {
                        if (get.position(card) == 'h') return false;
                    },
                    cardEnabled(card) {
                        if (get.position(card) == 'h') return false;
                    },
                },
                intro: {
                    content: '不能使用或打出手牌',
                },
            },
        },
    },
    zshy_zangshang: {//葬殇
        audio: 'ext:诸神寰宇/audio/character:2',
        NihilismSkill: true,
        trigger: {
            global: [`die`, 'damageEnd'],
        },
        forced: true,
        filter(event, player) {
            return event.player != player;
        },
        async content(event, trigger, player) {
            if (event.triggername == 'die') {
                await player.recover();
                let list = [];
                let skills = trigger.player.getOriginalSkills();
                if (skills.length) {
                    for (const skill of skills) {
                        list.push([skill, '<div class="popup text" style="width:calc(100% - 10px);display:inline-block"><div class="skill">【' +
                            get.translation(skill) + '】</div><div>' + lib.translate[skill + '_info'] + '</div></div>',
                        ])
                    };
                    const result = await player.chooseButton([
                        `葬殇：请选择要获得的技能`,
                        [list, 'textbutton'],
                    ])
                        .set('forced', false)
                        .set('selectButton', [1, Infinity])
                        .set('ai', function (button) {
                            //按技能实用度选择，主动技与稳定收益的触发技优先
                            const skill = button.link;
                            const info = get.info(skill);
                            if (!info) return 0;
                            if (info.ai && (info.ai.neg || info.ai.halfneg)) return 0;
                            let rank = get.skillRank(skill, 'in') + get.skillRank(skill, 'out');
                            if (info.enable === 'phaseUse') rank += 0.5;
                            if (info.forced) rank += 0.3;
                            if (!lib.translate[skill + '_info']) rank -= 1;
                            return rank;
                        })
                        .set('skills', skills).forResult();
                    if (result?.bool) {
                        let skill = result.links;
                        player.addSkillLog(skill);
                    }
                };
                if (trigger.player.countCards('hej') > 0) {
                    await player.gain(trigger.player.getCards('hej'), trigger.player, 'giveAuto');
                };
                let next = player.phaseUse();
                event.next.remove(next);
                trigger.next.push(next);
            } else {
                if (player.isDamaged()) {
                    const result = await player.chooseControl(['增加上限', '回复体力'])
                        .set('prompt', `【葬殇】请选择一项`)
                        .set('prompt2', `选择增加1点体力上限或回复1点体力`)
                        .set('ai', function () {
                            const player = _status.event.player;
                            //体力越低越要先回复，满体力时才增加上限
                            if (player.hp <= 1 || player.hp < player.maxHp - 1) return '回复体力';
                            return player.maxHp >= 5 ? '回复体力' : '增加上限';
                        }).forResult();
                    if (result?.control == '增加上限') {
                        await player.gainMaxHp();
                    } else {
                        await player.recover();
                    }
                } else {
                    await player.gainMaxHp();
                };
            }
        },
        getIndex(event, player) {
            return event.num || 1;
        },
    },
    zshy_junwei: {//君威
        audio: 'ext:诸神寰宇/audio/character:2',
        NihilismSkill: true,
        trigger: {
            global: `useCard`,
        },
        filter(event, player) {
            //与cost里的弃牌范围保持一致（手牌或装备区），否则装备区有同名牌时无法发动
            return event.player != player && player.countCards('he', function (card) {
                return get.name(card) == get.name(event.card);
            }) > 0;
        },
        async cost(event, trigger, player) {
            const str = `弃置一张与${get.translation(trigger.card)}同名的牌，令${get.translation(trigger.card)}失效，然后你回复1点体力或摸一张牌`;
            event.result = await player.chooseToDiscard(get.prompt('zshy_junwei'), str, 'he', function (card, player, target) {
                return get.name(card) == get.name(trigger.card);
            }).set('ai', function (card) {
                const worth = lib.skill.zshy_junwei.getWorth(trigger, player);
                if (worth <= 0) return 0;
                //抵消后还能摸一张牌或回复1点体力，这部分自身也是收益
                const bonus = player.isDamaged() ? 1.5 : 1;
                return worth + bonus - get.value(card);
            }).forResult();
        },
        getWorth(trigger, player) {
            const card = trigger.card;
            const targets = (trigger.targets || []).filter(target => get.itemtype(target) == 'player');
            let effect = 0;
            for (const target of targets) {
                effect += get.effect(target, card, trigger.player, player);
            }
            //没有角色目标（如【无懈可击】【闪】）或收益不明显时，按使用者的敌我关系估值
            if (!targets.length || Math.abs(effect) < 0.5) {
                if (get.attitude(player, trigger.player) < 0) {
                    effect = -Math.abs(effect) - 1;
                } else {
                    effect = Math.abs(effect) + 1;
                }
            }
            return -effect;
        },
        async content(event, trigger, player) {
            if (trigger.targets) {
                trigger.targets.length = 0;
            }
            trigger.all_excluded = true;
            game.log(player, '令', trigger.card, '无效了');
            await player.chooseDrawRecover(true);
        },
    },

    //烬貂蝉
    zshy_huoshen: {//惑神
        audio: 'ext:诸神寰宇/audio/character:2',
        NihilismSkill: true,
        trigger: {
            target: 'useCardToTargeted',
        },
        filter(event, player) {
            return game.hasPlayer(function (current) {
                return current != player;
            });
        },
        async cost(event, trigger, player) {
            let str = `令一名其他角色交给你所有你声明花色的牌，若其没有该花色的牌，则你夺取其1点体力上限`;
            event.result = await player.chooseTarget(get.prompt('zshy_huoshen'), str, function (card, player, target) {
                return target != player;
            }).set('ai', function (target) {
                let player = _status.event.player;
                let att = get.attitude(player, target);
                //对队友不发动；对敌人按威胁（牌多、上限低更容易被夺取）排序
                if (att >= 0) return 0;
                let value = -att;
                value += Math.min(target.countCards('he'), 6) / 3;
                if (target.maxHp <= 2) value += 1.5;
                return value;
            }).forResult();
        },
        async content(event, trigger, player) {
            let target = event.targets[0];
            let str = `令${get.translation(target)}交给你所有你声明花色的牌，若其没有该花色的牌，则你夺取其1点体力上限`;
            let suit;
            if (target.countCards('he') > 0) {
                const result1 = await player.chooseControl(lib.suit)
                    .set('prompt', '请声明一种花色')
                    .set('prompt2', str)
                    .set('ai', function () {
                        //按目标实际持有的花色分布声明：牌少时优先选其没有的花色以夺取体力上限
                        const counts = {};
                        for (const s of lib.suit) counts[s] = 0;
                        for (const card of target.getCards('he')) {
                            const s = get.suit(card);
                            if (s in counts) counts[s]++;
                        }
                        const best = lib.suit.slice().sort((a, b) => counts[b] - counts[a])[0];
                        if (counts[best] <= 1) {
                            const empty = lib.suit.filter(s => counts[s] === 0);
                            if (empty.length) return empty.randomGet();
                        }
                        return best;
                    }).forResult();
                suit = result1.control;
            }
            if (suit) {
                player.chat(get.translation(suit + 2));
                game.log(player, '选择了', '#y' + get.translation(suit + 2));
            }
            const cards = suit ? target.getCards('he', { suit }) : [];
            if (cards.length) {
                await target.give(cards, player, 'give');
            } else {
                await target.loseMaxHp();
                await player.gainMaxHp();
                await player.recover();
            }
        },
    },
    zshy_meiying: {//魅影
        audio: 'ext:诸神寰宇/audio/character:2',
        NihilismSkill: true,
        trigger: {
            global: `useCardToPlayer`,
        },
        filter(event, player) {
            return event.card && get.tag(event.card, 'damage') > 0.5 && event.targets.length == 1 && event.isFirstTarget;
        },
        async cost(event, trigger, player) {
            const str = `选择任意名角色，若<span data-nature="shenmm">${get.translation(trigger.targets)}</span>为选择角色则取消之，否则选择角色将成为${get.translation(trigger.card)}的目标`;
            event.result = await player.chooseTarget(get.prompt('zshy_meiying'), str, [1, Infinity])
                .set('ai', function (target) {
                    const player = _status.event.player;
                    const parent = trigger.getParent();
                    const effect = get.effect(target, trigger.card, trigger.player, player);
                    if (parent.targets.includes(target)) {
                        //已经是目标：只有这张牌对我不利时才移除
                        return effect < 0 ? Math.min(6, -effect) : 0;
                    }
                    //还不是目标：只有追加后对我方有利时才加入
                    return effect > 0 ? Math.min(6, effect) : 0;
                })
                .forResult();
        },
        async content(event, trigger, player) {
            let list = [];
            for (const i of event.targets) {
                if (trigger.getParent().targets.includes(i)) {
                    trigger.getParent().targets.remove(i);
                    game.log(trigger.card, '移除了', i, '为目标');
                } else {
                    trigger.getParent().targets.add(i);
                    game.log(i, '也成为了', trigger.card, '的目标');
                }
            }
        },
    },

    //烬郭嘉
    zshy_tianji: {//天忌
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: ['dying', 'dieBegin'],
        },
        NihilismSkill: true,
        forced: true,
        lastDo: true,
        filter(event, player) {
            return player.maxHp > 1;
        },
        async content(event, trigger, player) {
            //将体力与体力上限调整为X（X为原体力上限-1）
            const num = Math.max(1, player.maxHp - 1);
            player.maxHp = num;
            player.hp = num;
            if (event.triggername == 'dieBegin') {
                //死亡时直接取消死亡事件，否则设置体力不会阻止死亡结算
                trigger.cancel();
                game.log(player, '将体力上限调整为', num, '点，并阻止了死亡');
            }
            player.update();
            game.delayx();
        },
        ai: {
            //濒死时能反复把体力拉回上限-1，视为能挨打的血牛
            maixie: true,
        },
    },
    zshy_yice: {//遗策
        //把初始体力值统一成数字（可能是数字，也可能是“3/4”这样的字符串）
        yiceInitHp(hp) {
            const num = parseInt(String(hp == null ? '' : hp).split('/')[0], 10);
            return isFinite(num) ? num : 0;
        },
        //按「势力|性别|初始体力值」分组的武将池，获得技能时扫一次 lib.character，之后直接查表
        buildYicePool() {
            const info = lib.skill.zshy_yice;
            if (!yicePoolCache) {
                const pool = new Map();
                for (const name in lib.character) {
                    if (name.includes('zshy_AAA')) continue;
                    const data = get.character(name);
                    if (!data || !data.skills || !data.skills.length) continue;
                    const key = data.group + '|' + data.sex + '|' + info.yiceInitHp(data.hp);
                    if (!pool.has(key)) pool.set(key, []);
                    pool.get(key).push(name);
                }
                yicePoolCache = pool;
            }
            return yicePoolCache;
        },
        init(player, skill) {
            if (!player.storage[skill]) player.storage[skill] = {};
        },
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: [`damageEnd`, `loseHpEnd`, `loseMaxHpEnd`],
            player: ['phaseZhunbeiBegin'],
        },
        NihilismSkill: true,
        firstDo: true,
        async cost(event, trigger, player) {
            let str = '选择一名角色，然后其从三名与其势力和初始体力值相同的同性别的候选武将中获得其中一名武将的所有技能。';
            event.result = await player.chooseTarget(get.prompt(event.skill), str)
                .set('ai', function (target) {
                    const player = _status.event.player;
                    const att = get.attitude(player, target);
                    if (att <= 0) return 0;
                    //队友收益：自身技能越少，额外技能的提升越大
                    const count = target.getSkills().length;
                    return att * (1 + 1 / (1 + count));
                }).forResult()
        },
        async content(event, trigger, player) {
            for (const i of event.targets) {
                if (!i.isIn()) continue;
                //势力与性别以当前角色为准，初始体力值取其武将牌上的值
                const base = get.character(i.name1 || i.name || '');
                const info = lib.skill.zshy_yice;
                const hp = info.yiceInitHp(base && base.hp ? base.hp : i.maxHp);
                let list = [];
                if (hp > 0) {
                    //武将池按「势力|性别|初始体力值」分组，直接查表（池子在获得技能时已建好）
                    const key = i.group + '|' + i.sex + '|' + hp;
                    //排除目标自己的武将
                    list = (info.buildYicePool().get(key) || []).filter(j => j != i.name1 && j != i.name2 && j != i.name);
                }
                if (!list.length) {
                    game.log(i, '没有符合条件的武将');
                    continue;
                }
                //武将三选一：随机取至多三名候选，由技能发动者选择
                const names = list.randomGets(3);
                const dialog = ui.create.dialog('【遗策】请选择一名武将', 'hidden');
                dialog.add([names, 'character']);
                const result = await player.chooseButton(dialog, true).set('ai', function (button) {
                    const info = get.character(button.link);
                    if (!info || !info.skills || !info.skills.length) return 0;
                    //技能越多越优先，同等数量时按技能评级加总
                    return info.skills.reduce((sum, skill) => {
                        const rank = get.skillRank(skill, 'in') + get.skillRank(skill, 'out');
                        return sum + (rank > 0 ? rank : 1);
                    }, info.skills.length);
                }).forResult();
                if (!result || !result.bool || !result.links || !result.links.length) return;
                const num = result.links[0];
                const picked = get.character(num);
                await i.addSkills((picked && picked.skills ? picked.skills : []).slice(0));
                game.log(player, '选择了武将', '#g' + get.translation(num));
                game.log(i, '获得了', '#g' + get.translation(num), '的所有技能');
            };
        },
        ai: {
            effect: {
                target(card, player, target) {
                    if (get.tag(card, 'damage') && target.hasSkill('zshy_tianji')) {
                        const damagenum = get.tag(card, 'damage');
                        const key = target.hp - get.tag(card, 'damage');
                        const att = get.attitude(player, target);
                        const otherplayers = game.players.filter(o => o.isAlive() && o != target && o != player);
                        if (att >= 2) {
                            const notmaixie = otherplayers.filter(o => !o.hasSkillTag('maixie') && get.attitude(player, o) < 2 && get.attitude(target, o) < 2);
                            if (notmaixie && notmaixie.length && damagenum === 1) {
                                return [0, notmaixie.length * 2];
                            } else {
                                return;
                            }
                        } else {
                            if (key > 0) return [0, 2];
                            return [damagenum, 0];
                        }
                    }
                },
            },
        },
    },

    //烬贾诩
    zshy_zhensha: {//镇杀
        audio: 'ext:诸神寰宇/audio/character:2',
        NihilismSkill: true,
        trigger: {
            global: 'recoverBefore',
        },
        filter(event, player) {
            return event.player != player;
        },
        prompt2(event, player) {
            return `防止${get.translation(event.player)}回复体力，然后你摸一张牌`;
        },
        check(event, player) {
            const target = event.player;
            const att = get.attitude(player, target);
            //队友回复体力时不打断
            if (att > 0) return false;
            //敌方回复体力：一律阻止（回复量越大越值得）
            if (att < 0) return true;
            //中立角色：摸一张牌的收益与其回复量相当，濒死时阻止更划算
            return target.hp <= 1 || get.recoverEffect(target, target, player) <= 0;
        },
        logTarget(event, player) {
            return event.player;
        },
        async content(event, trigger, player) {
            trigger.cancel();
            player.draw();
        },
        ai: {
            expose: 1,
            threaten: 10,
        },
    },
    zshy_luanshi: {//乱世
        audio: 'ext:诸神寰宇/audio/character:2',
        NihilismSkill: true,
        enable: 'phaseUse',
        forced: true,
        position: 'he',
        multiline: true,
        filterCard: true,
        selectTarget: -1,
        filterTarget(card, player, target) {
            return target != player;
        },
        filter(event, player) {
            return player.countCards('he') > 0;
        },
        async content(event, trigger, player) {
            const target = event.target;
            const result = await target.chooseToUse(`【乱世】对一名角色使用一张伤害牌，或失去1点体力`, function (card) {
                return get.tag(card, 'damage') > 0.5;
            })
                .set('ai2', function () {
                    return get.effect_use.apply(this, arguments) - _status.event.effect;
                }).set('effect', get.effect(target, { name: 'losehp' }, target, target)).forResult();
            if (result.bool == false) {
                await target.loseHp();
            }
        },
        async contentAfter(event, trigger, player) {
            await player.chooseUseTarget({ name: 'sha', nature: 'stab', isCard: true, }, `【乱世】是否视为使用一张无距离限制的刺【杀】？`, false, 'nodistance');
        },
        ai: {
            order: 8,
            result: {
                player(player) {
                    let value = 0;
                    for (const current of game.filterPlayer()) {
                        if (current == player) continue;
                        const att = get.attitude(player, current);
                        //其他角色要么被迫消耗伤害牌，要么失去1点体力，对敌方都算我方收益
                        if (att < 0) value += 1;
                        else if (att > 0) value -= 1;
                    }
                    //弃置一张牌的成本
                    value -= 1;
                    //结算后还能免费视为使用一张刺【杀】
                    if (game.hasPlayer(current => current != player && get.damageEffect(current, player, player) > 1)) value += 2;
                    return value;
                },
            },
        },
    },
    zshy_yingmu: {//影幕
        audio: 'ext:诸神寰宇/audio/character:2',
        NihilismSkill: true,
        trigger: {
            player: ['damageBegin4', 'loseHpBegin'],
            target: 'useCardToTargeted',
        },
        locked: true,
        filter(event, player, name) {
            if (name == 'damageBegin4' || name == 'loseHpBegin') {
                return true;
            }
            return (get.type2(event.card) == 'trick' || get.color(event.card) == 'black') && event.player != player;
        },
        async cost(event, trigger, player) {
            if (event.triggername == 'useCardToTargeted') {
                event.result = await player.chooseBool()
                    .set('prompt', get.prompt(event.skill))
                    .set('prompt2', `回复1点体力或摸一张牌，然后令${get.translation(trigger.card)}对你无效`)
                    .set('ai', function () {
                        //以「我」为立场评估这张牌，对我没有明显收益时就无效掉并摸牌
                        return get.effect(player, trigger.card, trigger.player, player) < 0.5;
                    })
                    .forResult();
            } else {
                const str = `将${event.triggername == 'damageBegin4' ? '受到' + trigger.num + '点伤害' : '失去' + trigger.num + '点体力'}的效果转移给一名其他角色，或“取消”并防止之`;
                const result = await player.chooseTarget(`【影幕】将受到的效果转移给一名其他角色？（取消则防止之）`, str, function (card, player, target) {
                    return target != player;
                }).set('ai', function (target) {
                    const player = _status.event.player;
                    //转移后伤害由他人承担：只有转移到敌人身上（收益为正）才值得
                    return get.damageEffect(target, trigger.source || player, player, trigger.nature);
                }).forResult();
                event.result = {
                    bool: true,
                    targets: result.targets,
                };
            };
        },
        async content(event, trigger, player) {
            if (event.triggername == 'useCardToTargeted') {
                trigger.excluded.push(player);
                await player.chooseDrawRecover(true);
            } else {
                if (event?.targets?.length) {
                    player.line(event.targets[0]);
                    trigger.player = event.targets[0];
                } else {
                    trigger.cancel();
                }
            };
        },
        ai: {
            notrick: true,
            effect: {
                target(card, player, target) {
                    const att = get.attitude(player, target);
                    if (get.tag(card, 'damage')) {
                        const damagenum = get.tag(card, 'damage');
                        const key = target.hp - get.tag(card, 'damage');
                        const otherplayers = game.players.filter(o => o.isAlive() && o != target && o != player);
                        if (att >= 2) {
                            const notmaixie = otherplayers.filter(o => !o.hasSkillTag('maixie') && get.attitude(player, o) < 2 && get.attitude(target, o) < 2);
                            if (notmaixie && notmaixie.length && damagenum === 1) {
                                return [0, notmaixie.length * 2];
                            };
                        } else {
                            if (key > 0) return [0, 2];
                            return [damagenum, 0];
                        }
                    };
                    if (att < 0) {
                        if ((get.type2(card) == 'trick' || get.color(card) == 'black')) {
                            return 'zeroplayertarget';
                        };
                    };
                },
            },
        },
    },

    //烬神赵云
    zshy_longpo: {//龙魄
        audio: 'ext:诸神寰宇/audio/character:4',
        audioname2: {
            zshy_AAYAshenzhaoyun_shadow: 'zshy_longpo_zshy_AAYAshenzhaoyun_shadow',
        },
        NihilismSkill: true,
        forced: true,
        enable: ['chooseToUse', 'chooseToRespond'],
        prompt: '你可以将至多两张手牌当作任意<span data-nature="shenmm">基本/锦囊</span>牌使用或打出。',
        hiddenCard(player, name) {
            return player.countCards('hs');
        },
        filter(event, player) {
            const filterCard = event.filterCard;
            const validTypes = new Set(['basic', 'trick']);
            const inpileLength = lib.inpile.length;
            for (let index = 0; index < inpileLength; index++) {
                const i = lib.inpile[index];
                const type = get.type2(i);
                if (validTypes.has(type) &&
                    filterCard({ name: i, storage: { zshy_longpo: true } }, player, event) &&
                    player.countCards('hs')) {
                    return true;
                }
            }
            return false;
        },
        chooseButton: {
            dialog(event, player) {
                var list = [];
                for (var i of lib.inpile) {
                    var type = get.type2(i), filter = event.filterCard;
                    if (type == 'basic' && player.countCards('hs')) {
                        if (filter({ name: i, storage: { zshy_longpo: true } }, player, event)) list.push(['基本', '', i]);
                        if (i == 'sha') {
                            for (var j of lib.inpile_nature) {
                                if (filter({ name: i, nature: j, storage: { zshy_longpo: true } }, player, event)) list.push(['基本', '', 'sha', j]);
                            }
                        }
                    }
                    if (type == 'trick' && player.countCards('hs')) {
                        if (filter({ name: i, storage: { zshy_longpo: true } }, player, event)) list.push(['锦囊', '', i]);
                    }
                }
                const action = event.name == 'chooseToRespond' ? '打出' : '使用';
                return ui.create.dialog(`龙魄：将手牌当作${action}的牌`, [list, 'vcard'], 'hidden');
            },
            filter(button, player) {
                return _status.event.getParent().filterCard({ name: button.link[2], storage: { zshy_longpo: true } }, player, _status.event.getParent());
            },
            check(button) {
                var player = _status.event.player;
                //带上属性与化牌标记，让化出的牌按真实收益评估
                var value = player.getUseValue({ name: button.link[2], nature: button.link[3], storage: { zshy_longpo: true } });
                if (get.tag({ name: button.link[2] }, 'damage')) value += 0.5;
                return value + 1;
            },
            backup(links, player) {
                return {
                    filterCard(card, player, target) {
                        return true;
                    },
                    selectCard: [1, 2],
                    check(card, player, target) {
                        return 9 - get.value(card);
                    },
                    viewAs: {
                        name: links[0][2],
                        nature: links[0][3],
                        storage: { zshy_longpo: true },
                    },
                    position: 'hs',
                    popname: true,
                    precontent() {
                        //player.logSkill('zshy_longpo');
                    },
                }
            },
            prompt(links, player) {
                return '将至多两张牌当做' + get.translation(links[0][3] || '') + get.translation(links[0][2]) + '使用或打出';
            },
        },
        ai: {
            order: 10,
            fireAttack: true,
            respondSha: true,
            respondTao: true,
            respondShan: true,
            skillTagFilter(player, tag) {
                return player.countCards('hs') > 0;
            },
            effect: {
                player(card, player, target) {
                    //使用牌后会按花色追加效果，伤害牌与锦囊牌的收益略高
                    if (get.tag(card, 'damage')) return [1, 1];
                    if (get.type2(card) == 'trick') return [1, 0.5];
                },
            },
            result: {
                player(player) {
                    const event = _status.event;
                    if (event.type == 'dying') {
                        //濒死求桃时，只要有手牌就能把任意牌当桃使用
                        const dying = event.dying;
                        if (!dying) return 1;
                        if (dying == player) return player.countCards('hs') > 0 ? 1 : 0;
                        return get.attitude(player, dying) > 0 ? 1 : 0;
                    }
                    return 1;
                },
            },
        },
        group: ['zshy_longpo_DrawTo', 'zshy_longpo_Usecard', 'zshy_longpo_Damage'],
        subSkill: {
            DrawTo: {
                audio: 'zshy_longpo',
                audioname2: {
                    zshy_AAYAshenzhaoyun_shadow: 'zshy_longpo_zshy_AAYAshenzhaoyun_shadow',
                },
                NihilismSkill: true,
                forced: true,
                trigger: {
                    player: 'loseAfter',
                    global: ['equipAfter', 'addJudgeAfter', 'gainAfter', 'loseAsyncAfter', 'addToExpansionAfter'],
                },
                filter(event, player, target) {
                    return player.countCards('h') < 5;
                },
                async content(event, trigger, player) {
                    await player.drawTo(5);
                },
                ai: {
                    noh: true,
                    skillTagFilter(player, tag) {
                        if (tag == 'noh' && player.countCards('h') > 5) return false;
                    },
                },
            },
            Usecard: {
                audio: 'zshy_longpo',
                audioname2: {
                    zshy_AAYAshenzhaoyun_shadow: 'zshy_longpo_zshy_AAYAshenzhaoyun_shadow',
                },
                NihilismSkill: true,
                forced: true,
                trigger: {
                    player: ['useCard', 'respond'],
                },
                async content(event, trigger, player) {
                    if (get.suit(trigger.card) == 'spade') {
                        if (trigger.name == 'useCard') trigger.directHit.addArray(game.players);
                    }
                    if (get.suit(trigger.card) == 'club') await player.draw();
                    if (get.suit(trigger.card) == 'heart') await player.recover();
                    if (get.suit(trigger.card) == 'diamond') trigger.baseDamage++;
                    if (get.suit(trigger.card) == 'none') await player.gainMaxHp();
                },
                ai: {
                    directHit_ai(player, tag, arg) {
                        return !!arg && !!arg.card && get.suit(arg.card) == 'spade';
                    },
                    skillTagFilter(player, tag, arg) {
                        return !!arg && !!arg.card && get.suit(arg.card) == 'spade';
                    },
                },
            },
            Damage: {
                trigger: {
                    player: 'changeHp',
                },
                NihilismSkill: true,
                firstDo: true,
                forced: true,
                popup: false,
                async content(event, trigger, player) {
                    player.changeSkin({ characterName: 'zshy_AAYAshenzhaoyun' }, 'zshy_AAYAshenzhaoyun_shadow');
                },
            },
        },
    },
    zshy_longpo_zshy_AAYAshenzhaoyun_shadow: {
        audio: 'ext:诸神寰宇/audio/character:4',
    },

    //烬卧龙诸葛
    zshy_liaoyuan: {//燎原
        audio: 'ext:诸神寰宇/audio/character:2',
        superCharlotte: true,
        NihilismSkill: true,
        charlotte: true,
        forced: true,
        fixed: true,
        enable: 'phaseUse',
        filter(event, player) {
            return game.countPlayer(function (target) {
                return target.countCards('he') > 0 && target != player;
            }) > 0;
        },
        filterTarget(event, player, target) {
            return target != player && target.countCards('he') > 0;
        },
        selectTarget: [1, Infinity],
        check(event, player, target) {
            //目标弃置的牌越多火焰伤害越高，牌多且对我方不利时优先
            const effect = get.damageEffect(target, player, player, 'fire');
            if (effect <= 0) return false;
            return effect + Math.min(target.countCards('he'), 5) > 0;
        },
        prompt: '出牌阶段，你可选择任意名其他角色，然后令目标角色依次弃置所有牌并受到等量火焰伤害。',
        async content(event, trigger, player) {
            const target = event.target;
            const result = await target.chooseToDiscard('he', `【燎原】请弃置所有牌`, Infinity, true).forResult();
            if (result?.cards) {
                const num = Math.ceil(result.cards.length);
                await target.damage(num, 'fire');
            };
        },
        ai: {
            order: 13,
            result: {
                player(player) {
                    //场上有可以造成有效火焰伤害的敌人时才发动
                    if (game.hasPlayer(current => current != player && current.countCards('he') && get.damageEffect(current, player, player, 'fire') > 0)) return 1;
                    return 0;
                },
            },
            tag: {
                fireDamage: true,
                directHit_ai: true,
                natureDamage: true,
            },
        },
        subSkill: {
            after: {
                sub: true,
                mark: true,
                marktext: '燎原',
                intro: {
                    content: '本回合已使用过〖燎原〗',
                },
            },
        },
    },
    zshy_qimen: {//奇门
        audio: 'ext:诸神寰宇/audio/character:2',
        superCharlotte: true,
        NihilismSkill: true,
        charlotte: true,
        locked: true,
        fixed: true,
        trigger: {
            player: 'damageBegin4',
        },
        check(event, player) {
            //受到伤害基本都值得防止，同时还能白拿一张牌
            return get.damageEffect(player, event.source || player, player, event.nature) < 0;
        },
        prompt2(event, player) {
            return '你展示牌顶一张牌并获得之，若结果不为黑桃，则你防止此伤害。';
        },
        async content(event, trigger, player) {
            let card = get.cards()[0];
            await player.showCards(card, '奇门')
            await player.gain(card, 'gain2');
            if (get.suit(card) != 'spade') {
                trigger.cancel();
            };
        },
        ai: {
            freeShan: true,
            effect: {
                target(card, player, target) {
                    if (get.tag(card, 'damage')) return 0.5;
                }
            },
        },
    },
    zshy_poji: {//破计
        audio: 'ext:诸神寰宇/audio/character:2',
        superCharlotte: true,
        NihilismSkill: true,
        charlotte: true,
        locked: true,
        fixed: true,
        trigger: {
            global: ['useCard'],
        },
        filter(event, player) {
            return event.player != player;
        },
        prompt2(event, player) {
            let str = `令${get.translation(event.card)}无效`
            if (get.type(event.card) == 'trick' || get.type(event.card) == 'delay') {
                str += `，然后你回复1点体力或摸一张牌`
            }
            return str;
        },
        check(event, player) {
            const card = event.card;
            const targets = (event.targets || []).filter(target => get.itemtype(target) == 'player');
            let effect = 0;
            for (const target of targets) {
                effect += get.effect(target, card, event.player, player);
            }
            //没有角色目标（如【无懈可击】【闪】）时按使用者的敌我关系估值
            if (!targets.length || Math.abs(effect) < 0.5) {
                effect = get.attitude(player, event.player) < 0 ? -1 : 1;
            }
            //令此牌无效是免费的（锦囊还能摸牌/回复），只要对我不利就发动
            return effect < 0;
        },
        logTarget: 'player',
        async content(event, trigger, player) {
            if (trigger.targets) {
                trigger.targets.length = 0;
            }
            trigger.all_excluded = true;
            game.log(player, '令', trigger.card, '无效了');
            //延时锦囊与普通锦囊都算锦囊牌
            if (['trick', 'delay'].includes(get.type2(trigger.card))) {
                await player.chooseDrawRecover(true);
            };
        },
        ai: {
            expose: 0.8,
            notrick: true,
        },
    },

    //烬钟会
    zshy_quanshu: {//权术*
        audio: 'ext:诸神寰宇/audio/character:2',
        superCharlotte: true,
        NihilismSkill: true,
        charlotte: true,
        forced: true,
        fixed: true,
        trigger: { player: ['damageAfter'], source: ['damageAfter'], global: ['phaseBegin'] },
        filter(event, player, name) { return name === 'phaseBegin' || (event.num || 0) > 0; },
        getIndex(event, player) {
            return event.num || 1;
        },
        async content(event, trigger, player) {
            let num = 2;
            await player.draw(num);
            if (player.countCards('hes')) {
                const result = await player.chooseCard('hes', '将一张牌置于武将牌上作为「权」', true).forResult();
                if (result.bool && result.cards.length) {
                    await player.addToExpansion(result.cards, player, 'give').gaintag.add('zshy_quanshu');
                }
            };
        },
        mod: {
            maxHandcard(player, num) {
                return num + player.getExpansions('zshy_quanshu').length;
            },
            aiOrder(player, card, num) {
                if (num <= 0 || typeof card !== 'object' || !player.isPhaseUsing()) return num;
                if (!player.hasSkill('zshy_duobing') || player.hasSkill('zshy_zhanyi')) return num;
                if (player.getExpansions('zshy_quanshu').length < 3) {
                    if (get.type(card) == 'equip' && !['equip2', 'equip3'].includes(get.subtype(card))) return 0;
                    let eff = 6 + player.hp;
                    if (!get.tag(card, 'gain') && !get.tag(card, 'draw')) eff += 3;
                    if (player.getUseValue(card) < eff) return 0;
                }
            },
        },
        intro: {
            content: 'expansion',
            markcount: 'expansion',
        },
        onremove(player, skill) {
            var cards = player.getExpansions('zshy_quanshu');
            if (cards.length) player.loseToDiscardpile(cards);
        },
        ai: {
            maixie: true,
            maixie_hp: true,
            notemp: true,
            threaten: 0.8,
            effect: {
                target(card, player, target) {
                    if (get.tag(card, 'damage')) {
                        if (player.hasSkillTag('jueqing', false, target)) return [1, -2];
                        if (!target.hasFriend()) return;
                        if (target.hp >= 4) return [0.5, get.tag(card, 'damage') * 2];
                        if (!target.hasSkill('zshy_zhanyi') && target.hp > 1) return [0.5, get.tag(card, 'damage') * 1.5];
                        if (target.hp == 3) return [0.5, get.tag(card, 'damage') * 1.5];
                        if (target.hp == 2) return [1, get.tag(card, 'damage') * 0.5];
                    }
                },
            },
        },
        group: ['zshy_quanshu_tao'],
        subSkill: {
            tao: {
                enable: 'chooseToUse',
                viewAsFilter(player) {
                    return player.getExpansions('zshy_quanshu').length > 0;
                },
                superCharlotte: true,
                filterCard: true,
                selectCard: 0,
                position: 'hes',
                viewAs: { name: 'tao' },
                prompt: '将一张「权」当桃使用',
                async precontent(event, trigger, player) {
                    let cards = player.getExpansions('zshy_quanshu');
                    if (cards.length == 1) {
                        await player.loseToDiscardpile(cards);
                    } else {
                        const result = await player.chooseCardButton('请选择要弃置的一张「权」', cards, true).forResult();
                        if (result.bool) {
                            await player.loseToDiscardpile(result.links);
                        };
                    };
                },
            },
        },
    },
    zshy_duobing: {//夺柄
        audio: 'ext:诸神寰宇/audio/character:2',
        superCharlotte: true,
        NihilismSkill: true,
        charlotte: true,
        locked: true,
        fixed: true,
        trigger: { global: 'damageBegin4' },
        filter(event, player) {
            return event.source != player && event.num == 1 && event.source.isIn();
        },
        prompt2(event, player) {
            return '令伤害来源转为你，然后你对伤害来源造成等量伤害';
        },
        logTarget: 'source',
        check(event, player) {
            const source = event.source;
            if (!source || source == player) return false;
            //只对敌人以牙还牙，等量伤害打到敌人身上有收益才发动
            if (get.attitude(player, source) >= 0) return false;
            return get.damageEffect(source, player, player, event.nature) > 0;
        },
        async content(event, trigger, player) {
            if (trigger.source != undefined) {
                await trigger.source.damage(trigger.num);
            }
            trigger.source = player;
        },
        ai: {
            combo: 'zshy_quanshu',
        },
    },
    zshy_zhanyi: {//斩异
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        superCharlotte: true,
        NihilismSkill: true,
        charlotte: true,
        forced: true,
        fixed: true,
        filter(event, player) {
            return player.getExpansions('zshy_quanshu').length > 0;
        },
        prompt(event, player) {
            let str = `出牌阶段，你可弃置一张「权」并选择一名角色，然后令其摸两张牌`;
            if (player.getExpansions('zshy_quanshu').length > 1) {
                str += `，最后你可令一名其他角色受到无来源的${player.getExpansions('zshy_quanshu').length - 1}点伤害。`
            }
            return str;
        },
        async content(event, trigger, player) {
            let cards = player.getExpansions('zshy_quanshu');
            if (cards.length == 1) {
                await player.loseToDiscardpile(cards);
            } else {
                const result = await player.chooseCardButton(`请选择要弃置的一张「权」`, cards, true).forResult();
                if (result.bool) {
                    await player.loseToDiscardpile(result.links);
                };
            };
            const result1 = await player.chooseTarget(`令一名角色摸两张牌`, true).set('ai', function (target) {
                var player = _status.event.player;
                if (get.attitude(player, target) <= 0) return 0;
                return get.effect(target, { name: 'wuzhong' }, player, player);
            }).forResult();
            if (result1.bool) {
                await result1.targets[0].draw(2);
            };
            if (player.getExpansions('zshy_quanshu').length > 0) {
                const result2 = await player.chooseTarget('可以令一名其他角色受到无伤害来源的' + player.getExpansions('zshy_quanshu').length + '点伤害', function (event, target, player) {
                    return target != player;
                }).set('ai', function (target) {
                    var player = _status.event.player;
                    return get.damageEffect(target, player, player) > 0;
                }).forResult();
                if (result2.bool) {
                    await result2.targets[0].damage(player.getExpansions('zshy_quanshu').length, 'nosource');
                };
            };
        },
        ai: {
            order: 3,
            combo: 'zshy_quanshu',
            result: {
                player(player) {
                    const num = player.getExpansions('zshy_quanshu').length;
                    if (!num) return 0;
                    //给队友摸两张牌是稳定收益
                    let value = 0;
                    if (game.hasPlayer(function (current) {
                        return current != player && get.attitude(player, current) > 0;
                    })) value += 1;
                    //「权」足够时还能追加无来源伤害
                    if (num > 1 && game.hasPlayer(function (current) {
                        return current != player && get.damageEffect(current, player, player) > 0;
                    })) value += 2;
                    return value;
                },
            },
        },
    },

    //烬左慈
    zshy_JZChuanshen: {//幻身
        audio: 'ext:诸神寰宇/audio/character:2',
        NihilismSkill: true,
        unique: true,
        trigger: {
            global: ['roundStart'],
            player: ['phaseBegin', 'phaseEnd', 'changeHpBefore'],
        },
        filter(event, player, name) {
            if (name == 'roundStart') {
                return true;
            }
            return player.storage.zshy_JZChuanshen?.character?.length > 0;
        },
        async cost(event, trigger, player) {
            if (event.triggername === 'roundStart') {
                event.result = { bool: true, cost_data: ['替换'] };
                return;
            }
            const prompt = '###' + get.prompt(event.skill) + '###<div class="text center">替换当前幻身牌或制衡任意张其他幻身牌</div>';
            const result = await player.chooseControl('替换', '制衡', 'cancel2')
                .set('ai', () => {
                    const { player, cond } = get.event();
                    const storage = player.storage.zshy_JZChuanshen;
                    const best = lib.skill.zshy_JZChuanshen.getBestSkill(player, cond);
                    //没有可比较的幻身时直接结束
                    if (!best) return 'cancel2';
                    //当前幻身已经是最优时改为制衡换牌，否则换将
                    if (storage.current2 && storage.current2.includes(best)) {
                        return storage.character.length > 1 ? '制衡' : 'cancel2';
                    }
                    //最优技能也没有价值时不值得换
                    return get.skillRank(best, cond) < 1 ? 'cancel2' : '替换';
                })
                .set('cond', event.triggername)
                .set('prompt', prompt)
                .forResult();
            const control = result.control;
            event.result = { bool: typeof control === 'string' && control !== 'cancel2', cost_data: control };
        },
        async content(event, trigger, player) {
            let choice = event.cost_data;
            if (Array.isArray(choice)) {
                lib.skill.zshy_JZChuanshen.addHuashens(player, game.countPlayer());
                [choice] = choice;
            }
            _status.noclearcountdown = true;
            const id = lib.status.videoId++,
                prompt = choice === '替换' ? '幻身：请选择你要更换的武将牌' : '幻身：选择制衡任意张武将牌';
            const cards = player.storage.zshy_JZChuanshen.character;
            if (player.isOnline2()) {
                player.send(
                    (cards, prompt, id) => {
                        const dialog = ui.create.dialog(prompt, [cards, lib.skill.zshy_JZChuanshen.$createButton]);
                        dialog.videoId = id;
                    },
                    cards,
                    prompt,
                    id
                );
            }
            const dialog = ui.create.dialog(prompt, [cards, lib.skill.zshy_JZChuanshen.$createButton]);
            dialog.videoId = id;
            if (!event.isMine()) {
                dialog.style.display = 'none';
            }
            if (choice === '替换') {
                const buttons = dialog.content.querySelector('.buttons');
                const array = dialog.buttons.filter(item => !item.classList.contains('nodisplay') && item.style.display !== 'none');
                const choosed = player.storage.zshy_JZChuanshen.choosed;
                const groups = array.map(i => get.character(i.link).group).unique()
                    .sort((a, b) => {
                        const getNum = g => (lib.group.includes(g) ? lib.group.indexOf(g) : lib.group.length);
                        return getNum(a) - getNum(b);
                    });
                if (choosed.length > 0 || groups.length > 1) {
                    dialog.style.bottom = (parseInt(dialog.style.top || '0', 10) + (get.is.phoneLayout() ? 230 : 220)) + 'px';
                    dialog.addPagination({
                        data: array,
                        totalPageCount: groups.length + Math.sign(choosed.length),
                        container: dialog.content,
                        insertAfter: buttons,
                        onPageChange(state) {
                            const { pageNumber, data, pageElement } = state;
                            const { groups, choosed } = pageElement;
                            data.forEach(item => {
                                item.classList[
                                    (() => {
                                        const name = item.link,
                                            goon = choosed.length > 0;
                                        if (goon && pageNumber === 1) {
                                            return choosed.includes(name);
                                        }
                                        const group = get.character(name).group;
                                        return groups.indexOf(group) + (1 + goon) === pageNumber;
                                    })()
                                        ? 'remove'
                                        : 'add'
                                ]('nodisplay');
                            });
                            ui.update();
                        },
                        pageLimitForCN: ['←', '→'],
                        pageNumberForCN: (choosed.length > 0 ? ['常用'] : []).concat(
                            groups.map(i => {
                                const isChineseChar = char => {
                                    const regex = /[\u4e00-\u9fff\u3400-\u4dbf\ud840-\ud86f\udc00-\udfff\ud870-\ud87f\udc00-\udfff\ud880-\ud88f\udc00-\udfff\ud890-\ud8af\udc00-\udfff\ud8b0-\ud8bf\udc00-\udfff\ud8c0-\ud8df\udc00-\udfff\ud8e0-\ud8ff\udc00-\udfff\ud900-\ud91f\udc00-\udfff\ud920-\ud93f\udc00-\udfff\ud940-\ud97f\udc00-\udfff\ud980-\ud9bf\udc00-\udfff\ud9c0-\ud9ff\udc00-\udfff]/u;
                                    return regex.test(char);
                                }; //友情提醒：regex为基本汉字区间到扩展G区的Unicode范围的正则表达式，非加密/混淆
                                const str = get.plainText(lib.translate[i + '2'] || lib.translate[i] || '无');
                                return isChineseChar(str.slice(0, 1)) ? str.slice(0, 1) : str;
                            })
                        ),
                        changePageEvent: 'click',
                        pageElement: {
                            groups: groups,
                            choosed: choosed,
                        },
                    });
                }
            }
            const finish = () => {
                if (player.isOnline2()) {
                    player.send('closeDialog', id);
                }
                dialog.close();
                delete _status.noclearcountdown;
                if (!_status.noclearcountdown) {
                    game.stopCountChoose();
                }
            };
            while (true) {
                const next = player.chooseButton(true).set('dialog', id);
                if (choice === '制衡') {
                    next.set('selectButton', [1, Infinity]);
                    next.set('filterButton', button => button.link !== get.event().current);
                    next.set('current', player.storage.zshy_JZChuanshen.current);
                } else {
                    next.set('ai', button => {
                        const { player, cond } = get.event();
                        const best = lib.skill.zshy_JZChuanshen.getBestSkill(player, cond);
                        const skills = player.storage.zshy_JZChuanshen.map[button.link] || [];
                        //优先选择能提供最优幻身的武将牌
                        return best && skills.includes(best) ? 2.5 : 1 + Math.random() * 0.1;
                    });
                    next.set('cond', event.triggername);
                }
                const result = await next.forResult();
                if (choice === '制衡') {
                    finish();
                    lib.skill.zshy_JZChuanshen.removeHuashen(player, result.links);
                    lib.skill.zshy_JZChuanshen.addHuashens(player, result.links.length);
                    return;
                } else {
                    const card = result.links[0];
                    const func = function (card, id) {
                        const dialog = get.idDialog(id);
                        if (dialog) {
                            //禁止翻页
                            const paginationInstance = dialog.paginationMap?.get(dialog.content.querySelector('.buttons'));
                            if (paginationInstance?.state) {
                                paginationInstance.state.pageRefuseChanged = true;
                            }
                            for (let i = 0; i < dialog.buttons.length; i++) {
                                if (dialog.buttons[i].link == card) {
                                    dialog.buttons[i].classList.add('selectedx');
                                } else {
                                    dialog.buttons[i].classList.add('unselectable');
                                }
                            }
                        }
                    };
                    if (player.isOnline2()) {
                        player.send(func, card, id);
                    } else if (event.isMine()) {
                        func(card, id);
                    }
                    const result2 = await player
                        .chooseControl('确定', '返回')
                        .set('ai', () => {
                            //已经选好武将牌，直接确定换将
                            return '确定';
                        })
                        .set('cond', event.triggername)
                        .forResult();
                    const control = result2.control;
                    if (control === '返回') {
                        const func2 = function (card, id) {
                            const dialog = get.idDialog(id);
                            if (dialog) {
                                //允许翻页
                                const paginationInstance = dialog.paginationMap?.get(dialog.content.querySelector('.buttons'));
                                if (paginationInstance?.state) {
                                    paginationInstance.state.pageRefuseChanged = false;
                                }
                                for (let i = 0; i < dialog.buttons.length; i++) {
                                    dialog.buttons[i].classList.remove('selectedx');
                                    dialog.buttons[i].classList.remove('unselectable');
                                }
                            }
                        };
                        if (player.isOnline2()) {
                            player.send(func2, card, id);
                        } else if (event.isMine()) {
                            func2(card, id);
                        }
                    } else {
                        finish();
                        player.storage.zshy_JZChuanshen.choosed.add(card);
                        if (player.storage.zshy_JZChuanshen.current != card) {
                            const old = player.storage.zshy_JZChuanshen.current;
                            player.storage.zshy_JZChuanshen.current = card;
                            game.broadcastAll(
                                (player, character, old) => {
                                    player.tempname.remove(old);
                                    player.tempname.add(character);
                                    player.sex = get.character(character)[0];
                                },
                                player,
                                card,
                                old
                            );
                            game.log(player, '将性别变为了', '#y' + get.translation(get.character(card).sex) + '性');
                            player.changeGroup(get.character(card).group);
                        }
                        player.storage.zshy_JZChuanshen.current2 = player.storage.zshy_JZChuanshen.map[card];
                        if (!player.additionalSkills.zshy_JZChuanshen?.includes(player.storage.zshy_JZChuanshen.map[card])) {
                            player.flashAvatar('zshy_JZChuanshen', card);
                            player.syncStorage('zshy_JZChuanshen');
                            player.updateMarks('zshy_JZChuanshen');
                            await player.addAdditionalSkills('zshy_JZChuanshen', player.storage.zshy_JZChuanshen.map[card]);
                            // lib.skill.zshy_JZChuanshen.createAudio(card,link,'re_zuoci');
                        }
                        return;
                    }
                }
            }
        },
        //只从诸神寰宇自己的武将包（zshy_ 系列包与 Nihilism 包）里抽，获得技能时扫一次并缓存
        getHuashenPool() {
            if (!huashenPoolCache) {
                const names = new Set();
                for (const packName in lib.characterPack) {
                    if (packName != 'Nihilism' && !packName.startsWith('zshy_')) continue;
                    const packCharacters = lib.characterPack[packName];
                    if (!packCharacters) continue;
                    for (const name in packCharacters) {
                        names.add(name);
                    }
                }
                huashenPoolCache = [...names];
            }
            return huashenPoolCache;
        },
        init(player, skill) {
            //获得技能时准备幻身池
            lib.skill[skill].getHuashenPool();
            if (!player.storage[skill]) {
                player.storage[skill] = {
                    character: [],
                    choosed: [],
                    map: {},
                };
            }
        },
        banned: ['lisu', 'sp_xiahoudun', 'xushao', 'jsrg_xushao', 'zhoutai', 'old_zhoutai', 'shixie', 'xin_zhoutai', 'dc_shixie', 'old_shixie'],
        bannedType: ['NihilismSkill'],
        getBestSkill(player, cond) {
            //在全部幻身武将牌的技能里挑出评分最高的一个，随局面（触发时机）变化
            const storage = player.storage.zshy_JZChuanshen;
            if (!storage || !storage.character?.length) return;
            const skills = storage.character
                .map(name => (get.character(name)?.skills || []).filter(skill => !!lib.translate[skill + '_info']))
                .flat();
            if (!skills.length) return;
            skills.randomSort();
            skills.sort((a, b) => get.skillRank(b, cond) - get.skillRank(a, cond));
            return skills[0];
        },
        addHuashen(player) {
            if (!player.storage.zshy_JZChuanshen) {
                return;
            };
            const storage = player.storage.zshy_JZChuanshen;
            //池子已限制为诸神寰宇自己的武将包，这里只需排除已经拿到过的幻身
            const list = lib.skill.zshy_JZChuanshen.getHuashenPool().filter(name => !storage.character.includes(name));
            if (!list.length) {
                return;
            }
            list.randomSort();
            for (let i = 0; i < list.length; i++) {
                let name = list[i];
                if (name.indexOf('zuoci') !== -1 || get.is.double(name) || lib.skill.zshy_JZChuanshen.banned.includes(name)) {
                    continue;
                }
                let skills = (get.character(name)[3] || []).filter(skill => {
                    const categories = get.skillCategoriesOf(skill, player);
                    return !categories.some(type => lib.skill.zshy_JZChuanshen.bannedType.includes(type));
                });
                if (skills.length) {
                    storage.character.push(name);
                    storage.map[name] = skills;
                    return name;
                }
            }
        },
        addHuashens(player, num) {
            var list = [];
            for (var i = 0; i < num; i++) {
                var name = lib.skill.zshy_JZChuanshen.addHuashen(player);
                if (name) {
                    list.push(name);
                }
            }
            if (list.length) {
                player.syncStorage('zshy_JZChuanshen');
                player.updateMarks('zshy_JZChuanshen');
                game.log(player, '获得了', get.cnNumber(list.length) + '张', '#g幻身');
                lib.skill.zshy_JZChuanshen.drawCharacter(player, list);
            }
        },
        removeHuashen(player, links) {
            player.storage.zshy_JZChuanshen.character.removeArray(links);
            game.log(player, '移去了', get.cnNumber(links.length) + '张', '#g幻身');
        },
        drawCharacter(player, list) {
            game.broadcastAll(
                function (player, list) {
                    if (player.isUnderControl(true)) {
                        var cards = [];
                        for (var i = 0; i < list.length; i++) {
                            var cardname = 'huashen_card_' + list[i];
                            lib.card[cardname] = {
                                fullimage: true,
                                image: 'character:' + list[i],
                            };
                            lib.translate[cardname] = get.rawName2(list[i]);
                            cards.push(game.createCard(cardname, '', ''));
                        }
                        player.$draw(cards, 'nobroadcast');
                    }
                },
                player,
                list
            );
        },
        $createButton(item, type, position, noclick, node) {
            node = ui.create.buttonPresets.character(item, 'character', position, noclick);
            const info = get.character(item);
            const skills = info[3].filter(function (skill) {
                const categories = get.skillCategoriesOf(skill, get.player());
                return !categories.some(type => lib.skill.zshy_JZChuanshen.bannedType.includes(type));
            });
            if (skills.length) {
                const skillstr = skills.map(i => `[${get.translation(i)}]`).join('<br>');
                const skillnode = ui.create.caption(`<div class='text' data-nature=${get.groupnature(info[1], 'raw')}m style='font-family: ${lib.config.name_font || 'xinwei'},xinwei'>${skillstr}</div>`, node);
                skillnode.style.left = '2px';
                skillnode.style.bottom = '2px';
            }
            node._customintro = function (uiintro, evt) {
                const character = node.link,
                    characterInfo = get.character(node.link);
                let capt = get.translation(character);
                if (characterInfo) {
                    capt += `&nbsp;&nbsp;${get.translation(characterInfo.sex)}`;
                    let charactergroup;
                    const charactergroups = get.is.double(character, true);
                    if (charactergroups) {
                        charactergroup = charactergroups.map(i => get.translation(i)).join('/');
                    } else {
                        charactergroup = get.translation(characterInfo.group);
                    }
                    capt += `&nbsp;&nbsp;${charactergroup}`;
                }
                uiintro.add(capt);

                if (lib.characterTitle[node.link]) {
                    uiintro.addText(get.colorspan(lib.characterTitle[node.link]));
                }
                for (let i = 0; i < skills.length; i++) {
                    if (lib.translate[skills[i] + '_info']) {
                        let translation = lib.translate[skills[i] + '_ab'] || get.translation(skills[i]).slice(0, 2);
                        if (lib.skill[skills[i]] && lib.skill[skills[i]].nobracket) {
                            uiintro.add('<div><div class="skilln">' + get.translation(skills[i]) + '</div><div>' + get.skillInfoTranslation(skills[i], null, false) + '</div></div>');
                        } else {
                            uiintro.add('<div><div class="skill">【' + translation + '】</div><div>' + get.skillInfoTranslation(skills[i], null, false) + '</div></div>');
                        }
                        if (lib.translate[skills[i] + '_append']) {
                            uiintro._place_text = uiintro.add('<div class="text">' + lib.translate[skills[i] + '_append'] + '</div>');
                        }
                    }
                }
            };
            return node;
        },
        mark: true,
        intro: {
            onunmark(storage, player) {
                storage.character = [];
                const name = player.name ? player.name : player.name1;
                if (name) {
                    const sex = get.character(name).sex;
                    const group = get.character(name).group;
                    if (player.sex !== sex) {
                        game.broadcastAll(
                            (player, sex) => {
                                player.sex = sex;
                            },
                            player,
                            sex
                        );
                        game.log(player, '将性别变为了', '#y' + get.translation(sex) + '性');
                    }
                    if (player.group !== group) {
                        game.broadcastAll(
                            (player, group) => {
                                player.group = group;
                                player.node.name.dataset.nature = get.groupnature(group);
                            },
                            player,
                            group
                        );
                        game.log(player, '将势力变为了', '#y' + get.translation(group + 2));
                    }
                }
            },
            mark(dialog, storage, player) {
                if (storage && storage.current) {
                    dialog.addSmall([[storage.current], (item, type, position, noclick, node) => lib.skill.zshy_JZChuanshen.$createButton(item, type, position, noclick, node)]);
                }
                if (storage && storage.current2) {
                    for (const i of storage.current2) {
                        dialog.add('<div><div class="skill">【' + get.translation(lib.translate[i + '_ab'] || get.translation(i).slice(0, 2)) + '】</div><div>' + get.skillInfoTranslation(i, player, false) + '</div></div>');
                    };
                }
                if (storage && storage.character.length) {
                    if (player.isUnderControl(true)) {
                        dialog.addSmall([storage.character, (item, type, position, noclick, node) => lib.skill.zshy_JZChuanshen.$createButton(item, type, position, noclick, node)]);
                    } else {
                        dialog.addText('共有' + get.cnNumber(storage.character.length) + '张“幻身”');
                    }
                } else {
                    return '没有幻身';
                }
            },
            content(storage, player) {
                return '共有' + get.cnNumber(storage.character.length) + '张“幻身”';
            },
            markcount(storage, player) {
                if (storage && storage.character) {
                    return storage.character.length;
                }
                return 0;
            },
        },
    },
    zshy_JZCxinsheng: {//新生
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: 'changeHp' },
        NihilismSkill: true,
        forced: true,
        unique: true,
        async content(event, trigger, player) {
            lib.skill.zshy_JZChuanshen.addHuashens(player, 1);
            if (trigger.player == player && game.hasPlayer(function (target) {
                let tskills = target.getStockSkills(true, true).filter(skill => {
                    const info = get.info(skill);
                    return info && !player.hasSkill(skill);
                });
                if (tskills?.length > 0) {
                    return true;
                } return false;
            })) {
                const result = await player.chooseTarget(`新生`, `选择一名你未拥有其武将牌上所有技能的角色，获得其武将牌上所有技能并摸X张牌（X为获得技能数）`, function (card, player, target) {
                    let tskills = target.getStockSkills(true, true).filter(skill => {
                        const info = get.info(skill);
                        return info && !player.hasSkill(skill);
                    });
                    if (tskills?.length > 0) {
                        return true;
                    } return false;
                }).set('ai', function (target) {
                    //选择可获得的技能最多、且对技能少的角色收益最高的目标
                    const skills = target.getStockSkills(true, true).filter(skill => {
                        const info = get.info(skill);
                        return info && !player.hasSkill(skill);
                    });
                    let value = skills.length;
                    if (get.attitude(player, target) < 0) value *= 0.2;
                    return value;
                }).forResult();
                if (result?.targets) {
                    const skills = result.targets[0].getStockSkills(true, true).filter(skill => {
                        const info = get.info(skill);
                        return info && !player.hasSkill(skill);
                    });
                    await player.addSkills(skills);
                    await player.draw(skills.length);
                };
            };
            if (trigger.player != player) {
                await player.gainMaxHp();
            }
        },
        ai: { combo: 'zshy_JZChuanshen' },
        group: ['zshy_JZCxinsheng_Alive'],
        subSkill: {
            Alive: {
                audio: 'zshy_JZCxinsheng',
                trigger: { global: 'dying' },
                superCharlotte: true,
                NihilismSkill: true,
                charlotte: true,
                locked: true,
                unique: true,
                fixed: true,
                filter(event, player) {
                    return player.maxHp >= event.player.maxHp;
                },
                async cost(event, trigger, player) {
                    event.result = await player.chooseBool()
                        .set('prompt', get.prompt('zshy_JZCxinsheng'))
                        .set('prompt2', `调整你的体力上限为${Math.floor(player.maxHp / 2)}点，令${get.translation(trigger.player)}回复至满体力，然后其摸四张牌。`)
                        .set('ai', function () {
                            const player = _status.event.player;
                            const dying = trigger.player;
                            //救自己永远值得
                            if (dying == player) return true;
                            if (get.attitude(player, dying) <= 0) return false;
                            //体力上限要减半，自身太脆时不值得
                            return player.maxHp >= 4;
                        })
                        .forResult();
                },
                async content(event, trigger, player) {
                    const num = Math.max(1, Math.floor(player.maxHp / 2));
                    player.maxHp = num;
                    if (player.hp > num) player.hp = num;
                    player.update();
                    await trigger.player.recoverTo(trigger.player.maxHp);
                    await trigger.player.draw(4);
                },
            },
        },
    },



};

const wxgySkill = {
    zshy_Hhuanhun: {
        NihilismSkill: true,
        forced: true,
        mark: true,
        init(player, skill) {
            if (!player.storage[skill]) player.storage[skill] = {};
            if (!player.storage[skill].lockedSouls) player.storage[skill].lockedSouls = [];
        },
        trigger: { player: ['damageEnd'], global: ['phaseBefore', 'roundEnd'] },
        filter(event, player, name) {
            if (name === 'phaseBefore') return player.name === 'zshy_AAYBhun' && game.phaseNumber === 0 && !(player.storage.zshy_Hhuanhun && player.storage.zshy_Hhuanhun.initialized);
            const storage = player.storage.zshy_Hhuanhun;
            if (!storage || !storage.initialized) return false;
            if (name === 'damageEnd') return event.num > 0;
            return true;
        },
        async content(event, trigger, player) {
            const skill = lib.skill.zshy_Hhuanhun;
            if (event.triggername === 'phaseBefore') await skill.initHuanhun(player);
            else if (event.triggername === 'damageEnd') await skill.gainSouls(player, trigger.num, true);
            else if (event.triggername === 'roundEnd') await skill.finishRound(player);
        },
        // 化身式：把「魂」作为角色牌展示在标记里
        soulButton(item, type, position, noclick, node) {
            node = ui.create.buttonPresets.character(item, 'character', position, noclick);
            const info = get.character(item);
            const skills = (info[3] || []);
            if (skills.length) {
                const skillstr = skills.map(i => '[' + get.translation(i) + ']').join('<br>');
                const skillnode = ui.create.caption('<div class="text" style="font-family:xinwei">' + skillstr + '</div>', node);
                skillnode.style.left = '2px';
                skillnode.style.bottom = '2px';
            }
            node._customintro = function (uiintro) {
                uiintro.add(get.translation(item));
                for (const skill of skills) {
                    if (lib.translate[skill + '_info']) uiintro.add('<div><div class="skill">【' + get.translation(skill) + '】</div><div>' + get.skillInfoTranslation(skill) + '</div></div>');
                }
            };
            return node;
        },
        loseSouls(player, list) {
            if (!list || !list.length) return;
            game.broadcastAll(function (player, list) {
                if (player !== game.me && !player.isUnderControl(true)) return;
                const cards = [];
                for (const id of list) {
                    const cardname = 'zshy_hun_card_' + id;
                    lib.card[cardname] = { fullimage: true, image: 'character:' + id };
                    lib.translate[cardname] = get.rawName2(id);
                    cards.push(game.createCard(cardname, '', ''));
                }
                if (cards.length) player.$throw(cards, 800);
            }, player, list);
        },
        drawSouls(player, list) {
            if (!list || !list.length) return;
            game.broadcastAll(function (player, list) {
                if (!player.isUnderControl(true)) return;
                const cards = [];
                for (const id of list) {
                    const cardname = 'zshy_hun_card_' + id;
                    lib.card[cardname] = { fullimage: true, image: 'character:' + id };
                    lib.translate[cardname] = get.rawName2(id);
                    cards.push(game.createCard(cardname, '', ''));
                }
                player.$draw(cards, 'nobroadcast');
            }, player, list);
        },
        intro: {
            mark(dialog, storage, player) {
                if (!storage) return '没有「魂」';
                const souls = storage.souls || [];
                const locked = storage.lockedSouls || [];
                if (!souls.length) {
                    dialog.addText('没有「魂」');
                    return;
                }
                const addSouls = (title, list) => {
                    if (!list.length) return;
                    dialog.addText(title);
                    dialog.addSmall([list, (item, type, position, noclick, node) => lib.skill.zshy_Hhuanhun.soulButton(item, type, position, noclick, node)]);
                };
                addSouls('当前展示的「魂」', souls.filter(id => id === storage.current && !locked.includes(id)));
                addSouls('未展示的「魂」', souls.filter(id => id !== storage.current && !locked.includes(id)));
                addSouls('已锁定的「魂」（本局不能再选择或弃置）', souls.filter(id => locked.includes(id)));
            },
            content(storage) {
                const souls = storage?.souls || [];
                const locked = storage?.lockedSouls || [];
                return '共有' + souls.length + '张「魂」，其中' + souls.filter(id => locked.includes(id)).length + '张已锁定';
            },
            markcount(storage) {
                return storage && storage.souls ? storage.souls.length : 0;
            },
        },
        cleanName(id) {
            return getBaseName(id);
        },
        validCharacter(id) {
            const character = lib.character[id];
            if (!character || id === 'zshy_AAYBhun' || !lib.translate[id]) return false;
            if (lib.config.banned && lib.config.banned.includes(id)) return false;
            if (character.isMinskin || character.isBoss || character.isHiddenBoss || character.isUnseen) return false;
            return true;
        },
        allCharacters() {
            const list = Object.keys(lib.character).filter(id => lib.skill.zshy_Hhuanhun.validCharacter(id));
            if (list.length) return list;
            return Object.keys(lib.character).filter(id => id !== 'zshy_AAYBhun' && lib.translate[id]);
        },
        initialCharacters() {
            // 按武将牌ID排除已登场的主/副将，不排除未登场的同名版本。
            const appeared = new Set();
            for (const current of game.players.concat(game.dead || [])) {
                for (const key of ['name', 'name1', 'name2']) {
                    if (current[key]) appeared.add(current[key]);
                }
            }
            return lib.skill.zshy_Hhuanhun.allCharacters().filter(id => !appeared.has(id));
        },
        selectableSouls(player, excludeCurrent = false) {
            const storage = player.storage.zshy_Hhuanhun;
            if (!storage) return [];
            const locked = storage.lockedSouls || [];
            return (storage.souls || []).filter(id => !locked.includes(id) && (!excludeCurrent || id !== storage.current));
        },
        sameNameCharacters(id) {
            const library = lib.zshyNameLibrary;
            if (library && library.baseVariants) {
                const target = library.baseVariants(id);
                return lib.skill.zshy_Hhuanhun.allCharacters().filter(function (cid) {
                    const variants = library.baseVariants(cid);
                    for (const v of variants) {
                        if (target.has(v)) return true;
                    }
                    return false;
                });
            }
            const base = lib.skill.zshy_Hhuanhun.cleanName(id);
            return lib.skill.zshy_Hhuanhun.allCharacters().filter(cid => lib.skill.zshy_Hhuanhun.cleanName(cid) === base);
        },
        async chooseFromPool(player, pool, prompt) {
            return await chooseCharacterConfirmed(player, pool || [], prompt);
        },
        // 化身式评分：一张魂的武将技能里取最高 get.skillRank
        soulRank(id, cond) {
            const data = lib.character[id] || {};
            const skills = (data.skills || (get.character(id)[3] || [])).filter(function (s) {
                return s !== 'zshy_Hhuanhun' && !((get.info(s) || {}).NihilismSkill);
            });
            let best = 0;
            for (const s of skills) {
                const rank = get.skillRank(s, cond || 'out');
                if (rank > best) best = rank;
            }
            return best;
        },
        getBestSoul(player, cond) {
            let best = null, bestRank = -1;
            for (const id of lib.skill.zshy_Hhuanhun.selectableSouls(player, true)) {
                const rank = lib.skill.zshy_Hhuanhun.soulRank(id, cond || 'out');
                if (rank > bestRank) { best = id; bestRank = rank; }
            }
            return best ? { id: best, rank: bestRank } : null;
        },
        // 选「魂」用化身机制：dialog + chooseButton(true)；自由选将只给开局选武将图
        async chooseSoul(player, list, prompt, min, max, discarding = false) {
            if (!list || !list.length) return [];
            if (!player.isOnline?.() && !((player === game.me && !_status.auto) || (player !== game.me && player.isUnderControl(true)))) {
                const count = Math.min(list.length, max || 1);
                const scored = list.map(id => ({ id: id, rank: lib.skill.zshy_Hhuanhun.soulRank(id, 'out') }));
                scored.sort((a, b) => discarding ? a.rank - b.rank : b.rank - a.rank);
                return scored.slice(0, count).map(x => x.id);
            }
            const videoId = lib.status.videoId++;
            game.broadcastAll((videoId, prompt, list) => {
                const dialog = ui.create.dialog(prompt + '（点选后点击“确定”）', [list, 'character'], 'hidden');
                dialog.videoId = videoId;
                ui.dialogs.add(dialog);
            }, videoId, prompt, list.slice());
            try {
                const next = player.chooseButton(true)
                    .set('dialog', videoId)
                    .set('selectButton', [min ?? 1, max ?? 1])
                    .set('zshySoulDiscarding', discarding)
                    .set('ai', button => (get.event().zshySoulDiscarding ? -1 : 1) * lib.skill.zshy_Hhuanhun.soulRank(button.link, 'out'));
                const result = await requireCharacterConfirmation(next).forResult();
                return result?.bool && result.links ? result.links.filter(id => list.includes(id)) : [];
            } finally {
                game.broadcastAll(videoId => {
                    const dialog = get.idDialog(videoId);
                    if (dialog) { dialog.close(); dialog.delete(); ui.dialogs.remove(dialog); }
                }, videoId);
            }
        },
        updateName(player, basename) {
            game.broadcastAll(function (hunId, name) {
                lib.translate[hunId] = name;
                for (const p of game.players) {
                    if (p.name === hunId && p.node && p.node.name) p.node.name.innerHTML = get.slimName(hunId);
                }
            }, 'zshy_AAYBhun', '魂' + basename);
        },
        updateMark(player) {
            if (player.markSkill) player.markSkill('zshy_Hhuanhun');
            if (player.updateMarks) player.updateMarks('zshy_Hhuanhun');
            if (player.syncStorage) player.syncStorage('zshy_Hhuanhun');
        },
        async compensate(player) {
            await player.chooseDrawRecover(true);
        },
        async gainSouls(player, count, drawWhenEmpty = false) {
            const storage = player.storage.zshy_Hhuanhun;
            if (!storage || !storage.basename) return;
            const newList = [];
            for (let i = 0; i < count; i++) {
                const pool = lib.skill.zshy_Hhuanhun.sameNameCharacters(storage.avatar || storage.basename);
                const remain = pool.filter(id => !storage.souls.includes(id));
                if (!remain.length) {
                    if (drawWhenEmpty) await player.draw(1); // 受伤逐点补偿；重铸池空不补偿。
                    else break;
                    continue;
                }
                const id = remain.randomGet();
                storage.souls.push(id);
                newList.push(id);
                game.log(player, '获得了一张', '#y「魂」');
            }
            lib.skill.zshy_Hhuanhun.drawSouls(player, newList);
            lib.skill.zshy_Hhuanhun.updateMark(player);
        },
        async applySoul(player, id) {
            const storage = player.storage.zshy_Hhuanhun;
            if (!storage || !lib.skill.zshy_Hhuanhun.selectableSouls(player).includes(id)) return false;
            const character = get.character(id);
            const data = lib.character[id] || {};
            const skills = (data.skills || character[3] || []).filter(function (skill) {
                if (skill === 'zshy_Hhuanhun') return false;
                const info = get.info(skill);
                return !(info && info.NihilismSkill);
            });
            storage.current = id;
            storage.skills = skills;
            if (player.removeAdditionalSkills) await player.removeAdditionalSkills('zshy_Hhuanhun');
            if (character[0]) game.broadcastAll(function (p, sex) { p.sex = sex; }, player, character[0]);
            if (character[1]) await player.changeGroup(character[1]);
            player.setAvatar(player.name, id);
            setTimeout(function () {
                player.setAvatar(player.name, storage.avatar);
            }, 1000);
            if (skills.length) await player.addAdditionalSkills('zshy_Hhuanhun', skills, true);
            player.update();
            lib.skill.zshy_Hhuanhun.updateMark(player);
            return true;
        },
        async chooseSoulToApply(player, excludeCurrent = false, compensateWhenEmpty = false) {
            const skill = lib.skill.zshy_Hhuanhun;
            const pool = skill.selectableSouls(player, excludeCurrent);
            if (!pool.length) {
                if (compensateWhenEmpty) await skill.compensate(player);
                return false;
            }
            const links = await skill.chooseSoul(player, pool, '还魂：请选择一张未锁定的「魂」。将你的势力、性别调整为该武将牌，并视为拥有其技能', 1, 1);
            if (pool.includes(links[0])) return await skill.applySoul(player, links[0]);
            return false;
        },
        async finishRound(player) {
            const skill = lib.skill.zshy_Hhuanhun;
            const storage = player.storage.zshy_Hhuanhun;
            await player.gainMaxHp(1);
            await player.recover(1);
            const id = storage.current;
            if (id && skill.selectableSouls(player).includes(id)) {
                const data = lib.character[id] || get.character(id) || {};
                const skills = (data.skills || data[3] || []).filter(name => name !== 'zshy_Hhuanhun' && !player.skills.includes(name));
                // 保留这张魂以防重新抽到；在可能触发嵌套事件的技能授予前登记锁定。
                if (!storage.lockedSouls) storage.lockedSouls = [];
                storage.lockedSouls.push(id);
                // 先转为正式技能，再移除当前展示魂的附加来源。两者重名时不会误删。
                // 绝恒技是否可获得仍由项目统一的 changeSkills/addSkill 保护层判断。
                if (skills.length) await player.addSkills(skills);
                if (storage.current === id) {
                    storage.current = null;
                    storage.skills = [];
                    await player.removeAdditionalSkills('zshy_Hhuanhun');
                }
                skill.updateMark(player);
            }
            await skill.chooseSoulToApply(player, false, true);
        },
        async initHuanhun(player) {
            refreshNameLibrary();
            const pool = lib.skill.zshy_Hhuanhun.initialCharacters();
            const avatar = await lib.skill.zshy_Hhuanhun.chooseFromPool(player, pool, '还魂：请选择一张场上未登场的武将牌作为本局武将图。复制其初始体力、体力上限、势力与性别，将武将名改为「魂」+去除前缀后的名字，并获得所选武将牌及随机的一张其他同名「魂」');
            if (!avatar || !pool.includes(avatar)) return;
            const character = get.character(avatar);
            const data = lib.character[avatar] || {};
            const basename = lib.skill.zshy_Hhuanhun.cleanName(avatar);
            const storage = { initialized: true, avatar: avatar, basename: basename, souls: [], lockedSouls: [], current: null, skills: [] };
            player.storage.zshy_Hhuanhun = storage;
            lib.skill.zshy_Hhuanhun.updateName(player, basename);
            // 选完武将图立即替换立绘（立绘/阵亡音效跟随武将图）
            player.setAvatar(player.name, avatar);
            game.broadcastAll(function (hunId, chosenId) {
                const dieAudios = lib.character[chosenId] && lib.character[chosenId].dieAudios;
                if (dieAudios && dieAudios.length) lib.character[hunId].dieAudios = dieAudios.slice();
            }, 'zshy_AAYBhun', avatar);
            const BASE_MAXHP = 3;
            const maxHp = data.maxHp || data.hp || character.maxHp || character.hp || character[2] || 3;
            // init 时执行，主公 +1 等后续加成会在之后自然叠加，这里只处理有限占位差值
            let bonus = 0;
            if (Number.isFinite(player.maxHp)) bonus = Math.max(0, player.maxHp - BASE_MAXHP);
            else if (player.isZhu) bonus = 1;
            player.maxHp = maxHp + bonus;
            const hp = data.hp ?? character.hp ?? maxHp;
            player.hp = Math.min(player.maxHp, hp + bonus);
            if (character[0]) game.broadcastAll(function (p, sex) { p.sex = sex; }, player, character[0]);
            if (character[1]) await player.changeGroup(character[1]);
            player.update();
            const same = lib.skill.zshy_Hhuanhun.sameNameCharacters(avatar);
            storage.souls = [avatar]; // 开局武将图固定为第一张魂，另随机获得一张同名魂。
            const rest = same.filter(id => id !== avatar);
            if (rest.length) storage.souls.push(rest.randomGet());
            if (storage.souls.length < 2) {
                await player.gainMaxHp(1);
                await player.recover(1);
            }
            lib.skill.zshy_Hhuanhun.drawSouls(player, storage.souls.slice());
            lib.skill.zshy_Hhuanhun.updateMark(player);
            await lib.skill.zshy_Hhuanhun.chooseSoulToApply(player);
        },

        async prepareSouls(event, trigger, player) {
            const skill = lib.skill.zshy_Hhuanhun;
            const storage = player.storage.zshy_Hhuanhun;
            const available = skill.selectableSouls(player, true);
            if (!available.length) return;
            const controls = ['替换「魂」'];
            if (game.roundNumber > 0) controls.push('重铸「魂」');
            controls.push('取消');
            const { control } = await player.chooseControl(...controls)
                .set('prompt', '还魂·准备阶段：替换展示的「魂」，或重铸至多当前轮数张未展示、未锁定的「魂」。已锁定的「魂」本局不能再选择或弃置')
                .set('ai', () => {
                    const st = player.storage.zshy_Hhuanhun;
                    if (!st) return '取消';
                    const curRank = st.current ? lib.skill.zshy_Hhuanhun.soulRank(st.current, 'out') : -1;
                    const best = lib.skill.zshy_Hhuanhun.getBestSoul(player, 'out');
                    if (best && best.rank > curRank + 0.5) return '替换「魂」';
                    const pool = lib.skill.zshy_Hhuanhun.sameNameCharacters(st.avatar || st.basename);
                    const unowned = pool.filter(id => !st.souls.includes(id));
                    const weak = skill.selectableSouls(player, true).some(id => skill.soulRank(id, 'out') < curRank);
                    if (weak && unowned.length && controls.includes('重铸「魂」')) return '重铸「魂」';
                    return '取消';
                })
                .forResult();
            if (control === '取消' || !control) return;
            if (control === '替换「魂」') {
                await skill.chooseSoulToApply(player, true);
                return;
            }
            if (control !== '重铸「魂」') return;
            const candidates = skill.selectableSouls(player, true);
            const max = Math.min(game.roundNumber, candidates.length);
            if (max <= 0) return;
            const chosen = await skill.chooseSoul(player, candidates, '还魂：请选择要重铸的未展示、未锁定「魂」（本次至多 ' + max + ' 张）', 1, max, true);
            const links = [...new Set(chosen)].filter(id => skill.selectableSouls(player, true).includes(id)).slice(0, max);
            if (!links.length) return;
            for (const id of links) {
                storage.souls.remove(id);
            }
            skill.loseSouls(player, links);
            await skill.gainSouls(player, links.length);

        },

        group: ['zshy_Hhuanhun_prepare'],

        subSkill: {
            prepare: {
                trigger: { global: 'phaseZhunbei' },
                forced: true,
                popup: false,
                charlotte: true,
                filter(event, player) { return event.name === 'phaseZhunbei' && !!player.storage.zshy_Hhuanhun?.initialized; },
                async content(event, trigger, player) { await lib.skill.zshy_Hhuanhun.prepareSouls(event, trigger, player); },
            },
        },
    },
};

const skill = {
    ...光阴长河,
    ...wxgySkill,
};

export default skill;
