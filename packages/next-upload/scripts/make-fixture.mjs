/**
 * ============================================================================
 * make-fixture.mjs — 生成随机内容的测试用大文件
 * ============================================================================
 *
 * 用法：
 *   node scripts/make-fixture.mjs <SIZE_MB>
 *
 * 例：
 *   node scripts/make-fixture.mjs 100
 *   → 在 fixture/100MB.bin 写出 100 MiB 的随机字节
 *
 * 设计要点：
 * - 用 crypto.randomBytes 保证内容随机（避免 zero-byte 误中 hash 碰撞）
 * - 流式写，分 4 MiB 块，避免大尺寸 OOM
 * - fixture/ 目录已加 .gitignore
 *
 * @module scripts/make-fixture
 */

import { randomBytes } from "node:crypto";
import { createWriteStream, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { argv, exit } from "node:process";

const sizeMB = Number(argv[2]);
if (!Number.isFinite(sizeMB) || sizeMB <= 0) {
  console.error("Usage: node scripts/make-fixture.mjs <SIZE_MB>");
  exit(1);
}

const FIXTURE_DIR = resolve(process.cwd(), "fixture");
mkdirSync(FIXTURE_DIR, { recursive: true });

const outPath = resolve(FIXTURE_DIR, `${sizeMB}MB.bin`);
const out = createWriteStream(outPath);

const BLOCK = 4 * 1024 * 1024;
const totalBytes = sizeMB * 1024 * 1024;
let written = 0;

function writeBlock() {
  while (written < totalBytes) {
    const remain = totalBytes - written;
    const size = Math.min(BLOCK, remain);
    if (!out.write(randomBytes(size))) {
      out.once("drain", writeBlock);
      written += size;
      return;
    }
    written += size;
  }
  out.end(() => {
    console.log(`✓ ${outPath} (${(totalBytes / 1024 / 1024).toFixed(0)} MiB)`);
  });
}

writeBlock();
