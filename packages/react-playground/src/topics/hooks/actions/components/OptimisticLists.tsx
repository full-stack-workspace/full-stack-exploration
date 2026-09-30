/**
 * ============================================================================
 * OptimisticLists.tsx — Section 3:useOptimistic 乐观更新对照实验
 * ============================================================================
 *
 * 两个共享同一份初始数据的留言列表,唯一的变量是「点击点赞后界面何时更新」:
 * - ❌ 无乐观更新:await 返回后才 setState,延迟期间只能靠转圈表示「活着」
 * - ✅ useOptimistic:startTransition 里先 applyOptimistic(+1),界面立刻更新;
 *   请求成功后提交真实值无缝衔接,失败则真实 state 没变,乐观值自动回滚
 *
 * 顶部「注入失败」开关对两边同时生效,用于观察两种失败表现的差异。
 *
 * @module topics/hooks/actions/components/OptimisticLists
 */

import { memo, startTransition, useOptimistic, useState } from 'react';

import { mockRequest } from '../mock';

interface Message {
    id: number;
    text: string;
    likes: number;
}

const INITIAL_MESSAGES: Message[] = [
    { id: 1, text: 'Actions 把提交逻辑收进了一处', likes: 3 },
    { id: 2, text: '乐观更新让界面感觉不到延迟', likes: 5 },
    { id: 3, text: '失败了也要体面地回滚', likes: 2 },
];

interface PanelProps {
    delay: number;
    /** 失败注入:为 true 时所有点赞请求必失败 */
    failMode: boolean;
}

/* =================================================================
 * 列表行渲染:两个面板共用,保证对照实验只有「更新策略」一个变量
 * ================================================================ */

interface MessageRowProps {
    message: Message;
    /** 仅手动版使用:该条是否在等待响应 */
    waiting?: boolean;
    onLike: (id: number) => void;
}

const MessageRow = memo(({ message, waiting = false, onLike }: MessageRowProps) => {
    return (
        <li className="flex items-center justify-between gap-3 rounded-md border border-gray-100 bg-gray-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/50">
            <span className="text-sm text-gray-600 dark:text-slate-300">{message.text}</span>
            <span className="flex items-center gap-2">
                {waiting && (
                    <span className="text-xs text-gray-400 dark:text-slate-500">等待服务端…</span>
                )}
                <button
                    type="button"
                    onClick={() => onLike(message.id)}
                    aria-label={`点赞:${message.text}`}
                    className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 transition-colors hover:border-primary-400 hover:text-primary-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                >
                    👍 {message.likes}
                </button>
            </span>
        </li>
    );
});

MessageRow.displayName = 'MessageRow';

/* =================================================================
 * ❌ 手动版:等待响应 → setState;失败时界面从未变化,只能事后报错
 * ================================================================ */

const PlainPanel = memo(({ delay, failMode }: PanelProps) => {
    const [messages, setMessages] = useState(INITIAL_MESSAGES);
    // pending 只能表达「某条在等响应」,数字在响应到达前不会动
    const [pendingId, setPendingId] = useState<number | null>(null);
    const [error, setError] = useState('');

    const like = async (id: number) => {
        setPendingId(id);
        setError('');
        try {
            await mockRequest({ delay, shouldFail: failMode, errorMessage: '点赞失败' });
            setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, likes: m.likes + 1 } : m)));
        } catch {
            setError('点赞失败:界面等了一个延迟的往返,什么也没变');
        } finally {
            setPendingId(null);
        }
    };

    return (
        <section
            data-testid="plain-panel"
            aria-label="无乐观更新列表面板"
            className="space-y-2 rounded-card border border-red-200 bg-red-50/40 p-4 dark:border-red-900/50 dark:bg-red-950/20"
        >
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
                ❌ 无乐观更新(响应到达才更新)
            </p>
            <ul className="space-y-2">
                {messages.map((m) => (
                    <MessageRow key={m.id} message={m} waiting={pendingId === m.id} onLike={like} />
                ))}
            </ul>
            {error && (
                <p role="alert" className="text-xs text-red-600 dark:text-red-400">
                    {error}
                </p>
            )}
        </section>
    );
});

