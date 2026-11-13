import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
const 文德武备理 = {
    zshy_AAZZsimayiWDWB: '红梅迎春',
    zshy_AAZZzhangchunhuaWDWB: '红梅迎春',
    zshy_AAZZlisuWDWB: '欲利说吕',
    zshy_AAZZsimazhouWDWB: '挥军征南',
    zshy_AAZZchelijiWDWB: '高凉铁骨',
    zshy_AAZZhuaxinWDWB: '捧玺献绶',
};
const 文德武备备 = {
    zshy_AAZZchengjichengcuiWDWB: '养刀千日',
    zshy_AAZZzhanghuyuechenWDWB: '双勇破敌',
    zshy_AAZZxiahouhuiWDWB: '熠熠珠玉',
    zshy_AAZZsimashiWDWB: '桀骜睥睨',
    zshy_AAZZyanghuiyuWDWB: '璟瑜荷徽',
    zshy_AAZZshibaoWDWB: '经国之才',
};
const 文德武备果 = {
    zshy_AAZZxuangongzhuWDWB: '青锋潋滟',
    zshy_AAZZsimazhaoWDWB: '勇夺魁首',
    zshy_AAZZwangyuanjiWDWB: '勇夺魁首',
    zshy_AAZZduyuWDWB: '驱麟辟浪',
    zshy_AAZZweiguanWDWB: '文论清谈',
};
const 文德武备戒 = {
    zshy_AAZZzhongyanWDWB: '落芳清雅',
    zshy_AAZZxinchangWDWB: '弃魏投晋',
    zshy_AAZZjiachongWDWB: '执手同欢',
    zshy_AAZZwangxiangWDWB: '孝鲤跃冰',
};
const 文德武备约 = {
    zshy_AAZZyangyanWDWB: '妍芷艳质',
    zshy_AAZZyangzhiWDWB: '妍芷艳质',
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
    ...文德武备理, ...文德武备备, ...文德武备果, ...文德武备戒, ...文德武备约,
};
setTitle(characterTitle);
export default characterTitle;
