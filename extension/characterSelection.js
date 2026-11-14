import { lib, game, ui, get, _status } from '../../../noname.js';

// 本体 checkEnd 的 autoConfirm 会忽略 chooseButton 上自拟的 autoconfirm 字段。
// 只关闭带此标记的选择事件的自动提交，保留本体的勾选、取消及确认按钮。
function keepManualConfirmation(event, result) {
    if (event.zshyManualConfirm) result.auto = false;
}

export function requireCharacterConfirmation(event) {
    const hooks = lib.hooks?.checkEnd;
    if (hooks && !hooks.includes(keepManualConfirmation)) hooks.unshift(keepManualConfirmation);
    return event.set('zshyManualConfirm', true).set('direct', false).set('forceDirect', false);
}

// 每个客户端加载模块时登记，远程 chooseButton 的 _set 也会传递事件标记。
if (lib.hooks?.checkEnd && !lib.hooks.checkEnd.includes(keepManualConfirmation)) {
    lib.hooks.checkEnd.unshift(keepManualConfirmation);
}

export function characterChoicePool() {
    return Object.keys(lib.character).filter(id => {
        const info = lib.character[id];
        if (!info || lib.config.banned?.includes(id)) return false;
        if (info.isMinskin || info.isUnseen || info.isHiddenInStoneMode) return false;
        if ((info.isBoss || info.isHiddenBoss) && (lib.config.mode === 'boss' || !info.isBossAllowed)) return false;
        return true;
    });
}

export async function chooseCharacterConfirmed(player, pool, prompt, forced = true) {
    const available = new Set(characterChoicePool());
    const list = [...new Set(pool)].filter(id => available.has(id));
    if (!list.length) return null;
    const controlled = (player === game.me && !_status.auto) || (player !== game.me && player.isUnderControl?.(true));
    if (!controlled && !player.isOnline?.()) return forced ? list.randomGet() : null;
    const videoId = lib.status.videoId++;
    try {
        game.broadcastAll((videoId, list, prompt) => {
            // 沿用本体自由选将的分包、势力、字母与分页筛选；候选范围由技能传入。
            const saved = lib.characterFilter;
            let dialog;
            try {
                lib.characterFilter = {};
                dialog = ui.create.characterDialog('heightset', id => !list.includes(id));
            } finally {
                lib.characterFilter = saved;
            }
            dialog.videoId = videoId;
            const caption = ui.create.div('.caption');
            caption.textContent = prompt + '（点选武将后，点击“确定”完成选择）';
            dialog.content.insertBefore(caption, dialog.content.firstChild);
            // hidden 对话框尚未 open，先登记以供本体 get.idDialog 和远端查找。
            ui.dialogs.add(dialog);
        }, videoId, list, prompt);
        const next = player.chooseButton(forced)
            .set('dialog', videoId)
            .set('selectButton', 1)
            .set('zshyCharacterPool', list)
            .set('filterButton', button => get.event().zshyCharacterPool.includes(button.link))
            .set('ai', () => Math.random());
        const result = await requireCharacterConfirmation(next).forResult();
        const selected = result?.links?.[0];
        return result?.bool && list.includes(selected) ? selected : null;
    } finally {
        game.broadcastAll(videoId => {
            const dialog = get.idDialog(videoId);
            if (dialog) {
                dialog.close();
                dialog.delete();
                ui.dialogs.remove(dialog);
            }
        }, videoId);
    }
}
