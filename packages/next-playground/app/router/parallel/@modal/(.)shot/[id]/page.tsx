/**
 * 拦截路由:从 /router/parallel 客户端导航到 /shot/[id] 时,
 * 渲染弹层,而不是换成完整页。
 *
 * cacheComponents 备注:镜头是固定本地列表,generateStaticParams
 * 把三条全部构建期预渲染;未知 id 由动态参数兜底在运行时渲染,
 * 查不到仍走 notFound() 返回 404。
 */

import { notFound } from "next/navigation";

import { ShotModal } from "@/topics/router/parallel/ShotModal";
import { getShot, SHOTS } from "@/topics/router/parallel/shots";

/** 三条镜头全部构建期预渲染(数据是固定本地列表) */
export function generateStaticParams() {
    return SHOTS.map((shot) => ({ id: shot.id }));
}

export default async function InterceptedShotPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const shot = getShot(id);
    if (!shot) {
        notFound();
    }
    return <ShotModal shot={shot} />;
}
