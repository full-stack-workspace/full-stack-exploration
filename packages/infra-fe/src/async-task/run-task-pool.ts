/**
 * @file 任务池并发控制
 */

import { createRetryTask, executeWithRetry } from './task-with-retry';

interface TaskContext {
    // 当前任务在 tasks 数组中的索引
    taskIndex: number;
}

type Task<T> = (context: TaskContext) => T | Promise<T>;

interface TaskPoolOptions {
    // 任务池中最多同时执行的任务数
    concurrency?: number;

    // 任务池中任务的排队策略
    // queueStrategy?: 'fifo' | 'lifo';
}

// 默认的最大并发数
const DEFAULT_CONCURRENCY = 4;
// 默认的排队策略是 FIFO，先进先出
// const DEFAULT_QUEUE_STRATEGY = 'fifo';

/**
 * 并发执行任务池
 *
 * @param tasks 任务列表
 * @param options 任务池选项
 * @returns 任务结果列表
 * @throws {TypeError} 如果 tasks 不是数组或为空，或者 concurrency 不是数字或小于 1
 *
 * @example
 * const tasks = [
 *     () => Promise.resolve('task 1'),
 *     () => Promise.resolve('task 2'),
 *     () => Promise.resolve('task 3'),
 * ];
 * const results = await runTaskPool(tasks);
 * console.log(results); // ['task 1', 'task 2', 'task 3']
 *
 * @example
 * // 每个池任务内部再套 executeWithRetry：并发由池控制，失败重试由 retry 控制
 * const tasks = urls.map((url) => {
 *     return ({ taskIndex }: TaskContext) => executeWithRetry(
 *         async ({ attempt }) => fetchItem(url, attempt),
 *         { retries: 2 },
 *     );
 * });
 * await runTaskPool(tasks, { concurrency: 3 });
 */
export async function runTaskPool<T>(tasks: Array<Task<T>>, options: TaskPoolOptions = {}): Promise<T[]> {
    if (!Array.isArray(tasks) || tasks.length === 0) {
        throw new TypeError('tasks must be an array and not empty');
    }

    const { concurrency = DEFAULT_CONCURRENCY } = options;
    if (typeof concurrency !== 'number' || concurrency < 1) {
        throw new TypeError('options.concurrency must be a number and greater than 0');
    }

    // 任务结果列表，这里创建的是一个长度为 tasks.length 的数组，用于存储每个任务的结果
    // 是稀疏数组，因为有些任务可能还没有执行完成，所以有些位置是 undefined
    const results: T[] = new Array(tasks.length);
    let cursor = 0;
    // 每个 worker 自己从队列取任务并 await；多个 worker 同时跑才是并发
    // 单循环里 await 会等当前任务结束才取下一个，那是串行
    const runWorker = async () => {
        while (cursor < tasks.length) {
            const taskIndex = cursor;
            cursor += 1;
            results[taskIndex] = await tasks[taskIndex]({ taskIndex });
        }
    };

    // 启动 workerCount 个 worker 同时跑
    const workerCount = Math.min(concurrency, tasks.length);
    // 这里的 Array.from 与使用 for 循环同时启动多个 worker 是等价的
    await Promise.all(Array.from({
        length: workerCount,
    }, (_, index) => runWorker()));

    return results;
}

async function demo() {
    // 1. 基础：延迟函数，调用时才开始执行
    const basicTasks = [
        () => Promise.resolve('task 1'),
        () => Promise.resolve('task 2'),
        () => Promise.resolve('task 3'),
    ];
    console.log(await runTaskPool(basicTasks));
    // ['task 1', 'task 2', 'task 3']

    // 2. 使用 taskIndex，并限制并发
    const indexedTasks = [10, 20, 30].map((value) => async ({ taskIndex }: TaskContext) => `index=${taskIndex}, value=${value}`);
    console.log(await runTaskPool(indexedTasks, { concurrency: 2 }));
    // ['index=0, value=10', 'index=1, value=20', 'index=2, value=30']

    // 3. 和 executeWithRetry 组合（推荐写法）
    //    池子要的是 Task：() => Promise，不能先 await executeWithRetry(...)
    //    否则那次请求在进池之前就已经开始了
    const urls = ['a', 'b', 'c'];
    const retryInPoolTasks = urls.map((url) => ({ taskIndex }: TaskContext) => executeWithRetry(
            async ({ attempt, retriesLeft }) => 
                // 这里才是真正的上传 / 请求
                 `uploaded ${url} (task#${taskIndex}, attempt=${attempt}, left=${retriesLeft})`
            ,
            { retries: 2 },
        ));
    console.log(await runTaskPool(retryInPoolTasks, { concurrency: 2 }));

    // 4. 和 createRetryTask 组合：先打包成零参函数，再交给池
    //    createRetryTask 返回 () => Promise<T>，正好是 Task 的形状
    const packedTasks = urls.map((url) => {
        const retryTask = createRetryTask(
            async () => `uploaded ${url}`,
            { retries: 2 },
        );
        return ({ taskIndex }: TaskContext) => retryTask().then((value) => `${value} @${taskIndex}`);
    });
    console.log(await runTaskPool(packedTasks, { concurrency: 2 }));

    // 5. 共享 AbortSignal：取消时池里未完成的任务停止重试
    const controller = new AbortController();
    const cancellableTasks = urls.map((url) => () => executeWithRetry(
            async () => `uploaded ${url}`,
            { retries: 3, signal: controller.signal },
        ));
    const running = runTaskPool(cancellableTasks, { concurrency: 2 });
    controller.abort();
    await running.catch((error) => {
        console.log((error as Error).name); // AbortError
    });
}

if ((import.meta as ImportMeta & { main?: boolean }).main) {
    await demo();
}
