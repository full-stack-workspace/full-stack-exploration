/**
 * 薄壳:镜头完整页路由。硬导航或刷新会到这里;
 * 从列表点链接则被 @modal/(.)shot 拦截,不会渲染本文件。
 * 内容组件在 topics/router/parallel/components/ShotPageContent。
 *
 * cacheComponents 备注:镜头是固定本地列表,generateStaticParams
 * 把三条全部构建期预渲染;未知 id 由动态参数兜底在运行时渲染,
 * 查不到仍走 notFound() 返回 404。
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ShotPageContent } from "@/topics/router/parallel/components/ShotPageContent";
import { getShot, SHOTS } from "@/topics/router/parallel/shots";

interface ShotPageProps {
    params: Promise<{ id: string }>;
}

/** 三条镜头全部构建期预渲染(数据是固定本地列表) */
export function generateStaticParams() {
    return SHOTS.map((shot) => ({ id: shot.id }));
}

/** 动态 metadata:标题带镜头名,与弹层(无独立标题)区分 */
export async function generateMetadata({
    params,
}: ShotPageProps): Promise<Metadata> {
    const { id } = await params;
    const shot = getShot(id);
    return { title: shot ? `${shot.label} · 完整页` : "未找到镜头" };
}

export default async function ShotPage({ params }: ShotPageProps) {
    const { id } = await params;
    const shot = getShot(id);
    if (!shot) {
        notFound();
    }

    return <ShotPageContent shot={shot} />;
}
