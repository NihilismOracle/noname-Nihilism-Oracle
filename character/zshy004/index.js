/**
 * 诸神寰宇 · 文德武备（zshy004）武将包入口
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
import skill from '../zshy000/skill.js'
import skill_AB from '../zshy001/skill.js'
import skill_AC from '../zshy002/skill.js'
import skill_AD from '../zshy003/skill.js'
import skill_AE from './skill.js'
import skill_AF from '../zshy005/skill.js'
import translate from './translate.js'
import voice from './voice.js'
import pinyins from './pinyins.js'

game.import('character', function () {
    const zshy_AE = {
        name: 'zshy_AE',
        connect: false,
        character: characters,
        characterSort: {
            zshy_AE: { ...characterSort },
        },
        characterTitle: characterTitle,
        dynamicTranslate: dynamicTranslate,
        characterIntro: characterIntro,
        characterReplace: characterReplace,
        characterSubstitute: characterSubstitute,
        card: card,
        skill: { ...skill, ...skill_AB, ...skill_AC, ...skill_AD, ...skill_AE, ...skill_AF },
        translate: { ...translate, ...voice, ...characterSortTranslate },
        pinyins: pinyins,
    };
    for (const name in zshy_AE.character) {
        if (zshy_AE.translate[name]) {
            if (zshy_AE.translate[name].indexOf('墟') === 0) zshy_AE.translate[name + '_prefix'] = '墟';
        };
    };
    if (!lib.config.zshy_AE) {
        game.saveConfig('characters', lib.config.characters.concat('zshy_AE')),
            game.saveConfig('zshy_AE', true);
    };
    lib.translate['zshy_AE_character_config'] = `<span style='font-family:xinwei' data-nature='shenmm'><font color='#000000'>文德武备</font></span>`;
    return zshy_AE;
})
