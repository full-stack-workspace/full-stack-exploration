/**
 * ============================================================================
 * 内部机制 · 状态更新(/internals/update-queue)
 * ============================================================================
 *
 * 更新是挂在 Fiber 上的队列,不是立刻改 state。批处理决定一帧里渲染几次。
 *
 * @module topics/internals/update-queue
 */

import { memo } from 'react';

import { TopicPage, TopicSection } from '../../../components/TopicPage';
import { Diagram } from '../../../components/Diagram';
import { P, Stack } from '../components/Prose';
import { SeriesNav } from '../components/SeriesNav';
import { QueueDemo } from './QueueDemo';

const UpdateQueuePage = memo(() => {
    return (
        <TopicPage
            title="内部机制 · 状态更新"
            description="setState 不改当前屏幕上的 state,它往 Fiber 的更新队列追加一项,等这一轮 Render 再算"
        >
            <SeriesNav current="update-queue" />

            <TopicSection
                title="1. 更新是一条链表,不是一次赋值"
                note="讲解要点:多次 setState 先入队。Render 时从 baseState 出发,按顺序处理这一轮该处理的更新。"
            >
                <Stack>
                    <Diagram caption="函数组件的 hook.queue 与类组件的 fiber.updateQueue 是同一类东西">
                        {`setState(fn)  →  追加 Update { lane, action: fn, next }

Render 时 processUpdateQueue:
  base = hook.memoizedState
  对队列里优先级够的更新:
    base = action(base)     // 函数式
    或 base = action        // 直接传入的值,覆盖
  hook.memoizedState = base

优先级不够的更新留在队列里,baseState 停在它们前面。
这是并发渲染能「先跳过过渡更新」的数据结构。`}
                    </Diagram>
                    <P>
                        直接传入的值不读取「队列里前一次更新算出的结果」。同一轮里两次 setN(n + 1),两次闭包里的 n 都是这次渲染的那个数,后一次覆盖前一次。函数式更新的参数是处理到它时的 base,所以三次「在当前值上加 1」得到 +3。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="2. 批处理:一帧里尽量只渲染一次"
                note="讲解要点:React 18 的 createRoot 在事件、超时、Promise 里都批处理。遗留的 render 根在超时里不批。"
            >
                <Stack>
                    <QueueDemo />
                    <P>
                        批处理合并的是「渲染次数」,不是把两次更新合成一个更新对象。队列里仍然有多项,只是同一次 beginWork 里连续处理。所以函数式更新在批处理里仍然能看见彼此。
                    </P>
                    <P>
                        `flushSync` 会在它的回调结束时立刻走完 Render 和 Commit,用来在继续往下执行之前读到新 DOM。它打断批处理,也会拉长主线程,只适合必须在下一步测量布局的场景。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="3. 优先级不够的更新先留着"
                note="讲解要点:急更新先处理。过渡更新如果还在队列里,baseState 不能跨过它们,否则下一次会把已经算过的急更新再算一遍。"
            >
                <Stack>
                    <P>
                        假设队列里先有一条 Transition 的更新,后面跟一条点击产生的 Sync 更新。Render 按 Sync Lane 走时,跳过 Transition 那条,但 baseState 停在它之前,只把 Sync 更新算进去。Transition 那条还在。下一轮再从同一个 base 把两条按顺序算完。这样不会丢更新,也不会把同一次点击应用两遍。
                    </P>
                    <P>
                        组件里看不到这条队列。能观察到的现象是:紧急的输入先出现在屏幕上,`startTransition` 里的更新可以晚一帧甚至被更新的过渡替换。Lane 怎么映射到 Scheduler,在调度页展开。
                    </P>
                </Stack>
            </TopicSection>
        </TopicPage>
    );
});

UpdateQueuePage.displayName = 'UpdateQueuePage';

export default UpdateQueuePage;
