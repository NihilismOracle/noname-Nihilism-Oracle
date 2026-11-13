import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
const dynamicTranslate = {
    zshy_chongxu(player) {
        let str = `锁定技。准备阶段或当你受到伤害后，你`;
        if (player.countMark('zshy_miaojian') == 2 && player.countMark('zshy_lianhua') == 2) {
            return str += `回复1点体力并摸三张牌。`
        };
        if (player.countMark('zshy_miaojian') < 2 && player.countMark('zshy_lianhua') == 2) {
            return str += `选择修改${get.poptip('zshy_miaojian' + (player.countMark('zshy_miaojian') ? player.countMark('zshy_miaojian') : ''))}并摸一张牌，或回复1点体力并摸三张牌。最后若你选择修改技能，则你增加1点体力上限并回复1点体力。`
        };
        if (player.countMark('zshy_miaojian') == 2 && player.countMark('zshy_lianhua') < 2) {
            return str += `选择修改${get.poptip('zshy_lianhua' + (player.countMark('zshy_lianhua') ? player.countMark('zshy_lianhua') : ''))}并摸一张牌，或回复1点体力并摸三张牌。最后若你选择修改技能，则你增加1点体力上限并回复1点体力。`
        };
        return `锁定技。准备阶段或当你受到伤害后，你选择修改${get.poptip('zshy_miaojian' + (player.countMark('zshy_miaojian') ? player.countMark('zshy_miaojian') : ''))}或${get.poptip('zshy_lianhua' + (player.countMark('zshy_lianhua') ? player.countMark('zshy_lianhua') : ''))}并摸一张牌，或回复1点体力并摸三张牌。最后若你选择修改技能，则你增加1点体力上限并回复1点体力。`
    },
    zshy_miaojian(player) {
        return ['出牌阶段限1次。你可将一张基本牌当做刺【杀】使用，或将一张非基本牌当做【洞烛先机】使用。', '出牌阶段限2次。你可将一张牌当做刺【杀】或【洞烛先机】使用。', '出牌阶段限3次。你可视为使用一张刺【杀】或【洞烛先机】。'][player.countMark('zshy_miaojian')];
    },
    zshy_lianhua(player) {
        return ['当你成为伤害牌的目标时，你回复1点体力或摸一张牌。', '当你成为【杀】的目标时，你回复1点体力或摸一张牌。然后你进行判定，若结果为黑桃或红桃，则取消此目标。', '当你成为伤害牌的目标时，你回复1点体力或摸一张牌。然后此伤害牌的使用者选择一项：1.弃置一张与此伤害牌花色类别点数均不同的牌。2.取消此目标。'][player.countMark('zshy_lianhua')];
    },

};
export default dynamicTranslate;
