import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
const 百战虎贲 = {
    'zshy_AAZZwenyangJMGX:die': '百年一遇文次骞，千古艰难寿春城。',
    zshy_lvli1:  '以战养战，所向披靡！',
    zshy_lvli2:  '战不旋踵，横扫千军！',
    zshy_WYchoujue1:  '国仇未报，奋决死之意、执无生继前！',
    zshy_WYchoujue2:  '家恨当雪，提三尺之剑、斩宵小仇雠！',
    zshy_beishui1:  '背水立阵仿韩信，破釜沉舟学霸王！',
    zshy_beishui2:  '将抱必死之心，士无偷生之意！',
    zshy_qingjiao1:  '此战，不成功，便成仁！',
    zshy_qingjiao2:  '狭路相逢，勇进者胜，怯战者亡！',

};
const 武庙 = {
    'zshy_AAZZhuangfusongWMXL:die': `此心向汉，罪复何言。`,
    zshy_chaozhen1:  '青锋出鞘，唤起金乌啼，且以剑光洗长天。',
    zshy_chaozhen2:  '嵩有命，欲投之于渊，如石激水，惊赤螭于长眠。',
    zshy_lianjie1:  '千军犁庭，定一十五州、夷三十六方。',
    zshy_lianjie2:  '潜夜勒兵，鸡鸣驰阵，不破敌军，誓不回转！',
    zshy_jiangxian1:  '沙场百战，忆龙城飞将，万骑长驱玉门关。',
    zshy_jiangxian2:  `士有其心，饲鹿非射，当止天下倒悬。`,

    'zshy_AAZZluxunWMXL:die': '清翠白鹿隐，寻踪不知归。',
    zshy_xiongmu1:  '天下扰扰，英雄欲定乾坤，非一人之力可成。',
    zshy_xiongmu2:  '子衿乘风，欲访东翁，仿青梅煮酒，论天下英雄。',
    zshy_zhangcai1:  '何日试青锋？匣中长剑夜夜鸣。',
    zshy_zhangcai2:  '江东山河甫定，正乃用武之时。',
    zshy_ruxian1:  '辅君以礼，匡国以行，泽民以仁，此为大道。',
    zshy_ruxian2:  '万卷书，千里路，文如引帆之风，可至梦日之处。',

    'zshy_AAZZzhugeliangWMXL:die': '一别隆中三十载，归来犹唱梁甫吟。',
    zshy_jincui1:  '此身抱薪，可付丹鼎，五十四年春秋昭炎汉长明。',
    zshy_jincui2:  '南征北伐，誓还旧都，二十四代王业不偏安一隅。',
    zshy_qingshi1:  '平二川，定三足，恍惚草堂梦里，挥斥千古风流。',
    zshy_qingshi2:  '战群儒，守空城，今摆乱石八阵，笑谈将军死生。',
    zshy_zhizhe1:  '三顾之谊铭心，隆中之言在耳，请托臣讨贼兴复之效。',
    zshy_zhizhe2:  '著大义于四海，揽天下之弼士，诚如是，则汉室可兴。',

};

let origintaici = {
    ...百战虎贲, ...武庙,
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
