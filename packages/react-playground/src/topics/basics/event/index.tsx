/**
 * ============================================================================
 * 事件与合成事件 — React 基础专题
 * ============================================================================
 *
 * 从 SyntheticEvent 封装与 root 委托机制出发,覆盖冒泡/捕获与两个「阻止」、
 * 合成事件与原生事件混用的生产坑、事件池化/onChange 语义/不冒泡事件/Portal
 * 冒泡等面试高频 Case,最后落到状态批处理与工程最佳范式。
 *
 * @module topics/basics/event
 */

import { memo } from 'react';
import { Link } from 'react-router-dom';

import { TopicPage, TopicSection } from '../../../components/TopicPage';
import { CodeBlock } from '../../../components/CodeBlock';
import { Diagram } from '../../../components/Diagram';
import { SyntheticInspectDemo } from './components/SyntheticInspectDemo';
import { BubblingDemo } from './components/BubblingDemo';
import { NativeMixDemo } from './components/NativeMixDemo';
import { PoolingHistoryDemo } from './components/PoolingHistoryDemo';
import { SpecialCasesDemo } from './components/SpecialCasesDemo';
import { BatchingDemo } from './components/BatchingDemo';

const EventTopic = memo(() => {
    return (
        <TopicPage
            title="事件与合成事件"
            description="从 SyntheticEvent 封装与 root 委托机制,到冒泡/捕获、原生混用、池化与 Portal 等面试高频坑,再到状态批处理与工程最佳范式"
        >
            {/* Section 1:合成事件是什么 + 委托机制 */}
            <TopicSection
                title="合成事件是什么 + 委托机制"
                note="讲解要点:React 处理器拿到的是跨浏览器统一封装的 SyntheticEvent,原生事件在 e.nativeEvent 上;React 17+ 把所有监听委托到 root container(16 及以前是 document),事件触发后按组件树模拟捕获→冒泡分发。生产要点:委托让动态增删的节点无需重新绑定监听,节省内存,也为统一治理(埋点/全局拦截)提供了挂点。"
            >
                <div className="space-y-4">
                    <SyntheticInspectDemo />
                    <Diagram caption="React 17+ 事件委托模型">
                        {`原生事件在 root container 被 React 的统一监听器截获
                │
                ▼
┌─────────────────────────────────────┐
│  root container(createRoot 挂载节点) │ ← React 17+ 监听挂在这里
└─────────────────────────────────────┘   React 16 及以前挂在 document
                │ 按「组件树」模拟完整传播链,分发 SyntheticEvent
                ▼
捕获阶段:App → Layout → Button    onClickCapture(外 → 内)
目标阶段:Button                   先 Capture 后 Bubble
冒泡阶段:Button → Layout → App    onClick(内 → 外)`}
                    </Diagram>
                </div>
            </TopicSection>

            {/* Section 2:冒泡、捕获与两个「阻止」 */}
            <TopicSection
                title="冒泡、捕获与两个「阻止」"
                note="讲解要点:React 模拟了完整传播链 —— onClickCapture 由外而内,onClick 由内而外,日志序号即真实执行顺序。面试点:处理器里 return false 完全无效(那是 jQuery / 内联 onxxx 的遗风),必须显式 e.preventDefault();stopPropagation 只阻断继续传播、不影响默认行为,两者相互独立、互不替代。"
            >
                <div className="space-y-4">
                    <BubblingDemo />
                    <CodeBlock
                        title="两个「阻止」的正确姿势"
                        code={`// ❌ 错误:return false 在 React 中什么都不阻止
<button onClick={() => false}>默认行为照常,冒泡照常</button>

// ✅ 正确:两个「阻止」各司其职
const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();   // 阻止默认行为(跳转/表单提交),不影响传播
    e.stopPropagation();  // 阻止继续传播(父级收不到),不影响默认行为
};`}
                    />
                </div>
            </TopicSection>

            {/* Section 3:合成事件 × 原生事件混用 */}
            <TopicSection
                title="合成事件 × 原生事件混用(生产高频坑)"
                note="根因:React 的 stopPropagation 最终会调用原生 stopPropagation;而 React 委托在 root,事件在抵达 document 前就被阻断,document 上的原生监听(及第三方库的全局监听)收不到。最佳范式:跨系统(原生/合成/第三方库)协作时,用「目标判断」(ref.contains(e.target))代替「传播阻断」,谁也不用猜谁会拦事件。"
            >
                <NativeMixDemo />
            </TopicSection>

            {/* Section 4:特殊场景与面试 Case(上) */}
            <TopicSection
                title="特殊场景(上):事件池化 & onChange 语义陷阱"
                note="面试点 a:React 16 及以前 SyntheticEvent 会被池化复用,事件分发完属性即被置 null,异步访问必须先 e.persist();React 17+ 已移除池化(e.persist 成空操作),下方 demo 异步读取完全正常。面试点 b:React 的 onChange 实际是原生 input 事件,每次键入即触发;原生 change 要等 blur 且值变化才触发 —— 混用两套监听时时机完全不同。"
            >
                <div className="space-y-4">
                    <PoolingHistoryDemo />
                    <CodeBlock
                        title="事件池化:新旧写法对比"
                        code={`// React 16 及以前:异步访问前必须先 persist,否则读到 null
function handleClick(e) {
    setTimeout(() => console.log(e.type), 500); // null!事件对象已被回收复用
    e.persist(); // 把事件从池中取出,异步代码才能安全读取
}

// React 17+:池化已移除,直接异步读取即可
function handleClick(e) {
    setTimeout(() => console.log(e.type), 500); // "click",一切正常
}`}
                    />
                </div>
            </TopicSection>

            {/* Section 5:特殊场景与面试 Case(下) */}
            <TopicSection
                title="特殊场景(下):不冒泡事件 & Portal 冒泡"
                note="面试点 a:scroll 不冒泡,React 也不为它模拟冒泡,父级 onScroll 永远收不到子容器滚动;focus/blur 原生不冒泡,但 React 用捕获模拟了冒泡,所以 onFocus 可以写在父级做委托。面试点 b(最经典):Portal 里的合成事件沿 React 组件树而非 DOM 树冒泡 —— 渲染到 body 下的按钮,DOM 父级原生监听收不到,React 父组件 onClick 照样收到;做浮层/弹窗时这决定了事件该不该防穿透。"
            >
                <SpecialCasesDemo />
            </TopicSection>

            {/* Section 6:状态批处理与工程范式 */}
            <TopicSection
                title="事件中的状态批处理与工程范式"
                note="讲解要点:React 18+ 自动批处理 —— 事件、setTimeout、Promise 里的多次 setState 都合并为一次渲染(18 之前仅事件内批处理,setTimeout 里会渲染 3 次,面试常考)。工程范式:处理器用 handleXxx 语义化命名;利用 root 委托 + data-track 属性做统一埋点;scroll/mousemove 等高频事件必须节流;传给 memo 子组件的处理器用 useCallback 稳定身份。"
            >
                <div className="space-y-4">
                    <BatchingDemo />
                    <CodeBlock
                        title="工程范式速查"
                        code={`// 1. 语义化命名:组件内处理器 handleXxx,对外的 props onXxx
const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); ... };
<Form onSubmit={handleSubmit} />

// 2. 统一埋点:借 root 委托读 data-track,业务代码零侵入
root.addEventListener('click', (e) => {
    const el = (e.target as HTMLElement).closest('[data-track]');
    if (el) report(el.dataset.track);
});

// 3. 高频事件(scroll / mousemove / resize)必须节流
const handleScroll = throttle(() => { ... }, 100);

// 4. 传给 memo 子组件的处理器,用 useCallback 稳定身份
const handleSelect = useCallback((id: string) => { ... }, []);
<MemoList onSelect={handleSelect} />`}
                    />
                    <p className="text-xs text-gray-400 dark:text-slate-500">
                        useCallback 的完整推演见
                        <Link
                            to="/hooks/use-callback"
                            className="mx-1 text-primary-600 hover:underline dark:text-primary-400"
                        >
                            useCallback 专题
                        </Link>
                        。
                    </p>
                </div>
            </TopicSection>
        </TopicPage>
    );
});

EventTopic.displayName = 'EventTopic';

export default EventTopic;
