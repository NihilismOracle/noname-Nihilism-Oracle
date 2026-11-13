import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
const 一将成名2011 = {
    'zshy_AAZZcaozhiYJCM:die': '昔年端阳多好友，今岁重五唯一人。',
    zshy_luoying1:  '沐花芳，沁竹香，煎柏撷桃浴兰汤。',
    zshy_luoying2:  '扎艾叶，悬菖蒲，蒲龙艾虎迎端午。',
    zshy_jiushi1:  '酒醴号星辰，辞赋为君子，个中佳恶吾自得。',
    zshy_jiushi2:  '雄黄冷酒清滋味，敬蛇虫沉醉，话鬼魅酩酊。',

    'zshy_AAZZgaoshunYJCM:die': '陷阵之志，有死无退。',
    zshy_xianzhen1:  '将众整齐，每战必克。',
    zshy_xianzhen2:  '攻陷敌阵，活捉贼将。',
    zshy_jinjiu1:  '酒乱军心，避其嫌也。',
    zshy_jinjiu2:  '借酒壮胆，匹夫所为。',

    'zshy_AAZZxushengYJCM:die': '来世……愿再为我江东之臣！',
    zshy_pojun1:  '战将临阵，斩关刈城！',
    zshy_pojun2:  '区区数百魏军，看我一击灭之。',

    'zshy_AAZZyujinYJCM:die': '这漫天大雨，终究是忘不掉吗？',
    zshy_zhenjun1:  '奉令无犯，当敌制决，靡有遗失！',
    zshy_zhenjun2:  '军令在此，围而后降者皆不赦！',
    zshy_yizhong1:  '在乱能整，讨暴克坚，此毅重也。',
    zshy_yizhong2:  '质忠性一，守执节义，自当无坚不陷。',

    'zshy_AAZZzhangchunhuaYJCM:die': '霜封佳人面，雪覆好颜色。',
    zshy_jueqing1:  '若无寒缨妆红袖，何来玉龙绕阑珊？',
    zshy_jueqing2:  '赤澜兆丰年，今夕好风可借力，彩帛曳光转。',
    zshy_shangshi1:  '歌一阙，酒一爵，与君同醉玉树梢。',
    zshy_shangshi2:  '红玉帛，金剪蛟，此夜贺岁十二肖。',
    zshy_jianmie1:  '春心绽繁花，驱尽数九寒，万千祥瑞映窗红。',
    zshy_jianmie2:  '红袖泯去往日忧，青丝斩尽旧岁愁。',

};
const 一将成名2012 = {
    'zshy_AAZZzhonghuiYJCM:die': '千里之愿，竟止于半途……',
    'zshy_AAZZzhonghuiYJCM_shadow:die': '夺取天下之机，尔等竖子竟弃如敝履！啊！',
    zshy_quanji1:  '莽行轻进，不如缓进徐图。',
    zshy_quanji2:  '谋谟帷幄之间，定断未来之局。',
    zshy_quanji_zshy_AAZZzhonghuiYJCM_shadow1:  '以吾与伯约之智，必可无虞。',
    zshy_quanji_zshy_AAZZzhonghuiYJCM_shadow2:  '吾画无遗策，和须忧患小挫。',
    zshy_zili1:  '哼，司马氏可为，吾如何不可为？',
    zshy_zili2:  '这天下，未必不能姓钟！',
    zshy_paiyi1:  '汝居功自傲，致有吾施谋之机。',
    zshy_paiyi2:  '天下唾手可得，岂容宵小妄为？',

    'zshy_AAZZwangyiYJCM:die': '去年花开君还在，今年花落复谁在。',
    zshy_zhenlie1:  '玉洁松贞，雪晶霜烈。',
    zshy_zhenlie2:  '忠贞不移，誓守家国。',
    zshy_miji1:  '钩元摘秘，精妙计出。',
    zshy_miji2:  '九计秘牒，谨小慎微。',

};
const 一将成名2013 = {
    'zshy_AAZZcaochongYJCM:die': '父亲，冲儿再不能承欢膝下了。',
    zshy_lishi1:  '若以冲所言行事，则此象之重可称也。',
    zshy_lishi2:  '以船载象，以石易象，称石则可得象斤重。',
    zshy_lishi1:  '冲愿以此仁心消弭杀机，保将军周全。',
    zshy_lishi2:  '阁下罪不至死，冲愿施以援手相救。',

    'zshy_AAZZliruYJCM:die': '不舍一女子，可舍天下乎？',
    zshy_mieji1:  '百姓杀得，公卿杀得，这皇帝亦杀得！',
    zshy_mieji2:  '听闻陛下有恙，某特进佳酿相慰。',
    zshy_fencheng1:  '苍生为薪，洛城为炉，且烹天地为食！',
    zshy_fencheng2:  '观焰为舞，长明暗夜，但博美人一笑尔。',
    zshy_juece1:  '既敢徒手而战，想必也不辞黄泉之远。',
    zshy_juece2:  '匹夫家徒四壁，徒留贱命待宰。',

};
const 一将成名2014 = {

    'zshy_AAZZchenqunYJCM:die': '终于可休息了。',
    zshy_pindi1:  '诸英志录，自判品第。',
    zshy_pindi2:  '品第族姓，皆得命议。',
    zshy_faen1:  '宽宏大量，以存忠厚之意。',
    zshy_faen2:  '法外之恩，网开一面。',

    'zshy_AAZZjushouYJCM:die': '志坚心定，岂可与汉贼同谋？',
    zshy_jianying1:  '徐徐图之，曹军难挡。',
    zshy_jianying2:  '缓进渐行，敌军定可不战而退。',
    zshy_shibei1:  '北归无望，亦不会与那曹贼共图。',
    zshy_shibei2:  '北渡难回，清云不降。',

    'zshy_AAZZcaifurenYJCM:die': '背后伤人刘玄德，言而无信曹孟德……',
    zshy_qieting1:  '府中一切风吹草动，都休想瞒过我。',
    zshy_qieting2:  '哼，竟敢在背后说我儿坏话。',
    zshy_xianzhou1:  '若我母子得活，荆州给丞相便是。',
    zshy_xianzhou2:  '识时务者为俊杰，吾等献州以迎曹公。',

};
const 一将成名2015 = {
};
const 原创之魂2016 = {
};
const 原创之魂2017 = {
    'zshy_AAZZxushiYJCM:die': '唯恨不能雪耻。',
    zshy_wengua1:  '卜筮者尚其占，言者尚其辞。',
    zshy_wengua2:  '观变于阴阳而立卦。',
    zshy_fuzhu1:  '大逆不道，罪当伏诛！',
    zshy_fuzhu2:  '足消仇佞，以雪遗恨！',

};

let origintaici = {
    ...一将成名2011, ...一将成名2012, ...一将成名2013, ...一将成名2014, ...一将成名2015, ...原创之魂2016, ...原创之魂2017,
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
