/**
 * ============================================================================
 * POST /api/upload/check — 秒传 / 续传 / 全新 三态判定
 * ============================================================================
 *
 * 请求体（JSON）：
 *   {
 *     fileHash: string,        // 32 位 hex MD5
 *     fileName: string,
 *     fileSize: number,
 *     chunkSize: number,
 *     totalChunks: number
 *   }
 *
 * 响应：
 *   { status: "completed", url: "/api/files/<hash>" }    // 秒传命中
 *   { status: "partial", uploaded: [0,1,2,5,6] }          // 续传
 *   { status: "new" }                                     // 全新文件
 *
 * 错误：
 *   400 — 请求体格式不对 / fileHash 非法
 *
 * @module app/api/upload/check
 */

import { NextResponse } from "next/server";
import type { CheckRequest, CheckResponse } from "@/types/upload";
import { hasMerged, listChunkIndices } from "@/data/uploads";

export async function POST(req: Request) {
  // === 解析 + 校验请求体 ===
  let body: CheckRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body?.fileHash || typeof body.fileHash !== "string") {
    return NextResponse.json({ error: "Missing fileHash" }, { status: 400 });
  }

  // === 三态判定 ===
  try {
    if (await hasMerged(body.fileHash)) {
      const res: CheckResponse = {
        status: "completed",
        url: `/api/files/${body.fileHash}`,
      };
      return NextResponse.json(res);
    }
    const uploaded = await listChunkIndices(body.fileHash);
    if (uploaded.length > 0) {
      const res: CheckResponse = { status: "partial", uploaded };
      return NextResponse.json(res);
    }
    const res: CheckResponse = { status: "new" };
    return NextResponse.json(res);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
