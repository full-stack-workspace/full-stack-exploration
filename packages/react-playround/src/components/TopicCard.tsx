/**
 * ============================================================================
 * TopicCard — 专题导航卡片
 * ============================================================================
 *
 * 首页分类分组中使用的专题入口卡片,整卡可点击(React Router Link)。
 * 视觉特征:分类色标识点、完成度徽标、hover 上浮与"开始练习"箭头引导,
 * 配色随所属分类的视觉主题变化。
 *
 * @module components/TopicCard
 */

import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightOutlined } from '@ant-design/icons';

import type { TopicMeta, TopicStatus } from '../config/topics';
import { getCategoryMeta } from '../config/topics';

/** 完成度徽标的文案与配色 */
const STATUS_STYLE: Record<TopicStatus, { label: string; className: string }> = {
    done: { label: '已完成', className: 'bg-emerald-50 text-emerald-600' },
    wip: { label: '进行中', className: 'bg-amber-50 text-amber-600' },
    planned: { label: '计划中', className: 'bg-gray-100 text-gray-400' },
};

interface TopicCardProps {
    topic: TopicMeta;
}

/**
 * @example
 * <TopicCard topic={TOPICS[0]} />
 */
export const TopicCard = memo(({ topic }: TopicCardProps) => {
    const status = STATUS_STYLE[topic.status ?? 'done'];
    const theme = getCategoryMeta(topic.category).theme;

    return (
        <Link
            to={topic.path}
            className={`group flex flex-col rounded-card border border-gray-100 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover ${theme.hoverBorder}`}
        >
            <div className="flex items-center gap-2">
                {/* 分类标识点 */}
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${theme.dot}`} />
                <h3 className="font-semibold text-gray-800">{topic.title}</h3>
                <span
                    className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-xs ${status.className}`}
                >
                    {status.label}
                </span>
            </div>

            <p className="mt-2.5 flex-1 text-sm leading-relaxed text-gray-500">
                {topic.description}
            </p>

            {/* 行动引导:hover 时箭头右移 */}
            <div className={`mt-4 flex items-center gap-1 text-xs font-medium ${theme.text}`}>
                开始练习
                <ArrowRightOutlined className="text-[10px] transition-transform duration-200 group-hover:translate-x-1" />
            </div>
        </Link>
    );
});

TopicCard.displayName = 'TopicCard';
