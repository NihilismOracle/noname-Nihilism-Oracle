import { lib, game, ui, get, ai, _status } from '../../../noname.js';
import { rank } from '../character/rank.js';

// 信息栏「新武将」点击：打开本体武将详情
if (typeof window != 'undefined') {
    window.zshyShowCharacter = function (id) {
        try {
            if (ui.click && ui.click.charactercard) ui.click.charactercard(id);
        } catch (e) {
            console.error(e);
        }
    };
}
// 扩展资源根路径（相对 lib.assetURL）
const EXT_PATH = 'extension/诸神寰宇/other/';

// 背景音乐：配置值 → 文件名
const BGM_LIST = {
    2: '无感.mp3',
    3: '孙尚香-空气凝、洛天依、乐正绫.mp3',
    4: '忆红莲-洛天依.mp3',
    5: '白石溪-洛天依、乐正绫.mp3',
    6: '没有选择-封茗囧菌.mp3',
    7: '霜雪千年-洛天依、乐正绫.mp3',
    8: '操戈天下2.0-洛天依.mp3',
};

// 背景图片随机池
const WALLPAPER_LIST = [
    '洛天依-海洋精灵',
    '乐正绫-惊鸿一舞',
    '鲍三娘-飒沓绯霜',
    '谋孙坚-横刀立马',
    '白龙-背',
    '白龙-侧',
    '黑龙',
    '苍澜',
    '罪恋',
    '娘化钟会',
    '娘化姜维',
    '娘化马超',
    '娘化文鸯',
    '洛天依',
];

// 洛天依专属音乐：序号 → 描述与文件
const ZSYY_MUSIC = {
    1: { label: '播放“洛天依”的专属音乐：霜雪千年-洛天依、乐正绫', file: '霜雪千年-洛天依、乐正绫.mp3' },
    2: { label: '播放“洛天依”的专属音乐：白石溪-洛天依、乐正绫', file: '白石溪-洛天依、乐正绫.mp3' },
    3: { label: '播放“洛天依”的专属音乐：忆红莲-洛天依', file: '忆红莲-洛天依.mp3' },
    4: { label: '播放“洛天依”的专属音乐：操戈天下2.0-洛天依', file: '操戈天下2.0-洛天依.mp3' },
    5: { label: '播放“洛天依”的专属音乐：孙尚香-空气凝、洛天依、乐正绫', file: '孙尚香-空气凝、洛天依、乐正绫.mp3' },
};

