/**
 * ============================================================================
 * slow.ts — 人为慢渲染工具
 * ============================================================================
 *
 * busyWork(ms):用同步忙循环人为消耗 CPU,制造「昂贵渲染」,
 * 让输入阻塞、帧率下降等性能问题在演示中可稳定复现。
 * 慢渲染强度由调用方控制,测试中传 0 即无开销。
 *
 * @module topics/performance/lab/slow
 */

/**
 * 同步忙等 ms 毫秒,模拟一次昂贵的计算 / 渲染。
 *
 * @param ms 消耗的毫秒数;传 0 时立即返回(测试用)
 *
 * @example
 * busyWork(2); // 阻塞主线程约 2ms
 */
export function busyWork(ms: number): void {
    if (ms <= 0) {
        return;
    }
    const deadline = performance.now() + ms;
    // 忙循环:占用主线程,正是「同步渲染阻塞输入」的复现手段
    while (performance.now() < deadline) {
        // 故意空转
    }
}
