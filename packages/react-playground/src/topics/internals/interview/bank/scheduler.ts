/**
 * ============================================================================
 * scheduler — Lane、时间片、并发
 * ============================================================================
 *
 * @module topics/internals/interview/bank/scheduler
 */

import type { InterviewQuestion } from './types';

export const SCHEDULER: readonly InterviewQuestion[] = [
    {
        id: 'q-lanes',
        toc: 'Lane 与时间片',
        title: 'Lane 和 Scheduler 的优先级是一回事吗？为什么不用 requestIdleCallback？',
        note: '两套系统,在 scheduleUpdateOnFiber 交汇。',
        points: [
            'Lane 是协调器里的位掩码,决定哪些更新进入这一轮。',
            'Scheduler 只有大约五档,外加约 5 毫秒的让出点。',
            '时间片用 MessageChannel,不用 requestIdleCallback。',
        ],
        related: [
            { to: '/internals/scheduler', label: 'Scheduler' },
            { to: '/performance/transition-deferred', label: 'transition × deferred' },
        ],
        body: [
            '点击里的 setState 落到 Sync Lane,startTransition 和 useDeferredValue 落到过渡一类的 Lane。Lane 回答「这批更新有多急、能不能跟别的更新并在同一次渲染」。Scheduler 的 Immediate、UserBlocking、Normal、Low、Idle 回答「这个计算任务何时抢到主线程」。startTransition 改的是 Lane,不是把主线程切成 5 毫秒。时间切片是另一层:并发渲染的任务在工作循环里问 shouldYield,到点就把控制权还回去。同步点击走 Immediate,工作循环里不让出。',
            'Scheduler 不用 requestIdleCallback。rIC 触发不稳定,后台标签页还会被浏览器挂起。React 用 MessageChannel 把任务排成宏任务:做一小段,postMessage 给自己,浏览器就能在两段之间处理输入和绘制。5 毫秒是让出点,不是整次渲染的工期。',
            '过渡更新不能永远让路。Lane 上带过期时间,一直被点击打断时,过期后会升级成同步工作做完。快速输入时过渡结果会落后,停手之后它还是会出现。',
        ],
    },
    {
        id: 'q-heap',
        toc: '最小堆里放什么',
        title: 'Scheduler 的最小堆排序的是 Fiber 吗？',
        note: '堆里是任务,不是组件树。',
        points: [
            '任务带 sortIndex 和过期时间,堆按它们取出下一个该跑的。',
            'timer 队列放还没到时间的任务,task 队列放已经可以跑的。',
            '协调器的工作循环是任务的回调,Fiber 遍历在回调里面。',
        ],
        related: [{ to: '/internals/scheduler', label: 'Scheduler' }],
        body: [
            'Scheduler 是独立包。它不 import Fiber。入堆的是「一段时间后要执行的函数」,加上优先级换算出来的排序键。到期的从 timer 队列挪到 task 队列,每次取堆顶。同一优先级里,先过期的先跑。',
            'performConcurrentWorkOnRoot 就是这样一个回调。它被调用时才进入 Fiber 的工作循环。做完一小段如果还没结束,回调把自己再登记进去,sortIndex 仍按原优先级,于是它会在后面的时间片继续。更高优先级的任务堆顶更靠前,就会插到它前面。把堆说成「按组件深度排序」是错的,组件顺序只存在于 Fiber 的三指针。',
        ],
    },
    {
        id: 'q-yield',
        toc: 'shouldYield 看什么',
        title: '时间片是固定 5 毫秒切一刀吗？谁决定让出？',
        note: '让出点在工作循环的节点边界,不是在任意 JS 语句中间。',
        points: [
            '每处理完一个 Fiber,工作循环问 shouldYield。',
            '当前时间片用完,且任务还没过期,就把下一个 Fiber 的引用留下并返回。',
            '过期任务不再让出,以免饿死。',
        ],
        related: [{ to: '/internals/scheduler', label: 'Scheduler' }],
        body: [
            '5 毫秒是帧预算的量级,不是一套定时器每 5 毫秒强制打断 JS。JavaScript 无法在函数中途被协作式调度器抢占。React 只能在自己的循环里主动看时间。看的位置是 performUnitOfWork 返回之后,也就是一个 Fiber 的 begin 或 complete 做完的边界。一个特别重的组件函数如果内部不算时间,这一整个函数仍会跑完才有机会让出。',
            '让出用 MessageChannel 把剩余工作排成宏任务。浏览器在两个宏任务之间可以处理输入和绘制。setTimeout 也能制造宏任务,但嵌套超时有最小间隔,MessageChannel 更适合这种「立刻再排一次」的循环。同步 Lane 的渲染不走这条让出,它在一次调用里走到 Commit,避免点击这类更新被切碎。',
        ],
    },
    {
        id: 'q-starve',
        toc: '过渡更新会不会饿死',
        title: '一直有点击时,过渡更新什么时候保证做完？',
        note: '靠过期,不靠「用户总会停手」。',
        points: [
            '每条 Lane 有过期时间,过渡比同步更晚过期。',
            '过期后这轮渲染不再被时间片打断,会同步做完并提交。',
            '所以快速输入时结果会落后,但不会永远不出。',
        ],
        related: [{ to: '/internals/scheduler', label: 'Scheduler' }],
        body: [
            '如果高优先级永远插队,低优先级的渲染每次做到一半就被丢掉,界面会停在旧值上。Lane 的过期时间把「可以等」变成「不能再等」。到期之后,调度把它当成必须完成的工作,shouldYield 不再把主线程让出去,这次会走到 Commit。',
            '这就是过渡不是后台空白的原因。输入过程中可以保持旧画面或旧列表,等一帧帧的点击先处理。若点击持续很久,过期的过渡仍会插进来做完,可能造成一次较长的同步渲染。设计过渡时要接受这个尾延迟,而不是假设它只会在空闲时悄悄完成。',
        ],
    },
    {
        id: 'q-transition',
        toc: 'startTransition 改什么',
        title: 'startTransition 包住的 setState,到底改变了哪一层？',
        note: '改 Lane,不改事件,也不自动把计算切成 5 毫秒。',
        points: [
            '过渡里的更新用过渡 Lane,不阻塞同步 Lane 的提交。',
            'isPending 表示过渡结果还没提交,不是「函数还在执行」。',
            '时间片只有在这轮走并发渲染时才会让出。同步点击仍立即提交。',
        ],
        related: [{ to: '/performance/transition-deferred', label: 'transition × deferred' }],
        body: [
            '把 setState 放进 startTransition,这次更新的 Lane 不再是 Sync。当前点击里其它同步 setState 可以先 Commit,输入框先变。过渡更新随后在并发任务里渲染,渲染过程中可以让出,也可以被新的点击打断、重来。isPending 在过渡提交前为 true,用来显示待定状态,它不代表主线程正卡在那个函数里。',
            '若过渡里的组件函数本身极重,且一次 beginWork 就超过一帧,让出只能发生在这个组件返回之后。startTransition 不是把任意 CPU 工作自动切片的 API。切片的粒度是 Fiber。真正要切的是树的节点,或者把大计算挪出渲染。',
        ],
    },
    {
        id: 'q-deferred',
        toc: 'useDeferredValue',
        title: 'useDeferredValue 和 startTransition 差在哪？',
        note: '一个推迟「值的那次渲染」,一个标记「这些 setState 是过渡」。',
        points: [
            'useDeferredValue 让消费这个值的渲染可以用落后的副本先提交。',
            '紧急更新先画出新输入,延迟值驱动的子树稍后跟上。',
            '两者都走过渡一类的 Lane,都可能被打断,也都有过期。',
        ],
        related: [{ to: '/performance/transition-deferred', label: 'transition × deferred' }],
        body: [
            'startTransition 包的是你发起更新的地方。你知道哪一次 setState 可以慢。useDeferredValue 用在你只拿到一个已经变化的值、控制不了上游 setState 的地方:把这个值延后,让直接显示它的部分先更新,把昂贵列表留在旧值上再渲染一版。',
            '延迟值不是节流函数。它不按固定毫秒合并,而是参与同一套 Lane:紧急渲染先用旧的延迟值,然后再为新值安排过渡渲染。过渡提交前,界面上可以同时存在「新输入」和「旧查询结果」。这是故意的不一致,用 isPending 或值是否相等来提示,而不是当成 bug。',
        ],
    },
    {
        id: 'q-suspense',
        toc: 'Suspense 抛出什么',
        title: 'Suspense 在 Render 里是怎么「等待」的？',
        note: '等待就是抛出 Promise,不是在 beginWork 里写一个 sleep。',
        points: [
            '读取未完成的数据时抛出 Promise,协调器接住,沿父链找到 Suspense 边界。',
            '边界先提交 fallback,Promise 完成后再从边界重试。',
            '抛出发生在 Render,所以获取必须能重入,不能靠抛出本身做不可撤销的副作用。',
        ],
        related: [{ to: '/internals/render', label: 'Render' }],
        body: [
            '组件函数执行到一半发现数据没有准备好,把 Promise 抛出来。这次 beginWork 不算失败崩溃,协调器把它当成「这个子树现在不能完成」。已完成的兄弟可以继续。最近的 Suspense Fiber 记下这个 thenable,当前提交用 fallback 的 Fiber 代替还没准备好的子树。',
            'Promise 完成,边界再调度一次更新,重新执行那个组件。若数据缓存命中,函数不再抛,真实子树替换 fallback。因为 Render 可能重做,开始获取的动作要放在缓存或外部,而不是「每次执行组件就发一个无法去重的请求」。这和 effect 里请求不同:effect 在提交后,Suspense 的读取在渲染中。',
        ],
    },
    {
        id: 'q-restart',
        toc: '打断后草稿还要不要',
        title: '并发渲染做到一半被打断,workInProgress 会怎样？',
        note: '不提交。能复用的是没变的子树,不是半截 DOM。',
        points: [
            '没走到 Commit,root.current 不动,屏幕不变。',
            '更高优先级到来时从根按新 Lane 再走,未提交的结果不能上屏。',
            'props 和 state 都没变的子树可以 bailout,不必把每个函数都重跑。',
        ],
        related: [{ to: '/internals/render', label: 'Render' }],
        body: [
            '工作循环停住时,根上留着下一个要处理的 Fiber。若恢复的仍是同一轮,就从这个指针继续。若中间插入了更高 Lane,这一轮的目标变了,React 会按新的集合从根重新开始,避免把旧 Lane 算到一半的结果和新 Lane 拼成一棵树提交。用户看不见拼接,是因为拼接只可能发生在还没切换 current 的草稿上。',
            '重新开始不等于整棵树的函数全部再执行。沿途 bailout 仍有效:没有待处理更新、props 也没变的子树直接克隆。所以「可中断」的成本主要在被打断的那条路径上,不是每次输入都全量重渲染。反过来,若渲染不纯,重跑就会看到重复的外部写入。这和 StrictMode 的双调用是同一条约束。',
        ],
    },
    {
        id: 'q-flush',
        toc: 'flushSync',
        title: 'flushSync 为什么能在下一行读到新 DOM？它破坏了什么？',
        note: '它把批处理和并发让出都关掉,立刻 Commit。',
        points: [
            '回调里的更新用同步 Lane,回调一结束就走完 Render 和 Commit。',
            '所以下一行能读到新布局,也能立刻 focus。',
            '代价是挡住主线程,并可能把本来可以合并的更新拆成两次提交。',
        ],
        related: [{ to: '/internals/update-queue', label: '更新队列' }],
        body: [
            '默认批处理要等当前事件或微任务结束才渲染,这样一行里两次 setState 合成一次 Commit。flushSync 在回调返回前就强制刷出去。浏览器还没回到事件循环,DOM 已经是新的,紧接着的 getBoundingClientRect 或 focus 能看到结果。',
            '它不适合包大列表的更新。同步 Commit 期间不能让出,点击和绘制都要等这段结束。嵌套的 flushSync 还会把一次逻辑更新切成多帧提交,用户可能看到中间态。只在「必须在继续执行当前函数之前看到 DOM」时用,例如测量或把焦点送进刚出现的节点。',
        ],
    },
];
