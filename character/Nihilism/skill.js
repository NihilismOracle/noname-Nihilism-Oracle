import { lib, game, ui, get, ai, _status } from '../../../../noname.js'
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
        forceunique: true,
        noDisabled: true,
        charlotte: true,
        noDeprive: true,
        nobracket: true,
        ruleSkill: true,
        noRemove: true,
        forceDie: true,
        firstDo: true,
        noLose: true,
        noGain: true,
        unique: true,
        locked: true,
        noAdd: true,
        fixed: true,
        priority: Infinity,
        async init(player) {
            if (!player.isDisabledJudge()) {
                await player.disableJudge();
            };
            const first = player.name1, second = 'zshy_AAAAantianhen';
            lib.element.player.uninit.call(player);
            lib.element.player.init.call(player, first, second);
            if (game.countPlayer(function (target) {
                return target.identity == 'unknown' || target.group == 'unknown' || target.name1 == 'unknown' || target.name2 == 'unknown';
            }) > 0) {
                game.showIdentity(true);
            }
            await game.delay(0.2);
            function getAllExistingIdentities() {
                const identities = [];
                game.players.forEach(player => {
                    if (player.identity && !identities.includes(player.identity)) {
                        identities.push(player.identity);
                    }
                    if (player.trueIdentity && !identities.includes(player.trueIdentity)) {
                        identities.push(player.trueIdentity);
                    }
                });
                game.dead.forEach(player => {
                    if (player.identity && !identities.includes(player.identity)) {
                        identities.push(player.identity);
                    }
                });
                return Array.from(identities).filter(id => id !== 'unknown');
            };
            const targets = game.players.sortBySeat();
            const identities = getAllExistingIdentities();
            await Promise.all(targets.map(async function (target) {
                const result = await player.chooseControl(identities)
                    .set('prompt', '〖神尊〗：请分配' + get.translation(target) + '的身份牌')
                    .set('ai', function () {
                        return player.identity;
                    }).forResult();
                if (result && result.control) {
                    target.identity = result.control;
                    if (get.mode() == 'guozhan') {
                        target.group = result.control;
                    }
                    target.setIdentity();
                }
            }))
            await game.delay(0.2);
            if (game.countPlayer(function (target) {
                return target.identity != player.identity;
            }) == 0) {
                const overResult = await player.chooseBool().set('prompt', '〖神尊〗：是否获得胜利？').forResult();
                if (overResult && overResult.bool) {
                    await game.over(true);
                }
            };
            await game.delay(0.2);
        },
        trigger: {
            global: ['dieBegin', 'roundStart', 'changeHpBegin', 'damageBegin', 'loseHpBegin', 'recoverBegin', 'gainMaxHpBegin', 'loseMaxHpBegin'],
        },
        async cost(event, trigger, player) {
            event.result = await player.chooseBool()
                .set('prompt', get.translation(event.skill))
                .set('prompt2', `是否立即执行1个出牌阶段`)
                .set('ai', function () {
                    return true;
                })
                .forResult();
        },
        async content(event, trigger, player) {
            const next = player.phaseUse();
            event.next.remove(next);
            trigger.next.push(next);
        },
        ai: {
            //本身就是最高威胁：所有 AI 都应该优先处理
            threaten: 2,
        },
    },
    zshy_AJxuwu: {//虚无
        audio: 'ext:诸神寰宇/audio/character:2',
        superCharlotte: true,
        NihilismSkill: true,
        forceunique: true,
        noDisabled: true,
        charlotte: true,
        noDeprive: true,
        nobracket: true,
        ruleSkill: true,
        noRemove: true,
        forceDie: true,
        firstDo: true,
        noLose: true,
        noGain: true,
        unique: true,
        forced: true,
        noAdd: true,
        fixed: true,
        priority: Infinity,
        enable: ['chooseToUse', 'chooseToRespond'],
        hiddenCard: true,
        filter(event, player) {
            for (const i of lib.inpile) {
                const type = get.type2(i), filter = event.filterCard;
                if ((type == 'basic' || type == 'trick' || type == 'delay' || type == 'zshy_feisheng') && filter({ name: i }, player, event)) return true;
            }
            return false;
        },
        prompt(event, player) {
            return '发动〖虚无〗，视为使用或打出一张基本/锦囊/飞升牌';
        },
        chooseButton: {
            dialog(event, player) {
                const list = [];
                for (const i of lib.inpile) {
                    const type = get.type2(i), filter = event.filterCard;
                    if (type == 'basic') {
                        if (filter({ name: i }, player, event)) list.push(['基本', '', i]);
                        if (i == 'sha') {
                            for (const j of lib.inpile_nature) {
                                if (filter({ name: i, nature: j }, player, event)) list.push(['基本', '', 'sha', j]);
                            }
                        }
                    }
                    if (type == 'trick' || type == 'delay') {
                        if (filter({ name: i }, player, event)) list.push(['锦囊', '', i]);
                    }
                    if (type == 'zshy_feisheng') {
                        if (filter({ name: i }, player, event)) list.push(['飞升', '', i]);
                    }
                }
                return ui.create.dialog('虚无', [list, 'vcard'], 'hidden');
            },
            filter(button, player) {
                return _status.event.getParent().filterCard({ name: button.link[2] }, player, _status.event.getParent());
            },
            check(button) {
                const player = _status.event.player;
                //带上属性，让化出来的【杀】等按真实收益评估
                return player.getUseValue({ name: button.link[2], nature: button.link[3] }) + 1;
            },
            backup(links, player) {
                return {
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
            cardEnable() {
                return true;
            },
            ignoredHandcard() {
                return true;
            },
            cardGainable() {
                return false;
            },
            cardDiscardable() {
                return false;
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
            aiOrder(card) {
                if (get.name(card) == 'sha') return Infinity;
            },
        },
        ai: {
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
        forceunique: true,
        noDisabled: true,
        charlotte: true,
        noDeprive: true,
        nobracket: true,
        ruleSkill: true,
        noRemove: true,
        forceDie: true,
        firstDo: true,
        noLose: true,
        noGain: true,
        unique: true,
        locked: true,
        noAdd: true,
        fixed: true,
        priority: Infinity,
        trigger: {
            player: 'useCardToPlayered',
            global: 'phaseBefore',
        },
        filter(event, player, name) {
            if (name == 'phaseBefore') {
                return event.player.group != player.group || event.player.identity != player.identity;
            }
            return event.target?.isIn() && (event.target.group != player.group || event.target.identity != player.identity);
        },
        prompt2(event, player, name) {
            if (name == 'phaseBefore') {
                return `令${get.translation(event.player)}的势力与身份改为与你相同`;
            }
            return `令${get.translation(event.card)}对${get.translation(event.target)}无效，然后其势力与身份改为与你相同`;
        },
        check() {
            return true;
        },
        async content(event, trigger, player) {
            if (event.triggername == 'useCardToPlayered') {
                trigger.excluded.push(trigger.target);
            }
            const target = event.triggername == 'useCardToPlayered' ? trigger.target : trigger.player;
            target.group = player.group;
            target.identity = player.identity;
            target.setIdentity();
            if (game.countPlayer(current => current.identity != player.identity) == 0) {
                game.over(true);
            };
        },
    },
    zshy_AJhuanhun: {//唤魂
        audio: 'ext:诸神寰宇/audio/character:2',
        superCharlotte: true,
        NihilismSkill: true,
        forceunique: true,
        noDisabled: true,
        charlotte: true,
        noDeprive: true,
        nobracket: true,
        ruleSkill: true,
        noRemove: true,
        forceDie: true,
        firstDo: true,
        noLose: true,
        noGain: true,
        unique: true,
        forced: true,
        noAdd: true,
        fixed: true,
        popup: false,
        trigger: {
            global: ['phaseAnyBegin'],
        },
        async content(event, trigger, player) {
            if (player.name1 != 'Nihilism_AAAAanjing') {
                await player.reinit(player.name1, 'Nihilism_AAAAanjing');
            }
            if (player.name2 != undefined && player.name2 != 'zshy_AAAAantianhen') {
                await player.reinit(player.name2, 'zshy_AAAAantianhen');
            }
            if (player.isTurnedOver(true)) {
                await player.turnOver(false);
            }
            if (player.isLinked(true)) {
                await player.link(false);
            }
            if (!player.isAlive()) {
                await player.revive();
                game.addVideo('revive', player);
                event.dead = player;
            };
            player.maxHp = Infinity;
            player.hujia = Infinity;
            player.hp = Infinity;
            await player.update();
            await game.delay();
        },
    },
    zshy_AJshenzuninfo: {//神尊
        audio: 'ext:诸神寰宇/audio/character:2',
        superCharlotte: true,
        NihilismSkill: true,
        forceunique: true,
        noDisabled: true,
        charlotte: true,
        noDeprive: true,
        nobracket: true,
        ruleSkill: true,
        noRemove: true,
        forceDie: true,
        firstDo: true,
        noLose: true,
        noGain: true,
        unique: true,
        locked: true,
        noAdd: true,
        fixed: true,
        priority: Infinity,
    },
    zshy_AJxuwuinfo: {//虚无
        audio: 'ext:诸神寰宇/audio/character:2',
        superCharlotte: true,
        NihilismSkill: true,
        forceunique: true,
        noDisabled: true,
        charlotte: true,
        noDeprive: true,
        nobracket: true,
        ruleSkill: true,
        noRemove: true,
        forceDie: true,
        firstDo: true,
        noLose: true,
        noGain: true,
        unique: true,
        locked: true,
        noAdd: true,
        fixed: true,
        priority: Infinity,
    },
    zshy_AJjinmieinfo: {//烬灭
        audio: 'ext:诸神寰宇/audio/character:2',
        superCharlotte: true,
        NihilismSkill: true,
        forceunique: true,
        noDisabled: true,
        charlotte: true,
        noDeprive: true,
        nobracket: true,
        ruleSkill: true,
        noRemove: true,
        forceDie: true,
        firstDo: true,
        noLose: true,
        noGain: true,
        unique: true,
        locked: true,
        noAdd: true,
        fixed: true,
        priority: Infinity,
    },
    zshy_AJhuanhuninfo: {//唤魂
        audio: 'ext:诸神寰宇/audio/character:2',
        superCharlotte: true,
        NihilismSkill: true,
        forceunique: true,
        noDisabled: true,
        charlotte: true,
        noDeprive: true,
        nobracket: true,
        ruleSkill: true,
        noRemove: true,
        forceDie: true,
        firstDo: true,
        noLose: true,
        noGain: true,
        unique: true,
        locked: true,
        noAdd: true,
        fixed: true,
        priority: Infinity,
    },

    zshy_AllSkill: {//神祇
        NihilismSkill: true,
        forced: true,
        async init(player) {
            if (!player.isDisabledJudge()) {
                await player.disableJudge();
            };
        },
        trigger: {
            global: ['useCard', 'respond'],
        },
        filter(event, player) {
            return event.player != player;
        },
        async content(event, trigger, player) {
            await player.chooseDrawRecover(true);
            await player.chooseToUse();
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

    },

    //安天痕
    zshy_AAAAkuiming: {//馈命
        audio: 'ext:诸神寰宇/audio/character:2',
        NihilismSkill: true,
        forced: true,
        trigger: { player: 'dieBegin' },
        async content(event, trigger, player) {
            trigger.cancel();
            if (!player.isAlive()) {
                await player.revive();
                game.addVideo('revive', player);
                event.dead = player;
            };
            player.maxHp = 1;
            player.hp = 1;
            await player.update();
            const targets = game.filterPlayer(function (target) {
                return target != player;
            }).sortBySeat()
            for (const i of targets) {
                const num = Math.max(0, i.hp - 1);
                if (i.maxHp !== num) {
                    if (i.maxHp > num) await i.loseMaxHp(i.maxHp - num);
                    else await i.gainMaxHp(num - i.maxHp);
                    if (i.hp > i.maxHp) i.hp = i.maxHp;
                }
                await i.update();
                if (i.maxHp <= 0) {
                    event._dyinged = true;
                    await i.dying(event);
                }
            };
            await game.delay();
            const next = player.phaseUse();
            event.next.remove(next);
            trigger.next.push(next);
        },
        ai: {
            maixie: true,
            maixie_hp: true,
            effect: {
                target(card, player, target) {
                    if (get.tag(card, 'save') || get.tag(card, 'recover')) return 'zeroplayertarget';
                },
                player(card, player, target) {
                    if (get.tag(card, 'save') || get.tag(card, 'recover')) return 'zeroplayertarget';
                }
            },
        },
    },
    zshy_ATHmingying: {//命影
        audio: 'ext:诸神寰宇/audio/character:2',
        NihilismSkill: true,
        forced: true,
        trigger: {
            global: ['damageAfter', 'gainMaxHpAfter'],
        },
        filter(event, player) {
            return event.player != player;
        },
        async content(event, trigger, player) {
            if (trigger.name == 'damage') await player.damage(trigger.num);
            if (trigger.name == 'gainMaxHp') await player.gainMaxHp(trigger.num);
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

    //灭魂
    zshy_MHxihun: {//戏魂
        audio: 'ext:诸神寰宇/audio/character:2',
        NihilismSkill: true,
        forced: true,
        async init(player) {
            const first = player.name1, second = lib.rank.rarity.legend.randomGet();
            lib.element.player.uninit.call(player);
            lib.element.player.init.call(player, first, second);
        },
        trigger: { player: 'dieBegin' },
        async content(event, trigger, player) {
            trigger.cancel();
            if (!player.isAlive()) {
                await player.revive();
                game.addVideo('revive', player);
                event.dead = player;
            };
            const first = 'zshy_AAAAmiehun', second = lib.rank.rarity.legend.randomGet();
            lib.element.player.uninit.call(player);
            lib.element.player.init.call(player, first, second);
            player.maxHp = 1;
            player.hp = 1;
            await player.update();
            const targets = game.filterPlayer(function (target) {
                return target != player;
            }).sortBySeat()
            for (const i of targets) {
                const num = Math.max(0, i.hp - 1);
                if (i.maxHp !== num) {
                    if (i.maxHp > num) await i.loseMaxHp(i.maxHp - num);
                    else await i.gainMaxHp(num - i.maxHp);
                    if (i.hp > i.maxHp) i.hp = i.maxHp;
                }
                await i.update();
                if (i.maxHp <= 0) {
                    event._dyinged = true;
                    await i.dying(event);
                }
            };
            await game.delay();
            const next = player.phaseUse();
            event.next.remove(next);
            trigger.next.push(next);
        },
        ai: {
            maixie: true,
            maixie_hp: true,
            effect: {
                target(card, player, target) {
                    if (get.tag(card, 'save') || get.tag(card, 'recover')) return `zeroplayertarget`;
                },
                player(card, player, target) {
                    if (get.tag(card, 'save') || get.tag(card, 'recover')) return `zeroplayertarget`;
                }
            },
        },
    },

    //盅墨
    zshy_ZMxuemo: {//血墨
        audio: 'ext:诸神寰宇/audio/character:2',
        NihilismSkill: true,
        forced: true,
        async init(player) {
            await game.delay(0.2);
            if (game.hasPlayer(function (target) {
                return target.getSkills().length > 1;
            })) {
                const result = await player.chooseTarget(`【血墨】：选择任意名其他角色，其选择1个技能保留并令你立即获得其失去的技能`, [1, Infinity], function (card, player, target) {
                    return target != player && target.getSkills().length > 1;
                }).set('ai', function (target) {
                    const player = _status.event.player;
                    //只对敌人下手：技能越多，抢到的越多
                    if (get.attitude(player, target) >= 0) return 0;
                    return target.getSkills().length;
                }).forResult();
                if (result && result.targets) {
                    const targets = result.targets.sortBySeat();
                    for (const i of targets) {
                        const skills = i.getSkills(), list = [];
                        for (const skill of skills) {
                            list.push([skill, '<div class="popup text" style="width:calc(100%-10px);display:inline-block"><div class="skill">【' +
                                get.translation(skill) + '】</div><div>' + lib.translate[skill + '_info'] + '</div></div>',
                            ])
                        }
                        const result1 = await i.chooseButton([
                            `【血墨】：选择1个保留`,
                            [list, 'textbutton'],
                        ]).set('forced', true).set('selectButton', 1).set('ai', function (button) {
                            //保留自己最有价值的技能
                            return get.skillRank(button.link, 'in') + get.skillRank(button.link, 'out');
                        }).set('skills', skills).forResult();
                        if (result1?.bool) {
                            const rskills = skills.reduce((acc, item) => {
                                if (!result1.links.includes(item)) acc.push(item);
                                return acc;
                            }, []);
                            i.removeSkills(rskills.slice(0));
                            player.addSkills(rskills.slice(0));
                        }
                    };
                    await player.update();
                    await game.delay();
                }
            }
        },
        trigger: { player: 'dieBegin' },
        async content(event, trigger, player) {
            trigger.cancel();
            if (!player.isAlive()) {
                await player.revive();
                game.addVideo('revive', player);
                event.dead = player;
            };
            player.maxHp = 1;
            await player.recoverTo(player.maxHp);
            const targets = game.filterPlayer(function (target) {
                return target != player;
            }).sortBySeat()
            for (const i of targets) {
                const num = Math.max(0, i.maxHp - 1);
                if (i.maxHp !== num) {
                    if (i.maxHp > num) await i.loseMaxHp(i.maxHp - num);
                    else await i.gainMaxHp(num - i.maxHp);
                    if (i.hp > i.maxHp) i.hp = i.maxHp;
                }
                await i.update();
                if (i.maxHp <= 0) {
                    event._dyinged = true;
                    await i.dying(event);
                }
            };
            await player.update();
            await game.delay();
        },
        mod: {
            targetEnabled(card, player, target) {
                if (target != player) return false;
            },
        },
        ai: {
            maixie: true,
            maixie_hp: true,
            effect: {
                target(card, player, target) {
                    if (get.tag(card, 'save') || get.tag(card, 'recover')) return `zeroplayertarget`;
                },
                player(card, player, target) {
                    if (get.tag(card, 'save') || get.tag(card, 'recover')) return `zeroplayertarget`;
                }
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
            if (!player.isAlive()) {
                await player.revive();
                game.addVideo('revive', player);
                event.dead = player;
            };
            player.maxHp = 1;
            await player.recoverTo(player.maxHp);
            const targets = game.filterPlayer(function (target) {
                return target != player;
            }).sortBySeat()
            for (const i of targets) {
                await i.damage('kami');
            };
        },
        ai: {
            maixie: true,
            maixie_hp: true,
            effect: {
                target(card, player, target) {
                    if (get.tag(card, 'save') || get.tag(card, 'recover')) return `zeroplayertarget`;
                },
                player(card, player, target) {
                    if (get.tag(card, 'save') || get.tag(card, 'recover')) return `zeroplayertarget`;
                }
            },
        },
    },
    zshy_ZLfenzui: {//焚罪
        audio: 'ext:诸神寰宇/audio/character:2',
        NihilismSkill: true,
        forced: true,
        trigger: {
            global: 'damageSource',
        },
        filter(event, player) {
            return event.source?.getSkills().length > 0 && event.source != player;
        },
        async content(event, trigger, player) {
            const num = trigger.num, i = trigger.source;
            if (i.getSkills().length <= num) {
                const skills = i.getSkills();
                i.removeSkills(skills);
            } else {
                const skills = i.getSkills(), list = [];
                for (const skill of skills) {
                    list.push([skill, '<div class="popup text" style="width:calc(100%-10px);display:inline-block"><div class="skill">【' +
                        get.translation(skill) + '】</div><div>' + lib.translate[skill + '_info'] + '</div></div>',
                    ])
                }
                const result = await i.chooseButton([
                    `【焚罪】：选择${num}个技能失去`,
                    [list, 'textbutton'],
                ]).set('forced', true).set('selectButton', num).set('ai', function (button) {
                    //优先失去价值最低的技能
                    return -(get.skillRank(button.link, 'in') + get.skillRank(button.link, 'out'));
                }).set('skills', skills).forResult();
                if (result?.bool) {
                    i.removeSkills(result.links.slice(0));
                }
            }
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
        trigger: {
            player: 'useCardToTargeted',
        },
        filter(event, player) {
            return event.target != player;
        },
        prompt2(event, player) {
            return '获得' + get.translation(event.target) + '随机1个你未拥有的技能并对其造成1点神属性伤害'
        },
        check(event, player) {
            const att = get.attitude(player, event.target);
            if (att < 0) return true;
            //中立角色身上有值得抢的技能时也值得发动
            if (att > 0) return false;
            return event.target.getSkills(true, false).some(skill => !player.hasSkill(skill) && lib.translate[skill + '_info']);
        },
        async content(event, trigger, player) {
            const skill = trigger.target.getSkills(true, false).filter(skill => {
                if (skill == 'jiu') return false;
                if (player.hasSkill(skill)) return false;
                if (!lib.translate[skill + '_info']) return false;
                if (lib.translate[skill + '_info'] == '') return false;
                var info = get.info(skill);
                if (!info) return false;
                return true;
            }).randomGet();
            if (skill) await player.addSkills(skill);
            await trigger.target.damage('kami');
        },
        ai: {
            expose: 0.5,
            threaten: 1.5,
        },
    },
    zshy_ARzuifa: {//罪罚
        NihilismSkill: true,
        trigger: {
            global: ['changeHpBefore'],
        },
        async content(event, trigger, player) {
            const num = trigger.num > 0 ? trigger.num : -trigger.num;
            const str = '令任意名其他角色随机失去' + num + '个技能并对其造成' + num + '点神属性伤害';
            const result = await player.chooseTarget(get.prompt('zshy_ARzuifa'), str, [1, Infinity], function (event, target, player) {
                return target != player;
            }).set('ai', function (target) {
                const player = _status.event.player;
                return get.damageEffect(target, player, player, 'kami') > 0;
            }).forResult();
            if (result.bool) {
                for (const i of result.targets.sortBySeat()) {
                    const skill = i.getSkills(true, false).filter(skill => {
                        if (skill == 'jiu') return false;
                        if (!lib.translate[skill + '_info']) return false;
                        if (lib.translate[skill + '_info'] == '') return false;
                        var info = get.info(skill);
                        if (!info) return false;
                        return true;
                    }).randomGet(num);
                    i.removeSkills(skill);
                    await i.damage(num, 'kami');
                };
            }
        },
        ai: {
            expose: 1,
            maixie: true,
            maixie_hp: true,
            threaten: 1.5,
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
