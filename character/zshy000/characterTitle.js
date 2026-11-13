import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
const 光阴长河 = {
    zshy_AAYAcaopi: `气荡山河`,
    zshy_AAYAdiaochan: '幻惑欲影',
    zshy_AAYAguojia: '以身证道',
    zshy_AAYAjiaxu: '文和乱武',
    zshy_AAYAshenzhaoyun: '天龙乘云',
    zshy_AAYAwolongzhugeliang: '算无遗策',
    zshy_AAYAzhonghui: '睚眦必报',
    zshy_AAYAzuoci: `道法显威`,
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
    ...光阴长河,
};
setTitle(characterTitle);
export default characterTitle;
