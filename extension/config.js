import { lib, game } from '../../../noname.js';

const EXT_PATH = 'extension/诸神寰宇/other/';

// 1.11.6.1 game/package.js 的本体包；不按 all.characters 猜测扩展包归属。
const BUILTIN_CHARACTER_PACKS = new Set([
    'standard', 'shenhua', 'extra', 'yijiang', 'refresh', 'sp', 'sp2', 'newjiang',
    'onlyOL', 'yingbian', 'clan', 'huicui', 'xianding', 'mobile', 'shiji', 'sb',
    'bingshi', 'tw', 'collab', 'old', 'offline', 'jsrg', 'sxrm', 'sixiang', 'diy', 'key',
]);

/**
 * 卡背/立绘选择菜单的通用渲染。
 * @param {HTMLElement} node 菜单节点
 * @param {string} link 选项值（文件名）
 * @param {{ folder: string, heightRatio: number, className: string }} options
 */
function renderBackgroundMenu(node, link, { folder, heightRatio, className }) {
    node.style.height = `${node.offsetWidth * heightRatio}px`;
    node.style.backgroundSize = '100% 100%';
    node.className = className;
    node.setBackgroundImage(`${EXT_PATH}Picture/${folder}/${link}.jpg`);
}

/**
 * 设置分区折叠：点击分区标题，折叠/展开它后面的配置项（直到下一个「———★」标题为止）。
 * 引擎的扩展设置是扁平 .config 节点列表，没有原生分组；这里在标题行的 onclick 里按兄弟节点处理。
 * 默认全部展开；第一次点击折叠，再点展开。
 * @param {object} cfg 分区标题的配置对象
 */
function sectionFold(cfg) {
    cfg.onclick = function (on) {
        const collapse = on === true;
        const nodes = Array.from(this.parentNode.children);
        const index = nodes.indexOf(this);
        for (let i = index + 1; i < nodes.length; i++) {
            const node = nodes[i];
            const sub = node._link && node._link.config;
            if (!sub) continue;
            if (sub.clear && String(sub.name).includes('———★')) break;
            node.style.display = collapse ? 'none' : '';
        }
        this.classList.toggle('folded', collapse);
    };
}

// 设置文字配色与信息栏/帮助页一致：金色标题 + 浅色正文；设置背景保持引擎默认
const CFG_GOLD = '#e8d5a3';
const CFG_BODY = 'rgba(255,255,255,0.88)';
function cfgName(text, gold) {
    return '<span style="color:' + (gold ? CFG_GOLD : CFG_BODY) + ';' + (gold ? 'font-weight:bold;letter-spacing:1px;' : '') + '">' + text + '</span>';
}

