/**
 * ============================================================================
 * 首页 — infra-fe 工具库总览
 * ============================================================================
 *
 * ⚠️ 此页面仅为 infra-fe 工具库的演示和文档页面。
 *
 * @module app/page
 */

import { Braces,Hash, Package, Type } from "lucide-react";
import Link from "next/link";

import { cn } from "@/utils";

/* =================================================================
 * Data
 * ================================================================ */

const modules = [
  {
    href: "/utils",
    icon: Braces,
    title: "cn()",
    desc: "className 合并工具 — 组合 clsx + tailwind-merge，自动去重冲突的 Tailwind 类名。",
    tags: ["纯函数", "通用"],
  },
  {
    href: "/hooks",
    icon: Hash,
    title: "React Hooks",
    desc: "useLocalStorage（SSR 安全持久化）、useDebounce（防抖）。类型安全，开箱即用。",
    tags: ["React", "客户端"],
  },
  {
    href: "/types",
    icon: Type,
    title: "类型工具",
    desc: "assertNever（穷尽性检查）、createContext（类型安全 Context 工厂）。编译时保证正确性。",
    tags: ["TypeScript", "通用"],
  },
];

/* =================================================================
 * Page
 * ================================================================ */

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Hero */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Package className="h-8 w-8 text-primary-500" />
          <h1 className="text-3xl font-bold tracking-tight">infra-fe</h1>
          <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-800 dark:text-primary-200">
            v0.1.0
          </span>
        </div>
        <p className="max-w-2xl text-lg text-muted-foreground">
          前端基础工具与基础设施库。提供可复用的 TypeScript 工具函数、React Hooks 和类型守卫。
          每个模块都可以独立使用，零依赖捆绑（除必要的 peer 包）。
        </p>
      </section>

      {/* Module cards */}
      <section>
        <h2 className="mb-6 text-lg font-semibold">可用模块</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => (
            <Link
              key={mod.href}
              href={mod.href}
              className={cn(
                "group rounded-lg border border-border p-5 no-underline",
                "transition-all hover:border-primary-300 hover:shadow-sm",
                "dark:hover:border-primary-700",
              )}
            >
              <mod.icon className="mb-3 h-6 w-6 text-primary-500" />
              <h3 className="mb-1.5 font-semibold text-foreground group-hover:text-primary-600 dark:group-hover:text-primary-400">
                {mod.title}
              </h3>
              <p className="text-sm text-muted-foreground">{mod.desc}</p>
              <div className="mt-3 flex gap-1.5">
                {mod.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer note */}
      <footer className="mt-16 border-t border-border pt-6 text-center text-xs text-muted-foreground">
        <p>
          ⚠️ 此站点仅为 infra-fe 工具库的辅助演示页面，非独立应用。
          核心代码位于 <code className="rounded bg-muted px-1 py-0.5 font-mono">src/</code> 目录。
        </p>
      </footer>
    </div>
  );
}
