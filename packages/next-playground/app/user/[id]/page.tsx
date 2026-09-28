/**
 * ============================================================================
 * User Detail Page (用户详情页面)
 * ============================================================================
 *
 * 展示单个团队成员详细信息的页面。
 *
 * 功能特点：
 * - 用户基本信息展示（头像、姓名、职位、状态）
 * - 联系信息展示（邮箱、位置、加入日期）
 * - 统计数据展示（项目数、粉丝数、关注数）
 * - 发布的文章列表（从外部 API 动态获取）
 * - 技能标签展示
 * - 联系/收藏操作按钮
 *
 * 数据来源：
 * - 用户数据从 @/data/user 获取（getUserById）
 * - 文章数据从 jsonplaceholder API 动态获取
 *
 * 页面结构：
 * 1. Back Navigation - 返回链接
 * 2. Left Column - 用户信息侧边栏
 *    - 头像和状态指示器
 *    - 基本信息和联系资料
 *    - 统计数据
 *    - 操作按钮
 * 3. Right Column - 用户内容区域
 *    - 个人简介
 *    - 发布的文章
 *    - 技能标签
 *
 * @module user/[id]/page
 */

"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense } from "react";
import useSWR from "swr";

import { getUserById } from "@/data/user";

/**
 * ============================================================================
 * 文章数据结构接口
 * ============================================================================
 * 从 jsonplaceholder API 获取的文章数据结构
 */
interface Post {
    title: string;
    body: string;
    userId?: number;
}

/**
 * ============================================================================
 * 状态配置
 * ============================================================================
 * 不同在线状态对应的显示颜色和标签
 *
 * - online (在线): 绿色 success-500
 * - away (离开): 橙色 warning-500
 * - offline (离线): 灰色 neutral-400
 */
const statusConfig = {
    online: { color: "bg-success-500", label: "在线" },
    away: { color: "bg-warning-500", label: "离开" },
    offline: { color: "bg-neutral-400", label: "离线" },
};

/**
 * ============================================================================
 * SWR fetcher 函数
 * ============================================================================
 * 用于 SWR 请求的通用 fetcher
 * 基于 fetch API 实现
 */
const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * ============================================================================
 * 用户详情内容组件
 * ============================================================================
 *
 * 核心逻辑：
 * 1. 从 URL 参数获取用户 ID
 * 2. 调用 getUserById 获取用户数据
 * 3. 用户不存在时显示友好提示
 * 4. 使用 useSWR 获取文章数据（自动缓存、重新验证）
 * 5. 根据加载状态显示骨架屏或实际内容
 */
