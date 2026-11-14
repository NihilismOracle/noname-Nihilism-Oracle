import { captureProtectedSkills } from './skillProtection.js';
/**
 * 各武将包的注册入口。
 * 注意顺序：后加载的包可能会复用前面已注册的武将/技能数据（例如 zshy001 会合并其他包的技能）。
 */
export async function precontent() {
    captureProtectedSkills((await import('../character/Nihilism/skill.js')).default);
    await import('../character/Nihilism/index.js');
    captureProtectedSkills((await import('../character/zshy000/skill.js')).default);
    await import('../character/zshy000/index.js');
    captureProtectedSkills((await import('../character/zshy001/skill.js')).default);
    await import('../character/zshy001/index.js');
    captureProtectedSkills((await import('../character/zshy002/skill.js')).default);
    await import('../character/zshy002/index.js');
    captureProtectedSkills((await import('../character/zshy003/skill.js')).default);
    await import('../character/zshy003/index.js');
    captureProtectedSkills((await import('../character/zshyccxh/skill.js')).default);
    await import('../character/zshyccxh/index.js');
    captureProtectedSkills((await import('../character/zshy004/skill.js')).default);
    await import('../character/zshy004/index.js');
    captureProtectedSkills((await import('../character/zshy005/skill.js')).default);
    await import('../character/zshy005/index.js');
    captureProtectedSkills((await import('../character/zshy006/skill.js')).default);
    await import('../character/zshy006/index.js');
    captureProtectedSkills((await import('../character/zshybsh/skill.js')).default);
    await import('../character/zshybsh/index.js');
    captureProtectedSkills((await import('../character/zshyxdzs/skill.js')).default);
    await import('../character/zshyxdzs/index.js');
    captureProtectedSkills((await import('../character/zshyydb/skill.js')).default);
    await import('../character/zshyydb/index.js');

    // 与「十周年UI」联动的前缀注册（该扩展存在时才启用）：
    // game.zshyHasExtension = (name) =>
    //     lib.config.extensions?.includes(name) && lib.config[`extension_${name}_enable`];
    // if (game.zshyHasExtension('十周年UI')) {
    //     decadeModule.prefixMark.registerPrefix('墟SP', 'sp');
    //     decadeModule.prefixMark.registerPrefix('墟神', 'shen');
    //     decadeModule.prefixMark.registerPrefix('墟族', 'clan');
    //     decadeModule.prefixMark.registerPrefix('墟武', 'wu');
    //     decadeModule.prefixMark.registerPrefix('墟势', 'pot');
    //     decadeModule.prefixMark.registerPrefix('烬神', 'shen');
    // }
}
