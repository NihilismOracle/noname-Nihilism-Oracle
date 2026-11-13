import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
import { 其疾如风, 侵略如火, 其徐如林, 不动如山, 难知如阴, 动如雷震 } from './character.js';

export const characterSort = {
    zshy_qjrf: Object.keys(其疾如风),
    zshy_qlrh: Object.keys(侵略如火),
    zshy_qxrl: Object.keys(其徐如林),
    zshy_bdrs: Object.keys(不动如山),
    zshy_nzry: Object.keys(难知如阴),
    zshy_drlz: Object.keys(动如雷震),
};

function style(str) {
    return `<span style='font-family:xinwei' data-nature='shenmm'><font color='#000000'>${str}</font></span>`
};
export const characterSortTranslate = {
    zshy_qjrf: style(`其疾如风`),
    zshy_qlrh: style(`侵略如火`),
    zshy_qxrl: style(`其徐如林`),
    zshy_bdrs: style(`不动如山`),
    zshy_nzry: style(`难知如阴`),
    zshy_drlz: style(`动如雷震`),
};
export const characterSortInfo = {
};
