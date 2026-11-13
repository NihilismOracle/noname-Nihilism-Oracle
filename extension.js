import { arenaReady } from './extension/arenaReady.js';
import { content } from './extension/content.js';
import { prepare } from './extension/prepare.js';
import { precontent } from './extension/precontent.js';
import { config } from './extension/config.js';
import { help } from './extension/help/help.js';
import { packages } from './packages.js';
import { files } from './extension/files/files.js';

export const type = 'extension';

export default function () {
    return {
        name: '诸神寰宇',
        connect: false,
        editable: false,
        arenaReady,
        content,
        prepare,
        precontent,
        config,
        help,
        // 版本及信息栏随 packages.js 读取的公告数据同步，入口不另存一份版本号。
        package: packages,
        files,
    };
}
