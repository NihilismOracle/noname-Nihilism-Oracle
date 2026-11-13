import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
export const 颍川荀氏 = {
    zshy_AAZZxuncaiYCXS: {
        names: `荀|采`,
        hp: 3,
        maxHp: 3,
        hujia: 0,
        sex: `female`,
        group: `qun`,
        doubleGroup: [],
        groupBorder: ``,
        skills: [`zshy_lieshi`, `zshy_dianzhan`, `zshy_huanyin`, `zshy_daojie`],

        clans: ['颍川荀氏'],
    },
    zshy_AAZZxuncanYCXS: {
        names: `荀|璨`,
        hp: 3,
        maxHp: 3,
        hujia: 0,
        sex: `male`,
        group: `wei`,
        doubleGroup: [],
        groupBorder: ``,
        skills: [`zshy_yunshen`, `zshy_shangshen`, `zshy_fenchai`, `zshy_daojie`],

        clans: ['颍川荀氏'],
    },
    zshy_AAZZxunchenYCXS: {
        names: `荀|谌`,
        hp: 3,
        maxHp: 3,
        hujia: 0,
        sex: `male`,
        group: `qun`,
        doubleGroup: [],
        groupBorder: ``,
        skills: [`zshy_sankuang`, `zshy_beishi`, `zshy_daojie`],

        clans: ['颍川荀氏'],
    },
    zshy_AAZZxunshiYCXS: {
        names: `荀|莳`,
        hp: 3,
        maxHp: 3,
        hujia: 0,
        sex: `female`,
        group: `wei`,
        doubleGroup: [],
        groupBorder: ``,
        skills: [`zshy_qingjue`, `zshy_yingxiang`, `zshy_daojie`],

        clans: ['颍川荀氏'],
    },
    zshy_AAZZxunshuYCXS: {
        names: `荀|淑`,
        hp: 3,
        maxHp: 3,
        hujia: 0,
        sex: `male`,
        group: `qun`,
        doubleGroup: [],
        groupBorder: ``,
        skills: [`zshy_shenjun`, `zshy_balong`, `zshy_daojie`],

        clans: ['颍川荀氏'],
    },
    zshy_AAZZxunyouYCXS: {
        names: `荀|攸`,
        hp: 3,
        maxHp: 3,
        hujia: 0,
        sex: `male`,
        group: `wei`,
        doubleGroup: [],
        //groupBorder: `qun`,
        skills: [`zshy_baichu`, `zshy_daojie`],

        clans: ['颍川荀氏'],
    },
};
export const 陈留吴氏 = {
    zshy_AAZZwubanCLWS: {
        names: `吴|班`,
        hp: 4,
        maxHp: 4,
        hujia: 0,
        sex: `male`,
        group: `shu`,
        doubleGroup: [],
        //groupBorder: `qun`,
        skills: [`zshy_zhanding`, `zshy_muyin`],

        clans: ['陈留吴氏'],
    },
    zshy_AAZZwuxianCLWS: {
        names: `吴|苋`,
        hp: 3,
        maxHp: 3,
        hujia: 0,
        sex: `female`,
        group: `shu`,
        doubleGroup: [],
        //groupBorder: `qun`,
        skills: [`zshy_yirong`, `zshy_guixiang`, `zshy_muyin`],

        clans: ['陈留吴氏'],
    },
};
export const 颍川钟氏 = {
    zshy_AAZZzhonghuiYCZS: {
        names: `钟|会`,
        hp: 3,
        maxHp: 4,
        hujia: 0,
        sex: `male`,
        group: `wei`,
        doubleGroup: [],
        //groupBorder: `qun`,
        skills: [`zshy_yuzhi`, `zshy_xieshu`, `zshy_baozu`],

        clans: ['颍川钟氏'],
    },
    zshy_AAZZzhongyanYCZS: {
        names: `钟|琰`,
        hp: 3,
        maxHp: 3,
        hujia: 0,
        sex: `female`,
        group: `jin`,
        doubleGroup: [],
        //groupBorder: `qun`,
        skills: [`zshy_guangu`, `zshy_xiaoyong`, `zshy_baozu`],

        clans: ['颍川钟氏'],
    },
    zshy_AAZZzhongyaoYCZS: {
        names: `钟|繇`,
        hp: 3,
        maxHp: 3,
        hujia: 0,
        sex: `male`,
        group: `wei`,
        doubleGroup: [],
        //groupBorder: `qun`,
        skills: [`zshy_chengqi`, `zshy_jieli`, `zshy_baozu`],

        clans: ['颍川钟氏'],
    },
    zshy_AAZZzhongyuYCZS: {
        names: `钟|毓`,
        hp: 3,
        maxHp: 3,
        hujia: 0,
        sex: `male`,
        group: `wei`,
        doubleGroup: [],
        //groupBorder: `qun`,
        skills: [`zshy_jiejian`, `zshy_huanghan`, `zshy_baozu`],

        clans: ['颍川钟氏'],
    },
};
export const 吴郡陆氏 = {
    zshy_AAZZlujiWJLS: {
        sex: `male`,
        group: `wu`,
        hp: 3,
        maxHp: 3,
        hujia: 0,
        skills: [`zshy_gailan`, `zshy_fennu`, `zshy_zelie`],
        clans: ['吴郡陆氏'],
    },
    zshy_AAZZlujingWJLS: {
        sex: 'male',
        group: 'wu',
        hp: 4,
        maxHp: 4,
        hujia: 0,
        skills: ['zshy_tanfeng', 'zshy_juewei', 'zshy_zelie'],
        clans: ['吴郡陆氏'],
    },
    zshy_AAZZluyushengWJLS: {
        sex: 'female',
        group: 'wu',
        hp: 3,
        maxHp: 3,
        hujia: 0,
        skills: ['zshy_shixi', 'zshy_jianbai', 'zshy_zelie'],
        clans: ['吴郡陆氏']
    },
};

export const characters = {
    ...颍川荀氏, ...陈留吴氏, ...颍川钟氏, ...吴郡陆氏,
};

for (const name in characters) {
    characters[name].img = `extension/诸神寰宇/image/character/zshy_AF/${name}.jpg`;
    characters[name].dieAudios = [`ext:诸神寰宇/audio/character/${name}.mp3`];
}

export default characters;
