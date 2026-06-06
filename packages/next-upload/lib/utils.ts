/**
 * ============================================================================
 * Utility Functions — next-upload
 * ============================================================================
 *
 * @module lib/utils
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * ============================================================================
 * cn — 类名合并工具
 * ============================================================================
 *
 * clsx（条件类名）+ tailwind-merge（冲突解析）组合。
 * 优先用 cn() 而非模板字符串拼 className。
 *
 * @example
 * cn("px-4", isActive && "bg-blue-500")
 * cn("px-2 px-4", "px-8")  // => "px-8"
 *
 * @param inputs 类名片段
 * @returns 合并后的类名字符串
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
