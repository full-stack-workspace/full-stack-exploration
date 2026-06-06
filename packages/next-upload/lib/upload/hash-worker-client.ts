/**
 * ============================================================================
 * Hash Worker Client — 主线程包装
 * ============================================================================
 *
 * 职责：
 * - 懒创建唯一的 hash worker 实例（避免多 worker 抢内存）
 * - 串行化多任务的 compute() 调用（一次只算一个文件）
 * - 把 worker 的 progress 消息转成 onProgress 回调
 * - 把 worker 的 done 消息 resolve 成 Promise<string>
 *
 * @module lib/upload/hash-worker-client
 */

"use client";

/**
 * HashWorkerClient — 单例 + 串行队列
 *
 * 用法：
 * ```ts
 * import { hashWorkerClient } from '@/lib/upload/hash-worker-client'
 * const hash = await hashWorkerClient.compute(file, p => console.log(p))
 * ```
 */
class HashWorkerClient {
  private worker: Worker | null = null;
  private queue: Promise<unknown> = Promise.resolve();

  /**
   * 计算 file 的整文件 MD5
   *
   * @param file - 待算 hash 的浏览器 File 对象
   * @param onProgress - 进度回调（0..1）
   * @returns 32 位 hex MD5 字符串
   */
  compute(file: File, onProgress?: (p: number) => void): Promise<string> {
    // 串行：等前一个任务做完再开始
    const next = this.queue.then(() => this.runOne(file, onProgress));
    this.queue = next.catch(() => undefined); // 失败也让队列继续
    return next;
  }

  private runOne(file: File, onProgress?: (p: number) => void): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const worker = this.getWorker();

      const handler = (ev: MessageEvent<{ type: string; value?: number; hash?: string; message?: string }>) => {
        const msg = ev.data;
        if (msg.type === "progress" && typeof msg.value === "number") {
          onProgress?.(msg.value);
        } else if (msg.type === "done" && typeof msg.hash === "string") {
          worker.removeEventListener("message", handler);
          resolve(msg.hash);
        } else if (msg.type === "error") {
          worker.removeEventListener("message", handler);
          reject(new Error(msg.message ?? "hash worker error"));
        }
      };

      worker.addEventListener("message", handler);
      worker.postMessage({ file });
    });
  }

  private getWorker(): Worker {
    if (!this.worker) {
      // Next.js 16 + Turbopack 原生识别这种构造方式；无需额外打包配置
      this.worker = new Worker(new URL("@/workers/hash.worker.ts", import.meta.url), {
        type: "module",
      });
    }
    return this.worker;
  }
}

/**
 * 全局单例
 */
export const hashWorkerClient = new HashWorkerClient();
