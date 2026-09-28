/**
 * ============================================================================
 * 组件通信 · 工作台实战(/topics/advanced/component-comm-practice)
 * ============================================================================
 *
 * 一个工单工作台,把四类事实拆到各自通道:
 * - 状态过滤 → URL(可分享)
 * - 当前选中 → 页面提升的 state(兄弟列表 / 详情)
 * - 评论草稿 → 详情内部局部 state(不配上传)
 * - 当前用户 → 已有 User Context(判断「我负责的」)
 *
 * @module topics/advanced/component-comm/practice
 */

import { memo, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, Switch } from 'antd';

import { TopicPage, TopicSection } from '../../../../components/TopicPage';
import { CodeBlock } from '../../../../components/CodeBlock';
import { Input } from '../../../../components/Input';
import { useUser } from '../../../../context/UserProvider';
import { NavBanner } from '../components/NavBanner';
import { TICKETS, type Ticket, type TicketStatus } from './tickets';

type StatusFilter = 'all' | TicketStatus;

function isStatusFilter(value: string | null): value is StatusFilter {
    return value === 'all' || value === 'open' || value === 'done';
}

const FILTERS: { id: StatusFilter; label: string }[] = [
    { id: 'all', label: '全部' },
    { id: 'open', label: '未完成' },
    { id: 'done', label: '已完成' },
];

/* =================================================================
 * 壳层组合:Frame 不认识工单
 * ================================================================ */

const BenchFrame = memo(({ children }: { children: ReactNode }) => {
    return <div className="space-y-3">{children}</div>;
});

BenchFrame.displayName = 'BenchFrame';

const BenchToolbar = memo(({ children }: { children: ReactNode }) => {
    return <div className="flex flex-wrap items-center gap-2">{children}</div>;
});

BenchToolbar.displayName = 'BenchToolbar';

/* =================================================================
 * 列表 / 详情:只吃 props,不互相同步
 * ================================================================ */

const TicketList = memo(
    ({
        tickets,
        selectedId,
        onSelect,
    }: {
        tickets: Ticket[];
        selectedId: string | null;
        onSelect: (id: string) => void;
    }) => {
        if (tickets.length === 0) {
            return <p className="text-xs text-gray-400">这个过滤条件下没有工单</p>;
        }
        return (
            <ul className="space-y-2">
                {tickets.map((ticket) => (
                    <li key={ticket.id}>
                        <button
                            type="button"
                            onClick={() => onSelect(ticket.id)}
                            className={`w-full rounded-card border px-3 py-2 text-left text-sm transition-colors ${
                                ticket.id === selectedId
                                    ? 'border-sky-500 bg-sky-50 font-medium text-sky-700 dark:bg-sky-500/10 dark:text-sky-300'
                                    : 'border-gray-100 text-gray-600 hover:border-sky-300 dark:border-slate-800 dark:text-slate-300'
                            }`}
                        >
                            <span>{ticket.title}</span>
                            <span className="mt-0.5 block text-[11px] font-normal text-gray-400">
                                {ticket.status === 'open' ? '未完成' : '已完成'} · {ticket.assigneeId}
                            </span>
                        </button>
                    </li>
                ))}
            </ul>
        );
    },
);

TicketList.displayName = 'TicketList';

