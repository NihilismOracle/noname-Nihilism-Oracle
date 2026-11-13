import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
const 谋定天下 = {
    zshy_AAZZjiangweiSBFM: `墟谋姜维`,
    zshy_zhuri: `逐日`,
    zshy_zhuri_info: `一名角色的阶段结束时，你可与一名角色拼点。若你赢，你可以使用其中一张拼点牌并摸一张牌；若你没赢，你失去1点体力或令此技能于本回合无效，然后摸两张牌。`,
    zshy_ranji: `燃己`,
    zshy_ranji_info: `限定技。结束阶段。你可获得${get.poptip(`zshy_kunfen`)}与${get.poptip(`zshy_zhaxiang`)}（以此法获得的〖困奋〗直接修改为回复1点体力并摸一张牌）。若如此做，你将手牌数调整至手牌上限或将体力值回复至体力上限。`,

    zshy_AAZZlusuSBFM: `墟谋鲁肃`,
    zshy_duduan: `独断`,
    zshy_duduan_info: `一名角色的回合开始时，你可回复1点体力或摸一张牌。若该角色：1.为你，则你可跳过本回合判定、摸牌、出牌和弃牌阶段中的一个阶段，并交换其中另外两个阶段；2.不为你：则你可交换其中两个阶段，并选择一个阶段，当该阶段结束时，你立即执行一个相同的阶段。`,
    zshy_yinglve: `英略`,
    zshy_yinglve_info: `出牌阶段各限一次，你可以令任意名角色：1.失去1点体力，其下个摸牌阶段摸牌数+2；2.摸两张牌，其下个弃牌阶段手牌上限-2。`,
    zshy_mengshi: `盟势`,
    zshy_mengshi_info: `一名角色的结束阶段，你可交换两名其他角色的体力值。`,

    zshy_AAZZpangtongSBFM: `墟谋庞统`,
    zshy_hongtu: `鸿途`,
    zshy_hongtu_info: `当你受到伤害后或不在发动〖鸿途〗中获得牌时，你可回复1点体力或摸三张牌，然后展示三张手牌，令一名其他角色选择是否使用其中一张牌并令你随机重铸其中另一张牌。若使用牌的点数于三张牌中满足以下条件，其获得如下技能或效果直到其下一个回合的回合结束：唯一最大，其获得${get.poptip(`zshy_feijun`)}；不为最大且不为最小，其获得${get.poptip(`zshy_qianxi`)}；唯一最小，其手牌上限+2。若其未以此法使用牌，你对其与你各造成1点火焰伤害。`,
    zshy_qiwu: `栖梧`,
    zshy_qiwu_info: `当你受到伤害时，你可以重铸一张红色牌，防止此伤害。`,

    zshy_AAZZzhugeliangSBFM: `墟谋诸葛亮`,
    zshy_zhitian: `知天`,
    zshy_zhitian_info: `锁定技。①牌堆顶的七张牌对你可见。②你的【火攻】结算中，你可观看并选择牌堆顶七张牌中的一张牌代替【火攻】弃牌。③当你造成伤害后，若你因${get.poptip(`zshy_zhijue`)}而减少〖知天〗的可见牌与观看牌数，则你重置之。`,
    zshy_wujing: `武靖`,
    zshy_wujing_info: `锁定技。①当有牌不因使用而进入弃牌堆后，你使用的下一张牌无距离与次数限制。②当你受到伤害或有不为手牌的牌进入弃牌堆后，你回复1点体力或摸一张牌。`,
    zshy_zhijue: `智绝`,
    zshy_zhijue_info: `转换技。阳：出牌阶段，你可将牌堆顶的一张牌当【火攻】使用；阴：将一种颜色的手牌置入弃牌堆，然后可视为使用其中一张基本牌或普通锦囊牌。若你以此法未造成伤害，你令${get.poptip(`zshy_zhitian`)}可见牌与观看牌数-1（至多减至1），然后你摸两张牌。`,

};
const 武动乾坤 = {
    zshy_AAZZdongzhuoSBFM: `墟谋董卓`,
    zshy_guanbian: `观变`,
    zshy_guanbian_info: `锁定技。①每轮游戏开始时，你的手牌上限、其他角色计算与你的距离、你计算与其他角色的距离+X（X为游戏人数）。②当你发动${get.poptip('zshy_xiongni')}或${get.poptip('zshy_fengshang')}后，你移除〖观变〗增加的效果。`,
    zshy_xiongni: `凶逆`,
    zshy_xiongni_info: `出牌阶段开始时，你可声明一种花色，然后所有其他角色选择一项：1.弃置一张与此牌花色相同的牌；2.受到你的1点伤害。`,
    zshy_fengshang: `封赏`,
    zshy_fengshang_info: `出牌阶段或有角色进入濒死状态时，你可以将两张本回合进入弃牌堆中的牌分配给等量角色。若你未以此法获得牌，你视为使用一张不计入次数的【酒】。`,
    zshy_zhibing: `执柄`,
    zshy_zhibing_info: `锁定技。一名角色使用或打出牌后，若群势力角色累计使用黑色牌的次数达到：三张，你增加4点体力上限并回复4点体力；六张，你获得${get.poptip('zshy_fencheng')}；九张：你获得${get.poptip('zshy_benghuai')}。`,

    zshy_AAZZguanyuSBFM: `墟谋关羽`,
    zshy_weilin: `威临`,
    zshy_weilin_info: `你可将一张牌当作任意【杀】或【酒】使用或打出，且目标角色本回合与此牌颜色相同的手牌均视为【杀】。`,
    zshy_duoshou: `夺首`,
    zshy_duoshou_info: `锁定技。①你使用的红色牌无距离限制。②你使用的基本牌不计入使用次数。③你造成伤害后，你回复1点体力或摸X张牌（X为伤害值）。`,

};
const 花好月圆 = {
    zshy_AAZZhuangyueyingSBFM: `墟谋黄月英`,
    zshy_lixian: `理贤`,
    zshy_lixian_info: `①当你受到伤害后，你可将一张牌当【无中生有】使用，然后回复1点体力或摸一张牌。②当你以此法使用过三种不同牌名的锦囊牌后，此技能于一名角色的结束阶段也可发动。`,
    zshy_bingcai: `并才`,
    zshy_bingcai_info: `基本或普通锦囊牌被使用时，你可重铸一张牌。若两张牌均为伤害类或非伤害类，则此牌额外结算一次。然后若重铸的牌为锦囊牌，你为〖理贤〗添加一个牌名：【顺手牵羊】；【过河拆桥】；【铁索连环】。以上牌名均添加后，${get.poptip(`zshy_lixian`)}于一名角色的准备阶段也可发动。`,

    zshy_AAZZxiaoqiaoSBFM: `墟谋小乔`,
    zshy_miluo: `迷落`,
    zshy_miluo_info: `①出牌阶段限一次，你可展示并交给任意名其他角色各一张牌，这些牌本轮称为「迷落」牌。②一名角色回合结束时，你可令任意名手牌中没有/有「迷落」牌的角色失去/回复1点体力。`,
    zshy_MXQjueyan: `绝颜`,
    zshy_MXQjueyan_info: `①每回合每种牌名限一次，当你需要使用或打出手牌中一张普通锦囊牌或基本牌时，可改为展示并视为使用之。②当你受到伤害或展示手牌后，你回复1点体力或摸X张牌（X为你展示牌数且至少为1）。`,

};
const 计出万全 = {
};
const 施仁布德 = {
};
const 奋勇扬威 = {
    zshy_AAZZsunjianSBFM: `墟谋孙坚`,
    zshy_hulie: `虎烈`,
    zshy_hulie_info: `当你使用伤害牌指定唯一目标后，你可令此牌伤害值基数+1。若此牌未造成伤害，你可令目标角色视为对你使用一张【杀】。`,
    zshy_yipo: `毅魄`,
    zshy_yipo_info: `准备阶段或你的体力值变化后，你可选择一名角色并选择一项：1.令其摸X张牌并回复1点体力；2.令其弃置X张牌并对其造成1点伤害（X为你已损失体力值+1）。`,

};
const 达权通变 = {
};

const translate = {
    ...谋定天下, ...武动乾坤, ...花好月圆, ...计出万全, ...施仁布德, ...奋勇扬威, ...达权通变,
};
export default translate;
