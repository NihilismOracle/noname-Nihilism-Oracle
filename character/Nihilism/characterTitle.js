import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
const 远古遗神 = {
    Nihilism_AAAAanjing: '神尊',
    zshy_AAAAantianhen: '虚无之影',
    zshy_AAAAmiehun: '灭魂之魔',
    zshy_AAAAzhongmo: '千秋如梦',
    zshy_AAAAzuilian: '燃烬天地',
};
const 江山多殇 = {
    zshy_AAABanri: '残躯之面',
    zshy_AAABcanglan: '异乡侠女',
    zshy_AAABjinniuzuo: '金牛王座',
    zshy_AAABlilimu: '命之契约',
};
const 异界来客 = {
    zshy_AAACchuyinweilai: '最初之音',
    zshy_AAACguyuefangyuan: '炼天魔尊',
    zshy_AAAClongyi: '龙之末裔',
    zshy_AAACsuxiao: '星界坚守者',
    zshy_AAACyangjian: '鬼眼杨戬',
    zshy_AAACyixiangren: '血源猎人',
    zshy_AAAZtianxuanzhizi: `掌握强弱之力的老萌新`,
};
const Vsinger = {
    zshy_AAADluotianyi: '洛水天依',
    zshy_AAADyanhe: '歌起人和',
    zshy_AAADyuezhengling: '乐司百曲',
    zshy_AAADyuezhenglongya: '乐司龙吟',
};
const SlayTheSpire = {
    zshy_AAAEsilent: '静默猎手',
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
    ...远古遗神, ...江山多殇, ...异界来客, ...Vsinger, ...SlayTheSpire,
};
setTitle(characterTitle);
export default characterTitle;
