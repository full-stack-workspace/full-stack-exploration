/**
 * ============================================================================
 * 数据与缓存 · 理解检验(/data/check)
 * ============================================================================
 *
 * 四层缓存与模型演进、revalidateTag / updateTag / revalidatePath / refresh
 * 分工、zod 校验位置、动态 API 为什么必须待在 Suspense 洞内、SWR 的适用
 * 边界。较难题标星级与考察点,答案默认折叠。
 *
 * 题目考「决策与机制」,不考 API 背诵;答不上时回链到对应专题。
 *
 * @module topics/data/check
 */

import Link from "next/link";

import { type CheckGroup, CheckList } from "@/components/topic/CheckList";
import { TopicPage, TopicSection } from "@/components/topic/TopicPage";

const GROUPS: CheckGroup[] = [
    {
        id: "g-layers",
        title: "四层缓存与模型演进",
        blurb: "缓存不是「一个开关」:四层各管一段生命周期,「时新时不新」先定位是哪一层。",
        questions: [
            {
                id: "d-layers",
                title: "页面数据「时新时不新」,排查时应该先做什么?",
                note: "四层缓存各自的生命周期不同,先定位再修。",
                difficulty: 4,
                focus: "先定位是哪一层,再谈失效手段",
                answer: [
                    "四层各管一段:Request Memoization 只管单次渲染内的去重;Data Cache 是 fetch 结果的服务端持久缓存;Full Route Cache 是整页静态产物;Router Cache 是客户端导航缓存。症状对号入座:同一页里重复请求 → 第一层;刷新变、过会儿又变 → 第二/三层的窗口期;只有导航时陈旧、硬刷新正常 → Router Cache。",
                    "cacheComponents 后模型演进成:取数默认动态,fetch 的隐式 Data Cache 取消,缓存由 \"use cache\" 的作用域显式接管;Full Route Cache 由「静态壳」承担;Request Memoization 与客户端 Router Cache 仍然存在。",
                    "为什么不能上来就 revalidatePath:打靶打错层,既修不好症状,还可能把不相干的缓存条目一起作废。",
                ],
                related: [{ href: "/data/cache-layers", label: "四层缓存对照台" }],
            },
            {
                id: "d-dynamic-hole",
                title: "cookies() / headers() 这类动态 API,为什么必须待在 Suspense 洞内?",
                difficulty: 4,
                focus: "请求时数据与静态壳的边界",
                answer: [
                    "它们读的是「本次请求」的信息,构建期没有请求,这类数据在预渲染时不存在。",
                    "cacheComponents 下构建期渲染到第一个 Suspense 边界为止,边界外是进 CDN 的静态壳。把 cookies() 放在壳里,壳就再也冻结不出来 —— 构建报错或整页被迫动态。",
                    "connection() 同理:它不读数据,只是声明「等请求到达再渲染」,同样必须在洞内。规则一句话:用了请求时数据的部分进洞,没用的部分留在壳里。",
                ],
                related: [
                    { href: "/data/dynamic-apis", label: "动态 API 各一格" },
                    { href: "/rendering/ppr", label: "PPR 与 Cache Components" },
                ],
            },
        ],
    },
    {
        id: "g-revalidation",
        title: "失效与刷新的分工",
        blurb: "revalidateTag / updateTag / revalidatePath / refresh 不是四个可互换的开关。",
        questions: [
            {
                id: "d-tag-vs-update",
                title: "CMS webhook 触发的内容更新用 revalidateTag,表单提交后的响应用 updateTag —— 为什么反过来不行?",
                difficulty: 4,
                focus: "SWR 语义 vs read-your-own-writes",
                answer: [
                    "revalidateTag 是标过期:下次读取先回旧值、后台重建(SWR)。CMS 内容晚几秒被读者看到无所谓,换来的是任何请求都不用等重建。",
                    "updateTag 是立即过期(仅 Server Action 内):下一次读取等新值。表单提交后,响应当次就要带回用户刚写进去的数据 —— 用户无法接受「我发的留言刷新后才出现」。",
                    "反过来:webhook 用 updateTag 会让下一个读者干等重建(且它本不在 Server Action 里,根本调不了);表单响应用 revalidateTag,用户提交后看到的还是旧列表,等于「写丢失」。",
                ],
                related: [{ href: "/data/revalidation", label: "按需失效实战" }],
            },
            {
                id: "d-path-vs-refresh",
                title: "revalidatePath 和 refresh() 分别动哪一层?什么时候用 path 而不是 tag?",
                difficulty: 3,
                focus: "按路径作废旧值 vs 客户端重取当前路由",
                answer: [
                    "revalidatePath(path):服务端按路由失效 —— 该路由渲染涉及的缓存条目全部作废(SWR 语义)。适合「只知道这页该重渲、不记得打过什么 tag」的粗放场景,如留言板变更。",
                    "refresh():客户端发起,让当前路由在客户端重新获取(清 Router Cache 并重取服务端数据),不动服务端缓存条目本身。",
                    "tag vs path 的选择:同一份数据被多个页面读、且变更时能枚举出影响面 → tag 精准失效;页面聚合了多份数据、粒度说不清 → path 一把梭,代价是作废面更大。",
                ],
                related: [{ href: "/data/revalidation", label: "按需失效实战" }],
            },
        ],
    },
    {
        id: "g-channels",
        title: "取数通道与校验",
        blurb: "服务端 await 是默认答案;SWR 与 Route Handler 各有明确的存在理由。",
        questions: [
            {
                id: "d-zod",
                title: "客户端表单已经有 zod 校验了,Server Action 里为什么还要再校一遍?",
                difficulty: 3,
                focus: "体验校验 vs 权威校验",
                answer: [
                    "客户端校验是体验校验:即时回显、减少无效往返。但客户端的一切都可以被绕过 —— 改 JS、直接 curl 打 action 端点,校验形同虚设。",
                    "Server Action 是网络边界后的第一行服务端代码,权威校验必须在那里:zod schema 解析失败就拒绝落库,字段级错误经 useActionState 带回客户端回显。",
                    "schema 可以两端共享同一份:客户端拿它做体验校验,action 里拿它做权威校验 —— 共享的是规则,信任只在服务端。",
                ],
                related: [{ href: "/data/forms", label: "表单进阶:校验与错误回显" }],
            },
            {
                id: "d-swr",
                title: "能在 Server Component 里 await 的数据,为什么不该用 SWR?SWR 仍然正确的场景有哪些?",
                difficulty: 4,
                focus: "取数通道的选择标准",
                answer: [
                    "服务端 await 首屏即完整、可进缓存、不产生客户端瀑布;SWR 把取数推迟到水合之后,首屏多块 loading,还要自己管缓存 key。能 await 就别 SWR。",
                    "SWR 的主场是「只有浏览器才知道要不要取」的场景:会话相关数据(登录后才有的 token)、聚焦重验证(revalidateOnFocus)、轮询、离线/本地缓存优先的读取。",
                    "判断标准一句话:数据依赖请求时的服务端上下文 → 服务端 await;依赖浏览器会话或需要随交互重验证 → SWR。",
                ],
                related: [{ href: "/data/client-fetching", label: "客户端取数与 SWR" }],
            },
            {
                id: "d-route-handler",
                title: "页面取数为什么不调用自己的 /api Route Handler?那 Route Handler 的存在理由是什么?",
                difficulty: 3,
                focus: "三条取数通道各管什么",
                answer: [
                    "页面在服务端渲染时直接调自己的 Route Handler,是多绕一跳的 HTTP 自调用:构建期静态生成时服务可能根本没起(ECONNREFUSED),还多一次序列化/反序列化。页面取数应直接调数据访问函数或外部 API。",
                    "Route Handler 的存在理由是「HTTP 门面」:给浏览器端的交互取数(如客户端轮询)、给第三方/外部系统提供端点、承接 webhook —— 它面向的是「必须通过 HTTP 到达」的调用方,不是自己的页面。",
                    "三条通道的分工:页面服务端取数直连数据源;客户端运行时取数走 SWR 打 Route Handler;变更走 Server Action。",
                ],
                related: [{ href: "/data/route-handlers", label: "Route Handler" }],
            },
        ],
    },
];

