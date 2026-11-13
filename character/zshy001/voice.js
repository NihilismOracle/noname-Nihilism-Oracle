import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
const 蜀汉虎将 = {
    'zshy_AAZZguanyuBZ:die': '弟先往黄泉，望兄长保重。',
    zshy_wusheng1: '青龙略五关六将，赤兔驱万马千军。',
    zshy_wusheng2: '自古大能皆以文入圣，唯我以武超凡。',
    zshy_yijue1: '青灯观青史，倚青龙偃月、无愧青天。',
    zshy_yijue2: '赤面秉赤心，乘赤兔追风、无忘赤帝。',

    'zshy_AAZZzhangfeiBZ:die': '悔不停大哥之言！',
    zshy_paoxiao1: '黄口孺子，怎闻霹雳之声！',
    zshy_paoxiao2: '据桥一喝，闻者无不肝胆碎裂。',
    zshy_tishen1: '尔等愚夫，竟不识俺替身之计？',
    zshy_tishen2: '翼德虽粗，胸中亦有锦绣。',

    'zshy_AAZZzhaoyunBZ:die': '咳咳……这次……是我输了……',
    zshy_longdan1: '七进七出，如入无人之境。',
    zshy_longdan2: '攻必克，守必固。',
    zshy_yajiao1: '龙战八荒，豪气干云。',
    zshy_yajiao2: '天南海北，肝胆相照。',

    'zshy_AAZZmachaoBZ:die': '空有杀敌之心……',
    zshy_tieji1: '西凉儿郎们，随我上！',
    zshy_tieji2: '看到了吗，我西凉铁骑的雄风！',
};
const 贤君明主 = {
    'zshy_AAZZliubeiBZ:die': '二弟三弟，来世再聚桃园……',
    zshy_rende1: '兴复汉室的重担，望君切勿推辞。',
    zshy_rende2: '用这仁义之光，扫清乱世的雾霾。',
    zshy_renyi1: '兴复汉室的重担，望君切勿推辞。',
    zshy_renyi2: '用这仁义之光，扫清乱世的雾霾。',
    zshy_jijiang1: '还有谁？',
    zshy_jijiang2: '谁替朕捍卫这大汉江山！',

    'zshy_AAZZsunquanBZ:die': '天下如醇酒，一觞醉九州。',
    zshy_zhiheng1: '纵马观沧海，踏青观碧霄。',
    zshy_zhiheng2: '纸鸢借风力，一飞入青云。',
    zshy_jiuyuan1: '好风、好景，唯缺好酒一壶。',
    zshy_jiuyuan2: '天地无颜色，有幸得青一缕。',

    'zshy_AAZZcaocaoBZ:die': '心常叹怨，戚戚多悲……',
    zshy_jianxiong1: '日月之行，若出其中。',
    zshy_jianxiong2: '星汉灿烂，若出其里。',
    zshy_hujia1: '将才皆在，保我无忧。',
    zshy_hujia2: '我有嘉宾，鼓瑟吹笙。',

    'zshy_AAZZyuanshuBZ:die': '这天下，就没有忠厚人呐……',
    zshy_wangzun1: '代汉者当涂高，涂高者乃公路！',
    zshy_wangzun2: '登大宝，称仲帝，朕即天命！',
    zshy_tongji1: '尔等皆逆臣贼子，当死无赦！',
    zshy_tongji2: '欺君之罪，当诛九族！',

};
const 勇冠三军 = {
    'zshy_AAZZganningBZ:die': '不应如此！',
    zshy_qixi1: '敌军尚无备，宜奇袭制胜。',
    zshy_qixi2: '用兵以奇，遂袭敌寨。',
    zshy_fenwei1: '奋威齐进，呼声动天。',
    zshy_fenwei2: '驱兵奋勇，以威天下。',

    'zshy_AAZZlvmengBZ:die': '咳咳……本想攻其不备，谁知……',
    zshy_keji1: '隐忍克己，以待天时。',
    zshy_keji2: '一介武夫，终成一代儒将。',
    zshy_qinxue1: '勤学致远，以图天下。',
    zshy_qinxue2: '勤学不恨晚，报国必有时。',
    zshy_botu1: '博学宏才，才学弘德。',
    zshy_botu2: '强闻博识，涉猎良多。',
    zshy_gongxin1: '攻敌之心，乱敌之意。',
    zshy_gongxin2: '攻其心，异其意。',

    'zshy_AAZZhuanggaiBZ:die': '赤壁今已寒，犹忆当年火……',
    zshy_kurou1: '披甲转战南北。',
    zshy_kurou2: '攻城略地，尚不惧生死，又何惧鞭挞！',
    zshy_zhaxiang1: '诈降之术，因势利导！',
    zshy_zhaxiang2: '东风已起，点火，冲啊！',

    'zshy_AAZZxiahoudunBZ:die': '伤重难治，无力破敌。',
    zshy_ganglie1: '征战沙场，哪有不受伤的道理？',
    zshy_ganglie2: '敌破我身，我致敌损。',
    zshy_qingjian1: '清，乃为人之本。俭，乃做人之道。',
    zshy_qingjian2: '国家未定，岂可安于享受！',

    'zshy_AAZZzhangliaoBZ:die': '张辽，告退了……',
    zshy_tuxi1: '没有防备我吧。',
    zshy_tuxi2: '逍遥津下溃吴侯！',

    'zshy_AAZZxuzhuBZ:die': '墟许褚',
    zshy_luoyi1: '今日一战，不死不休！',
    zshy_luoyi2: '今天，我要大开杀戒！',

    'zshy_AAZZlvbuBZ:die': '若有来生日，当斩一切敌！',
    zshy_wushuang1: '汝等纵有万军，也难挡我吕布一人！',
    zshy_wushuang2: '吾手持画戟，脚踏赤兔，谁敢近我！',
    zshy_liqu1: '天予不取，反受其咎；时至不行，反受其殃！',
    zshy_liqu2: '吾自当为汝征战沙场！',

    'zshy_AAZZhuaxiongBZ:die': '此人，居然这么厉害……',
    zshy_yaowu1: '割鸡焉用牛刀，不劳温侯亲往。',
    zshy_yaowu2: '吾斩众诸侯首级，如探囊取物耳。',
    zshy_shizhan1: '来来来，且用汝之鲜血，濯我宝刀锋芒！',
    zshy_shizhan2: '吾观关东诸将，如鸡犬耳，何足道哉？',

};
const 帷幄千里 = {
    'zshy_AAZZzhugeliangBZ:die': '星光昏暗，吾命不久矣。',
    zshy_guanxing1: '五星聚舍，恐天下大变矣。',
    zshy_guanxing2: '虹光突显，异宝出世。',
    zshy_kongcheng1: '不可擅动，吾自有计。',
    zshy_kongcheng2: '虚而示虚，疑中生疑。',

    'zshy_AAZZzhouyuBZ:die': '吴国未兴，我怎能死。',
    zshy_yingzi1: '谈笑之间，胜负已了然于胸。',
    zshy_yingzi2: '天下两分，隔江而治。',
    zshy_fanjian1: '巧施间策，敌自乱矣。',
    zshy_fanjian2: '以真真假假之计，乱敌心智。',

    'zshy_AAZZluxunBZ:die': '我何以……至此？',
    zshy_qianxun1: '谦谦有礼，婉婉有仪。',
    zshy_qianxun2: '虚怀若谷，戒骄戒躁。',
    zshy_lianying1: '天下万物生于有，有生于无。',
    zshy_lianying2: '失之东隅，收之桑榆。',

    'zshy_AAZZhuatuoBZ:die': '可叹我毕生医术，无人可继。',
    zshy_jijiu1: '悬壶济世，妙手回春。',
    zshy_jijiu2: '鬼门关前能救死，奈何桥上可扶伤。',
    zshy_qingnang1: '医疑难之症，必以非常之法。',
    zshy_qingnang2: '待老夫抽丝剥茧，便可安然无恙。',

    'zshy_AAZZsimayiBZ:die': '天煞孤星，这都是命中注定的吧。',
    zshy_guicai1: '煞星聚顶，你死到临头了！',
    zshy_guicai2: '天狼星光大盛，天下易主可期。',
    zshy_fankui1: '天狼加身之人，从不会甘居人下！',
    zshy_fankui2: '贪狼有吞天之力，吞你，还不是易如反掌？',

    'zshy_AAZZguojiaBZ:die': '天煞孤星，这都是命中注定的吧。',
    zshy_tiandu1: '木秀于林，风必摧之。',
    zshy_tiandu2: '虽为神兽，亦须循天道而行。',
    zshy_yiji1: '大道至理，只可意会，不可言传。',
    zshy_yiji2: '我已，有所顿悟。',

};
const 巾帼红颜 = {
    'zshy_AAZZhuangyueyingBZ:die': '浮云蔽白日，轻纱遮白发。',
    zshy_jizhi1: '得此良智，解夫君烦扰。',
    zshy_jizhi2: '睿智深邃，远见卓越。',

    'zshy_AAZZdaqiaoBZ:die': '忆君如流水，日夜无歇时……',
    zshy_guose1: '衣带逐水去，绿川盼君留。',
    zshy_guose2: '溪边坐流水，与君共清欢。',
    zshy_liuli1: '所幸遇郎君，流离得良人。',
    zshy_liuli2: '此生逢伯符，足以慰平生。',

    'zshy_AAZZzhenjiBZ:die': '风袅袅兮目渺渺，余怅视兮莫言。',
    zshy_luoshen1: '水裔兮芳馨，似杜蘅兮芳缭。',
    zshy_luoshen2: '雨飞兮烟树，雪霏霏兮如霜。',
    zshy_qingguo1: '置樽兮骊殇，酹杜康兮璚浆。',
    zshy_qingguo2: '星辰见兮忽黯，何失色兮顾蒐。',

    'zshy_AAZZdiaochanBZ:die': '巍巍大汉，终非貂蝉可救……',
    zshy_lijian1: '呜呜，若非太师至此，妾已被吕布所侮。',
    zshy_lijian2: '将军！只恨貂蝉缘浅，愿一死以证清白。',
    zshy_biyue1: '丹唇带笑斟美酒，美目含情送秋波。',
    zshy_biyue2: '英雄轻抚素手，小女既怯且羞。',

    'zshy_AAZZsunshangxiangBZ:die': '哥哥，你怎可如此……',
    zshy_xiaoji1: '配干将莫邪之利器，擅龙泉秋水之嘉名。',
    zshy_xiaoji2: '本小姐有清歌妙舞，不妨与长铗一齐献上。',
    zshy_jieyin1: '愿做比翼鸟，与君相和鸣。',
    zshy_jieyin2: '欣之燕尔，白首永偕。',

};
const SP系列 = {
    'zshy_AAZZguanyuSP:die': '忠节一世，死战不降！',
    zshy_wusheng_zshy_AAZZguanyuSP1: '誓会兄长，不惧血战！',
    zshy_wusheng_zshy_AAZZguanyuSP2: '武定乱世，圣绝一心！',
    zshy_danji1: '桃园义犹在，千里又何妨？',
    zshy_danji2: '纵然单刀一骑，亦可破敌千里！',

    '#zshy_AAZZjiangweiSP:die': '蜀军大势已去，空留麒麟之殇。',
    zshy_kunfen1: '潜麟虽困，其志犹宏！',
    zshy_kunfen2: '困守非良策，奋战突险围！',
    zshy_fengliang1: '恩逢义师，得展宏图！',
    zshy_fengliang2: '皓月出山，引凤投灵！',
    zshy_tiaoxin_zshy_AAZZjiangweiSP1: '撤营百步，汝敢来追？',
    zshy_tiaoxin_zshy_AAZZjiangweiSP2: '藏头露尾，可是大丈夫所为？',

    'zshy_AAZZjiaxuSP:die': '唉，站错队伍，才是根本问题……',
    zshy_jianshu1: '我当静观其变，坐收渔翁之利。',
    zshy_jianshu2: '再好的关系，也能生出嫌隙。',
    zshy_yongdi1: '吾观君雄才伟略。乃真命之主。',
    zshy_yongdi2: `这世子之位，非你莫属。`,

    'zshy_AAZZmachaoSP:die': '血仇犹在，奈何青锋已残……',
    zshy_shichou1: '父仇在胸，国恨在目，西凉马超，誓杀曹贼！',
    zshy_shichou2: '不枭曹贼之首祀于父前，吾枉为人子。',

    'zshy_AAZZpangtongSP:die': '雏凤未飞已先陨……',
    zshy_guolun1: '表虽言过其实，实则引人向善。',
    zshy_guolun2: '吾与卿之才干，孰高孰低？',
    zshy_songsang1: '公瑾新丧，我当扶灵而还。',
    zshy_songsang2: '昔人乘鹤去，我执魂幡来。',
    zshy_zhanji1: '吾非百里才，必有千里之行。',
    zshy_zhanji2: '展吾骥足，施吾羽翅！',

    'zshy_AAZZsunshangxiangSP:die': '墟SP孙尚香',
    zshy_liangzhu1: '献绵薄之力，安夫君之心。',
    zshy_liangzhu2: '良君如有愿，助尔三军前！',
    zshy_fanxiang1: '提剑斩姻缘，今启赴归程。',
    zshy_fanxiang2: '本夫人回乡探母、有何不可？！',
    zshy_xiaoji_zshy_AAZZsunshangxiangSP1: '自幼习武，犹善弯弓弄弩！',
    zshy_xiaoji_zshy_AAZZsunshangxiangSP2: '裁胄为琴，弹剑为曲。',

    'zshy_AAZZzhangheSP:die': '主公自折庭柱，何异引火烧身？',
    zshy_zhouxuan1: '秉破军之利，怀扶危之义，柱千里之庭。',
    zshy_zhouxuan2: '怀怒于心，奋威于刃，斩吞天之蟒、据地之魍。',

    'zshy_AAZZzhaoyunSP:die': '这杳杳乱世，何处可寻得明主。',
    zshy_longdan_zshy_AAZZzhaoyunSP1: '忠肝义胆，辗转千里之境，坚贞不移。',
    zshy_longdan_zshy_AAZZzhaoyunSP2: '白马银枪，纵横万军之中，游刃有余。',
    zshy_chongzhen1: '策马冲阵，义贯金石之间。',
    zshy_chongzhen2: '一骑当先，气冲斗牛之宵。',

};
const 始计篇智 = {
    'zshy_AAZZbianfurenSJP:die': `悼痛酷楚，情自不胜。`,
    zshy_wanwei1: '曹君吉凶未可知，诸君岂可还家。',
    zshy_wanwei2: '明日若再，何面目复相见也？',
    zshy_yuejian1: '居处当务节俭，不当望赏赐。',
    zshy_yuejian2: '取其上者为贪，取其下者为伪。',

    'zshy_AAZZduyuSJP:die': '吾勤加追琢，然终未有圭璋之期……',
    zshy_wuku1: '人非生而知之，但敏而求之也。',
    zshy_wuku2: '广习经籍，只为上能弼国，下可安民。',
    zshy_wuku_zshy_AAZZduyuSJP_shadow1: '千计万策，随江即来也。',
    zshy_wuku_zshy_AAZZduyuSJP_shadow2: '万结之绳，不过一剑即解。',
    zshy_DYsanchen1: '今便可荡平吴都，陛下何舍而不取？',
    zshy_DYsanchen2: '天下思定已久，陛下当成四海之愿。',
    zshy_miewu1: '驭虬吞江为平地，剑指东南定吴夷。',
    zshy_miewu2: '九州从来向一统，岂容伪朝至两分？',

    'zshy_AAZZluotongSJP:die': '至尊若纳统之言，统余愿足矣……',
    zshy_qinzheng1: '君恃民者有六，民赖君者惟宁。',
    zshy_qinzheng2: '衆非后无能胥以宁，后非衆无以辟四方。',

    'zshy_AAZZshenguojiaSJP:die': '未及引动天能，竟已要坠入轮回……',
    zshy_ghuishi1: '观滴水而知沧海，窥一举而察人心。',
    zshy_ghuishi2: '察才识贤，以翊公之事。',
    zshy_ghuishi_zshy_AAZZshenguojiaSJP_shadow1: '人心所向，未来之事皆一睹而尽知。',
    zshy_ghuishi_zshy_AAZZshenguojiaSJP_shadow2: '笑揽世间众生，坐观天行定数。',
    zshy_huishi1: '人亦如星，或居空而渺然，或为彗而明夜。',
    zshy_huishi2: '纵殒身祭命，亦要助明公大业。',
    zshy_huishi_zshy_AAZZshenguojiaSJP_shadow1: '寿数长短不足与明公大事相较。',
    zshy_huishi_zshy_AAZZshenguojiaSJP_shadow2: '目下万物皆为成吾等之愿。',
    zshy_SGJtianyi1: '明主既现，吾定极尽所能。',
    zshy_SGJtianyi2: '今九州纷乱，当祈天翊佑。',
    zshy_zuoxing1: '借天秘力，佐公之事，感有荣焉。',
    zshy_zuoxing2: '且为明公巧借天时。',

    'zshy_AAZZshenxunyuSJP:die': '曹公初心既忘，恕彧再难相随……',
    zshy_tianzuo1: '明公举义兵扶汉，此顺天之意也。',
    zshy_tianzuo2: '从民望而为顺，扶弘义以为德！',
    zshy_lingce1: '锻身成策，图布天下之局！',
    zshy_lingce2: '化敌计为吾用，则可出奇胜于未兆。',
    zshy_dinghan1: '伐贼众方止播越，奉天子始作建安。',
    zshy_dinghan2: '守尚书而秉节，持矜重以定汉！',

};
const 始计篇信 = {
    'zshy_AAZZzhouchuSJP:die': '只愿今日之行，可偿昔日之孽……',
    zshy_xianghai1: '今时和岁丰，何苦而不乐耶？',
    zshy_xianghai2: '始闻三害之名，不知此何谓也？',
    zshy_chuhai1: '尔等为祸乡里，当知有此一劫。',
    zshy_chuhai2: '既悔前事之祸，今唯律己改之。',
    zshy_chuhai_fail1: '额啊，蛟虎力猛，终非凡夫可敌。',
    zshy_zhangming1: '射虎搏蛟，可知我除害之勇。',
    zshy_zhangming2: '笃学克己，足证吾归正之坚。',

    'zshy_AAZZshensunceSJP:die': '尔等宵小！穷极龌龊之能事……',
    zshy_yingba1: '江东有吾足矣，余者俱听命称臣！',
    zshy_yingba2: '今不俯首系颈，明日便尸骨无存！',
    zshy_fuhai1: '吾掌中之物，尔等安敢染指！',
    zshy_fuhai2: '有违吾意者，此子便是下场！',
    zshy_pinghe1: '敌胆裂之不暇，吾岂可不攻而退！',
    zshy_pinghe2: '师出之日，有死而荣，无生而辱！',

    'zshy_AAZZshentaishiciSJP:die': `胜负兵家常事，何可自隳其志……`,
    zshy_powei1: `惑敌以散其阵，适时上马出击！`,
    zshy_powei2: `吾心所向，天亦难挡，更况尔等！`,
    zshy_powei3: `此番破围不成，实乃预之不周！`,
    zshy_dulie1: `水背源则川竭，人背信则名裂！`,
    zshy_dulie2: `善不由外来，名不可虚作！`,
    zshy_shenzhuo1: `弓矢既调，只待此夭！`,
    zshy_shenzhuo2: `拈弓搭箭，舍矢如破！`,

};
const 始计篇仁 = {
};
const 始计篇勇 = {
    'zshy_AAZZwenyangSJP:die': '洛阳宫前屈枉冢，乐嘉城上凄然风……',
    zshy_quedi1: '乐嘉风起残云散，万钧雷震万千军！',
    zshy_quedi2: '进袭如惊涛，破围如落潮！',
    zshy_zhuifeng1: '淮南讨逆之役，次骞愿为先锋！',
    zshy_zhuifeng2: '吾枪之利？汝一试便知！',
    zshy_chongjian1: '奋六钧之力，破九天重云！',
    zshy_chongjian2: '攻敌营垒，不留一隅之地！',
    zshy_choujue1: '国仇家怨，汝搓骨难偿！',
    zshy_choujue2: '彻天盈海之仇，纵身死亦不绝！',

};
const 始计篇严 = {
};
const 魔乱九州 = {
    'zshy_AAZZlvbuMO:die': `人间无敌，该去地狱挑战了。`,
    zshy_duoqi1: `你的胆气，一文不值！`,
    zshy_duoqi2: `你的脊梁，不堪一击！`,
    zshy_kuangmo1: `草芥，也配呼吸？`,
    zshy_kuangmo2: `哼，蝼蚁，杀了解闷。`,
    zshy_kuangmo3: `骄狂纵意，天地唯我！`,
    zshy_gangquan1: `罡风贯耳，为我战歌！`,
    zshy_gangquan2: `用这拳头，打破一切！`,

};
const 曹魏 = {
    'zshy_AAZZcaofangJMGX:die': '恨无魏武之能，恨与献帝同伍。',
    zshy_zhimin1: '朕当筑万千广厦，为天下人遮风挡雨。',
    zshy_zhimin2: '朕乃天下之主，四海黎庶皆朕之子民。',
    zshy_CFjujian1: '狼在前，虎在后，徒玉玺在手，令止于方寸。',
    zshy_CFjujian2: '朕如牵丝之偶，行止由人，徒增天下之笑尔。',

    'zshy_AAZZcaojinyuJMGX:die': '余香空留此，玉指轻揉散。',
    zshy_yuqi1: '泪眼婆娑泣，伊人憔悴消。',
    zshy_yuqi2: '柔情愁肠断，寂寞梧桐落。',
    zshy_shanshen1: '天子之家，需守心静身。',
    zshy_shanshen2: '心清则明，积善则安。',
    zshy_xianjing1: '娴雅淑静，冰清玉洁。',
    zshy_xianjing2: '媖娴美好，典雅温蕴。',

    'zshy_AAZZcaomaoLXXH:die': '纵不成身死，朕亦为太祖子孙，大魏君王……',
    'zshy_AAZZcaomaoLXXH_shadow:die': '纵不成身死，朕亦为太祖子孙，大魏君王……',
    'zshy_AAZZcaomaoLXXH_dead:die': '纵不成身死，朕亦为太祖子孙，大魏君王……',
    zshy_qianlong1: '朕为天子，岂忍威权日去！',
    zshy_qianlong2: '朕行之决矣，正使死又何惧！',
    zshy_qianlong3: '权臣震主，竟视天子于无物！',
    zshy_qianlong4: '假以时日，必讨司马一族！',
    zshy_qianlong5: '若安司马于外，或则皇权可收。',
    zshy_qianlong6: '暗恤忠君之士，以待破局之机。',
    zshy_weitong1: '手无实权难卫统，朦胧成睡，睡去还惊。',
    zshy_qingzheng1: '朕虽不德，昧于大道，思与宇内共臻兹路。',
    zshy_qingzheng2: '愿遵前人教诲，为一国明帝贤君。',
    zshy_jiushi_zshy_AAZZcaomaoLXXH1: '心忿无所表，下笔即成篇。',
    zshy_jiushi_zshy_AAZZcaomaoLXXH2: '气幽但求醉，醒后寻复来。',
    zshy_fangzhu_zshy_AAZZcaomaoLXXH1: '卿当竭命纳忠，何为此逾矩之举！',
    zshy_fangzhu_zshy_AAZZcaomaoLXXH2: '朕继文帝风流，亦当效其权略。',
    zshy_juejin1: '朕宁拼一死，逆贼安敢一战！',
    zshy_juejin2: '朕安可坐受废辱，今日当与卿自出讨之！',

    'zshy_AAZZdufurenJMGX:die': '相守白头者，非我有情人。',
    zshy_yise1: '女为悦己者容，着胭之颜唯钟知己之人。',
    zshy_yise2: '素花独绽于紫园，人不谓之佳而谓之异。',
    zshy_shunshi1: '浮生若抱薪渡江，身不由己而由江海之所往。',
    zshy_shunshi2: '乱世女子似雨中浮萍，命河可顺而不可逆之。',

    'zshy_AAZZsimazhaoLXXH:die': '锋芒毕露．野心昭彰，竟有此果……',
    'zshy_AAZZsimazhaoLXXH_shadow:die': '王权崩坏，此罪弥天……',
    zshy_xiezheng1: '臣请陛下亲讨乱贼，以昭帝威！',
    zshy_xiezheng2: '天子亲征，淮南之乱，不日可平！',
    zshy_xiezheng_zshy_AAZZsimazhaoLXXH_shadow1: '吾今大权独揽，何可再予他人？',
    zshy_xiezheng_zshy_AAZZsimazhaoLXXH_shadow2: '吾领三军于外，岂容陛下收政于京！',
    zshy_qiantun1: '天下未定，吾当辞邑修身，何敢冒僭？',
    zshy_qiantun2: '统摄朝野，威加海内，此皆陛下恩德！',
    zshy_qiantun3: '满朝尽忠天子，何有不臣之人？',
    zshy_qiantun4: '九辞封赐，足见臣一片忠心。',
    zshy_zhaoxiong1: '天下名为曹姓，实归吾司马一族！',
    zshy_zhaoxiong2: '陛下有罪，吾当治之以对天下！',
    zshy_weisi1: '众将平乱所获，皆为陛下所赐！',
    zshy_weisi2: '城破之日，定诛此逆贼三族！',
    zshy_weisi3: '平叛淮南，吾司马氏当再立不世之功！',
    zshy_dangyi1: '徒生逆心，未有其力，破之易如反掌！',
    zshy_dangyi2: '司马氏江山，自不容怀异之徒！',

    'zshy_AAZZzhongyuJMGX:die': `狝猴骑土牛，人生何迟也！`,
    zshy_zhidui1: '雷霆起于青萍之末，智者见于未萌之时。',
    zshy_zhidui2: '智生于急，言出于敏，君子不讷于大方。',
    zshy_jiesi1: '臣心如潭，报君以明月，潭愈深、月愈明。',
    zshy_jiesi2: '智者千虑而有一失，吾之失，焉知非福？',

};
const 蜀汉 = {
    'zshy_AAZZhuamanJMGX:die': '沙场叶落，山花凋零。',
    zshy_manyi1: '九黎兴兵，不向南中百族。',
    zshy_manyi2: '南中初军，锋指山外之人。',
    zshy_mansi1: '兵主血脉，岂可懦然藏身莽荒。',
    zshy_mansi2: '蚩尤之嗣，举兵图复旧日河山。',
    zshy_souying1: '林木藏躯，倩影难寻。',
    zshy_souying2: '薮泽匿痕，芳踪无迹。',
    zshy_zhanyuan1: '寒光结妙缘，金戈留英姿。',
    zshy_zhanyuan2: '沙场幸结缘，征战共郎君。',
    zshy_xili1: '齐心并进，可拔坚城，可略千里。',
    zshy_xili2: '协力共进，可摧锋镝，可攻万军。',

    'zshy_AAZZwenyuanJMGX:die': '秋风起，天意凉，独立黄昏愁满肠。',
    zshy_kengqiang1: '青鸟啼银杏，子规还巢，落叶沾满离人泪。',
    zshy_kengqiang2: '我夫战沙场，金柝未闻，北雁何时寄锦书？',
    zshy_kuichi1: '秋霜寒千山，虽此时胜火，转瞬则归于寂寥。',
    zshy_kuichi2: '叶落方寸地，挽指绕青丝，欲曳春风绿江南。',
    zshy_shangjue1: '秋叶别古木，无边潇潇，化作江河万古流。',
    zshy_shangjue2: '伊人赴戎机，关山难度，古卷青灯话别离。',
    zshy_kunli1: '落花无意随流水，莫道落花总无情。',
    zshy_kunli2: '秋叶落，冰封寒，待画卷徐展，必世间回暖。',

    'zshy_AAZZzhangyuJMGX:die': `不可争汉中，军必不利。`,
    zshy_xiangchen1: `将军目藏北斗，奈何，呵呵，潞涿无毛。`,
    zshy_xiangchen2: `品貌知命途，一语解百忧。`,
    zshy_mingding1: `举镜视面，自知刑死，唯叹造化弄人。`,
    zshy_mingding2: `阻门之芳兰，敬待潞涿君锄之。`,

};
const 东吴 = {
    'zshy_AAZZsunchenJMGX:die': '臣为大吴立过功，臣为陛下流过血！',
    zshy_zigu1: '既得一世之富贵，管甚国家洪水滔天？',
    zshy_zigu2: '江东六十四郡，我欲取之，谁不予之？',
    zshy_zuowei1: '君上吾之小辈也，尔等见我当如见天子。',
    zshy_zuowei2: '吾威如斯，戏天子如操傀偶，杀将相如屠豕犬。',

    'zshy_AAZZsunyiJMGX:die': '吾竟死于此等小人之手，恨哉！恨哉！',
    zshy_jiqiao1: '大丈夫行事，理应如火如荼！',
    zshy_jiqiao2: '真男儿性情，当如烈火轰雷！',
    zshy_xiongyi1: '继吾遗志者，当报吾之血仇！',
    zshy_xiongyi2: '求田问舍非良策，功业何须与命偕？',
    zshy_hunzi_zshy_AAZZsunyiJMGX1: '江东虎子，怎会亡于小人之手！',
    zshy_hunzi_zshy_AAZZsunyiJMGX2: '危难之时，当效父兄，振奋而起！',
    zshy_yingzi_zshy_AAZZsunyiJMGX1: '勇壮豪烈，效先父长兄，驰骋江东，快意行事！',
    zshy_yinghun_zshy_AAZZsunyiJMGX1: '助我者待之如手足，阻我者攻之若仇雠！',

};
const 群雄 = {
    'zshy_AAZZbeimihuJMGX:die': '你们的力量，我认可了。',
    zshy_zongkui1: '你是我的人吗？',
    zshy_zongkui2: '向你的女王低头。',
    zshy_guju1: '看到黄泉比良坂了吗？',
    zshy_guju2: '我可行走在生死两界。',
    zshy_baijia1: '请重新认识一下我吧。',
    zshy_baijia2: '这力量，正在汇聚。',
    zshy_BMHcanshi1: '求饶吧，看看我会不会同意。',
    zshy_BMHcanshi2: '你在颤抖，你害怕我吗？',

    'zshy_AAZZlijueJMGX:die': `若有文和在侧，吾不止如此。`,
    zshy_langxi1: `狼顾鸱张，群散各奔。`,
    zshy_langxi2: `炎狼奔袭，围攻灭敌。`,
    zshy_yisuan1: `文和虽智，吾亦善算。`,
    zshy_yisuan2: `文和之言，略有可用之处。`,

    'zshy_AAZZliubianJMGX:die': '九泉之下，何颜以对先帝。',
    zshy_shiyuan1: '忆昔东都年盛时，平生怨在帝王家。',
    zshy_shiyuan2: '金殿饮鸩酒，含怨赋绝词。',
    zshy_dushi1: '逆臣见迫兮，痛饮鸩酒。',
    zshy_dushi2: '药毒入髓兮，独赴泉台。',
    zshy_yuwei1: '无语音……',

    'zshy_AAZZlvlingqiJMGX:die': '雪漫黄金甲，温侯继无人。',
    zshy_guowu1: '青丝白雪红缨枪，万里江山待清扬。',
    zshy_guowu2: '凿冰作镜照玉容，爵中清酒冷如霜。',
    zshy_zhuangrong1: '寒山归鸿，撷沧澜之雪衣覆万里江山。',
    zshy_zhuangrong2: '暮雪千山，此处良辰可妆千秋之佳色。',
    zshy_LLQshenwei1: '数九之风，汇铸雪缨，可寒天下之冬。',
    zshy_LLQshenwei2: '霜天神女降九州，瑞雪晶莹透钰秀！',
    zshy_LLQwushuang1: '白霜拂面冷坚铠，红袖执戟傲寒风。',
    zshy_LLQwushuang2: '宇内寒气惊金柝，白雪释冷千丈冰。',

    'zshy_AAZZxurongJMGX:die': '吾血战沙场，少有败绩，却落魄至此。',
    zshy_xionghuo1: '哈哈哈哈，尝尝如镬亨之刑的厉害吧！',
    zshy_xionghuo2: '这就是，你们要经历的镬汤地狱！',
    zshy_shajue1: '除根斩尽，以绝后顾。',
    zshy_shajue2: '此敌，断不可留一人。',

    'zshy_AAZZxushaoJMGX:die': '乱世评荐难再续，唯有荷香夜夜长。',
    zshy_pingjian1: '千帆过尽，评枭雄之谋，论天下分合！',
    zshy_pingjian2: '三尺毛峰，引九天之水，濯一世功名！',

};
const 西晋 = {
};
const 神祇 = {
    'zshy_AAZZshencaopiJMGX:die': `千秋霸业，尽归尘土。`,
    zshy_yinzhi1: '帝王寡，帝王孤，帝王一怒万鬼哭！',
    zshy_yinzhi2: '夜色无边，没尽喧哗，明日朝升，唯见新碑林立！',
    zshy_keming1: '凡尘死生，录吾彀中，一笔朱砂落，千载风流空。',
    zshy_keming2: '天授汝命，亲授汝身，师授汝志，君授汝名！',

    'zshy_AAZZshendengaiJMGX:die': '巨灵不屑顾魍魉，奈何反被宵小伤。',
    zshy_tuoyu1: '巨灵之力盈身，曳金牛于高阙，惊蛟蟒于狂澜。',
    zshy_tuoyu2: '效五丁开山之旧事，全六合一统于天阙。',
    zshy_xianjin1: '敌备险拒我，我行险擒敌，勇者胜也。',
    zshy_xianjin2: '鸥鹭擒蚌，必以利喙击其坚甲，而后得脍。',
    zshy_qijing1: '世人皆寻已有之平路，独吾愿为开路之先锋。',
    zshy_qijing2: '纵尔匿离天之穹、九幽之渊，吾亦擒汝首而还。',
    zshy_cuixin1: '缚枷于颈，镇岳于魂，教汝死灰不燃、万劫不复！',
    zshy_cuixin2: '上军争功，夺三家之士气，击天下之雄兵。',

    'zshy_AAZZshenhuangzhongLMGX:die': '今日力尽于此，无愧于天地。',
    zshy_lieqiong1: '皓首曳白羽，寒光霜天下！',
    zshy_lieqiong2: '青冥断七杀，赤澜缚天狼！',
    zshy_SHZzhanjue1: '脚踏风雨，手握雷霆，曳断九天银河！',
    zshy_SHZzhanjue2: '身拄长刀，兀立斜阳，何妨以血补天。',

    'zshy_AAZZshenjiangweiJMGX:die': '残阳晦月映秋霜，天命不再计成空。',
    zshy_jiufa1: '担北伐重托，当兴复汉室，还于旧都。',
    zshy_jiufa2: '任将军之职，应厉兵秣马，军出陇右。',
    zshy_tianren1: '残兵盘据雄关险，独梁力支大厦倾！',
    zshy_tianren2: '雄关高岭壮英姿，一腔热血谱汉风。',
    zshy_pingxiang1: '此身独继隆中志，功成再拜五丈原！',
    zshy_pingxiang2: '平北襄乱之心，纵身加斧钺亦不改半分！',

    'zshy_AAZZshenmachaoJMGX:die': '以战入圣，贪战而亡。',
    zshy_shouli1: '饲骊胡肉，饮骥虏血，一骑可定万里江山！',
    zshy_shouli2: '折兵为弭，纫甲为服，此箭可狩在野之龙！',
    zshy_hengwu1: '此身独傲，天下无不可敌之人，无不可去之地！',
    zshy_hengwu2: '神威天降，世间无不可驭之雷，无不可降之马！',

    'zshy_AAZZshenpangtongJMGX:die': '孔明，好酒，好酒！',
    zshy_luansuo1: '红鸾锁瞳日，三千练实腾空起，此物最相思！',
    zshy_luansuo2: '玉壶妆梧桐，醴泉映东风，火凤归来耀长安！',
    zshy_fengliao1: '灯火映阑珊，谁家麒麟入梦，吹落繁星如雨？',
    zshy_fengliao2: '长空琼宇飞玉屑，千树黄金缕，万里起福灯。',
    zshy_kunyu1: '歌一曲，酒一觞，邀君醉琼浆，东风盈暖房。',
    zshy_kunyu2: '醒又醉，醉复眠，迟日江山如画，何人不流连？',

    'zshy_AAZZshenxuzhuJMGX:die': '黄泉闻战心犹喜，再与阎罗斗万年。',
    zshy_zhengqing1: '北马弄尘硝烟起，长刀试刃夷雍凉。',
    zshy_zhengqing2: '碎神威于沙场，曳天将军于黄泉。',
    zshy_zhuangpo1: '怀熊罴之勇，奋龙虎之威，有战则必胜。',
    zshy_zhuangpo2: '饮大江流水，观长安落日，天下自当纵横。',

    'zshy_AAZZshenzhangfeiJMGX:die': '愿舍神冕入轮回，与吾兄再结金兰。',
    zshy_shencai1: '汝罪之大，似彻天之山、盈渊之海！',
    zshy_shencai2: '生犯贪嗔痴戾疑，死受鞭笞斧灼烹！',
    zshy_xunshi1: '此间不明我明之，此事不平我平之！',
    zshy_xunshi2: '长车琳、铁甲铮，桓侯既至百冤明！',

    'zshy_AAZZshenzhangjiaoJMGX:die': '书中皆记王侯事，青史不载人间名。',
    zshy_yizhao1: '苍天离析，汉祚倾颓，逢甲子之岁可问道太平。',
    zshy_yizhao2: '紫微离北，七杀掠日，此天地欲复以吾为刍狗。',
    zshy_sanshou1: '贫道所求之道，匪富贵，匪长生，唯愿天下太平。',
    zshy_sanshou2: '诸君刀利，可斩百头、万头，然可绝太平于人间否？',
    zshy_sijun1: '苍天已被吾泪没，且看黄天昭太平！',
    zshy_sijun2: '黄巾覆首，联方数万，此击可撼百年之炎汉。',
    zshy_tianjie1: '雷池铸剑，今霜刃即成，当振天下于大白。',
    zshy_tianjie2: '汝辈食民脂、靡民膏，当受天劫而死！',

    'zshy_AAZZshenzhonghuiJMGX:die': '世之疫，我之欲也！',
    zshy_linjie1: '地觞载魂浆，醉眠烛龙之目，敢教天下无火！',
    zshy_linjie2: '眸锋所指，江河凝滞，此界当立谁为王！',
    zshy_duzhang1: '扶摇而上九万里，吾视上士为鸠、匹夫为蜩。',
    zshy_duzhang2: '无法无天，无穷无尽，无友，无敌！',
    zshy_jianghuo1: '八骏失驰，冰棱裂地，多少年功业，怎肯付西风！',
    zshy_jianghuo2: '天地不仁，神祇不恤，众生不余！',
    zshy_lishi1: '天地无主，吾既至，九万里江山当跪迎！',
    zshy_lishi2: '天命命天，我于三十三重天上，如何命我？',
};

let origintaici = {
    ...蜀汉虎将, ...贤君明主, ...勇冠三军, ...帷幄千里, ...巾帼红颜,
    ...SP系列,
    ...始计篇智, ...始计篇信, ...始计篇仁, ...始计篇勇, ...始计篇严,
    ...魔乱九州,
    ...曹魏, ...蜀汉, ...东吴, ...群雄, ...西晋, ...神祇,
};
function getVoice(obj) {
    let result = {};
    for (let key in obj) {
        const value = obj[key];
        let newkey = '';
        if (key.includes(':die')) {
            newkey = `#ext:诸神寰宇/audio/character/${key.replace('#', '')}`;
        } else {
            newkey = `#ext:诸神寰宇/audio/character/${key.replace('#', '')}`;
        }
        result[newkey] = value;
    }
    return result;
}
const voice = getVoice(origintaici);;
export default voice;
