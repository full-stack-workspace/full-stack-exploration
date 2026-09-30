/**
 * ============================================================================
 * 内部机制 · Render(/internals/render)
 * ============================================================================
 *
 * beginWork 向下比对,completeWork 向上收口。Diff 的两条假设和 bailout。
 * 列表 key 的使用规则链到已有专题。
 *
 * @module topics/internals/render
 */

import { memo } from 'react';
import { Link } from 'react-router-dom';

import { TopicPage, TopicSection } from '../../../components/TopicPage';
import { Diagram } from '../../../components/Diagram';
import { P, Stack } from '../components/Prose';
import { SeriesNav } from '../components/SeriesNav';
import { DiffDemo } from './DiffDemo';

const RenderPage = memo(() => {
    return (
        <TopicPage
            title="内部机制 · Render"
            description="Render 在 workInProgress 上计算下一棵树:向下 beginWork,向上 completeWork,此阶段不碰屏幕上的 DOM"
        >
            <SeriesNav current="render" />

            <TopicSection
                title="1. 一个工作单元里的向下和向上"
                note="讲解要点:beginWork 决定孩子是谁;completeWork 在回溯时为宿主节点准备 DOM,并把副作用标记交给父节点。"
            >
                <Stack>
                    <Diagram caption="performUnitOfWork 的两步">
                        {`beginWork(fiber)
  函数组件:调用函数,拿到新的 element
  类组件:调用 render
  然后 reconcileChildren:新 element 对比旧的子 Fiber

若还有 child → 下一个单元是 child(继续向下)
若没有 child → completeWork
  宿主组件:创建或标记更新 DOM(仍不插入屏幕树)
  把 flags 并进父节点的 subtreeFlags
  有 sibling → 下一个单元是 sibling
  没有 → 回到 return,对父节点 completeWork`}
                    </Diagram>
                    <P>
                        函数组件的 Hooks 在 beginWork 里按顺序执行。那时还没有提交,所以 `useEffect` 的回调不会在这里跑,只是把 effect 对象挂到 Hook 上,打上 Passive 标记,等 Commit 之后。`useState` 在这里消化更新队列,算出本次的 `memoizedState`。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="2. 两条假设,把树比较从立方降到线性"
                note="讲解要点:算法故意不求最优编辑距离。类型不同就整棵换掉;列表靠 key 认身份。"
            >
                <Stack>
                    <P>
                        通用树编辑距离是立方时间。React 用两条启发式:不同类型的元素产出不同的树,直接卸载再挂载,不试图把 div 改造成 span;同一位置的子节点用 key 表示「这还是刚才那个」。开发者破坏第二条,算法就退化为按位置硬套。
                    </P>
                    <Diagram caption="单节点:先看 type 和 key">
                        {`旧 Fiber 与新 element

type 不同  →  删除旧子树,Placement 新子树(state 一并丢)
type 相同且 key 相同  →  复用 Fiber,更新 props
key 不同  →  当成另一个身份,同样是删除 + 新建`}
                    </Diagram>
                    <P>
                        同类型组件复用时,组件函数会再执行一次,但 Fiber 上的 Hook 链表还在,所以 state 还在。这和「元素对象每次都是新的」不矛盾:丢掉的是 element,留下的是 Fiber。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="3. 多个孩子:先吃掉相同前缀,再按 key 查表"
                note="讲解要点:从左向右,key 还一致就原地复用。错位之后按 key 找回旧序号,只有旧序号比已放置位置更小的节点才标记为移动。"
            >
                <Stack>
                    <DiffDemo />
                    <P>
                        头部插入时,新的 `e` 带上新建标记,原来的 `a b c d` 按旧序号仍能留在原地:把新节点插到它们前面即可,不必把四个旧节点都标成移动。尾部插入只有 `e` 是新建。交换 `b` 与 `c` 时,`a` 先复用;`c` 的旧位置在已经放过的位置之后,可以不动;`b` 的旧位置更靠前,要移动到 `c` 后面。四个人的身份都还在,没有删除再重建。这个「只标记往回跳的节点」就是 `lastPlacedIndex`。没有稳定 key 时,查表用的是索引,位置一变就会把 state 套到另一个孩子上。使用层的实验在
                        <Link className="mx-1 text-cyan-700 underline underline-offset-2 dark:text-cyan-300" to="/basics/list-key">
                            列表与 key
                        </Link>
                        。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="4. bailout:子树可以整段跳过"
                note="讲解要点:props 浅比较没变、自己也没有待处理更新、也没有消费到变化的 Context,就可以复用整棵子 Fiber。"
            >
                <Stack>
                    <P>
                        beginWork 开头会问:这个 Fiber 能不能跳过。能跳过时,React 把已有子树克隆到 workInProgress 上,不再调用下面的组件函数。`memo` 和 `useMemo` 改变的是「props 比较的结果」,从而让这次判断更容易成功。它们不是另一套渲染器。
                    </P>
                    <P>
                        跳过不是默认安全的。父组件渲染时如果每次传入新的对象或函数,浅比较失败,子树照样走进去。这就是性能专题把记忆化放在「确认热点之后」的原因:bailout 只在比较为真时发生。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="5. 这段计算可以被扔掉"
                note="讲解要点:Render 没有把结果写进 current,也没有改屏幕。更高优先级的更新进来时,未完成的 workInProgress 可以废弃重来。"
            >
                <Stack>
                    <P>
                        时间片用完,循环停在某个 Fiber,进度留在根上。若在恢复之前有一次更高 Lane 的更新,React 会从根按新的 Lane 重新 begin,而不是把做到一半的低优先级结果提交出去。用户不会看到半棵新树配半棵旧树。真正改 DOM 要等下一页的 Commit。
                    </P>
                </Stack>
            </TopicSection>
        </TopicPage>
    );
});

RenderPage.displayName = 'RenderPage';

export default RenderPage;
