import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
const 谋定天下 = {
    zshy_AAZZjiangweiSBFM: `守毅无疆`,
    zshy_AAZZlusuSBFM: `渊谟肇石`,
    zshy_AAZZpangtongSBFM: `计澜锦绣`,
    zshy_AAZZzhugeliangSBFM: `山河无恙`,
};
const 武动乾坤 = {
    zshy_AAZZdongzhuoSBFM: `踞京问鼎`,
    zshy_AAZZguanyuSBFM: `威震华夏`,
};
const 花好月圆 = {
    zshy_AAZZhuangyueyingSBFM: `燕语莺歌`,
    zshy_AAZZxiaoqiaoSBFM: `桂梦弦歌`,
};
const 计出万全 = {
};
const 施仁布德 = {
};
const 奋勇扬威 = {
    zshy_AAZZsunjianSBFM: `横刀立马`,
};
const 达权通变 = {
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
    ...谋定天下, ...武动乾坤, ...花好月圆, ...计出万全, ...施仁布德, ...奋勇扬威, ...达权通变,
};
setTitle(characterTitle);
export default characterTitle;
