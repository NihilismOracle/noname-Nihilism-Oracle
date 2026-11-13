#!/usr/bin/env python3
"""Build the importable extension ZIP without a repository wrapper directory."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import zipfile

ROOT = Path(__file__).resolve().parent.parent
FILES = ("extension.js", "packages.js", "info.json", "README.md", "LICENSE", "更新公告.md", "更新日志.md")
DIRECTORIES = ("audio", "character", "extension", "image", "other", "skin")


def build(output_dir: Path) -> dict:
    info = json.loads((ROOT / "info.json").read_text(encoding="utf-8-sig"))
    version = info["version"]
    if info.get("name") != "诸神寰宇" or not re.fullmatch(r"\d+\.\d+\.\d+", version):
        raise ValueError("info.json 必须提供诸神寰宇及三段版本号")
    name = f"诸神寰宇{version}"
    output_dir = output_dir.resolve()
    # Generated artifacts must not be placed inside any directory included in the ZIP.
    if any(output_dir == ROOT / d or ROOT / d in output_dir.parents for d in DIRECTORIES):
        raise ValueError("输出目录不能位于运行资源目录内")
    output_dir.mkdir(parents=True, exist_ok=True)
    archive = output_dir / f"{name}.zip"
    paths = [ROOT / file for file in FILES]
    for directory in DIRECTORIES:
        folder = ROOT / directory
        if not folder.is_dir():
            raise FileNotFoundError(folder)
        paths.extend(p for p in folder.rglob("*") if p.is_file())
    paths.sort(key=lambda p: p.relative_to(ROOT).as_posix())
    if any(p.is_symlink() or not p.is_file() for p in paths):
        raise ValueError("发布文件必须是实际文件，不能是符号链接")
    with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as package:
        for file in paths:
            package.write(file, arcname=file.relative_to(ROOT).as_posix())

    with zipfile.ZipFile(archive) as package:
        names = package.namelist()
        if set(FILES) - set(names):
            raise ValueError("ZIP 根目录缺少扩展入口文件")
        if any(n.startswith(("/", "../")) or ".." in Path(n).parts for n in names):
            raise ValueError("ZIP 含不安全的文件路径")
        if any(n.split("/")[0] not in (*FILES, *DIRECTORIES) for n in names):
            raise ValueError("ZIP 包含额外外层目录或开发文件")
        if package.testzip() is not None:
            raise ValueError("ZIP 完整性验证失败")
        packed_info = json.loads(package.read("info.json").decode("utf-8-sig"))
        if packed_info["version"] != version:
            raise ValueError("ZIP 内版本不一致")

    with archive.open("rb") as stream:
        digest = hashlib.file_digest(stream, "sha256").hexdigest()
    checksum = output_dir / f"{name}.zip.sha256"
    checksum.write_text(f"{digest}  {archive.name}\n", encoding="utf-8")

    announcement = (ROOT / "更新公告.md").read_text(encoding="utf-8-sig")
    headings = list(re.finditer(r"^\d{8}（([^，]+)，适配无名杀 ([\d.]+)）\s*$", announcement, re.M))
    if not headings or headings[-1].group(1) != version:
        raise ValueError("最新公告与打包版本不一致")
    latest = announcement[headings[-1].start():].strip()
    notes = output_dir / "release-notes.md"
    notes.write_text(
        f"下载 **{archive.name}** 安装包。ZIP 根目录直接包含 `info.json`、`extension.js`、`packages.js` 和资源目录，没有仓库名外层文件夹。\n\n"
        "支持扩展 ZIP 导入的客户端可直接导入；手动安装时，将压缩包内容解压到本体的 `extension/诸神寰宇/`。\n\n"
        "GitHub 自动附带的 **Source code (zip)** 是源码归档，请选择上面命名的安装包。\n\n"
        f"{latest}\n\nSHA-256：`{digest}`\n",
        encoding="utf-8",
    )
    result = {"version": version, "name": name, "archive": str(archive), "checksum": str(checksum),
              "notes": str(notes), "files": len(paths), "bytes": archive.stat().st_size, "sha256": digest}
    if os.environ.get("GITHUB_OUTPUT"):
        with open(os.environ["GITHUB_OUTPUT"], "a", encoding="utf-8") as output:
            for key in ("version", "name", "archive", "checksum", "notes"):
                output.write(f"{key}={result[key]}\n")
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir", type=Path, default=ROOT / "dist")
    args = parser.parse_args()
    print(json.dumps(build(args.output_dir), ensure_ascii=False, indent=2))
