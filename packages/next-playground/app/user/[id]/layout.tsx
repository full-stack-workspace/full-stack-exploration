/**
 * ============================================================================
 * 用户详情布局 — 动态 SEO Metadata
 * ============================================================================
 *
 * 为 /user/[id] 动态路由提供 SEO 元数据。
 *
 * 为什么用 layout 而不是 page 来提供 metadata？
 * - page.tsx 是 "use client" Client Component，无法导出 metadata/generateMetadata
 * - layout.tsx 始终是 Server Component，可以安全地导出 generateMetadata
 * - layout 的 params 可访问路由参数，支持动态生成标题、描述等
 *
 * 记忆化说明：
 * - getUserById 是同步内存查找，天然无额外请求开销
 * - 如果未来改为数据库查询，用 React cache() 包裹可实现请求去重
 *
 * @module user/[id]/layout
 */

import type { Metadata } from "next";

import { getUserById } from "@/data/user";

/**
 * 动态生成用户详情页的 SEO 元数据
 *
 * Next.js 会在请求时调用此函数，根据 URL 参数动态生成页面标题和描述。
 * 这比静态 metadata 更适合内容因人而异、因数据而异的页面。
 */
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
      title: `${user.name} - ${user.role} | Next.js Demo`,
      description: user.bio,
      images: [
        {
          url: user.avatar,
          width: 400,
          height: 400,
          alt: user.name,
        },
      ],
      type: "profile",
    },
    twitter: {
      card: "summary",
      title: `${user.name} - ${user.role}`,
      description: user.bio,
      images: [user.avatar],
    },
  };
}

/**
 * 布局组件 — 透传 children 不做额外包装
 *
 * 仅用于承载 generateMetadata，不引入额外 DOM 层级。
 */
export default function UserDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
