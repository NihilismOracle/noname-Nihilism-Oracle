import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
import { 一将成名2011, 一将成名2012, 一将成名2013, 一将成名2014, 一将成名2015, 原创之魂2016, 原创之魂2017 } from './character.js';

export const characterSort = {
    zshy_2011: Object.keys(一将成名2011),
    zshy_2012: Object.keys(一将成名2012),
    zshy_2013: Object.keys(一将成名2013),
    zshy_2014: Object.keys(一将成名2014),
    zshy_2015: Object.keys(一将成名2015),
    zshy_2016: Object.keys(原创之魂2016),
    zshy_2017: Object.keys(原创之魂2017),
};

function style(str) {
    return `<span style='font-family:xinwei' data-nature='shenmm'><font color='#000000'>${str}</font></span>`
};
export const characterSortTranslate = {
    zshy_2011: style(`一将成名-2011`),
    zshy_2012: style(`一将成名-2012`),
    zshy_2013: style(`一将成名-2013`),
    zshy_2014: style(`一将成名-2014`),
    zshy_2015: style(`一将成名-2015`),
    zshy_2016: style(`原创之魂-2016`),
    zshy_2017: style(`原创之魂-2017`),
};
export const characterSortInfo = {
    远古遗神: style(`你知道的，这其中的力量。`),
};
