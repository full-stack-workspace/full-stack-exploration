/**
 * ============================================================================
 * WeatherCard — 天气工具调用的渲染产物
 * ============================================================================
 *
 * Generative UI 的核心演示:模型返回 { tool: "weather", payload },
 * 前端渲染成这张卡片,而不是渲染 JSON 文本。
 *
 * @module topics/ai-native/generative-ui/components/WeatherCard
 */

import type { WeatherPayload } from "../types";

export function WeatherCard({ payload }: { payload: WeatherPayload }) {
    return (
        <div className="w-full max-w-sm rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 p-5 text-white shadow-lg">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm opacity-80">{payload.city}</p>
                    <p className="mt-1 text-4xl font-bold">{payload.temp}°</p>
                    <p className="mt-1 text-sm">{payload.condition}</p>
                </div>
                <span className="text-4xl">⛅</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/20 pt-3 text-center text-xs">
                <div>
                    <p className="opacity-70">湿度</p>
                    <p className="mt-0.5 font-semibold">{payload.humidity}%</p>
                </div>
                <div>
                    <p className="opacity-70">风力</p>
                    <p className="mt-0.5 font-semibold">{payload.wind}</p>
                </div>
                <div>
                    <p className="opacity-70">AQI</p>
                    <p className="mt-0.5 font-semibold">{payload.aqi}</p>
                </div>
            </div>
        </div>
    );
}
