/**
 * ============================================================================
 * 原理与架构 · 运行时总览(/architecture/runtime-map)
 * ============================================================================
 *
 * 本系列的地图。先分清三个包、两种树、两个阶段、两套优先级,
 * 后面每一页只展开其中一段。不重复 JSX / Hooks API / RSC 专题。
 *
 * @module topics/architecture/runtime-map
 */

import { memo } from 'react';
import { Link } from 'react-router-dom';

import { TopicPage, TopicSection } from '../../../components/TopicPage';
import { Diagram } from '../../../components/Diagram';
import { FlowList, type FlowStep } from '../../../components/FlowList';
import { P, Stack } from '../components/Prose';
import { SeriesNav } from '../components/SeriesNav';

const PIPELINE: FlowStep[] = [
    {
        title: '产生更新',
        hint: 'setState、父组件重渲染、Context、事件。更新被挂到某条 Lane 上',
        tone: 'state',
    },
    {
        title: '调度',
        hint: 'scheduleUpdateOnFiber 把 Lane 映射成 Scheduler 优先级,登记一个回调',
        tone: 'render',
    },
    {
        title: 'Render',
        hint: '在 workInProgress 树上 beginWork / completeWork。可中断,可整段丢弃',
        tone: 'render',
    },
    {
        title: 'Commit',
        hint: '同步改 DOM、跑 layout effect、切换 current 指针。这一段不能让出',
        tone: 'commit',
    },
    {
        title: '绘制之后',
        hint: 'useEffect 的销毁与创建排到绘制之后,避免挡住这一帧',
        tone: 'effect',
    },
];

