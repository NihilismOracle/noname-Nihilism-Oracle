import { lib, game, ui, get, ai, _status } from '../../../../noname.js';

export const 谋定天下 = {
    zshy_AAZZjiangweiSBFM: {
        names: `姜|维`,
        hp: 4,
        maxHp: 4,
        hujia: 0,
        sex: `male`,
        group: `shu`,
        doubleGroup: [],
        groupBorder: ``,
        skills: [`zshy_zhuri`, `zshy_ranji`],

    },
    zshy_AAZZlusuSBFM: {
        names: `鲁|肃`,
        hp: 3,
        maxHp: 3,
        hujia: 0,
        sex: `male`,
        group: `wu`,
        doubleGroup: [],
        groupBorder: ``,
        skills: [`zshy_duduan`, `zshy_yinglve`, `zshy_mengshi`],

    },
    zshy_AAZZpangtongSBFM: {
        names: `庞|统`,
        hp: 3,
        maxHp: 3,
        hujia: 0,
        sex: `male`,
        group: `shu`,
        doubleGroup: [],
        groupBorder: ``,
        skills: [`zshy_hongtu`, `zshy_qiwu`],

    },
    zshy_AAZZzhugeliangSBFM: {
        names: `诸葛|亮`,
        hp: 3,
        maxHp: 3,
        hujia: 0,
        sex: `male`,
        group: `shu`,
        doubleGroup: [],
        groupBorder: ``,
        skills: [`zshy_zhitian`, `zshy_wujing`, `zshy_zhijue`],

    },
};
export const 武动乾坤 = {
    zshy_AAZZdongzhuoSBFM: {
        names: `董|卓`,
        hp: 4,
        maxHp: 4,
        hujia: 0,
        sex: `male`,
        group: `qun`,
        doubleGroup: [],
        groupBorder: ``,
        skills: [`zshy_guanbian`, `zshy_xiongni`, `zshy_fengshang`, `zshy_zhibing`],

        isZhugong: true,

    },
    zshy_AAZZguanyuSBFM: {
        names: `关|羽`,
        hp: 4,
        maxHp: 4,
        hujia: 0,
        sex: `male`,
        group: `shu`,
        doubleGroup: [],
        groupBorder: ``,
        skills: [`zshy_weilin`, `zshy_duoshou`],

    },

};
export const 花好月圆 = {
    zshy_AAZZhuangyueyingSBFM: {
        names: `黄|月英`,
        hp: 3,
        maxHp: 3,
        hujia: 0,
        sex: `female`,
        group: `shu`,
        doubleGroup: [],
        groupBorder: ``,
        skills: [`zshy_lixian`, `zshy_bingcai`],

    },
    zshy_AAZZxiaoqiaoSBFM: {
        names: `桥|？`,
        hp: 3,
        maxHp: 3,
        hujia: 0,
        sex: `female`,
        group: `wu`,
        doubleGroup: [],
        groupBorder: ``,
        skills: [`zshy_miluo`, `zshy_MXQjueyan`],

    },

};
export const 计出万全 = {
};
export const 施仁布德 = {
};
export const 奋勇扬威 = {
    zshy_AAZZsunjianSBFM: {
        names: `孙|坚`,
        hp: 4,
        maxHp: 5,
        hujia: 0,
        sex: `male`,
        group: `wu`,
        doubleGroup: [],
        groupBorder: ``,
        skills: [`zshy_hulie`, `zshy_yipo`],

        isZhugong: true,

    },

};
export const 达权通变 = {
};

export const characters = {
    ...谋定天下, ...武动乾坤, ...花好月圆, ...计出万全, ...施仁布德, ...奋勇扬威, ...达权通变,
};

for (const name in characters) {
    characters[name].img = `extension/诸神寰宇/image/character/zshy_AG/${name}.jpg`;
    characters[name].dieAudios = [`ext:诸神寰宇/audio/character/${name}.mp3`];
}

export default characters;
