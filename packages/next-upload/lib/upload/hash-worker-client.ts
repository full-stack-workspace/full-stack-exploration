/**
 * ============================================================================
 * @file Hash Worker Client — 主线程包装
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
 * 这个类运行在浏览器主线程，自己不计算 MD5，而是承担三项协调工作：
 *
 * 1. 复用同一个 Web Worker，避免每个文件都创建一条新的计算线程；
 * 2. 把多个 `compute()` 请求串成队列，保证任意时刻只有一个文件在计算；
 * 3. 把 Worker 的消息事件转换为调用方更容易使用的 Promise 和进度回调。
 *
 * 调用关系：
 *
 * ```text
 * compute(file)
 *      │ 将任务追加到 Promise 队列
 *      ▼
 * runOne(file)
 *      │ 注册本次任务的 message 监听器
 *      ▼
 * getWorker()
 *      │ 懒创建或复用 Worker
 *      ▼
 * worker.postMessage({ file })
 *      │
 *      ├── progress ──> onProgress(value)
 *      ├── done ──────> resolve(hash)
 *      └── error ─────> reject(Error)
 * ```
 *
 * 为什么必须串行：当前主线程与 Worker 的消息协议没有 requestId。若同时计算
 * 多个文件，各次 `runOne()` 注册的监听器都会收到同一条消息，无法判断消息属于
 * 哪个文件。串行队列既降低大文件并行计算时的内存压力，也保证同一时刻只有一个
 * 监听器负责当前任务，因此不需要额外的消息关联 ID。
 *
 * 当前边界：
 * - 不支持中途取消正在进行的 hash 计算；
 * - 不负责上传分片，Worker 中的切片只用于增量计算 MD5；
 * - 未监听 Worker 自身的 `error` / `messageerror` 事件，Worker 加载失败或发生未被
 *   Worker 内部捕获的异常时，本次 Promise 可能无法结束。生产化时应补充故障处理。
 *
 * @example
 * ```ts
 * import { hashWorkerClient } from "@/lib/upload/hash-worker-client";
 *
 * const hash = await hashWorkerClient.compute(file, (progress) => {
 *   console.log(`hash progress: ${Math.round(progress * 100)}%`);
 * });
 * ```
 */
class HashWorkerClient {
  /**
   * 浏览器主线程持有的 Worker 实例。
   *
   * 初始为 `null`，第一次真正执行 hash 任务时由 `getWorker()` 懒创建；之后所有
   * 文件都复用该实例，避免重复创建 Worker 的线程和模块加载开销。
   */
  private worker: Worker | null = null;

  /**
   * 表示“此前所有 hash 任务何时执行完”的 Promise 队列尾节点。
   *
   * 它不存放 File 数组，而是通过 Promise 链表达任务先后关系：新任务调用
   * `this.queue.then(...)`，因此只有前一个任务 settled 后才会执行 `runOne()`。
   * 初始值是已 fulfilled 的 Promise，所以第一个任务可以立即开始。
   *
   * 队列属性使用 `Promise<unknown>`，是因为队列只关心前序任务是否结束，
   * 不消费每个任务实际返回的 hash 字符串。
   */
  private queue: Promise<unknown> = Promise.resolve();

  /**
   * 将一个文件的 MD5 计算任务追加到串行队列。
   *
   * 这里会产生两个用途不同的 Promise：
   *
   * - `next`：属于当前调用方，保留本次任务真实的 fulfilled / rejected 结果；
   * - `this.queue`：只作为下一项任务的队列前驱，会吞掉当前错误并恢复为
   *   fulfilled，避免一个文件失败后整条 Promise 链永久处于 rejected 状态。
   *
   * 因此，当前调用方仍然能够收到失败；但后续文件不会因为前一个文件失败而
   * 永远无法开始计算。
   *
   * @param file - 待算 hash 的浏览器 File 对象
   * @param onProgress - 可选进度回调，参数范围为 0..1
   * @returns 当前文件的 32 位十六进制 MD5；Worker 报错时 Promise 会 rejected
   *
   * @example
   * ```ts
   * const hash = await hashWorkerClient.compute(file, (progress) => {
   *   useUploadStore.getState()._setHashProgress(taskId, progress);
   * });
   * ```
   */
  compute(file: File, onProgress?: (p: number) => void): Promise<string> {
    // 将本次 runOne 接到当前队尾：无论队列是否为空，都沿用相同的入队方式。
    const next = this.queue.then(() => this.runOne(file, onProgress));

    // 队列尾节点吞掉错误只是为了让“下一项任务”可以继续；返回给本次调用方的
    // 仍然是原始 next，所以本次计算错误不会被静默隐藏。
    this.queue = next.catch(() => undefined);

    return next;
  }

