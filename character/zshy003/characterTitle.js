import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
const 一将成名2011 = {
    zshy_AAZZcaozhiYJCM: '悬香乘鲤',
    zshy_AAZZgaoshunYJCM: '陷阵统帅',
    zshy_AAZZchengongYJCM: '刚直壮烈',
    zshy_AAZZlingtongYJCM: '豪情烈胆',
    zshy_AAZZmasuYJCM: '恃才傲物',
    zshy_AAZZwuguotaiYJCM: '年高德昭',
    zshy_AAZZxushengYJCM: '破军杀将',
    zshy_AAZZyujinYJCM: '临危不惧',
    zshy_AAZZzhangchunhuaYJCM: '玉鸾翩跹',
    zshy_AAZZfazhengYJCM: '恩怨分明',
    zshy_AAZZxushuYJCM: '身曹心汉',
};
const 一将成名2012 = {
    zshy_AAZZcaozhangYJCM: '神勇壮猛',
    zshy_AAZZxunyouYJCM: '弈战沙场',
    zshy_AAZZliaohuaYJCM: '果敢刚直',
    zshy_AAZZmadaiYJCM: '一合而斩',
    zshy_AAZZbulianshiYJCM: '慈媛戏涧',
    zshy_AAZZchengpuYJCM: '老臣之志',
    zshy_AAZZhandangYJCM: '箭厉沙场',
    zshy_AAZZhuaxiongYJCM: '百战沙场',
    zshy_AAZZliubiaoYJCM: '从容啸咤',
    zshy_AAZZzhonghuiYJCM: '潜蛟觊天',
    zshy_AAZZwangyiYJCM: '巾帼花舞',
    zshy_AAZZguanxingzhangbaoYJCM: '父魂子魄',
};
const 一将成名2013 = {
    zshy_AAZZcaochongYJCM: '飞虹云象',
    zshy_AAZZguohuaiYJCM: '紫电霆击',
    zshy_AAZZmanchongYJCM: '勇不可当',
    zshy_AAZZguanpingYJCM: '战场虎子',
    zshy_AAZZjianyongYJCM: '舌灿莲花',
    zshy_AAZZliufengYJCM: '焰魂锁身',
    zshy_AAZZpanzhangmazhongYJCM: '伏路断道',
    zshy_AAZZyufanYJCM: '言蒙防伏',
    zshy_AAZZzhuranYJCM: '惊涛万军',
    zshy_AAZZfuhuanghouYJCM: '烟雨涳濛',
    zshy_AAZZliruYJCM: '业火焚天',

};
const 一将成名2014 = {
    zshy_AAZZcaozhenYJCM: '霜雷之威',
    zshy_AAZZhanhaoshihuanYJCM: '勇往直前',
    zshy_AAZZchenqunYJCM: '贵雅清丽',
    zshy_AAZZwuyiYJCM: '攻取雍凉',
    zshy_AAZZzhoucangYJCM: '忠勇助关',
    zshy_AAZZzhangsongYJCM: '沃鲤泽汉',
    zshy_AAZZsunlubanYJCM: '金枝玉叶',
    zshy_AAZZzhuhuanYJCM: '亲断敌降',
    zshy_AAZZguyongYJCM: '匡弼辅正',
    zshy_AAZZjushouYJCM: '策胜珠玑',
    zshy_AAZZcaifurenYJCM: '倚月阑珊',
};
const 一将成名2015 = {
    zshy_AAZZcaoruiYJCM: '新君登位',
    zshy_AAZZcaoxiuYJCM: '倾锋袭猎',
    zshy_AAZZzhongyaoYJCM: '挥毫代诏',
    zshy_AAZZliuchenYJCM: '烈帝后裔',
    zshy_AAZZxiahoushiYJCM: '莲灯映月',
    zshy_AAZZzhangyiYJCM: '烈焰燃战',
    zshy_AAZZsunxiuYJCM: '君临即位',
    zshy_AAZZzhuzhiYJCM: '固阵之磐',
    zshy_AAZZquancongYJCM: '福国利民',
    zshy_AAZZgongsunyuanYJCM: '逐鹿天下',
    zshy_AAZZguotufengjiYJCM: '曲辞谄媚',
};
const 原创之魂2016 = {
    zshy_AAZZguohuanghouYJCM: '心系君魂',
    zshy_AAZZliyanYJCM: '叠阁流金',
    zshy_AAZZsundengYJCM: '深达治国',
    zshy_AAZZliuyuYJCM: '饬身厉行',
    zshy_AAZZcenhunYJCM: '铁锁封江',
    zshy_AAZZsunziliufangYJCM: '助魏辅君',
    zshy_AAZZhuanghaoYJCM: '蛇蝎蛊心',
    zshy_AAZZzhangrangYJCM: '浊乱海内',
};
const 原创之魂2017 = {
    zshy_AAZZxinxianyingYJCM: '英装素果',
    zshy_AAZZwuxianYJCM: '凤飞赐福',
    zshy_AAZZxushiYJCM: '思君感伤',
    zshy_AAZZcaojieYJCM: '冰肌玉雪',
    zshy_AAZZjikangYJCM: '清弦鸣飞',
    zshy_AAZZqinmiYJCM: '恬淡浩然',
    zshy_AAZZxuezongYJCM: '彬彬如玉',
    zshy_AAZZcaiyongYJCM: '博学绘法',
};

function setTitle(object) {
    if (object && typeof object === 'object') {
        const keys = Object.keys(object);
        for (let key of keys) {
            const string = object[key];
            if (string && typeof string === 'string') {
                object[key] = `<span style='font-family:xinwei' data-nature='shenmm'><font color='#000000'>${string}</font></span>`;
            }
        }
    }
    return object;
}
const characterTitle = {
    ...一将成名2011, ...一将成名2012, ...一将成名2013, ...一将成名2014, ...一将成名2015, ...原创之魂2016, ...原创之魂2017,
};
setTitle(characterTitle);
export default characterTitle;
