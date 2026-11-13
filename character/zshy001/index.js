/**
 * 诸神寰宇 · 归墟之地（zshy001）武将包入口
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
import skill_AB from './skill.js'
import skill_AC from '../zshy002/skill.js'
import skill_AD from '../zshy003/skill.js'
import skill_AE from '../zshy004/skill.js'
import skill_AF from '../zshy005/skill.js'
import skill_ccxh from '../zshyccxh/skill.js'
import translate from './translate.js'
import voice from './voice.js'
import pinyins from './pinyins.js'

game.import('character', function () {
    const zshy_AB = {
        name: 'zshy_AB',
        connect: false,
        character: characters,
        characterSort: {
            zshy_AB: { ...characterSort },
        },
        characterTitle: characterTitle,
        dynamicTranslate: dynamicTranslate,
        characterIntro: characterIntro,
        characterReplace: characterReplace,
        characterSubstitute: characterSubstitute,
        card: card,
        skill: { ...skill, ...skill_AB, ...skill_AC, ...skill_AD, ...skill_AE, ...skill_AF, ...skill_ccxh },
        translate: { ...translate, ...voice, ...characterSortTranslate },
        pinyins: pinyins,
    };
    for (const name in zshy_AB.character) {
        if (zshy_AB.translate[name]) {
            if (zshy_AB.translate[name].indexOf('烬') === 0) zshy_AB.translate[name + '_prefix'] = '烬';
            if (zshy_AB.translate[name].indexOf('烬神') === 0) zshy_AB.translate[name + '_prefix'] = '烬神';
            if (zshy_AB.translate[name].indexOf('墟') === 0) zshy_AB.translate[name + '_prefix'] = '墟';
            if (zshy_AB.translate[name].indexOf('墟神') === 0) zshy_AB.translate[name + '_prefix'] = '墟神';
            if (zshy_AB.translate[name].indexOf('墟势') === 0) zshy_AB.translate[name + '_prefix'] = '墟势';
            if (zshy_AB.translate[name].indexOf('墟族') === 0) zshy_AB.translate[name + '_prefix'] = '墟族';
            if (zshy_AB.translate[name].indexOf('墟SP') === 0) zshy_AB.translate[name + '_prefix'] = '墟SP';
            if (zshy_AB.translate[name].indexOf('墟魔') === 0) zshy_AB.translate[name + '_prefix'] = '墟魔';
        };
        const dieAudioPath = `die:ext:诸神寰宇/audio/character/${name}.mp3`;
        const imagesPath_png = `ext:诸神寰宇/image/character/zshy_AB/${name}.jpg`;
        const _zch = zshy_AB.character[name];
        if (Array.isArray(_zch)) (_zch[4] = _zch[4] || []).push(dieAudioPath, imagesPath_png);
        else if (_zch) {
            (_zch.dieAudios = _zch.dieAudios || []).push(dieAudioPath.slice(4));
            (_zch.trashBin = _zch.trashBin || []).push(imagesPath_png);
        }
    };
    if (!lib.config.zshy_AB) {
        game.saveConfig('characters', lib.config.characters.concat('zshy_AB')),
            game.saveConfig('zshy_AB', true);
    };
    lib.translate['zshy_AB_character_config'] = `<span style='font-family:xinwei' data-nature='shenmm'><font color='#000000'>归墟之地</font></span>`;
    return zshy_AB;
})
