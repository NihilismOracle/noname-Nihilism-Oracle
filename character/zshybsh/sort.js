import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
import { 兵势篇奇, 兵势篇正, 兵势篇势, 兵势篇节 } from './character.js';

export const characterSort = {
    zshy_bsq: Object.keys(兵势篇奇),
    zshy_bsz: Object.keys(兵势篇正),
    zshy_bss: Object.keys(兵势篇势),
    zshy_bsj: Object.keys(兵势篇节),
};

function style(str) {
    return `<span style='font-family:xinwei' data-nature='shenmm'><font color='#000000'>${str}</font></span>`
};
export const characterSortTranslate = {
    zshy_bsq: style('兵势篇·奇'),
    zshy_bsz: style('兵势篇·正'),
    zshy_bss: style('兵势篇·势'),
    zshy_bsj: style('兵势篇·节'),
};
export const characterSortInfo = {};
