/**
 * ============================================================================
 * ManualTransitionDemo.tsx — 手动 CSS 过渡对照(ViewTransition 的对照组)
 * ============================================================================
 *
 * ViewTransition 要解决的正是这个场景:状态切换(列表 ↔ 详情)时想要
 * 一段过渡动画。本 Demo 用「挂载即播」的手动 CSS keyframes 实现同样的
 * 淡入上移效果,并提供开关对照「无过渡」的生硬切换 —— 让读者先建立
 * 「想要的效果长什么样、手动写要付出什么」的直觉,再去看 ViewTransition
 * 的声明式写法(当前 react@19.2.4 stable 未导出,以代码示意呈现)。
 *
 * @module topics/advanced/view-transition-activity/components/ManualTransitionDemo
 */

import { memo, useState } from 'react';
import { Button, Segmented } from 'antd';

type PageKind = 'list' | 'detail';

const ITEMS = ['React 19.2 发布', 'Activity 进入稳定通道', 'ViewTransition 仍在实验通道'];

/**
 * 列表 ↔ 详情切换的手动过渡演示。
 *
 * 手动方案的要点:内容容器以 key 强制重新挂载,挂载瞬间套上
 * keyframes 动画类 —— 这是「没有 ViewTransition 时」最常见的写法,
 * 代价是动画与数据更新解耦(进出场不对称、列表重排管不了)。
 *
 * @returns 手动过渡对照 Demo
 *
 * @example
 * <ManualTransitionDemo />
 */
export const ManualTransitionDemo = memo(() => {
    const [page, setPage] = useState<PageKind>('list');
    const [animated, setAnimated] = useState(true);

    return (
        <div className="space-y-4">
            {/* 内联 keyframes:仅本 Demo 使用,前缀 vt-manual 避免撞名 */}
            <style>{`
                @keyframes vtManualEnter {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .vt-manual-enter { animation: vtManualEnter 240ms ease-out; }
            `}</style>

            <div className="flex items-center gap-3">
                <Segmented
                    value={animated ? 'on' : 'off'}
                    onChange={(v) => setAnimated(v === 'on')}
                    options={[
                        { label: '手动 CSS 过渡', value: 'on' },
                        { label: '无过渡', value: 'off' },
                    ]}
                />
                <span className="text-xs text-gray-400 dark:text-slate-500">
                    来回切换列表 / 详情,感受过渡的有无
                </span>
            </div>

            {/* key={page}:页面切换即重新挂载,挂载瞬间播放入场动画 */}
            <div
                key={page}
                className={`rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-800/50 ${
                    animated ? 'vt-manual-enter' : ''
                }`}
            >
                {page === 'list' ? (
                    <ul className="space-y-2">
                        {ITEMS.map((item) => (
                            <li
                                key={item}
                                className="flex items-center justify-between text-sm text-gray-600 dark:text-slate-300"
                            >
                                {item}
                                <Button size="small" type="link" onClick={() => setPage('detail')}>
                                    查看详情
                                </Button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-700 dark:text-slate-200">
                            详情:ViewTransition 仍在实验通道
                        </p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">
                            本页是手动 CSS keyframes 实现的过渡;声明式写法见下方代码示意。
                        </p>
                        <Button size="small" onClick={() => setPage('list')}>
                            返回列表
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
});

ManualTransitionDemo.displayName = 'ManualTransitionDemo';
