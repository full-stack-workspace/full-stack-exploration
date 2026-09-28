/**
 * ============================================================================
 * RegionBoard — 按区域分配生成策略
 * ============================================================================
 *
 * 架构产出是:每个重要区域从哪来、何时可用、由谁更新、会消耗什么。
 * 改策略后立刻显示「谁挡住了谁」和「首屏带了什么客户端成本」。
 *
 * @module topics/performance/governance/architecture/components/RegionBoard
 */

import { memo, useMemo, useState } from 'react';
import { Select, Switch } from 'antd';

type Strategy = 'ssg' | 'ssr' | 'csr' | 'suspense' | 'lazy';

interface Region {
    id: string;
    name: string;
    hint: string;
    defaultStrategy: Strategy;
}

const REGIONS: Region[] = [
    { id: 'search', name: '搜索框', hint: '完成主任务的入口,必须立刻可操作', defaultStrategy: 'ssr' },
    { id: 'hero', name: '商品主体', hint: '首屏主要内容,LCP 候选', defaultStrategy: 'ssr' },
    { id: 'recs', name: '个性化推荐', hint: '请求时才知道,且不是主任务必需', defaultStrategy: 'suspense' },
    { id: 'editor', name: '富文本/图表', hint: '重客户端依赖,不该进首屏包', defaultStrategy: 'lazy' },
    { id: 'comments', name: '屏外评论', hint: '低概率立即使用', defaultStrategy: 'lazy' },
];

const OPTIONS = [
    { value: 'ssg', label: '预生成 / 缓存复用' },
    { value: 'ssr', label: '请求时服务端生成' },
    { value: 'csr', label: '客户端渲染' },
    { value: 'suspense', label: '独立 Suspense / 流式' },
    { value: 'lazy', label: '延迟加载' },
];

export const RegionBoard = memo(() => {
    const [strategy, setStrategy] = useState<Record<string, Strategy>>(() =>
        Object.fromEntries(REGIONS.map((r) => [r.id, r.defaultStrategy])),
    );
    const [recsBlockHero, setRecsBlockHero] = useState(false);
    const [editorOnHero, setEditorOnHero] = useState(false);

    const findings = useMemo(() => {
        const notes: string[] = [];
        if (recsBlockHero) {
            notes.push('推荐与主体共同等待:个性化接口变慢会直接拖住 LCP。除非强一致,否则拆开。');
        }
        if (editorOnHero || strategy.editor === 'csr') {
            notes.push('编辑器进首屏:HTML 提前返回也不够,hydration 仍要下载重包。');
        }
        if (strategy.hero === 'csr') {
            notes.push('商品主体走纯 CSR:LCP 绑在 JS 执行上,内容型页面通常不该这样。');
        }
        if (strategy.recs === 'ssr' && !recsBlockHero) {
            notes.push('推荐在服务端生成但未独立边界:仍可能和主体抢同一响应。考虑流式拆块。');
        }
        if (strategy.search === 'lazy') {
            notes.push('搜索框延迟加载:主任务入口会晚于装饰内容,违反「关键路径只承载必需工作」。');
        }
        if (notes.length === 0) {
            notes.push('当前划分没有明显互挡。还要补一问:缓存未命中、后端变慢时页面是否仍可接受。');
        }
        return notes;
    }, [editorOnHero, recsBlockHero, strategy]);

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                {REGIONS.map((region) => (
                    <div
                        key={region.id}
                        className="flex flex-col gap-2 rounded-lg border border-gray-100 bg-gray-50 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-950"
                    >
                        <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-slate-100">
                                {region.name}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-slate-500">{region.hint}</p>
                        </div>
                        <Select
                            aria-label={`${region.name}生成策略`}
                            className="min-w-48"
                            value={strategy[region.id]}
                            options={OPTIONS}
                            onChange={(value) =>
                                setStrategy((curr) => ({ ...curr, [region.id]: value }))
                            }
                        />
                    </div>
                ))}
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                <Switch
                    size="small"
                    checked={recsBlockHero}
                    onChange={setRecsBlockHero}
                    aria-label="推荐阻塞商品主体"
                />
                让推荐和商品主体一起等待
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                <Switch
                    size="small"
                    checked={editorOnHero}
                    onChange={setEditorOnHero}
                    aria-label="编辑器打进首屏包"
                />
                把富文本编辑器打进首屏 JS
            </label>
            <ul className="list-disc space-y-1 pl-5 text-xs leading-relaxed text-amber-900 dark:text-amber-100">
                {findings.map((note) => (
                    <li key={note}>{note}</li>
                ))}
            </ul>
        </div>
    );
});

RegionBoard.displayName = 'RegionBoard';
