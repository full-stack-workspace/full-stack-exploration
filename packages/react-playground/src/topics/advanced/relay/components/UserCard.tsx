/**
 * ============================================================================
 * UserCard.tsx — fragment colocation 演示:用户卡片
 * ============================================================================
 *
 * Relay 的核心范式:组件在「同文件内」用 fragment 声明自己需要哪些字段,
 * 父查询通过 ...UserCard_user 展开;父组件只能传入 fragment 引用,
 * 读不到具体字段 —— 这就是 Relay 的数据边界(data masking)。
 *
 * 改需求时只动这一个文件:加字段直接写在 fragment 里,
 * relay-compiler 会把它静态汇总进父查询,并同步生成 TypeScript 类型。
 *
 * @module topics/advanced/relay/components/UserCard
 */

import { memo } from 'react';
import { graphql, useFragment } from 'react-relay';
import type { UserCard_user$key } from '../../../../__generated__/UserCard_user.graphql';

interface UserCardProps {
    /** fragment 引用(由父查询展开 ...UserCard_user 获得),不是普通对象 */
    user: UserCard_user$key;
}

/**
 * @param props.user - User fragment 的引用
 * @returns 用户卡片(头像占位 + 姓名 + 邮箱)
 */
export const UserCard = memo(({ user: userKey }: UserCardProps) => {
    const user = useFragment(
        graphql`
            fragment UserCard_user on User {
                id
                name
                email
                avatar
            }
        `,
        userKey,
    );

    return (
        <li className="flex items-center gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0 dark:border-slate-800">
            {/* avatar 字段为 null 时退化为首字母占位 */}
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700 dark:bg-primary-500/15 dark:text-primary-400">
                {user.name.charAt(0)}
            </span>
            <div className="min-w-0">
                <div className="truncate text-sm font-medium text-gray-800 dark:text-slate-200">
                    {user.name}
                </div>
                <div className="truncate text-xs text-gray-500 dark:text-slate-400">{user.email}</div>
            </div>
        </li>
    );
});

UserCard.displayName = 'UserCard';
