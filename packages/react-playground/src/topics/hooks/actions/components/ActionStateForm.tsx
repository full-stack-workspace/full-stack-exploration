/**
 * ============================================================================
 * ActionStateForm.tsx — Section 2:useActionState 评论表单
 * ============================================================================
 *
 * useActionState 把「action 的返回值」变成一份 state:每次 action 跑完,
 * 返回值替换旧 state 并触发重渲染。适合「提交结果要回显」的表单 ——
 * 校验错误、服务端拒绝、提交后的新数据,都走同一条 state 通道。
 *
 * 本演示:评论框。空评论本地校验直接返回错误(不走网络);
 * 内容含「失败」二字模拟服务端拒绝,错误回显在表单上方。
 *
 * @module topics/hooks/actions/components/ActionStateForm
 */

import { memo, useActionState } from 'react';

import { mockRequest } from '../mock';

/** action 的返回值模型:成功/失败都通过它回显 */
interface CommentState {
    status: 'idle' | 'success' | 'error';
    message: string;
    comments: string[];
}

const INITIAL_STATE: CommentState = { status: 'idle', message: '', comments: [] };

interface ActionStateFormProps {
    /** 人为网络延迟(ms),页面用默认值,测试传小值 */
    delay?: number;
}

export const ActionStateForm = memo(({ delay = 800 }: ActionStateFormProps) => {
    // [当前 state, 传给 form 的 action, action 是否进行中]
    // action 签名固定为 (prevState, formData) => newState
    const [state, formAction, isPending] = useActionState(
        async (prev: CommentState, formData: FormData): Promise<CommentState> => {
            const text = String(formData.get('comment') ?? '').trim();

            // 本地校验:直接 return 错误 state,不发请求也不 throw
            // —— throw 会把错误抛给最近的 Error Boundary,而不是回显到表单
            if (!text) {
                return { ...prev, status: 'error', message: '评论不能为空' };
            }

            await mockRequest({ delay });

            // 模拟服务端校验失败:同样以「返回错误 state」的方式回显
            if (text.includes('失败')) {
                return { ...prev, status: 'error', message: '服务端拒绝了这条评论(内容含「失败」)' };
            }

            return {
                status: 'success',
                message: '发布成功',
                comments: [...prev.comments, text],
            };
        },
        INITIAL_STATE,
    );

    return (
        <div className="grid gap-4 lg:grid-cols-2">
            <form action={formAction} aria-label="useActionState 评论表单" className="space-y-3">
                <textarea
                    name="comment"
                    rows={3}
                    required
                    placeholder="写下一条评论(输入「失败」二字可触发服务端拒绝)"
                    aria-label="评论内容"
                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-primary-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                />
                <div className="flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="rounded-md bg-primary-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isPending ? '发布中…' : '发布评论'}
                    </button>
                    <span className="text-xs text-gray-400 dark:text-slate-500">
                        isPending = {String(isPending)}(useActionState 第三个返回值)
                    </span>
                </div>

                {/* 错误 / 成功都从同一个 state 回显 */}
                {state.status === 'error' && (
                    <p
                        role="alert"
                        className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400"
                    >
                        {state.message}
                    </p>
                )}
                {state.status === 'success' && (
                    <p role="status" className="text-xs text-green-600 dark:text-green-400">
                        {state.message}
                    </p>
                )}
            </form>

            <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-slate-200">
                    已发布评论({state.comments.length})
                </p>
                {state.comments.length > 0 ? (
                    <ul className="space-y-1.5" aria-label="评论列表">
                        {state.comments.map((c, i) => (
                            <li
                                key={`${c}-${i}`}
                                className="rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300"
                            >
                                {c}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-xs text-gray-400 dark:text-slate-500">
                        还没有评论。失败时列表保持原样 —— 因为错误分支返回的 state 沿用了 prev.comments。
                    </p>
                )}
            </div>
        </div>
    );
});

ActionStateForm.displayName = 'ActionStateForm';
