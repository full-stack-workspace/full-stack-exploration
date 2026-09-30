/**
 * ============================================================================
 * architecture — Fiber 与运行时分工
 * ============================================================================
 *
 * @module topics/internals/interview/bank/architecture
 */

import type { InterviewQuestion } from './types';

export const ARCHITECTURE: readonly InterviewQuestion[] = [
    {
        id: 'q-fiber',
        toc: '为什么换成 Fiber',
        title: '为什么 React 要用 Fiber 换掉栈协调器？',
        note: '先讲主线程被占住,再讲进度存在哪。',
        points: [
            '栈协调器把进度压在 JavaScript 调用栈里,一次递归返回之前让不出主线程。',
            'Fiber 把子、兄弟、父收成节点上的指针,遍历改成循环,每一步都可以停。',
            '停下来是为了把点击和绘制插进来,不是为了让总计算量变少。',
        ],
        related: [{ to: '/internals/fiber', label: 'Fiber' }],
        body: [
            '早期协调器用递归走组件树。父函数调用子函数,子函数再调用孙函数,整棵树返回之后这次更新才结束。树一大,这一次调用就会超过一帧。浏览器排不上点击,也画不出下一帧。问题不是「递归一定慢」,是工作做到哪一步藏在调用栈里,React 无法在中途把栈存起来再继续。',
            'Fiber 把这一帧调用栈上的信息收进节点自己:第一个孩子是 child,下一个兄弟是 sibling,父节点是 return。performUnitOfWork 变成循环。时间不够,就把下一个 Fiber 的引用留在根上,下次从那里继续。更高优先级的更新进来,未提交的副本可以整段丢掉,屏幕上的树不动。',
            '所以回答时把「可暂停」说成数据结构的结果,不要说成「Fiber 比虚拟 DOM 更快」。Fiber 是工作单元,虚拟 DOM 在实现里是这次渲染返回的 React Element。',
        ],
    },
    {
        id: 'q-element',
        toc: 'Element、Fiber、DOM',
        title: 'React Element、Fiber、真实 DOM 各是什么？',
        note: '纠正「造两棵虚拟 DOM 再 Diff」这句。',
        points: [
            'Element 是这次 render 返回的不可变描述:type、key、props、ref。',
            'Fiber 跨渲染复用,上面有链表指针、memoizedState、alternate、stateNode。',
            '真实 DOM 只在 Commit 里被创建或改写,stateNode 指向它。',
        ],
        related: [{ to: '/internals/runtime-map', label: '运行时总览' }],
        body: [
            'JSX 编译之后调用 react 包,产出普通对象。这个对象只描述「这一次 UI 应该是什么」,用完就可以丢。协调器拿它和已有 Fiber 比 type 与 key。对得上就复用 Fiber、更新 props;对不上就卸载旧子树、挂上新子树。',
            '实现并不是先造两棵完整的不可变树,再跑一次通用树编辑距离。每次渲染只重新执行走到的组件函数。bailout 成功的子树连函数都不会再调用。虚拟 DOM 的价值是声明式和跨平台:同一套 Element 可以交给 DOM、React Native 或测试渲染器。它不保证「JavaScript 对象一定比操作 DOM 快」。',
        ],
    },
    {
        id: 'q-roles',
        toc: '三个包怎么分工',
        title: '协调器、渲染器、调度器各管什么？',
        note: '先把三个包拆开,再讲一次更新从哪进、从哪出。',
        points: [
            'react 包只生产 Element 和 Hook 的调度入口,不碰 DOM。',
            'react-reconciler 持有 Fiber,负责对比、打标记、决定什么时候停。',
            'react-dom 是渲染器,负责创建 DOM、绑定事件、水合;Scheduler 只负责何时把任务排上主线程。',
        ],
        related: [{ to: '/internals/runtime-map', label: '运行时总览' }],
        body: [
            '一次点击先进入渲染器注册的事件监听,再调用组件里的 setState。setState 不改 DOM,它在协调器里创建更新,经 scheduleUpdateOnFiber 决定这次更新的 Lane,然后向 Scheduler 登记一个任务。任务真正跑起来时,协调器在 workInProgress 上做 beginWork 和 completeWork。算完之后,渲染器在 Commit 里按 flags 改 DOM。',
            '所以「React 更新 DOM」这句话把三件事捏在一起了。协调器不知道 div 在浏览器里长什么样,它只产出「这个宿主节点要插入、这个属性要改」。渲染器把宿主节点翻译成 DOM、Native 视图或测试用的假节点。Scheduler 甚至不认识 Fiber,它只认识带优先级和过期时间的任务。把这三层说反,后面的 Diff、时间片、水合都会串。',
        ],
    },
    {
        id: 'q-walk',
        toc: '三指针怎么走',
        title: 'child、sibling、return 是怎么把递归改成循环的？',
        note: '能在纸上走出「向下、向右、向上」再答可中断。',
        points: [
            '有 child 就向下,这是 beginWork。',
            '没有 child 就 complete,然后找 sibling;没有 sibling 就沿 return 向上,直到某个祖先有下一个兄弟。',
            '循环每一步只拿着「下一个 Fiber」的引用,所以时间片可以停在任意节点。',
        ],
        related: [{ to: '/internals/fiber', label: 'Fiber' }],
        body: [
            '递归的调用栈同时记着「我在哪个函数、返回之后该去哪」。链表把这两件事拆开。向下走时,当前节点的 child 就是下一步。这个节点的孩子都完成了,sibling 指向同一层的下一个。一层走完,return 回到父节点,父节点再看自己的 sibling。没有全局栈数组,进度就是根上保存的那个指针。',
            'completeWork 发生在「准备离开这个节点」的时刻,不是在进入的时刻。进入时决定孩子是谁,离开时为宿主节点准备实例,并把自己的 flags 并进父节点的 subtreeFlags。所以一次深度优先和递归的访问顺序相同,差别是每访问一个节点都可以把指针存下来、把主线程还回去。下次恢复不是从调用栈弹出,而是从这个指针再进入循环。',
        ],
    },
    {
        id: 'q-fields',
        toc: 'Fiber 上要分清的字段',
        title: 'Fiber 上哪些字段必须分开记？',
        note: '不要把 memoizedState、updateQueue、stateNode 说成同一个「状态」。',
        points: [
            'type 和 key 用来认人,tag 用来区分函数组件、类组件、宿主节点、Fragment。',
            'memoizedState 放 Hook 链表或类组件的 state;updateQueue 放还没算完的更新。',
            'stateNode 指向真实实例:DOM 节点或类组件实例。函数组件通常没有它。',
        ],
        related: [{ to: '/internals/fiber', label: 'Fiber' }],
        body: [
            '认人靠 type 加 key。同一个函数组件在列表里出现两次,type 相同,key 不同,就是两个 Fiber,两条 Hook 链表,互不相通。tag 决定 beginWork 走哪条分支:函数组件调用函数,类组件调用 render,宿主组件去协调孩子而不是再执行一段 JS 组件。',
            'memoizedState 是「上次提交之后认账的结果」。函数组件里它是 Hook 链表的头。类组件里它是 this.state。updateQueue 是「还没处理的增量」。把这两个字段说成一个,就解释不了为什么 setState 之后、下一次渲染之前,闭包里的 state 还是旧的。pendingProps 是这次渲染父级传下来的,memoizedProps 是上次用过的。bailout 比较的就是这两者,再加 context 和 lanes。',
            'stateNode 只在需要真实实例时才有。div 的 stateNode 是那个 DOM 元素,类组件的 stateNode 是类实例。函数组件的状态不在实例上,所以你在函数里找不到 this,也找不到一块可以随便挂字段的对象。想跨渲染留一个可变值,走 useRef,它住在 Hook 节点里,不住在 stateNode 上。',
        ],
    },
    {
        id: 'q-buffer',
        toc: '双缓冲',
        title: '双缓冲是怎么工作的？',
        note: '讲清哪棵树在屏幕上,切换发生在哪一步。',
        points: [
            'current 是已提交的树,stateNode 连着屏幕上的 DOM。',
            'workInProgress 通过 alternate 和 current 上的对应节点成对。',
            'Commit 里 root.current 指向 finishedWork,旧树留下轮复用。',
        ],
        related: [{ to: '/internals/fiber', label: 'Fiber' }],
        body: [
            '一次更新的计算写在 workInProgress 上。Render 阶段只填这棵副本:beginWork 向下决定孩子,completeWork 向上为宿主节点准备 DOM 实例并打标记。屏幕上的 current 在这期间不变。因此渲染被打断或丢弃时,用户看不到写了一半的界面。',
            '提交时,DOM 变更和指针切换放在同一段同步工作里。root.current 改指向这棵新树之后,原来的 current 变成下一轮的 workInProgress,节点对象被复用,避免每帧分配一整棵新树。alternate 就是这两棵树上「同一个逻辑节点」之间的缝。',
            '复用的是 Fiber 对象,不是把两棵树上的 DOM 各建一份。宿主节点的 DOM 只有一个,挂在当前认账的那棵树的 stateNode 上。workInProgress 在 completeWork 里要么复用这个 DOM,要么新建一个、等 Commit 再插进去。所以双缓冲不是「内存里两份界面」,是「一份屏幕,加一份可以丢掉的计算草稿」。',
        ],
    },
    {
        id: 'q-bailout',
        toc: '什么时候整棵跳过',
        title: 'bailout 到底跳过了什么？',
        note: '跳过的是组件函数和子树协调,不是「React 没渲染」。',
        points: [
            'props、state、context 都没变,并且这条子树上没有待处理的 Lane,才可以 bailout。',
            'bailout 不调用子组件函数,直接把 current 的子链表克隆到 workInProgress。',
            '父组件渲染了,不代表每个孩子的函数都执行了。',
        ],
        related: [{ to: '/internals/render', label: 'Render' }],
        body: [
            'beginWork 进入一个组件 Fiber 时,先看这次更新的 Lane 是否落在这个节点或其子树的 lanes / childLanes 上。再看 pendingProps 和 memoizedProps 是否还能当成同一份输入。类组件还会看 context 和 shouldComponentUpdate。函数组件配合 memo 时,比较发生在协调器里,不是在你的函数第一行。',
            '条件成立,React 不再调用这个组件,也不再对它的孩子做 Diff。它把 current 上已经完成的子 Fiber 克隆过来,标记成沿用。这就是「父组件 setState 之后,被 memo 住的孩子函数没有执行」的内部原因。memo 的比较是浅比较,对象字面量每次都是新引用,比较失败,bailout 就不会发生。',
            '子树里如果有人被标记了更新,父组件即使 props 没变也不能整棵跳过,否则那次更新没人处理。所以 bailout 看的是「这棵子树有没有事」,不是只看当前节点的 props。「React 只渲染变化的组件」这句太满:从根到变化点的路径默认都会走到,变化点以下才可能被跳过。',
        ],
    },
    {
        id: 'q-lanes-store',
        toc: 'Lane 存在哪',
        title: '一次更新的优先级存在 Fiber 的什么地方？',
        note: '不要把 Lane 说成 DOM 属性,也不要说成 Scheduler 堆里的数字。',
        points: [
            '单次更新自己带着 lane。',
            'Fiber.lanes 是这个节点上还没处理完的更新,childLanes 是子树里还有事。',
            '根上的 pendingLanes 决定下一轮渲染要带上哪些 lane。',
        ],
        related: [
            { to: '/internals/fiber', label: 'Fiber' },
            { to: '/internals/scheduler', label: 'Scheduler' },
        ],
        body: [
            'Lane 是位掩码。一次点击产生的更新、一次 startTransition 产生的更新,可以同时挂在同一个 Hook 的队列上,用不同的位区分。渲染开始时,协调器选出这一轮包含哪些位。处理队列时,位不在这一轮里的更新被跳过,留到以后。',
            '跳过不是忘掉。Fiber.lanes 把这些未完成的位留在节点上,再沿父链并进 childLanes。下一轮开始时,根看到 childLanes 不为空,就知道必须走进这棵子树,不能因为父 props 没变就 bailout。这就是并发更新不会丢的结构原因。',
            'Scheduler 那边没有这条位掩码。它只看到「有一个并发任务,优先级大约是 Normal,过期时间是多少」。位运算发生在协调器里。两套优先级在 scheduleUpdateOnFiber 交汇:先定 Lane,再映射成 Scheduler 的优先级去排队。',
        ],
    },
];
