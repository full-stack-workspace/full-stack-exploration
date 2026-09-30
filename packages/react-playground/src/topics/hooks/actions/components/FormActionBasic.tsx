/**
 * ============================================================================
 * FormActionBasic.tsx — Section 1:form action 基础对照
 * ============================================================================
 *
 * 同一个「订阅邮箱」需求并排实现两遍:
 * - ❌ 手动 onSubmit:preventDefault + 受控 input + isSubmitting 状态 +
 *   手动清空,四件事全是样板代码
 * - ✅ <form action={asyncFn}>:非受控 input 挂个 name,React 负责收集
 *   FormData、派发 action,并在 action 完成后自动重置表单
 *
 * 唯一变量是「表单提交这件事由谁管」,UI 与 mock 完全一致。
 *
 * @module topics/hooks/actions/components/FormActionBasic
 */

import { memo, useState } from 'react';
import type { FormEvent } from 'react';

import { mockRequest } from '../mock';

interface FormActionBasicProps {
    /** 人为网络延迟(ms),页面用默认值,测试传小值 */
    delay?: number;
}

/* =================================================================
 * ❌ 手动版:onSubmit + 受控状态,pending / 取值 / 清空全靠自己
 * ================================================================ */

interface ManualFormProps {
    delay: number;
}

const ManualForm = memo(({ delay }: ManualFormProps) => {
    // 受控值、提交中、结果提示 —— 三个 state 只为一次提交服务
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState('');

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);
        setDone('');
        try {
            await mockRequest({ delay });
            setDone(`已订阅:${email}`);
            setEmail(''); // 成功后要手动清空,忘了就是残留 bug
        } finally {
            setSubmitting(false); // 还得记得 finally 复位,漏了按钮永远转圈
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            aria-label="手动 onSubmit 订阅表单"
            className="space-y-3 rounded-card border border-red-200 bg-red-50/40 p-4 dark:border-red-900/50 dark:bg-red-950/20"
        >
            <p className="text-sm font-medium text-red-600 dark:text-red-400">❌ 手动 onSubmit</p>
            <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-label="手动版邮箱"
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-primary-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            />
            <button
                type="submit"
                disabled={submitting}
                className="rounded-md bg-primary-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {submitting ? '提交中…' : '订阅'}
            </button>
            {done && (
                <p role="status" className="text-xs text-green-600 dark:text-green-400">
                    {done}(输入框靠 setEmail(&apos;&apos;) 手动清空)
                </p>
            )}
        </form>
    );
});

ManualForm.displayName = 'ManualForm';

/* =================================================================
 * ✅ action 版:<form action={asyncFn}>,非受控 + 自动重置
 * ================================================================ */

interface ActionFormProps {
    delay: number;
}

const ActionForm = memo(({ delay }: ActionFormProps) => {
    // 只保留「结果提示」一个 state;输入值由 DOM + FormData 管,重置由 React 管
    const [done, setDone] = useState('');

    // form action 的签名:接收 FormData,返回 void 或 Promise
    // React 会把整个异步过程当一次 Action 追踪(pending 见 Section 4 的 useFormStatus)
    const subscribeAction = async (formData: FormData) => {
        const email = String(formData.get('action-email') ?? '');
        setDone('');
        await mockRequest({ delay });
        setDone(`已订阅:${email}`);
        // 不写任何「清空输入框」的代码:action 完成后 React 自动重置非受控表单
    };

    return (
        <form
            action={subscribeAction}
            aria-label="form action 订阅表单"
            className="space-y-3 rounded-card border border-green-200 bg-green-50/40 p-4 dark:border-green-900/50 dark:bg-green-950/20"
        >
            <p className="text-sm font-medium text-green-600 dark:text-green-400">✅ form action</p>
            <input
                type="email"
                name="action-email"
                required
                placeholder="you@example.com"
                aria-label="action 版邮箱"
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-primary-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            />
            <button
                type="submit"
                className="rounded-md bg-primary-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-primary-500"
            >
                订阅
            </button>
            {done && (
                <p role="status" className="text-xs text-green-600 dark:text-green-400">
                    {done}(输入框已被 React 自动重置)
                </p>
            )}
        </form>
    );
});

ActionForm.displayName = 'ActionForm';

/* =================================================================
 * 演示主体:两栏对照
 * ================================================================ */

export const FormActionBasic = memo(({ delay = 800 }: FormActionBasicProps) => {
    return (
        <div className="space-y-3">
            <div className="grid gap-4 lg:grid-cols-2">
                <ManualForm delay={delay} />
                <ActionForm delay={delay} />
            </div>
            <p className="text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                玩法:两边各填一个邮箱提交。左边清空输入框、复位 pending 全靠手写;右边只写一个
                async 函数 —— 取值走 FormData,提交完成后非受控输入框被自动清空。
                action 期间再次提交会被 React 排队/复用 pending,不会出现手动版「连点发两请求」的问题。
            </p>
        </div>
    );
});

FormActionBasic.displayName = 'FormActionBasic';
