import { lib, game, ui, get, ai, _status } from '../../../../noname.js'
const 百战虎贲 = {
    //墟文鸯
    zshy_lvli: {//膂力
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: ['damageEnd', 'recoverEnd'],
            source: 'damageSource'
        },
        forced: true,
        filter(event, player, name) {
            if (name == 'recoverEnd' && !player.storage.zshy_WYchoujue) {
                return false;
            }
            if (player.countCards('h') >= player.maxHp && (player.isHealthy() || player.hp >= player.countCards('h'))) {
                return false;
            }
            return true;
        },
        async content(event, trigger, player) {
            await player.drawTo(player.maxHp);
            const num = player.countCards('h') - player.hp;
            if (num > 0) {
                await player.recover(num);
            };
        },
        subSkill: {
            Infinity: {
                mod: {
                    cardUsable(player) {
                        return Infinity;
                    },
                },
            },
        },
    },
    zshy_WYchoujue: {//仇决
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: ['loseAfter', 'damageAfter'] },
        derivation: ['zshy_beishui', 'zshy_qingjiao'],
        skillAnimation: true,
        animationColor: 'water',
        juexingji: true,
        forced: true,
        init(player, skill) {
            if (!player.storage[skill]) {
                player.storage[skill] = false;
            }
        },
        filter(event, player) {
            if (player.storage.zshy_WYchoujue) {
                return false;
            }
            return Math.abs(player.hp - player.countCards('h')) > 1;
        },
        content() {
            player.awakenSkill(event.name);
            player.storage.zshy_WYchoujue = true;
            player.addSkills('zshy_beishui');
        },
    },
    zshy_beishui: {//背水
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: ['loseAfter', 'damageAfter'] },
        skillAnimation: 'epic',
        animationColor: 'thunder',
        juexingji: true,
        forced: true,
        init(player, skill) {
            if (!player.storage[skill]) {
                player.storage[skill] = false;
            }
        },
        filter(event, player) {
            if (player.storage.zshy_beishui) {
                return false;
            }
            return Math.min(player.hp, player.countCards('h')) < 3;
        },
        content() {
            player.awakenSkill(event.name);
            player.storage.zshy_beishui = true;
            player.addSkills(['zshy_lvli_Infinity', 'zshy_qingjiao']);
        },
    },
    zshy_qingjiao: {//清剿
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'phaseUseBegin' },
        content() {
            player.chooseToDiscard('h', player.countCards('h'), true);
            var list = [];
            var typelist = [];
            var getType = function (card) {
                var sub = get.subtype(card);
                if (sub) {
                    return sub;
                }
                return card.name;
            };
            for (var i = 0; i < ui.cardPile.childElementCount; i++) {
                var node = ui.cardPile.childNodes[i];
                var typex = getType(node);
                if (!typelist.includes(typex)) {
                    list.push(node);
                    typelist.push(typex);
                    if (list.length >= 8) {
                        break;
                    }
                }
            }
            if (list.length < 8) {
                for (var i = 0; i < ui.discardPile.childElementCount; i++) {
                    var node = ui.discardPile.childNodes[i];
                    var typex = getType(node);
                    if (!typelist.includes(typex)) {
                        list.push(node);
                        typelist.push(typex);
                        if (list.length >= 8) {
                            break;
                        }
                    }
                }
            }
            player.gain(list, 'gain2');
        },
        group: ['zshy_qingjiao_buff'],
        subSkill: {
            buff: {
                audio: 'zshy_qingjiao',
                trigger: { player: 'useCardToPlayered' },
                logTarget: 'target',
                filter(event, player) {
                    return event.target != player && event.target.countDiscardableCards(player, 'hes') > 0 && event.targets.length > 0;
                },
                check(event, player) {
                    return get.attitude(player, event.target) < 0;
                },
                prompt2(event, player, card) {
                    let num = event.targets.length;
                    if (event.targets.length > event.target.getCards('hes').length) {
                        num = event.target.countCards('hes');
                    };
                    return '弃置' + get.translation(event.target) + '的' + num + '张牌';
                },
                content() {
                    player.discardPlayerCard('hes', trigger.target, trigger.targets.length, true);
                },
            }
        }
    },

};
const 武庙 = {
    //墟武皇甫嵩
    zshy_chaozhen: {//朝镇
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: ['phaseZhunbeiBegin', 'dying'] },
        forced: true,
        async content(event, trigger, player) {
            var num = 1, num1 = 1, card, card1;
            let cards = game.filterPlayer().reduce((arr, current) => {
                if (current.countCards('ej')) {
                    arr.addArray(current.getCards('ej'));
                }
                return arr;
            }, [])
                .sort((a, b) => get.number(a, false) - get.number(b, false));
            if (cards.length) {
                num = get.number(cards[0], false);
                card = cards.filter(card => get.number(card, false) == num).randomGet();
            };
            while (num1 < 14) {
                let cardx = get.cardPile(card => get.number(card, false) == num1);
                if (cardx) {
                    card1 = cardx;
                    break;
                } else {
                    num1++;
                }
            }
            if (cards.length && card) {
                await player.gain(card, get.owner(card) ? 'give' : 'gain2');
                if (num == 1) {
                    if (player.hp < 1) {
                        await player.recoverTo(1);
                    } else {
                        await player.loseHp(Math.abs(1 - player.hp));
                    }
                }
            }
            if (card1) {
                await player.gain(card1, get.owner(card1) ? 'give' : 'gain2');
                if (num1 == 1) {
                    if (player.hp < 1) {
                        await player.recoverTo(1);
                    } else {
                        await player.loseHp(Math.abs(1 - player.hp));
                    }
                }
            }
        },
    },
    zshy_lianjie: {//连捷
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'useCardToPlayered',
        },
        locked: false,
        filter(event, player) {
            if (
                !game.hasPlayer(current => {
                    return current.countCards('h');
                }) ||
                !player.hasHistory('lose', evt => {
                    if ((evt.relatedEvent || evt.getParent()) != event.getParent()) {
                        return false;
                    }
                    return event.cards?.some(card => (evt.hs || []).includes(card));
                }) ||
                !player.countCards('h')
            ) {
                return false;
            }
            const num = get.number(event.card, player);
            if (typeof num !== 'number' || player.hasCard(card => get.number(card, player) < num, 'h')) {
                return false;
            }
            return event.isFirstTarget;
        },
        async cost(event, trigger, player) {
            event.result = await player
                .chooseTarget(get.prompt2(event.name.slice(0, -5)), (card, player, target) => {
                    return target.countCards('h');
                })
                //.set("drawed", player.getStorage("zshy_lianjie_used").includes(get.number(trigger.card, player) || 0))
                .set('ai', target => {
                    const player = get.player();
                    const eff1 = get.effect(target, { name: 'guohe_copy2' }, player, player);
                    const eff2 = get.effect(target, { name: 'draw' }, player, player);
                    if (player == target) {
                        return eff2 * (1 + player.maxHp - player.countCards('h'));
                    } // && !get.event().drawed
                    return eff1;
                })
                .forResult();
        },
        async content(event, trigger, player) {
            const num = get.number(trigger.card, player) || 0;
            const target = event.targets[0];
            const cards = target.getCards('h'),
                minNumber = cards.map(card => get.number(card)).sort((a, b) => a - b)[0];
            const toLose = cards.filter(card => get.number(card) === minNumber);
            if (target != player || toLose.length <= 1) {
                await target.lose(toLose.randomGet(), ui.cardPile);
            } else {
                const result = await player
                    .chooseCard('h', card => get.event().toLose?.includes(card), true)
                    .set('toLose', toLose)
                    .set('ai', card => 10 - get.value(card))
                    .forResult();
                if (result.bool) {
                    await player.lose(result.cards[0], ui.cardPile);
                }
            }
            game.broadcastAll(function (player) {
                var cardx = ui.create.card();
                cardx.classList.add('infohidden');
                cardx.classList.add('infoflip');
                player.$throw(cardx, 1000, 'nobroadcast');
            }, target);
            await game.delayx();
            const result = (await player.draw(player.getDamagedHp() + 1).forResult()).cards;
            if (result) {
                player.addGaintag(result, 'zshy_lianjie');
            }
        },
        mod: {
            aiOrder(player, card, num) {
                var number = get.number(card, player);
                if (player.countCards('h') < player.maxHp) {
                    return num + number / 10;
                }
            },
        },
        init(player) {
            player.addSkill('zshy_lianjie_effect');
        },
        subSkill: {
            effect: {
                charlotte: true,
                onremove(player) {
                    player.removeGaintag('zshy_lianjie');
                },
                trigger: {
                    player: 'useCard1',
                },
                filter(event, player) {
                    return (
                        event.addCount !== false &&
                        player.hasHistory('lose', evt => {
                            if (evt.getParent() != event) {
                                return false;
                            }
                            return Object.values(evt.gaintag_map).flat().includes('zshy_lianjie');
                        })
                    );
                },
                async cost(event, trigger, player) {
                    trigger.addCount = false;
                    const stat = player.getStat().card,
                        name = trigger.card.name;
                    if (typeof stat[name] === 'number') {
                        stat[name]--;
                    }
                },
                mod: {
                    targetInRange(card, player, target) {
                        if (get.suit(card) == 'unsure') {
                            return true;
                        }
                        if (!card.cards) {
                            return;
                        }
                        for (var i of card.cards) {
                            if (i.hasGaintag('zshy_lianjie')) {
                                return true;
                            }
                        }
                    },
                    cardUsable(card, player, num) {
                        if (get.suit(card) == 'unsure') {
                            return Infinity;
                        }
                        if (!card.cards) {
                            return;
                        }
                        for (var i of card.cards) {
                            if (i.hasGaintag('zshy_lianjie')) {
                                return Infinity;
                            }
                        }
                    },
                },
            },
        },
    },
    zshy_jiangxian: {//将贤
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            source: 'damageBegin1',
        },
        filter(event, player) {
            if (!player.hasHistory('lose', evt => {
                let gaintag = false;
                if ((evt.relatedEvent || evt.getParent()) != event.getParent('useCard')) {
                    return false;
                }
                for (var i in evt.gaintag_map) {
                    if (evt.gaintag_map[i].includes('zshy_lianjie')) {
                        gaintag = true;
                    }
                }
                return gaintag && event.cards.some(card => (evt.hs || []).includes(card));
            })
            ) {
                return false;
            }
            return player.getHistory('sourceDamage').length > 0;
        },
        forced: true,
        locked: false,
        async content(event, trigger, player) {
            trigger.num += player.getHistory('sourceDamage').length;
        },
    },

    //墟武陆逊
    zshy_xiongmu: {//雄幕
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: 'phaseBegin' },
        prompt2(event, player) {
            return (player.countCards('h') < player.maxHp ? '将手牌摸至' + get.cnNumber(player.maxHp) + '张，然后' : '') + '将任意张牌随机置入牌堆并从牌堆或弃牌堆中获得等量点数为8的牌。';
        },
        content() {
            'step 0';
            player.drawTo(player.maxHp);
            'step 1';
            var cards = player.getCards('he');
            if (!cards.length) event.finish();
            else if (cards.length == 1) event._result = { bool: true, cards: cards };
            else player.chooseCard('雄幕：将任意张牌置入牌堆的随机位置', 'he', [1, Infinity], true).set('ai', card => {
                return 6 - get.value(card);
            });
            'step 2';
            if (result.bool) {
                var cards = result.cards;
                event.cards = cards;
                game.log(player, `将${get.cnNumber(cards.length)}张牌置入了牌堆`);
                player.loseToDiscardpile(cards, ui.cardPile, 'blank').set('log', false).insert_index = function () {
                    return ui.cardPile.childNodes[get.rand(0, ui.cardPile.childNodes.length - 1)];
                };
            } else event.finish();
            'step 3';
            var list = [],
                shown = [];
            var piles = ['cardPile', 'discardPile'];
            for (var pile of piles) {
                for (var i = 0; i < ui[pile].childNodes.length; i++) {
                    var card = ui[pile].childNodes[i];
                    var number = get.number(card, false);
                    if (!list.includes(card) && number == 8) {
                        list.push(card);
                        if (pile == 'discardPile') shown.push(card);
                        if (list.length >= cards.length) break;
                    }
                }
                if (list.length >= cards.length) break;
            }
            if (list.length) {
                var next = player.gain(list);
                next.shown_cards = shown;
                next.set('animate', function (event) {
                    var player = event.player,
                        cards = event.cards,
                        shown = event.shown_cards;
                    if (shown.length < cards.length) {
                        var num = cards.length - shown.length;
                        player.$draw(num);
                        game.log(player, '从牌堆获得了', get.cnNumber(num), '张点数为8的牌');
                    }
                    if (shown.length > 0) {
                        player.$gain2(shown, false);
                        game.log(player, '从弃牌堆获得了', shown);
                    }
                    return 500;
                });
            }
        },
        ai: {
            effect: {
                target(card, player, target) {
                    if (target.countCards('h') > target.getHp() || player.hasSkillTag('jueqing', false, target)) return;
                    if (player._zshy_xiongmu_temp) return;
                    if (_status.event.getParent('useCard', true) || _status.event.getParent('_wuxie', true)) return;
                    if (get.tag(card, 'damage')) {
                        if (target.getHistory('damage').length > 0) {
                            return [1, -2];
                        } else {
                            if (get.attitude(player, target) > 0 && target.hp > 1) {
                                return 'zeroplayertarget';
                            }
                            if (get.attitude(player, target) < 0 && !player.hasSkillTag('damageBonus')) {
                                if (card.name == 'sha') return;
                                var sha = false;
                                player._zshy_xiongmu_temp = true;
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
                                delete player._zshy_xiongmu_temp;
                                if (player.hasSkillTag('damage')) {
                                    num++;
                                }
                                if (num < 2) {
                                    var enemies = player.getEnemies();
                                    if (enemies.length == 1 && enemies[0] == target && player.needsToDiscard()) {
                                        return;
                                    }
                                    return 'zeroplayertarget';
                                }
                            }
                        }
                    }
                },
            },
        },
        group: ['zshy_xiongmu_minus'],
        subSkill: {
            minus: {//当你受到伤害时，若你的手牌数不大于你的体力值，此伤害-1。
                audio: 'zshy_xiongmu',
                trigger: { player: 'damageBegin4' },
                filter(event, player) {
                    return player.countCards('h') <= player.getHp();
                },
                forced: true,
                locked: false,
                content() {
                    trigger.num--;
                },
            },
        },
    },
    zshy_zhangcai: {//彰才
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: ['useCard', 'respond'],
        },
        filter(event, player) {
            return get.number(event.card) == 8;
        },
        prompt2(event, player) {
            const num = 8;
            let count = 1;
            if (typeof num == 'number')
                count = Math.max(1, player.countCards('h', card => get.number(card) == num));
            return '你可以摸' + get.cnNumber(count) + '张牌。';
        },
        check: (event, player) => {
            const num = 8;
            let count = 1;
            if (typeof num == 'number')
                count = Math.max(1, player.countCards('h', card => get.number(card) == num));
            return ui.cardPile.childNodes.length + ui.discardPile.childNodes.length >= count;
        },
        frequent: true,
        locked: false,
        content() {
            var num = 8;
            var count = 1;
            if (typeof num == 'number')
                count = Math.max(1, player.countCards('h', card => get.number(card) == num));
            player.draw(count);
        },
        mod: {
            aiOrder: (player, card, num) => {
                if (num > 0 && get.tag(card, 'draw') && ui.cardPile.childNodes.length + ui.discardPile.childNodes.length < 20) return 0;
            },
            aiValue: (player, card, num) => {
                if (num > 0 && card.name === 'zhuge') return 20;
            },
            aiUseful: (player, card, num) => {
                if (num > 0 && card.name === 'zhuge') return 10;
            },
        },
        ai: {
            threaten: 4,
            combo: 'dcxiongmu',
        },
        group: ['zshy_zhangcai_damage'],
        subSkill: {
            damage: {//你手中点数为8的牌无距离限制且不计入手牌上限，不可响应且基础数值+1。
                trigger: { player: 'useCard' },
                firstDo: true,
                forced: true,
                locked: false,
                filter(event, player) {
                    return get.number(event.card) == 8;
                },
                content() {
                    trigger.baseDamage++;
                    trigger.directHit.addArray(game.players);
                },
                mod: {
                    cardUsable(card, player, target, now) {
                        if (get.number(card) == 8) return true;
                    },
                    targetInRange(card, player, target, now) {
                        if (get.number(card) == 8) return true;
                    },
                    ignoredHandcard(card, player) {
                        if (get.number(card) == 8) return true;
                    },
                    cardDiscardable(card, player, name) {
                        if (name == 'phaseDiscard' && get.number(card) == 8) return false;
                    },
                },
            },
        },
    },
    zshy_ruxian: {//儒贤
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: ['useCard', 'respond'],
        },
        filter(event, player) {
            return get.number(event.card) != 8;
        },
        prompt2(event, player) {
            const num = get.number(event.card);
            let count = 1;
            if (typeof num == 'number')
                count = Math.max(1, player.countCards('h', card => get.number(card) == num));
            return '你可以摸' + get.cnNumber(count) + '张牌。';
        },
        check: (event, player) => {
            const num = get.number(event.card);
            let count = 1;
            if (typeof num == 'number')
                count = Math.max(1, player.countCards('h', card => get.number(card) == num));
            return ui.cardPile.childNodes.length + ui.discardPile.childNodes.length >= count;
        },
        frequent: true,
        locked: false,
        content() {
            var num = get.number(trigger.card);
            var count = 1;
            if (typeof num == 'number') count = Math.max(1, player.countCards('h', card => get.number(card) == num)
            );
            player.chooseDrawRecover(count, true);
        },
        mod: {
            aiOrder: (player, card, num) => {
                if (num > 0 && get.tag(card, 'draw') && ui.cardPile.childNodes.length + ui.discardPile.childNodes.length < 20) return 0;
            },
            aiValue: (player, card, num) => {
                if (num > 0 && card.name === 'zhuge') return 20;
            },
            aiUseful: (player, card, num) => {
                if (num > 0 && card.name === 'zhuge') return 10;
            },
        },
        ai: {
            threaten: 4,
            combo: 'zshy_xiongmu',
        },
    },

    //墟武诸葛亮
    zshy_jincui: {//尽瘁
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: 'phaseZhunbeiBegin' },
        filter(event, player) {
            return true;
        },
        forced: true,
        group: 'zshy_jincui_advent',
        async content(event, trigger, player) {
            let num = 0;
            for (let i = 0; i < ui.cardPile.childNodes.length; i++) {
                let card = ui.cardPile.childNodes[i];
                if (get.number(card) == 7) {
                    num++;
                    if (num >= player.getDamagedHp()) {
                        break;
                    }
                }
            }
            if (num < 1) {
                num = 1;
            }
            if (player.isDamaged()) player.recover(num);
            const result = await player.chooseToGuanxing(7)
                .set('prompt', '尽瘁：点击或拖动将牌移动到牌堆顶或牌堆底')
                .set('processAI', list => {
                    let cards = list[0][1],
                        player = _status.event.player,
                        target = _status.currentPhase || player,
                        name = _status.event.getTrigger().name,
                        countWuxie = current => {
                            let num = current.getKnownCards(player, card => {
                                return get.name(card, current) === 'wuxie';
                            });
                            if (num && current !== player) {
                                return num;
                            }
                            let skills = current.getSkills('invisible').concat(lib.skill.global);
                            game.expandSkills(skills);
                            for (let i = 0; i < skills.length; i++) {
                                let ifo = get.info(skills[i]);
                                if (!ifo) {
                                    continue;
                                }
                                if (ifo.viewAs && typeof ifo.viewAs != 'function' && ifo.viewAs.name == 'wuxie') {
                                    if (!ifo.viewAsFilter || ifo.viewAsFilter(current)) {
                                        num++;
                                        break;
                                    }
                                } else {
                                    let hiddenCard = ifo.hiddenCard;
                                    if (typeof hiddenCard == 'function' && hiddenCard(current, 'wuxie')) {
                                        num++;
                                        break;
                                    }
                                }
                            }
                            return num;
                        },
                        top = [],
                        bottom = [];
                    for (let i = 0; i < cards.length; i++) {
                        if (get.number(cards[i]) == 7) {
                            bottom.addArray(cards.splice(i--, 1));
                        }
                    }
                    switch (name) {
                        case 'phaseJieshu':
                            target = target.next;
                        // [falls through]
                        case 'phaseZhunbei': {
                            let att = get.sgn(get.attitude(player, target)),
                                judges = target.getCards('j'),
                                needs = 0,
                                wuxie = countWuxie(target);
                            for (let i = Math.min(cards.length, judges.length) - 1; i >= 0; i--) {
                                let j = judges[i],
                                    cardj = j.viewAs ? { name: j.viewAs, cards: j.cards || [j] } : j;
                                if (wuxie > 0 && get.effect(target, j, target, target) < 0) {
                                    wuxie--;
                                    continue;
                                }
                                let judge = get.judge(j);
                                cards.sort((a, b) => {
                                    return (judge(b) - judge(a)) * att;
                                });
                                if (judge(cards[0]) * att < 0) {
                                    needs++;
                                    continue;
                                } else {
                                    top.unshift(cards.shift());
                                }
                            }
                            if (needs > 0 && needs >= judges.length) {
                                bottom.addArray(cards);
                                return [top, bottom];
                            }
                            cards.sort((a, b) => {
                                return (get.value(b, target) - get.value(a, target)) * att;
                            });
                            while (needs--) {
                                top.unshift(cards.shift());
                            }
                            while (cards.length) {
                                if (get.value(cards[0], target) > 6 == att > 0) {
                                    top.unshift(cards.shift());
                                } else {
                                    break;
                                }
                            }
                            bottom.addArray(cards);
                            return [top, bottom];
                        }
                        default:
                            cards.sort((a, b) => {
                                return get.value(b, target) - get.value(a, target);
                            });
                            while (cards.length) {
                                if (get.value(cards[0], target) > 6) {
                                    top.unshift(cards.shift());
                                } else {
                                    break;
                                }
                            }
                            bottom.addArray(cards);
                            return [top, bottom];
                    }
                })
                .forResult();
            if (!result.bool || !result.moved[0].length) {
                player.addTempSkill('guanxing_fail');
            }
        },
        ai: {
            guanxing: true,
            effect: {
                target(card, player, target) {
                    if (!get.tag(card, 'damage')) {
                        return;
                    }
                    var num = 0,
                        bool = false;
                    for (var i = 0; i < ui.cardPile.childNodes.length; i++) {
                        var card = ui.cardPile.childNodes[i];
                        if (get.number(card) == 7) {
                            num++;
                            if (num >= target.hp) {
                                bool = true;
                                break;
                            }
                        }
                    }
                    if (bool) {
                        return 0.2;
                    }
                },
            },
            threaten: 0.6,
        },
        subSkill: {
            advent: {
                audio: 'zshy_jincui',
                trigger: { global: 'phaseBegin' },
                forced: true,
                filter(event, player) {
                    return player.countCards('h') < 7;
                },
                content() {
                    player.drawTo(7);
                },
            },
        },
    },
    zshy_qingshi: {//情势
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'useCard' },
        filter(event, player) {
            if (player.getStorage('zshy_qingshi_clear').includes(event.card.name)) {
                return false;
            } return true;
        },
        direct: true,
        content() {
            'step 0';
            var choices = [];
            var choiceList = ['令' + get.translation(trigger.card) + '对其中一个目标角色造成的伤害+1', '令任意名其他角色各摸一张牌', '摸两张牌并回复1点体力'];
            if (trigger.targets && trigger.targets.length && get.tag(trigger.card, 'damage') == true) {
                choices.push('选项一');
            } else if (trigger.targets && trigger.targets.length) {
                choiceList[0] = '<span style="opacity: 0.5">' + choiceList[0] + '对其中一个目标角色造成的伤害+1（PS:此非伤害牌）</span>';
                choices.push('选项一');
            } else {
                choiceList[0] = '<span style="opacity: 0.5">' + choiceList[0] + '(无目标角色)</span>';
            }
            if (game.countPlayer(i => i != player)) {
                choices.push('选项二');
            } else {
                choiceList[1] = '<span style="opacity: 0.5">' + choiceList[1] + '</span>';
            }
            choices.push('选项三');
            player.chooseControl(choices, 'cancel2')
                .set('choiceList', choiceList)
                .set('prompt', get.prompt('zshy_qingshi'))
                .set('ai', () => {
                    return _status.event.choice;
                }).set('choice', (() => {
                    var choicesx = choices.slice();
                    var cards = player.getCards('hs');
                    var bool1 =
                        get.tag(trigger.card, 'damage') &&
                        choicesx.includes('选项一') &&
                        trigger.targets.some(current => {
                            return get.attitude(player, current) < 0;
                        }),
                        bool2 = choicesx.includes('选项二');
                    if (bool2) {
                        bool2 = game.countPlayer(function (current) {
                            return player != current && get.attitude(player, current) > 0;
                        });
                    } else {
                        bool2 = 0;
                    }
                    if (bool1 || bool2) {
                        for (var i = 0; i < cards.length; i++) {
                            var name = get.name(cards[i]);
                            if (player.getStorage('zshy_qingshi_clear').includes(name)) {
                                continue;
                            }
                            for (var j = i + 1; j < cards.length; j++) {
                                if (name === get.name(cards[j]) && get.position(cards[i]) + get.position(cards[j]) !== 'ss' && player.hasValueTarget(cards[i])) {
                                    choicesx.remove('选项三');
                                    break;
                                }
                            }
                        }
                    }
                    if (bool2 > 2) {
                        return '选项二';
                    }
                    if (choicesx.includes('选项三')) {
                        return '选项三';
                    }
                    if (bool2 === 2) {
                        return '选项二';
                    }
                    if (bool1) {
                        return '选项一';
                    }
                    if (bool2) {
                        return '选项二';
                    }
                    return 'cancel2';
                })()
                );
            'step 1';
            if (result.control != 'cancel2') {
                player.logSkill('zshy_qingshi');
                game.log(player, '选择了', '#y' + result.control);
                var index = ['选项一', '选项二', '选项三'].indexOf(result.control) + 1;
                player.addTempSkill('zshy_qingshi_clear');
                player.markAuto('zshy_qingshi_clear', [trigger.card.name]);
                var next = game.createEvent('zshy_qingshi_after');
                next.player = player;
                next.card = trigger.card;
                next.setContent(lib.skill.zshy_qingshi['content' + index]);
            }
        },
        content1() {
            'step 0';
            player.chooseTarget('令' + get.translation(card) + '对其中一个目标造成的伤害+1', true, (card, player, target) => {
                return _status.event.targets.includes(target);
            }).set('ai', target => {
                return 2 - get.attitude(_status.event.player, target);
            }).set('targets', event.getParent().getTrigger().targets);
            'step 1';
            if (result.bool) {
                var target = result.targets[0];
                player.line(target);
                player.addTempSkill('zshy_qingshi_ex');
                if (!player.storage.zshy_qingshi_ex) {
                    player.storage.zshy_qingshi_ex = [];
                }
                player.storage.zshy_qingshi_ex.push([target, card]);
            }
        },
        content2() {
            'step 0';
            player.chooseTarget('令任意名角色各摸一张牌', [1, Infinity], true).set('ai', target => {
                return get.attitude(_status.event.player, target);
            });
            'step 1';
            if (result.bool) {
                var targets = result.targets;
                targets.sortBySeat();
                player.line(targets);
                game.asyncDraw(targets);
                game.delayex();
            }
        },
        content3() {
            'step 0';
            player.draw(2);
            player.recover();
        },
        subSkill: {
            ex: {
                trigger: { source: 'damageBegin1' },
                filter(event, player) {
                    return (
                        player.storage.zshy_qingshi_ex &&
                        player.storage.zshy_qingshi_ex.some(info => {
                            return info[0] == event.player && info[1] == event.card;
                        })
                    );
                },
                forced: true,
                charlotte: true,
                popup: false,
                onremove: true,
                content() {
                    trigger.num++;
                    for (var i = 0; i < player.storage.zshy_qingshi_ex.length; i++) {
                        if (player.storage.zshy_qingshi_ex[i][1] == trigger.card) {
                            player.storage.zshy_qingshi_ex.splice(i--, 1);
                        }
                    }
                },
            },
            clear: {
                onremove: true,
                charlotte: true,
            },
        },
        ai: {
            threaten: 6,
        },
    },
    zshy_zhizhe: {//智哲
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        usable: 1,
        filterCard: true,
        position: 'h',
        discard: false,
        lose: false,
        delay: false,
        skillAnimation: true,
        animationColor: 'metal',
        check(card) {
            return get.value(card) - 6.5;
        },
        prompt: '出牌阶段限1次，你可以选择一张基本牌或普通锦囊牌并复制之。当复制牌A离开原区域区后，你复制之且本回合不能再使用或打出复制牌B。',
        content() {
            'step 0';
            var card = cards[0];
            var cardx = game.createCard2(card.name, card.suit, card.number, card.nature);
            player.gain(cardx).gaintag.add('zshy_zhizhe');
            player.addSkill('zshy_zhizhe_effect');
        },
        ai: {
            order: 15,
            result: {
                player: 1,
            },
        },
        subSkill: {
            effect: {
                mod: {
                    ignoredHandcard(card, player) {
                        if (card.hasGaintag('zshy_zhizhe')) return true;
                    },
                    cardDiscardable(card, player, name) {
                        if (name == 'phaseDiscard' && card.hasGaintag('zshy_zhizhe')) return false;
                    },
                    aiOrder(player, card, num) {
                        if (num > 0 && get.itemtype(card) === 'card' && card.hasGaintag('zshy_zhizhe')) {
                            return num + 0.16;
                        }
                    },
                    aiValue(player, card, num) {
                        if (num > 0 && get.itemtype(card) === 'card' && card.hasGaintag('zshy_zhizhe')) {
                            return 2 * num;
                        }
                    },
                    aiUseful(player, card, num) {
                        if (num > 0 && !player._zshy_zhizhe_mod && get.itemtype(card) === 'card' && card.hasGaintag('zshy_zhizhe')) {
                            if (player.canIgnoreHandcard(card)) {
                                return Infinity;
                            }
                            player._zshy_zhizhe_mod = true;
                            if (
                                player.hp < 3 &&
                                player.needsToDiscard(0, (i, player) => {
                                    return !player.canIgnoreHandcard(i) && get.useful(i) > 6;
                                })
                            ) {
                                return num * 1.5;
                            }
                            return num * 10;
                        }
                    },
                },
                audio: 'zshy_zhizhe',
                trigger: {
                    global: ['loseAfter', 'loseAsyncAfter'],
                },
                charlotte: true,
                forced: true,
                filter(event, player) {
                    return player.hasHistory('lose', function (evt) {
                        for (var i in evt.gaintag_map) {
                            if (evt.gaintag_map[i].includes('zshy_zhizhe')) {
                                if (event.cards.some(card => {
                                    return get.position(card, true) == 'o' && card.cardid == i;
                                })) {
                                    return true;
                                }
                            }
                        }
                        return false;
                    });
                },
                content() {
                    'step 0';
                    var cards = [];
                    player.getHistory('lose', function (evt) {
                        for (var i in evt.gaintag_map) {
                            if (evt.gaintag_map[i].includes('zshy_zhizhe')) {
                                var cardsx = trigger.cards.filter(card => {
                                    return get.position(card, true) == 'o' && card.cardid == i;
                                });
                                if (cardsx.length) {
                                    cards.addArray(cardsx);
                                }
                            }
                        }
                    });
                    if (cards.length) {
                        for (i = 0; i < cards.length; i++) {
                            var card = cards[i];
                            var recardx = game.createCard2(card.name, card.suit, card.number, card.nature);
                            player.gain(recardx).gaintag.addArray(['zshy_zhizhe', 'zshy_zhizhe_clear']);
                            player.addTempSkill('zshy_zhizhe_clear');
                        }
                    }
                },
            },
            clear: {
                charlotte: true,
                onremove(player) {
                    player.removeGaintag('zshy_zhizhe_clear');
                },
                mod: {
                    cardEnabled2(card, player) {
                        var cards = [];
                        if (card.cards) {
                            cards.addArray(cards);
                        }
                        if (get.itemtype(card) == 'card') {
                            cards.push(card);
                        }
                        for (var cardx of cards) {
                            if (cardx.hasGaintag('zshy_zhizhe_clear')) {
                                return false;
                            }
                        }
                    },
                    cardRespondable(card, player) {
                        var cards = [];
                        if (card.cards) {
                            cards.addArray(cards);
                        }
                        if (get.itemtype(card) == 'card') {
                            cards.push(card);
                        }
                        for (var cardx of cards) {
                            if (cardx.hasGaintag('zshy_zhizhe_clear')) {
                                return false;
                            }
                        }
                    },
                    cardSavable(card, player) {
                        var cards = [];
                        if (card.cards) {
                            cards.addArray(cards);
                        }
                        if (get.itemtype(card) == 'card') {
                            cards.push(card);
                        }
                        for (var cardx of cards) {
                            if (cardx.hasGaintag('zshy_zhizhe_clear')) {
                                return false;
                            }
                        }
                    },
                },
            },
        },
    },

};

const skill_xdzs = {
    ...百战虎贲, ...武庙,
};

export default skill_xdzs;
