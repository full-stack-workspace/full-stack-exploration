/**
 * ============================================================================
 * TopicCard — 专题导航卡片
 * ============================================================================
 *
 * 首页分类分组中使用的专题入口卡片,整卡可点击(React Router Link)。
 * 视觉特征:分类色标识点、hover 上浮与"开始练习"箭头引导,
 * 配色随所属分类的视觉主题变化。
 *
 * 同名专题(如各分类末页的「理解检验」)自动在卡片标题前补分类名,
 * 判定依据是注册表中的重名统计,无需在注册表里加任何标记字段。
 *
 * @module components/TopicCard
 */

import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightOutlined } from '@ant-design/icons';

import type { TopicMeta } from '../config/topics';
import { getCategoryMeta, TOPICS } from '../config/topics';

// 重名标题统计:同一标题出现在多个分类时,卡片标题需要带分类前缀才能区分
const TITLE_COUNT = TOPICS.reduce<Map<string, number>>((acc, t) => {
    acc.set(t.title, (acc.get(t.title) ?? 0) + 1);
    return acc;
}, new Map());

interface TopicCardProps {
    topic: TopicMeta;
}

const CARD_CLASS =
    'group flex flex-col rounded-card border border-gray-100 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900';

/**
 * @example
 * <TopicCard topic={TOPICS[0]} />
 */
export const TopicCard = memo(({ topic }: TopicCardProps) => {
    const category = getCategoryMeta(topic.category);
    const theme = category.theme;
    // 重名专题(理解检验)显示为「分类 · 标题」,其余保持原标题
    const title =
        (TITLE_COUNT.get(topic.title) ?? 0) > 1
            ? `${category.title} · ${topic.title}`
            : topic.title;

    return (
        <Link to={topic.path} className={`${CARD_CLASS} ${theme.hoverBorder}`}>
            <div className="flex items-center gap-2">
                {/* 分类标识点 */}
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${theme.dot}`} />
                <h3 className="font-semibold text-gray-800 dark:text-slate-100">{title}</h3>
            </div>

            <p className="mt-2.5 flex-1 text-sm leading-relaxed text-gray-500 dark:text-slate-400">
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
