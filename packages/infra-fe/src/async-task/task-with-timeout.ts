/**
 * @file 使用 Promise 做一些基本的实现
 */

type Task<T> = () => T | Promise<T>;


/**
 * 使用 Promise.race 实现任务超时
 *
 * @param task 任务函数
 * @param ms 超时时间
 * @returns 返回任务结果或超时错误
 */
export function taskWithTimeout<T>(task: Task<T>, ms: number) {
    // 使用 Promise.race 实现任务超时
    // 只要第一个 Promise 完成（resolve 或 reject），则返回结果
    return Promise.race([
        Promise.resolve(task()),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Task timed out')), ms)),
    ]);
}
