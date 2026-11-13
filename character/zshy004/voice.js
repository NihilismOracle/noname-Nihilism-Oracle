import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
const 文德武备理 = {
    'zshy_AAZZsimayiWDWB:die': '吾梦贾逵、王凌为祟，甚恶之。',
    zshy_buchen1:  '雄韬大略无异辈，何须俯首为人臣？',
    zshy_buchen2:  '魏室摇摇欲坠，何不取而代之？',
    zshy_yingshi1:  '谋大事者，必察常人所不察。',
    zshy_yingshi2:  '吾为人，清俊而鹰视！',
    zshy_xiongzhi1:  '率土之滨，尽归我司马一族！',
    zshy_xiongzhi2:  '蛰伏多载，今朝雄志可展！',
    zshy_quanbian1:  '吾为权变之事，此况应付自如。',
    zshy_quanbian2:  '圣人者，应时权变，见形施宜。',

    'zshy_AAZZzhangchunhuaWDWB:die': '虑困我好儿耳。',
    zshy_ZCHhuishi1:  '慧心独具，识人更识其心。',
    zshy_ZCHhuishi2:  '吾具慧识，观其面而知其心。',
    zshy_qingleng1:  '漫天飞雪，清冷彻骨。',
    zshy_qingleng2:  '雨雪清冷，皆属于寒。',
    zshy_xuanmu1:  '宣穆教化，以养民风。',
    zshy_xuanmu2:  '宣穆阅礼，偶德潜鳞。',

    'zshy_AAZZlisuWDWB:die': '吕布负我！',
    zshy_qiaoyan1:  '时机需趁早，否悔之晚矣。',
    zshy_qiaoyan2:  '某遍观群臣，皆不如董卓。',
    zshy_xianzhu1:  '欲取天下，何惜宝珠。',
    zshy_xianzhu2:  '董公久慕大名，特命吾将此奉献。',

    'zshy_AAZZsimazhouWDWB:die': '望吾之封国，分吾四子。',
    zshy_caiwang1:  '彼美齐献，卓尔不群。',
    zshy_caiwang2:  '扶风遗爱，琅邪克己。',
    zshy_naxiang1:  '督率所统，连据涂中。',
    zshy_naxiang2:  '皓穷蹙请降，送玺绶于吾。',

    'zshy_AAZZchelijiWDWB:die': '元气已伤，不如归去。',
    zshy_chexuan1:  '兵车疾动，以悬敌首！',
    zshy_chexuan2:  '层层布设，以多胜强！',

    'zshy_AAZZhuaxinWDWB:die': '唯望君不忘所戒！',
    zshy_caozhao1:  '伏读草诏，讯诸执事。',
    zshy_caozhao2:  '拟写草诏，群臣必从。',
    zshy_xibing1:  '止战息兵，仁爱为怀。',
    zshy_xibing2:  '息兵修士，以安边民。',

};
const 文德武备备 = {
    'zshy_AAZZchengjichengcuiWDWB:die': '今为贼子贾充所害！',
    zshy_tousui1:  '区区黄口孺帝，能有何作为？',
    zshy_tousui2:  '昔年沙场茹血，今欲饮帝血！',
    zshy_chuming1:  '明公为何如此待我兄弟？',
    zshy_chuming2:  '栖佳木之良禽，其鸣亦哀乎。',

    'zshy_AAZZzhanghuyuechenWDWB:die': '儿有辱，父亲威名……',
    zshy_xijue1:  '承爵于父，安能辱之？',
    zshy_xijue2:  '虎父安有犬子乎！',
    zshy_xijue_tuxi1:  '动如霹雳，威震枭首！',
    zshy_xijue_tuxi2:  '行略如风，摧枯拉朽！',
    zshy_xijue_xiaoguo1:  '大丈夫生于世，当沙场效忠！',
    zshy_xijue_xiaoguo2:  '骁勇善战，刚毅果断！',

    'zshy_AAZZxiahouhuiWDWB:die': '夫要妇死，妇安敢不从……',
    zshy_baoqie1:  '春闺心思说不尽，唯藏锦匣与君听。',
    zshy_baoqie2:  '宝箧遗珠慰冷暖，三尺天地蕴秋风。',
    zshy_yishi1:  '俗语有云，室得一良人胜过沙场千军。',
    zshy_yishi2:  '守礼仪，明是非，免娇嗔，知进退。',
    zshy_shidu1:  '进退有仪，收受有度，见微而知著。',
    zshy_shidu2:  '温言于表，喜怒于内，形色皆意会。',

    'zshy_AAZZsimashiWDWB:die': '心高命薄，天何薄我……',
    zshy_taoyin1:  '成大事者，当务实权而远虚名！',
    zshy_taoyin2:  '潜龙隐于千丈海，胸有韬晦十万兵。',
    zshy_yimie1:  '夷此僚三族，以儆效尤！',
    zshy_yimie2:  '逆我司马氏者，罪无可恕！',
    zshy_tairan1:  '宦海沉浮，历尽风浪，方显英雄本色。',
    zshy_tairan2:  '壁立千仞，泰然本英雄！',
    zshy_ruilve1:  '司马氏满门英杰，皆经天纬地之才！',
    zshy_ruilve2:  '外知军略，内通政事，此乃明君之象。',

    'zshy_AAZZyanghuiyuWDWB:die': '雄黄空酒樽，千古祭汩罗。',
    zshy_huirong1:  '清风透碧，彩线轻缠。',
    zshy_huirong2:  '书香彩慧，香囊幽沁。',
    zshy_ciwei1:  '袭龟筮之良辰，启幽房之潜邃。',
    zshy_ciwei2:  '整武驾之隆牡，结龙辀之缟驷。',
    zshy_caiyuan1:  '婵媛优姿，美好之时。',
    zshy_caiyuan2:  '端清才德，仙媛捧瓣。',

    'zshy_AAZZshibaoWDWB:die': '寒门出身，难以擢升。',
    zshy_zhuosheng1:  '才经世务，干用之绩。',
    zshy_zhuosheng2:  '器量之远，当至公辅。',

};
const 文德武备果 = {
    'zshy_AAZZxuangongzhuWDWB:die': '百草凋索花落英，蟋蟀吟牖寒蝉鸣。',
    zshy_gaoling1:  '卿受司马之恩，当时刻思报，切不可忘。',
    zshy_gaoling2:  '吾为宣王子嗣，今施恩于卿，以求后效。',
    zshy_qimei1:  '眉目传情，何劳口舌之烦。',
    zshy_qimei2:  '无需言语，自然心领神会。',
    zshy_XGZzhuiji1:  '惧死难生，向死求生，退者无还，进者得生。',
    zshy_XGZzhuiji2:  '伤敌一千，自损八百，智者弗为，勇者无惧。',

    'zshy_AAZZwangyuanjiWDWB:die': '均道人易老，未见白头时……',
    zshy_shiren1:  '钟士季其形忠而其骨佞，不可委之重任。',
    zshy_shiren2:  '人皆有其器，可以慧眼识之而辨忠奸。',
    zshy_yanxi1:  '此宴邀八方宾客，请君为乐，以娱众人。',
    zshy_yanxi2:  '宴不同祀，既有饱腹之肉，怎可无娱人之戏？',

    'zshy_AAZZsimazhaoWDWB:die': '得国不正，终为所弑……',
    zshy_tuishi1:  '孤有一剑予君，或提之戮贼，或藏之受戮。',
    zshy_tuishi2:  '卿乃国之股肱，或奉诏讨贼，或引咎自戕。',
    zshy_choufa1:  '训卒成锐，现健儿技及骁勇，可当一战！',
    zshy_choufa2:  '熔金铸兵，今武库矛戈充盈，可以行役。',
    zshy_zhaoran1:  '孤欲身登大宝，射鹿九州，问鼎天下！',
    zshy_zhaoran2:  '天时有常，汉终魏继，魏终则司马氏当继。',
    zshy_chengwu1:  '孤视卿为心腹，卿当视我使之如手足。',
    zshy_chengwu2:  '四库八荒皆有其疆，而孤之心，可扩山海，以至无垠。',

    'zshy_AAZZduyuWDWB:die': '北马陷南江，壮士义气尽。',
    zshy_sanchen1:  '今天时在北，此书当陈、此战可胜。',
    zshy_sanchen2:  '三陈表奏入金阙，十万虎贲饮长江。',
    zshy_pozhu1:  '试问朽木之堤，何当滔滔九天之水？',
    zshy_pozhu2:  '吴鹿失于野，覆稷火而燎东南之原。',
    zshy_zhaotao1:  '今粮秣丰、兵甲足，诏既至、兵即兴。',
    zshy_zhaotao2:  '紫翎传檄聚众将，师出有诏伐不臣。',

    'zshy_AAZZweiguanWDWB:die': '谋图废立之罪，吾难辩解……',
    zshy_zhongyun1:  '性真静有名理，明识清允。',
    zshy_zhongyun2:  '忠允清识，文武之才。',
    zshy_shenpin1:  '薤叶不真，笔势明劲。',
    zshy_shenpin2:  '纵任轻巧，流转风韵。',

};
const 文德武备戒 = {
    'zshy_AAZZzhongyanWDWB:die': '凉风萧条，露沾我衣。',
    zshy_bolan1:  '博览百家之书，以通古今之法。',
    zshy_bolan2:  '遍阅时彦之论，以明经世之道。',
    zshy_yifa1:  '当效诸贤之法，身贵而不凌人。',
    zshy_yifa2:  '贱者不自下，是为家门之仪。',

    'zshy_AAZZxinchangWDWB:die': '我实无辜也，怎遭此祸？',
    zshy_canmou1:  '参军献计，画一举之筹。',
    zshy_canmou2:  '主公问谋，奉两得之举。',
    zshy_XCcongjian1:  '上下一体，应同甘共苦。',
    zshy_XCcongjian2:  '君臣同谐，当危难与共。',

    'zshy_AAZZjiachongWDWB:die': '醉梦人间五十年，大业说与神鬼听。',
    zshy_xiongshu1:  '有朋来当以美酒相迎，有兽至当赐以斧钺。',
    zshy_xiongshu2:  '年关近，凶兽来，当燃爆竹驱之于千里。',
    zshy_jianhui1:  '我欲谋彼岁之喜乐，故需做未雨之绸缪。',
    zshy_jianhui2:  '成济何在？还不助陛下早登极乐。',

    'zshy_AAZZwangxiangWDWB:die': '无毗佐之勋，憾无以报国。',
    zshy_bingxin1:  '解衣卧沂层冰上，双鲤鱼跃擢清漪。',
    zshy_bingxin2:  '一日三公不足荣，忆昔卧冰求鲤时。',

};
const 文德武备约 = {
    'zshy_AAZZyangyanWDWB:die': '后承前训，奉述遗芳。',
    zshy_xuanbei1:  '男胤有德色，愿陛下以备六宫。',
    zshy_xuanbei2:  '广集良家，召充选者使吾拣择。',
    zshy_xianwan1:  '姿容娴婉，服饰华光。',
    zshy_xianwan2:  '有美一人，清扬婉兮。',

    'zshy_AAZZyangzhiWDWB:die': '姊妹继宠，福极灾生。',
    zshy_wanyi1:  '婉嫕而淑慎，位居正室。',
    zshy_wanyi2:  '为后需备贞静之德，婉嫕之操。',
    zshy_maihuo1:  '至亲约束不严，祸根深埋。',
    zshy_maihuo2:  '闻祸端而不备，可亡矣。',

};

let origintaici = {
    ...文德武备理, ...文德武备备, ...文德武备果, ...文德武备戒, ...文德武备约,
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
