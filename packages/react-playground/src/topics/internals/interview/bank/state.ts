/**
 * ============================================================================
 * state — 更新队列与 Hooks 链表
 * ============================================================================
 *
 * @module topics/internals/interview/bank/state
 */

import type { InterviewQuestion } from './types';

export const STATE: readonly InterviewQuestion[] = [
    {
        id: 'q-setstate',
        toc: 'setState 与批处理',
        title: 'setState 是立刻改状态吗？两次 setN(n + 1) 为什么只加 1？',
        note: '先讲入队,再讲批处理合并的是渲染次数。',
        points: [
            'setState 往 Hook 的更新队列追加一项,Render 时才从 base 算出 memoizedState。',
            '直接传入的值覆盖,不读取队列里前一次算出的结果。',
            'React 18 的 createRoot 在事件、超时、Promise 里都批处理。',
        ],
        related: [{ to: '/internals/update-queue', label: '更新队列' }],
        body: [
            '调用 setState 不会改当前屏幕上的 state,也不会改这次渲染闭包里的那个数。它创建一个更新,挂到这条 Hook 的队列上,再经 scheduleUpdateOnFiber 登记一次渲染。Render 时从 baseState 出发,按顺序处理优先级够的更新。函数式更新的参数是处理到它时的 base,所以三次「在当前值上加 1」得到加 3。两次 setN(n + 1) 的 n 都是这次渲染的那个数,后一次覆盖前一次,结果只加 1。',
            '批处理合并的是渲染次数,不是把两次更新合成一个更新对象。队列里仍然有多项,只是同一次 beginWork 里连续处理。所以函数式更新在批处理里仍然能看见彼此。React 18 起,createRoot 在 setTimeout 和 Promise 里同样批处理。遗留的 ReactDOM.render 根在超时里不批。flushSync 会在回调结束时立刻走完 Render 和 Commit,用来在下一步测量布局之前读到新 DOM,它也会拉长主线程。',
            '并发下,优先级不够的更新先留在队列里。急更新计算时,baseState 停在被跳过的那条之前,避免下一次把同一次点击应用两遍。',
        ],
    },
    {
        id: 'q-ring',
        toc: '更新队列为什么成环',
        title: '更新队列为什么是环,而不是一条普通的尾巴指针？',
        note: '环让「最后一项」同时能找到第一项。',
        points: [
            'pending 指向最后插入的更新,最后一项的 next 指向第一项。',
            '入队是常数时间:改最后一项的 next,再让 pending 指向新项。',
            '处理时从 pending.next 走到环回到起点,按顺序归约。',
        ],
        related: [{ to: '/internals/update-queue', label: '更新队列' }],
        body: [
            '一条更新要记住两头:从哪开始处理,新的更新接到哪。若只用头指针,追加就要走到尾,一次事件里多次 setState 会退化成线性扫描。环把尾变成入口。最后一项的 next 指回头,于是「尾」和「头」是同一个指针能表达的。',
            '处理时不能顺着 pending 本身开始,那是最新的一项。真正的第一项是 pending.next。归约从 baseState 出发,车道匹配的更新参与计算,不匹配的留在环里。算完,memoizedState 写成新结果,环要么缩短,要么留下被跳过的那一段。',
            '类组件和函数组件的队列形状相同,差别是函数组件的队列挂在 Hook 节点上,类组件的队列挂在 Fiber.updateQueue 上。「setState 进宏任务队列」说的是另一层:宏任务是 Scheduler 的任务,环是单个 Hook 上还没归约的更新。',
        ],
    },
    {
        id: 'q-fn-update',
        toc: '函数式更新看到谁',
        title: '函数式更新的参数为什么不是闭包里的 state？',
        note: '参数是归约到这一项时的 pending 结果。',
        points: [
            '闭包里的 state 是这次渲染的快照,入队时已经固定。',
            '更新函数在 Render 归约队列时才执行,参数是前一项算完的值。',
            '所以同一轮里多次函数式更新彼此可见,多次直接赋值则后者覆盖前者。',
        ],
        related: [{ to: '/internals/update-queue', label: '更新队列' }],
        body: [
            'setN(n + 1) 在创建更新的那一刻就把 n + 1 算完了,更新对象里放的是一个数。队列里若已有一项也算出了同一个 n + 1,两项结果相同,归约时后者覆盖前者。setN(function (value) { return value + 1 }) 放进队列的是函数。渲染时才调用它,value 是 baseState 经过前面那些更新之后的值。',
            '这也是异步回调里该用函数式更新的原因。setTimeout 触发时,组件可能已经又渲染过,回调捕获的 n 是旧的。函数式更新不读那个闭包,它读处理队列时的当前归约值。若在函数里做副作用,则会在渲染期间执行,可能执行不止一次。更新函数必须是纯计算。',
        ],
    },
    {
        id: 'q-base',
        toc: '跳过更新时 baseState',
        title: '高优先级渲染跳过了过渡更新,为什么不会在下次算两遍？',
        note: 'baseState 停在第一个被跳过的更新之前。',
        points: [
            '这一轮 Lane 不够的更新留在队列里,不参与本次 memoizedState。',
            'baseState 退回到第一个被跳过的更新之前,后面的高优先级结果也不写入 base。',
            '下一轮从同一个 base 重新归约,每条更新只生效一次。',
        ],
        related: [{ to: '/internals/update-queue', label: '更新队列' }],
        body: [
            '队列是有顺序的。若第 2 条是过渡更新,第 3 条是点击,这一轮只处理点击,不能把第 3 条的结果当成新的 baseState 提交掉,否则下一轮再从第 2 条算起时,第 3 条要么丢了,要么被再加一次。实现把 baseState 留在第 2 条之前,第 3 条的结果只作为这次渲染的 memoizedState,不推进 base。',
            '下次过渡更新终于进入渲染,从旧 base 开始,第 2 条和第 3 条按原来的顺序各算一次。用户看到的是:急更新先出现,过渡更新后到,且不会重复。把这个机制说成「React 会合并对象」是另一件事。对象合并发生在类组件的 setState 对象上,和 Lane 跳过不是同一个算法。',
        ],
    },
    {
        id: 'q-hooks',
        toc: 'Hooks 为什么看顺序',
        title: 'Hooks 为什么不能写在条件里？use 为什么可以？',
        note: '身份是第几次调用,不是变量名。',
        points: [
            'memoizedState 是链表。更新时游标从头部按调用次数往下取。',
            '中间插一次调用,后面的 Hook 会读到别人的节点。',
            'use 读 Context 或解开 Promise,不占 useState 这种槽,所以可以放在条件里。',
        ],
        related: [{ to: '/internals/hooks-impl', label: 'Hooks 链表' }],
        body: [
            '函数组件没有实例字段。状态挂在 Fiber.memoizedState 上。第一次渲染每调用一个 Hook 就新建节点接到链表尾部。之后的渲染先把游标拨回链表头,第几次调用就取第几个节点,读出上次的 memoizedState 和 queue。dispatch 的闭包记住自己那个节点,所以 setCount 不靠变量名找回状态。',
            '条件成立才多调用一次 useState,后面的 useRef、useEffect 全部错一位。数字可能暂时还显示得出来,因为节点里确实存着数字,但类型已经不对。循环里调用同样不安全,除非次数在这个组件的所有渲染里恒定。React Compiler 会重写组件,生成的代码仍然按固定顺序调用 Hook。编译器遵守链表,不废除链表。',
            'React 19 的 use 不往这条链表追加 useState 那种槽。use(promise) 未完成时 suspend,完成后从缓存读值。use(context) 在调用的那一行读当前值。其它 Hook 没有这条豁免。useContext 的消费者在值的 Object.is 比较失败时重渲染;中间层不会因此自动跳过,要靠 children 槽或 memo。',
        ],
    },
    {
        id: 'q-reducer',
        toc: 'useState 与 useReducer',
        title: 'useState 和 useReducer 是两套状态机吗？',
        note: 'useState 是自带基础 reducer 的 useReducer。',
        points: [
            '两者都在 Hook 上放 queue 和 memoizedState。',
            'useState 的更新函数是「有函数就调用,否则直接采用这个值」。',
            'dispatch 的身份在该 Hook 的生命周期内稳定,不随渲染改变。',
        ],
        related: [{ to: '/internals/hooks-impl', label: 'Hooks 链表' }],
        body: [
            'useReducer 把 reducer 存在 Hook 上。dispatch 被调用时只负责入队,不调用 reducer。reducer 在渲染归约时运行,因此必须是纯函数,同样可能因为并发和 StrictMode 执行多次。useState 没有让你传入 reducer,内部用一个基础 reducer 完成「函数式更新或直接覆盖」。',
            '所以选 useReducer 不是为了换一条更快的链表,而是当下一状态依赖多段当前状态、更新动作需要有名字时,把计算从组件函数里挪到 reducer。dispatch 稳定,子组件可以只接收 dispatch 而不因为父组件渲染就改变回调身份。这和 useCallback 包一层 setState 常常是重复的。',
        ],
    },
    {
        id: 'q-useref',
        toc: 'useRef 为什么不渲染',
        title: '改 ref.current 为什么不会触发渲染？',
        note: '它不创建更新,只改 Hook 节点上的一个对象。',
        points: [
            'useRef 的 memoizedState 是 { current } 这个对象,每次渲染返回同一引用。',
            '写 current 不调用 scheduleUpdateOnFiber。',
            '要让界面跟上这个值,必须另有一次 setState,或把它留在 DOM 上自己变。',
        ],
        related: [{ to: '/internals/hooks-impl', label: 'Hooks 链表' }],
        body: [
            'Hook 节点在第一次渲染时创建这个对象,之后每次从链表取出同一个对象返回。组件函数里拿到的 ref 身份不变,所以把它放进 effect 依赖不会因为「ref 变了」而重跑。变的是 current 字段,React 不订阅这个字段。',
            '这适合保存 DOM、定时器 id、以及「变了但不该单独引起渲染」的标记。用它存放界面要显示的数据,画面不会更新,因为没有更新入队,beginWork 不会因为 current 被赋值而再次执行。需要显示,就 setState。需要在事件里读到最新值、又不想把值放进依赖,可以同时放一份在 ref 里,在事件回调中读 ref,这和渲染用的 state 是两份,要自己保证同步。',
        ],
    },
    {
        id: 'q-usememo',
        toc: 'useMemo 把什么存下来',
        title: 'useMemo 和 useCallback 在链表里存的是什么？依赖怎么比？',
        note: '存的是上一次的值和依赖数组,比较是 Object.is。',
        points: [
            'Hook 的 memoizedState 是 [缓存值, 依赖数组]。',
            '每一项依赖用 Object.is 和上次比较,有一项不同就重新计算。',
            'useCallback 缓存的是函数本身,不是函数的返回值。',
        ],
        related: [{ to: '/internals/hooks-impl', label: 'Hooks 链表' }],
        body: [
            '渲染走到这个槽,取出上次的值和上次的依赖。依赖数组长度或某一项 Object.is 失败,就执行计算函数,把新值和这次的依赖写回槽里。全部相同,直接返回上次的值,计算函数不跑。依赖数组是渲染时读到的那些值的列表,不是一个会自动订阅的集合。漏写依赖,槽里会一直交回基于旧值算出的结果。',
            'useCallback(fn, deps) 等价于 useMemo(function () { return fn }, deps)。它稳住的是函数引用,好让子组件 memo 的浅比较成功。它不记住函数内部的计算结果,也不会让函数体更少执行:函数被调用时,该跑的逻辑仍会跑。计算本身昂贵,才用 useMemo 包计算。引用只是往下传,才用 useCallback。两者都不能代替「状态该不该存在」的判断。',
        ],
    },
    {
        id: 'q-effect-store',
        toc: 'effect 存在哪个字段',
        title: 'useEffect 的创建函数和依赖存在哪？和更新队列是同一个结构吗？',
        note: 'Hook 槽里一份,Fiber 上还有一条待提交的 effect 环。',
        points: [
            '每个 effect Hook 的 memoizedState 指向自己的 effect 对象,上面有创建函数、销毁函数和依赖。',
            '组件 Fiber 的 updateQueue 在函数组件上另有一条 effect 环,供 Commit 遍历。',
            '这和 setState 的更新环不是同一条。一个是副作用清单,一个是状态增量。',
        ],
        related: [
            { to: '/internals/hooks-impl', label: 'Hooks 链表' },
            { to: '/internals/commit', label: 'Commit' },
        ],
        body: [
            '渲染期间 useEffect 不执行创建函数。它把函数和依赖放进 effect 对象,挂到这个 Hook 上,并链进当前 Fiber 的 effect 列表,打上 Passive 标记。Commit 的同步阶段不调用它,只保证标记已经冒泡。绘制之后 flush passive effects,沿着这条清单比较依赖、跑销毁和创建。',
            '所以「effect 写在组件函数里」只是注册。真正的副作用不在 Render,也就不会因为渲染重做而发出两次不可撤销的请求——前提是你没在渲染函数体里直接发请求。依赖比较同样是 Object.is。对象和函数每次新建,effect 每次都会重跑。这不是 Commit 的 bug,是依赖身份每次都变了。',
        ],
    },
    {
        id: 'q-custom-hook',
        toc: '自定义 Hook 占哪些槽',
        title: '自定义 Hook 在链表上有自己的节点吗？',
        note: '没有。它只是一次函数调用,里面的每个 Hook 仍各占一槽。',
        points: [
            '自定义 Hook 不是 Fiber,也不是一种 Hook 类型。',
            '它内部的 useState、useEffect 按调用顺序接在组件的同一条链表上。',
            '两个组件调用同一个自定义 Hook,链表互不共享。',
        ],
        related: [{ to: '/internals/hooks-impl', label: 'Hooks 链表' }],
        body: [
            '组件函数执行时,游标在这条 Fiber 的链表上移动。自定义 Hook 就是中间被调用的普通函数,它里面第一次 useState 占用的是「当前游标」,不是一个名叫这个 Hook 的槽。所以自定义 Hook 的规则和组件一样:内部也不能条件调用,否则调用方后面的槽全部错位。',
            '复用的是函数,不是状态。两个组件各自有 Fiber,各自有链表,调用同一个 useToggle,得到两份独立的布尔值。想共享状态,要把状态放到两者共同的父组件、Context,或组件外的 store,而不是指望自定义 Hook 变成单例。',
        ],
    },
];
