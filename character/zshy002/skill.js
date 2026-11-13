import { lib, game, ui, get, ai, _status } from '../../../../noname.js'
const 其疾如风 = {
    //墟魏延
    zshy_kuanggu: {//狂骨
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            source: ['damageEnd'],
        },
        forced: true,
        filter(event, player) {
            return event.num && event.num > 0;
        },
        async content(event, trigger, player) {
            if (player.isHealthy()) {
                player.gainMaxHp();
            }
            await player.chooseDrawRecover(true);
        },
        getIndex(event, player) {
            return event.num;
        },
        ai: {
            threaten: 1.5,
        },
    },
    zshy_qimou: {//奇谋
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        skillAnimation: true,
        animationColor: 'orange',
        async content(event, trigger, player) {
            const result1 = await player.chooseNumbers(get.prompt(event.name), [{ prompt: `请选择你要失去的体力值`, min: 1, max: player.getHp() }], true).set('processAI', () => {
                const player2 = get.player();
                let num = player2.getHp() - 1;
                if (player2.countCards('hs', { name: ['tao', 'jiu'] })) {
                    num = player2.getHp();
                }
                return [num];
            }).forResult();
            const num = result1.numbers[0];
            let useresult = false;
            if (num == player.hp) {
                useresult = true;
            };
            await player.loseHp(num);
            await player.draw(num);
            await player.changeHujia(num);
            player.addTempSkill('zshy_qimou_buff');
            player.addMark('zshy_qimou_buff', num, false);
            if (useresult == true) {
                let list = [];
                for (let i of lib.inpile) {
                    if (get.type(i) != 'trick') continue;
                    list.push(['trick', '', i]);
                }
                const result = await player.chooseButton(['奇谋：是否视为使用一张普通锦囊牌？', [list, 'vcard']], true).set('filterButton', function (button) {
                    let cardx = { name: button.link[2], isCard: true };
                    return game.hasPlayer(function (current) {
                        return player.canUse(cardx, current, false);
                    });
                }).set('ai', function (button) {
                    return player.getUseValue({ name: button.link[2], isCard: true });
                }).forResult();
                if (result.bool) {
                    let card = { name: result.links[0][2], isCard: true };
                    player.chooseUseTarget(card, true, 'nodistance').set('addCount', false).set('ai', function (event, player, target) {
                        var player = _status.event.player;
                        var att = get.attitude(player, target);
                        return att;
                    });
                };
            };
        },
        ai: {
            order: 14,
            result: {
                player(player) {
                    if (player.hp < 3) {
                        return false;
                    }
                    var mindist = player.hp;
                    if (player.countCards('hs', card => player.canSaveCard(card, player))) {
                        mindist++;
                    }
                    if (
                        game.hasPlayer(function (current) {
                            return get.distance(player, current) <= mindist && player.canUse('sha', current, false) && get.effect(current, { name: 'sha' }, player, player) > 0;
                        })
                    ) {
                        return 1;
                    }
                    return 0;
                },
            },
        },
        subSkill: {
            buff: {
                locked: true,
                onremove: true,
                marktext: '奇谋',
                charlotte: true,
                intro: {
                    content: '出杀次数、进攻距离与手牌上限+#',
                },
                mod: {
                    maxHandcardBase(player, num) {
                        return num += player.countMark('zshy_qimou_buff');
                    },
                    cardUsable(card, player, num) {
                        if (card.name == 'sha') {
                            return num += player.countMark('zshy_qimou_buff');
                        }
                    },
                    globalFrom(from, to, distance) {
                        return distance - from.countMark('zshy_qimou_buff');
                    },
                },
            },
        },
    },

    //墟夏侯渊
    zshy_shensu: {//神速
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AAZZxiahoubaJMGX: 'zshy_shensu_zshy_AAZZxiahoubaJMGX',
        },
        trigger: {
            player: ['phaseZhunbeiBefore', 'phaseJudgeBefore', 'phaseDiscardBefore'],
        },
        direct: true,
        async content(event, trigger, player) {
            var str = '跳过' + get.translation(trigger.name) + '并';
            trigger.name == 'phaseDiscard' ? str += '翻面' : str += '摸一张牌';
            str += '，然后视为对一名其他角色使用一张无视距离的【杀】';
            const result = await player.chooseTarget(get.prompt('zshy_shensu'), str, function (card, player, target) {
                if (player == target) return false;
                return player.canUse({ name: 'sha' }, target, false);
            }).set('ai', function (target) {
                return get.effect(target, { name: 'sha' }, _status.event.player);
            }).forResult();
            if (result.bool) {
                player.logSkill('zshy_shensu', result.targets[0]);
                trigger.cancel();
                if (trigger.name == 'phaseDiscard') {
                    player.turnOver();
                } else {
                    player.draw();
                }
                player.useCard({ name: 'sha', isCard: true }, result.targets[0], false);
            }
        },
        ai: {
            effect: {
                target(card, player, target, current) {
                    if (get.type(card) == 'delay') return 'zeroplayertarget';
                },
            },
        },
        group: ['zshy_shensu_damage'],
        subSkill: {
            zshy_AAZZxiahoubaJMGX: { audio: 'ext:诸神寰宇/audio/character:2' },
            damage: {
                trigger: {
                    player: 'useCardToTargeted',
                },
                direct: true,
                filter(event, player) {
                    return event.target != player && event.target.countCards('e') <= player.countCards('e');
                },
                content() {
                    trigger.directHit.addArray(game.filterPlayer());
                },
            },
        },
    },
    zshy_shebian: {//设变
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: ['turnOverEnd'],
        },
        forced: true,
        locked: false,
        async content(event, trigger, player) {
            await player.chooseDrawRecover(true);
            if (player.canMoveCard(null, true)) {
                await player.moveCard();
            };
            if (player.countCards('h')) {
                await player.chooseToUse({
                    filterCard(card) {
                        if (get.itemtype(card) != 'card' || get.position(card) != 'h' && get.position(card) != 's') return false;
                        return lib.filter.filterCard.apply(this, arguments);
                    },
                    prompt: '设变：是否使用一张手牌？'
                });
            }
        },
        group: ['zshy_shebian_damage'],
        subSkill: {
            damage: {
                audio: 'zshy_shebian',
                trigger: {
                    player: ['damageEnd'],
                },
                forced: true,
                locked: false,
                async content(event, trigger, player) {
                    player.turnOver();
                    player.draw();
                    if (player.canMoveCard(null, true)) {
                        await player.moveCard();
                    };
                    if (player.countCards('h')) {
                        await player.chooseToUse({
                            filterCard(card) {
                                if (get.itemtype(card) != 'card' || get.position(card) != 'h' && get.position(card) != 's') return false;
                                return lib.filter.filterCard.apply(this, arguments);
                            },
                            prompt: '设变：是否使用一张手牌？'
                        });
                    };
                },
                ai: {
                    order: 9,
                    result: {
                        player(player) {
                            if (player.isTurnedOver() || player.hp == 1 && (player.countCards('h', { name: 'tao' }) || player.countCards('h', { name: 'jiu' }))) return 0;
                        },
                    },
                    effect: {
                        target(card, player, target) {
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
            },
        },
    },

    //墟曹仁
    zshy_jushou: {//据守
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: ['phaseJieshuBegin', 'damageEnd'],
        },
        check(event, player) {
            if (player.isTurnedOver()) return true;
            if (player.isDying() || player.hp <= 1) return true;
            return player.hp < player.maxHp && player.countCards('h') <= 1;
        },
        async content(event, trigger, player) {
            await player.draw(4);
            player.recover();
            player.turnOver();
            const cardx = get.cardPile(function (card) {
                return get.type(card) == 'equip';
            });
            if (cardx) {
                player.gain(cardx);
                player.chooseToUse({ type: 'equip' }, `是否使用一张装备牌`);
            }
            else {
                player.say('无物可用，可惜……');
            }
        },
    },
    zshy_jiewei: {//解围
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'chooseToUse',
        filterCard: true,
        position: 'e',
        viewAs: { name: 'wuxie', },
        filter(event, player) {
            return player.countCards('e') > 0;
        },
        viewAsFilter(player) {
            return player.countCards('e') > 0;
        },
        prompt: '将一张装备区内的牌当无懈可击使用',
        check(card) {
            return 8 - get.equipValue(card);
        },
        threaten: 1.2,
        ai: {
            basic: {
                useful: [6, 4, 3],
                value: [6, 4, 3],
            },
        },
        group: ['zshy_jiewei_move'],
        subSkill: {
            move: {
                audio: 'zshy_jiewei',
                trigger: {
                    player: ['turnOverEnd'],
                },
                forced: true,
                locked: false,
                async content(event, trigger, player) {
                    if (player.canMoveCard()) {
                        await player.moveCard();
                    };
                    await player.draw();
                    if (player.countCards('h')) {
                        await player.chooseToUse({
                            filterCard(card) {
                                if (get.itemtype(card) != 'card' || get.position(card) != 'h' && get.position(card) != 's') return false;
                                return lib.filter.filterCard.apply(this, arguments);
                            },
                            prompt: '据守：是否使用一张手牌？'
                        });
                    }
                },
            },
        },
    },

    //墟小乔
    zshy_tianxiang: {//天香
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'damageBegin3',
        },
        direct: true,
        filter(event, player) {
            return player.countCards('hes', function (card) { return get.suit(card) == 'heart' });
        },
        content() {
            'step 0'
            var str = '重铸一张♥牌';
            player.chooseCard('hes', function (card) {
                return get.suit(card) == 'heart';
            }).set('ai', function (card) {
                if (get.damageEffect(player, trigger.source, player, trigger.nature) < 0) {
                    return 10 - get.value(card);
                }
                return 0 - get.value(card);
            }).set('prompt', get.prompt('zshy_tianxiang')).set('prompt2', str);
            'step 1'
            if (result.bool) {
                player.logSkill('zshy_tianxiang');
                player.recast(result.cards);
                trigger.cancel();
                var str = '防止即将受到的' + trigger.num + '点伤害';
                player.chooseTarget('请选择转移的目标', function (event, target, player) {
                    return target != player;
                }).set('ai', function (target) {
                    var player = _status.event.player;
                    return get.effect(target, { name: 'losehp' }, player, player) > 0 || get.damageEffect(target, player, player) > 0;
                });
            } else event.finish();
            'step 2'
            if (result.bool) {
                var targetx = result.targets[0];
                event.targetx = targetx;
                player.logSkill(event.name, targetx);
                event.source = false;
                if (trigger.source) event.source = trigger.source;
                player.chooseControl(true).set('choiceList', [
                    '视为' + get.translation(event.source) + '令' + get.translation(event.targetx) + '失去' + trigger.num + '点体力',
                    '视为' + get.translation(event.source) + '对' + get.translation(event.targetx) + '造成' + trigger.num + '点伤害',
                ]).set('ai', function (event, target, player) {
                    var player = _status.event.player;
                    var att = get.attitude(player, event.targetx);
                    if (event.targetx.hasSkillTag('maixie') || event.targetx.hasSkillTag('maixie_hp')) return 1;
                    if (att > 0) return 1;
                    return 0;
                }).set('prompt', '天香：请选择一项');
            }
            else event.finish();
            'step 4'
            if (result.index == 0) {
                event.targetx.loseHp(trigger.num);
            }
            else {
                if (event.source == false) event.targetx.damage(trigger.num, 'nosource');
                else event.targetx.damage(trigger.num).source = event.source;
            }
        },
        ai: {
            maixie_defend:  true,
            effect: {
                target(card, player, target) {
                    if (player.hasSkillTag('jueqing', false, target)) return;
                    if (get.tag(card, 'damage') && target.countCards('hes') > 1) return 0.7;
                },
            },
        },
    },
    zshy_hongyan: {//红颜
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'judge',
        },
        usable: 1,
        direct: true,
        filter(event, player) {
            if (event.fixedResult && event.fixedResult.suit) return event.fixedResult.suit == 'heart';
            return get.suit(event.player.judging[0], event.player) == 'heart';
        },
        content() {
            'step 0'
            var str = '红颜：' + get.translation(trigger.player) + '的' + (trigger.judgestr || '') + '判定为' +
                get.translation(trigger.player.judging[0]) + '，请选择改变成的花色？';
            player.chooseControl('heart', 'spade', 'diamond', 'club', 'none', 'cancel2').set('prompt', str).set('ai', function () {
                var judging = _status.event.judging;
                var trigger = _status.event.getTrigger();
                var res1 = trigger.judge(judging);
                var list = ['heart', 'spade', 'diamond', 'club', 'none'];
                var attitude = get.attitude(player, trigger.player);
                if (attitude == 0) return 0;
                var getj = function (suit) {
                    return trigger.judge({
                        name: get.name(judging),
                        nature: get.nature(judging),
                        suit: suit,
                        number: get.number(judging),
                    })
                };
                list.sort(function (a, b) {
                    return (getj(b) - getj(a)) * get.sgn(attitude);
                });
                if ((getj(list[0]) - res1) * attitude > 0) return list[0];
                return 'cancel2';
            }).set('judging', trigger.player.judging[0]);
            'step 1'
            if (result.control != 'cancel2') {
                player.logSkill('zshy_hongyan', target);
                player.addExpose(0.25);
                player.popup(result.control);
                game.log(player, '将判定结果改为了', '#y' + get.translation(result.control + 2));
                if (!trigger.fixedResult) trigger.fixedResult = {};
                trigger.fixedResult.suit = result.control;
                trigger.fixedResult.color = get.color({ suit: result.control });
            }
        },
        ai: {
            rejudge: true,
            tag: {
                rejudge: 0.4,
            },
            expose: 0.5,
        },
        mod: {
            suit(card, suit) {
                if (suit == 'spade') return 'heart';
            },
        },
    },
    zshy_piaoling: {//飘零
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'loseAfter',
            global: ['equipAfter', 'addJudgeAfter', 'gainAfter', 'loseAsyncAfter', 'addToExpansionAfter'],
        },
        forced: true,
        filter(event, player) {
            let evt = event.getl(player);
            if (!evt || !evt.cards2 || !evt.cards2.length) return false;
            for (let i of evt.cards2) {
                return true;
            }
            return false;
        },
        content() {
            'step 0'
            event.count = 0;
            var cards = trigger.getl(player).hs;
            for (i of cards) {
                event.count++;
            }
            'step 1'
            event.count--;
            player.judge(function (card) {
                if (get.suit(card) != 'heart') return 8;
                return 1;
            });
            'step 2'
            if (result.suit == 'heart') {
                player.gain(result.card, 'gain2');
                player.chooseTarget(get.prompt('zshy_piaoling'), '弃置一名角色区域内一张牌', function (card, player, target) {
                    return target.countDiscardableCards(player, 'hej');
                }).set('ai', function (target) {
                    var player = _status.event.player;
                    return get.effect(target, { name: 'guohe_copy2' }, player, player) > 0;
                });
            }
            else event.goto(4);
            'step 3'
            if (result.bool) {
                player.line(result.targets[0]);
                player.discardPlayerCard(result.targets[0], 'hej', true);
            }
            'step 4'
            if (event.count > 0) {
                player.logSkill('zshy_piaoling');
                event.goto(1);
            }
        },
    },

    //墟黄忠
    zshy_liegong: {//烈弓
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'useCardToTargeted',
        },
        derivation: ['zshy_moshi'],
        shaRelated: true,
        check(event, player) {
            var target = event.target;
            return get.attitude(player, target) < 0;
        },
        filter(event, player) {
            var target = event.target;
            if (get.name(event.card) != 'sha' || event.targets.length != 1) return false;
            return player.isHealthy() || target.countCards('h') > 1 || target.hp > 1;
        },
        prompt2(event, player) {
            var str = '令' + get.translation(event.target) + '不能响应' + get.translation(event.card);
            var hp = 0, target = event.target;
            if (player.isHealthy()) hp++;
            if (target.countCards('h') > 1) hp++;
            if (target.hp > 1) hp++;
            str += '且此【杀】对其的伤害基数+' + hp;
            return str;
        },
        content() {
            var target = trigger.target;
            trigger.getParent().directHit.push(target);
            var id = target.playerid, hp = 0;
            var map = trigger.getParent().customArgs;
            if (player.isHealthy()) hp++;
            if (target.countCards('h') > 1) hp++;
            if (target.hp > 1) hp++;
            if (!map[id]) map[id] = {};
            if (typeof map[id].extraDamage != 'number') {
                map[id].extraDamage = 0;
            }
            map[id].extraDamage += hp;
        },
        mod: {
            aiOrder(player, card, num) {
                if (card.name == 'sha') return num + Infinity;
            },
            targetInRange(card, player, target) {
                if (card.name == 'sha') {
                    return true;
                };
            },
        },
        ai: {
            order: 9,
            threaten: 2.5,
            directHit_ai:  true,
            skillTagFilter(player, tag, arg) {
                if (get.attitude(player, arg.target) <= 0 && arg.card.name == 'sha' && (player.isHealthy() ||
                    arg.target.countCards('h') > 1 || arg.target.hp > 1)) return true;
                return false;
            },
        },
    },

    //墟周泰
    zshy_buqu: {//不屈
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'chooseToUseBefore',
        },
        forced: true,
        filter(event, player) {
            return event.type == 'dying' && player.isDying() && event.dying == player && !event.getParent()._zshy_buqu;
        },
        content() {
            'step 0'
            trigger.getParent()._zshy_buqu = true;
            var card = get.cards()[0];
            event.card = card;
            player.addToExpansion(card, 'gain2').gaintag.add('zshy_buqu');
            'step 1'
            var cards = player.getExpansions('zshy_buqu'), num = get.number(card);
            player.showCards(cards, '不屈')
            for (var i = 0; i < cards.length; i++) {
                if (cards[i] != card && get.number(cards[i]) == num) {
                    player.gain(card, 'gain2');
                    return;
                }
            }
            trigger.cancel();
            trigger.result = { bool: true };
            if (player.hp <= 0) {
                player.recover(1 - player.hp);
                player.draw(player.maxHp);
            }
        },
        ai: {
            save: true,
            skillTagFilter(player, tag, target) {
                if (player != target) return false;
            },
        },
        marktext: '创',
        intro: {
            content: 'expansion',
            markcount: 'expansion',
        },
        mod: {
            maxHandcard(player, num) {
                return num + player.getExpansions('zshy_buqu').length;
            },
        },
    },
    zshy_fenji: {//奋激
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: ['gainAfter', 'loseAfter', 'loseAsyncAfter'],
        },
        filter(event, player) {
            if (event.name == 'lose') {
                if (event.type != 'discard' || !event.player.isIn()) return false;
                if ((event.discarder || event.getParent(2).player) == event.player) return false;
                if (!event.getl(event.player).hs.length) return false;
                return true;
            }
            else if (event.name == 'gain') {
                if (event.giver || event.getParent().name == 'gift') return false;
                const cards = event.getg(event.player);
                if (!cards.length) return false;
                return game.hasPlayer(function (current) {
                    if (current == event.player) return false;
                    const hs = event.getl(current).hs;
                    for (const i of hs) {
                        if (cards.includes(i)) return true;
                    }
                    return false;
                });
            }
            else if (event.type == 'gain') {
                if (event.giver || !event.player || !event.player.isIn()) return false;
                const hs = event.getl(event.player);
                return game.hasPlayer(function (current) {
                    if (current == event.player) return false;
                    const cards = event.getg(current);
                    for (const i of cards) {
                        if (hs.includes(i)) return true;
                    }
                });
            }
            else if (event.type == 'discard') {
                if (!event.discarder) return false;
                return game.hasPlayer(function (current) {
                    return current != event.discarder && event.getl(current).hs.length > 0;
                });
            }
            return false;
        },
        getIndex(event) {
            const targets = [];
            if (event.name == 'gain') {
                const cards = event.getg(event.player);
                targets.addArray(
                    game.filterPlayer(function (current) {
                        if (current == event.player) return false;
                        const hs = event.getl(current).hs;
                        for (const i of hs) {
                            if (cards.includes(i)) return true;
                        }
                        return false;
                    })
                );
            } else if (event.name == 'loseAsync' && event.type == 'discard') {
                targets.addArray(
                    game.filterPlayer(function (current) {
                        return current != event.discarder && event.getl(current).hs.length > 0;
                    })
                );
            } else targets.push(event.player);
            return targets;
        },
        async cost(event, trigger, player) {
            const target = event.indexedData;
            event.result = await player.chooseBool(get.prompt('zshy_fenji', target), '摸一张牌，令该角色选择回复1点体力或摸两张牌')
                .set('ai', () => get.attitude(player, target) > 2).forResult();
        },
        async content(event, trigger, player) {
            const target = event.indexedData;
            await player.draw();
            await target.chooseDrawRecover(2, true);
        },
    },

    //墟于吉
    zshy_guhuo: {//蛊惑
        audio: 'ext:诸神寰宇/audio/character:2',
        derivation: ['zshy_chanyuan'],
        enable: ['chooseToUse', 'chooseToRespond'],
        hiddenCard(player, name) {
            return lib.inpile.includes(name) && player.countCards('h') > 0 && player.hasMark('zshy_guhuo');
        },
        filter(event, player) {
            if (!player.countCards('hs') || !player.hasMark('zshy_guhuo')) return false;
            for (var i of lib.inpile) {
                var type = get.type(i);
                if ((type == 'basic' || type == 'trick') && event.filterCard(get.autoViewAs({ name: i }, 'unsure'), player, event)) return true;
                if (i == 'sha') {
                    for (var j of lib.inpile_nature) {
                        if (event.filterCard(get.autoViewAs({ name: i, nature: j }, 'unsure'), player, event)) return true;
                    }
                }
            }
            return false;
        },
        chooseButton: {
            dialog() {
                var list = [];
                for (var i of lib.inpile) {
                    var type = get.type(i);
                    if (type == 'basic' || type == 'trick') list.push([type, '', i]);
                    if (i == 'sha') {
                        for (var j of lib.inpile_nature) list.push(['基本', '', 'sha', j]);
                    }
                }
                return ui.create.dialog('蛊惑', [list, 'vcard']);
            },
            filter(button, player) {
                var evt = _status.event.getParent();
                return evt.filterCard(get.autoViewAs({ name: button.link[2], nature: button.link[3] }, 'unsure'), player, evt);
            },
            check(button) {
                var player = _status.event.player;
                var rand = _status.event.getParent().getRand('zshy_guhuo');
                var hasEnemy = game.hasPlayer(function (current) {
                    return current != player && !current.hasSkill('zshy_chanyuan') && (get.realAttitude || get.attitude)(current, player) < 0;
                });
                var card = { name: button.link[2], nature: button.link[3] };
                var val = _status.event.getParent().type == 'phase' ? player.getUseValue(card) : 1;
                if (val <= 0) return 0;
                if (hasEnemy && rand > 0.3) {
                    if (
                        !player.countCards('h', function (cardx) {
                            if (card.name == cardx.name) {
                                if (card.name != 'sha') return true;
                                return get.is.sameNature(card, cardx);
                            }
                            return false;
                        })
                    )
                        return 0;
                    return 3 * val;
                }
                return val;
            },
            backup(links, player) {
                return {
                    viewAs: {
                        name: links[0][2],
                        nature: links[0][3],
                        suit: 'none',
                        number: null,
                    },
                    filterCard(card, player, target) {
                        var result = true;
                        var suit = card.suit,
                            number = card.number;
                        card.suit = 'none';
                        card.number = null;
                        var mod = game.checkMod(card, player, 'unchanged', 'cardEnabled2', player);
                        if (mod != 'unchanged') result = mod;
                        card.suit = suit;
                        card.number = number;
                        return result;
                    },
                    position: 'hs',
                    ignoreMod: true,
                    ai1(card) {
                        var player = _status.event.player;
                        var hasEnemy = game.hasPlayer(function (current) {
                            return current != player && !current.hasSkill('zshy_chanyuan') && (get.realAttitude || get.attitude)(current, player) < 0;
                        });
                        var rand = _status.event.getRand('zshy_guhuo');
                        var cardx = lib.skill.zshy_guhuo_backup.viewAs;
                        if (hasEnemy && rand > 0.3) {
                            if (card.name == cardx.name && (card.name != 'sha' || get.is.sameNature(card, cardx))) return 10;
                            return 0;
                        }
                        else if (player.hp < 3) {
                            if (card.name == 'tao') return 100;
                        }
                        return 6 - get.value(card);
                    },
                    precontent() {
                        player.logSkill('zshy_guhuo');
                        player.addTempSkill('zshy_guhuo_guess');
                        var card = event.result.cards[0];
                        event.result.card.suit = get.suit(card);
                        event.result.card.number = get.number(card);
                    },
                };
            },
            prompt(links) {
                return '将一张手牌当做' + (get.translation(links[0][3]) || '') + get.translation(links[0][2]) + '使用';
            },
        },
        marktext: '蛊惑',
        intro: {
            content: '本回合〖蛊惑〗还可发动#次',
        },
        group: ['zshy_guhuo_Add'],
        subSkill: {
            guess: {//猜测
                trigger: {
                    player: ['useCardBefore', 'respondBefore'],
                },
                forced: true,
                silent: true,
                popup: false,
                charlotte: true,
                firstDo: true,
                filter(event, player) {
                    return event.skill && event.skill.indexOf('zshy_guhuo_') === 0;
                },
                content() {
                    'step 0'
                    player.removeMark('zshy_guhuo', 1);
                    event.fake = false;
                    var card = trigger.cards[0];
                    if (card.name != trigger.card.name || (card.name == 'sha' && !get.is.sameNature(trigger.card, card))) event.fake = true;
                    if (get.color(trigger.cards[0]) == 'red') event.fake = false;
                    player.line(trigger.targets, get.nature(trigger.card));
                    event.cardTranslate = get.translation(trigger.card.name);
                    trigger.card.number = get.number(card);
                    trigger.card.suit = get.suit(card);
                    trigger.skill = 'zshy_guhuo_backup';
                    if (trigger.card.name == 'sha' && get.natureList(trigger.card).length) event.cardTranslate = get.translation(trigger.card.nature) + event.cardTranslate;
                    player.popup(event.cardTranslate, trigger.name == 'useCard' ? 'metal' : 'wood');
                    event.prompt = '是否质疑' + get.translation(player) + '声明的' + event.cardTranslate + '？';
                    game.log(player, '声明了', '#y' + event.cardTranslate);
                    event.targets = game
                        .filterPlayer(function (current) {
                            return current != player && !current.hasSkill('zshy_chanyuan');
                        })
                        .sortBySeat();
                    event.targets2 = event.targets.slice(0);
                    player.lose(card, ui.ordering).relatedEvent = trigger;
                    if (!event.targets.length) event.goto(5);
                    else if (_status.connectMode) event.goto(3);
                    event.betrays = [];
                    'step 1';
                    event.target = targets.shift();
                    event.target.chooseButton([event.prompt, [['zshy_guhuo_ally', 'zshy_guhuo_betray'], 'vcard']], true, function (button) {
                        var player = _status.event.player;
                        var evt = _status.event.getParent('zshy_guhuo_guess');
                        if (!evt) return Math.random();
                        var ally = button.link[2] == 'zshy_guhuo_ally';
                        if (ally && (player.hp <= 1 || get.attitude(player, evt.player) >= 0)) return 1.1;
                        return Math.random();
                    });
                    'step 2';
                    if (result.links[0][2] == 'zshy_guhuo_betray') {
                        event.betrays.push(target);
                        target.addExpose(0.2);
                    }
                    event.goto(targets.length ? 1 : 5);
                    'step 3';
                    var list = event.targets.map(function (target) {
                        return [target, [event.prompt, [['zshy_guhuo_ally', 'zshy_guhuo_betray'], 'vcard']], true];
                    });
                    player.chooseButtonOL(list).set('switchToAuto', function () {
                        _status.event.result = 'ai';
                    }).set('processAI', function () {
                        var choice = Math.random() > 0.5 ? 'zshy_guhuo_ally' : 'zshy_guhuo_betray';
                        var player = _status.event.player;
                        var evt = _status.event.getParent('zshy_guhuo_guess');
                        if (player.hp <= 1 || (evt && (get.realAttitude || get.attitude)(player, evt.player) >= 0)) choice = 'zshy_guhuo_ally';
                        return {
                            bool: true,
                            links: [['', '', choice]],
                        };
                    });
                    'step 4';
                    for (var i in result) {
                        if (result[i].links[0][2] == 'zshy_guhuo_betray') {
                            event.betrays.push(lib.playerOL[i]);
                            lib.playerOL[i].addExpose(0.2);
                        }
                    }
                    'step 5';
                    for (var i of event.targets2) {
                        var b = event.betrays.includes(i);
                        i.popup(b ? '质疑' : '不质疑', b ? 'fire' : 'wood');
                        game.log(i, b ? '#y质疑' : '#g不质疑');
                    }
                    game.delay();
                    'step 6';
                    player.showCards(trigger.cards);
                    if (event.betrays.length) {
                        event.betrays.sortBySeat();
                        if (event.fake) {
                            for (var i of event.betrays) {
                                i.chooseDrawRecover(2, true);
                            }
                            trigger.cancel();
                            trigger.getParent().goto(0);
                            game.log(player, '声明的', '#y' + event.cardTranslate, '作废了');
                        } else {
                            var next = game.createEvent('zshy_guhuo_final', false);
                            event.next.remove(next);
                            trigger.after.push(next);
                            next.targets = event.betrays;
                            next.setContent(lib.skill.zshy_guhuo_guess.contentx);
                            player.chooseDrawRecover(2, true);
                            event.finish();
                        }
                    } else event.finish();
                    'step 7';
                    game.delayx();
                },
                contentx() {
                    'step 0'
                    event.target = targets.shift();
                    if (event.target.countCards > 0) {
                        event.target.chooseToDiscard(true, '弃置一张牌').set('ai', function (card) {
                            return 9 - get.value(card);
                        })
                    };
                    event.target.loseHp();
                    'step 1'
                    target.addSkills('zshy_chanyuan');
                    if (targets.length) event.goto(0);
                },
            },
            Add: {
                sub: true,
                trigger: {
                    global: ['phaseBefore'],
                },
                charlotte: true,
                forced: true,
                popup: false,
                silent: true,
                firstDo: true,
                content() {
                    var x = player.maxHp, y = player.countMark('zshy_guhuo');
                    if (y < x) player.addMark('zshy_guhuo', x - y);
                    else if (y > x) player.removeMark('zshy_guhuo', y - x);
                },
            },
            backup: {},
        },
        ai: {
            fireAttack: true,
            respondShan: true,
            respondSha: true,
            skillTagFilter(player) {
                if (!player.countCards('hs') || !player.hasMark('zshy_guhuo')) return false;
            },
            order: 10,
            result: {
                player: 1,
            },
            threaten: 1.3,
        },
    },
    zshy_chanyuan: {//缠怨
        init(player, skill) {
            if (player.hp <= 1) player.logSkill(skill);
            player.addSkillBlocker(skill);
        },
        onremove(player, skill) {
            player.removeSkillBlocker(skill);
        },
        skillBlocker(skill, player) {
            return skill != 'chanyuan' && skill != 'zshy_chanyuan' && !lib.skill[skill].charlotte && !lib.skill[skill].persevereSkill && player.hp <= 1;
        },
        mark: true,
        intro: {
            content(storage, player, skill) {
                var str = '<li>锁定技，你不能于〖蛊惑〗的结算流程中进行质疑。当你的体力值不大于1时，你的其他技能失效。';
                var list = player.getSkills(null, false, false).filter(function (i) {
                    return lib.skill.zshy_chanyuan.skillBlocker(i, player);
                });
                if (list.length) str += '<br><li>失效技能：' + get.translation(list);
                return str;
            },
        },
        audio: 2,
        trigger: { player: 'changeHp' },
        filter(event, player) {
            return get.sgn(player.hp - 1.5) != get.sgn(player.hp - 1.5 - event.num);
        },
        forced: true,
        content() { },
    },

    //墟张角
    zshy_leiji: {//雷击
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: ['useCard', 'respond'] },
        filter(event, player) {
            return get.name(event.card) == 'shan' || (event.name == 'useCard' && get.name(event.card) == 'shandian');
        },
        judgeCheck(card, bool) {
            var suit = get.suit(card);
            if (suit == 'spade') {
                if (bool && get.number(card) > 1 && get.number(card) < 10) return 5;
                return 4;
            }
            if (suit == 'club') return 2;
            return 0;
        },
        async content(event, trigger, player) {
            await player.judge(lib.skill.zshy_leiji.judgeCheck).set('judge2', function (result) {
                return result.bool ? true : false;
            })
        },
        group: 'zshy_leiji_misa',
        subSkill: {
            misa: {
                audio: 'zshy_leiji',
                trigger: { global: 'judgeEnd' },
                direct: true,
                filter(event, player) {
                    return ['spade', 'club'].includes(event.result.suit);
                },
                async content(event, trigger, player) {
                    let num = 1 + ['club', 'spade'].indexOf(trigger.result.suit);
                    if (num == 1 && player.isDamaged()) {
                        player.recover();
                    } else if (player.isDamaged()) {
                        player.recover(2);
                    };
                    const result = await player.chooseTarget('雷击：是否对一名角色造成' + num + '点雷电伤害？')
                        .set('ai', function (target) {
                            var player = _status.event.player;
                            return get.damageEffect(target, player, player, 'thunder');
                        }).forResult();
                    if (result?.targets) {
                        await player.logSkill('zshy_leiji', result.targets);
                        player.line(result.targets, 'thunder');
                        result.targets[0].damage(num, 'thunder');
                    }
                },
            },
        },
        ai: {
            useShan: true,
            effect: {
                target_use(card, player, target, current) {
                    let name;
                    if (typeof card == 'object') {
                        if (card.viewAs) name = card.viewAs;
                        else name = get.name(card);
                    }
                    if (name == 'shandian' || (get.tag(card, 'respondShan')
                        && !player.hasSkillTag('directHit_ai', true, {
                            target: target,
                            card: card,
                        }, true))) {
                        let club = 0,
                            spade = 0;
                        if (game.hasPlayer(function (current) {
                            return get.attitude(target, current) < 0 && get.damageEffect(current, target, target, 'thunder') > 0;
                        })) {
                            club = 2;
                            spade = 4;
                        }
                        if (!club && !spade) return 1;
                        if (name === 'sha') {
                            if (!target.mayHaveShan(player, 'use', target.getCards('h', i => {
                                return i.hasGaintag('sha_notshan');
                            })))
                                return;
                        }
                        else if (!target.mayHaveShan(player)) {
                            return 1 - 0.1 * Math.min(5, target.countCards('hs'));
                        }
                        if (!target.hasSkillTag('rejudge')) return [1, (club + spade) / 4];
                        let pos = player == target || player.hasSkillTag('viewHandcard', null, target, true) ? 'hes' : 'e',
                            better = club > spade ? 'club' : 'spade',
                            max = 0;
                        target.hasCard(function (cardx) {
                            if (get.suit(cardx) == better) {
                                max = 2;
                                return true;
                            }
                            if (spade && get.color(cardx) == 'black') max = 1;
                        }, pos);
                        if (max == 2) return [1, Math.max(club, spade)];
                        if (max == 1) return [1, Math.min(club, spade)];
                        if (pos == 'e') return [1, Math.min((Math.max(1, target.countCards('hs')) * (club + spade)) / 4, Math.max(club, spade))];
                        return [1, (club + spade) / 4];
                    }
                },
                target(card, player, target) {
                    if (name == 'lebu' || name == 'bingliang') return [target.hasSkillTag('rejudge') ? 0.4 : 1, 2, target.hasSkillTag('rejudge') ? 0.4 : 1, 0];
                },
            },
        },
    },
    zshy_guidao: {//鬼道
        audio: 'ext:诸神寰宇/audio/character:2',
        locked: false,
        trigger: { global: 'judge' },
        filter(event, player) {
            return player.countCards('hes', { color: 'black' }) > 0;
        },
        direct: true,
        content() {
            'step 0';
            player.chooseCard(get.translation(trigger.player) + '的' + (trigger.judgestr || '') + '判定为' + get.translation(trigger.player.judging[0]) + '，' + get.prompt('zshy_guidao'), 'hes', function (card) {
                if (get.color(card) != 'black') return false;
                var player = _status.event.player;
                var mod2 = game.checkMod(card, player, 'unchanged', 'cardEnabled2', player);
                if (mod2 != 'unchanged') return mod2;
                var mod = game.checkMod(card, player, 'unchanged', 'cardRespondable', player);
                if (mod != 'unchanged') return mod;
                return true;
            }).set('ai', function (card) {
                var trigger = _status.event.getTrigger();
                var player = _status.event.player;
                var judging = _status.event.judging;
                var result = trigger.judge(card) - trigger.judge(judging);
                var attitude = get.attitude(player, trigger.player);
                if (attitude == 0 || result == 0) {
                    if (trigger.player != player) return 0;
                    if (
                        game.hasPlayer(function (current) {
                            return get.attitude(player, current) < 0;
                        })
                    ) {
                        var checkx = lib.skill.xinleiji.judgeCheck(card, true) - lib.skill.xinleiji.judgeCheck(judging);
                        if (checkx > 0) return checkx;
                    }
                    return 0;
                }
                if (attitude > 0) {
                    return result;
                } else {
                    return -result;
                }
            }).set('judging', trigger.player.judging[0]);
            'step 1';
            if (result.bool) {
                player.respond(result.cards, 'highlight', 'zshy_guidao', 'noOrdering');
            } else {
                event.finish();
            }
            'step 2';
            if (result.bool) {
                player.$gain2(trigger.player.judging[0]);
                player.gain(trigger.player.judging[0]);
                var card = result.cards[0];
                if (get.suit(card) == 'spade') player.draw('nodelay');
                trigger.player.judging[0] = result.cards[0];
                trigger.orderingCards.addArray(result.cards);
                game.log(trigger.player, '的判定牌改为', result.cards[0]);
            }
            'step 3';
            game.delay(2);
        },
        mod: {
            aiOrder(player, card, num) {
                if (num > 0 && get.itemtype(card) == 'card' && get.color(card) == 'black' && get.type(card) == 'equip') num * 1.35;
            },
            aiValue(player, card, num) {
                if (num > 0 && get.itemtype(card) == 'card' && get.color(card) == 'black') return num * 1.15;
            },
            aiUseful(player, card, num) {
                if (num > 0 && get.itemtype(card) == 'card' && get.color(card) == 'black') return num * 1.35;
            },
        },
        ai: {
            rejudge: true,
            tag: {
                rejudge: 1,
            },
        },
    },
    zshy_huangtian: {//黄天
        audio: 'ext:诸神寰宇/audio/character:2',
        unique: true,
        global: 'zshy_huangtian_gain',
        zhuSkill: true,
        subSkill: {
            gain: {
                audio: 'zshy_huangtian',
                enable: 'phaseUse',
                discard: false,
                lose: false,
                delay: false,
                line: true,
                prepare(cards, player, targets) {
                    targets[0].logSkill('zshy_huangtian');
                },
                prompt() {
                    var player = _status.event.player;
                    var list = game.filterPlayer(function (target) {
                        return target != player && target.hasZhuSkill('zshy_huangtian', player);
                    });
                    var str = '将一张【闪】或♠手牌交给' + get.translation(list);
                    if (list.length > 1) str += '中的一人';
                    return str;
                },
                filter(event, player) {
                    if (player.group != 'qun') return false;
                    if (
                        !game.hasPlayer(function (target) {
                            return target != player && target.hasZhuSkill('zshy_huangtian', player) && !target.hasSkill('zshy_huangtian_clear');
                        })
                    )
                        return false;
                    return player.hasCard(function (card) {
                        return lib.skill.zshy_huangtian_gain.filterCard(card, player);
                    }, 'h');
                },
                filterCard(card, player) {
                    return get.name(card, player) == 'shan' || get.suit(card, player) == 'spade';
                },
                log: false,
                visible: true,
                filterTarget(card, player, target) {
                    return target != player && target.hasZhuSkill('zshy_huangtian', player) && !target.hasSkill('zshy_huangtian_clear');
                },
                content() {
                    player.give(cards, target);
                    player.chooseDrawRecover(2, true);
                    target.addTempSkill('zshy_huangtian_clear', 'phaseUseEnd');
                },
                ai: {
                    expose: 0.3,
                    order: 10,
                    result: {
                        target: 5,
                    },
                },
            },
            clear: {},
        },
    },

    //墟神关羽
    zshy_wushen: {//武神
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: ['chooseToUse', 'chooseToRespond'],
        hiddenCard(player, name) {
            if (!['sha'].includes(name)) return false;
            return player.countCards('hes');
        },
        filter(event, player) {
            if (!player.countCards('hes')) return false;
            return event.filterCard(get.autoViewAs({ name: 'sha' }, 'unsure'), player, event);
        },
        chooseButton: {
            dialog(event, player) {
                var list = [];
                if (event.filterCard(get.autoViewAs({ name: 'sha' }, 'unsure'), player, event)) {
                    list.push(['基本', '', 'sha']);
                    list.push(['基本', '', 'sha', 'fire']);
                    list.push(['基本', '', 'sha', 'thunder']);
                    list.push(['基本', '', 'sha', 'ice']);
                    list.push(['基本', '', 'sha', 'stab']);
                    list.push(['基本', '', 'sha', 'poison']);
                    list.push(['基本', '', 'sha', 'kami']);
                }
                return ui.create.dialog('武神', [list, 'vcard']);
            },
            filter(button, player) {
                return _status.event.getParent().filterCard(get.autoViewAs({ name: button.link[2] }, 'unsure'), player, _status.event.getParent());
            },
            check(button) {
                var player = _status.event.player;
                return player.getUseValue({ name: button.link[2] }) + 1;
            },
            backup(links, player) {
                return {
                    filterCard: true,
                    position: 'hes',
                    popname: true,
                    viewAs: {
                        name: links[0][2],
                        nature: links[0][3],
                    },
                    check(card, player, target) {
                        return 7 - get.value(card);
                    },
                    precontent() {
                        player.logSkill('zshy_wushen');
                    },
                }
            },
            prompt(links, player) {
                var name = links[0][2], nature = links[0][3];
                return '将一张牌当作' + (get.translation(nature) || '') + '【' + get.translation(name) + '】使用或打出';
            },
        },
        ai: {
            fireAttack: true,
            respondSha: true,
            skillTagFilter(player, tag) {
                return player.countCards('hes');
            },
            order: 1,
            result: {
                player: 1,
            },
        },
        mod: {
            targetInRange(card) {
                var color = get.color(card);
                if (color == 'red' || color == 'unsure') return true;
            },
            cardUsable(card) {
                var color = get.color(card);
                if (color == 'red' || color == 'unsure') return Infinity;
            },
        },
        group: ['zshy_wushen_Red', 'zshy_wushen_usetarget'],
        subSkill: {
            Red: {
                audio: 'zshy_wushen_Red',
                sub: true,
                trigger: {
                    player: 'useCard',
                },
                forced: true,
                lastDo: true,
                filter(event, player) {
                    return get.color(event.card) == 'red';
                },
                content() {
                    trigger.baseDamage++;
                    trigger.directHit.addArray(game.players);
                    if (trigger.addCount != false) {
                        trigger.addCount = false;
                    }
                },
                ai: {
                    directHit_ai:  true,
                    skillTagFilter(player, tag, arg) {
                        return arg.card.name == 'sha' && get.color(arg.card) == 'red';
                    },
                },
            },
            usetarget: {
                audio: 'zshy_wushen_Red',
                trigger: {
                    player: ['useCardToTargeted'],
                },
                forced: true,
                logTarget: 'target',
                filter(event, player) {
                    return (get.name(event.card) == 'sha') && event.targets && event.targets.length == 1;
                },
                check(event, player) {
                    return get.attitude(player, event.target) < 0;
                },
                content() {
                    player.gainPlayerCard('he', trigger.target, true, 'visible');
                },
            },
        },
    },
    zshy_wuhun: {//武魂
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: ['damageBegin4', 'loseHpBegin'],
        },
        forced: true,
        charlotte: true,
        content() {
            'step 0'
            player.draw(trigger.num);
            'step 1'
            var str = '令一名其他角色获得' + trigger.num + '枚「魂」';
            player.chooseTarget(get.prompt('zshy_wuhun'), str, lib.filter.notMe).set('ai', function (target) {
                var att = get.attitude(_status.event.player, target);
                if (att < 0) {
                    if (target.countMark('zshy_wuhun') < target.hp) return 2;
                    return 1;
                }
                return 0;
            });
            'step 2'
            if (result.bool) {
                var target = result.targets[0];
                player.line(target);
                target.addMark('zshy_wuhun', trigger.num);
            }
        },
        marktext: '魂',
        intro: {
            name2:  '魂',
            content: 'mark',
        },
        group: 'zshy_wuhun_die',
        subSkill: {
            die: {
                sub: true,
                audio: 'ext:诸神寰宇/audio/character:2',
                trigger: {
                    player: 'die',
                },
                forced: true,
                forceDie: true,
                filter() {
                    return game.hasPlayer(function (current) {
                        return current.hasMark('zshy_wuhun');
                    });
                },
                skillAnimation: true,
                animationColor: 'fire',
                logTarget() {
                    return game.filterPlayer(function (current) {
                        return current.hasMark('zshy_wuhun');
                    });
                },
                content() {
                    game.countPlayer(function (current) {
                        var num = current.countMark('zshy_wuhun');
                        if (num) {
                            current.removeMark('zshy_wuhun', num);
                            if (num >= current.hp) {
                                current.die();
                            }
                            else {
                                current.randomDiscard('he', num, true);
                                current.loseHp(num);
                            }
                        }
                    });
                },
            },
        },
    },

    //墟神吕蒙
    zshy_shelie: {//涉猎
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'phaseJieshuBegin',
        },
        forced: true,
        filter(event, player) {
            var history = event.player.getHistory('useCard');
            var suits = [];
            var types = [];
            for (var i = 0; i < history.length; i++) {
                var suit = get.suit(history[i].card);
                if (suit) suits.add(suit);
                types.add(get.type(history[i].card))
            }
            return suits.length >= 4 || types.length >= 3;
        },
        content() {
            player.draw(2);
            var next = player.phaseUse();
            event.next.remove(next);
            trigger.getParent().next.push(next);
        },
        group: ['zshy_shelie_Gain'],
        subSkill: {
            Gain: {
                sub: true,
                audio: 'zshy_shelie',
                trigger: {
                    player: 'drawBefore',
                },
                check(event, player) {
                    return Math.random() < 0.9;
                },
                filter(event, player) {
                    return event.num > 0;
                },
                'prompt2'(event, player) {
                    var num = event.num;
                    return '改为随机获得' + num + '张某种类型或位置的牌';
                },
                content() {
                    'step 0'
                    trigger.cancel();
                    event.cards = [];
                    event.num = 1;
                    event.getResultString = function (str) {
                        switch (str) {
                            case '基本': return 'basic';
                            case '装备': return 'equip';
                            case '锦囊': return 'trick';
                            case '地图': return 'land';
                        }
                        return str;
                    };
                    'step 1'
                    player.chooseControl('基本', '装备', '锦囊', '地图', '牌顶', '牌底', '弃牌堆', function () {
                        if (Math.random() < 0.6) return '基本';
                        if (Math.random() < 0.6) return '锦囊';
                        if (Math.random() < 0.6) return '装备';
                        return '基本';
                    }).set('prompt', '★涉猎★<li>共计要获得' + (trigger.num) + '张牌<li>请选择要获得的第' + event.num + '张牌的类型或位置');
                    'step 2'
                    if (result.control == '牌顶') player.gain(get.cards()[0], 'gain2');
                    else if (result.control == '牌底') player.gain(get.bottomCards()[0], 'gain2');
                    else if (result.control == '弃牌堆') {
                        var pile = ui.discardPile.childNodes;
                        var cards = Array.from(pile).randomGets(1);
                        if (cards) player.gain(cards, 'gain2');
                    }
                    else {
                        var want = event.getResultString(result.control);
                        var cardx = get.cardPile(function (card) {
                            return get.type(card, 'trick') == want;
                        });
                        if (cardx) player.gain(cardx, 'gain2');
                        else player.gain(get.cards()[0], 'gain2');
                    }
                    'step 3'
                    if (event.num < (trigger.num)) {
                        event.num++;
                        event.goto(1);
                    }
                },
            },
        },
    },
    zshy_SLMgongxin: {//攻心
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'useCardToPlayered',
            target: 'useCardToTargeted',
        },
        shaRelated: true,
        check(event, player) {
            var target = lib.skill.zshy_SLMgongxin.logTarget(event, player);
            return get.attitude(player, target) < 0;
        },
        filter(event, player) {
            var target = lib.skill.zshy_SLMgongxin.logTarget(event, player);
            if (player == target || event.targets.length != 1) return false;
            return target.isAlive() && target.countCards('h');
        },
        logTarget(event, player) {
            return player == event.player ? event.target : event.player;
        },
        prompt2(event, player) {
            var target = lib.skill.zshy_SLMgongxin.logTarget(event, player);
            return '观看' + get.translation(target) + '的手牌并选择一项：';
        },
        content() {
            'step 0'
            var target = lib.skill.zshy_SLMgongxin.logTarget(trigger, player);
            event.target = target;
            event.num = target.getCards('h').reduce(function (arr, card) {
                return arr.add(get.suit(card, player)), arr;
            }, []).length;
            'step 1'
            player.chooseButton(2, ['攻心', target.getCards('h'), [['获得此牌', '置于牌顶'], 'tdnodes']]).set('filterButton', function (button) {
                var type = typeof button.link;
                if (ui.selected.buttons.length && type == typeof ui.selected.buttons[0].link) return false;
                return true;
            }).set('ai', function (button) {
                var target = _status.event.target;
                var type = typeof button.link;
                if (type == 'object') return get.value(button.link, target);
            });
            'step 2'
            if (result.bool) {
                if (typeof result.links[0] != 'string') result.links.reverse();
                var card = result.links[1], choice = result.links[0];
                if (choice == '获得此牌') player.gain(card, target, 'giveAuto');
                else {
                    target.lose(card, ui.cardPile, 'visible', 'insert');
                    game.log(target, '的', card, '被置于牌堆顶');
                    player.draw('bottom');
                }
            }
            else event.finish();
        },
        ai: {
            expose: 0.2,
        },
    },

};
const 侵略如火 = {
    zshy_qiangxi: {//强袭
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        filter(event, player) {
            if (!player.isAlive() && (!player.hasCard(card => lib.skill.zshy_qiangxi.filterCard(card), 'he'))) return false;
            return game.hasPlayer(current => lib.skill.olqiangxi.filterTarget(null, player, current));
        },
        filterCard(card) {
            return get.type(card) == 'equip';
        },
        check(card) {
            return 15 - get.value(card);
        },
        position: 'he',
        filterTarget(card, player, target) {
            return target != player;
        },
        selectCard(event, player) {
            return [0, 1];
        },
        async content(event, trigger, player) {
            if (event.cards.length) {
                event.targets[0].damage(1, 'nocard');
            }
            else {
                event.targets[0].damage('nocard');
                player.loseHp('nocard');
            }
        },
        ai: {
            damage: true,
            order: 9,
            result: {
                player(player, target) {
                    if (ui.selected.cards.length) return 0;
                    return get.damageEffect(player, player, player);
                },
                target(player, target) {
                    return get.damageEffect(target, player, target);
                },
            },
            threaten: 1.5,
        },
        subSkill: {
            equip: {},
            hp: {},
        },
    },
    zshy_ninge: {//狞恶
        audio: 'zshy_qiangxi',
        trigger: { global: 'damageAfter' },
        filter(event, player) {
            if (player != event.player && player != event.source) return false;
            return event.player.getHistory('damage').indexOf(event) >= 1 && event.player.isAlive();
        },
        logTarget: 'player',
        forced: true,
        content() {
            if (trigger.player == player) player.draw();
            var num = trigger.player.countCards('h') - trigger.player.hp;
            if (trigger.player != player && num > 0) player.discardPlayerCard(trigger.player, num, true, 'h');
        },
    },

    zshy_quhu: {//驱虎
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        filter(event, player) {
            if (player.countCards('h') == 0) return false;
            return game.hasPlayer(function (current) {
                return player.canCompare(current);
            });
        },
        filterTarget(card, player, target) {
            return player.canCompare(target);
        },
        async content(event, trigger, player) {
            const target = event.target;
            const bool = await player.chooseToCompare(target).forResult();
            if (!bool) return void (await player.damage(target));
            if (!game.hasPlayer(function (player) {
                return player != target;
            })) return;
            const result = await player.chooseTarget(function (card, player, target) {
                const source = _status.event.source;
                return target != source;
            }, true).set('ai', function (target) {
                return get.damageEffect(target, _status.event.source, player);
            }).set('source', target).forResult();
            if (!result.bool || !result.targets || !result.targets.length) return;
            target.line(result.targets[0], 'green');
            await result.targets[0].damage(1, target);
        },
        ai: {
            order: 9,
            result: {
                target(player, target) {
                    const att = get.attitude(player, target);
                    const oc = target.countCards('h') == 1;
                    if (att > 0 && oc) return 0;
                    const players = game.filterPlayer();
                    for (let i = 0; i < players.length; i++) {
                        if (players[i] != target && players[i] != player) {
                            if (get.damageEffect(players[i], target, player) > 0) {
                                return att > 0 ? att / 2 : att - (oc ? 5 : 0);
                            }
                        }
                    }
                    return 0;
                },
                player(player, target) {
                    if (target.hasSkillTag('jueqing', false, target)) return -10;
                    const hs = player.getCards('h');
                    let mn = 1;
                    for (let i = 0; i < hs.length; i++) {
                        mn = Math.max(mn, get.number(hs[i]));
                    }
                    if (mn <= 11 && player.hp < 2) return -20;
                    let max = player.maxHp - hs.length;
                    const players = game.filterPlayer();
                    for (let i = 0; i < players.length; i++) {
                        if (get.attitude(player, players[i]) > 2) {
                            max = Math.max(Math.min(5, players[i].hp) - players[i].countCards('h'), max);
                        }
                    }
                    switch (max) {
                        case 0:
                            return mn == 13 ? 0 : -20;
                        case 1:
                            return mn >= 12 ? 0 : -15;
                        case 2:
                            return 0;
                        case 3:
                            return 1;
                        default:
                            return max;
                    }
                },
            },
            expose: 0.2,
        },
    },
    zshy_jieming: {//节命
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: ['damageAfter', 'die'] },
        direct: true,
        forceDie: true,
        filter(event, player) {
            if (event.name == 'die') return true;
            return player.isIn();
        },
        content() {
            'step 0'
            event.count = trigger.num || 1;
            'step 1'
            event.count--;
            player.chooseTarget(get.prompt('zshy_jieming'), function (card, player, target) {
                return target.maxHp > 0;
            }).set('ai', function (target) {
                var att = get.attitude(_status.event.player, target);
                var draw = target.maxHp;
                if (draw >= 0) {
                    if (target.hasSkillTag('nogain')) att /= 6;
                    if (att > 2) {
                        return Math.sqrt(draw + 1) * att;
                    }
                    return att / 3;
                }
                if (draw < -1) {
                    if (target.hasSkillTag('nogain')) att *= 6;
                    if (att < -2) {
                        return -Math.sqrt(1 - draw) * att;
                    }
                }
                return 0;
            });
            'step 2'
            if (result.bool) {
                var target = result.targets[0];
                event.target = target;
                player.logSkill('zshy_jieming', target);
                target.draw(target.maxHp);
            } else event.finish();
            'step 3'
            var num = target.countCards('h') - target.maxHp;
            if (num > 0) {
                target.chooseToDiscard(num, 'h', true);
                if (num >= player.maxHp) player.recover();
            };
            'step 4'
            if (event.count > 0 && player.isIn() && player.hasSkill('zshy_jieming')) event.goto(1);
        },
        ai: {
            expose: 0.2,
            order: 9,
            maixie: true,
            maixie_hp: true,
            effect: {
                target(card, player, target, current) {
                    if (get.tag(card, 'damage') && target.hp > 1) {
                        if (player.hasSkillTag('jueqing', false, target)) return [1, -2];
                        var max = 0;
                        var players = game.filterPlayer();
                        for (var i = 0; i < players.length; i++) {
                            if (get.attitude(target, players[i]) > 0) {
                                max = Math.max(players[i].hp - players[i].countCards('h'), max);
                            }
                        }
                        switch (max) {
                            case 0:
                                return 2;
                            case 1:
                                return 1.5;
                            case 2:
                                return [1, 2];
                            default:
                                return [0, max];
                        }
                    }
                },
            },
        },
    },

    zshy_lianhuan: {//连环
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: ['useCard', 'respond'],
        },
        check(event, player) {
            return get.attitude(player, event.target) < 0;
        },
        filter(event, player) {
            if (event.player == player || !event.player.isIn()) return false;
            return event.player.isLinked() && event.player.countCards('he');
        },
        logTarget: 'target',
        prompt2(event, player) {
            return '令' + get.translation(event.player) + '随机弃置一张牌';
        },
        async content(event, trigger, player) {
            trigger.player.randomDiscard('he', true);
        },
        ai: {
            expose: 0.2,
        },
        group: 'zshy_lianhuan_Link',
        subSkill: {
            Link: {
                audio: 'zshy_lianhuan',
                enable: 'phaseUse',
                filter(event, player) {
                    return player.countCards('h');
                },
                filterCard: true,
                selectCard: [1, Infinity],
                lose: false,
                delay: false,
                discard: false,
                position: 'h',
                check(card) {
                    const player = _status.event.player;
                    //AI：没有未横置的敌对目标时不再发动，避免反复重铸/重复发动
                    if (!game.hasPlayer(current => current != player && !current.isLinked() && get.attitude(player, current) < 0)) return -1;
                    //AI 一次最多重铸 2 张
                    if (ui.selected.cards.length >= 2) return -1;
                    return 7 - get.value(card);
                },
                prompt: '出牌阶段，你可以重铸任意张手牌，然后横置任意名角色',
                async content(event, trigger, player) {
                    player.recast(event.cards);
                    const result = await player.chooseTarget('连环：请选择横置的角色', [0, Infinity], function (card, player, target) {
                        return !target.isLinked();
                    }).set('ai', function (target) {
                        var player = _status.event.player, att = get.attitude(player, target);
                        if (!target.isLinked()) return get.damageEffect(target, player, player);
                        return att;
                    }).forResult();
                    if (result?.targets) {
                        const targets = result.targets.sortBySeat();
                        player.line(targets);
                        for (const i of targets) {
                            i.link(true);
                        }
                    }
                },
                ai: {
                    order: 1,
                    result: {
                        player(player) {
                            //还有值得横置的敌对目标才发动，避免 AI 反复重铸
                            if (!game.hasPlayer(current => current != player && !current.isLinked() && get.attitude(player, current) < 0)) return 0;
                            return 1;
                        },
                    },
                },
            },
        },
    },
    zshy_niepan: {//涅槃
        audio: 'ext:诸神寰宇/audio/character:2',
        unique: true,
        enable: 'chooseToUse',
        mark: true,
        limited: true,
        skillAnimation: true,
        animationColor: 'orange',
        derivation: ['zshy_huoji', 'zshy_bazhen', 'zshy_kanpo'],
        init(player) {
            player.storage.zshy_niepan = false;
        },
        filter(event, player) {
            if (player.storage.zshy_niepan) return false;
            if (event.type == 'dying') {
                if (player != event.dying) return false;
                return true;
            }
            return false;
        },
        content() {
            'step 0';
            player.awakenSkill('zshy_niepan');
            player.addSkillLog('zshy_niepan');
            player.storage.zshy_niepan = true;
            'step 1';
            player.link(false);
            player.turnOver(false);
            'step 2';
            player.draw(4);
            'step 3';
            if (player.hp < player.maxHp) {
                player.recover(player.maxHp - player.hp);
            };
            'step 4';
            player.chooseControl('zshy_huoji', 'zshy_bazhen', 'zshy_kanpo').set('prompt', '选择获得一个技能').ai = function () {
                return ['zshy_huoji', 'zshy_bazhen', 'zshy_kanpo'].randomGet();
            };
            'step 5';
            player.addSkills(result.control);
        },
        ai: {
            order: 1,
            skillTagFilter(player, tag, target) {
                if (player != target || player.storage.zshy_niepan) return false;
            },
            save: true,
            result: {
                player(player) {
                    if (player.hp <= 0) return 10;
                    if (player.hp <= 2 && player.countCards('he') <= 1) return 10;
                    return 0;
                },
            },
            threaten(player, target) {
                if (!target.storage.zshy_niepan) return 0.6;
            },
        },
        intro: {
            content: 'limited',
        },
    },
    zshy_huoji_zshy_AAZZpangtongSHZL: { audio: 'ext:诸神寰宇/audio/character:2', },
    zshy_bazhen_zshy_AAZZpangtongSHZL: { audio: 'ext:诸神寰宇/audio/character:2' },
    zshy_kanpo_zshy_AAZZpangtongSHZL: { audio: 'ext:诸神寰宇/audio/character:2' },

    zshy_huoji: {//火计
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AAZZpangtongSHZL: 'zshy_huoji_zshy_AAZZpangtongSHZL',
        },
        enable: 'phaseUse',
        filter(event, player) {
            return game.countPlayer(() => lib.filter.notMe) > 0 && player.countCards('he');
        },
        filterTarget: lib.filter.notMe,
        prompt: `选择一名其他角色，然后弃置任意张牌，视为对其造成等量火焰伤害，然后你回复弃置的红色牌数点体力，摸非红色牌数张牌`,
        async content(event, trigger, player) {
            const result = await player.chooseToDiscard(`【火计】<br>弃置任意张牌，视为对${get.translation(event.player)}造成等量火焰伤害，然后你回复弃置的红色牌数点体力，摸非红色牌数张牌`, 'he', [1, Infinity], true)
                .set('ai', function (card) {
                    if (ui.selected.cards.length < event.targets[0].hp) {
                        return 6 - get.value(card);
                    }
                    return 0;
                })
                .forResult();
            if (result.bool && result?.cards?.length) {
                event.targets[0].damage(result.cards.length, 'fire');
                let num = 0, num1 = 0;
                for (const i of result.cards) {
                    if (get.color(i) == 'red') {
                        num++;
                    } else {
                        num1++;
                    }
                }
                if (num > 0) {
                    player.recover(num)
                };
                if (num1 > 0) {
                    player.draw(num1);
                }
            };
        },
        ai: {
            order() {
                return [0, 3, 6, 9].randomGet(1);
            },
            result: {
                target(card, player, target) {
                    return -1;
                },
            },
            tag: {
                fireDamage: 1,
                natureDamage: 1,
            },
        },
    },
    zshy_bazhen: {//八阵
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AAZZpangtongSHZL: 'zshy_bazhen_zshy_AAZZpangtongSHZL',
        },
        trigger: {
            target: 'useCardToTargeted',
        },
        locked: true,
        check(event, player) {
            return get.effect(event.player, event.card, player, event.player) < 0;
        },
        filter(event, player) {
            return get.tag(event.card, 'damage') > 0.5;
        },
        prompt2(event, player) {
            return '你可以展示牌顶一张牌，若结果不为♠，则你令' + get.translation(event.card) + '对你无效，否则你获得之。';
        },
        async content(event, trigger, player) {
            let card = get.cards()[0];
            player.showCards(card, '八阵')
            let suit = get.suit(card);
            if (suit != 'spade') {
                trigger.excluded.push(player);
            } else {
                player.gain(card, 'gain2');
            }
        },
        ai: {
            effect: {
                target(card, player, target) {
                    if (get.name(card) == 'sha') return [0.5, 1];
                },
            },
        },
    },
    zshy_kanpo: {//看破
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AAZZpangtongSHZL: 'zshy_kanpo_zshy_AAZZpangtongSHZL',
        },
        trigger: {
            global: 'useCard',
        },
        filter(event, player) {
            return event.player != player && (get.type(event.card) == 'trick' || get.type(event.card) == 'delay');
        },
        logTarget(event, player) {
            return event.player;
        },
        check(event, player) {
            let effect = 0;
            if (get.name(event.card) == 'wuxie') {
                if (get.attitude(player, event.player) < -1) effect = -1;
            }
            else if (event.targets && event.targets.length) {
                for (let i = 0; i < event.targets.length; i++) {
                    effect += get.effect(event.targets[i], event.card, event.player, player);
                }
            }
            if (effect < 0) {
                return true;
            }
            return false;
        },
        async content(event, trigger, player) {
            if (trigger.targets) {
                trigger.targets.length = 0;
            };
            trigger.all_excluded = true;
            game.log(player, '令', trigger.card, '无效了');
        },
        ai: {
            expose: 0.8,
            notrick: true,
        },
    },
    zshy_cangzhuo: {//藏拙
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'phaseUseEnd',
        },
        forced: true,
        filter(event, player) {
            return player.countCards('h') > 0;
        },
        content() {
            player.addTempSkill('zshy_cangzhuo_sub', { player: 'phaseEnd' });
        },
        subSkill: {
            sub: {
                trigger: {
                    player: 'phaseDiscardBegin',
                },
                forced: true,
                filter(event, player) {
                    return event.parent.name == 'phaseDiscard' && player.countCards('h', { type2: 'trick' }) > 0;
                },
                content() {
                    player.logSkill('zshy_cangzhuo');
                },
                mod: {
                    ignoredHandcard(card, player) {
                        if (get.type(card) == 'trick' || get.type(card) == 'delay') {
                            return true;
                        }
                    },
                    cardDiscardable(card, player, name) {
                        if (name == 'phaseDiscard' && (get.type(card) == 'trick' || get.type(card) == 'delay')) return false;
                    },
                },
            },
        },
    },

    zshy_tianyi: {//天义
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        filter(event, player) {
            if (player.getStat().skill.zshy_tianyi >= game.countGroup()) return false;
            return player.countCards('h');
        },
        filterTarget(card, player, target) {
            return target != player && target.countCards('h');
        },
        check(event, player, target) {
            return player.countCards('h') > 0;
        },
        content() {
            'step 0'
            player.chooseToCompare(target);
            'step 1'
            if (result.bool) {
                player.addMark('zshy_tianyi_Buff', 1, false);
                player.addTempSkill('zshy_tianyi_Buff');
            }
        },
        ai: {
            order: 9,
            result: {
                player(player) {
                    if (player.countCards('h', 'sha') > 0) return 0.6;
                    const num = player.countCards('h');
                    if (num > player.hp) return 0;
                    if (num == 1) return -2;
                    if (num == 2) return -1;
                    return -0.7;
                },
                target(player, target) {
                    const num = target.countCards('h');
                    if (num == 1) return -1;
                    if (num == 2) return -0.7;
                    return -0.5;
                },
            },
        },
        subSkill: {
            Buff: {
                sub: true,
                locked: true,
                onremove: true,
                marktext: '义',
                charlotte: true,
                intro: {
                    content: '本阶段以下属性+#：【杀】的使用次数、【杀】的指定目标数',
                },
                mod: {
                    selectTarget(card, player, range) {
                        if (card.name == 'sha' && range[1] != -1) {
                            range[1] += player.countMark('zshy_tianyi_Buff');
                        }
                    },
                    cardUsable(card, player, num) {
                        if (card.name == 'sha') {
                            return num += player.countMark('zshy_tianyi_Buff');
                        }
                    },
                    globalFrom(from, to, distance) {
                        return -Infinity;
                    },
                },
            },
        },
    },
    zshy_hanzhan: {//酣战
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: ['chooseToCompareAfter', 'compareMultipleAfter'],
            target: ['chooseToCompareAfter', 'compareMultipleAfter'],
        },
        forced: true,
        filter(event, player) {
            if (event.preserve) return false;
            return [event.card1, event.card2].filterInD('od').length > 0;
        },
        content() {
            player.gain([trigger.card1, trigger.card2].filterInD('od'), 'gain2');
        },
        group: ['zshy_hanzhan_Compare1'],
        subSkill: {
            Compare1: {
                sub: true,
                audio: 'zshy_hanzhan',
                trigger: {
                    global: 'chooseToCompareBegin',
                },
                filter(event, player) {
                    if (player == event.player) return true;
                    if (event.targets) return event.targets.includes(player);
                    return player == event.target;
                },
                check(trigger, player) {
                    var num = 0;
                    var targets = player == trigger.player ? (trigger.targets ? trigger.targets.slice(0) : [trigger.target]) : [trigger.player];
                    while (targets.length) {
                        var target = targets.shift();
                        if (target.getCards('hej').length > 1) num -= get.attitude(player, target);
                    }
                    return num > 0;
                },
                logTarget(event, player) {
                    if (player != event.player) return event.player;
                    return event.targets || event.target;
                },
                'prompt2'(event, player) {
                    return '令其改为随机使用一张牌进行拼点';
                },
                content() {
                    var targets = (player == trigger.player ? (trigger.targets ? trigger.targets.slice(0) : [trigger.target]) : [trigger.player]);
                    if (!trigger.fixedResult) trigger.fixedResult = {};
                    while (targets.length) {
                        var target = targets.shift();
                        var hs = target.getCards('he');
                        if (hs.length) trigger.fixedResult[target.playerid] = hs.randomGet();
                    }
                },
            },
        },
    },

    zshy_jianchu: {//鞬出
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: ['useCardToPlayered'],
        },
        filter(event, player) {
            return get.tag(event.card, 'damage') && event.target.countDiscardableCards(player, 'he') > 0 && event.targets.length == 1 && event.target != player;
        },
        direct: true,
        async content(event, trigger, player) {
            const result = await player.discardPlayerCard(trigger.target, get.prompt('zshy_jianchu', trigger.target))
                .set('ai', function (button) {
                    if (!_status.event.att) return 0;
                    if (get.position(button.link) == 'e') {
                        if (get.subtype(button.link) == 'equip2') return 5 * get.value(button.link);
                        return 0.5;
                    }
                    return 2;
                }).set('logSkill', ['zshy_jianchu', trigger.target])
                .set('att', get.attitude(player, trigger.target) <= 0).forResult();
            if (result.bool && result.links && result.links.length) {
                if (get.type(result.links[0], null, result.links[0].original == 'h' ? player : false) == 'basic') {
                    trigger.getParent().directHit.add(trigger.target);
                    player.gain(result.links, 'gain2', 'log');
                    player.addTempSkill('zshy_jianchu_damage');
                    player.addMark('zshy_jianchu_damage', 1, false);
                }
                else if (trigger.cards) {
                    player.recover();
                    var list = [];
                    for (var i = 0; i < trigger.cards.length; i++) {
                        if (get.position(trigger.cards[i], true) == 'o') list.push(trigger.cards[i]);
                    }
                    if (list.length) player.gain(list, 'gain2', 'log');
                }
            }
        },
        subSkill: {
            damage: {
                charlotte: true,
                marktext: '战',
                intro: {
                    content: '你的出杀次数与〖马术〗的进攻距离+#',
                },
                mod: {
                    cardUsable(card, player, num) {
                        if (card.name == 'sha') return num + player.countMark('zshy_jianchu_damage');
                    },
                },
                onremove: true,
                ai: {
                    combo: 'zshy_PDmashu',
                },
            },
        },
        ai: {
            unequip_ai: true,
            directHit_ai: true,
            skillTagFilter(player, tag, arg) {
                if (tag == 'directHit_ai')
                    return (
                        get.tag(arg.card, 'damage') &&
                        arg.target.countCards('e', function (card) {
                            return get.value(card) > 1;
                        }) > 0
                    );
                if (arg && get.tag(arg, 'damage') && arg.target.getEquip(2)) return true;
                return false;
            },
        },
    },
    zshy_PDmashu: {//马术
        mod: {
            globalFrom(from, to, distance, player) {
                let num = 1 + from.countMark('zshy_jianchu_damage')
                return distance - num;
            },
        },
    },

    zshy_shuangxiong: {//双雄
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'chooseToUse',
        viewAs: { name: 'juedou' },
        position: 'hes',
        viewAsFilter(player) {
            return player.hasCard(card => lib.skill.zshy_shuangxiong.filterCard(card, player), 'hes');
        },
        filterCard(card, player) {
            return true;
        },
        prompt() {
            var str = '将一张牌当做【决斗】使用';
            return str;
        },
        check(card) {
            var player = _status.event.player;
            if (get.position(card) == 'e') {
                var raw = get.value(card);
                var eff = player.getUseValue(get.autoViewAs({ name: 'juedou' }, [card]));
                return eff - raw;
            }
            var raw = player.getUseValue(card, null, true);
            var eff = player.getUseValue(get.autoViewAs({ name: 'juedou' }, [card]));
            return eff - raw;
        },
        ai: { order: 7 },
        group: ['zshy_shuangxiong_juedou', 'zshy_shuangxiong_sub1'],
        subSkill: {
            juedou: {
                audio: 'zshy_shuangxiong',
                trigger: { global: 'phaseJieshuBegin' },
                trigger: {
                    global: 'damageAfter',
                },
                forced: true,
                filter(event, player, target) {
                    return event.card && get.name(event.card) == 'juedou' && event.source != player;
                },
                content() {
                    player.draw('nodelay');
                },
            },
            sub1: {
                sub: true,
                trigger: {
                    source: 'damageBegin3',
                },
                forced: true,
                silent: true,
                popup: false,
                firstDo: true,
                filter(event, player) {
                    return event.card && get.name(event.card) == 'juedou' && event.player.hp % 2 == 1;
                },
                content() {
                    trigger.num++;
                },
                ai: {
                    skillTagFilter(player, tag, arg) {
                        return arg.card.name == 'juedou';
                    },
                },
            },
        },
        ai: {
            order: 9,
        },
    },

    zshy_luanji: {//乱击
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        lose: false,
        delay: false,
        locked: true,
        selectCard: 2,
        discard: false,
        position: 'he',
        multiline: true,
        multitarget: true,
        complexCard: true,
        check(card) {
            return 7 - get.value(card);
        },
        selectTarget: [1, Infinity],
        filterCard(card, player) {
            return true;
        },
        filter(event, player, card) {
            return player.countCards('hes') > 1;
        },
        filterTarget(card, player, target) {
            return target != player;
        },
        prompt(event, player) {
            var str = '出牌阶段，你可以将两张牌当作任意属性【杀】或【万箭齐发】对任意名其他角色使用（以此法使用的【杀】不计入使用次数）';
            return str;
        },
        content() {
            'step 0'
            var list = ['wanjian'];
            list.push(['基本', '', 'sha']);
            for (var j of lib.inpile_nature) {
                list.push(['基本', '', 'sha', j]);
            }
            player.chooseButton(['乱击：请选择要使用的牌', [list, 'vcard']], true).set('ai', function (button) {
                var player = _status.event.player;
                for (i of targets) {
                    var effx1 = 0, eff1 = get.effect(i, { name: 'wanjian' }, player, player);
                    if (eff1 > 0) effx1 = eff1;
                }
                return 0;
            });
            'step 1'
            if (result.bool) {
                var cardx = result.links[0][2];
                var cardn = result.links[0][3];
                var targetsx = targets.sortBySeat();
                player.useCard(get.autoViewAs({ name: cardx, nature: cardn }, cards), cards, targetsx);
            }
        },
        ai: {
            order() {
                return [3, 4, 5, 6, 7].randomGet();
            },
            result: {
                target(player, target) {
                    var eff1 = get.effect(target, { name: 'wanjian' }, player, player);
                    if (!target.hasSkillTag('notrick')) {
                        return -0.1;
                    }
                    return 0;
                },
            },
        },
        group: 'zshy_luanji_Gain',
        subSkill: {
            Gain: {
                sub: true,
                trigger: {
                    global: ['respondAfter'],
                },
                forced: true,
                filter(event, player) {
                    var target = event.player;
                    if (_status.currentPhase != player) return false;
                    return target != player && event.cards.filterInD().length;
                },
                logTarget: 'player',
                content() {
                    player.gain(trigger.cards.filterInD(), 'gain2');
                },
            },
        },
    },
    zshy_xueyi: {//血裔
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: 'phaseBefore', player: 'enterGame' },
        forced: true,
        zhuSkill: true,
        unique: true,
        filter(event, player) {
            return (event.name != 'phase' || game.phaseNumber == 0) && player.hasZhuSkill('zshy_xueyi');
        },
        content() {
            var num = game.countPlayer(function (current) {
                return current.group == 'qun';
            });
            if (num) player.addMark('zshy_xueyi', num * 2);
        },
        marktext: '裔',
        intro: {
            name2: '裔',
            content: 'mark',
        },
        mod: {
            maxHandcard(player, num) {
                if (player.hasZhuSkill('zshy_xueyi')) return num + player.countMark('zshy_xueyi');
            },
        },
        group: 'zshy_xueyi_draw',
        subSkill: {
            draw: {
                audio: 'zshy_xueyi',
                trigger: { player: 'phaseUseBegin' },
                prompt2: '弃置一枚「裔」标记，然后选择摸两张牌或者回复1点体力',
                sourceSkill: 'zshy_xueyi',
                check(event, player) {
                    return player.getUseValue('wanjian') > 0 || !player.needsToDiscard();
                },
                filter(event, player) {
                    return player.hasZhuSkill('zshy_xueyi') && player.hasMark('zshy_xueyi');
                },
                content() {
                    player.removeMark('zshy_xueyi', 1);
                    player.chooseDrawRecover(2, true);
                },
            },
        },
    },

    zshy_yeyan: {//业炎
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        usable: 1,
        charlotte: true,
        visible: true,
        discard: false,
        position: 'hes',
        prepare: 'throw',
        filterCard: true,
        complexCard: true,
        loseTo: 'discardPile',
        selectCard: [1, Infinity],
        filter(event, player) {
            return player.countCards('hes');
        },
        check(card) {
            //AI 最多弃 2 张，避免把便宜牌全弃光
            if (ui.selected.cards.length >= 2) return -1;
            return 6 - get.value(card);
        },
        prompt: '出牌阶段限1次，你可以弃置任意张牌并摸等量张牌，然后对至多三名其他角色造成X点火焰伤害（X为4-选择角色数）。',
        async content(event, trigger, player) {
            player.draw(event.cards.length);
            const result = await player.chooseTarget(get.prompt('zshy_yeyan'), '对至多三名其他角色造成X点火焰伤害（X为4-选择角色数）', [1, 3], function (card, player, target) {
                return target != player;
            }).set('ai', function (target) {
                var player = _status.event.player;
                return get.damageEffect(target, player, player, 'fire');
            }).forResult();
            if (result?.targets?.length) {
                const num = 4 - result.targets.length;
                for (const target of result.targets) {
                    if (target.isIn()) await target.damage(num, 'fire');
                }
            }
        },
        ai: {
            order() {
                return [1, 2, 3, 4].randomGet();
            },
            result: {
                player: 1,
            },
        },
        group: 'zshy_yeyan_fire',
        subSkill: {
            fire: {
                trigger: {
                    global: 'phaseJieshuBegin',
                },
                filter(event, player) {
                    var history = event.player.getHistory('useCard');
                    var suits = [];
                    var types = [];
                    for (var i = 0; i < history.length; i++) {
                        var suit = get.suit(history[i].card);
                        if (suit) suits.add(suit);
                        types.add(get.type(history[i].card))
                    }
                    return suits.length >= 4 && types.length >= 3;
                },
                async cost(event, trigger, player) {
                    event.result = await player.chooseTarget(get.prompt('zshy_yeyan'), `对至多三名其他角色造成X点火焰伤害（X为4-选择角色数）`, [1, 3], lib.filter.notMe)
                        .set('ai', function (target) {
                            var player = _status.event.player;
                            return get.damageEffect(target, player, player, 'fire');
                        }).forResult();
                },
                async content(event, trigger, player) {
                    const targets = event.targets || [];
                    if (!targets.length) return;
                    const num = 4 - targets.length;
                    for (const target of targets) {
                        if (target.isIn()) await target.damage(num, 'fire');
                    }
                },
            },
        },
    },
    zshy_qinyin: {//琴音
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: ['loseAfter', 'loseAsyncAfter'],
        },
        charlotte: true,
        forced: true,
        filter(event, player) {
            return game.hasPlayer(current => {
                var evt = event.getl(current);
                if (!evt || !evt.cards2 || evt.cards2.filterInD('d').length < 1) return false;
                return true;
            });
        },
        async content(event, trigger, player) {
            if (trigger.cards.length == 1) {
                await player.chooseDrawRecover(true);
            } else {
                const num = player.getHistory('useSkill', evt => evt.skill == 'zshy_qinyin').length;
                var str = '令任意名角色各回复' + num + '点体力';
                const result = await player.chooseTarget(get.prompt('zshy_qinyin'), str, [1, Infinity], function (card, player, target) {
                    return target.isDamaged();
                }).set('ai', function (target) {
                    var player = _status.event.player;
                    return get.recoverEffect(target, player, player);
                }).forResult();
                if (result.bool) {
                    player.line(result.targets);
                    player.popup('回复体力');
                    Promise.all(result.targets.map(function (target) {
                        target.recover(num);
                    }))
                };
                var str = '令任意名角色各失去' + num + '点体力';
                const result1 = await player.chooseTarget(get.prompt('zshy_qinyin'), str, [1, Infinity], function (card, player, target) {
                    return !target.isDying();
                }).set('ai', function (target) {
                    var player = _status.event.player;
                    return get.effect(target, { name: 'losehp' }, player, player);
                }).forResult();
                if (result1.bool) {
                    player.line(result1.targets);
                    player.popup('失去体力');
                    Promise.all(result1.targets.map(function (target) {
                        target.loseHp(num);
                    }))
                }
            }
        },
    },

    zshy_qixing: {//七星
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: ['phaseBefore'],
            player: ['enterGame'],
        },
        charlotte: true,
        forced: true,
        filter(event, player, name) {
            return (event.name != 'phase' || game.phaseNumber == 0);
        },
        async content(event, trigger, player) {
            player.addToExpansion(get.cards(7), 'draw').gaintag.add('zshy_qixing');
            player.draw(7);
        },
        marktext: '星',
        intro: {
            markcount: 'expansion',
            mark(dialog, content, player) {
                var content = player.getExpansions('zshy_qixing');
                if (content && content.length) {
                    if (player == game.me || player.isUnderControl()) {
                        dialog.addAuto(content);
                    }
                    else {
                        return '共有' + get.cnNumber(content.length) + '张星';
                    }
                }
            },
            content(content, player) {
                var content = player.getExpansions('zshy_qixing');
                if (content && content.length) {
                    if (player == game.me || player.isUnderControl()) {
                        return get.translation(content);
                    }
                    return '共有' + get.cnNumber(content.length) + '张星';
                }
            },
        },
        onremove(player, skill) {
            var cards = player.getExpansions(skill);
            if (cards.length) player.loseToDiscardpile(cards);
        },
        mod: {
            maxHandcard(player, num) {
                return num + player.getExpansions('zshy_qixing').length;
            },
        },
        group: ['zshy_qixing_Change', 'zshy_qixing_po'],
        subSkill: {
            Change: {
                audio: 'zshy_qixing',
                trigger: {
                    player: 'drawAfter',
                },
                charlotte: true,
                direct: true,
                filter(event, player, name) {
                    return player.getExpansions('zshy_qixing').length && player.countCards('he')
                        && (event.getParent(2).name != 'zshy_qixing');
                },
                content() {
                    'step 0'
                    var cards = player.getExpansions('zshy_qixing');
                    if (!cards.length || !player.countCards('he')) {
                        event.finish();
                        return;
                    }
                    var next = player.chooseToMove('【七星】：你可以用任意张牌交换等量的「星」');
                    next.set('list', [
                        [get.translation(player) + '的「星」', cards],
                        ['手牌和装备区', player.getCards('he')],
                    ]);
                    next.set('filterMove', function (from, to) {
                        return typeof to != 'number';
                    });
                    next.set('processAI', function (list) {
                        var player = _status.event.player, cards = list[0][1].concat(list[1][1]).sort(function (a, b) {
                            return get.useful(a) - get.useful(b);
                        }), cards2 = cards.splice(0, player.getExpansions('zshy_qixing').length);
                        return [cards2, cards];
                    });
                    'step 1'
                    if (result.bool) {
                        var pushs = result.moved[0], gains = result.moved[1];
                        pushs.removeArray(player.getExpansions('zshy_qixing'));
                        gains.removeArray(player.getCards('hes'));
                        if (!pushs.length || pushs.length != gains.length) return;
                        player.logSkill('zshy_qixing');
                        player.addToExpansion(pushs, player, 'giveAuto').gaintag.add('zshy_qixing');
                        game.log(player, '将', pushs, '作为「星」置于武将牌上');
                        player.gain(gains, 'gain2');
                    }
                },
            },
            po: {
                audio: 'zshy_qixing',
                charlotte: true,
                locked: true,
                fixed: true,
                trigger: {
                    global: ['useCard'],
                },
                usable: 7,
                filter(event, player) {
                    return event.player != player;
                },
                'prompt2'(event, player) {
                    return '令' + get.translation(event.card) + '无效';
                },
                check(event, player) {
                    var effect = 0;
                    if (get.name(event.card) == 'wuxie' || get.name(event.card) == 'shan') {
                        if (get.attitude(player, event.player) < -1) effect = -1;
                    }
                    else if (event.targets && event.targets.length) {
                        for (var i = 0; i < event.targets.length; i++) {
                            effect += get.effect(event.targets[i], event.card, event.player, player);
                        }
                    }
                    if (effect < 0) {
                        if (get.name(event.card) == 'sha') {
                            var target = event.targets[0];
                            if (target == player) return !player.countCards('h', 'shan');
                            else return target.hp == 1 || (target.countCards('h') <= 2 && target.hp <= 2);
                        }
                        else return true;
                    }
                    return false;
                },
                logTarget: 'player',
                async content(event, trigger, player) {
                    if (trigger.targets) trigger.targets.length = 0;
                    trigger.all_excluded = true;
                    game.log(player, '令', trigger.card, '无效了');
                    player.addToExpansion(get.cards(), 'draw').gaintag.add('zshy_qixing');
                },
            },
        },
    },
    zshy_dawu: {//大雾
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'phaseJieshuBegin',
        },
        charlotte: true,
        locked: true,
        direct: true,
        filter(event, player) {
            return player.getExpansions('zshy_qixing').length;
        },
        content() {
            'step 0'
            var num = Math.min(game.countPlayer(), player.getExpansions('zshy_qixing').length);
            var str = '弃置至多' + num + '枚「星」，然后令等量名没有「雾」的角色获得1枚「雾」';
            player.chooseTarget(get.prompt('zshy_dawu'), str, [1, num], function (card, player, target) {
                return !target.hasSkill('zshy_dawu_Buff');
            }).set('ai', function (target) {
                var att = get.attitude(player, target);
                if (att >= 4) {
                    if (_status.event.allUse) return att;
                    if (target.hp == 1) return att;
                    if (target.hp == 2 && target.countCards('he') <= 2) return att * 0.7;
                    return 0;
                }
                return -1;
            }).set('allUse', player.getExpansions('zshy_qixing').length >= game.countPlayer(function (current) {
                return get.attitude(player, current) > 4;
            }) * 2);
            'step 1'
            if (result.bool) {
                player.logSkill('zshy_dawu', result.targets);
                var length = result.targets.length;
                for (var i = 0; i < length; i++) result.targets[i].addSkill('zshy_dawu_Buff');
                player.chooseCardButton('大雾：请弃置' + length + '枚「星」', length, player.getExpansions('zshy_qixing'), true);
            }
            else event.finish();
            'step 2'
            player.loseToDiscardpile(result.links);
        },
        ai: {
            combo: 'zshy_qixing',
        },
        group: ['zshy_dawu_Remove', 'zshy_dawu_add'],
        subSkill: {
            Remove: {
                trigger: {
                    player: ['phaseUseBegin', 'dieBegin'],
                },
                forced: true,
                popup: false,
                silent: true,
                charlotte: true,
                content() {
                    for (var i = 0; i < game.players.length; i++) {
                        if (game.players[i].hasSkill('zshy_dawu_Buff') && game.players[i] != player) game.players[i].removeSkill('zshy_dawu_Buff');
                    }
                },
            },
            add: {
                audio: 'zshy_dawu',
                trigger: {
                    global: ['phaseBefore'],
                    player: ['enterGame'],
                },
                charlotte: true,
                forced: true,
                firstDo: true,
                filter(event, player) {
                    return (event.name != 'phase' || game.phaseNumber == 0);
                },
                content() {
                    player.addSkill('zshy_dawu_Buff');
                },
            },
            Buff: {
                audio: 'zshy_dawu',
                trigger: {
                    player: ['damageBegin4', 'loseHpBegin'],
                },
                forced: true,
                onremove: true,
                charlotte: true,
                content() {
                    'step 0'
                    if (event.triggername == 'loseHpBegin') {
                        player.draw(trigger.num);
                        trigger.cancel();
                        event.finish();
                    }
                    'step 1'
                    if (!trigger.hasNature('thunder')) {
                        player.draw(trigger.num);
                        trigger.cancel();
                    }
                    else if (trigger.source && trigger.source.isIn()) {
                        player.line(trigger.source, 'fire');
                        trigger.source.addMark('zshy_kuangfeng_Debuff', trigger.num, false);
                        trigger.source.addSkill('zshy_kuangfeng_Debuff');
                    }
                },
                mark: true,
                marktext: '雾',
                intro: {
                    content: '受到非雷电伤害或失去体力无效',
                },
                ai: {
                    nofire: true,
                    nodamage: true,
                    effect: {
                        target(card, player, target, current) {
                            if (get.tag(card, 'damage') && !get.tag(card, 'thunderDamage')) return [0, 0];
                        },
                    },
                },
            },
        },
    },
    zshy_kuangfeng: {//狂风
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: ['phaseBegin', 'phaseEnd'],
        },
        charlotte: true,
        locked: true,
        direct: true,
        filter(event, player) {
            return player.getExpansions('zshy_qixing').length;
        },
        content() {
            'step 0'
            var num = Math.min(game.countPlayer(), player.getExpansions('zshy_qixing').length);
            var str = '弃置至多' + num + '枚「星」，然后令等量名没有「雾」的角色获得1枚「风」';
            player.chooseTarget(get.prompt('zshy_kuangfeng'), str, [1, num], function (card, player, target) {
                return !target.hasSkill('zshy_dawu_Buff');
            }).set('ai', function (target) {
                var att = get.attitude(player, target);
                if (att < 0) {
                    if (target.hasSkillTag('nofire') || target.getEquip('baiyin')) return 0;
                    if (target.getEquip('tengjia') || target.hp < 2 || num > 6) return 1;
                    return 0;
                }
                return 0;
            });
            'step 1'
            if (result.bool) {
                player.logSkill('zshy_kuangfeng', result.targets, 'fire');
                var length = result.targets.length;
                for (var i = 0; i < length; i++) {
                    result.targets[i].addMark('zshy_kuangfeng_Debuff', 1, false);
                    result.targets[i].addSkill('zshy_kuangfeng_Debuff');
                }
                player.chooseCardButton('狂风：请弃置' + length + '枚「星」', length, player.getExpansions('zshy_qixing'), true);
            }
            else event.finish();
            'step 2'
            player.loseToDiscardpile(result.links);
        },
        ai: {
            combo: 'zshy_qixing',
        },
        group: 'zshy_kuangfeng_Draw',
        subSkill: {
            Draw: {
                audio: 'zshy_kuangfeng',
                trigger: {
                    global: 'damageBegin3',
                },
                charlotte: true,
                forced: true,
                logTarget: 'player',
                filter(event, player) {
                    return !event.hasNature('fire') && event.player.hasMark('zshy_kuangfeng_Debuff');
                },
                content() {
                    player.draw(trigger.num);
                },
            },
            Debuff: {
                audio: 'zshy_kuangfeng',
                trigger: {
                    player: 'damageBegin3',
                },
                forced: true,
                onremove: true,
                charlotte: true,
                filter(event, player) {
                    return event.hasNature('fire');
                },
                content() {
                    'step 0'
                    player.removeMark('zshy_kuangfeng_Debuff', 1);
                    trigger.num += trigger.num;
                    'step 1'
                    if (!player.hasMark('zshy_kuangfeng_Debuff')) player.removeSkill('zshy_kuangfeng_Debuff');
                },
                marktext: '风',
                intro: {
                    name2: '风',
                    content: '受到的火焰伤害翻倍',
                },
                ai: {
                    effect: {
                        target(card, player, target, current) {
                            if (get.tag(card, 'fireDamage')) return 1.5;
                        },
                    },
                },
            },
        },
    },

};
const 其徐如林 = {
    //墟徐晃
    zshy_duanliang: {//断粮
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: ['phaseZhunbeiBegin'],
        },
        filter(event, player) {
            return event.player.isIn() && event.player != player;
        },
        check(event, player) {
            return get.attitude(event.player, player) < 0;
        },
        logTarget(event) {
            return event.player;
        },
        prompt2(event, player) {
            return `令${get.translation(event.player)}跳过摸牌阶段，然后你获得其一张牌。`;
        },
        async content(event, trigger, player) {
            trigger.player.skip('phaseDraw');
            await player.gainPlayerCard(trigger.player, 'he', true);
        },
    },
    zshy_jiezi: {//截辎
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: ['phaseDrawSkipped', 'phaseDrawCancelled'],
        },
        async cost(event, trigger, player) {
            event.result = await player.chooseTarget(get.prompt2('zshy_jiezi'))
                .set('ai', function (target) {
                    if (get.attitude(_status.event.player, target) > 0) {
                        if (target.hp < 3 || target.countCards('h') < 5) {
                            return 1;
                        }
                        return get.attitude(_status.event.player, target);
                    }
                    return;
                }).forResult();
        },
        async content(event, trigger, player) {
            event.targets[0].chooseDrawRecover(2, true);
        },
        ai: {
            expose: 0.8,
        },
    },

    //墟曹丕
    zshy_fangzhu: {//放逐
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AAZZshensimayiSHZL: 'zshy_fangzhu_zshy_AAZZshensimayiSHZL',
            zshy_AAZZcaomaoLXXH: 'zshy_fangzhu_zshy_AAZZcaomaoLXXH',
        },
        trigger: {
            player: ['damageEnd', 'phaseZhunbeiBegin'],
        },
        async cost(event, trigger, player) {
            let str1 = ``, str2 = ``;
            if (player.isDamaged()) {
                str1 += '并摸' + player.getDamagedHp() + '张牌';
                str2 += '弃置' + player.getDamagedHp() + '张牌并'
            };
            let str = '选择一名其他角色令其执行一项：①令其翻面' + str1 + '；②令其' + str2 + '失去1点体力';
            event.result = await player.chooseTarget(get.prompt(event.skill), str, function (card, target, player) {
                return target != player;
            }).set('ai', function (target) {
                const player = _status.event.player;
                const att = get.attitude(player, target);
                if (trigger.num == 2 && player.getDamagedHp() > 2) return att * 2;
                if (att < 0) {
                    if (target.isTurnedOver() && target.hasSkillTag('noturn')) return 0;
                    return 1;
                }
                if (att > 0) {
                    if (target.isTurnedOver() || target.hasSkillTag('noturn')) return 2;
                    if (target.hasSkillTag('noturn') && !target.countCards('h')) return 1;
                    return 0;
                }
                return -att;
            }).forResult();
        },
        async content(event, trigger, player) {
            let str1 = ``, str2 = ``;
            if (player.isDamaged()) {
                str1 += `并摸${player.getDamagedHp()}张牌`;
                str2 += `弃置${player.getDamagedHp()}张牌并`;
            }
            let target = event.targets[0];
            let list = [
                '令' + get.translation(target) + '翻面' + str1,
                '令' + get.translation(target) + str2 + '失去1点体力',
            ];
            const result = await player.chooseControl(true).set('choiceList', list).set('ai', function () {
                const player = _status.event.player;
                const att = get.attitude(player, target);
                if (att < 0) {
                    if (target.isTurnedOver() || target.hasSkillTag('noturn') || target.hp < 2 || player.getDamagedHp() > 2) return 1;
                    return 0;
                }
                return 0;
            }).set('prompt', '放逐：请选择一项').forResult();
            if (result?.control) {
                if (result.control == `选项一`) {
                    event.targets[0].turnOver();
                    event.targets[0].draw(player.getDamagedHp());
                }
                else {
                    if (event.targets[0].countCards('he') > 0) event.targets[0].chooseToDiscard(player.getDamagedHp(), 'he', true);
                    event.targets[0].loseHp();
                }
            }
        },
        getIndex(event, player) {
            if (event.num > 0 || event.num != undefined) return event.num;
            return 1;
        },
        ai: {
            maixie: true,
            maixie_hp: true,
            effect: {
                target(card, player, target) {
                    if (get.tag(card, 'damage')) {
                        if (player.hasSkillTag('jueqing', false, target)) return [1, -1.5];
                        if (target.hp <= 1) return;
                        if (!target.hasFriend()) return;
                        var hastarget = false;
                        var turnfriend = false;
                        var players = game.filterPlayer();
                        for (var i = 0; i < players.length; i++) {
                            if (get.attitude(target, players[i]) < 0 && !players[i].isTurnedOver()) {
                                hastarget = true;
                            }
                            if (get.attitude(target, players[i]) > 0 && players[i].isTurnedOver()) {
                                hastarget = true;
                                turnfriend = true;
                            }
                        };
                        if (get.attitude(player, target) > 0 && !hastarget) return;
                        if (turnfriend || target.hp == target.maxHp) return [0.5, 1];
                        if (target.hp > 1) return [1, 0.5];
                    };
                },
            },
        },
        subSkill: {
            zshy_AAZZshensimayiSHZL: { audio: 'ext:诸神寰宇/audio/character:2' },
            zshy_AAZZcaomaoLXXH: { audio: 'ext:诸神寰宇/audio/character:2' },
        }
    },
    zshy_xingshang: {//行殇
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AAZZcaoyingJMGX: 'zshy_xingshang_zshy_AAZZcaoyingJMGX',
            zshy_AAZZcaoyingJMGX_shadow: 'zshy_xingshang_zshy_AAZZcaoyingJMGX_shadow',
        },
        trigger: {
            global: 'die',
        },
        forced: true,
        filter(event, player) {
            return event.player != player;
        },
        async content(event, trigger, player) {
            let list = [];
            let skills = trigger.player.getOriginalSkills();
            if (skills.length) {
                for (const skill of skills) {
                    list.push([skill, '<div class="popup text" style="width:calc(100% - 10px);display:inline-block"><div class="skill">【' +
                        get.translation(skill) + '】</div><div>' + lib.translate[skill + '_info'] + '</div></div>',
                    ])
                };
                const result = await player.chooseButton([
                    '行殇：请选择要获得的技能',
                    [list, 'textbutton'],
                ])
                    .set('forced', false)
                    .set('selectButton', [1, Infinity])
                    .set('ai', function (button) {
                        return Math.random();
                    })
                    .set('skills', skills).forResult();
                if (result?.bool) {
                    let skill = result.links;
                    player.addSkillLog(skill);
                }
            };
            await player.recover();
            if (trigger.player.countCards('hej') > 0) {
                await player.gain(trigger.player.getCards('hej'), trigger.player, 'giveAuto');
            };
        },
    },
    zshy_songwei: {//颂威
        audio: 'ext:诸神寰宇/audio/character:2',
        forced: true,
        trigger: { global: 'judgeEnd' },
        filter(event, player) {
            return event.player.group == 'wei';
        },
        async content(event, trigger, player) {
            trigger.player.line(player, 'green');
            player.draw();
            if (trigger.result.color == 'black') {
                player.recover();
            }
        },
    },

    //墟孙坚
    zshy_yinghun: {//英魂
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AAZZsunceSHZL: 'zshy_yinghun_zshy_AAZZsunceSHZL',
            zshy_AAZZsunyiJMGX: 'zshy_yinghun_zshy_AAZZsunyiJMGX',
        },
        trigger: {
            global: ['phaseZhunbeiBegin'],
        },
        async cost(event, trigger, player) {
            const num = 1 + player.getDamagedHp();
            const result = await player.chooseTarget(get.prompt(event.skill), `选择一名角色令其摸${num}张牌或随机弃置${num}张牌`)
                .set('ai', function (target) {
                    const att = get.attitude(player, target);
                    if (att > 0 && target.countCards('h') <= 5) {
                        return get.effect(target, { name: 'draw' }, player, player) * num;
                    };
                    return get.effect(target, { name: 'guohe_copy2' }, player, player) * num;
                })
                .forResult();
            if (!result?.targets) {
                return;
            }
            const list = ['选项一', '选项二', 'cancel2'], choiceList = [
                `令${get.translation(result.targets)}摸${num}张牌`,
                `令${get.translation(result.targets)}随机弃置${num}张牌`,
            ];
            const result1 = await player.chooseControl(list)
                .set('choiceList', choiceList)
                .set('ai', function () {
                    if (get.attitude(player, result.targets[0]) > 0) {
                        return '选项一';
                    }
                    return '选项二';
                }).set('prompt', get.translation('zshy_yinghun'))
                .forResult();
            event.result = {
                bool: result1?.control != 'cancel2',
                targets: result?.targets,
                cost_data: result1?.control,
            }
        },
        async content(event, trigger, player) {
            const { targets, cost_data } = event;
            const num = 1 + player.getDamagedHp();
            if (cost_data == '选项一') {
                await targets[0].draw(num);
            } else {
                await targets[0].randomDiscard(num, true);
            }
        },
        ai: {
            expose: 0.8,
        },
        group: ['zshy_yinghun_use'],
        subSkill: {
            zshy_AAZZsunyiJMGX: { audio: 'ext:诸神寰宇/audio/character:2' },
            use: {
                audio: 'zshy_yinghun',
                audioname2: {
                    zshy_AAZZsunceSHZL: 'zshy_yinghun_zshy_AAZZsunceSHZL',
                    zshy_AAZZsunyiJMGX: 'zshy_yinghun_zshy_AAZZsunyiJMGX',
                },
                trigger: {
                    global: ['phaseJieshuBegin'],
                },
                forced: true,
                async content(event, trigger, player) {
                    await player.chooseDrawRecover(true);
                    await player.chooseToUse(`英魂：选择一张牌使用`);
                },
            },
        },
    },
    zshy_wulie: {//武烈
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        filter(event, player) {
            return game.hasPlayer(function (current) {
                return !current.hasSkill('zshy_wulie_Buff');
            }) && player.hp > 0;
        },
        filterTarget(card, player, target) {
            return !target.hasSkill('zshy_wulie_Buff');
        },
        prompt: '出牌阶段，你可以失去1点体力并令一名没有「烈」的角色获得「烈」，然后你摸一张牌并获得1点护甲',
        async content(event, trigger, player) {
            await player.loseHp();
            event.target.addSkill('zshy_wulie_Buff');
            player.draw();
            player.changeHujia();
        },
        ai: {
            order() {
                return [5, 6, 7, 8].randomGet();
            },
            result: {
                target(player, target) {
                    if (player.hp < 2 && !player.canSave(player)) return 0;
                    return 1;
                },
            },
        },
        group: ['zshy_wulie_damage'],
        subSkill: {
            Buff: {
                audio: 'zshy_wulie',
                trigger: {
                    player: 'damageBegin4',
                },
                forced: true,
                onremove: true,
                charlotte: true,
                filter(event, player, name) {
                    return event.num >= player.hp;
                },
                content() {
                    trigger.cancel();
                    player.removeSkill('zshy_wulie_Buff');
                },
                ai: {
                    damageBonus: true,
                },
                mark: true,
                marktext: '烈',
                intro: {
                    content: '获得英魂庇佑',
                },
            },
            damage: {
                audio: 'zshy_wulie',
                trigger: {
                    source: 'damageBegin2',
                },
                forced: true,
                locked: false,
                filter(event, player, target, card) {
                    return !event.player.countCards('h');
                },
                async content(event, trigger, player) {
                    trigger.num++;
                },
            },
        },
    },
    zshy_polu: {//破虏
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: ['dieAfter', 'die'] },
        filter(event, player, name) {
            if (name == 'dieAfter' && event.source && event.source.group == 'wu') return true;
            if (name == 'die' && event.player.group == 'wu') return true;
            return false;
        },
        async cost(event, trigger, player) {
            if (!player.storage.zshy_polu) player.storage.zshy_polu = 0;
            const num = player.storage.zshy_polu + 1;
            event.result = await player.chooseTarget([1, Infinity], get.prompt('zshy_polu'), '令任意名角色摸' + get.cnNumber(num) + '张牌')
                .set('forceDie', true)
                .set('ai', function (target) {
                    return get.attitude(_status.event.player, target) > 2;
                }).forResult();
        },
        async content(event, trigger, player) {
            const num = player.storage.zshy_polu + 1;
            player.storage.zshy_polu++;
            const targets = event.targets.sortBySeat();
            player.logSkill('zshy_polu', targets);
            game.asyncDraw(targets, num);
        },
    },

    //墟董卓
    zshy_jiuchi: {//酒池
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'chooseToUse',
        filterCard: true,
        viewAs: { name: 'jiu' },
        position: 'he',
        viewAsFilter(player) {
            return player.countCards('he');
        },
        prompt: '将一张牌当酒使用',
        check(cardx, player) {
            if (player && player == cardx.player) return true;
            if (_status.event.type == 'dying') return 1;
            var player = _status.event.player;
            var shas = player.getCards('he', function (card) {
                return card != cardx && get.name(card, player) == 'sha';
            });
            if (!shas.length) return -1;
            if (shas.length > 1 && (player.getCardUsable('sha') > 1 || player.countCards('he', 'zhuge'))) {
                return 0;
            }
            shas.sort(function (a, b) {
                return get.order(b) - get.order(a);
            });
            var card = false;
            if (shas.length) {
                for (var i = 0; i < shas.length; i++) {
                    if (shas[i] != cardx && lib.filter.filterCard(shas[i], player)) {
                        card = shas[i];
                        break;
                    }
                }
            }
            if (card) {
                if (
                    game.hasPlayer(function (current) {
                        return (
                            get.attitude(player, current) < 0 &&
                            !current.hasShan() &&
                            current.hp + current.countCards('he', { name: ['tao', 'jiu'] }) > 1 + (player.storage.jiu || 0) &&
                            player.canUse(card, current, true, true) &&
                            !current.hasSkillTag('filterDamage', null, {
                                player: player,
                                card: card,
                                jiu: true,
                            }) &&
                            get.effect(current, card, player) > 0
                        );
                    })
                ) {
                    return 4 - get.value(cardx);
                }
            }
            return -1;
        },
        ai: {
            threaten: 1.5,
        },
        mod: {
            ignoredHandcard(card, player) {
                if (get.suit(card) == 'spade') return true;
            },
            cardDiscardable(card, player, name) {
                if (name == 'phaseDiscard' && get.suit(card) == 'spade') return false;
            },
            cardUsable(card, player, num) {
                if (card.name == 'jiu') return Infinity;
            },
        },
        group: ['zshy_jiuchi_damage', 'zshy_jiuchi_hit'],
        subSkill: {
            damage: {
                audio: `zshy_jiuchi`,
                trigger: { source: 'damageEnd' },
                locked: false,
                forced: true,
                filter(event, player) {
                    if (event.name == 'chooseToUse') return player.hasCard(card => get.suit(card) == 'spade', 'he');
                    return event.card && get.name(event.card) == 'sha' && event.getParent(2).jiu == true && !player.hasSkill('zshy_benghuai_ban');
                },
                content() {
                    player.addTempSkill('zshy_benghuai_ban');
                },
            },
            hit: {
                audio: 'zshy_jiuchi',
                forced: true,
                trigger: {
                    player: 'useCard',
                },
                filter(event, player) {
                    return event.getParent(2).jiu == true;
                },
                preHidden: true,
                content() {
                    trigger.nowuxie = true;
                    trigger.directHit.addArray(game.players);
                },
                ai: {
                    pretao: true,
                    directHit_ai: true,
                    skillTagFilter(player, tag, arg) {
                        return true;
                    },
                },
            },
        },
    },
    zshy_roulin: {//肉林
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'useCardToPlayered' },
        forced: true,
        filter(event, player, target) {
            return get.name(event.card) == 'sha' && !event.getParent().directHit.includes(event.target) && event.target.hasSex('female');;
        },
        logTarget: 'target',
        async content(event, trigger, player) {
            const id = trigger.target.playerid;
            const map = trigger.getParent().customArgs;
            if (!map[id]) map[id] = {};
            if (typeof map[id].shanRequired == 'number') {
                map[id].shanRequired++;
            }
            else {
                map[id].shanRequired = 2;
            }
        },
        ai: {
            directHit_ai: true,
            skillTagFilter(player, tag, arg) {
                if (arg.card.name != 'sha' || arg.target.countCards('h', 'shan') > 1) return false;
            },
        },
        group: ['zshy_roulin_gain'],
        subSkill: {
            gain: {
                audio: 'zshy_roulin',
                trigger: {
                    source: 'damageEnd',
                },
                forced: true,
                lastDo: true,
                filter(event, player, target) {
                    return event.player.hasSex('female');
                },
                async content(event, trigger, player) {
                    player.gainMaxHp();
                    player.recover();
                    trigger.player.loseMaxHp();
                },
                getIndex(event) {
                    return event.num;
                },
            }
        },
    },
    zshy_benghuai: {//崩坏
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AAZZzhugedanJMGX: 'zshy_benghuai_zshy_AAZZzhugedanJMGX',
        },
        trigger: {
            player: ['phaseJieshuBegin'],
        },
        forced: true,
        filter(event, player) {
            return !player.isMinHp();
        },
        async content(event, trigger, player) {
            if (player.hasSkill('zshy_benghuai_ban')) {
                player.draw(2);
                event.finish();
            }
            var str1 = '失去体力', str2 = '减少上限';
            const result = await player.chooseControl(str1, str2).set('prompt', '崩坏：失去1点体力或减少1点体力上限')
                .set('ai', function (event, player) {
                    if (player.hp == player.maxHp) return str1;
                    if (player.hp < player.maxHp - 1 || player.hp <= 2) return str2;
                    return str1;
                }).forResult();
            if (result && result.control) {
                switch (result.control) {
                    case str1:
                        player.loseHp();
                        player.draw();
                        break;
                    case str2:
                        player.loseMaxHp();
                        player.draw();
                        break;
                    default:
                        break;
                }
            }
        },
        ai: {
            threaten: 0.5,
            neg: true,
        },
        subSkill: {
            zshy_AAZZzhugedanJMGX: { audio: 'ext:诸神寰宇/audio/character:2' },
            ban: {
                mark: true,
                onremove: true,
                charlotte: true,
                marktext: '酒池',
                intro: {
                    name2: '酒池',
                    content: '本回合〖崩坏〗效果已转变',
                },
            },
        }
    },
    zshy_baonue: {//暴虐
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'damageSource',
        },
        filter(event, player) {
            return event.source && event.source.group == 'qun';
        },
        direct: true,
        content() {
            'step 0';
            event.count = trigger.num;
            'step 1';
            event.count--;
            player.chooseBool('是否发动【暴虐】？').set('choice', get.attitude(player, player) > 0);
            'step 2';
            if (result.bool) {
                player.logSkill('zshy_baonue', trigger.source);
                player.judge(function (card) {
                    if (get.suit(card) == 'spade') return 4;
                    return 0;
                }).set('callback', function () {
                    player.gain(event.judgeResult.card, 'gain2', 'log');
                    if (event.judgeResult.suit == 'spade') {
                        player.recover();
                    }
                }).judge2 = function (result) {
                    return result.bool ? true : false;
                };
            } else {
                event.finish();
            }
            'step 3';
            if (event.count && lib.skill.zshy_baonue.filter(trigger, player)) event.goto(1);
        },
    },

    //墟祝融
    zshy_juxiang: {//巨象
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            target: 'useCardToTargeted',
        },
        forced: true,
        filter(event, player) {
            if (get.name(event.card) != 'nanman') return false;
            return event.targets;
        },
        async content(event, trigger, player) {
            trigger.getParent().excluded.add(player);
            game.log(player, '令', trigger.card, '对其无效');
            await player.chooseDrawRecover(true);
        },
        ai: {
            effect: {
                target(card) {
                    if (get.name(card) != 'nanman') return;
                },
            },
        },
        group: ['zshy_juxiang_Gain'],
        subSkill: {
            Gain: {
                audio: 'zshy_juxiang',
                trigger: {
                    global: 'useCardAfter',
                    player: 'phaseBegin',
                },
                forced: true,
                filter(event, player, name) {
                    if (name == 'useCardAfter') {
                        if (get.name(event.card) != 'nanman') return false;
                        return event.player != player && event.cards.someInD();
                    } else {
                        return true;
                    }
                },
                async content(event, trigger, player) {
                    if (event.triggername == 'useCardAfter') {
                        player.gain(trigger.cards.filterInD(), 'gain2');
                    } else {
                        let card = get.cardPile(function (card) {
                            return card.name == 'nanman';
                        });
                        player.gain(card, 'gain2').gaintag.add('zshy_juxiang');
                    }
                },
            },
        },
    },
    zshy_lieren: {//烈刃
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            source: 'damageEnd',
        },
        check(event, player) {
            var hs = player.getCards('h');
            for (var i = 0; i < hs.length; i++) {
                var val = get.value(hs[0]);
                if (hs[i].number < 9 && val > 6) return false;
            }
            var target = lib.skill.zshy_lieren.logTarget(event, player);
            var eff = get.damageEffect(target, player, player);
            var att = get.attitude(player, target);
            return att < 0 && eff > 0;
        },
        filter(event, player) {
            var target = lib.skill.zshy_lieren.logTarget(event, player);
            return target && target.isIn() && player.canCompare(target);
        },
        logTarget(event, player) {
            return player == event.player ? event.source : event.player;
        },
        prompt2(event, player) {
            var str = '与', target = lib.skill.zshy_lieren.logTarget(event, player);
            str += get.translation(target) + '拼点，若其没赢，则你获得其一张牌';
            return str;
        },
        content() {
            'step 0'
            var target = lib.skill.zshy_lieren.logTarget(trigger, player);
            event.target = target, player.chooseToCompare(target);
            'step 1'
            if (result.winner != target) {
                player.line(target);
                if (target.countGainableCards(player, 'he')) {
                    player.gainPlayerCard(target, true, 'he');
                };
                target.damage();
            }
        },
        ai: {
            expose: 0.2,
        },
    },
    zshy_changbiao: {//长标
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        lose: false,
        delay: false,
        discard: false,
        position: 'hes',
        multiline: true,
        filterCard: true,
        multitarget: true,
        selectCard: [1, Infinity],
        selectTarget() {
            return [1, _status.event.player.hp];
        },
        filter(event, player) {
            return player.countCards('hes');
        },
        filterTarget(card, player, target) {
            return player.canUse('sha', target, false);
        },
        check(card) {
            //AI 最多弃 2 张，避免把便宜牌全弃光
            if (ui.selected.cards.length >= 2) return -1;
            return 6 - get.value(card);
        },
        async content(event, trigger, player) {
            player.discard(event.cards, true);
            player.addMark('zshy_changbiao_Draw', event.cards.length, false);
            player.addTempSkill('zshy_changbiao_Draw', 'phaseAfter');
            let targets = event.targets.sortBySeat();
            await player.useCard({ name: 'sha', nature: 'stab' }, targets, false);
        },
        ai: {
            order() {
                return [3, 5, 7].randomGet();
            },
            result: {
                target(player, target) {
                    return get.effect(target, { name: 'sha', nature: 'stab' }, player, player);
                },
            },
        },
        subSkill: {
            Draw: {
                sub: true,
                audio: 'zshy_changbiao',
                trigger: {
                    player: 'phaseEnd',
                },
                forced: true,
                onremove: true,
                charlotte: true,
                marktext: '标',
                intro: {
                    name2: '标',
                    content: '回合结束时摸#张牌',
                },
                filter(event, player) {
                    return player.hasMark('zshy_changbiao_Draw');
                },
                content() {
                    player.draw(player.countMark('zshy_changbiao_Draw'));
                },
            },
        },
    },

    //墟孟获
    zshy_huoshou: {//祸首
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: ['useCard'],
        },
        forced: true,
        filter(event, player, card) {
            return event.card && get.name(event.card) == 'nanman';
        },
        async content(event, trigger, player) {
            trigger.customArgs.default.customSource = player;
            await player.chooseDrawRecover(true);
        },
        group: ['zshy_huoshou_cancel'],
        subSkill: {
            cancel: {
                audio: 'zshy_huoshou',
                trigger: { target: 'useCardToBefore' },
                forced: true,
                filter(event, player) {
                    return get.name(event.card) == 'nanman';
                },
                async content(event, trigger, player) {
                    trigger.cancel();
                },
            },
        },
    },
    zshy_zaiqi: {//再起
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: ['phaseJieshuBegin'],
        },
        frequent: true,
        check(event, player) {
            if (player.isDying() || player.hp < player.maxHp) return true;
            return player.countCards('h') <= 2;
        },
        async content(event, trigger, player) {
            const num = player.getDamagedHp() + 1;
            event.cards = get.cards(num);
            game.cardsGotoOrdering(event.cards);
            player.showCards(event.cards);
            let hnum = 0, snum = 0, cnum = 0, dnum = 0;
            for (let i = 0; i < event.cards.length; i++) {
                if (get.suit(event.cards[i]) == 'heart') {
                    hnum++;
                    event.cards.splice(i--, 1);
                }
                if (get.suit(event.cards[i]) == 'spade') {
                    snum++;
                    event.cards.splice(i--, 1);
                }
                if (get.suit(event.cards[i]) == 'club') {
                    cnum++;
                    event.cards.splice(i--, 1);
                }
                if (get.suit(event.cards[i]) == 'diamond') {
                    dnum++;
                    event.cards.splice(i--, 1);
                }
            }
            if (hnum) {
                player.gainMaxHp();
                player.recover(hnum);
            }
            if (dnum) {
                player.addMark('zshy_zaiqi_damage', dnum);
            };
            if (cnum) player.draw(cnum);
            if (snum) player.useCard({ name: 'nanman' }, game.filterPlayer(function (current) {
                return player.canUse({ name: 'nanman' }, current);
            }), 'noai').set('oncard', card => { _status.event.baseDamage = snum; });
            if (event.cards.length) {
                player.gain(event.cards, 'gain2');
            }
        },
        group: ['zshy_zaiqi_damage'],
        subSkill: {
            damage: {
                audio: 'zshy_huoshou',
                trigger: {
                    source: ['damageBegin2'],
                },
                filter(event, player) {
                    return player.countMark('zshy_zaiqi_damage') > 0;
                },
                prompt(links, player) {
                    return '是否令即将造成的伤害+' + player.countMark('zshy_zaiqi_damage') + '点？';
                },
                content() {
                    var num = player.countMark('zshy_zaiqi_damage');
                    trigger.num += num;
                    player.removeMark('zshy_zaiqi_damage', num);
                },
                marktext: '起',
                intro: {
                    content: '下次造成的伤害+#',
                },
            }
        },
    },

    //墟贾诩
    zshy_wansha: {//完杀
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AAZZshensimayiSHZL: 'zshy_wansha_zshy_AAZZshensimayiSHZL',
        },
        trigger: {
            global: 'recoverBefore',
        },
        filter(event, player) {
            return (player == _status.currentPhase && event.player != player) || _status.dying.length;
        },
        prompt2(event, player) {
            return '防止' + get.translation(event.player) + '回复体力';
        },
        check(event, player) {
            return get.effect(event.player, { name: 'recover' }, player) < 0;
        },
        async content(event, trigger, player) {
            trigger.cancel();
            player.draw();
        },
        ai: {
            expose: 0.5,
            threaten: 3.5,
        },
        subSkill: {
            zshy_AAZZshensimayiSHZL: { audio: 'ext:诸神寰宇/audio/character:2' },
        },
    },
    zshy_weimu: {//帷幕
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'damageBegin4',
        },
        forced: true,
        filter(event, player) {
            return player == _status.currentPhase;
        },
        async content(event, trigger, player) {
            player.chooseDrawRecover(trigger.num, trigger.num * 2);
            let str = `帷幕：将${trigger.num}点伤害转移给一名其他角色，或“取消”并防止之`;
            const result = await player.chooseTarget(lib.filter.notMe, str).set('ai', function (target) {
                var player = _status.event.player;
                return get.damageEffect(target, player, player);
            }).forResult();
            if (result.bool) {
                player.line(result.targets[0]);
                trigger.player = result.targets[0];
            }
            else {
                trigger.cancel();
            }

        },
        ai: {
            result: {
                player(card, player, target) {
                    if (player == _status.currentPhase && get.tag(card, 'damage')) return [0, 2];
                },
            },
            effect: {
                target(card, player, target) {
                    if (target == _status.currentPhase && get.tag(card, 'damage')) return [0, 2];
                },
            },
        },
        group: 'zshy_weimu_log',
        subSkill: {
            log: {
                audio: 'zshy_weimu',
                trigger: {
                    target: 'useCardToTargeted',
                },
                locked: true,
                check(event, player) {
                    return get.effect(event.player, event.card, player, event.player) < 0;
                },
                filter(event, player) {
                    return get.type2(event.card) == 'trick';
                },
                prompt2(event, player) {
                    return '令' + get.translation(event.card) + '对你无效，然后你回复1点体力或摸一张牌';
                },
                async content(event, trigger, player) {
                    trigger.excluded.push(player);
                    await player.chooseDrawRecover(true);
                },
                ai: {
                    effect: {
                        target(card, player, target) {
                            if (get.color(card) == 'black' && get.type2(card) == 'trick') return [0, 1];
                        },
                    },
                },
            },
        },
    },
    zshy_luanwu: {//乱武
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        usable: 1,
        unique: true,
        skillAnimation: 'epic',
        animationColor: 'thunder',
        filterTarget(card, player, target) {
            return target != player;
        },
        selectTarget: -1,
        multiline: true,
        content() {
            'step 0'
            target.chooseToUse('乱武：使用一张『伤害』类牌或失去1点体力', function (card) {
                if (!get.tag(card, 'damage')) return false;
                return lib.filter.filterCard.apply(this, arguments);
            }, function (card, player, target) {
                if (player == target) return false;
                var dist = get.distance(player, target);
                if (dist > 1) {
                    if (
                        game.hasPlayer(function (current) {
                            return current != player && get.distance(player, current) < dist;
                        })
                    ) {
                        return false;
                    }
                }
                return lib.filter.filterTarget.apply(this, arguments);
            }).set('ai2', function () {
                return get.effect_use.apply(this, arguments) - _status.event.effect;
            }).set('effect', get.effect(target, { name: 'losehp' }, target, target));
            'step 1'
            if (result.bool == false) {
                target.loseHp();
            }
        },
        async contentAfter(event, trigger, player) {
            await player.chooseUseTarget('binglinchengxiax', '是否使用一张【兵临城下】？', false, 'nodistance');
        },
        ai: {
            order: 13,
            result: {
                player(player) {
                    if (lib.config.mode == 'identity' && game.zhu.isZhu && player.identity == 'fan') {
                        if (game.zhu.hp <= 2 && game.zhu.countCards('h') <= 2) return 1;
                    }
                    var num = 0;
                    var players = game.filterPlayer();
                    for (var i = 0; i < players.length; i++) {
                        var att = get.attitude(player, players[i]);
                        if (att > 0) att = 1;
                        if (att < 0) att = -1;
                        if (players[i] != player && players[i].hp <= 3) {
                            if (players[i].countCards('h') == 0) num += att / players[i].hp;
                            else if (players[i].countCards('h') == 1) num += att / 2 / players[i].hp;
                            else if (players[i].countCards('h') == 2) num += att / 4 / players[i].hp;
                        }
                        if (players[i].hp == 1) num += att * 1.5;
                    }
                    if (player.hp == 1) {
                        return -num;
                    }
                    if (player.hp == 2) {
                        return -game.players.length / 4 - num;
                    }
                    return -game.players.length / 3 - num;
                },
            },
        },
    },

    //墟鲁肃
    zshy_haoshi: {//好施
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'gainAfter',
            global: 'loseAsyncAfter',
        },
        filter(event, player) {
            if (_status.currentPhase != player || event.getg(player).length == 0) {
                return false;
            }
            return event.getParent(2).name != 'zshy_haoshi';
        },
        prompt2(event, player) {
            return '摸两张牌，然后选择一名其他角色获得你区域内至少一张牌或弃置一张牌';
        },
        async content(event, trigger, player) {
            player.draw(2);
            if (player.countCards('hej') == 0) {
                return;
            }
            const result = await player.chooseTarget(function (card, player, target) {
                return target != player && player.countGainableCards(target, 'hej');
            }, '【好施】：令一名其他角色观看并获得你区域内至少一张牌，或取消并弃置一张牌').set('ai', function (target) {
                var player = _status.event.player;
                return get.attitude(player, target) > 3;
            }).forResult();
            if (result.bool && result?.targets) {
                player.line(result.targets[0]);
                result.targets[0].gainPlayerCard(player, 'hej', [1, Infinity], true);
            }
            else {
                player.chooseToDiscard('he', true);
            };
        },
        ai: {
            expose: 0.2,
        },
    },
    zshy_dimeng: {//缔盟
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        usable: 1,
        selectTarget: 2,
        multiline: true,
        multitarget: true,
        complexTarget: true,
        complexSelect: true,
        targetprompt: ['被拿', '拿牌'],
        filter(event, player) {
            return game.hasPlayer(function (current) {
                return current.countCards('h');
            });
        },
        filterTarget(card, player, target) {
            if (!ui.selected.targets.length) {
                return target.countCards('h');
            }
            return true;
        },
        content() {
            'step 0'
            targets[1].gain(targets[0].getCards('h'), 'giveAuto', 'bySelf');
            'step 1'
            if (targets[0].isIn() && targets[1].isIn() && targets[1].countCards('hes')) {
                var str = '缔盟：请交给' + get.translation(targets[0]) + '至少一张牌，否则失去1点体力';
                targets[1].chooseCard('hes', str, [1, Infinity]).set('ai', function (card) {
                    if (ui.selected.cards.length) return 0;
                    if (get.attitude(targets[1], targets[0]) < 0) {
                        if (targets[1].hp < 2) return 7 - get.value(card);
                    }
                    return 3 - get.value(card);
                });
            }
            else event.finish();
            'step 2'
            if (result.bool) {
                targets[1].give(result.cards, targets[0]);
            }
            else targets[1].loseHp();
        },
        ai: {
            pretao: true,
            nokeep: true,
            threaten: 4.5,
            order() {
                return [1, 3, 5, 7, 9].randomGet();
            },
            result: {
                target(player, target) {
                    if (!ui.selected.targets.length) return -target.countCards('h');
                    return 1;
                },
            },
        },
    },

    zshy_kuangbao: {//狂暴
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            source: 'damageEnd',
            player: 'damageEnd',
        },
        charlotte: true,
        forced: true,
        async content(event, trigger, player) {
            await player.addMark('zshy_kuangbao', trigger.num);
            if (trigger.source && trigger.player && trigger.source == player && trigger.player != player && player.countMark('zshy_kuangbao') > trigger.player.hp) {
                await trigger.player.loseMaxHp();
            }
            else if (trigger.source && trigger.player && trigger.player == player && trigger.source != player && player.countMark('zshy_kuangbao') > trigger.source.hp) {
                await trigger.source.loseHp();
            }
        },
        marktext: '怒',
        markimage: 'extension/诸神寰宇/other/Files/Mark/zshy_kuangbao.png',
        intro: {
            name2: '怒',
            content: 'mark',
        },
        ai: {
            maixie: true,
            maixie_hp: true,
        },
    },
    zshy_wumou: {//无谋
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'damageEnd',
        },
        charlotte: true,
        forced: true,
        filter(event, player) {
            return get.type(event.card) != 'basic';
        },
        async content(event, trigger, player) {
            await player.addMark('zshy_kuangbao', 1, false);
            await player.chooseDrawRecover(trigger.num, trigger.num, true);
        },
        mod: {
            cardname(card, player) {
                if (!['basic', 'equip'].includes(lib.card[card.name].type)) return 'juedou';
            },
        },
        ai: {
            respondSha: true,
            effect: {
                target(card, player, target, current) {
                    if (get.tag(card, 'respondSha') && current < 0) return 0.6
                }
            },
        },
    },
    zshy_wuqian: {//无前
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        charlotte: true,
        filter(event, player) {
            return player.countMark('zshy_kuangbao') > 1 && game.hasPlayer(function (current) {
                return current != player && !player.getStorage('zshy_wuqian').includes(current);
            });
        },
        filterTarget(card, player, target) {
            return target != player && !player.getStorage('zshy_wuqian').includes(target);
        },
        content() {
            player.removeMark('zshy_kuangbao', 2);
            player.draw(2);
            player.markAuto('zshy_wuqian', [target]);
            target.addTempSkill('zshy_wuqian_Nocard');
        },
        ai: {
            order() {
                return [10, 11, 12].randomGet();
            },
            result: {
                target: -1,
            },
        },
        onremove: true,
        intro: {
            content: '本阶段已对$发动过〖无前〗',
            onunmark: true,
        },
        group: ['zshy_wuqian_Delete'],
        subSkill: {
            Delete: {
                trigger: {
                    global: 'phaseEnd',
                },
                charlotte: true,
                popup: false,
                silent: true,
                forced: true,
                firstDo: true,
                content() {
                    player.unmarkSkill('zshy_wuqian');
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
    zshy_shenfen: {//神愤
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        usable: 1,
        direct: true,
        charlotte: true,
        skillAnimation: true,
        animationColor: 'metal',
        filter(event, player) {
            return player.countMark('zshy_kuangbao') > 0;
        },
        async content(event, trigger, player) {
            let str = '选择至多' + player.countMark('zshy_kuangbao') + '名其他角色依次弃置所有牌，然后依次对其造成1点伤害';
            const result = await player.chooseTarget(get.prompt('zshy_shenfen'), str, [1, player.countMark('zshy_kuangbao')], function (card, player, target) {
                return target != player;
            }).set('ai', function (target) {
                return get.effect(target, { name: 'guohe_copy2' }, player, player) * target.countCards('he') + get.damageEffect(target, player, player);
            }).forResult();
            if (result.bool) {
                player.logSkill('zshy_kuangbao');
                player.removeMark('zshy_kuangbao', result.targets.length);
                Promise.all(result.targets.map(function (target) {
                    target.chooseToDiscard('he', target.getCards('he').length, true);
                }));
                Promise.all(result.targets.map(function (target) {
                    target.damage('nocard');
                }));
            }
        },
        ai: {
            combo: 'zshy_kuangbao',
            order: 10,
            result: {
                player(player) {
                    return game.countPlayer(function (current) {
                        if (current != player) {
                            return get.sgn(get.damageEffect(current, player, player));
                        }
                    });
                },
            },
        },
    },
    zshy_SLBwushuang: {//无双
        audio: 'ext:诸神寰宇/audio/character:2',
        shaRelated: true,
        charlotte: true,
        forced: true,
        locked: true,
        group: ['zshy_SLBwushuang_sha', 'zshy_SLBwushuang_juedou', 'zshy_SLBwushuang_sub1'],
        preHidden: ['zshy_SLBwushuang_sha', 'zshy_SLBwushuang_juedou', 'zshy_SLBwushuang_sub1'],
        mod: {
            cardUsable(card) {
                if (card.name == 'sha') return Infinity;
            },
        },
        subSkill: {
            sha: {
                audio: 'zshy_SLBwushuang',
                trigger: { player: 'useCardToPlayered' },
                charlotte: true,
                forced: true,
                filter(event, player) {
                    return get.name(event.card) == 'sha' && !event.getParent().directHit.includes(event.target);
                },
                logTarget: 'target',
                async content(event, trigger, player) {
                    const id = trigger.target.playerid;
                    const map = trigger.getParent().customArgs;
                    if (!map[id]) map[id] = {};
                    if (typeof map[id].shanRequired == 'number') {
                        map[id].shanRequired++;
                    }
                    else {
                        map[id].shanRequired = 2;
                    }
                },
                ai: {
                    directHit_ai: true,
                    skillTagFilter(player, tag, arg) {
                        if (arg.card.name != 'sha' || arg.target.countCards('h', 'shan') > 1) return false;
                    },
                },
            },
            juedou: {
                audio: 'zshy_SLBwushuang',
                trigger: { player: 'useCardToPlayered', target: 'useCardToTargeted' },
                charlotte: true,
                forced: true,
                logTarget(trigger, player) {
                    return player == trigger.player ? trigger.target : trigger.player
                },
                filter(event, player) {
                    return get.name(event.card) == 'juedou';
                },
                //priority:-1,
                async content(event, trigger, player) {
                    const id = (player == trigger.player ? trigger.target : trigger.player)['playerid'];
                    const idt = trigger.target.playerid;
                    const map = trigger.getParent().customArgs;
                    if (!map[idt]) map[idt] = {};
                    if (!map[idt].shaReq) map[idt].shaReq = {};
                    if (!map[idt].shaReq[id]) map[idt].shaReq[id] = 1;
                    map[idt].shaReq[id]++;
                },
                ai: {
                    directHit_ai: true,
                    skillTagFilter(player, tag, arg) {
                        if (arg.card.name != 'juedou' || Math.floor(arg.target.countCards('h', 'sha') / 2) > player.countCards('h', 'sha')) return false;
                    }
                }
            },
            sub1: {
                trigger: {
                    source: 'damageBegin3',
                },
                charlotte: true,
                forced: true,
                silent: true,
                popup: false,
                firstDo: true,
                filter(event, player) {
                    return event.card && (get.name(event.card) == 'juedou' || get.name(event.card) == 'sha');
                },
                content() {
                    let num = player.getDamagedHp() + 1;
                    trigger.num += num;
                },
                ai: {
                    skillTagFilter(player, tag, arg) {
                        return (arg.card.name == 'juedou' || get.name(event.card) == 'sha');
                    },
                },
            },
        },
    },

    zshy_guixin: {//归心
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'damageBefore',
        },
        charlotte: true,
        forced: true,
        filter(event, player) {
            return event.player == player || !player.getStorage('zshy_guixin').includes(event.player);
        },
        content() {
            'step 0'
            event.count = trigger.num;
            'step 1'
            event.count--;
            var targetx = trigger.player;
            if (targetx != player) {
                player.markAuto('zshy_guixin', [targetx]);
                player.recover();
            } else {
                player.draw(2);
            }
            'step 2'
            player.chooseTarget(get.prompt('zshy_guixin'), [1, Infinity], function (card, player, target) {
                return target.countGainableCards(player, 'hej') && target != player;
            }, '获得任意名其他角色区域内各一张牌').set('ai', function (target) {
                var player = _status.event.player;
                return get.effect(target, { name: 'shunshou_copy2' }, player, player) > 0;
            });
            'step 3'
            if (result.bool) {
                var targets = result.targets.sortBySeat();
                player.line(targets, 'thunder');
                for (var i of targets) player.gainPlayerCard(i, 'hej', true);
                if (trigger.player == player) {
                    for (var i of targets) {
                        i.damage('kami');
                    }
                    var next = player.phaseUse();
                    event.next.remove(next);
                    trigger.next.push(next);
                };
            }
            'step 4'
            if (event.count > 0) {
                player.logSkill('zshy_guixin');
                event.goto(1);
            }
        },
        ai: {
            maixie: true,
            maixie_hp:  true,
            threaten(player, target) {
                if (target.hp == 1) return 2.5;
                return 0.9;
            },
            effect: {
                target(card, player, target) {
                    if (get.tag(card, 'damage')) {
                        if (player.hasSkillTag('jueqing', false, target)) return [1, -2];
                        if (!target.hasFriend()) return;
                        if (target.hp == 1) return 0.8;
                        if (player != target) return [1, 0.6];
                    }
                },
            },
        },
        onremove: true,
        intro: {
            content: '本轮已对$发动过〖归心〗',
            onunmark: true,
        },
        group: 'zshy_guixin_Delete',
        subSkill: {
            Delete: {
                trigger: {
                    global: 'phaseBegin',
                },
                charlotte: true,
                popup: false,
                silent: true,
                forced: true,
                firstDo: true,
                content() {
                    player.unmarkSkill('zshy_guixin');
                },
            },
        },
    },
    zshy_feiying: {//飞影
        charlotte: true,
        mod: {
            maxHandcard(player, num) {
                return num + player.maxHp;
            },
            globalTo(from, to, distance) {
                return distance + to.maxHp;
            },
        },
    },

};
const 不动如山 = {
    zshy_qiaobian: {//巧变
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: ['phaseJudgeBefore', 'phaseDrawBefore', 'phaseUseBefore', 'phaseDiscardBefore'],
        },
        prompt2(event, player, name) {
            let str = `是否`;
            if (name == 'phaseJudgeBefore') {
                str += `跳过判定阶段，然后令${get.translation(event.player)}摸一张牌`;
            }
            if (name == 'phaseDrawBefore') {
                str += `跳过摸牌阶段，然后令${get.translation(event.player)}可与一名其他角色交换手牌，然后选择获得至多两名其他角色的各一张手牌或摸两张牌`
            }
            if (name == 'phaseUseBefore') {
                str += `令${get.translation(event.player)}可移动场上的一张牌`
            }
            if (name == 'phaseDiscardBefore') {
                str += `跳过弃牌阶段，然后令${get.translation(event.player)}回复1点体力`
            }
            return str;
        },
        check(event, player) {
            return get.attitude(player, event.player) > 2;
        },
        async content(event, trigger, player) {
            switch (event.triggername) {
                case 'phaseJudgeBefore':
                    trigger.cancel();
                    await trigger.player.draw();
                    break;
                case 'phaseDrawBefore':
                    trigger.cancel();
                    const result = await trigger.player.chooseTarget('可选择一名其他角色交换手牌', function (card, player, target) {
                        return target != trigger.player
                    })
                        .set('ai', function (target) {
                            return get.attitude(trigger.player, target) * 2;
                        }).forResult();
                    if (result.targets) {
                        trigger.player.swapHandcards(result.targets[0]);
                    };
                    if (game.hasPlayer(current => current.countGainableCards(player, 'h') > 0)) {
                        const result1 = await trigger.player.chooseTarget('是否获得至多两名其他角色的各一张手牌？', [1, 2], function (card, player, target) {
                            return target != trigger.player && target.countGainableCards(player, 'h') > 0;
                        }).set('ai', function (target) {
                            var att = get.attitude(_status.event.player, target);
                            if (target.hasSkill('zshy_tuntian')) return att / 10;
                            return 1 - att;
                        }).forResult();
                        if (result1.targets) {
                            const targets = result1.targets.sortBySeat();
                            trigger.player.line(targets, 'green');
                            trigger.player.gainMultiple(targets);
                        }
                    } else {
                        trigger.player.draw(2);
                    }
                    break;
                case 'phaseUseBefore':
                    trigger.player.moveCard();
                    break;
                case 'phaseDiscardBefore':
                    trigger.cancel();
                    trigger.player.recover();
                    break;
                default:
                    break;

            };
        },
    },

    zshy_tuntian: {//屯田
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: ['discard', 'useCard', 'respond'],
        },
        forced: true,
        preHidden: true,
        filter(event, player) {
            if (event.name != 'discard') return _status.currentPhase != player;
            return true;
        },
        async content(event, trigger, player) {
            // 执行判定
            const judgeResult = await player.judge(async (card) => {
                if (get.suit(card) != 'heart') return 1;
                return 1;
            }).forResult();

            // 将判定牌加入扩展区并标记
            await player.addToExpansion(judgeResult.card, 'gain2').gaintag.add('zshy_tuntian');

            // 根据花色执行效果
            if (get.suit(judgeResult.card) == 'heart') {
                await player.recover();
            } else {
                await player.draw();
            }
        },
        getIndex(event, player) { return event.cards.length },
        marktext: '田',
        intro: {
            content: 'expansion',
            markcount: 'expansion',
        },
        onremove(player, skill) {
            var cards = player.getExpansions(skill);
            if (cards.length) player.loseToDiscardpile(cards);
        },
        ai: {
            effect: {
                target(card, player, target, current) {
                    if (!target.hasFriend() && !player.hasUnknown()) return;
                    if (_status.currentPhase == target || get.type(card) === 'delay') return;
                    if (card.name != 'shuiyanqijunx' && get.tag(card, 'loseCard') && target.countCards('he')) {
                        if (target.hasSkill('ziliang')) return 0.7;
                        return [0.5, Math.max(2, target.countCards('h'))];
                    }
                    if (target.isUnderControl(true, player)) {
                        if ((get.tag(card, 'respondSha') && target.countCards('h', 'sha')) || (get.tag(card, 'respondShan') && target.countCards('h', 'shan'))) {
                            if (target.hasSkill('ziliang')) return 0.7;
                            return [0.5, 1];
                        }
                    } else if (get.tag(card, 'respondSha') || get.tag(card, 'respondShan')) {
                        if (get.attitude(player, target) > 0 && card.name == 'juedou') return;
                        if (get.tag(card, 'damage') && target.hasSkillTag('maixie')) return;
                        if (target.countCards('h') == 0) return 2;
                        if (target.hasSkill('ziliang')) return 0.7;
                        return [0.5, Math.max(target.countCards('h') / 4, target.countCards('h', 'sha') + target.countCards('h', 'shan'))];
                    }
                },
            },
            threaten(player, target) {
                if (target.countCards('h') == 0) return 2;
                return 0.5;
            },
            nodiscard: true,
            nolose: true,
            notemp: true
        },
        group: 'zshy_tuntian_dist',
        subSkill: {
            dist: {//你的进攻距离+X（X为你武将牌上「田」数）。
                forced: false,
                mod: {
                    globalFrom(from, to, distance) {
                        let num = distance - from.getExpansions('zshy_tuntian').length;
                        return num;
                    },
                },
            },
        },
    },
    zshy_zaoxian: {//凿险
        audio: 'ext:诸神寰宇/audio/character:2',
        skillAnimation: true,
        animationColor: 'thunder',
        unique: true,
        juexingji: true,
        trigger: { player: 'zshy_tuntianAfter' },
        forced: true,
        filter(event, player) {
            return player.getExpansions('zshy_tuntian').length >= player.maxHp;
        },
        derivation: 'zshy_jixi',
        async content(event, trigger, player) {
            await player.awakenSkill('zshy_zaoxian');
            await player.chooseDrawRecover(2, true);
            await player.addSkills('zshy_jixi'), player.insertPhase();
        },
        ai: {
            combo: 'zshy_tuntian',
        },
    },
    zshy_jixi: {//急袭
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        filter(event, player) {
            return player.getExpansions('zshy_tuntian').length > 0 && event.filterCard({ name: 'shunshou' }, player, event);
        },
        chooseButton: {
            dialog(event, player) {
                return ui.create.dialog('急袭', player.getExpansions('zshy_tuntian'), 'hidden');
            },
            filter(button, player) {
                const card = button.link;
                if (!game.checkMod(card, player, 'unchanged', 'cardEnabled2', player)) return false;
                const evt = _status.event.getParent();
                return evt.filterCard(get.autoViewAs({ name: 'shunshou' }, [card]), player, evt);
            },
            backup(links, player) {
                const skill = _status.event.buttoned;
                return {
                    audio: 'zshy_jixi',
                    selectCard: -1,
                    position: 'x',
                    filterCard: skill == 'zshy_jixi' ? card => card == lib.skill.zshy_jixi_backup.card : card => card == lib.skill.gzzshy_jixi_backup.card,
                    viewAs: { name: 'shunshou' },
                    card: links[0],
                };
            },
            prompt(links, player) {
                return '选择 顺手牵羊（' + get.translation(links[0]) + '）的目标';
            },
        },
        mod: {
            targetInRange(card, player, target, now) {
                if (get.name(card) == 'shunshou') return true;
            },
        },
        ai: {
            order: 10,
            result: {
                player(player) {
                    return player.getExpansions('zshy_tuntian').length - 1;
                },
            },
            combo: 'zshy_tuntian',
        },
    },

    zshy_jiang: {//激昂
        audio: 'ext:诸神寰宇/audio/character:2',
        preHidden: true,
        trigger: {
            player: 'useCardToPlayered',
            target: 'useCardToTargeted',
        },
        filter(event, player) {
            if (!(get.name(event.card) == 'juedou' || (get.tag(event.card, 'damage') && get.color(event.card) == 'red'))) return false;
            return player == event.target || event.getParent().triggeredTargets3.length == 1;
        },
        locked: false,
        frequent: true,
        async content(event, trigger, player) {
            player.chooseDrawRecover(true);
        },
        mod: {
            aiOrder(player, card, num) {
                if (get.color(card) == 'red' && get.tag(card, 'damage')) return get.order({ name: 'sha' }) + 0.15;
            },
        },
        ai: {
            effect: {
                target_use(card, player, target) {
                    if (get.tag(card, 'damage') && get.color(card) == 'red') return [1, 0.6];
                },
                player_use(card, player, target) {
                    if (get.tag(card, 'damage') && get.color(card) == 'red') return [1, 1];
                },
            },
        },
    },
    zshy_hunzi: {//魂姿
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AAZZsunyiJMGX: 'zshy_hunzi_zshy_AAZZsunyiJMGX',
        },
        unique: true,
        juexingji: true,
        skillAnimation: true,
        animationColor: 'wood',
        derivation: ['zshy_yingzi', 'zshy_yinghun'],
        trigger: { player: ['dying', 'phaseZhunbeiBegin'] },
        filter(event, player) {
            return player.hp <= 2 && !player.storage.zshy_hunzi;
        },
        forced: true,
        async content(event, trigger, player) {
            await player.awakenSkill('zshy_hunzi');
            await player.recoverTo(1);
            await player.changeHujia(player.maxHp);
            player.addSkills(['zshy_yingzi', 'zshy_yinghun']);
        },
        ai: {
            threaten(player, target) {
                if (target.hp == 1) return 2;
                return 0.5;
            },
            maixie: true,
            effect: {
                target(card, player, target) {
                    if (!target.hasFriend()) return;
                    if (target.hp === 2 && get.tag(card, 'damage') == 1 && !target.isTurnedOver() && _status.currentPhase !== target && get.distance(_status.currentPhase, target, 'absolute') <= 3) return [0.5, 1];
                    if (target.hp === 1 && get.tag(card, 'recover') && !target.isTurnedOver() && _status.currentPhase !== target && get.distance(_status.currentPhase, target, 'absolute') <= 3) return [1, -3];
                },
            },
        },
        subSkill: {
            zshy_AAZZsunyiJMGX: { audio: 'ext:诸神寰宇/audio/character:2' },
        }
    },
    zshy_zhiba: {//制霸
        audio: 'ext:诸神寰宇/audio/character:2',
        unique: true,
        zhuSkill: true,
        enable: 'phaseUse',
        prompt: '请选择〖制霸〗的目标',
        filter(event, player) {
            if (player.hasZhuSkill('zshy_zhiba') && game.hasPlayer(function (current) {
                return current != player && current.group == 'wu' && player.canCompare(current);
            })) return true;
            return (player.group == 'wu' && game.hasPlayer(function (current) {
                return current != player && current.hasZhuSkill('zshy_zhiba', player) && !current.hasSkill('zshy_zhiba_3') && player.canCompare(current);
            }));
        },
        filterTarget(card, player, target) {
            if (player.hasZhuSkill('zshy_zhiba') && target.group == 'wu' && player.canCompare(target)) return true;
            return player.group == 'wu' && target.hasZhuSkill('zshy_zhiba', player) && player.canCompare(target);
        },
        prepare(cards, player, targets) {
            if (player.hasZhuSkill('zshy_zhiba')) player.logSkill('zshy_zhiba');
            if (targets[0].hasZhuSkill('zshy_zhiba', player)) targets[0].logSkill('zshy_zhiba');
        },
        direct: true,
        clearTime: true,
        contentBefore() {
            'step 0';
            var list = [];
            if (player.hasZhuSkill('zshy_zhiba') && targets[0].group == 'wu') list.push(player);
            if (player.group == 'wu' && targets[0].hasZhuSkill('zshy_zhiba')) list.push(targets[0]);
            if (list.length == 1) {
                event.target = list[0];
                event.goto(2);
            } else
                player.chooseTarget(true, '请选择获得所有拼点牌的角色', function (card, player, target) {
                    return _status.event.list.includes(target);
                }).set('list', list);
            'step 1';
            event.target = result.targets[0];
            'step 2';
            if (target == targets[0]) {
                target.chooseBool('是否接受来自' + get.translation(player) + '的拼点请求？')
                    .set('choice', get.attitude(target, player) > 0 ||
                        target.countCards('h', function (card) {
                            var val = get.value(card);
                            if (val < 0) return true;
                            if (val <= 5) {
                                return get.number(card) >= 12;
                            }
                            if (val <= 6) {
                                return get.number(card) >= 13;
                            }
                            return false;
                        }) > 0
                    ).set('ai', function () {
                        return _status.event.choice;
                    });
            } else event._result = { bool: true };
            'step 3';
            if (result.bool) event.getParent().zhiba_target = target;
            else {
                game.log(target, '拒绝了', player, '的拼点请求');
                target.chat('拒绝');
            }
        },
        content() {
            'step 0';
            event.source = event.getParent().zhiba_target;
            if (!event.source) {
                event.finish();
            }
            'step 1';
            player.chooseToCompare(target).set('small', target == source && get.attitude(player, target) > 0).clear = false;
            'step 2';
            if ((player == source && result.bool) || (target == source && !result.bool)) {
                event.cards = [result.player, result.target].filterInD('d');
                if (!event.cards.length) event.finish();
                else
                    source.chooseControl('ok', 'cancel2').set('dialog', ['是否获得拼点牌？', event.cards]).set('ai', function () {
                        if (get.value(event.cards, source, 'raw') <= 0) return false;
                        return true;
                    });
            } else event.finish();
            'step 3';
            if (result.control != 'cancel2') source.gain(event.cards, 'gain2', 'log'), source.recover();
            else ui.clear();
        },
        ai: {
            order: 1,
            result: {
                target(player, target) {
                    if (player.hasZhuSkill('zshy_zhiba') && !player.hasSkill('zshy_zhiba_3') && target.group == 'wu') {
                        if (
                            player.countCards('h', function (card) {
                                var val = get.value(card);
                                if (val < 0) return true;
                                if (val <= 5) {
                                    return get.number(card) >= 12;
                                }
                                if (val <= 6) {
                                    return get.number(card) >= 13;
                                }
                                return false;
                            }) > 0
                        )
                            return -1;
                        return 0;
                    } else {
                        if (player.countCards('h', 'du') && get.attitude(player, target) < 0) return -1;
                        if (player.countCards('h') <= player.hp) return 0;
                        var maxnum = 0;
                        var cards2 = target.getCards('h');
                        for (var i = 0; i < cards2.length; i++) {
                            if (get.number(cards2[i]) > maxnum) {
                                maxnum = get.number(cards2[i]);
                            }
                        }
                        if (maxnum > 10) maxnum = 10;
                        if (maxnum < 5 && cards2.length > 1) maxnum = 5;
                        var cards = player.getCards('h');
                        for (var i = 0; i < cards.length; i++) {
                            if (get.number(cards[i]) < maxnum) return 1;
                        }
                        return 0;
                    }
                },
            },
        },
    },
    zshy_yingzi_zshy_AAZZsunceSHZL: { audio: 'ext:诸神寰宇/audio/character:2' },
    zshy_yinghun_zshy_AAZZsunceSHZL: { audio: 'ext:诸神寰宇/audio/character:2' },

    zshy_tiaoxin: {//挑衅
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AAZZxiahoubaJMGX: 'zshy_tiaoxin_zshy_AAZZxiahoubaJMGX',
            zshy_AAZZjiangweiSP: 'zshy_tiaoxin_zshy_AAZZjiangweiSP',
        },
        enable: 'phaseUse',
        filterTarget(card, player, target) {
            return target != player && target.inRange(player) && target.countCards('he') > 0;
        },
        async content(event, trigger, player) {
            const target = event.targets[0];
            const result = await target.chooseToUse(function (card, player, event) {
                if (get.name(card) != 'sha') return false;
                return lib.filter.filterCard.apply(this, arguments);
            }, '挑衅：对' + get.translation(player) + '使用一张杀，或令其弃置你的牌').set('targetRequired', true)
                .set('complexSelect', true).set('filterTarget', function (card, player, target) {
                    if (target != _status.event.sourcex && !ui.selected.targets.includes(_status.event.sourcex)) return false;
                    return lib.filter.filterTarget.apply(this, arguments);
                }).set('sourcex', player).forResult();
            if (result.bool && player.getHistory('damage', function (evt) {
                return evt.getParent().type == 'card' && evt.getParent(4) == event;
            }).length > 0) target.draw();
            else {
                if (target.countDiscardableCards(player, 'he') > 0) {
                    player.discardPlayerCard(target, 'he', target.countCards('he'), true);
                }
                player.recover();
            };
        },
        ai: {
            order: 9,
            expose: 0.2,
            threaten: 1.1,
            result: {
                target(player, target) {
                    if (target.countCards('h') > 0 && player.countCards('h', 'shan') > 0) return -2;
                    return;
                },
            },
        },
        subSkill: {
            zshy_AAZZxiahoubaJMGX: { audio: 'ext:诸神寰宇/audio/character:2' },
            zshy_AAZZjiangweiSP: { audio: 'ext:诸神寰宇/audio/character:2' },
        }
    },
    zshy_zhiji: {//志继
        audio: 'ext:诸神寰宇/audio/character:2',
        skillAnimation: true,
        animationCzshy_or: 'fire',
        unique: true,
        juexingji: true,
        derivation: 'zshy_guanxing',
        trigger: {
            player: 'loseAfter',
            global: ['equipAfter', 'addJudgeAfter', 'gainAfter', 'loseAsyncAfter', 'addToExpansionAfter'],
        },
        forced: true,
        filter(event, player) {
            if (player.storage.zshy_zhiji) return false;
            return player.countCards('h') == 0;
        },
        async content(event, trigger, player) {
            player.awakenSkill(event.name);
            player.drawTo(player.maxHp);
            player.recover();
            player.addSkills('zshy_guanxing');
        },
    },

    zshy_fangquan: {//放权
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'phaseBegin',
        },
        direct: true,
        filter(event, player) {
            return player.countCards('hes');
        },
        content() {
            'step 0'
            var str = '放权：是否弃置一张牌并跳过出牌和弃牌阶段？';
            player.chooseToDiscard(get.prompt('zshy_fangquan'), 'hes', str).set('ai', function (card) {
                var player = _status.event.player;
                if (game.hasPlayer(function (current) {
                    return current != player && get.attitude(player, current) > 3;
                }) && !player.hasSkill('zshy_fangquan_Phase')) {
                    if (player.countCards('h') > 9) return 0;
                    return 15 - get.value(card);
                }
                return 0;
            }).set('logSkill', 'zshy_fangquan');
            'step 1'
            if (result.bool) {
                player.skip('phaseUse');
                player.skip('phaseDiscard');
                player.addTempSkill('zshy_fangquan_Phase');
            }
        },
        subSkill: {
            Phase: {
                sub: true,
                trigger: {
                    player: 'phaseEnd',
                },
                direct: true,
                charlotte: true,
                content() {
                    'step 0'
                    var str = '与一名其他角色各摸一张牌并令其获得1个额外的回合';
                    player.chooseTarget(get.prompt('zshy_fangquan'), str, function (card, player, target) {
                        return target != player;
                    }).set('ai', function (target) {
                        var player = _status.event.player;
                        var att = get.attitude(player, target);
                        if (att > 0) return target.countCards('h') + 1;
                        return 0;
                    });
                    'step 1'
                    if (result.bool) {
                        var target = result.targets[0];
                        player.logSkill('zshy_fangquan', target);
                        target.insertPhase();
                        game.asyncDraw([player, target]);
                    }
                },
                ai: {
                    expose: 0.2,
                },
            },
        },
    },
    zshy_xiangle: {//享乐
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            target: 'useCardToTargeted',
        },
        forced: true,
        firstDo: true,
        filter(event, player) {
            return get.name(event.card) == 'sha';
        },
        content() {
            'step 0'
            var eff = get.effect(player, trigger.card, trigger.player, trigger.player);
            trigger.player.chooseToDiscard('享乐：弃置一张【杀】，否则【杀】对' + get.translation(player) + '无效', function (card) {
                return get.name(card) == 'sha';
            }).set('ai', function (card) {
                if (_status.event.eff > 0) {
                    return 10 - get.value(card);
                }
                return 0;
            }).set('eff', eff);
            'step 1'
            if (result.bool == false) trigger.getParent().excluded.add(player);
        },
        ai: {
            effect: {
                target(card, player, target, current) {
                    if (card.name == 'sha' && get.attitude(player, target) < 0) {
                        if (_status.event.name == 'zshy_xiangle') return;
                        if (get.attitude(player, target) > 0 && current < 0) return 'zerotarget';
                        const bs = player.getCards('h', { name: 'sha' });
                        bs.remove(card);
                        if (card.cards) bs.removeArray(card.cards);
                        else bs.removeArray(ui.selected.cards);
                        if (!bs.length) return 'zerotarget';
                        if (player.hasSkill('jiu') || player.hasSkill('tianxianjiu')) return;
                        if (bs.length <= 2) {
                            for (let i = 0; i < bs.length; i++) {
                                if (get.value(bs[i]) < 7) {
                                    return [1, 0, 1, -0.5];
                                }
                            }
                            return [1, 0, 0.3, 0];
                        }
                        return [1, 0, 1, -0.5];
                    }
                },
            },
        },
    },
    zshy_ruoyu: {//若愚
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: ['damageAfter', 'loseHpAfter', 'loseMaxHpAfter'] },
        derivation: ['zshy_jijiang', 'zshy_sishu'],
        skillAnimation: true,
        animationColor: 'fire',
        unique: true,
        juexingji: true,
        zhuSkill: true,
        keepSkill: true,
        forced: true,
        filter(event, player) {
            if (!player.hasZhuSkill('zshy_ruoyu')) return false;
            return player.isMinHp();
        },
        content() {
            'step 0';
            player.awakenSkill('zshy_ruoyu');
            player.gainMaxHp();
            'step 1';
            player.recover(player.maxHp - player.hp);
            player.addSkills(['zshy_jijiang', 'zshy_sishu']);
        },
    },
    zshy_sishu: {//思蜀
        audio: 'ext:诸神寰宇/audio/character:2',
        mod: {
            judge(player, result) {
                if (_status.event.cardname == 'lebu') {
                    if (result.bool == false) result.bool = true;
                    else result.bool = false;
                };
            },
        },
    },

    zshy_zhijian: {//直谏
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'useCard',
        },
        forced: true,
        filter(event, player) {
            return get.type(event.card, null, false) == 'equip';
        },
        content() {
            player.draw();
        },
        group: 'zshy_zhijian_Equip',
        subSkill: {
            Equip: {
                sub: true,
                audio: 'zshy_zhijian',
                enable: 'phaseUse',
                lose: false,
                delay: false,
                discard: false,
                position: 'hes',
                filter(event, player) {
                    return player.countCards('hes', { type: 'equip' });
                },
                filterCard(card) {
                    return get.type(card) == 'equip';
                },
                filterTarget(card, player, target) {
                    return player != target;
                },
                check(card) {
                    var player = _status.currentPhase;
                    if (player.countCards('he', { subtype: get.subtype(card) }) > 1) {
                        return 15 - get.equipValue(card);
                    }
                    return 7 - get.value(card);
                },
                prompt: '出牌阶段，你可以将一张装备牌交给一名其他角色，然后其可以使用一张装备牌',
                content() {
                    'step 0'
                    player.give(cards, target);
                    'step 1'
                    if (target.countCards('hes', { type: 'equip' })) {
                        target.chooseToUse({ type: 'equip' }, '直谏：是否使用一张装备牌？');
                    }
                },
                ai: {
                    order() {
                        return [3, 5, 7].randomGet();
                    },
                    result: {
                        target(target) {
                            if (!target.countCards('e')) return 3;
                            return 1;
                        },
                    },
                },
            },
        },
    },
    zshy_guzheng: {//固政
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: ['loseAfter', 'loseAsyncAfter'],
        },
        direct: true,
        filter(event, player) {
            if (event.type != 'discard') return false;
            var phaseName;
            for (var name of lib.phaseName) {
                var evt = event.getParent(name);
                if (!evt || evt.name != name) continue;
                phaseName = name;
                break;
            }
            if (!phaseName) return false;
            return game.hasPlayer(current => {
                if (current == player) return false;
                var evt = event.getl(current);
                if (!evt || !evt.cards2 || evt.cards2.filterInD('d').length < 2) return false;
                return true;
            });
        },
        checkx(event, player, cards) {
            if (cards.length > 2 || get.attitude(player, event.player) > 0) return true;
            for (var i = 0; i < cards.length; i++) {
                if (get.value(cards[i], event.player, 'raw') < 0) return true;
            }
            return false;
        },
        content() {
            'step 0'
            var targets = [], cardsList = [];
            var players = game.filterPlayer().sortBySeat(_status.currentPhase);
            for (var current of players) {
                if (current == player) continue;
                var cards = [];
                var evt = trigger.getl(current);
                if (!evt || !evt.cards2) continue;
                var cardsx = evt.cards2.filterInD('d');
                cards.addArray(cardsx);
                if (cards.length) {
                    targets.push(current);
                    cardsList.push(cards);
                }
            }
            event.targets = targets;
            event.cardsList = cardsList;
            'step 1'
            var target = targets.shift();
            var cards = event.cardsList.shift();
            event.target = target;
            event.cards = cards;
            player.chooseButton(2, [
                get.prompt('zshy_guzheng', target),
                '<span class="text center">被选择的牌将成为对方收回的牌</span>',
                cards, [['获得剩余的牌', '放弃剩余的牌'], 'tdnodes'],
            ]).set('filterButton', function (button) {
                var type = typeof button.link;
                if (ui.selected.buttons.length && type == typeof ui.selected.buttons[0].link) return false;
                return true;
            }).set('check', lib.skill.zshy_guzheng.checkx(trigger, player, cards)).set('ai', function (button) {
                if (typeof button.link == 'string') return button.link == '获得剩余的牌' ? 1 : 0;
                if (_status.event.check) {
                    return 20 - get.value(button.link, _status.event.getTrigger().player);
                }
                return 0;
            });
            'step 2'
            if (result.bool) {
                player.logSkill('zshy_guzheng', target);
                if (typeof result.links[0] != 'string') result.links.reverse();
                var card = result.links[1];
                target.gain(card, 'gain2');
                event.cards.remove(card);
                if (result.links[0] != '获得剩余的牌') event.finish();
            }
            else if (event.targets.length) event.goto(1);
            else event.finish();
            'step 3'
            var cards = cards.filterInD('d');
            if (cards.length > 0) player.gain(cards, 'gain2');
        },
        ai: {
            expose: 0.2,
            threaten: 1.5,
        },
    },

    zshy_huashen: {//化身
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: ['roundStart', 'phaseBefore'],
            player: ['changeHp', 'zshy_huashen'],
        },
        direct: true,
        locked: true,
        unique: true,
        filter(event, player, name) {
            if (name == 'zshy_huashen') return true;
            if (name == 'roundStart') return game.roundNumber == 1;
            return player.storage.zshy_huashen && player.storage.zshy_huashen.character.length > 0;
        },
        content() {
            'step 0'
            var name = event.triggername;
            if (name == 'roundStart') {
                player.logSkill('zshy_huashen');
                lib.skill.zshy_huashen.addHuashens(player, 6);
                event.logged = true;
            }
            _status.noclearcountdown = true;
            event.videoId = lib.status.videoId++;
            var cards = player.storage.zshy_huashen.character.slice(0);
            var skills = [], sto = player.storage.zshy_huashen;
            for (var i in player.storage.zshy_huashen.map) {
                skills.addArray(player.storage.zshy_huashen.map[i]);
            }
            var cond = 'out';
            if (name == 'phaseBefore' || name == 'changeHp') cond = 'in';
            skills.randomSort(), skills.sort(function (a, b) {
                return get.skillRank(b, cond) - get.skillRank(a, cond);
            });
            event.aiChoice = skills[0];
            var choice = '更换化身';
            if (event.aiChoice == player.storage.zshy_huashen.current2 || get.skillRank(event.aiChoice, cond) < 1) choice = '重铸化身';
            event.dialog = ui.create.dialog(get.prompt('zshy_huashen'), [cards, (item, type, position, noclick, node) =>
                lib.skill.zshy_huashen.$createButton(item, type, position, noclick, node)]);
            event.dialog.videoId = event.videoId;
            if (!event.isMine()) event.dialog.style.display = 'none';
            if (event.logged) event._result = { control: '更换化身' };
            else {
                player.chooseControl('重铸化身', '更换化身', 'cancel2').set('ai', function () {
                    return _status.event.choice;
                }).set('choice', choice);
            }
            'step 1'
            event.control = result.control;
            if (event.control == 'cancel2') {
                delete _status.noclearcountdown;
                if (!_status.noclearcountdown) {
                    game.stopCountChoose();
                }
                event.dialog.close();
                event.finish(); return;
            }
            if (!event.logged) {
                player.logSkill('zshy_huashen');
                event.logged = true;
            }
            var next = player.chooseButton(true).set('dialog', event.videoId);
            if (event.control == '重铸化身') {
                next.set('selectButton', [1, Infinity]);
                next.set('filterButton', function (button) {
                    return button.link != _status.event.current;
                });
                next.set('current', player.storage.zshy_huashen.current);
            }
            else {
                next.set('ai', function (button) {
                    return player.storage.zshy_huashen.map[button.link].includes(_status.event.choice) ? 2.5 : 1 + Math.random();
                });
                next.set('choice', event.aiChoice);
            }
            var prompt = '化身：请选择要' + (event.control == '重铸化身' ? '重铸的「化身」' : '更换的「化身」');
            var func = function (id, prompt) {
                var dialog = get.idDialog(id);
                if (dialog) dialog.content.childNodes[0].innerHTML = prompt;
            }
            if (event.isMine()) func(event.videoId, prompt);
            'step 2'
            if (result.bool && event.control != '重铸化身') {
                event.card = result.links[0];
                var func = function (card, id) {
                    var dialog = get.idDialog(id);
                    if (dialog) {
                        for (var i = 0; i < dialog.buttons.length; i++) {
                            if (dialog.buttons[i].link == card) {
                                dialog.buttons[i].classList.add('selectedx');
                            }
                            else {
                                dialog.buttons[i].classList.add('unselectable');
                            }
                        }
                    }
                }
                if (event.isMine()) func(event.card, event.videoId);
                var list = player.storage.zshy_huashen.map[event.card].slice(0);
                var next;
                event.list = list;
                if (!player.storage.zshy_xinsheng) {
                    next = player.chooseControl(list, '返回');
                }
                else next = player.chooseControl(list, '全选', '返回');
                next.set('choice', event.aiChoice).set('ai', function () {
                    if (!player.storage.zshy_xinsheng) return _status.event.choice;
                    else return '全选';
                });
            }
            else {
                lib.skill.zshy_huashen.removeHuashen(player, result.links.slice(0));
                lib.skill.zshy_huashen.addHuashens(player, result.links.length);
            }
            'step 3'
            if (result.control == '返回') {
                var func = function (id) {
                    var dialog = get.idDialog(id);
                    if (dialog) {
                        for (var i = 0; i < dialog.buttons.length; i++) {
                            dialog.buttons[i].classList.remove('selectedx');
                            dialog.buttons[i].classList.remove('unselectable');
                        }
                    }
                }
                if (event.isMine()) func(event.videoId);
                event._result = { control: '更换化身' };
                event.goto(1);
                return;
            }
            event.dialog.close();
            delete _status.noclearcountdown;
            if (!_status.noclearcountdown) {
                game.stopCountChoose();
            }
            if (event.control == '重铸化身') return;
            if (player.storage.zshy_huashen.current != event.card) {
                const old = player.storage.zshy_huashen.current;
                player.storage.zshy_huashen.current = event.card;
                game.broadcastAll(function (player, character, old) {
                    player.tempname.remove(old);
                    player.tempname.add(character);
                    player.sex = get.character(event.card)[0];
                }, player, event.card, old);
                game.log(player, '将性别变为了', '#y' + get.translation(get.character(event.card)[0]) + '性');
                player.changeGroup(get.character(event.card)[1]);
            }
            var link;
            if (result.control == '全选') {
                link = event.list;
            }
            else link = result.control;
            player.storage.zshy_huashen.current2 = link;
            if (!player.additionalSkills.zshy_huashen || !player.additionalSkills.zshy_huashen.includes(link)) {
                player.addAdditionalSkills('zshy_huashen', link);
                player.flashAvatar('zshy_huashen', event.card);
                player.syncStorage('zshy_huashen');
                player.updateMarks('zshy_huashen');
            }
        },
        banned: [
            'lisu',
            'sp_xiahoudun',
            'xushao',
            'jsrg_xushao',
            'zhoutai',
            'old_zhoutai',
            'shixie',
            'xin_zhoutai',
            'dc_shixie',
            'old_shixie',
            //诸神寰宇-远古遗神
            'zshy_AAAAanjing',//安璟
            'zshy_AAAAantianhen',//安天痕
            'zshy_AAAAjiusheng',//玖笙
            'zshy_AAAAmiehun',//灭魂
            'zshy_AAAAzhongmo',//盅墨
            'zshy_AAAAzuilian',//罪恋
            //诸神寰宇-江山多殇
            'zshy_AAABanri',//黯日
            'zshy_AAABcanglan',//苍澜
            'zshy_AAABjinniuzuo',//金牛座
            'zshy_ABBaisha',//艾莎
            'zshy_ABBlilimu',//莉莉姆
            'zshy_ABBzhan',//斩
            //诸神寰宇-异界来客
            'zshy_AAACchuyinweilai',//初音未来
            'zshy_AAACguyuefangyuan',//古月方源
            'zshy_AAAChongting',//洪亭
            'zshy_AAAClongyi',//龙裔
            'zshy_AAACsuxiao',//苏晓
            'zshy_AAACyangjian',//杨间
            'zshy_AAACyixiangren',//异乡人
            //诸神寰宇-奇思妙想
            'zshy_AQAcangqiqingzi',
            'zshy_AQAtianxuanzhizi',
            'zshy_AQAwjck',
            //光阴长河
            'zshy_AAYAshenzhaoyun',
            //神话再临-其疾如风
            'zshy_AAZZshenguanyuSHZL',
            'zshy_AAZZshenlvmengSHZL',
            //神话再临-侵略如火
            'zshy_AAZZshenzhouyuSHZL',
            'zshy_AAZZshenzhugeliangSHZL',
            //神话再临-其徐如林
            'zshy_AAZZshenlvbuSHZL',
            'zshy_AAZZshencaocaoSHZL',
            //神话再临-不动如山
            'zshy_AAZZshensimayiSHZL',
            'zshy_AAZZshenzhaoyunSHZL',
            //神话再临-难知如阴
            'zshy_AAZZshenliubeiSHZL',
            'zshy_AAZZshenluxunSHZL',
            //神话再临-动如雷震
            'zshy_AAZZshenzhangliaoSHZL',
            'zshy_AAZZshenganningSHZL',
            //限定-神武
            'zshy_AAZZshenmachaoJMGX',
            'zshy_AAZZshenzhangfeiJMGX',
        ],
        bannedType: '隐匿技',
        addHuashen(player) {
            if (!player.storage.zshy_huashen) return;
            var list = [];
            for (var i in lib.character) list.push(i);
            _status.characterlist = list;
            _status.characterlist.randomSort();
            for (let i = 0; i < _status.characterlist.length; i++) {
                let name = _status.characterlist[i];
                if (name.indexOf('zuoci') !== -1 || name.indexOf('re_zuoci') !== -1 ||
                    lib.skill.zshy_huashen.banned.includes(name) ||
                    player.storage.zshy_huashen.character.includes(name)) continue;
                let skills = (get.character(name)[3] || []).filter(skill => {
                    const categories = get.skillCategoriesOf(skill);
                    return !categories.some(type => lib.skill.zshy_huashen.bannedType.includes(type));
                })
                if (skills.length) {
                    player.storage.zshy_huashen.character.push(name);
                    player.storage.zshy_huashen.map[name] = skills;
                    _status.characterlist.remove(name);
                    return name;
                }
            }
        },
        addHuashens(player, num) {
            var list = [];
            for (var i = 0; i < num; i++) {
                var name = lib.skill.zshy_huashen.addHuashen(player);
                if (name) list.push(name);
            }
            if (list.length) {
                player.syncStorage('zshy_huashen');
                player.updateMarks('zshy_huashen');
                game.log(player, '获得了', list.length + '张', '#g化身');
                lib.skill.zshy_huashen.drawCharacter(player, list);
            }
        },
        removeHuashen(player, links) {
            player.storage.zshy_huashen.character.removeArray(links);
            _status.characterlist.addArray(links);
            game.log(player, '移去了', links.length + '张', '#g化身')
        },
        drawCharacter(player, list) {
            game.broadcastAll(function (player, list) {
                if (player.isUnderControl(true)) {
                    var cards = [];
                    for (var i = 0; i < list.length; i++) {
                        var cardname = 'zshy_huashen_card_' + list[i];
                        lib.card[cardname] = {
                            fullimage: true,
                            image: 'character:' + list[i]
                        }
                        lib.translate[cardname] = get.rawName2(list[i]);
                        cards.push(game.createCard(cardname, '', ''));
                    }
                    player.$draw(cards, 'nobroadcast');
                }
            }, player, list);
        },
        '$createButton'(item, type, position, noclick, node) {
            node = ui.create.buttonPresets.character(item, 'character', position, noclick);
            const info = get.character(item);
            const skills = info[3].filter(function (skill) {
                const categories = get.skillCategoriesOf(skill);
                return !categories.some(type => lib.skill.zshy_huashen.bannedType.includes(type));
            });
            if (skills.length) {
                const skillstr = skills.map(i => `[${get.translation(i)}]`).join('<br>');
                const skillnode = ui.create.caption(
                    `<div class='text' data-nature=${get.groupnature(info[1], 'raw')
                    }m style='font-family: ${(lib.config.name_font || 'xinwei')
                    },xinwei'>${skillstr}</div>`, node);
                skillnode.style.left = '2px';
                skillnode.style.bottom = '2px';
            }
            node._customintro = function (uiintro, evt) {
                const character = node.link, characterInfo = get.character(node.link);
                let capt = get.translation(character);
                if (characterInfo) {
                    capt += `&nbsp;&nbsp;${get.translation(characterInfo[0])}`;
                    let charactergroup;
                    const charactergroups = get.is.double(character, true);
                    if (charactergroups) charactergroup = charactergroups.map(i => get.translation(i)).join('/');
                    else charactergroup = get.translation(characterInfo[1]);
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
                            uiintro.add('<div><div class="skilln">' + get.translation(skills[i]) + '</div><div>' + get.skillInfoTranslation(skills[i]) + '</div></div>');
                        }
                        else {
                            uiintro.add('<div><div class="skill">【' + translation + '】</div><div>' + get.skillInfoTranslation(skills[i]) + '</div></div>');
                        }
                        if (lib.translate[skills[i] + '_append']) {
                            uiintro._place_text = uiintro.add('<div class="text">' + lib.translate[skills[i] + '_append'] + '</div>')
                        }
                    }
                }
            }
            return node;
        },
        mark: true,
        intro: {
            onunmark(storage, player) {
                _status.characterlist.addArray(storage.character);
                storage.character = [];
            },
            mark(dialog, storage, player) {
                if (storage && storage.current) {
                    dialog.addSmall([[storage.current], (item, type, position, noclick, node) =>
                        lib.skill.zshy_huashen.$createButton(item, type, position, noclick, node)]);
                }
                if (storage && storage.character.length) {
                    if (player.isUnderControl(true)) {
                        dialog.addSmall([storage.character, (item, type, position, noclick, node) =>
                            lib.skill.zshy_huashen.$createButton(item, type, position, noclick, node)]);
                    }
                    else {
                        dialog.addText('共有' + storage.character.length + '张「化身」');
                    }
                }
                else {
                    return '没有化身';
                }
            },
            content(storage, player) {
                return '共有' + storage.character.length + '张「化身」';
            },
            markcount(storage, player) {
                if (storage && storage.character) return storage.character.length;
                return 0;
            },
        },
        init(player, skill) {
            if (!player.storage[skill]) {
                player.storage[skill] = { character: [], map: {} };
            }
            player.when('dieBegin').then(() => {
                const name = player.name ? player.name : player.name1;
                if (name) {
                    const sex = get.character(name).sex;
                    const group = get.character(name).group;
                    if (player.sex != sex) {
                        game.broadcastAll((player, sex) => {
                            player.sex = sex;
                        }, player, sex);
                        game.log(player, '将性别变为了', '#y' + get.translation(sex) + '性');
                    }
                    if (player.group != group) player.changeGroup(group);
                }
            });
        },
    },
    zshy_xinsheng: {//新生
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'chooseToUse',
        unique: true,
        limited: true,
        charlotte: true,
        skillAnimation: true,
        animationColor: 'wood',
        filter(event, player) {
            if (player.maxHp <= 1 || player.isHealthy()) return false;
            if (player.storage.zshy_xinsheng) return false;
            if (event.type == 'dying') {
                if (player != event.dying) return false;
                return true;
            }
            else if (event.parent.name == 'phaseUse') {
                return true;
            }
            return false;
        },
        content() {
            'step 0'
            player.awakenSkill('zshy_xinsheng');
            player.storage.zshy_xinsheng = true;
            player.gainMaxHp(1);
            'step 1'
            player.recover(player.maxHp - player.hp);
            player.draw(3);
            lib.skill.zshy_huashen.addHuashens(player, 6);
            'step 2'
            var str = '令一名其他角色获得未升级的〖化身〗和3张「化身」';
            player.chooseTarget(get.prompt('zshy_xinsheng'), str, function (card, player, target) {
                return target != player;
            }).set('ai', function (target) {
                var player = _status.event.player;
                return get.attitude(player, target) > 3;
            });
            'step 3'
            if (result.bool) {
                var target = result.targets[0];
                player.line(target);
                target.addSkill('zshy_huashen');
                lib.skill.zshy_huashen.addHuashens(target, 3);
            }
        },
        ai: {
            order: 0.5,
            save: true,
            skillTagFilter(player, tag, target) {
                if (player != target || player.storage.zshy_xinsheng) return false;
            },
            result: {
                player(player) {
                    if (player.hp <= 0) return 10;
                    if (player.hp <= 2) {
                        if (player.countCards('h') <= 3) return 5;
                    }
                    return 0;
                },
            },
            threaten(player, target) {
                if (!target.storage.zshy_xinsheng) return 0.5;
            },
        },
        mark: true,
        intro: {
            content: 'limited',
        },
        init(player, skill) {
            player.storage[skill] = false;
        },
    },

    zshy_beige: {//悲歌
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: 'damageAfter' },
        logTarget: 'player',
        filter(event, player) {
            return event.player.isIn() && player.countCards('he') > 0;
        },
        check(event, player) {
            let att = get.attitude(player, event.player);
            if (att > 0 || event.player.isHealthy()) return true;
            if (!event.source) return true;
            att = get.attitude(player, event.source);
            return att <= 0 || event.source.isTurnedOver();
        },
        prompt2: '令其进行判定，然后你可根据判定结果，弃置一张牌并令其执行对应效果。',
        content() {
            'step 0';
            event.target = trigger.player;
            event.source = trigger.source;
            trigger.player.judge();
            'step 1';
            event.judgeResult = get.copy(result);
            var str = '是否弃置一张牌',
                strt = get.translation(target),
                strs = get.translation(source),
                goon = 0;
            switch (result.suit) {
                case 'heart':
                    if (target.isIn() && target.isDamaged()) {
                        str += '，令' + strt + '回复1点体力';
                        goon = get.recoverEffect(target, player, player);
                    }
                    break;
                case 'diamond':
                    if (target.isIn()) {
                        str += '，令' + strt + '摸两张牌';
                        goon = 2 * get.effect(target, { name: 'draw' }, player, player);
                    }
                    break;
                case 'spade':
                    if (source && source.isIn()) {
                        str += '，令' + strs + '翻' + (source.isTurnedOver() ? '回正' : '') + '面';
                        goon = get.attitude(player, source) * (source.isTurnedOver() ? 2 : -2);
                    }
                    break;
                case 'club':
                    if (source && source.isIn()) {
                        str += '，令' + strs + '弃置两张牌';
                        var cards = source
                            .getCards('he')
                            .sort(function (a, b) {
                                return get.value(a, source) - get.value(b, source);
                            })
                            .slice(0, 2);
                        for (var i of cards) goon += get.value(i, source);
                        goon *= -get.sgn(get.attitude(player, source));
                    }
                    break;
                default:
                    break;
            }
            str += '？';
            var str2 = '若弃置点数为' + get.strNumber(result.number) + '的牌则收回自己弃置的牌';
            if (get.position(result.card, true) == 'd') {
                str2 += '；若弃置花色为' + get.translation(result.suit) + '的牌则获得' + get.translation(result.card);
            }
            player.chooseToDiscard('he', str, str2).set('goon', goon).set('ai', function (card) {
                var goon = _status.event.goon;
                var player = _status.event.player;
                var result = _status.event.getParent().judgeResult;
                var eff = Math.min(7, goon);
                if (eff <= 0) return 0;
                if (get.suit(card, player) == result.suit) eff += get.value(result.card, player);
                if (get.number(card, player) == result.number) return eff;
                return eff - get.value(card);
            });
            'step 2';
            if (result.bool) {
                event.card = result.cards[0];
                switch (event.judgeResult.suit) {
                    case 'heart':
                        if (target.isIn() && target.isDamaged()) target.recover(trigger.num);
                        break;
                    case 'diamond':
                        if (target.isIn()) target.draw(2);
                        break;
                    case 'spade':
                        if (source && source.isIn()) source.turnOver();
                        player.addExpose(0.1);
                        break;
                    case 'club':
                        if (source && source.isIn() && source.countCards('he') > 0) source.chooseToDiscard(2, 'he', true);
                        player.addExpose(0.1);
                        break;
                }
            } else event.finish();
            'step 3';
            var gains = [];
            if (get.position(event.judgeResult.card, true) == 'd' && get.suit(card, player) == event.judgeResult.suit) gains.push(event.judgeResult.card);
            if (get.position(card, true) == 'd' && get.number(card, player) == event.judgeResult.number) gains.push(card);
            if (gains.length) player.gain(gains, 'gain2');
        },
        ai: {
            expose: 0.8,
        },
    },
    zshy_duanchang: {//断肠
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'die' },
        forced: true,
        forceDie: true,
        skillAnimation: true,
        animationColor: 'gray',
        filter(event) {
            return event.source && event.source.isIn();
        },
        async content(event, trigger, player) {
            trigger.source.clearSkills();
        },
        logTarget: 'source',
        ai: {
            maixie_defend: true,
            threaten(player, target) {
                if (target.hp == 1) return 0.2;
                return 1.5;
            },
            effect: {
                target(card, player, target, current) {
                    if (!target.hasFriend()) return;
                    if (target.hp <= 1 && get.tag(card, 'damage')) {
                        if (player.hasSkillTag('jueqing', false, target)) return 3;
                        return [1, 0, 0, -3 * get.threaten(player)];
                    }
                },
            },
        },
    },

    zshy_renjie: {//忍戒
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: ['chooseToUseAfter', 'chooseToRespondAfter'],
            global: 'useCardAfter',
        },
        forced: true,
        filter(event, player) {
            if (event.name == 'useCard') {
                if (event.player == player || get.type(event.card) != 'trick') return false;
                var history = game.getGlobalHistory('everything', evt => evt.player == player && ['useCard', 'respond'].includes(evt.name));
                return !history.some(evt => Array.isArray(evt.respondTo) && evt.respondTo[1] == event.card && evt.card.name == 'wuxie');
            }
            var evt = event.getParent(2);
            if (!evt || evt.name != 'useCard' || evt.player == player) return false;
            return event.respondTo && !event.result.bool;
        },
        content() {
            player.addMark('zshy_renjie', 1);
        },
        marktext: '忍',
        intro: {
            name2:  '忍',
            content: 'mark',
        },
        global: 'zshy_renjie_global',
        group: ['zshy_renjie_damage', 'zshy_renjie_gain'],
        subSkill: {
            damage: {
                sub: true,
                audio: 'zshy_renjie',
                trigger: {
                    player: ['damageAfter'],
                },
                direct: true,
                content() {
                    player.addMark('zshy_renjie', trigger.num);
                    player.logSkill('zshy_renjie');
                },
                ai: {
                    effect: {
                        player(card, player, target) {
                            if (get.tag(card, 'damage') && get.attitude(player, target) >= 0) return [0, 0, 0, 1];
                        },
                    },
                },
            },
            global: {
                sub: true,
                hiddenCard: () => true,
                ai: {
                    respondSha: true,
                    respondShan: true,
                },
            },
            gain: {
                trigger: {
                    player: ['zshy_renjieAfter', 'zshy_renjie_damageAfter'],
                },
                forced: true,
                filter(event, player) {
                    return player.countMark('zshy_renjie') >= player.maxHp;
                },
                content() {
                    'step 0'
                    event.num = player.maxHp;
                    'step 1'
                    if (player.countMark('zshy_renjie') >= event.num) {
                        player.removeMark('zshy_renjie', event.num);
                        player.addMark('zshy_lianpo', 1);
                    }
                    'step 2'
                    if (player.countMark('zshy_renjie') >= event.num) event.goto(1);
                }
            },
        },
    },
    zshy_lianpo: {//连破
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'dieAfter',
        },
        forced: true,
        content() {
            player.addMark('zshy_lianpo', 1);
        },
        marktext: '破',
        intro: {
            name2:  '破',
            content: 'mark',
        },
        group: ['zshy_lianpo_extra'],
        subSkill: {
            extra: {
                sub: true,
                audio: 'zshy_lianpo',
                trigger: {
                    global: 'phaseJieshuAfter',
                },
                check(event, player) {
                    return player.isTurnedOver() || player.hp < 2 || player.countMark('zshy_renjie') > 3 || Math.random() < 0.5;
                },
                filter(event, player) {
                    return player.hasMark('zshy_lianpo');
                },
                prompt2:  '弃置1枚「破」、回复1点体力并摸一张牌，然后复原武将牌并执行1个额外回合',
                content() {
                    'step 0'
                    player.removeMark('zshy_lianpo', 1);
                    player.recover(), player.draw();
                    player.link(false), player.turnOver(false);
                    'step 1'
                    player.insertPhase();
                },
            },
        },
    },
    zshy_baiyin: {//拜印
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: ['zshy_renjie_gainAfter', 'zshy_lianpoAfter'],
        },
        forced: true,
        juexingji: true,
        skillAnimation: 'epic',
        animationColor: 'thunder',
        derivation: ['zshy_guicai', 'zshy_fangzhu', 'zshy_jizhi', 'zshy_zhiheng', 'zshy_wansha'],
        content() {
            'step 0'
            player.awakenSkill('zshy_baiyin');
            'step 1'
            player.chooseDrawRecover(2, true);
            'step 2'
            for (var i of lib.skill.zshy_baiyin.derivation) player.addSkillLog(i);
        },
    },

    zshy_longhun: {//龙魂
        audio: 'ext:诸神寰宇/audio/character:4',
        enable: ['chooseToUse', 'chooseToRespond'],
        prompt: '将至多两张♦牌当火杀，♥牌当桃，♣牌当闪，♠牌当无懈可击使用或打出',
        hiddenCard(player, name) {
            if (name == 'wuxie' && _status.connectMode && player.countCards('hs') > 0) return true;
            if (name == 'wuxie') return player.countCards('hes', { suit: 'spade' }) > 0;
            if (name == 'tao') return player.countCards('hes', { suit: 'heart' }) > 0;
        },
        viewAs(cards, player) {
            if (cards.length) {
                var name = false;
                var nature = null;
                switch (get.suit(cards[0], player)) {
                    case 'club': name = 'shan'; break;
                    case 'diamond': name = 'sha'; nature = 'fire'; break;
                    case 'spade': name = 'wuxie'; break;
                    case 'heart': name = 'tao'; break;
                }
                if (name) return { name: name, nature: nature };
            }
            return null;
        },
        check(card) {
            if (ui.selected.cards.length) return 7 - get.value(card);
            var player = _status.event.player;
            if (_status.event.type == 'phase') {
                var max = 0;
                var name2;
                var list = ['sha', 'tao'];
                var map = { sha: 'diamond', tao: 'heart' };
                for (var i = 0; i < list.length; i++) {
                    var name = list[i];
                    if (player.countCards('hes', function (card) {
                        return (name != 'sha' || get.value(card) < 7) && get.suit(card, player) == map[name];
                    }) > 0 && player.getUseValue({ name: name, nature: name == 'sha' ? 'fire' : null }) > 0) {
                        var temp = get.order({ name: name, nature: name == 'sha' ? 'fire' : null });
                        if (temp > max) {
                            max = temp;
                            name2 = map[name];
                        }
                    }
                }
                if (name2 == get.suit(card, player)) return (name2 == 'diamond' ? (7 - get.value(card)) : 20 - get.value(card));
                return 0;
            }
            return 1;
        },
        position: 'hes',
        forced: true,
        charlotte: true,
        selectCard: [1, Infinity],
        complexCard: true,
        filterCard(card, player, event) {
            if (ui.selected.cards.length) return get.suit(card, player) == get.suit(ui.selected.cards[0], player);
            event = event || _status.event;
            var filter = event._backup.filterCard;
            var name = get.suit(card, player);
            if (name == 'club' && filter({ name: 'shan', cards: [card] }, player, event)) return true;
            if (name == 'diamond' && filter({ name: 'sha', cards: [card], nature: 'fire' }, player, event)) return true;
            if (name == 'spade' && filter({ name: 'wuxie', cards: [card] }, player, event)) return true;
            if (name == 'heart' && filter({ name: 'tao', cards: [card] }, player, event)) return true;
            return false;
        },
        filter(event, player) {
            var filter = event.filterCard;
            if (filter({ name: 'sha', nature: 'fire' }, player, event) && player.countCards('hes', { suit: 'diamond' })) return true;
            if (filter({ name: 'shan' }, player, event) && player.countCards('hes', { suit: 'club' })) return true;
            if (filter({ name: 'tao' }, player, event) && player.countCards('hes', { suit: 'heart' })) return true;
            if (filter({ name: 'wuxie' }, player, event) && player.countCards('hes', { suit: 'spade' })) return true;
            return false;
        },
        ai: {
            respondSha: true,
            respondShan: true,
            skillTagFilter(player, tag) {
                var name;
                switch (tag) {
                    case 'respondSha': name = 'diamond'; break;
                    case 'respondShan': name = 'club'; break;
                    case 'save': name = 'heart'; break;
                }
                if (!player.countCards('hes', { suit: name })) return false;
            },
            order(item, player) {
                if (player && _status.event.type == 'phase') {
                    var max = 0;
                    var list = ['sha', 'tao'];
                    var map = { sha: 'diamond', tao: 'heart' }
                    for (var i = 0; i < list.length; i++) {
                        var name = list[i];
                        if (player.countCards('hes', function (card) {
                            return (name != 'sha' || get.value(card) < 5) && get.suit(card, player) == map[name];
                        }) > 0 && player.getUseValue({ name: name, nature: name == 'sha' ? 'fire' : null }) > 0) {
                            var temp = get.order({ name: name, nature: name == 'sha' ? 'fire' : null });
                            if (temp > max) max = temp;
                        }
                    }
                    max /= 1.1;
                    return max;
                }
                return 2;
            },
        },
        group: 'zshy_longhun_Buff',
        subSkill: {
            Buff: {
                trigger: {
                    player: ['useCard', 'respond'],
                },
                charlotte: true,
                forced: true,
                popup: false,
                firstDo: true,
                filter(event) {
                    return event.skill == 'zshy_longhun' && event.cards && event.cards.length > 1;
                },
                content() {
                    'step 0'
                    var card = trigger.card;
                    trigger.baseDamage += trigger.cards.length;
                    if (trigger.name != 'respond') trigger.directHit.addArray(game.players);
                    if (trigger.addCount !== false) {
                        trigger.addCount = false;
                        player.getStat('card')[card.name]--;
                    }
                    game.log(player, '令', card, '不可响应、不计次限且伤害基数+X');
                    'step 1'
                    player.chooseTarget(get.prompt('zshy_longhun'), '获得一名角色区域内' + trigger.cards.length + '张牌', function (card, player, target) {
                        return target.countGainableCards(player, 'hej');
                    }).set('ai', function (target) {
                        return get.effect(target, { name: 'shunshou_copy2' }, player, player) > 0;
                    });
                    'step 2'
                    if (result.bool) {
                        player.line(result.targets);
                        player.gainPlayerCard(result.targets[0], 'hej', trigger.cards.length, true);
                    }
                },
            },
        },
    },
    zshy_juejing: {//绝境
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: ['loseMaxHpBefore', 'damageBefore', 'dying', 'dyingAfter'],
            global: 'damageAfter',
        },
        forced: true,
        charlotte: true,
        filter(event, player, name) {
            if (name != 'damageAfter') return true;
            return event.player != player;
        },
        content() {
            if (event.triggername == 'loseMaxHpBefore') trigger.cancel();
            else {
                if (event.triggername == 'damageAfter') player.draw(player.getDamagedHp() + 1);
                else player.draw(player.getDamagedHp() + 1);
            }
        },
        mod: {
            maxHandcard(player, num) {
                return num + player.maxHp;
            },
        },
    },

};
const 难知如阴 = {
    //墟王基
    zshy_qizhi: {//奇制
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: ['useCard', 'respond'],
        },
        direct: true,
        async content(event, trigger, player) {
            event.color = get.color(trigger.card);
            var str = '弃置一名角色区域内一张牌，若该角色不为你且弃置的牌颜色为' + get.translation(event.color);
            str += '，则你对其造成1点伤害并回复1点体力，否则该角色摸一张牌';
            const result = await player.chooseTarget(get.prompt('zshy_qizhi'), str, function (card, player, target) {
                return target.countDiscardableCards(player, 'hej');
            }).set('ai', function (target) {
                var player = _status.event.player;
                if (!player.isPhaseUsing()) return target == player;
                return get.effect(target, { name: 'guohe_copy2' }, player, player);
            }).forResult();
            if (result.targets) {
                var target = result.targets[0];
                event.target = target;
                player.logSkill('zshy_qizhi', target);
                player.addTempSkill('zshy_qizhi_Count');
                player.addMark('zshy_qizhi_Count', 1, false);
                const result1 = await player.discardPlayerCard(target, true, 'hej').set('ai', function (button) {
                    var val = get.value(button.link);
                    if (get.color(button.link) == event.color && target != player) return 2 * val;
                    if (target == player) return 7 - val;
                    return val;
                }).forResult();
                if (result1.bool && result1.links && result1.links.length) {
                    if (get.color(result1.links[0]) == event.color && result.targets[0] != player) result.targets[0].damage(), player.recover();
                    else result.targets[0].draw();
                }
            }
        },
        subSkill: {
            Count: {
                sub: true,
                onremove: true,
                charlotte: true,
                marktext: '奇',
                intro: {
                    content: '本回合已发动#次',
                },
            },
        },
    },
    zshy_jinqu: {//进趋
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'phaseJieshuBegin',
        },
        forced: true,
        filter(event, player) {
            return player.countMark('zshy_qizhi_Count') > 0;
        },
        content() {
            var num = player.countMark('zshy_qizhi_Count');
            player.draw(num);
        },
        ai: {
            combo: 'zshy_qizhi',
        },
    },

    zshy_juzhan: {//拒战
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            target: 'useCardToTargeted',
        },
        prompt2: '当你成为其他角色『伤害』类牌的目标后，你可以摸一张牌并令其本回合内不能再对你使用牌。',
        filter(event, player, card) {
            return get.tag(event.card, 'damage');
        },
        logTarget: 'player',
        content() {
            player.draw();
            trigger.player.addTempSkill('zshy_juzhan_nouse');
            player.addTempSkill('zshy_juzhan_effect');
        },
        group: ['zshy_juzhan_sub1'],
        subSkill: {
            sub1: {
                audio: 'zshy_juzhan',
                trigger: {
                    player: 'useCardToPlayered',
                },
                prompt2: '当你使用『伤害』类牌指定一名角色为目标后，你可以获得其一张牌，若此牌不为『伤害』类牌，则你对其造成1点伤害且本回合内不能再对其使用牌',
                filter(event, player, target) {
                    return get.tag(event.card, 'damage') && event.target.countGainableCards(player, 'he') > 0;
                },
                check(event, player, target) {
                    return event.target.countCards('he') > 0 && get.attitude(player, event.target) < 0;
                },
                content() {
                    'step 0'
                    if (trigger.target.countGainableCards(player, 'he')) {
                        player.gainPlayerCard(trigger.target, true, 'he');
                    }
                    'step 1'
                    if (result.bool && result.cards) {
                        if (!get.tag(card, 'damage') || get.name(card) != 'sha') {
                            trigger.target.addTempSkill('zshy_juzhan_effect');
                            trigger.target.damage();
                            player.addTempSkill('zshy_juzhan_nouse');
                        };
                    };
                },
            },
            effect: {
                mod: {
                    targetEnabled(card, player, target) {
                        if (player.hasSkill('zshy_juzhan_nouse')) return false;
                    },
                },
            },
            nouse: {},
        },
    },

    zshy_feijun: {//飞军
        audio: 'ext:诸神寰宇/audio/character:2',
        mark: true,
        onremove: true,
        intro: {
            content: '已发动过的目标：$',
            onunmark: true,
        },
        enable: 'phaseUse',
        usable: 1,
        filter(event, player) {
            return game.hasPlayer(function (current) {
                return current.countCards('he');
            });
        },
        content() {
            'step 0'
            if (game.hasPlayer(function (current) {
                return current.countCards('he') > 0;
            })) {
                player.chooseTarget(function (card, player, target) {
                    return target != player && target.countCards('he');
                }, '选择一名有牌的其他角色').set('ai', function (target) {
                    return get.attitude(player, target) < 0;
                });
            }
            else event.goto(3);
            'step 1'
            if (result.bool) {
                var target = result.targets[0];
                if (!player.getStorage('zshy_feijun').includes(target)) {
                    player.markAuto('zshy_feijun', [target]);
                };
                player.line(target);
                player.gainPlayerCard(target, 'he', true);
                player.draw();
            };
        },
        ai: {
            order: 9,
            result: {
                player(player) {
                    if (
                        game.hasPlayer(function (current) {
                            return (current.countCards('h') || current.countCards('e')) && get.attitude(player, current) < 0 && player.getStorage('zshy_feijun').includes(current);
                        }) ||
                        game.hasPlayer(function (current) {
                            return current.countCards('h') && get.attitude(player, current) < 0;
                        }) ||
                        game.hasPlayer(function (current) {
                            return current.countCards('e') && get.attitude(player, current) < 0;
                        })
                    ) return 1;
                },
            },
        },
    },
    zshy_binglve: {//兵略
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'useCardToTargeted' },
        filter(event, player, target) {
            return event.target != player && !get.tag(event.card, 'damage');
        },
        prompt2: '若未对目标角色发动过〖飞军〗，则你摸一张牌，否则你对其造成1点伤害。',
        content() {
            if (!player.getStorage('zshy_feijun').includes(trigger.target)) {
                player.draw();
            }
            else {
                trigger.target.damage();
            };
        },
    },

    zshy_huaiju: {//怀橘
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'enterGame',
            global: ['phaseBefore'],
        },
        forced: true,
        filter(event, player) {
            return event.name != 'phase' || game.phaseNumber == 0;
        },
        async content(event, trigger, player) {
            await player.addMark('zshy_huaiju', 3, false);
            player.addSkill('zshy_huaiju_ai');
        },
        marktext: '橘',
        intro: {
            name: '怀橘',
            name2: '橘',
            content: '当前「橘」数：#',
        },
        group: ['zshy_huaiju_effect'],
        subSkill: {
            effect: {
                sub: true,
                audio: 'zshy_huaiju',
                trigger: {
                    global: ['damageBegin4', 'phaseDrawBegin2'],
                },
                forced: true,
                filter(event, player) {
                    return event.player.hasMark('zshy_huaiju') && (event.name == 'damage' || !event.numFixed);
                },
                async content(event, trigger, player) {
                    player.line(trigger.player, 'green');
                    if (trigger.name == 'damage') {
                        trigger.cancel();
                        trigger.player.removeMark('zshy_huaiju', 1);
                    } else trigger.num += trigger.player.countMark('zshy_huaiju');
                },
            },
            ai: {
                charlotte: true,
                filterDamage: true,
                skillTagFilter(player, tag, arg) {
                    if (!player.hasMark('zshy_huaiju')) return false;
                    if (
                        !game.hasPlayer(function (current) {
                            return current.hasSkill('zshy_huaiju_effect');
                        })
                    )
                        return false;
                    if (arg && arg.player) {
                        if (arg.player.hasSkillTag('jueqing', false, player)) return false;
                    }
                },
            },
        }
    },
    zshy_yili: {//遗礼
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'phaseZhunbeiBegin',
        },
        filter(event, player) {
            return event.player != player;
        },
        prompt2(event, player) {
            return '令' + get.translation(event.player) + '获得1枚「橘」';
        },
        check(event, player) {
            return get.attitude(player, event.player) > 2;
        },
        async content(event, trigger, player) {
            await trigger.player.addMark('zshy_huaiju', 1, false);
            trigger.player.addSkill('zshy_huaiju_ai');
        },
        ai: {
            combo: 'zshy_huaiju',
        },
    },
    zshy_zhenglun: {//整论
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'phaseZhunbeiBegin',
        },
        forced: true,
        async content(event, trigger, player) {
            player.addMark('zshy_huaiju', 2, false);
        },
        ai: {
            combo: 'zshy_huaiju',
        },
    },

    zshy_kuizhu: {//溃诛
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'phaseDiscardAfter',
        },
        direct: true,
        filter(event, player) {
            var cards = [];
            player.getHistory('lose', function (evt) {
                if (evt.type == 'discard' && evt.getParent('phaseDiscard') == event) cards.addArray(evt.cards2);
            });
            return cards.length > 0;
        },
        content() {
            'step 0'
            var cards = [];
            player.getHistory('lose', function (evt) {
                if (evt.type == 'discard' && evt.getParent('phaseDiscard') == trigger) cards.addArray(evt.cards2);
            });
            event.num = cards.length;
            'step 1'
            event.str1 = '令至多' + event.num + '名角色各摸一张牌';
            event.str2 = '对一名其他角色造成1点伤害';
            player.chooseControl('cancel2').set('ai', function () {
                if (game.countPlayer(function (current) {
                    return get.damageEffect(current, player, player) > 0;
                }) > 0) return 1;
                return 0;
            }).set('choiceList', [event.str1, event.str2]).set('prompt', '是否发动【溃诛】？');
            'step 2'
            if (result.control == 'cancel2') event.finish();
            else event.control = [event.str1, event.str2][result.index];
            'step 3'
            switch (event.control) {
                case event.str1:
                    player.chooseTarget('溃诛：令至多' + event.num + '名角色各摸一张牌', [1, event.num]).set('ai', function (target) {
                        var player = _status.event.player;
                        return 2 * get.effect(target, { name: 'draw' }, player, player);
                    });
                    break;
                case event.str2:
                    player.chooseTarget('溃诛：对一名其他角色造成1点伤害', [1, 1]).set('ai', function (target) {
                        var player = _status.event.player;
                        return get.damageEffect(target, player, player);
                    });
                    break;
            }
            'step 4'
            if (result.bool) {
                var targets = result.targets;
                event.targets = targets.sortBySeat();
                player.logSkill('zshy_kuizhu', targets);
            }
            else event.goto(1);
            'step 5'
            if (event.control == event.str1) game.asyncDraw(targets, 1);
            else {
                for (var target of targets) target.damage();
            }
        },
        ai: {
            expose: 0.2,
        },
    },
    zshy_chezheng: {//掣政
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            source: 'damageBegin2',
            player: 'damageBegin4',
        },
        forced: true,
        filter(event, player, name) {
            if (name == 'damageBegin4') return event.source && !event.source.inRangeOf(player);
            return player.isPhaseUsing() && !event.player.inRangeOf(player);
        },
        content() {
            trigger.num--;
        },
        ai: {
            effect: {
                player(card, player, target) {
                    if (get.tag(card, 'damage') && !target.inRangeOf(player)) return 0;
                },
                target(card, player, target) {
                    if (get.tag(card, 'damage') && !player.inRangeOf(target)) return 0;
                },
            },
        },
        group: 'zshy_chezheng_Draw',
        subSkill: {
            Draw: {
                sub: true,
                audio: 'zshy_chezheng',
                trigger: {
                    player: 'phaseUseEnd',
                },
                forced: true,
                content() {
                    'step 0'
                    var y = game.countPlayer(function (current) {
                        return current != player && !player.inRange(current);
                    });
                    if (y > 0) {
                        player.chooseTarget(get.prompt('zshy_chezheng'), [1, y], function (card, player, target) {
                            return !player.inRange(target) && target.countDiscardableCards(player, 'hej');
                        }, '弃置任意名你攻击范围外的其他角色各一张牌').set('ai', function (target) {
                            return get.effect(target, { name: 'guohe_copy2' }, player, player);
                        });
                    }
                    else event.finish();
                    'step 1'
                    if (result.bool) {
                        var targets = result.targets.sortBySeat();
                        player.line(targets, 'green');
                        for (var i of targets) player.discardPlayerCard(i, 'hej', true);
                    }
                },
            },
        },
    },
    zshy_lijun: {//立军
        audio: 'ext:诸神寰宇/audio/character:2',
        zhuSkill: true,
        trigger: {
            global: 'useCardAfter',
        },
        usable: 1,
        direct: true,
        filter(event, player) {
            if (get.name(event.card) != 'sha' || event.player == player || event.player.group != 'wu') return false;
            if (!event.player.isPhaseUsing()) return false;
            for (var i = 0; i < event.cards.length; i++) {
                if (get.position(event.cards[i], true) == 'o') return true;
            }
            return false;
        },
        content() {
            'step 0'
            var list = game.filterPlayer(function (target) {
                return player != target && target.hasSkill('zshy_lijun');
            });
            var str = '将' + get.translation(trigger.cards) + '交给' + get.translation(list) + (list.length > 1 ? '中的一人' : '');
            trigger.player.chooseTarget(get.prompt('zshy_lijun'), function (card, player, target) {
                return trigger.player != target && target.hasSkill('zshy_lijun');
            }, str).set('ai', function (target) {
                return get.attitude(trigger.player, target);
            });
            'step 1'
            if (result.bool) {
                var target = trigger.player;
                event.target = target;
                player.logSkill('zshy_lijun');
                target.line(player, 'green');
                var list = [];
                for (var i = 0; i < trigger.cards.length; i++) {
                    if (get.position(trigger.cards[i], true) == 'o') list.push(trigger.cards[i]);
                }
                player.gain(list, 'gain2').giver = target;
            }
            else {
                player.storage.counttrigger.zshy_lijun--;
                event.finish();
            }
            'step 2'
            player.chooseBool().set('ai', function () {
                if (get.attitude(player, target) > 0) return true;
                return false;
            }).set('prompt', '立军：是否令' + get.translation(target) + '选择回复1点体力或摸两张牌？');
            'step 3'
            if (result.bool) {
                player.line(target, 'green');
                target.chooseDrawRecover(2, true);
                target.addTempSkill('zshy_lijun_Buff', 'phaseUseEnd');
            }
        },
        subSkill: {
            Buff: {
                sub: true,
                mark: true,
                charlotte: true,
                intro: {
                    content: '本阶段使用【杀】的次数+1',
                },
                mod: {
                    cardUsable(card, player, num) {
                        if (card.name == 'sha') return num + 1;
                    },
                },
            },
        },
    },

    zshy_jianxiang: {//荐降
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            target: 'useCardToTargeted',
        },
        filter(event, player) {
            return event.player != player;
        },
        content() {
            'step 0'
            player.chooseTarget(get.prompt('zshy_jianxiang'), '令场上手牌数最少的一名角色将手牌补至体力上限', function (card, player, target) {
                return target.isMinHandcard();
            }).set('ai', function (target) {
                return get.attitude(player, target);
            });
            'step 1'
            if (result.bool) {
                result.targets[0].draw(result.targets[0].maxHp);
            };
            player.chooseCard('hes', '是否重铸任意张牌？', [1, Infinity]).set('ai', function (card) {
                if (card.name == 'tao' || card.name == 'jiu') return false;
                return 7 - get.value(card);
            });
            'step 2'
            if (result.bool) {
                player.logSkill('zshy_jianxiang');
                player.recast(result.cards);
            };
        },
    },
    zshy_shenshi: {//审时
        audio: 'ext:诸神寰宇/audio/character:2',
        prompt: '出牌阶段限1次，你可以对一名除你以外手牌数最多的角色造成1点伤害并将一张牌交给该角色，然后你可以令一名角色将手牌摸至X张（X为其体力上限）',
        enable: 'phaseUse',
        usable: 1,
        filter(event, player) {
            return player.countCards('he') > 0;
        },
        discard: false,
        line: true,
        lose: false,
        delay: false,
        position: 'he',
        filterCard: true,
        filterTarget(card, player, target) {
            if (player.getCards('h').includes(card => (name = 'tao'))) return false;
            return (
                target != player && !game.hasPlayer(function (current) {
                    return current != player && current.countCards('h') > target.countCards('h');
                })
            );
        },
        check(card) {
            return 5 - get.value(card);
        },
        content() {
            'step 0'
            var target = event.target;
            target.damage(1, 'nocard');
            player.give(event.cards, target);
            'step 1'
            player.chooseTarget('令一名角色将手牌摸至X张（X为其体力上限）', function (card, player, target) {
                return target.countCards('h') < target.maxHp;
            }).set('ai', function (target) {
                return get.attitude(player, target);
            });
            'step 2'
            if (result.bool) {
                player.line(result.targets);
                result.targets[0].drawTo(result.targets[0].maxHp);
            }
        },
        ai: {
            order: 1,
            result: {
                target(player, target) {
                    return -1;
                },
            },
        },
        group: ['zshy_shenshi_gain'],
        subSkill: {
            gain: {
                audio: 'zshy_shenshi',
                trigger: {
                    player: 'damageEnd',
                },
                filter(event, player) {
                    return player.countCards('he') > 0 && event.source && event.source != player;
                },
                check(event, player) {
                    return event.source && event.source.countCards('h') <= 2 && player.countCards('h') < 4;
                },
                logTarget: 'source',
                prompt2: '其他角色对你造成伤害后，你可以观看该角色的手牌，然后交给其一张牌，当前角色回合结束时，若此牌仍在该角色的区域内，你将手牌摸至Y张（Y为你的体力上限）',
                async content(event, trigger, player) {
                    await player.viewHandcards(trigger.source);
                    const result = await player.chooseCard('he', true, '交给' + get.translation(trigger.source) + '一张牌').set('ai', function (card) {
                        return 5 - get.value(card);
                    }).forResult();
                    if (result.bool) {
                        await player.give(result.cards, trigger.source);
                        trigger.source.storage.zshy_shenshi1 = result.cards[0];
                        trigger.source.storage.zshy_shenshi2 = player;
                        trigger.source.addSkill('zshy_shenshi_sub1');
                    };
                },
            },
            sub1: {
                audio: 'zshy_shenshi',
                trigger: {
                    global: 'phaseJieshuBegin',
                },
                forced: true,
                popup: false,
                charlotte: true,
                sourceSkill: 'zshy_shenshi',
                filter(event, player) {
                    return player.storage.zshy_shenshi1 != undefined && player.storage.zshy_shenshi2 != undefined;
                },
                async content(event, trigger, player) {
                    const pl = player.storage.zshy_shenshi2;
                    const card = player.storage.zshy_shenshi1;
                    if (player.getCards('he').includes(card) && pl.maxHp - pl.countCards('h') > 0) {
                        await pl.drawTo(pl.maxHp);
                        pl.logSkill('zshy_shenshi');
                    }
                    player.removeSkill('zshy_shenshi1');
                    delete player.storage.zshy_shenshi1;
                    delete player.storage.zshy_shenshi2;
                },
            },
        },
    },

    zshy_chenglve: {//成略
        audio: 'ext:诸神寰宇/audio/character:2',
        usable: 1,
        enable: 'phaseUse',
        content() {
            'step 0'
            player.draw(2);
            if (player.countCards('he')) {
                player.chooseCard('he', [1, 2]).set('ai', function (card) {
                    return 6 - get.value(card);
                }).set('prompt', '成略：将至多两张牌置于武将牌上，称为「略」');
            }
            else event.finish();
            'step 1'
            if (result.cards && result.cards.length) player.addToExpansion(result.cards, player, 'give').gaintag.add('zshy_chenglve');
        },
        marktext: '略',
        intro: {
            content: 'expansion',
            markcount: 'expansion',
        },
        onremove(player, skill) {
            var cards = player.getExpansions(skill);
            if (cards.length) player.loseToDiscardpile(cards);
        },
        mod: {
            cardUsable(card, player) {
                var cards = player.getExpansions('zshy_chenglve');
                if (cards.length) {
                    var suit = get.suit(card);
                    for (var i of cards) {
                        if (get.suit(i, player) == suit) return Infinity;
                    }
                }
            },
            targetInRange(card, player) {
                var cards = player.getExpansions('zshy_chenglve');
                if (cards.length) {
                    var suit = get.suit(card);
                    for (var i of cards) {
                        if (get.suit(i, player) == suit) return true;
                    }
                }
            },
        },
        ai: {
            order: 9,
            result: {
                player: 1,
            },
        },
        group: 'zshy_chenglve_Gain',
        subSkill: {
            Gain: {
                sub: true,
                audio: 'zshy_chenglve',
                trigger: {
                    player: ['phaseEnd'],
                },
                forced: true,
                filter(event, player) {
                    return player.getExpansions('zshy_chenglve').length;
                },
                content() {
                    'step 0'
                    var cards = player.getExpansions('zshy_chenglve');
                    player.gain(cards, 'gain2');
                },
            },
        },
    },
    zshy_shicai: {//恃才
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: ['useCardAfter', 'respondAfter'],
        },
        check: () => true,
        filter(event, player) {
            if (!event.cards.filterInD('oe').length) return false;
            if (!['basic', 'trick'].includes(get.type(event.card))) return false;
            if (player.getHistory('custom', function (evt) {
                return evt.zshy_shicai_name == get.name(event.card);
            }).length > player.getHistory('sourceDamage').length) return false;
            return true;
        },
        'prompt2'(event, player) {
            const cards = event.cards.filterInD('oe');
            return '将' + get.translation(cards) + (cards.length > 1 ? '以任意顺序' : '') + '置于牌堆顶，然后摸' + cards.length + '张牌';
        },
        content() {
            'step 0'
            player.getHistory('custom').push({ zshy_shicai_name: trigger.card.name });
            'step 1'
            var cards = trigger.cards.filterInD();
            event.num = cards.length;
            if (cards.length == 1) event._result = { bool: true, moved: [cards] };
            else {
                var str = '恃才：将' + get.translation(cards) + '按任意顺序置于牌堆顶';
                var next = player.chooseToMove(str, true);
                next.set('list', [['牌堆顶', cards]]);
                next.set('reverse', ((_status.currentPhase && _status.currentPhase.next) ? get.attitude(player, _status.currentPhase.next) > 0 : false));
                next.set('processAI', function (list) {
                    var cards = list[0][1].slice(0);
                    cards.sort(function (a, b) { return (_status.event.reverse ? 1 : -1) * (get.value(b) - get.value(a)); });
                    return [cards];
                });
            }
            'step 2'
            if (result.bool) {
                var cards = result.moved[0];
                cards.reverse();
                game.cardsGotoPile(cards, 'insert');
                game.log(player, '将', cards, '置于了牌堆顶');
            }
            'step 3'
            player.draw(event.num);
        },
    },
    zshy_cunmu: {//寸目
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'drawBegin',
        },
        forced: true,
        content() {
            trigger.bottom = true;
        },
        ai: {
            abnormalDraw: true,
            skillTagFilter(player, tag, arg) {
                if (tag == 'abnormalDraw') return !arg || arg == 'bottom';
            },
        },
    },

    zshy_mingren: {//明任
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'roundStart',
            player: 'phaseEnd',
        },
        forced: true,
        content() {
            'step 0'
            player.draw();
            if (!player.countCards('hes')) event.finish();
            else {
                if (!player.getExpansions('zshy_mingren').length) {
                    player.chooseCard('hes', '明任：请将一张牌置于武将牌上作为「任」', true).set('ai', function (card) {
                        return 6 - get.value(card);
                    });
                }
                else {
                    var str = '明任：是否用一张牌替换「任」？（' + get.translation(player.getExpansions('zshy_mingren')[0]) + '）';
                    player.chooseCard('hes', str).set('ai', function (card) {
                        var player = _status.event.player;
                        var color = get.color(card);
                        if (color == get.color(player.getExpansions('zshy_mingren')[0])) return false;
                        return 6 - get.value(card);
                    });
                }
            }
            'step 1'
            if (result.bool) {
                if (!player.getExpansions('zshy_mingren').length) {
                    player.addToExpansion(result.cards[0], player, 'give', 'log').gaintag.add('zshy_mingren');
                }
                else {
                    player.addToExpansion(result.cards[0], 'log', 'give', player).gaintag.add('zshy_mingren');
                    var card = player.getExpansions('zshy_mingren')[0];
                    if (card) player.gain(card, 'gain2');
                }
            }
        },
        marktext: '任',
        intro: {
            content: 'expansion',
            markcount: 'expansion',
        },
        onremove(player, skill) {
            var cards = player.getExpansions(skill);
            if (cards.length) player.loseToDiscardpile(cards);
        },
        mod: {
            ignoredHandcard(card, player) {
                var storage = player.getExpansions('zshy_mingren');
                if (!storage.length) return false;
                var color = get.color(storage[0]);
                if (get.color(card) == color) return true;
            },
            cardDiscardable(card, player, name) {
                var storage = player.getExpansions('zshy_mingren');
                if (!storage.length) return false;
                var color = get.color(storage[0]);
                if (name == 'phaseDiscard' && get.color(card) == color) return false;
            },
            cardUsable(card, player, target) {
                var storage = player.getExpansions('zshy_mingren');
                if (!storage.length || !card.cards) return;
                var color = get.color(storage[0]);
                for (var i of card.cards) {
                    if (get.color(i) != color) return;
                }
                return Infinity;
            },
            targetInRange(card, player, target) {
                var storage = player.getExpansions('zshy_mingren');
                if (!storage.length || !card.cards) return;
                var color = get.color(storage[0]);
                for (var i of card.cards) {
                    if (get.color(i) != color) return;
                }
                return true;
            },
        },
        group: ['zshy_mingren_Defense', 'zshy_mingren_use'],
        subSkill: {
            Defense: {
                audio: 'zshy_mingren',
                trigger: {
                    target: 'useCardToTarget',
                },
                forced: true,
                filter(event, player) {
                    var storage = player.getExpansions('zshy_mingren');
                    if (!storage.length) return false;
                    var color = get.color(storage[0]);
                    if (get.color(event.card) != color) return false;
                    return event.player != player && event.targets.length == 1;
                },
                content() {
                    player.draw();
                },
            },
            use: {
                audio: 'zshy_mingren',
                trigger: {
                    player: 'useCard',
                },
                forced: true,
                filter(event, player) {
                    var storage = player.getExpansions('zshy_mingren');
                    if (!storage.length) return false;
                    var color = get.color(storage[0]);
                    if (get.color(event.card) != color) return false;
                    return event.targets.length == 1;
                },
                content() {
                    player.draw();
                },
            },
        },
    },
    zshy_zhenliang: {//贞良
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        filter(event, player) {
            var storage = player.getExpansions('zshy_mingren');
            if (!storage.length) return false;
            var color = get.color(storage[0]);
            return player.countCards('hes', function (card) {
                return get.color(card) != color;
            }) > 0;
        },
        filterCard(card, player) {
            return get.color(card) != get.color(player.getExpansions('zshy_mingren')[0]);
        },
        selectCard: true,
        position: 'hes',
        filterTarget: true,
        check(card) {
            return 7 - get.value(card);
        },
        prompt(event, player) {
            var player = _status.event.player;
            var storage = player.getExpansions('zshy_mingren');
            var color = get.color(storage[0]);
            return '出牌阶段，你可以弃置任意张不为' + get.translation(color) + '的牌并对一名角色造成X点伤害（X为你弃置牌数）';
        },
        content() {
            target.damage(event.cards.length, 'nocard');
        },
        ai: {
            order() {
                return [2, 3, 4, 5].randomGet();
            },
            result: {
                target(player, target) {
                    return get.damageEffect(target, player, target);
                },
            },
        },
    },

    zshy_longnu: {//龙怒
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'phaseUseBegin',
        },
        charlotte: true,
        forced: true,
        async content(event, trigger, player) {
            let list = ['失去1点体力并摸两张牌', '减少1点体力上限并摸四张牌'];
            const result = await player.chooseControl(true).set('choiceList', list).set('ai', function () {
                if (player.isDamaged() && player.maxHp > 1) return 1;
                return 0;
            }).set('prompt', '龙怒：请选择一项').forResult();
            if (result.index == 0) {
                player.loseHp();
                player.draw(2);
            }
            else {
                player.loseMaxHp();
                player.draw(4);
            }
        },
        mod: {
            targetInRange(card, player) {
                if (card.name == 'sha' && get.nature(card) == 'fire') return true;
            },
            cardUsable(card, player) {
                if (card.name == 'sha' && get.nature(card) == 'thunder') return Infinity;
            },
        },
        group: ['zshy_longnu_Sha', 'zshy_longnu_Gaindie', 'zshy_longnu_Red', 'zshy_longnu_Black'],
        subSkill: {
            Sha: {
                audio: 'zshy_longnu',
                enable: ['chooseToUse', 'chooseToRespond'],
                charlotte: true,
                prompt: '将一张<span class=thundertext>黑</span>/<span class=firetext>红</span>色牌当作<span class=thundertext>雷</span>/<span class=firetext>火</span>杀使用或打出',
                hiddenCard(player, name) {
                    if (name == 'sha') return player.countCards('hes', { color: ['red', 'black'] });
                },
                viewAs(cards, player) {
                    if (cards.length) {
                        var name = false, nature = null;
                        switch (get.color(cards[0], player)) {
                            case 'red': name = 'sha'; nature = 'fire'; break;
                            case 'black': name = 'sha'; nature = 'thunder'; break;
                        }
                        if (name) return { name: name, nature: nature };
                    }
                    return null;
                },
                check(card) {
                    return 6 - get.value(card);
                },
                position: 'hes',
                filterCard(card, player, event) {
                    event = event || _status.event;
                    var filter = event._backup.filterCard, color = get.color(card, player);
                    if (color == 'red' && filter({ name: 'sha', cards: [card], nature: 'fire' }, player, event)) return true;
                    if (color == 'black' && filter({ name: 'sha', cards: [card], nature: 'thunder' }, player, event)) return true;
                    return false;
                },
                filter(event, player) {
                    var filter = event.filterCard;
                    if (filter(get.autoViewAs({ name: 'sha', nature: 'fire' }, 'unsure'), player, event) && player.countCards('hes', { color: 'red' })) return true;
                    if (filter(get.autoViewAs({ name: 'sha', nature: 'thunder' }, 'unsure'), player, event) && player.countCards('hes', { color: 'black' })) return true;
                    return false;
                },
                ai: {
                    order: 4.2,
                    respondSha: true,
                    skillTagFilter(player, tag) {
                        if (!player.countCards('hes', { color: ['red', 'black'] })) return false;
                    },
                },
            },
            Gaindie: {
                audio: 'zshy_longnu',
                trigger: {
                    source: 'dieBegin',
                },
                charlotte: true,
                forced: true,
                content() {
                    player.gainMaxHp();
                    player.recover()
                },
            },
            Red: {
                trigger: {
                    player: 'useCard',
                },
                charlotte: true,
                forced: true,
                silent: true,
                popup: false,
                lastDo: true,
                filter(event, player) {
                    return get.name(event.card) == 'sha' && get.nature(event.card) == 'fire';
                },
                content() {
                    trigger.baseDamage++;
                },
                ai: {
                    skillTagFilter(player, tag, arg) {
                        return arg.card.name == 'sha' && get.nature(event.card) == 'fire';
                    },
                },
            },
            Black: {
                trigger: {
                    player: 'useCard',
                },
                charlotte: true,
                forced: true,
                silent: true,
                popup: false,
                lastDo: true,
                filter(event, player) {
                    return get.name(event.card) == 'sha' && get.nature(event.card) == 'thunder';
                },
                content() {
                    trigger.directHit.addArray(game.players);
                },
                ai: {
                    directHit_ai:  true,
                    skillTagFilter(player, tag, arg) {
                        return arg.card.name == 'sha' && get.nature(arg.card) == 'thunder';
                    },
                },
            },
        },
    },
    zshy_jieying: {//结营
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: ['linkBefore', 'enterGame'],
            global: 'phaseBefore',
        },
        charlotte: true,
        forced: true,
        filter(event, player) {
            if (event.name == 'link') return player.isLinked();
            return (event.name != 'phase' || game.phaseNumber == 0) && !player.isLinked();
        },
        content() {
            var num = game.countPlayer(function (current) {
                return current.isLinked();
            });
            player.draw(num);
            if (trigger.name != 'link') player.link(true);
            else trigger.cancel();
        },
        mod: {
            maxHandcard(player, num) {
                var n = game.countPlayer(function (current) {
                    return current.isLinked();
                });
                if (n > 0) return num + n;
            },
        },
        ai: {
            effect: {
                target(card) {
                    if (card.name == 'tiesuo') return [0, 0.1];
                },
            },
        },
        group: ['zshy_jieying_Damage', 'zshy_jieying_Link'],
        subSkill: {
            Damage: {
                audio: 'zshy_jieying',
                trigger: {
                    player: 'damageBefore',
                },
                charlotte: true,
                forced: true,
                filter(event, player) {
                    return player.isDamaged();
                },
                content() {
                    trigger.cancel();
                },
                ai: {
                    effect: {
                        target(card, player, target, current) {
                            if (target.isDamaged()) return 'zerotarget';
                        },
                    },
                },
            },
            Link: {
                trigger: {
                    global: 'phaseJieshuBegin',
                },
                charlotte: true,
                direct: true,
                content() {
                    'step 0'
                    player.chooseTarget(get.prompt('zshy_jieying'), '令一名角色横置或重置').set('ai', function (target) {
                        var player = _status.event.player;
                        return get.effect(target, { name: 'tiesuo' }, player, player);
                    });
                    'step 1'
                    if (result.bool) {
                        var target = result.targets[0];
                        player.logSkill('zshy_jieying', target);
                        if (target.isLinked()) target.link(false);
                        else target.link(true);
                    }
                },
                ai: {
                    expose: 0.2,
                },
            },
        },
    },

    zshy_junlve: {//军略
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'damageAfter',
            source: 'damageEnd',
        },
        charlotte: true,
        forced: true,
        async content(event, trigger, player) {
            await player.addMark('zshy_junlve', trigger.num, false);
            if (trigger.hasNature()) {
                await player.recover(trigger.num);
            }
        },
        marktext: '略',
        intro: {
            content: 'mark',
        },
        group: 'zshy_junlve_Deputy',
        subSkill: {
            Deputy: {
                audio: 'zshy_junlve',
                trigger: {
                    player: 'phaseUseBegin',
                },
                charlotte: true,
                forced: true,
                filter(event, player) {
                    return player.hasMark('zshy_junlve');
                },
                content() {
                    'step 0'
                    event.num = Math.min(game.countPlayer(), player.countMark('zshy_junlve'));
                    player.chooseDrawRecover(event.num, true);
                    'step 1'
                    var str = '令至多' + get.cnNumber(event.num) + '名角色横置或重置';
                    player.chooseTarget(get.prompt('zshy_junlve'), str, [1, event.num]).set('ai', function (target) {
                        var player = _status.event.player;
                        if (target.isLinked()) return get.attitude(player, target);
                        return -get.attitude(player, target);
                    });
                    'step 2'
                    if (result.bool) {
                        var targets = result.targets.sortBySeat();
                        player.line(targets);
                        for (var i of targets) i.link();
                    }
                },
            },
        },
    },
    zshy_cuike: {//摧克
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: ['phaseZhunbeiBegin', 'phaseJieshuBegin'],
        },
        charlotte: true,
        direct: true,
        content() {
            'step 0'
            player.chooseTarget(get.prompt('zshy_cuike'), '获得任意名角色区域内一张牌', [1, Infinity], function (card, player, target) {
                return target.countGainableCards(player, 'hej');
            }).set('ai', function (target) {
                return get.effect(target, { name: 'shunshou_copy2' }, player, player) > 0;
            });
            'step 1'
            if (result.bool) {
                player.logSkill('zshy_cuike');
                Promise.all(result.targets.map(function (target) {
                    player.gainPlayerCard(target, 'hej', true);
                }))
            }
            'step 2'
            player.chooseTarget(get.prompt('zshy_cuike'), '对任意名角色造成1点伤害', [1, Infinity]).set('ai', function (target) {
                var player = _status.event.player;
                return get.damageEffect(target, player, player);
            });
            'step 3'
            if (result.bool) {
                player.logSkill('zshy_cuike');
                Promise.all(result.targets.map(function (target) {
                    target.damage();
                }))
            }
        },
        group: 'zshy_cuike_cancel',
        subSkill: {
            cancel: {
                audio: 'zshy_cuike',
                trigger: {
                    global: 'useCardToBefore',
                },
                charlotte: true,
                check(event, player) {
                    var effect = 0, name = get.name(event.card);
                    if (name == 'wuxie' || name == 'shan' || name == 'zshy_jiandun' || name == 'zshy_pangazhijiao') {
                        if (get.attitude(player, event.player) < -1) effect = -1;
                    }
                    else if (event.targets && event.targets.length) {
                        for (var i = 0; i < event.targets.length; i++) {
                            effect += get.effect(event.targets[i], event.card, event.player, player);
                        }
                    }
                    if (get.attitude(event.player, player) >= 0) return false;
                    if (get.tag(event.card, 'damage') || event.player.hp < 2) return true;
                    return effect < 0;
                },
                filter(event, player) {
                    if (!['basic', 'trick'].includes(get.type(event.card)) || !player.hasMark('zshy_junlve')) return false;
                    return event.player != player && get.color(event.card) == 'red' && event.targets.length == 1;
                },
                'prompt2'(event, player) {
                    var card = get.translation(event.card);
                    var target = get.translation(event.player);
                    var str = '弃置1枚「军略」并令' + card + '无效';
                    if (get.tag(event.card, 'damage')) str += '，然后对' + target + '造成1点火焰伤害';
                    return str;
                },
                logTarget: 'player',
                content() {
                    'step 0'
                    player.removeMark('zshy_junlve', 1);
                    trigger.cancel();
                    'step 1'
                    if (get.tag(trigger.card, 'damage')) trigger.player.damage('fire');
                },
                ai: {
                    expose: 0.2,
                    threaten: 1.8,
                    fireattack: true,
                },
            },
        },
    },
    zshy_zhanhuo: {//绽火
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        multiline: true,
        multitarget: true,
        skillAnimation: true,
        animationColor: 'metal',
        filter(event, player) {
            return player.countMark('zshy_junlve') > 1 && game.hasPlayer(function (target) {
                return player != target && target.isLinked();
            });
        },
        filterTarget(card, player, target) {
            return player != target && target.isLinked();
        },
        selectTarget() {
            var player = _status.event.player;
            var num1 = Math.floor(player.countMark('zshy_junlve'));
            return [1, num1];
        },
        prompt: '出牌阶段，你可选择任意名已横置的其他角色并弃置X枚「军略」，然后你先依次弃置这些角色至多X张牌，再选择对其中一名角色造成X点火焰伤害。（X为你选择的角色数）',
        content() {
            'step 0'
            var targets = targets.sortBySeat();
            event.targets = targets;
            player.removeMark('zshy_junlve', targets.length);
            for (var i of targets) player.discardPlayerCard(i, 'he', [1, targets.length]);
            'step 1'
            var str = '对其中一名角色造成' + targets.length + '点火焰伤害';
            player.chooseTarget(get.prompt('zshy_zhanhuo'), str, function (card, player, target) {
                return _status.event.targets.includes(target);
            }).set('targets', targets).set('ai', function (target) {
                return get.damageEffect(target, player, player, 'fire');
            });
            'step 2'
            if (result.bool) {
                var target = result.targets[0];
                player.line(target);
                target.damage('fire', targets.length);
            }
        },
        ai: {
            order() {
                return [1, 2, 3, 4, 5].randomGet();
            },
            result: {
                target(player, target) {
                    if (target.hasSkillTag('nofire')) return 0;
                    return get.damageEffect(target, player);
                },
            },
        },
    },

};
const 动如雷震 = {
    zshy_yongsi: {//庸肆
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'phaseZhunbeiBegin' },
        forced: true,
        mod: {
            maxHandcard(player, num) {
                return num + game.countPlayer();
            },
        },
        async content(event, trigger, player) {
            const num = game.countPlayer();
            await player.draw(num);
            const canRecast = player.getCards('h', card => player.canRecast(card));
            if (!canRecast.length) return;
            const max = Math.min(num, canRecast.length);
            const result = await player
                .chooseCard('庸肆：你可以重铸至多' + max + '张手牌', 'h', [0, max])
                .set('filterCard', (card, player) => player.canRecast(card))
                .set('ai', card => {
                    if (card.name == 'sha') return 5;
                    return get.value(card, player, 'raw') < 0 ? 2 : 0;
                })
                .forResult();
            if (!result.bool || !result.cards || !result.cards.length) return;
            const cards = result.cards.slice();
            const damageCount = cards.filter(card => get.tag(card, 'damage') > 0).length;
            await player.recast(cards);
            if (damageCount) {
                player.addTempSkill('zshy_yongsi_sha', { global: ['phaseAfter', 'phaseBeforeStart'] });
                player.storage.zshy_yongsi_sha = (player.storage.zshy_yongsi_sha || 0) + damageCount;
            }
        },
    },
    zshy_yongsi_sha: {//庸肆：重铸伤害类牌后的本回合加成
        charlotte: true,
        onremove: true,
        mod: {
            targetInRange(card) {
                if (get.name(card) == 'sha') return true;
            },
            cardUsable(card, player, num) {
                if (card.name == 'sha') return num + (player.storage.zshy_yongsi_sha || 0);
            },
        },
    },
    zshy_weidi: {//伪帝
        audio: 'ext:诸神寰宇/audio/character:2',
        forceaudio: true,
        unique: true,
        zhuSkill: true,
        trigger: {
            player: 'phaseDiscardBegin',
        },
        filter(event, player) {
            if (!player.hasZhuSkill('zshy_weidi')) return false;
            return (
                player.needsToDiscard() > 0 &&
                game.countPlayer(function (current) {
                    return current != player;
                }) > 0
            );
        },
        async cost(event, trigger, player) {
            const num = Math.min(
                player.needsToDiscard(),
                game.countPlayer(function (target) {
                    return target != player;
                })
            );
            if (!num) return;
            event.result = await player
                .chooseCardTarget({
                    prompt: get.prompt('zshy_weidi'),
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
                })
                .forResult();
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
            for (const target of event.targets) {
                if (target.group == 'qun') await target.draw(1);
            }
        },
    },

    zshy_zhengu: {//镇骨
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: ['phaseBegin', 'phaseEnd'],
        },
        filter(event, player) {
            if (!event.player.isIn() || event.player.countCards('h') == player.countCards('h')) return false;
            return event.player != player;
        },
        check(event, player) {
            var target = event.player, att = get.attitude(player, target);
            var ts = target.countCards('h'), hs = player.countCards('h');
            var eff = get.effect(target, { name: 'draw' }, player, player);
            var num = ts - hs;
            if (num < 0) {
                if (eff > 0 && att > 0) return true;
            }
            if (num > 0 && att < 0) return true;
            return false;
        },
        prompt2(event, player) {
            const num = event.player.countCards('h') - player.countCards('h');
            const numx = Math.abs(num);
            return `令${get.translation(event.player)}${num < 0 ? '摸' + numx + '张牌' : '弃置' + numx + '张手牌'}`
        },
        logTarget: 'player',
        async content(event, trigger, player) {
            const target = trigger.player;
            const num = trigger.player.countCards('h') - player.countCards('h');
            const numx = Math.abs(num);
            if (num > 0) {
                target.chooseToDiscard(numx, true);
            }
            else {
                target.draw(numx);
            };
            if (numx > player.hp) {
                player.recover();
            };
        },
        group: ['zshy_zhengu_Player'],
        subSkill: {
            Player: {
                trigger: {
                    player: ['phaseEnd', 'damageAfter'],
                },
                direct: true,
                filter(event, player) {
                    return game.hasPlayer(function (current) {
                        return current != player && current.countCards('h') != player.countCards('h');
                    })
                },
                content() {
                    'step 0'
                    var str = '令一名其他角色将手牌数摸或弃至与你相同';
                    player.chooseTarget(get.prompt('zshy_zhengu'), str, function (card, player, target) {
                        return target != player && target.countCards('h') != player.countCards('h');
                    }).set('ai', function (target) {
                        var player = _status.event.player, att = get.attitude(player, target);
                        var eff = get.effect(target, { name: 'draw' }, player, player);
                        var ts = target.countCards('h'), hs = player.countCards('h');
                        var num = ts - hs, numx = Math.abs(num);
                        if (num < 0) {
                            if (eff > 0) return att * 2;
                            return att;
                        }
                        return -att * numx;
                    });
                    'step 1'
                    if (result.bool) {
                        var target = result.targets[0];
                        player.logSkill('zshy_zhengu', target);
                        var ts = target.countCards('h'), hs = player.countCards('h');
                        if (ts > hs) {
                            target.chooseToDiscard(ts - hs, true);
                            if ((ts - hs) > player.hp) player.recover();
                        }
                        else {
                            target.draw(hs - ts);
                            if ((hs - ts) > player.hp) player.recover();
                        }
                    }
                },
            },
        },
    },

    zshy_wanglie: {//往烈
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'useCardToPlayered',
        },
        forced: true,
        filter(event, player) {
            return event.isFirstTarget && get.tag(event.card, 'damage');
        },
        preHidden: true,
        prompt2(event) {
            return '令' + get.translation(event.card) + '不能被响应且额外结算';
        },
        async content(event, trigger, player) {
            const useEvent = trigger.getParent();
            useEvent.nowuxie = true;
            useEvent.directHit.addArray(game.players);
            let maxDamagedHp = 0;
            for (const target of useEvent.targets) {
                maxDamagedHp = Math.max(maxDamagedHp, target.getDamagedHp());
            }
            useEvent.effectCount += player.getDamagedHp() + maxDamagedHp + 1;
        },
        mod: {
            targetInRange(card, player) {
                if (!get.tag(card, 'damage')) return;
                const first = player.getHistory('useCard', evt => get.tag(evt.card, 'damage'))[0];
                if (!first || first.card == card) return true;
            },
        },
        ai: {
            presha: true,
            directHit_ai: true,
            skillTagFilter(player, tag, arg) {
                if (tag == 'directHit_ai') return !!arg && !!arg.card && !!get.tag(arg.card, 'damage');
            },
        },
    },
    zshy_zuilun: {//罪论
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'phaseJieshuBegin',
        },
        check(event, player) {
            let num = 0;
            if (
                player.hasHistory('lose', function (evt) {
                    return evt.type == 'discard';
                })
            )
                num++;
            if (!player.isMinHandcard()) num++;
            if (!player.getStat('damage')) num++;
            if (num == 3) return player.hp >= 2;
            return true;
        },
        prompt(event, player) {
            let num = 3;
            if (
                player.hasHistory('lose', function (evt) {
                    return evt.type == 'discard';
                })
            )
                num--;
            if (!player.isMinHandcard()) num--;
            if (!player.getStat('damage')) num--;
            return get.prompt('zshy_zuilun') + '（可将' + get.cnNumber(num) + '张牌置于武将牌上）';
        },
        async content(event, trigger, player) {
            let num = 0;
            const cards = get.cards(3);
            await game.cardsGotoOrdering(cards);
            if (
                player.hasHistory('lose', function (evt) {
                    return evt.type == 'discard';
                })
            )
                num++;
            if (!player.isMinHandcard()) num++;
            if (!player.getStat('damage')) num++;
            if (num == 0) {
                await player.gain(cards, 'draw'),
                    player.loseToSpecial(cards, 'zshy_zuilun'),
                    game.log(player, '将所得的牌放到了武将牌上');
                return;
            }
            let prompt = '罪论：将' + get.cnNumber(num) + '张牌置于牌堆顶';
            if (num < 3) prompt += '并将剩余的牌置于武将牌上';
            const chooseToMove = player.chooseToMove(prompt, true);
            if (num < 3) {
                chooseToMove.set('list', [['牌堆顶', cards], ['获得']]);
                chooseToMove.set('filterMove', function (from, to, moved) {
                    if (to == 1 && moved[0].length <= _status.event.num) return false;
                    return true;
                });
                chooseToMove.set('filterOk', function (moved) {
                    return moved[0].length == _status.event.num;
                });
            } else chooseToMove.set('list', [['牌堆顶', cards]]);
            chooseToMove.set('num', num);
            chooseToMove.set('processAI', function (list) {
                const check = function (card) {
                    const player = _status.event.player;
                    const next = player.next;
                    const att = get.attitude(player, next);
                    const judge = next.getCards('j')[tops.length];
                    if (judge) {
                        return get.judge(judge)(card) * att;
                    }
                    return next.getUseValue(card) * att;
                };
                const cards = list[0][1].slice(0),
                    tops = [];
                while (tops.length < _status.event.num) {
                    list.sort(function (a, b) {
                        return check(b) - check(a);
                    });
                    tops.push(cards.shift());
                }
                return [tops, cards];
            });
            let result = await chooseToMove.forResult();
            if (result.bool) {
                const list = result.moved[0];
                cards.removeArray(list);
                await game.cardsGotoPile(list.reverse(), 'insert');
            }
            game.updateRoundNumber();
            if (cards.length) {
                await player.gain(cards, 'draw'),
                    player.loseToSpecial(cards, 'zshy_zuilun'),
                    game.log(player, '将剩余的牌置于武将牌上');
                return;
            }
            const chooseTarget = player.chooseTarget('请选择一名角色，与其一同失去1点体力', true, function (card, player, target) {
                return target != player;
            });
            chooseTarget.ai = function (target) {
                return -get.attitude(_status.event.player, target);
            };
            result = await chooseTarget.forResult();
            player.line(result.targets[0], 'fire');
            await player.loseHp();
            await result.targets[0].loseHp();
        },
        marktext: '非罪',
        intro: {
            name: '非罪',
            name2: '非罪',
            mark(dialog, storage, player) {
                dialog.addSmall(player.getCards('s', function (card) {
                    return card.hasGaintag('zshy_zuilun');
                }));
            },
            markcount(storage, player) {
                return player.getCards('s', function (card) {
                    return card.hasGaintag('zshy_zuilun');
                }).length;
            },
            onunmark(storage, player) {
                var cards = player.getCards('s', function (card) {
                    return card.hasGaintag('zshy_zuilun');
                });
                if (cards.length) {
                    player.lose(cards, ui.discardPile);
                    player.$throw(cards, 1000);
                    game.log(cards, '进入了弃牌堆');
                }
            },
        },
    },
    zshy_fuyin: {//父荫
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            target: 'useCardToPlayered',
        },
        usable(event, player) {
            return Math.max(1, player.getDamagedHp());
        },
        forced: true,
        filter(event, player, target, card) {
            if (event.player == player) return false;
            if (event.player.countCards('h') < player.countCards('h')) return false;
            if (!get.tag(event.card, 'damage')) return false;
            return true;
        },
        content() {
            trigger.getParent().excluded.add(player);
        },
        ai: {
            threaten: 1.5,
        },
    },

    zshy_liangyin: {//良姻
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: ['loseAfter', 'addToExpansionAfter', 'cardsGotoSpecialAfter', 'loseAsyncAfter'],
        },
        filter(event, player, name) {
            if (event.name == 'lose' || event.name == 'loseAsync') return event.getlx !== false && event.toStorage == true;
            if (event.name == 'cardsGotoSpecial') return !event.notrigger;
            return true;
        },
        prompt2: '你可以令一名角色选择摸两张牌或回复1点体力',
        content() {
            'step 0'
            var list = [], choiceList = [
                '令一名角色摸两张牌',
                '令一名角色回复1点体力',
            ];
            list.push('选项一', '选项二');
            player.chooseControl(list, 'cancel2').set('choiceList', choiceList).set('ai', function () {
                var player = _status.event.player;
                if (game.hasPlayer(function (current) {
                    if (get.attitude(player, current) <= 0) return false;
                    return current.countCards('h') < 2;
                }) && Math.random() < 0.8) return '选项一';
                if (game.hasPlayer(function (current) {
                    if (get.attitude(player, current) < 0) return false;
                    return get.recoverEffect(current, player, player) > 0;
                }) && Math.random() < 0.8) return '选项二';
                return '选项一';
            }).set('prompt', get.prompt('zshy_liangyin'));
            'step 1'
            if (result.control != 'cancel2') {
                event.control = result.control;
                if (event.control == '选项一') {
                    player.chooseTarget(get.prompt('zshy_liangyin'), '令一名角色摸两张牌').set('ai', function (target) {
                        var player = _status.event.player;
                        if (get.attitude(player, target) <= 0) return false;
                        if (target.countCards('h') < 2) return get.effect(target, { name: 'draw' }, player, player);
                    });
                }
                else {
                    player.chooseTarget(get.prompt('zshy_liangyin'), '令一名角色回复1点体力').set('ai', function (target) {
                        var player = _status.event.player;
                        if (get.attitude(player, target) <= 0) return false;
                        return get.recoverEffect(target, player, player);
                    });
                }
            }
            else event.finish();
            'step 2'
            if (result.bool) {
                var target = result.targets[0];
                player.logSkill('zshy_liangyin', target);
                if (event.control == '选项一') {
                    target.draw(2);
                }
                else {
                    target.recover();
                }
            }
            else event.goto(0);
        },
        group: 'zshy_liangyin_gain',
        subSkill: {
            gain: {
                sub: true,
                trigger: {
                    global: ['loseAfter', 'equipAfter', 'addJudgeAfter', 'gainAfter', 'loseAsyncAfter', 'addToExpansionAfter'],
                },
                direct: true,
                filter(event, player) {
                    return game.hasPlayer(function (current) {
                        var evt = event.getl(current);
                        return evt && (evt.xs.length > 0 || evt.ss.length > 0);
                    });
                },
                content() {
                    'step 0'
                    var list = [], choiceList = [
                        '令一名角色随机弃置一张牌',
                        '令一名角色失去1点体力',
                    ];
                    list.push('选项一', '选项二');
                    player.chooseControl(list, 'cancel2').set('choiceList', choiceList).set('ai', function () {
                        var player = _status.event.player;
                        if (game.hasPlayer(function (current) {
                            if (get.attitude(player, current) >= 0) return false;
                            return current.countCards('h') > 2;
                        }) && Math.random() < 0.8) return '选项一';
                        if (game.hasPlayer(function (current) {
                            if (get.attitude(player, current) >= 0) return false;
                            return get.effect(current, { name: 'losehp' }, player, player);
                        }) && Math.random() < 0.8) return '选项二';
                        return 'cancel2';
                    }).set('prompt', get.prompt('zshy_liangyin'));
                    'step 1'
                    if (result.control != 'cancel2') {
                        event.control = result.control;
                        if (event.control == '选项一') {
                            player.chooseTarget(get.prompt('zshy_liangyin'), '令一名角色随机弃置一张牌').set('ai', function (target) {
                                var player = _status.event.player;
                                if (get.attitude(player, target) >= 0) return false;
                                return (target.countCards('h') > 0);
                            });
                        }
                        else {
                            player.chooseTarget(get.prompt('zshy_liangyin'), '令一名角色失去1点体力').set('ai', function (target) {
                                var player = _status.event.player;
                                if (get.attitude(player, target) >= 0) return false;
                                return get.effect(target, { name: 'losehp' }, player, player);
                            });
                        }
                    }
                    else event.finish();
                    'step 2'
                    if (result.bool) {
                        var target = result.targets[0];
                        player.logSkill('zshy_liangyin', target);
                        if (event.control == '选项一') {
                            target.randomDiscard('he', 1, true);
                        }
                        else {
                            target.loseHp();
                        }
                    }
                    else event.goto(0);
                },
            },
        },
    },
    zshy_kongsheng: {//箜声
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'phaseZhunbeiBegin' },
        filter(event, player) {
            return player.countCards('he') > 0;
        },
        async cost(event, trigger, player) {
            event.result = await player
                .chooseCard('he', [1, player.countCards('he')], get.prompt('zshy_kongsheng'), '将任意张牌作为「箜」置于武将牌上')
                .set('ai', function (card) {
                    const player = _status.event.player,
                        num = player.getExpansions('zshy_kongsheng') + ui.selected.cards.length;
                    if (
                        ui.selected.cards.length > 0 &&
                        game.hasPlayer(function (current) {
                            if (current.isHealthy() || get.recoverEffect(current, player, player) <= 0) return false;
                            const num2 =
                                current.countCards('h', function (card) {
                                    if (current != player) return true;
                                    return !ui.selected.cards.includes(card);
                                }) + 1;
                            return num == num2;
                        })
                    )
                        return 0;
                    if (get.type(card, null, false) == 'equip') {
                        for (const i of ui.selected.cards) {
                            if (get.type(i, null, false) == 'equip') return 0;
                        }
                        return 5 - get.value(card);
                    }
                    if (!player.hasValueTarget(card)) return 1;
                    return 0;
                })
                .forResult();
        },
        async content(event, trigger, player) {
            const next = player.addToExpansion(event.cards, player, 'give');
            next.gaintag.add('zshy_kongsheng');
            await next;
        },
        onremove(player, skill) {
            const cards = player.getExpansions(skill);
            if (cards.length) player.loseToDiscardpile(cards);
        },
        intro: {
            content: 'expansion',
            markcount: 'expansion',
        },
        group: 'zshy_kongsheng_kessoku',
        subSkill: {
            kessoku: {
                trigger: { player: 'phaseJieshuBegin' },
                forced: true,
                locked: false,
                async content(event, trigger, player) {
                    let cards = player.getExpansions('zshy_kongsheng').filter(function (card) {
                        return get.type(card, null, false) != 'equip';
                    });
                    if (cards.length) {
                        await player.gain(cards, 'gain2');
                    };
                    cards = player.getExpansions('zshy_kongsheng');
                    if (cards.length <= 0) return;
                    const result = await player.chooseTarget(true, '令一名角色使用以下装备牌', get.translation(cards)).set('ai', function (target) {
                        const player = _status.event.player;
                        return get.effect(target, { name: 'losehp' }, player, player);
                    }).forResult();
                    const target = result.targets[0];
                    player.line(target, 'green');
                    while (true) {
                        const cards = player.getExpansions('zshy_kongsheng').filter(function (i) {
                            return target.hasUseTarget(i);
                        });
                        if (cards.length) {
                            let card = cards[0];
                            if (cards.length > 1) {
                                const result = await target.chooseButton(true, ['选择要使用的装备牌', cards]).set('ai', function (button) {
                                    return get.order(button.link);
                                }).forResult();
                                if (!result.bool) break;
                                card = result.links[0];
                            }
                            await target.chooseUseTarget(card, true);
                        } else break;
                    }
                    await target.loseHp();
                },
            },
        },
    },

    zshy_zhengrong: {//征荣
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'useCardToTargeted',
        },
        filter(event, player, target) {
            if (event.target == player) return false;
            return event.target.countGainableCards(player, 'hej');
        },
        prompt2(event, player) {
            return '是否获得' + get.translation(event.target) + '一张牌？'
        },
        check(event, player) {
            return get.attitude(player, event.target) < 0;
        },
        content() {
            'step 0'
            player.gainPlayerCard(trigger.target, 'hej', true);
            'step 1'
            if (!player.countCards('hes')) event.finish();
            else {
                player.chooseCard('hes', '将一张牌置于武将牌上，称为「荣」', true).set('ai', function (card) {
                    return 6 - get.value(card);
                });
            }
            'step 2'
            if (result.cards && result.cards.length) player.addToExpansion(result.cards, player, 'give').gaintag.add('zshy_zhengrong');
        },
        marktext: '荣',
        intro: {
            content: 'expansion',
            markcount: 'expansion',
        },
        onremove(player, skill) {
            var cards = player.getExpansions(skill);
            if (cards.length) player.loseToDiscardpile(cards);
        },
    },
    zshy_hongju: {//鸿举
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'zshy_zhengrongAfter',
        },
        forced: true,
        unique: true,
        juexingji: true,
        skillAnimation: true,
        animationColor: 'thunder',
        derivation: ['zshy_qingce', 'zshy_saotao'],
        filter(event, player) {
            return player.getExpansions('zshy_zhengrong').length >= player.maxHp;
        },
        content() {
            'step 0'
            player.awakenSkill('zshy_hongju');
            player.chooseDrawRecover(2, true);
            'step 1'
            player.addSkillLog('zshy_qingce');
        },
    },
    zshy_qingce: {//清侧
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        filter(event, player) {
            return player.getExpansions('zshy_zhengrong').length > 0;
        },
        content() {
            'step 0'
            var cards = player.getExpansions('zshy_zhengrong');
            if (cards.length == 1) event._result = { bool: true, links: cards };
            else player.chooseCardButton('请选择要获得的一张「荣」', cards, true);
            'step 1'
            if (result.bool) player.gain(result.links, player, 'giveAuto');
            'step 2'
            player.chooseTarget(get.prompt('zshy_qingce'), '选择一名其他角色对其造成1点伤害', function (card, player, target) {
                return target != player;
            }).set('ai', function (target) {
                var player = _status.event.player;
                return get.damageEffect(target, player, player);
            });
            'step 3'
            if (result.bool) {
                player.line(result.targets[0], 'wood');
                result.targets[0].damage();
            }
        },
        ai: {
            order() {
                return [5, 7, 9].randomGet();
            },
            result: {
                player(player) {
                    var num = player.getExpansions('zshy_zhengrong').length;
                    if (game.hasPlayer(function (current) {
                        return get.damageEffect(current, player, player) > 0;
                    }) && !player.hasSkill('zshy_qingce_damage')) return 2;
                    if (player.countCards('h') < player.hp || num > 5) return 1;
                    return 0;
                },
            },
        },
        group: 'zshy_qingce_Change',
        subSkill: {
            Change: {
                sub: true,
                audio: 'zshy_qingce',
                trigger: {
                    player: 'gainAfter',
                },
                usable: 1,
                filter(event, player) {
                    return player.getExpansions('zshy_zhengrong').length && player.countCards('he');
                },
                prompt2(event, player) {
                    return '是否用任意数量的牌交换等量的「荣」？'
                },
                content() {
                    'step 0'
                    var cards = player.getExpansions('zshy_zhengrong');
                    var next = player.chooseToMove('清侧：你可以用任意数量的牌交换等量的「荣」');
                    next.set('list', [
                        [get.translation(player) + '的「荣」', cards],
                        ['手牌和装备区', player.getCards('he')],
                    ]);
                    next.set('filterMove', function (from, to) {
                        return typeof to != 'number';
                    });
                    next.set('processAI', function (list) {
                        var player = _status.event.player, cards = list[0][1].concat(list[1][1]).sort(function (a, b) {
                            return get.value(a) - get.value(b);
                        }), cards2 = cards.splice(0, player.getExpansions('zshy_zhengrong').length);
                        return [cards2, cards];
                    });
                    'step 1'
                    if (result.bool) {
                        var pushs = result.moved[0], gains = result.moved[1];
                        pushs.removeArray(player.getExpansions('zshy_zhengrong'));
                        gains.removeArray(player.getCards('he'));
                        if (!pushs.length || pushs.length != gains.length) return;
                        player.logSkill('zshy_qingce');
                        player.addToExpansion(pushs).gaintag.add('zshy_zhengrong');
                        player.gain(gains, 'gain2');
                    }
                },
            },
        },
    },

    zshy_qianjie: {//谦节
        audio: 'ext:诸神寰宇/audio/character:2',
        locked: true,
        ai: {
            effect: {
                target(card) {
                    if (card.name == 'tiesuo') return 'zeroplayertarget';
                },
            },
        },
        group: ['zshy_qianjie_1', 'zshy_qianjie_2', 'zshy_qianjie_3'],
        subSkill: {
            1: {
                audio: 'zshy_qianjie',
                trigger: {
                    player: 'linkBegin',
                },
                forced: true,
                filter(event, player) {
                    return !player.isLinked();
                },
                async content(event, trigger, player) {
                    trigger.cancel();
                    player.draw();
                },
            },
            2: {
                mod: {
                    targetEnabled(card, player, target) {
                        if (get.type(card) == 'delay') return false;
                    },
                },
            },
            3: {
                ai: { noCompareTarget: true },
            },
        },
    },
    zshy_jueyan: {//决堰
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        derivation: 'zshy_jizhi',
        filter(event, player) {
            return player.hasEnabledSlot(1) || player.hasEnabledSlot(2) || player.hasEnabledSlot(5) || player.hasEnabledSlot('horse');
        },
        async content(event, trigger, player) {
            const { control } = await player
                .chooseToDisable(true)
                .set('ai', function (event, player, list) {
                    if (list.includes('equip2')) return 'equip2';
                    if (
                        list.includes('equip1') &&
                        player.countCards('h', function (card) {
                            return get.name(card, player) == 'sha' && player.hasUseTarget(card);
                        }) -
                        player.getCardUsable('sha') >
                        1
                    )
                        return 'equip1';
                    if (
                        list.includes('equip5') &&
                        player.countCards('h', function (card) {
                            return get.type2(card, player) == 'trick' && player.hasUseTarget(card);
                        }) > 1
                    )
                        return 'equip5';
                })
                .forResult();
            switch (control) {
                case 'equip1':
                    player.addSkill('zshy_jueyan_1');
                    break;
                case 'equip2':
                    player.draw(player.maxHp);
                    player.addSkill('zshy_jueyan_3');
                    break;
                case 'equip3_4':
                    player.addSkill('zshy_jueyan_2');
                    break;
                case 'equip5':
                    player.addSkill('zshy_jizhi');
                    break;
            }
        },
        ai: {
            order: 13,
            result: {
                player(player) {
                    if (player.hasEnabledSlot('equip2')) return 1;
                    if (
                        player.hasEnabledSlot('equip1') &&
                        player.countCards('h', function (card) {
                            return get.name(card, player) == 'sha' && player.hasValueTarget(card);
                        }) -
                        player.getCardUsable('sha') >
                        1
                    )
                        return 1;
                    if (
                        player.hasEnabledSlot('equip5') &&
                        player.countCards('h', function (card) {
                            return get.type2(card, player) == 'trick' && player.hasUseTarget(card);
                        }) > 1
                    )
                        return 1;
                    return -1;
                },
            },
        },
        subSkill: {
            1: {
                charlotte: true,
                mod: {
                    cardUsable(card, player, num) {
                        if (card.name == 'sha') return num + player.maxHp;
                    },
                },
            },
            2: {
                charlotte: true,
                mod: {
                    targetInRange(card, player, target, now) {
                        return true;
                    },
                },
            },
            3: {
                charlotte: true,
                mod: {
                    maxHandcard(player, num) {
                        return num + player.maxHp;
                    },
                },
            },
        },
    },
    zshy_poshi: {//破势
        audio: 'ext:诸神寰宇/audio/character:2',
        skillAnimation: true,
        animationColor: 'wood',
        trigger: {
            player: ['damageAfter', 'zshy_jueyanAfter'],
        },
        forced: true,
        unique: true,
        juexingji: true,
        derivation: ['zshy_huairou'],
        filter(event, player) {
            return !player.hasEnabledSlot() || player.hp == 1;
        },
        async content(event, trigger, player) {
            player.awakenSkill('zshy_poshi');
            const num = player.maxHp - player.countCards('h');
            if (num > 0) await player.draw(num);
            await player.changeSkills(['zshy_huairou'], ['zshy_jueyan']);
        },
    },
    zshy_huairou: {//怀柔
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        position: 'he',
        filter: (event, player) => player.hasCard(card => lib.skill.zshy_huairou.filterCard(card, player), lib.skill.zshy_huairou.position),
        filterCard: (card, player) => get.type(card) == 'equip' && player.canRecast(card),
        check(card) {
            if (get.position(card) == 'e') return 0.5 - get.value(card, get.player());
            if (!get.player().canEquip(card)) return 5;
            return 3 - get.value(card);
        },
        content() {
            'step 0'
            var num = player.countEnabledSlot() + 1;
            player.draw(num);
        },
        prompt: '请选择弃置的装备牌',
        ai: {
            order: 10,
            result: {
                player: 1,
            },
        },
    },

    zshy_xiongluan: {//雄乱
        audio: 'ext:诸神寰宇/audio/character:2',
        usable: 1,
        locked: false,
        unique: true,
        enable: 'phaseUse',
        mark: true,
        skillAnimation: true,
        animationColor: 'gray',
        filter(event, player) {
            return !player.isDisabledJudge() || player.hasEnabledSlot();
        },
        filterTarget(card, player, target) {
            return target != player;
        },
        content() {
            var list = [];
            for (var i = 1; i < 6; i++) {
                for (var j = 0; j < player.countEnabledSlot(i); j++) {
                    if (target.hasEnabledSlot(i)) list.add(i);
                }
            }
            var num = list.randomGet();
            target.disableEquip(num);
            player.disableJudge();
            player.draw(player.countCards('e'));
            player.addTempSkill('zshy_xiongluan_sub1');
            player.storage.zshy_xiongluan_sub1 = event.target;
            event.target.addSkill('zshy_xiongluan_sub2');
            event.target.markSkillCharacter('zshy_xiongluan_sub1', player, '雄乱', '无法使用或打出任何手牌');
        },
        mod: {
            aiOrder(player, card, num) {
                if (num <= 0 || !player.isPhaseUsing() || player.needsToDiscard() || !get.tag(card, 'damage')) return;
                return 0;
            },
            aiUseful(player, card, num) {
                if (num <= 0 || !get.tag(card, 'damage')) return;
                return num * player.getHp();
            },
        },
        ai: {
            order: 8,
            result: {
                player(card, player, target) {
                    if (get.type(card) == 'equip') return [99, 99];
                },
                target(player, target) {
                    if (get.attitude(player, target) < 0) return -13;
                },
            },
        },
        subSkill: {
            sub1: {
                charlotte: true,
                onremove(player) {
                    player.storage.zshy_xiongluan_sub1.removeSkill('zshy_xiongluan_sub2');
                    player.storage.zshy_xiongluan_sub1.unmarkSkill('zshy_xiongluan_sub1');
                    delete player.storage.zshy_xiongluan_sub1;
                },
                mod: {
                    targetInRange(card, player, target) {
                        if (target.hasSkill('zshy_xiongluan_sub2')) {
                            return true;
                        }
                    },
                    cardUsableTarget(card, player, target) {
                        if (target.hasSkill('zshy_xiongluan_sub2')) return true;
                    },
                },
            },
            sub2: {
                charlotte: true,
                trigger: { player: 'damageBegin4' },
                forced: true,
                content() {
                    trigger.num += trigger.source.countCards('e') + 1;
                },
                mod: {
                    cardEnabled2(card, player) {
                        if (get.position(card) == 'h') return false;
                    },
                },
                ai: {
                    effect: {
                        player(card, player, target) {
                            if (get.tag(card, 'damage') && target.hasSkill('zshy_xiongluan_sub1')) return [99, 99];
                        },
                    },
                },
            },
        },
    },
    zshy_congjian: {//从谏
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            target: 'useCardToTargeted',
        },
        filter(event, player, target) {
            return player.countCards('he') > 0;
        },
        async cost(event, trigger, player) {
            event.result = await player.chooseCardTarget({
                filterCard: true,
                selectCard: 1,
                position: 'he',
                filterTarget(card, player, target) {
                    return player != target;
                },
                ai1(card) {
                    if (card.name == 'du') return 20;
                    if (_status.event.player.storage.zshy_xiongluan && get.type(card) == 'equip') return 15;
                    return 6 - get.value(card);
                },
                ai2(target) {
                    const att = get.attitude(_status.event.player, target);
                    if (ui.selected.cards.length && ui.selected.cards[0].name == 'du') {
                        if (target.hasSkillTag('nodu')) return 0.1;
                        return 1 - att;
                    }
                    return att - 3;
                },
                prompt: get.prompt2('zshy_congjian'),
                targets: trigger.targets,
            }).forResult();
        },
        async content(event, trigger, player) {
            const target = event.targets[0];
            player.give(event.cards, target, 'give');
            player.draw(2);
            if (get.type(event.cards[0]) == 'equip') {
                player.chooseDrawRecover(true);
            }
        },
    },

    zshy_duorui: {//夺锐
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: ['phaseBefore'],
        },
        locked: true,
        charlotte: true,
        filter(event, player) {
            if (event.player == player) return false;
            var list = [];
            var listm = [];
            var listv = [];
            if (event.player.name1 != undefined) listm = get.character(event.player.name1)[3];
            else listm = get.character(event.player.name)[3];
            if (event.player.name2 != undefined) listv = get.character(event.player.name2)[3];
            listm = listm.concat(listv);
            var func = function (skill) {
                var info = get.info(skill);
                if (!info || info.charlotte || info.persevereSkill) return false;
                return true;
            };
            for (var i = 0; i < listm.length; i++) {
                if (func(listm[i])) list.add(listm[i]);
            }
            return list.length > 0;
        },
        check(event, player) {
            return get.attitude(player, event.player) < 0;
        },
        prompt2(event, player, target) {
            return '令' + get.translation(event.player) + '的一个非状态技失效';
        },
        logTarget: 'player',
        content() {
            'step 0'
            var list = [];
            var listm = [];
            var listv = [];
            if (trigger.player.name1 != undefined) listm = get.character(trigger.player.name1)[3];
            else listm = get.character(trigger.player.name)[3];
            if (trigger.player.name2 != undefined) listv = get.character(trigger.player.name2)[3];
            listm = listm.concat(listv);
            var func = function (skill) {
                var info = get.info(skill);
                if (!info || info.charlotte || info.persevereSkill) return false;
                return true;
            };
            for (var i = 0; i < listm.length; i++) {
                if (func(listm[i])) list.add(listm[i]);
            }
            event.skills = list;
            player.chooseControl(list).set('prompt', '选择' + get.translation(trigger.player) + '武将牌上的一个技能并令其失效');
            'step 1'
            if (result.bool != 'cancel2') {
                trigger.player.disableSkill('zshy_duorui_gain', result.control);
                trigger.player.addTempSkill('zshy_duorui_gain', { player: 'phaseAfter' });
                game.log(player, '选择了', trigger.player, '的技能', '#g【' + get.translation(result.control) + '】');
            } else event.finish();
        },
        group: ['zshy_duorui_damage'],
        subSkill: {
            damage: {
                audio: 'zshy_duorui',
                trigger: {
                    source: 'damageBefore',
                },
                direct: true,
                charlotte: true,
                content() {
                    'step 0'
                    var target = trigger.player, list = [], choiceList = [
                        '获得并失效' + get.translation(target) + '武将牌1个技能',
                        '移除' + get.translation(target) + '武将牌1个技能',
                        '减少其1点体力上限',
                    ];
                    event.list1 = target.getSkills(true, false).filter(skill => {
                        if (skill == 'jiu') return false;
                        if (player.hasSkill(skill)) return false;
                        if (!lib.translate[skill + '_info']) return false;
                        if (lib.translate[skill + '_info'] == '') return false;
                        var info = get.info(skill);
                        if (!info) return false;
                        return true;
                    });
                    if (event.list1.length) list.push('选项一');
                    else choiceList[0] = '<span style="opacity:0.5">' + choiceList[0] + '</span>';
                    event.list2 = target.getSkills(true, false).filter(skill => {
                        if (skill == 'jiu') return false;
                        if (!lib.translate[skill + '_info']) return false;
                        if (lib.translate[skill + '_info'] == '') return false;
                        var info = get.info(skill);
                        if (!info) return false;
                        return true;
                    });
                    if (event.list2.length) list.push('选项二');
                    else choiceList[1] = '<span style="opacity:0.5">' + choiceList[1] + '</span>';
                    list.push('选项三');
                    player.chooseControl(list, 'cancel2').set('choiceList', choiceList).set('ai', function () {
                        var att = get.attitude(player, target);
                        if (att < 0) {
                            if (list.includes('选项一') && Math.random() < 0.7) return '选项一';
                            if (list.includes('选项二') && Math.random() < 0.7) return '选项二';
                            return '选项三';
                        }
                        return 'cancel2';
                    }).set('prompt', get.prompt('zshy_duorui'));
                    'step 1'
                    if (result.control != 'cancel2') {
                        var target = trigger.player;
                        event.target = target;
                        player.logSkill('zshy_duorui', target);
                        if (result.control == '选项三') {
                            target.loseMaxHp();
                            event.finish();
                        }
                        else if (result.control == '选项二') {
                            var lists = event.list2;
                            event.videoId = lib.status.videoId++;
                            var func = function (skills, id) {
                                var dialog = ui.create.dialog('forcebutton');
                                dialog.videoId = id;
                                dialog.add('夺锐：请选择要移除的1个技能');
                                for (var i = 0; i < skills.length; i++) {
                                    if (lib.translate[lists[i] + '_info']) {
                                        var translation = get.translation(lists[i]);
                                        if (translation[0] == '新' && translation.length == 3) translation = translation.slice(1, 3);
                                        else translation = translation.slice(0, 2);
                                        dialog.add('<div class="popup pointerdiv" style="width:80%;display:inline-block"><div class="skill">【' +
                                            get.translation(skills[i]) + '】</div><div>' + lib.translate[skills[i] + '_info'] + '</div></div>');
                                    }
                                }
                                dialog.addText('<br>');
                            }
                            if (player == game.me) func(lists, event.videoId);
                            player.chooseControl(lists, true).set('ai', function () {
                                return lists.randomGet();
                            });
                        }
                        else {
                            var lists = event.list1;
                            event.videoId = lib.status.videoId++;
                            var func = function (skills, id) {
                                var dialog = ui.create.dialog('forcebutton');
                                dialog.videoId = id;
                                dialog.add('夺锐：请选择要获得并失效的1个技能');
                                for (var i = 0; i < skills.length; i++) {
                                    if (lib.translate[lists[i] + '_info']) {
                                        var translation = get.translation(lists[i]);
                                        if (translation[0] == '新' && translation.length == 3) translation = translation.slice(1, 3);
                                        else translation = translation.slice(0, 2);
                                        dialog.add('<div class="popup pointerdiv" style="width:80%;display:inline-block"><div class="skill">【' +
                                            get.translation(skills[i]) + '】</div><div>' + lib.translate[skills[i] + '_info'] + '</div></div>');
                                    }
                                }
                                dialog.addText('<br>');
                            }
                            if (player == game.me) func(lists, event.videoId);
                            player.chooseControl(lists, true).set('ai', function () {
                                return lists.randomGet();
                            });
                            event.goto(3);
                        }
                    }
                    else event.finish();
                    'step 2'
                    game.broadcastAll('closeDialog', event.videoId);
                    var link = result.control;
                    target.popup(link);
                    target.removeSkill(link);
                    game.log(target, '失去了技能', '【' + get.translation(link) + '】');
                    event.finish();
                    'step 3'
                    game.broadcastAll('closeDialog', event.videoId);
                    var link = result.control;
                    player.addSkillLog(link);
                    target.disableSkill('zshy_duorui_gain', link);
                    target.addTempSkill('zshy_duorui_gain', { player: 'phaseBefore' });
                    game.log(target, '失效了技能', '【' + get.translation(link) + '】');
                },
            },
            gain: {
                onremove(player, skill) {
                    player.enableSkill(skill);
                },
                locked: true,
                mark: true,
                charlotte: true,
                intro: {
                    content(storage, player, skill) {
                        var list = [];
                        for (var i in player.disabledSkills) {
                            if (player.disabledSkills[i].includes(skill)) list.push(i);
                        }
                        if (list.length) {
                            var str = '失效技能：';
                            for (var i = 0; i < list.length; i++) {
                                if (lib.translate[list[i] + '_info']) str += get.translation(list[i]) + '、';
                            }
                            return str.slice(0, str.length - 1);
                        }
                    },
                },
            },
        },
    },
    zshy_zhiti: {//止啼
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'phaseEnd',
        },
        direct: true,
        filter(event, player) {
            if (event.player == player) return player.countDisabled() > 0;
            return event.player.isIn();
        },
        content() {
            'step 0'
            var target = trigger.player;
            var att = get.attitude(player, target);
            var list = [], choiceList = [
                '令' + get.translation(target) + '复原1个装备栏',
                '令' + get.translation(target) + '废除1个装备栏',
            ];
            if (target.countDisabled() > 0) list.push('选项一');
            else choiceList[0] = '<span style="opacity:0.5">' + choiceList[0] + '</span>';
            if (target.hasEnabledSlot()) list.push('选项二');
            else choiceList[1] = '<span style="opacity:0.5">' + choiceList[1] + '</span>';
            player.chooseControl(list, 'cancel2').set('choiceList', choiceList).set('ai', function () {
                if (list.includes('选项一')) {
                    if (att > 0) return '选项一';
                }
                if (list.includes('选项二')) {
                    if (att < 0) return '选项二';
                }
                return 'cancel2';
            }).set('prompt', get.prompt('zshy_zhiti'));
            'step 1'
            if (result.control != 'cancel2') {
                player.logSkill('zshy_zhiti', trigger.player);
                if (result.control == '选项一') {
                    trigger.player.chooseToEnable();
                }
                else trigger.player.chooseToDisable();
            }
        },
        group: 'zshy_zhiti_Attack',
        subSkill: {
            Attack: {
                sub: true,
                audio: 'zshy_zhiti',
                trigger: {
                    global: 'phaseDrawBegin',
                },
                direct: true,
                filter(event, player) {
                    return !event.numFixed;
                },
                content() {
                    'step 0'
                    player.draw();
                    if (player.countCards('h')) {
                        player.chooseToUse({
                            filterCard(card) {
                                if (get.itemtype(card) != 'card' || get.position(card) != 'h' && get.position(card) != 's') return false;
                                return lib.filter.filterCard.apply(this, arguments);
                            },
                            prompt: '止啼：是否使用一张手牌？'
                        });
                    }
                    else event.finish();
                    'step 1'
                    if (result.bool) {
                        trigger.num--;
                    };
                },
            },
        },
    },

    zshy_poxi: {//魄袭
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        usable: 1,
        filterTarget(card, player, target) {
            return target.countCards('hej');
        },
        content() {
            'step 0'
            event.list1 = [];
            event.list2 = [];
            if (player.countCards('hej')) {
                var chooseButton = player.chooseButton([1, 5], ['你区域的牌', player.getCards('hej'), get.translation(target) + '区域的牌', target.getCards('hej')]);
            }
            else var chooseButton = player.chooseButton([1, 5], [get.translation(target) + '区域的牌', target.getCards('hej')]);
            chooseButton.set('target', target);
            chooseButton.set('ai', function (button) {
                var player = _status.event.player;
                var target = _status.event.target;
                var ps = [], ts = [];
                for (var i = 0; i < ui.selected.buttons.length; i++) {
                    var card = ui.selected.buttons[i].link;
                    if (target.getCards('hej').includes(card)) ts.push(card);
                    else ps.push(card);
                }
                var card = button.link;
                var owner = get.owner(card);
                var val = get.value(card) || 1;
                if (owner == target) {
                    if (ts.length > 1) return 0;
                    if (ts.length == 0 || player.hp > 3) return val;
                    return 2 * val;
                }
                return 7 - val;
            });
            chooseButton.set('filterButton', function (button) {
                for (var i = 0; i < ui.selected.buttons.length; i++) {
                    if (get.suit(button.link) == get.suit(ui.selected.buttons[i].link)) return false;
                }
                return true;
            });
            'step 1'
            if (result.bool) {
                var list = result.links;
                for (var i = 0; i < list.length; i++) {
                    if (get.owner(list[i]) == player) {
                        event.list1.push(list[i]);
                    }
                    else event.list2.push(list[i]);
                }
                if (event.list1.length && event.list2.length) {
                    game.loseAsync({
                        lose_list: [
                            [player, event.list1],
                            [target, event.list2],
                        ],
                        discarder: player,
                    }).setContent('discardMultiple');
                }
                else if (event.list2.length) target.discard(event.list2, true);
                else player.discard(event.list1, true);
            }
            else event.finish();
            'step 2'
            var num = event.list1.length + event.list2.length;
            if (num > 0) {
                if (num >= 5) player.gainMaxHp();
                if (num >= 4) player.insertPhase();
                if (num >= 3) player.skip('phaseDiscard');
                if (num >= 2) player.recover();
                if (num >= 1) player.draw(2);
            }
        },
        ai: {
            order: 12,
            result: {
                target: -1,
            },
        },
    },
    zshy_SGNjieying: {//劫营
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'phaseZhunbeiBegin',
        },
        forced: true,
        content() {
            player.addMark('zshy_SGNjieying_Mark', 1, false);
            player.addSkill('zshy_SGNjieying_Mark');
        },
        group: ['zshy_SGNjieying_Jieshu', 'zshy_SGNjieying_After', 'zshy_SGNjieying_Die'],
        subSkill: {
            Jieshu: {
                trigger: {
                    player: 'phaseJieshuBegin',
                },
                direct: true,
                filter(event, player) {
                    return player.hasMark('zshy_SGNjieying_Mark');
                },
                content() {
                    'step 0'
                    var num = player.countMark('zshy_SGNjieying_Mark'), str = '交给至多' + num + '名其他角色各1枚「营」';
                    player.chooseTarget(get.prompt('zshy_SGNjieying'), str, [1, num], function (card, player, target) {
                        return target != player;
                    }).ai = function (target) {
                        var att = get.attitude(player, target);
                        if (att < 0) {
                            if (target.hasMark('zshy_SGNjieying_Mark')) return 0;
                            if (target.isTurnedOver() || target.countCards('he') < 2) return 0.2;
                            if (target.countCards('he') && target.countCards('j', { name: 'lebu' })) return target.countCards('he') * 0.8 + target.getHandcardLimit() * 0.7 + 2;
                            return target.countCards('h') * 0.8 + target.getHandcardLimit() * 0.7;
                        }
                        if (att > 0) {
                            if (!target.hasMark('zshy_SGNjieying_Mark')) return 0.1;
                            return 0;
                        }
                        return 0;
                    };
                    'step 1'
                    if (result.bool) {
                        var targets = result.targets.sortBySeat();
                        player.logSkill('zshy_SGNjieying', targets);
                        for (var i of targets) {
                            player.removeMark('zshy_SGNjieying_Mark', 1);
                            i.addMark('zshy_SGNjieying_Mark', 1, false);
                            i.addSkill('zshy_SGNjieying_Mark');
                        }
                    }
                },
            },
            After: {
                audio: 'zshy_SGNjieying',
                trigger: {
                    global: 'phaseAfter',
                },
                check(event, player) {
                    return get.effect(event.player, { name: 'shunshou_copy2' }, player, player) > 0;
                },
                filter(event, player) {
                    return event.player.hasMark('zshy_SGNjieying_Mark') && event.player.isAlive() && event.player != player;
                },
                logTarget: 'player',
                prompt2(event, player) {
                    var str = '获得' + get.translation(event.player) + '1枚「营」';
                    if (event.player.countGainableCards(player, 'hej') && event.player != player) str += '然后获得其区域内任意张牌';
                    return str;
                },
                content() {
                    'step 0'
                    var target = trigger.player;
                    var num = target.countCards('hej');
                    target.removeMark('zshy_SGNjieying_Mark', 1);
                    player.addMark('zshy_SGNjieying_Mark', 1, false);
                    if (num > 0) player.gainPlayerCard(target, 'hej', [1, num]);
                },
            },
            Die: {
                sub: true,
                trigger: {
                    player: 'dieBegin',
                },
                direct: true,
                filter(event, player) {
                    return game.hasPlayer(function (current) {
                        return current.hasMark('zshy_SGNjieying_Mark');
                    });
                },
                content() {
                    'step 0'
                    var str = '令一名其他角色获得你所有的「营」';
                    player.chooseTarget(get.prompt('zshy_SGNjieying'), str, [1, 1], function (card, player, target) {
                        return target != player;
                    }).ai = function (target) {
                        return get.attitude(player, target);
                    };
                    'step 1'
                    if (result.bool) {
                        var num = player.countMark('zshy_SGNjieying_Mark');
                        player.removeMark('zshy_SGNjieying_Mark', num);
                        var targets = result.targets.sortBySeat();
                        player.logSkill('zshy_SGNjieying', targets);
                        for (var i of targets) {
                            i.addMark('zshy_SGNjieying_Mark', num);
                        }
                    }
                    else return;
                    'step 2'
                    var str = '令任意名有「营」的其他角色弃置所有「营」和所有牌';
                    player.chooseTarget(get.prompt('zshy_SGNjieying'), str, [1, Infinity], function (card, player, target) {
                        return target != player && target.hasMark('zshy_SGNjieying_Mark');
                    }).ai = function (target) {
                        return -get.attitude(player, target);
                    };
                    'step 3'
                    if (result.bool) {
                        var targets = result.targets.sortBySeat();
                        player.logSkill('zshy_SGNjieying', targets);
                        for (var i of targets) {
                            var num = i.countMark('zshy_SGNjieying_Mark');
                            i.removeMark('zshy_SGNjieying_Mark', num);
                            i.discard(i.getCards('he'), true);
                        }
                    }
                },
            },
            Mark: {
                sub: true,
                onremove: true,
                charlotte: true,
                audio: 'zshy_SGNjieying',
                marktext: '营',
                markimage: 'extension/诸神寰宇/other/Files/Mark/zshy_SGNjieying.png',
                intro: {
                    name2:  '营',
                    content: 'mark',
                },
                mod: {
                    cardUsable(card, player, num) {
                        if (card.name == 'sha') return num + player.countMark('zshy_SGNjieying_Mark');
                    },
                    maxHandcard(player, num) {
                        return num + player.countMark('zshy_SGNjieying_Mark');
                    },
                },
                trigger: {
                    player: 'phaseDrawBegin2'
                },
                forced: true,
                filter(event, player) {
                    return !event.numFixed && player.hasMark('zshy_SGNjieying_Mark');
                },
                content() {
                    trigger.num += player.countMark('zshy_SGNjieying_Mark');
                },
                ai: {
                    nokeep: true,
                    skillTagFilter(player) {
                        if (!game.hasPlayer(function (current) {
                            return get.attitude(player, current) < 0 && current.hasSkill('zshy_SGNjieying');
                        })) return false;
                    },
                },
            },
        },
    },

};

const skill_AC = {
    ...其疾如风, ...侵略如火, ...其徐如林, ...不动如山, ...难知如阴, ...动如雷震,
};

export default skill_AC;
