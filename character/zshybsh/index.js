/**
 * 诸神寰宇 · 兵势篇（zshybsh）武将包入口
 * 包注册、武将名前缀补全、扩展配置项初始化；
 * 武将数据在 character.js，技能在 skill.js，翻译在 translate.js。
 */
import { lib, game, ui, get, ai, _status } from '../../../../noname.js'
import { characters } from './character.js'
import { characterSort, characterSortTranslate } from './sort.js'
import characterTitle from './characterTitle.js'
import dynamicTranslate from './dynamicTranslate.js'
import characterIntro from './intro.js'
import characterReplace from '../characterReplace.js'
import characterSubstitute from './characterSubstitute.js'
import card from './card.js'
import skill from './skill.js'
import translate from './translate.js'
import voice from './voice.js'
import pinyins from './pinyins.js'

game.import('character', function () {
    const zshy_AH = {
        name: 'zshy_AH',
        connect: false,
        character: characters,
        characterSort: {
            zshy_AH: { ...characterSort },
        },
        characterTitle: characterTitle,
        dynamicTranslate: dynamicTranslate,
        characterIntro: characterIntro,
        characterReplace: characterReplace,
        characterSubstitute: characterSubstitute,
        card: card,
        skill: { ...skill },
        translate: { ...translate, ...voice, ...characterSortTranslate },
        pinyins: pinyins,
    };
    for (const name in zshy_AH.character) {
        const translateName = zshy_AH.translate[name] || lib.translate[name];
        if (translateName) {
            if (translateName.indexOf('墟') === 0) zshy_AH.translate[name + '_prefix'] = '墟';
            if (translateName.indexOf('墟势') === 0) zshy_AH.translate[name + '_prefix'] = '墟势';
        };
    };
    if (!lib.config.zshy_AH) {
        game.saveConfig('characters', lib.config.characters.concat('zshy_AH')),
            game.saveConfig('zshy_AH', true);
    };
    lib.translate['zshy_AH_character_config'] = `<span style='font-family:xinwei' data-nature='shenmm'><font color='#000000'>兵势篇</font></span>`;
    return zshy_AH;
})
