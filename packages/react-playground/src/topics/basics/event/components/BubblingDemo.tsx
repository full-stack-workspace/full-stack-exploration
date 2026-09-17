/**
 * ============================================================================
 * BubblingDemo.tsx — 冒泡、捕获与两个「阻止」
 * ============================================================================
 *
 * 三层嵌套区域演示 React 模拟的完整传播链:
 * onClickCapture 由外而内 → onClick 由内而外。
 * 开关控制内层是否 stopPropagation;另有链接演示 preventDefault 拦截跳转。
 *
 * @module topics/basics/event/components/BubblingDemo
 */

import { memo, useState } from 'react';
import type { MouseEvent } from 'react';
import { Switch } from 'antd';

import { EventLog, useEventLog } from './EventLog';

export const BubblingDemo = memo(() => {
    const { logs, append, clear } = useEventLog();
    // 内层是否在冒泡阶段阻断传播
    const [stopInner, setStopInner] = useState(false);

    const handleInnerClick = (e: MouseEvent<HTMLDivElement>) => {
        if (stopInner) {
            // 只阻断「继续冒泡」:外层/中层的 onClick 将收不到,但捕获阶段早已走完
            e.stopPropagation();
            append('内层 onClick:已 stopPropagation,中层/外层的冒泡监听被阻断');
        } else {
            append('内层 onClick(冒泡起点)');
        }
    };

    const handleLinkClick = (e: MouseEvent<HTMLAnchorElement>) => {
        // 阻止默认行为与阻止传播是两回事:这里只拦截跳转,不影响冒泡
        e.preventDefault();
        append('链接:已 preventDefault,跳转被拦截(冒泡不受影响)');
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <Switch checked={stopInner} onChange={setStopInner} />
                <span className="text-sm text-gray-600 dark:text-slate-300">
                    内层 onClick 调用 e.stopPropagation():{stopInner ? '开' : '关'}
                </span>
            </div>

            {/* 三层嵌套:点击最内层,观察日志中捕获(外→内)与冒泡(内→外)的顺序 */}
            <div
                className="cursor-pointer rounded-card border border-primary-200 bg-primary-50 p-4 dark:border-primary-700 dark:bg-slate-800/60"
                onClickCapture={() => append('外层 onClickCapture')}
                onClick={() => append('外层 onClick(冒泡到达)')}
            >
                <span className="text-xs text-primary-700 dark:text-primary-300">外层</span>
                <div
                    className="mt-2 rounded-card border border-primary-300 bg-primary-100 p-4 dark:border-primary-600 dark:bg-slate-800"
                    onClickCapture={() => append('中层 onClickCapture')}
                    onClick={() => append('中层 onClick(冒泡到达)')}
                >
                    <span className="text-xs text-primary-700 dark:text-primary-300">中层</span>
                    <div
                        className="mt-2 rounded-card border border-primary-400 bg-white p-4 dark:border-primary-500 dark:bg-slate-800"
                        onClickCapture={() => append('内层 onClickCapture')}
                        onClick={handleInnerClick}
                    >
                        <span className="text-xs font-semibold text-primary-700 dark:text-primary-300">
                            内层 —— 点击这里
                        </span>
                    </div>
                </div>
            </div>

            {/* preventDefault 演示:作为 demo 本体的外链拦截,允许使用 <a> */}
            <a
                href="https://react.dev"
                className="inline-block text-sm text-primary-600 underline dark:text-primary-400"
                onClick={handleLinkClick}
            >
                点我试试:preventDefault 拦截链接跳转(不会真的跳转)
            </a>

            <EventLog logs={logs} onClear={clear} />
        </div>
    );
});

BubblingDemo.displayName = 'BubblingDemo';
