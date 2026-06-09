/**
 * ============================================================================
 * cn() 演示页
 * ============================================================================
 *
 * ⚠️ 此页面仅为 infra-fe 工具库的辅助演示页面。
 *
 * @module app/utils/page
 */

"use client";

import { CodeExample } from "@demo/components/CodeExample";
import { useState } from "react";

import { cn } from "@/utils";

export default function UtilsDemoPage() {
  const [active, setActive] = useState(false);
  const [variant, setVariant] = useState<"primary" | "secondary" | "destructive">("primary");

  const variantStyles: Record<string, string> = {
    primary: "bg-primary-500 text-white hover:bg-primary-600",
    secondary: "bg-secondary text-secondary-foreground hover:bg-muted",
    destructive: "bg-red-500 text-white hover:bg-red-600",
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold tracking-tight">cn()</h1>
      <p className="mb-8 text-muted-foreground">
        组合 <code className="rounded bg-muted px-1 font-mono text-sm">clsx</code>{" "}
        的条件类名能力与{" "}
        <code className="rounded bg-muted px-1 font-mono text-sm">tailwind-merge</code>{" "}
        的冲突解析能力。再也不用担心 Tailwind 类名顺序问题。
      </p>

      {/* Demo 1: conditional classes */}
      <CodeExample
        title="条件类名"
        code={`import { cn } from '@/utils';\n\nconst btnClass = cn(\n  'px-4 py-2 rounded-md font-medium transition-colors',\n  active && 'ring-2 ring-primary-400',\n  variantStyles[variant]\n);`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition-colors",
              active && "ring-2 ring-primary-400 ring-offset-2",
              variantStyles[variant],
            )}
            onClick={() => setActive((v) => !v)}
          >
            {active ? "Active ✓" : "Inactive"}
          </button>

          <select
            value={variant}
            onChange={(e) => setVariant(e.target.value as typeof variant)}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="primary">primary</option>
            <option value="secondary">secondary</option>
            <option value="destructive">destructive</option>
          </select>
        </div>
      </CodeExample>

      {/* Demo 2: conflict resolution */}
      <CodeExample
        title="冲突解析"
        code={`// px-4 和 px-6 冲突，后面的 px-6 胜出\ncn('px-4 py-2 bg-red-500', 'px-6 bg-blue-500')\n// → "py-2 px-6 bg-blue-500"`}
        className="mt-6"
      >
        <div className="flex flex-wrap gap-2 text-sm">
          {[
            ["px-4 py-2 bg-red-500 text-white rounded", "px-6 bg-blue-500"],
            ["text-sm font-normal", "text-lg font-bold"],
            ["w-24 h-24 bg-green-500", "w-32 bg-blue-500 rounded-lg"],
          ].map(([a, b], i) => (
            <div key={i} className="space-y-1">
              <div className={cn("rounded-md px-2 py-1 text-xs text-zinc-200", a)}>
                输入 A
              </div>
              <div className={cn("rounded-md px-2 py-1 text-xs text-zinc-200", b)}>
                输入 B
              </div>
              <div className={cn("rounded-md px-2 py-1 text-xs font-mono text-zinc-800 dark:text-zinc-200", cn(a, b))}>
                = {cn(a, b)}
              </div>
            </div>
          ))}
        </div>
      </CodeExample>
    </div>
  );
}
