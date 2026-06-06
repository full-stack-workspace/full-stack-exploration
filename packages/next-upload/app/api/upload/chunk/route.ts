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
 *
 * @module app/api/upload/chunk
 */

import { NextResponse } from "next/server";
import type { ChunkResponse } from "@/types/upload";
import { writeChunkAtomic } from "@/data/uploads";

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

  // === 原子写入 ===
  try {
    await writeChunkAtomic(fileHash, index, chunk);
    const res: ChunkResponse = { ok: true, index };
    return NextResponse.json(res);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
