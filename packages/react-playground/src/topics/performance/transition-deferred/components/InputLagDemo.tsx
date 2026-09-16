/**
 * ============================================================================
 * InputLagDemo.tsx — 场景一:输入阻塞
 * ============================================================================
 *
 * 受控输入 + 5000 项 SlowList 过滤,对照三种模式:
 * - 同步:每次击键都触发昂贵重渲染,输入卡顿(FrameMeter 飙红);
 * - useDeferredValue:输入即时回显,列表滞后,StaleBadge 提示;
 * - useTransition:同一语义的另一写法,isPending 驱动列表降透明度。
 *
 * 首屏策略:deferred/transition 只调度「更新」,管不到首挂载 —— 5000 项慢渲染
 * 若随页面进入同步执行,进入本身就会卡顿。因此列表在挂载后经 startTransition
 * 以低优先级延后挂载(先骨架后列表),这也是本专题自己的工程实践示例。
 *
 * 套件标注:本场景使用 deferred / transition 二件套(无资源等待,不需要 Suspense)。
 *
 * @module topics/performance/transition-deferred/components/InputLagDemo
 */

import { memo, startTransition as startLowPriorityUpdate, useDeferredValue, useEffect, useState, useTransition } from 'react';
import { Input, Segmented, Slider, Tag } from 'antd';

import { FrameMeter } from '../../lab/FrameMeter';
import { SlowList } from '../../lab/SlowList';
import { useFrameStats } from '../../lab/useFrameStats';

/** 渲染模式:同步 / useDeferredValue / useTransition */
type LagMode = 'sync' | 'deferred' | 'transition';

const MODE_OPTIONS = [
    { label: '同步渲染', value: 'sync' },
    { label: 'useDeferredValue', value: 'deferred' },
    { label: 'useTransition', value: 'transition' },
] as const;

/** 观测快照:每次渲染时输入值与列表实际渲染值 */
export interface RenderSnapshot {
    keyword: string;
    listKeyword: string;
}

interface InputLagDemoProps {
    /** 慢渲染强度(每条目毫秒),测试传 0 */
    perItemCost?: number;
    itemCount?: number;
    /** 观测钩子:每次渲染上报快照(测试断言「滞后」中间态用) */
    onRenderSnapshot?: (snapshot: RenderSnapshot) => void;
}

/**
 * @example
 * <InputLagDemo />
 */
export const InputLagDemo = memo(
    ({ perItemCost: initialCost = 0.2, itemCount = 5000, onRenderSnapshot }: InputLagDemoProps) => {
        const [mode, setMode] = useState<LagMode>('deferred');
        const [keyword, setKeyword] = useState('');
        // transition 模式的非紧急列表值:紧急的输入回显与可延后的列表更新分离
        const [listKeyword, setListKeyword] = useState('');
        const [cost, setCost] = useState(initialCost);
        // 昂贵列表是否已挂载:首屏先交付输入区与控件,列表以低优先级延后挂载
        const [listMounted, setListMounted] = useState(false);

        const deferredKeyword = useDeferredValue(keyword);
        const [isPending, startTransition] = useTransition();
        const { frames, inputLag, markInput } = useFrameStats();

        // 首挂载的 5000 项慢渲染若同步执行,会阻塞「进入页面」本身(deferred/transition
        // 只调度更新,管不到首挂载);包一层 transition 让这次昂贵渲染可中断,
        // 输入区与 FrameMeter 先行可交互,列表就绪后一次性替换骨架。
        useEffect(() => {
            startLowPriorityUpdate(() => setListMounted(true));
        }, []);

        // 三种模式共用一份「列表实际渲染值」,便于对照
        const shownKeyword =
            mode === 'deferred' ? deferredKeyword : mode === 'transition' ? listKeyword : keyword;

        // 观测上报(测试用):渲染期间直接调用,记录每一次提交的输入/列表值对
        onRenderSnapshot?.({ keyword, listKeyword: shownKeyword });

        const handleChange = (value: string) => {
            markInput();
            setKeyword(value);
            if (mode === 'transition') {
                // 列表更新标为非紧急:输入回显(紧急)不被昂贵渲染拖住
                startTransition(() => setListKeyword(value));
            }
        };

        // deferred 模式的滞后反馈:值滞后 ≠ 错误,是刻意的调度结果
        const isStale = mode === 'deferred' && deferredKeyword !== keyword;

        return (
            <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                    <Segmented
                        options={MODE_OPTIONS as unknown as { label: string; value: LagMode }[]}
                        value={mode}
                        onChange={(v) => setMode(v as LagMode)}
                    />
                    <span className="flex items-center gap-2 text-xs text-gray-400 dark:text-slate-500">
                        慢渲染强度
                        <Slider
                            className="w-32"
                            min={0}
                            max={1}
                            step={0.1}
                            value={cost}
                            onChange={(v) => setCost(v)}
                            tooltip={{ formatter: (v) => `${v}ms/条` }}
                        />
                    </span>
                </div>

                <FrameMeter frames={frames} inputLag={inputLag} />

                <div className="space-y-2">
                    <Input
                        placeholder="输入过滤关键字(试试同步模式下快速输入)"
                        value={keyword}
                        onChange={(e) => handleChange(e.target.value)}
                        className="max-w-sm"
                    />
                    <div className="flex items-center gap-2 text-xs">
                        {isStale && <Tag color="warning">结果滞后中(deferred 值追上了会消失)</Tag>}
                        {mode === 'transition' && isPending && (
                            <Tag color="processing">列表更新调度中(isPending)</Tag>
                        )}
                        <span className="text-gray-400 dark:text-slate-500">
                            列表渲染值:「{shownKeyword}」
                        </span>
                    </div>
                    <div
                        className={
                            mode === 'transition' && isPending
                                ? 'opacity-50 transition-opacity'
                                : 'transition-opacity'
                        }
                    >
                        {listMounted ? (
                            <SlowList keyword={shownKeyword} itemCount={itemCount} perItemCost={cost} />
                        ) : (
                            // 骨架占位:列表低优先级挂载期间首屏保持可交互
                            <div className="flex h-48 animate-pulse items-center justify-center rounded-lg border border-dashed border-gray-200 text-xs text-gray-400 dark:border-slate-700 dark:text-slate-500">
                                昂贵列表以低优先级挂载中(首屏不阻塞输入)…
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    },
);

InputLagDemo.displayName = 'InputLagDemo';
