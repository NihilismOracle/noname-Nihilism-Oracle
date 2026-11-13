// 自动生成文件：来源《更新公告.md》的最新日期段，请勿手改。
// 运行 node scripts/sync-update-info.cjs 同步；--check 只校验。
// 日期、扩展版本、适配本体及本次公告由同一份数据提供，不含历史日志。
export const updateInfo = {
    "date": "20261113",
    "version": "1.0.5",
    "gameVersion": "1.11.6.1",
    "items": [
        "修正GitHub附件命名说明：GitHub会过滤实际文件名中的中文；页面显示「诸神寰宇1.0.5.zip」，实际下载为「ZhuShenHuanYu1.0.5.zip」，下载后可自行改为中文名。本地构建仍直接生成中文文件名。",
        "安装包根目录直接是info.json、extension.js、packages.js所在层级，延续无外层目录的打包方式。",
        "发布前新增远端附件校验，检查实际名称、中文显示名称、大小、上传状态与SHA-256；全部通过才公开发布。",
        "同步1.0.5版本信息、README、日志与公告；本次仅修正发布流程，不修改技能。"
    ]
};
