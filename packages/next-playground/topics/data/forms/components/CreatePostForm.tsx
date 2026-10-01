/**
 * ============================================================================
 * CreatePostForm — zod 校验 + 字段级错误回显(Client)
 * ============================================================================
 *
 * useActionState 在这里的职责与留言板不同:不只是 ok/error 一个布尔,
 * 而是承载整个错误模型 —— fieldErrors 按字段回显到输入框下方,
 * formError 回显在表单顶部,created 在成功后回显服务端清洗结果。
 *
 * 渐进增强:form action 直接绑定 useActionState 的 dispatch(无闭包包装),
 * 无 JS 时原生 POST 到 action,React 会把返回的 state 渲染进重渲的页面
 * —— 字段错误在无 JS 时同样可见。input 上的 maxLength 只是体验提示,
 * 权威校验在 actions.ts 的 schema 里。
 *
 * @module topics/data/forms/components/CreatePostForm
 * @client
 */

"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

import { cn } from "@/lib/utils";

import { createPost } from "../actions";
import {
    BODY_MAX,
    BODY_MIN,
    CATEGORIES,
    INITIAL_CREATE_POST_STATE,
    TITLE_MAX,
} from "../schema";

/** 提交按钮:useFormStatus 读父 <form> 的 pending,无需 props 透传 */
function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
        >
            {pending ? "校验并提交中…" : "创建文章"}
        </button>
    );
}

/** 字段错误列表:errors 为空时不占位 */
function FieldErrors({ errors }: { errors?: string[] }) {
    if (!errors || errors.length === 0) {return null;}
    return (
        <ul className="mt-1 space-y-0.5">
            {errors.map((e) => (
                <li
                    key={e}
                    className="text-xs text-rose-600 dark:text-rose-400"
                >
                    {e}
                </li>
            ))}
        </ul>
    );
}

const inputClass = (hasError: boolean) =>
    cn(
        "w-full rounded-lg border bg-white px-3 py-2 text-sm text-neutral-800 outline-none transition-colors placeholder:text-neutral-400 dark:bg-neutral-950 dark:text-neutral-100",
        hasError
            ? "border-rose-400 focus:border-rose-500 dark:border-rose-700"
            : "border-neutral-200 focus:border-emerald-400 dark:border-neutral-700 dark:focus:border-emerald-600",
    );

export function CreatePostForm() {
    const formRef = useRef<HTMLFormElement>(null);
    const [state, formAction] = useActionState(
        createPost,
        INITIAL_CREATE_POST_STATE,
    );

    // state 每次派发都换新对象:以此为依赖可精确捕获「本次提交成功」再清空
    useEffect(() => {
        if (state.ok) {
            formRef.current?.reset();
        }
    }, [state]);

    const fe = state.fieldErrors;

    return (
        <form ref={formRef} action={formAction} className="space-y-4">
            {/* 整单错误:不属于任何字段的错误才有落点 */}
            {state.formError && (
                <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-300">
                    {state.formError}
                </p>
            )}

            <div>
                <label
                    htmlFor="create-post-title"
                    className="mb-1 block text-xs font-semibold text-neutral-600 dark:text-neutral-300"
                >
                    标题(必填,最多 {TITLE_MAX} 字)
                </label>
                <input
                    id="create-post-title"
                    name="title"
                    type="text"
                    placeholder="给文章起个标题"
                    maxLength={TITLE_MAX + 20}
                    aria-invalid={Boolean(fe.title?.length)}
                    className={inputClass(Boolean(fe.title?.length))}
                />
                <FieldErrors errors={fe.title} />
            </div>

            <div>
                <label
                    htmlFor="create-post-body"
                    className="mb-1 block text-xs font-semibold text-neutral-600 dark:text-neutral-300"
                >
                    正文({BODY_MIN}–{BODY_MAX} 字)
                </label>
                <textarea
                    id="create-post-body"
                    name="body"
                    rows={4}
                    placeholder={`至少 ${BODY_MIN} 字,试着提交一个空表单看看`}
                    aria-invalid={Boolean(fe.body?.length)}
                    className={inputClass(Boolean(fe.body?.length))}
                />
                <FieldErrors errors={fe.body} />
            </div>

            <div>
                <label
                    htmlFor="create-post-category"
                    className="mb-1 block text-xs font-semibold text-neutral-600 dark:text-neutral-300"
                >
                    分类(必选)
                </label>
                <select
                    id="create-post-category"
                    name="category"
                    defaultValue=""
                    aria-invalid={Boolean(fe.category?.length)}
                    className={inputClass(Boolean(fe.category?.length))}
                >
                    <option value="" disabled>
                        请选择…
                    </option>
                    {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
                </select>
                <FieldErrors errors={fe.category} />
            </div>

            <div className="flex items-center gap-4">
                <SubmitButton />
                {state.ok && state.created && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                        服务端已接收:「{state.created.title}」(
                        {state.created.category},正文{" "}
                        {state.created.body.length} 字)
                    </p>
                )}
            </div>
        </form>
    );
}
