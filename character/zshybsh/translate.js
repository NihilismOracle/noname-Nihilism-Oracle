import { lib, game, ui, get, ai, _status } from '../../../../noname.js';

const translate = {
    zshy_AAZZzhouyuBSP: '墟势周瑜',
    zshy_chiyun: '炽沄',
    zshy_chiyun_info:  `蓄力技。（4/∞）当你获得牌后，你可以将任意张手牌交给任意名其他角色。若如此做，你选择一项：1.对任意名因此技能获得过牌的角色各造成1点火焰伤害（展示其所有与这些牌颜色相同的手牌）；2.你回复1点体力或摸两张牌，然后令这些角色横置。最后你获得1点蓄力点。`,
    zshy_yanhui: '焰洄',
    zshy_yanhui_info:  `当你使用牌指定其他角色为目标后，你可以展示目标角色的一张手牌。若此牌不为本回合第一次被展示，你可以弃置之；若此牌为本回合第一次被展示，你可以消耗1点蓄力点，令此牌改为不为本回合第一次被展示。然后你选择一项：1.对任意名因此技能弃置过牌的角色造成1点火焰伤害；2.回复1点体力或摸X张牌（X为本回合已展示过牌的角色数）。若你本阶段消耗过蓄力点发动此技能，你可以改为依次执行两项。`,
    zshy_fentao: '焚涛',
    zshy_fentao_info:  `锁定技。当一名其他角色受到火焰伤害时，其选择一项：1.令本次伤害值+1；2.令其弃置一半的牌（向上取整），然后此伤害结算完毕后，令其横置。然后你获得1点蓄力点。`,
    zshy_xiongzi: '雄姿',
    zshy_xiongzi_info:  `限定技。准备阶段，你可以选择一项：1.令本局游戏中你的〖炽沄〗〖焰洄〗〖焚涛〗仅保留选项一，然后获得〖燎〗；2.令本局游戏中你的〖炽沄〗〖焰洄〗〖焚涛〗仅保留选项二，然后获得〖涤〗。然后你摸两张牌，将蓄力点增加4点。`,
    zshy_xiongzi_liao: '燎',
    zshy_xiongzi_liao_info:  '当你造成火焰伤害后，你回复1点体力或摸一张牌。',
    zshy_xiongzi_di: '涤',
    zshy_xiongzi_di_info:  '你造成的火焰伤害+1。',

    //墟势钟会
    zshy_AAZZzhonghuiBSP: '墟势钟会',
    zshy_sizi: '肆恣',
    zshy_sizi_info:  `蓄力技。（4/∞）出牌阶段限一次，你可消耗至多四个蓄力点，令从此回合开始的等量个回合，执行以下效果（你的回合开始时，这些效果失效）：1.所有角色使用【杀】造成的伤害+1；2.每个回合结束时，本回合内使用过【杀】的角色失去1点体力，你摸两张牌。若你消耗的蓄力点大于你的体力值，执行一个额外效果：每个回合结束时，若本回合未有角色使用过【杀】，你与当前回合角色各失去1点体力。`,
    zshy_xiezhi: '挟志',
    zshy_xiezhi_info:  '锁定技。当你<span class=thundertext>体力值变化</span>/<span class=firetext>造成伤害</span>后，你获得X点蓄力点（X为<span class=thundertext>本次变化值</span>/<span class=firetext>造成伤害值</span>）并摸等量牌。若已有蓄力点大于4，你的手牌上限与使用【杀】的次数永久+1。',
    zshy_yunan: '迂难',
    zshy_yunan_info:  `觉醒技。当你令一名角色进入濒死状态时，你获得${get.poptip("zshy_kechang")}，已有则改为升级${get.poptip({
        id: "zshy_yunan_zshy_kechang",
        name: "〖克昌〗",
        type: "character",
        info: "主公技，锁定技。群势力角色使用【杀】无距离限制；你使用的【杀】不可被响应。",
    })}。`,
    zshy_kechang: '克昌',
    zshy_kechang_info:  '【主公技||锁定技】群势力角色使用【杀】无距离限制。',
    zshy_kechang_rewrite: '克昌·二级',
    get zshy_kechang_rewrite_info() {
        return lib.poptip.getInfo('zshy_yunan_zshy_kechang');
    },

    //墟势魏延
    zshy_AAZZweiyanBSP: '墟势魏延',
    zshy_zhuangshi: '壮誓', zshy_zhuangshi_tag: '壮誓',
    zshy_zhuangshi_info:  '出牌阶段开始时，你可执行任意项：1.重铸任意张手牌，令你此阶段使用的前等量张牌无距离限制且不可被响应；2.失去任意点体力并获得等量护甲，令你此阶段使用的前等量张牌不计入次数限制。',
    zshy_yinzhan: '饮战',
    zshy_yinzhan_info:  `锁定技。你对一名角色造成伤害时，若：1.你的体力值不大于其，此伤害+1；2.你的牌数不大于其，你于此【杀】结算结束后弃置其一张牌；乘势：你回复1点体力，获得其弃置的牌。`,
    zshy_zhongao: '忠傲',
    zshy_zhongao_info:  '使命技。游戏开始时，你获得〖狂骨〗。①成功：你杀死一名角色后，升级〖狂骨〗，然后若你本阶段使用的牌数：小于因〖壮誓〗弃置的牌数，摸一张牌；小于因〖壮誓〗失去的体力值，回复1点体力（体力值已满则改为摸一张牌）。②失败：你进入濒死，或你未于出牌阶段开始时执行〖壮誓〗，失去〖壮誓〗并获得〖困奋〗。',
    zshy_SWYkuanggu_skill1: '狂骨',
    zshy_SWYkuanggu_skill1_info:  '当你对一名角色造成1点伤害后，可选择一项：1.回复1点体力；2.摸一张牌。',
    zshy_SWYkuanggu_skill2: '狂骨·二级',
    zshy_SWYkuanggu_skill2_info:  `你对一名角色造成1点伤害后，可选择一项：1.回复1点体力；2.摸一张牌；3.背水：令你此阶段使用【杀】的次数+1。`,
    zshy_SWYkunfen: '困奋',
    zshy_SWYkunfen_info:  '锁定技。你的结束阶段开始时，你失去1点体力，然后摸三张牌。',
};

export default translate;