const TicketDetail = memo(({ ticket }: { ticket: Ticket | null }) => {
    const [draft, setDraft] = useState('');
    const [sent, setSent] = useState<string | null>(null);

    if (!ticket) {
        return <p className="text-sm text-gray-400">在左侧选一条工单</p>;
    }

    return (
        <div className="space-y-3">
            <div>
                <p className="text-sm font-medium text-gray-800 dark:text-slate-100">{ticket.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-slate-400">{ticket.body}</p>
            </div>
            <div className="space-y-2">
                <Input
                    aria-label="评论草稿"
                    placeholder="评论草稿只活在详情内部,切换工单会丢掉(本页有意如此)"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                />
                <Button
                    size="small"
                    type="primary"
                    disabled={!draft.trim()}
                    onClick={() => {
                        setSent(draft.trim());
                        setDraft('');
                    }}
                >
                    发表评论(演示)
                </Button>
            </div>
            {sent ? (
                <p className="text-xs text-emerald-600 dark:text-emerald-400">刚才提交:「{sent}」· 仍未写入全局</p>
            ) : null}
        </div>
    );
});

TicketDetail.displayName = 'TicketDetail';

/* =================================================================
 * 页面
 * ================================================================ */

const ComponentCommPractice = memo(() => {
    const user = useUser();
    const [params, setParams] = useSearchParams();
    const [selectedId, setSelectedId] = useState<string | null>(TICKETS[0].id);
    const [onlyMine, setOnlyMine] = useState(false);

    const status: StatusFilter = isStatusFilter(params.get('status')) ? (params.get('status') as StatusFilter) : 'all';

    const setStatus = (next: StatusFilter) => {
        const nextParams = new URLSearchParams(params);
        if (next === 'all') {
            nextParams.delete('status');
        } else {
            nextParams.set('status', next);
        }
        setParams(nextParams, { replace: true });
    };

    const visible = useMemo(() => {
        return TICKETS.filter((ticket) => {
            const statusMatch = status === 'all' ? true : ticket.status === status;
            const mineMatch = onlyMine ? ticket.assigneeId === user?.id : true;
            return statusMatch && mineMatch;
        });
    }, [onlyMine, status, user?.id]);

    const selected = visible.find((ticket) => ticket.id === selectedId) ?? visible[0] ?? null;

    const query = params.toString();

    return (
        <TopicPage
            title="组件通信 · 工作台实战"
            description="过滤进 URL,选中留在页面,草稿留在详情,当前用户走已有 Context —— 通道用错会立刻别扭"
        >
            <NavBanner current="practice" />

            <TopicSection
                title="通道对照(先看再点)"
                note="「我负责的」依赖当前用户,用户在顶栏,不应写进 URL,也不该从列表再钻到详情。切换顶栏用户,过滤结果会变,选中项若不属于新结果集则回落到第一条。"
            >
                <ul className="grid gap-2 text-xs text-gray-600 dark:text-slate-300 sm:grid-cols-2">
                    <li className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <p className="font-medium text-gray-800 dark:text-slate-100">URL · status</p>
                        <p className="mt-1 text-gray-400">全部 / 未完成 / 已完成,刷新后还在</p>
                    </li>
                    <li className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <p className="font-medium text-gray-800 dark:text-slate-100">页面 state · selectedId</p>
                        <p className="mt-1 text-gray-400">列表和详情的兄弟通道,不进地址栏</p>
                    </li>
                    <li className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <p className="font-medium text-gray-800 dark:text-slate-100">局部 state · 评论草稿</p>
                        <p className="mt-1 text-gray-400">未提交、高频、只服务一个输入框</p>
                    </li>
                    <li className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <p className="font-medium text-gray-800 dark:text-slate-100">User Context · 当前用户</p>
                        <p className="mt-1 text-gray-400">
                            顶栏已有通道,见{' '}
                            <Link className="text-primary-600 underline-offset-2 hover:underline" to="/topics/advanced/context">
                                Context API
                            </Link>
                        </p>
                    </li>
                </ul>
            </TopicSection>

            <TopicSection
                title="工单工作台"
                note="玩法:切过滤看查询串;点另一条工单看详情换人但地址栏不动;写两句评论(草稿不上传);打开「只看我负责的」再去顶栏换用户。"
            >
                <BenchFrame>
                    <BenchToolbar>
                        {FILTERS.map((item) => (
                            <Button
                                key={item.id}
                                size="small"
                                type={status === item.id ? 'primary' : 'default'}
                                aria-label={`状态过滤 ${item.label}`}
                                onClick={() => setStatus(item.id)}
                            >
                                {item.label}
                            </Button>
                        ))}
                        <label className="ml-2 flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                            <Switch
                                size="small"
                                aria-label="只看我负责的"
                                checked={onlyMine}
                                onChange={setOnlyMine}
                            />
                            只看我负责的({user?.name ?? '未登录'})
                        </label>
                    </BenchToolbar>
                    <p className="font-mono text-[11px] text-gray-400" aria-label="工作台查询串">
                        查询串:{query ? `?${query}` : '(空)'} · selectedId={selected?.id ?? '无'}
                    </p>
                    <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
                        <TicketList
                            tickets={visible}
                            selectedId={selected?.id ?? null}
                            onSelect={setSelectedId}
                        />
                        <div className="rounded-card border border-gray-100 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                            <TicketDetail key={selected?.id ?? 'empty'} ticket={selected} />
                        </div>
                    </div>
                </BenchFrame>
            </TopicSection>

            <TopicSection
                title="为什么详情用 key={ticket.id}"
                note="评论草稿是详情的内部 state。换工单时用 key 卸掉旧实例,避免把上一条的未提交文字带到下一条 —— 列表专题的「用 key 重置」。若草稿需要在切换后还在,所有权就该提升,而不是继续藏在详情里。"
            >
                <CodeBlock
                    title="practice/index.tsx(通道归属)"
                    code={`const status = params.get('status') ?? 'all';     // URL:可分享的过滤
const [selectedId, setSelectedId] = useState(...); // 页面:兄弟共用
const [onlyMine, setOnlyMine] = useState(false);   // 页面:依赖当前用户,不进 URL
const user = useUser();                            // Context:站点会话

<TicketDetail key={selected.id} ticket={selected} />
// 详情内部的 draft 是局部 state;key 变了自动清掉`}
                />
            </TopicSection>
        </TopicPage>
    );
});

ComponentCommPractice.displayName = 'ComponentCommPractice';

export default ComponentCommPractice;
