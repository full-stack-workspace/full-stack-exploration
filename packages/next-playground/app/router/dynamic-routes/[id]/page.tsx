/**
 * ============================================================================
 * 动态段详情 — Server Component
 * ============================================================================
 *
 * 已知 id 由 generateStaticParams 在构建期生成。
 * generateMetadata 与页面同文件:page 保持 Server,就不需要再借 layout 导出标题。
 * 没有这个用户时 notFound(),而不是在客户端画一句「不存在」。
 *
 * @module app/router/dynamic-routes/[id]/page
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getUserById, users } from "@/data/user";
import { SITE_NAME } from "@/lib/topic-meta";
import UserDetail from "@/topics/router/dynamic-routes/UserDetail";

export function generateStaticParams() {
    return users.map((user) => ({ id: String(user.id) }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const { id } = await params;
    const user = getUserById(Number(id));
    if (!user) {
        return {
            title: "用户未找到",
            robots: { index: false, follow: true },
        };
    }
    return {
        title: `${user.name} - ${user.role}`,
        description: user.bio,
        openGraph: {
            title: `${user.name} - ${user.role} | ${SITE_NAME}`,
            description: user.bio,
            type: "profile",
        },
    };
}

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const user = getUserById(Number(id));
    if (!user) {
        notFound();
    }
    return <UserDetail user={user} />;
}
