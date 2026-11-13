import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
import { 颍川荀氏, 陈留吴氏, 颍川钟氏, 吴郡陆氏, } from './character.js';

export const characterSort = {
    zshy_ycxs: Object.keys(颍川荀氏),
    zshy_clws: Object.keys(陈留吴氏),
    zshy_yczs: Object.keys(颍川钟氏),
    zshy_wjls: Object.keys(吴郡陆氏),

};

function style(str) {
    return `<span style='font-family:xinwei' data-nature='shenmm'><font color='#000000'>${str}</font></span>`
};
export const characterSortTranslate = {
    zshy_ycxs: style(`颍川荀氏`),
    zshy_clws: style(`陈留吴氏`),
    zshy_yczs: style(`颍川钟氏`),
    zshy_wjls: style(`吴郡陆氏`),
};
export const characterSortInfo = {
};
