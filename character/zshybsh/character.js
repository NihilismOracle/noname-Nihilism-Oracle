import { lib, game, ui, get, ai, _status } from '../../../../noname.js';

//兵势篇·奇
export const 兵势篇奇 = {
};
//兵势篇·正
export const 兵势篇正 = {
};
//兵势篇·势
export const 兵势篇势 = {
    zshy_AAZZzhouyuBSP: {
        names: `周|瑜`,
        hp: 4,
        maxHp: 4,
        hujia: 0,
        sex: `male`,
        group: `wu`,
        doubleGroup: [],
        groupBorder: ``,
        skills: [`zshy_chiyun`, `zshy_yanhui`, `zshy_fentao`, `zshy_xiongzi`],

    },
    zshy_AAZZzhonghuiBSP: {
        names: `钟|会`,
        hp: 4,
        maxHp: 4,
        hujia: 0,
        sex: `male`,
        group: `wei`,
        doubleGroup: [`wei`, `qun`],
        groupBorder: `qun`,
        skills: [`zshy_sizi`, `zshy_xiezhi`, `zshy_yunan`, `zshy_kechang`],

    },
    zshy_AAZZweiyanBSP: {
        names: `魏|延`,
        hp: 4,
        maxHp: 4,
        hujia: 0,
        sex: `male`,
        group: `shu`,
        doubleGroup: [],
        groupBorder: ``,
        skills: [`zshy_zhuangshi`, `zshy_yinzhan`, `zshy_zhongao`],

    },
};
//兵势篇·节
export const 兵势篇节 = {
};

export const characters = {
    ...兵势篇奇,
    ...兵势篇正,
    ...兵势篇势,
    ...兵势篇节,
};

/**
 * 高级的多种前后缀移除工具
 * @param {string} str - 原始字符串
 * @param {object} options - 配置选项
 * @returns {string} 处理后的字符串
 */
function advancedAffixRemover(str, options = {}) {
    const {
        prefixes = [],
        suffixes = [],
        removeAll = false, // 是否移除所有匹配的前后缀
        caseSensitive = true, // 是否区分大小写
        trimWhitespace = false // 是否移除前后空格
    } = options;

    let result = str;

    // 可选：先去除空格
    if (trimWhitespace) {
        result = result.trim();
    }

    // 处理前缀
    const prefixArray = Array.isArray(prefixes) ? prefixes : [prefixes];

    if (removeAll) {
        // 移除所有匹配的前缀
        let prefixRemoved;
        do {
            prefixRemoved = false;
            for (const prefix of prefixArray) {
                if (!prefix) continue;

                const prefixToCheck = caseSensitive ? prefix : prefix.toLowerCase();
                const resultToCheck = caseSensitive ? result : result.toLowerCase();

                if (resultToCheck.startsWith(prefixToCheck)) {
                    result = result.substring(prefix.length);
                    prefixRemoved = true;
                    break;
                }
            }
        } while (prefixRemoved);
    } else {
        // 只移除第一个匹配的前缀
        for (const prefix of prefixArray) {
            if (!prefix) continue;

            const prefixToCheck = caseSensitive ? prefix : prefix.toLowerCase();
            const resultToCheck = caseSensitive ? result : result.toLowerCase();

            if (resultToCheck.startsWith(prefixToCheck)) {
                result = result.substring(prefix.length);
                break;
            }
        }
    }

    // 处理后缀
    const suffixArray = Array.isArray(suffixes) ? suffixes : [suffixes];

    if (removeAll) {
        // 移除所有匹配的后缀
        let suffixRemoved;
        do {
            suffixRemoved = false;
            for (const suffix of suffixArray) {
                if (!suffix) continue;

                const suffixToCheck = caseSensitive ? suffix : suffix.toLowerCase();
                const resultToCheck = caseSensitive ? result : result.toLowerCase();

                if (resultToCheck.endsWith(suffixToCheck)) {
                    result = result.substring(0, result.length - suffix.length);
                    suffixRemoved = true;
                    break;
                }
            }
        } while (suffixRemoved);
    } else {
        // 只移除第一个匹配的后缀
        for (const suffix of suffixArray) {
            if (!suffix) continue;

            const suffixToCheck = caseSensitive ? suffix : suffix.toLowerCase();
            const resultToCheck = caseSensitive ? result : result.toLowerCase();

            if (resultToCheck.endsWith(suffixToCheck)) {
                result = result.substring(0, result.length - suffix.length);
                break;
            }
        }
    }

    return result;
}

// 兵势篇·势：本体「势」包存在同名武将的，立绘与阵亡语音引用本体（继续追加时把扩展 id 加进这里）
const BODY_REFERENCE = ['zshy_AAZZzhouyuBSP'];

for (const name in characters) {
    const keywords = ['BSP'];
    switch (true) {
        case BODY_REFERENCE.includes(name):
            // 立绘 / 阵亡语音引用本体同名武将（如 zshy_AAZZzhouyuBSP → pot_zhouyu）
            characters[name].img = `../../../../image/character/pot_${advancedAffixRemover(name, {
                prefixes: ['zshy_AAZZ'],
                suffixes: keywords,
                removeAll: true,
                caseSensitive: true,
            })}.jpg`;
            characters[name].dieAudios = [`pot_${advancedAffixRemover(name, {
                prefixes: ['zshy_AAZZ'],
                suffixes: keywords,
                removeAll: true,
                caseSensitive: true,
            })}`];
            break;
        default:
            // 其余兵势篇武将：仍使用扩展内立绘与配音
            characters[name].img = `extension/诸神寰宇/image/character/zshy_AH/${name}.jpg`;
            characters[name].dieAudios = [`ext:诸神寰宇/audio/character/${name}.mp3`];
    }
}

export default characters;
