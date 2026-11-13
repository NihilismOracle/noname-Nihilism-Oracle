import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
const 其疾如风 = {
    'zshy_AAZZweiyanSHZL:die': '怨气，终难平……',
    zshy_kuanggu1:  '我自横扫天下，蔑视群雄又如何？',
    zshy_kuanggu2:  '沙场驰骋，但求一败！',
    zshy_qimou1:  '要想致胜，还需奇谋。',
    zshy_qimou2:  '为将需勇，更要善奇谋。',

    'zshy_AAZZxiahouyuanSHZL:die': '吾命休矣，遂成竖子之名。',
    zshy_shensu1:  '吾等无需恋战。',
    zshy_shensu2:  '吾自当以一当十，速战速决！',
    zshy_shebian1:  '兵贵设变，以变用计。',
    zshy_shebian2:  '奋勇对敌，设变巧取。',

    'zshy_AAZZcaorenSHZL:die': '坚守到，最后一刻！',
    zshy_jushou1:  '吾等守城，无人可破！',
    zshy_jushou2:  '守城，是我长项，呵呵哈哈！',
    zshy_jiewei1:  '尔等莫慌，吾来也！',
    zshy_jiewei2:  '上马，出城！',

    'zshy_AAZZxiaoqiaoSHZL:die': '鹊桥孤影，公瑾何时归……',
    zshy_tianxiang1:  '花醉山林，香泽弥漫。',
    zshy_tianxiang2:  '暖香幽幽，驱冷散寒。',
    zshy_hongyan1:  '明月皎皎白，七夕绵绵意。',
    zshy_hongyan2:  '君心照我心，红颜牵郎君。',
    zshy_piaoling1:  '桃花随风逝，飘落待归期。',
    zshy_piaoling2:  '昨日繁花盛，今日萧萧落。',

};
const 侵略如火 = {
    'zshy_AAZZwolongzhugeliangSHZL:die': '气运俱尽矣。',
    zshy_huoji1:  '炽焰飈发，焚轻舟，坠敌身。',
    zshy_huoji2:  '以火焚敌，乱其行阵。',
    zshy_bazhen1:  '因势而动，变生于阵之间。',
    zshy_bazhen2:  '兵之用者，其状不定见也。',
    zshy_kanpo1:  '区区雕虫小技，微不足道矣。',
    zshy_kanpo2:  '识众寡之用者，胜之。',
    zshy_cangzhuo1:  '藏巧于拙，可败中取胜。',
    zshy_cangzhuo2:  '大巧若拙，大直若屈。',

    'zshy_AAZZpangdeSHZL:die': '大丈夫，死生何惧！',
    zshy_jianchu1:  '乘胜追击，杀！杀！',
    zshy_jianchu2:  '驰骋沙场，杀敌无惧。',

    'zshy_AAZZshenzhouyuSHZL:die': '弦断人陨，环佩空鸣。',
    zshy_yeyan1:  '红莲业火，焚汝残躯！',
    zshy_yeyan2:  '神火天降，樯橹灰飞烟灭！',
    zshy_qinyin1:  '宫商角徵，琴音箜篌！',
    zshy_qinyin2:  '雄姿英发，天不薄我！',

    'zshy_AAZZshenzhugeliangSHZL:die': '士元，满饮此杯！',
    zshy_qixing1:  '观星辰，水龙跃，银河倾洒瑞雪纷。',
    zshy_qixing2:  '星辰指引岁初更，此日挥毫，瑞雪映华灯。',
    zshy_dawu1:  '东风送暖入华年，笑看玉龙映苍天。',
    zshy_dawu2:  '金龙潜翔祥云瑞，雾隐星河灯火明！',
    zshy_kuangfeng1:  '瑞雪映门阙，华章待奏鸣，祈年丰殷驻春风。',
    zshy_kuangfeng2:  '腾云贺新岁，龙翔东风，春来万物可发生！',

};
const 其徐如林 = {
    'zshy_AAZZxuhuangSHZL:die': '粮车在哪里！',
    zshy_duanliang1:  '断粮之师，不足为惧！',
    zshy_duanliang2:  '强兵难为无粮之役，断粮可胜！',
    zshy_jiezi1:  '截彼之粮，以助我军，战无不胜！',
    zshy_jiezi2:  '截锱以馈军，则吾军勇而敌军乏。',

    'zshy_AAZZcaopiSHZL:die': '大事未成，愧对先父……',
    zshy_fangzhu1:  '现在走，是你最好的选择。',
    zshy_fangzhu2:  '这是本王，最后的仁慈。',
    zshy_xingshang1:  '生不带来，死不带去。',
    zshy_xingshang2:  '有时候，死人比活人有用。',
    zshy_songwei1:  '魏王世子，定登大统！',
    zshy_songwei2:  '千古霸业，只在今朝！',

    'zshy_AAZZdongzhuoSHZL:die': '若无老夫，这天下岂不是要寂寞许多。',
    zshy_jiuchi1:  '酒中罹魂千万，老夫一觞饮之！',
    zshy_jiuchi2:  '金樽且行乐，无酒无中原！',
    zshy_roulin1:  '红颜祸水又如何，老夫甘之如饴！',
    zshy_roulin2:  '青丝绕指柔，最蚀英雄骨！',
    zshy_benghuai1:  '活在今宵，管什么明日祸乱。',
    zshy_benghuai2:  '掌权长安，我有什么不能做的。',
    zshy_baonue1:  '天下事在我，谁敢不从！',
    zshy_baonue2:  '群枭伺动，为董作伥！',

    'zshy_AAZZzhurongSHZL:die': '这诸葛亮竞厉害如斯……',
    zshy_juxiang1:  '兽之最大者，南中巨象也。',
    zshy_juxiang2:  '象阵激斗以伺敌，陷者，粉身碎骨！',
    zshy_lieren1:  '烈刃于前，无处可退！',
    zshy_lieren2:  '烈刃在手，以诛敌首。',
    zshy_changbiao1:  '长标之锐，故无不陷也。',
    zshy_changbiao2:  '丈八长标，非吾不能制之。',

    'zshy_AAZZmenghuoSHZL:die': '饥则食，困则眠，杀便杀。',
    zshy_huoshou1:  '立尔戈，执尔矛，奋蛮蛟之怒，戎行四野。',
    zshy_huoshou2:  '竖而卡，迎而战，雇龙象之禽，威震八荒。',
    zshy_zaiqi1:  '海枯石烂，沧海桑田，乾坤相易，而唯我独存。',
    zshy_zaiqi2:  '蛮民生而不息，青山绿水长流。',

    'zshy_AAZZjiaxuSHZL:die': '难以苟全于乱世之中。',
    zshy_wansha1:  '汝已孤立无援，乖乖领死吧。',
    zshy_wansha2:  '且看你如何自救。',
    zshy_weimu1:  '胜人之至道，在隐与匿。',
    zshy_weimu2:  '天下本无难事，全在人为布局而已。',
    zshy_luanwu1:  '让我看看，你们求生的意志有多强烈。',
    zshy_luanwu2:  '布阵合围以乱敌军将士之心。',

    'zshy_AAZZshenlvbuSHZL:die': '魂飞魄散，且入轮回。',
    zshy_kuangbao1:  '骨肉为宴，吾为战狂！',
    zshy_kuangbao2:  '神魔现世，当负命而还！',
    zshy_wumou1:  '鼠辈之谋，吾耻为之！',
    zshy_wumou2:  '勇而无谋，用之必伤。',
    zshy_wuqian1:  '且断轮回化魔躯，不擒首誓不还！',
    zshy_wuqian2:  '神魔天征，挡我者死！',
    zshy_shenfen1:  '神怒降世，炼狱即临！',
    zshy_shenfen2:  '吾怒如火，焚汝残躯！',
    zshy_SLBwushuang1:  '修罗降世，神鬼辟易！',
    zshy_SLBwushuang2:  '殃云天降，修罗挥兵！',

    'zshy_AAZZshencaocaoSHZL:die': '哼哼...天下人...皆负我!',
    zshy_guixin1:  '九州毁于狼烟，本欲为能臣，奈何无治世。',
    zshy_guixin2:  '欲使天下归心，心当系于天下，岂容相负。',
    zshy_feiying1:  '该技能无语音！',

};
const 不动如山 = {
    'zshy_AAZZzhangheSHZL:die': '归军难追，追之必凶……',
    zshy_qiaobian1:  '临阵要诀，不过随机应变尔。',
    zshy_qiaobian2:  '兵者，应以正相合，出奇制胜。',

    'zshy_AAZZdengaiSHZL:die': '吾道世间多君子，唉……',
    zshy_tuntian1:  '战者，粮草为先。',
    zshy_tuntian2:  '静待时机，一鸣惊人。',
    zshy_zaoxian1:  '事在人为，天险又如何？',
    zshy_zaoxian2:  '就势取利，扭转乾坤！',
    zshy_jixi1:  '以快打慢，袭敌不备！',
    zshy_jixi2:  '时机已到，先发制人。',

    'zshy_AAZZshenzhaoyunSHZL:die': '云虽得脱，只恐公子难保……',
    zshy_longhun1:  '枪势如惊龙，剑锋耀金乌。',
    zshy_longhun2:  '银枪摩白日，利剑断流星。',
    zshy_juejing1:  '单骑赴危难，瘴雾不辞冲。',
    zshy_juejing2:  '据鞍入敌阵，回辔透重围。',

};
const 难知如阴 = {
    'zshy_AAZZwangjiSHZL:die': '若子孙不竞，社稷之忧也。',
    zshy_qizhi1:  '斗奇而争，以妙取胜。',
    zshy_qizhi2:  '用计奇略，制敌服心。',
    zshy_jinqu1:  '拒天诛者意沮，而向王化者益固。',
    zshy_jinqu2:  '志正则众邪不生，心静则众事不躁。',

    'zshy_AAZZshenliubeiSHZL:die': '云长，翼德，为兄来也……',
    zshy_longnu1:  '神龙降天怒，雷火镇仇雠！',
    zshy_longnu2:  '手足之殇，不共戴天！',
    zshy_jieying1:  '结桃园之义，血手足之仇。',
    zshy_jieying2:  '吾弟，且慢行，待为兄报仇雪恨。',

    'zshy_AAZZshenluxunSHZL:die': '唉，我这算是，覆鹿寻蕉之过吗？',
    zshy_junlve1:  '诱敌而入，以待破敌之机。',
    zshy_junlve2:  '统军之法，不唯以死相拼。',
    zshy_cuike1:  '如此扎寨，牵一发而动全身。',
    zshy_cuike2:  '摧其壁垒，克其之营。',
    zshy_zhanhuo1:  '绽火如绽旗，一网打尽！',
    zshy_zhanhuo2:  '凭风借势，以火代兵！',

};
const 动如雷震 = {
    'zshy_AAZZhaozhaoSHZL:die': '锦囊计，难破硬骨头。',
    zshy_zhengu1:  '积骸盈城，半步不退！',
    zshy_zhengu2:  '死生相拒，招招不让！',

    'zshy_AAZZzhangxiuSHZL:die': '文和，可有良计救我……',
    zshy_xiongluan1:  '奋兵而起，当逞一时之雄。',
    zshy_xiongluan2:  '长枪在侧，安能束手待缚。',
    zshy_congjian1:  '若非阁下之言，绣自误矣。',
    zshy_congjian2:  '阁下此计甚妙，吾当从之。',

    'zshy_AAZZshenganningSHZL:die': '宁尚不惜死！',
    zshy_poxi1:  '趁夜斫敌，魄袭魂散。',
    zshy_poxi2:  '知彼知己者，虽百战亦无一败耳。',
    zshy_SGNjieying1:  '夜入魏军，惊骇鼓噪。',
    zshy_SGNjieying2:  '逾垒入营，可斩敌首。',

};

let origintaici = {
    ...其疾如风, ...侵略如火, ...其徐如林, ...不动如山, ...难知如阴, ...动如雷震,
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
