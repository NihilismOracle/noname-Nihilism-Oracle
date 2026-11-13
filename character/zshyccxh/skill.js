import { lib, game, ui, get, ai, _status } from '../../../../noname.js'
const 天极·皇室宗亲 = {
    //墟卞夫人
    zshy_fuwei: {//扶危
        audio: 'wanwei',
        trigger: {
            player: 'loseAfter',
            global: ['gainAfter', 'loseAsyncAfter'],
        },
        filter(event, player) {
            const evt = event.getl(player);
            if (!(evt?.cards2 ?? []).length) {
                return false;
            }
            if (event.name === 'gain' || event.type === 'gain') {
                if (
                    evt.cards2.some(card => {
                        return game.hasPlayer(target => {
                            if (target === player) {
                                return false;
                            }
                            return event.getg?.(target)?.includes(card);
                        });
                    })
                ) {
                    return true;
                }
            }
            if (event.type === 'discard' && event.getlx !== false) {
                const discarder = event.discarder || event.getParent(2).player;
                if (discarder && discarder !== player) {
                    return true;
                }
            }
            return false;
        },
        prompt2(event, player) {
            const evt = event.getl(player);
            let origins = evt.cards2;
            if (event.name === 'gain' || event.type === 'gain') {
                origins = origins.filter(card => {
                    return game.hasPlayer(target => {
                        if (target === player) {
                            return false;
                        }
                        return event.getg?.(target)?.includes(card);
                    });
                });
            }
            return '从牌堆中获得' + get.translation(origins.map(i => i.name)) + '；若没有则改为摸一张牌';
        },
        async content(event, trigger, player) {
            const evt = trigger.getl(player);
            let origins = evt.cards2;
            if (trigger.name === 'gain' || trigger.type === 'gain') {
                origins = origins.filter(card => {
                    return game.hasPlayer(target => {
                        if (target === player) {
                            return false;
                        }
                        return trigger.getg?.(target)?.includes(card);
                    });
                });
            };
            let cards = [],
                num = 0;
            for (const card of origins) {
                const card2 = get.cardPile2(card2 => card2.name === card.name);
                if (card2) {
                    cards.push(card2);
                } else {
                    num++;
                }
            };
            if (cards.length) {
                await player.gain(cards, 'gain2');
            };
            if (num) {
                await player.draw(num);
            };
            await player.recover();
        },
        ai: {
            noh: true,
        },
    },
    zshy_yuejianCCXH: {//约俭
        audio: 'yuejian',
        trigger: { global: 'useCardAfter' },
        forced: true,
        filter(event, player) {
            return player != event.player && event.targets && event.targets.includes(player);
        },
        async content(event, trigger, player) {
            const cards = trigger.cards.filterInD();
            if (cards.length) {
                player.gain(cards, 'gain2');
            };
            await player.recover();
        },
    },

    //墟曹昂
    zshy_kangkai: {//慷忾
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'useCardToTargeted',
        },
        shaRelated: true,
        filter(event, player) {
            return get.tag(event.card, 'damage') == true;
        },
        check(event, player) {
            return get.effect(event.target, event.card, event.player, player) <= 0 || !player.canCompare(event.player);
        },
        prompt2(event, player) {
            let str = `你回复1点体力或摸一张牌`;
            if (player.canCompare(event.player)) {
                str += `，然后与${get.translation(event.player)}拼点，若你赢，则${get.translation(event.target)}回复1点体力或摸一张牌，然后令此牌对其无效`
            }
            return str;
        },
        async content(event, trigger, player) {
            player.chooseDrawRecover(true);
            if (player.canCompare(trigger.player)) {
                const result = await player.chooseToCompare(trigger.player).set('ai', function (target) {
                    return target == trigger.player;
                }).forResult();
                if (result?.bool) {
                    trigger.target.chooseDrawRecover(true);
                    await trigger.excluded.push(trigger.target);
                    game.log(player, `令${get.translation(trigger.card)}对${get.translation(trigger.target)}无效了`);
                }
            }
        },
    },

    //墟曹金玉
    zshy_chunhui: {//春晖
        audio: 'olchunhui',
        forced: true,
        locked: false,
        trigger: {
            player: ['damageEnd'],
            global: ['phaseZhunbeiBegin'],
        },
        filter(event, player) {
            return game.hasPlayer(target => target != player && target.countCards('he'));
        },
        async content(event, trigger, player) {
            const bool = player.storage[`${event.name}_rewrite`];
            const color = bool ? 'black' : 'red';
            const result = await player
                .chooseTarget({
                    prompt: `###${get.translation(event.name)}###令一名角色交给你一张牌`,
                    forced: true,
                    filterTarget(card, player, target) {
                        return target != player && target.countCards('he');
                    },
                    ai(target) {
                        return -get.attitude(get.player(), target) * (114514 - target.countCards('he'));
                    },
                })
                .forResult();
            const {
                targets: [target],
            } = result;
            player.line(target);
            const result2 = await target
                .chooseToGive({
                    prompt: `夏晟：交给${get.translation(player)}一张牌`,
                    forced: true,
                    position: 'he',
                    target: player,
                    ai(card) {
                        if (get.color(card, false) == 'black') {
                            return 7 - get.value(card);
                        }
                        return 6 - get.value(card);
                    },
                })
                .forResult();
            const {
                cards: [card],
            } = result2;
            if (bool) {
                [player, target].forEach(current => {
                    current.addTempSkill(`${event.name}_effect`, 'roundStart');
                    current.setStorage(`${event.name}_effect`, '任意花色', true);
                });
                return;
            };
            if (get.color(card, false) == 'black') {
                [player, target].forEach(current => {
                    current.addTempSkill(`${event.name}_effect`, 'roundStart');
                    current.setStorage(`${event.name}_effect`, color, true);
                });
            };

        },
        subSkill: {
            effect: {
                charlotte: true,
                onremove: true,
                trigger: {
                    player: 'useCard2',
                },
                forced: true,
                popup: false,
                filter(event, player) {
                    if (player.storage.zshy_chunhui_effect == '任意花色') {
                        return true;
                    }
                    return get.color(event.card) == player.storage.zshy_chunhui_effect;
                },
                async content(event, trigger, player) {
                    player.removeSkill(event.name);
                    const { card, targets } = trigger;
                    let bool1 = true;
                    const bool2 = targets?.length > 1;
                    //判断能不能多指，有好几个方面（allowMultiple为true、没有multiTarget、是否有能够增加的目标，缺一不可）
                    const info = get.info(card);
                    const addTargets = game.filterPlayer(function (target) {
                        return !targets.includes(target) && lib.filter.targetEnabled2(card, player, target) && lib.filter.targetInRange(card, player, target);
                    });
                    if (info.allowMultiple == false || !targets.length || info.multitarget || !addTargets.length) {
                        bool1 = false;
                    }
                    //能否增加和能否减少分开判断
                    if (bool1 || bool2) {
                        const next = player
                            .chooseTarget({
                                prompt: `###${get.translation(event.name)}###为${get.translation(card)}增加或减少一个目标（至多减至一）`,
                                filterTarget(card, player, target) {
                                    const { bool1, bool2, targetsx, targetsy } = get.event();
                                    return (bool1 && targetsx.includes(target)) || (bool2 && targetsy.includes(target));
                                },
                                ai(target) {
                                    const targets = get.event().targetsy;
                                    const card = get.event().getTrigger().card;
                                    const player = get.player();
                                    return get.effect(target, card, player, player) * (targets.includes(target) ? -1 : 1);
                                },
                            })
                            .set('bool1', bool1)
                            .set('bool2', bool2)
                            .set('targetsx', addTargets)
                            .set('targetsy', targets);
                        //加个宝宝提示（）
                        next.targetprompt2.push(target => {
                            if (!target.classList.contains('selectable')) {
                                return false;
                            }
                            if (get.event().targetsy.includes(target)) {
                                return `可减少目标`;
                            }
                        });
                        const result = await next.forResult();
                        if (result?.bool && result.targets?.length) {
                            const {
                                targets: [target],
                            } = result;
                            player.line(target);
                            if (targets.includes(target)) {
                                trigger.targets.remove(target);
                                game.log(target, '从', card, '的目标中移除');
                            } else {
                                trigger.targets.add(target);
                                game.log(target, '成为', card, '的额外目标');
                            }
                        }
                    }
                },
                intro: {
                    content: '下次使用$牌可以增加或减少一个目标（至多减至1）',
                },
            },
        },
    },
    zshy_xiasheng: {//夏晟
        audio: 'olxiasheng',
        trigger: {
            player: ['useCard', 'useCard2'],
        },
        filter(event, player, name) {
            const { targets, card } = event;
            const info = get.info(card);
            const color = get.color(card);
            const bool = name == 'useCard' ? true : info.allowMultiple !== false && !info.multitarget &&
                targets?.length && game.hasPlayer(function (target) {
                    return !targets.includes(target) && lib.filter.targetEnabled2(card, player, target) && lib.filter.targetInRange(card, player, target);
                });
            if (name == 'useCard' && player.storage.zshy_xiasheng_rewrite) {
                return bool;
            }
            if (name == 'useCard2' && player.storage.zshy_xiasheng_rewrite) {
                return bool;
            }
            if (name == 'useCard') {
                return color == 'black' && bool;
            }
            if (name == 'useCard2') {
                return color == 'red' && bool;
            }
            return false;
        },
        forced: true,
        async content(event, trigger, player) {
            if (event.triggername == 'useCard') {
                await player.chooseDrawRecover(true);
            } else {
                const { targets, card } = trigger;
                const result = await player
                    .chooseTarget({
                        prompt: `###${get.translation(event.name)}###为${get.translation(card)}增加一个目标`,
                        filterTarget(card, player, target) {
                            const { targets } = get.event();
                            return targets.includes(target);
                        },
                        ai(target) {
                            const card = get.event().getTrigger().card;
                            const player = get.player();
                            return get.effect(target, card, player, player);
                        },
                    })
                    .set(
                        'targets',
                        game.filterPlayer(target => {
                            return !targets.includes(target) && lib.filter.targetEnabled2(card, player, target) && lib.filter.targetInRange(card, player, target);
                        })
                    )
                    .forResult();
                if (result?.bool && result.targets?.length) {
                    const {
                        targets: [target],
                    } = result;
                    player.line(target);
                    trigger.targets.add(target);
                    game.log(target, '成为', card, '的额外目标');
                }
            }
        },
    },
    zshy_qiumu: {//秋暮
        audio: 'olqiumu',
        forced: true,
        trigger: { global: 'dying' },
        logTarget: 'player',
        async content(event, trigger, player) {
            const {
                targets: [target],
            } = event;
            const bool = player.storage[`${event.name}_rewrite`];
            const cards = target.getGainableCards(player, 'he', function (card) {
                return bool ? true : get.color(card) == 'black';
            });
            if (cards.length) {
                await player.gain({
                    cards,
                    source: target,
                    animate: 'giveAuto',
                });
            }
            const list = ['zshy_chunhui', 'zshy_xiasheng', 'zshy_qiumu'].filter(i => !player.storage[`${i}_rewrite`]);
            if (!list.length) {
                return;
            }
            const result = await player
                .chooseControl({
                    prompt: '秋暮：请选择要修改的技能',
                    controls: list,
                    choice: 0,
                }).set('ai', function () {
                    if (list.includes('zshy_xiasheng')) return 'zshy_xiasheng';
                    return list.randomGet(1);
                })
                .forResult();
            const { control } = result;
            game.log(player, '修改了', `#g【${get.translation(control)}】`);
            player.setStorage(`${control}_rewrite`, true);
        },
    },

    //墟曹宪曹华
    zshy_huamu: {//化木
        audio: 'ext:诸神寰宇/audio/character:4',
        audioname2: {
            zshy_AAZZcaoxiancaohuaJMGX_shadow: `zshy_huamu_zshy_AAZZcaoxiancaohuaJMGX_shadow`,
        },
        trigger: { player: ['useCardAfter', 'respondAfter'] },
        locked: false,
        filter(event, player) {
            if (!player.hasHistory('lose', function (evt) {
                const evtx = evt.relatedEvent || evt.getParent();
                return evt.hs.length > 0 && evtx == event;
            }) || !event.cards.filterInD('oe').length) {
                return false;
            }
            return true;
        },
        prompt2: event => '将' + get.translation(event.cards.filterInD('oe')) + '置于武将牌上',
        check(event, player) {
            if (!game.hasPlayer(function (current) {
                return current.hasSkill('zshy_qianmeng', null, null, false) && get.attitude(player, current) > 0;
            })) {
                return false;
            }
            var cards = event.cards.filterInD('e');
            if (!cards.length) {
                return true;
            }
            var card = cards[0];
            if (get.owner(card) == player) {
                if (get.value(card, player) <= 0) {
                    return true;
                }
                var subtype = get.subtype(card);
                if (player.hasCard('hs', function (card) {
                    return get.subtype(card) == subtype && player.canUse(card, player) && get.effect(player, card, player, player) > 0;
                })) {
                    return true;
                }
            }
            return false;
        },
        async content(event, trigger, player) {
            var cards = trigger.cards.filterInD('oe');
            player.addToExpansion(cards, 'gain2').gaintag.add('zshy_huamu');
        },
        ai: {
            reverseOrder: true,
            combo: 'zshy_qianmeng',
        },
        mod: {
            aiOrder(player, card, num) {
                if (typeof card == 'object') {
                    var history = game.getGlobalHistory('useCard');
                    if (!history.length) {
                        return;
                    }
                    var evt = history[history.length - 1];
                    if (evt && evt.card && get.color(evt.card) != get.color(card)) {
                        return num + 4;
                    }
                }
            },
        },
        marktext: '木',
        intro: {
            name: '灵杉&玉树',
            markcount(storage, player) {
                var red = [],
                    black = [];
                var cards = player.getExpansions('zshy_huamu');
                for (var i of cards) {
                    var color = get.color(i, false);
                    (color == 'red' ? red : black).push(i);
                }
                return '' + black.length + '/' + red.length;
            },
            content: 'expansion',
            mark(dialog, storage, player) {
                var red = [],
                    black = [];
                var cards = player.getExpansions('zshy_huamu');
                for (var i of cards) {
                    var color = get.color(i, false);
                    (color == 'red' ? red : black).push(i);
                }
                if (black.length) {
                    dialog.addText('灵杉');
                    dialog.addSmall(black);
                }
                if (red.length) {
                    dialog.addText('玉树');
                    dialog.addSmall(red);
                }
            },
        },
    },
    zshy_qianmeng: {//前盟
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AAZZcaoxiancaohuaJMGX_shadow: `zshy_qianmeng_zshy_AAZZcaoxiancaohuaJMGX_shadow`,
        },
        trigger: {
            global: ['loseAfter', 'equipAfter', 'addJudgeAfter', 'gainAfter', 'loseAsyncAfter', 'addToExpansionAfter'],
        },
        filter(event, player) {
            if (event.name == 'addToExpansion') {
                if (event.gaintag.includes('zshy_huamu')) {
                    return true;
                }
            }
            if (event.name == 'lose' && event.getlx !== false) {
                for (var i in event.gaintag_map) {
                    if (event.gaintag_map[i].includes('zshy_huamu')) {
                        return true;
                    }
                }
                return false;
            }
            return (game.getGlobalHistory('cardMove', function (evt) {
                if (evt.name != 'lose' || event != evt.getParent()) {
                    return false;
                }
                for (var i in evt.gaintag_map) {
                    if (evt.gaintag_map[i].includes('zshy_huamu')) {
                        return true;
                    }
                }
                return false;
            }).length > 0
            );
        },
        forced: true,
        async content(event, trigger, player) {
            player.chooseDrawRecover(true);
        },
        ai: { combo: 'zshy_huamu' },
    },
    zshy_liangyuan: {//良缘
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AAZZcaoxiancaohuaJMGX_shadow: `zshy_liangyuan_zshy_AAZZcaoxiancaohuaJMGX_shadow`,
        },
        enable: 'chooseToUse',
        hiddenCard(player, name) {
            if (name == 'tao') {
                return game.hasPlayer(function (current) {
                    var storage = current.getExpansions('zshy_huamu');
                    return (
                        storage.length > 0 &&
                        storage.filter(function (i) {
                            return get.color(i, false) == 'red';
                        }).length > 0
                    );
                });
            } else if (name == 'jiu') {
                return game.hasPlayer(function (current) {
                    var storage = current.getExpansions('zshy_huamu');
                    return (
                        storage.length > 0 &&
                        storage.filter(function (i) {
                            return get.color(i, false) == 'black';
                        }).length > 0
                    );
                });
            }
            return false;
        },
        filter(event, player) {
            if (event.type == 'wuxie') {
                return false;
            }
            if (event.filterCard(get.autoViewAs({ name: 'tao' }, 'unsure'), player, event) &&
                game.hasPlayer(function (current) {
                    var storage = current.getExpansions('zshy_huamu');
                    return (storage.length > 0 && storage.filter(function (i) {
                        return get.color(i, false) == 'red';
                    }).length > 0
                    );
                })) {
                return true;
            }
            if (event.filterCard(get.autoViewAs({ name: 'jiu' }, 'unsure'), player, event) &&
                game.hasPlayer(function (current) {
                    var storage = current.getExpansions('zshy_huamu');
                    return (storage.length > 0 && storage.filter(function (i) {
                        return get.color(i, false) == 'black';
                    }).length > 0
                    );
                })) {
                return true;
            }
            return false;
        },
        chooseButton: {
            dialog() {
                return ui.create.dialog('良缘', [['tao', 'jiu'], 'vcard'], 'hidden');
            },
            filter(button, player) {
                var evt = _status.event.getParent();
                var name = button.link[2],
                    color = name == 'tao' ? 'red' : 'black';
                var cards = [];
                game.countPlayer(function (current) {
                    cards.addArray(current.getExpansions('zshy_huamu').filter(function (i) {
                        return get.color(i, false) == color;
                    }));
                });
                if (!cards.length) {
                    return false;
                }
                var card = get.autoViewAs({ name: name }, cards);
                return evt.filterCard(card, player, evt);
            },
            check(button) {
                if (_status.event.getParent().type != 'phase') {
                    return 1;
                }
                var player = _status.event.player;
                var name = button.link[2],
                    color = name == 'tao' ? 'red' : 'black';
                var cards = [];
                game.countPlayer(function (current) {
                    cards.addArray(
                        current.getExpansions('zshy_huamu').filter(function (i) {
                            return get.color(i, false) == color;
                        })
                    );
                });
                var card = get.autoViewAs({ name: name }, cards);
                return player.getUseValue(card, null, true);
            },
            backup(links, player) {
                var name = links[0][2],
                    color = name == 'tao' ? 'red' : 'black';
                var cards = [];
                game.countPlayer(function (current) {
                    cards.addArray(
                        current.getExpansions('zshy_huamu').filter(function (i) {
                            return get.color(i, false) == color;
                        })
                    );
                });
                if (!cards.length) {
                    return false;
                }
                var card = get.autoViewAs({ name: name }, cards);
                return {
                    viewAs: card,
                    color: color,
                    selectCard: -1,
                    filterCard: () => false,
                    log: false,
                    precontent() {
                        player.logSkill('zshy_liangyuan');
                        var list = [],
                            color = lib.skill.zshy_liangyuan_backup.color;
                        var cards = [];
                        game.countPlayer(function (current) {
                            var cardsx = current.getExpansions('zshy_huamu').filter(function (i) {
                                return get.color(i, false) == color;
                            });
                            if (cardsx.length) {
                                cards.addArray(cardsx);
                                list.push([current, cardsx]);
                                current.$throw(cardsx);
                                game.log(current, '将', cardsx, '化作“' + (color == 'black' ? '灵杉' : '玉树') + '”良缘');
                            }
                        });
                        event.result.cards = cards;
                        event.result._apply_args = { throw: false };
                        game.loseAsync({
                            lose_list: list,
                        }).setContent('chooseToCompareLose');
                    },
                };
            },
            prompt(links, player) {
                var name = links[0][2],
                    color = name == 'tao' ? '玉树' : '灵杉';
                return '将场上所有的“' + color + '”当做【' + get.translation(name) + '】使用';
            },
        },
        ai: {
            order(item, player) {
                if (!player) {
                    player = _status.event.player;
                }
                return (
                    get.order({
                        name: lib.skill.zshy_liangyuan.hiddenCard(player, 'jiu') ? 'jiu' : 'tao',
                    }) + 4
                );
            },
            result: {
                player(player) {
                    if (_status.event.dying) {
                        return get.attitude(player, _status.event.dying);
                    }
                    return 1;
                },
            },
            combo: 'zshy_huamu',
            threaten: 3,
        },
    },
    zshy_jisi: {//羁肆
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AAZZcaoxiancaohuaJMGX_shadow: `zshy_jisi_zshy_AAZZcaoxiancaohuaJMGX_shadow`,
        },
        trigger: { global: 'phaseZhunbeiBegin' },
        filter(event, player) {
            if (event.player == player) {
                return false;
            }
            const skills = player.getStockSkills(true, true).filter(function (skill) {
                if (skill == 'zshy_jisi') {
                    return false;
                }
                var info = get.info(skill);
                return info && !info.charlotte;
            });
            for (const i of skills) {
                if (!event.player.hasSkill(i)) {
                    return true;
                }
            }
            return false;
        },
        async cost(event, trigger, player) {
            const skills = player.getStockSkills(true, true).filter(function (skill) {
                if (skill == 'zshy_jisi') {
                    return false;
                }
                var info = get.info(skill);
                return info && !info.charlotte;
            });
            for (const i of skills) {
                if (trigger.player.hasSkill(i)) {
                    skills.remove(i);
                }
            }
            const result = await player.chooseControl(skills, '取消')
                .set('prompt', '令' + get.translation(trigger.player) + '获得一个技能')
                .set('ai', function () {
                    if (get.attitude(player, trigger.player) > 1) {
                        return skills.includes('zshy_qianmeng') ? 'zshy_qianmeng' : skills.randomGet();
                    } else {
                        return '取消';
                    }
                }).forResult();
            event.result = {
                bool: true,
                cost_data: result.control,
            };
        },
        async content(event, trigger, player) {
            const result = event.cost_data;
            if (result != '取消') {
                trigger.player.addSkills(result);
                const playername = `zshy_AAZZcaoxiancaohuaJMGX`;
                player.changeSkin({ characterName: playername }, playername + '_shadow');
            } else {
                trigger.player.loseMaxHp();
            }
        },
    },
    zshy_huamu_zshy_AAZZcaoxiancaohuaJMGX_shadow: {
        audio: 'ext:诸神寰宇/audio/character:4',
    },
    zshy_qianmeng_zshy_AAZZcaoxiancaohuaJMGX_shadow: {
        audio: 'ext:诸神寰宇/audio/character:2',
    },
    zshy_liangyuan_zshy_AAZZcaoxiancaohuaJMGX_shadow: {
        audio: 'ext:诸神寰宇/audio/character:2',
    },
    zshy_jisi_zshy_AAZZcaoxiancaohuaJMGX_shadow: {
        audio: 'ext:诸神寰宇/audio/character:2',
    },

    //墟曹宇
    zshy_gongjie: {//恭节
        audio: 'olgongjie',
        trigger: { global: 'phaseBegin' },
        filter(event, player) {
            return player.countCards('he');
        },
        direct: true,
        async content(event, trigger, player) {
            var num = player.countCards('he'),
                draws = [];
            var { bool, targets } = await player
                .chooseTarget(get.prompt2('zshy_gongjie'), [1, num], lib.filter.notMe)
                .set('ai', target => get.attitude(_status.event.player, target))
                .forResult();
            if (!bool) {
                return;
            }
            targets = targets.sortBySeat();
            player.logSkill('zshy_gongjie', targets);
            for (var target of targets) {
                var { bool, cards } = await target.gainPlayerCard(player, true, 'he').forResult();
                if (bool) {
                    draws.add(get.suit(cards[0], player));
                }
            }
            await player.recover(draws.length);
            await player.draw(draws.length);
        },
    },
    zshy_xiangxv: {//相胥
        audio: 'olxiangxv',
        trigger: {
            global: 'phaseEnd',
            player: 'damageEnd',
        },
        filter(event, player) {
            const target = _status.currentPhase;
            if (!target?.isIn()) return false;
            const num = target.countCards('h') - player.countCards('h');
            return num > 0 || (num < 0 && player.countDiscardableCards(player, 'h') > 0);
        },
        check(event, player) {
            const target = _status.currentPhase,
                num = target.countCards('h') - player.countCards('h');
            return num > 0 || player.isDamaged();
        },

        logTarget: () => _status.currentPhase,
        async content(event, trigger, player) {
            const target = _status.currentPhase;
            if (!target?.isIn()) return;
            const num = target.countCards('h') - player.countCards('h');
            if (num > 0) {
                const result = await player.draw(num).forResult();
                if (result?.cards?.length) await player.recover(result.cards.length);
            } else if (num < 0) {
                const result = await player.chooseToDiscard(-num, 'h', true, 'allowChooseAll').forResult();
                if (result?.cards?.length) await player.recover(result.cards.length);
            }
        },
    },
    zshy_xiangzuo: {//襄胙
        audio: 'olxiangzuo',
        trigger: { player: 'dying' },
        skillAnimation: true,
        animationColor: 'water',
        filter(event, player) {
            return player.countCards('he') && game.hasPlayer(target => target != player);
        },
        async cost(event, trigger, player) {
            event.result = await player
                .chooseCardTarget({
                    prompt: get.prompt2(event.skill),
                    filterCard: true,
                    selectCard: [1, Infinity],
                    filterTarget: lib.filter.notMe,
                    position: 'he',
                    allowChooseAll: true,
                    ai1(card) {
                        const player = get.event().player;
                        if (!ui.selected.targets.length) {
                            return 0;
                        }
                        const target = ui.selected.targets[0];
                        if (
                            player.hasAllHistory('useSkill', evt => {
                                return evt.skill == 'zshy_gongjie' && (evt.targets || [evt.target]).includes(target);
                            }) &&
                            player.hasAllHistory('useSkill', evt => {
                                return evt.skill == 'zshy_xiangxv' && (evt.targets || [evt.target]).includes(target);
                            })
                        ) {
                            if (get.attitude(player, target) > 0) {
                                return 1;
                            }
                            if (player.canSaveCard(card, player)) {
                                return 0;
                            }
                            if (ui.selected.cards.length + player.hp >= player.maxHp) {
                                return 0;
                            }
                            return 20 - get.value(card);
                        }
                        if (get.attitude(player, target) > 0 && !player.countCards('he', cardx => player.canSaveCard(cardx, player))) {
                            return 1;
                        }
                        return 1;
                    },
                    ai2(target) {
                        const player = get.event().player;
                        const goon =
                            player.hasAllHistory('useSkill', evt => {
                                return evt.skill == 'zshy_gongjie' && (evt.targets || [evt.target]).includes(target);
                            }) &&
                            player.hasAllHistory('useSkill', evt => {
                                return evt.skill == 'zshy_xiangxv' && (evt.targets || [evt.target]).includes(target);
                            }),
                            att = get.attitude(player, target);
                        if (goon) {
                            return 5 * att;
                        }
                        if (player.countCards('he', cardx => player.canSaveCard(cardx, player)) > 0) {
                            return att;
                        }
                        return 1;
                    },
                })
                .forResult();
        },
        async content(event, trigger, player) {
            const target = event.targets[0],
                cards = event.cards;
            await player.give(cards, target);
            await player.recover(cards.length);
            if (
                player.hasAllHistory('useSkill', evt => {
                    return evt.skill == 'zshy_gongjie' && evt.targets.includes(target);
                }) &&
                player.hasAllHistory('useSkill', evt => {
                    return evt.skill == 'zshy_xiangxv' && evt.targets.includes(target);
                })
            ) {
                await player.draw(cards.length);
            }
        },
        ai: {
            combo: 'zshy_gongjie',
        },
    },

    //环淑君
    zshy_huanpei: {//环佩
        audio: 'olhuanpei',
        enable: ['chooseToUse', 'chooseToRespond'],
        filter(event, player) {
            if (player.countCards('h') == player.maxHp) {
                return false;
            }
            return get.inpileVCardList(info => {
                if (info[0] !== 'basic') {
                    return false;
                }
                const card = new lib.element.VCard({ name: info[2], nature: info[3], isCard: true });
                return event.filterCard(card, player, event);
            }).length;
        },
        chooseButton: {
            dialog(event, player) {
                const list = get.inpileVCardList(info => {
                    if (info[0] !== 'basic') {
                        return false;
                    }
                    const card = new lib.element.VCard({ name: info[2], nature: info[3], isCard: true });
                    return event.filterCard(card, player, event);
                });
                const dialog = ui.create.dialog('环佩', [list, 'vcard'], 'hidden');
                dialog.direct = true;
                return dialog;
            },
            check(button) {
                const player = get.player(),
                    card = new lib.element.VCard({ name: button.link[2], nature: button.link[3], isCard: true });
                let eff = _status.event.getParent().type == 'phase' ? player.getUseValue(card) : 3;
                return eff + player.maxHp - player.countCards('h');
            },
            backup(links, player) {
                return {
                    viewAs: {
                        name: links[0][2],
                        nature: links[0][3],
                        suit: 'none',
                        number: null,
                        isCard: true,
                    },
                    popname: true,
                    ignoreMod: true,
                    filterCard(card, player) {
                        return player.countCards('h') > player.maxHp && lib.filter.cardDiscardable(card, player, 'zshy_huanpei');
                    },
                    position: 'h',
                    selectCard() {
                        const player = get.player(),
                            num = player.countCards('h') - player.maxHp;
                        if (num > 0) {
                            return num;
                        }
                        return -1;
                    },
                    manualConfirm: true,
                    check(card) {
                        return 1 / Math.max(0.1, get.value(card));
                    },
                    async precontent(event, trigger, player) {
                        player.logSkill('zshy_huanpei');
                        const cards = event.result.cards;
                        if (cards.length) {
                            await player.modedDiscard(cards);
                        } else {
                            await player.drawTo(player.maxHp);
                        }
                        const { name, nature } = event.result.card;
                        event.result.card = new lib.element.VCard({ name, nature, isCard: true });
                        event.result.cards = [];
                    },
                };
            },
            prompt(links, player) {
                const num = player.countCards('h') - player.maxHp;
                const str = num > 0 ? `弃置${get.cnNumber(num)}张手牌` : `摸${get.cnNumber(-num)}张牌`;
                return `${str}，然后视为使用一张${get.translation(links[0][3] || '')}${get.translation(links[0][2])}`;
            },
        },
        hiddenCard(player, name) {
            if (get.type(name) != 'basic') {
                return false;
            }
            return player.countCards('h') != player.maxHp;
        },
        ai: {
            save: true,
            skillTagFilter(player, tag) {
                return player.countCards('h') != player.maxHp;
            },
            order: 3,
            result: {
                player(player, target) {
                    if (_status.event.dying) {
                        return get.attitude(player, _status.event.dying);
                    }
                    return 1;
                },
            },
        },
    },
    zshy_wenyi: {//温宜
        audio: 'olwenyi',
        trigger: { global: ['changeHpAfter'] },
        filter(event, player) {
            if (event.player.hp != 1 || event.changedHp == 0) {
                return false;
            }
            return true;
        },
        logTarget(event) {
            return event.player;
        },
        check(event, player) {
            return get.attitude(player, event.player) > 0;
        },
        async content(event, trigger, player) {
            await player.useCard({ name: 'tao', isCard: true }, trigger.player, false);
            let num = Math.floor(Math.random() * 5) + 1;
            const card = get.cardPile(function (card) {
                return get.subtype(card) == 'equip' + num && trigger.player.canUse(card, trigger.player);
            });
            if (card) {
                await trigger.player.chooseUseTarget(card, true, 'nopopup');
            }
            await trigger.player.link(false);
            await trigger.player.turnOver(false);
        },
    },
    zshy_miaoxin: {//妙心
        audio: 'olmiaoxin',
        forced: true,
        trigger: {
            global: 'damageEnd',
        },
        getIndex(event) {
            return event.num ?? 0;
        },
        async content(event, trigger, player) {
            if (game.hasPlayer(function (current) {
                return current.hp == 2;
            }) && trigger.player != player) {
                const result = await player.chooseTarget(get.translation(event.name), `选择一名体力值为2的角色，令其增加1点体力上限`, function (card, player, target) {
                    return target.hp == 2;
                }).set('ai', function (target) {
                    return get.attitude(player, target) > 1;
                }).forResult();
                if (result.bool && result.targets) {
                    await result.targets[0].gainMaxHp();
                };
            } else {
                await player.draw(2);
            }
        },
    },

    //墟刘协
    zshy_tianming: {//天命
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { target: 'useCardToTargeted' },
        check(event, player) {
            var cards = player.getCards('h');
            if (cards.length <= 1) {
                for (var i = 0; i < cards.length; i++) {
                    if (cards[i].name == 'jiu' || cards[i].name == 'tao') {
                        return false;
                    }
                }
            }
            return true;
        },
        content() {
            'step 0';
            player.chooseToDiscard('he', true);
            player.chooseDrawRecover(2, true);
            var players = game.filterPlayer();
            players.sort(function (a, b) {
                return b.hp - a.hp;
            });
            if (players[0].hp > players[1].hp && players[0] != player) {
                players[0].chooseBool(get.prompt2('zshy_tianming'));
                event.player = players[0];
            } else {
                event.finish();
            }
            'step 1';
            if (result.bool) {
                player.draw(2);
                player.chooseToDiscard(2, true, 'he');
            }
        },
        ai: {
            effect: {
                target_use(card, player, target, current) {
                    if (card.name == 'sha') {
                        return [1, 0.5];
                    }
                },
            },
        },
    },
    zshy_mizhao: {//密诏
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        filter(event, player) {
            return player.countCards('h') > 0;
        },
        filterCard: true,
        selectCard: -1,
        filterTarget(card, player, target) {
            return player != target;
        },
        discard: false,
        lose: false,
        delay: false,
        ai: {
            order: 1,
            result: {
                player: 0,
                target(player, target) {
                    if (target.hasSkillTag('nogain')) {
                        return 0;
                    }
                    if (player.countCards('h') > 1) {
                        return 1;
                    }
                    var players = game.filterPlayer();
                    for (var i = 0; i < players.length; i++) {
                        if (players[i].countCards('h') && players[i] != target && players[i] != player && get.attitude(player, players[i]) < 0) {
                            break;
                        }
                    }
                    if (i == players.length) {
                        return 1;
                    }
                    return -2 / (target.countCards('h') + 1);
                },
            },
        },
        content() {
            'step 0';
            event.target1 = targets[0];
            player.give(cards, targets[0], false);
            'step 1';
            if (!targets[0].countCards('h')) {
                event.finish();
                return;
            }
            var players = game.filterPlayer();
            for (var i = 0; i < players.length; i++) {
                if (players[i] != event.target1 && players[i] != player && event.target1.canCompare(players[i])) {
                    break;
                }
            }
            if (i == players.length) {
                event.finish();
            }
            'step 2';
            player.chooseTarget(true, '选择拼点目标', function (card, player, target) {
                return _status.event.target1.canCompare(target) && target != player;
            })
                .set('ai', function (target) {
                    var player = _status.event.player;
                    var eff = get.effect(target, { name: 'sha' }, _status.event.target1, player);
                    var att = get.attitude(player, target);
                    if (att > 0) {
                        return eff - 10;
                    }
                    return eff;
                })
                .set('target1', event.target1)
                .set('forceDie', true);
            'step 3';
            if (result.targets.length) {
                event.target2 = result.targets[0];
                event.target1.line(event.target2);
                event.target1.chooseToCompare(event.target2);
            } else {
                event.finish();
            }
            'step 4';
            if (!result.tie) {
                if (result.bool) {
                    if (event.target1.canUse({ name: 'sha', isCard: true }, event.target2, false)) {
                        event.target1.useCard({ name: 'sha', isCard: true }, event.target2);
                    }
                } else if (event.target2.canUse({ name: 'sha', isCard: true }, event.target1, false)) {
                    event.target2.useCard({ name: 'sha', isCard: true }, event.target1);
                }
            }
        },
    },

    //墟刘焉
    zshy_tushe: {//图射
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'useCardToPlayered',
        },
        locked: false,
        filter(event, player) {
            if (event.getParent().triggeredTargets3.length > 1) {
                return false;
            }
            return event.targets.length > 0;
        },
        content() {
            const hs = player.getCards('h', { type: 'basic' });
            player.recast(hs);
            player.draw(trigger.targets.length);
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
                if (card.name === 'zhangba') {
                    return 114514;
                }
                if (['shan', 'tao', 'jiu'].includes(card.name)) {
                    if (player.getEquip('zhangba') && player.countCards('hs') > 1) {
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
        ai: {
            presha: true,
            pretao: true,
            threaten: 1.8,
            effect: {
                player_use(card, player, target) {
                    if (typeof card === 'object' && card.name !== 'shan' &&
                        get.type(card) !== 'equip' && !player.countCards('h', i => {
                            if (card === i || (card.cards && card.cards.includes(i))) {
                                return false;
                            }
                            return get.type(i) === 'basic';
                        })) {
                        let targets = [],
                            evt = _status.event.getParent('useCard');
                        targets.addArray(ui.selected.targets);
                        if (evt && evt.card == card) {
                            targets.addArray(evt.targets);
                        }
                        if (targets.length) {
                            return [1, targets.length];
                        }
                        if (get.tag(card, 'multitarget')) {
                            return [1, game.players.length - 1];
                        }
                        return [1, 1];
                    }
                },
            },
        },
    },
    zshy_limu: {//立牧
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        locked: false,
        discard: false,
        filter(event, player) {
            return (!player.hasJudge('lebu') && player.countCards('hes', { suit: 'diamond' }) > 0)
                || (!player.hasJudge('shandian') && player.countCards('hes', { suit: 'spade' }) > 0)
                || (!player.hasJudge('bingliang') && player.countCards('hes', { suit: 'club' }) > 0);
        },
        viewAs(card, player, event) {
            if (get.suit(card) == 'diamond') return { name: 'lebu' };
            if (get.suit(card) == 'spade') return { name: 'shandian' };
            if (get.suit(card) == 'club') return { name: 'bingliang' };
        },
        position: 'hes',
        filterCard(card, player, event) {
            return (get.suit(card) == 'diamond' && player.canAddJudge({ name: 'lebu', cards: [card] }))
                || (get.suit(card) == 'spade' && player.canAddJudge({ name: 'shandian', cards: [card] }))
                || get.suit(card) == 'club' && player.canAddJudge({ name: 'bingliang', cards: [card] });
        },
        selectTarget: -1,
        filterTarget(card, player, target) {
            return player == target;
        },
        check(card) {
            var player = _status.event.player;
            if (card.name == 'shan') {
                return 99;
            }
            if (card.name == 'tao' || card.name == 'jiu') {
                return 88;
            }
            return 99 - get.value(card);
        },
        prompt: '出牌阶段，你可以将一张<span data-nature="shenmm">方块/梅花/黑桃</span>牌当做<span data-nature="shenmm">【乐不思蜀】/【兵粮寸断】/【闪电】</span>对自己使用，然后你回复1点体力或摸一张牌',
        onuse(links, player) {
            var next = game.createEvent('limu_recover', false, _status.event.getParent());
            next.player = player;
            next.setContent(function () {
                player.chooseDrawRecover(true);
            });
        },
        mod: {
            targetInRange(card, player, target) {
                if (player.countCards('j') && player.inRange(target)) {
                    return true;
                }
            },
            cardUsableTarget(card, player, target) {
                if (player.countCards('j') && player.inRange(target)) {
                    return true;
                }
            },
        },
        ai: {
            order: 52921314,
        },
        group: ['zshy_limu_recast', 'zshy_limu_direct'],
        subSkill: {
            recast: {
                trigger: {
                    global: 'useCardToPlayered',
                },
                forced: true,
                filter(event, player) {
                    return event.target == player && event.player != player && player.countCards('j') > 1;
                },
                async content(event, trigger, player) {
                    player.chooseDrawRecover(true);
                },
            },
            direct: {
                trigger: {
                    player: 'useCard',
                },
                firstDo: true,
                forced: true,
                filter(event, player) {
                    return player.countCards('j') > 2;
                },
                content() {
                    trigger.directHit.addArray(game.players);
                },
            },
        },
    },

    //墟清河公主
    zshy_zengou: {//谮构
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: ['useCard'] },
        filter(event, player) {
            return event.card.name == 'shan';
        },
        logTarget: 'player',
        prompt2: '取消此【闪】的目标并获得其对应的实体牌',
        check(event, player) {
            if (get.attitude(player, event.player) >= 0) {
                return false;
            }
            if (get.damageEffect(event.player, event.getParent(3).player, player, get.nature(event.card)) <= 0) {
                return false;
            }
            return true;
        },
        async content(event, trigger, player) {
            trigger.all_excluded = true;
            var cards = trigger.cards.filterInD();
            if (cards.length) {
                player.gain(cards, 'gain2');
            };
            const result = await player.chooseCard('谮构：请选择任意张牌重铸', [1, Infinity])
                .set('ai', function (card) {
                    return 7 - get.value(card);
                }).forResult();
            if (result.bool) {
                player.recast(result.cards);
                player.recover(result.cards.length);
            }
        },
    },
    zshy_zhangji: {//长姬
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'damageEnd',
            source: 'damageEnd',
        },
        direct: true,
        async content(event, trigger, player) {
            if (trigger.source == player) {
                let str = '选择一名角色令其回复1点体力或摸两张牌';
                const result = await player.chooseTarget(get.prompt('zshy_zhangji'), str).set('ai', function (target) {
                    return get.attitude(_status.event.player, target) > 0;
                }).forResult();
                if (result.targets) {
                    player.logSkill('zshy_zhangji', result.targets[0]);
                    result.targets[0].chooseDrawRecover(2, true);
                }
            }
            if (trigger.player == player) {
                let str = '选择一名角色令其失去1点体力并弃两张牌';
                const result1 = await player.chooseTarget(get.prompt('zshy_zhangji'), str).set('ai', function (target) {
                    return get.attitude(_status.event.player, target) < 0;
                }).forResult();
                if (result1.targets) {
                    player.logSkill('zshy_zhangji', result1.targets[0]);
                    result1.targets[0].loseHp();
                    result1.targets[0].chooseToDiscard('he', 2, true);
                }
            }
        },
        getIndex(event, player) {
            return event.num;
        },
    },

    //墟秦朗
    zshy_xianying: {//贤膺
        audio: 'olxianying',
        trigger: {
            global: ['phaseZhunbeiBegin'],
            player: ['damageEnd'],
        },
        async content(event, trigger, player) {
            await player.draw(2);
            const hs = player.getCards('he', card => lib.filter.cardDiscardable(card, player, 'zshy_xianying'));
            const result = await player
                .chooseToDiscard('he', [0, Infinity], get.prompt(event.name), `你可以弃置任意张牌，然后你依次使用弃置牌，最后你回复使用牌数点体力`, false, 'allowChooseAll')
                .set('chooseonly', true)
                .set('ai', function (card, player, target) {
                    return 6 - get.value(card);
                })
                .forResult();
            if (result?.bool && result?.cards?.length) {
                let num = 0;
                for (const i of result.cards) {
                    const result1 = await player.chooseUseTarget(i, false).forResult();
                    if (result1?.bool) {
                        num++;
                    } else {
                        await player.discard(i);
                    }
                };
                await player.recover(num);
            }
        },
        ai: {
            maixie: true,
            maixie_hp: true,
            effect: {
                target(card, player, target) {
                    if (get.tag(card, 'damage')) {
                        if (player.hasSkillTag('jueqing', false, target)) {
                            return [1, -2];
                        }
                        if (!target.hasFriend() || target.getStorage('zshy_xianying_record').length > 3) {
                            return;
                        }
                        if (target.hp >= 4) {
                            return [1, 2];
                        }
                        if (target.hp == 3) {
                            return [1, 1.5];
                        }
                        if (target.hp == 2) {
                            return [1, 0.5];
                        }
                    }
                },
            },
        },
    },

    //墟芮姬
    zshy_qiaoli: {//巧力
        audio: 'qiaoli',
        enable: 'phaseUse',
        viewAs: {
            name: 'juedou',
            zshy_qiaoli: true,
        },
        filterCard(card, player) {
            if (get.type(card) != 'equip') {
                return false;
            }
            const event = _status.event;
            if (get.subtype(card) == 'equip1' && event.zshy_qiaoli_equip1) {
                return false;
            }
            if (get.subtype(card) != 'equip1' && event.zshy_qiaoli_noequip1) {
                return false;
            }
            return true;
        },
        viewAsFilter(player) {
            return (
                player.isPhaseUsing() &&
                player.hasCard(function (card) {
                    return lib.skill.zshy_qiaoli.filterCard(card, player);
                }, 'hes')
            );
        },
        check(card) {
            if (get.position(card) == 'e') {
                return 7.5 - get.value(card);
            }
            return 12 - _status.event.player.getUseValue(card);
        },
        position: 'hes',
        async precontent(event, trigger, player) {
            player.addTempSkill('zshy_qiaoli_norespond');
            player.addTempSkill('zshy_qiaoli_effect');
        },
        onChooseToUse(event) {
            if (event.type == 'phase' && !game.online && !(event.zshy_qiaoli_equip1 && event.zshy_qiaoli_noequip1)) {
                let player = event.player;
                const list = player.getStorage('zshy_qiaoli_used');
                if (list.includes('equip1')) {
                    event.set('zshy_qiaoli_equip1', true);
                }
                if (list.length && list.some(i => i != 'equip1')) {
                    event.set('zshy_qiaoli_noequip1', true);
                }
            }
        },
        ai: {
            directHit_ai: true,
            skillTagFilter(player, tag, arg) {
                return arg && arg.card && arg.card.name == 'juedou' && _status.event.skill == 'zshy_qiaoli';
            },
        },
        subSkill: {
            norespond: {
                charlotte: true,
                trigger: { player: 'useCard1' },
                filter(event, player) {
                    return event.card.zshy_qiaoli && get.subtype(event.cards[0]) != 'equip1';
                },
                forced: true,
                popup: false,
                async content(event, trigger, player) {
                    player.addTempSkill('zshy_qiaoli_gain');
                    trigger.directHit.addArray(game.players);
                    game.log(trigger.card, '不可被响应');
                },
            },
            effect: {
                charlotte: true,
                trigger: { source: 'damageSource' },
                filter(event, player) {
                    return event.card && event.cards && event.card.zshy_qiaoli && get.subtype(event.cards[0]) == 'equip1';
                },
                forced: true,
                popup: false,
                async content(event, trigger, player) {
                    const card = trigger.cards[0];
                    let num = 1;
                    const info = get.info(card, false);
                    if (info && info.distance && typeof info.distance.attackFrom == 'number') {
                        num -= info.distance.attackFrom;
                    }
                    const result = await player.draw({ num }).forResult();
                    let { cards } = result;
                    if (get.itemtype(cards) != 'cards') {
                        return;
                    }
                    const hs = player.getCards('h');
                    cards = cards.filter(function (card) {
                        return hs.includes(card);
                    });
                    if (!cards.length) {
                        return;
                    }
                    if (_status.connectMode) {
                        game.broadcastAll(function () {
                            _status.noclearcountdown = true;
                        });
                    }
                    const given_map = {};
                    while (cards.some(card => !card.hasGaintag('zshy_qiaoli_given'))) {
                        const result = await player
                            .chooseCardTarget({
                                filterCard(card) {
                                    return get.event().cards.includes(card) && !card.hasGaintag('zshy_qiaoli_given');
                                },
                                cards,
                                filterTarget: lib.filter.notMe,
                                selectCard: [1, cards.length],
                                prompt: '巧力：是否将获得的牌分配给其他角色？',
                                ai1(card) {
                                    return -1;
                                },
                                ai2(target) {
                                    return -1;
                                },
                                allowChooseAll: true,
                            })
                            .forResult();
                        if (result.bool && result.cards?.length && result.targets?.length) {
                            const {
                                cards,
                                targets: [target],
                            } = result;
                            player.addGaintag(cards, 'zshy_qiaoli_given');
                            const id = target.playerid;
                            given_map[id] ??= [];
                            given_map[id].addArray(cards);
                        } else {
                            break;
                        }
                    }
                    if (_status.connectMode) {
                        game.broadcastAll(function () {
                            delete _status.noclearcountdown;
                        });
                        game.stopCountChoose();
                    }
                    const list = [];
                    const loseCards = [];
                    for (const i in given_map) {
                        const source = (_status.connectMode ? lib.playerOL : game.playerMap)[i];
                        const gain = given_map[source.playerid];
                        player.line(source, 'green');
                        list.push([source, gain]);
                        loseCards.push(...gain);
                    }
                    await game
                        .loseAsync({
                            gain_list: list,
                            player,
                            cards: loseCards,
                            giver: player,
                            animate: 'giveAuto',
                        })
                        .setContent('gaincardMultiple');
                },
            },
            gain: {
                charlotte: true,
                audio: 'zshy_qiaoli',
                trigger: { player: 'useCardAfter' },
                filter(event, player) {
                    return event.card.zshy_qiaoli && get.subtype(event.cards[0]) != 'equip1';
                },
                forced: true,
                async content(event, trigger, player) {
                    player.removeSkill(event.name);
                    const card = get.cardPile(
                        function (card) {
                            return get.type(card) == 'equip';
                        },
                        void 0,
                        'random'
                    );
                    if (card) {
                        await player.gain({ cards: [card], animate: 'gain2' });
                    }
                },
            },
        },
    },
    zshy_qingliang: {//清靓
        audio: 'qingliang',
        trigger: { target: 'useCardToTarget' },
        filter(event, player) {
            var bool1 = event.card.name == 'sha';
            var bool2 = get.type2(event.card) == 'trick';
            if (!bool1 && !bool2) {
                return false;
            }
            return player != event.player && player.countCards('h') > 0;
        },

        logTarget: 'player',
        check(event, player) {
            if (get.attitude(player, event.player) > 0 || event.player.hasSkillTag('nogain')) {
                return true;
            }
            const eff = get.effect(player, event.card, event.player, player);
            if (eff >= 0) {
                return false;
            }
            const suits = [],
                banned = [],
                hs = player.getCards('h');
            for (const i of hs) {
                const suit = get.suit(i, player);
                suits.add(suit);
                if (!lib.filter.cardDiscardable(i, player, 'zshy_qingliang')) {
                    banned.add(suit);
                }
            }
            suits.removeArray(banned);
            for (const i of suits) {
                const cards = player.getCards('h', function (card) {
                    return get.suit(card, player) == i;
                });
                if (-eff / 2 - get.value(cards, player) > 0) {
                    return true;
                }
            }
            return false;
        },
        async content(event, trigger, player) {
            await player.showHandcards(get.translation(player) + '发动了【清靓】');
            const hs = player.getCards('h');
            const suits = [...new Set(hs.map(card => get.suit(card, player)))].filter(suit =>
                hs.filter(card => get.suit(card, player) === suit).every(card => lib.filter.cardDiscardable(card, player, 'zshy_qingliang')));
            let index = 0;
            if (suits.length) {
                const result = await player.chooseControl({
                    choiceList: ['和' + get.translation(trigger.player) + '各摸一张牌', '取消此目标，然后弃置一种花色的所有手牌'],
                    ai() { return get.effect(player, trigger.card, trigger.player, player) < 0 ? 1 : 0; },
                }).forResult();
                index = result.index;
            }
            if (index === 0) {
                await game.asyncDraw([player, trigger.player]);
                return;
            }
            const result = await player.chooseControl(suits)
                .set('prompt', '清靓：选择一种花色，弃置该花色的所有手牌')
                .set('ai', () => suits.reduce((best, suit) => {
                    const cost = value => player.getCards('h', card => get.suit(card, player) === value).reduce((sum, card) => sum + get.value(card, player), 0);
                    return cost(suit) < cost(best) ? suit : best;
                }, suits[0])).forResult();
            if (!suits.includes(result.control)) return;
            const cards = player.getCards('h', card => get.suit(card, player) === result.control);
            if (!cards.length || !cards.every(card => lib.filter.cardDiscardable(card, player, 'zshy_qingliang'))) return;
            trigger.targets.remove(player);
            trigger.getParent().triggeredTargets2.remove(player);
            trigger.untrigger();
            await player.discard(cards);
        },
    },

    //墟孙皓
    zshy_canshi: {//残蚀
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'phaseDrawBegin2',
        },
        frequent: true,
        check(event, player) {
            if (player.skipList.includes('phaseUse') || !player.countCards('h', function (card) {
                return get.type(card, 'trick') == 'trick' && player.hasUseTarget(card);
            })) return true;
            var num = game.countPlayer(function (current) {
                if (player.hasZhuSkill('zshy_guiming') && current.group == 'wu' && current != player) return true;
                return current.isDamaged() || player.hp >= current.hp;
            });
            return num > 0;
        },
        prompt(event, player) {
            var num = game.countPlayer(function (current) {
                if (player.hasZhuSkill('zshy_guiming') && current.group == 'wu' && current != player) return true;
                return current.isDamaged() || player.hp >= current.hp;
            });
            return '残蚀：是否多摸' + get.cnNumber(num) + '张牌？';
        },
        filter(event, player) {
            return (game.hasPlayer(function (current) {
                if (player.hasZhuSkill('zshy_guiming') && current.group == 'wu') return true;
                return current.isDamaged() || player.hp > current.hp;
            }));
        },
        content() {
            var num = game.countPlayer(function (current) {
                if (player.hasZhuSkill('zshy_guiming') && current.group == 'wu' && current != player) return true;
                return current.isDamaged() || player.hp >= current.hp;
            });
            trigger.num += num;
        },
        ai: {
            threaten: 5,
        },
        group: ['zshy_canshi_discard'],
        subSkill: {
            discard: {
                audio: 'zshy_canshi',
                trigger: {
                    global: ['useCard', 'respond'],
                },
                forced: true,
                sourceSkill: 'zshy_canshi',
                autodelay: true,
                filter(event, player) {
                    if (event.player == player) {
                        return false;
                    };
                    if (event.player.isDamaged() || (player.hasZhuSkill('zshy_guiming') && event.player.group == 'wu')) {
                        return true;
                    }
                    return (event.player.hp > player.hp && event.player.countCards('he') > 0) || (event.player.hp < player.hp);
                },
                async content(event, trigger, player) {
                    if (((player.hasZhuSkill('zshy_guiming') && trigger.player.group == 'wu') || trigger.player.isDamaged() || trigger.player.hp > player.hp) && trigger.player.countCards('he') > 0) {
                        const result = await trigger.player.chooseCard('he', true).forResult();
                        if (result?.bool) {
                            player.gain(result.cards, 'giveAuto');
                        }
                    };
                    if ((player.hasZhuSkill('zshy_guiming') && trigger.player.group == 'wu') || trigger.player.isDamaged() || trigger.player.hp < player.hp) {
                        player.recover();
                    }
                },
            },
        },
    },
    zshy_chouhai: {//仇海
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            source: 'damageAfter',
        },
        forced: true,
        filter(event, player) {
            return !player.getStorage('zshy_chouhai').includes(event.player);
        },
        content() {
            player.markAuto('zshy_chouhai', [trigger.player]);
        },
        onremove: true,
        mark: true,
        intro: {
            content: '已发动过的目标：$',
            onunmark: true,
        },
        group: ['zshy_chouhai_damage'],
        subSkill: {
            damage: {
                audio: 'zshy_chouhai',
                trigger: {
                    global: 'damageBegin4',
                },
                forced: true,
                filter(event, player) {
                    if (event.player == player) return player.getStorage('zshy_chouhai').includes(event.source) && event.card && get.name(event.card) == 'sha' && !player.countCards('h');
                    else return event.source == player && player.getStorage('zshy_chouhai').includes(event.player);
                },
                content() {
                    trigger.num++;
                },
            },
        },
    },
    zshy_guiming: {//归命
        audio: 'ext:诸神寰宇/audio/character:2',
        zhuSkill: true,
        trigger: {
            global: 'damageAfter',
        },
        forced: true,
        filter(event, player) {
            return event.player != player && event.player.group == 'wu';
        },
        async content(event, trigger, player) {
            player.chooseDrawRecover(true);
        },
    },

};
const 四弼·辅国文曲 = {
    //墟曹羲
    zshy_gangshu: {//刚述
        audio: 'olgangshu',
        trigger: {
            global: 'useCardAfter',
        },
        filter(event, player) {
            return get.type2(event.card, false) != 'basic';
        },
        getInfo: player => {
            if (!player.storage.zshy_gangshu_buff) {
                player.storage.zshy_gangshu_buff = [0, 0, 0];
            }
            return player.storage.zshy_gangshu_buff;
        },
        direct: true,
        async content(event, trigger, player) {
            let info = lib.skill.zshy_gangshu.getInfo(player);
            const result = await player.chooseControl('攻击范围(' + info[0] + ')', '摸牌数(' + info[1] + ')', '使用杀的上限(' + info[2] + ')', 'cancel2')
                .set('prompt', get.prompt(event.name))
                .set('prompt2', '<div class="text center">令以下一个数值+1：<br>1.攻击范围；<br>2.摸牌阶段的摸牌数；<br>3.使用【杀】的次数上限。</div>')
                .set('ai', () => {
                    return _status.event.choice;
                })
                .set(
                    'choice',
                    (function () {
                        var info = lib.skill.zshy_gangshu.getInfo(player);
                        if (info[1] == 0) {
                            return 1;
                        }
                        if (
                            player.hasCard(card => {
                                return get.name(card) == 'sha' && player.hasValueTarget(card);
                            }, 'hs') &&
                            !player.getCardUsable('sha')
                        ) {
                            return 2;
                        }
                        if (
                            !game.hasPlayer(current => {
                                return player.inRange(current) && get.effect(current, { name: 'sha' }, player, player) > 0;
                            })
                        ) {
                            return 0;
                        }
                        var rand = Math.random();
                        var list = [0, 1, 2];
                        if (!list.length) {
                            return 'cancel2';
                        }
                        if (rand < 0.2 && list.includes(0)) {
                            return 0;
                        }
                        if (rand < 0.7 && list.includes(1)) {
                            return 1;
                        }
                        if (rand < 1.0 && list.includes(2)) {
                            return 2;
                        }
                        return list.randomGet();
                    })()
                ).forResult();
            if (result.control == 'cancel2') {
                return;
            }
            player.logSkill(event.name, player);
            player.addSkill('zshy_gangshu_buff');
            info[result.index] = info[result.index] + 1;
            game.log(player, '的', result.control.slice(0, result.control.indexOf('(')), '#y+1');
            player.markSkill('zshy_gangshu_buff');
            lib.skill.zshy_gangshu.subSkill.buff.init(player);
            if (info[result.index] >= player.maxHp) {
                await player.gainMaxHp();
                await player.recoverTo(player.maxHp);
                player.removeSkill('zshy_gangshu_buff');
                game.log(player, '重置了', '#g【刚述】', '的数值');
                const next = player.phaseUse();
                event.next.remove(next);
                trigger.next.push(next);
            }
        },
        ai: {
            threaten: 3,
        },
        subSkill: {
            buff: {
                audio: 'zshy_gangshu',
                init(player) {
                    let info = lib.skill.zshy_gangshu.getInfo(player);
                    player.addTip('zshy_gangshu_buff', '刚述 ' + info.slice().join(' '));
                },
                charlotte: true,
                onremove(player, skill) {
                    delete player.storage[skill];
                    player.removeTip(skill);
                },
                trigger: { player: 'phaseDrawBegin2' },
                forced: true,
                filter(event, player) {
                    var info = lib.skill.zshy_gangshu.getInfo(player);
                    if (!info[1]) {
                        return false;
                    }
                    return !event.numFixed;
                },
                async content(event, trigger, player) {
                    let info = lib.skill.zshy_gangshu.getInfo(player);
                    trigger.num += info[1];
                },
                mod: {
                    attackRange(player, range) {
                        let info = lib.skill.zshy_gangshu.getInfo(player);
                        if (info) {
                            return range + info[0];
                        }
                    },
                    cardUsable(card, player, num) {
                        if (card.name != 'sha') {
                            return;
                        }
                        let info = lib.skill.zshy_gangshu.getInfo(player);
                        if (info) {
                            return num + info[2];
                        };
                        return num;
                    },
                },
                mark: true,
                intro: {
                    markcount(storage, player) {
                        var info = lib.skill.zshy_gangshu.getInfo(player);
                        var str = '';
                        info.forEach(num => (str += parseFloat(num)));
                        return str;
                    },
                    content(storage, player) {
                        var info = lib.skill.zshy_gangshu.getInfo(player);
                        var str = '';
                        if (info[0] > 0) {
                            str += '<li>攻击范围+' + info[0];
                        }
                        if (info[1] > 0) {
                            str += '<li>下个摸牌阶段摸牌数+' + info[1];
                        }
                        if (info[2] > 0) {
                            str += '<li>使用【杀】的次数上限+' + info[2];
                        }
                        return str;
                    },
                },
            },
        },
    },
    zshy_jianxuan: {//谏旋
        audio: 'oljianxuan',
        trigger: {
            global: 'damageEnd',
        },
        direct: true,
        content() {
            'step 0';
            var info = lib.skill.zshy_gangshu.getInfo(player);
            var list = [];
            list.add(player.getAttackRange());
            list.add(2 + info[1]);
            list.add(player.getCardUsable('sha', true));
            list.sort();
            var str = list.join('、').replace(/(.*)、/, '$1或');
            event.list = list;
            player
                .chooseTarget(get.prompt('zshy_jianxuan'), '令一名角色摸一张牌，然后若其手牌数不大于' + str + '，其重复此流程')
                .set('ai', target => {
                    var list = _status.event.list;
                    var player = _status.event.player;
                    var att = get.attitude(player, target);
                    if (att <= 0) {
                        return 0;
                    }
                    var num = target.countCards('h') + 1;
                    var value = 1;
                    while (true) {
                        if (list.includes(num)) {
                            value++;
                            num++;
                        } else {
                            break;
                        }
                    }
                    return value + att / 10;
                })
                .set('list', list);
            'step 1';
            if (result.bool) {
                var target = result.targets[0];
                event.target = target;
                player.logSkill('zshy_jianxuan', target);
                if (player != target) {
                    player.addExpose(0.15);
                }
            } else {
                event.finish();
            }
            'step 2';
            target.draw();
            'step 3';
            let num = Math.max(...event.list);
            if (num >= target.countCards('h') && (num != Infinity && player.maxHp >= target.countCards('h'))) {
                event.goto(2);
            }
        },
        ai: {
            combo: 'zshy_gangshu',
            maixie: true,
        },
    },

    //墟马良
    zshy_zishu: {//自书
        audio: 'ext:诸神寰宇/audio/character:2',
        locked: true,
        group: ['zshy_zishu_draw', 'zshy_zishu_discard', 'zshy_zishu_mark'],
        subSkill: {
            discard: {
                trigger: { global: 'phaseEnd' },
                audio: 'zshy_zishu',
                forced: true,
                filter(event, player) {
                    if (_status.currentPhase != player) {
                        var he = player.getCards('h');
                        var bool = false;
                        player.getHistory('gain', function (evt) {
                            if (!bool && evt && evt.cards) {
                                for (var i = 0; i < evt.cards.length; i++) {
                                    if (he.includes(evt.cards[i])) {
                                        bool = true;
                                    }
                                    break;
                                }
                            }
                        });
                        return bool;
                    }
                    return false;
                },
                async content(event, trigger, player) {
                    var he = player.getCards('h');
                    var list = [];
                    player.getHistory('gain', function (evt) {
                        if (evt && evt.cards) {
                            for (var i = 0; i < evt.cards.length; i++) {
                                if (he.includes(evt.cards[i])) {
                                    list.add(evt.cards[i]);
                                }
                            }
                        }
                    });
                    player.$throw(list, 1000);
                    const result = await player.chooseTarget(
                        '自书：将「自书」牌交给一名其他角色，或弃置之，然后你回复等量体力', lib.filter.notMe)
                        .set('ai', target => get.attitude(player, target) > 0)
                        .forResult();
                    if (result?.targets) {
                        result.targets[0].gain(list, 'giveAuto');
                    } else {
                        player.lose(list, ui.discardPile, 'visible');
                        game.log(player, '将', list, '置入弃牌堆');
                    }
                    player.recover(list.length);
                },
            },
            mark: {
                trigger: {
                    player: 'gainBegin',
                    global: 'phaseBeginStart',
                },
                silent: true,
                filter(event, player) {
                    return event.name != 'gain' || player != _status.currentPhase;
                },
                content() {
                    if (trigger.name == 'gain') {
                        trigger.gaintag.add('zshy_zishu');
                    } else {
                        player.removeGaintag('zshy_zishu');
                    }
                },
            },
            draw: {
                audio: 'zshy_zishu',
                trigger: {
                    player: 'gainAfter',
                    global: 'loseAsyncAfter',
                },
                forced: true,
                filter(event, player) {
                    if (event.getg(player).length == 0) {
                        return false;
                    }
                    return event.getParent(2).name != 'zshy_zishu_draw';
                },
                async content(event, trigger, player) {
                    player.draw(trigger.cards.length, 'nodelay');
                },
            },
        },
        ai: {
            threaten: 1.2,
            nogain: 1,
            skillTagFilter(player) {
                return player != _status.currentPhase;
            },
        },
    },
    zshy_yingyuan: {//应援
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: ['useCardAfter', 'respondAfter'] },
        forced: true,
        direct: true,
        filter(event, player) {
            return event.cards.filterInD().length > 0;
        },
        async content(event, trigger, player) {
            const result = await player.chooseTarget(get.translation(event.name), '将' + get.translation(trigger.cards) + '交给一名其他角色，或你回复1点体力或摸一张牌', function (card, player, target) {
                return target != player;
            }).set('ai', function (target) {
                if (target.hasJudge('lebu')) {
                    return 0;
                }
                let att = get.attitude(_status.event.player, target),
                    name = _status.event.cards[0].name;
                if (att < 3) {
                    return 0;
                }
                if (target.hasSkillTag('nogain')) {
                    att /= 10;
                }
                if (name === 'sha' && target.hasSha()) {
                    att /= 5;
                }
                if (name === 'wuxie' && target.needsToDiscard(_status.event.cards)) {
                    att /= 5;
                }
                return att / (1 + get.distance(player, target, 'absolute'));
            }).set('cards', trigger.cards).forResult();
            if (result?.targets) {
                result.targets[0].gain(trigger.cards.filterInD(), 'gain2');
            } else {
                player.chooseDrawRecover(true);
            };
            player.logSkill(event.name);
        },
    },

    //墟戏志才
    zshy_tiandu_zshy_AAZZxizhicaiJMGX: {//天妒
        audio: 'ext:诸神寰宇/audio/character:2'
    },
    zshy_xianfu: {//先辅
        audio: 'ext:诸神寰宇/audio/character:6',
        logAudio: () => 2,
        trigger: {
            global: ['phaseBefore', 'dieEnd'],
        },
        locked: true,
        filter(event, player) {
            if (event.name == 'die') return player.storage.zshy_xianfu_hp.includes(event.player);
            return game.hasPlayer(current => current != player && !current.hasMark('zshy_xianfu_mark')) &&
                game.hasPlayer(current => current.hasMark('zshy_xianfu_mark')) == 0 && (!player.storage.zshy_xianfu_hp || player.storage.zshy_xianfu_hp.length == 0);
        },
        async cost(event, trigger, player) {
            const result = await player.chooseTarget('请选择〖先辅〗的目标', lib.translate.zshy_xianfu_info, true, function (card, player, target) {
                return target != player && (!player.storage.zshy_xianfu_hp || !player.storage.zshy_xianfu_hp.includes(target));
            }).set('ai', function (target) {
                let att = get.attitude(_status.event.player, target);
                if (att > 0) return att + 1;
                if (att == 0) return Math.random();
                return att;
            }).set('animate', false).forResult();
            event.result = {
                bool: true,
                cost_data: result.targets[0],
            };
        },
        async content(event, trigger, player) {
            let target = event.cost_data;
            if (!player.storage.zshy_xianfu_hp) player.storage.zshy_xianfu_hp = [];
            player.storage.zshy_xianfu_hp.push(target);
            player.addSkill('zshy_xianfu_hp');
            const func = (player, target) => {
                if (!target.storage.zshy_xianfu_mark) target.storage.zshy_xianfu_mark = [];
                target.storage.zshy_xianfu_mark.add(player);
                target.storage.zshy_xianfu_mark.sortBySeat();
                target.markSkill('zshy_xianfu_mark', null, null, true);
            };
            if (event.isMine()) func(player, target);
            else if (player.isOnline2()) func(player, target);
        },
        subSkill: {
            mark: {
                marktext: '辅',
                markimage: 'extension/诸神寰宇/other/Files/Mark/zshy_xianfu.png',
                intro: {
                    name: '先辅',
                    content: '当你受到伤害/失去体力上限后，$受到等量的伤害/失去等量体力上限，当你回复体力/增加体力上限后，$回复等量的体力/增加等量体力上限',
                },
            },
            hp: {
                audio: 'zshy_xianfu',
                charlotte: true,
                trigger: { global: ['damageEnd', 'loseMaxHpEnd', 'recoverEnd', 'gainMaxHpEnd'] },
                forced: true,
                sourceSkill: 'zshy_xianfu',
                filter(event, player) {
                    if (event.player.isDead() || !player.storage.zshy_xianfu_hp || !player.storage.zshy_xianfu_hp.includes(event.player) || event.num <= 0) return false;
                    if (event.name == 'damage' || event.name == 'loseMaxHp' || event.name == 'gainMaxHp') return true;
                    return player.isDamaged();
                },
                logAudio(event, player) {
                    if (event.name == 'damage' || event.name == 'loseMaxHp') return ['ext:诸神寰宇/audio/character/zshy_xianfu3.mp3', 'ext:诸神寰宇/audio/character/zshy_xianfu4.mp3'];
                    return ['ext:诸神寰宇/audio/character/zshy_xianfu5.mp3', 'ext:诸神寰宇/audio/character/zshy_xianfu6.mp3'];
                },
                logTarget: 'player',
                content() {
                    'step 0';
                    var target = trigger.player;
                    if (!target.storage.zshy_xianfu_mark) target.storage.zshy_xianfu_mark = [];
                    target.storage.zshy_xianfu_mark.add(player);
                    target.storage.zshy_xianfu_mark.sortBySeat();
                    target.markSkill('zshy_xianfu_mark');
                    game.delayx();
                    'step 1';
                    player[trigger.name](trigger.num, 'nosource');
                },
                onremove(player) {
                    if (!player.storage.zshy_xianfu_hp) return;
                    game.countPlayer(function (current) {
                        if (player.storage.zshy_xianfu_hp.includes(current) && current.storage.zshy_xianfu_mark) {
                            current.storage.zshy_xianfu_mark.remove(player);
                            if (!current.storage.zshy_xianfu_mark.length) current.unmarkSkill('zshy_xianfu_mark');
                            else current.markSkill('zshy_xianfu_mark');
                        }
                    });
                    delete player.storage.zshy_xianfu_hp;
                },
                group: 'zshy_xianfu_die',
            },
            die: {
                trigger: { global: 'dieBegin' },
                silent: true,
                sourceSkill: 'zshy_xianfu',
                filter(event, player) {
                    return event.player == player || (player.storage.zshy_xianfu_hp && player.storage.zshy_xianfu_hp.includes(player));
                },
                content() {
                    if (player == trigger.player) lib.skill.zshy_xianfu_hp.onremove(player);
                    else player.storage.zshy_xianfu_hp.remove(event.player);
                },
            },
        },
    },
    zshy_chouce: {//筹策
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'damageEnd' },
        getIndex: event => event.num,
        filter(event) {
            return event.num > 0;
        },
        async content(event, trigger, player) {
            const result = await player.judge().forResult();
            const color = result?.color;
            let result2;
            switch (color) {
                case 'black':
                    await player.draw();
                    if (game.hasPlayer(current => current.countDiscardableCards(player, 'hej'))) {
                        result2 = await player.chooseTarget('弃置一名角色区域内的一张牌',
                            (card, player, target) => {
                                return target.countDiscardableCards(player, 'hej');
                            }, true).set('ai', target => {
                                const player = get.player();
                                let att = get.attitude(player, target);
                                if (att < 0) {
                                    att = -Math.sqrt(-att);
                                } else {
                                    att = Math.sqrt(att);
                                }
                                return att * lib.card.guohe.ai.result.target(player, target);
                            }).forResult();
                    }
                    break;
                case 'red':
                    await player.recover();
                    const next = player.chooseTarget('令一名角色摸一张牌');
                    if (player.storage.zshy_xianfu_hp?.length) {
                        next.set('prompt2', '（若目标为' + get.translation(player.storage.zshy_xianfu_hp) + '则改为摸两张牌）');
                    }
                    next.set('ai', target => {
                        const player = get.player();
                        let att = get.attitude(player, target) / Math.sqrt(1 + target.countCards('h'));
                        if (target.hasSkillTag('nogain')) att /= 10;
                        if (player.storage.zshy_xianfu_hp?.includes(target)) return att * 2;
                        return att;
                    });
                    result2 = await next.forResult();
                    break;
                default:
                    break;
            }
            if (result2?.bool && result2?.targets?.length) {
                const target = result2.targets[0];
                player.line(target, 'green');
                if (color == 'black') {
                    if (target.countDiscardableCards(player, 'hej')) await player.discardPlayerCard(target, 'hej', true);
                } else {
                    if (player.storage.zshy_xianfu_hp?.includes(target)) {
                        target.storage.zshy_xianfu_mark ??= [];
                        target.storage.zshy_xianfu_mark.add(player);
                        target.storage.zshy_xianfu_mark.sortBySeat();
                        target.markSkill('zshy_xianfu_mark');
                        await target.draw(2);
                    } else {
                        await target.draw();
                    }
                }
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
                        if (target.hp >= 4) return [1, get.tag(card, 'damage') * 1.5];
                        if (target.hp == 3) return [1, get.tag(card, 'damage') * 1];
                        if (target.hp == 2) return [1, get.tag(card, 'damage') * 0.5];
                    }
                },
            },
        },
    },

    //墟羊祜
    zshy_huaiyuan: {//怀远
        audio: 'huaiyuan',
        trigger: {
            player: 'loseAfter',
            global: ['equipAfter', 'addJudgeAfter', 'gainAfter', 'loseAsyncAfter', 'addToExpansionAfter'],
        },
        getIndex(event, player) {
            if (!event.getl?.(player)?.hs?.length) {
                return false;
            }
            let num = 0;
            if (player.hasSkill('zshy_huaiyuan_add')) {
                return event.getl?.(player)?.hs?.length;
            }
            if (event.name == 'lose') {
                Object.values(event.gaintag_map)
                    .flat()
                    .forEach(tags => {
                        if (tags.includes('zshy_huaiyuanx')) {
                            num++;
                        }
                    });
            } else {
                player.checkHistory('lose', evt => {
                    if (event != evt.getParent()) {
                        return;
                    }
                    Object.values(evt.gaintag_map)
                        .flat()
                        .forEach(tags => {
                            if (tags.includes('zshy_huaiyuanx')) {
                                num++;
                            }
                        });
                });
            }
            return num;
        },
        async cost(event, trigger, player) {
            event.result = await player
                .chooseTarget(true, '请选择【怀远】的目标', '令一名角色执行一项：⒈其的体力上限与手牌上限+1。⒉其的出杀次数与攻击范围+1。⒊其回复1点体力并摸一张牌。')
                .set('ai', target => {
                    const player = get.player();
                    let att = get.attitude(player, target);
                    if (att <= 0) {
                        return 0;
                    }
                    if (target.isDamaged()) {
                        att *= 5;
                    }
                    if (target.hasValueTarget({ name: 'sha' }, false) && !target.hasValueTarget({ name: 'sha' })) {
                        att *= 2.2;
                    }
                    if (target.needsToDiscard()) {
                        att *= 1.3;
                    }
                    return att * Math.sqrt(Math.max(1, 4 - target.countCards('h')));
                })
                .forResult();
        },
        async content(event, trigger, player) {
            const {
                targets: [target],
            } = event;
            player.line(target, 'green');
            const str = get.translation(target);
            const result = await player
                .chooseControl()
                .set('choiceList', [`令${str}的体力上限与手牌上限+1`, `令${str}的出杀次数与攻击范围+1`, `令${str}回复1点体力并摸一张牌`])
                .set('ai', () => {
                    const { player, target } = get.event();
                    if (target.isDamaged()) {
                        return 2;
                    }
                    if (target.hasValueTarget({ name: 'sha' }, false) && !target.hasValueTarget({ name: 'sha' })) {
                        return 1;
                    }
                    if (target.needsToDiscard()) {
                        return 0;
                    }
                    return 2;
                })
                .set('target', target)
                .forResult();
            if (result?.index == 2) {
                await target.recover();
                await target.draw();
            } else if ([0, 1].includes(result?.index)) {
                target.addSkill('zshy_huaiyuan_effect' + result.index);
                if (result.index == 0) {
                    target.gainMaxHp();
                }
                target.addMark('zshy_huaiyuan_effect' + result.index, 1, false);
                game.log(target, '的', '#g' + ['体力上限与手牌上限', '出杀次数与攻击范围'][result.index], '+1');
                await game.delayx();
            }
        },
        group: ['zshy_huaiyuan_init', 'zshy_huaiyuan_die'],
        subSkill: {
            init: {
                audio: 'zshy_huaiyuan',
                trigger: {
                    global: 'phaseBefore',
                    player: 'enterGame',
                },
                forced: true,
                locked: false,
                filter(event, player, name) {
                    return (event.name != 'phase' || game.phaseNumber == 0) && player.countCards('h') > 0;
                },
                async content(event, trigger, player) {
                    const hs = player.getCards('h');
                    if (hs.length) {
                        player.addGaintag(hs, 'zshy_huaiyuanx');
                    }
                },
            },
            die: {
                audio: 'zshy_huaiyuan',
                trigger: { player: 'die' },
                forceDie: true,
                skillAnimation: true,
                animationColor: 'water',
                filter(event, player) {
                    if (!game.hasPlayer(current => player != current)) {
                        return false;
                    }
                    return player.hasMark('zshy_huaiyuan_effect0') || player.hasMark('zshy_huaiyuan_effect1');
                },
                async cost(event, trigger, player) {
                    let str = '令一名其他角色',
                        num1 = player.countMark('zshy_huaiyuan_effect0'),
                        num2 = player.countMark('zshy_huaiyuan_effect1');
                    if (num1 > 0) {
                        str += '体力上限与手牌上限+';
                        str += num1;
                        if (num2 > 0) {
                            str += '且';
                        }
                    }
                    if (num2 > 0) {
                        str += '出杀次数与攻击范围+';
                        str += num2;
                    }
                    event.result = await player
                        .chooseTarget(lib.filter.notMe, get.prompt(event.skill), str)
                        .set('forceDie', true)
                        .set('ai', target => {
                            const player = get.player();
                            return get.attitude(player, target) + 114514;
                        })
                        .forResult();
                },
                async content(event, trigger, player) {
                    const {
                        targets: [target],
                    } = event;
                    const effect = 'zshy_huaiyuan_effect0',
                        effect1 = 'zshy_huaiyuan_effect1';
                    const num1 = player.countMark(effect),
                        num2 = player.countMark(effect1);
                    if (num1 > 0) {
                        target.addSkill(effect);
                        target.gainMaxHp(num1);
                        target.addMark(effect, num1, false);
                    }
                    if (num2 > 0) {
                        target.addSkill(effect1);
                        target.addMark(effect1, num2, false);
                    }
                    await game.delayx();
                },
            },
            effect0: {
                charlotte: true,
                onremove(player) {
                    player.loseMaxHp(player.countMark('zshy_huaiyuan_effect0'))
                    return true;
                },
                mod: {
                    maxHandcard(player, num) {
                        return num + player.countMark('zshy_huaiyuan_effect0');
                    },
                },
                marktext: '怀',
                intro: { content: '体力上限与手牌上限+#' },
            },
            effect1: {
                charlotte: true,
                onremove: true,
                mod: {
                    attackRange(player, num) {
                        return num + player.countMark('zshy_huaiyuan_effect1');
                    },
                    cardUsable(card, player, num) {
                        if (get.name(card) != 'sha') {
                            return;
                        }
                        return num + player.countMark('zshy_huaiyuan_effect1');
                    },
                },
                marktext: '远',
                intro: { content: '出杀次数与攻击范围+#' },
            },
            add: {
                charlotte: true,
                onremove: true,
                mark: true,
                marktext: '德彰',
                intro: { content: '〖怀远〗描述中的“「绥」”改为“牌”' },
            },
        },
    },
    zshy_chongxin: {//崇信
        audio: 'chongxin',
        enable: 'phaseUse',
        usable: 1,
        filter(event, player) {
            return player.hasCard(lib.filter.cardRecastable, 'he') && game.hasPlayer(current => get.info('zshy_chongxin').filterTarget(null, player, current));
        },
        filterCard: lib.filter.cardRecastable,
        filterTarget(card, player, target) {
            return target != player && target.countCards('he');
        },
        check(card) {
            return 6 - get.value(card);
        },
        discard: false,
        lose: false,
        delay: false,
        position: 'he',
        selectCard: [1, 2],
        async content(event, trigger, player) {
            const { cards, target } = event;
            await player.recast(cards);
            if (!target.hasCard(lib.filter.cardRecastable, 'he')) {
                return;
            }
            const result = await target.chooseCard('he', true, '请重铸至多两张张牌', lib.filter.cardRecastable, [1, 2]).forResult();
            if (result?.bool && result?.cards?.length) {
                await target.recast(result.cards);
            }
        },
        ai: {
            order: 6,
            result: {
                player: 1,
                target(player, target) {
                    return 0.5 * Math.sqrt(Math.min(3, target.countCards('h')));
                },
            },
        },
    },
    zshy_dezhang: {//德彰
        audio: 'dezhang',
        trigger: { player: ['useCard', 'respond'], },
        derivation: 'zshy_weishu',
        juexingji: true,
        forced: true,
        skillAnimation: true,
        animationColor: 'thunder',
        filter(event, player) {
            return !player.hasCard(function (card) {
                return card.hasGaintag('zshy_huaiyuanx');
            }, 'h');
        },
        async content(event, trigger, player) {
            player.awakenSkill(event.name);
            player.loseMaxHp();
            player.addSkills(['zshy_weishu', 'zshy_huaiyuan_add']);
        },
    },
    zshy_weishu: {//卫戍
        audio: 'weishu',
        trigger: { player: 'gainAfter' },
        forced: true,
        filter(event, player) {
            return event.getParent().name == 'draw' && event.getParent(2).name != 'zshy_weishu';
        },
        content() {
            'step 0';
            player.chooseTarget(true, '请选择【卫戍】的目标', '令一名角色摸一张牌').set('ai', function (target) {
                return get.attitude(_status.event.player, target) * Math.sqrt(Math.max(1, 4 - target.countCards('h')));
            });
            'step 1';
            if (result.bool) {
                var target = result.targets[0];
                player.line(target, 'green');
                target.draw();
            }
        },
        group: 'zshy_weishu_discard',
        subSkill: {
            discard: {
                audio: 'zshy_weishu',
                trigger: {
                    player: 'loseAfter',
                    global: 'loseAsyncAfter',
                },
                forced: true,
                filter(event, player) {
                    return event.type == 'discard' && event.getParent(3).name != 'zshy_weishu_discard' && event.getl(player).cards2.length > 0 && game.hasPlayer(target => target != player && target.countDiscardableCards(player, 'he') > 0);
                },
                content() {
                    'step 0';
                    player
                        .chooseTarget(true, '请选择【卫戍】的目标', '弃置一名其他角色的一张牌', function (card, player, target) {
                            return target != player && target.countDiscardableCards(player, 'he') > 0;
                        })
                        .set('ai', function (target) {
                            var player = _status.event.player;
                            return get.effect(target, { name: 'guohe_copy2' }, player, player);
                        });
                    'step 1';
                    if (result.bool) {
                        var target = result.targets[0];
                        player.line(target, 'green');
                        player.discardPlayerCard(target, 'he', true);
                    }
                },
            },
        },
    },

    //墟杨仪
    zshy_juanxia: {//狷狭
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: 'phaseZhunbeiBegin' },
        filter(event, player) {
            return event.player != player;
        },
        prompt2(event, player) {
            return `依次视为对${get.translation(event.player)}使用任意种单目标普通锦囊牌，然后其于回合结束阶段可视为对你使用等量的【杀】。`
        },
        check(event, player) {
            var list = [];
            for (var name of lib.inpile) {
                var info = lib.card[name];
                if (!info || info.type != 'trick' || info.notarget || (info.selectTarget && info.selectTarget != 1)) {
                    continue;
                }
                if (!player.canUse(name, event.player, false)) {
                    continue;
                }
                var eff = get.effect(event.player, { name: name }, player, player);
                if (eff > 0) {
                    list.push(eff);
                }
            }
            list.sort().reverse();
            if (!list.length) {
                return false;
            }
            return list[0] + (list[1] || 0) + (list[2] || 0);
        },
        content(event) {
            'step 0';
            var target = trigger.player;
            event.target = target;
            player.logSkill('zshy_juanxia', target);
            'step 1';
            var list = [];
            for (var name of lib.inpile) {
                var info = lib.card[name];
                if (!info || info.type != 'trick' || info.notarget || (info.selectTarget && info.selectTarget != 1)) {
                    continue;
                }
                list.push(name);
            }
            if (!list.length) {
                event.finish();
            } else {
                event.list = list;
                event.count = 0;
            }
            'step 2';
            var list = event.list.filter(function (name) {
                return player.canUse(name, target, false);
            });
            if (list.length) {
                var next = player.chooseButton(['视为对' + get.translation(target) + '使用一张牌', [list, 'vcard']]).set('ai', function (button) {
                    let evt = _status.event.getParent(),
                        eff = get.effect(evt.target, { name: button.link[2] }, evt.player, evt.player);
                    if (evt.target.hp < 2 || get.attitude(evt.player, evt.target) > 0 || (evt.target.hp < 3 && get.tag(button.link, 'damage'))) {
                        return eff;
                    }
                    return eff + get.effect(evt.player, { name: 'sha' }, evt.target, evt.player);
                });
                if (event.count == 0) {
                    next.set('forced', true);
                }
            } else {
                event.stopped = true;
                event.goto(4);
            }
            'step 3';
            if (result.bool) {
                event.count++;
                var name = result.links[0][2];
                event.list.remove(name);
                player.useCard({ name: name, isCard: true }, target, false);
            } else {
                event.stopped = true;
            }
            'step 4';
            if (target.isIn() && event.count > 0) {
                if (!event.stopped && event.list.length > 0) {
                    event.goto(2);
                } else {
                    target.addTempSkill('zshy_juanxia_counter', { player: 'phaseAfter' });
                    if (!target.storage.zshy_juanxia_counter) {
                        target.storage.zshy_juanxia_counter = {};
                    }
                    if (!target.storage.zshy_juanxia_counter[player.playerid]) {
                        target.storage.zshy_juanxia_counter[player.playerid] = 0;
                    }
                    target.storage.zshy_juanxia_counter[player.playerid] += event.count;
                }
            }
        },
        subSkill: {
            counter: {
                trigger: { player: 'phaseEnd' },
                forced: true,
                charlotte: true,
                onremove: true,
                filter(event, player) {
                    var map1 = _status.connectMode ? lib.playerOL : game.playerMap,
                        map2 = player.storage.zshy_juanxia_counter;
                    if (!map2) {
                        return false;
                    }
                    for (var i in map2) {
                        if (map1[i] && map1[i].isIn() && player.canUse('sha', map1[i], false)) {
                            return true;
                        }
                    }
                    return false;
                },
                logTarget(event, player) {
                    var list = [];
                    var map1 = _status.connectMode ? lib.playerOL : game.playerMap,
                        map2 = player.storage.zshy_juanxia_counter;
                    if (!map2) {
                        return false;
                    }
                    for (var i in map2) {
                        if (map1[i] && map1[i].isIn()) {
                            list.push(map1[i]);
                        }
                    }
                    return list;
                },
                content(event) {
                    'step 0';
                    var list = [];
                    var map1 = _status.connectMode ? lib.playerOL : game.playerMap,
                        map2 = player.storage.zshy_juanxia_counter;
                    if (!map2) {
                        return false;
                    }
                    for (var i in map2) {
                        if (map1[i] && map1[i].isIn()) {
                            list.push(map1[i]);
                        }
                    }
                    list.sortBySeat();
                    event.num = 0;
                    event.targets = list;
                    'step 1';
                    var target = targets[num];
                    event.target = target;
                    if (target.isIn() && player.canUse('sha', target, false)) {
                        player.chooseBool('狷狭：是否视为对' + get.translation(target) + '依次使用' + get.cnNumber(player.storage.zshy_juanxia_counter[target.playerid]) + '张【杀】？')
                            .set('goon', get.effect(target, { name: 'sha' }, player, player) > 0)
                            .set('ai', () => _status.event.goon);
                    }
                    'step 2';
                    event.num++;
                    if (result.bool) {
                        event.count = player.storage.zshy_juanxia_counter[target.playerid];
                    } else if (event.num < targets.length) {
                        event.goto(1);
                    } else {
                        event.finish();
                    }
                    'step 3';
                    event.count--;
                    if (target.isIn() && player.canUse('sha', target, false)) {
                        player.useCard({ name: 'sha', isCard: true }, target, false);
                    }
                    if (event.count > 0) {
                        event.redo();
                    } else if (event.num < targets.length) {
                        event.goto(1);
                    }
                },
            },
        },
    },
    zshy_dingcuo: {//定措
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'damageEnd',
            source: 'damageSource',
        },
        frequent: true,
        async content(event, trigger, player) {
            const result = await player.draw(2).forResult();
            const cards = result?.cards || [];
            if (cards.length !== 2) return;
            if (get.color(cards[0], player) === get.color(cards[1], player)) {
                await player.recover();
                return;
            }
            await player.chooseToDiscard('h', 1, true);
            if (!game.hasPlayer(target => target !== player)) return;
            const choice = await player.chooseTarget(true, '定措：对一名其他角色造成1点伤害',
                (card, player, target) => target !== player)
                .set('ai', target => get.damageEffect(target, player, player)).forResult();
            if (choice.targets?.[0]?.isIn()) await choice.targets[0].damage(1, player);
        },
    },

    //墟张华
    zshy_bihun: {//弼昏
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'useCardToTargeted',
        },
        filter(event, player) {
            return event.isFirstTarget && event.targets.some(target => target != player) && event.targets.length == 1;
        },
        prompt2(event, player, target) {
            return '是否取消之并令' + get.translation(event.target) + '获得' + get.translation(event.cards) + '？';
        },
        async content(event, trigger, player) {
            var cards = trigger.cards.filterInD();
            if (cards.length) {
                game.delayx();
                trigger.targets[0].gain(cards, 'gain2');
            }
            var targets = trigger.targets.filter(target => target != player);
            trigger.targets.removeArray(targets);
            trigger.getParent().triggeredTargets1.removeArray(targets);
        },
        ai: {
            threaten: 0.8,
            neg: true,
            effect: {
                player(card, player, target) {
                    if ((!card.isCard || !card.cards) && get.itemtype(card) != 'card') {
                        return;
                    }
                    let cs = 0;
                    if (
                        target &&
                        player != target &&
                        player.countCards('h', i => {
                            if (card === i || (card.cards && card.cards.includes(i))) {
                                cs++;
                                return false;
                            }
                            return true;
                        }) > player.getHandcardLimit()
                    ) {
                        let targets = [],
                            evt = _status.event.getParent('useCard');
                        targets.addArray(ui.selected.targets);
                        if (evt && evt.card == card) {
                            targets.addArray(evt.targets);
                        }
                        if (targets.length) {
                            if (targets.length > 1 || !targets.includes(target)) {
                                return 'zeroplayertarget';
                            }
                            return;
                        }
                        let info = get.info(card);
                        if (!info || info.notarget || !info.filterTarget) {
                            return;
                        }
                        let range,
                            select = get.copy(info.selectTarget),
                            filter;
                        if (select === undefined) {
                            range = [1, 1];
                        } else if (typeof select === 'number') {
                            range = [select, select];
                        } else if (get.itemtype(select) === 'select') {
                            range = select;
                        } else if (typeof select === 'function') {
                            range = select(card, player);
                        }
                        if (info.singleCard) {
                            range = [1, 1];
                        }
                        game.checkMod(card, player, range, 'selectTarget', player);
                        if (range[1] < -1) {
                            range = [1, 1];
                        } else if (range[0] < 0) {
                            if (info.filterTarget === true) {
                                filter = game.players.length;
                            } else {
                                filter = game.countPlayer(current => {
                                    return info.filterTarget(card, player, current);
                                });
                            }
                            range = [filter, filter];
                        }
                        if (range && range[0] > 1 && range[1] > 1) {
                            return 'zeroplayertarget';
                        }
                        return [0, 0, 0, 1];
                    }
                },
            },
        },
    },
    zshy_jianhe: {//剑合
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        filterTarget(card, player, target) {
            return true;
        },
        filterCard(card, player) {
            if (ui.selected.cards.length) {
                var cardx = ui.selected.cards[0];
                return get.type2(card) == get.type2(cardx);
            }
            var cards = player.getCards('he');
            for (var cardx of cards) {
                if (card != cardx) {
                    if (get.type2(card) == get.type2(cardx)) {
                        return true;
                    }
                }
            }
            return false;
        },
        selectCard: [1, Infinity],
        position: 'he',
        discard: false,
        lose: false,
        check(card) {
            if (get.type(card) == 'equip') {
                return 10 - get.value(card);
            }
            return 7 - get.value(card);
        },
        content() {
            'step 0';
            event.type = get.type2(cards[0], player);
            player.recast(cards);
            'step 1';
            const type = event.type;
            target
                .chooseCard(get.translation(player) + '对你发动了【剑合】', '请重铸' + get.cnNumber(cards.length) + '张' + get.translation(type) + '牌，或点“取消”受到' + cards.length + '点雷电伤害', cards.length, 'he', (card, player) => {
                    return get.type2(card) == _status.event.type && player.canRecast(card);
                })
                .set('ai', card => {
                    if (_status.event.goon) {
                        return (get.type(card) == 'equip' ? 15 : 7) - get.value(card);
                    }
                    return 0;
                })
                .set('type', type)
                .set('goon', get.damageEffect(target, player, target, 'thunder') < 0);
            'step 2';
            if (result.bool) {
                target.recast(result.cards);
            } else {
                target.damage(player, 'thunder', event.cards.length);
            }
            'step 3';
            game.delayx();
        },
        ai: {
            order(item, player) {
                if (player.hasSkill('zshy_bihun') && player.countCards('h') > player.getHandcardLimit()) {
                    return 11;
                }
                return 4;
            },
            threaten: 2.4,
            expose: 0.1,
            result: {
                player: 1,
                target(player, target) {
                    const cards = ui.selected.cards,
                        type = get.type2(cards[0]),
                        damage = get.damageEffect(target, player, target, 'thunder');
                    if (player === target) {
                        if (
                            target.countCards('he', card => {
                                return !cards.includes(card) && get.type(card) === type && get.value(card) < 6;
                            }) >= cards.length
                        ) {
                            return Math.max(2, damage);
                        }
                        return damage;
                    }
                    const he = target.getCards('he'),
                        known = target.getKnownCards(player);
                    let num = 0;
                    if (type === 'basic') {
                        num = 0.42;
                    } else if (type === 'equip') {
                        num = 0.1;
                    } else if (type === 'trick') {
                        num = 0.25;
                    }
                    if (
                        known.filter(card => {
                            return get.type(card) === type && get.value(card) < 6;
                        }).length +
                        (he - known.length) * num >=
                        cards.length
                    ) {
                        return Math.max(3, damage);
                    }
                    return damage;
                },
            },
        },
    },
    zshy_chuanwu: {//穿屋
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'damageEnd',
            source: 'damageSource',
        },
        forced: true,
        filter(event, player) {
            return player.getAttackRange() > 0;
        },
        async content(event, trigger, player) {
            const target = event.triggername == 'damageEnd' ? trigger.source : player;
            let skills = game.filterSkills(
                target.getStockSkills(true, true).filter(skill => {
                    const info = get.info(skill);
                    return !info.persevereSkill || !info.charlotte;
                }),
                target
            );
            var num = Math.min(player.getAttackRange(), skills.length);
            skills = skills.slice(0, num);
            target.disableSkill('zshy_chuanwu', skills);
            target.addTempSkill('zshy_chuanwu_restore');
            var str = '';
            for (var i of skills) {
                str += '【' + get.translation(i) + '】、';
                target.popup(i);
            }
            str = str.slice(0, -1);
            game.log(target, '的技能', '#g' + str, '失效了');
            player.chooseDrawRecover(player.getAttackRange(), player.getAttackRange(), true);
        },
        subSkill: {
            restore: {
                charlotte: true,
                forced: true,
                popup: false,
                onremove(player) {
                    player.enableSkill('zshy_chuanwu');
                    game.log(player, '恢复了技能');
                },
            },
        },
    },

    //墟诸葛瑾
    zshy_mingzhe: {//明哲
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'loseAfter',
            global: ['equipAfter', 'addJudgeAfter', 'gainAfter', 'loseAsyncAfter', 'addToExpansionAfter'],
        },
        forced: true,
        filter(event, player) {
            if (player.isPhaseUsing()) {
                return false;
            }
            var evt = event.getl(player);
            for (var i of evt.cards2) {
                return true;
            }
            return false;

        },
        content() {
            if (!trigger.visible) {
                var cards = trigger.getl(player).hs.filter(function (i) {
                    return true;
                });
                if (cards.length > 0) {
                    player.showCards(cards, get.translation(player) + '发动了【明哲】');
                }
            }
            var num = trigger.getl(player).cards2.length;
            player.draw(num);
        },
    },
    zshy_hongyuan: {//弘援
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'gainAfter', global: 'loseAsyncAfter' },
        frequent: true,
        filter(event, player) {
            if (!player.countCards('he')) {
                return false;
            }
            return event.getg(player).length >= 2;
        },
        async content(event, trigger, player) {
            let selectedTargets = [];
            while (
                selectedTargets.length < 2 &&
                player.countCards('he') &&
                game.hasPlayer(target => {
                    return target != player && !selectedTargets.includes(target);
                })
            ) {
                const { bool, targets, cards } = await player.chooseCardTarget({
                    prompt: '弘援：将一张牌交给一名其他角色，若此牌为红色则你回复1点体力',
                    filterCard: true,
                    position: 'he',
                    filterTarget(card, player, target) {
                        return target != player && !get.event().selectedTargets.includes(target);
                    },
                    complexCard: true,
                    complexTarget: true,
                    complexSelect: true,
                    ai1(card) {
                        const player = get.event().player;
                        if (
                            !game.hasPlayer(current => {
                                if (get.event().selectedTargets.includes(current)) {
                                    return false;
                                }
                                return current != player && get.attitude(player, current) > 0 && !current.hasSkillTag('nogain');
                            })
                        ) {
                            return -get.value(card);
                        }
                        return 4 + (player.hasSkill('zshy_mingzhe') && get.color(card) == 'red' ? 2 : 0) - Math.max(player.getUseValue(card), get.value(card, player));
                    },
                    ai2(target) {
                        const player = _status.event.player,
                            att = get.attitude(player, target);
                        if (!ui.selected.cards.length) {
                            return att;
                        }
                        const card = ui.selected.cards[0],
                            val = get.value(card, target);
                        if (val < 0) {
                            return -att * Math.sqrt(-val);
                        }
                        return att * Math.sqrt(val + 2);
                    },
                }).set('selectedTargets', selectedTargets).forResult();
                if (bool) {
                    const target = targets[0];
                    selectedTargets.push(target);
                    player.line(target);
                    await player.give(cards, target);
                    if (get.color(cards) == 'red') player.recover();
                } else {
                    break;
                }
            }
        },
        ai: { threaten: 0.8 },
    },
    zshy_huanshi: {//缓释
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: 'judge' },
        filter(event, player) {
            return player.countCards('h') > 0;
        },
        logTarget: 'player',
        prompt2(event, player) {
            var str = get.translation(event.player) + '的' + event.judgestr + '判定为' + get.translation(event.player.judging[0]) + '。你可以令其观看你的牌，其选择一张牌进行改判。';
            if (!player.hasSkill('zshy_huanshi_mark', null, null, false)) {
                str += '然后你可以重铸任意张牌。';
            }
            return str;
        },
        check(event, player) {
            if (get.attitude(player, event.player) <= 0) {
                return false;
            }
            var cards = player.getCards('he');
            var judge = event.judge(event.player.judging[0]);
            for (var i = 0; i < cards.length; i++) {
                var judge2 = event.judge(cards[i]);
                if (judge2 > judge) {
                    return true;
                }
                if (_status.currentPhase != player && judge2 == judge && get.color(cards[i]) == 'red' && get.useful(cards[i]) < 5) {
                    return true;
                }
            }
            return false;
        },
        content(event) {
            'step 0';
            var target = trigger.player;
            var judge = trigger.judge(target.judging[0]);
            var attitude = get.attitude(target, player);
            target
                .choosePlayerCard('请选择代替判定的牌', 'he', 'visible', true, player)
                .set('ai', function (button) {
                    var card = button.link;
                    var judge = _status.event.judge;
                    var attitude = _status.event.attitude;
                    var result = trigger.judge(card) - judge;
                    var player = _status.event.player;
                    if (result > 0) {
                        return 20 + result;
                    }
                    if (result == 0) {
                        if (_status.currentPhase == player) {
                            return 0;
                        }
                        if (attitude >= 0) {
                            return get.color(card) == 'red' ? 7 : 0 - get.value(card);
                        } else {
                            return get.color(card) == 'black' ? 10 : 0 + get.value(card);
                        }
                    }
                    if (attitude >= 0) {
                        return get.color(card) == 'red' ? 0 : -10 + result;
                    } else {
                        return get.color(card) == 'black' ? 0 : -10 + result;
                    }
                })
                .set('filterButton', function (button) {
                    var player = _status.event.target;
                    var card = button.link;
                    var mod2 = game.checkMod(card, player, 'unchanged', 'cardEnabled2', player);
                    if (mod2 != 'unchanged') {
                        return mod2;
                    }
                    var mod = game.checkMod(card, player, 'unchanged', 'cardRespondable', player);
                    if (mod != 'unchanged') {
                        return mod;
                    }
                    return true;
                })
                .set('judge', judge)
                .set('attitude', attitude);
            'step 1';
            if (result.bool) {
                event.card = result.links[0];
                player.respond(event.card, 'highlight', 'noOrdering').nopopup = true;
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
                trigger.player.judging[0] = event.card;
                trigger.orderingCards.add(event.card);
                game.log(trigger.player, '的判定牌改为', event.card);
                game.delay(2);
            }
            if (!player.countCards('h') || player.hasSkill('zshy_huanshi_mark', null, null, false)) {
                event.finish();
            }
            'step 3';
            player.chooseCard('是否重铸任意张手牌？', '操作提示：选择要重铸的牌并点击“确定”', [1, player.countCards('h')], lib.filter.cardRecastable).set('ai', function (card) {
                var player = _status.event.player,
                    cards = ui.selected.cards;
                if (!player.hasSkill('zshy_mingzhe')) {
                    return 5 - get.value(card);
                }
                for (var i of cards) {
                    if (get.color(i, player) == 'red') {
                        return 5 - get.value(card);
                    }
                }
                return 7.5 - get.value(card);
            });
            'step 4';
            if (result.bool) {
                player.addTempSkill('zshy_huanshi_mark');
                player.recast(result.cards);
            }
        },
        ai: {
            rejudge: true,
            tag: {
                rejudge: 1,
            },
        },
        subSkill: { mark: { charlotte: true } },
    },

};
const 天柱·势冠一方 = {
    //墟黄祖
    zshy_wangong: {//挽弓
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'useCard' },
        forced: true,
        filter(event, player) {
            return get.type(event.card, null, false) == 'basic';
        },
        async content(event, trigger, player) {
            player.addMark(event.name, 1, false);
            await player.chooseDrawRecover(true);
            if (trigger.card.name == 'sha') {
                await (trigger.baseDamage += player.countMark(event.name));
            };
        },
        intro: {
            content: `下一次使用【杀】造成的伤害+#`,
        },
        mod: {
            cardUsable(card) {
                if (card.name == 'sha') {
                    return Infinity;
                }
            },
            targetInRange(card) {
                if (card.name == 'sha') {
                    return true;
                }
            },
        },
        group: ['zshy_wangong_Damage'],
        subSkill: {
            Damage: {
                trigger: {
                    source: 'damageEnd',
                },
                forced: true,
                locked: false,
                filter(event, player) {
                    return event.card && event.card.name == 'sha';
                },
                async content(event, trigger, player) {
                    player.clearMark('zshy_wangong');
                },
            },
        },
    },

    //墟沙摩柯
    zshy_jili: {//蒺藜
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: ['useCard', 'respond'],
        },
        frequent: true,
        locked: false,
        preHidden: true,
        async content(event, trigger, player) {
            let count = player.getHistory('useCard').length + player.getHistory('respond').length;
            if (count > player.maxHp) {
                count = 1;
            }
            player.chooseDrawRecover(count, true);
        },
        ai: {
            threaten: 1.8,
            effect: {
                target_use(card, player, target, current) {
                    let used = target.getHistory('useCard').length + target.getHistory('respond').length;
                    if (get.subtype(card) == 'equip1' && !get.cardtag(card, 'gifts')) {
                        if (player != target || !player.isPhaseUsing()) {
                            return;
                        }
                        let range0 = player.getAttackRange();
                        let range = 0;
                        let info = get.info(card);
                        if (info && info.distance && info.distance.attackFrom) {
                            range -= info.distance.attackFrom;
                        }
                        if (player.getEquip(1)) {
                            let num = 0;
                            let info = get.info(player.getEquip(1));
                            if (info && info.distance && info.distance.attackFrom) {
                                num -= info.distance.attackFrom;
                            }
                            range0 -= num;
                        }
                        range0 += range;
                        let delta = range0 - used;
                        if (delta < 0) {
                            return;
                        }
                        let num = player.countCards('h', function (card) {
                            return (get.cardtag(card, 'gifts') || get.subtype(card) != 'equip1') && player.getUseValue(card) > 0;
                        });
                        if (delta == 2 && num > 0) {
                            return [1, 3];
                        }
                        if (num >= delta) {
                            return 'zeroplayertarget';
                        }
                    } else if (get.tag(card, 'respondShan') > 0) {
                        if (current < 0 && used <= target.getAttackRange() - 1) {
                            if (card.name === 'sha') {
                                if (!target.mayHaveShan(player, 'use')) {
                                    return;
                                }
                            } else if (!target.mayHaveShan(player)) {
                                return 0.9;
                            }
                            return [1, (used + 1) / 2];
                        }
                    } else if (get.tag(card, 'respondSha') > 0) {
                        if (current < 0 && used <= target.getAttackRange() - 1 && target.mayHaveSha(player)) {
                            return [1, (used + 1) / 2];
                        }
                    }
                },
            },
        },
    },

    //墟诸葛诞
    zshy_gongao: {//功獒
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'dying',
        },
        forced: true,
        async content(event, trigger, player) {
            player.gainMaxHp();
            player.chooseDrawRecover(2, true);
        },
    },
    zshy_juyi: {//举义
        audio: 'ext:诸神寰宇/audio/character:2',
        derivation: ['zshy_weizhong', 'zshy_benghuai'],
        trigger: {
            player: ['damageEnd', 'phaseZhunbeiBegin'],
        },
        filter(event, player) {
            return player.maxHp > game.countPlayer();
        },
        locked: true,
        juexingji: true,
        skillAnimation: true,
        animationColor: 'thunder',
        prompt2: '摸等同体力上限数张牌，然后获得〖威重〗〖崩坏〗',
        async content(event, trigger, player) {
            player.awakenSkill(event.name);
            await player.draw(player.maxHp);
            await player.addSkills(['zshy_weizhong', 'zshy_benghuai']);
        },
    },
    zshy_weizhong: {//威重
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: ['gainMaxHpEnd', 'loseMaxHpEnd'],
        },
        forced: true,
        async content(event, trigger, player) {
            player.draw(2);
            let next = player.phaseUse();
            event.next.remove(next);
            trigger.next.push(next);
        },
    },

};
const 女史·留史巾帼 = {
    //墟关银屏
    zshy_xuehen: {//雪恨
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        usable: 1,
        filterTarget: true,
        selectTarget: [1, Infinity],
        multitarget: true,
        multiline: true,
        line: 'fire',
        async content(event, trigger, player) {
            for (const target of event.targets) {
                if (!target.isLinked()) {
                    target.link(true);
                }
            };
            event.targets[0].damage('fire', 'nocard');
        },
        ai: {
            damage: true,
            fireAttack: true,
            threaten: 1.5,
            order: 7,
            result: {
                target(player, target) {
                    var eff = get.damageEffect(target, player, target, 'fire');
                    if (target.isLinked()) {
                        return eff / 10;
                    } else {
                        return eff;
                    }
                },
            },
        },
    },
    zshy_huxiao: {//虎啸
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            source: 'damageSource',
            player: 'damageEnd',
        },
        forced: true,
        logTarget: 'player',
        async content(event, trigger, player) {
            if (!player.storage.zshy_huxiao_damage) {
                player.storage.zshy_huxiao_damage = [];
            }
            player.chooseDrawRecover(true);
            if (trigger.player.isIn() && !player.storage.zshy_huxiao_damage.includes(trigger.player)) {
                player.storage.zshy_huxiao_damage.add(trigger.player);
            }
            player.addTempSkill('zshy_huxiao_damage');
        },
        subSkill: {
            damage: {
                onremove: true,
                mark: true,
                intro: {
                    content: 'players',
                },
                mod: {
                    cardUsableTarget(card, player, target) {
                        if (player.storage.zshy_huxiao_damage && player.storage.zshy_huxiao_damage.includes(target)) {
                            return true;
                        }
                    },
                },
            },
        },
    },
    zshy_wuji: {//武继
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { source: 'damageEnd' },
        forced: true,
        usable: 1,
        skillAnimation: true,
        animationColor: 'orange',
        filter(event, player) {
            return player.getStat('damage') >= 3;
        },
        async content(event, trigger, player) {
            player.gainMaxHp();
            await player.recover();
            let card = get.cardPile('qinglong', 'field');
            if (card) {
                player.gain(card, 'gain2', 'log');
            };
        },
    },

    //墟郭槐
    zshy_zhefu: {//哲妇
        audio: 'zhefu',
        trigger: {
            player: ['useCardAfter', 'respondAfter'],
        },
        filter(event, player) {
            return game.hasPlayer(current => current != player);
        },
        async cost(event, trigger, player) {
            event.result = await player.chooseTarget(get.prompt(event.skill), '令一名其他角色弃置所有的【' + get.translation(trigger.card.name) + '】，否则受到你造成的1点伤害并令你摸一张牌。', (card, player, target) => {
                return target != player;
            }).set('ai', target => {
                const player = get.player();
                return get.damageEffect(target, player, player) / Math.sqrt(target.countCards('he'));
            }).forResult();
        },
        async content(event, trigger, player) {
            const {
                targets: [target],
            } = event;
            const { name } = trigger.card;
            const result = await target.chooseToDiscard('he', { name: name }, Infinity, true)
                .forResult();
            if (!result || (result.cards && result.cards.length < 1)) {
                await target.damage();
                await player.chooseDrawRecover(true);
            }
        },
    },
    zshy_yidu: {//遗毒
        audio: 'yidu',
        trigger: {
            player: 'useCardAfter',
        },
        filter(event, player) {
            return (
                get.tag(event.card, 'damage') > 0.5 &&
                game.countPlayer(function (target) {
                    return target.countCards('h') > 0 && target != player;
                }) > 0
            );
        },
        async cost(event, trigger, player) {
            event.result = await player
                .chooseTarget(get.prompt2(event.skill), (card, player, target) => {
                    return target.countCards('h') > 0 && target != player;
                }).set('ai', target => {
                    const player = get.player();
                    if (target.hasSkillTag('noh')) {
                        return 0;
                    }
                    return -get.attitude(player, target);
                })
                .forResult();
        },
        async content(event, trigger, player) {
            const {
                targets: [target],
            } = event;
            await player.discardPlayerCard(target, '遗毒：弃置' + get.translation(target) + '的至多两张手牌', true, 'h', [1, Math.min(2, target.countCards('h'))])
            await player.chooseDrawRecover(true);
        },
    },

    //墟张星彩
    zshy_shenxian: {//甚贤
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: ['loseAfter', 'loseAsyncAfter'],
        },
        frequent: true,
        filter(event, player) {
            if (event.type != 'discard' || event.getlx === false) return false;
            if (event.name == 'lose' && event.player == player) return false;
            var cards = event.cards.slice(0);
            var evt = event.getl(player);
            if (evt && evt.cards) cards.removeArray(evt.cards);
            for (var i = 0; i < cards.length; i++) {
                if (cards[i].original != 'j') {
                    return true;
                }
            } return false;
        },
        async content(event, trigger, player) {
            if (trigger.delay == false) await game.delay();
            await player.chooseDrawRecover(true);
        },
        ai: {
            threaten: 1.5,
        },
    },
    zshy_qiangwu: {//枪舞
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        usable: 1,
        prompt: '出牌阶段，你可进行判定并摸判定点数张牌。若如此做，直到回合结束，你使用点数不大于判定结果的【杀】基础数值+1，使用点数不小于判定结果的【杀】无法响应。',
        async content(event, trigger, player) {
            const result = await player.judge(card => {
                return 1 / get.number(card);
            }).forResult();
            if (result.bool) {
                player.storage.zshy_qiangwu = result.number;
                if (result.number > 0) player.draw(result.number);
            }
            player.addTempSkill('zshy_qiangwu_sub', { global: ['phaseAfter', 'phaseBeforeStart'] });
        },
        mod: {
            targetInRange(card, player) {
                if (get.name(card) == 'sha') return true;
            },
            cardUsable(card, player) {
                if (get.name(card) == 'sha') return Infinity;
            },
        },
        ai: {
            result: {
                player: 1,
            },
            order: 11,
        },
        subSkill: {
            sub: {
                trigger: {
                    player: 'useCard',
                },
                filter(event, player) {
                    return get.name(event.card) == 'sha' && typeof player.storage.zshy_qiangwu == 'number';
                },
                forced: true,
                popup: false,
                firstDo: true,
                onremove(player) {
                    delete player.storage.zshy_qiangwu;
                },
                content() {
                    const num = get.number(trigger.card);
                    // 等于判定点数时，两项效果都成立；保留原有 unsure 兼容行为。
                    if (num <= player.storage.zshy_qiangwu || num == 'unsure') trigger.baseDamage++;
                    if (num >= player.storage.zshy_qiangwu || num == 'unsure') trigger.directHit.addArray(game.players);
                },
            },
        },
    },

    //墟赵襄
    zshy_ZXfanghun: {//芳魂*
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AAZZzhaoxiangJMGX_shadow: 'zshy_ZXfanghun_zshy_AAZZzhaoxiangJMGX_shadow',
        },
        enable: ['chooseToUse', 'chooseToRespond'],
        hiddenCard(player, name) {
            var type = get.type2(name);
            if (type == 'basic') return player.countCards('hs', { type: 'basic' });
        },
        filter(event, player) {
            for (var i of lib.inpile) {
                var type = get.type2(i), filter = event.filterCard;
                if (type == 'basic' && filter({ name: i }, player, event) && player.countCards('hs', { type: 'basic' })) return true;
            }
            return false;
        },
        chooseButton: {
            dialog(event, player) {
                var list = [];
                for (var i of lib.inpile) {
                    var type = get.type2(i), filter = event.filterCard;
                    if (type == 'basic' && player.countCards('hs', { type: 'basic' })) {
                        if (filter({ name: i }, player, event)) list.push(['基本', '', i]);
                        if (i == 'sha') {
                            for (var j of lib.inpile_nature) {
                                if (filter({ name: i, nature: j }, player, event)) list.push(['基本', '', 'sha', j]);
                            }
                        }
                    }
                }
                return ui.create.dialog('芳魂', [list, 'vcard'], 'hidden');
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
                        if (get.type(links[0][2]) == 'basic') return get.type2(card) == 'basic';
                    },
                    check(card, player, target) {
                        return 7 - get.value(card);
                    },
                    viewAs: { name: links[0][2], nature: links[0][3] },
                    position: 'hs',
                    popname: true,
                    precontent() {
                        //player.logSkill('zshy_ZXfanghun');
                    },
                }
            },
            prompt(links, player) {
                if (get.type(links[0][2]) == 'basic') return '将一张基本牌当做' + get.translation(links[0][3] || '') + get.translation(links[0][2]) + '使用或打出';
            },
        },
        marktext: '梅影',
        intro: {
            content: '已拥有#枚「梅影」',
        },
        ai: {
            respondSha: true,
            respondShan: true,
            respondTao: true,
            respondJiu: true,
            fireAttack: true,
            skillTagFilter(player, tag) {
                if (!player.countCards('hs', { type: 'basic' })) return false;
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
        group: ['zshy_ZXfanghun_Deputy'],
        subSkill: {
            zshy_AAZZzhaoxiangJMGX_shadow: { audio: 'ext:诸神寰宇/audio/character:2' },
            Deputy: {
                trigger: {
                    player: ['useCard', 'respond'],
                },
                firstDo: true,
                direct: true,
                filter(event, player) {
                    if (get.type(event.card) != 'basic') return false;
                    return true;
                },
                async content(event, trigger, player) {
                    await player.logSkill('zshy_ZXfanghun');
                    await player.draw();
                    await player.addMark('zshy_ZXfanghun', 1);
                },
            },
        },
    },
    zshy_ZXfuhan: {//扶汉
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AAZZzhaoxiangJMGX_shadow: 'zshy_ZXfuhan_zshy_AAZZzhaoxiangJMGX_shadow',
        },
        trigger: {
            player: ['phaseBegin', 'phaseEnd'],
        },
        forced: true,
        filter(event, player, name) {
            return player.countMark('zshy_ZXfanghun') > 0;
        },
        logTarget(event, player) {
            if (event.name != 'die') return null;
            return event.player;
        },
        async content(event, trigger, player) {
            var list = [];
            for (var i in lib.character) {
                if (i.includes(player.name1) || i.includes(player.name2)) continue;
                const cinfoS = get.character(i);
                if (cinfoS.group != 'shu') continue;
                if (cinfoS[4].includes('boss')) continue;
                if (cinfoS[4].includes('minskin')) continue;
                if (cinfoS[4].includes('hiddenboss')) continue;
                if (cinfoS[4].includes('Unaffected')) continue;
                if (cinfoS[4].includes('stonehidden')) continue;
                if (player.countMark('zshy_ZXfanghun') >= player.maxHp * 4) {
                    if (lib.rank.rarity.legend.includes(i)) list.push(i);
                }
                else if (player.countMark('zshy_ZXfanghun') >= player.maxHp * 3) {
                    if (lib.rank.rarity.legend.includes(i)) list.push(i);
                    if (lib.rank.rarity.epic.includes(i)) list.push(i);
                }
                else if (player.countMark('zshy_ZXfanghun') >= player.maxHp * 2) {
                    if (lib.rank.rarity.legend.includes(i)) list.push(i);
                    if (lib.rank.rarity.epic.includes(i)) list.push(i);
                    if (lib.rank.rarity.rare.includes(i)) list.push(i);
                }
                else if (player.countMark('zshy_ZXfanghun') >= player.maxHp) {
                    if (lib.rank.rarity.legend.includes(i)) list.push(i);
                    if (lib.rank.rarity.epic.includes(i)) list.push(i);
                    if (lib.rank.rarity.rare.includes(i)) list.push(i);
                    if (lib.rank.rarity.junk.includes(i)) list.push(i);
                } else list.push(i);
            }
            list = list.randomGets(Math.min(player.maxHp * 2, player.countMark('zshy_ZXfanghun')));
            var skillMap = {};
            var skills = [];
            for (var i of list) {
                var charSkills = get.character(i)[3] || [];
                skillMap[i] = charSkills;
                for (var charSkill of charSkills) {
                    if (!skills.includes(charSkill)) skills.push(charSkill);
                }
            }
            if (!list.length || !skills.length) return;
            var num = Math.min(list.length, player.maxHp);
            const result = await player
                .chooseButton(
                    [
                        '扶汉：请选择至多' + num + '名武将，获得其所有技能（直接点确定则不获得）',
                        [
                            function (dialog) {
                                const { list, skillMap } = get.event();
                                const column = Math.min(list.length, 8);
                                if (column > 6) dialog.css({ width: '100%', left: 0 });
                                const contentx = ui.create.div('.content', dialog.content);
                                contentx.css({
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(' + column + ', 1fr)',
                                    width: 'fit-content',
                                    margin: 'auto',
                                });
                                for (const name of list) {
                                    const div = ui.create.div('.buttons', contentx);
                                    div.css({ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '4px' });
                                    const button = ui.create.button(name, 'character', div);
                                    button.style.setProperty('opacity', '1', 'important');
                                    const nameSkills = skillMap[name] || [];
                                    if (nameSkills.length) {
                                        const info = get.character(name);
                                        const skillstr = nameSkills.map(skill => `[${get.translation(skill)}]`).join('<br>');
                                        const skillnode = ui.create.caption(
                                            `<div class='text' data-nature=${get.groupnature(info[1], 'raw')}m style='font-family: ${(lib.config.name_font || 'xinwei')},xinwei'>${skillstr}</div>`,
                                            button
                                        );
                                        skillnode.style.left = '2px';
                                        skillnode.style.bottom = '2px';
                                    }
                                    dialog.buttons.push(button);
                                }
                            },
                            'handle',
                        ],
                    ],
                    [0, num],
                    true
                )
                .set('list', list.slice())
                .set('skillMap', skillMap)
                .set('ai', function (button) {
                    var value = 0.1;
                    for (var skill of skillMap[button.link] || []) {
                        var rank = get.skillRank(skill, 'inout');
                        if (typeof rank == 'number') value += rank;
                    }
                    return value;
                })
                .forResult();
            const chars = (result && result.links) || [];
            if (chars.length) {
                const link = [];
                for (var i of chars) {
                    for (var skill of (get.character(i)[3] || [])) {
                        if (!link.includes(skill)) link.push(skill);
                    }
                }
                if (link.length) {
                    player.addAdditionalSkill('zshy_ZXfuhan', link);
                    player.popup(link);
                    game.log(player, '选择了武将', '【' + get.translation(chars) + '】', '，获得其技能', '【' + get.translation(link) + '】');
                    player.checkMarks();
                    player.markSkill('zshy_ZXfuhan');
                }
            }
            player.changeSkin({ characterName: 'zshy_AAZZzhaoxiangJMGX' }, 'zshy_AAZZzhaoxiangJMGX_shadow');
        },
        intro: {
            content(storage, player) {
                return '当前技能为：' + get.translation(player.additionalSkills.zshy_ZXfuhan);
            },
        },
        subSkill: {
            zshy_AAZZzhaoxiangJMGX_shadow: { audio: 'ext:诸神寰宇/audio/character:2' },
        }
    },

};
const 少微·能人异士 = {
    //墟彭羕

    //墟司马徽
    zshy_jianjie: {//荐杰
        audio: 'ext:诸神寰宇/audio/character:2',
        group: ['zshy_jianjie_use', 'zshy_jianjie_die'],
        derivation: ['zshy_jianjie_huoji', 'zshy_jianjie_lianhuan', 'zshy_jianjie_yeyan'],
        trigger: {
            global: 'phaseBefore',
            player: 'enterGame',
        },
        forced: true,
        locked: false,
        filter(event, player) {
            return (event.name != 'phase' || game.phaseNumber == 0) && game.hasPlayer(current => current != player);
        },
        async content(event, trigger, player) {
            const result = await player.chooseTarget('荐杰：选择一名角色获得“龙印”', true)
                .set('ai', target => {
                    return get.attitude(get.player(), target);
                }).forResult();
            if (result?.targets) {
                var target = result.targets[0];
                player.line(target, 'fire');
                lib.skill.zshy_jianjie.addMark('huoji', player, target);
                event.target = target;
                game.delayx();
            }
            const result1 = await player.chooseTarget('荐杰：选择一名角色获得“凤印”', true)
                .set('ai', target => {
                    return get.attitude(get.player(), target);
                }).forResult();
            if (result1?.targets) {
                var target = result1.targets[0];
                player.line(target, 'thunder');
                lib.skill.zshy_jianjie.addMark('lianhuan', player, target);
                game.delayx();
            }
        },
        ai: {
            threaten: 3,
        },
        hasMark: (mark, player, target) => {
            if (!target) {
                return player.getStorage('zshy_jianjie_' + mark).length > 0;
            }
            return target.getStorage('zshy_jianjie_' + mark).includes(player);
        },
        addMark: (mark, player, target) => {
            mark = 'zshy_jianjie_' + mark;
            target.addAdditionalSkill(`${mark}_${player.playerid}`, mark);
            target.markAuto(mark, [player]);
            game.log(player, '令', target, '获得了', `#g“${mark == 'zshy_jianjie_huoji' ? '龙印' : '凤印'}”`);
        },
        removeMark: (mark, player, target, log) => {
            if (lib.skill.zshy_jianjie.hasMark(mark, player, target, log)) {
                mark = 'zshy_jianjie_' + mark;
                target.removeAdditionalSkill(`${mark}_${player.playerid}`);
                target.unmarkAuto(mark, [player]);
                if (log) {
                    game.log(target, '移去了', player, '给予的', `#g“${mark == 'zshy_jianjie_huoji' ? '龙印' : '凤印'}”`);
                } else {
                    game.log(player, '移去了', target, '的', `#g“${mark == 'zshy_jianjie_huoji' ? '龙印' : '凤印'}”`);
                }
            }
        },
        subSkill: {
            use: {
                audio: 'zshy_jianjie',
                enable: 'phaseUse',
                usable: 1,
                filter(event, player) {
                    if (player.phaseNumber <= 1) {
                        return false;
                    }
                    const skill = lib.skill.zshy_jianjie;
                    return game.hasPlayer(function (current) {
                        return skill.hasMark('huoji', player, current) || skill.hasMark('lianhuan', player, current);
                    });
                },
                filterTarget(card, player, target) {
                    if (ui.selected.targets.length == 0) {
                        const skill = lib.skill.zshy_jianjie;
                        return skill.hasMark('huoji', player, target) || skill.hasMark('lianhuan', player, target);
                    }
                    return true;
                },
                selectTarget: 2,
                complexSelect: true,
                complexTarget: true,
                multitarget: true,
                prompt: '移动场上的“龙印”或“凤印”',
                targetprompt: ['失去印', '获得印'],
                async content(event, trigger, player) {
                    const skill = lib.skill.zshy_jianjie;
                    var bool1 = skill.hasMark('huoji', player, event.targets[0]),
                        bool2 = skill.hasMark('lianhuan', player, event.targets[0]);
                    if (bool1 && bool2) {
                        const result = await player.chooseControl('龙印', '凤印').set('prompt', '选择要移动的“印”').forResult();
                        let mark = result.control == '龙印' ? 'huoji' : 'lianhuan';
                        skill.removeMark(mark, player, event.targets[0]);
                        skill.addMark(mark, player, event.targets[1]);
                        game.delayx();
                    } else {
                        let mark = bool1 ? 'huoji' : 'lianhuan';
                        skill.removeMark(mark, player, event.targets[0]);
                        skill.addMark(mark, player, event.targets[1]);
                        game.delayx();
                    }
                },
                ai: {
                    order: 8,
                    result: {
                        target(player, target) {
                            if (ui.selected.targets.length == 0) {
                                return get.attitude(player, target) < 0 ? -999 : -3;
                            } else {
                                return target.countCards('h') + 1;
                            }
                        },
                    },
                    expose: 0.4,
                },
            },
            die: {
                audio: 'zshy_jianjie',
                trigger: { global: 'die' },
                filter(event, player) {
                    const skill = lib.skill.zshy_jianjie;
                    return skill.hasMark('huoji', player, event.player) || skill.hasMark('lianhuan', player, event.player);
                },
                forced: true,
                logTarget: 'player',
                async content(event, trigger, player) {
                    if (lib.skill.zshy_jianjie.hasMark('huoji', player, trigger.player)) {
                        const result = await player.chooseTarget('荐杰：选择一名角色获得“龙印”', true)
                            .set('ai', target => {
                                return get.attitude(get.player(), target);
                            }).forResult();
                        if (result?.targets) {
                            const target = result.targets[0];
                            player.line(target, 'fire');
                            lib.skill.zshy_jianjie.addMark('huoji', player, target);
                            game.delayx();
                        }
                    }
                    if (lib.skill.zshy_jianjie.hasMark('lianhuan', player, trigger.player)) {
                        const result1 = await player.chooseTarget('荐杰：选择一名角色获得“凤印”', true)
                            .set('ai', target => {
                                return get.attitude(get.player(), target);
                            }).forResult();
                        if (result1?.targets) {
                            const target = result1.targets[0];
                            player.line(target, 'thunder');
                            lib.skill.zshy_jianjie.addMark('lianhuan', player, target);
                            game.delayx();
                        }
                    }
                },
            },
            huoji: {
                audio: 'zshy_huoji',
                marktext: '龙',
                intro: {
                    name: '龙印',
                    content: `卧龙之印。`,
                },
                charlotte: true,
                inherit: 'zshy_huoji',
                group: ['zshy_jianjie_yeyan'],
            },
            lianhuan: {
                audio: 'zshy_lianhuan',
                marktext: '凤',
                intro: {
                    name: '凤印',
                    content: `凤雏之印。`,
                },
                charlotte: true,
                inherit: 'zshy_lianhuan',
                group: ['zshy_jianjie_yeyan', 'zshy_lianhuan_Link'],
            },
            yeyan: {
                audio: 'zshy_yeyan',
                inherit: 'zshy_yeyan',
                filter(event, player) {
                    const huoji = player.getStorage('zshy_jianjie_huoji'),
                        lianhuan = player.getStorage('zshy_jianjie_lianhuan');
                    return (
                        huoji.length > 0 &&
                        lianhuan.some(source => {
                            return huoji.includes(source) && source.isIn() && source.hasSkill('zshy_jianjie');
                        })
                    );
                },
            },
        },
    },
    zshy_chenghao: {//称好
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'damageEnd',
        },
        filter(event, player) {
            return event.lianhuanable == true && event.player.isIn();
        },
        frequent: true,
        content() {
            'step 0';
            event.cards = game.cardsGotoOrdering(
                get.cards(
                    game.countPlayer(function (current) {
                        return current.isLinked();
                    }) + 1
                )
            ).cards;
            if (_status.connectMode) {
                game.broadcastAll(function () {
                    _status.noclearcountdown = true;
                });
            }
            event.given_map = {};
            'step 1';
            if (event.cards.length > 1) {
                player.chooseCardButton('称好：请选择要分配的牌', true, event.cards, [1, event.cards.length]).set('ai', function (button) {
                    if (ui.selected.buttons.length == 0) {
                        return 1;
                    }
                    return 0;
                });
            } else if (event.cards.length == 1) {
                event._result = { links: event.cards.slice(0), bool: true };
            } else {
                event.finish();
            }
            'step 2';
            if (result.bool) {
                event.cards.removeArray(result.links);
                event.togive = result.links.slice(0);
                player
                    .chooseTarget('选择一名角色获得' + get.translation(result.links), true)
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
            }
            'step 3';
            if (result.targets.length) {
                var id = result.targets[0].playerid,
                    map = event.given_map;
                if (!map[id]) {
                    map[id] = [];
                }
                map[id].addArray(event.togive);
            }
            if (cards.length > 0) {
                event.goto(1);
            }
            'step 4';
            if (_status.connectMode) {
                game.broadcastAll(function () {
                    delete _status.noclearcountdown;
                    game.stopCountChoose();
                });
            }
            var list = [];
            for (var i in event.given_map) {
                var source = (_status.connectMode ? lib.playerOL : game.playerMap)[i];
                player.line(source, 'green');
                list.push([source, event.given_map[i]]);
            }
            game.loseAsync({
                gain_list: list,
                giver: player,
                animate: 'draw',
            }).setContent('gaincardMultiple');
        },
    },
    zshy_yinshi: {//隐士
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'damageBegin4' },
        forced: true,
        filter(event, player) {
            if (event.hasNature()) {
                return true;
            }
            return get.type(event.card, 'trick') == 'trick';
        },
        async content(event, trigger, player) {
            trigger.cancel();
        },
        ai: {
            notrick: true,
            nofire: true,
            nothunder: true,
            effect: {
                target(card, player, target, current) {
                    if (get.tag(card, 'natureDamage')) {
                        return 'zeroplayertarget';
                    }
                    if (get.type(card) == 'trick' && get.tag(card, 'damage')) {
                        return 'zeroplayertarget';
                    }
                },
            },
        },
    },

    //墟张陵
    zshy_huji: {//虎骑
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'damageEnd' },
        forced: true,
        filter(event, player) {
            return event.source && event.source != player;
        },
        async content(event, trigger, player) {
            const result = await player
                .judge(function (result) {
                    if (get.color(result == 'red') || get.color(result == 'black')) {
                        return 1;
                    };
                    return 0;
                })
                .set('judge2', function (result) {
                    return result.color == 'red' || result.color == 'black';
                })
                .forResult();
            if (result?.color) {
                if (result.color == 'red') {
                    trigger.source.damage(trigger.num);
                }
                if (result.color == 'black') {
                    player.recover(trigger.num);
                }
            }
        },
        mod: {
            globalFrom(player, target, distance) {
                return distance - 1;
            },
        },
        ai: {
            result: {
                target: -1,
            },
        },
    },
    zshy_shoufu: {//授符
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        filterTarget(event, player, target) {
            return target != player && !target.hasSkill('zshy_shoufu2');
        },
        selectTarget: [1, Infinity],
        filter(event, player) {
            return game.countPlayer(function (target) {
                return target != player && !target.hasSkill('zshy_shoufu2');
            }) > 0;
        },
        prompt: `出牌阶段，你可选择任意名没有「箓」的角色，然后依次为其从基础、锦囊或装备类别中选择一项，最后你从牌堆或弃牌堆中获得一张同类别的牌，复制之并将原牌置于其武将牌上，称为「箓」；其不能使用和打出与「箓」同类型的牌直到有${get.poptip(`zshy_shoufu`)}的角色出牌阶段开始。`,
        async content(event, trigger, player) {
            let list = ['basic', 'trick', 'equip'];
            const result = await player.chooseControl(list)
                .set('prompt', `授符`)
                .set('prompt2', `选择一个类别，令${get.translation(event.target)}不能使用和打出此类别的牌直到你的出牌阶段开始`)
                .forResult();
            if (result?.control) {
                let cards = get.cardPile(function (i) {
                    return get.type(i) == result.control;
                });
                let cardx = game.createCard2(cards.name, cards.suit, cards.number, cards.nature);
                player.gain(cardx).gaintag.add('zshy_shoufu');
                event.target.addToExpansion(cards, player, 'give').gaintag.add('zshy_shoufu2');
                player.line(event.target, 'green');
                event.target.addSkill('zshy_shoufu2');
            };
            if (get.mode() !== 'identity' || player.identity !== 'nei') {
                player.addExpose(0.12);
            };
        },
        mod: {
            ignoredHandcard(card, player) {
                if (card.hasGaintag('zshy_shoufu')) return true;
            },
            cardDiscardable(card, player, name) {
                if (name == 'phaseDiscard' && card.hasGaintag('zshy_shoufu')) return false;
            },
            targetInRange(card, player, target) {
                if (target.hasSkill('zshy_shoufu2')) {
                    return true;
                }
            },
            cardUsableTarget(card, player, target) {
                if (target.hasSkill('zshy_shoufu2')) {
                    return true;
                }
            },
        },
        ai: {
            order: 9,
            result: {
                player(player) {
                    if (
                        game.hasPlayer(function (target) {
                            return target != player && !target.hasSkill('zshy_shoufu2') && get.attitude(player, target) < 0;
                        }) ||
                        !game.hasPlayer(function (target) {
                            return target != player && !target.hasSkill('zshy_shoufu2') && get.attitude(player, target) > 0;
                        })
                    ) {
                        return 1;
                    }
                    return 0;
                },
            },
        },
    },
    zshy_shoufu2: {
        marktext: '箓',
        intro: {
            content: 'expansion',
            markcount: 'expansion',
        },
        charlotte: true,
        onremove(player, skill) {
            var cards = player.getExpansions(skill);
            if (cards.length) {
                player.loseToDiscardpile(cards);
            }
        },
        mod: {
            cardEnabled(card, player) {
                if (
                    player.getExpansions('zshy_shoufu2').filter(function (magic) {
                        return get.type2(magic) == get.type2(card);
                    }).length
                ) {
                    return false;
                }
            },
            cardRespondable(card, player) {
                if (
                    player.getExpansions('zshy_shoufu2').filter(function (magic) {
                        return get.type2(magic) == get.type2(card);
                    }).length
                ) {
                    return false;
                }
            },
            cardSavable(card, player) {
                if (
                    player.getExpansions('zshy_shoufu2').filter(function (magic) {
                        return get.type2(magic) == get.type2(card);
                    }).length
                ) {
                    return false;
                }
            },
        },
        trigger: {
            global: ['phaseUseBegin'],
        },
        forced: true,
        sourceSkill: 'zshy_shoufu',
        filter(event, player) {
            return event.player.hasSkill('zshy_shoufu');
        },
        content() {
            player.removeSkill('zshy_shoufu2');
        },
    },

    //墟诸葛果
    zshy_qirang: {//祈禳
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: ['equipEnd', 'phaseJieshuBegin'] },
        frequent: true,
        async content(event, trigger, player) {
            player.recover();
            var card = get.cardPile(function (card) {
                return get.type(card, 'trick') == 'trick';
            });
            if (card) {
                var next = player.gain(card, 'gain2');
                if (get.type(card) == 'trick') {
                    next.gaintag.add('zshy_qirang');
                } else {
                    player.addMark('zshy_qirang_mark', 1, false);
                    player.addSkill('zshy_qirang_mark');
                }
            }
        },
        ai: {
            effect: {
                target(card, player, target, current) {
                    if (get.type(card) == 'equip' && !get.cardtag(card, 'gifts')) {
                        return [1, 3];
                    }
                },
            },
            threaten: 1.3,
        },
        group: 'zshy_qirang_use',
        subSkill: {
            mark: {
                charlotte: true,
                intro: {
                    content: '发动〖羽化〗时卜算量+#',
                },
            },
            use: {
                audio: 'zshy_qirang',
                trigger: { player: 'useCard2' },
                direct: true,
                filter(event, player) {
                    if (get.type(event.card) != 'trick') {
                        return false;
                    }
                    if (!event.targets || event.targets.length != 1) {
                        return false;
                    }
                    var info = get.info(event.card);
                    if (info.allowMultiple == false) {
                        return false;
                    }
                    if (
                        !player.hasHistory('lose', function (evt) {
                            if ((evt.relatedEvent || evt.getParent()) != event) {
                                return false;
                            }
                            for (var i in evt.gaintag_map) {
                                if (evt.gaintag_map[i].includes('zshy_qirang')) {
                                    return true;
                                }
                            }
                            return false;
                        })
                    ) {
                        return false;
                    }
                    if (!info.multitarget) {
                        if (
                            game.hasPlayer(function (current) {
                                return !event.targets.includes(current) && lib.filter.targetEnabled2(event.card, player, current) && lib.filter.targetInRange(event.card, player, current);
                            })
                        ) {
                            return true;
                        }
                    }
                    return false;
                },
                content() {
                    'step 0';
                    var prompt2 = '为' + get.translation(trigger.card) + '增加一个目标';
                    player.chooseTarget(get.prompt('zshy_qirang'), function (card, player, target) {
                        var player = _status.event.player;
                        if (_status.event.targets.includes(target)) {
                            return false;
                        }
                        return lib.filter.targetEnabled2(_status.event.card, player, target) && lib.filter.targetInRange(_status.event.card, player, target);
                    }).set('prompt2', prompt2).set('ai', function (target) {
                        var trigger = _status.event.getTrigger();
                        var player = _status.event.player;
                        return get.effect(target, trigger.card, player, player) * (_status.event.targets.includes(target) ? -1 : 1);
                    }).set('targets', trigger.targets).set('card', trigger.card);
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
                        player.logSkill('zshy_qirang_use', event.targets);
                        trigger.targets.addArray(event.targets);
                    }
                },
            },
        },
    },
    zshy_yuhua: {//羽化
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: ['phaseZhunbeiBegin'] },
        forced: true,
        async content(event, trigger, player) {
            let num = 1;
            if (player.hasMark('zshy_qirang_mark')) {
                num += player.countMark('zshy_qirang_mark');
            }
            const result = await player.chooseToGuanxing(Math.min(5, num)).set('prompt', '观星：点击或拖动将牌移动到牌堆顶或牌堆底').forResult();
            if ((!result.bool || !result.moved[0].length) && event.triggername == 'phaseZhunbeiBegin') {
                player.addTempSkill('guanxing_fail');
            }
        },
        mod: {
            ignoredHandcard(card, player) {
                if (get.type(card) != 'basic') {
                    return true;
                }
            },
            cardDiscardable(card, player, name) {
                if (name == 'phaseDiscard' && get.type(card) != 'basic') {
                    return false;
                }
            },
        },
        ai: {
            guanxing: true,
        },
    },

};
const 虎贲·勇冠三军 = {
    //墟鲁芝
    zshy_qingzhong: {//清忠
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: 'phaseUseBegin' },
        check(event, player) {
            if (game.hasPlayer(function (current) {
                return current != player && get.attitude(player, current) > 0;
            })) {
                return true;
            }
            if (player.countCards('h') <= 2 || player.hp <= 2) {
                return true;
            }
            return false;
        },
        async content(event, trigger, player) {
            player.chooseDrawRecover(2, true);
            player.addTempSkill('zshy_qingzhong_give');
        },
        subSkill: {
            give: {
                audio: 'zshy_qingzhong',
                trigger: { global: 'phaseUseEnd' },
                filter(event, player) {
                    return !player.isMinHandcard();
                },
                async cost(event, trigger, player) {
                    event.result = await player.chooseTarget('清忠：选择一名其他角色与其交换手牌', true, function (card, player, target) {
                        return target != player;
                    }).set('ai', function (target) {
                        return get.attitude(get.event().player, target);
                    }).forResult();
                },
                async content(event, trigger, player) {
                    player.line(event.targets[0], 'green');
                    player.swapHandcards(event.targets[0]);
                },
            },
        },
    },
    zshy_weijing: {//卫境
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: ['chooseToUse', 'chooseToRespond'],
        filter(event, player) {
            if (event.type == 'wuxie') {
                return false;
            }
            for (var name of ['sha', 'shan']) {
                if (event.filterCard({ name: name, isCard: true }, player, event)) {
                    return true;
                }
            }
            return false;
        },
        chooseButton: {
            dialog(event, player) {
                var vcards = [];
                for (var name of ['sha', 'shan']) {
                    var card = { name: name, isCard: true };
                    if (event.filterCard(card, player, event)) {
                        vcards.push(['基本', '', name]);
                    }
                }
                var dialog = ui.create.dialog('卫境', [vcards, 'vcard'], 'hidden');
                dialog.direct = true;
                return dialog;
            },
            backup(links, player) {
                return {
                    filterCard: () => false,
                    selectCard: -1,
                    viewAs: {
                        name: links[0][2],
                        isCard: true,
                    },
                    popname: true,
                    precontent() {
                        player.logSkill('zshy_weijing');
                    },
                };
            },
            prompt(links, player) {
                return '卫境：视为使用或打出一张【' + get.translation(links[0][2]) + '】';
            },
        },
        ai: {
            order(item, player) {
                var player = _status.event.player;
                var event = _status.event;
                if (event.filterCard({ name: 'sha' }, player, event)) {
                    if (!player.hasShan() && !game.hasPlayer(function (current) {
                        return player.canUse('sha', current) && current.hp == 1 && get.effect(current, { name: 'sha' }, player, player) > 0;
                    })) {
                        return 0;
                    }
                    return 2.95;
                } else {
                    var player = _status.event.player;
                    if (player.hasSkill('zshy_qingzhong_give')) {
                        return 2.95;
                    }
                    return 3.15;
                }
            },
            respondSha: true,
            respondShan: true,
            result: {
                player: 1,
            },
        },
    },

    //墟鞠义
    zshy_fuji: {//伏骑
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'useCard',
        },
        forced: true,
        async content(event, trigger, player) {
            trigger.directHit.addArray(game.filterPlayer(function (current) {
                return current != player;
            }));
        },
        ai: {
            directHit_ai:  true,
        },
        group: ['zshy_fuji_bancard'],
        subSkill: {
            bancard: {
                trigger: {
                    player: ['useCard', 'respond'],
                },
                forced: true,
                popup: false,
                priority: 1,
                content() {
                    var targets = game.filterPlayer(current => current != player);
                    var suit = get.suit(trigger.card);
                    for (var target of targets) {
                        target.addTempSkill('zshy_fuji_ban');
                        target.markAuto('zshy_fuji_ban', [suit]);
                    }
                },
            },
            ban: {
                onremove: true,
                charlotte: true,
                mod: {
                    cardEnabled(card, player) {
                        if (player.getStorage('zshy_fuji_ban').includes(get.suit(card))) return false;
                    },
                    cardRespondable(card, player) {
                        if (player.getStorage('zshy_fuji_ban').includes(get.suit(card))) return false;
                    },
                    cardSavable(card, player) {
                        if (player.getStorage('zshy_fuji_ban').includes(get.suit(card))) return false;
                    },
                },
                mark: true,
                marktext: '伏',
                intro: {
                    content: '本回合内不能使用或打出$的牌',
                },
            },
        },
    },
    zshy_jiaozi: {//骄姿
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'damageBegin3',
            source: 'damageBegin1',
        },
        forced: true,
        filter(event, player) {
            if ((event.source == player && event.player == undefined) || (event.player == player && event.source == undefined)
            ) {
                return false;
            }
            const pcard = player.countCards('h');
            const ccard = event.source.countCards('h');
            const dcard = event.player.countCards('h');
            if ((event.source == player && pcard != dcard) || (event.player == player && ccard != pcard)
            ) {
                return true;
            }
            return false;
        },
        async content(event, trigger, player) {
            const pcard = player.countCards('h');
            const ccard = trigger.source.countCards('h');
            const dcard = trigger.player.countCards('h');
            if (trigger.source == player && pcard != dcard) trigger.num += Math.max(pcard - dcard, dcard - pcard);
            if (trigger.player == player && ccard != pcard) trigger.num -= Math.max(pcard - ccard, ccard - pcard);
        },
        ai: {
            presha: true,
            effect: {
                target(card, player, target) {
                    if (player.countCards('h') + 1 == target.countCards('h') || player.hasSkillTag('jueqing', false, target)) return;
                    if (_status.event.getParent('useCard', true) || _status.event.getParent('_wuxie', true)) return;
                    if (get.tag(card, 'damage')) {
                        if (get.attitude(player, target) > 0 && player.countCards('h') + 1 != target.countCards('h')) {
                            return 'zeroplayertarget';
                        }
                        if (get.attitude(player, target) < 0 && player.countCards('h') + 1 != target.countCards('h')) {
                            return 'zeroplayertarget';
                        }
                    }
                },
            },
        },
    },

    //墟夏侯霸
    zshy_baobian: {//豹变
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: ['phaseBegin', 'damageAfter'],
        },
        charlotte: true,
        forced: true,
        derivation: ['zshy_tiaoxin', 'zshy_paoxiao', 'zshy_shensu'],
        async content(event, trigger, player) {
            var list = [];
            for (var i of lib.skill.zshy_baobian.derivation) {
                if (!player.hasSkill(i)) list.push(i);
            }
            if (!list.length) {
                player.chooseDrawRecover(true);
                return;
            }
            else if (list.length > 1) {
                const result = await player.chooseControl(list, true).set('ai', function () {
                    return list.randomGet();
                }).set('prompt', '【豹变】<br>请选择要获得的1个技能').forResult();
                if (result?.control) {
                    player.addSkill(result.control);
                }
            }
            else {
                player.addSkill(list[0]);
            }
        },
        ai: {
            target(card, player, target) {
                if (get.tag(card, 'damage') && (!player.hasSkill('zshy_tiaoxin') || !player.hasSkill('zshy_tiaoxin') || !player.hasSkill('zshy_shensu'))) return 0.1;
            }
        },
    },

};
const 灯愿·祈福武将 = {
    //墟鲍三娘
    zshy_wuniang: {//武娘
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AAZZbaosanniangJMGX_shadow: 'zshy_wuniang_zshy_AAZZbaosanniangJMGX_shadow',
        },
        trigger: {
            player: ['useCard', 'respond'],
        },
        filter(event, player) {
            return get.type(event.card) == 'basic';
        },
        async cost(event, trigger, player) {
            event.result = await player.chooseTarget(get.prompt2('zshy_wuniang'), function (card, player, target) {
                if (player == target) {
                    return false;
                }
                return target.countGainableCards(player, 'he') > 0;
            }).set('ai', function (target) {
                return 10 - get.attitude(_status.event.player, target);
            }).forResult();
        },
        async content(event, trigger, player) {
            let target = event.targets[0];
            player.line(target, 'fire');
            player.gainPlayerCard(target, 'he', true);
            await target.draw();
            await player.recover();
            if (player.storage.zshy_xushen) {
                var list = game.filterPlayer(function (current) {
                    return current.name == 'zshy_AAZZguansuoJMGX' || current.name2 == 'zshy_AAZZguansuoJMGX';
                });
                if (list.length) {
                    game.asyncDraw(list);
                }
            }
            await game.delayx();
        },
    },
    zshy_xushen: {//许身
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AAZZbaosanniangJMGX_shadow: 'zshy_xushen_zshy_AAZZbaosanniangJMGX_shadow',
        },
        trigger: { player: ['dying'] },
        limited: true,
        derivation: 'zshy_zhennan',
        skillAnimation: true,
        animationColor: 'orange',
        filter(event, player) {
            return player.hp < 1;
        },
        async content(event, trigger, player) {
            player.awakenSkill(event.name);
            player.addSkills('zshy_zhennan');
            player.addTempSkill('zshy_xushen_reinit');
            trigger.zshy_xushen = true;
            player.recoverTo(player.maxHp);
        },
        subSkill: {
            reinit: {
                trigger: { player: 'dyingAfter' },
                forced: true,
                popup: false,
                charlotte: true,
                sourceSkill: 'zshy_xushen',
                filter(event, player) {
                    return (event.zshy_xushen == true &&
                        !game.hasPlayer(function (current) {
                            return current.name == 'zshy_AAZZguansuoJMGX' || current.name2 == 'zshy_AAZZguansuoJMGX';
                        })
                    );
                },
                async content(event, trigger, player) {
                    const result = await player.chooseTarget(lib.filter.notMe, '许身：是否令一名其他角色选择是否将其武将牌替换为“关索”并令其摸三张牌？')
                        .set('ai', function (target) {
                            return get.attitude(_status.event.player, target);
                        }).forResult();
                    if (result?.targets) {
                        const target = result.targets[0];
                        player.line(target, 'fire');
                        const result1 = await target.chooseBool('许身：是否将自己的一张武将牌替换为“关索”并令' + get.translation(player) + '摸三张牌？').forResult();
                        if (result1?.bool) {
                            if (target.name2 != undefined) {
                                const result2 = await target.chooseControl(target.name1, target.name2).set('prompt', '请选择要更换的武将牌').forResult();
                                if (result2?.control) {
                                    target.reinitCharacter(result2.control, 'zshy_AAZZguansuoJMGX');
                                }
                            } else {
                                target.reinitCharacter(target.name1, 'zshy_AAZZguansuoJMGX');
                            }
                        }
                        await target.draw(3);
                    };
                },
            },
        },
    },
    zshy_zhennan: {//镇南
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AAZZbaosanniangJMGX_shadow: 'zshy_zhennan_zshy_AAZZbaosanniangJMGX_shadow',
        },
        trigger: {
            global: 'useCardToPlayered',
        },
        filter(event, player) {
            return event.isFirstTarget && event.targets && get.type2(event.card) == 'trick';
        },
        async cost(event, trigger, player) {
            event.result = await player.chooseTarget(get.prompt('zshy_zhennan'), `对至多${trigger.targets.length}名其他角色造成1点伤害`, [1, trigger.targets.length], function (card, player, target) {
                return target != player;
            }).set('ai', function (target) {
                var player = _status.event.player;
                return get.damageEffect(target, player, player);
            }).forResult();
        },
        async content(event, trigger, player) {
            for (const i of event.targets) {
                i.damage();
            }
        },
        ai: {
            expose: 0.25,
        },
    },
    zshy_AAZZbaosanniangJMGXchangeSkin: {
        trigger: {
            player: 'changeHpAfter',
        },
        popup: false,
        silent: true,
        charlotte: true,
        NihilismSkill: true,
        superCharlotte: true,
        async content(event, trigger, player) {
            const playername = `zshy_AAZZbaosanniangJMGX`;
            if (player.hp > 2) {
                player.changeSkin({ characterName: playername }, playername);
            } else {
                player.changeSkin({ characterName: playername }, playername + '_shadow');
            };
        },
    },
    zshy_wuniang_zshy_AAZZbaosanniangJMGX_shadow: {
        audio: 'ext:诸神寰宇/audio/character:2',
    },
    zshy_xushen_zshy_AAZZbaosanniangJMGX_shadow: {
        audio: 'ext:诸神寰宇/audio/character:2',
    },
    zshy_zhennan_zshy_AAZZbaosanniangJMGX_shadow: {
        audio: 'ext:诸神寰宇/audio/character:2',
    },

    //墟曹纯
    zshy_shanjia: {//缮甲
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'phaseZhunbeiBegin',
            player: 'damageEnd',
        },
        forced: true,
        async content(event, trigger, player) {
            event.num = Math.floor(Math.random() * 5) + 1;
            var card = get.cardPile(function (card) {
                return get.subtype(card) == 'equip' + event.num && player.canUse(card, player);
            });
            if (card) {
                await player.chooseUseTarget(card, true, 'nopopup');
            }
            await player.changeHujia();
            await player.chooseUseTarget({ name: 'sha' }, false, '是否视为使用一张无视距离且不限次数的【杀】？', 'nodistance');
        },
    },

    //墟曹爽
    zshy_tuogu: {//托孤
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: ['roundStart', 'dieAfter'],
        },
        forced: true,
        filter(event, player, name) {
            if (name != 'dieAfter') {
                return true;
            }
            return event.player.getOriginalSkills().length;
        },
        logTarget(event, player) {
            if (event.name != 'die') return null;
            return event.player;
        },
        async content(event, trigger, player) {
            player.chooseDrawRecover(true);
            let list = [], list1 = [];
            if (event.triggername == 'dieAfter') {
                list = trigger.player.getOriginalSkills();
            }
            else {
                let list2 = [];
                let list3 = [];
                let players = game.players.concat(game.dead);
                for (let i = 0; i < players.length; i++) {
                    list2.add(players[i].name);
                    list2.add(players[i].name1);
                    list2.add(players[i].name2);
                }
                if (!_status.characterskill) {
                    _status.characterskill = [];
                    for (var i in lib.character) {
                        if (list2.includes(i)) continue;
                        const cinfoL = get.character(i);
                        if (cinfoL[4].includes('boss')) continue;
                        if (cinfoL[4].includes('minskin')) continue;
                        if (cinfoL[4].includes('hiddenboss')) continue;
                        if (cinfoL[4].includes('Unaffected')) continue;
                        if (cinfoL[4].includes('stonehidden')) continue;
                        if (Array.isArray(cinfoL[3])) _status.characterskill.addArray(cinfoL[3]);
                    }
                }
                for (var i in lib.skill) {
                    if (!get.translation(i, 'info') || get.translation(i + '_info').length === 0) continue;
                    if (_status.characterskill.includes(i)) list3.add(i);
                }
                list3.remove(player.getSkills());
                list = list3.randomGets(4);
            };
            if (!list.length) {
                return;
            };
            for (var skill of list) {
                list1.push([
                    skill,
                    '<div class="popup text" style="width:calc(100%-10px);display:inline-block"><div class="skill">【' +
                    get.translation(skill) + '】</div><div>' + lib.translate[skill + '_info'] + '</div></div>',
                ])
            }
            const result = await player.chooseButton([
                `托孤：选择${event.triggername == 'dieAfter' ? '获得' + get.translation(trigger.player) + '的1个技能' : (player.additionalSkills.zshy_tuogu ? '将' + get.translation(player.additionalSkills.zshy_tuogu) + '替换为以下的1个技能' : '获得1个技能')}`,
                [list1, 'textbutton']])
                .set('selectButton', [1, 1])
                .set('ai', function (button) {
                    return Math.random();
                })
                .set('skills', list1)
                .forResult();
            if (result?.bool && result?.links) {
                let link = result.links;
                if (event.triggername == 'dieAfter') {
                    player.addSkills(link);
                } else {
                    player.addAdditionalSkill(event.name, link);
                    player.popup(link);
                    game.log(player, '获得了技能', '【' + get.translation(link) + '】');
                    player.checkMarks();
                    player.markSkill(event.name);
                }
            }
        },
        intro: {
            content(storage, player) {
                return '当前技能为：' + get.translation(player.additionalSkills.zshy_tuogu);
            },
        },
    },
    zshy_shanzhuan: {//擅专
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'damageEnd',
        },
        filter(event, player) {
            return player != event.player && !event.player.isDisabledJudge() && event.player.countCards('he');
        },
        async cost(event, trigger, player) {
            event.result = await player.choosePlayerCard(get.prompt(event.skill, trigger.player), trigger.player, 'he').set('ai', function (card) {
                if (get.attitude(_status.event.player, _status.event.target) >= 0) return 0;
                return get.buttonValue(card);
            }).forResult();
        },
        async content(event, trigger, player) {
            let card = event.cards[0];
            trigger.player.$throw(card);
            game.delayx();
            if (get.color(card) == 'red') {
                trigger.player.addJudge({ name: 'lebu' }, card);
            }
            else if (get.color(card) == 'black') {
                trigger.player.addJudge({ name: 'bingliang' }, card);
            }
            else {
                trigger.player.addJudge({ name: 'shandian' }, card);
            };
            player.chooseDrawRecover(true);
        },
    },

    //墟曹婴
    zshy_lingren: {//凌人
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AAZZcaoyingJMGX_shadow: 'zshy_lingren_zshy_AAZZcaoyingJMGX_shadow',
        },
        trigger: { player: 'useCardToPlayered' },
        filter(event, player) {
            if (event.getParent().triggeredTargets3.length > 1) {
                return false;
            }
            return get.tag(event.card, 'damage') && event.cards.filterInD().length;
        },
        derivation: ['zshy_jianxiong', 'zshy_xingshang'],
        async cost(event, trigger, player) {
            event.result = await player
                .chooseTarget(get.prompt(event.name.slice(0, -5)), '选择一名目标角色并猜测其手牌构成', (card, player, target) => {
                    return _status.event.targets.includes(target);
                })
                .set('ai', target => {
                    return 2 - get.attitude(get.player(), target);
                })
                .set('targets', trigger.targets)
                .forResult();
        },
        async content(event, trigger, player) {
            const {
                targets: [target],
            } = event;
            const list = ['basic', 'trick', 'equip'].map(type => ['', '', 'caoying_' + type]);
            const result = await player
                .chooseButton(['凌人：猜测其有哪些类别的手牌', [list, 'vcard']], [0, 3], true)
                .set('ai', button => {
                    return get.event().choice.includes(button.link[2].slice(8));
                })
                .set(
                    'choice',
                    (() => {
                        if (!target.countCards('h')) {
                            return [];
                        }
                        let choice = [],
                            known = target.getKnownCards(player),
                            unknown = target.getCards('h', i => !known.includes(i));
                        for (let i of known) {
                            choice.add(get.type2(i, target));
                        }
                        if (!unknown.length || choice.length > 2) {
                            return choice;
                        }
                        let rand = 0.05;
                        if (!choice.includes('basic')) {
                            if (unknown.some(i => get.type(i, null, target) === 'basic')) {
                                rand = 0.95;
                            }
                            if (Math.random() < rand) {
                                choice.push('basic');
                            }
                        }
                        if (!choice.includes('trick')) {
                            if (unknown.some(i => get.type(i, 'trick', target) === 'trick')) {
                                rand = 0.9;
                            } else {
                                rand = 0.1;
                            }
                            if (Math.random() < rand) {
                                choice.push('trick');
                            }
                        }
                        if (!choice.includes('equip')) {
                            if (unknown.some(i => get.type(i, null, target) === 'equip')) {
                                rand = 0.75;
                            } else {
                                rand = 0.25;
                            }
                            if (Math.random() < rand) {
                                choice.push('equip');
                            }
                        }
                        return choice;
                    })()
                )
                .forResult();
            if (!result?.bool) {
                return;
            }
            const choices = result.links.map(i => i[2].slice(8));
            if (!event.isMine() && !event.isOnline()) {
                await game.delayx();
            }
            let num = 0;
            ['basic', 'trick', 'equip'].forEach(type => {
                if (choices.includes(type) == target.hasCard(card => get.type2(card, target) === type, 'h')) {
                    num++;
                }
            });
            player.popup('猜对' + get.cnNumber(num) + '项');
            game.log(player, '猜对了' + get.cnNumber(num) + '项');
            if (num > 0) {
                const map = trigger.customArgs;
                const id = target.playerid;
                map[id] ??= {};
                if (typeof map[id].extraDamage != 'number') {
                    map[id].extraDamage = 0;
                }
                map[id].extraDamage++;
            }
            if (num > 1) {
                await player.chooseDrawRecover(2, true);
            }
            if (num > 2) {
                await player.addTempSkills(get.info(event.name).derivation, { player: 'phaseUseBegin' });
            };
        },
        ai: { threaten: 2.4 },
        group: ['zshy_lingren_start'],
        subSkill: {
            start: {
                audio: 'zshy_lingren',
                trigger: {
                    global: 'phaseBefore',
                    player: 'enterGame',
                },
                filter(event, player) {
                    return event.name != 'phase' || game.phaseNumber == 0;
                },
                direct: true,
                content() {
                    player.logSkill('zshy_lingren_start', player);
                    player.addTempSkills(['zshy_jianxiong', 'zshy_xingshang'], { player: 'phaseUseBegin' });
                },
            },
        },
    },
    zshy_fujian: {//伏间
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AAZZcaoyingJMGX_shadow: 'zshy_fujian_zshy_AAZZcaoyingJMGX_shadow',
        },
        trigger: {
            player: ['phaseZhunbeiBegin', 'phaseJieshuBegin'],
        },
        filter(event, player) {
            return game.countPlayer(function (current) {
                return current.countCards('h') > 0 && current != player;
            }) != 0;
        },
        forced: true,
        async content(event, trigger, player) {
            let str = get.translation(trigger.name) + '，你观看一名其他角色的手牌并回复1点体力或摸一张牌。';
            const result = await player.chooseTarget(get.prompt('zshy_fujian'), str, function (card, player, target) {
                return target != player && target.countCards('h') > 0;
            }).set('ai', function (target) {
                return true;
            }).forResult();
            if (result.targets) {
                var target = result.targets[0];
                var cards = target.getCards('h');
                player.line(target);
                var content = [get.translation(target) + '的手牌', cards];
                game.log(player, '观看了', target, '的手牌');
                player.chooseControl('ok').set('dialog', content);
            }
            await player.chooseDrawRecover(true);
        },
    },
    zshy_jianxiong_zshy_AAZZcaoyingJMGX: {//奸雄
        audio: 'ext:诸神寰宇/audio/character:2'
    },
    zshy_xingshang_zshy_AAZZcaoyingJMGX: {//行殇
        audio: 'ext:诸神寰宇/audio/character:2'
    },
    //墟曹婴-变身
    zshy_AAZZcaoyingJMGXchangeSkin: {
        trigger: {
            player: 'changeHpAfter',
        },
        popup: false,
        silent: true,
        charlotte: true,
        NihilismSkill: true,
        superCharlotte: true,
        async content(event, trigger, player) {
            const playername = `zshy_AAZZcaoyingJMGX`;
            if (player.hp > 2) {
                player.changeSkin({ characterName: playername }, playername);
            } else {
                player.changeSkin({ characterName: playername }, playername + '_shadow');
            };
        },
    },
    zshy_lingren_zshy_AAZZcaoyingJMGX_shadow: {//凌人
        audio: 'ext:诸神寰宇/audio/character:2'
    },
    zshy_fujian_zshy_AAZZcaoyingJMGX_shadow: {//伏间
        audio: 'ext:诸神寰宇/audio/character:2'
    },
    zshy_jianxiong_zshy_AAZZcaoyingJMGX_shadow: {//奸雄
        audio: 'ext:诸神寰宇/audio/character:2'
    },
    zshy_xingshang_zshy_AAZZcaoyingJMGX_shadow: {//行殇
        audio: 'ext:诸神寰宇/audio/character:2'
    },

    //墟关索
    zshy_zhengnan: {//征南
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'dying',
            player: 'phaseZhunbeiBegin',
        },
        forced: true,
        derivation: ['zshy_wusheng', 'zshy_dangxian', 'zshy_zhiman'],
        async content(event, trigger, player) {
            player.chooseDrawRecover(3, true);
            var list = [];
            if (!player.hasSkill('zshy_wusheng')) {
                list.push('zshy_wusheng');
            }
            if (!player.hasSkill('zshy_dangxian')) {
                list.push('zshy_dangxian');
            }
            if (!player.hasSkill('zshy_zhiman')) {
                list.push('zshy_zhiman');
            }
            if (list.length && list.length == 1) {
                player.addSkills(list);
            } else {
                const result = await player.chooseControl(list).set('prompt', '征南：选择获得下列技能中的一个')
                    .set('ai', function () {
                        if (list.includes('zshy_dangxian')) {
                            return 'zshy_dangxian';
                        }
                        return 0;
                    }).forResult();
                if (result && result.control) {
                    player.addSkills(result.control);
                }
            }
        },
        ai: { threaten: 2.5 },
    },
    zshy_xiefang: {//撷芳
        mod: {
            globalFrom(from, to, distance) {
                var n = 1 + game.countPlayer(function (current) {
                    return current.hasSex('female');
                });
                return distance - n;
            },
            maxHandcard(player, num) {
                var n = 1 + game.countPlayer(function (current) {
                    return current.hasSex('female');
                });
                return num + n;
            },
        },
    },

    //墟潘淑
    zshy_weiyi: {//威仪
        audio: 'weiyi',
        trigger: { global: 'damageEnd' },
        filter(event, player) {
            if (!event.player.isIn()) {
                return false;
            }
            return event.player.hp >= player.hp || event.player.isDamaged();
        },
        direct: true,
        content() {
            'step 0';
            var list = [];
            if (trigger.player.hp >= player.hp) {
                list.push('失去体力');
            }
            if (trigger.player.hp <= player.hp && trigger.player.isDamaged()) {
                list.push('回复体力');
            }
            list.push('cancel2');
            player
                .chooseControl(list)
                .set('prompt', get.prompt2('zshy_weiyi', trigger.player))
                .set('ai', function () {
                    var player = _status.event.player,
                        target = _status.event.getTrigger().player;
                    var att = get.attitude(player, target),
                        eff = get.recoverEffect(target, player, player);
                    if (target.hp <= player.hp && target.isDamaged() && att > 2 && eff > 0) {
                        if (player == target) {
                            var storage = player.getStorage('zshy_weiyi');
                            if (
                                player.hp >= 2 &&
                                game.hasPlayer(function (current) {
                                    return current.hp == player.hp + 1 && !storage.includes(current) && get.attitude(player, current) < 0;
                                })
                            ) {
                                return 'cancel2';
                            }
                        }
                        return '回复体力';
                    }
                    if (target.hp >= player.hp && att < -2 && eff < 0) {
                        return '失去体力';
                    }
                    return 'cancel2';
                });
            'step 1';
            if (result.control != 'cancel2') {
                var target = trigger.player;
                player.logSkill('zshy_weiyi', target);
                target[result.control == '失去体力' ? 'loseHp' : 'recover']();
            }
        },
    },
    zshy_jinzhi: {//锦织
        audio: 'jinzhi',
        enable: ['chooseToUse', 'chooseToRespond'],
        hiddenCard(player, name) {
            if (get.type(name) == 'basic' && lib.inpile.includes(name) && player.countMark('zshy_jinzhi_used') < player.countCards('he')) {
                return true;
            }
        },
        filter(event, player) {
            if (event.responded || event.zshy_jinzhi || player.countMark('zshy_jinzhi_used') >= player.countCards('he')) {
                return false;
            }
            for (var i of lib.inpile) {
                if (get.type(i) == 'basic' && event.filterCard({ name: i, isCard: true }, player, event)) {
                    return true;
                }
            }
            return false;
        },
        chooseButton: {
            dialog(event, player) {
                var list = [];
                for (var i of lib.inpile) {
                    if (get.type(i) == 'basic' && event.filterCard({ name: i, isCard: true }, player, event)) {
                        list.push(['基本', '', i]);
                        if (i == 'sha') {
                            for (var j of lib.inpile_nature) {
                                list.push(['基本', '', 'sha', j]);
                            }
                        }
                    }
                }
                return ui.create.dialog('锦织', [list, 'vcard'], 'hidden');
            },
            check(button) {
                if (_status.event.getParent().type != 'phase') {
                    return 1;
                }
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
                }
                return player.getUseValue({ name: button.link[2], nature: button.link[3] }) / 4;
            },
            backup(links, player) {
                return {
                    selectCard: player.countMark('zshy_jinzhi_used') + 1,
                    filterCard(card, player) {
                        if (ui.selected.cards.length) {
                            if (get.color(card) != get.color(ui.selected.cards[0])) {
                                return false;
                            }
                        }
                        return lib.filter.cardDiscardable.apply(this, arguments);
                    },
                    complexCard: true,
                    viewAs: {
                        name: links[0][2],
                        nature: links[0][3],
                        suit: 'none',
                        number: null,
                        isCard: true,
                    },
                    position: 'he',
                    ignoreMod: true,
                    check(card) {
                        var player = _status.event.player,
                            color = get.color(card, player);
                        if (player.countCards('he', { color: color }) <= player.countMark('zshy_jinzhi_used') || (ui.selected.cards.length && get.color(ui.selected.cards[0], player) != color)) {
                            return -1;
                        }
                        if (
                            lib.skill.zshy_jinzhi_backup.viewAs.name == 'jiu' &&
                            !player.countCards('h', function (cardx) {
                                return card != cardx && !ui.selected.cards.includes(cardx) && get.name(cardx, player) == 'sha';
                            })
                        ) {
                            return 0;
                        }
                        return Math.min(0.01, 6 - get.value(card));
                    },
                    log: false,
                    precontent(event) {
                        player.logSkill('zshy_jinzhi');
                        player.addTempSkill('zshy_jinzhi_used');
                        player.addMark('zshy_jinzhi_used', 1, false);
                        var cards = event.result.cards;
                        player.discard(cards);
                        player.draw(cards.length);
                        event.result.card = {
                            name: event.result.card.name,
                            nature: event.result.card.nature,
                            isCard: true,
                        };
                        event.result.cards = [];
                        if (cards.length > 1) {
                            var color = get.color(cards[0], player);
                            for (var i = 1; i < cards.length; i++) {
                                if (get.color(cards[i], player) != color) {
                                    var evt = event.getParent();
                                    evt.set('zshy_jinzhi', true);
                                    evt.goto(0);
                                    return;
                                }
                            }
                        }
                    },
                };
            },
            prompt(links, player) {
                var name = links[0][2];
                var nature = links[0][3];
                return '弃置' + get.cnNumber(player.countMark('zshy_jinzhi_used') + 1) + '张颜色相同的牌并摸一张牌，然后视为使用' + (get.translation(nature) || '') + get.translation(name);
            },
        },
        ai: {
            order(item, player) {
                if (_status.event.type == 'phase' && !player.countMark('zshy_jinzhi_used') && player.getUseValue({ name: 'jiu' }, null, true) > 0 && player.countCards('h', 'sha')) {
                    return get.order({ name: 'jiu' }) + 1;
                }
                return 1;
            },
            respondShan: true,
            respondSha: true,
            skillTagFilter(player) {
                if (player.countMark('zshy_jinzhi_used') >= player.countCards('he')) {
                    return false;
                }
            },
            result: {
                player(player) {
                    if (_status.event.dying) {
                        return get.attitude(player, _status.event.dying);
                    }
                    return 1;
                },
            },
        },
        subSkill: {
            used: {
                charlotte: true,
                onremove: true,
                intro: { content: '本回合已发动过#次' },
            },
        },
    },

    //墟卧龙凤雏
    zshy_youlong: {//游龙
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: ['chooseToUse', 'chooseToRespond'],
        charlotte: true,
        usable(event, player) {
            if (player.getStorage('zshy_luanfeng').includes(player)) return player.maxHp;
            else return 2;
        },
        prompt: '每回合限2次，当你需要<span data-nature="shenmm">使用/打出</span>一张基本牌或普通锦囊牌，你可以发动〖游龙〗，视为<span data-nature="shenmm">使用/打出</span>之。',
        hiddenCard(player, name) {
            const type = get.type(name);
            return type == 'basic' || type == 'trick';
        },
        filter(event, player) {
            return get.inpileVCardList(info => {
                if (info[0] != 'basic' && info[0] != 'trick') {
                    return false;
                }
                return event.filterCard({ name: info[2], nature: info[3], isCard: true }, player, event);
            }).length;
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
                }
                return ui.create.dialog('游龙', [list, 'vcard'], 'hidden');
            },
            filter(button, player) {
                return _status.event.getParent().filterCard({ name: button.link[2] }, player, _status.event.getParent());
            },
            check(button) {
                const player = _status.event.player;
                return player.getUseValue({ name: button.link[2] }) + 1;
            },
            backup(links, player) {
                return {
                    filterCard() { return false },
                    selectCard: -1,
                    viewAs: { name: links[0][2], nature: links[0][3] },
                    popname: true,
                    precontent() {
                        player.logSkill('zshy_youlong');
                    },
                }
            },
            prompt(links, player) {
                return '将' + get.translation(links[0][2]) + '使用或打出';
            },
        },
        ai: {
            order: 1,
            respondSha: true,
            respondShan: true,
            skillTagFilter(player, tag, arg) {
                const name = tag == 'respondSha' ? 'sha' : 'shan';
                return true;
            },
            result: {
                player(player) {
                    if (_status.event.dying) {
                        return get.attitude(player, _status.event.dying);
                    }
                    return 1;
                },
            },
        },
        group: ['zshy_youlong_usecard', 'zshy_youlong_red'],
        subSkill: {
            usecard: {
                audio: 'zshy_youlong',
                trigger: {
                    player: 'useCard',
                },
                charlotte: true,
                direct: true,
                filter(event, player) {
                    return (get.type(event.card) == 'trick' || get.type(event.card) == 'delay')
                        && (get.color(event.card) == 'black' || get.color(event.card) == undefined
                            || get.color(event.card) == 'none');
                },
                async content(event, trigger, player) {
                    if (get.color(trigger.card) == 'black') await player.logSkill('zshy_youlong'), trigger.directHit.addArray(game.players);
                    else await trigger.baseDamage++;
                },
            },
            red: {
                audio: 'zshy_youlong',
                trigger: {
                    player: 'useCardToPlayered',
                },
                charlotte: true,
                filter(event, player) {
                    return get.color(event.card) == 'red' && (get.type(event.card) == 'trick' || get.type(event.card) == 'delay');
                },
                prompt2(event, player, target) {
                    return '是否对' + get.translation(event.target) + '造成1点火焰伤害？';
                },
                async content(event, trigger, player) {
                    await trigger.target.damage('fire');
                },
                ai: {
                    result: {
                        target(event, player, target) {
                            return get.damageEffect(target, player, player, 'fire') > 0;
                        },
                    },
                },
            },
        },
    },
    zshy_luanfeng: {//鸾凤
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'dying',
        },
        charlotte: true,
        filter(event, player) {
            return !player.getStorage('zshy_luanfeng').includes(event.player);
        },
        skillAnimation: true,
        animationColor: 'soil',
        prompt2: '每局每名角色限1次，当一名角色进入濒死状态时，你可以令其增加1点体力上限并回复至满体力，然后恢复其被废除的装备栏并令其摸四张牌。若该角色为你，则〖游龙〗每回合限制次数调整为你的体力上限。',
        check(event, player) {
            if (get.attitude(player, event.player) < 3) {
                return false;
            }
            if (player.countCards('h', function (card) {
                var mod2 = game.checkMod(card, player, 'unchanged', 'cardEnabled2', player);
                if (mod2 != 'unchanged') { return mod2 }
                var mod = game.checkMod(card, player, event.player, 'unchanged', 'cardSavable', player);
                if (mod != 'unchanged') { return mod }
                var savable = get.info(card).savable;
                if (typeof savable == 'function') {
                    savable = savable(card, player, event.player);
                } return savable;
            }) >= 1 - event.player.hp) {
                return false;
            }
            if (event.player == player || event.player == get.zhu(player)) {
                return true;
            }
            return !player.hasUnknown();
        },
        async content(event, trigger, player) {
            await player.markAuto('zshy_luanfeng', [trigger.player]);
            await trigger.player.gainMaxHp();
            await trigger.player.recoverTo(trigger.player.maxHp);
            const list = [], target = trigger.player;
            for (var i = 1; i < 6; i++) {
                for (var j = 0; j < target.countDisabledSlot(i); j++) {
                    list.push(i);
                }
            }
            if (list.length > 0) {
                target.enableEquip(list);
            }
            await target.draw(4);
            if (target == player) {
                await player.addSkill('zshy_luanfeng_fire');
            }
        },
        onremove: true,
        mark: true,
        intro: {
            content: '已发动过的目标：$',
            onunmark: true,
        },
        group: ['zshy_luanfeng_Link'],
        subSkill: {
            fire: {
                trigger: {
                    player: 'damageBegin4',
                },
                charlotte: true,
                forced: true,
                filter(event, player) {
                    return event.hasNature('fire');
                },
                async content(event, trigger, player) {
                    trigger.cancel();
                    player.recover(trigger.num);
                },
                mark: true,
                intro: {
                    content: '你受到的火焰伤害改为回复效果。',
                },
                ai: {
                    nofire: true,
                },
            },
            Link: {
                audio: 'zshy_luanfeng',
                trigger: { player: 'useCardToPlayered' },
                charlotte: true,
                forced: true,
                logTarget: 'target',
                fitler(event, player) {
                    return event.target != player;
                },
                async content(event, trigger, player) {
                    trigger.target.link(true);
                },
            },
        },
    },

    //晋墟周处
    zshy_shanduan: {//善断
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'damageEnd',
        },
        forced: true,
        async content(event, trigger, player) {
            player.draw();
            if (!player.storage.zshy_shanduan) {
                player.storage.zshy_shanduan = [4, 4, 4, 4];
            }
            let list = player.storage.zshy_shanduan;
            for (let i = 0; i < list.length; i++) {
                let num = list[i],
                    add = true;
                for (let j = 0; j < list.length; j++) {
                    if (list[j] < num) {
                        add = false;
                        break;
                    }
                }
                if (add) {
                    list[i]++;
                    break;
                }
            }
            player.addTip('zshy_shanduan', get.translation('zshy_shanduan') + ' ' + player.storage['zshy_shanduan'].slice().join(' '));
            game.delayx();
        },
        getIndex(event, player) {
            return event.num;
        },
        init(player, skill) {
            player.storage[skill] = [4, 4, 4, 4];
            player.addTip(skill, get.translation(skill) + ' ' + player.storage[skill].slice().join(' '));
        },
        onremove: (player, skill) => player.removeTip(skill),
        group: ['zshy_shanduan_draw', 'zshy_shanduan_use', 'zshy_shanduan_discard'],
        ai: {
            notemp: true,
            threaten: 3.6,
        },
        subSkill: {
            draw: {
                audio: 'zshy_shanduan',
                trigger: { player: 'phaseDrawBegin' },
                filter(event, player) {
                    var list = event.getParent()._zshy_shanduan;
                    return !list || list.length > 0;
                },
                forced: true,
                content() {
                    'step 0';
                    var list = trigger.getParent()._zshy_shanduan;
                    if (!list) {
                        trigger.getParent()._zshy_shanduan = (player.storage.zshy_shanduan || [4, 4, 4, 4]).slice(0);
                        player.storage.zshy_shanduan = [4, 4, 4, 4];
                        player.addTip('zshy_shanduan', get.translation('zshy_shanduan') + ' ' + trigger.getParent()._zshy_shanduan.slice().join(' '));
                    }
                    'step 1';
                    var list = trigger.getParent()._zshy_shanduan;
                    if (list.length == 1) event._result = { index: 0 };
                    else
                        player
                            .chooseControl(list)
                            .set('prompt', '善断：为摸牌阶段的摸牌数分配一个数值')
                            .set('choice', list.indexOf(Math.max.apply(Math, list)))
                            .set('ai', () => _status.event.choice);
                    'step 2';
                    var list = trigger.getParent()._zshy_shanduan;
                    var num = list[result.index];
                    trigger.num = num;
                    list.remove(num);
                    game.log(player, '给', '#g摸牌阶段的摸牌数', '分配的数值是', '#y' + num);
                    if (list.length) player.addTip('zshy_shanduan', get.translation('zshy_shanduan') + ' ' + list.slice().join(' '));
                    else player.addTip('zshy_shanduan', get.translation('zshy_shanduan') + ' ' + player.storage.zshy_shanduan.slice().join(' '));
                },
            },
            use: {
                audio: 'zshy_shanduan',
                trigger: { player: 'phaseUseBegin' },
                filter(event, player) {
                    var list = event.getParent()._zshy_shanduan;
                    return !list || list.length > 0;
                },
                forced: true,
                content() {
                    'step 0';
                    var list = trigger.getParent()._zshy_shanduan;
                    if (!list) {
                        trigger.getParent()._zshy_shanduan = (player.storage.zshy_shanduan || [4, 4, 4, 4]).slice(0);
                        player.storage.zshy_shanduan = [4, 4, 4, 4];
                        player.addTip('zshy_shanduan', get.translation('zshy_shanduan') + ' ' + trigger.getParent()._zshy_shanduan.slice().join(' '));
                    }
                    'step 1';
                    var list = trigger.getParent()._zshy_shanduan;
                    if (list.length == 1) event._result = { index: 0 };
                    else
                        player
                            .chooseControl(list)
                            .set('prompt', '善断：为攻击范围基数分配一个数值')
                            .set('list', list)
                            .set('ai', function () {
                                var player = _status.event.player,
                                    list = _status.event.list,
                                    card = { name: 'sha' };
                                if (player.hasSha() && player.hasValueTarget(card, false, true) && !player.hasValueTarget(card, null, true)) {
                                    var range = 1;
                                    var equips = player.getCards('e');
                                    for (var i = 0; i < equips.length; i++) {
                                        var info = get.info(equips[i], false).distance;
                                        if (!info) continue;
                                        if (info.attackFrom) {
                                            range -= info.attackFrom;
                                        }
                                    }
                                    var listx = list.slice(0).sort();
                                    for (var i of listx) {
                                        if (i <= range) continue;
                                        if (
                                            game.hasPlayer(function (current) {
                                                var distance = get.distance(player, current, 'attack');
                                                if (distance > 1 && distance <= i - range) return true;
                                                return false;
                                            })
                                        )
                                            return list.indexOf(i);
                                    }
                                }
                                return list.indexOf(Math.min.apply(Math, list));
                            });
                    'step 2';
                    var list = trigger.getParent()._zshy_shanduan;
                    var num = list[result.index];
                    if (!player.storage.zshy_shanduan_effect) player.storage.zshy_shanduan_effect = {};
                    player.storage.zshy_shanduan_effect.range = num;
                    player.addTempSkill('zshy_shanduan_effect');
                    list.remove(num);
                    game.log(player, '给', '#g攻击范围的基数', '分配的数值是', '#y' + num);
                    if (list.length) player.addTip('zshy_shanduan', get.translation('zshy_shanduan') + ' ' + list.slice().join(' '));
                    else player.addTip('zshy_shanduan', get.translation('zshy_shanduan') + ' ' + player.storage.zshy_shanduan.slice().join(' '));
                    if (list.length == 0) event.finish();
                    else if (list.length == 1) event._result = { index: 0 };
                    else
                        player
                            .chooseControl(list)
                            .set('prompt', '为使用【杀】的次数上限分配一个数值')
                            .set('list', list)
                            .set('ai', function () {
                                var player = _status.event.player,
                                    list = _status.event.list;
                                var sha = player.countCards('hs', function (card) {
                                    return get.name(card) == 'sha' && player.hasValueTarget(card, null, true);
                                });
                                var max = player.getCardUsable('sha');
                                if (sha <= max) {
                                    var listx = list.slice(0).sort();
                                    for (var i of listx) {
                                        if (max + i >= sha) return list.indexOf(i);
                                    }
                                    return list.indexOf(Math.max.apply(Math, list));
                                }
                                return list.indexOf(Math.min.apply(Math, list));
                            });
                    'step 3';
                    var list = trigger.getParent()._zshy_shanduan;
                    var num = list[result.index];
                    if (!player.storage.zshy_shanduan_effect) player.storage.zshy_shanduan_effect = {};
                    player.storage.zshy_shanduan_effect.sha = num;
                    list.remove(num);
                    game.log(player, '给', '#g使用【杀】的次数上限', '分配的数值是', '#y' + num);
                    if (list.length) player.addTip('zshy_shanduan', get.translation('zshy_shanduan') + ' ' + list.slice().join(' '));
                    else player.addTip('zshy_shanduan', get.translation('zshy_shanduan') + ' ' + player.storage.zshy_shanduan.slice().join(' '));
                },
            },
            discard: {
                audio: 'zshy_shanduan',
                trigger: { player: 'phaseDiscardBegin' },
                filter(event, player) {
                    var list = event.getParent()._zshy_shanduan;
                    return !list || list.length > 0;
                },
                forced: true,
                content() {
                    'step 0';
                    var list = trigger.getParent()._zshy_shanduan;
                    if (!list) {
                        trigger.getParent()._zshy_shanduan = (player.storage.zshy_shanduan || [4, 4, 4, 4]).slice(0);
                        player.storage.zshy_shanduan = [4, 4, 4, 4];
                        player.addTip('zshy_shanduan', get.translation('zshy_shanduan') + ' ' + trigger.getParent()._zshy_shanduan.slice().join(' '));
                    }
                    'step 1';
                    var list = trigger.getParent()._zshy_shanduan;
                    if (list.length == 1) event._result = { index: 0 };
                    else player.chooseControl(list).set('prompt', '善断：为手牌上限基数分配一个数值')
                        .set('choice', list.indexOf(Math.max.apply(Math, list)))
                        .set('ai', () => _status.event.choice);
                    'step 2';
                    var list = trigger.getParent()._zshy_shanduan;
                    var num = list[result.index];
                    if (!player.storage.zshy_shanduan_effect) player.storage.zshy_shanduan_effect = {};
                    player.storage.zshy_shanduan_effect.limit = num;
                    player.addTempSkill('zshy_shanduan_effect');
                    list.remove(num);
                    game.log(player, '给', '#g手牌上限的基数', '分配的数值是', '#y' + num);
                    if (list.length) player.addTip('zshy_shanduan', get.translation('zshy_shanduan') + ' ' + list.slice().join(' '));
                    else player.addTip('zshy_shanduan', get.translation('zshy_shanduan') + ' ' + player.storage.zshy_shanduan.slice().join(' '));
                },
            },
            effect: {
                charlotte: true,
                onremove: true,
                mod: {
                    attackRangeBase(player) {
                        var map = player.storage.zshy_shanduan_effect;
                        if (typeof map.range != 'number') return;
                        return Math.max(player.getEquipRange(player.getCards('e')), map.range);
                    },
                    cardUsable(card, player, num) {
                        if (card.name == 'sha') {
                            var map = player.storage.zshy_shanduan_effect;
                            if (typeof map.sha != 'number') return;
                            return num - 1 + map.sha;
                        }
                    },
                    maxHandcardBase(player, num) {
                        var map = player.storage.zshy_shanduan_effect;
                        if (typeof map.limit != 'number') return;
                        return map.limit;
                    },
                },
            },
        },
    },
    zshy_yilie: {//义烈
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: ['chooseToUse', 'chooseToRespond'],
        hiddenCard(player, name) {
            var type = get.type2(name);
            if (type != 'basic' && !(type == 'trick' && get.tag({ name: name }, 'damage') > 0)) return false;
            return player.countCards('hs', { type: ['basic', 'trick'] });
        },
        filter(event, player) {
            for (var i of lib.inpile) {
                var type = get.type2(i), filter = event.filterCard;
                if (type == 'basic' || (type == 'trick' && get.tag({ name: i }, 'damage') > 0)) {
                    if (filter({ name: i }, player, event)) return true;
                }
            }
            return false;
        },
        chooseButton: {
            dialog(event, player) {
                var list = [];
                for (var i of lib.inpile) {
                    var type = get.type2(i), filter = event.filterCard;
                    if (type == 'basic') {
                        if (filter({ name: i }, player, event)) list.push(['基本', '', i]);
                        if (i == 'sha') {
                            for (var j of lib.inpile_nature) {
                                if (filter({ name: i, nature: j }, player, event)) list.push(['基本', '', 'sha', j]);
                            }
                        }
                    }
                    if (type == 'trick' && get.tag({ name: i }, 'damage') > 0) {
                        if (filter({ name: i }, player, event)) list.push(['锦囊', '', i]);
                    }
                }
                return ui.create.dialog('义烈', [list, 'vcard'], 'hidden');
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
                    filterCard: true,
                    selectCard: 2,
                    check(card, player, target) {
                        return 7 - get.value(card);
                    },
                    viewAs: { name: links[0][2], nature: links[0][3] },
                    position: 'hes',
                    popname: true,
                    precontent() {
                        player.logSkill('zshy_yilie');
                    },
                }
            },
            prompt(links, player) {
                return '将两张牌当做' + get.translation(links[0][2]) + '使用或打出';
            },
        },
        ai: {
            order(event, player) {
                return 8.5;
            },
            respondSha: true,
            respondShan: true,
            fireAttack: true,
            skillTagFilter(player, tag) {
                if (!player.countCards('hs', { type: 'basic' })) return false;
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

};

const skill_ccxh = {
    ...天极·皇室宗亲, ...四弼·辅国文曲, ...天柱·势冠一方,
    ...女史·留史巾帼, ...少微·能人异士, ...虎贲·勇冠三军,
    ...灯愿·祈福武将,
};

export default skill_ccxh;
