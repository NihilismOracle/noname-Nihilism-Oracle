import { updateInfo } from './extension/updateInfo.js';
import { versionCharacters } from './extension/versionCharacters.js';
import { lib, get, ui } from '../../noname.js';

function setstyle(str) {
    return `<span style='font-family:xinwei' data-nature='shenmm'><font color='#000000'>${str}</font></span>`;
}

function setstyle1(str) {
    return `<span data-nature='shenmm'><font color='#000000'>${str}</font></span>`;
}

// 更新信息统一在这里改：更新时间 / 更新版本 / 适配本体版本
const UPDATE_DATE = '20261113';
const VERSION = '1.0.1';
const GAME_VERSION = '1.11.6.1';

// 本次更新条目来自 updateInfo.js（由《更新日志.md》自动生成）
const latestUpdate = updateInfo;
const updateItems = (latestUpdate.items || []).map(function (text) {
    return '<span style="display:block;">· ' + text + '</span>';
}).join('');

// 分区折叠：<details open> 默认展开，点击标题收起/展开
function fold(title, body, open) {
    return '<details' + (open ? ' open' : '') + ' style="display:block;margin:6px 0;">' +
        '<summary style="cursor:pointer;outline:none;font-size:17px;font-weight:bold;color:#e8d5a3;">' + title + '</summary>' +
        '<span style="display:block;margin-top:4px;">' + body + '</span>' +
        '</details>';
}


// 本次版本的新武将 / 修改武将：HTML 卡片（读 lib.character/lib.translate），点击打开本体详情
function characterCards(ids) {
    return ids.map(function (id) {
        const data = lib.character[id] || {};
        const name = lib.translate[id] || get.translation(id) || id;
        let img = data.img;
        if (!img && Array.isArray(data.trashBin)) {
            const item = data.trashBin.find(x => typeof x == 'string' && x.includes('image/character'));
            if (item) img = item.replace(/^ext:/, 'extension/');
        }
        if (!img) img = 'extension/诸神寰宇/image/character/zshy_AC/' + id + '.jpg';
        return '<span style="display:inline-block;width:60px;margin:4px 6px 4px 0;text-align:center;vertical-align:top;cursor:pointer;" ' +
            'onclick="event.stopPropagation();if(window.zshyShowCharacter)window.zshyShowCharacter(\'' + id + '\');">' +
            '<span style="display:block;width:60px;height:82px;border-radius:6px;background-size:cover;background-position:center;' +
            'background-image:url(\'' + img + '\');border:1px solid rgba(255,255,255,0.25);"></span>' +
            '<span style="display:block;font-size:13px;line-height:1.5;color:rgba(255,255,255,0.9);">' + name + '</span>' +
            '</span>';
    }).join('');
}

function versionCharactersHtml() {
    const data = (versionCharacters && versionCharacters[latestUpdate.date]) || {};
    const added = data.new || [];
    const changed = data.changed || [];
    let html = '';
    if (added.length) {
        html += '<span style="display:block;font-size:14px;color:rgba(255,255,255,0.75);margin:2px 0;">新武将</span>' + characterCards(added);
    }
    if (changed.length) {
        html += '<span style="display:block;font-size:14px;color:rgba(255,255,255,0.75);margin:6px 0 2px;">修改武将</span>' + characterCards(changed);
    }
    return html;
}

function buildIntro() {
    return '<span style="display:block;margin:2px 0 6px;padding:14px 16px;border-radius:10px;' +
    'background:rgba(0,0,0,0.38);border:1px solid rgba(255,255,255,0.18);' +
    'box-shadow:0 2px 10px rgba(0,0,0,0.45);text-align:left;color:rgba(255,255,255,0.92);" ' +
    'onclick="event.stopPropagation();">' +
    '<span style="display:block;text-align:center;font-size:26px;font-weight:bold;letter-spacing:4px;line-height:1.4;">' +
    setstyle('诸神寰宇') +
    '</span>' +
    '<span style="display:block;text-align:center;font-size:14px;color:rgba(255,255,255,0.82);margin-top:6px;line-height:1.6;">' +
    '更新时间：' + UPDATE_DATE + '　·　更新版本：' + VERSION + '　·　适配本体：' + GAME_VERSION +
    '</span>' +
    '<span style="display:block;border-top:1px solid rgba(255,255,255,0.15);margin:8px 0 6px;"></span>' +
    fold('★ 本次更新（' + latestUpdate.date + '）',
        '<span style="display:block;font-size:15px;line-height:1.85;color:rgba(255,255,255,0.92);">' + updateItems + '</span>', true) +
    fold('★ 本次更新武将（查看）', versionCharactersHtml(), false) +
    fold('★ 扩展介绍',
        '<span style="display:block;font-size:15px;line-height:1.85;">' +
        '· 《诸神寰宇》为个人制作的免费扩展，包含原创/魔改武将、技能、卡牌与专属机制（绝恒、状态、亡灵等）。<br>' +
        '· 感到任何不适请<span style="color:#ff9b9b;font-weight:bold;">直接删除</span>；转载或二创请注明来源。' +
        '</span>', false) +
    fold('★ 下载与反馈',
        '<span style="display:block;font-size:15px;line-height:1.85;">' +
        '· 如非云境（QQ 群：<a href="https://qm.qq.com/q/sYPeodYjt0" target="_blank" rel="noopener noreferrer" style="color:#8fd3ff;text-decoration:underline;">1036913034</a>）下载，请先入群确认版本是否为最新版本再反馈问题（链接点不开时直接搜群号）。<br>' +
        '· 反馈前请关闭其他扩展，并附错误截图或日志，方便定位。' +
        '</span>', false) +
    fold('★ 查看详情 / 帮助',
        '<span style="display:block;font-size:15px;line-height:1.85;">' +
        '· 完整更新日志：扩展包目录「诸神寰宇」下的《更新日志.md》。<br>' +
        '· 游戏名词：见 <b>帮助 → 诸神寰宇</b>；当前版本号：<b>' + VERSION + '</b>；适配本体：<b>' + GAME_VERSION + '</b>。' +
        '</span>', false) +
    '</span>';
}

export const packages = {
    author: setstyle('云烫半月霞'),
    get intro() { return buildIntro(); },
    diskURL: '',
    forumURL: '',
    version: VERSION,
};
