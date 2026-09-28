/**
 * ============================================================================
 * Agent 长任务端点 — GET /api/ai/agent
 * ============================================================================
 *
 * 用 SSE 推送多步 Agent 任务的步骤事件,驱动前端「步骤时间线」。
 *
 * 查询参数：
 * - mode=serial|parallel — 工具调用阶段串行(3×800ms)或并行(max 800ms)
 * - skipValidate=1 — 跳过校验步骤(墙钟减半但产出未校验,演示「快但错」取舍)
 *
 * 事件格式：`data: {"step":"plan","status":"running","detail":"...","elapsed":123}`
 * - elapsed 为相对流开始的毫秒数,前端直接渲染为时间戳
 * - 客户端断开时停止后续步骤(真实场景同步取消上游工具/LLM 调用)
 *
 * @module api/ai/agent/route
 */

import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

/** 步骤事件载荷(与前端 AgentPlayground 的解析契约) */
interface StepEvent {
    /** 步骤 id,前端按 id 更新时间线节点 */
    step: string;
    status: "running" | "done" | "skipped";
    detail: string;
    /** 相对流开始的毫秒数 */
    elapsed: number;
}

/** 三个工具调用的固定 id 与说明 */
const TOOL_STEPS = [
    { id: "tool-search", label: "搜索内部文档库" },
    { id: "tool-calc", label: "计算同比指标" },
    { id: "tool-db", label: "查询业务数据库" },
] as const;

const TOOL_COST_MS = 800;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * GET /api/ai/agent
 *
 * @param req - 请求对象;searchParams 取 mode / skipValidate,req.signal 感知断开
 * @returns text/event-stream 步骤事件流
 */
export async function GET(req: NextRequest) {
    const mode = req.nextUrl.searchParams.get("mode") === "serial" ? "serial" : "parallel";
    const skipValidate = req.nextUrl.searchParams.get("skipValidate") === "1";

    const encoder = new TextEncoder();
    const startedAt = Date.now();
    let cancelled = false;

    const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
            const emit = (step: string, status: StepEvent["status"], detail: string) => {
                const event: StepEvent = { step, status, detail, elapsed: Date.now() - startedAt };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
            };
            const aborted = () => cancelled || req.signal.aborted;
            /** 推进一个步骤:running → sleep → done;断开即返回 false 终止流水线 */
            const runStep = async (step: string, running: string, done: string, cost: number) => {
                if (aborted()) {return false;}
                emit(step, "running", running);
                await sleep(cost);
                if (aborted()) {return false;}
                emit(step, "done", done);
                return true;
            };

            // 1. 规划 → 2. 检索(RAG):所有模式下都一样
            if (!(await runStep("plan", "拆解任务、规划执行步骤", "已生成 3 步执行计划", 500))) {controller.close(); return;}
            if (!(await runStep("rag", "检索知识库,召回相关片段", "召回 4 条相关文档片段", 700))) {controller.close(); return;}

            // 3. 工具调用:串行 = 3×800ms 墙钟;并行 = max 800ms 墙钟
            if (mode === "serial") {
                for (const tool of TOOL_STEPS) {
                    if (!(await runStep(tool.id, `调用工具:${tool.label}`, `${tool.label}完成`, TOOL_COST_MS))) {
                        controller.close();
                        return;
                    }
                }
            } else {
                if (aborted()) {controller.close(); return;}
                // 并行:三个 running 同时发出,等待最长的一个,再同时 done
                for (const tool of TOOL_STEPS) {emit(tool.id, "running", `并行调用:${tool.label}`);}
                await sleep(TOOL_COST_MS);
                if (aborted()) {controller.close(); return;}
                for (const tool of TOOL_STEPS) {emit(tool.id, "done", `${tool.label}完成`);}
            }

            // 4. 校验:可跳过的「正确性保险」
            if (skipValidate) {
                emit("validate", "skipped", "已跳过校验:墙钟减半,但产出未经核对(快但错的取舍)");
            } else if (!(await runStep("validate", "交叉校验工具产出的一致性", "校验通过,无冲突数据", 400))) {
                controller.close();
                return;
            }

            // 5. 汇总
            if (!(await runStep("summary", "汇总各步骤产出,生成最终回答", "任务完成", 600))) {controller.close(); return;}

            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
        },
        cancel() {
            // 前端取消:真实场景在此取消进行中的工具调用与 LLM 请求
            cancelled = true;
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
        },
    });
}
