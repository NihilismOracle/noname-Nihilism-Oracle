import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
export const 百战虎贲 = {
    zshy_AAZZwenyangJMGX: {
        names: `文|鸯`,
        hp: 5,
        maxHp: 5,
        hujia: 0,
        sex: `male`,
        group: `wei`,
        skills: [`zshy_lvli`, `zshy_WYchoujue`],
    },

};
export const 武庙 = {
    zshy_AAZZhuangfusongWMXL: {
        names: `皇|甫嵩`,
        hp: 1,
        maxHp: 4,
        hujia: 0,
        sex: `male`,
        group: `qun`,
        skills: [`zshy_chaozhen`, `zshy_lianjie`, `zshy_jiangxian`],
    },
    zshy_AAZZluxunWMXL: {
        names: `陆|逊`,
        hp: 3,
        maxHp: 3,
        hujia: 0,
        sex: `male`,
        group: `wu`,
        skills: [`zshy_xiongmu`, `zshy_zhangcai`, `zshy_ruxian`],
    },
    zshy_AAZZzhugeliangWMXL: {
        names: `诸葛|亮`,
        hp: 4,
        maxHp: 7,
        hujia: 0,
        sex: `male`,
        group: `shu`,
        skills: [`zshy_jincui`, `zshy_qingshi`, `zshy_zhizhe`],
    },
};

export const characters = {
    ...百战虎贲, ...武庙,
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

for (const name in characters) {
    const keywords = ['JMGX', 'WMXL'];
    switch (true) {
        case keywords.some(keyword => name.includes(['JMGX']) || name.includes(['WMXL'])):
            characters[name].img = `extension/诸神寰宇/image/character/zshy_XDZS/${name}.jpg`;
            characters[name].dieAudios = [`ext:诸神寰宇/audio/character/${name}.mp3`];
            break;
        default:
            characters[name].img = `../../../../image/character/${advancedAffixRemover(name, {
                prefixes: ['zshy_AAZZ'],
                suffixes: keywords,
                removeAll: true,
                caseSensitive: true,
            })}.jpg`;
            characters[name].dieAudios = [`${advancedAffixRemover(name, {
                prefixes: ['zshy_AAZZ'],
                suffixes: keywords,
                removeAll: true,
                caseSensitive: true,
            })}`];
    }
}

export default characters;
