/**
 * ============================================================================
 * NaiveForm — 对照组:不设校验的 action 会收下什么(Client)
 * ============================================================================
 *
 * 与 CreatePostForm 相同的三个字段,但 action(createPostNaive)
 * 不做任何校验、原样回显收到的值。空标题、不选分类、超长正文
 * 都「提交成功」—— 它就是「input 上的 required 只是体验,
 * 不是防线」这句话的可运行证据。
 *
 * @module topics/data/forms/components/NaiveForm
 * @client
 */

"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { createPostNaive } from "../actions";
import { INITIAL_NAIVE_STATE } from "../schema";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-neutral-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-600 disabled:opacity-50 dark:bg-neutral-600 dark:hover:bg-neutral-500"
        >
            {pending ? "提交中…" : "不校验,直接提交"}
        </button>
    );
}

export function NaiveForm() {
    const [state, formAction] = useActionState(
        createPostNaive,
        INITIAL_NAIVE_STATE,
    );

    return (
        <div>
            <form action={formAction} className="space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                        name="title"
                        type="text"
                        aria-label="标题(对照组)"
                        placeholder="标题(可以留空)"
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-400 sm:w-56 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                    />
                    <input
                        name="body"
                        type="text"
                        aria-label="正文(对照组)"
                        placeholder="正文(可以留空、可以超长)"
                        className="w-full flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                    />
                    <input
                        name="category"
                        type="text"
                        aria-label="分类(对照组)"
                        placeholder="分类(随便填)"
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-400 sm:w-40 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                    />
                </div>
                <SubmitButton />
            </form>

            {state.submitted && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300">
                    <p className="font-semibold">
                        action 原样收下了这些值(没有任何报错):
                    </p>
                    <pre className="mt-2 overflow-x-auto rounded-lg bg-neutral-900 p-3 font-mono text-[11px] text-neutral-100 dark:bg-neutral-950">
{JSON.stringify(state.received, null, 2)}
                    </pre>
                    <p className="mt-2">
                        如果这是真实应用,这条「文章」已经进库了 ——
                        空标题、任意分类、超长正文,全部合法。
                    </p>
                </div>
            )}
        </div>
    );
}