PlainPanel.displayName = 'PlainPanel';

/* =================================================================
 * ✅ useOptimistic 版:先乐观 +1,成功无缝衔接,失败自动回滚
 * ================================================================ */

/** 乐观更新的指令类型;只有「点赞」一种,真实项目里可加 add/remove 等 */
type OptimisticAction = { type: 'like'; id: number };

const OptimisticPanel = memo(({ delay, failMode }: PanelProps) => {
    const [messages, setMessages] = useState(INITIAL_MESSAGES);
    // optimisticMessages 是 messages 的「投影」:
    // 没有任何 transition pending 时 === messages;transition 期间叠加 applyOptimistic 的增量
    const [optimisticMessages, applyOptimistic] = useOptimistic(
        messages,
        (current: Message[], action: OptimisticAction) =>
            current.map((m) => (m.id === action.id ? { ...m, likes: m.likes + 1 } : m)),
    );
    const [notice, setNotice] = useState('');

    const like = (id: number) => {
        // React 19 中把 async 函数交给 startTransition 即构成一个 Action;
        // applyOptimistic 必须在这个 Action 内调用,增量在 transition pending 期间生效
        startTransition(async () => {
            setNotice('');
            applyOptimistic({ type: 'like', id });
            try {
                await mockRequest({ delay, shouldFail: failMode, errorMessage: '点赞失败' });
                // 成功:真实 state 更新为与乐观值一致,transition 结束时无缝衔接
                setMessages((prev) =>
                    prev.map((m) => (m.id === id ? { ...m, likes: m.likes + 1 } : m)),
                );
            } catch {
                // 失败:真实 state 没有变,transition 结束后乐观值自动回落 —— 回滚是免费的
                setNotice('点赞失败,乐观值已自动回滚(真实 state 从未变化)');
            }
        });
    };

    return (
        <section
            data-testid="optimistic-panel"
            aria-label="useOptimistic 列表面板"
            className="space-y-2 rounded-card border border-green-200 bg-green-50/40 p-4 dark:border-green-900/50 dark:bg-green-950/20"
        >
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
                ✅ useOptimistic(先更新,失败自动回滚)
            </p>
            <ul className="space-y-2">
                {optimisticMessages.map((m) => (
                    <MessageRow key={m.id} message={m} onLike={like} />
                ))}
            </ul>
            {notice && (
                <p role="status" className="text-xs text-amber-600 dark:text-amber-400">
                    {notice}
                </p>
            )}
        </section>
    );
});

OptimisticPanel.displayName = 'OptimisticPanel';

/* =================================================================
 * 演示主体:共享失败注入开关的两栏对照
 * ================================================================ */

interface OptimisticListsProps {
    /** 人为网络延迟(ms),页面用默认值,测试传小值 */
    delay?: number;
}

export const OptimisticLists = memo(({ delay = 1200 }: OptimisticListsProps) => {
    const [failMode, setFailMode] = useState(false);

    return (
        <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                <input
                    type="checkbox"
                    checked={failMode}
                    onChange={(e) => setFailMode(e.target.checked)}
                    className="h-4 w-4 accent-primary-600"
                />
                注入失败(开启后两边所有点赞请求都会失败)
            </label>
            <div className="grid gap-4 lg:grid-cols-2">
                <PlainPanel delay={delay} failMode={failMode} />
                <OptimisticPanel delay={delay} failMode={failMode} />
            </div>
            <p className="text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                玩法:先在两边各点一次 👍 —— 左边要等 {delay}ms 才 +1,右边立刻 +1。
                再打开「注入失败」各点一次 —— 左边白等一个来回然后报错;右边依旧立刻 +1,
                失败后悄悄回滚到原值,只留下一条提示。
            </p>
        </div>
    );
});

OptimisticLists.displayName = 'OptimisticLists';
