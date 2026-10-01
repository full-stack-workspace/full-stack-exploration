/**
 * ============================================================================
 * after() 演示端点 — 响应返回后再执行延迟写入
 * ============================================================================
 *
 * GET  /api/after-demo → { delayedWrites } 读取当前计数
 * POST /api/after-demo → 立即返回 { accepted, delayedWritesAtResponse },
 *        实际的计数 +1 包在 after() 里、响应发出后才执行
 *
 * 证据链:POST 的响应体里是「响应发出那一刻」的计数(旧值),
 * 稍后再 GET 才看到 +1 —— 写入确实发生在响应之后。
 *
 * 计数器是模块级内存:教学演示用,重启即失;
 * Serverless 多实例下各实例各有一份(与留言板 store 同一 caveat)。
 * Route Handler 保持每请求执行的默认语义,不做任何缓存声明。
 *
 * @module api/after-demo/route
 */

import { after, NextResponse } from "next/server";

/** 已完成的延迟写入次数(after 回调的执行证据) */
let delayedWrites = 0;

export async function GET() {
    return NextResponse.json({ delayedWrites });
}

export async function POST() {
    // 响应体记录「此刻」的计数:after 还没跑,它是旧值
    const delayedWritesAtResponse = delayedWrites;

    after(async () => {
        // 模拟真实场景里的慢速收尾(写日志、上报指标):
        // 延迟 300ms 让「响应先于写入」可被 GET 观察到
        await new Promise((resolve) => setTimeout(resolve, 300));
        delayedWrites += 1;
    });

    return NextResponse.json({ accepted: true, delayedWritesAtResponse });
}
