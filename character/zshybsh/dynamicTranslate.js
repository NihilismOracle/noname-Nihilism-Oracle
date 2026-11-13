import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
const dynamicTranslate = {

    zshy_kechang(player) {
        if (!player.storage.zshy_yunan) return '【主公技||锁定技】<li>群势力角色使用【杀】无距离限制。';
        return '【主公技||锁定技】<li>群势力角色使用【杀】无距离限制；你使用的【杀】不可被响应。';
    },
};
export default dynamicTranslate;
