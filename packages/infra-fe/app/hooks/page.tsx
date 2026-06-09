/**
 * ============================================================================
 * React Hooks 演示页
 * ============================================================================
 *
 * ⚠️ 此页面仅为 infra-fe 工具库的辅助演示页面。
 *
 * @module app/hooks/page
 */

"use client";

import { CodeExample } from "@demo/components/CodeExample";
import { useState } from "react";

import { useDebounce } from "@/use-debounce";
import { useLocalStorage } from "@/use-local-storage";

export default function HooksDemoPage() {
  /* ---- useLocalStorage ---- */
  const [name, setName] = useLocalStorage("infra-fe-demo-name", "");

  const storedValueCode = `import { useLocalStorage } from '@/use-local-storage';\n\nfunction MyComponent() {\n  const [name, setName] = useLocalStorage('infra-fe-demo-name', '');\n\n  return (\n    <input\n      value={name}\n      onChange={e => setName(e.target.value)}\n      placeholder="输入你的名字..."\n    />\n  );\n}`;

  /* ---- useDebounce ---- */
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);

  const debounceCode = `import { useDebounce } from '@/use-debounce';\n\nfunction SearchBox() {\n  const [query, setQuery] = useState('');\n  const debouncedQuery = useDebounce(query, 500);\n\n  // debouncedQuery 只在用户停止输入 500ms 后更新\n  useEffect(() => {\n    if (debouncedQuery) fetchResults(debouncedQuery);\n  }, [debouncedQuery]);\n\n  return <input value={query} onChange={e => setQuery(e.target.value)} />;\n}`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold tracking-tight">React Hooks</h1>
      <p className="mb-8 text-muted-foreground">
        类型安全、SSR 安全的 React Hooks。每个 Hook 都可以独立使用。
      </p>

      {/* useLocalStorage */}
      <CodeExample
        title="useLocalStorage — 持久化状态"
        code={storedValueCode}
      >
        <div className="space-y-3">
          <label className="block text-sm font-medium">
            你的名字（自动保存到 localStorage）：
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="输入你的名字..."
            className="block w-full max-w-sm rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
          {name && (
            <p className="text-sm text-muted-foreground">
              你好，<strong className="text-foreground">{name}</strong>！刷新页面后名字依然保留。
            </p>
          )}
          {!name && (
            <p className="text-sm text-muted-foreground">
              输入名字后刷新页面，看看 localStorage 持久化效果。
            </p>
          )}
        </div>
      </CodeExample>

      {/* useDebounce */}
      <CodeExample
        title="useDebounce — 输入防抖"
        code={debounceCode}
        className="mt-6"
      >
        <div className="space-y-3">
          <label className="block text-sm font-medium">
            搜索（500ms 防抖延迟）：
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="快速输入试试..."
            className="block w-full max-w-sm rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
          <div className="flex gap-4 text-sm">
            <span className="text-muted-foreground">
              即时值：<code className="rounded bg-muted px-1 font-mono">{query || '(空)'}</code>
            </span>
            <span className="text-muted-foreground">
              防抖值：<code className="rounded bg-primary-100 px-1 font-mono text-primary-700 dark:bg-primary-800 dark:text-primary-200">{debouncedQuery || '(空)'}</code>
            </span>
          </div>
        </div>
      </CodeExample>
    </div>
  );
}
