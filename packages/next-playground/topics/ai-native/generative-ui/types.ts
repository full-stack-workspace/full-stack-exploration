/**
 * ============================================================================
 * Generative UI — 工具调用协议类型
 * ============================================================================
 *
 * 「模型决定调用哪个工具」的返回契约,Route Handler 与前端组件映射共用。
 * 关键点:模型输出的是结构化工具调用(tool + payload),
 * UI 层按 tool 名做组件映射,而不是把 payload 渲染成 JSON 文本。
 *
 * @module topics/ai-native/generative-ui/types
 */

/** 天气卡片载荷 */
export interface WeatherPayload {
    city: string;
    temp: number;
    condition: string;
    humidity: number;
    wind: string;
    aqi: number;
}

/** 股价卡片载荷(points 为近 10 个收盘点位,用于迷你走势图) */
export interface StockPayload {
    symbol: string;
    name: string;
    price: number;
    changePct: number;
    points: number[];
}

/** 待办卡片载荷 */
export interface TodoPayload {
    date: string;
    items: Array<{ text: string; done: boolean }>;
}

/**
 * 工具调用结果(判别联合,tool 为判别字段)。
 * tool 为 null 表示模型决定不走工具、直接文字回答。
 */
export type ToolCallResult =
    | { tool: "weather"; reply: string; payload: WeatherPayload }
    | { tool: "stock"; reply: string; payload: StockPayload }
    | { tool: "todo"; reply: string; payload: TodoPayload }
    | { tool: null; reply: string; payload?: undefined };
