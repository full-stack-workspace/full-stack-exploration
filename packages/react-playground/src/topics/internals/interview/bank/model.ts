/**
 * ============================================================================
 * model — SSR、水合、组件模型
 * ============================================================================
 *
 * @module topics/internals/interview/bank/model
 */

import type { InterviewQuestion } from './types';

export const MODEL: readonly InterviewQuestion[] = [
    {
        id: 'q-ssr',
        toc: 'SSR、水合、RSC',
        title: 'SSR、水合、RSC 怎么区分？',
        note: '三句话各管一件事,不要合成「服务端渲染」。',
        points: [
            'SSR 在服务端把组件跑成 HTML。useEffect 不会在服务端跑。',
            '水合用 hydrateRoot 把已有 DOM 绑到 Fiber 上,并补上 HTML 里没有的事件。',
            'RSC 产出的是载荷。服务器组件不会在浏览器里再跑一遍。没有 RSC 也可以 SSR。',
        ],
        related: [
            { to: '/internals/ssr', label: 'SSR 与水合' },
            { to: '/advanced/rsc-guide', label: 'RSC 梳理' },
        ],
        body: [
            'renderToPipeableStream 遇到 Suspense 可以先把壳推走,边界里先输出 fallback,数据到了再推一段 HTML 和内联脚本,把 fallback 换掉。字先出现在页面上,此时客户端的 React 还没执行。useLayoutEffect 在服务端没有布局可读,出现它会警告。',
            'hydrateRoot 走和客户端渲染相似的 beginWork,但 completeWork 复用已有节点并核对标签、文本、属性。对得上就挂上事件。对不上,React 19 把不匹配收成一次错误,并用客户端渲染换掉那棵子树。重渲能恢复交互,服务端白做的那一段 HTML 被扔掉了,日期、随机数、非法嵌套这些原因仍然要修。水合完成前,提前发生的点击会先被记下,等 Fiber 绑好再重放。所以「字先出来、按钮稍后再能点」是这套模型的正常间隙。',
            '选择性水合会优先处理用户正在点击的那一块 Suspense。RSC 是另一条管线:服务器组件的输出是描述 UI 的载荷,客户端组件仍然在浏览器执行,也可以再被预渲染成 HTML。水合绑定的是已经写成 HTML 的那棵树,RSC 载荷本身不是 HTML。',
        ],
    },
    {
        id: 'q-mismatch',
        toc: '水合对不上怎么办',
        title: '水合不匹配时,React 19 做了什么？哪些写法一定会碰上？',
        note: '先能交互,再追究为什么服务端白渲染了。',
        points: [
            '不匹配收成一次错误,客户端把那棵子树用自己的渲染结果换掉。',
            '日期、随机数、只在浏览器存在的分支、非法 DOM 嵌套,都会对不上。',
            '换掉能恢复点击,但服务端的那段 HTML 被丢弃,闪烁和错误日志还在。',
        ],
        related: [{ to: '/internals/ssr', label: 'SSR 与水合' }],
        body: [
            '服务端按当时的 props 写出一段文本。客户端再执行同一组件,如果 new Date() 或 Math.random() 在两次执行里不同,文本 Fiber 对不上。浏览器独有的 window 判断会让服务端走一个分支、客户端走另一个分支,整枝的标签都不一样。p 里面嵌 div 这类非法结构,浏览器会先改 DOM,React 再对时也对不上。',
            'React 19 不再为每一处差异刷一条警告然后留下残缺树。它报告一次,并用客户端渲染重建不匹配的子树,事件绑在新 DOM 上。交互回来了,但用户可能看到文字换了一下,服务器做的工作也废了。修法是让两端的渲染输入一致:时间放到 effect 或明确的客户端组件里,随机数放进稳定的数据,分支不要靠只在一端存在的全局对象。',
        ],
    },
    {
        id: 'q-server-effects',
        toc: '服务端不跑哪些 Hook',
        title: '服务端渲染会执行哪些 Hook,不会执行哪些？',
        note: '会走到渲染,不会走到提交后的 DOM 生活。',
        points: [
            '函数体会执行,useState 会用初始值,useMemo 会在服务端算一次。',
            'useEffect 不在服务端执行。useLayoutEffect 在服务端没有布局,会警告。',
            '所以首屏要的数据不能等 effect,effect 里的请求来不及进 HTML。',
        ],
        related: [{ to: '/internals/ssr', label: 'SSR 与水合' }],
        body: [
            '服务端要产出 HTML,就必须执行组件函数,于是 useState 的初始 state、useMemo 的计算、useId 的生成都会发生。这些结果写进 HTML。客户端水合再执行一遍函数,Hook 链表按同样顺序重建,初始 state 必须一致,否则第一帧就不匹配。',
            'useEffect 的语义是提交并且绘制之后。服务端没有这次提交后的浏览器绘制,所以创建函数不跑。把数据请求只放在 effect 里,HTML 里就没有这份数据,首屏要等客户端再请求一次。useLayoutEffect 如果在服务端被忽略、在客户端又改 DOM,水合之后会再闪一次。依赖布局的校正留在客户端可以,但不要让它改变服务端已经写出的那份文本。',
        ],
    },
    {
        id: 'q-selective',
        toc: '选择性水合',
        title: '选择性水合为什么能先响应被点到的那一块？',
        note: '水合也是可中断的工作,点击会提高那条边界的优先级。',
        points: [
            'HTML 可以先到,水合按 Suspense 边界分成多段。',
            '用户点到某一块,那一块的水合被提前,其它块让路。',
            '点在还没水合的节点上,事件会先被记下,绑好 Fiber 再重放。',
        ],
        related: [{ to: '/internals/ssr', label: 'SSR 与水合' }],
        body: [
            '整页一次性水合,大页面会在 JS 下来之后再占住主线程很久,期间点什么都没反应。流式渲染把页面拆成边界之后,水合也可以按边界做。没点到的边界可以稍后,点到的边界优先把 Fiber 绑上并挂上监听。',
            '点击发生时如果目标还只有 HTML,没有 Fiber,React 把这次事件存下来。这一块水合完成,再按组件树把事件重放。所以「按钮先出现、稍后再能点」的间隙可以被缩短到用户真正点的那一块,而不是必须等整页全部绑完。这仍然不是 RSC。选择性水合处理的是已经写成 HTML 的客户端树。',
        ],
    },
    {
        id: 'q-fn',
        toc: '为什么偏向函数组件',
        title: '为什么 React 更偏向函数组件和 Hooks？',
        note: '合拍的是可重试的渲染,不是「Hooks 更快」。',
        points: [
            'Fiber 同样跑类组件。Hooks 不是另一套协调器。',
            '函数组件一次渲染就是一次快照,和「Render 可能重来」合拍。',
            'Hooks 让有状态逻辑按功能拆开再组合。类组件的优势只剩错误边界这类仍必须用类的能力。',
        ],
        related: [
            { to: '/internals/hooks-impl', label: 'Hooks 链表' },
            { to: '/basics/fn-vs-class-guide', label: '函数组件与类组件' },
        ],
        body: [
            'Fiber 解决的是「渲染工作怎么组织、暂停和提交」。函数组件和 Hooks 解决的是「开发者怎么描述 UI、存放状态、把逻辑合在一起」。两件事配合,不能说成 Fiber 只能支持函数组件,也不能说 Hooks 天生比类组件快。类组件的 render 同样在 beginWork 里被调用,实例挂在 stateNode 上。',
            '偏向函数组件,是因为渲染模型变成了「用当前的 props 和 state 算出这一次 UI」。Render 可以重做,组件函数就必须能重入,不能在计算过程里改 DOM 或发请求。类组件把这些事分散在生命周期里,容易把「这一次的快照」和「实例上一直活着的字段」混在一起。Hooks 把状态、订阅、缓存按调用顺序放进 Fiber 的链表,副作用明确推到提交之后。复用时抽的是函数,不是继承一层类。',
            '错误边界仍然只能用类组件的 getDerivedStateFromError 和 componentDidCatch。新代码优先函数组件,遇到错误边界再补一个类。这是能力边界,不是性能排名。',
        ],
    },
    {
        id: 'q-context',
        toc: 'Context 谁会重渲染',
        title: 'Context 值变了,中间组件会不会被跳过？',
        note: '消费者会更新。中间层跳过要靠别的手段。',
        points: [
            'Provider 用 Object.is 比较 value,不同才通知消费者。',
            '消费者所在的路径会因为这条更新走进去,中间组件默认也会渲染。',
            '要跳过中间层,用 children 槽把子树当 props 传入,或让中间组件 memo。',
        ],
        related: [{ to: '/advanced/context', label: 'Context API' }],
        body: [
            'Context 不是「只有 useContext 那一行的组件会渲染,别的都不跑」。更新从提供 value 的位置调度下来,协调器仍从那棵子树往下走。途中的组件函数会执行,除非它们满足 bailout。消费者保证会看到新值;非消费者如果 props 每次都是新对象,也会跟着执行。',
            'children 槽的办法是:父组件渲染昂贵子树,把结果作为 children 传给中间那层。中间层即使因为 Context 渲染,只要它渲染时原样放下 children,子元素的引用不变,里面的 Fiber 可以 bailout。memo 则是中间组件自己的 props 浅比较成功。两种都是额外结构,不是 Context 的默认行为。value 写成对象字面量时,每次渲染都是新引用,所有消费者都会更新,即使字段一个没变。',
        ],
    },
    {
        id: 'q-boundary',
        toc: '错误边界为什么还是类',
        title: '错误边界为什么还不能写成函数组件？它接住的是哪一段错误？',
        note: '接住渲染和生命周期,不接住事件回调里的异常。',
        points: [
            'getDerivedStateFromError 和 componentDidCatch 只在类组件上。',
            '它接住的是子树渲染、构造、以及提交阶段的同步异常。',
            '事件回调、异步回调、服务端错误不走这条边界。',
        ],
        related: [{ to: '/basics/fn-vs-class-guide', label: '函数组件与类组件' }],
        body: [
            '渲染可以重试,所以渲染函数里抛出的错误必须在协调过程中被某个祖先接住,否则整棵树卸载。这个祖先用类的静态方法在渲染阶段提供降级 state,再用 componentDidCatch 做日志。函数组件没有对应的槽来表达「我是边界」,所以这条能力还留在类上。',
            'onClick 里的 throw 发生在事件分发,不在 beginWork。错误边界看不见它,要在回调里自己 try,或让错误进入你能记录的位置。setTimeout、Promise 的拒绝也在渲染之外。SSR 里的错误走服务端的处理,不是浏览器里这个类实例的 componentDidCatch。说「有了错误边界就不会白屏」时,要加上它覆盖的是子树渲染,不是全部异常来源。',
        ],
    },
    {
        id: 'q-compiler',
        toc: 'Compiler 废除规则了吗',
        title: 'React Compiler 会不会让 Hook 可以写在条件里？',
        note: '它帮你遵守规则,不改链表的身份模型。',
        points: [
            '编译器把组件重写成按固定顺序调用 Hook 的代码。',
            '缓存和依赖由编译结果维护,手写的 useMemo 不再是唯一手段。',
            '条件调用若让次数变化,编译器也不会把链表变成按名字寻址。',
        ],
        related: [{ to: '/internals/hooks-impl', label: 'Hooks 链表' }],
        body: [
            'Compiler 在构建时看组件的控制流,把 Hook 调用稳定在每次渲染都会走到的位置,并自动插入记忆化,让下游 memo 更容易 bailout。运行时的 Fiber 仍然用调用顺序取槽。所以编译之后的代码看起来可以少写 useCallback,不是运行时突然按变量名找到了状态。',
            '你仍然不能在运行时让同一次渲染的 Hook 次数跟另一次不同。编译器拒绝或改写的,正是这种会错位的写法。use 的条件调用是另一条 API,不经过这套槽。把 Compiler 理解成「规则没了」,就会把链表和编译优化说成互相替代。它们是前后两层。',
        ],
    },
    {
        id: 'q-actions',
        toc: 'Actions 是新协调器吗',
        title: 'Actions、useActionState、useOptimistic 位于哪一层？',
        note: '它们是过渡更新上的用法,不是 Fiber 旁边的第二套渲染器。',
        points: [
            'Action 把一次提交包成可以等待的过渡,pending 来自过渡还没提交。',
            'useOptimistic 在过渡未完成时先显示一份临时 state,失败或完成再对齐。',
            '协调、Diff、Commit 仍是原来的路径。变的是更新的 Lane 和这段异步的协议。',
        ],
        related: [
            { to: '/internals/scheduler', label: 'Scheduler' },
            { to: '/advanced/rsc-guide', label: 'RSC 梳理' },
        ],
        body: [
            '表单的 action 可以是一个异步函数。提交时 React 用过渡 Lane 包住这次更新,所以输入不必被网络卡住,isPending 可以驱动按钮的禁用态。函数结束、数据回来,再有一次更新把真实结果提交上去。useActionState 把「入参、上一份 state、异步函数」收成一个 Hook,槽位仍在普通链表里。',
            'useOptimistic 在过渡进行中先把界面改成预期结果,例如先把评论插进列表。它不是跳过服务器,而是另存一份只在 pending 期间显示的 state。请求失败,过渡没有提交成功的结果,乐观值撤掉。说这是新的虚拟 DOM 或新的事件系统,就把它的层级说高了。它调度的仍是 setState 那条链。',
        ],
    },
];
