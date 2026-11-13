import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
import { 文德武备理, 文德武备备, 文德武备果, 文德武备戒, 文德武备约 } from './character.js';

export const characterSort = {
    zshy_wdwbl: Object.keys(文德武备理),
    zshy_wdwbb: Object.keys(文德武备备),
    zshy_wdwbg: Object.keys(文德武备果),
    zshy_wdwbj: Object.keys(文德武备戒),
    zshy_wdwby: Object.keys(文德武备约),
};

function style(str) {
    return `<span style='font-family:xinwei' data-nature='shenmm'><font color='#000000'>${str}</font></span>`
};
export const characterSortTranslate = {
    zshy_wdwbl: style(`文德武备-理`),
    zshy_wdwbb: style(`文德武备-备`),
    zshy_wdwbg: style(`文德武备-果`),
    zshy_wdwbj: style(`文德武备-戒`),
    zshy_wdwby: style(`文德武备-约`),
};
export const characterSortInfo = {
    远古遗神: style(`你知道的，这其中的力量。`),
};
