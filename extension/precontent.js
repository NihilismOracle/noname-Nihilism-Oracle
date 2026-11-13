/**
 * 各武将包的注册入口。
 * 注意顺序：后加载的包可能会复用前面已注册的武将/技能数据（例如 zshy001 会合并其他包的技能）。
 */
export async function precontent() {
    await import('../character/Nihilism/index.js');
    await import('../character/zshy000/index.js');
    await import('../character/zshy001/index.js');
    await import('../character/zshy002/index.js');
    await import('../character/zshy003/index.js');
    await import('../character/zshyccxh/index.js');
    await import('../character/zshy004/index.js');
    await import('../character/zshy005/index.js');
    await import('../character/zshy006/index.js');
    await import('../character/zshybsh/index.js');
    await import('../character/zshyxdzs/index.js');
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
