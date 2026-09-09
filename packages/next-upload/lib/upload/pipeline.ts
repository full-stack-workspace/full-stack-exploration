/**
 * ============================================================================
 * Pipeline — per-task 上传调度器
 * ============================================================================
 *
 * 上传流程：
 * 选择文件
 *   ↓
 * 根据文件大小计算 totalChunks
 *   ↓
 * 生成待上传的分片索引 [0, 1, 2, ...]
 *   ↓
 * 并发池取出一个 index
 *   ↓
 * File.slice(start, end)
 *   ↓
 * 将 Blob 放入 FormData
 *   ↓
 * POST /api/upload/chunk
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
 * uploadWithRetry — 单分片带指数退避重试
 *
 * 不重试：AbortError / 4xx
 * 重试：网络错误 / 5xx
 * 序列：1s → 2s → 4s
 *
 * 重试机制：
 * - `attempt = 0` 是首次请求，`1..MAX_RETRY` 才是重试请求；
 * - 请求成功时通过 `return` 结束函数，不再进入下一轮；
 * - 请求失败且仍可重试时，`catch` 先等待退避时间；
 * - `sleep` 完成后 `catch` 自然结束，`for` 执行 `attempt++`，下一轮
 *   会重新进入 `try` 并再次调用 `apiUploadChunk`；
 * - 不可重试或次数耗尽时通过 `throw` 终止循环，由上层 pipeline 处理失败。
 *
 * 因此当 `MAX_RETRY = 3` 时，总请求次数最多是 4 次：
 * 首次请求 1 次 + 重试 3 次。
 */
async function uploadWithRetry(taskId: string, index: number, signal: AbortSignal): Promise<void> {
  const store = useUploadStore.getState();
  // 从 store 中获取任务
  const task = store.tasks.get(taskId)!;
  // 计算分片起始位置
  const start = index * task.chunkSize;
  // 计算分片结束位置
  const end = Math.min(start + task.chunkSize, task.fileSize);
  // 获取分片 blob
  // file.slice 方法用于获取文件的指定范围的 blob
  const blob = task.file.slice(start, end);

  // 首次请求和后续重试共用这个循环：0 表示首次，1..MAX_RETRY 表示重试。
  for (let attempt = 0; attempt <= MAX_RETRY; attempt++) {
    // 如果任务被中止，直接抛出 AbortError
    if (signal.aborted) {
      throw new DOMException("aborted", "AbortError");
    }

    try {
      // 每进入一轮循环，都会重新标记 inflight 并重新发送一次分片请求。
      useUploadStore.getState()._addInflight(taskId, index);
      await apiUploadChunk({ fileHash: task.fileHash!, index, chunk: blob }, { signal });

      // 只有请求成功才会执行到这里；return 会结束函数，从而停止重试。
      return;
    }
    catch (err) {
      // 本轮请求失败，先撤销 inflight 标记，再判断是否允许下一轮重试。
      useUploadStore.getState()._removeInflight(taskId, index);

      // 用户主动暂停或移除任务时立即结束，不把取消当成网络故障重试。
      if ((err as Error).name === "AbortError") {
        throw err;
      }
      // 4xx 表示当前请求本身有问题，原样重发通常不会成功，因此不重试。
      if (err instanceof HttpError && err.status >= 400 && err.status < 500) {
        throw err;
      }
      // 最后一轮仍失败时向上抛出，runTask 会把整个任务标记为 failed。
      if (attempt === MAX_RETRY) {
        throw err;
      }

      // 网络错误或 5xx：按 1s、2s、4s 指数退避。
      // 注意：sleep 本身不发送请求。等待完成后 catch 结束，for 自动进入
      // 下一轮，再次执行上方的 apiUploadChunk，这才是真正的“重试”。
      await sleep(RETRY_BASE_MS * 2 ** attempt, signal);
    }
  }
}

/**
 * sleep — 支持 AbortSignal 取消的异步延时
 *
 * 普通的 `setTimeout` 无法感知“暂停上传”：即使用户在退避等待期间点击暂停，
 * Promise 仍会等到计时结束。这个函数把定时器与当前任务的 AbortSignal 绑定，
 * 使等待具备与上传请求相同的取消语义：
 *
 * 1. 等待正常结束：清除 abort 监听并 resolve；
 * 2. 等待期间收到 abort：清除定时器并以 AbortError reject；
 * 3. 调用前已经 abort：不创建定时器，立即以 AbortError reject。
 *
 * 这里有两条对称的资源清理路径：
 *
 * ```text
 * timeout 先发生 ──> removeEventListener ──> resolve
 * abort 先发生   ──> clearTimeout        ──> reject
 * ```
 *
 * `abort` 监听使用 `{ once: true }`，因此取消路径触发一次后会由浏览器自动移除；
 * 正常到期路径则必须主动 `removeEventListener`，否则已结束的 sleep 仍会把监听器
 * 挂在长期存活的 signal 上。
 *
 * JavaScript 会串行执行定时器回调和 abort 事件回调。即使两者几乎同时就绪，
 * 也只有先执行的一方能够决定 Promise 的结果，另一条路径对应的资源已经被清理。
 *
 * 注意：这个函数只负责“等待或被取消”，不会主动发起重试。resolve 后，调用方
 * `uploadWithRetry` 的 for 循环进入下一轮，才会再次发送分片请求。
 *
 * @param ms - 等待时长，单位为毫秒
 * @param signal - 当前上传任务的取消信号
 * @returns 到达等待时间后 fulfilled 的 Promise
 * @throws {DOMException} signal 已取消或等待期间被取消时，抛出 name 为 AbortError 的异常
 *
 * @example
 * ```ts
 * await sleep(1000, signal); // 正常等待 1 秒，或在 signal.abort 时立即结束等待
 * ```
 */
