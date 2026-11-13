import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
import {
    天极·皇室宗亲, 四弼·辅国文曲, 天柱·势冠一方, 女史·留史巾帼, 少微·能人异士, 虎贲·勇冠三军, 灯愿·祈福武将,
} from './character.js';

export const characterSort = {
    zshy_tjhszq: Object.keys(天极·皇室宗亲),
    zshy_sbwgwq: Object.keys(四弼·辅国文曲),
    zshy_tzsgyf: Object.keys(天柱·势冠一方),
    zshy_nslsjg: Object.keys(女史·留史巾帼),
    zshy_swnrys: Object.keys(少微·能人异士),
    zshy_hbygsj: Object.keys(虎贲·勇冠三军),
    zshy_dyqfwj: Object.keys(灯愿·祈福武将),

};

function style(str) {
    return `<span style='font-family:xinwei' data-nature='shenmm'><font color='#000000'>${str}</font></span>`
};
export const characterSortTranslate = {
    zshy_tjhszq: style(`天极·皇室宗亲`),
    zshy_sbwgwq: style(`四弼·辅国文曲`),
    zshy_tzsgyf: style(`天柱·势冠一方`),
    zshy_nslsjg: style(`女史·留史巾帼`),
    zshy_swnrys: style(`少微·能人异士`),
    zshy_hbygsj: style(`虎贲·勇冠三军`),
    zshy_dyqfwj: style(`灯愿·祈福武将`),
};
export const characterSortInfo = {

};