  /**
   * 执行队首的单个 hash 任务，并把 Worker 消息桥接为 Promise。
   *
   * `runOne()` 被 `compute()` 的 Promise 队列保护，同一时刻只会存在一次有效调用。
   * 它为当前文件注册临时 message 监听器，然后把 File 发送给 Worker：
   *
   * - `progress`：任务尚未结束，只转发进度，继续保留监听器；
   * - `done`：移除监听器并用 hash resolve；
   * - `error`：移除监听器并 reject。
   *
   * 终态必须移除监听器，否则每完成一个文件都会残留一个闭包，后续消息还会
   * 被旧任务接收，造成重复处理和内存泄漏。
   *
   * @param file - 当前队首需要计算 MD5 的文件
   * @param onProgress - 当前任务独享的可选进度回调
   * @returns Worker 返回 `done` 时 fulfilled、返回 `error` 时 rejected 的 Promise
   */
  private runOne(file: File, onProgress?: (p: number) => void): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      // 第一次调用时创建 Worker；后续任务直接复用同一实例。
      const worker = this.getWorker();

      // 该 handler 只服务于当前文件。串行队列保证此时没有其他 runOne handler
      // 同时等待结果，所以当前协议不需要 requestId 也能正确关联消息。
      const handler = (ev: MessageEvent<{ type: string; value?: number; hash?: string; message?: string }>) => {
        const msg = ev.data;

        // 进度消息不是终态：转发给 Store/UI 后继续监听后续 progress 或最终结果。
        if (msg.type === "progress" && typeof msg.value === "number") {
          onProgress?.(msg.value);
        }
        // 成功终态：先解除监听，再完成 Promise 和释放当前队列槽位。
        else if (msg.type === "done" && typeof msg.hash === "string") {
          worker.removeEventListener("message", handler);
          resolve(msg.hash);
        }
        // 失败终态：同样先解除监听。reject 会传给当前调用方，而 compute() 中
        // 队列专用的 catch 会让下一项任务仍然能够继续执行。
        else if (msg.type === "error") {
          worker.removeEventListener("message", handler);
          reject(new Error(msg.message ?? "hash worker error"));
        }
      };

      // 必须先注册监听器再发送 File，避免 Worker 很快返回时错过消息。
      worker.addEventListener("message", handler);

      // File 支持结构化克隆，可直接发送给 Worker；这里浏览器不会把文件内容预先读取为
      // 一个完整 ArrayBuffer。真正的分块读取发生在 hash.worker.ts 中。
      // File 是浏览器结构化克隆算法支持的可序列化 Web 类型，所以可以直接通过 postMessage() 发送给 Worker。代码不需要先在主线程把完整文件读取成 ArrayBuffer；Worker 收到 File 后，再通过 slice().arrayBuffer() 按块读取文件内容。
      worker.postMessage({ file });
    });
  }

  /**
   * 获取共享 Worker，并在首次调用时完成懒初始化。
   *
   * 懒创建可以避免用户从未选择文件时仍初始化 Worker。`new URL(..., import.meta.url)`
   * 让 Next.js / Turbopack 在构建阶段识别 Worker 入口并生成独立资源；`type: "module"`
   * 允许 Worker 文件使用 ESM import。
   *
   * @returns 当前 HashWorkerClient 独占并复用的 Worker 实例
   */
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
 * 应用级 HashWorkerClient 单例。
 *
 * 所有上传任务必须通过同一个实例入队，才能维持“一次只计算一个文件”的约束。
 * 如果不同模块各自 `new HashWorkerClient()`，每个实例都会创建自己的 Worker 和
 * 队列，文件将重新并行计算，失去这里限制内存竞争的设计效果。
 */
export const hashWorkerClient = new HashWorkerClient();
