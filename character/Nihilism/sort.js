import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
import {
    远古遗神, 江山多殇, 异界来客, Vsinger, SlayTheSpire,
} from './character.js';

export const characterSort = {
    Nihilism_ygys: Object.keys(远古遗神),
    Nihilism_jsds: Object.keys(江山多殇),
    Nihilism_yjlk: Object.keys(异界来客),
    Nihilism_Vsinger: Object.keys(Vsinger),
    Nihilism_SlayTheSpire: Object.keys(SlayTheSpire),
};

function style(str) {
    return `<span style='font-family:xinwei' data-nature='shenmm'><font color='#000000'>${str}</font></span>`
};
export const characterSortTranslate = {
    Nihilism_ygys: style(`远古遗神`),
    Nihilism_jsds: style(`江山多殇`),
    Nihilism_yjlk: style(`异界来客`),
    Nihilism_Vsinger: style(`Vsinger`),
    Nihilism_SlayTheSpire: style(`Slay The Spire`),
};
export const characterSortInfo = {
};
