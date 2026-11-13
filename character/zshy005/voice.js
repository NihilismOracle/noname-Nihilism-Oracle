import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
const 颍川荀氏 = {
    'zshy_AAZZxunyouYCXS:die': '北雁南顾，当折彭䗍之滨……',
    zshy_lieshi1:  '闻士执三尺剑而节义，妾可执三寸刃而绝命乎。',
    zshy_lieshi2:  '愿以温血暖冷锋，愿以此命守贞良。',
    zshy_dianzhan1:  '曾与君言誓白首，青丝未雪君先逝。',
    zshy_dianzhan2:  '可以明灯妆白头，此去黄泉未违誓。',
    zshy_huanyin1:  '既生不得入阴氏，今死，可寄我尸还与阴氏乎？',
    zshy_huanyin2:  '我志与阴氏同穴，今为逼迫，虽情不愿，奈何。',
    zshy_daojie_zshy_AAZZxuncaiYCXS1:  '父教我以仁，然今日为何教我以不仁乎？',
    zshy_daojie_zshy_AAZZxuncaiYCXS2:  '我以节义待人，然人待我何其薄也。',

    'zshy_AAZZxuncanYCXS:die': '此钗凝凝，吾妻死之年折之，今可原也。',
    zshy_yunshen1:  '春芽不砺冬寒，其必难引暖风归还。',
    zshy_yunshen2:  '与卿为好之心，似冬风抚面而不寒。',
    zshy_shangshen1:  '此心哀，如涸泽之鲋，无沫相融。',
    zshy_shangshen2:  '此心痛，如刀俎犁腹，欲哭无声。',
    zshy_fenchai1:  '此卿遗我于人间之相思物乎？',
    zshy_fenchai2:  '定情之信物，可折而不可分。',
    zshy_daojie_zshy_AAZZxuncanYCXS1:  '我所蹈之节，可以此生践之。',
    zshy_daojie_zshy_AAZZxuncanYCXS2:  '衷其情而恪其节，此荀门之教也。',

    'zshy_AAZZxunchenYCXS:die': '谌有辱荀氏之名……',
    zshy_sankuang1:  '谋事兢兢，唯恐事败而使荀门蒙包庸之羞。',
    zshy_sankuang2:  '与人言恐不尽，与人谋恐不全，与人事恐不成。',
    zshy_beishi1:  '积锐蓄精，如虎卑势，可立天下之潮。',
    zshy_beishi2:  '以身卑下，蓄势待发，长缨可缚苍龙。',
    zshy_daojie_zshy_AAZZxunchenYCXS1:  '家风蔚然，不敢扰己心、辱门庭。',
    zshy_daojie_zshy_AAZZxunchenYCXS2:  '学成满腹之才，欲卖与天下有节高士。',

    'zshy_AAZZxunshiYCXS:die': `空奁满尘埃，闲愁旧恨一番新。`,
    zshy_qingjue1:  `节草长于绝涯，唯得清寒而自立。`,
    zshy_qingjue2:  `芷兰生深林，非以无人而不芳。`,
    zshy_yingxiang1:  `风丝寸缕轻柔肠，夜雨把盏，屏后萦香。`,
    zshy_yingxiang2:  `白马簪缨缄数语，明明公议，空留荀香。`,
    zshy_daojie_zshy_AAZZxunshiYCXS1:  '不慕荣华，惟守初心之节。',
    zshy_daojie_zshy_AAZZxunshiYCXS2:  '寒梅立雪，守此一身清贵。',

    'zshy_AAZZxunshuYCXS:die': '为何不见明主，扫清此间寰宇……',
    zshy_shenjun1:  '蹈万物之妙法可窥神，定万世之太平可尊圣！',
    zshy_shenjun2:  '餍欲之名于我如浮云尔，此间百味可长清风。',
    zshy_balong1:  '八龙者，周穆之旅牡，神智之慧兽，荀氏之良才！',
    zshy_balong2:  '八子如龙，上可定社稷，下可安黎庶！',
    zshy_daojie_zshy_AAZZxunshuYCXS1:  '一枝寒梅，傲三九霜雪，引春风以致草长莺飞。',
    zshy_daojie_zshy_AAZZxunshuYCXS2:  '以我残躯，似高崖之火，此灯长明，可独耀万古！',

    'zshy_AAZZxunyouYCXS:die': '北雁南顾，当折彭䗍之滨……',
    zshy_baichu1:  '郃计不用，为郭逢所伤，含冤怒而来，君何疑？',
    zshy_baichu2:  '绍运车旦暮至，其将韩猛锐而轻敌，击可破也。',
    zshy_qice_zshy_AAZZxunyouYCXS1:  '颜良兵围白马，今兵少不敌，分其势乃可。',
    zshy_qice_zshy_AAZZxunyouYCXS2:  '文丑疲军而来，此所以擒敌，奈何去之。',
    zshy_daojie_zshy_AAZZxunyouYCXS1:  '神器迁逼，当谋董贼之命，以大存名节也。',
    zshy_daojie_zshy_AAZZxunyouYCXS2:  '外愚内智，外怯内勇，智可及，愚不可及。',

};
const 陈留吴氏 = {
    'zshy_AAZZwubanCLWS:die': `舍生而卫家国者，岂敢居于人后！`,
    zshy_zhanding1:  `既截千钧之铁石，当挫万军于辟易。`,
    zshy_zhanding2:  `力夸劲风，可截金铁，可斩钢钉。`,
    zshy_muyin_zshy_AAZZwubanCLWS1:  `苍天不薄志士，名门不舍熙杰之辈。`,
    zshy_muyin_zshy_AAZZwubanCLWS2:  `祖荫所佑，兄姊所扶，所战必当前。`,

    'zshy_AAZZwuxianCLWS:die': `望兄懿、班，护我大汉。`,
    zshy_yirong1:  `君之美我者，私也；我之美君者，情也。`,
    zshy_yirong2:  `人予我悲哉之所因，我予人善哉之所果。`,
    zshy_guixiang1:  `命中之女，如剑分双刃，或为所用，或为所伤。`,
    zshy_guixiang2:  `余常闻，橘枳分南北，妻离夫亦当如是。`,
    zshy_muyin_zshy_AAZZwuxianCLWS1:  `皇亲国戚之家，其食当珍馐，衣当锦丽。`,
    zshy_muyin_zshy_AAZZwuxianCLWS2:  `所谓刑不上大夫，吴氏忠烈，不可等闲视之。`,

};
const 颍川钟氏 = {
    'zshy_AAZZzhonghuiYCZS:die': '尔等以下犯上，欲诛九族否？',
    'zshy_AAZZzhonghuiYCZS1:die': '此乱皆我一人之罪，勿坐我族。',
    zshy_yuzhi1:  '人生于世，富贵于浮云尔，唯愿留名千古。',
    zshy_yuzhi2:  '世间倥偬几十载，彼可为功名，我亦可为之。',
    zshy_yuzhi3:  '燕雀安知鸿鹄之志哉！',
    zshy_yuzhi4:  '蛇可吞象，我钟会亦可吞天食地！',
    zshy_xieshu1:  '大争之世，英雄弄风云，吾辈空叹否？',
    zshy_xieshu2:  '窃钩者诛，窃国者侯，会欲窃九州为狩。',
    zshy_xieshu3:  '经略四州之地，可钓金鲤于渭水。',
    zshy_xieshu4:  '今提三尺剑、开万里疆，九鼎不足为重！',
    zshy_baozu_zshy_AAZZzhonghuiYCZS1:  '人生艰难，如逆水行舟，不欲进则必退。',
    zshy_baozu_zshy_AAZZzhonghuiYCZS2:  '钟门三世皆为佐国之臣，彼可取而代之。',
    zshy_baozu_zshy_AAZZzhonghuiYCZS3:  '司马氏已居大，我族岂逊他三分！',
    zshy_baozu_zshy_AAZZzhonghuiYCZS4:  '事在人为，王侯之封不在人而在我！',

    'zshy_AAZZzhongyanYCZS:die': '此间天下人，皆分一斗之才。',
    zshy_guangu1:  '此才拔萃，然观其形骨，恐早夭。',
    zshy_guangu2:  '绯衣者，汝所拔乎？',
    zshy_xiaoyong1:  '凉风萧条，露沾我衣。',
    zshy_xiaoyong2:  '忧来多方，慨然永怀。',
    zshy_baozu_zshy_AAZZzhongyanYCZS1:  '好女宜家，可度大厄。',
    zshy_baozu_zshy_AAZZzhongyanYCZS2:  '宗族有难，当施以援手。',

    'zshy_AAZZzhongyaoYCZS:die': '幼子得宠而无忌，恐生无妄之祸。',
    zshy_chengqi1:  '世有十万字形，亦当有十万字体。',
    zshy_chengqi2:  '笔画如骨，不可拘于一形。',
    zshy_jieli1:  '子不学难成其材，子不教难筑其器。',
    zshy_jieli2:  '此子顽劣如斯，必当严加管教。',
    zshy_baozu_zshy_AAZZzhongyaoYCZS1:  '立规定矩，教习钟门之才。',
    zshy_baozu_zshy_AAZZzhongyaoYCZS2:  '放任纨绔，于族是祸非福。',

    'zshy_AAZZzhongyuYCZS:die': '毓愿偿吾弟之罪，以身代死。',
    zshy_jiejian1:  '盛暑行师，兵者所慎，实非至尊动轫之时。',
    zshy_jiejian2:  '水旱不时，帑藏空虚，凡此之类，可须丰年。',
    zshy_huanghan1:  '臣一介凡夫，睹龙颜、摄龙威，敢不惶恐。',
    zshy_huanghan2:  '帝王者，臣子之君父，父威如煌，安敢不惧。',
    zshy_baozu_zshy_AAZZzhongyuYCZS1:  '乞晋公明鉴，吾弟罪该万死，然钟氏绝无二心。',
    zshy_baozu_zshy_AAZZzhongyuYCZS2:  '士季有麒麟之才，亦怀饕餮之志，不可委以众任。',

};
const 吴郡陆氏 = {
    'zshy_AAZZlujiWJLS:die': `六十载后，海晏河清，恨不及见也。`,
    zshy_gailan1:  '遍修文德，管夷吾不费兵车以匡天下。',
    zshy_gailan2:  `浑仪周天，效平子以数术穷无极之宇。`,
    zshy_fennu1:  '此心自有凌霄羽，岂因位卑而无为。',
    zshy_fennu2:  '君子以自强不息，岂因路远而止行。',
    zshy_zelie_zshy_AAZZlujiWJLS1:  `颂彼嘉树，独立不迁，生彼淮南，泽润一方。`,
    zshy_zelie_zshy_AAZZlujiWJLS2:  `馨香盈袖，路远致之。赤子寸心，烈烈如辉。`,

    'zshy_AAZZlujingWJLS:die': `阿童复阿童，不畏岸兽，畏蛟龙……`,
    zshy_tanfeng1:  '轻身涉险地，探敌锋芒，利刃出鞘斩乱局。',
    zshy_tanfeng2:  '仗剑探虎穴，寻其破绽，当凭此刃破万军。',
    zshy_juewei1:  '今老贼入彀，徒做困兽而斗。',
    zshy_juewei2:  '围虽固，然凭吾之勇毅可决。',
    zshy_zelie_zshy_AAZZlujingWJLS1:  `曹贼之强，跨险南北，终止濡须铁壁。`,
    zshy_zelie_zshy_AAZZlujingWJLS2:  `伪备之盛，泽身白帝，胆裂江东风雷。`,

    'zshy_AAZZluyushengWJLS:die': `拉钩拉钩，明天见~`,
    zshy_shixi1:  '竿儿起，竿儿落，小小竿儿两头卧。',
    zshy_shixi2:  '三月三，跳竹竿，绣球要挂彩云端。',
    zshy_jianbai1:  '唱山歌咧，这边唱来那边和~',
    zshy_jianbai2:  '什么有脚不走路咧？什么无脚满江游？',
    zshy_zelie_zshy_AAZZluyushengWJLS1:  `嘿咻~等下要一起爬树看星星吗？`,
    zshy_zelie_zshy_AAZZluyushengWJLS2:  `孔融让梨，是因为不爱吃梨子吗？`,

};

let origintaici = {
    ...颍川荀氏, ...陈留吴氏, ...颍川钟氏, ...吴郡陆氏,
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
const voice = getVoice(origintaici);
export default voice;
