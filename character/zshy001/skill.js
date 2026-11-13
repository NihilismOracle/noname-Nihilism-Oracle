import { lib, game, ui, get, ai, _status } from '../../../../noname.js'
const 蜀汉虎将 = {
    //墟关羽
    zshy_wusheng: {//武圣
        audio: 'ext:诸神寰宇/audio/character:5',
        audioname2: {
            zshy_AAZZguanxingzhangbaoYJCM: 'zshy_wusheng_zshy_AAZZguanxingzhangbaoYJCM',
            zshy_AAZZguanyuSP: 'zshy_wusheng_zshy_AAZZguanyuSP',
            zshy_AAZZguansuoJMGX: 'zshy_wusheng_zshy_AAZZguansuoJMGX',
        },
        enable: ['chooseToUse', 'chooseToRespond'],
        locked: true,
        hiddenCard(player, name) {
            if (!['sha'].includes(name)) return false;
            return player.countCards('hes');
        },
        filter(event, player) {
            if (!player.countCards('hes')) return false;
            return event.filterCard(get.autoViewAs({ name: 'sha' }, 'unsure'), player, event);
        },
        prompt: '你可将一张牌当作任意属性的【杀】<span data-nature="shenmm">使用/打出</span>',
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
                }
                return ui.create.dialog('武圣', [list, 'vcard']);
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
                        player.logSkill('zshy_wusheng');
                    },
                }
            },
            prompt(links, player) {
                var name = links[0][2], nature = links[0][3];
                return '将一张牌当作' + (get.translation(nature) || '') + '【' + get.translation(name) + '】使用或打出';
            },
        },
        mod: {
            targetInRange(card) {
                if (get.suit(card) == 'diamond') return true;
            },
            cardUsable(card) {
                if (get.color(card) == 'red' || get.color(card) == 'unsure') return Infinity;
            },
        },
        ai: {
            order(skill, player) {
                if (player.countCards('hes')) return 10;
                return 4;
            },
            presha: true,
            fireAttack: true,
            respondSha: true,
            skillTagFilter(player, tag) {
                return player.countCards('hes');
            },
            result: {
                player: 1,
            },
        },
        group: ['zshy_wusheng_Red'],
        subSkill: {
            zshy_AAZZguanxingzhangbaoYJCM: { audio: 'ext:诸神寰宇/audio/character:2' },
            zshy_AAZZguanyuSP: { audio: 'ext:诸神寰宇/audio/character:2' },
            zshy_AAZZguansuoJMGX: { audio: 'ext:诸神寰宇/audio/character:2' },
            Red: {
                trigger: {
                    player: 'useCard',
                },
                forced: true,
                silent: true,
                popup: false,
                filter(event, player) {
                    return event.card && get.suit(event.card) == 'heart';
                },
                async content(event, trigger, player) {
                    trigger.baseDamage++;
                },
                ai: {
                    skillTagFilter(player, tag, arg) {
                        return arg.card.suit == 'heart';
                    },
                },
            },
        },
    },
    zshy_yijue: {//义绝
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        usable: 1,
        selectTarget: [1, Infinity],
        filterTarget(event, player, target) {
            return player != target && target.countCards('he');
        },
        check(event, player) {
            return get.attitude(player, event.target) < 0;
        },
        filter(event, player) {
            return game.countPlayer(function (current) {
                return !current.hasSkill('zshy_yijue_after') && current != player;
            }) > 0;
        },
        prompt: '出牌阶段限1次，你可获得任意名其他角色的一张牌，然后该角色不能<span data-nature="shenmm">使用/打出</span>牌、非状态技失效且受到来自你的红色牌的伤害+1直到回合结束',
        content() {
            player.gainPlayerCard(target, 'hes', true);
            if (!target.hasSkill('baiban')) {
                target.addTempSkill('baiban');
            }
            target.addTempSkill('zshy_yijue_refuse');
        },
        ai: {
            order: 15,
            result: {
                target(player, target) {
                    if (get.attitude(player, target) < 0) return -10;
                    return 0;
                },
            },
            directHit_ai: true,
            skillTagFilter(player, tag, arg) {
                if (!arg.target.hasSkillTag('zshy_yijue_refuse')) return false;
            },
        },
        group: ['zshy_yijue_usetarget'],
        subSkill: {
            usetarget: {
                audio: 'zshy_yijue',
                trigger: {
                    player: 'useCardToTargeted',
                },
                logTarget: 'target',
                prompt2(event, player) {
                    return '获得' + get.translation(event.target) + '一张牌，若为黑桃牌则其不能响应此牌';
                },
                filter(event, player, card, target) {
                    return get.tag(event.card, 'damage') > 0.5 && event.target && event.target.hasCard(function (card) {
                        return lib.filter.canBeGained(card, event.target, player);
                    }, 'hes');
                },
                check(event, player) {
                    return get.attitude(player, event.target) < 0;
                },
                async content(event, trigger, player) {
                    const result = await player.gainPlayerCard('hes', trigger.target, true).forResult();
                    if (result.bool && result.cards.length && get.suit(result.cards[0], trigger.target) == 'spade') {
                        game.log(trigger.target, '不能响应', trigger.card);
                        trigger.directHit.push(trigger.target);
                    };
                },
            },
            refuse: {
                trigger: {
                    player: 'damageBegin1',
                },
                filter(event) {
                    return event.source && event.source == _status.currentPhase && event.card && get.color(event.card) == 'red' && event.notLink();
                },
                popup: false,
                forced: true,
                charlotte: true,
                async content(event, trigger, player) {
                    trigger.num++;
                },
                mark: true,
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

    //墟张飞
    zshy_paoxiao: {//咆哮
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AAZZguanxingzhangbaoYJCM: 'zshy_paoxiao_zshy_AAZZguanxingzhangbaoYJCM',
            zshy_AAZZxiahoubaJMGX: 'zshy_paoxiao_zshy_AAZZxiahoubaJMGX',
        },
        trigger: { player: 'useCard' },
        forced: true,
        filter(event, card) {
            return get.name(event.card) == 'sha' || get.type(event.card) == 'equip';
        },
        async content(event, trigger, player) {
            if (trigger.card.name == 'sha') {
                trigger.baseDamage += (player.getDamagedHp() + 1);
                trigger.directHit.addArray(game.filterPlayer(function (current) {
                    return current.isDamaged();
                }));
            } else {
                const result = await player.chooseTarget(get.prompt('zshy_paoxiao'), '选择一名其他角色，视为对其使用一张【杀】', function (card, player, target) {
                    return player.canUse('sha', target, false) && player.inRange(target);
                }).set('ai', function (target) {
                    var player = _status.event.player;
                    return get.effect(target, { name: 'sha' }, player, player);
                }).forResult();
                if (result.bool) {
                    var target = result.targets[0];
                    if (player.canUse('sha', target, false)) player.useCard({ name: 'sha', isCard: true }, target, false);
                }
            }
        },
        mod: {
            cardUsable(card, player) {
                if (get.name(card) == 'sha') return Infinity;
            },
        },
        ai: {
            reverseEquip: true,
            presha: true,
        },
        subSkill: {
            zshy_AAZZguanxingzhangbaoYJCM: { audio: 'ext:诸神寰宇/audio/character:2' },
            zshy_AAZZxiahoubaJMGX: { audio: 'ext:诸神寰宇/audio/character:2' },
        },
    },
    zshy_tishen: {//替身
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: ['useCard', 'respond'],
        },
        forced: true,
        filter(event, player) {
            return player != _status.currentPhase && event.card.name == 'sha';
        },
        async content(event, trigger, player) {
            player.chooseDrawRecover(true);
        },
    },

    //墟赵云
    zshy_longdan: {//龙胆
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AAZZzhaoyunSP: 'zshy_longdan_zshy_AAZZzhaoyunSP',
        },
        enable: ['chooseToUse', 'chooseToRespond'],
        hiddenCard(player, name) {
            if (get.type2(name) == 'basic') return player.countCards('hs');
        },
        filter(event, player) {
            for (var i of lib.inpile) {
                var type = get.type2(i), filter = event.filterCard;
                if (type == 'basic' && filter({ name: i }, player, event) && player.countCards('hs')) return true;
            }
            return false;
        },
        prompt: '你可将一张牌当作任意基本牌使用或打出',
        chooseButton: {
            dialog(event, player) {
                var list = [];
                for (var i of lib.inpile) {
                    var type = get.type2(i), filter = event.filterCard;
                    if (type == 'basic' && player.countCards('hs')) {
                        if (filter({ name: i }, player, event)) list.push(['基本', '', i]);
                        if (i == 'sha') {
                            for (var j of lib.inpile_nature) {
                                if (filter({ name: i, nature: j }, player, event)) list.push(['基本', '', 'sha', j]);
                            }
                        }
                    }
                }
                return ui.create.dialog('龙胆', [list, 'vcard'], 'hidden');
            },
            filter(button, player) {
                return _status.event.getParent().filterCard({ name: button.link[2] }, player, _status.event.getParent());
            },
            check(button) {
                var player = _status.event.player;
                return player.getUseValue({ name: button.link[2] }) + 1;
            },
            backup(links, player) {
                return {
                    filterCard(card, player, target) {
                        return true;
                    },
                    check(card, player, target) {
                        return 15 - get.value(card);
                    },
                    viewAs: { name: links[0][2], nature: links[0][3] },
                    position: 'hs',
                    popname: true,
                    precontent() {
                        //player.logSkill('zshy_longdan');
                    },
                }
            },
            prompt(links, player) {
                return '将一张牌当做' + get.translation(links[0][3] || '') + get.translation(links[0][2]) + '使用或打出';
            },
        },
        ai: {
            prejiu: true,
            respondSha: true,
            respondShan: true,
            respondTao: true,
            respondJiu: true,
            fireAttack: true,
            skillTagFilter(player, tag) {
                if (!player.countCards('hs')) return false;
            },
            order: 1,
            result: {
                player(player) {
                    if (_status.event.type == 'dying') {
                        return get.attitude(player, _status.event.dying);
                    }
                    return 1;
                },
            },
        },
        group: ['zshy_longdan_Deputy'],
        subSkill: {
            zshy_AAZZzhaoyunSP: { audio: 'ext:诸神寰宇/audio/character:2' },
            Deputy: {
                audio: 'zshy_longdan',
                trigger: {
                    player: ['useCard', 'respond'],
                },
                frequent: true,
                firstDo: true,
                filter(event, player) {
                    return get.type(event.card) == 'basic';
                },
                async content(event, trigger, player) {
                    await player.draw();
                },
            },
        },
    },
    zshy_yajiao: {//涯角
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: ['useCardAfter', 'respondAfter'],
        },
        direct: true,
        filter(event, player) {
            return player != _status.currentPhase;
        },
        async content(event, trigger, player) {
            const result = await player.chooseTarget(get.prompt('zshy_yajiao'), '选择弃置一名角色区域内一张牌，若弃置的牌：为基本牌，则你获得之；不为基本牌：你对其造成1点伤害', function (card, player, target) {
                return target.countGainableCards(player, 'hej');
            }).set('ai', function (target) {
                var player = _status.event.player;
                return get.effect(target, { name: 'guohe_copy2' }, player, player) > 1;
            }).forResult();
            if (result.bool) {
                await player.line(result.targets[0]);
                const result1 = await player.discardPlayerCard(result.targets[0], 'hej', true).forResult();
                player.logSkill('zshy_yajiao');
                if (result1.bool && result1.cards) {
                    if (get.type(result1.cards[0]) == 'basic') {
                        await player.gain(result1.cards[0], 'gain2');
                    } else {
                        await result.targets[0].damage();
                    }
                }
            }
        },
        ai: {
            order: 9,
            directHit: true,
            directHit_ai: true,
            result: {
                target() {
                    return 3;
                },
            },
        },
    },

    //墟马超
    zshy_tieji: {//铁骑
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'useCardToPlayered' },
        filter(event, player) {
            return player != event.target && get.tag(event.card, 'damage') && event.target.isIn();
        },
        check(event, player) {
            return get.attitude(player, event.target) <= 0;
        },
        prompt2(event, player) {
            return '是否令' + get.translation(event.target) + '不能响应此牌且所有非状态技失效直到本回合结束，然后获得其一张牌（其无牌则你摸一张牌）'
        },
        async content(event, trigger, player) {
            await trigger.target.addTempSkill('baiban');
            await trigger.directHit.add(trigger.target);
            if (trigger.target.countGainableCards(player, 'hes') > 0) {
                await player.gainPlayerCard(trigger.target, 'hes', true);
            }
            else {
                await player.draw();
            }
        },
        shaRelated: true,
        ai: {
            presha: true,
            ignoreSkill: true,
            directHit_ai: true,
        },
        group: ['zshy_tieji_Sha'],
        subSkill: {
            Sha: {
                trigger: {
                    source: 'damageBegin4',
                },
                direct: true,
                silent: true,
                popup: false,
                lastDo: true,
                async content(event, trigger, player) {
                    const num = 1 + player.getDamagedHp() + trigger.player.getDamagedHp();
                    trigger.num += num;
                },
                ai: {
                    skillTagFilter(player, tag, arg) {
                        return get.tag(arg.card, 'damage');
                    },
                },
            },
        },
    },
    zshy_MCmashu: {//马术
        mod: {
            globalFrom(from, to, distance) {
                let num = 1 + game.countPlayer(function (current) {
                    return current.isDamaged();
                });
                return distance - num;
            },
            globalTo(from, to, distance) {
                let num = 1 + game.countPlayer(function (current) {
                    return current.isDamaged();
                });
                return distance + num;
            },
        }
    },

};
const 贤君明主 = {
    //墟刘备
    zshy_rende: {//仁德
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        lose: false,
        delay: false,
        discard: false,
        position: 'hes',
        filterCard: true,
        selectCard: [1, Infinity],
        allowChooseAll: true,
        filter(event, player) {
            return player.countCards('hes');
        },
        filterTarget(card, player, target) {
            return player != target;
        },
        check(card) {
            var player = get.owner(card);
            if (ui.selected.cards.length > 0) return 0;
            if (player.needsToDiscard()) {
                return 10 - get.value(card);
            }
            return 7 - get.value(card);
        },
        content() {
            player.give(cards, target);
            if (cards.length > 0) player.addMark('zshy_renyi', cards.length);
            if (target.group == player.group) player.addMark('zshy_renyi', cards.length);
        },
        ai: {
            order: 1,
            result: {
                target(player, target) {
                    if (target.hasSkillTag('nogain')) return 0;
                    var nh = target.countCards('h');
                    return Math.max(1, 5 - nh);
                },
            },
        },
    },
    zshy_renyi: {//仁义
        audio: 'zshy_rende',
        trigger: {
            global: 'phaseBegin',
        },
        direct: true,
        lastDo: true,
        filter(event, player) {
            return game.countPlayer(function (current, player) {
                return current.group == 'shu';
            }) > 0;
        },
        async content(event, trigger, player) {
            const num = game.countPlayer(function (current, player) {
                return current.group == 'shu';
            });
            await player.addMark('zshy_renyi', num);
            await player.logSkill('zshy_renyi');
        },
        marktext: '仁',
        intro: {
            name2: '仁',
            content: 'mark',
        },
        group: 'zshy_renyi_Basic',
        subSkill: {
            Basic: {
                audio: 'zshy_renyi',
                sub: true,
                enable: ['chooseToUse', 'chooseToRespond'],
                hiddenCard(player, name) {
                    return get.type(name) == 'basic' && player.countMark('zshy_renyi') > 1;
                },
                filter(event, player) {
                    if (event.type == 'wuxie' || player.countMark('zshy_renyi') < 2) return false;
                    for (var i of lib.inpile) {
                        if (get.type(i) != 'basic') continue;
                        var card = { name: i, isCard: true };
                        if (event.filterCard(card, player, event)) return true;
                        if (i == 'sha') {
                            for (var j of lib.inpile_nature) {
                                card.nature = j;
                                if (event.filterCard(card, player, event)) return true;
                            }
                        }
                    }
                    return false;
                },
                chooseButton: {
                    dialog(event, player) {
                        var list = [];
                        for (var i of lib.inpile) {
                            if (get.type(i) != 'basic') continue;
                            var card = { name: i, isCard: true };
                            if (event.filterCard(card, player, event)) list.push(['基本', '', i]);
                            if (i == 'sha') {
                                for (var j of lib.inpile_nature) {
                                    card.nature = j;
                                    if (event.filterCard(card, player, event)) list.push(['基本', '', i, j]);
                                }
                            }
                        }
                        return ui.create.dialog('仁义', [list, 'vcard']);
                    },
                    filter(button, player) {
                        var card = { name: button.link[2], nature: button.link[3] };
                        var evt = _status.event.getParent();
                        return evt.filterCard(card, player, evt);
                    },
                    check(button, player) {
                        if (typeof button.link == 'string') return -1;
                        if (_status.event.getParent().type != 'phase') return 1;
                        return _status.event.player.getUseValue({ name: button.link[2], nature: button.link[3] });
                    },
                    backup(links, player) {
                        return {
                            popname: true,
                            selectCard: -1,
                            filterCard() { return false },
                            viewAs: {
                                name: links[0][2],
                                nature: links[0][3],
                                isCard: true,
                            },
                            precontent() {
                                player.logSkill('zshy_renyi');
                                player.removeMark('zshy_renyi', 2);
                            },
                        }
                    },
                    prompt(links, player) {
                        return '视为使用或打出' + (get.translation(links[0][3]) || '') + get.translation(links[0][2]);
                    },
                },
                ai: {
                    respondSha: true,
                    respondShan: true,
                    skillTagFilter(player) {
                        if (!player.countMark('zshy_renyi') > 2) return false;
                    },
                    order: 1,
                    result: {
                        player(player) {
                            if (_status.event.dying) {
                                return get.attitude(player, _status.event.dying);
                            }
                            return _status.event.type == 'phase' && player.countMark('zshy_renyi') < 2 ? 0 : 1;
                        },
                    },
                },
            },
        },
    },
    zshy_jijiang: {//激将
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AAZZliushanSHZL: 'zshy_jijiang_zshy_AAZZliushanSHZL'
        },
        trigger: {
            player: ['useCard', 'respond'],
        },
        forced: true,
        filter(event, player) {
            return get.tag(event.card, 'damage') > 0.5;
        },
        async content(event, trigger, player) {
            player.draw();
            const result = await player.chooseTarget(get.translation(event.skill), `令一名其他角色使用一张牌`, function (card, player, target) {
                return target != player;
            }).set('ai', function (target) {
                if (get.attitude(player, target) > 0) {
                    return target.countCards('h') > 0;
                }
            }).forResult();
            if (result.bool && result.targets) {
                result.targets[0].draw();
                await result.targets[0].chooseToUse();
            }
        },
        subSkill: {
            zshy_AAZZliushanSHZL: { audio: 'ext:诸神寰宇/audio/character:2' },
        },
    },

    //墟孙权
    zshy_zhiheng: {//制衡
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AAZZshensimayiSHZL: 'zshy_zhiheng_zshy_AAZZshensimayiSHZL',
        },
        enable: 'phaseUse',
        usable(event, player) {
            return player.getHistory('sourceDamage', evt => {
                return _status.currentPhase == player;
            }).length + 1;
        },
        position: 'he',
        filterCard: lib.filter.cardDiscardable,
        discard: false,
        lose: false,
        delay: false,
        selectCard: [1, Infinity],
        allowChooseAll: true,
        check(card) {
            var player = _status.event.player;
            if (!player.countCards('h', 'tao') && get.position(card) == 'h' && !player.countCards('h', 'du')) return 1;
            else return 7 - get.value(card);
        },
        async content(event, trigger, player) {
            const cards = event.cards;
            // 记录支付时的牌类型；延时锦囊也属于锦囊。
            const types = new Set(cards.map(card => get.type2(card, player)));
            await player.discard(cards);
            await player.draw(cards.length);
            let num = 0;
            if (types.has('basic')) {
                await player.draw();
                num++;
            }
            if (types.has('trick')) {
                player.addMark('zshy_zhiheng_attack', 1, false);
                num++;
            }
            if (types.has('equip')) {
                await player.changeHujia();
                num++;
            }
            if (num == 3) {
                await player.recover();
                player.addMark('zshy_zhiheng', 1);
            }
            if (num > 0) await player.draw(num);
        },
        mod: {
            maxHandcard(player, num) {
                return num + player.countMark('zshy_zhiheng');
            },
        },
        ai: {
            order: 13,
            result: {
                player: 10,
            },
            nokeep: true,
            skillTagFilter(player, tag, arg) {
                if (tag == 'nokeep') return (!arg || arg && arg.card && get.name(arg.card) === 'tao') && player.isPhaseUsing() && !player.getStat().skill.zshy_zhiheng && player.hasCard((card) => get.name(card) !== 'tao', 'h');
            },
            threaten: 2,
        },
        group: ['zshy_zhiheng_attack'],
        subSkill: {
            zshy_AAZZshensimayiSHZL: { audio: 'ext:诸神寰宇/audio/character:2' },
            attack: {
                audio: 'zshy_zhiheng',
                marktext: '衡',
                intro: {
                    name: '衡',
                    name2: '衡',
                    content: '下次造成的伤害可+#',
                },
                trigger: {
                    source: 'damageBegin4',
                },
                onremove: true,
                lastDo: true,
                filter(event, player) {
                    return player.hasMark('zshy_zhiheng_attack');
                },
                check(event, player) {
                    return get.attitude(player, event.player) < 0;
                },
                logTarget: 'player',
                'prompt2'(event, player) {
                    return '弃置' + player.countMark('zshy_zhiheng_attack') + '枚「衡」并令' + get.translation(event.player) + '即将受到的伤害增加' + player.countMark('zshy_zhiheng_attack') + '点';
                },
                content() {
                    var num = player.countMark('zshy_zhiheng_attack');
                    player.removeMark('zshy_zhiheng_attack', num);
                    trigger.num += num;
                },
            },
        },
    },
    zshy_jiuyuan: {//救援
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'recoverBefore' },
        forced: true,
        filter(event, player) {
            return event.player.group == 'wu';
        },
        async content(event, trigger, player) {
            player.changeHujia(trigger.num);
        },
    },

    //墟曹操
    zshy_jianxiong: {//奸雄
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AAZZcaoyingJMGX: 'zshy_jianxiong_zshy_AAZZcaoyingJMGX',
            zshy_AAZZcaoyingJMGX_shadow: 'zshy_jianxiong_zshy_AAZZcaoyingJMGX_shadow',
        },
        trigger: {
            player: 'damageAfter',
        },
        frequent: true,
        async content(event, trigger, player) {
            if (get.itemtype(trigger.cards) == 'cards' && get.position(trigger.cards[0], true) == 'o') {
                await player.gain(trigger.cards, 'gain2');
            };
            if (trigger.source != undefined && trigger.source.isIn()) {
                player.draw(trigger.source.hp + 1);
            }
            else {
                player.draw();
            };
        },
        getIndex(event, player) {
            return event.num;
        },
        ai: {
            maixie: true,
            maixie_hp: true,
            effect: {
                target(card, player, target) {
                    if (player.hasSkillTag('jueqing', false, target)) return [1, -1];
                    if (get.tag(card, 'damage') && player != target) {
                        var cards = card.cards, evt = _status.event;
                        if (evt.player == target && card.name == 'damage' && evt.getParent().type == 'card') cards = evt.getParent().cards.filterInD();
                        if (target.hp <= 1) return;
                        if (get.itemtype(cards) != 'cards') return;
                        for (var i of cards) {
                            if (get.name(i, target) == 'tao') return [1, 5];
                        }
                        if (get.value(cards, target) >= (7 + target.getDamagedHp())) return [1, 3];
                        return [1, 0.6];
                    }
                },
            },
        },
        group: ['zshy_jianxiong_sha'],
        subSkill: {
            sha: {
                trigger: {
                    player: 'gainAfter',
                    global: 'loseAsyncAfter',
                },
                filter(event, player) {
                    const hs = player.getCards('h'), cards = event.getg(player);
                    return cards.length > 1 && cards.filter(function (card) {
                        return hs.includes(card) && game.checkMod(card, player, 'unchanged', 'cardEnabled2', player) !== false;
                    }).length == cards.length && player.hasUseTarget({
                        name: 'sha',
                        nature: 'stab',
                        cards: event.cards,
                    }, false);
                },
                async cost(event, trigger, player) {
                    event.result = await player.chooseTarget('是否对一名其他角色使用一张无距离与次数限制的刺【杀】？', lib.filter.notMe)
                        .set('ai', function (target) {
                            var evt = _status.event;
                            return get.effect(target, { name: 'sha', nature: 'stab' }, evt.source, evt.player);
                        }).forResult();
                },
                async content(event, trigger, player) {
                    player.useCard({ name: 'sha', nature: 'stab', isCard: true }, event.targets[0], false);
                },
            },
        },
    },
    zshy_hujia: {//护驾
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: ['chooseToRespondBefore', 'chooseToUseBefore'],
        },
        forced: true,
        filter(event, player) {
            if (event.responded) {
                return false;
            }
            if (player.storage.zshy_hujia) {
                return false;
            }
            if (!event.filterCard({ name: 'shan', isCard: true }, player, event)) {
                return false;
            }
            return event.player.group == 'wei' && player.isDamaged();
        },
        async content(event, trigger, player) {
            player.recover();
        },
    },

    //墟袁术
    zshy_wangzun: {//妄尊
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'phaseBegin',
        },
        check(event, player) {
            if (get.attitude(player, event.player) > 0) {
                return false;
            }
            return true;
        },
        filter(event, player) {
            if (event.player == player) return false;
            return event.player.isIn();
        },
        logTarget: 'player',
        prompt2(event, player) {
            return '摸一张牌，令' + get.translation(event.player) + '手牌上限-1';
        },
        async content(event, trigger, player) {
            player.chooseDrawRecover(true);
            lib.skill.chenliuwushi.change(trigger.player, -1);
        },
        ai: {
            expose: 1,
            threaten: 2,
        },
    },
    zshy_tongji: {//同疾
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: 'useCardToTarget' },
        filter(event, player) {
            return get.name(event.card) == 'sha' && event.player != player && !event.targets.includes(player);
        },
        check(event, player, target) {
            return get.attitude(player, event.target) > 0;
        },
        prompt2: '摸两张牌，然后令此【杀】目标转移给你',
        async content(event, trigger, player) {
            player.draw(2);
            const evt = trigger.getParent();
            evt.triggeredTargets2.remove(trigger.target);
            evt.targets.remove(trigger.target);
            evt.targets.push(player);
            lib.skill.chenliuwushi.change(trigger.player, -1);
        },
        ai: {
            neg: true,
        },
    },

};
const 勇冠三军 = {
    //墟甘宁
    zshy_qixi: {//奇袭
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'useCardToPlayered' },
        logTarget: 'target',
        filter(event, player) {
            return event.target != player && event.target.countCards('he') > 0 && (get.color(event.card) == 'black' || get.name(event.card) == 'guohe');
        },
        check(event, player) {
            return get.attitude(player, event.target) < 0;
        },
        prompt2(event, player) {
            return '弃置' + get.translation(event.target) + '一张牌，若弃置的牌与使用的牌颜色相同，则此牌不可响应并对其造成1点伤害，否则你回复1点体力或摸一张牌';
        },
        content() {
            'step 0'
            player.discardPlayerCard('hes', trigger.target, true);
            'step 1'
            if (result.bool && result.cards.length && get.color(result.cards[0], trigger.target) == get.color(trigger.card)) {
                game.log(trigger.target, '不能响应', trigger.card);
                trigger.directHit.push(trigger.target);
                trigger.target.damage();
            } else player.chooseDrawRecover(true);
        },
        ai: {
            effect: {
                player(card, player, target) {
                    if (player !== target && get.itemtype(target) === 'player' && (card.name === 'sha' || get.type(card, false) === 'trick') &&
                        target.countCards('he') && !target.hasSkillTag('noh')) return [1, 0, 1, -1];
                },
            },
        },
        group: ['zshy_qixi_guohe'],
        subSkill: {
            guohe: {
                audio: 'zshy_qixi',
                enable: 'chooseToUse',
                filterCard(card) {
                    return true;
                },
                position: 'hes',
                viewAs: { name: 'guohe' },
                viewAsFilter(player) {
                    if (!player.countCards('hes')) return false;
                },
                prompt: '将一张牌当过河拆桥使用',
                check(card) {
                    return 4 - get.value(card);
                },
            },
        },
    },
    zshy_fenwei: {//奋威
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: 'useCardToPlayered' },
        filter(event, player) {
            return get.type(event.card) == 'trick' && event.targets.length > 1 && event.target.isIn() && event.player != player;
        },
        async cost(event, trigger, player) {
            event.result = await player.chooseTarget(get.prompt('zshy_fenwei'), [1, trigger.targets.length], function (card, player, target) {
                return _status.event.targets.includes(target);
            }).set('ai', function (target) {
                var trigger = _status.event.getTrigger();
                if (game.phaseNumber > game.players.length * 2 && trigger.targets.length >= game.players.length - 1 && !trigger.excluded.includes(target)) {
                    return -get.effect(target, trigger.card, trigger.player, _status.event.player);
                }
                return -1;
            }).set('targets', trigger.targets).set('prompt2', '令此牌对其中任意名角色无效').forResult();
        },
        async content(event, trigger, player) {
            trigger.getParent().excluded.addArray(event.targets);
        },
    },

    //墟吕蒙
    zshy_keji: {//克己
        audio: 'ext:诸神寰宇/audio/character:2',
        forced: true,
        trigger: {
            player: ['phaseDiscardBefore'],
        },
        async content(event, trigger, player) {
            trigger.cancel();
            player.chooseDrawRecover(true);
        },
    },
    zshy_qinxue: {//勤学
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        usable: 1,
        lose: false,
        delay: false,
        position: 'h',
        discard: false,
        filterCard(card, player, event) {
            return !card.hasGaintag('zshy_qinxue');
        },
        filter(event, player) {
            var num = 0, cards = player.getCards('h');
            for (var i of cards) {
                if (!i.hasGaintag('zshy_qinxue')) num++;
            }
            return num > 0;
        },
        check(card) {
            if (get.type(card) != 'basic' && get.type(card) != 'trick') return 0;
            return get.value(card) - 6;
        },
        prompt: '出牌阶段限1次，你可以复制一张手牌，称为「勤学」牌',
        async content(event, trigger, player) {
            const card = event.cards[0];
            const cardx = game.createCard2(card.name, card.suit, card.number, card.nature);
            player.gain(cardx).gaintag.add('zshy_qinxue');
        },
        ai: {
            order: 9,
            result: {
                player: 9,
            },
        },
        marktext: '勤学',
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
                if (card.hasGaintag('zshy_qinxue')) return true;
            },
            cardDiscardable(card, player, name) {
                if (name == 'phaseDiscard' && card.hasGaintag('zshy_qinxue')) return false;
            },
        },
    },
    zshy_botu: {//博图
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: 'phaseAfter' },
        forced: true,
        filter(event, player) {
            return event.player != player;
        },
        async content(event, trigger, player) {
            player.insertPhase();
        },
    },
    zshy_gongxin: {//攻心
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'useCardToPlayered',
        },
        shaRelated: true,
        check(event, player) {
            var target = lib.skill.zshy_gongxin.logTarget(event, player);
            return get.attitude(player, target) < 0;
        },
        filter(event, player) {
            var target = lib.skill.zshy_gongxin.logTarget(event, player);
            if (player == target) return false;
            return target.isAlive() && target.countCards('h');
        },
        logTarget(event, player) {
            return player == event.player ? event.target : event.player;
        },
        prompt2(event, player) {
            var target = lib.skill.zshy_gongxin.logTarget(event, player);
            return '观看' + get.translation(target) + '的手牌并选择一项：';
        },
        content() {
            'step 0'
            var target = lib.skill.zshy_gongxin.logTarget(trigger, player);
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
                if (choice == '获得此牌') {
                    player.gain(target, card, 'giveAuto');
                    if (get.suit(card) == 'heart') {
                        target.damage();
                    }
                }
                else {
                    target.lose(card, ui.cardPile, 'visible', 'insert');
                    game.log(target, '的', card, '被置于牌堆顶');
                    if (get.suit(card) == 'spade') {
                        player.recover();
                    }
                }
            }
            else event.finish();
        },
        ai: {
            expose: 0.2,
        },
    },

    //墟黄盖
    zshy_kurou: {//苦肉
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        locked: true,
        prompt: '出牌阶段，你可失去1点体力，然后重铸任意张牌',
        async content(event, trigger, player) {
            await player.loseHp();
            var str = '苦肉：选择任意张牌重铸';
            const result = await player.chooseCard('he', str, [1, Infinity]).set('ai', function (card) {
                if (card.name == 'tao' || card.name == 'jiu') return false;
                if (card.name == 'sha' && get.color(card) == 'red') return false;
                return 7 - get.value(card);
            }).forResult();
            if (result?.bool) {
                player.recast(result.cards);
            };
        },
        mod: {
            maxHandcard(player, num) {
                return num + (player.getDamagedHp() * 2);
            },
        },
        ai: {
            order: 9,
            result: {
                player(player) {
                    if (player.hp < 2 && !player.canSave(player)) return -1;
                    return 1;
                },
            },
        },
        group: ['zshy_kurou_damage'],
        subSkill: {
            damage: {
                trigger: {
                    player: 'damageBegin4',
                },
                forced: true,
                filter(event) {
                    return event.hasNature('fire');
                },
                content() {
                    trigger.cancel();
                    player.loseHp(trigger.num);
                },
                ai: {
                    effect: {
                        target(card, player, target) {
                            if (get.tag(card, 'fireDamage')) return player.hasSkillTag('jueqing', false, target);
                        },
                    },
                },
            },
        },
    },
    zshy_zhaxiang: {//诈降
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: { zshy_AAZZjiangweiSBFM: 'zshy_zhaxiang_zshy_AAZZjiangweiSBFM' },
        trigger: { player: 'loseHpEnd' },
        forced: true,
        async content(event, trigger, player) {
            await player.changeHujia();
            player.draw(2);
            if (player.isPhaseUsing()) {
                player.addTempSkill('zshy_zhaxiang_gain');
                player.addMark('zshy_zhaxiang_gain', 1, false);
            };
        },
        getIndex(event) {
            return event.num;
        },
        ai: {
            maihp: true,
            effect(card, player, target) {
                if (get.tag(card, 'damage')) {
                    if (player.hasSkillTag('jueqing', false, target)) return [1, 1];
                    return 1.2;
                }
                if (get.tag(card, 'loseHp')) {
                    if (target.hp <= 0) return;
                    var using = target.isPhaseUsing();
                    if (target.hp <= 1) return [1, player.countCards('h') <= 0 && using ? 3 : 0];
                    if (using && target.countCards('h', { name: 'sha', color: 'red' })) return [1, 3];
                    return [1, (target.countCards('h') <= target.hp || using && game.hasPlayer(function (current) {
                        return current != player && get.attitude(player, current) < 0 && player.inRange(current);
                    })) ? 3 : 2]
                }
            }
        },
        subSkill: {
            gain: {
                audio: 'zshy_zhaxiang',
                sub: true,
                mod: {
                    targetInRange(card, player, target, now) {
                        if (card.name == 'sha' && get.color(card) == 'red') return true;
                    },
                    cardUsable(card, player, num) {
                        if (card.name == 'sha') return num + player.storage.zshy_zhaxiang_gain;
                    },
                },
                charlotte: true,
                onremove: true,
                trigger: { player: 'useCard' },
                filter(event, player) {
                    return event.card && get.name(event.card) == 'sha' && get.color(event.card) == 'red';
                },
                forced: true,
                content() {
                    trigger.directHit.addArray(game.players);
                    player.recover();
                },
                intro: { content: '使用【杀】的次数上限+#<br>使用红色【杀】无距离限制且不能被【闪】响应' },
                ai: {
                    directHit_ai: true,
                    skillTagFilter(player, tag, arg) {
                        return arg.card.name == 'sha' && get.color(arg.card) == 'red';
                    },
                },

            },
        },
    },

    //墟夏侯惇
    zshy_ganglie: {//刚烈
        audio: 'ext:诸神寰宇/audio/character:4',
        trigger: { player: 'damageEnd' },
        filter(event, player) {
            return event.source?.isIn() && event.num > 0;
        },
        check(event, player) {
            return get.attitude(player, event.source) <= 0;
        },
        logTarget: 'source',
        preHidden: true,
        async content(event, trigger, player) {
            const { source } = trigger;
            const result = await player.judge(card => {
                if (get.color(card) == 'red') return 1;
                return 0;
            }).forResult();
            switch (result?.color) {
                case 'black':
                    if (source.isIn()) await source.loseHp();
                    if (source.countDiscardableCards(player, 'he')) await player.discardPlayerCard(source, 'he', true);
                    break;
                case 'red':
                    if (source.isIn()) await source.damage();
                    if (source.countGainableCards(player, 'he')) await player.gainPlayerCard(source, 'he', true);
                    break;
                default:
                    break;
            }
        },
        getIndex(event, player, triggername) {
            return event.num;
        },
        ai: {
            maixie: true,
            maixie_defend: true,
            expose: 0.4,
        },
    },
    zshy_qingjian: {//清俭
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'gainAfter',
            global: 'loseAsyncAfter',
        },
        filter(event, player) {
            return event.getg(player).length > 0;
        },
        async cost(event, trigger, player) {
            event.result = await player.chooseCardTarget({
                position: 'he',
                filterCard: true,
                selectCard: [1, Infinity],
                filterTarget: lib.filter.notMe,
                ai1(card) {
                    const player = get.player();
                    if (card.name != 'du' && get.attitude(player, _status.currentPhase) < 0 && _status.currentPhase?.needsToDiscard()) return -1;
                    for (var i = 0; i < ui.selected.cards.length; i++) {
                        if (get.type(ui.selected.cards[i]) == get.type(card) || (ui.selected.cards[i].name == 'du' && card.name != 'du')) return -1;
                    }
                    if (card.name == 'du') return 20;
                    return player.countCards('h') - player.hp;
                },
                ai2(target) {
                    const player = get.player();
                    if (get.attitude(player, _status.currentPhase) < 0) return -1;
                    const att = get.attitude(player, target);
                    if (ui.selected.cards.length && ui.selected.cards[0].name == 'du') {
                        if (target.hasSkillTag('nodu')) return 0;
                        return 1 - att;
                    }
                    if (target.countCards('h') > player.countCards('h')) return 0;
                    return att - 4;
                },
                prompt: get.prompt2(event.name.slice(0, -5)),
            }).forResult();
        },
        async content(event, trigger, player) {
            const {
                targets: [target],
                cards,
            } = event;
            await player.give(cards, target);
            player.changeHujia(cards.map(card => get.type2(card)).toUniqued().length);
        },
        ai: {
            expose: 0.3,
        },
    },

    //墟张辽
    zshy_tuxi: {//突袭
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'gainAfter',
        },
        filter(event, player) {
            return event.player != player && event.player.countGainableCards(player, 'he') > 0 && event.cards.length > 1;
        },
        check(event, player) {
            return get.attitude(player, event.player) < 0;
        },
        prompt2(event, player) {
            return '获得' + get.translation(event.player) + '的一张牌并根据获得牌的类别执行对应效果：1.基本，你摸一张牌并使用一张牌；2.锦囊，你回复1点体力或摸一张牌；3.装备，你对其造成1点伤害。'
        },
        logTarget(event, player) {
            return event.player;
        },
        async content(event, trigger, player) {
            const result = await player.gainPlayerCard(trigger.player, 'he', true).forResult();
            if (result.bool && result.cards) {
                switch (get.type(result.cards[0])) {
                    case 'basic':
                        await player.draw();
                        await player.chooseToUse();
                        break;
                    case 'trick':
                        await player.recover();
                        await player.draw();
                        break;
                    case 'equip':
                        await trigger.player.damage();
                        await player.changeHujia();
                        break;
                    default:
                        break;
                }
            }
        },
        ai: {
            threaten: 1.6,
            expose: 0.2,
        },
        group: ['zshy_tuxi_Draw'],
        subSkill: {
            Draw: {
                audio: 'zshy_tuxi',
                trigger: {
                    player: 'phaseDrawBegin2',
                },
                direct: true,
                preHidden: true,
                filter(event, player) {
                    return (event.num > 0 && !event.numFixed
                        && game.hasPlayer(function (target) {
                            return target.countCards('he') > 0 && player != target;
                        }));
                },
                content() {
                    'step 0';
                    var num = get.copy(trigger.num);
                    player.chooseTarget(get.prompt('zshy_tuxi'),
                        '获得至多' + get.translation(num) + '名角色的各一张手牌，然后少摸等量的牌',
                        [1, num], function (card, player, target) {
                            return target.countCards('he') > 0 && player != target;
                        }, function (target) {
                            var att = get.attitude(_status.event.player, target);
                            if (target.hasSkill('tuntian')) {
                                return att / 10;
                            }
                            return 1 - att;
                        }).setHiddenSkill('zshy_tuxi');
                    'step 1';
                    if (result.bool) {
                        result.targets.sortBySeat();
                        player.logSkill('zshy_tuxi', result.targets);
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
                    threaten: 1.6,
                    expose: 0.2,
                },
            },
        },
    },

    //墟许褚
    zshy_luoyi: {//裸衣
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'phaseZhunbeiBegin',
        },
        forced: true,
        filter(event, player) {
            return !event.numFixed;
        },
        content() {
            player.draw(3);
        },
        group: ['zshy_luoyi_sourcedamage'],
        subSkill: {
            sourcedamage: {
                audio: 'zshy_luoyi',
                sub: true,
                trigger: { source: 'damageBegin1' },
                filter(event) {
                    return event.card && (get.name(event.card) == 'sha' || get.name(event.card) == 'juedou');
                },
                forced: true,
                content() {
                    trigger.num += player.getDamagedHp() + 1;
                },
                ai: {
                    damageBonus: true,
                    skillTagFilter(player, tag, arg) {
                        if (tag === 'damageBonus') return arg && arg.card && (arg.card.name === 'sha' || arg.card.name === 'juedou');
                    }
                },
            },
        },
    },
    zshy_huwei: {//虎威
        audio: 'zshy_luoyi',
        init(player) {
            if (player.getHistory('useCard', evt => get.name(evt.card) == 'sha').length) player.addTempSkill('zshy_huwei_used');
        },
        mod: {
            targetInRange(card, player, target) {
                if (get.name(card) == 'sha') return true;
            },
        },
        trigger: {
            player: 'useCard',
            source: 'damageSource',
        },
        filter(event, player) {
            if (event.name == 'damage') return player.getHistory('sourceDamage').indexOf(event) === 0;
            if (get.name(event.card) == 'sha' && !player.hasSkill('zshy_huwei_used')) return true;
            return get.type(event.card) == 'basic' && player.getHistory('useCard', evt => get.type(evt.card) == 'basic').indexOf(event) === 0;
        },
        forced: true,
        content() {
            if (trigger.name == 'damage') player.chooseDrawRecover(true);
            else {
                if (get.name(trigger.card) == 'sha') {
                    game.log(trigger.card, '无距离限制');
                    player.addTempSkill('zshy_huwei_used');
                }
                if (get.type(trigger.card) == 'basic' && player.getHistory('useCard', evt => get.type(evt.card) == 'basic').indexOf(trigger) === 0) {
                    game.log(trigger.card, '不计入次数上限');
                    trigger.addCount = false;
                    if (player.stat[player.stat.length - 1].card.sha > 0) player.stat[player.stat.length - 1].card.sha--;
                }
            }
        },
        group: ['zshy_huwei_damage'],
        subSkill: {
            damage: {
                audio: 'zshy_huwei',
                trigger: {
                    player: 'damageAfter',
                },
                filter(event, player) {
                    return event.source != player;
                },
                prompt2(event, player) {
                    return '是否对' + get.translation(event.source) + '使用一张【决斗】';
                },
                check(event, player) {
                    return get.attitude(player, event.source) < 0 && (player.countCards('h', { name: 'sha' }) > 0 || player.hp > 1);
                },
                content() {
                    var card = { name: 'juedou', isCard: true };
                    player.useCard(card, trigger.source, false);
                },
            },
        },
    },

    //墟吕布
    zshy_wushuang: {//无双
        audio: 'ext:诸神寰宇/audio/character:2',
        shaRelated: true,
        forced: true,
        locked: true,
        group: ['zshy_wushuang_sha', 'zshy_wushuang_juedou', 'zshy_wushuang_draw'],
        preHidden: ['zshy_wushuang_sha', 'zshy_wushuang_juedou', 'zshy_wushuang_draw'],
        subSkill: {
            sha: {
                audio: 'zshy_wushuang',
                trigger: { player: 'useCardToPlayered' },
                forced: true,
                direct: true,
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
                    player.logSkill('zshy_wushuang');
                },
                ai: {
                    directHit_ai: true,
                    skillTagFilter(player, tag, arg) {
                        if (arg.card.name != 'sha' || arg.target.countCards('h', 'shan') > 1) return false;
                    },
                },
            },
            juedou: {
                audio: 'zshy_wushuang',
                trigger: { player: 'useCardToPlayered', target: 'useCardToTargeted' },
                forced: true,
                direct: true,
                logTarget(trigger, player) {
                    return player == trigger.player ? trigger.target : trigger.player
                },
                filter(event, player) {
                    return get.name(event.card) == 'juedou';
                },
                async content(event, trigger, player) {
                    const id = (player == trigger.player ? trigger.target : trigger.player)['playerid'];
                    const idt = trigger.target.playerid;
                    const map = trigger.getParent().customArgs;
                    if (!map[idt]) map[idt] = {};
                    if (!map[idt].shaReq) map[idt].shaReq = {};
                    if (!map[idt].shaReq[id]) map[idt].shaReq[id] = 1;
                    map[idt].shaReq[id]++;
                    player.logSkill('zshy_wushuang');
                },
                ai: {
                    directHit_ai: true,
                    skillTagFilter(player, tag, arg) {
                        if (arg.card.name != 'juedou' || Math.floor(arg.target.countCards('h', 'sha') / 2) > player.countCards('h', 'sha')) return false;
                    }
                }
            },
            draw: {
                audio: 'zshy_wushuang',
                trigger: {
                    player: 'useCard',
                },
                direct: true,
                filter(event, player) {
                    return get.name(event.card) == 'juedou' || get.name(event.card) == 'sha';
                },
                content() {
                    var name = get.name(trigger.card);
                    player.markAuto('zshy_wushuang', [name]);
                    trigger.effectCount++;
                },
            },
        },
    },
    zshy_liqu: {//利驱
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            source: 'damageSource',
        },
        filter(event, player) {
            if (event._notrigger.includes(event.player)) return false;
            return event.card && get.name(event.card) == 'sha' && event.player != player && event.player.isIn() && event.player.countGainableCards(player, 'hes') > 0;
        },
        check(event, player) {
            return get.attitude(player, event.target) < 0;
        },
        direct: true,
        content() {
            'step 0'
            player.gainPlayerCard(get.prompt('zshy_liqu', trigger.player), trigger.player, 'hes', 'visibleMove').set('ai', function (button) {
                var player = _status.event.player, target = _status.event.target;
                if (get.attitude(player, target) > 0) return false;
                return _status.event.juedou;
            }).set('juedou', (() => {
                if (get.attitude(player, trigger.player) > 0 && game.hasPlayer(function (current) {
                    return (player.canUse({ name: 'juedou' }, current) && current != trigger.player && current != player && get.effect(current, { name: 'juedou' }, player, _status.event.player) > 2);
                })) return 5;
                if (game.hasPlayer(function (current) {
                    return (player.canUse({ name: 'juedou' }, current) && current != trigger.player && current != player && get.effect(current, { name: 'juedou' }, player, _status.event.player) < 0);
                })) return 1;
                return 4;
            })()).set('logSkill', ['zshy_liqu', trigger.player]);
            'step 1'
            if (result.bool) {
                player.useCard({ name: 'juedou', isCard: true }, trigger.player).nowuxie = true;
            }
            else event.finish();
        },
        ai: {
            halfneg: true,
        },
        group: ['zshy_liqu_sub1'],
        subSkill: {
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
                    return event.card && (get.name(event.card) == 'sha' || get.name(event.card) == 'juedou') && player.isDamaged();
                },
                content() {
                    //trigger.num++;
                    trigger.num += player.getDamagedHp();
                },
                ai: {
                    skillTagFilter(player, tag, arg) {
                        return arg.card.name == 'juedou';
                    },
                },
            },
        },
    },

    //墟华雄
    zshy_yaowu: {//耀武
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'damageAfter',
        },
        filter(event) {
            return event.card && (event.source && event.source.isIn());
        },
        forced: true,
        async content(event, trigger, player) {
            if (get.color(trigger.card) != 'red') {
                player.chooseDrawRecover(2, true);
            }
            else {
                trigger.source.chooseDrawRecover(true);
            }
        },
        ai: {
            effect: {
                target: (card, player, target, current) => {
                    if (get.color(card) == 'red') {
                        var num = player.isDamaged() ? 2 : 1;
                        if (get.attitude(player, target) > 0 && player.hp < 2) return [1, 0, 1, num];
                        return [1, 0, 1, num / 2];
                    }
                    return [1, 0];
                },
            },
        },
    },
    zshy_shizhan: {//势斩
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        filterTarget(card, player, target) {
            return target != player && target.canUse('juedou', player) && target.hp <= player.hp;
        },
        async content(event, trigger, player) {
            await event.target.useCard({ name: 'juedou', isCard: true }, player, 'noai');
        },
        ai: {
            order: 6,
            result: {
                player(player, target) {
                    if (!target) return 0;
                    // 实际是目标对自己使用决斗；交给本体评估响应、免伤和卖血收益。
                    const score = get.effect(player, { name: 'juedou', isCard: true }, target, player);
                    // 将净收益转换成发动意愿，不把带态度的总分再次作为基础收益加权。
                    return score > 0 ? 1 : score < 0 ? -1 : 0;
                },
            },
        },
    },

};
const 帷幄千里 = {
    //墟诸葛亮
    zshy_guanxing: {//观星
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AAZZjiangweiSHZL: 'zshy_guanxing_zshy_AAZZjiangweiSHZL',
        },
        trigger: {
            global: 'phaseZhunbeiBegin',
        },
        forced: true,
        async content(event, trigger, player) {
            player.chooseToGuanxing(7);
            player.chooseDrawRecover(true);
        },
        group: ['zshy_guanxing_Usecard'],
        subSkill: {
            zshy_AAZZjiangweiSHZL: { audio: 'ext:诸神寰宇/audio/character:2' },
            Usecard: {
                audio: 'zshy_guanxing',
                enable: ['chooseToUse', 'chooseToRespond'],
                delay: false,
                direct: true,
                forced: true,
                charlotte: true,
                mark: true,
                hiddenCard(player, name) {
                    if (['wuxie'].includes(name)) return false;
                    if (lib.inpile.includes(name)) return true;
                },
                filter(event, player, card) {
                    if (event.responded || event.zshy_guanxing_Usecard) return false;
                    for (var i of lib.inpile) {
                        if (event.filterCard(get.autoViewAs({ name: i }, 'unsure'), player, event)) return true;
                    }
                    return false;
                },
                content() {
                    'step 0'
                    var evt = event.getParent(2);
                    evt.set('zshy_guanxing_Usecard', true);
                    var cards = get.cards(7);
                    for (var i = cards.length - 1; i >= 0; i--) {
                        ui.cardPile.insertBefore(cards[i].fix(), ui.cardPile.firstChild);
                    }
                    player.chooseButton(['观星：请选择要' + (evt.name == 'chooseToUse' ? '使用' : '打出') + '的牌', cards]).set('filterButton', function (button) {
                        return _status.event.cards.includes(button.link);
                    }).set('cards', cards.filter(function (card) {
                        return evt.filterCard(card, evt.player, evt);
                    })).set('ai', function (button) {
                        var evt = _status.event.getParent(3);
                        if (evt && evt.ai) {
                            var tmp = _status.event;
                            _status.event = evt;
                            var result = (evt.ai || event.ai1)(button.link, _status.event.player, evt);
                            _status.event = tmp;
                            return result;
                        }
                        return 1;
                    });
                    'step 1'
                    var evt = event.getParent(2);
                    if (result.bool && result.links && result.links.length) {
                        var card = result.links[0], name = card.name;
                        if (evt.name == 'chooseToUse') {
                            game.broadcastAll(function (result, name) {
                                lib.skill.zshy_guanxing_backup.viewAs = { name: name, cards: [result], isCard: true };
                            }, card, name);
                            evt.set('_backupevent', 'zshy_guanxing_backup');
                            evt.set('openskilldialog', '观星：请选择' + get.translation(card) + '的目标');
                            evt.backup('zshy_guanxing_backup');
                            player.logSkill('zshy_guanxing_Usecard');
                        }
                        else {
                            delete evt.result.skill;
                            delete evt.result.used;
                            evt.result.card = get.autoViewAs(result.links[0]);
                            evt.result.cards = [result.links[0]];
                            evt.redo();
                            return;
                        }
                    }
                    evt.goto(0);
                },
                ai: {
                    order: 9,
                    respondSha: true,
                    respondShan: true,
                    skillTagFilter(player) {
                        return true;
                    },
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
            backup: {
                sub: true,
                selectCard: -1,
                filterCard() {
                    return false;
                },
                precontent() {
                    delete event.result.skill;
                    var name = event.result.card.name, cards = event.result.card.cards.slice(0);
                    event.result.cards = cards;
                    var rcard = cards[0], card;
                    if (rcard.name == name) card = get.autoViewAs(rcard);
                    else card = get.autoViewAs({ name, isCard: true });
                    event.result.card = card;
                },
            },
        },
    },
    zshy_kongcheng: {//空城
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        locked: true,
        filter(event, player) {
            return game.hasPlayer(function (current) {
                return player.inRange(current) && player.countCards('he') > 0;
            });
        },
        filterCard(card) {
            return true;
        },
        position: 'he',
        selectCard(event, player, target) {
            return [1, Infinity];
        },
        complexCard: true,
        complexSelect: true,
        filterTarget(card, player, target) {
            return player.inRange(target);
        },
        prompt2() {
            return '弃置任意张牌并对攻击范围内的一名其他角色造成等量点伤害';
        },
        check(card) {
            let player = _status.event.player;
            if (game.hasPlayer(function (current) {
                return player.inRange(current) && get.damageEffect(current, player, player) > 0;
            })) return 0;
            switch (ui.selected.cards.length) {
                case 0: return 7.5 - get.value(card);
                case 1: return 6 - get.value(card);
                case 2: return 5 - get.value(card);
                default: return 0;
            }
        },
        async content(event, trigger, player) {
            event.target.damage(event.cards.length, 'nocard');
        },
        mod: {
            targetEnabled(card, player, target) {
                if (get.name(card) == 'sha' || get.name(card) == 'juedou') return false;
            },
            targetEnabled2(card, player, target) {
                if (get.name(card) == 'sha' || get.name(card) == 'juedou') return false;
            },
        },
        ai: {
            damage: true,
            order() {
                return [1, 2, 3].randomGet();
            },
            result: {
                target(player, target) {
                    return get.damageEffect(target, player);
                },
            },
            tag: {
                damage: 1,
            },
        },
    },

    //墟周瑜
    zshy_yingzi: {//英姿
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AAZZsunceSHZL: 'zshy_yingzi_zshy_AAZZsunceSHZL',
            zshy_AAZZsunyiJMGX: 'zshy_yingzi_zshy_AAZZsunyiJMGX',
        },
        trigger: {
            global: ['phaseZhunbeiBegin'],
        },
        forced: true,
        preHidden: true,
        async content(event, trigger, player) {
            player.changeHujia();
            if (trigger.player == player) {
                player.chooseDrawRecover(player.maxHp, true);
            };
        },
        mod: {
            maxHandcard(player, num) {
                return num + player.maxHp;
            },
        },
        ai: {
            threaten: 1.5,
        },
        subSkill: {
            zshy_AAZZsunyiJMGX: { audio: 'ext:诸神寰宇/audio/character:2' },
        },
    },
    zshy_fanjian: {//反间
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: ['phaseUse'],
        filterTarget(card, player, target) {
            return player != target && target.countCards('he') > 0;
        },
        async content(event, trigger, player) {
            await Promise.all(event.next);
            event.videoId = lib.status.videoId++;
            if (player.isUnderControl()) game.swapPlayerAuto(player);
            function chooseOneSuitCard(player, target, force = false, limit, str = '请选择一个花色的牌', ai = { bool: false }) {
                const { promise, resolve } = Promise.withResolvers();
                const event = _status.event;
                event.selectedCards = [];
                event.selectedButtons = [];
                //对手牌按花色分类
                let suitCards = Object.groupBy(target.getCards('he'), c => get.suit(c, target));
                suitCards.heart ??= [];
                suitCards.diamond ??= [];
                suitCards.spade ??= [];
                suitCards.club ??= [];
                let dialog = (event.dialog = ui.create.dialog());
                dialog.classList.add('fullheight');
                event.control_ok = ui.create.control('ok', link => {
                    _status.imchoosing = false;
                    event.dialog.close();
                    event.control_ok?.close();
                    event.control_cancel?.close();
                    event._result = {
                        bool: true,
                        cards: event.selectedCards,
                    };
                    resolve(event._result);
                    game.resume();
                });
                event.control_ok.classList.add('disabled');
                //如果是非强制的，才创建取消按钮
                if (!force) {
                    event.control_cancel = ui.create.control('cancel', link => {
                        _status.imchoosing = false;
                        event.dialog.close();
                        event.control_ok?.close();
                        event.control_cancel?.close();
                        event._result = {
                            bool: false,
                        };
                        resolve(event._result);
                        game.resume();
                    });
                }
                event.switchToAuto = function () {
                    _status.imchoosing = false;
                    event.dialog?.close();
                    event.control_ok?.close();
                    event.control_cancel?.close();
                    event._result = ai();
                    resolve(event._result);
                    game.resume();
                };
                dialog.addNewRow(str);
                let keys = Object.keys(suitCards).sort((a, b) => {
                    let arr = ['spade', 'heart', 'club', 'diamond', 'none'];
                    return arr.indexOf(a) - arr.indexOf(b);
                });
                //添加框
                while (keys.length) {
                    let key1 = keys.shift();
                    let cards1 = suitCards[key1];
                    let key2 = keys.shift();
                    let cards2 = suitCards[key2];
                    //点击容器的回调
                    /**@type {Row_Item_Option['clickItemContainer']} */
                    const clickItemContainer = function (container, item, allContainer) {
                        if (!item?.length || item.some(card => !lib.filter.cardDiscardable(card, player, event.name))) return;
                        if (event.selectedButtons.includes(container)) {
                            container.classList.remove('selected');
                            event.selectedButtons.remove(container);
                            event.selectedCards.removeArray(item);
                        } else {
                            if (event.selectedButtons.length >= limit) {
                                let precontainer = event.selectedButtons[0];
                                precontainer.classList.remove('selected');
                                event.selectedButtons.remove(precontainer);
                                let suit = get.suit(event.selectedCards[0], target),
                                    cards = target.getCards('he', { suit: suit });
                                event.selectedCards.removeArray(cards);
                            }
                            container.classList.add('selected');
                            event.selectedButtons.add(container);
                            event.selectedCards.addArray(item);
                        }
                        event.control_ok.classList[event.selectedButtons.length === limit ? 'remove' : 'add']('disabled');
                    };
                    //给框加封条，显示xxx牌多少张
                    function createCustom(suit, count) {
                        return function (itemContainer) {
                            function formatStr(str) {
                                return str.replace(/[♥︎♦︎]/g, '<span style="color: red; ">$&</span>');
                            }
                            let div = ui.create.div(itemContainer);
                            if (count) {
                                div.innerHTML = formatStr(`${get.translation(suit)}牌${count}张`);
                            } else {
                                div.innerHTML = formatStr(`没有${get.translation(suit)}牌`);
                            }
                            div.css({
                                position: 'absolute',
                                width: '100%',
                                bottom: '1%',
                                height: '35%',
                                background: '#352929bf',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                fontSize: '1.2em',
                                zIndex: '2',
                            });
                        };
                    }
                    //框的样式，不要太宽，高度最小也要100px，防止空框没有高度
                    /**@type {Row_Item_Option['itemContainerCss']} */
                    let itemContainerCss = {
                        border: 'solid #c6b3b3 2px',
                        minHeight: '100px',
                    };
                    if (key2) {
                        dialog.addNewRow(
                            {
                                item: cards1,
                                ItemNoclick: true, //卡牌不需要被点击
                                clickItemContainer,
                                custom: createCustom(key1, cards1.length), //添加封条
                                itemContainerCss,
                            },
                            {
                                item: cards2,
                                ItemNoclick: true, //卡牌不需要被点击
                                clickItemContainer,
                                custom: createCustom(key2, cards2.length),
                                itemContainerCss,
                            }
                        );
                    } else {
                        dialog.addNewRow({
                            item: cards1,
                            ItemNoclick: true, //卡牌不需要被点击
                            clickItemContainer,
                            custom: createCustom(key1, cards1.length),
                            itemContainerCss,
                        });
                    }
                }
                game.pause();
                dialog.open();
                _status.imchoosing = true;
                return promise;
            };
            let next2;
            let ai2 = function () {
                let list = lib.suits.slice().filter(i => event.target.hasCard({ suit: i }, 'he'));
                let getv = cards => cards.map(i => get.value(i)).reduce((p, c) => p + c, 0);
                return {
                    bool: true,
                    cards: event.target.getCards('he', {
                        suit: list.sort((a, b) => {
                            return getv(event.target.getCards('he', { suit: b })) - getv(event.target.getCards('he', { suit: a }));
                        })[0],
                    }),
                };
            };
            const str1 = `请选择获得的花色牌，然后对${get.translation(event.target)}造成1点火焰伤害`;
            if (event.isMine()) {
                next2 = chooseOneSuitCard(player, event.target, true, 1, str1, ai2);
            } else if (player.isOnline()) {
                let { promise, resolve } = Promise.withResolvers();
                player.send(chooseOneSuitCard, player, event.target, true, 1, str1, ai2);
                player.wait(result => {
                    if (result == 'ai') result = ai2();
                    resolve(result);
                });
                next2 = promise;
            } else next2 = Promise.resolve(ai2());
            const result = await next2;
            if (!result) {
                return;
            };
            let cards = result.cards.slice().filter(card => lib.filter.canBeGained(card, player, event.target));
            if (cards.length) {
                await player.gain(cards, 'notBySelf');
            }
            game.delay();
            let list = [];
            for (const i of event.target.getCards('he')) {
                if (!list.includes(get.suit(i))) {
                    list.add(get.suit(i));
                }
            };
            if (list.length < 2) {
                player.tempBanSkill('zshy_fanjian');
            };
            await event.target.damage(cards.length, 'fire');
        },
        ai: {
            order: 10,
            threaten: 2,
            result: {
                target(player, target) {
                    return -target.countCards('he');
                }
            },
        },
    },

    //墟陆逊
    zshy_qianxun: {//谦逊
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            target: 'useCardToTarget',
            player: ['addJudgeBefore'],
        },
        forced: true,
        priority: 15,
        check(event, player) {
            return event.name == 'addJudge' || get.effect(event.target, event.card, event.player, player) < 0;
        },
        filter(event, player) {
            return get.name(event.card) == 'shunshou' || get.type(event.card) == 'delay';
        },
        content() {
            'step 0'
            if (trigger.name == 'addJudge') {
                trigger.cancel();
            }
            else trigger.getParent().targets.remove(player);
            player.chooseCard('hes', '是否重铸任意张牌？', [1, Infinity]).set('ai', function (card) {
                if (card.name == 'tao' || card.name == 'jiu') return false;
                return 7 - get.value(card);
            });
            'step 1'
            if (result.bool) {
                player.logSkill('zshy_qianxun', player);
                player.recast(result.cards);
            };
        },
        ai: {
            effect: {
                target(card, player, target, current) {
                    if (card.name == 'shunshou' || get.type(card) == 'delay') return 'zeroplayertarget';
                },
            },
        },
        group: ['zshy_qianxun_sub1', 'zshy_qianxun_linked'],
        subSkill: {
            sub1: {
                audio: 'zshy_qianxun',
                init(player) {
                    if (!player.storage.zshy_qianxun_sub2) player.storage.zshy_qianxun_sub2 = [];
                },
                trigger: {
                    target: 'useCardToBegin',
                    player: 'judgeBefore',
                },
                prompt(event, player) {
                    return '你可以将所有手牌置于你的武将牌上，若如此做，此回合结束时，你获得你武将牌上的所有牌';
                },
                filter(event, player) {
                    if (player.countCards('h') == 0) return false;
                    if (event.parent.name == 'phaseJudge') {
                        if (lib.skill.zshy_qianxun.trigger.player == 'judgeBefore') {
                            return true;
                        }
                        return event.result && event.result.judge != 0;
                    }
                    if (event.name == 'judge') return false;
                    if (event.card && get.type(event.card) == 'trick' && event.player != player) return true;
                },
                content() {
                    player.storage.zshy_qianxun_sub2 = player.storage.zshy_qianxun_sub2.concat(player.getCards('h'));
                    game.addVideo('storage', player, ['zshy_qianxun_sub2', get.cardsInfo(player.storage.zshy_qianxun_sub2), 'cards']);
                    player.lose(player.getCards('h'), ui.special, 'toStorage');
                    player.addSkill('zshy_qianxun_sub2');
                },
                ai: {
                    effect(card, player, target) {
                        if (!target.hasFriend()) return;
                        if (player == target) return;
                        var type = get.type(card);
                        var nh = target.countCards();
                        if (type == 'trick') {
                            if (!get.tag(card, 'multitarget') || get.info(card).singleCard) {
                                if (get.tag(card, 'damage')) {
                                    if (nh < 3 || target.hp <= 2) return 0.8;
                                }
                                return [1, nh];
                            }
                        }
                        else if (type == 'delay') {
                            return [0.5, 0.5];
                        }
                    },
                },
            },
            sub2: {
                audio: 'zshy_qianxun',
                trigger: { global: 'phaseEnd' },
                forced: true,
                audio: false,
                content() {
                    player.gain(player.storage.zshy_qianxun_sub2, 'fromStorage', 'draw');
                    player.storage.zshy_qianxun_sub2.length = 0;
                    player.removeSkill('zshy_qianxun_sub2');
                    game.addVideo('storage', player, ['zshy_qianxun_sub2', get.cardsInfo(player.storage.zshy_qianxun_sub2), 'cards']);
                },
                mark: true,
                intro: {
                    content: 'cardCount',
                    onunmark(storage, player) {
                        if (storage && storage.length) {
                            player.$throw(storage, 1000);
                            game.cardsDiscard(storage);
                            game.log(storage, '被置入了弃牌堆');
                            player.storage.zshy_qianxun_sub2.length = 0;
                        }
                    },
                }
            },
            linked: {
                audio: 'zshy_qianxun',
                trigger: {
                    player: 'linkBegin',
                },
                direct: true,
                filter(event, player) {
                    return !player.isLinked();
                },
                content() {
                    'step 0'
                    trigger.cancel();
                    player.chooseCard('hes', '是否重铸任意张牌？', [1, Infinity]).set('ai', function (card) {
                        if (card.name == 'tao' || card.name == 'jiu') return false;
                        return 7 - get.value(card);
                    });
                    'step 1'
                    if (result.bool) {
                        player.logSkill('zshy_qianxun');
                        player.recast(result.cards);
                    };
                },
            },
        },
    },
    zshy_lianying: {//连营
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'loseAfter',
            global: ['equipAfter', 'addJudgeAfter', 'gainAfter', 'loseAsyncAfter', 'addToExpansionAfter'],
        },
        direct: true,
        filter(event, player) {
            return player.countCards('h') == 0;
        },
        Prompt2(player) {
            return '请选择任意名角色，令其摸同等其体力上限张牌。';
        },
        content() {
            'step 0'
            player.chooseTarget(get.prompt('zshy_lianying'), '令至多' + player.maxHp + '名角色摸同等其体力上限张牌', [1, player.maxHp]).ai = function (target) {
                var player = _status.event.player;
                if (player == target) return get.attitude(player, target) + 10;
                return get.attitude(player, target);
            }
            'step 1'
            if (result.bool) {
                player.logSkill('zshy_lianying', result.targets);
                for (var i = 0; i < result.targets.length; i++) {
                    result.targets[i].draw(result.targets[i].maxHp);
                }
            }
            else event.finish();
            'step 2'
            game.delay();
        },
        mod: {
            cardUsableTarget(card, player, target) {
                if (target.isLinked()) return true;
            },
        },
        ai: {
            threaten: 0.8,
            effect: {
                target(card) {
                    if (card.name == 'guohe' || card.name == 'liuxinghuoyu') return 0.5;
                },
            },
            noh: true,
        },
        group: ['zshy_lianying_sub1', 'zshy_lianying_sub2'],
        subSkill: {
            sub1: {
                audio: 'zshy_lianying',
                trigger: {
                    player: 'phaseUseBegin',
                },
                direct: true,
                sourceSkill: 'zshy_lianying',
                content() {
                    'step 0'
                    player.chooseTarget(get.prompt('zshy_lianying'), '请选择至多' + player.maxHp + '名角色横置', [1, player.maxHp])
                        .set('ai', function (target) {
                            var player = _status.event.player, att = get.attitude(player, target);
                            if (!target.isLinked()) return get.damageEffect(target, player, player);
                            else return att > 0;
                            return 0;
                        });
                    'step 1'
                    if (result.bool && result.targets) {
                        player.logSkill('zshy_lianying');
                        var targets = result.targets.sortBySeat();
                        player.line(targets);
                        for (var i of targets) i.link();
                    }
                },
            },
            sub2: {
                sub: true,
                audio: 'zshy_lianying',
                trigger: {
                    source: 'damageBegin',
                },
                forced: true,
                popup: false,
                direct: true,
                filter(event, player) {
                    return event.nature && event.player.isLinked();
                },
                content() {
                    player.logSkill('zshy_lianying_sub2', trigger.player);
                    trigger.num++;
                },
            },
        }
    },

    //墟华佗
    zshy_jijiu: {//急救
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'chooseToUse',
        locked: false,
        viewAsFilter(player) {
            return player.countCards('hes') > 0;
        },
        filterCard(card) {
            return true;
        },
        position: 'hes',
        viewAs: { name: 'tao' },
        prompt: '将一张牌当桃使用',
        check(card) {
            return 15 - get.value(card);
        },
        mod: {
            aiValue(player, card, num) {
                if (get.name(card) != 'tao') return;
                const cards = player.getCards('hs', card => get.name(card) == 'tao');
                cards.sort((a, b) => (get.name(a) == 'tao' ? 1 : 2) - (get.name(b) == 'tao' ? 1 : 2));
                var geti = () => {
                    if (cards.includes(card)) cards.indexOf(card);
                    return cards.length;
                };
                return Math.max(num, [6.5, 4, 3, 2][Math.min(geti(), 2)]);
            },
            aiUseful() {
                return lib.skill.kanpo.mod.aiValue.apply(this, arguments);
            },
        },
        ai: {
            threaten: 6,
        },
        group: ['zshy_jijiu_nodie'],
        subSkill: {
            nodie: {
                audio: 'zshy_jijiu',
                trigger: {
                    global: ['dieBefore'],
                },
                prompt2(event, player) {
                    return '是否令' + get.translation(event.player) + '减少1点体力上限，然后回复至1点体力';
                },
                check(event, player) {
                    return get.attitude(player, event.player) > 0;
                },
                filter(event, player) {
                    return event.player.maxHp > 1;
                },
                async content(event, trigger, player) {
                    trigger.cancel();
                    trigger.player.loseMaxHp();
                    trigger.player.recoverTo(1);
                },
            },
        },
    },
    zshy_qingnang: {//青囊
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        filterCard: true,
        position: 'hes',
        check(card) {
            var player = _status.event.player;
            if (
                game.countPlayer(function (current) {
                    return get.recoverEffect(current, player, player) > 0 && get.attitude(player, current) > 2;
                }) > 1 &&
                get.color(card) == 'black' &&
                player.countCards('he', { color: 'red' }) > 0
            )
                return 3 - get.value(card);
            return 9 - get.value(card);
        },
        filterTarget(card, player, target) {
            if (target.hp >= target.maxHp || target.hasSkill('zshy_qingnang_off')) return false;
            return true;
        },
        content() {
            target.addTempSkill('zshy_qingnang_off');
            if (get.color(cards[0]) == 'black') player.tempBanSkill('zshy_qingnang');
            target.recover(target.maxHp - target.hp);
        },
        ai: {
            order: 11,
            result: {
                target(player, target) {
                    if (target.hp == 1) return 11;
                    if (player == target && player.countCards('h') > player.hp) return 11;
                    return 2;
                },
            },
            threaten: 6,
        },
        group: ['zshy_qingnang_recover'],
        subSkill: {
            off: {
                sub: true,
            },
            recover: {
                audio: 'zshy_qingnang',
                trigger: {
                    player: 'useCard',
                },
                forced: true,
                silent: true,
                popup: false,
                firstDo: true,
                filter(event, player, card) {
                    return event.card && get.name(event.card) == 'tao';
                },
                content() {
                    trigger.baseDamage++;
                    //trigger.baseDamage += Math.max(1, player.hp);
                },
                ai: {
                    skillTagFilter(player, arg, card) {
                        return arg.card.name == 'tao';
                    },
                },
            },
        },
    },

    //墟司马懿
    zshy_guicai: {//鬼才
        audio: 'ext:诸神寰宇/audio/character:4',
        audioname2: {
            zshy_AAZZshensimayiSHZL: 'zshy_guicai_zshy_AAZZshensimayiSHZL',
        },
        trigger: {
            global: 'judge',
        },
        filter(event, player) {
            return player.countCards('hes') > 0;
        },
        async content(event, trigger, player) {
            player.draw();
            const result = await player.chooseCard(get.translation(trigger.player) + '的' + (trigger.judgestr || '') + '判定为' +
                get.translation(trigger.player.judging[0]) + '，' + get.prompt('zshy_guicai'), 'he').set('ai', function (card) {
                    var trigger = _status.event.getTrigger();
                    var player = _status.event.player;
                    var judging = _status.event.judging;
                    var result = trigger.judge(card) - trigger.judge(judging);
                    var attitude = ai.get.attitude(player, trigger.player);
                    if (attitude == 0 || result == 0) return 0;
                    if (attitude > 0) {
                        return result - ai.get.value(card) / 2;
                    }
                    else {
                        return -result - ai.get.value(card) / 2;
                    }
                }).set('judging', trigger.player.judging[0]).forResult();
            if (result && result.bool) {
                await player.respond(result.cards, 'highlight');
                await player.logSkill('zshy_guicai');
                if (trigger.player.judging[0].clone) {
                    await trigger.player.judging[0].clone.classList.remove('thrownhighlight');
                    game.broadcast(function (card) {
                        if (card.clone) {
                            card.clone.classList.remove('thrownhighlight');
                        }
                    }, trigger.player.judging[0]);
                    game.addVideo('deletenode', player, get.cardsInfo([trigger.player.judging[0].clone]));
                }
                ui.discardPile.appendChild(trigger.player.judging[0]);
                trigger.player.judging[0] = result.cards[0];
                if (!get.owner(result.cards[0], 'judge')) {
                    trigger.position.appendChild(result.cards[0]);
                }
                game.log(trigger.player, '的判定牌改为', result.cards[0]);
                game.delay(2);
            };
        },
        ai: {
            tag: {
                rejudge: 1,
            },
        },
        subSkill: {
            zshy_AAZZshensimayiSHZL: { audio: 'ext:诸神寰宇/audio/character:2' },
        }
    },
    zshy_fankui: {//反馈
        audio: 'ext:诸神寰宇/audio/character:4',
        trigger: {
            player: 'damageEnd',
        },
        frequent: true,
        async content(event, trigger, player) {
            if (trigger.source && trigger.source != player && trigger.source.countGainableCards(player, 'hej') > 0) {
                let num = 0;
                if (trigger.source.countCards('h')) num++;
                if (trigger.source.countCards('e')) num++;
                if (trigger.source.countCards('j')) num++;
                if (num) {
                    await player.gainPlayerCard(trigger.source, [1, num], 'hej', true).set('filterButton', function (button) {
                        for (var i = 0; i < ui.selected.buttons.length; i++) {
                            if (get.position(button.link) == get.position(ui.selected.buttons[i].link)) return false;
                        }
                        return true;
                    }).set('prompt', `反馈：每个区域至多选择一张牌`);
                }
            }
            const result = await player.judge(function (card) {
                if (get.color(card) != 'red') return 1;
                return -1;
            }).forResult();
            if (result && result.color != 'red') {
                player.recover();
            };
        },
        getIndex(event, player) {
            return event.num;
        },
        ai: {
            effect: {
                target(card, player, target) {
                    if (player.countCards('he') > 1 && get.tag(card, 'damage')) {
                        if (player.hasSkill('jueqing')) return [1, -1.5];
                        if (ai.get.attitude(target, player) < 0) return [1, 1];
                    }
                },
            },
        },
    },

    //墟郭嘉
    zshy_tiandu: {//天妒
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AAZZxizhicaiJMGX: 'zshy_tiandu_zshy_AAZZxizhicaiJMGX',
        },
        trigger: {
            player: 'phaseJudgeBefore',
        },
        forced: true,
        content() {
            player.damage(1, 'thunder', 'nosource');
        },
        group: 'zshy_tiandu_sub1',
        subSkill: {
            sub1: {
                audio: 'zshy_tiandu',
                trigger: {
                    player: 'judgeEnd',
                },
                filter(event, player) {
                    if (get.owner(event.result.card)) {
                        return false;
                    }
                    if (event.nogain && event.nogain(event.result.card)) {
                        return false;
                    }
                    return true;
                },
                forced: true,
                async content(event, trigger, player) {
                    player.gain(trigger.result.card);
                    player.$gain2(trigger.result.card);
                    if (get.color(trigger.result.card) == 'red') {
                        player.recover();
                    }
                    if (get.suit(trigger.result.card) == 'heart') {
                        player.gainMaxHp();
                    }
                },
            },
        },
    },
    zshy_yiji: {//遗计
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'damageAfter',
        },
        frequent: true,
        filter(event, player) {
            return (event.num > 0)
        },
        prompt2: '是否摸两张牌，然后将任意张手牌交给其他角色',
        content() {
            'step 0'
            event.count = 1;
            'step 1'
            player.draw(2);
            event.given = 0;
            'step 2'
            player.chooseCardTarget({
                filterCard: true,
                selectCard: [1, Infinity],
                filterTarget(card, player, target) {
                    return player != target && target != event.temp;
                },
                ai1(card) {
                    if (ui.selected.cards.length > 0) return -1;
                    if (card.name == 'du') return 20;
                    return (_status.event.player.countCards('h') - _status.event.player.hp);
                },
                ai2(target) {
                    var att = get.attitude(_status.event.player, target);
                    if (ui.selected.cards.length && ui.selected.cards[0].name == 'du') {
                        if (target.hasSkillTag('nodu')) return 0;
                        return 1 - att;
                    }
                    return att - 4;
                },
                prompt: '请选择要交给其他角色的牌'
            });
            'step 3'
            if (result.bool) {
                player.line(result.targets, 'green');
                result.targets[0].gain(result.cards, player, 'giveAuto');
                event.given += result.cards.length;
                if (event.given < 2) {
                    event.temp = result.targets[0];
                    event.goto(2);
                }
                else if (event.count < trigger.num) {
                    delete event.temp;
                    event.count++;
                    player.chooseBool(get.prompt2(event.name)).set('frequentSkill', event.name);
                }
                else event.finish();
            }
            else if (event.count < trigger.num) {
                delete event.temp;
                event.count++;
                player.chooseBool(get.prompt2(event.name)).set('frequentSkill', event.name);
            }
            else event.finish();
            'step 4'
            if (result.bool) {
                player.logSkill(event.name);
                event.goto(1);
            }
        },
        ai: {
            maixie: true,
            maixie_hp: true,
            result: {
                effect(card, player, target) {
                    if (get.tag(card, 'damage')) {
                        if (player.hasSkillTag('jueqing', false, target)) return [1, -2];
                        if (!target.hasFriend()) return;
                        var num = 1;
                        if (get.attitude(player, target) > 0) {
                            if (player.needsToDiscard()) {
                                num = 0.7;
                            }
                            else {
                                num = 0.5;
                            }
                        }
                        if (player.hp >= 4) return [1, num * 2];
                        if (target.hp == 3) return [1, num * 1.5];
                        if (target.hp == 2) return [1, num * 0.5];
                    }
                },
            },
            threaten: 0.6,
        },
        group: ['zshy_yiji_yice'],
        subSkill: {
            yice: {
                audio: 'zshy_yiji',
                trigger: {
                    player: 'damageAfter',
                },
                lastDo: true,
                direct: true,
                filter(event, player) {
                    return event.num > 0;
                },
                async content(event, trigger, player) {
                    const result = await player
                        .judge(function (card) {
                            if (get.color(card) != 'black') return 1;
                            return -1;
                        })
                        .set('judge2', function (result) {
                            return result.bool == true ? true : false;
                        }).forResult();
                    if (result?.color != 'black') {
                        await player.recover();
                    };
                },
                getIndex(event, player) {
                    return event.num;
                },
                ai: {
                    threaten: 0.8,
                },
            },
        },
    },

};
const 巾帼红颜 = {
    zshy_jizhi: {//集智
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AAZZshensimayiSHZL: 'zshy_jizhi_zshy_AAZZshensimayiSHZL',
            zshy_AAZZlukangSHZL: 'zshy_jizhi_zshy_AAZZlukangSHZL',
        },
        trigger: {
            player: 'useCard',
        },
        locked: true,
        frequent: true,
        filter(event, player) {
            return get.type(event.card, 'trick') == 'trick' || get.type(event.card, 'delay') == 'delay';
        },
        async content(event, trigger, player) {
            player.draw();
            player.recover();
        },
        ai: {
            threaten: 1.4,
            noautowuxie: true,
        },
        group: ['zshy_jizhi_sub1', 'zshy_jizhi_sub2', 'zshy_jizhi_sub3'],
        subSkill: {
            zshy_AAZZshensimayiSHZL: { audio: 'ext:诸神寰宇/audio/character:2' },
            zshy_AAZZlukangSHZL: { audio: 'ext:诸神寰宇/audio/character:2' },
            sub1: {
                audio: 'zshy_jizhi',
                trigger: {
                    global: 'useCardAfter',
                },
                forced: true,
                locked: false,
                filter(event, player) {
                    return get.name(event.card) == 'wuxie' && event.player != player && get.itemtype(event.cards) == 'cards' && get.position(event.cards[0]) == 'd';
                },
                check(event, player) {
                    return get.attitude(player, event.player) > 2;
                },
                content() {
                    player.gain(trigger.cards, 'gain2');
                },
            },
            sub2: {
                audio: 'zshy_jizhi',
                trigger: {
                    player: 'judgeEnd',
                },
                forced: true,
                filter(event, player) {
                    return get.type(event.result.card, 'trick') == 'trick' || get.type(event.result.card, 'delay') == 'delay';
                },
                content() {
                    player.gain(trigger.result.card);
                    player.$gain2(trigger.result.card);
                    game.log(player, '获得了' + get.translation(trigger.result.card));
                },
            },
            sub3: {
                audio: 'zshy_jizhi',
                trigger: {
                    player: 'phaseBegin',
                },
                direct: true,
                content() {
                    player.logSkill('zshy_jizhi');
                    var cardx = get.cardPile(function (card) {
                        return get.type2(card) == 'trick';
                    });
                    if (cardx) {
                        player.gain(cardx, 'gain2');
                    }
                    else player.gain(get.cards()[0], 'gain2');
                },
            },
        }
    },
    zshy_qicai: {//奇才
        audio: 'zshy_jizhi',
        enable: 'phaseUse',
        filter(event, player) {
            return player.countCards('he', { type: 'equip' });
        },
        position: 'hes',
        filterCard(card) {
            return (get.type(card) == 'equip');
        },
        check(card) {
            return 7 - get.value(card);
        },
        prompt2: '重铸一张装备牌，然后从牌堆或弃牌堆中获得一张锦囊牌，最后回复1点体力',
        async content(event, trigger, player) {
            player.recast(event.cards);
            let cardx = get.cardPile(function (card) {
                return get.type2(card) == 'trick';
            });
            if (cardx) {
                player.gain(cardx, 'gain2');
            };
            player.recover();
        },
        mod: {
            targetInRange(card, player, target, now) {
                var type = get.type(card);
                if (type == 'trick' || type == 'delay') return true;
            },
            wuxieRespondable() {
                return false;
            },
        },
        ai: {
            forceYingbian: true,
            order: 4,
        },
        group: 'zshy_qicai_sub1',
        subSkill: {
            sub1: {
                trigger: {
                    player: 'phaseDiscardBegin',
                },
                forced: true,
                filter(event, player) {
                    return event.parent.name == 'phaseDiscard' && player.countCards('h', { type: 'basic' }) < player.countCards('h');
                },
                content() {
                    player.logSkill('zshy_qicai');
                },
                mod: {
                    ignoredHandcard(card, player) {
                        if (get.type(card) != 'basic') {
                            return true;
                        }
                    },
                    cardDiscardable(card, player, name) {
                        if (name == 'phaseDiscard' && get.type(card) != 'basic') return false;
                    },
                },
            },
        }
    },

    zshy_guose: {//国色
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        discard: false,
        filter(event, player) {
            return player.countCards('hes') > 0;
        },
        prepare: 'throw',
        position: 'hes',
        filterCard: true,
        filterTarget(card, player, target) {
            if (target.hasJudge('lebu')) return true;
            return lib.filter.targetEnabled({ name: 'lebu' }, player, target);
        },
        check(card) {
            return 7 - get.value(card);
        },
        prompt: '出牌阶段，你可选择1项并在选择完成后回复1点体力或摸一张牌：①将一张牌当做【乐不思蜀】使用；②弃置一张牌并弃置场上的一张【乐不思蜀】',
        content() {
            if (target.hasJudge('lebu')) {
                target.discard(target.getJudge('lebu'));
            }
            else {
                var next = player.useCard({ name: 'lebu' }, target, cards);
                next.animate = false;
                next.audio = false;
            }
            player.chooseDrawRecover(true);
        },
        ai: {
            result: {
                target(player, target) {
                    if (target.hasJudge('lebu')) return -get.effect(target, { name: 'lebu' }, player, target);
                    return get.effect(target, { name: 'lebu' }, player, target);
                },
            },
            order: 9,
        },
        group: 'zshy_guose_sub1',
        subSkill: {
            sub1: {
                audio: 'zshy_guose',
                trigger: {
                    global: ['phaseUseSkipped', 'phaseUseCancelled'],
                },
                forced: true,
                locked: false,
                filter(event, player) {
                    return event.player != player;
                },
                async content(event, trigger, player) {
                    player.chooseDrawRecover(true);
                },
            },
        }
    },
    zshy_liuli: {//流离
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'shaBefore',
        },
        direct: true,
        filter(event, player, target) {
            return game.countPlayer(function (current) {
                return current != event.player && current != player;
            }) > 0 && event.target == player;
        },
        content() {
            'step 0'
            player.chooseTarget('请选择要转移的角色', function (card, player, target) {
                return target != player && target != trigger.player;
            }).set('ai', function (target) {
                var player = _status.event.player;
                return get.attitude(player, target) < 0;
            });
            'step 1'
            if (result.bool) {
                player.logSkill('zshy_liuli', result.targets);
                trigger.target = result.targets[0];
                trigger.targets.remove(player);
                trigger.targets.push(result.targets[0]);
            }
            else {
                event.goto(3);
            }
            'step 2'
            trigger.untrigger();
            trigger.trigger('useCardToBefore');
            trigger.trigger('shaBefore');
            game.delay();
            'step 3'
            if (player.countCards('hes')) {
                player.chooseCard('hes', '是否重铸一张牌？').set('ai', function (card) {
                    if (card.name == 'tao' || card.name == 'jiu') return false;
                    return 7 - get.value(card);
                });
            } else event.finish();
            'step 4'
            if (result.bool) {
                player.logSkill('zshy_liuli');
                player.recast(result.cards);
            };

        },
        ai: {
            effect: {
                target(card, player, target) {
                    if (card.name != 'sha') return;
                    var min = 1;
                    var friend = ai.get.attitude(player, target) > 0;
                    var vcard = { name: 'shacopy', nature: card.nature, suit: card.suit };
                    var players = game.filterPlayer();
                    for (var i = 0; i < players.length; i++) {
                        if (player != players[i] &&
                            ai.get.attitude(target, players[i]) < 0 &&
                            target.canUse(card, players[i])) {
                            if (!friend) return 0;
                            if (ai.get.effect(players[i], vcard, player, player) > 0) {
                                if (!player.canUse(card, players[0])) {
                                    return [0, 0.1];
                                }
                                min = 0;
                            };
                        };
                    };
                    return min;
                },
            },
        },
    },

    zshy_luoshen: {//洛神
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: ['phaseZhunbeiBegin', 'phaseJieshuBegin'],
        },
        locked: false,
        frequent: true,
        check() {
            return true;
        },
        prompt2: '进行判定并获得判定牌，若结果为黑色则你可以继续判定',
        content() {
            'step 0'
            player.judge(function (card) {
                if (get.color(card) == 'black') return 1;
                return -1;
            }).judge2 = function (result) {
                return result.bool == true ? true : false;
            };
            'step 1'
            player.gain(result.card, 'gain2').gaintag.add('zshy_luoshen');
            'step 2'
            if (result.color != 'black') {
                event.finish();
            }
            else {
                player.chooseBool('是否再次发动【洛神】？').set('frequentSkill', 'zshy_luoshen').set('ai', () => 1);
            };
            'step 3'
            if (result.bool) {
                player.logSkill('zshy_luoshen');
                event.goto(0);
            }
        },
        mod: {
            ignoredHandcard(card, player) {
                if (card.hasGaintag('zshy_luoshen')) return true;
            },
            cardDiscardable(card, player, name) {
                if (name == 'phaseDiscard' && card.hasGaintag('zshy_luoshen')) return false;
            },
        },
    },
    zshy_qingguo: {//倾国
        audio: 'ext:诸神寰宇/audio/character:4',
        enable: ['chooseToRespond', 'chooseToUse'],
        filterCard(card) {
            return true;
        },
        position: 'hes',
        viewAs: {
            name: 'shan',
        },
        viewAsFilter(player) {
            if (!player.countCards('hes')) return false;
        },
        prompt: '将一张牌当闪打出',
        check() { return 1 },
        mod: {
            targetInRange(card, player, target, now) {
                if (get.color(card) == 'black') return true;
            },
            cardUsable(card) {
                if (get.color(card) == 'black') return Infinity;
            },
        },
        ai: {
            respondShan: true,
            skillTagFilter(player) {
                if (!player.countCards('hes')) return false;
            },
            effect: {
                target(card, player, target, current) {
                    if (get.tag(card, 'respondShan') && current < 0) return 0.6
                },
            },
            order: 3,
            basic: {
                useful: [7, 2],
                value: [7, 2],
            },
            result: {
                player: 1,
            },
        },
        group: ['zshy_qingguo_shan'],
        subSkill: {
            shan: {
                audio: 'zshy_qingguo',
                trigger: {
                    player: ['useCard', 'respond'],
                },
                usable: 1,
                direct: true,
                filter(event, player) {
                    return get.name(event.card) == 'shan';
                },
                content() {
                    return player.recover();
                },
            },
        },
    },

    //墟貂蝉
    zshy_lijian: {//离间
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        filterTarget(card, player, target) {
            return target != player && !target.hasSkill('zshy_lijian_After');
        },
        selectTarget: [1, 2],
        multitarget: true,
        multiline: true,
        prompt: '出牌阶段，你可指定一到两名本回合未指定过的其他角色，选择一名角色则其失去1点体力并弃置两张牌，否则两名角色进行拼点（无牌则其摸一张牌），最后你回复1点体力或摸一张牌',
        content(event) {
            'step 0'
            targets[0].addTempSkill('zshy_lijian_After');
            if (targets.length == 1) {
                targets[0].loseHp();
                targets[0].chooseToDiscard('he', 2, true)
                player.chooseDrawRecover(true);
                event.finish();
            }
            else {
                targets[1].addTempSkill('zshy_lijian_After');
                if (!targets[0].countCards('h')) targets[0].draw();
                if (!targets[1].countCards('h')) targets[1].draw();
                targets[0].chooseToCompare(targets[1]);
            }
            'step 1'
            if (result.bool) {
                targets[1].damage(targets[0]);
                targets[0].chooseToDiscard('he', 2, true);
            }
            else if (result.tie) {
                player.chooseDrawRecover(true), event.finish();
            }
            else {
                targets[0].damage(targets[1]);
                targets[1].chooseToDiscard('he', 2, true);
            }
            'step 2'
            player.chooseDrawRecover(true);
        },
        ai: {
            order: 9,
            expose: 0.6,
            threaten: 2.5,
            result: {
                target: -1,
            },
        },
        group: ['zshy_lijian_PhaseUse'],
        subSkill: {
            After: {
                charlotte: true,
                onremove: true,
            },
            PhaseUse: {
                trigger: {
                    global: 'phaseUseBegin',
                },
                direct: true,
                filter(event, player) {
                    return event.player != player;
                },
                async content(event, trigger, player) {
                    const str = `选择一名其他角色，令${get.translation(trigger.player)}本回合对其使用牌无距离与次数限制`;
                    const result = await player.chooseTarget(get.prompt(event.name), str, function (card, player, target) {
                        return target != trigger.player && target != player;
                    }).set('ai', function (target) {
                        return get.attitude(_status.event.player, target) < 0;
                    }).forResult();
                    if (result && result.targets) {
                        player.logSkill('zshy_lijian', [trigger.player, result.targets[0]]);
                        trigger.player.addTempSkill('zshy_lijian_Usecard');
                        trigger.player.markAuto(['zshy_lijian_Usecard'], result.targets[0]);
                    }
                },
            },
            Usecard: {
                charlotte: true,
                onremove: true,
                mod: {
                    targetInRange(card, player, target) {
                        if (player.getStorage('zshy_lijian_Usecard').includes(target)) {
                            return true;
                        }
                    },
                    cardUsableTarget(card, player, target) {
                        if (player.getStorage('zshy_lijian_Usecard').includes(target)) {
                            return true;
                        }
                    },
                },
            },
        },
    },
    zshy_biyue: {//闭月
        audio: 'ext:诸神寰宇/audio/character:4',
        trigger: {
            player: ['phaseZhunbeiBegin', 'phaseJieshuBegin'],
        },
        frequent: true,
        check() {
            return true;
        },
        content() {
            var num = 1 + player.countCards('e');
            player.draw(num);
            player.recover();
        },
    },
    //墟孙尚香
    zshy_xiaoji: {//枭姬
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AAZZsunshangxiangSP: 'zshy_xiaoji_zshy_AAZZsunshangxiangSP',
        },
        trigger: {
            player: 'loseEnd',
        },
        filter(event, player) {
            if (event.getParent().name == 'useCard') return false;
            if (event.name == 'gain' && event.player == player) return false;
            for (var i = 0; i < event.cards.length; i++) {
                if (get.type(event.cards[i]) == 'equip') return true;
            }
            return false;
        },
        forced: true,
        prompt2(event, player) {
            return '回复1点体力或摸两张牌';
        },
        async content(event, trigger, player) {
            player.chooseDrawRecover(2, true);
        },
        getIndex(event, player) {
            var num = 0;
            for (var i = 0; i < event.cards.length; i++) {
                if (get.type(event.cards[i]) == 'equip') num++;
            };
            return num;
        },
        ai: {
            noe: true,
            reverseEquip: true,
            effect: {
                target(card, player, target, current) {
                    if (get.type(card) == 'equip') return [1, 3];
                },
            },
        },
        group: ['zshy_xiaoji_Equip'],
        subSkill: {
            zshy_AAZZsunshangxiangSP: { audio: 'ext:诸神寰宇/audio/character:2' },
            Equip: {
                audio: 'zshy_xiaoji',
                audioname2: {
                    zshy_AAZZsunshangxiangSP: 'zshy_xiaoji_zshy_AAZZsunshangxiangSP',
                },
                trigger: {
                    global: ['phaseZhunbeiBegin'],
                },
                forced: true,
                async content(event, trigger, player) {
                    event.num = Math.floor(Math.random() * 5) + 1;
                    const card = get.cardPile(function (card) {
                        return get.subtype(card) == 'equip' + event.num && player.canUse(card, player);
                    });
                    if (card) {
                        await player.gain(card, 'gain2');
                        await player.chooseToUse(`枭姬：请使用一张牌`);
                    }
                },
            },
        },
    },
    zshy_jieyin: {//结姻
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        usable: 1,
        lose: false,
        delay: false,
        discard: false,
        position: 'he',
        filterCard: true,
        filterTarget: true,
        filter(event, player) {
            return player.countCards('he');
        },
        check(card) {
            var player = _status.event.player;
            if (get.position(card) == 'e') {
                if (player.countCards('h', { type: 'equip' })) return 15 - get.value(card);
                return 10 - get.value(card);
            }
            return 7 - get.value(card);
        },
        async content(event, trigger, player) {
            const target = event.targets[0];
            const cards = event.cards[0];
            if (target != player) {
                player.give(cards, target);
            }
            else {
                player.recast(cards);
                await player.chooseDrawRecover(2, true);
            }
            player.gainMaxHp();
            target.gainMaxHp();
            player.chooseDrawRecover(2, true);
            target.chooseDrawRecover(2, true);
            await target.chooseToUse('结姻：请使用一张手牌');
        },
        ai: {
            order() {
                return [2, 4, 6, 8].randomGet();
            },
            result: {
                target(player, target) {
                    if (target != player) {
                        if (target.isDamaged()) return 3;
                        return 2;
                    }
                    return 0.5;
                },
            },
        },
    },

};
const SP系列 = {
    //墟SP关羽
    zshy_danji: {//单骑
        audio: 'ext:诸神寰宇/audio/character:2',
        skillAnimation: true,
        animationColor: 'water',
        trigger: {
            player: ['loseAfter', 'damageAfter', 'loseHpAfter', 'loseMaxHpAfter'],
            global: ['equipAfter', 'addJudgeAfter', 'gainAfter', 'loseAsyncAfter', 'addToExpansionAfter'],
        },
        forced: true,
        unique: true,
        juexingji: true,
        derivation: ['zshy_GYmashu', 'zshy_nuzhan'],
        filter(event, player) {
            var zhu = get.zhu(player);
            if (zhu && zhu.isZhu) {
                var name = zhu.name;
                while (name.indexOf('_') !== -1) {
                    name = name.slice(name.indexOf('_') + 1);
                }
                if (name.indexOf('liubei') === 0) return false;
            }
            return !player.storage.zshy_danji && player.countCards('h') > player.hp;
        },
        async content(event, trigger, player) {
            player.awakenSkill(event.name);
            player.chooseDrawRecover(2, true);
            player.addSkills(['zshy_GYmashu', 'zshy_nuzhan']);
        },
        ai: {
            maixie: true,
            skillTagFilter: (player, tag, arg) => {
                if (tag === 'maixie') {
                    if (player.hp < 2 || player.storage.zshy_danji || player.hasSkill('zshy_nuzhan') || player.countCards('h') !== player.hp) return false;
                    let zhu = get.zhu(player);
                    if (zhu && zhu.isZhu) {
                        let name = zhu.name;
                        while (name.indexOf('_') !== -1) {
                            name = name.slice(name.indexOf('_') + 1);
                        }
                        if (name.indexOf('liubei') === 0) return false;
                    }
                    return true;
                }
            },
            effect: {
                target: (card, player, target) => {
                    let hs = target.countCards('h');
                    if (target.hp < 3 || target.storage.zshy_danji || target.hasSkill('zshy_nuzhan') || hs > target.hp + 1) return;
                    let zhu = get.zhu(target);
                    if (zhu && zhu.isZhu) {
                        let name = zhu.name;
                        while (name.indexOf('_') !== -1) {
                            name = name.slice(name.indexOf('_') + 1);
                        }
                        if (name.indexOf('liubei') === 0) return;
                    }
                    if (get.tag(card, 'draw')) return 1.6;
                    if (get.tag(card, 'lose') || get.tag(card, 'discard')) return [1, -0.8];
                    if (hs === target.hp && get.tag(card, 'damage')) return [1, target.hp / 3];
                    if (hs > target.hp && target.hp > 3 && (card.name === 'shan' || card.name === 'wuxie')) return 'zeroplayertarget';
                },
            },
            combo: 'zshy_wusheng',
        },
    },
    zshy_GYmashu: {//马术
        mod: {
            globalFrom(from, to, distance) {
                return distance - Infinity;
            }
        }
    },
    zshy_nuzhan: {//怒斩
        audio: 'ext:诸神寰宇/audio/character:2',
        popup: false,
        silent: true,
        firstDo: true,
        trigger: { player: 'useCard1' },
        filter(event, player) {
            return event.card && get.name(event.card) == 'sha' && event.addCount !== false && event.cards && event.cards.length == 1 && get.type(event.cards[0], 'trick') == 'trick';
        },
        forced: true,
        content() {
            trigger.addCount = false;
            if (player.stat[player.stat.length - 1].card.sha > 0) {
                player.stat[player.stat.length - 1].card.sha--;
            }
        },
        ai: {
            combo: 'zshy_wusheng',
        },
        group: ['zshy_nuzhan_sub', 'zshy_nuzhan_sub1'],
        subSkill: {
            sub: {
                audio: 'zshy_nuzhan',
                trigger: { player: 'useCard1' },
                forced: true,
                popup: false,
                silent: true,
                firstDo: true,
                sourceSkill: 'zshy_nuzhan',
                filter(event, player) {
                    return event.card && get.name(event.card) == 'sha' && event.cards && event.cards.length == 1 && get.type(event.cards[0]) == 'equip';
                },
                content() {
                    trigger.baseDamage++;
                },
            },
            sub1: {
                audio: 'zshy_nuzhan',
                trigger: { source: 'damageAfter' },
                forced: true,
                popup: false,
                silent: true,
                firstDo: true,
                filter(event, player) {
                    return event.card && get.name(event.card) == 'sha';
                },
                content() {
                    player.draw();
                },
            },
        },
    },

    //墟SP姜维
    zshy_kunfen: {//困奋
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: { zshy_AAZZjiangweiSBFM: 'zshy_kunfen_zshy_AAZZjiangweiSBFM' },
        trigger: { global: 'phaseJieshuBegin' },
        forced: true,
        async content(event, trigger, player) {
            if (!player.storage.zshy_kunfen) await player.loseHp(), player.draw(2);
            else await player.recover(), player.draw();
        },
        ai: { threaten: 1.5 },
    },
    zshy_fengliang: {//逢亮
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'dying' },
        juexingji: true,
        skillAnimation: true,
        animationColor: 'thunder',
        derivation: 'zshy_tiaoxin',
        forced: true,
        async content(event, trigger, player) {
            await player.awakenSkill(event.name);
            await player.recoverTo(3);
            player.storage.zshy_kunfen = true;
            await player.addSkills('zshy_tiaoxin');
            player.changeGroup('shu');
        },
    },

    //墟SP贾诩
    zshy_zhenlve: {//缜略
        trigger: {
            player: 'useCard',
        },
        forced: true,
        filter(event) {
            return get.type(event.card) == 'trick';
        },
        content() {
            trigger.nowuxie = true;
        },
        mod: {
            targetEnabled(card, player, target) {
                if (get.type(card) == 'delay') {
                    return false;
                }
            },
        },
        group: ['zshy_zhenlve_round'],
        subSkill: {
            round: {
                trigger: {
                    player: 'phaseUseEnd',
                },
                forced: true,
                async content(event, trigger, player) {
                    player.addTempSkill('qianxing', { player: 'phaseUseBegin' });
                },
            },
        },
    },
    zshy_jianshu: {//间书
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        animationColor: 'thunder',
        skillAnimation: 'epic',
        usable: 1,
        filterTarget(card, player, target) {
            if (target == player) return false;
            if (ui.selected.targets.length) {
                return ui.selected.targets[0] != target && !ui.selected.targets[0].hasSkillTag('noCompareSource') && !target.hasSkillTag('noCompareTarget');
            }
            return true;
        },
        selectTarget: 2,
        multitarget: true,
        content() {
            'step 0'
            if (targets[0].countCards('h') == 0) targets[0].draw();
            if (targets[1].countCards('h') == 0) targets[1].draw();
            'step 1'
            if (targets[0].canCompare(targets[1])) targets[0].chooseToCompare(targets[1]);
            else event.finish();
            'step 2'
            if (result.bool) {
                targets[0].chooseToDiscard('he', 2, true);
                targets[1].loseHp();
            } else if (result.tie) {
                targets[0].loseHp();
                targets[1].loseHp();
            } else {
                targets[1].chooseToDiscard('he', 2, true);
                targets[0].loseHp();
            }
        },
        ai: {
            expose: 0.4,
            order: 4,
            result: {
                target(player, target) {
                    if (player.hasUnknown()) return 0;
                    if (ui.selected.targets.length) return -1;
                    return -0.5;
                },
            },
        },
    },
    zshy_yongdi: {//拥嫡
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        limited: true,
        filterTarget: true,
        skillAnimation: 'legend',
        animationColor: 'thunder',
        derivation: ['zshy_dizun'],
        mark: true,
        marktext: '拥嫡',
        intro: {
            content: 'limited',
        },
        init(player, skill) {
            player.storage[skill] = false;
        },
        async content(event, trigger, player) {
            await player.awakenSkill(`zshy_yongdi`);
            const target = event.target;
            target.gainMaxHp();
            target.chooseDrawRecover(2, true);
            target.addSkill('zshy_dizun');
            const mode = get.mode();
            if (mode == 'identity' || (mode == 'versus' && _status.mode == 'four') || mode == 'doudizhu') {
                if (target.name && lib.character[target.name]) {
                    const skills = get.character(target.name)[3] || [];
                    target.storage.zhuSkill_zshy_yongdi = [];
                    for (let i = 0; i < skills.length; i++) {
                        const info = lib.skill[skills[i]];
                        if (info.zhuSkill) {
                            target.storage.zhuSkill_zshy_yongdi.push(skills[i]);
                            if (info.init) info.init(target);
                            if (info.init2) info.init2(target);
                        }
                    }
                }
            };
            const list = [];
            const group = target.group;
            for (const i in lib.character) {
                const cinfo = get.character(i);
                if (cinfo[1] != group) continue;
                if (cinfo[4].includes('boss')) continue;
                if (cinfo[4].includes('minskin')) continue;
                if (cinfo[4].includes('hiddenboss')) continue;
                if (cinfo[4].includes('Unaffected')) continue;
                if (cinfo[4].includes('stonehidden')) continue;
                for (const j of (cinfo[3] || [])) {
                    if (j && !j.silent) list.add(j);
                }
            };
            const link = list.randomGet();
            target.addSkillLog(link);
            player.group = target.group;
            if (get.mode() == 'guozhan') {
                player.identity = target.identity;
                player.setIdentity();
            }
        },
        ai: {
            order: 7,
            result: {
                target(player, target) {
                    var mode = get.mode();
                    if (get.attitude(player, target) < 4) return 0;
                    if (player.maxHp < 4 && target == player) return 5;
                    if (mode == 'identity' || (mode == 'versus' && (_status.mode == 'four' || _status.mode == 'guandu'))) {
                        if (target.name && lib.character[target.name]) {
                            const tskills = get.character(target.name)[3] || [];
                            for (var i = 0; i < tskills.length; i++) {
                                if (lib.skill[tskills[i]].zhuSkill) return 3;
                            }
                        }
                    }
                    if (target.maxHp < 4) return 2;
                    return 1;
                },
            },
        },
    },
    zshy_dizun: {//嫡尊
        audio: 'zshy_yongdi',
        trigger: {
            global: 'roundStart',
        },
        forced: true,
        charlotte: true,
        content() {
            'step 0'
            player.chooseDrawRecover(2, true);
            'step 1'
            var list = [];
            var group = player.group;
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
        },
    },

    //墟SP马超
    zshy_zhuiji: {//追击
        audio: 'zshy_shichou',
        trigger: { player: 'useCardToPlayered' },
        shaRelated: true,
        logTarget: 'target',
        filter(event, player) {
            return get.name(event.card) == 'sha' && event.target.countCards('he') > 0 && get.distance(player, event.target) == 1;
        },
        prompt2(event, player) {
            var num = 1 + player.getDamagedHp();
            return '是否随机弃置' + get.translation(event.target) + '手牌与装备区各' + num + '张牌？';
        },
        check(event, player) {
            return get.effect(event.target, { name: 'guohe_copy2' }, player, player) > 0;
        },
        content() {
            'step 0'
            var target = trigger.target;
            event.target = target;
            var num = 1 + player.getDamagedHp();
            target.randomDiscard(num, 'h', true);
            target.randomDiscard(num, 'e', true);
        },
        mod: {
            globalFrom() {
                return -Infinity;
            },
        },
    },
    zshy_shichou: {//誓仇
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'useCard2',
        },
        direct: true,
        filter(event, player, target) {
            return event.card && get.name(event.card) == 'sha' && game.countPlayer() > 2;
        },
        content() {
            'step 0'
            var num = player.getDamagedHp() + 1;
            player.chooseTarget('是否发动【誓仇】，令' + num + '名其他角色也成为此【杀】的目标？', [1, num], function (card, player, target) {
                return target != player && !trigger.targets.includes(target) && player.canUse({ name: 'sha' }, target);
            }).ai = function (target) {
                return get.effect(target, { name: 'sha' }, _status.event.player);
            };
            'step 1'
            if (result.bool && result.targets && result.targets.length) {
                var targets = result.targets;
                player.logSkill('zshy_shichou', targets);
                player.line(targets, trigger.card.nature);
                trigger.targets.addArray(targets);
            }
        },
        group: ['zshy_shichou_damage'],
        subSkill: {
            damage: {
                audio: 'zshy_shichou',
                trigger: {
                    source: 'damageBegin4',
                },
                filter(event, player) {
                    return event.player.isDamaged();
                },
                prompt2() {
                    return '是否令此次伤害+1';
                },
                check(event, player) {
                    return get.attitude(player, event.player) < 0;
                },
                content() {
                    //var num = player.hp - event.player.hp;
                    trigger.num++;
                },
            },
        },
    },

    //墟SP庞统
    zshy_guolun: {//过论：出牌阶段每名角色限1次，你可以展示一名其他角色的一张手牌，然后展示你的一张牌，你与其交换这两张牌，然后你选择回复1点体力或摸一张牌。
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        filter(event, player) {
            return player.countCards('h') > 0 && game.countPlayer(function (current) {
                return current != player && !current.hasSkill('zshy_guolun_used');
            });
        },
        filterTarget(card, player, target) {
            return target != player && target.countCards('h') > 0 && !target.hasSkill('zshy_guolun_used');
        },
        content() {
            'step 0'
            target.addTempSkill('zshy_guolun_used');
            player.choosePlayerCard(target, true, 'h');
            'step 1'
            event.cardt = result.cards[0];
            target.showCards(event.cardt);
            player.chooseCard('he').set('ai', function (card) {
                var event = _status.event.getParent(),
                    player = event.player;
                var numt = get.number(event.cardt);
                var att = get.attitude(player, target);
                var value = get.value(event.cardt);
                var num = get.number(card);
                if (num < numt || att > 2) return value + 6 - get.value(card);
                else if (num == numt) return value - get.value(card);
                return -1;
            });
            'step 2'
            if (!result.bool) event.finish();
            else {
                player.showCards(result.cards);
                event.cardp = result.cards[0];
            }
            'step 3'
            player.swapHandcards(target, [event.cardp], [event.cardt]);
            'step 4'
            player.chooseDrawRecover(true);
        },
        ai: {
            threaten: 1.5,
            order: 8,
            result: {
                player(player, target) {
                    return 1.5;
                },
            },
        },
        subSkill: {
            used: {
                charlotte: true,
            },
        },
    },
    zshy_songsang: {//送丧：【锁定技】<li>当场上有角色死亡时，你增加1点体力上限并获得〖展骥〗，然后选择回复1点体力或摸一张牌。
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: 'dieAfter' },
        forced: true,
        derivation: 'zshy_zhanji',
        async content(event, trigger, player) {
            await player.gainMaxHp();
            await player.addSkills('zshy_zhanji');
            await player.draw();
        },
    },
    zshy_zhanji: {//展骥：【锁定技】<li>当你不因〖展骥〗获得牌后，你摸两张牌并弃置一张牌，若弃置牌为本回合。
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'gainAfter',
        },
        forced: true,
        filter(event, player) {
            return event.getParent(2).name != 'zshy_zhanji';
        },
        content() {
            player.draw();
            player.recover();
        },
    },

    //墟SP孙尚香
    zshy_liangzhu: {//良助
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: 'recoverEnd' },
        frequent: true,
        prompt2(event, player) {
            return `回复1点体力或摸一张牌，然后选择是否令${get.translation(event.player)}摸两张牌`
        },
        async content(event, trigger, player) {
            await player.chooseDrawRecover(true);
            const result = await player
                .chooseControl('摸牌', 'cancel2')
                .set('prompt', '【良助】')
                .set('prompt2', `是否令${get.translation(trigger.player)}摸两张牌`)
                .set('ai', function () {
                    const player2 = get.player();
                    if (get.effect(trigger.player, { name: 'draw' }, player2, player2) > 0) return '摸牌';
                    return 'cancel2';
                })
                .forResult();
            if (result?.control == '摸牌') {
                await trigger.player.draw(2);
            }
        },
        getIndex(event, player) {
            return event.num;
        },
        ai: {
            expose: 0.1,
        },
    },
    zshy_fanxiang: {//返乡
        audio: 'ext:诸神寰宇/audio/character:2',
        skillAnimation: true,
        animationColor: 'fire',
        unique: true,
        juexingji: true,
        derivation: 'zshy_xiaoji',
        trigger: { player: 'dying' },
        filter(event, player) {
            return !player.storage.zshy_fanxiang;
        },
        forced: true,
        async content(event, trigger, player) {
            player.awakenSkill(event.name);
            await player.gainMaxHp();
            await player.recoverTo(1);
            await player.draw(4);
            await player.changeSkills(['zshy_xiaoji'], ['zshy_liangzhu']);
            await player.changeGroup('wu');
            if (get.mode() == 'guozhan') player.identity = 'wu';
        },
        ai: {
            combo: 'zshy_liangzhu',
        },
    },

    zshy_zhouxuan: {//周旋
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: ['roundStart', 'phaseUseAfter'],
        },
        direct: true,
        filter(event, player) {
            return player.countCards('he') > 0 && player.getExpansions('zshy_zhouxuan').length < player.maxHp;
        },
        content() {
            'step 0'
            player.logSkill('zshy_zhouxuan');
            var num = player.maxHp - player.getExpansions('zshy_zhouxuan').length;
            player.chooseCard('he', get.prompt('zshy_zhouxuan'), [1, num], `将至多${num}张牌置于武将牌上`)
                .set('ai', card => {
                    const player = get.player();
                    if (ui.selected.cards.length >= player.needsToDiscard()) return 6 - get.value(card);
                    return 100 - get.useful(card);
                });
            'step 1'
            if (result.bool) {
                player.addToExpansion(result.cards, player, 'give').gaintag.add('zshy_zhouxuan');
            }
            'step 2'
            player.draw(Math.ceil(player.getExpansions('zshy_zhouxuan').length / 2));
        },
        marktext: '旋',
        intro: {
            name2: '旋',
            content: 'expansion',
            markcount: 'expansion',
        },
        group: ['zshy_zhouxuan_use'],
        subSkill: {
            use: {
                audio: 'zshy_zhouxuan',
                trigger: {
                    player: ['useCard', 'respond'],
                },
                direct: true,
                filter(event, player) {
                    return player.getExpansions('zshy_zhouxuan').length > 0;
                },
                content() {
                    'step 0'
                    player.logSkill('zshy_zhouxuan');
                    player.gain(player.getExpansions('zshy_zhouxuan').randomGet());
                    'step 1'
                    if (player.getExpansions('zshy_zhouxuan').length > 0) {
                        if (!player.isMaxHandcard(true)) player.draw(player.getExpansions('zshy_zhouxuan').length);
                        else player.draw();
                        player.chooseTarget(get.prompt('zshy_zhouxuan'), '选择一名本回合未以此法选择的其他角色，对其造成1点伤害',
                            function (event, player, target) {
                                return target != player && !target.hasSkill('zshy_zhouxuan_damage');
                            }).set('ai', function (target) {
                                return get.damageEffect(target, player, player);
                            })
                    }
                    'step 2'
                    if (result.bool && result.targets) {
                        result.targets[0].damage();
                        result.targets[0].addTempSkill('zshy_zhouxuan_damage');
                    }
                },
            },
            damage: {
                charlotte: true,
                forced: true,
            },
        },
    },

    zshy_chongzhen: {//冲阵
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: ['useCard', 'respond'] },
        filter(event, player) {
            if (get.name(event.card) != 'sha' && get.name(event.card) != 'shan') return false;
            return true;
        },
        logTarget(event, player) {
            if (event.name == 'respond') return event.source;
            if (get.name(event.card) == 'sha') return event.targets[0];
            return event.respondTo[0];
        },
        prompt2(event, player) {
            var target = lib.skill.chongzhen.logTarget(event, player);
            return '对' + get.translation(target) + '造成1点伤害并摸一张牌';
        },
        check(event, player) {
            var target = lib.skill.chongzhen.logTarget(event, player);
            return get.attitude(player, target) < 0;
        },
        content() {
            var target = lib.skill.chongzhen.logTarget(trigger, player);
            target.damage();
            player.draw();
        },
        ai: {
            expose: 0.8,
            threaten: 0.3,
            effect: {
                target(card, player, target, current) {
                    if (get.tag(card, 'respondShan') || get.tag(card, 'respondSha')) {
                        if (get.attitude(target, player) <= 0) {
                            if (current > 0) return;
                            if (target.countCards('h') == 0) return 1.6;
                            if (target.countCards('h') == 1) return 1.2;
                            if (target.countCards('h') == 2) return [0.8, 0.2, 0, -0.2];
                            return [0.4, 0.7, 0, -0.7];
                        }
                    }
                },
            },
        },
    },
};
const 始计篇智 = {
    //墟卞夫人
    zshy_wanwei: {//挽危
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'chooseToUse',
        filter(event, player) {
            if (player.hp < 1) {
                return false;
            }
            if (event.type == 'dying') {
                return event.dying != player;
            }
            if (event.type != 'phase') {
                return false;
            }
            return game.hasPlayer(current => {
                return current != player && current.isDamaged();
            });
        },
        filterTarget(card, player, target) {
            if (_status.event.type == 'dying') {
                return target == _status.event.dying;
            }
            return target.isDamaged();
        },
        selectTarget() {
            if (_status.event.type == 'dying') {
                return -1;
            }
            return 1;
        },
        prompt(event, player) {
            const num = player.getHp();
            if (event.type == 'dying') {
                const target = event.dying;
                return `令${get.translation(target)}回复${Math.max(num + 1, 1 - target.hp)}点体力，然后你失去1点体力并摸${num + 1}张牌`;
            } else {
                return `令一名角色回复${num + 1}点体力（至少回复至1），然后你失去1点体力并摸${num + 1}张牌`;
            }
        },
        manualConfirm: true,
        async content(event, trigger, player) {
            const target = event.targets[0];
            const num = player.getHp();
            const num1 = Math.max(num + 1, 1 - target.hp);
            await target.recover(num1);
            await player.draw(num1);
            await player.loseHp(1);
        },
        ai: {
            save: true,
            skillTagFilter(player, tag, target) {
                return player != target;
            },
            expose: 0.5,
            order: 6,
            result: {
                target(player, target) {
                    if (get.attitude(player, target) < 4) {
                        return 0;
                    }
                    if ((!player.hasSkill('zshy_yuejian') || player.countCards('he') < 2) && !player.hasCards('hs', card => player.canSaveCard(card, player))) {
                        return 0;
                    }
                    if (_status.event.type != 'dying') {
                        const num = player.getHp();
                        if (target.getDamagedHp() < 2) {
                            return 0;
                        }
                        return Math.max(num + 1, 1 - target.hp);
                    } else {
                        return 1;
                    }
                },
            },
        },
    },
    zshy_yuejian: {//约俭
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'dying' },
        locked: false,
        filter(event, player) {
            return player.countCards('he') > 0;
        },
        async cost(event, trigger, player) {
            event.result = await player
                .chooseToDiscard('he', 1, get.prompt(event.skill), '弃置一张牌，然后回复至满体力', 'chooseonly')
                .set('ai', card => {
                    return 1 / Math.max(0.1, get.value(card));
                })
                .forResult();
        },
        async content(event, trigger, player) {
            await player.discard(event.cards);
            await player.recoverTo(player.maxHp);
        },
        mod: {
            maxHandcardBase(player) {
                return player.maxHp;
            },
        },
    },

    //墟群杜预
    zshy_wuku: {//武库
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AAZZduyuSJP_shadow: 'zshy_wuku_zshy_AAZZduyuSJP_shadow',
        },
        trigger: {
            global: ['useCard', 'phaseJieshuBegin'],
        },
        forced: true,
        preHidden: true,
        filter(event, player) {
            if (event.name == 'phaseJieshu') return true;
            if (get.type(event.card) != 'equip') return false;
            return true;
        },
        async content(event, trigger, player) {
            await player.addMark('zshy_wuku', 1, false);
            await player.chooseDrawRecover(true);
        },
        marktext: '库',
        intro: {
            content: 'mark',
        },
        ai: {
            combo: 'zshy_miewu',
            threaten: 3.6,
        },
        subSkill: {
            zshy_AAZZduyuSJP_shadow: { audio: 'ext:诸神寰宇/audio/character:2' },
        }
    },
    zshy_DYsanchen: {//三陈
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: ['useCardAfter', 'phaseZhunbeiBegin'] },
        forced: true,
        juexingji: true,
        skillAnimation: true,
        animationColor: 'gray',
        filter(event, player) {
            return player.countMark('zshy_wuku') > 2;
        },
        content() {
            player.awakenSkill('zshy_DYsanchen');
            player.changeSkin({ characterName: 'zshy_AAZZduyuSJP' }, 'zshy_AAZZduyuSJP_shadow');
            player.gainMaxHp();
            player.recover();
            player.draw(3);
            player.addSkills('zshy_miewu');
        },
        ai: {
            combo: 'zshy_wuku',
        },
        derivation: 'zshy_miewu',
    },
    zshy_miewu: {//灭吴
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: ['chooseToUse', 'chooseToRespond'],
        filter(event, player) {
            if (!player.countMark('zshy_wuku') || !player.countCards('hse') || player.hasSkill('zshy_miewu2')) return false;
            for (var i of lib.inpile) {
                var type = get.type2(i);
                if ((type == 'basic' || type == 'trick') && event.filterCard(get.autoViewAs({ name: i }, 'unsure'), player, event)) return true;
            }
            return false;
        },
        chooseButton: {
            dialog(event, player) {
                var list = [];
                for (var i = 0; i < lib.inpile.length; i++) {
                    var name = lib.inpile[i];
                    if (name == 'sha') {
                        if (event.filterCard(get.autoViewAs({ name }, 'unsure'), player, event)) list.push(['基本', '', 'sha']);
                        for (var nature of lib.inpile_nature) {
                            if (event.filterCard(get.autoViewAs({ name, nature }, 'unsure'), player, event)) list.push(['基本', '', 'sha', nature]);
                        }
                    } else if (get.type2(name) == 'trick' && event.filterCard(get.autoViewAs({ name }, 'unsure'), player, event)) list.push(['锦囊', '', name]);
                    else if (get.type(name) == 'basic' && event.filterCard(get.autoViewAs({ name }, 'unsure'), player, event)) list.push(['基本', '', name]);
                }
                return ui.create.dialog('灭吴', [list, 'vcard']);
            },
            check(button) {
                if (_status.event.getParent().type != 'phase') return 1;
                var player = _status.event.player;
                if (['wugu', 'zhulu_card', 'yiyi', 'lulitongxin', 'lianjunshengyan', 'diaohulishan'].includes(button.link[2])) return 0;
                return player.getUseValue({
                    name: button.link[2],
                    nature: button.link[3],
                });
            },
            backup(links, player) {
                return {
                    filterCard: true,
                    audio: 'zshy_miewu',
                    popname: true,
                    check(card) {
                        return 8 - get.value(card);
                    },
                    position: 'hes',
                    viewAs: { name: links[0][2], nature: links[0][3] },
                    precontent() {
                        player.removeMark('zshy_wuku', 1);
                    },
                };
            },
            prompt(links, player) {
                return '将一张牌当做' + (get.translation(links[0][3]) || '') + get.translation(links[0][2]) + '使用';
            },
        },
        hiddenCard(player, name) {
            if (!lib.inpile.includes(name)) return false;
            var type = get.type2(name);
            return (type == 'basic' || type == 'trick') && player.countMark('zshy_wuku') > 0 && player.countCards('she') > 0 && !player.hasSkill('zshy_miewu2');
        },
        ai: {
            combo: 'zshy_wuku',
            fireAttack: true,
            respondSha: true,
            respondShan: true,
            skillTagFilter(player) {
                if (!player.countMark('zshy_wuku') || !player.countCards('hse') || player.hasSkill('zshy_miewu2')) return false;
            },
            order: 1.5,
            result: {
                player(player) {
                    if (_status.event.dying) return get.attitude(player, _status.event.dying);
                    return 1;
                },
            },
        },
        group: ['zshy_miewu_after'],
        subSkill: {
            backup: { audio: 'zshy_miewu' },
            after: {
                trigger: {
                    player: ['useCardAfter', 'respondAfter'],
                },
                forced: true,
                charlotte: true,
                popup: false,
                sourceSkill: 'zshy_miewu',
                filter(event, player) {
                    return event.skill == 'zshy_miewu_backup';
                },
                content() {
                    player.chooseDrawRecover(true);
                },
            },
        },
    },

    //墟骆统
    zshy_qinzheng: {//勤政
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: ['useCard', 'respond'],
        },
        forced: true,
        filter(event, player) {
            let num = player.getAllHistory('useCard').length + player.getAllHistory('respond').length;
            return num % 2 == 0 || num % 3 == 0 || num % 5 == 0 || num % 7 == 0 || num % 8 == 0 || num % 9 == 0;
        },
        async content(event, trigger, player) {
            let num = player.getAllHistory('useCard').length + player.getAllHistory('respond').length;
            let cards = [];
            if (num % 2 == 0) {
                let card = get.cardPile(function (card) {
                    return card.name == 'sha';
                });
                if (card) cards.push(card);
            }
            if (num % 3 == 0) {
                let card = get.cardPile(function (card) {
                    return card.name == 'shan';
                });
                if (card) cards.push(card);
            }
            if (num % 5 == 0) {
                let card = get.cardPile(function (card) {
                    return ['jiu', 'xionghuangjiu'].includes(card.name);
                });
                if (card) cards.push(card);
            }
            if (num % 7 == 0) {
                let card = get.cardPile(function (card) {
                    return ['tao', 'zong'].includes(card.name);
                });
                if (card) cards.push(card);
            }
            if (num % 8 == 0) {
                let card = get.cardPile(function (card) {
                    return ['wuzhong', 'zengbin', 'sadouchengbing', 'tongzhougongji'].includes(card.name);
                });
                if (card) cards.push(card);
            }
            if (num % 9 == 0) {
                let card = get.cardPile(function (card) {
                    return ['juedou'].includes(card.name);
                });
                if (card) cards.push(card);
            }
            if (cards.length) player.gain(cards, 'gain2');
        },
        intro: {
            content(num) {
                let str = '<li>总次数：';
                str += num;
                str += '<br><li>杀：';
                str += num % 2;
                str += '/2<br><li>闪：';
                str += num % 3;
                str += '/3<br><li>酒：';
                str += num % 5;
                str += '/5<br><li>桃：';
                str += num % 7;
                str += '/7<br><li>无中生有：';
                str += num % 8;
                str += '/8<br><li>决斗：';
                str += num % 9;
                str += '/9';
                return str;
            },
        },
        group: ['zshy_qinzheng_count'],
        subSkill: {
            count: {
                trigger: {
                    player: ['useCard1', 'respond'],
                },
                forced: true,
                popup: false,
                silent: true,
                firstDo: true,
                noHidden: true,
                sourceSkill: 'zshy_qinzheng',
                content() {
                    player.storage.zshy_qinzheng = player.getAllHistory('useCard').length + player.getAllHistory('respond').length;
                    player.markSkill('zshy_qinzheng');
                },
            },
        },
    },

    //墟神郭嘉
    zshy_ghuishi: {//慧识
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AAZZshenguojiaSJP_shadow: 'zshy_ghuishi_zshy_AAZZshenguojiaSJP_shadow',
        },
        enable: 'phaseUse',
        usable: 1,
        charlotte: true,
        frequent: true,
        content() {
            'step 0'
            event.cards = [];
            event.names = [];
            'step 1'
            player.judge(function (result) {
                var evt = _status.event.getParent('zshy_ghuishi');
                if (evt && evt.names && evt.names.includes(get.name(result))) return 0;
                return 1;
            }).set('callback', lib.skill.zshy_ghuishi.callback).judge2 = function (result) {
                return result.bool ? true : false;
            };
            'step 2'
            var cards = cards.filterInD();
            if (cards.length) player.chooseTarget('将' + get.translation(cards) + '交给一名角色', true).set('ai', function (target) {
                var player = _status.event.player,
                    att = get.attitude(player, target);
                if (att <= 0) return att;
                if (target.countCards('h') + _status.event.num >= _status.event.max) att /= 3;
                if (target.hasSkillTag('nogain')) att /= 10;
                return att;
            }).set('num', cards.length).set('max', game.filterPlayer().reduce((num, i) => {
                return Math.max(num, i.countCards('h'));
            }, 0));
            else event.finish();
            'step 3'
            if (result.bool) {
                var target = result.targets[0];
                event.target = target;
                player.line(target, 'green');
                target.gain(cards, 'gain2').giver = player;
                target.recover();
            } else event.finish();
        },
        callback() {
            'step 0';
            var evt = event.getParent(2);
            event.getParent().orderingCards.remove(event.judgeResult.card);
            evt.cards.push(event.judgeResult.card);
            if (player.isHealthy()) {
                player.gainMaxHp();
            }
            else {
                player.recover();
            };
            if (event.getParent().result.bool) {
                evt.names.push(event.getParent().result.name);
                player.chooseBool('是否继续发动【慧识】？').set('frequentSkill', 'zshy_ghuishi');
            } else event._result = { bool: false };
            'step 1';
            if (result.bool) event.getParent(2).redo();
        },
        ai: {
            order: 9,
            result: {
                player: 1,
            },
        },
        group: ['zshy_ghuishi_damage'],
        subSkill: {
            zshy_AAZZshenguojiaSJP_shadow: { audio: 'ext:诸神寰宇/audio/character:2' },
            damage: {
                audio: 'zshy_ghuishi',
                audioname2: {
                    zshy_AAZZshenguojiaSJP_shadow: 'zshy_ghuishi_zshy_AAZZshenguojiaSJP_shadow',
                },
                trigger: { player: 'damageEnd' },
                usable: 1,
                frequent: true,
                content(event) {
                    'step 0'
                    event.cards = [];
                    event.names = [];
                    'step 1'
                    player.judge(function (result) {
                        var evt = _status.event.getParent('zshy_ghuishi_damage');
                        if (evt && evt.names && evt.names.includes(get.name(result))) return 0;
                        return 1;
                    }).set('callback', lib.skill.zshy_ghuishi_damage.callback).judge2 = function (result) {
                        return result.bool ? true : false;
                    };
                    'step 2'
                    var cards = cards.filterInD();
                    if (cards.length) player.chooseTarget('将' + get.translation(cards) + '交给一名角色', true).set('ai', function (target) {
                        var player = _status.event.player,
                            att = get.attitude(player, target);
                        if (att <= 0) return att;
                        if (target.countCards('h') + _status.event.num >= _status.event.max) att /= 3;
                        if (target.hasSkillTag('nogain')) att /= 10;
                        return att;
                    }).set('num', cards.length).set('max', game.filterPlayer().reduce((num, i) => {
                        return Math.max(num, i.countCards('h'));
                    }, 0));
                    else event.finish();
                    'step 3'
                    if (result.bool) {
                        var target = result.targets[0];
                        event.target = target;
                        player.line(target, 'green');
                        target.gain(cards, 'gain2').giver = player;
                        target.recover();
                    } else event.finish();
                },
                callback(event) {
                    'step 0';
                    var evt = event.getParent(2);
                    event.getParent().orderingCards.remove(event.judgeResult.card);
                    evt.cards.push(event.judgeResult.card);
                    if (event.getParent().result.bool) {
                        evt.names.push(event.getParent().result.name);
                        if (player.isHealthy()) player.gainMaxHp();
                        else player.recover();
                        player.chooseBool('是否继续发动【慧识】？').set('frequentSkill', 'zshy_ghuishi_damage');
                    } else event._result = { bool: false };
                    'step 1';
                    if (result.bool) event.getParent(2).redo();
                },
                ai: {
                    order: 9,
                    result: {
                        player: 1,
                    },
                },
            },
        },
    },
    zshy_huishi: {//辉逝
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AAZZshenguojiaSJP_shadow: 'zshy_huishi_zshy_AAZZshenguojiaSJP_shadow',
        },
        enable: 'phaseUse',
        charlotte: true,
        usable: 1,
        filterTarget: true,
        check(target) {
            if (target == player && !player.storage('zshy_SGJtianyi')) return true;
            if (get.attitude(player, target) > 0) return true;
            return false;
        },
        content() {
            'step 0'
            var list = [], choiceList = [
                '令' + get.translation(target) + '发动武将牌上的觉醒技',
                '令' + get.translation(target) + '重置武将牌上的限定技',
            ];
            event.list1 = target.getSkills(null, false, false).filter(function (skill) {
                var info = lib.skill[skill];
                return info && info.juexingji && !target.awakenedSkills.includes(skill);
            });
            if (event.list1.length) list.push('选项一');
            else choiceList[0] = '<span style="opacity:0.5">' + choiceList[0] + '</span>';
            event.list2 = target.getSkills(null, false, false).filter(function (skill) {
                var info = lib.skill[skill];
                return info && info.limited && target.awakenedSkills.includes(skill);
            });
            if (event.list2.length) list.push('选项二');
            else choiceList[1] = '<span style="opacity:0.5">' + choiceList[1] + '</span>';
            if (list.length) {
                player.chooseControl(list, 'cancel2').set('choiceList', choiceList).set('ai', function () {
                    if (list.includes('选项二')) return '选项二';
                    if (list.includes('选项一')) return '选项一';
                    return 'cancel2';
                }).set('prompt', get.prompt('zshy_huishi'));
            }
            else event.goto(4);
            'step 1'
            if (result.control != 'cancel2') {
                if (result.control == '选项一') {
                    if (event.list1.length == 1) event._result = { control: event.list1[0] };
                    else player.chooseControl(event.list1).set('prompt', '辉逝：请选择要令' + get.translation(target) + '发动的1个觉醒技');
                }
                else {
                    if (event.list2.length == 1) event._result = { control: event.list2[0] };
                    else player.chooseControl(event.list2).set('prompt', '辉逝：请选择要令' + get.translation(target) + '重置的1个限定技');
                    event.goto(3);
                }
            }
            else event.goto(4);
            'step 2'
            target.useSkill(result.control);
            event.goto(4);
            'step 3'
            target.restoreSkill(result.control);
            'step 4'
            target.recover();
            target.draw(target.maxHp);
        },
        ai: {
            order: 0.1,
            expose: 0.2,
            result: {
                target: function (player, target) {
                    if (target != player && player.hasUnknown()) return 0;
                    if (target == player && player.hasSkill('zshy_SGJtianyi') && game.hasPlayer(function (current) {
                        return current.getAllHistory('damage').length == 0;
                    })) return 2;
                    var list = target.getSkills(null, false, false).filter(function (skill) {
                        var info = lib.skill[skill];
                        return info && ((info.juexingji && !target.awakenedSkills.contains(skill)) || (info.limited && target.awakenedSkills.contains(skill)));
                    });
                    if (list.length) return 2;
                    return 1;
                },
            },
        },
        subSkill: {
            zshy_AAZZshenguojiaSJP_shadow: { audio: 'ext:诸神寰宇/audio/character:2' },
        }
    },
    zshy_SGJtianyi: {//天翊
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'damageEnd',
        },
        forced: true,
        charlotte: true,
        juexingji: true,
        skillAnimation: true,
        animationColor: 'gray',
        derivation: 'zshy_zuoxing',
        filter() {
            return !game.hasPlayer(function (current) {
                return current.getAllHistory('damage').length == 0;
            });
        },
        content() {
            'step 0'
            player.awakenSkill('zshy_SGJtianyi');
            player.changeSkin({ characterName: 'zshy_AAZZshenguojiaSJP' }, 'zshy_AAZZshenguojiaSJP_shadow');
            'step 1'
            var next = game.createEvent('zshy_ghuishi');
            next.player = player, next.logSkill = 'zshy_ghuishi';
            next.setContent(lib.skill.zshy_ghuishi.content);
            'step 2'
            var num = Math.ceil(player.maxHp / 2);
            var str = '天翊：令一名角色获得〖佐幸〗，然后增加' + num + '点体力上限并回复' + num + '点体力';
            player.chooseTarget(true, str).set('ai', function (target) {
                return get.attitude(_status.event.player, target) > 3;
            });
            'step 3'
            if (result.bool) {
                var num = Math.ceil(player.maxHp / 2);
                var target = result.targets[0];
                player.line(target, 'green');
                target.storage.zshy_zuoxing = player;
                target.addSkill('zshy_zuoxing');
                target.gainMaxHp(num);
                target.recover(num);
            }
        },
    },
    zshy_zuoxing: {//佐幸
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: ['chooseToUse', 'chooseToRespond'],
        charlotte: true,
        hiddenCard(player, name) {
            var type = get.type(name);
            var target = player.storage.zshy_zuoxing;
            if (!target || !target.isAlive()) return false;
            return (type == 'basic' || type == 'trick') && lib.inpile.includes(name);
        },
        filter(event, player) {
            var target = player.storage.zshy_zuoxing;
            if (!target || !target.isAlive()) return false;
            for (var i of lib.inpile) {
                var type = get.type(i);
                if ((type == 'basic' || type == 'trick') && event.filterCard({ name: i, isCard: true }, player, event)) return true;
            }
            return false;
        },
        chooseButton: {
            dialog(event, player) {
                var list = [];
                for (var i = 0; i < lib.inpile.length; i++) {
                    var name = lib.inpile[i];
                    if (name == 'sha') {
                        if (event.filterCard({ name: name, isCard: true }, player, event)) list.push(['基本', '', 'sha']);
                        if (event.filterCard({ name: name, nature: 'fire', isCard: true }, player, event)) list.push(['基本', '', 'sha', 'fire']);
                        if (event.filterCard({ name: name, nature: 'thunder', isCard: true }, player, event)) list.push(['基本', '', 'sha', 'thunder']);
                        if (event.filterCard({ name: name, nature: 'ice', isCard: true }, player, event)) list.push(['基本', '', 'sha', 'ice']);
                    }
                    else if (get.type(name) == 'trick' && event.filterCard({ name: name, isCard: true }, player, event)) list.push(['锦囊', '', name]);
                    else if (get.type(name) == 'basic' && event.filterCard({ name: name, isCard: true }, player, event)) list.push(['基本', '', name]);
                }
                return ui.create.dialog('佐幸', [list, 'vcard']);
            },
            filter(button, player) {
                return _status.event.getParent().filterCard({ name: button.link[2] }, player, _status.event.getParent());
            },
            check(button) {
                var name = button.link[2];
                var player = _status.event.player;
                var evt = _status.event.getParent();
                var card = { name: name, nature: button.link[3], isCard: true };
                return evt.type == 'phase' ? player.getUseValue(card) : 1;
            },
            backup(links, player) {
                return {
                    viewAs: {
                        name: links[0][2],
                        nature: links[0][3],
                        suit: 'none',
                        isCard: true,
                    },
                    filterCard: () => false,
                    selectCard: -1,
                    popname: true,
                    precontent() {
                        player.logSkill('zshy_zuoxing');
                        var target = player.storage.zshy_zuoxing;
                        if (target.isHealthy()) target.loseHp();
                        else target.loseMaxHp();
                    },
                }
            },
            prompt(links, player) {
                return '选择【' + get.translation(links[0][3] || '') + get.translation(links[0][2]) + '】的目标';
            },
        },
        ai: {
            save: true,
            fireAttack: true,
            respondSha: true,
            respondShan: true,
            skillTagFilter(player) {
                if (player.storage.zshy_zuoxing.maxHp < 4) return false;
            },
            order: 1,
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

    //墟神荀彧
    zshy_tianzuo: {//天佐
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'phaseBefore',
            player: 'enterGame',
        },
        charlotte: true,
        forced: true,
        filter(event, player) {
            return (event.name != 'phase' || game.phaseNumber == 0) && !lib.inpile.includes('qizhengxiangsheng');
        },
        content() {
            game.addGlobalSkill('zshy_tianzuo_global');
            var cards = [];
            for (var i = 2; i < 10; i++) {
                cards.push(game.createCard2('qizhengxiangsheng', i % 2 ? 'club' : 'spade', i));
            }
            game.broadcastAll(function () {
                lib.inpile.add('qizhengxiangsheng');
            });
            game.cardsGotoPile(cards, () => {
                return ui.cardPile.childNodes[get.rand(0, ui.cardPile.childNodes.length - 1)];
            });
        },
        mod: {
            targetInRange(card) {
                if (get.type(card) == 'trick' || get.type(card) == 'delay') return true;
            },
            cardUsable(card) {
                if (get.type(card) == 'trick' || get.type(card) == 'delay') return Infinity;
            },
        },
        group: ['zshy_tianzuo_remove'],
        subSkill: {
            remove: {
                audio: 'zshy_tianzuo',
                trigger: { target: 'useCardToBefore' },
                charlotte: true,
                forced: true,
                priority: 15,
                filter(event, player) {
                    return event.card && event.card.name == 'qizhengxiangsheng';
                },
                content() {
                    trigger.cancel();
                },
                ai: {
                    effect: {
                        target(card, player, target) {
                            if (card && card.name == 'qizhengxiangsheng') return 'zeroplayertarget';
                        },
                    },
                },
            },
            global: {
                trigger: { player: 'useCardToPlayered' },
                charlotte: true,
                forced: true,
                popup: false,
                filter(event, player) {
                    return event.card.name == 'qizhengxiangsheng';
                },
                content() {
                    'step 0';
                    var target = trigger.target;
                    event.target = target;
                    player
                        .chooseControl('奇兵', '正兵')
                        .set('prompt', '请选择' + get.translation(target) + '的标记')
                        .set(
                            'choice',
                            (function () {
                                var e1 = 1.5 * get.sgn(get.damageEffect(target, player, target));
                                var e2 = 0;
                                if (target.countGainableCards(player, 'h') > 0 && !target.hasSkillTag('noh')) e2 = -1;
                                var es = target.getGainableCards(player, 'e');
                                if (es.length)
                                    e2 = Math.min(
                                        e2,
                                        (function () {
                                            var max = 0;
                                            for (var i of es) max = Math.max(max, get.value(i, target));
                                            return -max / 4;
                                        })()
                                    );
                                if (Math.abs(e1 - e2) <= 0.3) return Math.random() < 0.5 ? '奇兵' : '正兵';
                                if (e1 < e2) return '奇兵';
                                return '正兵';
                            })()
                        )
                        .set('ai', function () {
                            return _status.event.choice;
                        });
                    'step 1';
                    var map = trigger.getParent().customArgs,
                        id = target.playerid;
                    if (!map[id]) map[id] = {};
                    map[id].qizheng_name = result.control;
                },
            },
            rewrite: {
                audio: 'zshy_tianzuo',
                trigger: { global: 'useCardToTargeted' },
                charlotte: true,
                filter(event, player) {
                    return event.card.name == 'qizhengxiangsheng';
                },
                logTarget: 'target',
                prompt2: '观看其手牌并修改“奇正相生”标记',
                content() {
                    'step 0';
                    var target = trigger.target;
                    event.target = target;
                    if (player != target && target.countCards('h') > 0) player.viewHandcards(target);
                    player
                        .chooseControl('奇兵', '正兵')
                        .set('prompt', '请选择' + get.translation(target) + '的标记')
                        .set(
                            'choice',
                            (function () {
                                var shas = target.getCards('h', 'sha'),
                                    shans = target.getCards('h', 'shan');
                                var e1 = 1.5 * get.sgn(get.damageEffect(target, player, target));
                                var e2 = 0;
                                if (target.countGainableCards(player, 'h') > 0 && !target.hasSkillTag('noh')) e2 = -1;
                                var es = target.getGainableCards(player, 'e');
                                if (es.length)
                                    e2 = Math.min(
                                        e2,
                                        (function () {
                                            var max = 0;
                                            for (var i of es) max = Math.max(max, get.value(i, target));
                                            return -max / 4;
                                        })()
                                    );
                                if (get.attitude(player, target) > 0) {
                                    if (shas.length >= Math.max(1, shans.length)) return '奇兵';
                                    if (shans.length > shas.length) return '正兵';
                                    return e1 > e2 ? '奇兵' : '正兵';
                                }
                                if (shas.length) e1 = -0.5;
                                if (shans.length) e2 = -0.7;
                                if (Math.abs(e1 - e2) <= 0.3) return Math.random() < 0.5 ? '奇兵' : '正兵';
                                var rand = Math.random();
                                if (e1 < e2) return rand < 0.1 ? '奇兵' : '正兵';
                                return rand < 0.1 ? '正兵' : '奇兵';
                            })()
                        )
                        .set('ai', () => _status.event.choice);
                    'step 1';
                    var map = trigger.getParent().customArgs,
                        id = target.playerid;
                    if (!map[id]) map[id] = {};
                    map[id].qizheng_name = result.control;
                    map[id].qizheng_aibuff = get.attitude(player, target) > 0;
                },
            },
        },
    },
    zshy_lingce: {//灵策
        audio: 'ext:诸神寰宇/audio/character:2',
        init: player => {
            game.addGlobalSkill('zshy_lingce_global');
        },
        trigger: { global: 'useCard' },
        charlotte: true,
        forced: true,
        firstDo: true,
        filter(event, player) {
            return get.type(event.card) == 'trick' || get.type(event.card) == 'delay';
        },
        content() {
            'step 0'
            player.chooseDrawRecover(true);
            'step 1'
            const str = '是否对' + get.translation(trigger.player) + '造成1点伤害？';
            if ((trigger.card.name == 'qizhengxiangsheng' || !player.getStorage('zshy_dinghan').includes(trigger.card.name)) && trigger.player != player) {
                player.chooseBool().set('ai', function () {
                    var player = _status.event.player;
                    return get.damageEffect(trigger.player, player, trigger.player) > 0;
                }).set('prompt', get.prompt('zshy_lingce')).set('prompt', str);
            } else event.finish();
            'step 2'
            if (result.bool) trigger.player.damage();
        },
        group: ['zshy_lingce_useCard'],
        subSkill: {
            global: {
                charlotte: true,
                ai: {
                    effect: {
                        player_use(card, player, target) {
                            if (typeof card !== 'object') return;
                            let num = 0, nohave = true;
                            game.countPlayer(i => {
                                if (i.hasSkill('zshy_lingce', null, null, false)) {
                                    nohave = false;
                                    if (i.isIn() && lib.skill.zshy_lingce.filter({
                                        card: card,
                                        cards: card.cards ? card.cards : [card],
                                    }, i)) num += get.sgnAttitude(player, i);
                                }
                            }, true);
                            if (nohave) game.removeGlobalSkill('zshy_lingce_global');
                            else return [1, 0.8 * num];
                        },
                    },
                },
            },
            useCard: {
                trigger: { global: 'useCard' },
                charlotte: true,
                forced: true,
                filter(event, player) {
                    return (get.type(event.card) == 'trick' || get.type(event.card) == 'delay') &&
                        (event.card.name == 'qizhengxiangsheng' || player.getStorage('zshy_dinghan').includes(event.card.name)) &&
                        event.player != player;
                },
                content() {
                    'step 0'
                    const str = '是否令' + get.translation(trigger.card) + '无效？';
                    player.chooseBool().set('ai', function () {
                        var player = _status.event.player;
                        return get.effect(trigger.player, { name: trigger.card.name }, player, trigger.player) < 0;
                    }).set('prompt', get.prompt('zshy_lingce')).set('prompt2', str);
                    'step 1'
                    if (result.bool) {
                        if (trigger.targets) trigger.targets.length = 0;
                        trigger.all_excluded = true;
                    }
                },
            },
        },
    },
    zshy_dinghan: {//定汉
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            target: 'useCardToTarget',
            player: 'addJudgeBefore',
        },
        charlotte: true,
        forced: true,
        locked: false,
        filter(event, player) {
            if (event.name == 'useCardToTarget' && get.type(event.card, null, false) != 'trick') return false;
            return !player.getStorage('zshy_dinghan').includes(event.card.name);
        },
        content() {
            player.markAuto('zshy_dinghan', [trigger.card.name]);
        },
        onremove: true,
        intro: { content: '已记录牌名：$' },
        group: ['zshy_dinghan_add'],
        subSkill: {
            add: {
                trigger: { global: 'phaseBegin' },
                charlotte: true,
                direct: true,
                content() {
                    'step 0';
                    var dialog = [get.prompt('zshy_dinghan')];
                    (list1 = player.getStorage('zshy_dinghan')),
                        (list2 = lib.inpile.filter(function (i) {
                            return get.type2(i, false) == 'trick' && !list1.includes(i);
                        }));
                    if (list1.length) {
                        dialog.push('<div class="text center">已记录</div>');
                        dialog.push([list1, 'vcard']);
                    }
                    if (list2.length) {
                        dialog.push('<div class="text center">未记录</div>');
                        dialog.push([list2, 'vcard']);
                    }
                    player.chooseButton(dialog).set('ai', function (button) {
                        var player = _status.event.player,
                            name = button.link[2];
                        if (player.getStorage('zshy_dinghan').includes(name)) {
                            return get.effect(player, { name: name }, player, player);
                        } else {
                            return -get.effect(player, { name: name }, player, player) * (1 + player.countCards('hs', name));
                        }
                    });
                    'step 1';
                    if (result.bool) {
                        player.logSkill('zshy_dinghan');
                        var name = result.links[0][2];
                        if (player.getStorage('zshy_dinghan').includes(name)) {
                            player.unmarkAuto('zshy_dinghan', [name]);
                            game.log(player, '从定汉记录中移除了', '#y' + get.translation(name));
                        } else {
                            player.markAuto('zshy_dinghan', [name]);
                            game.log(player, '向定汉记录中添加了', '#y' + get.translation(name));
                        }
                        game.delayx();
                    }
                },
            },
        },
    },

};
const 始计篇信 = {
    //墟周处
    zshy_xianghai: {//乡害
        audio: 'ext:诸神寰宇/audio/character:2',
        mod: {
            cardname(card) {
                if (get.type(card, null, false) == 'equip') return 'jiu';
            },
        },
        global: ['zshy_xianghai_lose'],
        subSkill: {
            lose: {
                mod: {
                    maxHandcard(player, num) {
                        return (num -
                            game.countPlayer(function (current) {
                                return current != player && current.hasSkill('zshy_xianghai');
                            }) * player.hp
                        );
                    },
                },
            },
        },
    },
    zshy_chuhai: {//除害
        audio: 'ext:诸神寰宇/audio/character:2',
        dutySkill: true,
        locked: false,
        group: ['zshy_chuhai_add', 'zshy_chuhai_achieve', 'zshy_chuhai_fail', 'zshy_chuhai_chuhai'],
        derivation: 'zshy_zhangming',
        subSkill: {
            chuhai: {
                audio: 'zshy_chuhai',
                enable: 'phaseUse',
                usable: 2,
                filter(event, player) {
                    return game.hasPlayer(target => !target.hasSkill('zshy_chuhai_used') && target != player);
                },
                filterTarget(card, player, target) {
                    return !target.hasSkill('zshy_chuhai_used') && target != player;
                },
                content() {
                    'step 0'
                    player.draw();
                    if (target.countCards('h') == 0) target.draw();
                    'step 1'
                    if (player.canCompare(target)) {
                        player.chooseToCompare(target);
                        target.addTempSkill('zshy_chuhai_used');
                    }
                    else event.finish();
                    'step 2'
                    if (result.bool) {
                        player.storage.zshy_chuhai_chuhai2 = target;
                        player.addSkill('zshy_chuhai_chuhai2');
                        if (target.countCards('h') > 0) {
                            player.viewHandcards(target);
                            var types = [],
                                cards = [],
                                hs = target.getCards('h');
                            for (var i of hs) {
                                types.add(get.type2(i, target));
                            }
                            for (var i of types) {
                                var card = get.cardPile(function (card) {
                                    return get.type2(card, false) == i;
                                });
                                if (card) cards.push(card);
                            }
                            if (cards.length) player.gain(cards, 'gain2', 'log');
                        }
                    }
                },
                ai: {
                    order: 9,
                    result: {
                        target(player, target) {
                            if (
                                player.countCards('hs', function (card) {
                                    return get.tag(card, 'damage') > 0 && player.canUse(card, target, null, true) && get.effect(target, card, player, player) > 0 && player.hasValueTarget(card, null, true);
                                }) > 0
                            )
                                return -3;
                            return -1;
                        },
                    },
                },
            },
            chuhai2: {
                trigger: { source: 'damageSource' },
                forced: true,
                charlotte: true,
                onremove: true,
                sourceSkill: 'zshy_chuhai_chuhai',
                filter(event, player) {
                    if (!event.player.hasSkill('zshy_chuhai_used')) return false;
                    for (var i = 1; i < 6; i++) {
                        if (player.hasEmptySlot(i)) return true;
                    }
                    return false;
                },
                content() {
                    for (var i = 1; i < 7; i++) {
                        if (player.hasEmptySlot(i)) {
                            var sub = 'equip' + i,
                                card = get.cardPile(function (card) {
                                    return get.subtype(card, false) == sub && !get.cardtag(card, 'gifts') && player.canEquip(card);
                                });
                            if (card) {
                                player.$gain2(card);
                                game.delayx();
                                player.equip(card);
                                break;
                            }
                        }
                    }
                },
            },
            add: {
                trigger: { player: 'compare' },
                forced: true,
                popup: false,
                filter(event, player) {
                    return event.getParent().name == 'zshy_chuhai_chuhai';
                },
                content() {
                    var num = player.hp;
                    game.log(player, '的拼点牌点数+', num);
                    trigger.num1 = trigger.num1 + num;
                },
            },
            achieve: {
                audio: 'zshy_chuhai2.mp3',
                trigger: { player: 'equipAfter' },
                forced: true,
                skillAnimation: true,
                animationColor: 'wood',
                filter(event, player) {
                    return player.countCards('e') > 2;
                },
                content() {
                    player.awakenSkill('zshy_chuhai');
                    game.log(player, '成功完成使命');
                    if (player.isDamaged()) player.recover(player.maxHp - player.hp);
                    player.changeSkills(['zshy_zhangming'], ['zshy_xianghai']);
                },
            },
            fail: {
                audio: 'ext:诸神寰宇/audio/character:1',
                trigger: { player: 'chooseToCompareAfter' },
                forced: true,
                filter(event, player) {
                    return event.getParent().name == 'zshy_chuhai_chuhai' && event.num1 < 7 && !event.result.bool;
                },
                content() {
                    player.awakenSkill('zshy_chuhai');
                    game.log(player, '使命失败');
                },
            },
            used: {
                charlotte: true,
            },
        },
    },
    zshy_zhangming: {//彰名
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'useCard' },
        forced: true,
        filter(event, player) {
            return get.suit(event.card) == 'club';
        },
        content() {
            trigger.directHit.addArray(
                game.filterPlayer(function (current) {
                    return current != player;
                })
            );
        },
        group: ['zshy_zhangming_damage', 'zshy_zhangming_keep'],
        subSkill: {
            damage: {
                audio: 'zshy_zhangming',
                trigger: { source: 'damageEnd' },
                forced: true,
                filter(event, player) {
                    return player != event.player;
                },
                logTarget: 'player',
                content() {
                    var list = [],
                        cards = [],
                        target = trigger.player,
                        hs = target.getCards('h');
                    if (hs.length > 0) {
                        var card = hs.randomGet();
                        list.push(get.type2(card, target));
                        player.showCards(card, get.translation(player) + '对' + get.translation(target) + '发动了〖彰名〗');
                    }
                    target.discard(card);
                    for (var i = 0; i < ui.cardPile.childNodes.length; i++) {
                        var type = get.type2(ui.cardPile.childNodes[i], false);
                        if (!list.includes(type)) {
                            list.push(type);
                            cards.push(ui.cardPile.childNodes[i]);
                        }
                    }
                    player.gain(cards, 'gain2').gaintag.add('zshy_zhangming');
                },
            },
            keep: {
                charlotte: true,
                onremove(player) {
                    player.removeGaintag('zshy_zhangming');
                },
                mod: {
                    ignoredHandcard(card, player) {
                        if (card.hasGaintag('zshy_zhangming')) {
                            return true;
                        }
                    },
                    cardDiscardable(card, player, name) {
                        if (name == 'phaseDiscard' && card.hasGaintag('zshy_zhangming')) {
                            return false;
                        }
                    },
                },
            },
        },
    },

    //墟神孙策
    zshy_yingba: {//英霸
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        usable: 1,
        charlotte: true,
        locked: false,
        filter: (event, player) => game.hasPlayer(current => current != player),
        filterTarget: (card, player, target) => target != player,
        async content(event, trigger, player) {
            event.target.loseMaxHp();
            if (event.target.isIn()) {
                await event.target.addMark('zshy_yingba_mark', 1);
            }
        },
        mod: {
            targetInRange(card, player, target) {
                if (target.hasMark('zshy_yingba_mark')) {
                    return true;
                }
            },
            cardUsableTarget(card, player, target) {
                if (target.hasMark('zshy_yingba_mark')) {
                    return true;
                }
            },
            aiOrder(player, card, num) {
                if (num > 0 && _status.event && _status.event.type == 'phase' && get.tag(card, 'recover')) {
                    if (player.needsToDiscard()) {
                        return num / 3;
                    }
                    return 0;
                }
            },
        },
        ai: {
            threaten(player, target) {
                if (player === target || player.isDamaged() || get.attitude(player, target) > 0) {
                    return 1;
                }
                return 8 / player.maxHp;
            },
            order: 11,
            result: {
                player(player, target) {
                    if (player.maxHp == 1) {
                        return -2.5;
                    }
                    return -0.25;
                },
                target(player, target) {
                    if (target.isHealthy()) {
                        return -2;
                    }
                    if (!target.hasMark('zshy_yingba_mark')) {
                        return -1;
                    }
                    return -0.2;
                },
            },
        },
        subSkill: {
            mark: {
                marktext: '定',
                intro: {
                    name: '平定',
                    content: 'mark',
                    onunmark: true,
                },
                mod: {
                    maxHandcard(player, numx) {
                        var num = player.countMark('zshy_yingba_mark');
                        if (num) {
                            return (
                                numx + num * game.countPlayer(function (current) {
                                    return current.hasSkill('zshy_yingba');
                                })
                            );
                        }
                    },
                },
            },
        },
    },
    zshy_fuhai: {//覆海
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'useCardToPlayered' },
        charlotte: true,
        forced: true,
        filter(event, player) {
            return event.target && event.target.hasMark('zshy_yingba_mark');
        },
        logTarget: 'target',
        content() {
            trigger.directHit.add(trigger.target);
            player.draw();
        },
        ai: {
            directHit_ai: true,
            skillTagFilter(player, tag, arg) {
                return arg && arg.target && arg.target.hasMark('zshy_yingba_mark');
            },
            combo: 'zshy_yingba',
        },
        group: ['zshy_fuhai_die'],
        subSkill: {
            usea: {
                audio: 'zshy_fuhai',
                trigger: { player: 'useCardAfter' },
                forced: true,
                filter(event, player) {
                    return lib.skill.zshy_fuhai_usea.logTarget(event, player).length > 0;
                },
                logTarget(event, player) {
                    return event.targets.filter(function (i) {
                        return i.hasMark('zshy_yingba_mark');
                    });
                },
                content() {
                    var num = 0;
                    for (var i of trigger.targets) {
                        var numx = i.countMark('zshy_yingba_mark');
                        if (numx) {
                            num += numx;
                            i.removeMark('zshy_yingba_mark', numx);
                        }
                    }
                    if (num) {
                        player.gainMaxHp(num);
                    }
                },
            },
            die: {
                audio: 'zshy_fuhai',
                trigger: { global: 'die' },
                forced: true,
                filter(event, player) {
                    return event.player.countMark('zshy_yingba_mark') > 0;
                },
                content() {
                    player.gainMaxHp(trigger.player.countMark('zshy_yingba_mark'));
                    player.draw(trigger.player.countMark('zshy_yingba_mark'));
                    delete player.getStat().skill.zshy_yingba;
                    game.log(player, '重置了', '#g【英霸】');
                },
            },
        },
    },
    zshy_pinghe: {//冯河
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'damageBegin2' },
        charlotte: true,
        forced: true,
        filter(event, player) {
            return event.source && event.source != player && ((player.isDamaged() && player.maxHp > 1) || player.countCards('h') > 0);
        },
        async content(event, trigger, player) {
            trigger.cancel();
            if (player.countCards('h') > 0) {
                const result = await player.chooseCardTarget({
                    prompt: '请选择【冯河】的牌和目标',
                    prompt2: '将一张手牌交给一名其他角色并防止伤害' + (player.hasSkill('zshy_yingba') ? '，然后令伤害来源获得一个“平定”标记并减少1点体力上限' : ''),
                    filterCard: true,
                    forced: true,
                    filterTarget: lib.filter.notMe,
                    ai1(card) {
                        if (get.tag(card, 'recover') && !game.hasPlayer(function (current) {
                            return get.attitude(current, player) > 0 && !current.hasSkillTag('nogain');
                        })) {
                            return 0;
                        }
                        return 1 / Math.max(0.1, get.value(card));
                    },
                    ai2(target) {
                        var player = _status.event.player,
                            att = get.attitude(player, target);
                        if (target.hasSkillTag('nogain')) {
                            att /= 9;
                        }
                        return 4 + att;
                    },
                }).forResult();
                if (result && result.bool) {
                    var target = result.targets[0];
                    player.line(target, 'green');
                    player.give(result.cards, target);
                    if (player.hasSkill('zshy_yingba')) {
                        await trigger.source.addMark('zshy_yingba_mark', 1);
                        trigger.source.loseMaxHp();
                    }
                }
            }
            else {
                await player.loseMaxHp();
                if (player.hasSkill('zshy_yingba')) {
                    await trigger.source.addMark('zshy_yingba_mark', 1);
                    trigger.source.loseMaxHp();
                }
            }
        },
        mod: {
            maxHandcardBase(player) {
                return player.maxHp;
            },
        },
        ai: {
            maixie_defend: true,
            effect: {
                target(card, player, target) {
                    if (player !== target && target.maxHp > 1 && target.countCards('h') > 0) {
                        if (get.tag(card, 'damage') && target.hasSkill('zshy_yingba')) {
                            let damage = 1.6;
                            if (target.isHealthy()) {
                                damage += 1.6;
                            }
                            if (
                                game.hasPlayer(cur => {
                                    return cur !== target && get.attitude(target, cur) > 0;
                                })
                            ) {
                                damage -= 0.9;
                            }
                            return [0, -damage, 0, -0.4];
                        }
                        if (card.name === 'tiesuo') {
                            return 0.4;
                        }
                    }
                    if (get.tag(card, 'recover') && _status.event.type == 'phase' && !player.needsToDiscard()) {
                        return 0;
                    }
                },
            },
        },
    },

    zshy_powei: {//破围
        audio: 'ext:诸神寰宇/audio/character:3',
        charlotte: true,
        dutySkill: true,
        derivation: 'zshy_shenzhuo',
        group: ['zshy_powei_init', 'zshy_powei_fail', 'zshy_powei_use', 'zshy_powei_remove'],
        subSkill: {
            remove: {
                audio: 'ext:诸神寰宇/audio/character/zshy_powei2.mp3',
                trigger: { global: 'damageEnd' },
                filter(event, player) {
                    return event.player && event.player != player && event.player.hasMark('zshy_dulie');
                },
                forced: true,
                logTarget: 'player',
                async content(event, trigger, player) {
                    player.chooseDrawRecover(true);
                    trigger.player.removeMark('zshy_dulie', 1);
                },
            },
            use: {
                audio: 'ext:诸神寰宇/audio/character/zshy_powei2.mp3',
                trigger: { global: 'phaseBegin' },
                direct: true,
                filter(event, player) {
                    return event.player != player;
                },
                content() {
                    'step 0';
                    var list = [],
                        target = trigger.player,
                        choiceList = ['对其造成1点伤害', '获得其一张手牌'];
                    event.target = target;
                    list.push('选项一');
                    if (target.countCards('h') > 0) {
                        list.push('选项二');
                    } else {
                        choiceList[1] = '<span style="opacity: 0.5">' + choiceList[1] + '</span>';
                    }
                    player.chooseControl(list, 'cancel2')
                        .set('prompt', get.prompt('zshy_powei', target))
                        .set('choiceList', choiceList)
                        .set('ai', function () {
                            var evt = _status.event.getParent();
                            if (get.damageEffect(evt.target, evt.player, evt.player) > 0) {
                                return '选项一';
                            }
                            if (evt.target.countCards('h') > 0 && get.attitude(evt.player, evt.target) <= 0 && !evt.target.hasSkillTag('noh')) {
                                return '选项二';
                            }
                            return 'cancel2';
                        });
                    'step 1';
                    if (result.control != 'cancel2') {
                        if (result.control == '选项二') {
                            player.logSkill('zshy_powei_use', target);
                            player.gainPlayerCard(target, 'h', true);
                            event.goto(3);
                        }
                    } else {
                        event.finish();
                    }
                    'step 2';
                    player.logSkill('zshy_powei_use', target);
                    if (get.mode() != 'identity' || player.identity != 'nei') {
                        player.addExpose(0.2);
                    }
                    target.damage();
                },
                ai: { expose: 0.2 },
            },
            init: {
                audio: 'ext:诸神寰宇/audio/character/zshy_powei1.mp3',
                trigger: {
                    global: 'roundStart',
                },
                forced: true,
                logTarget(event, player) {
                    return game.filterPlayer(current => current != player);
                },
                async content(event, trigger, player) {
                    let list = game.filterPlayer(current => current != player).sortBySeat();
                    for (const i of list) {
                        i.addMark('zshy_dulie', 1, false);
                    }
                },
            },
            fail: {
                audio: 'ext:诸神寰宇/audio/character/zshy_powei3.mp3',
                trigger: { player: 'dying' },
                forced: true,
                async content(event, trigger, player) {
                    if (player.hp < 1) {
                        await player.recoverTo(player.maxHp);
                    }
                    player.draw(4);
                    if (game.countPlayer(function (current) {
                        return current != player && !current.hasMark('zshy_dulie');
                    }) == 0) {
                        await player.awakenSkill('zshy_powei');
                    }
                    else {
                        let list = game.filterPlayer(current => current != player).sortBySeat();
                        for (const i of list) {
                            i.addMark('zshy_dulie', 1, false);
                        };
                    };
                },
            },
        },
    },
    zshy_dulie: {//笃烈
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { target: 'useCardToTarget' },
        charlotte: true,
        forced: true,
        logTarget: 'player',
        filter(event, player) {
            return event.card && get.tag(event.card, 'damage') > 0.5 && event.player != player;
        },
        async content(event, trigger, player) {
            let card = get.cards()[0];
            await player.showCards(card, get.translation(event.name));
            if (get.color(card) == 'red') {
                trigger.targets.remove(player);
                trigger.getParent().triggeredTargets2.remove(player);
                trigger.untrigger();
                if (get.suit(card) == 'heart') {
                    player.chooseDrawRecover(true);
                }
            };
        },
        ai: {
            effect: {
                target_use(card, player, target, current, isLink) {
                    if (get.tag(card, 'damage') && !isLink) {
                        return 0.5;
                    }
                },
            },
        },
        marktext: '围',
        intro: {
            name: '破围(围)',
            name2: '围',
            content: 'mark',
        },
    },
    zshy_shenzhuo: {//神著
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'useCardAfter' },
        charlotte: true,
        forced: true,
        filter(event, player) {
            return get.tag(event.card, 'damage') > 0.5;
        },
        content() {
            'step 0';
            player.chooseControl()
                .set('choiceList', ['摸一张牌，且本回合使用【杀】的次数上限+1', '回复1点体力或摸三张牌'])
                .set('ai', () => (_status.event.player.hasSha() ? 0 : 1));
            'step 1';
            if (result.index == 0) {
                player.draw();
                player.addTempSkill('zshy_shenzhuo_more');
                player.addMark('zshy_shenzhuo_more', 1, false);
            } else {
                player.chooseDrawRecover(3, true);
            }
        },
        subSkill: {
            more: {
                charlotte: true,
                onremove: true,
                mod: {
                    cardUsable(card, player, num) {
                        if (card.name == 'sha') {
                            return num + player.countMark('zshy_shenzhuo_more');
                        }
                    },
                },
            },
        },
    },

};
const 始计篇仁 = {
};
const 始计篇勇 = {
    //墟文鸯
    zshy_quedi: {//却敌
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'useCardToTargeted',
        },
        direct: true,
        shaRelated: true,
        filter(event, player) {
            return get.tag(event.card, 'damage') == true && event.targets.length == 1 && event.target != player;
        },
        content() {
            'step 0'
            var target = trigger.target;
            event.target = target;
            var cardx = get.translation(trigger.card);
            var list = [], choiceList = [
                '获得' + get.translation(target) + '区域内1张牌',
                '令' + cardx + '对' + get.translation(target) + '的伤害基数+1',
                '减少1点体力上限并依次执行前2项，然后摸一张牌',
            ];
            if (target.countGainableCards(player, 'hej')) list.push('选项一');
            else choiceList[0] = '<span style="opacity: 0.5">' + choiceList[0] + '</span>';
            list.push('选项二');
            if (list.includes('选项一')) list.push('选项三');
            else choiceList[2] = '<span style="opacity: 0.5">' + choiceList[2] + '</span>';
            player.chooseControl(list, 'cancel2').set('choiceList', choiceList).set('ai', function () {
                var evt = _status.event.getTrigger(), player = evt.player, target = evt.target, card = evt.card;
                if (get.attitude(player, target) >= 0) return 'cancel2';
                var bool1 = list.includes('选项一') && get.effect(target, { name: 'shunshou_copy2' }, player, player);
                var bool2 = !target.hasSkillTag('filterDamage', null, { player: player, card: card });
                if (bool1 && bool2 && (player.isDamaged() && player.maxHp > 3 && player.group == 'wu')) return '选项三';
                if (bool1 && Math.random() < 0.88) return '选项一';
                if (bool2) return '选项二';
                return 'cancel2';
            }).set('prompt', get.prompt('zshy_quedi'));
            'step 1'
            if (result.control != 'cancel2') {
                event.control = result.control;
                player.logSkill('zshy_quedi', target);
            }
            else {
                event.finish();
            }
            'step 2'
            if (event.control == '选项一' || event.control == '选项三') {
                if (target.countGainableCards(player, 'hej')) player.gainPlayerCard(target, true, 'hej');
            }
            'step 3'
            if (event.control == '选项二' || event.control == '选项三') {
                var id = target.playerid;
                var map = trigger.getParent().customArgs;
                if (!map[id]) map[id] = {};
                if (typeof map[id].extraDamage != 'number') {
                    map[id].extraDamage = 0;
                }
                map[id].extraDamage++;
            }
            'step 4'
            if (event.control == '选项三') {
                player.draw();
            }
        },
        ai: {
            directHit_ai: true,
            skillTagFilter(player, tag, arg) {
                if (tag !== 'directHit_ai' || !arg || !arg.card || !arg.target || (arg.card.name != 'sha' && arg.card.name != 'juedou')) return false;
                if (arg.target.countCards('h') == 1 && (arg.card.name != 'sha' || !arg.target.hasSkillTag('freeShan', false, {
                    player: player, card: arg.card
                }) || player.hasSkillTag('unequip', false, {
                    name: arg.card ? arg.card.name : null,
                    target: arg.target, card: arg.card
                }) || player.hasSkillTag('unequip_ai', false, {
                    name: arg.card ? arg.card.name : null,
                    target: arg.target, card: arg.card
                }))) return true;
                return false;
            },
        },
    },
    zshy_zhuifeng: {//椎锋
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        groupSkill: 'wei',
        filter(event, player) {
            return player.group == 'wei';
        },
        filterTarget(card, player, target) {
            return target != player;
        },
        prompt(event, player) {
            return '出牌阶段，你可以失去1点体力，然后摸等同你已损失体力值的牌，视为你对一名其他角色强制使用一张【决斗】';
        },
        content() {
            'step 0'
            player.loseHp();
            'step 1'
            player.draw(player.getDamagedHp());
            if (target.isAlive()) player.useCard({ name: 'juedou' }, target, false);
        },
        ai: {
            directHit: true,
            order() {
                return get.order({ name: 'juedou' }) - 0.5;
            },
            result: {
                target(player, target) {
                    if (get.attitude(player, target) >= 0) return 0;
                    var eff = get.effect(player, { name: 'losehp' }, player, player);
                    if (player.hp < 2 && !player.canSave(player) && eff < 0) return 0;
                    return get.effect(target, { name: 'juedou' }, player, target);
                },
            },
        },
    },
    zshy_chongjian: {//冲坚
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: ['chooseToUse', 'chooseToRespond'],
        groupSkill: 'wu',
        locked: false,
        filter(event, player) {
            return player.group == 'wu' && player.hasCard(function (card) {
                return get.type(card) == 'equip';
            }, 'hes');
        },
        hiddenCard(player, name) {
            if (player.group == 'wu' && (name == 'sha' || name == 'jiu') && player.hasCard(function (card) {
                return get.type(card) == 'equip';
            }, 'hes')) return true;
            return false;
        },
        prompt(event, player) {
            return '当你需要使用或打出【杀】或【酒】时，你可将一张装备牌当作【杀】或【酒】使用或打出';
        },
        chooseButton: {
            dialog() {
                var list = [];
                list.push(['基本', '', 'sha']);
                for (var i of lib.inpile_nature) list.push(['基本', '', 'sha', i]);
                list.push(['基本', '', 'jiu']);
                return ui.create.dialog('冲坚', [list, 'vcard']);
            },
            filter(button, player) {
                var evt = _status.event.getParent();
                return evt.filterCard({ name: button.link[2], nature: button.link[3], isCard: true, storage: { zshy_chongjian: true } }, player, evt);
            },
            check(button) {
                if (_status.event.getParent().type != 'phase') return 1;
                var player = _status.event.player;
                if (button.link[2] == 'jiu' && (player.hasCard(function (card) {
                    return get.name(card) == 'sha';
                }, 'hs') || player.countCards('hes', function (card) {
                    if (get.type(card) != 'equip') return false;
                    if (get.position(card) == 'e') {
                        if (player.hasSkillTag('noe')) return (10 - get.value(card)) > 0;
                        var sub = get.subtype(card);
                        if (player.hasCard(function (card) {
                            return get.subtype(card) == sub && player.canUse(card, player) && get.effect(player, card, player, player) > 0;
                        }, 'hs')) return (10 - get.value(card)) > 0;
                    }
                    return (5 - get.value(card)) > 0;
                }) > 1)) return player.getUseValue({ name: 'jiu' }) * 4;
                return player.getUseValue({ name: button.link[2], nature: button.link[3] }, false);
            },
            backup(links, player) {
                return {
                    popname: true,
                    position: 'hes',
                    filterCard: { type: 'equip' },
                    viewAs: {
                        name: links[0][2],
                        nature: links[0][3],
                        storage: { zshy_chongjian: true },
                    },
                    check(card) {
                        var player = _status.event.player;
                        if (get.position(card) == 'e') {
                            if (player.hasSkillTag('noe')) return 10 - get.value(card);
                            var sub = get.subtype(card);
                            if (player.hasCard(function (card) {
                                return get.subtype(card) == sub && player.canUse(card, player) && get.effect(player, card, player, player) > 0;
                            }, 'hs')) return 10 - get.value(card);
                        }
                        return 5 - get.value(card);
                    },
                    precontent() {
                        player.logSkill('zshy_chongjian');
                    },
                }
            },
            prompt(links) {
                return '将1张装备牌当作' + (links[0][3] ? get.translation(links[0][3]) : '') + '【' + get.translation(links[0][2]) + '】使用或打出';
            },
        },
        ai: {
            unequip: true,
            respondSha: true,
            skillTagFilter(player) {
                return player.group == 'wu' && player.hasCard(function (card) {
                    return get.type(card) == 'equip';
                }, 'hes');
            },
            order(item, player) {
                if (_status.event.type != 'phase') return 1;
                var player = _status.event.player;
                if (player.hasCard(function (card) {
                    if (get.value(card, player) < 0) return true;
                    var sub = get.subtype(card);
                    return player.hasCard(function (card) {
                        return get.subtype(card) == sub && player.canUse(card, player) && get.effect(player, card, player, player) > 0;
                    }, 'hs') > 0;
                }, 'e')) return 10;
                if (player.countCards('hs', 'sha') || player.countCards('he', function (card) {
                    return get.type(card) == 'equip' && get.value(card, player) < 5;
                }) > 1) return get.order({ name: 'jiu' }) - 0.1;
                return get.order({ name: 'sha' }) - 0.1;
            },
            result: {
                player: 1,
            },
        },
        mod: {
            targetInRange(card) {
                if (card.storage && card.storage.zshy_chongjian) return true;
            },
            cardUsable(card) {
                if (card.storage && card.storage.zshy_chongjian) return true;
            },
        },
        group: ['zshy_chongjian_Damage'],
        subSkill: {
            Damage: {
                sub: true,
                trigger: {
                    source: 'damageSource',
                },
                forced: true,
                filter(event, player) {
                    if (!game.hasPlayer(function (current) {
                        return current.countCards('he');
                    })) return false;
                    return event.parent.skill == 'zshy_chongjian_backup' && get.name(event.card) == 'sha' && event.getParent().name == 'sha';
                },
                content() {
                    'step 0'
                    var num = trigger.num;
                    player.chooseTarget(get.prompt('zshy_chongjian'), '获得一名其他角色的' + num + '张牌', (card, player, target) => {
                        return target.countGainableCards(player, 'he') && target != player;
                    }).set('ai', target => {
                        var player = _status.event.player;
                        var att = get.attitude(player, target);
                        if (att < 0 && target.countCards('he') > 0 && !target.hasSkillTag('noe')) return -1;
                        return 0;
                    });
                    'step 1'
                    if (result.bool) player.gainPlayerCard(result.targets[0], 'he', trigger.num, true);
                },
            },
        },
    },
    zshy_choujue: {//仇决
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            source: ['damageAfter', 'dieAfter'],
            global: ['dyingBegin'],
        },
        forced: true,
        filter(event, player) {
            if (event.name == 'die') return true;
            if (event.name == 'damage') return event.num > 2;
            return event.player != player && event.source == player;
        },
        content() {
            'step 0'
            if (trigger.name == 'damage') player.gainMaxHp(), event.finish();
            else if (trigger.name == 'dying') player.gainMaxHp(), player.chooseDrawRecover(true), event.finish();
            else player.chooseControl(['wei', 'wu']).set('ai', function () {
                return ['wei', 'wu'].randomGet();
            }).set('prompt', '【仇决】').set('prompt2', '请选择你要转换的阵营');
            'step 1'
            if (result.control) {
                player.changeGroup(result.control);
                if (get.mode() == 'guozhan') player.identity = result.control;
            }
        },
    },

};
const 始计篇严 = {
};
const 魔乱九州 = {
    //墟魔吕布
    zshy_duoqi: {//夺炁
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: 'phaseBefore' },
        forced: true,
        cardslist(player, target, killGain = false) {
            const filterCard = card => card.hasGaintag('eternal_zshy_duoqi_tag') && target._start_cards?.includes(card);
            let cards = [...ui.cardPile.childNodes, ...ui.discardPile.childNodes].filter(filterCard);
            const lose_list = [];
            const targets = game.filterPlayer();
            targets.forEach(targetx => {
                const pos = 'ej' + (targetx !== player ? 'h' : '');
                const cardsx = targetx.getCards(pos, filterCard);
                if (cardsx.length) {
                    cards = cards.concat(cardsx);
                    if (killGain) {
                        targetx.$throw(cards, 1000);
                        lose_list.push([targetx, cards]);
                    }
                }
            });
            return killGain ? [cards, lose_list] : cards;
        },
        async content(event, trigger, player) {
            var next = player.phaseUse();
            event.next.remove(next);
            trigger.next.push(next);
        },
        group: ['zshy_duoqi_gain', 'zshy_duoqi_mark'],
        subSkill: {
            gain: {
                audio: 'zshy_duoqi',
                trigger: { source: 'damageSource' },
                forced: true,
                getIndex(event, player) {
                    return event.num;
                },
                filter(event, player) {
                    const cards = get.info('zshy_duoqi').cardslist(player, event.player);
                    return event.player?._start_cards?.some(card => cards.includes(card));
                },
                async content(event, trigger, player) {
                    const cards = get.info('zshy_duoqi').cardslist(player, trigger.player);
                    if (cards.length) {
                        const card = cards.randomGet();
                        if (get.owner(card)) {
                            await player.gain(card, 'give', get.owner(card));
                        } else {
                            await player.gain(card, 'gain2');
                        }
                    };
                    player.recover();
                },
            },
            mark: {
                trigger: {
                    global: 'phaseBefore',
                    player: 'enterGame',
                },
                forced: true,
                popup: false,
                filter(event, player) {
                    return (event.name != 'phase' || game.phaseNumber == 0) && game.hasPlayer(target => target._start_cards?.length);
                },
                async content(event, trigger, player) {
                    game.filterPlayer().forEach(target => target.addGaintag(target._start_cards, 'eternal_zshy_duoqi_tag'));
                },
            },
            tag: {},
        },
    },
    zshy_kuangmo: {//狂魔
        audio: 'ext:诸神寰宇/audio/character:3',
        enable: 'phaseUse',
        skillAnimation: 'epic',
        animationColor: 'metal',
        filter(event, player) {
            return game.hasPlayer(current => player !== current) && !player.hasSkill('olrumo');
        },
        filterTarget: lib.filter.notMe,
        async content(event, trigger, player) {
            player.addSkill('olrumo');
            const target = event.targets[0];
            const name = event.name + '_effect';
            player.markAuto(name, target);
            target.markAuto(name, player);
            player.addTip(name, '狂 ' + player.getStorage(name).map(targetx => get.translation(targetx)));
            target.addTip(name, '狂 ' + target.getStorage(name).map(targetx => get.translation(targetx)));
            target.addSkill(name);
            player.addSkill(name);
        },
        ai: {
            order: 8,
            result: {
                player: 8,
                target(player, target) {
                    return get.damageEffect(target, player, target);
                },
            },
        },
        group: 'zshy_kuangmo_point',
        subSkill: {
            point: {
                audio: 'zshy_kuangmo',
                trigger: {
                    global: 'dieAfter',
                },
                forced: true,
                lastDo: true,
                skillAnimation: 'epic',
                animationColor: 'metal',
                filter(event, player) {
                    return player.getStorage('zshy_kuangmo_effect').includes(event.player) && game.hasPlayer(current => player !== current && !player.getStorage('zshy_kuangmo_effect').includes(current));
                },
                async content(event, trigger, player) {
                    const result = await player
                        .chooseTarget(get.prompt('zshy_kuangmo'), '重新指定一名角色，你与其成为「狂」角色', lib.filter.notMe, true)
                        .set('ai', target => {
                            const player = get.player();
                            return get.damageEffect(target, player, player);
                        })
                        .forResult();
                    if (!result?.targets?.[0]?.isIn()) {
                        return;
                    }
                    const target = result.targets[0];
                    player.line(target, 'fire');
                    const name = 'zshy_kuangmo_effect';
                    player.unmarkAuto(name, trigger.player);
                    player.markAuto(name, target);
                    target.markAuto(name, player);
                    player.addTip(name, '狂 ' + player.getStorage(name).map(targetx => get.translation(targetx)));
                    target.addTip(name, '狂 ' + target.getStorage(name).map(targetx => get.translation(targetx)));
                    target.addSkill(name);
                    player.addSkill(name);
                },
            },
            effect: {
                audio: 'zshy_kuangmo',
                mark: true,
                marktext: '狂',
                intro: {
                    content: '跟$魔怔上了',
                },
                trigger: {
                    source: ['damageBegin1', 'dieAfter'],
                },
                charlotte: true,
                popup: false,
                forced: true,
                filter(event, player) {
                    return player.getStorage('zshy_kuangmo_effect').includes(event.player);
                },
                async content(event, trigger, player) {
                    if (trigger.name == 'damage') {
                        trigger.num++;
                    } else {
                        const target = trigger.player;
                        const list = get.info('zshy_duoqi').cardslist(player, target, true);
                        const cards = list[0];
                        const lose_list = list[1];
                        await game.loseAsync({ lose_list: lose_list }).setContent('chooseToCompareLose');
                        await game.delayx();
                        await player.gain(cards, 'gain2');
                    }
                },
                ai: {
                    presha: true,
                },
            },
        },
    },
    zshy_gangquan: {//罡拳
        audio: 'ext:诸神寰宇/audio/character:2',
        init(player, skill) {
            player.addSkill(skill + '_mark');
        },
        onremove(player, skill) {
            player.removeSkill(skill + '_mark');
        },
        enable: 'chooseToUse',
        filter(event, player) {
            const bool = event.zshy_gangquan,
                viewAs = bool ? { name: 'sha', nature: 'fire' } : { name: 'juedou' },
                card = get.autoViewAs(viewAs, 'unsure');
            return event.filterCard(card, player, event) && player.countCards('hes') > 0;
        },
        hiddenCard(player, name) {
            return ((name == 'juedou' || name == 'sha') && player.countCards('hes') > 0);
        },
        onChooseToUse(event) {
            if (game.online || event?.zshy_gangquan) {
                return;
            }
            const evt = get.info('dcjianying').getLastUsed(event.player);
            event.set(
                'zshy_gangquan',
                evt.cards?.some(card => card.hasGaintag('eternal_zshy_duoqi_tag'))
            );
        },
        chooseButton: {
            dialog(event, player) {
                const list = get.inpileVCardList(info => {
                    return event.zshy_gangquan ? info[2] == 'sha' && info[3] === 'fire' : info[2] == 'juedou';
                });
                const dialog = ui.create.dialog('罡拳', [list, 'vcard']);
                dialog.direct = true;
                return dialog;
            },
            check(button) {
                return get.player().getUseValue({
                    name: button.link[2],
                    nature: button?.link[3],
                });
            },
            backup(links, player) {
                return {
                    audio: 'zshy_gangquan',
                    viewAs: {
                        name: links[0][2],
                        nature: links[0][3],
                        storage: {
                            zshy_gangquan: true,
                        },
                    },
                    choice: links[0][2],
                    filterCard: true,
                    position: 'hes',
                    selectCard: 1,
                    filterTarget(card, player, target) {
                        if (get.info('zshy_gangquan_backup').choice == 'sha') {
                            if (![player.getPrevious(), player.getNext()].includes(target)) {
                                return false;
                            }
                            return lib.filter.targetEnabled.apply(this, arguments);
                        }
                        return lib.filter.filterTarget.apply(this, arguments);
                    },
                    selectTarget() {
                        return get.info('zshy_gangquan_backup').choice != 'sha' ? 1 : -1;
                    },
                    filterOk() {
                        return ui.selected.targets?.length > 0;
                    },
                    popname: true,
                };
            },
            prompt(links, player) {
                const card = `${get.translation(links[0][3]) || ''}${get.translation(links[0][2])}`;
                return `###罡拳###将一张牌当做${card}使用`;
            },
        },
        ai: {
            order: 9,
            result: {
                player: 8,
            },
        },
        subSkill: {
            backup: {},
            mark: {
                charlotte: true,
                silent: true,
                markColor: ['rgba(72, 118, 255, 1)', 'rgba(255, 69, 0, 1)'],
                init(player, skill) {
                    const evt = get.info('dcjianying').getLastUsed(player);
                    const bool = evt.cards?.some(card => card.hasGaintag('eternal_zshy_duoqi_tag'));
                    player.markSkill(skill);
                    game.broadcastAll(
                        function (index, player) {
                            const name = 'zshy_gangquan_mark';
                            const bgColor = get.info(name).markColor[index],
                                text = `<span style = 'color:#000000;font-weight:bold'>${index ? '杀' : '斗'}</span>`;
                            if (player.marks[name]) {
                                player.marks[name].firstChild.style.backgroundColor = bgColor;
                                player.marks[name].firstChild.innerHTML = text;
                            }
                            player.update();
                        },
                        Number(!!bool),
                        player
                    );
                },
                trigger: {
                    player: 'useCard1',
                },
                async content(event, trigger, player) {
                    get.info(event.name).init(player, event.name);
                },
                intro: {
                    content: '图标的文字就是【罡拳】能印的牌',
                },
            },
        },
    },

};
const 曹魏 = {
    zshy_zhimin: {//置民：【锁定技】<li>每轮开始或当你受到伤害后，你选择至多X名其他角色（X为你的体力上限），获得这些角色各自手牌中随机一张点数最小的牌。<li>当你于回合外得到牌后，你将这些牌标记为「民」。<li>当你失去「民」后，你摸X张牌。
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'roundStart',
            player: 'damageEnd',
        },
        filter(event, player) {
            return game.hasPlayer(current => current != player && current.countCards('h')) && player.getHp() > 0;
        },
        forced: true,
        async content(event, trigger, player) {
            const { targets } = await player.chooseTarget(`置民：请选择任意名其他角色`,
                '你获得这些角色各自手牌中的随机一张点数最小的牌',
                (card, player, target) => {
                    return target !== player && target.countCards('h');
                },
                [1, player.maxHp],
                true
            ).set('ai', target => {
                const player = get.player();
                return get.effect(target, { name: 'shunshou_copy', position: 'h' }, player, player) + 0.1;
            }).forResult();
            if (!targets || !targets.length) return;
            targets.sortBySeat(trigger.player);
            player.line(targets, 'thunder');
            const toGain = [];
            for (const target of targets) {
                const cards = target.getCards('h'),
                    minNumber = cards.map(card => get.number(card)).sort((a, b) => a - b)[0];
                const gainableCards = cards
                    .filter(card => {
                        return get.number(card) === minNumber && lib.filter.canBeGained(card, player, target);
                    })
                    .randomSort();
                toGain.push(gainableCards[0]);
            }
            if (toGain.length) await player.gain(toGain, 'giveAuto');
            await game.delayx();
        },
        ai: {
            threaten: 5.8,
        },
        mod: {
            aiOrder(player, card, num) {
                if (
                    num > 0 &&
                    get.itemtype(card) === 'card' &&
                    card.hasGaintag('zshy_zhimin_tag') &&
                    player.countCards('h', cardx => {
                        return cardx.hasGaintag('zshy_zhimin_tag') && cardx !== card;
                    }) < player.maxHp
                )
                    return num / 10;
            },
        },
        group: ['zshy_zhimin_mark', 'zshy_zhimin_draw'],
        subSkill: {
            mark: {
                audio: 'zshy_zhimin',
                trigger: {
                    player: 'gainAfter',
                    global: 'loseAsyncAfter',
                },
                forced: true,
                filter(event, player) {
                    if (_status.currentPhase === player || !event.getg(player).some(card => get.position(card) === 'h' && get.owner(card) === player)) return false;
                    return true;
                },
                async content(event, trigger, player) {
                    player.addGaintag(
                        trigger.getg(player).filter(card => get.position(card) === 'h' && get.owner(card) === player),
                        'zshy_zhimin_tag'
                    );
                },
            },
            draw: {
                audio: 'zshy_zhimin',
                trigger: {
                    player: 'loseAfter',
                    global: ['equipAfter', 'addJudgeAfter', 'gainAfter', 'loseAsyncAfter', 'addToExpansionAfter'],
                },
                forced: true,
                filter(event, player) {
                    const evt = event.getl(player);
                    if (!evt.hs.length) return false;
                    return Object.values(evt.gaintag_map).flat().includes('zshy_zhimin_tag');
                },
                async content(event, trigger, player) {
                    await player.draw();
                },
            },
        },
    },
    zshy_CFjujian: {//拒谏：【主公技】<li>出牌阶段限X次（X为你的体力上限），你可以令一名其他魏势力角色于本轮内使用的普通锦囊牌对你无效，然后你选择回复1点体力或摸一张牌。
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        usable(event, player) {
            return player.maxHp;
        },
        zhuSkill: true,
        filter(event, player) {
            return game.hasPlayer(current => {
                return player.hasZhuSkill('zshy_CFjujian', current) && current.group === 'wei' && current !== player && !current.hasSkill('zshy_CFjujian_forbid');
            });
        },
        filterTarget(_, player, target) {
            return player.hasZhuSkill('zshy_CFjujian', target) && target.group === 'wei' && target !== player && !target.hasSkill('zshy_CFjujian_forbid');
        },
        selectTarget: [1, Infinity],
        content() {
            target.addTempSkill('zshy_CFjujian_forbid', 'roundStart');
            target.markAuto('zshy_CFjujian_forbid', player);
        },
        contentAfter() {
            player.chooseDrawRecover(true);
        },
        ai: {
            result: {
                target(player, target) {
                    const num = target.countCards('hs', card => {
                        return get.type(card) == 'trick' && target.canUse(card, player) && get.effect(player, card, target, player) < -2;
                    }),
                        att = get.attitude(player, target);
                    if (att < 0) return -0.74 * num;
                    return 1.5;
                },
            },
        },
        subSkill: {
            forbid: {
                audio: 'zshy_CFjujian',
                trigger: {
                    player: 'useCardToBefore',
                },
                filter(event, player) {
                    if (get.type(event.card) !== 'trick') return false;
                    return player.getStorage('zshy_CFjujian_forbid').includes(event.target);
                },
                forced: true,
                charlotte: true,
                onremove: true,
                direct: true,
                async content(event, trigger, player) {
                    await trigger.target.logSkill('zshy_CFjujian_forbid', player);
                    trigger.cancel();
                },
                intro: {
                    content: '使用普通锦囊牌对$无效',
                },
                ai: {
                    effect: {
                        player(card, player, target, current) {
                            if (get.type(card) == 'trick' && player.getStorage('zshy_CFjujian_forbid').includes(target)) return 'zeroplayertarget';
                        },
                    },
                },
            },
        },
    },

    //墟曹金玉
    zshy_yuqi: {//隅泣
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: 'damageEnd' },
        getInfo(player) {
            if (!player.storage.zshy_yuqi) {
                player.storage.zshy_yuqi = [0, 3, 1, 1];
            }
            return player.storage.zshy_yuqi;
        },
        filter(event, player) {
            var list = lib.skill.zshy_yuqi.getInfo(player);
            return event.player.isIn() && get.distance(player, event.player) <= list[0];
        },
        logTarget: 'player',
        content() {
            'step 0';
            event.list = lib.skill.zshy_yuqi.getInfo(player);
            var cards = get.cards(event.list[1]);
            event.cards = cards;
            game.cardsGotoOrdering(cards);
            var next = player.chooseToMove_new(true, '隅泣');
            next.set('list', [
                ['牌堆顶的牌', cards],
                [['交给' + get.translation(trigger.player) + '<div class="text center">至少一张' + (event.list[2] > 1 ? '<br>至多' + get.cnNumber(event.list[2]) + '张' : '') + '</div>'], ['交给自己<div class="text center">至多' + get.cnNumber(event.list[3]) + '张</div>']],
            ]);
            next.set('filterMove', function (from, to, moved) {
                var info = lib.skill.zshy_yuqi.getInfo(_status.event.player);
                if (to == 1) {
                    return moved[1].length < info[2];
                }
                if (to == 2) {
                    return moved[2].length < info[3];
                }
                return true;
            });
            next.set('processAI', function (list) {
                var cards = list[0][1].slice(0).sort(function (a, b) {
                    return get.value(b, 'raw') - get.value(a, 'raw');
                }),
                    player = _status.event.player,
                    target = _status.event.getTrigger().player;
                var info = lib.skill.zshy_yuqi.getInfo(_status.event.player);
                var cards1 = cards.splice(0, Math.min(info[3], cards.length - 1));
                var card2;
                if (get.attitude(player, target) > 0) {
                    card2 = cards.shift();
                } else {
                    card2 = cards.pop();
                }
                return [cards, [card2], cards1];
            });
            next.set('filterOk', function (moved) {
                return moved[1].length > 0;
            });
            'step 1';
            if (result.bool) {
                var moved = result.moved;
                cards.removeArray(moved[1]);
                cards.removeArray(moved[2]);
                while (cards.length) {
                    ui.cardPile.insertBefore(cards.pop().fix(), ui.cardPile.firstChild);
                }
                var list = [[trigger.player, moved[1]]];
                if (moved[2].length) {
                    list.push([player, moved[2]]);
                }
                game.loseAsync({
                    gain_list: list,
                    giver: player,
                    animate: 'draw',
                }).setContent('gaincardMultiple');
            }
        },
        mark: true,
        intro: {
            content(storage, player) {
                var info = lib.skill.zshy_yuqi.getInfo(player);
                return '<div class="text center"><span class=thundertext>蓝色：' + info[0] + '</span>　<span class=firetext>红色：' + info[1] + '</span><br><span class=greentext>绿色：' + info[2] + '</span>　<span class=yellowtext>黄色：' + info[3] + '</span></div>';
            },
        },
        ai: {
            threaten: 8.8,
        },
        init(player, skill) {
            const list = lib.skill.zshy_yuqi.getInfo(player);
            player.addTip(skill, get.translation(skill) + ' ' + list.slice().join(' '));
        },
        onremove: (player, skill) => player.removeTip(skill),
    },
    zshy_shanshen: {//善身
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: ['die', 'roundStart'], },
        direct: true,
        content() {
            'step 0';
            var list = lib.skill.zshy_yuqi.getInfo(player);
            player
                .chooseControl('<span class=thundertext>蓝色(' + list[0] + ')</span>', '<span class=firetext>红色(' + list[1] + ')</span>', '<span class=greentext>绿色(' + list[2] + ')</span>', '<span class=yellowtext>黄色(' + list[3] + ')</span>', 'cancel2')
                .set('prompt', get.prompt('zshy_shanshen'))
                .set('prompt2', '令〖隅泣〗中的一个数字+2并回复1点体力')
                .set('ai', function () {
                    var player = _status.event.player,
                        info = lib.skill.zshy_yuqi.getInfo(player);
                    if (
                        info[0] < info[3] &&
                        game.countPlayer(function (current) {
                            return get.distance(player, current) <= info[0];
                        }) < Math.min(3, game.countPlayer())
                    ) {
                        return 0;
                    }
                    if (info[3] < info[1] - 1) {
                        return 3;
                    }
                    if (info[1] < 5) {
                        return 1;
                    }
                    if (
                        info[0] < 5 &&
                        game.hasPlayer(function (current) {
                            return current != player && get.distance(player, current) > info[0];
                        })
                    ) {
                        return 0;
                    }
                    return [0, 1, 2, 3].randomGet();
                });
            'step 1';
            if (result.control != 'cancel2') {
                player.logSkill('zshy_shanshen', trigger.player);
                var list = lib.skill.zshy_yuqi.getInfo(player);
                list[result.index] = list[result.index] + 2;
                game.log(player, '将', result.control, '数字改为', '#y' + list[result.index]);
                player.markSkill('zshy_yuqi');
                lib.skill.zshy_yuqi.init(player, 'zshy_yuqi');
                player.recover();
            }
        },
        ai: {
            combo: 'zshy_yuqi',
        },
    },
    zshy_xianjing: {//娴静
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: 'phaseZhunbeiBegin' },
        direct: true,
        content() {
            'step 0';
            var list = lib.skill.zshy_yuqi.getInfo(player);
            player.chooseControl('<span class=thundertext>蓝色(' + list[0] + ')</span>', '<span class=firetext>红色(' + list[1] + ')</span>', '<span class=greentext>绿色(' + list[2] + ')</span>', '<span class=yellowtext>黄色(' + list[3] + ')</span>', 'cancel2')
                .set('prompt', get.prompt('zshy_xianjing'))
                .set('prompt2', '令〖隅泣〗中的一个数字+1')
                .set('ai', function () {
                    var player = _status.event.player,
                        info = lib.skill.zshy_yuqi.getInfo(player);
                    if (info[0] < info[3] && game.countPlayer(function (current) {
                        return get.distance(player, current) <= info[0];
                    }) < Math.min(3, game.countPlayer())) {
                        return 0;
                    }
                    if (info[3] < info[1] - 1) {
                        return 3;
                    }
                    if (info[1] < 5) {
                        return 1;
                    }
                    if (info[0] < 5 && game.hasPlayer(function (current) {
                        return current != player && get.distance(player, current) > info[0];
                    })) {
                        return 0;
                    }
                    return [0, 1, 2, 3].randomGet();
                });
            'step 1';
            if (result.control != 'cancel2') {
                player.logSkill('zshy_xianjing');
                var list = lib.skill.zshy_yuqi.getInfo(player);
                list[result.index] = list[result.index] + 1;
                game.log(player, '将', result.control, '数字改为', '#y' + list[result.index]);
                player.markSkill('zshy_yuqi');
                lib.skill.zshy_yuqi.init(player, 'zshy_yuqi');
                player.recover();
            }
        },
        ai: {
            combo: 'zshy_yuqi',
        },
    },

    //墟曹髦
    zshy_qianlong: {//潜龙
        audio: 'ext:诸神寰宇/audio/character:6',
        persevereSkill: true,
        trigger: {
            player: ['zshy_qianlong_beginAfter', 'zshy_qianlong_addAfter', 'zshy_weitongAfter'],
        },
        filter(event, player) {
            let skills = [];
            let current = player.additionalSkills?.zshy_qianlong?.length ?? 0;
            let target = player.countMark('zshy_qianlong') == lib.skill.zshy_qianlong.maxMarkCount ? lib.skill.zshy_qianlong.derivation.length : Math.floor(player.countMark('zshy_qianlong') / 25);
            return target > current;
        },
        forced: true,
        popup: false,
        locked: false,
        beginMarkCount: 25,
        maxMarkCount: 100,
        derivation: ['zshy_qingzheng', 'zshy_jiushi', 'zshy_fangzhu', 'zshy_juejin'],
        addMark(player, num) {
            num = Math.min(num, lib.skill.zshy_qianlong.maxMarkCount - player.countMark('zshy_qianlong'));
            player.addMark('zshy_qianlong', num);
        },
        group: ['zshy_qianlong_begin', 'zshy_qianlong_add', 'zshy_qianlong_die'],
        async content(event, trigger, player) {
            const derivation = lib.skill.zshy_qianlong.derivation,
                skills = player.countMark('zshy_qianlong') == lib.skill.zshy_qianlong.maxMarkCount ? derivation : derivation.slice(0, Math.floor(player.countMark('zshy_qianlong') / 25));
            player.addAdditionalSkill('zshy_qianlong', skills);
        },
        marktext: '道',
        intro: {
            name: '道心(潜龙)',
            name2: '道心',
            content: '当前道心数为#',
        },
        subSkill: {
            begin: {
                audio: 'zshy_qianlong',
                persevereSkill: true,
                trigger: {
                    global: 'phaseBefore',
                    player: 'enterGame',
                },
                filter(event, player) {
                    return event.name != 'phase' || game.phaseNumber == 0;
                },
                forced: true,
                locked: false,
                async content(event, trigger, player) {
                    const num = game.hasPlayer(current => {
                        return current !== player && current.group === 'wei' && player.hasZhuSkill('zshy_weitong', current);
                    }) ? 100 : lib.skill.zshy_qianlong.beginMarkCount;
                    lib.skill.zshy_qianlong.addMark(player, num);
                },
            },
            add: {
                audio: 'zshy_qianlong',
                persevereSkill: true,
                trigger: {
                    player: ['gainAfter', 'damageEnd'],
                    source: 'damageSource',
                    global: 'loseAsyncAfter',
                },
                filter(event, player) {
                    if (player.countMark('zshy_qianlong') >= lib.skill.zshy_qianlong.maxMarkCount) return false;
                    if (event.name === 'damage') return event.num > 0;
                    return event.getg(player).length > 0;
                },
                getIndex(event, player, triggername) {
                    if (event.name === 'damage') return event.num;
                    return 1;
                },
                forced: true,
                locked: false,
                async content(event, trigger, player) {
                    let toAdd = 5 + 5 * (1 + (trigger.name === 'damage') + (event.triggername === 'damageSource'));
                    lib.skill.zshy_qianlong.addMark(player, toAdd);
                },
            },
            die: {
                trigger: {
                    player: 'dieBefore',
                },
                charlotte: true,
                firstDo: true,
                forced: true,
                popup: false,
                forceDie: true,
                async content(event, trigger, player) {
                    player.changeSkin({ characterName: 'zshy_AAZZcaomaoLXXH' }, 'zshy_AAZZcaomaoLXXH_dead');
                },
            },
        },
    },
    zshy_weitong: {//卫统
        audio: 'ext:诸神寰宇/audio/character:1',
        persevereSkill: true,
        zhuSkill: true,
        trigger: {
            player: 'zshy_qianlong_beginBegin',
        },
        forced: true,
        locked: false,
        content() { },
        ai: {
            combo: 'zshy_qianlong',
        },
    },
    zshy_qingzheng: {//清正
        audio: 'ext:诸神寰宇/audio/character:2',
        persevereSkill: true,
        trigger: { player: 'phaseUseBegin' },
        filter(event, player) {
            return player.countCards('h') > 0;
        },
        direct: true,
        async content(event, trigger, player) {
            await Promise.all(event.next);
            event.videoId = lib.status.videoId++;
            if (player.isUnderControl()) game.swapPlayerAuto(player);
            /**
             * player选择target的一种花色的牌
             * @param {Player} player
             * @param {Player} target
             */
            function chooseOneSuitCard(player, target, force = false, limit, str = '请选择一个花色的牌', ai = { bool: false }) {
                const { promise, resolve } = Promise.withResolvers();
                const event = _status.event;
                event.selectedCards = [];
                event.selectedButtons = [];
                //对手牌按花色分类
                let suitCards = Object.groupBy(target.getCards('h'), c => get.suit(c, target));
                suitCards.heart ??= [];
                suitCards.diamond ??= [];
                suitCards.spade ??= [];
                suitCards.club ??= [];
                let dialog = (event.dialog = ui.create.dialog());
                dialog.classList.add('fullheight');
                event.control_ok = ui.create.control('ok', link => {
                    _status.imchoosing = false;
                    event.dialog.close();
                    event.control_ok?.close();
                    event.control_cancel?.close();
                    event._result = {
                        bool: true,
                        cards: event.selectedCards,
                    };
                    resolve(event._result);
                    game.resume();
                });
                event.control_ok.classList.add('disabled');
                //如果是非强制的，才创建取消按钮
                if (!force) {
                    event.control_cancel = ui.create.control('cancel', link => {
                        _status.imchoosing = false;
                        event.dialog.close();
                        event.control_ok?.close();
                        event.control_cancel?.close();
                        event._result = {
                            bool: false,
                        };
                        resolve(event._result);
                        game.resume();
                    });
                }
                event.switchToAuto = function () {
                    _status.imchoosing = false;
                    event.dialog?.close();
                    event.control_ok?.close();
                    event.control_cancel?.close();
                    event._result = ai();
                    resolve(event._result);
                    game.resume();
                };
                dialog.addNewRow(str);
                let keys = Object.keys(suitCards).sort((a, b) => {
                    let arr = ['spade', 'heart', 'club', 'diamond', 'none'];
                    return arr.indexOf(a) - arr.indexOf(b);
                });
                //添加框
                while (keys.length) {
                    let key1 = keys.shift();
                    let cards1 = suitCards[key1];
                    let key2 = keys.shift();
                    let cards2 = suitCards[key2];
                    //点击容器的回调
                    /**@type {Row_Item_Option['clickItemContainer']} */
                    const clickItemContainer = function (container, item, allContainer) {
                        if (!item?.length || item.some(card => !lib.filter.cardDiscardable(card, player, event.name))) return;
                        if (event.selectedButtons.includes(container)) {
                            container.classList.remove('selected');
                            event.selectedButtons.remove(container);
                            event.selectedCards.removeArray(item);
                        } else {
                            if (event.selectedButtons.length >= limit) {
                                let precontainer = event.selectedButtons[0];
                                precontainer.classList.remove('selected');
                                event.selectedButtons.remove(precontainer);
                                let suit = get.suit(event.selectedCards[0], target),
                                    cards = target.getCards('h', { suit: suit });
                                event.selectedCards.removeArray(cards);
                            }
                            container.classList.add('selected');
                            event.selectedButtons.add(container);
                            event.selectedCards.addArray(item);
                        }
                        event.control_ok.classList[event.selectedButtons.length === limit ? 'remove' : 'add']('disabled');
                    };
                    //给框加封条，显示xxx牌多少张
                    function createCustom(suit, count) {
                        return function (itemContainer) {
                            function formatStr(str) {
                                return str.replace(/[♥︎方块︎]/g, '<span style="color: red; ">$&</span>');
                            }
                            let div = ui.create.div(itemContainer);
                            if (count) {
                                div.innerHTML = formatStr(`${get.translation(suit)}牌${count}张`);
                            } else {
                                div.innerHTML = formatStr(`没有${get.translation(suit)}牌`);
                            }
                            div.css({
                                position: 'absolute',
                                width: '100%',
                                bottom: '1%',
                                height: '35%',
                                background: '#352929bf',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                fontSize: '1.2em',
                                zIndex: '2',
                            });
                        };
                    }
                    //框的样式，不要太宽，高度最小也要100px，防止空框没有高度
                    /**@type {Row_Item_Option['itemContainerCss']} */
                    let itemContainerCss = {
                        border: 'solid #c6b3b3 2px',
                        minHeight: '100px',
                    };
                    if (key2) {
                        dialog.addNewRow(
                            {
                                item: cards1,
                                ItemNoclick: true, //卡牌不需要被点击
                                clickItemContainer,
                                custom: createCustom(key1, cards1.length), //添加封条
                                itemContainerCss,
                            },
                            {
                                item: cards2,
                                ItemNoclick: true, //卡牌不需要被点击
                                clickItemContainer,
                                custom: createCustom(key2, cards2.length),
                                itemContainerCss,
                            }
                        );
                    } else {
                        dialog.addNewRow({
                            item: cards1,
                            ItemNoclick: true, //卡牌不需要被点击
                            clickItemContainer,
                            custom: createCustom(key1, cards1.length),
                            itemContainerCss,
                        });
                    }
                }
                game.pause();
                dialog.open();
                _status.imchoosing = true;
                return promise;
            }
            let result2 = await player.chooseTarget('清正：观看一名其他角色的手牌并弃置其中一种花色的所有牌', (card, player, target) => {
                return target != player && target.countCards('h');
            }).set('ai', target => {
                var player = _status.event.player,
                    att = get.attitude(player, target);
                if (att >= 0) return 0;
                return 1 - att / 2 + Math.sqrt(target.countCards('h'));
            }).forResult();
            if (!result2.bool) return;
            let target = result2.targets[0];
            player.logSkill(event.name, target);
            let next2, str2 = `清正：弃置${get.translation(target)}一种花色的所有牌`;
            let ai2 = function () {
                let list = lib.suits.slice().filter(i => target.hasCard({ suit: i }, 'h'));
                let getv = cards => cards.map(i => get.value(i)).reduce((p, c) => p + c, 0);
                return {
                    bool: true,
                    cards: target.getCards('h', {
                        suit: list.sort((a, b) => {
                            return getv(target.getCards('h', { suit: b })) - getv(target.getCards('h', { suit: a }));
                        })[0],
                    }),
                };
            };
            if (event.isMine()) {
                next2 = chooseOneSuitCard(player, target, true, 1, str2, ai2);
            } else if (player.isOnline()) {
                let { promise, resolve } = Promise.withResolvers();
                player.send(chooseOneSuitCard, player, target, true, 1, str2, ai2);
                player.wait(result => {
                    if (result == 'ai') result = ai2();
                    resolve(result);
                });
                next2 = promise;
            } else next2 = Promise.resolve(ai2());
            let result3 = await next2;
            let cards2 = result3.cards.slice().filter(card => lib.filter.canBeDiscarded(card, player, target));
            if (cards2.length) await target.discard(cards2, 'notBySelf');
            await target.damage(player);
        },
    },
    zshy_juejin: {//决进：【持恒技||限定技】<li>出牌阶段，你可以令所有角色依次将体力调整至1并获得X点护甲（X为一名角色以此法变化的体力值且你以此法获得的护甲数额外+你的体力上限）。然后你将牌堆、弃牌堆、场上及所有角色手牌中的【闪】、【桃】和【酒】移出游戏且增加如下“向死存魏”的全局技能：当有牌进入弃牌堆后，系统将这些牌中的【闪】、【桃】和【酒】移出游戏。
        audio: 'ext:诸神寰宇/audio/character:2',
        persevereSkill: true,
        enable: 'phaseUse',
        limited: true,
        skillAnimation: true,
        animationColor: 'thunder',
        filterCard: () => false,
        selectCard: [-1, -2],
        filterTarget: true,
        selectTarget: -1,
        multiline: true,
        async contentBefore(event, trigger, player) {
            //player.setAvatar('zshy_AAZZcaomaoLXXH', 'zshy_AAZZcaomaoLXXH_shadow', false);
            player.changeSkin({ characterName: 'zshy_AAZZcaomaoLXXH' }, 'zshy_AAZZcaomaoLXXH_shadow');
            player.awakenSkill(event.skill);
        },
        async content(event, trigger, player) {
            const target = event.target;
            const delt = target.getHp(true) - 1,
                num = Math.abs(delt);
            if (delt != 0) {
                if (delt > 0) {
                    const next = target.changeHp(-delt);
                    next._triggered = null;
                    await next;
                } else await target.recover(num);
            }
            if (num > 0) await target.changeHujia(num + (player == target ? player.maxHp : 0));
            else if (player == target) await target.changeHujia(player.maxHp);
        },
        async contentAfter(event, trigger, player) {
            game.addGlobalSkill('zshy_juejin_xiangsicunwei');
            player.$fullscreenpop('向死存魏！', 'thunder');
            const cards = ['cardPile', 'discardPile'].map(pos => Array.from(ui[pos].childNodes)).flat();
            const filter = card => ['shan', 'tao', 'jiu'].includes(card.name);
            const cardx = cards.filter(filter);
            if (cardx.length) {
                await game.cardsGotoSpecial(cardx);
                game.log(cardx, '被移出了游戏');
            }
            for (const target of game.filterPlayer()) {
                const sishis = target.getCards('hej', filter);
                if (sishis.length) {
                    target.$throw(sishis);
                    game.log(sishis, '被移出了游戏');
                    await target.lose(sishis, ui.special);
                }
            }
        },
        ai: {
            order: 0.1,
            result: {
                player(player) {
                    let eff = 1;
                    game.countPlayer(current => {
                        const att = get.attitude(player, current),
                            num = Math.abs(current.getHp(true) - 1);
                        const delt = Math.max(0, num + current.hujia - 5);
                        eff -= att * delt;
                    });
                    return eff > 0 ? 1 : 0;
                },
            },
        },
        subSkill: {
            xiangsicunwei: {
                trigger: {
                    global: ['loseAfter', 'equipAfter', 'loseAsyncAfter', 'cardsDiscardAfter'],
                },
                forced: true,
                silent: true,
                firstDo: true,
                filter(event, player) {
                    const nameList = ['shan', 'tao', 'jiu'];
                    return event.getd().some(card => {
                        return nameList.includes(get.name(card, false)) && get.position(card, true) === 'd';
                    });
                },
                async content(event, trigger, player) {
                    const nameList = ['shan', 'tao', 'jiu'];
                    const cards = trigger.getd().filter(card => {
                        return nameList.includes(get.name(card, false)) && get.position(card, true) === 'd';
                    });
                    await game.cardsGotoSpecial(cards);
                    game.log(cards, '被移出了游戏');
                },
            },
        },
    },

    //墟杜夫人
    zshy_yise: {//异色
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'gainAfter',
            player: 'loseAsyncAfter',
        },
        filter(event, player) {
            if (event.name == 'loseAsync') {
                if (event.type != 'gain') {
                    return false;
                }
            }
            var cards = event.getl(player).cards2;
            return game.hasPlayer(function (current) {
                if (current == player) {
                    return false;
                }
                var cardsx = event.getg(current);
                for (var i of cardsx) {
                    if (cards.includes(i)) {
                        if (current.isDamaged()) {
                            return true;
                        }
                        return get.color(i, player) == 'black';
                    }
                }
                return false;
            });
        },
        direct: true,
        content() {
            'step 0';
            var cards = trigger.getl(player).cards2;
            event.cards = cards;
            event.targets = game.filterPlayer(function (current) {
                if (current == player) {
                    return false;
                }
                var cardsx = trigger.getg(current);
                for (var i of cardsx) {
                    if (cards.includes(i)) {
                        return true;
                    }
                }
                return false;
            }).sortBySeat();
            if (!event.targets.length) {
                event.finish();
            }
            'step 1';
            var target = targets.shift();
            var cardsx = trigger.getg(target);
            var goon = false;
            for (var i of cardsx) {
                if (cards.includes(i)) {
                    if (target.isDamaged() || get.color(i, player) == 'black') {
                        goon = true;
                        break;
                    }
                }
            }
            if (goon) {
                var next = game.createEvent('zshy_yise_insert');
                next.player = player;
                next.target = target;
                next.cards = cardsx;
                next.setContent(lib.skill.zshy_yise.contentx);
            }
            if (targets.length > 0) {
                event.redo();
            }
        },
        contentx() {
            'step 0';
            for (var i of cards) {
                event[get.color(i, player)] = true;
                if (event.red && event.black) {
                    break;
                }
            }
            if (event.red && target.isDamaged()) {
                player.chooseBool(get.prompt('zshy_yise', target), '令' + get.translation(target) + '回复1点体力').set('ai', () => get.recoverEffect(_status.event.getParent().target, _status.event.player, _status.event.player) > 0);
            }
            'step 1';
            if (event.black || (event.red && result.bool)) {
                player.logSkill('zshy_yise', target);
            }
            if (event.red && result.bool) {
                target.recover();
            }
            if (event.black) {
                target.addMark('zshy_yise_damage', 1, false);
                target.addSkill('zshy_yise_damage');
            }
        },
        subSkill: {
            damage: {
                trigger: { player: 'damageBegin1' },
                forced: true,
                charlotte: true,
                onremove: true,
                content() {
                    trigger.num += player.countMark('zshy_yise_damage');
                    player.removeSkill('zshy_yise_damage');
                },
                intro: {
                    content: '下一次受到的伤害+#',
                },
            },
        },
    },
    zshy_shunshi: {//顺世
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: ['damageEnd', 'phaseZhunbeiBegin'] },
        direct: true,
        filter(event, player) {
            return game.hasPlayer(function (current) {
                return current != player;
            });
        },
        content() {
            'step 0'
            player.draw();
            'step 1';
            player.chooseCardTarget({
                prompt: get.prompt('zshy_shunshi'),
                prompt2: '将一张牌交给一名其他角色，并获得+1效果',
                filterCard: true,
                filterTarget(card, player, target) {
                    return target != player;
                },
                position: 'he',
                source: trigger.source,
                ai1(card) {
                    var player = _status.event.player;
                    if (player.hasSkill('zshy_yise')) {
                        if (
                            get.color(card, player) == 'red' &&
                            game.hasPlayer(function (current) {
                                return current != player && current != _status.event.source && current.isDamaged() && get.recoverEffect(current, player, player) > 0;
                            })
                        ) {
                            return 10 - get.value(card);
                        }
                        if (get.color(card, player) == 'black') {
                            return 4 - get.value(card);
                        }
                    }
                    return 8 - get.value(card);
                },
                ai2(target) {
                    var player = _status.event.player,
                        card = ui.selected.cards[0];
                    if (player.hasSkill('zshy_yise')) {
                        if (get.color(card) == 'red' && target.isDamaged()) {
                            return 2 * get.recoverEffect(target, player, player);
                        }
                        if (get.color(card) == 'black') {
                            return -get.attitude(player, target);
                        }
                    }
                    if (get.value(card, target) < 0) {
                        return -get.attitude(player, target);
                    }
                    if (get.value(card, target) < 1) {
                        return 0.01 * -get.attitude(player, target);
                    }
                    return Math.max(1, get.value(card, target) - get.value(card, player)) * get.attitude(player, target);
                },
            });
            'step 2';
            if (result.bool) {
                let target = result.targets[0];
                player.logSkill('zshy_shunshi', target);
                player.give(result.cards, target);
                player.addMark('zshy_shunshi_mark', 1, false);
                player.addSkill('zshy_shunshi_mark');
            }
        },
        getIndex(event, player, triggername) {
            if (event.name == 'damage') return event.num;
            return 1;
        },
        subSkill: {
            mark: {
                onremove: true,
                trigger: { player: 'phaseDrawBegin2' },
                forced: true,
                charlotte: true,
                popup: false,
                filter(event, player) {
                    return !event.numFixed;
                },
                content() {
                    trigger.num += player.countMark('zshy_shunshi_mark');
                },
                mod: {
                    maxHandcard(player, num) {
                        return num + player.countMark('zshy_shunshi_mark');
                    },
                    cardUsable(card, player, num) {
                        if (card.name == 'sha') {
                            return num + player.countMark('zshy_shunshi_mark');
                        }
                    },
                },
                intro: {
                    content: '拥有#层效果',
                },
            },
        },
    },

    //墟司马昭
    zshy_xiezheng: {//挟征
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AAZZsimazhaoLXXH_shadow: 'zshy_xiezheng_zshy_AAZZsimazhaoLXXH_shadow',
        },
        trigger: {
            global: ['phaseJieshuBegin'],
        },
        direct: true,
        filter(event, player) {
            return game.countPlayer(function (target) {
                return target.countCards('h') > 0 && target != player;
            }) > 0;
        },
        async content(event, trigger, player) {
            const str = '选择一名其他角色并将其手牌中所有【杀】置于牌堆顶，若其因此失去牌，则你视为使用一张【兵临城下】，否则你观看并获得其至多两张牌';
            const result = await player.chooseTarget(get.prompt('zshy_xiezheng'), str, [1, 3], function (card, player, target) {
                return target != player && target.countCards('h') > 0;
            }).set('ai', function (target) {
                return get.attitude(_status.event.player, target) < 0;
            }).forResult();
            if (result && result.targets) {
                player.logSkill('zshy_xiezheng', result.targets);
                const name = 'sha';
                let blcx = false;
                for (const i of result.targets) {
                    const cards = i.getCards('h', { name });
                    if (cards.length == 0) {
                        await player.gainPlayerCard(i, 'he', [1, 2], true, 'visible');
                    } else {
                        i.$throw(1, 1000);
                        game.log(i, '将', '#y所有【杀】', '置于了牌堆顶');
                        await i.lose(cards, ui.cardPile, 'insert');
                        blcx = true;
                    }
                };
                game.updateRoundNumber();
                if (blcx = true) {
                    const card = { name: 'binglinchengxiax', isCard: true, zshy_xiezheng: true };
                    if (player.hasUseTarget(card)) {
                        await player.chooseUseTarget(card, true);
                    };
                    if (!game.hasPlayer2(current => {
                        return current.hasHistory('damage', evt => evt.getParent(card.name)?.card?.zshy_xiezheng);
                    })) {
                        await player.damage();
                    }
                };
            }
        },
        subSkill: {
            zshy_AAZZsimazhaoLXXH_shadow: { audio: 'ext:诸神寰宇/audio/character:2' },
        }
    },
    zshy_qiantun: {//谦吞
        audio: 'ext:诸神寰宇/audio/character:4',
        enable: 'phaseUse',
        groupSkill: 'wei',
        usable: 1,
        filterTarget(card, player, target) {
            return player.canCompare(target) && target.countCards('h') && target != player;
        },
        filter(event, player) {
            return player.group === 'wei' && game.hasPlayer(target => get.info('zshy_qiantun').filterTarget(null, player, target));
        },
        prompt: '出牌阶段限1次，你可令一名其他角色展示至少一张手牌，然后你与其进行拼点，其本次拼点牌只能从展示牌中选择：你赢，则你获得其展示牌，否则你获得其未展示牌。最后你展示手牌。',
        async content(event, trigger, player) {
            const target = event.target,
                cards = target.getCards('h').sort((a, b) => get.number(a, target) - get.number(b, target));
            const result = await target
                .chooseCard('展示任意张手牌，只能用这些牌拼点', [1, Infinity], 'h', true)
                .set('maxNum', get.number(cards[cards.length - 1], target))
                .set('minNum', get.number(cards[0], target))
                .set('ai', card => {
                    const { player, maxNum, minNum } = get.event();
                    if (maxNum > 12) {
                        return 2;
                    }
                    if (minNum < 2) {
                        if (get.number(card, player) == minNum) {
                            return 2;
                        }
                        return 0;
                    }
                    if ([minNum, maxNum].some(num => get.number(card, player) == num)) {
                        return 1;
                    }
                    return Math.random() - 0.5;
                })
                .forResult();
            if (!result.bool) {
                return;
            }
            await target.showCards(result.cards);
            target.addGaintag(result.cards, 'zshy_qiantun_tag');
            const next = player.chooseToCompare(target);
            next.set('filterCard', (card, player) => {
                const bool = cardx => cardx.hasGaintag('zshy_qiantun_tag');
                return !player?.countCards('h', bool) || bool(card);
            });
            if (target.countCards('h') + 1 > result.cards.length * 2) {
                next.set('small', true);
            }
            const result3 = await next.forResult();
            target.removeGaintag('zshy_qiantun_tag');
            if (result3.winner == player) {
                player.logSkill('zshy_qiantun', [target], null, null, [3]);
                const cards = target.getCards('h', card => result.cards.includes(card));
                if (cards.length) {
                    const result2 = cards.length > 2 ? await player
                        .chooseButton([get.translation(event.name) + '：请选择你要获得的牌', cards], [1, Infinity], true)
                        .set('ai', button => get.value(button.link))
                        .forResult() : { bool: true, links: cards };
                    if (result2?.bool && result2.links?.length) {
                        await target.give(result2.links, player);
                    }
                }
            } else {
                player.logSkill('zshy_qiantun', [target], null, null, [4]);
                const cards = target.getCards('h', card => !result.cards.includes(card));
                if (cards.length) {
                    const result2 = cards.length > 2 ? await player.chooseButton(
                        [get.translation(event.name) + '：请选择你要获得的牌', (() => {
                            if (player.hasSkillTag('viewHandcard', null, target, true)) {
                                return cards;
                            }
                            return [cards.slice().randomSort(), 'blank'];
                        })(),], [1, Infinity], true).set('ai', button => get.value(button.link)).forResult()
                        : { bool: true, links: cards };
                    if (result2?.bool && result2.links?.length) {
                        await target.give(result2.links, player);
                    }
                }
            }
            await player.showHandcards(get.translation(player) + '发动了〖谦吞〗');
        },
        ai: {
            order: 8,
            result: {
                target: -1,
            },
        },
    },
    zshy_zhaoxiong: {//昭凶
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: ['damageEnd'] },
        frequent: true,
        limited: true,
        persevereSkill: true,
        skillAnimation: true,
        animationColor: 'thunder',
        mark: true,
        intro: { content: 'limited' },
        init: (player, skill) => (player.storage[skill] = false),
        derivation: 'zshy_dangyi',
        async content(event, trigger, player) {
            player.awakenSkill(event.name);
            player.changeSkin({ characterName: 'zshy_AAZZsimazhaoLXXH' }, 'zshy_AAZZsimazhaoLXXH_shadow');
            await player.changeGroup('jin');
            await player.addSkills('zshy_dangyi');
        },
        ai: {
            combo: 'zshy_xiezheng',
        },
    },
    zshy_weisi: {//威肆
        audio: 'ext:诸神寰宇/audio/character:3',
        enable: 'phaseUse',
        usable: 1,
        filterTarget(card, player, target) {
            return target != player;
        },
        filter(event, player) {
            return player.group === 'jin' && game.hasPlayer(target => get.info('zshy_weisi').filterTarget(null, player, target));
        },
        groupSkill: 'jin',
        prompt: '出牌阶段限1次，你可选择一名其他角色，令其将任意张手牌移出游戏直到回合结束，然后视为对其使用一张【决斗】；此牌对其造成伤害后，你获得其所有手牌。',
        async content(event, trigger, player) {
            const { target } = event;
            if (target.countCards('h')) {
                const result = await target.chooseCard('将任意张手牌移出游戏直到本回合结束', [1, Infinity], 'h')
                    .set('ai', card => {
                        const { numx, player } = get.event();
                        if (player.countCards('h', 'sha') <= numx) {
                            return 9;
                        }
                        if (get.name(card, player) == 'sha') {
                            return 0;
                        }
                        return 5;
                    }).set('numx', player.countCards('h') / 4).forResult();
                if (result.bool) {
                    const next = target.addToExpansion(result.cards, 'giveAuto', target);
                    next.gaintag.add('zshy_weisi');
                    await next;
                    target.when({
                        global: ['phaseBefore', 'phaseAfter'],
                    }).then(() => {
                        const cards = player.getExpansions('zshy_weisi');
                        if (cards.length) {
                            player.gain(cards, 'draw');
                            game.log(player, '收回了' + get.cnNumber(cards.length) + '张“威肆”牌');
                        }
                    });
                }
            }
            const card = { name: 'juedou', isCard: true };
            player.when({ source: 'damageSource', })
                .filter(evt => evt.getParent(event.name) == event)
                .then(() => {
                    const cards = trigger.player.getCards('h');
                    if (cards.length) {
                        player.logSkill('zshy_weisi', [trigger.player], null, null, [3]);
                        player.gainPlayerCard(trigger.player, 'h', true);
                    }
                });
            if (player.canUse(card, target)) {
                await player.useCard(card, target);
            }
        },
        intro: {
            markcount: 'expansion',
            mark(dialog, storage, player) {
                var cards = player.getExpansions('zshy_weisi');
                if (player.isUnderControl(true)) {
                    dialog.addAuto(cards);
                } else {
                    return '共有' + get.cnNumber(cards.length) + '张牌';
                }
            },
        },
        ai: {
            order: 9,
            result: {
                target: -1,
            },
        },
    },
    zshy_dangyi: {//荡异
        audio: 'ext:诸神寰宇/audio/character:2',
        persevereSkill: true,
        zhuSkill: true,
        forced: true,
        trigger: {
            source: 'damageBegin1',
        },
        async content(event, trigger, player) {
            trigger.num += player.getDamagedHp() + 1;
        },
    },

    //墟钟毓
    zshy_zhidui: {//智对
        audio: 'ext:诸神寰宇/audio/character:2',
        init(player) {
            player.addSkill('zshy_zhidui_mark');
        },
        onremove(player) {
            player.removeSkill('zshy_zhidui_mark');
        },
        trigger: { player: ['useCard', 'respond'] },
        filter(event, player) {
            const history = game.getAllGlobalHistory('useCard'),
                index = history.indexOf(event);
            return index >= 1;
        },
        async cost(event, trigger, player) {
            const history = game.getAllGlobalHistory('useCard'),
                index = history.indexOf(trigger);
            if (index < 1) {
                return;
            }
            const bool1 = get.cardNameLength(trigger.card) === get.cardNameLength(history[index - 1].card);
            const bool2 = get.type2(trigger.card) === get.type2(history[index - 1].card);
            if (bool1 || bool2) {
                const result = await player
                    .chooseButton([
                        get.prompt2(event.skill),
                        [
                            [
                                ['draw', `回复1点体力或摸两张牌`],
                                ['noCount', `令${get.translation(trigger.card)}不计入次数`],
                            ],
                            'textbutton',
                        ],
                    ])
                    .set('ai', button => {
                        if (button.link == 'draw') {
                            return 2;
                        }
                        if (button.link == 'noCount') {
                            const usable = get.player().getCardUsable(get.event().getTrigger().card);
                            if (usable > 0) {
                                return 1.5;
                            }
                            return 2.5;
                        }
                    })
                    .forResult();
                if (result?.links?.length) {
                    event.result = {
                        bool: true,
                        cost_data: result.links[0],
                    };
                }
            } else {
                return;
            };
        },
        async content(event, trigger, player) {
            const link = event.cost_data;
            if (link == 'draw') {
                await player.chooseDrawRecover(2, true);
            }
            if (link == 'noCount') {
                if (trigger.addCount !== false) {
                    trigger.addCount = false;
                    const stat = player.getStat().card,
                        name = trigger.card.name;
                    if (typeof stat[name] === 'number') {
                        stat[name]--;
                    }
                }
            }
        },
        locked: false,
        mod: {
            aiOrder(player, card, num) {
                if (typeof card == 'object') {
                    var history = game.getAllGlobalHistory('useCard');
                    if (!history.length) {
                        return;
                    }
                    var evt = history[history.length - 1];
                    if (evt?.card && get.cardNameLength(evt.card) == get.cardNameLength(card) && get.type(evt.card) == get.type2(card)) {
                        return num + 4;
                    }
                }
            },
        },
        subSkill: {
            mark: {
                charlotte: true,
                init(player, skill) {
                    const history = game.getAllGlobalHistory('useCard'),
                        length = history.length;
                    if (!length) {
                        return;
                    }
                    const card = history[length - 1].card;
                    player.storage[skill] = card;
                    player.markSkill(skill);
                    game.broadcastAll(
                        function (player, type) {
                            if (player.marks.zshy_zhidui_mark) {
                                player.marks.zshy_zhidui_mark.firstChild.innerHTML = get.translation(type).slice(0, 1);
                            }
                        },
                        player,
                        get.type2(card)
                    );
                    //player.addTip(skill,get.translation(skill)+`  ${get.translation(get.type2(card))}${get.cardNameLength(card)}`);
                },
                onremove(player, skill) {
                    delete player.storage[skill];
                    //player.removeTip(skill);
                },
                intro: {
                    markcount(storage, player) {
                        return get.cardNameLength(storage);
                    },
                    content(storage, player) {
                        let str = '';
                        str += `<li>类型：${get.translation(get.type2(storage))}`;
                        str += `<br><li>牌名字数：${get.cardNameLength(storage)}`;
                        return str;
                    },
                },
                silent: true,
                trigger: { global: 'useCard1' },
                content() {
                    lib.skill[event.name].init(player, event.name);
                },
            },
        },
    },
    zshy_jiesi: {//捷思
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        usable: 1,
        onChooseToUse(event) {
            if (!game.online && !event.zshy_jiesi) {
                event.set(
                    'zshy_jiesi',
                    ['cardPile', 'discardPile']
                        .map(pos => Array.from(ui[pos].childNodes))
                        .flat()
                        .map(card => get.cardNameLength(card))
                        .unique()
                        .sort()
                );
            }
        },
        chooseButton: {
            dialog(event, player) {
                return ui.create.dialog('###捷思###', get.translation('zshy_jiesi_info'));
            },
            chooseControl(event, player) {
                const list = event.zshy_jiesi.slice();
                list.push('cancel2');
                return list;
            },
            check(event, player) {
                const sortlist = [4, 1, 2, 3, 5];
                const list = event.zshy_jiesi.slice();
                return (
                    list.sort((a, b) => {
                        return sortlist.indexOf(a) - sortlist.indexOf(b);
                    })[0] - 1
                );
            },
            backup(result, player) {
                return {
                    audio: 'zshy_jiesi',
                    len: result.control,
                    async content(event, trigger, player) {
                        const len = get.info(event.name).len;
                        const card = get.cardPile(cardx => get.cardNameLength(cardx) == len);
                        if (!card) {
                            player.chat(`一张${len}字牌都没有？！`);
                            return;
                        }
                        await player.gain(card, 'gain2');
                        const skill = 'zshy_jiesi_used';
                        player.addTempSkill(skill, { player: ['phaseUseAfter', 'phaseChange'] });
                        const bool = !player.getStorage(skill).some(cardx => cardx.name == card.name);
                        player.markAuto(skill, card);
                        if (bool) {
                            delete player.getStat().skill.zshy_jiesi;
                            player.chooseDrawRecover(true);
                        }
                    },
                };
            },
        },
        locked: false,
        mod: {
            aiOrder(player, card, num) {
                if (typeof card == 'object') {
                    if (get.type(card) == 'equip') {
                        return num - 3;
                    }
                }
            },
        },
        subSkill: {
            backup: {},
            used: {
                charlotte: true,
                onremove: true,
                intro: {
                    content: storage => '获得过的牌名：' + storage.map(card => get.translation(card.name)).unique(),
                },
            },
        },
        ai: {
            order: 7,
            result: {
                player: 1,
            },
        },
    },

};
const 蜀汉 = {
    //花鬘
    zshy_manyi: {//蛮裔
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { target: 'useCardToBefore' },
        filter(event, player) {
            return event.card.name == 'nanman';
        },
        forced: true,
        async content(event, trigger, player) {
            trigger.cancel();
            await player.chooseDrawRecover(true);
        },
        ai: {
            effect: {
                target(card) {
                    if (card.name == 'nanman') return 'zeroplayertarget';
                },
            },
        },
    },
    zshy_mansi: {//蛮嗣
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: 'damageEnd' },
        filter(event, player) {
            return event.card?.name == 'nanman';
        },
        frequent: true,
        check() {
            return true;
        },
        async content(event, trigger, player) {
            player.addMark(event.name, 1, false);
            await player.chooseDrawRecover(true);
        },
        intro: { content: '已发动此技能回复或摸牌#次' },
        group: 'zshy_mansi_viewas',
        subSkill: {
            viewas: {
                audio: 'zshy_mansi',
                enable: 'phaseUse',
                filter(event, player) {
                    const hs = player.getCards('h');
                    if (!hs.length) return false;
                    if (hs.some(card => game.checkMod(card, player, 'unchanged', 'cardEnabled2', player) === false)) return false;
                    return true;
                },
                viewAs: { name: 'nanman' },
                filterCard: true,
                selectCard: -1,
                position: 'h',
                ai: {
                    order: 0.1,
                    nokeep: true,
                    skillTagFilter(player, tag, arg) {
                        if (tag === 'nokeep') return (!arg || (arg.card && get.name(arg.card) === 'tao')) && player.isPhaseUsing() && !player.getStat('skill').zshy_mansi_viewas && player.hasCard(card => get.name(card) !== 'tao', 'h');
                    },
                },
            },
        },
    },
    zshy_souying: {//薮影
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'useCardToPlayered',
            target: 'useCardToTargeted',
        },
        filter(event, player, name) {
            if (!event.targets || event.targets.length != 1 || event.player == event.target) return false;
            return get.type(event.card) == 'basic' || get.type(event.card) == 'trick';
        },
        prompt2(event, player) {
            if (event.name == 'useCardToTargeted') return '是否令此牌对你无效？';
            return '是否获得' + get.translation(event.card) + '？';
        },
        async content(event, trigger, player) {
            if (event.triggername == 'useCardToTargeted') {
                trigger.excluded.add(player);
            }
            else if (trigger.cards?.someInD()) {
                await player.gain(trigger.cards.filterInD(), 'gain2');
            };
            if (player.getHistory('useSkill', evt => evt.skill == 'zshy_souying').length > 1) {
                const result = await player.chooseToDiscard('h').forResult();
                if (!result.bool) {
                    player.tempBanSkill('zshy_souying');
                };
            };
        },
        ai: { expose: 0.25 },
    },
    zshy_zhanyuan: {//战缘
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'zshy_mansiAfter' },
        filter(event, player) {
            return player.countMark('zshy_mansi') >= 7;
        },
        forced: true,
        juexingji: true,
        skillAnimation: true,
        animationColor: 'soil',
        derivation: 'zshy_xili',
        async content(event, trigger, player) {
            player.awakenSkill(event.name);
            const num = 7 - player.maxHp;
            if (num > 0) {
                await player.gainMaxHp(num);
            }
            else if (num < 0) {
                await player.loseMaxHp(-num);
            };
            await player.recover(7);
            if (!game.hasPlayer(current => current != player)) return;
            const result = await player.chooseTarget('是否令一名其他角色和自己一同获得技能〖系力〗？',
                (card, player, target) => {
                    return target != player;
                }).set('ai', target => {
                    const player = get.player();
                    return get.attitude(player, target);
                }).forResult();
            if (result?.bool && result?.targets?.length) {
                const target = result.targets[0];
                player.line(target, 'fire');
                await player.addSkills('zshy_xili');
                await target.addSkills('zshy_xili');
            }
        },
        ai: { combo: 'zshy_mansi' },
    },
    zshy_xili: {//系力
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: 'damageBegin1' },
        filter(event, player) {
            return event.source?.hasSkill('zshy_xili') && event.source != player && !event.player.hasSkill('zshy_xili');
        },
        logTarget: 'source',
        check(event, player) {
            return get.damageEffect(event.player, event.source, player) > 0;
        },
        async content(event, trigger, player) {
            trigger.num++;
            await trigger.source.chooseDrawRecover(true), player.chooseDrawRecover(true);
            await game.delayx();
        },
    },

    //墟文鸳
    zshy_kengqiang: {//铿锵
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'useCard' },
        filter(event, player) {
            if (player.storage.zshy_kunli && (get.type(event.card) == 'basic' || get.type(event.card) == 'trick')) {
                return true;
            }
            else if (player.storage.zshy_shangjue && get.tag(event.card, 'damage') > 0.5) {
                return true;
            }
            else {
                return player.getStorage('zshy_kengqiang_used').length < 2 && get.tag(event.card, 'damage') > 0.5;
            };
        },
        async cost(event, trigger, player) {
            const result = await player.chooseButton([get.prompt(event.skill, trigger.player),
            [[['draw', '回复1点体力或摸三张牌'], ['damage', `令${get.translation(trigger.card)}的基础数值+1` + (trigger.cards?.length ? `并获得${get.translation(trigger.cards)}` : '')],
            ], 'textbutton',],]).set('filterButton', button => {
                const player = get.player();
                if (!player.storage.zshy_shangjue) return !player.getStorage('zshy_kengqiang_used').includes(button.link);
                return true;
            }).set('ai', button => {
                return get.event().value[button.link] || 0;
            }).set('value', (function () {
                let draw = 3 * get.effect(player, { name: 'draw' }, player, player),
                    damage = trigger.targets.reduce((sum, target) => {
                        return sum + get.damageEffect(target, player, player);
                    }, 0) || 0;
                if (trigger.cards) {
                    damage += trigger.cards.reduce((acc, card) => {
                        return acc + get.value(card, player);
                    }, 0);
                }
                return { damage, draw };
            })()).forResult();
            event.result = {
                bool: result.bool,
                cost_data: result.links,
            };
        },
        async content(event, trigger, player) {
            const result = event.cost_data[0];
            player.addTempSkill('zshy_kengqiang_used');
            player.markAuto('zshy_kengqiang_used', result);
            if (result == 'draw') {
                await player.chooseDrawRecover(3, true);
            } else {
                trigger.baseDamage++;
                const cards = trigger.cards?.filterInD('od');
                if (cards.length) {
                    await player.gain(cards, 'gain2');
                } else {
                    await game.delay();
                }
            }
        },
        subSkill: {
            used: {
                charlotte: true,
                onremove: true,
            },
        },
    },
    zshy_kuichi: {//匮饬
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'phaseEnd',
        },
        filter(event, player) {
            if (player.getHistory('gain', evt => {
                return evt.getParent().name == 'draw' && evt.cards.length;
            }).reduce((sum, evt) => sum + evt.cards.length, 0) < player.maxHp
            ) {
                return false;
            }
            if (player.getHistory('sourceDamage', evt => {
                return evt.num > 0;
            }).reduce((sum, evt) => sum + evt.num, 0) < player.maxHp
            ) {
                return false;
            }
            return true;
        },
        forced: true,
        async content(event, trigger, player) {
            await player.loseHp();
        },
    },
    zshy_shangjue: {//殇决
        audio: 'ext:诸神寰宇/audio/character:2',
        skillAnimation: true,
        animationColor: 'fire',
        juexingji: true,
        derivation: 'zshy_kunli',
        trigger: { player: 'dying' },
        forced: true,
        filter(event, player) {
            return player.hp < 1;
        },
        async content(event, trigger, player) {
            player.awakenSkill(event.name);
            player.storage[event.name] = true;
            await player.gainMaxHp();
            await player.recoverTo(player.maxHp);
            await player.drawTo(player.maxHp);
            await player.addSkills('zshy_kunli');
        },
    },
    zshy_kunli: {//困励
        audio: 'ext:诸神寰宇/audio/character:2',
        skillAnimation: true,
        animationColor: 'fire',
        juexingji: true,
        trigger: { player: 'dying' },
        forced: true,
        filter(event, player) {
            return player.hp < 2;
        },
        async content(event, trigger, player) {
            player.awakenSkill(event.name);
            player.storage[event.name] = true;
            await player.gainMaxHp();
            await player.recoverTo(player.maxHp);
            await player.drawTo(player.maxHp);
            await player.removeSkills('zshy_kuichi');
        },
    },

    //墟张裕
    zshy_xiangchen: {//相谶
        audio: 'ext:诸神寰宇/audio/character:2',
        init(player, skill) {
            _status.characterlist = Object.keys(lib.character);
        },
        enable: 'phaseUse',
        usable: 1,
        filterTarget: true,
        async content(event, trigger, player) {
            const {
                targets: [target],
            } = event;
            player.setStorage(event.name, target);
            player.markSkillCharacter(event.name, target, '相谶', '上次〖相谶〗的目标');
            const groupx = target.group;
            const hps = [get.character(target.name).hp, get.character(target.name2).hp];
            const skillsx = player.getSkills(null, false, false).filter(skill => !get.info(skill).charlotte);
            const skills = _status.characterlist.reduce((list, name) => {
                const { group, hp, skills } = get.character(name);
                if (groupx != group || !hps.includes(hp)) {
                    return list;
                }
                return [
                    ...skills.filter(skill => {
                        const info = get.info(skill);
                        if (!info) {
                            return false;
                        }
                        if (typeof info.groupSkill == 'string' && info.groupSkill != player.group) {
                            return false;
                        }
                        if (info.ai && (info.ai.combo || info.ai.notemp || info.ai.neg)) {
                            return false;
                        }
                        return !skillsx.includes(skill);
                    }),
                    ...list,
                ];
            }, []);
            if (skills.length) {
                const result = await player
                    .chooseButton({
                        createDialog: [`相谶：请选择至多2个技能获得`, [skills.randomGets(player.maxHp), 'skill']],
                        selectButton: [1, 2],
                        forced: true,
                        ai(button) {
                            return get.skillRank(button.link, 'inout');
                        },
                    })
                    .forResult();
                if (result.links?.length) {
                    await player.addAdditionalSkills(event.name, result.links, true);
                }
            } else {
                player.chat('天有不测风云啊');
            };
            await player.chooseDrawRecover(true);
        },
        ai: {
            order: 8,
            result: {
                target(player, target) {
                    if (target == player) {
                        return Math.random() - 0.5;
                    }
                    const sgn = get.sgnAttitude(player, target);
                    const name = target.name;
                    const hp = get.character(name).hp;
                    if (hp >= 3 && hp <= 5) {
                        return sgn * (Math.random() + 1);
                    }
                    return sgn * Math.random();
                },
            },
        },
        group: ['zshy_xiangchen_changeHp', 'zshy_xiangchen_clear'],
        subSkill: {
            changeHp: {
                audio: 'zshy_xiangchen',
                trigger: { global: 'changeHpAfter' },
                filter(event, player) {
                    if (event.changedHp == 0 || !event.player.isIn()) {
                        return false;
                    }
                    return event.player == player || player.getStorage('zshy_xiangchen', null) == event.player;
                },
                direct: true,
                async content(event, trigger, player) {
                    const skill = 'zshy_xiangchen';
                    const next = player.chooseToUse({
                        prompt: get.translation(skill),
                        prompt2: get.skillInfoTranslation(skill, player),
                    });
                    next.set('norestore', true);
                    next.set('_backupevent', skill);
                    next.set('custom', {
                        add: {},
                        replace: { window() { } },
                    });
                    next.backup(skill);
                    next.set('ai1', () => 1);
                    next.set('ai2', target => {
                        const eff = get.effect(target, 'zshy_xiangchen', get.player(), get.player());
                        return eff;
                    });
                    next.set('addSkillCount', false);
                    await next;
                },
            },
            clear: {
                audio: 'zshy_xiangchen',
                forced: true,
                locked: false,
                trigger: { player: 'phaseUseBegin' },
                async content(event, trigger, player) {
                    await player.removeAdditionalSkills('zshy_xiangchen');
                    //await player.recover();
                },
            },
        },
    },
    zshy_mingding: {//命定
        audio: 'ext:诸神寰宇/audio/character:2',
        limited: true,
        skillAnimation: true,
        animationColor: 'orange',
        trigger: { player: 'dying' },
        check(event, player) {
            if (
                player.countCards('h', function (card) {
                    var mod2 = game.checkMod(card, player, 'unchanged', 'cardEnabled2', player);
                    if (mod2 != 'unchanged') {
                        return mod2;
                    }
                    var mod = game.checkMod(card, player, event.player, 'unchanged', 'cardSavable', player);
                    if (mod != 'unchanged') {
                        return mod;
                    }
                    var savable = get.info(card).savable;
                    if (typeof savable == 'function') {
                        savable = savable(card, player, event.player);
                    }
                    return savable;
                }) >=
                1 - event.player.hp
            ) {
                return false;
            }
            return true;
        },
        async content(event, trigger, player) {
            player.awakenSkill(event.name);
            const toRemove = player.getSkills(null, false, false).filter(skill => skill != event.name && !get.info(skill).charlotte);
            if (toRemove.length) {
                await player.removeSkills(toRemove);
            }
            await player.recoverTo(player.maxHp);
            player.addTempSkill(`${event.name}_effect`, { player: 'dieAfter' });
            player.when({ player: 'phaseAfter' })
                .filter(evt => evt != trigger.getParent('phase', true))
                .then(async (event, trigger, player) => {
                    player.removeSkill('zshy_mingding_effect');
                });
            const toAdd = [];
            game.checkAllGlobalHistory('everything', evt => {
                if (evt.name != 'changeSkills' || evt.player != player || evt.getParent()?.name != 'zshy_xiangchen') {
                    return false;
                }
                toAdd.addArray(evt.addSkill);
                return true;
            });
            await player.draw(toAdd.length);
            await player.addSkills(toAdd);
        },
        subSkill: {
            effect: {
                audio: 'zshy_mingding',
                charlotte: true,
                forced: true,
                intro: {
                    content: '防止你受到的伤害',
                },
                mark: true,
                trigger: {
                    player: 'damageBegin4',
                },
                async content(event, trigger, player) {
                    trigger.cancel();
                },
                ai: {
                    nodamage: true,
                    effect: {
                        target(card, player, target, current) {
                            if (get.tag(card, 'damage')) {
                                return 'zeroplayertarget';
                            }
                        },
                    },
                },
            },
        },
    },

};
const 东吴 = {
    //烬灭归墟-吴
    zshy_zigu: {//自固
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        filterTarget(event, player, target) {
            return target != player && target.countCards('ej') > 0;
        },
        filter(event, player, target) {
            return game.countPlayer(function (current) {
                return current != player && current.countCards('ej') > 0;
            }) > 0;
        },
        check(target) {
            return get.attitude(player, target) < 0;
        },
        content() {
            'step 0'
            player.gainPlayerCard(target, 'ej', true);
            target.damage();
            'step 1'
            if (target.hp < player.hp) player.chooseDrawRecover(true);
        },
    },
    zshy_zuowei: {//作威
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: ['useCard', 'respond'],
        },
        direct: true,
        forced: true,
        content() {
            'step 0'
            var hs = player.countCards('h');
            var es = Math.max(1, player.countCards('e'));
            var sign = Math.sign(hs - es);
            event.sign = sign;
            if (sign > 0) player.chooseBool(get.prompt('zshy_zuowei'), '令' + get.translation(trigger.card) + '不可被响应').set('ai', () => 1);
            else if (sign == 0)
                player.chooseTarget(get.prompt('zshy_zuowei'), '对一名其他角色造成1点伤害', lib.filter.notMe).set('ai', target => {
                    return get.damageEffect(target, _status.event.player, _status.event.player);
                });
            else player.chooseBool(get.prompt('zshy_zuowei'), '摸两张牌').set('ai', () => 1);
            'step 1'
            if (!result.bool) event.finish();
            else if (event.sign <= 0 && !event.isMine() && !event.isOnline()) game.delayx();
            'step 2'
            var sign = event.sign;
            if (sign > 0) {
                player.logSkill('zshy_zuowei');
                if (trigger.name == 'useCard') trigger.directHit.addArray(game.players);
                event.finish();
            } else if (sign == 0) {
                var target = result.targets[0];
                player.logSkill('zshy_zuowei', target);
                target.damage();
            } else {
                player.logSkill('zshy_zuowei');
                player.draw(2);
            }
        },
    },

    zshy_jiqiao: {//激峭
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'phaseBegin',
            player: ['useCardAfter', 'respondAfter'],
        },
        forced: true,
        filter(event, player) {
            return player.getExpansions('zshy_jiqiao').length == 0;
        },
        content() {
            var cards = get.cards(player.maxHp);
            cards.sort(function (a, b) {
                return get.color(b).length - get.color(a).length;
            });
            player.addToExpansion(cards, 'gain2').gaintag.add('zshy_jiqiao');
        },
        onremove(player, skill) {
            var cards = player.getExpansions(skill);
            if (cards.length) player.loseToDiscardpile(cards);
        },
        intro: {
            content: 'expansion',
            markcount: 'expansion',
        },
        group: ['zshy_jiqiao_gain'],
        subSkill: {
            gain: {
                audio: 'zshy_jiqiao',
                trigger: { player: ['useCard', 'respond'] },
                charlotte: true,
                forced: true,
                filter(event, player) {
                    return player.hasCard(card => card.hasGaintag('zshy_jiqiao'), 'x');
                },
                content() {
                    'step 0';
                    var cards = player.getExpansions('zshy_jiqiao');
                    var dialog = ['激峭：选择获得一张牌'];
                    var reds = [],
                        blacks = [];
                    for (var i of cards) (get.color(i) == 'red' ? reds : blacks).push(i);
                    if (reds.length > 0) {
                        dialog.push('<div class="text center">红色牌</div>');
                        dialog.push(reds);
                    }
                    if (blacks.length > 0) {
                        dialog.push('<div class="text center">黑色牌</div>');
                        dialog.push(blacks);
                    }
                    player.chooseButton(dialog, true).set('ai', function (button) {
                        var player = _status.event.player;
                        var color = get.color(button.link),
                            cards = player.getExpansions('zshy_jiqiao');
                        if (color == 'red') return get.recoverEffect(player, player, player);
                        if (color == 'black') return get.effect(player, { name: 'losehp' }, player, player);
                        return 0;
                    });
                    'step 1';
                    if (result.bool) {
                        player.gain(result.links, 'gain2');
                        if (get.color(result.links) == 'red') player.recover();
                        if (get.color(result.links) == 'black') player.draw();
                        else event.finish();
                    } else event.finish();
                },
                onremove(player) {
                    var cards = player.getExpansions('zshy_jiqiao');
                    if (cards.length) player.loseToDiscardpile(cards);
                },
            },
        },
    },
    zshy_xiongyi: {//凶疑
        audio: 'ext:诸神寰宇/audio/character:2',
        skillAnimation: true,
        animationColor: 'wood',
        limited: true,
        enable: 'chooseToUse',
        derivation: ['zshy_hunzi', 'zshy_yingzi', 'zshy_yinghun'],
        filter(event, player) {
            if (event.type != 'dying') return false;
            if (player != event.dying) return false;
            return true;
        },
        async content(event, trigger, player) {
            player.awakenSkill(event.name);
            if (game.countPlayer(function (current) {
                return current.name1 == 'zshy_AAZZxushiYJCM' || current.name2 == 'zshy_AAZZxushiYJCM';
            }) == 0) {
                if (player.name2 && get.character(player.name2)[3].includes('zshy_xiongyi')) {
                    await player.reinitCharacter(player.name2, 'zshy_AAZZxushiYJCM');
                } else {
                    await player.reinitCharacter(player.name1, 'zshy_AAZZxushiYJCM');
                }
                if (player.hp < player.maxHp) await player.recoverTo(player.maxHp);
            } else {
                await player.addSkills('zshy_hunzi');
                if (player.hp < 1) await player.recoverTo(1);
            }
        },
        ai: {
            order: 1,
            save: true,
            skillTagFilter(player, arg, target) {
                return player == target;
            },
            result: {
                player: 10,
            },
        },
    },

};
const 群雄 = {
    //墟卑弥呼
    zshy_zongkui: {//纵傀
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: ['phaseZhunbeiBegin', 'damageEnd'],
        },
        forced: true,
        filter(event, player, name) {
            return event.player != player;
        },
        async content(event, trigger, player) {
            trigger.player.addMark('zshy_zongkui_mark', 1);
        },
        subSkill: {
            mark: {
                marktext: '傀',
                intro: {
                    name2: '傀',
                    content: 'mark',
                },
                sub: true,
                sourceSkill: 'zshy_zongkui',
            },
        },
        ai: {
            combo: 'zshy_guju',
            threaten: 1.4,
        },
    },
    zshy_guju: {//骨疽
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: ['changeHp'],
        },
        forced: true,
        filter(event, player) {
            return event.player != player;
        },
        async content(event, trigger, player) {
            await player.chooseDrawRecover(true);
            player.addMark(event.name, 1, false);
        },
        intro: {
            content: '已发动〖骨疽〗#次',
        },
        ai: {
            combo: 'zshy_zongkui',
        },
    },
    zshy_baijia: {//拜假
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'changeHpAfter',
        },
        lastDo: true,
        forced: true,
        skillAnimation: true,
        animationColor: 'thunder',
        derivation: 'zshy_BMHcanshi',
        filter(event, player) {
            return event.player != player && player.countMark('zshy_guju') > 0 && player.countMark('zshy_guju') % 7 == 0;
        },
        async content(event, trigger, player) {
            await player.gainMaxHp();
            await player.recover();
            const targets = game.filterPlayer(current => player != current);
            if (targets.length) {
                for (const target of targets.sortBySeat()) {
                    target.addMark('zshy_zongkui_mark', 1, false);
                    player.line(target, 'green');
                }
            }
            await player.addSkill('zshy_BMHcanshi');
        },
        ai: {
            combo: 'zshy_guju',
        },
    },
    zshy_BMHcanshi: {//蚕食
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'useCard2',
            target: 'useCardToTarget',
        },
        filter(event, player, name) {
            const { targets, card } = event;
            if (!['basic', 'trick'].includes(get.type(card))) return false;
            if (!targets || targets.length != 1) return false;
            if (name == 'useCardToTarget') return event.player.hasMark('zshy_zongkui_mark');
            const info = get.info(card);
            if (info.multitarget) return false;
            if (info.allowMultiple == false) return false;
            return game.hasPlayer(current => {
                if (!current.hasMark('zshy_zongkui_mark')) return false;
                return !targets.includes(current) && lib.filter.targetEnabled2(card, player, current);
            });
        },
        check(event, player) {
            return get.attitude(event.player, player) < 0 && get.effect(player, event.card, event.player, player) < 0;
        },
        async cost(event, trigger, player) {
            if (event.triggername == 'useCardToTarget') {
                const { player: target } = trigger;
                const result = await player.chooseBool(get.prompt2(event.skill, target)).set('choice', get.info(event.skill).check(trigger, player)).forResult();
                if (result?.bool) event.result = { bool: true, targets: [target] };
            } else {
                event.result = await player
                    .chooseTarget(get.prompt2(event.skill), [1, Infinity], (card, player, target) => {
                        if (!target.hasMark('zshy_zongkui_mark')) return false;
                        const trigger = get.event().getTrigger();
                        return !trigger.targets.includes(target) && lib.filter.targetEnabled2(trigger.card, player, target);
                    })
                    .set('ai', target => {
                        const player = get.player();
                        return get.effect(target, get.event().getTrigger().card, player, player);
                    })
                    .forResult();
            }
        },
        async content(event, trigger, player) {
            if (event.triggername == 'useCardToTarget') {
                trigger.targets.remove(player);
                trigger.getParent().triggeredTargets2.remove(player);
                player.draw();
                await game.delay();
                trigger.player.removeMark('zshy_zongkui_mark', 1, false);
            } else {
                if (!event.isMine() && !event.isOnline()) await game.delayx();
                const { targets } = event;
                targets.sortBySeat().forEach(current => {
                    current.removeMark('zshy_zongkui_mark', 1, false);
                });
                player.chooseDrawRecover(true);
                trigger.targets.addArray(event.targets);
            }
        },
        ai: {
            combo: 'zshy_zongkui',
        },
    },

    //墟李傕
    zshy_langxi: {//狼袭
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: ['phaseZhunbeiBegin', 'phaseJieshuBegin'],
        },
        filter(event, player) {
            return game.hasPlayer(function (current) {
                return current != player;
            });
        },
        async cost(event, trigger, player) {
            event.result = await player
                .chooseTarget(get.prompt(event.name.slice(0, -5)), `对一名其他角色造成0-X点随机伤害（X为其体力上限）`, (card, player, target) => {
                    return target !== player;
                })
                .set('ai', target => {
                    const player = get.event().player,
                        att = get.attitude(player, target);
                    if (att > 0) {
                        return 0;
                    }
                    return get.damageEffect(target, player, player);
                })
                .forResult();
        },
        async content(event, trigger, player) {
            const target = event.targets[0];
            if (get.mode() !== 'identity' || player.identity !== 'nei') {
                player.addExpose(0.3);
            }
            event.num = get.rand(2, target.maxHp * 2);
            const num = Math.ceil(event.num / 2);
            player.popup(num ? get.cnNumber(num) + '点' : '🐏袭');
            await target.damage(num);
        },
        ai: {
            threaten: 1.7,
        },
    },
    zshy_yisuan: {//亦算
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'useCardEnd',
        },
        frequent: true,
        check(event, player) {
            return get.value(event.cards) > 0;
        },
        prompt2(event, player) {
            return '你可获得' + get.translation(event.cards.filterInD()) + '。';
        },
        filter(event, player) {
            return event.player != player && get.type(event.card) == 'trick' && event.cards.filterInD().length > 0;
        },
        content() {
            player.gain(trigger.cards.filterInD(), 'gain2', 'log');
        },
    },

    //墟刘辩
    zshy_shiyuan: {//诗怨
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { target: 'useCardToTargeted' },
        frequent: true,
        filter(event, player) {
            return (player != event.player && player.getHistory('gain', function (evt) {
                return evt.getParent(2).name == 'zshy_shiyuan' && evt.cards.length == 2 + get.sgn(event.player.hp - player.hp);
            }).length < Infinity);
        },
        content() {
            player.chooseDrawRecover(2 + get.sgn(trigger.player.hp - player.hp), true);
        },
        ai: {
            effect: {
                target_use(card, player, target) {
                    if (get.itemtype(player) !== 'player' || player === target) {
                        return 1;
                    }
                    let num = 1,
                        ds = 2 + get.sgn(player.hp - target.hp);
                    if (player === _status.currentPhase && _status.currentPhase?.group === 'qun' && target.hasZhuSkill('zshy_yuwei', player)) {
                        num = 2;
                    }
                    if (
                        target.getHistory('gain', function (evt) {
                            return evt.getParent(2).name === 'zshy_shiyuan' && evt.cards.length === ds;
                        }).length >= num
                    ) {
                        return 1;
                    }
                    let name = get.name(card);
                    if (get.tag(card, 'lose') || name === 'huogong' || name === 'juedou' || name === 'tiesuo') {
                        return [1, ds];
                    }
                    if (!target.hasFriend()) {
                        return 1;
                    }
                    return [1, 0.5 * ds];
                },
            },
        },
    },
    zshy_dushi: {//毒逝
        audio: 'ext:诸神寰宇/audio/character:2',
        locked: true,
        trigger: { player: 'die' },
        forceDie: true,
        direct: true,
        skillAnimation: true,
        animationColor: 'gray',
        filter(event, player) {
            return game.hasPlayer(current => current != player);
        },
        content() {
            'step 0';
            player.chooseTarget('请选择〖毒逝〗的目标', '选择一名其他角色，令其获得技能〖毒逝〗', true, lib.filter.notMe)
                .set('forceDie', true)
                .set('ai', function (target) {
                    return -get.attitude(_status.event.player, target);
                });
            'step 1';
            if (result.bool) {
                var target = result.targets[0];
                player.logSkill('zshy_dushi', target);
                target.markSkill('zshy_dushi');
                target.addSkills('zshy_dushi');
            }
        },
        mod: {
            aiUseful(card, player, target) {
                if (card.name == 'tao') {
                    if (!game.countPlayer(function (current) {
                        return get.attitude(player, current) > 2;
                    }) > 0) return 0;
                }
            },
        },
        intro: { content: '您已经获得弘农王的诅咒' },
        global: 'zshy_dushi_buff',
        subSkill: {
            buff: {
                mod: {
                    cardUsableTarget(card, player, target) {
                        if (card.name == 'tao' && target.hasSkill('zshy_dushi')) {
                            return false;
                        }
                    },
                    cardSavable(card, player, target) {
                        if (card.name == 'tao' && target.hasSkill('zshy_dushi')) {
                            return false;
                        }
                    },
                },
            },
        },
    },
    zshy_yuwei: {//余威
        trigger: { player: 'zshy_shiyuanBegin' },
        filter(event, player) {
            return _status.currentPhase && _status.currentPhase.group == 'qun';
        },
        zhuSkill: true,
        forced: true,
        async content(event, trigger, player) {
            player.chooseDrawRecover(true);
        },
        ai: { combo: 'zshy_shiyuan' },
    },

    //墟吕玲绮
    zshy_guowu: {//帼武
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'phaseUseBegin' },
        forced: true,
        async content(event, trigger, player) {
            var card = get.cardPile(function (i) {
                return i.name == 'sha';
            });
            if (card) {
                player.gain(card, 'gain2');
            }
        },
        mod: {
            cardUsableTarget(card, player, target) {
                if (player.countCards('e') && player.inRange(target)) {
                    return true;
                }
            },
        },
        group: ['zshy_guowu_add'],
        subSkill: {
            add: {
                audio: 'zshy_guowu',
                trigger: {
                    player: 'useCard1',
                },
                forced: true,
                direct: true,
                filter(event, player) {
                    var info = get.info(event.card, false);
                    if (info.allowMultiple == false) return false;
                    if (get.name(event.card) != 'sha' && (info.type != 'trick')) return false;
                    if (event.targets && !info.multitarget) {
                        if (game.hasPlayer(function (current) {
                            return !event.targets.includes(current) && lib.filter.targetEnabled2(event.card, player, current) && lib.filter.targetInRange(event.card, player, current);
                        })) {
                            return true;
                        }
                    }
                    return false;
                },
                content() {
                    'step 0';
                    var num = game.countPlayer(function (current) {
                        return !trigger.targets.includes(current) && lib.filter.targetEnabled2(trigger.card, player, current) && lib.filter.targetInRange(trigger.card, player, current);
                    });
                    player.chooseTarget('帼武：是否为' + get.translation(trigger.card) + '增加' + (num > 1 ? '至多两个' : '一个') + '目标？', [1, Math.min(2, num)], function (card, player, target) {
                        var trigger = _status.event.getTrigger();
                        var card = trigger.card;
                        return !trigger.targets.includes(target) && lib.filter.targetEnabled2(card, player, target) && lib.filter.targetInRange(card, player, target);
                    }).set('ai', function (target) {
                        var player = _status.event.player;
                        var card = _status.event.getTrigger().card;
                        return get.effect(target, card, player, player);
                    });
                    'step 1';
                    if (result.bool) {
                        if (player != game.me && !player.isOnline()) game.delayx();
                    } else event.finish();
                    'step 2';
                    var targets = result.targets.sortBySeat();
                    player.logSkill('zshy_guowu_add', targets);
                    trigger.targets.addArray(targets);
                },
            },
        },
    },
    zshy_zhuangrong: {//妆戎
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: ['damageAfter', 'loseAfter'],
            global: ['equipAfter', 'addJudgeAfter', 'gainAfter', 'loseAsyncAfter', 'addToExpansionAfter'],
        },
        forced: true,
        juexingji: true,
        skillAnimation: true,
        animationColor: 'gray',
        derivation: ['zshy_LLQshenwei', 'zshy_LLQwushuang'],
        filter(event, player) {
            return player.hp <= 1 || player.countCards('h', function (card) {
                return get.tag(card, 'damage') == true;
            }) < 1;
        },
        content() {
            'step 0'
            player.awakenSkill('zshy_zhuangrong');
            player.gainMaxHp();
            'step 1'
            player.recoverTo(player.maxHp);
            player.draw(player.maxHp);
            player.addSkills(['zshy_LLQshenwei', 'zshy_LLQwushuang']);
        },
    },
    zshy_LLQshenwei: {//神威
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'phaseDrawBegin2',
        },
        forced: true,
        content() {
            trigger.num += Math.max(1, player.getDamagedHp());
        },
        mod: {
            maxHandcard: (player, num) => num + Math.max(1, player.getDamagedHp()),
        },
    },
    zshy_LLQwushuang: {//无双
        audio: 'ext:诸神寰宇/audio/character:2',
        shaRelated: true,
        forced: true,
        group: ['zshy_LLQwushuang_sha', 'zshy_LLQwushuang_juedou', 'zshy_LLQwushuang_draw'],
        preHidden: ['zshy_LLQwushuang_sha', 'zshy_LLQwushuang_juedou', 'zshy_LLQwushuang_draw'],
        subSkill: {
            sha: {
                audio: 'zshy_LLQwushuang',
                trigger: { player: 'useCardToPlayered' },
                forced: true,
                direct: true,
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
                    player.logSkill('zshy_LLQwushuang');
                },
                ai: {
                    directHit_ai: true,
                    skillTagFilter(player, tag, arg) {
                        if (arg.card.name != 'sha' || arg.target.countCards('h', 'shan') > 1) return false;
                    },
                },
            },
            juedou: {
                audio: 'zshy_LLQwushuang',
                trigger: { player: 'useCardToPlayered', target: 'useCardToTargeted' },
                forced: true,
                direct: true,
                logTarget(trigger, player) {
                    return player == trigger.player ? trigger.target : trigger.player
                },
                filter(event, player) {
                    return get.name(event.card) == 'juedou';
                },
                async content(event, trigger, player) {
                    const id = (player == trigger.player ? trigger.target : trigger.player)['playerid'];
                    const idt = trigger.target.playerid;
                    const map = trigger.getParent().customArgs;
                    if (!map[idt]) map[idt] = {};
                    if (!map[idt].shaReq) map[idt].shaReq = {};
                    if (!map[idt].shaReq[id]) map[idt].shaReq[id] = 1;
                    map[idt].shaReq[id]++;
                    player.logSkill('zshy_LLQwushuang');
                },
                ai: {
                    directHit_ai: true,
                    skillTagFilter(player, tag, arg) {
                        if (arg.card.name != 'juedou' || Math.floor(arg.target.countCards('h', 'sha') / 2) > player.countCards('h', 'sha')) return false;
                    }
                }
            },
            draw: {
                trigger: {
                    player: 'useCard',
                },
                direct: true,
                filter(event, player) {
                    return get.name(event.card) == 'juedou' || get.name(event.card) == 'sha';
                },
                content() {
                    player.draw();
                },
            },
        },
    },

    //墟徐荣
    zshy_xionghuo: {//凶镬
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        filter(event, player) {
            return player.countMark('zshy_xionghuo') > 0;
        },
        filterTarget(card, player, target) {
            return player != target;
        },
        prompt: '出牌阶段，你可交给一名其他角色1枚「戾」',
        content() {
            player.removeMark('zshy_xionghuo', 1);
            target.addMark('zshy_xionghuo', 1);
        },
        ai: {
            order: 11,
            result: {
                target(player, target) {
                    if (
                        (player.countMark('zshy_xionghuo') >= 2 ||
                            !game.hasPlayer(function (current) {
                                return current != player && get.attitude(player, current) < 0 && current.hasMark('zshy_xionghuo');
                            })) &&
                        player.countCards('h', function (card) {
                            return (
                                get.tag(card, 'damage') &&
                                player.canUse(card, target, null, true) &&
                                player.getUseValue(card) > 0 &&
                                get.effect_use(target, card, player) > 0 &&
                                target.hasSkillTag('filterDamage', null, {
                                    player: player,
                                    card: card,
                                })
                            );
                        })
                    )
                        return 3 / Math.max(1, target.hp);
                    if (
                        (!player.hasUnknown() &&
                            game.countPlayer(function (current) {
                                return get.attitude(player, current) < 0;
                            }) <= 1) ||
                        player.countMark('zshy_xionghuo') >= 2
                    ) {
                        return -1;
                    }
                    return 0;
                },
            },
            effect: {
                player(card, player, target) {
                    if (player != target && get.tag(card, 'damage') &&
                        target && target.hasMark('zshy_xionghuo') &&
                        !target.hasSkillTag('filterDamage', null, {
                            player: player,
                            card: card,
                        })) return [1, 0, 1, -2];
                },
            },
            threaten: 1.6,
        },
        marktext: '戾',
        intro: {
            name: '戾',
            content: 'mark',
        },
        group: ['zshy_xionghuo_init', 'zshy_xionghuo_damage', 'zshy_xionghuo_effect'],
        subSkill: {
            init: {
                audio: 'zshy_xionghuo',
                trigger: {
                    global: 'roundStart',
                },
                forced: true,
                locked: false,
                content() {
                    for (i of game.players) {
                        i.addMark('zshy_xionghuo', 1, false);
                    };
                },
            },
            damage: {
                audio: 'zshy_xionghuo',
                trigger: {
                    source: 'damageBegin1',
                },
                filter(event, player) {
                    return event.player.countMark('zshy_xionghuo') > 0 && event.player != player;
                },
                forced: true,
                locked: false,
                logTarget: 'player',
                sourceSkill: 'zshy_xionghuo',
                content() {
                    trigger.num += trigger.player.countMark('zshy_xionghuo');
                },
            },
            effect: {
                audio: 'zshy_xionghuo',
                trigger: {
                    global: 'phaseUseBegin',
                },
                filter(event, player) {
                    return event.player.countMark('zshy_xionghuo') > 0 && event.player != player;
                },
                line: false,
                forced: true,
                locked: false,
                logTarget: 'player',
                sourceSkill: 'zshy_xionghuo',
                content() {
                    'step 0'
                    player.chooseBool().set('prompt', get.prompt('zshy_xionghuo'))
                        .set('prompt2', '你获得' + get.translation(trigger.player) + '所有的「戾」')
                        .set('ai', function (target) {
                            return get.attitude(player, trigger.player) > 0
                        })
                    'step 1'
                    if (result.bool == true) {
                        let num = trigger.player.countMark('zshy_xionghuo')
                        trigger.player.removeMark('zshy_xionghuo', num);
                        player.addMark('zshy_xionghuo', num);
                        event.finish();
                    } else {
                        event.num = trigger.player.countMark('zshy_xionghuo');
                        trigger.player.removeMark('zshy_xionghuo', trigger.player.countMark('zshy_xionghuo'));
                    }
                    'step 2'
                    var num = get.rand(0, 2);
                    switch (num) {
                        case 0: {
                            player.line(trigger.player, 'fire');
                            trigger.player.damage(event.num, 'fire');
                            trigger.player.addSkill('zshy_xionghuo_disable');
                            trigger.player.markAuto('zshy_xionghuo_disable', [player]);
                            break;
                        }
                        case 1: {
                            player.line(trigger.player, 'water');
                            trigger.player.loseHp(event.num);
                            trigger.player.addMark('zshy_xionghuo_low', event.num, false);
                            trigger.player.addSkill('zshy_xionghuo_low');
                            break;
                        }
                        case 2: {
                            player.line(trigger.player, 'green');
                            const cards = trigger.player.getGainableCards(player, 'he');
                            if (cards.length) player.gain(cards.randomGets(2 * event.num), trigger.player, 'giveAuto', 'bySelf');
                            trigger.player.loseMaxHp(event.num);
                            break;
                        }
                    }
                    'step 3'
                    game.delay();
                },
            },
            disable: {
                mod: {
                    playerEnabled(card, player, target) {
                        if (card.name == 'sha' && player.getStorage('zshy_xionghuo_disable').includes(target)) return false;
                    },
                },
                charlotte: true,
                onremove: true,
                mark: true,
                marktext: '禁',
                sourceSkill: 'zshy_xionghuo',
                intro: {
                    content: '不能对$使用【杀】',
                },
            },
            low: {
                mod: {
                    maxHandcard(player, num) {
                        return num - player.countMark('zshy_xionghuo_low');
                    },
                },
                charlotte: true,
                onremove: true,
                mark: true,
                marktext: '牌',
                sourceSkill: 'zshy_xionghuo',
                intro: {
                    content: '手牌上限-#',
                },
            },
        },
    },
    zshy_shajue: {//杀绝
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'dying',
        },
        filter(event, player) {
            if (event.player == player) return false;
            const bool1 = player.hasSkill('zshy_xionghuo') == true;
            const bool2 = get.itemtype(event.parent.cards) == 'cards' && event.parent.cards.some(card => get.position(card, true) == 'o');
            return bool1 || bool2;
        },
        forced: true,
        content() {
            'step 0'
            if (player.hasSkill('zshy_xionghuo') == true) player.addMark('zshy_xionghuo', 1);
            'step 1'
            var num = 1;
            if (trigger.player.hasMark('zshy_xionghuo')) num += trigger.player.countMark('zshy_xionghuo');
            player.chooseDrawRecover(num, true);
            if (get.itemtype(trigger.parent.cards) == 'cards' && trigger.parent.cards.some(card => get.position(card, true) == 'o')) {
                player.gain(trigger.parent.cards.filter(card => get.position(card, true) == 'o'), 'gain2');
            }
        },
        ai: {
            combo: 'zshy_xionghuo',
        },
    },

    //墟许劭
    zshy_pingjian: {//评鉴
        audio: 'ext:诸神寰宇/audio/character:2',
        initList() {
            _status.characterlist = Object.keys(lib.character);
        },
        init(player) {
            player.addSkill('zshy_pingjian_check');
            if (!player.storage.zshy_pingjian_check) {
                player.storage.zshy_pingjian_check = {};
            }
        },
        trigger: {
            player: ['phaseZhunbeiBegin', 'phaseJudgeBegin', 'phaseDrawBegin', 'phaseUseBegin', 'phaseDiscardBegin', 'phaseJieshuBegin', 'damageEnd'],
        },
        frequent: true,
        content() {
            'step 0';
            _status.characterlist = Object.keys(lib.character);
            var allList = _status.characterlist.slice(0);
            game.countPlayer(function (current) {
                if (current.name && lib.character[current.name] && current.name.indexOf('gz_shibing') != 0 && current.name.indexOf('gz_jun_') != 0) {
                    allList.add(current.name);
                }
                if (current.name1 && lib.character[current.name1] && current.name1.indexOf('gz_shibing') != 0 && current.name1.indexOf('gz_jun_') != 0) {
                    allList.add(current.name1);
                }
                if (current.name2 && lib.character[current.name2] && current.name2.indexOf('gz_shibing') != 0 && current.name2.indexOf('gz_jun_') != 0) {
                    allList.add(current.name2);
                }
            });
            var list = [];
            var skills = [];
            var map = [];
            allList.randomSort();
            var name2 = event.triggername;
            for (var i = 0; i < allList.length; i++) {
                var name = allList[i];
                if (name.indexOf('zuoci') !== -1 || name.indexOf('xushao') !== -1) {
                    continue;
                }
                var skills2 = get.character(name)[3] || [];
                for (var j = 0; j < skills2.length; j++) {
                    if (player.hasSkill(skills2[j], null, null, false)) {
                        continue;
                    }
                    if (skills.includes(skills2[j])) {
                        list.add(name);
                        if (!map[name]) {
                            map[name] = [];
                        }
                        map[name].push(skills2[j]);
                        skills.add(skills2[j]);
                        continue;
                    }
                    var list2 = [skills2[j]];
                    game.expandSkills(list2);
                    for (var k = 0; k < list2.length; k++) {
                        var info = lib.skill[list2[k]];
                        if (get.is.zhuanhuanji(list2[k], player)) {
                            continue;
                        }
                        if (!info || !info.trigger || !info.trigger.player || info.silent || info.limited || info.juexingji || info.hiddenSkill || info.dutySkill || (info.zhuSkill && !player.isZhu2())) {
                            continue;
                        }
                        if (info.trigger.player == name2 || (Array.isArray(info.trigger.player) && info.trigger.player.includes(name2))) {
                            if (info.ai && (info.ai.combo || info.ai.notemp || info.ai.neg)) {
                                continue;
                            }
                            if (info.init) {
                                continue;
                            }
                            if (info.filter) {
                                try {
                                    var bool = info.filter(trigger, player, name2);
                                    if (!bool) {
                                        continue;
                                    }
                                } catch (e) {
                                    continue;
                                }
                            }
                            list.add(name);
                            if (!map[name]) {
                                map[name] = [];
                            }
                            map[name].push(skills2[j]);
                            skills.add(skills2[j]);
                            break;
                        }
                    }
                }
                if (list.length > 2) {
                    break;
                }
            }
            if (skills.length) {
                event.list = list;
                player.chooseControl(skills).set('dialog', ['评鉴：请选择尝试发动的技能', [list, 'character']]);
            } else {
                event.finish();
            }
            'step 1';
            if (player.getStorage('zshy_pingjian').includes(result.control)) {
                player.addSkill(result.control);
                player.chooseDrawRecover(true);
            } else {
                player.markAuto('zshy_pingjian', [result.control]);
                player.addTempSkill(result.control);
                player.storage.zshy_pingjian_check[result.control] = trigger.name == 'damage' ? trigger : 'phaseJieshu';
                var name = event.list.find(name => (get.character(name)[3] || []).includes(result.control));
                // if(name) lib.skill.rehuashen.createAudio(name,result.control,'xushao');
                if (name) {
                    game.broadcastAll((player, name) => player.tempname.add(name), player, name);
                }
            }
        },
        group: 'zshy_pingjian_use',
        phaseUse_special: [],
        ai: { threaten: 5 },
        subSkill: {
            use: {
                audio: 'zshy_pingjian',
                enable: 'phaseUse',
                usable: 1,
                sourceSkill: 'zshy_pingjian',
                prompt: () => lib.translate.zshy_pingjian_info,
                content() {
                    'step 0';
                    var list = [];
                    var skills = [];
                    var map = [];
                    var evt = event.getParent(2);
                    if (!_status.characterlist) {
                        game.initCharacterList();
                    }
                    var allList = _status.characterlist.slice(0);
                    game.countPlayer(function (current) {
                        if (current.name && lib.character[current.name] && current.name.indexOf('gz_shibing') != 0 && current.name.indexOf('gz_jun_') != 0) {
                            allList.add(current.name);
                        }
                        if (current.name1 && lib.character[current.name1] && current.name1.indexOf('gz_shibing') != 0 && current.name1.indexOf('gz_jun_') != 0) {
                            allList.add(current.name1);
                        }
                        if (current.name2 && lib.character[current.name2] && current.name2.indexOf('gz_shibing') != 0 && current.name2.indexOf('gz_jun_') != 0) {
                            allList.add(current.name2);
                        }
                    });
                    allList.randomSort();
                    for (var i = 0; i < allList.length; i++) {
                        var name = allList[i];
                        if (name.indexOf('zuoci') !== -1 || name.indexOf('xushao') !== -1) {
                            continue;
                        }
                        var skills2 = get.character(name)[3] || [];
                        for (var j = 0; j < skills2.length; j++) {
                            if (player.hasSkill(skills2[j], null, null, false)) {
                                continue;
                            }
                            if (get.is.locked(skills2[j], player)) {
                                continue;
                            }
                            var info = get.plainText(lib.translate[skills2[j] + '_info'] || '');
                            if (skills.includes(skills2[j]) || (info.includes('当你于出牌阶段') && !info.includes('当你于出牌阶段外'))) {
                                list.add(name);
                                map[name] ??= [];
                                map[name].push(skills2[j]);
                                skills.add(skills2[j]);
                                continue;
                            }
                            var list2 = [skills2[j]];
                            game.expandSkills(list2);
                            for (var k = 0; k < list2.length; k++) {
                                var info = lib.skill[list2[k]];
                                if (get.is.zhuanhuanji(list2[k], player)) {
                                    continue;
                                }
                                if (!info || !info.enable || info.charlotte || info.limited || info.juexingji || info.hiddenSkill || info.dutySkill || (info.zhuSkill && !player.isZhu2())) {
                                    continue;
                                }
                                if (info.enable == 'phaseUse' || (Array.isArray(info.enable) && info.enable.includes('phaseUse')) || info.enable == 'chooseToUse' || (Array.isArray(info.enable) && info.enable.includes('chooseToUse'))) {
                                    if (info.ai && (info.ai.combo || info.ai.notemp || info.ai.neg)) {
                                        continue;
                                    }
                                    if (info.init || info.onChooseToUse) {
                                        continue;
                                    }
                                    if (info.filter) {
                                        try {
                                            var bool = info.filter(evt, player);
                                            if (!bool) {
                                                continue;
                                            }
                                        } catch (e) {
                                            continue;
                                        }
                                    } else if (info.viewAs && typeof info.viewAs != 'function') {
                                        try {
                                            if (evt.filterCard && !evt.filterCard(info.viewAs, player, evt)) {
                                                continue;
                                            }
                                            if (info.viewAsFilter && info.viewAsFilter(player) == false) {
                                                continue;
                                            }
                                        } catch (e) {
                                            continue;
                                        }
                                    }
                                    list.add(name);
                                    if (!map[name]) {
                                        map[name] = [];
                                    }
                                    map[name].push(skills2[j]);
                                    skills.add(skills2[j]);
                                    break;
                                }
                            }
                        }
                        if (list.length > 2) {
                            break;
                        }
                    }
                    if (skills.length) {
                        event.list = list;
                        player.chooseControl(skills).set('dialog', ['评鉴：请选择尝试发动的技能', [list, 'character']]);
                    } else {
                        event.finish();
                    }
                    'step 1';
                    player.markAuto('zshy_pingjian', [result.control]);
                    if (player.getStorage('zshy_pingjian').includes(result.control)) {
                        player.addSkill(result.control);
                        player.chooseDrawRecover(true);
                    } else {
                        player.addTempSkill(result.control);
                    };
                    player.storage.zshy_pingjian_check[result.control] = 'phaseUse';
                    var name = event.list.find(name => (get.character(name)[3] || []).includes(result.control));
                    // if(name) lib.skill.rehuashen.createAudio(name,result.control,'xushao');
                    if (name) {
                        game.broadcastAll((player, name) => player.tempname.add(name), player, name);
                    }
                },
                ai: { order: 12, result: { player: 1 } },
            },
            check: {
                charlotte: true,
                trigger: { player: ['useSkill', 'logSkillBegin'] },
                sourceSkill: 'zshy_pingjian',
                filter(event, player) {
                    var info = get.info(event.skill);
                    if (info && info.charlotte) {
                        return false;
                    }
                    var skill = get.sourceSkillFor(event);
                    return player.storage.zshy_pingjian_check[skill];
                },
                direct: true,
                firstDo: true,
                priority: Infinity,
                content() {
                    var skill = get.sourceSkillFor(trigger);
                    player.removeSkill(skill);
                    const names = player.tempname && player.tempname.filter(i => (get.character(i)[3] || []).includes(skill));
                    if (names) {
                        game.broadcastAll((player, names) => player.tempname.removeArray(names), player, names);
                    }
                    delete player.storage.zshy_pingjian_check[skill];
                },
                group: 'zshy_pingjian_check2',
            },
            check2: {
                charlotte: true,
                trigger: {
                    player: ['damageEnd', 'phaseZhunbeiBegin', 'phaseJudgeBegin', 'phaseDrawBegin', 'phaseUseBegin', 'phaseDiscardBegin', 'phaseJieshuBegin'],
                },
                sourceSkill: 'zshy_pingjian',
                filter(event, player) {
                    return Object.keys(player.storage.zshy_pingjian_check).find(function (skill) {
                        if (event.name != 'damage') {
                            return player.storage.zshy_pingjian_check[skill] == event.name;
                        }
                        return player.storage.zshy_pingjian_check[skill] == event;
                    });
                },
                direct: true,
                lastDo: true,
                priority: -Infinity,
                content() {
                    var skills = Object.keys(player.storage.zshy_pingjian_check).filter(function (skill) {
                        if (trigger.name != 'damage') {
                            return player.storage.zshy_pingjian_check[skill] == trigger.name;
                        }
                        return player.storage.zshy_pingjian_check[skill] == trigger;
                    });
                    player.removeSkill(skills);
                    const names = player.tempname && player.tempname.filter(i => skills.some(skill => (get.character(i)[3] || []).includes(skill)));
                    if (names) {
                        game.broadcastAll((player, names) => player.tempname.removeArray(names), player, names);
                    }
                    for (var skill of skills) {
                        delete player.storage.zshy_pingjian_check[skill];
                    }
                },
            },
        },
    },

};
const 西晋 = {
};
const 神祇 = {
    //墟神曹丕
    zshy_yinzhi: {//阴鸷
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        usable: 1,
        charlotte: true,
        init(player, skill) {
            player.storage[skill] = {};
        },
        intro: {
            content(storage, player, skill) {
                let str = '';
                for (const id in storage) {
                    const target = game.playerMap[id] || lib.playerOL[id];
                    if (target) {
                        if (str.length) {
                            str += '<br>';
                        }
                        str += `${get.translation(target)}：${storage[id]}`;
                    }
                }
                return str;
            },
        },
        filterTarget: lib.filter.notMe,
        selectTarget: [1, Infinity],
        async content(event, trigger, player) {
            const { target, name } = event;
            player.addTempSkill(`${name}_clear`, { player: 'dieAfter' });
            const storage = player.getStorage(name, {});
            storage[target.playerid] ??= 0;
            storage[target.playerid] = ++storage[target.playerid];
            player.setStorage(name, storage, true);
            target.markAuto(`${name}_debuff`, player);
            target.addAdditionalSkill(`${name}_debuff_${player.playerid}`, `${name}_debuff`);
            target.addTempSkill(`${name}_reset`, { player: 'dieAfter' });
            target.markAuto(`${name}_reset`, player);
        },
        async contentAfter(event, trigger, player) {
            await player.draw(event.targets.length);
        },
        ai: {
            order: 10,
            result: {
                target(player, target) {
                    if (target.hasSkill('zshy_yinzhi_debuff')) {
                        return -1;
                    }
                    return -2;
                },
            },
        },
        subSkill: {
            clear: {
                charlotte: true,
                silent: true,
                onremove(player, skill) {
                    game.filterPlayer2(() => true, void 0, true).forEach(target => {
                        target.removeAdditionalSkill(`zshy_yinzhi_debuff_${player.playerid}`);
                        const storage = target.getStorage('zshy_yinzhi_reset');
                        if (storage.length == 1 && storage[0] == player) {
                            target.removeSkill('zshy_yinzhi_reset');
                        }
                    });
                },
                trigger: {
                    global: 'phaseBegin',
                },
                async content(event, trigger, player) {
                    trigger.player.removeAdditionalSkill(`zshy_yinzhi_debuff_${player.playerid}`);
                },
            },
            debuff: {
                charlotte: true,
                init(player, skill) {
                    player.addSkill('baiban');
                },
                onremove(player, skill) {
                    delete player.storage[skill];
                    player.removeSkill('baiban');
                },
                trigger: {
                    player: ['useCardAfter', 'respondAfter'],
                },
                getIndex(event, player) {
                    return player
                        .getStorage('zshy_yinzhi_debuff')
                        .filter(i => i.isIn())
                        .sortBySeat();
                },
                filter(event, player, name, target) {
                    return target.isIn() && target.getStorage('zshy_yinzhi', {})[player.playerid] > 0;
                },
                forced: true,
                popup: false,
                async content(event, trigger, player) {
                    const source = event.indexedData;
                    source.logSkill('zshy_yinzhi', player);
                    await source.draw(source.getStorage('zshy_yinzhi', {})[player.playerid]);
                    source.recover();
                },
            },
            reset: {
                charlotte: true,
                silent: true,
                onremove(player, skill) {
                    delete player.storage[skill];
                    player.removeGaintag(skill);
                },
                intro: {
                    content: '<li>回合内只能使用或打出本回合获得的牌',
                },
                mod: {
                    cardEnabled(card, player) {
                        if (_status.currentPhase != player) {
                            return;
                        }
                        let cards = [];
                        if (get.itemtype(card) == 'card') {
                            cards = [card];
                        } else {
                            cards = card.cards || [];
                        }
                        if (!cards.length) {
                            return;
                        }
                        if (cards.some(card => !card.hasGaintag('zshy_yinzhi_reset'))) {
                            return false;
                        }
                    },
                    cardRespondable(card, player) {
                        if (_status.currentPhase != player) {
                            return;
                        }
                        let cards = [];
                        if (get.itemtype(card) == 'card') {
                            cards = [card];
                        } else {
                            cards = card.cards || [];
                        }
                        if (!cards.length) {
                            return;
                        }
                        if (cards.some(card => !card.hasGaintag('zshy_yinzhi_reset'))) {
                            return false;
                        }
                    },
                    cardSavable(card, player) {
                        if (_status.currentPhase != player) {
                            return;
                        }
                        let cards = [];
                        if (get.itemtype(card) == 'card') {
                            cards = [card];
                        } else {
                            cards = card.cards || [];
                        }
                        if (!cards.length) {
                            return;
                        }
                        if (cards.some(card => !card.hasGaintag('zshy_yinzhi_reset'))) {
                            return false;
                        }
                    },
                },
                trigger: {
                    player: ['gainBegin', 'phaseBeforeStart', 'phaseAfter'],
                },
                filter(event, player) {
                    if (event.name == 'phase') {
                        return true;
                    }
                    if (event.name != 'damage') {
                        return _status.currentPhase == player && !event.gaintag.includes('zshy_yinzhi_reset');
                    }
                    return false;
                },
                async content(event, trigger, player) {
                    if (trigger.name == 'phase') {
                        player.removeGaintag(event.name);
                        return;
                    }
                    if (trigger.name != 'damage') {
                        trigger.gaintag.add(event.name);
                    }
                },
            },
        },
    },
    zshy_keming: {//刻名
        audio: 'ext:诸神寰宇/audio/character:2',
        charlotte: true,
        trigger: {
            player: 'damageEnd',
            source: 'damageSource',
        },
        filter(event, player, name) {
            return name == 'damageEnd' ? event.source?.isIn() && event.source != player : event.player?.isIn() && event.player != player && !player.getStorage('zshy_keming_effect').includes(event.player);
        },
        async cost(event, trigger, player) {
            if (event.triggername == 'damageSource') {
                event.result = { bool: true };
            } else {
                event.result = await player
                    .chooseBool({
                        prompt: get.prompt2(event.skill, trigger.source),
                        choice: true,
                    })
                    .forResult();
            }
        },
        logTarget(event, player, name) {
            return name == 'damageEnd' ? event.source : event.player;
        },
        async content(event, trigger, player) {
            const {
                targets: [target],
            } = event;
            if (event.triggername == 'damageSource') {
                player.addTempSkill(`${event.name}_effect`, { player: 'dieAfter' });
                player.markAuto(`${event.name}_effect`, target);
            } else {
                const checkTrigger = skill => {
                    if (player.hasSkill(skill, null, false, false)) {
                        return false;
                    }
                    const info = get.info(skill);
                    if (!info || info.charlotte) {
                        return false;
                    }
                    const list = [skill];
                    game.expandSkills(list);
                    const name = 'damageEnd';
                    for (const i of list) {
                        const info = get.info(i);
                        if (!info || !info.trigger || info.silent) {
                            return false;
                        }
                        const toArray = arr => {
                            return Array.isArray(arr) ? arr : !arr ? [] : [arr];
                        };
                        const triggers = [...toArray(info.trigger?.player), ...toArray(info.trigger?.global)];
                        if (triggers.includes(name)) {
                            if (info.ai && (info.ai.combo || info.ai.notemp || info.ai.neg)) {
                                return false;
                            }
                            if (info.init) {
                                return false;
                            }
                            if (typeof info.getIndex == 'function') {
                                try {
                                    const indexedResult = info.getIndex(trigger, player, name);
                                    if (Array.isArray(indexedResult)) {
                                        if (!info.filter || indexedResult.some(indexedData => info.filter(trigger, player, name, indexedData))) {
                                            return true;
                                        }
                                    }
                                    if (typeof indexedResult == 'number' && indexedResult > 0) {
                                        if (!info.filter || info.filter(trigger, player, name)) {
                                            return true;
                                        }
                                    }
                                    return false;
                                } catch (e) {
                                    return false;
                                }
                            } else if (info.filter) {
                                try {
                                    const bool = info.filter(trigger, player, name);
                                    if (!bool) {
                                        return false;
                                    }
                                } catch (e) {
                                    return false;
                                }
                            }
                            return true;
                        }
                    }
                };
                let skills = target.getStockSkills(true, true).filter(skill => checkTrigger(skill));
                if (!skills.length) {
                    if (!_status.characterlist) {
                        game.initCharacterList();
                    }
                    const list = _status.characterlist.filter(name => get.characterSurname(name).some(j => j[0] == '曹') && get.character(name).skills.some(skill => checkTrigger(skill)));
                    if (!list.length) {
                        player.chat('无将可用');
                        return;
                    }
                    skills = get
                        .character(list.randomGet())
                        .skills.filter(i => checkTrigger(i))
                        .randomGets(1);
                }
                player.addSkills(skills);
                player.recover();
            };
        },
        subSkill: {
            effect: {
                charlotte: true,
                onremove: true,
                trigger: { global: ['logSkill', 'useSkillAfter'] },
                intro: { content: 'players' },
                forced: true,
                filter(event, player) {
                    if (['global', 'equip'].includes(event.type) || !player.getStorage('zshy_keming_effect').includes(event.player)) {
                        return false;
                    }
                    let info = get.info(event.skill);
                    if (info && info.charlotte) {
                        return false;
                    }
                    const skill = get.sourceSkillFor(event);
                    info = get.info(skill);
                    const list = [skill];
                    game.expandSkills(list);
                    for (const i of list) {
                        const info = get.info(i);
                        if (!info || (!info.trigger && !info.enable) || info.silent) {
                            return false;
                        }
                        const toArray = arr => {
                            return Array.isArray(arr) ? arr : !arr ? [] : [arr];
                        };
                        const triggers = [...toArray(info.trigger?.player), ...toArray(info.trigger?.global), ...toArray(info.enable)];
                        if (triggers.some(i => ['phaseZhunbei', 'phaseJieshu', 'phaseUse', 'chooseToUse'].some(j => i.startsWith(j)))) {
                            const evtx = event.log_event || event;
                            const history = _status.globalHistory[_status.globalHistory.length - 1]['everything'].slice().reverse();
                            for (const evt of history) {
                                if (evt.player != event.player) {
                                    continue;
                                }
                                if (evt.name == 'useCard') {
                                    if (evt == evtx) {
                                        return true;
                                    } else if (evt.getParent(evtx.name) == evtx) {
                                        return true;
                                    }
                                }
                                if (evt.name == 'gain' && evt.getParent().name == 'draw') {
                                    if (evt.getParent(evtx.name) == evtx) {
                                        return true;
                                    }
                                }
                                if (evt == evtx) {
                                    break;
                                }
                            }
                        }
                    }
                    return false;
                },
                logTarget: 'player',
                async content(event, trigger, player) {
                    const {
                        targets: [target],
                    } = event;
                    player.unmarkAuto(event.name, target);
                    if (!player.getStorage(event.name).length) {
                        player.removeSkill(event.name);
                    }
                    const evtx = trigger.log_event || trigger;
                    const cards = [];
                    const skill = get.sourceSkillFor(trigger);
                    const history = _status.globalHistory[_status.globalHistory.length - 1]['everything'].slice().reverse();
                    for (const evt of history) {
                        if (evt.player != target) {
                            continue;
                        }
                        if (evt.name == 'useCard') {
                            if (evt == evtx || (game.findSkill(evt) == skill && evt.getParent(evtx.name) == evtx)) {
                                cards.push(evt.card);
                            }
                        }
                        if (evt.name == 'gain' && evt.getParent().name == 'draw') {
                            if (game.findSkill(evt) == skill && evt.getParent(evtx.name) == evtx) {
                                cards.push(...evt.cards);
                            }
                        }
                        if (evt == evtx) {
                            break;
                        }
                    }
                    const gain = [];
                    const names = cards.map(card => get.name(card, false)).unique();
                    for (let i = 0; i < cards.length; i++) {
                        const card = get.cardPile2(card => {
                            return names.includes(get.name(card)) && !gain.includes(card);
                        });
                        if (card) {
                            gain.push(card);
                        } else {
                            break;
                        }
                    }
                    if (gain.length) {
                        await player.gain({ cards: gain, animate: 'gain2' });
                    };
                    player.recover();
                },
            },
        },
        ai: {
            maixie: true,
        },
    },

    //墟神邓艾
    zshy_tuoyu: {//拓域
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: ['gainAfter'] },
        charlotte: true,
        forced: true,
        filter(event, player) {
            return player.countCards('h') > 0 && player.getStorage('zshy_tuoyu').length > 0;
        },
        async content(event, trigger, player) {
            let hs = player.getCards('h'),
                tags = ['zshy_tuoyu_fengtian', 'zshy_tuoyu_qingqu', 'zshy_tuoyu_junshan'];
            let storage = player.getStorage('zshy_tuoyu');
            for (let i = 0; i < hs.length; i++) {
                for (let card of hs) {
                    for (let j = 0; j < tags.length; j++) {
                        const tag = `${tags[j]}_tag`;
                        if (storage.includes(tags[j])) {
                            if (!card.hasGaintag(tag)) {
                                card.addGaintag(tag);
                            }
                        }
                    }
                }
            };
        },
        intro: {
            content: '已激活的副区域：$',
        },
        group: 'zshy_tuoyu_effect',
        subSkill: {
            effect: {
                mod: {
                    targetInRange(card, player, target) {
                        if (get.suit(card) == 'unsure') {
                            return true;
                        }
                        if (!card.cards) {
                            return;
                        }
                        for (var i of card.cards) {
                            if (i.hasGaintag('zshy_tuoyu_qingqu_tag')) {
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
                            if (i.hasGaintag('zshy_tuoyu_qingqu_tag')) {
                                return Infinity;
                            }
                        }
                    },
                },
                audio: 'zshy_tuoyu',
                trigger: { player: 'useCard' },
                forced: true,
                filter(event, player) {
                    const tags = ['zshy_tuoyu_fengtian_tag', 'zshy_tuoyu_qingqu_tag', 'zshy_tuoyu_junshan_tag'],
                        card = event.card;
                    return player.hasHistory('lose', function (evt) {
                        const evtx = evt.relatedEvent || evt.getParent();
                        if (evtx != event) {
                            return false;
                        }
                        for (const i in evt.gaintag_map) {
                            for (const tag of evt.gaintag_map[i]) {
                                if (tags.includes(tag)) {
                                    return true;
                                }
                            }
                        }
                        return false;
                    });
                },
                content() {
                    const tags = ['zshy_tuoyu_fengtian_tag', 'zshy_tuoyu_qingqu_tag', 'zshy_tuoyu_junshan_tag'],
                        card = trigger.card;
                    player.hasHistory('lose', function (evt) {
                        const evtx = evt.relatedEvent || evt.getParent();
                        if (evtx != trigger) {
                            return false;
                        }
                        for (const i in evt.gaintag_map) {
                            tags.removeArray(evt.gaintag_map[i]);
                        }
                        return tags.length == 0;
                    });
                    if (!tags.includes('zshy_tuoyu_fengtian_tag')) {
                        if (get.tag(card, 'damage') > 0 || get.tag(card, 'recover') > 0) {
                            trigger.baseDamage++;
                            game.log(card, '的伤害值/回复值+1');
                        }
                    }
                    if (!tags.includes('zshy_tuoyu_qingqu_tag')) {
                        if (trigger.addCount !== false) {
                            trigger.addCount = false;
                            let stat = player.getStat('card');
                            if (stat[card.name] && stat[card.name] > 0) {
                                stat[card.name]--;
                            }
                            game.log(card, '不计入次数限制');
                        }
                    }
                    if (!tags.includes('zshy_tuoyu_junshan_tag')) {
                        game.log(card, '不可被响应');
                        trigger.directHit.addArray(game.filterPlayer());
                    }
                },
            },
        },
        ai: {
            combo: 'zshy_xianjin',
        },
    },
    zshy_xianjin: {//险进
        init(player) {
            var num = game.getAllGlobalHistory('changeHp', evt => {
                return evt.getParent().name == 'damage' && (evt.getParent().player == player || (evt.getParent().source && evt.getParent().source == player));
            }).concat(
                game.getAllGlobalHistory('changeHp', evt => {
                    return evt.getParent().name == 'damage' && evt.getParent().player == player && evt.getParent().source && evt.getParent().source == player;
                })
            ).length;
            if (num) {
                player.addMark('zshy_xianjin', num, false);
            }
        },
        onremove: true,
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'damageEnd',
            source: 'damageSource',
        },
        filter(event, player) {
            return player.countMark('zshy_xianjin') % 1 == 0;
        },
        charlotte: true,
        forced: true,
        content() {
            'step 0';
            var tags = ['zshy_tuoyu_fengtian', 'zshy_tuoyu_qingqu', 'zshy_tuoyu_junshan'];
            tags.removeArray(player.getStorage('zshy_tuoyu'));
            if (!tags.length) {
                player.draw(3);
                event.finish();
            } else if (tags.length == 1) {
                event._result = { control: tags[0] };
            } else {
                player.chooseControl(tags).set('prompt', '险峻：选择激活一个副区域标签');
            }
            'step 1';
            var control = result.control;
            game.log(player, '激活了副区域', '#y' + get.translation(control));
            player.markAuto('zshy_tuoyu', [control]);
            player.popup(get.translation(control + '_tag'));
            player.draw();
        },
        group: 'zshy_xianjin_mark',
        intro: { content: '已造成或受到#次伤害' },
        subSkill: {
            mark: {
                charlotte: true,
                trigger: {
                    player: 'damageEnd',
                    source: 'damageSource',
                },
                forced: true,
                popup: false,
                firstDo: true,
                content() {
                    player.addMark('zshy_xianjin', 1, false);
                },
            },
        },
        ai: {
            effect: {
                player(card, player, target) {
                    if (!get.tag(card, 'damage') || player.countMark('zshy_xianjin') % 2 || player.hasSkillTag('jueqing', false, target)) {
                        return;
                    }
                    if (player.isMaxHandcard()) {
                        return [1, 1];
                    }
                    return [1, Math.min(3, 1 + player.getStorage('zshy_tuoyu').length)];
                },
            },
        },
    },
    zshy_qijing: {//奇径
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: 'phaseEnd' },
        filter(event, player) {
            return player.getStorage('zshy_tuoyu').length == 3;
        },
        forced: true,
        charlotte: true,
        juexingji: true,
        derivation: 'zshy_cuixin',
        skillAnimation: true,
        animationColor: 'orange',
        seatRelated: 'changeSeat',
        content() {
            'step 0';
            player.awakenSkill(event.name);
            player.addSkills('zshy_cuixin');
            'step 1';
            if (game.countPlayer() > 2) {
                if (player == trigger.player && !trigger.skill) {
                    var evt = trigger.getParent();
                    if (evt.name == 'phaseLoop' && evt._isStandardLoop) {
                        evt.player = player.previous;
                        _status.lastPhasedPlayer = player.next;
                    }
                }
                player
                    .chooseTarget(
                        '请选择一名要更换座次的角色，将自己移动到该角色的上家位置',
                        function (card, player, target) {
                            return target != player && target != player.next;
                        },
                        true
                    )
                    .set('ai', function (target) {
                        var player = _status.event.player;
                        var current = _status.currentPhase?.next;
                        var max = 20,
                            att = 0;
                        while (max > 0) {
                            max--;
                            if (current == target) {
                                return att;
                            }
                            att -= get.attitude(player, current);
                            current = current.next;
                        }
                        return att;
                    });
            } else {
                event.finish();
            }
            'step 2';
            if (result.bool) {
                var target = result.targets[0];
                game.broadcastAll(
                    function (target1, target2) {
                        game.swapSeat(target1, target2, null, true);
                    },
                    player,
                    target
                );
            } else {
                event.finish();
            }
            'step 3';
            player.insertPhase();
        },
        ai: {
            combo: 'zshy_tuoyu',
        },
    },
    zshy_cuixin: {//摧心
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'useCardAfter' },
        filter(event, player) {
            if (!event._zshy_cuixin || get.type(event.card, null, false) == 'delay' || get.type(event.card, null, false) == 'equip') {
                return false;
            }
            var card = {
                name: event.card.name,
                nature: event.card.nature,
                isCard: true,
            },
                list = event._zshy_cuixin;
            for (var target of list) {
                var targetx = player[target]();
                if (lib.filter.targetEnabled2(card, targetx, player)) {
                    return true;
                }
            }
            return false;
        },
        charlotte: true,
        direct: true,
        content() {
            'step 0';
            var card = {
                name: trigger.card.name,
                nature: trigger.card.nature,
                isCard: true,
            };
            event.card = card;
            var list = [];
            trigger._zshy_cuixin.forEach(target => {
                var targetx = player[target]();
                if (lib.filter.targetEnabled2(card, targetx, player)) {
                    list.add(targetx);
                }
            });
            if (list.length == 1) {
                event.target = list[0];
                player
                    .chooseBool('摧心：是否视为对' + get.translation(list[0]) + '使用' + get.translation(card) + '？')
                    .set('goon', get.effect(list[0], card, player, player) > 0)
                    .set('ai', () => _status.event.goon);
            } else {
                player
                    .chooseTarget('摧心：是否视为对上家或下家使用' + get.translation(card) + '？', '操作提示：从上家或下家中选择一名角色作为使用目标', function (card, player, target) {
                        return (target == player.getNext() || target == player.getPrevious()) && lib.filter.targetEnabled2(_status.event.getParent().card, target, player);
                    })
                    .set('ai', function (target) {
                        var player = _status.event.player;
                        return get.effect(target, _status.event.getParent().card, player, player);
                    });
            }
            'step 1';
            if (result.bool) {
                var target = event.target || result.targets[0];
                player.useCard(card, target, false, 'zshy_cuixin');
            }
        },
        group: 'zshy_cuixin_silent',
        subSkill: {
            silent: {
                trigger: { player: 'useCardToPlayered' },
                silent: true,
                forced: true,
                popup: false,
                firstDo: true,
                charlotte: true,
                filter(event, player) {
                    if (!event.isFirstTarget || event.getParent().skill == 'zshy_cuixin') {
                        return false;
                    }
                    if (event.targets.length == 0) {
                        return false;
                    }
                    return event.targets.includes(player.getNext()) || event.targets.includes(player.getPrevious());
                },
                content() {
                    var list = [];
                    if (trigger.targets.includes(player.getNext())) {
                        list.push('getPrevious');
                    }
                    if (trigger.targets.includes(player.getPrevious())) {
                        list.push('getNext');
                    }
                    trigger.getParent()._zshy_cuixin = list;
                },
            },
        },
    },

    //墟神黄忠
    zshy_lieqiong: {//裂穹
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'damageBefore',
        },
        charlotte: true,
        filter(event, player) {
            return event.player != player && event.player.isIn();
        },
        check(event, player) {
            return get.attitude(player, event.player) < 0;
        },
        prompt2(event, player) {
            return '令' + get.translation(event.player) + '立即结算濒死';
        },
        async content(event, trigger, player) {
            let target = trigger.player;
            target.hp = 0;
            await target.update();
            event._dyinged = true;
            await target.dying(event);
            await player.gainMaxHp();
            player.chooseDrawRecover(3, true);
            //if (!trigger.player.isIn()) { }
        },
        ai: {
            expose: 0.3,
        },
    },
    zshy_SHZzhanjue: {//斩决
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: ['phaseZhunbeiBegin', 'phaseJieshuBegin'],
        },
        charlotte: true,
        forced: true,
        filter(event, player) {
            if (event.name == 'phaseJieshu') {
                return player.isDamaged();
            }
            return true;
        },
        async content(event, trigger, player) {
            if (trigger.name == 'phaseZhunbei') {
                player.draw(player.getHp());
            } else {
                player.draw(player.getDamagedHp());
            };
        },
        mod: {
            targetInRange(card) {
                if (get.tag(card, 'damage') == true) return true;
            },
        },
        group: ['zshy_SHZzhanjue_directHit', 'zshy_SHZzhanjue_recover'],
        subSkill: {
            directHit: {
                audio: 'zshy_SHZzhanjue',
                trigger: {
                    player: 'useCard',
                },
                charlotte: true,
                forced: true,
                firstDo: true,
                filter(event, player) {
                    return get.tag(event.card, 'damage') == true;
                },
                async content(event, trigger, player) {
                    trigger.directHit.addArray(game.players);
                    game.log(trigger.card, '不可被响应');
                },
            },
            recover: {
                audio: 'zshy_SHZzhanjue',
                trigger: {
                    source: 'damageAfter',
                },
                charlotte: true,
                forced: true,
                firstDo: true,
                filter(event, player) {
                    return player.isDamaged();
                },
                async content(event, trigger, player) {
                    player.recover(trigger.num);
                },
            },
        },
    },

    //墟神姜维
    zshy_jiufa: {//九伐
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: ['useCardAfter', 'respondAfter'] },
        charlotte: true,
        frequent: true,
        filter(event, player) {
            return event.zshy_jiufa_counted && player.getStorage('zshy_jiufa').length >= 9;
        },
        content() {
            'step 0';
            player.unmarkSkill(event.name);
            event.cards = get.cards(9);
            event.cards.sort(function (a, b) {
                return get.number(b) - get.number(a);
            });
            game.cardsGotoOrdering(event.cards);
            event.videoId = lib.status.videoId++;
            game.broadcastAll(
                function (player, id, cards) {
                    var str;
                    if (player == game.me && !_status.auto) {
                        str = '九伐：选择任意张点数满足条件的牌';
                    } else {
                        str = '九伐';
                    }
                    var dialog = ui.create.dialog(str, cards);
                    dialog.videoId = id;
                },
                player,
                event.videoId,
                event.cards
            );
            event.time = get.utc();
            game.addVideo('showCards', player, ['九伐', get.cardsInfo(event.cards)]);
            game.addVideo('delay', null, 2);
            'step 1';
            var next = player.chooseButton([0, 9], true);
            next.set('dialog', event.videoId);
            next.set('filterButton', function (button) {
                var num = get.number(button.link),
                    cards = _status.event.getParent().cards;
                for (var i of ui.selected.buttons) {
                    if (get.number(i.link) == num) return false;
                }
                return true;
            });
            next.set('ai', function (button) {
                return get.value(button.link, _status.event.player);
            });
            'step 2';
            if (result.bool && result.links && result.links.length) {
                event.cards2 = result.links;
            }
            var time = 1000 - (get.utc() - event.time);
            if (time > 0) {
                game.delay(0, time);
            }
            'step 3';
            game.broadcastAll('closeDialog', event.videoId);
            var cards2 = event.cards2;
            if (cards2 && cards2.length) {
                player.gain(cards2, 'log', 'gain2');
                player.gainMaxHp(9 - cards2.length);
                player.recover(9 - cards2.length);
            }
            else {
                player.gainMaxHp(9);
                player.recover(9);
            }
        },
        marktext: '九伐',
        intro: {
            content: '已记录牌名：$',
            onunmark: true,
        },
        group: 'zshy_jiufa_count',
        subSkill: {
            count: {
                trigger: { global: ['useCard1', 'respond'] },
                forced: true,
                charlotte: true,
                popup: false,
                firstDo: true,
                filter(event, player) {
                    return !player.getStorage('zshy_jiufa').includes(event.card.name);
                },
                content() {
                    trigger.zshy_jiufa_counted = true;
                    player.markAuto('zshy_jiufa', [trigger.card.name]);
                },
            },
        },
    },
    zshy_tianren: {//天任
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: ['loseAfter', 'cardsDiscardAfter', 'loseAsyncAfter'] },
        charlotte: true,
        forced: true,
        filter(event, player) {
            if (event.name.indexOf('lose') === 0) {
                if (event.getlx === false || event.position != ui.discardPile) return false;
            } else {
                var evt = event.getParent();
                if (evt.relatedEvent && evt.relatedEvent.name == 'useCard') return false;
            }
            for (var i of event.cards) {
                var owner = false;
                if (event.hs && event.hs.includes(i)) owner = event.player;
                var type = get.type(i, null, owner);
                if (type == 'basic' || type == 'trick') return true;
            }
            return false;
        },
        content() {
            var num = 0;
            for (var i of trigger.cards) {
                var owner = false;
                if (trigger.hs && trigger.hs.includes(i)) owner = trigger.player;
                var type = get.type(i, null, owner);
                if (type == 'basic' || type == 'trick') num++;
            }
            player.addMark('zshy_tianren', num);
        },
        group: 'zshy_tianren_maxHp',
        intro: { content: 'mark' },
        subSkill: {
            maxHp: {
                trigger: { player: ['zshy_tianrenAfter', 'gainMaxHpAfter', 'loseMaxHpAfter'] },
                charlotte: true,
                forced: true,
                filter(event, player) {
                    return player.countMark('zshy_tianren') >= player.maxHp;
                },
                content() {
                    player.removeMark('zshy_tianren', player.maxHp);
                    player.gainMaxHp();
                    player.recover();
                    player.draw(2);
                },
            },
        },
    },
    zshy_pingxiang: {//平襄
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        charlotte: true,
        skillAnimation: true,
        animationColor: 'ice',
        filter(event, player) {
            return player.maxHp > 9;
        },
        content() {
            'step 0';
            player.loseMaxHp(9);
            event.num = 0;
            'step 1';
            event.num++;
            player.chooseUseTarget({ name: 'sha', nature: 'fire', isCard: true, },
                '请选择火【杀】的目标（' + (event.num == 9 ? '⑨' : event.num) + '/9）', false);
            'step 2';
            if (result.bool && event.num < 9) event.goto(1);
        },
        mod: {
            maxHandcardBase(player) {
                return player.maxHp;
            },
        },
        ai: {
            order() {
                return get.order({
                    name: 'sha',
                    nature: 'fire',
                    isCard: true,
                });
            },
            result: {
                player(player) {
                    if (
                        player.hasValueTarget({
                            name: 'sha',
                            nature: 'fire',
                            isCard: true,
                        })
                    )
                        return 1;
                    return 0;
                },
            },
            combo: 'zshy_tianren',
        },
    },

    //墟神庞统
    zshy_luansuo: {//鸾锁
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'phaseBegin' },
        filter(event, player) {
            return game.hasPlayer(target => target.countCards('h'));
        },
        charlotte: true,
        forced: true,
        logTarget(event, player) {
            return game.filterPlayer(target => target.countCards('h'));
        },
        content() {
            for (const i of event.targets) {
                if (event.target != player) i.addTempSkill('zshy_luansuo_debuff');
                if (event.target != player) i.addGaintag(i.getCards('h'), 'zshy_luansuo_debuff');
            }
        },
        global: 'zshy_luansuo_discard',
        subSkill: {
            discard: {
                charlotte: true,
                mod: {
                    cardDiscardable(card) {
                        if (_status.currentPhase?.hasSkill('zshy_luansuo') && get.position(card) === 'h') return false;
                    },
                    canBeDiscarded(card) {
                        if (_status.currentPhase?.hasSkill('zshy_luansuo') && get.position(card) === 'h') return false;
                    },
                },
            },
            debuff: {
                mod: {
                    cardname(card) {
                        if (get.itemtype(card) !== 'card' || get.position(card) !== 'h') return;
                        if (card.hasGaintag('zshy_luansuo_debuff')) return 'tiesuo';
                    },
                    cardnature(card) {
                        if (get.itemtype(card) !== 'card' || get.position(card) !== 'h') return;
                        if (card.hasGaintag('zshy_luansuo_debuff')) return false;
                    },
                    aiOrder(player, card, num) {
                        if (num > 0 && get.name(card, player) === 'huogong') return 0;
                    },
                    aiValue(player, card, num) {
                        if (num > 0 && get.name(card, player) === 'huogong') return 0.01;
                    },
                    aiUseful(player, card, num) {
                        if (num > 0 && get.name(card, player) === 'huogong') return 0;
                    },
                },
                charlotte: true,
                onremove(player, skill) {
                    player.removeGaintag(skill);
                },
            },
        },
    },
    zshy_fengliao: {//凤燎
        audio: 'ext:诸神寰宇/audio/character:2',
        zhuanhuanji: true,
        mark: true,
        marktext: '☯',
        intro: {
            content(storage) {
                if (storage) return '你使用牌指定目标后，你对其造成1点火焰伤害。';
                return '你使用牌指定目标后，你摸一张牌。';
            },
        },
        trigger: { player: 'useCardToPlayered' },
        charlotte: true,
        forced: true,
        logTarget: 'target',
        async content(event, trigger, player) {
            player.changeZhuanhuanji('zshy_fengliao');
            const { target } = trigger;
            if (player.storage.zshy_fengliao) {
                await player.draw();
            } else {
                await target.damage('fire', player);
            }
        },
        mod: {
            aiOrder(player, card, num) {
                if (num > 0) {
                    const select = get.info(card).selectTarget;
                    let range;
                    if (select == undefined) range = [1, 1];
                    else if (typeof select == 'number') range = [select, select];
                    else if (get.itemtype(select) == 'select') range = select;
                    else if (typeof select == 'function') range = select(card, player);
                    game.checkMod(card, player, range, 'selectTarget', player);
                    if ((() => {
                        if (!(() => {
                            if (range[1] !== -1) return range[1] <= 1;
                            return game.countPlayer(i => player.canUse(card, i)) === 1;
                        })()) return false;
                        let targets = game.filterPlayer(i => player.canUse(card, i));
                        if (!targets.length) return false;
                        _status._zshy_fengliao_check = true;
                        targets.sort((a, b) => get.effect(b, card, player, player) - get.effect(a, card, player, player));
                        delete _status._zshy_fengliao_check;
                        return (player.storage.zshy_fengliao ? get.damageEffect(targets[0], player, player, 'fire') : get.effect(targets[0], { name: 'draw' }, player, player)) > 0;
                    })()) return num + 15;
                }
            },
        },
        ai: {
            fireAttack: true,
            effect: {
                player(card, player, target) {
                    if (_status._zshy_fengliao_check) return;
                    if (!typeof card !== 'object' || !player || !target) return;
                    const select = get.info(card).selectTarget;
                    let range;
                    if (select == undefined) range = [1, 1];
                    else if (typeof select == 'number') range = [select, select];
                    else if (get.itemtype(select) == 'select') range = select;
                    else if (typeof select == 'function') range = select(card, player);
                    game.checkMod(card, player, range, 'selectTarget', player);
                    if ((() => {
                        if (range[1] !== -1) return !ui.selected.targets.length;
                        return !game.hasPlayer(i => i !== target && player.canUse(card, i));
                    })()
                    ) return [1, (() => {
                        _status._zshy_fengliao_check = true;
                        const num = player.storage.zshy_fengliao ? get.damageEffect(target, player, player, 'fire') : get.effect(target, { name: 'draw' }, player, player);
                        delete _status._zshy_fengliao_check;
                        return num;
                    })(),];
                },
            },
        },
    },
    zshy_kunyu: {//鹍浴
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'dieBegin' },
        filter(event, player) {
            if (!(event.getParent().name !== 'giveup' && player.maxHp > 0)) return false;
            return get.cardPile(c => get.tag(c, 'fireDamage'));
        },
        charlotte: true,
        forced: true,
        async content(event, trigger, player) {
            const card = get.cardPile(c => get.tag(c, 'fireDamage'));
            if (!card) return;
            await game.cardsGotoSpecial(card);
            game.log(player, '将', card, '移出游戏');
            trigger.cancel();
            await player.recoverTo(1);
            Promise.all(game.filterPlayer(function (current) {
                return current != player;
            }).map(function (target) {
                target.damage('fire');
            }))
        },
        group: 'zshy_kunyu_debuff',
        subSkill: {
            debuff: {
                trigger: {
                    global: 'phaseBefore',
                    player: ['gainMaxHpBegin', 'loseMaxHpBegin', 'enterGame'],
                },
                charlotte: true,
                forced: true,
                filter(event, player) {
                    let bool = player.maxHp !== 1;
                    if (event.name === 'phase') return bool && game.phaseNumber === 0;
                    return true;
                },
                async content(event, trigger, player) {
                    if (['gainMaxHp', 'loseMaxHp'].includes(trigger.name)) {
                        trigger.cancel();
                    } else {
                        player.maxHp = 1;
                        player.update();
                    }
                },
            },
        },
    },

    //墟神马超
    zshy_shouli: {//狩骊
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: ['chooseToUse', 'chooseToRespond'],
        charlotte: true,
        hiddenCard(player, name) {
            if (player != _status.currentPhase && (name == 'sha' || name == 'shan')) return true;
        },
        filter(event, player) {
            if (event.responded || event.zshy_shouli || event.type == 'wuxie') return false;
            if (game.hasPlayer(function (current) {
                return current.getCards('e', card => get.type(card) == 'equip' && get.color(card) == 'black').length > 0;
            }) && event.filterCard({
                name: 'sha',
                storage: { zshy_shouli: true },
            }, player, event)) return true;
            if (game.hasPlayer(function (current) {
                return current.getCards('e', card => get.type(card) == 'equip' && get.color(card) != 'black').length > 0;
            }) && event.filterCard({
                name: 'shan',
                storage: { zshy_shouli: true },
            }, player, event)) return true;
            return false;
        },
        delay: false,
        filterTarget(card, player, target) {
            var event = _status.event, evt = event;
            if (event._backup) evt = event._backup;
            var eqshan = target.getCards('e', card => get.type(card, false) == 'equip' && get.color(card) != 'black');
            var eqsha = target.getCards('e', card => get.type(card, false) == 'equip' && get.color(card) == 'black');
            if (eqshan.length && eqshan.some(card => evt.filterCard(get.autoViewAs({
                name: 'shan',
                storage: { zshy_shouli: true },
            }, [card]), player, event))) return true;
            return eqsha.some(card => {
                var sha = get.autoViewAs({
                    name: 'sha',
                    storage: { zshy_shouli: true },
                }, [card]);
                if (evt.filterCard(sha, player, event)) {
                    if (!evt.filterTarget) return true;
                    return game.hasPlayer(function (current) {
                        return evt.filterTarget(sha, player, current);
                    })
                };
            })
        },
        prompt: '将场上一张黑/非黑色装备牌当作【杀】/【闪】使用或打出',
        content() {
            'step 0'
            var evt = event.getParent(2);
            evt.set('zshy_shouli', true);
            var list = [];
            var eqshan = target.getCards('e', card => get.type(card, false) == 'equip' && get.color(card) != 'black');
            var eqsha = target.getCards('e', card => get.type(card, false) == 'equip' && get.color(card) == 'black');
            var backupx = _status.event;
            _status.event = evt;
            try {
                if (eqshan.length && eqshan.some(card => {
                    var shan = get.autoViewAs({
                        name: 'shan',
                        storage: { zshy_shouli: true },
                    }, [card]);
                    if (evt.filterCard(shan, player, event)) return true;
                    return false;
                })) list.push('shan');
                if (eqsha.length && eqsha.some(card => {
                    var sha = get.autoViewAs({
                        name: 'sha',
                        storage: { zshy_shouli: true },
                    }, [card]);
                    if (evt.filterCard(sha, player, evt) && (!evt.filterTarget || game.hasPlayer(function (current) {
                        return evt.filterTarget(sha, player, current);
                    }))) return true;
                    return false;
                })) list.push('sha');
            } catch (e) { game.print(e) };
            _status.event = backupx;
            if (list.length == 1) {
                event.cardName = list[0];
                var cards = list[0] == 'shan' ? eqshan : eqsha;
                if (cards.length == 1) event._result = {
                    bool: true,
                    links: [cards[0]],
                }
                else player.choosePlayerCard(true, target, 'e').set('filterButton', function (button) {
                    return _status.event.cards.includes(button.link);
                }).set('cards', cards)
            }
            else player.choosePlayerCard(true, target, 'e');
            'step 1'
            var evt = event.getParent(2);
            if (result.bool && result.links && result.links.length) {
                var name = (event.cardName || get.type(result.links[0]) == 'equip' && (get.color(result.links[0]) == 'black' ? 'sha' : 'shan'));
                if (evt.name == 'chooseToUse') {
                    game.broadcastAll(function (result, name) {
                        lib.skill.zshy_shouli_backup.viewAs = {
                            name: name,
                            cards: [result],
                            storage: { zshy_shouli: true },
                        };
                        lib.skill.zshy_shouli_backup.prompt = ('选择' + get.translation(name) + '（' + get.translation(result) + '）的目标');
                    }, result.links[0], name);
                    evt.set('_backupevent', 'zshy_shouli_backup');
                    evt.backup('zshy_shouli_backup');
                    evt.set('openskilldialog', '选择' + get.translation(name) + '（' + get.translation(result.links[0]) + '）的目标');
                    evt.set('norestore', true);
                    evt.set('custom', {
                        add: {},
                        replace: { window() { } }
                    });
                }
                else {
                    delete evt.result.skill;
                    delete evt.result.used;
                    evt.result.card = get.autoViewAs({
                        name: name,
                        cards: [result.links[0]],
                        storage: { zshy_shouli: true },
                    }, result.links);
                    evt.result.cards = [result.links[0]];
                    target.$give(result.links[0], player, false);
                    evt.redo();
                    return;
                }
            }
            evt.goto(0);
        },
        ai: {
            respondSha: true,
            respondShan: true,
            skillTagFilter(player, tag) {
                if (tag == 'respondSha') return game.hasPlayer(function (current) {
                    return current.hasCard(card => get.type(card, false) == 'equip' && get.color(card, false) == 'black', 'e');
                });
                return game.hasPlayer(function (current) {
                    return current.hasCard(card => get.type(card, false) == 'equip' && get.color(card, false) != 'black', 'e');
                });
            },
            order() {
                return [2, 4, 6].randomGet();
            },
            result: {
                player(player, target) {
                    var att = Math.max(8, get.attitude(player, target));
                    if (_status.event.type != 'phase') return 9 - att;
                    if (!player.hasValueTarget({ name: 'sha' })) return 0;
                    return 9 - att;
                },
            },
        },
        mod: {
            cardUsable(card) {
                if (card.storage && card.storage.zshy_shouli) return Infinity;
            },
            targetInRange(card) {
                if (card.storage && card.storage.zshy_shouli) return true;
            },
            globalFrom(from, to, distance) {
                var num = game.countPlayer(function (current) {
                    return current.countCards('ej') > 0;
                });
                if (num > 0) return distance - num;
            },
        },
        group: 'zshy_shouli_Equip',
        subSkill: {
            Equip: {
                audio: 'ext:诸神寰宇/audio/character:2',
                trigger: {
                    global: 'phaseZhunbeiBegin',
                },
                charlotte: true,
                'prompt2'(event, player) {
                    return '你可以令所有角色依次执行一项：①使用一张装备牌并摸一张牌；②随机使用牌堆或弃牌堆中一张装备牌。';
                },
                content() {
                    'step 0'
                    event.targets = game.filterPlayer().sortBySeat(player);
                    event.target = event.targets.shift();
                    game.delayx();
                    'step 1'
                    var str = '狩骊：使用一张装备牌并摸一张牌，或随机使用牌堆或弃牌堆中一张装备牌';
                    player.line(target, 'green');
                    if (!target.countCards('hs', { type: 'equip' })) event._result = { bool: false };
                    else target.chooseToUse(str, function (card, player, event) {
                        if (get.type(card) != 'equip') return false;
                        return lib.filter.filterCard.apply(this, arguments);
                    }).set('ai', () => 1);
                    'step 2'
                    if (result.bool) target.draw();
                    else {
                        var card = get.cardPile(function (card) {
                            var type = get.subtype(card);
                            if (get.type(card) != 'equip') return false;
                            return target.canUse(card, target);
                        });
                        if (card) target.chooseUseTarget(card, 'nopopup', 'noanimate', true);
                    }
                    'step 3'
                    event.target = event.targets.shift();
                    if (event.target) event.goto(1);
                },
            },
            backup: {
                precontent() {
                    'step 0'
                    var result = event._result;
                    if (!result?.card?.cards) return;
                    var cards = result.card.cards;
                    event.result.cards = cards;
                    event.result._apply_args = { addSkillCount: false };
                    var owner = get.owner(cards[0]);
                    event.target = owner;
                    if (owner && player) {
                        owner.$give(cards[0], player, false);
                        player.popup(event.result.card.name, 'metal');
                        game.delayx();
                    }
                    event.getParent().addCount = false;
                },
                filterCard() {
                    return false;
                },
                prompt: '请选择【杀】的目标',
                selectCard: -1,
                log: false,
            }
        },
    },
    zshy_hengwu: {//横骛
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: ['useCard', 'respond'],
        },
        charlotte: true,
        direct: true,
        locked: true,
        firstDo: true,
        filter(event, player) {
            var suit = get.suit(event.card);
            var type = get.type(event.card);
            if (!player.hasCard(function (card) {
                return get.suit(card, player) == suit;
            }, 'h')) return true;
            if (type == 'basic') {
                return game.hasPlayer(function (current) {
                    return current != player && !current.hasSkill('baiban');
                });
            }
            return false;
        },
        content() {
            'step 0'
            var suit = get.suit(trigger.card);
            if (!player.hasCard(function (card) {
                return get.suit(card, player) == suit;
            }, 'h')) {
                var num = game.countPlayer(function (current) {
                    return current.countCards('ej', function (card) {
                        return get.suit(card, current) == suit;
                    });
                });
                player.logSkill('zshy_hengwu');
                player.chooseDrawRecover(Math.max(1, num), true);
            }
            'step 1'
            var type = get.type(trigger.card);
            if ((type == 'basic') && game.hasPlayer(function (current) {
                return current != player && !current.hasSkill('baiban');
            })) {
                var str = '令任意名其他角色本回合非状态技失效';
                player.chooseTarget(get.prompt('zshy_hengwu'), str, [1, Infinity], function (card, player, target) {
                    return target != player && !target.hasSkill('baiban');
                }).set('ai', function (target) {
                    var att = get.attitude(_status.event.player, target);
                    if (target == _status.currentPhase) return -att * 2;
                    return -att * Math.min(4, target.hp);
                });
            }
            else event.finish();
            'step 2'
            if (result.bool) {
                player.logSkill('zshy_hengwu', target);
                let targets = result.targets.sortBySeat();
                Promise.all(targets.map(function (target) {
                    target.addTempSkill('baiban', { player: 'phaseBegin' });
                }))
            }
        },
        group: 'zshy_hengwu_Damage',
        subSkill: {
            Damage: {
                audio: 'zshy_hengwu',
                trigger: {
                    global: 'damageBefore',
                },
                charlotte: true,
                direct: true,
                filter(event, player) {
                    var target = event.player;
                    return target.isIn() && (target.hasSkill('fengyin') || target.hasSkill('baiban'));
                },
                content() {
                    'step 0'
                    var list = [
                        '令' + get.translation(trigger.player) + '摸两张牌并恢复非锁定或状态技',
                        '令' + get.translation(trigger.player) + '受到的伤害翻倍并改为雷属性',
                    ];
                    player.chooseControl('cancel2').set('choiceList', list).set('ai', function () {
                        var target = trigger.player, att = get.attitude(player, target);
                        var eff = get.damageEffect(target, player, player, 'thunder');
                        if (att > 0) return 0;
                        if (att < 0 && eff > 0) return 1;
                        return 'cancel2';
                    });
                    'step 1'
                    if (result.control != 'cancel2') {
                        var target = trigger.player;
                        player.logSkill('zshy_hengwu', target);
                        if (result.index == 0) {
                            target.draw(2);
                            target.removeSkill('fengyin');
                            target.removeSkill('baiban');
                        }
                        else {
                            trigger.num += trigger.num;
                            game.setNature(trigger, 'thunder');
                        }
                    }
                },
            },
        },
    },

    //墟神许褚
    zshy_zhengqing: {//争擎
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: 'phaseEnd' },
        charlotte: true,
        forced: true,
        filter() {
            return (
                game.hasPlayer(current => {
                    return current.countMark('zshy_zhengqing');
                }) || lib.skill.zshy_zhengqing.getMostInfoLastRound()[0] > 0
            );
        },
        getMostInfoLastRound() {
            let max = -1,
                players = [];
            const history = game.getAllGlobalHistory();
            if (history.length <= 1) {
                return [max, players];
            }
            for (let i = history.length - 1; i >= 0; i--) {
                const evts = history[i]['everything'].filter(evt => {
                    if (evt.name !== 'damage') {
                        return false;
                    }
                    const source = evt.source;
                    return source && source.isIn();
                });
                if (evts.length) {
                    let curMax = -1,
                        curPlayers = [];
                    const map = {};
                    for (const evt of evts) {
                        const source = evt.source;
                        const id = source.playerid;
                        if (typeof map[id] !== 'number') {
                            map[id] = 0;
                        }
                        map[id] += evt.num;
                        if (map[id] > curMax) {
                            curMax = map[id];
                            curPlayers = [source];
                        } else if (map[id] == curMax) {
                            curPlayers.add(source);
                        }
                    }
                    if (curMax > max) {
                        max = curMax;
                        players = curPlayers.slice();
                    } else if (curMax === max) {
                        players.addArray(curPlayers);
                    }
                }
                if (history[i].isRound) {
                    break;
                }
            }
            return [max, players];
        },
        async content(event, trigger, player) {
            game.countPlayer(current => {
                if (current.hasMark('zshy_zhengqing')) {
                    current.clearMark('zshy_zhengqing');
                }
            });
            const [num, players] = lib.skill.zshy_zhengqing.getMostInfoLastRound();
            let target;
            if (!players.length) {
                return;
            } else if (players.length === 1) {
                target = players[0];
            } else if (players.includes(player)) {
                target = player;
            } else {
                target = players.randomGet();
            }
            player.line(target, 'thunder');
            const isMax =
                (player
                    .getAllHistory('custom', evt => evt && evt.zhengqing_count)
                    .map(evt => evt.zhengqing_count)
                    .sort((a, b) => b - a)[0] || 0) <= num;
            target.addMark('zshy_zhengqing', num);
            if (target === player) {
                player.chooseDrawRecover(Math.ceil(num / 2), true);
                player.getHistory('custom').push({ zshy_zhengqing_count: num });
            } else {
                await game.asyncDraw([player, target].sortBySeat(trigger.player));
            }
        },
        marktext: '擎',
        intro: {
            name: '争擎',
            name2: '擎',
            content: 'mark',
        },
    },
    zshy_zhuangpo: {//壮魄
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'chooseToUse',
        charlotte: true,
        onChooseToUse(event) {
            if (!game.online && !event.zshy_zhuangpo_cards) {
                event.set(
                    'zshy_zhuangpo_cards',
                    event.player.getCards('hes', card => {
                        if (get.name(card, event.player) == 'sha') {
                            return true;
                        }
                        const str = get.cardDescription(card, event.player);
                        return str.includes('【杀】');
                    })
                );
            }
        },
        viewAs: {
            name: 'juedou',
            storage: { zshy_zhuangpo: true },
        },
        viewAsFilter() {
            return get.event().zshy_zhuangpo_cards?.length;
        },
        prompt: '将一张牌面信息包含“【杀】”的牌当【决斗】使用',
        filterCard(card, player) {
            return get.event().zshy_zhuangpo_cards.includes(card);
        },
        position: 'hes',
        ai: {
            order: 4,
            result: {
                player: 1,
                target(player, target) {
                    return get.effect(target, { name: 'juedou' }, player, player);
                },
            },
            effect: {
                target(card, player, target) {
                    return get.effect(target, { name: 'juedou' }, player, player);
                },
            },
        },
        precontent() {
            player.addTempSkill('zshy_zhuangpo_effect');
        },
        subSkill: {
            effect: {
                trigger: {
                    player: 'useCardToPlayered',
                },
                filter(event, player) {
                    const card = event.card;
                    if (!card || !card.storage || !card.storage.zshy_zhuangpo) {
                        return false;
                    }
                    return true;
                },
                forced: true,
                charlotte: true,
                group: 'zshy_zhuangpo_damage',
                async content(event, trigger, player) {
                    let num = 1 + player.getDamagedHp();
                    player.draw(num);
                    if (player.hasMark('zshy_zhengqing')) {
                        const target = trigger.target;
                        num = player.countMark('zshy_zhengqing');
                        target.chooseToDiscard('he', num, true);
                    };
                },
            },
            damage: {
                audio: 'zshy_zhuangpo',
                trigger: { source: 'damageBegin1' },
                filter(event, player) {
                    const card = event.card;
                    if (!card || !card.storage || !card.storage.zshy_zhuangpo) {
                        return false;
                    }
                    const evt = event.getParent(2);
                    return evt.targets;
                },
                charlotte: true,
                forced: true,
                async content(event, trigger, player) {
                    const evt = trigger.getParent(2), num = 1 + player.getDamagedHp();
                    trigger.num += num;
                },
            },
        },
    },

    //墟神张飞
    zshy_shencai: {//神裁
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'phaseZhunbeiBegin',
        },
        charlotte: true,
        check(event, player) {
            return get.attitude(player, event.player) < 0;
        },
        filter(event, player) {
            return event.player != player && event.player.isAlive();
        },
        logTarget: 'player',
        prompt2(event, player) {
            return '你可以判定并获得判定牌，然后根据判定牌花色对' + get.translation(event.player) + '进行断罪';
        },
        content() {
            'step 0'
            player.judge(function (card) {
                if (get.suit(card) == 'none') return 2;
                if (get.suit(card) == 'diamond') return 1.5;
                return 1;
            });
            'step 1'
            event.suit = result.suit;
            player.gain(result.card, 'gain2');
            if (trigger.player.countGainableCards(player, 'he') > 0) {
                player.gainPlayerCard(trigger.player, 'he', true);
            } else {
                player.recover();
            }
            'step 2'
            var target = trigger.player;
            if (event.suit == 'spade') {
                if (!target.hasSkill('zshy_shencai_spade')) {
                    target.addSkill('zshy_shencai_spade');
                    event.finish();
                }
            }
            else if (event.suit == 'club') {
                if (!target.hasSkill('zshy_shencai_club')) {
                    target.addSkill('zshy_shencai_club');
                    event.finish();
                }
            }
            else if (event.suit == 'diamond') {
                if (!target.hasSkill('zshy_shencai_diamond')) {
                    target.addSkill('zshy_shencai_diamond');
                    event.finish();
                }
            }
            else if (event.suit == 'heart') {
                if (!target.hasSkill('zshy_shencai_heart')) {
                    target.addSkill('zshy_shencai_heart');
                    event.finish();
                }
            }
            else {
                if (!target.hasSkill('zshy_shencai_none')) {
                    target.addSkill('zshy_shencai_none');
                    event.finish();
                }
            }
            'step 3'
            trigger.player.addMark('zshy_shencai_die', 1);
            trigger.player.addSkill('zshy_shencai_die');
        },
        ai: {
            expose: 0.3,
            threaten: 5,
        },
        global: 'zshy_shencai_AI',
        group: 'zshy_shencai_Use',
        subSkill: {
            Use: {
                audio: 'zshy_shencai',
                enable: 'phaseUse',
                usable: 1,
                charlotte: true,
                filterTarget(card, player, target) {
                    return target != player;
                },
                selectTarget: [1, Infinity],
                prompt(event, player) {
                    return '你可以审判任意名其他角色';
                },
                content() {
                    'step 0'
                    player.judge(function (card) {
                        if (get.suit(card) == 'none') return 2;
                        if (get.suit(card) == 'diamond') return 1.5;
                        return 1;
                    });
                    'step 1'
                    event.suit = result.suit;
                    player.gain(result.card, 'gain2');
                    if (target.countGainableCards(player, 'he') > 0) {
                        player.gainPlayerCard(target, 'he', true);
                    } else {
                        player.recover();
                    }
                    'step 2'
                    if (event.suit == 'spade') {
                        if (!target.hasSkill('zshy_shencai_spade')) {
                            target.addSkill('zshy_shencai_spade');
                            event.finish();
                        }
                    }
                    else if (event.suit == 'club') {
                        if (!target.hasSkill('zshy_shencai_club')) {
                            target.addSkill('zshy_shencai_club');
                            event.finish();
                        }
                    }
                    else if (event.suit == 'diamond') {
                        if (!target.hasSkill('zshy_shencai_diamond')) {
                            target.addSkill('zshy_shencai_diamond');
                            event.finish();
                        }
                    }
                    else if (event.suit == 'heart') {
                        if (!target.hasSkill('zshy_shencai_heart')) {
                            target.addSkill('zshy_shencai_heart');
                            event.finish();
                        }
                    }
                    else {
                        if (!target.hasSkill('zshy_shencai_none')) {
                            target.addSkill('zshy_shencai_none');
                            event.finish();
                        }
                    }
                    'step 3'
                    target.addMark('zshy_shencai_die', 1);
                    target.addSkill('zshy_shencai_die');
                },
                ai: {
                    order() {
                        return [3, 5, 7, 9].randomGet();
                    },
                    result: {
                        target: -1,
                    },
                },
            },
            AI: {
                ai: {
                    directHit_ai: true,
                    skillTagFilter(player, tag, arg) {
                        if (!arg || !arg.card || !['basic', 'trick'].includes(get.type(arg.card)) || get.tag(arg.card, 'damage')) return false;
                        if (!arg.target || !arg.target.hasSkill('zshy_shencai_club')) return false;
                        return true;
                    },
                },
            },
            spade: {
                mark: true,
                marktext: '笞',
                intro: {
                    name: '神裁',
                    content: '受到1点伤害后，失去1点体力上限',
                    onunmark: true,
                },
                trigger: {
                    player: 'damageEnd',
                },
                forced: true,
                charlotte: true,
                content() {
                    'step 0'
                    event.count = trigger.num;
                    'step 1'
                    event.count--;
                    player.loseMaxHp();
                    'step 2'
                    if (event.count > 0) event.goto(1);
                },
                ai: {
                    effect: {
                        target(card, player, target, current) {
                            if (get.tag(card, 'damage') && current < 0) return 1.6;
                        },
                    },
                },
            },
            club: {
                sub: true,
                mark: true,
                marktext: '杖',
                intro: {
                    name: '神裁',
                    content: '不能响应『伤害』类的基本牌和普通锦囊牌',
                    onunmark: true,
                },
                trigger: {
                    target: 'useCardToTargeted',
                },
                forced: true,
                charlotte: true,
                filter(event, player) {
                    if (!['basic', 'trick'].includes(get.type(event.card))) return false;
                    if (get.tag(event.card, 'damage')) return true;
                    return false;
                },
                content() {
                    trigger.directHit.add(player);
                    game.log(player, '不能响应', trigger.card);
                },
            },
            heart: {
                sub: true,
                audio: 'zshy_shencai',
                mark: true,
                marktext: '流',
                intro: {
                    name: '神裁',
                    content: '回合结束时，将武将牌翻至背面',
                    onunmark: true,
                },
                trigger: {
                    player: 'phaseEnd',
                },
                forced: true,
                charlotte: true,
                content() {
                    player.turnOver(true);
                },
            },
            diamond: {
                sub: true,
                mark: true,
                marktext: '徒',
                intro: {
                    name: '神裁',
                    content: '以此法外失去牌后，随机弃置一张牌',
                    onunmark: true,
                },
                trigger: {
                    player: 'loseAfter',
                    global: ['equipAfter', 'addJudgeAfter', 'gainAfter', 'loseAsyncAfter', 'addToExpansionAfter'],
                },
                forced: true,
                charlotte: true,
                filter(event, player) {
                    if (!player.hasCard(function (card) {
                        return lib.filter.cardDiscardable(card, player, 'zshy_shencai_diamond');
                    }, 'he')) return false;
                    var evt = event.getParent('zshy_shencai_diamond');
                    if (evt && evt.player == player) return false;
                    var evt = event.getl(player);
                    return evt && evt.cards2 && evt.cards2.length > 0;
                },
                content() {
                    'step 0'
                    event.cards = player.getCards('he', function (card) {
                        return lib.filter.cardDiscardable(card, player, 'zshy_shencai_diamond');
                    });
                    'step 1'
                    if (cards.length) player.discard(cards.randomGet());
                },
            },
            none: {
                sub: true,
                audio: 'zshy_shencai',
                mark: true,
                marktext: '裁',
                intro: {
                    name: '神裁',
                    content: '回复体力时，摸一张牌并取消之',
                    onunmark: true,
                },
                trigger: {
                    player: 'recoverBegin',
                },
                forced: true,
                charlotte: true,
                content() {
                    player.draw();
                    trigger.cancel();
                },
                ai: {
                    effect: {
                        target(card, player, target) {
                            if (get.tag(card, 'recover')) return 'zeroplayertarget';
                        },
                    },
                },
            },
            die: {
                sub: true,
                audio: 'zshy_shencai',
                mark: true,
                marktext: '死',
                intro: {
                    name: '神裁',
                    content: '一名角色回合结束后，若你的体力值或存活角色数小于#，则你死亡',
                    onunmark: true,
                },
                trigger: {
                    global: 'phaseAfter',
                },
                forced: true,
                charlotte: true,
                filter(event, player) {
                    var num = player.countMark('zshy_shencai_die');
                    return (num > player.hp) || (num > game.countPlayer());
                },
                content() {
                    player.die();
                },
            },
        },
    },
    zshy_xunshi: {//巡使
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: ['chooseToUse', 'chooseToRespond'],
        charlotte: true,
        hiddenCard(player, name) {
            if (!player.countCards('hes', { color: 'none' })) return false;
            if (!lib.inpile.includes(name)) return false;
            var type = get.type(name);
            return (type == 'basic' || type == 'delay');
        },
        filter(event, player) {
            if (!player.countCards('hes', { color: 'none' })) return false;
            for (var i of lib.inpile) {
                var type = get.type(i);
                if ((type == 'basic' || type == 'delay') && event.filterCard({ name: i }, player, event)) return true;
            }
            return false;
        },
        prompt: '你可将一张无色牌当做任意基本牌或延时锦囊牌使用或打出。',
        chooseButton: {
            dialog(event, player) {
                var list = [];
                for (var i = 0; i < lib.inpile.length; i++) {
                    var name = lib.inpile[i];
                    if (name == 'sha') {
                        if (event.filterCard({ name: name }, player, event)) list.push(['基本', '', 'sha']);
                        for (var j of lib.inpile_nature) {
                            if (event.filterCard({ name: name, nature: j }, player, event)) list.push(['基本', '', 'sha', j]);
                        }
                    }
                    else if (get.type(name) == 'delay' && event.filterCard({ name: name }, player, event)) list.push(['锦囊', '', name]);
                    else if (get.type(name) == 'basic' && event.filterCard({ name: name }, player, event)) list.push(['基本', '', name]);
                }
                return ui.create.dialog('巡使', [list, 'vcard']);
            },
            filter(button, player) {
                return _status.event.getParent().filterCard({ name: button.link[2] }, player, _status.event.getParent());
            },
            check(button) {
                if (_status.event.getParent().type != 'phase') return 1;
                var player = _status.event.player;
                return player.getUseValue({ name: button.link[2], nature: button.link[3] });
            },
            backup(links, player) {
                return {
                    filterCard(card) {
                        return get.color(card) == 'none';
                    },
                    popname: true,
                    position: 'hes',
                    check(card) {
                        return 7 - get.value(card);
                    },
                    viewAs: {
                        color: 'none',
                        name: links[0][2],
                        nature: links[0][3],
                    },
                    precontent() {
                        player.logSkill('zshy_xunshi');
                    },
                }
            },
            prompt(links, player) {
                return '将一张无色牌当做' + (get.translation(links[0][3]) || '') + get.translation(links[0][2]) + '使用或打出';
            }
        },
        ai: {
            save: true,
            fireAttack: true,
            respondSha: true,
            respondShan: true,
            skillTagFilter(player) {
                if (!player.countCards('hes', { color: 'none' })) return false;
            },
            order: 1,
            result: {
                player(player) {
                    if (_status.event.dying) return get.attitude(player, _status.event.dying);
                    return 1;
                },
            },
        },
        isXunshi(card) {
            var info = lib.card[card.name];
            if (!info || (info.type != 'trick' && info.type != 'delay')) return false;
            if (info.notarget) return false;
            if (info.selectTarget != undefined) {
                if (Array.isArray(info.selectTarget)) {
                    if (info.selectTarget[0] < 0) return !info.toself;
                    return info.selectTarget[0] != 1 || info.selectTarget[1] != 1;
                }
                else {
                    if (info.selectTarget < 0) return !info.toself;
                    return info.selectTarget != 1;
                }
            }
            return false;
        },
        mod: {
            suit(card, suit) {
                if (lib.skill.zshy_xunshi.isXunshi(card)) return 'none';
            },
            targetInRange(card) {
                const suit = get.color(card);
                const name = get.name(card);
                if (suit == 'none' || suit == 'unsure' || name == 'sha') return true;
            },
            cardUsable(card) {
                const suit = get.color(card);
                const name = get.name(card);
                if (suit == 'none' || suit == 'unsure' || name == 'sha') return Infinity;
            },
            ignoredHandcard(card, player) {
                if (get.color(card) == 'none' || get.name(card) == 'sha') return true;
            },
            cardDiscardable(card, player, name) {
                if (name == 'phaseDiscard' && (get.color(card) == 'none' || get.name(card) == 'sha')) return false;
            },
            aiValue(player, card, num) {
                if (lib.skill.zshy_xunshi.isXunshi(card)) return 15;
            },
        },
        group: 'zshy_xunshi_Deputy',
        subSkill: {
            Deputy: {
                trigger: {
                    player: 'useCard2',
                },
                charlotte: true,
                direct: true,
                filter(event, player) {
                    if (get.color(event.card) != 'none') return false;
                    if (!['basic', 'trick'].includes(get.type(event.card))) return false;
                    if (event.targets && event.targets.length > 0) return true;
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
                    var str = '为' + get.translation(trigger.card) + '增加或减少任意个目标';
                    player.chooseTarget(get.prompt('zshy_xunshi'), str, [1, Infinity], function (card, player, target) {
                        var player = _status.event.player;
                        if (_status.event.targets.includes(target)) return true;
                        return lib.filter.targetEnabled2(_status.event.card, player, target);
                    }).set('ai', function (target) {
                        var trigger = _status.event.getTrigger();
                        var player = _status.event.player;
                        return get.effect(target, trigger.card, player, player) * (_status.event.targets.includes(target) ? -1 : 1);
                    }).set('targets', trigger.targets).set('card', trigger.card);
                    'step 1'
                    if (result.bool) {
                        var targets = result.targets.sortBySeat();
                        player.logSkill('zshy_xunshi', targets);
                        if (trigger.targets.includes(targets[0])) trigger.targets.removeArray(targets);
                        else trigger.targets.addArray(targets);
                    }
                },
            },
        },
    },

    //墟神张角
    zshy_yizhao: {//异兆
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: ['useCard', 'respond'],
        },
        charlotte: true,
        forced: true,
        filter(event, player) {
            const number = get.number(event.card);
            return typeof number == 'number' && number > 0;
        },
        marktext: '黄',
        intro: {
            name: '黄(异兆/肆军)',
            name2: '黄',
            content: 'mark',
            markcount(storage, player) {
                return (storage || 0).toString().slice(-2);
            },
        },
        content() {
            'step 0';
            event.num = player.countMark('zshy_yizhao');
            player.addMark('zshy_yizhao', get.number(trigger.card));
            'step 1';
            var num = Math.floor(num / 10) % 10,
                num2 = Math.floor(player.countMark('zshy_yizhao') / 10) % 10;
            if (num != num2) {
                var card = get.cardPile(card => {
                    return get.number(card, false) == num2;
                });
                if (card) {
                    player.gain(card, 'gain2');
                }
            }
        },
        mod: {
            targetInRange(card, player, target) {
                if (player.countMark('zshy_yizhao') > 36) {
                    return true;
                }
            },
            cardUsableTarget(card, player, target) {
                if (player.countMark('zshy_yizhao') > 36) {
                    return true;
                }
            },
            aiOrder(player, card, num) {
                if (Math.floor((get.number(card) + (player.countMark('zshy_yizhao') % 10)) / 10) == 1) {
                    return num + 10;
                }
            },
        },
        ai: {
            threaten: 1.5,
            effect: {
                target_use(card, player, target, current) {
                    if (get.type(card) == 'equip' && !get.cardtag(card, 'gifts')) {
                        return [1, 0.1];
                    }
                },
            },
        },
    },
    zshy_sanshou: {//三首
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'damageBegin4' },
        charlotte: true,
        check(event, player) {
            return get.damageEffect(player, event.source, player, event.nature) <= 0;
        },
        async content(event, trigger, player) {
            let types = [];
            types.addArray(game.getGlobalHistory('useCard').map(evt => get.type2(evt.card)));
            if (types.length < 3) {
                trigger.cancel();
                player.chooseDrawRecover(types.length, true);
            };
            game.delayx();
        },
        ai: {
            effect: {
                target(card, player, target) {
                    if (card.name == 'shandian' || card.name == 'fulei') {
                        return [0, 0.1];
                    }
                    if (!get.tag(card, 'damage')) {
                        return;
                    }
                    var types = [],
                        bool = 0;
                    types.addArray(game.getGlobalHistory('useCard').map(evt => get.type2(evt.card)));
                    if (!types.includes(get.type2(card))) {
                        bool = 1;
                    }
                    if (types.length < 2) {
                        return Math.min(1, 0.4 + (types.length + bool) * 0.2);
                    }
                },
            },
        },
    },
    zshy_sijun: {//肆军
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'zshy_yizhaoAfter' },
        charlotte: true,
        filter(event, player) {
            return player.countMark('zshy_yizhao') > 183;
        },
        check(event, player) {
            return 183;
        },
        content() {
            'step 0';
            player.removeMark('zshy_yizhao', player.countMark('zshy_yizhao'));
            game.washCard();
            'step 1';
            var pile = Array.from(ui.cardPile.childNodes);
            if (pile.length < 3) {
                return;
            }
            var bool = false,
                max = Math.pow(2, Math.min(100, pile.length)),
                index;
            for (var i = 0; i < max; i++) {
                var num = 0;
                index = i.toString(2);
                while (index.length < pile.length) {
                    index = '0' + index;
                }
                for (var k = 0; k < index.length; k++) {
                    if (index[k] == '1') {
                        num += get.number(pile[k]);
                    }
                    if (num > 36) {
                        break;
                    }
                }
                if (num == 36) {
                    bool = true;
                    break;
                }
            }
            if (bool) {
                var cards = [];
                for (var k = 0; k < index.length; k++) {
                    if (index[k] == '1') {
                        cards.push(pile[k]);
                    }
                }
                player.gain(cards, 'gain2');
            }
        },
        ai: {
            combo: 'zshy_yizhao',
        },
    },
    zshy_tianjie: {//天劫
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: 'phaseEnd' },
        charlotte: true,
        direct: true,
        filter(event, player) {
            return game.hasGlobalHistory('cardMove', evt => evt.washCard) && game.hasPlayer(current => current != player);
        },
        skillAnimation: true,
        animationColor: 'metal',
        content() {
            'step 0';
            player.chooseTarget(get.prompt('zshy_tianjie'), '选择至多三名其他角色，依次对这些角色造成X点雷电伤害（X为其手牌中【闪】的数量+1）', [1, 3], lib.filter.notMe).set('ai', target => {
                var player = _status.event.player;
                return get.damageEffect(target, player, player, 'thunder') * Math.sqrt(Math.max(1, target.countCards('h', 'shan')));
            });
            'step 1';
            if (result.bool) {
                var targets = result.targets;
                targets.sortBySeat();
                player.logSkill('zshy_tianjie', targets);
                for (var target of targets) {
                    var num = target.countCards('h', 'shan') + 3;
                    target.damage(num, 'thunder');
                }
            }
        },
    },

    //墟神钟会
    zshy_linjie: {//凛界
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'phaseBegin',
        },
        charlotte: true,
        async cost(event, trigger, player) {
            event.result = await player.chooseTarget(`###${get.prompt(event.skill)}###对任意名角色依次造成1点冰冻伤害然后令其获得1枚「凛」`, [1, Infinity])
                .set('ai', target => {
                    return get.damageEffect(target, get.player(), get.player(), 'ice');
                }).forResult();
        },
        async content(event, trigger, player) {
            let targets = event.targets.sortBySeat();
            Promise.all(targets.map(async (target) => {
                await target.damage('ice');
                target.addMark(event.name, 1);
            }));
        },
        marktext: '凛',
        intro: {
            name: '凛界（凛）',
            name2: '凛',
            content: 'mark',
        },
        group: 'zshy_linjie_effect',
        subSkill: {
            effect: {
                audio: 'zshy_linjie',
                trigger: {
                    global: 'damageEnd',
                },
                charlotte: true,
                forced: true,
                filter(event, player) {
                    const target = event.player;
                    return target !== player && target.hasMark('zshy_linjie') && target.countDiscardableCards(target, 'h');
                },
                logTarget: 'player',
                async content(event, trigger, player) {
                    let target = trigger.player;
                    let hs = target.getDiscardableCards(target, 'he');
                    if (hs.length) {
                        const damage = target.countCards('he') == 1;
                        await target.discard(hs.randomGet());
                        if (damage) {
                            await target.damage('ice');
                        }
                    }
                },
                getIndex(event, player) {
                    return event.num;
                },
            },
        },
    },
    zshy_duzhang: {//独仗
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'useCardToPlayered',
            target: 'useCardToTargeted',
        },
        filter(event, player) {
            if (get.color(event.card) !== 'black') return false;
            return (player === event.player || event.targets.includes(player));
        },
        charlotte: true,
        locked: false,
        frequent: true,
        check() {
            return true;
        },
        content() {
            player.chooseDrawRecover(true);
            player.addMark('zshy_linjie', 1);
        },
        mod: {
            maxHandcard(player, num) {
                return (num += player.countMark('zshy_linjie'));
            },
        },
    },
    zshy_jianghuo: {//降祸
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: 'damageEnd' },
        derivation: ['zshy_lishi'],
        skillAnimation: true,
        animationColor: 'fire',
        charlotte: true,
        juexingji: true,
        forced: true,
        lastDo: true,
        filter(event, player) {
            return !game.hasPlayer(current => !current.hasAllHistory('damage', evt => evt.num));
        },
        async content(event, trigger, player) {
            player.awakenSkill(event.name);
            const num = game.filterPlayer(target => target !== player && target.hasMark('zshy_linjie'))
                .map(target => target.countMark('zshy_linjie'))
                .reduce((sum, cur) => sum + cur, 0);
            game.filterPlayer(target => target !== player).forEach(target => target.clearMark('zshy_linjie'));
            if (num > 0) player.addMark('zshy_linjie', num);
            await player.draw(player.countMark('zshy_linjie'));
            await player.gainMaxHp(), player.recover();
            await player.removeSkills('zshy_linjie');
            await player.addSkills('zshy_lishi');
            player.markSkill('zshy_linjie'), player.insertPhase();
        },
    },
    zshy_lishi: {//立世
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'phaseJieshuBegin',
        },
        charlotte: true,
        locked: true,
        async cost(event, trigger, player) {
            if (!player.hasMark('zshy_linjie')) {
                event.result = {
                    bool: true,
                    cost_data: 'chooseDrawRecover',
                };
            } else {
                const num = player.countMark('zshy_linjie');
                const result = await player.chooseButton([
                    '立世：你需移除任意「凛」标记然后执行等量个选项',
                    [[
                        ['baiban', '令所有其他角色于下个准备和结束阶段期间非状态技失效'],
                        ['judge', '令所有其他角色于下个判定阶段开始时在【闪电】.【乐不思蜀】和【兵粮寸断】中选择两个个并依次进行判定。'],
                        ['discard', '令所有其他角色于下个摸牌阶段期间内摸到的牌若颜色相同，则全部弃置。'],
                        ['use', '令所有其他角色于下个出牌阶段每种类型的牌仅能使用一张'],
                        ['gain', '令所有其他角色于下个弃牌阶段期间内弃置牌后你获得之'],
                    ], 'textbutton',],]).set('ai', button => {
                        const player = get.player();
                        if (button.link === 'baiban') {
                            return 1.5;
                        } else if (button.link === 'judge') {
                            return 1;
                        } else if (button.link === 'discard') {
                            return 3;
                        } else if (button.link === 'use') {
                            return 4;
                        } else if (button.link === 'gain') {
                            return 8;
                        }
                    }).set('forced', true).set('selectButton', [1, num]).forResult();
                event.result = {
                    bool: result.bool,
                    cost_data: result.links,
                };
            }
        },
        async content(event, trigger, player) {
            const choices = event.cost_data;
            if (choices === 'chooseDrawRecover') {
                await player.chooseDrawRecover(true);
                return;
            }
            player.removeMark('zshy_linjie', choices.length);
            const targets = game.filterPlayer(target => target != player);
            player.line(targets);
            if (choices.includes('baiban')) {
                for (const target of targets) {
                    target.when({ player: 'phaseJieshuBefore' }).then(() => player.addTempSkill('baiban', ['phaseBefore', 'phaseChange', 'phaseAfter']));
                    target.when({ player: 'phaseZhunbeiBefore' }).then(() => player.addTempSkill('baiban', ['phaseBefore', 'phaseChange', 'phaseAfter']));
                }
            }
            if (choices.includes('judge')) {
                for (const target of targets) {
                    target.when({ player: 'phaseJudgeBegin' }).step(async (event, trigger, player) => {
                        const result = await player
                            .chooseVCardButton(['lebu', 'bingliang', 'shandian'], '立世：请选择两个延时锦囊并依次进行判定', 2, true)
                            .set('ai', button => {
                                const player = get.player();
                                return get.info({ name: button.link[2] }).ai.result.target(player, player);
                            })
                            .forResult();
                        if (result?.links.length) {
                            const links = result.links;
                            for (let i = 0; i < links.length; i++) await target.executeDelayCardEffect(links[i][2]);
                        }
                    });
                }
            }
            if (choices.includes('discard')) {
                game.addGlobalSkill('zshy_lishi_discard');
                for (const target of targets) {
                    target.when({ player: 'phaseDrawBegin' }).then(() => trigger.set('zshy_lishi', player.playerid));
                }
            }
            if (choices.includes('use')) {
                for (const target of targets) {
                    target.when({ player: 'phaseUseBegin' }).then(() => player.addTempSkill('zshy_lishi_limit', ['phaseBefore', 'phaseChange', 'phaseAfter']));
                }
            }
            if (choices.includes('gain')) {
                player.addSkill('zshy_lishi_gain');
                for (const target of targets) {
                    target.when({ player: 'phaseDiscardBegin' }).then(() => trigger.set('zshy_lishi', player.playerid));
                }
            }
        },
        subSkill: {
            gain: {
                trigger: {
                    global: ['loseAsyncAfter', 'loseAfter'],
                },
                charlotte: true,
                forced: true,
                popup: false,
                filter(event, player) {
                    if (event.type !== 'discard') return false;
                    const evt = event.getParent('phaseDiscard');
                    if (evt?.zshy_lishi !== event.player.playerid) return false;
                    const evt2 = event.getl(event.player);
                    return evt?.name === 'phaseDiscard' && evt?.player === event.player && evt2?.cards2?.filterInD('d');
                },
                async content(event, trigger, player) {
                    await player.gain(trigger.getl(trigger.player).cards2.filterInD('d'), 'gain2');
                },
            },
            limit: {
                charlotte: true,
                onremove: true,
                trigger: { player: 'useCard1' },
                silent: true,
                filter(event, player) {
                    return player.isPhaseUsing();
                },
                content() {
                    player.markAuto(event.name, get.type2(trigger.card));
                },
                mod: {
                    cardEnabled(card, player) {
                        const type = get.type2(card);
                        if (player.getStorage('zshy_lishi_limit').includes(type)) return false;
                    },
                    cardSavable(card, player) {
                        const type = get.type2(card);
                        if (player.getStorage('zshy_lishi_limit').includes(type)) return false;
                    },
                },
            },
            discard: {
                charlotte: true,
                forced: true,
                popup: false,
                trigger: {
                    global: ['gainAfter', 'loseAsyncAfter'],
                },
                filter(event, player) {
                    const evt = event.getParent('phaseDraw');
                    const cards = event?.getg?.(player);
                    return event.getParent()?.name == 'draw' && evt?.name === 'phaseDraw' && evt?.zshy_lishi === player.playerid && cards.map(card => get.color(card)).unique().length == 1;
                },
                async content(event, trigger, player) {
                    let cards = trigger.getg(player);
                    await player.modedDiscard(cards);
                },
            },
        },
    },

};

const skill_AB = {
    ...蜀汉虎将, ...贤君明主, ...勇冠三军, ...帷幄千里, ...巾帼红颜,
    ...SP系列,
    ...始计篇智, ...始计篇信, ...始计篇仁, ...始计篇勇, ...始计篇严,
    ...魔乱九州,
    ...曹魏, ...蜀汉, ...东吴, ...群雄, ...西晋, ...神祇,
};

export default skill_AB;
