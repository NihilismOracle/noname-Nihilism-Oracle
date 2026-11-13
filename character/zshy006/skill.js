import { lib, game, ui, get, ai, _status } from '../../../../noname.js'
const 谋定天下 = {
    //墟谋姜维
    zshy_zhuri: {//逐日
        audio: `ext:诸神寰宇/audio/character:2`,
        trigger: {
            global: 'phaseAnyEnd',
        },
        filter(event, player) {
            if (!game.hasPlayer(target => player.canCompare(target))) {
                return false;
            }
            return true;
        },
        direct: true,
        async content(event, trigger, player) {
            const result = await player.chooseTarget(get.prompt2('zshy_zhuri'), function (card, player, target) {
                return player.canCompare(target);
            }).set('ai', target => {
                var player = _status.event.player;
                var ts = target.getCards('h').sort((a, b) => get.number(a) - get.number(b));
                if (get.attitude(player, target) < 0) {
                    var hs = player.getCards('h').sort((a, b) => get.number(b) - get.number(a));
                    var ts = target.getCards('h').sort((a, b) => get.number(b) - get.number(a));
                    if (get.number(hs[0]) > get.number(ts[0])) {
                        return 1;
                    }
                    if (get.effect(player, { name: 'losehp' }, player, player) > 0) {
                        return Math.random() + 0.2;
                    }
                    if (player.getHp() > 2) {
                        return Math.random() - 0.5;
                    }
                    return 0;
                }
                return 0;
            }).forResult();
            if (result?.bool) {
                var target = result.targets[0];
                player.logSkill('zshy_zhuri', target);
                const result2 = await player.chooseToCompare(target).forResult();
                if (result2?.bool) {
                    var cards = [result2.player, result2.target].filterInD('d');
                    cards = cards.filter(card => player.hasUseTarget(card));
                    if (cards.length) {
                        const result3 = await player.chooseButton(['是否使用其中的牌？', cards]).set('ai', button => _status.event.player.getUseValue(button.link)).forResult();
                        if (result3.bool) {
                            var card = result3.links[0];
                            player.$gain2(card, false);
                            game.delayx();
                            player.chooseUseTarget(true, card, false);
                        }
                    }
                    player.draw();
                } else {
                    const result4 = await player
                        .chooseControl('失去体力', '技能失效')
                        .set('prompt', '逐日：失去1点体力，或令此技能于本回合失效')
                        .set('ai', () => {
                            var player = _status.event.player;
                            if (get.effect(player, { name: 'losehp' }, player, player) > 0) {
                                return '失去体力';
                            }
                            return '技能失效';
                        }).forResult();
                    if (result4?.control == '失去体力') {
                        player.loseHp(1);
                        player.draw(2);
                    } else {
                        player.addTempSkill('zshy_zhuri_block');
                        player.tempBanSkill('zshy_zhuri');
                        player.draw(2);
                    }
                }
            }
        },
        subSkill: {
            block: {
                charlotte: true,
                mark: true,
                marktext: '<span style="text-decoration: line-through;">日</span>',
                intro: { content: '追不动太阳了' },
            },
        },
    },
    zshy_ranji: {//燃己
        audio: `ext:诸神寰宇/audio/character:2`,
        trigger: { player: 'phaseJieshuBegin' },
        prompt2(event, player) {
            return '获得技能【困奋】与【诈降】（以此法获得的〖困奋〗直接修改为回复1点体力并摸一张牌），然后将手牌数调整至手牌上限或将体力值回复至体力上限。';
        },
        check: () => true,
        limited: true,
        skillAnimation: true,
        animationColor: 'fire',
        derivation: ['zshy_kunfen', 'zshy_zhaxiang'],
        async content(event, trigger, player) {
            player.awakenSkill(event.name);
            await player.addSkills(['zshy_kunfen', 'zshy_zhaxiang']);
            player.storage.zshy_kunfen = true;
            const result = await player
                .chooseControl('手牌数调整至手牌上限', '回复体力至体力上限')
                .set('prompt', '〖燃己〗：请选择一项')
                .set('prompt2', '1.将手牌数调整至手牌上限；2.将体力值回复至体力上限')
                .set('ai', () => {
                    const current = _status.event.player;
                    const needHp = Math.max(0, current.maxHp - current.hp);
                    const needHand = Math.max(0, current.getHandcardLimit() - current.countCards('h'));
                    if (needHp > 0 && (current.hp <= 1 || needHp >= needHand)) return '回复体力至体力上限';
                    return '手牌数调整至手牌上限';
                })
                .forResult();
            if (result.control == '回复体力至体力上限') {
                await player.recoverTo(player.maxHp);
                return;
            }
            const limit = player.getHandcardLimit(),
                count = player.countCards('h');
            if (count < limit) {
                await player.draw(limit - count);
            } else if (count > limit) {
                await player
                    .chooseToDiscard(count - limit, 'h', true)
                    .set('prompt', `〖燃己〗：请弃置${count - limit}张手牌`)
                    .set('prompt2', '将手牌数调整至手牌上限');
            }
        },
    },
    zshy_kunfen_zshy_AAZZjiangweiSBFM: {//困奋
        audio: `ext:诸神寰宇/audio/character:2`,
    },
    zshy_zhaxiang_zshy_AAZZjiangweiSBFM: {//诈降
        audio: `ext:诸神寰宇/audio/character:2`,
    },

    //墟谋鲁肃
    zshy_duduan: {//独断
        audio: `ext:诸神寰宇/audio/character:2`,
        phasename: ['phaseJudge', 'phaseDraw', 'phaseUse', 'phaseDiscard'],
        trigger: { global: 'phaseBegin' },
        prompt2(event, player) {
            return '回复1点体力或摸一张牌，然后调整本回合的阶段：若该角色为你，则跳过一个阶段并交换另外两个阶段；若不为你的角色，则交换两个阶段，并在你指定的阶段结束时立即执行一个相同的阶段。';
        },
        filter(event, player) {
            return (event.phaseList || []).some(name => ['phaseJudge', 'phaseDraw', 'phaseUse', 'phaseDiscard'].includes(name.split('|')[0].split('-')[0]));
        },
        check: () => true,
        async content(event, trigger, player) {
            const turnPlayer = trigger.player;
            await player.chooseDrawRecover({
                forced: true,
                prompt: '〖独断〗：请选择一项',
                prompt2: '1.回复1点体力；2.摸一张牌',
            });
            const phasename = get.info(event.name).phasename;
            const phaseOf = name => name.split('|')[0].split('-')[0];
            const current = trigger.phaseList
                .map((name, index) => ({ index, phase: phaseOf(name) }))
                .filter(info => phasename.includes(info.phase));
            if (!current.length) return;
            // textbutton 的条目格式是 [link, 文本]，不是 [文本, link]
            const toButtons = list => list.map(info => [[info.index + 1, '', info.phase], `${info.index + 1}. ${get.translation(info.phase)}`]);
            const pick = async (list, prompt, prompt2, prefer) => {
                if (!list.length) return null;
                const result = await player
                    .chooseButton([prompt, [toButtons(list), 'textbutton']], true)
                    .set('prompt', prompt)
                    .set('prompt2', prompt2)
                    .set('ai', button => (button?.link?.[2] == prefer ? 10 : 1))
                    .forResult();
                return result?.links?.[0] || null;
            };
            const swap = (a, b) => {
                [trigger.phaseList[a], trigger.phaseList[b]] = [trigger.phaseList[b], trigger.phaseList[a]];
            };
            const swapTwo = async (list, prompt) => {
                if (list.length < 2) return false;
                const first = await pick(list, prompt, '请选择交换位置的第一个阶段', 'phaseUse');
                if (!first) return false;
                const rest = list.filter(info => info.index != first[0] - 1);
                const second = await pick(rest, prompt, '请选择交换位置的第二个阶段', 'phaseDraw');
                if (!second) return false;
                swap(first[0] - 1, second[0] - 1);
                return true;
            };
            if (turnPlayer == player) {
                const skip = await pick(current, '〖独断〗：请选择本回合要跳过的阶段', '该阶段本回合不会执行，随后再交换另外两个阶段', 'phaseJudge');
                if (!skip) return;
                const skipIndex = skip[0] - 1,
                    skipName = skip[2],
                    stored = trigger.phaseList[skipIndex],
                    extra = stored.split('|')[1];
                trigger.phaseList[skipIndex] = `skip${skipName.slice(5)}-${event.name}` + (extra ? '|' + extra : '');
                await swapTwo(current.filter(info => info.index != skipIndex), '〖独断〗：请选择另外两个阶段交换位置');
                return;
            }
            await swapTwo(current, '〖独断〗：请选择两个阶段交换位置');
            const repeat = await pick(current, '〖独断〗：请选择一个阶段', '该阶段结束时，你立即执行一个相同的阶段', 'phaseUse');
            if (!repeat) return;
            const phaseName = repeat[2],
                phaseNumber = game.phaseNumber;
            const listener = player
                .when({ global: phaseName + 'After' })
                .filter(evt => evt.player == turnPlayer && game.phaseNumber == phaseNumber);
            const listenerSkill = listener.skill;
            listener.then(async (event2, trigger2, player2) => {
                player2.removeSkill(listenerSkill);
                game.broadcastAll(currentPlayer => {
                    _status.currentPhase = currentPlayer;
                }, player2);
                await player2[phaseName]();
                game.broadcastAll(currentPlayer => {
                    _status.currentPhase = currentPlayer;
                }, turnPlayer);
            });
        },
    },
    zshy_yinglve: {//英略
        audio: `ext:诸神寰宇/audio/character:2`,
        enable: 'phaseUse',
        filter(event, player) {
            return player.getStorage('zshy_yinglve_used').length < 2;
        },
        position: 'he',
        chooseButton: {
            dialog(_, player) {
                const dialog = ui.create.dialog('英略：请选择一项', 'hidden');
                const list = [];
                if (!player.getStorage('zshy_yinglve_used').includes(0)) {
                    list.push([0, '令任意名角色失去1点体力，其下个摸牌阶段摸牌数+2']);
                }
                if (!player.getStorage('zshy_yinglve_used').includes(1)) {
                    list.push([1, '令任意名角色摸两张牌，其下个弃牌阶段内手牌上限-2']);
                }
                dialog.add([list, 'textbutton']);
                dialog.direct = true;
                return dialog;
            },
            check(button) {
                return 1;
            },
            backup(links, player) {
                return {
                    audio: 'zshy_yinglve',
                    choice: links[0],
                    filterTarget: true,
                    selectTarget: [1, Infinity],
                    async content(event, trigger, player) {
                        const choice = get.info(event.name).choice;
                        const target = event.target;
                        player.addTempSkill('zshy_yinglve_used', 'phaseUseAfter');
                        player.markAuto('zshy_yinglve_used', [choice]);
                        if (choice == 0) {
                            await target.loseHp();
                            target.when({ player: 'phaseDrawBegin2' })
                                .filter(evt => !evt.numFixed)
                                .then(() => {
                                    trigger.num += 2;
                                });
                        } else {
                            await target.draw(2);
                            target.when({ player: 'phaseDiscardBegin' }).then(() => {
                                player.addTempSkill('zshy_yinglve_debuff', ['phaseBeforeStart', 'phaseChange', 'phaseAfter']);
                                player.addMark('zshy_yinglve_debuff', 2, false);
                            });
                        }
                    },
                    ai: {
                        result: {
                            target(player, target) {
                                const choice = get.info('zshy_yinglve_backup');
                                if (choice === 0) {
                                    return get.effect(target, { name: 'losehp' }, player, player);
                                } else {
                                    return get.effect(target, { name: 'draw' }, player, player);
                                }
                            },
                        },
                    },
                };
            },
            prompt(links, player) {
                const choice = links[0];
                let str;
                if (choice == 0) {
                    str = '令任意名角色失去1点体力，其下个摸牌阶段摸牌数+2';
                } else {
                    str = '令任意名角色摸两张牌，其下个弃牌阶段内手牌上限-2';
                }
                return `###英略###<div class='text center'>${str}</div>`;
            },
        },
        ai: {
            order: 9,
            result: {
                player: 1,
            },
        },
        subSkill: {
            backup: {},
            used: {
                onremove: true,
                charlotte: true,
            },
            debuff: {
                onremove: true,
                charlotte: true,
                markimage: 'image/card/handcard.png',
                intro: {
                    content: '手牌上限-#',
                },
                mod: {
                    maxHandcard(player, num) {
                        return num - player.countMark('zshy_yinglve_debuff');
                    },
                },
            },
        },
    },
    zshy_mengshi: {//盟势
        audio: `ext:诸神寰宇/audio/character:2`,
        trigger: {
            global: 'phaseJieshuBegin',
        },
        filter(event, player) {
            return game.countPlayer(target => target !== player) >= 2;
        },
        async cost(event, trigger, player) {
            event.result = await player.chooseTarget(get.prompt(event.skill), '选择两名其他角色交换体力', lib.filter.notMe)
                .set('selectTarget', 2)
                .set('multitarget', true)
                .set('ai', target => {
                    const player = get.player();
                    const att = get.attitude(player, target);
                    if (!ui.selected.targets && att > 0) {
                        return 1145141919810 - target.getHp();
                    }
                    if (ui.selected?.targets?.length && att < 0 && ui.selected.targets[0].getHp() < target.getHp()) {
                        return target.getHp() - ui.selected.targets[0].getHp();
                    }
                }).forResult();
        },
        async content(event, trigger, player) {
            const [target1, target2] = event.targets.sortBySeat();
            if (target1.getHp() === target2.getHp()) {
                return;
            }
            if ([target1, target2].some(target => !target.isIn())) {
                player.chat('怎么肘了');
                return;
            }
            const num = Math.abs(target1.getHp() - target2.getHp());
            const list = target2.getHp() > target1.getHp() ? [num, -num] : [-num, num];
            await target1[list[0] > 0 ? 'recover' : 'loseHp'](Math.abs(list[0]));
            await target2[list[1] > 0 ? 'recover' : 'loseHp'](Math.abs(list[1]));
        },
    },

    //墟谋庞统
    zshy_hongtu: {//鸿途
        audio: `ext:诸神寰宇/audio/character:2`,
        trigger: {
            player: [`gainAfter`, `damageEnd`],
        },
        filter(event, player) {
            return !player.hasSkill('zshy_hongtu_using');
        },
        derivation: ['zshy_feijun', 'zshy_qianxi'],
        check(event, player) {
            if (game.hasPlayer(current => {
                return current !== player && get.attitude(player, current) > 0;
            })) {
                return true;
            }
            const eff = get.damageEffect(player, player, player, 'fire');
            if (game.hasPlayer(current => {
                return (
                    get.damageEffect(current, player, player, 'fire') > eff &&
                    player.countCards('h', card => {
                        return !current.hasUseTarget(card);
                    }) >=
                    2 + (player.getHp() > 1)
                );
            })) {
                return true;
            }
            return false;
        },
        async content(event, trigger, player) {
            await player.addTempSkill('zshy_hongtu_using', { player: 'zshy_hongtuEnd' });
            await player.chooseDrawRecover(3, true);
            await game.delay(0.2);
            if (player.countCards('h') < 3 || !game.hasPlayer(current => player != current)) {
                return;
            };
            let result = await player.chooseCardTarget({
                prompt: '鸿图：请展示三张手牌并选择一名其他角色',
                prompt2: '你选择的角色须选择是否使用其中的一张牌，并令你随机重铸其中的另一张牌',
                position: 'h',
                filterCard: true,
                selectCard: 3,
                filterTarget: lib.filter.notMe,
                forced: true,
                hasFriend: game.hasPlayer(current => {
                    return current !== player && get.attitude(player, current) > 0;
                }),
                ai1(card) {
                    const player = get.player(),
                        val = player.getUseValue(card);
                    if (get.event().hasFriend) {
                        if (ui.selected.cards.some(cardx => {
                            return player.getUseValue(cardx) > 5;
                        })) {
                            return -val - get.value(card);
                        }
                        return val - 5;
                    }
                    if (game.hasPlayer(current => {
                        return get.attitude(get.player(), current) < 0 && !current.hasUseTarget(card);
                    })) {
                        return 100 - val;
                    }
                    return -val;
                },
                ai2(target) {
                    const att = get.attitude(get.player(), target);
                    if (!ui.selected.cards.length) {
                        return 0;
                    }
                    if (ui.selected.cards.every(card => !target.hasUseTarget(card))) {
                        return 10 * (get.damageEffect(target, player, player, 'fire') - get.damageEffect(player, player, player, 'fire'));
                    }
                    return Math.max(...ui.selected.cards.map(card => target.getUseValue(card) * att));
                },
            }).forResult();
            if (!result?.cards?.length || !result.targets?.length) {
                return;
            }
            const {
                targets: [target],
                cards,
            } = result;
            player.line(target, 'green');
            await player.showCards(cards, `${get.translation(player)}对${get.translation(target)}发动了【鸿图】`);
            const numbers = cards.map(card => get.number(card, player)).toUniqued();
            const min = Math.min(...numbers);
            const max = Math.max(...numbers);
            result = await target.chooseButton([
                `鸿图：是否使用${get.translation(player)}展示的其中一张牌？`,
                [cards.map(card => [card, (() => {
                    const num = get.number(card, player);
                    if (
                        cards.every(cardx => {
                            return cardx === card || get.number(cardx) < num;
                        })
                    ) {
                        return get.translation('zshy_feijun');
                    } else if (
                        cards.every(cardx => {
                            return cardx === card || get.number(cardx) > num;
                        })
                    ) {
                        return '手牌上限';
                    } else if (num != min && num != max) {
                        return get.translation('zshy_qianxi');
                    } else {
                        return '';
                    }
                })(),]),
                (item, type, position, noclick, node) => {
                    node = ui.create.buttonPresets.card(item[0], type, position, noclick);
                    game.createButtonCardsetion(item[1], node);
                    return node;
                },],
            ]).set('filterButton', button => {
                const player = get.player(),
                    card = button.link;
                const cardx = get.autoViewAs(
                    {
                        name: get.name(card),
                        nature: get.nature(card),
                    },
                    [card]
                );
                return player.hasUseTarget(cardx, null, false);
            }).set('ai', button => {
                return get.player().getUseValue(button.link);
            }).forResult();
            if (!result?.links?.length) {
                for (const current of [target, player]) {
                    if (!current.isIn()) {
                        continue;
                    }
                    player.line(current, 'fire');
                    await current.damage('fire');
                }
            } else {
                const {
                    links: [card],
                } = result;
                cards.remove(card);
                const cardx = get.autoViewAs({
                    name: get.name(card),
                    nature: get.nature(card),
                }, [card]
                );
                const next = target.chooseUseTarget(cardx, [card], true, false);
                if (card.name === cardx.name && get.is.sameNature(card, cardx, true)) {
                    next.set('viewAs', false);
                }
                await next;
                const restCards = cards.filter(card => {
                    return get.owner(card) === player && get.position(card) === 'h' && lib.filter.cardDiscardable(card, player, 'zshy_hongtu');
                });
                if (restCards.length) {
                    await player.recast(restCards.randomGet());
                }
                const num = get.number(card, player);
                let skill = null;
                if (cards.every(cardx => {
                    if (cardx === card) {
                        return true;
                    }
                    return get.number(cardx) < num;
                })) {
                    skill = 'zshy_feijun';
                } else if (cards.every(cardx => {
                    if (cardx === card) {
                        return true;
                    }
                    return get.number(cardx) > num;
                })) {
                    target.addSkill('zshy_hongtu_limit');
                    if (!target.storage.zshy_hongtu_limit) {
                        target.storage.zshy_hongtu_limit = [0, 0];
                    }
                    target.storage.zshy_hongtu_limit[0] += 2;
                    target.markSkill('zshy_hongtu_limit');
                } else if (num != min && num != max) {
                    skill = 'zshy_qianxi';
                }
                if (skill) {
                    let skillName = `zshy_hongtu_${player.playerid}`;
                    await target.addAdditionalSkills(skillName, [skill], true);
                    delete target.storage.zshy_hongtu_phased;
                    target.when({ player: 'phaseBegin' }).then(() => {
                        player.storage.zshy_hongtu_phased = true;
                    });
                    target.when({ player: 'phaseEnd' }).filter(() => {
                        return target.storage.zshy_hongtu_phased;
                    }).assign({
                        firstDo: true,
                        priority: Infinity,
                    }).vars({
                        skillName,
                    }).then(() => {
                        delete player.storage.zshy_hongtu_phased;
                        player.removeAdditionalSkills(skillName);
                    });
                }
            }
        },
        subSkill: {
            limit: {
                markimage: 'image/card/handcard.png',
                intro: {
                    content(storage, player) {
                        return '手牌上限+' + storage[0];
                    },
                },
                charlotte: true,
                mod: {
                    maxHandcard(player, num) {
                        return num + player.storage.zshy_hongtu_limit[0];
                    },
                },
                trigger: { player: 'phaseEnd' },
                silent: true,
                lastDo: true,
                async content(event, trigger, player) {
                    const skillName = event.name;
                    player.storage[skillName] = [player.storage[skillName][1], 0];
                    if (!player.storage[skillName][0]) {
                        player.removeSkill(skillName);
                    }
                },
            },
            using: {
                charlotte: true,
                forced: true,
            },
        },
    },
    zshy_qiwu: {//栖梧
        audio: `ext:诸神寰宇/audio/character:2`,
        trigger: { player: 'damageBegin4' },
        async cost(event, trigger, player) {
            event.result = await player.chooseCard(get.prompt(event.skill), `你可以重铸一张红色牌，防止${get.translation(trigger.source)}对你造成的${trigger.num}点伤害。`, { color: 'red' }, 'he')
                .set('ai', card => {
                    if (get.event().goon) {
                        return 6 - get.value(card);
                    }
                    return 0;
                })
                .set('goon', get.damageEffect(player, trigger.source, player) < 0)
                .forResult();
        },
        async content(event, trigger, player) {
            await player.recast(event.cards);
            trigger.cancel();
        },
        ai: {
            noDamage(player, card) {
                if (player.countCards('he', { color: 'red' }) > 0) return true;
                return false;
            },
        },
    },

    //墟谋诸葛亮
    zshy_zhitian: {//知天
        audio: `ext:诸神寰宇/audio/character:2`,
        clickableFilter(player) {
            return true;
        },
        clickable(player) {
            if (player.isUnderControl(true)) {
                const cards = lib.skill.zshy_zhitian.getCards(player);
                function createDialogWithControl(result) {
                    const dialog = ui.create.dialog('知天', 'peaceDialog');
                    result.length > 0 ? dialog.add(result, true) : dialog.addText('牌堆顶无牌');
                    const control = ui.create.control('确定', () => dialog.close());
                    dialog._close = dialog.close;
                    dialog.hide = dialog.close = function (...args) {
                        control.close();
                        return dialog._close(...args);
                    };
                    if (_status.zshy_zhitian_clickable) {
                        _status.zshy_zhitian_clickable.close();
                    }
                    _status.zshy_zhitian_clickable = dialog;
                    dialog.open();
                }
                if (cards instanceof Promise) {
                    cards.then(([ok, result]) => createDialogWithControl(result));
                } else {
                    createDialogWithControl(cards);
                }
            }
        },
        getCards(player) {
            let cards = [];
            const num = Math.max(1, 7 - player.countMark('zshy_zhitian'));
            if (game.online) {
                return game.requestSkillData('zshy_zhitian', 'getTopCards', 10000);
            } else {
                if (ui.cardPile.hasChildNodes !== false) {
                    cards = Array.from(ui.cardPile.childNodes).slice(0, num);
                }
            }
            return cards;
        },
        sync: {
            getTopCards(client) {
                if (ui.cardPile.hasChildNodes !== false) {
                    return Array.from(ui.cardPile.childNodes).slice(0, Math.max(1, 7 - client.countMark('zshy_zhitian')));
                }
                return [];
            },
        },
        mark: true,
        marktext: '牌',
        intro: {
            markcount(storage = 0, player) {
                return Math.max(1, 7 - storage);
            },
            mark(dialog, count = 0, player, event, skill) {
                const intronode = ui.create.div('.menubutton.pointerdiv', '点击发动', function () {
                    if (!this.classList.contains('disabled')) {
                        this.classList.add('disabled');
                        this.style.opacity = 0.5;
                        lib.skill[skill].clickable(player);
                    }
                });
                if (!_status.gameStarted || !player.isUnderControl(true) || !lib.skill[skill].clickableFilter(player)) {
                    intronode.classList.add('disabled');
                    intronode.style.opacity = 0.5;
                }
                dialog.addText(`观看牌数-${count}`);
                dialog.add(intronode);
            },
        },
        group: ['zshy_zhitian_huogong', 'zshy_zhitian_damage'],
        subSkill: {
            huogong: {
                enable: 'chooseToDiscard',
                filter(event, player) {
                    return event.getParent().name == 'huogong' && get.itemtype(_status.pileTop) == 'card';
                },
                async precontent(event, trigger, player) {
                    const evt = event.getParent();
                    const cards = await get.info('zshy_zhitian').getCards(player);
                    const result = await player
                        .chooseButton([`知天：请选择一张牌作为此次“火攻”需要弃置的牌`, cards])
                        .set('filterButton', button => {
                            return get.event().links.includes(button.link);
                        })
                        .set(
                            'links',
                            cards.filter(card => evt.filterCard(card, player))
                        )
                        .set('ai', button => Math.random())
                        .forResult();
                    if (result?.links?.length) {
                        const cards = result.links;
                        event.result.bool = result.bool;
                        event.result.cards = cards;
                        player.logSkill('zshy_zhitian');
                        player
                            .when('discardBegin')
                            .filter(evtx => evtx.getParent() == evt)
                            .step(async (event, trigger, player) => {
                                player.$throw(cards, 1000);
                                game.log(player, '弃置了', '#g牌堆', '的', cards);
                                trigger.setContent('cardsDiscard');
                            });
                    } else {
                        evt.goto(0);
                    }
                },
            },
            tag: {},
            damage: {
                audio: `zshy_zhitian`,
                trigger: {
                    source: 'damageEnd',
                },
                forced: true,
                filter(event, player) {
                    return player.hasMark('zshy_zhitian');
                },
                async content(event, trigger, player) {
                    player.clearMark('zshy_zhitian')
                },
            },
        },
    },
    zshy_wujing: {//武靖
        audio: `ext:诸神寰宇/audio/character:2`,
        trigger: {
            global: ['loseAfter', 'cardsDiscardAfter', 'loseAsyncAfter', 'equipAfter'],
        },
        forced: true,
        priority: 10,
        filter(event, player) {
            if (event.name.indexOf('lose') === 0) {
                if (event.getlx === false || event.position != ui.discardPile) {
                    return false;
                }
            } else if (event.name == 'cardsDiscard') {
                const evt = event.getParent();
                if (evt.relatedEvent?.name == 'useCard') {
                    return false;
                }
            }
            return event.getd?.()?.length;
        },
        async content(event, trigger, player) {
            await player.addSkill(event.name + '_effect');
        },
        group: ['zshy_wujing_draw', 'zshy_wujing_damage'],
        subSkill: {
            draw: {
                audio: 'zshy_wujing',
                trigger: {
                    global: ['loseAfter', 'cardsDiscardAfter', 'loseAsyncAfter', 'equipAfter'],
                },
                forced: true,
                priority: 9,
                filter(event, player) {
                    return get.info('zshy_wujing_draw').getEvents().indexOf(event) >= 0;
                },
                getEvents() {
                    return game.getGlobalHistory('cardMove', event => {
                        if (event.name == 'lose') {
                            if (event.position != ui.discardPile) {
                                return false;
                            }
                            return event.cards?.some(card => !event.hs?.includes(card));
                        } else if (event.name == 'cardsDiscard') {
                            const evt = event.getParent();
                            if (evt.name !== 'orderingDiscard') {
                                return true;
                            }
                            const evt2 = evt.relatedEvent || evt.getParent();
                            if (evt2) {
                                const hs = game.filterPlayer2().reduce((list, target) => {
                                    const cards = [];
                                    target.checkHistory('lose', evtx => {
                                        const evtx2 = evtx.relatedEvent || evtx.getParent();
                                        if (evtx2 !== evt2) {
                                            return false;
                                        }
                                        cards.addArray(evtx.hs);
                                    });
                                    return list.addArray(cards);
                                }, []);
                                return event.cards?.some(card => !hs.includes(card));
                            }
                        }
                        return false;
                    });
                },
                async content(event, trigger, player) {
                    await player.chooseDrawRecover(true);
                },
            },
            effect: {
                mod: {
                    cardUsable: () => Infinity,
                    targetInRange: () => true,
                },
                trigger: {
                    player: 'useCard1',
                },
                forced: true,
                charlotte: true,
                popup: false,
                firstDo: true,
                content() {
                    player.removeSkill(event.name);
                    if (trigger.addCount !== false) {
                        trigger.addCount = false;
                        const stat = player.getStat().card,
                            name = trigger.card.name;
                        if (typeof stat[name] === 'number') {
                            stat[name]--;
                        }
                    }
                },
                mark: true,
                intro: {
                    content: '使用下一张牌无次数限制',
                },
            },
            damage: {
                audio: 'zshy_wujing',
                trigger: {
                    player: 'damageEnd',
                },
                forced: true,
                async content(event, trigger, player) {
                    await player.chooseDrawRecover(true);
                },
            },
        },
    },
    zshy_zhijue: {//智绝
        audio: `ext:诸神寰宇/audio/character:2`,
        zhuanhuanji: true,
        marktext: '☯',
        mark: true,
        intro: {
            content(storage, player) {
                if (!storage) {
                    return `出牌阶段，你可将牌堆顶的一张牌当【火攻】使用，若你以此法未造成伤害，你令〖知天〗可见牌与观看牌数-1（至少减至1），然后你摸两张牌。`;
                }
                return `出牌阶段，你可将一种颜色的手牌置入弃牌堆（每种颜色每回合限一次），然后可视为使用其中一张基本牌或普通锦囊牌，若你以此法未造成伤害，你令〖知天〗可见牌与观看牌数-1（至少减至1），然后你摸两张牌。`;
            },
        },
        enable: 'phaseUse',
        filter(event, player) {
            const bool = player.storage.zshy_zhijue;
            if (!bool) {
                return event.filterCard(get.autoViewAs({ name: 'huogong' }, 'unsure'), player, event);
            }
            if (bool) {
                return player.countCards('h') > 0;
            }
            return false;
        },
        chooseButton: {
            dialog(event, player) {
                const bool = player.storage.zshy_zhijue;
                const dialog = ui.create.dialog('智绝', 'hidden');
                if (!bool) {
                    dialog.add([['huogong'], 'vcard']);
                    dialog.direct = true;
                } else {
                    const colors = player
                        .getCards('h')
                        .map(card => get.color(card, player))
                        .unique();
                    dialog.addText('请将一种颜色的手牌置入弃牌堆');
                    dialog.add([colors.map(i => [i, get.translation(i)]), 'tdnodes']);
                }
                return dialog;
            },
            filter(button) {
                if (button.link == 'huogong') {
                    return true;
                }
                return true;
            },
            check(button) {
                if (button.link == 'huogong') {
                    return true;
                }
                const player = get.player();
                return 114514 - player.countCards('h', card => get.color(card, player) == button.link);
            },
            backup(links, player) {
                const bool = player.storage.zshy_zhijue;
                const backup = get.copy(lib.skill[`zshy_zhijue_${!bool ? 'yang' : 'yin'}`]);
                if (bool) {
                    backup.filterCard = function (card, player) {
                        return get.color(card, player) == links[0];
                    };
                    backup.link = links[0];
                }
                return backup;
            },
            prompt(links, player) {
                const link = links[0];
                if (!player.storage.zshy_zhijue) {
                    return `将牌堆顶的${get.translation(_status.pileTop)}当火攻使用`;
                } else {
                    return `将${get.translation(link)}手牌置入弃牌堆`;
                }
            },
        },
        ai: {
            order: 5,
            result: {
                player: 1,
            },
        },
        subSkill: {
            backup: {},
            yang: {
                audio: 'zshy_zhijue',
                logAudio: () => ['zshy_zhijue', 3],
                filterCard: () => false,
                selectCard: -1,
                viewAs(cards, player) {
                    const event = get.event(),
                        filter = event._backup.filterCard;
                    const viewAs = {
                        name: 'huogong',
                        cards: [_status.pileTop],
                    };
                    if (filter(get.autoViewAs(viewAs, _status.pileTop), player, event)) {
                        return viewAs;
                    }
                    return null;
                },
                async precontent(event, trigger, player) {
                    //player.logSkill('zshy_zhijue');
                    player.changeZhuanhuanji('zshy_zhijue');
                    event.result.cards = get.cards(1, true);
                    player.addTempSkill('zshy_zhijue_effect');
                },
            },
            yin: {
                audio: 'zshy_zhijue',
                logAudio: () => ['zshy_zhijue4.mp3', 'zshy_zhijue5.mp3'],
                position: 'h',
                selectCard: -1,
                lose: false,
                discard: false,
                delay: false,
                async content(event, trigger, player) {
                    player.changeZhuanhuanji('zshy_zhijue');
                    const { cards } = event;
                    await player.loseToDiscardpile(cards);
                    let noDamage = true;
                    const viewAs = card => new lib.element.VCard({ name: card.name, nature: card.nature, isCard: true });
                    const cardsx = cards.filter(card => ['basic', 'trick'].includes(get.type(card)) && player.hasUseTarget(viewAs(card)));
                    if (cardsx.length) {
                        const result = await player
                            .chooseButton([`智绝：你可视为使用其中一张基本牌或普通锦囊牌`, cards])
                            .set('cards', cardsx)
                            .set('filterButton', button => get.event().cards.includes(button.link))
                            .set('ai', button => {
                                const player = get.player(),
                                    card = button.link;
                                if (player.countCards('h') == 0) {
                                    return 0;
                                }
                                return player.getUseValue({ name: card.name, nature: card.nature, isCard: true });
                            })
                            .forResult();
                        if (result?.links?.length) {
                            const card = viewAs(result.links[0]);
                            const next = player.chooseUseTarget(card, true);
                            await next;
                            if (
                                game.hasPlayer2(
                                    target =>
                                        target.hasHistory('damage', evt => {
                                            return evt.getParent('useCard', true)?.getParent() == next;
                                        }),
                                    true
                                )
                            ) {
                                noDamage = false;
                            }
                        }
                    }
                    if (noDamage && player.countMark('zshy_zhitian') < 6) {
                        await player.useResult({ skill: 'zshy_zhijue_effect' }, event);
                    }
                },
            },
            effect: {
                audio: 'zshy_zhijue',
                logAudio(event, player) {
                    const bool = player.getStorage('zshy_zhijue', false);
                    if (bool) {
                        return ['zshy_zhijue4.mp3', 'zshy_zhijue5.mp3'];
                    }
                    return ['zshy_zhijue', 3];
                },
                forced: true,
                trigger: { player: 'useCardAfter' },
                filter(event, player) {
                    return event.skill == 'zshy_zhijue_backup' && !game.hasPlayer2(target => target.hasHistory('damage', evt => evt.card == event.card), true) && player.countMark('zshy_zhitian') < 6;
                },
                async content(event, trigger, player) {
                    player.addMark('zshy_zhitian', 1, false);
                    await player.draw(2);
                },
            },
        },
    },

};
const 武动乾坤 = {
    //墟谋董卓
    zshy_guanbian: {//观变
        audio: `ext:诸神寰宇/audio/character:2`,
        trigger: {
            global: ['roundStart'],
            player: ['zshy_xiongniAfter', 'zshy_fengshangAfter'],
        },
        forced: true,
        filter(event, player, name) {
            if (name != 'roundStart') {
                return player.countMark('zshy_guanbian') > 0;
            }
            return true;
        },
        async content(event, trigger, player) {
            if (['zshy_xiongni', 'zshy_fengshang'].includes(trigger.name)) {
                await player.clearMark(event.name);
            } else {
                player.addMark(event.name, game.players.length + game.dead.length, false);
            }
        },
        mod: {
            maxHandcard(player, num) {
                return num + player.countMark('zshy_guanbian');
            },
            globalFrom(from, to, current) {
                return current + from.countMark('zshy_guanbian');
            },
            globalTo(from, to, current) {
                return current + to.countMark('zshy_guanbian');
            },
        },
        intro: {
            content: '<li>手牌上限+#<br><li>计算与其他角色的距离+#<br><li>其他角色计算与你的距离+#',
        },
    },
    zshy_xiongni: {//凶逆
        audio: `ext:诸神寰宇/audio/character:2`,
        trigger: {
            player: 'phaseUseBegin',
        },
        filter(event, player) {
            if (!game.hasPlayer(target => target != player)) {
                return false;
            }
            return true;
        },
        async cost(event, trigger, player) {
            const list = lib.suit;
            const result = await player
                .chooseControl(list, 'cancel2')
                .set('ai', function () {
                    lib.suit.randomGet();
                })
                .set('prompt', get.prompt2('zshy_xiongni'))
                .forResult();
            event.result = {
                bool: result.control != 'cancel2',
                cost_data: result.control,
            };

        },
        logTarget: (event, player) => game.filterPlayer(target => target != player).sortBySeat(),
        async content(event, trigger, player) {
            player.changeSkin({ characterName: 'zshy_AAZZdongzhuoSBFM' }, 'zshy_AAZZdongzhuoSBFM_shadow1');
            const suit = event.cost_data;
            for (const target of event.targets) {
                const { bool } = await target
                    .chooseToDiscard(`弃置一张${get.translation(suit)}牌，否则${get.translation(player)}对你造成1点伤害`, 'he', (card, player) => {
                        return get.event().suit == get.suit(card);
                    })
                    .set('ai', card => {
                        const player = get.player(),
                            target = get.event().getParent().player;
                        if (get.damageEffect(player, target, player) > 0) {
                            return 0;
                        }
                        return 7.5 - get.value(card);
                    })
                    .set('suit', suit)
                    .forResult();
                if (!bool) {
                    await target.damage();
                }
            }
        },
    },
    zshy_fengshang: {//封赏
        audio: `ext:诸神寰宇/audio/character:2`,
        getCards(player) {
            const cards = [];
            game.checkGlobalHistory('cardMove', evt => {
                if (evt.name != 'cardsDiscard' && (evt.name != 'lose' || evt.position != ui.discardPile)) {
                    return;
                }
                cards.addArray(evt.cards);
            });
            return cards.filterInD('d');
        },
        enable: 'phaseUse',
        trigger: { global: 'dying' },
        filter(event, player) {
            const cards = event.name == 'chooseToUse' ? event.zshy_fengshang_cards || [] : get.info('zshy_fengshang').getCards(player);
            if (
                !cards
                    .map(i => get.suit(i))
                    .unique()
                    .some(() => cards.length > 1)
            ) {
                return false;
            }
            return true;
        },
        onChooseToUse(event) {
            if (!game.online && !event.zshy_fengshang_cards) {
                event.set('zshy_fengshang_cards', get.info('zshy_fengshang').getCards(event.player));
            }
        },
        prompt: event => (event.name === 'chooseToUse' ? get.info('zshy_fengshang').prompt2() : get.prompt('zshy_fengshang')),
        prompt2: () => lib.translate['zshy_fengshang_info'].split('你可')[1],
        async content(event, trigger, player) {
            if (_status.connectMode) {
                game.broadcastAll(() => (_status.noclearcountdown = true));
            }
            player.changeSkin({ characterName: 'zshy_AAZZdongzhuoSBFM' }, 'zshy_AAZZdongzhuoSBFM_shadow2');
            const cards = !trigger ? event.getParent(2).zshy_fengshang_cards : get.info(event.name).getCards(player);
            const result = await player
                .chooseButtonTarget({
                    createDialog: ['封赏：选择两张牌依次分配给两名角色', cards],
                    forced: true,
                    selectButton: 2,
                    cardx: cards,
                    ai1(button) {
                        return get.buttonValue(button);
                    },
                    complexSelect: true,
                    filterTarget: true,
                    selectTarget: 2,
                    ai2(target) {
                        const player = get.player(),
                            att = get.attitude(player, target);
                        let button = ui.selected.buttons[ui.selected.targets.length];
                        if (!button?.link) {
                            return 0;
                        }
                        if (get.value(button.link, player, 'raw') < 0) {
                            return Math.max(0.01, 100 - att);
                        } else if (att > 0) {
                            if (player.getUseValue({ name: 'jiu' }) && player != target) {
                                return 10;
                            }
                            return Math.max(0.1, att / Math.sqrt(1 + target.countCards('h')));
                        } else {
                            return Math.max(0.01, (100 + att) / 200);
                        }
                    },
                })
                .forResult();
            if (_status.connectMode) {
                game.broadcastAll(() => {
                    delete _status.noclearcountdown;
                    game.stopCountChoose();
                });
            }
            const gain_list = [];
            for (let i = 0; i < result.links.length; i++) {
                const source = result.targets[i];
                player.line(source, 'green');
                game.log(source, '获得了', result.links[i]);
                gain_list.push([source, result.links[i]]);
            }
            await game.loseAsync({
                gain_list,
                giver: player,
                animate: 'gain2',
            }).setContent('gaincardMultiple');
            await game.delayx();
            if (!player.hasHistory('gain', evt => evt.getParent(2) == event) && player.hasUseTarget({ name: 'jiu', isCard: true }, true, false)) {
                await player.chooseUseTarget({ name: 'jiu', isCard: true }, true, false);
            }
        },
        ai: {
            order: 7,
            result: { player: 1 },
        },
        subSkill: {
            clear: {
                marktext: '赏',
                charlotte: true,
                onremove(player, skill) {
                    player.removeTip(skill);
                    delete player.storage[skill];
                },
                intro: { content: '本轮已赏赐过$花色的牌' },
            },
        },
    },
    zshy_zhibing: {//执柄
        audio: `ext:诸神寰宇/audio/character:2`,
        getNum(player) {
            let num = 0;
            game.countPlayer2(current => {
                if (current.group == 'qun') {
                    num += current.getAllHistory('useCard', evt => get.color(evt.card) == 'black').length;
                }
            });
            return num;
        },
        trigger: {
            global: ['useCardEnd', 'respondEnd'],
        },
        filter(event, player) {
            const num = get.info('zshy_zhibing').getNum(player);
            return (
                get.info('zshy_zhibing').filterx(player, num) || get.info('zshy_zhibing').filtery(player, num) || get.info('zshy_zhibing').filterz(player, num)
            );
        },
        filterx(player, num) {
            return (
                num >= 3 &&
                !game.getAllGlobalHistory('everything', evt => evt.name == 'gainMaxHp' && evt.player == player && evt.getParent().name == 'zshy_zhibing')
                    .length
            );
        },
        filtery(player, num) {
            return (
                num >= 6 &&
                !player.hasSkill('zshy_fencheng', null, null, false) &&
                !game.getAllGlobalHistory(
                    'everything',
                    evt =>
                        evt.name == 'changeSkills' &&
                        evt.player == player &&
                        evt.getParent().name == 'zshy_zhibing' &&
                        evt.addSkill.includes('zshy_fencheng')
                ).length
            );
        },
        filterz(player, num) {
            return (
                num >= 9 &&
                !player.hasSkill('zshy_benghuai', null, null, false) &&
                !game.getAllGlobalHistory(
                    'everything',
                    evt =>
                        evt.name == 'changeSkills' &&
                        evt.player == player &&
                        evt.getParent().name == 'zshy_zhibing' &&
                        evt.addSkill.includes('zshy_benghuai')
                ).length
            );
        },
        forced: true,
        async content(event, trigger, player) {
            const skillName = event.name,
                num = get.info(skillName).getNum(player);
            if (get.info(skillName).filterx(player, num)) {
                await player.gainMaxHp(4);
                await player.recover(4);
            }
            if (get.info(skillName).filtery(player, num)) {
                await player.addSkills('zshy_fencheng');
            }
            if (get.info(skillName).filterz(player, num)) {
                await player.addSkills('zshy_benghuai');
            }
        },
        derivation: ['zshy_fencheng', 'zshy_benghuai'],
    },

    //墟谋关羽
    zshy_weilin: {//威临
        audio: `ext:诸神寰宇/audio/character:2`,
        enable: ['chooseToUse', 'chooseToRespond'],
        filter(event, player) {
            return get.inpileVCardList(info => {
                const name = info[2];
                if (name != 'sha' && name != 'jiu') {
                    return false;
                }
                return get.type(name) == 'basic';
            }).some(card => player.hasCard(cardx => event.filterCard({ name: card[2], nature: card[3], cards: [cardx] }, player, event), 'hes'));
        },
        chooseButton: {
            dialog(event, player) {
                const list = get.inpileVCardList(info => {
                    const name = info[2];
                    if (name != 'sha' && name != 'jiu') {
                        return false;
                    }
                    return get.type(name) == 'basic';
                }).filter(card => player.hasCard(cardx => event.filterCard({ name: card[2], nature: card[3], cards: [cardx] }, player, event), 'hes'));
                return ui.create.dialog('威临', [list, 'vcard']);
            },
            filter(button, player) {
                return _status.event.getParent().filterCard(get.autoViewAs({ name: button.link[2], nature: button.link[3] }, 'unsure'), player, _status.event.getParent());
            },
            check(button) {
                if (_status.event.getParent().type != 'phase') {
                    return 1;
                }
                const player = get.event().player,
                    value = player.getUseValue({ name: button.link[2], nature: button.link[3] });
                if (button.link[2] == 'sha' && !player.getHistory('useCard', evt => get.type(evt.card) == 'basic').length) {
                    if (value > 0) {
                        return value + 20;
                    }
                }
                return value;
            },
            backup(links, player) {
                return {
                    audio: 'zshy_weilin',
                    filterCard: true,
                    popname: true,
                    check(card) {
                        const name = lib.skill.zshy_weilin_backup.viewAs.name,
                            color = get.color(card);
                        const phase = _status.event.getParent().type == 'phase';
                        if (phase && name == 'sha' && color == 'red') {
                            return 10 - get.value(card);
                        }
                        if (name == 'tao') {
                            return 7 + [-2, 0, 2][['black', 'red', 'none'].indexOf(color)] - get.value(card);
                        }
                        return 6 - get.value(card);
                    },
                    position: 'hse',
                    viewAs: { name: links[0][2], nature: links[0][3] },
                    precontent() {
                        player.addTempSkill('zshy_weilin_effect');
                    },
                    ai: {
                        directHit_ai: true,
                        skillTagFilter(player, tag, arg) {
                            if (get.event().skill != 'zshy_weilin_backup') {
                                return false;
                            }
                            return arg && arg.card && arg.card.name == 'sha' && get.color(arg.card) == 'red';
                        },
                    },
                };
            },
            prompt(links, player) {
                return '将一张牌当作' + (get.translation(links[0][3]) || '') + '【' + get.translation(links[0][2]) + '】使用';
            },
        },
        hiddenCard(player, name) {
            if (!lib.inpile.includes(name) || name != 'jiu') {
                return false;
            }
            return get.type(name) == 'basic' && !player.getStat('skill').zshy_weilin && player.countCards('hes');
        },
        ai: {
            fireAttack: true,
            respondSha: true,
            skillTagFilter(player, tag, arg) {
                if (arg == 'respond') {
                    return false;
                }
                if (player.getStat('skill').zshy_weilin || !player.countCards('hes')) {
                    return false;
                }
            },
            order(item, player) {
                if (player && _status.event.type == 'phase' && player.hasValueTarget({ name: 'sha' }, true, true)) {
                    let max = 0,
                        names = get.inpileVCardList(info => {
                            const name = info[2];
                            if (name != 'sha' && name != 'jiu') {
                                return false;
                            }
                            return get.type(name) == 'basic';
                        });
                    names = names.map(namex => {
                        return { name: namex[2], nature: namex[3] };
                    });
                    names.forEach(card => {
                        if (player.getUseValue(card) > 0) {
                            let temp = get.order(card);
                            if (card.name == 'jiu') {
                                let cards = player.getCards('hs', cardx => get.value(cardx) < 8);
                                cards.sort((a, b) => get.value(a) - get.value(b));
                                if (!cards.some(cardx => get.name(cardx) == 'sha' && !cards.slice(0, 2).includes(cardx))) {
                                    temp = 0;
                                }
                            }
                            if (temp > max) {
                                max = temp;
                            }
                        }
                    });
                    if (max > 0) {
                        max += 15;
                    }
                    return max;
                }
                return 0.5;
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
            backup: {},
            effect: {
                charlotte: true,
                trigger: { player: 'useCardToBegin' },
                filter(event, player) {
                    return event.target?.isIn() && event.skill === 'zshy_weilin_backup';
                },
                forced: true,
                popup: false,
                content() {
                    const target = trigger.target;
                    target.addTempSkill('zshy_weilin_wusheng');
                    target.markAuto('zshy_weilin_wusheng', [get.color(trigger.card)]);
                },
            },
            wusheng: {
                charlotte: true,
                onremove: true,
                mod: {
                    cardname(card, player) {
                        if (player.getStorage('zshy_weilin_wusheng').includes(get.color(card))) {
                            return 'sha';
                        }
                    },
                },
                intro: { content: '手牌中所有$牌均视为【杀】' },
            },
        },
    },
    zshy_duoshou: {//夺首
        audio: `ext:诸神寰宇/audio/character:2`,
        trigger: {
            player: ['useCard'],
            source: ['damageSource'],
        },
        filter(event, player) {
            if (event.name == 'damage' || get.color(event.card) == 'red') {
                return true;
            }
            return get.type(event.card) == 'basic';
        },
        forced: true,
        async content(event, trigger, player) {
            if (trigger.name == 'damage') {
                player.chooseDrawRecover(trigger.num, true);
            } else {
                if (get.color(trigger.card) == 'red') {
                    game.log(trigger.card, '无距离限制');
                }
                if (get.type(trigger.card) == 'basic') {
                    game.log(trigger.card, '不计入次数上限');
                    if (trigger.addCount !== false) {
                        trigger.addCount = false;
                        const stat = player.stat[player.stat.length - 1].card;
                        if (typeof stat[trigger.card.name] === 'number') {
                            stat[trigger.card.name]--;
                        }
                    }
                }
            }
        },
        mod: {
            targetInRange(card) {
                if (get.color(card) == 'red') {
                    return true;
                }
            },
        },
    },

};
const 花好月圆 = {
    //墟谋黄月英
    zshy_lixian: {//理贤
        audio: `ext:诸神寰宇/audio/character:2`,
        trigger: {
            global: ['damageEnd', 'phaseZhunbeiBegin', 'phaseJieshuBegin'],
        },
        filter(event, player) {
            if (!player.countCards('hes')) {
                return false;
            }
            if (event.name == 'damage') {
                return event.num;
            }
            return player.getStorage('zshy_lixian_triggers').includes(event.name);
        },
        async cost(event, trigger, player) {
            const list = ['wuzhong', ...player.getStorage('zshy_lixian_names')].map(name => ['', '', name]);
            if (!list.length) {
                return;
            }
            let str = ``;
            let names = player.getStorage('zshy_lixian_names')
                .map((name, i, arr) => `${i == arr.length - 1 ? "或" : "、"}【${get.translation(name)}】`)
                .join('') || '';
            let triggers = player.getStorage('zshy_lixian_triggers')
                .map(i => get.translation(i))
                .join('、') + '或';
            if (triggers.length < 2) {
                triggers = '';
            } else {
                str += `一名角色的`;
            }
            str += `${triggers}当一名角色受到伤害后，你可将一张牌当【无中生有】${names}使用，然后你回复1点体力或摸一张牌。当你以此法使用过三种不同牌名的锦囊牌后，此技能于一名角色的结束阶段也可发动。`;
            const result = await player.chooseButton([str, [list, 'vcard']])
                .set('viewAs', (button, cards) => get.autoViewAs({ name: button.link[2] }, cards ? cards : 'unsure'))
                .set('filterButton', button => {
                    const player = get.player();
                    const cards = player.getCards('hes');
                    return cards.some(card => player.hasUseTarget(get.event().viewAs(button, [card]), true, false));
                })
                .set('ai', button => get.player().getUseValue(get.event().viewAs(button)))
                .forResult();
            if (result?.links?.length) {
                event.result = {
                    bool: true,
                    cost_data: result.links[0][2],
                };
            }
        },
        async content(event, trigger, player) {
            const name = event.cost_data;
            game.broadcastAll(name => {
                lib.skill.zshy_lixian_backup.viewAs = { name: name };
            }, name);
            await player.chooseToUse(true)
                .set('openskilldialog', `将一张牌当作【${get.translation(name)}】使用`)
                .set('norestore', true)
                .set('_backupevent', `${event.name}_backup`)
                .set('custom', {
                    add: {},
                    replace: { window() { } },
                })
                .backup(`${event.name}_backup`)
                .set('targetRequired', true)
                .set('complexTarget', true)
                .set('complexSelect', true)
                .set('addCount', false);
            await player.chooseDrawRecover(true);
        },
        group: ['zshy_lixian_addTrigger'],
        subSkill: {
            addTrigger: {
                audio: 'zshy_lixian',
                forced: true,
                locked: false,
                trigger: { player: 'useCardAfter' },
                filter(event, player) {
                    return (
                        event.skill == 'zshy_lixian_backup' &&
                        !player.getStorage('zshy_lixian_triggers').includes('phaseJieshu') &&
                        player.getAllHistory('useCard', evt => evt.skill == event.skill)
                            .map(evt => evt.card.name)
                            .unique().length >= 3
                    );
                },
                async content(event, trigger, player) {
                    player.markAuto('zshy_lixian_triggers', 'phaseJieshu');
                    game.log(player, '的', '#g【理贤】', '于', '#y结束阶段', '也可发动');
                },
            },
            backup: {
                log: false,
                filterCard(card) {
                    return get.itemtype(card) == 'card';
                },
                position: 'hes',
                check(card) {
                    return 7 - get.value(card);
                },
            },
        },
    },
    zshy_bingcai: {//并才
        audio: `ext:诸神寰宇/audio/character:2`,
        trigger: {
            global: 'useCard',
        },
        filter(event, player) {
            if (!player.countCards('he')) {
                return false;
            }
            return get.type(event.card) == 'basic' || get.type(event.card) == 'trick';
        },
        async cost(event, trigger, player) {
            event.result = await player.chooseCard('he')
                .set('prompt', get.prompt(event.name.slice(0, -5)))
                .set('prompt2', '你可重铸一张牌。若重铸牌为' + (get.tag(trigger.card, 'damage') ? '' : '非') + '伤害类，则' + get.translation(trigger.card) + '对相同目标再结算一次。')
                .set('ai', card => {
                    const eff = get.event('eff');
                    if (get.tag(card, 'damage') === Boolean(eff[0])) {
                        return 6 - get.value(card) + eff[1];
                    }
                    return 6 - get.value(card);
                })
                .set('eff', [
                    Boolean(get.tag(trigger.card, 'damage')),
                    trigger.targets.reduce((acc, target) => {
                        if (trigger.card.name === 'tao' && target.getDamagedHp() < 2) {
                            return acc;
                        }
                        return acc + get.effect(target, trigger.card, trigger.player, player);
                    }, 0),
                ])
                .forResult();
        },
        async content(event, trigger, player) {
            await player.recast(event.cards);
            const card = event.cards[0];
            if (Boolean(get.tag(card, 'damage')) === Boolean(get.tag(trigger.card, 'damage'))) {
                trigger.effectCount++;
                if (
                    (get.mode() !== 'identity' || player.identity !== 'nei') &&
                    trigger.targets.reduce((acc, target) => {
                        if (trigger.card.name === 'tao' && target.getDamagedHp() < 2) {
                            return acc;
                        }
                        return acc + get.effect(target, trigger.card, trigger.player, player);
                    }, 0) > 6
                ) {
                    player.addExpose(0.16);
                }
            }
            if (get.type2(card, player) == 'trick' && player.getStorage('zshy_lixian_names').length < 3) {
                const list = ['shunshou', 'guohe', 'tiesuo'].removeArray(player.getStorage('zshy_lixian_names')).map(i => ['trick', '', i]);
                let result;
                list.length == 1
                    ? (result = { bool: true, links: list })
                    : (result = await player
                        .chooseButton([`并才：为【理贤】添加一个牌名`, [list, 'vcard']], true)
                        .set('ai', button => get.player().getUseValue(get.autoViewAs({ name: button.link[2] })))
                        .forResult());
                if (result?.links?.length) {
                    const name = result.links[0][2];
                    player.markAuto('zshy_lixian_names', name);
                    game.log(player, '的', '#g【理贤】', '增加牌名', '#y' + get.translation(name));
                    if (player.getStorage('zshy_lixian_names').length >= 3) {
                        player.markAuto('zshy_lixian_triggers', 'phaseZhunbei');
                        game.log(player, '的', '#g【理贤】', '于', '#y准备阶段', '也可发动');
                    }
                }
            }
        },
    },

    //墟谋小乔
    zshy_miluo: {//迷落
        audio: `ext:诸神寰宇/audio/character:2`,
        enable: 'phaseUse',
        usable: 1,
        filter(event, player) {
            return player.countCards('h') && game.hasPlayer(target => target != player);
        },
        filterCard: true,
        position: 'he',
        selectCard: () => [1, Infinity],
        filterTarget: lib.filter.notMe,
        selectTarget: () => ui.selected.cards.length,
        targetprompt() {
            const links = ui.selected.cards;
            return ['获得', get.translation(links[ui.selected.targets.length - 1])].join('<br>');
        },
        check(card) {
            const player = get.player();
            if (
                ui.selected.cards.length >=
                game.countPlayer(current => {
                    return current != player && get.attitude(player, current) > 0;
                })
            ) {
                return 0;
            }
            return 6 - get.value(card);
        },
        multiline: true,
        multitarget: true,
        complexSelect: true,
        lose: false,
        discard: false,
        delay: false,
        async content(event, trigger, player) {
            const { targets, cards: links } = event;
            await player.showCards(links, get.translation(player) + '发动了【' + get.translation(event.name) + '】');
            const gain_list = targets.map((target, i) => [target, [links[i]]]);
            await game
                .loseAsync({
                    gain_list: gain_list,
                    player: player,
                    cards: links,
                    giver: player,
                    animate: 'give',
                    gaintag: ['zshy_miluo'],
                })
                .setContent('gaincardMultiple');
            player.addTempSkill(event.name + '_clear', 'roundStart');
            player.markAuto(event.name + '_clear', targets);
        },
        group: ['zshy_miluo_end'],
        subSkill: {
            clear: {
                charlotte: true,
                onremove(player, skill) {
                    player.storage[skill].forEach(target => {
                        target.removeGaintag('zshy_miluo');
                    });
                    delete player.storage[skill];
                },
            },
            end: {
                audio: 'zshy_miluo',
                trigger: {
                    global: 'phaseEnd',
                },
                filter(event, player) {
                    return game.hasPlayer(function (target) {
                        return target != player;
                    });
                },
                async cost(event, trigger, player) {
                    const next = player.chooseTarget(`###${get.prompt(event.skill)}###令任意名没有「迷落」牌的角色失去1点体力，或令任意名有「迷落」牌的角色回复1点体力。`, [1, Infinity], (card, player, target) => {
                        return target != player;
                    }).set('ai', target => {
                        const player = get.player();
                        if (target.countCards('h', card => card.hasGaintag('zshy_miluo'))) {
                            return get.recoverEffect(target, player, player);
                        }
                        return get.effect(target, { name: 'losehp' }, player, player);
                    });
                    next.set(
                        'targetprompt2',
                        next.targetprompt2.concat([
                            target => {
                                if (!target.isIn() || !get.event().filterTarget(null, get.player(), target)) {
                                    return false;
                                }
                                return target.countCards('h', card => card.hasGaintag('zshy_miluo')) ? '回复体力' : '失去体力';
                            },
                        ])
                    );
                    event.result = await next.forResult();
                },
                async content(event, trigger, player) {
                    let target = event.targets.sortBySeat();
                    Promise.all(target.map(function (target) {
                        if (target.countCards('h', card => card.hasGaintag('zshy_miluo'))) {
                            if (target.isDamaged()) {
                                target.recover();
                            }
                        } else {
                            target.loseHp();
                        }
                    }))
                },
            },
        },
        ai: {
            order: 5,
            result: {
                player: 1,
            },
        },
    },
    zshy_MXQjueyan: {//绝颜
        audio: `ext:诸神寰宇/audio/character:2`,
        enable: ['chooseToUse', 'chooseToRespond'],
        hiddenCard(player, name) {
            const storage = player.getStorage('zshy_MXQjueyan_round');
            return player.hasCard(card => {
                const type = get.type(card, player);
                if (type == 'trick' || type == 'basic') {
                    return !storage.includes(name) && get.name(card, player) == name;
                }
                return false;
            }, 'h');
        },
        filter(event, player) {
            const storage = player.getStorage('zshy_MXQjueyan_round');
            return player.hasCard(card => {
                const type = get.type(card, player);
                if (type == 'trick' || type == 'basic') {
                    return (event.filterCard(
                        get.autoViewAs({
                            name: get.name(card, player),
                            suit: 'none',
                            nature: get.nature(card, player),
                            number: null,
                            isCard: true,
                        }),
                        player, event) && !storage.includes(get.name(card, player))
                    );
                }
                return false;
            }, 'h');
        },
        filterCard(card, player, event) {
            event = event || _status.event;
            const storage = player.getStorage('zshy_MXQjueyan_round');
            const type = get.type(card, player);
            if (type == 'trick' || type == 'basic') {
                return (
                    event._backup.filterCard(
                        get.autoViewAs({
                            name: get.name(card, player),
                            suit: 'none',
                            nature: get.nature(card, player),
                            number: null,
                            isCard: true,
                        }),
                        player,
                        event
                    ) && !storage.includes(get.name(card, player))
                );
            }
            return false;
        },
        ignoreMod: true,
        position: 'h',
        viewAs(cards, player) {
            if (cards.length) {
                const card = cards[0];
                return {
                    name: get.name(card, player),
                    suit: 'none',
                    nature: get.nature(card, player),
                    number: null,
                    isCard: true,
                };
            }
            return null;
        },
        prompt: '展示并视为使用手牌中一张普通锦囊牌或基本牌',
        async precontent(event, trigger, player) {
            const cards = event.result.cards;
            const name = get.name(event.result.card);
            player.addTempSkill('zshy_MXQjueyan_round');
            player.markAuto('zshy_MXQjueyan_round', name);
            await player.showCards(cards, `${get.translation(player)}发动了【绝颜】`);
            delete event.result.cards;
        },
        ai: {
            order: 7,
            result: {
                player: 1,
            },
        },
        group: ['zshy_MXQjueyan_draw'],
        subSkill: {
            round: {
                charlotte: true,
                onremove: true,
                intro: {
                    content: '已使用过 $',
                },
            },
            draw: {
                audio: 'zshy_MXQjueyan',
                trigger: {
                    player: ['damageEnd', 'showCardsAfter'],
                },
                forced: true,
                locked: false,
                async content(event, trigger, player) {
                    let num = 1;
                    if (trigger?.cards?.length) {
                        num = Math.max(1, trigger.cards.length);
                    }
                    await player.chooseDrawRecover(num, true);
                },
            },
        },
    },

};
const 计出万全 = {
};
const 施仁布德 = {
};
const 奋勇扬威 = {
    //墟谋孙坚
    zshy_hulie: {//虎烈
        audio: `ext:诸神寰宇/audio/character:2`,
        trigger: {
            player: 'useCardToPlayered',
        },
        filter(event, player) {
            return event.targets.length == 1 && get.tag(event.card, 'damage') > 0.5;
        },
        check(event, player) {
            return get.attitude(player, event.targets[0]) <= 0;
        },
        logTarget: event => event.targets[0],
        async content(event, trigger, player) {
            const evt = trigger.getParent();
            if (typeof evt.baseDamage != 'number') {
                evt.baseDamage = 1;
            }
            evt.baseDamage++;
            const target = trigger.targets[0],
                sha = get.autoViewAs({ name: 'sha', isCard: true });
            player
                .when('useCardAfter')
                .filter(
                    evt =>
                        evt == trigger.getParent() &&
                        target.canUse(sha, player, false) &&
                        target.isIn() &&
                        !game.hasPlayer2(current => {
                            return current.hasHistory('damage', evtx => evtx.card === evt.card);
                        })
                )
                .step(async (event, trigger, player) => {
                    const { bool } = await player
                        .chooseBool('虎烈', `是否令${get.translation(target)}视为对你使用一张杀？`)
                        .set('choice', get.effect(player, sha, target, player) > 0)
                        .forResult();
                    if (bool) {
                        await target.useCard(sha, player, false);
                    }
                });
        },
    },
    zshy_yipo: {//毅魄
        audio: `ext:诸神寰宇/audio/character:2`,
        trigger: {
            player: ['changeHp', 'phaseZhunbeiBegin'],
        },
        async cost(event, trigger, player) {
            player.getHistory('custom').push({
                zshy_yipo_num: player.getHp(),
            });
            event.result = await player
                .chooseTarget(get.prompt2(event.name.slice(0, -5)))
                .set('ai', target => {
                    const player = get.player();
                    if (player.getDamagedHp() == 1 && target.countCards('he') == 0) {
                        return 0;
                    }
                    if (get.attitude(player, target) > 0) {
                        return 10 + get.attitude(player, target);
                    }
                    if (player.getDamagedHp() == 1) {
                        return -1;
                    }
                    return 1;
                })
                .forResult();
        },
        async content(event, trigger, player) {
            const num = player.getDamagedHp() + 1;
            const [target] = event.targets;
            const str1 = '摸' + get.cnNumber(num, true) + '回一';
            const str2 = '弃' + get.cnNumber(num, true) + '伤一';
            const result = await player
                .chooseControl(str1, str2, function (event, player) {
                    return _status.event.choice;
                })
                .set('choice', get.attitude(player, target) > 0 ? str1 : str2)
                .set('prompt', '毅魄：请选择一项')
                .forResult();
            if (result?.control == str1) {
                await target.draw(num);
                await target.recover();
            }
            else if (result?.control == str2) {
                await target.chooseToDiscard(num, true, 'he', 'allowChooseAll');
                await target.damage();
            }
        },
        ai: {
        },
    },

};
const 达权通变 = {
};

const skill_AG = {
    ...谋定天下, ...武动乾坤, ...花好月圆, ...计出万全, ...施仁布德, ...奋勇扬威, ...达权通变,
};

export default skill_AG;
