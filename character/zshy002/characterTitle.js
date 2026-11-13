import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
const 其疾如风 = {
    zshy_AAZZweiyanSHZL: '誓死卫汉',
    zshy_AAZZxiahouyuanSHZL: '绝尘妙才',
    zshy_AAZZcaorenSHZL: '坚石铁壁',
    zshy_AAZZxiaoqiaoSHZL: '矫情之花',
    zshy_AAZZhuangzhongSHZL: '没金饮羽',
    zshy_AAZZzhoutaiSHZL: '舍身护主',
    zshy_AAZZyujiSHZL: '幻惑众心',
    zshy_AAZZzhangjiaoSHZL: '大贤良师',
    zshy_AAZZshenguanyuSHZL: '鬼神再临',
    zshy_AAZZshenlvmengSHZL: '圣光国士',
};
const 侵略如火 = {
    zshy_AAZZdianweiSHZL: '古之恶来',
    zshy_AAZZxunyuSHZL: '王佐之才',
    zshy_AAZZpangtongSHZL: '玉帛雕翎',
    zshy_AAZZwolongzhugeliangSHZL: '卧龙出山',
    zshy_AAZZtaishiciSHZL: '笃烈之士',
    zshy_AAZZpangdeSHZL: '果敢善战',
    zshy_AAZZyanliangwenchouSHZL: '虎狼兄弟',
    zshy_AAZZyuanshaoSHZL: '四世三公',
    zshy_AAZZshenzhouyuSHZL: '合纵破曹',
    zshy_AAZZshenzhugeliangSHZL: '臻华福天',
};
const 其徐如林 = {
    zshy_AAZZxuhuangSHZL: '亚夫之风',
    zshy_AAZZcaopiSHZL: '魏王称帝',
    zshy_AAZZsunjianSHZL: '魂佑江东',
    zshy_AAZZdongzhuoSHZL: '天魔乱舞',
    zshy_AAZZzhurongSHZL: '野性女王',
    zshy_AAZZmenghuoSHZL: '斧过城摧',
    zshy_AAZZjiaxuSHZL: '冷酷毒士',
    zshy_AAZZlusuSHZL: '独断好施',
    zshy_AAZZshenlvbuSHZL: '戾火浮屠',
    zshy_AAZZshencaocaoSHZL: '晷月皓冕',

};
const 不动如山 = {
    zshy_AAZZzhangheSHZL: '烈马金戈',
    zshy_AAZZdengaiSHZL: '神兵天降',
    zshy_AAZZjiangweiSHZL: '丞相衣钵',
    zshy_AAZZliushanSHZL: '无为命主',
    zshy_AAZZsunceSHZL: '江东霸王',
    zshy_AAZZzhangzhaozhanghongSHZL: '经天纬地',
    zshy_AAZZzuociSHZL: '鬼影神道',
    zshy_AAZZcaiwenjiSHZL: '异乡孤女',
    zshy_AAZZshensimayiSHZL: '晋国之祖',
    zshy_AAZZshenzhaoyunSHZL: '今吾往矣',
};
const 难知如阴 = {
    zshy_AAZZwangjiSHZL: '清奢明水',
    zshy_AAZZyanyanSHZL: '断头将军',
    zshy_AAZZwangpingSHZL: '键闭剑门',
    zshy_AAZZlujiSHZL: '瑚琏之器',
    zshy_AAZZsunliangSHZL: '寒江枯木',
    zshy_AAZZpengliangpengyueSHZL: '雍论臼谋',
    zshy_AAZZxuyouSHZL: '朝秦暮楚',
    zshy_AAZZluzhiSHZL: '国之桢干',
    zshy_AAZZshenliubeiSHZL: '誓守桃园',
    zshy_AAZZshenluxunSHZL: '夷陵破蜀',
};
const 动如雷震 = {
    zshy_AAZZyuanshuSHZL: '仲家之帝',
    zshy_AAZZhaozhaoSHZL: '绝骋惊雷',
    zshy_AAZZchendaoSHZL: '白毦之督',
    zshy_AAZZzhugezhanSHZL: '临难死义',
    zshy_AAZZzhoufeiSHZL: '软玉温香',
    zshy_AAZZguanqiujianSHZL: '镌功征荣',
    zshy_AAZZlukangSHZL: '孤柱扶厦',
    zshy_AAZZzhangxiuSHZL: '玄凰砺羽',
    zshy_AAZZshenzhangliaoSHZL: '雁门刑天',
    zshy_AAZZshenganningSHZL: '战场荣耀',
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
    ...其疾如风, ...侵略如火, ...其徐如林, ...不动如山, ...难知如阴, ...动如雷震,
};
setTitle(characterTitle);
export default characterTitle;
