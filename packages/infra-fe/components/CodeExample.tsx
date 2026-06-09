/**
 * ============================================================================
 * CodeExample — 代码示例展示组件（演示用）
 * ============================================================================
 *
 * 在演示页面中展示代码块 + 实时预览效果。不是 infra-fe 库的一部分。
 *
 * @module components/CodeExample
 */

import { cn } from "@/utils";

interface CodeExampleProps {
  /** 代码字符串 */
  code: string;
  /** 实时预览 */
  children: React.ReactNode;
  /** 示例标题 */
  title?: string;
  className?: string;
}

export function CodeExample({ code, children, title, className }: CodeExampleProps) {
  return (
    <div className={cn("rounded-lg border border-border overflow-hidden", className)}>
      {title && (
        <div className="border-b border-border bg-muted/50 px-4 py-2 text-sm font-medium text-muted-foreground">
          {title}
        </div>
      )}
      <div className="border-b border-border bg-muted/30 p-4">
        {children}
      </div>
      <pre className="m-0 overflow-x-auto bg-zinc-950 p-4 text-sm text-zinc-50 dark:bg-zinc-900">
        <code>{code}</code>
      </pre>
    </div>
  );
}
