import { lib, game, ui, get, ai, _status } from '../../../../noname.js';

//兵势篇·奇
export const 兵势篇奇 = {
    zshy_AAZZyujiBSP: {
        names: `于|吉`,
        hp: 3,
        maxHp: 3,
        hujia: 0,
        sex: `male`,
        group: `qun`,
        doubleGroup: [],
        groupBorder: ``,
        skills: [`zshy_SYJfuji`, `zshy_SYJdaozhuan`],

    },
};
//兵势篇·正
export const 兵势篇正 = {
};
//兵势篇·势
export const 兵势篇势 = {
    zshy_AAZZzhouyuBSP: {
        names: `周|瑜`,
        hp: 4,
        maxHp: 4,
        hujia: 0,
        sex: `male`,
        group: `wu`,
        doubleGroup: [],
        groupBorder: ``,
        skills: [`zshy_chiyun`, `zshy_yanhui`, `zshy_fentao`, `zshy_xiongzi`],

    },
    zshy_AAZZzhonghuiBSP: {
        names: `钟|会`,
        hp: 4,
        maxHp: 4,
        hujia: 0,
        sex: `male`,
        group: `wei`,
        doubleGroup: [`wei`, `qun`],
        groupBorder: `qun`,
        skills: [`zshy_sizi`, `zshy_xiezhi`, `zshy_yunan`, `zshy_kechang`],

    },
    zshy_AAZZweiyanBSP: {
        names: `魏|延`,
        hp: 4,
        maxHp: 4,
        hujia: 0,
        sex: `male`,
        group: `shu`,
        doubleGroup: [],
        groupBorder: ``,
        skills: [`zshy_zhuangshi`, `zshy_yinzhan`, `zshy_zhongao`],

    },
};
//兵势篇·节
export const 兵势篇节 = {
};

export const characters = {
    ...兵势篇奇,
    ...兵势篇正,
    ...兵势篇势,
    ...兵势篇节,
};

// 兵势篇：钟会/魏延使用扩展素材；墟势周瑜、墟势于吉的扩展立绘已删除，交由全局「本体素材引用」按名字解析到本体势周瑜/势于吉。
for (const name in characters) {
    if (name === 'zshy_AAZZzhouyuBSP' || name === 'zshy_AAZZyujiBSP') continue;
    characters[name].img = `extension/诸神寰宇/image/character/zshy_AH/${name}.jpg`;
    characters[name].dieAudios = [`ext:诸神寰宇/audio/character/${name}.mp3`];
}

export default characters;
