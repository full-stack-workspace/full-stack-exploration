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
 *
 * 页面结构：
 * 1. Header Section - 页面标题区域
 * 2. Toolbar Section - 搜索和操作栏
 * 3. User Grid Section - 用户卡片网格
 *
 * @module user/page
 */

import { Metadata } from "next";
import UserCard from "@/components/UserCard";
import { users } from "@/data/user";

/**
 * 页面 Metadata 配置
 */
export const metadata: Metadata = {
    title: "用户列表 - Users",
    description: "浏览我们的团队成员和用户",
};

/**
 * ============================================================================
 * 用户列表页面组件
 * ============================================================================
 */
export default function UserListPage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* =================================================================
             * Header Section - 页面标题区域
             * ================================================================
             */}
            <section className="relative overflow-hidden bg-gradient-to-b from-neutral-50 to-white py-16 sm:py-24">
                {/* 背景装饰 - 使用 success 色系的渐变 */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-success-100/30 to-transparent rounded-full blur-3xl" />
                </div>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        {/* 页面标题 */}
                        <h1 className="animate-slide-up text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl mb-4">
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
             * Toolbar Section - 工具栏区域
             * ================================================================
             * 包含搜索框和操作按钮
             */}
            <section className="bg-white py-8 border-b border-neutral-200/60 dark:bg-neutral-950 dark:border-neutral-800/60">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        {/* 搜索框 */}
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <input
                                    type="search"
                                    placeholder="搜索成员..."
                                    className="h-10 w-64 rounded-xl border border-neutral-200 bg-neutral-50 pl-10 pr-4 text-sm focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-800 dark:bg-neutral-900 dark:focus:border-primary-600"
                                />
                                {/* 搜索图标 */}
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex items-center gap-2">
                            <button className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-700">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                添加成员
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* =================================================================
             * User Grid Section - 用户卡片网格区域
             * ================================================================
             */}
            <section className="bg-neutral-50 py-12 dark:bg-neutral-900">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* 响应式网格：移动端 1 列，平板 2 列，桌面 3/4 列 */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {users.map((user, index) => (
                            <UserCard
                                key={user.id}
                                user={user}
                                animationDelay={index * 50}
                            />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
