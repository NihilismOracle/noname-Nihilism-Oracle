import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
const dynamicTranslate = {
    zshy_guangu(player) {
        const bool = player.storage.zshy_guangu;
        let yang = '你可以观看牌堆顶的至多四张牌',
            yin = '你可以观看一名角色的至多四张手牌';
        if (bool) {
            yin = `<span class='bluetext'>${yin}</span>`;
        } else {
            yang = `<span class='firetext'>${yang}</span>`;
        }
        let start = '【转换技】<li>出牌阶段：',
            end = '，然后你可以使用其中的一张牌。';
        return `${start}阳，${yang}；阴，${yin}${end}`;
    },

};
export default dynamicTranslate;
