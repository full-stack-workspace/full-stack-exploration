/**
 * ============================================================================
 * MediaQueryDemo.tsx — useMediaQuery 演示
 * ============================================================================
 *
 * 媒体查询徽标:视口宽度与系统暗色偏好,resize / 切系统主题时实时
 * 翻转。生产要点:matchMedia 是「React 之外的可变数据源」,
 * 用 useSyncExternalStore 订阅是标准姿势(回扣 Agent 专题)。
 *
 * @module topics/hooks/custom-hooks/playground/components/MediaQueryDemo
 */

import { memo } from 'react';
import { Tag } from 'antd';

import { useMediaQuery } from '../../lib';

export const MediaQueryDemo = memo(() => {
    const isDesktop = useMediaQuery('(min-width: 768px)');
    const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');

    return (
        <div className="flex flex-wrap items-center gap-2">
            <Tag color={isDesktop ? 'success' : 'default'}>
                min-width: 768px → {isDesktop ? '桌面宽度' : '窄屏'}
            </Tag>
            <Tag color={prefersDark ? 'violet' : 'default'}>
                prefers-color-scheme → {prefersDark ? '暗色偏好' : '浅色偏好'}
            </Tag>
            <span className="text-xs text-gray-400 dark:text-slate-500">
                拖动窗口跨越 768px / 切换系统深浅色,徽标实时翻转
            </span>
        </div>
    );
});

MediaQueryDemo.displayName = 'MediaQueryDemo';
