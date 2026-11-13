import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
const 天极·皇室宗亲 = {
    'zshy_AAZZcaoangJMGX:die': '忠孝两全，此生足矣。',
    zshy_kangkai1:  '来，这口刀，借给你使！',
    zshy_kangkai2:  '有我在，谁也休想踏过这道门！ ',

    'zshy_AAZZcaoxiancaohuaJMGX:die': `无情总是帝王家。`,
    zshy_huamu1:  `袖炉香，倩东风，趁舞罗衣花讯暖。`,
    zshy_huamu2:  `斜倚妆台绕红绡，簪花笑，红袖招。`,
    zshy_huamu3:  `蝶沐芳菲，我见青山多妩媚，万般总是君。`,
    zshy_huamu4:  `山有木兮木有枝，心悦君兮知不知？`,
    zshy_qianmeng1:  `雎鸠鸣河洲，花灿缤纷，女儿心思付瑶琴。`,
    zshy_qianmeng2:  `青鸟载锦书，衔来野陌一枝春。`,
    zshy_liangyuan1:  `心似双丝网，中有千千结。`,
    zshy_liangyuan2:  `我本草木间人，和光同尘，唯此情常在。`,
    zshy_jisi1:  `唤渡鸳鸯浦，兰桡少驻，蛮姜豆蔻相思味。`,
    zshy_jisi2:  `风不许树靜，篱前草木，总被雨打风吹去。`,
    'zshy_AAZZcaoxiancaohuaJMGX_shadow:die': `江有汜，之子归，不我以，不我与。`,
    zshy_huamu_zshy_AAZZcaoxiancaohuaJMGX_shadow1:  `新桃偷面色，翠翘移玉步。`,
    zshy_huamu_zshy_AAZZcaoxiancaohuaJMGX_shadow2:  `斟绿酒、掩红鬓，一丝螺黛绛朱唇。`,
    zshy_huamu_zshy_AAZZcaoxiancaohuaJMGX_shadow3:  `青丝织嫁衣，双鬓红霞可胜过夭夭桃花？`,
    zshy_huamu_zshy_AAZZcaoxiancaohuaJMGX_shadow4:  `燃丁合壬，火有源，水无根。`,
    zshy_qianmeng_zshy_AAZZcaoxiancaohuaJMGX_shadow1:  `挽云鬓，束榴发，兰舟画桨，送我到君家。`,
    zshy_qianmeng_zshy_AAZZcaoxiancaohuaJMGX_shadow2:  `吉日柔荑鸣琴瑟，双宿羡凤凰。`,
    zshy_liangyuan_zshy_AAZZcaoxiancaohuaJMGX_shadow1:  `死生契阔，与子成说。执子之手，与子偕老。`,
    zshy_liangyuan_zshy_AAZZcaoxiancaohuaJMGX_shadow2:  `彩云妆玉袖，鸳鸯于飞，愿君子万年。`,
    zshy_jisi_zshy_AAZZcaoxiancaohuaJMGX_shadow1:  `曲水溯情，灼灼生桃夭，一见君子误终生。`,
    zshy_jisi_zshy_AAZZcaoxiancaohuaJMGX_shadow2:  `山无陵，江水竭，天地合，乃敢与君绝。`,

    'zshy_AAZZliuxieJMGX:die': '皇权旁落，忠良尽丧，无人为朕分忧矣。',
    zshy_tianming1:  '延汉的国运，请在帮我一把。',
    zshy_tianming2:  '这江山，哪能轻易换主。',
    zshy_mizhao1:  '成败在此，爱卿小心。',
    zshy_mizhao2:  '唯有将军能担此重任。',

    'zshy_AAZZliuyanJMGX:die': '我本高祖之裔，为何命不瞩我？',
    zshy_tushe1:  '潜龙居井宿，揽斗牛、吞紫微。',
    zshy_tushe2:  '野有白鹿待射，欲问鼎重几何。',
    zshy_limu1:  '豪杰拔剑起，欲复斩白蛇。',
    zshy_limu2:  '据土养龙气，风卷三千里。',

    'zshy_AAZZqinghegongzhuJMGX:die': '生不入夏侯门，死不葬夏侯墓。',
    zshy_zengou1:  '我夫不忠、不孝、不义，不杀难平民愤，难彰国法。',
    zshy_zengou2:  '夏侯楙为臣不忠，为夫不正，为兄不恭，当诛之。',
    zshy_zhangji1:  '臣试问皆为长公主，我比之馆陶、平阳何如？',
    zshy_zhangji2:  '馆陶育儿阿娇，平阳连理仲卿，而我何得？',

    'zshy_AAZZsunhaoJMGX:die': '君非亡国之君，臣乃亡国之臣！',
    zshy_canshi1:  '君王治政，岂容他人置喙？',
    zshy_canshi2:  '怀怒肆威暴，何人敢不从！',
    zshy_chouhai1:  '九族已诛，竟还有漏网之鱼？',
    zshy_chouhai2:  '纵汝仇深似海，朕又有何惧？',
    zshy_guiming1:  '殿堂之间，皆为不忠之贼！',
    zshy_guiming2:  '玉陛之下，尽是叛逆之臣！',

};
const 四弼·辅国文曲 = {
    'zshy_AAZZmaliangJMGX:die': '季常无能，没能辅佐主公复兴汉室……',
    zshy_zishu1:  '君子有德，当不以物喜，不以己悲。',
    zshy_zishu2:  '身外之物，应泾渭分明，秋毫无犯。',
    zshy_yingyuan1:  '我为后援，卿大可放心！',
    zshy_yingyuan2:  '运筹帷幄，粮草调度，一应俱全。',

    'zshy_AAZZxizhicaiJMGX:die': '人算，终是敌不过天算……',
    zshy_tiandu_zshy_AAZZxizhicaiJMGX1:  '宠辱莫惊，去留无意。',
    zshy_tiandu_zshy_AAZZxizhicaiJMGX2:  '如果是注定的，那就欣然接受吧！',
    zshy_xianfu1:  '誓随主公，成就霸业！',
    zshy_xianfu2:  '对天起誓，以明我志！',
    zshy_xianfu3:  '祸不单行。',
    zshy_xianfu4:  '强敌当前，我亦不畏惧。',
    zshy_xianfu5:  '主公的信任，是我最大的动力。',
    zshy_xianfu6:  '哼哈哈哈，福，亦可双至。',
    zshy_chouce1:  '兵事无常，当早做筹划。',
    zshy_chouce2:  '运筹演谋，鞭挞宇内。',

    'zshy_AAZZyangyiJMGX:die': '捕我入狱，可为自断股肱！',
    zshy_juanxia1:  '吾胸可括千书万卷，且不噱记孺庸为字！',
    zshy_juanxia2:  '吾目可囊千山万水，唯不容得反骨之利！',
    zshy_dingcuo1:  '内调营收，外度公署，非吾不可定之。',
    zshy_dingcuo2:  '政通令达，安民定国，以吾策可为之。',

    'zshy_AAZZzhanghuaJMGX:die': '天道玄远，不如静以待之，以俟天命。',
    zshy_bihun1:  '为臣者，应秉臣节，清正朝纲。',
    zshy_bihun2:  '为官者，当辅弼君上，以安国家。',
    zshy_jianhe1:  '不破眼前之局，何以谈长久之利？',
    zshy_jianhe2:  '非图眼前之利，事急从权耳。',
    zshy_chuanwu1:  '既得干将，莫邪何复不至？',
    zshy_chuanwu2:  '灵异之物，终当化去，不永为人服也。',

    'zshy_AAZZzhugejinJMGX:die': '遇明主，得偿毕生所愿，足矣。',
    zshy_mingzhe1:  '知势则明志，明志则练达。',
    zshy_mingzhe2:  '知之曰明哲，明哲实作则。',
    zshy_hongyuan1:  '后援即可就到，诸将莫急。',
    zshy_hongyuan2:  '只待援军内外夹攻，必胜！',
    zshy_huanshi1:  '以君子之道，行兵家之事。',
    zshy_huanshi2:  '仁者，信者，行天下！',

};
const 天柱·势冠一方 = {
    'zshy_AAZZhuangzuJMGX:die': '无力挽弓乎。',
    zshy_wangong1:  '挽弓至三石，饮羽连中。',
    zshy_wangong2:  '挽弓以对，虚发而下鸟。',

    'zshy_AAZZshamokeJMGX:die': '以蛮身而全汉节，虽死无憾。',
    zshy_jili1:  '五溪水恶，尔等焉能全身而退！',
    zshy_jili2:  '蛮王之勇，一力当降十会！',

    'zshy_AAZZzhugedanJMGX:die': '某无愧于大魏，无愧于诸葛！',
    zshy_gongao1:  '守护之獒，虽无龙鳞虎爪，亦可保家国太平。',
    zshy_gongao2:  '吴蜀得龙虎犹难兴，大魏得獒犬而功成。',
    zshy_juyi1:  '户犬闻寇至尚吠三两声，况我大魏义士乎？',
    zshy_juyi2:  '观中原魏旗凋零，唯淮南独树义帜。',
    zshy_weizhong1:  '怯战者立斩不赦，尔等勿忘吾剑之利！',
    zshy_benghuai_zshy_AAZZzhugedanJMGX1:  '人生百年，死国可乎！',

};
const 女史·留史巾帼 = {
    'zshy_AAZZguanyinpingJMGX:die': `哥哥，父亲……三妹想家了……`,
    zshy_xuehen1:  `雪漫三冬寒，心恨九天燃！`,
    zshy_xuehen2:  `今日，就与你恩怨两清！`,
    zshy_huxiao1:  `将门虎女，啸鸣破敌！`,
    zshy_huxiao2:  `我这关，你休想躲过！`,
    zshy_wuji1:  `父亲的使命，我必义不容辞！`,
    zshy_wuji2:  `休要小看，关氏一族的力量！`,

    'zshy_AAZZguohuaiJIN:die': '我死后，切勿从粲、午之言……',
    zshy_zhefu1:  '非我善妒，实乃汝之过也。',
    zshy_zhefu2:  '履行不端者，当有此罚。',
    zshy_yidu1:  '彼之砒霜，吾之蜜糖。',
    zshy_yidu2:  '巧动心思，以遗他人。',

    'zshy_AAZZzhangxingcaiJMGX:die': '父亲，女儿辜负你的期望了……',
    zshy_shenxian1:  '国事不定，妾身定再战沙场。',
    zshy_shenxian2:  '武艺万千，仪态贤淑。',
    zshy_qiangwu1:  '枪舞花飞，斩敌无踪。',
    zshy_qiangwu2:  '承父志向，战场除敌。',

    'zshy_AAZZzhaoxiangJMGX:die': '世受国恩，今当以身殉国。',
    'zshy_AAZZzhaoxiangJMGX_shadow:die': '大厦将倾，空余泪两行。',
    zshy_ZXfanghun1:  '凝傲雪之梅为魄，英魂长存，独耀山河万古明！',
    zshy_ZXfanghun2:  '铸凌霜之寒成剑，青锋出鞘，斩尽天下不臣贼！',
    zshy_ZXfanghun_zshy_AAZZzhaoxiangJMGX_shadow1:  '当年明月凝霜刃，此日送尔渡黄泉！',
    zshy_ZXfanghun_zshy_AAZZzhaoxiangJMGX_shadow2:  '已识万里乾坤大，何虑千山草木青。',
    zshy_ZXfuhan1:  '逝者如斯，亘古长流，唯英烈之魂悬北斗而长存！',
    zshy_ZXfuhan2:  '赵氏之女，跪祈诸公勿渡黄泉，暂留人间、佑大汉万年！',
    zshy_ZXfuhan_zshy_AAZZzhaoxiangJMGX_shadow1:  '龙凤在侧，五虎在前，天命在汉，既寿永昌！',
    zshy_ZXfuhan_zshy_AAZZzhaoxiangJMGX_shadow2:  '人言为信，日月为明，言日月为证，佑大汉长明！',

};
const 少微·能人异士 = {
    zshy_cunmu_zshy_AAZZpengyangOL1:  `腹有锦绣千里，奈何偏居一隅。`,
    zshy_cunmu_zshy_AAZZpengyangOL2:  `心大志广之人，必难以保安。`,

    'zshy_AAZZsimahuiJMGX:die': `汝等，可不要让我失望啊。`,
    zshy_jianjie1:  `荐君良臣，定有所获。`,
    zshy_jianjie2:  `你可是人中龙凤。`,
    zshy_chenghao1:  `好话不言多。`,
    zshy_chenghao2:  `美言称好，与君共乐。`,
    zshy_yinshi1:  `身在幽静处，大隐山林间。`,
    zshy_yinshi2:  `长乐山水中，名留久长远。`,

    'zshy_AAZZzhanglingJMGX:die': '人生在世，不过转瞬间。',
    zshy_huji1:  `丹成之日，万兽来贺。`,
    zshy_huji2:  `清风绕绛坛，龙虎自天降。`,
    zshy_shoufu1:  `大施符咒，鸣钟扣罄。`,
    zshy_shoufu2:  `天授符箓，除恶铲奸。`,

    'zshy_AAZZzhugeguoJMGX:die': `化羽难成，仙境已逝。`,
    zshy_qirang1:  `求福禳灾，家和万兴。`,
    zshy_qirang2:  `禳解百祸，祈运千秋。`,
    zshy_yuhua1:  `虹衣羽裳，出尘入仙。`,
    zshy_yuhua2:  `羽化成蝶，翩仙舞愿。`,

};
const 虎贲·勇冠三军 = {
    'zshy_AAZZluzhiJMGX:die': `忠君卫道，此乃臣子本分，死则死矣！`,
    zshy_qingzhong1:  `世间之气，非清即浊；朝堂之臣，非忠即奸。`,
    zshy_qingzhong2:  `聚乾坤清气成忠骨，养浩然正气涤忠魂。`,
    zshy_weijing1:  `食君之俸禄，牧君之黎庶，保君之疆土。`,
    zshy_weijing2:  `倘若外寇已入我境，勿疑我已捐躯死乎！`,

    'zshy_AAZZquyiJMGX:die': '锦袍出乡关，铁衣裹尸还。',
    zshy_fuji1:  '先登如山不可撼，力压公孙镇白马！',
    zshy_fuji2:  '皆道天马踏飞燕，见我也须尽低眉！',
    zshy_jiaozi1:  '先登兵锋无匹，幽州手到擒来！',
    zshy_jiaozi2:  '公孙兵败如山，中原再无敌手！',

    'zshy_AAZZxiahoubaJMGX:die': '明敌易防，暗箭难躲。',
    zshy_tiaoxin_zshy_AAZZxiahoubaJMGX1:  '本将军不与无名之辈相战！',
    zshy_tiaoxin_zshy_AAZZxiahoubaJMGX2:  '尔等无名小辈，怎入本将军法眼？',
    zshy_paoxiao_zshy_AAZZxiahoubaJMGX1:  '吾岂容尔等小觑？',
    zshy_paoxiao_zshy_AAZZxiahoubaJMGX2:  '杀，杀他个片甲不留！',
    zshy_shensu_zshy_AAZZxiahoubaJMGX1:  '兵贵神速，机不可失！',
    zshy_shensu_zshy_AAZZxiahoubaJMGX2:  '兵之情主速！',

};
const 灯愿·祈福武将 = {
    'zshy_AAZZbaosanniangJMGX:die': `忘川桥头待君往，三生石上镌三生。`,
    zshy_wuniang1:  `红袖爱武妆，不让须眉七尺将，素手可拭刀锋凉。`,
    zshy_wuniang2:  `青丝绕青锋，此间巾帼战意浓，烈血尽染女儿红！`,
    zshy_xushen1:  `情衷此生，愿与君共战于沙场，焉存独活之想！`,
    zshy_xushen2:  `与君为好之心，纵石烂海枯、山河倒悬亦不改！`,
    zshy_zhennan1:  `南疆有我镇之，定叫蛮夷俯首、再无寇关之意！`,
    zshy_zhennan2:  `提刀镇关而守疆者，非男儿之属，巾帼亦可为！`,
    'zshy_AAZZbaosanniangJMGX_shadow:die': `今日虽死，亦不能使敌进半步！`,
    zshy_wuniang_zshy_AAZZbaosanniangJMGX_shadow1:  `凤舞天下，炎翎绽红莲，剑斩九州负义人！`,
    zshy_wuniang_zshy_AAZZbaosanniangJMGX_shadow2:  `龙翔八荒，皓鳞濯丹青，刀撰万古春秋义！`,
    zshy_xushen_zshy_AAZZbaosanniangJMGX_shadow1:  `红袖青锋，并肩协战，且看龙飞凤翔！`,
    zshy_xushen_zshy_AAZZbaosanniangJMGX_shadow2:  `我以此身许忠义，炙炎焚钺锻情丝！`,
    zshy_zhennan_zshy_AAZZbaosanniangJMGX_shadow1:  `青锋荡毒瘴，大江破山流！`,
    zshy_zhennan_zshy_AAZZbaosanniangJMGX_shadow2:  `秋风起，折断岭南十万兵！`,

    'zshy_AAZZcaochunJMGX:die': '宁可战死沙场，不可苟全安命……',
    zshy_shanjia1:  '虎豹骑，皆天下骁锐！',
    zshy_shanjia2:  '缮取治军之道，安抚众军之心。 ',

    'zshy_AAZZcaoshuangJMGX:die': '司马老儿，深不可测……',
    zshy_tuogu1:  '陛下托孤，臣自当竭尽忠诚，至死方休！',
    zshy_tuogu2:  '吾奉先帝之命，匡弼幼主，稳固魏室！',
    zshy_shanzhuan1:  '号令天下，莫敢不从！',
    zshy_shanzhuan2:  '势倾四海，声震天下！',

    'zshy_AAZZcaoyingJMGX:die': '黄泉羞见太祖、父兄……',
    'zshy_AAZZcaoyingJMGX_shadow:die': '袍泽捐躯在野，此仇怎可归冢？',
    zshy_lingren1:  '尔等于我，如着亵衣之黄口于持兵戈之锐士！',
    zshy_lingren2:  '夫为将者，其行雷厉、其兵骁果、其势凌人！',
    zshy_lingren_zshy_AAZZcaoyingJMGX_shadow1:  '秉凌人之盛气，试青锋于万里！',
    zshy_lingren_zshy_AAZZcaoyingJMGX_shadow2:  '斩宵小于沙场，绝仇雠于疆野！',
    zshy_fujian1:  '尔军中持戈之护卫、造饭之庖厨、饲马之御者皆为我军耳目！',
    zshy_fujian2:  '汝营兵将几何、粮草多少、箭矢盈亏，我已了然于胸。',
    zshy_fujian_zshy_AAZZcaoyingJMGX_shadow1:  '紫电耀魍魉之遁形，青霜斩魑魅之神魄。',
    zshy_fujian_zshy_AAZZcaoyingJMGX_shadow2:  '纵汝亡命天涯海角，吾亦逐之负首而还。',
    zshy_jianxiong_zshy_AAZZcaoyingJMGX1:  '太公曾教我一言，宁许我负人，勿许人负我！',
    zshy_jianxiong_zshy_AAZZcaoyingJMGX_shadow1:  '大仇在悬，没齿难忘，此日恩怨尽倾！',
    zshy_xingshang_zshy_AAZZcaoyingJMGX1:  '尔等且往黄泉，此物留于人间，自可为我所用！',
    zshy_xingshang_zshy_AAZZcaoyingJMGX_shadow1:  '黄泉路远，袍泽慢行，待我报仇雪恨。',

    'zshy_AAZZguansuoJMGX:die': '花落人陨情意消……',
    zshy_zhengnan1:  '得丞相之命，平南蛮之乱！',
    zshy_zhengnan2:  '随丞相南征，定当为国建功！',
    zshy_wusheng_zshy_AAZZguansuoJMGX1:  '关氏威名，可敌千军！',
    zshy_dangxian_zshy_AAZZguansuoJMGX1:  '一马当先，万险皆破！',
    zshy_zhiman_zshy_AAZZguansuoJMGX1:  '蛮夷之辈，不足为惧。',

    'zshy_AAZZwolongfengchuJMGX:die': '天意难违，卧龙凤雏兼得又如何……',
    zshy_youlong1:  '龙御九天，舍江海而率千军。',
    zshy_youlong2:  '卧拥六合，大梦醒而驱百策。',
    zshy_luanfeng1:  '病树砺火，繁花寥落雏芽生。',
    zshy_luanfeng2:  '凤舞丹穴，劫波渡尽心骨成。',

    'zshy_AAZZzhouchuJMGX:die': '以死全忠义之节，吾得其所。',
    zshy_shanduan1:  '昔处之害犹厉于龙虎，今请诸君拭目。',
    zshy_shanduan2:  '既秉斩蛟屠虎之力，何匿苟存三害之心？',
    zshy_yilie1:  '振衣笑赴往烈路，濯足江河万古流。',
    zshy_yilie2:  '心中万般不平事，以血作酒醉平知。',

};

let origintaici = {
    ...天极·皇室宗亲, ...四弼·辅国文曲, ...天柱·势冠一方,
    ...女史·留史巾帼, ...少微·能人异士, ...虎贲·勇冠三军,
    ...灯愿·祈福武将,
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
