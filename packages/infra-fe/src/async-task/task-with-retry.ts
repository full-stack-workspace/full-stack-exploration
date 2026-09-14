/**
 * @file 让异步任务支持重试
 */


interface RetryTaskContext {
    // 当前第几次执行
    attempt: number;

    // 当前执行失败后，还剩多少次重试机会
    retriesLeft: number;
}

type RetryTask<T> = (context: RetryTaskContext) => T | Promise<T>;

interface RetryOptions {
    /**
     * 首次执行失败后，允许额外重试的次数
     * @default 3
     */
    retries?: number;

    /**
     * 当前上传任务的取消信号
     */
    signal?: AbortSignal;

    // 开发者自定义不重试的 catch 逻辑
    onNonRetryableError?: (error: unknown) => void;
}


/**
 * delay — 支持 AbortSignal 取消的异步延时
 *
 *
 * @param ms - 等待时长，单位为毫秒
 * @param signal - 当前上传任务的取消信号
 * @returns 到达等待时间后 fulfilled 的 Promise
 * @throws {DOMException} signal 已取消或等待期间被取消时，抛出 name 为 AbortError 的异常
 *
 * @example
 * ```ts
 * await delay(1000, signal); // 正常等待 1 秒，或在 signal.abort 时立即结束等待
 * ```
 */
function delay(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // 如果 signal 存在，且在调用 delay 前就已取消，则立即以 AbortError 失败。
      if (signal?.aborted) {
        reject(new DOMException("aborted", "AbortError"));
        return;
      }

      // 正常路径：等待结束后不再需要监听取消事件，应主动解除监听，避免残留引用。
      const t = setTimeout(() => {
        signal?.removeEventListener("abort", onAbort);
        resolve();
      }, ms);

      // 取消路径：阻止尚未执行的 timeout 回调，并让等待立即以 AbortError 失败。
      // 使用函数声明以利用 hoisting，使上面的 setTimeout 回调可以引用 onAbort。
      function onAbort() {
        clearTimeout(t);
        reject(new DOMException("aborted", "AbortError"));
      }

      // 只监听一次。同一个 AbortSignal 一旦取消便不会恢复，也不需要重复处理。
      signal?.addEventListener("abort", onAbort, { once: true });
    });
}

/**
 * executeWithRetry — 支持重试的异步任务执行器
 *
 * 开发者如何使用：
 * ```ts
 * const result = await executeWithRetry(async () => {
 *     return fetch("https://api.example.com/data");
 * }, { retries: 2, signal: abortSignal });
 * ```
 *
 * @param task - 需要重试的任务
 * @param options - 重试选项
 * @param options.retries - 首次执行失败后，允许额外重试的次数
 * @param options.signal - 当前上传任务的取消信号
 * @param options.onNonRetryableError - 开发者自定义不重试的 catch 逻辑
 * @returns 执行结果
 * @throws {TypeError} task 必须是一个函数
 * @throws {DOMException} signal 已取消或等待期间被取消时，抛出 name 为 AbortError 的异常
 * @throws {Error} 如果任务执行失败，且没有开发者自定义不重试的 catch 逻辑，则抛出错误
 */
export async function executeWithRetry<T>(task: RetryTask<T>, options: RetryOptions = {}): Promise<T> {
    const {
        retries = 3,
        signal,
        onNonRetryableError,
    } = options;

    if (typeof task !== "function") {
        throw new TypeError(`task must be a function. Got ${typeof task}`);
    }

    for (let attempt = 0; attempt <= retries; attempt++) {
        // 如果任务被取消，则立即以 AbortError 失败，退出循环，不再重试
        if (signal?.aborted) {
            throw new DOMException("aborted", "AbortError");
        }

        try {
            const result = await task({
                attempt,
                retriesLeft: retries - attempt,
            });
            // 如果任务成功，则返回结果, 就不再继续执行循环重试了
            return result as T;
        }
        catch (error) {
            // 用户主动暂停或移除任务时立即结束，不把取消当成网络故障重试。
            if ((error as Error).name === "AbortError") {
                throw error;
            }
            if (attempt === retries) {
                throw error;
            }

            // 如果开发者自定义了不重试的 catch 逻辑，则调用它
            if (typeof onNonRetryableError === "function") {
                onNonRetryableError(error);
                return undefined as T;
            }

            await delay(1000, signal);
        }
    }

    return undefined as T;
}

/**
 * createRetryTask — 创建支持重试的异步任务
 *
 * 开发者如何使用：
 * ```ts
 * const taskWithRetry = createRetryTask(async () => {
 *     return fetch("https://api.example.com/data");
 * }, { retries: 3, signal: abortSignal });
 *
 * await taskWithRetry();
 * ```
 *
 * @param task - 需要重试的任务
 * @param options - 重试选项
 * @param options.retries - 首次执行失败后，允许额外重试的次数
 * @param options.signal - 当前上传任务的取消信号
 * @param options.onNonRetryableError - 开发者自定义不重试的 catch 逻辑
 * @returns 零参函数：调用时才真正执行，并套上重试逻辑
 *
 * @throws {TypeError} task 必须是一个函数
 * @throws {DOMException} signal 已取消或等待期间被取消时，抛出 name 为 AbortError 的异常
 * @throws {Error} 如果任务执行失败，且没有开发者自定义不重试的 catch 逻辑，则抛出错误
 */
export function createRetryTask<T>(
    task: RetryTask<T>,
    options: RetryOptions = {},
): () => Promise<T> {
    if (typeof task !== "function") {
        throw new TypeError(`task must be a function. Got ${typeof task}`);
    }

    const { signal } = options;

    if (signal?.aborted) {
        throw new DOMException("aborted", "AbortError");
    }

    // 现在只“打包” task + options，不立刻执行
    return () => executeWithRetry(task, options);
}
