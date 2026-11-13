/**
 * 诸神寰宇 · 诸神寰宇（Nihilism）武将包入口
 * 包注册、武将名前缀补全、扩展配置项初始化；
 * 武将数据在 character.js，技能在 skill.js，翻译在 translate.js。
 */
import { lib, game, ui, get, ai, _status } from '../../../../noname.js'
import { characters } from './character.js'
import { characterSort, characterSortTranslate } from './sort.js'
import characterTitle from './characterTitle.js'
import dynamicTranslate from './dynamicTranslate.js'
import characterIntro from './intro.js'
import characterReplace from './characterReplace.js'
import characterSubstitute from './characterSubstitute.js'
import card from './card.js'
import skill from './skill.js'
import translate from './translate.js'
import voice from './voice.js'
import pinyins from './pinyins.js'

game.import('character', function () {
    const Nihilism = {
        name: 'Nihilism',
        connect: false,
        character: characters,
        characterSort: {
            Nihilism: { ...characterSort },
        },
        characterTitle: characterTitle,
        dynamicTranslate: dynamicTranslate,
        characterIntro: characterIntro,
        characterReplace: characterReplace,
        characterSubstitute: characterSubstitute,
        card: card,
        skill: skill,
        translate: { ...translate, ...voice, ...characterSortTranslate },
        pinyins: pinyins,
    };
    for (const name in Nihilism.character) {
        if (Nihilism.translate[name]) {
            if (Nihilism.translate[name].indexOf('安璟') === 0) Nihilism.translate[name + '_prefix'] = '安璟';
            if (Nihilism.translate[name].indexOf('安天痕') === 0) Nihilism.translate[name + '_prefix'] = '安天痕';
            if (Nihilism.translate[name].indexOf('玖笙') === 0) Nihilism.translate[name + '_prefix'] = '玖笙';
            if (Nihilism.translate[name].indexOf('灭魂') === 0) Nihilism.translate[name + '_prefix'] = '灭魂';
            if (Nihilism.translate[name].indexOf('盅墨') === 0) Nihilism.translate[name + '_prefix'] = '盅墨';
            if (Nihilism.translate[name].indexOf('罪恋') === 0) Nihilism.translate[name + '_prefix'] = '罪恋';
            if (Nihilism.translate[name].indexOf('黯日') === 0) Nihilism.translate[name + '_prefix'] = '黯日';
            if (Nihilism.translate[name].indexOf('苍澜') === 0) Nihilism.translate[name + '_prefix'] = '苍澜';
            if (Nihilism.translate[name].indexOf('初音未来') === 0) Nihilism.translate[name + '_prefix'] = '初音未来';
            if (Nihilism.translate[name].indexOf('古月方源') === 0) Nihilism.translate[name + '_prefix'] = '古月方源';
            if (Nihilism.translate[name].indexOf('龙裔') === 0) Nihilism.translate[name + '_prefix'] = '龙裔';
            if (Nihilism.translate[name].indexOf('苏晓') === 0) Nihilism.translate[name + '_prefix'] = '苏晓';
            if (Nihilism.translate[name].indexOf('杨间') === 0) Nihilism.translate[name + '_prefix'] = '杨间';
            if (Nihilism.translate[name].indexOf('异乡人') === 0) Nihilism.translate[name + '_prefix'] = '异乡人';
            if (Nihilism.translate[name].indexOf('莉莉姆') === 0) Nihilism.translate[name + '_prefix'] = '莉莉姆';
            if (Nihilism.translate[name].indexOf('金牛座') === 0) Nihilism.translate[name + '_prefix'] = '金牛座';
            if (Nihilism.translate[name].indexOf('洛天依') === 0) Nihilism.translate[name + '_prefix'] = '洛天依';
            if (Nihilism.translate[name].indexOf('言和') === 0) Nihilism.translate[name + '_prefix'] = '言和';
            if (Nihilism.translate[name].indexOf('乐正绫') === 0) Nihilism.translate[name + '_prefix'] = '乐正绫';
            if (Nihilism.translate[name].indexOf('乐正龙牙') === 0) Nihilism.translate[name + '_prefix'] = '乐正龙牙';
        };
    };
    if (!lib.config.characters.includes('Nihilism')) lib.config.characters.remove('Nihilism');
    if (!lib.config.Nihilism) {
        game.saveConfig('characters', lib.config.characters.concat('Nihilism')),
            game.saveConfig('Nihilism', true);
    };
    lib.translate['Nihilism_character_config'] = `<span style='font-family:xinwei' data-nature='shenmm'><font color='#000000'>诸神寰宇</font></span>`;
    return Nihilism;
})
