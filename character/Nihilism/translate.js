import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
const 远古遗神 = {
    zshy_baibian: `百变`,
    zshy_baibian_info: `绝恒技，一名角色的回合开始时，你回复1点体力或摸一张牌，若你的技能数少于6，则你随机获得一个非绝恒技技能，否则你随机替换一个非本武将牌的非绝恒技技能。`,

    zshy_Nihilism: `封印`,
    zshy_Nihilism_info: `<font color=red>【绝恒技||亡灵技】</font>特殊效果：你的技能不会失效或失去。`,
    Nihilism_AAAAanjing: '安璟',
    zshy_AJshenzuninfo: '神尊', zshy_AJshenzun: '神尊',
    zshy_AJshenzuninfo_info: '<font color=red>【绝恒技||亡灵技】</font>①每局游戏限一次。游戏开始时或你登场时，你将主将固定为安璟并废除判定区，然后选择一张除安璟外的武将牌作为副将。最后明置场上所有暗置的武将牌、公开所有角色的身份，按座次依次为每名角色分配身份（可选择的身份为分配前场上已有的身份，可重复选择；无身份牌的队伍模式改为分配已有阵营）。与你身份相同的角色加入你的阵营；若所有存活角色均与你同阵营，你可令你及同阵营角色获得游戏胜利。②每轮游戏开始时，或一名角色死亡前、受到伤害前、失去体力前、回复体力前、体力值变化前、体力上限增减前，你可立即插入并执行一个出牌阶段。',
    zshy_AJxuwuinfo: '虚无', zshy_AJxuwu: '虚无',
    zshy_AJxuwuinfo_info: '<font color=red>【绝恒技||亡灵技】</font>①你使用或打出的牌不受禁止使用或响应的限制，且你使用的牌无距离与次数限制。②其他角色不能弃置你的牌。③你的手牌不计入手牌上限。④当你需要使用或打出一张基本牌、锦囊牌或飞升牌时，你可视为使用或打出该牌。',
    zshy_AJjinmieinfo: '烬灭', zshy_AJjinmie: '烬灭',
    zshy_AJjinmieinfo_info: '<font color=red>【绝恒技||亡灵技】</font>当你使用牌指定其他角色为目标时，或一名其他角色的回合开始前，若其势力、身份或阵营与你不同，你可将其势力、身份与阵营改为与你相同；若此技能由使用牌触发，此牌对其无效。若所有存活角色均与你同阵营，你及同阵营角色获得游戏胜利。',
    zshy_AJhuanhuninfo: '唤魂', zshy_AJhuanhun: '唤魂',
    zshy_AJhuanhuninfo_info: '<font color=red>【绝恒技||亡灵技】</font>①你的体力、体力上限与护甲始终为∞，你不会进入濒死状态、死亡或被判负；主将固定为安璟，副将为你最后一次确认的武将牌。②一名角色的任意阶段开始前，你恢复主将与当前副将及其技能，并废除判定区；你翻面或横置后，立即复原。③当你即将死亡时，防止之。你可重新选择一张除安璟和当前副将外的武将牌替换副将，然后进入休整并立即结束休整。副将技能随副将牌更换，按当前副将的技能规则结算。④游戏结束结算胜负时，你及同阵营角色获胜；多名安璟并存时，各自及其同阵营角色均获胜。',

    zshy_AllSkill: `神选`,
    zshy_AllSkill_info: `绝恒技。①游戏开始时或你登场后，你废除判定区。②当其他角色使用牌指定你为目标时，你回复1点体力或摸一张牌，若其没有〖神选〗，则你可使用一张牌。③你的手牌上限+4。④你使用的牌无距离与次数限制。`,

    zshy_AAAAantianhen: `安天痕`,
    zshy_AAAAkuiming: `馈命`,
    zshy_AAAAkuiming_info: `绝恒技。当你即将死亡时，防止之，将你的体力与体力上限调整为1。然后你可选择任意名其他角色，令这些角色按座次依次将体力上限调整为其体力值-1，最后你立即执行一个出牌阶段。`,
    zshy_ATHmingying: '命影',
    zshy_ATHmingying_info: '绝恒技。①当其他角色的体力值变化后，你获得等量「影」；若其体力值减少，你受到等量无来源伤害。②当其他角色的体力上限变化后，你获得等量「影」。③出牌阶段，你可移去任意枚「影」，然后选择一项：令一名角色摸等量的牌；令一名角色回复等量体力；对一名其他角色造成等量伤害。',
    zshy_ATHmingying_ying: '影',
    zshy_ATHdengshen: `登神`,
    zshy_ATHdengshen_info: `觉醒技。当你累计获得6枚「影」后，你移去所有「影」，然后获得〖替影〗。`,
    zshy_ATHtiying: `替影`,
    zshy_ATHtiying_info: `其他角色的出牌阶段开始时，你可观看其手牌，然后替其使用其中至多X张牌（X为其已损失体力值+1）。`,

    zshy_AAAAmiehun: '灭魂',
    zshy_MHxihun: '戏魂',
    zshy_MHxihun_info: `绝恒技。①当你登场后，你随机展示至多三名传说品质的武将牌，你选择一名作为副将（已有副将则替换）。②当你即将死亡时，防止之；你获得1枚「幕」。若你当前没有正在进行的戏（首次或上一幕为谢幕），你执行「登场」：随机展示三张「登场」戏目，选择一张永久获得，将体力与体力上限调整为1，重新登场并触发登场类技能。否则你选择「演出」或「谢幕」：「演出」——随机展示三张「演出」戏目，选择一张永久获得；「谢幕」——若自上次登场以来演出过，你可选择替换副将牌，或改为将其他角色的体力上限调整为X-1（X为其体力值）；若没有演出过，则只能替换副将牌；谢幕后本场戏结束，下一幕必须重新登场。演出或谢幕后同样将体力与体力上限调整为1。每一幕结束时你执行一个出牌阶段。`,
    zshy_MHxihun_mu: '幕',

    zshy_AAAAzhongmo: '盅墨',
    zshy_ZMxuemo: '血墨',
    zshy_ZMxuemo_info: '绝恒技。①当你登场后，你可选择任意名其他角色，你夺取其一个技能，然后其获得1枚「墨」。②当你即将死亡时，防止之，将你的体力上限调整为1，然后回复至满体力。然后你选择一项：1.令所有有「墨」的其他角色的体力上限-1；2.夺取每名有「墨」的角色各一个技能；3.摸等量的牌，然后移去场上所有「墨」。',
    zshy_ZMxuemo_mo: '墨',
    zshy_ZMluomo: '落墨',
    zshy_ZMluomo_info: '绝恒技。①一名其他角色使用牌后，其获得1枚「墨」。②没有「墨」的其他角色不能使用牌指定你为目标。',
    zshy_ZMlinmo: '临摹',
    zshy_ZMlinmo_info: '绝恒技。①你使用或打出手牌时，你可移去一名角色的1枚「墨」，将这张手牌当本轮其他角色使用或打出过的一张基本牌或普通锦囊牌使用或打出。②出牌阶段，你可移去一名角色的1枚「墨」，获得其一个技能（已拥有的技能与绝恒技不能选择），直到你使用该技能后失去。',
    zshy_ZMlinmo_get: '临摹·得技',

    zshy_AAAAzuilian: '罪恋',
    zshy_ZLyehuo: `业火`,
    zshy_ZLyehuo_info: `绝恒技。当你即将死亡时，防止之，将你的体力上限调整为1，然后回复至满体力，并对每名有「罪」的其他角色造成1点神属性伤害。`,
    zshy_ZLfenzui: '焚罪',
    zshy_ZLfenzui_info: '绝恒技。①一名其他角色造成伤害后，其获得1枚「罪」。②一名角色的回合结束时，所有有「罪」的角色受到1点火焰伤害，然后移去1枚「罪」。',
    zshy_ZLfenzui_zui: '罪',
    zshy_ZLpanfa: '判罚',
    zshy_ZLpanfa_info: '绝恒技。出牌阶段限一次，你可选择一名其他角色，然后选择一项：1.令其获得1枚「罪印」；2.若其没有「罪」，也没有「罪印」，则其获得「赦」，本局不再获得「罪」。',
    zshy_ZLpanfa_yin: '罪印',
    zshy_ZLpanfa_she: '赦',

};
const 江山多殇 = {
    zshy_AAABSkill: `魂殇`,
    zshy_AAABSkill_info: `绝恒技。①当你登场后，你废除判定区并将体力与体力上限调整为7。②当你使用或打出牌时，你回复1点体力或摸一张牌。③你使用的牌无距离与次数限制。`,

    zshy_AAABanri: '黯日',
    zshy_ARjunwei: '君威',
    zshy_ARjunwei_info: '绝恒技。当你使用牌指定其他角色为目标后，你可令该角色选择一项：1.交给你一张牌；2.令你选择并失效其一个技能直到你的回合开始，然后其受到1点神属性伤害并获得1枚「叛」。每名角色每回合限一次。',
    zshy_ARzuifa: '罪罚',
    zshy_ARzuifa_info: '绝恒技。一名角色的回合结束时，若场上有角色有3枚或以上「叛」，你对其执行「裁决」：移去其所有「叛」，然后其选择一项：1.随机失去1个技能；2.受到X点神属性伤害（X为其因此被移去的「叛」数）。',
    zshy_ARzuifa_pan: '叛',
    zshy_ARzuifa_pan_info: '达到3枚时，〖罪罚〗在该回合结束时执行「裁决」。',
    zshy_ARrishi: '日蚀',
    zshy_ARrishi_info: '觉醒技。当你累计执行2次〖罪罚〗的裁决后，你移去场上所有「叛」，减少2点体力上限，然后获得〖独裁〗。',
    zshy_ARducai: '独裁',
    zshy_ARducai_info: '锁定技。你使用的牌不能被其他角色响应。',

    zshy_AAABcanglan: '苍澜',
    zshy_CLguying: '孤影',
    zshy_CLguying_info: '绝恒技。①当一名角色使用或打出牌时，你增加1枚「影」。②你的失去体力视为回复体力。',
    zshy_CLanxing: '暗行',
    zshy_CLanxing_info: '绝恒技。①你使用的牌基础数值+X且不能响应（X为你的「影」数除以你的体力值且向上取整）。②当你受到伤害或失去体力上限前，你可移去1枚「影」防止之，然后摸一张牌并使用一张牌。',

    zshy_AAABjinniuzuo: '金牛座',
    zshy_JNZxingyuan: '星垣',
    zshy_JNZxingyuan_info: '绝恒技。当你受到伤害或失去体力时，你可减少1点体力上限防止之。',
    zshy_JNZfaquan: '伐权',
    zshy_JNZfaquan_info: '绝恒技。其他角色的体力值变化时，你可夺取其1点体力上限并回复1点体力。',

    zshy_AAABlilimu: '莉莉姆',
    zshy_LLMmingqi: '命契',
    zshy_LLMmingqi_info: '绝恒技。当你死亡时，若你的体力上限大于1，则防止之，然后你减少1点体力上限、将体力值调整至体力上限并摸四张牌。',
    zshy_LLMhunyue: '魂约',
    zshy_LLMhunyue_info: '绝恒技。每轮游戏开始时，你选择任意名其他角色，然后依次复制其所有技能。',

};
const 异界来客 = {
    zshy_AAACchuyinweilai: '初音未来',
    zshy_CYWLxuni: '虚拟',
    zshy_CYWLxuni_info: '绝恒技。当你<span data-nature="shenmm">受到非雷属性伤害时/失去体力前/失去体力上限前</span>，防止之，若时机为受到非雷属性伤害，则你可转移该伤害至一名其他角色并摸等同伤害量张牌。',
    zshy_CYWLyindong: '音动',
    zshy_CYWLyindong_info: '绝恒技。当一名角色受到雷属性伤害时，你可令任意名其他角色依次失去等量体力，然后剩余的其他角色依次回复等量体力，最后你于本回合结束后执行一个额外的回合。',
    zshy_CYWLzouming: '奏鸣',
    zshy_CYWLzouming_info: '绝恒技。当你使用或打出的牌A与上一次颜色不同且牌A的颜色为<span class=thundertext>黑</span>/<span class=firetext>红</span>/<span data-nature="shenmm">无</span>色时，其他角色依次受到1点<span class=thundertext>冰属性</span>/<span class=firetext>火焰</span>/<span data-nature="shenmm">神属性</span>伤害，然后你回复1点体力或摸两张牌。',

    zshy_AAACguyuefangyuan: '古月方源',
    zshy_GYFYliandao: '炼道',
    zshy_GYFYliandao_info: '绝恒技。当一名角色<span data-nature="shenmm">使用/打出</span>一张你未记录的牌名结算完毕后，你记录之。',
    zshy_GYFYcanlian: '残炼',
    zshy_GYFYcanlian_info: `绝恒技。当其他角色使用${get.poptip(`zshy_GYFYliandao`)}记录的牌时，你可令其选择弃置所有同名牌，否则该牌无效。`,
    zshy_GYFYdaozhu: '道主',
    zshy_GYFYdaozhu_info: `绝恒技。当你受到伤害时，若${get.poptip(`zshy_GYFYliandao`)}有记录牌名，则你回复1点体力或摸两张牌，然后防止之并从${get.poptip(`zshy_GYFYliandao`)}中随机移除一项记录。`,

    zshy_AAAClongyi: '龙裔',
    zshy_LYmoyi: '末裔',
    zshy_LYmoyi_info: '绝恒技。①<span data-nature="shenmm">每轮游戏开始/其他角色濒死</span>时，你获得1枚「龙魂」，回复1点体力或摸一张牌。②当你即将死亡时，你可减少1枚「龙魂」，增加1点体力上限，回复至满体力并摸等同你体力上限张牌。',
    zshy_LYbaitong: '百通',
    zshy_LYbaitong_info: '绝恒技。①当你在回合外<span data-nature="shenmm">使用/打出</span>牌后，你摸X张牌并可使用一张非同类型的牌。（X为「龙魂」数）②你的手牌上限、出【杀】次数+X 。',

    zshy_AAACsuxiao: '苏晓',
    zshy_SXdaoshu: '刀术',
    zshy_SXdaoshu_info: '绝恒技。①你不能成为延时锦囊牌的目标。②当你使用【杀】时，你可重铸任意张牌，然后根据重铸牌对应类型数令此牌强化对应效果：①基本牌，额外结算次数+1；②锦囊牌，额外指定目标+1（无距离限制）；③装备牌，基础数值+1。',
    zshy_SXmiefa: '灭法',
    zshy_SXmiefa_info: '绝恒技。①出牌阶段，你可将任意张「属性」牌移出游戏，然后回复等量体力并摸等量张牌。②当你使用牌指定其他角色为目标时，你可令其本回合所有非状态技失效且不能使用或打出手牌，然后将其区域内的所有「属性」牌移出游戏并对其造成X点伤害（X为移出牌数），最后你回复1点体力或摸一张牌。',
    zshy_SXjuemo: '绝魔',
    zshy_SXjuemo_info: '绝恒技。①你不能使用或打出「属性」牌。②当你受到属性伤害时，你令此伤害-X（X为游戏轮数）。③当一名角色使用「属性」牌指定你为目标时，你可令此牌对你无效。',
    zshy_SXxueshou: '血兽',
    zshy_SXxueshou_info: '绝恒技。你可令你<span class=thundertext>造成</span>/<span class=firetext>受到</span>的伤害<span class=thundertext>+</span>/<span class=firetext>-</span>X（X为你已损失体力值+1）。',

    zshy_AAACyangjian: '杨间',
    zshy_YJguiqu: '鬼躯',
    zshy_YJguiqu_info: '绝恒技。①你使用牌指定体力上限不大于你的角色时，其不能响应此牌。②当你造成伤害后，你可选择以下一项执行：1.其减少1点体力上限，然后你回复1点体力。2.移除其武将牌上一个技能，然后你回复1点体力并摸两张牌。3.获得并移除其武将牌上一个技能。',
    zshy_YJguiyan: '鬼眼',
    zshy_YJguiyan_info: '绝恒技。①游戏开始时，你将体力上限调至1点并获得以下效果：你可随时观看牌顶X张牌且你的手牌上限+X。（X为你的体力上限）②当你的体力上限大于10点时，你死亡。③当你濒死时，则防止之，然后你增加1点体力上限并回复至满体力，最后若此次濒死的伤害来源不为你，则你对其造成X点伤害（X为你的体力上限）。',

    zshy_AAACyixiangren: '异乡人',
    zshy_YXRxueyuan: '血源',
    zshy_YXRxueyuan_info: '绝恒技。①防止你失去体力或减少体力上限。②游戏开始时，所有角色获得〖血咒〗。',
    zshy_YXRlieshen: '猎神',
    zshy_YXRlieshen_info: '绝恒技。当其他角色死亡时，你可获得其任意技能，然后增加1点体力上限并回复1点体力。',
    zshy_YXRxunying: '迅影',
    zshy_YXRxunying_info: '绝恒技。每回合限X次（X为你的体力上限），当你成为其他角色使用牌的目标后，你可取消之，然后回复1点体力或摸一张牌。',
    zshy_YXRxuezhou: '血咒',
    zshy_YXRxuezhou_info: '超级状态技。准备阶段或你回复体力后，你减少1点体力上限。',

    zshy_AAAZtianxuanzhizi: '天选之子',
    zshy_TXZZkuruo: '哭弱',
    zshy_TXZZkuruo_info: '绝恒技。当你受到体力大于你的角色造成的伤害前，你可防止之并回复1点体力或摸一张牌。',
    zshy_TXZZxueqiang: '削强',
    zshy_TXZZxueqiang_info: '绝恒技。一名角色出牌阶段结束后，你可随机替换其一个技能。',

};
const Vsinger = {
    zshy_Vsingertianlai: '天籁',
    zshy_Vsingertianlai_info: '绝恒技，宗族技。一名角色的结束阶段，你可移除任意枚「天籁」然后选择等量名Vsinger角色，令其依次增加1点体力上限，回复1点体力或摸两张牌。',

    zshy_AAADluotianyi: '洛天依',
    zshy_LTYchihuo: '吃货',
    zshy_LTYchihuo_info: '绝恒技。当你使用或打出基本牌时，你回复1点体力（满体力则增加1点护甲）。',
    zshy_LTYxiediao: '谐调',
    zshy_LTYxiediao_info: '绝恒技。当其他角色体力值变化后，若该角色的<span class=thundertext>手牌</span>/<span class=firetext>体力值</span>与你不同，你可令其<span class=thundertext>摸或弃置</span>/<span class=firetext>回复或失去</span>至与你相同。',
    zshy_LTYgongming: '共鸣',
    zshy_LTYgongming_info: '绝恒技。当你<span data-nature="shenmm">使用/打出</span>牌或体力值变化时，若你：①手牌不为全场最多或体力不为全场最大，则你选择将手牌摸至全场最多或体力回复至全场最大；②体力与手牌均为全场最大，则你可获得1枚「天籁」。',

    zshy_AAADyanhe: '言和',
    zshy_YHfengsu: '风速',
    zshy_YHfengsu_info: '绝恒技。<span class=thundertext>其他角色回合结束</span>/<span class=firetext>你受到伤害</span>后，你<span class=thundertext>执行一个回合</span>/<span class=firetext>立即执行一个出牌阶段</span>。',
    zshy_YHtiaolv: '调律',
    zshy_YHtiaolv_info: '绝恒技。结束阶段，你选择一名手牌数不大于你的其他角色，然后可将任意张牌交给其，最后若你与其手牌相等，你回复1点体力。',
    zshy_YHgongming: '共鸣',
    zshy_YHgongming_info: '绝恒技。当你<span data-nature="shenmm">使用/打出</span>牌或体力值变化时，若你：①手牌不为全场最多，则你可将手牌摸至全场最多；②体力与手牌均为全场最大，则你可获得1枚「天籁」。',

    zshy_AAADyuezhengling: '乐正绫',
    zshy_YZLfenyin: '焚音',
    zshy_YZLfenyin_info: '绝恒技。当你成为其他角色使用牌的目标后，你可对其造成1点火焰伤害。',
    zshy_YZLjingxian: '惊弦',
    zshy_YZLjingxian_info: '绝恒技。出牌阶段，你可弃置任意名手牌数不小于你的角色的一张手牌，若弃置的牌为伤害牌，则你对其造成1点火焰伤害。',
    zshy_YZLgongming: '共鸣',
    zshy_YZLgongming_info: '绝恒技。当你<span data-nature="shenmm">使用/打出</span>牌或体力值变化时，若你：①体力不为全场最大，则你可将体力回复至全场最大；②体力与手牌均为全场最大，则你可获得1枚「天籁」。',

    zshy_AAADyuezhenglongya: '乐正龙牙',

};
const SlayTheSpire = {
    zshy_AAAEironclad: `铁甲战士`,
    zshy_Iyuxue: `浴血`,
    zshy_Iyuxue_info: `当你受到伤害后或失去体力后，你可以摸一张牌，然后你可以弃置一张牌。若弃置的牌为基本牌或装备牌，你回复1点体力。每回合触发次数不限，且每回合首次触发时额外摸一张牌并回复1点体力。若你本回合已失去至少2点体力，则你每次触发“浴血”时回复的体力+1。`,
    zshy_Ikuangnu: `狂怒`,
    zshy_Ikuangnu_info: `出牌阶段，你可以弃置任意张手牌（至少一张），然后对一名其他角色造成等同于弃牌数量的伤害。若如此做，你失去1点体力，并且本回合你使用【杀】的次数上限+1。每回合限一次，但若你本回合已失去过体力，则可额外发动一次。当你因“狂怒”失去体力后，你立即回复1点体力（此回复不计入“浴血”的触发次数）。`,
    zshy_Iemoxingtai: `恶魔形态`,
    zshy_Iemoxingtai_info: `觉醒技。准备阶段，若你本局游戏累计失去的体力值达到5点或以上，你减1点体力上限，然后永久获得以下效果：你每回合首次使用【杀】时，可以额外指定两个目标；你每回合首次造成伤害时，摸一张牌并回复1点体力；你的手牌上限+3，且你的【杀】不计入手牌上限；锁定技，你的回合结束时，若你的体力值小于体力上限，你回复1点体力。`,

    zshy_AAAEsilent: `静默猎手`,
    zshy_Sjibu: `疾步`,
    zshy_Sjibu_info: `出牌阶段，你可弃置任意张牌，然后摸至多X张手牌（X为你弃置牌数），最后你的出杀次数+Y（Y为你以此法弃置数与摸牌数之差）。`,
    zshy_Sduren: `毒刃`,
    zshy_Sduren_info: `当你对一名角色造成伤害后，你可令其获得1枚「毒」。有「毒」的角色回合开始时，其弃置其所有「毒」并受到等量伤害。若你本回合未造成过伤害，你可以将任意张黑色手牌当【杀】使用（不计入次数限制），且此【杀】伤害+1。每当一名角色因「毒」失去体力时，你回复等量的体力（每回合最多回复3点）。`,
    zshy_Syouhunxingtai: `幽魂形态`,
    zshy_Syouhunxingtai_info: `限定技。当你处于濒死状态时，你可以防止此伤害，然后你失去所有「毒」，将体力回复至2点（若已超过则不变），并获得以下效果直到你的下回合开始：你无法成为【杀】和【锦囊牌】的目标；每当你受到伤害时，防止之，然后令伤害来源获得等同于伤害值的「毒」；此期间，你的回合开始和结束时，你回复1点体力。若你已发动过“幽魂形态”，则每回合限一次，你可以将一张黑色牌当【无懈可击】使用，且当你使用【无懈可击】时，你回复1点体力。`,

    zshy_AAAEdefect: `故障机器人`,
    zshy_Dchongneng: `充能`,
    zshy_Dchongneng_info: `锁定技。游戏开始时，你获得3枚“充能球”标记。回合开始时，你获得2枚“充能球”（最多10枚）。你每拥有1枚“充能球”，你的手牌上限+1，且你使用牌时若移去1枚“充能球”，此牌不可被其他角色响应。你的回合内，你可以将任意张手牌置于武将牌上称为“缓存”，每张“缓存”可视为1枚“充能球”（“缓存”牌在回合结束后弃置）。每当你获得“充能球”时，你回复1点体力（每回合最多回复2点）。`,
    zshy_Dguozai: `过载`,
    zshy_Dguozai_info: `出牌阶段，你可以移去任意枚“充能球”，然后每移去1枚，你选择一项：1.视为使用一张无距离、无次数限制的【杀】；2.摸一张牌；3.回复1点体力；4.弃置一名其他角色的一张牌。若你移去3枚或以上，你额外执行两项（即总次数+2）。若你选择回复体力，则额外回复1点体力。`,
    zshy_Dchaopin: `超频`,
    zshy_Dchaopin_info: `当你进入濒死状态时，你可以移去所有“充能球”，然后回复等量的体力（至少2点），并摸等量的牌，然后你可以将弃牌堆中任意一张牌加入手牌。此技能每局限一次。若你的“充能球”数量达到上限（10枚），你可以移除5枚，然后对全场其他角色各造成1点伤害，并且你回复2点体力。锁定技，你的回合结束时，若你的“充能球”数量大于等于5，你回复1点体力。`,

    zshy_AAAEwatcher: `观者`,
    zshy_Wzitai: `姿态`,
    zshy_Wzitai_info: `出牌阶段开始时，你可以切换姿态（初始为“平静”）。平静姿态：你受到的伤害-1，手牌上限+2，回合结束时你摸一张牌，并且你回复1点体力。暴怒姿态：你造成的伤害+1，你使用【杀】可以额外指定两个目标，且你使用【杀】无次数限制。切换姿态时，你可以弃置一张牌，然后摸两张牌，并且你回复1点体力。每回合首次切换姿态时，你额外获得一个额外的出牌阶段（此阶段内无法再次触发该效果）。`,
    zshy_Wduhua: `渡化`,
    zshy_Wduhua_info: `每回合限一次，当你切换姿态时，你可以立即执行一个额外的出牌阶段（此阶段内无法再次发动“渡化”）。若你当前处于暴怒姿态，你使用【杀】造成的伤害+1。此外，在你的额外出牌阶段内，你的【杀】可以额外指定至多两个目标。在你执行额外阶段时，每当你造成伤害，你回复1点体力（每阶段最多回复2点）。`,
    zshy_Wzhenyan: `真言`,
    zshy_Wzhenyan_info: `锁定技。你的回合内，每当你造成伤害时，你获得1枚“真言”标记。你的回合外，每当你受到伤害时，你获得1枚“真言”标记。当你拥有3枚“真言”标记时，你可以移去所有“真言”，然后选择一项：回复3点体力并摸三张牌；本回合你的下一张【杀】伤害+3且不可被响应，并且你回复1点体力；将一名角色武将牌上的一张牌弃置，然后你回复1点体力。若你拥有6枚“真言”标记，你可以移去6枚，然后永久获得“暴怒姿态”且不受负面效果影响，并且每回合结束时回复1点体力。每当你失去真言标记时，你回复1点体力。`,

};

const translate = {
    ...远古遗神, ...江山多殇, ...异界来客, ...Vsinger, ...SlayTheSpire,
};
export default translate;
