import { lib, game, ui, get, ai, _status } from '../../../../noname.js'
const 文德武备理 = {
    //墟晋司马懿
    zshy_buchen: {//不臣
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'showCharacterAfter',
        },
        hiddenSkill: true,
        async cost(event, trigger, player) {
            event.result = await player.chooseTarget(get.prompt('zshy_buchen'), [1, Infinity], function (card, player, target) {
                return target.countGainableCards(player, 'hej') && target != player;
            }, '获得任意名其他角色区域内各一张牌').set('ai', function (target) {
                var player = _status.event.player;
                return get.effect(target, { name: 'shunshou_copy2' }, player, player) > 0;
            }).forResult();
        },
        async content(event, trigger, player) {
            let targets = event.targets.sortBySeat();
            player.line(targets, 'thunder');
            for (let i of targets) {
                player.gainPlayerCard(i, 'hej', true);
            }
        },
    },
    zshy_yingshi: {//鹰视
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: `phaseBegin`,
        },
        forced: true,
        firstDo: true,
        async content(event, trigger, player) {
            player.addSkill('zshy_yingshi_look');
        },
        subSkill: {
            look: {
                charlotte: true,
                mark: true,
                marktext: '鹰视',
                intro: {
                    mark(dialog, content, player) {
                        if (player != game.me) return '◇' + get.translation(player) + '观看牌堆中';
                        var list = [];
                        var num1 = 4;
                        var num2 = Math.min(num1, ui.cardPile.childElementCount);
                        for (var i = 0; i < num2; i++) {
                            list.push(ui.cardPile.childNodes[i]);
                        }
                        dialog.addSmall(list);
                    },
                },
            },
        },
    },
    zshy_xiongzhi: {//雄志
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        usable: 1,
        skillAnimation: true,
        animationColor: 'thunder',
        content(event) {
            'step 0'
            var card = get.cards()[0];
            event.card = card;
            player.showCards(card);
            if (!player.hasUseTarget(card)) {
                card.fix();
                ui.cardPile.insertBefore(card, ui.cardPile.firstChild);
                game.updateRoundNumber();
                player.gain(card);
                event.finish();
            }
            'step 1'
            var next = player.chooseUseTarget(card, true);
            if (get.info(card).updateUsable == 'phaseUse') next.addCount = false;
            'step 2'
            if (result.bool) event.goto(0);
            else {
                card.fix();
                ui.cardPile.insertBefore(card, ui.cardPile.firstChild);
                game.updateRoundNumber();
            }
        },
        ai: {
            order: 1,
            result: {
                player(player) {
                    if (!player.hasSkill('zshy_yingshi')) return 1;
                    let cards = [];
                    for (let i = 0; i < Math.min(2, player.maxHp); i++) {
                        let card = ui.cardPile.childNodes[i];
                        if (card) {
                            if (!player.hasValueTarget(card)) return 0;
                        } else break;
                    }
                    return 1;
                },
            },
        },
    },
    zshy_quanbian: {//权变
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: ['useCard', 'respond'],
        },
        frequent: true,
        preHidden: true,
        content() {
            'step 0'
            var cards = get.cards(4);
            game.cardsGotoOrdering(cards);
            var suit = get.suit(trigger.card);
            var next = player.chooseToMove('权变：可获得一张牌并排列其他牌，若获得牌，则你回复1点体力');
            next.set('suit', suit);
            next.set('list', [['牌堆顶', cards], ['获得']]);
            next.set('filterMove', function (from, to, moved) {
                if (moved[0].includes(from.link)) {
                    if (typeof to == 'number') {
                        if (to == 1) {
                            if (moved[1].length) return false;
                            return true;
                        }
                        return true;
                    }
                    if (moved[1].includes(to.link)) return true;
                    return true;
                } else {
                    if (typeof to == 'number') return true;
                    return true;
                }
            });
            next.set('processAI', function (list) {
                var cards = list[0][1].slice(0).sort(function (a, b) {
                    return get.value(b) - get.value(a);
                }),
                    gains = [];
                for (var i of cards) {
                    if (get.suit(i, false) != _status.event.suit) {
                        cards.remove(i);
                        gains.push(i);
                        break;
                    }
                }
                return [cards, gains];
            });
            'step 1'
            if (result.bool) {
                var list = result.moved;
                if (list[1].length) {
                    player.gain(list[1], 'gain2');
                    player.recover();
                }
                while (list[0].length) {
                    ui.cardPile.insertBefore(list[0].pop(), ui.cardPile.firstChild);
                }
                game.updateRoundNumber();
            }
        },
    },

    //墟晋张春华
    zshy_ZCHhuishi: {//慧识
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: 'phaseDrawBegin1' },
        filter(event, player) {
            return ui.cardPile.childElementCount % 10 > 0;
        },
        preHidden: true,
        frequent: true,
        prompt() {
            return get.prompt('zshy_ZCHhuishi') + '（当前牌堆尾数：' + (ui.cardPile.childElementCount % 10) + '）';
        },
        check(event, player) {
            return true;
        },
        content() {
            'step 0';
            var cards = game.cardsGotoOrdering(get.cards(ui.cardPile.childElementCount % 10)).cards;
            var num = Math.floor(cards.length / 2);
            var next = player.chooseToMove('慧识：将' + get.cnNumber(num) + '张牌置于牌堆底并获得其余的牌', true);
            next.set('list', [['牌堆顶的展示牌', cards], ['牌堆底']]);
            next.set('filterMove', function (from, to, moved) {
                if (moved[0].includes(from) && to == 1) return moved[1].length < _status.event.num;
                return true;
            });
            next.set('filterOk', function (moved) {
                return moved[1].length == _status.event.num;
            });
            next.set('num', num);
            next.set('processAI', function (list) {
                var cards = list[0][1].slice(0).sort(function (a, b) {
                    return get.value(b) - get.useful(a);
                });
                return [cards, cards.splice(cards.length - _status.event.num)];
            });
            'step 1';
            if (result.bool) {
                var list = result.moved;
                if (list[0].length) player.gain(list[0], 'gain2');
                while (list[1].length) ui.cardPile.appendChild(list[1].shift().fix());
            }
        },
    },
    zshy_qingleng: {//清冷
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: ['damageEnd', 'phaseJieshuBegin'] },
        preHidden: true,
        filter(event, player) {
            var target = event.player;
            return target != player && target.isIn() && !target.storage.nohp && player.countCards('he') > 0 && player.canUse({ name: 'sha', nature: 'ice' }, target, false);
        },
        async cost(event, trigger, player) {
            event.result = await player.chooseCard('he', get.prompt('zshy_qingleng', trigger.player), `将一张牌当做冰【杀】对${get.translation(trigger.player)}使用`, function (card, player) {
                return player.canUse(get.autoViewAs({ name: 'sha', nature: 'ice' }, [card]), _status.event.target, false);
            }).set('target', trigger.player).set('ai', function (card) {
                if (get.effect(_status.event.target, get.autoViewAs({ name: 'sha', nature: 'ice' }, [card]), player) <= 0) return false;
                return 6 - get.value(card);
            }).setHiddenSkill(event.name).forResult();
        },
        async content(event, trigger, player) {
            player.useCard(get.autoViewAs({ name: 'sha', nature: 'ice' }, event.cards), event.cards, false, trigger.player, 'zshy_qingleng');
            player.recover();
        },
    },
    zshy_xuanmu: {//宣穆
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'showCharacterAfter' },
        forced: true,
        locked: false,
        hiddenSkill: true,
        filter(event, player) {
            return true;
        },
        async content(event, trigger, player) {
            player.addTempSkill('zshy_xuanmu_damage', { global: 'roundEnd' });
        },
        subSkill: {
            damage: {
                audio: `zshy_xuanmu`,
                trigger: { player: 'damageBefore' },
                charlotte: true,
                forced: true,
                async content(event, trigger, player) {
                    trigger.cancel();
                },
                ai: {
                    effect: {
                        target(card, player, target) {
                            if (get.tag(card, 'damage') && !player.hasSkillTag('jueqing', false, target)) return 'zerotarget';
                        },
                    },
                },
            },
        },
    },

    //墟李肃
    zshy_qiaoyan: {//巧言
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: ['damageBegin2'],
        },
        forced: true,
        filter(event, player) {
            return event.source && event.source != player;
        },
        logTarget: 'source',
        content() {
            'step 0';
            var cards = player.getExpansions('zshy_qiaoyan');
            if (cards.length) {
                var source = trigger.source;
                source.gain(cards, player, 'give', 'bySelf');
                event.finish();
            } else {
                trigger.cancel();
                player.draw();
            }
            'step 1';
            var hs = player.getCards('he');
            if (!hs.length) event.finish();
            else if (hs.length == 1) event._result = { bool: true, cards: hs };
            else player.chooseCard('he', true, '将一张牌作为「珠」置于武将牌上');
            'step 2';
            if (result.bool && result.cards && result.cards.length) {
                var cards = result.cards;
                player.addToExpansion(cards, player, 'give').gaintag.add('zshy_qiaoyan');
            }
            event.finish();
        },
        marktext: '珠',
        intro: { content: 'expansion', markcount: 'expansion' },
        onremove(player, skill) {
            var cards = player.getExpansions(skill);
            if (cards.length) player.loseToDiscardpile(cards);
        },
        ai: {
            filterDamage: true,
            skillTagFilter(player, tag, arg) {
                if (!player.getExpansions('zshy_qiaoyan').length) return false;
                if (arg && arg.player) {
                    if (arg.player.hasSkillTag('jueqing', false, player)) return false;
                }
            },
        },
    },
    zshy_xianzhu: {//献珠
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: 'phaseUseBegin' },
        locked: true,
        filter(event, player) {
            return player.getExpansions('zshy_qiaoyan').length > 0;
        },
        async cost(event, trigger, player) {
            event.cards = player.getExpansions('zshy_qiaoyan');
            event.result = await player.chooseTarget(true, '请选择【献珠】的目标', '将' + get.translation(event.cards) + '交给一名角色。若该角色不为你自己，则你令其视为对其攻击范围内的另一名角色造成1点伤害')
                .set('ai', function (target) {
                    var player = _status.event.player;
                    var eff = get.sgn(get.attitude(player, target)) * get.value(_status.event.getParent().cards[0], target);
                    if (player != target)
                        eff += Math.max.apply(null, game.filterPlayer(function (current) {
                            if (current != target && player.inRange(current) && target.canUse('sha', current, false)) return true;
                        }).map(function (current) {
                            return get.damageEffect(current, target, player);
                        })
                        );
                    return eff;
                }).forResult();
        },
        content() {
            'step 0'
            event.cards = player.getExpansions('zshy_qiaoyan');
            event.target = targets[0];
            'step 1'
            player.give(cards, target, 'give');
            'step 2'
            if (player != target && target.isIn() && player.isIn() && game.hasPlayer(function (current) {
                return current != target && current != player;
            })) {
                var str = get.translation(target);
                player.chooseTarget(true, '选择一名角色，视为' + str + '对其造成1点伤害', function (card, player, target) {
                    var source = _status.event.target;
                    return target != source && target != player;
                }).set('target', target).set('ai', function (target) {
                    var evt = _status.event;
                    return get.damageEffect(target, evt.target, evt.player);
                });
            } else event.finish();
            'step 3';
            if (result.bool) result.targets[0].damage(target), player.draw();
        },
        ai: { combo: 'zshy_qiaoyan' },
        group: ['zshy_xianzhu_gain'],
        subSkill: {
            gain: {
                audio: 'zshy_qiaoyan',
                trigger: {
                    player: 'phaseBegin',
                },
                forced: true,
                content() {
                    'step 0'
                    player.draw();
                    player.recover();
                    'step 1';
                    var hs = player.getCards('he');
                    if (!hs.length) event.finish();
                    else if (hs.length == 1) event._result = { bool: true, cards: hs };
                    else player.chooseCard('he', true, '将一张牌作为「珠」置于武将牌上');
                    'step 2';
                    if (result.bool && result.cards && result.cards.length) {
                        var cards = result.cards;
                        player.addToExpansion(cards, player, 'give').gaintag.add('zshy_qiaoyan');
                    }
                    event.finish();
                },
            },
        },
    },

    zshy_caiwang: {//才望
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: ['useCard', 'respond'] },
        preHidden: true,
        filter(event, player) {
            if (!Array.isArray(event.respondTo) || event.respondTo[0] == event.player || ![event.respondTo[0], event.player].includes(player)) return false;
            if (get.color(event.card) != get.color(event.respondTo[1])) return true;
            const target = lib.skill.zshy_caiwang.logTarget(event, player);
            return target[player.getStorage('zshy_naxiang_sub').includes(target) ? 'countGainableCards' : 'countDiscardableCards'](player, 'he') > 0;
        },
        logTarget(event, player) {
            return player == event.respondTo[0] ? event.player : event.respondTo[0];
        },
        prompt2(event, player) {
            if (get.color(event.card) != get.color(event.respondTo[1])) return '回复1点体力或摸一张牌';
            const target = lib.skill.zshy_caiwang.logTarget(event, player);
            return (player.getStorage('zshy_naxiang_sub').includes(target) ? '获得' : '弃置') + '该角色的一张手牌或装备牌';
        },
        check(event, player) {
            if (get.color(event.card) != get.color(event.respondTo[1])) return true;
            const target = lib.skill.zshy_caiwang.logTarget(event, player);
            const name = player.getStorage('zshy_naxiang_sub').includes(target) ? 'shunshou_copy2' : 'guohe_copy2';
            return get.effect(target, { name }, player, player) > 0;
        },
        async cost(event, trigger, player) {
            if (get.color(trigger.card) != get.color(trigger.respondTo[1])) {
                event.result = { bool: true };
                return;
            }
            const target = lib.skill.zshy_caiwang.logTarget(trigger, player);
            event.result = await player.chooseBool(get.prompt('zshy_caiwang', target), lib.skill.zshy_caiwang.prompt2(trigger, player))
                .set('ai', () => lib.skill.zshy_caiwang.check(trigger, player))
                .forResult();
        },
        popup: false,
        async content(event, trigger, player) {
            const target = lib.skill.zshy_caiwang.logTarget(trigger, player);
            player.logSkill('zshy_caiwang', target);
            if (get.color(trigger.card) == get.color(trigger.respondTo[1])) {
                const gain = player.getStorage('zshy_naxiang_sub').includes(target);
                if (target[gain ? 'countGainableCards' : 'countDiscardableCards'](player, 'he') > 0) {
                    await player[gain ? 'gainPlayerCard' : 'discardPlayerCard'](target, 'he', true);
                }
            } else {
                await player.chooseDrawRecover(true);
            }
        },
        group: ['zshy_caiwang_hand', 'zshy_caiwang_equip', 'zshy_caiwang_judge'],
        subSkill: {
            hand: {
                audio: 'zshy_caiwang',
                enable: ['chooseToUse', 'chooseToRespond'],
                sourceSkill: 'zshy_caiwang',
                viewAsFilter(player) {
                    var js = player.getCards('h');
                    return js.length > 0 && game.checkMod(js[0], player, 'unchanged', 'cardEnabled2', player);
                },
                selectCard: -1,
                filterCard: true,
                position: 'h',
                prompt: '将全部手牌当做【闪】使用',
                viewAs: { name: 'shan' },
                check: card => 10 - get.value(card),
                ai: {
                    order: 1,
                    respondShan: true,
                },
            },
            equip: {
                audio: 'zshy_caiwang',
                enable: ['chooseToUse', 'chooseToRespond'],
                sourceSkill: 'zshy_caiwang',
                viewAsFilter(player) {
                    var js = player.getCards('e');
                    return js.length > 0 && game.checkMod(js[0], player, 'unchanged', 'cardEnabled2', player);
                },
                selectCard: -1,
                filterCard: true,
                check: card => 9 - get.value(card),
                position: 'e',
                prompt: '将装备区的所有牌当做【无懈可击】使用',
                viewAs: { name: 'wuxie' },
                ai: {
                    order: 1,
                },
            },
            judge: {
                audio: 'zshy_caiwang',
                enable: ['chooseToUse', 'chooseToRespond'],
                sourceSkill: 'zshy_caiwang',
                viewAsFilter(player) {
                    var js = player.getCards('j');
                    return js.length > 0 && game.checkMod(js[0], player, 'unchanged', 'cardEnabled2', player);
                },
                selectCard: -1,
                filterCard: true,
                position: 'j',
                prompt: '将判定区的牌当做【杀】使用',
                viewAs: { name: 'sha' },
                check: card => 1,
                locked: false,
                ai: {
                    order: 10,
                    respondSha: true,
                    skillTagFilter(player) {
                        return player.countCards('j') == 1;
                    },
                    effect: {
                        target_use(card, player, target, current) {
                            if (card && (card.name == 'shandian' || card.name == 'fulei') && player == target && !target.countCards('j') && target.isPhaseUsing() && target.hasValueTarget({ name: 'sha' }, null, true)) return [1, 2];
                        },
                    },
                },
                mod: {
                    aiOrder(player, card, num) {
                        if (card.name == 'shandian' || card.name == 'fulei') return num + 3;
                    },
                },
            },
        },
    },
    zshy_naxiang: {//纳降
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'damageEnd',
            source: 'damageSource',
        },
        forced: true,
        preHidden: true,
        filter(event, player) {
            var target = lib.skill.zshy_naxiang.logTarget(event, player);
            return target && target != player && target.isAlive();
        },
        logTarget(event, player) {
            return player == event.player ? event.source : event.player;
        },
        content() {
            player.addSkill('zshy_naxiang_sub');
            if (!player.storage.zshy_naxiang_sub) player.storage.zshy_naxiang_sub = [];
            player.storage.zshy_naxiang_sub.add(lib.skill.zshy_naxiang.logTarget(trigger, player));
            player.markSkill('zshy_naxiang_sub');
            player.draw();
        },
        ai: {
            combo: 'zshy_caiwang',
        },
        subSkill: {
            sub: {
                onremove: true,
                intro: {
                    content: '已接受$的投降；对这些角色发动〖才望〗时将“弃置”改为“获得”',
                },
            },
        },
    },

    zshy_chexuan: {//车悬
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'phaseBegin',
        },
        frequent: true,
        derivation: ['zshy_AAZZchelijiWDWB_sichengliangyu', 'zshy_AAZZchelijiWDWB_tiejixuanyu', 'zshy_AAZZchelijiWDWB_feilunzhanyu'],
        filter(event, player) {
            return !player.getEquips(5).length;
        },
        content() {
            'step 0'
            player.chooseButton(['请选择要装备的宝物', [lib.skill.zshy_chexuan.derivation.map(
                function (i) { return ['宝物', '', i]; }), 'vcard',
            ],], true).set('ai', function (button) {
                if (button.link[2] == 'zshy_AAZZchelijiWDWB_sichengliangyu' && player.countCards('h') < player.hp) return 1;
                return Math.random();
            });
            'step 1'
            var name = result.links[0][2], card = game.createCard(name, lib.card[name].cardcolor, 5);
            player.$gain2(card);
            player.equip(card);
            game.delay();
        },
        group: 'zshy_chexuan_lose',
        subfrequent: ['lose'],
        ai: {
            order: 6,
            result: {
                player: 1,
            },
        },
        subSkill: {
            lose: {
                audio: 'zshy_chexuan',
                trigger: {
                    player: 'loseAfter',
                    global: ['equipAfter', 'addJudgeAfter', 'gainAfter', 'loseAsyncAfter', 'addToExpansionAfter'],
                },
                frequent: true,
                filter(event, player) {
                    var evt = event.getl(player);
                    if (!evt || !evt.es || !evt.es.length) {
                        return false;
                    }
                    if (event.name == 'equip' && event.player == player) {
                        return false;
                    }
                    for (var i of evt.es) {
                        if (get.subtype(i, false) == 'equip5') return true;
                    }
                    return false;
                },
                content() {
                    const name = lib.skill.zshy_chexuan.derivation.randomGet(),
                        card = game.createCard(name, lib.card[name].cardcolor, 5);
                    player.$gain2(card);
                    player.equip(card);
                    game.delay();
                },
            },
        },
    },
    zshy_qiangshou: {//羌首
        mod: {
            globalFrom(player, target, distance) {
                if (player.countCards('e') > 0) return distance - player.countCards('e');
            },
        },
        ai: {
            combo: 'zshy_chexuan',
        },
    },
    zshy_AAZZchelijiWDWB_sichengliangyu: {//四乘粮舆
        trigger: { global: 'phaseJieshuBegin' },
        equipSkill: true,
        cardcolor: 'heart',
        filter(event, player) {
            return player.getEquip('zshy_AAZZchelijiWDWB_sichengliangyu');
        },
        check(event, player) {
            return get.attitude(player, event.player) > 1;
        },
        content() {
            'step 0';
            trigger.player.draw(2);
            trigger.player.recover();
            'step 1';
            var card = player.getEquip('zshy_AAZZchelijiWDWB_sichengliangyu');
            if (card) player.discard(card);
        },
    },
    zshy_AAZZchelijiWDWB_tiejixuanyu: {//铁蒺玄舆
        trigger: { global: 'phaseJieshuBegin' },
        equipSkill: true,
        cardcolor: 'club',
        filter(event, player) {
            return player != event.player && player.getEquip('zshy_AAZZchelijiWDWB_tiejixuanyu') && event.player.isIn();
        },
        logTarget: 'player',
        check(event, player) {
            return get.attitude(player, event.player) < 0;
        },
        content() {
            'step 0';
            if (trigger.player.countCards('he') > 0) trigger.player.chooseToDiscard('he', 2, true);
            trigger.player.damage();
            'step 1';
            var card = player.getEquip('zshy_AAZZchelijiWDWB_tiejixuanyu');
            if (card) player.discard(card);
        },
    },
    zshy_AAZZchelijiWDWB_feilunzhanyu: {//飞轮战舆
        trigger: { global: 'phaseJieshuBegin' },
        equipSkill: true,
        cardcolor: 'spade',
        filter(event, player) {
            return player != event.player && player.getEquip('zshy_AAZZchelijiWDWB_feilunzhanyu') && event.player.isIn();
        },
        logTarget: 'player',
        check(event, player) {
            return get.attitude(player, event.player) <= 0;
        },
        content() {
            'step 0';
            if (trigger.player.countCards('he') > 0) trigger.player.chooseCard('he', true, '将一张牌交给' + get.translation(player));
            'step 1';
            if (result.bool) trigger.player.give(result.cards, player);
            trigger.player.damage();
            'step 2';
            var card = player.getEquip('zshy_AAZZchelijiWDWB_feilunzhanyu');
            if (card) player.discard(card);
        },
    },

    zshy_caozhao: {//草诏
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        filter(event, player) {
            if (player.countCards('h') == 0 || !game.hasPlayer(function (current) {
                return current != player;
            })) return false;
            var list = player.getStorage('zshy_caozhao');
            for (var i of lib.inpile) {
                if (!list.includes(i) && ['basic', 'trick'].includes(get.type(i))) return true;
            }
            return false;
        },
        chooseButton: {
            dialog(event, player) {
                var list = player.getStorage('zshy_caozhao'),
                    vcards = [];
                for (var i of lib.inpile) {
                    if (!list.includes(i)) {
                        var type = get.type(i);
                        if (type == 'basic' || type == 'trick') vcards.push([type, '', i]);
                    }
                }
                return ui.create.dialog('草诏', [vcards, 'vcard']);
            },
            check(button) {
                return _status.event.player.getUseValue({ name: button.link[2], isCard: true }, null, true);
            },
            backup(links, player) {
                return {
                    audio: 'zshy_caozhao',
                    cardname: links[0][2],
                    filterCard: true,
                    position: 'h',
                    check(card) {
                        return player.getUseValue({ name: lib.skill.zshy_caozhao_backup.cardname }) - (player.getUseValue(card, null, true) + 0.1) / (get.value(card) / 6);
                    },
                    filterTarget(card, player, target) {
                        return target != player;
                    },
                    discard: false,
                    lose: false,
                    content() {
                        'step 0';
                        player.showCards(cards, get.translation(player) + '发动【草诏】，声明' + get.translation(lib.skill.zshy_caozhao_backup.cardname));
                        if (!player.storage.zshy_caozhao) player.storage.zshy_caozhao = [];
                        player.storage.zshy_caozhao.push(lib.skill.zshy_caozhao_backup.cardname);
                        'step 1';
                        target.chooseControl().set('choiceList', ['令' + get.translation(player) + '将' + get.translation(cards[0]) + '的牌名改为' + get.translation(lib.skill.zshy_caozhao_backup.cardname), '失去1点体力'])
                            .set('ai', function (event, player) {
                                var target = _status.event.getParent().player;
                                if (get.attitude(player, target) > 0) return 0;
                                if (player.hp > 3 || (player.hp > 1 && player.hasSkill('zhaxiang'))) return 1;
                                if (player.hp > 2) return Math.random() > 0.5 ? 0 : 1;
                                return 0;
                            });
                        'step 2';
                        if (result.index == 1) {
                            target.addExpose(0.2);
                            target.loseHp();
                            event.finish();
                        } else {
                            player.chooseTarget('是否将' + get.translation(lib.skill.zshy_caozhao_backup.cardname) + '（' + get.translation(cards[0]) + '）交给一名其他角色？', lib.filter.notMe).set('ai', () => -1);
                        }
                        'step 3';
                        if (result.bool) {
                            var target = result.targets[0];
                            player.line(target, 'green');
                            if (!target.storage.zshy_caozhao_info) target.storage.zshy_caozhao_info = {};
                            target.storage.zshy_caozhao_info[cards[0].cardid] = lib.skill.zshy_caozhao_backup.cardname;
                            target.addSkill('zshy_caozhao_info');
                            player.give(cards, target, 'give').gaintag.add('zshy_caozhao');
                        } else {
                            if (!player.storage.zshy_caozhao_info) player.storage.zshy_caozhao_info = {};
                            player.storage.zshy_caozhao_info[cards[0].cardid] = lib.skill.zshy_caozhao_backup.cardname;
                            player.addGaintag(cards, 'zshy_caozhao');
                            player.addTempSkill('zshy_caozhao_info');
                        }
                    },
                    ai: {
                        result: {
                            player: 2,
                            target: 0.1,
                        },
                    },
                };
            },
            prompt(links, player) {
                return '将一张手牌声明为' + get.translation(links[0][2]);
            },
        },
        ai: {
            order: 1,
            result: {
                player: 1,
            },
        },
        group: ['zshy_caozhao_clear'],
        subSkill: {
            clear: {
                trigger: {
                    global: 'phaseEnd',
                },
                direct: true,
                filter(event, player) {
                    return player.getStorage('zshy_caozhao').length > 0;
                },
                content() {
                    player.storage.zshy_caozhao = [];
                },
            },
            info: {
                sub: true,
                onremove: true,
                charlotte: true,
                mod: {
                    cardname(card, player) {
                        var map = player.storage.zshy_caozhao_info;
                        if (map && map[card.cardid] && get.itemtype(card) == 'card' && card.hasGaintag('zshy_caozhao')) return map[card.cardid];
                    },
                    cardnature(card, player) {
                        var map = player.storage.zshy_caozhao_info;
                        if (map && map[card.cardid] && get.itemtype(card) == 'card' && card.hasGaintag('zshy_caozhao')) return false;
                    },
                },
            },
        },
    },
    zshy_xibing: {//息兵
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'damageEnd' },
        filter(event, player) {
            return event.player && event.source && event.player != event.source && event.player.isAlive() && event.source.isAlive() && (event.player.countCards('he') > 0 || event.source.countCards('he') > 0);
        },
        direct: true,
        content() {
            'step 0';
            var target = trigger.source;
            event.target = target;
            player.chooseTarget(get.prompt('zshy_xibing'), '摸两张牌或弃置' + get.translation(target) + '的两张牌，然后你摸一张牌且其不能对你使用牌直到回合结束', function (card, player, target) {
                if (target != player && target != _status.event.target) return false;
                return target.countCards('he') > 0;
            }).set('target', target).set('ai', function (targetx) {
                var player = _status.event.player,
                    target = _status.event.target;
                if (target == targetx) {
                    if (get.attitude(player, target) > 0) return 1;
                    var cards = target.getCards('he', function (card) {
                        return lib.filter.canBeDiscarded(card, player, target);
                    }).map(c => ({ link: c })).sort(function (a, b) {
                        return get.buttonValue(b) - get.buttonValue(a);
                    }).map(b => b.link);
                    if (target.countCards('h') - player.countCards('h') >= Math.max(0, Math.min(2, cards.length) -
                        target.countCards('e', function (card) {
                            var index = cards.indexOf(card);
                            return index != -1 && index < 2;
                        }))) return 1;
                    return 0;
                }
                var cards = player.getCards('he', function (card) {
                    return lib.filter.cardDiscardable(card, player, 'zshy_xibing');
                }).sort(function (a, b) {
                    return get.useful(a) - get.useful(b);
                });
                if (player.countCards('h') - target.countCards('h') < Math.max(0, Math.min(cards.length, 2) - player.countCards('e', function (card) {
                    var index = cards.indexOf(card);
                    return index != -1 && index < 2;
                })) && (cards.length < 2 || get.value(cards[1]) < 5.5)) return 0.8;
                return 0;
            });
            'step 1';
            if (result.bool) {
                player.logSkill('zshy_xibing', target);
                var target = result.targets[0];
                if (target == player) player.draw(2);
                else player.discardPlayerCard(target, 'he', true, 2);
            } else event.finish();
            'step 2';
            if (player.isIn() && target.isIn()) {
                player.draw();
                player.addTempSkill('zshy_xibing_sub');
                player.markAuto('zshy_xibing_sub', [target]);
            }
        },
        subSkill: {
            sub: {
                mod: {
                    targetEnabled(card, player, target) {
                        if (target.getStorage('zshy_xibing_sub').includes(player)) return false;
                    },
                    cardSavable(card, player, target) {
                        if (target.getStorage('zshy_xibing_sub').includes(player)) return false;
                    },
                },
                onremove: true,
            },
        },
    },

};
const 文德武备备 = {
    //墟成济成倅
    zshy_tousui: {//透髓
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'chooseToUse',
        viewAsFilter(player) {
            return player.countCards('he');
        },
        viewAs: {
            name: 'sha',
            suit: 'none',
            number: null,
            isCard: true,
        },
        filterCard: true,
        selectCard: [1, Infinity],
        position: 'he',
        check(card) {
            const player = get.player();
            return 4.5 + (player.hasSkill('zshy_chuming') ? 1 : 0) - 1.5 * ui.selected.cards.length - get.value(card);
        },
        popname: true,
        ignoreMod: true,
        log: false,
        allowChooseAll: true,
        async precontent(event, trigger, player) {
            var evt = event.getParent();
            if (evt.dialog && typeof evt.dialog == 'object') {
                evt.dialog.close();
            }
            player.logSkill('zshy_tousui');
            var cards = event.result.cards;
            await player.loseToDiscardpile(cards, ui.cardPile, false, 'blank').set('log', false);
            var shownCards = cards.filter(i => get.position(i) == 'e'),
                handcardsLength = cards.length - shownCards.length;
            if (shownCards.length) {
                player.$throw(shownCards, null);
                game.log(player, '将', shownCards, '置于了牌堆底');
            }
            if (handcardsLength > 0) {
                player.$throw(handcardsLength, null);
                game.log(player, '将', get.cnNumber(handcardsLength), '张牌置于了牌堆底');
            }
            await game.delayex();
            var viewAs = new lib.element.VCard({ name: event.result.card.name, isCard: true });
            event.result.card = viewAs;
            event.result.cards = [];
            event.result._apply_args = {
                shanReq: cards.length,
                oncard: () => {
                    var evt = get.event();
                    for (var target of game.filterPlayer(null, null, true)) {
                        var id = target.playerid;
                        var map = evt.customArgs;
                        if (!map[id]) {
                            map[id] = {};
                        }
                        map[id].shanRequired = evt.shanReq;
                    }
                },
            };
        },
        mod: {
            cardUsable(card, player) {
                if (get.suit(card) == 'none') return Infinity;
            },
        },
        ai: {
            order(item, player) {
                return get.order({ name: 'sha' }) + 0.1;
            },
            result: { player: 1 },
            keepdu: true,
            respondSha: true,
            skillTagFilter: (player, tag, arg) => {
                if (tag == 'respondSha' && arg === 'respond') {
                    return false;
                }
            },
        },
    },
    zshy_chuming: {//畜鸣
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            source: 'damageBegin1',
            player: 'damageBegin3',
        },
        filter(event, player) {
            if (event.source === event.player) {
                return false;
            }
            if (!event.card || !event.cards || !event.cards.length) {
                return true;
            }
            let target = event[player === event.source ? 'player' : 'source'];
            return target && target.isIn();
        },
        forced: true,
        async content(event, trigger, player) {
            if (!trigger.card || !trigger.cards || !trigger.cards.length) {
                trigger.num += trigger.source.hp;
                event.finish();
                return;
            } else {
                var target = trigger[trigger.source == player ? 'player' : 'source'];
                trigger._zshy_chuming = true;
                target.addTempSkill('zshy_chuming_effect');
            }
        },
        ai: {
            effect: {
                player(card, player, target) {
                    if (!get.tag(card, 'damage')) {
                        return;
                    }
                    if (!lib.card[card.name] || !card.cards || !card.cards.length) {
                        return [1, 0, 2, 0];
                    }
                    return [1, -1];
                },
                target(card, player, target) {
                    if (!get.tag(card, 'damage')) {
                        return;
                    }
                    if (!lib.card[card.name] || !card.cards || !card.cards.length) {
                        return 2;
                    }
                    return [1, -1];
                },
            },
            combo: 'zshy_tousui',
            halfneg: true,
        },
        subSkill: {
            effect: {
                charlotte: true,
                trigger: { global: 'phaseEnd' },
                forced: true,
                popup: false,
                async content(event, trigger, player) {
                    var mapx = {};
                    var history = player.getHistory('damage').concat(player.getHistory('sourceDamage'));
                    history.forEach(evt => {
                        if (!evt._zshy_chuming) {
                            return;
                        }
                        var target = evt[evt.source == player ? 'player' : 'source'];
                        if (!target.isIn()) {
                            return;
                        }
                        var cards = evt.cards.filterInD('d');
                        if (!cards.length) {
                            return;
                        }
                        if (!mapx[target.playerid]) {
                            mapx[target.playerid] = [];
                        }
                        mapx[target.playerid].addArray(cards);
                    });
                    var entries = Object.entries(mapx).map(entry => {
                        return [(_status.connectMode ? lib.playerOL : game.playerMap)[entry[0]], entry[1]];
                    });
                    if (!entries.length) {
                        event.finish();
                        return;
                    }
                    player.logSkill(
                        'zshy_chuming_effect',
                        entries.map(i => i[0])
                    );
                    entries.sort((a, b) => lib.sort.seat(a[0], b[0]));
                    for (var entry of entries) {
                        var current = entry[0],
                            cards = entry[1];
                        var list = ['jiedao', 'guohe'].filter(i => player.canUse(new lib.element.VCard({ name: i, cards: cards }), current, false));
                        if (!list.length) {
                            return;
                        }
                        var result = {};
                        if (list.length == 1) {
                            result = { bool: true, links: [['', '', list[0]]] };
                        } else {
                            result = await player
                                .chooseButton([`畜鸣：请选择要对${get.translation(current)}使用的牌`, [list, 'vcard']], true)
                                .set('ai', button => {
                                    var player = get.player();
                                    return get.effect(get.event().currentTarget, { name: button.link[2] }, player, player);
                                })
                                .set('currentTarget', current)
                                .forResult();
                        }
                        if (result.bool) {
                            var card = get.autoViewAs({ name: result.links[0][2] }, cards);
                            if (player.canUse(card, current, false)) {
                                player.useCard(card, cards, current, false);
                            }
                        }
                    }
                },
            },
        },
    },

    zshy_xijue: {//袭爵
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'phaseBefore',
            player: ['enterGame', 'showCharacterAfter'],
        },
        forced: true,
        derivation: ['zshy_xijue_tuxi', 'zshy_xijue_xiaoguo'],
        filter(event, player) {
            return event.name != 'showCharacter' && (event.name != 'phase' || game.phaseNumber == 0);
        },
        async content(event, trigger, player) {
            await player.addMark('zshy_xijue', 4);
        },
        intro: {
            name2: '爵',
            content: 'mark',
        },
        group: ['zshy_xijue_gain', 'zshy_xijue_tuxi', 'zshy_xijue_xiaoguo'],
        subSkill: {
            gain: {
                audio: 'zshy_xijue',
                trigger: {
                    source: 'damageEnd',
                },
                forced: true,
                sourceSkill: 'zshy_xijue',
                async content(event, trigger, player) {
                    await player.addMark('zshy_xijue', trigger.num);
                },
            },
            tuxi: {
                audio: 'ext:诸神寰宇/audio/character:2',
                trigger: {
                    global: 'phaseDrawBegin2',
                },
                direct: true,
                filter(event, player) {
                    return (event.num > 0 && !event.numFixed && player.hasMark('zshy_xijue') &&
                        game.hasPlayer(function (target) {
                            return player != target && target.countCards('h') > 0;
                        })
                    );
                },
                content() {
                    'step 0';
                    var num = trigger.num;
                    player.chooseTarget(
                        '是否弃置一枚「爵」发动〖突袭〗？',
                        '获得至多' + get.translation(num) + '名角色的各一张手牌，然后令' + get.translation(trigger.player) + '少摸等量的牌',
                        [1, num], function (card, player, target) {
                            return target.countCards('h') > 0 && player != target;
                        },
                        function (target) {
                            var att = get.attitude(_status.event.player, target);
                            if (target.hasSkill('tuntian')) {
                                return att / 10;
                            }
                            if (player.countMark('zshy_xijue') > 1
                                && (get.attitude(player, trigger.player) < 0
                                    || trigger.player == player)) {
                                return 1 - att;
                            }
                            return 0;
                        }
                    );
                    'step 1';
                    if (result.bool) {
                        result.targets.sortBySeat();
                        player.logSkill('zshy_xijue_tuxi', result.targets);
                        player.removeMark('zshy_xijue', 1);
                        player.gainMultiple(result.targets);
                        trigger.num -= result.targets.length;
                    } else {
                        event.finish();
                    }
                    'step 2';
                    if (trigger.num <= 0) {
                        game.delay();
                    }
                },
                ai: {
                    expose: 0.2,
                },
            },
            xiaoguo: {
                audio: 'ext:诸神寰宇/audio/character:2',
                trigger: {
                    global: 'phaseJieshuBegin',
                },
                filter(event, player) {
                    return player.hasMark('zshy_xijue') && event.player.isAlive() &&
                        event.player != player && player.countCards('he');
                },
                direct: true,
                content() {
                    'step 0';
                    var nono =
                        Math.abs(get.attitude(player, trigger.player)) < 3 ||
                        trigger.player.hp > player.countMark('zshy_xijue') * 1.5 ||
                        trigger.player.countCards('e', function (card) {
                            return get.value(card, trigger.player) <= 0;
                        });
                    if (get.damageEffect(trigger.player, player, player) <= 0) {
                        nono = true;
                    }
                    var next = player.chooseToDiscard(`是否弃置一枚「爵」和一张牌，对${get.translation(trigger.player)}发动【骁果】？`, 'he');
                    next.set('ai', function (card) {
                        if (_status.event.nono) {
                            return 0;
                        }
                        return 8 - get.useful(card);
                    });
                    next.set('logSkill', ['zshy_xijue_xiaoguo', trigger.player]);
                    next.set('nono', nono);
                    'step 1';
                    if (result.bool) {
                        player.removeMark('zshy_xijue', 1);
                        var nono = get.damageEffect(trigger.player, player, trigger.player) >= 0;
                        trigger.player
                            .chooseToDiscard('he', '弃置一张装备牌并令' + get.translation(player) + '摸一张牌，或受到1点伤害', { type: 'equip' })
                            .set('ai', function (card) {
                                if (_status.event.nono) {
                                    return 0;
                                }
                                if (_status.event.player.hp == 1) {
                                    return 10 - get.value(card);
                                }
                                return 9 - get.value(card);
                            })
                            .set('nono', nono);
                    } else {
                        event.finish();
                    }
                    'step 2';
                    if (result.bool) {
                        player.chooseDrawRecover(true);
                        player.draw();
                    } else {
                        trigger.player.damage();
                        player.draw();
                    }
                },
                ai: {
                    expose: 0.3,
                    threaten: 1.3,
                },
                sub: true,
                sourceSkill: 'zshy_xijue',
                _priority: 0,
            },
        },
    },

    //墟夏侯徽
    zshy_baoqie: {//宝箧
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'showCharacterAfter' },
        forced: true,
        hiddenSkill: true,
        filter(event, player) {
            return event.toShow?.some(i => get.character(i).skills?.includes('zshy_baoqie'));
        },
        content() {
            'step 0';
            var card = get.cardPile(function (card) {
                return get.subtype(card, false) == 'equip5' && !get.cardtag(card, 'gifts');
            });
            if (!card) {
                event.finish();
                return;
            }
            event.card = card;
            player.gain(card, 'gain2');
            'step 1';
            if (player.getCards('h').includes(card) && get.subtype(card) == 'equip5') {
                player.chooseUseTarget(card).nopopup = true;
            }
        },
    },
    zshy_yishi: {//宜室
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: ['loseAfter', 'loseAsyncAfter'] },
        preHidden: true,
        filter(event, player) {
            const target = _status.currentPhase;
            if (!target || !target.isIn() || event.type != 'discard' || !target.isPhaseUsing()) {
                return false;
            }
            if (target == player) {
                return false;
            }
            const evt = event.getl(target);
            return evt?.hs?.someInD('d');
        },
        async cost(event, trigger, player) {
            const target = _status.currentPhase,
                cards = trigger.getl(target).hs.filterInD('d');
            event.cards = cards;
            let str = '是否发动【宜室】令' + get.translation(target) + '获得其中一张牌';
            if (cards.length > 1) {
                str += '，然后获得其余的牌并回复1点体力';
            }
            str += '？';
            const { bool, links } = await player.chooseButton([str, cards])
                .set('ai', button => {
                    const card = button.link;
                    const { player, source } = get.event();
                    if (get.attitude(player, source) > 0) {
                        return Math.max(1, source.getUseValue(card, null, true));
                    }
                    const cards = get.event().getParent().cards.slice(0);
                    if (cards.length == 1) {
                        return -get.value(card);
                    }
                    cards.remove(card);
                    return get.value(cards) - get.value(card) - 2;
                })
                .set('source', target)
                .setHiddenSkill(event.skill)
                .forResult();
            event.result = {
                bool: bool,
                targets: [target],
                cost_data: links,
            };
        },
        async content(event, trigger, player) {
            const {
                targets: [target],
                cost_data: links,
            } = event,
                cards = trigger.getl(target).hs.filterInD('d');
            await target.gain(links, 'gain2');
            cards.remove(links[0]);
            if (cards.length) {
                await player.gain(cards, 'gain2');
            };
            player.recover();
        },
    },
    zshy_shidu: {//识度
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        filter(event, player) {
            return game.hasPlayer(function (target) {
                return player != target && !target.hasSkill('zshy_shidu_used');
            });
        },
        filterTarget(card, player, target) {
            return player != target && !target.hasSkill('zshy_shidu_used');
        },
        content() {
            'step 0';
            target.addTempSkill('zshy_shidu_used');
            var num = target.countCards('h');
            if (num > 0) {
                player.gainPlayerCard(target, true, 'h', num);
            }
            'step 1';
            var num = Math.floor(player.countCards('h') / 2);
            if (num && target.isAlive()) {
                player.chooseCard('h', num, true, '交给' + get.translation(target) + get.cnNumber(num) + '张牌');
            } else {
                event.finish();
            }
            'step 2';
            if (result.bool && result.cards && result.cards.length) {
                player.give(result.cards, target);
            }
            'step 3';
            if (player.countCards('h') <= target.countCards('h')) player.chooseDrawRecover(true);
        },
        ai: {
            order: 1,
            result: {
                target(player, target) {
                    var delta = target.countCards('h') - player.countCards('h');
                    if (delta < 0) {
                        return 0;
                    }
                    return -1 - delta;
                },
            },
        },
        subSkill: {
            used: {
                charlotte: true,
            },
        },
    },

    //墟司马师
    zshy_taoyin: {//韬隐
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'showCharacterAfter' },
        hiddenSkill: true,
        forced: true,
        check(event, player) {
            return get.attitude(player, target) < 0;
        },
        content() {
            'step 0'
            player.chooseTarget(get.prompt('zshy_taoyin'), '令任意名其他角色的手牌上限为0', [1, Infinity], function (event, player, target) {
                return target != player;
            }).set('ai', function (target) {
                var player = _status.event.player;
                var att = get.attitude(player, target);
                if (att < 0) {
                    return -att;
                }
                return 0;
            });
            'step 1'
            if (result.bool) {
                for (const i of result.targets) {
                    i.addSkill('zshy_taoyin_card');
                };
            }
        },
        ai: {
            expose: 0.2,
        },
        subSkill: {
            card: {
                mark: true,
                onremove: true,
                charlotte: true,
                intro: {
                    content: '手牌上限为0',
                },
                mod: {
                    maxHandcard(card, player) {
                        return 0;
                    },
                },
            },
        },
    },
    zshy_yimie: {//夷灭
        audio: 'ext:诸神寰宇/audio/character:2',
        preHidden: true,
        trigger: { source: 'damageBegin4' },
        filter(event, player) {
            return player != event.player;
        },
        check(event, player) {
            if (event.player.hasSkillTag('nodamage')) return false;
            let att = get.attitude(_status.event.player, event.player),
                eff = get.damageEffect(event.player, player, _status.event.player, get.natureList(event)),
                fd = event.player.hasSkillTag('filterDamage', null, {
                    player: player,
                    card: event.card,
                });
            if (eff <= 0 || fd || att >= -2) return false;
            if (eff > 0 && event.player.isLinked() && event.hasNature() && !player.isLinked()) return true;
            return !event.player.countCards('hs') || (event.player.hp > 2 * event.num && !event.player.hasSkillTag('maixie'));
        },
        async content(event, trigger, player) {
            trigger.player.addTempSkill('zshy_yimie_damageAfter', { player: 'zshy_yimie_damageAfterAfter' });
            trigger.num = trigger.player.maxHp + 1;
        },
        ai: {
            damageBonus: true,
            skillTagFilter(player, tag, arg) {
                return arg && arg.target && arg.target.hp > 1 && player.hp > 1 && get.attitude(player, arg.target) < -2;
            },
        },
    },
    zshy_tairan: {//泰然
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'phaseJieshuBegin',
        },
        forced: true,
        preHidden: true,
        async content(event, trigger, player) {
            if (player.isDamaged(true)) {
                await player.recoverTo(player.maxHp);
            }
            if (player.countCards('h') < player.maxHp) {
                await player.drawTo(player.maxHp);
            }
            else {
                const result = await player.chooseCard(get.translation(event.name), `请选择重铸至多${player.maxHp}张牌`, 'h', [1, player.maxHp])
                    .set('ai', function (card) {
                        return 7 - get.value(card);
                    }).forResult();
                if (result?.bool && result.cards) {
                    player.recast(result.cards);
                }
            };
        },
    },
    zshy_ruilve: {//睿略
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'useCard',
        },
        unique: true,
        zhuSkill: true,
        filter(event, player) {
            return event.player.group == 'jin' && event.player != player && get.tag(event.cards, 'damage') == true;
        },
        check() {
            return true;
        },
        content() {
            player.chooseDrawRecover(true);
            player.gain(trigger.card, 'gain2');
        },
    },

    zshy_huirong: {//慧容：【隐匿技||锁定技】<li>当你登场后，你令一名角色将手牌数摸至/弃至与已损失体力值相同。
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AABHYanghuiyu: 'zshy_huirong_zshy_AABHYanghuiyu',
        },
        trigger: { player: 'showCharacterAfter' },
        forced: true,
        filter(event, player) {
            return (event.toShow?.some(i => get.character(i).skills?.includes('zshy_huirong')) &&
                game.hasPlayer(function (target) {
                    var num = target.countCards('h');
                    return num > target.getDamagedHp() || num < target.getDamagedHp();
                })
            );
        },
        hiddenSkill: true,
        content() {
            'step 0';
            player.chooseTarget('请选择〖慧容〗的目标', '令一名角色将手牌数摸至/弃置至与其已损失体力值相同', true, function (card, player, target) {
                var num = target.countCards('h');
                return num > target.getDamagedHp() || num < target.getDamagedHp();
            }).set('ai', function (target) {
                var att = get.attitude(_status.event.player, target);
                var num = target.countCards('h');
                if (num > target.getDamagedHp()) return -att * (num - target.getDamagedHp());
                return att * Math.max(0, target.getDamagedHp() - target.countCards('h'));
            });
            'step 1';
            if (result.bool) {
                var target = result.targets[0];
                player.line(target, 'green');
                if (target.countCards('h') < target.getDamagedHp()) target.drawTo(target.getDamagedHp());
                else target.chooseToDiscard('h', true, target.countCards('h') - target.getDamagedHp());
            }
        },
        subSkill: {
            zshy_AABHYanghuiyu: { audio: 'ext:诸神寰宇/audio/character:2' }
        }
    },
    zshy_ciwei: {//慈威：其他角色于其回合内使用偶数张牌时，若此牌为基本牌或普通锦囊牌，则你可以取消此牌的所有目标。
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AABHYanghuiyu: 'zshy_ciwei_zshy_AABHYanghuiyu',
        },
        trigger: { global: 'useCard' },
        preHidden: true,
        filter(event, player) {
            if (event.all_excluded || event.player == player || event.player != _status.currentPhase || !player.countCards('he')) return false;
            return event.player.getHistory('useCard').indexOf(event) % 2 == 1 && ['basic', 'trick'].includes(get.type(event.card));
        },
        prompt(event, player) {
            return '是否取消此牌的所有目标？';
        },
        check(event, player) {
            if (!event.targets.length) return get.attitude(player, event.player) < 0;
            var num = 0;
            for (var i of event.targets) {
                num += get.effect(i, event.card, event.player, player);
            }
            return num <= 0;
        },
        content() {
            if (player != game.me && !player.isOnline()) game.delayx();
            trigger.targets.length = 0;
            trigger.all_excluded = true;
        },
        init: () => {
            game.addGlobalSkill('zshy_ciwei_ai');
        },
        onremove: () => {
            if (!game.hasPlayer(i => i.hasSkill('zshy_ciwei', null, null, false), true)) game.removeGlobalSkill('zshy_ciwei_ai');
        },
        subSkill: {
            zshy_AABHYanghuiyu: { audio: 'ext:诸神寰宇/audio/character:2' },
            ai: {
                mod: {
                    aiOrder(player, card, num) {
                        if (player != _status.currentPhase || player.getHistory('useCard').length % 2 == 1 ||
                            !game.hasPlayer(function (current) {
                                return current != player && (get.realAttitude || get.attitude)(current, player) < 0 && current.hasSkill('zshy_ciwei') && current.countCards('he') > 0;
                            })
                        )
                            return;
                        if (player.getHistory('useCard').length % 2 == 0) {
                            if (['basic', 'trick'].includes(get.type(card))) return num + 10;
                            return;
                        }
                        if (!['basic', 'trick'].includes(get.type(card))) return num + 10;
                        if (!player._zshy_ciwei_temp) {
                            player._zshy_ciwei_temp = true;
                            num /= Math.max(1, player.getUseValue(card));
                        }
                        delete player._zshy_ciwei_temp;
                        return num;
                    },
                },
                trigger: { player: 'dieAfter' },
                sourceSkill: 'zshy_ciwei',
                filter: () => {
                    return !game.hasPlayer(i => i.hasSkill('zshy_ciwei', null, null, false), true);
                },
                silent: true,
                forceDie: true,
                content: () => {
                    game.removeGlobalSkill('zshy_ciwei_ai');
                },
            },
        },
    },
    zshy_caiyuan: {//才媛：【锁定技】<li>一名角色回合结束时，你选择回复1点体力或摸两张牌。
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AABHYanghuiyu: 'zshy_caiyuan_zshy_AABHYanghuiyu',
        },
        trigger: { global: 'phaseEnd' },
        forced: true,
        preHidden: true,
        async content(event, trigger, player) {
            await player.chooseDrawRecover(true);
        },
        subSkill: {
            zshy_AABHYanghuiyu: { audio: 'ext:诸神寰宇/audio/character:2' },
        }
    },

    zshy_zhuosheng: {//擢升
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'useCard2' },
        forced: true,
        direct: true,
        filter(event, player) {
            if (event.targets && event.targets.length > 0) return true;
            var info = get.info(event.card);
            if (info.allowMultiple == false) return false;
            if (event.card.type != 'basic' && event.card.type != 'trick') return false;
            if (event.targets && !info.multitarget) {
                if (game.hasPlayer(function (current) {
                    return !event.targets.includes(current) && lib.filter.targetEnabled2(event.card, player, current) && lib.filter.targetInRange(event.card, player, current);
                })) return true;
            }
            return false;
        },
        content(event) {
            'step 0';
            if (get.type(trigger.card) == 'basic' || get.type(trigger.card) == 'trick') {
                var prompt2 = '为' + get.translation(trigger.card) + '增加或减少一个目标';
                player.chooseTarget(get.prompt('zshy_zhuosheng'), function (card, player, target) {
                    var player = _status.event.player;
                    if (_status.event.targets.includes(target)) return true;
                    return lib.filter.targetEnabled2(_status.event.card, player, target) && lib.filter.targetInRange(_status.event.card, player, target);
                }).set('prompt2', prompt2).set('ai', function (target) {
                    var trigger = _status.event.getTrigger();
                    var player = _status.event.player;
                    return get.effect(target, trigger.card, player, player) * (_status.event.targets.includes(target) ? -1 : 1);
                }).set('targets', trigger.targets).set('card', trigger.card);
            } else {
                event.finish();
            }
            'step 1';
            if (result.bool) {
                if (!event.isMine() && !event.isOnline()) game.delayx();
                event.targets = result.targets;
            } else event.finish();
            'step 2';
            if (event.targets) {
                player.logSkill('zshy_zhuosheng', event.targets);
                if (trigger.targets.includes(event.targets[0])) trigger.targets.removeArray(event.targets);
                else trigger.targets.addArray(event.targets);
            }
        },
        mod: {
            targetInRange(card, player) {
                return true;
            },
            cardUsable(card, player) {
                return Infinity;
            },
            aiOrder(player, card, num) {
                if (get.itemtype(card) === 'card') return num - 0.1;
            },
        },
        group: ['zshy_zhuosheng_equip', 'zshy_zhuosheng_silent'],
        subfrequent: ['equip'],
        subSkill: {
            equip: {
                audio: 'zshy_zhuosheng',
                trigger: { player: 'useCard' },
                filter(event, player) {
                    return get.type(event.card) != 'basic';
                },
                forced: true,
                content() {
                    player.chooseDrawRecover(true);
                },
            },
            silent: {
                trigger: {
                    player: 'useCard1',
                },
                forced: true,
                silent: true,
                firstDo: true,
                filter(event, player) {
                    return event.addCount !== false;
                },
                content() {
                    trigger.addCount = false;
                    var stat = player.getStat();
                    if (stat && stat.card && stat.card[trigger.card.name]) stat.card[trigger.card.name]--;
                },
            },
        },
    },

};
const 文德武备果 = {
    zshy_gaoling: {//高陵
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'showCharacterAfter',
        },
        async cost(event, trigger, player) {
            event.result = await player.chooseTarget(get.prompt('zshy_gaoling'), '令一名角色增加1点体力上限并回复1点体力')
                .set('ai', function (target) {
                    var player = _status.event.player;
                    var att = get.attitude(player, target);
                    if (att > 0) {
                        if (target.maxHp < 5) {
                            if (target == player) return 3;
                            return att * 2;
                        }
                        return att;
                    }
                    return 0;
                }).forResult();
        },
        async content(event, trigger, player) {
            const target = event.targets[0];
            if (target != player) {
                player.addExpose(0.2);
            }
            target.gainMaxHp();
            target.recover();
        },
    },
    zshy_qimei: {//齐眉
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'phaseZhunbeiBegin',
        },
        preHidden: true,
        async cost(event, trigger, player) {
            event.result = await player.chooseTarget(get.prompt('zshy_qimei'), '选择一名其他角色并获得〖齐眉〗效果', lib.filter.notMe).set('ai', function (target) {
                var player = _status.event.player;
                return get.attitude(player, target) / (Math.abs(player.countCards('h') + 2 - target.countCards('h')) + 1);
            }).setHiddenSkill('zshy_qimei').forResult();
        },
        async content(event, trigger, player) {
            let target = event.targets[0];
            player.storage.zshy_qimei_draw = target;
            player.addTempSkill('zshy_qimei_draw', { player: 'phaseZhunbeiBegin' });
            game.delayx();
        },
        subSkill: {
            draw: {
                audio: 'zshy_qimei',
                charlotte: true,
                sourceSkill: 'zshy_qimei',
                forced: true,
                popup: false,
                trigger: {
                    global: ['equipAfter', 'addJudgeAfter', 'gainAfter', 'loseAsyncAfter', 'loseAfter', 'addToExpansionAfter'],
                },
                filter(event, player) {
                    var target = player.storage.zshy_qimei_draw;
                    if (!target || !target.isIn()) return false;
                    var hasChange = function (event, player) {
                        var gain = 0,
                            lose = 0;
                        if (event.getg) gain = event.getg(player).length;
                        if (event.getl) lose = event.getl(player).hs.length;
                        return gain > 0 || lose > 0;
                    };
                    return (hasChange(event, player) && target.isDamaged()) || (hasChange(event, target) && player.isDamaged());
                },
                content() {
                    'step 0';
                    if (trigger.delay === false) game.delayx();
                    'step 1';
                    var target = player.storage.zshy_qimei_draw;
                    player.logSkill('zshy_qimei_draw', target);
                    var drawer = [];
                    var hasChange = function (event, player) {
                        var gain = 0,
                            lose = 0;
                        if (event.getg) gain = event.getg(player).length;
                        if (event.getl) lose = event.getl(player).hs.length;
                        return gain > 0 || lose > 0;
                    };
                    if (hasChange(trigger, player)) drawer.push(target);
                    if (hasChange(trigger, target)) drawer.push(player);
                    if (drawer.length == 1) drawer[0].recover();
                    else {
                        drawer[0].recover();
                        drawer[1].recover();
                        game.delayex();
                    }
                },
                group: 'zshy_qimei_hp',
                onremove: true,
                mark: 'character',
                intro: {
                    content: '已和$组成齐眉组合',
                },
            },
            hp: {
                audio: 'zshy_qimei',
                trigger: {
                    global: 'changeHp',
                },
                sourceSkill: 'zshy_qimei',
                charlotte: true,
                forced: true,
                logTarget(event, player) {
                    return player.storage.zshy_qimei_draw;
                },
                filter(event, player) {
                    var target = player.storage.zshy_qimei_draw;
                    if (!target || !target.isIn()) return false;
                    if (player != event.player && target != event.player) return false;
                    return true;
                },
                async content(event, trigger, player) {
                    (player == trigger.player ? player.storage.zshy_qimei_draw : player).draw();
                },
            },
        },
    },
    zshy_XGZzhuiji: {//追姬
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'phaseUseBegin',
        },
        preHidden: true,
        async cost(event, trigger, player) {
            let list = ['摸两张牌并失去1点体力，并于出牌阶段结束时回复1点体力'];
            if (player.isDamaged()) {
                list.push('回复1点体力并弃置两张牌，并于出牌阶段结束时摸两张牌');
            }
            const result = await player.chooseControl('cancel2').set('choiceList', list).set('prompt', get.prompt('zshy_XGZzhuiji'))
                .set('ai', function () {
                    var player = _status.event.player;
                    if (player.isDamaged() && player.countCards('h', 'tao') < player.getDamagedHp()) return 1;
                    return 0;
                }).setHiddenSkill('zshy_XGZzhuiji').forResult();
            event.result = {
                bool: result != 'cancel2',
                cost_data: result.index,
            }
        },
        async content(event, trigger, player) {
            if (event.cost_data == 0) {
                player.draw(2);
                player.loseHp();
            }
            else {
                player.recover();
                player.chooseToDiscard('he', 2, true);
            }
            player.addTempSkill('zshy_XGZzhuiji_' + event.cost_data, 'phaseUseAfter');
        },
        subSkill: {
            '0': {
                trigger: {
                    player: 'phaseUseEnd',
                },
                forced: true,
                charlotte: true,
                async content(event, trigger, player) {
                    player.recover();
                },
                sub: true,
                sourceSkill: 'zshy_XGZzhuiji',
            },
            '1': {
                trigger: {
                    player: 'phaseUseEnd',
                },
                forced: true,
                charlotte: true,
                async content(event, trigger, player) {
                    player.draw(2);
                },
                sub: true,
                sourceSkill: 'zshy_XGZzhuiji',
            },
        },
    },

    //墟司马昭
    zshy_tuishi: {//推弑
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'showCharacterAfter',
        },
        hiddenSkill: true,
        filter(event, player) {
            const target = _status.currentPhase;
            return target.isAlive() && game.hasPlayer((current) => current !== target);
        },
        async cost(event, trigger, player) {
            const targetx = _status.currentPhase;
            event.result = await player.chooseTarget({
                prompt: get.prompt2('zshy_tuishi', targetx),
                filterTarget(card, player2, target) {
                    const targetx2 = get.event().targetx;
                    return targetx2 !== target;
                },
                ai(target) {
                    const event2 = get.event();
                    if (!event2.goon) {
                        return 0;
                    }
                    return get.damageEffect(target, event2.source, event2.player);
                }
            }).set('targetx', targetx)
                .set('goon', get.damageEffect(targetx, player, player) > 0).forResult();
        },
        async content(event, trigger, player) {
            const source = _status.currentPhase;
            const target = event.targets[0];
            player.line2([source, target]);
            await game.delayx();
            const result = await source.chooseBool({
                prompt: `对${get.translation(target)}造成1点伤害，或受到来自${get.translation(player)}的1点伤害`,
            }).set('ai', function () {
                return get.damageEffect(target, source, source);
            }).forResult();
            if (!result.bool) {
                await source.damage({ source: player });
            } else {
                await target.damage({ source: source });
            }
        },
        ai: {
            expose: 0.6,
        },
    },
    zshy_choufa: {//筹伐
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        selectTarget: [1, Infinity],
        filterTarget(event, player, target) {
            return target != player && !target.hasSkill('zshy_choufa_used');
        },
        filter(event, player) {
            return game.countPlayer(function (current) {
                return current != player && !current.hasSkill('zshy_choufa_used');
            }) > 0;
        },
        check(target, player) {
            return get.damageEffect(target, player, player) > 0;
        },
        async content(event, trigger, player) {
            const target = event.target;
            if (target.countCards('h')) {
                const result = await player.choosePlayerCard('zshy_choufa', `选择展示的牌`, target, 'h', true).forResult();
                if (result?.cards) {
                    await player.showCards(result.cards, get.translation(player) + '对' + get.translation(target) + '发动了〖筹伐〗');
                    let type = get.type2(result.cards[0], target),
                        hs = target.getCards('h', function (card) {
                            return card != result.cards[0];
                        });
                    if (hs.length) {
                        target.addGaintag(hs, 'zshy_choufa');
                        target.addTempSkill('zshy_choufa_sha', { player: 'phaseAfter' });
                    };
                };
            };
            target.damage();
            target.addTempSkill('zshy_choufa_used');
        },
        subSkill: {
            sha: {
                charlotte: true,
                onremove(player) {
                    player.removeGaintag('zshy_choufa');
                },
                mod: {
                    cardname(card) {
                        if (get.itemtype(card) == 'card' && card.hasGaintag('zshy_choufa')) return 'sha';
                    },
                    cardnature(card) {
                        if (get.itemtype(card) == 'card' && card.hasGaintag('zshy_choufa')) return false;
                    },
                },
            },
            used: {
                charlotte: true,
                forced: true,
            },
        },
        ai: {
            order: 8.5,
            directHit: true,
            result: {
                target(player, target) {
                    var att = get.attitude(player, target);
                    if (att > 0) return 0;
                    if (target.hp == 1) return -2;
                    if (target.countCards('h') > 2) return -1.5;
                    if (target.hasSkillTag('threaten')) return -1.2;
                    return -1;
                }
            },
        },
    },
    zshy_zhaoran: {//昭然
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'loseAfter',
            global: ['equipAfter', 'addJudgeAfter', 'gainAfter', 'loseAsyncAfter', 'addToExpansionAfter'],
        },
        forced: true,
        popup: false,
        filter(event, player) {
            if (event.name == 'gainBegin') return true;
            var evt = event.getl(player);
            if (!evt || !evt.hs || !evt.hs.length) return false;
            for (var i of evt.hs) {
                var suit = get.suit(i, player);
                if (!player.countCards('h', { suit: suit })) return true;
            }
            return false;
        },
        content() {
            'step 0';
            if (trigger.delay === false) game.delayx();
            'step 1';
            var suits = [];
            var evt = trigger.getl(player);
            for (var i of evt.hs) {
                var suit = get.suit(i, player);
                if (suits.includes(suit)) {
                    suits.add(suit);
                }
            }
            event.count = suits.length;
            'step 2';
            event.count--;
            var filterTarget = function (card, player, target) {
                return target != player && target.countDiscardableCards(player, 'he') > 0;
            };
            if (!game.hasPlayer(function (current) {
                return filterTarget(null, player, current);
            })) event._result = { bool: false };
            else player.chooseTarget(filterTarget, '弃置一名其他角色的一张牌或摸一张牌').set('ai', function (target) {
                var att = get.attitude(player, target);
                if (att >= 0) return 0;
                if (target.countCards('he', function (card) {
                    return get.value(card) > 5;
                })) return -att;
                return 0;
            });
            'step 3';
            if (!result.bool) {
                player.logSkill('zshy_zhaoran');
                player.chooseDrawRecover(true);
            } else {
                var target = result.targets[0];
                player.logSkill('zshy_zhaoran', target);
                player.discardPlayerCard(target, 'he', true);
            }
            if (event.count > 0) event.goto(1);
        },
        group: ['zshy_zhaoran_use'],
        subSkill: {
            use: {
                audio: 'zshy_zhaoran',
                trigger: {
                    player: 'phaseUseBegin',
                },
                forced: true,
                content() {
                    player.showHandcards();
                    event.cards = player.getCards('h');
                    var suits = ['spade', 'club', 'none', 'heart', 'diamond'];
                    for (var i = 0; i < event.cards.length; i++) {
                        var suit = get.suit(event.cards[i]);
                        if (suits.includes(suit)) {
                            suits.remove(suit), player.recover();
                        }
                    }
                    if (suits.length) {
                        player.draw(suits.length);
                    }
                },
            },
        },
    },
    zshy_chengwu: {//成务
        audio: 'ext:诸神寰宇/audio/character:2',
        zhuSkill: true,
        mod: {
            inRange(from, to) {
                if (!from.hasZhuSkill('zshy_chengwu') || from._zshy_chengwu) return;
                from._zshy_chengwu = true;
                var bool = game.hasPlayer(function (current) {
                    return current != from && current != to && current.group == 'jin' && from.hasZhuSkill('zshy_chengwu', current) && current.inRange(to);
                });
                delete from._zshy_chengwu;
                if (bool) return true;
            },
        },
    },

    zshy_shiren: {//识人
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'showCharacterAfter',
        },
        async cost(event, trigger, player) {
            event.result = await player.chooseTarget(get.prompt('zshy_shiren'), `选择一名角色获得其两张牌并对其造成1点伤害`, function (card, player, target) {
                return target != player && target.countCards('h');
            }).set('ai', function (target) {
                return -get.attitude(_status.event.player, target) * target.countCards('h');
            }).forResult();
        },
        async content(event, trigger, player) {
            const target = event.targets[0];
            player.gainPlayerCard(target, 'he', 2, true);
            target.damage();
        },
        ai: {
            expose: 0.2,
        },
    },
    zshy_yanxi: {//宴戏
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'gainAfter',
        },
        check(event, player) {
            return get.attitude(player, event.player) < 0;
        },
        filter(event, player) {
            if (!event.player.countCards('he')) return false;
            return event.cards && event.cards.length > 1 && event.player != player;
        },
        logTarget: 'player',
        prompt2(event, player) {
            var str = '随机将' + get.translation(event.player) + '的一张牌';
            str += '与牌堆顶一张牌混合后展示，然后你进行猜测';
            return str;
        },
        content() {
            'step 0'
            var target = trigger.player;
            event.target = target;
            event.card = target.getCards('he').randomGet();
            var cards = get.cards();
            event.cards = cards.concat([event.card]);
            while (cards.length) ui.cardPile.insertBefore(cards.pop().fix(), ui.cardPile.firstChild);
            game.updateRoundNumber();
            event.cards.randomSort();
            game.log(player, '展示了', event.cards);
            event.videoId = lib.status.videoId++;
            var str = get.translation(player) + '对' + get.translation(target) + '发动了〖宴戏〗';
            game.broadcastAll(function (str, id, cards) {
                var dialog = ui.create.dialog(str, cards);
                dialog.videoId = id;
            }, str, event.videoId, event.cards);
            game.addVideo('showCards', player, [str, get.cardsInfo(event.cards)]);
            game.delay(2);
            'step 1'
            var func = function (id, target) {
                var dialog = get.idDialog(id);
                if (dialog) dialog.content.firstChild.innerHTML = '宴戏：猜测哪张是' + get.translation(target) + '的牌？';
            };
            if (player == game.me) func(event.videoId, target);
            'step 2'
            var next = player.chooseButton(true);
            next.set('dialog', event.videoId);
            next.set('ai', function (button) {
                if (_status.event.answer) return button.link == _status.event.answer ? 1 : 0;
                return get.value(button.link, _status.event.player);
            });
            if (player.hasSkillTag('viewHandcard', null, target, true)) next.set('answer', card);
            'step 3'
            game.broadcastAll('closeDialog', event.videoId);
            var card2 = result.links[0];
            if (card2 == card) {
                player.popup('猜测正确');
                cards.remove(card2);
                player.$gain2(cards);
                player.gain(cards, 'log').gaintag.add('zshy_yanxi');
                player.gain(card, target, 'bySelf', 'give').gaintag.add('zshy_yanxi');
                target.damage();
                event.finish();
            }
            else {
                player.popup('猜测错误');
                player.gain(card2, 'gain2').gaintag.add('zshy_yanxi');
                player.recover();
            }
        },
        mod: {
            ignoredHandcard(card, player) {
                if (card.hasGaintag('zshy_yanxi')) return true;
            },
            cardDiscardable(card, player, name) {
                if (name == 'phaseDiscard' && card.hasGaintag('zshy_yanxi')) return false;
            },
            cardUsable(card, player, target) {
                if (!card.cards) return;
                for (var i of card.cards) {
                    if (!i.hasGaintag('zshy_yanxi')) return;
                }
                return Infinity;
            },
            targetInRange(card, player, target) {
                if (!card.cards) return;
                for (var i of card.cards) {
                    if (!i.hasGaintag('zshy_yanxi')) return;
                }
                return true;
            },
        },
    },

    //墟杜预
    zshy_sanchen: {//三陈
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: ['damageEnd', 'phaseUseBegin'],
        },
        async cost(event, trigger, player) {
            const str = `你可${event.triggername == 'phaseUseBegin' ? '令' + get.translation(trigger.player) : '选择一名角色令其'}摸一张牌并重铸三张牌（不满三张则全部重铸）。若以此法重铸的牌类别均不同，则其回复1点体力并摸一张牌，然后令其重复执行〖三陈〗效果。`
            if (event.triggername == 'phaseUseBegin') {
                event.result = await player.chooseBool(get.prompt(event.skill, trigger.player), str)
                    .set('ai', function () {
                        const player = _status.event.player;
                        return get.attitude(player, trigger.player) > 2;
                    }).forResult();
            } else {
                event.result = await player.chooseTarget(get.prompt(event.skill), str)
                    .set('ai', function (target) {
                        const player = _status.event.player;
                        return get.attitude(player, target) > 2;
                    }).forResult();
            }
        },
        async content(event, trigger, player) {
            const target = event.triggername == 'phaseUseBegin' ? trigger.player : event.targets[0];
            let condition = true;
            do {
                condition = false;
                await target.draw();
                let str = `三陈：请重铸${target.countCards('he') > 2 ? 3 : target.countCards('he')}张牌`;
                if (!target.countCards('he')) {
                    condition = true;
                }
                else {
                    const result = await target.chooseCard('he', str, [Math.min(3, target.countCards('he')), Math.min(3, target.countCards('he'))], true)
                        .set('ai', function (card) {
                            var list = ui.selected.cards.map(function (i) {
                                return get.type2(i);
                            });
                            if (!list.includes(get.type2(card))) return 7 - get.value(card);
                            return -get.value(card);
                        }).forResult();
                    if (result.bool && result.cards && result.cards.length) {
                        target.recast(result.cards);
                        let list = [];
                        for (var i of result.cards) {
                            list.add(get.type2(i));
                        }
                        if (list.length == result.cards.length) {
                            target.recover();
                            target.draw();
                            condition = true;
                        };
                    }
                }
            } while (condition);
        },
        ai: {
            expose: 0.8,
            order: 10,
            result: {
                target(player, target) {
                    var att = get.attitude(player, target);
                    if (att > 0) return 1;
                    return 0;
                },
            },
        },
    },
    zshy_pozhu: {//破竹
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        viewAsFilter(player) {
            return player.countCards('hes') > 0;
        },
        viewAs: {
            name: 'chuqibuyi',
        },
        filterCard: true,
        position: 'hes',
        check(card) {
            return 7 - get.value(card);
        },
        ai: {
            basic: {
                order: 5,
                useful: 2,
                value: 6,
            },
            yingbian(card, player, targets, viewer) {
                if (get.attitude(viewer, player) <= 0) return 0;
                if (
                    game.hasPlayer(function (current) {
                        return !targets.includes(current) && lib.filter.targetEnabled2(card, player, current) && get.effect(current, card, player, player) > 0;
                    })
                )
                    return 6;
                return 0;
            },
            result: {
                target: (player, target, card) => {
                    let suit = get.suit(card),
                        view = player.hasSkillTag('viewHandcard', null, target, true),
                        fz = 0,
                        fm = 0;
                    target.getCards('h', i => {
                        if (i.isKnownBy(player)) {
                            if (suit !== get.suit(i)) {
                                if (view || get.is.shownCard(i)) return -2;
                                fz++;
                                fm++;
                            } else if (!view && !get.is.shownCard(i)) fm++;
                        } else {
                            fz += 0.75;
                            fm++;
                        }
                    });
                    if (!fm) return 0;
                    return (-2 * fz) / fm;
                },
            },
            tag: {
                damage: 1,
            },
        },
        group: ['zshy_pozhu_use'],
        subSkill: {
            use: {
                trigger: {
                    player: ['useCard'],
                },
                forced: true,
                filter(event, player) {
                    return get.name(event.card) == 'chuqibuyi';
                },
                async content(event, trigger, player) {
                    let suits = get.suit(trigger.card);
                    switch (suits) {
                        case 'spade':
                            trigger.directHit.addArray(game.players);
                            break;
                        case 'club':
                            player.draw();
                            break;
                        case 'heart':
                            player.recover();
                            break;
                        case 'diamond':
                            trigger.baseDamage++;
                            break;
                        default:
                            break;
                    }
                },
                ai: {
                    directHit_ai(player, tag, arg) {
                        if (get.suit(arg.card) == 'spade') return true;
                    },
                    skillTagFilter(player, tag, arg) {
                        return get.suit(arg.card);
                    },
                },
            },
        },
    },
    zshy_zhaotao: {//诏讨
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'phaseBegin',
        },
        filter(event, player) {
            return event.player != player;
        },
        prompt2(event, player) {
            return `随机废除${get.translation(event.player)}一个装备栏，然后令其非状态技失效直到其回合开始`;
        },
        logTarget(event, player) {
            return event.player;
        },
        check(event, player) {
            return get.attitude(player, event.player) < 0;
        },
        async content(event, trigger, player) {
            const disables = [];
            for (let i2 = 1; i2 <= 5; i2++) {
                for (let j = 0; j < trigger.player.countEnabledSlot(i2); j++) {
                    disables.push(i2);
                }
            }
            if (disables.length > 0) {
                await trigger.player.disableEquip(disables.randomGet(1));
            }
            trigger.player.addTempSkill('baiban', { player: 'phaseBegin' });
        },
        ai: {
            result: -1,
        },
    },

    zshy_zhongyun: {//忠允
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: ['damageEnd', 'recoverEnd'] },
        forced: true,
        filter(event, player) {
            return (player.hp == player.countCards('h') && (player.isDamaged() || game.hasPlayer(function (current) {
                return player.inRange(current);
            })));
        },
        preHidden: ['zshy_zhongyun_sub'],
        content() {
            'step 0'
            var filterTarget = function (card, player, target) {
                return player.inRange(target);
            };
            if (game.hasPlayer(current => filterTarget('L∞pers', player, current))) {
                var bool = player.isHealthy();
                player.chooseTarget('忠允：对攻击范围内的一名角色造成1点伤害' + (bool ? '' : '，或点取消回复1点体力'), filterTarget, bool).set('ai', function (target) {
                    var player = _status.event.player;
                    return get.damageEffect(target, player, player);
                });
            } else event._result = { bool: false };
            'step 1'
            if (result.bool) {
                var target = result.targets[0];
                player.line(target, 'green');
                target.damage();
            } else player.recover();
        },
        group: 'zshy_zhongyun_sub',
        subSkill: {
            sub: {
                audio: 'zshy_zhongyun',
                trigger: {
                    player: ['loseAfter'],
                    global: ['equipAfter', 'addJudgeAfter', 'gainAfter', 'loseAsyncAfter', 'addToExpansionAfter'],
                },
                forced: true,
                sourceSkill: 'zshy_zhongyun',
                filter(event, player) {
                    var cards1 = event.getl(player).hs,
                        cards2 = [];
                    if (event.getg) cards2 = event.getg(player);
                    return (cards1.length > 0 || cards2.length > 0) && player.countCards('h') == player.hp;
                },
                content() {
                    'step 0'
                    if (trigger.delay === false) game.delayx();
                    var filterTarget = function (card, player, target) {
                        return target != player && target.countDiscardableCards(player, 'he') > 0;
                    };
                    if (!game.hasPlayer(current => filterTarget('L∞pers', player, current))) event._result = { bool: false };
                    else player.chooseTarget(filterTarget, '忠允：弃置一名其他角色的一张牌，或点取消摸一张牌').set('ai', function (target) {
                        var att = get.attitude(player, target);
                        if (att >= 0) return 0;
                        if (
                            target.countCards('he', function (card) {
                                return get.value(card) > 5;
                            })
                        )
                            return -att;
                        return 0;
                    });
                    'step 1'
                    if (!result.bool) player.draw();
                    else {
                        var target = result.targets[0];
                        player.line(target, 'green');
                        player.discardPlayerCard(target, true, 'he');
                    }
                },
            },
        },
    },
    zshy_shenpin: {//神品
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'judge',
        },
        filter(event, player) {
            var suit = get.suit(event.player.judging[0], event.player);
            return (player.countCards('hes', function (card) {
                if (_status.connectMode && get.position(card) != 'e') return true;
                return get.suit(card) != suit;
            }) > 0);
        },
        direct: true,
        preHidden: true,
        content() {
            'step 0'
            var suit = get.suit(trigger.player.judging[0], trigger.player);
            player
                .chooseCard(get.translation(trigger.player) + '的' + (trigger.judgestr || '') + '判定为' + get.translation(trigger.player.judging[0]) + '，' + get.prompt('shenpin'), 'hes', function (card) {
                    if (get.suit(card) == _status.event.suit) return false;
                    var player = _status.event.player;
                    var mod2 = game.checkMod(card, player, 'unchanged', 'cardEnabled2', player);
                    if (mod2 != 'unchanged') return mod2;
                    var mod = game.checkMod(card, player, 'unchanged', 'cardRespondable', player);
                    if (mod != 'unchanged') return mod;
                    return true;
                })
                .set('ai', function (card) {
                    var trigger = _status.event.getTrigger();
                    var player = _status.event.player;
                    var judging = _status.event.judging;
                    var result = trigger.judge(card) - trigger.judge(judging);
                    var attitude = get.attitude(player, trigger.player);
                    if (attitude == 0 || result == 0) return 0;
                    if (attitude > 0) {
                        return result;
                    } else {
                        return -result;
                    }
                })
                .set('judging', trigger.player.judging[0])
                .set('suit', suit)
                .setHiddenSkill(event.name);
            'step 1';
            if (result.bool) {
                player.respond(result.cards, 'highlight', 'shenpin', 'noOrdering');
            } else {
                event.finish();
            }
            'step 2';
            if (result.bool) {
                if (trigger.player.judging[0].clone) {
                    trigger.player.judging[0].clone.classList.remove('thrownhighlight');
                    game.broadcast(function (card) {
                        if (card.clone) {
                            card.clone.classList.remove('thrownhighlight');
                        }
                    }, trigger.player.judging[0]);
                    game.addVideo('deletenode', player, get.cardsInfo([trigger.player.judging[0].clone]));
                }
                game.cardsDiscard(trigger.player.judging[0]);
                trigger.player.judging[0] = result.cards[0];
                trigger.orderingCards.addArray(result.cards);
                game.log(trigger.player, '的判定牌改为', result.cards[0]);
                game.delay(2);
            }
        },
        ai: {
            rejudge: true,
            tag: {
                rejudge: 1,
            },
        },
    },

};
const 文德武备戒 = {
    //墟钟琰
    zshy_bolan: {//博览
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: 'phaseUseBegin' },
        frequent: true,
        preHidden: true,
        initList(player) {
            var list = [], skills = [];
            for (var i in lib.character) {
                if (lib.filter.characterDisabled2(i) || lib.filter.characterDisabled(i)) {
                    continue;
                }
                list.push(i);
            }
            for (var i of list) {
                if (i.indexOf('gz_jun') === 0) {
                    continue;
                }
                for (var j of (get.character(i)[3] || [])) {
                    if (j == 'zshy_bolan') {
                        continue;
                    }
                    var skill = lib.skill[j];
                    if (!skill || skill.juexingji || skill.hiddenSkill || skill.zhuSkill || skill.dutySkill || skill.chargeSkill || lib.skill.zshy_bolan.banned.includes(j)) {
                        continue;
                    }
                    if (skill.init || (skill.ai && (skill.ai.combo || skill.ai.notemp || skill.ai.neg))) {
                        continue;
                    }
                    var info = lib.translate[j + '_info'];
                    if (info) {
                        skills.add(j);
                    }
                }
            }
            player.storage.zshy_bolan = skills;
        },
        banned: ['kotomi_chuanxiang'],
        logTarget(event, player) {
            return event.player;
        },
        check(event, player) {
            return get.attitude(player, event.player) > 0;
        },
        async content(event, trigger, player) {
            const list = [];
            const skills = [];
            _status.characterskill = [];
            for (const i in lib.character) {
                const cinfo4 = get.character(i);
                const excludeTags = ['boss', 'minskin', 'hiddenboss', 'Unaffected', 'stonehidden'];
                if (excludeTags.some(tag => cinfo4[4].includes(tag))) continue;
                if (Array.isArray(cinfo4[3])) await _status.characterskill.addArray(cinfo4[3]);
            }
            for (const i in lib.skill) {
                if (lib.skill[i].nobracket == true) continue;
                if (!get.translation(i, 'info') || get.translation(i + '_info').length === 0) continue;
                if (_status.characterskill.includes(i)) await skills.add(i);
            }
            const links = skills.randomGets(3);
            for (const skill of links) {
                list.push([skill, '<div class="popup text" style="width:calc(100%-10px);display:inline-block"><div class="skill">【' +
                    get.translation(skill) + '】</div><div>' + lib.translate[skill + '_info'] + '</div></div>',
                ])
            }
            const next = await player.chooseButton([
                '博览：请选择' + get.translation(player) + '获得的技能（不选择点击确定即可）',
                [list, 'textbutton']])
                .set('forced', true).set('selectButton', [0, 1])
                .set('ai', function (button) {
                    const skill = button.link;
                    const excludeTags = ['nodamage', 'nofire', 'nothunder', 'damage', 'directHit'];
                    if (excludeTags.some(tag => skill.includes(tag))) return 100;
                    return 3 + Math.random() * 2;
                }).set('skills', links).forResult();
            if (next.bool) {
                const skills = next.links;
                await player.addSkills(skills.slice(0));
                game.log(player, '获得了以下技能：', '#g' + get.translation(skills));
            }
        },
        ai: { threaten: 0.9 },
        subSkill: {
            g: {
                audio: 'zshy_bolan',
                forceaudio: true,
                enable: 'phaseUse',
                usable: 1,
                prompt: '出牌阶段限1次。你可以令一名有〖博览〗的角色从3个技能中选择1个令你获得。',
                filter(event, player) {
                    return game.hasPlayer(function (current) {
                        return current != player && current.hasSkill('zshy_bolan');
                    });
                },
                filterTarget(card, player, target) {
                    return player != target && target.hasSkill('zshy_bolan');
                },
                selectTarget() {
                    if (
                        game.countPlayer(current => {
                            return lib.skill.zshy_bolan_g.filterTarget(null, _status.event.player, current);
                        }) == 1
                    ) {
                        return -1;
                    }
                    return 1;
                },
                content() {
                    'step 0';
                    player.loseMaxHp();
                    'step 1';
                    if (target.isIn() && player.isIn()) {
                        if (!target.storage.zshy_bolan) {
                            lib.skill.zshy_bolan.initList(target);
                        }
                        var list = target.storage.zshy_bolan.randomGets(3);
                        if (!list.length) {
                            event.finish();
                            return;
                        }
                        target.chooseControl(list).set(
                            'choiceList',
                            list.map(function (i) {
                                return "<div class='skill'>【" + get.translation(lib.translate[i + '_ab'] || get.translation(i).slice(0, 2)) + '】</div><div>' + get.skillInfoTranslation(i, player) + '</div>';
                            })
                        ).set('displayIndex', false)
                            .set('prompt', '博览：请选择令' + get.translation(player) + '获得的技能')
                            .set('ai', () => {
                                var list = _status.event.controls.slice();
                                return list.sort((a, b) => {
                                    return (get.skillRank(b, 'in') - get.skillRank(a, 'in')) * get.attitude(_status.event.player, _status.event.getParent().player);
                                })[0];
                            });
                    } else {
                        event.finish();
                    }
                    'step 2';
                    target.line(player);
                    player.addSkills(result.control);
                },
                ai: {
                    order(item, player) {
                        if (player.hp >= 5 || player.countCards('h') >= 10) {
                            return 10;
                        }
                        var list = game.filterPlayer(current => lib.skill.zshy_bolan_g.filterTarget(null, player, current));
                        for (var target of list) {
                            if (get.attitude(target, player) > 0) {
                                return 10;
                            }
                        }
                        return 4;
                    },
                    result: {
                        player(player, target) {
                            if (player.hasUnknown()) {
                                return player.hp + player.countCards('h') / 4 - 5 > 0 ? 1 : 0;
                            }
                            var tao = player.countCards('h', 'tao');
                            if (player.hp + tao > 3) {
                                return 4 + get.attitude(player, target);
                            }
                            if (player.hp + tao > 2) {
                                return get.attitude(player, target) - 2;
                            }
                            return 0;
                        },
                    },
                },
            },
        },

    },
    zshy_yifa: {//仪法
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { target: 'useCardToTargeted' },
        forced: true,
        logTarget: 'player',
        filter(event, player) {
            return player != event.player;
        },
        async content(event, trigger, player) {
            trigger.player.addSkill('zshy_yifa_debuff');
            trigger.player.addMark('zshy_yifa_debuff', 1, false);
        },
        ai: { threaten: 1 },
        subSkill: {
            debuff: {
                charlotte: true,
                onremove: true,
                intro: { content: '手牌上限-#' },
                mod: {
                    maxHandcard(player, num) {
                        return num - player.countMark('zshy_yifa_debuff');
                    },
                },
            },
        },
    },

    //墟辛敞
    zshy_canmou: {//参谋
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: 'useCardToPlayer' },
        direct: true,
        filter(event, player) {
            if (!event.isFirstTarget || (get.type(event.card, null, false) != 'trick' && get.type(event.card, null, false) != 'basic')) {
                return false;
            }
            var info = get.info(event.card);
            if (info.allowMultiple == false) {
                return false;
            }
            if (event.targets && !info.multitarget) {
                if (game.hasPlayer(function (current) {
                    return !event.targets.includes(current) && lib.filter.targetEnabled2(event.card, event.player, current); //&&lib.filter.targetInRange(event.card,event.player,current);
                })) {
                    return true;
                }
            }
            return false;
        },
        preHidden: true,
        content() {
            'step 0';
            var prompt2 = '为' + get.translation(trigger.card) + '增加一个目标';
            player.chooseTarget(get.prompt('zshy_canmou'), function (card, player, target) {
                var player = _status.event.source;
                return !_status.event.targets.includes(target) && lib.filter.targetEnabled2(_status.event.card, player, target); //&&lib.filter.targetInRange(_status.event.card,player,target);
            }).set('prompt2', prompt2).set('ai', function (target) {
                var trigger = _status.event.getTrigger();
                var player = _status.event.source;
                return get.effect(target, trigger.card, player, _status.event.player);
            }).set('targets', trigger.targets).set('card', trigger.card)
                .set('source', trigger.player)
                .setHiddenSkill(event.name);
            'step 1';
            if (result.bool) {
                if (!event.isMine() && !event.isOnline()) {
                    game.delayx();
                }
                event.targets = result.targets;
            } else {
                event.finish();
            }
            'step 2';
            if (event.targets) {
                player.logSkill(event.name, event.targets);
                trigger.targets.addArray(event.targets);
                game.log(event.targets, '也成为了', trigger.card, '的目标');
            }
        },
    },
    zshy_XCcongjian: {//从鉴
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: 'useCardToTarget' },
        logTarget: 'target',
        filter(event, player) {
            if (!event.isFirstTarget || (get.type(event.card, null, false) != 'trick' && get.type(event.card, null, false) != 'basic')) {
                return false;
            }
            return event.target != player && lib.filter.targetEnabled2(event.card, event.player, player);
        },
        check(event, player) {
            return get.effect(player, event.card, event.player, player) > 0;
        },
        preHidden: true,
        content() {
            trigger.targets.push(player);
            game.log(player, '也成为了', trigger.card, '的目标');
            var next = game.createEvent('zshy_XCcongjian_draw', false);
            next.player = player;
            event.next.remove(next);
            trigger.getParent().after.push(next);
            next.setContent(function () {
                player.chooseDrawRecover(2, true);
            });
        },
    },

    //墟贾充
    zshy_xiongshu: {//凶竖
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: 'phaseUseBegin' },
        filter(event, player) {
            return player != event.player && event.player.countCards('h') > 0;
        },
        logTarget: 'player',
        async cost(event, trigger, player) {
            const { player: target } = trigger;
            const goon = get.attitude(player, target) < 0;
            let next;
            next = player.chooseBool(get.prompt(event.skill, target), '展示其一张牌')
                .set('goon', goon)
                .set('ai', () => {
                    return get.event().goon;
                });
            event.result = await next.forResult();
        },
        async content(event, trigger, player) {
            const { player: target } = trigger,
                { name: skillName } = event;
            if (!target.countCards('h')) {
                return;
            }
            const { cards } = await player.choosePlayerCard(target, true, 'h').forResult();
            if (!cards?.length) {
                return;
            }
            const [card] = cards,
                name = get.name(card),
                str = get.translation(target);
            await player.showCards(card, get.translation(player) + '对' + str + '发动了【凶竖】');
            const { index } = await player.chooseControl('会使用', '不会使用')
                .set('prompt', '预测：' + str + '是否会使用' + get.translation(name) + '？')
                .set('choice',
                    (() => {
                        if (!target.hasValueTarget(card)) {
                            return 1;
                        }
                        return Math.random() < 0.5 ? 0 : 1;
                    })()
                )
                .set('ai', () => get.event().choice)
                .forResult();
            if (typeof index != 'number') {
                return;
            }
            if (Math.random() < 0.5) {
                target.storage.zshy_xiongshu_ai = name;
                target.addTempSkill('zshy_xiongshu_ai', 'phaseUseAfter');
            }
            player.when({ global: 'phaseUseEnd' })
                .filter(evt => evt == trigger)
                .step(async () => {
                    if (target.hasHistory('useCard', evt => evt.card.name == name && evt.getParent('phaseUse') == trigger) == (index == 0)) {
                        if (target.isIn()) {
                            await target.damage();
                        }
                    } else {
                        if (target.getCards('hej').includes(card)) {
                            await player.gain(card, target, 'give');
                        } else if (get.position(card, true) == 'd') {
                            await player.gain(card, 'gain2');
                        }
                    }
                });
        },
        ai: { expose: 0.35 },
        subSkill: {
            ai: {
                charlotte: true,
                onremove: true,
                ai: {
                    effect: {
                        player_use(card, player, target) {
                            if (card.name == player.storage.zshy_xiongshu_ai) {
                                return 'zeroplayertarget';
                            }
                        },
                    },
                },
            },
        },
    },
    zshy_jianhui: {//奸回
        audio: 'ext:诸神寰宇/audio/character:2',
        getLastPlayer(evt, player) {
            var history = player.getAllHistory('damage');
            if (!history.length) {
                return null;
            }
            var i = history.indexOf(evt);
            if (i == -1) {
                i = history.length - 1;
            } else {
                i--;
            }
            for (i; i >= 0; i--) {
                if (history[i].source) {
                    return history[i].source;
                }
            }
            return null;
        },
        trigger: { player: 'damageEnd' },
        forced: true,
        filter(event, player) {
            return event.source && event.source.isIn();
        },
        content() {
            trigger.source.chooseToDiscard('he', true);
            player.draw();
        },
        group: 'zshy_jianhui_draw',
        subSkill: {
            draw: {
                audio: 'zshy_jianhui',
                trigger: { source: 'damageSource' },
                forced: true,
                logTarget: 'player',
                content() {
                    trigger.player.loseHp();
                    player.recover();
                },
            },
        },
    },

    //墟王祥
    zshy_bingxin: {//冰心
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: ['chooseToUse', 'chooseToRespond'],
        hiddenCard(player, name) {
            if ((get.type(name) == 'basic') && lib.inpile.includes(name)) {
                return true;
            }
        },
        filter(event, player) {
            const hs = player.getCards('h');
            if (hs.length == Math.max(0, player.maxHp)) {
                return false;
            }
            for (var i of lib.inpile) {
                if (get.type(i) != 'basic') {
                    continue;
                }
                var card = { name: i, isCard: true };
                if (event.filterCard(card, player, event)) {
                    return true;
                }
                if (i == 'sha') {
                    for (var j of lib.inpile_nature) {
                        card.nature = j;
                        if (event.filterCard(card, player, event)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        },
        chooseButton: {
            dialog(event, player) {
                var list = [];
                for (var i of lib.inpile) {
                    if (get.type(i) != 'basic') {
                        continue;
                    };
                    var card = { name: i, isCard: true };
                    if (event.filterCard(card, player, event)) {
                        if (get.type(i) == 'basic') list.push(['基本', '', i]);
                    }
                    if (i == 'sha') {
                        for (var j of lib.inpile_nature) {
                            card.nature = j;
                            if (event.filterCard(card, player, event)) {
                                list.push(['基本', '', i, j]);
                            }
                        }
                    }
                }
                return ui.create.dialog('冰心', [list, 'vcard'], 'hidden');
            },
            check(button) {
                if (button.link[2] == 'shan') {
                    return 3;
                }
                var player = _status.event.player;
                if (button.link[2] == 'jiu') {
                    if (player.getUseValue({ name: 'jiu' }) <= 0) {
                        return 0;
                    }
                    if (player.countCards('h', 'sha')) {
                        return player.getUseValue({ name: 'jiu' });
                    }
                    return 0;
                }
                return player.getUseValue({ name: button.link[2], nature: button.link[3] }) / 4;
            },
            backup(links, player) {
                return {
                    selectCard: -1,
                    filterCard: () => false,
                    viewAs: {
                        name: links[0][2],
                        nature: links[0][3],
                        isCard: true,
                    },
                    log: false,
                    precontent(event) {
                        player.logSkill('zshy_bingxin');
                        const hs = player.getCards('h');
                        if (hs.length > player.maxHp) {
                            const num = hs.length - player.maxHp;
                            player.chooseToDiscard('h', num, true);
                        } else player.drawTo(player.maxHp);
                    },
                };
            },
            prompt(links, player) {
                var name = links[0][2];
                var nature = links[0][3];
                return '摸一张并视为使用' + (get.translation(nature) || '') + get.translation(name);
            },
        },
        ai: {
            order: 1,
            respondShan: true,
            respondSha: true,
            skillTagFilter(player, tag, arg) {
                var hs = player.getCards('h');
                if (hs.length != Math.max(0, hs.length)) {
                    return false;
                }
            },
            result: {
                player(event, player) {
                    if (_status.event.dying) {
                        return get.attitude(player, _status.event.dying);
                    }
                    return 1;
                },
            },
        },
    },

};
const 文德武备约 = {
    //墟杨艳
    zshy_xuanbei: {//选备
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        filter(event, player) {
            return game.hasPlayer((current) => lib.skill.zshy_xuanbei.filterTarget(null, player, current));
        },
        filterTarget(card, player, target) {
            return target.countCards('hej') && !player.getStorage('zshy_xuanbei').includes(target);
        },
        content() {
            'step 0'
            player.choosePlayerCard(target, 'hej', true);
            'step 1'
            if (result.bool) {
                var card = result.cards[0];
                event.card = card;
                player.showCards(card);
                player.markAuto('zshy_xuanbei', [target]);
                var str = '选备：请使用' + get.translation(card) + '，否则摸1张牌';
                str += '并令' + get.translation(target) + '尝试将此牌当作【杀】对你使用';
                player.chooseUseTarget(card, 'nodistance').set('addCount', false).set('prompt', str);
            }
            else event.finish();
            'step 2'
            if (!result.bool) {
                player.draw();
                var cardx = get.autoViewAs({ name: 'sha' }, [card]);
                if (target != player && target.canUse(cardx, player)) {
                    if (target.isIn()) target.useCard(cardx, [card], player);
                }
            }
        },
        ai: {
            order() {
                return [3, 5, 7, 9].randomGet();
            },
            result: {
                player(player, target) {
                    var att = get.attitude(player, target);
                    if (att < 0) return get.effect(target, { name: 'guohe_copy' }, player, player);
                    if (att >= 0) return target.countCards('he') >= 5;
                    return 0;
                },
            },
        },
        onremove: true,
        intro: {
            content: '本阶段已对$发动过〖选备〗',
            onunmark: true,
        },
        group: 'zshy_xuanbei_Delete',
        subSkill: {
            Delete: {
                trigger: {
                    global: 'phaseUseAfter',
                },
                charlotte: true,
                popup: false,
                silent: true,
                forced: true,
                firstDo: true,
                content() {
                    player.unmarkSkill('zshy_xuanbei');
                },
            },
        },
    },
    zshy_xianwan: {//娴婉
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: ['chooseToUse', 'chooseToRespond'],
        log: false,
        check: () => 1,
        selectCard: -1,
        filterCard: () => false,
        prompt: '将武将牌横置/重置并视为使用或打出【闪】/【杀】',
        filter(event, player) {
            return (event.filterCard && event.filterCard({
                name: 'sha' + (player.isLinked() ? '' : 'n'), isCard: true,
            }, player, event));
        },
        viewAs(cards, player) {
            return { name: 'sha' + (player.isLinked() ? '' : 'n'), isCard: true, };
        },
        precontent() {
            'step 0'
            player.logSkill('zshy_xianwan');
            player.link();
            'step 1'
            if (player.isLinked() == true && game.countPlayer(function (current) {
                return current.isDamaged();
            }) == 0) event.finish();
            else player.chooseTarget(get.prompt('zshy_xianwan'), player.isLinked() ? '选择一名角色回复1点体力' : '对一名其他角色造成1点伤害', function (event, player, target) {
                if (!player.isLinked()) {
                    return target != player;
                }
                else return target.isDamaged();
            }).set('ai', function (target) {
                if (!player.isLinked()) return get.damageEffect(target, _status.event.player, player);
                else return get.recoverEffect(target, _status.event.player, player);
            });
            'step 2'
            if (result.targets) {
                if (!player.isLinked()) {
                    result.targets[0].damage();
                }
                else {
                    result.targets[0].recover();
                }
            }
        },
        ai: {
            order: 3.4,
            respondSha: true,
            respondShan: true,
            skillTagFilter(player, tag) {
                return tag == 'respondSha' + (player.isLinked() ? '' : 'n');
            },
            effect: {
                target(card, player, target, current) {
                    if (get.tag(card, 'respondShan') && current < 0 && !player.isLinked()) return 0.4;
                },
            },
        },
    },

    //墟杨芷
    zshy_wanyi: {//婉嫕
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'useCardToTargeted',
        },
        filter(event, player) {
            return player != event.target && (get.name(event.card) == 'sha' || get.type(event.card, null, false) == 'trick') && event.target.countCards('he') > 0;
        },
        locked: false,
        logTarget: 'target',
        check(event, player) {
            return get.effect(event.target, { name: 'guohe_copy2' }, player, player) > 0;
        },
        prompt2: '将该角色的一张牌置于武将牌上作为「嫕」',
        content() {
            'step 0';
            event.target = trigger.target;
            player.choosePlayerCard(event.target, true, 'he');
            'step 1';
            if (result.bool) {
                var cards = result.cards;
                player.addToExpansion(cards, target, 'give').gaintag.add('zshy_wanyi');
            }
        },
        mod: {
            ignoredHandcard(card, player) {
                var cards = player.getExpansions('zshy_wanyi');
                if (cards.length) {
                    var suit = get.suit(card);
                    if (suit == 'none') return;
                    for (var i of cards) {
                        if (get.suit(i, player) == suit) return false;
                    }
                }
            },
            cardDiscardable(card, player) {
                var cards = player.getExpansions('zshy_wanyi');
                if (cards.length) {
                    var suit = get.suit(card);
                    if (suit == 'none') return;
                    for (var i of cards) {
                        if (get.suit(i, player) == suit) return false;
                    }
                }
            },
        },
        marktext: '嫕',
        intro: {
            markcount: 'expansion',
            content: 'expansion',
        },
        onremove(player, skill) {
            var cards = player.getExpansions(skill);
            if (cards.length) player.loseToDiscardpile(cards);
        },
        group: 'zshy_wanyi_give',
        subSkill: {
            give: {
                audio: 'zshy_wanyi',
                trigger: {
                    player: ['phaseJieshuBegin', 'damageAfter'],
                },
                forced: true,
                locked: false,
                sourceSkill: 'zshy_wanyi',
                filter(event, player) {
                    return player.getExpansions('zshy_wanyi').length > 0;
                },
                content() {
                    'step 0';
                    player.chooseTarget(true, '婉嫕：令一名角色获得一张「嫕」').set('ai', function (target) {
                        return get.attitude(_status.event.player, target);
                    });
                    'step 1';
                    if (result.bool) {
                        var target = result.targets[0];
                        event.target = target;
                        player.line(target, 'green');
                        var cards = player.getExpansions('zshy_wanyi');
                        if (cards.length == 1) event._result = { bool: true, links: cards };
                        else player.chooseButton(['令' + get.translation(target) + '获得一张「嫕」', cards], true);
                    } else event.finish();
                    'step 2';
                    if (result.bool) {
                        target.gain(result.links, player, 'give');
                    }
                },
            },
        },
    },
    zshy_maihuo: {//埋祸
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            target: 'useCardToTargeted',
        },
        logTarget: 'player',
        filter(event, player) {
            return get.name(event.card) == 'sha' && event.cards.filterInD().length > 0 && event.getParent(2).name != 'zshy_maihuo_effect' && event.targets.length == 1 && event.player.isIn();
        },
        prompt2(event) {
            return '令' + get.translation(event.card) + '暂时对你无效';
        },
        check(event, player) {
            return get.effect(player, event.card, event.player, player) < 0;
        },
        content() {
            trigger.excluded.add(player);
            var target = trigger.player,
                cards = trigger.cards.filterInD();
            target.addToExpansion('gain2', cards).gaintag.add('zshy_maihuo_effect');
            target.storage.zshy_maihuo_target = player;
            target.addSkill('zshy_maihuo_effect');
        },
        group: 'zshy_maihuo_damage',
        subSkill: {
            effect: {
                trigger: {
                    player: 'phaseUseBegin',
                },
                forced: true,
                charlotte: true,
                sourceSkill: 'zshy_maihuo',
                filter(event, player) {
                    return player.getExpansions('zshy_maihuo_effect').length > 0;
                },
                content() {
                    'step 0'
                    var cards = player.getExpansions('zshy_maihuo_effect'),
                        card = cards[0];
                    if (card.name != 'sha') card = get.autoViewAs({ name: 'sha', nature: 'stab', isCard: true, }, cards);
                    var target = player.storage.zshy_maihuo_target;
                    if (target.isIn() && player.canUse(card, target, null, true)) {
                        player.useCard(card, target, cards);
                    }
                    'step 1'
                    player.removeSkill('zshy_maihuo_effect');
                },
                marktext: '祸',
                intro: {
                    content: 'expansion',
                    markcount: 'expansion',
                },
                onremove(player, skill) {
                    var cards = player.getExpansions(skill);
                    if (cards.length) player.loseToDiscardpile(cards);
                },
                ai: {
                    threaten: 1.05,
                },
            },
            damage: {
                trigger: {
                    source: 'damageSource',
                },
                forced: true,
                locked: false,
                sourceSkill: 'zshy_maihuo',
                filter(event, player) {
                    return event.player.hasSkill('zshy_maihuo_effect') && event.player.getExpansions('zshy_maihuo_effect').length > 0;
                },
                content() {
                    trigger.player.removeSkill('zshy_maihuo_effect');
                    player.recover();
                },
            },
        },
    },

};

const skill_AE = {
    ...文德武备理, ...文德武备备, ...文德武备果, ...文德武备戒, ...文德武备约,
};

export default skill_AE;
