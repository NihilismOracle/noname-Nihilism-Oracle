import { lib, game, ui, get, ai, _status } from '../../../../noname.js';
export const 袖里乾坤 = {
    zshy_AAZZcaochunMB: {
        names: `曹|纯`,
        hp: 4,
        maxHp: 4,
        hujia: 0,
        sex: `male`,
        group: `wei`,
        skills: [`zshy_MBshanjia`],
    },
    zshy_AAZZsunhanhua: {
        names: `孙|寒华`,
        hp: 3,
        maxHp: 3,
        hujia: 0,
        sex: `female`,
        group: `wu`,
        skills: [`zshy_chongxu`, `zshy_miaojian`, `zshy_lianhua`],
    },
    zshy_AAZZsimashi: {
        names: `司马|师`,
        hp: 4,
        maxHp: 4,
        hujia: 0,
        sex: `male`,
        group: `wei`,
        groupBorder: `jin`,
        isZhugong: true,
        skills: [`zshy_baiyi`, `zshy_jinglve`, `zshy_shanli`],
    },
    zshy_AAZZlingcao: {
        names: `凌|操`,
        hp: 4,
        maxHp: 4,
        hujia: 0,
        sex: `male`,
        group: `wu`,
        skills: [`zshy_dujin`],
    },
    /*
    zshy_AAZZsunru: {
        names: `孙|茹`,
        hp: 3,
        maxHp: 3,
        hujia: 0,
        sex: `female`,
        group: `wu`,
        skills: [`zshy_yingjian`, `zshy_shixin`],
    },
    zshy_AAZZliuzan: {
        names: `留|赞`,
        hp: 4,
        maxHp: 4,
        hujia: 0,
        sex: `male`,
        group: `wu`,
        skills: [`zshy_fenyin`],
    },

    zshy_AAZZpangdegong: {
        names: `庞|德公`,
        hp: 3,
        maxHp: 3,
        hujia: 0,
        sex: `male`,
        group: `qun`,
        skills: [`zshy_xinfu_pingcai`, `zshy_xinfu_pdgyingshi`],
    },
    zshy_AAZZmiheng: {
        names: `祢|衡`,
        hp: 3,
        maxHp: 3,
        hujia: 0,
        sex: `male`,
        group: `qun`,
        skills: [`zshy_kuangcai`, `zshy_shejian`],
    },

    zshy_AAZZmajun: {
        names: `马|钧`,
        hp: 3,
        maxHp: 3,
        hujia: 0,
        sex: `male`,
        group: `wei`,
        skills: [`zshy_xinfu_jingxie`, `zshy_qiaosi`],
    },
    zshy_AAZZzhengxuan: {
        names: `郑|玄`,
        hp: 3,
        maxHp: 3,
        hujia: 0,
        sex: `male`,
        group: `qun`,
        skills: [`zshy_zhengjing`],
    },

    zshy_AAZznanhualaoxian: {
        names: `庄|周`,
        hp: 3,
        maxHp: 3,
        hujia: 0,
        sex: `male`,
        group: `qun`,
        skills: [`zshy_yufeng`, `zshy_tianshu`],
    },
    zshy_AAZZshichangshi: {
        names: `张|让-赵|忠-孙|璋-毕|岚-夏|恽-韩|悝-栗|嵩-段|珪-郭|胜-高|望`,
        hp: 1,
        maxHp: 1,
        hujia: 0,
        sex: `male`,
        group: `qun`,
        trashBin: ['sex:male_castrated'],
        skills: [`zshy_mbdanggu`, `zshy_mbmowang`],
    },

    zshy_AAZZzhangfenMB: {
        names: `张|奋`,
        hp: 4,
        maxHp: 4,
        hujia: 0,
        sex: `male`,
        group: `wu`,
        skills: [`zshy_mbquchong`, `zshy_mbxunjie`],
    },
    zshy_AAZZcuilingyiMB: {
        names: `崔|null`,
        hp: 3,
        maxHp: 3,
        hujia: 0,
        sex: `female`,
        group: `wei`,
        skills: [`zshy_mbcaiqiu`, `zshy_mbxishang`],
    },
    zshy_AAZZzhuji: {
        names: `朱|绩`,
        hp: 4,
        maxHp: 4,
        hujia: 0,
        sex: `male`,
        group: `wu`,
        skills: [`zshy_potjiezhu`, `zshy_pothuanshi`],
    },

    zshy_AAZZcaoxingMB: {
        names: `曹|兴`,
        hp: 4,
        maxHp: 4,
        hujia: 0,
        sex: `male`,
        group: `qun`,
        skills: [`zshy_mbjinzu`, `zshy_mbanxian`],
    },
    zshy_AAZZluyuMB: {
        names: `卢|毓`,
        hp: 3,
        maxHp: 3,
        hujia: 0,
        sex: `male`,
        group: `wei`,
        skills: [`zshy_mbbingfa`, `zshy_mbshuxing`],
    },
    zshy_AAZZzhangzhiMB: {
        names: `张|芝`,
        hp: 3,
        maxHp: 3,
        hujia: 0,
        sex: `male`,
        group: `qun`,
        skills: [`zshy_mbshiju`],
    },
    zshy_AAZZcaozhiMB: {
        names: `曹|植`,
        hp: 3,
        maxHp: 3,
        hujia: 0,
        sex: `male`,
        group: `wei`,
        skills: [`zshy_mbchongsi`, `zshy_mbpeidong`],
    },
    zshy_AAZZzhouyuMB: {
        names: `周|瑜`,
        hp: 3,
        maxHp: 3,
        hujia: 0,
        sex: `male`,
        group: `wu`,
        skills: [`zshy_mbshouyue`, `zshy_mbdieyin`],
    },
    zshy_AAZZliuhuiMB: {
        names: `刘|徽`,
        hp: 3,
        maxHp: 3,
        hujia: 0,
        sex: `male`,
        group: `qun`,
        skills: [`zshy_mbgeyuan`, `zshy_mbchongcha`],
    },

    zshy_AAZZchelijiMB: {
        names: `null|null`,
        hp: 4,
        maxHp: 4,
        hujia: 0,
        sex: `male`,
        group: `qun`,
        skills: [`zshy_mbqucheng`, `zshy_mbqiangyong`],
    },
 */
};

export const characters = {
    ...袖里乾坤,
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
    const keywords = ['JMGX', 'MB'];
    switch (true) {
        case keywords.some(keyword => name.includes(['JMGX'])):
            characters[name].img = `extension/诸神寰宇/image/character/zshy_CCXH/${name}.jpg`;
            characters[name].dieAudios = [`ext:诸神寰宇/audio/character/${name}.mp3`];
            break;
        case keywords.some(keyword => name.includes(['MB'])):
            characters[name].img = `../../../../image/character/mb_${advancedAffixRemover(name, {
                prefixes: ['zshy_AAZZ'],
                suffixes: 'MB',
                removeAll: true,
                caseSensitive: true,
            })}.jpg`;
            characters[name].dieAudios = [`mb_${advancedAffixRemover(name, {
                prefixes: ['zshy_AAZZ'],
                suffixes: 'MB',
                removeAll: true,
                caseSensitive: true,
            })}`];
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
