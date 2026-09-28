/**
 * ============================================================================
 * AI Models Types - AI 模型类型定义
 * ============================================================================
 *
 * 定义 AI 模型广场功能中使用的数据类型。
 *
 * @module types/ai-models
 */

/**
 * ============================================================================
 * AI 模型难度等级
 * ============================================================================
 */
export type ModelDifficulty = "入门" | "初级" | "中级" | "高级" | "专家";

/**
 * ============================================================================
 * AI 模型分类
 * ============================================================================
 */
export type ModelCategory = "语言模型" | "多模态" | "图像生成" | "视频生成" | "代码生成" | "语音合成" | "Agent";

/**
 * ============================================================================
 * AI 模型接口
 * ============================================================================
 */
export interface AIModel {
    /** 模型唯一标识 */
    id: string;
    /** 模型名称 */
    name: string;
    /** 模型提供商 */
    provider: string;
    /** 模型描述 */
    description: string;
    /** 模型分类 */
    category: ModelCategory;
    /** 难度等级 */
    difficulty: ModelDifficulty;
    /** 模型参数规模 */
    parameters: string;
    /** 是否开源 */
    isOpenSource: boolean;
    /** 模型图标/Logo */
    icon: string;
    /** 模型颜色（用于卡片展示） */
    color: string;
    /** 发布时间 */
    releaseDate: string;
    /** 支持的功能列表 */
    capabilities: string[];
    /** 上下文窗口大小 */
    contextWindow: string;
    /** 训练数据截止日期 */
    trainingCutoff: string;
}

/**
 * ============================================================================
 * 模型性能指标
 * ============================================================================
 */
export interface ModelMetrics {
    /** 响应延迟 (ms) */
    latency: number;
    /** 吞吐量 (tokens/s) */
    throughput: number;
    /** 准确性评分 (0-100) */
    accuracy: number;
    /** 性价比评分 (0-100) */
    costEfficiency: number;
}

/**
 * ============================================================================
 * Streaming 加载状态
 * ============================================================================
 */
export interface StreamingState {
    /** 是否正在加载 */
    isLoading: boolean;
    /** 已加载的字节数 */
    loadedBytes: number;
    /** 总字节数 */
    totalBytes: number;
    /** 加载进度百分比 */
    progress: number;
    /** 开始时间戳 */
    startTime: number;
    /** 当前状态消息 */
    message: string;
}

/**
 * ============================================================================
 * 性能监控事件
 * ============================================================================
 */
export interface PerformanceEvent {
    /** 事件类型 */
    type: "component_mount" | "data_fetch" | "render" | "error";
    /** 组件名称 */
    component: string;
    /** 事件时间戳 */
    timestamp: number;
    /** 耗时 (ms) */
    duration?: number;
    /** 附加信息 */
    metadata?: Record<string, unknown>;
}