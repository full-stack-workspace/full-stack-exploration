/**
 * ============================================================================
 * 动态段布局 — 动态 SEO Metadata
 * ============================================================================
 *
 * 为 /router/dynamic-routes/[id] 提供动态元数据。
 *
 * 为什么用 layout 而不是 page:
 * - page.tsx 的演示组件是 "use client" Client Component,无法导出 metadata
 * - layout.tsx 始终是 Server Component,可安全导出 generateMetadata
 * - layout 的 params 同样可访问路由参数
 *
 * @module router/dynamic-routes/[id]/layout
 */

import type { Metadata } from "next";

import { getUserById } from "@/data/user";
import { SITE_NAME } from "@/lib/topic-meta";

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
      description: "该用户不存在或已被移除。",
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

/** 仅承载 generateMetadata,不引入额外 DOM 层级 */
export default function DynamicSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
