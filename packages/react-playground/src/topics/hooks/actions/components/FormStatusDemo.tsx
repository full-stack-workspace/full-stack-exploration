/**
 * ============================================================================
 * FormStatusDemo.tsx — Section 4:useFormStatus 子组件读取父表单状态
 * ============================================================================
 *
 * useFormStatus(来自 react-dom)让 <form> 内部的「后代组件」读到
 * 最近一次父表单的提交状态(pending / data / method / action),
 * 典型用途:提交按钮自己管理 loading,不再需要父组件把 pending 一层层传下来。
 *
 * 关键约束:它只能「向上找」祖先 form —— 必须拆出一个渲染在 form 内部的
 * 子组件;写在渲染 <form> 的同一个组件里(或 form 之外)永远拿到 pending=false。
 * 本演示用「表单内探针 vs 表单外探针」的 live 对照把这条规则打出来。
 *
 * @module topics/hooks/actions/components/FormStatusDemo
 */

import { memo, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { mockRequest } from '../mock';

/* =================================================================
 * pending 探针:渲染在哪,读的就是「离它最近的祖先 form」的状态
 * ================================================================ */

interface PendingProbeProps {
    /** 探针标签,用于区分表单内 / 表单外 */
    label: string;
}

const PendingProbe = memo(({ label }: PendingProbeProps) => {
    const { pending } = useFormStatus();
    return (
        <p
            data-testid={label}
            className={`rounded-md px-3 py-1.5 font-mono text-xs ${
                pending
                    ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                    : 'bg-gray-50 text-gray-500 dark:bg-slate-800/50 dark:text-slate-400'
            }`}
        >
            {label}:pending = {String(pending)}
        </p>
    );
});

PendingProbe.displayName = 'PendingProbe';

/* =================================================================
 * 提交按钮:自己读 pending 做 loading,父组件零传参
 * ================================================================ */

const SubmitButton = memo(() => {
    // 按钮渲染在 <form> 内部,读到的就是这份表单的提交状态
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-primary-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
            {pending ? '提交中…' : '提交反馈'}
        </button>
    );
});

SubmitButton.displayName = 'SubmitButton';

/* =================================================================
 * 演示主体:form 内外各放一枚探针
 * ================================================================ */

interface FormStatusDemoProps {
    /** 人为网络延迟(ms),页面用默认值,测试传小值 */
    delay?: number;
}

export const FormStatusDemo = memo(({ delay = 800 }: FormStatusDemoProps) => {
    const [done, setDone] = useState('');

    // 注意:本组件渲染了 <form>,所以不能在这里直接 useFormStatus —
    // 它读不到自己渲染的 form,只能读祖先的。pending 逻辑必须下沉到子组件。
    const submitFeedback = async (formData: FormData) => {
        const text = String(formData.get('feedback') ?? '');
        setDone('');
        await mockRequest({ delay });
        setDone(`已收到反馈:「${text}」`);
    };

    return (
        <div className="space-y-3">
            <form action={submitFeedback} aria-label="useFormStatus 反馈表单" className="space-y-3">
                <textarea
                    name="feedback"
                    rows={2}
                    required
                    placeholder="对本专题的一点反馈…"
                    aria-label="反馈内容"
                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-primary-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                />
                <div className="flex flex-wrap items-center gap-3">
                    <SubmitButton />
                    {/* form 内的探针:提交期间 pending 变 true */}
                    <PendingProbe label="表单内探针" />
                </div>
            </form>
            {/* form 外的探针:没有祖先 form,pending 永远是 false */}
            <PendingProbe label="表单外探针" />
            {done && (
                <p role="status" className="text-xs text-green-600 dark:text-green-400">
                    {done}
                </p>
            )}
        </div>
    );
});

FormStatusDemo.displayName = 'FormStatusDemo';
