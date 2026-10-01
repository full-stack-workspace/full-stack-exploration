/**
 * ============================================================================
 * ConnectionPanel — connection() 声明「等到请求到达」(Server)
 * ============================================================================
 *
 * connection() 本身不读任何请求数据,它是一句声明:
 * 「这个组件必须等到真实请求到达才开始渲染」—— 从而退出构建期预渲染。
 * 它存在的意义是让「new Date() 取当前时刻」这类请求时计算合法化:
 * cacheComponents 下渲染期不许裸取当前时间(构建期取一次就冻结了),
 * 必须在 connection() 之后的动态洞里取。
 *
 * @module topics/data/dynamic-apis/components/ConnectionPanel
 */

import { connection } from "next/server";

export async function ConnectionPanel() {
    await connection();
    // connection() 之后取当前时刻是合法的:这里已是请求时渲染
    const arrivedAt = new Date().toISOString();
    const requestId = crypto.randomUUID();

    return (
        <div className="space-y-3">
            <div className="border border-rule px-4 py-3 dark:border-neutral-800">
                <p className="font-mono text-[11px] text-neutral-500">
                    请求到达时刻(UTC)
                </p>
                <p className="mt-1 font-mono text-sm break-all text-ink dark:text-neutral-100">
                    {arrivedAt}
                </p>
            </div>
            <div className="border border-rule px-4 py-3 dark:border-neutral-800">
                <p className="font-mono text-[11px] text-neutral-500">
                    本次请求 ID(crypto.randomUUID)
                </p>
                <p className="mt-1 font-mono text-xs break-all text-ink dark:text-neutral-100">
                    {requestId}
                </p>
            </div>
            <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                每次刷新两个值都变:这一格在请求时现算,没有缓存参与。
            </p>
        </div>
    );
}
