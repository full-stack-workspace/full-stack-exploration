/**
 * ============================================================================
 * render — beginWork、Diff、flags
 * ============================================================================
 *
 * @module topics/internals/interview/bank/render
 */

import type { InterviewQuestion } from './types';

export const RENDER: readonly InterviewQuestion[] = [
    {
        id: 'q-begin',
        toc: 'beginWork 与 completeWork',
        title: 'beginWork 和 completeWork 各做什么？',
        note: '一个向下决定孩子,一个向上收标记。',
        points: [
            'beginWork 调用组件或比较 props,产出新的子 Fiber 链表。',
            'completeWork 为宿主节点准备 DOM,并把 flags 并到父节点。',
            'Render 结束时 DOM 还没提交,手里是一棵打好标记的 workInProgress。',
        ],
        related: [{ to: '/internals/render', label: 'Render' }],
        body: [
            '向下走的时候,函数组件会执行函数,拿到这次的 Element 树。协调器拿这棵 Element 和 current 的子 Fiber 比。单孩子走单节点协调,多孩子走列表协调。结果是 workInProgress.child 指向新的子链表。类组件在这里调用 render,宿主组件不执行用户函数,只去协调自己的孩子。',
            '向上走的时候,组件节点本身通常不再造 DOM。宿主节点在 completeWork 里创建或复用 DOM,把属性更新记下来,等 Commit 再写到元素上。同时把自己的 flags、孩子的 subtreeFlags、deletions 冒泡给父节点。冒泡结束,根的 subtreeFlags 就概括了整棵树有没有副作用。',
            '所以 Render 的产物不是新 DOM,是「草稿 Fiber + 一份副作用清单」。清单上的每一项都还没发生。把 beginWork 说成「渲染 DOM」,就把 Render 和 Commit 焊死了,后面「为什么能中断」就没处放。',
        ],
    },
    {
        id: 'q-diff',
        toc: 'Diff 与 key',
        title: 'Diff 为什么能做成线性？key 在里面是什么？',
        note: '两条启发式,再加上 key 是身份不是序号。',
        points: [
            '通用树编辑距离是立方时间,React 用启发式换线性。',
            'type 不同就整棵换掉,不把 div 改造成 span。',
            '同一层用 key 认「这还是刚才那个」;不稳定的 key 会把 state 套错人。',
        ],
        related: [
            { to: '/internals/render', label: 'Render' },
            { to: '/basics/list-key', label: '列表与 key' },
        ],
        body: [
            '单节点先看 type 和 key。类型不同,删除旧子树再挂新子树,组件里的 state 一起丢掉。类型相同且 key 相同,复用 Fiber,组件函数会再执行,但 Hook 链表还在,所以 state 还在。这和「每次 render 都得到新的 Element 对象」不矛盾:丢掉的是描述,留下的是工作单元。',
            '多个孩子时,从左向右先吃掉 key 还一致的前缀。一旦错位,剩下的旧节点按 key 放进表。没有稳定 key 时,这张表用的是索引,位置一变就会更新错误的那一项。用数组下标当 key,或者在渲染期随手生成随机 key,都会让协调器认错人:前者在插入、删除、排序时错位,后者让每一项每次都像新节点。',
            '启发式的代价是跨层不移动。一个组件从父节点的左边挪到右边的另一个父节点下,React 不会把它当成同一个人搬过去,而是卸掉旧的、装上新的,state 重置。这是用正确性边界换 O(n)。需要保住身份时,把 state 抬到稳定的父级,而不是指望 Diff 跨层认人。',
        ],
    },
    {
        id: 'q-type',
        toc: 'type 不同为什么整棵换',
        title: '为什么 type 不同就删除整棵子树,而不是改一个标签？',
        note: 'DOM 节点和组件实例都绑在 type 上。',
        points: [
            '宿主节点的 type 就是标签名,div 和 span 不是同一个 DOM 节点能改出来的。',
            '组件的 type 是函数或类,换了 type 就是另一条 Hook 链表、另一个实例。',
            '旧子树走删除,新子树走挂载,state 不会迁移。',
        ],
        related: [{ to: '/internals/render', label: 'Render' }],
        body: [
            '协调器复用 Fiber 的前提是「这还是同一种东西」。div 的 stateNode 是一个 HTMLDivElement,不能就地变成 span。类组件的 stateNode 是那个类的实例,换成另一个类,实例上的方法、生命周期、错误边界都不成立。函数组件没有实例,但 Hook 链表的槽位含义由调用顺序和 Hook 种类决定,换一个函数,槽位语义全变了。',
            '所以 type 不匹配时,旧 Fiber 被标记删除,连同它的孩子。新 Element 走挂载,effect 会按挂载再跑一遍,useState 回到初始值。条件渲染里用两种完全不同的组件切换同一个位置,看起来像「同一个格子换了内容」,内部是卸载再挂载。想保住 state,就保持 type 和 key 都不变,只换 props。',
        ],
    },
    {
        id: 'q-key',
        toc: 'key 是身份',
        title: 'key 解决的是身份,还是性能？',
        note: '先讲认人,性能是认对了人之后的结果。',
        points: [
            'key 只在同一层、同一个父节点的孩子之间比较。',
            '稳定 key 让 Fiber 和 Hook 链表跟那一项一起走。',
            '下标 key 在插入、删除、排序时会把 state 套到另一项上。',
        ],
        related: [{ to: '/basics/list-key', label: '列表与 key' }],
        body: [
            '没有 key 时,React 用位置当身份。列表只在尾部追加,位置刚好还是同一个人,看起来没问题。在头部插入一项,原来第 0 项的位置上现在是新人,旧第 0 项的 Fiber 会被拿来更新成新人的 props。输入框里的字、展开状态、Hook 里的缓存,都留在这个 Fiber 上,于是「状态串到了下一项」。',
            '稳定 key 让协调器在错位之后仍能从 map 里把旧 Fiber 找回来。找回来不等于不更新:props 变了照样走更新。它保证的是不把 A 的 state 给 B。随机 key 则相反,每次渲染都像一批全新节点,卸载和挂载的成本全付了,state 也留不住。',
            'key 不是全局 id。同一个 key 出现在两个父节点下,互不相干。在条件渲染的两个兄弟之间换 key,效果和换 type 类似,会重置下面的 state。把它当成性能开关,就会在不该加的静态树上加 key,或者在该稳定的列表上用 index。',
        ],
    },
    {
        id: 'q-move',
        toc: '谁会被移动',
        title: '头部插入和相邻交换,谁会被标成移动？',
        note: '用 lastPlacedIndex 讲,不要说「错位之后全部移动」。',
        points: [
            '只有旧序号比已经放置过的位置更小,才打上移动标记。',
            '头部插入一个新 key,新节点是新建,原来的节点可以留在原地。',
            '交换相邻两项时,通常只有被换到后面的那个需要移动。',
        ],
        related: [{ to: '/internals/render', label: 'Render' }],
        body: [
            '旧列表是 a b c d。尾部插入 e,前缀四位原地复用,e 是新建。头部插入 e 时,e 是新建;a b c d 的旧序号并不比已放置位置更小,把新节点插到它们前面即可,不必把四个旧节点都标成移动。',
            '把 b 和 c 对调,得到 a c b d。a 先复用。c 的旧位置在已经放过的位置之后,可以不动。b 的旧位置更靠前,要移动到 c 后面。四个人的身份都还在,没有删除再重建。这个「只标记往回跳的节点」就是 placeChild 里的 lastPlacedIndex。若把头部插入说成「后面每一项都移动」,就和实现不符。',
        ],
    },
    {
        id: 'q-deletions',
        toc: '删除记在父节点上',
        title: '被删掉的子节点为什么要单独记在父 Fiber 的 deletions 里？',
        note: '新树上已经没有它,Commit 不能靠遍历新孩子找到它。',
        points: [
            'workInProgress 的 child 链表只包含这次还在的节点。',
            '被卸掉的 Fiber 推进父节点的 deletions,并打上 ChildDeletion。',
            'Commit 先处理 deletions,再按新链表插入和更新。',
        ],
        related: [{ to: '/internals/render', label: 'Render' }],
        body: [
            'Diff 结束时,新链表是「留下的人」。离开的人如果不另记一笔,提交阶段顺着 child 走,根本遇不到他们,DOM 和 effect 清理都会漏。父节点因此保存一个 deletions 数组。数组里是旧 Fiber,不是 Element。',
            '这些旧 Fiber 还连着 stateNode、Hook 链表和 effect。Commit 的 mutation 阶段用它们执行卸载:删 DOM、卸 ref、跑 layout 和 passive 的销毁。跑完之后这棵旧子树才真正可以回收。只在新树上打一个「这里少了一项」的标记是不够的,因为清理需要旧节点自己身上的数据。',
        ],
    },
    {
        id: 'q-flags',
        toc: 'flags 与 subtreeFlags',
        title: 'flags 和 subtreeFlags 有什么区别？effectTag 还在吗？',
        note: 'React 18 之后不要再背 nextEffect 链表。',
        points: [
            'flags 是这个 Fiber 自己要做的事:插入、更新、删除孩子、被动 effect、layout effect。',
            'subtreeFlags 是子孙有没有这些事,completeWork 时按位或上来。',
            'effectTag 和 nextEffect 是 React 16 的提交导航。现在提交靠 flags 跳过干净子树。',
        ],
        related: [
            { to: '/internals/render', label: 'Render' },
            { to: '/internals/commit', label: 'Commit' },
        ],
        body: [
            '一个节点要插入,Placement 打在它自己的 flags 上。它的 effect 要在绘制后跑,Passive 也打在自己身上。父节点不一定有自己的 flags,但只要有任何一个子孙有事,父节点的 subtreeFlags 就不为空。Commit 走到一个 subtreeFlags 为空的节点,整枝跳过,不必再把每个孩子看一遍。',
            'React 16 把有副作用的 Fiber 串成 effect list,提交时只走这条链。链要在 Render 里维护,中断和复用都更麻烦。现在标记留在节点上,提交时深度优先,但用 subtreeFlags 剪枝,效果同样是「只访问有事的分支」。把 effectTag 当成现行结构,说明版本还停在 16。',
        ],
    },
    {
        id: 'q-interrupt',
        toc: 'Render 可中断',
        title: '为什么 Render 可以中断,Commit 不行？',
        note: '看有没有写屏幕,以及树和 DOM 会不会各说各话。',
        points: [
            'Render 只写 workInProgress,丢掉副本不影响 current。',
            'Commit 要改 DOM,还要把 root.current 换过去,做一半就会露出中间态。',
            'useEffect 不在 Render 里跑,因为这段计算可能重来,副作用无法回滚。',
        ],
        related: [
            { to: '/internals/render', label: 'Render' },
            { to: '/internals/commit', label: 'Commit' },
        ],
        body: [
            'Render 的产物是一棵打好标记的树,外加「谁要插入、更新、删除」。时间片用完,循环停在某个 Fiber。若恢复之前来了更高 Lane 的更新,React 从根按新的 Lane 重跑,而不是把做到一半的低优先级结果提交出去。用户不会看到半棵新树配半棵旧树。',
            'Commit 要插入节点、改属性、删除子树,并切换 current。若在删除和插入之间把主线程让出去,浏览器可能先画一帧,下一次事件读到的 DOM 也和 Fiber 不一致。所以这段设计成同步的。它能保持短,是因为只访问 subtreeFlags 不为空的分支,不再调用组件函数。',
            '副作用因此被推迟。Render 里只把 effect 对象挂到 Hook 上。真正执行要等提交之后:layout 在绘制前,passive 在绘制后。',
        ],
    },
    {
        id: 'q-memo',
        toc: 'memo 比较发生在哪',
        title: 'memo 和 shouldComponentUpdate 是在什么时候比较的？',
        note: '比较失败才会执行组件函数。',
        points: [
            '比较发生在 beginWork,在调用函数组件或类的 render 之前。',
            '默认是浅比较:每个 prop 用 Object.is。',
            '比较通过还不够,子树有待处理 Lane 时不能跳过。',
        ],
        related: [{ to: '/internals/render', label: 'Render' }],
        body: [
            'memo 包过的函数组件,协调器多一步 props 比较。相等就走 bailout,函数体不执行,里面的 useState 也不会被调用,所以也不会「多走一个槽」。不相等才执行函数,产生新的 Element,再去协调孩子。类组件的 shouldComponentUpdate 和 PureComponent 在同一位置做决定。',
            '浅比较只看第一层。props 里塞一个每次新建的对象或回调,比较一定失败,函数照样执行。useCallback 和 useMemo 的意义是让这一层引用在依赖不变时保持 Object.is 相等,从而让子组件的 bailout 成功。它们不让协调器变快,它们让「可以跳过」的条件成立。',
        ],
    },
    {
        id: 'q-fragment',
        toc: 'Fragment 和文本节点',
        title: 'Fragment 和文本节点在 Fiber 树上是什么？',
        note: '返回数组或一段字符串,树上都会有节点。',
        points: [
            'Fragment 是真实的 Fiber,可以有 key,但没有对应的 DOM 父节点。',
            '文本是单独的 Fiber,更新时改的是文本内容,不是把父 DOM 拆开重来。',
            '组件 return null,这个位置的 Fiber 会被删掉,而不是留一个空 DOM。',
        ],
        related: [{ to: '/internals/fiber', label: 'Fiber' }],
        body: [
            'Fragment 让多个孩子在不增加 DOM 层级的情况下参加同一层 Diff。带 key 的 Fragment 可以在列表里当成一项来复用,里面的 state 跟着这个 Fragment 走。不带 key 的 Fragment 只是透明分组,协调时相当于把孩子摊平到父节点的孩子列表里参与比较。',
            '一段文字不是 div 的属性,而是子 Fiber。从「有文字」变成「没有文字」,是删除那个文本 Fiber;从「你好」变成「你好世界」,是更新同一个文本 Fiber。这和「虚拟 DOM 是一棵对象树」一致,但对象树里不只有组件,宿主节点和文本都在。return null 则是这一位没有孩子,旧的子树进入 deletions。',
        ],
    },
];
