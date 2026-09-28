/**
 * ============================================================================
 * AI Models Data - AI 模型数据
 * ============================================================================
 *
 * 提供 AI 模型广场功能的模拟数据。
 * 数据包含当前主流的 AI 模型信息。
 *
 * @module data/ai-models
 */

import type { AIModel } from "@/types/ai-models";

/**
 * ============================================================================
 * AI 模型数据列表
 * ============================================================================
 */
export const aiModels: AIModel[] = [
    {
        id: "gpt-4-turbo",
        name: "GPT-4 Turbo",
        provider: "OpenAI",
        description: "最强大的 GPT-4 优化版本，支持 128K 上下文窗口，适合复杂推理和长文本处理。",
        category: "语言模型",
        difficulty: "高级",
        parameters: "约 1.8 万亿",
        isOpenSource: false,
        icon: "🤖",
        color: "from-green-400 to-emerald-600",
        releaseDate: "2024-04",
        capabilities: ["文本生成", "代码编写", "数据分析", "图像理解", "函数调用"],
        contextWindow: "128K",
        trainingCutoff: "2023-12",
    },
    {
        id: "gpt-4o",
        name: "GPT-4o",
        provider: "OpenAI",
        description: "原生多模态模型，支持文本、音频、图像的端到端处理，响应速度更快。",
        category: "多模态",
        difficulty: "高级",
        parameters: "约 1.8 万亿",
        isOpenSource: false,
        icon: "🧠",
        color: "from-emerald-400 to-teal-600",
        releaseDate: "2024-05",
        capabilities: ["多模态理解", "语音对话", "实时翻译", "图像分析", "代码生成"],
        contextWindow: "128K",
        trainingCutoff: "2023-10",
    },
    {
        id: "claude-3-5-sonnet",
        name: "Claude 3.5 Sonnet",
        provider: "Anthropic",
        description: "擅长编程和复杂推理，支持 200K 上下文，在多项基准测试中表现优异。",
        category: "语言模型",
        difficulty: "高级",
        parameters: "约 1.4 万亿",
        isOpenSource: false,
        icon: "🧬",
        color: "from-amber-400 to-orange-600",
        releaseDate: "2024-06",
        capabilities: ["代码生成", "长文本分析", "创意写作", "安全对话", "工具使用"],
        contextWindow: "200K",
        trainingCutoff: "2024-04",
    },
    {
        id: "claude-3-5-haiku",
        name: "Claude 3.5 Haiku",
        provider: "Anthropic",
        description: "轻量级高速模型，响应极快，适合需要低延迟的场景，价格极具竞争力。",
        category: "语言模型",
        difficulty: "初级",
        parameters: "约 2000 亿",
        isOpenSource: false,
        icon: "⚡",
        color: "from-yellow-400 to-amber-600",
        releaseDate: "2024-07",
        capabilities: ["快速响应", "代码补全", "文本分类", "情感分析", "摘要生成"],
        contextWindow: "200K",
        trainingCutoff: "2024-04",
    },
    {
        id: "gemini-1-5-pro",
        name: "Gemini 1.5 Pro",
        provider: "Google",
        description: "支持 200 万 token 上下文窗口，多模态能力强大，适合超长文档处理。",
        category: "多模态",
        difficulty: "高级",
        parameters: "约 1.5 万亿",
        isOpenSource: false,
        icon: "💎",
        color: "from-blue-400 to-indigo-600",
        releaseDate: "2024-05",
        capabilities: ["超长上下文", "视频理解", "代码生成", "多语言", "复杂推理"],
        contextWindow: "2M",
        trainingCutoff: "2023-08",
    },
    {
        id: "gemini-1-5-flash",
        name: "Gemini 1.5 Flash",
        provider: "Google",
        description: "针对速度优化的轻量级模型，响应快速，适合高频率调用场景。",
        category: "语言模型",
        difficulty: "中级",
        parameters: "约 6000 亿",
        isOpenSource: false,
        icon: "🚀",
        color: "from-sky-400 to-blue-600",
        releaseDate: "2024-08",
        capabilities: ["快速响应", "摘要生成", "翻译", "问答", "内容创作"],
        contextWindow: "1M",
        trainingCutoff: "2023-08",
    },
    {
        id: "llama-3-1-405b",
        name: "Llama 3.1 405B",
        provider: "Meta",
        description: "开源大模型巅峰之作，4050 亿参数，支持 128K 上下文，性能直逼闭源模型。",
        category: "语言模型",
        difficulty: "专家",
        parameters: "4050 亿",
        isOpenSource: true,
        icon: "🦙",
        color: "from-purple-400 to-violet-600",
        releaseDate: "2024-07",
        capabilities: ["开源部署", "长文本处理", "代码生成", "多语言", "指令遵循"],
        contextWindow: "128K",
        trainingCutoff: "2023-12",
    },
    {
        id: "llama-3-1-70b",
        name: "Llama 3.1 70B",
        provider: "Meta",
        description: "高性能开源中模型，适合需要本地部署且资源有限的场景。",
        category: "语言模型",
        difficulty: "中级",
        parameters: "700 亿",
        isOpenSource: true,
        icon: "🦙",
        color: "from-violet-400 to-purple-600",
        releaseDate: "2024-07",
        capabilities: ["本地部署", "指令遵循", "代码生成", "文本分析", "对话生成"],
        contextWindow: "128K",
        trainingCutoff: "2023-12",
    },
    {
        id: "qwen-2-72b",
        name: "Qwen 2 72B",
        provider: "阿里云",
        description: "国产开源大模型，中英文能力出色，支持超长上下文，性能优秀。",
        category: "语言模型",
        difficulty: "高级",
        parameters: "720 亿",
        isOpenSource: true,
        icon: "🔮",
        color: "from-red-400 to-pink-600",
        releaseDate: "2024-06",
        capabilities: ["中英双语", "长文本", "代码生成", "数学推理", "知识问答"],
        contextWindow: "128K",
        trainingCutoff: "2024-03",
    },
    {
        id: "midjourney-v6",
        name: "Midjourney V6",
        provider: "Midjourney",
        description: "业界领先的 AI 图像生成模型，支持精细的风格控制和图像编辑。",
        category: "图像生成",
        difficulty: "中级",
        parameters: "闭源",
        isOpenSource: false,
        icon: "🎨",
        color: "from-pink-400 to-rose-600",
        releaseDate: "2024-01",
        capabilities: ["图像生成", "风格迁移", "图像编辑", "角色设计", "概念艺术"],
        contextWindow: "N/A",
        trainingCutoff: "2023-11",
    },
    {
        id: "dall-e-3",
        name: "DALL-E 3",
        provider: "OpenAI",
        description: "ChatGPT 集成版图像生成，理解复杂prompt，生成精准且艺术感强。",
        category: "图像生成",
        difficulty: "中级",
        parameters: "闭源",
        isOpenSource: false,
        icon: "🖼️",
        color: "from-orange-400 to-red-600",
        releaseDate: "2023-10",
        capabilities: ["文生图", "图像编辑", "风格控制", "文字渲染", "概念合成"],
        contextWindow: "N/A",
        trainingCutoff: "2023-04",
    },
    {
        id: "stable-diffusion-3",
        name: "Stable Diffusion 3",
        provider: "Stability AI",
        description: "开源图像生成模型，采用 MMDiT 架构，文字渲染能力大幅提升。",
        category: "图像生成",
        difficulty: "高级",
        parameters: "约 80 亿",
        isOpenSource: true,
        icon: "🖌️",
        color: "from-fuchsia-400 to-pink-600",
        releaseDate: "2024-06",
        capabilities: ["开源部署", "文生图", "图像编辑", "控制网络", "LoRA 微调"],
        contextWindow: "N/A",
        trainingCutoff: "2024-02",
    },
    {
        id: "sora",
        name: "Sora",
        provider: "OpenAI",
        description: "革命性视频生成模型，可生成最长 60 秒的高质量视频，理解物理世界。",
        category: "视频生成",
        difficulty: "专家",
        parameters: "闭源",
        isOpenSource: false,
        icon: "🎬",
        color: "from-cyan-400 to-blue-600",
        releaseDate: "2024-02",
        capabilities: ["视频生成", "场景合成", "动画制作", "视频编辑", "世界模拟"],
        contextWindow: "20s",
        trainingCutoff: "2023-12",
    },
    {
        id: "gemini-2-0-flash-exp",
        name: "Gemini 2.0 Flash Exp",
        provider: "Google",
        description: "实验性高速模型，响应速度大幅提升，支持原生工具调用和代码执行。",
        category: "Agent",
        difficulty: "高级",
        parameters: "约 6000 亿",
        isOpenSource: false,
        icon: "⚡",
        color: "from-indigo-400 to-purple-600",
        releaseDate: "2024-09",
        capabilities: ["高速响应", "工具调用", "代码执行", "多模态", "Agent 能力"],
        contextWindow: "1M",
        trainingCutoff: "2024-06",
    },
    {
        id: "gpt-o1-preview",
        name: "GPT-o1 Preview",
        provider: "OpenAI",
        description: "推理模型，使用思维链技术解决复杂科学、编码和数学问题。",
        category: "语言模型",
        difficulty: "专家",
        parameters: "闭源",
        isOpenSource: false,
        icon: "🧮",
        color: "from-lime-400 to-green-600",
        releaseDate: "2024-09",
        capabilities: ["复杂推理", "数学解题", "代码生成", "科学研究", "思维链"],
        contextWindow: "128K",
        trainingCutoff: "2023-09",
    },
    {
        id: "claude-opus-3-5",
        name: "Claude Opus 3.5",
        provider: "Anthropic",
        description: "最强大的 Claude 模型，擅长复杂任务处理和长程推理。",
        category: "语言模型",
        difficulty: "专家",
        parameters: "约 2 万亿",
        isOpenSource: false,
        icon: "🏆",
        color: "from-orange-400 to-amber-600",
        releaseDate: "2024-10",
        capabilities: ["复杂推理", "长文本分析", "代码生成", "创意写作", "安全对齐"],
        contextWindow: "200K",
        trainingCutoff: "2024-06",
    },
];

