/**
 * ============================================================================
 * cn() — className 合并工具
 * ============================================================================
 *
 * 组合 clsx（条件类名）与 tailwind-merge（冲突解析），
 * 提供类型安全的 className 拼接函数。
 *
 * 功能特点：
 * - 自动去重 Tailwind 冲突类名（如 px-4 px-2 → px-2）
 * - 支持条件类名、数组、对象等多种输入形式
 * - 零运行时开销的类型推导
 *
 * @module src/utils
 *
 * @example
 * ```ts
 * import { cn } from '@/utils';
 *
 * const className = cn(
 *   'px-4 py-2',
 *   isActive && 'bg-primary-500',
 *   isDisabled && 'opacity-50 cursor-not-allowed'
 * );
 * ```
 */

import { type ClassValue,clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** 合并并去重 Tailwind 类名 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
