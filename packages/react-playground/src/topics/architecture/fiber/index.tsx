/**
 * ============================================================================
 * 原理与架构 · Fiber(/architecture/fiber)
 * ============================================================================
 *
 * 工作单元、三指针、双缓冲。步进演示对应 performUnitOfWork 的遍历顺序。
 *
 * @module topics/architecture/fiber
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
            title="原理与架构 · Fiber"
            description="Fiber 是可暂停的工作单元:用 child / sibling / return 把调用栈展开成链表,用 alternate 保留屏幕上的那一棵"
        >
            <SeriesNav current="fiber" />

            <P>
                栈协调器为什么停不下来，写在
                <Link className="mx-1 text-fuchsia-700 underline underline-offset-2 dark:text-fuchsia-300" to="/architecture/constraints">
                    设计约束
                </Link>
                。
            </P>

            <TopicSection
                title="1. 三个指针走完整棵树"
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
                title="2. 字段里真正要记住的"
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
                    <P>
                        屏幕上那棵树为什么不能边算边改，写在
                        <Link className="mx-1 text-fuchsia-700 underline underline-offset-2 dark:text-fuchsia-300" to="/architecture/double-buffer">
                            双缓冲
                        </Link>
                        。
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
