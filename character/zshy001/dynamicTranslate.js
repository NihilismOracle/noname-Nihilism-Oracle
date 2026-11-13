import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
const dynamicTranslate = {
    zshy_kunfen(player) {
        if (!player.storage.zshy_kunfen) return '【锁定技】<li>一名角色结束阶段开始时，你失去1点体力，然后摸两张牌。';
        return '【锁定技】<li>一名角色结束阶段开始时，你回复1点体力，然后摸一张牌。';
    },

};
export default dynamicTranslate;
