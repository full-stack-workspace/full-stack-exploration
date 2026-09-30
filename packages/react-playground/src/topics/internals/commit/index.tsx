/**
 * ============================================================================
 * 内部机制 · Commit(/internals/commit)
 * ============================================================================
 *
 * 提交阶段同步、不可中断。mutation 改 DOM,layout 在绘制前读布局,
 * passive effect 推迟到绘制之后。
 *
 * @module topics/internals/commit
 */

import { memo } from 'react';

import { TopicPage, TopicSection } from '../../../components/TopicPage';
import { Diagram } from '../../../components/Diagram';
import { P, Stack } from '../components/Prose';
import { SeriesNav } from '../components/SeriesNav';
import { TimingDemo } from './TimingDemo';

const CommitPage = memo(() => {
    return (
        <TopicPage
            title="内部机制 · Commit"
            description="Render 打好的标记在这里一次做完:改 DOM、切换 current、绘制前的 layout,以及绘制后的 useEffect"
        >
            <SeriesNav current="commit" />

            <TopicSection
                title="1. 为什么这段不能让出主线程"
                note="讲解要点:提交一半等于屏幕上的 DOM 和 current 树对不上。用户会看到残缺界面,下一次渲染也会基于错误的事实。"
            >
                <Stack>
                    <P>
                        Render 可以停,是因为它只写 workInProgress。Commit 要插入节点、改属性、删除子树,还要把 `root.current` 指到这棵新树。若在删除和插入之间把主线程让出去,浏览器可能先画一帧,用户看到的是中间态;下一次事件读到的 DOM 也和 Fiber 不一致。
                    </P>
                    <P>
                        所以 Commit 设计成同步的。它短,是因为 Render 已经把「谁要改」收成了标记,提交阶段不用再调用组件函数,只访问 `subtreeFlags` 不为空的那些分支。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="2. 三步加上绘制之后的 passive"
                note="讲解要点:before mutation 取快照,mutation 改 DOM 并跑 useInsertionEffect,layout 在绘制前,useEffect 在绘制后。"
            >
                <Stack>
                    <Diagram caption="commitRoot 里的顺序">
                        {`before mutation
  getSnapshotBeforeUpdate
  给 passive effect 排程(还没执行)

mutation
  插入 / 更新 / 删除 DOM
  useInsertionEffect(给 CSS-in-JS 在读布局前注入 <style>)
  卸下被删除节点上的 ref

切换 root.current

layout(浏览器绘制之前,同步)
  componentDidMount / componentDidUpdate
  useLayoutEffect 的销毁,然后是创建
  挂上 ref

—— 浏览器绘制 ——

passive(另一段任务)
  useEffect 的销毁,然后是创建`}
                    </Diagram>
                    <P>
                        `useLayoutEffect` 里读布局是安全的,因为 DOM 已经是新的,浏览器还没把这一帧画出去。在里面 `setState` 会再同步走一轮渲染,用户看不到中间帧,但主线程会被拉长。`useEffect` 里 setState 会等这一帧画完,所以适合请求和订阅,不适合「先量再改位置」——那会造成闪一下。
                    </P>
                    <P>
                        `useInsertionEffect` 比 layout 更早,只该用于注入样式。在里面读布局或 setState,时机比 layout 更挤,React 不保证那些用法。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="3. 点一次,看三件事的先后"
                note="讲解要点:layout 出现在 rAF 之前;passive 出现在 rAF 之后。rAF 代表浏览器即将绘制,passive 是绘制之后的任务。"
            >
                <Stack>
                    <TimingDemo />
                    <P>
                        前台标签里的顺序是 layout,然后 rAF,然后 passive。rAF 在浏览器准备绘制时触发,passive 是绘制之后的任务。标签页若在后台,浏览器会推迟 rAF,它就会排到 passive 后面;那是绘制被挂起,不是提交顺序变了。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="4. 标记决定提交阶段走进哪条分支"
                note="讲解要点:没有 subtreeFlags 的子树,提交阶段直接跳过。这是 Commit 能保持短的原因。"
            >
                <Stack>
                    <P>
                        Placement、Update、ChildDeletion、Layout、Passive、Ref、Snapshot 这些是位标记。父节点的 `subtreeFlags` 是孩子标记的并集。提交阶段看到某个子树的 `subtreeFlags` 为空,就不再往下走。Render 阶段 bailout 掉的子树,通常也不会在 Commit 里被逐个访问。
                    </P>
                    <P>
                        删除有单独的路径:被删的 Fiber 已经不在新树的 child 链表里,但删除标记会留在父节点上,提交时沿着删除链表卸 DOM、跑 layout 的清理函数。只看新树上的 child 指针,看不到「谁被删了」。
                    </P>
                </Stack>
            </TopicSection>
        </TopicPage>
    );
});

CommitPage.displayName = 'CommitPage';

export default CommitPage;
