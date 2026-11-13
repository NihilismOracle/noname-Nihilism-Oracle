import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
import {
    光阴长河,
    万象归一,
} from './character.js';

export const characterSort = {
    zshy_gych: Object.keys(光阴长河),
    zshy_wxgy: Object.keys(万象归一),
};

function style(str) {
    return `<span style='font-family:xinwei' data-nature='shenmm'><font color='#000000'>${str}</font></span>`
};
export const characterSortTranslate = {
    zshy_gych: style(`光阴长河`),
    zshy_wxgy: style(`万象归一`),
};
export const characterSortInfo = {
    远古遗神: style(`你知道的，这其中的力量。`),
};