// 武将前缀：按配置项数字选择显示风格
const PREFIX_CONFIG = {
    1: {
        '安璟': { showName: '安璟' },
        '安天痕': { showName: '安天痕' },
        '灭魂': { showName: '灭魂' },
        '盅墨': { showName: '盅墨' },
        '罪恋': { showName: '罪恋' },
        '艾莎': { showName: '艾莎' },
        '黯日': { showName: '黯日' },
        '苍澜': { showName: '苍澜' },
        '金牛座': { showName: '金牛座' },
        '初音未来': { showName: '初音未来' },
        '古月方源': { showName: '古月方源' },
        '龙裔': { showName: '龙裔' },
        '苏晓': { showName: '苏晓' },
        '乌兰麦朵': { showName: '乌兰麦朵' },
        '杨间': { showName: '杨间' },
        '异乡人': { showName: '异乡人' },
        '莉莉姆': { showName: '莉莉姆' },
        '洛天依': { showName: '洛天依' },
        '乐正绫': { showName: '乐正绫' },
        '烬': { showName: '' },
        '魂': { showName: '魂' },
        '烬神': { getSpan: () => `${get.prefixSpan('神')}` },
        '墟': { showName: '' },
        '墟族': { getSpan: () => `${get.prefixSpan('族')}` },
        '墟势': { getSpan: () => `${get.prefixSpan('势')}` },
        '墟武': { getSpan: () => `${get.prefixSpan('武')}` },
        '墟SP': { getSpan: () => `${get.prefixSpan('SP')}` },
        '墟谋': { getSpan: () => `${get.prefixSpan('谋')}` },
        '墟魔': { getSpan: () => `${get.prefixSpan('魔')}` },
        '墟神': { getSpan: () => `${get.prefixSpan('神')}` },
    },
    2: {
        '安璟': { color: '#000000', nature: 'shenmm', showName: '神尊' },
        '安天痕': { color: '#000000', nature: 'shenmm', showName: '虚空之影' },
        '灭魂': { color: '#000000', nature: 'shenmm', showName: '戏命魔师' },
        '盅墨': { color: '#000000', nature: 'shenmm', showName: '墨染春秋' },
        '罪恋': { color: '#000000', nature: 'shenmm', showName: '焚罪业火' },
        '艾莎': { color: '#000000', nature: 'shenmm', showName: '亡灵公主' },
        '黯日': { color: '#000000', nature: 'shenmm', showName: '末世君主' },
        '苍澜': { color: '#000000', nature: 'shenmm', showName: '孤身侠客' },
        '金牛座': { color: '#000000', nature: 'shenmm', showName: '金牛座' },
        '初音未来': { color: '#000000', nature: 'shenmm', showName: '最初之音' },
        '古月方源': { color: '#000000', nature: 'shenmm', showName: '大爱仙尊' },
        '龙裔': { color: '#000000', nature: 'shenmm', showName: '末世龙裔' },
        '苏晓': { color: '#000000', nature: 'shenmm', showName: '灭法之影' },
        '乌兰麦朵': { color: '#000000', nature: 'shenmm', showName: '麦朵' },
        '杨间': { color: '#000000', nature: 'shenmm', showName: '杨戬' },
        '异乡人': { color: '#000000', nature: 'shenmm', showName: '老猎人' },
        '莉莉姆': { color: '#000000', nature: 'shenmm', showName: '翡翠恶魔' },
        '洛天依': { color: '#000000', nature: 'shenmm', showName: '华风夏韵' },
        '言和': { color: '#000000', nature: 'shenmm', showName: '清弦惊鸿' },
        '乐正绫': { color: '#000000', nature: 'shenmm', showName: '绯色炫音' },
        '世': { color: '#000000', nature: 'shenmm', showName: '世' },
        '命': { color: '#000000', nature: 'shenmm', showName: '命' },
        '魂': { color: '#000000', nature: 'shenmm', showName: '魂' },
        '烬': { color: '#000000', nature: 'shenmm', showName: '烬' },
        '烬神': { getSpan: () => `${get.prefixSpan('烬')}${get.prefixSpan('神')}` },
        '墟': { color: '#000000', nature: 'shenmm', showName: '墟' },
        '势': { color: '#8B0000', nature: 'shenmm', showName: '势' },
        '墟族': { getSpan: () => `${get.prefixSpan('墟')}${get.prefixSpan('族')}` },
        '墟势': { getSpan: () => `${get.prefixSpan('墟')}${get.prefixSpan('势')}` },
        '墟武': { getSpan: () => `${get.prefixSpan('墟')}${get.prefixSpan('武')}` },
        '墟SP': { getSpan: () => `${get.prefixSpan('墟')}${get.prefixSpan('SP')}` },
        '墟谋': { getSpan: () => `${get.prefixSpan('墟')}${get.prefixSpan('谋')}` },
        '墟魔': { getSpan: () => `${get.prefixSpan('墟')}${get.prefixSpan('魔')}` },
        '墟神': { getSpan: () => `${get.prefixSpan('墟')}${get.prefixSpan('神')}` },
    },
};

/**
 * 在 lib.filter.characterDisabled 上叠加一层过滤：判定为 true 的武将不可选。
 */
function addCharacterFilter(isDisabled) {
    const previous = lib.filter.characterDisabled;
    lib.filter.characterDisabled = (name, character) => {
        if (lib.character[name] && isDisabled(name)) return true;
        return previous(name, character);
    };
}

// 按武将名前缀过滤
const byPrefix = (prefix) => (name) => name.startsWith(prefix);

// 按评级稀有度过滤（只针对三国传说系列 zshy_AAZZ）
function byRank(rarity) {
    const disabled = new Set(lib.rank.rarity[rarity].filter((name) => name.startsWith('zshy_AAZZ')));
    return (name) => disabled.has(name);
}

/**
 * 应用卡面/武将背景：移除旧样式后按当前配置重建。
 */
function applyBackgroundStyle(cacheKey, selector, item, folder) {
    if (lib[cacheKey]) {
        lib[cacheKey].remove();
        delete lib[cacheKey];
    }
    if (!item || item === '默认') return;
    const style = document.createElement('style');
    style.innerHTML = `${selector}{background:url('${lib.assetURL}${EXT_PATH}Picture/${folder}/${item}.jpg');background-size:100% 100% !important;}`;
    document.head.appendChild(style);
    lib[cacheKey] = style;
}

// 供外部扩展注入游戏上下文的旧入口（保留同名别名）
const exposeContext = (func) => func(lib, game, ui, get, ai, _status);

