/**
 * 镜头的完整页。硬导航或刷新会到这里;
 * 从列表点链接则被 @modal/(.)shot 拦截,不会渲染本文件。
 */

import Link from "next/link";
import { notFound } from "next/navigation";

import { getShot } from "@/topics/router/parallel/shots";

export default async function ShotPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const shot = getShot(id);
    if (!shot) {
        notFound();
    }

    return (
        <div className="mx-auto max-w-6xl">
            <p className="font-mono text-[11px] tracking-[0.18em] text-copper-600 dark:text-copper-400">
                完整页 · 未被拦截
            </p>
            <h1 className="font-display mt-3 text-4xl font-semibold tracking-[-0.03em] text-ink dark:text-neutral-50">
                {shot.label}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                {shot.decision}
                你是直接打开这条 URL 的,所以没有弹层,列表也不在这下面。
            </p>
            <Link
                href="/router/parallel"
                className="mt-6 inline-flex text-sm font-medium text-ink underline decoration-copper-500 underline-offset-4 dark:text-neutral-100"
            >
                回到列表
            </Link>
        </div>
    );
}
