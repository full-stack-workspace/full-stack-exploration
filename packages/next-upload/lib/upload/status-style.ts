/**
 * ============================================================================
 * 任务状态 → UI 样式映射 — next-upload
 * ============================================================================
 *
 * 集中维护每个 TaskStatus 对应的：
 * - 文案（中文短标签）
 * - shadcn Badge 的 variant（"default" | "secondary" | "destructive" | "outline"）
 * - 自定义辅助 class（用于状态机特殊配色，如蓝色"上传中"、紫色"合并中"）
 *
 * 设计原则：
 * - TaskCard 直接调 statusStyle(status) 拿全部展示信息
 * - 改文案 / 配色 → 只改本文件
 *
 * @module lib/upload/status-style
 */

import type { TaskStatus } from "@/types/upload";

/**
 * Badge 变体（对应 shadcn badge 的 variant prop）
 */
type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

/**
 * 单个状态的展示信息
 */
export interface StatusStyle {
  /** 中文短标签 */
  label: string;
  /** shadcn Badge variant */
  variant: BadgeVariant;
  /** 额外 Tailwind class（叠加在 Badge 上，覆盖默认配色） */
  className?: string;
  /** 是否在徽章上展示一个旋转 spinner（hashing/checking/merging 用） */
  spinning?: boolean;
}

/**
 * statusStyle — 由 TaskStatus 取展示信息
 *
 * @param status 任务当前状态
 * @returns 用于渲染 Badge 的 { label, variant, className?, spinning? }
 *
 * @example
 * const s = statusStyle(task.status);
 * <Badge variant={s.variant} className={s.className}>{s.label}</Badge>
 */
export function statusStyle(status: TaskStatus): StatusStyle {
  switch (status) {
    case "hashing":
      return { label: "计算中", variant: "secondary", spinning: true };
    case "checking":
      return { label: "校验中", variant: "secondary", spinning: true };
    case "uploading":
      return {
        label: "上传中",
        variant: "outline",
        className: "border-primary-500/30 bg-primary-500/15 text-primary-700 dark:text-primary-300",
      };
    case "merging":
      return {
        label: "合并中",
        variant: "outline",
        className: "border-purple-500/30 bg-purple-500/15 text-purple-700 dark:text-purple-300",
        spinning: true,
      };
    case "paused":
      return {
        label: "已暂停",
        variant: "outline",
        className: "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-300",
      };
    case "completed":
      return {
        label: "已完成",
        variant: "outline",
        className: "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
      };
    case "instant":
      return {
        label: "⭐ 秒传命中",
        variant: "outline",
        className: "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
      };
    case "failed":
      return { label: "失败", variant: "destructive" };
  }
}