/**
 * ============================================================================
 * 获取所有模型分类
 * ============================================================================
 */
export const modelCategories = [
    "全部",
    "语言模型",
    "多模态",
    "图像生成",
    "视频生成",
    "Agent",
] as const;

/**
 * ============================================================================
 * 获取所有难度等级
 * ============================================================================
 */
export const modelDifficulties = ["全部", "入门", "初级", "中级", "高级", "专家"] as const;

/**
 * ============================================================================
 * 模拟 API 获取延迟
 * ============================================================================
 *
 * @param data - 要返回的数据
 * @param delay - 延迟时间 (ms)
 * @returns Promise
 */
export function simulateApiDelay<T>(data: T, delay: number = 300): Promise<T> {
    return new Promise((resolve) => {
        setTimeout(() => resolve(data), delay);
    });
}

/**
 * ============================================================================
 * 异步生成器：流式返回数据
 * ============================================================================
 *
 * 演示 Next.js Streaming 特性的异步生成器函数。
 * 每次 yield 返回部分数据，模拟流式传输。
 *
 * @param models - 模型数据数组
 * @param chunkSize - 每次返回的数据块大小
 * @param delay - 每个数据块的延迟 (ms)
 * @yields 部分模型数据
 */
export async function* streamModels(
    models: AIModel[],
    chunkSize: number = 3,
    delay: number = 200
): AsyncGenerator<AIModel[], void, unknown> {
    for (let i = 0; i < models.length; i += chunkSize) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        yield models.slice(i, i + chunkSize);
    }
}