/**
 * ============================================================================
 * TypeScript 类型工具演示页
 * ============================================================================
 *
 * ⚠️ 此页面仅为 infra-fe 工具库的辅助演示页面。
 *
 * @module app/types/page
 */

"use client";

import { CodeExample } from "@demo/components/CodeExample";
import { useState } from "react";

import { assertNever } from "@/assert-never";
import { createContext } from "@/create-context";

/* =================================================================
 * assertNever Demo: State machine
 * ================================================================ */

type RequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: string }
  | { status: "error"; message: string };

function renderState(state: RequestState): string {
  switch (state.status) {
    case "idle":
      return "⏳ 空闲中...";
    case "loading":
      return "🔄 加载中...";
    case "success":
      return `✅ 成功: ${state.data}`;
    case "error":
      return `❌ 错误: ${state.message}`;
    default:
      // 如果新增了 status 变体但忘记处理，TypeScript 编译时报错
      return assertNever(state);
  }
}

const assertNeverCode = `type RequestState =\n  | { status: 'idle' }\n  | { status: 'loading' }\n  | { status: 'success'; data: string }\n  | { status: 'error'; message: string };\n\nfunction renderState(state: RequestState): string {\n  switch (state.status) {\n    case 'idle':    return '⏳ 空闲中...';\n    case 'loading': return '🔄 加载中...';\n    case 'success': return \`✅ 成功: \${state.data}\`;\n    case 'error':   return \`❌ 错误: \${state.message}\`;\n    default:\n      // 如果漏掉了某个 status，TypeScript 编译报错\n      return assertNever(state);\n  }\n}`;

/* =================================================================
 * createContext Demo
 * ================================================================ */

interface CounterCtx {
  count: number;
  increment: () => void;
}

const { Provider: CounterProvider, use: useCounter } = createContext<CounterCtx>({
  name: "Counter",
  defaultValue: { count: 0, increment: () => {} },
});

function CounterDisplay() {
  const { count, increment } = useCounter(); // 类型安全，无需判空
  return (
    <div className="flex items-center gap-3">
      <span className="text-lg font-mono tabular-nums">{count}</span>
      <button
        type="button"
        onClick={increment}
        className="rounded-md bg-primary-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-600"
      >
        +1
      </button>
    </div>
  );
}

const createContextCode = `import { createContext } from '@/create-context';\n\ninterface CounterCtx {\n  count: number;\n  increment: () => void;\n}\n\nconst { Provider, use: useCounter } = createContext<CounterCtx>({\n  name: 'Counter',\n  defaultValue: { count: 0, increment: () => {} },\n});\n\n// 在组件中使用 — 类型安全，无需判空\nfunction CounterDisplay() {\n  const { count, increment } = useCounter();\n  return <button onClick={increment}>{count}</button>;\n}`;

/* =================================================================
 * Page
 * ================================================================ */

export default function TypesDemoPage() {
  const [reqState, setReqState] = useState<RequestState>({ status: "idle" });

  function simulateRequest() {
    setReqState({ status: "loading" });
    setTimeout(() => {
      if (Math.random() > 0.3) {
        setReqState({ status: "success", data: `响应于 ${new Date().toLocaleTimeString()}` });
      } else {
        setReqState({ status: "error", message: "网络超时" });
      }
    }, 1500);
  }

  const [counter, setCounter] = useState(0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold tracking-tight">类型工具</h1>
      <p className="mb-8 text-muted-foreground">
        编译时类型安全工具，帮助你在 TypeScript 中写出更健壮的代码。
      </p>

      {/* assertNever */}
      <CodeExample
        title="assertNever — 穷尽性检查"
        code={assertNeverCode}
      >
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            对 discriminated union 做 switch 时，如果忘记处理某个分支，TypeScript 会在编译时报错。
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={simulateRequest}
              disabled={reqState.status === "loading"}
              className="rounded-md bg-primary-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
            >
              模拟请求
            </button>
            <span className="text-sm text-muted-foreground">
              {renderState(reqState)}
            </span>
          </div>
          <div className="flex gap-1.5">
            {(["idle", "loading", "success", "error"] as const).map((s) => (
              <span
                key={s}
                className="rounded bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                {s}
              </span>
            ))}
            <span className="text-[11px] text-muted-foreground">
              ← 4 个变体全部覆盖，default 分支触发 assertNever
            </span>
          </div>
        </div>
      </CodeExample>

      {/* createContext */}
      <CodeExample
        title="createContext — 类型安全 Context 工厂"
        code={createContextCode}
        className="mt-6"
      >
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            不再需要为 createContext 提供无意义的默认值，消费端也无需判空。
          </p>
          <CounterProvider value={{ count: counter, increment: () => setCounter((c) => c + 1) }}>
            <CounterDisplay />
          </CounterProvider>
        </div>
      </CodeExample>
    </div>
  );
}
