/**
 * ============================================================================
 * GET /api/files/[hash] — 流式下载合并产物
 * ============================================================================
 *
 * 响应：
 *   200 — 流式 binary，含 Content-Type / Content-Length / Content-Disposition
 *   404 — 产物不存在
 *
 * 设计：
 * - 不用 public/ 静态目录，体现 Next.js Route Handlers 的流式响应能力
 * - 用 createReadStream + Readable.toWeb 转 web ReadableStream，避免大文件一次读进内存
 * - Content-Disposition 的 filename 从旁路 .name 文件读取
 *
 * @module app/api/files/[hash]
 */

import { NextResponse } from "next/server";

import { getMergedSize, getOriginalName,openMergedStream } from "@/data/uploads";

interface RouteContext {
  params: Promise<{ hash: string }>;
}

export async function GET(_req: Request, ctx: RouteContext) {
  const { hash } = await ctx.params;

  let size: number | null;
  try {
    size = await getMergedSize(hash);
  } catch {
    return NextResponse.json({ error: "Invalid hash" }, { status: 400 });
  }
  if (size === null) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const stream = openMergedStream(hash);
  if (!stream) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const name = (await getOriginalName(hash)) ?? `${hash}.bin`;
  // RFC 6266 兼容：filename 编码为 UTF-8 百分号
  const filenameStar = `filename*=UTF-8''${encodeURIComponent(name)}`;

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": String(size),
      "Content-Disposition": `attachment; ${filenameStar}`,
    },
  });
}
