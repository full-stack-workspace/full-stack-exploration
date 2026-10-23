/**
 * ============================================================================
 * 原理与架构 · 工作单元(/architecture/work-unit)
 * ============================================================================
 *
 * 说明进度必须记在 Fiber 节点上，调用栈清空之后仍能接着遍历。
 * 链表走法留给 Fiber 页，本页不引入 WalkDemo。
 *
 * @module topics/architecture/work-unit
 */

import { memo } from 'react';
import { Link } from 'react-router-dom';

import { TopicPage, TopicSection } from '../../../components/TopicPage';
import { Diagram } from '../../../components/Diagram';
import { P, Stack } from '../components/Prose';
import { SeriesNav } from '../components/SeriesNav';

const WorkUnitPage = memo(() => {
    return (
        <TopicPage
            title="原理与架构 · 工作单元"
            description="进度记在节点上，调用栈清空之后还能从 child、sibling、return 接着做"
        >
            <SeriesNav current="work-unit" />

            <TopicSection
                title="1. 调用栈可以是空的"
                note="讲解要点:协调器用循环遍历 Fiber 链表，不再靠组件函数的调用栈记住「走到哪」。"
            >
                <Stack>
                    <P>
                        旧的栈协调器把「下一个要处理的子节点」压在 JavaScript 调用栈里。函数返回之后，栈就空了，React 也丢了进度。
                        Fiber 把同样的信息挂在节点上：第一个孩子是 <code>child</code>，兄弟是 <code>sibling</code>，父节点是{' '}
                        <code>return</code>。待处理的更新挂在 <code>updateQueue</code> 上，这次更新有多急记在{' '}
                        <code>lanes</code> 里。
                    </P>
                    <P>
                        <strong>Fiber 才是工作单元</strong>——协调器每次只处理一个节点，处理完再看时间够不够继续。
                        <strong>React Element 是这一次 render 返回的描述</strong>，用来决定要不要创建或复用 Fiber，本身不在这条链表上。
                        类组件实例、函数组件闭包里的状态，也<strong>不是</strong>这张链表上的节点；它们通过 Fiber 上的 memoizedState、memoizedProps 等字段被引用。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="2. 清空之后节点上还留着什么"
                note="讲解要点:暂停或让出主线程时，调用栈可以回到事件循环；下一个工作单元从 Fiber 字段里读出来。"
            >
                <Stack>
                    <P>
                        时间片用完或需要处理更高优先级更新时，协调器可以安全退出循环。此时调用栈上没有未返回的 reconcile 帧，但每个 Fiber
                        仍带着足够的上下文，下次从「下一个单元」接着做。
                    </P>
                    <Diagram caption="一个 Fiber 节点上协调器要记住的字段">
                        {`Fiber 工作单元
  child        → 第一个子 Fiber（没有则为 null）
  sibling      → 下一个兄弟 Fiber
  return       → 父 Fiber
  updateQueue  → 挂在这颗节点上的待处理更新
  lanes        → 这次更新占用的优先级车道

遍历顺序见 Fiber 页；双缓冲与 alternate 见双缓冲页。`}
                    </Diagram>
                    <P>
                        链表怎样深度优先走完整棵树，见{' '}
                        <Link to="/architecture/fiber" className="underline underline-offset-2">
                            Fiber
                        </Link>{' '}
                        页的步进演示；current 与 workInProgress 两棵树见{' '}
                        <Link to="/architecture/double-buffer" className="underline underline-offset-2">
                            双缓冲
                        </Link>
                        页。这一页只建立「进度在节点上」的前提。
                    </P>
                </Stack>
            </TopicSection>
        </TopicPage>
    );
});

WorkUnitPage.displayName = 'WorkUnitPage';

export default WorkUnitPage;
