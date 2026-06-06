/**
 * ============================================================================
 * 服务端 FS 数据访问层 — next-upload
 * ============================================================================
 *
 * 路线 A：文件系统作状态。本文件封装所有读写 .uploads/ 的纯函数。
 *
 * 目录布局（spec §4.2）：
 *   .uploads/
 *   ├── chunks/<fileHash>/<index>.part
 *   ├── merged/<fileHash>.bin
 *   └── merged/<fileHash>.name        ← 原文件名（文本）
 *
 * 设计原则：
 * - 所有路径通过 getXxx() 函数获得，禁止在 Route Handler 里手拼
 * - 写操作原子（tmp + rename），避免半截文件被误识别
 * - 暴露给 Route Handler 的函数都是 async；纯路径函数同步
 *
 * @module data/uploads
 */

import { promises as fs, createReadStream, createWriteStream } from "node:fs";
import { join, resolve } from "node:path";
import { Readable } from "node:stream";

/* =================================================================
 * 路径工具（纯函数，无 I/O）
 * ================================================================ */

/**
 * .uploads/ 根目录绝对路径（相对仓库根 process.cwd()）
 *
 * 注意：Next.js dev server 在 packages/next-upload/ 下启动时，
 * process.cwd() = 该 package 目录，所以 .uploads/ 会落在 package 内。
 * 这是预期行为：把 demo 的运行时数据隔离在 package 内不污染仓库根。
 */
export function getUploadsRoot(): string {
  return resolve(process.cwd(), ".uploads");
}

export function getChunksRoot(): string {
  return join(getUploadsRoot(), "chunks");
}

export function getMergedRoot(): string {
  return join(getUploadsRoot(), "merged");
}

export function getChunkDir(hash: string): string {
  assertValidHash(hash);
  return join(getChunksRoot(), hash);
}

export function getChunkPath(hash: string, index: number): string {
  return join(getChunkDir(hash), `${index}.part`);
}

export function getChunkTmpPath(hash: string, index: number): string {
  return join(getChunkDir(hash), `${index}.part.tmp`);
}

export function getMergedPath(hash: string): string {
  assertValidHash(hash);
  return join(getMergedRoot(), `${hash}.bin`);
}

export function getNamePath(hash: string): string {
  assertValidHash(hash);
  return join(getMergedRoot(), `${hash}.name`);
}

/**
 * 校验 hash 是合法 MD5（32 位十六进制）—— 防 path traversal
 */
function assertValidHash(hash: string): void {
  if (!/^[a-f0-9]{32}$/i.test(hash)) {
    throw new Error(`Invalid fileHash: ${hash}`);
  }
}

/* =================================================================
 * 查询
 * ================================================================ */

/**
 * 检查合并产物是否存在（秒传判定）
 */
export async function hasMerged(hash: string): Promise<boolean> {
  try {
    await fs.access(getMergedPath(hash));
    return true;
  } catch {
    return false;
  }
}

/**
 * 列出指定文件已上传的分片 index（续传判定）
 *
 * 行为：
 * - 目录不存在 → 返回 []
 * - 跳过 .part.tmp 文件（未完成的原子写）
 * - 排序升序返回
 */
export async function listChunkIndices(hash: string): Promise<number[]> {
  const dir = getChunkDir(hash);
  try {
    const files = await fs.readdir(dir);
    return files
      .filter((f) => f.endsWith(".part") && !f.endsWith(".part.tmp"))
      .map((f) => Number(f.replace(".part", "")))
      .filter((n) => Number.isInteger(n) && n >= 0)
      .sort((a, b) => a - b);
  } catch {
    return [];
  }
}

/* =================================================================
 * 写入
 * ================================================================ */

/**
 * 原子写单个分片：先写 .part.tmp 再 rename 成 .part
 *
 * 这样即便写入中途崩溃，旁边只会有 .part.tmp 残留，
 * 不会被 listChunkIndices 误认为成功的分片。
 */
export async function writeChunkAtomic(
  hash: string,
  index: number,
  blob: Blob,
): Promise<void> {
  await fs.mkdir(getChunkDir(hash), { recursive: true });
  const tmp = getChunkTmpPath(hash, index);
  const final = getChunkPath(hash, index);
  const buf = Buffer.from(await blob.arrayBuffer());
  await fs.writeFile(tmp, buf);
  await fs.rename(tmp, final);
}

/**
 * 合并所有分片：按 index 升序流式 cat 到 merged/<hash>.bin
 *
 * 步骤：
 * 1. 校验 0..totalChunks-1 全部到位，缺片直接抛错（Route Handler 转 400）
 * 2. 幂等：若 merged/<hash>.bin 已存在，直接 stat 返回 size
 * 3. createWriteStream 顺序 pipe 每个 .part
 * 4. 旁路写 <hash>.name 记录原文件名
 * 5. 删除整个 chunks/<hash>/ 目录
 *
 * @returns { size, mergedAt }
 */
export async function mergeChunks(
  hash: string,
  totalChunks: number,
  originalName: string,
): Promise<{ size: number; mergedAt: number }> {
  // 幂等
  if (await hasMerged(hash)) {
    const stat = await fs.stat(getMergedPath(hash));
    return { size: stat.size, mergedAt: stat.mtimeMs };
  }

  // 校验完整性
  const have = new Set(await listChunkIndices(hash));
  const missing: number[] = [];
  for (let i = 0; i < totalChunks; i++) {
    if (!have.has(i)) missing.push(i);
  }
  if (missing.length > 0) {
    const err = new Error(`Missing chunks: ${missing.slice(0, 10).join(",")}${missing.length > 10 ? "..." : ""}`);
    (err as Error & { missing: number[] }).missing = missing;
    throw err;
  }

  await fs.mkdir(getMergedRoot(), { recursive: true });
  const outPath = getMergedPath(hash);
  const out = createWriteStream(outPath);

  // 顺序流式 pipe，避免一次性把整个文件读进内存
  for (let i = 0; i < totalChunks; i++) {
    await new Promise<void>((res, rej) => {
      const r = createReadStream(getChunkPath(hash, i));
      r.on("error", rej);
      r.on("end", res);
      r.pipe(out, { end: false });
    });
  }
  await new Promise<void>((res, rej) => {
    out.end((err: unknown) => (err ? rej(err as Error) : res()));
  });

  // 旁路写原文件名（用于下载时拼 Content-Disposition）
  await fs.writeFile(getNamePath(hash), originalName, "utf8");

  // 清理已合并的分片目录
  await fs.rm(getChunkDir(hash), { recursive: true, force: true });

  const stat = await fs.stat(outPath);
  return { size: stat.size, mergedAt: stat.mtimeMs };
}

/**
 * 读取原文件名（下载时用）
 */
export async function getOriginalName(hash: string): Promise<string | null> {
  try {
    return await fs.readFile(getNamePath(hash), "utf8");
  } catch {
    return null;
  }
}

/**
 * 打开合并产物的 ReadableStream（用于流式下载）
 *
 * @returns 可直接传给 Next.js Response 构造器的 web ReadableStream
 */
export function openMergedStream(hash: string): ReadableStream | null {
  try {
    const node = createReadStream(getMergedPath(hash));
    return Readable.toWeb(node) as ReadableStream;
  } catch {
    return null;
  }
}

/**
 * 取合并产物大小
 */
export async function getMergedSize(hash: string): Promise<number | null> {
  try {
    const stat = await fs.stat(getMergedPath(hash));
    return stat.size;
  } catch {
    return null;
  }
}
