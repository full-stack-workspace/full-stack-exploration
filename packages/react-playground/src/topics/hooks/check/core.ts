/**
 * ============================================================================
 * core — Hooks 理解检验:状态、引用、effect
 * ============================================================================
 *
 * @module topics/hooks/check/core
 */

import type { CheckQuestion } from '../../../components/check/types';

export const STATE_QUESTIONS: readonly CheckQuestion[] = [
    {
        id: 'h-snapshot',
        toc: 'state 是快照',
        title: '同一次渲染里连续两次 setCount(count + 1),为什么只加 1？',
        note: '先看读到的是哪一次的 count。',
        points: ['count 是这次渲染的快照,两次读取相同。', '直接传入的值覆盖,不读取队列里前一次的结果。', '函数式更新在归约时看见前一项的结果。'],
        related: [{ to: '/hooks/use-state', label: 'useState' }],
        body: [
            'setCount 不改当前函数里的 count。两次 setCount(count + 1) 放进队列的是同一个数。渲染时后者覆盖前者。',
            'setCount(function (value) { return value + 1 }) 放进队列的是函数。处理到它时,参数是已经叠加过的值,所以两次能加 2。更新函数里不要做副作用,它可能执行不止一次。',
        ],
    },
    {
        id: 'h-async-stale',
        toc: '异步里的旧值',
        title: 'setTimeout 里读到的 count 为什么经常是旧的？',
        note: '定时器抓住的是创建它那次渲染的闭包。',
        points: ['定时器回调看见的是当时的 count。', '期间又渲染了,旧回调不会自动换成新值。', '要基于最新值计算,用函数式更新。'],
        related: [{ to: '/hooks/use-state', label: 'useState' }],
        difficulty: 3,
        focus: '闭包里的快照和「最新值」不是同一个东西',
        body: [
            '点击时 count 是 1,三秒后的回调仍打印 1,哪怕中间已经加到 5。回调不是活引用,它记住的是创建时的绑定。',
            '如果三秒后要在最新值上加 1,不要读那个闭包,用函数式更新。如果三秒后要读最新值做别的事,把最新值放进 ref,在回调里读 ref.current,并自己保证和 state 同步。',
        ],
    },
    {
        id: 'h-batch-18',
        toc: '哪里会批处理',
        title: 'React 18 的 createRoot 在哪些地方会把多次 setState 收成一次渲染？',
        note: '批处理合并渲染次数,不合并更新对象。',
        points: ['事件、超时、Promise 里都会批。', '遗留的 ReactDOM.render 根在超时里不批。', 'flushSync 会在回调结束时立刻提交。'],
        related: [{ to: '/internals/update-queue', label: '更新队列' }],
        difficulty: 3,
        focus: '批处理边界随根的创建方式变化',
        body: [
            'createRoot 之后,不必再把 setTimeout 里的多次 setState 手动包进 unstable_batchedUpdates。它们会一起渲染。函数式更新在这一次渲染里仍然按顺序看见彼此。',
            '需要在下一行测量新 DOM 时才用 flushSync。它关掉让出,立刻走完提交,主线程会被拉长。不要用它包大列表。',
        ],
    },
    {
        id: 'h-immutable',
        toc: '不要改原对象',
        title: '为什么 setUsers(users) 之前先 push,界面可能不更新？',
        note: '同一引用会被当成没变。',
        points: ['state 按不可变数据来对待。', '改原数组再把同一个引用传回去,比较可能认为没有变化。', '用新数组或新对象表达下一次状态。'],
        related: [{ to: '/hooks/use-state', label: 'useState' }],
        body: [
            'React 用 Object.is 判断这次设置的值和当前值是否相同。push 改的是原数组,传回去的仍是它,比较认为没变,可能跳过渲染。即便渲染了,其它拿着旧引用的地方也分不清变没变。',
            '替换成新数组:展开后追加,或 toSpliced、map、filter 这类返回新值的写法。嵌套字段同样要换沿途的对象,不能只改深层然后指望外层引用通知所有人。',
        ],
    },
    {
        id: 'h-lazy-init',
        toc: '惰性初始值',
        title: 'useState(compute()) 和 useState(function () { return compute() }) 差在哪？',
        note: '一个每次渲染都算,一个只在第一次算。',
        points: ['直接传入的表达式每次渲染都会执行。', '函数形式只在挂载时用来算初始值。', '初始值很贵,或要读 localStorage 时用函数形式。'],
        related: [{ to: '/hooks/use-state', label: 'useState' }],
        body: [
            'useState 的参数如果不是函数,React 只在第一次使用它,但你的表达式在进入 useState 之前已经执行了。所以每次渲染都在白算。',
            '传入函数,React 只在创建这条 state 时调用。不要把会变的 props 放进这个函数指望它以后跟着变。初始值只用一次。以后要跟着 props 变,在渲染时派生,或显式重置。',
        ],
    },
    {
        id: 'h-object-merge',
        toc: '对象不会自动合并',
        title: 'useState 的对象和类组件的 setState 对象,合并方式一样吗？',
        note: '函数组件里你传什么,下一次就是什么。',
        points: ['类组件的 setState 对象会浅合并到 this.state。', 'useState 用新值整个替换。', '只想改一个字段,就在新对象里带上其它字段。'],
        related: [{ to: '/hooks/use-state', label: 'useState' }],
        difficulty: 3,
        focus: '从类迁移时最容易丢字段的一处',
        body: [
            '类组件 setState({ name }) 会留下 age。useState 如果写成 setUser({ name }),下一次 user 上没有 age。这不是合并失败,是替换。',
            'setUser(function (user) { return { ...user, name } }) 才是改一个字段。字段很多、更新动作需要名字时,用 useReducer 把这些替换写在一处。',
        ],
    },
    {
        id: 'h-same-value',
        toc: '设成同一个值',
        title: 'setState 传进一个 Object.is 相等的值,还会再渲染吗？',
        note: '相等会结束这次更新,但要说清比较发生在归约之后。',
        points: ['归约结果和当前 state 相同,React 可以跳过这次渲染。', '函数式更新仍会跑,只是结果相同就不再往下通知。', '对象每次都是新引用,即使字段相同也不会被当成同一个值。'],
        related: [{ to: '/hooks/use-state', label: 'useState' }],
        difficulty: 4,
        focus: '跳过渲染的条件是值的身份,不是字段看起来一样',
        body: [
            'setCount(0) 而当前已经是 0,这次更新可以不引起渲染。这是退出条件,不是「setState 永远渲染」。',
            'setUser({ ...user, name: user.name }) 得到新对象,Object.is 失败,会渲染。想表达「没变」,就不要创建新对象,或者在更早的地方判断后再决定要不要 setState。',
        ],
    },
    {
        id: 'h-upward',
        toc: '状态该放哪',
        title: '什么时候该把 state 抬到父组件,什么时候该留在子组件？',
        note: '谁需要在渲染里读它,它就住在谁能传到的地方。',
        points: ['只有自己用的交互状态留在本地。', '兄弟要一起读,抬到最近的公共父级。', '抬太高会让无关子树跟着渲染。'],
        related: [{ to: '/advanced/component-comm-guide', label: '组件通信' }],
        body: [
            '输入框没提交前的字、悬停、是否展开,如果外面不关心,就不要抬上去。抬上去之后,每次击键都从父级再渲染下来。',
            '两个兄弟要显示同一份选中项,状态放在最近公共父级,用 props 传下去、用回调报上去。更远、读者很多、中间层不关心,才考虑 Context 或外部 store。那是通道选择,不是 useState 不够用。',
        ],
    },
];

