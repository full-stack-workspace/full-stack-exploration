/**
 * ============================================================================
 * 内部机制 · Fiber(/internals/fiber)
 * ============================================================================
 *
 * 工作单元、三指针、双缓冲。步进演示对应 performUnitOfWork 的遍历顺序。
 *
 * @module topics/internals/fiber
 */

import { memo } from 'react';
import { Link } from 'react-router-dom';

import { TopicPage, TopicSection } from '../../../components/TopicPage';
import { Diagram } from '../../../components/Diagram';
import { CodeBlock } from '../../../components/CodeBlock';
import { P, Stack } from '../components/Prose';
import { SeriesNav } from '../components/SeriesNav';
import { WalkDemo } from './WalkDemo';

const FiberPage = memo(() => {
    return (
        <TopicPage
            title="内部机制 · Fiber"
            description="Fiber 是可暂停的工作单元:用 child / sibling / return 把调用栈展开成链表,用 alternate 保留屏幕上的那一棵"
        >
            <SeriesNav current="fiber" />

            <TopicSection
                title="1. 栈协调器停不下来"
                note="讲解要点:React 16 之前的协调是同步递归。调用栈在返回之前,主线程不能去处理点击。"
            >
                <Stack>
                    <P>
                        旧的 Stack Reconciler 用 JavaScript 调用栈遍历组件树。父函数调用子函数,子函数再调用孙函数,整棵树返回之后更新才结束。树一大,这一次调用就超过一帧。浏览器排不上点击、也画不出下一帧,用户看到的是卡住,不是「渲染很努力」。
                    </P>
                    <Diagram caption="递归调用栈没有安全的暂停点">
                        {`reconcile(App)
  reconcile(Header)
    reconcile(Title)      ← 调用栈里同时压着三帧
  reconcile(List)
    reconcile(Item) ...   ← 必须等最深的返回,才能处理点击

想暂停?调用栈不属于 React,中途 return 就丢了「走到哪」。`}
                    </Diagram>
                    <P>
                        Fiber 把这一帧调用栈上的信息收进节点自己:子节点是谁、下一个兄弟是谁、父节点是谁。遍历改成循环。循环每走一步都可以看时间还够不够,不够就把「下一个工作单元」记在根上,下次从那里继续。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="2. 三个指针走完整棵树"
                note="讲解要点:child 是第一个孩子,sibling 把孩子串成链表,return 是父节点。深度优先,不依赖调用栈。"
            >
                <Stack>
                    <Diagram caption="App 下面 Header 与 List 是兄弟,Title 挂在 Header 上">
                        {`App
 ├── child → Header ── sibling → List
 │              │                    │
 │              child                 child
 │              ↓                     ↓
 │            Title                 Item A ── sibling → Item B
 │
 └── 每个节点的 return 指回父节点

走法:有 child 就向下 begin;没有就 complete,
      有 sibling 就向右 begin;没有就 return 向上 complete。`}
                    </Diagram>
                    <WalkDemo />
                    <P>
                        暂停时 React 只保存下一个 Fiber 的引用。恢复时不需要把调用栈重建出来。这也是并发渲染能「做一会儿、让一让、再接着做」的数据结构前提。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="3. 字段里真正要记住的"
                note="讲解要点:不必背完整的 Fiber 类型。身份、链表、双缓冲、状态、副作用五组就覆盖后面几页。"
            >
                <Stack>
                    <CodeBlock
                        title="教学用的字段分组,不是完整类型定义"
                        code={`{
  // 身份:和 element 对得上才能复用
  tag,            // 函数组件 / 类组件 / 宿主组件 / 文本...
  key, type,

  // 链表
  child, sibling, return,

  // 双缓冲
  alternate,      // 另一棵树上的同一个逻辑节点

  // 上次提交的事实
  pendingProps, memoizedProps,
  memoizedState,  // 函数组件:Hook 链表的头
  updateQueue,
  stateNode,      // 宿主组件指向 DOM

  // 副作用
  flags,          // 这一节点要插入、更新、删除、跑 effect
  subtreeFlags,   // 子树里有没有人要在 commit 时被访问
}`}
                    />
                    <P>
                        React 16 的笔记里常见 `effectTag` 和 `nextEffect`。React 18 之后副作用用位标记 `flags`,子树是否值得在提交阶段走进去用 `subtreeFlags`。名字换了,职责还是「Render 阶段只打标,Commit 阶段才执行」。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="4. 双缓冲:屏幕上永远是一棵完整的树"
                note="讲解要点:计算发生在 workInProgress。提交时切换 root.current,不是边算边改屏幕上的节点。"
            >
                <Stack>
                    <Diagram caption="alternate 把两棵树的对应节点缝在一起">
                        {`current                         workInProgress
(已提交,stateNode 在屏幕上)      (这一轮正在填)
   App ◄──── alternate ────► App'
    │                          │
 Header ◄── alternate ───► Header'

Render 只写右边。
Commit: root.current = App'
左边那棵留着,成为下一轮的 workInProgress,节点被复用。`}
                    </Diagram>
                    <P>
                        中断或丢弃一次渲染,丢掉的是右边这棵还没提交的副本,屏幕上的 current 不动。这就是「Render 可以重做,用户不会看到写了一半的 DOM」。切换指针发生在 Commit,和 DOM 变更放在同一段同步工作里,避免树和屏幕各说各话。
                    </P>
                    <P>
                        对组件作者,JSX、props、state 这些表面模型没有换成另一套。变的是运行时可以把渲染拆开、可以丢掉未提交的工作。并发特性(`startTransition`、Suspense)都站在这对树上,用法见
                        <Link className="mx-1 text-cyan-700 underline underline-offset-2 dark:text-cyan-300" to="/performance/render-scheduling-guide">
                            渲染调度深入梳理
                        </Link>
                        。
                    </P>
                </Stack>
            </TopicSection>
        </TopicPage>
    );
});

FiberPage.displayName = 'FiberPage';

export default FiberPage;
