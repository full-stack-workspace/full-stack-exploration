/**
 * wrapPromise 契约测试:pending throw promise / success 返回值 / error throw
 * @module topics/performance/lab/resource.test
 */

import { describe, expect, it } from 'vitest';

import { wrapPromise } from './resource';

/** 让 Promise 链中的 then 回调有机会执行 */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('wrapPromise', () => {
    it('pending:read 抛出 promise(供 Suspense 捕获)', () => {
        const resource = wrapPromise(new Promise<string>(() => {}));

        expect(() => resource.read()).toThrow(Promise);
    });

    it('success:就绪后 read 返回结果', async () => {
        const resource = wrapPromise(Promise.resolve('数据'));
        await flush();

        expect(resource.read()).toBe('数据');
    });

    it('error:失败后 read 抛出错误(供 Error Boundary 捕获)', async () => {
        const failure = new Error('加载失败');
        const resource = wrapPromise(Promise.reject(failure));
        await flush();

        expect(() => resource.read()).toThrow(failure);
    });

    it('success 后重复 read 稳定返回同一结果', async () => {
        const resource = wrapPromise(Promise.resolve({ id: 1 }));
        await flush();

        expect(resource.read()).toBe(resource.read());
    });
});
