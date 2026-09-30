/**
 * ============================================================================
 * React 19 Actions — Hooks 专题
 * ============================================================================
 *
 * React 19 把「数据变更(mutation)」升格为框架的一等公民:form action、
 * useActionState、useOptimistic、useFormStatus 四件套覆盖了一次提交从
 * 发起到回显的完整生命周期 —— 收集数据、pending、结果/错误回显、乐观更新。
 *
 * 本站是 createRoot SPA(无服务端),所有演示用 mock 异步函数 +
 * 人为延迟 + 可注入失败驱动;行为语义与生产中的 Actions 完全一致。
 *
 * @module topics/hooks/actions
 */

import { memo } from 'react';

import { TopicPage, TopicSection } from '../../../components/TopicPage';
import { CodeBlock } from '../../../components/CodeBlock';
import { Diagram } from '../../../components/Diagram';
import { FormActionBasic } from './components/FormActionBasic';
import { ActionStateForm } from './components/ActionStateForm';
import { OptimisticLists } from './components/OptimisticLists';
import { FormStatusDemo } from './components/FormStatusDemo';

const ActionsTopic = memo(() => {
    return (
        <TopicPage
            title="React 19 Actions"
            description="form action / useActionState / useOptimistic / useFormStatus:React 19 把一次数据提交的收集、pending、结果回显与乐观更新全部收进框架,SPA 环境用 mock 异步函数演示完整语义"
        >
            {/* Section 1:form action 基础 —— ❌ 手动 onSubmit vs ✅ form action */}
            <TopicSection
                title="form action 基础:❌ 手动 onSubmit vs ✅ <form action={fn}>"
                note="讲解要点:给 <form> 传一个 action 函数后,React 接管了提交的整条链路 —— 阻止默认跳转、用 FormData 收集非受控字段、把异步过程当一次 Action 追踪、完成后自动重置非受控输入框。左边手动版的四件样板(preventDefault / 受控 state / pending / 手动清空)在右边全部消失,只剩一个 async 函数。"
            >
                <div className="space-y-4">
                    <FormActionBasic />
                    <CodeBlock
                        title="同一个需求,两种写法"
                        code={`// ❌ 手动版:四件样板,漏一件就是一个 bug
const [email, setEmail] = useState('');
const [submitting, setSubmitting] = useState(false);

const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();                 // 1. 阻止默认提交
    setSubmitting(true);                // 2. 自己维护 pending
    try {
        await subscribe(email);         //    取值靠受控 state(第 3 件)
        setEmail('');                   // 4. 成功后手动清空
    } finally {
        setSubmitting(false);           //    finally 复位,漏了按钮永远转圈
    }
};
<form onSubmit={handleSubmit}>
    <input value={email} onChange={(e) => setEmail(e.target.value)} />

// ✅ action 版:取值走 FormData,重置由 React 完成
const subscribeAction = async (formData: FormData) => {
    await subscribe(String(formData.get('email')));
    // 不写清空逻辑:action 完成后非受控表单自动重置
};
<form action={subscribeAction}>
    <input name="email" />              {/* 非受控,挂个 name 即可 */}`}
                    />
                </div>
            </TopicSection>

            {/* Section 2:useActionState —— 携带返回值/错误状态的表单 */}
            <TopicSection
                title="useActionState:让 action 的返回值变成 state"
                note="讲解要点:useActionState(action, initialState) 返回 [state, formAction, isPending] —— action 每次跑完,返回值替换 state 并触发重渲染。校验失败、服务端拒绝这类「需要回显的错误」应该 return 进 state,而不是 throw(throw 会抛给最近的 Error Boundary,表单会被整棵替换)。pending 也不用自己维护,第三个返回值 isPending 就是。"
            >
                <div className="space-y-4">
                    <ActionStateForm />
                    <CodeBlock
                        title="错误回显的标准姿势"
                        code={`const [state, formAction, isPending] = useActionState(
    async (prev: CommentState, formData: FormData) => {
        const text = String(formData.get('comment')).trim();
        // 本地校验:直接 return 错误 state,不发请求
        if (!text) return { ...prev, status: 'error', message: '评论不能为空' };
        await postComment(text).catch(() => null);
        // 服务端拒绝:同样 return 错误 state 回显,而不是 throw
        if (rejected) return { ...prev, status: 'error', message: '服务端拒绝了这条评论' };
        return { status: 'success', message: '发布成功', comments: [...prev.comments, text] };
    },
    { status: 'idle', message: '', comments: [] },
);

<form action={formAction}>
    {state.status === 'error' && <p role="alert">{state.message}</p>}
    <button disabled={isPending}>{isPending ? '发布中…' : '发布评论'}</button>
</form>`}
                    />
                </div>
            </TopicSection>

            {/* Section 3:useOptimistic —— 乐观更新对照实验 */}
            <TopicSection
                title="useOptimistic:乐观更新对照实验(含失败回滚)"
                note="讲解要点:useOptimistic(state, updateFn) 返回一份「投影 state」—— 没有 transition pending 时它就是真实 state;在 Action 内调用 applyOptimistic 后,投影叠加增量立即渲染。关键在失败路径:回滚不需要任何代码,因为真实 state 从未被修改,transition 一结束投影自动回落。对照左边手动版:失败时用户白等了一个延迟的往返。"
            >
                <div className="space-y-4">
                    <OptimisticLists />
                    <Diagram caption="乐观更新的时间线(以点赞为例)">
                        {`点击点赞 ──▶ startTransition(async () => {
                  applyOptimistic(+1)   ← 投影立即 +1,用户零等待
                  await 请求……
              })
                    │
        ┌───────────┴───────────┐
   请求成功                   请求失败
   setMessages(+1)            真实 state 不变
   transition 结束            transition 结束
   投影回落到「已 +1 的       投影回落到「原值」
   真实值」,无缝衔接          = 免费回滚,只补一条提示`}
                    </Diagram>
                    <CodeBlock
                        title="useOptimistic 的三件套"
                        code={`const [messages, setMessages] = useState(initial);
const [optimisticMessages, applyOptimistic] = useOptimistic(
    messages,
    (current, action) => current.map((m) =>
        m.id === action.id ? { ...m, likes: m.likes + 1 } : m),
);

const like = (id: number) => {
    // React 19:async 函数交给 startTransition 即构成一个 Action
    startTransition(async () => {
        applyOptimistic({ type: 'like', id });  // 必须在 Action / transition 内调用
        try {
            await postLike(id);
            setMessages((prev) => /* …真正 +1… */);  // 成功:提交真实值
        } catch {
            // 失败:什么都不用回滚 —— 真实 state 没动过,乐观值自动消失
            setNotice('点赞失败,已自动回滚');
        }
    });
};`}
                    />
                </div>
            </TopicSection>

            {/* Section 4:useFormStatus —— 子组件读取父表单 pending */}
            <TopicSection
                title="useFormStatus:提交按钮自己管理 loading"
                note="讲解要点:useFormStatus(来自 react-dom)读取「最近的祖先 <form>」的提交状态,不需要父组件传 pending。硬性约束是只能向上找 —— 必须拆出渲染在 form 内部的子组件;写在渲染 <form> 的同一个组件里读不到自己的表单。下方的两枚探针是活证据:提交时表单内探针变 true,表单外探针永远 false。"
            >
                <div className="space-y-4">
                    <FormStatusDemo />
                    <CodeBlock
                        title="必须拆成子组件"
                        code={`import { useFormStatus } from 'react-dom';

// ✅ 子组件渲染在 <form> 内部,读到的就是父表单的状态
function SubmitButton() {
    const { pending, data, method } = useFormStatus();
    return <button disabled={pending}>{pending ? '提交中…' : '提交'}</button>;
}

function FeedbackForm() {
    // ❌ 这里调 useFormStatus 读不到下面的 form —— 它只能向上找祖先
    return (
        <form action={submitAction}>
            <textarea name="feedback" />
            <SubmitButton />
        </form>
    );
}`}
                    />
                </div>
            </TopicSection>

            {/* Section 5:决策指南 */}
            <TopicSection
                title="决策指南:Actions、手写状态、服务端边界"
                note="面试点:Actions 不是「新的请求库」,而是把「一次用户提交的完整生命周期」收进框架 —— 它解决的是状态编排,不是数据获取。读取数据仍然用 effect / SWR / Relay;只有「变更」才走 Actions。四件套的选型:提交结果要回显 → useActionState;要即时反馈 → useOptimistic;按钮 loading → useFormStatus;都没有 → 一个裸 action 就够。"
            >
                <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-card border border-green-200 bg-green-50/40 p-4 dark:border-green-900/50 dark:bg-green-950/20">
                            <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                ✅ 用 Actions
                            </p>
                            <ul className="mt-2 space-y-1 text-xs leading-relaxed text-gray-500 dark:text-slate-400">
                                <li>表单提交(登录、评论、设置页)</li>
                                <li>需要 pending / 自动重置 / 错误回显的变更</li>
                                <li>即时反馈场景:点赞、收藏、购物车(useOptimistic)</li>
                                <li>未来要迁到 Server Functions 的代码,客户端写法天然兼容</li>
                            </ul>
                        </div>
                        <div className="rounded-card border border-gray-100 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                            <p className="text-sm font-medium text-gray-700 dark:text-slate-200">
                                手写 useState + onSubmit 仍然合理
                            </p>
                            <ul className="mt-2 space-y-1 text-xs leading-relaxed text-gray-500 dark:text-slate-400">
                                <li>纯本地交互,根本不发起请求</li>
                                <li>需要取消 / 竞态控制 / 进度条等精细编排</li>
                                <li>多步向导里每一步的局部校验与暂存</li>
                                <li>提交语义不典型的 UI(拖拽、画板、快捷键)</li>
                            </ul>
                        </div>
                        <div className="rounded-card border border-amber-200 bg-amber-50/40 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
                            <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                                服务端边界(SPA 读这一段)
                            </p>
                            <ul className="mt-2 space-y-1 text-xs leading-relaxed text-gray-500 dark:text-slate-400">
                                <li>本站是 createRoot SPA,action 里跑的是 mock 异步函数</li>
                                <li>生产中 action 可以换成 Server Function(&apos;use server&apos;),函数体在服务端执行 —— 但这需要 RSC 环境(如 Next.js),客户端写法不变</li>
                                <li>RSC 与客户端组件的边界概念,见进阶分类的「RSC」专题</li>
                            </ul>
                        </div>
                    </div>
                    <CodeBlock
                        title="速查:一次提交该选哪件"
                        code={`// Q1: 表单提交后要用「结果/错误」更新界面?
//   → useActionState:返回值即新 state,错误回显走 return 不走 throw

// Q2: 等待响应的延迟用户能感知,想要「点了就有」?
//   → useOptimistic:Action 内先 applyOptimistic,失败自动回滚(真实 state 别动)

// Q3: 提交按钮要 loading,不想把 pending 一层层传下来?
//   → useFormStatus:拆一个渲染在 <form> 内的子组件自己读

// Q4: 只是想少写样板,结果不需要回显?
//   → 裸 <form action={fn}>:FormData 收集 + 自动重置已经足够

// Q5: 需要取消请求、竞态防抖、上传进度?
//   → 回到手写:useState + onSubmit + AbortController,Actions 不覆盖这类编排

// Q6: 数据「读取」也该用 Actions 吗?
//   → 不该。Actions 管变更(mutation);读取仍是 effect / SWR / Relay 的地盘`}
                    />
                </div>
            </TopicSection>
        </TopicPage>
    );
});

ActionsTopic.displayName = 'ActionsTopic';

export default ActionsTopic;
