/**
 * ============================================================================
 * (demo) 组级布局 — 路由组的活演示
 * ============================================================================
 *
 * 本文件位于 app/router/route-groups/(demo)/layout.tsx:
 * - 圆括号目录名 (demo) 不出现在 URL 里,它只划定「哪些路由共享这层外壳」
 * - 这层 layout 只包 (demo) 组内的 alpha / beta 两页;
 *   同级的专题页(app/router/route-groups/page.tsx)不在组内,不会被它包到
 *
 * 视觉上用一圈虚线描边 + 标注条,让「这层 layout 存在且只作用于组内」
 * 在 alpha / beta 之间往返时可以直接观察到:标注条保持挂载不重渲染,
 * 只有内部页面内容在切换。
 *
 * @module app/router/route-groups/(demo)/layout
 */

import Link from "next/link";
import type { ReactNode } from "react";

export default function DemoGroupLayout({ children }: { children: ReactNode }) {
    return (
        <div className="mx-auto max-w-3xl rounded-xl border-2 border-dashed border-sky-300 p-6 dark:border-sky-700">
            <p className="font-mono text-[11px] tracking-[0.18em] text-sky-600 dark:text-sky-400">
                (demo)/layout.tsx — 组级布局,只包组内页面
            </p>
            <nav className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <Link
                    href="/router/route-groups/alpha"
                    className="font-medium text-sky-600 underline underline-offset-4 dark:text-sky-400"
                >
                    alpha
                </Link>
                <Link
                    href="/router/route-groups/beta"
                    className="font-medium text-sky-600 underline underline-offset-4 dark:text-sky-400"
                >
                    beta
                </Link>
                <Link
                    href="/router/route-groups"
                    className="text-neutral-500 underline underline-offset-4 hover:text-ink dark:text-neutral-400 dark:hover:text-neutral-50"
                >
                    回到专题(URL 同样不含 demo)
                </Link>
            </nav>
            <div className="mt-5">{children}</div>
        </div>
    );
}
