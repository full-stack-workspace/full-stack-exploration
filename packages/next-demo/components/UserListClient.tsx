/**
 * ============================================================================
 * User List Client Component (用户列表客户端组件)
 * ============================================================================
 *
 * 处理用户列表的交互逻辑，包括搜索和添加成员功能。
 *
 * 功能特点：
 * - 管理用户列表状态（支持动态添加成员）
 * - 实时搜索过滤（按名称、职位搜索）
 * - 添加新成员（模拟数据）
 * - 响应式用户卡片网格展示
 *
 * 使用场景：
 * - 作为 UserListPage 的交互层
 * - 保持页面 Server Component 特性以支持预渲染
 *
 * @module components/UserListClient
 */

"use client";

import { useCallback,useMemo, useState } from "react";

import type { User } from "@/types/user";

import UserCard from "./UserCard";

interface UserListClientProps {
    initialUsers: User[];
}

const randomNames = ["张伟", "王芳", "李明", "刘洋", "陈静", "杨帆", "赵雷", "周琳", "吴昊", "郑雪"];
const randomRoles = [
    "前端工程师",
    "后端工程师",
    "全栈工程师",
    "UI设计师",
    "产品经理",
    "测试工程师",
    "AI 算法工程师",
    "机器学习工程师",
    "深度学习工程师",
    "Prompt 工程师",
    "AI 产品经理",
    "数据科学家",
    "Agent 开发工程师",
    "AI Agent 工程师",
    "Agent 系统架构师",
    "Multi-Agent 系统工程师",
    "Autonomous Agent 工程师",
];

export default function UserListClient({ initialUsers }: UserListClientProps) {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const filteredUsers = useMemo(() => {
        if (!searchQuery.trim()) {return users;}
        const query = searchQuery.toLowerCase();
        return users.filter(
            (user) =>
                user.name.toLowerCase().includes(query) ||
                user.role.toLowerCase().includes(query)
        );
    }, [users, searchQuery]);

    const handleAddMember = useCallback(() => {
        if (isAdding) {return;}
        setIsAdding(true);

        const newUser: User = {
            id: Date.now(),
            name: randomNames[Math.floor(Math.random() * randomNames.length)],
            email: `user${Date.now()}@example.com`,
            role: randomRoles[Math.floor(Math.random() * randomRoles.length)],
            avatar: `https://picsum.photos/seed/${Date.now()}/200/200`,
            status: "online",
            projects: Math.floor(Math.random() * 10) + 1,
            bio: "这是一名新加入的团队成员，热爱技术，喜欢学习和分享。",
            location: "北京",
            joinedDate: new Date().toLocaleDateString("zh-CN"),
            followers: Math.floor(Math.random() * 1000),
            following: Math.floor(Math.random() * 500),
        };

        setUsers((prev) => [newUser, ...prev]);
        setTimeout(() => setIsAdding(false), 500);
    }, [isAdding]);

    return (
        <>
            <section className="bg-white py-8 border-b border-neutral-200/60 dark:bg-neutral-950 dark:border-neutral-800/60">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <input
                                    type="search"
                                    placeholder="搜索成员..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-10 w-64 rounded-xl border border-neutral-200 bg-neutral-50 pl-10 pr-4 text-sm focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-800 dark:bg-neutral-900 dark:focus:border-primary-600"
                                />
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            {searchQuery && (
                                <span className="text-sm text-neutral-500">
                                    找到 {filteredUsers.length} 个成员
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleAddMember}
                                disabled={isAdding}
                                className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg
                                    className={`h-4 w-4 ${isAdding ? "animate-spin" : ""}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d={isAdding ? "M12 6v6l4 2" : "M12 4v16m8-8H4"}
                                    />
                                </svg>
                                {isAdding ? "添加中..." : "添加成员"}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-neutral-50 py-12 dark:bg-neutral-900">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {filteredUsers.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredUsers.map((user, index) => (
                                <UserCard
                                    key={user.id}
                                    user={user}
                                    animationDelay={index * 50}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-neutral-300 dark:text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <p className="mt-4 text-neutral-500 dark:text-neutral-400">
                                {searchQuery ? "未找到匹配的成员" : "暂无成员"}
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}