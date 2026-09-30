/**
 * ============================================================================
 * events — 合成事件
 * ============================================================================
 *
 * @module topics/internals/interview/bank/events
 */

import type { InterviewQuestion } from './types';

export const EVENTS: readonly InterviewQuestion[] = [
    {
        id: 'q-why-event',
        toc: '为什么要合成事件',
        title: 'React 为什么不直接让组件监听原生事件？',
        note: '委托、传播路径、和更新的入口是三件一起的事。',
        points: [
            '监听挂在根容器上,而不是每个按钮一个原生监听。',
            '传播按 Fiber 的 return 走,所以 Portal 和禁用的组件也能按组件树解释。',
            '事件回调是更新进入调度的常见入口,批处理从这里开始。',
        ],
        related: [{ to: '/internals/events', label: '合成事件' }],
        body: [
            '每个节点都 addEventListener,列表一大,监听数量就跟节点走。委托到根上,原生监听只有一份,组件上的 onClick 只是 props。分发时再按目标把 props 找出来调用。新增和删除列表项不必反复绑定原生监听。',
            '另一半是传播模型。原生冒泡认 DOM 父节点。React 的按钮可以画到另一棵 DOM 里,组件意义上的父节点却在原处。沿 Fiber 收集监听,才能让「包住按钮的那个组件」的 onClick 仍然包得住。',
            '回调跑在 React 的分发里,setState 才能被这次事件收成一批。若绕过合成系统,在原生监听里 setState,React 18 的 createRoot 仍然会批处理,但你失去的是传播路径和事件对象的统一。混用时要单独考虑 stopPropagation 挡的是哪一层。',
        ],
    },
    {
        id: 'q-events',
        toc: '委托点与事件池',
        title: '合成事件委托在哪？事件池还在吗？',
        note: 'React 17 的两个变化要分开说:委托点,和对象复用。',
        points: [
            'React 17 起监听在 createRoot 的根容器上,不在 document。',
            '分发时从目标 Fiber 沿 return 收集,先捕获再冒泡。Portal 的 DOM 父节点变了,React 父节点不变。',
            '事件池在 React 17 删除。回调返回之后字段仍然可读。',
        ],
        related: [
            { to: '/internals/events', label: '合成事件' },
            { to: '/basics/event', label: '事件与合成事件' },
        ],
        body: [
            '原生点击先按 DOM 走捕获和冒泡。React 在根容器上注册监听,事件到达根时,从目标组件的 Fiber 沿 return 收集 onClickCapture,再收集 onClick,按这个顺序调用。所以按钮上的一次点击,顺序是外层捕获、内层捕获、按钮、内层冒泡、外层冒泡。Portal 把按钮画到 body 下之后,DOM 上的父节点变了,React 仍沿 Fiber 找到组件树里的父节点。路径来自 Fiber,不是 event.composedPath 的原样重放。',
            'React 16 的监听在 document 上。组件里的 stopPropagation 可以挡住同在 document 上、注册得更晚的脚本。17 之后事件先经过 document 才进入根,组件里的 stopPropagation 拦不住已经在 document 上跑过的监听。一个页面上的多个 React 根也因此互不影响。',
            'React 16 会在回调结束后把合成事件的字段清空,所以当时要 persist,或先把字段拷出来。React 17 删掉了事件池。委托还在,去掉的是对象复用。笔记里如果还写「回调之后事件被置空」,那是 16 的行为。',
        ],
    },
    {
        id: 'q-path',
        toc: '捕获和冒泡怎么收集',
        title: '一次点击,监听函数的调用顺序是怎么排出来的？',
        note: '先沿 return 收集捕获,到底再反向冒泡。',
        points: [
            '从目标 Fiber 走到根,收集 onClickCapture,调用时是根到目标。',
            '然后从目标走到根,调用 onClick。',
            '中间某个组件没有监听,就跳过,不改变方向。',
        ],
        related: [{ to: '/internals/events', label: '合成事件' }],
        body: [
            '原生事件到达根容器时,目标 DOM 已经通过内部映射找到了对应 Fiber。React 不是在每个 Fiber 上注册过原生监听,而是临时沿 return 走一遍,把有对应 props 的函数收进数组。捕获数组按「先根后叶」调用,冒泡数组按「先叶后根」调用。这和 DOM 的捕获再冒泡同构,只是节点换成了组件 Fiber。',
            'stopPropagation 写在合成事件上,会阻止数组里还没调用的那些 React 监听,也会阻止原生事件继续向根的外面冒泡。它阻止不了已经跑完的 document 捕获监听。目标上同时有捕获和冒泡时,捕获先于目标的冒泡。不要用「React 事件都是冒泡」概括,捕获 props 是单独收集的。',
        ],
    },
    {
        id: 'q-portal',
        toc: 'Portal 的事件路径',
        title: 'Portal 把节点挂到 body 下,父组件的 onClick 为什么还能收到？',
        note: 'DOM 父节点变了,Fiber 的 return 没变。',
        points: [
            'createPortal 的孩子在 DOM 上挂到容器,在 Fiber 上仍是调用者的子树。',
            '分发沿 return 走到组件父节点,所以父组件的 onClick 仍然包住它。',
            '原生 DOM API 沿 parentNode 走,就走不到那个组件父节点。',
        ],
        related: [
            { to: '/internals/events', label: '合成事件' },
            { to: '/basics/event', label: '事件与合成事件' },
        ],
        body: [
            '模态框要盖住全页,DOM 往往挂在 body 末尾,否则会被中间某层 overflow 或层叠上下文裁掉。若事件也只认 DOM,模态框里的点击冒泡不到页面中间那个组件,外部点击关闭、表单父级监听都会断。Fiber 的 return 仍指向渲染 Portal 的那个组件,合成事件因此还能按组件树冒泡。',
            '这只覆盖 React 的监听。你在 document 上用原生冒泡监听去判断「点到了模态框外面」,DOM 路径是 body 下的模态框,组件路径是另一条。两条路径不一致时,关闭逻辑要用合成事件,或者显式看 Portal 容器,而不是假设父组件的 DOM 包住了模态框。',
        ],
    },
    {
        id: 'q-native',
        toc: '和原生监听混用',
        title: '组件里 stopPropagation,为什么挡不住 document 上的原生监听？',
        note: '先看原生监听注册在捕获还是冒泡,再看它在根的里面还是外面。',
        points: [
            'document 的捕获监听早于根容器,React 还没分发就已经跑了。',
            '根容器上的 React 监听跑完,document 的冒泡监听才跑到。',
            '子节点上的原生 stopPropagation 能让事件到不了根,React 就收不到。',
        ],
        related: [{ to: '/basics/event', label: '事件与合成事件' }],
        body: [
            'React 17 把委托从 document 挪到根容器,就是为了让页面上其它脚本和多个 React 根的 document 监听不再互相吞掉。顺序变成:document 捕获、根的捕获分发、目标、根的冒泡分发、document 冒泡。组件里的 stopPropagation 发生在根的分发过程中,document 捕获已经结束。',
            '反过来,如果在按钮上直接 addEventListener 并 stopPropagation,原生事件不再向根冒泡,React 的根监听不会触发,组件树上的 onClick 全部没有。混用时把原生监听当成另一套传播,不要假设合成事件的 stop 和原生的 stop 挡的是同一批函数。',
        ],
    },
    {
        id: 'q-click-lane',
        toc: '点击进哪条 Lane',
        title: 'onClick 里的 setState 是同步优先级吗？和 React 17 的 discrete 是什么关系？',
        note: '默认是同步 Lane,批处理的是同一事件里的多次更新。',
        points: [
            '普通 onClick 的 setState 用 Sync Lane,这次事件结束前会提交。',
            '同一事件里的多次 setState 合成一次渲染,不是合成一个 state 对象。',
            'React 17 把点击叫 discrete 并在事件结束时 flush;18 起自动批处理扩展到超时和 Promise,点击仍然会在事件里提交。',
        ],
        related: [{ to: '/internals/update-queue', label: '更新队列' }],
        body: [
            '输入和点击不能等空闲。它们的默认 Lane 是同步的,工作循环不让出,Commit 在这次事件处理的批处理点完成。所以你在 onClick 里 setState,然后在同一个函数后面读 DOM,读到的仍可能是旧的,因为 Commit 要等到函数结束、批处理提交。想在同一函数里读新 DOM,才需要 flushSync。',
            'React 17 的 unstable_batchedUpdates 和 discrete 更新,是当时只在事件里批、在 setTimeout 里不批的模型。createRoot 之后,超时和 Promise 里也会批。这个变化不把点击变成可中断的过渡。要点击可中断,得自己把那次 setState 放进 startTransition。',
        ],
    },
];
