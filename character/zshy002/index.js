/**
 * 诸神寰宇 · 神话再临（zshy002）武将包入口
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
import skill_AC from './skill.js'
import skill_AD from '../zshy003/skill.js'
import skill_AE from '../zshy004/skill.js'
import skill_AF from '../zshy005/skill.js'
import translate from './translate.js'
import voice from './voice.js'
import pinyins from './pinyins.js'

game.import('character', function () {
    const zshy_AC = {
        name: 'zshy_AC',
        connect: false,
        character: characters,
        characterSort: {
            zshy_AC: { ...characterSort },
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
    for (const name in zshy_AC.character) {
        if (zshy_AC.translate[name]) {
            if (zshy_AC.translate[name].indexOf('烬') === 0) zshy_AC.translate[name + '_prefix'] = '烬';
            if (zshy_AC.translate[name].indexOf('烬神') === 0) zshy_AC.translate[name + '_prefix'] = '烬神';
            if (zshy_AC.translate[name].indexOf('墟') === 0) zshy_AC.translate[name + '_prefix'] = '墟';
            if (zshy_AC.translate[name].indexOf('墟武') === 0) zshy_AC.translate[name + '_prefix'] = '墟武';
            if (zshy_AC.translate[name].indexOf('墟神') === 0) zshy_AC.translate[name + '_prefix'] = '墟神';
            if (zshy_AC.translate[name].indexOf('墟势') === 0) zshy_AC.translate[name + '_prefix'] = '墟势';
            if (zshy_AC.translate[name].indexOf('墟族') === 0) zshy_AC.translate[name + '_prefix'] = '墟族';
            if (zshy_AC.translate[name].indexOf('墟SP') === 0) zshy_AC.translate[name + '_prefix'] = '墟SP';
        };
        const dieAudioPath = `die:ext:诸神寰宇/audio/character/${name}.mp3`;
        const imagesPath_png = `ext:诸神寰宇/image/character/zshy_AC/${name}.jpg`;
        const _zch = zshy_AC.character[name];
        if (Array.isArray(_zch)) (_zch[4] = _zch[4] || []).push(dieAudioPath, imagesPath_png);
        else if (_zch) {
            (_zch.dieAudios = _zch.dieAudios || []).push(dieAudioPath.slice(4));
            (_zch.trashBin = _zch.trashBin || []).push(imagesPath_png);
        }
    };
    if (!lib.config.zshy_AC) {
        game.saveConfig('characters', lib.config.characters.concat('zshy_AC')),
            game.saveConfig('zshy_AC', true);
    };
    lib.translate['zshy_AC_character_config'] = `<span style='font-family:xinwei' data-nature='shenmm'><font color='#000000'>神话再临</font></span>`;
    return zshy_AC;
})
