/**
 * 活演示页 alpha:文件在 app/router/route-groups/(demo)/alpha/page.tsx,
 * URL 却是 /router/route-groups/alpha —— (demo) 组名不进路径。
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "路由组演示 · alpha",
    robots: { index: false, follow: false },
};

export default function AlphaPage() {
    return (
        <div>
            <h1 className="text-xl font-semibold text-ink dark:text-neutral-50">
                alpha 页
            </h1>
            <dl className="mt-4 space-y-3 text-sm leading-relaxed">
                <div>
                    <dt className="font-mono text-[11px] tracking-[0.14em] text-neutral-400 dark:text-neutral-500">
                        文件位置
                    </dt>
                    <dd className="mt-1 font-mono text-xs text-neutral-700 dark:text-neutral-300">
                        app/router/route-groups/(demo)/alpha/page.tsx
                    </dd>
                </div>
                <div>
                    <dt className="font-mono text-[11px] tracking-[0.14em] text-neutral-400 dark:text-neutral-500">
                        实际 URL
                    </dt>
                    <dd className="mt-1 font-mono text-xs text-neutral-700 dark:text-neutral-300">
                        /router/route-groups/alpha — 没有 demo 这一段
                    </dd>
                </div>
            </dl>
            <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                在 alpha / beta 之间点来点去:虚线框和标注条(组级 layout)保持挂载,
                只有这段页面内容在换。
            </p>
        </div>
    );
}
