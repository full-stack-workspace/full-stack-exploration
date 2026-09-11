/**
 * @file 自己实现一个 Promise，便于掌握 Promise 的实现原理
 *
 * @description 自己实现一个 Promise，包括 Promise 的基本功能、链式调用等
 */

// Promise 状态
type PromiseState = 'pending' | 'fulfilled' | 'rejected';

// Promise 回调函数
type OnFulfilled<T> = (value: T) => unknown;
type OnRejected = (reason: unknown) => unknown;
type OnFinally = () => unknown;

type Executor<T> = (
    resolve: (value: T | CustomPromise<T>) => void,
    reject: OnRejected,
) => void;

export class CustomPromise<T> {
    private state: PromiseState;
    private value: unknown;
    private reason: unknown;
    private onFulfilledCallbacks: Array<() => void>;
    private onRejectedCallbacks: Array<() => void>;

    constructor(executor: Executor<T>) {
        this.state = 'pending';
        this.value = undefined;
        this.reason = undefined;
        this.onFulfilledCallbacks = [];
        this.onRejectedCallbacks = [];

        const fulfill = (value: T) => {
            if (this.state !== 'pending') {
                return;
            }
            this.state = 'fulfilled';
            this.value = value;
            this.onFulfilledCallbacks.forEach(callback => callback());
        };

        const reject = (reason: unknown) => {
            if (this.state !== 'pending') {
                return;
            }
            this.state = 'rejected';
            this.reason = reason;
            this.onRejectedCallbacks.forEach(callback => callback());
        };

        // 吸收 thenable / 另一个 Promise，避免把 Promise 对象本身当成 value
        const resolve = (value: unknown) => {
            if (this.state !== 'pending') {
                return;
            }
            if (value === this) {
                reject(new TypeError('Chaining cycle detected for promise'));
                return;
            }
            if (value instanceof CustomPromise) {
                value.then(resolve, reject);
                return;
            }

            if (value !== null && (typeof value === 'object' || typeof value === 'function')) {
                let then: unknown;
                try {
                    then = (value as { then?: unknown }).then;
                }
                catch (error) {
                    reject(error);
                    return;
                }

                if (typeof then === 'function') {
                    let called = false;
                    try {
                        (
                            then as (
                                this: unknown,
                                onResolve: (value: unknown) => void,
                                onReject: (reason: unknown) => void,
                            ) => void
                        ).call(
                            value,
                            (next: unknown) => {
                                if (called) {
                                    return;
                                }
                                called = true;
                                resolve(next);
                            },
                            (reason: unknown) => {
                                if (called) {
                                    return;
                                }
                                called = true;
                                reject(reason);
                            },
                        );
                    }
                    catch (error) {
                        if (!called) {
                            reject(error);
                        }
                    }
                    return;
                }
            }

            fulfill(value as T);
        };

        // 执行 executor, 并为 executor 提供两个参数： resolve、 reject
        // 便于开发者控制 Promise 的状态
        try {
            executor(resolve, reject);
        }
        catch (error) {
            reject(error);
        }
    }

    // 实例方法： then、catch、finally

    then(onFulfilled?: OnFulfilled<T>, onRejected?: OnRejected) {
        const fulfilled: OnFulfilled<T> = typeof onFulfilled === 'function'
            ? onFulfilled
            : (value: T) => value;
        const rejected: OnRejected = typeof onRejected === 'function'
            ? onRejected
            : (reason: unknown) => { throw reason; };

        return new CustomPromise<T>((resolve, reject) => {
            const run = (callback: (arg: unknown) => unknown, arg: unknown) => {
                // Promise/A+：onFulfilled / onRejected 必须异步执行
                queueMicrotask(() => {
                    try {
                        // 回调正常返回值应 fulfill 下游；thenable 由下游 resolve 吸收
                        resolve(callback(arg) as T);
                    }
                    catch (error) {
                        reject(error);
                    }
                });
            };

            if (this.state === 'fulfilled') {
                run(fulfilled as (arg: unknown) => unknown, this.value);
                return;
            }

            if (this.state === 'rejected') {
                run(rejected, this.reason);
                return;
            }

            this.onFulfilledCallbacks.push(() => {
                run(fulfilled as (arg: unknown) => unknown, this.value);
            });
            this.onRejectedCallbacks.push(() => {
                run(rejected, this.reason);
            });
        });
    }

    catch(onRejected: OnRejected) {
        return this.then(undefined, onRejected);
    }

    finally(onFinally: OnFinally) {
        return this.then(
            value => CustomPromise.resolve(onFinally()).then(() => value),
            reason => CustomPromise.resolve(onFinally()).then(() => {
                throw reason;
            }),
        );
    }

    // 静态方法： resolve、 reject
    static resolve<U>(value: U | CustomPromise<U>): CustomPromise<U> {
        if (value instanceof CustomPromise) {
            return value;
        }
        return new CustomPromise<U>((resolve) => {
            resolve(value);
        });
    }

    static reject<U = never>(reason: unknown): CustomPromise<U> {
        return new CustomPromise<U>((_, reject) => {
            reject(reason);
        });
    }

    // 静态方法： all、allSettled、race、any
    // 全部成功才成功，一个失败就失败
    static all(iterable: Iterable<unknown>) {
        return new CustomPromise((resolve, reject) => {
            const arr = Array.from(iterable);
            if (arr.length === 0) {
                resolve([]);
                return;
            }

            const results: unknown[] = [];
            let fulfilledCount = 0;
            arr.forEach((item, index) => {
                CustomPromise.resolve(item).then(value => {
                    results[index] = value;
                    fulfilledCount += 1;
                    if (fulfilledCount === arr.length) {
                        resolve(results);
                    }
                }, reject);
            });
        });
    }

    // 等全部 settled，不论成功或失败
    static allSettled(iterable: Iterable<unknown>) {
        return new CustomPromise((resolve) => {
            const arr = Array.from(iterable);
            if (arr.length === 0) {
                resolve([]);
                return;
            }

            const results: unknown[] = [];
            let settledCount = 0;
            const settle = (index: number, record: unknown) => {
                results[index] = record;
                settledCount += 1;
                if (settledCount === arr.length) {
                    resolve(results);
                }
            };

            arr.forEach((item, index) => {
                CustomPromise.resolve(item).then(
                    value => settle(index, { status: 'fulfilled', value }),
                    reason => settle(index, { status: 'rejected', reason }),
                );
            });
        });
    }

    // 第一个 settled 的结果，不论成功或失败
    static race(iterable: Iterable<unknown>) {
        return new CustomPromise((resolve, reject) => {
            const arr = Array.from(iterable);
            arr.forEach(item => {
                CustomPromise.resolve(item).then(resolve, reject);
            });
        });
    }

    // 第一个 fulfilled 的结果，全部失败则 AggregateError
    static any(iterable: Iterable<unknown>) {
        return new CustomPromise((resolve, reject) => {
            const arr = Array.from(iterable);
            const errors: unknown[] = [];
            let rejectedCount = 0;

            if (arr.length === 0) {
                reject(new AggregateError([], 'All promises were rejected'));
                return;
            }

            arr.forEach((item, index) => {
                CustomPromise.resolve(item).then(resolve, (reason) => {
                    errors[index] = reason;
                    rejectedCount += 1;
                    if (rejectedCount === arr.length) {
                        reject(new AggregateError(errors, 'All promises were rejected'));
                    }
                });
            });
        });
    }
}
