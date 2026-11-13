// Generate runtime update metadata from the latest section of 更新公告.md.
// Run from any directory: node scripts/sync-update-info.cjs [--check]
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
if (args.some(arg => arg !== '--check')) throw new Error('Usage: node scripts/sync-update-info.cjs [--check]');
const checkOnly = args.includes('--check');
const announcement = fs.readFileSync(path.join(root, '更新公告.md'), 'utf8').replace(/^\uFEFF/, '');
const lines = announcement.split(/\r?\n/);
const sections = lines.map((text, index) => ({ text, index })).filter(line => /^\d{8}(?:[（(]|\s*$)/.test(line.text));
if (!sections.length) throw new Error('更新公告.md 中没有日期段');
const latest = sections.at(-1);
const heading = latest.text.match(/^(\d{8})（(\d+\.\d+\.\d+)，适配无名杀 ([\d.]+)）$/);
if (!heading) throw new Error('最新公告标题须为 YYYYMMDD（扩展版本，适配无名杀 本体版本）');
const [, date, version, gameVersion] = heading;
const changelog = fs.readFileSync(path.join(root, '更新日志.md'), 'utf8');
const logSections = changelog.split(/\r?\n/).filter(line => /^\d{8}(?:[（(]|\s*$)/.test(line));
if (logSections.at(-1) !== latest.text) throw new Error('更新日志与公告的最新日期、版本或适配本体不一致');

const items = [];
for (const line of lines.slice(latest.index + 1)) {
    if (!line.trim()) continue;
    const match = line.match(/^(\d+)\.(.+)$/);
    if (!match || Number(match[1]) !== items.length + 1) throw new Error(`公告条目编号须从1连续递增: ${line}`);
    items.push(match[2].trim());
}
if (!items.length) throw new Error('最新公告没有更新条目');

const updateInfo = { date, version, gameVersion, items };
const generated = '// 自动生成文件：来源《更新公告.md》的最新日期段，请勿手改。\n' +
    '// 运行 node scripts/sync-update-info.cjs 同步；--check 只校验。\n' +
    '// 日期、扩展版本、适配本体及本次公告由同一份数据提供，不含历史日志。\n' +
    'export const updateInfo = ' + JSON.stringify(updateInfo, null, 4) + ';\n';
const infoPath = path.join(root, 'info.json');
const infoSource = fs.readFileSync(infoPath, 'utf8');
const info = JSON.parse(infoSource);
info.version = version;
const newline = infoSource.includes('\r\n') ? '\r\n' : '\n';
const infoOutput = (JSON.stringify(info, null, 4) + '\n').replace(/\n/g, newline);
const outputs = [['extension/updateInfo.js', generated], ['info.json', infoOutput]];
const stale = outputs.filter(([name, content]) => fs.readFileSync(path.join(root, name), 'utf8') !== content);
if (checkOnly && stale.length) {
    throw new Error('更新信息尚未同步，请运行 node scripts/sync-update-info.cjs: ' + stale.map(([name]) => name).join(', '));
}
if (!checkOnly) for (const [name, content] of stale) fs.writeFileSync(path.join(root, name), content, 'utf8');
console.log(JSON.stringify({ action: checkOnly ? 'checked' : 'synced', date, version, gameVersion, announcementItems: items.length, changedFiles: checkOnly ? [] : stale.map(([name]) => name) }));
