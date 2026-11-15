import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
export const 百战虎贲 = {
    zshy_AAZZwenyangJMGX: {
        names: `文|鸯`,
        hp: 5,
        maxHp: 5,
        hujia: 0,
        sex: `male`,
        group: `wei`,
        skills: [`zshy_lvli`, `zshy_WYchoujue`],
    },

};
export const 武庙 = {
    zshy_AAZZhuangfusongWMXL: {
        names: `皇|甫嵩`,
        hp: 1,
        maxHp: 4,
        hujia: 0,
        sex: `male`,
        group: `qun`,
        skills: [`zshy_chaozhen`, `zshy_lianjie`, `zshy_jiangxian`],
    },
    zshy_AAZZluxunWMXL: {
        names: `陆|逊`,
        hp: 3,
        maxHp: 3,
        hujia: 0,
        sex: `male`,
        group: `wu`,
        skills: [`zshy_xiongmu`, `zshy_zhangcai`, `zshy_ruxian`],
    },
    zshy_AAZZzhugeliangWMXL: {
        names: `诸葛|亮`,
        hp: 4,
        maxHp: 7,
        hujia: 0,
        sex: `male`,
        group: `shu`,
        skills: [`zshy_jincui`, `zshy_qingshi`, `zshy_zhizhe`],
    },
};

export const characters = {
    ...百战虎贲, ...武庙,
};

// 武庙/百战虎贲：4 名武将均使用扩展素材。
for (const name in characters) {
    characters[name].img = `extension/诸神寰宇/image/character/zshy_XDZS/${name}.jpg`;
    characters[name].dieAudios = [`ext:诸神寰宇/audio/character/${name}.mp3`];
}

export default characters;
