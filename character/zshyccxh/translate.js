import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
const 天极·皇室宗亲 = {
    zshy_AAZZbianfurenCCXH: `墟卞夫人`,
    zshy_fuwei: '扶危',
    zshy_fuwei_info: '当你的牌被其他角色弃置或获得后，你可从牌堆中获得一张与此牌名称相同的牌（若没有则改为摸一张牌），然后回复1点体力。',
    zshy_yuejianCCXH: '约俭',
    zshy_yuejianCCXH_info: '锁定技。当其他角色对你使用的牌结算结束后，你获得牌对应的所有实体牌，然后你回复1点体力。',

    zshy_AAZZcaoangJMGX: '墟曹昂',
    zshy_kangkai: '慷忾',
    zshy_kangkai_info: '一名角色成为伤害牌的目标后，你可回复1点体力或摸一张牌，然后与该牌使用者拼点（目标不合法则取消之），若你赢，则目标角色回复1点体力或摸一张牌，然后令此牌对其无效。',

    zshy_AAZZcaojinyuOL: `墟曹金玉`,
    zshy_chunhui: '春晖',
    zshy_chunhui_info: '一名角色的准备阶段或当你受到伤害后，令一名其他角色交给你一张牌。若此牌为黑色，本轮你与其下一次使用红色牌时，可为此牌增加或减少一个目标（至多减至1）。',
    zshy_xiasheng: '夏晟',
    zshy_xiasheng_info: '锁定技。①你使用黑色牌时回复1点体力或摸一张牌。②你使用红色牌时可多指定一个目标。',
    zshy_qiumu: '秋暮',
    zshy_qiumu_info: `锁定技。其他角色进入濒死状态时，你获得其所有黑色牌，并将${get.poptip('zshy_chunhui')}、${get.poptip('zshy_xiasheng')}或〖秋暮〗描述中的颜色限制去除。`,

    zshy_AAZZcaoxiancaohuaJMGX: `墟曹宪曹华`,
    zshy_huamu: `化木`,
    zshy_huamu_info: `当你使用或打出手牌结算后，你可将此牌对应的所有{位于处理区或装备区}的实体牌置于你的武将牌上。这些牌中的黑色牌称为「灵杉」，红色牌称为「玉树」。`,
    zshy_qianmeng: `前盟`,
    zshy_qianmeng_info: `锁定技。当有牌移动事件结算结束后，若有角色的「灵杉」和「玉树」数量发生了变化，则你回复1点体力或摸一张牌。`,
    zshy_liangyuan: `良缘`,
    zshy_liangyuan_info: `你可以将场上所有的「灵杉」/「玉树」置于处理区，然后将这些牌当做【酒】/【桃】使用。`,
    zshy_jisi: `羁肆`,
    zshy_jisi_info: `其他角色的准备阶段，你可令其获得你武将牌上的一个其他技能，否则其失去1点体力上限。`,

    zshy_AAZZcaoyu: `墟曹宇`,
    zshy_gongjie: '恭节',
    zshy_gongjie_info: '一名角色的回合开始时，你可以令任意名角色获得你的一张牌，然后你回复等量体力并摸等量张牌。',
    zshy_xiangxv: '相胥',
    zshy_xiangxv_info: '当你受到伤害后或一名角色的回合结束时，你可将手牌数调整至与当前回合角色手牌数相同，然后你回复调整量点体力。',
    zshy_xiangzuo: '襄胙',
    zshy_xiangzuo_info: '当你进入濒死状态时，你可以交给一名其他角色任意张牌，然后回复等量体力。若你已对其发动过〖恭节〗和〖相胥〗，你摸等量牌。',

    zshy_AAZZhuanshujun: `墟环淑君`,
    zshy_huanpei: '环佩',
    zshy_huanpei_info: '你需要使用或打出基本牌时，若手牌数不与体力上限相同，则你可以调整手牌数至与体力上限相同，视为使用之。',
    zshy_wenyi: '温宜',
    zshy_wenyi_info: '一名角色体力值变为1后，你可视为对其使用一张【桃】，然后其使用一张牌堆或弃牌堆的随机装备牌，最后其复原武将牌。',
    zshy_miaoxin: '妙心',
    zshy_miaoxin_info: `锁定技。当一名角色受到1点伤害后，若该角色为你，则你摸两张牌，否则你选择一名体力值为2的角色，令其增加1点体力上限。`,

    zshy_AAZZliuxieJMGX: '墟刘协',
    zshy_tianming: '天命',
    zshy_tianming_info: '当你成为牌的目标后，你可弃置一张牌（无牌则不弃），然后回复1点体力或摸两张牌；若此时全场体力值最多的角色仅有一名且不是你，该角色摸两张牌然后弃置两张牌。',
    zshy_mizhao: '密诏',
    zshy_mizhao_info: '出牌阶段，你可将所有手牌交给一名其他角色。若如此做，你令该角色与你指定的另一名有手牌的角色拼点，拼点赢的角色视为对没赢的角色使用一张【杀】。',

    zshy_AAZZliuyanJMGX: '墟刘焉',
    zshy_tushe: '图射',
    zshy_tushe_info: '当你使用牌指定目标后，你可重铸所有基本牌并摸X张牌。（X为此牌指定的目标数）',
    zshy_limu: '立牧',
    zshy_limu_info: '①出牌阶段，你可将一张<span data-nature="shenmm">方块/梅花/黑桃</span>牌当做<span data-nature="shenmm">【乐不思蜀】/【兵粮寸断】/【闪电】</span>对自己使用，然后你回复1点体力或摸一张牌。②当你的判定区内的牌数：≥1，你对攻击范围内的其他角色使用牌无距离与次数限制；≥2当其他角色使用牌指定你为目标时，你回复1点体力或摸一张牌；≥3，你使用的牌不能响应。',

    zshy_AAZZqinghegongzhuJMGX: '墟清河公主',
    zshy_zengou: '谮构',
    zshy_zengou_info: '当有角色使用【闪】时，你可以取消此【闪】的目标并获得其对应的实体牌，然后重铸任意张牌并回复等量体力。',
    zshy_zhangji: '长姬',
    zshy_zhangji_info: '当你<span class=thundertext>造成</span>/<span class=firetext>受到</span>1点伤害时，你可以令一名角色<span class=thundertext>回复1点体力或摸</span>/<span class=firetext>失去1点体力并弃</span>两张牌。',

    zshy_AAZZqinlangOL: `墟秦朗`,
    zshy_xianying: '贤膺',
    zshy_xianying_info: '一名角色的准备阶段或当你受到伤害后，你可摸两张牌并弃置任意张牌。然后你依次使用弃置牌，最后你回复使用牌数点体力。',

    zshy_AAZZruiji: `墟芮姬`,
    zshy_qiaoli: '巧力', zshy_qiaoli_given: '已分配',
    zshy_qiaoli_info: '出牌阶段，你可以将一张武器牌/非武器装备牌当作【决斗】使用。若此【决斗】对应的实体牌为武器牌，当你以此【决斗】对目标角色造成伤害后，你摸X张牌（X为此牌的攻击范围），且可以将其中任意张牌分配给其他角色；若此【决斗】对应的实体牌不为武器牌，此牌不可被响应，然后你随机获得一张装备牌。',
    zshy_qingliang: '清靓',
    zshy_qingliang_info: '当你成为其他角色使用【杀】或锦囊牌的目标时，你可展示所有手牌，然后选择一项：1.你与其各摸一张牌，2.取消此目标，然后你弃置一张牌。',

    zshy_AAZZsunhaoJMGX: '墟孙皓',
    zshy_canshi: '残蚀',
    zshy_canshi_info: '锁定技。①你的摸牌阶段开始时，你可多摸X张牌（X为已受伤或体力值不大于你的角色数）。②当其他角色使用或打出牌时，若其：1.体力大于你或已受伤，则其交给你一张牌；2.体力小于你或已受伤，则你回复1点体力。',
    zshy_chouhai: '仇海',
    zshy_chouhai_info: '锁定技。①当你对一名其他角色造成伤害后，你记录之。②你对〖仇海〗记录的角色造成的伤害+1。③〖仇海〗记录的角色使用【杀】对你造成伤害时，若你没有手牌，则伤害+1。',
    zshy_guiming: '归命',
    zshy_guiming_info: '主公技，锁定技。①结算〖残蚀〗时，其他吴势力角色视为已受伤。②其他吴势力角色受到伤害时，你回复1点体力或摸一张牌。',

};
const 四弼·辅国文曲 = {
    zshy_AAZZcaoxi: `墟曹羲`,
    zshy_gangshu: '刚述',
    zshy_gangshu_info: '①当一名角色使用非基本牌结算结束后，你可以令以下一项数值+1：1.攻击范围；2.摸牌阶段摸牌数；3.使用【杀】的次数上限。②当〖刚述①〗增加数值不小于你的体力上限后，重置你〖刚述①〗增加的所有数值，然后你增加1点体力上限并回复至满体力，并立即执行一个出牌阶段。',
    zshy_jianxuan: '谏旋',
    zshy_jianxuan_info: '当一名角色受到伤害后，你可以令一名角色摸一张牌，然后若其手牌数不大于你〖刚述①〗中的任意一项对应的数值，其重复此流程（数值为无限则改为你的体力上限）。',

    zshy_AAZZmaliangJMGX: '墟马良',
    zshy_zishu: '自书',
    zshy_zishu_info: '锁定技。①其他角色的回合结束时，你将手牌区里所有你于此回合得到过的牌交给一名其他角色或置入弃牌堆，然后回复等量体力。②当你不因〖自书〗而得到牌后，你摸等量张牌。',
    zshy_yingyuan: '应援',
    zshy_yingyuan_info: '锁定技。当你使用或打出的牌结算完成进入弃牌堆时，你可将其交给一名其他角色，或你回复1点体力或摸一张牌。',

    zshy_AAZZxizhicaiJMGX: '墟戏志才',
    zshy_xianfu: '先辅',
    zshy_xianfu_info: '锁定技。每轮游戏开始时/〖先辅〗角色死亡后，你选择一名其他角色，当其受到伤害/失去体力上限后，你受到等量的伤害/失去等量体力上限，当其回复体力/增加体力上限后，你回复等量的体力/增加等量体力上限。',
    zshy_chouce: '筹策',
    zshy_chouce_info: '当你受到1点伤害后，你可判定，若结果为：黑色，你摸一张牌，然后弃置一名角色区域里的一张牌；红色，你回复1点体力，然后选择一名角色，其摸一张牌，若其是〖先辅〗选择的角色，改为其摸两张牌。',

    zshy_AAZZyanghuJIN: `墟羊祜`,
    zshy_huaiyuan: '怀远', zshy_huaiyuanx: '绥',
    zshy_huaiyuan_info: '①游戏开始时，你将你的手牌标记为「绥」。②当你失去一张「绥」后，你令一名角色执行一项：1.其的体力上限与手牌上限+1。2.其的出杀次数与攻击范围+1。3.其回复1点体力并摸一张牌。③当你死亡时，你可令一名其他角色的手牌上限+X，且攻击范围+Y（X和Y为你自己被执行过〖怀远②〗的选项一和选项二的次数）。',
    zshy_chongxin: '崇信',
    zshy_chongxin_info: '出牌阶段限一次，你可重铸至多两张牌，且令一名有牌的其他角色也重铸至多两张牌。',
    zshy_dezhang: '德彰',
    zshy_dezhang_info: `觉醒技。当你使用或打出手牌时，若你没有「绥」，则你失去1点体力上限，然后获得${get.poptip('zshy_weishu')}，并将${get.poptip('zshy_huaiyuan')}描述中的“「绥」”改为“牌”。`,
    zshy_weishu: '卫戍',
    zshy_weishu_info: '锁定技。①当你不因〖卫戍①〗而摸牌后，你令一名角色摸一张牌。②当你不因〖卫戍②〗而弃置牌后，你弃置一名其他角色的一张牌。',

    zshy_AAZZyangyiJMGX: '墟杨仪',
    zshy_juanxia: '狷狭',
    zshy_juanxia_info: '其他角色的准备阶段，你可依次视为对其使用任意种单目标普通锦囊牌，然后其回合结束时，可视为对你使用等量的【杀】。',
    zshy_dingcuo: '定措',
    zshy_dingcuo_info: '当你受到或造成伤害后，你可摸两张牌。若这两张牌颜色不同，则你弃置一张手牌并对一名其他角色造成1点伤害，否则你回复1点体力。',

    zshy_AAZZzhanghuaJMGX: '墟张华',
    zshy_bihun: '弼昏',
    zshy_bihun_info: '当你使用牌指定其他角色为唯一目标时，则你可取消之并令其获得此牌。',
    zshy_jianhe: '剑合',
    zshy_jianhe_info: '出牌阶段，你可重铸至少两张同类型牌，然后令一名角色选择一项：1.重铸等量张与你以此法重铸的牌类型相同的牌；2.受到你造成的X点的雷电伤害（X为你以此法重铸的牌数）。',
    zshy_chuanwu: '穿屋',
    zshy_chuanwu_info: '锁定技。当你<span class=thundertext>造成</span>/<span class=firetext>受到</span>伤害后，你令<span class=thundertext>自己</span>/<span class=firetext>伤害来源</span>武将牌上的前X个未失效的技能失效直到回合结束。然后你选择回复X点体力或摸X张牌（X为你的攻击范围）。',

    zshy_AAZZzhugejinJMGX: '墟诸葛瑾',
    zshy_mingzhe: '明哲',
    zshy_mingzhe_info: '锁定技。当你于出牌阶段外失去牌后，你展示这些牌中所有背面朝上移动的牌（没有则不展示），然后摸X张牌（X为失去牌数）。',
    zshy_hongyuan: '弘援',
    zshy_hongyuan_info: '当你一次性获得至少两张牌以后，你可将至多两张牌交给等量名角色，若给出的牌为红色，则你回复1点体力。',
    zshy_huanshi: '缓释',
    zshy_huanshi_info: '一名角色的判定牌生效前，你可令其观看你的手牌并选择你的一张牌，你打出此牌代替判定牌。然后你可重铸任意张牌。',

};
const 天柱·势冠一方 = {
    zshy_AAZZhuangzuJMGX: '墟黄祖',
    zshy_wangong: '挽弓',
    zshy_wangong_info: '①你使用的【杀】无距离与次数限制。②当你使用基本牌时，你回复1点体力或摸一张牌，并令你使用【杀】造成的伤害+1直到你用【杀】造成伤害。',

    zshy_AAZZshamokeJMGX: '墟沙摩柯',
    zshy_jili: '蒺藜',
    zshy_jili_info: '当你于一回合内使用或打出第X张牌时，你可回复1点体力或摸X张牌（X为你一回合内使用或打出牌的次数，若X大于你的体力上限，则X改为1）。',

    zshy_AAZZzhugedanJMGX: '墟诸葛诞',
    zshy_gongao: '功獒',
    zshy_gongao_info: '锁定技。当一名角色进入濒死时，你增加1点体力上限，然后回复1点体力或摸两张牌。',
    zshy_juyi: '举义',
    zshy_juyi_info: '觉醒技。准备阶段或当你受到伤害后，若你的体力上限大于存活角色数，则你可摸等同体力上限数张牌，然后获得〖威重〗、〖崩坏〗。',
    zshy_weizhong: '威重',
    zshy_weizhong_info: '锁定技。一名角色的体力上限变化后，你摸两张牌并立即执行一个出牌阶段。',

};
const 女史·留史巾帼 = {
    zshy_AAZZguanyinpingJMGX: `墟关银屏`,
    zshy_xuehen: `雪恨`,
    zshy_xuehen_info: `出牌阶段限一次，你可选择任意名角色横置，然后对选择的第一名角色造成1点火焰伤害。`,
    zshy_huxiao: `虎啸`,
    zshy_huxiao_info: `锁定技。当你造成或受到伤害后，你回复1点体力或摸一张牌，然后于此回合内对受伤角色使用牌没有次数限制。`,
    zshy_wuji: `武继`,
    zshy_wuji_info: `每回合限一次。当你造成伤害时，若你于此回合内造成过3点或更多伤害，你增加1点体力上限并回复1点体力，然后从场上、牌堆或弃牌堆中获得【青龙偃月刀】。`,

    zshy_AAZZguohuaiJIN: '墟郭槐',
    zshy_zhefu: '哲妇',
    zshy_zhefu_info: '当你使用或打出牌后，你可令一名其他角色弃置所有同名牌，若其未弃置牌，则受到你造成的1点伤害并令你回复1点体力或摸一张牌。',
    zshy_yidu: '遗毒',
    zshy_yidu_info: '当你使用伤害牌结算结束后，你可弃置一名其他角色的至多两张手牌。然后你回复1点体力或摸一张牌。',

    zshy_AAZZzhangxingcaiJMGX: '墟张星彩',
    zshy_shenxian: '甚贤',
    zshy_shenxian_info: '当有其他角色因弃置而失去牌时，你可回复1点体力或摸一张牌。',
    zshy_qiangwu: '枪舞',
    zshy_qiangwu_info: '①你使用的【杀】无距离与次数限制。②出牌阶段限一次，你可进行判定并摸判定点数张牌。若如此做，直到回合结束，你使用点数不大于判定结果的【杀】基础数值+1，使用点数不小于判定结果的【杀】无法响应。',

    zshy_AAZZzhaoxiangJMGX: '墟赵襄',
    zshy_ZXfanghun: '芳魂',
    zshy_ZXfanghun_info: '①你可将一张基本牌当作任意基本牌使用或打出。②当你使用或打出基本牌后，你摸一张牌并增加1枚「梅影」。',
    zshy_ZXfuhan: '扶汉',
    zshy_ZXfuhan_info: '①你的回合开始或结束时，若你的「梅影」数大于0，则你可从X名蜀势力武将牌中选择至多Y名（X为「梅影」数且至多为你体力上限的2倍，Y为你的体力上限），然后获得这些武将的所有技能直到被替换。②当你的「梅影」数不小于<span data-nature="shenmm">X/2X/3X/4X</span>（X为你的体力上限），则〖扶汉〗选择的武将品质不低于<span data-nature="shenmm">A/S/SS/SSS</span>。',

};
const 少微·能人异士 = {
    zshy_AAZZpengyangOL: `墟彭羕`,

    zshy_AAZZsimahuiJMGX: `墟司马徽`,
    zshy_jianjie: `荐杰`,
    zshy_jianjie_info: `①游戏开始时，你令一名角色获得“龙印”，然后令一名角色获得“凤印”。②出牌阶段限一次。你可移动场上的“龙印”或“凤印”。③拥有“龙印”或“凤印”的其他角色死亡时，你转移该角色的“龙印”和“凤印”。④拥有“龙印”/“凤印”的角色视为拥有${get.poptip('zshy_huoji')}/${get.poptip('zshy_lianhuan')}，且同时拥有这两种标记的角色视为拥有${get.poptip('zshy_yeyan')}。`,
    zshy_jianjie_huoji: `火计`,
    zshy_jianjie_huoji_info: `出牌阶段，你可弃置所有红色手牌，视为对任意名其他角色造成等量点火焰伤害。`,
    zshy_jianjie_lianhuan: `连环`,
    zshy_jianjie_lianhuan_info: `①出牌阶段，你可重铸任意张牌，然后横置任意名角色。②横置角色使用或打出牌时，你可令其随机弃置一张牌。`,
    zshy_jianjie_yeyan: `业炎`,
    zshy_jianjie_yeyan_info: `状态技。①出牌阶段限一次，你可弃置任意张牌并摸等量张牌，然后对至多三名其他角色各造成X点火焰伤害（X为4-选择角色数）。②一名角色结束阶段，若其本回合使用过至少4种花色和3种类别的牌，则你可对至多三名其他角色各造成X点火焰伤害（X为4-选择角色数）。`,
    zshy_chenghao: `称好`,
    zshy_chenghao_info: `当一名角色受到属性伤害后，若其存活且其武将牌横置且是伤害传导的起点，则你可以观看牌堆顶的X张牌并分配给任意角色。（X为横置的角色数量且包含该角色）`,
    zshy_yinshi: `隐士`,
    zshy_yinshi_info: `锁定技。当你受到属性伤害或锦囊牌造成的伤害时，防止此伤害。`,

    zshy_AAZZzhanglingJMGX: '墟张陵',
    zshy_huji: `虎骑`,
    zshy_huji_info: `锁定技。①你与其他角色的距离-1。②当你受到其他角色造成的伤害后，你进行判定，若结果为：①红色，视为你对伤害来源造成等量伤害；②黑色，你回复等量体力值。`,
    zshy_shoufu: `授符`, zshy_shoufu2: `授符`,
    zshy_shoufu_info: `①出牌阶段，你可选择任意名没有「箓」的角色，然后依次为其从基础、锦囊或装备类别中选择一项，最后你从牌堆或弃牌堆中获得一张同类别的牌，复制之并将原牌置于其武将牌上，称为「箓」；其不能使用和打出与「箓」同类型的牌直到有${get.poptip(`zshy_shoufu`)}的角色出牌阶段开始。②你对有「箓」的角色使用牌无距离与次数限制，你此法获得的牌不计入手牌上限。`,

    zshy_AAZZzhugeguoJMGX: `墟诸葛果`,
    zshy_qirang: `祈禳`,
    zshy_qirang_info: `一名角色的结束阶段或当有装备牌进入装备区时，你可回复1点体力并获得牌堆或弃牌堆中的一张锦囊牌。若此牌为：①普通锦囊牌，则当你使用此“祈禳”牌选择唯一目标后，可为此牌增加一个目标；②延时锦囊牌，则你发动${get.poptip("zshy_yuhua")}时的卜算量+1（卜算量最多+5）。`,
    zshy_yuhua: `羽化`,
    zshy_yuhua_info: `锁定技。①你的非基本牌不计入手牌上限。②一名角色的准备阶段，你卜算1。`,

};
const 虎贲·勇冠三军 = {
    zshy_AAZZluzhiJMGX: `墟鲁芝`,
    zshy_qingzhong: `清忠`,
    zshy_qingzhong_info: `一名角色的出牌阶段开始时，你可回复1点体力或摸两张牌，若如此做，此阶段结束时，若你的手牌不为全场最少，则你与一名其他角色交换手牌。`,
    zshy_weijing: `卫境`,
    zshy_weijing_info: `当你需要使用或打出【杀】或【闪】时，你可以视为使用或打出一张【杀】或【闪】。`,

    zshy_AAZZquyiJMGX: '墟麴义',
    zshy_fuji: '伏骑',
    zshy_fuji_info: '锁定技。①当你使用牌时，你令其他角色不能响应此牌。②当你使用或打出牌时，其他角色于此回合内不能使用或打出同花色的牌。',
    zshy_jiaozi: '骄姿',
    zshy_jiaozi_info: '锁定技。当你<span class=thundertext>造成</span>/<span class=firetext>受到</span>伤害时，此伤害<span class=thundertext>+</span>/<span class=firetext>-</span>X（X为你与<span class=thundertext>受伤角色</span>/<span class=firetext>伤害来源</span>的手牌数之差）。',

    zshy_AAZZxiahoubaJMGX: '墟夏侯霸',
    zshy_baobian: '豹变',
    zshy_baobian_info: `状态技。回合开始或当你受到伤害后，你从${get.poptip('zshy_tiaoxin')}${get.poptip('zshy_paoxiao')}${get.poptip('zshy_shensu')}中选择一个获得，若都获得，则你回复1点体力或摸一张牌。`,

};
const 灯愿·祈福武将 = {
    zshy_AAZZbaosanniangJMGX: `墟鲍三娘`,
    zshy_wuniang: `武娘`,
    zshy_wuniang_info: `当你使用或打出基本牌时，你可获得一名其他角色的一张牌。若如此做，其摸一张牌，然后你回复1点体力。（若你已发动${get.poptip('zshy_xushen')}，则${get.poptip('zshy_AAZZguansuoJMGX')}也摸一张牌）`,
    zshy_xushen: `许身`,
    zshy_xushen_info: `限定技。当你进入濒死状态后，你可回复至满体力并获得技能${get.poptip('zshy_zhennan')}，然后若你脱离濒死状态且${get.poptip({
        id: 'zshy_AAZZguansuoJMGX',
        type: 'character',
        dialog: 'characterDialog',
    })}不在场，你可令一名其他角色选择是否用${get.poptip('zshy_AAZZguansuoJMGX')}代替其武将并令其摸三张牌。`,
    zshy_zhennan: `镇南`,
    zshy_zhennan_info: `当有角色使用锦囊牌指定目标后，你可以对至多X名其他角色造成1点伤害（X为此牌指定目标数）。`,
    zshy_AAZZbaosanniangJMGXchangeSkin: `变身`,
    zshy_AAZZbaosanniangJMGXchangeSkin_info: `【绝恒技】当你的体力变化后，若你的体力低于2，切换武将皮肤。`,

    zshy_AAZZcaochunJMGX: '墟曹纯',
    zshy_shanjia: '缮甲',
    zshy_shanjia_info: '锁定技。一名角色的准备阶段或当你受到伤害后，你从牌堆或弃牌堆中随机使用一张装备牌并增加1点护甲，然后可使用一张无视距离且不限次数的【杀】。',

    zshy_AAZZcaoshuangJMGX: '墟曹爽',
    zshy_tuogu: '托孤',
    zshy_tuogu_info: '锁定技。<span class=thundertext>每轮游戏开始时</span>/<span class=firetext>其他角色死亡后</span>，你回复1点体力或摸一张牌，然后可选择获得<span class=thundertext>四个随机技能中的一个直到被替换</span>/<span class=firetext>其武将牌上的一个技能</span>。',
    zshy_shanzhuan: '擅专',
    zshy_shanzhuan_info: '当其他角色受到伤害后，你可将其一张牌置入其判定区，并根据颜色规定牌名：1.红色牌，【乐不思蜀】；2.黑色牌：【兵粮寸断】；3.无色牌，【闪电】。最后你回复1点体力或摸一张牌。',

    zshy_AAZZcaoyingJMGX: '墟曹婴',
    zshy_lingren: '凌人',
    zshy_lingren_info: `①游戏开始时，你获得〖奸雄〗和〖行殇〗直到你的出牌阶段开始。②当你使用实体伤害牌指定目标后，你可猜测其中的一个目标的手牌中是否有基本牌，锦囊牌或装备牌。若你猜中的项目数：≥1，此牌对该角色的伤害+1；≥2，你回复1点体力或摸两张牌；≥3，你获得技能${get.poptip('zshy_jianxiong')}和${get.poptip('zshy_xingshang')}直到你的出牌阶段开始。`,
    zshy_fujian: '伏间',
    zshy_fujian_info: '锁定技。准备阶段和结束阶段，你观看一名其他角色的手牌，然后回复1点体力或摸一张牌。',
    zshy_AAZZcaoyingJMGXchangeSkin: `变身`,
    zshy_AAZZcaoyingJMGXchangeSkin_info: `绝恒技。当你的体力变化后，若你的体力低于2，切换武将皮肤。`,

    zshy_AAZZguansuoJMGX: '墟关索',
    zshy_zhengnan: '征南',
    zshy_zhengnan_info: `锁定技。准备阶段或当一名角色进入濒死状态时，你回复1点体力或摸三张牌，然后选择获得下列技能的任意一个：${get.poptip('zshy_wusheng')}${get.poptip('zshy_dangxian')}${get.poptip('zshy_zhiman')}。`,
    zshy_xiefang: '撷芳',
    zshy_xiefang_info: '锁定技。你的进攻距离与手牌上限+X（X为场上女性角色数+1）。',

    zshy_AAZZpanshu: `墟潘淑`,
    zshy_weiyi: '威仪',
    zshy_weiyi_info: '当有角色受到伤害后，你可选择：1.若其体力值不小于你，则其失去1点体力。2.若其体力值不大于你且其已受伤，则其回复1点体力。',
    zshy_jinzhi: '锦织',
    zshy_jinzhi_info: '当你需要使用或打出一张基本牌时，你可弃置X+1张颜色相同的牌并摸等量张牌，然后视为你使用或打出了此牌。（X为你于本回合内发动此技能的次数）',

    zshy_AAZZwolongfengchuJMGX: '墟卧龙凤雏',
    zshy_youlong: '游龙',
    zshy_youlong_info: '状态技。①每回合限两次，当你需要<span data-nature="shenmm">使用/打出</span>一张基本牌或锦囊牌时，你可发动〖游龙〗，视为<span data-nature="shenmm">使用/打出</span>之。②你使用的<span data-nature="shenmm">黑/无</span>色锦囊牌<span data-nature="shenmm">无法响应/基础数值+1</span>；你使用的红色锦囊牌指定目标后，可对其造成1点火焰伤害。',
    zshy_luanfeng: '鸾凤',
    zshy_luanfeng_info: '状态技。①当你使用牌指定其他角色为目标时，该角色横置武将牌。②每局每名角色限一次，当一名角色进入濒死状态时，你可令其增加1点体力上限并回复至满体力，然后恢复其被废除的装备栏并令其摸四张牌。若该角色为你，则〖游龙〗每回合限制次数调整为你的体力上限且你受到的火焰伤害改为回复效果。',

    zshy_AAZZzhouchuJMGX: '墟周处',
    zshy_shanduan: '善断',
    zshy_shanduan_info: '锁定技。①摸牌/出牌/弃牌阶段开始时，你为本回合摸牌阶段摸牌数/攻击范围和使用【杀】的限制次数/手牌上限的默认值从数组R=[4，4，4，4]中分配数值。②当一名角色受到1点伤害后，你令下回合〖善断〗以此法分配的数值集合R中的最小值+1，然后你摸一张牌。',
    zshy_yilie: '义烈',
    zshy_yilie_info: '你可将两张牌当作任意基本牌或伤害类锦囊牌使用或打出。',

};

const translate = {
    ...天极·皇室宗亲, ...四弼·辅国文曲, ...天柱·势冠一方,
    ...女史·留史巾帼, ...少微·能人异士, ...虎贲·勇冠三军,
    ...灯愿·祈福武将,
};
export default translate;
