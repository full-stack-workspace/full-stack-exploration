/**
 * ============================================================================
 * DrillingVsSlotDemo — 钻探 vs 组合
 * ============================================================================
 *
 * 同一份 accent 色:钻探模式要穿过 Shell / Panel 两层「根本不用它」的组件;
 * 组合模式把叶子作为 children 传入,中间层只排版。
 *
 * @module topics/advanced/component-comm/playground/components/DrillingVsSlotDemo
 */

import { memo, useState } from 'react';
import type { ReactNode } from 'react';
import { Switch } from 'antd';

type Accent = 'sky' | 'violet';

const ACCENT_CLASS: Record<Accent, string> = {
    sky: 'border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300',
    violet: 'border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-300',
};

const Leaf = memo(({ accent }: { accent: Accent }) => {
    return (
        <p className={`rounded-card border px-3 py-2 text-sm ${ACCENT_CLASS[accent]}`}>
            叶子读到 accent = {accent}
        </p>
    );
});

Leaf.displayName = 'Leaf';

const DrillingPanel = memo(({ accent }: { accent: Accent }) => {
    return (
        <div className="rounded-card border border-dashed border-red-200 p-3 dark:border-red-900">
            <p className="mb-2 text-[11px] text-red-500">Panel 声明了 accent,自己却不用</p>
            <Leaf accent={accent} />
        </div>
    );
});

DrillingPanel.displayName = 'DrillingPanel';

const DrillingShell = memo(({ accent }: { accent: Accent }) => {
    return (
        <div className="rounded-card border border-dashed border-red-200 p-3 dark:border-red-900">
            <p className="mb-2 text-[11px] text-red-500">Shell 也声明了 accent,自己也不用</p>
            <DrillingPanel accent={accent} />
        </div>
    );
});

DrillingShell.displayName = 'DrillingShell';

const SlotShell = memo(({ children }: { children: ReactNode }) => {
    return (
        <div className="rounded-card border border-dashed border-emerald-200 p-3 dark:border-emerald-900">
            <p className="mb-2 text-[11px] text-emerald-600">Shell 只排版,props 里没有 accent</p>
            {children}
        </div>
    );
});

SlotShell.displayName = 'SlotShell';

export const DrillingVsSlotDemo = memo(() => {
    const [compose, setCompose] = useState(true);
    const [accent, setAccent] = useState<Accent>('sky');

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                    <Switch
                        size="small"
                        aria-label="使用组合避开钻探"
                        checked={compose}
                        onChange={setCompose}
                    />
                    使用组合(关闭则钻探)
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                    <Switch
                        size="small"
                        aria-label="切换强调色"
                        checked={accent === 'violet'}
                        onChange={(checked) => setAccent(checked ? 'violet' : 'sky')}
                    />
                    强调色 {accent}
                </label>
            </div>
            {compose ? (
                <SlotShell>
                    <Leaf accent={accent} />
                </SlotShell>
            ) : (
                <DrillingShell accent={accent} />
            )}
        </div>
    );
});

DrillingVsSlotDemo.displayName = 'DrillingVsSlotDemo';
