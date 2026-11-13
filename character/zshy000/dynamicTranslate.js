import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
const dynamicTranslate = {
    zshy_lvli(player) {
        if (player.storage.zshy_WYchoujue && !player.storage.zshy_beishui) {
            return '<li>当你回复体力，造成或受到伤害后，你可选择：①若你的体力值大于你的手牌数，你摸X张牌；②若你的手牌数大于你的体力值且你已受伤，你回复X点体力（X为你的手牌数与体力值之差）。';
        }
        if (player.storage.zshy_beishui) {
            return '<li>你使用牌无次数限制。<li>当你回复体力，造成或受到伤害后，你可选择：①若你的体力值大于你的手牌数，你摸X张牌；②若你的手牌数大于你的体力值且你已受伤，你回复X点体力（X为你的手牌数与体力值之差）。';
        }
        else return '<li>当你造成或受到伤害后，你可选择：①若你的体力值大于你的手牌数，你摸X张牌；②若你的手牌数大于你的体力值且你已受伤，你回复X点体力（X为你的手牌数与体力值之差）。';
    },
    zshy_kengqiang(player) {
        if (player.storage.zshy_shangjue && !player.storage.zshy_kunli) {
            return '<li>当你使用伤害牌时，你可以选择一项：①回复1点体力或摸三张牌；②令此牌基础数值+1且获得此牌。';
        }
        if (player.storage.zshy_kunli) {
            return '<li>当你使用基本或普通锦囊牌时，你可以选择一项：①回复1点体力或摸三张牌；②令此牌基础数值+1且获得此牌。';
        }
        else return '<li>每回合每项各限1次，当你使用伤害牌时，你可以选择一项：①回复1点体力或摸三张牌；②令此牌基础数值+1且获得此牌。';
    },
    zshy_kunfen(player) {
        if (!player.storage.zshy_kunfen) return '【锁定技】<li>一名角色结束阶段开始时，你失去1点体力，然后摸两张牌。';
        return '【锁定技】<li>一名角色结束阶段开始时，你回复1点体力，然后摸一张牌。';
    },
};
export default dynamicTranslate;
