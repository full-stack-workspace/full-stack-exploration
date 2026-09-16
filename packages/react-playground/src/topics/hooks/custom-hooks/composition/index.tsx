/**
 * ============================================================================
 * 自定义 Hooks 组合实战(/topics/hooks/custom-hooks-composition)
 * ============================================================================
 *
 * 把 lib/ 的原子 Hook 分层组合成领域 Hook(useUserSearch),
 * 驱动一个完整可运行的用户搜索页:
 * 输入防抖 → 发请求 → loading → 结果列表;请求生命周期日志面板
 * 实时展示「发起 / 废弃(竞态)/ 成功 / 失败」,快速连续输入时
 * 旧请求被废弃标灰 —— 直观呈现 useRequest 的竞态处理。
 *
 * @module topics/hooks/custom-hooks/composition
 */

import { memo, useEffect, useRef } from 'react';
import { Alert, Button, Input, List, Spin, Switch, Tag } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';

import { TopicPage, TopicSection } from '../../../../components/TopicPage';
import { CodeBlock } from '../../../../components/CodeBlock';
import { Diagram } from '../../../../components/Diagram';
import { NavBanner } from '../playground/components/NavBanner';
import { useToggle } from '../lib';
import { setMockFailure } from './mockUserApi';
import { useUserSearch } from './useUserSearch';
import type { SearchLogEntry } from './useUserSearch';

/* =================================================================
 * 日志条目展示配置
 * ================================================================ */

const LOG_META: Record<SearchLogEntry['type'], { label: string; className: string }> = {
    start: { label: '发起', className: 'text-sky-300' },
    success: { label: '成功', className: 'text-emerald-300' },
    error: { label: '失败', className: 'text-rose-400' },
    stale: { label: '废弃', className: 'text-gray-500 line-through' },
    cancel: { label: '取消', className: 'text-amber-400' },
};

