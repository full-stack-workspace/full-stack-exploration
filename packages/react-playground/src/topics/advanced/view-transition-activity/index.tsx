/**
 * ============================================================================
 * ViewTransition 与 Activity — React 19.2 新组件专题
 * ============================================================================
 *
 * React 19.2 带来的两个新组件:
 * - <ViewTransition>:声明式视图过渡动画 —— 基于浏览器 View Transitions
 *   API 的 React 编排层,当前(19.2.4 stable)尚未导出,本专题以
 *   「手动 CSS 对照 + 代码示意 + 版本标注」讲解;
 * - <Activity>:隐藏保活 —— 已在 19.2 stable 导出,本专题以三栏对照
 *   实验(条件卸载 vs display:none vs Activity)让差异可感知;
 * 最后收口为「隐藏面板选型 + ViewTransition 定位」的决策指南。
 *
 * @module topics/advanced/view-transition-activity
 */

import { memo } from 'react';

import { TopicPage, TopicSection } from '../../../components/TopicPage';
import { CodeBlock } from '../../../components/CodeBlock';
import { Diagram } from '../../../components/Diagram';
import { ManualTransitionDemo } from './components/ManualTransitionDemo';
import { TransitionTypePlayground } from './components/TransitionTypePlayground';
import { ActivityLab } from './components/ActivityLab';

