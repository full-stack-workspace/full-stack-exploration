/**
 * ============================================================================
 * UserDirectory.tsx — 查询演示:fragment 拼装出的用户目录
 * ============================================================================
 *
 * 页面顶层的唯一一次查询:UserDirectoryQuery 自身不声明任何业务字段,
 * 只做两件事 —— 取列表的 id 用于 key,再展开各卡片的 fragment。
 * relay-compiler 在构建期把所有 fragment 静态汇总成一次网络请求;
 * 加载期间由 Suspense 渲染骨架屏(骨架化,不再是「加载中...」文案)。
 *
 * @module topics/advanced/relay/components/UserDirectory
 */

import { memo, Suspense } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import type { UserDirectoryQuery } from '../../../../__generated__/UserDirectoryQuery.graphql';

import { UserCard } from './UserCard';
import { PostCard } from './PostCard';

/* =================================================================
 * 骨架屏:与卡片布局同形,加载期间占位
 * ================================================================ */

const DirectorySkeleton = memo(() => {
    const pulse = 'animate-pulse rounded bg-gray-200 dark:bg-slate-700';
    return (
        <div data-testid="directory-skeleton" className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {['用户', '文章'].map((label) => (
                <div
                    key={label}
                    className="rounded-card border border-gray-100 bg-gray-50 p-5 dark:border-slate-800 dark:bg-slate-800/50"
                >
                    <div className={`${pulse} mb-4 h-5 w-24`} aria-label={`${label}列表加载中`} />
                    <div className="space-y-3">
                        <div className={`${pulse} h-10 w-full`} />
                        <div className={`${pulse} h-10 w-full`} />
                    </div>
                </div>
            ))}
        </div>
    );
});

DirectorySkeleton.displayName = 'DirectorySkeleton';

/* =================================================================
 * 查询内容:挂起期间由外层 Suspense 接管
 * ================================================================ */

const DirectoryContent = memo(() => {
    // 查询本身不挑业务字段,只展开子组件的 fragment —— 字段需求全部 colocate 在卡片里
    const data = useLazyLoadQuery<UserDirectoryQuery>(
        graphql`
            query UserDirectoryQuery {
                users {
                    id
                    ...UserCard_user
                }
                posts {
                    id
                    ...PostCard_post
                }
            }
        `,
        {},
    );

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* 用户列表:每张卡片的数据需求由 UserCard 的 fragment 声明 */}
            <div className="rounded-card border border-gray-100 bg-gray-50 p-5 dark:border-slate-800 dark:bg-slate-800/50">
                <h3 className="mb-4 text-sm font-semibold text-gray-700 dark:text-slate-200">用户列表</h3>
                {data.users.length > 0 ? (
                    <ul className="space-y-3">
                        {data.users.map((user) => (
                            // 传下去的是 fragment 引用,父组件读不到 user.name / user.email
                            <UserCard key={user.id} user={user} />
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-400 dark:text-slate-500">暂无用户数据</p>
                )}
            </div>

            {/* 文章列表:同理,字段由 PostCard 的 fragment 声明 */}
            <div className="rounded-card border border-gray-100 bg-gray-50 p-5 dark:border-slate-800 dark:bg-slate-800/50">
                <h3 className="mb-4 text-sm font-semibold text-gray-700 dark:text-slate-200">文章列表</h3>
                {data.posts.length > 0 ? (
                    <ul className="space-y-4">
                        {data.posts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-400 dark:text-slate-500">暂无文章数据</p>
                )}
            </div>
        </div>
    );
});

DirectoryContent.displayName = 'DirectoryContent';

/**
 * 查询演示入口:Suspense 边界内聚在 demo 内部,
 * 页面其余 Section(静态概念内容)不受挂起影响。
 */
export const UserDirectory = memo(() => {
    return (
        <Suspense fallback={<DirectorySkeleton />}>
            <DirectoryContent />
        </Suspense>
    );
});

UserDirectory.displayName = 'UserDirectory';
