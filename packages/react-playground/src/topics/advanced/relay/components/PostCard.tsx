/**
 * ============================================================================
 * PostCard.tsx — fragment colocation 演示:文章卡片
 * ============================================================================
 *
 * 与 UserCard 同范式:fragment 与组件同文件共存,声明 title/content/author/createdAt。
 * 注意 fragment 里只声明 author { name } —— 卡片用不到 author.email,
 * Relay 就不会把它放进这张卡片的数据边界,也不会出现在生成的类型里。
 *
 * @module topics/advanced/relay/components/PostCard
 */

import { memo } from 'react';
import { graphql, useFragment } from 'react-relay';
import type { PostCard_post$key } from '../../../../__generated__/PostCard_post.graphql';

interface PostCardProps {
    /** fragment 引用(由父查询展开 ...PostCard_post 获得) */
    post: PostCard_post$key;
}

/**
 * @param props.post - Post fragment 的引用
 * @returns 文章卡片(标题 + 摘要 + 作者与时间)
 */
export const PostCard = memo(({ post: postKey }: PostCardProps) => {
    const post = useFragment(
        graphql`
            fragment PostCard_post on Post {
                id
                title
                content
                createdAt
                author {
                    name
                }
            }
        `,
        postKey,
    );

    return (
        <li className="border-b border-gray-100 pb-4 last:border-0 last:pb-0 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-200">{post.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-slate-400">
                {post.content}
            </p>
            <div className="mt-2 text-[11px] text-gray-400 dark:text-slate-500">
                作者:{post.author.name} · {new Date(post.createdAt).toLocaleString()}
            </div>
        </li>
    );
});

PostCard.displayName = 'PostCard';
