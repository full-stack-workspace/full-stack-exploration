/**
 * ============================================================================
 * Error Boundary — 进阶专题
 * ============================================================================
 *
 * 从「没接住就整树卸载」出发,讲透 class 边界的两条生命周期、捕获范围、
 * 嵌套粒度与恢复策略,再落到本仓库 AppErrorBoundary 的分层实践,以及
 * React 19 根级 onCaughtError 与 Suspense 的分工。
 *
 * 每个 TopicSection 均为「交互 Demo 或对照 + CodeBlock/Diagram + 讲解要点 note」。
 *
 * @module topics/advanced/error-boundary
 */

import { memo } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { CodeBlock } from '../../../components/CodeBlock';
import { Diagram } from '../../../components/Diagram';
import { FlowList, type FlowStep } from '../../../components/FlowList';
import { TopicPage, TopicSection } from '../../../components/TopicPage';
import { CatchScopeDemo } from './components/CatchScopeDemo';
import { IsolationDemo } from './components/IsolationDemo';
import { NestedGranularityDemo } from './components/NestedGranularityDemo';
import { ResetRecoveryDemo } from './components/ResetRecoveryDemo';
import { RethrowDemo } from './components/RethrowDemo';

/* =================================================================
 * 正文辅助
 * ================================================================ */

const P = ({ children }: { children: ReactNode }) => (
    <p className="text-sm leading-relaxed text-gray-600 dark:text-slate-300">{children}</p>
);

const Stack = ({ children }: { children: ReactNode }) => <div className="space-y-4">{children}</div>;

const CATCH_STEPS: FlowStep[] = [
    {
        title: '子树在 render / constructor / 生命周期里 throw',
        hint: '事件处理、setTimeout、Promise 不走这条链,边界看不见它们',
        tone: 'render',
    },
    {
        title: 'React 沿树向上找最近的 Error Boundary',
        hint: '找到就停;找不到则整棵树卸载,并走根级 onUncaughtError(若配置)',
        tone: 'commit',
    },
    {
        title: 'static getDerivedStateFromError(error)',
        hint: '仍在 Render 阶段,必须纯:只返回下一份 state,用来改渲染 fallback',
        tone: 'state',
    },
    {
        title: '用 fallback 提交 DOM',
        hint: '边界以内被替换;边界以外的 Header、兄弟面板保持上一份 UI',
        tone: 'commit',
    },
    {
        title: 'componentDidCatch(error, info)',
        hint: 'Commit 之后才能打日志 / 上报;info.componentStack 指向抛错组件',
        tone: 'effect',
    },
];

/* =================================================================
 * 专题页
 * ================================================================ */

