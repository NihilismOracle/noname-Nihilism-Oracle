import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
const 百战虎贲 = {
    zshy_AAZZwenyangJMGX: '墟文鸯',
    zshy_lvli: '膂力',
    zshy_lvli_info:  '锁定技。当你造成或受到伤害后，你将手牌摸至体力上限，然后将体力回复至手牌数。',
    zshy_WYchoujue: '仇决',
    zshy_WYchoujue_info:  `觉醒技。一名角色失去牌或受到伤害后，若你的手牌数和体力值相差2或更多，你获得${get.poptip("zshy_beishui")}并修改${get.poptip("zshy_lvli")}。`,
    zshy_beishui: '背水',
    zshy_beishui_info:  `觉醒技。一名角色失去牌或受到伤害后，若你的手牌数或体力值小于3，你获得${get.poptip("zshy_qingjiao")}并修改${get.poptip("zshy_lvli")}。`,
    zshy_qingjiao: '清剿',
    zshy_qingjiao_info:  '①当你使用牌指定其他角色为目标时，你可弃置其X张牌（X为本次指定的目标数）。②出牌阶段开始时，你可弃置所有手牌并从牌堆或弃牌堆中随机获得八张牌名各不相同且副类别不同的牌。',

};
const 武庙 = {
    zshy_AAZZhuangfusongWMXL: `墟武皇甫嵩`,
    zshy_chaozhen: '朝镇',
    zshy_chaozhen_info:  '锁定技。一名角色的准备阶段或当其进入濒死状态时，你获得牌堆里与场上点数最小的牌，若牌点数为A，则你失去/回复体力至1点。',
    zshy_lianjie: '连捷',
    zshy_lianjie_info:  '你使用手牌指定目标后，若你有手牌且此牌点数不大于你的所有手牌，你可令一名角色将其一张点数最小的手牌置于牌堆底，然后你摸X张牌（X为你已损失的体力值+1），以此法获得的牌无距离和次数限制。',
    zshy_jiangxian: '将贤',
    zshy_jiangxian_info:  `锁定技。当你使用因${get.poptip('zshy_lianjie')}获得的牌造成伤害时，此伤害+X（X为你本回合造成伤害的次数）`,

    zshy_AAZZluxunWMXL: '墟武陆逊',
    zshy_xiongmu: '雄幕',
    zshy_xiongmu_info:  '①一名角色回合开始时，你可将手牌摸至体力上限（若手牌数不小于体力上限则跳过），然后将任意张牌随机置入牌堆，从牌堆或弃牌堆中获得等量的点数为8的牌。②当你受到伤害时，若你的手牌数不大于你的体力值，此伤害-1。',
    zshy_zhangcai: '彰才',
    zshy_zhangcai_info:  '①当你使用或打出点数为8的牌时，你可摸X张牌（X为你手牌区里点数为8的牌数且至少为1）。②你手中点数为8的牌无距离与次数限制、不计入手牌上限、不可响应且伤害+1。',
    zshy_ruxian: '儒贤',
    zshy_ruxian_info:  '当你使用或打出点数不为8的牌时，你可选择回复1点体力或摸X张牌（X为你手牌区里点数与此牌点数相同的牌数且至少为1）。',

    zshy_AAZZzhugeliangWMXL: '墟武诸葛亮',
    zshy_jincui: '尽瘁',
    zshy_jincui_info:  '锁定技。①一名角色回合开始时，你将手牌摸至七张。②一名角色的准备阶段，你回复X点体力（X为牌堆中点数为7的牌数且至少为1）。然后你观看牌堆顶七张牌，将这些牌以任意顺序置于牌堆顶或牌堆底。',
    zshy_qingshi: '情势',
    zshy_qingshi_info:  '当你使用牌时，若你本回合未因此牌名的牌发动过该技能，你可选择一项：1.令此牌对其中一个目标角色造成的伤害+1；2.令任意名角色各摸一张牌；3.摸两张牌并回复1点体力。',
    zshy_zhizhe: '智哲',
    zshy_zhizhe_info:  '①出牌阶段限一次，你可选择一张基本牌或普通锦囊牌并复制之。当复制牌A离开原区域区后，你复制之且本回合不能再使用或打出复制牌B。②你以此法复制的卡牌不计入手牌上限。',

};

const translate = {
    ...百战虎贲, ...武庙,
};
export default translate;
