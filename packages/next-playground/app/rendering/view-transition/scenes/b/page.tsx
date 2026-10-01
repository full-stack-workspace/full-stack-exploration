/**
 * 场景 B — 转场活演示的另一端,与场景 A 互跳。
 */

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "转场演示 · 场景 B",
    robots: { index: false, follow: false },
};

export default function SceneB() {
    return (
        <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl bg-violet-600 p-8 text-white">
                <p className="font-mono text-[11px] tracking-[0.18em] opacity-80">
                    SCENE B — scenes/layout.tsx 的 ViewTransition 内
                </p>
                <h1 className="mt-4 font-display text-3xl font-semibold tracking-[-0.03em]">
                    紫色场景
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-relaxed opacity-90">
                    再点回去:方向反了,滑动也反 —— 同一对 ViewTransition 边界,
                    靠 transitionTypes 区分 nav-forward / nav-back,
                    而不是两套动画。
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                        href="/rendering/view-transition/scenes/a"
                        transitionTypes={["nav-back"]}
                        className="rounded-md bg-white px-3.5 py-2 text-sm font-medium text-violet-600 transition-colors hover:bg-neutral-100"
                    >
                        ← 返回场景 A(nav-back)
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