export async function content(config, pack) {
    // 武将评级
    lib.rank.rarity.junk.add(...rank.A);
    lib.rank.rarity.rare.add(...rank.S);
    lib.rank.rarity.epic.add(...rank.SS);
    lib.rank.rarity.legend.add(...rank.Nihilism, ...rank.SSS);

    // 远古遗神仅点将可选（逻辑在 config.js 的 JXBTWJ.onclick，这里只做过滤）
    addCharacterFilter(byPrefix('Nihilism_AAAA'));
    addCharacterFilter(byPrefix('zshy_AAAA'));

    // 武将仅点将可选设置
    if (config.JXZSHY) addCharacterFilter(byPrefix('zshy_AAA')); // 禁用诸神寰宇
    if (config.JXGYCH) addCharacterFilter(byPrefix('zshy_AAYA')); // 禁用烬系武将
    if (config.JXSGCS) addCharacterFilter(byRank('legend')); // 禁用三国传说
    if (config.JXSGSS) addCharacterFilter(byRank('epic')); // 禁用三国史诗
    if (config.JXSGXY) addCharacterFilter(byRank('rare')); // 禁用三国稀有
    if (config.JXSGJP) addCharacterFilter(byRank('junk')); // 禁用三国普通

    // 武将前缀
    const prefixOptions = PREFIX_CONFIG[config.Nihilism_WJQZ];
    if (prefixOptions) {
        for (const [key, option] of Object.entries(prefixOptions)) {
            lib.namePrefix.set(key, option);
        }
    }

    // 卡面背景
    game.zshyApplyCardback = (item) => applyBackgroundStyle('zshyKPcss', '.card:empty,.card.infohidden', item, 'Cardback');
    game.zshyApplyCardback(lib.config.extension_诸神寰宇_KPBJ);
    window.kpimport = exposeContext;

    // 武将背景
    game.zshyApplyRoleback = (item) => applyBackgroundStyle('zshyWJcss', '#window .player', item, 'Roleback');
    game.zshyApplyRoleback(lib.config.extension_诸神寰宇_WJBJ);
    window.wjimport = exposeContext;

    // 背景音乐：ended 监听器只挂一次，避免每次切换都叠加
    game.zshyHookBackgroundMusic = () => {
        if (ui.backgroundMusic.zshyEndedHooked) return;
        ui.backgroundMusic.addEventListener('ended', game.zshyplayBackgroundMusic);
        ui.backgroundMusic.zshyEndedHooked = true;
    };
    game.zshyplayBackgroundMusic = () => {
        let temp = lib.config.extension_诸神寰宇_BJYY;
        if (!temp || temp === '1') return; // 默认音乐交还本体循环
        if (temp === '0') temp = String(Math.floor(Math.random() * 7) + 2); // 2~8 随机
        ui.backgroundMusic.pause();
        const file = BGM_LIST[temp];
        if (file) ui.backgroundMusic.src = `${lib.assetURL}${EXT_PATH}Music/${file}`;
        else game.playBackgroundMusic();
    };
    if (lib.config.extension_诸神寰宇_BJYY && lib.config.extension_诸神寰宇_BJYY !== '1') {
        lib.arenaReady.push(() => {
            game.zshyHookBackgroundMusic();
            game.zshyplayBackgroundMusic();
        });
    }

    // 背景图片
    game.zshyplayBackgroundPicture = () => {
        if (_status.zshyplayBackgroundPicture_timeout) {
            clearTimeout(_status.zshyplayBackgroundPicture_timeout);
            delete _status.zshyplayBackgroundPicture_timeout;
        }
        let temp = lib.config.extension_诸神寰宇_BJTP;
        if (temp === '0') {
            const list = [...WALLPAPER_LIST];
            if (_status.zshyplayBackgroundPicture) list.remove(_status.zshyplayBackgroundPicture);
            temp = list.randomGet();
        }
        _status.zshyplayBackgroundPicture = temp;
        const url = temp !== '1'
            ? `${EXT_PATH}Picture/Wallpaper/${temp}.jpg`
            : `image/background/${lib.config.image_background}.jpg`;
        game.broadcastAll((imageUrl) => {
            ui.background.setBackgroundImage(imageUrl);
        }, url);
        if (lib.config.extension_诸神寰宇_BJTP === '0') {
            const autotime = Number.parseInt(lib.config.extension_诸神寰宇_QTSJ, 10);
            let timeout = Number.isFinite(autotime) ? autotime : 30000;
            if (!(timeout > 0)) timeout = 30000;
            _status.zshyplayBackgroundPicture_timeout = setTimeout(() => {
                game.zshyplayBackgroundPicture();
            }, timeout);
        }
    };
    if (lib.config.extension_诸神寰宇_BJTP && lib.config.extension_诸神寰宇_BJTP !== '1') {
        lib.arenaReady.push(() => {
            game.zshyplayBackgroundPicture();
        });
    }

    // 手牌整理
    if (config.SPZL) {
        lib.sort.card2 = (a, b) => {
            if (a.name !== b.name) return lib.sort.card(a.name, b.name);
            if (a.suit !== b.suit) return lib.suit.indexOf(a.suit) - lib.suit.indexOf(b.suit);
            if (a.number !== b.number) return a.number - b.number;
            if (a.nature !== b.nature) return a.nature - b.nature;
            return Number(a.cardid) - Number(b.cardid);
        };
        lib.skill._SPZL = {
            trigger: {
                player: ['gainAfter', 'loseAfter'],
            },
            fixed: true,
            popup: false,
            silent: true,
            forced: true,
            unique: true,
            firstDo: true,
            charlotte: true,
            priority: Infinity,
            superCharlotte: true,
            filter(event, player) {
                if (player !== game.me || !player.countCards('h')) return false;
                const cards = player.getCards('h');
                const sorted = [...cards].sort((a, b) => lib.sort[player.useCard2 ? 'rd_duel' : 'card2'](a, b));
                return !sorted.every((card, index) => card === cards[index]);
            },
            content() {
                const sortCards = (a, b) => -lib.sort[player.useCard2 ? 'rd_duel' : 'card2'](a, b);
                const sortByPosition = (a, b) => {
                    const p1 = get.position(a);
                    const p2 = get.position(b);
                    if (p1 !== p2) return p1 === 'h' ? 1 : -1;
                    return sortCards(a, b);
                };
                const cards = player.getCards('hs');
                if (cards.length <= 1) return;
                if (window.dui && dui.queueNextFrameTick) {
                    cards.sort(sortByPosition);
                    cards.forEach((card, index) => {
                        player.node.handcards1.insertBefore(cards[index], player.node.handcards1.firstChild);
                    });
                    dui.queueNextFrameTick(dui.layoutHand, dui);
                } else {
                    game.addVideo('lose', player, [get.cardsInfo(cards), [], []]);
                    for (const card of cards) card.goto(ui.special);
                    cards.sort(sortByPosition);
                    player.directgain(cards, false);
                }
            },
        };
    }

    // 随机应变：内奸与忠臣/反贼交换身份（AI 会按场面自行判断是否发动）
    if (config.SJYB) {
        lib.translate._SJYB = '随机应变';
        lib.skill._SJYB = {
            superCharlotte: true,
            forceunique: true,
            noDisabled: true,
            charlotte: true,
            noDeprive: true,
            noRemove: true,
            noLose: true,
            noGain: true,
            unique: true,
            locked: true,
            noAdd: true,
            fixed: true,
            trigger: {
                global: 'dieBegin',
            },
            lastDo: true,
            priority: -999,
            logTarget: 'player',
            filter(event, player) {
                if (get.mode() !== 'identity') return false;
                if (player.identity !== 'nei') return false;
                return ['zhong', 'mingzhong', 'fan'].includes(event.player.identity);
            },
            prompt2(event) {
                return `与${get.translation(event.player)}交换身份：你成为${get.translation(event.player.identity)}，对方成为内奸`;
            },
            check(event, player) {
                const dying = event.player;
                if (!dying) return false;
                const camp = dying.identity === 'mingzhong' ? 'zhong' : dying.identity;
                const zhu = game.zhu && game.zhu !== dying && game.zhu.isAlive() ? game.zhu : null;
                const power = (list) => list.reduce((sum, current) => sum + Math.max(current.hp, 0) + current.countCards('h') * 0.4, 0);
                const zhuSide = game.players.filter((current) => current !== dying && current !== player && (current === zhu || ['zhong', 'mingzhong'].includes(current.identity)));
                const fanSide = game.players.filter((current) => current !== dying && current !== player && current.identity === 'fan');
                const selfPower = Math.max(player.hp, 0) + player.countCards('h') * 0.4;
                if (camp === 'zhong') {
                    if (!zhu) return false;
                    // 反贼已经全灭：换成忠臣身份就能和主公一起获胜
                    if (!fanSide.length) return true;
                    return power(zhuSide) + selfPower > power(fanSide) * 1.2;
                }
                // 换成反贼：主公死亡则反贼获胜
                if (!zhu) return false;
                const zhuPower = Math.max(zhu.hp, 0) + zhu.countCards('h') * 0.4;
                if (power(fanSide) > power(zhuSide) * 1.2) return true;
                if (!zhuSide.length && zhuPower <= selfPower) return true;
                return zhuPower <= 2;
            },
            content() {
                const dying = trigger.player;
                game.broadcastAll((from, to) => {
                    const identity = from.identity;
                    from.identity = to.identity;
                    to.identity = identity;
                    // 已亮明身份的双方都要刷新标签，否则界面显示的仍是交换前的身份
                    if (from.identityShown || from === game.me) from.setIdentity();
                    if (to.identityShown) to.setIdentity();
                    // 明忠指针跟随身份一起转移
                    if (to === game.zhong) game.zhong = from;
                    game.log(from, '与', to, '交换了身份');
                }, player, dying);
            },
        };
    }

    // 主亡忠继：主公死亡时选择一名忠臣继承主公之位，继位者加体力上限并回复体力，若其有主公技则获得
    if (config.ZWZJ && lib.config.mode === 'identity') {
        lib.skill._xigua_zhuwanzhongji_ = {
            charlotte: true,
            trigger: {
                global: 'dieBegin',
            },
            forced: true,
            filter(event) {
                if (event._zhuwanzhongji) return false;
                if (event.player.identity !== 'zhu') return false;
                return game.hasPlayer((current) => current !== event.player && ['zhong', 'mingzhong'].includes(current.identity));
            },
            logTarget: 'player',
            async content(event, trigger) {
                if (trigger._zhuwanzhongji) return;
                trigger._zhuwanzhongji = true;
                const zhu = trigger.player;
                const candidates = game.filterPlayer((current) => current !== zhu && ['zhong', 'mingzhong'].includes(current.identity));
                if (!candidates.length) return;
                const result = await zhu
                    .chooseTarget('【主亡忠继】：选择一名忠臣继承主公之位', true, (card, player, target) => candidates.includes(target))
                    .set('ai', (target) => {
                        const me = _status.event.player;
                        let value = get.attitude(me, target) + target.hp * 0.1;
                        if (target.getStockSkills(true, true).some((skill) => get.info(skill)?.zhuSkill)) value += 2;
                        return value;
                    })
                    .forResult();
                if (!result.bool || !result.targets?.length) return;
                const heir = result.targets[0];
                await heir.gainMaxHp();
                await heir.recover();
                game.broadcastAll((deadZhu, successor) => {
                    const identity = successor.identity;
                    if (identity === 'mingzhong') game.zhong = deadZhu;
                    successor.identity = 'zhu';
                    game.zhu = successor;
                    deadZhu.identity = identity;
                    // showIdentity 会同时刷新 isZhu、identityShown 与头像/座位显示
                    deadZhu.showIdentity();
                    successor.showIdentity();
                }, zhu, heir);
                const zhuSkills = heir.getStockSkills(true, true).filter((skill) => !heir.hasSkill(skill) && get.info(skill)?.zhuSkill);
                if (zhuSkills.length) await heir.addSkills(zhuSkills);
                await trigger.trigger('zhuUpdate');
            },
        };
    }

    // 洛天依专属 BGM：进入游戏/首回合时选择要播放的音乐
    lib.skill._ZSYY = {
        trigger: {
            global: 'phaseBefore',
            player: 'enterGame',
        },
        fixed: true,
        popup: false,
        unique: true,
        forced: true,
        silent: true,
        lastDo: true,
        charlotte: true,
        superCharlotte: true,
        filter(event, player) {
            if (event.name !== 'phase' && game.phaseNumber !== 0) return false;
            if (player !== game.me && !player.isUnderControl()) return false;
            return game.hasPlayer((current) => ['zshy_AAADluotianyi', 'zshy_AAADyuezhengling', 'zshy_AAAZluotianyi'].some(
                (name) => current.name1 === name || current.name2 === name,
            ));
        },
        async content(event, trigger, player) {
            const options = Object.values(ZSYY_MUSIC);
            const buttons = options.map((option, index) => [
                index + 1,
                `<div class="popup text" style="width:calc(100% - 10px);display:inline-block"><div>${option.label}</div></div>`,
            ]);
            const result = await player.chooseButton(['专属音乐：请选择要播放的一首BGM', [buttons, 'textbutton']], null)
                .set('selectButton', 1) // 只能选择一个
                .set('ai', () => Math.floor(Math.random() * options.length)) // AI 随机选择
                .forResult();
            if (!result.bool) return;
            const file = ZSYY_MUSIC[result.links[0]]?.file;
            if (!file) return;
            ui.backgroundMusic.src = `${lib.assetURL}${EXT_PATH}Music/${file}`;
            ui.backgroundMusic.loop = true;
        },
    };
}
