/**
 * ============================================================================
 * Hash Worker — next-upload
 * ============================================================================
 *
 * 在 Web Worker 内用 SparkMD5 增量算整文件 MD5。
 *
 * 消息协议（main → worker）：
 *   { file: File }
 *
 * 消息协议（worker → main）：
 *   { type: 'progress', value: number }     // 0..1，每 5 次 append 发一次
 *   { type: 'done',     hash: string }
 *   { type: 'error',    message: string }
 *
 * 实现要点：
 * - SparkMD5.ArrayBuffer 是增量 hash 算法，全过程内存峰值 ≈ HASH_CHUNK_SIZE
 * - 用 file.slice(start, end).arrayBuffer() 切块，比 FileReader 简洁
 * - worker 单例，多任务串行排队（在 main 侧的 hash-worker-client 控制）
 *
 * @module workers/hash.worker
 */

/// <reference lib="webworker" />

import SparkMD5 from "spark-md5";

import { HASH_CHUNK_SIZE } from "@/lib/upload/constants";

interface RequestMessage {
  file: File;
}

type ResponseMessage =
  | { type: "progress"; value: number }
  | { type: "done"; hash: string }
  | { type: "error"; message: string };

declare const self: DedicatedWorkerGlobalScope;

self.addEventListener("message", async (ev: MessageEvent<RequestMessage>) => {
  const { file } = ev.data;
  try {
    const hash = await computeMD5(file);
    post({ type: "done", hash });
  } catch (e) {
    post({ type: "error", message: (e as Error).message });
  }
});

function post(msg: ResponseMessage): void {
  self.postMessage(msg);
}

/**
 * 增量计算整个 File 的 MD5
 *
 * @param file - 浏览器 File 对象
 * @returns 32 位 hex 字符串
 *
 * @example
 * const hash = await computeMD5(file); // "a3f5b21..."
 */
async function computeMD5(file: File): Promise<string> {
  const spark = new SparkMD5.ArrayBuffer();
  const total = file.size;
  let offset = 0;
  let appendCount = 0;

  while (offset < total) {
    const end = Math.min(offset + HASH_CHUNK_SIZE, total);
    const buf = await file.slice(offset, end).arrayBuffer();
    spark.append(buf);
    offset = end;
    appendCount++;

    // 每 5 次 append 报一次进度，避免高频 postMessage 拖慢主线程
    if (appendCount % 5 === 0 || offset === total) {
      post({ type: "progress", value: offset / total });
    }
  }

  return spark.end();
}
