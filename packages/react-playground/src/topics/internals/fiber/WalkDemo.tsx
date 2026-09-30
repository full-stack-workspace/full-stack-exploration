/**
 * ============================================================================
 * WalkDemo — 用 child / sibling / return 走一棵小 Fiber 树
 * ============================================================================
 *
 * 预计算与 performUnitOfWork 相同的深度优先顺序,让读者逐步看到
 * 「向下走 child、向右走 sibling、向上走 return」,以及 begin / complete 成对出现。
 * 这是教学模型,不是源码单步调试器。
 *
 * @module topics/internals/fiber/WalkDemo
 */

import { memo, useState } from 'react';
import { Button } from 'antd';

interface WalkStep {
    id: string;
    phase: 'begin' | 'complete';
    via: string;
}

const STEPS: WalkStep[] = [
    { id: 'app', phase: 'begin', via: '从根进入' },
    { id: 'header', phase: 'begin', via: '沿 child 向下' },
    { id: 'title', phase: 'begin', via: '沿 child 向下' },
    { id: 'title', phase: 'complete', via: '没有 child,在本节点 complete' },
    { id: 'header', phase: 'complete', via: 'Title 没有 sibling,沿 return 回到 Header' },
    { id: 'list', phase: 'begin', via: 'Header 的 sibling 是 List' },
    { id: 'a', phase: 'begin', via: '沿 child 向下' },
    { id: 'a', phase: 'complete', via: '没有 child,在本节点 complete' },
    { id: 'b', phase: 'begin', via: 'Item A 的 sibling 是 Item B' },
    { id: 'b', phase: 'complete', via: '没有 child,在本节点 complete' },
    { id: 'list', phase: 'complete', via: '没有更多 sibling,沿 return 回到 List' },
    { id: 'app', phase: 'complete', via: '沿 return 回到根,整棵树完成' },
];

const LABEL: Record<string, string> = {
    app: 'App',
    header: 'Header',
    title: 'Title',
    list: 'List',
    a: 'Item A',
    b: 'Item B',
};

export const WalkDemo = memo(() => {
    const [index, setIndex] = useState(0);
    const step = STEPS[index];
    const done = index === STEPS.length - 1;

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                <Button onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
                    上一步
                </Button>
                <Button type="primary" onClick={() => setIndex((i) => Math.min(STEPS.length - 1, i + 1))} disabled={done}>
                    下一步
                </Button>
                <Button onClick={() => setIndex(0)}>重置</Button>
                <span className="self-center text-xs text-gray-400 dark:text-slate-500">
                    {index + 1} / {STEPS.length}
                </span>
            </div>

            <div className="grid gap-4 md:grid-cols-[220px_1fr]">
                <ul className="space-y-1 font-mono text-xs" aria-label="Fiber 树">
                    <TreeRow id="app" depth={0} current={step.id} />
                    <TreeRow id="header" depth={1} current={step.id} />
                    <TreeRow id="title" depth={2} current={step.id} />
                    <TreeRow id="list" depth={1} current={step.id} />
                    <TreeRow id="a" depth={2} current={step.id} />
                    <TreeRow id="b" depth={2} current={step.id} />
                </ul>
                <div className="rounded-lg border border-cyan-100 bg-cyan-50/60 p-3 text-sm text-cyan-950 dark:border-cyan-900 dark:bg-cyan-950/40 dark:text-cyan-50">
                    <p className="font-medium">
                        {LABEL[step.id]} · {step.phase === 'begin' ? 'beginWork' : 'completeWork'}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-cyan-800 dark:text-cyan-200">{step.via}</p>
                    <p className="mt-2 text-xs leading-relaxed text-cyan-800 dark:text-cyan-200">
                        {step.phase === 'begin'
                            ? '向下:执行组件或比对子元素,决定下一个 child。'
                            : '向上:Host 组件在这里创建或复用 DOM,并冒泡副作用标记。'}
                    </p>
                </div>
            </div>
        </div>
    );
});

WalkDemo.displayName = 'WalkDemo';

const TreeRow = ({ id, depth, current }: { id: string; depth: number; current: string }) => {
    const active = id === current;
    return (
        <li
            className={
                active
                    ? 'rounded bg-cyan-600 px-2 py-1 text-white'
                    : 'rounded px-2 py-1 text-gray-500 dark:text-slate-400'
            }
            style={{ marginLeft: depth * 16 }}
        >
            {LABEL[id]}
        </li>
    );
};
