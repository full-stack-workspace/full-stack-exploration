/**
 * ============================================================================
 * POST /api/upload/chunk — 上传单个分片
 * ============================================================================
 *
 * 请求：multipart/form-data
 *   fileHash : text
 *   index    : text (number)
 *   chunk    : file (Blob)
 *
 * 响应：
 *   { ok: true, index: number }
 *
 * 错误：
 *   400 — 缺字段 / index 非法 / hash 非法
 *   500 — 由 NEXT_UPLOAD_DEV_FAIL_INDEX 环境变量触发（用于本地测试重试逻辑）
 *
 * 开发用环境变量（生产无影响）：
 *   NEXT_UPLOAD_DEV_THROTTLE_MS — 每个分片写盘前 sleep N 毫秒，模拟慢网络（pause/resume 测试需要慢一点才能在中间点暂停）
 *   NEXT_UPLOAD_DEV_FAIL_INDEX — 形如 "3" 或 "3,7"：列出的 index 永远返回 500，触发指数退避 + MAX_RETRY → failed
 *
 * @module app/api/upload/chunk
 */

import { NextResponse } from "next/server";
import type { ChunkResponse } from "@/types/upload";
import { writeChunkAtomic } from "@/data/uploads";

const DEV_THROTTLE_MS = Number(process.env.NEXT_UPLOAD_DEV_THROTTLE_MS) || 0;
const DEV_FAIL_INDICES = new Set(
  (process.env.NEXT_UPLOAD_DEV_FAIL_INDEX ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => Number(s))
    .filter((n) => Number.isInteger(n) && n >= 0),
);

export async function POST(req: Request) {
  // === 解析 multipart ===
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart" }, { status: 400 });
  }

  const fileHash = form.get("fileHash");
  const indexRaw = form.get("index");
  const chunk = form.get("chunk");

  if (typeof fileHash !== "string" || typeof indexRaw !== "string" || !(chunk instanceof Blob)) {
    return NextResponse.json({ error: "Missing fields (fileHash/index/chunk)" }, { status: 400 });
  }
  const index = Number(indexRaw);
  if (!Number.isInteger(index) || index < 0) {
    return NextResponse.json({ error: "Invalid index" }, { status: 400 });
  }

  // === [DEV] 慢网络模拟 ===
  if (DEV_THROTTLE_MS > 0) {
    await new Promise((r) => setTimeout(r, DEV_THROTTLE_MS));
  }

  // === [DEV] 强制失败某些 index 用于测试重试逻辑 ===
  if (DEV_FAIL_INDICES.has(index)) {
    return NextResponse.json({ error: `dev-injected 500 on index=${index}` }, { status: 500 });
  }

  // === 原子写入 ===
  try {
    await writeChunkAtomic(fileHash, index, chunk);
    const res: ChunkResponse = { ok: true, index };
    return NextResponse.json(res);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
