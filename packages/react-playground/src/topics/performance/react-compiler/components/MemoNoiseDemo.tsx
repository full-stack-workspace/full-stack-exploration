/**
 * ============================================================================
 * MemoNoiseDemo.tsx — 手写 memo 的三种形态对照实验
 * ============================================================================
 *
 * 同一个「价格面板」子组件,三种接入方式,父子双方各挂一枚渲染计数徽标:
 * - 不做记忆化:父组件任何渲染都拖它重跑;
 * - 正确手写 memo + 稳定 props:无关 state 变化时面板跳过渲染
 *   (Compiler 的编译产物等价于这一形态,见专题页第一节);
 * - 写错的 memo:包了 memo 却传内联对象/内联函数,浅比较永远失败,
 *   优化零收益还白付一次比较。
 *
 * 切换形态会用 key={mode} 强制重建子树(memo ↔ broken 组件类型相同,
 * 不加 key 会原地更新、计数不清零),每种形态的计数都从 1 重新开始。
 *
 * @module topics/performance/react-compiler/components/MemoNoiseDemo
 */

import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { Button, Segmented } from 'antd';

/** 记忆化形态:不 memo / 正确手写 / 写错(内联 props 击穿浅比较) */
type MemoMode = 'none' | 'memo' | 'broken';

const MODE_OPTIONS = [
    { label: '不做记忆化', value: 'none' },
    { label: '正确手写 memo', value: 'memo' },
    { label: '写错的 memo', value: 'broken' },
] as const;

/** 各形态的一句话结论,跟随 Segmented 切换 */
const MODE_HINT: Record<MemoMode, string> = {
    none: '没有任何缓存声明:父组件每渲染一次,面板无条件跟着渲染一次 —— Compiler 要替你消掉的正是这种浪费。',
    memo: 'memo + 稳定 props:点「改无关状态」父组件照跑、面板原地不动。这正是 Compiler 编译产物的默认行为 —— 开了它,这一列的手写声明就成了需要维护的噪音。',
    broken: '包了 memo 却传内联对象 / 内联函数:浅比较永远失败,面板照样渲染,还白付一次比较 —— 手写记忆化最常见的自我感动。Compiler 的编译产物不存在这种形态。',
};

interface PricePanelProps {
    unitPrice: number;
    quantity: number;
    options: { showTax: boolean };
    onReset: () => void;
}

/** 未包 memo 的原始面板:父组件一渲染它就跟着渲染 */
const PricePanelCore = ({ unitPrice, quantity, options, onReset }: PricePanelProps) => {
    // 渲染计数探针:组件函数每执行一次 +1。仅作教学观测,生产代码不要在渲染期写 ref
    const renderCount = useRef(0);
    renderCount.current += 1;

    const total = unitPrice * quantity * (options.showTax ? 1.13 : 1);

    return (
        <div className="space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <span
                    data-testid="child-renders"
                    className="rounded-full bg-amber-100 px-2 py-0.5 font-mono text-[11px] text-amber-800 dark:bg-amber-900/60 dark:text-amber-200"
                >
                    面板渲染 {renderCount.current} 次
                </span>
                <Button size="small" onClick={onReset}>
                    数量归零
                </Button>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-300">
                单价 ¥{unitPrice} × {quantity} 件{options.showTax ? '(含税)' : ''} → 合计 ¥
                {total.toFixed(2)}
            </p>
        </div>
    );
};

/** 同一份面板的 memo 版本:能不能跳过,取决于父组件给的 props 身份是否稳定 */
const PricePanelMemo = memo(PricePanelCore);
PricePanelMemo.displayName = 'PricePanelMemo';

/**
 * @example
 * <MemoNoiseDemo />
 */
export const MemoNoiseDemo = memo(() => {
    const [mode, setMode] = useState<MemoMode>('memo');
    // 与面板无关的状态:只用来制造「父组件渲染了,但面板没必要渲染」的场景
    const [tick, setTick] = useState(0);
    const [quantity, setQuantity] = useState(2);

    // 父组件自己的渲染计数探针(教学观测用)
    const parentRenders = useRef(0);
    parentRenders.current += 1;

    const unitPrice = 199;

    // 「正确手写」形态的稳定身份来源:对象进 useMemo,回调进 useCallback
    const stableOptions = useMemo(() => ({ showTax: true }), []);
    const handleReset = useCallback(() => setQuantity(0), []);

    // 三种形态共享同一份面板,唯一变量是「子组件 props 的身份是否稳定」;
    // 形态切换 = 元素类型切换,React 会卸载旧子树挂新子树,计数随之清零
    const panel =
        mode === 'none' ? (
            <PricePanelCore
                unitPrice={unitPrice}
                quantity={quantity}
                options={{ showTax: true }}
                onReset={() => setQuantity(0)}
            />
        ) : mode === 'broken' ? (
            // ❌ 包了 memo,但 options / onReset 每轮渲染都是新引用,浅比较永远失败
            <PricePanelMemo
                unitPrice={unitPrice}
                quantity={quantity}
                options={{ showTax: true }}
                onReset={() => setQuantity(0)}
            />
        ) : (
            // ✅ memo + 稳定 props:无关渲染被浅比较挡在门外
            <PricePanelMemo
                unitPrice={unitPrice}
                quantity={quantity}
                options={stableOptions}
                onReset={handleReset}
            />
        );

    return (
        <div className="space-y-4">
            <Segmented
                options={MODE_OPTIONS as unknown as { label: string; value: MemoMode }[]}
                value={mode}
                onChange={(v) => setMode(v as MemoMode)}
            />

            <div className="flex flex-wrap items-center gap-3 text-xs">
                <Button size="small" onClick={() => setTick((t) => t + 1)}>
                    改无关状态(tick)
                </Button>
                <Button size="small" onClick={() => setQuantity((q) => q + 1)}>
                    数量 +1(真依赖变化)
                </Button>
                <span
                    data-testid="parent-renders"
                    className="rounded-full bg-gray-100 px-2 py-0.5 font-mono text-[11px] text-gray-600 dark:bg-slate-800 dark:text-slate-300"
                >
                    父组件渲染 {parentRenders.current} 次
                </span>
                <span className="text-gray-400 dark:text-slate-500">tick = {tick}(对面板毫无意义)</span>
            </div>

            {/* key={mode}:形态切换时强制重建子树(memo ↔ broken 同为 PricePanelMemo,
                不指定 key 会原地更新、计数不清零),保证每种形态的计数都从 1 开始 */}
            <div key={mode}>{panel}</div>

            <p className="text-xs leading-relaxed text-gray-500 dark:text-slate-400">
                {MODE_HINT[mode]}
            </p>
        </div>
    );
});

MemoNoiseDemo.displayName = 'MemoNoiseDemo';
