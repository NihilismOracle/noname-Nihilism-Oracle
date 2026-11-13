import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
const 光阴长河 = {
    zshy_jinmie1:  '（盾击声）',

    'zshy_AAYAcaopi:die': '此战无功而返，我军锐气已失……',
    zshy_jinmie_zshy_AAYAcaopi1:  `昔始皇一统六国，朕平吴蜀何尝不可？`,
    zshy_shenzhu1:  `朕于天下无所不容，而况汝乎？`,
    zshy_shenzhu2:  `世子之争素来如此，朕予改封已是仁慈！`,
    zshy_zangshang1:  `众士出生入死，孤当敛而奠之。`,
    zshy_zangshang2:  `身既死兮神以灵，魂魄毅兮为鬼雄。`,
    zshy_junwei1:  `朕之玉言，可决万民生死！`,
    zshy_junwei2:  `受禅汉庭，德大可参日月！`,

    'zshy_AAYAdiaochan:die': '王权霸业早作土，千秋万岁皆颂我。',
    zshy_huoshen1:  '死生幻化，诸相由心，何不早登极乐之境？',
    zshy_huoshen2:  '艳色空花，浮生焦谷。将军，你着相了。',
    zshy_meiying1:  '身似浮灯，心如嗔火，可叹众生螟蛉，竞相赴死。',
    zshy_meiying2:  '无边风月，倾倒人间，不若一晌贪欢，魄散魂消。',

    'zshy_AAYAguojia:die': '执鞭扫南之日，嘉再贺明公于九泉……',
    zshy_tianji1:  '既得天智，又岂能再乞天佑？',
    zshy_tianji2:  '天降大任于吾，吾必成之！',
    zshy_yice1:  '定此遗计，以全此生。',
    zshy_yice2:  '沥血铸策，锻此身以助明公！',

    'zshy_AAYAjiaxu:die': '终究……不是黄雀么……',
    zshy_zhensha1:  '心存善念，必为丧身之本。',
    zshy_zhensha2:  '扬汤止沸，不如灭火去薪。',
    zshy_luanshi1:  '乱其所为，动心致灭。',
    zshy_luanshi2:  '隔岸观火，坐收渔利。',
    zshy_yingmu1:  '张施帷幕，以保完全。',
    zshy_yingmu2:  '我早已有所准备！',

    'zshy_AAYAshenzhaoyun:die': '亢龙有悔，恨未除天狼于人间……',
    'zshy_AAYAshenzhaoyun_shadow:die': '龙身虽死，然龙魂永存。',
    zshy_longpo1:  '龙缚于渊，虽万仞在身，志犹存于八荒！',
    zshy_longpo2:  '将临死地，必效刑天，舞干戈以征四海。',
    zshy_longpo3:  '八尺之身，秉义承武，胸腹可栖万丈苍龙。',
    zshy_longpo4:  '左执青釭，右擎龙胆，此天下，可有挡我者。',
    zshy_longpo_zshy_AAYAshenzhaoyun_shadow1:  '身陷绝境，方乃用武之时，问长缨何在。',
    zshy_longpo_zshy_AAYAshenzhaoyun_shadow2:  '心怀长帆，何惧困顿，当济沧海云间。',
    zshy_longpo_zshy_AAYAshenzhaoyun_shadow3:  '九阳断魂，斩却三尸，脱凡蜕而化应龙。',
    zshy_longpo_zshy_AAYAshenzhaoyun_shadow4:  '潜龙在渊，声震九天，身可战于四野。',

    'zshy_AAYAwolongzhugeliang:die': '可恨，未能助君成业……',
    zshy_liaoyuan1:  '诱敌深入，焚其粮草，敌无委积，必败！',
    zshy_liaoyuan2:  '天时地利，更兼人和，佐以火攻，必胜！',
    zshy_qimen1:  '天覆地载，龙变其中。',
    zshy_qimen2:  '行则为阵，立则为营。',
    zshy_poji1:  '此……小儿之计乎？哈哈哈哈！',
    zshy_poji2:  '汝予智予雄，殊不知，吾早已看破。',

    'zshy_AAYAzhonghui:die': '心大志迂，吾有负钟氏门楣……',
    zshy_quanshu1:  '谋大事者，当藏于心，行于事。',
    zshy_quanshu2:  '定筹谋备，且待吾之长风！',
    zshy_duobing1:  '功高终怀异，峙鼎复三分！',
    zshy_duobing2:  '蜀中纵有八百里，亦不过我一言堂！',
    zshy_zhanyi1:  '道同者可俱荣，殊途者成白骨。',
    zshy_zhanyi2:  '匹夫侥幸行险，岂敢妄居首功！',

    'zshy_AAYAzuoci:die': '仙迹难觅，道法难参……',
    zshy_JZChuanshen1:  `俯观人间百态，化身游悟其间。`,
    zshy_JZChuanshen2:  `贫道身化万方，形满亦得其异。`,
    zshy_JZCxinsheng1:  `生为死之初；死为生之始。`,
    zshy_JZCxinsheng2:  `木枯则发芝栭，身死乃见新生。`,

};

let origintaici = {
    ...光阴长河,
};

function getVoice(obj) {
    let result = {};
    for (let key in obj) {
        const value = obj[key];
        let newkey = '';
        if (key.includes(':die')) {
            newkey = `#ext:诸神寰宇/audio/character/${key.replace('#', '')}`;
        } else {
            newkey = `#ext:诸神寰宇/audio/character/${key.replace('#', '')}`;
        }
        result[newkey] = value;
    }
    return result;
}

const voice = getVoice(origintaici);;
export default voice;
