/**
 * ============================================================================
 * commit — 提交子阶段与 effect 时序
 * ============================================================================
 *
 * @module topics/internals/interview/bank/commit
 */

import type { InterviewQuestion } from './types';

export const COMMIT: readonly InterviewQuestion[] = [
    {
        id: 'q-phases',
        toc: '提交的三个子阶段',
        title: 'Commit 内部的 before mutation、mutation、layout 各做什么？',
        note: '切换 current 的那一下夹在 mutation 和 layout 之间。',
        points: [
            'before mutation 给类组件 getSnapshotBeforeUpdate 读旧 DOM。',
            'mutation 插入、更新、删除 DOM,并跑 useInsertionEffect。',
            '指针切换之后才是 layout:useLayoutEffect 和 componentDidMount / DidUpdate。',
        ],
        related: [{ to: '/internals/commit', label: 'Commit' }],
        body: [
            '提交开始时,屏幕上还是旧树。before mutation 能看到旧 DOM 的滚动位置、选区,把快照存下来,等 layout 再用。这一段如果去改 DOM,后面的 mutation 假设就被破坏了。',
            'mutation 才是真正改节点的地方。Placement 把新建的 DOM 插到父节点里,Update 把属性写上去,deletions 把旧子树摘掉。useInsertionEffect 放在这里,是为了让样式先于任何布局读取进入文档。ref 的挂载和卸载也在这一段:DOM 已经在树上,但浏览器还没绘制。',
            'mutation 做完,root.current 指向新树。从这一刻起,Fiber 和 DOM 重新成对。layout 在绘制前同步执行。useLayoutEffect 里读到的尺寸是新 DOM 的尺寸。整个 Commit 仍然是同步的,三个子阶段是同一段调用里的顺序,不是三次可以让出的任务。',
        ],
    },
    {
        id: 'q-commit',
        toc: '三种 effect 的时序',
        title: 'useInsertionEffect、useLayoutEffect、useEffect 各在什么时候跑？',
        note: '顺序比名字重要。说清绘制在哪一条缝里。',
        points: [
            'mutation 改 DOM,并在这里跑 useInsertionEffect。',
            '然后切换 current。useLayoutEffect 在绘制前同步执行。',
            'useEffect 排到绘制之后,避免挡住这一帧。',
        ],
        related: [{ to: '/internals/commit', label: 'Commit' }],
        body: [
            '提交先做 before mutation,类组件的 getSnapshotBeforeUpdate 在这里取快照。接着 mutation:插入、更新、删除 DOM。useInsertionEffect 比 layout 更早,给 CSS-in-JS 在读布局之前注入 style。它不该用来读布局或 setState。',
            'DOM 改完后,root.current 指向新树。layout 阶段仍在绘制之前,同步跑 useLayoutEffect 的销毁和创建,以及 componentDidMount / componentDidUpdate。这里读布局是安全的,因为 DOM 已是新的,像素还没画。在里面 setState 会再同步走一轮渲染,用户看不到中间帧,但主线程会被拉长。',
            'useEffect 由 Scheduler 排到绘制之后。适合请求和订阅。拿它做「先量再改位置」,用户会先看到没校正的一帧。前台标签里,一次点击的日志顺序是 layout,然后 requestAnimationFrame,然后 passive。标签页在后台时浏览器会推迟 rAF,它可能排到 passive 后面,那是绘制被挂起。',
        ],
    },
    {
        id: 'q-layout-setstate',
        toc: 'layout 里 setState',
        title: '在 useLayoutEffect 里 setState,用户为什么看不到中间那一帧？',
        note: '同步再走一轮,绘制被推迟到这轮 Commit 之后。',
        points: [
            'layout 还在绘制之前,此时 setState 走同步 Lane。',
            'React 会在浏览器画这一帧之前再跑完一轮 Render 和 Commit。',
            '能消掉闪烁,代价是主线程上连续两段提交。',
        ],
        related: [{ to: '/internals/commit', label: 'Commit' }],
        body: [
            'useLayoutEffect 的调用栈还在 Commit 里面。这里的 setState 被当成同步更新,flush 会把新的 Render 和 Commit 在返回浏览器之前做完。第一轮写进 DOM 的中间值,如果在第二轮又被改掉,浏览器还没把第一轮画出来,用户就只看到第二轮。',
            '这适合「量完尺寸再改坐标」这种必须在绘制前校正的事。把它当成普通的数据请求入口,就会让点击之后的那一帧一直等网络。请求放进 useEffect,绘制先发生,数据回来再更新。layout 里的 setState 还可能和父组件的 layout 叠在一起,形成额外的同步循环,所以只在读到布局、必须在绘制前修正时用。',
        ],
    },
    {
        id: 'q-cleanup',
        toc: '清理函数何时跑',
        title: 'effect 的清理函数是在下次 effect 之前,还是在卸载时？',
        note: '两次都跑,而且先全部销毁,再全部创建。',
        points: [
            '依赖变了:先跑上一次的清理,再跑这一次的创建。',
            '组件卸载:只跑清理,不再创建。',
            'layout 的清理在绘制前,passive 的清理在绘制后。',
        ],
        related: [{ to: '/internals/commit', label: 'Commit' }],
        body: [
            '每次 effect 提交时,React 保存的是「上一次的销毁函数」。下一次这个 Hook 要重新执行,会先调用那个销毁,再调用本次的创建。顺序是整棵树上该跑的销毁先走完,再走创建,避免新订阅还没建好、旧订阅已经把回调打到一半。依赖数组没变,这个 Hook 的销毁和创建都不会跑。',
            '卸载走 deletions。清理仍要调用,否则监听、定时器和订阅留在组件外面。passive 的清理不会阻塞卸载那一帧的绘制,它跟在绘制之后。若清理里要改 DOM 上还存在的节点,节点可能已经摘掉了,所以清理只应该放开外部资源,不应该假设自己的 DOM 还在布局里。',
            'StrictMode 在开发环境会多一次「创建、销毁、再创建」,用来暴露漏写的清理。生产环境不会为了检查而双调用。看到开发时请求打了两次,先确认是不是这次模拟卸载,再决定要不要改代码。',
        ],
    },
    {
        id: 'q-ref',
        toc: 'ref 何时挂上',
        title: 'ref 是在渲染过程中赋值的吗？',
        note: '渲染可以重做,所以 ref 的挂载放在提交。',
        points: [
            'Render 期间 ref.current 还是上一次提交的值,函数组件上通常仍是 null。',
            'mutation 阶段 DOM 插入之后,ref 才指向新节点;删除时先把 ref 置空。',
            '回调 ref 的调用也在提交,不在 render 函数体里。',
        ],
        related: [{ to: '/internals/commit', label: 'Commit' }],
        body: [
            '如果在 beginWork 里就把 ref 指到一个尚未插入的 DOM,渲染一旦被丢掉,这个引用会指向一棵不会出现的节点。所以 ref 的写入跟 DOM 变更放在一起。节点插入父节点之后,ref 回调或 ref 对象收到这个节点。节点被删除时,先传入 null 或把 current 置空,再摘 DOM,这样用户代码不会在 ref 里操作一个已经脱离文档的节点还以为它还在。',
            '因此渲染函数里读 ref.current,读到的是上一帧的节点,而且并发渲染下这次渲染可能重来,这个读取也不稳定。要在 DOM 更新之后读尺寸,用 useLayoutEffect,那时 ref 已经挂上,绘制还没发生。useEffect 里也能读到 ref,但已经晚于绘制。',
        ],
    },
    {
        id: 'q-insertion',
        toc: 'useInsertionEffect 给谁用',
        title: 'useInsertionEffect 和「在 layout 之前改样式」有什么不同？',
        note: '它是给样式注入留的缝,不是另一个 useLayoutEffect。',
        points: [
            '它在 mutation 阶段执行,早于 useLayoutEffect 读布局。',
            '典型用途是 CSS-in-JS 在读取 offsetWidth 之前把 style 插进文档。',
            '在里面 setState 或读布局,会把这条缝的假设破坏掉。',
        ],
        related: [{ to: '/internals/commit', label: 'Commit' }],
        body: [
            'useLayoutEffect 的约定是「DOM 已经是新的,可以量」。CSS-in-JS 如果等到 layout 才注入样式,量到的就是没样式时的尺寸,然后再注入,布局会跳。useInsertionEffect 把注入提前到 mutation,后面的 layout 读到的是带样式的盒子。',
            '这条缝很窄。注入应该是同步、短小、不触发新的渲染。在这里 setState,等于在 DOM 还没完全按这轮 flags 收尾时又排了一轮更新。业务代码几乎都应该停在 useLayoutEffect 或 useEffect。只有库在做「样式必须先于布局读取」时才碰 useInsertionEffect。',
        ],
    },
    {
        id: 'q-passive',
        toc: 'passive 为什么单独排',
        title: 'useEffect 为什么不在 Commit 的调用栈里直接跑？',
        note: '为了让浏览器先把这一帧画出来。',
        points: [
            'Commit 同步部分结束,浏览器才有机会绘制。',
            'passive 被 Scheduler 排成绘制之后的任务。',
            '所以 effect 里的 setState 会再占一帧,而不是堵在当前帧里。',
        ],
        related: [{ to: '/internals/commit', label: 'Commit' }],
        body: [
            '如果 useEffect 和 useLayoutEffect 一样同步执行,请求、日志、订阅的初始化都会挡在绘制前面。用户已经可以看的界面出不来。React 把 passive 标在 flags 上,提交的同步部分只负责把它们收成一条待执行列表,然后用 Scheduler 在绘制后 flush。',
            '这也解释了 effect 里 setState 会多一次渲染:这次渲染不可能挤进刚刚那一帧,它是绘制之后的新更新。连续的被动更新仍然会被批处理,但它们改变不了「当前帧先画旧的 effect 结果」这个事实。要消灭这多出来的一帧,要么把必须同步的校正放进 useLayoutEffect,要么在渲染期间就把派生值算出来,不要等 effect。',
        ],
    },
    {
        id: 'q-strict',
        toc: 'StrictMode 双调用',
        title: 'StrictMode 为什么让渲染和 effect 跑两次？是生产行为吗？',
        note: '开发期的可重入检查,不是每次 setState 都双倍执行。',
        points: [
            '开发环境会额外执行一次渲染,帮助发现不纯的 render。',
            '挂载时 effect 会走「执行、清理、再执行」,暴露漏掉的清理。',
            '生产构建不会为了检查而双调用。双调用也不是「每次更新都两次」。',
        ],
        related: [{ to: '/internals/commit', label: 'Commit' }],
        body: [
            '并发渲染允许 React 在提交前把组件函数再跑一遍,甚至跑完丢掉。函数如果在渲染期间改了外部变量、发了请求,第二次的结果就会和第一次不一致,或者请求发出去无法撤回。StrictMode 在开发环境主动多跑一次,把这种不纯提前变成看得见的重复日志。',
            'effect 的双调用是在模拟卸载再挂载。只在创建里加监听、不在清理里移除,开发时会看到两个监听。这不是 React 18 把你的点击处理执行了两次,也不是生产环境的性能模型。生产只保留一次挂载。把双调用当成 bug 去关 StrictMode,等于拆掉检查。',
        ],
    },
];
