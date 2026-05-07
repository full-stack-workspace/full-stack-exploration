/**
 * ============================================================================
 * User List Page (用户列表页面)
 * ============================================================================
 *
 * 展示团队成员/用户列表的页面。
 *
 * 功能特点：
 * - 展示团队成员卡片列表
 * - 显示用户头像、名称、职位、简介
 * - 在线状态指示器（在线/离开/离线）
 * - 搜索功能（UI 预留）
 * - 可导航到用户详情页
 * - 支持客户端添加新成员（模拟）
 *
 * 页面结构：
 * 1. Header Section - 页面标题区域
 * 2. Toolbar Section - 搜索和操作栏（UserListClient）
 * 3. User Grid Section - 用户卡片网格（UserListClient）
 *
 * 架构说明：
 * - page.tsx 保持为 Server Component，可被 Next.js 预渲染
 * - 交互逻辑（搜索、添加）封装在 UserListClient Client Component 中
 * - 水合后 UserListClient 接管搜索和添加功能
 *
 * @module user/page
 */

import { Metadata } from "next";
import UserListClient from "@/components/UserListClient";
import { users } from "@/data/user";

/**
 * 用户列表页 SEO 元数据
 */
export const metadata: Metadata = {
  title: "团队成员",
  description:
    "认识我们才华横溢的团队成员，包含创始人、技术总监、设计师等核心成员介绍。",
  openGraph: {
    title: "团队成员 | Next.js Demo",
    description:
      "认识我们才华横溢的团队。浏览团队成员的个人资料、技能和联系方式。",
  },
};

/**
 * ============================================================================
 * 用户列表页面组件
 * ============================================================================
 *
 * 作为 Server Component，可以被 Next.js 预渲染为静态 HTML。
 * 将初始用户数据传递给 UserListClient 进行交互管理。
 */
export default function UserListPage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* =================================================================
             * Header Section - 页面标题区域
             * ================================================================
             */}
            <section className="relative overflow-hidden bg-gradient-to-b from-neutral-50 to-white py-16 sm:py-24 dark:from-neutral-900 dark:to-neutral-950">
                {/* 背景装饰 - 使用 success 色系的渐变 */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-success-100/30 to-transparent rounded-full blur-3xl dark:from-success-900/20 dark:to-transparent" />
                </div>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        {/* 页面标题 */}
                        <h1 className="animate-slide-up text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl mb-4 dark:text-neutral-50">
                            团队成员
                        </h1>
                        {/* 页面描述 */}
                        <p className="animate-slide-up stagger-1 text-lg text-neutral-600 dark:text-neutral-400">
                            认识一下我们才华横溢的团队
                        </p>
                    </div>
                </div>
            </section>

            {/* =================================================================
             * User List Client Section - 用户列表交互区域
             * ================================================================
             * 包含搜索框、添加按钮和用户卡片网格
             * 由 UserListClient Client Component 渲染，支持水合后交互
             */}
            <UserListClient initialUsers={users} />
        </div>
    );
}