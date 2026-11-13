import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
const voiceRaw = {
    'zshy_AAZZzhonghuiBSP:die': '此谋虽败，亦远胜屈膝他人！',
    zshy_sizi1:  '昔韩信暗度陈仓，乃定三秦之地。',
    zshy_sizi2:  '公命同乘，何以弃我而去？',
    zshy_sizi3:  '公无忧天下，顾以康为虑耳。',
    zshy_sizi4:  '忍辱负重，只为今朝问鼎。',
    zshy_sizi5:  '晋公既疑我，吾等亦当早决。',
    zshy_sizi6:  '德彰功显，取之何愧？',
    zshy_sizi7:  '今吾大军十万，岂惧蜀道之险？',
    zshy_xiezhi1:  '姜维降我而非降魏，此即天命所归！',
    zshy_xiezhi2:  '西蜀沃野千里，何故思归魏阙？',
    zshy_yunan1:  '纵有子房之谋，亦难逃谗言重伤。',
    zshy_yunan2:  '司马氏心狠手毒，不可同甘，只可共苦。',
    zshy_yunan3:  '此生如履薄冰，一朝蹙则万劫不复。',
    zshy_yunan4:  '而今功高震主，岂可坐待其祸？',
    zshy_kechang1:  '假使天命在魏，何使司马专权？',
    zshy_kechang2:  '晋公皆赖我计，何不可谋而自立？',
    zshy_kechang_rewrite1:  '假使天命在魏，何使司马专权？',
    zshy_kechang_rewrite2:  '晋公皆赖我计，何不可谋而自立？',

    'zshy_AAZZweiyanBSP:die': '志为大汉献身，纵死又有何恨。',
    'zshy_AAZZweiyanBSP1:die': '战死沙场故为快事，且待来生看大汉兴复……',
    'zshy_AAZZweiyanBSP2:die': '无怨小人构陷，只恨主公雄志未成……',
    zshy_zhuangshi1:  '若魏寇将十万之众，延当为主公尽歼。',
    zshy_zhuangshi2:  '纵曹贼举天下进犯，延亦可勠力拒退。',
    zshy_zhuangshi_zshy_AAZZweiyanBSP_11:  '丞相无需多虑，我定能轻身立功。',
    zshy_zhuangshi_zshy_AAZZweiyanBSP_12:  '夏侯楙怯而无谋，有何计议之需？',
    zshy_yinzhan1:  '征战沙场，实乃平生快事。',
    zshy_yinzhan2:  '为主破敌，如鱼饮水。',
    zshy_yinzhan3:  '魏文长在此，尔辈何敢乃尔！',
    zshy_yinzhan_zshy_AAZZweiyanBSP_11:  '既遇我魏延，休再妄想生还。',
    zshy_yinzhan_zshy_AAZZweiyanBSP_12:  '敢阻我锋芒，自是要丢盔弃甲。',
    zshy_yinzhan_zshy_AAZZweiyanBSP_13:  '强敌我斩，坚甲我摧！',
    zshy_yinzhan_zshy_AAZZweiyanBSP_21:  '宁战死沙场，绝不弃甲而降！',
    zshy_yinzhan_zshy_AAZZweiyanBSP_22:  '纵士少兵疲，亦可杀出重围！',
    zshy_yinzhan_zshy_AAZZweiyanBSP_23:  '战事何计兵将多寡？且看心怀之气！',
    zshy_zhongao1:  '主公有延助力，何忧汉室难兴！',
    zshy_zhongao2:  '此番斩将得胜，只是连捷之始！',
    zshy_zhongao3:  '此身搏杀不懈，只为成主公之业！',
    zshy_zhongao4:  '一时得失何须挂怀，自有再建功业之机！',
    zshy_zhongao5:  '吾身无需担忧，诸位还当奋进。',
    zshy_SWYkuanggu1:  '曹贼吴犬，我有何惧哉？',
    zshy_SWYkuanggu2:  '我尚未全力一搏，又试问谁能阻挡？',
    zshy_SWYkuanggu_zshy_AAZZweiyanBSP_21:  '趁此番小胜，再图一雪前耻。',
    zshy_SWYkuanggu_zshy_AAZZweiyanBSP_22:  '我自当率军击贼，岂可为断后之将！',
    zshy_SWYkuanggu_skill21:  '饮罢贼血，看我再立功绩。',
    zshy_SWYkuanggu_skill22:  '与我为敌，是汝等最大的不幸。',
    zshy_SWYkuanggu_skill23:  '贼寇尚未尽勠，我岂会还营？',
    zshy_SWYkuanggu_skill24:  '可还有强敌，能让我浅尝一败？',
    zshy_SWYkunfen1:  '身承主公深信，岂可为小挫所扰。',
    zshy_SWYkunfen2:  '前路既艰，更须倍道而行！',
};
function getVoice(obj) {
    const result = {};
    for (const key in obj) {
        result[`#ext:诸神寰宇/audio/character/${key.replace('#', '')}`] = obj[key];
    }
    return result;
}
const voice = getVoice(voiceRaw);
export default voice;