function UserDetailContent() {
    const params = useParams();
    const userId = Number(params.id);

    /**
     * 根据 ID 获取用户数据
     * 如果用户不存在（undefined），会显示"用户不存在"提示
     */
    const user = getUserById(userId);

    /**
     * 使用 SWR 获取文章数据
     *
     * SWR 特性：
     * - 自动缓存请求结果
     * - 页面重新聚焦时自动重新验证
     * - 快速切换时使用缓存数据
     * - 错误时自动重试
     */
    const { data: post, isLoading: loading } = useSWR<Post>(
        `https://jsonplaceholder.typicode.com/posts/${userId}`,
        fetcher
    );

    /**
     * 用户不存在时的降级处理
     * 显示友好提示和返回链接
     */
    if (!user) {
        return (
            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-neutral-600 dark:text-neutral-400">用户不存在</p>
                    <Link href="/user" className="text-primary-600 hover:underline mt-2 inline-block">
                        返回团队列表
                    </Link>
                </div>
            </div>
        );
    }

    /**
     * 根据用户状态获取对应的显示配置
     * 如果状态不在配置中，默认为离线状态
     */
    const status = statusConfig[user.status] || statusConfig.offline;

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
            <div className="bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-950 dark:to-neutral-900">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                    {/* =================================================================
                     * 返回导航
                     * ================================================================
                     */}
                    <div className="mb-6">
                        <Link
                            href="/user"
                            className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-600 transition-colors dark:text-neutral-400 dark:hover:text-primary-400"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            返回团队列表
                        </Link>
                    </div>

                    {/* =================================================================
                     * 主内容区域 - 双列布局
                     * ================================================================
                     * 左侧：用户信息卡片（粘性定位）
                     * 右侧：用户动态内容（简介、文章、技能）
                     */}
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* =============================================================
                         * 左侧用户信息栏
                         * =============================================================
                         */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24">
                                <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-lg dark:border-neutral-800/60 dark:bg-neutral-900">
                                    {/* 头像和状态 */}
                                    <div className="text-center">
                                        <div className="relative mx-auto mb-4 inline-block">
                                            <img
                                                src={user.avatar}
                                                alt={user.name}
                                                className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg dark:border-neutral-800"
                                            />
                                            <div className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-2 border-white ${status.color}`}>
                                                <span className="sr-only">{status.label}</span>
                                            </div>
                                        </div>

                                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                                            {user.name}
                                        </h1>
                                        <p className="text-primary-600 font-medium dark:text-primary-400">{user.role}</p>

                                        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-success-50 px-3 py-1 text-xs font-medium text-success-600 dark:bg-success-900/30 dark:text-success-400">
                                            <span className={`w-1.5 h-1.5 rounded-full ${status.color}`} />
                                            {status.label}
                                        </div>
                                    </div>

                                    {/* 联系信息 */}
                                    <div className="mt-6 space-y-4">
                                        <div className="flex items-center gap-3 text-sm">
                                            <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-neutral-600 dark:text-neutral-400">{user.email}</span>
                                        </div>
                                        {user.location && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span className="text-neutral-600 dark:text-neutral-400">{user.location}</span>
                                            </div>
                                        )}
                                        {user.joinedDate && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span className="text-neutral-600 dark:text-neutral-400">加入于 {user.joinedDate}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* 统计数据 */}
                                    <div className="mt-6 grid grid-cols-3 gap-4 border-t border-neutral-100 pt-6 dark:border-neutral-800">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{user.projects}</p>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-500">项目</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-secondary-600 dark:text-secondary-400">
                                                {user.followers && user.followers > 1000 ? `${(user.followers / 1000).toFixed(1)}k` : (user.followers || 0)}
                                            </p>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-500">粉丝</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-accent-600 dark:text-accent-400">{user.following || 0}</p>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-500">关注</p>
                                        </div>
                                    </div>

                                    {/* 操作按钮 */}
                                    <div className="mt-6 flex gap-3">
                                        <button className="flex-1 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-700">
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            联系
                                        </button>
                                        <button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600 shadow-sm transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700">
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* =============================================================
                         * 右侧内容区域
                         * =============================================================
                         */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* 个人简介 */}
                            <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-lg dark:border-neutral-800/60 dark:bg-neutral-900">
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4">
                                    个人简介
                                </h2>
                                <p className="text-neutral-600 leading-relaxed dark:text-neutral-400">
                                    {user.bio}
                                </p>
                            </div>
                            {/* 技能标签 */}
                            <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-lg dark:border-neutral-800/60 dark:bg-neutral-900">
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4">
                                    技能标签
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {["React", "TypeScript", "Node.js", "Python", "UI/UX", "Git", "Docker", "AWS", "GraphQL", "Tailwind CSS"].map((skill) => (
                                        <span
                                            key={skill}
                                            className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600 transition-colors hover:bg-primary-100 hover:text-primary-600 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-primary-900/30 dark:hover:text-primary-400"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* 发布的文章 */}
                            <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-lg dark:border-neutral-800/60 dark:bg-neutral-900">
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4">
                                    发布的文章
                                </h2>

                                {loading ? (
                                    /* 加载状态：显示骨架屏 */
                                    <div className="space-y-4">
                                        {[1, 2].map((i) => (
                                            <div key={i} className="animate-pulse rounded-xl bg-neutral-100 p-4 dark:bg-neutral-800">
                                                <div className="h-5 w-3/4 rounded bg-neutral-200 dark:bg-neutral-700 mb-2" />
                                                <div className="h-4 w-full rounded bg-neutral-200 dark:bg-neutral-700 mb-2" />
                                                <div className="h-4 w-2/3 rounded bg-neutral-200 dark:bg-neutral-700" />
                                            </div>
                                        ))}
                                    </div>
                                ) : post?.title ? (
                                    /* 有文章数据：显示文章卡片 */
                                    <div className="space-y-4">
                                        <div className="group relative overflow-hidden rounded-xl border border-neutral-100 p-4 transition-all duration-200 hover:border-primary-200/60 hover:shadow-md dark:border-neutral-800">
                                            <div className="flex items-start gap-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-secondary-100 text-primary-600">
                                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors dark:text-neutral-50 dark:group-hover:text-primary-400">
                                                        {post.title}
                                                    </h3>
                                                    <p className="mt-1 text-sm text-neutral-600 line-clamp-2 dark:text-neutral-400">
                                                        {post.body}
                                                    </p>
                                                    <div className="mt-3 flex items-center gap-4 text-xs text-neutral-400">
                                                        <span className="flex items-center gap-1">
                                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                                            </svg>
                                                            12 评论
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                            </svg>
                                                            34 点赞
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            3 分钟前
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* 无文章数据：显示空状态 */
                                    <div className="text-center py-8 text-neutral-400">
                                        <svg className="mx-auto h-12 w-12 text-neutral-300 dark:text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="mt-2 text-sm">暂无文章</p>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * ============================================================================
 * 加载中降级组件
 * ============================================================================
 *
 * 在 Suspense 边界等待时显示的加载状态
 * 使用旋转动画的加载图标和提示文字
 */
function LoadingFallback() {
    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
            <div className="text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                    <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                </div>
                <p className="mt-4 text-neutral-600 dark:text-neutral-400">加载中...</p>
            </div>
        </div>
    );
}

/**
 * ============================================================================
 * 用户详情页面入口
 * ============================================================================
 *
 * 使用 Suspense 包裹内容组件，支持：
 * - Next.js 的流式 SSR
 * - 路由变化时的优雅降级
 * - 加载状态与内容的分离
 */
export default function UserDetail() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <UserDetailContent />
        </Suspense>
    );
}