export const REDUCER_QUESTIONS: readonly CheckQuestion[] = [
    {
        id: 'h-reducer-same',
        toc: '和 useState 同源',
        title: 'useReducer 是另一套状态吗？',
        note: '它是把「下一状态怎么算」命名出来。',
        points: ['两者都是队列加 memoizedState。', 'useState 是自带基础 reducer 的 useReducer。', 'dispatch 的身份稳定,适合传给子组件。'],
        related: [{ to: '/hooks/use-reducer', label: 'useReducer' }],
        body: [
            'dispatch 被调用时只入队,reducer 在渲染归约时才执行,所以 reducer 必须是纯函数。它可能因为并发或 StrictMode 执行多次。',
            '下一状态依赖多段当前状态,或同一种更新在多处发生,用 action 把意图说清楚。只是一个数字加减,useState 足够。选 reducer 不是为了更快。',
        ],
    },
    {
        id: 'h-reducer-pure',
        toc: 'reducer 里不能请求',
        title: '为什么不能在 reducer 里发请求或写 localStorage？',
        note: '归约发生在渲染期间。',
        points: ['reducer 用来从旧 state 和 action 算出新 state。', '渲染可能重做,副作用会重复。', '请求放在事件里,算完再 dispatch 结果。'],
        related: [{ to: '/hooks/use-reducer', label: 'useReducer' }],
        difficulty: 3,
        focus: '纯计算和副作用的边界',
        body: [
            'reducer 没有「只跑一次」的保证。在里面 fetch,可能打出两次请求,而且返回值和 state 计算缠在一起,不好测。',
            '事件里启动请求,成功后再 dispatch 一个结果 action。reducer 只负责把这个结果收进 state。这样重试、失败和竞态都在事件或专门的请求逻辑里,不在计算函数里。',
        ],
    },
    {
        id: 'h-reducer-init',
        toc: '惰性初始化',
        title: 'useReducer 的第三个参数是干什么的？',
        note: '把昂贵的初始 state 留到第一次。',
        points: ['第三个函数只在创建时把初始参数变成 state。', '适合从 props 或存储算出复杂初始值。', '它不会在以后的 props 变化时再跑。'],
        related: [{ to: '/hooks/use-reducer', label: 'useReducer' }],
        body: [
            'init(initialArg) 让你把「第一次的 state」从渲染路径里挪开,避免每次渲染都构造大对象。reducer 仍然从那份初始 state 开始接收 action。',
            'props 后来变了,不会自动重新 init。需要重置时改组件的 key,或 dispatch 一个显式的重置 action,把新的 props 放进 action。',
        ],
    },
    {
        id: 'h-reducer-vs-many',
        toc: '多个 state 还是一个',
        title: '多个 useState 和一次 useReducer,怎么选？',
        note: '看更新是不是总是一起发生。',
        points: ['彼此独立的字段可以分开,更新互不影响。', '一个动作要同时改多字段,放进同一个 reducer 更不容易漏。', '不要为了「只有一个 state」把无关的东西捆在一起。'],
        related: [{ to: '/hooks/use-reducer', label: 'useReducer' }],
        body: [
            '分开的 state 让每次 set 的影响面更清楚,也避免一个大对象每次都换新引用、带着无关字段往下传。',
            '提交订单要同时改状态、错误和草稿,三个 setState 容易只写了两个。一个 action 在 reducer 里一次写完,测试也可以直接对 reducer 做。字段如果真的独立,就不要合成一个大 reducer 让所有动作挤在一处。',
        ],
    },
];

