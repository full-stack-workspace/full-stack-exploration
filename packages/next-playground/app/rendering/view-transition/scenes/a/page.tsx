/**
 * 场景 A — 转场活演示的一端。
 * 与场景 B 互跳:Link 带 transitionTypes,方向感知的滑动由此触发。
 */

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "转场演示 · 场景 A",
    robots: { index: false, follow: false },
};

export default function SceneA() {
    return (
        <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl bg-signal-600 p-8 text-white dark:bg-signal-500 dark:text-ink">
                <p className="font-mono text-[11px] tracking-[0.18em] opacity-80">
                    SCENE A — scenes/layout.tsx 的 ViewTransition 内
                </p>
                <h1 className="mt-4 font-display text-3xl font-semibold tracking-[-0.03em]">
                    青色场景
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-relaxed opacity-90">
                    注意点击跳转的瞬间:旧场景向左滑出,新场景从右滑入 ——
                    方向来自 Link 上的 transitionTypes,类名映射在 scenes/layout.tsx,
                    动画配方在 globals.css 的 ::view-transition-old/new(.nav-*)。
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                        href="/rendering/view-transition/scenes/b"
                        transitionTypes={["nav-forward"]}
                        className="rounded-md bg-white px-3.5 py-2 text-sm font-medium text-signal-600 transition-colors hover:bg-neutral-100"
                    >
                        向前 → 场景 B(nav-forward)
                    </Link>
                    <Link
                        href="/rendering/view-transition"
                        transitionTypes={["nav-back"]}
                        className="rounded-md border border-white/50 px-3.5 py-2 text-sm font-medium transition-colors hover:bg-white/10"
                    >
                        ← 回到专题(nav-back)
                    </Link>
                </div>
            </div>
        </div>
    );
}
