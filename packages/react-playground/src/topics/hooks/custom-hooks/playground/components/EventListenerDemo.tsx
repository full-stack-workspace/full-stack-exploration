/**
 * ============================================================================
 * EventListenerDemo.tsx — useEventListener 演示
 * ============================================================================
 *
 * 实时显示窗口尺寸与最近按键。生产要点:handler 走 ref,
 * effect 只依赖 target/type —— 每次渲染都传新的内联 handler,
 * 也不会反复 addEventListener / removeEventListener。
 *
 * @module topics/hooks/custom-hooks/playground/components/EventListenerDemo
 */

import { memo, useState } from 'react';
import { Tag } from 'antd';

import { useEventListener } from '../../lib';

export const EventListenerDemo = memo(() => {
    const [size, setSize] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }));
    const [lastKey, setLastKey] = useState<string>('—');

    // 两个监听的 handler 都是内联新函数,但不会引发重复挂/退监听
    useEventListener(window, 'resize', () => {
        setSize({ width: window.innerWidth, height: window.innerHeight });
    });
    useEventListener(window, 'keydown', (event) => {
        setLastKey((event as KeyboardEvent).key);
    });

    return (
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
            <Tag color="violet">
                窗口 {size.width} × {size.height}
            </Tag>
            <Tag color="default">最近按键:{lastKey}</Tag>
            <span className="text-xs text-gray-400 dark:text-slate-500">
                拖动窗口尺寸 / 在页面任意处按键试试
            </span>
        </div>
    );
});

EventListenerDemo.displayName = 'EventListenerDemo';
