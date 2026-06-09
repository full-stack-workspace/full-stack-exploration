/**
 * ============================================================================
 * Pipeline — per-task 上传调度器
 * ============================================================================
 *
 * 状态机（与 store.ts 顶部注释同一份图）：
 *
 *   hashing → checking → (uploading → merging → completed) | instant
 *                              ↓
 *                       paused (pause) / failed (max retry exhausted)
 *
 * 重试规则（spec §6.5）：
 * - 仅在网络错误 / 5xx 上重试；4xx 与 AbortError 立刻终止
 * - 退避序列：1s → 2s → 4s（exponential，base = RETRY_BASE_MS）
 * - 单分片超过 MAX_RETRY 次重试 → 整任务转 failed
 *
 * 调用规约：
 * - addFiles 后，UI 对每个新建 id 调 runTask(id)
 * - resumeTask / retryTask 后，UI 也调 runTask(id)（store 已重置 AbortController）
 *
 * @module lib/upload/pipeline
 */

"use client";

import { HttpError } from "@/types/upload";

import { apiCheck, apiMerge,apiUploadChunk } from "./api";
import { MAX_RETRY, RETRY_BASE_MS } from "./constants";
import { hashWorkerClient } from "./hash-worker-client";
import { useUploadStore } from "./store";

/**
 * runTask — 启动 / 续跑某个 task 的 pipeline
 *
 * 幂等性：被同一个 id 重复调用是安全的，
 * 因为 store.resumeTask / retryTask 已把状态重置到 'checking' 并换了 AbortController。
 *
 * @param taskId 任务 id
 */
export async function runTask(taskId: string): Promise<void> {
  const store = useUploadStore.getState();
  const task = store.tasks.get(taskId);
  if (!task) {return;}

  const signal = task.abortController.signal;

  try {
    /* ---- Phase 1: Hash（如果尚未算过） ---- */
    let hash = task.fileHash;
    if (!hash) {
      store._setStatus(taskId, "hashing");
      hash = await hashWorkerClient.compute(task.file, (p) => {
        store._setHashProgress(taskId, p);
      });
      store._setHash(taskId, hash);
    }
    if (signal.aborted) {return;}

    /* ---- Phase 2: Check ---- */
    store._setStatus(taskId, "checking");
    const check = await apiCheck(
      {
        fileHash: hash,
        fileName: task.fileName,
        fileSize: task.fileSize,
        chunkSize: task.chunkSize,
        totalChunks: task.totalChunks,
      },
      { signal },
    );

    if (check.status === "completed") {
      store._setMerged(taskId, check.url, Date.now());
      store._setStatus(taskId, "instant");
      return;
    }

    const uploaded = check.status === "partial" ? new Set(check.uploaded) : new Set<number>();
    // 写回 uploadedIndices（resume 时跳过）
    for (const idx of uploaded) {
      store._markUploaded(taskId, idx);
    }

    /* ---- Phase 3: 并发上传剩余分片 ---- */
    store._setStatus(taskId, "uploading");
    const todo: number[] = [];
    for (let i = 0; i < task.totalChunks; i++) {
      if (!uploaded.has(i)) {todo.push(i);}
    }
    await runChunkPool(taskId, todo, signal);
    if (signal.aborted) {return;}

    /* ---- Phase 4: 合并 ---- */
    store._setStatus(taskId, "merging");
    const merge = await apiMerge(
      { fileHash: hash, fileName: task.fileName, totalChunks: task.totalChunks },
      { signal },
    );
    store._setMerged(taskId, merge.url, merge.mergedAt);
    store._setStatus(taskId, "completed");
  } catch (e) {
    if ((e as Error).name === "AbortError") {
      // 暂停 / 移除引发；store 状态已被对应 action 设置好
      return;
    }
    store._setStatus(taskId, "failed", (e as Error).message);
  }
}

/* =================================================================
 * 内部辅助
 * ================================================================ */

/**
 * runChunkPool — 维持 `concurrency` 个并发上传 worker，喂队列
 *
 * 单一 worker 失败（throw）会让整个 Promise.all 失败，pipeline 据此把任务转 failed。
 */
async function runChunkPool(taskId: string, todo: number[], signal: AbortSignal): Promise<void> {
  const queue = [...todo];
  const store = useUploadStore.getState();
  const concurrency = store.concurrency;

  const workers = Array.from({ length: Math.max(1, Math.min(queue.length, concurrency)) }, async () => {
    while (queue.length > 0 && !signal.aborted) {
      const index = queue.shift();
      if (index === undefined) {return;}
      try {
        await uploadWithRetry(taskId, index, signal);
        useUploadStore.getState()._markUploaded(taskId, index);
      } catch (err) {
        if ((err as Error).name === "AbortError") {return;}
        throw err;
      }
    }
  });
  await Promise.all(workers);
}

/**
 * uploadWithRetry — 单分片带指数退避重试
 *
 * 不重试：AbortError / 4xx
 * 重试：网络错误 / 5xx
 * 序列：1s → 2s → 4s
 */
async function uploadWithRetry(taskId: string, index: number, signal: AbortSignal): Promise<void> {
  const store = useUploadStore.getState();
  const task = store.tasks.get(taskId)!;
  const start = index * task.chunkSize;
  const end = Math.min(start + task.chunkSize, task.fileSize);
  const blob = task.file.slice(start, end);

  for (let attempt = 0; attempt <= MAX_RETRY; attempt++) {
    if (signal.aborted) {throw new DOMException("aborted", "AbortError");}
    try {
      useUploadStore.getState()._addInflight(taskId, index);
      await apiUploadChunk({ fileHash: task.fileHash!, index, chunk: blob }, { signal });
      return;
    } catch (err) {
      useUploadStore.getState()._removeInflight(taskId, index);
      if ((err as Error).name === "AbortError") {throw err;}
      if (err instanceof HttpError && err.status >= 400 && err.status < 500) {throw err;}
      if (attempt === MAX_RETRY) {throw err;}
      await sleep(RETRY_BASE_MS * 2 ** attempt, signal);
    }
  }
}

/**
 * 可中断的 sleep
 */
function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("aborted", "AbortError"));
      return;
    }
    // eslint-disable-next-line prefer-const -- t 与 onAbort 互相引用，必须先声明后赋值
    let t: ReturnType<typeof setTimeout>;
    const onAbort = () => {
      clearTimeout(t);
      reject(new DOMException("aborted", "AbortError"));
    };
    t = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

/* =================================================================
 * Dev: 把 runTask 挂到 window 方便自动化测试驱动 resume / retry
 * 仅在 NODE_ENV !== 'production' 时暴露
 * ================================================================ */
if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  (window as unknown as { __runTask?: typeof runTask }).__runTask = runTask;
}