export const REF_QUESTIONS: readonly CheckQuestion[] = [
    {
        id: 'h-ref-render',
        toc: '改 ref 不渲染',
        title: '为什么改 ref.current 不会触发渲染？',
        note: '它不创建更新。',
        points: ['useRef 每次返回同一个对象。', '写 current 不调度渲染。', '界面要跟着变,必须另有 setState。'],
        related: [{ to: '/hooks/use-ref', label: 'useRef' }],
        body: [
            'ref 对象存在 Hook 槽里,身份跨渲染不变。React 不订阅 current。所以它适合放 DOM、定时器 id,以及「变了但不该单独画一次」的标记。',
            '把要显示的数字只放在 ref 里,画面不会变。需要显示就用 state。需要在事件里读到最新数字、又不想把它放进 effect 依赖,可以 state 和 ref 各放一份,并在写 state 的同时写 ref。',
        ],
    },
    {
        id: 'h-ref-when',
        toc: '渲染时读不到新 DOM',
        title: '为什么渲染函数里 ref.current 经常还是 null？',
        note: 'ref 在提交时才挂上。',
        points: ['渲染可以重做,所以不能在渲染时把 ref 指到尚未提交的节点。', 'mutation 阶段插入 DOM 之后,ref 才指向它。', '要在绘制前量尺寸,用 useLayoutEffect。'],
        related: [
            { to: '/hooks/use-ref', label: 'useRef' },
            { to: '/internals/commit', label: 'Commit' },
        ],
        difficulty: 4,
        focus: 'ref 的写入时机',
        body: [
            '第一次渲染时 DOM 还没提交,current 是 null。渲染函数里读它,读到的是上一帧的节点,而且这次渲染可能被丢掉。',
            'useLayoutEffect 里 ref 已经挂上,绘制还没发生,适合量完再改位置。useEffect 里也能读到,但已经晚于绘制,用户可能先看到没校正的一帧。',
        ],
    },
    {
        id: 'h-ref-callback',
        toc: '回调 ref',
        title: '回调 ref 和对象 ref 怎么选？',
        note: '需要在挂上和卸下时做事情,用回调。',
        points: ['对象 ref 只保存节点。', '回调 ref 在挂载时收到节点,在卸载时收到 null。', '回调身份每次变化,会先用 null 再挂上新的。'],
        related: [{ to: '/hooks/use-ref', label: 'useRef' }],
        difficulty: 3,
        focus: '测量和第三方实例的生命周期',
        body: [
            '只是稍后 focus 或 scroll,对象 ref 足够。要在节点出现时初始化一个图表库、消失时销毁,回调 ref 把这两刻交给你。',
            '内联的回调函数每次渲染都是新的。React 会先用 null 调用旧回调,再用节点调用新回调。如果初始化很贵,把回调用 useCallback 稳住,或确认这样的重挂是可接受的。',
        ],
    },
    {
        id: 'h-forward',
        toc: '不要转发 ref 的旧写法',
        title: 'React 19 里怎么把 ref 传给函数组件？',
        note: 'ref 是普通 prop,不再包 forwardRef。',
        points: ['函数组件直接接收 ref 参数。', 'forwardRef 是旧的包装。', '把 DOM 节点赋给这个 ref,父组件才能拿到。'],
        related: [{ to: '/hooks/use-imperative-handle', label: 'useImperativeHandle' }],
        body: [
            '父组件写 ref,子组件在参数里拿到它,再把它放到真正的 DOM 或子组件上。中间不需要 forwardRef。',
            '不要把整个子组件的内部 state 通过 ref 暴露出去。ref 用来做命令:聚焦、滚动、播放。数据仍然用 props 和回调。',
        ],
    },
    {
        id: 'h-imperative',
        toc: '命令句柄',
        title: 'useImperativeHandle 解决什么问题？什么时候不该用？',
        note: '它缩小父组件能调用的面。',
        points: ['父组件拿到的不是 DOM,而是你明确返回的几个方法。', '依赖变化时句柄会重建。', '能用 props 表达的状态,不要改成命令。'],
        related: [{ to: '/hooks/use-imperative-handle', label: 'useImperativeHandle' }],
        difficulty: 4,
        focus: '命令和数据的边界',
        body: [
            '视频播放器对父组件只暴露 play 和 pause,而不是整个 video 元素。父组件不能随便改内部 DOM,组件可以换实现。',
            '如果父组件要知道「现在播到哪」,那是数据,应该用回调或 state 抬上去,而不是让父组件隔一会儿来读一个命令句柄。命令句柄不参与渲染,读它不会让父组件更新。',
        ],
    },
    {
        id: 'h-ref-list',
        toc: '一组 DOM',
        title: '列表里每一项都要一个 DOM 引用时,ref 怎么放？',
        note: '不要在渲染期间假设下标永远是同一个人。',
        points: ['用一个 ref 保住 Map,key 用数据 id,不用下标。', '回调 ref 在卸载时把对应项从 Map 删掉。', '下标会在重排之后指到别人的节点。'],
        related: [{ to: '/hooks/use-ref', label: 'useRef' }],
        difficulty: 4,
        focus: '身份和 DOM 引用一起走',
        body: [
            '一个 useRef 可以装一个 Map。每一项用自己的 id 登记节点。排序之后,id 还在,节点还在,不会因为位置变了就把 A 的节点当成 B。',
            '组件卸载时回调收到 null,从 Map 里删除,避免留下已经脱离文档的节点。不要给每一项单独声明一个顶层 useRef,列表长度不固定,那样违反 Hook 顺序。',
        ],
    },
];
