/**
 * ============================================================================
 * Utility Functions - 工具函数
 * ============================================================================
 *
 * 提供应用中常用的工具函数。
 *
 * @module lib/utils
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * ============================================================================
 * Class Name Combiner - 类名合并工具
 * ============================================================================
 *
 * 简化 Tailwind CSS 类名的拼接和管理。
 *
 * 功能特点：
 * - 使用 clsx 处理条件类名和数组
 * - 使用 tailwind-merge 合并重复的 Tailwind 类名（后者覆盖前者）
 * - 自动过滤 falsy 值（undefined, null, false, ""）
 *
 * 使用场景：
 * - 当 className 需要根据条件动态拼接时
 * - 当有多个样式来源需要合并时
 * - 当 Tailwind 冲突类名需要正确覆盖时
 *
 * 对比传统方式：
 * - 传统: className={`base ${isActive ? "active" : ""} ${className}`}
 * - 现在: className={cn("base", isActive && "active", className)}
 *
 * @example
 * // 基础用法
 * cn("px-4", "py-2") // => "px-4 py-2"
 *
 * // 条件类名
 * cn("px-4", isActive && "bg-blue-500") // => "px-4 bg-blue-500" 或 "px-4"
 *
 * // Tailwind 冲突类名（后面的会覆盖前面的）
 * cn("px-2 px-4", "px-8") // => "px-8" (twMerge 处理了冲突)
 *
 * // 多个来源
 * cn("base", props.className) // => "base [props.className]"
 *
 * @param inputs - 类名片段，支持字符串、数组、条件表达式
 * @returns 合并后的类名字符串
 */
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}