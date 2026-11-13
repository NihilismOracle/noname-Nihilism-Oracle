import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
import { 谋定天下, 武动乾坤, 花好月圆, 计出万全, 施仁布德, 奋勇扬威, 达权通变 } from './character.js';

export const characterSort = {
    zshy_mdtx: Object.keys(谋定天下),
    zshy_wdqk: Object.keys(武动乾坤),
    zshy_hhyy: Object.keys(花好月圆),
    zshy_jcwq: Object.keys(计出万全),
    zshy_srbd: Object.keys(施仁布德),
    zshy_fyyw: Object.keys(奋勇扬威),
    zshy_dqtb: Object.keys(达权通变),
};

function style(str) {
    return `<span style='font-family:xinwei' data-nature='shenmm'><font color='#000000'>${str}</font></span>`
};
export const characterSortTranslate = {
    zshy_mdtx: style(`谋定天下`),
    zshy_wdqk: style(`武动乾坤`),
    zshy_hhyy: style(`花好月圆`),
    zshy_jcwq: style(`计出万全`),
    zshy_srbd: style(`施仁布德`),
    zshy_fyyw: style(`奋勇扬威`),
    zshy_dqtb: style(`达权通变`),
};
export const characterSortInfo = {
};
