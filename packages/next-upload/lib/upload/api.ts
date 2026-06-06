/**
 * ============================================================================
 * 上传 API client — next-upload
 * ============================================================================
 *
 * 封装三个上传端点的 fetch 调用。所有调用都接 AbortSignal，
 * 把 AbortError 透明传出（pipeline 据此分辨"用户暂停"与"网络错误"）。
 *
 * 端点：
 * - POST /api/upload/check
 * - POST /api/upload/chunk (multipart)
 * - POST /api/upload/merge
 *
 * @module lib/upload/api
 */

"use client";

import type {
  CheckRequest,
  CheckResponse,
  ChunkResponse,
  MergeRequest,
  MergeResponse,
} from "@/types/upload";
import { HttpError } from "@/types/upload";

interface FetchOpts {
  signal?: AbortSignal;
}

/**
 * 统一的错误检查：把 非 2xx 转成 HttpError（带 status），
 * pipeline.uploadWithRetry 据此区分 4xx（不重试）与 5xx（重试）
 */
async function ensureOk(res: Response): Promise<void> {
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) msg = body.error;
    } catch {
      /* ignore */
    }
    throw new HttpError(res.status, msg);
  }
}

/* =================================================================
 * /api/upload/check
 * ================================================================ */

/**
 * 调 check 端点，判秒传 / 续传 / 全新
 *
 * @example
 * const r = await apiCheck({ fileHash, fileName, fileSize, chunkSize, totalChunks }, { signal })
 * if (r.status === 'completed') { ... }
 */
export async function apiCheck(body: CheckRequest, opts: FetchOpts = {}): Promise<CheckResponse> {
  const res = await fetch("/api/upload/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: opts.signal,
  });
  await ensureOk(res);
  return res.json();
}

/* =================================================================
 * /api/upload/chunk
 * ================================================================ */

interface UploadChunkArgs {
  fileHash: string;
  index: number;
  chunk: Blob;
}

/**
 * 上传单个分片
 */
export async function apiUploadChunk(args: UploadChunkArgs, opts: FetchOpts = {}): Promise<ChunkResponse> {
  const form = new FormData();
  form.set("fileHash", args.fileHash);
  form.set("index", String(args.index));
  form.set("chunk", args.chunk);
  const res = await fetch("/api/upload/chunk", {
    method: "POST",
    body: form,
    signal: opts.signal,
  });
  await ensureOk(res);
  return res.json();
}

/* =================================================================
 * /api/upload/merge
 * ================================================================ */

/**
 * 触发服务端合并
 */
export async function apiMerge(body: MergeRequest, opts: FetchOpts = {}): Promise<MergeResponse> {
  const res = await fetch("/api/upload/merge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: opts.signal,
  });
  await ensureOk(res);
  return res.json();
}
