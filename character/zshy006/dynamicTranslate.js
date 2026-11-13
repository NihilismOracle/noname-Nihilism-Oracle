import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
const dynamicTranslate = {
    zshy_zhijue(player) {
        const bool = player.storage.zshy_zhijue;
        let yang = '出牌阶段，你可将牌堆顶的一张牌当【火攻】使用',
            yin = '将一种颜色的手牌置入弃牌堆，然后可视为使用其中一张基本牌或普通锦囊牌';
        if (bool) {
            yin = `<span class='bluetext'>${yin}</span>`;
        } else {
            yang = `<span class='firetext'>${yang}</span>`;
        }
        let start = '转换技，',
            end = '。若你以此法未造成伤害，你令〖知天〗可见牌与观看牌数-1（至少减至1），然后你摸两张牌。';
        return `${start}阳：${yang}；阴：${yin}${end}`;
    },
    zshy_lixian(player) {
        let str = ``;
        let names = player.getStorage('zshy_lixian_names')
            .map((name, i, arr) => `${i == arr.length - 1 ? "或" : "、"}【${get.translation(name)}】`)
            .join('') || '';
        let triggers = player.getStorage('zshy_lixian_triggers')
            .map(i => get.translation(i))
            .join('、') + '或';
        if (triggers.length < 2) {
            triggers = '';
        } else {
            str += `一名角色的`;
        }
        return str + `${triggers}当一名角色受到伤害后，你可将一张牌当【无中生有】${names}使用，然后你回复1点体力或摸一张牌。当你以此法使用过三种不同牌名的锦囊牌后，此技能于一名角色的结束阶段也可发动。`;
    },

};
export default dynamicTranslate;
