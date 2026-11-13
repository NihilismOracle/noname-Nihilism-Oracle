import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
import {
    蜀汉虎将, 贤君明主, 勇冠三军, 帷幄千里, 巾帼红颜,
    SP系列,
    始计篇智, 始计篇信, 始计篇仁, 始计篇勇, 始计篇严,
    魔乱九州,
    曹魏, 蜀汉, 东吴, 群雄, 西晋, 神祇,
} from './character.js';

export const characterSort = {
    zshy_shhj: Object.keys(蜀汉虎将),
    zshy_xjmz: Object.keys(贤君明主),
    zshy_ygsj: Object.keys(勇冠三军),
    zshy_wwql: Object.keys(帷幄千里),
    zshy_jghy: Object.keys(巾帼红颜),
    zshy_spxl: Object.keys(SP系列),
    zshy_sjpz: Object.keys(始计篇智),
    zshy_sjpx: Object.keys(始计篇信),
    zshy_sjpr: Object.keys(始计篇仁),
    zshy_sjpy: Object.keys(始计篇勇),
    zshy_sjpa: Object.keys(始计篇严),
    zshy_mljz: Object.keys(魔乱九州),
    zshy_wei: Object.keys(曹魏),
    zshy_shu: Object.keys(蜀汉),
    zshy_wu: Object.keys(东吴),
    zshy_qun: Object.keys(群雄),
    zshy_jin: Object.keys(西晋),
    zshy_shen: Object.keys(神祇),

};

function style(str) {
    return `<span style='font-family:xinwei' data-nature='shenmm'><font color='#000000'>${str}</font></span>`
};
export const characterSortTranslate = {
    zshy_shhj: style(`蜀汉虎将`),
    zshy_xjmz: style(`贤君明主`),
    zshy_ygsj: style(`勇冠三军`),
    zshy_wwql: style(`帷幄千里`),
    zshy_jghy: style(`巾帼红颜`),
    zshy_spxl: style(`SP系列`),
    zshy_sjpz: style(`始计篇-智`),
    zshy_sjpx: style(`始计篇-信`),
    zshy_sjpr: style(`始计篇-仁`),
    zshy_sjpy: style(`始计篇-勇`),
    zshy_sjpa: style(`始计篇-严`),
    zshy_mljz: style(`魔乱九州`),
    zshy_wei: style(`烬灭归墟-魏`),
    zshy_shu: style(`烬灭归墟-蜀`),
    zshy_wu: style(`烬灭归墟-吴`),
    zshy_qun: style(`烬灭归墟-群`),
    zshy_jin: style(`烬灭归墟-晋`),
    zshy_shen: style(`烬灭归墟-神`),

};
export const characterSortInfo = {
};
