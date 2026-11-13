import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
export const 百战虎贲 = {
    zshy_AAZZwenyangJMGX: '骁勇金衔',
};
export const 武庙 = {
    zshy_AAZZhuangfusongWMXL: `灼焰靖世`,
    zshy_AAZZluxunWMXL: `神秀峥嵘`,
    zshy_AAZZzhugeliangWMXL: `忠武良弼`,
};

function setTitle(object) {
    if (object && typeof object === 'object') {
        const keys = Object.keys(object);
        for (let key of keys) {
            const string = object[key];
            if (string && typeof string === 'string') {
                object[key] = `<span style='font-family:xinwei' data-nature='shenmm'><font color='#000000'>${string}</font></span>`;
            }
        }
    }
    return object;
}
const characterTitle = {
    ...百战虎贲, ...武庙,
};
setTitle(characterTitle);
export default characterTitle;
