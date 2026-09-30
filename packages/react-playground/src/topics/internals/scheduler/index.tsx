/**
 * ============================================================================
 * 内部机制 · Scheduler(/internals/scheduler)
 * ============================================================================
 *
 * Lane 是协调器里的优先级位,Scheduler 是约 5ms 一让的任务队列。
 * 两者在 scheduleUpdateOnFiber 交汇,不是同一个枚举。
 *
 * @module topics/internals/scheduler
 */

import { memo } from 'react';
import { Link } from 'react-router-dom';

import { TopicPage, TopicSection } from '../../../components/TopicPage';
import { Diagram } from '../../../components/Diagram';
import { P, Stack } from '../components/Prose';
import { SeriesNav } from '../components/SeriesNav';
import { SliceModel } from './SliceModel';

const SchedulerPage = memo(() => {
    return (
        <TopicPage
            title="内部机制 · Scheduler"
            description="Reconciler 用 Lane 决定哪些更新算进这一轮;Scheduler 用时间片决定这一轮算到哪可以让出主线程"
        >
            <SeriesNav current="scheduler" />

            <TopicSection
                title="1. 两套优先级,不要合成一个词"
                note="讲解要点:Lane 是位掩码,描述更新的种类。Scheduler 的 Immediate / UserBlocking / Normal / Low / Idle 描述任务何时抢占。"
            >
                <Stack>
                    <Diagram caption="setState 时的交汇点">
                        {`组件里的更新
  点击里的 setState          → SyncLane
  startTransition            → TransitionLane
  useDeferredValue           → 过渡一类的 Lane

scheduleUpdateOnFiber
  把 Lane 映射成 Scheduler 优先级
  Sync        → Immediate(尽量马上做)
  Input       → UserBlocking
  Default     → Normal
  Transition  → Normal,可被更高优先级打断
  Idle        → Idle

ensureRootIsScheduled
  向 Scheduler 注册一次 performConcurrentWorkOnRoot`}
                    </Diagram>
                    <P>
                        `startTransition` 改的是 Lane,不是把主线程切成 5 毫秒。时间切片是 Scheduler 的事:并发渲染的那次任务在工作循环里问 `shouldYield()`,到点就把控制权还回去。一次同步的点击更新走 Immediate,工作循环里不让出,所以 `flushSync` 和离散输入能在浏览器绘制前做完。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="2. 5 毫秒是让出点,不是渲染的工期"
                note="讲解要点:下面的按钮按固定成本扣预算。真实实现用 performance.now,宿主是 MessageChannel,不是 requestIdleCallback。"
            >
                <Stack>
                    <SliceModel />
                    <P>
                        Scheduler 不用 `requestIdleCallback`。rIC 触发不稳定,后台标签页还会被浏览器挂起。React 用 `MessageChannel` 把任务排成宏任务:做一小段,postMessage 给自己,浏览器就能在两段之间处理输入和绘制。
                    </P>
                    <P>
                        让出之后,若有更高优先级的任务,下一片不一定接着上次的 Fiber。根上的进度可以作废,从新的 Lane 重跑 Render。用户能感知的是输入不被长列表更新堵住。可操作的对照在
                        <Link className="mx-1 text-cyan-700 underline underline-offset-2 dark:text-cyan-300" to="/performance/transition-deferred">
                            transition × deferred
                        </Link>
                        ,那一页用的是真实的 `startTransition` 和 `useDeferredValue`。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="3. 饥饿与过期"
                note="讲解要点:过渡更新不能永远让路。Lane 上带过期时间,过期后升级,避免低优先级被连续的点击饿死。"
            >
                <Stack>
                    <P>
                        每个 Lane 有过期时间。一直有 Sync 更新进来时,Transition 会反复重来。过期之后它被当成同步工作做完,保证最终能画出来。这是调度策略,组件里没有对应的 API。现象是:快速输入时过渡结果会落后,停手之后它还是会出现。
                    </P>
                </Stack>
            </TopicSection>
        </TopicPage>
    );
});

SchedulerPage.displayName = 'SchedulerPage';

export default SchedulerPage;
