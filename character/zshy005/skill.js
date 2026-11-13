import { lib, game, ui, get, ai, _status } from '../../../../noname.js'
const 颍川荀氏 = {
    zshy_daojie: {//蹈节
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AAZZxuncaiYCXS: 'zshy_daojie_zshy_AAZZxuncaiYCXS',
            zshy_AAZZxuncanYCXS: 'zshy_daojie_zshy_AAZZxuncanYCXS',
            zshy_AAZZxunchenYCXS: 'zshy_daojie_zshy_AAZZxunchenYCXS',
            zshy_AAZZxunshiYCXS: 'zshy_daojie_zshy_AAZZxunshiYCXS',
            zshy_AAZZxunshuYCXS: 'zshy_daojie_zshy_AAZZxunshuYCXS',
            zshy_AAZZxunyouYCXS: 'zshy_daojie_zshy_AAZZxunyouYCXS'
        },
        trigger: { player: 'useCardAfter' },
        filter(event, player) {
            const cards = get.name(event.card, null, false);
            return get.type(event.card, null, false) == 'trick' &&
                event.cards.filterInD().length > 0 &&
                player.getHistory('useCard', evt => {
                    return get.name(evt.card, null, false) == cards;
                }).indexOf(event) === 0;
        },
        forced: true,
        clanSkill: true,
        async content(event, trigger, player) {
            const skills = player.getSkills(null, false, false).filter(skill => {
                let info = get.info(skill);
                if (!info || info.charlotte || !get.is.locked(skill) || get.skillInfoTranslation(skill, player).length == 0) {
                    return false;
                }
                return true;
            });
            let result;
            if (!skills.length) {
                result = { bool: false };
            } else {
                result = await player.chooseButton(['蹈节：失去一个锁定技，或点“取消”失去1点体力', [skills, 'skill']])
                    .set('displayIndex', false)
                    .set('ai', button => {
                        const player = get.player();
                        const skills = get.event().listx.slice();
                        skills.removeArray(['zshy_baichu']);
                        const { link } = button;
                        if (skills.includes(link)) {
                            return 0;
                        }
                        const info = get.info(link);
                        if (info?.ai?.neg || info?.ai?.halfneg) {
                            return 3;
                        }
                        if (get.effect(player, { name: 'losehp' }, player, player) >= 0 || player.hp > 3 || player.countCards('hs', card => player.canSaveCard(card, player))) {
                            return 0;
                        }
                        if (Math.random() < 0.75 && link == 'zshy_daojie') {
                            return 2;
                        }
                        return 1;
                    })
                    .set('listx', skills)
                    .forResult();
            }
            if (result?.bool && result?.links?.length) {
                await player.removeSkills(result.links);
            } else {
                await player.loseHp();
            }
            const targets = game.filterPlayer(current => current == player || current.hasClan('颍川荀氏'));
            if (!targets.length || !trigger.cards.someInD()) {
                return;
            }
            result =
                targets.length == 1
                    ? { bool: true, targets }
                    : await player
                        .chooseTarget('蹈节：将' + get.translation(trigger.cards.filterInD()) + '交给一名颍川荀氏角色', true, (card, player, target) => {
                            return target == player || target.hasClan('颍川荀氏');
                        })
                        .set('ai', target => get.attitude(get.player(), target))
                        .forResult();
            if (result?.bool && result?.targets?.length) {
                const target = result.targets[0];
                player.line(target, 'green');
                if (trigger.cards.someInD()) {
                    await target.gain(trigger.cards.filterInD(), player, 'gain2');
                }
            }
        },
        subSkill: {
            zshy_AAZZxuncaiYCXS: { audio: 'ext:诸神寰宇/audio/character:2' },
            zshy_AAZZxuncanYCXS: { audio: 'ext:诸神寰宇/audio/character:2' },
            zshy_AAZZxunchenYCXS: { audio: 'ext:诸神寰宇/audio/character:2' },
            zshy_AAZZxunshiYCXS: { audio: 'ext:诸神寰宇/audio/character:2' },
            zshy_AAZZxunshuYCXS: { audio: 'ext:诸神寰宇/audio/character:2' },
            zshy_AAZZxunyouYCXS: { audio: 'ext:诸神寰宇/audio/character:2' },
        },
    },

    //墟族荀采
    zshy_lieshi: {//烈誓
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        filter(event, player) {
            return player.countCards('h', card => ['sha', 'shan'].includes(get.name(card))) > 0 || player.hp > 0;
        },
        prompt: '出牌阶段，你可以选择一项，然后令一名其他角色从你未选择的选项中选择一项：①受到你造成的1点火焰伤害；②弃置所有【闪】；③弃置所有【杀】',
        chooseButton: {
            dialog(event, player) {
                var dialog = ui.create.dialog('烈誓：选择一项', 'hidden');
                dialog.add([lib.skill.zshy_lieshi.choices.slice(), 'textbutton']);
                return dialog;
            },
            filter(button, player) {
                var link = button.link;
                if (link == 'damage') {
                    return true;
                }
                var num = player.countCards('h', link);
                return num > 0 && num == player.getDiscardableCards(player, 'h').filter(i => get.name(i) == link).length;
            },
            check(button) {
                var player = _status.event.player;
                switch (button.link) {
                    case 'damage':
                        if (get.damageEffect(player, player, player, 'fire') >= 0) {
                            return 10;
                        }
                        if (player.hp >= Math.max(2, 3 - player.getFriends().length) && game.countPlayer(current => get.attitude(player, current) < 0 && current.countCards('h', card => ['sha', 'shan'].includes(get.name(card))))) {
                            return 0.8 + Math.random();
                        }
                        return 0;
                    case 'shan':
                        if (player.countCards('h', 'shan') == 1) {
                            return 8 + Math.random();
                        }
                        return 1 + Math.random();
                    case 'sha':
                        if (player.countCards('h', 'sha') == 1) {
                            return 8 + Math.random();
                        }
                        return 0.9 + Math.random();
                }
            },
            backup(links) {
                var next = get.copy(lib.skill['zshy_lieshi_backupx']);
                next.choice = links[0];
                return next;
            },
            prompt(links) {
                if (links[0] == 'damage') {
                    return '受到1点火焰伤害';
                }
                return '弃置所有【' + get.translation(links[0]) + '】';
            },
        },
        choices: [
            ['damage', '受到1点火焰伤害'],
            ['shan', '弃置所有【闪】'],
            ['sha', '弃置所有【杀】'],
        ],
        ai: {
            order(item, player) {
                if (!player) {
                    return;
                }
                var eff = get.damageEffect(player, player, player, 'fire'),
                    disabled = !player.isDisabledJudge();
                if ((player.countCards('h', 'sha') == 1 || player.countCards('h', 'shan') == 1) && eff < 0 && !disabled) {
                    return 8;
                } else if (eff >= 0 && !disabled) {
                    return 5.8;
                }
                if (!disabled && !player.countCards('h', card => ['sha', 'shan'].includes(get.name(card)))) {
                    if ((!player.hasSkill('zshy_huanyin') || !player.canSave(player)) && player.hp <= 1) {
                        return 0;
                    }
                    if (player.canSave(player) && player.hp == 1 && player.countCards('h') <= 1) {
                        return 2.6;
                    }
                    if (player.hp < Math.max(2, 3 - player.getFriends().length) || !game.countPlayer(current => get.attitude(player, current) < 0 && current.countCards('h', card => ['sha', 'shan'].includes(get.name(card))))) {
                        return 0;
                    }
                }
                return 2.5;
            },
            expose: 0.2,
            result: { player: 1 },
        },
        subSkill: {
            backup: {},
            backupx: {
                audio: 'zshy_lieshi',
                selectCard: -1,
                selectTarget: -1,
                filterCard: () => false,
                filterTarget: () => false,
                multitarget: true,
                content() {
                    'step 0';
                    var choice = lib.skill.zshy_lieshi_backup.choice;
                    event.choice = choice;
                    if (choice == 'damage') {
                        player.damage('fire');
                    } else {
                        var cards = player.getCards('h', choice);
                        if (cards.length) {
                            player.discard(cards);
                        }
                    }
                    'step 1';
                    if (!player.isIn() || !game.hasPlayer(current => current != player)) {
                        event.finish();
                    } else {
                        player.chooseTarget('烈誓：令一名其他角色选择另一项', lib.filter.notMe, true).set('ai', target => {
                            var player = _status.event.player,
                                chosen = _status.event.getParent().choice,
                                att = get.attitude(player, target);
                            if (chosen == 'damage') {
                                if (att > 0) {
                                    return 0;
                                }
                                return -att / 2 + target.countCards('h', card => ['sha', 'shan'].includes(get.name(card)));
                            }
                            return get.damageEffect(target, player, player, 'fire');
                        });
                    }
                    'step 2';
                    if (result.bool) {
                        var target = result.targets[0];
                        event.target = target;
                        player.line(target, 'fire');
                        var list = [],
                            choice = event.choice;
                        var choiceList = lib.skill.zshy_lieshi.choices.slice();
                        choiceList = choiceList.map((link, ind, arr) => {
                            link = link[1];
                            var ok = true;
                            if (arr[ind][0] == choice) {
                                link += '（' + get.translation(player) + '已选）';
                                ok = false;
                            }
                            if (ind == 0) {
                                if (target.isDisabledJudge()) {
                                    ok = false;
                                }
                            } else if (ind > 0) {
                                var name = ind == 1 ? 'shan' : 'sha';
                                if (!target.countCards('h', name)) {
                                    ok = false;
                                }
                            }
                            if (!ok) {
                                link = '<span style="opacity:0.5">' + link + '</span>';
                            } else {
                                list.push('选项' + get.cnNumber(ind + 1, true));
                            }
                            return link;
                        });
                        if (!list.length) {
                            game.log(target, '没有能执行的选项');
                            event.finish();
                            return;
                        }
                        target.chooseControl(list).set('choiceList', choiceList)
                            .set('ai', () => {
                                var controls = _status.event.controls.slice(),
                                    player = _status.event.player,
                                    user = _status.event.getParent().player;
                                if (controls.length == 1) {
                                    return controls[0];
                                }
                                if (controls.includes('选项一') && get.damageEffect(player, user, player, 'fire') >= 0) {
                                    return '选项一';
                                }
                                if (controls.includes('选项一') && player.hp <= 2 && player.countCards('h', card => ['sha', 'shan'].includes(get.name(card))) <= 3) {
                                    controls.remove('选项一');
                                }
                                if (controls.length == 1) {
                                    return controls[0];
                                }
                                if (player.getCards('h', 'sha').reduce((p, c) => p + get.value(c, player), 0) > player.getCards('h', 'sha').reduce((p, c) => p + get.value(c, player), 0)) {
                                    if (controls.includes('选项三')) {
                                        return '选项三';
                                    }
                                } else if (controls.includes('选项二')) {
                                    return '选项二';
                                }
                                return controls.randomGet();
                            });
                    } else {
                        event.finish();
                    }
                    'step 3';
                    if (result.control == '选项一') {
                        target.damage('fire');
                    } else {
                        var cards = target.getCards('h', result.control == '选项二' ? 'shan' : 'sha');
                        if (cards.length) {
                            target.discard(cards);
                        }
                    }
                },
            },
        },
    },
    zshy_dianzhan: {//点盏
        audio: 'ext:诸神寰宇/audio/character:2',
        intro: {
            content: '已使用过的花色：$',
            onunmark: true,
        },
        trigger: { player: 'useCardAfter' },
        forced: true,
        filter(event, player) {
            if (!lib.suit.includes(get.suit(event.card))) {
                return false;
            }
            const suit = get.suit(event.card);
            return (event.targets && event.targets.length == 1 && !event.targets[0].isLinked()) || player.hasCard(card => get.suit(card) == get.suit(event.card) && player.canRecast(card), 'h');
        },
        content() {
            'step 0';
            if (trigger.targets && trigger.targets.length == 1) {
                trigger.targets[0].link(true);
                event.link = true;
            }
            var cards = player.getCards('h', card => get.suit(card) == get.suit(trigger.card) && player.canRecast(card));
            if (cards.length > 0) {
                player.recast(cards);
                event.recast = true;
            }
            'step 1';
            if (event.link && event.recast) {
                player.chooseDrawRecover(true);
            }
        },
    },
    zshy_huanyin: {//还阴
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'dying' },
        forced: true,
        filter(event, player) {
            return player.countCards('h') != 4;
        },
        async content(event, trigger, player) {
            let num = player.countCards('h');
            if (num > 4) {
                await player.chooseToDiscard('h', num - 4, true);
            }
            await player.drawTo(4);
            await player.recoverTo(1);
        },
    },

    //墟族荀粲
    zshy_yunshen: {//熨身
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        filterTarget(card, player, target) {
            return player != target && target.isDamaged();
        },
        prompt: '出牌阶段，你可以令一名其他角色回复1点体力，然后选择一项：①你视为对其造成1点冰冻伤害；②其视为对你造成1点冰冻伤害',
        content() {
            'step 0';
            target.recover();
            'step 1';
            var name = get.translation(target);
            player.chooseControl()
                .set('choiceList', ['你视为对' + name + '造成1点冰冻伤害', name + '视为对你造成1点冰冻伤害'])
                .set('prompt', '熨身：请选择一项')
                .set('ai', () => _status.event.choice)
                .set('choice', (function () {
                    var card = {
                        name: 'sha',
                        nature: 'ice',
                        isCard: true,
                    };
                    var eff = get.damageEffect(player, target, player, 'ice'),
                        eff2 = get.damageEffect(target, player, player, 'ice');
                    if (eff > eff2) {
                        return '选项一';
                    } else {
                        return '选项二';
                    }
                })()
                );
            'step 2';
            var players = [target, player];
            if (result.control == '选项二') {
                players.reverse();
            }
            players[0].damage('ice', players[1]);
        },
        ai: {
            order: 2,
            expose: 0.2,
            result: {
                target(player, target) {
                    var eff = get.recoverEffect(target, player, player);
                    if (eff > 0) {
                        return 1;
                    }
                    return 0;
                },
            },
        },
    },
    zshy_shangshen: {//伤神
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: 'damageEnd' },
        filter(event, player) {
            return event.hasNature() && event.player.isIn() && (event.player.countCards('h') < 4 || event.player.hp < 4);
        },
        logTarget: 'player',
        check(event, player) {
            if (get.attitude(player, event.player) <= 2) {
                return false;
            }
            if (event.player.countCards('h') > 3 && event.player.hp > 3) {
                return false;
            }
            return true;
        },
        prompt2: '当一名角色受到属性伤害后，若其<span class=thundertext>体力</span>/<span class=firetext>手牌</span>不足四张，则你可以执行目标角色为你的【闪电】效果，然后其将<span class=thundertext>体力回复至4点</span>/<span class=firetext>手牌数补至四张</span>',
        async content(event, trigger, player) {
            if (trigger.player.hp < 4) {
                player.executeDelayCardEffect('shandian');
                await trigger.player.recoverTo(4);
            }
            if (trigger.player.countCards('h') < 4) {
                player.executeDelayCardEffect('shandian');
                await trigger.player.drawTo(4);
            }
        },
        ai: { expose: 0.25 },
    },
    zshy_fenchai: {//分钗
        audio: 'ext:诸神寰宇/audio/character:2',
        init(player) {
            if (player.getStorage('zshy_fenchai').length > 0) {
                return;
            }
            var history = player.getHistory('useSkill', evt => {
                if (evt.type != 'player') {
                    return false;
                }
                var skill = get.sourceSkillFor(evt),
                    targets = evt.targets;
                var info = get.info(skill);
                if (!info || info.charlotte) {
                    return false;
                }
                if (targets && targets.length) {
                    if (targets.filter(i => player.differentSexFrom(i)).length > 0) {
                        return true;
                    }
                }
                return false;
            });
            if (history.length) {
                var evt = history[0],
                    targets = evt.targets;
                player.markAuto(
                    'zshy_fenchai',
                    targets.filter(i => player.differentSexFrom(i))
                );
            }
        },
        trigger: {
            player: ['logSkillBegin', 'useSkill'],
        },
        forced: true,
        silent: true,
        onremove: true,
        marktext: '钗',
        intro: {
            content: (storage, player) => '对象：' + get.translation(storage),
        },
        group: 'zshy_fenchai_audio',
        filter(event, player) {
            if (event.type != 'player') {
                return false;
            }
            var targets = event.targets;
            if (!targets || !targets.length) {
                return false;
            }
            var info = get.info(get.sourceSkillFor(event));
            if (!info || info.charlotte) {
                return false;
            }
            if (player.getStorage('zshy_fenchai').length != 0) {
                return false;
            }
            return targets.filter(i => player.differentSexFrom(i)).length > 0;
        },
        content() {
            player.markAuto(
                'zshy_fenchai',
                trigger.targets.filter(i => player.differentSexFrom(i))
            );
        },
        subSkill: {
            audio: {
                audio: 'zshy_fenchai',
                forced: true,
                trigger: { player: 'judge' },
                filter(event, player) {
                    return player.getStorage('zshy_fenchai').length;
                },
                content() { },
            },
        },
        mod: {
            suit(card, suit) {
                var player = get.owner(card) || _status.event.player;
                if (!player || !player.judging || player.judging[0] != card) {
                    return;
                }
                var storage = player.getStorage('zshy_fenchai');
                if (!storage.length) {
                    return;
                }
                return storage.filter(i => i.isIn()).length > 0 ? 'heart' : 'spade';
            },
        },
    },

    //墟族荀谌
    zshy_sankuang: {//三恇
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: ['useCardAfter', 'respondAfter'] },
        direct: true,
        locked: true,
        filter(event, player) {
            return game.countPlayer(function (current) {
                return current != player && current.countGainableCards(player, 'he') > 0;
            });
        },
        async content(event, trigger, player) {
            let str = '选择一名其他角色并获得其一至三张牌，若其未失去所有手牌，则其于装备区或处理区内获得你使用的牌对应的所有实体牌';
            const result = await player.chooseTarget(get.prompt('zshy_sankuang'), str, function (card, player, target) {
                return target != player && target.countCards('he') > 0 && !target.hasSkill('zshy_sankuang_After');
            }).set('ai', function (target) {
                return get.effect(target, { name: 'guohe_copy2' }, player, player);
            }).forResult();
            if (result && result.targets) {
                let num = 3, target = result.targets[0];
                await player.gainPlayerCard(target, '三恇：请选择获得' + get.translation(target) + '的一至三张牌', 'he', [1, num], true);
                player.logSkill('zshy_sankuang', target);
                if (target.countCards('h') != 0) {
                    if (trigger.cards.filterInD().length) {
                        await target.gain(trigger.cards.filterInD(), 'gain2', 'bySelf');
                    } else if (trigger.cards.filterInD('e').length) {
                        await target.gain(trigger.cards.filterInD('e'), get.owner(trigger.cards.filterInD('e')[0]), 'give');
                    };
                };
            }
        },
        ai: {
            expose: 0.8,
            threaten: 0.8,
        },
    },
    zshy_beishi: {//卑势
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: ['gainAfter'] },
        forced: true,
        filter(event, player) {
            return event.cards.length > 1;
        },
        async content(event, trigger, player) {
            await player.chooseDrawRecover(true);
        },
        ai: { combo: 'zshy_sankuang' },
    },

    //墟族荀莳
    zshy_qingjue: {//清绝
        audio: 'ext:诸神寰宇/audio/character:2',
        forced: true,
        trigger: {
            player: 'changeHpAfter',
        },
        isOnlySuit(card, player) {
            return !player.hasCard(cardx => cardx != card && get.suit(cardx) == get.suit(card), 'h');
        },
        init(player, skill) {
            player.addSkill(`${skill}_mark`);
        },
        onremove(player, skill) {
            player.removeSkill(`${skill}_mark`);
        },
        filter(event, player) {
            return player.countDiscardableCards(player, 'h') > 0;
        },
        async content(event, trigger, player) {
            const result = await player
                .chooseToDiscard(`###${get.translation(event.name)}###弃置任意张手牌，并执行等量项`, 'h', [1, Infinity], true, 'allowChooseAll')
                .set('ai', function (card) {
                    return 7 - get.value(card);
                })
                .forResult();
            const { cards } = result;
            const resultx =
                cards.length > 1
                    ? { bool: true, links: ['give', 'gain'] }
                    : await player
                        .chooseButton(
                            [
                                `清绝：执行${get.cnNumber(Math.min(cards.length, 2))}项`,
                                [
                                    [
                                        ['give', `将${get.translation(cards)}交给其他角色`],
                                        ['gain', `回复1点体力并获得未拥有花色的牌各一张（${get.translation(lib.suit.filter(suit => !player.hasCard({ suit: suit }, 'h')))}）`],
                                    ],
                                    'textbutton',
                                ],
                            ],
                            true
                        )
                        .set('ai', button => {
                            if (button.link == 'gain') {
                                if (player.countCards('h') < 3 || player.hp < 3) {
                                    return 2;
                                }
                                return 1;
                            }
                            if (button.link == 'give') {
                                if (game.hasPlayer(target => target != get.player() && get.attitude(get.player(), target) > 0)) {
                                    return 2;
                                }
                                return 0.7;
                            }
                            return 1;
                        })
                        .forResult();
            const { links } = resultx;
            if (links?.includes('give') && game.hasPlayer(target => target != player) && cards?.someInD('d')) {
                const toGive = cards?.filterInD('d');
                const result = await player
                    .chooseTarget(true, lib.filter.notMe)
                    .set('createDialog', [`清绝：将这些牌交给一名其他角色`, toGive, [dialog => dialog.buttons.forEach(button => button.style.setProperty('opacity', '1', 'important')), 'handle']])
                    .set('toGive', toGive)
                    .set('ai', target => get.attitude(get.player(), target) * get.value(get.event().toGive, target))
                    .forResult();
                const {
                    targets: [target],
                } = result;
                player.line(target);
                const next = target.gain(toGive, 'gain2');
                next.giver = player;
                await next;
            }
            if (links?.includes('gain')) {
                player.recover();
                const hs = player.getCards('h').map(i => get.suit(i));
                const suits = lib.suit.slice().removeArray(hs);
                if (suits?.length) {
                    const cards = [];
                    for (const suit of suits) {
                        const card = get.cardPile(i => get.suit(i) == suit);
                        if (card) {
                            cards.push(card);
                        }
                    }
                    if (cards.length) {
                        await player.gain(cards, 'gain2');
                    }
                }
            }
        },
        mod: {
            ignoredHandcard(card, player) {
                if (get.info('zshy_qingjue').isOnlySuit(card, player)) {
                    return true;
                }
            },
            cardDiscardable(card, player, name) {
                if (name == 'phaseDiscard') {
                    if (get.info('zshy_qingjue').isOnlySuit(card, player)) {
                        return false;
                    }
                }
            },
        },
        subSkill: {
            mark: {
                //太棒了，是宝宝标记，我们有救了！
                charlotte: true,
                init(player, skill) {
                    player.removeGaintag(skill);
                    player.addGaintag(
                        player.getCards('h', card => get.info('zshy_qingjue').isOnlySuit(card, player)),
                        skill
                    );
                },
                onremove(player, skill) {
                    player.removeGaintag(skill);
                },
                trigger: {
                    player: ['loseEnd', 'enterGame'],
                    global: ['gainEnd', 'equipEnd', 'addJudgeEnd', 'loseAsyncEnd', 'addToExpansionEnd', 'phaseBefore'],
                },
                silent: true,
                filter(event, player, name) {
                    if (event.name == 'phase') {
                        return game.phaseNumber == 0;
                    }
                    return name == 'enterGame' || event.getg?.(player)?.length || event.getl?.(player)?.hs?.length;
                },
                async content(event, trigger, player) {
                    get.info(event.name).init(player, event.name);
                },
            },
        },
    },
    zshy_yingxiang: {//萦香
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: ['useCardAfter', 'loseAfter', 'loseAsyncAfter', 'gainAfter', 'equipAfter', 'addJudgeAfter', 'addToExpansionAfter'],
        },
        filter(event, player) {
            if (event.name === 'useCard') {
                return event.player.hasHistory('lose', evt => {
                    if (evt.getParent() !== event) {
                        return false;
                    }
                    return Object.values(evt.gaintag_map).flat().includes('zshy_yingxiang');
                });
            }
            if (!player.countDiscardableCards(player, 'h', card => !get.info('zshy_qingjue').isOnlySuit(card, player))) {
                return false;
            }
            if (event.name === 'lose' && event.getParent().name === 'useCard') {
                return false;
            }
            return game.hasPlayer(target => {
                const evt = event.getl?.(target);
                return evt?.hs?.some(card => evt.gaintag_map?.[card.cardid]?.includes('zshy_yingxiang'));
            });
        },
        logTarget(event, player) {
            if (event.name === 'useCard') {
                return game
                    .filterPlayer(i => {
                        if (i === event.player) {
                            return true;
                        }
                        return i.hasCard(card => card.hasGaintag('zshy_yingxiang'), 'h');
                    })
                    .sortBySeat();
            }
            return player;
        },
        forced: true,
        async content(event, trigger, player) {
            if (trigger.name === 'useCard') {
                await game.asyncDraw([player, ...event.targets].sortBySeat());
                await game.delayx();
            } else {
                const skill = 'zshy_qingjue';
                player.logSkill(skill);
                const next = game.createEvent(skill);
                next.player = player;
                next.setContent(get.info(skill).content);
                await next;
            }
        },
        group: 'zshy_yingxiang_mark',
        subSkill: {
            mark: {
                audio: 'zshy_yingxiang',
                forced: true,
                trigger: {
                    global: ['gainEnd', 'loseAsyncEnd'],
                },
                getIndex(event, player) {
                    return game
                        .filterPlayer(target => {
                            if (target == player) {
                                return false;
                            }
                            const gain = event.getg?.(target) ?? [];
                            const lose = event.getl?.(player)?.cards2 ?? [];
                            return gain.length > 0 && (event.giver === player || lose.some(i => gain.includes(i)));
                        })
                        .sortBySeat();
                },
                filter(event, player, name, target) {
                    return target?.isIn();
                },
                logTarget(event, player, name, target) {
                    return target;
                },
                async content(event, trigger, player) {
                    const target = event.indexedData;
                    const gain = trigger.getg?.(target);
                    const lose = trigger.getl?.(player)?.cards2;
                    target.addGaintag(
                        gain.filter(i => trigger.giver === player || lose.includes(i)),
                        'zshy_yingxiang'
                    );
                },
            },
        },
    },

    //墟族荀淑
    zshy_shenjun: {//神君
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: ['useCard', 'respond'] },
        forced: true,
        locked: false,
        filter(event, player) {
            return (get.name(event.card) != 'shan') && player.countCards('h', event.card.name) > 0;
        },
        content() {
            var cards = player.getCards('h', trigger.card.name);
            player.showCards(cards, get.translation(player) + '发动了【神君】');
            player.markSkill('zshy_shenjun');
            player.addGaintag(cards, 'zshy_shenjun');
            for (var name of lib.phaseName) {
                var evt = _status.event.getParent(name);
                if (!evt || evt.name != name) {
                    continue;
                }
                player.addTempSkill('zshy_shenjun_viewAs', name + 'After');
                break;
            }
        },
        marktext: '君',
        intro: {
            markcount(storage, player) {
                return player.countCards('h', card => card.hasGaintag('zshy_shenjun'));
            },
            mark(dialog, content, player) {
                var cards = player.getCards('h', card => card.hasGaintag('zshy_shenjun'));
                if (cards.length) {
                    dialog.addAuto(cards);
                } else {
                    return '无展示牌';
                }
            },
        },
        mod: {
            targetInRange(card) {
                if (card.storage && card.storage.zshy_shenjun) return true;
            },
            cardUsable(card) {
                if (card.storage && card.storage.zshy_shenjun) return true;
            },
        },
        subSkill: {
            viewAs: {
                audio: 'zshy_shenjun',
                trigger: { global: ['phaseZhunbeiEnd', 'phaseJudgeEnd', 'phaseDrawEnd', 'phaseUseEnd', 'phaseDiscardEnd', 'phaseJieshuEnd'] },
                filter(event, player) {
                    return player.countCards('h', card => card.hasGaintag('zshy_shenjun')) > 0;
                },
                forced: true,
                charlotte: true,
                content() {
                    'step 0';
                    var cards = player.getCards('h', card => card.hasGaintag('zshy_shenjun'));
                    var list = [],
                        names = [];
                    for (var card of cards) {
                        var name = get.name(card),
                            nature = get.nature(card);
                        var namex = name;
                        if (nature && nature.length) {
                            namex += nature;
                            if (names.includes(namex)) {
                                continue;
                            }
                            list.push([get.type(card), '', name, nature]);
                        } else {
                            if (names.includes(namex)) {
                                continue;
                            }
                            list.push([get.type(card), '', name]);
                        }
                        names.push(namex);
                    }
                    list.sort((a, b) => {
                        var del1 = lib.inpile.indexOf(a[2]) - lib.inpile.indexOf(b[2]);
                        if (del1 != 0) {
                            return del1;
                        }
                        var a1 = 0,
                            b1 = 0;
                        if (a.length > 3) {
                            a1 = lib.nature.get(a) || 0;
                        }
                        if (b.length > 3) {
                            b1 = lib.nature.get(b) || 0;
                        }
                        return a1 - b1;
                    });
                    player.chooseButton(['是否将一张牌当下列一张牌使用？', [list, 'vcard']]).set('ai', function (button) {
                        return _status.event.player.getUseValue({
                            name: button.link[2],
                            nature: button.link[3],
                            storage: { zshy_shenjun: true },
                        });
                    });
                    'step 1';
                    if (result.bool) {
                        var name = result.links[0][2],
                            nature = result.links[0][3];
                        var cards = player.getCards('h', card => card.hasGaintag('zshy_shenjun'));
                        game.broadcastAll(
                            function (card) {
                                lib.skill.zshy_shenjun_backup.viewAs = card;
                            },
                            {
                                name: name,
                                nature: nature,
                                storage: { zshy_shenjun: true },
                            }
                        );
                        var next = player.chooseToUse();
                        next.set('openskilldialog', '将一张牌当做' + (get.translation(nature) || '') + '【' + get.translation(name) + '】使用');
                        next.set('norestore', true);
                        next.set('addCount', false);
                        next.set('_backupevent', 'zshy_shenjun_backup');
                        next.set('custom', {
                            add: {},
                            replace: { window() { } },
                        });
                        next.backup('zshy_shenjun_backup');
                    }
                },
            },
            backup: {
                filterCard(card) {
                    return get.itemtype(card) == 'card';
                },
                position: 'hes',
                filterTarget: lib.filter.filterTarget,
                check: card => 6 - get.value(card),
                log: false,
            },
        },
    },
    zshy_balong: {//八龙
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: ['useCard', 'respond'],
        },
        forced: true,
        filter(event, player) {
            return player.countCards('h') < 8;
        },
        async content(event, trigger, player) {
            player.showHandcards(get.translation(player) + '发动了【八龙】');
            player.drawTo(8);
            player.recover();
        },
        ai: {
            noh: true,
            skillTagFilter(player, tag) {
                if (tag == 'noh' && player.countCards('h') > 8) return false;
            },
        },
    },

    //墟族荀攸
    zshy_baichu: {//百出
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: ['useCardAfter', 'respondAfter'] },
        derivation: 'zshy_qice',
        filter(event, player) {
            const storage = player.storage.zshy_baichu || {};
            if (Object.values(storage).includes(event.card.name)) {
                return true;
            }
            const suit = get.suit(event.card);
            if (suit == 'none') {
                return false;
            }
            if (!player.hasSkill('zshy_qice')) {
                return true;
            }
            const key = `${suit}+${get.type2(event.card)}`;
            return !(key in storage);
        },
        forced: true,
        async content(event, trigger, player) {
            const storage = player.storage.zshy_baichu || {},
                suit = get.suit(trigger.card);
            if (suit != 'none') {
                const key = `${suit}+${get.type2(trigger.card)}`;
                if (key in storage) {
                    if (!player.hasSkill('zshy_qice', null, false, false)) {
                        await player.addSkill('zshy_qice');
                    } else player.chooseDrawRecover(true);
                } else {
                    const list = lib.inpile.filter(name => get.type(name) == 'trick' || get.type(name) == 'basic');
                    list.removeArray(Object.values(storage));
                    if (list.length) {
                        const dialog = ['百出：选择记录一种基本或普通锦囊牌', [list, 'vcard']];
                        const result = await player.chooseButton(dialog, true).set('ai', function (button) {
                            const player = get.player(),
                                name = button.link[2];
                            if (name == 'wuxie' || get.type(name) == 'basic') {
                                return 5201314;
                            }
                            if (name == get.event().getTrigger().card.name) {
                                return 114514;
                            }
                            return get.effect(player, { name: name }, player, player) * (1 + player.countCards('hs', name));
                        }).forResult();
                        if (result?.bool && result?.links?.length) {
                            const key = `${get.suit(trigger.card)}+${get.type2(trigger.card)}`,
                                name = result.links[0][2];
                            player.storage.zshy_baichu ??= {};
                            player.storage.zshy_baichu[key] = name;
                            player.markSkill('zshy_baichu');
                            game.log(player, '记录了', '#y' + get.translation(name));
                            player.chooseDrawRecover(true);
                            /**
                            var card = get.cardPile({ name: name });
                            if (card) {
                                player.gain(card, "gain2", "log");
                            }
                             */
                            await event.trigger('zshy_baichu');
                            await game.delayx();
                        }
                    }
                }
            }
            if (Object.values(player.getStorage('zshy_baichu')).includes(trigger.card.name)) {
                await player.chooseDrawRecover(true);
            }
        },
        mark: true,
        intro: {
            markcount(storage = {}) {
                if (!storage) {
                    return 0;
                }
                return Object.keys(storage).length;
            },
            mark(dialog, storage = {}) {
                if (!storage) {
                    return '当前暂无记录';
                }
                const addNewRow = lib.element.dialog.addNewRow.bind(dialog);
                dialog.css({ width: '50%' });
                if (get.is.phoneLayout()) {
                    dialog.classList.add('fullheight');
                }
                let types = ['basic', 'trick', 'equip'].concat(Object.keys(storage).map(list => list.split('+')[1])).toUniqued();
                let suits = lib.suit.slice().reverse().concat(Object.keys(storage).map(list => list.split('+')[0])).toUniqued();
                addNewRow(
                    ...['花色'].concat(types.map(i => get.translation(i))).map(type => {
                        return { item: type, ratio: type == '花色' ? 1 : 2 };
                    })
                );
                for (const suit of suits) {
                    let list = [{ item: get.translation(suit), ratio: 1 }];
                    for (const type of types) {
                        list.add({
                            item: ((suit, type, storage) => {
                                if (storage[suit + '+' + type]) {
                                    return get.translation(storage[suit + '+' + type]);
                                }
                                return null;
                            })(suit, type, storage),
                            ratio: 2,
                        });
                    }
                    addNewRow(...list);
                }
            },
        },
        init(player, skill) {
            player.addSkill(skill + '_count');
        },
        onremove(player, skill) {
            player.removeSkill(skill + '_count');
        },
        mod: {
            targetInRange(card, player, target) {
                function isTypeAllSuitsRecorded(storage, type) {
                    const suits = ['spade', 'heart', 'club', 'diamond'];
                    return suits.every(suit => `${suit}+${type}` in storage);
                };
                const storage = player.storage.zshy_baichu || {};
                const type = get.type2(card);
                if (isTypeAllSuitsRecorded(storage, type)) {
                    return true;
                }
            },
            cardUsableTarget(card, player, target) {
                function isSuitAllTypesRecorded(storage, suit) {
                    const types = ['basic', 'trick', 'equip'];
                    return types.every(type => `${suit}+${type}` in storage);
                };
                const storage = player.storage.zshy_baichu || {};
                const suit = get.suit(card);
                if (suit !== 'none' && isSuitAllTypesRecorded(storage, suit)) {
                    return true;
                }
            },
        },
        group: ['zshy_baichu_mod'],
        subSkill: {
            count: {
                charlotte: true,
                init(player) {
                    const storage = player.storage.zshy_baichu || {};
                    //移除已经记录的新组合标记
                    const cards_old = player.getCards('h', card => {
                        const suit = get.suit(card, false);
                        return (suit === 'none' || `${suit}+${get.type2(card, false)}` in storage) && card.hasGaintag('zshy_baichu_new');
                    });
                    if (cards_old.length) {
                        player.removeGaintag('zshy_baichu_new', cards_old);
                    }
                    //添加未曾记录的新组合标记
                    const cards_new = player.getCards('h', card => {
                        const suit = get.suit(card, false);
                        return suit !== 'none' && !(`${suit}+${get.type2(card, false)}` in storage) && !card.hasGaintag('zshy_baichu_new');
                    });
                    if (cards_new.length) {
                        player.addGaintag(cards_new, 'zshy_baichu_new');
                    }
                    //添加记录锦囊的已记录标记
                    const cards_trick = player.getCards('h', card => Object.values(storage).includes(get.name(card, false)) && !card.hasGaintag('zshy_baichu_trick'));
                    if (cards_trick.length) {
                        player.addGaintag(cards_trick, 'zshy_baichu_trick');
                    }
                },
                onremove(player) {
                    player.removeGaintag('zshy_baichu_new');
                    player.removeGaintag('zshy_baichu_trick');
                },
                trigger: {
                    player: ['gainEnd', 'zshy_baichu', 'enterGame'],
                    global: ['loseAsyncEnd', 'gameDrawEnd', 'phaseBefore'],
                },
                filter(event, player) {
                    if (['gain', 'loseAsync'].includes(event.name) && !event.getg?.(player)?.length) {
                        return false;
                    }
                    const storage = player.storage.zshy_baichu || {};
                    return player.hasCard(card => {
                        const suit = get.suit(card, false);
                        const old = (suit === 'none' || `${suit}+${get.type2(card, false)}` in storage) && card.hasGaintag('zshy_baichu_new');
                        const newx = suit !== 'none' && !(`${suit}+${get.type2(card, false)}` in storage) && !card.hasGaintag('zshy_baichu_new');
                        const load = Object.values(storage).includes(get.name(card, false)) && !card.hasGaintag('zshy_baichu_trick');
                        return old || newx || load;
                    }, 'h');
                },
                silent: true,
                firstDo: true,
                content() {
                    get.info(event.name).init(player);
                },
            },
            new: {},
            trick: {},
        },
    },

};
const 陈留吴氏 = {
    zshy_muyin: {//穆荫
        audio: 'ext:诸神寰宇/audio/character:2',
        clanSkill: true,
        audioname2: {
            zshy_AAZZwubanCLWS: 'zshy_muyin_zshy_AAZZwubanCLWS',
            zshy_AAZZwuxianCLWS: 'zshy_muyin_zshy_AAZZwuxianCLWS',
        },
        trigger: {
            global: 'phaseBegin',
        },
        isMax(player) {
            var num = player.getHandcardLimit();
            return !game.hasPlayer(function (current) {
                return current != player && current.getHandcardLimit() > num;
            });
        },
        filter(event, player) {
            return game.hasPlayer(function (current) {
                return (current == player || current.hasClan('陈留吴氏'));
            });
        },
        async cost(event, trigger, player) {
            event.result = await player.chooseTarget(get.prompt(event.skill), '令一名陈留吴氏角色的手牌上限+1', function (card, player, current) {
                return (current == player || current.hasClan('陈留吴氏'));
            }).set('ai', function (target) {
                return get.attitude(_status.event.player, target);
            }).forResult();
        },
        async content(event, trigger, player) {
            let target = event.targets[0];
            lib.skill.chenliuwushi.change(target, 1);
            game.delayx();
        },
    },

    //墟族吴班
    zshy_zhanding: {//斩钉
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'chooseToUse',
        viewAsFilter(player) {
            return player.countCards('hes') > 0;
        },
        viewAs: { name: 'sha' },
        filterCard: true,
        position: 'hes',
        selectCard: [1, Infinity],
        check(card) {
            return 6 - ui.selected.cards.length - get.value(card);
        },
        allowChooseAll: true,
        onuse(links, player) {
            lib.skill.chenliuwushi.change(player, -1);
            player.addTempSkill('zshy_zhanding_effect');
        },
        ai: {
            order: 1,
            respondSha: true,
            skillTagFilter(player) {
                return player.countCards('hes') > 0;
            },
        },
        subSkill: {
            effect: {
                trigger: { player: 'useCardAfter' },
                forced: true,
                popup: false,
                filter(event, player) {
                    return event.skill == 'zshy_zhanding';
                },
                async content(event, trigger, player) {
                    var num1 = player.countCards('h'),
                        num2 = player.getHandcardLimit();
                    if (num1 < num2) {
                        player.draw(num2 - num1);
                    }
                    if (trigger.addCount !== false) {
                        trigger.addCount = false;
                        const stat = player.getStat().card,
                            name = trigger.card.name;
                        if (typeof stat[name] == 'number') {
                            stat[name]--;
                        }
                    }
                    if (
                        player.hasHistory('sourceDamage', function (evt) {
                            return evt.card == trigger.card;
                        })
                    ) {
                        lib.skill.chenliuwushi.change(player, 1);
                    }
                },
            },
        },
    },
    zshy_muyin_zshy_AAZZwubanCLWS: {
        audio: 'ext:诸神寰宇/audio/character:2',
    },

    //墟族吴苋
    zshy_yirong: {//移荣
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        usable: 2,
        filter(event, player) {
            var num1 = player.countCards('h'),
                num2 = player.getHandcardLimit();
            return num1 != num2;
        },
        selectCard() {
            var player = _status.event.player;
            var num1 = player.countCards('h'),
                num2 = player.getHandcardLimit();
            if (num1 > num2) {
                return num1 - num2;
            }
            return [0, 1];
        },
        filterCard(card, player) {
            var num1 = player.countCards('h'),
                num2 = player.getHandcardLimit();
            return num1 > num2;
        },
        check(card) {
            var player = _status.event.player;
            if (
                player.countCards('h', function (card) {
                    return lib.skill.zshy_yirong.checkx(card) > 0;
                }) +
                1 <
                player.countCards('h') - player.getHandcardLimit()
            ) {
                return 0;
            }
            return lib.skill.zshy_yirong.checkx(card);
        },
        checkx(card) {
            var num = 1;
            if (_status.event.player.getUseValue(card, null, true) <= 0) {
                num = 1.5;
            }
            return (15 - get.value(card)) * num;
        },
        prompt() {
            var player = _status.event.player;
            var num1 = player.countCards('h'),
                num2 = player.getHandcardLimit();
            var str = '<span class="text center">';
            if (num1 > num2) {
                str += '弃置' + get.cnNumber(num1 - num2) + '张牌，然后你回复1点体力并令手牌上限+1。';
            } else {
                str += '摸' + get.cnNumber(num2 - num1) + '张牌，然后你回复1点体力并令手牌上限-1。';
            }
            str += '<br>※当前手牌上限：' + num2;
            str += '</span>';
            return str;
        },
        async content(event, trigger, player) {
            if (event.cards.length) {
                lib.skill.chenliuwushi.change(player, 1);
            } else {
                var num1 = player.countCards('h'),
                    num2 = player.getHandcardLimit();
                if (num1 < num2) {
                    player.draw(num2 - num1);
                }
                lib.skill.chenliuwushi.change(player, -1);
            };
            await player.recover();
        },
        ai: {
            order(item, player) {
                var num = player.getHandcardLimit(),
                    numx = (_status.event.getParent().phaseIndex || 0) + 1;
                if (num == 5 && numx == 4 && player.getStat('skill').zshy_yirong) {
                    return 0;
                }
                if (player.countCards('h') == num + 1 && num != 2 && (num <= 4 || (num > 4 && numx > 4))) {
                    return 10;
                }
                return 0.5;
            },
            result: { player: 1 },
            threaten: 5,
        },
    },
    zshy_guixiang: {//贵相
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'phaseChange' },
        forced: true,
        async content(event, trigger, player) {
            await player.draw(2);
            trigger.phaseList[trigger.num] = `phaseUse`;
            game.delayx();
        },
    },
    zshy_muyin_zshy_AAZZwuxianCLWS: {
        audio: 'ext:诸神寰宇/audio/character:2',
    },
};
const 颍川钟氏 = {
    zshy_baozu: {//保族
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AAZZzhonghuiYCZS: 'zshy_baozu_zshy_AAZZzhonghuiYCZS',
            zshy_AAZZzhongyanYCZS: 'zshy_baozu_zshy_AAZZzhongyanYCZS',
            zshy_AAZZzhongyaoYCZS: 'zshy_baozu_zshy_AAZZzhongyaoYCZS',
            zshy_AAZZzhongyuYCZS: 'zshy_baozu_zshy_AAZZzhongyuYCZS',
        },
        trigger: { global: 'dying' },
        clanSkill: true,
        skillAnimation: true,
        animationColor: 'water',
        filter(event, player) {
            return (event.player == player || event.player.hasClan('颍川钟氏')) && event.player.hp <= 0 && !event.player.isLinked();
        },
        logTarget: 'player',
        check(event, player) {
            return lib.skill.wanlan.check(event, player);
        },
        prompt2: '当一名颍川钟氏角色进入濒死状态时，你可以令其横置并回复至1点体力',
        async content(event, trigger, player) {
            trigger.player.link(true);
            trigger.player.recoverTo(trigger.player.maxHp);
        },
        subSkill: {
            zshy_AAZZzhonghuiYCZS: { audio: 'ext:诸神寰宇/audio/character:4' },
            zshy_AAZZzhongyanYCZS: { audio: 'ext:诸神寰宇/audio/character:2' },
            zshy_AAZZzhongyaoYCZS: { audio: 'ext:诸神寰宇/audio/character:2' },
            zshy_AAZZzhongyuYCZS: { audio: 'ext:诸神寰宇/audio/character:2' },
        },
    },

    //墟族钟会
    zshy_yuzhi: {//迂志
        audio: 'ext:诸神寰宇/audio/character:4',
        trigger: { global: ['roundStart', 'roundEnd'] },
        filter(event, player, name) {
            if (name === 'roundStart') {
                return player.countCards('h');
            }
            if (player.hasCard(card => card.hasGaintag('zshy_yuzhi') && lib.filter.cardDiscardable(card, player), 'h')) {
                return true;
            }
            const num1 = player.getRoundHistory('gain', evt => evt.getParent().name == 'draw' && evt.getParent(2).name == 'zshy_yuzhi').reduce((sum, evt) => sum + evt.cards.length, 0);
            const num2 = player.getRoundHistory('gain', evt => evt.getParent().name == 'draw' && evt.getParent(2).name == 'zshy_yuzhi', 1).reduce((sum, evt) => sum + evt.cards.length, 0);
            const num3 = player.getRoundHistory('useCard').length;
            return (num1 > 0 && num2 > 0 && num1 > num2) || num1 > num3;
        },
        forced: true,
        async content(event, trigger, player) {
            const name = event.triggername;
            const num1 = player.getRoundHistory('gain', evt => evt.getParent().name == 'draw' && evt.getParent(2).name == 'zshy_yuzhi', name === 'roundStart' ? 1 : 0).reduce((sum, evt) => sum + evt.cards.length, 0);
            switch (name) {
                case 'roundStart': {
                    const result = await player.chooseCard('迂志：请展示一张手牌',
                        '摸此牌牌名字数的牌。本轮结束时弃置此牌，若本轮你使用的牌数或上一轮你以此法摸的牌数小于此牌牌名字数，则你受到1点雷属性伤害或失去〖保族〗。',
                        (card, player) => {
                            const num = get.cardNameLength(card);
                            return typeof num == 'number' && num > 0;
                        }, true).set('ai', card => {
                            const { dying, num } = get.event();
                            if (dying && num > 0 && get.cardNameLength(card) > num) {
                                return 1 / get.cardNameLength(card); //怂
                            }
                            return get.cardNameLength(card); //勇
                        })
                        .set('dying', player.hp + player.countCards('hs', {
                            name: ['tao', 'jiu'],
                        }) < 1)
                        .set('num', num1)
                        .forResult();
                    if (result?.bool && result.cards?.length) {
                        await player.showCards(result.cards, get.translation(player) + '发动了【迂志】');
                        player.addGaintag(result.cards, 'zshy_yuzhi');
                        await player.draw(get.cardNameLength(result.cards[0]));
                        player.storage.zshy_yuzhi_mark = get.cardNameLength(result.cards[0]);
                        player.addTempSkill('zshy_yuzhi_mark', 'roundStart');
                    }
                    break;
                }
                case 'roundEnd': {
                    const cards = player.getCards('h', card => card.hasGaintag('zshy_yuzhi') && lib.filter.cardDiscardable(card, player));
                    if (cards.length) {
                        await player.discard(cards);
                    }
                    const num2 = player.getRoundHistory('gain', evt => evt.getParent().name == 'draw' && evt.getParent(2).name == 'zshy_yuzhi', 1).reduce((sum, evt) => sum + evt.cards.length, 0);
                    const num3 = player.getRoundHistory('useCard').length;
                    if ((num1 > 0 && num2 > 0 && num1 > num2) || num1 > num3) {
                        let result;
                        if (num2 > 0 && num1 > num2) {
                            game.log(player, '的野心已开始膨胀', '#y(' + num1 + '张>' + num2 + '张)');
                        }
                        if (num1 > num3) {
                            game.log(player, '的行动未达到野心', '#y(' + num3 + '张<' + num1 + '张)');
                        }
                        if (player.hasSkill('zshy_baozu', null, false, false)) {
                            result = await player.chooseBool('迂志：是否失去〖保族〗？', '若选择“否”，则你受到3点雷属性伤害').set('choice', player.awakenedSkills.includes('zshy_baozu')).forResult();
                        } else {
                            result = { bool: false };
                        }
                        if (result?.bool) {
                            await player.removeSkills('zshy_baozu');
                        } else {
                            await player.damage(3, 'thunder');
                        }
                    }
                }
            }
        },
        mod: {
            aiOrder(player, card, num) {
                if (card.name == 'tao') {
                    return num / 114514;
                }
            },
        },
        ai: {
            threaten: 3,
            nokeep: true,
        },
        onremove(player, skill) {
            player.removeGaintag(skill);
            player.removeSkill(skill + '_mark');
        },
        subSkill: {
            mark: {
                charlotte: true,
                onremove: true,
                mark: true,
                intro: { content: '本轮野心：#张' },
            },
        },
    },
    zshy_xieshu: {//挟术
        audio: 'ext:诸神寰宇/audio/character:4',
        trigger: { player: ['useCard', 'damageEnd'] },
        popup: false,
        filter(event, player) {
            if (!event.card) {
                return false;
            }
            var num = get.cardNameLength(event.card);
            return typeof num == 'number' && num > 0 && player.countCards('he') > 0;
        },
        async cost(event, trigger, player) {
            var num = get.cardNameLength(trigger.card),
                str = '';
            if (player.isLinked(true)) {
                str += '重置武将牌';
            } else {
                str = '横置武将牌';
            }
            if (player.getDamagedHp() > 0) {
                str += '，然后摸' + get.cnNumber(player.getDamagedHp()) + '张牌';
            }
            event.result = await player
                .chooseCard(get.prompt(event.skill), '重铸' + get.cnNumber(num) + '张牌并' + str, 'he', num)
                .set('ai', function (card) {
                    var player = _status.event.player;
                    var num = _status.event.num;
                    var num2 = player.getDamagedHp();
                    if (!num2) {
                        return 0;
                    }
                    if (num < num2) {
                        return 8 - get.value(card);
                    }
                    if (num == num2 || num2 >= 2 + num - num2) {
                        return lib.skill.zhiheng.check(card);
                    }
                    return 0;
                })
                .set('num', num)
                .set('logSkill', 'zshy_xieshu')
                .forResult();
        },
        async content(event, trigger, player) {
            await player.logSkill('zshy_xieshu');
            await player.recast(event.cards);
            await player.link();
            if (player.getDamagedHp() > 0) {
                await player.draw(player.getDamagedHp());
            }
        },
        ai: { threaten: 3 },
    },

    //墟族钟琰
    zshy_guangu: {//观骨
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: ['phaseUse'],
        zhuanhuanji: true,
        mark: true,
        marktext: '☯',
        intro: {
            content(storage) {
                return '【转换技】<li>出牌阶段：你可以观看' + (storage ? '一名角色的至多四张手' : '牌堆顶的至多四张') + '牌，然后可以使用其中的一张牌。';
            },
        },
        filter(event, player) {
            if (player.storage.zshy_guangu) {
                return game.hasPlayer(current => {
                    return current.countCards('h');
                });
            }
            return true;
        },
        chooseButton: {
            dialog(event, player) {
                var dialog = ui.create.dialog('观骨：选择观看牌堆的牌数', 'hidden');
                if (player.storage.zshy_guangu) {
                    dialog.forceDirect = true;
                }
                return dialog;
            },
            chooseControl(event, player) {
                var list = [1, 2, 3, 4].map(i => {
                    return get.cnNumber(i, true);
                });
                list.push('cancel2');
                return list;
            },
            check(button, player) {
                var ret;
                if (!player.hasSkill('zshy_xiaoyong')) {
                    ret = 4;
                } else {
                    var list = [4, 3, 2, 1];
                    player.getHistory('useCard', evt => {
                        var len = get.cardNameLength(evt.card);
                        list.remove(len);
                    });
                    if (list.length) {
                        ret = list[0];
                    } else {
                        ret = 4;
                    }
                }
                return get.cnNumber(ret, true);
            },
            backup(result, player) {
                return {
                    audio: 'zshy_guangu',
                    filterCard: () => false,
                    selectCard: -1,
                    filterTarget(card, player, target) {
                        if (player.storage.zshy_guangu) {
                            return true;
                        }
                        return false;
                    },
                    selectTarget() {
                        var player = _status.event.player;
                        if (player.storage.zshy_guangu) {
                            return 1;
                        }
                        return -1;
                    },
                    num: result.index + 1,
                    content() {
                        'step 0';
                        player.changeZhuanhuanji('zshy_guangu');
                        if (!targets.length) {
                            var num = lib.skill.zshy_guangu_backup.num;
                            var cards = get.cards(num);
                            event.cards = cards.slice(0);
                            while (cards.length) {
                                ui.cardPile.insertBefore(cards.pop().fix(), ui.cardPile.firstChild);
                            }
                            game.updateRoundNumber();
                            event.goto(2);
                        } else {
                            var ret;
                            if (!player.hasSkill('zshy_xiaoyong')) {
                                ret = 4;
                            } else {
                                var list = [4, 3, 2, 1];
                                player.getHistory('useCard', evt => {
                                    var len = get.cardNameLength(evt.card);
                                    list.remove(len);
                                });
                                if (list.length) {
                                    ret = list[0];
                                } else {
                                    ret = 4;
                                }
                            }
                            player.choosePlayerCard(target, 'h', true, [1, 4])
                                .set('prompt', '观骨：观看' + get.translation(target) + '的至多四张牌')
                                .set('ai', button => {
                                    if (ui.selected.buttons.length >= _status.event.num) {
                                        return 0;
                                    }
                                    return Math.random();
                                })
                                .set('num', ret);
                        }
                        'step 1';
                        if (result.bool) {
                            event.cards = result.links;
                        } else {
                            event.finish();
                        }
                        'step 2';
                        var count = cards.length;
                        event.getParent().viewedCount = count;
                        player.chooseButton(['观骨：是否使用其中一张牌？', cards])
                            .set('filterButton', button => {
                                var player = _status.event.player;
                                var card = button.link;
                                var cardx = {
                                    name: get.name(card, get.owner(card)),
                                    nature: get.nature(card, get.owner(card)),
                                    cards: [card],
                                };
                                return player.hasUseTarget(cardx, null, false);
                            })
                            .set('ai', button => {
                                var len = _status.event.len;
                                var card = button.link;
                                var fix = 1;
                                if (get.cardNameLength(card) == len) {
                                    fix = 2;
                                }
                                return fix * _status.event.player.getUseValue(card);
                            })
                            .set('len', (function () {
                                if (!player.hasSkill('zshy_xiaoyong')) {
                                    return 0;
                                }
                                var list = [];
                                player.getHistory('useCard', evt => {
                                    var len = get.cardNameLength(evt.card);
                                    list.add(len);
                                });
                                if (!list.includes(count)) {
                                    return count;
                                }
                                if (list.length) {
                                    return list.randomGet();
                                }
                                return 4;
                            })()
                            );
                        'step 3';
                        if (result.bool) {
                            var card = result.links[0];
                            cards.remove(card);
                            var cardx = {
                                name: get.name(card, get.owner(card)),
                                nature: get.nature(card, get.owner(card)),
                                cards: [card],
                            };
                            var next = player.chooseUseTarget(cardx, [card], true, false);
                            if (card.name === cardx.name && get.is.sameNature(card, cardx, true)) {
                                next.viewAs = false;
                            }
                        } else {
                            player.tempBanSkill('zshy_guangu');
                        }
                    },
                    ai: {
                        order: 10,
                        result: {
                            target(player, target) {
                                return -Math.min(target.countCards('h'), 4) / 2;
                            },
                        },
                    },
                };
            },
            prompt(result, player) {
                if (!player.storage.zshy_guangu) {
                    return '点击“确定”以观看牌堆顶牌';
                }
                return '观骨：选择观看牌的目标';
            },
        },
        subSkill: {
            backup: {},
        },
        ai: {
            order: 10,
            result: {
                player: 1,
            },
        },
    },
    zshy_xiaoyong: {//啸咏
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'useCard',
        },
        filter(event, player) {
            var len = get.cardNameLength(event.card);
            if (!player.getStat().skill.zshy_guangu) {
                return false;
            }
            var history = player.getAllHistory('useSkill', evt => {
                return evt.skill == 'zshy_guangu_backup';
            }).map(evt => evt.event);
            if (!history.length) {
                return false;
            }
            var num = 0;
            for (var i = history.length - 1; i >= 0; i--) {
                var evt = history[i];
                if (evt.viewedCount) {
                    num = evt.viewedCount;
                    break;
                }
            }
            if (num && len == num) {
                return true;
            }
            return false;
        },
        forced: true,
        async content(event, trigger, player) {
            delete player.getStat().skill.zshy_guangu;
            game.log(player, '重置了', '#g【观骨】');
            await player.chooseDrawRecover(true);
        },
        ai: {
            combo: 'zshy_guangu',
        },
        mod: {
            aiOrder(player, card, num) {
                if (!player.hasSkill('zshy_guangu') || !player.getStat().skill.zshy_guangu) {
                    return;
                }
                var history = player.getAllHistory('useSkill', evt => {
                    return evt.skill == 'zshy_guangu_backup';
                }).map(evt => evt.event);
                if (!history.length) {
                    return;
                }
                var numx = 0;
                for (var i = history.length - 1; i >= 0; i--) {
                    var evt = history[i];
                    if (evt.viewedCount) {
                        numx = evt.viewedCount;
                        break;
                    }
                }
                if (numx == get.cardNameLength(card)) {
                    if (
                        !player.hasHistory('useCard', evt => {
                            return numx == get.cardNameLength(evt.card);
                        })
                    ) {
                        return num + 9;
                    }
                }
            },
        },
    },

    //族钟繇
    zshy_chengqi: {//承启
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: ['chooseToUse', 'chooseToRespond'],
        filter(event, player) {
            if (player.countCards('hs') < 1) {
                return false;
            }
            return get.inpileVCardList(info => {
                const name = info[2];
                if (get.type(name) != 'basic' && get.type(name) != 'trick' && get.type(name) != 'delay') {
                    return false;
                }
                return !(event.zshy_chengqi || []).includes(name);
            }).some(card => event.filterCard(get.autoViewAs({ name: card[2], nature: card[3] }, 'unsure'), player, event));
        },
        hiddenCard(player, name) {
            if (get.type(name) != 'basic' && get.type(name) != 'trick' && get.type(name) != 'delay') {
                return false;
            }
            return player.countCards('hs') > 0 && lib.inpile.includes(name);
        },
        chooseButton: {
            dialog(event, player) {
                const list = get.inpileVCardList(info => {
                    const name = info[2];
                    if (get.type(name) != 'basic' && get.type(name) != 'trick' && get.type(name) != 'delay') {
                        return false;
                    }
                    return !(event.zshy_chengqi || []).includes(name);
                })
                    .filter(card => event.filterCard(get.autoViewAs({ name: card[2], nature: card[3] }, 'unsure'), player, event));
                return ui.create.dialog('承启', [list, 'vcard']);
            },
            check(button) {
                if (get.event().getParent().type != 'phase') {
                    return 1;
                }
                if (get.type(button.link[0], 'damage') > 0.5) {
                    return 100;
                }
                return get.event().player.getUseValue({
                    name: button.link[2],
                    nature: button.link[3],
                });
            },
            backup(links, player) {
                return {
                    audio: 'zshy_chengqi',
                    filterCard(card) {
                        return get.name(card) != links[0][2];
                    },
                    complexCard: true,
                    selectCard: [1, Infinity],
                    popname: true,
                    viewAs: {
                        name: links[0][2],
                        nature: links[0][3],
                    },
                    filterOk() {
                        return (ui.selected.cards || []).reduce((sum, card) => {
                            return sum + get.cardNameLength(card);
                        }, 0) >= get.cardNameLength(lib.skill.zshy_chengqi_backup.viewAs.name);
                    },
                    ai1(card) {
                        const player = get.event().player;
                        const name = lib.skill.zshy_chengqi_backup.viewAs.name;
                        if (ui.selected.cards.length > get.cardNameLength(name) ||
                            (ui.selected.cards || []).reduce((sum, card) => {
                                return sum + get.cardNameLength(card);
                            }, 0) >= get.cardNameLength(name)) {
                            return 0;
                        }
                        if (get.cardNameLength(name) == get.cardNameLength(card)) {
                            return 100;
                        }
                        if (ui.selected.cards.length && game.hasPlayer(target => {
                            return get.effect(target, { name: 'draw' }, player, player) > 0 ||
                                get.effect(target, { name: 'recover' }, player, player) > 0;
                        })) {
                            if (get.cardNameLength(name) <= get.cardNameLength(card) + get.cardNameLength(ui.selected.cards.reduce((sum, card) => {
                                return sum + get.cardNameLength(card);
                            }))) {
                                return 10 / (get.value(card) || 0.5);
                            }
                        }
                        return 1 / (get.value(card) || 0.5);
                    },
                    position: 'hs',
                    precontent() {
                        player.addTempSkill('zshy_chengqi_effect');
                    },
                };
            },
            prompt(links, player) {
                return '将至少一张手牌当作' + get.translation(links[0][3] || '') + '【' + get.translation(links[0][2]) + '】使用';
            },
        },
        ai: {
            order: 100,
            respondSha: true,
            respondShan: true,
            respondTao: true,
            result: { player: 1 },
        },
        subSkill: {
            backup: { audio: 'zshy_chengqi' },
            effect: {
                charlotte: true,
                trigger: { player: 'useCard' },
                filter(event, player) {
                    return event.skill == 'zshy_chengqi_backup'
                        && get.cardNameLength(event.card) ==
                        (event.cards || []).reduce((sum, card) => {
                            return sum + get.cardNameLength(card);
                        }, 0);
                },
                async cost(event, trigger, player) {
                    let num = get.cardNameLength(trigger.card);
                    event.result = await player.chooseTarget('承启：是否令至多' + num + '名角色回复1点体力或摸一张牌？', [1, num])
                        .set('ai', target => {
                            const player = get.event().player;
                            if (num == 1) {
                                return player;
                            }
                            return get.effect(target, { name: 'draw' }, player, player)
                                || get.effect(target, { name: 'recover' }, player, player);
                        }).forResult();
                },
                popup: false,
                async content(event, trigger, player) {
                    let num = get.cardNameLength(trigger.card);
                    player.line(event.targets);
                    Promise.all(event.targets.map(function (target) {
                        target.chooseDrawRecover(true);
                    }))
                },
            },
        },
    },
    zshy_jieli: {//诫厉
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { global: 'phaseJieshuBegin' },
        filter(event, player) {
            return game.hasPlayer(target => {
                return target.countCards('h');
            });
        },
        async cost(event, trigger, player) {
            const num = player.getHistory('useCard').length > 0 ? Math.max(...player.getHistory('useCard').map(history => get.cardNameLength(history.card))) : 0;
            const str = num > 0 ? '并观看牌堆顶' + get.cnNumber(num) + '张牌，然后你可以交换其中任意张牌，若成功交换则你回复1点体力或摸一张牌' : '';
            event.result = await player
                .chooseTarget(get.prompt(event.skill), '观看一名角色的手牌' + str, (card, player, target) => {
                    return target.countCards('h');
                })
                .set('ai', target => {
                    const player = get.event().player;
                    const num = Math.max(...target.getCards('h').map(card => get.cardNameLength(card)));
                    return num + 0.0001 * get.attitude(player, target);
                })
                .forResult();
        },
        async content(event, trigger, player) {
            const target = event.targets[0];
            const num = player.getHistory('useCard').length > 0 ? Math.max(...player.getHistory('useCard').map(history => get.cardNameLength(history.card))) : 0;
            const limit = Math.max(...target.getCards('h').map(card => get.cardNameLength(card)));
            const cards = target.getCards('h');
            if (num > 0) {
                const topCards = get.cards(num);
                await game.cardsGotoOrdering(topCards);
                const result = await player.chooseToMove('诫厉：交换其中任意张牌')
                    .set('list', [
                        [get.translation(target) + '的手牌', cards, 'dcsushou_tag'],
                        ['牌堆顶', topCards],
                    ])
                    .set('filterMove', (from, to) => {
                        return typeof to != 'number';
                    })
                    .set('filterOk', moved => {
                        return moved[1].some(card => get.owner(card));
                    })
                    .set('processAI', list => {
                        const num = Math.min(list[0][1].length, list[1][1].length);
                        const player = get.event().player,
                            target = get.event().getParent().targets[0];
                        const sgn = get.sgn(get.sgn(get.attitude(player, target)) - 0.5);
                        const cards1 = list[0][1].slice().sort((a, b) => get.value(a, 'raw') * sgn - get.value(b, 'raw') * sgn);
                        const cards2 = list[1][1].slice().sort((a, b) => get.value(b, 'raw') * sgn - get.value(a, 'raw') * sgn);
                        return [cards1.slice().addArray(cards2.slice(0, num)), cards2.slice().addArray(cards1.slice(0, num))];
                    })
                    .forResult();
                if (result.bool) {
                    const lose = result.moved[1].slice();
                    const gain = result.moved[0].slice().filter(i => !get.owner(i));
                    if (lose.some(i => get.owner(i))) {
                        await game.cardsGotoOrdering(lose.filter(i => get.owner(i)));
                    }
                    for (let i = lose.length - 1; i--; i >= 0) {
                        ui.cardPile.insertBefore(lose[i], ui.cardPile.firstChild);
                    }
                    game.updateRoundNumber();
                    if (gain.length) {
                        await target.gain(gain, 'draw');
                    }
                } else {
                    for (let i = topCards.length - 1; i--; i >= 0) {
                        ui.cardPile.insertBefore(topCards[i], ui.cardPile.firstChild);
                    }
                    game.updateRoundNumber();
                }
            } else {
                const content = ['###诫厉###<div class="text center">' + get.translation(target) + '的手牌</div>', cards];
                await player.chooseControl('ok').set('dialog', content);
            }
            await player.chooseDrawRecover(true);
        },
    },

    //墟族钟毓
    zshy_jiejian: {//捷谏
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'useCard' },
        filter(event, player) {
            return get.cardNameLength(event.card) == player.getHistory('useCard').length;
        },
        direct: true,
        locked: false,
        content() {
            'step 0';
            var num = get.cardNameLength(trigger.card);
            event.num = num;
            player.chooseTarget(get.prompt('zshy_jiejian'), '令任意名角色回复1点体力或摸' + get.cnNumber(num) + '张牌', [1, Infinity])
                .set('ai', target => get.attitude(_status.event.player, target));
            'step 1';
            if (result.bool) {
                player.logSkill('zshy_jiejian', target);
                Promise.all(result.targets.map(function (target) {
                    target.chooseDrawRecover(num, true);
                }));
            }
        },
        ai: {
            threaten: 3,
            effect: {
                player_use(card, player) {
                    if (get.cardNameLength(card) == player.getHistory('useCard').length) {
                        return [(2 * get.cardNameLength(card)), 1];
                    }
                },
            },
        },
        mod: {
            aiOrder(player, card, num) {
                let cs = get.cardNameLength(card) - player.getHistory('useCard').length;
                if (cs == 0) {
                    return num * 3;
                }
                let bool = game.hasPlayer(target => {
                    return get.effect(target, { name: 'draw' }, player, player) > 0
                        || get.effect(target, { name: 'recover' }, player, player) > 0;
                });
                if (bool) {
                    return num + 15;
                }
            },
        },
    },
    zshy_huanghan: {//惶汗
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'damageEnd' },
        filter(event, player) {
            if (!event.card) {
                return false;
            }
            var num = get.cardNameLength(event.card);
            return typeof num == 'number' && num > 0;
        },
        check(event, player) {
            var num = get.cardNameLength(event.card);
            return num >= player.getDamagedHp();
        },
        async content(event, trigger, player) {
            let num1 = get.cardNameLength(trigger.card), num2 = player.getDamagedHp();
            await player.draw(num1);
            if (player.isDamaged()) {
                await player.chooseToDiscard(num2, 'he', true);
            }
            if (num1 >= num2) {
                player.recover(trigger.num);
            }
            if (game.countPlayer(function (target) {
                return target.isLinked(true) && target != player;
            }) > 0 && !player.isLinked()) {
                const result = await player.chooseTarget('惶汗：选择任意名角色，令其重置武将牌', [1, Infinity], function (card, player, target) {
                    return target.isLinked(true);
                }).set('ai', function (target) {
                    return get.attitude(_status.event.player, target) > 2;
                }).forResult();
                if (result.bool) {
                    Promise.all(result.targets.map(function (target) {
                        target.link(false);
                    }));
                }
            }
        },
        ai: {
            threaten: 3,
            effect: {
                target(card, player, target) {
                    if (!lib.translate[card.name] || !get.tag(card, 'damage') || player.hasSkillTag('jueqing', false, target)) {
                        return;
                    }
                    let num = get.cardNameLength(card) - target.getDamagedHp();
                    if (num > 0) {
                        return [1, 0.8 * num + 0.1];
                    }
                },
            },
        },
    },

};
const 吴郡陆氏 = {
    zshy_zelie: {//泽烈
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AAZZlujiWJLS: 'zshy_zelie_zshy_AAZZlujiWJLS',
            zshy_AAZZlujingWJLS: 'zshy_zelie_zshy_AAZZlujingWJLS',
            zshy_AAZZluyushengWJLS: 'zshy_zelie_zshy_AAZZluyushengWJLS',
        },
        trigger: { global: ['loseAfter', 'equipAfter', 'addJudgeAfter', 'gainAfter', 'loseAsyncAfter', 'addToExpansionAfter'] },
        getIndex(event, player) {
            return game
                .filterPlayer(current => {
                    if ((!current.hasClan('吴郡陆氏') && current != player)) {
                        return false;
                    }
                    const evt = event.getl(current);
                    return evt?.es?.length > 0 || evt?.js?.length > 0;
                })
                .sortBySeat(_status.currentPhase);
        },
        filter: (event, player, name, target) => target?.isIn(),
        clanSkill: true,
        async cost(event, trigger, player) {
            event.result = await player
                .chooseTarget(get.prompt2(event.skill), [1, Infinity])
                .set('ai', target => {
                    const player = get.player(),
                        att = get.attitude(player, target);
                    return att;
                    //相信后人智慧
                })
                .forResult();
        },
        async content(event, trigger, player) {
            for (const i of event.targets) {
                i.addTempSkill('zshy_zelie_effect');
                i.addMark('zshy_zelie_effect', 1, false);
            };
        },
        ai: {
            noe: true,
            skillTagFilter(player, tag, arg) {
                return player.countCards('ej') > 0;
            },
        },
        subSkill: {
            effect: {
                trigger: {
                    player: ['gainAfter', 'loseAfter'],
                    global: 'loseAsyncAfter',
                },
                charlotte: true,
                direct: true,
                firstDo: true,
                onremove: true,
                getIndex(event, player) {
                    return player.countMark('zshy_zelie_effect');
                },
                filter(event, player) {
                    if (!player.hasMark('zshy_zelie_effect')) {
                        return false;
                    }
                    if (event.name == 'gain') {
                        return event.getParent().name == 'draw';
                    }
                    return event.type == 'discard' && event.getl(player).cards2.length && player.countCards('he');
                },
                intro: {
                    content: '本回合下$次摸牌/弃置牌后，摸一张牌/弃置一张牌',
                },
                async content(event, trigger, player) {
                    player.removeMark('zshy_zelie_effect', 1, false);
                    if (trigger.name == 'gain') {
                        await player.draw();
                    } else {
                        await player.chooseToDiscard('he', true);
                    }
                },
            },
            zshy_AAZZlujiWJLS: { audio: 'ext:诸神寰宇/audio/character:2' },
            zshy_AAZZlujingWJLS: { audio: 'ext:诸神寰宇/audio/character:2' },
            zshy_AAZZluyushengWJLS: { audio: 'ext:诸神寰宇/audio/character:2' },
        },
    },

    //墟族陆绩
    zshy_gailan: {//该览
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'phaseBegin',
        },
        forced: true,
        async content(event, trigger, player) {
            const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
            const card = game.createCard2('zshy_huntianyi', lib.suit.randomGet(1), numbers.randomGet(1));
            if (card && player.canEquip(card, true)) {
                player.$gain2(card);
                await game.delayx();
                await player.equip(card);
            }
        },
    },
    zshy_huntianyi_skill: {
        equipSkill: true,
        trigger: { player: 'damageBegin2' },
        filter(event, player) {
            if (player.hasSkillTag('unequip2')) {
                return false;
            }
            if (
                event.source?.hasSkillTag('unequip', false, {
                    name: event.card ? event.card.name : null,
                    target: player,
                    card: event.card,
                })
            ) {
                return false;
            }
            return player.getEquip('zshy_huntianyi');
        },
        forced: true,
        async content(event, trigger, player) {
            const card = player.getEquip('zshy_huntianyi');
            await player.lose(card, 'visible', ui.ordering);
            trigger.cancel();
        },
        subSkill: {
            lose: {
                audio: 'zshy_huntianyi_skill',
                forced: true,
                charlotte: true,
                equipSkill: true,
                trigger: {
                    player: 'loseAfter',
                    global: ['equipAfter', 'addJudgeAfter', 'gainAfter', 'loseAsyncAfter', 'addToExpansionAfter'],
                },
                filter: (event, player, name, card) => {
                    if (!card || card.name != 'zshy_huntianyi') {
                        return false;
                    }
                    return !player.hasSkillTag('unequip2');
                },
                getIndex(event, player) {
                    const evt = event.getl(player);
                    const lostCards = [];
                    evt.es.forEach(card => {
                        const VEquip = evt.vcard_map.get(card);
                        if (VEquip?.name === 'zshy_huntianyi') {
                            lostCards.add(VEquip);
                        }
                    });
                    return lostCards;
                },
                async content(event, trigger, player) {
                    const num = get.number(event.indexedData, false),
                        cards = [];
                    while (cards.length < 2) {
                        const cardx = get.cardPile2(card => {
                            return get.number(card, false) == num && !cards.includes(card) && get.type2(card, false) == 'trick';
                        });
                        if (cardx) {
                            cards.push(cardx);
                        } else {
                            break;
                        }
                    }
                    if (cards.length) {
                        await player.gain(cards, 'gain2');
                    }
                },
            },
        },
    },
    zshy_fennu: {//奋驽
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            global: 'phaseUseBegin',
        },
        filter(event, player) {
            return game.hasPlayer(current => current.countCards('he'));
        },
        async cost(event, trigger, player) {
            event.result = await player
                .chooseTarget(get.prompt2(event.skill), [1, Infinity])
                .set('filterTarget', (card, player, target) => {
                    return target.countCards('he');
                })
                .set('ai', target => {
                    const player = get.player();
                    if (target.hasSkill('zshy_zelie') && target.countCards('e') == 1 && !target.countCards('j')) {
                        return get.attitude(player, target);
                    }
                    return get.effect(target, { name: 'guohe_copy2' }, player, player);
                })
                .forResult();
        },
        async content(event, trigger, player) {
            const targets = event.targets.filter(target => target.countDiscardableCards(target, 'he'));
            if (!targets?.length) {
                return;
            }
            if (!event.isMine() && !event.isOnline()) {
                await game.delayx();
            }
            const nextx = player
                .chooseCardOL(targets, 'he', true, 1, '奋驽：弃置一张牌', (card, player, target) => {
                    return lib.filter.cardDiscardable(card, player, 'zshy_fennu');
                })
                .set('ai', card => {
                    return 7 - get.value(card);
                });
            nextx._args.remove('glow_result');
            const result = await nextx.forResult();
            const lose_list = [],
                cards = [];
            for (let i = 0; i < result.length; i++) {
                const current = targets[i],
                    cards2 = result[i].cards;
                cards.addArray(cards2);
                //lose_list.push([current, cards2]);
                await current.modedDiscard(cards2);
            }
            /*await game
                .loseAsync({
                    lose_list: lose_list,
                    discarder: player,
                })
                .setContent('discardMultiple');*/
            const next = player.addToExpansion(cards, 'gain2');
            next.gaintag.add('zshy_fennu');
            await next;
        },
        marktext: '逸',
        intro: {
            name: '逸',
            mark(dialog, storage, player) {
                const list = player.getExpansions('zshy_fennu');
                if (!list.length) {
                    return '没有记录';
                }
                const num1 = list.reduce((sum, card) => sum + get.number(card, false), 0);
                dialog.addText(`“逸”牌总点数：${num1}`);
                dialog.addSmall(list);
                const num2 = player.countMark('zshy_fennu_record');
                dialog.addText(`已记录点数：${num2}`);
            },
            markcount(storage, player) {
                const num = player.countMark('zshy_fennu_record');
                return num || null;
            },
        },
        onremove(player, skill) {
            const cards = player.getExpansions(skill);
            if (cards.length) {
                player.loseToDiscardpile(cards);
            }
            player.clearMark(`${skill}_record`, false);
        },
        group: ['zshy_fennu_record', 'zshy_fennu_gain'],
        subSkill: {
            record: {
                trigger: {
                    player: 'useCardToPlayer',
                },
                filter(event, player) {
                    if (!player.getExpansions('zshy_fennu').length || !event.isFirstTarget) {
                        return false;
                    }
                    const num = get.number(event.card, false);
                    return num && typeof num == 'number';
                },
                direct: true,
                async content(event, trigger, player) {
                    player.addMark(event.name, get.number(trigger.card), false);
                    player.markSkill('zshy_fennu');
                },
            },
            gain: {
                audio: 'zshy_fennu',
                trigger: {
                    player: ['useCardAfter', 'respondAfter'],
                },
                filter(event, player) {
                    if (!player.getExpansions('zshy_fennu').length || !player.countMark('zshy_fennu_record')) {
                        return false;
                    }
                    const num1 = player.getExpansions('zshy_fennu').reduce((sum, card) => sum + get.number(card, false), 0),
                        num2 = player.countMark('zshy_fennu_record');
                    return num1 < num2;
                },
                forced: true,
                locked: false,
                async content(event, trigger, player) {
                    player.clearMark('zshy_fennu_record', false);
                    await player.gain(player.getExpansions('zshy_fennu'), 'gain2');
                },
            },
        },
    },

    //墟族陆景
    zshy_tanfeng: {//探锋
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'phaseUse',
        viewAs: {
            name: 'sha',
            isCard: true,
            storage: {
                tanfeng: true,
            },
        },
        async precontent(event, trigger, player) {
            if (event.getParent().addCount !== false) {
                event.getParent().addCount = false;
            }
            const target = event.result.targets[0];
            player
                .when({ player: 'useCardAfter' })
                .filter(evt => evt.getParent() == event.getParent())
                .assign({
                    ai: {
                        unequip: true,
                        unequip_ai: true,
                        skillTagFilter(player, tag, arg) {
                            const card = tag == 'unequip_ai' ? arg : arg?.card;
                            if (!card?.storage?.tanfeng) {
                                return false;
                            }
                        },
                    },
                })
                .step(async (event, trigger, player) => {
                    if (player.getHistory('sourceDamage', evt => evt.card == trigger.card).length) {
                        const num = Math.max(1, Math.abs(player.countCards('e') - target.countCards('e')));
                        if (num > 0) {
                            await player.chooseDrawRecover(num, true);
                            const card = get.cardPile((card2) => get.type(card2) == 'equip', void 0, 'random');
                            if (card) {
                                await player.gain(card, 'gain2');
                            } else {
                                player.chat(`怎么会没有装备？！`);
                            };
                        }
                    } else {
                        const sha = get.autoViewAs({ name: 'sha', isCard: true });
                        if (!target.canUse(sha, player, false)) {
                            return;
                        }
                        const { bool } = await target
                            .chooseBool('探锋', `是否视为对${get.translation(player)}使用一张【杀】？`)
                            .set('choice', get.effect(player, sha, target, target) > 0)
                            .forResult();
                        if (bool) {
                            await target.useCard(sha, player, false);
                        }
                    }
                });
        },
        selectCard: -1,
        filterCard: () => false,
        selectTarget: 1,
        ai: {
            order() {
                return get.order({ name: 'sha' }) + 0.1;
            },
            result(card, player, target) {
                if (player.getCards({ name: 'shan' }).length > 0 || player.hp > 3) {
                    return -1;
                };
                return 0;
            },
        },
    },
    zshy_juewei: {//绝围
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'useCardToPlayered',
            target: 'useCardToTargeted',
        },
        filter(event, player, name) {
            if (!event.card || !get.is.damageCard(event.card)) {
                return false;
            }
            if (name == 'useCardToPlayered' && (!event.isFirstTarget || !event.cards.filterInD().length)) {
                return false;
            }
            return player.countCards('he', card => {
                return lib.filter.cardDiscardable(card, player, 'zshy_juewei') || lib.filter.cardRecastable(card, player);
            });
        },
        async cost(event, trigger, player) {
            const prompt1 = `重铸一张牌并回复1点体力，于${get.translation(trigger.card)}结算完成后视为对一名不为你的角色使用此牌`,
                prompt2 = `弃置一张牌并对${get.translation(trigger.player)}造成1点伤害，令${get.translation(trigger.card)}无效`;
            const result = await player
                .chooseButton([
                    get.prompt(event.skill),
                    [
                        [
                            ['Recast', prompt1],
                            ['Discard', prompt2],
                        ],
                        'textbutton',
                    ],
                ])
                .set('filterButton', button => {
                    const player = get.player(),
                        source = button.link == 'Recast' ? null : 'zshy_juewei';
                    return player.countCards('he', card => {
                        return lib.filter[`card${button.link}able`](card, player, source);
                    });
                })
                .set('ai', button => {
                    const player = get.player(),
                        trigger = get.event().getTrigger();
                    if (button.link == 'Recast') {
                        if (!trigger.targets || trigger.targets.every(target => target == player)) {
                            return 0;
                        }
                        const target = trigger.targets.maxBy(
                            target => {
                                return get.effect(target, trigger.card, player, player);
                            },
                            target => target != player
                        );
                        return get.effect(target, trigger.card, player, player);
                    }
                    return (
                        trigger.targets.reduce((sum, target) => {
                            sum -= get.effect(target, trigger.card, trigger.player, player);
                        }, 0) - 2
                    );
                })
                .forResult();
            if (!result.bool) {
                return;
            }
            const link = result.links[0],
                type = `card${link}able`;
            event.result = await player
                .chooseCard(
                    '绝围',
                    link == 'Recast' ? prompt1 : prompt2,
                    card => {
                        const { player, actType: type } = get.event(),
                            source = type == 'Recast' ? null : 'zshy_juewei';
                        return lib.filter[type](card, player, source);
                    },
                    'he'
                )
                .set('actType', type)
                .set('ai', card => {
                    return 8 - get.value(card);
                })
                .forResult();
            event.result.cost_data = link;
        },
        async content(event, trigger, player) {
            if (event.cost_data == 'Recast') {
                await player.recast(event.cards);
                player.recover();
                player
                    .when({ global: 'useCardAfter' })
                    .filter(evt => evt == trigger.getParent())
                    .step(async (event, trigger, player) => {
                        const targets = trigger.targets.filter(target => target != player && target.isIn());
                        if (targets?.length) {
                            await player.chooseUseTarget(trigger.card, false, true, targets, 1);
                        }
                    });
            } else {
                await player.discard(event.cards);
                trigger.player.damage(player);
                trigger.getParent().all_excluded = true;
                trigger.getParent().targets.length = 0;
            }
        },
    },

    //墟族陆郁生
    zshy_shixi: {//拾昔
        init(player2, skill) {
            player2.addSkill(skill + '_mark');
        },
        onremove(player2, skill) {
            player2.removeSkill(skill + '_mark');
        },
        onChooseToUse(event2) {
            if (!game.online && !event2.zshy_shixi) {
                const player2 = event2.player;
                const storage = player2.getStorage('zshy_shixi', {});
                const list = Object.entries(storage).filter(([suit, name]) => {
                    if (!player2.hasCards('he', (card2) => get.suit(card2, player2) === suit)) {
                        return false;
                    }
                    const card = get.autoViewAs({ name, isCard: true }, 'unsure');
                    if (!lib.skill.zshy_shixi.filterx(card, player2) || !event2.filterCard(card, player2, event2)) {
                        return false;
                    }
                    return true;
                });
                event2.set('zshy_shixi', list);
            }
        },
        hiddenCard(player2, name) {
            const storage = player2.getStorage('zshy_shixi', {});
            for (const [suit, cardName] of Object.entries(storage)) {
                if (cardName == name && player2.hasCards('he', (card) => get.suit(card, player2) === suit)) {
                    return true;
                }
            }
            return false;
        },
        audio: 'ext:诸神寰宇/audio/character:2',
        enable: 'chooseToUse',
        filter(event2, player2) {
            return event2.zshy_shixi?.length > 0;
        },
        filterx(card, player2) {
            if (get.type(card, null, false) !== 'trick' && get.type(card, null, false) !== 'basic') {
                return false;
            }
            const info = get.info(card, player2);
            if (!info) {
                return false;
            }
            return info.type === 'trick' || info.type === 'basic';
        },
        chooseButton: {
            dialog(event2, player2) {
                const list = get.addNewRowList(player2.getCards('he'), 'suit', player2);
                const storage = player2.getStorage('zshy_shixi', {});
                const str = Object.entries(storage).map(([suit, name]) => {
                    return `${get.translation(suit)}：${get.translation(name)}`;
                }).join('；');
                const dialog = ui.create.dialog();
                dialog.add([
                    [[`###拾昔###<div class='text center'>将一种花色的所有牌置入弃牌堆视为使用对应花色记录的普通锦囊牌<br>当前花色及对应的牌：${str}</div>`], 'addNewRow'],
                    [
                        (dialog2) => {
                            dialog2.classList.add('fullheight');
                            dialog2.forcebutton = false;
                            dialog2._scrollset = false;
                        },
                        'handle'
                    ],
                    list.map((item) => [Array.isArray(item) ? item : [item], 'addNewRow'])
                ]);
                dialog.direct = true;
                return dialog;
            },
            filter(button, player2) {
                if (!button.links.length) {
                    return false;
                }
                const evt = get.event().getParent();
                return evt.zshy_shixi.some(([suit, name]) => suit === button.link);
            },
            check(button) {
                get.player();
                const evt = get.event().getParent();
                const { zshy_shixi } = evt;
                const name = zshy_shixi.find(([suit, name2]) => suit === button.link)[1];
                if (button.links.length >= 3) {
                    return 0;
                }
                if (evt.type != 'phase') {
                    return 1;
                }
                return get.player().getUseValue({ name });
            },
            backup(links, player2) {
                return {
                    audio: 'zshy_shixi',
                    suit: links[0],
                    filterCard: { suit: links[0] },
                    selectCard: -1,
                    position: 'he',
                    popname: true,
                    viewAs: {
                        name: player2.storage.zshy_shixi[links[0]],
                        cards: [],
                        isCard: true
                    },
                    ignoreMod: true,
                    log: false,
                    async precontent(event2, trigger, player3) {
                        player3.logSkill('zshy_shixi');
                        const cards2 = event2.result.cards;
                        await player3.loseToDiscardpile(cards2);
                        const viewAs = new lib.element.VCard({ name: event2.result.card.name, isCard: true });
                        event2.result.card = viewAs;
                        event2.result.cards = [];
                        const card = get.cardPile(function (card2) {
                            return get.type(card2) == 'equip' && get.suit(card2) != links[0];
                        }, void 0, 'random');
                        if (card) {
                            await player3.gain(card, 'gain2');
                        } else {
                            player3.chat(`咦咦？！我的装备呢？`);
                        };
                    }
                };
            },
            prompt(links, player2) {
                const suit = links[0];
                const cards2 = player2.getCards('he', { suit });
                const card = { name: player2.storage.zshy_shixi[suit] };
                return `###拾昔###将${get.translation(cards2)}置入弃牌堆，视为使用【${get.translation(card)}】`;
            }
        },
        mark: true,
        intro: {
            markcount(storage = {}) {
                if (!storage) {
                    return 0;
                }
                return Object.keys(storage).length;
            },
            mark(dialog, storage = {}) {
                if (!storage || Object.keys(storage).length === 0) {
                    return '当前暂无记录';
                }
                let str = '已记录花色和牌名：<br>';
                for (const suit of lib.suit.slice()) {
                    const name = storage[suit];
                    if (name) {
                        str += get.translation(suit) + '：' + get.poptip(name) + '<br>';
                    }
                }
                return str;
            }
        },
        ai: {
            order(item, player2) {
                const storage = player2.getStorage('zshy_shixi', {});
                const list = Object.entries(storage).filter(([suit, name]) => player2.hasCards('he', (card) => get.suit(card, player2) === suit)).map(([suit, name]) => {
                    return { name };
                }).filter((card) => player2.getUseValue(card, true, true) > 0);
                if (!list.length) {
                    return 0;
                }
                list.sort((a, b) => (player2.getUseValue(b, true, true) || 0) - (player2.getUseValue(a, true, true) || 0));
                return get.order(list[0], player2) * 0.99;
            },
            result: {
                player(player2) {
                    if (_status.event.dying) {
                        return get.attitude(player2, _status.event.dying);
                    }
                    return 1;
                }
            }
        },
        subSkill: {
            mark: {
                init(player2, skill) {
                    const history = player2.getAllHistory('useCard', (evt) => get.suit(evt.card) !== 'none' && lib.skill.zshy_shixi.filterx(evt.card, player2));
                    if (history.length) {
                        player2.storage.zshy_shixi ??= {};
                        const storage = player2.storage.zshy_shixi;
                        for (const evt of history) {
                            if (Object.keys(storage).length == lib.suits.length) {
                                break;
                            }
                            const card = evt.card;
                            const suit = get.suit(card);
                            const name = get.name(card);
                            if (!(suit in storage)) {
                                player2.storage.zshy_shixi[suit] = name;
                            }
                        }
                        player2.markSkill('zshy_shixi');
                    }
                },
                onremove(player2, skill) {
                    player2.setStorage('zshy_shixi', null, true);
                },
                audio: 'zshy_shixi',
                trigger: { player: 'useCard1' },
                filter(event2, player2) {
                    const card = event2.card;
                    if (!lib.skill.zshy_shixi.filterx(card, player2)) {
                        return false;
                    }
                    const suit = get.suit(card);
                    if (suit === 'none') {
                        return false;
                    }
                    const storage = player2.getStorage('zshy_shixi', {});
                    return !(suit in storage);
                },
                forced: true,
                popup: false,
                firstDo: true,
                async content(event2, trigger, player2) {
                    const suit = get.suit(trigger.card);
                    const name = trigger.card.name;
                    player2.storage.zshy_shixi ??= {};
                    player2.storage.zshy_shixi[suit] = name;
                    player2.markSkill('zshy_shixi');
                    game.log(player2, '记录了', '#y' + get.translation(name), '（' + get.translation(suit) + '）');
                }
            }
        }
    },
    zshy_jianbai: {//坚白
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: ['useCardAfter', 'respondAfter'] },
        forced: true,
        filter(event2, player2) {
            return player2.hasCards('he');
        },
        async content(event2, trigger, player2) {
            const hs = player2.getCards('he');
            const suits = [...new Set(hs.map((card) => get.suit(card)))];
            if (suits.length === 0) {
                return;
            }
            const result = suits.length === 1 ? { control: suits[0] } : await player2.chooseControl(lib.suits.slice().filter((suit) => suits.includes(suit))).set('prompt', '坚白：请选择要保留的花色').set('ai', () => {
                const { player: player3, suits: suits2 } = get.event();
                let max = -1;
                let best = suits2[0];
                for (const suit of suits2) {
                    const cards2 = player3.getCards('he', (card) => get.suit(card) === suit);
                    let value = cards2.reduce((sum, card) => sum + get.value(card), 0);
                    if (value > max) {
                        max = value;
                        best = suit;
                    }
                }
                return best;
            }).set('suits', suits).forResult();
            const keepSuit = result?.control;
            if (!keepSuit) {
                return;
            }
            player2.popup(keepSuit);
            game.log(player2, '选择了', '#g' + get.translation(keepSuit));
            const keepCards = player2.getCards('he', (card) => get.suit(card) === keepSuit);
            for (const card of keepCards) {
                const skill = 'zshy_jianbai_effect';
                let tag = card.gaintag?.find((tag2) => tag2.startsWith(skill));
                if (tag) {
                    player2.removeGaintag(tag, [card]);
                    tag = skill + (parseInt(tag.slice(skill.length)) + 1);
                } else {
                    tag = skill + '1';
                }
                game.addTempTag(tag, `坚白+${tag.slice(skill.length)}`);
                player2.addGaintag([card], tag);
            }
            const rescastCards = player2.getCards('he', (card) => get.suit(card) !== keepSuit && player2.canRecast(card));
            if (rescastCards.length > 0) {
                await player2.recast(rescastCards);
            };
            await game.delayx();
            let num1 = 0;
            let count = 0;
            for (const i of hs) {
                let tag = i.gaintag?.find((tag2) => tag2.startsWith('zshy_jianbai_effect'));
                if (tag) {
                    count = parseInt(tag.slice('zshy_jianbai_effect'.length)) + 1 || 1;
                    if (count > num1) {
                        num1 = count;
                    }
                };
            };
            if (num1 >= hs.length) {
                player2.recover();
                if (count > 0) {
                    await player2.draw(num1);
                };
                const skill = 'zshy_jianbai_effect';
                let tags = player2.getCards('he', (card) => card.gaintag?.some((tag) => tag.startsWith(skill)));
                if (tags.length) {
                    tags = tags.slice().map((card) => card.gaintag.find((tag) => tag.startsWith(skill))).unique();
                    tags.forEach((tag) => player2.removeGaintag(tag));
                };
            };
        },
    },

};

const skill_AF = {
    ...颍川荀氏, ...陈留吴氏, ...颍川钟氏, ...吴郡陆氏,
};

export default skill_AF;
