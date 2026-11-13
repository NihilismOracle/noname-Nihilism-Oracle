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
        package: packages,
        files,
    };
}
