import { lib, game, ui, get, ai, _status } from '../../../../noname.js'
const 袖里乾坤 = {
    //墟曹纯
    zshy_MBshanjia: {//缮甲
        audio: 'shanjia',
        trigger: {
            global: 'phaseZhunbeiBegin',
            player: 'damageEnd',
        },
        forced: true,
        async content(event, trigger, player) {
            await player.draw(3);
            const num = 3;
            let result;
            if (num > 0) {
                result = await player
                    .chooseToDiscard({
                        position: 'h',
                        forced: true,
                        selectCard: num,
                        ai: card => -get.value(card),
                    })
                    .forResult();
            }
            if (result?.cards?.length) {
                const cards = result.cards;
                for (const card of cards) {
                    const type = get.type(card, 'trick', card.original === 'h' ? player : false);
                    if (type === 'basic') {
                        await player.chooseUseTarget({
                            card: new lib.element.VCard({ name: 'sha', isCard: true }),
                            addCount: false,
                            prompt: '缮甲：是否视为使用一张无任何次数限制的【杀】？',
                        });
                    }
                    if (type === 'trick') {
                        await player.addTempSkill('zshy_MBshanjia_nodis');
                    }
                    if (type === 'equip') {
                        await player.changeHujia();
                    }
                }
            }
        },
        ai: {
            threaten: 3,
            noe: true,
        },
        subSkill: {
            nodis: {
                mark: true,
                charlotte: true,
                intro: { content: '使用牌无距离限制' },
                mod: {
                    targetInRange: () => true,
                },
            },
        },
    },

    //墟凌操
    zshy_dujin: {//独进
        audio: `dujin`,
        trigger: { player: 'phaseDrawBegin2' },
        preHidden: true,
        forced: true,
        filter(event, player) {
            return !event.numFixed;
        },
        check() {
            return true;
        },
        async content(event, trigger, player) {
            let equip = 0;
            for (const p of game.players) equip += p.countCards('e');
            trigger.num += 1 + Math.ceil(equip / 2);
        },
        group: ['zshy_dujin_jiliu'],
        subSkill: {
            jiliu: {
                audio: `dujin`,
                trigger: {
                    player: 'damageEnd',
                },
                forced: true,
                async content(event, trigger, player) {
                    const next = player.phaseDraw();
                    event.next.remove(next);
                    trigger.next.push(next);
                },
                ai: {
                    maixie: true,
                },
            },
        },
    },

    //墟司马师
    zshy_baiyi: {//败移
        audio: 'baiyi',
        trigger: {
            player: ['damageEnd', 'phaseZhunbeiBegin'],
        },
        skillAnimation: true,
        animationColor: 'thunder',
        async cost(event, trigger, player) {
            event.result = await player.chooseTarget(get.prompt2(event.skill), 2)
                .set('ai', function (target) {
                    let player = _status.event.player;
                    if (player == _status.currentPhase) {
                        if (get.attitude(player, _status.currentPhase.next) < 2 || get.attitude(player, target) < 2) {
                            return 1;
                        }
                        if (ui.selected.targets.length && get.attitude(player, target) > 2) {
                            return 1;
                        }
                    };
                    if (player != _status.currentPhase) {
                        if (player != _status.currentPhase.next) {
                            return 1;
                        };
                        if (get.attitude(player, _status.currentPhase.next) < 2 || get.attitude(player, target) < 2) {
                            return 1;
                        };
                    }
                }).forResult();
        },
        async content(event, trigger, player) {
            const target1 = event.targets[0];
            const target2 = event.targets[1];
            game.broadcastAll(
                function (target1, target2) {
                    game.swapSeat(target1, target2);
                },
                target1, target2
            );
            await player.draw(target1.getSeatNum() + target2.getSeatNum());
        },
        ai: {
            order() {
                return get.order({ name: 'tao' }) + 1;
            },
            result: {
                target(player, target) {
                },
            },
        },
    },
    zshy_jinglve: {//景略
        audio: 'jinglve',
        trigger: {
            global: 'phaseUseBegin',
        },
        forced: true,
        filter(event, player) {
            return event.player.countCards('h') || (event.player == player && game.countPlayer(function (current) {
                return current.countCards('h') > 0;
            }) > 0);
        },
        async content(event, trigger, player) {
            if (trigger.player == player) {
                const result = await player.chooseTarget(get.translation(event.name), `选择一名其他角色作为【景略】的目标`, function (card, player, target) {
                    return target != player;
                }).set('ai', function (target) {
                    return get.attitude(_status.event.player, target) < 0;
                }).forResult();
                if (result?.targets) {
                    const result1 = await player.chooseButton([`选择一张牌作为「死士」`, result.targets[0].getCards('h'),], true)
                        .set('ai', function (button) {
                            var card = button.link;
                            return get.value(card);
                        }).forResult();
                    if (result1.bool) {
                        player.markAuto('zshy_jinglve4', [result.targets[0]]);
                        player.storage.zshy_jinglve2 = result.targets[0];
                        player.storage.zshy_jinglve3 = result1.links[0];
                        player.addSkill('zshy_jinglve2');
                    };
                }
            }
            else {
                const result = await player.chooseButton([`选择一张牌作为「死士」`, trigger.player.getCards('h'),]).set('ai', function (button) {
                    var target = _status.event.getParent().trigger.player;
                    if (get.attitude(player, target) > 1) {
                        return 'cancel2';
                    }
                    var card = button.link;
                    return get.value(card);
                }).forResult();
                if (result.bool) {
                    player.markAuto('zshy_jinglve4', [trigger.player]);
                    player.storage.zshy_jinglve2 = trigger.player;
                    player.storage.zshy_jinglve3 = result.links[0];
                    player.addSkill('zshy_jinglve2');
                }
            }
        },
        ai: {
            order: 12,
            result: {
                target: -1,
            },
        },
    },
    zshy_jinglve2: {
        mark: true,
        intro: {
            name: '死士',
            mark(dialog, content, player) {
                dialog.addText('记录目标');
                dialog.add([content]);
                if (player == game.me || player.isUnderControl()) {
                    dialog.addText('死士牌');
                    dialog.add([player.storage.zshy_jinglve3]);
                }
            },
        },
        sourceSkill: 'zshy_jinglve',
        onremove(player) {
            delete player.storage.zshy_jinglve2;
            delete player.storage.zshy_jinglve3;
        },
        trigger: { global: ['dieEnd', 'loseEnd', 'gainEnd'] },
        silent: true,
        lastDo: true,
        charlotte: true,
        filter(event, player) {
            if (event.name != 'gain' && event.player != player.storage.zshy_jinglve2) {
                return false;
            }
            return event.name == 'die' || (event.cards.includes(player.storage.zshy_jinglve3) && (event.name == 'gain' || (event.position != ui.ordering && event.position != ui.discardPile)));
        },
        content() {
            player.removeSkill('zshy_jinglve2');
        },
        group: 'zshy_jinglve3',
    },
    zshy_jinglve3: {
        audio: 'zshy_jinglve',
        trigger: {
            global: ['loseAfter', 'useCard', 'phaseAfter', 'cardsDiscardAfter', 'loseAsyncAfter'],
        },
        sourceSkill: 'zshy_jinglve',
        filter(event, player) {
            if (event.player && event.player != player.storage.zshy_jinglve2) {
                return false;
            }
            var card = player.storage.zshy_jinglve3;
            if (event.name == 'phase') {
                return player.storage.zshy_jinglve2.getCards('hej').includes(card);
            }
            if (event.name == 'useCard') {
                return event.cards.includes(card);
            }
            return get.position(card, true) == 'd' && event.getd().includes(card);
        },
        forced: true,
        charlotte: true,
        logTarget: 'player',
        async content(event, trigger, player) {
            if (trigger.name == 'useCard') {
                trigger.all_excluded = true;
                trigger.targets.length = 0;
                trigger.player.hp = 0;
                await trigger.player.update();
                event._dyinged = true;
                await trigger.player.dying(event);
            } else {
                if (trigger.name == 'phase') {
                    player.gain(player.storage.zshy_jinglve3, player.storage.zshy_jinglve2, 'giveAuto', 'bySelf');
                } else if (get.position(player.storage.zshy_jinglve3, true) == 'd') {
                    player.gain(player.storage.zshy_jinglve3, 'gain2');
                };
            }
            const next = player.phaseUse();
            await event.next.remove(next);
            trigger.next.push(next);
            player.removeSkill('zshy_jinglve2');
        },
    },
    zshy_shanli: {//擅立
        audio: 'shanli',
        trigger: { global: 'roundStart' },
        forced: true,
        skillAnimation: true,
        animationColor: 'thunder',
        async content(event, trigger, player) {
            const result = await player
                .chooseTarget('选择【擅立】的目标', true)
                .set('ai', function (target) {
                    var att = get.attitude(_status.event.player, target);
                    if (target == game.me || (target.isUnderControl() && target.isOnline())) {
                        return 2 * att;
                    }
                    return att;
                })
                .forResult();
            if (result.bool && result.targets) {
                const target = result.targets[0];
                player.line(target, 'green');
                game.log(player, '拥立', target);
                await target.gainMaxHp();
                let list = Object.keys(lib.character);
                _status.characterlist = list;
                _status.characterlist.randomSort();
                let chara = [];
                let skills = [];
                for (var i of _status.characterlist) {
                    var character = get.character(i);
                    if (character && character[3]) {
                        for (var j of character[3]) {
                            if (skills.includes(j) || target.hasSkill(j)) {
                                continue;
                            }
                            var info = get.info(j);
                            if (info && info.zhuSkill) {
                                skills.add(j);
                                chara.add(i);
                                continue;
                            }
                        }
                    }
                    if (skills.length >= 3) {
                        break;
                    }
                }
                if (!skills.length) {
                    event.finish();
                    return;
                }
                await target.addSkills(skills);
            }
        },
        ai: {
            combo: 'zshy_baiyi',
        },
    },

    //墟孙寒华
    zshy_chongxu: {//冲虚
        audio: 'chongxu',
        trigger: {
            player: ['phaseZhunbeiBegin', 'damageEnd'],
        },
        forced: true,
        async content(event, trigger, player) {
            let list = [];
            if (player.countMark('zshy_miaojian') < 2 && player.hasSkill('zshy_miaojian')) {
                list.push('修改【妙剑】');
            };
            if (player.countMark('zshy_lianhua') < 2 && player.hasSkill('zshy_lianhua')) {
                list.push('修改【莲华】');
            };
            if (!list.length) {
                player.recover();
                player.draw(3);
                return;
            }
            list.push('回复摸牌');
            const result = await player.chooseControl(list)
                .set('prompt', '【冲虚】：修改技能并摸一张牌，或回复1点体力并回复摸牌')
                .forResult();
            if (result.control != '回复摸牌') {
                let skill = result.control == '修改【妙剑】' ? 'zshy_miaojian' : 'zshy_lianhua';
                player.addMark(skill, 1, false);
                game.log(player, '修改了技能', '#g【' + get.translation(skill) + '】');
                player.draw();
                await player.gainMaxHp();
                await player.recover();
            } else {
                player.recover();
                player.draw(3);
            }
        },
        ai: {
            order: 10,
            result: {
                player: 1,
            },
        },
    },
    zshy_miaojian: {//妙剑
        audio: 'miaojian',
        enable: 'phaseUse',
        usable(event, player) {
            return player.countMark('zshy_miaojian') + 1;
        },
        filter(event, player) {
            var level = player.countMark('zshy_miaojian');
            if (event.filterCard({ name: 'sha', nature: 'stab' }, player, event)) {
                if (level == 2) {
                    return true;
                }
                if (level == 1 && player.countCards('hes') > 0
                ) {
                    return true;
                }
                if (level == 0 && player.hasCard(function (card) {
                    return get.type2(card) == 'basic';
                }, 'hes')) {
                    return true;
                }
            }
            if (event.filterCard({ name: 'dongzhuxianji' }, player, event)) {
                if (level == 2) {
                    return true;
                }
                if (level == 1 && player.countCards('hes') > 0) {
                    return true;
                }
                if (level == 0 && player.hasCard(function (card) {
                    return get.type2(card) != 'basic';
                }, 'hes')) {
                    return true;
                }
            }
            return false;
        },
        chooseButton: {
            dialog() {
                return ui.create.dialog('妙剑', [
                    [
                        ['基本', '', 'sha', 'stab'],
                        ['锦囊', '', 'dongzhuxianji'],
                    ],
                    'vcard',
                ]);
            },
            filter(button, player) {
                var event = _status.event.getParent(),
                    level = player.countMark('zshy_miaojian');
                if (button.link[2] == 'sha') {
                    if (!event.filterCard({ name: 'sha', nature: 'stab' }, player, event)) {
                        return false;
                    }
                    if (level == 2) {
                        return true;
                    }
                    if (level == 1) {
                        return player.countCards('hes') > 0;
                    }
                    return (
                        level == 0 &&
                        player.hasCard(function (card) {
                            return get.type2(card) == 'basic';
                        }, 'hes')
                    );
                }
                if (button.link[2] == 'dongzhuxianji') {
                    if (!event.filterCard({ name: 'dongzhuxianji' }, player, event)) {
                        return false;
                    }
                    if (level == 2) {
                        return true;
                    }
                    if (level == 1) {
                        return player.countCards('hes') > 0;
                    }
                    return (
                        level == 0 &&
                        player.hasCard(function (card) {
                            return get.type2(card) != 'basic';
                        }, 'hes')
                    );
                }
            },
            check(button) {
                var card = { name: button.link[2], nature: button.link[3] },
                    player = _status.event.player;
                return get.value(card, player) * get.sgn(player.getUseValue(card));
            },
            backup(links, player) {
                var index = links[0][2] == 'sha' ? 0 : 1,
                    level = player.countMark('zshy_miaojian');
                var next = {
                    audio: 'zshy_miaojian',
                    filterCard: [
                        [
                            function (card) {
                                return get.type2(card) == 'basic';
                            },
                            function () {
                                return true;
                            },
                            () => false,
                        ],
                        [
                            function (card) {
                                return get.type2(card) != 'basic';
                            },
                            function () {
                                return true;
                            },
                            () => false,
                        ],
                    ][index][level],
                    position: 'hes',
                    check(card) {
                        if (card) {
                            return 6.5 - get.value(card);
                        }
                        return 1;
                    },
                    viewAs: [
                        {
                            name: 'sha',
                            nature: 'stab',
                        },
                        {
                            name: 'dongzhuxianji',
                        },
                    ][index],
                };
                if (level == 2) {
                    next.selectCard = -1;
                    next.viewAs.isCard = true;
                }
                return next;
            },
            prompt(links, player) {
                var index = links[0][2] == 'sha' ? 0 : 1,
                    level = player.countMark('zshy_miaojian');
                return [
                    ['将一张基本牌当做刺【杀】使用', '将一张牌当做刺【杀】使用', '请选择刺【杀】的目标'],
                    ['将一张非基本牌当做【洞烛先机】使用', '将一张牌当做【洞烛先机】使用', '请选择【洞烛先机】的目标'],
                ][index][level];
            },
        },
        onremove: true,
        derivation: ['zshy_miaojian1', 'zshy_miaojian2'],
        subSkill: {
            backup: { audio: 'zshy_miaojian' }
        },
        ai: {
            order: 7,
            result: { player: 1 },
        },
    },
    zshy_lianhua: {//莲华
        audio: 'shhlianhua',
        derivation: ['zshy_lianhua1', 'zshy_lianhua2'],
        trigger: { target: 'useCardToTarget' },
        forced: true,
        filter(event, player) {
            return get.tag(event.card, 'damage') > 0.5;
        },
        async content(event, trigger, player) {
            await player.chooseDrawRecover(true);
            const level = player.countMark('zshy_lianhua');
            if (!level) {
                return;
            } else if (level == 2) {
                const eff = get.effect(player, trigger.card, trigger.player, trigger.player);
                const result = await trigger.player
                    .chooseToDiscard('he', `${get.translation(player)}发动了【莲华】`, `你可以弃置一张花色类别点数均与${get.translation(trigger.card)}不同的牌，或令${get.translation(trigger.card)}对其无效`, function (card) {
                        return get.suit(card) != get.suit(trigger.card) && get.type2(card) != get.type2(trigger.card) && get.number(card) != get.number(trigger.card);
                    })
                    .set('ai', card => {
                        if (get.event().eff > 0) {
                            return 10 - get.value(card);
                        }
                        return 0;
                    })
                    .set('eff', eff)
                    .forResult();
                if (!result?.bool) {
                    trigger.targets.remove(player);
                    trigger.getParent().triggeredTargets2.remove(player);
                    trigger.untrigger();
                }
            } else {
                const result = await player
                    .judge(card => {
                        return (get.suit(card) == 'spade' || get.suit(card) == 'heart') ? 1 : -1;
                    })
                    .set('judge2', result => result.bool)
                    .forResult();
                if (result?.bool) {
                    trigger.targets.remove(player);
                    trigger.getParent().triggeredTargets2.remove(player);
                    trigger.untrigger();
                }
            }
        },
        ai: {
            effect: {
                target_use(card, player, target, current) {
                    if (get.tag(card, 'damage') > 0.5 && current < 0) {
                        if (player.getCards('he', function (i) {
                            return get.suit(i) != get.suit(card) && get.type2(i) != get.type2(card) && get.number(i) != get.number(card);
                        }) > 0) {
                            return 0.7;
                        };
                        return 0.3;
                    }
                },
            },
        },
    },


    //墟孙茹
    zshy_yingjian: {//影箭
        audio: 'qingyi',
        trigger: { player: 'phaseZhunbeiBegin' },
        direct: true,
        async content(event, trigger, player) {
            const next = player.chooseUseTarget('###是否发动【影箭】？###视为使用一张没有距离限制的【杀】', { name: 'sha' }, false, 'nodistance');
            next.logSkill = 'zshy_yingjian';
        },
        ai: {
            threaten(player, target) {
                return 1.6;
            },
        },
    },
    zshy_shixin: {//释衅
        audio: 'shixin',
        trigger: { player: 'damageBegin4' },
        filter(event) {
            return event.hasNature('fire');
        },
        forced: true,
        async content(event, trigger, player) {
            trigger.cancel();
        },
        ai: {
            nofire: true,
            effect: {
                target(card, player, target, current) {
                    if (get.tag(card, 'fireDamage')) {
                        return 'zeroplayertarget';
                    }
                },
            },
        },
    },

    //墟留赞
    zshy_fenyin: {//奋音
        audio: 'fenyin',
        locked: false,
        mod: {
            aiOrder(player, card, num) {
                if (typeof card == 'object' && player == _status.currentPhase) {
                    const evt = player.getLastUsed();
                    if (evt && evt.card && get.color(evt.card) != 'none' && get.color(card) != 'none' && get.color(evt.card) != get.color(card)) {
                        return num + 10;
                    }
                }
            },
        },
        trigger: { player: 'useCard' },
        frequent: true,
        filter(event, player) {
            if (_status.currentPhase != player) {
                return false;
            }
            const color2 = get.color(event.card);
            player.addTip('zshy_fenyin', '奋音 ' + get.translation(color2), true);
            const evt = player.getLastUsed(1);
            if (!evt) {
                return false;
            }
            const color1 = get.color(evt.card);
            return color1 && color2 && color1 != 'none' && color2 != 'none' && color1 != color2;
        },
        async content(event, trigger, player) {
            player.draw('nodelay');
        },
        ai: {
            threaten: 3,
        },
    },

    //墟庞德公/祢衡
    zshy_xinfu_pingcai: {
        audio: 'xinfu_pingcai',
        async wolong_card(event, trigger, player) {
            const ingame = game.hasPlayer(function (current) {
                const translate = get.translation(current);
                return ['诸葛亮', '卧龙', '孔明', '诸葛孔明'].some((name) => translate.includes(name));
            }) ? true : false;
            let prompt = '请选择';
            prompt += ingame ? '至多两名' : '一名';
            prompt += '角色，对其造成1点火焰伤害';
            const range = ingame ? [1, 2] : [1, 1];
            const result = await player.chooseTarget(prompt, range).set('ai', function (target) {
                var player2 = _status.event.player;
                return get.damageEffect(target, player2, player2, 'fire');
            }).forResult();
            if (result.bool && result.targets.length) {
                player.line(result.targets, 'fire');
                result.targets.sortBySeat();
                for (var i = 0; i < result.targets.length; i++) {
                    await result.targets[i].damage('fire');
                }
            }
        },
        async fengchu_card(event, trigger, player) {
            const ingame = game.hasPlayer(function (current) {
                const translate = get.translation(current);
                return ['庞统', '庞士元', '凤雏'].some((name) => translate.includes(name));
            }) ? true : false;
            let prompt = '请选择';
            prompt += ingame ? '至多四名' : '至多三名';
            prompt += '要横置的角色';
            const range = ingame ? [1, 4] : [1, 3];
            const result = await player.chooseTarget(prompt, range, (card, player2, target) => {
                return !target.isLinked();
            }).set('ai', function (target) {
                var player2 = _status.event.player;
                return get.effect(target, { name: 'tiesuo' }, player2, player2);
            }).forResult();
            if (result.bool && result.targets.length) {
                player.line(result.targets, 'green');
                result.targets.sortBySeat();
                for (var i = 0; i < result.targets.length; i++) {
                    await result.targets[i].link();
                }
            }
        },
        async xuanjian_card(event, trigger, player) {
            const ingame = game.hasPlayer(function (current) {
                const translate = get.translation(current);
                return ['徐庶', '徐元直', '单福'].some((name) => translate.includes(name));
            }) ? true : false;
            let prompt = '请选择一名角色，令其回复1点体力并摸一张牌';
            prompt += ingame ? '，然后你摸一张牌。' : '。';
            const result = await player.chooseTarget(prompt).set('ai', function (target) {
                var player2 = _status.event.player;
                return get.attitude(player2, target) * (target.isDamaged() ? 2 : 1);
            }).forResult();
            if (result.bool && result.targets.length) {
                const target = result.targets[0];
                player.line(target, 'thunder');
                await target.draw();
                await target.recover();
                if (ingame) {
                    await player.draw();
                }
            }
        },
        async shuijing_card(event, trigger, player) {
            const ingame = game.hasPlayer(function (current) {
                const translate = get.translation(current);
                return ['司马徽'].some((name) => translate.includes(name));
            }) ? true : false;
            let prompt = '将一名角色装备区中的';
            prompt += ingame ? '一张牌' : '防具牌';
            prompt += '移动到另一名角色的装备区中';
            const result = await player.chooseTarget(2, function (card, player2, target) {
                if (ui.selected.targets.length) {
                    if (!_status.event.ingame) {
                        var cards2 = ui.selected.targets[0].getEquips(2);
                        return cards2.some((card2) => target.canEquip(card2));
                    }
                    var from = ui.selected.targets[0];
                    if (target.isMin()) {
                        return false;
                    }
                    var es = from.getCards('e');
                    for (var i = 0; i < es.length; i++) {
                        if (target.canEquip(es[i])) {
                            return true;
                        }
                    }
                    return false;
                } else {
                    if (!event.ingame) {
                        if (target.getEquips(2).length) {
                            return true;
                        }
                        return false;
                    }
                    return target.countCards('e') > 0;
                }
            }).set('ingame', ingame).set('ai', function (target) {
                var player2 = _status.event.player;
                var att = get.attitude(player2, target);
                if (ui.selected.targets.length == 0) {
                    if (att < 0) {
                        if (game.hasPlayer(function (current) {
                            if (get.attitude(player2, current) > 0) {
                                var es2 = target.getCards('e');
                                for (var i2 = 0; i2 < es2.length; i2++) {
                                    if (current.canEquip(es2[i2])) {
                                        return true;
                                    }
                                }
                                return false;
                            }
                        })) {
                            return -att;
                        }
                    }
                    return 0;
                }
                if (att > 0) {
                    var es = ui.selected.targets[0].getCards('e');
                    var i;
                    for (i = 0; i < es.length; i++) {
                        if (target.canEquip(es[i])) {
                            break;
                        }
                    }
                    if (i == es.length) {
                        return 0;
                    }
                }
                return -att * get.attitude(player2, ui.selected.targets[0]);
            }).set('multitarget', true).set('targetprompt', ['被移走', '移动目标']).set('prompt', prompt).forResult();
            if (!result.bool) {
                return;
            }
            player.line2(result.targets, 'green');
            const targets = result.targets;
            await game.delay();
            if (targets.length == 2) {
                let links;
                if (!ingame) {
                    const cards2 = targets[0].getEquips(2);
                    if (cards2.length == 1) {
                        links = cards2;
                    } else {
                        const chooseResult = await player.choosePlayerCard(
                            'e',
                            true,
                            function (button) {
                                return get.equipValue(button.link);
                            },
                            targets[0]
                        ).set('targets0', targets[0]).set('targets1', targets[1]).set('filterButton', function (button) {
                            if (!get.subtypes(button.link, false).includes('equip2')) {
                                return false;
                            }
                            var targets1 = _status.event.targets1;
                            return targets1.canEquip(button.link);
                        }).forResult();
                        if (chooseResult.bool && chooseResult.links.length) {
                            links = chooseResult.links;
                        }
                    }
                } else {
                    const chooseResult = await player.choosePlayerCard(
                        'e',
                        true,
                        function (button) {
                            return get.equipValue(button.link);
                        },
                        targets[0]
                    ).set('targets0', targets[0]).set('targets1', targets[1]).set('filterButton', function (button) {
                        var targets1 = _status.event.targets1;
                        return targets1.canEquip(button.link);
                    }).forResult();
                    if (chooseResult.bool && chooseResult.links.length) {
                        links = chooseResult.links;
                    }
                }
                if (links?.length) {
                    const link = links[0];
                    if (get.position(link) == 'e') {
                        await targets[1].equip(link);
                    } else if (link.viewAs) {
                        await targets[1].addJudge({ name: link.viewAs }, [link]);
                    } else {
                        await targets[1].addJudge(link);
                    }
                    targets[0].$give(link, targets[1], false);
                    await game.delay();
                }
            }
        },
        enable: 'phaseUse',
        usable: 1,
        prompt: '点击确定来选择要擦拭的宝物',
        chooseButton: {
            dialog() {
                var list = ['wolong', 'fengchu', 'xuanjian', 'shuijing'];
                for (var i = 0; i < list.length; i++) {
                    list[i] = ['', '', list[i] + '_card'];
                }
                return ui.create.dialog('评才', [list, 'vcard']);
            },
            check(button) {
                var name = button.link[2];
                var player = _status.event.player;
                if (name == 'xuanjian_card') {
                    if (game.hasPlayer(function (current) {
                        return current.isDamaged() && current.hp < 3 && get.attitude(player, current) > 1;
                    })) {
                        return 1 + Math.random();
                    } else {
                        return 1;
                    }
                } else if (name == 'wolong_card') {
                    if (game.hasPlayer(function (current) {
                        return get.damageEffect(current, player, player, 'fire') > 0;
                    })) {
                        return 1.2 + Math.random();
                    } else {
                        return 0.5;
                    }
                } else {
                    return 0.6;
                }
            },
            backup(links, player) {
                return {
                    audio: 'xinfu_pingcai1.mp3',
                    filterCard: () => false,
                    selectCard: -1,
                    takara: links[0][2],
                    content: lib.skill.zshy_xinfu_pingcai.contentx
                };
            }
        },
        async contentx(event, trigger, player) {
            event.pingcai_delayed = true;
            const name = lib.skill.zshy_xinfu_pingcai_backup.takara;
            event.cardname = name;
            event.videoId = lib.status.videoId++;
            if (player.isUnderControl()) {
                game.swapPlayerAuto(player);
            }
            var switchToAuto = function () {
                game.pause();
                game.countChoose();
                event.timeout = setTimeout(function () {
                    _status.imchoosing = false;
                    event._result = {
                        bool: true
                    };
                    game.resume();
                }, 9e3);
            };
            var createDialog = function (player2, id, name2) {
                if (player2 == game.me) {
                    return;
                }
                var dialog = ui.create.dialog('forcebutton', 'hidden');
                var str = get.translation(player2) + '正在擦拭宝物上的灰尘…';
                var canSkip = !_status.connectMode;
                if (canSkip) {
                    str += '<br>（点击宝物可以跳过等待AI操作）';
                }
                dialog.textPrompt = dialog.add('<div class="text center">' + str + '</div>');
                dialog.classList.add('fixed');
                dialog.classList.add('scroll1');
                dialog.classList.add('scroll2');
                dialog.classList.add('fullwidth');
                dialog.classList.add('fullheight');
                dialog.classList.add('noupdate');
                dialog.videoId = id;
                var canvas2 = document.createElement('canvas');
                dialog.canvas_viewer = canvas2;
                dialog.appendChild(canvas2);
                canvas2.classList.add('grayscale');
                canvas2.style.position = 'absolute';
                canvas2.style.width = '249px';
                canvas2.style.height = '249px';
                canvas2.style['border-radius'] = '6px';
                canvas2.style.left = 'calc(50% - 125px)';
                canvas2.style.top = 'calc(50% - 125px)';
                canvas2.width = 249;
                canvas2.height = 249;
                canvas2.style.border = '3px solid';
                var ctx2 = canvas2.getContext('2d');
                var img = new Image();
                img.src = lib.assetURL + 'image/card/' + name2 + '.png';
                img.onload = function () {
                    ctx2.drawImage(this, 0, 0, this.width, this.height, 0, 0, canvas2.width, canvas2.height);
                };
                if (canSkip) {
                    var skip = function () {
                        if (event.pingcai_delayed) {
                            delete event.pingcai_delayed;
                            clearTimeout(event.timeout);
                            event._result = {
                                bool: true
                            };
                            game.resume();
                            canvas2.removeEventListener(lib.config.touchscreen ? 'touchend' : 'click', skip);
                        }
                    };
                    canvas2.addEventListener(lib.config.touchscreen ? 'touchend' : 'click', skip);
                }
                dialog.open();
            };
            var chooseButton = function (id, name2) {
                var event2 = _status.event;
                _status.zshy_xinfu_pingcai_finished = false;
                var dialog = ui.create.dialog('forcebutton', 'hidden');
                dialog.textPrompt = dialog.add('<div class="text center">擦拭掉宝物上的灰尘吧！</div>');
                event2.switchToAuto = function () {
                    event2._result = {
                        bool: _status.zshy_xinfu_pingcai_finished
                    };
                    game.resume();
                    _status.imchoosing = false;
                    _status.zshy_xinfu_pingcai_finished = true;
                };
                dialog.classList.add('fixed');
                dialog.classList.add('scroll1');
                dialog.classList.add('scroll2');
                dialog.classList.add('fullwidth');
                dialog.classList.add('fullheight');
                dialog.classList.add('noupdate');
                dialog.videoId = id;
                var canvas = document.createElement('canvas');
                var canvas2 = document.createElement('canvas');
                dialog.appendChild(canvas2);
                dialog.appendChild(canvas);
                canvas.style.position = 'absolute';
                canvas.style.width = '249px';
                canvas.style.height = '249px';
                canvas.style['border-radius'] = '6px';
                canvas.style.left = 'calc(50% - 125px)';
                canvas.style.top = 'calc(50% - 125px)';
                canvas.width = 249;
                canvas.height = 249;
                canvas.style.border = '3px solid';
                canvas2.style.position = 'absolute';
                canvas2.style.width = '249px';
                canvas2.style.height = '249px';
                canvas2.style['border-radius'] = '6px';
                canvas2.style.left = 'calc(50% - 125px)';
                canvas2.style.top = 'calc(50% - 125px)';
                canvas2.width = 249;
                canvas2.height = 249;
                canvas2.style.border = '3px solid';
                var ctx = canvas.getContext('2d');
                var ctx2 = canvas2.getContext('2d');
                var img = new Image();
                img.src = lib.assetURL + 'image/card/' + name2 + '.png';
                img.onload = function () {
                    ctx2.drawImage(this, 0, 0, this.width, this.height, 0, 0, canvas2.width, canvas2.height);
                };
                ctx.fillStyle = 'lightgray';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                canvas.onmousedown = function (ev) {
                    canvas.onmousemove = function (e) {
                        if (_status.zshy_xinfu_pingcai_finished) {
                            return;
                        }
                        ctx.beginPath();
                        ctx.clearRect(e.offsetX - 16, e.offsetY - 16, 32, 32);
                        var data = ctx.getImageData(canvas.width * 0.1, canvas.height * 0.1, canvas.width * 0.8, canvas.height * 0.8).data;
                        var sum = 0;
                        for (var i = 3; i < data.length; i += 4) {
                            if (data[i] == 0) {
                                sum++;
                            }
                        }
                        if (sum >= canvas.width * canvas.height * 0.6) {
                            if (!_status.zshy_xinfu_pingcai_finished) {
                                _status.zshy_xinfu_pingcai_finished = true;
                                event2.switchToAuto();
                            }
                        }
                    };
                };
                canvas.ontouchstart = function (ev) {
                    canvas.ontouchmove = function (e) {
                        if (_status.zshy_xinfu_pingcai_finished) {
                            return;
                        }
                        ctx.beginPath();
                        var rect = canvas.getBoundingClientRect();
                        var X = (e.touches[0].clientX - rect.left) / rect.width * canvas.width;
                        var Y = (e.touches[0].clientY - rect.top) / rect.height * canvas.height;
                        ctx.clearRect(X - 16, Y - 16, 32, 32);
                        var data = ctx.getImageData(canvas.width * 0.1, canvas.height * 0.1, canvas.width * 0.8, canvas.height * 0.8).data;
                        var sum = 0;
                        for (var i = 3; i < data.length; i += 4) {
                            if (data[i] == 0) {
                                sum++;
                            }
                        }
                        if (sum >= canvas.width * canvas.height * 0.6) {
                            if (!_status.zshy_xinfu_pingcai_finished) {
                                _status.zshy_xinfu_pingcai_finished = true;
                                event2.switchToAuto();
                            }
                        }
                    };
                };
                canvas.onmouseup = function (ev) {
                    canvas.onmousemove = null;
                };
                canvas.ontouchend = function (ev) {
                    canvas.ontouchmove = null;
                };
                dialog.open();
                game.pause();
                game.countChoose();
            };
            game.broadcastAll(createDialog, player, event.videoId, name);
            if (event.isMine()) {
                chooseButton(event.videoId, name);
            } else if (event.isOnline()) {
                event.player.send(chooseButton, event.videoId, name);
                event.player.wait();
                game.pause();
            } else {
                switchToAuto();
            }
            await game.pause();
            let result = event.result || event._result;
            if (!result) {
                result = { bool: false };
            }
            event._result = result;
            game.broadcastAll(
                function (id, result2, player2) {
                    _status.zshy_xinfu_pingcai_finished = true;
                    var dialog = get.idDialog(id);
                    if (dialog) {
                        dialog.textPrompt.innerHTML = '<div class="text center">' + (get.translation(player2) + '擦拭宝物' + (result2.bool ? '成功！' : '失败…')) + '</div>';
                        if (result2.bool && dialog.canvas_viewer) {
                            dialog.canvas_viewer.classList.remove('grayscale');
                        }
                    }
                    if (!_status.connectMode) {
                        delete event.pingcai_delayed;
                    }
                },
                event.videoId,
                result,
                player
            );
            await game.delay(2.5);
            game.broadcastAll('closeDialog', event.videoId);
            if (result.bool) {
                player.logSkill('pcaudio_' + event.cardname);
                event.insert(lib.skill.zshy_xinfu_pingcai[event.cardname], {
                    player
                });
            }
        },
        ai: {
            order: 7,
            fireAttack: true,
            threaten: 1.7,
            result: {
                player: 1
            }
        },
        subSkill: { backup: {} },
    },

    //墟庞德公/祢衡
    zshy_xinfu_pdgyingshi: {
        mod: {
            targetEnabled(card, player, target) {
                if (get.type(card) == 'delay') {
                    return false;
                }
            }
        },
        trigger: {
            player: ['phaseZhunbeiBefore', 'phaseJieshuBefore']
        },
        forced: true,
        group: 'zshy_xinfu_pdgyingshi2',
        async content(event, trigger, player) {
            trigger.cancel();
            game.log(player, '跳过了', event.triggername == 'phaseZhunbeiBefore' ? '准备阶段' : '结束阶段');
        }
    },

    //墟庞德公/祢衡
    zshy_xinfu_pdgyingshi2: {
        popup: false,
        trigger: {
            player: 'phaseJudgeBefore'
        },
        forced: true,
        sourceSkill: 'zshy_xinfu_pdgyingshi',
        async content(event, trigger, player) {
            trigger.cancel();
            game.log(player, '跳过了判定阶段');
        }
    },

    //墟庞德公/祢衡
    zshy_kuangcai: {
        audio: 'kuangcai',
        trigger: { player: 'phaseUseBegin' },
        filter(event, player) {
            return !event.player.isMad();
        },
        async content(event, trigger, player) {
            game.broadcastAll(function (player2) {
                if (!player2.forceCountChoose) {
                    player2.forceCountChoose = {};
                }
                player2.forceCountChoose.phaseUse = 5;
            }, player);
            player.addSkill('zshy_kuangcai_use');
            player.addSkill('zshy_kuangcai_cancel');
        },
        subSkill: {
            use: {
                mod: {
                    cardUsable(card) {
                        if (get.info(card) && get.info(card).forceUsable) {
                            return;
                        }
                        return Infinity;
                    },
                    targetInRange() {
                        return true;
                    },
                    aiOrder(player, card, num) {
                        var name = get.name(card);
                        if (name == 'tao') {
                            return num + 7 + Math.pow(player.getDamagedHp(), 2);
                        }
                        if (name == 'sha') {
                            return num + 6;
                        }
                        if (get.subtype(card) == 'equip2') {
                            return num + get.value(card) / 3;
                        }
                    }
                },
                trigger: { player: 'useCard' },
                forced: true,
                charlotte: true,
                silent: true,
                popup: false,
                filter(event, player) {
                    if (!player.forceCountChoose || !player.forceCountChoose.phaseUse) {
                        return false;
                    }
                    return true;
                },
                async content(event, trigger, player) {
                    player.draw();
                    if (player.forceCountChoose.phaseUse == 1) {
                        var evt = event.getParent('phaseUse');
                        if (evt) {
                            evt.skipped = true;
                        }
                    } else {
                        game.broadcastAll(function (player2) {
                            player2.forceCountChoose.phaseUse--;
                        }, player);
                    }
                }
            },
            cancel: {
                trigger: { player: 'phaseUseEnd' },
                firstDo: true,
                silent: true,
                charlotte: true,
                async content(event, trigger, player) {
                    game.broadcastAll(function (player2) {
                        delete player2.forceCountChoose;
                    }, player);
                    player.removeSkill('zshy_kuangcai_use');
                    player.removeSkill('zshy_kuangcai_cancel');
                }
            }
        },
        ai: {
            threaten: 4.5
        }
    },

    //墟庞德公/祢衡
    zshy_shejian: {
        audio: 'shejian',
        trigger: { player: 'phaseDiscardEnd' },
        direct: true,
        filter(event, player) {
            var cards2 = [];
            player.getHistory('lose', function (evt) {
                if (evt.type == 'discard' && evt.getParent('phaseDiscard') == event) {
                    cards2.addArray(evt.cards2);
                }
            });
            if (cards2) {
                if (cards2.length < 2) {
                    return false;
                }
                var suits = [];
                for (var i = 0; i < cards2.length; i++) {
                    var suit = get.suit(cards2[i]);
                    if (suits.includes(suit)) {
                        return false;
                    } else {
                        suits.push(suit);
                    }
                }
                return true;
            }
            return false;
        },
        async content(event, trigger, player) {
            const result = await player.chooseTarget(get.prompt('zshy_shejian'), '弃置一名其他角色的一张牌', function (card, player2, target) {
                if (player2 == target) {
                    return false;
                }
                return target.countDiscardableCards(player2, 'he') > 0;
            }).set('ai', function (target) {
                return -get.attitude(player, target);
            }).forResult();
            if (result.bool) {
                player.logSkill('zshy_shejian', result.targets);
                await player.discardPlayerCard(result.targets[0], 'he', true);
            }
        }
    },

    //墟马钧/郑玄
    zshy_xinfu_jingxie: {
        audio: 'xinfu_jingxie',
        video(player, info) {
            var l2 = player.getCards(info[0] ? 'e' : 'h'), l1 = info[1];
            for (var j = 0; j < l2.length; j++) {
                if (l2[j].suit == l1[0] && l2[j].number == l1[1] && l2[j].name == l1[2]) {
                    l2[j].init([l2[j].suit, l2[j].number, 'rewrite_' + l2[j].name]);
                    break;
                }
            }
        },
        position: 'he',
        enable: 'phaseUse',
        filter(event, player) {
            var he = player.getCards('he');
            for (var i = 0; i < he.length; i++) {
                if (['bagua', 'baiyin', 'lanyinjia', 'renwang', 'tengjia', 'zhuge'].includes(he[i].name)) {
                    return true;
                }
            }
            return false;
        },
        filterCard(card) {
            return ['bagua', 'baiyin', 'lanyinjia', 'renwang', 'tengjia', 'zhuge'].includes(card.name);
        },
        discard: false,
        lose: false,
        delay: false,
        check() {
            return 1;
        },
        async content(event, trigger, player) {
            const { cards: cards2 } = event;
            await player.showCards(cards2);
            const card = cards2[0];
            const bool = get.position(card) == 'e';
            if (bool) {
                player.removeEquipTrigger(card.card || card);
            }
            game.addVideo('skill', player, ['zshy_xinfu_jingxie', [bool, get.cardInfo(card)]]);
            game.broadcastAll(
                function (card2, bool2, player2) {
                    card2.init([card2.suit, card2.number, 'rewrite_' + card2.name]);
                    let vcard = card2[card2.cardSymbol];
                    if (bool2 && vcard && player2.vcardsMap?.equips) {
                        const cardx = get.autoViewAs(card2, void 0, false);
                        player2.vcardsMap.equips[player2.vcardsMap.equips.indexOf(vcard)] = cardx;
                        card2[card2.cardSymbol] = cardx;
                    }
                },
                card,
                bool,
                player
            );
            if (bool) {
                player.addEquipTrigger(card.card || card);
            }
        },
        ai: {
            basic: {
                order: 10
            },
            result: {
                player: 1
            }
        },
        group: ['zshy_xinfu_jingxie_recast'],
        subSkill: {
            recast: {
                audio: 'zshy_xinfu_jingxie',
                enable: 'chooseToUse',
                filterCard: (card, player) => get.subtype(card) == 'equip2' && player.canRecast(card),
                filter: (event, player) => {
                    if (event.type != 'dying') {
                        return false;
                    }
                    if (player != event.dying) {
                        return false;
                    }
                    return player.hasCard((card) => lib.skill.zshy_xinfu_jingxie.subSkill.recast.filterCard(card, player), 'he');
                },
                position: 'he',
                discard: false,
                lose: false,
                delay: false,
                prompt: '重铸一张防具牌，然后将体力回复至1点。',
                async content(event, trigger, player) {
                    const { cards: cards2 } = event;
                    await player.recast(cards2);
                    const num = 1 - player.hp;
                    if (num) {
                        await player.recover(num);
                    }
                },
                ai: {
                    order: 0.5,
                    skillTagFilter(player, arg, target) {
                        if (player != target) {
                            return false;
                        }
                        return player.hasCard((card) => _status.connectMode && get.position(card) == 'h' || get.subtype(card) == 'equip2' && player.canRecast(card), 'he');
                    },
                    save: true,
                    result: {
                        player(player) {
                            return 10;
                        }
                    }
                }
            }
        }
    },

    //墟马钧/郑玄
    zshy_qiaosi: {
        audio: 'qiaosi',
        derivation: 'zshy_qiaosi_map',
        enable: 'phaseUse',
        usable: 1,
        manualConfirm: true,
        async content(event, trigger, player) {
            event.videoId = lib.status.videoId++;
            if (player.isUnderControl()) {
                game.swapPlayerAuto(player);
            }
            var switchToAuto = function () {
                game.pause();
                game.countChoose();
                setTimeout(function () {
                    _status.imchoosing = false;
                    event._result = {
                        bool: true,
                        links: ['zshy_qiaosi_c1', 'zshy_qiaosi_c6'].concat(['zshy_qiaosi_c2', 'zshy_qiaosi_c3', 'zshy_qiaosi_c4', 'zshy_qiaosi_c5'].randomGets(1))
                    };
                    if (event.dialog) {
                        event.dialog.close();
                    }
                    if (event.controls) {
                        for (var i of event.controls) {
                            i.close();
                        }
                    }
                    game.resume();
                }, 5e3);
            };
            var createDialog = function (player2, id) {
                if (player2 == game.me) {
                    return;
                }
                var str = get.translation(player2) + '正在表演...<br>';
                for (var i = 1; i < 7; i++) {
                    str += get.translation('zshy_qiaosi_c' + i);
                    if (i % 3 != 0) {
                        str += '　　';
                    }
                    if (i == 3) {
                        str += '<br>';
                    }
                }
                ui.create.dialog(str, 'forcebutton').videoId = id;
            };
            var chooseButton = function (player2) {
                var event2 = _status.event;
                player2 = player2 || event2.player;
                event2.status = {
                    zshy_qiaosi_c1: 0,
                    zshy_qiaosi_c2: 0,
                    zshy_qiaosi_c3: 0,
                    zshy_qiaosi_c4: 0,
                    zshy_qiaosi_c5: 0,
                    zshy_qiaosi_c6: 0
                };
                event2.map = {
                    zshy_qiaosi_c1: [40, 60],
                    zshy_qiaosi_c2: [80, 120],
                    zshy_qiaosi_c3: [90, 110],
                    zshy_qiaosi_c4: [90, 110],
                    zshy_qiaosi_c5: [80, 120],
                    zshy_qiaosi_c6: [40, 60]
                };
                event2.finishedx = [];
                event2.str = '请开始你的表演<br><img src="' + lib.assetURL + 'image/card/zshy_qiaosi_card1.png" width="60" height="60">zshy_qiaosi_c1% <img src="' + lib.assetURL + 'image/card/zshy_qiaosi_card2.png" width="60" height="60">zshy_qiaosi_c2% <img src="' + lib.assetURL + 'image/card/zshy_qiaosi_card3.png" width="60" height="60">zshy_qiaosi_c3%<br><img src="' + lib.assetURL + 'image/card/zshy_qiaosi_card4.png" width="60" height="60">zshy_qiaosi_c4%<img src="' + lib.assetURL + 'image/card/zshy_qiaosi_card5.png" width="60" height="60">zshy_qiaosi_c5% <img src="' + lib.assetURL + 'image/card/zshy_qiaosi_card6.png" width="60" height="60">zshy_qiaosi_c6%';
                event2.dialog = ui.create.dialog(event2.str, 'forcebutton', 'hidden');
                event2.dialog.addText('<li>点击下方的按钮，可以增加按钮对应的角色的「表演完成度」。对于不同的角色，点击时增加的完成度不同，最终获得的牌也不同。一次表演最多只能完成3名角色的进度。', false);
                event2.dialog.open();
                for (var i in event2.status) {
                    event2.dialog.content.childNodes[0].innerHTML = event2.dialog.content.childNodes[0].innerHTML.replace(i, event2.status[i]);
                }
                for (var i = 0; i < event2.dialog.buttons.length; i++) {
                    event2.dialog.buttons[i].classList.add('pointerdiv');
                }
                event2.switchToAuto = function () {
                    event2._result = {
                        bool: true,
                        links: event2.finishedx.slice(0)
                    };
                    event2.dialog.close();
                    for (var i2 of event2.controls) {
                        i2.close();
                    }
                    game.resume();
                    _status.imchoosing = false;
                }, event2.controls = [];
                for (var i = 1; i <= 6; i++) {
                    event2.controls.push(
                        ui.create.control('zshy_qiaosi_c' + i, function (link) {
                            var event3 = _status.event;
                            if (event3.finishedx.includes(link)) {
                                return;
                            }
                            event3.status[link] += get.rand.apply(get, event3.map[link]);
                            if (event3.status[link] >= 100) {
                                event3.status[link] = 100;
                                var str = event3.str.slice(0);
                                for (var i2 in event3.status) {
                                    str = str.replace(i2, event3.status[i2]);
                                }
                                event3.dialog.content.childNodes[0].innerHTML = str;
                                event3.finishedx.push(link);
                                if (event3.finishedx.length >= 3) {
                                    event3._result = {
                                        bool: true,
                                        links: event3.finishedx.slice(0)
                                    };
                                    event3.dialog.close();
                                    for (var i2 of event3.controls) {
                                        i2.close();
                                    }
                                    game.resume();
                                    _status.imchoosing = false;
                                }
                            } else {
                                var str = event3.str.slice(0);
                                for (var i2 in event3.status) {
                                    str = str.replace(i2, event3.status[i2]);
                                }
                                event3.dialog.content.childNodes[0].innerHTML = str;
                            }
                        })
                    );
                }
                for (var i = 0; i < event2.dialog.buttons.length; i++) {
                    event2.dialog.buttons[i].classList.add('selectable');
                }
                game.pause();
                game.countChoose();
            };
            game.broadcastAll(createDialog, player, event.videoId);
            if (event.isMine()) {
                chooseButton();
            } else if (event.isOnline()) {
                event.player.send(chooseButton, event.player);
                event.player.wait();
                game.pause();
            } else {
                switchToAuto();
            }
            await game.pause();
            game.broadcastAll('closeDialog', event.videoId);
            const map = event.result || event._result || {};
            if (!map || !map.bool || !map.links) {
                game.log(player, '表演失败');
                return;
            }
            const list = map.links;
            if (!list.length) {
                game.log(player, '表演失败');
                return;
            }
            const cards2 = [];
            const list2 = [];
            if (list.includes('zshy_qiaosi_c1')) {
                list2.push('trick');
                list2.push('trick');
            }
            if (list.includes('zshy_qiaosi_c2')) {
                if (list.includes('zshy_qiaosi_c6')) {
                    list2.push(['sha', 'jiu']);
                } else {
                    list2.push(Math.random() < 0.66 ? 'equip' : ['sha', 'jiu']);
                }
            }
            if (list.includes('zshy_qiaosi_c3')) {
                list2.push([Math.random() < 0.66 ? 'sha' : 'jiu']);
            }
            if (list.includes('zshy_qiaosi_c4')) {
                list2.push([Math.random() < 0.66 ? 'shan' : 'tao']);
            }
            if (list.includes('zshy_qiaosi_c5')) {
                if (list.includes('zshy_qiaosi_c1')) {
                    list2.push(['shan', 'tao']);
                } else {
                    list2.push(Math.random() < 0.66 ? 'trick' : ['shan', 'tao']);
                }
            }
            if (list.includes('zshy_qiaosi_c6')) {
                list2.push('equip');
                list2.push('equip');
            }
            while (list2.length) {
                var filter = list2.shift();
                var card = get.cardPile(function (x) {
                    if (cards2.includes(x)) {
                        return false;
                    }
                    if (typeof filter == 'string' && get.type(x, 'trick') == filter) {
                        return true;
                    }
                    if (typeof filter == 'object' && filter.includes(x.name)) {
                        return true;
                    }
                });
                if (card) {
                    cards2.push(card);
                } else {
                    var card = get.cardPile(function (x) {
                        return !cards2.includes(x);
                    });
                    if (card) {
                        cards2.push(card);
                    }
                }
            }
            if (!cards2.length) {
                return;
            }
            event.cards = cards2;
            const num = cards2.length;
            event.num = num;
            player.showCards(cards2);
            await player.gain(cards2, 'gain2');
            const goon = game.hasPlayer((current) => current != player);
            if (!player.hasCards('he') && goon) {
                return;
            }
            let index;
            if (player.hasCards('he') && goon) {
                const result = await player.chooseControl().set('choiceList', ['将' + get.cnNumber(num) + '张牌交给一名其他角色', '弃置' + get.cnNumber(num) + '张牌']).set('ai', function () {
                    if (game.hasPlayer(function (current) {
                        return current != player && get.attitude(player, current) > 2;
                    })) {
                        return 0;
                    }
                    return 1;
                }).forResult();
                index = result.index;
            } else {
                index = goon ? 0 : 1;
            }
            if (index == 0) {
                const result2 = await player.chooseCardTarget({
                    position: 'he',
                    filterCard: true,
                    selectCard: Math.min(num, player.countCards('he')),
                    filterTarget(card2, player2, target) {
                        return player2 != target;
                    },
                    ai1(card2) {
                        return 1;
                    },
                    ai2(target) {
                        var att = get.attitude(_status.event.player, target);
                        if (target.hasSkillTag('nogain')) {
                            att /= 10;
                        }
                        if (target.hasJudge('lebu')) {
                            att /= 5;
                        }
                        return att;
                    },
                    prompt: '选择' + get.cnNumber(num) + '张牌，交给一名其他角色。',
                    forced: true
                }).forResult();
                if (result2.bool) {
                    const target = result2.targets[0];
                    await player.give(result2.cards, target);
                }
            } else {
                await player.chooseToDiscard(num, true, 'he', 'allowChooseAll').forResult();
            }
        },
        ai: {
            order: 10,
            result: { player: 1 },
            threaten: 3.2
        }
    },

    //墟马钧/郑玄
    zshy_zhengjing: {
        audio: 'zhengjing',
        enable: 'phaseUse',
        usable: 1,
        manualConfirm: true,
        filter(event, player) {
            return !player.hasSkill('zshy_zhengjing3');
        },
        async content(event, trigger, player) {
            if (_status.connectMode) {
                event.time = lib.configOL.choose_timeout;
            }
            var cards2 = [];
            var names = [];
            while (true) {
                var card = get.cardPile(function (carde) {
                    return carde.name != 'du' && !names.includes(carde.name);
                });
                if (card) {
                    cards2.push(card);
                    names.push(card.name);
                    if (get.mode() == 'doudizhu') {
                        if (cards2.length == 1 && !get.isLuckyStar(player) && Math.random() < 0.33) {
                            break;
                        }
                        if (cards2.length == 2 && !get.isLuckyStar(player) && Math.random() < 0.5) {
                            break;
                        }
                        if (cards2.length >= 3) {
                            break;
                        }
                    } else {
                        if (cards2.length == 3 && !get.isLuckyStar(player) && Math.random() < 0.33) {
                            break;
                        }
                        if (cards2.length == 4 && !get.isLuckyStar(player) && Math.random() < 0.5) {
                            break;
                        }
                        if (cards2.length >= 5) {
                            break;
                        }
                    }
                } else {
                    break;
                }
            }
            event.cards = cards2;
            if (!cards2.length) {
                return;
            }
            event.videoId = lib.status.videoId++;
            if (player.isUnderControl()) {
                game.swapPlayerAuto(player);
            }
            var switchToAuto = function () {
                names.remove('du');
                game.pause();
                game.countChoose();
                setTimeout(function () {
                    _status.imchoosing = false;
                    event._result = {
                        bool: true,
                        links: names.slice(0)
                    };
                    if (event.dialog) {
                        event.dialog.close();
                    }
                    if (event.control) {
                        event.control.close();
                    }
                    game.resume();
                }, 5e3);
            };
            var createDialog = function (player2, id) {
                if (_status.connectMode) {
                    lib.configOL.choose_timeout = '30';
                }
                if (player2 == game.me) {
                    return;
                }
                var str = get.translation(player2) + '正在整理经书...<br>';
                ui.create.dialog(str).videoId = id;
            };
            var chooseButton = function (list) {
                var roundmenu = false;
                if (ui.roundmenu && ui.roundmenu.display != 'none') {
                    roundmenu = true;
                    ui.roundmenu.style.display = 'none';
                }
                var event2 = _status.event;
                event2.settleed = false;
                event2.finishedx = [];
                event2.map = {};
                var names2 = list.slice(0);
                event2.zshy_zhengjing_nodes = [];
                names2.push('du');
                names2.randomSort();
                var names22 = names2.slice(0);
                for (var i2 = 0; i2 < 2; i2++) {
                    names22.randomSort();
                    names2 = names2.concat(names22);
                }
                event2.zshy_zhengjing = names2;
                for (var i2 of list) {
                    event2.map[i2] = 0;
                }
                event2.dialog = ui.create.dialog('forcebutton', 'hidden');
                event2.dialog.textPrompt = event2.dialog.add('<div class="text center">及时点击卡牌，但不要点到毒了！</div>');
                var str = '<div class="text center">';
                for (var i2 of list) {
                    str += get.translation(i2) + ':' + Math.min(2, event2.map[i2]) + '/2 ';
                }
                str += '</div>';
                event2.dialog.textPrompt2 = event2.dialog.add(str);
                event2.switchToAuto = function () {
                    event2._result = {
                        bool: true,
                        links: event2.finishedx.slice(0)
                    };
                    event2.dialog.close();
                    game.resume();
                    _status.imchoosing = false;
                    if (roundmenu) {
                        ui.roundmenu.style.display = '';
                    }
                };
                event2.dialog.classList.add('fixed');
                event2.dialog.classList.add('scroll1');
                event2.dialog.classList.add('scroll2');
                event2.dialog.classList.add('fullwidth');
                event2.dialog.classList.add('fullheight');
                event2.dialog.classList.add('noupdate');
                event2.dialog.open();
                event2.settle = function (du) {
                    if (event2.settleed) {
                        return;
                    }
                    event2.settleed = true;
                    event2.dialog.textPrompt2.innerHTML = '';
                    if (du) {
                        if (lib.config.background_speak) {
                            game.playAudio('skill', 'zshy_zhengjing_boom');
                        }
                        event2.dialog.textPrompt.innerHTML = '<div class="text center">叫你别点毒你非得点 这下翻车了吧</div>';
                    } else {
                        if (lib.config.background_speak) {
                            game.playAudio('skill', 'zshy_zhengjing_finish');
                        }
                        event2.dialog.textPrompt.innerHTML = '<div class="text center">整理经典结束！共整理出' + get.cnNumber(event2.finishedx.length) + '份经典</div>';
                    }
                    while (event2.zshy_zhengjing_nodes.length) {
                        event2.zshy_zhengjing_nodes.shift().delete();
                    }
                    setTimeout(function () {
                        event2.switchToAuto();
                    }, 1e3);
                };
                var click = function () {
                    var name = this.name;
                    if (name == 'du') {
                        event2.zshy_zhengjing.length = 0;
                        event2.settle(true);
                    } else {
                        if (lib.config.background_speak) {
                            game.playAudio('skill', 'zshy_zhengjing_click');
                        }
                        event2.map[name]++;
                        if (event2.map[name] > 1) {
                            event2.finishedx.add(name);
                        }
                        if (event2.finishedx.length < list.length) {
                            var str2 = '<div class="text center">';
                            for (var i3 of list) {
                                str2 += get.translation(i3) + ':' + Math.min(2, event2.map[i3]) + '/2 ';
                            }
                            str2 += '</div>';
                            event2.dialog.textPrompt2.innerHTML = str2;
                        } else {
                            event2.zshy_zhengjing.length = 0;
                            event2.settle();
                        }
                    }
                    event2.zshy_zhengjing_nodes.remove(this);
                    this.style.transition = 'all 0.5s';
                    this.style.transform = 'scale(1.2)';
                    this.delete();
                };
                var addNode = function () {
                    if (event2.zshy_zhengjing.length) {
                        var card2 = ui.create.card(ui.special, 'noclick', true);
                        card2.init(['', '', event2.zshy_zhengjing.shift()]);
                        card2.addEventListener(lib.config.touchscreen ? 'touchstart' : 'mousedown', click);
                        event2.zshy_zhengjing_nodes.push(card2);
                        card2.style.position = 'absolute';
                        var rand1 = Math.round(Math.random() * 100);
                        var rand2 = Math.round(Math.random() * 100);
                        var rand3 = Math.round(Math.random() * 40) - 20;
                        card2.style.left = 'calc(' + rand1 + '% - ' + rand1 + 'px)';
                        card2.style.top = 'calc(' + rand2 + '% - ' + rand2 + 'px)';
                        card2.style.transform = 'scale(0.8) rotate(' + rand3 + 'deg)';
                        card2.style.opacity = 0;
                        event2.dialog.appendChild(card2);
                        ui.refresh(card2);
                        card2.style.opacity = 1;
                        card2.style.transform = 'scale(1) rotate(' + rand3 + 'deg)';
                    }
                    if (event2.zshy_zhengjing_nodes.length > (event2.zshy_zhengjing.length > 0 ? 2 : 0)) {
                        event2.zshy_zhengjing_nodes.shift().delete();
                    }
                    if (event2.zshy_zhengjing.length || event2.zshy_zhengjing_nodes.length) {
                        setTimeout(function () {
                            addNode();
                        }, 800);
                    } else {
                        event2.settle();
                    }
                };
                game.pause();
                game.countChoose();
                addNode();
            };
            game.broadcastAll(createDialog, player, event.videoId);
            if (event.isMine()) {
                chooseButton(names);
            } else if (event.isOnline()) {
                event.player.send(chooseButton, names);
                event.player.wait();
                game.pause();
            } else {
                switchToAuto();
            }
            await game.pause();
            game.broadcastAll(
                function (id, time) {
                    if (_status.connectMode) {
                        lib.configOL.choose_timeout = time;
                    }
                    var dialog = get.idDialog(id);
                    if (dialog) {
                        dialog.close();
                    }
                },
                event.videoId,
                event.time
            );
            const result = event.result || event._result || {};
            for (var i = 0; i < cards2.length; i++) {
                if (!result.links.includes(cards2[i].name)) {
                    cards2.splice(i--, 1);
                }
            }
            if (cards2.length) {
                player.showCards(cards2, get.translation(player) + '整理出了以下经典');
                await game.cardsGotoOrdering(cards2);
            } else {
                game.log(player, '并没有整理出经典');
                player.popup('杯具');
                return;
            }
            game.updateRoundNumber();
            const result2 = await player.chooseTarget(true, '将整理出的经典置于一名角色的武将牌上').set('ai', function (target2) {
                if (target2.hasSkill('zshy_xinfu_pdgyingshi')) {
                    return 0;
                }
                let player2 = _status.event.player;
                _status.event.getParent().cards;
                get.attitude(player2, target2);
                let js = target2.getCards('j', (i2) => {
                    let name = i2.viewAs || i2.name, info = lib.card[name];
                    if (!info || !info.judge) {
                        return false;
                    }
                    return true;
                }), eff = -1.5 * get.effect(target2, { name: 'draw' }, player2, player2);
                if (js.length) {
                    eff += js.reduce((acc, i2) => {
                        let name = i2.viewAs || i2.name;
                        return acc - 0.7 * get.effect(target2, get.autoViewAs({ name }, [i2]), target2, player2);
                    }, 0);
                }
                return eff;
            }).forResult();
            if (!result2.bool) {
                return;
            }
            const target = result2.targets[0];
            player.line(target, 'thunder');
            if (cards2.length == 1) {
                return;
            }
            const result3 = await player.chooseToMove('整经：请分配整理出的经典', true).set('list', [['置于' + get.translation(target) + '的武将牌上', cards2], ['自己获得']]).set('filterMove', function (from, to, moved) {
                if (moved[0].length == 1 && to == 1 && from.link == moved[0][0]) {
                    return false;
                }
                return true;
            }).set('filterOk', function (moved) {
                return moved[0].length > 0;
            }).set('processAI', function (list) {
                var cards3 = list[0][1].slice(0).sort(function (a, b) {
                    return get.value(a) - get.value(b);
                });
                return [cards3.splice(0, 1), cards3];
            }).forResult();
            if (result3.bool) {
                const cards3 = result3.moved[0], gains = result3.moved[1];
                target.addSkill('zshy_zhengjing2');
                const addExpansionEvent = target.addToExpansion(cards3, 'gain2');
                addExpansionEvent.gaintag.add('zshy_zhengjing2');
                await addExpansionEvent;
                if (gains.length) {
                    await player.gain(gains, 'gain2');
                }
            }
        },
        ai: {
            order: 10,
            result: { player: 1 },
            threaten: 3.2
        }
    },

    //墟南华老仙/十常侍
    zshy_yufeng: {
        inherit: 'zshy_yufeng_old',
        manualConfirm: true,
        async content(event, trigger, player) {
            if (_status.connectMode) {
                event.time = lib.configOL.choose_timeout;
            }
            event.videoId = lib.status.videoId++;
            const maxScore = Math.max(2, 1 + player.countMark('zshy_yufeng'));
            if (player.isUnderControl()) {
                game.swapPlayerAuto(player);
            }
            const switchToAuto = function () {
                game.pause();
                game.countChoose();
                setTimeout(function () {
                    _status.imchoosing = false;
                    var max2 = Math.max(2, 1 + player.countMark('zshy_yufeng'));
                    var score = Math.random() < 0.5 ? max2 : get.rand(1, max2);
                    event._result = {
                        bool: true,
                        score,
                        win: score >= max2
                    };
                    if (event.dialog) {
                        event.dialog.close();
                    }
                    if (event.control) {
                        event.control.close();
                    }
                    game.resume();
                }, 5e3);
            };
            const createDialog = function (player2, id) {
                if (_status.connectMode) {
                    lib.configOL.choose_timeout = '30';
                }
                if (player2 == game.me) {
                    return;
                }
                var str = get.translation(player2) + '正在表演《御风飞行》...<br>';
                ui.create.dialog(str).videoId = id;
            };
            const chooseButton = function (maxScore2) {
                lib.skill.zshy_yufeng.$playFlappyBird(maxScore2);
            };
            game.broadcastAll(createDialog, player, event.videoId);
            if (event.isMine()) {
                chooseButton(maxScore);
            } else if (event.isOnline()) {
                event.player.send(chooseButton, maxScore);
                event.player.wait();
                game.pause();
            } else {
                switchToAuto();
            }
            await game.pause();
            game.broadcastAll(
                function (id, time) {
                    if (_status.connectMode) {
                        lib.configOL.choose_timeout = time;
                    }
                    var dialog = get.idDialog(id);
                    if (dialog) {
                        dialog.close();
                    }
                },
                event.videoId,
                event.time
            );
            const result = event.result || event._result || {};
            player.popup(get.cnNumber(result.score) + '分', result.win ? 'wood' : 'fire');
            game.log(player, '御风飞行', result.win ? '#g成功' : '#y失败');
            game.log(player, '获得了', '#g' + result.score + '分');
            const max = player.countMark('zshy_yufeng');
            if (!result.win) {
                if (result.score) {
                    await player.draw(result.score);
                }
                if (max) {
                    await player.removeMark('zshy_yufeng', max, false);
                }
                return;
            }
            if (max < 2) {
                await player.addMark('zshy_yufeng', 1, false);
            }
            const result2 = await player.chooseTarget('请选择【御风】的目标', [1, result.score], function (card, player2, target) {
                return target != player2 && !target.hasSkill(event.name + '_yufeng2');
            }).set('ai', function (target) {
                var player2 = _status.event.player;
                var att = -get.attitude(player2, target), attx = att * 2;
                if (att <= 0 || target.hasSkill('zshy_xinfu_pdgyingshi')) {
                    return 0;
                }
                if (target.hasJudge('lebu')) {
                    attx -= att;
                }
                if (target.hasJudge('bingliang')) {
                    attx -= att;
                }
                return attx / Math.max(2.25, Math.sqrt(target.countCards('h') + 1));
            }).forResult();
            if (result2.bool) {
                result2.targets.sortBySeat();
                player.line(result2.targets, 'green');
                game.log(result2.targets, '获得了', '#y“御风”', '效果');
                for (const i of result2.targets) {
                    i.addSkill(event.name + '_yufeng2');
                }
                if (result.score > result2.targets.length) {
                    await player.draw(result.score - result2.targets.length);
                }
            } else {
                await player.draw(result.score);
            }
        },
        $playFlappyBird(maxScore, title) {
            const event = _status.event;
            const dialog = ui.create.dialog('forcebutton', 'hidden');
            dialog.textPrompt = dialog.add('<div class="text center">准备好了吗？</div>');
            dialog.classList.add('fixed');
            dialog.classList.add('scroll1');
            dialog.classList.add('scroll2');
            dialog.classList.add('fullwidth');
            dialog.classList.add('fullheight');
            dialog.classList.add('noupdate');
            const updateText = function (str) {
                dialog.textPrompt.innerHTML = '<div class="text center">' + str + '</div>';
            };
            const canvas = document.createElement('canvas');
            dialog.appendChild(canvas);
            canvas.style.position = 'absolute';
            canvas.style.width = '276px';
            canvas.style.height = '414px';
            canvas.style.left = 'calc(50% - 141px)';
            canvas.style.top = 'calc(50% - 200px)';
            canvas.width = 276;
            canvas.height = 414;
            canvas.style.border = '3px solid';
            const RAD = Math.PI / 180;
            const ctx = canvas.getContext('2d');
            let frames = 0;
            let dx = 0.1;
            let previousDOMHighResTimeStamp = performance.now();
            let deltaTime = 0;
            const state = {
                curr: 0,
                getReady: 0,
                Play: 1,
                gameOver: 2,
                gameSuccess: 3
            };
            const SFX = {
                start: new Audio(),
                flap: new Audio(),
                score: new Audio(),
                hit: new Audio(),
                die: new Audio(),
                played: false
            };
            const gnd = {
                sprite: new Image(),
                x: 0,
                y: 0,
                draw() {
                    this.y = parseFloat(canvas.height - this.sprite.height);
                    ctx.drawImage(this.sprite, this.x, this.y);
                },
                update() {
                    if (state.curr == state.gameOver || state.curr == state.gameSuccess) {
                        return;
                    }
                    this.x -= dx * deltaTime;
                    const halfWidth = this.sprite.width / 4;
                    if (this.x <= -halfWidth) {
                        this.x += halfWidth;
                    }
                }
            };
            const bg = {
                sprite: new Image(),
                x: 0,
                y: 0,
                draw() {
                    let y = parseFloat(canvas.height - this.sprite.height);
                    ctx.drawImage(this.sprite, this.x, y);
                }
            };
            const pipe = {
                top: { sprite: new Image() },
                bot: { sprite: new Image() },
                gap: 127,
                moved: true,
                pipes: [],
                numberOfPipes: 1,
                timeElapsed: 0,
                draw() {
                    for (let i = 0; i < this.pipes.length; i++) {
                        let p = this.pipes[i];
                        ctx.drawImage(this.top.sprite, p.x, p.y);
                        ctx.drawImage(this.bot.sprite, p.x, p.y + parseFloat(this.top.sprite.height) + this.gap);
                    }
                },
                update() {
                    if (state.curr != state.Play) {
                        return;
                    }
                    this.timeElapsed += deltaTime;
                    if (this.timeElapsed >= 1600) {
                        this.timeElapsed -= 1600;
                        this.pipes.push({
                            x: parseFloat(canvas.width),
                            y: -210 * Math.min(Math.random() * 0.8 + 1.2, 1.8)
                        });
                    }
                    this.pipes.forEach((pipe2) => {
                        pipe2.x -= dx * deltaTime;
                    });
                    if (this.pipes.length && this.pipes[0].x < -this.top.sprite.width) {
                        this.pipes.shift();
                        this.moved = true;
                    }
                }
            };
            const bird = {
                animations: [{ sprite: new Image() }, { sprite: new Image() }, { sprite: new Image() }, { sprite: new Image() }],
                rotatation: 0,
                x: 50,
                y: 100,
                speed: 0,
                gravity: 4e-4,
                thrust: 0.18,
                frame: 0,
                timeElapsed: 0,
                totalTimeElapsed: 0,
                draw() {
                    let h = this.animations[this.frame].sprite.height;
                    let w = this.animations[this.frame].sprite.width;
                    ctx.save();
                    ctx.translate(this.x, this.y);
                    ctx.rotate(this.rotatation * RAD);
                    ctx.drawImage(this.animations[this.frame].sprite, -w / 2, -h / 2);
                    ctx.restore();
                },
                update() {
                    this.totalTimeElapsed += deltaTime;
                    let r = parseFloat(this.animations[0].sprite.width) / 2;
                    switch (state.curr) {
                        case state.getReady:
                        case state.gameSuccess:
                            this.rotatation = 0;
                            this.timeElapsed += deltaTime;
                            if (this.timeElapsed >= 200) {
                                this.timeElapsed -= 200;
                                this.y += Math.sin(this.totalTimeElapsed / 10 * RAD);
                                this.frame++;
                            }
                            break;
                        case state.Play:
                            this.timeElapsed += deltaTime;
                            if (this.timeElapsed >= 100) {
                                this.timeElapsed -= 100;
                                this.frame++;
                            }
                            this.y += this.speed * deltaTime;
                            this.setRotation();
                            this.speed += this.gravity * deltaTime;
                            if (UI.score.curr >= maxScore) {
                                state.curr = state.gameSuccess;
                                this.timeElapsed = 0;
                                updateText(`${title || "御风飞行"}表演成功！`);
                                setTimeout(switchToAuto, 2e3);
                            } else if (this.y + r >= gnd.y || this.collisioned()) {
                                state.curr = state.gameOver;
                                this.timeElapsed = 0;
                                updateText(`${title || "御风飞行"}表演失败……`);
                                setTimeout(switchToAuto, 2e3);
                            }
                            break;
                        case state.gameOver:
                            this.frame = 1;
                            if (this.y + r < gnd.y) {
                                this.y += this.speed * deltaTime;
                                this.setRotation();
                                this.speed += this.gravity * deltaTime;
                            } else {
                                this.speed = 0;
                                this.y = gnd.y - r;
                                this.rotatation = 90;
                                if (!SFX.played) {
                                    Promise.resolve(SFX.die.play()).catch(() => void 0);
                                    SFX.played = true;
                                }
                            }
                            break;
                    }
                    const animationsLength = this.animations.length;
                    if (this.frame >= animationsLength) {
                        this.frame -= animationsLength;
                    }
                },
                flap() {
                    if (this.y <= 0) {
                        return;
                    }
                    const flap = SFX.flap;
                    flap.currentTime = 0;
                    if (flap.paused) {
                        Promise.resolve(flap.play()).catch(() => void 0);
                    }
                    this.speed = -this.thrust;
                },
                setRotation() {
                    if (this.speed <= 0) {
                        this.rotatation = Math.max(-25, -25 * this.speed / (-1 * this.thrust));
                    } else if (this.speed > 0) {
                        this.rotatation = Math.min(90, 90 * this.speed / (this.thrust * 2));
                    }
                },
                collisioned() {
                    if (!pipe.pipes.length) {
                        return;
                    }
                    let bird2 = this.animations[0].sprite;
                    let x = pipe.pipes[0].x;
                    let y = pipe.pipes[0].y;
                    let r = bird2.height / 4 + bird2.width / 4;
                    let roof = y + parseFloat(pipe.top.sprite.height);
                    let floor = roof + pipe.gap;
                    let w = parseFloat(pipe.top.sprite.width);
                    if (this.x + r >= x) {
                        if (this.x + r < x + w) {
                            if (this.y - r <= roof || this.y + r >= floor) {
                                Promise.resolve(SFX.hit.play()).catch(() => void 0);
                                return true;
                            }
                        } else if (pipe.moved) {
                            updateText(`当前分数：${++UI.score.curr}`);
                            const score = SFX.score;
                            score.currentTime = 0;
                            if (score.paused) {
                                Promise.resolve(score.play()).catch(() => void 0);
                            }
                            pipe.moved = false;
                        }
                    }
                }
            };
            const UI = {
                getReady: { sprite: new Image() },
                gameOver: { sprite: new Image() },
                gameClear: { sprite: new Image() },
                tap: [{ sprite: new Image() }, { sprite: new Image() }],
                score: {
                    curr: 0,
                    best: 0
                },
                x: 0,
                y: 0,
                tx: 0,
                ty: 0,
                frame: 0,
                timeElapsed: 0,
                draw() {
                    switch (state.curr) {
                        case state.getReady:
                            this.y = parseFloat(canvas.height - this.getReady.sprite.height) / 2;
                            this.x = parseFloat(canvas.width - this.getReady.sprite.width) / 2;
                            this.tx = parseFloat(canvas.width - this.tap[0].sprite.width) / 2;
                            this.ty = this.y + this.getReady.sprite.height - this.tap[0].sprite.height;
                            ctx.drawImage(this.getReady.sprite, this.x, this.y);
                            ctx.drawImage(this.tap[this.frame].sprite, this.tx, this.ty);
                            break;
                        case state.gameOver:
                        case state.gameSuccess:
                            this.y = parseFloat(canvas.height - this.gameOver.sprite.height) / 2;
                            this.x = parseFloat(canvas.width - this.gameOver.sprite.width) / 2;
                            this.tx = parseFloat(canvas.width - this.tap[0].sprite.width) / 2;
                            this.ty = this.y + this.gameOver.sprite.height - this.tap[0].sprite.height;
                            ctx.drawImage((state.curr == state.gameOver ? this.gameOver : this.gameClear).sprite, this.x, this.y);
                    }
                },
                update() {
                    if (state.curr == state.Play) {
                        return;
                    }
                    this.timeElapsed += deltaTime;
                    if (this.timeElapsed >= 200) {
                        this.timeElapsed -= 200;
                        this.frame++;
                    }
                    const tapLength = this.tap.length;
                    if (this.frame >= tapLength) {
                        this.frame -= tapLength;
                    }
                }
            };
            gnd.sprite.src = lib.assetURL + 'image/flappybird/ground.png';
            bg.sprite.src = lib.assetURL + 'image/flappybird/BG.png';
            pipe.top.sprite.src = lib.assetURL + 'image/flappybird/toppipe.png';
            pipe.bot.sprite.src = lib.assetURL + 'image/flappybird/botpipe.png';
            UI.gameOver.sprite.src = lib.assetURL + 'image/flappybird/gameover.png';
            UI.gameClear.sprite.src = lib.assetURL + 'image/flappybird/gameclear.png';
            UI.getReady.sprite.src = lib.assetURL + 'image/flappybird/getready.png';
            UI.tap[0].sprite.src = lib.assetURL + 'image/flappybird/tap/t0.png';
            UI.tap[1].sprite.src = lib.assetURL + 'image/flappybird/tap/t1.png';
            bird.animations[0].sprite.src = lib.assetURL + 'image/flappybird/bird/b0.png';
            bird.animations[1].sprite.src = lib.assetURL + 'image/flappybird/bird/b1.png';
            bird.animations[2].sprite.src = lib.assetURL + 'image/flappybird/bird/b2.png';
            bird.animations[3].sprite.src = lib.assetURL + 'image/flappybird/bird/b0.png';
            SFX.start.src = lib.assetURL + 'audio/effect/flappybird_start.wav';
            SFX.flap.src = lib.assetURL + 'audio/effect/flappybird_flap.wav';
            SFX.score.src = lib.assetURL + 'audio/effect/flappybird_score.wav';
            SFX.hit.src = lib.assetURL + 'audio/effect/flappybird_hit.wav';
            SFX.die.src = lib.assetURL + 'audio/effect/flappybird_die.wav';
            const gameLoop = (domHighResTimeStamp) => {
                if (frames < 0) {
                    return;
                }
                deltaTime = domHighResTimeStamp - previousDOMHighResTimeStamp;
                previousDOMHighResTimeStamp = domHighResTimeStamp;
                update();
                draw();
                frames++;
                window.requestAnimationFrame(gameLoop);
            };
            const update = function () {
                bird.update();
                gnd.update();
                pipe.update();
                UI.update();
            };
            const draw = function () {
                ctx.fillStyle = '#30c0df';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                bg.draw();
                pipe.draw();
                bird.draw();
                gnd.draw();
                UI.draw();
            };
            const click = function () {
                switch (state.curr) {
                    case state.getReady:
                        state.curr = state.Play;
                        bird.timeElapsed = 0;
                        Promise.resolve(SFX.start.play()).catch(() => void 0);
                        updateText(`当前分数：${UI.score.curr}`);
                        break;
                    case state.Play:
                        bird.flap();
                }
            };
            const switchToAuto = function () {
                event._result = {
                    bool: true,
                    score: UI.score.curr,
                    win: UI.score.curr >= maxScore
                };
                dialog.close();
                game.resume();
                _status.imchoosing = false;
                frames = -1;
                document.removeEventListener(lib.config.touchscreen ? 'touchstart' : 'mousedown', click);
            };
            dialog.open();
            game.pause();
            game.countChoose();
            document.addEventListener(lib.config.touchscreen ? 'touchstart' : 'mousedown', click);
            window.requestAnimationFrame(gameLoop);
        },
        subSkill: {
            yufeng2: {
                trigger: { player: 'phaseZhunbeiBegin' },
                audio: false,
                forced: true,
                charlotte: true,
                sourceSkill: 'zshy_yufeng',
                async content(event, trigger, player) {
                    player.removeSkill('zshy_yufeng_yufeng2');
                    const result = await player.judge().forResult();
                    switch (result.color) {
                        case 'red':
                            player.skip('phaseDraw');
                            break;
                        case 'black':
                            player.skip('phaseUse');
                            player.skip('phaseDiscard');
                            break;
                    }
                },
                mark: true,
                intro: {
                    content: '准备阶段时进行判定，结果为红则跳过摸牌阶段，为黑则跳过出牌阶段和弃牌阶段'
                },
                ai: {
                    order: 7,
                    result: { player: 1 }
                }
            }
        }
    },

    //墟南华老仙/十常侍
    zshy_tianshu: {
        audio: 'tianshu',
        trigger: { player: 'phaseUseBegin' },
        filter(event, player) {
            return player.countCards('he') && !game.hasPlayer(function (current) {
                return current.countCards('ej', 'taipingyaoshu');
            });
        },
        direct: true,
        async content(event, trigger, player) {
            const result1 = await player.chooseCardTarget({
                prompt: get.prompt2('zshy_tianshu'),
                filterCard: true,
                position: 'he',
                ai1(card2) {
                    return 5 - get.value(card2);
                },
                ai2(target2) {
                    var player2 = _status.event.player;
                    if (get.attitude(player2, target2) > 0 && !target2.hasEmptySlot(2)) {
                        return 0;
                    }
                    return get.attitude(player2, target2);
                }
            }).forResult();
            if (!result1.bool) {
                return;
            }
            const target = result1.targets[0];
            player.logSkill('zshy_tianshu', target);
            await player.discard(result1.cards);
            let card;
            if (!lib.inpile.includes('taipingyaoshu')) {
                lib.inpile.push('taipingyaoshu');
                card = game.createCard2('taipingyaoshu', 'heart', 3);
            } else {
                card = get.cardPile(function (card2) {
                    return card2.name == 'taipingyaoshu';
                });
            }
            if (!card) {
                return;
            }
            await target.gain(card, 'gain2');
            if (target.getCards('h').includes(card) && get.name(card, target) == 'taipingyaoshu') {
                await target.chooseUseTarget(card, 'nopopup', true).forResult();
            }
        }
    },

    //墟南华老仙/十常侍
    zshy_mbdanggu: {
        trigger: {
            player: 'enterGame',
            global: 'phaseBefore'
        },
        filter(event, player) {
            return event.name != 'phase' || game.phaseNumber == 0;
        },
        derivation: ['zshy_mbdanggu_faq', 'zshy_mbdanggu_faq2', 'scstaoluan', 'scschiyan', 'scszimou', 'scspicai', 'scsyaozhuo', 'scsxiaolu', 'scskuiji', 'scschihe', 'scsniqu', 'scsmiaoyu'],
        forced: true,
        unique: true,
        onremove(player) {
            delete player.storage.zshy_mbdanggu;
            delete player.storage.zshy_mbdanggu_current;
            if (lib.skill.zshy_mbdanggu.isSingleShichangshi(player)) {
                game.broadcastAll(function (player2) {
                    player2.name1 = player2.name;
                    player2.skin.name = player2.name;
                    player2.smoothAvatar(false);
                    player2.node.avatar.setBackground(player2.name, 'character');
                    player2.node.name.innerHTML = get.slimName(player2.name);
                    delete player2.name2;
                    delete player2.skin.name2;
                    player2.classList.remove('fullskin2');
                    player2.node.avatar2.classList.add('hidden');
                    player2.node.name2.innerHTML = '';
                    if (player2 == game.me && ui.fakeme) {
                        ui.fakeme.style.backgroundImage = player2.node.avatar.style.backgroundImage;
                    }
                }, player);
            }
        },
        changshi: [
            ['scs_zhangrang', 'scstaoluan'],
            ['scs_zhaozhong', 'scschiyan'],
            ['scs_sunzhang', 'scszimou'],
            ['scs_bilan', 'scspicai'],
            ['scs_xiayun', 'scsyaozhuo'],
            ['scs_hankui', 'scsxiaolu'],
            ['scs_lisong', 'scskuiji'],
            ['scs_duangui', 'scschihe'],
            ['scs_guosheng', 'scsniqu'],
            ['scs_gaowang', 'scsmiaoyu']
        ],
        conflictMap(player) {
            if (!_status.changshiMap) {
                _status.changshiMap = {
                    scs_zhangrang: [],
                    scs_zhaozhong: [],
                    scs_sunzhang: [],
                    scs_bilan: ['scs_hankui'],
                    scs_xiayun: [],
                    scs_hankui: ['scs_bilan'],
                    scs_lisong: [],
                    scs_duangui: ['scs_guosheng'],
                    scs_guosheng: ['scs_duangui'],
                    scs_gaowang: []
                };
                if (!get.isLuckyStar(player)) {
                    var list = lib.skill.zshy_mbdanggu.changshi.map((i2) => i2[0]);
                    for (var i of list) {
                        var select = list.filter((scs) => scs != i && !_status.changshiMap[i].includes(i));
                        _status.changshiMap[i].addArray(select.randomGets(get.rand(0, select.length)));
                    }
                }
            }
            return _status.changshiMap;
        },
        async content(event, trigger, player) {
            const list = lib.skill.zshy_mbdanggu.changshi.map((i) => i[0]);
            player.markAuto('zshy_mbdanggu', list);
            game.broadcastAll(
                function (player2, list2) {
                    const cards2 = [];
                    for (let i = 0; i < list2.length; i++) {
                        const cardname = 'huashen_card_' + list2[i];
                        lib.card[cardname] = {
                            fullimage: true,
                            image: 'character:' + list2[i]
                        };
                        lib.translate[cardname] = get.rawName2(list2[i]);
                        cards2.push(game.createCard(cardname, '', ''));
                    }
                    player2.$draw(cards2, 'nobroadcast');
                },
                player,
                list
            );
            const next = game.createEvent('zshy_mbdanggu_clique');
            next.player = player;
            next.setContent(lib.skill.zshy_mbdanggu.contentx);
            await next;
        },
        async contentx(event, trigger, player) {
            let list = player.getStorage('zshy_mbdanggu').slice();
            const first = list.randomRemove();
            const others = list.randomGets(4);
            let result;
            if (others.length == 1) {
                result = { bool: true, links: others };
            } else {
                const map = {
                    scs_bilan: 'scs_hankui',
                    scs_hankui: 'scs_bilan',
                    scs_duangui: 'scs_guosheng',
                    scs_guosheng: 'scs_duangui'
                }, map2 = lib.skill.zshy_mbdanggu.conflictMap(player);
                const conflictList = others.filter((changshi) => {
                    if (map[first] && others.some((changshi2) => map[first] == changshi2)) {
                        return map[first] == changshi;
                    } else {
                        return map2[first].includes(changshi);
                    }
                });
                list = others.slice();
                if (conflictList.length) {
                    const conflict = conflictList.randomGet();
                    list.remove(conflict);
                    game.broadcastAll(
                        function (changshi, player2) {
                            if (lib.config.background_speak) {
                                if (player2.isUnderControl(true)) {
                                    game.playAudio('skill', changshi + '_enter');
                                }
                            }
                        },
                        conflict,
                        player
                    );
                }
                result = await player.chooseButton(['党锢：请选择结党对象', [[first], 'character'], '<div class="text center">可选常侍</div>', [others, 'character']], true).set('filterButton', (button) => {
                    return _status.event.canChoose.includes(button.link);
                }).set('canChoose', list).set('ai', (button) => Math.random() * 10).forResult();
            }
            if (result?.bool) {
                const chosen = result.links[0];
                const skills2 = [];
                list = lib.skill.zshy_mbdanggu.changshi;
                const changshis = [first, chosen];
                player.unmarkAuto('zshy_mbdanggu', changshis);
                player.storage.zshy_mbdanggu_current = changshis;
                player.markSkill('zshy_mbdanggu_current');
                for (const changshi of changshis) {
                    for (const cs of list) {
                        if (changshi == cs[0]) {
                            skills2.push(cs[1]);
                        }
                    }
                }
                if (lib.skill.zshy_mbdanggu.isSingleShichangshi(player)) {
                    game.broadcastAll(
                        function (player2, first2, chosen2) {
                            player2.name1 = first2;
                            player2.node.avatar.setBackground(first2, 'character');
                            player2.node.name.innerHTML = get.slimName(first2);
                            player2.name2 = chosen2;
                            player2.skin.name = first2;
                            player2.skin.name2 = chosen2;
                            player2.classList.add('fullskin2');
                            player2.node.avatar2.classList.remove('hidden');
                            player2.node.avatar2.setBackground(chosen2, 'character');
                            player2.node.name2.innerHTML = get.slimName(chosen2);
                            if (player2 == game.me && ui.fakeme) {
                                ui.fakeme.style.backgroundImage = player2.node.avatar.style.backgroundImage;
                            }
                        },
                        player,
                        first,
                        chosen
                    );
                }
                game.log(player, '选择了常侍', '#y' + get.translation(changshis));
                if (skills2.length) {
                    player.addAdditionalSkill('zshy_mbdanggu', skills2);
                    let str = '';
                    for (const i of skills2) {
                        str += '【' + get.translation(i) + '】、';
                        player.popup(i);
                    }
                    str = str.slice(0, -1);
                    game.log(player, '获得了技能', '#g' + str);
                }
            }
        },
        isSingleShichangshi(player) {
            var map = lib.skill.zshy_mbdanggu.conflictMap(player);
            return player.name == 'shichangshi' && (map[player.name1] && map[player.name2] || map[player.name1] && !player.name2 || !player.name1 && !player.name2 || player.name == player.name1 && !player.name2);
        },
        mod: {
            aiValue(player, card, num) {
                if (['shan', 'tao', 'wuxie', 'caochuan'].includes(card.name)) {
                    return num / 10;
                }
            },
            aiUseful() {
                return lib.skill.zshy_mbdanggu.mod.aiValue.apply(this, arguments);
            }
        },
        ai: {
            combo: 'zshy_mbmowang',
            nokeep: true
        },
        intro: {
            mark(dialog, storage, player) {
                dialog.addText('剩余常侍');
                dialog.addSmall([storage, 'character']);
                if (player.storage.zshy_mbdanggu_current && player.isIn()) {
                    dialog.addText('当前常侍');
                    dialog.addSmall([player.storage.zshy_mbdanggu_current, 'character']);
                }
            }
        }
    },

    //墟南华老仙/十常侍
    zshy_mbmowang: {
        trigger: {
            player: ['dieBefore', 'rest', 'dieAfter']
        },
        filter(event, player, name) {
            if (name == 'rest') {
                return true;
            }
            if (name == 'dieAfter') {
                return event.reserveOut;
            }
            return event.getParent().name != 'giveup' && player.maxHp > 0;
        },
        derivation: 'zshy_mbmowang_faq',
        forced: true,
        forceDie: true,
        forceOut: true,
        direct: true,
        priority: 15,
        group: ['zshy_mbmowang_die', 'zshy_mbmowang_return'],
        async content(event, trigger, player) {
            if (event.triggername == 'rest') {
                game.broadcastAll(
                    function (player2, list) {
                        if (list.includes(player2.name1) || player2.name1 == 'shichangshi') {
                            player2.smoothAvatar(false);
                            player2.skin.name = player2.name1 + '_dead';
                            player2.node.avatar.setBackground(player2.name1 + '_dead', 'character');
                        }
                        if (list.includes(player2.name2) || player2.name2 == 'shichangshi') {
                            player2.smoothAvatar(true);
                            player2.skin.name2 = player2.name2 + '_dead';
                            player2.node.avatar2.setBackground(player2.name2 + '_dead', 'character');
                        }
                    },
                    player,
                    lib.skill.zshy_mbdanggu.changshi.map((i) => i[0])
                );
            } else if (event.triggername == 'dieAfter') {
                if (player.getStorage('zshy_mbdanggu').length) {
                    game.broadcastAll(function () {
                        if (lib.config.background_speak) {
                            game.playAudio('die', 'shichangshiRest');
                        }
                    });
                    await player.rest({ type: 'round', count: 1 });
                }
            } else {
                if (player.isRest()) {
                    trigger.cancel();
                } else {
                    if (player.getStorage('zshy_mbdanggu').length) {
                        player.logSkill('zshy_mbmowang');
                        trigger.excludeMark.add('zshy_mbdanggu');
                        trigger.noDieAudio = true;
                        trigger.reserveOut = true;
                    } else {
                        game.broadcastAll(function (player2) {
                            player2.name1 = player2.name;
                            player2.skin.name = player2.name + '_dead';
                            player2.smoothAvatar(false);
                            player2.node.avatar.setBackground(player2.name + '_dead', 'character');
                            player2.node.name.innerHTML = get.slimName(player2.name);
                            delete player2.name2;
                            delete player2.skin.name2;
                            player2.classList.remove('fullskin2');
                            player2.node.avatar2.classList.add('hidden');
                            player2.node.name2.innerHTML = '';
                            if (player2 == game.me && ui.fakeme) {
                                ui.fakeme.style.backgroundImage = player2.node.avatar.style.backgroundImage;
                            }
                        }, player);
                    }
                }
            }
        },
        ai: {
            combo: 'zshy_mbdanggu',
            neg: true
        },
        subSkill: {
            die: {
                audio: 'zshy_mbmowang',
                trigger: { player: 'phaseAfter' },
                forced: true,
                //forceDie: true,
                async content(event, trigger, player) {
                    if (lib.skill.zshy_mbdanggu.isSingleShichangshi(player)) {
                        if (!player.getStorage('zshy_mbdanggu').length) {
                            game.broadcastAll(function (player2) {
                                player2.name1 = player2.name;
                                player2.skin.name = player2.name + '_dead';
                                player2.smoothAvatar(false);
                                player2.node.avatar.setBackground(player2.name + '_dead', 'character');
                                player2.node.name.innerHTML = get.slimName(player2.name);
                                delete player2.name2;
                                delete player2.skin.name2;
                                player2.classList.remove('fullskin2');
                                player2.node.avatar2.classList.add('hidden');
                                player2.node.name2.innerHTML = '';
                                if (player2 == game.me && ui.fakeme) {
                                    ui.fakeme.style.backgroundImage = player2.node.avatar.style.backgroundImage;
                                }
                            }, player);
                        }
                    }
                    if (!player.getStorage('zshy_mbdanggu').length) {
                        await game.delay();
                    }
                    await player.die();
                }
            },
            return: {
                trigger: { player: 'restEnd' },
                forced: true,
                charlotte: true,
                silent: true,
                forceDie: true,
                forceOut: true,
                filter(event, player) {
                    return event.player == player && player.hasSkill('zshy_mbdanggu', null, null, false);
                },
                async content(event, trigger, player) {
                    game.broadcastAll(function (player2) {
                        if (player2.name1 == 'shichangshi') {
                            player2.smoothAvatar(false);
                            player2.node.avatar.setBackground(player2.name1, 'character');
                            if (!lib.skill.zshy_mbdanggu.isSingleShichangshi(player2)) {
                                player2.skin.name = player2.name1;
                            }
                        }
                        if (player2.name2 == 'shichangshi') {
                            player2.smoothAvatar(true);
                            player2.node.avatar2.setBackground(player2.name2, 'character');
                            if (!lib.skill.zshy_mbdanggu.isSingleShichangshi(player2)) {
                                player2.skin.name2 = player2.name2;
                            }
                        }
                    }, player);
                    delete player.storage.zshy_mbdanggu_current;
                    player.markSkill('zshy_mbdanggu_current');
                    if (lib.skill.zshy_mbdanggu.isSingleShichangshi(player)) {
                        game.broadcastAll(function (player2) {
                            player2.name1 = player2.name;
                            player2.skin.name = player2.name;
                            player2.smoothAvatar(false);
                            player2.node.avatar.setBackground(player2.name, 'character');
                            player2.node.name.innerHTML = get.slimName(player2.name);
                            delete player2.name2;
                            delete player2.skin.name2;
                            player2.classList.remove('fullskin2');
                            player2.node.avatar2.classList.add('hidden');
                            player2.node.name2.innerHTML = '';
                            if (player2 == game.me && ui.fakeme) {
                                ui.fakeme.style.backgroundImage = player2.node.avatar.style.backgroundImage;
                            }
                        }, player);
                    }
                    const next = game.createEvent('zshy_mbdanggu_clique');
                    next.player = player;
                    next.setContent(lib.skill.zshy_mbdanggu.contentx);
                    await next;
                    await player.draw();
                }
            }
        }
    },

    //墟张奋/崔令仪/朱绩
    zshy_mbquchong: {
        audio: 'mbquchong',
        trigger: { player: 'phaseUseBegin' },
        filter(event, player) {
            if (!game.hasPlayer((target) => {
                return target.hasCards('e', (card) => card.name.startsWith('dagongche_'));
            })) {
                const num = player.getAllHistory('custom', (evt) => evt.name == 'zshy_mbquchong').length;
                const list = (
                    /*get.mode() == "identity" ? [0, 5, 10, 10] : */
                    [0, 2, 5, 5]
                );
                return num < 4 && player.countMark('zshy_mbquchong') >= list[num];
            }
            return game.hasPlayer((target) => {
                return target.hasCards('e', (card) => card.name.startsWith('dagongche_')) && game.hasPlayer(
                    (current) => current != target
                    /* && !current.hasCards("e", card => card.name.startsWith("dagongche_")) */
                );
            });
        },
        mod: {
            aiValue(player, card, num) {
                if (!player.hasCards('e', (cardx) => cardx.name.startsWith('dagongche_'))) {
                    return num;
                }
                if (card.name.startsWith('dagongche_')) {
                    return num;
                }
                if (get.type(card) == 'equip' && num > 0) {
                    return 0.3;
                }
            }
        },
        locked: false,
        direct: true,
        logAudio: (index) => typeof index === 'number' ? 'zshy_mbquchong' + index + '.mp3' : 4,
        async content(event, trigger, player) {
            if (game.hasPlayer((target) => {
                return target.hasCards('e', (card) => card.name.startsWith('dagongche_'));
            })) {
                let result = await player.chooseTarget(2, (card, player2, target) => {
                    if (!ui.selected.targets.length) {
                        return target.hasCards('e', (card2) => card2.name.startsWith('dagongche_'));
                    } else {
                        const from = ui.selected.targets[0];
                        return target != from;
                    }
                }).set('multitarget', true).set('cards', event.cards).set('targetprompt', ['被移走', '获得目标']).set('prompt', get.prompt(event.name)).set('prompt2', `将场上的一张【大攻车】交给另一名角色并令其使用之`).set('ai', (target) => {
                    const player2 = get.player();
                    const att = get.attitude(player2, target);
                    if (!ui.selected.targets.length) {
                        if (att > 0) {
                            return 0;
                        }
                        if (target.hasSkillTag('noe')) {
                            att /= 4;
                        }
                        return -att;
                    } else {
                        const from = ui.selected.targets[0];
                        if (from.hasCards('e', (card) => card.name.startsWith('dagongche_') && target.canEquip(card))) {
                            return att * (2.5 - target.countCards('e'));
                        }
                        return att;
                    }
                }).forResult();
                if (result?.bool) {
                    const { targets } = result;
                    const [target1, target2] = targets;
                    player.logSkill(event.name, targets, null, null, [4]);
                    const cards2 = target1.getCards('e', (card) => card.name.startsWith('dagongche_'));
                    if (cards2.length) {
                        result = await target1.chooseButton([`###渠冲###<div class='text center'>请选择其中一张牌将之交给${get.translation(target2)}并令其使用</div>`, cards2], true).set('direct', true).forResult();
                        if (result?.bool) {
                            const card = result.links[0];
                            await target2.gain(card, target1, 'giveAuto').set('giver', player);
                            if (get.position(card) == 'h' && get.owner(card) == target2 && target2.hasUseTarget(card)) {
                                await target2.chooseUseTarget(card, 'nopopup', false, true);
                            }
                        }
                    }
                }
            } else {
                const numbers = Array.from({ length: 13 }).map((_, i) => get.strNumber(i + 1));
                const list = (
                    /*get.mode() == "identity" ? [0, 5, 10, 10] : */
                    [0, 2, 5, 5]
                );
                const costMark = list[player.getAllHistory('custom', (evt) => evt.name == 'zshy_mbquchong').length];
                const result = await player.chooseButton(
                    [
                        '###' + get.prompt('zshy_mbquchong') + '###<div class="text center">消耗' + parseFloat(costMark) + '点铸造值，制造任意花色和点数的【大攻车·攻】或【大攻车·守】</div>',
                        [['dagongche_attack', 'dagongche_defend'].map((i) => [i, get.translation(i)]), 'tdnodes'],
                        [
                            lib.suit.slice().reverse().map((i) => [i, get.translation(i)]),
                            'tdnodes'
                        ],
                        [numbers, 'tdnodes']
                    ],
                    3
                ).set('filterButton', (button) => {
                    return !ui.selected.buttons.some((but) => {
                        return [['dagongche_attack', 'dagongche_defend'], lib.suit, get.event().numbers].some((list2) => list2.includes(but.link) && list2.includes(button.link));
                    });
                }).set('numbers', numbers).set('ai', () => 1 + Math.random()).forResult();
                if (result.bool) {
                    const equips = result.links.sort((a, b) => {
                        return lib.suit.includes(a) + (numbers.includes(a) ? 2 : 0) - (lib.suit.includes(b) + (numbers.includes(b) ? 2 : 0));
                    });
                    const card = game.createCard(equips[0], equips[1], get.numString(equips[2]));
                    if (!card.storage) {
                        card.storage = {};
                    }
                    if (typeof card.storage.zshy_mbquchong != 'number') {
                        card.storage.zshy_mbquchong = card.name == 'dagongche_attack' ? 2 : 3;
                    }
                    lib.skill.zshy_mbquchong.broadcast(card);
                    const resultx = await player.chooseTarget('令一名角色获得' + get.translation(card) + '并使用之', true).set('ai', (target) => {
                        const player2 = get.event().player, att = get.attitude(player2, target);
                        if (!target.canEquip(get.event().card)) {
                            return att;
                        }
                        return att * (2.5 - target.countCards('e'));
                    }).set('card', card).forResult();
                    if (resultx?.bool) {
                        const target = resultx.targets[0];
                        player.logSkill('zshy_mbquchong', target, null, null, [card.name == 'dagongche_attack' ? 3 : 2]);
                        if (costMark > 0) {
                            player.removeMark('zshy_mbquchong', costMark);
                        }
                        player.getHistory('custom').push({ name: 'zshy_mbquchong' });
                        await target.gain(card, 'gain2');
                        if (get.position(card) == 'h' && get.owner(card) == target && target.hasUseTarget(card)) {
                            await target.chooseUseTarget(card, 'nopopup', false, true);
                        }
                    }
                }
            }
        },
        broadcast(card) {
            game.broadcast(
                (card2, storage) => {
                    card2.storage = storage;
                },
                card,
                card.storage
            );
        },
        marktext: '铸',
        intro: {
            name: '铸造点',
            content: '当前拥有#铸造点'
        },
        group: ['zshy_mbquchong_recast', 'zshy_mbquchong_remove'],
        derivation: ['dagongche_attack', 'dagongche_defend'],
        subSkill: {
            recast: {
                audio: 'mbquchong1.mp3',
                inherit: 'drlt_huairou'
            },
            remove: {
                audio: 'mbquchong1.mp3',
                trigger: { global: 'phaseEnd' },
                filter(event, player) {
                    return get.discardPile((card) => get.type(card, false) == 'equip');
                },
                forced: true,
                locked: false,
                async content(event, trigger, player) {
                    const cards2 = Array.from(ui.discardPile.childNodes).filter((card) => get.type(card, false) == 'equip');
                    await game.cardsGotoSpecial(cards2);
                    await player.showCards(cards2, get.translation(player) + '发动了【渠冲】');
                    game.log(cards2, '被移出了游戏');
                    player.addMark('zshy_mbquchong', cards2.length);
                }
            },
            effect: {
                equipSkill: true,
                trigger: { player: ['loseBefore', 'mbquchongOnRemove', 'equipBefore', 'equipAfter'] },
                filter(event, player, name) {
                    if (name == 'mbquchongOnRemove') {
                        return player.hasCards('e', (card) => card.name.startsWith('dagongche_') && card.storage?.zshy_mbquchong <= 0);
                    }
                    if (event.name == 'equip') {
                        if (name == 'equipBefore') {
                            return true;
                        }
                        if (!event.card.name.startsWith('dagongche_')) {
                            return false;
                        }
                        return player.hasCards('e', (card) => {
                            return !event.cards.includes(card) && lib.filter.cardDiscardable(card, player);
                        });
                    }
                    if (event.getParent(2).name == 'disableEquip') {
                        return false;
                    }
                    if (event.getParent(2).name == 'zshy_mbquchong' || event.getParent(3).name == 'zshy_mbquchong_recast') {
                        return false;
                    }
                    return player.hasCards('e', (card) => {
                        if (!event.cards.includes(card)) {
                            return false;
                        }
                        return card.name.startsWith('dagongche_') && card.storage?.zshy_mbquchong > 0;
                    });
                },
                forced: true,
                async content(event, trigger, player) {
                    if (event.triggername == 'mbquchongOnRemove') {
                        const cards2 = player.getCards('e', (card) => card.name.startsWith('dagongche_') && card.storage?.zshy_mbquchong <= 0);
                        await player.lose(cards2, ui.special);
                        for (const card of cards2) {
                            card.fix();
                            card.remove();
                            card.destroyed = true;
                        }
                        game.log(cards2, '被移出了游戏');
                    } else if (trigger.name == 'equip') {
                        if (event.triggername == 'equipBefore') {
                            trigger.cancel();
                        } else {
                            await player.discard(
                                player.getCards('e', (card) => {
                                    return !trigger.cards.includes(card) && lib.filter.cardDiscardable(card, player);
                                })
                            );
                        }
                    } else {
                        const cards2 = player.getCards('e', (card) => {
                            if (!trigger.cards.includes(card)) {
                                return false;
                            }
                            return card.name.startsWith('dagongche_') && card.storage?.zshy_mbquchong > 0;
                        });
                        trigger.cards.removeArray(cards2);
                        for (const card of cards2) {
                            card.storage.zshy_mbquchong--;
                            game.log(card, '减少了', '#y1点', '#g耐久值');
                            lib.skill.zshy_mbquchong.broadcast(card);
                        }
                        await event.trigger('mbquchongOnRemove');
                    }
                },
                ai: {
                    effect: {
                        target(card, player, target) {
                            if (!target.hasCards('e', (card2) => card2.name.startsWith('dagongche_'))) {
                                return;
                            }
                            if (player == target && get.type(card) == 'equip') {
                                return 0;
                            }
                        }
                    }
                }
            }
        }
    },

    //墟张奋/崔令仪/朱绩
    zshy_mbxunjie: {
        audio: 'mbxunjie',
        trigger: { player: 'damageBegin4' },
        filter(event, player) {
            if (!event.source || event.source.getHp() <= player.getHp()) {
                return false;
            }
            return !game.hasPlayer((target) => {
                return target.hasCard((card) => card.name.startsWith('dagongche_'), 'e');
            });
        },
        forced: true,
        logTarget: 'source',
        async content(event, trigger, player) {
            const result = await player.judge((card) => {
                return get.color(card) == 'red' ? 2 : -2;
            }).set('judge2', (result2) => Boolean(result2.bool)).forResult();
            if (result.color == 'red') {
                trigger.num--;
            }
        },
        ai: {
            combo: 'zshy_mbquchong',
            effect: {
                target(card, player, target) {
                    if (player.getHp() <= target.getHp() || game.hasPlayer((current) => {
                        return current.hasCard((card2) => card2.name.startsWith('dagongche_'), 'e');
                    })) {
                        return;
                    }
                    if (player.hasSkillTag('jueqing', false, target)) {
                        return;
                    }
                    const num = get.tag(card, 'damage');
                    if (num) {
                        if (num > 1) {
                            return 0.55;
                        }
                        return 0.05;
                    }
                }
            }
        }
    },

    //墟张奋/崔令仪/朱绩
    zshy_mbcaiqiu: {
        audio: 'mbcaiqiu',
        logAudio: () => 2,
        trigger: { global: 'roundStart' },
        filter(event, player) {
            return game.countPlayer2(() => true, true) > 0;
        },
        forced: true,
        locked: false,
        async content(event, trigger, player) {
            const cards2 = get.cards(
                game.countPlayer2(() => true, true),
                true
            );
            const result = await player.chooseButton(['裁裘：是否获得其中任意张牌？', cards2], [1, Infinity], 'allowChooseAll').set('ai', (button) => {
                get.player();
                return 1;
            }).forResult();
            if (result?.bool && result.links?.length) {
                await player.gain(result.links, 'draw');
            }
        },
        group: 'zshy_mbcaiqiu_effect',
        subSkill: {
            effect: {
                audio: 'zshy_mbcaiqiu',
                logAudio: () => ['mbcaiqiu3.mp3', 'mbcaiqiu4.mp3'],
                trigger: { global: 'useCardAfter' },
                filter(event, player) {
                    return event.player != player && player.hasRoundHistory('gain', (evt) => {
                        if (evt.getParent().name != 'zshy_mbcaiqiu') {
                            return false;
                        }
                        return evt.cards?.length && evt.cards.some((card) => card.name == event.card.name);
                    });
                },
                round: 1,
                forced: true,
                locked: false,
                async content(event, trigger, player) {
                    await player.loseHp();
                }
            }
        }
    },

    //墟张奋/崔令仪/朱绩
    zshy_mbxishang: {
        audio: 'mbxishang',
        logAudio(event, player) {
            if (!get.nameList(player).includes('mb_cuilingyi')) {
                return 6;
            }
            const skin = player.skin[player.name2 === 'mb_cuilingyi' ? 'name2' : 'name'];
            if (skin?.indexOf('guidian') !== -1) {
                return 2;
            }
            if (skin?.indexOf('dongjiao') !== -1) {
                return ['mbxishang3.mp3', 'mbxishang4.mp3'];
            }
            if (skin?.indexOf('xiuge') !== -1) {
                return ['mbxishang5.mp3', 'mbxishang6.mp3'];
            }
            return 6;
        },
        derivation: ['mbweizhuang', 'mbweizhuang_guidianx', 'mbweizhuang_dongjiaox', 'mbweizhuang_xiugex'],
        trigger: {
            player: 'enterGame',
            global: 'phaseBefore'
        },
        filter(event, player) {
            if (!get.nameList(player).includes('mb_cuilingyi')) {
                return false;
            }
            return event.name != 'phase' || game.phaseNumber == 0;
        },
        locked: true,
        async cost(event, trigger, player) {
            const list = (lib.characterSubstitute && lib.characterSubstitute['zshy_AAZZcuilingyiMB']) || (lib.characterSubstitute && lib.characterSubstitute['mb_cuilingyi']) || [];
            if (!list.length) {
                return;
            }
            const createButton = (item, type, position, noclick, node) => {
                const [name, info] = item, skill = `mbweizhuang_${name.slice(13, -1)}x`;
                let isTemp = false;
                if (!lib.character[name]) {
                    isTemp = true;
                    lib.character[name] = get.convertedCharacter(['female', '', 0, [], info || []]);
                }
                lib.translate[name] ??= lib.translate[skill];
                node = ui.create.buttonPresets.character(name, type, position, noclick);
                if (isTemp) {
                    delete lib.character[name];
                }
                node._link = node.link = [null, null, name];
                node.skinSkill = skill;
                node._customintro = [(node2) => `形象：${lib.translate[node2.skinSkill]}`, (node2) => get.skillInfoTranslation(node2.skinSkill, null, false)];
                return node;
            };
            const result = await player.chooseButton(['袭裳：选择你本局的形象', [list.slice(0, 3), createButton], [list.slice(3, 6), createButton], [list.slice(6), createButton]], true).forResult();
            if (result?.bool && result.links?.length) {
                player.changeSkin(event.skill, result.links[0][2]);
                event.result = {
                    bool: true
                };
            }
        },
        async content(event, trigger, player) {
            if (lib.skill.mbweizhuang) { await player.addSkills('mbweizhuang'); }
        },
        mark: true,
        marktext: '裳',
        intro: {
            markcount(storage, player) {
                return player.countCards('h', (card) => card.hasGaintag('faceup_tag'));
            },
            mark(dialog, content, player) {
                const cards2 = player.getCards('h', (card) => card.hasGaintag('faceup_tag'));
                if (cards2.length) {
                    dialog.addAuto(cards2);
                } else {
                    return '无明置牌';
                }
            }
        },
        group: 'zshy_mbxishang_show',
        subSkill: {
            show: {
                audio: 'zshy_mbxishang',
                logAudio() {
                    return ['mbxishang7.mp3', 'mbxishang8.mp3'];
                },
                trigger: {
                    player: 'gainAfter',
                    global: 'loseAsyncAfter'
                },
                filter(event, player) {
                    if (event.getParent().name == 'draw') {
                        return false;
                    }
                    const cards2 = event.getg(player);
                    return cards2?.length && player.getCards('h').containsSome(...cards2);
                },
                forced: true,
                async content(event, trigger, player) {
                    const gains = trigger.getg(player);
                    const cards2 = player.getCards('h', (card) => gains.includes(card));
                    if (!cards2.length) {
                        return;
                    }
                    const next = game.createEvent('faceUpCard');
                    next.player = player;
                    next.cards = cards2;
                    next.skill = 'zshy_mbxishang';
                    next.setContent(async (event2, trigger2, player2) => {
                        const { cards: cards3 } = event2;
                        game.log(player2, '明置了', cards3);
                        game.addCardKnower(
                            cards3,
                            game.filterPlayer(() => true)
                        );
                        game.broadcastAll((cards4) => {
                            cards4.forEach((card) => card.addGaintag('faceup_tag'));
                        }, cards3);
                    });
                    player.markSkill('zshy_mbxishang');
                }
            }
        }
    },

    //墟张奋/崔令仪/朱绩
    zshy_potjiezhu: {
        audio: 'potjiezhu',
        audioname: ['zhuji_shadow'],
        enable: 'chooseToUse',
        getOnlyNum(player, isDiscard) {
            let num = player.countCards('h');
            if (isDiscard) {
                const list = game.filterPlayer((target) => target != player && target.countCards('h') < num).map((target) => target.countCards('h'));
                while (true) {
                    num--;
                    if (!list.includes(num)) {
                        return num;
                    }
                    if (num <= 0) {
                        break;
                    }
                }
            } else {
                const list = game.filterPlayer((target) => target != player && target.countCards('h') > num).map((target) => target.countCards('h'));
                while (true) {
                    num++;
                    if (!list.includes(num)) {
                        return num;
                    }
                }
            }
            return null;
        },
        viewAsFilter(player) {
            return get.info('zshy_potjiezhu').getOnlyNum(player, true) >= 0 && player.countDiscardableCards(player, 'h') > 0;
        },
        selectTarget() {
            return [1, ui.selected.cards.length];
        },
        selectCard() {
            const player = get.player();
            return player.countCards('h') - get.info('zshy_potjiezhu').getOnlyNum(player, true);
        },
        filterCard: lib.filter.cardDiscardable,
        usable: 1,
        log: false,
        viewAs: {
            name: 'sha',
            isCard: true,
            suit: 'none',
            number: void 0,
            color: 'none',
            cards: [],
            storage: {
                zshy_potjiezhu: true
            }
        },
        ai: {
            order: 4,
            result: {
                player(player) {
                    const info = get.info('zshy_potjiezhu');
                    const num = player.countCards('h') - info.getOnlyNum(player, true);
                    if (num <= 0 || num > 2) return 0;
                    return game.hasPlayer((target) => target != player && get.attitude(player, target) < 0) ? 1 : 0;
                },
                target(player, target) {
                    return get.effect(target, { name: 'sha' }, player, player);
                },
            },
        },
        ignoreMod: true,
        async precontent(event, trigger, player) {
            const skill = 'zshy_potjiezhu';
            player.logSkill(skill);
            const { cards: cards2 } = event.result;
            const num = cards2.length;
            await player.modedDiscard({ cards: cards2 });
            event.getParent().oncard = () => {
                const { player: player2, card } = get.event();
                player2.when({ global: 'useCardAfter' }).filter((evt) => evt.card == card).then(async (event2, trigger2, player3) => {
                    const { targets, card: card2 } = trigger2;
                    if (targets.length == num && targets.every((target) => target.hasHistory('damage', (evt) => evt.card == card2))) {
                        const num2 = get.info('zshy_potjiezhu').getOnlyNum(player3);
                        if (num2 > 0) {
                            await player3.drawTo(num2);
                        }
                    }
                });
            };
            event.result.cards = [];
        },
        locked: false,
        mod: {
            targetInRange(card, player, target) {
                if (card.storage?.zshy_potjiezhu) {
                    return true;
                }
            }
        }
    },

    //墟张奋/崔令仪/朱绩
    zshy_pothuanshi: {
        audio: 'pothuanshi',
        dutySkill: true,
        locked: false,
        group: ['zshy_pothuanshi_achieve', 'zshy_pothuanshi_damage'],
        mod: {
            cardEnabled(card, player) {
                if (get.name(card) == 'jiu' && !player.isDying()) {
                    return false;
                }
            },
            cardSavable(card, player) {
                if (get.name(card) == 'jiu' && !player.isDying()) {
                    return false;
                }
            }
        },
        enable: 'phaseUse',
        filter(event, player) {
            return player.hasCard((card) => get.name(card) == 'jiu' && player.canRecast(card), 'h');
        },
        prompt: '你可以重铸一张【酒】',
        filterCard(card, player) {
            return get.name(card) == 'jiu' && player.canRecast(card);
        },
        ai: {
            order: 1,
            result: {
                player: 1,
            },
        },
        lose: false,
        discard: false,
        delay: false,
        logAudio: () => 'pothuanshi2.mp3',
        derivation: ['potjianlv'],
        async content(event, trigger, player) {
            await player.recast(event.cards);
        },
        subSkill: {
            damage: {
                audio: 'pothuanshi1.mp3',
                forced: true,
                inherit: 'zf_cardDamage',
                filter(event, player) {
                    return event.card.name == 'sha' && player.getHistory('useCard', (evt) => evt.card.name == 'sha').indexOf(event) === 0;
                }
            },
            achieve: {
                audio: 'pothuanshi3.mp3',
                forced: true,
                locked: false,
                trigger: {
                    player: 'damageEnd',
                    source: 'damageSource'
                },
                filter(event, player) {
                    return event.num == player.hp;
                },
                skillAnimation: true,
                animationColor: 'wood',
                async content(event, trigger, player) {
                    player.awakenSkill('zshy_pothuanshi');
                    game.log(player, '成功完成使命');
                    player.changeSkin({ characterName: 'zhuji' }, 'zhuji_shadow');
                    game.broadcastAll(
                        (player2, name) => {
                            if (player2.name == 'zhuji' || player2.name1 == 'zhuji') {
                                player2.node.name.innerHTML = name;
                            }
                            if (player2.name2 == 'zhuji') {
                                player2.node.name2.innerHTML = name;
                            }
                        },
                        player,
                        '施绩'
                    );
                    await player.addSkills('potjianlv');
                }
            }
        }
    },

    //墟曹兴/卢毓/张芝/曹植/周瑜/刘徽
    zshy_mbjinzu: {
        audio: 'mbjinzu',
        enable: 'phaseUse',
        usable: 1,
        filter(event, player) {
            return player.countCards('h') && game.hasPlayer((current) => current != player);
        },
        filterTarget(card, player, target) {
            return target != player;
        },
        position: 'h',
        filterCard: true,
        check(card) {
            const player = get.player();
            let num = player.countCards('h'), sha = player.countCards('h', 'sha');
            if (sha && num - sha > 0 && player.hasUseTarget('sha', void 0, true)) {
                return get.name(card, player) != 'sha';
            }
            return 20 - get.value(card);
        },
        discard: false,
        lose: false,
        delay: 0,
        async content(event, trigger, player) {
            const card = event.cards[0], target = event.target;
            if (!target.countCards('h')) {
                player.$throw(card);
                await player.showCards(card, get.translation(player) + '发动了【劲镞】');
                await player.modedDiscard(card);
                const stat = player.getStat().skill;
                if (stat.zshy_mbjinzu) {
                    delete stat.zshy_mbjinzu;
                }
                const skill = 'zshy_mbjinzu_effect';
                player.storage[skill] ??= /* @__PURE__ */ new Map();
                player.storage[skill].set(target, !player.storage[skill].has(target) ? 1 : player.storage[skill].get(target) + 1);
                player.addTempSkill(skill);
                player.markSkill(skill);
                return;
            }
            const result = target.countCards('h') > 2 ? await target.chooseCard('劲镞：展示两张手牌', 2, 'h', true).forResult() : {
                bool: true,
                cards: target.getCards('h')
            };
            if (!result?.bool) {
                return;
            }
            const cards2 = [card].concat(result.cards);
            player.$throw(card);
            target.$throw(result.cards);
            game.log(player, '展示了', player, '的', card, '和', target, '的', result.cards);
            await player.showCards(cards2, get.translation(player) + '发动了【劲镞】').set('log', false);
            const numbers = cards2.map((card2) => get.number(card2)).toUniqued(), min = Math.min(...numbers), max = Math.max(...numbers), number = get.number(card);
            if (number == min || number == max) {
                const lose_list = [
                    [player, [card]],
                    [target, result.cards]
                ];
                await game.loseAsync({
                    lose_list
                }).setContent('discardMultiple');
                const stat = player.getStat().skill;
                if (stat.zshy_mbjinzu) {
                    delete stat.zshy_mbjinzu;
                }
            }
            if (result.cards.some((cardx) => get.number(cardx) <= number) && result.cards.some((cardx) => get.number(cardx) >= number)) {
                const skill = 'zshy_mbjinzu_effect';
                player.storage[skill] ??= /* @__PURE__ */ new Map();
                player.storage[skill].set(target, !player.storage[skill].has(target) ? 1 : player.storage[skill].get(target) + 1);
                player.addTempSkill(skill);
                player.markSkill(skill);
            }
        },
        subSkill: {
            effect: {
                charlotte: true,
                onremove: true,
                audio: 'zshy_mbjinzu',
                trigger: { player: 'useCard' },
                filter(event, player) {
                    return event.card?.name == 'sha';
                },
                forced: true,
                async content(event, trigger, player) {
                    const targets = Array.from(player.storage[event.name].keys()).sortBySeat();
                    trigger.directHit.addArray(targets);
                    for (const [target, num] of player.storage[event.name]) {
                        const id = target.playerid;
                        const map = trigger.customArgs;
                        map[id] ??= {};
                        if (typeof map[id].extraDamage !== 'number') {
                            map[id].extraDamage = 0;
                        }
                        map[id].extraDamage += num;
                    }
                    player.removeSkill(event.name);
                },
                ai: {
                    directHit_ai: true,
                    skillTagFilter(player, tag, arg) {
                        if (tag == 'directHit_ai' && (arg?.card?.name !== 'sha' || !player.getStorage('zshy_mbjinzu_effect', /* @__PURE__ */ new Map())?.has(arg?.target))) {
                            return false;
                        }
                    }
                },
                intro: {
                    content(storage, player) {
                        if (!storage?.size) {
                            return '';
                        }
                        let str = '下一张杀不可响应的角色和对应伤害增加值';
                        for (const [target, num] of storage) {
                            str += `<li>${get.translation(target)}：${num}`;
                        }
                        return str;
                    }
                },
                targetprompt2: (target) => {
                    const player = get.player(), card = get.card();
                    if (card?.name == 'sha') {
                        if (player.getStorage('zshy_mbjinzu_effect', /* @__PURE__ */ new Map())?.has(target)) {
                            return `强命+${player.getStorage("zshy_mbjinzu_effect", /* @__PURE__ */ new Map()).get(target)}`;
                        }
                    }
                },
                onChooseToUse(event) {
                    event.targetprompt2.add(lib.skill.zshy_mbjinzu_effect.targetprompt2);
                },
                onChooseTarget(event) {
                    event.targetprompt2.add(lib.skill.zshy_mbjinzu_effect.targetprompt2);
                }
            }
        },
        ai: {
            order(item, player) {
                let sha = player.countCards('hs', (card) => card.name == 'sha' && player.hasUseTarget('sha', true, true));
                if (!sha.length) {
                    return 0.5;
                } else if (player.countCards('hs', (card) => get.tag(card, 'draw'))) {
                    return 0;
                } else if (!game.hasPlayer((target) => target != player && get.attitude(player, target) < 0 && lib.skill.zshy_mbjinzu.ai.result.target(player, target) < 0)) {
                    return 0;
                }
                return 9;
            },
            result: {
                target(player, target) {
                    if (!target.hasCards('h')) {
                        let sha = player.countCards('hs', (card) => card.name == 'sha' && player.hasUseTarget('sha', true, true));
                        if (!sha.length) {
                            return 0;
                        } else if (target.hasSkillTag('filterDamage', null, { player })) {
                            return 0;
                        } else if (!player.hasCards('h', 'sha')) {
                            return 0;
                        } else if (!player.canUse('sha', target, void 0, true)) {
                            return 0;
                        } else if (get.effect(target, { name: 'sha' }, player, player) < 0) {
                            return 0;
                        } else if (player.hasHistory('useSkill', (evt) => evt.skill == 'zshy_mbanxian') && !player.canUse('sha', target, true, true)) {
                            return 0;
                        }
                    }
                    return -1;
                }
            }
        }
    },

    //墟曹兴/卢毓/张芝/曹植/周瑜/刘徽
    zshy_mbanxian: {
        audio: 'mbanxian',
        trigger: {
            player: 'loseAfter',
            global: 'loseAsyncAfter'
        },
        filter(event, player) {
            if (event.type != 'discard') {
                return false;
            }
            const evt = event.getl(player);
            if (!evt?.hs?.some((i) => get.position(i, true) == 'd' && i.name == 'sha')) {
                return false;
            }
            const history = player.getHistory('lose', (evtx) => {
                if (evtx.type != 'discard') {
                    return false;
                }
                return evtx?.hs?.length;
            }).map((evtx) => event.name == 'lose' ? evtx : evtx.getParent());
            return history.indexOf(event) === 0;
        },
        async cost(event, trigger, player) {
            const result = await player.chooseButton([get.prompt2(event.skill), trigger.getl(player).hs]).set('filterButton', (button) => {
                return get.event().canGain.includes(button.link);
            }).set(
                'canGain',
                trigger.getl(player).hs.filter((card) => get.position(card, true) == 'd' && card.name == 'sha')
            ).forResult();
            event.result = {
                bool: result.bool,
                cards: result?.links
            };
        },
        async content(event, trigger, player) {
            const cards2 = event.cards;
            await player.gain(cards2, 'gain2');
            if (player.hasUseTarget(cards2[0], false, false)) {
                await player.chooseUseTarget(cards2[0], true, false, 'nodistance');
            }
        },
        //group: "zshy_mbanxian_draw",
        subSkill: {
            draw: {
                trigger: {
                    source: 'damageSource'
                },
                filter(event, player) {
                    return event?.card?.name == 'sha' && event.getParent('zshy_mbanxian', true);
                },
                popup: false,
                forced: true,
                locked: false,
                async content(event, trigger, player) {
                    await player.draw(2);
                }
            }
        }
    },

    //墟曹兴/卢毓/张芝/曹植/周瑜/刘徽
    zshy_mbbingfa: {
        audio: 'mbbingfa',
        logAudio(event) {
            if (typeof event == 'number') {
                return `mbbingfa${event}.mp3`;
            }
            return 2;
        },
        trigger: {
            global: 'roundStart'
        },
        filter(event, player) {
            return game.hasPlayer((current) => !current.isTurnedOver());
        },
        async cost(event, trigger, player) {
            const falvs = lib.poptip.getInfo('bingfa_lvfa').slice(4).split('<br><li>');
            const result = await player.chooseButton([`###${get.prompt(event.skill)}###选择两条律法发布`, [falvs.map((value, index) => [index, value]), 'textbutton']], 2).set('ai', (button) => {
                return Math.random();
            }).forResult();
            if (result?.bool && result.links?.length) {
                event.result = {
                    bool: true,
                    cost_data: result.links.map((index) => [index, falvs[index]])
                };
            }
        },
        async content(event, trigger, player) {
            const { name, cost_data: lvfas } = event, targets = game.filterPlayer((current) => !current.isTurnedOver()).sortBySeat();
            const map = await game.chooseAnyOL(targets, get.info(name).chooseLvfa, [targets, player, lvfas]).forResult();
            const tickets = [0, 0, 0, 0];
            for (const target of targets) {
                if (target != player && target.hasSkill('zshy_mbbingfa_control')) {
                    target.removeSkill('zshy_mbbingfa_control');
                }
                const result = map.get(target);
                if (result?.bool && result.links?.length) {
                    lvfas.forEach((lvfa) => {
                        const count = result.links.filter((count2) => count2 === lvfa[0]).length;
                        if (count > 0) {
                            game.log(target, '为', `#r${lvfa[1]}`, '投出了', `#y${count}`, '票');
                            tickets[lvfa[0]] += count;
                        }
                    });
                }
            }
            const maxTicket = tickets.maxBy();
            const enact = async (lvfa) => {
                const [index, prompt] = lvfa;
                if (tickets[index] !== maxTicket) {
                    return;
                }
                game.log(`#r${prompt}`, '得票最多');
                player.addTip(`${name}_${index}`, `秉法 ${prompt.slice(0, 4)}`);
                player.when({
                    global: 'roundEnd'
                }).step(get.info(name).effect[index]);
            };
            await game.doAsyncInOrder(lvfas, enact, () => 1);
        },
        effect: [
            async (event, trigger, player) => {
                player.removeTip('zshy_mbbingfa_0');
                const players = game.filterPlayer(() => true);
                let max = 0, targets = [];
                for (const target of players) {
                    const num = target.getRoundHistory('sourceDamage', (evt) => evt.num).reduce((sum, evt) => {
                        return sum + evt.num;
                    }, 0);
                    if (num > max) {
                        targets = [target];
                        max = num;
                    }
                    if (num === max) {
                        targets.add(target);
                    }
                }
                const func = async (target) => {
                    await target.damage(2, 'nosource');
                };
                if (targets.length) {
                    player.logSkill('zshy_mbbingfa', targets, null, null, [get.rand(3, 4)]);
                    await game.doAsyncInOrder(targets, func);
                }
            },
            async (event, trigger, player) => {
                player.removeTip('zshy_mbbingfa_1');
                const players = game.filterPlayer(() => true);
                let max = 0, targets = [];
                for (const target of players) {
                    const num = target.getRoundHistory('gain', (evt) => evt.cards?.length).reduce((sum, evt) => {
                        return sum + evt.cards?.length;
                    }, 0);
                    if (num > max) {
                        targets = [target];
                        max = num;
                    }
                    if (num === max) {
                        targets.add(target);
                    }
                }
                const func = async (target) => {
                    target.addSkill('zshy_mbbingfa_limit');
                    target.addMark('zshy_mbbingfa_limit', 2, false);
                };
                if (targets.length) {
                    player.logSkill('zshy_mbbingfa', targets, null, null, [get.rand(3, 4)]);
                    await game.doAsyncInOrder(targets, func);
                }
            },
            async (event, trigger, player) => {
                player.removeTip('zshy_mbbingfa_2');
                const players = game.filterPlayer(() => true);
                let max = 0, targets = [];
                for (const target of players) {
                    const num = game.getRoundHistory('changeHp', (evt) => evt.player == target && evt.num !== 0).length;
                    if (num > max) {
                        targets = [target];
                        max = num;
                    }
                    if (num === max) {
                        targets.add(target);
                    }
                }
                const func = async (target) => {
                    await target.loseMaxHp();
                };
                if (targets.length) {
                    player.logSkill('zshy_mbbingfa', targets, null, null, [get.rand(3, 4)]);
                    await game.doAsyncInOrder(targets, func);
                }
            },
            async (event, trigger, player) => {
                player.removeTip('zshy_mbbingfa_3');
                const players = game.filterPlayer(() => true);
                let max = 0, targets = [];
                for (const target of players) {
                    const num = target.countCards('hej');
                    if (num > max) {
                        targets = [target];
                        max = num;
                    }
                    if (num === max) {
                        targets.add(target);
                    }
                }
                const func = async (target) => {
                    const targetx = game.filterPlayer((current) => current != target);
                    if (targetx?.length) {
                        const func2 = async (current) => {
                            if (target.countGainableCards(current, 'he')) {
                                await target.chooseToGive(current, 'he', true);
                            }
                        };
                        await game.doAsyncInOrder(targetx, func2);
                    }
                };
                if (targets.length) {
                    player.logSkill('zshy_mbbingfa', targets, null, null, [get.rand(3, 4)]);
                    await game.doAsyncInOrder(targets, func);
                }
            }
        ],
        chooseLvfa(player, targets, source, lvfas, eventId) {
            const num = game.countPlayer((current) => {
                if (!targets.includes(current)) {
                    return false;
                }
                if (current == player) {
                    if (current.getStorage('zshy_mbbingfa_control').length) {
                        return false;
                    }
                    return true;
                }
                return current.getStorage('zshy_mbbingfa_control').includes(player);
            });
            if (num > 1) {
                const event = get.event();
                const controls = [
                    (link) => {
                        const evt = get.event();
                        if (evt.dialog && evt.dialog.buttons) {
                            for (let i = 0; i < evt.dialog.buttons.length; i++) {
                                const button = evt.dialog.buttons[i];
                                button.classList.remove('selectable');
                                button.classList.remove('selected');
                                const counterNode = button.querySelector('.caption');
                                if (counterNode) {
                                    counterNode.childNodes[0].innerHTML = ``;
                                }
                            }
                            ui.selected.buttons.length = 0;
                            game.check();
                        }
                        return;
                    }
                ];
                event.controls = [ui.create.control(controls.concat(['清除选择', 'stayleft']))];
            }
            const prompt = num > 0 ? `秉法：为本轮要执行的律法投票（你持有票数：${num}）` : '秉法：你没有投票权';
            const next = player.chooseButton([prompt, [lvfas, 'textbutton']]).set('ai', (button) => {
                return Math.random();
            }).set('maxNum', num).set('filterButton', (button) => {
                const { maxNum } = get.event();
                const selected = ui.selected.buttons.slice();
                if (selected.length >= maxNum) {
                    return false;
                }
                return true;
            }).set('custom', {
                add: {
                    confirm(bool) {
                        if (bool != true) {
                            return;
                        }
                        const event = get.event().parent;
                        if (event.controls) {
                            event.controls.forEach((i) => i.close());
                        }
                        if (ui.confirm) {
                            ui.confirm.close();
                        }
                        game.uncheck();
                    },
                    button() {
                        if (ui.selected.buttons.length) {
                            return;
                        }
                        const event = get.event();
                        if (event.dialog && event.dialog.buttons) {
                            for (let i = 0; i < event.dialog.buttons.length; i++) {
                                const button = event.dialog.buttons[i];
                                const counterNode = button.querySelector('.caption');
                                if (counterNode) {
                                    counterNode.childNodes[0].innerHTML = ``;
                                }
                            }
                        }
                        if (!ui.selected.buttons.length) {
                            const evt = event.parent;
                            if (evt.controls) {
                                evt.controls[0].classList.add('disabled');
                            }
                        }
                    }
                },
                replace: {
                    button(button) {
                        const event = get.event();
                        if (!event.isMine() || !event.filterButton(button)) {
                            return;
                        }
                        if (button.classList.contains('selectable') == false) {
                            return;
                        }
                        button.classList.add('selected');
                        ui.selected.buttons.push(button);
                        let counterNode = button.querySelector('.caption');
                        const count = ui.selected.buttons.filter((i) => i == button).length;
                        if (counterNode) {
                            counterNode = counterNode.childNodes[0];
                            counterNode.innerHTML = `×${count}`;
                        } else {
                            counterNode = ui.create.caption(`<span style="font-family:xinwei; text-shadow:#FFF 0 0 4px, #FFF 0 0 4px, rgba(74,29,1,1) 0 0 3px;">×${count}</span>`, button);
                        }
                        const evt = event.parent;
                        if (evt.controls) {
                            evt.controls[0].classList.remove('disabled');
                        }
                        game.check();
                    }
                }
            }).set('id', eventId).set('_global_waiting', true);
            if (num > 0) {
                next.set('selectButton', [1, num]);
            }
            return next;
        },
        subSkill: {
            limit: {
                markimage: 'image/card/handcard.png',
                intro: {
                    markcount(storage) {
                        if (typeof storage !== 'number' || storage == 0) {
                            return null;
                        }
                        return `-${storage}`;
                    },
                    content: '手牌上限-#'
                },
                onremove: true,
                charlotte: true,
                mod: {
                    maxHandcard(player, num) {
                        return num - player.countMark('zshy_mbbingfa_limit');
                    }
                }
            },
            control: {
                charlotte: true,
                onremove: true,
                mark: true,
                intro: {
                    content: '你的投票权已被交给$'
                }
            }
        }
    },

    //墟曹兴/卢毓/张芝/曹植/周瑜/刘徽
    zshy_mbshuxing: {
        audio: 'mbshuxing',
        trigger: {
            global: 'useCardToTarget'
        },
        filter(event, player) {
            if (player != _status.currentPhase) {
                return false;
            }
            if (event.target == player || event.card.name != 'sha') {
                return false;
            }
            return !player.getStorage('zshy_mbshuxing_used').includes(event.target);
        },
        logTarget: 'target',
        check(event, player) {
            const bool = get.effect(event.target, event.card, event.player, player) > 0, hasShan = (target) => {
                if (event.player.hasSkillTag('directHit_ai', true, {
                    target,
                    card: event.card
                })) {
                    return false;
                }
                if (target.hasKnownCards(player, (card) => get.name(card) == 'shan')) {
                    return true;
                }
                return target.countCards('h') >= Math.random() * 7;
            };
            if (!bool) {
                return true;
            }
            return hasShan(event.target);
        },
        async content(event, trigger, player) {
            player.addTempSkill('zshy_mbshuxing_used');
            const evt = trigger.getParent(), target = trigger.target;
            player.markAuto('zshy_mbshuxing_used', target);
            if (evt) {
                evt.excluded.add(target);
            }
            if (!target.countCards('h')) {
                return;
            }
            const { cards: cards2 } = await target.showHandcards(`${get.translation(player)}发动了【束刑】`).forResult();
            if (cards2.every((card) => get.name(card) !== 'shan')) {
                return;
            }
            const result = await target.chooseButton(
                [
                    '束刑：选择一项',
                    [
                        [
                            ['losehp', '失去1点体力'],
                            ['give', `交给${get.translation(player)}你手牌中的【闪】和你下次【秉法】的投票权`]
                        ],
                        'textbutton'
                    ]
                ],
                true
            ).set('canGive', !target.hasSkill('zshy_mbbingfa_control')).set('source', player).set('filterButton', (button) => {
                const { player: player2, canGive, source } = get.event();
                if (button.link == 'losehp') {
                    return true;
                }
                return canGive && player2 != source;
            }).set('ai', (button) => {
                return button.link == 'give' ? 2 : 1;
            }).forResult();
            if (result?.bool && result.links?.length) {
                if (result.links.includes('losehp')) {
                    await target.loseHp();
                }
                if (result.links.includes('give')) {
                    const cards3 = target.getGainableCards(player, 'he', (card) => get.name(card) == 'shan');
                    if (cards3?.length) {
                        await target.give(cards3, player);
                    }
                    if (!target.hasSkill('zshy_mbbingfa_control')) {
                        target.addSkill('zshy_mbbingfa_control');
                        target.markAuto('zshy_mbbingfa_control', player);
                    }
                }
            }
        },
        subSkill: {
            used: {
                charlotte: true,
                onremove: true
            }
        }
    },

    //墟曹兴/卢毓/张芝/曹植/周瑜/刘徽
    zshy_mbshiju: {
        audio: 'mbshiju',
        trigger: {
            player: 'useCardAfter'
        },
        filter(event, player) {
            const history = game.getAllGlobalHistory('useCard'), index = history.indexOf(event);
            if (index <= 0) {
                return false;
            }
            const evt = history[index - 1];
            return get.type2(evt.card) == get.type2(event.card) || get.suit(evt.card) == get.suit(event.card);
        },
        forced: true,
        logAudio(event) {
            const history = game.getAllGlobalHistory('useCard'), index = history.indexOf(event);
            const evt = history[index - 1];
            const bool1 = get.type2(evt.card) == get.type2(event.card), bool2 = get.suit(evt.card) == get.suit(event.card), bool3 = get.name(evt.card) == get.name(event.card);
            return bool1 && bool2 && bool3 ? 'mbshiju3.mp3' : 2;
        },
        async content(event, trigger, player) {
            const history = game.getAllGlobalHistory('useCard'), index = history.indexOf(trigger);
            if (index <= 0) {
                return;
            }
            const evt = history[index - 1];
            const bool1 = get.type2(evt.card) == get.type2(trigger.card), bool2 = get.suit(evt.card) == get.suit(trigger.card), bool3 = get.name(evt.card) == get.name(trigger.card);
            if (bool1) {
                await player.gain(get.cards(1, true), 'gain2', false);
            }
            if (bool2) {
                await player.gain(get.bottomCards(1, true), 'gain2', false);
            }
            if (bool1 && bool2) {
                player.popup('乘势', 'fire');
                if (bool3) {
                    if (!player.hasSkill('zshy_mbkubai', null, null, false)) {
                        await player.addSkills('zshy_mbkubai');
                    } else if (player.countMark('zshy_mbkubai') < 2) {
                        game.log(player, '升级了', '#g【枯白】');
                        player.addMark('zshy_mbkubai', 1, false);
                        get.info('zshy_mbkubai').init(player, 'zshy_mbkubai');
                    }
                }
            }
        },
        init(player, skill) {
            player.addSkill(`${skill}_record`);
        },
        onremove(player, skill) {
            player.removeSkill(`${skill}_record`);
        },
        mod: {
            aiOrder(player, card, num) {
                if (typeof card == 'object') {
                    const evts = game.getAllGlobalHistory('useCard');
                    if (evts.length) {
                        let evt = evts[evts.length - 1];
                        const bool1 = get.type2(evt.card) == get.type2(card), bool2 = get.suit(evt.card) == get.suit(card), bool3 = get.name(evt.card) == get.name(card);
                        if (bool1) {
                            num += 10;
                        }
                        if (bool2) {
                            num += 10;
                        }
                        if (bool1 && bool2 && bool3) {
                            num += 30;
                        }
                    }
                    return num;
                }
            }
        },
        derivation: ['zshy_mbkubai'],
        subSkill: {
            record: {
                charlotte: true,
                trigger: {
                    global: 'useCard1'
                },
                silent: true,
                async content(event, trigger, player) {
                    get.info(event.name).init(player, event.name);
                },
                intro: {
                    markcount() {
                        const history = game.getAllGlobalHistory('useCard');
                        if (history.length) {
                            const evt = history.at(-1);
                            if (evt) {
                                return get.translation(get.suit(evt.card));
                            }
                        }
                        return 0;
                    },
                    content() {
                        const history = game.getAllGlobalHistory('useCard');
                        if (history.length) {
                            const evt = history.at(-1);
                            if (evt) {
                                return `
  									上一张被使用的牌：${get.translation(evt.card.name)}<br>
  									花色：${get.translation(get.suit(evt.card))}<br>
  									类型：${get.translation(get.type2(evt.card))}
  								`;
                            }
                        }
                        return '无效果';
                    }
                },
                init(player, skill) {
                    const history = game.getAllGlobalHistory('useCard');
                    if (history.length) {
                        const evt = history.at(-1);
                        if (!evt) {
                            return;
                        }
                        player.addTip(skill, `势举 ${get.translation(evt.card.name)}${get.translation(get.suit(evt.card))}`);
                        player.markSkill(skill);
                        game.broadcastAll(
                            (evt2, player2) => {
                                const mark = player2.marks.zshy_mbshiju_record;
                                if (mark) {
                                    mark.firstChild.innerHTML = get.translation(get.type2(evt2.card));
                                }
                            },
                            evt,
                            player
                        );
                    }
                },
                onremove(player, skill) {
                    player.removeTip(skill);
                }
            }
        }
    },

    //墟曹兴/卢毓/张芝/曹植/周瑜/刘徽
    zshy_mbchongsi: {
        audio: 'mbchongsi',
        enable: 'phaseUse',
        filter(event, player) {
            if (player.hasSkill('zshy_mbchongsi_damage')) {
                return false;
            }
            return game.hasPlayer((current) => current != player);
        },
        chooseButton: {
            dialog(event, player) {
                return ui.create.dialog(
                    '冲司',
                    [
                        [
                            ['sha', '使用一张【杀】'],
                            ['discard', '弃置两张手牌'],
                            ['damage', '对自己或装备【六龙骖驾】的角色造成1点伤害']
                        ],
                        'textbutton'
                    ],
                    'hidden'
                );
            },
            filter(button, player) {
                switch (button.link) {
                    case 'sha': {
                        return player.hasUsableCard('sha', 'use');
                    }
                    case 'discard': {
                        return player.countDiscardableCards(player, 'h') > 1;
                    }
                    default: {
                        return true;
                    }
                }
            },
            check(button) {
                const player = get.player();
                switch (button.link) {
                    case 'sha': {
                        const card = get.autoViewAs({ name: 'sha' }, 'unsure');
                        return player.getUseValue(card);
                    }
                    case 'discard': {
                        return 2 * get.effect(player, { name: 'guohe_copy', position: 'h' }, player, player);
                    }
                    default: {
                        return 0;
                    }
                }
            },
            prompt(links, player) {
                return '执行你选择的项，并选择一名其他角色，令其也选择一项执行';
            },
            backup(links, player) {
                return {
                    audio: 'zshy_mbchongsi',
                    filterTarget: lib.filter.notMe,
                    ai1: () => 1,
                    ai2(target) {
                        const player2 = get.player();
                        const targets = game.filterPlayer((current) => {
                            return current == target || Boolean(current.getEquip('cz_liulongcanjia'));
                        }), getE = (current) => get.damageEffect(current, target, target);
                        if (get.damageEffect(targets.maxBy(getE), target, player2) > 0) {
                            return Math.max(0.1, get.attitude(player2, target));
                        }
                        return -get.attitude(player2, target);
                    },
                    choice: links[0],
                    async content(event, trigger, player2) {
                        const {
                            targets: [target]
                        } = event;
                        const { choice: link } = get.info(event.name);
                        const func = async (current, link2) => {
                            let mustDamage;
                            if (link2 == 'sha') {
                                const result2 = await current.chooseToUse(function (card, player3, event2) {
                                    if (get.name(card) != 'sha') {
                                        return false;
                                    }
                                    return lib.filter.filterCard.apply(this, arguments);
                                }, '冲司：使用一张杀').forResult();
                                if (!result2?.bool) {
                                    const result22 = await current.chooseToDiscard('h', 2, '冲司：弃置两张手牌，否则你须对你或装备有【六龙骖驾】的角色造成1点伤害').set('ai', (card) => {
                                        if (get.event().eff) {
                                            return 0;
                                        }
                                        return 6 - get.value(card);
                                    }).set(
                                        'eff',
                                        (() => {
                                            const targets = game.filterPlayer((currentx) => {
                                                return currentx == current || Boolean(currentx.getEquip('cz_liulongcanjia'));
                                            }), getE = (currentx) => get.damageEffect(currentx, current, current);
                                            return getE(targets.maxBy(getE)) >= 0;
                                        })()
                                    ).forResult();
                                    if (!result22?.bool) {
                                        mustDamage = true;
                                    }
                                }
                            }
                            if (link2 == 'discard') {
                                const num = Math.min(2, current.countDiscardableCards(current, 'h'));
                                if (num > 0) {
                                    await current.chooseToDiscard('h', true, num);
                                }
                            }
                            if (link2 == 'damage' || mustDamage) {
                                current.addTempSkill('zshy_mbchongsi_damage', { global: 'roundStart' });
                                const targets = game.filterPlayer((currentx) => {
                                    return currentx == current || Boolean(currentx.getEquip('cz_liulongcanjia'));
                                });
                                if (targets.length) {
                                    const result2 = targets.length > 1 ? await current.chooseTarget(
                                        '冲司：对你或装备有【六龙骖驾】的角色造成1点伤害',
                                        (card, player3, target2) => {
                                            return get.event().targetx.includes(target2);
                                        },
                                        true
                                    ).set('targetx', targets).set('ai', (target2) => {
                                        const player3 = get.player();
                                        return get.damageEffect(target2, player3, player3);
                                    }).forResult() : {
                                        bool: true,
                                        targets
                                    };
                                    if (result2?.bool && result2.targets?.length) {
                                        current.line(result2.targets);
                                        const target2 = result2.targets[0];
                                        await target2.damage(current);
                                    }
                                }
                            }
                        };
                        await func(player2, link);
                        const result = await target.chooseButton(
                            [
                                '冲司：选择一项执行',
                                [
                                    [
                                        ['sha', '使用一张【杀】'],
                                        ['discard', '弃置两张手牌'],
                                        ['damage', '对自己或装备【六龙骖驾】的角色造成1点伤害']
                                    ],
                                    'textbutton'
                                ]
                            ],
                            true
                        ).set('filterButton', (button) => {
                            const player3 = get.player();
                            switch (button.link) {
                                case 'sha': {
                                    return player3.hasUsableCard('sha', 'use');
                                }
                                case 'discard': {
                                    return player3.countDiscardableCards(player3, 'h') > 1;
                                }
                                default: {
                                    return true;
                                }
                            }
                        }).set('ai', (button) => {
                            const player3 = get.player();
                            switch (button.link) {
                                case 'sha': {
                                    const card = get.autoViewAs({ name: 'sha' }, 'unsure');
                                    return player3.getUseValue(card);
                                }
                                case 'discard': {
                                    return 2 * get.effect(player3, { name: 'guohe_copy', position: 'h' }, player3, player3);
                                }
                                default: {
                                    const targets = game.filterPlayer((current) => {
                                        return current == player3 || Boolean(current.getEquip('cz_liulongcanjia'));
                                    }), getE = (current) => get.damageEffect(current, player3, player3);
                                    return getE(targets.maxBy(getE));
                                }
                            }
                        }).forResult();
                        if (result?.bool && result.links?.length) {
                            await func(target, result.links[0]);
                        }
                    }
                };
            }
        },
        ai: {
            order(item, player) {
                return get.order({ name: 'sha' }, player) + 0.1;
            },
            result: {
                player: 1
            }
        },
        subSkill: {
            backup: {},
            damage: {
                charlotte: true
            }
        }
    },

    //墟曹兴/卢毓/张芝/曹植/周瑜/刘徽
    zshy_mbpeidong: {
        audio: 'mbpeidong',
        logAudio(event) {
            if (typeof event == 'number') {
                return `mbpeidong${event}.mp3`;
            }
            return 4;
        },
        enable: 'chooseToUse',
        filter(event, player) {
            const filterCard = (name) => {
                const card = new lib.element.VCard({ name, isCard: true });
                return event.filterCard(card, player, event);
            }, filter = (card) => card.name == 'cz_liulongcanjia';
            if (filterCard('sha') && player.canMoveCard(false, true, player, player.getNext(), filter, false)) {
                return true;
            }
            if (filterCard('shan') && game.hasPlayer((current) => {
                return current != player && current.getGainableCards(player, 'ej', filter).length > 0;
            })) {
                return true;
            }
            if (filterCard('tao') && (() => {
                if (player.countCards('h', filter)) {
                    return true;
                }
                return get.cardPile2(filter);
            })()) {
                return true;
            }
            if (filterCard('jiu') && (() => {
                if ('addedLiulong' in _status) {
                    return false;
                }
                return player.canEquip('cz_liulongcanjia', true);
            })()) {
                return true;
            }
            return false;
        },
        chooseButton: {
            dialog(event, player) {
                const list = [];
                const filterCard = (name) => {
                    const card = new lib.element.VCard({ name, isCard: true });
                    return event.filterCard(card, player, event);
                }, filter = (card) => card.name == 'cz_liulongcanjia';
                if (filterCard('sha') && player.canMoveCard(false, true, player, player.getNext(), filter, false)) {
                    list.add(['basic', '', 'sha']);
                }
                if (filterCard('shan') && game.hasPlayer((current) => {
                    return current != player && current.getGainableCards(player, 'ej', filter).length > 0;
                })) {
                    list.add(['basic', '', 'shan']);
                }
                if (filterCard('tao') && (() => {
                    if (player.countCards('h', filter)) {
                        return true;
                    }
                    return get.cardPile2(filter);
                })()) {
                    list.add(['basic', '', 'tao']);
                }
                if (filterCard('jiu') && (() => {
                    if ('addedLiulong' in _status) {
                        return false;
                    }
                    return player.canEquip('cz_liulongcanjia', true);
                })()) {
                    list.add(['basic', '', 'jiu']);
                }
                const dialog = ui.create.dialog('辔东', [list, 'vcard'], 'hidden');
                dialog.direct = true;
                return dialog;
            },
            check(button) {
                const card = new lib.element.VCard({ name: button.link[2], isCard: true });
                return get.player().getUseValue(card);
            },
            prompt(links, player) {
                const name = links[0][2];
                switch (name) {
                    case 'sha': {
                        return `将【六龙骖驾】从装备区移至下家，视为使用【杀】`;
                    }
                    case 'shan': {
                        return `从其他角色场上获得【六龙骖驾】，视为使用【闪】`;
                    }
                    case 'tao': {
                        return `将【六龙骖驾】从手牌或牌堆亮出，视为使用【桃】`;
                    }
                    default: {
                        return `将【六龙骖驾】从游戏外置入宝物，视为使用【酒】`;
                    }
                }
            },
            backup(links, player) {
                const name = links[0][2];
                return get.copy(get.info(`zshy_mbpeidong_${name}`));
            }
        },
        hiddenCard(player, name) {
            const filterCard = (card) => card == name, filter = (card) => card.name == 'cz_liulongcanjia';
            if (filterCard('sha') && player.canMoveCard(false, true, player, player.getNext(), filter, false)) {
                return true;
            }
            if (filterCard('shan') && game.hasPlayer((current) => {
                return current != player && current.getGainableCards(player, 'ej', filter).length > 0;
            })) {
                return true;
            }
            if (filterCard('tao') && (() => {
                if (player.countCards('h', filter)) {
                    return true;
                }
                return get.cardPile2(filter);
            })()) {
                return true;
            }
            if (filterCard('jiu') && (() => {
                if ('addedLiulong' in _status) {
                    return false;
                }
                return player.canEquip('cz_liulongcanjia', true);
            })()) {
                return true;
            }
        },
        ai: {
            order: 6,
            result: {
                player(player) {
                    if (_status.event.dying) {
                        return get.attitude(player, _status.event.dying);
                    }
                    return 1;
                }
            },
            save: true,
            respondSha: true,
            respondShan: true,
            skillTagFilter(player, tag, arg) {
                const filter = (card) => card.name == 'cz_liulongcanjia';
                switch (tag) {
                    case 'respondSha': {
                        return player.canMoveCard(false, true, player, player.getNext(), filter, false);
                    }
                    case 'respondShan': {
                        return game.hasPlayer((current) => {
                            return current != player && current.getGainableCards(player, 'ej', filter).length > 0;
                        });
                    }
                    default: {
                        if (player.countCards('h', filter) || get.cardPile2(filter)) {
                            return true;
                        }
                        if ('addedLiulong' in _status) {
                            return false;
                        }
                        return player.canEquip('cz_liulongcanjia', true);
                    }
                }
            }
        },
        subSkill: {
            backup: {},
            use: {
                async precontent(event, trigger, player) {
                    event.result._apply_args = { addSkillCount: false };
                    player.popup(event.result.card.name, 'metal');
                    await game.delayx();
                },
                filterCard: () => false,
                prompt: '请选择【杀】的目标',
                selectCard: -1,
                log: false
            },
            sha: {
                viewAs: {
                    name: 'sha',
                    isCard: true
                },
                popname: true,
                filterCard: () => false,
                selectCard: -1,
                log: false,
                async precontent(event, trigger, player) {
                    player.logSkill('zshy_mbpeidong', null, null, null, [1]);
                    const target = player.getNext();
                    if (!target?.isIn()) {
                        return;
                    }
                    const cards2 = player.getCards('e', (card) => card.name == 'cz_liulongcanjia' && target.canEquip(card));
                    if (cards2.length) {
                        const result = cards2.length > 1 ? await player.chooseButton(['将一张【六龙骖驾】移动至下家', cards2], true).set('ai', (button) => {
                            return Math.random();
                        }).forResult() : {
                            bool: true,
                            links: cards2
                        };
                        if (result?.bool && result.links?.length) {
                            const next = game.createEvent('moveCard');
                            next.player = player;
                            next.targets = [player, target];
                            next.card = result.links[0];
                            next.setContent(async (event2, trigger2, playerx) => {
                                const {
                                    card,
                                    targets: [player2, target2]
                                } = event2;
                                game.log(player2, '的', card, '被移动给了', target2);
                                if (player2.getCards('e').includes(card)) {
                                    if (!card.cards?.length) {
                                        target2.removeVirtualEquip(card);
                                    } else {
                                        player2.$give(card.cards, target2, false);
                                    }
                                    await target2.equip(card);
                                }
                                event2.result = {
                                    bool: true,
                                    card,
                                    position: 'e',
                                    targets: [player2, target2]
                                };
                                await game.delay();
                            });
                            await next;
                        }
                    }
                }
            },
            shan: {
                filterTarget(_1, player, target) {
                    if (target == player) {
                        return false;
                    }
                    if (!target.countCards('ej', (card2) => card2.name == 'cz_liulongcanjia')) {
                        return false;
                    }
                    let event = _status.event, evt = event;
                    if (event._backup) {
                        evt = event._backup;
                    }
                    const card = new lib.element.VCard({ name: 'shan', isCard: true });
                    return evt.filterCard(card, player, event);
                },
                log: false,
                async content(event, trigger, player) {
                    player.logSkill('zshy_mbpeidong', null, null, null, [2]);
                    const { target } = event;
                    const cards2 = target.getGainableCards(player, 'ej', (card2) => card2.name == 'cz_liulongcanjia');
                    if (cards2.length) {
                        if (cards2.length > 1) {
                            await player.gainPlayerCard('ej', true, target).set('filterButton', (button) => button.link.name == 'cz_liulongcanjia');
                        } else {
                            await player.gain(cards2, target, 'giveAuto', 'bySelf');
                        }
                    }
                    const evt = event.getParent(2), card = { name: 'shan', isCard: true };
                    if (!evt) {
                        return;
                    }
                    game.broadcastAll((card2) => {
                        lib.skill.zshy_mbpeidong_use.viewAs = card2;
                        lib.skill.zshy_mbpeidong_use.prompt = `选择${get.translation(card2)}的目标`;
                    }, card);
                    evt.set('_backupevent', 'zshy_mbpeidong_use');
                    evt.backup('zshy_mbpeidong_use');
                    evt.set('openskilldialog', `选择${get.translation(card)}的目标`);
                    evt.set('norestore', true);
                    evt.set('custom', {
                        add: {},
                        replace: {
                            window() {
                            }
                        }
                    });
                    evt.goto(0);
                },
                ai: {
                    result: {
                        player: 2,
                        target: -1
                    }
                }
            },
            tao: {
                filterCard(card, player, target) {
                    return card.name == 'cz_liulongcanjia';
                },
                selectCard() {
                    const player = get.player(), cards2 = player.getCards('h', (card) => card.name == 'cz_liulongcanjia');
                    let event = _status.event, evt = event;
                    if (event._backup) {
                        evt = event._backup;
                    }
                    const tao = new lib.element.VCard({ name: 'tao', isCard: true });
                    if (evt.filterCard(tao, player, event) && !cards2.length) {
                        return -1;
                    }
                    return 1;
                },
                log: false,
                lose: false,
                discard: false,
                check(card) {
                    return 1;
                },
                async content(event, trigger, player) {
                    player.logSkill('zshy_mbpeidong', null, null, null, [3]);
                    const filter = (card2) => card2.name == 'cz_liulongcanjia';
                    if (event.cards?.length) {
                        await player.lose(event.cards, ui.ordering);
                        player.$throw(event.cards, 1e3);
                        await player.showCards(event.cards, get.translation(player) + '发动了【辔东】', true);
                    } else {
                        const card2 = get.cardPile2(filter);
                        if (card2) {
                            await game.cardsGotoOrdering(card2);
                            await player.showCards([card2], get.translation(player) + '发动了【辔东】', true);
                        }
                    }
                    const evt = event.getParent(2), card = { name: 'tao', isCard: true };
                    if (!evt) {
                        return;
                    }
                    game.broadcastAll((card2) => {
                        lib.skill.zshy_mbpeidong_use.viewAs = card2;
                        lib.skill.zshy_mbpeidong_use.prompt = `选择${get.translation(card2)}的目标`;
                    }, card);
                    evt.set('_backupevent', 'zshy_mbpeidong_use');
                    evt.backup('zshy_mbpeidong_use');
                    evt.set('openskilldialog', `选择${get.translation(card)}的目标`);
                    evt.set('norestore', true);
                    evt.set('custom', {
                        add: {},
                        replace: {
                            window() {
                            }
                        }
                    });
                    evt.goto(0);
                }
            },
            jiu: {
                viewAs: {
                    name: 'jiu',
                    isCard: true
                },
                popname: true,
                filterCard: () => false,
                selectCard: -1,
                log: false,
                manualConfirm: true,
                async precontent(event, trigger, player) {
                    player.logSkill('zshy_mbpeidong', null, null, null, [4]);
                    game.broadcastAll(() => {
                        _status.addedLiulong = true;
                    });
                    const card = game.createCard2('cz_liulongcanjia', 'heart', 13);
                    if (player.canEquip(card, true)) {
                        player.$gain2(card, false);
                        await player.equip(card);
                    }
                }
            }
        }
    },

    //墟曹兴/卢毓/张芝/曹植/周瑜/刘徽
    zshy_mbshouyue: {
        audio: 'mbshouyue',
        trigger: { player: ['phaseDrawBegin', 'changeHpAfter'] },
        filter(event, player) {
            return event.name != 'changeHp' || event.changedHp < 0;
        },
        async cost(event, trigger, player) {
            const next = player.chooseButtonTarget({
                createDialog: [
                    get.prompt(event.skill),
                    [
                        [
                            ['draw', `摸一张牌，令一名角色获得${get.poptip("qinyin")}（已有则改为摸一张牌）`],
                            ['reset', '令一名角色复原武将牌']
                        ],
                        'textbutton'
                    ]
                ],
                filterTarget: true,
                ai1(button) {
                    const player2 = get.player();
                    if (button.link == 'draw') {
                        return 2;
                    }
                    if (game.hasPlayer((current) => {
                        return get.attitude(player2, current) > 0 && current.isTurnedOver();
                    })) {
                        return 3;
                    }
                    return 1;
                },
                ai2(target) {
                    const player2 = get.player();
                    if (ui.selected.buttons[0]?.link == 'draw') {
                        let eff = get.effect(target, { name: 'draw' }, player2, player2);
                        if (!target.hasSkill('qinyin', null, null, false)) {
                            eff *= 1.3;
                        }
                        return eff;
                    }
                    if (get.attitude(player2, target) <= 0) {
                        return 0;
                    }
                    if (target.isTurnedOver()) {
                        return 2;
                    }
                    if (target.isLinked()) {
                        return 1.5;
                    }
                    return 1;
                }
            });
            next.set(
                'targetprompt2',
                next.targetprompt2.concat([
                    (target) => {
                        if (!target.isIn() || ui.selected.buttons[0]?.link !== 'draw') {
                            return false;
                        }
                        if (target.hasSkill('qinyin', null, null, false)) {
                            return '摸一张牌';
                        }
                        return '获得【琴音】';
                    }
                ])
            );
            const result = await next.forResult();
            if (result?.bool && result.links?.length) {
                event.result = {
                    bool: true,
                    targets: result.targets,
                    cost_data: result.links[0]
                };
            }
        },
        async content(event, trigger, player) {
            const {
                targets: [target],
                cost_data: link
            } = event;
            if (link == 'draw') {
                await player.draw();
                if (target.hasSkill('qinyin', null, null, false)) {
                    await target.draw();
                } else {
                    await target.addSkills('qinyin');
                }
            } else {
                await target.turnOver(false);
                await target.link(false);
            }
        },
        derivation: 'qinyin'
    },

    //墟曹兴/卢毓/张芝/曹植/周瑜/刘徽
    zshy_mbdieyin: {
        audio: 'mbdieyin',
        enable: 'phaseUse',
        usable: 1,
        filter(event, player) {
            return !player.isTurnedOver();
        },
        chooseButton: {
            dialog(event, player) {
                const list = lib.phaseName.map((name) => ['', '', `lusu_${name}`]);
                return ui.create.dialog('叠音', [list, 'vcard'], 'hidden');
            },
            check(button) {
                if (button.link[2].slice(5) == 'phaseDraw') {
                    return 2;
                }
                return Math.random();
            },
            prompt(links, player) {
                return `翻面并于本阶段结束后执行一个${get.translation(links[0][2])}`;
            },
            backup(links, player) {
                return {
                    audio: 'zshy_mbdieyin',
                    phase: links[0][2].slice(5),
                    async content(event, trigger, player2) {
                        const { phase } = get.info(event.name);
                        await player2.turnOver(true);
                        const evt = event.getParent('phase', true, true);
                        if (evt?.name == 'phase') {
                            evt.phaseList.splice(evt.num + 1, 0, `${phase}|zshy_mbdieyin`);
                        }
                    }
                };
            }
        },
        ai: {
            order: 1,
            result: {
                player(player) {
                    if (player.hasSkill('zshy_mbshouyue')) {
                        return 1;
                    }
                    return 0;
                }
            }
        },
        subSkill: {
            backup: {}
        }
    },

    //墟曹兴/卢毓/张芝/曹植/周瑜/刘徽
    zshy_mbgeyuan: {
        audio: 'mbgeyuan',
        init(player, skill) {
            let index = 0;
            player.setStorage(skill, index, true);
            player.addTip(skill, `${get.translation(skill)} ${get.info(skill).getNumList(index, true)}`);
        },
        onremove(player, skill) {
            player.setStorage(skill, void 0, true);
            player.removeTip(skill);
        },
        mark: true,
        marktext: '◯',
        //⚪
        intro: {
            markcount(storage) {
                storage = storage || 0;
                return Number(get.info('zshy_mbgeyuan').PI[storage]);
            },
            mark(dialog, storage, player, evt, skill) {
                let str = get.info(skill).getNumList(storage);
                dialog.addText(str);
            }
        },
        mod: {
            aiOrder(player, card, order) {
                let number = get.number(card, player), index = player.getStorage('zshy_mbgeyuan', 0);
                let num = Number(get.info('zshy_mbgeyuan').PI[index]);
                if (typeof number !== 'number') {
                    return;
                }
                if (num == number || player.hasSkill('zshy_mbchongcha') && num == 0 && number > 9) {
                    return order + 10;
                }
            },
            aiUseful(player, card, useful) {
                let number = get.number(card, player), index = player.getStorage('zshy_mbgeyuan', 0);
                let num = Number(get.info('zshy_mbgeyuan').PI[index]);
                if (typeof number !== 'number') {
                    return;
                }
                if (num == number || player.hasSkill('zshy_mbchongcha') && num == 0 && number > 9) {
                    return useful + 10;
                }
            }
        },
        trigger: { player: 'useCard' },
        filter(event, player) {
            let index = player.getStorage('zshy_mbgeyuan', 0);
            let num = Number(get.info('zshy_mbgeyuan').PI[index]), number = get.number(event.card);
            if (num == number) {
                return true;
            }
            if (typeof number == 'number' && number > 9) {
                return player.hasSkill('zshy_mbchongcha') && num == 0;
            }
            return false;
        },
        prompt2(event, player) {
            let draw = Math.min(3, player.getHistory('useSkill', (evt) => evt.skill === 'zshy_mbgeyuan').length + 1);
            return `摸${get.cnNumber(draw)}张牌并调整“割圆”中X的值`;
        },
        frequent: 'check',
        check(event, player) {
            return get.effect(player, { name: 'draw' }, player, player) > 0;
        },
        async content(event, trigger, player) {
            await player.draw(Math.min(3, player.getHistory('useSkill', (evt) => evt.skill === event.name).length));
            let index = player.getStorage(event.name, 0);
            index++;
            const { PI, getNumList } = get.info(event.name);
            if (index >= PI.length) {
                index -= PI.length;
            }
            player.setStorage(event.name, index, true);
            player.addTip(event.name, `${get.translation(event.name)} ${getNumList(index, true)}`);
        },
        getNumList(index, isTip) {
            const { PI } = get.info('zshy_mbgeyuan');
            index = index || 0;
            function getNexts(index2) {
                let result = '', cnt = 0;
                while (cnt++ < 3) {
                    let index22 = index2 + cnt - 1;
                    if (index22 >= PI.length) {
                        index22 - PI.length;
                    }
                    result += PI[index22];
                }
                return result;
            }
            let first = isTip ? PI[index] : `<span data-nature="fire">${PI[index]}</span>`, nextNums = getNexts(index + 1);
            return first + nextNums;
        },
        PI: '1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679'
    },

    //墟曹兴/卢毓/张芝/曹植/周瑜/刘徽
    zshy_mbchongcha: {
        audio: 'mbchongcha',
        mod: {
            ignoredHandcard(card, player) {
                let number = get.number(card, player);
                if (typeof number == 'number' && number > 9) {
                    return true;
                }
            },
            cardDiscardable(card, player, name) {
                if (name == 'phaseDiscard') {
                    let number = get.number(card, player);
                    if (typeof number == 'number' && number > 9) {
                        return false;
                    }
                }
            }
        },
        enable: 'phaseUse',
        usable: 1,
        filter(event, player) {
            if (!player.hasSkill('zshy_mbgeyuan', null, false, false)) {
                return false;
            }
            return player.countDiscardableCards(player, 'he') > 0;
        },
        position: 'he',
        filterCard: lib.filter.cardDiscardable,
        check(card) {
            const player = get.player();
            let index = player.getStorage('zshy_mbgeyuan', 0);
            const { getNumList } = get.info('zshy_mbgeyuan');
            let next = Number(getNumList(index, true).slice(1, 2));
            if (get.number(card, player) == next) {
                return 0;
            }
            return 10 - get.value(card);
        },
        selectTarget: 0,
        prompt(event) {
            const player = get.player();
            let index = player.getStorage('zshy_mbgeyuan', 0);
            const { PI, getNumList } = get.info('zshy_mbgeyuan');
            let num = PI[index], next = getNumList(index, true).slice(1, 2);
            return `弃一张牌并调整“割圆”中X的值（当前为${num}，调整后为${next}）`;
        },
        async content(event, trigger, player) {
            let index = player.getStorage('zshy_mbgeyuan', 0);
            index++;
            const { PI, getNumList } = get.info('zshy_mbgeyuan');
            if (index >= PI.length) {
                index -= PI.length;
            }
            player.setStorage('zshy_mbgeyuan', index, true);
            player.addTip('zshy_mbgeyuan', `${get.translation("zshy_mbgeyuan")} ${getNumList(index, true)}`);
        },
        ai: {
            order(item, player) {
                player = player || get.player();
                let index = player.getStorage('zshy_mbgeyuan', 0), hs = player.getCards('hs', (card) => player.getUseValue(card));
                if (!hs.length) {
                    return 0;
                }
                const { getNumList } = get.info('zshy_mbgeyuan');
                const numList = getNumList(index, true);
                let first = Number(numList.slice(0, 1)), next = Number(numList.slice(1, 2));
                if (hs.some((card) => get.number(card, player) == first)) {
                    return 0;
                } else if (!hs.some((card) => get.number(card, player) == next)) {
                    return 0;
                }
                return 10;
            },
            result: {
                player: 1
            }
        }
    },

    //墟彻里吉
    zshy_mbqucheng: {
        audio: 'mbqucheng',
        forced: true,
        mod: {
            targetInRange(card) {
                if (card.name == 'sha') {
                    return true;
                }
            },
            playerEnabled(card, player, target) {
                const targets = [player.next, player.previous];
                if (!card?.storage?.zshy_mbqucheng_next && !card?.storage?.zshy_mbqucheng_previous && !targets.includes(target) && card.name == 'sha') {
                    return false;
                }
            }
        },
        trigger: { player: 'useCardAfter' },
        filter(event, player) {
            const targets = event.targets;
            if (!targets || targets.length != 1) {
                return false;
            }
            const target = targets[0], card = event.card;
            if (card.name != 'sha' || player.hasHistory('sourceDamage', (evt) => evt.card == card)) {
                return false;
            }
            if (!card.storage?.zshy_mbqucheng_next && !card.storage?.zshy_mbqucheng_previous) {
                return [target.next, target.previous].some((t) => t != player);
            }
            let targetx, cardx;
            if (card.storage?.zshy_mbqucheng_next) {
                targetx = target.next;
                cardx = get.autoViewAs({ name: 'sha', isCard: true, storage: { zshy_mbqucheng_next: true } });
            }
            if (card.storage?.zshy_mbqucheng_previous) {
                targetx = target.previous;
                cardx = get.autoViewAs({ name: 'sha', isCard: true, storage: { zshy_mbqucheng_previous: true } });
            }
            return player != targetx && player.canUse(cardx, targetx, false);
        },
        async content(event, trigger, player) {
            const card = trigger.card, target = trigger.targets[0];
            let targetx, cardx;
            if (!card.storage?.zshy_mbqucheng_next && !card.storage?.zshy_mbqucheng_previous) {
                let result;
                if (player != target.next && player != target.previous) {
                    result = await player.chooseControl({
                        controls: ['下家', '上家'],
                        prompt: '请选择驱乘的方向',
                        ai() {
                            return get.event().controls.slice(0).randomGet();
                        }
                    }).forResult();
                }
                if (player == target.next || typeof result?.control == 'string' && result.control == '上家') {
                    targetx = target.previous;
                    cardx = get.autoViewAs({ name: 'sha', isCard: true, storage: { zshy_mbqucheng_previous: true } });
                } else {
                    targetx = target.next;
                    cardx = get.autoViewAs({ name: 'sha', isCard: true, storage: { zshy_mbqucheng_next: true } });
                }
            } else {
                if (card.storage.zshy_mbqucheng_next) {
                    targetx = target.next;
                    cardx = get.autoViewAs({ name: 'sha', isCard: true, storage: { zshy_mbqucheng_next: true } });
                } else {
                    targetx = target.previous;
                    cardx = get.autoViewAs({ name: 'sha', isCard: true, storage: { zshy_mbqucheng_previous: true } });
                }
            }
            if (player.canUse(cardx, targetx, false)) {
                await player.useCard(cardx, targetx);
            }
            if (trigger.addCount != false) {
                trigger.addCount = false;
                const stat = player.getStat('card'), name = trigger.card.name;
                if (typeof stat[name] == 'number' && stat[name] > 0) {
                    stat[name]--;
                }
            }
        }
    },

    //墟彻里吉
    zshy_mbqiangyong: {
        audio: 'mbqiangyong',
        logAudio: (index) => typeof index == 'number' ? 'zshy_mbqiangyong' + index + '.mp3' : 2,
        forced: true,
        trigger: { source: 'damageBegin2' },
        filter(event, player) {
            return event.card?.name == 'sha';
        },
        logTarget: 'player',
        async content(event, trigger, player) {
            const num = player.countHistory('useCard', (evt) => evt.card.name == 'sha');
            if (trigger.player.countDiscardableCards(player, 'he')) {
                await player.discardPlayerCard({
                    target: trigger.player,
                    selectButton: num,
                    forced: true,
                    position: 'he',
                    allowChooseAll: true
                });
            }
            if (!trigger.player.countCards('h')) {
                player.logSkill(event.name, trigger.player, null, null, [get.rand(3, 4)]);
                trigger.num++;
            }
        }
    },

    zshy_zhengjing2: {
        trigger: { player: 'phaseZhunbeiBegin' },
        forced: true,
        charlotte: true,
        intro: { content: 'expansion', markcount: 'expansion' },
        sourceSkill: 'zshy_zhengjing',
        onremove(player, skill) {
            var cards2 = player.getExpansions(skill);
            if (cards2.length) {
                player.loseToDiscardpile(cards2);
            }
        },
        async content(event, trigger, player) {
            await player.gain(player.getExpansions('zshy_zhengjing2'), 'gain2');
            player.skip('phaseJudge');
            player.skip('phaseDraw');
            player.removeSkill('zshy_zhengjing2');
        }
    },

    zshy_zhengjing3: {},

    zshy_mbkubai: {
        audio: 'mbkubai',
        trigger: { player: 'useCard' },
        filter(event, player) {
            if (player !== _status.currentPhase) {
                return false;
            }
            const key = ['color', 'suit', 'number'][Math.min(2, player.countMark('zshy_mbkubai'))], evts = player.getHistory('useCard');
            for (let i = 0; i < evts.length; i++) {
                const evt = evts[i];
                if (evt == event) {
                    break;
                }
                if (get[key](evt.card) == get[key](event.card)) {
                    return false;
                }
            }
            return true;
        },
        forced: true,
        locked: false,
        logAudio(event, player, name) {
            const num = Math.min(2, player.countMark('zshy_mbkubai'));
            const index = num * 2 + 1;
            return [`mbkubai${index}.mp3`, `mbkubai${index + 1}.mp3`];
        },
        async content(event, trigger, player) {
            await player.draw();
        },
        init(player, skill) {
            const level = Math.min(2, player.countMark(skill)), key = ['color', 'suit', 'number'][level];
            let list = player.getHistory('useCard').map((evt) => get[key](evt.card)).toUniqued();
            if (_status.currentPhase == player) {
                if (key == 'number') {
                    list = list.filter((i) => typeof i == 'number').sort((a, b) => a - b);
                }
                for (const target of game.filterPlayer((current) => current != player).sortBySeat()) {
                    const name = 'zshy_mbkubai_guanjued';
                    target.addTempSkill(name);
                    target.storage[name] = list;
                    target.markSkill(name);
                }
            }
        },
        derivation: ['zshy_mbkubai_suit', 'zshy_mbkubai_number'],
        group: 'zshy_mbkubai_guanjue',
        subSkill: {
            guanjue: {
                trigger: {
                    player: ['useCard1', 'phaseBeginStart']
                },
                popup: false,
                forced: true,
                locked: false,
                filter(event, player) {
                    return player == _status.currentPhase;
                },
                async content(event, trigger, player) {
                    const name = 'zshy_mbkubai';
                    get.info(name).init(player, name);
                }
            },
            guanjued: {
                charlotte: true,
                onremove: true,
                mark: true,
                marktext: '白',
                intro: {
                    markcount: (storage) => storage?.length || 0,
                    content(_1, player) {
                        const list = player.getStorage('zshy_mbkubai_guanjued'), target = _status.currentPhase;
                        if (target.hasSkill('zshy_mbkubai')) {
                            if (!list.length) {
                                return '不能使用牌';
                            }
                            const level = Math.min(2, target.countMark('zshy_mbkubai')), key = ['颜色', '花色', '点数'][level];
                            return `仅能使用${key}为${get.translation(list)}的牌`;
                        }
                        return '无效果';
                    }
                },
                mod: {
                    cardEnabled(card, player) {
                        const list = player.getStorage('zshy_mbkubai_guanjued'), target = _status.currentPhase;
                        if (target.hasSkill('zshy_mbkubai') && target != player) {
                            const level = Math.min(2, target.countMark('zshy_mbkubai')), key = get[['color', 'suit', 'number'][level]](card);
                            if (key != 'unsure' && !list.includes(key)) {
                                return false;
                            }
                        }
                    },
                    cardSavable(card, player) {
                        const list = player.getStorage('zshy_mbkubai_guanjued'), target = _status.currentPhase;
                        if (target.hasSkill('zshy_mbkubai') && target != player) {
                            const level = Math.min(2, target.countMark('zshy_mbkubai')), key = get[['color', 'suit', 'number'][level]](card);
                            if (key != 'unsure' && !list.includes(key)) {
                                return false;
                            }
                        }
                    }
                }
            },
            suit: { nopop: true },
            number: { nopop: true }
        }
    },
};

const skill_ydb = {
    ...袖里乾坤,
};

export default skill_ydb;