const ViewTransitionActivityTopic = memo(() => {
    return (
        <TopicPage
            title="ViewTransition 与 Activity"
            description="React 19.2 的两个新组件:声明式视图过渡 <ViewTransition>(实验通道,代码示意)与隐藏保活 <Activity>(已稳定,三栏对照实验)"
        >
            {/* Section 1:ViewTransition 基础 —— 手动 CSS 对照 + 代码示意 */}
            <TopicSection
                title="ViewTransition 基础:声明式过渡 vs 手动 CSS"
                note="讲解要点:手动方案(下方 Demo)用「key 重挂载 + keyframes」模拟入场动画,动画与数据更新解耦 —— 只有「进场」,管不了出场、共享元素与列表重排。<ViewTransition> 把动画挂到 React 的提交阶段:更新被 startTransition 包裹时,被包裹的子树自动获得进入 / 退出 / 更新过渡。⚠️ 可用性:本仓库 react@19.2.4 stable 未导出 ViewTransition(仅 react@experimental 通道,types 在 @types/react/experimental),下方为代码示意,不实际运行。"
            >
                <div className="space-y-4">
                    <ManualTransitionDemo />
                    <CodeBlock
                        title="ViewTransition 写法示意(react@experimental,19.2 stable 未导出)"
                        code={`// ⚠️ 以下 import 在当前 19.2.4 stable 中会得到 undefined,
//    仅在 react@experimental 通道可用:
import { unstable_ViewTransition as ViewTransition, startTransition } from 'react';

function TabContainer() {
    const [tab, setTab] = useState('list');
    return (
        {/* 声明式包裹:子树的进入 / 退出 / 更新自动获得过渡动画 */}
        <ViewTransition>
            <div key={tab}>{tab === 'list' ? <ListView /> : <DetailView />}</div>
        </ViewTransition>
    );
}

// 更新用 startTransition 标记为非紧急,ViewTransition 随之编排动画
startTransition(() => setTab('detail'));

// 与手动 CSS 的本质差异:
// 手动 keyframes 只有「挂载入场」一种视角;ViewTransition 由浏览器
// View Transitions API 捕获旧 / 新两份快照,enter / exit / update /
// share(共享元素)四类过渡都能声明,且与并发渲染节奏一致。`}
                    />
                </div>
            </TopicSection>

            {/* Section 2:addTransitionType —— 按交互类型定制动画 */}
            <TopicSection
                title="addTransitionType:不同交互触发不同动画"
                note="讲解要点:动画该跟着「交互语义」走 —— 前进右滑、后退左滑、展开缩放。下方 Demo 用手动 state + 动画类实现这个效果;addTransitionType 则把「这是什么交互」直接标注到 transition 上,CSS 侧用 :active-view-transition-type() 按类型定制,无需自己维护 action state。⚠️ 可用性:与 ViewTransition 相同,19.2.4 stable 未导出,仅实验通道。"
            >
                <div className="space-y-4">
                    <TransitionTypePlayground />
                    <CodeBlock
                        title="addTransitionType 写法示意(react@experimental,19.2 stable 未导出)"
                        code={`import { unstable_addTransitionType as addTransitionType, startTransition } from 'react';

function navigate(direction: 'forward' | 'back') {
    startTransition(() => {
        // 把交互语义标到本次 transition 上
        addTransitionType(direction === 'forward' ? 'nav-forward' : 'nav-back');
        setPage(direction === 'forward' ? page + 1 : page - 1);
    });
}

/* CSS 侧按类型定制快照动画(浏览器 View Transitions API 语法) */
/*
::view-transition-old(root) { animation: slide-out-left 0.3s; }
::view-transition-new(root) { animation: slide-in-right 0.3s; }

:active-view-transition-type(nav-back)::view-transition-old(root) {
    animation: slide-out-right 0.3s;  // 后退时换方向
}
*/`}
                    />
                </div>
            </TopicSection>

            {/* Section 3:Activity 三栏对照实验 */}
            <TopicSection
                title="Activity 隐藏保活:三栏对照实验"
                note="讲解要点:三栏共享同一个面板(输入框 + 计数器 + effect 心跳定时器),唯一变量是隐藏方式 —— 条件卸载:state 随实例销毁;display:none:state 保留但组件继续渲染、心跳照跑(effect 在隐藏期间仍在工作);Activity mode=hidden:state 与 DOM 保留,effect 被销毁(心跳停、清理函数执行),后台低优先级预渲染,恢复 visible 时 effect 重新挂载、state 原样接上。✅ 可用性:Activity 已在 react@19.2 stable 导出,本实验为真实运行。"
            >
                <ActivityLab />
            </TopicSection>

            {/* Section 4:决策指南 */}
            <TopicSection
                title="决策指南:怎么选、和浏览器 API 什么关系"
                note="讲解要点:隐藏面板的三种策略按「状态 / DOM / 副作用」三问选型;ViewTransition 是浏览器 View Transitions API 的 React 编排层 —— 浏览器 API 管快照与像素动画,React 管「什么时候以什么语义触发」,二者不是替代关系。"
            >
                <div className="space-y-4">
                    <Diagram caption="隐藏一个面板:三种策略对照">
                        {`                    state       DOM        隐藏期间 effect     恢复显示时
条件卸载            销毁        销毁       不存在(组件没了)    从头挂载,状态归零
display:none        保留        保留       照常运行(浪费)     即刻恢复,无副作用中断
<Activity hidden>   保留        保留       销毁(暂停)         effect 重挂,state 接上

选型三问:
Q1 下次显示要不要从零开始?   要 → 条件渲染 {show && <Panel/>}
Q2 状态要留,副作用能一直跑?  能 → display:none(最简单)
Q3 状态要留,副作用该暂停?    是 → <Activity mode="hidden">`}
                    </Diagram>
                    <Diagram caption="ViewTransition 与浏览器 View Transitions API 的关系">
                        {`浏览器 View Transitions API(底层能力)
  document.startViewTransition(() => 改 DOM)
  → 浏览器捕获旧 / 新快照,像素级交叉淡变 / 位移
  ✘ 与 React 渲染节奏无关:回调里同步改 DOM,和 React 的
    并发提交可能撕裂;动画语义要自己维护

React <ViewTransition>(编排层,实验通道)
  声明式包裹子树,startTransition 更新即自动编排过渡
  ✔ 快照时机与 React commit 对齐,不会拍到「半个 UI」
  ✔ addTransitionType 把交互语义带给 CSS
  ✔ enter / exit / update / share 四类过渡自动配对`}
                    </Diagram>
                    <ul className="space-y-1.5 text-xs leading-relaxed text-gray-500 dark:text-slate-400">
                        <li className="flex gap-2">
                            <span className="text-primary-500">▸</span>
                            ViewTransition 适合「状态切换本身值得动画」的场景:路由 / Tab 切换、列表重排、共享元素转场;简单 hover、进场动画用 CSS transition/animation 就够了。
                        </li>
                        <li className="flex gap-2">
                            <span className="text-primary-500">▸</span>
                            Activity 的典型场景:Tab 保活(切走暂停数据轮询)、折叠面板里的重组件、预渲染用户下一步最可能进入的页面。
                        </li>
                        <li className="flex gap-2">
                            <span className="text-primary-500">▸</span>
                            浏览器 View Transitions API 本身已可直接用(Chromium / Safari 18+),不等 React 也能写 —— 但要自己处理快照时机与 React 提交的对齐问题。
                        </li>
                        <li className="flex gap-2">
                            <span className="text-primary-500">▸</span>
                            版本现状(react@19.2.4):Activity 已稳定导出;ViewTransition 与 addTransitionType 仍在 experimental 通道,生产使用需等待 stable 或固定 experimental 版本。
                        </li>
                    </ul>
                </div>
            </TopicSection>
        </TopicPage>
    );
});

ViewTransitionActivityTopic.displayName = 'ViewTransitionActivityTopic';

export default ViewTransitionActivityTopic;
