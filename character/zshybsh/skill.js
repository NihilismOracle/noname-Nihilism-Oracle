import { lib, game, ui, get, ai, _status } from '../../../../noname.js';

const skill = {
    //墟势周瑜
    zshy_chiyun: {//炽沄
        audio: 'potchiyun',
        chargeSkill: Infinity,
        beginMarkCount: 4,
        trigger: { player: 'gainAfter', global: 'loseAsyncAfter' },
        filter(event, player) {
            //不因本技能获得牌后触发
            if (player.storage.zshy_chiyun_ignore) return false;
            if (!player.countCards('h')) return false;
            const cards = event.getg?.(player);
            if (!cards || !cards.length) return false;
            return !(player.storage.zshy_chiyun1 && player.storage.zshy_chiyun2);
        },
        async cost(event, trigger, player) {
            event.result = await player.chooseCardTarget({
                prompt: get.prompt(event.skill) + '：将任意张手牌交给任意名其他角色',
                position: 'h',
                filterCard: true,
                selectCard: [1, Infinity],
                selectTarget: [1, Infinity],
                complexCard: true,
                filterTarget: lib.filter.notMe,
                ai1(card) {
                    //已选过一张就不再选，避免 AI 把手牌全部交给队友
                    if (ui.selected.cards?.length) return 0;
                    return 8 - get.value(card);
                },
                ai2(target) {
                    const player2 = get.player();
                    if (target.hasSkillTag('nogain')) return -1;
                    return get.attitude(player2, target);
                },
            }).forResult();
        },
        async content(event, trigger, player) {
            const cards2 = event.cards;
            const targets = event.targets || [];
            if (!cards2 || !cards2.length || !targets.length) return;
            const colors = cards2.map(card => get.color(card)).unique();
            //将牌依次交给这些角色
            const buckets = targets.map(() => []);
            cards2.forEach((card, index) => buckets[index % targets.length].push(card));
            for (let index = 0; index < targets.length; index++) {
                if (buckets[index].length) await player.give(buckets[index], targets[index]);
            }
            const receivers = targets.filter(target => target.isIn());
            const bool1 = player.storage.zshy_chiyun1;
            const bool2 = player.storage.zshy_chiyun2;
            const list = [];
            const choiceList = [];
            if (!bool1 && receivers.length) {
                list.push('选项一');
                choiceList.push(`对任意名因此技能获得过牌的角色各造成1点火焰伤害`);
            }
            if (!bool2) {
                list.push('选项二');
                choiceList.push(`你回复1点体力或摸两张牌，然后令这些角色进入连环状态`);
            }
            let choice = list[0];
            if (list.length > 1) {
                const result = await player.chooseControl(list).set('choiceList', choiceList).set('prompt', '炽沄：请选择一项').set('ai', () => {
                    const player2 = get.player();
                    if (receivers.some(target => get.damageEffect(target, player2, player2, 'fire') > 0)) return '选项一';
                    return '选项二';
                }).forResult();
                if (typeof result?.control == 'string') choice = result.control;
            }
            if (choice == '选项一') {
                const result = await player.chooseTarget({
                    prompt: '炽沄：选择任意名因此技能获得过牌的角色，各造成1点火焰伤害',
                    filterTarget(card, player2, target) {
                        return get.event().targets2.includes(target) && target.isIn();
                    },
                    selectTarget: [1, receivers.length],
                    ai(target) {
                        return get.damageEffect(target, get.player(), get.player(), 'fire');
                    },
                }).set('targets2', receivers).forResult();
                if (result?.bool) {
                    for (const target of result.targets) {
                        if (!target.isIn()) continue;
                        const sameColor = target.getCards('h', card => colors.includes(get.color(card)));
                        if (sameColor.length) {
                            await target.showCards(sameColor, `${get.translation(player)}发动了【${get.translation('zshy_chiyun')}】`);
                        }
                        await target.damage({ num: 1, nature: 'fire', source: player });
                    }
                }
            }
            else if (choice == '选项二') {
                //摸到的牌不触发炽沄自身
                player.storage.zshy_chiyun_ignore = true;
                try {
                    await player.chooseDrawRecover({ num1: 2, num2: 1, prompt: '炽沄：请选择一项', forced: true });
                } finally {
                    delete player.storage.zshy_chiyun_ignore;
                }
                for (const target of receivers) {
                    if (target.isIn()) await target.link(true);
                }
            }
            player.addCharge(1);
        },
        group: 'zshy_chiyun_init',
        subSkill: {
            init: {
                audio: 'zshy_chiyun',
                trigger: { player: 'enterGame', global: 'phaseBefore' },
                filter(event, player) {
                    if (player.storage.zshy_chiyun_inited) return false;
                    return event.name != 'phase' || game.phaseNumber == 0;
                },
                forced: true,
                locked: false,
                async content(event, trigger, player) {
                    player.storage.zshy_chiyun_inited = true;
                    player.addCharge(lib.skill.zshy_chiyun.beginMarkCount);
                },
            },
        },
        ai: { order: 3, result: { player: 2 } },
    },
    zshy_yanhui: {//焰洄
        audio: 'potyanhui',
        trigger: { player: 'useCardToPlayered' },
        filter(event, player) {
            if (!event.isFirstTarget) return false;
            return event.targets?.some(target => target.isIn() && target.hasCards('h'));
        },
        async cost(event, trigger, player) {
            event.result = await player.chooseTarget({
                prompt: get.prompt(event.skill),
                prompt2: '焰洄：展示一名目标角色的一张手牌',
                filterTarget(card, player2, target) {
                    return get.event().targets2.includes(target);
                },
                ai(target) {
                    return -get.attitude(get.player(), target);
                },
            }).set('targets2', trigger.targets.filter(target => target.isIn() && target.hasCards('h'))).forResult();
        },
        async content(event, trigger, player) {
            const target = event.targets[0];
            if (!target || !target.isIn() || !target.hasCards('h')) return;
            const result = await player.choosePlayerCard({
                forced: true,
                position: 'h',
                target,
                prompt: `展示${get.translation(target)}的一张手牌`,
                ai(card) {
                    //优先展示价值高的牌
                    return get.value(card);
                },
            }).forResult();
            if (!result?.bool) return;
            const card = result.links?.[0];
            if (!card) return;
            const shownHistory = game.getGlobalHistory('everything', evt => evt.name == 'showCards' && evt.cards?.length > 0).flatMap(evt => evt.cards);
            let isFirst = !shownHistory.includes(card);
            await target.showCards([card], `${get.translation(player)}发动了【${get.translation('zshy_yanhui')}】`);
            let paid = false;
            if (isFirst && player.countCharge() > 0) {
                const bool = await player.chooseBool(`焰洄：是否消耗1点蓄力点，令此牌改为“不为本回合第一次被展示”？`).set('ai', () => {
                    const player2 = get.player();
                    //牌价值高、或目标手牌已不多时，弃掉更划算
                    if (get.value(card) >= 6) return true;
                    if (player2.countCharge() > 1 && target.countCards('h') <= 2) return true;
                    return false;
                }).forResult();
                if (bool?.bool) {
                    player.removeCharge(1);
                    isFirst = false;
                    paid = true;
                }
            }
            if (!isFirst && target.isIn()) {
                await target.modedDiscard({ cards: [card], discarder: player });
            }
            const usedBefore = player.hasSkill('zshy_yanhui_used');
            if (paid) player.addTempSkill('zshy_yanhui_used', 'phaseAnyAfter');
            const disabled1 = player.storage.zshy_yanhui1;
            const disabled2 = player.storage.zshy_yanhui2;
            const damageTargets = game.filterPlayer(current => current.hasHistory('lose', evt => evt.type == 'discard' && evt.getParent(2)?.name == 'zshy_yanhui'));
            const num = game.countPlayer2(current => game.hasGlobalHistory('everything', evt => evt.name == 'showCards' && evt.cards?.length > 0 && evt.player == current));
            const doBoth = paid || usedBefore;
            const doDamage = async () => {
                if (!damageTargets.length) return;
                const result2 = await player.chooseTarget({
                    prompt: '焰洄：选择任意名因此技能弃置过牌的角色，各造成1点火焰伤害',
                    filterTarget(card, player2, target2) {
                        return get.event().targets2.includes(target2);
                    },
                    selectTarget: [1, damageTargets.length],
                    ai(target2) {
                        return -get.attitude(get.player(), target2);
                    },
                }).set('targets2', damageTargets).forResult();
                if (result2?.bool) {
                    for (const target2 of result2.targets) {
                        if (target2.isIn()) await target2.damage({ num: 1, nature: 'fire', source: player });
                    }
                }
            };
            const doDraw = async () => {
                await player.chooseDrawRecover({ num1: Math.max(num, 1), num2: 1, prompt: '焰洄：请选择一项', forced: true });
            };
            if (doBoth) {
                if (!disabled1) await doDamage();
                if (!disabled2) await doDraw();
            }
            else {
                const list = [], choiceList = [];
                if (damageTargets.length && !disabled1) {
                    list.push('选项一');
                    choiceList.push(`对${damageTargets.length}名因此技能弃置过牌的角色各造成1点火焰伤害`);
                }
                if (!disabled2) {
                    list.push('选项二');
                    choiceList.push(`回复1点体力或摸${num}张牌`);
                }
                let choice = list[0];
                if (list.length > 1) {
                    const result2 = await player.chooseControl(list).set('choiceList', choiceList).set('prompt', '焰洄：请选择一项').set('ai', () => {
                        const player2 = get.player();
                        if (get.event().damageCount > 0 && player2.hp > 2) return '选项一';
                        return '选项二';
                    }).set('damageCount', damageTargets.length).forResult();
                    if (typeof result2?.control == 'string') choice = result2.control;
                }
                if (choice == '选项一') await doDamage();
                else if (choice == '选项二') await doDraw();
            }
        },
        ai: { order: 4 },
        subSkill: {
            used: {},
        },
    },
    zshy_fentao: {//焚涛
        audio: 'potfentao',
        forced: true,
        trigger: { global: 'damageBegin4' },
        filter(event, player) {
            if (event.player == player) return false;
            if (!event.hasNature('fire')) return false;
            return !(player.storage.zshy_fentao1 && player.storage.zshy_fentao2);
        },
        logTarget: 'player',
        async content(event, trigger, player) {
            const target = trigger.player;
            if (!target?.isIn()) {
                player.addCharge(1);
                return;
            }
            const bool1 = player.storage.zshy_fentao1;
            const bool2 = player.storage.zshy_fentao2;
            const needed = Math.ceil(target.countCards('he') / 2);
            const canDiscard = needed > 0;
            let discard = false;
            if (bool2 || !canDiscard) {
                discard = false;
            }
            else if (bool1) {
                const result = await target.chooseToDiscard({
                    position: 'he',
                    selectCard: needed,
                    forced: true,
                    prompt: `焚涛：弃置${needed}张牌`,
                }).forResult();
                discard = !!(result?.bool && result.cards?.length);
            }
            else {
                const result = await target.chooseToDiscard({
                    position: 'he',
                    selectCard: needed,
                    prompt: `焚涛：弃置${needed}张牌，或点击“取消”令本次火焰伤害+1`,
                    ai(card) {
                        return 1 + get.value(card) / 20;
                    },
                }).forResult();
                discard = !!(result?.bool && result.cards?.length);
            }
            if (!discard) {
                trigger.num += 1;
            }
            else {
                target.when({ player: 'damageAfter' }).filter(evt => evt === trigger).step(async (event2, trigger2, player2) => {
                    if (!player2.isIn()) return;
                    await player2.link(true);
                });
            }
            player.addCharge(1);
        },
    },
    zshy_xiongzi: {//雄姿
        audio: 'potxiongzi',
        limited: true,
        skillAnimation: true,
        animationColor: 'fire',
        trigger: { player: 'phaseZhunbeiBegin' },
        filter(event, player) {
            return ['zshy_chiyun', 'zshy_yanhui', 'zshy_fentao'].some(skill => player.hasSkill(skill));
        },
        async cost(event, trigger, player) {
            const result = await player.chooseControl(['保留选项一', '保留选项二', 'cancel2']).set('prompt', get.prompt2(event.skill) + '：令本局游戏中你的〖炽沄〗〖焰洄〗〖焚涛〗仅保留其中一项的全部选项').set('ai', () => {
                const player2 = get.player();
                //选项一是全伤害路线，选项二是摸牌/回复路线
                if (player2.hp <= 2 && !player2.isLinked()) return '保留选项二';
                if (player2.countCards('h') <= 1) return '保留选项二';
                return '保留选项一';
            }).forResult();
            if (typeof result?.control == 'string' && result.control != 'cancel2') {
                event.result = { bool: true, cost_data: result.control };
            }
        },
        async content(event, trigger, player) {
            const link = event.cost_data;
            player.awakenSkill(event.name);
            for (const skill2 of ['zshy_chiyun', 'zshy_yanhui', 'zshy_fentao']) {
                player.setStorage(skill2 + (link === '保留选项一' ? '2' : '1'), true, true);
            }
            await player.draw({ num: 2 });
            player.addCharge(4);
            await player.addSkills(link === '保留选项一' ? 'zshy_xiongzi_liao' : 'zshy_xiongzi_di');
        },
    },
    zshy_xiongzi_liao: {//燎
        audio: `ext:诸神寰宇/audio/character:2`,
        trigger: { source: 'damageAfter' },
        filter(event, player) {
            return event.hasNature('fire') && event.player != player;
        },
        async content(event, trigger, player) {
            await player.chooseDrawRecover({ num1: 1, num2: 1, prompt: '燎：请选择一项', forced: true });
        },
    },
    zshy_xiongzi_di: {//涤
        audio: `ext:诸神寰宇/audio/character:2`,
        forced: true,
        trigger: { source: 'damageBegin1' },
        filter(event) {
            return event.hasNature('fire');
        },
        async content(event, trigger, player) {
            trigger.num += 1;
        },
    },
    //墟势钟会
    zshy_sizi: {//肆恣
        audio: 'ext:诸神寰宇/audio/character:7',
        logAudio(event) {
            if (typeof event == 'number') {
                return `ext:诸神寰宇/audio/character/zshy_sizi${event}.mp3`;
            }
            return 2;
        },
        enable: 'phaseUse',
        usable: 1,
        beginMarkCount: 4,
        chargeSkill: Infinity,
        filter(event, player) {
            return player.countCharge() > 0;
        },
        chooseButton: {
            dialog(event, player) {
                return ui.create.dialog(get.prompt2('zshy_sizi'), 'hidden');
            },
            chooseControl(event, player) {
                const chargeCount = player.countCharge();
                const maxChoices = 4;
                const actualCount = Math.min(chargeCount, maxChoices);
                const choices = Array.from(Array(actualCount)).map((v, i) => i + 1);
                return [...choices, 'cancel2'];
            },
            check(event, player) {
                return get.rand(1, player.countCharge());
            },
            backup(result, player) {
                return {
                    audio: 'zshy_sizi',
                    logAudio: () => [
                        'ext:诸神寰宇/audio/character/zshy_sizi1.mp3',
                        'ext:诸神寰宇/audio/character/zshy_sizi2.mp3'
                    ],
                    control: result.control,
                    async content(event, trigger, player) {
                        const { control: num } = get.info(event.name),
                            skill = 'zshy_sizi_effect';
                        player.removeCharge(num);
                        player.addTempSkill(skill, { player: 'phaseBegin' });
                        player.addMark(skill, num, false);
                        if (num > player.getHp()) {
                            player.addTempSkill('zshy_sizi_extra', { player: 'phaseBegin' });
                        }
                    },
                };
            },
            prompt(result, player) {
                let prompt = `直到你的回合开始，接下来${get.cnNumber(result.control)}个回合：`;
                let list = ['所有角色使用【杀】造成的伤害+1', '每个回合结束时，本回合内使用过【杀】的角色失去一点体力，你摸两张牌', '每个回合结束时，若本回合未有角色使用过【杀】，你与当前回合角色各失去1点体力'];
                if (result.control <= player.hp) {
                    list = list.slice(0, 2);
                }
                return `###${prompt}###${list.join('<br>')}`;
            },
        },
        group: 'zshy_sizi_init',
        subSkill: {
            backup: {},
            init: {
                audio: 'zshy_sizi',
                logAudio: () => 'ext:诸神寰宇/audio/character/zshy_sizi3.mp3',
                trigger: {
                    player: 'enterGame',
                    global: 'phaseBefore',
                },
                filter(event, player) {
                    if (!player.countCharge(true)) {
                        return false;
                    }
                    return event.name != 'phase' || game.phaseNumber == 0;
                },
                forced: true,
                locked: false,
                async content(event, trigger, player) {
                    const num = lib.skill.zshy_sizi.beginMarkCount;
                    player.addCharge(num);
                    await game.delayx();
                },
            },
            extra: {
                charlotte: true,
            },
            effect: {
                charlotte: true,
                onremove(player, skill) {
                    player.clearMark(skill, false);
                    player.removeSkill('zshy_sizi_extra');
                },
                intro: {
                    content(storage, player) {
                        if (!storage) {
                            return '已无效果';
                        }
                        let list = ['所有角色使用【杀】造成的伤害+1', '每个回合结束时，本回合内使用过【杀】的角色失去一点体力，你摸两张牌', '每个回合结束时，若本回合未有角色使用过【杀】，你与当前回合角色各失去1点体力'];
                        if (!player.hasSkill('zshy_sizi_extra')) {
                            list = list.slice(0, 2);
                        }
                        return `剩余可用${storage || '0'}个回合<br>${list.map(i => `<li>${i}`).join('<br>')}`;
                    },
                },
                trigger: {
                    global: ['phaseEnd', 'damageBegin1'],
                },
                filter(event, player) {
                    if (!player.countMark('zshy_sizi_effect')) {
                        return false;
                    }
                    return event.name == 'phase' || (event.card?.name == 'sha' && event.notLink());
                },
                async cost(event, trigger, player) {
                    if (trigger.name == 'phase') {
                        player.removeMark(event.skill, 1, false);
                        event.result = {
                            bool: true,
                            skill_popup: false,
                        };
                    } else {
                        trigger.num++;
                    }
                },
                async content(event, trigger, player) {
                    const targets = game.filterPlayer2(
                        current => {
                            return current.hasHistory('useCard', evt => evt.card?.name == 'sha');
                        },
                        undefined,
                        true
                    );
                    const func = async target => {
                        if (!target?.isIn()) {
                            return;
                        }
                        await target.loseHp();
                    };
                    player.logSkill('zshy_sizi', null, null, null, [get.rand(4, 5)]);
                    if (targets.length) {
                        await game.doAsyncInOrder(targets, func);
                    }
                    await player.draw(2);
                    if (player.hasSkill('zshy_sizi_extra') && !targets?.length) {
                        player.logSkill('zshy_sizi', null, null, null, [get.rand(6, 7)]);
                        await game.doAsyncInOrder([_status.currentPhase, player], func);
                    }
                },
            },
        },
        ai: {
            order: 10,
            result: {
                player: 1,
            },
        },
    },
    zshy_xiezhi: {//挟志
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: {
            player: 'changeHpAfter',
            source: 'damageAfter',
        },
        filter(event, player) {
            return event.num != 0;
        },
        forced: true,
        async content(event, trigger, player) {
            const max = Math.max(player.countCharge(true), 0);
            const num = Math.min(Math.abs(trigger.num), max);
            if (num > 0) {
                player.addCharge(num);
                player.draw(num);
            }
            const num2 = player.countCharge();
            if (num2 > 4) {
                const buff = `${event.name}_effect`;
                player.addSkill(buff);
                player.addMark(buff, 1, false);
                game.log(player, '的手牌上限和出杀次数', '#y+1');
                await game.delayx();
            }
        },
        subSkill: {
            effect: {
                charlotte: true,
                onremove: true,
                mark: true,
                intro: {
                    content: '手牌上限和出杀次数+#',
                },
                mod: {
                    maxHandcard(player, num) {
                        return num + player.countMark('zshy_xiezhi_effect');
                    },
                    cardUsable(card, player, num) {
                        if (card.name == 'sha') {
                            return num + player.countMark('zshy_xiezhi_effect');
                        }
                    },
                },
            },
        },
    },
    zshy_yunan: {//迂难
        audio: 'ext:诸神寰宇/audio/character:4',
        trigger: {
            source: 'dying',
        },
        juexingji: true,
        forced: true,
        skillAnimation: true,
        animationColor: 'purple',
        async content(event, trigger, player) {
            player.awakenSkill(event.name);
            const skill = 'zshy_kechang';
            if (!player.hasSkill(skill, null, null, false)) {
                await player.addSkills(skill);
            } else {
                player.setStorage(skill, true);
                player.popup(skill, 'purple');
                game.log(player, '升级了技能', `#g【${get.translation(skill)}】`);
                await game.delayx();
            }
        },
        derivation: ['zshy_kechang', 'zshy_kechang_rewrite'],
    },
    zshy_kechang: {//克昌
        audio: 'ext:诸神寰宇/audio/character:2',
        onremove: true,
        zhuSkill: true,
        forced: true,
        trigger: {
            player: 'useCard1',
        },
        filter(event, player) {
            if (event.card.name != 'sha') {
                return false;
            }
            return player.getStorage('zshy_kechang', false) === true;
        },
        async content(event, trigger, player) {
            trigger.directHit.addArray(game.players);
        },
        ai: {
            directHit_ai: true,
            skillTagFilter(player, tag, arg) {
                return player.getStorage('zshy_kechang', false) && arg?.card?.name == 'sha';
            },
        },
        global: 'zshy_kechang_global',
        subSkill: {
            global: {
                charlotte: true,
                mod: {
                    targetInRange(card, player) {
                        if (player.group != 'qun' || card.name != 'sha') {
                            return;
                        }
                        if (game.hasPlayer(current => current.hasSkill('zshy_kechang'))) {
                            return true;
                        }
                    },
                },
            },
        },
    },
    zshy_kechang_rewrite: {//克昌
        audio: 'zshy_kechang',
    },

    //墟势魏延
    zshy_zhuangshi: {//壮誓
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AAZZweiyanBSP_1: 'zshy_zhuangshi_zshy_AAZZweiyanBSP_1',
        },
        trigger: {
            player: 'phaseUseBegin',
        },
        async cost(event, trigger, player) {
            const { bool: bool1, cards } = await player
                .chooseToDiscard(get.prompt(event.skill), [1, Infinity], 'h')
                .set('prompt2', '重铸任意张手牌，令你此阶段使用的前等量张牌无距离限制且不可被响应')
                .set('ai', card => {
                    const player = get.player();
                    let num = Math.floor(player.countCards('h') / 2);
                    if (!game.hasPlayer(current => get.attitude(player, current) < 0)) {
                        num = 1;
                    }
                    if (ui.selected.cards.length < num && card.name != 'du') {
                        if (get.tag(card, 'damage')) {
                            return 0.1 - ui.selected.cards.length;
                        }
                        return 7 - get.value(card);
                    }
                    return 7 - get.value(card);
                })
                .set('chooseonly', true)
                .forResult();
            if (bool1 && cards.length) {
                game.broadcastAll(cards => {
                    cards.forEach(card => card.addGaintag('zshy_zhuangshi_tag'));
                }, cards);
            }
            const { bool: bool2, numbers } = await player
                .chooseNumbers(get.prompt(event.skill), [
                    {
                        prompt: '失去任意点体力值并获得等量护甲，令你此阶段使用的前等量张牌不计入次数限制',
                        min: 1,
                        max: player.getHp(),
                    },
                ])
                .set('processAI', () => {
                    const player = get.player();
                    if (player.hp < 2 || !game.hasPlayer(current => get.attitude(player, current) < 0)) {
                        return false;
                    }
                    let num = Math.min(Math.floor(player.countCards('h') / 2), player.hp - 1);
                    return [num];
                })
                .forResult();
            event.result = {
                bool: bool1 || bool2,
                cards: cards,
                cost_data: numbers,
            };
            player.removeGaintag('zshy_zhuangshi_tag');
        },
        async content(event, trigger, player) {
            trigger.set('usedZhuangshi', true);
            const { cards, cost_data: numbers } = event;
            if (cards) {
                await player.recast(cards);
                const number = cards.length;
                player.addTempSkill('zshy_zhuangshi_directHit', 'phaseChange');
                player.addMark('zshy_zhuangshi_directHit', number, false);
                player.addTip('zshy_zhuangshi_directHit', `不可响应 ${number}`);
            }
            if (numbers) {
                const number = numbers[0];
                await player.loseHp(number), player.changeHujia(number);
                player.addTempSkill('zshy_zhuangshi_limit', 'phaseChange');
                player.addMark('zshy_zhuangshi_limit', number, false);
                player.addTip('zshy_zhuangshi_limit', `不计次数 ${number}`);
            }
        },
        subSkill: {
            zshy_AAZZweiyanBSP_1: { audio: 'ext:诸神寰宇/audio/character:2' },
            limit: {
                trigger: {
                    player: 'useCard0',
                },
                charlotte: true,
                filter(event, player) {
                    return player.hasMark('zshy_zhuangshi_limit');
                },
                forced: true,
                popup: false,
                firstDo: true,
                async content(event, trigger, player) {
                    if (trigger.addCount !== false) {
                        trigger.addCount = false;
                        player.getStat('card')[trigger.card.name]--;
                    }
                    player.removeMark('zshy_zhuangshi_limit', 1, false);
                    const num = player.countMark('zshy_zhuangshi_limit');
                    if (num > 0) {
                        player.addTip('zshy_zhuangshi_limit', `不计次数 ${num}`);
                    } else {
                        player.removeTip('zshy_zhuangshi_limit');
                    }
                },
                onremove(player, skill) {
                    player.clearMark(skill, false);
                    player.removeTip(skill);
                },
                ai: {
                    presha: true,
                    skillTagFilter(player, tag, arg) {
                        if (!player.hasMark('zshy_zhuangshi_limit')) {
                            return false;
                        }
                    },
                },
            },
            directHit: {
                trigger: {
                    player: 'useCard0',
                },
                charlotte: true,
                filter(event, player) {
                    return player.hasMark('zshy_zhuangshi_directHit');
                },
                forced: true,
                popup: false,
                firstDo: true,
                async content(event, trigger, player) {
                    trigger.directHit.addArray(game.players);
                    player.removeMark('zshy_zhuangshi_directHit', 1, false);
                    const num = player.countMark('zshy_zhuangshi_directHit');
                    if (num > 0) {
                        player.addTip('zshy_zhuangshi_directHit', `不可响应 ${num}`);
                    } else {
                        player.removeTip('zshy_zhuangshi_directHit');
                    }
                },
                onremove(player, skill) {
                    player.clearMark(skill, false);
                    player.removeTip(skill);
                },
                mod: {
                    targetInRange(card, player) {
                        if (player.hasMark('zshy_zhuangshi_directHit')) {
                            return true;
                        }
                    },
                },
            },
        },
    },
    zshy_yinzhan: {//饮战
        audio: 'ext:诸神寰宇/audio/character:3',
        audioname: ['zshy_AAZZweiyanBSP_1', 'zshy_AAZZweiyanBSP_2'],
        audioname2: {
            zshy_AAZZweiyanBSP_1: 'zshy_yinzhan_zshy_AAZZweiyanBSP_1',
            zshy_AAZZweiyanBSP_2: 'zshy_yinzhan_zshy_AAZZweiyanBSP_2',
        },
        trigger: {
            source: 'damageBegin1',
        },
        forced: true,
        filter(event, player) {
            const target = event.player;
            if (player.hp <= target.hp || player.countCards('he') <= target.countCards('he')) {
                return true;
            }
            return false;
        },
        logTarget: 'player',
        popup: false,
        logAudio: (player, indexedData) => 'zshy_yinzhan' + (lib.skill.zshy_yinzhan.audioname.includes(player.skin.name) ? '_' + player.skin.name : '') + (indexedData ? indexedData : get.rand(1, 2)) + '.mp3',
        async content(event, trigger, player) {
            const target = trigger.player,
                bool1 = target.hp >= player.hp,
                bool2 = target.countCards('he') >= player.countCards('he');
            player.logSkill('zshy_yinzhan', null, null, null, [player, bool1 && bool2 ? 3 : get.rand(1, 2)]);
            if (bool1) {
                trigger.num++;
            }
            if (bool2) {
                if (bool1) {
                    player.popup('乘势', 'fire');
                }
                player
                    .when('useCardAfter')
                    .filter(evt => evt == trigger.getParent(2))
                    .step(async (event, trigger, player) => {
                        if (target.isIn() && target.countDiscardableCards(player, 'he')) {
                            const result = await player.discardPlayerCard(target, 'he', true).forResult();
                            if (bool1 && result?.cards?.length) {
                                await player.gain(result.cards.filterInD('od'), 'gain2');
                            }
                        }
                        if (bool1) {
                            await player.recover();
                        }
                    });
            }
        },
        subSkill: {
            zshy_AAZZweiyanBSP_1: { audio: 'ext:诸神寰宇/audio/character:2' },
            zshy_AAZZweiyanBSP_2: { audio: 'ext:诸神寰宇/audio/character:2' },
        }
    },
    zshy_zhongao: {//忠傲
        audio: 'ext:诸神寰宇/audio/character:5',
        dutySkill: true,
        derivation: ['zshy_SWYkuanggu_skill1', 'zshy_SWYkuanggu_skill2', 'zshy_SWYkunfen'],
        group: ['zshy_zhongao_start', 'zshy_zhongao_achieve', 'zshy_zhongao_fail'],
        subSkill: {
            start: {
                audio: 'ext:诸神寰宇/audio/character:1',
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
                    await player.addSkills(['zshy_SWYkuanggu', 'zshy_SWYkuanggu_skill1']);
                },
            },
            achieve: {
                audio: 'ext:诸神寰宇/audio/character:2',
                trigger: {
                    source: 'dieAfter',
                },
                forced: true,
                locked: false,
                skillAnimation: true,
                animationColor: 'fire',
                async content(event, trigger, player) {
                    player.awakenSkill(event.name.slice(0, -8));
                    game.log(player, '成功完成使命');
                    player.changeSkin('zshy_zhongao', 'zshy_AAZZweiyanBSP_1');
                    game.broadcastAll(() => {
                        _status.tempMusic = 'effect_yinzhanBGM';
                        game.playBackgroundMusic();
                    });
                    player.setStorage('zshy_SWYkuanggu', 1);
                    player.removeSkill('zshy_SWYkuanggu_skill1');
                    player.addSkill('zshy_SWYkuanggu_skill2');
                    const num1 = player.countMark('zshy_zhuangshi_limit'),
                        num2 = player.countMark('zshy_zhuangshi_directHit');
                    if (num1 > 0) {
                        await player.draw();
                    }
                    if (num2 > 0) {
                        if (!player.isDamaged()) {
                            await player.draw();
                        } else {
                            await player.recover();
                        }
                    }
                },
            },
            fail: {
                audio: 'ext:诸神寰宇/audio/character:2',
                trigger: {
                    player: ['dying', 'phaseUseBegin'],
                },
                filter(event, player) {
                    return event.name == 'dying' || !event.usedZhuangshi;
                },
                lastDo: true,
                forced: true,
                locked: false,
                async content(event, trigger, player) {
                    player.awakenSkill(event.name.slice(0, -5));
                    game.log(player, '使命失败');
                    player.changeSkin('zshy_zhongao', 'zshy_AAZZweiyanBSP_2');
                    game.broadcastAll(() => {
                        _status.tempMusic = 'effect_tuishouBGM';
                        game.playBackgroundMusic();
                    });
                    await player.changeSkills(['zshy_SWYkunfen'], ['zshy_zhuangshi']);
                },
            },
        },
    },
    zshy_SWYkuanggu: {//狂骨
        audio: 'ext:诸神寰宇/audio/character:2',
        audioname2: {
            zshy_AAZZweiyanBSP_2: 'zshy_SWYkuanggu_zshy_AAZZweiyanBSP_2',
        },
        subSkill: {
            zshy_AAZZweiyanBSP_2: { audio: 'ext:诸神寰宇/audio/character:2' },
            skill1: {
                audio: 'zshy_SWYkuanggu',
                trigger: {
                    source: 'damageSource',
                },
                filter(event, player) {
                    return event.num > 0;
                },
                frequent: true,
                popup: false,
                async cost(event, trigger, player) {
                    let choice,
                        list = ['draw_card'],
                        choiceList = ['选项一：回复1点体力', '选项二：摸一张牌'];
                    if (player.getStorage('zshy_SWYkuanggu', 0) && player.countCards('he')) {
                        list.push('背水！');
                        choiceList.push('背水：令你本阶段使用【杀】的次数+1');
                    }
                    if (player.isDamaged()) {
                        list.unshift('recover_hp');
                    } else {
                        choiceList[0] = `<span class = 'transparent'>${choiceList[0]}</span>`;
                    }
                    if (list.length == 1) {
                        event.result = await player.chooseBool(get.prompt('zshy_SWYkuanggu'), '摸一张牌').set('frequentSkill', event.skill).forResult();
                        event.result.cost_data = 'draw_card';
                    } else {
                        list.push('cancel2');
                        if (
                            player.isDamaged() &&
                            get.recoverEffect(player) > 0 &&
                            player.countCards('hs', function (card) {
                                return card.name == 'sha' && player.hasValueTarget(card);
                            }) >= player.getCardUsable('sha')
                        ) {
                            if (player.countCards('he') > 1 && list.includes('背水！')) {
                                choice = '背水！';
                            } else {
                                choice = 'recover_hp';
                            }
                        } else {
                            choice = 'draw_card';
                        }
                        const { control } = await player
                            .chooseControl(list)
                            .set('prompt', get.prompt(event.skill))
                            .set('choiceList', choiceList)
                            .set('displayIndex', false)
                            .set('choice', choice)
                            .set('ai', () => {
                                return get.event().choice;
                            })
                            .forResult();
                        event.result = {
                            bool: control != 'cancel2',
                            cost_data: control,
                        };
                    }
                },
                async content(event, trigger, player) {
                    const result = event.cost_data;
                    if (result == '背水！' && player.skin.name === 'zshy_AAZZweiyanBSP_1') {
                        player.logSkill('zshy_SWYkuanggu');
                    } else {
                        player.logSkill('zshy_SWYkuanggu');
                    }

                    if (result == 'recover_hp' || result == '背水！') {
                        await player.recover();
                    }
                    if (result == 'draw_card' || result == '背水！') {
                        await player.draw();
                    }
                    if (result == '背水！' && player.countCards('he')) {
                        await player.addTempSkill('zshy_SWYkuanggu_effect', 'phaseChange');
                        player.addMark('zshy_SWYkuanggu_effect', 1, false);
                    }
                },
                getIndex(event, player) {
                    return event.num;
                },
            },
            skill2: {
                audio: 'ext:诸神寰宇/audio/character:4',
                trigger: {
                    source: 'damageSource',
                },
                filter(event, player) {
                    return event.num > 0;
                },
                frequent: true,
                popup: false,
                async cost(event, trigger, player) {
                    let choice,
                        list = ['draw_card'],
                        choiceList = ['选项一：回复1点体力', '选项二：摸一张牌'];
                    if (player.getStorage('zshy_SWYkuanggu', 0)) {
                        list.push('背水！');
                        choiceList.push('背水：令你本阶段使用【杀】的次数+1');
                    }
                    if (player.isDamaged()) {
                        list.unshift('recover_hp');
                    } else {
                        choiceList[0] = `<span class = 'transparent'>${choiceList[0]}</span>`;
                    }
                    if (list.length == 1) {
                        event.result = await player.chooseBool(get.prompt(event.skill), '摸一张牌').set('frequentSkill', event.skill).forResult();
                        event.result.cost_data = 'draw_card';
                    } else {
                        list.push('cancel2');
                        if (
                            player.isDamaged() &&
                            get.recoverEffect(player) > 0 &&
                            player.countCards('hs', function (card) {
                                return card.name == 'sha' && player.hasValueTarget(card);
                            }) >= player.getCardUsable('sha')
                        ) {
                            if (list.includes('背水！')) {
                                choice = '背水！';
                            } else {
                                choice = 'recover_hp';
                            }
                        } else {
                            choice = 'draw_card';
                        }
                        const { control } = await player
                            .chooseControl(list)
                            .set('prompt', get.prompt(event.skill))
                            .set('choiceList', choiceList)
                            .set('displayIndex', false)
                            .set('choice', choice)
                            .set('ai', () => {
                                return get.event().choice;
                            })
                            .forResult();
                        event.result = {
                            bool: control != 'cancel2',
                            cost_data: control,
                        };
                    }
                },
                async content(event, trigger, player) {
                    const result = event.cost_data;
                    if (result == '背水！' && player.skin.name === 'zshy_AAZZweiyanBSP_1') {
                        player.logSkill('zshy_SWYkuanggu_skill2');
                    } else {
                        player.logSkill('zshy_SWYkuanggu_skill2');
                    }

                    if (result == 'recover_hp' || result == '背水！') {
                        await player.recover();
                    }
                    if (result == 'draw_card' || result == '背水！') {
                        await player.draw();
                    }
                    if (result == '背水！' && player.countCards('he')) {
                        await player.addTempSkill('zshy_SWYkuanggu_effect', 'phaseChange');
                        player.addMark('zshy_SWYkuanggu_effect', 1, false);
                    }
                },
                getIndex(event, player) {
                    return event.num;
                },
            },
            effect: {
                charlotte: true,
                onremove: true,
                mod: {
                    cardUsable(card, player, num) {
                        if (player.countMark('zshy_SWYkuanggu_effect') && card.name == 'sha') {
                            return num + player.countMark('zshy_SWYkuanggu_effect');
                        }
                    },
                },
            },
        },
    },
    zshy_SWYkunfen: {//困奋
        audio: 'ext:诸神寰宇/audio/character:2',
        trigger: { player: 'phaseJieshuBegin' },
        forced: true,
        async content(event, trigger, player) {
            await player.loseHp(), player.draw(3);
        },
        ai: { threaten: 1.5 },

    },
};

export default skill;