/** 请求生命周期日志面板(仿 agent-chat EventLogPanel) */
const RequestLogPanel = memo(({ logs }: { logs: readonly SearchLogEntry[] }) => {
    const listRef = useRef<HTMLDivElement>(null);

    // 新日志到达时滚动到底部
    useEffect(() => {
        const el = listRef.current;
        if (el) {
            el.scrollTop = el.scrollHeight;
        }
    }, [logs.length]);

    return (
        <div
            ref={listRef}
            className="max-h-64 overflow-y-auto rounded-lg bg-gray-900 p-3 font-mono text-xs dark:bg-slate-950"
        >
            {logs.length === 0 ? (
                <p className="text-gray-500">输入关键字触发请求后,这里逐条显示请求生命周期</p>
            ) : (
                <ul className="space-y-1">
                    {logs.map((log) => {
                        const meta = LOG_META[log.type];
                        return (
                            <li
                                key={log.seq}
                                className={log.type === 'stale' ? 'text-gray-500' : 'text-gray-300'}
                                title={
                                    log.type === 'stale'
                                        ? '该请求返回时已有更新的请求,结果被丢弃'
                                        : undefined
                                }
                            >
                                <span className="text-gray-500">#{log.seq}</span>{' '}
                                <span className={meta.className}>{meta.label}</span>{' '}
                                <span className="text-gray-400">req-{log.requestId}</span>{' '}
                                <span className="text-gray-500">「{log.keyword || '(全部)'}」</span>
                                {log.type === 'stale' && (
                                    <span className="text-gray-500"> ← 竞态丢弃,未写入 state</span>
                                )}
                                {log.type === 'error' && (
                                    <span className="text-rose-400"> {log.message}</span>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
});

RequestLogPanel.displayName = 'RequestLogPanel';

/* =================================================================
 * 页面
 * ================================================================ */

const CustomHooksComposition = memo(() => {
    const { keyword, setKeyword, debouncedKeyword, users, loading, error, retry, logs } =
        useUserSearch();
    const [shouldFail, { toggle: toggleFail }] = useToggle(false);

    return (
        <TopicPage
            title="自定义 Hooks 组合实战"
            description="原子 Hook 分层组合成领域 Hook:useState + useDebouncedValue + useRequest → useUserSearch → UI"
        >
            <NavBanner current="composition" />

            {/* ---------- 分层架构 ---------- */}
            <TopicSection
                title="分层架构"
                note="每层只回答一个问题;UI 组件不感知防抖、竞态、取消的任何细节"
            >
                <Diagram caption="原子 Hooks → 领域 Hook → UI">
                    {`useState            输入框原始值(每次击键)
useDebouncedValue   击键流 → 400ms 静止后才放行的请求信号
useRequest          请求生命周期:loading / 竞态 / 取消 / 错误
        ↓ 组合
useUserSearch       领域 Hook:暴露 keyword / users / retry / logs
        ↓ 消费
UI 组件             只渲染 + 转发用户意图,零请求细节`}
                </Diagram>
            </TopicSection>

            {/* ---------- 可运行搜索 ---------- */}
            <TopicSection
                title="用户搜索(可运行)"
                note="快速连续输入观察日志面板:只有最后一次输入的请求生效,中途请求全部被废弃;打开「模拟接口失败」可演练错误重试"
            >
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <Input
                            allowClear
                            prefix={<SearchOutlined className="text-gray-300" />}
                            placeholder="搜索姓名 / 角色 / 城市,如「前端」"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            className="max-w-sm"
                        />
                        <span className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                            <Switch
                                size="small"
                                checked={shouldFail}
                                onChange={() => {
                                    setMockFailure(!shouldFail);
                                    toggleFail();
                                }}
                            />
                            模拟接口失败
                        </span>
                        <span className="text-xs text-gray-400 dark:text-slate-500">
                            防抖后关键字:「{debouncedKeyword || '(全部)'}」
                        </span>
                    </div>

                    {error != null && (
                        <Alert
                            type="error"
                            showIcon
                            message={`搜索失败:${error instanceof Error ? error.message : String(error)}`}
                            action={
                                <Button size="small" icon={<ReloadOutlined />} onClick={retry}>
                                    重试
                                </Button>
                            }
                        />
                    )}

                    <Spin spinning={loading}>
                        <List
                            size="small"
                            className="max-w-2xl"
                            locale={{ emptyText: '没有匹配的用户' }}
                            dataSource={users ?? []}
                            renderItem={(user) => (
                                <List.Item className="!px-2">
                                    <span className="text-sm text-gray-700 dark:text-slate-300">
                                        {user.name}
                                    </span>
                                    <span className="ml-auto flex gap-1">
                                        <Tag>{user.role}</Tag>
                                        <Tag color="default">{user.city}</Tag>
                                    </span>
                                </List.Item>
                            )}
                        />
                    </Spin>
                </div>
            </TopicSection>

            {/* ---------- 请求生命周期日志 ---------- */}
            <TopicSection
                title="请求生命周期日志"
                note="发起 / 成功 / 失败 / 废弃逐条列出;「废弃」= 返回时已有更新请求(竞态),结果被丢弃、标灰,state 不被污染"
            >
                <RequestLogPanel logs={logs} />
            </TopicSection>

            {/* ---------- 组合点源码讲解 ---------- */}
            <TopicSection
                title="useUserSearch 源码与组合点"
                note="见 composition/useUserSearch.ts —— 注意它没有任何定时器、AbortController 或订阅代码,全部能力来自组合"
            >
                <CodeBlock
                    title="composition/useUserSearch.ts(节选)"
                    code={`const [keyword, setKeyword] = useState('');            // ① 输入框原始状态
const debouncedKeyword = useDebouncedValue(keyword, 400); // ② 击键流 → 请求信号

const { data, loading, error, run, refresh } = useRequest(
    ({ signal }, kw: string) => searchUsers(kw, { signal }),
    { manual: true, onEvent: appendLog },                 // ③ 生命周期 + 可观测性
);

// 组合点:防抖值变化 → 发起新请求;旧请求由 useRequest 自动 abort + 标 stale
useEffect(() => {
    requestedKeywordRef.current = debouncedKeyword;
    run(debouncedKeyword);
}, [debouncedKeyword, run]);`}
                />
            </TopicSection>
        </TopicPage>
    );
});

CustomHooksComposition.displayName = 'CustomHooksComposition';

export default CustomHooksComposition;
