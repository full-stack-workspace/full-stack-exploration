/**
 * ============================================================================
 * ConditionalDemo.tsx — 条件渲染四范式演示
 * ============================================================================
 *
 * 并排演示四种条件渲染写法:
 * - && 短路(含 count = 0 时渲染出「0」的经典坑对照)
 * - 三元表达式(登录 / 未登录二选一)
 * - 提前 return(小组件内的前置分支)
 * - 变量承载(if/else 先算好元素再插入)
 *
 * @module topics/basics/jsx-render/components/ConditionalDemo
 */

import { memo, useState } from 'react';
import { Button, Segmented, Switch, Tag } from 'antd';

/** 演示卡片统一的容器样式 */
const CARD_CLASS =
    'space-y-3 rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-800/50';

const CARD_TITLE_CLASS = 'text-sm font-medium text-gray-700 dark:text-slate-200';

interface DetailPanelProps {
    /** 是否展示详情;false 时组件提前 return null */
    visible: boolean;
}

/**
 * 提前 return 范式:把前置分支挡在组件顶部,主体 JSX 保持干净
 *
 * @param props.visible - 是否展示详情
 * @returns 可见时返回详情面板,否则返回 null(不渲染任何 DOM)
 */
const DetailPanel = memo(({ visible }: DetailPanelProps) => {
    // 前置分支集中在这里处理,下面的主体渲染不再关心 visible
    if (!visible) {
        return null;
    }
    return (
        <p className="rounded-card bg-primary-50 p-3 text-sm text-primary-700 dark:bg-primary-950/50 dark:text-primary-300">
            详情面板:只有 visible 为 true 时,这段 DOM 才存在。
        </p>
    );
});

DetailPanel.displayName = 'DetailPanel';

type WorkStatus = 'todo' | 'doing' | 'done';

export const ConditionalDemo = memo(() => {
    const [count, setCount] = useState(1);
    const [loggedIn, setLoggedIn] = useState(true);
    const [visible, setVisible] = useState(true);
    const [status, setStatus] = useState<WorkStatus>('doing');

    // 变量承载范式:分支逻辑在 JSX 之外用 if/else 算好,JSX 里只插入一个变量
    let statusBadge;
    if (status === 'todo') {
        statusBadge = <Tag>待处理</Tag>;
    } else if (status === 'doing') {
        statusBadge = <Tag color="processing">进行中</Tag>;
    } else {
        statusBadge = <Tag color="success">已完成</Tag>;
    }

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {/* 范式一:&& 短路 —— 左侧必须是布尔,否则 0 会被渲染出来 */}
            <div className={CARD_CLASS}>
                <h3 className={CARD_TITLE_CLASS}>① && 短路(含 count = 0 的坑)</h3>
                <div className="flex items-center gap-3">
                    <Button size="small" onClick={() => setCount((v) => Math.max(0, v - 1))}>
                        -
                    </Button>
                    <span className="text-sm text-gray-600 dark:text-slate-300">
                        count = {count}
                    </span>
                    <Button size="small" onClick={() => setCount((v) => v + 1)}>
                        +
                    </Button>
                </div>
                <div className="space-y-2 text-xs">
                    <div className="rounded border border-red-200 bg-red-50 p-2 dark:border-red-900/50 dark:bg-red-950/30">
                        <p className="font-mono text-red-500 dark:text-red-400">
                            {'{ count && <Tag /> }'}(错误)
                        </p>
                        <p className="mt-1 text-gray-700 dark:text-slate-300">
                            输出:「{count && <Tag color="red">{count} 条未读</Tag>}」
                            {count === 0 && (
                                <span className="ml-1 text-red-500">
                                    ← 屏幕上真的出现了一个 0!
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="rounded border border-emerald-200 bg-emerald-50 p-2 dark:border-emerald-900/50 dark:bg-emerald-950/30">
                        <p className="font-mono text-emerald-600 dark:text-emerald-400">
                            {'{ count > 0 && <Tag /> }'}(正确)
                        </p>
                        <p className="mt-1 text-gray-700 dark:text-slate-300">
                            输出:「{count > 0 && <Tag color="green">{count} 条未读</Tag>}」
                            {count === 0 && (
                                <span className="ml-1 text-gray-400">← false 渲染为空,干净</span>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* 范式二:三元表达式 —— 二选一场景 */}
            <div className={CARD_CLASS}>
                <h3 className={CARD_TITLE_CLASS}>② 三元表达式(二选一)</h3>
                <div className="flex items-center gap-3">
                    <Switch checked={loggedIn} onChange={setLoggedIn} />
                    <span className="text-sm text-gray-600 dark:text-slate-300">
                        {loggedIn ? '已登录' : '未登录'}
                    </span>
                </div>
                <div className="rounded bg-white p-3 text-sm dark:bg-slate-900">
                    {loggedIn ? (
                        <span className="text-primary-600 dark:text-primary-400">
                            欢迎回来,管理员 👋
                        </span>
                    ) : (
                        <span className="text-gray-500 dark:text-slate-400">
                            请先登录后再继续操作
                        </span>
                    )}
                </div>
            </div>

            {/* 范式三:提前 return —— 小组件的前置分支 */}
            <div className={CARD_CLASS}>
                <h3 className={CARD_TITLE_CLASS}>③ 提前 return(小组件内)</h3>
                <Button size="small" onClick={() => setVisible((v) => !v)}>
                    {visible ? '隐藏详情' : '显示详情'}
                </Button>
                <div>
                    <DetailPanel visible={visible} />
                    {!visible && (
                        <p className="text-xs text-gray-400 dark:text-slate-500">
                            DetailPanel 内部 if (!visible) return null,这里什么都不渲染
                        </p>
                    )}
                </div>
            </div>

            {/* 范式四:变量承载 —— if/else 先算好元素再插入 */}
            <div className={CARD_CLASS}>
                <h3 className={CARD_TITLE_CLASS}>④ 变量承载(if / else)</h3>
                <Segmented
                    size="small"
                    value={status}
                    onChange={(v) => setStatus(v as WorkStatus)}
                    options={[
                        { label: '待处理', value: 'todo' },
                        { label: '进行中', value: 'doing' },
                        { label: '已完成', value: 'done' },
                    ]}
                />
                <p className="text-sm text-gray-600 dark:text-slate-300">
                    当前任务状态:{statusBadge}
                </p>
                <p className="text-xs text-gray-400 dark:text-slate-500">
                    分支在 JSX 之外用 if/else 赋给 statusBadge,JSX 里只有一行 {'{ statusBadge }'}
                </p>
            </div>
        </div>
    );
});

ConditionalDemo.displayName = 'ConditionalDemo';
