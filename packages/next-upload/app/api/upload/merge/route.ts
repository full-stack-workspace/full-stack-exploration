/**
 * ============================================================================
 * POST /api/upload/merge — 合并所有分片
 * ============================================================================
 *
 * 请求体（JSON）：
 *   {
 *     fileHash: string,
 *     fileName: string,        // 原文件名，用于下载时 Content-Disposition
 *     totalChunks: number
 *   }
 *
 * 响应：
 *   { ok: true, url: "/api/files/<hash>", size: number, mergedAt: number }
 *
 * 错误：
 *   400 — 缺片（响应含 { error, missing: number[] }）/ hash 非法
 *
 * @module app/api/upload/merge
 */

import { NextResponse } from "next/server";

import { mergeChunks } from "@/data/uploads";
import type { MergeRequest, MergeResponse } from "@/types/upload";

export async function POST(req: Request) {
  // === 解析 ===
  let body: MergeRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body?.fileHash || !body.fileName || !Number.isInteger(body.totalChunks)) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // === 合并（mergeChunks 内部已做幂等 + 缺片校验 + 流式 pipe） ===
  try {
    const { size, mergedAt } = await mergeChunks(body.fileHash, body.totalChunks, body.fileName);
    const res: MergeResponse = {
      ok: true,
      url: `/api/files/${body.fileHash}`,
      size,
      mergedAt,
    };
    return NextResponse.json(res);
  } catch (e) {
    const err = e as Error & { missing?: number[] };
    return NextResponse.json(
      { error: err.message, missing: err.missing },
      { status: 400 },
    );
  }
}
