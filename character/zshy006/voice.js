import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
const 谋定天下 = {
    'zshy_AAZZjiangweiSBFM:die': `戏罢人散，谁记当年风流。`,
    zshy_zhuri1:  `三尺台上释千古，一曲谱半生，影随光而行。`,
    zshy_zhuri2:  `影绎当年蹉跎，戏如人生，几声锣鼓惊春风。`,
    zshy_ranji1:  `秉笔客书江湖事，执灯叟照当年人。`,
    zshy_ranji2:  `皮影话峥嵘，千古兴亡事，一杯浊酒中。`,
    zshy_kunfen_zshy_AAZZjiangweiSBFM1:  `金丝银线缚将军，戏外人笑戏中臣。`,
    zshy_zhaxiang_zshy_AAZZjiangweiSBFM1:  `鞞鼓动帷幕，二三哨声可当万马千军。`,

    'zshy_AAZZlusuSBFM:die': `利来利往，黄泉路上熙攘……`,
    zshy_duduan1:  `图高帝之业，观曹操凶衅，不患贫而患不安。`,
    zshy_duduan2:  `坐东南吴会，望九州离乱，不患寡而患不均。`,
    zshy_yinglve1:  `商人趋利，察，虽万难必蹈。`,
    zshy_yinglve2:  `商人择良，用，虽一布必慎。`,
    zshy_mengshi1:  `盟堪市肆，近宅兴家，醉宾客而能贵东主。`,
    zshy_mengshi2:  `势如明渠，决川距海，活支流然尽注五湖。`,

    'zshy_AAZZpangtongSBFM:die': `风雨折锦绣，凤雏葬凤坡。`,
    zshy_hongtu1:  `才为针，学为线，绣山河于九州。`,
    zshy_hongtu2:  `风缀彩，雨释墨，绘锦绣于四海。`,
    zshy_qiwu1:  `方寸锦绣作凤巢，可避八方风雨。`,
    zshy_qiwu2:  `我以金丝绣梧桐，凤可来栖。`,

    'zshy_AAZZzhugeliangSBFM:die': `莫问古今兴废事，待从头，仍赴天下计。`,
    zshy_zhitian1:  `复汉祚以彰王道，取天下而定苍生。`,
    zshy_zhitian2:  `因一叶而知秋，遇一仁主则知三百年治世。`,
    zshy_wujing1:  `金戈铁马起征鼓，几度春秋，壮志仍峥嵘。`,
    zshy_wujing2:  `戎马驱驰忘此身，生死疲劳，难报故人意。`,
    zshy_zhijue1:  `鞭弭周旋，旌旗麾动，坐却汉贼风靡。`,
    zshy_zhijue2:  `独上城楼复鼓琴，振袖退虎狼。`,

};
const 武动乾坤 = {
    'zshy_AAZZdongzhuoSBFM:die': `庸奴！汝，好大的胆子！`,
    zshy_guanbian1:  `待尔等拼个你死我活，老夫再来得这渔翁之利。`,
    zshy_guanbian2:  `把酒稳坐芒砀山，暂观两虎斗云台！`,
    zshy_xiongni1:  `匹夫！吃我的、喝我的，还要造我的反！`,
    zshy_xiongni2:  `老夫让你死，天王老子也救不下！`,
    zshy_fengshang1:  `乱世之中，孤掌难鸣，何不与我共挥权柄！`,
    zshy_fengshang2:  `识时务者为俊杰，这些金银珠宝，折不了谁的腰？`,
    zshy_zhibing1:  `尔等匹夫居万人之上？呵呵，吾居万万人之上！`,
    zshy_zhibing2:  `这天下，只有一个人能呼风唤雨！那便是我董卓！`,

    'zshy_AAZZguanyuSBFM:die': `玉碎不改白，竹焚不毁节。`,
    zshy_weilin1:  `汝等鼠辈，岂敢与某相抗！`,
    zshy_weilin2:  `义襄千里，威震华夏！`,
    zshy_duoshou1:  `今日之敌，必死于我刀下！`,
    zshy_duoshou2:  `青龙所向，战无不胜！`,

};
const 花好月圆 = {
    'zshy_AAZZhuangyueyingSBFM:die': `春风又绿隆中，我夫何时归还？`,
    zshy_lixian1:  `夫君心怀天下，我则心系夫君。`,
    zshy_lixian2:  `愿为夫君添羽翼，共赴青云展雄心。`,
    zshy_bingcai1:  `夫君智计无双，我心亦怀锦绣。`,
    zshy_bingcai2:  `世人机关算尽，亦不及你我心有灵犀。`,

    'zshy_AAZZxiaoqiaoSBFM:die': `吴丝觉桂茂，远来归寒兔……`,
    zshy_miluo1:  `香积路上人如织，伞下又逢君。`,
    zshy_miluo2:  `昨日别君星落雨，桂子松花香。`,
    zshy_MXQjueyan1:  `红绡渡，鸥鹭惊飞，弦动归帆下。`,
    zshy_MXQjueyan2:  `檐下听更漏，微揎翠袖，牵红绡。`,

};
const 计出万全 = {
};
const 施仁布德 = {
};
const 奋勇扬威 = {
    'zshy_AAZZsunjianSBFM:die': `虎啸江东今归野，后人不见乌程侯。`,
    zshy_hulie1:  `剑有双刃，福祸相依，既享其功，又何惧其损。`,
    zshy_hulie2:  `战有所殆，木强则折，孙坚岂惧战作态之人。`,
    zshy_yipo1:  `精卫赴海，夸父逐日，其身虽死而毅魂长存。`,
    zshy_yipo2:  `壮士解腕，身泽万里，纵斧钺加颈亦何改珠颜。`,

};
const 达权通变 = {
};

let origintaici = {
    ...谋定天下, ...武动乾坤, ...花好月圆, ...计出万全, ...施仁布德, ...奋勇扬威, ...达权通变,
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
