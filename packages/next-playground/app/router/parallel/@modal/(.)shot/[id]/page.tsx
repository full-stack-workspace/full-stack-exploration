/**
 * 拦截路由:从 /router/parallel 客户端导航到 /shot/[id] 时,
 * 渲染弹层,而不是换成完整页。
 */

import { notFound } from "next/navigation";

import { ShotModal } from "@/topics/router/parallel/ShotModal";
import { getShot } from "@/topics/router/parallel/shots";

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
