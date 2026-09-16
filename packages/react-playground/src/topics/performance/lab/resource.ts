/**
 * ============================================================================
 * resource.ts — wrapPromise:手写可挂起资源
 * ============================================================================
 *
 * Suspense 协议教学道具:把一个 Promise 包成「可挂起资源」,
 * read() 三态 —— pending 时 throw promise(触发 Suspense fallback)、
 * error 时 throw error(交给 Error Boundary)、success 时返回值。
 * 这正是 react-cache / SWR / Relay 等数据层对接 Suspense 的最小协议。
 *
 * @module topics/performance/lab/resource
 */

/** 可挂起资源:read 在渲染期调用,未就绪则 throw */
export interface SuspenseResource<T> {
    read(): T;
}

type Status = 'pending' | 'success' | 'error';

/**
 * 把 Promise 包装为 Suspense 资源。
 *
 * 注意:必须在事件处理器 / effect 中创建(发起请求即创建),
 * 不能在渲染期创建 —— 否则每次渲染都发起新请求,无限挂起。
 *
 * @param promise 数据源
 * @returns 可挂起资源
 *
 * @example
 * const resource = wrapPromise(searchItems('abc'));
 * // 组件内:const data = resource.read();
 */
export function wrapPromise<T>(promise: Promise<T>): SuspenseResource<T> {
    let status: Status = 'pending';
    let result: T;
    let failure: unknown;

    const suspender = promise.then(
        (data) => {
            status = 'success';
            result = data;
        },
        (error: unknown) => {
            status = 'error';
            failure = error;
        },
    );

    return {
        read(): T {
            if (status === 'pending') {
                // Suspense 捕获 promise,fallback 接管;就绪后 React 重试渲染
                throw suspender;
            }
            if (status === 'error') {
                throw failure;
            }
            return result;
        },
    };
}