function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    // 必须先检查已有状态。AbortSignal 的 abort 事件只触发一次，
    // 如果 signal 在调用 sleep 前就已取消，后注册监听器将永远收不到该事件。
    if (signal.aborted) {
      reject(new DOMException("aborted", "AbortError"));
      return;
    }

    // onAbort 需要清除下面创建的定时器，所以先声明变量，再分别定义回调与定时器。
    // eslint-disable-next-line prefer-const -- t 与 onAbort 互相引用，必须先声明后赋值
    let t: ReturnType<typeof setTimeout>;

    // 取消路径：阻止尚未执行的 timeout 回调，并让等待立即以 AbortError 失败。
    // `{ once: true }` 会在本回调执行后自动移除这个事件监听器。
    const onAbort = () => {
      clearTimeout(t);
      reject(new DOMException("aborted", "AbortError"));
    };

    // 正常路径：等待结束后不再需要监听取消事件，应主动解除监听，避免残留引用。
    t = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    // 只监听一次。同一个 AbortSignal 一旦取消便不会恢复，也不需要重复处理。
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

/**
 * runChunkPool — 维持 `concurrency` 个并发上传槽位，从共享队列取分片
 *
 * 这不是 Web Worker，只是若干条异步循环（Promise 池）。
 * 任一槽位 throw 会让整个 Promise.all 失败，pipeline 据此把任务转 failed。
 */
async function runChunkPool(taskId: string, todo: number[], signal: AbortSignal): Promise<void> {
  const queue = [...todo];
  // 获取 store
  const store = useUploadStore.getState();
  // 获取全局并发数
  const concurrency = store.concurrency;

  const finalConcurrency = Math.max(1, Math.min(queue.length, concurrency));

  const uploaders = Array.from({ length: finalConcurrency }, async () => {
    while (queue.length > 0 && !signal.aborted) {
      const index = queue.shift();
      if (index === undefined) {
        return;
      }
      // 调用 uploadWithRetry 方法，上传分片
      try {
        await uploadWithRetry(taskId, index, signal);
        // 标记分片已上传
        useUploadStore.getState()._markUploaded(taskId, index);
      } catch (err) {
        if ((err as Error).name === "AbortError") {return;}
        throw err;
      }
    }
  });

  // 等待所有上传器完成
  await Promise.all(uploaders);
}

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
  // 如果任务不存在，直接返回
  if (!task) {
    return;
  }

  const signal = task.abortController.signal;

  try {
    /* ---- Phase 1: Hash（如果尚未算过） ---- */
    let hash = task.fileHash;
    // 如果文件 hash 不存在，则计算文件 hash
    if (!hash) {
      store._setStatus(taskId, "hashing");
      hash = await hashWorkerClient.compute(task.file, (p) => {
        store._setHashProgress(taskId, p);
      });
      store._setHash(taskId, hash);
    }

    // 如果任务被中止，直接返回
    if (signal.aborted) {
      return;
    }

    /* ---- Phase 2: Check ---- */
    store._setStatus(taskId, "checking");
    // 调用 apiCheck 方法，检查文件是否已经上传过
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
    // 调用 runChunkPool 方法，并发上传剩余分片
    await runChunkPool(taskId, todo, signal);
    // 如果任务被中止，直接返回
    if (signal.aborted) {
      return;
    }

    /* ---- Phase 4: 合并 ---- */
    store._setStatus(taskId, "merging");
    // 调用 apiMerge 方法，合并文件
    const merge = await apiMerge(
      {
        fileHash: hash,
        fileName: task.fileName,
        totalChunks: task.totalChunks
      },
      { signal },
    );
    // 设置合并后的 URL 和合并时间
    store._setMerged(taskId, merge.url, merge.mergedAt);
    store._setStatus(taskId, "completed");
  }
  catch (e) {
    // 如果任务被中止，直接返回
    if ((e as Error).name === "AbortError") {
      // 暂停 / 移除引发；store 状态已被对应 action 设置好
      return;
    }
    // 设置任务状态为 failed，并设置错误信息
    store._setStatus(taskId, "failed", (e as Error).message);
  }
}

/* =================================================================
 * Dev: 把 runTask 挂到 window 方便自动化测试驱动 resume / retry
 * 仅在 NODE_ENV !== 'production' 时暴露
 * ================================================================ */
if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  (window as unknown as { __runTask?: typeof runTask }).__runTask = runTask;
}
