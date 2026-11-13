import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
const card = {
    zshy_huntianyi: {
        fullskin: true,
        type: 'equip',
        subtype: 'equip5',
        derivation: 'zshy_AAZZlujiWJLS',
        cardcolor: 'diamond',
        ai: {
            order: 9.5,
            equipValue(card, player) {
                if (player.hp <= 1) return 5;
                if (player.hp == 2) return 3;
                // 防止一次伤害与失去装备的收益，在高体力时也有价值。
                return 2;
            },
            basic: {
                equipValue: 2,
            },
        },
        onLose() {
            player.addTempSkill('zshy_huntianyi_skill_lose');
            if (event.getParent(2)?.name == 'zshy_huntianyi_skill') {
                cards.forEach(card => {
                    card.fix();
                    card.remove();
                    card.destroyed = true;
                    game.log(card, '被销毁了');
                });
            }
        },
        skills: ['zshy_huntianyi_skill'],
    },

};
export default card;
