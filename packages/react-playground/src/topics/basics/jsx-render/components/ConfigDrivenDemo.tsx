/**
 * ============================================================================
 * ConfigDrivenDemo.tsx — 配置驱动渲染演示
 * ============================================================================
 *
 * 一份 widget 配置数组(模拟服务端下发)经 WIDGETS 注册表渲染成
 * 仪表盘卡片:新增类型 = 注册一行(开闭原则);配置里出现未知 type 时
 * 渲染 UnknownWidget 兜底,而不是让整页崩溃。
 *
 * @module topics/basics/jsx-render/components/ConfigDrivenDemo
 */

import { memo, useState } from 'react';
import type { ComponentType } from 'react';
import { Segmented } from 'antd';

/** 前端已注册的 widget 类型 */
type KnownType = 'stat' | 'chart' | 'todo';

/**
 * widget 配置(模拟服务端下发的 JSON)。
 * type 允许任意字符串 —— 服务端可能下发前端尚未注册的类型。
 */
interface WidgetConfig {
    id: string;
    type: KnownType | (string & {});
    title: string;
    /** stat:数值与单位 */
    value?: number;
    unit?: string;
    /** chart:柱状图数据点 */
    points?: number[];
    /** todo:待办条目 */
    items?: { text: string; done: boolean }[];
}

interface WidgetProps {
    config: WidgetConfig;
}

/** 卡片容器:所有 widget 共用 */
const CARD_CLASS =
    'rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-800/50';

const CARD_TITLE_CLASS = 'text-xs font-medium text-gray-400 dark:text-slate-500';

/** 统计数值卡片 */
const StatWidget = memo(({ config }: WidgetProps) => (
    <div className={CARD_CLASS}>
        <p className={CARD_TITLE_CLASS}>{config.title}</p>
        <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-slate-100">
            {config.value?.toLocaleString()}
            <span className="ml-1 text-xs font-normal text-gray-400">{config.unit}</span>
        </p>
    </div>
));

StatWidget.displayName = 'StatWidget';

/** 迷你柱状图卡片(纯 Tailwind 色块) */
const ChartWidget = memo(({ config }: WidgetProps) => {
    const points = config.points ?? [];
    const max = Math.max(...points, 1);
    return (
        <div className={CARD_CLASS}>
            <p className={CARD_TITLE_CLASS}>{config.title}</p>
            <div className="mt-2 flex h-20 items-end gap-1.5">
                {points.map((p, i) => (
                    <div
                        key={i}
                        title={`${p}`}
                        className="flex-1 rounded-t bg-primary-400/80 dark:bg-primary-500/70"
                        style={{ height: `${(p / max) * 100}%` }}
                    />
                ))}
            </div>
        </div>
    );
});

ChartWidget.displayName = 'ChartWidget';

/** 待办清单卡片 */
const TodoWidget = memo(({ config }: WidgetProps) => (
    <div className={CARD_CLASS}>
        <p className={CARD_TITLE_CLASS}>{config.title}</p>
        <ul className="mt-2 space-y-1.5">
            {(config.items ?? []).map((item) => (
                <li key={item.text} className="flex items-center gap-2 text-sm">
                    <span
                        className={
                            item.done
                                ? 'text-emerald-500'
                                : 'text-gray-300 dark:text-slate-600'
                        }
                    >
                        {item.done ? '✓' : '○'}
                    </span>
                    <span
                        className={
                            item.done
                                ? 'text-gray-400 line-through dark:text-slate-500'
                                : 'text-gray-700 dark:text-slate-300'
                        }
                    >
                        {item.text}
                    </span>
                </li>
            ))}
        </ul>
    </div>
));

TodoWidget.displayName = 'TodoWidget';

/** 未知类型兜底:占位提示而不是抛错拖垮整页 */
const UnknownWidget = memo(({ config }: WidgetProps) => (
    <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
        <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
            未知 widget 类型:{config.type}
        </p>
        <p className="mt-1 text-xs text-amber-500/80 dark:text-amber-500/70">
            前端尚未注册该类型,渲染占位兜底而不是崩溃
        </p>
    </div>
));

UnknownWidget.displayName = 'UnknownWidget';

/** 注册表:新增 widget 类型 = 在这里注册一行(开闭原则) */
const WIDGETS: Record<KnownType, ComponentType<WidgetProps>> = {
    stat: StatWidget,
    chart: ChartWidget,
    todo: TodoWidget,
};

/**
 * 渲染器:按配置的 type 查注册表,查不到就走兜底
 *
 * @param props.config - 单条 widget 配置
 * @returns 对应的 widget 卡片,未知类型返回 UnknownWidget
 */
const WidgetRenderer = memo(({ config }: WidgetProps) => {
    // 配置来自服务端,type 是任意字符串,必须在运行时查表兜底
    const Widget = (WIDGETS as Record<string, ComponentType<WidgetProps>>)[config.type];
    if (!Widget) {
        return <UnknownWidget config={config} />;
    }
    return <Widget config={config} />;
});

WidgetRenderer.displayName = 'WidgetRenderer';

/** 模拟两份服务端下发的仪表盘配置;B 里混了一个未注册的类型 */
const CONFIG_A: WidgetConfig[] = [
    { id: 'a1', type: 'stat', title: '今日订单', value: 1286, unit: '单' },
    { id: 'a2', type: 'chart', title: '近 7 日访问量', points: [12, 18, 9, 22, 17, 26, 30] },
    {
        id: 'a3',
        type: 'todo',
        title: '今日待办',
        items: [
            { text: '审核 3 篇投稿', done: true },
            { text: '回复置顶评论', done: false },
            { text: '发布周报', done: false },
        ],
    },
];

const CONFIG_B: WidgetConfig[] = [
    { id: 'b1', type: 'stat', title: '在线人数', value: 342, unit: '人' },
    // 服务端先行上线了 heatmap,前端还没注册 —— 必须兜底而不是白屏
    { id: 'b2', type: 'heatmap', title: '访问热力图' },
    {
        id: 'b3',
        type: 'todo',
        title: '发布清单',
        items: [
            { text: '更新文档', done: true },
            { text: '回归测试', done: true },
            { text: '灰度发布', done: false },
        ],
    },
];

export const ConfigDrivenDemo = memo(() => {
    const [configKey, setConfigKey] = useState<'A' | 'B'>('A');
    const config = configKey === 'A' ? CONFIG_A : CONFIG_B;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <Segmented
                    value={configKey}
                    onChange={(v) => setConfigKey(v as 'A' | 'B')}
                    options={[
                        { label: '配置 A(运营看板)', value: 'A' },
                        { label: '配置 B(发布看板,含未知类型)', value: 'B' },
                    ]}
                />
                <span className="text-xs text-gray-400 dark:text-slate-500">
                    配置模拟来自服务端,前端只负责渲染
                </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {config.map((c) => (
                    <WidgetRenderer key={c.id} config={c} />
                ))}
            </div>
        </div>
    );
});

ConfigDrivenDemo.displayName = 'ConfigDrivenDemo';
