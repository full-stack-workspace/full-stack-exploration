/**
 * ============================================================================
 * GuestbookForm — 留言表单 + 乐观列表(Client)
 * ============================================================================
 *
 * React 19 表单三件套在同一处协同,各司其职:
 * - useActionState = 结果态:action 完成后拿到 ok/error,驱动成功/报错文案
 * - useFormStatus  = 进行态:子组件读取父 <form> 的 pending,按钮禁用 + 文案切换
 * - useOptimistic  = 乐观态:提交即上屏(虚线 + 半透明 + 「发送中」标记),
 *   action 完成、revalidatePath 带回真实列表后乐观项被真值替换;失败则自动回滚
 *
 * 两个关键实现决策(都是踩坑后的结论):
 *
 * 1) 乐观项必须包在 form 的 action 闭包里,与 action 同属一个 transition。
 *    若在 onSubmit 里另开 startTransition 加乐观项,React 会把同一事件里
 *    相继调度的 transition 纠缠(entangle)在一起:表单 action 的完成
 *    要等乐观 transition,乐观 transition 又在等 action 结果 —— 死锁,
 *    按钮永远「提交中」。闭包内先 addOptimisticMessage 再 await formAction,
 *    乐观层自然活到服务端往返结束。
 *
 * 2) 闭包 action 会丢渐进增强(SSR 不会为客户端闭包渲染隐藏 action 字段,
 *    无 JS 原生 POST 打不到 action)。因此用 mounted 开关:SSR/水合前
 *    action 是 useActionState 的 dispatch(服务端引用,隐藏字段齐全,
 *    无 JS 提交照常工作);水合后切换为乐观闭包。水合前页面本就不可交互,
 *    两个时刻各取所需,互不牺牲。
 *
 * 列表以 props 从 Server Component 传入(SSR 首屏即完整 HTML),
 * 本组件只在它之上叠加乐观项。
 *
 * @module topics/rsc-boundary/server-actions/components/GuestbookForm
 * @client
 */

"use client";

import {
    useActionState,
    useEffect,
    useOptimistic,
    useRef,
    useSyncExternalStore,
} from "react";
import { useFormStatus } from "react-dom";

import { cn } from "@/lib/utils";

import { postMessage } from "../actions";
import {
    type Message,
    MESSAGE_MAX_LENGTH,
    type MessageActionState,
} from "../store";

/** 表单初始状态:尚未提交 */
const INITIAL_STATE: MessageActionState = { ok: false, error: null };

/**
 * 提交按钮。useFormStatus 必须用在 <form> 的子孙组件里,
 * 它读的是「父表单本次提交的 pending」,不需要任何 props 透传。
 */
function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:bg-indigo-500 disabled:opacity-50"
        >
            {pending ? "提交中…" : "提交"}
        </button>
    );
}

/** 把 ISO 时间串裁成「MM-DD HH:mm:ss」展示 */
function formatTime(iso: string): string {
    return `${iso.slice(5, 10)} ${iso.slice(11, 19)}`;
}

export function GuestbookForm({ messages }: { messages: Message[] }) {
    const formRef = useRef<HTMLFormElement>(null);
    const [state, formAction] = useActionState(postMessage, INITIAL_STATE);

    // 乐观列表:以服务端列表为真值源,乐观项临时叠在最前;
    // action 完成、revalidatePath 刷新 messages props 后,乐观项自然被真值顶替
    const [optimisticMessages, addOptimisticMessage] = useOptimistic(
        messages,
        (current: Message[], draft: Message) => [draft, ...current],
    );

    // mounted 后才把 form action 换成乐观闭包(理由见文件头注决策 2)。
    // 用 useSyncExternalStore 做水合开关而不是 useState+useEffect:
    // SSR/水合首帧读 getServerSnapshot(false,与 SSR 输出一致),
    // 水合完成后读 getSnapshot(true)自动重渲染 —— 无需 effect setState
    const mounted = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false,
    );

    // state 由 useActionState 在每次 action 完成后换新对象,
    // 以此为依赖可精确捕获「本次提交成功」这一时刻再清空表单
    useEffect(() => {
        if (state.ok) {
            formRef.current?.reset();
        }
    }, [state]);

    /**
     * 乐观 action 闭包(仅水合后接管):先上屏乐观项,再走真实 action。
     * await 让乐观层活到服务端往返结束 —— 成功被真值顶替,失败自动回滚,
     * 错误由 state.error 展示。
     */
    const actionWithOptimistic = async (formData: FormData) => {
        const author = String(formData.get("author") ?? "").trim() || "匿名";
        const content = String(formData.get("content") ?? "").trim();
        if (content) {
            addOptimisticMessage({
                // 负数 id 标记乐观项:渲染时据此叠加 pending 视觉态,
                // 也避免与真实自增 id 撞 key
                id: -Date.now(),
                author,
                content,
                createdAt: new Date().toISOString(),
            });
        }
        await formAction(formData);
    };

    return (
        <div>
            <form
                ref={formRef}
                action={mounted ? actionWithOptimistic : formAction}
                className="space-y-3"
            >
                <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                        name="author"
                        type="text"
                        aria-label="昵称"
                        placeholder="昵称(可留空,默认匿名)"
                        maxLength={20}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 outline-none transition-colors placeholder:text-neutral-400 focus:border-indigo-400 sm:w-48 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:border-indigo-600"
                    />
                    <input
                        name="content"
                        type="text"
                        aria-label="留言内容"
                        required
                        maxLength={MESSAGE_MAX_LENGTH}
                        placeholder={`写点什么…(最多 ${MESSAGE_MAX_LENGTH} 字)`}
                        className="w-full flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 outline-none transition-colors placeholder:text-neutral-400 focus:border-indigo-400 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:border-indigo-600"
                    />
                    <SubmitButton />
                </div>
                {state.error && (
                    <p className="text-xs text-rose-600 dark:text-rose-400">
                        {state.error}
                    </p>
                )}
                {state.ok && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                        提交成功,列表已由服务端重新渲染
                    </p>
                )}
            </form>
            <ul className="mt-5 space-y-3">
                {optimisticMessages.map((m) => {
                    // 乐观项(负数 id):虚线 + 半透明 + 「发送中」标记,
                    // 与已确认留言形成可对比的视觉差
                    const isOptimistic = m.id < 0;
                    return (
                        <li
                            key={m.id}
                            className={cn(
                                "rounded-xl border border-neutral-200/60 p-4 dark:border-neutral-800/60",
                                isOptimistic &&
                                    "border-dashed opacity-60 dark:border-indigo-800/60",
                            )}
                        >
                            <div className="flex items-center justify-between gap-4">
                                <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                                    {m.author}
                                </p>
                                <p className="shrink-0 text-xs text-neutral-400 dark:text-neutral-500">
                                    {isOptimistic
                                        ? "发送中…"
                                        : `${formatTime(m.createdAt)} UTC`}
                                </p>
                            </div>
                            <p className="mt-1 text-sm leading-relaxed break-words text-neutral-600 dark:text-neutral-400">
                                {m.content}
                            </p>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
