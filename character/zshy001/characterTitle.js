import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
const 蜀汉虎将 = {
    zshy_AAZZguanyuBZ: '汜水摧锋',
    zshy_AAZZzhangfeiBZ: '烈将咆疆',
    zshy_AAZZzhaoyunBZ: '勇战佑龙',
    zshy_AAZZmachaoBZ: '铁骑烈焰',
};
const 贤君明主 = {
    zshy_AAZZliubeiBZ: '双剑引龙',
    zshy_AAZZsunquanBZ: '松翠常青',
    zshy_AAZZcaocaoBZ: '魏武东临',
    zshy_AAZZyuanshuBZ: '机缘得玺',
};
const 勇冠三军 = {
    zshy_AAZZganningBZ: '虚拟天团',
    zshy_AAZZlvmengBZ: '天江锋刃',
    zshy_AAZZhuanggaiBZ: '破天焚舰',
    zshy_AAZZxiahoudunBZ: '开疆烈血',
    zshy_AAZZzhangliaoBZ: '奋勇破敌',
    zshy_AAZZxuzhuBZ: '雄毅勇力',
    zshy_AAZZlvbuBZ: '如火燎原',
    zshy_AAZZhuaxiongBZ: '威掠沙场',
};
const 帷幄千里 = {
    zshy_AAZZzhugeliangBZ: '慧心精刻',
    zshy_AAZZzhouyuBZ: '雄姿英发',
    zshy_AAZZluxunBZ: '淑人君子',
    zshy_AAZZhuatuoBZ: '鹿林圣手',
    zshy_AAZZsimayiBZ: '谋定天下',
    zshy_AAZZguojiaBZ: '谋定天下',
};
const 巾帼红颜 = {
    zshy_AAZZhuangyueyingBZ: '智心巧手',
    zshy_AAZZdaqiaoBZ: '衣垂绿川',
    zshy_AAZZzhenjiBZ: '牛年限定',
    zshy_AAZZdiaochanBZ: '舞惑群心',
    zshy_AAZZsunshangxiangBZ: '前后两难',
};
const SP系列 = {
    zshy_AAZZguanyuSP: '怒斩颜良',
    zshy_AAZZjiangweiSP: '护战天水',
    zshy_AAZZjiaxuSP: '冥夜引念',
    zshy_AAZZmachaoSP: '炽炎流焰',
    zshy_AAZZpangtongSP: '夜思故知',
    zshy_AAZZsunshangxiangSP: '好观武事',
    zshy_AAZZzhangheSP: '龙骧赫天',
    zshy_AAZZzhaoyunSP: '龙战于渊',
};
const 始计篇智 = {
    zshy_AAZZbianfurenSJP: `母仪之德`,
    zshy_AAZZduyuSJP: '弼朝愽蚓',
    zshy_AAZZluotongSJP: '阊门治玉',
    zshy_AAZZshenguojiaSJP: '倚星折月',
    zshy_AAZZshenxunyuSJP: '匡汉延祚',
};
const 始计篇信 = {
    zshy_AAZZzhouchuSJP: '义除三害',
    zshy_AAZZshensunceSJP: '搏浪涉江',
    zshy_AAZZshentaishiciSJP: '勇撼日月',
};
const 始计篇仁 = {
};
const 始计篇勇 = {
    zshy_AAZZwenyangSJP: '势若万钧',

};
const 始计篇严 = {
};
const 魔乱九州 = {
    zshy_AAZZlvbuMO: `荡宇捷拳`,
};
const 曹魏 = {
    zshy_AAZZcaofangJMGX: '狼觊虎迫',
    zshy_AAZZcaojinyuJMGX: '惊鸿倩影',
    zshy_AAZZcaomaoLXXH: '向死存魏',
    zshy_AAZZdufurenJMGX: '瑞雪纷华',
    zshy_AAZZsimazhaoLXXH: '昭威淮南',
    zshy_AAZZsimazhaoLXXH_shadow: '昭威淮南',
    zshy_AAZZzhongyuJMGX: `纵笔弄潮`,

};
const 蜀汉 = {
    zshy_AAZZhuamanJMGX: '锋丽鬘影',
    zshy_AAZZwenyuanJMGX: '秋风飒爽',
    zshy_AAZZzhugeliangWMXL: '千古一相',
    zshy_AAZZzhangyuJMGX: `预己知命`,

};
const 东吴 = {
    zshy_AAZZluxunWMXL: '神秀峥嵘',
    zshy_AAZZsunchenJMGX: '骄擅横恣',
    zshy_AAZZsunyiJMGX: '腾龙翻江',

};
const 群雄 = {
    zshy_AAZZbeimihuJMGX: '殿坐回想',
    zshy_AAZZlijueJMGX: `狼噬火踪`,
    zshy_AAZZliubianJMGX: '彼岸幽霜',
    zshy_AAZZlvlingqiJMGX: '冰魄映雪',
    zshy_AAZZxurongJMGX: '文和乱武',
    zshy_AAZZxushaoJMGX: '评世雕龙',
};
const 西晋 = {

};
const 神祇 = {
    zshy_AAZZshencaopiJMGX: ``,
    zshy_AAZZshendengaiJMGX: '巨灵撼宇',
    zshy_AAZZshenhuangzhongLMGX: '金乌落日',
    zshy_AAZZshenjiangweiJMGX: '敕剑伏波',
    zshy_AAZZshenmachaoJMGX: '神威天将',
    zshy_AAZZshenpangtongJMGX: '臻华福天',
    zshy_AAZZshenxuzhuJMGX: '摧城拔山',
    zshy_AAZZshenzhangfeiJMGX: '两界巡使',
    zshy_AAZZshenzhangjiaoJMGX: '驭道震泽',
    zshy_AAZZshenzhonghuiJMGX: '白霜寂世',

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
    ...蜀汉虎将, ...贤君明主, ...勇冠三军, ...帷幄千里, ...巾帼红颜,
    ...SP系列,
    ...始计篇智, ...始计篇信, ...始计篇仁, ...始计篇勇, ...始计篇严,
    ...魔乱九州,
    ...曹魏, ...蜀汉, ...东吴, ...群雄, ...西晋, ...神祇,
};
setTitle(characterTitle);
export default characterTitle;
