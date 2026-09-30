/**
 * ============================================================================
 * TransitionTypePlayground.tsx — 按交互类型播不同动画(addTransitionType 对照组)
 * ============================================================================
 *
 * addTransitionType 的动机:同一组页面切换,「前进」应该右滑进场,
 * 「后退」应该左滑回退,「展开 / 收起」又该用缩放 —— 动画该跟着
 * 「交互语义」走,而不是跟着「目标状态」走。本 Demo 用手动方式
 * (action 状态 → 对应 keyframes 类)实现这个效果,让读者先看清
 * 要解决的问题;声明式的 addTransitionType 写法以代码示意呈现
 * (react@19.2.4 stable 未导出)。
 *
 * @module topics/advanced/view-transition-activity/components/TransitionTypePlayground
 */

import { memo, useState } from 'react';
import { Button } from 'antd';

/** 交互类型:决定播放哪一种动画 */
type ActionType = 'forward' | 'back' | 'expand' | 'collapse';

/** 每种交互类型对应的动画类(见下方内联 keyframes) */
const ACTION_CLASS: Record<ActionType, string> = {
    forward: 'vt-type-forward',
    back: 'vt-type-back',
    expand: 'vt-type-expand',
    collapse: 'vt-type-collapse',
};

const MAX_PAGE = 3;

/**
 * 四种交互 → 四种动画的手动实现。
 *
 * 手动方案的痛点:动画类型要自己用 state 记录、内容要靠 key+seq
 * 强制重挂载来重播动画 —— addTransitionType 把「这是什么交互」
 * 直接挂到 transition 上,由 ViewTransition / CSS 侧按类型定制动画。
 *
 * @returns 交互类型动画演练 Demo
 *
 * @example
 * <TransitionTypePlayground />
 */
export const TransitionTypePlayground = memo(() => {
    const [pageIndex, setPageIndex] = useState(0);
    const [expanded, setExpanded] = useState(false);
    // seq 让同一类交互连续触发时动画也能重播(key 变化 → 重新挂载)
    const [action, setAction] = useState<{ type: ActionType; seq: number }>({
        type: 'forward',
        seq: 0,
    });

    const dispatch = (type: ActionType, apply: () => void) => {
        apply();
        setAction((a) => ({ type, seq: a.seq + 1 }));
    };

    return (
        <div className="space-y-4">
            <style>{`
                @keyframes vtForward { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: none; } }
                @keyframes vtBack { from { opacity: 0; transform: translateX(-24px); } to { opacity: 1; transform: none; } }
                @keyframes vtExpand { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: none; } }
                @keyframes vtCollapse { from { opacity: 0; transform: scale(1.08); } to { opacity: 1; transform: none; } }
                .vt-type-forward { animation: vtForward 260ms ease-out; }
                .vt-type-back { animation: vtBack 260ms ease-out; }
                .vt-type-expand { animation: vtExpand 260ms ease-out; }
                .vt-type-collapse { animation: vtCollapse 260ms ease-out; }
            `}</style>

            <div className="flex flex-wrap items-center gap-2">
                <Button
                    size="small"
                    disabled={pageIndex >= MAX_PAGE}
                    onClick={() => dispatch('forward', () => setPageIndex((i) => i + 1))}
                >
                    前进 →
                </Button>
                <Button
                    size="small"
                    disabled={pageIndex <= 0}
                    onClick={() => dispatch('back', () => setPageIndex((i) => i - 1))}
                >
                    ← 后退
                </Button>
                <Button
                    size="small"
                    disabled={expanded}
                    onClick={() => dispatch('expand', () => setExpanded(true))}
                >
                    展开详情
                </Button>
                <Button
                    size="small"
                    disabled={!expanded}
                    onClick={() => dispatch('collapse', () => setExpanded(false))}
                >
                    收起详情
                </Button>
                <span className="text-xs text-gray-400 dark:text-slate-500">
                    同一内容区,四种交互播四种动画
                </span>
            </div>

            <div
                key={action.seq}
                className={`rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-800/50 ${ACTION_CLASS[action.type]}`}
            >
                <p className="text-sm font-semibold text-gray-700 dark:text-slate-200">
                    第 {pageIndex + 1} / {MAX_PAGE + 1} 页
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                    最近一次交互:{action.type} —— 动画类型由交互语义决定,而非目标状态
                </p>
                {expanded && (
                    <p className="mt-2 rounded bg-white p-2 text-xs text-gray-500 dark:bg-slate-900 dark:text-slate-400">
                        展开的详情区:手动方案里「展开 / 收起」只是又一对自己维护的
                        state + 动画类;addTransitionType 把这个语义标到 transition 上。
                    </p>
                )}
            </div>
        </div>
    );
});

TransitionTypePlayground.displayName = 'TransitionTypePlayground';
