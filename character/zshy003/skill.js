import { lib, game, ui, get, ai, _status } from '../../../../noname.js'
const 一将成名2011 = {
    //墟曹植
    zshy_luoying: {//落英
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'phaseEnd',
        },
        forced: true,
        filter(event, player) {
            return player.isTurnedOver();
        },
        async content(event, trigger, player) {
            player.turnOver();
        },
        mod: {
            targetInRange(card, player, target) {
                if (get.suit(card) == 'club') return true;
            },
            cardUsable(card, player, target) {
                if (get.suit(card) == 'club') return Infinity;
            },
            ignoredHandcard(card, player) {
                if (get.suit(card) == 'club') return true;
            },
            cardDiscardable(card, player, name) {
                if (name == 'phaseDiscard' && get.suit(card) == 'club') return false;
            },
        },
        group: ['zshy_luoying_Gain1'],
        subSkill: {
            Gain1: {
                audio: 'zshy_luoying',
                trigger: {
                    global: 'loseAfter',
                },
                forced: true,
                filter(event, player) {
                    if (event.type == 'useCard') return false;
                    if (event.player == player) return false;
                    for (var i = 0; i < event.cards2.length; i++) {
                        if (get.suit(event.cards2[i], event.player) == 'club' && get.position(event.cards2[i], true) == 'd') {
                            return true;
                        }
                    }
                    return false;
                },
                content() {
                    'step 0'
                    if (trigger.delay == false) game.delay();
                    'step 1'
                    var cards = [];
                    for (var i = 0; i < trigger.cards2.length; i++) {
                        var card = trigger.cards2[i];
                        if (get.suit(card, trigger.player) == 'club' && get.position(card, true) == 'd') {
                            cards.push(card);
                        }
                    }
                    if (cards.length) player.gain(cards, 'gain2');
                },
            },
        },
    },
    zshy_jiushi: {//酒诗
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AAZZcaomaoLXXH: 'zshy_jiushi_zshy_AAZZcaomaoLXXH',
        },
        enable: 'chooseToUse',
        frequent: true,
        hiddenCard(player, name) {
            if (name != 'jiu') return false;
            return !player.isTurnedOver();
        },
        filter(event, player) {
            if (player.isTurnedOver(true)) return false;
            return event.filterCard({ name: 'jiu', isCard: true }, player, event);
        },
        prompt: '当你需要使用【酒】时，你可将武将牌翻至背面并视为使用之',
        async content(event, trigger, player) {
            player.turnOver();
            player.useCard({ name: 'jiu', isCard: true }, player);
        },
        ai: {
            order: 5,
            result: {
                player(player) {
                    if (_status.event.parent.name == 'phaseUse') {
                        if (player.countCards('h', 'jiu') > 0) return 0;
                        if (player.getEquip('zhuge') && player.countCards('h', 'sha') > 1) return 0;
                        if (!player.countCards('h', 'sha')) return 0;
                        var targets = [];
                        var target;
                        var players = game.filterPlayer();
                        for (var i = 0; i < players.length; i++) {
                            if (get.attitude(player, players[i]) < 0) {
                                if (player.canUse('sha', players[i], true, true)) {
                                    targets.push(players[i]);
                                }
                            }
                        }
                        if (targets.length) target = targets[0];
                        else return 0;
                        var num = get.effect(target, { name: 'sha' }, player, player);
                        for (var i = 1; i < targets.length; i++) {
                            var num2 = get.effect(targets[i], { name: 'sha' }, player, player);
                            if (num2 > num) {
                                target = targets[i];
                                num = num2;
                            }
                        }
                        if (num <= 0) return 0;
                        var e2 = target.getEquip(2);
                        if (e2) {
                            if (e2.name == 'tengjia') {
                                if (!player.countCards('h', { name: 'sha', nature: 'fire' }) && !player.getEquip('zhuque')) return 0;
                            }
                            if (e2.name == 'renwang') {
                                if (!player.countCards('h', { name: 'sha', color: 'red' })) return 0;
                            }
                            if (e2.name == 'baiyin') return 0;
                        }
                        if (player.getEquip('guanshi') && player.countCards('he') > 2) return 1;
                        return target.countCards('h') > 3 ? 0 : 1;
                    }
                    if (player == _status.event.dying || player.isTurnedOver()) return 3;
                },
            },
            effect: {
                target(card, player, target) {
                    if (card.name == 'guiyoujie') return [0, 0.5];
                    if (target.isTurnedOver()) {
                        if (get.tag(card, 'damage')) {
                            if (player.hasSkillTag('jueqing', false, target)) return [1, -2];
                            if (target.hp == 1) return;
                            return [1, target.countCards('h') / 2];
                        }
                    }
                },
            },
        },
        group: ['zshy_jiushi_Sub', 'zshy_jiushi_damage'],
        subSkill: {
            zshy_AAZZcaomaoLXXH: { audio: 'ext:诸神寰宇/audio/character:2' },
            Sub: {
                audio: 'zshy_jiushi',
                audioname2: {
                    zshy_AAZZcaomaoLXXH: 'zshy_jiushi_zshy_AAZZcaomaoLXXH',
                },
                trigger: {
                    player: ['damageEnd', 'turnOverEnd'],
                },
                forced: true,
                filter(event, player, name) {
                    if (name == 'turnOverEnd') return true;
                    return player.isTurnedOver(true);
                },
                content() {
                    if (event.triggername == 'turnOverEnd') {
                        var card = get.cardPile(function (card) {
                            return get.type(card) == 'trick';
                        });
                        if (card) player.gain(card, 'gain2');
                    }
                    else {
                        player.turnOver(false);
                    }
                },
            },
            damage: {
                trigger: {
                    player: 'damageBegin4',
                },
                filter(event, player) {
                    return !player.isTurnedOver(true);
                },
                prompt2: '翻面并防止此次伤害',
                check(event, player, target) {
                    return get.damageEffect(player, event.source, player) < 0;
                },
                async content(event, trigger, player) {
                    trigger.cancel();
                    player.turnOver();
                },
                ai: {
                    result: {
                        player(player, target) {
                            return get.damageEffect(player, target, player);
                        },
                    },
                },
            },
        },
    },

    //墟高顺
    zshy_xianzhen: {//陷阵
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        usable: 1,
        filterTarget(card, player, target) {
            return target != player && !player.getStorage('zshy_xianzhen_damage').includes(target);
        },
        async content(event, trigger, player) {
            player.markAuto('zshy_xianzhen_damage', [event.target]);
            player.addSkill('zshy_xianzhen_damage');
            player.addSkill('zshy_xianzhen_target');
            event.target.damage();
            player.draw();
        },
        mod: {
            ignoredHandcard(card, player) {
                if (get.name(card) == 'sha') {
                    return true;
                }
            },
            cardDiscardable(card, player, name) {
                if (name == 'phaseDiscard' && get.name(card) == 'sha') {
                    return false;
                }
            },
        },
        ai: {
            order: 13,
            result: {
                target(player, target) {
                    if (get.attitude(player, target) < 0) return -10;
                    return 0;
                },
            },
        },
        subSkill: {
            damage: {
                audio: 'zshy_xianzhen',
                charlotte: true,
                onremove: true,
                trigger: { player: 'useCard2' },
                filter(event, player) {
                    if (!get.tag(event.card, 'damage')) return false;
                    if (!Array.isArray(event.targets)) return false;
                    return game.hasPlayer(target => {
                        if (!player.getStorage('zshy_xianzhen_damage').includes(target)) return false;
                        return !event.targets.includes(target) && lib.filter.targetEnabled2(event.card, player, target);
                    });
                },
                check(event, player, target) {
                    if (event.card == 'wuzhong') return false;
                    return get.effect(player, event.card, event.target, player) < 0;
                },
                async cost(event, trigger, player) {
                    const targets = game.filterPlayer(target => {
                        if (!player.getStorage('zshy_xianzhen_damage').includes(target)) return false;
                        return !trigger.targets.includes(target) && lib.filter.targetEnabled2(trigger.card, player, target);
                    });
                    if (targets.length == 1) {
                        const target = targets[0];
                        const bool = await player.chooseBool(get.prompt('zshy_xianzhen_damage', target), '令' + get.translation(target) + '也成为' + get.translation(trigger.card) + '的目标').forResult();
                        event.result = { bool: bool, targets: targets };
                    } else {
                        event.result = await player
                            .chooseTarget(get.prompt('zshy_xianzhen_damage'), '令任意名【陷阵】选中的目标角色也成为' + get.translation(trigger.card) + '的目标', [1, Infinity], (card, player, target) => {
                                const trigger = get.event().getTrigger();
                                if (!player.getStorage('zshy_xianzhen_damage').includes(target)) return false;
                                return !trigger.targets.includes(target) && lib.filter.targetEnabled2(trigger.card, player, target);
                            })
                            .set('ai', target => {
                                const player = get.event().player,
                                    trigger = get.event().getTrigger();
                                return get.effect(target, trigger.card, player, player);
                            })
                            .forResult();
                    }
                },
                async content(event, trigger, player) {
                    trigger.targets.addArray(event.targets);
                    game.log(event.targets, '成为了', trigger.card, '的额外目标');
                },
                mod: {
                    targetInRange(card, player, target) {
                        if (player.getStorage('zshy_xianzhen_damage').includes(target)) return true;
                    },
                    cardUsableTarget(card, player, target) {
                        if (player.getStorage('zshy_xianzhen_damage').includes(target)) return true;
                    },
                },
                ai: {
                    unequip: true,
                    skillTagFilter(player, tag, arg) {
                        if (!arg || !arg.target || !player.getStorage('zshy_xianzhen_damage').includes(arg.target)) return false;
                    },
                    effect: {
                        player_use(card, player, target, current, isLink) {
                            if (isLink || !target || player._zshy_xianzhen_damage_temp) return;
                            if (!player.getStorage('zshy_xianzhen_damage').includes(target) && ['sha', 'guohe', 'shunshou', 'huogong', 'juedou'].includes(card.name)) {
                                player._zshy_xianzhen_damage_temp = true;
                                let eff = get.effect(target, card, player, player);
                                delete player._zshy_xianzhen_damage_temp;
                                if (eff > 0) {
                                    return [1, 2];
                                }
                            }
                        },
                    },
                },
            },
        },
    },
    zshy_jinjiu: {//禁酒
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: ['useCard1', 'respond'] },
        firstDo: true,
        forced: true,
        filter(event, player) {
            return get.name(event.card) == 'sha' && !event.skill && event.cards.length == 1 && event.cards[0].name == 'jiu';
        },
        content() { },
        mod: {
            cardname(card, player) {
                if (card.name == 'jiu') return 'sha';
            },
        },
        ai: {
            skillTagFilter(player) {
                if (!player.countCards('h', 'jiu')) return false;
            },
            respondSha: true,
        },
        group: ['zshy_jinjiu_sub'],
        global: ['zshy_jinjiu_buff'],
        subSkill: {
            sub: {
                audio: 'zshy_jinjiu',
                forced: true,
                trigger: { player: 'damageBegin3' },
                sourceSkill: 'zshy_jinjiu',
                filter(event, player) {
                    return event.getParent(2).jiu == true;
                },
                content() {
                    trigger.num -= trigger.getParent(2).jiu_add;
                },
                ai: {
                    filterDamage: true,
                    skillTagFilter(player, tag, arg) {
                        return arg && arg.jiu == true;
                    },
                },
            },
            buff: {
                mod: {
                    cardEnabled(card, player) {
                        if (card.name == 'jiu' && _status.currentPhase && _status.currentPhase != player && _status.currentPhase.hasSkill('rejinjiu')) return false;
                    },
                    cardSavable(card, player) {
                        if (card.name == 'jiu' && _status.currentPhase && _status.currentPhase != player && _status.currentPhase.hasSkill('rejinjiu')) return false;
                    },
                },
            },
        },
    },

    //墟陈宫
    zshy_mingce: {//明策
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        usable: 1,
        position: 'he',
        filterCard(card) {
            return true;
        },
        filter(event, player) {
            return player.countCards('he') > 0;
        },
        check(card) {
            return 8 - get.value(card);
        },
        selectTarget: 2,
        multitarget: true,
        discard: false,
        lose: false,
        targetprompt: ['得到牌', '出杀目标'],
        filterTarget(card, player, target) {
            if (ui.selected.targets.length == 0) {
                return player != target;
            }
            return true;
        },
        delay: false,
        content() {
            'step 0';
            player.give(cards, targets[0], 'visible');
            player.draw();
            'step 1';
            var str1 = '视为对' + get.translation(targets[1]) + '使用一张【杀】，若此杀造成伤害则执行选项二',
                str2 = '你与' + get.translation(player) + '各摸一张牌',
                str3 = '对' + get.translation(targets[1]) + '使用一张杀，或摸一张牌';
            if (!targets[0].canUse({ name: 'sha', isCard: true }, targets[1], false, false)) event._result = { control: '选项二' };
            else
                targets[0].chooseControl().set('ai', function () {
                    var player = _status.event.player,
                        target = _status.event.target;
                    return get.effect(target, { name: 'sha', isCard: true }, player, player) > 0 ? 0 : 1;
                }).set('choiceList', [str1, str2]).set('target', targets[1])
                    .set('prompt', str3);
            'step 2';
            if (result.control == '选项二') {
                game.asyncDraw([player, targets[0]]);
                event.finish();
            } else {
                targets[0].useCard({ name: 'sha', isCard: true }, targets[1]);
            }
            'step 3';
            if (
                targets[0].hasHistory('useCard', evt => {
                    return evt.getParent() == event && targets[0].hasHistory('sourceDamage', evtx => evt.card == evtx.card);
                })
            ) {
                game.asyncDraw([player, targets[0]]);
            }
        },
        ai: {
            result: {
                player(player) {
                    var players = game.filterPlayer();
                    for (var i = 0; i < players.length; i++) {
                        if (players[i] != player && get.attitude(player, players[i]) > 1 && get.attitude(players[i], player) > 1) {
                            return 1;
                        }
                    }
                    return 0;
                },
                target(player, target) {
                    if (ui.selected.targets.length) {
                        return -0.1;
                    }
                    return 1;
                },
            },
            order: 8.5,
            expose: 0.2,
        },
    },
    zshy_zhichi: {//智迟
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'damageAfter' },
        forced: true,
        filter(event, player) {
            return _status.currentPhase != player;
        },
        check() { },
        content() {
            player.addTempSkill('zshy_zhichi_refuse', { player: 'phaseBegin' });
        },
        subSkill: {
            refuse: {
                audio: 'zshy_zhichi',
                trigger: { target: 'useCardToTargeted' },
                forced: false,
                charlotte: true,
                firstDo: true,
                sourceSkill: 'zshy_zhichi',
                filter(event, player) {
                    return get.type(event.card) == 'trick' || get.name(event.card) == 'sha';
                },
                prompt2(event, player) {
                    return '令' + get.translation(event.card) + '对你无效';
                },
                check(event, player) {
                    return get.effect(event.player, event.card, player, event.player) < 0;
                },
                content() {
                    game.log(player, '发动了智迟，', trigger.card, '对', trigger.target, '失效');
                    trigger.excluded.push(player);
                },
                mark: true,
                intro: {
                    content: '你可以令杀或普通锦囊牌对你无效',
                },
                ai: {
                    effect: {
                        target(card, player, target, current) {
                            if (get.type(card) == 'trick' || card.name == 'sha') return 'zeroplayertarget';
                        },
                    },
                },
            },
        },
    },

    zshy_xuanfeng: {//旋风
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: ['loseAfter'],
            global: ['equipAfter', 'addJudgeAfter', 'gainAfter', 'loseAsyncAfter', 'addToExpansionAfter'],
        },
        filter(event, player) {
            const evt = event.getl(player);
            return evt && (evt.es.length || evt.cards2.length > 1);
        },
        content() {
            'step 0'
            num = 0;
            for (var i = 0; i < trigger.cards.length; i++) {
                if (get.type(trigger.cards[i]) == 'equip') num += 2;
                else num++;
            }
            event.num = num;
            rnum = num;
            'step 1'
            player.chooseTarget(get.prompt('zshy_xuanfeng'), '弃置一名其他角色的一张牌', (card, player, target) => {
                return target.countDiscardableCards(player, 'he') && target != player;
            }).set('ai', target => {
                var player = _status.event.player;
                return get.effect(target, { name: 'guohe_copy2' }, player, player);
            });
            'step 2'
            if (result.bool) {
                var target = result.targets[0];
                player.discardPlayerCard(target, 'he', true);
                event.num--;
            } else event.goto(4);
            'step 3'
            if (event.num > 0) event.goto(1);
            'step 4'
            if (game.countPlayer(function (current, player) {
                return rnum >= current.hp;
            }) > 0) {
                player.chooseTarget([1, Infinity], get.prompt('zshy_xuanfeng'), '对任意名体力值不大于弃置牌数的其他角色造成1点伤害', (card, player, target) => {
                    return target != player && rnum >= target.hp;
                }).set('ai', function (target) {
                    var player = _status.event.player;
                    return get.damageEffect(target, player, player);
                });
            } else event.finish();
            'step 5'
            if (result.bool) {
                for (i = 0; i < result.targets.length; i++) {
                    result.targets[i].damage();
                }
            }
        },
        ai: {
            reverseEquip: true,
            nodiscard: true,
            nolose: true,
            damage: true,
            noe: true,
            noh: true,
            effect: {
                target(card, player, target, current) {
                    if (get.type(card) == 'equip' && !get.cardtag(card, 'gifts')) return [1, 3];
                },
            },
        },
    },
    zshy_yongjin: {//勇进
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'useCard' },
        forced: true,
        filter(event, card) {
            return get.type(event.card) == 'equip';
        },
        content() {
            'step 0'
            player.draw(2);
            'step 1'
            player.chooseTarget(get.prompt('zshy_yongjin'), '对一名其他角色造成一点伤害', function (event, target, player) {
                return target != player;
            }).set('ai', function (target) {
                var player = _status.event.player;
                return get.damageEffect(target, player, player);
            })
            'step 2'
            if (result.targets) {
                result.targets[0].damage();
            } else event.finish();
        },
        ai: {
            reverseEquip: true,
        },
    },

    zshy_sanyao: {//散谣
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        filter(event, player, target, current) {
            return game.countPlayer(function (current) {
                return current != player && !current.hasSkill('zshy_sanyao_used');
            }) > 0;
        },
        filterTarget(event, player, target) {
            return target != player && !target.hasSkill('zshy_sanyao_used');
        },
        check(target) {
            var att = get.attitude(player, target);
            if (att < 0) return true;
            if (att > 0 && target.countCards('j')) return true;
            return false;
        },
        content() {
            target.damage('nocard');
            target.addTempSkill('zshy_sanyao_used', 'phaseUseAfter');
        },
        ai: {
            order: 7,
            damage: true,
            result: {
                player: 1,
            },
        },
        subSkill: {
            used: {
                charlotte: true,
                onremove: true,
            },
        },
    },
    zshy_zhiman: {//制蛮
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AAZZguansuoJMGX: 'zshy_zhiman_zshy_AAZZguansuoJMGX',
        },
        trigger: { source: 'damageBegin2' },
        filter(event, player) {
            return player != event.player;
        },
        check(event, player) {
            if (!player.getStorage('zshy_zhiman').includes(event.player)) return true;
            if (get.damageEffect(event.player, player, player) < 0) return true;
            var att = get.attitude(player, event.player);
            if (att > 0 && event.player.countCards('j')) return true;
            if (event.num > 1) {
                if (att < 0) return false;
                if (att > 0) return true;
            }
            var cards = event.player.getGainableCards(player, 'he');
            for (var i = 0; i < cards.length; i++) {
                if (get.equipValue(cards[i]) >= 6) return true;
            }
            return false;
        },
        onremove: true,
        mark: true,
        intro: {
            content: '已记录的目标：$',
            onunmark: true,
        },
        prompt2(event, player) {
            return '记录' + get.translation(event.player) + '并获得其区域内的一张牌，然后防止此次伤害';
        },
        content() {
            if (!player.getStorage('zshy_zhiman').includes(trigger.player)) {
                player.markAuto('zshy_zhiman', [trigger.player]);
            };
            if (trigger.player.countGainableCards(player, 'hej')) {
                player.gainPlayerCard(trigger.player, 'hej');
            };
            trigger.cancel();
        },
        group: ['zshy_zhiman_damage'],
        subSkill: {
            zshy_AAZZguansuoJMGX: { audio: 'ext:诸神寰宇/audio/character:2' },
            damage: {
                audio: 'zshy_zhiman',
                trigger: {
                    player: ['damageBegin4'],
                },
                filter(event, player, source) {
                    return player.getStorage('zshy_zhiman').includes(event.source);
                },
                prompt2(event, player) {
                    return '获得' + get.translation(event.source) + '区域内的一张牌并防止本次' + event.num + '点伤害，然后从〖制蛮〗记录中移除其';
                },
                content() {
                    if (trigger.source.countGainableCards(player, 'hej')) {
                        player.gainPlayerCard(trigger.source, 'hej');
                    };
                    trigger.cancel();
                    player.unmarkAuto('zshy_zhiman', [trigger.source]);
                },
            },
        },
    },

    zshy_ganlu: {//甘露
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        usable: 1,
        selectTarget: 2,
        delay: 0,
        filterTarget(card, player, target) {
            if (target.isMin()) return false;
            if (ui.selected.targets.length == 0) return true;
            if (ui.selected.targets[0].countCards('e') == 0 && target.countCards('e') == 0) return false;
            return true;
        },
        multitarget: true,
        multiline: true,
        content() {
            'step 0';
            targets[0].swapEquip(targets[1]);
            'step 1';
            game.delayx();
            var num = Math.abs(targets[0].countCards('e') - targets[1].countCards('e'));
            player.draw(num);
        },
        ai: {
            order: 10,
            expose: 0.2,
            threaten(player, target) {
                return 0.8 * Math.max(1 + target.maxHp - target.hp);
            },
            result: {
                target(player, target) {
                    if (!ui.selected.targets.length) return -get.value(target.getCards('e'), target);
                    var target2 = ui.selected.targets[0];
                    var eff_target = get.value(target2.getCards('e'), target) - get.value(target.getCards('e'), target);
                    if (get.sgn(eff_target) == get.sgn(-get.value(target2.getCards('e'), target2))) return 0;
                    return eff_target;
                },
            },
        },
    },
    zshy_buyi: {//补益
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'dying',
        },
        filter(event, player) {
            return event.player.hp <= 0 && event.player.countCards('he') > 0;
        },
        logTarget: 'player',
        async cost(event, trigger, player) {
            const target = trigger.player;
            let check;
            if (trigger.player.isUnderControl(true, player)) {
                check = player.hasCard(card => {
                    return get.type(card) != 'basic';
                }, 'he');
            } else {
                check = get.attitude(player, target) > 0;
            }
            event.result = await player
                .choosePlayerCard(target, get.prompt(event.name.slice(0, -5), target), 'he', 'visible')
                .set('ai', button => {
                    if (!get.event().check) return 0;
                    if (get.event().target.isUnderControl(true, get.player())) {
                        if (get.type(button.link) != 'basic') {
                            return 10 - get.value(button.link);
                        }
                        return 0;
                    } else {
                        return Math.random();
                    }
                })
                .set('check', check)
                .set('filterButton', button => {
                    if (get.player() == get.event().target) {
                        return lib.filter.cardDiscardable(button.link, get.player());
                    }
                    return true;
                })
                .forResult();
        },
        async content(event, trigger, player) {
            const target = trigger.player;
            await player.showCards(event.cards, get.translation(player) + '对' + (player == target ? '自己' : get.translation(target)) + '发动了【补益】');
            if (get.type(event.cards[0]) != 'basic') {
                await target.discard(event.cards[0]);
                await target.recover(1 - target.hp);
            }
        },
    },

    //墟徐盛
    zshy_pojun: {//破军
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'useCardToPlayered' },
        direct: true,
        filter(event, player) {
            return get.tag(event.card, 'damage') && event.targets.length == 1 && event.target.countCards('he') > 0;
        },
        content() {
            'step 0'
            var next = player.choosePlayerCard(trigger.target, 'he', [1, trigger.target.countCards('he')], get.prompt('zshy_pojun', trigger.target));
            next.set('ai', function (button) {
                if (!_status.event.goon) return 0;
                var val = get.value(button.link);
                if (button.link == _status.event.target.getEquip(2)) return 2 * (val + 3);
                return val;
            });
            next.set('goon', get.attitude(player, trigger.target) <= 0 || !get.name(trigger.card) == 'chuqibuyi' || !get.name(trigger.card) == 'huogong');
            next.set('forceAuto', true);
            next.setHiddenSkill('zshy_pojun');
            'step 1'
            if (result.bool) {
                var target = trigger.target;
                player.logSkill('zshy_pojun', target);
                target.addSkill('zshy_pojun_card');
                target.addToExpansion('giveAuto', result.cards, target).gaintag.add('zshy_pojun_card');
                player.chooseDrawRecover(result.cards.length, true);
            }
        },
        ai: {
            unequip_ai: true,
            directHit_ai: true,
            skillTagFilter(player, tag, arg) {
                if (get.attitude(player, arg.target) > 0) return false;
                if (tag == 'directHit_ai') return arg.target.hp >= Math.max(1, arg.target.countCards('h') - 1);
                if (arg && get.tag(arg, 'damage') == true && arg.target.getEquip(2)) return true;
                return false;
            },
        },
        group: ['zshy_pojun_damage'],
        subSkill: {
            damage: {
                audio: 'zshy_pojun',
                trigger: { source: 'damageBegin1' },
                sourceSkill: 'zshy_pojun',
                forced: true,
                logTarget: 'player',
                preHidden: true,
                content() {
                    let num = 1;
                    if (player.countCards('e') - trigger.player.countCards('e') > 0) {
                        num += (player.countCards('e') - trigger.player.countCards('e'));
                    }
                    trigger.num += num;
                },
                ai: {
                    reverseEquip: true,
                },
            },
            card: {
                trigger: { player: 'phaseBegin' },
                forced: true,
                popup: false,
                charlotte: true,
                sourceSkill: 'zshy_pojun',
                filter(event, player) {
                    return player.getExpansions('zshy_pojun_card').length > 0;
                },
                content() {
                    'step 0';
                    var cards = player.getExpansions('zshy_pojun_card'), num = Math.floor(player.getExpansions('zshy_pojun_card').length / 2);
                    player.gain(cards, num, 'draw');
                    game.log(player, '收回了' + num + '张「破军」牌');
                    player.loseToDiscardpile();
                    'step 1';
                    player.removeSkill('zshy_pojun_card');
                },
                intro: {
                    markcount: 'expansion',
                    mark(dialog, storage, player) {
                        var cards = player.getExpansions('zshy_pojun_card');
                        if (player.isUnderControl(true)) dialog.addAuto(cards);
                        else return '共有' + get.cnNumber(cards.length) + '张牌';
                    },
                },
            },
        },
    },

    //墟于禁
    zshy_zhenjun: {//镇军
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: ['phaseUseBegin'],
            source: 'damageEnd',
            player: 'damageEnd',
        },
        filter(event, player, name) {
            if (name == 'damageEnd' && event.source != player) {
                return event.player == player;
            }
            return event.player.isIn() && event.player.countCards('he') > 0 && event.player != player;
        },
        check(event, player, name) {
            if (name == 'damageEnd' && event.source != player) {
                return get.attitude(player, event.source) < 0;
            }
            return get.attitude(player, event.player) < 0;
        },
        logTarget(event, player, name) {
            if (name == 'damageEnd' && event.source != player) {
                return event.source;
            }
            return event.player;
        },
        prompt2(event, player, name) {
            let target = event.player;
            if (name == 'damageEnd' && event.source != player) {
                target = event.source;
            }
            const num = Math.max(target.countCards('h') - target.hp, 1);
            return '弃置' + get.translation(target) + num + '张牌';
        },
        async content(event, trigger, player) {
            let target = trigger.player;
            if (event.triggername == 'damageEnd' && trigger.source != player) {
                target = trigger.source;
            }
            const num = Math.max(target.countCards('h') - target.hp, 1);
            let numd;
            const result = await player.discardPlayerCard(num, target, true).forResult();
            if (result.bool && result?.cards?.length) {
                numd = result.cards.length;
                let j = 0;
                for (const i of result.cards) {
                    if (get.type(i) == 'basic') {
                        j++;
                    }
                }
                player.recover(j);
                player.draw(numd - j);
            }
        },
        ai: {
            threaten: 0.8,
        },
    },
    zshy_yizhong: {//毅重
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'useCard',
            target: 'useCardToBefore',
        },
        forced: true,
        filter(event, player) {
            return get.tag(event.card, 'damage') > 0.5 && get.color(event.card) == 'black';
        },
        logTarget(event, player) {
            if (event.player == player) {
                return event.targets.sortBySeat(_status.currentPhase);
            }
            return null;
        },
        async content(event, trigger, player) {
            if (trigger.player == player) {
                trigger.directHit.addArray(game.filterPlayer(function (target) {
                    return target != player;
                }));
                game.log(game.filterPlayer(function (target) {
                    return target != player;
                }), '不可响应', trigger.card);
            } else {
                trigger.cancel();
            };
        },
        mod: {
            targetInRange(card, player, target, now) {
                if (get.tag(card, 'damage') > 0.5 && get.color(card) == 'black') return true;
            },
            cardUsable(card) {
                if (get.tag(card, 'damage') > 0.5 && get.color(card) == 'black') return Infinity;
            },
        },
        ai: {
            directHit_ai: true,
            skillTagFilter(player, tag, arg) {
                return get.tag(arg?.card, 'damage') > 0.5 && get.color(arg?.card, player) == 'black';
            },
            effect: {
                target(card, player, target) {
                    if (get.tag(card, 'damage') > 0.5 && get.color(card) != 'black') {
                        return;
                    }
                    return 'zeroplayertarget';
                },
            },
        },
    },

    //墟张春华
    zshy_jueqing: {//绝情
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { source: 'damageBefore' },
        forced: true,
        content() {
            trigger.cancel();
            trigger.player.loseHp(trigger.num);
        },
        ai: {
            jueqing: true,
        },
        group: ['zshy_jueqing_gain', 'zshy_jueqing_damage'],
        subSkill: {
            gain: {
                audio: 'zshy_jueqing',
                trigger: { source: 'damageBefore' },
                firstDo: true,
                forced: true,
                direct: true,
                content() {
                    var num = Math.max(1, player.getDamagedHp())
                    player.changeHujia(num);
                },
            },
            damage: {
                audio: 'zshy_jueqing',
                trigger: { player: 'damageBefore' },
                prompt2: '是否令此次伤害视为失去体力？',
                check(event, player, card) {
                    return player.countCards('he', ('tao' || 'jiu')) > event.num || player.hp > event.num;
                },
                locked: true,
                content() {
                    trigger.cancel();
                    player.loseHp(trigger.num);
                },
            },
        },
    },
    zshy_shangshi: {//伤逝
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: ['loseAfter', 'changeHp', 'gainMaxHpAfter', 'loseMaxHpAfter'],
            global: ['equipAfter', 'addJudgeAfter', 'gainAfter', 'loseAsyncAfter', 'addToExpansionAfter'],
        },
        frequent: true,
        filter(event, player) {
            if (event.getl && !event.getl(player)) return false;
            return player.countCards('h') < player.getDamagedHp() || player.countCards('h') < player.hp;
        },
        content() {
            var num = Math.max(player.getDamagedHp() - player.countCards('h'), player.hp - player.countCards('h'));
            player.draw(num);
        },
        ai: {
            noh: true,
            skillTagFilter(player, tag) {
                if (tag == 'noh' && player.maxHp - player.hp < player.countCards('h')) {
                    return false;
                }
            },
        },
        group: ['zshy_shangshi_dis'],
        subSkill: {
            dis: {
                audio: 'zshy_shangshi',
                trigger: {
                    player: ['loseHpAfter', 'damageAfter'],
                },
                firstDo: true,
                direct: true,
                async content(event, trigger, player) {
                    await player.chooseToDiscard('h', [1, Infinity]);
                    await player.logSkill('zshy_shangshi', player);
                },
            },
        }
    },
    zshy_jianmie: {//翦灭
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        filterTarget: lib.filter.notMe,
        async content(event, trigger, player) {
            const target = event.target,
                targets = [player, target];
            let map = {},
                locals = targets.slice();
            let humans = targets.filter(current => current === game.me || current.isOnline());
            locals.removeArray(humans);
            const eventId = get.id();
            const send = (current, eventId) => {
                lib.skill.zshy_jianmie.chooseControl(current, targets, eventId);
                game.resume();
            };
            event._global_waiting = true;
            let time = 10000;
            if (lib.configOL && lib.configOL.choose_timeout) time = parseInt(lib.configOL.choose_timeout) * 1000;
            targets.forEach(current => current.showTimer(time));
            if (humans.length > 0) {
                const solve = function (resolve, reject) {
                    return function (result, player) {
                        if (result && result.control) {
                            map[player.playerid] = result.control == 'none2' ? 'none' : result.control;
                            resolve();
                        } else reject();
                    };
                };
                await Promise.any(
                    humans.map(current => {
                        return new Promise(async (resolve, reject) => {
                            if (current.isOnline()) {
                                current.send(send, current, eventId);
                                current.wait(solve(resolve, reject));
                            } else {
                                const next = lib.skill.zshy_jianmie.chooseControl(current, targets, eventId);
                                const solver = solve(resolve, reject);
                                if (_status.connectMode) game.me.wait(solver);
                                const result = await next.forResult();
                                if (_status.connectMode) game.me.unwait(result, current);
                                else solver(result, current);
                            }
                        });
                    })
                ).catch(() => { });
                game.broadcastAll('cancel', eventId);
            }
            if (locals.length > 0) {
                for (const current of locals) {
                    const result = await lib.skill.zshy_jianmie.chooseControl(current, targets).forResult();
                    if (result && result.control) map[current.playerid] = result.control == 'none2' ? 'none' : result.control;
                }
            }
            delete event._global_waiting;
            for (const i of targets) i.hideTimer();
            const cards_player = player.getDiscardableCards(player, 'h').filter(card => get.color(card) == map[player.playerid]);
            const cards_target = target.getDiscardableCards(target, 'h').filter(card => get.color(card) == map[target.playerid]);
            if (cards_player.length && cards_target.length) {
                await game.loseAsync({
                    lose_list: [
                        [player, cards_player],
                        [target, cards_target],
                    ],
                }).setContent('discardMultiple');
            } else if (cards_player.length) await player.discard(cards_player);
            else if (cards_target.length) await target.discard(cards_target);
            if (cards_player.length != cards_target.length) {
                const user = cards_player.length > cards_target.length ? player : target;
                const aim = user == player ? target : player;
                const juedou = new lib.element.VCard({ name: 'juedou' });
                if (user.canUse(juedou, aim, false)) await user.useCard(juedou, aim, false);
            };
            if (cards_player.length == 0 || cards_target.length == 0) {
                await player.tempBanSkill('zshy_jianmie');
            }
            await player.gainMaxHp();
        },
        ai: {
            order: 1,
            result: {
                player(player, target) {
                    let num = (player.hasSkill('shangshi') ? Math.max(0, player.getDamagedHp() - player.countCards('h') / 2) : 0) - player.countDiscardableCards(player, 'h') / 2;
                    //结算最后固定+1体力上限，按约一张牌的价值计入
                    return get.effect(player, { name: 'juedou' }, target, player) + get.effect(player, { name: 'draw' }, player, player) * num + 1.5;
                },
                target(player, target) {
                    return get.effect(target, { name: 'juedou' }, player, target) - (get.effect(target, { name: 'draw' }, target, target) * target.countDiscardableCards(target, 'h')) / 2;
                },
            },
        },
        chooseControl(player, targets, eventId) {
            let colors = ['red', 'black'];
            if (player.getDiscardableCards(player, 'h').some(card => get.color(card) == 'none')) {
                colors.push('none2');
            }
            const str = get.translation(targets[0] == player ? targets[1] : targets[0]);
            return player.chooseControl(colors).set('prompt', '翦灭：请选择一个颜色').set('prompt2', '弃置选择颜色的牌，然后若你/' + str + '弃置的牌更多，则你/' + str + '视为对' + str + '/你使用【决斗】').set('ai', () => {
                const player = get.event().player;
                let controls = get.event().controls.slice();
                return controls.sort((a, b) => {
                    return (
                        player.getDiscardableCards(player, 'h').filter(card => {
                            return get.color(card) == (a == 'none2' ? 'none' : a);
                        }).reduce((sum, card) => sum + get.value(card, player), 0) -
                        player.getDiscardableCards(player, 'h').filter(card => {
                            return get.color(card) == (b == 'none2' ? 'none' : b);
                        }).reduce((sum, card) => sum + get.value(card, player), 0)
                    );
                })[0];
            }).set('id', eventId).set('_global_waiting', true);
        },
    },

    //墟法正
    zshy_xuanhuo: {//眩惑
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: 'phaseDrawEnd' },
        direct: true,
        filter(event, player) {
            return player.countCards('he') > 0 && game.countPlayer() > 2;
        },
        async content(event, trigger, player) {
            //① 是否发动：选择一名其他角色，令其选择一项
            const targetResult = await player
                .chooseTarget('眩惑：是否选择一名其他角色，令其选择一项？', function (card, player2, target) {
                    return target != player2;
                })
                .set('prompt2', '选项一：视为对你指定的另一名角色使用任意一张【杀】或【决斗】；选项二：交给你至少两张手牌。')
                .set('ai', function (target) {
                    return get.attitude(get.player(), target) > 0;
                })
                .forResult();
            if (!targetResult.bool || !targetResult.targets?.length) return;
            const target = targetResult.targets[0];
            player.logSkill('zshy_xuanhuo', target);
            //② 指定其使用【杀】或【决斗】的目标
            if (!game.hasPlayer(current => current != player && current != target)) return;
            const target2Result = await player
                .chooseTarget('眩惑：请选择' + get.translation(target) + '使用【杀】或【决斗】的目标', function (card, player2, target2) {
                    return target2 != player2 && target2 != target;
                }, true)
                .set('prompt2', '若' + get.translation(target) + '选择选项一，其视为对你指定的角色使用【杀】或【决斗】。')
                .set('ai', function (target2) {
                    var list = [null, 'juedou'].concat(lib.inpile_nature);
                    if (target.hasSkill('ayato_zenshen')) list.push('kami');
                    return Math.max.apply(Math, list.map(function (i) {
                        var card = { name: 'sha', isCard: true };
                        if (i == 'juedou') card.name = 'juedou';
                        else if (i) card.nature = i;
                        if (!target.canUse(card, target2, false)) return 0;
                        return get.effect(target2, card, target, player);
                    }));
                })
                .forResult();
            if (!target2Result.bool || !target2Result.targets?.length) return;
            const target2 = target2Result.targets[0];
            player.line(target2);
            game.log(player, '选择了', target2);
            //③ 计算可用牌与选项二是否可选
            var list = lib.inpile_nature.slice(0);
            list.unshift(null);
            var vcards = [];
            if (target.hasSkill('ayato_zenshen')) list.add('kami');
            for (var i of list) {
                if (target.canUse({ name: 'sha', isCard: true, nature: i }, target2, false)) vcards.push(['基本', '', 'sha', i]);
            }
            if (target.canUse({ name: 'juedou', isCard: true }, target2, false)) vcards.push(['基本', '', 'juedou']);
            var canGive = target.countCards('h') >= 2;
            if (!vcards.length && !canGive) return;
            let choice = 0;
            if (!vcards.length) {
                choice = 1;
            } else if (!canGive) {
                choice = 0;
            } else {
                const result = await target
                    .chooseControl()
                    .set('choiceList', ['视为对' + get.translation(target2) + '使用任意一种【杀】或【决斗】', '交给' + get.translation(player) + '至少两张手牌'])
                    .set('prompt', '眩惑：请选择一项')
                    .set('prompt2', get.translation(player) + '令你选择：1.视为对' + get.translation(target2) + '使用任意一张【杀】或【决斗】；2.交给他至少两张手牌。')
                    .set('ai', function () {
                        var self = get.player();
                        var best = 0;
                        for (var v of vcards) {
                            var eff = get.effect(target2, { name: v[2], isCard: true, nature: v[3] }, self, self);
                            if (eff > best) best = eff;
                        }
                        //使用牌对己方有利且手牌宽裕选选项一，否则交牌止损
                        return best > 0 && self.countCards('h') > 2 ? 0 : 1;
                    })
                    .forResult();
                if (typeof result?.index != 'number') return;
                choice = result.index;
            }
            //④ 结算所选项
            if (choice == 0) {
                let link = vcards[0];
                if (vcards.length > 1) {
                    const result = await target
                        .chooseButton(['眩惑：请选择要对' + get.translation(target2) + '使用的牌', [vcards, 'vcard']], true)
                        .set('ai', function (button) {
                            return get.effect(target2, { name: button.link[2], isCard: true, nature: button.link[3] }, get.player(), get.player());
                        })
                        .forResult();
                    if (!result.bool || !result.links?.length) return;
                    link = result.links[0];
                }
                await target.useCard({ name: link[2], isCard: true, nature: link[3] }, false, target2);
            } else {
                await target.chooseToGive(player, [2, Infinity], 'h', '眩惑：' + get.translation(player) + '令你交给其至少两张手牌', true);
            }
        },
        ai: {
            expose: 0.17,
            fireAttack: true,
            skillTagFilter(player) {
                return player.hasFriend();
            },
        },
    },
    zshy_enyuan: {//恩怨
        audio: 'ext:诸神寰宇/audio/character:2',
        group: ['zshy_enyuan_gain', 'zshy_enyuan_damage'],
        subSkill: {
            gain: {
                audio: 'zshy_enyuan',
                trigger: { player: 'gainEnd' },
                sourceSkill: 'zshy_enyuan',
                filter(event, player) {
                    return event.source && event.source.isIn() && event.source != player && event.cards.length > 0;
                },
                logTarget: 'source',
                check(event, player) {
                    return get.attitude(player, event.source) > 0;
                },
                prompt2(event, player) {
                    return '是否令' + get.translation(event.source) + '选择一项：回复1点体力或摸一张牌？';
                },
                async content(event, trigger, player) {
                    await trigger.source.chooseDrawRecover({
                        forced: true,
                        prompt: '恩怨：' + get.translation(player) + '令你选择一项：回复1点体力或摸一张牌',
                    });
                },
            },
            damage: {
                audio: 'zshy_enyuan',
                trigger: { player: 'damageAfter' },
                sourceSkill: 'zshy_enyuan',
                check(event, player) {
                    var att = get.attitude(player, event.source);
                    var num = event.source.countCards('he');
                    if (att <= 0) return true;
                    if (num > 1) return true;
                    if (num) return att < 4;
                    return false;
                },
                filter(event, player) {
                    return event.source && event.source != player && event.num > 0 && event.source.isIn();
                },
                logTarget: 'source',
                prompt2(event, player) {
                    return '是否令' + get.translation(event.source) + '交给你至少一张牌（若其中有红桃牌你回复1点体力），然后你可令其失去1点体力？';
                },
                async content(event, trigger, player) {
                    const source = trigger.source;
                    let num = trigger.num;
                    let first = true;
                    while (num > 0 && source && source.isIn() && player.hasSkill('zshy_enyuan')) {
                        if (!first) player.logSkill('zshy_enyuan', source);
                        first = false;
                        //① 令伤害来源交给你至少一张牌
                        if (source.countCards('he') > 0) {
                            const result = await source
                                .chooseToGive([1, Infinity], '恩怨：' + get.translation(player) + '令你交给其至少一张牌', function () {
                                    return true;
                                }, 'he', player, true)
                                .set('ai', function (card) {
                                    //只交一张：敌人给价值最低的牌；自己人优先给红桃（令法正回血）
                                    const giver = get.player();
                                    const owner = get.event().getParent().player;
                                    const cards = giver.getCards('he').slice();
                                    let pool = cards;
                                    if (get.attitude(giver, owner) >= 0) {
                                        const hearts = cards.filter(current => get.suit(current) == 'heart');
                                        if (hearts.length) pool = hearts;
                                    }
                                    pool.sort((a, b) => get.value(a, giver) - get.value(b, giver));
                                    if (card === pool[0]) return 1;
                                    return -1;
                                })
                                .forResult();
                            if (result.bool && result.cards?.length && source.isIn()) {
                                await source.give(result.cards[0], player);
                                //若交来的牌中有红桃牌，则回复1点体力
                                if (result.cards.some(card => get.suit(card) == 'heart')) await player.recover();
                            }
                        }
                        //② 是否令其失去1点体力
                        const bool = await player
                            .chooseBool('恩怨：是否令' + get.translation(source) + '失去1点体力？')
                            .set('prompt2', '你已令其交给你至少一张牌（若其中有红桃牌，你回复1点体力）。')
                            .set('ai', function () {
                                var player2 = get.player();
                                return (get.effect(source, { name: 'losehp' }, player2, source) < 0 && get.attitude(player2, source) < 0) || (get.effect(source, { name: 'losehp' }, player2, source) >= 0 && get.attitude(player2, source) >= 0);
                            })
                            .forResult();
                        if (bool.bool) await source.loseHp();
                        num--;
                    }
                },
                ai: {
                    maixie_defend: true,
                    effect: {
                        target(card, player, target) {
                            if (player.hasSkillTag('jueqing', false, target)) return [1, -1.5];
                            if (!target.hasFriend()) return;
                            if (get.tag(card, 'damage')) return [1, 0, 0, -0.7];
                        },
                    },
                },
            },
        },
    },

    zshy_wuyan: {//无言
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { source: 'damageBegin2', player: 'damageBegin4' },
        forced: true,
        check(event, player) {
            if (player == event.player) return true;
            return false;
        },
        filter(event, player) {
            return get.type(event.card, 'trick') == 'trick';
        },
        content() {
            trigger.cancel();
            player.chooseDrawRecover(2, true);
        },
        ai: {
            notrick: true,
            notricksource: true,
            effect: {
                target(card, player, target, current) {
                    if (get.type(card) == 'trick' && get.tag(card, 'damage')) {
                        return 'zeroplayertarget';
                    }
                },
                player(card, player, target, current) {
                    if (get.type(card) == 'trick' && get.tag(card, 'damage')) {
                        return 'zeroplayertarget';
                    }
                },
            },
        },
    },
    zshy_jujian: {//举荐
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: ['phaseBefore', 'phaseAfter'],
        },
        check(event, player, target) {
            return get.attitude(player, event.player) > 0;
        },
        prompt2(event, player) {
            return '你是否令【' + get.translation(event.player) + '】选择摸两张牌、回复1点体力或复原武将牌？'
        },
        filter(event, player) {
            return event.player != player;
        },
        content() {
            'step 0';
            if (trigger.player.hp == trigger.player.maxHp && !trigger.player.isTurnedOver() && !trigger.player.isLinked()) {
                trigger.player.draw(2);
                event.finish();
            } else {
                var controls = ['draw_card'];
                if (trigger.player.hp < trigger.player.maxHp) {
                    controls.push('recover_hp');
                }
                if (trigger.player.isLinked() | trigger.player.isTurnedOver()) {
                    controls.push('reset_character');
                }
                trigger.player.chooseControl(controls).ai = function () {
                    if (trigger.player.isTurnedOver()) {
                        return 'reset_character';
                    } else if (trigger.player.hp == 1 && trigger.player.maxHp > 2) {
                        return 'recover_hp';
                    } else if (trigger.player.hp == 2 && trigger.player.maxHp > 2 && trigger.player.countCards('h') > 1) {
                        return 'recover_hp';
                    } else {
                        return 'draw_card';
                    }
                };
            }
            'step 1';
            event.control = result.control;
            switch (event.control) {
                case 'recover_hp':
                    trigger.player.recover();
                    event.finish();
                    break;
                case 'draw_card':
                    trigger.player.draw(2);
                    event.finish();
                    break;
                case 'reset_character':
                    if (trigger.player.isTurnedOver()) trigger.player.turnOver();
                    break;
            }
            'step 3';
            if (event.control == 'reset_character' && trigger.player.isLinked()) {
                trigger.player.link();
            }
        },
        ai: {
            expose: 0.2,
            threaten: 1.4,
        },
        group: ['zshy_jujian_discard'],
        subSkill: {
            discard: {
                audio: 'zshy_jujian',
                forceaudio: true,
                unique: true,
                trigger: {
                    player: 'phaseDiscardBegin',
                },
                filter(event, player) {
                    return (
                        player.needsToDiscard() > 0 &&
                        game.countPlayer(function (current) {
                            return current != player;
                        }) > 0
                    );
                },
                async cost(event, trigger, player) {
                    const num = Math.min(player.needsToDiscard(),
                        game.countPlayer(function (target) {
                            return target != player;
                        }));
                    if (!num) return;
                    event.result = await player.chooseCardTarget({
                        prompt: get.prompt('zshy_jujian'),
                        prompt2: '你可以将' + (num > 1 ? '至多' : '') + get.cnNumber(num) + '张手牌交给等量的其他角色。先按顺序选中所有要给出的手牌，然后再按顺序选择等量的目标角色',
                        selectCard: [1, num],
                        selectTarget() {
                            return ui.selected.cards.length;
                        },
                        filterTarget(card, player, target) {
                            return target != player;
                        },
                        complexSelect: true,
                        filterOk() {
                            return ui.selected.cards.length == ui.selected.targets.length;
                        },
                        ai1(card) {
                            const player = _status.event.player;
                            const value = get.value(card, player, 'raw');
                            if (
                                game.hasPlayer(function (target) {
                                    return target != player && !ui.selected.targets.includes(target) && get.sgn(value) == get.sgn(get.attitude(player, target));
                                })
                            )
                                return 1 / Math.max(1, get.useful(card));
                            return -1;
                        },
                        ai2(target) {
                            const player = _status.event.player;
                            const card = ui.selected.cards[ui.selected.targets.length];
                            if (card && get.value(card, player, 'raw') < 0) return -get.attitude(player, target);
                            return get.attitude(player, target);
                        },
                    }).forResult();
                    if (event.result.bool) event.result.bool = event.result.cards.length > 0;
                },
                async content(event, trigger, player) {
                    const list = [];
                    for (let i = 0; i < event.targets.length; i++) {
                        const target = event.targets[i];
                        const card = event.cards[i];
                        list.push([target, card]);
                    }
                    await game.loseAsync({
                        gain_list: list,
                        player: player,
                        cards: event.cards,
                        giver: player,
                        animate: 'giveAuto',
                    }).setContent('gaincardMultiple');
                },
            },
        },
    },

};
const 一将成名2012 = {
    zshy_jiangchi: {//将驰
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: 'phaseDrawEnd' },
        direct: true,
        content() {
            'step 0'
            var str = '令' + get.translation(trigger.player) + '本回合使用【杀】的次数上限-' + (trigger.player.getDamagedHp() + 1) + '，且【杀】不计入手牌上限。',
                str1 = '令' + get.translation(trigger.player) + '摸一张并重铸一张牌，本回合使用【杀】无距离限制，且使用【杀】的次数上限+' + (trigger.player.getDamagedHp() + 1);
            var choiceList = [str, str1], list = ['选项一', '选项二'];
            player.chooseControl(list, 'cancel').set('ai', function () {
                var player = _status.event.player;
                if (trigger.player == player) {
                    if (!player.countCards('hs', function (card) {
                        return get.name(card) == 'sha' && player.hasValueTarget(card, false);
                    })) return '选项二';
                    return '选项一';
                };
                if (get.attitude(player, trigger.player) > 0) return '选项二';
                if (get.attitude(player, trigger.player) < 0) return '选项一';
            }).set('choiceList', choiceList).set('prompt', get.prompt('zshy_jiangchi'));
            'step 1'
            if (result.control == '选项一') {
                player.logSkill('zshy_jiangchi');
                trigger.player.addTempSkill('zshy_jiangchi_less');
                var num = Math.max(1, trigger.player.getDamagedHp());
                trigger.player.addMark('zshy_jiangchi_less', num, false);
                trigger.player.addTempSkill('zshy_jiangchi_less1');
                event.finish();
            }
            else if (result.control == '选项二') {
                trigger.player.draw();
                player.logSkill('zshy_jiangchi');
                trigger.player.chooseCard('he', '将驰：请重铸一张牌', true, (card, player) => player.canRecast(card));
            } else event.finish();
            'step 2'
            if (result.bool) {
                trigger.player.recast(result.cards);
                trigger.player.addTempSkill('zshy_jiangchi_more');
                trigger.player.addMark('zshy_jiangchi_more', 1, false);
            }
        },
        ai: {
            expose: 0.8,
        },
        subSkill: {
            less: {
                charlotte: true,
                onremove: true,
                mod: {
                    cardUsable(card, player, num) {
                        if (card.name == 'sha') return num - player.countMark('zshy_jiangchi_less');
                    },
                },
            },
            less1: {
                charlotte: true,
                onremove: true,
                mod: {
                    ignoredHandcard(card, player) {
                        if (card.name == 'sha') return true;
                    },
                    cardDiscardable(card, player, name) {
                        if (name == 'phaseDiscard' && card.name == 'sha') return false;
                    },
                },
            },
            more: {
                charlotte: true,
                onremove: true,
                mod: {
                    cardUsable(card, player, num) {
                        if (card.name == 'sha') return num + player.countMark('zshy_jiangchi_more');
                    },
                    targetInRange(card, player) {
                        if (card.name == 'sha') return true;
                    },
                },
            },
        },
    },

    //荀攸
    zshy_qice: {//奇策
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AAZZxunyouYCXS: 'zshy_qice_zshy_AAZZxunyouYCXS',
        },
        enable: 'phaseUse',
        locked: true,
        filter(event, player) {
            const hs = player.getCards('h');
            if (!hs.length) return false;
            if (hs.some(card => {
                const mod2 = game.checkMod(card, player, 'unchanged', 'cardEnabled2', player);
                return mod2 === false;
            })) return false;
            return lib.inpile.some(name => {
                if (get.type(name) != 'trick') return false;
                const card = get.autoViewAs({ name }, hs);
                return event.filterCard(card, player, event);
            });
        },
        prompt: '出牌阶段，你可将所有手牌当作任意一张普通锦囊牌使用',
        chooseButton: {
            dialog(event, player) {
                var list = [];
                for (var i = 0; i < lib.inpile.length; i++) {
                    if (get.type(lib.inpile[i]) == 'trick') list.push(['锦囊', '', lib.inpile[i]]);
                }
                return ui.create.dialog(get.translation('zshy_qice'), [list, 'vcard']);
            },
            filter(button, player) {
                const event = _status.event.getParent(),
                    card = get.autoViewAs(
                        {
                            name: button.link[2],
                        },
                        player.getCards('h')
                    );
                return event.filterCard(card, player, event);
            },
            check(button) {
                var player = _status.event.player;
                var effect = player.getUseValue(button.link[2]);
                if (player.countCards('hs', button.link[2]) > 0) return 0;
                if ((player.getStat('skill').zshy_qice || 0) < player.countMark('zshy_qice_mark') + 1) {
                    if (['draw', 'gain'].some(i => get.tag(button.link[2], i) >= 1)) return effect * 5;
                }
                if (effect > 0) return effect;
                return 0;
            },
            backup(links, player) {
                return {
                    filterCard: true,
                    selectCard: -1,
                    position: 'h',
                    audio: 'zshy_qice',
                    popname: true,
                    viewAs: { name: links[0][2] },
                    async precontent(event, trigger, player) {
                        // 读取本次使用的虚拟牌，避免旧式 step 编译丢失 links 闭包。
                        if (!get.tag(event.result.card, 'damage')) {
                            player.tempBanSkill('zshy_qice');
                        }
                    },
                };
            },
            prompt(links, player) {
                return '将所有手牌当【' + get.translation(links[0][2]) + '】使用';
            },
        },
        ai: {
            order: 1,
            result: {
                player(player) {
                    var num = 0;
                    var cards = player.getCards('h');
                    if (cards.length >= 3 && player.hp >= 3 && player.countMark('zshy_qice_mark') < 2) return 0;
                    for (var i = 0; i < cards.length; i++) {
                        num += Math.max(0, get.value(cards[i], player, 'raw'));
                    }
                    num /= cards.length;
                    num /= (player.countMark('zshy_qice_mark') + 1) * 1.3;
                    num *= Math.min(cards.length, player.hp);
                    return 13 - num;
                },
            },
            nokeep: true,
            skillTagFilter(player, tag, arg) {
                if (tag === 'nokeep') return (!arg || (arg.card && get.name(arg.card) === 'tao')) && player.isPhaseUsing() && !player.getStat('skill').zshy_qice && player.hasCard(card => get.name(card) != 'tao', 'h');
            },
            threaten: 1.7,
        },
        subSkill: {
            zshy_AAZZxunyouYCXS: { audio: 'ext:诸神寰宇/audio/character:2' },
            backup: {},
        },
    },
    zshy_zhiyu: {//智愚
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'damageAfter' },
        content() {
            'step 0';
            player.draw();
            'step 1';
            if (!player.countCards('h')) event.finish();
            else player.showHandcards();
            'step 2';
            if (!trigger.source || !trigger.source.isIn()) event._result = { bool: false, cards: [] }
            else trigger.source.chooseToDiscard('he', '智愚：请弃置一张手牌', true);
            'step 3';
            var cards = player.getCards('h');
            var color = get.color(cards[0], player);
            var bool = true;
            for (var i = 1; i < cards.length; i++) {
                if (get.color(cards[i], player) != color) {
                    bool = false;
                    break;
                }
            }
            if (bool) {
                player.recover(trigger.num);
            }
        },
        ai: {
            maixie_defend: true,
            threaten: 1.85,
        },
    },

    zshy_dangxian: {//当先
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AAZZguansuoJMGX: 'zshy_dangxian_zshy_AAZZguansuoJMGX',
        },
        trigger: { global: 'phaseZhunbeiBegin' },
        forced: true,
        locked: true,
        async content(event, trigger, player) {
            player.chooseDrawRecover(2, true);
            const next = player.phaseUse();
            event.next.remove(next);
            trigger.next.push(next);
        },
        ai: {
            combo: 'zshy_fuli',
            halfneg: true
        },
        subSkill: {
            zshy_AAZZguansuoJMGX: { audio: 'ext:诸神寰宇/audio/character:2' },
        },
    },
    zshy_fuli: {//伏枥
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'chooseToUse',
        round: 1,
        skillAnimation: true,
        animationColor: 'soil',
        filter(event, player) {
            if (event.type != 'dying') return false;
            if (player != event.dying) return false;
            return true;
        },
        async content(event, trigger, player) {
            player.awakenSkill('zshy_fuli');
            await player.recover(player.maxHp - player.hp);
            await player.draw(6);
            player.insertPhase();
        },
        ai: {
            save: true,
            skillTagFilter(player, arg, target) {
                return player == target;
            },
            result: {
                player: 10,
            },
            threaten: 0.9,
        },
    },

    zshy_qianxi: {//潜袭
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'phaseZhunbeiBegin' },
        prompt2: '出牌阶段，你可摸一张牌，然后弃置一张牌并选择任意名其他角色，目标角色获得以下效果直到其回合开始时：1.不能使用或打出与此牌颜色相同的牌；2.装备区与此牌颜色相同的防具牌无效；3.回复体力/受到伤害/失去体力上限/增加体力上限时，你摸一张牌。',
        content() {
            'step 0'
            player.draw();
            'step 1'
            if (player.hasCard(card => {
                return lib.filter.cardDiscardable(card, player, 'zshy_qianxi');
            }, 'he')) player.chooseToDiscard('he', true).set('ai', card => {
                let player = get.event().player;
                if (get.color(card, player)) return 7 - get.value(card, player);
                return 4 - get.value(card, player);
            });
            else event.finish();
            'step 2';
            if (result.bool && game.hasPlayer(current => current != player)) {
                var color = get.color(result.cards[0], player);
                event.color = color;
                color = get.translation(color);
                player.chooseTarget([1, Infinity], true, '选择【潜袭】的目标', '令其获得以下效果直到其回合开始：1.不能使用或打出' + color + '牌，2.' + color + '防具失效，3.回复体力/受到伤害/失去体力上限/增加体力上限时，你摸一张牌',
                    function (card, player, target) {
                        return target != player;
                    }).set('ai', function (target) {
                        return -get.attitude(_status.event.player, target) * Math.sqrt(1 + target.countCards('he'));
                    });
            } else event.finish();
            'step 3';
            if (result.bool && result.targets) {
                for (const i of result.targets) {
                    player.line(i, 'green');
                    i.storage.zshy_qianxi_effect = [event.color, player];
                    i.addTempSkill('zshy_qianxi_effect', { player: 'phaseBegin' });
                    i.markSkill('zshy_qianxi_effect');
                }
            }
        },
        ai: {
            directHit_ai: true,
            skillTagFilter(player, tag, arg) {
                if (tag !== 'directHit_ai' || !arg.target.hasSkill('zshy_qianxi_effect')) return false;
                if (arg.card.name == 'sha')
                    return (
                        arg.target.storage.zshy_qianxi_effect == 'red' &&
                        (!arg.target.hasSkillTag(
                            'freeShan',
                            false,
                            {
                                player: player,
                                card: arg.card,
                            },
                            true
                        ) ||
                            player.hasSkillTag('unequip', false, {
                                name: arg.card ? arg.card.name : null,
                                target: arg.target,
                                card: arg.card,
                            }) ||
                            player.hasSkillTag('unequip_ai', false, {
                                name: arg.card ? arg.card.name : null,
                                target: arg.target,
                                card: arg.card,
                            }))
                    );
                return arg.target.storage.zshy_qianxi_effect == 'black';
            },
        },
        group: ['zshy_qianxi_damage'],
        subSkill: {
            effect: {
                mark: true,
                intro: {
                    markcount: () => 0,
                    content(storage, player) {
                        var color = get.translation(storage[0]),
                            source = get.translation(storage[1]);
                        return '本回合不能使用或打出' + color + '牌，且' + color + '防具失效，且回复体力/受到伤害/失去体力上限/增加体力上限时，' + source + '摸一张牌';
                    },
                },
                charlotte: true,
                onremove: true,
                mod: {
                    cardEnabled2(card, player) {
                        if (get.itemtype(card) == 'card' && get.color(card) == player.getStorage('zshy_qianxi_effect')[0]) return false;
                    },
                },
                trigger: { player: ['recoverAfter', 'damageAfter', 'loseMaxHpAfter', 'gainMaxHpAfter'], },
                forced: true,
                popup: false,
                filter(event, player) {
                    return player.storage.zshy_qianxi_effect && player.storage.zshy_qianxi_effect[1].isIn();
                },
                content() {
                    var target = player.storage.zshy_qianxi_effect[1];
                    target.logSkill('zshy_qianxi', player);
                    target.draw();
                },
                ai: {
                    unequip2: true,
                    skillTagFilter(player) {
                        var evt = _status.event,
                            color = player.getStorage('zshy_qianxi_effect')[0];
                        if (evt.name == 'lose' && evt.loseEquip) {
                            var card = evt.cards[evt.num];
                            if (card && get.subtype(card, false) == 'equip2' && get.color(card) == color) return true;
                            return false;
                        } else {
                            var equip = player.getEquip(2);
                            if (equip && get.color(equip) == color) return true;
                            return false;
                        }
                    },
                },
            },
            damage: {
                trigger: {
                    source: 'damageBefore',
                },
                prompt2(event, player, target) {
                    return '此次伤害视为减少体力上限'
                },
                check(event, player, target) {
                    return get.attitude(player, event.player) < 0;
                },
                filter(event) {
                    return event.player.isAlive();
                },
                async content(event, trigger, player) {
                    trigger.cancel();
                    trigger.player.loseMaxHp(trigger.num);
                },
            },
        },
    },

    zshy_anxu: {//安恤
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        usable: 1,
        multitarget: true,
        filterTarget(card, player, target) {
            var num = target.countCards('h');
            if (ui.selected.targets.length) {
                return num < ui.selected.targets[0].countCards('h');
            }
            var players = game.filterPlayer();
            for (var i = 0; i < players.length; i++) {
                if (num > players[i].countCards('h')) return true;
            }
            return false;
        },
        selectTarget: 2,
        content() {
            'step 0';
            var gainner, giver, num1 = targets[0].countCards('h'), num2 = targets[1].countCards('h');
            if (targets[0].countCards('h') < targets[1].countCards('h')) {
                gainner = targets[0];
                giver = targets[1];
            } else {
                gainner = targets[1];
                giver = targets[0];
            }
            var num3 = Math.max(num1, num2), num = num3 - Math.floor((num1 + num2) / 2);
            gainner.gainPlayerCard(giver, num, true, 'h', 'visibleMove');
            event.gainner = gainner;
            event.giver = giver;
            'step 1';
            if (result.cards) {
                for (i = 0; i < result.cards.length; i++) {
                    var card = result.cards[0];
                    if (event.gainner.getCards('h').includes(card) && get.suit(card, event.gainner) != 'spade') player.draw();
                }
            }
            if (event.gainner.countCards('h') == event.giver.countCards('h')) player.recover();
        },
        ai: {
            order: 10.5,
            threaten: 2.3,
            result: {
                target(player, target) {
                    var num = target.countCards('h');
                    var att = get.attitude(player, target);
                    if (ui.selected.targets.length == 0) {
                        if (att > 0) return -1;
                        var players = game.filterPlayer();
                        for (var i = 0; i < players.length; i++) {
                            var num2 = players[i].countCards('h');
                            var att2 = get.attitude(player, players[i]);
                            if (num2 < num) {
                                if (att2 > 0) return -3;
                                return -1;
                            }
                        }
                        return 0;
                    } else {
                        return 1;
                    }
                },
                player: 1,
            },
        },
    },
    zshy_zhuiyi: {//追忆
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: ['roundStart'],
        },
        direct: true,
        forceDie: true,
        skillAnimation: true,
        animationColor: 'wood',
        content() {
            'step 0'
            var num = Math.max(1, game.roundNumber - game.countPlayer());
            var str = '你可以令一名角色摸' + num + '张牌并回复1点体力。';
            player.chooseTarget(get.prompt('zshy_zhuiyi'), function (card, player, target) {
                return _status.event.sourcex != target;
            }).set('forceDie', true).set('ai', function (target) {
                var att = get.attitude(_status.event.player, target);
                if (att > 0) {
                    if (target.hp == 1) {
                        att += 2;
                    }
                    if (target.hp < target.maxHp) {
                        att += 2;
                    }
                }
                return att;
            }).set('sourcex', trigger.source).set('prompt2', str);
            'step 1';
            if (result.bool) {
                var target = result.targets[0];
                var num = Math.max(1, game.roundNumber - game.countPlayer());
                player.logSkill('zshy_zhuiyi', target);
                player.line(target, 'green');
                target.recover();
                target.draw(num);
            }
        },
        ai: {
            expose: 0.5,
        },
        group: ['zshy_zhuiyi_round'],
        subSkill: {
            round: {
                audio: 'zshy_zhuiyi',
                trigger: {
                    player: ['die'],
                },
                direct: true,
                forceDie: true,
                skillAnimation: true,
                animationColor: 'wood',
                content() {
                    'step 0'
                    var str = '你可以令一名不为击杀者的其他角色摸' + game.countPlayer() + '张牌并回复1点体力。';
                    player.chooseTarget(get.prompt('zshy_zhuiyi'), function (card, player, target) {
                        return player != target && _status.event.sourcex != target;
                    }).set('forceDie', true).set('ai', function (target) {
                        var num = get.attitude(_status.event.player, target);
                        if (num > 0) {
                            if (target.hp == 1) {
                                num += 2;
                            }
                            if (target.hp < target.maxHp) {
                                num += 2;
                            }
                        }
                        return num;
                    }).set('sourcex', trigger.source).set('prompt2', str);
                    'step 1';
                    if (result.bool) {
                        var target = result.targets[0];
                        player.logSkill('zshy_zhuiyi', target);
                        player.line(target, 'green');
                        target.recover();
                        target.draw(game.countPlayer());
                    }
                },
            },
        },
    },

    zshy_lihuo: {//疠火
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'useCard1' },
        filter(event, player) {
            return get.name(event.card) == 'sha' && !game.hasNature(event.card, 'fire');
        },
        check(event, player) {
            let card = new lib.element.VCard(get.copy(event.card));
            game.setNature(card, 'fire');
            const eff1 = event.targets.reduce((sum, target) => {
                return sum + get.effect(target, event.card, player, player);
            }, 0);
            let targets = event.targets.slice();
            if (get.info('zshy_lihuo').filter(event, player)) {
                let targetx = game.filterPlayer(target => {
                    return !targets.includes(target) && player.canUse(card, target) && get.effect(target, card, player, player) > 0;
                });
                if (targetx.length)
                    targets.add(
                        targetx.sort((a, b) => {
                            return get.effect(b, card, player, player) - get.effect(a, card, player, player);
                        })[0]
                    );
            }
            const eff2 = targets.reduce((sum, target) => {
                return sum + get.effect(target, card, player, player);
            }, 0);
            return eff2 > eff1;
        },
        content() {
            game.log(player, '将', trigger.card, '改为了火属性');
            game.setNature(trigger.card, 'fire');
            player.when('useCardAfter').filter(evt => evt == trigger).then(() => {
                if (game.hasPlayer2(target => {
                    return target.getHistory('damage', evt => evt.card && evt.card == trigger.card).length;
                })) {
                    player.chooseToDiscard('he', '疠火：弃置一张牌，或失去1点体力').set('ai', card => {
                        const player = get.event().player;
                        if ((get.name(card) == 'tao' || get.name(card) == 'jiu') && lib.filter.cardSavable(card, player, player)) return -1;
                        if (player.hp <= 1) {
                            if (
                                cards.length < player.getEnemies().length &&
                                player.hasCard(cardx => {
                                    return (get.name(cardx) == 'tao' || get.name(cardx) == 'jiu') && lib.filter.cardSavable(cardx, player, player);
                                }, 'hs')
                            )
                                return 7 - get.value(card);
                            return -1;
                        }
                        return 24 - 5 * cards.length - 2 * Math.min(4, player.getHp()) - get.value(card);
                    });
                } else event.finish();
            }).then(() => {
                if (!result.bool) player.loseHp();
            });
        },
        ai: { fireAttack: true },
        group: 'zshy_lihuo_add',
        subSkill: {
            add: {
                trigger: { player: 'useCard2' },
                sourceSkill: 'zshy_lihuo',
                filter(event, player) {
                    if (get.name(event.card) != 'sha' || !game.hasNature(event.card, 'fire')) return false;
                    return game.hasPlayer(function (current) {
                        return !event.targets.includes(current) && player.canUse(event.card, current);
                    });
                },
                direct: true,
                content() {
                    'step 0';
                    player.chooseTarget([1, Infinity], get.prompt('zshy_lihuo'), '为' + get.translation(trigger.card) + '增加任意名目标', function (card, player, target) {
                        return !_status.event.sourcex.includes(target) && player.canUse(_status.event.card, target);
                    }).set('sourcex', trigger.targets).set('card', trigger.card).set('ai', function (target) {
                        var player = _status.event.player;
                        return get.effect(target, _status.event.card, player, player);
                    });
                    'step 1';
                    if (result.bool) {
                        if (!event.isMine() && !_status.connectMode) game.delayx();
                        event.target = result.targets[0];
                    } else {
                        event.finish();
                    }
                    'step 2';
                    player.logSkill('zshy_lihuo', event.target);
                    trigger.targets.push(event.target);
                },
            },
        },
    },
    zshy_chunlao: {//醇醪
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: ['loseAfter', 'loseAsyncAfter'] },
        filter(event, player) {
            if (event.type != 'discard' || event.getlx === false) return false;
            return game.hasPlayer(target => {
                if (![player.getPrevious(), player, player.getNext()].includes(target)) return false;
                return event.getl(target)?.cards2?.some(i => i.name == 'sha' && get.position(i) == 'd');
            });
        },
        forced: true,
        locked: false,
        async content(event, trigger, player) {
            const cards = game.filterPlayer(target => {
                if (![player.getPrevious(), player, player.getNext()].includes(target)) return false;
                return trigger.getl(target)?.cards2?.some(i => i.name == 'sha' && get.position(i) == 'd');
            }).map(target => {
                return trigger.getl(target).cards2.filter(i => i.name == 'sha' && get.position(i) == 'd');
            }).flat().unique();
            const gain = cards.slice(0, cards.length);
            if (gain.length) {
                await player.addToExpansion(gain).gaintag.add('zshy_chunlao');
            }
        },
        ai: {
            effect: {
                player_use(card, player, target) {
                    if (_status.currentPhase != player) return;
                    if (card.name == 'sha' && !player.getExpansions('zshy_chunlao').length && target.hp > 1) {
                        return 'zeroplayertarget';
                    }
                },
            },
        },
        intro: {
            content: 'expansion',
            markcount: 'expansion',
        },
        onremove(player, skill) {
            var cards = player.getExpansions(skill);
            if (cards.length) player.loseToDiscardpile(cards);
        },
        group: ['zshy_chunlao_save', 'zshy_chunlao_gain'],
        subSkill: {
            save: {
                enable: 'chooseToUse',
                sourceSkill: 'zshy_chunlao',
                filter(event, player) {
                    return event.type == 'dying' && event.dying && event.dying.hp <= 0 && player.getExpansions('zshy_chunlao').length > 0;
                },
                filterTarget(card, player, target) {
                    return target == _status.event.dying;
                },
                direct: true,
                clearTime: true,
                delay: false,
                selectTarget: -1,
                content() {
                    'step 0';
                    player.chooseCardButton(get.translation('zshy_chunlao'), player.getExpansions('zshy_chunlao'), true);
                    'step 1';
                    if (result.bool) {
                        player.logSkill('zshy_chunlao', target);
                        player.loseToDiscardpile(result.links);
                        event.type = 'dying';
                        target.useCard({ name: 'jiu', isCard: true }, target);
                    }
                },
                ai: {
                    save: true,
                    skillTagFilter(player) {
                        const num = player.getRoundHistory('useCard', evt => {
                            return evt.card?.name == 'jiu' && evt.card?.storage?.zshy_chunlao;
                        }).length + 1;
                        return player.getExpansions('zshy_chunlao').length >= num;
                    },
                    order: 6,
                    result: { target: 1 },
                },
            },
            gain: {
                audio: 'zshy_chunlao',
                trigger: { global: 'loseHpEnd' },
                filter(event, player) {
                    return player.getExpansions('zshy_chunlao').length;
                },
                async cost(event, trigger, player) {
                    const cards = player.getExpansions('zshy_chunlao');
                    event.result = await player.chooseButton(['###' + get.prompt('zshy_chunlao') + '###获得任意张「醇」？', cards], [0, Infinity])
                        .set('ai', button => {
                            const player = get.event().player;
                            return player.hasSha() ? 0 : get.value(button.link);
                        })
                        .forResult();
                    if (event.result.bool) event.result.cards = event.result.links;
                },
                async content(event, trigger, player) {
                    await player.gain(event.cards, player, 'give');
                },
            },
        },
    },

    zshy_gongji: {//弓骑
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        usable: 1,
        position: 'he',
        filterCard: true,
        check(card) {
            var base = 0,
                player = _status.event.player,
                suit = get.suit(card, player),
                added = false,
                added2 = false,
                added3;
            if (
                get.type(card) == 'equip' &&
                game.hasPlayer(function (target) {
                    var att = get.attitude(player, target);
                    if (att >= 0) return 0;
                    if (
                        target.countCards('he', function (card) {
                            return get.value(card) > 5;
                        })
                    )
                        return -att;
                })
            )
                base += 6;
            var hs = player.getCards('h');
            var muniu = player.getEquip('muniu');
            if (muniu && card != muniu && muniu.cards) hs = hs.concat(muniu.cards);
            for (var i of hs) {
                if (i != card && get.name(i) == 'sha') {
                    if (get.suit(i, player) == suit) {
                        if (player.hasValueTarget(i, false)) {
                            added3 = true;
                            base += 5.5;
                        }
                    } else {
                        if (player.hasValueTarget(i, false)) added2 = true;
                        if (!added && !player.hasValueTarget(i, null, true) && player.hasValueTarget(i, false, true)) {
                            base += 4;
                            added = true;
                        }
                    }
                }
            }
            if (added3 && !added2) base -= 4.5;
            return base - get.value(card);
        },
        content() {
            'step 0';
            if (!player.storage.zshy_gongji_damage) player.storage.zshy_gongji_damage = [];
            player.storage.zshy_gongji_damage.add(get.color(cards[0], player));
            player.addTempSkill('zshy_gongji_damage');
            'step 1';
            if (get.type(cards[0], null, cards[0].original == 'h' ? player : false) == 'equip') {
                player.chooseTarget('是否对一名角色造成1点伤害？', function (card, player, target) {
                    return player != target;
                }).set('ai', function (target) {
                    var player = _status.event.player;
                    if (get.attitude(player, target) < 0) {
                        return Math.max(0.5, get.effect(target, { name: 'sha' }, player, player));
                    }
                    return 0;
                });
            } else {
                event.finish();
            }
            'step 2';
            if (result.bool) {
                player.line(result.targets, 'green');
                event.target = result.targets[0];
                event.target.damage();
            }
        },
        ai: {
            order: 9,
            result: {
                player: 1,
            },
        },
        subSkill: {
            damage: {
                charlotte: true,
                onremove: true,
                mod: {
                    attackRangeBase() {
                        return Infinity;
                    },
                    cardUsable(card, player) {
                        if (card.name == 'sha') {
                            const color = get.color(card);
                            if (color === 'unsure' || player.storage.zshy_gongji_damage.includes(color)) return Infinity;
                        }
                    },
                    aiOrder(player, card, num) {
                        if (get.name(card) == 'sha' && !player.storage.zshy_gongji_damage.includes(get.color(card))) return num + 1;
                    },
                },
                mark: true,
                intro: {
                    content: '使用$的杀无次数限制',
                },
            },
        },
    },
    zshy_jiefan: {//解烦
        audio: 'ext:诸神寰宇/audio/character:2',
        usable: 1,
        skillAnimation: true,
        animationColor: 'wood',
        unique: true,
        enable: 'phaseUse',
        filterTarget: true,
        content() {
            'step 0';
            event.players = game.filterPlayer(function (current) {
                return current != target;
            });
            event.players.sortBySeat(target);
            'step 1';
            if (event.players.length) {
                event.current = event.players.shift();
                event.current.addTempClass('target');
                player.line(event.current, 'green');
                if (event.current.countCards('he') && target.isIn()) {
                    event.current.chooseToDiscard({ subtype: 'equip1' }, 'he', '弃置一张武器牌或让' + get.translation(target) + '摸一张牌')
                        .set('ai', function (card) {
                            if (get.attitude(_status.event.player, _status.event.target) < 0) return 7 - get.value(card);
                            return -1;
                        }).set('target', target);
                    event.tempbool = false;
                } else {
                    event.tempbool = true;
                }
            } else {
                event.finish();
            }
            'step 2';
            if (event.tempbool || result.bool == false) {
                target.draw();
            }
            event.goto(1);
        },
        ai: {
            order: 9,
            result: {
                target: 1,
            },
        },
    },

    zshy_shiyong: {//恃勇
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'damageEnd' },
        forced: true,
        filter(event, player) {
            return event.card && get.name(event.card) == 'sha' && (get.color(event.card) == 'red' || event.getParent(2).jiu == true);
        },
        async content(event, trigger, player) {
            trigger.cancel();
            player.loseMaxHp();
        },
        ai: {
            neg: true,
        },
        group: ['zshy_shiyong_black'],
        subSkill: {
            black: {
                audio: 'zshy_shiyong',
                trigger: { player: 'damageBegin4' },
                lastDo: true,
                forced: true,
                filter(event, player) {
                    return event.card;
                },
                content() {
                    player.draw(trigger.num);
                    if (get.color(trigger.card) == 'black') {
                        trigger.cancel();
                        player.gainMaxHp(trigger.num);
                        player.recover(trigger.num);
                    };
                },
                ai: {
                    neg: true,
                    effect: {
                        target(card, player, target) {
                            if (get.color(card) == 'black' && get.tag(card, 'damage')) return [0, 1];
                        },
                    },
                },
            },
        },
    },

    zshy_zishou: {//自守
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'phaseZhunbeiBegin' },
        check() {
            return true;
        },
        content() {
            player.draw(2 * game.countPlayer());
            player.addTempSkill('zshy_zishou_damage');
        },
        ai: {
            order: 9,
            threaten: 1.5,
        },
        subSkill: {
            damage: {
                audio: 'zshy_zishou',
                trigger: {
                    source: 'damageAfter',
                },
                charlotte: true,
                forced: true,
                fitler() {
                    return player.countCards('h') > 0 && event.target.isAlive();
                },
                logTarget: 'target',
                content() {
                    player.chooseToDiscard('h', true);
                    player.chooseToDiscard('e', true);
                    player.chooseToDiscard('j', true);
                },
            },
        },
    },
    zshy_zongshi: {//宗室
        audio: 'ext:诸神寰宇/audio/character:2',
        locked: true,
        mod: {
            maxHandcard(player, num) {
                return num + game.countGroup();
            },
        },
    },

    //墟钟会
    zshy_quanji: {//权计
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AAZZzhonghuiYJCM_shadow: 'zshy_quanji_zshy_AAZZzhonghuiYJCM_shadow',
        },
        trigger: {
            player: ['damageEnd'],
            source: ['damageEnd'],
            global: ['phaseUseEnd'],
        },
        frequent: true,
        locked: false,
        filter(event, player) {
            if (event.name == 'phaseUse') return true;
            return event.num > 0;
        },
        getIndex(event, player) {
            return event.num || 1;
        },
        async content(event, trigger, player) {
            await player.draw();
            if (player.countCards('hes')) {
                const result = await player.chooseCard('hes', '将一张牌置于武将牌上作为「权」', true).forResult();
                if (result.bool && result.cards.length) {
                    await player.addToExpansion(result.cards, player, 'give').gaintag.add('zshy_quanji');
                }
            }
        },
        mod: {
            maxHandcard(player, num) {
                return num + player.getExpansions('zshy_quanji').length;
            },
            aiOrder(player, card, num) {
                if (num <= 0 || typeof card !== 'object' || !player.isPhaseUsing()) return num;
                if (!player.hasSkill('zshy_zili') || player.hasSkill('zshy_paiyi')) return num;
                if (player.getExpansions('zshy_quanji').length < 3) {
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
            var cards = player.getExpansions('zshy_quanji');
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
                        if (!target.hasSkill('zshy_paiyi') && target.hp > 1) return [0.5, get.tag(card, 'damage') * 1.5];
                        if (target.hp == 3) return [0.5, get.tag(card, 'damage') * 1.5];
                        if (target.hp == 2) return [1, get.tag(card, 'damage') * 0.5];
                    }
                },
            },
        },
        subSkill: {
            zshy_AAZZzhonghuiYJCM_shadow: { audio: 'ext:诸神寰宇/audio/character:2' },
        }
    },
    zshy_zili: {//自立
        audio: 'ext:诸神寰宇/audio/character:2',
        skillAnimation: true,
        animationColor: 'thunder',
        unique: true,
        juexingji: true,
        trigger: { player: 'zshy_quanjiAfter' },
        forced: true,
        derivation: 'zshy_paiyi',
        filter(event, player) {
            return !player.hasSkill('zshy_paiyi') && player.getExpansions('zshy_quanji').length > 2;
        },
        content() {
            'step 0';
            player.awakenSkill('zshy_zili');
            player.changeSkin({ characterName: 'zshy_AAZZzhonghuiYJCM' }, 'zshy_AAZZzhonghuiYJCM_shadow');
            player.chooseDrawRecover(2, true, function (event, player) {
                if (player.hp == 1 && player.isDamaged()) return 'recover_hp';
                return 'draw_card';
            });
            'step 1';
            player.addSkills('zshy_paiyi');
            player.insertPhase();
        },
        ai: {
            combo: 'zshy_quanji',
        },
    },
    zshy_paiyi: {//排异
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        filter(event, player) {
            return player.getExpansions('zshy_quanji').length > 0;
        },
        prompt: '出牌阶段，你可弃置一张「权」并回复1点体力，然后选择一名角色令其摸两张牌，最后你令一名其他角色失去1点体力',
        content() {
            'step 0'
            var cards = player.getExpansions('zshy_quanji');
            if (cards.length == 1) event._result = { bool: true, links: cards };
            else player.chooseCardButton('请选择要弃置的一张「权」', cards, true);
            'step 1'
            if (result.bool) {
                player.loseToDiscardpile(result.links);
                player.recover();
            };
            'step 2'
            player.chooseTarget('令一名角色摸两张牌', true).set('ai', function (target) {
                var player = _status.event.player;
                if (get.attitude(player, target) <= 0) return 0;
                return get.effect(target, { name: 'wuzhong' }, player, player);
            });
            'step 3'
            if (result.bool) {
                result.targets[0].draw(2);
            }
            'step 4'
            player.chooseTarget('可以令一名其他角色失去1点体力', function (event, target, player) {
                return target != player;
            }).set('ai', function (target) {
                var player = _status.event.player;
                return get.effect(target, { name: 'losehp' }, player, player) > 0;
            });
            'step 5'
            if (result.bool) {
                result.targets[0].loseHp();
            }
        },
        ai: {
            order(player) {
                return [5, 7, 9].randomGet();
            },
            combo: 'zshy_quanji',
            result: {
                player(player) {
                    var num = player.getExpansions('zshy_quanji').length;
                    if (game.hasPlayer(function (current) {
                        return get.damageEffect(current, player, player) > 0;
                    }) && !player.hasSkill('zshy_paiyi_damage')) return 2;
                    if (player.countCards('h') < player.hp || num > 5 || player.isDamaged()) return 1;
                    return 0;
                },
            },
        },
    },

    zshy_zhenlie: {//贞烈
        audio: 'ext:诸神寰宇/audio/character:2',
        mark: true,
        onremove: true,
        intro: {
            content: '已发动过的目标：$',
            onunmark: true,
        },
        trigger: {
            target: 'useCardToTargeted',
            player: 'damageBegin4',
        },
        filter(event, player, name) {
            if (name == 'damageBegin4') return true;
            return event.player != player && event.card;
        },
        logTarget(event) {
            return event.name == 'damage' ? event.source : event.player;
        },
        check(event, player, name) {
            // 这里只调整自动发动意愿，真人仍可按原规则选择失去体力。
            if (player.hp <= 1) return false;
            if (name == 'damageBegin4') {
                if (get.damageEffect(player, event.source, player, event.nature) >= 0) return false;
                if (event.num > 1) return true;
                return !!event.source && get.attitude(player, event.source) < 0 && event.source.countDiscardableCards(player, 'he') > 0;
            }
            if (event.getParent().excluded.includes(player)) return false;
            if (get.attitude(player, event.player) > 0 || (player.hp < 2 && !get.tag(event.card, 'damage'))) return false;
            let evt = event.getParent(),
                directHit = (evt.nowuxie && get.type(event.card, 'trick') === 'trick') || (evt.directHit && evt.directHit.includes(player)) || (evt.customArgs && evt.customArgs.default && evt.customArgs.default.directHit2);
            if (get.tag(event.card, 'respondSha')) {
                if (directHit || player.countCards('h', { name: 'sha' }) === 0) return true;
            } else if (get.tag(event.card, 'respondShan')) {
                if (directHit || player.countCards('h', { name: 'shan' }) === 0) return true;
            } else if (get.tag(event.card, 'damage')) {
                if (get.name(event.card) === 'huogong') return event.player.countCards('h') > 4 - player.hp - player.hujia;
                if (get.name(event.card) === 'shuiyanqijunx') return player.countCards('e') === 0;
                return true;
            } else if (player.hp > 2) {
                if (get.name(event.card) === 'shunshou' || (get.name(event.card) === 'zhujinqiyuan' && (event.card.yingbian || get.distance(event.player, player) < 0))) return true;
            }
            return false;
        },
        async content(event, trigger, player) {
            const target = event.triggername == 'damageBegin4' ? trigger.source : trigger.player;
            await player.loseHp();
            if (event.triggername == 'useCardToTargeted') {
                trigger.getParent().excluded.add(player);
            }
            if (event.triggername == 'damageBegin4') {
                trigger.cancel();
            }
            // 无来源伤害仍可防止；来源离场后不再尝试弃其牌。
            if (target?.isIn() && target.countDiscardableCards(player, 'he') > 0) {
                if (get.mode() !== 'identity' || player.identity !== 'nei') player.addExpose(0.12);
                const num = player.getDamagedHp() + 1;
                await player.discardPlayerCard(target, 'he', num, true);
            }
        },
        ai: {
            filterDamage: true,
            skillTagFilter: (player, tag, arg) => {
                return arg && arg.jiu == true;
            },
            effect: {
                target(card, player, target) {
                    if (target.hp <= 0 && target.hasSkill('zshy_zhenlie_lose') && get.tag(card, 'recover')) return [1, 1.2];
                },
            },
        },
    },
    zshy_miji: {//秘计
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: ['phaseJieshuBegin'],
        },
        frequent: true,
        locked: false,
        content() {
            'step 0';
            event.num = player.getDamagedHp() + 1;
            player.chooseDrawRecover(event.num, true);
            if (_status.connectMode)
                game.broadcastAll(function () {
                    _status.noclearcountdown = true;
                });
            event.given_map = {};
            event._forcing = false;
            event.aicheck = (function () {
                let res = {
                    bool: true,
                    cards: [],
                },
                    cards = player.getCards('he'),
                    tars = game.filterPlayer(i => player !== i);
                cards.forEach(i => {
                    let o = get.value(i, player),
                        max = o,
                        temp,
                        t;
                    tars.forEach(tar => {
                        temp = get.value(i, tar);
                        if (temp > max) {
                            max = temp;
                            t = tar;
                        }
                    });
                    if (t) res.cards.push([i, t, max - o]);
                });
                if (res.cards.length < event.num) res.bool = false;
                else if (res.cards.length > event.num)
                    res.cards
                        .sort((a, b) => {
                            return b[2] - a[2];
                        })
                        .slice(0, event.num);
                return res;
            })();
            'step 1';
            player.chooseCardTarget({
                filterCard(card) {
                    return get.itemtype(card) == 'card' && !card.hasGaintag('zshy_miji_tag');
                },
                filterTarget: lib.filter.notMe,
                selectCard: [1, event.num],
                prompt: '请选择要分配的卡牌和目标',
                forced: event._forcing,
                ai1(card) {
                    if (!_status.event.res.bool || ui.selected.cards.length) return 0;
                    for (let arr of _status.event.res.cards) {
                        if (arr[0] === card) return arr[2];
                    }
                    return 0;
                },
                ai2(target) {
                    let card = ui.selected.cards[0];
                    for (let arr of _status.event.res.cards) {
                        if (arr[0] === card) return get.attitude(player, target);
                    }
                    let val = target.getUseValue(card);
                    if (val > 0) return val * get.attitude(player, target) * 2;
                    return get.value(card, target) * get.attitude(player, target);
                },
                res: event.aicheck,
            });
            'step 2';
            if (result.bool) {
                event._forcing = true;
                var res = result.cards,
                    target = result.targets[0].playerid;
                player.addGaintag(res, 'zshy_miji_tag');
                event.num -= res.length;
                if (!event.given_map[target]) event.given_map[target] = [];
                event.given_map[target].addArray(res);
                if (event.num > 0) event.goto(1);
            }
            'step 3';
            if (_status.connectMode) {
                game.broadcastAll(function () {
                    delete _status.noclearcountdown;
                    game.stopCountChoose();
                });
            }
            var map = [],
                cards = [];
            for (var i in event.given_map) {
                var source = (_status.connectMode ? lib.playerOL : game.playerMap)[i];
                player.line(source, 'green');
                if (player !== source && (get.mode() !== 'identity' || player.identity !== 'nei')) player.addExpose(0.18);
                map.push([source, event.given_map[i]]);
                cards.addArray(event.given_map[i]);
            }
            game.loseAsync({
                gain_list: map,
                player: player,
                cards: cards,
                giver: player,
                animate: 'giveAuto',
            }).setContent('gaincardMultiple');
        },
        mod: {
            aiOrder(player, card, num) {
                if (num > 0 && _status.event && _status.event.type === 'phase' && get.tag(card, 'recover')) {
                    if (player.needsToDiscard()) return num / 3;
                    return 0;
                }
            },
        },
        ai: {
            threaten(player, target) {
                return 0.6 + 0.7 * target.getDamagedHp();
            },
            effect: {
                target(card, player, target) {
                    if (target.hp <= 2 && get.tag(card, 'damage')) {
                        var num = 1;
                        if (
                            get.itemtype(player) == 'player' &&
                            player.hasSkillTag('damageBonus', false, {
                                target: target,
                                card: card,
                            }) &&
                            !target.hasSkillTag('filterDamage', null, {
                                player: player,
                                card: card,
                            })
                        )
                            num = 2;
                        if (target.hp > num) return [1, 1];
                    }
                },
            },
        },
    },

    zshy_fuhun: {//父魂
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: ['chooseToUse', 'chooseToRespond'],
        filterCard: true,
        selectCard: 2,
        position: 'hes',
        derivation: ['zshy_wusheng', 'zshy_paoxiao'],
        viewAs: { name: 'sha' },
        prompt: '将两张手牌当杀使用或打出',
        viewAsFilter(player) {
            return player.countCards('hs') > 1;
        },
        check(card) {
            if (_status.event.player.hasSkill('zshy_wusheng') && get.color(card) == 'red') return 0;
            if (_status.event.name == 'chooseToRespond') {
                if (card.name == 'sha') return 0;
                return 6 - get.useful(card);
            }
            if (_status.event.player.countCards('hs') < 4) return 6 - get.useful(card);
            return 7 - get.useful(card);
        },
        ai: {
            respondSha: true,
            skillTagFilter(player) {
                if (player.countCards('hs') < 2) return false;
            },
            order(item, player) {
                if (player.hasSkill('zshy_wusheng') && player.hasSkill('zshy_paoxiao')) {
                    return 1;
                }
                if (player.countCards('hs') < 4) {
                    return 1;
                }
                return 4;
            },
        },
        group: ['zshy_fuhun_gain'],
        subSkill: {
            gain: {
                audio: 'zshy_fuhun',
                trigger: { source: 'damageAfter' },
                forced: true,
                filter(event, player) {
                    if (['zshy_wusheng', 'zshy_paoxiao'].every(skill => player.hasSkill(skill, null, false, false))) return false;
                    return true;
                },
                content() {
                    player.addTempSkills(['zshy_wusheng', 'zshy_paoxiao']);
                    // player.addTempSkill('fuhun3');
                },
            },
        },
    },

};
const 一将成名2013 = {
    //墟曹冲
    zshy_chengxiang: {//称象
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'damageAfter' },
        filter(event, player) {
            return event.num > 0;
        },
        frequent: true,
        content() {
            'step 0'
            let mark = 0;
            if (event.name == 'zshy_chengxiang' && player.countMark('zshy_chengxiang') > 0) {
                mark += player.countMark('zshy_chengxiang');
            }
            event.cards = get.cards(4 + mark);
            game.cardsGotoOrdering(event.cards);
            event.videoId = lib.status.videoId++;
            game.broadcastAll(
                function (player, id, cards, num) {
                    var str;
                    if (player == game.me && !_status.auto) {
                        str = '称象：选择任意张点数不大于' + num + '的牌';
                    } else {
                        str = '称象';
                    }
                    var dialog = ui.create.dialog(str, cards);
                    dialog.videoId = id;
                },
                player,
                event.videoId,
                event.cards,
                13,
            );
            event.time = get.utc();
            game.addVideo('showCards', player, ['称象', get.cardsInfo(event.cards)]);
            game.addVideo('delay', null, 2);
            'step 1';
            var next = player.chooseButton([0, Infinity]);
            next.set('dialog', event.videoId);
            next.set('filterButton', function (button) {
                var num = 0;
                for (var i = 0; i < ui.selected.buttons.length; i++) {
                    num += get.number(ui.selected.buttons[i].link);
                }
                return num + get.number(button.link) <= _status.event.maxNum;
            });
            next.set('maxNum', 13);
            next.set('ai', function (button) {
                let player = _status.event.player,
                    name = get.name(button.link),
                    val = get.value(button.link, player);
                if (name === 'tao') return val + 2 * Math.min(3, 1 + player.getDamagedHp());
                if (name === 'jiu' && player.hp < 3) return val + 2 * (2.8 - player.hp);
                if (name === 'wuxie' && player.countCards('j') && !player.hasWuxie()) return val + 5;
                if (player.hp > 0 && player.hasSkill('zshy_renxin') && get.type(button.link) === 'equip') return val + 100;
                return val;
            });
            'step 2';
            if (result.bool && result.links) {
                var cards2 = [];
                for (var i = 0; i < result.links.length; i++) {
                    cards2.push(result.links[i]);
                    cards.remove(result.links[i]);
                }
                event.cards2 = cards2;
            } else {
                event.finish();
            }
            var time = 1000 - (get.utc() - event.time);
            if (time > 0) {
                game.delay(0, time);
            }
            'step 3';
            game.broadcastAll('closeDialog', event.videoId);
            var cards2 = event.cards2;
            player.gain(cards2, 'gain2');
            if (event.name == 'zshy_chengxiang') {
                let num = cards2.reduce((num, i) => {
                    return num + get.number(i, player);
                }, 0);
                if (num == 13) {
                    player.addMark('zshy_chengxiang', 1);
                    player.recover();
                };
            }
        },
        ai: {
            maixie: true,
            maixie_hp: true,
            effect: {
                target(card, player, target) {
                    if (get.tag(card, 'damage')) {
                        if (player.hasSkillTag('jueqing', false, target)) return [1, -2];
                        if (!target.hasFriend()) return;
                        if (target.hp >= 4) return [1, 2];
                        if (target.hp == 3) return [1, 1.5];
                        if (target.hp == 2) return [1, 0.5];
                        if (target.hp == 1 && target.countCards('he', { type: 'equip' })) return [1, 2];
                    }
                },
            },
        },
        getIndex(event, player) {
            return event.num;
        },
        intro: { content: '本局发动〖称象〗多亮出$张牌' },
    },
    zshy_renxin: {//仁心
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'dying',
        },
        filter(event, player) {
            return player.countCards('he', { type: 'equip' }) > 0;
        },
        logTarget: 'player',
        async cost(event, trigger, player) {
            event.result = await player.chooseToDiscard(get.prompt(event.name.slice(0, -5), trigger.player), `弃置一张装备牌并将武将牌翻面，然后${get.translation(trigger.player)}回复至1点体力`, { type: 'equip' }, 'he')
                .set('ai', card => {
                    const player = get.player();
                    if (get.attitude(player, get.event().getTrigger().player) > 3) {
                        return 11 - get.value(card);
                    }
                    return -1;
                }).forResult();
        },
        async content(event, trigger, player) {
            await trigger.player.recoverTo(1);
        },
        ai: {
            expose: 0.5,
        },
    },

    //墟郭淮
    zshy_jingce: {//精策
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'phaseUseEnd',
        },
        frequent: true,
        filter(event, player) {
            return (player.getHistory('useCard', function (evt) {
                return evt.getParent('phaseUse') == event;
            }).length > 0);
        },
        async content(event, trigger, player) {
            var list = [];
            player.getHistory('useCard', function (evt) {
                if (evt.getParent('phaseUse') == trigger) list.add(get.type2(evt.card));
            });
            player.draw(list.length);
            player.recover(list.length);
            var liststr = '选择对' + list.length + '名其他角色各造成' + list.length + '点伤害';
            const result = await player.chooseTarget([1, list.length], liststr, function (card, player, target) {
                return target != player;
            }).set('ai', function (target) {
                var player = _status.event.player;
                return get.attitude(player, target) < 0;
            }).forResult();
            if (result) {
                var targets = result.targets.sortBySeat();
                player.line(targets);
                for (var i of targets) i.damage(list.length);
            }
        },
        group: ['zshy_jingce_add'],
        subSkill: {
            add: {
                trigger: { player: ['useCard', 'respond'] },
                silent: true,
                firstDo: true,
                filter(event, player) {
                    var list = player.getStorage('zshy_jingce_sub');
                    for (var i of event.cards) {
                        if (!list.includes(get.suit(i, player))) return true;
                    }
                    return false;
                },
                content() {
                    if (!player.storage.zshy_jingce_sub) player.storage.zshy_jingce_sub = [];
                    for (var i of trigger.cards) player.storage.zshy_jingce_sub.add(get.suit(i, player));
                    player.storage.zshy_jingce_sub.sort();
                    player.addSkill('zshy_jingce_sub');
                    player.markSkill('zshy_jingce_sub');
                },
            },
            sub: {
                onremove: true,
                intro: {
                    content: '当前已使用花色：$',
                },
                mod: {
                    maxHandcard(player, num) {
                        return num + player.getStorage('zshy_jingce_sub').length;
                    },
                },
            },
        },
    },

    zshy_junxing: {//峻刑
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        usable: 1,
        filterTarget(event, player, target) {
            return player != target;
        },
        content() {
            'step 0'
            var list = [
                '令' + get.translation(target) + '弃置所有手牌',
                '令' + get.translation(target) + '翻面并摸一张牌',
            ];
            player.chooseControl(true).set('choiceList', list)
                .set('ai', function () {
                    var att = get.attitude(player, target);
                    if (att < 0) {
                        if (target.countCards('h') > 5) return 0;
                        if (target.hasSkillTag('noturn')) return 0;
                        if (target.isTurnedOver() || target.hp < 2) return 0;
                        return 1;
                    }
                }).set('prompt', '峻刑：请选择一项对' + get.translation(target) + '执行');
            'step 1'
            if (result.index == 0) {
                target.chooseToDiscard(target.countCards('h'), 'h', true);
            } else {
                target.turnOver();
                target.draw();
            }
        },
        ai: {
            order: 1,
            result: {
                target(player, target) {
                    var att = get.attitude(player, target);
                    if (att > 0 && target.isTurnedOver()) return 2;
                    if (att < 0 && !target.hasSkillTag('noturn')) return -2;
                },
            },
        },
    },
    zshy_yuce: {//御策
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'damageEnd' },
        direct: true,
        filter(event, player) {
            return event?.source?.isAlive();
        },
        content() {
            'step 0'
            player.logSkill('zshy_yuce');
            var att = get.attitude(trigger.source, player);
            var str = '是否弃置' + player.hp + '张牌防止' + get.translation(player) + '回复' + trigger.num + '点体力？'
            if (trigger.source.countCards('he') >= player.hp) {
                trigger.source.chooseToDiscard(str, player.hp, 'he').set('ai', function (card) {
                    return 7 - get.value(card);
                });
            } else {
                player.recover(trigger.num);
                event.finish();
            }
            'step 1'
            player.logSkill('zshy_yuce');
            if (!result.links) {
                player.recover();
            }
            if (trigger.num > 1) trigger.source.loseHp();
        },
        ai: {
            nadamage(target) {
                if (target.countCards('he') < (player.hp - 1)) return true;
            },
            effect: {
                target(card, player, target) {
                    if (get.tag(card, 'damage' && target.countCards('h'))) {
                        return 0.8;
                    }
                },
            },
        },
    },

    zshy_longyin: {//龙吟
        audio: 'ext:诸神寰宇/audio/character:2',
        init: player => {
            game.addGlobalSkill('zshy_longyin_order');
        },
        onremove: player => {
            if (!game.hasPlayer(current => current.hasSkill('zshy_longyin', null, null, false), true)) game.removeGlobalSkill('zshy_longyin_order');
        },
        trigger: { global: 'useCard' },
        direct: true,
        filter(event, player) {
            return get.name(event.card) == 'sha' && player.countCards('he') > 0;
        },
        content() {
            'step 0';
            var go = false;
            if (get.attitude(player, trigger.player) > 0) {
                if (get.color(trigger.card) == 'red') {
                    go = true;
                } else if (trigger.addCount === false || !trigger.player.isPhaseUsing()) go = false;
                else if (!trigger.player.hasSkill('paoxiao') && !trigger.player.hasSkill('tanlin3') && !trigger.player.hasSkill('zhaxiang2') && !trigger.player.hasSkill('fengnu') && !trigger.player.getEquip('zhuge')) {
                    var nh = trigger.player.countCards('h');
                    if (player == trigger.player) {
                        go = player.countCards('h', 'sha') > 0;
                    } else if (nh >= 4) {
                        go = true;
                    } else if (player.countCards('h', 'sha')) {
                        if (nh == 3) {
                            go = Math.random() < 0.8;
                        } else if (nh == 2) {
                            go = Math.random() < 0.5;
                        }
                    } else if (nh >= 3) {
                        if (nh == 3) {
                            go = Math.random() < 0.5;
                        } else if (nh == 2) {
                            go = Math.random() < 0.2;
                        }
                    }
                }
            }
            //AI停顿
            if (go && !event.isMine() && !event.isOnline()) {
                game.delayx();
            }
            var next = player.chooseBool(get.prompt('zshy_longyin'), '是否发动〖龙吟〗并可以重铸一张牌' + (get.color(trigger.card) == 'red' ? '，然后回复1点体力' : '') + '，令' + get.translation(trigger.player) + '本次使用的【杀】不计入使用次数' + (get.color(trigger.card) == 'red' ? '且额外结算一次' : ''));
            next.logSkill = ['zshy_longyin', trigger.player];
            next.set('ai', function () {
                if (_status.event.go) {
                    return 1;
                }
                return 0;
            });
            next.set('go', go);
            'step 1';
            if (result.bool) {
                player.logSkill('zshy_longyin');
                if (trigger.addCount !== false) {
                    trigger.addCount = false;
                    trigger.player.getStat().card.sha--;
                }
                if (get.color(trigger.card) == 'red') {
                    trigger.effectCount++;
                    player.recover();
                }
                if (player.countCards('hes') > 0) {
                    player.chooseCard('hes', '龙吟：是否重铸一张牌？').set('ai', function (card) {
                        return 6 - get.value(card);
                    });
                }
            }
            'step 2'
            if (result.bool) player.recast(result.cards);
        },
        ai: {
            expose: 0.2,
        },
        subSkill: {
            order: {
                mod: {
                    aiOrder: (player, card, num) => {
                        if (num && card.name === 'sha' && get.color(card) === 'red') {
                            let gp = game.findPlayer(current => {
                                return current.hasSkill('zshy_longyin') && current.hasCard(i => true, 'he');
                            });
                            if (gp) return num + 0.15 * Math.sign(get.attitude(player, gp));
                        }
                    },
                },
                trigger: { player: 'dieAfter' },
                filter: (event, player) => {
                    return !game.hasPlayer(current => current.hasSkill('zshy_longyin', null, null, false), true);
                },
                silent: true,
                forceDie: true,
                charlotte: true,
                content: () => {
                    game.removeGlobalSkill('zshy_longyin_order');
                },
            },
        },
    },

    zshy_qiaoshui: {//巧说
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'useCard2' },
        filter(event, player) {
            var type = get.type(event.card);
            return type == 'trick';
        },
        direct: true,
        content() {
            'step 0'
            var goon = false;
            var info = get.info(trigger.card);
            if (trigger.targets && !info.multitarget) {
                var players = game.filterPlayer();
                for (var i = 0; i < players.length; i++) {
                    if (lib.filter.targetEnabled2(trigger.card, player, players[i]) && !trigger.targets.includes(players[i])) {
                        goon = true;
                        break;
                    }
                }
            }
            if (goon) {
                player.chooseTarget([1, Infinity], '巧说：是否为' + get.translation(trigger.card) + '额外指定任意名目标？', function (card, player, target) {
                    var trigger = _status.event;
                    if (trigger.targets.includes(target)) return false;
                    return lib.filter.targetEnabled2(trigger.card, _status.event.player, target);
                }).set('ai', function (target) {
                    var trigger = _status.event.getTrigger();
                    var player = _status.event.player;
                    return get.effect(target, trigger.card, player, player);
                }).set('targets', trigger.targets).set('card', trigger.card);
            } else {
                if (!info.multitarget && trigger.targets && trigger.targets.length > 1) {
                    event.goto(3);
                }
            }
            'step 1'
            if (result.bool) {
                if (!event.isMine()) game.delayx();
                event.targets = result.targets;
            }
            else if (!get.info(trigger.card).multitarget && trigger.targets && trigger.targets.length > 1) {
                event.goto(3);
            } else {
                event.finish();
            }
            'step 2'
            if (event.targets) {
                player.logSkill(event.name, event.target);
                for (var i = 0; i < result.targets.length; i++) {
                    trigger.targets.add(event.targets[i]);
                }
            }
            event.finish();
            'step 3'
            player.chooseTarget([1, Infinity], '巧说：是否减少任意名' + get.translation(trigger.card) + '的目标？', function (card, player, target) {
                return _status.event.targets.includes(target);
            }).set('ai', function (target) {
                var trigger = _status.event.getTrigger();
                return -get.effect(target, trigger.card, trigger.player, _status.event.player);
            }).set('targets', trigger.targets);
            'step 4'
            if (result.bool) {
                event.targets = result.targets;
                if (event.isMine()) {
                    player.logSkill(event.name, event.targets);
                    event.finish();
                }
                for (var i = 0; i < result.targets.length; i++) {
                    trigger.targets.remove(result.targets[i]);
                }
                game.delay();
            } else {
                event.finish();
            }
            'step 5';
            player.logSkill(event.name, event.targets);
        },
        group: ['zshy_qiaoshui_damage'],
        subSkill: {
            damage: {
                audio: 'zshy_qiaoshui',
                trigger: {
                    player: 'damageBegin4',
                },
                filter(event, player) {
                    return player.canCompare(event.source);
                },
                prompt2(event, player) {
                    return '是否与' + get.translation(event.source) + '拼点，若你赢则取消本次伤害';
                },
                check(event, player, target) {
                    return get.damageEffect(player, event.source, player) < 0;
                },
                content() {
                    'step 0'
                    player.chooseToCompare(trigger.source);
                    'step 1'
                    if (result.bool) {
                        trigger.cancel();
                    }
                },
            },
        },
    },
    zshy_JYzongshi: {//纵适
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: ['chooseToCompareAfter', 'compareMultipleAfter'],
            target: ['chooseToCompareAfter', 'compareMultipleAfter'],
        },
        filter(event, player) {
            if (event.preserve) return false;
            if (player == event.player) {
                if (event.num1 > event.num2) {
                    return !get.owner(event.card2);
                } else {
                    return !get.owner(event.card1);
                }
            } else {
                if (event.num1 < event.num2) {
                    return !get.owner(event.card1);
                } else {
                    return !get.owner(event.card2);
                }
            }
        },
        check(event, player) {
            if (player == event.player) {
                if (event.num1 > event.num2) {
                    return event.card2.name != 'du';
                } else {
                    return event.card1.name != 'du';
                }
            } else {
                if (event.num1 < event.num2) {
                    return event.card1.name != 'du';
                } else {
                    return event.card2.name != 'du';
                }
            }
        },
        content() {
            if (player == trigger.player) {
                if (trigger.num1 > trigger.num2) {
                    player.gain(trigger.card2, 'gain2', 'log');
                } else {
                    player.gain(trigger.card1, 'gain2', 'log');
                }
            } else {
                if (trigger.num1 < trigger.num2) {
                    player.gain(trigger.card1, 'gain2', 'log');
                } else {
                    player.gain(trigger.card2, 'gain2', 'log');
                }
            }
        },
    },

    zshy_xiansi: {//陷嗣
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: ['phaseZhunbeiBegin', 'damageAfter'],
        },
        filter(event, player, target) {
            return game.countPlayer(function (current) {
                return current.countCards('he') > 0 && current != player;
            }) > 0;
        },
        direct: true,
        content() {
            'step 0'
            var str = '选择至多两名角色并获得其各一张牌';
            player.chooseTarget(get.prompt2(event.name), [1, 2], function (card, player, target) {
                return target.countCards('he') > 0 && target != player;
            }, function (target) {
                return -get.attitude(_status.event.player, target);
            });
            'step 1'
            j = 0;
            if (result.targets) {
                for (i = 0; i < result.targets.length; i++) {
                    player.logSkill('zshy_xiansi');
                    player.gainPlayerCard(result.targets[i], 'he', true);
                    j++;
                }
            }
            'step 2'
            if (j > 0) {
                var str1 = '将' + j + '张手牌置于武将牌上作为「逆」';
                player.chooseCard(j, str1, true).set('ai', function (card) {
                    return 7 - get.value(card);
                });
            }
            'step 3'
            if (result.bool && result.cards.length) {
                player.addToExpansion(result.cards, player, 'give').gaintag.add('zshy_xiansi');
            }
        },
        marktext: '逆',
        intro: {
            content: 'expansion',
            markcount: 'expansion',
        },
        ai: {
            maixie: true,
        },
        group: ['zshy_xiansi_usesha'],
        subSkill: {
            usesha: {
                audio: 'zshy_xiansi',
                trigger: {
                    player: 'damageBegin4',
                },
                lastDo: true,
                filter(event, player) {
                    return player.getExpansions('zshy_xiansi').length >= player.maxHp && event.num >= player.hp;
                },
                prompt2(event, player) {
                    return '是否防止此伤害并获得' + player.getDamagedHp() + '张「逆」牌'
                },
                content() {
                    'step 0'
                    trigger.cancel();
                    event.num = player.getDamagedHp();
                    'step 1'
                    if (event.num > 0) {
                        player.chooseCardButton(get.translation('zshy_xiansi'), player.getExpansions('zshy_xiansi'), true);
                        event.num--;
                    }
                    'step 2'
                    if (result.bool) {
                        player.logSkill('zshy_xiansi');
                        player.gain(result.links, player, 'giveAuto');
                    }
                    'step 3'
                    if (event.num > 0) event.goto(1);
                },
            },
        },
    },

    //墟潘璋马忠
    zshy_duodao: {//夺刀
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: 'useCard' },
        filter(event, player) {
            return event.player != player && event.player.countCards('he') > 0 && get.type(event.card, 'damage') > 0.5;
        },
        prompt2(event, player) {
            return '是否获得' + get.translation(event.player) + '装备区的一张牌'
        },
        check(event, player) {
            return get.attitude(player, event.player) < 0;
        },
        async content(event, trigger, player) {
            const result = await player.gainPlayerCard(trigger.player, 'he', true).forResult();
            if (result.bool && get.type(result.cards, 'equip') == true) {
                player.recover();
            };
        },
        subSkill: {
            debuff: {
                charlotte: true,
                onremove: true,
                marktext: '夺刀',
                intro: {
                    content: '攻击范围-#',
                },
                mod: {
                    attackRange(player, num) {
                        return num -= player.countMark('zshy_duodao_debuff');
                    },
                },
            },
        },
    },
    zshy_anjian: {//暗箭
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'useCard1',
        },
        forced: true,
        filter(event, player) {
            return get.name(event.card) == 'sha' && player.countCards('e') > 0;
        },
        content() {
            trigger.directHit.addArray(game.players);
            trigger.baseDamage = player.countCards('e');
        },
        ai: {
            directHit_ai: true,
            skillTagFilter(player, tag, arg) {
                if (!arg || !arg.card || arg.card.name != 'sha') return false;
            },
        },
        group: ['zshy_anjian_sha'],
        subSkill: {
            sha: {
                audio: 'zshy_anjian',
                trigger: {
                    global: 'useCardAfter',
                },
                filter(event, player) {
                    return player.countCards('h') > 0 && event.player != player && get.name(event.card) == 'sha';
                },
                prompt2(event, player) {
                    return '视为对' + get.translation(event.player) + '使用一张无视距离且不限次数的刺【杀】';
                },
                check(event, player, target) {
                    return get.effect(event.player, event.card, player, player) > 0;
                },
                async content(event, trigger, player) {
                    player.useCard({ name: 'sha', nature: 'stab', isCard: true }, trigger.player, false);
                },
            },
        },
    },

    //墟虞翻
    zshy_zongxuan: {//纵玄
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: ['loseAfter', 'loseAsyncAfter'],
        },
        filter(event, player) {
            if (event.type != 'discard' || event.getlx === false) return;
            var evt = event.getl(player);
            for (var i = 0; i < evt.cards2.length; i++) {
                if (get.position(evt.cards2[i]) == 'd') {
                    return true;
                }
            }
            return false;
        },
        check(trigger, player) {
            if (
                trigger.getParent(3).name != 'phaseDiscard' ||
                !game.hasPlayer(function (current) {
                    return current.isDamaged() && get.recoverEffect(current, player, player) > 0;
                })
            )
                return false;
            var evt = trigger.getl(player);
            for (var i = 0; i < evt.cards2.length; i++) {
                if (get.position(evt.cards2[i], true) == 'd' && get.type(evt.cards2[i], false) == 'equip') {
                    return true;
                }
            }
            return false;
        },
        content() {
            'step 0';
            var cards = [];
            var evt = trigger.getl(player);
            for (var i = 0; i < evt.cards2.length; i++) {
                if (get.position(evt.cards2[i], true) == 'd') {
                    cards.push(evt.cards2[i]);
                }
            }
            var next = player.chooseToMove('纵玄：将任意张牌置于牌堆顶', true);
            next.set('list', [['本次弃置的牌', cards], ['牌堆顶']]);
            next.set('filterOk', function (moved) {
                return moved[1].length > 0;
            });
            next.set('processAI', function (list) {
                var cards = list[0][1].slice(0),
                    cards2 = cards.filter(function (i) {
                        return get.type(i, null, false) == 'equip';
                    }),
                    cards3;
                if (cards2.length) {
                    cards3 = cards2.randomGet();
                } else cards3 = cards.randomGet();
                return [[], [cards3]];
            });
            'step 1';
            if (result.bool) {
                var cards = result.moved[1];
                game.log(player, '将', cards, '置于了牌堆顶');
                while (cards.length) ui.cardPile.insertBefore(cards.pop().fix(), ui.cardPile.firstChild);
            }
        },
    },
    zshy_zhiyan: {//直言
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'phaseJieshuBegin',
            player: 'zshy_zongxuanAfter',
        },
        direct: true,
        content() {
            'step 0'
            player.chooseTarget(get.prompt('zshy_zhiyan'), '令一名角色摸一张牌并展示之，然后回复1点体力').set('ai', function (target) {
                return get.attitude(_status.event.player, target);
            });
            'step 1'
            if (result.bool) {
                event.target = result.targets[0];
                player.logSkill('zshy_zhiyan', result.targets);
                event.target.draw('visible');
                event.target.recover();
            } else {
                event.finish();
            }
        },
        ai: {
            expose: 0.2,
            threaten: 1.2,
        },
    },

    zshy_danshou: {//胆守
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'phaseJieshuBegin',
        },
        filter(event, player) {
            return event.player != player;
        },
        direct: true,
        content() {
            'step 0'
            const num = Math.max(1, player.getDamagedHp());
            const str = '是否弃置' + num + '张牌，然后对' + get.translation(trigger.player) + '造成' + Math.max(1, player.getDamagedHp()) + '伤害？';
            player.chooseToDiscard(get.prompt('zshy_danshou'), num, str, 'he').set('ai', function (card) {
                var player = _status.event.player;
                if (get.attitude(player, trigger.player) < 0) {
                    return 6 - get.value(card);
                };
                return 0;
            })
            'step 1'
            if (result.bool) {
                player.logSkill('zshy_danshou');
                trigger.player.damage(result.cards.length);
            }
        },
        group: ['zshy_danshou_draw'],
        subSkill: {
            draw: {
                audio: 'zshy_danshou',
                trigger: {
                    target: 'useCardToTargeted',
                },
                filter(event, player) {
                    return event.targets.includes(player) && event.player != player;
                },
                direct: true,
                content() {
                    var num = 0;
                    game.countPlayer(current => {
                        num += current.getHistory('useCard').filter(evt => evt.targets?.includes(player)).length;
                    });
                    player.logSkill('zshy_danshou');
                    player.draw(num);
                },
            },
        },
    },

    zshy_zhuikong: {//惴恐
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: 'phaseZhunbeiBegin' },
        filter(event, player) {
            return player.canCompare(event.player);
        },
        check(event, player) {
            if (get.attitude(player, event.player) < -2) {
                var cards = player.getCards('h');
                if (cards.length > player.hp) return true;
                for (var i = 0; i < cards.length; i++) {
                    var useful = get.useful(cards[i]);
                    if (useful < 5) return true;
                    if (get.number(cards[i]) > 9 && useful < 7) return true;
                }
            }
            return false;
        },
        content() {
            'step 0'
            player.logSkill('zshy_zhuikong');
            player.chooseToCompare(trigger.player);
            'step 1'
            if (result.bool) {
                trigger.player.skip('phaseDraw');
                trigger.player.skip('phaseUse');
                player.recover();
                player.draw();
            }
        },
        ai: {
            expose: 0.8,
        },
    },
    zshy_qiuyuan: {//求援
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            target: 'useCardToTarget',
        },
        direct: true,
        filter(event, player) {
            return get.name(event.card) == 'sha' && game.hasPlayer(function (current) {
                return current != player && !event.targets.includes(current) && lib.filter.targetEnabled(event.card, event.player, current);
            });
        },
        content() {
            'step 0'
            player.recover();
            var str = '选择一名非此【杀】的使用者以外的其他角色，获得其区域内的一张牌';
            player.chooseTarget(get.prompt('zshy_qiuyuan'), str, [1], function (card, player, target) {
                var evt = _status.event.getTrigger();
                return target != player && !evt.targets.includes(target) && target.countCards('hej') > 0;
            }).set('ai', function (target) {
                var trigger = _status.event.getTrigger(), player = _status.event.player;
                return get.effect(target, { name: 'shunshou_copy2' }, player, player);
            });
            'step 1'
            if (result.targets) {
                for (i = 0; i < result.targets.length; i++) {
                    player.logSkill('zshy_qiuyuan');
                    player.gainPlayerCard(result.targets[i], 'hej', true);
                };
            };
            'step 2'
            var str = '选择一名非此【杀】使用者的其他角色，令其成为此牌的额外目标';
            player.chooseTarget(get.prompt('zshy_qiuyuan'), str, [1], function (card, player, target) {
                var evt = _status.event.getTrigger();
                return target != player && !evt.targets.includes(target) && lib.filter.targetEnabled(evt.card, evt.player, target);
            }).set('ai', function (target) {
                var trigger = _status.event.getTrigger(), player = _status.event.player;
                return get.effect(target, trigger.card, trigger.player, player);
            });
            'step 3'
            if (result.targets) {
                for (i = 0; i < result.targets.length; i++) {
                    player.logSkill('zshy_qiuyuan');
                    var target = result.targets[i];
                    trigger.getParent().targets.push(target);
                    trigger.getParent().triggeredTargets2.push(target);
                    game.log(target, '成为了', trigger.card, '的额外目标');
                };
            };
        },
        ai: {
            expose: 0.2,
            effect: {
                'target_use'(card, player, target) {
                    if (card.name != 'sha') return;
                    var players = game.filterPlayer();
                    if (get.attitude(player, target) <= 0) {
                        for (var i = 0; i < players.length; i++) {
                            var target2 = players[i];
                            if (player != target2 && target != target2 && player.canUse(card, target2, false) &&
                                get.effect(target2, { name: 'shacopy', nature: card.nature, suit: card.suit }, player, target) > 0 &&
                                get.effect(target2, { name: 'shacopy', nature: card.nature, suit: card.suit }, player, player) < 0 && player.hp >= player.maxHp) {
                                return 0.6;
                            }
                        }
                    }
                    else {
                        for (var i = 0; i < players.length; i++) {
                            var target2 = players[i];
                            if (player != target2 && target != target2 && player.canUse(card, target2, false) &&
                                get.effect(target2, { name: 'shacopy', nature: card.nature, suit: card.suit }, player, player) > 0) {
                                if (player.canUse(card, target2)) return;
                                if (target.hp == target.maxHp) return [0, 0.6];
                                return [0, 0];
                            }
                        }
                    }
                },
            },
        },
    },

    //墟李儒
    zshy_mieji: {//灭计
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        usable: 1,
        filterTarget(card, player, target) {
            return target != player && target.countCards('h') > 0;
        },
        async content(event, trigger, player) {
            const str = '选择交给' + get.translation(player) + '一张手牌，若此牌不为锦囊牌，则你弃置所有手牌';
            const target = event.targets[0];
            const result = await target.chooseCard('h', str, true).forResult();
            if (result.cards && result.cards.length) {
                target.give(result.cards, player);
                if (get.type2(result.cards[0]) != 'trick') {
                    target.chooseToDiscard(target.countCards('h'), 'h', true);
                };
            }
        },
        ai: {
            order: 9,
            result: {
                target: -1,
            },
        },
    },
    zshy_fencheng: {//焚城
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        usable: 1,
        filterTarget: lib.filter.notMe,
        line: 'fire',
        skillAnimation: 'epic',
        animationColor: 'fire',
        prompt: '出牌阶段，你可指定一名其他角色，令从其开始的其他角色依次选择一项：①弃置至少X张牌（X为上一名角色弃置的牌数+1）②你对其造成2点火焰伤害',
        async content(event, trigger, player) {
            let targets = game.filterPlayer(current => current != player);
            targets.sortBySeat(event.target);
            let num = 1;
            if (targets.length) {
                for (const target of targets) {
                    if (target.isIn()) {
                        player.line(target, 'fire');
                        const result = await target
                            .chooseToDiscard('he', '焚城：弃置至少' + get.cnNumber(num) + '张牌，或受到2点火焰伤害', [num, Infinity])
                            .set('ai', card => {
                                if (ui.selected.cards.length >= get.event().num) return -1;
                                if (get.player().hasSkillTag('nofire')) return -1;
                                if (get.event().res >= 0) return 6 - get.value(card);
                                if (get.type(card) != 'basic') {
                                    return 10 - get.value(card);
                                }
                                return 8 - get.value(card);
                            }).set('num', num).set('res', get.damageEffect(target, player, target, 'fire'))
                            .forResult();
                        if (!result.bool) {
                            await target.damage(2, 'fire');
                            num = 1;
                        } else num = result.cards.length + 1;
                    }
                }
            }
        },
        ai: {
            order: 1,
            result: {
                player(player, target) {
                    if (player.hasUnknown(2)) return 0;
                    let num = 0,
                        eff = 0,
                        players = game.filterPlayer(current => {
                            return current != player;
                        }).sortBySeat(target);
                    for (const target of players) {
                        if (get.damageEffect(target, player, target, 'fire') >= 0) {
                            num = 0;
                            continue;
                        }
                        let shao = false;
                        num++;
                        if (
                            target.countCards('he', card => {
                                if (get.type(card) != 'basic') {
                                    return get.value(card) < 10;
                                }
                                return get.value(card) < 8;
                            }) < num
                        )
                            shao = true;
                        if (shao) {
                            eff -= 4 * (get.realAttitude || get.attitude)(player, target);
                            num = 0;
                        } else eff -= (num * (get.realAttitude || get.attitude)(player, target)) / 4;
                    }
                    if (eff < 4) return 0;
                    return eff;
                },
            },
        },
    },
    zshy_juece: {//绝策
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: 'phaseJieshuBegin' },
        filter(event, player) {
            return game.hasPlayer(function (current) {
                return current != player && (current.getHistory('lose', function (evt) {
                    return evt.cards2 && evt.cards2.length > 0;
                }).length > 0 || player.countCards('h') >= current.countCards('h'));
            });
        },
        async cost(event, trigger, player) {
            let str = '选择任意名手牌不大于你或本回合失去过牌的其他角色造成1点伤害';
            event.result = await player.chooseTarget([1, Infinity], get.prompt('zshy_juece'), str, function (card, player, target) {
                return target !== player && (player.countCards('h') >= target.countCards('h')
                    || target.getHistory('lose', function (evt) {
                        return evt.cards2 && evt.cards2.length > 0;
                    }).length > 0);
            }).set('ai', target => {
                const player = get.player();
                return get.damageEffect(target, player, player);
            }).forResult();
        },
        async content(event, trigger, player) {
            const targets = event.targets.sortBySeat();
            player.line(targets);
            for (const i of targets) {
                i.damage();
            }
        },
    },

};
const 一将成名2014 = {
    zshy_sidi: {//司敌
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'roundStart',
        },
        forced: true,
        content() {
            'step 0'
            player.draw();
            if (!player.countCards('hes')) event.finish();
            else {
                if (!player.getExpansions('zshy_sidi').length) {
                    player.chooseCard('hes', '司敌：请将一张牌置于武将牌上作为「司」', true).set('ai', function (card) {
                        return 6 - get.value(card);
                    });
                }
                else {
                    var str = '司敌：是否用一张牌替换「司」？（' + get.translation(player.getExpansions('zshy_sidi')[0]) + '）';
                    player.chooseCard('hes', str).set('ai', function (card) {
                        var player = _status.event.player;
                        var name = get.name(card);
                        if (name == 'sha') return 13;
                        return 7 - get.value(card);
                    });
                }
            }
            'step 1'
            if (result.bool) {
                if (!player.getExpansions('zshy_sidi').length) {
                    player.addToExpansion(result.cards[0], player, 'give', 'log').gaintag.add('zshy_sidi');
                }
                else {
                    player.addToExpansion(result.cards[0], 'log', 'give', player).gaintag.add('zshy_sidi');
                    var card = player.getExpansions('zshy_sidi')[0];
                    if (card) player.gain(card, 'gain2');
                }
            }
        },
        marktext: '司',
        intro: {
            content: 'expansion',
            markcount: 'expansion',
        },
        onremove(player, skill) {
            var cards = player.getExpansions(skill);
            if (cards.length) player.loseToDiscardpile(cards);
        },
        group: ['zshy_sidi_usecard'],
        subSkill: {
            usecard: {
                audio: 'zshy_sidi',
                trigger: {
                    global: ['useCard', 'respond'],
                },
                forced: true,
                filter(event, player, card) {
                    var storage = player.getExpansions('zshy_sidi');
                    if (!storage.length || event.player == player || event.player != _status.currentPhase) return false;
                    var type = get.type(storage[0]), color = get.color(storage[0]),
                        suit = get.suit(storage[0]), name = get.name(storage[0]), number = get.number(storage[0]);
                    return (get.type(event.card) == type ||
                        get.color(event.card) == color && !player.hasSkill('zshy_sidi_c') ||
                        get.suit(event.card) == suit ||
                        get.name(event.card) == name && !player.hasSkill('zshy_sidi_n') ||
                        get.number(event.card) == number) && !player.hasSkill('zshy_sidi_b');
                },
                direct: true,
                content() {
                    'step 0'
                    player.logSkill('zshy_sidi');
                    var storage = player.getExpansions('zshy_sidi');
                    var color = get.color(storage[0]), type = get.type(storage[0]),
                        suit = get.suit(storage[0]), number = get.number(storage[0]), name = get.name(storage[0]);
                    dcard = false, ddamage = false, dlosehp = false, tplayer = trigger.player;
                    if (get.type(trigger.card) == type) player.draw();
                    if (get.suit(trigger.card) == suit) player.recover();
                    if (get.name(trigger.card) == name && !player.hasSkill('zshy_sidi_n')) ddamage = true, player.addTempSkill('zshy_sidi_n');
                    if (get.number(trigger.card) == number && !player.hasSkill('zshy_sidi_b')) dlosehp = true, player.addTempSkill('zshy_sidi_b');
                    if (get.color(trigger.card) == color && tplayer.countCards('he') > 0 && !player.hasSkill('zshy_sidi_c')) dcard = true, player.addTempSkill('zshy_sidi_c');
                    var str = '是否令' + get.translation(tplayer) + '执行以下效果：'
                    if (dcard) str += '<br>你弃置其一张牌';
                    if (dlosehp) str += '<br>其失去1点体力';
                    if (ddamage) str += '<br>你对其造成1点伤害';
                    if (dcard || dlosehp || ddamage) {
                        player.chooseBool(str).set('ai', function (event, player) {
                            var player = _status.event.player;
                            return get.attitude(player, trigger.player) < 0;
                        })
                    }
                    'step 1'
                    if (result.bool) {
                        if (dcard) {
                            if (tplayer.countCards('he') > 0) {
                                player.discardPlayerCard(tplayer, 'he', true);
                            }
                        };
                        if (dlosehp) {
                            tplayer.loseHp();
                        };
                        if (ddamage) {
                            tplayer.damage();
                        };
                    };
                },
                ai: {
                    expose: 0.6,
                },
            },
            c: {
                charlotte: true,
                onremove: true,
            },
            n: {
                charlotte: true,
                onremove: true,
            },
            b: {
                charlotte: true,
                onremove: true,
            },
        },
    },

    zshy_shenduan: {//慎断
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'loseAsyncAfter',
            player: 'loseAfter',
        },
        filter(event, player) {
            if (event.type != 'discard' || event.getlx == false) return;
            var evt = event.getl(player);
            for (var i = 0; i < evt.cards2.length; i++) {
                if (get.position(evt.cards2[i]) == 'd') {
                    return true;
                }
            }
            return false;
        },
        direct: true,
        content() {
            'step 0'
            var cards = [];
            var evt = trigger.getl(player);
            for (var i = 0; i < evt.cards2.length; i++) {
                if (get.position(evt.cards2[i]) == 'd') {
                    cards.push(evt.cards2[i]);
                }
            }
            if (!cards.length) {
                event.finish();
            } else {
                event.cards = cards;
            }
            'step 1'
            if (event.cards.length) {
                player.chooseTarget(get.prompt('zshy_shenduan'), '将' + get.translation(event.cards) + (event.cards.length > 1 ? '中的一张牌' : '') + '当做【兵粮寸断】对一名其他角色使用', function (card, player, target) {
                    var cs = _status.event.cards;
                    for (var i = 0; i < cs.length; i++) {
                        if (player.canUse({ name: 'bingliang', cards: [cs[i]] }, target, false)) return true;
                    }
                    return false;
                }).set('ai', function (target) {
                    var player = _status.event.player;
                    return get.effect(target, { name: 'bingliang' }, player, player);
                }).set('cards', cards);
            } else {
                event.finish();
            }
            'step 2'
            if (result.bool && result.targets && result.targets.length) {
                event.current = result.targets[0];
                if (event.cards.length == 1) {
                    event.directCard = event.cards[0];
                } else {
                    delete event.directCard;
                    player
                        .chooseCardButton('选择一张牌当作兵断寸断使用', event.cards, true)
                        .set('filterButton', function (button) {
                            return player.canUse({ name: 'bingliang', cards: [button.link] }, _status.event.target, false);
                        })
                        .set('target', event.current);
                }
            } else {
                event.finish();
            }
            'step 3'
            var card;
            if (event.directCard) {
                card = event.directCard;
            } else if (result.links && result.links.length && event.cards.includes(result.links[0])) {
                card = result.links[0];
            }
            if (card) {
                event.cards.remove(card);
                player.line(event.current);
                player.useCard({ name: 'bingliang' }, event.current, [card], 'zshy_shenduan').animate = false;
                event.goto(1);
            }
        },
    },
    zshy_yonglve: {//勇略
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: ['phaseZhunbeiBegin'],
        },
        direct: true,
        filter(event, player) {
            return event.player != player;
        },
        content() {
            'step 0'
            jc = trigger.player.countCards('j') + 1;
            player.draw(jc);
            player.chooseBool(get.prompt('zshy_yonglve'), '是否对' + get.translation(trigger.player) + '使用' + jc + '张【杀】？').set('ai', function (event, player) {
                var player = _status.event.player;
                return get.effect(trigger.player, { name: 'sha' }, player, player) > 0;
            })
            'step 1'
            rb = false;
            if (result.bool) {
                rb = true;
                player.logSkill('zshy_yonglve');
            }
            else event.finish();
            'step 2'
            if (rb && jc > 0 && trigger.player.isIn()) {
                player.useCard({ name: 'sha', isCard: true }, trigger.player);
                jc--;
            }
            'step 3'
            if (jc > 0) event.goto(2);
        },
    },

    //墟陈群
    zshy_pindi: {//品第
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        filterTarget(card, player, target) {
            if (player.storage.zshy_pindi && player.storage.zshy_pindi.includes(target)) {
                return false;
            }
            return true;
        },
        content() {
            'step 0';
            if (!player.storage.zshy_pindi) {
                player.storage.zshy_pindi = [];
            }
            player.storage.zshy_pindi.push(target);
            event.num = player.getStat('skill').zshy_pindi;
            var evt = _status.event.getParent('phase');
            if (evt && evt.name == 'phase' && !evt.zshy_pindi) {
                var next = game.createEvent('zshy_pindi');
                _status.event.next.remove(next);
                evt.after.push(next);
                evt.zshy_pindi = true;
                next.player = player;
                next.setContent(lib.skill.zshy_pindi_clear.content);
            }
            player.syncStorage();
            player.chooseControlList(['令' + get.translation(target) + '摸' + get.cnNumber(event.num) + '张牌并回复1点体力', '令' + get.translation(target) + '弃置' + get.cnNumber(event.num) + '张牌并对其造成1点伤害'], function () {
                return _status.event.choice;
            }).set('choice', get.attitude(player, target) > 0 ? 0 : 1);
            'step 1'
            if (result.index == 0) {
                target.draw(event.num);
                target.recover();
            } else {
                target.chooseToDiscard(event.num, 'he', true);
                target.damage();
            }
            'step 2'
            if (target.isDamaged() && !player.isLinked()) {
                player.link(true);
            } else {
                player.link(false);
            }
        },
        ai: {
            order: 8,
            threaten: 1.8,
            result: {
                target(player, target) {
                    var att = get.attitude(player, target);
                    var num = (player.getStat('skill').zshy_pindi || 0) + 1;
                    if (att <= 0 && target.countCards('he') < num) return 0;
                    return get.sgn(att);
                },
            },
        },
        subSkill: {
            clear: {
                trigger: { player: 'phaseAfter' },
                charlotte: true,
                forced: true,
                silent: true,
                content() {
                    delete player.storage.zshy_pindi;
                },
            },
        },
    },
    zshy_faen: {//法恩
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: ['turnOverAfter', 'linkAfter'],
            player: 'damageEnd',
        },
        logTarget: 'player',
        locked: true,
        async cost(event, trigger, player) {
            let list = [
                `令${get.translation(trigger.player)}回复1点体力并摸一张牌`,
                `令${get.translation(trigger.player)}失去1点体力并弃置一张牌`
            ];
            const result = await player.chooseControlList(list)
                .set('prompt', get.translation(event.skill))
                .set('ai', function () {
                    if (get.attitude(player, trigger.player) > 0) {
                        return 0;
                    };
                    if (get.effect(trigger.player, { name: 'losehp' }, player, player) > 0) {
                        return 1;
                    };
                    return;
                })
                .forResult();
            event.result = {
                bool: true,
                cost_data: result.index,
            }
        },
        async content(event, trigger, player) {
            const { cost_data } = event;
            if (cost_data == 0) {
                trigger.player.recover();
                trigger.player.draw();
            } else {
                trigger.player.loseHp();
                trigger.player.chooseToDiscard('he', true);
            }
        },
        ai: {
            expose: 0.2,
        },
        global: 'zshy_faen_global',
        subSkill: {
            global: {
                ai: {
                    effect: {
                        target(card, player, target) {
                            if (card.name == 'tiesuo' && !target.isLinked()) return [1, 0.6 * game.countPlayer(cur => {
                                return (
                                    cur.hasSkill('faen') ||
                                    cur.hasSkill('oldfaen') ||
                                    cur.hasSkill('refaen') ||
                                    cur.hasSkill('dcfaen')
                                ) && get.attitude(target, cur) > 0;
                            })];
                        }
                    }
                }
            }
        },
    },

    zshy_benxi: {//奔袭
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'useCard2',
        },
        forced: true,
        mod: {
            globalFrom(from, to, distance) {
                if (_status.currentPhase == from) {
                    return distance - from.storage.zshy_benxi;
                }
            },
            wuxieRespondable(card, player, target, current) {
                if (player != current && player.storage.zshy_benxi_directHit.includes(card)) {
                    return false;
                }
            },
        },
        init(player) {
            player.storage.zshy_benxi_directHit = [];
            player.storage.zshy_benxi_damage = [];
            player.storage.zshy_benxi_unequip = [];
            player.storage.zshy_benxi = 0;
        },
        filter(trigger, player) {
            return (
                _status.currentPhase == player &&
                trigger.targets &&
                trigger.targets.length == 1 &&
                (get.name(trigger.card) == 'sha' || get.type(trigger.card) == 'trick')
            );
        },
        filterx(event, player) {
            var info = get.info(event.card);
            if (info.allowMultiple == false) return false;
            if (event.targets && !info.multitarget) {
                if (
                    game.hasPlayer(function (current) {
                        return lib.filter.targetEnabled2(event.card, player, current) && !event.targets.includes(current);
                    })
                ) {
                    return true;
                }
            }
            return false;
        },
        content() {
            'step 0';
            var list = ['为XXX多选择一个目标', '　令XXX无视防具牌　', '　令XXX不可被抵消　', '当XXX造成伤害时摸牌'],
                card = get.translation(trigger.card);
            for (var i = 0; i < list.length; i++) {
                list[i] = [i, list[i].replace(/XXX/g, card)];
            }
            var next = player.chooseButton(['奔袭：请选择一至三项', [list.slice(0, 2), 'tdnodes'], [list.slice(2, 4), 'tdnodes']]);
            next.set('forced', true);
            next.set('selectButton', [1, 3]);
            next.set('filterButton', function (button) {
                if (button.link == 0) {
                    return _status.event.bool1;
                }
                return true;
            });
            next.set('bool1', lib.skill.zshy_benxi.filterx(trigger, player));
            next.set('ai', function (button) {
                var player = _status.event.player;
                var event = _status.event.getTrigger();
                switch (button.link) {
                    case 0: {
                        if (game.hasPlayer(function (current) {
                            return lib.filter.targetEnabled2(event.card, player, current) && !event.targets.includes(current) && get.effect(current, event.card, player, player) > 0;
                        })) return 1.6 + Math.random();
                        return 0;
                    }
                    case 1: {
                        if (event.targets.filter(function (current) {
                            var eff1 = get.effect(current, event.card, player, player);
                            player._zshy_benxi_ai = true;
                            var eff2 = get.effect(current, event.card, player, player);
                            delete player._zshy_benxi_ai;
                            return eff1 > eff2;
                        }).length) return 1.9 + Math.random();
                        return Math.random();
                    }
                    case 2: {
                        var num = 1.3;
                        if (get.name(event.card) == 'sha' && event.targets.filter(function (current) {
                            if (current.mayHaveShan(player, 'use', current.getCards('h', i => {
                                return i.hasGaintag('sha_notshan');
                            })) && get.attitude(player, current) <= 0) {
                                if (current.hasSkillTag('useShan')) num = 1.9;
                                return true;
                            } return false;
                        }).length) return num + Math.random();
                        return 0.5 + Math.random();
                    }
                    case 3: {
                        return (get.tag(event.card, 'damage') || 0) + Math.random();
                    }
                }
            });
            'step 1';
            var map = [
                function (trigger, player, event) {
                    player.chooseTarget('请选择' + get.translation(trigger.card) + '的额外目标', true, function (card, player, target) {
                        var player = _status.event.player;
                        if (_status.event.targets.includes(target)) return false;
                        return lib.filter.targetEnabled2(_status.event.card, player, target);
                    }).set('targets', trigger.targets).set('card', trigger.card).set('ai', function (target) {
                        var trigger = _status.event.getTrigger();
                        var player = _status.event.player;
                        return get.effect(target, trigger.card, player, player);
                    });
                },
                function (trigger, player, event) {
                    player.storage.zshy_benxi_unequip.add(trigger.card);
                },
                function (trigger, player, event) {
                    player.storage.zshy_benxi_directHit.add(trigger.card);
                    trigger.nowuxie = true;
                    trigger.customArgs.default.directHit2 = true;
                },
                function (trigger, player, event) {
                    player.storage.zshy_benxi_damage.add(trigger.card);
                },
            ];
            for (var i = 0; i < result.links.length; i++) {
                game.log(player, '选择了', '#g【奔袭】', '的', '#y选项' + get.cnNumber(result.links[i] + 1, true));
                map[result.links[i]](trigger, player, event);
            }
            if (!result.links.includes(0)) event.finish();
            'step 2';
            if (result.targets) {
                player.line(result.targets);
                trigger.targets.addArray(result.targets);
            }
        },
        ai: {
            unequip: true,
            unequip_ai: true,
            directHit_ai: true,
            skillTagFilter(player, tag, arg) {
                if (tag == 'unequip') {
                    if (arg && player.storage.zshy_benxi_unequip.includes(arg.card)) return true;
                    return false;
                }
                if (
                    _status.currentPhase != player ||
                    game.hasPlayer(function (current) {
                        return get.distance(player, current) > 1;
                    })
                )
                    return false;
                if (tag == 'directHit_ai') return arg.card.name == 'sha';
                if (!arg || !arg.card || (arg.card.name != 'sha' && arg.card.name != 'chuqibuyi')) return false;
                var card = arg.target.getEquip(2);
                if (card && card.name.indexOf('bagua') !== -1) return true;
                if (player._zshy_benxi_ai) return false;
            },
        },
        group: ['zshy_benxi_summer', 'zshy_benxi_damage', 'zshy_benxi_damage1'],
        subSkill: {
            damage: {
                trigger: { global: 'damageBegin1' },
                forced: true,
                filter(event, player) {
                    return event.card && player.storage.zshy_benxi_damage.includes(event.card);
                },
                content() {
                    player.draw();
                },
            },
            summer: {
                trigger: { player: ['phaseAfter', 'useCardAfter', 'useCard'] },
                silent: true,
                filter(event, player) {
                    return player == _status.currentPhase;
                },
                content() {
                    if (trigger.name == 'phase') {
                        player.storage.zshy_benxi = 0;
                        return;
                    } else if (event.triggername == 'useCard') {
                        player.logSkill('zshy_benxi');
                        player.storage.zshy_benxi++;
                        player.syncStorage('zshy_benxi');
                        return;
                    } else {
                        player.storage.zshy_benxi_unequip.remove(event.card);
                        player.storage.zshy_benxi_directHit.remove(event.card);
                        player.storage.zshy_benxi_damage.remove(event.card);
                    }
                },
            },
            damage1: {
                trigger: {
                    source: 'damageBegin4',
                },
                forced: true,
                filter(trigger, player) {
                    return !game.hasPlayer(function (current) {
                        return get.distance(player, current) > 1;
                    });
                },
                content() {
                    trigger.num++;
                },
            },
        },
    },

    zshy_zhongyong: {//忠勇
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: 'useCardAfter' },
        direct: true,
        onremove: true,
        intro: {
            content: '已发动过的目标：$',
            onunmark: true,
        },
        filter(event, player) {
            return get.name(event.card) == 'sha' && game.countPlayer(function (current) {
                return !player.getStorage('zshy_zhongyong').includes(current);
            }) > 0;
        },
        content() {
            'step 0';
            event.cards = trigger.cards.filterInD();
            game.countPlayer2(function (current) {
                current.getHistory('useCard', function (evt) {
                    if (evt.card.name == 'shan' && evt.getParent(3) == trigger) event.cards.addArray(evt.cards.filterInD('od'));
                });
            });
            if (!event.cards.length) event.finish();
            player.chooseTarget(get.prompt2('zshy_zhongyong'), '令一名本回合未以此法选择的角色获得' + get.translation(event.cards), function (card, player, target) {
                return !player.getStorage('zshy_zhongyong').includes(target);
            }).set('ai', function (target) {
                return get.attitude(_status.event.player, target);
            }).set('source', trigger.targets);
            'step 1';
            if (result.bool) {
                var target = result.targets[0];
                player.logSkill('zshy_zhongyong', target);
                target.gain(cards, 'gain2');
                if (!player.getStorage('zshy_zhongyong').includes(target)) {
                    player.markAuto('zshy_zhongyong', [target]);
                };
                var red = false,
                    black = false;
                for (var i of cards) {
                    var color = get.color(i, false);
                    if (color == 'red') red = true;
                    if (color == 'black') black = true;
                    if (red && black) break;
                }
                if (red) {
                    target.recover();
                }
                if (black) {
                    target.draw();
                }
            }
        },
        group: ['zshy_zhongyong_Delete'],
        subSkill: {
            Delete: {
                trigger: {
                    global: 'phaseEnd',
                },
                popup: false,
                silent: true,
                forced: true,
                firstDo: true,
                content() {
                    player.unmarkSkill('zshy_zhongyong');
                },
            },
        },
    },

    zshy_qiangshi: {//强识
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: ['roundStart'],
            player: ['phaseBegin'],
        },
        direct: true,
        content() {
            'step 0'
            player.logSkill('zshy_qiangshi');
            var list = [
                'basic', 'trick', 'equip'
            ];
            player.chooseControl(list).set('ai', function () {
                return ['basic', 'trick'].randomGet();
            }).set('prompt', '强识：选择一个牌型类别');
            'step 1'
            if (result.control) {
                player.storage.zshy_qiangshi_draw = result.control;
                game.addVideo('storage', player, ['zshy_qiangshi_draw', player.storage.zshy_qiangshi_draw]);
                player.addTempSkill('zshy_qiangshi_draw', { global: 'roundStart' });
            }
        },
        subSkill: {
            draw: {
                audio: 'zshy_qiangshi',
                trigger: { player: 'useCard' },
                frequent: true,
                popup: false,
                charlotte: true,
                prompt: '是否执行【强识】的效果选择回复1点体力或摸一张牌？',
                sourceSkill: 'zshy_qiangshi',
                filter(event, player) {
                    return get.type(event.card, 'trick') == player.storage.zshy_qiangshi_draw;
                },
                content() {
                    player.logSkill('zshy_qiangshi');
                    //player.chooseDrawRecover(true);
                    player.recover();
                    player.draw();
                },
                onremove: true,
                mark: true,
                intro: {
                    content(type) {
                        return get.translation(type) + '牌';
                    },
                },
            },
        },
    },
    zshy_xiantu: {//献图
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: 'phaseUseBegin' },
        sourceSkill: 'zshy_xiantu',
        filter(event, player) {
            return event.player != player;
        },
        logTarget: 'player',
        prompt2: '摸四张牌，然后交给其两张牌。若该角色于本回合阶段时未杀死过角色，则你失去1点体力。',
        check(event, player) {
            if (get.attitude(player, event.player) < 5) return false;
            if (player.maxHp - player.hp >= 2) return false;
            if (player.hp == 1) return false;
            if (player.hp == 2 && player.countCards('h') < 2) return false;
            if (event.player.countCards('h') >= event.player.hp) return false;
            return true;
        },
        content() {
            'step 0';
            if (get.mode() !== 'identity' || player.identity !== 'nei') player.addExpose(0.2);
            player.draw(4);
            'step 1';
            player.chooseCard(2, 'he', true, '交给' + get.translation(trigger.player) + '两张牌').set('ai', function (card) {
                if (ui.selected.cards.length && card.name == ui.selected.cards[0].name) return -1;
                if (get.tag(card, 'damage')) return 1;
                if (get.type(card) == 'equip') return 1;
                return 0;
            });
            'step 2';
            player.give(result.cards, trigger.player);
            trigger.player.addSkill('zshy_xiantu_draw');
            trigger.player.storage.zshy_xiantu_draw.push(player);
        },
        ai: {
            threaten: 1.1,
        },
        subSkill: {
            draw: {
                trigger: { player: 'phaseUseEnd' },
                forced: true,
                audio: false,
                onremove: true,
                sourceSkill: 'zshy_xiantu',
                init(player, skill) {
                    if (!player.storage[skill]) player.storage[skill] = [];
                },
                charlotte: true,
                content() {
                    while (player.storage.zshy_xiantu_draw.length) {
                        var current = player.storage.zshy_xiantu_draw.shift();
                        if (current.isDead()) continue;
                        current.logSkill('zshy_xiantu');
                        current.loseHp();
                    }
                    player.removeSkill('zshy_xiantu_draw');
                },
                group: 'zshy_xiantu_delete',
            },
            delete: {
                trigger: { source: 'dieAfter' },
                forced: true,
                audio: false,
                sourceSkill: 'zshy_xiantu',
                content() {
                    player.removeSkill('zshy_xiantu_draw');
                },
            },
        },
    },

    zshy_pihui: {//谮毁
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'useCardToPlayer' },
        filter(event, player) {
            if (event.targets.length > 1) return false;
            var card = event.card;
            if (card.name == 'sha' || get.type(card) == 'trick') return true;
            return false;
        },
        direct: true,
        content() {
            'step 0'
            player.chooseTarget(get.prompt2('zshy_pihui'), function (card, player, target) {
                if (player == target) return false;
                var trigger = _status.event;
                return player.canUse(trigger.card, target, false) && trigger.targets.includes(target) == false;
            }).set('ai', function (target) {
                var trigger = _status.event.getTrigger();
                var player = _status.event.player;
                return get.effect(target, trigger.card, player, player) + 0.01;
            }).set('targets', trigger.targets).set('card', trigger.card);
            'step 1'
            if (result.bool) {
                event.target = result.targets[0];
            } else {
                event.finish();
            }
            'step 2'
            player.logSkill('zshy_pihui', event.target);
            event.target.chooseCard('交给' + get.translation(player) + '一张牌，或成为' + get.translation(trigger.card) + '的额外目标', 'he').set('ai', function (card) {
                return 5 - get.value(card);
            });
            'step 3'
            if (result.bool) {
                target.give(result.cards, player);
                trigger.untrigger();
                trigger.getParent().player = event.target;
                game.log(event.target, '成为了', trigger.card, '的使用者');
            } else {
                game.log(event.target, '成为了', trigger.card, '的额外目标');
                trigger.getParent().targets.push(event.target);
            }
        },
    },
    zshy_jiaojin: {//骄矜
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { target: 'useCardToTargeted' },
        filter(event, player) {
            return (
                (get.name(event.card) == 'sha' || get.type(event.card) == 'trick') &&
                event.player != player &&
                player.countCards('he', function (card) {
                    return _status.connectMode || get.type(card) == 'equip' || get.type(card) == get.type(event.card);
                })
            );
        },
        direct: true,
        content() {
            'step 0';
            var next = player.chooseToDiscard('he', '骄矜：是否弃置一张装备牌或非同类型牌，令' + get.translation(trigger.card) + '对你无效？', function (card, player) {
                return get.type(card) == 'equip' || get.type(card) != get.type(trigger.card);
            });
            next.set('ai', function (card) {
                if (_status.event.goon2) {
                    return 3 + _status.event.val - get.value(card);
                }
                return 0;
            });
            next.set('val', get.value(trigger.cards.filterInD()));
            next.set('goon2', get.effect(player, trigger.card, trigger.player, player) < 0);
            next.logSkill = ['zshy_jiaojin', trigger.player];
            'step 1';
            if (result.bool) {
                var cards = trigger.cards.filterInD();
                if (cards.length) player.gain(cards, 'gain2', 'log');
                trigger.excluded.push(player);
            }
        },
    },

    zshy_fenli: {//奋励
        audio: 'ext:诸神寰宇/audio/character:2',
        group: ['zshy_fenli_judge', 'zshy_fenli_draw', 'zshy_fenli_use', 'zshy_fenli_discard'],
        subfrequent: ['discard'],
        subSkill: {
            judge: {
                audio: 'zshy_fenli',
                trigger: { player: 'phaseJudgeBefore' },
                prompt: '是否发动〖奋励〗跳过判定阶段？',
                check(event, player) {
                    if (!player.hasSkill('zshy_pingkou') || player.getHistory('skipped').length > 0) return false;
                    return game.hasPlayer(function (current) {
                        return get.attitude(player, current) < 0 && get.damageEffect(current, player, player) > 0;
                    }) || player.countCards('j') > 0;
                },
                content() {
                    trigger.cancel();
                    player.chooseDrawRecover(true);
                },
            },
            draw: {
                audio: 'zshy_fenli',
                trigger: { player: 'phaseDrawBefore' },
                prompt: '是否发动〖奋励〗跳过摸牌阶段？',
                check(event, player) {
                    if (!player.hasSkill('zshy_pingkou') || player.getHistory('skipped').length > 0) return false;
                    return game.hasPlayer(function (current) {
                        return get.attitude(player, current) < 0 && current.hp == 1 && get.damageEffect(current, player, player) > 0;
                    });
                },
                content() {
                    trigger.cancel();
                    player.chooseDrawRecover(true);
                },
            },
            use: {
                audio: 'zshy_fenli',
                trigger: { player: 'phaseUseBefore' },
                prompt: '是否发动〖奋励〗跳过出牌阶段？',
                check(event, player) {
                    if (!player.hasSkill('zshy_pingkou')) return false;
                    if (!player.needsToDiscard()) return true;
                    if (player.getHistory('skipped').length > 0) return false;
                    return game.hasPlayer(function (current) {
                        return get.attitude(player, current) < 0 && current.hp == 1 && get.damageEffect(current, player, player) > 0;
                    });
                },
                content() {
                    trigger.cancel();
                    player.chooseDrawRecover(true);
                },
            },
            discard: {
                audio: 'zshy_fenli',
                trigger: { player: 'phaseDiscardBefore' },
                prompt: '是否发动〖奋励〗跳过弃牌阶段？',
                frequent: true,
                content() {
                    trigger.cancel();
                    player.chooseDrawRecover(true);
                },
            },
        },
        ai: {
            combo: 'zshy_pingkou'
        },
    },
    zshy_pingkou: {//平寇
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: 'phaseEnd' },
        direct: true,
        filter(event, player) {
            return event.player.getHistory('skipped').length > 0;
        },
        content() {
            'step 0'
            player.draw(trigger.player.getHistory('skipped').length);
            player.chooseTarget([1, trigger.player.getHistory('skipped').length], get.prompt2('zshy_pingkou'), function (card, player, target) {
                return target != player;
            }).set('ai', function (target) {
                var player = _status.event.player;
                return get.damageEffect(target, player, player);
            });
            'step 1'
            if (result.bool) {
                player.logSkill('zshy_pingkou', result.targets);
                event.targets = result.targets.slice(0).sortBySeat();
            } else {
                event.finish();
            }
            'step 2'
            if (event.targets && event.targets.length) {
                event.targets.shift().damage();
                event.redo();
            }
        },
        ai: {
            effect: {
                target(card) {
                    if (card.name == 'lebu' || card.name == 'bingliang') return 0.5;
                },
            },
            combo: 'zshy_fenli'
        },
    },

    zshy_shenxing: {//慎行
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        position: 'he',
        filterCard: true,
        selectCard: 2,
        prompt: '弃置两张牌并摸一张牌，然后你选择一名角色，令其回复1点体力',
        check(card) {
            var player = _status.event.player;
            var red = 0,
                black = 0,
                hs = player.getCards('h');
            for (var i of hs) {
                if (ui.selected.cards.includes(i)) continue;
                var color = get.color(i, player);
                if (color == 'red') red++;
                if (color == 'black') black++;
            }
            if (red > 2 && black > 2) return 7 - get.value(card);
            if (red == 0 || black == 0) return 8 - get.value(card);
            var color = get.color(card);
            if (black <= red) return (color == 'black' && get.position(card) == 'h' ? 8 : 4) - get.value(card);
            return (color == 'red' && get.position(card) == 'h' ? 8 : 4) - get.value(card);
        },
        filter(event, player) {
            return player.countCards('h') > 2;
        },
        content() {
            'step 0'
            player.draw();
            'step 1'
            if (game.countPlayer(function (current) {
                return current.isDamaged();
            }) > 0) {
                player.chooseTarget('选择一名角色，令其回复1点体力', function (event, player, target) {
                    return target.isDamaged();
                }).set('ai', function (target) {
                    var player = _status.event.player;
                    return get.recoverEffect(target, player, player);
                });
            } else event.finish();
            'step 2'
            if (result.targets) {
                result.targets[0].recover();
            }
        },
        ai: {
            order: 9,
            result: {
                player(player, target) {
                    if (!ui.selected.cards.length) return 1;
                    var red = 0,
                        black = 0,
                        hs = player.getCards('h');
                    for (var i of hs) {
                        if (ui.selected.cards.includes(i)) continue;
                        var color = get.color(i);
                        if (color == 'red') red++;
                        if (color == 'black') black++;
                    }
                    var val = 0;
                    for (var i of ui.selected.cards) val += get.value(i, player);
                    if (red == 0 || black == 0) {
                        if (red + black == 0) return 0;
                        var num =
                            Math.min(
                                red + black,
                                game.countPlayer(function (current) {
                                    return current != player && get.attitude(player, current) > 0 && !current.hasSkillTag('nogain');
                                })
                            ) + 1;
                        if (num * 7 > val) return 1;
                    }
                    if (val < 8) return 1;
                    return 0;
                },
            },
        },
    },
    zshy_bingyi: {//秉壹
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'loseAfter',
            global: 'loseAsyncAfter',
        },
        filter(event, player) {
            return event.type == 'discard' && event.getl(player).cards2.length > 0 && player.countCards('h') > 0;
        },
        prompt2(event, player) {
            var str = '展示所有手牌，然后',
                hs = player.getCards('h');
            var color = get.color(hs);
            if (color == 'none') return str + '回复1点体力或摸一张牌';
            str += '回复1点体力或摸一张牌并令至多' + get.cnNumber(hs.length) + '名其他角色回复1点体力或摸一张牌';
            return str;
        },
        check(event, player) {
            var color = get.color(player.getCards('h'));
            return color != 'none' && player.isHealthy();
        },
        content() {
            'step 0'
            player.showHandcards(get.translation(player) + '发动了【秉壹】');
            if (get.color(player.getCards('h')) == 'none') player.chooseDrawRecover(true), event.finish();
            'step 1'
            var num = player.countCards('h');
            player.chooseDrawRecover(true)
            player.chooseTarget([1, num], '令至多' + get.cnNumber(num) + '名角色也各摸一张牌', lib.filter.notMe).set('ai', function (target) {
                var player = _status.event.player;
                var att = get.attitude(player, target) / Math.sqrt(1 + target.countCards('h'));
                if (target.hasSkillTag('nogain')) att /= 10;
                return att;
            });
            'step 2'
            if (result.targets) {
                for (i = 0; i < result.targets.length; i++) {
                    result.targets[i].chooseDrawRecover(true);
                };
            };
        },
    },

    zshy_jianying: {//渐营
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'useCard' },
        frequent: true,
        locked: false,
        firstDo: true,
        getLastUsed(player, event) {
            var history = player.getAllHistory('useCard');
            var index;
            if (event) index = history.indexOf(event) - 1;
            else index = history.length - 1;
            if (index >= 0) return history[index];
            return false;
        },
        filter(event, player) {
            var evt = lib.skill.zshy_jianying.getLastUsed(player, event);
            if (!evt || !evt.card) return false;
            return (lib.suit.includes(get.suit(evt.card)) && get.suit(evt.card) == get.suit(event.card)) || (typeof get.number(evt.card, false) == 'number' && get.number(evt.card, false) == get.number(event.card));
        },
        async content(event, trigger, player) {
            player.draw(2);
            player.chooseToDiscard('he', true);
        },
        init(player) {
            let history = player.getAllHistory('useCard');
            if (history.length) {
                var trigger = history[history.length - 1];
                if (get.suit(trigger.card, player) == 'none' || typeof get.number(trigger.card, player) != 'number') return;
                player.storage.zshy_jianying_mark = trigger.card;
                player.markSkill('zshy_jianying_mark');
                game.broadcastAll(
                    function (player, suit) {
                        if (player.marks.zshy_jianying_mark) player.marks.zshy_jianying_mark.firstChild.innerHTML = get.translation(suit);
                    },
                    player,
                    get.suit(trigger.card, player)
                );
            }
        },
        mod: {
            aiOrder(player, card, num) {
                if (typeof card == 'object' && player.isPhaseUsing()) {
                    var evt = lib.skill.zshy_jianying.getLastUsed(player);
                    if (evt && evt.card && ((get.suit(evt.card) && get.suit(evt.card) == get.suit(card)) || (evt.card.number && evt.card.number == get.number(card)))) {
                        return num + 10;
                    }
                }
            },
        },
        group: ['zshy_jianying_mark', 'zshy_jianying_recast'],
        subSkill: {
            mark: {
                charlotte: true,
                trigger: { player: 'useCard1' },
                forced: true,
                popup: false,
                firstDo: true,
                content() {
                    if (get.suit(trigger.card, player) == 'none' || typeof get.number(trigger.card, player) != 'number') player.unmarkSkill('zshy_jianying_mark');
                    else {
                        player.storage.zshy_jianying_mark = trigger.card;
                        player.markSkill('zshy_jianying_mark');
                        game.broadcastAll(
                            function (player, suit) {
                                if (player.marks.zshy_jianying_mark) player.marks.zshy_jianying_mark.firstChild.innerHTML = get.translation(suit);
                            },
                            player,
                            get.suit(trigger.card, player)
                        );
                    }
                },
                intro: {
                    markcount(card, player) {
                        return get.strNumber(get.number(card, player));
                    },
                    content(card, player) {
                        var suit = get.suit(card, player);
                        var num = get.number(card, player);
                        var str = '<li>上一张牌的花色：' + get.translation(suit);
                        str += '<br><li>上一张牌的点数：' + get.strNumber(num);
                        return str;
                    },
                },
            },
            recast: {
                trigger: {
                    player: 'useCard',
                },
                direct: true,
                content() {
                    'step 0'
                    player.chooseCard('he', '是否重铸至多三张牌？', [1, 3]).set('ai', function (card) {
                        return 7 - get.value(card);
                    });
                    'step 1'
                    if (result.bool) {
                        player.logSkill('zshy_jianying');
                        player.recast(result.cards);
                    };
                },
            },
        },
    },
    zshy_shibei: {//矢北
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'damageEnd' },
        forced: true,
        check(event, player) {
            return player.getHistory('damage').indexOf(event) % 2 == 0;
        },
        filter(event, player) {
            var index = player.getHistory('damage').indexOf(event);
            return index % 2 == 0 || index % 2 == 1;
        },
        content() {
            var index = player.getHistory('damage').indexOf(trigger);
            if (index % 2 == 1) {
                player.loseHp(trigger.num);
                player.draw();
            } else {
                player.recover(trigger.num);
                player.draw();
            }
        },
        subSkill: {
            damaged: {},
            ai: {},
        },
        ai: {
            maixie_defend: true,
            threaten: 0.9,
            effect: {
                target(card, player, target) {
                    if (player.hasSkillTag('jueqing', false, target)) return;
                    if (target.hujia) return;
                    if (player._shibei_tmp) return;
                    if (target.hasSkill('shibei_ai')) return;
                    if (_status.event.getParent('useCard', true) || _status.event.getParent('_wuxie', true)) return;
                    if (get.tag(card, 'damage')) {
                        if (target.getHistory('damage').length > 0) {
                            return [1, -2];
                        } else {
                            if (get.attitude(player, target) > 0 && target.hp > 1) {
                                return 0;
                            }
                            if (
                                get.attitude(player, target) < 0 &&
                                !player.hasSkillTag('damageBonus', 'e', {
                                    target: target,
                                    card: card,
                                })
                            ) {
                                if (card.name == 'sha') return;
                                var sha = false;
                                player._shibei_tmp = true;
                                var num = player.countCards('h', function (card) {
                                    if (card.name == 'sha') {
                                        if (sha) {
                                            return false;
                                        } else {
                                            sha = true;
                                        }
                                    }
                                    return get.tag(card, 'damage') && player.canUse(card, target) && get.effect(target, card, player, player) > 0;
                                });
                                delete player._shibei_tmp;
                                if (player.hasSkillTag('damage')) {
                                    num++;
                                }
                                if (num < 2) {
                                    var enemies = player.getEnemies();
                                    if (enemies.length == 1 && enemies[0] == target && player.needsToDiscard()) {
                                        return;
                                    }
                                    return 0;
                                }
                            }
                        }
                    }
                },
            },
        },
    },

    zshy_qieting: {//窃听
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: ['phaseEnd'],
        },
        filter(event, player) {
            return event.player != player;
        },
        async cost(event, trigger, player) {
            const target = trigger.player;
            const next = player.chooseButton(['窃听：请选择一至两项', [[[
                'move', '将' + get.translation(target) + '装备区的一张牌置于你的装备区'],
            ['draw', '选择回复1点体力或摸一张牌']], 'textbutton']]);
            next.set('selectButton', [1, 2]);
            next.set('filterButton', button => {
                if (button.link == 'move' &&
                    !get.event().getTrigger().player.countCards('e', card => {
                        return get.player().canEquip(card);
                    })
                ) {
                    return false;
                }
                return true;
            });
            next.set('ai', button => {
                const target = get.event().getTrigger().player,
                    val = target.hasSkillTag('noe') ? 6 : 0,
                    player = get.player();
                if (
                    button.link == 'move' &&
                    (get.attitude(player, target) > 0 ||
                        !target.countCards('e', function (card) {
                            return player.canEquip(card) && get.value(card, target) > val && get.effect(player, card, player, player) > 0;
                        }))
                ) {
                    return 0;
                }
                return 1;
            });
            const { bool, links } = await next.forResult();
            event.result = {
                bool: bool,
                cost_data: links,
            };
        },
        logTarget: 'player',
        async content(event, trigger, player) {
            const target = trigger.player,
                choices = event.cost_data;
            if (choices.includes('move')) {
                const { cards } = await player
                    .choosePlayerCard(target, 'e', true)
                    .set('filterButton', button => {
                        return get.player().canEquip(button.link);
                    })
                    .set('ai', button => {
                        const player = get.player();
                        return get.effect(player, button.link, player, player);
                    })
                    .forResult();
                const card = cards[0];
                target.$give(card, player, false);
                await game.delay(0.5);
                await player.equip(card);
            }
            if (choices.includes('draw')) {
                await player.chooseDrawRecover(true);
            }
        },
    },
    zshy_xianzhou: {//献州
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        filter(event, player) {
            return player.countCards('e') > 0;
        },
        filterCard: true,
        position: 'e',
        selectCard: -1,
        filterTarget: lib.filter.notMe,
        discard: false,
        lose: false,
        delay: false,
        content() {
            'step 0';
            player.give(cards, target);
            player.chooseDrawRecover(cards.length, true);
            'step 1';
            var list = game.filterPlayer(function (current) {
                return current != target;
            });
            if (list.length) {
                var max = Math.min(list.length, cards.length);
                target.chooseTarget(true, [1, max], '对至多' + get.cnNumber(max) + '名其他角色各造成1点伤害', function (card, player, target) {
                    return _status.event.list.includes(target);
                }).set('list', list).set('ai', function (target) {
                    var player = _status.event.player;
                    return get.damageEffect(target, player, player);
                });
            } else event.finish();
            'step 2';
            if (result.bool) {
                var targets = result.targets.sortBySeat();
                player.line(targets, 'green');
                for (var i of targets) i.damage('nocard', cards.length);
            }
        },
        ai: {
            order: 1,
            result: {
                target: 1,
                player(player) {
                    var bool = true,
                        players = game.filterPlayer();
                    for (var i = 0; i < players.length; i++) {
                        if (players[i] != player && get.attitude(player, players[i]) > 2 && get.attitude(players[i], player) > 2) {
                            bool = false;
                            break;
                        }
                    }
                    if (bool) return -10;
                    if (player.hp == 1) return 1;
                    if (game.phaseNumber < game.players.length) return -10;
                    if (player.countCards('e') + player.hp <= player.maxHp) return 1;
                    return -10;
                },
            },
        },
    },

};
const 一将成名2015 = {
    zshy_huituo: {//恢拓
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'damageEnd' },
        direct: true,
        content() {
            'step 0'
            event.num = trigger.num;
            'step 1'
            var forced = event.forced === undefined ? false : event.forced;
            var info = get.skillInfoTranslation('zshy_huituo', player);
            var str = `###${forced ? '恢拓：请选择一名角色' : get.prompt('zshy_huituo')}###令一名角色判定。若结果为红色，其回复1点体力；若结果为黑色，其摸${get.cnNumber(trigger.num)}张牌`;
            player.chooseTarget(str, event.forced).set('ai', function (target) {
                var player = _status.event.player;
                if (get.attitude(player, target) > 0) {
                    return get.recoverEffect(target, player, player) + 1;
                }
                return 0;
            });
            'step 2'
            if (result.bool) {
                player.logSkill('zshy_huituo', result.targets);
                event.num--;
                var target = result.targets[0];
                event.target = target;
                target.judge(function (card) {
                    if (target.hp == target.maxHp) {
                        if (get.color(card) == 'red') return -1;
                    }
                    if (get.color(card) == 'red') return 1;
                    return 0;
                });
            } else {
                event.finish();
            }
            'step 3'
            switch (result.color) {
                case 'red':
                    if (event.target.hp < event.target.maxHp) event.target.recover();
                    break;

                case 'black':
                    event.target.draw(trigger.num);
                    break;

                default:
                    break;
            }
            if (event.num > 0) event.goto(1);
        },
        ai: {
            maixie: true,
            maixie_hp: true,
        },
    },
    zshy_mingjian: {//明鉴
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        filterTarget(card, player, target) {
            return player != target && !target.hasSkill('zshy_mingjian_card');
        },
        filter(event, player) {
            return player.countCards('h') > 0;
        },
        filterCard: true,
        selectCard: [1, Infinity],
        discard: false,
        lose: false,
        delay: false,
        check(card) {
            //AI 限给 2 张，避免清空自己手牌
            if (ui.selected.cards.length >= 2) return -1;
            return 8 - get.value(card);
        },
        content() {
            player.recover();
            player.give(cards, target);
            target.addTempSkill('zshy_mingjian_card', { player: 'phaseAfter' });
            target.storage.zshy_mingjian_card += cards.length;
            target.updateMarks('zshy_mingjian_card');
        },
        ai: {
            order: 1,
            result: {
                target(player, target) {
                    if (target.hasSkillTag('nogain')) return 0;
                    if (player.countCards('h') == player.countCards('h', 'du')) return -1;
                    if (target.hasJudge('lebu')) return 0;
                    if (get.attitude(player, target) > 3) {
                        var basis = get.threaten(target);
                        if (player == get.zhu(player) && player.hp <= 2 && player.countCards('h', 'shan') &&
                            !game.hasPlayer(function (current) {
                                return get.attitude(current, player) > 3 && current.countCards('h', 'tao') > 0;
                            })) return 0;
                        if (target.countCards('h') + player.countCards('h') > target.hp + 2) return basis * 0.8;
                        return basis;
                    }
                    return 0;
                },
            },
        },
        subSkill: {
            card: {
                charlotte: true,
                mark: true,
                markimage: 'extension/诸神寰宇/other/Files/Mark/zshy_mingjian.png',
                intro: {
                    content: '手牌上限+#，出杀次数+#',
                },
                init(player, skill) {
                    if (!player.storage[skill]) player.storage[skill] = 0;
                },
                onremove: true,
                mod: {
                    maxHandcard(player, num) {
                        return num + player.storage.zshy_mingjian_card;
                    },
                    cardUsable(card, player, num) {
                        if (card.name == 'sha') return num + player.storage.zshy_mingjian_card;
                    },
                },
            },
        },
    },
    zshy_xingshuai: {//兴衰
        audio: 'ext:诸神寰宇/audio/character:2',
        skillAnimation: true,
        animationColor: 'thunder',
        trigger: { player: 'dying' },
        zhuSkill: true,
        filter(event, player) {
            if (player.hp > 0) return false;
            if (!player.hasZhuSkill('zshy_xingshuai')) return false;
            return game.hasPlayer(function (current) {
                return current != player && current.group == 'wei';
            });
        },
        mark: true,
        unique: true,
        limited: true,
        content() {
            'step 0';
            player.awakenSkill('zshy_xingshuai');
            var targets = game.filterPlayer();
            targets.remove(player);
            event.targets = targets;
            event.damages = [];
            'step 1';
            if (event.targets.length) {
                var current = event.targets.shift();
                if (current.group == 'wei') {
                    player.recover();
                    current.chooseBool('是否令' + get.translation(player) + '增加1点体力上限并回复1点体力？')
                        .set('ai', function () {
                            return get.attitude(_status.event.player, _status.event.target) > 2;
                        })
                        .set('target', player);
                    event.current = current;
                } else {
                    event.redo();
                }
            } else {
                event.goto(3);
            }
            'step 2';
            if (result.bool) {
                event.damages.push(event.current);
                event.current.line(player, 'green');
                game.log(event.current, '令', player, '增加1点体力上限并回复1点体力');
                player.gainMaxHp();
                player.recover();
            }
            if (event.targets.length) {
                event.goto(1);
            }
            'step 3';
            if (event.damages.length) {
                var next = game.createEvent('zshy_xingshuai_next');
                event.next.remove(next);
                trigger.after.push(next);
                next.targets = event.damages;
                next.setContent(function () {
                    targets.shift().damage();
                    if (targets.length) event.redo();
                });
            }
        },
    },

    zshy_qianju: {//千驹
        mod: {
            globalFrom(from, to, distance) {
                return distance - Math.min(1, from.getDamagedHp());
            },
        },
    },
    zshy_qingxi: {//倾袭
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'useCardToPlayered' },
        filter(event, player) {
            return get.name(event.card) == 'sha' || get.name(event.card) == 'juedou';
        },
        check(event, player) {
            return get.attitude(player, event.target) < 0;
        },
        logTarget: 'target',
        content() {
            'step 0'
            var num = game.countPlayer(function (current) {
                return player.inRange(current);
            });
            trigger.target.chooseToDiscard(num, '弃置' + get.cnNumber(num) + '张手牌', true).set('ai', function (card) {
                var player = _status.event.player;
                if (player.hp == 1) {
                    if (get.type(card) == 'basic') {
                        return 8 - get.value(card);
                    } else {
                        return 10 - get.value(card);
                    }
                }
            });
            'step 1'
            var id = trigger.target.playerid;
            var map = trigger.customArgs;
            if (!map[id]) map[id] = {};
            if (!map[id].extraDamage) map[id].extraDamage = 0;
            map[id].extraDamage++;
            player.judge(function (card) {
                if (get.color(card) == 'red') return 1;
                return 0;
            }).judge2 = function (result) {
                return result.bool;
            };
            'step 2'
            if (result.color == 'red') trigger.directHit.add(trigger.target);
        },
    },

    zshy_huomo: {//活墨
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: ['chooseToUse', 'chooseToRespond'],
        hiddenCard(player, name) {
            if (get.type(name) != 'basic') return false;
            return player.hasCard(function (card) {
                return get.type(card) != 'basic';
            }, 'he');
        },
        filter(event, player) {
            if (event.type == 'wuxie' || !player.hasCard(function (card) {
                return get.type(card) != 'basic';
            }, 'he')) return false;
            for (var name of lib.inpile) {
                if (get.type(name) != 'basic') continue;
                var card = { name: name, isCard: true };
                if (event.filterCard(card, player, event)) return true;
                if (name == 'sha') {
                    for (var nature of lib.inpile_nature) {
                        card.nature = nature;
                        if (event.filterCard(card, player, event)) return true;
                    }
                }
            } return false;
        },
        chooseButton: {
            dialog(event, player) {
                var vcards = [];
                for (var name of lib.inpile) {
                    if (get.type(name) != 'basic') continue;
                    var card = { name: name, isCard: true };
                    if (event.filterCard(card, player, event)) vcards.push(['基本', '', name]);
                    if (name == 'sha') {
                        for (var nature of lib.inpile_nature) {
                            card.nature = nature;
                            if (event.filterCard(card, player, event)) vcards.push(['基本', '', name, nature]);
                        }
                    }
                }
                return ui.create.dialog('活墨', [vcards, 'vcard'], 'hidden');
            },
            check(button) {
                var player = _status.event.player;
                var card = { name: button.link[2], nature: button.link[3] };
                if (
                    game.hasPlayer(function (current) {
                        return player.canUse(card, current) && get.effect(current, card, player, player) > 0;
                    })
                ) {
                    switch (button.link[2]) {
                        case 'tao':
                            return 5;
                        case 'jiu':
                            return 3.01;
                        case 'sha':
                            if (button.link[3] == 'fire') return 2.95;
                            else if (button.link[3] == 'thunder') return 2.92;
                            else return 2.9;
                        case 'shan':
                            return 1;
                    }
                }
                return 0;
            },
            backup(links, player) {
                return {
                    check(card) {
                        return 1 / Math.max(0.1, get.value(card));
                    },
                    filterCard(card) {
                        return get.type(card) != 'basic';
                    },
                    viewAs: {
                        name: links[0][2],
                        nature: links[0][3],
                        suit: 'none',
                        number: null,
                        isCard: true,
                    },
                    position: 'he',
                    popname: true,
                    ignoreMod: true,
                    precontent() {
                        player.logSkill('zshy_huomo');
                        var card = event.result.cards[0];
                        game.log(player, '将', card, '置于牌堆顶');
                        event.result.card = {
                            name: event.result.card.name,
                            nature: event.result.card.nature,
                        };
                        event.result.cards = [];
                        player.loseToDiscardpile(card, ui.cardPile, 'visible', 'insert').log = false;
                        player.chooseDrawRecover(true);
                    },
                };
            },
            prompt(links, player) {
                return '将一张非基本牌置于牌堆顶并视为使用一张' + get.translation(links[0][3] || '') + get.translation(links[0][2]);
            },
        },
        ai: {
            order() {
                var player = _status.event.player;
                var event = _status.event;
                if (event.filterCard({ name: 'jiu' }, player, event) && get.effect(player, { name: 'jiu' }) > 0) {
                    return 3.1;
                }
                return 2.9;
            },
            respondSha: true,
            fireAttack: true,
            respondShan: true,
            skillTagFilter(player, tag, arg) {
                if (tag == 'fireAttack') return true;
                if (player.hasCard(function (card) {
                    return get.type(card) != 'basic';
                }, 'he')) {
                    if (tag == 'respondSha') {
                        if (arg != 'use') return false;
                    }
                }
                else {
                    return false;
                }
            },
            result: {
                player: 1,
            },
        },
    },
    zshy_zuoding: {//佐定
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: 'useCardToPlayered' },
        filter(event, player) {
            if (event.getParent().triggeredTargets3.length > 1) return false;
            return (
                get.suit(event.card) == 'spade' &&
                _status.currentPhase == event.player &&
                event.targets &&
                event.targets.length &&
                event.player != player
            );
        },
        direct: true,
        content() {
            'step 0';
            player.chooseTarget([1, Infinity], get.prompt('zshy_zuoding'), '令任意名目标角色摸一张牌', function (card, player, target) {
                return _status.event.targets.includes(target);
            }).set('ai', function (target) {
                return get.attitude(_status.event.player, target);
            }).set('targets', trigger.targets);
            'step 1';
            if (result.bool) {
                player.logSkill('zshy_zuoding', result.targets);
                for (i = 0; i < result.targets.length; i++) result.targets[i].draw();
            }
        },
        ai: {
            expose: 0.2,
        },
    },

    zshy_zhanjue: {//战绝
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        filterCard: true,
        selectCard: -1,
        position: 'h',
        filter(event, player) {
            var hs = player.getCards('h');
            if (!hs.length) return false;
            for (var i = 0; i < hs.length; i++) {
                var mod2 = game.checkMod(hs[i], player, 'unchanged', 'cardEnabled2', player);
                if (mod2 === false) return false;
            }
            return true;
        },
        viewAs: { name: 'juedou' },
        ai: {
            damage: true,
            order(item, player) {
                if (player.countCards('h') > 1) return 0.8;
                return 8;
            },
            tag: {
                respond: 2,
                respondSha: 2,
                damage: 1,
            },
            result: {
                player(player, target) {
                    let td = get.damageEffect(target, player, target);
                    if (!td) return 0;
                    let hs = player.getCards('h'),
                        val = hs.reduce((acc, i) => acc - get.value(i, player), 0) / 6 + 1;
                    if (td > 0) return val;
                    if (player.hasSkillTag(
                        'directHit_ai',
                        true,
                        {
                            target: target,
                            card: get.autoViewAs({ name: 'juedou' }, hs),
                        }
                    )) return val;
                    let pd = get.damageEffect(player, target, player),
                        att = get.attitude(player, target);
                    if (att > 0 && get.damageEffect(target, player, player) > pd) return val;
                    let ts = target.mayHaveSha(player, 'respond', null, 'count');
                    if (ts < 1 && ts * 8 < Math.pow(player.hp, 2)) return val;
                    let damage = pd / get.attitude(player, player),
                        ps = player.mayHaveSha(player, 'respond', hs, 'count');
                    if (att > 0) {
                        if (ts < 1) return val;
                        return val + damage + 1;
                    }
                    if (pd >= 0) return val + damage + 1;
                    if (ts - ps + Math.exp(0.8 - player.hp) < 1) return val - ts;
                    return val + damage + 1 - ts;
                },
                target(player, target) {
                    let td = get.damageEffect(target, player, target) / get.attitude(target, target);
                    if (!td) return 0;
                    let hs = player.getCards('h');
                    if (td > 0 || player.hasSkillTag(
                        'directHit_ai',
                        true,
                        {
                            target: target,
                            card: get.autoViewAs({ name: 'juedou' }, hs),
                        }
                    )) return td + 1;
                    let pd = get.damageEffect(player, target, player),
                        att = get.attitude(player, target);
                    if (att > 0) return td + 1;
                    let ts = target.mayHaveSha(player, 'respond', null, 'count'),
                        ps = player.mayHaveSha(player, 'respond', hs, 'count');
                    if (ts < 1) return td + 1;
                    if (pd >= 0) return 0;
                    if (ts - ps < 1) return td + 1 - ts;
                    return -ts;
                },
            },
            effect: {
                player_use(card, player, target) {
                    if (_status.event.skill == 'zshy_zhanjue') {
                        if (
                            player.hasSkillTag(
                                'directHit_ai',
                                true,
                                {
                                    target: target,
                                    card: card,
                                },
                                true
                            )
                        )
                            return;
                        if (player.countCards('h') >= 3 || target.countCards('h') >= 3) return 'zeroplayertarget';
                        if (player.countCards('h', 'tao')) return 'zeroplayertarget';
                        if (target.countCards('h', 'sha') > 1) return 'zeroplayertarget';
                    }
                },
            },
            nokeep: true,
            skillTagFilter(player, tag, arg) {
                if (tag === 'nokeep') return (!arg || (arg.card && get.name(arg.card) === 'tao')) && player.isPhaseUsing() && get.skillCount('zshy_zhanjue_draw') < 2 && player.hasCard(card => get.name(card) != 'tao', 'h');
            },
        },
        group: ['zshy_zhanjue_sub'],
        subSkill: {
            sub: {
                audio: false,
                trigger: { player: 'useCardAfter' },
                forced: true,
                popup: false,
                sourceSkill: 'zshy_zhanjue',
                filter(event, player) {
                    return event.skill == 'zshy_zhanjue';
                },
                content() {
                    var num = Math.max(1, player.getDamagedHp());
                    player.draw(num);
                },
            },
        },
    },
    zshy_qinwang: {//勤王
        audio: 'ext:诸神寰宇/audio/character:2',
        zhuSkill: true,
        trigger: {
            global: 'useCard',
        },
        filter(event, player) {
            return event.player != player && event.player.group == 'shu' && get.name(event.card) == 'sha';
        },
        check(event, player) {
            return game.hasPlayer(function (current) {
                return current != player && player.canUse('juedou', current) && get.effect(current, { name: 'juedou' }, player, player) > 0;
            });
        },
        content() {
            'step 0'
            player.chooseTarget('选择一名其他角色对其使用一张【决斗】', function (event, player, target) {
                return player.canUse('juedou', target);
            }).set('ai', function (target) {
                return get.effect(target, { name: 'juedou' }, player, player) > 0;
            })
            'step 1'
            if (result.targets) {
                player.useCard({ name: 'juedou', isCard: false }, result.targets[0]);
            }
        },
    },

    zshy_qiaoshi: {//樵拾
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: 'phaseJieshuBegin' },
        filter(event, player) {
            return event.player != player && event.player.isIn();
        },
        check(event, player) {
            return get.attitude(player, event.player) >= 0;
        },
        content() {
            trigger.player.chooseDrawRecover(true);
            player.chooseDrawRecover(true);
        },
    },
    zshy_yanyu: {//燕语
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        filter(event, player) {
            return player.hasCard(card => lib.skill.zshy_yanyu.filterCard(card, player), 'h');
        },
        filterCard: (card, player) => get.name(card) == 'sha' && player.canRecast(card),
        discard: false,
        lose: false,
        delay: false,
        content() {
            player.recast(cards);
        },
        ai: {
            basic: {
                order(event, player) {
                    if (player.countCards('h', { name: 'sha' }) > 1) return 1;
                    else return 9;
                },
            },
            result: {
                player: 1,
            },
        },
        group: ['zshy_yanyu_sub1'],
        subSkill: {
            sub1: {
                trigger: { player: 'zshy_yanyuAfter' },
                filter(event, player) {
                    return (
                        player.getHistory('useSkill', function (evt) {
                            return evt.skill == 'zshy_yanyu';
                        }).length > 1
                    );
                },
                direct: true,
                sourceSkill: 'zshy_yanyu',
                content() {
                    'step 0'
                    player.chooseTarget(get.prompt('zshy_yanyu'), '令一名男性角色或自己选择回复1点体力或摸一张牌', function (card, player, target) {
                        return target.hasSex('male') || target == player;
                    }).set('ai', function (target) {
                        return get.attitude(_status.event.player, target);
                    });
                    'step 1'
                    if (result.bool) {
                        player.logSkill('zshy_yanyu', result.targets);
                        result.targets[0].chooseDrawRecover(true);
                    }
                },
            },
        },
    },

    zshy_wurong: {//怃戎
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        filter(event, player) {
            return player.countCards('h') > 0 && !player.hasSkill('zshy_wurong_sub1');
        },
        filterTarget(card, player, target) {
            return target.countCards('h') > 0 && target != player;
        },
        content() {
            'step 0'
            if (target.countCards('h') == 0 || player.countCards('h') == 0) {
                event.finish();
                return;
            }
            'step 1'
            var sendback = function () {
                if (_status.event != event) {
                    return function () {
                        event.resultOL = _status.event.resultOL;
                    };
                }
            };
            if (player.isOnline()) {
                player.wait(sendback);
                event.ol = true;
                player.send(function () {
                    game.me.chooseCard(true).set('glow_result', true).ai = function () {
                        return Math.random();
                    };
                    game.resume();
                });
            } else {
                event.localPlayer = true;
                player.chooseCard(true).set('glow_result', true).ai = function () {
                    return Math.random();
                };
            }
            if (target.isOnline()) {
                target.wait(sendback);
                event.ol = true;
                target.send(function () {
                    var rand = Math.random() < 0.4;
                    game.me.chooseCard(true).set('glow_result', true).ai = function (card) {
                        if (rand) return card.type == 'basic' ? 1 : 0;
                        return card.type == 'basic' ? 0 : 1;
                    };
                    game.resume();
                });
            } else {
                event.localTarget = true;
            }
            'step 2'
            if (event.localPlayer) {
                event.card1 = result.cards[0];
            }
            if (event.localTarget) {
                var rand = Math.random() < 0.4;
                target.chooseCard(true).set('glow_result', true).ai = function (card) {
                    if (rand) return card.type == 'basic' ? 1 : 0;
                    return card.type == 'basic' ? 0 : 1;
                };
            }
            'step 3'
            if (event.localTarget) {
                event.card2 = result.cards[0];
            }
            if (!event.resultOL && event.ol) {
                game.pause();
            }
            'step 4'
            try {
                if (!event.card1) event.card1 = event.resultOL[player.playerid].cards[0];
                if (!event.card2) event.card2 = event.resultOL[target.playerid].cards[0];
                if (!event.card1 || !event.card2) {
                    throw 'err';
                }
            } catch (e) {
                console.log(e);
                event.finish();
                return;
            }
            game.broadcastAll(
                function (card1, card2) {
                    card1.classList.remove('glow');
                    card2.classList.remove('glow');
                },
                event.card1,
                event.card2
            );
            'step 5'
            game.broadcastAll(function () {
                ui.arena.classList.add('thrownhighlight');
            });
            game.addVideo('thrownhighlight1');
            player.$compare(event.card1, target, event.card2);
            game.delay(4);
            'step 6'
            var next = game.createEvent('showCards');
            next.player = player;
            next.cards = [event.card1];
            next.setContent('emptyEvent');
            game.log(player, '展示了', event.card1);
            'step 7'
            var next = game.createEvent('showCards');
            next.player = target;
            next.cards = [event.card2];
            next.setContent('emptyEvent');
            game.log(target, '展示了', event.card2);
            'step 8'
            var name1 = get.type(event.card1);
            var name2 = get.type(event.card2);
            if (name1 == 'basic' && name2 != 'basic') {
                player.discard(event.card1).set('animate', false);
                target.$gain2(event.card2);
                var clone = event.card1.clone;
                if (clone) {
                    clone.style.transition = 'all 0.5s';
                    clone.style.transform = 'scale(1.2)';
                    clone.delete();
                    game.addVideo('deletenode', player, get.cardsInfo([clone]));
                }
                game.broadcast(function (card) {
                    var clone = card.clone;
                    if (clone) {
                        clone.style.transition = 'all 0.5s';
                        clone.style.transform = 'scale(1.2)';
                        clone.delete();
                    }
                }, event.card1);
                target.damage('nocard');
            } else if (name1 != 'basic' && name2 == 'basic') {
                player.discard(event.card1).set('animate', false);
                target.$gain2(event.card2);
                var clone = event.card1.clone;
                if (clone) {
                    clone.style.transition = 'all 0.5s';
                    clone.style.transform = 'scale(1.2)';
                    clone.delete();
                    game.addVideo('deletenode', player, get.cardsInfo([clone]));
                }
                game.broadcast(function (card) {
                    var clone = card.clone;
                    if (clone) {
                        clone.style.transition = 'all 0.5s';
                        clone.style.transform = 'scale(1.2)';
                        clone.delete();
                    }
                }, event.card1);
                player.gainPlayerCard(target, true, 'he');
            } else {
                player.$gain2(event.card1);
                target.$gain2(event.card2);
                player.addTempSkill('zshy_wurong_sub1');
            }
            game.broadcastAll(function () {
                ui.arena.classList.remove('thrownhighlight');
            });
            game.addVideo('thrownhighlight2');
        },
        ai: {
            order: 6,
            result: {
                target: -1,
            },
        },
        subSkill: {
            sub1: {},
        },
    },
    zshy_shizhi: {//矢志
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: ['useCard1', 'respond'] },
        firstDo: true,
        forced: true,
        filter(event, player) {
            return get.name(event.card) == 'sha' && !event.skill && event.cards.length == 1 && event.cards[0].name == 'shan';
        },
        content() { },
        mod: {
            cardname(card, player, name) {
                if (card.name == 'shan') return 'sha';
            },
        },
        ai: {
            skillTagFilter(player) {
                if (!player.countCards('h', 'shan')) return false;
            },
            respondSha: true,
            neg: true,
        },
        global: ['zshy_shizhi_sub1'],
        subSkill: {
            sub1: {
                trigger: { player: ['useCard1', 'respond'] },
                firstDo: true,
                forced: true,
                filter(event, player) {
                    return get.name(event.card) == 'sha' && !event.skill && event.cards.length == 1 && event.cards[0].name == 'shan';
                },
                content() { },
                mod: {
                    cardname(card, player, name) {
                        if (card.name == 'shan') return 'sha';
                    },
                },
                ai: {
                    skillTagFilter(player) {
                        if (!player.countCards('h', 'shan')) return false;
                    },
                    respondSha: true,
                    neg: true,
                },
            },
        },
    },

    zshy_yanzhu: {//宴诛
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        filterTarget(card, player, target) {
            return target.countCards('he') > 0 && target != player && !target.hasSkill('zshy_yanzhu_sub1');
        },
        content() {
            'step 0';
            if (target.countCards('he')) {
                target.chooseBool('是否将所有牌交给' + get.translation(player) + '？').set('ai', function () {
                    if (_status.event.player.countCards('he') >= 3) return false;
                    return true;
                });
            } else {
                target.chooseToDiscard(true, 'he', 2);
                event.finish();
            }
            'step 1';
            if (result.bool) {
                var es = target.getCards('he');
                target.give(es, player, 'give');
                player.tempBanSkill('zshy_yanzhu');
            } else {
                target.chooseToDiscard(true, 'he', 2);
            }
            target.addTempSkill('zshy_yanzhu_sub1');
        },
        ai: {
            order: 6,
            result: {
                target(player, target) {
                    var ne = target.countCards('he');
                    if (!ne) return -2;
                    if (ne >= 2) return -ne;
                    return 0;
                },
            },
        },
        subSkill: {
            sub1: {
                charlotte: true,
                forced: true,
            },
        },
    },
    zshy_xingxue: {//兴学
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'phaseJieshuBegin' },
        direct: true,
        async content(event, trigger, player) {
            var num = player.hp;
            if (!player.hasSkill('zshy_yanzhu')) {
                num = player.maxHp;
            }
            const { targets, bool } = await player.chooseTarget([1, num], get.prompt2('zshy_xingxue')).set('ai', function (target) {
                var att = get.attitude(_status.event.player, target);
                if (target.countCards('he')) return att;
                return att / 10;
            }).forResult();
            if (bool) {
                player.logSkill('zshy_xingxue', targets);
                const chooseToPutCard = async function (target) {
                    await target.draw(3), target.recover();
                    if (target.countCards('he')) {
                        const { cards, bool } = await target.chooseCard('选择一张牌置于牌堆顶', 'he', true).forResult();
                        if (bool) {
                            await target.lose(cards, ui.cardPile, 'insert');
                        }
                        game.broadcastAll(function (player) {
                            var cardx = ui.create.card();
                            cardx.classList.add('infohidden');
                            cardx.classList.add('infoflip');
                            player.$throw(cardx, 1000, 'nobroadcast');
                        }, target);
                        if (player == game.me) {
                            await game.delay(0.5);
                        }
                    }
                };
                await game.doAsyncInOrder(targets, chooseToPutCard);
            }
        },
    },
    zshy_zhaofu: {//诏缚
        audio: 'ext:诸神寰宇/audio/character:2',
        unique: true,
        global: 'zshy_zhaofu_sub1',
        zhuSkill: true,
        locked: true,
        subSkill: {
            sub1: {
                mod: {
                    inRangeOf(from, to) {
                        if (from.group != 'wu') return;
                        var players = game.filterPlayer();
                        for (var i = 0; i < players.length; i++) {
                            if (from != players[i] && to != players[i] && players[i].hasZhuSkill('zshy_zhaofu', from)) {
                                if (get.distance(players[i], to) <= 1) return true;
                            }
                        }
                    },
                },
            },
        },
    },

    zshy_anguo: {//安国
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        filterTarget(event, player, target) {
            return !target.hasSkill('zshy_anguo_sub1');
        },
        content() {
            target.draw();
            target.recover();
            var equip = get.cardPile(
                function (card) {
                    return get.type(card) == 'equip' && target.hasUseTarget(card);
                }, false, 'random');
            if (equip) {
                target.chooseUseTarget(equip, 'nothrow', 'nopopup', true);
            }
            target.addTempSkill('zshy_anguo_sub1');
            player.draw();
            player.recover();
            var equip1 = get.cardPile(
                function (card) {
                    return get.type(card) == 'equip' && player.hasUseTarget(card);
                }, false, 'random'
            );
            if (equip) player.chooseUseTarget(equip1, 'nothrow', 'nopopup', true);
        },
        ai: {
            threaten: 1.6,
            order: 9,
            result: {
                player(player, target) {
                    if (get.attitude(player, target) <= 0) {
                        return -1;
                    }
                    return 1;
                },
            },
        },
        subSkill: {
            sub1: {
                charlotte: true,
                forced: true,
            },
        },
    },

    zshy_yaoming: {//邀名
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'damageEnd',
            source: 'damageSource',
        },
        direct: true,
        filter(event, player) {
            var nh = player.countCards('h');
            return game.hasPlayer(function (current) {
                return current.countCards('h') != nh;
            });
        },
        content() {
            'step 0';
            var nh = player.countCards('h');
            player.chooseTarget(get.prompt2('zshy_yaoming'), function (card, player, target) {
                return _status.event.nh != target.countCards('h');
            }).set('ai', function (target) {
                var att = get.attitude(_status.event.player, target);
                if (target.countCards('h') > _status.event.nh) return -att;
                return att;
            }).set('nh', nh);
            'step 1';
            if (result.bool) {
                player.logSkill('zshy_yaoming', result.targets);
                var target = result.targets[0];
                if (target.countCards('h') < player.countCards('h')) {
                    target.draw();
                    player.recover();
                } else {
                    target.discard(target.getCards('he').randomGet());
                    target.loseHp();
                }
            }
        },
        getIndex(event, player) {
            return event.num;
        },
        ai: {
            expose: 0.2,
        },
    },

    zshy_huaiyi: {//怀异
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        delay: false,
        filter(event, player) {
            return player.countCards('h', { color: 'black' }) > 0 && player.countCards('h', { color: 'red' }) > 0;
        },
        content() {
            'step 0'
            player.showHandcards();
            const hs = player.getCards('h'),
                color = get.color(hs[0], player);
            if (
                hs.length === 1 ||
                !hs.some((card, index) => {
                    return index > 0 && get.color(card) !== color;
                })
            ) {
                event.finish();
            }
            'step 1'
            const list = [],
                bannedList = [],
                indexs = Object.keys(lib.color);
            player.getCards('h').forEach(card => {
                const color = get.color(card, player);
                list.add(color);
                if (!lib.filter.cardDiscardable(card, player, 'huaiyi')) bannedList.add(color);
            });
            list.removeArray(bannedList);
            list.sort((a, b) => indexs.indexOf(a) - indexs.indexOf(b));
            if (!list.length) event.finish();
            else if (list.length === 1) event._result = { control: list[0] };
            else player.chooseControl(list.map(i => `${i}2`)).set('ai', function () {
                var player = _status.event.player;
                if (player.countCards('h', { color: 'red' }) == 1 && player.countCards('h', { color: 'black' }) > 1) return 1;
                return 0;
            }).set('prompt', '请选择弃置一种颜色的所有手牌');
            'step 2'
            event.control = result.control.slice(0, result.control.length - 1);
            var cards = player.getCards('h', { color: event.control });
            player.discard(cards);
            event.num = cards.length;
            'step 3'
            player.chooseTarget('请选择至多' + get.cnNumber(event.num) + '名有牌的其他角色，获得这些角色的各一张牌。', [1, event.num], function (card, player, target) {
                return target != player && target.countCards('he') > 0;
            }).set('ai', function (target) {
                return -get.attitude(_status.event.player, target) + 0.5;
            });
            'step 4'
            if (result.bool && result.targets) {
                player.line(result.targets, 'green');
                event.targets = result.targets;
                event.targets.sort(lib.sort.seat);
                event.gained = 0;
            } else {
                event.finish();
            }
            'step 5'
            if (player.isIn() && event.targets.length) {
                for (i = 0; i < event.targets.length; i++) {
                    player.gainPlayerCard(event.targets[i], 'he', true);
                    event.targets[i].damage();
                    event.gained += result.cards.length;
                }
            };
        },
        ai: {
            order(item, player) {
                if (player.countCards('h', { color: 'red' }) == 1) return 10;
                if (player.countCards('h', { color: 'black' }) == 1) return 10;
                return 1;
            },
            result: {
                player: player => {
                    if (get.color(player.getCards('h')) != 'none') return 0;
                    return 1;
                },
            },
        },
    },

    zshy_jigong: {//急攻
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'phaseUseBegin' },
        frequent: true,
        check(event, player) {
            return true;
        },
        content() {
            player.draw(2);
            player.addTempSkill('zshy_jigong_sub1');
        },
        subSkill: {
            sub1: {
                mod: {
                    cardname(card, player, name) {
                        if (card.name == 'shan') return 'sha';
                    },
                    cardUsable(card, player, num) {
                        if (card.name == 'sha') return num + player.maxHp;
                    },
                },
            },
        },
    },
    zshy_shifei: {//饰非
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: ['chooseToRespond', 'chooseToUse'],
        filter(event, player) {
            if (!_status.currentPhase || event.zshy_shifei) return false;
            if (!event.filterCard({ name: 'shan', isCard: true }, player, event)) return false;
            if (event.name != 'chooseToUse' && !lib.filter.cardRespondable({ name: 'shan', isCard: true }, player, event)) return false;
            return true;
        },
        delay: false,
        checkx(player) {
            if (get.attitude(player, _status.currentPhase) > 0) return true;
            var nh = _status.currentPhase.countCards('h') + 1;
            var players = game.filterPlayer();
            for (var i = 0; i < players.length; i++) {
                if (players[i].countCards('h') >= nh) {
                    if (!player.countCards('h', 'shan') || get.attitude(player, players[i]) <= 0) return true;
                }
            }
            return false;
        },
        content() {
            'step 0'
            player.line(_status.currentPhase, 'green');
            _status.currentPhase.draw();
            'step 1'
            var targets = game.filterPlayer(function (current) {
                return current.isMaxHandcard();
            });
            if (targets.length == 1) {
                event.onlytarget = targets[0];
            } else if (targets.length) {
                player.chooseTarget('选择一名角色弃置其一张牌', true, function (card, player, target) {
                    return _status.event.targets.includes(target);
                }).set('ai', function (target) {
                    return -get.attitude(_status.event.player, target);
                }).set('targets', targets);
            } else {
                event.finish();
            }
            'step 2';
            var evt = event.getParent(2);
            var target;
            if (event.onlytarget) {
                target = event.onlytarget;
            } else if (result.targets && result.targets.length) {
                target = result.targets[0];
            }
            if (target) {
                player.line(target, 'green');
                player.discardPlayerCard(target, 'he', true);
                evt.result = { bool: true, card: { name: 'shan', isCard: true }, cards: [] };
                evt.redo();
            } else {
                evt.set('zshy_shifei', true);
                evt.goto(0);
            }
        },
        ai: {
            respondShan: true,
            freeshan: true,
            effect: {
                target_use(card, player, target, current) {
                    return 0.4;
                },
            },
            order: 8,
            result: {
                player(player) {
                    return 1;
                },
            },
        },
    },

};
const 原创之魂2016 = {
    zshy_jiaozhao: {//矫诏
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        usable(event, player) {
            return player.countMark('zshy_danxin') + 1;
        },
        filterCharacter(event, player) {
            return player.countCards('hes');
        },
        chooseButton: {
            dialog(event, player) {
                var list = [];
                for (var name of lib.inpile) {
                    var type = get.type(name);
                    if ((type == 'basic' || type == 'trick')) {
                        list.push([type, '', name]);
                        if (name == 'sha') {
                            for (var nature of lib.inpile_nature) list.push([type, '', name, nature]);
                        }
                    }
                }
                return ui.create.dialog('矫诏', [list, 'vcard']);
            },
            filter(button, player) {
                var card = { name: button.link[2], nature: button.link[3] };
                var evt = _status.event.getParent();
                return evt.filterCard(card, player, evt);
            },
            check(button) {
                var card = { name: button.link[2], nature: button.link[3] };
                return _status.event.player.getUseValue(card, null, true);
            },
            backup(links, player) {
                var next = {
                    viewAs: {
                        name: links[0][2],
                        nature: links[0][3],
                    },
                    popname: true,
                    position: 'hes',
                    filterCard: true,
                    ai1: (card) => 8 - get.value(card),
                    onuse(result, player) {
                        player.logSkill('zshy_jiaozhao');
                    },
                }
                return next;
            },
            prompt(links) {
                return '将一张牌当做' + (get.translation(links[0][3]) || '') + get.translation(links[0][2]) + '使用';
            },
        },
        ai: {
            order() {
                return [5, 7, 9].randomGet();
            },
            result: {
                player: 1,
            },
        },
    },
    zshy_danxin: {//殚心
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'damageAfter',
        },
        marktext: '殚心',
        intro: {
            content: '每回合〖矫诏〗使用次数+#',
        },
        direct: true,
        content() {
            player.draw();
            player.logSkill('zshy_danxin', player);
            player.addMark('zshy_danxin', 1);
        },
        getIndex(event, player) {
            return event.num;
        },
    },

    zshy_fulin: {//腹鳞
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'phaseDiscardBegin',
        },
        forced: true,
        content() {
            player.addTempSkill('zshy_fulin_card');
        },
        group: ['zshy_fulin_count'],
        subSkill: {
            card: {
                mod: {
                    ignoredHandcard(card, player) {
                        if (card.hasGaintag('zshy_fulin')) {
                            return true;
                        }
                    },
                    cardDiscardable(card, player, name) {
                        if (name == 'phaseDiscard' && card.hasGaintag('zshy_fulin')) {
                            return false;
                        }
                    },
                },
            },
            count: {
                audio: 'zshy_fulin',
                trigger: {
                    player: 'gainBegin',
                },
                popup: false,
                forced: true,
                silent: true,
                sourceSkill: 'zshy_fulin',
                filter(event, player) {
                    return _status.currentPhase == player;
                },
                content() {
                    trigger.gaintag.add('zshy_fulin');
                },
            },
        },
    },
    zshy_duliang: {//督粮
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        filterTarget(card, player, target) {
            return player != target && target.countCards('he') > 0 && !target.hasSkill('zshy_duliang_After');
        },
        check() {
            return true;
        },
        async content(event, trigger, player) {
            const target = event.targets[0];
            await player.gainPlayerCard(target, 'he', true);
            await player.recover();
            target.addTempSkill('zshy_duliang_draw', { player: 'phaseAfter' });
            target.addMark('zshy_duliang_draw', 1, false);
            target.addTempSkill('zshy_duliang_After', { global: 'phaseAfter' });
        },
        ai: {
            order: 9,
            result: {
                target: -1,
                player: 0.1,
            },
        },
        subSkill: {
            draw: {
                trigger: {
                    player: 'phaseDrawBegin',
                },
                mark: true,
                forced: true,
                onremove: true,
                charlotte: true,
                intro: {
                    content: '下回合的摸牌阶段少摸2张牌',
                },
                content() {
                    trigger.num -= 2;
                },
            },
            After: {
                charlotte: true,
                forced: true,
            },
        },
    },

    zshy_kuangbi: {//匡弼
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'phaseUseBegin',
        },
        prompt2(event, player) {
            return '是否获得' + get.translation(event.player) + '至多两张牌。';
        },
        check(event, player) {
            const target = event.player;
            return target != player && target.countCards('he') > 0 && get.attitude(player, target) < 0;
        },
        async content(event, trigger, player) {
            if (trigger.player.countCards('he') > 0 && trigger.player != player) {
                await player.gainPlayerCard(trigger.player, 'he', [0, 2], true).forResult();
            }
            await trigger.player.chooseDrawRecover(true);
        },
    },

    zshy_zhige: {//止戈
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        usable: 2,
        ai: {
            order: 5,
            result: {
                target(player, target) {
                    return get.attitude(player, target) < 0 ? 1 : -1;
                },
            },
        },
        filterTarget(card, player, target) {
            return player !== target && target.countCards('he') > 0;
        },
        content() {
            'step 0'
            target.chooseToUse({ name: 'sha' }, '止戈：使用一张【杀】，或一张牌交给' + get.translation(player));
            'step 1'
            if (!result.bool && target.countCards('he')) {
                target.chooseCard('he', true, '将一张牌交给' + get.translation(player));
            } else event.finish();
            'step 2'
            if (result.bool && result.cards && result.cards.length) {
                target.give(result.cards, player);
            }
        },
    },
    zshy_zongzuo: {//宗祚
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'phaseBefore',
            player: 'enterGame',
        },
        forced: true,
        filter(event, player) {
            return event.name != 'phase' || game.phaseNumber == 0;
        },
        async content(event, trigger, player) {
            const num = game.countPlayer();
            player.gainMaxHp(num);
            player.recover(num);
        },
        ai: {
            threaten: 2,
        },
        group: ['zshy_zongzuo_lose'],
        subSkill: {
            lose: {
                audio: 'zshy_zongzuo',
                trigger: {
                    global: 'dieAfter',
                },
                forced: true,
                sourceSkill: 'zshy_zongzuo',
                content() {
                    'step 0'
                    var list = [];
                    var group = trigger.player.group;
                    for (var i in lib.character) {
                        var cinfo = get.character(i);
                        if (cinfo[1] != group) continue;
                        if (cinfo[4].includes('boss')) continue;
                        if (cinfo[4].includes('minskin')) continue;
                        if (cinfo[4].includes('hiddenboss')) continue;
                        if (cinfo[4].includes('Unaffected')) continue;
                        if (cinfo[4].includes('stonehidden')) continue;
                        for (var j = 0; j < (cinfo[3] || []).length; j++) {
                            var info = lib.skill[cinfo[3][j]];
                            if (info && !info.silent) list.add(cinfo[3][j]);
                        }
                    }
                    var link = list.randomGet();
                    player.addSkillLog(link);
                    'step 1'
                    if (!game.hasPlayer(function (current) {
                        return current.group == trigger.player.group;
                    })) player.loseMaxHp(), player.draw();
                },
            },
        },
    },

    zshy_jishe: {//极奢
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        filter(event, player) {
            return player.getHandcardLimit() > 0;
        },
        content() {
            player.chooseDrawRecover(true);
            player.addTempSkill('zshy_jishe_handcard');
            player.addMark('zshy_jishe_handcard', 1, false);
        },
        ai: {
            order: 10,
            result: {
                player(player) {
                    if (!player.needsToDiscard(1)) {
                        return 1;
                    }
                    return 0;
                },
            },
        },
        group: ['zshy_jishe_tiesuo'],
        subSkill: {
            handcard: {
                onremove: true,
                charlotte: true,
                marktext: '奢',
                intro: { content: '手牌上限-#' },
                mod: {
                    maxHandcard(player, num) {
                        return num - player.countMark('zshy_jishe_handcard');
                    },
                },
            },
            tiesuo: {
                audio: 'zshy_jishe',
                trigger: { player: 'phaseJieshuBegin' },
                direct: true,
                sourceSkill: 'zshy_jishe',
                filter(event, player) {
                    if (player.MaxHp <= player.countCards('h')) return false;
                    return game.hasPlayer(function (current) {
                        return !current.isLinked();
                    });
                },
                content() {
                    'step 0';
                    var num = game.countPlayer(function (current) {
                        return !current.isLinked();
                    });
                    player.chooseTarget(get.prompt('zshy_jishe'), '横置至多' + get.cnNumber(Math.min(num, player.hp)) + '名未横置的角色', [1, Math.min(num, player.maxHp - player.countCards('h'))], function (card, player, target) {
                        return !target.isLinked();
                    }).set('ai', function (target) {
                        return -get.attitude(_status.event.player, target);
                    });
                    'step 1';
                    if (result.bool) {
                        player.logSkill('zshy_jishe', result.targets);
                        event.targets = result.targets;
                        event.num = 0;
                    } else {
                        event.finish();
                    }
                    'step 2';
                    if (event.num < event.targets.length) {
                        event.targets[event.num].link();
                        event.num++;
                        event.redo();
                    }
                },
                ai: {
                    expose: 0.3,
                },
            },
        },
    },
    zshy_lianhuo: {//链祸
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'damageBegin3' },
        forced: true,
        filter(event, player) {
            return player.isLinked() && event.notLink() && event.hasNature();
        },
        content() {
            trigger.num = player.hp;
        },
        ai: {
            neg: true,
        },
    },

    zshy_guizao: {//瑰藻
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'loseAfter',
        },
        direct: true,
        filter(event, player) {
            if (event.type != 'discard') return false;
            if (event.cards && event.cards.length > 1) {
                var suits = [];
                for (var i = 0; i < event.cards.length; i++) {
                    var suit = get.suit(event.cards[i]);
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
        content() {
            player.logSkill('zshy_guizao', target);
            for (i = 0; i < trigger.cards.length; i++) {
                player.chooseDrawRecover(true);
            };
        },
    },
    zshy_jiyu: {//讥谀
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        filter(event, player) {
            if (!player.getStat().skill.zshy_jiyu || !player.storage.zshy_jiyu_sub1) return true;
            var hs = player.getCards('h');
            for (var i = 0; i < hs.length; i++) {
                if (!player.storage.zshy_jiyu_sub1.includes(get.suit(hs[i]))) {
                    return true;
                }
            }
            return false;
        },
        filterTarget(card, player, target) {
            return target.countCards('he');
        },
        content() {
            'step 0'
            var evt = _status.event.getParent('phaseUse');
            if (evt && evt.name == 'phaseUse' && !evt.zshy_jiyu) {
                evt.zshy_jiyu = true;
                var next = game.createEvent('zshy_jiyu_clear');
                _status.event.next.remove(next);
                evt.after.push(next);
                next.player = player;
                next.setContent(function () {
                    game.broadcastAll(function (player) {
                        delete player.storage.zshy_jiyu;
                        delete player.storage.zshy_jiyu_sub1;
                    }, player);
                });
            }
            if (!player.storage.zshy_jiyu) player.storage.zshy_jiyu = [];
            target.chooseToDiscard('he', true).set('ai', function (card) {
                if (get.suit(card) == 'spade') {
                    if (_status.event.spade) {
                        return 10 - get.value(card);
                    } else {
                        return -10 - get.value(card);
                    }
                }
                if (_status.event.getParent().player.storage.zshy_jiyu_sub1 && _status.event.getParent().player.storage.zshy_jiyu_sub1.includes(get.suit(card))) {
                    return -3 - get.value(card);
                }
                return -get.value(card);
            })
            'step 1'
            if (!result.cards || !result.cards.length) return;
            var card = result.cards[0];
            if (get.suit(card, target) == 'spade') {
                player.chooseToDiscard('he', true);
                target.loseHp();
            }
            if (!player.storage.zshy_jiyu_sub1) player.storage.zshy_jiyu_sub1 = [];
            player.storage.zshy_jiyu_sub1.add(get.suit(card));
        },
        onremove: ['zshy_jiyu', 'zshy_jiyu_sub1'],
        ai: {
            order: 9,
            result: {
                target(player, target) {
                    if (player.isTurnedOver() || target.countCards('h') <= 3) return -1;
                    return 0;
                },
            },
        },
        mod: {
            cardEnabled(card, player) {
                if (player.storage.zshy_jiyu_sub1 && player.storage.zshy_jiyu_sub1.includes(get.suit(card))) return false;
            },
            cardSavable(card, player) {
                if (player.storage.zshy_jiyu_sub1 && player.storage.zshy_jiyu_sub1.includes(get.suit(card))) return false;
            },
        },
        subSkill: {
            sub1: {
                trigger: { player: ['phaseUseBegin', 'phaseUseAfter'] },
                silent: true,
                sourceSkill: 'zshy_jiyu',
                content() {
                    player.storage.zshy_jiyu = [];
                    player.storage.zshy_jiyu_sub1 = [];
                },
            },
        },
    },

    zshy_qinqing: {//寝情
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'phaseJieshuBegin',
        },
        direct: true,
        filter(event, player) {
            return game.hasPlayer(function (current) {
                return current.countDiscardableCards(player, 'hej');
            });
        },
        content() {
            'step 0'
            player.chooseTarget(get.prompt('zshy_qinqing'), [1, Infinity], function (card, player, target) {
                return target.countDiscardableCards(player, 'hej');
            }, '弃置任意名角色区域内各1张牌').set('ai', function (target) {
                var player = _status.event.player;
                return get.effect(target, { name: 'guohe_copy2' }, player, player);
            });
            'step 1'
            if (result.bool) {
                var targets = result.targets.sortBySeat();
                player.logSkill('zshy_qinqing', targets);
                for (var i of targets) {
                    player.discardPlayerCard(i, 'hej', true);
                    player.draw('nodelay');
                };
            } else event.finish();
        },
    },
    zshy_huisheng: {//贿生
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'damageBegin4',
        },
        direct: true,
        filter(event, player) {
            if (!player.countCards('he')) return false;
            if (!event.source || event.source == player || !event.source.isIn()) return false;
            if (event.source.hasSkill('zshy_huisheng_allowed')) return false;
            return true;
        },
        content() {
            'step 0'
            player.chooseCard('he', [1, player.countCards('he')], get.prompt2('huisheng', trigger.source))
                .set('ai', function (card) {
                    var att = get.attitude(player, trigger.source) > 0, goon = false;
                    var he = player.getCards('he'), num = 0;
                    if (player.hp == 1) {
                        goon = true;
                    } else {
                        for (var i = 0; i < he.length; i++) {
                            if (get.value(he[i]) < 8) {
                                num++;
                                if (num >= 2) {
                                    goon = true;
                                    break;
                                }
                            }
                        }
                    }
                    if (_status.event.att) {
                        return 10 - get.value(card);
                    }
                    if (_status.event.goon) {
                        return 8 - get.value(card);
                    }
                    if (!ui.selected.cards.length) {
                        return 7 - get.value(card);
                    }
                    return 0;
                })
            'step 1'
            if (result.bool) {
                player.logSkill('zshy_huisheng', trigger.source);
                game.delay();
                event.num = result.cards.length;
                var goon = false;
                if (get.attitude(trigger.source, player) >= 0) {
                    goon = true;
                }
                var forced = false;
                var str = '获得其中一张牌并防止伤害';
                if (trigger.source.countCards('he') < event.num) {
                    forced = true;
                } else {
                    str += '，或取消并弃置' + get.cnNumber(result.cards.length) + '张牌';
                }
                trigger.source.chooseButton([str, result.cards], forced).set('ai', function (button) {
                    if (_status.event.goon) {
                        return get.value(button.link);
                    }
                    return get.value(button.link) - 8;
                }).set('goon', goon);
            } else {
                event.finish();
            }
            'step 2'
            if (result.bool) {
                var card = result.links[0];
                trigger.source.gain(card, player, 'giveAuto', 'bySelf');
                trigger.cancel();
                trigger.source.addTempSkill('zshy_huisheng_allowed');
                player.recover();
            } else {
                trigger.source.chooseToDiscard(event.num, true, 'he');
            };
        },
        subSkill: {
            allowed: {},
        },
    },

    zshy_taoluan: {//滔乱
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'chooseToUse',
        hiddenCard(player, name) {
            return player.countCards('hes') > 0 && lib.inpile.includes(name);
        },
        filter(event, player) {
            if ((game.countPlayer(function (current) {
                return current != player;
            }) == 0 || player.hp < 1)) return false;
            return player.hasCard(card => lib.inpile.some(name => {
                if (player.getStorage('zshy_taoluan').includes(name)) return false;
                if (get.type(name) != 'basic' && get.type(name) != 'trick') return false;
                if (event.filterCard({ name: name, isCard: true, cards: [card] }, player, event)) return true;
                if (name == 'sha') {
                    for (var nature of lib.inpile_nature) {
                        if (event.filterCard({ name: name, nature: nature, isCard: true, cards: [card] }, player, event)) return true;
                    }
                }
                return false;
            }), 'hes');
        },
        onremove: true,
        chooseButton: {
            dialog(event, player) {
                var list = [];
                for (var name of lib.inpile) {
                    if (get.type(name) == 'basic' || get.type(name) == 'trick') {
                        list.push([get.translation(get.type(name)), '', name]);
                        if (name == 'sha') {
                            for (var j of lib.inpile_nature) list.push(['基本', '', 'sha', j]);
                        }
                    }
                }
                return ui.create.dialog('滔乱', [list, 'vcard']);
            },
            filter(button, player) {
                return _status.event.getParent().filterCard({ name: button.link[2] }, player, _status.event.getParent());
            },
            check(button) {
                var player = _status.event.player;
                var card = { name: button.link[2], nature: button.link[3] };
                if (player.countCards('hes', cardx => cardx.name == card.name)) return 0;
                return _status.event.getParent().type == 'phase' ? player.getUseValue(card) : 1;
            },
            backup(links, player) {
                return {
                    audio: 'zshy_taoluan',
                    filterCard: true,
                    popname: true,
                    check(card) {
                        return 7 - get.value(card);
                    },
                    position: 'hes',
                    viewAs: { name: links[0][2], nature: links[0][3] },
                };
            },
            prompt(links, player) {
                return '将一张牌当做' + (get.translation(links[0][3]) || '') + get.translation(links[0][2]) + '使用';
            },
        },
        ai: {
            save: true,
            respondSha: true,
            respondShan: true,
            skillTagFilter(player, tag, arg) {
                if (!player.countCards('hes') || (!game.hasPlayer(current => current != player && !current.hasSkill('zshy_taoluan_refuse')) && player.hp < 2)) return false;
                if (tag == 'respondSha' || tag == 'respondShan') {
                    if (arg == 'respond') return false;
                    return true;
                }
                return true;
            },
            order: 9,
            result: {
                player(player) {
                    var allshown = true,
                        players = game.filterPlayer();
                    for (var i = 0; i < players.length; i++) {
                        if (players[i].ai.shown == 0) {
                            allshown = false;
                        }
                        if (players[i] != player && players[i].countCards('h') && get.attitude(player, players[i]) > 0) {
                            return 1;
                        }
                    }
                    if (allshown) return 1;
                    return 0;
                },
            },
            threaten: 1.9,
        },
        group: 'zshy_taoluan_after',
        subSkill: {
            after: {
                charlotte: true,
                trigger: { player: 'useCardAfter' },
                sourceSkill: 'zshy_taoluan',
                filter(event, player) {
                    if (!game.hasPlayer(current => current != player)) return false;
                    return event.skill == 'zshy_taoluan_backup';
                },
                forced: true,
                popup: false,
                content() {
                    'step 0'
                    if (game.hasPlayer(current => current != player && !current.hasSkill('zshy_taoluan_refuse'))) {
                        player.chooseTarget(function (card, player, target) {
                            return target != player && !target.hasSkill('zshy_taoluan_refuse');
                        }, '滔乱<br><br><div class="text center">令一名其他角色选择一项：（未选择则你失去1点体力）①交给你一张与你以此法使用的牌类别不同的牌；②其失去1点体力且本回合〖滔乱〗无法再次选择其为此选择目标。'
                        ).set('ai', function (target) {
                            var player = _status.event.player;
                            if (player.countCards('hes') > 3) return get.attitude(player, target) < 0 && target.countCards('he')
                            if (get.attitude(player, target) > 0) {
                                if (get.attitude(target, player) > 0) {
                                    return target.countCards('he');
                                }
                                return target.countCards('he') / 2;
                            }
                            return get.attitude(player, target) < 0 && target.countCards('he');
                        });
                    } else player.loseHp(), event.finish();
                    'step 1'
                    if (result.targets) {
                        var target = result.targets[0];
                        event.target = target;
                        player.line(target, 'green');
                        var type = get.type(trigger.card, 'trick');
                        if (target.countCards('he') > 0) {
                            target.chooseCard('滔乱<br><br><div class="text center">交给' + get.translation(player) + '一张不为' + get.translation(type) + '牌的牌，或失去1点体力且本回合〖滔乱〗无法再次选择你为此选择目标', 'he', function (card, player, target) {
                                return get.type(card, 'trick') != _status.event.cardType;
                            }).set('cardType', type).set('ai', function (card) {
                                if (_status.event.att) {
                                    return 11 - get.value(card);
                                }
                                return 0;
                            }).set('att', get.attitude(target, player) > 0);
                        } else target.loseHp();
                    } else player.loseHp(), event.finish();
                    'step 2'
                    var target = event.target;
                    if (result.bool) {
                        target.give(result.cards, player);
                    } else {
                        target.loseHp();
                        target.addTempSkill('zshy_taoluan_refuse');
                    }
                },
            },
            backup: {},
            refuse: {},
        },
    },

};
const 原创之魂2017 = {
    zshy_zhongjian: {//忠鉴
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        filterTarget(event, player, target) {
            return target != player && target.countCards('h') > 0 && !target.hasSkill('zshy_zhongjian_After');
        },
        filter(event, player) {
            return game.countPlayer(function (current) {
                return current != player && current.countCards('h') > 0 && !current.hasSkill('zshy_zhongjian_After')
            }) > 0;
        },
        content() {
            'step 0'
            target.showHandcards();
            target.addTempSkill('zshy_zhongjian_After');
            'step 1'
            var hsx = target.getCards('h', function (card) {
                return !get.tag(card, 'damage');
            });
            var hsy = target.getCards('h', function (card) {
                return get.tag(card, 'damage');
            });
            if (hsx.length) event.boolx = true;
            if (hsy.length) event.booly = true;
            'step 2'
            if (event.boolx) {
                player.draw();
                player.chooseTarget(get.prompt('zshy_zhongjian'), '弃置一名角色区域内1张牌', function (card, player, target) {
                    return target.countDiscardableCards(player, 'hej');
                }).set('ai', function (target) {
                    var player = _status.event.player;
                    return get.effect(target, { name: 'guohe_copy2' }, player, player);
                });
            }
            else event.goto(4);
            'step 3'
            if (result.bool) {
                var target = result.targets[0];
                player.line(target, 'green');
                player.discardPlayerCard(target, 'hej', true);
            }
            'step 4'
            if (event.booly) {
                target.damage();
            }
        },
        ai: {
            order: 9,
            result: {
                target: -1,
            },
        },
        subSkill: {
            After: {
                charlotte: true,
            },
        },
    },
    zshy_caishi: {//才识
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'phaseZhunbeiBegin',
        },
        direct: true,
        content() {
            player.logSkill('zshy_caishi');
            player.recover();
            player.draw();
            player.addMark('zshy_caishi', 1);
        },
        mod: {
            maxHandcard(player, num) {
                return num + player.countMark('zshy_caishi');
            },
        },
    },

    zshy_fumian: {//福绵
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'phaseDrawBegin2',
        },
        forced: true,
        content() {
            var num = 1 + player.countMark('zshy_fumian');
            trigger.num += num;
        },
        marktext: '福绵',
        intro: {
            name2:  '福绵',
            content: 'mark',
        },
        mod: {
            maxHandcard(player, num) {
                return num + player.countMark('zshy_fumian') + 1;
            },
        },
        group: ['zshy_fumian_add'],
        subSkill: {
            add: {
                trigger: {
                    player: 'useCard2',
                },
                direct: true,
                sourceSkill: 'zshy_fumian',
                filter(event, player) {
                    if (get.color(event.card) != 'red') return false;
                    var info = get.info(event.card);
                    if (info.allowMultiple == false) return false;
                    if (event.targets && !info.multitarget) {
                        if (game.hasPlayer(function (current) {
                            return !event.targets.includes(current) &&
                                lib.filter.targetEnabled2(event.card, player, current);
                        })) return true;
                    }
                    return false;
                },
                content() {
                    'step 0'
                    var num = 1 + player.countMark('zshy_fumian');
                    player.chooseTarget(get.prompt('zshy_fumian'), [1, num], function (card, player, target) {
                        var player = _status.event.player;
                        return !trigger.targets.includes(target) && lib.filter.targetEnabled2(trigger.card, player, target);
                    }, '为' + get.translation(trigger.card) + '额外指定至多' + num + '个目标').set('ai', function (target) {
                        var player = _status.event.player;
                        return get.effect(target, trigger.card, player, player);
                    });
                    'step 1'
                    if (result.bool) {
                        var targets = result.targets.sortBySeat();
                        player.logSkill('zshy_fumian', targets);
                        trigger.targets.addArray(targets);
                        game.log(targets, '成为了', trigger.card, '额外的目标');
                    }
                },
            },
        },
    },
    zshy_daiyan: {//怠宴
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'phaseJieshuBegin',
        },
        direct: true,
        content() {
            'step 0'
            player.chooseTarget(get.prompt('zshy_daiyan'), '令一名角色摸一张牌', function (card, player, target) {
                return true;
            }).set('ai', function (target) {
                var player = _status.event.player, att = get.attitude(player, target);
                if (att > 0) return get.effect(target, { name: 'draw' }, player, player);
                return 0;
            });
            'step 1'
            if (result.bool) {
                var target = result.targets[0];
                player.logSkill('zshy_daiyan', target);
                var cardx = get.cardPile(function (card) {
                    return true;
                });
                if (cardx) {
                    target.gain(cardx, 'gain2');
                    if (get.color(cardx) == 'red') {
                        target.recover()
                    } else target.draw();
                    if (get.suit(cardx) == 'heart' || get.suit(cardx) == 'spade') player.addMark('zshy_fumian', 1);;
                };
            };
        },
        group: ['zshy_daiyan_remove'],
        subSkill: {
            remove: {
                trigger: {
                    player: 'phaseEnd',
                },
                charlotte: true,
                forced: true,
                filter(event, player) {
                    return player.countMark('zshy_fumian');
                },
                async content(event, trigger, player) {
                    await player.removeMark('zshy_fumian', player.countMark('zshy_fumian'));
                },
            },
        },
    },

    //墟徐氏
    zshy_wengua: {//问卦
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: ['phaseUseBegin', 'damageEnd'],
        },
        filter(event, player) {
            return event.player.isIn();
        },
        async cost(event, trigger, player) {
            event.result = await player.chooseBool(get.prompt(event.skill))
                .set('prompt2', `摸一张牌并令${get.translation(trigger.player)}展示牌顶的一张牌，然后你可用一张牌替换展示牌，最后其获得展示牌。若展示牌为：红桃，其增加1点体力上限并回复1点体力；方块：其出杀次数+1；梅花：其摸两张牌，然后手牌上限+1；黑桃：其减少1点体力上限`)
                .set('ai', function () {
                    if (event.player.countCards('hes', function (card) {
                        return get.suit(card) == 'spade';
                    }) > 0) {
                        return true;
                    }
                    return get.attitude(_status.event.player, trigger.player) > 2;
                })
                .forResult();
        },
        async content(event, trigger, player) {
            await player.draw();
            let cards = get.cards()[0];
            await trigger.player.showCards(cards, get.translation(event.name));
            const result = await player.chooseCard('hes', `问卦：选择一张牌替换展示牌${get.translation(cards)}`)
                .set('ai', function (card) {
                    if (get.attitude(_status.event.player, trigger.player) < 2) {
                        if (get.suit(cards) == 'spade') {
                            return 0;
                        }
                        return get.suit(card) == 'spade';
                    };
                    if (get.attitude(_status.event.player, trigger.player) > 2) {
                        if (get.suit(card) == 'spade') {
                            return 0;
                        }
                        if (trigger.player.hp <= 2 && trigger.player.isDamaged() && get.suit(cards) != 'heart') {
                            if (get.suit(card) == 'heart') {
                                return 9 - get.value(card);
                            };
                            return 3 - get.value(card);
                        };
                        if (get.suit(cards) == 'spade') {
                            return get.suit(card) != 'spade';
                        };
                        return 0;
                    }
                })
                .forResult();
            if (!result.bool) {
                trigger.player.gain(cards);
                const suit = get.suit(cards);
                switch (suit) {
                    case 'heart':
                        await trigger.player.gainMaxHp();
                        await trigger.player.recover();
                        break;
                    case 'diamond':
                        await trigger.player.addSkill(event.name + `_diamond`);
                        await trigger.player.addMark(event.name + `_diamond`, 1, false);
                        break;
                    case 'club':
                        await player.draw(2);
                        await trigger.player.addSkill(event.name + `_club`);
                        await trigger.player.addMark(event.name + `_club`, 1, false);
                        break;
                    case 'spade':
                        await trigger.player.loseMaxHp();
                        break;
                    default:
                        break;
                };
                return;
            };
            if (result.bool && result?.cards) {
                await trigger.player.showCards(result.cards[0], get.translation(event.name));
                trigger.player.gain(result.cards[0]);
                const suit = get.suit(result.cards[0]);
                switch (suit) {
                    case 'heart':
                        await trigger.player.gainMaxHp();
                        await trigger.player.recover();
                        break;
                    case 'diamond':
                        await trigger.player.addSkill(event.name + `_diamond`);
                        await trigger.player.addMark(event.name + `_diamond`, 1, false);
                        break;
                    case 'club':
                        await player.draw(2);
                        await trigger.player.addSkill(event.name + `_club`);
                        await trigger.player.addMark(event.name + `_club`, 1, false);
                        break;
                    case 'spade':
                        await trigger.player.loseMaxHp();
                        break;
                    default:
                        break;
                }
            }
        },
        global: 'zshy_wengua_wen',
        subSkill: {
            wen: {
                audio: 'zshy_wengua',
                enable: 'phaseUse',
                filter(event, player) {
                    return player.countCards('he') && !player.hasSkill('zshy_wengua_after') && game.hasPlayer(function (current) {
                        return current.hasSkill('zshy_wengua');
                    })
                },
                log: false,
                delay: false,
                filterCard: true,
                discard: false,
                lose: false,
                position: 'he',
                prompt() {
                    var player = _status.event.player;
                    var list = game.filterPlayer(function (current) {
                        return current.hasSkill('zshy_wengua');
                    });
                    if (list.length == 1 && list[0] == player) return '将一张牌置于牌堆顶或是牌堆底';
                    var str = '将一张牌交给' + get.translation(list);
                    if (list.length > 1) str += '中的一人';
                    return str;
                },
                check(card) {
                    if (card.name == 'sha') return 5;
                    return 8 - get.value(card);
                },
                content() {
                    'step 0'
                    var targets = game.filterPlayer(function (current) {
                        return current.hasSkill('zshy_wengua');
                    });
                    if (targets.length == 1) {
                        event.target = targets[0];
                        event.goto(2);
                    } else if (targets.length > 0) {
                        player.chooseTarget(true, '选择【问卦】的目标', function (card, player, target) {
                            return _status.event.list.includes(target);
                        })
                            .set('list', targets)
                            .set('ai', function (target) {
                                var player = _status.event.player;
                                return get.attitude(player, target);
                            });
                    } else {
                        event.finish();
                    }
                    'step 1'
                    if (result.bool && result.targets.length) {
                        event.target = result.targets[0];
                    } else {
                        event.finish();
                    }
                    'step 2';
                    if (event.target) {
                        player.logSkill('zshy_wengua', event.target);
                        player.addTempSkill('zshy_wengua_after', 'phaseUseEnd');
                        event.card = cards[0];
                        if (event.target != player) {
                            player.give(cards, event.target);
                        } else player.recover();
                    } else {
                        event.finish();
                    }
                    delete _status.noclearcountdown;
                    game.stopCountChoose();
                    'step 3';
                    if (event.target.getCards('he').includes(event.card)) {
                        event.target.chooseControlList('问卦', '将' + get.translation(event.card) + '置于牌堆顶', '将' + get.translation(event.card) + '置于牌堆底', event.target == player, function () {
                            if (get.attitude(event.target, player) < 0) return 2;
                            return 1;
                        });
                    } else {
                        event.finish();
                    }
                    'step 4';
                    event.index = result.index;
                    if (event.index == 0 || event.index == 1) {
                        var next = event.target.lose(event.card, ui.cardPile);
                        if (event.index == 0) next.insert_card = true;
                        game.broadcastAll(function (player) {
                            var cardx = ui.create.card();
                            cardx.classList.add('infohidden');
                            cardx.classList.add('infoflip');
                            player.$throw(cardx, 1000, 'nobroadcast');
                        }, event.target);
                    } else event.finish();
                    'step 5';
                    game.delay();
                    'step 6';
                    if (event.index == 1) {
                        game.log(event.target, '将得到的牌置于牌堆底');
                        if (ui.cardPile.childElementCount == 1 || player == event.target) {
                            player.draw(2);
                        } else {
                            game.asyncDraw([player, target], null, null);
                        }
                    } else if (event.index == 0) {
                        game.log(player, '将获得的牌置于牌堆顶');
                        if (ui.cardPile.childElementCount == 1 || player == event.target) {
                            player.draw(2, 'bottom');
                        } else {
                            game.asyncDraw([player, target], null, null, true);
                        }
                    }
                },
                ai: {
                    order: 2,
                    threaten: 1.5,
                    result: {
                        player(player, target) {
                            var target = game.findPlayer(function (current) {
                                return current.hasSkill('zshy_wengua');
                            });
                            if (target) {
                                return get.attitude(player, target);
                            }
                        },
                    },
                },
            },
            after: {},
            diamond: {
                charlotte: true,
                onremove: true,
                mod: {
                    cardUsable(card, player, num) {
                        if (card.name == 'sha') {
                            return num += player.countMark('zshy_wengua_diamond');
                        }
                    },
                },
                marktext: '方卦',
                intro: {
                    content: `出杀次数+#`,
                },
            },
            club: {
                charlotte: true,
                onremove: true,
                mod: {
                    maxHandcardBase(player, num) {
                        return num += player.countMark('zshy_wengua_club');
                    },
                },
                marktext: '梅卦',
                intro: {
                    content: `手牌上限+#`,
                },
            },
        },
    },
    zshy_fuzhu: {//伏诛
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'phaseJieshuBegin',
        },
        round: 1,
        filter(event, player) {
            return event.player != player;
        },
        check(event, player) {
            return get.attitude(player, event.player) < 0 && get.effect(event.player, { name: 'sha' }, player, player) > 0;
        },
        logTarget: 'player',
        skillAnimation: true,
        animationColor: 'wood',
        onWash() {
            _status.event.getParent('zshy_fuzhu').washed = true;
            return 'remove';
        },
        content() {
            'step 0'
            event.washed = false;
            lib.onwash.push(lib.skill.zshy_fuzhu.onWash);
            event.num = 0;
            'step 1'
            event.num++;
            var card = get.cardPile2(function (card) {
                return card.name == 'sha' && player.canUse(card, trigger.player, false);
            });
            if (card) {
                player.useCard(card, trigger.player, false);
            }
            'step 2'
            if (!event.washed && trigger.player.isIn() && event.num <= 30) {
                event.goto(1);
            }
            'step 3'
            lib.onwash.remove(lib.skill.zshy_fuzhu.onWash);
            game.washCard();
        },
        ai: {
            threaten: 1.5,
        },
    },

    zshy_shouxi: {//守玺
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            target: 'useCardToTargeted',
        },
        direct: true,
        init(player) {
            if (!player.storage.zshy_shouxi) player.storage.zshy_shouxi = [];
        },
        filter(event, player) {
            return get.tag(event.card, 'damage') == true && event.player.isIn();
        },
        content() {
            'step 0';
            var list = lib.inpile.filter(function (i) {
                if (player.storage.zshy_shouxi.includes(i)) return false;
                var type = get.type2(i);
                if (type == 'basic' || type == 'trick') return true;
                return false;
            });
            for (var i = 0; i < list.length; i++) {
                list[i] = [get.type(list[i]), '', list[i]];
            }
            player.chooseButton([get.prompt('zshy_shouxi', trigger.player), [list, 'vcard']]).set('ai', function (button) {
                return Math.random();
            });
            'step 1';
            if (result.bool) {
                player.logSkill('zshy_shouxi');
                var name = result.links[0][2];
                event.vcard = result.links;
                event.cardname = name;
                player.storage.zshy_shouxi.add(name);
                player.popup(name);
                game.log(player, '声明了', '#y' + get.translation(name));
            } else {
                event.finish();
            }
            'step 2';
            var name = event.cardname;
            trigger.player.chooseToDiscard(function (card) {
                return card.name == _status.event.cardname;
            }).set('ai', function (card) {
                if (_status.event.att < 0 && (get.effect(_status.event.player, { name: 'losehp' }, _status.event.player, player) > 0 || player.hp > 1)) {
                    return 10 - get.value(card);
                }
                return 0;
            }).set('att', get.attitude(trigger.player, player)).set('cardname', name)
                .set('dialog', ['守玺：请弃置一张【' + get.translation(name) + '】，否则此【杀】对' + get.translation(player) + '无效', [event.vcard, 'vcard']]);
            'step 3'
            if (result.bool == false) {
                trigger.excluded.push(player);
            } else {
                trigger.player.loseHp();
            }
        },
        ai: {
            effect: {
                target_use(card, player, target, current) {
                    if (get.tag(card, 'damage') == true && get.attitude(player, target) < 0) {
                        return 0.3;
                    }
                },
            },
        },
        group: ['zshy_shouxi_after'],
        subSkill: {
            after: {
                audio: 'zshy_shouxi',
                trigger: {
                    player: ['useCard'],
                },
                filter(event, player) {
                    return player.storage.zshy_shouxi.includes(get.name(event.card));
                },
                content() {
                    trigger.directHit.addArray(game.players);
                    player.draw();
                },
            },
        },
    },
    zshy_huimin: {//惠民
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: ['recoverEnd', 'phaseJieshuBegin'],
        },
        direct: true,
        async content(event, trigger, player) {
            const str = '对任意名其他角色使用一张【五谷丰登】，然后你选择回复1点体力或摸一张牌';
            const result = await player.chooseTarget(get.prompt('zshy_huimin'), str, [1, Infinity],
                function (event, target, player) {
                    return target != player;
                }).set('ai', function (target) {
                    var player = _status.event.player;
                    return get.effect(target, { name: 'wugu' }, player, player) > 0
                        || get.recoverEffect(target, player, player) > 0;
                }).forResult();
            if (result.bool) {
                const targets = result.targets.sortBySeat();
                await player.logSkill('zshy_huimin', targets);
                await player.useCard({ name: 'wugu', isCard: true }, targets, true);
                await player.chooseDrawRecover(true);
            }
        },
        ai: {
            expose: 0.7,
        },
    },

    zshy_qingxian: {//清弦
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: ['damageEnd', 'recoverEnd'],
        },
        async cost(event, trigger, player) {
            var str = `令一名非${get.translation(trigger.player)}角色执行一项：①失去1点体力并弃置1张装备牌；②回复1点体力并随机使用1张装备牌。`;
            event.result = await player.chooseTarget(get.prompt(event.skill), str, function (card, player, target) {
                return target != trigger.player;
            }).set('ai', function (target) {
                let player = _status.event.player;
                let att = get.attitude(player, target);
                if (att > 0 && get.recoverEffect(target, player, player) > 0) {
                    return 1;
                }
                return get.effect(target, { name: 'losehp' }, player, player);
            }).forResult();
        },
        async content(event, trigger, player) {
            const target = event.targets[0];
            const list = [
                '令' + get.translation(target) + '失去1点体力并弃置1张装备牌',
                '令' + get.translation(target) + '回复1点体力并随机使用1张装备牌',
            ];
            const result = await player.chooseControl(true).set('choiceList', list).set('ai', function () {
                if (get.attitude(player, target) > 0) return 1;
                return 0;
            }).set('prompt', '清弦：请选择一项').forResult();
            if (!result) {
                await player.draw();
                return;
            }
            if (result?.index == 0) {
                game.addVideo(event.name + `_jilie`, target);
                target.loseHp();
                if (target.countCards('he', { type: 'equip' })) {
                    target.chooseToDiscard('he', true, '清弦：请弃置1张装备牌', function (card) {
                        return get.type(card) == 'equip';
                    }).set('ai', function (card) {
                        var val = -get.value(card);
                        if (get.suit(card) == 'club') val += _status.event.att * 10;
                        return val;
                    }).set('att', get.sgnAttitude(target, player));
                }
            } else {
                game.addVideo(event.name + `_rouhe`, target);
                target.recover();
                event.card = get.cardPile(function (card) {
                    return get.type(card) == 'equip' && target.canUse(card, target);
                });
                if (event.card) {
                    target.chooseUseTarget(event.card, 'nothrow', 'nopopup', true);
                }
            };
            await player.draw();
        },
        subSkill: {
            jilie: { audio: 'ext:诸神寰宇/audio/character:2', },
            rouhe: { audio: 'ext:诸神寰宇/audio/character:2', },
        },
    },
    zshy_juexiang: {//绝响
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'die',
        },
        direct: true,
        forceDie: true,
        content() {
            'step 0'
            var str = '令一名其他角色获得〖清弦〗';
            player.chooseTarget(get.prompt('zshy_juexiang'), lib.filter.notMe, str).set('ai', function (target) {
                var att = get.attitude(_status.event.player, target);
                return att;
            });
            'step 1'
            if (result.bool) {
                var target = result.targets[0];
                player.logSkill('zshy_juexiang', target);
                target.addSkillLog('zshy_qingxian');
            }
        },
    },

    zshy_jianzhen: {//谏征
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'useCardToPlayer',
        },
        direct: true,
        filter(event, player) {
            if (!get.tag(event.card, 'damage') || !player.countCards('hes')) return false;
            if (!['basic', 'trick'].includes(get.type(event.card))) return false;
            return event.player != player && !event.targets.includes(player);
        },
        content() {
            'step 0'
            var effect = 0;
            for (var i = 0; i < trigger.targets.length; i++) {
                effect -= get.effect(trigger.targets[i], trigger.card, trigger.player, player);
            }
            if (effect > 0) {
                if (get.color(trigger.card) == 'red') effect = 0;
                else effect = 1;
                if (trigger.targets.length == 1) {
                    if (trigger.targets[0].hp == 1) effect++;
                    if (effect > 0 && trigger.targets[0].countCards('h') < player.countCards('h')) effect++;
                }
                if (effect > 0) effect += 6;
            }
            var str = '谏征：是否将1张牌置于牌堆顶或牌堆底并取消' + get.translation(trigger.card) + '的所有目标？';
            player.chooseCard(str, 'hes').set('effect', effect).set('ai', function (card) {
                if (_status.event.effect >= 0) {
                    var val = get.value(card);
                    if (val < 0) return 10 - val;
                    return _status.event.effect - val;
                }
                return 0;
            }).set('logSkill', ['zshy_jianzhen', trigger.player]);
            'step 1'
            if (result.bool && result.cards) {
                event.card = result.cards[0];
                trigger.targets.length = 0;
                trigger.getParent().triggeredTargets1.length = 0;
                game.delayx();
            }
            else event.finish();
            'step 2'
            player.chooseControl('牌堆顶', '牌堆底').set('ai', function () {
                var player = _status.event.player;
                if (Math.random() < 0.5) return '牌堆底';
                return '牌堆顶';
            }).set('prompt', '谏征：请将' + get.translation(event.card) + '放置于……');
            'step 3'
            if (event.card) {
                player.logSkill('zshy_jianzhen', trigger.player);
                var next = player.lose(event.card, ui.cardPile);
                if (result.control == '牌堆顶') next.insert_card = true;
                game.broadcastAll(function (player) {
                    var cardx = ui.create.card();
                    cardx.classList.add('infohidden');
                    cardx.classList.add('infoflip');
                    player.$throw(cardx, 1000, 'nobroadcast');
                }, player);
                if (result.control == '牌堆顶') {
                    game.log(player, '将1张牌置于牌堆顶');
                }
                else game.log(player, '将1张牌置于牌堆底');
                game.delayx();
            }
            'step 4'
            if (get.suit(trigger.card) == 'heart' || get.suit(trigger.card) == 'spade') {
                trigger.getParent().targets.push(player);
                trigger.player.line(player);
                player.draw();
                game.delay();
            }
        },
        ai: {
            expose: 0.2,
        },
    },
    zshy_zhuandui: {//专对
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'useCardToPlayered',
        },
        direct: true,
        shaRelated: true,
        filter(event, player) {
            if (event.getParent().triggeredTargets3.length > 1) return false;
            if (!['basic', 'trick'].includes(get.type(event.card))) return false;
            if (!get.tag(event.card, 'damage')) return false;
            return player.countCards('h');
        },
        content() {
            'step 0'
            player.draw();
            player.chooseTarget(get.prompt('zshy_zhuandui'), function (card, player, target) {
                return _status.event.targets.includes(target) && player.canCompare(target);
            }, '与其中一个目标角色拼点，若你赢，则你摸1张牌并令其不能响应' + get.translation(trigger.card)).set('ai', function (target) {
                var player = _status.event.player;
                return -get.attitude(player, target);
            }).set('targets', trigger.targets);
            'step 1'
            if (result.bool) {
                var target = result.targets[0];
                event.target = target;
                player.logSkill('zshy_zhuandui', target);
                player.chooseToCompare(target);
            }
            else event.finish();
            'step 2'
            if (result.bool) {
                player.recover();
                trigger.getParent().directHit.add(target);
                game.log(player, '令', target, '不能响应', trigger.card);
            }
        },
        ai: {
            directHit_ai:  true,
            skillTagFilter(player, tag, arg) {
                if (player._zshy_zhuandui_temp || tag !== 'directHit_ai') return false;
                player._zshy_zhuandui_temp = true;
                var bool = function () {
                    if (arg.card.name != 'sha' || get.attitude(player, arg.target) >= 0 || !arg.target.countCards('h')) return false;
                    if (arg.target.countCards('h') == 1 && (!arg.target.hasSkillTag('freeShan', false, {
                        player: player,
                        card: arg.card
                    }, true) || player.hasSkillTag('unequip', false, {
                        name: arg.card ? arg.card.name : null,
                        target: arg.target,
                        card: arg.card
                    }) || player.hasSkillTag('unequip_ai', false, {
                        name: arg.card ? arg.card.name : null,
                        target: arg.target,
                        card: arg.card
                    }))) return true;
                    return player.countCards('h', function (card) {
                        return card != arg.card && (!arg.card.cards || !arg.card.cards.includes(card)) &&
                            get.value(card) <= 4 && (get.number(card) >= (11 + arg.target.countCards('h') / 2) || ['heart', 'none'].includes(get.suit(card, player)) || get.type(card, player) == 'land');
                    }) > 0;
                }();
                delete player._zshy_zhuandui_temp;
                return bool;
            },
            effect: {
                target(card, player, target, current) {
                    if (card.name == 'sha' && current < 0) return 0.7;
                },
            },
        },
        group: ['zshy_zhuandui_defense'],
        subSkill: {
            defense: {
                audio: 'zshy_zhuandui',
                trigger: {
                    target: 'useCardToTargeted',
                },
                sourceSkill: 'zshy_zhuandui',
                check(event, player) {
                    return get.effect(player, event.card, event.player, player) < 0;
                },
                filter(event, player) {
                    if (!get.tag(event.card, 'damage') || player == event.player) return false;
                    if (!['basic', 'trick'].includes(get.type(event.card))) return false;
                    return player.canCompare(event.player);
                },
                logTarget: 'player',
                'prompt2'(event, player) {
                    return '与' + get.translation(event.player) + '拼点，若你赢，则你选择回复1点体力或摸一张牌并此牌对你无效';
                },
                content() {
                    'step 0'
                    player.draw();
                    player.chooseToCompare(trigger.player);
                    'step 1'
                    if (result.bool) {
                        player.recover();
                        trigger.getParent().excluded.add(player);
                        game.log(player, '令', trigger.card, '对其无效');
                    }
                },
            },
        },
    },
    zshy_tianbian: {//天辩
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'compare',
            target: 'compare',
        },
        direct: true,
        filter(event, player) {
            if (event.player == player) {
                if (event.iwhile) return false;
                return ['heart', 'spade'].includes(get.suit(event.card1));
            }
            else {
                return ['heart', 'spade'].includes(get.suit(event.card2));
            }
        },
        content() {
            game.log(player, '拼点牌点数视为无穷大');
            if (player == trigger.player) trigger.num1 = Infinity;
            else trigger.num2 = Infinity;
        },
        group: ['zshy_tianbian_top'],
        subSkill: {
            top: {
                audio: 'zshy_tianbian',
                enable: 'chooseCard',
                sourceSkill: 'zshy_tianbian',
                check(event, player) {
                    var player = _status.event.player;
                    return (!player.hasCard(function (card) {
                        var val = get.value(card);
                        return val < 0 || (val <= 4 && (get.number(card) >= 11 || ['heart', 'spade'].includes(get.suit(card))));
                    }, 'h')) ? 20 : 0;
                },
                filter(event) {
                    return event.type == 'compare' && !event.directresult;
                },
                onCompare(player) {
                    return game.cardsGotoOrdering(get.cards()).cards;
                },
            },
        },
    },

    zshy_funan: {//复难
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: ['respond', 'useCard'],
        },
        frequent: true,
        filter(event, player) {
            if (!event.respondTo) return false;
            if (event.player == player) return false;
            return event.cards.filterInD('od').length > 0;
        },
        check(event, player) {
            return true;
        },
        async content(event, trigger, player) {
            let cards = trigger.cards.filterInD('od');
            player.gain(cards, 'log', 'gain2');
        },
    },
    zshy_jiexun: {//戒训
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'phaseJieshuBegin',
        },
        onremove: true,
        direct: true,
        content() {
            'step 0';
            var num1 = game.countPlayer(function (current) {
                return current.countCards('ej', { suit: 'diamond' });
            });
            var num2 = player.countMark('zshy_jiexun');
            event.num1 = num1;
            event.num2 = num2;
            var str = '令目标摸' + get.cnNumber(num1) + '张牌';
            if (num2) {
                str += '，然后弃置' + get.cnNumber(num2) + '张牌';
            }
            player
                .chooseTarget(get.prompt('zshy_jiexun'), function (card, player, target) {
                    return target != player;
                })
                .set('ai', function (target) {
                    return _status.event.coeff * get.attitude(_status.event.player, target);
                })
                .set('coeff', num1 >= num2 ? 1 : -1)
                .set('prompt2', str);
            'step 1';
            if (result.bool) {
                var target = result.targets[0];
                event.target = target;
                player.logSkill('zshy_jiexun', target);
                if (event.num1) {
                    target.draw(event.num1);
                }
                player.addMark('zshy_jiexun', 1, false);
            } else {
                event.finish();
            }
            'step 2';
            if (event.num2) {
                event.target.chooseToDiscard(event.num2, true, 'he');
                player.recover();
                player.draw(event.num2);
            } else {
                player.recover();
                event.finish();
            }
            'step 3';
            if (event.target.countCards('he') == 0) {
                player.removeMark('zshy_jiexun', player.countMark('zshy_jiexun'), false);
                event.target.damage();
            }
        },
        intro: {
            content: '已经发动过了#次',
        },
    },

    zshy_bizhuan: {//辟撰
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: ['useCard', 'respond'],
            target: 'useCardToTargeted',
        },
        filter(event, player) {
            if (event.name != 'useCard' && event.player == event.target) return false;
            return get.suit(event.card) == 'spade' || get.suit(event.card) == 'heart';
        },
        intro: {
            content: 'expansion',
            markcount: 'expansion',
        },
        frequent: true,
        content() {
            player.addToExpansion(get.cards(), 'gain2').gaintag.add('zshy_bizhuan');
            if (get.suit(trigger.card) == 'spade') player.draw();
            else player.recover();
        },
        mod: {
            maxHandcard(player, num) {
                return num + player.getExpansions('zshy_bizhuan').length;
            },
        },
        ai: {
            notemp: true,
            filterDamage(card) {
                if (card.suit == 'heart') return true;
                return false;
            },
        },
    },
    zshy_tongbo: {//通博
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: ['phaseDrawAfter', 'phaseUseAfter'],
            global: ['zshy_bizhuanAfter'],
        },
        filter(event, player) {
            return player.getExpansions('zshy_bizhuan').length > 0 && player.countCards('he') > 0;
        },
        direct: true,
        content() {
            'step 0';
            player.logSkill('zshy_tongbo');
            var four = false;
            var nofour = !player.hasFriend();
            var expansions = player.getExpansions('zshy_bizhuan');
            if (expansions.length >= 4) {
                var suits = ['club', 'spade', 'heart', 'diamond'];
                var list = player.getCards('he').concat(expansions);
                for (var i = 0; i < list.length; i++) {
                    suits.remove(get.suit(list[i]));
                    if (suits.length == 0) {
                        four = true;
                        break;
                    }
                }
            }
            var next = player.chooseToMove('通博：是否交换「书」和手牌？').set('four', four).set('nofour', nofour);
            next.set('list', [
                [get.translation(player) + '（你）的「书」', expansions],
                ['你的牌', player.getCards('he')],
            ]);
            next.set('filterMove', function (from, to) {
                return typeof to != 'number';
            });
            next.set('processAI', function (list) {
                var player = _status.event.player,
                    cards = list[0][1].concat(list[1][1]),
                    cards2 = [];
                if (_status.event.four) {
                    var sorted = [[], [], [], []];
                    for (var i of cards) {
                        var index = lib.suit.indexOf(get.suit(i, false));
                        if (sorted[index]) sorted[index].push(i);
                    }
                    if (_status.event.nofour) {
                        sorted.sort(function (a, b) {
                            return a.length - b.length;
                        });
                        var cards3 = cards.slice(0).sort(function (a, b) {
                            return get.useful(a) - get.useful(b);
                        });
                        cards3.removeArray(sorted[0]);
                        cards2 = cards3.slice(0, 4);
                        cards.removeArray(cards2);
                    } else {
                        for (var i of sorted) {
                            cards2.push(i.randomGet());
                            cards.remove(cards2);
                        }
                    }
                } else {
                    cards.sort(function (a, b) {
                        return get.useful(a) - get.useful(b);
                    });
                    cards2 = cards.splice(0, player.getExpansions('zshy_bizhuan').length);
                }
                return [cards2, cards];
            });
            'step 1';
            if (result.bool) {
                var pushs = result.moved[0],
                    gains = result.moved[1];
                pushs.removeArray(player.getExpansions('zshy_bizhuan'));
                gains.removeArray(player.getCards('he'));
                if (!pushs.length || pushs.length != gains.length) {
                    event.finish();
                    return;
                }
                player.logSkill('tongbo');
                player.addToExpansion(pushs, 'give', player).gaintag.add('zshy_bizhuan');
                player.gain(gains, 'gain2');
            }
            'step 2';
            var suits2 = ['club', 'spade', 'heart', 'diamond'];
            var expansions = player.getExpansions('zshy_bizhuan');
            for (var i = 0; i < expansions.length; i++) {
                suits2.remove(get.suit(expansions[i]));
            }
            if (suits2.length > 0) {
                event.finish();
            }
            'step 3';
            event.cards = player.getExpansions('zshy_bizhuan').slice(0);
            if (event.cards.length > 1) {
                player.chooseCardButton('将所有「书」交给任意名其他角色', true, event.cards, [1, event.cards.length]).set('ai', function (button) {
                    if (ui.selected.buttons.length == 0) return 1;
                    return 0;
                });
            } else if (event.cards.length == 1) {
                event._result = { links: event.cards.slice(0), bool: true };
            } else {
                event.finish();
            }
            'step 4';
            if (result.bool) {
                for (var i = 0; i < result.links.length; i++) {
                    event.cards.remove(result.links[i]);
                }
                event.togive = result.links.slice(0);
                player
                    .chooseTarget('将' + get.translation(result.links) + '交给一名其他角色', true, function (card, player, target) {
                        return target != player;
                    })
                    .set('ai', function (target) {
                        var att = get.attitude(_status.event.player, target);
                        if (_status.event.enemy) {
                            return -att;
                        } else if (att > 0) {
                            return att / (1 + target.countCards('h'));
                        } else {
                            return att / 100;
                        }
                    })
                    .set('enemy', get.value(event.togive[0], player, 'raw') < 0);
            } else {
                event.finish();
            }
            'step 5';
            if (result.targets.length) {
                result.targets[0].gain(event.togive, 'draw').giver = player;
                player.line(result.targets[0], 'green');
                game.log(result.targets[0], '获得了' + get.cnNumber(event.togive.length) + '张', '#g「书」');
                if (event.cards.length) event.goto(3);
                else player.addMark('zshy_tongbo', 2);
            }
        },
        ai: {
            combo: 'zshy_bizhuan',
        },
        group: ['zshy_tongbo_draw'],
        subSkill: {
            draw: {
                audio: 'zshy_tongbo',
                trigger: {
                    player: 'phaseDrawBegin',
                },
                direct: true,
                filter(event, player) {
                    return player.countMark('zshy_tongbo') > 0;
                },
                content() {
                    trigger.num += player.countMark('zshy_tongbo');
                },
            },
        },
    },

};

const skill_AD = {
    ...一将成名2011, ...一将成名2012, ...一将成名2013, ...一将成名2014, ...一将成名2015, ...原创之魂2016, ...原创之魂2017,
};

export default skill_AD;
