/**
 * 活演示页 beta:与 alpha 同组,共享 (demo)/layout.tsx 的组级外壳。
 * 文件在 (demo)/beta/page.tsx,URL 是 /router/route-groups/beta。
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "路由组演示 · beta",
    robots: { index: false, follow: false },
};

export default function BetaPage() {
    return (
        <div>
            <h1 className="text-xl font-semibold text-ink dark:text-neutral-50">
                beta 页
            </h1>
            <dl className="mt-4 space-y-3 text-sm leading-relaxed">
                <div>
                    <dt className="font-mono text-[11px] tracking-[0.14em] text-neutral-400 dark:text-neutral-500">
                        文件位置
                    </dt>
                    <dd className="mt-1 font-mono text-xs text-neutral-700 dark:text-neutral-300">
                        app/router/route-groups/(demo)/beta/page.tsx
                    </dd>
                </div>
                <div>
                    <dt className="font-mono text-[11px] tracking-[0.14em] text-neutral-400 dark:text-neutral-500">
                        实际 URL
                    </dt>
                    <dd className="mt-1 font-mono text-xs text-neutral-700 dark:text-neutral-300">
                        /router/route-groups/beta — 与 alpha 同组,共享组级 layout
                    </dd>
                </div>
            </dl>
            <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                beta 与 alpha 的内容不同,但外面那圈虚线(组级 layout)是同一个实例:
                组内导航不会卸载它。
            </p>
        </div>
    );
}
