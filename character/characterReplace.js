import { lib, game, ui, get, ai, _status } from '../../../noname.js';
const characterReplace = {
    baosanniang: ['zshy_AAZZbaosanniangJMGX'],//墟鲍三娘
    beimihu: ['zshy_AAZZbeimihuJMGX'],//墟卑弥呼
    bianfuren: ['zshy_AAZZbianfurenCCXH', 'zshy_AAZZbianfurenSJP'],//墟卞夫人
    bulianshi: ['zshy_AAZZbulianshiYJCM'],//墟步练师
    caifuren: ['zshy_AAZZcaifurenYJCM'],//墟蔡夫人
    caiwenji: ['zshy_AAZZcaiwenjiSHZL'],//墟蔡文姬
    caiyong: ['zshy_AAZZcaiyongYJCM'],//墟蔡邕
    caoang: ['zshy_AAZZcaoangJMGX'],//墟曹昂
    caocao: ['zshy_AAZZcaocaoBZ'],//墟曹操
    caochun: ['zshy_AAZZcaochunJMGX', 'zshy_AAZZcaochunMB'],//墟曹纯
    caochong: ['zshy_AAZZcaochongYJCM'],//墟曹冲
    caofang: ['zshy_AAZZcaofangJMGX'],//墟曹芳
    caojie: ['caojie', 'zshy_AAZZcaojieYJCM'],//墟曹节
    caojinyu: ['zshy_AAZZcaojinyuJMGX', 'zshy_AAZZcaojinyuOL'],//墟曹金玉
    caomao: ['zshy_AAZZcaomaoLXXH'],//墟曹髦
    caopi: ['zshy_AAZZcaopiSHZL', 'zshy_AAYAcaopi'],//墟曹丕、烬曹丕
    caoren: ['zshy_AAZZcaorenSHZL'],//墟曹仁
    caorui: ['zshy_AAZZcaoruiYJCM'],//墟曹叡
    caoshuang: ['zshy_AAZZcaoshuangJMGX'],//墟曹爽
    caoxi: ['zshy_AAZZcaoxi'],//墟曹羲
    caoxiancaohua: ['caoxiancaohua', 'zshy_AAZZcaoxiancaohuaJMGX'],//墟曹宪曹华
    caoxing: ['zshy_AAZZcaoxingMB'],//墟曹性
    caoxiu: ['zshy_AAZZcaoxiuYJCM'],//墟曹休
    caoying: ['zshy_AAZZcaoyingJMGX'],//墟曹婴
    caoyu: ['caoyu', 'zshy_AAZZcaoyu'],//墟曹宇
    caozhang: ['zshy_AAZZcaozhangYJCM'],//墟曹彰
    caozhen: ['zshy_AAZZcaozhenYJCM'],//墟曹真
    caozhi: ['zshy_AAZZcaozhiYJCM', 'zshy_AAZZcaozhiMB'],//墟曹植、墟御曹植
    cenhun: ['zshy_AAZZcenhunYJCM'],//墟岑昏
    cheliji: ['cheliji', 'zshy_AAZZchelijiWDWB', 'zshy_AAZZchelijiMB'],//墟彻里吉
    chendao: ['zshy_AAZZchendaoSHZL'],//墟陈到
    chengjichengcui: ['chengjichengcui', 'zshy_AAZZchengjichengcuiWDWB'],//成济成倅
    chengong: ['zshy_AAZZchengongYJCM'],//墟陈宫
    chengpu: ['zshy_AAZZchengpuYJCM'],//墟程普
    chenqun: ['zshy_AAZZchenqunYJCM'],//墟陈群
    cuilingyi: ['zshy_AAZZcuilingyiMB'],//墟崔令仪
    daqiao: ['zshy_AAZZdaqiaoBZ'],//墟大乔
    dengai: ['zshy_AAZZdengaiSHZL'],//墟邓艾
    dianwei: ['zshy_AAZZdianweiSHZL'],//墟典韦
    diaochan: ['zshy_AAZZdiaochanBZ', 'zshy_AAYAdiaochan'],//墟貂蝉、烬貂蝉
    dongzhuo: ['zshy_AAZZdongzhuoSHZL', 'zshy_AAZZdongzhuoSBFM'],//墟董卓
    dufuren: ['dufuren', 'zshy_AAZZdufurenJMGX'],//墟杜夫人
    duyu: ['zshy_AAZZduyuWDWB', 'zshy_AAZZduyuSJP'],//墟晋杜预、墟群杜预
    fazheng: ['zshy_AAZZfazhengYJCM'],//墟法正
    fuhuanghou: ['zshy_AAZZfuhuanghouYJCM'],//墟伏皇后
    ganning: ['zshy_AAZZganningBZ'],//墟甘宁
    gaoshun: ['zshy_AAZZgaoshunYJCM'],//墟高顺
    gongsunyuan: ['zshy_AAZZgongsunyuanYJCM'],//墟公孙渊
    guanping: ['zshy_AAZZguanpingYJCM'],//墟关平
    guanqiujian: ['zshy_AAZZguanqiujianSHZL'],//墟毌丘俭
    guansuo: ['zshy_AAZZguansuoJMGX'],//墟关索
    guanyinping: ['zshy_AAZZguanyinpingJMGX'],//墟关银屏
    guanyu: ['zshy_AAZZguanyuBZ', 'zshy_AAZZguanyuSP', 'zshy_AAZZguanyuSBFM'],//墟关羽、SP关羽、墟谋关羽
    guanzhang: ['zshy_AAZZguanxingzhangbaoYJCM'],//墟关兴张苞
    guohuai: ['zshy_AAZZguohuaiYJCM'],//墟郭淮
    jin_guohuai: ['zshy_AAZZguohuaiJIN'],//墟郭槐
    guohuanghou: ['zshy_AAZZguohuanghouYJCM'],//墟郭皇后
    guojia: ['zshy_AAZZguojiaBZ', 'zshy_AAYAguojia'],//墟郭嘉、烬郭嘉
    guotufengji: ['zshy_AAZZguotufengjiYJCM'],//墟郭图逢纪
    guyong: ['zshy_AAZZguyongYJCM'],//墟顾雍
    handang: ['zshy_AAZZhandangYJCM'],//墟韩当
    hanhaoshihuan: ['zshy_AAZZhanhaoshihuanYJCM'],//墟韩浩史涣
    haozhao: ['haozhao', 'zshy_AAZZhaozhaoSHZL'],//墟郝昭
    huaman: ['zshy_AAZZhuamanJMGX'],//墟花鬘
    huangfusong: ['zshy_AAZZhuangfusongWMXL'],//墟武皇甫嵩
    huanggai: ['zshy_AAZZhuanggaiBZ'],//墟黄盖
    huanghao: ['zshy_AAZZhuanghaoYJCM'],//墟黄皓
    huangyueying: ['zshy_AAZZhuangyueyingBZ', 'zshy_AAZZhuangyueyingSBFM'],//墟黄月英、墟谋黄月英
    huangzhong: ['zshy_AAZZhuangzhongSHZL'],//墟黄忠
    huangzu: ['zshy_AAZZhuangzuJMGX'],//墟黄祖
    huanshujun: ['huanshujun', 'zshy_AAZZhuanshujun'],//墟环淑君
    huatuo: ['zshy_AAZZhuatuoBZ'],//墟华佗
    huaxin: ['zshy_AAZZhuaxinWDWB'],//墟华歆
    huaxiong: ['zshy_AAZZhuaxiongBZ', 'zshy_AAZZhuaxiongYJCM'],//墟华雄、墟华雄
    jiachong: ['zshy_AAZZjiachongWDWB'],//墟贾充
    jiangwei: ['zshy_AAZZjiangweiSHZL', 'zshy_AAZZjiangweiSP', 'zshy_AAZZjiangweiSBFM'],//墟姜维、墟SP姜维、墟谋姜维
    jianyong: ['zshy_AAZZjianyongYJCM'],//墟简雍
    jiaxu: ['zshy_AAZZjiaxuSHZL', 'zshy_AAZZjiaxuSP', 'zshy_AAYAjiaxu'],//墟贾诩、墟SP贾诩、烬贾诩
    jikang: ['zshy_AAZZjikangYJCM'],//墟嵇康
    yj_jushou: ['zshy_AAZZjushouYJCM'],//墟沮授
    kuailiangkuaiyue: ['kuailiangkuaiyue', 'zshy_AAZZpengliangpengyueSHZL'],//墟蒯良蒯越
    liaohua: ['zshy_AAZZliaohuaYJCM'],//墟廖化
    lijue: ['zshy_AAZZlijueJMGX'],//墟李傕
    lingcao: ['zshy_AAZZlingcao'],//墟凌操
    lingtong: ['zshy_AAZZlingtongYJCM'],//墟凌统
    liubei: ['zshy_AAZZliubeiBZ'],//墟刘备
    liubiao: ['zshy_AAZZliubiaoYJCM'],//墟刘表
    liubian: ['liubian', 'zshy_AAZZliubianJMGX'],//墟刘辩
    liuchen: ['zshy_AAZZliuchenYJCM'],//墟刘谌
    liufeng: ['zshy_AAZZliufengYJCM'],//墟刘封
    liuhui: ['zshy_AAZZliuhuiMB'],//墟刘徽
    liushan: ['zshy_AAZZliushanSHZL'],//墟刘禅
    liuxie: ['zshy_AAZZliuxieJMGX'],//墟刘协
    liuyan: ['zshy_AAZZliuyanJMGX'],//墟刘焉
    liuyu: ['zshy_AAZZliuyuYJCM'],//墟刘虞
    liru: ['zshy_AAZZliruYJCM'],//墟李儒
    lisu: ['zshy_AAZZlisuWDWB'],//墟李肃
    liyan: ['zshy_AAZZliyanYJCM'],//墟李严
    liuzan: ['zshy_AAZZliuzan'],//墟留赞
    luji: ['zshy_AAZZlujiSHZL', `zshy_AAZZlujiWJLS`],//墟陆绩、墟族陆绩
    lujing: ['zshy_AAZZlujingWJLS'],//墟族陆景
    lukang: ['zshy_AAZZlukangSHZL'],//墟陆抗
    luotong: ['zshy_AAZZluotongSJP'],//墟骆统
    re_lusu: ['zshy_AAZZlusuSHZL', 'zshy_AAZZlusuSBFM'],//墟鲁肃
    luxun: ['zshy_AAZZluxunBZ', 'zshy_AAZZluxunWMXL'],//墟陆逊、墟武陆逊
    mb_luyu: ['zshy_AAZZluyuMB'],//墟卢毓
    luyusheng: [`zshy_AAZZluyushengWJLS`],//墟族陆郁生
    luzhi: ['luzhi', 'zshy_AAZZluzhiJMGX'],//墟鲁芝
    yl_luzhi: ['yl_luzhi', 'zshy_AAZZluzhiSHZL'],//墟卢植
    lvbu: ['zshy_AAZZlvbuBZ', 'zshy_AAZZlvbuMO'],//墟吕布、墟魔吕布
    lvlingqi: ['lvlingqi', 'zshy_AAZZlvlingqiJMGX'],//墟吕玲绮
    lvmeng: ['zshy_AAZZlvmengBZ'],//墟吕蒙
    machao: ['zshy_AAZZmachaoBZ', 'zshy_AAZZmachaoSP'],//墟马超、墟SP马超
    madai: ['zshy_AAZZmadaiYJCM'],//墟马岱
    majun: ['zshy_AAZZmajun'],//墟马钧
    maliang: ['zshy_AAZZmaliangJMGX'],//墟马良
    manchong: ['zshy_AAZZmanchongYJCM'],//墟满宠
    masu: ['zshy_AAZZmasuYJCM'],//墟马谡
    menghuo: ['zshy_AAZZmenghuoSHZL'],//墟孟获
    miheng: ['zshy_AAZZmiheng'],//墟祢衡
    ns_xinnanhua: ['zshy_AAZznanhualaoxian'],//墟南华老仙
    panshu: ['zshy_AAZZpanshu'],//墟潘淑
    pangde: ['zshy_AAZZpangdeSHZL'],//墟庞德
    pangdegong: ['zshy_AAZZpangdegong'],//墟庞德公
    pangtong: ['zshy_AAZZpangtongSHZL', 'zshy_AAZZpangtongSP', 'zshy_AAZZpangtongSBFM'],//墟庞统、墟SP庞统
    panzhangmazhong: ['zshy_AAZZpanzhangmazhongYJCM'],//墟潘璋马忠
    pengyang: ['zshy_AAZZpengyangOL'],//墟彭羕
    qinghegongzhu: ['zshy_AAZZqinghegongzhuJMGX'],//墟清河公主
    qinlang: ['zshy_AAZZqinlangOL'],//墟秦朗
    qinmi: ['qinmi', 'zshy_AAZZqinmiYJCM'],//墟秦宓
    quancong: ['zshy_AAZZquancongYJCM'],//墟全琮
    quyi: ['zshy_AAZZquyiJMGX'],//墟麴义
    ruiji: ['zshy_AAZZruiji'],//墟芮姬
    shamoke: ['zshy_AAZZshamokeJMGX'],//墟沙摩柯
    shen_caocao: ['zshy_AAZZshencaocaoSHZL'],//墟神曹操
    shen_caopi: ['zshy_AAZZshencaopiJMGX'],//墟神曹丕
    shen_dengai: ['shen_dengai', 'zshy_AAZZshendengaiJMGX'],//墟神邓艾
    shen_ganning: ['shen_ganning', 'zshy_AAZZshenganningSHZL'],//墟神甘宁
    shen_guanyu: ['zshy_AAZZshenguanyuSHZL'],//墟神关羽
    shen_guojia: ['shen_guojia', 'zshy_AAZZshenguojiaSJP'],//墟神郭嘉
    shen_huangzhong: ['shen_huangzhong', 'zshy_AAZZshenhuangzhongLMGX'],//墟神黄忠
    shen_jiangwei: ['shen_jiangwei', 'zshy_AAZZshenjiangweiJMGX'],//墟神姜维
    shen_liubei: ['zshy_AAZZshenliubeiSHZL'],//墟神刘备
    shen_luxun: ['shen_luxun', 'zshy_AAZZshenluxunSHZL'],//墟神陆逊
    shen_lvbu: ['shen_lvbu', 'zshy_AAZZshenlvbuSHZL'],//墟神吕布
    shen_lvmeng: ['zshy_AAZZshenlvmengSHZL'],//墟神吕蒙
    shen_machao: ['zshy_AAZZshenmachaoJMGX'],//墟神马超
    shen_pangtong: ['shen_pangtong', 'zshy_AAZZshenpangtongJMGX'],//墟神庞统
    shen_simayi: ['zshy_AAZZshensimayiSHZL'],//墟司马懿
    shen_sunce: ['shen_sunce', 'zshy_AAZZshensunceSJP'],//墟神孙策
    shen_taishici: ['shen_taishici', 'zshy_AAZZshentaishiciSJP'],//墟神太史慈
    shen_xunyu: ['shen_xunyu', 'zshy_AAZZshenxunyuSJP'],//墟神荀彧
    shen_xuzhu: ['zshy_AAZZshenxuzhuJMGX'],//墟神许褚
    shen_zhangfei: ['shen_zhangfei', 'zshy_AAZZshenzhangfeiJMGX'],//墟神张飞
    shen_zhaoyun: ['zshy_AAZZshenzhaoyunSHZL', 'zshy_AAYAshenzhaoyun'],//墟神赵云、烬神赵云
    shen_zhangjiao: ['zshy_AAZZshenzhangjiaoJMGX'],//墟神张角
    shen_zhangliao: ['zshy_AAZZshenzhangliaoSHZL'],//墟神张辽
    shen_zhonghui: ['shen_zhonghui', 'zshy_AAZZshenzhonghuiJMGX'],//墟神钟会
    shen_zhouyu: ['shen_zhouyu', 'zshy_AAZZshenzhouyuSHZL'],//墟神周瑜
    shen_zhugeliang: ['shen_zhugeliang', 'zshy_AAZZshenzhugeliangSHZL'],//墟神诸葛亮
    shibao: ['shibao', 'zshy_AAZZshibaoWDWB'],//墟石苞
    shichangshi: ['zshy_AAZZshichangshi'],//墟十常侍
    simahui: ['zshy_AAZZsimahuiJMGX'],//墟司马徽
    simashi: ['zshy_AAZZsimashi', 'zshy_AAZZsimashiWDWB'],//墟司马师
    simayi: ['zshy_AAZZsimayiBZ', 'zshy_AAZZsimayiWDWB'],//墟司马懿、墟晋司马懿
    simazhao: ['simazhao', 'zshy_AAZZsimazhaoWDWB', 'zshy_AAZZsimazhaoLXXH', 'zshy_AAZZsimazhaoLXXH_shadow'],//墟晋司马昭、墟魏司马昭
    simazhou: ['zshy_AAZZsimazhouWDWB'],//墟司马伷
    sunce: ['zshy_AAZZsunceSHZL'],//墟孙策
    sunchen: ['sunchen', 'zshy_AAZZsunchenJMGX'],//墟孙綝
    sundeng: ['zshy_AAZZsundengYJCM'],//墟孙登
    sunhao: ['sunhao', 'zshy_AAZZsunhaoJMGX'],//墟孙皓
    sunhanhua: ['zshy_AAZZsunhanhua'],//墟孙寒华
    sunjian: ['zshy_AAZZsunjianSHZL', 'zshy_AAZZsunjianSBFM'],//墟孙坚、墟谋孙坚
    sunliang: ['zshy_AAZZsunliangSHZL'],//墟孙亮
    sunluban: ['zshy_AAZZsunlubanYJCM'],//墟孙鲁班
    sunquan: ['zshy_AAZZsunquanBZ'],//墟孙权
    sunru: ['zshy_AAZZsunru'],//墟孙茹
    sunshangxiang: ['zshy_AAZZsunshangxiangBZ', 'zshy_AAZZsunshangxiangSP'],//墟孙尚香、墟SP孙尚香
    sunxiu: ['zshy_AAZZsunxiuYJCM'],//墟孙休
    sunyi: ['sunyi', 'zshy_AAZZsunyiJMGX'],//墟孙翊
    sunziliufang: ['zshy_AAZZsunziliufangYJCM'],//墟孙资刘放
    taishici: ['zshy_AAZZtaishiciSHZL'],//墟太史慈
    wangji: ['wangji', 'zshy_AAZZwangjiSHZL'],//墟王基
    wangping: ['wangping', 'zshy_AAZZwangpingSHZL'],//墟王平
    wangxiang: ['wangxiang', 'zshy_AAZZwangxiangWDWB'],//墟王祥
    wangyi: ['zshy_AAZZwangyiYJCM'],//墟王异
    wangyuanji: ['zshy_AAZZwangyuanjiWDWB'],//墟王元姬
    weiguan: ['weiguan', 'zshy_AAZZweiguanWDWB'],//墟卫瓘
    weiyan: ['zshy_AAZZweiyanSHZL', 'zshy_AAZZweiyanBSP'],//墟魏延、墟势魏延
    wenyang: ['zshy_AAZZwenyangJMGX', 'zshy_AAZZwenyangSJP'],//墟文鸯
    wenyuan: ['wenyuan', 'zshy_AAZZwenyuanJMGX'],//墟文鸳
    wolongfengchu: ['wolongfengchu', 'zshy_AAZZwolongfengchuJMGX'],//墟卧龙凤雏
    wuban: ['zshy_AAZZwubanCLWS'],//墟族吴班
    wuguotai: ['zshy_AAZZwuguotaiYJCM'],//墟吴国太
    wuxian: ['zshy_AAZZwuxianYJCM', 'zshy_AAZZwuxianCLWS'],//墟吴苋、墟族吴苋
    wuyi: ['zshy_AAZZwuyiYJCM'],//墟吴懿
    xiahouba: ['zshy_AAZZxiahoubaJMGX'],//墟夏侯霸
    xiahoudun: ['zshy_AAZZxiahoudunBZ'],//墟夏侯惇
    jin_xiahouhui: ['zshy_AAZZxiahouhuiWDWB'],//墟夏侯徽
    xiahoushi: ['zshy_AAZZxiahoushiYJCM'],//墟夏侯氏
    xiahouyuan: ['zshy_AAZZxiahouyuanSHZL'],//墟夏侯渊
    xiaoqiao: ['zshy_AAZZxiaoqiaoSHZL', 'zshy_AAZZxiaoqiaoSBFM'],//墟小乔、墟谋小乔
    xinchang: ['xinchang', 'zshy_AAZZxinchangWDWB'],//墟辛敞
    xinxianying: ['zshy_AAZZxinxianyingYJCM'],//墟辛宪英
    xizhicai: ['xizhicai', 'zshy_AAZZxizhicaiJMGX'],//墟戏志才
    xuangongzhu: ['zshy_AAZZxuangongzhuWDWB'],//墟宣公主
    xuezong: ['zshy_AAZZxuezongYJCM'],//墟薛综
    xuhuang: ['zshy_AAZZxuhuangSHZL'],//墟徐晃
    clan_xuncai: ['clan_xuncai', 'zshy_AAZZxuncaiYCXS'],//墟族荀采
    clan_xuncan: ['clan_xuncan', 'zshy_AAZZxuncanYCXS'],//墟族荀璨
    xunchen: ['zshy_AAZZxunchenYCXS'],//墟族荀谌
    clan_xunshi: ['clan_xunshi', 'zshy_AAZZxunshiYCXS'],//族荀莳
    clan_xunshu: ['clan_xunshu', 'zshy_AAZZxunshuYCXS'],//墟族荀淑
    xunyou: ['zshy_AAZZxunyouYJCM', 'zshy_AAZZxunyouYCXS'],//墟荀攸、墟族荀攸
    xunyu: ['zshy_AAZZxunyuSHZL'],//墟荀彧
    xurong: ['xurong', 'zshy_AAZZxurongJMGX'],//墟徐荣
    xushao: ['zshy_AAZZxushaoJMGX'],//墟许劭
    xusheng: ['zshy_AAZZxushengYJCM'],//墟徐盛
    xushi: ['xushi', 'zshy_AAZZxushiYJCM'],//墟徐氏
    xushu: ['zshy_AAZZxushuYJCM'],//墟徐庶
    xuyou: ['zshy_AAZZxuyouSHZL'],//墟许攸
    xuzhu: ['zshy_AAZZxuzhuBZ'],//墟许褚
    jin_yanghu: ['zshy_AAZZyanghuJIN'],//墟羊祜
    yanghuiyu: ['zshy_AAZZyanghuiyuWDWB'],//墟羊徽瑜
    yangyan: ['zshy_AAZZyangyanWDWB'],//墟杨艳
    yangyi: ['zshy_AAZZyangyiJMGX'],//墟杨仪
    yangzhi: ['zshy_AAZZyangzhiWDWB'],//墟杨芷
    yanwen: ['zshy_AAZZyanliangwenchouSHZL'],//墟颜良文丑
    yanyan: ['yanyan', 'zshy_AAZZyanyanSHZL'],//墟严颜
    re_yuanshao: ['zshy_AAZZyuanshaoSHZL'],//墟袁绍
    yuanshu: ['zshy_AAZZyuanshuBZ', 'zshy_AAZZyuanshuSHZL'],//墟袁术、墟SP袁术
    yufan: ['zshy_AAZZyufanYJCM'],//墟虞翻
    yuji: ['zshy_AAZZyujiSHZL'],//墟于吉
    yujin: ['zshy_AAZZyujinYJCM'],//墟于禁
    zhangchunhua: ['zshy_AAZZzhangchunhuaYJCM', 'zshy_AAZZzhangchunhuaWDWB'],//墟魏张春华、墟晋张春华
    zhangfei: ['zshy_AAZZzhangfeiBZ'],//墟张飞
    zhangfen: ['zshy_AAZZzhangfenMB'],//墟张奋
    zhanghe: ['zshy_AAZZzhangheSHZL', 'zshy_AAZZzhangheSP'],//墟张郃、墟SP张郃
    zhanghua: ['zhanghua', 'zshy_AAZZzhanghuaJMGX'],//墟张华
    zhanghuyuechen: ['zhanghuyuechen', 'zshy_AAZZzhanghuyuechenWDWB'],//墟张虎乐綝
    zhangjiao: ['zshy_AAZZzhangjiaoSHZL'],//墟张角
    zhangliao: ['zshy_AAZZzhangliaoBZ'],//墟张辽
    zhangling: ['zhangling', 'zshy_AAZZzhanglingJMGX'],//墟张陵
    zhangrang: ['zshy_AAZZzhangrangYJCM'],//墟张让
    zhangsong: ['zshy_AAZZzhangsongYJCM'],//墟张松
    zhangxingcai: ['zhangxingcai', 'zshy_AAZZzhangxingcaiJMGX'],//墟张星彩
    zhangxiu: ['zshy_AAZZzhangxiuSHZL'],//墟张绣
    zhangyi: ['zshy_AAZZzhangyiYJCM'],//墟张嶷
    zhangyu: [`zshy_AAZZzhangyuJMGX`],//墟张裕
    zhangzhang: ['zhangzhang', 'zshy_AAZZzhangzhaozhanghongSHZL'],//墟张昭张纮
    zhangzhi: ['zshy_AAZZzhangzhiMB'],//墟张芝
    zhaoxiang: ['zshy_AAZZzhaoxiangJMGX'],//墟赵襄
    zhaoyun: ['zshy_AAZZzhaoyunBZ', 'zshy_AAZZzhaoyunSP'],//墟赵云、墟SP赵云
    zhenji: ['zshy_AAZZzhenjiBZ'],//墟甄姬
    zhengxuan: ['zshy_AAZZzhengxuan'],//墟郑玄
    zhonghui: ['zshy_AAZZzhonghuiYJCM', 'zshy_AAZZzhonghuiYCZS', 'zshy_AAZZzhonghuiBSP', 'zshy_AAYAzhonghui'],//墟钟会、墟族钟会、墟势钟会、烬钟会
    zhongyan: ['zhongyan', 'zshy_AAZZzhongyanWDWB', 'zshy_AAZZzhongyanYCZS'],//墟钟琰、墟族钟琰
    zhongyao: ['zshy_AAZZzhongyaoYJCM', 'zshy_AAZZzhongyaoYCZS'],//墟钟繇、墟族钟繇
    clan_zhongyu: ['clan_zhongyu', 'zshy_AAZZzhongyuYCZS', 'zshy_AAZZzhongyuJMGX'],//墟族钟毓、墟钟毓
    zhoucang: ['zshy_AAZZzhoucangYJCM'],//墟周仓
    zhouchu: ['zshy_AAZZzhouchuJMGX', 'zshy_AAZZzhouchuSJP'],//墟晋周处、墟吴周处
    zhoufei: ['zshy_AAZZzhoufeiSHZL'],//墟周妃
    zhoutai: ['zshy_AAZZzhoutaiSHZL'],//墟周泰
    zhouyu: ['zshy_AAZZzhouyuBZ', 'zshy_AAZZzhouyuMB', 'zshy_AAZZzhouyuBSP'],//墟周瑜、墟乐周瑜、墟势周瑜
    zhugedan: ['zshy_AAZZzhugedanJMGX'],//墟诸葛诞
    zhugeguo: ['zshy_AAZZzhugeguoJMGX'],//诸葛果
    zhugejin: ['zshy_AAZZzhugejinJMGX'],//墟诸葛瑾
    zhugeliang: ['zshy_AAZZzhugeliangBZ', 'zshy_AAZZzhugeliangSBFM', 'zshy_AAZZzhugeliangWMXL'],//墟诸葛亮、墟谋诸葛亮、墟武诸葛亮
    sp_zhugeliang: ['zshy_AAZZwolongzhugeliangSHZL', 'zshy_AAYAwolongzhugeliang'],//墟卧龙、烬卧龙
    zhugezhan: ['zshy_AAZZzhugezhanSHZL'],//墟诸葛瞻
    zhuhuan: ['zshy_AAZZzhuhuanYJCM'],//墟朱桓
    zhuji: ['zshy_AAZZzhuji'],//墟朱绩
    zhuran: ['zshy_AAZZzhuranYJCM'],//墟朱然
    zhurong: ['zshy_AAZZzhurongSHZL'],//墟祝融
    zhuzhi: ['zshy_AAZZzhuzhiYJCM'],//墟朱治
    zuoci: ['zshy_AAZZzuociSHZL', 'zshy_AAYAzuoci'],//墟左慈、烬左慈
};
export default characterReplace;
