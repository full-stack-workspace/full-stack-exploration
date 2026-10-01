/**
 * ============================================================================
 * Server/Client 边界 · 理解检验(/rsc-boundary/check)
 * ============================================================================
 *
 * "use client" 边界切点、children 槽、Flight 序列化(什么能传什么不能)、
 * Server Actions 三件套与渐进增强。较难题标星级与考察点,答案默认折叠。
 *
 * 题目考「决策与机制」,不考 API 背诵;答不上时回链到对应专题。
 *
 * @module topics/rsc-boundary/check
 */

import Link from "next/link";

import { type CheckGroup, CheckList } from "@/components/topic/CheckList";
import { TopicPage, TopicSection } from "@/components/topic/TopicPage";

const GROUPS: CheckGroup[] = [
    {
        id: "g-boundary",
        title: "边界切点与 children 槽",
        blurb: "\"use client\" 是边界声明,不是「整个子树都客户端渲染」的开关。",
        questions: [
            {
                id: "b-infect",
                title: "给一个组件加上 \"use client\",它 import 的子组件会跟着进客户端 bundle 吗?",
                difficulty: 3,
                focus: "边界的传染方向",
                answer: [
                    "会。\"use client\" 标记的是一个 bundle 切点:从这个文件开始,它 import 的全部模块都进入客户端图。所以说「边界下沉」—— 把交互叶子沉到树底,切点以下才需要付客户端 JS 的成本。",
                    "反过来不成立:被 Client 组件以 props(如 children)接收的内容不参与这条 import 链,可以保持 Server。这正是「页面保持 Server、交互下沉为 Client 叶子」的标准姿势。",
                ],
                related: [
                    { href: "/rsc-boundary/guide", label: "RSC 心智模型" },
                    { href: "/rsc-boundary/props-boundary", label: "Server/Client 边界" },
                ],
            },
            {
                id: "b-children-slot",
                title: "Client 组件里想嵌一段 Server 渲染的内容,为什么不能直接 import 那个 Server 组件?",
                note: "提示:两棵组件树分别在什么时间、什么地方执行。",
                difficulty: 4,
                focus: "children 槽是两棵树之间的接力点",
                answer: [
                    "Client 组件里 import 的模块会被打包进客户端 bundle,Server 组件只在服务端执行 —— 直接 import 等于把它强行拉进客户端图,取数、密钥、服务端 API 全部失效或报错。",
                    "正确姿势是 children 槽:Server 父组件先执行,把 Server 内容渲染成序列化的 UI 描述(RSC 载荷),作为 children prop 递给 Client 组件;Client 组件只是「放下」这份描述,不参与它的创建。",
                    "时序上这也唯一说得通:Server 内容在请求到达时已执行完毕,不可能等浏览器里的 Client 组件渲染时才回头去服务端要。",
                ],
                related: [{ href: "/rsc-boundary/guide", label: "RSC 心智模型" }],
            },
            {
                id: "b-cost",
                title: "每画一条 \"use client\" 边界,真实付出的成本有哪两笔?",
                difficulty: 3,
                focus: "边界成本 = bundle 切点 + 序列化约束",
                answer: [
                    "第一笔是包体:边界以下的整棵 import 子树进客户端 bundle,要下载、解析、水合。",
                    "第二笔是契约:跨边界传递的 props 必须可序列化(见下一题),函数、class 实例这类「活」对象传不过去 —— 边界迫使两端用数据通信。",
                    "所以「什么时候别把边界往上推」的答案是:能下沉就下沉。边界画在 page 上,整页(包括本可静态预渲染的部分)都变成客户端渲染,两笔成本一次付满。",
                ],
                related: [{ href: "/rsc-boundary/guide", label: "RSC 心智模型" }],
            },
        ],
    },
    {
        id: "g-flight",
        title: "Flight 序列化",
        blurb: "跨边界传的是序列化的 UI 描述与数据,不是内存引用。",
        questions: [
            {
                id: "b-serializable",
                title: "Server 组件给 Client 组件传 props,哪些能传、哪些不能?为什么 onClick 传不过去?",
                difficulty: 4,
                focus: "Flight 载荷里只有数据,没有代码引用",
                answer: [
                    "能传:可序列化的数据 —— 字符串、数字、布尔、数组、普通对象等;以及 Server 渲染的 UI 描述(children / 槽)。",
                    "不能传:函数、class 实例这类活在服务端内存里的东西。onClick 是服务端函数内存地址,序列化成 JSON 后浏览器无法还原;事件处理只能定义在 Client 组件内部。",
                    "唯一例外是 Server Action 引用:\"use server\" 标记的函数被序列化为一个带 id 的引用,客户端调用时经 RPC 回到服务端执行 —— 它是协议级的例外,不是普通函数变得可传了。",
                ],
                related: [{ href: "/rsc-boundary/props-boundary", label: "Server/Client 边界" }],
            },
            {
                id: "b-initial-data",
                title: "用户列表页要支持搜索/添加,初始数据与交互应该怎么分工?",
                note: "本站 /rsc-boundary/props-boundary 的真实结构。",
                difficulty: 3,
                focus: "Server 预渲染 + Client 接管交互",
                answer: [
                    "page 保持 Server Component:直接 await 取数,把初始列表以 props 传给 Client 叶子(UserListClient),SSR 首屏即完整,无 JS 也能看到数据。",
                    "水合后 Client 叶子接管交互:搜索过滤、添加条目都是客户端 state 的事。初始数据是「跨过边界的一份快照」,之后的新增由客户端持有 —— 两边不互相同步,因为所有权交接只有一次。",
                ],
                related: [{ href: "/rsc-boundary/props-boundary", label: "Server/Client 边界" }],
            },
        ],
    },
    {
        id: "g-actions",
        title: "Server Actions 与渐进增强",
        blurb: "三件套各管一个态;<form action> 让无 JS 也能提交。",
        questions: [
            {
                id: "b-three-kit",
                title: "useActionState / useFormStatus / useOptimistic 各管哪一个「态」?",
                difficulty: 3,
                focus: "结果态 / 进行态 / 乐观态的分工",
                answer: [
                    "useActionState = 结果态:action 完成后的 ok/error(如留言发布成功、校验失败信息),随响应带回。",
                    "useFormStatus = 进行态:提交按钮的 pending。它必须用在 <form> 内部的子组件里,因为它读的是父级 form 的提交状态。",
                    "useOptimistic = 乐观态:提交进行中临时叠加的 UI(如乐观留言项);action 完成、真实数据随响应到达后,乐观项被真实值替换,失败则自动消失 —— 不用手写回滚。",
                ],
                related: [{ href: "/rsc-boundary/server-actions", label: "Server Actions 留言板" }],
            },
            {
                id: "b-progressive",
                title: "<form action={serverAction}> 为什么在 JS 还没加载完(甚至没有 JS)时也能提交?",
                difficulty: 4,
                focus: "渐进增强:action 编译成真实的 form 端点",
                answer: [
                    "React/Next 会把 Server Action 编译成一个真实的 HTTP 端点,<form action> 在 HTML 层面就是一次普通的表单 POST —— 浏览器原生就能发,不依赖任何客户端 JS。",
                    "JS 就绪后同一份表单被水合接管:提交变成 fetch RPC,响应里同时带回 action 结果与重渲后的 RSC 载荷(action 里 revalidatePath 过的列表随之刷新),页面不整刷。",
                    "所以渐进增强不是「两份实现」,而是同一条链路的两档体验:底线是原生表单,增强是客户端过渡。",
                ],
                related: [{ href: "/rsc-boundary/server-actions", label: "Server Actions 留言板" }],
            },
        ],
    },
];

