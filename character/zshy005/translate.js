import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
const 颍川荀氏 = {
    zshy_daojie: '蹈节',
    zshy_daojie_info:  '宗族技，锁定技。每回合当你首次使用一种牌名的普通锦囊牌后，你须失去一个锁定技或失去1点体力，令一名颍川荀氏角色获得此牌对应的所有实体牌。',

    zshy_AAZZxuncaiYCXS: '墟族荀采',
    zshy_lieshi: '烈誓',
    zshy_lieshi_info:  '出牌阶段，你可以选择一项，然后令一名其他角色从你未选择的选项中选择一项：1.受到你造成的1点火焰伤害；2.弃置所有【闪】；3.弃置所有【杀】。',
    zshy_dianzhan: '点盏',
    zshy_dianzhan_info:  '锁定技。当你使用一种花色的牌后：若此牌的目标数为1，你横置此牌目标；若你有此花色的手牌，你重铸这些牌。均执行后你回复1点体力或摸一张牌。',
    zshy_huanyin: '还阴',
    zshy_huanyin_info:  '锁定技。当你进入濒死状态时，若你的手牌不为四，则你将手牌调整至四，然后回复至1点体力。',

    zshy_AAZZxuncanYCXS: '墟族荀粲',
    zshy_yunshen: '熨身',
    zshy_yunshen_info:  '出牌阶段，你可以令一名其他角色回复1点体力，然后选择一项：1.你视为对其造成1点冰冻伤害；2.其视为对你造成1点冰冻伤害。',
    zshy_shangshen: '伤神',
    zshy_shangshen_info:  '当一名角色受到属性伤害后，若其：1.体力不足4点，则你可以执行目标角色为你的【闪电】效果，然后其将体力回复至4点；2.手牌不足四张，则你执行目标角色为你的【闪电】效果，然后其将手牌补至四张。',
    zshy_fenchai: '分钗',
    zshy_fenchai_info:  '锁定技。若你首次发动技能指定的异性目标角色中：存在存活角色，你的判定牌视为♥；不存在存活角色，你的判定牌视为♠。',

    zshy_AAZZxunchenYCXS: '墟族荀谌',
    zshy_sankuang: '三恇',
    zshy_sankuang_info:  '锁定技。当你使用或打出牌后，你选择一名其他角色并获得其一至三张牌，若其未失去所有手牌，则其于装备区或处理区内获得你使用的牌对应的所有实体牌。',
    zshy_beishi: '卑势',
    zshy_beishi_info:  '锁定技。当你一次性获得两张及以上的牌后，你回复1点体力或摸一张牌。',

    zshy_AAZZxunshiYCXS: `墟族荀莳`,
    zshy_qingjue: `清绝`,
    zshy_qingjue_info:  `锁定技。①你手牌中每个花色仅一张的牌不计入手牌上限。②当你体力值变化后，你弃置任意张手牌，并执行以下等量项：1.将这些牌交给一名其他角色；2.回复1点体力并获得手牌中未拥有花色的牌各一张。`,
    zshy_yingxiang: `萦香`,
    zshy_yingxiang_info:  `锁定技。当其他角色获得你的牌后，将此牌称为「萦香」。「萦香」牌被使用后，你和手牌中有「萦香」的角色各摸一张牌。若「萦香」牌不因使用而失去，你发动一次${get.poptip(`zshy_qingjue`)}。`,

    zshy_AAZZxunshuYCXS: '墟族荀淑',
    zshy_shenjun: '神君',
    zshy_shenjun_info:  '当一名角色使用除【闪】以外的牌时，若你手牌中有该牌名的牌，你展示之并将这些牌称为「神君」。然后本阶段结束时，你可将一张牌当做一张「神君」牌使用且以此法使用的牌无距离与次数限制。',
    zshy_balong: '八龙',
    zshy_balong_info:  '锁定技。当你使用或打出牌后，若你的手牌不足八张，则你展示所有手牌并摸至八张牌，然后回复1点体力。',

    zshy_AAZZxunyouYCXS: '墟族荀攸',
    zshy_baichu: '百出', zshy_baichu_new: '新组合', zshy_baichu_trick: '已记录',
    zshy_baichu_info:  '锁定技。①当你使用或打出一张牌结算完毕后，若你：1.未记录过此牌的花色和类型组合，则你记录此组合并记录一个基本或普通锦囊牌名，然后回复1点体力或摸一张牌，否则你获得〖奇策〗（已获得则你回复1点体力或摸一张牌）；2.已记录此牌牌名，你回复1点体力或摸一张牌。②当任意<span data-nature="shenmm">花色/类型</span>牌的<span data-nature="shenmm">类型/花色</span>都被记录时，使用该<span data-nature="shenmm">花色/类型</span>牌无<span data-nature="shenmm">次数/距离</span>限制。',

};
const 陈留吴氏 = {
    zshy_muyin: `穆荫`,
    zshy_muyin_info:  `宗族技。一名角色的回合开始时，你可以选择一名陈留吴氏角色，令该角色的手牌上限+1。`,

    zshy_AAZZwubanCLWS: `墟族吴班`,
    zshy_zhanding: `斩钉`,
    zshy_zhanding_info:  `①你可以将任意张牌当做【杀】使用并你令你的手牌上限-1。②你以此法使用的【杀】结算结束后，你将手牌摸至手牌上限，并令此【杀】不计入次数限制，然后若此【杀】造成伤害，则你的手牌上限+1。`,

    zshy_AAZZwuxianCLWS: `墟族吴苋`,
    zshy_yirong: `移荣`,
    zshy_yirong_info:  `出牌阶段限两次，若你的手牌数：小于X，则你可以将手牌摸至X张，然后你回复1点体力并令X-1；大于X，则你可以将手牌弃置至X张，然后你回复1点体力并令X+1。（X为你的手牌上限）`,
    zshy_guixiang: `贵相`,
    zshy_guixiang_info:  `锁定技。你的阶段开始前，你摸两张牌，然后终止此阶段，改为进行一个出牌阶段。`,

};
const 颍川钟氏 = {
    zshy_baozu: '保族',
    zshy_baozu_info:  '宗族技。当一名颍川钟氏角色进入濒死状态时，你可以令其横置并回复至满体力。',

    zshy_AAZZzhonghuiYCZS: '墟族钟会',
    zshy_yuzhi: '迂志',
    zshy_yuzhi_info:  `锁定技。①每轮开始时，你展示一张手牌，然后摸X张牌（X为此牌牌名字数）。②每轮结束时，你弃置本轮因〖迂志〗展示的手牌，然后若你本轮使用的牌数或你上一轮因〖迂志〗摸的牌数小于你本轮因〖迂志〗摸的牌数，你受到3点雷电伤害或失去${get.poptip(`zshy_baozu`)}。`,
    zshy_xieshu: '挟术',
    zshy_xieshu_info:  '当你使用牌或受到伤害后，你可重铸X张牌并<span data-nature="shenmm">横置/重置</span>武将牌，然后摸你已损失体力值张牌（X为此牌牌名字数）。',

    zshy_AAZZzhongyanYCZS: '墟族钟琰',
    zshy_guangu: '观骨',
    zshy_guangu_info:  '转换技。出牌阶段：阳，你可以观看牌堆顶的至多四张牌；阴，你可以观看一名角色的至多四张手牌。然后你可以使用或打出其中的一张牌，若未使用，则本回合〖观骨〗失效。',
    zshy_xiaoyong: '啸咏',
    zshy_xiaoyong_info:  '锁定技。当你使用字数为X的牌时，你重置〖观骨〗并回复1点体力或摸一张牌（X为你上次发动〖观骨〗观看的牌数）。',

    zshy_AAZZzhongyaoYCZS: '墟族钟繇',
    zshy_chengqi: '承启',
    zshy_chengqi_info:  '你可以将至少一张手牌当作任意非同名基本或锦囊牌使用或打出，且你以此法转化的牌名字数须不大于以此法转化的所有实体牌牌名字数之和，若你以此法转化的牌名字数等于以此法转化的所有实体牌牌名字数之和，则你使用此牌时可以令至多X名角色回复1点体力或摸一张牌（X为以此法使用的牌名字数）。',
    zshy_jieli: '诫厉',
    zshy_jieli_info:  '一名角色的结束阶段，你可以选择一名角色，你观看其手牌和牌堆顶的X张牌，然后你可以交换其中的任意张牌（X为你本回合使用过的牌中的牌名字数最大值），最后你回复1点体力或摸一张牌。',

    zshy_AAZZzhongyuYCZS: '墟族钟毓',
    zshy_jiejian: '捷谏',
    zshy_jiejian_info:  '当你于一回合使用第X张牌后，则你可以令任意名角色回复1点体力或摸X张牌。（X为此牌牌名字数）',
    zshy_huanghan: '惶汗',
    zshy_huanghan_info:  '当你受到牌造成的伤害后，你可摸X张牌并弃置Y张牌（X为此牌牌名字数，Y为你已损失的体力值）然后你根据条件执行依次执行对应效果：1.若X不小于Y，则你回复等同伤害值的体力；2.若你未横置，则你可重置任意名角色。',

};
const 吴郡陆氏 = {
    zshy_zelie: `泽烈`,
    zshy_zelie_info:  `宗族技。当吴郡陆氏角色失去其场上的牌后，你可令任意名角色本回合下次摸牌/弃置牌后，其摸一张牌/弃置一张牌。`,

    zshy_AAZZlujiWJLS: `墟族陆绩`,
    zshy_gailan: '该览',
    zshy_gailan_info:  `锁定技。一名角色的回合开始时，你随机创造一张${get.poptip('zshy_huntianyi')}置入装备区。`,
    zshy_huntianyi: '浑天仪',
    zshy_huntianyi_info:  '锁定技。你从装备区失去此牌时，从牌堆中随机获得两张与此牌点数相同的锦囊牌。你受到伤害时，销毁此牌并防止之。',
    zshy_huntianyi_skill: '浑天仪',
    zshy_huntianyi_skill_info:  '锁定技。你从装备区失去此牌时，从牌堆中随机获得两张与此牌点数相同的锦囊牌。你受到伤害时，销毁此牌并防止之。',
    zshy_fennu: '奋驽',
    zshy_fennu_info:  '①一名角色的出牌阶段开始时，你可以令任意名角色各弃置一张牌，将这些牌置于你的武将牌上，称为“逸”。②若你的武将牌上有“逸”，你使用牌指定目标时记录此牌点数。③当你使用或打出牌结算后，若记录点数大于“逸”的点数和，你清除记录并获得所有“逸”。',

    zshy_AAZZlujingWJLS: `墟族陆景`,
    zshy_tanfeng: '探锋',
    zshy_tanfeng_info:  '出牌阶段，你可以视为对一名角色使用一张无视防具且不计次数的【杀】。若此【杀】造成伤害，你回复1点体力或摸X张牌（X为你与其装备区牌数之差且至少为1），然后随机获得一张装备牌；否则其可视为对你使用一张【杀】。',
    zshy_juewei: '绝围',
    zshy_juewei_info:  '你使用实体伤害牌指定目标后，或你成为伤害牌的目标后，你可选择一项：1.重铸一张牌并回复1点体力，于此牌结算完成后视为对一名不为你的目标角色使用此牌；2.弃置一张牌并对使用牌的角色造成1点伤害，令此牌无效。',

    zshy_AAZZluyushengWJLS: `墟族陆郁生`,
    zshy_shixi: '拾昔',
    zshy_shixi_info:  '你可将一种花色的所有牌置入弃牌堆，视为使用你本局游戏首次使用的此花色基本或普通锦囊牌，然后你随机获得一张非同花色的装备牌。',
    zshy_jianbai: '坚白',
    zshy_jianbai_info:  '锁定技。当你使用或打出的牌结算完成后，你选择一种花色的所有牌，然后重铸所有其余花色的牌。重铸后若牌的最大被选择次数不小于你的牌数，则你回复1点体力并摸X张牌（X为此牌被选择的记录次数+1），然后重置记录次数。',

};

const translate = {
    ...颍川荀氏, ...陈留吴氏, ...颍川钟氏, ...吴郡陆氏,
};
export default translate;
