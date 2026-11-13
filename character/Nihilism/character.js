import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
export const 远古遗神 = {
    Nihilism_AAAAanjing: {
        names: `安|璟`,
        hp: Infinity,
        maxHp: Infinity,
        hujia: Infinity,
        sex: `male`,
        group: `shen`,
        doubleGroup: [],
        groupBorder: `shen`,
        skills: [
            `zshy_AJshenzuninfo`, `zshy_AJxuwuinfo`, `zshy_AJjinmieinfo`, `zshy_AJhuanhuninfo`,
            `zshy_AJshenzun`, `zshy_AJxuwu`, `zshy_AJjinmie`, `zshy_AJhuanhun`,
        ],
        groupInGuozhan: `shen`,

        isZhugong: true,

        isAiForbidden: true,

        clans: [`虚无安氏`],
    },
    zshy_AAAAantianhen: {
        names: `安|天痕`,
        hp: 1,
        maxHp: 1,
        hujia: 0,
        sex: `male`,
        group: `shen`,
        doubleGroup: [],
        groupBorder: `shen`,
        skills: [`zshy_AllSkill`, `zshy_AAAAkuiming`, `zshy_ATHmingying`],
        groupInGuozhan: `shen`,

        isAiForbidden: true,

        clans: [`虚无安氏`],
    },
    zshy_AAAAmiehun: {
        names: `灭|魂`,
        hp: 1,
        maxHp: 1,
        hujia: 0,
        sex: `male`,
        group: `shen`,
        doubleGroup: [],
        groupBorder: `devil`,
        skills: [`zshy_AllSkill`, `zshy_MHxihun`],
        groupInGuozhan: `shen`,

        isAiForbidden: true,

    },
    zshy_AAAAzhongmo: {
        names: `盅|墨`,
        hp: 1,
        maxHp: 1,
        hujia: 0,
        sex: `male`,
        group: `shen`,
        doubleGroup: [],
        groupBorder: `qun`,
        skills: [`zshy_AllSkill`, `zshy_ZMxuemo`],
        groupInGuozhan: `shen`,

        isAiForbidden: true,

    },
    zshy_AAAAzuilian: {
        names: `罪|恋`,
        hp: 1,
        maxHp: 1,
        hujia: 0,
        sex: `female`,
        group: `shen`,
        doubleGroup: [],
        groupBorder: `shu`,
        skills: [`zshy_AllSkill`, `zshy_ZLyehuo`, `zshy_ZLfenzui`],
        groupInGuozhan: `shen`,

        isAiForbidden: true,

    },
};
export const 江山多殇 = {
    zshy_AAABanri: {
        names: `黯|日`,
        hp: 7,
        maxHp: 7,
        hujia: 0,
        sex: `male`,
        group: `shen`,
        doubleGroup: [],
        groupBorder: `shen`,
        skills: [`zshy_AAABSkill`, `zshy_ARjunwei`, `zshy_ARzuifa`],
        groupInGuozhan: `shen`,

    },
    zshy_AAABcanglan: {
        names: `苍|澜`,
        hp: 7,
        maxHp: 7,
        hujia: 0,
        sex: `female`,
        group: `shen`,
        skills: [`zshy_AAABSkill`, `zshy_CLguying`, `zshy_CLanxing`],
        groupBorder: `qun`,
        doubleGroup: [],
        groupInGuozhan: `shen`,

    },
    zshy_AAABjinniuzuo: {
        names: `金牛|座`,
        hp: 7,
        maxHp: 7,
        hujia: 0,
        sex: `male`,
        group: `shen`,
        skills: [`zshy_AAABSkill`, `zshy_JNZxingyuan`, `zshy_JNZfaquan`],
        groupBorder: `shen`,
        doubleGroup: [],
        groupInGuozhan: `shen`,

    },
    zshy_AAABlilimu: {
        names: `|莉莉姆`,
        hp: 7,
        maxHp: 7,
        hujia: 0,
        sex: `female`,
        group: `shen`,
        skills: [`zshy_AAABSkill`, `zshy_LLMmingqi`, `zshy_LLMhunyue`],
        groupBorder: `wu`,
        doubleGroup: [],
        groupInGuozhan: `shen`,

    },
};
export const 异界来客 = {
    zshy_AAACchuyinweilai: {
        names: `初音|未来`,
        hp: 3,
        maxHp: 3,
        hujia: 0,
        sex: `female`,
        group: `key`,
        skills: [`zshy_CYWLxuni`, `zshy_CYWLyindong`, `zshy_CYWLzouming`],
        groupBorder: `wei`,
        doubleGroup: [],
        groupInGuozhan: `key`,

    },
    zshy_AAACguyuefangyuan: {
        names: `古月|方源`,
        hp: 4,
        maxHp: 4,
        hujia: 0,
        sex: `male`,
        group: `key`,
        skills: [`zshy_GYFYliandao`, `zshy_GYFYcanlian`, `zshy_GYFYdaozhu`],
        groupBorder: `devil`,
        doubleGroup: [],
        groupInGuozhan: `key`,

    },
    zshy_AAAClongyi: {
        names: `龙|裔`,
        hp: 4,
        maxHp: 4,
        hujia: 0,
        sex: `male`,
        group: `key`,
        skills: [`zshy_LYmoyi`, `zshy_LYbaitong`],
        groupBorder: `qun`,
        doubleGroup: [],
        groupInGuozhan: `key`,

    },
    zshy_AAACsuxiao: {
        names: `苏|晓`,
        hp: 4,
        maxHp: 4,
        hujia: 0,
        sex: `male`,
        group: `key`,
        skills: [`zshy_SXdaoshu`, `zshy_SXmiefa`, `zshy_SXjuemo`, `zshy_SXxueshou`],
        groupBorder: `devil`,
        doubleGroup: [],
        groupInGuozhan: `key`,

    },
    zshy_AAACyangjian: {
        names: `杨|间`,
        hp: 1,
        maxHp: 1,
        hujia: 0,
        sex: `male`,
        group: `key`,
        skills: [`zshy_YJguiqu`, `zshy_YJguiyan`],
        groupBorder: `devil`,
        doubleGroup: [],
        groupInGuozhan: `key`,

    },
    zshy_AAACyixiangren: {
        names: `异|乡人`,
        hp: 3,
        maxHp: 4,
        hujia: 0,
        sex: `male`,
        group: `key`,
        skills: [`zshy_YXRxueyuan`, `zshy_YXRlieshen`, `zshy_YXRxunying`, `zshy_YXRxuezhou`],
        groupBorder: `devil`,
        doubleGroup: [],
        groupInGuozhan: `key`,

    },
    zshy_AAAZtianxuanzhizi: {
        names: `天选|之子`,
        hp: 2,
        maxHp: 7,
        hujia: 0,
        sex: `male`,
        group: `key`,
        skills: [`zshy_TXZZkuruo`, `zshy_TXZZxueqiang`],
        groupBorder: `qun`,
        doubleGroup: [],
        groupInGuozhan: `key`,

    },
};
export const Vsinger = {
    zshy_AAADluotianyi: {
        names: `洛|天依`,
        hp: 3,
        maxHp: 3,
        hujia: 0,
        sex: `female`,
        group: `key`,
        skills: [`zshy_LTYchihuo`, `zshy_LTYxiediao`, `zshy_LTYgongming`, `zshy_Vsingertianlai`],
        groupBorder: `wei`,
        doubleGroup: [],
        groupInGuozhan: `key`,

        clans: [`Vsinger`],
    },
    zshy_AAADyanhe: {
        names: `言|和`,
        hp: 3,
        maxHp: 3,
        hujia: 0,
        sex: `female`,
        group: `key`,
        skills: [`zshy_YHfengsu`, `zshy_YHtiaolv`, `zshy_YHgongming`, `zshy_Vsingertianlai`],
        groupBorder: `qun`,
        doubleGroup: [],
        groupInGuozhan: `key`,

        clans: [`Vsinger`],
    },
    zshy_AAADyuezhengling: {
        names: `乐正|绫`,
        hp: 3,
        maxHp: 3,
        hujia: 0,
        sex: `female`,
        group: `key`,
        skills: [`zshy_YZLfenyin`, `zshy_YZLjingxian`, `zshy_YZLgongming`, `zshy_Vsingertianlai`],
        groupBorder: `shu`,
        doubleGroup: [],
        groupInGuozhan: `key`,

        clans: [`Vsinger`],
    },
    //zshy_AAADyuezhenglongya: ['male', 'key', '4/4/0', ['', '', 'zshy_YZLYgongming', 'zshy_Vsingertianlai'], ['key', 'clan:Vsinger', 'border:wu']],
};
export const SlayTheSpire = {
    zshy_AAAEsilent: {
        names: `静默|猎手`,
        hp: 7,
        maxHp: 7,
        hujia: 0,
        sex: `female`,
        group: `key`,
        skills: [`zshy_baibian`, `zshy_Sjibu`],
        groupBorder: `wu`,
        doubleGroup: [],
        groupInGuozhan: `key`,

    },

};

export const characters = {
    ...远古遗神, ...江山多殇, ...异界来客, ...Vsinger, ...SlayTheSpire,
};

for (const name in characters) {
    characters[name].img = `extension/诸神寰宇/image/character/Nihilism/${name}/wjyh.jpg`;
    characters[name].dieAudios = [`ext:诸神寰宇/audio/character/${name}.mp3`];
}

export default characters;
