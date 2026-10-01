/**
 * ============================================================================
 * Generative UI 工具决策端点 — GET /api/ai/generative-ui?q=...
 * ============================================================================
 *
 * 模拟「模型读完用户输入后决定调用哪个工具」这一跳:
 * 关键词路由 → 结构化工具调用 { tool, payload, reply }。
 *
 * 注意：
 * - 纯 mock,不接真实 LLM;真实场景这一步由模型的 function calling 完成
 * - 返回的是结构化数据而非组件 —— 组件映射发生在前端(见 GenUiPlayground)
 *
 * @module api/ai/generative-ui/route
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { ToolCallResult } from "@/topics/ai-native/generative-ui/types";

/** 模拟模型推理延迟 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** 天气工具的 mock 产出(城市从问句里抠,抠不到默认北京) */
function decideWeather(query: string): ToolCallResult {
    const city = /([一-龥]{2,3})(?:的)?天气/.exec(query)?.[1] ?? "北京";
    return {
        tool: "weather",
        reply: `为你查到了${city}今天的实时天气:`,
        payload: { city, temp: 26, condition: "晴转多云", humidity: 42, wind: "东南风 3 级", aqi: 58 },
    };
}

/** 股价工具的 mock 产出 */
function decideStock(): ToolCallResult {
    return {
        tool: "stock",
        reply: "AAPL 最新行情如下,近十日走势看图:",
        payload: {
            symbol: "AAPL",
            name: "苹果公司",
            price: 231.42,
            changePct: 1.24,
            points: [224, 226, 225, 228, 227, 229, 232, 230, 229, 231],
        },
    };
}

/** 待办工具的 mock 产出 */
function decideTodo(): ToolCallResult {
    return {
        tool: "todo",
        reply: "今天还有 3 件待办,其中 1 件已完成:",
        payload: {
            date: "今天",
            items: [
                { text: "评审流式端点 PR", done: true },
                { text: "给 Agent 页补充取消按钮", done: false },
                { text: "整理 Generative UI 笔记", done: false },
            ],
        },
    };
}

/**
 * GET /api/ai/generative-ui?q=<用户输入>
 *
 * @param req - searchParams.q 为用户输入
 * @returns 结构化工具调用结果 ToolCallResult
 */
export async function GET(req: NextRequest) {
    const query = req.nextUrl.searchParams.get("q") ?? "";
    await sleep(300 + Math.floor(Math.random() * 300));

    let result: ToolCallResult;
    if (/天气/.test(query)) {
        result = decideWeather(query);
    } else if (/股价|股票|AAPL|苹果/i.test(query)) {
        result = decideStock();
    } else if (/待办|todo/i.test(query)) {
        result = decideTodo();
    } else {
        // 没有匹配的工具:模型退回纯文本回答
        result = {
            tool: null,
            reply: "这个问题不需要调用工具,我直接用文字回答:试试「北京天气」「AAPL 股价」或「今日待办」,看看同样的问答如何渲染成组件卡片。",
        };
    }
    return NextResponse.json(result);
}
