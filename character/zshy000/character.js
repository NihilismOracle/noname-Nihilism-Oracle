import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
export const 光阴长河 = {
    zshy_AAYAcaopi: {
        names: `曹|丕`,
        hp: 3,
        maxHp: 3,
        hujia: 0,
        sex: `male`,
        group: `wei`,
        doubleGroup: [],
        groupBorder: ``,
        skills: [`zshy_jinmie`, `zshy_shenzhu`, `zshy_zangshang`, `zshy_junwei`],

        isZhugong: true,

    },
    zshy_AAYAdiaochan: {
        names: `貂|蝉`,
        hp: 3,
        maxHp: 3,
        hujia: 0,
        sex: `female`,
        group: `qun`,
        doubleGroup: [],
        groupBorder: ``,
        skills: [`zshy_jinmie`, `zshy_huoshen`, `zshy_meiying`],

    },
    zshy_AAYAguojia: {
        names: `郭|嘉`,
        hp: 3,
        maxHp: 3,
        hujia: 0,
        sex: `male`,
        group: `wei`,
        skills: [`zshy_jinmie`, `zshy_tianji`, `zshy_yice`],
    },
    zshy_AAYAjiaxu: {
        names: `贾|诩`,
        hp: 3,
        maxHp: 3,
        hujia: 0,
        sex: `male`,
        group: `qun`,
        skills: [`zshy_jinmie`, `zshy_zhensha`, `zshy_luanshi`, `zshy_yingmu`],
    },
    zshy_AAYAshenzhaoyun: {
        names: `赵|云`,
        hp: 1,
        maxHp: 1,
        hujia: 0,
        sex: `male`,
        group: `shen`,
        groupInGuozhan: `shu`,
        skills: [`zshy_jinmie`, `zshy_longpo`],
    },
    zshy_AAYAwolongzhugeliang: {
        names: `诸葛|亮`,
        hp: 3,
        maxHp: 3,
        hujia: 0,
        sex: `male`,
        group: `shu`,
        skills: [`zshy_jinmie`, `zshy_liaoyuan`, `zshy_qimen`, `zshy_poji`],
    },
    zshy_AAYAzhonghui: {
        names: `钟|会`,
        hp: 4,
        maxHp: 4,
        hujia: 0,
        sex: `male`,
        group: `wei`,
        skills: [`zshy_jinmie`, `zshy_quanshu`, `zshy_duobing`, `zshy_zhanyi`],
    },
    zshy_AAYAzuoci: {
        names: `左|慈`,
        hp: 4,
        maxHp: 4,
        hujia: 0,
        sex: `male`,
        group: `qun`,
        skills: [`zshy_jinmie`, `zshy_JZChuanshen`, `zshy_JZCxinsheng`],
    },
};


export const 万象归一 = {
    zshy_AAYBhun: {
        names: '魂',
        hp: Infinity,
        maxHp: Infinity,
        hujia: 0,
        sex: 'none',
        group: 'key',
        skills: ['zshy_Hhuanhun'],
    },
};

export const characters = {
    ...光阴长河,
    ...万象归一,
};

const WXGY_ROLEBACK = (lib.config && lib.config.extension_诸神寰宇_WJBJ) || '无名';
characters.zshy_AAYBhun.img = 'extension/诸神寰宇/other/Picture/Roleback/' + (WXGY_ROLEBACK === '默认' ? '无名' : WXGY_ROLEBACK) + '.jpg';
characters.zshy_AAYBhun.dieAudios = [];

for (const name in characters) {
    characters[name].img = `extension/诸神寰宇/image/character/zshy_AA/${name}.jpg`;
    characters[name].dieAudios = [`ext:诸神寰宇/audio/character/${name}.mp3`];
}

characters.zshy_AAYBhun.img = 'extension/诸神寰宇/other/Picture/Roleback/' + (WXGY_ROLEBACK === '默认' ? '无名' : WXGY_ROLEBACK) + '.jpg';
characters.zshy_AAYBhun.dieAudios = [];

export default characters;
