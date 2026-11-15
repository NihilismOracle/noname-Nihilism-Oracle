import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
export const 袖里乾坤 = {
    zshy_AAZZcaochunMB: ``,
    zshy_AAZZsimashiMB: `摧坚荡异`,
    zshy_AAZZsunhanhuaMB: `挣绽青莲`,
    zshy_AAZZlingcaoMB: `激流勇进`,
    zshy_AAZZsunruMB: `出水青莲`,
    zshy_AAZZliuzanMB: `啸天亢声`,    zshy_AAZZpangdegongMB: `德懿举世`,
    zshy_AAZZmihengMB: `鸷鹗啄孤凤`,
    zshy_AAZZzhengxuanMB: `兼采定道`,
    zshy_AAZZmajunMB: `名巧天下`,
    zshy_AAZznanhualaoxianMB: `冯虚御风`,
    zshy_AAZZshichangshiMB: `祸乱纲常`,
    zshy_AAZZzhangfenMB: `究械菁杰`,
    zshy_AAZZcuilingyiMB: `戴冠金尾`,
    zshy_AAZZzhujiMB: `克绍箕裘`,
    zshy_AAZZcaoxingMB: `喙睛阴鸷`,
    zshy_AAZZluyuMB: `守礼贞固`,
    zshy_AAZZzhangzhiMB: `一笔飞白`,
    zshy_AAZZcaozhiMB: `行驰道中`,
    zshy_AAZZzhouyuMB: `琴音同鸣`,
    zshy_AAZZliuhuiMB: `理推数算`,
    zshy_AAZZchelijiMB: `北境寒锋`,

};
function setTitle(object) {
    if (object && typeof object === 'object') {
        const keys = Object.keys(object);
        for (let key of keys) {
            const string = object[key];
            if (string && typeof string === 'string') {
                object[key] = `<span style='font-family:xinwei' data-nature='shenmm'><font color='#000000'>${string}</font></span>`;
            }
        }
    }
    return object;
}
const characterTitle = {
    ...袖里乾坤,
};
setTitle(characterTitle);
export default characterTitle;