export const config = {
    // ———★扩展AI设置★———
    AIconfig: {
        name: cfgName('———★扩展AI设置★——— ▼', true),
        clear: true,
    },
    JXYGYS: {
        name: cfgName('远古遗神仅点将可选'),
        clear: true,
    },
    JXBTWJ: {
        name: cfgName('关闭所有本体武将'),
        init: false,
        restart: true,
        intro: '<li>开启后，一键关闭所有三国杀本体武将（standard、shenhua、sp、tw、ol 等全部官方武将包），只保留扩展武将。' +
            '<li>重启后生效；关闭本项并重启即可全部恢复。' +
            '<li>只影响武将能否被选到，不会删除任何武将数据，也不会动扩展自己的武将。',
        onclick(bool) {
            // 注意：扩展自己定义了 onclick 时，引擎不会再自动保存配置，必须自己存
            const key = 'extension_诸神寰宇_JXBTWJ';
            const backupKey = `${key}_backup`;
            const wasEnabled = lib.config[key] === true;
            game.saveConfig(key, bool);
            if (bool) {
                // 每次关闭→开启都保存当次快照；重复开启不覆盖，空列表也是合法快照。
                if (!wasEnabled || !Array.isArray(lib.config[backupKey])) {
                    game.saveConfig(backupKey, lib.config.characters.slice());
                }
                const characters = lib.config.characters.filter(packName => !BUILTIN_CHARACTER_PACKS.has(packName));
                game.saveConfig('characters', characters);
                if (confirm('已关闭所有本体武将包，需要重启游戏后生效。\n是否立即重启？')) game.reload();
            } else {
                // 关闭：恢复至开启前备份的武将包设置
                const saved = lib.config[backupKey];
                if (wasEnabled && Array.isArray(saved)) game.saveConfig('characters', saved.slice());
                game.saveConfig(backupKey); // 恢复后清除旧备份，避免覆盖之后的手动配置。
                if (confirm('已恢复原本的武将包设置，需要重启游戏后生效。\n是否立即重启？')) game.reload();
            }
        },
    },
    JXZSHY: {
        name: cfgName('诸神寰宇仅点将可选'),
        init: false,
        intro: '<li>搬运魔改自《天牢令》，特此致谢！<li>开启后，一键禁止AI选择诸神寰宇包除远古遗神外的所有非三国武将。',
    },
    JXGYCH: {
        name: cfgName('烬系武将仅点将可选'),
        init: false,
        intro: '<li>搬运魔改自《天牢令》，特此致谢！<li>开启后，一键禁止AI选择烬系列武将。',
    },
    JXSGCS: {
        name: cfgName('传说武将仅点将可选'),
        init: false,
        intro: '<li>搬运魔改自《天牢令》，特此致谢！<li>开启后，一键禁止AI选择三国武将的非烬世魂系列传说品质武将(SSS)。',
    },
    JXSGSS: {
        name: cfgName('史诗武将仅点将可选'),
        init: false,
        intro: '<li>搬运魔改自《天牢令》，特此致谢！<li>开启后，一键禁止AI选择三国武将的史诗品质武将(SS)。',
    },
    JXSGXY: {
        name: cfgName('稀有武将仅点将可选'),
        init: false,
        intro: '<li>搬运魔改自《天牢令》，特此致谢！<li>开启后，一键禁止AI选择三国武将的稀有品质武将(S)。',
    },
    JXSGJP: {
        name: cfgName('普通武将仅点将可选'),
        init: false,
        intro: '<li>搬运魔改自《天牢令》，特此致谢！<li>开启后，一键禁止AI选择三国武将的普通品质武将(A)。',
    },
    // ———★扩展功能设置★———
    Setconfig: {
        name: cfgName('———★扩展功能设置★——— ▼', true),
        clear: true,
    },
    Nihilism_WJQZ: {
        name: cfgName('武将前缀'),
        intro: '<li>搬运魔改自《第叁幻界》，特此致谢！<li>选择后，调整本扩展武将分包中对应武将的前缀。',
        init: '2',
        item: {
            '1': '隐藏前缀',
            '2': '高亮前缀',
        },
    },
    KPBJ: {
        name: cfgName('卡牌背景'),
        intro: '<li>搬运魔改自《倾国倾城》，特此致谢！<li>选择后，可以根据自己的喜好选择卡背样式。',
        init: '默认',
        item: {
            '默认': '默认',
            '传统': '传统',
            '复古': '复古',
            '科幻': '科幻',
            '石金': '石金',
            '无名': '无名',
            '周年': '周年',
            '纯金': '纯金',
            '古典': '古典',
            '金龙': '金龙',
            '无边': '无边',
            '炫彩': '炫彩',
            '绝境': '绝境',
        },
        onclick(item) {
            game.saveConfig('extension_诸神寰宇_KPBJ', item);
            game.zshyApplyCardback(item); // 立即生效
        },
        visualMenu(node, link) {
            renderBackgroundMenu(node, link, { folder: 'Cardback', heightRatio: 1.4, className: 'button character incardback' });
        },
    },
    WJBJ: {
        name: cfgName('武将背景'),
        intro: '选择后，可以根据自己的喜好选择武将背面样式。',
        init: '默认',
        item: {
            '默认': '默认',
            '复古': '复古',
            '金龙': '金龙',
            '无名': '无名',
            '银龙': '银龙',
            '纸金': '纸金',
            '周年': '周年',
            '暗影': '暗影',
            '低调': '低调',
            '耀金': '耀金',
            '朴素': '朴素',
            '男影': '男影',
            '女影': '女影',
            '炫彩': '炫彩',
        },
        onclick(item) {
            game.saveConfig('extension_诸神寰宇_WJBJ', item);
            game.zshyApplyRoleback(item); // 立即生效
        },
        visualMenu(node, link) {
            renderBackgroundMenu(node, link, { folder: 'Roleback', heightRatio: 1.4, className: 'button character inroleback' });
        },
    },
    BJYY: {
        name: cfgName('背景音乐'),
        intro: '搬运魔改自《倾国倾城》，特此致谢！<br>选择后，立即更换游戏背景音乐。',
        init: lib.config.extension_诸神寰宇_BJYY === undefined ? '1' : lib.config.extension_诸神寰宇_BJYY,
        item: {
            '0': '随机',
            '1': '默认',
            '2': '无感.mp3',
            '3': '孙尚香-空气凝、洛天依、乐正绫.mp3',
            '4': '忆红莲-洛天依.mp3',
            '5': '白石溪-洛天依、乐正绫.mp3',
            '6': '没有选择-封茗囧菌.mp3',
            '7': '霜雪千年-洛天依、乐正绫.mp3',
            '8': '操戈天下2.0-洛天依.mp3',
        },
        onclick(item) {
            game.saveConfig('extension_诸神寰宇_BJYY', item);
            if (item === '1') game.playBackgroundMusic(); // 切回本体音乐
            else {
                game.zshyHookBackgroundMusic(); // ended 监听器只挂一次
                game.zshyplayBackgroundMusic();
            }
        },
    },
    BJTP: {
        name: cfgName('背景图片'),
        intro: '搬运魔改自《时空枢纽》，特此致谢！<br>选择后，立即更换游戏背景图片。',
        init: lib.config.extension_诸神寰宇_BJTP === undefined ? '1' : lib.config.extension_诸神寰宇_BJTP,
        item: {
            '0': '随机',
            '1': '默认',
            '洛天依-海洋精灵': '洛天依-海洋精灵',
            '乐正绫-惊鸿一舞': '乐正绫-惊鸿一舞',
            '鲍三娘-飒沓绯霜': '鲍三娘-飒沓绯霜',
            '谋孙坚-横刀立马': '谋孙坚-横刀立马',
            '白龙-背': '白龙-背',
            '白龙-侧': '白龙-侧',
            '黑龙': '黑龙',
            '苍澜': '苍澜',
            '罪恋': '罪恋',
            '娘化钟会': '娘化钟会',
            '娘化姜维': '娘化姜维',
            '娘化马超': '娘化马超',
            '娘化文鸯': '娘化文鸯',
            '洛天依': '洛天依',
        },
        onclick(item) {
            game.saveConfig('extension_诸神寰宇_BJTP', item);
            game.zshyplayBackgroundPicture();
        },
        visualMenu(node, link) {
            renderBackgroundMenu(node, link, { folder: 'Wallpaper', heightRatio: 0.67, className: 'button character zshyBackgroundname' });
        },
    },
    QTSJ: {
        name: cfgName('自动切换间隔'),
        intro: '当“背景图片”选择“随机”时，每隔多久自动切换一次。',
        init: '30000',
        item: {
            '15000': '15秒',
            '30000': '30秒',
            '60000': '1分钟',
            '120000': '2分钟',
        },
    },
    SPZL: {
        name: cfgName('手牌整理'),
        init: true,
        intro: '搬运魔改自《特效测试》，特此致谢！<br>开启后，玩家获得和失去手牌后，系统将自动按照类型/花色/点数/属性进行手牌整理。',
    },
    SJYB: {
        name: cfgName('随机应变'),
        init: true,
        intro: '搬运魔改自《第叁幻界》，特此致谢！<br>开启后，仅身份模式有效，当一名反贼或忠臣死亡时，内奸可以与其交换身份；电脑内奸会按场面局势自行判断是否发动。',
    },
    ZWZJ: {
        name: cfgName('主亡忠继模式'),
        init: true,
        intro: '搬运魔改自《第叁幻界》，特此致谢！<br>身份模式生效，主公死亡时由主公选择一名忠臣继位：继位者增加1点体力上限并回复1点体力，若其拥有主公技则一并获得，重启生效。',
    },
    SCWJ: {
        name: cfgName('点击清除已收藏的武将'),
        clear: true,
        init: true,
        intro: '搬运魔改自《第叁幻界》，特此致谢！',
        onclick() {
            if (!lib.config.favouriteCharacter.length) {
                alert('提示：您当前没有已收藏的武将，无需操作！');
                return;
            }
            if (!confirm('请确认是否要清除当前所有已收藏的武将？')) return;
            const list = lib.config.favouriteCharacter.filter((name) => lib.character[name]);
            lib.config.favouriteCharacter.removeArray(list);
            game.saveConfig('favouriteCharacter', lib.config.favouriteCharacter);
            game.uncheck();
            game.check();
            if (confirm('清除成功，是否立即重启游戏以应用清除？')) game.reload();
        },
    },
    // ———★愉快の旅途★———
    End: {
        name: cfgName('———★愉快の旅途★———', true),
        clear: true,
    },
};
// 给标记了 sectionFold 的分区标题挂上折叠行为（默认展开）
['AIconfig', 'Setconfig'].forEach(function (key) {
    if (config[key]) sectionFold(config[key]);
});
