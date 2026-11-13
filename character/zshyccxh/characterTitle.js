import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
export const 天极·皇室宗亲 = {
    zshy_AAZZbianfurenCCXH: `奕世之雍容`,
    zshy_AAZZcaoangJMGX: '御坚不怯',
    zshy_AAZZcaojinyuOL: `春秋盈昃`,
    zshy_AAZZcaoxiancaohuaJMGX: `锦瑟良缘`,
    zshy_AAZZcaoyu: `燕王`,
    zshy_AAZZhuanshujun: `环佩解君`,
    zshy_AAZZliuxieJMGX: '困龙欲出',
    zshy_AAZZliuyanJMGX: '九锡问鼎',
    zshy_AAZZqinghegongzhuJMGX: '馨香清欢',
    zshy_AAZZqinlangOL: `跼高蹐厚`,
    zshy_AAZZruiji: `柔荑弄钺`,
    zshy_AAZZsunhaoJMGX: '暴戾盗睢',

};
export const 四弼·辅国文曲 = {
    zshy_AAZZcaoxi: `魁立倾厦`,
    zshy_AAZZmaliangJMGX: '千计卷来',
    zshy_AAZZxizhicaiJMGX: '扇留魂志',
    zshy_AAZZyanghuJIN: `执德清劭`,
    zshy_AAZZyangyiJMGX: '狷狭激愤',
    zshy_AAZZzhanghuaJMGX: '澹水惊涛',
    zshy_AAZZzhugejinJMGX: '风雅神逸',

};
export const 天柱·势冠一方 = {
    zshy_AAZZhuangzuJMGX: '簇箭伏波',
    zshy_AAZZshamokeJMGX: '应号出征',
    zshy_AAZZzhugedanJMGX: '威凛淮阳',

};
export const 女史·留史巾帼 = {
    zshy_AAZZguanyinpingJMGX: `金枝玉叶`,
    zshy_AAZZguohuaiJIN: '遗毒万年',
    zshy_AAZZzhangxingcaiJMGX: '金枝玉叶',
    zshy_AAZZzhaoxiangJMGX: '月痕芳影',

};
export const 少微·能人异士 = {
    zshy_AAZZpengyangOL: `翻然轻举`,
    zshy_AAZZsimahuiJMGX: `教诲不倦`,
    zshy_AAZZzhanglingJMGX: '篆符敕星',
    zshy_AAZZzhugeguoJMGX: `金枝玉叶`,

};
export const 虎贲·勇冠三军 = {
    zshy_AAZZluzhiJMGX: `斩关赴难`,
    zshy_AAZZquyiJMGX: '突阵奋威',
    zshy_AAZZxiahoubaJMGX: '阵前待令',

};
export const 灯愿·祈福武将 = {
    zshy_AAZZbaosanniangJMGX: `凤舞龙翔`,
    zshy_AAZZcaochunJMGX: '虎豹英骑',
    zshy_AAZZcaoshuangJMGX: '安逸奢靡',
    zshy_AAZZcaoyingJMGX: '长夜临曦',
    zshy_AAZZguansuoJMGX: '承父武志',
    zshy_AAZZpanshu: `江东神女`,
    zshy_AAZZwolongfengchuJMGX: '赤壁链火',
    zshy_AAZZzhouchuJMGX: '翻浪搏蛟',

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
    ...天极·皇室宗亲, ...四弼·辅国文曲, ...天柱·势冠一方,
    ...女史·留史巾帼, ...少微·能人异士, ...虎贲·勇冠三军,
    ...灯愿·祈福武将,
};
setTitle(characterTitle);
export default characterTitle;