export default function DataCheckTopic() {
    return (
        <TopicPage
            path="/data/check"
            title="理解检验"
            description="7 道问答,覆盖四层缓存与模型演进、四个失效/刷新 API 的分工、zod 校验位置、动态 API 与 Suspense 洞、SWR 适用边界。先用要点自答,再展开对照"
        >
            <CheckList groups={GROUPS} />

            <TopicSection
                title="答不上时回到哪里"
                note="本分类各专题入口;不要在本页另记一套规则"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        <Link href="/data/cache-layers" className="text-signal-600 underline decoration-signal-500/40 underline-offset-4 dark:text-signal-400">四层缓存对照台</Link>
                        —— 四层生命周期与「时新时不新」排查
                    </li>
                    <li>
                        <Link href="/data/revalidation" className="text-signal-600 underline decoration-signal-500/40 underline-offset-4 dark:text-signal-400">按需失效实战</Link>
                        —— revalidateTag / updateTag / revalidatePath / refresh 分工
                    </li>
                    <li>
                        <Link href="/data/dynamic-apis" className="text-signal-600 underline decoration-signal-500/40 underline-offset-4 dark:text-signal-400">动态 API 各一格</Link>
                        —— cookies / headers / connection / after 与 Suspense 洞
                    </li>
                    <li>
                        <Link href="/data/forms" className="text-signal-600 underline decoration-signal-500/40 underline-offset-4 dark:text-signal-400">表单进阶:校验与错误回显</Link>
                        —— 体验校验 vs 权威校验、错误建模
                    </li>
                    <li>
                        <Link href="/data/client-fetching" className="text-signal-600 underline decoration-signal-500/40 underline-offset-4 dark:text-signal-400">客户端取数与 SWR</Link>
                        —— SWR 的四类主场
                    </li>
                    <li>
                        <Link href="/data/route-handlers" className="text-signal-600 underline decoration-signal-500/40 underline-offset-4 dark:text-signal-400">Route Handler</Link>
                        —— 三条取数通道怎么选
                    </li>
                </ul>
            </TopicSection>
        </TopicPage>
    );
}
