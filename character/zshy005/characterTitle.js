import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
const 颍川荀氏 = {
    zshy_AAZZxuncaiYCXS: '雅柔映采',
    zshy_AAZZxuncanYCXS: '晚风独立',
    zshy_AAZZxunchenYCXS: '栖木之择',
    zshy_AAZZxunshuYCXS: '鹤轸飞鸿',
    zshy_AAZZxunshiYCXS: `武将原画`,
    zshy_AAZZxunyouYCXS: '挥智千军',
};
const 陈留吴氏 = {
    zshy_AAZZwubanCLWS: `我武惟扬`,
    zshy_AAZZwuxianCLWS: `锦虎骧乐`,
};
const 颍川钟氏 = {
    zshy_AAZZzhonghuiYCZS: '一将功成',
    zshy_AAZZzhongyanYCZS: '慨然永怀',
    zshy_AAZZzhongyaoYCZS: '开达理干',
    zshy_AAZZzhongyuYCZS: '决胜千里',
};
export const 吴郡陆氏 = {
    zshy_AAZZlujiWJLS: `诸星示相`,
    zshy_AAZZlujingWJLS: `武将原画`,
    zshy_AAZZluyushengWJLS: `黎歌跃竹`,
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
    ...颍川荀氏, ...陈留吴氏, ...颍川钟氏, ...吴郡陆氏,
};
setTitle(characterTitle);
export default characterTitle;
