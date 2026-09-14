/**
 * @file PostCard 组件
 *
 * @description 这是一个博客文章卡片组件
 */
import React, { memo } from 'react';

interface PostCardProps {
    title: string;
    description: string;
    link?: string;
    date: string;
    tags: string[];
}

/**
 * @example
 * <PostCard title="Getting Started with Rsbuild" excerpt="A comprehensive guide to building React applications with Rsbuild, featuring fast development and optimized production builds." date="2025-12-11" tags={['Rsbuild', 'React', 'Webpack']} />
 * @param {string} title - 文章标题
 * @param {string} excerpt - 文章摘要
 * @param {string} date - 文章日期
 * @param {string[]} tags - 文章标签
 * @returns {React.ReactNode} 返回一个博客文章卡片组件
 */
const PostCard: React.FC<PostCardProps> = memo(({ title, description, date, tags }) => {

    return (
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center text-sm text-gray-500 mb-4">
                <span>{date}</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-3 hover:text-blue-600 cursor-pointer">
                {title}
            </h2>
            <p className="text-gray-700 mb-4 line-clamp-3">{description}</p>
            <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                    <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 text-sm text-gray-600 rounded-full hover:bg-gray-200"
                    >
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    );
});

// 为使用 memo 的组件添加 displayName,方便在开发工具中调试
PostCard.displayName = 'PostCard';

export default PostCard;
