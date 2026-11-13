import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
const 文德武备理 = {
    zshy_AAZZsimayiWDWB: '墟司马懿',
    zshy_buchen: '不臣',
    zshy_buchen_info:  '隐匿技。当你明置此武将牌后，你可选择任意名角色获得其区域内的一张牌。',
    zshy_yingshi: '鹰视',
    zshy_yingshi_info:  '锁定技。牌堆顶的四张牌始终对你可见。',
    zshy_xiongzhi: '雄志',
    zshy_xiongzhi_info:  '出牌阶段限一次，你可亮出牌堆顶的一张牌，若有可成为目标的角色则视为使用之（你以此法使用的牌不计次限），否则你获得展示牌。若如此做，你重复此流程直到无展示牌使用的目标。',
    zshy_quanbian: '权变',
    zshy_quanbian_info:  '当你使用或打出牌时，你可排列牌堆顶的四张牌并获得一张牌，若获得牌，则你回复1点体力。',

    zshy_AAZZzhangchunhuaWDWB: '墟张春华',
    zshy_ZCHhuishi: '慧识',
    zshy_ZCHhuishi_info:  '一名角色的摸牌阶段摸牌时，你可观看牌堆顶的X张牌，获得其中的一半（向上取整），然后将其余牌置入牌堆底（X为牌堆数量的个位数）。',
    zshy_qingleng: '清冷',
    zshy_qingleng_info:  '其他角色的结束阶段或受到伤害后，你可将一张牌当作无距离限制的冰【杀】对其使用，然后你回复1点体力。',
    zshy_xuanmu: '宣穆',
    zshy_xuanmu_info:  '隐匿技。当你明置此武将牌后，你防止所有伤害直到本轮结束。',

    zshy_AAZZlisuWDWB: '墟李肃',
    zshy_qiaoyan: '巧言',
    zshy_qiaoyan_info:  '锁定技。当你受到其他角色造成的伤害时，若你：有「珠」，则你令伤害来源获得「珠」；没有「珠」，则你防止此伤害并摸一张牌，最后将一张牌正面朝上置于武将牌上，称为「珠」。',
    zshy_xianzhu: '献珠',
    zshy_xianzhu_info:  '锁定技。①你的回合开始时，你摸一张牌并回复1点体力，若你没有「珠」，则你将一张牌正面朝上置于武将牌上，称为「珠」。②一名角色出牌阶段开始时，若你有「珠」你令一名角色A获得「珠」。若A不为自己，则你选择一名除A外的其他角色B，视为A对B造成了1点伤害，然后你摸一张牌。',

    zshy_AAZZsimazhouWDWB: '墟司马伷',
    zshy_caiwang: '才望',
    zshy_caiwang_info: '①当你使用或打出牌响应其他角色使用的牌，或其他角色使用或打出牌响应你使用的牌后，若这两张牌颜色相同，你可以弃置对方的一张手牌或装备牌；若颜色不同，你回复1点体力或摸一张牌。②当你的手牌区、装备区或判定区有牌时，你可以将该区域的所有牌分别当作【闪】、【无懈可击】或【杀】使用或打出。',
    zshy_naxiang: '纳降',
    zshy_naxiang_info:  `锁定技。当你受到其他角色造成的伤害后，或你对其他角色造成伤害后，你对其发动${get.poptip('zshy_caiwang')}时的“弃置”改为“获得”，然后摸一张牌。`,

    zshy_AAZZchelijiWDWB: '墟彻里吉',
    zshy_chexuan: '车悬',
    zshy_chexuan_info: '①每轮游戏开始时，若你的装备区没有宝物，则你选择一张【舆】置入你的装备区。②当你失去装备区的宝物牌后，你将一张随机的【舆】置入你的装备区。',
    zshy_qiangshou: '羌首',
    zshy_qiangshou_info: '锁定技。你的进攻距离+X（X为你的装备区数）。',
    zshy_AAZZchelijiWDWB_sichengliangyu: '四乘粮舆',
    zshy_AAZZchelijiWDWB_sichengliangyu_info:  '一名角色回合结束时，你可令其摸两张牌并回复1点体力，然后弃置此牌。',
    zshy_AAZZchelijiWDWB_tiejixuanyu: '铁蒺玄舆',
    zshy_AAZZchelijiWDWB_tiejixuanyu_info:  '其他角色回合结束时，你可令其弃置两张牌并对其造成1点伤害，然后弃置此牌。',
    zshy_AAZZchelijiWDWB_feilunzhanyu: '飞轮战舆',
    zshy_AAZZchelijiWDWB_feilunzhanyu_info:  '其他角色回合结束时，你可令其交给你一张牌并对其造成1点伤害，然后弃置此牌。',

    zshy_AAZZhuaxinWDWB: '墟华歆',
    zshy_caozhao: '草诏',
    zshy_caozhao_backup: '草诏',
    zshy_caozhao_info:  '每回合每种牌名限一次，你可展示一张手牌并声明一种基本牌或普通锦囊牌，令一名其他角色选择一项：令此牌视为你声明的牌直到本回合结束，或其失去1点体力。若此牌声明成功，则你可将其交给一名其他角色。',
    zshy_xibing: '息兵',
    zshy_xibing_info:  '当你受到其他角色造成的伤害后，你可摸两张牌或弃置该角色两张牌，然后你摸一张牌，其不能使用牌指定你为目标直到回合结束。',

};
const 文德武备备 = {
    zshy_AAZZchengjichengcuiWDWB: '墟成济成倅',
    zshy_tousui: '透髓',
    zshy_tousui_info:  '①你可将任意张牌置于牌堆底，视为使用一张需使用等量张【闪】抵消的【杀】。②你使用的无花色牌无次数限制。',
    zshy_chuming: '畜鸣',
    zshy_chuming_info:  '锁定技。当你对其他角色造成伤害时，或当你受到其他角色造成的伤害时，若此伤害的渠道不为牌或没有对应的实体牌，此伤害+X（X为伤害来源的体力值），否则其于本回合结束时将所有以此法造成伤害的牌当【借刀杀人】或【过河拆桥】对你使用。',

    zshy_AAZZzhanghuyuechenWDWB: '墟张虎乐綝',
    zshy_xijue: '袭爵',
    zshy_xijue_info:  '①游戏开始时，你获得4枚「爵」。②当你造成伤害后，你获得等量枚「爵」。③你可弃置1枚「爵」并在合适的时机发动〖突袭〗和〖骁果〗。',
    zshy_xijue_tuxi: '突袭',
    zshy_xijue_tuxi_info:  '一名角色的摸牌阶段摸牌时，你可令其少摸任意张牌，然后你获得等量角色的各一张手牌。',
    zshy_xijue_xiaoguo: '骁果',
    zshy_xijue_xiaoguo_info:  '其他角色的结束阶段开始时，你可弃置一张牌并令该角色选择一项：1.弃置一张装备牌并令你回复1点体力或摸一张牌，然后你摸一张牌；2.受到你对其造成的1点伤害，然后你摸一张牌。',

    zshy_AAZZxiahouhuiWDWB: '墟夏侯徽',
    zshy_baoqie: '宝箧',
    zshy_baoqie_info:  '隐匿技，锁定技。你登场后，从牌堆或弃牌堆中获得一张不为赠物的宝物牌。若此牌在你的手牌区内为宝物牌，则你可使用此牌。',
    zshy_yishi: '宜室',
    zshy_yishi_info:  '当有其他角色于其出牌阶段内因弃置而失去手牌后，你可令其获得这些牌中位于弃牌堆的一张，然后你获得其余位于弃牌堆的牌并回复1点体力。',
    zshy_shidu: '识度',
    zshy_shidu_info:  '出牌阶段每名角色限一次，你可获得一名其他角色的所有手牌并交给其X张手牌（X为你手牌数的一半，向下取整），若此时你的手牌不大于其，则你回复1点体力或摸一张牌。',

    zshy_AAZZsimashiWDWB: '墟司马师',
    zshy_taoyin: '韬隐',
    zshy_taoyin_info:  '隐匿技。当你明置此武将牌后，你选择任意名其他角色，令其手牌上限为0。',
    zshy_yimie: '夷灭',
    zshy_yimie_info:  '当你对其他角色造成伤害时，你可令伤害值改为其体力上限值+1。',
    zshy_tairan: '泰然',
    zshy_tairan_info:  '锁定技。一名角色的结束阶段，你回复至满体力，若手牌数不小于X，则你重铸至多X张牌，否则你将手牌摸至X。（X为你的体力上限）',
    zshy_ruilve: '睿略',
    zshy_ruilve_info:  `主公技。其他晋势力角色使用伤害牌时，你回复1点体力或摸一张牌并获得此牌。`,

    zshy_AAZZyanghuiyuWDWB: '墟羊徽瑜',
    zshy_huirong: '慧容',
    zshy_huirong_info:  '隐匿技，锁定技。当你登场后，你令一名角色将手牌数摸至/弃至与已损失体力值相同。',
    zshy_ciwei: '慈威',
    zshy_ciwei_info:  '其他角色于其回合内使用第偶数张牌时，若此牌为基本牌或普通锦囊牌，则你可取消此牌的所有目标。',
    zshy_caiyuan: '才媛',
    zshy_caiyuan_info:  '锁定技。一名角色的回合结束时，你回复1点体力或摸一张牌。',

    zshy_AAZZshibaoWDWB: '墟石苞',
    zshy_zhuosheng: '擢升',
    zshy_zhuosheng_info:  '锁定技。①你使用牌时无次数和距离限制。②你使用基本或普通锦囊牌选择目标后，可令此牌的目标数+1或-1。③你使用非基本牌时，你回复1点体力或摸一张牌。',

};
const 文德武备果 = {
    zshy_AAZZxuangongzhuWDWB: '墟宣公主',
    zshy_gaoling: '高陵',
    zshy_gaoling_info:  '隐匿技。当你明置此武将牌后，你可令一名角色增加1点体力上限并回复1点体力。',
    zshy_qimei: '齐眉',
    zshy_qimei_info:  '准备阶段，你可选择一名其他角色。你与其获得如下效果直到你的准备阶段开始：1.当你或其获得/失去手牌后，则另一名角色回复1点体力。②当你或其的体力值变化后，另一名角色摸一张牌。',
    zshy_XGZzhuiji: '追姬',
    zshy_XGZzhuiji_info:  '一名角色的出牌阶段开始时，你可选择一项：1.摸两张牌并失去1点体力，然后于出牌阶段结束时回复1点体力；2.回复1点体力并弃置两张牌，并于出牌阶段结束时摸两张牌。',

    zshy_AAZZsimazhaoWDWB: '墟司马昭',
    zshy_tuishi: '推弑',
    zshy_tuishi_info:  '隐匿技。你于角色A的回合内登场时，可选择一名角色B。A选择一项：1.对B造成1点伤害；2.你对A造成1点伤害。',
    zshy_choufa: '筹伐',
    zshy_choufa_info:  '出牌阶段，你可选择任意名本回合未以此法选择的其他角色，展示其一张手牌A（无牌则不展示），然后令其除牌A外的其他手牌的牌名均视为无属性【杀】直到其回合结束，最后你对其造成1点伤害。',
    zshy_zhaoran: '昭然',
    zshy_zhaoran_info:  '锁定技。①出牌阶段开始时，你展示所有手牌，然后回复X点体力并摸Y张牌（X为手牌花色数，Y为缺少花色数）。②当你失去任意花色的最后一张手牌后，则你选择一项：1.摸一张牌；2.弃置其他角色一张牌。',
    zshy_chengwu: '成务',
    zshy_chengwu_info:  '主公技，锁定技。其他晋势力角色攻击范围内的角色视为在你的攻击范围内。',

    zshy_AAZZwangyuanjiWDWB: '墟王元姬',
    zshy_shiren: '识人',
    zshy_shiren_info:  '隐匿技。当你明置此武将牌后，你可选择一名有手牌的其他角色，获得其两张牌并对其造成1点伤害。',
    zshy_yanxi: '宴戏',
    zshy_yanxi_info:  '①其他角色一次性获得至少两张牌后，你可将其随机的一张牌与牌堆顶的一张牌混合后展示，然后你猜测哪一张是其手牌，若猜对，则你获得所有展示牌并对其造成1点伤害。否则你获得猜错的牌并回复1点体力。②你因〖宴戏〗获得的牌不计入手牌上限且无距离与次数限制。',

    zshy_AAZZduyuWDWB: '墟杜预',
    zshy_sanchen: '三陈',
    zshy_sanchen_info:  '<span class=thundertext>一名角色的出牌阶段开始时</span>/<span class=firetext>当一名角色受到伤害后</span>，你可<span class=thundertext>令</span>/<span class=firetext>选择一名角色令</span>其摸一张牌并重铸三张牌（不满三张则全部重铸）。若以此法重铸的牌类别均不同，则其回复1点体力并摸一张牌，然后令其重复执行〖三陈〗效果。',
    zshy_pozhu: '破竹',
    zshy_pozhu_info:  '①出牌阶段，你可将一张牌当作【出其不意】使用。②你使用的【出其不意】将根据其牌花色执行效果：♥：回复1点体力；♦：此牌伤害+1；♣：你摸一张牌；♠：此牌无法响应。',
    zshy_zhaotao: '诏讨',
    zshy_zhaotao_info:  '其他角色的回合开始时，你可随机废除其一个装备栏，然后令其非状态技失效直到其回合开始。',

    zshy_AAZZweiguanWDWB: '墟卫瓘',
    zshy_zhongyun: '忠允',
    zshy_zhongyun_info:  '锁定技。①当你受到伤害/回复体力后，若你的体力值与手牌数相等，你回复1点体力或对你攻击范围内的一名角色造成1点伤害。②当你获得/失去手牌后，若你的体力值与手牌数相等，你摸一张牌或弃置一名其他角色的一张牌。',
    zshy_shenpin: '神品',
    zshy_shenpin_info:  '当一名角色的判定牌生效前，你可打出一张与判定牌花色不同的牌代替之。',

};
const 文德武备戒 = {
    zshy_AAZZzhongyanWDWB: '墟钟琰',
    zshy_bolan: '博览',
    zshy_bolan_info:  '①一名角色的出牌阶段开始时，你可从三个技能中选择一个获得。②其他角色出牌阶段限一次，其可减少1点体力上限，令你从三个技能中选择一个令其获得。',
    zshy_yifa: '仪法',
    zshy_yifa_info:  '锁定技。其他角色使用牌指定你为目标后，其手牌上限-1。',

    zshy_AAZZxinchangWDWB: '墟辛敞',
    zshy_canmou: '参谋',
    zshy_canmou_info:  '一名角色使用基本牌或普通锦囊牌指定第一个目标时，你可为此牌增加一个额外目标。',
    zshy_XCcongjian: '从鉴',
    zshy_XCcongjian_info:  '任意其他角色成为基本牌或普通锦囊牌的第一个目标时，你也可成为此牌的目标（若已为目标则重复执行一次）。此牌结算结束后，你回复1点体力或摸两张牌。',

    zshy_AAZZjiachongWDWB: '墟贾充',
    zshy_xiongshu: '凶竖',
    zshy_xiongshu_info:  '其他角色的出牌阶段开始时，你可展示其一张手牌，然后你预测“其本阶段内是否会使用与展示牌牌名相同的牌”。此阶段结束时，若你的预测正确，则你对其造成1点伤害；否则你获得展示牌。',
    zshy_jianhui: '奸回',
    zshy_jianhui_info:  '锁定技。当你造成伤害后，你回复1点体力并令受伤角色失去1点体力；当你受到伤害后，伤害来源弃置一张牌，然后你摸一张牌。',

    zshy_AAZZwangxiangWDWB: '墟王祥',
    zshy_bingxin: '冰心',
    zshy_bingxin_info:  '当你需要使用或打出基本牌时，你可将手牌数摸或弃置至与你体力上限相同，然后视为使用之。',

};
const 文德武备约 = {
    zshy_AAZZyangyanWDWB: '墟杨艳',
    zshy_xuanbei: '选备',
    zshy_xuanbei_info:  '出牌阶段，你可选择一名本回合未以此法选择的角色，观看其区域内一张牌并选择一项：1.使用此牌（无视距离且不计次限）；2.摸一张牌，然后其可将此牌当作【杀】对你使用。',
    zshy_xianwan: '娴婉',
    zshy_xianwan_info:  '①当你需要使用或打出【杀】/【闪】时，若你已/未横置，则你可重置/横置武将牌并视为使用或打出之。②发动〖娴婉〗后，若你未/已横置，则令一名其他角色/一名角色受到1点伤害/回复1点体力。',

    zshy_AAZZyangzhiWDWB: '墟杨芷',
    zshy_wanyi: '婉嫕',
    zshy_wanyi_info:  '①当你使用【杀】或普通锦囊牌指定其他角色为目标后，你可将其一张牌置于你的武将牌上称为「嫕」（与「嫕」相同花色的手牌不计入手牌上限）。②你的结束阶段或当你受到伤害后，你令一名角色获得你的一张「嫕」。',
    zshy_maihuo: '埋祸',
    zshy_maihuo_info:  '①当你成为其他角色【杀】的目标后，若此牌有对应实体牌且你是此牌的唯一目标，则你可令此牌无效，并将此牌置于其武将牌上称为「祸」。②一名其他角色的出牌阶段开始时，若其武将牌上有「祸」，则其将所有「祸」当成一张有距离限制且计入次数限制的刺【杀】对你使用（若你不为合法目标，则弃置所有「祸」）。③当你对有「祸」的其他角色造成伤害后，你移去其「祸」并回复1点体力。',
};

const translate = {
    ...文德武备理, ...文德武备备, ...文德武备果, ...文德武备戒, ...文德武备约,
};
export default translate;
