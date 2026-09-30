/**
 * ============================================================================
 * mock.ts — Actions 专题的模拟后端
 * ============================================================================
 *
 * 本站是 createRoot SPA,没有真实服务端。这里用「人为延迟 + 可注入失败」
 * 模拟网络请求,让 Actions 的 pending / 错误 / 回滚行为可被肉眼观察、
 * 也可在测试里用小延迟快速驱动。
 *
 * 功能特点:
 * - mockRequest:统一的人为延迟 + 失败注入出口
 * - delay 由各演示组件的 prop 透传,页面用默认值,测试用小值
 *
 * @module topics/hooks/actions/mock
 */

export interface MockOptions {
    /** 人为网络延迟(ms),页面演示给大值,测试给小值 */
    delay?: number;
    /** 是否强制本次请求失败(失败注入开关) */
    shouldFail?: boolean;
    /** 失败时的错误信息 */
    errorMessage?: string;
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * 模拟一次「可能失败的服务端写操作」。
 * 只做延迟与失败注入,不返回数据 —— 各 Demo 的成功结果由本地 state 表达,
 * 与真实项目里「写接口只返回成败」的场景对齐。
 *
 * @param options.delay - 人为延迟毫秒数,默认 800ms
 * @param options.shouldFail - 为 true 时在延迟结束后抛错
 * @param options.errorMessage - 抛错时的提示文案
 * @throws 当 shouldFail 为 true 时抛出 Error(errorMessage)
 * @example
 * await mockRequest({ delay: 1200, shouldFail: failMode, errorMessage: '点赞失败' });
 */
export async function mockRequest(options: MockOptions = {}): Promise<void> {
    const { delay = 800, shouldFail = false, errorMessage = '网络错误,请稍后重试' } = options;
    await sleep(delay);
    if (shouldFail) {
        throw new Error(errorMessage);
    }
}
