// 帮助页只放「名词解释」；更新日志只显示在信息栏（packages.js）与「查看详情」弹窗（content.js）
const terms = [
    ['〖绝恒技〗', '此类技能禁止通过 addSkill、removeSkill、tempBanSkill、disableSkill、awakenSkill、skillBlocker 添加或移除。'],
    ['〖超级状态技〗', 'superCharlotte 标签效果，判定等级比状态技高，此标签技能本体无法移除。'],
    ['〖状态技〗', 'charlotte 标签效果，判定等级比锁定技高，此标签本体主要用于效果类型技能。'],
    ['〖亡灵技〗', '死亡后也可发动。'],
    ['〖夺取〗', '夺取角色增加 1 点体力上限并回复 1 点体力，被夺取角色减少 1 点体力上限。'],
];

const termHtml = terms.map(function (item) {
    return '<div style="margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.12);">' +
        '<div style="font-size:18px;font-weight:bold;color:#e8d5a3;line-height:1.3;">' + item[0] + '</div>' +
        '<div style="margin-top:4px;font-size:16px;line-height:1.65;color:rgba(255,255,255,0.88);">' + item[1] + '</div>' +
    '</div>';
}).join('');

export const help = {
    诸神寰宇: '<div style="margin:4px 8px 16px 2px;padding:0;font-size:16px;color:rgba(255,255,255,0.88);">' +
        '<div style="text-align:center;line-height:1.4;padding:2px 0 10px;">' +
            '<div style="font-size:26px;font-weight:bold;letter-spacing:3px;"><span style="font-family:xinwei;" data-nature="shenmm"><font color="#000000">诸神寰宇</font></span></div>' +
            '<div style="font-size:14px;color:rgba(255,255,255,0.7);margin-top:6px;">名词解释</div>' +
        '</div>' +
        '<div style="border-top:1px solid rgba(255,255,255,0.12);margin:2px 0 8px;"></div>' +
        '<div>' + termHtml + '</div>' +
        '<div style="border-top:1px solid rgba(255,255,255,0.12);margin:16px 0 10px;"></div>' +
        '<div style="text-align:center;font-size:13px;color:rgba(255,255,255,0.6);">交流群：<a href="https://qm.qq.com/q/sYPeodYjt0" target="_blank" rel="noopener noreferrer" style="color:#8fd3ff;text-decoration:underline;">云境 1036913034</a>（点不开时直接搜群号）<br>—— 扩展「诸神寰宇」提供 ——</div>' +
    '</div>',
};
