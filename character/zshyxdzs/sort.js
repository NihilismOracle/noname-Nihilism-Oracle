import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
import {
    百战虎贲, 武庙,
} from './character.js';

export const characterSort = {
    zshy_bzhb: Object.keys(百战虎贲),
    zshy_wm: Object.keys(武庙),

};

function style(str) {
    return `<span style='font-family:xinwei' data-nature='shenmm'><font color='#000000'>${str}</font></span>`
};
export const characterSortTranslate = {
    zshy_bzhb: style(`百战虎贲`),
    zshy_wm: style(`武庙`),
};
export const characterSortInfo = {

};
