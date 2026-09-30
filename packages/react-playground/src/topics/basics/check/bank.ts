/**
 * ============================================================================
 * bank — React 基础理解检验
 * ============================================================================
 *
 * 覆盖 JSX、列表、事件、函数组件和 RSC。后三组是本分类的核心子专题,题写得更深。
 *
 * @module topics/basics/check/bank
 */

import { countQuestions, numberGroups } from '../../../components/check/numberGroups';
import type { CheckGroup } from '../../../components/check/types';

const GROUPS: readonly CheckGroup[] = [
    {
        id: 'g-jsx',
        title: 'JSX 与渲染',
        blurb: '先分清描述和提交。JSX 不操作 DOM,它只描述这一次 UI。',
        questions: [
            {
                id: 'b-jsx',
                toc: 'JSX 产出什么',
                title: 'JSX 编译之后得到的是 DOM 节点吗？',
                note: '先说产物,再说谁去把产物变成屏幕。',
                points: [
                    'JSX 变成 React.createElement 调用,产物是普通对象。',
                    '对象上有 type、props、key,描述这一次 UI。',
                    'DOM 要等协调和提交,组件函数本身不创建节点。',
                ],
                related: [{ to: '/basics/jsx-render', label: 'JSX 渲染' }],
                body: [
                    '写下一个标签,构建工具把它收成函数调用。这个函数返回的是描述,不是 document.createElement 的结果。所以你可以在测试里、在服务端、在 React Native 里使用同一段 JSX,渲染器再决定怎么落地。',
                    '组件函数的返回值也是这棵描述。函数执行完,屏幕不一定已经变了。把「函数 return 了」理解成「DOM 已经插入」,后面的批处理、过渡更新和水合都会对不上。',
                ],
            },
            {
                id: 'b-pure',
                toc: '渲染要能重做',
                title: '为什么组件函数必须按当前 props 和 state 算出 UI,而不能在渲染里改 DOM？',
                note: '渲染可能重跑,副作用无法撤回。',
                points: [
                    '同一次输入应该得到同一次描述。',
                    '渲染期间发请求、改外部变量,重跑就会重复。',
                    '改 DOM、订阅、请求放到提交之后,或放到事件里。',
                ],
                related: [{ to: '/internals/render', label: 'Render' }],
                body: [
                    '开发环境的 StrictMode 会多跑一次渲染,并发渲染也可能在提交前把函数再执行一遍然后丢掉。渲染里如果改了页面标题、发出了请求,这些事不会跟着丢掉的那次计算一起消失。',
                    '正确的位置取决于时机。用户点击引起的请求放在事件里。需要在绘制后订阅,放在 useEffect。必须在绘制前量布局,放在 useLayoutEffect。渲染函数只负责根据这一次的输入返回描述。',
                ],
            },
            {
                id: 'b-fragment',
                toc: 'Fragment 解决什么',
                title: '什么时候用 Fragment,而不是再包一层 div？',
                note: '要的是分组,不是额外的盒子。',
                points: [
                    'Fragment 让多个孩子参加同一层比较,却不增加 DOM 节点。',
                    '多包的 div 会改变 flex、grid、表格和语义结构。',
                    '列表里要保住身份时,给 Fragment 一个稳定 key。',
                ],
                related: [{ to: '/basics/fragment', label: 'Fragment' }],
                body: [
                    '组件只能返回一个根。用 div 包起来能满足语法,但 DOM 上多了一个无意义的盒子。表格行、定义列表、flex 的直接子项对这个盒子很敏感,布局和选择器都会变。Fragment 在描述树里存在,在 DOM 里不占一层。',
                    '在 map 里返回多项时,带 key 的 Fragment 就是这一项的身份。不带 key 的 Fragment 只是透明分组,孩子会摊进父节点的那一层去比较。',
                ],
            },
            {
                id: 'b-conditional',
                toc: '条件渲染的坑',
                title: '为什么 {count && <Badge />} 在 count 为 0 时会在页面上写出 0？',
                note: '与运算的结果会被渲染,不只是布尔值。',
                points: [
                    '0、NaN 这类值是假,但它们不是 null,React 会把数字渲染出来。',
                    '想「没有就不画」,用三元运算返回 null。',
                    '条件切换组件类型或 key,会卸载下面的 state。',
                ],
                body: [
                    'JSX 里的表达式结果如果是字符串或数字,会变成文本。count && node 在 count 为 0 时整个表达式就是 0,于是界面上出现一个 0。布尔、null、undefined 不产生文本。',
                    '写成 count > 0 ? <Badge /> : null,意图和结果一致。若两个分支是不同类型的组件,切换时下面的输入状态会重置。想保住状态,就保持同一组件类型,只换 props。',
                ],
            },
            {
                id: 'b-children',
                toc: 'children 是什么',
                title: 'props.children 和自己在组件里写出来的 JSX 有什么差别？',
                note: 'children 是父组件已经创建好的描述。',
                points: [
                    'children 由父组件在自己的渲染里创建。',
                    '中间组件原样放下 children,子元素引用可以不变。',
                    '在中间层里根据条件重新创建孩子,父组件的那次创建就白费了。',
                ],
                body: [
                    '父组件写 <Shell><Expensive /></Shell> 时,Expensive 的描述在父组件的函数里诞生,然后作为 children 传进来。Shell 如果只是 return props.children,它并没有再调用 Expensive。',
                    '这是组合能跳过中间层的原因。Shell 因为无关的 state 又渲染了一次,只要它放下的还是同一个 children,里面的组件可以不必重做。在 Shell 内部写成 {open && props.children} 以外的新 JSX,就是一次新的描述。',
                ],
            },
        ],
    },
    {
        id: 'g-key',
        title: '列表与 key',
        blurb: 'key 解决的是「这还是刚才那一项」,不是让列表变快的开关。',
        questions: [
            {
                id: 'b-key-id',
                toc: 'key 是身份',
                title: '列表的 key 为什么不能用数组下标,也不能在渲染时随机生成？',
                note: '两种错误方向相反:一个认错人,一个谁都不认。',
                points: [
                    '没有稳定 key 时,位置就是身份。',
                    '下标在插入、删除、排序时会把 state 套到另一项。',
                    '每次渲染生成的随机 key 会让每一项都被当成新节点。',
                ],
                related: [{ to: '/basics/list-key', label: '列表与 key' }],
                body: [
                    '输入框、展开状态、选中态都住在对应的组件实例上。头部插入一项时,如果 key 是下标,原来第 0 项的实例会被拿来显示新的第 0 项,字还留在输入框里,但已经不属于刚才那个人。',
                    '渲染期间 Math.random() 或每次新建的 id,让协调器找不到任何可以复用的人。列表卸载再挂载,输入框失焦,请求按挂载再来一遍。稳定 id 要在数据创建时生成一次,渲染只读取。',
                ],
            },
            {
                id: 'b-key-scope',
                toc: 'key 的比较范围',
                title: 'key 是全局唯一的吗？改 key 会发生什么？',
                note: '比较只发生在同一父节点的同一层孩子之间。',
                points: [
                    '不同父节点下的相同 key 互不影响。',
                    '同一位置换 key,等于卸载旧的、挂上新的。',
                    '想重置一个子树的 state,可以改它的 key。',
                ],
                related: [{ to: '/basics/list-key', label: '列表与 key' }],
                body: [
                    'key 不是数据库主键的全局约束,它只帮助这一层把新旧孩子配对。两个列表里都可以有 key 为 1 的项。',
                    '故意改变 key 是重置手段:同一路由组件在用户 id 变化时换 key,里面的表单 state 会回到初始值。把它用在不该重置的地方,用户填写的内容会丢。',
                ],
            },
            {
                id: 'b-index-ok',
                toc: '下标何时可以',
                title: '下标 key 在什么条件下才可以接受？',
                note: '三个条件要同时成立。',
                points: [
                    '列表是静态展示,渲染期间不会重排、插入或删除。',
                    '子项自己没有内部 state。',
                    '缺一个条件,下标就会把状态或输入串到别的项上。',
                ],
                related: [{ to: '/basics/list-key', label: '列表与 key' }],
                body: [
                    '纯展示、顺序永远不变、子组件也不记自己的开关,这时位置和身份是一回事,下标碰巧能用。这是例外,不是默认。',
                    '开发环境缺少 key 时会警告。警告的含义是已经退化为按位置配对,风险和下标相同。生产构建不靠这条警告保护数据。',
                ],
            },
            {
                id: 'b-key-move',
                toc: '移动不是全部重建',
                title: '列表头部插入一项,是不是后面每一项都要移动 DOM？',
                note: '身份对上之后,移动标记另有规则。',
                points: [
                    '新 key 是新建,旧 key 对上就复用原来的实例。',
                    '只有旧位置比已经放过的位置更靠前,才标成移动。',
                    '头部插入通常不必把后面每一项都标成移动。',
                ],
                related: [
                    { to: '/basics/list-key', label: '列表与 key' },
                    { to: '/internals/render', label: 'Render' },
                ],
                body: [
                    '稳定 key 的价值先是认人,然后才是少做 DOM。认对了人,状态跟着那一项走。DOM 要不要移动,看的是旧序号和已经放置的位置,不是「只要顺序变了就全部挪」。',
                    '相邻交换时,通常只有被换到后面的那一个需要移动。把这个细节说成「错位之后全部删除重建」,就和实现不符。演练在列表专题和 Render 页。',
                ],
            },
        ],
    },
    {
        id: 'g-event',
        title: '事件',
        blurb: '委托点、传播路径、和原生监听的先后,是这一组要分清的三件事。',
        questions: [
            {
                id: 'b-delegate',
                toc: '委托在根上',
                title: 'React 的点击监听挂在每个按钮上吗？',
                note: 'React 17 起看根容器,不看 document。',
                points: [
                    '原生监听在 createRoot 的根容器上。',
                    '组件上的 onClick 只是 props,分发时再找出来调用。',
                    '一个页面上的多个根因此互不影响。',
                ],
                related: [{ to: '/basics/event', label: '事件与合成事件' }],
                difficulty: 3,
                focus: '委托点随版本变化,以及它和多根页面的关系',
                body: [
                    '列表很长时,给每个按钮绑原生监听既多又难清理。React 在根上听一次,点击到达根之后,按目标组件把 onClick 找出来。增删列表项不必反复绑定。',
                    'React 16 把监听放在 document 上,组件里的 stopPropagation 能挡住同在 document 上、注册得更晚的脚本。17 之后根在 document 里面,document 上已经跑过的捕获监听挡不住。这是版本差异,不是「合成事件没有冒泡」。',
                ],
            },
            {
                id: 'b-pool',
                toc: '事件池还在吗',
                title: '事件回调返回之后,还能读 event.target 吗？',
                note: '把 16 的对象复用和 17 的委托分开。',
                points: [
                    'React 16 会在回调结束后清空合成事件的字段。',
                    'React 17 删掉了事件池,字段还在。',
                    '委托还在。去掉的是对象复用,不是事件系统本身。',
                ],
                related: [{ to: '/basics/event', label: '事件与合成事件' }],
                difficulty: 3,
                focus: 'persist 和异步读事件属于哪一个版本',
                body: [
                    '旧文章要求 e.persist(),或在回调里先把字段拷出来,因为对象会被放回池里复用。React 17 起 persist 是空操作,异步函数里读事件字段可以得到当时的值。',
                    '仍然不建议在异步逻辑里依赖整个事件对象的生命周期。需要的是 id、值、坐标,就在回调里取出来放进自己的变量。这样不依赖事件对象活多久。',
                ],
            },
            {
                id: 'b-portal-event',
                toc: 'Portal 沿哪棵树冒泡',
                title: 'Portal 把按钮画到 body 下,父组件的 onClick 为什么还能收到？',
                note: 'DOM 父节点和组件父节点不是同一条路径。',
                points: [
                    'Portal 的 DOM 挂在容器上,Fiber 的父节点仍是调用者。',
                    '合成事件沿组件树走,所以父组件包得住。',
                    '原生监听沿 DOM 走,就走不到那个组件父节点。',
                ],
                related: [{ to: '/basics/event', label: '事件与合成事件' }],
                difficulty: 4,
                focus: '浮层关闭、点击穿透该听哪一条路径',
                body: [
                    '模态框常挂在 body 末尾,避免被 overflow 裁掉。若只认 DOM 冒泡,模态框里的点击到不了页面中间那个组件。React 仍沿组件父链收集 onClick,所以包住 Portal 的组件收得到。',
                    'document 上的原生监听看到的是 body 下的节点。用它判断「点到了外面」时,不能假设组件父节点的 DOM 包住了浮层。关闭逻辑要么走合成事件,要么明确排除 Portal 容器。',
                ],
            },
            {
                id: 'b-stop',
                toc: 'stop 与 prevent',
                title: 'return false、stopPropagation、preventDefault 各挡什么？',
                note: '三件事互不替代。',
                points: [
                    'return false 不会取消 React 里的默认行为。',
                    'stopPropagation 只停止继续传播。',
                    'preventDefault 才取消提交、链接跳转这类默认动作。',
                ],
                related: [{ to: '/basics/event', label: '事件与合成事件' }],
                difficulty: 3,
                focus: '默认行为、传播、返回值是三套开关',
                body: [
                    'jQuery 和旧的内联事件里,return false 常常同时表示停传播和取消默认。React 的事件函数没有这条约定。要取消表单提交,必须 preventDefault。',
                    'stopPropagation 让后面的 React 监听和根外面的冒泡听不到这次点击,但不取消链接或提交。子节点上的原生 stopPropagation 更早,事件可能根本到不了根,React 的 onClick 全部不会跑。',
                ],
            },
            {
                id: 'b-change',
                toc: 'onChange 是什么时候',
                title: 'React 的 onChange 和原生 change 是同一时机吗？',
                note: '受控输入看的是每次输入,不是失焦。',
                points: [
                    'React 的 onChange 对应输入过程中的 input 事件。',
                    '原生 change 多在失焦且值变了之后。',
                    '受控组件的 value 来自 state,不来自 DOM 自己记住的字。',
                ],
                related: [{ to: '/basics/event', label: '事件与合成事件' }],
                difficulty: 3,
                focus: '受控输入的事件时机',
                body: [
                    '每次击键都要更新 state,界面才能跟着走。若等原生 change,用户打字过程中受控值不会变。混用两套监听时,一个在击键时到,一个在失焦时到。',
                    '受控输入把 DOM 的值交给 state。漏掉 onChange,用户会觉得输入框被锁住,因为 React 每次都用旧 state 把 value 写回去。',
                ],
            },
            {
                id: 'b-batch',
                toc: '事件里的批处理',
                title: '同一次点击里两次 setState,会渲染几次？setTimeout 里呢？',
                note: 'React 18 的 createRoot 把批处理扩到了事件外面。',
                points: [
                    '同一次事件里的多次 setState 合成一次渲染。',
                    'createRoot 在超时和 Promise 里同样批处理。',
                    '批处理合并的是渲染次数,不是把两次更新合成一个对象。',
                ],
                related: [
                    { to: '/basics/event', label: '事件与合成事件' },
                    { to: '/internals/update-queue', label: '更新队列' },
                ],
                difficulty: 4,
                focus: '批处理的边界,以及函数式更新为什么仍然能看见彼此',
                body: [
                    '点击处理函数里连续两次 setState,React 等到这次事件的更新收齐再渲染。React 17 及更早,setTimeout 里不批,可能渲染多次。createRoot 之后,超时和 Promise 里也会收成一次。',
                    '两次 setCount(count + 1) 用的是同一次渲染里的 count,结果只加 1。两次函数式更新会在同一次渲染里按队列先后看见彼此,所以能加 2。想在下一行就读到新 DOM,才用 flushSync,它会把这一次提交提前做完。',
                ],
            },
        ],
    },
    {
        id: 'g-fn',
        title: '函数组件与类组件',
        blurb: '差别是快照和实例,不是谁的协调器更快。',
        questions: [
            {
                id: 'b-snapshot',
                toc: '一次渲染是一张快照',
                title: '函数组件里的 props 和 state 为什么不会在同一次渲染中途自己变掉？',
                note: '这次函数执行看到的是这一次的输入。',
                points: [
                    '每次渲染有自己的 props、state 和事件函数。',
                    'setState 不改当前这次函数里的变量。',
                    '类组件的 this.state 可能在实例上被后续逻辑读到别的时刻。',
                ],
                related: [{ to: '/basics/fn-vs-class-guide', label: '函数组件与类组件' }],
                difficulty: 3,
                focus: '快照心智,以及它和类实例字段的差别',
                body: [
                    '函数开始时,count 就是这次渲染的那个数。事件函数把这个数收进闭包。setCount 只是预约下一次渲染,当前函数剩下的代码看到的 count 不变。',
                    '类组件的渲染结果也来自当时的 props 和 state,但 this 活得比一次渲染长。异步回调里读 this.state,读到的是回调发生时的实例,不一定是创建回调那次渲染的值。函数组件要读最新值,用函数式更新,或在 effect 里用当时的依赖。',
                ],
            },
            {
                id: 'b-not-faster',
                toc: '函数组件不是更快',
                title: '为什么说偏向函数组件,却不能说 Hooks 比类组件快？',
                note: '合拍的是可重试的渲染。',
                points: [
                    '两种组件都在同一次协调里执行。',
                    '函数组件一次渲染就是一张快照,方便重做。',
                    '错误边界仍然只能写成类。',
                ],
                related: [{ to: '/basics/fn-vs-class-guide', label: '函数组件与类组件' }],
                difficulty: 4,
                focus: '组件模型和性能排名不是同一句话',
                body: [
                    '类组件的 render 和函数组件的函数体都是在算出这一次 UI。Fiber 不因为你用了函数就少做 Diff。Hooks 把状态放进调用顺序,也没有把提交变成增量 DOM 的捷径。',
                    '偏向函数组件,是因为状态、订阅和缓存可以按功能拆成函数再组合,副作用有明确的提交时机。类还留着,是因为渲染期错误要有类的生命周期才能接住。新代码默认函数组件,遇到错误边界再补一个类。',
                ],
            },
            {
                id: 'b-lifecycle',
                toc: '生命周期对到哪',
                title: 'componentDidMount 和 useEffect 是一回事吗？',
                note: '一个在绘制前,一个在绘制后。',
                points: [
                    'componentDidMount 在提交的 layout 阶段,绘制之前。',
                    'useEffect 在绘制之后。',
                    '要对齐「绘制前读写布局」,用 useLayoutEffect。',
                ],
                related: [{ to: '/basics/fn-vs-class-guide', label: '函数组件与类组件' }],
                difficulty: 4,
                focus: '迁移生命周期时有没有把绘制缝放错',
                body: [
                    '类组件在 DidMount 里量尺寸再 setState,用户往往看不到中间帧,因为还没画。原样改成 useEffect,会先画出未校正的一帧,再改。闪烁是时机错了,不是 setState 坏了。',
                    'DidMount 还承担订阅。订阅可以放在 useEffect,清理函数对应 WillUnmount。不要为了对齐名字,把数据请求放进 useLayoutEffect,那会挡住这一帧。',
                ],
            },
            {
                id: 'b-derived',
                toc: '派生不要另存',
                title: 'props 能算出来的值,为什么不要再放进 state,并在 effect 里同步？',
                note: '多一份状态就会多一次机会不一致。',
                points: [
                    '渲染期间可以直接从 props 算出派生值。',
                    '用 effect 把 props 抄进 state,会多一次渲染,还会短暂不一致。',
                    '只有用户编辑过的草稿才值得单独成为 state。',
                ],
                related: [{ to: '/basics/fn-vs-class-playground', label: '函数与类演练' }],
                difficulty: 3,
                focus: '什么时候数据是派生,什么时候是独立事实',
                body: [
                    '全名等于姓加名,过滤结果等于列表加关键字。这些在渲染时算即可。抄进 state 之后,props 先变、effect 再抄,中间那一次渲染用的是旧副本。',
                    '表单草稿不同:用户已经改过的字不能每次 props 更新都覆盖。那种情况 state 是另一份事实,重置要显式做,例如改 key 或在保存成功时写回。',
                ],
            },
            {
                id: 'b-boundary-class',
                toc: '错误边界仍是类',
                title: '函数组件为什么还接不住子树渲染时抛出的错误？',
                note: '接住的是渲染,不是事件里的 throw。',
                points: [
                    '错误边界用类的 getDerivedStateFromError 和 componentDidCatch。',
                    '它覆盖子树渲染和提交阶段的同步异常。',
                    '事件回调和异步回调不走这条边界。',
                ],
                related: [
                    { to: '/basics/fn-vs-class-guide', label: '函数组件与类组件' },
                    { to: '/advanced/error-boundary', label: 'Error Boundary' },
                ],
                difficulty: 4,
                focus: '失败半径,以及哪些错误根本不会进入边界',
                body: [
                    '渲染可以重做,所以渲染函数里的 throw 要在协调过程中被祖先接住,否则整棵树卸掉。这个能力目前只做在类组件上。函数组件没有对应的生命周期。',
                    '按钮 onClick 里的 throw 发生在事件分发,不在渲染。边界看不见,页面也不会自动换成降级 UI。那种错误要在回调里处理,或让它进入你能记录的通道。',
                ],
            },
        ],
    },
    {
        id: 'g-rsc',
        title: 'RSC',
        blurb: '本练习场是客户端应用,不能真的跑服务器组件。这里检验的是边界怎么划。',
        questions: [
            {
                id: 'b-rsc-not-ssr',
                toc: 'RSC 不是 SSR',
                title: '服务器组件和 SSR 是一回事吗？',
                note: '一个决定谁的代码进浏览器,一个决定谁先写出 HTML。',
                points: [
                    'SSR 把组件跑成 HTML,客户端仍会再执行这些组件。',
                    'RSC 的服务器组件输出描述,不会在浏览器里再跑一遍。',
                    '没有 RSC 也可以 SSR。有 RSC 也可以再把结果预渲染成 HTML。',
                ],
                related: [
                    { to: '/advanced/rsc-guide', label: 'RSC 梳理' },
                    { to: '/internals/ssr', label: 'SSR 与水合' },
                ],
                difficulty: 4,
                focus: '代码在哪执行,和 HTML 从哪来,是两个问题',
                body: [
                    '传统 SSR 的组件代码打进客户端包,水合时再执行,才能绑上事件。服务器组件的逻辑留在服务端,浏览器拿到的是已经算好的 UI 描述和客户端组件的插槽。',
                    '所以「页面是服务端渲染的」回答不了包里有没有这段逻辑。交互、状态、浏览器 API 在客户端组件里。只负责取数和拼结构的部分可以留在服务器组件。',
                ],
            },
            {
                id: 'b-rsc-boundary',
                toc: '边界是包的切点',
                title: '为什么说每写一个 use client,就是一次包和序列化的边界？',
                note: '边界两边能传什么,比文件放哪更重要。',
                points: [
                    'use client 标的是这个模块以及它导入的客户端图。',
                    '从服务器组件传进客户端组件的 props 必须可序列化。',
                    '函数、类实例、服务端连接不能当 props 传过去。',
                ],
                related: [{ to: '/advanced/rsc-boundary', label: 'RSC 边界' }],
                difficulty: 4,
                focus: '边界切在哪,以及载荷里能有什么',
                body: [
                    '客户端模块一旦被标出,它和它依赖的交互代码进入浏览器包。把整页标成客户端,服务器组件的减包收益就没了。边界应下沉到真正有状态和事件的叶子。',
                    'props 要穿过网络或进程,所以是数据,不是回调闭包里的数据库客户端。需要行为时,用服务器函数这类单独协议,而不是把任意函数塞进 props。',
                ],
            },
            {
                id: 'b-rsc-children',
                toc: '客户端包住服务器组件',
                title: '客户端组件为什么不能 import 服务器组件,却可以用 children 接住它？',
                note: 'import 会把对方拉进自己的模块图,children 是已经算好的槽。',
                points: [
                    '客户端模块 import 服务器组件,会把对方也拉进客户端图。',
                    '服务器组件把算好的 UI 作为 children 传给客户端外壳。',
                    '外壳负责交互,槽里的内容仍然在服务端完成。',
                ],
                related: [{ to: '/advanced/rsc-guide', label: 'RSC 梳理' }],
                difficulty: 5,
                focus: '组合方向:谁创建描述,谁只负责放下槽',
                body: [
                    'import 决定模块图。客户端文件一旦导入服务器组件,构建就无法把那段逻辑留在服务端。这是依赖方向,不是运行时 if。',
                    '父级如果是服务器组件,它可以先渲染一段服务器 UI,再把它当作 children 交给客户端的侧栏或对话框。客户端组件只把 children 放进布局,不必知道里面怎么取数。这和前面的 children 槽是同一结构,只是创建描述的那一端在服务端。',
                ],
            },
            {
                id: 'b-rsc-when',
                toc: '什么时候不要上 RSC',
                title: '什么样的界面不该为了 RSC 重切一遍？',
                note: '先看有没有服务端可做、客户端不该带走的工作。',
                points: [
                    '强交互、几乎没有秘密取数的工具界面,边界收益很小。',
                    '已有客户端数据层时,硬切服务器组件会制造两套事实。',
                    '本练习场是纯客户端应用,这里只检验边界,不执行服务器组件。',
                ],
                related: [{ to: '/advanced/rsc-guide', label: 'RSC 梳理' }],
                difficulty: 4,
                focus: '生产选型,而不是「新版本就该全换」',
                body: [
                    'RSC 适合把数据读取、大依赖和只用于拼首屏的逻辑留在服务端。一个本地状态很重的看板,如果数据本来就在浏览器里,切服务器组件不会让交互变快,只会增加边界。',
                    '团队已经用查询库管理服务端状态时,先定哪一份是事实,再决定谁取数。两套缓存各写各的,页面会一时新一时旧。选型看工作在哪一端做更合适,不看文件能不能标成服务器组件。',
                ],
            },
            {
                id: 'b-rsc-effect',
                toc: '首屏数据不放 effect',
                title: '为什么服务器组件里不写 useEffect 去补首屏数据？',
                note: 'effect 发生在浏览器提交之后,HTML 里来不及有这份数据。',
                points: [
                    'useEffect 不在服务端执行。',
                    '首屏需要的数据要在渲染描述之前就拿到。',
                    'effect 适合浏览器才有的订阅,不适合唯一的数据来源。',
                ],
                related: [{ to: '/advanced/rsc-guide', label: 'RSC 梳理' }],
                difficulty: 3,
                focus: '数据属于渲染输入,还是属于提交之后的副作用',
                body: [
                    '服务器组件在服务端执行函数体来产出描述。useEffect 的语义是绘制之后,服务端没有这次绘制,所以创建函数不会跑。把请求只放在 effect 里,首屏 HTML 是空的,还要等客户端再请求一次。',
                    '客户端组件里同样如此:能作为渲染输入的数据不要等 effect 再抄进 state。effect 留着做订阅、和浏览器 API 同步,以及那些确实要在提交之后才发生的事。',
                ],
            },
            {
                id: 'b-rsc-client-state',
                toc: '状态放哪一侧',
                title: '搜索框的输入状态应该放在服务器组件里吗？',
                note: '击键是浏览器里的事实。',
                points: [
                    'state、事件、浏览器 API 属于客户端组件。',
                    '服务器组件可以提供初始数据和静态结构。',
                    '输入回显必须同步,不能等一次服务端往返。',
                ],
                related: [{ to: '/advanced/rsc-boundary', label: 'RSC 边界' }],
                difficulty: 3,
                focus: '交互叶子和数据叶子怎么切',
                body: [
                    '每打一个字都要立刻出现在输入框里。这是客户端 state。把输入框做成服务器组件,击键没有地方可放。列表的初始数据、权限和不会变的文案可以在服务端算好再传下来。',
                    '过滤如果只是客户端已有列表上的关键字,就在客户端算。过滤如果是一次新的服务端查询,输入仍在客户端,提交查询再用过渡更新或新的请求,不要让每个击键都阻塞回显。',
                ],
            },
        ],
    },
];

export const BASICS_GROUPS = numberGroups(GROUPS);
export const BASICS_COUNT = countQuestions(BASICS_GROUPS);