const ErrorBoundaryTopic = memo(() => {
    return (
        <TopicPage
            title="Error Boundary"
            description="捕获渲染期异常、隔离失败半径、按粒度降级与恢复;事件和异步错误必须自己处理,根级回调只负责记账"
        >
            {/* ---------- 1. 问题本质 ---------- */}
            <TopicSection
                title="1. 问题本质:没接住就整树卸载"
                note="讲解要点:React 默认把「渲染期未捕获的 throw」当成不可恢复。没有边界时,根组件被卸掉,用户看到白屏;有边界时,失败被裁切在子树里,其余 UI 继续工作。边界解决的是失败半径,不是让错误消失。"
            >
                <Stack>
                    <Diagram caption="同一处 throw,有没有边界差在失败半径">
                        {`小组件 A render() throw Error
        │
        ├─ 无边界 ──▶ 整棵树卸载 ──▶ 白屏(Header / 路由 / 兄弟全没了)
        │
        └─ 有边界 ──▶ 只替换边界内的 UI ──▶ 页头、侧栏、兄弟面板还在`}
                    </Diagram>
                    <P>
                        本应用的最后一道网在{' '}
                        <code className="rounded bg-gray-100 px-1 font-mono text-xs dark:bg-slate-800">
                            src/monitor/AppErrorBoundary.tsx
                        </code>
                        :它包在 Content 里的 Routes 外,所以专题崩了顶栏和侧栏还在。本页的
                        DemoErrorBoundary 更轻,用来演示「再往下切一刀」时的局部降级。
                    </P>
                </Stack>
            </TopicSection>

            {/* ---------- 2. 捕获链路 ---------- */}
            <TopicSection
                title="2. 捕获链路:从 throw 到 fallback"
                note="讲解要点:边界不是 try/catch 语法糖。它只挂钩子树的渲染阶段;getDerivedStateFromError 决定画什么,componentDidCatch 决定记什么。两者时机不同,不能互相替代。"
            >
                <FlowList steps={CATCH_STEPS} />
            </TopicSection>

            {/* ---------- 3. 两个生命周期 ---------- */}
            <TopicSection
                title="3. 两个生命周期,为什么必须是 class"
                note="讲解要点:截至 React 19.2,官方仍没有函数组件等价 API。社区包 react-error-boundary 底下也是 class。根级 onCaughtError 只是统一上报通道,不能渲染 fallback。getDerivedStateFromError 必须纯;副作用(Sentry / 日志)只能放 componentDidCatch。"
            >
                <Stack>
                    <CodeBlock
                        title="topics/advanced/error-boundary/components/DemoErrorBoundary.tsx"
                        code={`class DemoErrorBoundary extends Component<Props, { error: Error | null }> {
    static getDerivedStateFromError(error: Error) {
        return { error }; // Render 阶段:只更新 state,禁止 console / fetch
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error(error, info.componentStack); // Commit 阶段:上报
    }

    render() {
        if (this.state.error) return <Fallback error={this.state.error} />;
        return this.props.children;
    }
}`}
                    />
                    <P>
                        只写 componentDidCatch 再 setState,fallback 会晚一拍,破碎 UI
                        可能先被提交。只写 getDerivedStateFromError,用户能看到降级,但错误不会被上报。生产代码两条都要。
                    </P>
                </Stack>
            </TopicSection>

            {/* ---------- 4. 捕获范围 ---------- */}
            <TopicSection
                title="4. 捕获范围:什么接得住,什么接不住"
                note="讲解要点:边界的捕获面 = 子树在 React 调用栈里同步抛出的错。事件处理、定时器、Promise 已经离开那次渲染调用栈,边界无从拦截。边界自己的 render 抛错要靠外层再包一层。"
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-gray-100 text-gray-400 dark:border-slate-800 dark:text-slate-500">
                                <th className="py-2 pr-4 font-medium">来源</th>
                                <th className="py-2 pr-4 font-medium">边界接得住?</th>
                                <th className="py-2 font-medium">正确做法</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 dark:text-slate-300">
                            <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                <td className="py-2 pr-4">render / constructor / 生命周期</td>
                                <td className="py-2 pr-4 font-medium text-emerald-600">是</td>
                                <td className="py-2">Error Boundary 降级 UI</td>
                            </tr>
                            <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                <td className="py-2 pr-4">
                                    <code className="font-mono">use()</code> 抛出的 Error
                                </td>
                                <td className="py-2 pr-4 font-medium text-emerald-600">是</td>
                                <td className="py-2">
                                    与 Suspense 分工:Promise 给 Suspense,Error 给边界
                                </td>
                            </tr>
                            <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                <td className="py-2 pr-4">事件处理(onClick 等)</td>
                                <td className="py-2 pr-4 font-medium text-red-500">否</td>
                                <td className="py-2">就地 try/catch,写成局部错误态</td>
                            </tr>
                            <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                <td className="py-2 pr-4">setTimeout / Promise / async</td>
                                <td className="py-2 pr-4 font-medium text-red-500">否</td>
                                <td className="py-2">catch 后 setState;若要走降级 UI,下一拍再 throw</td>
                            </tr>
                            <tr>
                                <td className="py-2 pr-4">边界自己的 render / 其 fallback</td>
                                <td className="py-2 pr-4 font-medium text-red-500">否</td>
                                <td className="py-2">外层再包一层;本应用全局网就是干这个的</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </TopicSection>

            {/* ---------- 5. 局部隔离演示 ---------- */}
            <TopicSection
                title="5. 演示:局部崩溃,局部降级"
                note="玩法:把左侧计数加到 3。A 被自己的边界替换成错误提示,右侧 B 和本页其他分区都应还能点。这就是「失败半径被裁切」。重置左侧会换 key 重挂 A,计数归零。"
            >
                <IsolationDemo />
            </TopicSection>

            {/* ---------- 6. 三类 throw 对照 ---------- */}
            <TopicSection
                title="6. 演示:渲染期 vs 事件 vs 异步"
                note="玩法:三个按钮各点一次。只有「渲染期 throw」会把虚线框换成 fallback;后两个会在下方出现「边界没有介入」——错误被按钮自己的 try/catch 接住,组件继续活着。生产里事件和异步本来就该这么写,不要指望边界。"
            >
                <Stack>
                    <CatchScopeDemo />
                    <CodeBlock
                        title="事件处理必须自己接,不能指望边界"
                        code={`// ✗ 边界看不见这次 throw,组件也不会被降级
<button onClick={() => { throw new Error('boom'); }} />

// ✓ 事件里就地处理,写成可展示的局部状态
<button onClick={() => {
    try { submit(); }
    catch (error) { setFormError(error.message); }
}} />`}
                    />
                </Stack>
            </TopicSection>

            {/* ---------- 7. 异步送回渲染树 ---------- */}
            <TopicSection
                title="7. 演示:把异步错误送回渲染树"
                note="讲解要点:请求失败默认不该炸整块面板,组件内 Alert 通常就够。只有「这块 UI 已经无法继续有意义地渲染」(依赖的数据契约破了、第三方编辑器挂了)才值得 rethrow 进边界。开关打开:catch 后 setState(Error),下次 render throw,边界接管。开关关闭:只在组件内提示。"
            >
                <Stack>
                    <RethrowDemo />
                    <CodeBlock
                        title="catch → state → render 再 throw"
                        code={`function Panel() {
    const [error, setError] = useState<Error | null>(null);
    if (error) throw error; // 回到渲染调用栈,最近的边界才能看见

    async function load() {
        try { await fetchStock(); }
        catch (caught) {
            setError(caught instanceof Error ? caught : new Error(String(caught)));
        }
    }
}`}
                    />
                </Stack>
            </TopicSection>

            {/* ---------- 8. 粒度 ---------- */}
            <TopicSection
                title="8. 粒度:嵌套边界 vs 全局兜底"
                note="玩法:默认细粒度,把面板 A 加到 2 —— B 还在。关掉开关变成整块一块边界,再引爆 A —— A、B 一起消失。工程上通常叠三层:应用壳(本仓库 AppErrorBoundary)→ 路由/专题 → 高风险小组件(图表、编辑器、第三方 SDK)。不要给每个按钮包边界,也不要只留最外一层。"
            >
                <Stack>
                    <NestedGranularityDemo />
                    <Diagram caption="本仓库实际放置(App.tsx)">
                        {`Layout
├─ Header / Sider          ← 边界外,专题崩溃时仍可导航离开
└─ Content
   └─ AppErrorBoundary     ← 最后一道网,fallback 是整页 Result + 刷新
      └─ Routes / 专题页
         └─ DemoErrorBoundary  ← 本页演示:再切一刀,只降级一个面板`}
                    </Diagram>
                    <P>
                        全局边界的 fallback 适合「刷新页面」;局部边界的 fallback 适合「重试这块」。粒度选错的典型症状:一张坏图表把整个工作台换成刷新按钮。
                    </P>
                </Stack>
            </TopicSection>

            {/* ---------- 9. 恢复 ---------- */}
            <TopicSection
                title="9. 恢复:清错误态不够,必须撤掉抛错条件"
                note="玩法:两栏都用 props 引爆,再各自点重置。左栏父级 armed 仍为 true,子树一挂上就再 throw,看起来重置无效。右栏重置时同时把 armed 设回 false,真正恢复。内部 state 导致的 throw 往往「只重置就能好」—— fallback 期间子树已卸载,再挂是新实例。key 重置真正有用的是「抛错条件在父级 props / 路由参数上」。"
            >
                <Stack>
                    <ResetRecoveryDemo />
                    <CodeBlock
                        title="重置 = 清边界 state + 让子树回到可渲染条件"
                        code={`// 边界内部:只负责退出 fallback
handleReset() {
    this.setState({ error: null });
    this.props.onReset?.();
}

// ✗ 父级仍传入必炸 props → 下一拍立刻再挂
<DemoErrorBoundary>
    <Panel userId={invalidId} />
</DemoErrorBoundary>

// ✓ 重置时把条件撤掉,或换到一份可渲染的数据
<DemoErrorBoundary onReset={() => setUserId(validId)}>
    <Panel userId={userId} />
</DemoErrorBoundary>

// react-error-boundary 的 resetKeys 是同一思路:
// 依赖变化时自动清错误态,前提是新 key 对应的数据已经可渲染`}
                    />
                    <P>
                        和列表专题「用 key 重置内部 state」是同一条机制,但要用在刀刃上:边界已经把子树卸掉时,再给内部 state
                        型炸弹换 key 是多余的;父级非法 props、坏掉的路由 id,才需要在 onReset 里改数据。相关范式见{' '}
                        <Link
                            className="text-primary-600 underline-offset-2 hover:underline"
                            to="/basics/list-key"
                        >
                            列表与 key
                        </Link>
                        。
                    </P>
                </Stack>
            </TopicSection>

            {/* ---------- 10. Suspense 分工 ---------- */}
            <TopicSection
                title="10. 与 Suspense 的分工"
                note="讲解要点:子树 throw 的值类型决定谁接手。Promise → 最近的 Suspense 显示 fallback;Error → 最近的 Error Boundary 显示降级 UI。两者常常包同一块数据区:先 Suspense 等数据,再边界接失败。不要用边界模拟 loading,也不要用 Suspense 吞真正的错误。"
            >
                <Stack>
                    <Diagram caption="throw 的是 Promise 还是 Error">
                        {`use() / 数据读取
        │
        ├─ throw promise  ──▶ <Suspense fallback={<Skeleton />}>
        │
        └─ throw error    ──▶ <ErrorBoundary fallback={<Failed />}>

推荐套法(由外到内):
<ErrorBoundary>          // 失败:降级
  <Suspense fallback>    // 等待:骨架
    <Panel />            // 真正读数据
  </Suspense>
</ErrorBoundary>`}
                    </Diagram>
                    <P>
                        本仓库渲染调度专题把「Suspense 与 transition 如何避免回退闪烁」讲透了,本页只划清边界:loading 不是 error。对照见{' '}
                        <Link
                            className="text-primary-600 underline-offset-2 hover:underline"
                            to="/performance/suspense-ui"
                        >
                            Suspense 与 UI 回退
                        </Link>
                        。
                    </P>
                </Stack>
            </TopicSection>

            {/* ---------- 11. React 19 根级回调 ---------- */}
            <TopicSection
                title="11. React 19 根级回调:记日志,不替代边界"
                note="讲解要点:createRoot 的 onCaughtError / onUncaughtError / onRecoverableError 是统一上报口,不是第二套 UI 通道。没有 Error Boundary,onCaughtError 不会因为你写了回调就凭空出现 fallback。本应用 src/index.tsx 目前只 createRoot(el),尚未接入这三项,上报仍分散在各边界的 componentDidCatch。"
            >
                <CodeBlock
                    title="src/index.tsx 可对照添加(本仓库暂未接入)"
                    code={`createRoot(rootEl, {
    onCaughtError(error, errorInfo) {
        // 已被 Error Boundary 接住:与 componentDidCatch 互补,适合统一上报
        report(error, { source: 'caught', ...errorInfo });
    },
    onUncaughtError(error, errorInfo) {
        // 没有边界接住:事件处理、根外 throw 等;仍不会自动画出 fallback
        report(error, { source: 'uncaught', ...errorInfo });
    },
    onRecoverableError(error, errorInfo) {
        // React 自己恢复了(常见于 hydration 不一致),用户可能只看到闪一下
        report(error, { source: 'recoverable', ...errorInfo });
    },
});`}
                />
            </TopicSection>

            {/* ---------- 12. 落地实践 ---------- */}
            <TopicSection
                title="12. 落地实践:放哪、怎么降级、怎么上报"
                note="工程清单:分层放置、fallback 按半径说话、上报去重、测试要压住 React 的 console.error。CSR 单页(本包)没有 Next.js error.tsx;那是路由级约定,语义相同但不是 class 边界本身。"
            >
                <Stack>
                    <CodeBlock
                        title="速查清单"
                        code={`// 1. 分层,而不是二选一
//    壳层:保导航(本仓库 AppErrorBoundary 包 Routes,不包 Header)
//    路由/专题:一张坏页不要带走整个工作台
//    小组件:图表 / 富文本 / 第三方 SDK 各自一网

// 2. fallback 按失败半径说话
//    壳层 → 「刷新页面」;局部 → 「重试这块」+ 简短原因
//    不要把 componentStack 直接画给终端用户

// 3. 上报
//    componentDidCatch + 根级 onCaughtError 二选一做主通道,避免同一错报两次
//    去掉 token / 邮箱等 PII;开发环境 StrictMode 可能让首次多记一次

// 4. 测试
//    用会 throw 的子组件驱动 fallback;vi.spyOn(console, 'error') 压住 React 日志
//    断言「兄弟节点还在」,而不只断言「出错文案出现了」

// 5. 不要做的事
//    用边界吞表单校验;用边界替代请求的 error state
//    给每个 Button 包一层;只留根上一个边界`}
                    />
                    <ul className="space-y-1.5 text-xs leading-relaxed text-gray-500 dark:text-slate-400">
                        <li className="flex gap-2">
                            <span className="text-primary-500">▸</span>
                            fallback 要可操作:至少提供重置 / 回首页 / 刷新之一,并保证操作真能改变抛错条件。
                        </li>
                        <li className="flex gap-2">
                            <span className="text-primary-500">▸</span>
                            第三方组件当它会在 render 里 throw 来对待,包边界,不要假设作者已经处理。
                        </li>
                        <li className="flex gap-2">
                            <span className="text-primary-500">▸</span>
                            Next.js App Router 的 error.tsx / global-error.tsx 是框架帮你放好的路由级边界,心智与本页相同,API 不同。
                        </li>
                    </ul>
                </Stack>
            </TopicSection>

            {/* ---------- 13. 坑与面试点 ---------- */}
            <TopicSection
                title="13. 常见坑与面试点"
                note="面试点:a) 为什么没有 useErrorBoundary Hook?因为要拦截的是子树渲染期的 throw,函数组件没有对应的生命周期挂钩;b) 事件里 throw 为什么白屏不出现?因为根本没进入边界通道;c) 重置后立刻又挂,多半是父级 props / 路由参数仍满足抛错条件,不是按钮没点上。"
            >
                <Stack>
                    <CodeBlock
                        title="五条高频事故"
                        code={`// ① 以为 onClick throw 会被边界接住
//    事实:事件在 React 调用栈外,走 onUncaughtError,UI 原地不动

// ② 重置只清了 hasError,父级仍传入非法 props
//    事实:子树一挂上就再 throw,用户觉得按钮坏了
//    内部 state 型炸弹往往「只重置就好」,因为 fallback 期间子树已卸载

// ③ 边界包得太高
//    事实:一张坏图把整个后台换成刷新页,操作台里其他表单一起死

// ④ fallback 自己又 throw
//    事实:当前边界接不住自己,必须靠外层;fallback 要尽可能钝、无数据依赖

// ⑤ 用边界表示「没登录 / 校验失败」
//    事实:那是控制流,不是渲染崩溃。用条件渲染或路由守卫,不要 throw`}
                    />
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-gray-100 text-gray-400 dark:border-slate-800 dark:text-slate-500">
                                    <th className="py-2 pr-4 font-medium">文件</th>
                                    <th className="py-2 font-medium">职责</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 dark:text-slate-300">
                                <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                    <td className="py-2 pr-4 font-mono">monitor/AppErrorBoundary.tsx</td>
                                    <td className="py-2">应用级最后一道网,fallback 为整页刷新</td>
                                </tr>
                                <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                    <td className="py-2 pr-4 font-mono">error-boundary/components/DemoErrorBoundary.tsx</td>
                                    <td className="py-2">本页演示边界:分区名 + 重置 + onCatch</td>
                                </tr>
                                <tr>
                                    <td className="py-2 pr-4 font-mono">App.tsx</td>
                                    <td className="py-2">边界包 Routes、不包 Header/Sider,导航在崩溃后仍可用</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Stack>
            </TopicSection>
        </TopicPage>
    );
});

ErrorBoundaryTopic.displayName = 'ErrorBoundaryTopic';

export default ErrorBoundaryTopic;