const RuntimeMap = memo(() => {
    return (
        <TopicPage
            title="原理与架构 · 运行时总览"
            description="一次更新如何从 setState 走到像素:三个包各管一段,Element 与 Fiber 不是同一种树"
        >
            <SeriesNav current="runtime-map" />

            <TopicSection
                title="1. 这组页讲运行时,不再讲一遍 API"
                note="讲解要点:基础、Hooks、通信专题已经回答「怎么写」。这里回答「运行时里到底有什么结构在动」。"
            >
                <Stack>
                    <P>
                        JSX、列表 key、合成事件的使用坑、渲染调度的产品 API、RSC 与 Client 的边界,练习场里都有专页。
                        内部机制补的是它们共用的那台机器:更新怎样入队、工作怎样被切成小段、副作用何时才许碰 DOM。
                    </P>
                    <P>
                        读的时候抓住四个名字就够了。Reconciler 算「下一棵 UI 该长什么样」;Renderer 把结论翻译成 DOM 或原生控件;Scheduler 决定这段计算什么时候占用主线程;Fiber 是 Reconciler 里的工作单元。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="2. 三个包,三条职责"
                note="讲解要点:react 包几乎只有元素工厂和 Hook 的公开入口。真正的循环在 react-reconciler,时间片在 scheduler,DOM 与事件在 react-dom。"
            >
                <Stack>
                    <Diagram caption="一次更新穿过三个包">
                        {`你的组件
  │  setState / render() 返回 React Element
  ▼
react-reconciler                         scheduler
  Fiber 树 · Lane · beginWork            最小堆 · 5ms 时间片
  completeWork · flags                   MessageChannel 让出主线程
  │                                         ▲
  │  scheduleUpdateOnFiber 把 Lane 映射成优先级
  ▼
react-dom
  mutation:创建/更新/删除 DOM
  事件:在根容器上监听,再沿 Fiber 模拟捕获与冒泡
  hydrateRoot:把已有 DOM 绑回 Fiber,而不是重新创建`}
                    </Diagram>
                    <P>
                        协调器和渲染器拆开,是 React 能同时服务 DOM、React Native 和测试渲染器的原因。调度器再拆出去,是因为「何时让出主线程」不该写死在 Diff 算法里。Native 没有 DOM,仍然走同一套 Reconciler 和 Scheduler。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="3. 一次点击之后,主线程上实际发生的顺序"
                note="讲解要点:Render 可以做很多次、也可以被扔掉。Commit 一次更新只做一遍,而且做完才切换屏幕上的那棵树。"
            >
                <Stack>
                    <FlowList steps={PIPELINE} />
                    <Diagram caption="Render 在副本上算,Commit 才交换指针">
                        {`屏幕上的 current 树          内存里的 workInProgress 树
        │                              │
        │  alternate 成对相连           │  beginWork 向下
        │                              │  completeWork 向上
        │                              │  时间不够 → 暂停,保留进度
        │                              │  更高优先级进来 → 这棵副本可以丢
        └──────── Commit ──────────────┘
                 root.current = finishedWork
                 旧的 current 变成下一轮的 workInProgress`}
                    </Diagram>
                </Stack>
            </TopicSection>

            <TopicSection
                title="4. React Element 不是 Fiber"
                note="讲解要点:口头说的虚拟 DOM,在实现里是这次 render 返回的不可变元素。跨渲染活下来的是 Fiber。"
            >
                <Stack>
                    <P>
                        `react/jsx-runtime` 产出的是普通对象:`type`、`key`、`props`、`ref`。它描述「这一次 UI 应该是什么」,用完就可以丢掉。Fiber 是协调器创建并复用的节点,上面有 `child` / `sibling` / `return`、上次提交的 `memoizedProps` 和 `memoizedState`、以及指向另一棵树的 `alternate`。
                    </P>
                    <P>
                        所以实现并不是「造两棵完整虚拟 DOM,再做一次通用树 Diff」。每次渲染只重新执行走到的组件函数,拿新的 element 和已有 Fiber 比 `type` 与 `key`。能对上就复用 Fiber,改 props;对不上就卸载旧子树、挂上新子树。虚拟 DOM 的价值是声明式和跨平台,不是「JavaScript 对象一定比 DOM 快」。
                    </P>
                    <Diagram caption="同一次渲染里的两种数据">
                        {`组件函数执行
    返回  Element { type: 'div', props }     ← 不可变,描述这一次
              │
              ▼  与已有 Fiber 比较 type + key
         Fiber { memoizedProps, stateNode, child, alternate }
              │
              ▼  Commit 之后
         stateNode 指向真正的 DOM 节点`}
                    </Diagram>
                </Stack>
            </TopicSection>

            <TopicSection
                title="5. 两套优先级各管一段"
                note="讲解要点:Lane 决定哪些更新进入这一轮，Scheduler 决定何时把主线程还回去。失败模式在 Scheduler 页。"
            >
                <Stack>
                    <P>
                        Lane 决定哪些更新进入这一轮，Scheduler 决定这一轮什么时候把主线程还回去。两种失败模式写在
                        <Link className="mx-1 text-fuchsia-700 underline underline-offset-2 dark:text-fuchsia-300" to="/architecture/scheduler">
                            Scheduler
                        </Link>
                        。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="6. 九页各自收口在哪,以及不要重复读的页"
                note="讲解要点:顺着因果读。已经有结论的专题用链接跳过去,不在这里再写一遍规则。"
            >
                <Stack>
                    <Diagram caption="本系列的阅读顺序">
                        {`运行时总览          你在这里:三个包、两种树、两个阶段
Fiber               三指针为什么能暂停;双缓冲
Render              beginWork / completeWork;按 key 复用
Commit              mutation → layout → 绘制后的 passive
更新队列            setState 入环;批处理;函数式更新
Hooks 链表          调用顺序就是槽位;条件调用为什么串位
Scheduler           Lane 与 5ms 时间片;MessageChannel
合成事件            根容器上的一个监听,沿 return 模拟传播
SSR 与水合          另一台渲染器:先有 HTML,再把 Fiber 绑上去
理解检验            六十道问答,用要点检验前面九页`}
                    </Diagram>
                    <P>
                        列表身份的使用规则在
                        <Link className="mx-1 text-cyan-700 underline underline-offset-2 dark:text-cyan-300" to="/basics/list-key">
                            列表与 key
                        </Link>
                        。原生监听和 `stopPropagation` 的坑在
                        <Link className="mx-1 text-cyan-700 underline underline-offset-2 dark:text-cyan-300" to="/basics/event">
                            事件与合成事件
                        </Link>
                        。`useTransition` 的交互演练在
                        <Link className="mx-1 text-cyan-700 underline underline-offset-2 dark:text-cyan-300" to="/performance/transition-deferred">
                            useTransition × useDeferredValue
                        </Link>
                        。Server Component 与 SSR 不是一回事,边界在
                        <Link className="mx-1 text-cyan-700 underline underline-offset-2 dark:text-cyan-300" to="/advanced/rsc-guide">
                            RSC · 深度梳理
                        </Link>
                        。
                    </P>
                </Stack>
            </TopicSection>
        </TopicPage>
    );
});

RuntimeMap.displayName = 'RuntimeMap';

export default RuntimeMap;