export default function RscBoundaryCheckTopic() {
    return (
        <TopicPage
            path="/rsc-boundary/check"
            title="理解检验"
            description="7 道问答,覆盖 &quot;use client&quot; 边界切点、children 槽、Flight 序列化约束、Server Actions 三件套与渐进增强。先用要点自答,再展开对照"
        >
            <CheckList groups={GROUPS} />

            <TopicSection
                title="答不上时回到哪里"
                note="本分类各专题入口;不要在本页另记一套规则"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        <Link href="/rsc-boundary/guide" className="text-signal-600 underline decoration-signal-500/40 underline-offset-4 dark:text-signal-400">RSC 心智模型</Link>
                        —— 为什么默认 Server、边界成本、children 槽
                    </li>
                    <li>
                        <Link href="/rsc-boundary/props-boundary" className="text-signal-600 underline decoration-signal-500/40 underline-offset-4 dark:text-signal-400">Server/Client 边界</Link>
                        —— 边界下沉与可序列化 props 的活演示
                    </li>
                    <li>
                        <Link href="/rsc-boundary/server-actions" className="text-signal-600 underline decoration-signal-500/40 underline-offset-4 dark:text-signal-400">Server Actions 留言板</Link>
                        —— 三件套分工与渐进增强的可运行闭环
                    </li>
                </ul>
            </TopicSection>
        </TopicPage>
    );
}
