/**
 * ============================================================================
 * 渲染策略 · 理解检验(/rendering/check)
 * ============================================================================
 *
 * SSG / ISR / SSR / Streaming / PPR 选型、cacheComponents 新模型
 * ("use cache" / cacheLife / connection() + Suspense 洞)、ISR 的 SWR 语义、
 * 构建输出路由表(○/◐/ƒ)读法。较难题标星级与考察点,答案默认折叠。
 *
 * 题目考「决策与机制」,不考 API 背诵;答不上时回链到对应专题,
 * 不要在本页另记一套规则。
 *
 * @module topics/rendering/check
 */

import Link from "next/link";

import { type CheckGroup, CheckList } from "@/components/topic/CheckList";
import { TopicPage, TopicSection } from "@/components/topic/TopicPage";

const GROUPS: CheckGroup[] = [
    {
        id: "g-spectrum",
        title: "光谱与选型",
        blurb: "SSG → ISR → SSR → Streaming → PPR 是一条光谱,不是五个开关。先回答首字节从哪来、数据要多新、服务器愿意花多少,再选落点。",
        questions: [
            {
                id: "r-pick",
                title: "营销落地页、千人千面的信息流、慢接口后台页,各落在光谱哪一格?",
                note: "先定每页的首字节来源与新鲜度要求,再谈框架配置。",
                difficulty: 3,
                focus: "选型依据是三轴:首字节来源 / 数据新鲜度 / 服务器成本",
                answer: [
                    "营销页:内容稳定、读者多,SSG(或 \"use cache\" 缓存数据)整页进 CDN,首字节最近、服务器成本最低。",
                    "千人千面信息流:没有可共享的静态产物,SSR(connection() 声明等请求)每请求现算;硬上 PPR 也抽不出静态壳,只会退化成它。",
                    "慢接口后台页:壳可以静态、数据慢,Streaming(按区块包 Suspense)或 PPR;静态壳先吐,慢区块分段补出,用户不用盯着白屏等最慢的那个接口。",
                    "同一个站点三种页面各占一格是正常的 —— 渲染策略按路由甚至按组件混用,不是全站一个开关。",
                ],
                related: [{ href: "/rendering/spectrum", label: "渲染光谱梳理" }],
            },
            {
                id: "r-no-ppr",
                title: "什么情况下 PPR 是白添复杂度?",
                note: "决策要点,不是 API 背诵。",
                difficulty: 3,
                focus: "PPR 的前提是存在「可共享的静态壳」",
                answer: [
                    "整页都动态(个性化信息流、实时仪表盘):没有静态壳可抽,PPR 退化为普通 Streaming SSR,白添一套缓存声明。",
                    "整页都静态(文档、营销页):SSG / \"use cache\" 本来就够快,动态洞是多余的复杂度。",
                    "团队没有缓存失效纪律:PPR 的静态部分靠显式 \"use cache\" + cacheLife + cacheTag 声明,每个缓存条目都要想清新鲜度与失效方式,粗放使用会积累 stale 事故。",
                ],
                related: [{ href: "/rendering/ppr", label: "PPR 与 Cache Components" }],
            },
        ],
    },
    {
        id: "g-cache-components",
        title: "cacheComponents 新模型",
        blurb: "默认动态、显式缓存 —— 与旧模型「默认静态、force-dynamic 退出」的心智正好相反。",
        questions: [
            {
                id: "r-migration",
                title: "旧模型的 revalidate = 60 和 force-dynamic,在 cacheComponents 下分别怎么写?",
                difficulty: 3,
                focus: "route segment config → \"use cache\" 声明的对应关系",
                answer: [
                    "revalidate = 60 → 在取数函数/组件上写 \"use cache\" + cacheLife({ revalidate: 60 }),按需再补 cacheTag。缓存的粒度从「整页」变成「作用域」,一页里可以同时存在多个不同新鲜度的缓存块。",
                    "force-dynamic → 什么都不写:取数默认就是请求时动态;要声明「整页都等请求到达再渲染」时用 connection()。",
                    "为什么反过来:旧模型要防止「忘记加 no-store 就被缓存」的隐式行为;新模型把缓存变成显式 opt-in,不写指令的部分天然不会误进缓存。",
                ],
                related: [{ href: "/rendering/ppr", label: "PPR 与 Cache Components" }],
            },
            {
                id: "r-suspense-hole",
                title: "为什么未缓存的请求时数据必须待在 Suspense 洞里?不守这条会怎样?",
                note: "提示:想想构建期渲染到哪儿为止。",
                difficulty: 4,
                focus: "Suspense 边界是编译契约,不是可选项",
                answer: [
                    "cacheComponents 下构建期会尝试预渲染静态壳:渲染走到第一个 Suspense 边界为止,边界外的部分冻结成可进 CDN 的产物。",
                    "cookies()、未缓存的 fetch 这类请求时数据在构建期不存在 —— 如果它们出现在 Suspense 边界之外,构建器无法决定壳里该放什么,直接报错(Uncached data was accessed outside of <Suspense>)。",
                    "所以边界回答的是「静态壳到哪里为止」:洞内是每请求现算的动态区,洞外必须能在没有任何请求信息的前提下渲染出来。",
                ],
                related: [{ href: "/rendering/ppr", label: "PPR 与 Cache Components" }],
            },
            {
                id: "r-route-table",
                title: "构建输出的路由表里,○ / ◐ / ƒ 各说明什么?Revalidate 列看什么?",
                difficulty: 4,
                focus: "路由表是缓存策略的验收工具",
                answer: [
                    "○ 完全静态(含「壳 + 缓存数据」),可直接由 CDN 吐出;◐ Partial Prerender,壳预渲染、动态洞请求时经 Suspense 流式补出;ƒ 每请求动态,本站的 /api/* Route Handler 都在这一格。",
                    "Revalidate / Expire 两列直接展示各路由的缓存窗口 —— 比如 /rendering/isr 是 ○ 且 Revalidate 为 1m,说明数据整份进了 \"use cache\" + cacheLife({ revalidate: 60 })。",
                    "验收姿势:改完缓存声明后看构建输出,某页该是 ◐ 却变成 ƒ,往往是有动态数据漏出了 Suspense 洞。",
                ],
                related: [{ href: "/rendering/ppr", label: "PPR 与 Cache Components" }],
            },
        ],
    },
    {
        id: "g-isr-streaming",
        title: "ISR 语义与流式粒度",
        blurb: "过期不等于立刻更新,边界粒度决定谁阻塞谁。",
        questions: [
            {
                id: "r-isr-swr",
                title: "ISR 页面 revalidate = 60,窗口到期后的第一个请求会立刻看到新数据吗?",
                note: "想想 SWR 三个字母的全称。",
                difficulty: 4,
                focus: "stale-while-revalidate:先回旧值,后台重建",
                answer: [
                    "不会。到期后的第一个请求拿到的是旧缓存(stale),同时触发后台重建(revalidate);再之后的请求才看到新产物。这是 ISR 与 revalidateTag 共享的 SWR 语义 —— 读者晚一拍看到新值,换的是任何请求都不用等重建。",
                    "如果业务要求「改完立即读到新值」(read-your-own-writes,比如表单提交后的响应里就要带新数据),时间驱动与 SWR 都不够用,要用 Server Action 里的 updateTag 立即过期。",
                ],
                related: [
                    { href: "/rendering/isr", label: "ISR 与静态再生" },
                    { href: "/data/revalidation", label: "按需失效实战" },
                ],
            },
            {
                id: "r-streaming-grain",
                title: "三个慢区块(0.5s / 1.5s / 3s)各自包 Suspense,最慢的那个会拖住整页吗?如果只用一个边界包住三个呢?",
                difficulty: 3,
                focus: "Suspense 粒度决定谁阻塞谁",
                answer: [
                    "各自包边界时:静态壳(页头、骨架)先行吐出,三个洞按各自完成顺序流式补出,3s 的区块不阻塞 0.5s 的。TTFB 由壳决定,不由最慢的洞决定。",
                    "只用一个边界包住三个:边界要等内容齐全才能补出,整页退化成「壳 + 一次 3s 后的整块补出」,分段到达消失。",
                    "反过来说,边界也不是越碎越好:同一区块里必须一起出现才有意义的内容(标题和它的时间戳)应共用一个边界,避免半截 UI。",
                ],
                related: [{ href: "/rendering/streaming", label: "Streaming SSR 与 Suspense 粒度" }],
            },
        ],
    },
];

export default function RenderingCheckTopic() {
    return (
        <TopicPage
            path="/rendering/check"
            title="理解检验"
            description="7 道问答,覆盖 SSG/ISR/SSR/Streaming/PPR 选型、cacheComponents 新模型、ISR 的 SWR 语义与构建输出路由表读法。先用要点自答,再展开对照"
        >
            <CheckList groups={GROUPS} />

            <TopicSection
                title="答不上时回到哪里"
                note="本分类各专题入口;不要在本页另记一套规则"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        <Link href="/rendering/spectrum" className="text-signal-600 underline decoration-signal-500/40 underline-offset-4 dark:text-signal-400">渲染光谱梳理</Link>
                        —— 五格落点与三轴选型
                    </li>
                    <li>
                        <Link href="/rendering/isr" className="text-signal-600 underline decoration-signal-500/40 underline-offset-4 dark:text-signal-400">ISR 与静态再生</Link>
                        —— SWR 语义、旧模型与新模型对照
                    </li>
                    <li>
                        <Link href="/rendering/ssr" className="text-signal-600 underline decoration-signal-500/40 underline-offset-4 dark:text-signal-400">SSR 请求时整页渲染</Link>
                        —— connection() 的整页动态
                    </li>
                    <li>
                        <Link href="/rendering/streaming" className="text-signal-600 underline decoration-signal-500/40 underline-offset-4 dark:text-signal-400">Streaming SSR 与 Suspense 粒度</Link>
                        —— 边界粒度与谁阻塞谁
                    </li>
                    <li>
                        <Link href="/rendering/ppr" className="text-signal-600 underline decoration-signal-500/40 underline-offset-4 dark:text-signal-400">PPR 与 Cache Components</Link>
                        —— &quot;use cache&quot;、Suspense 洞契约与路由表验收
                    </li>
                    <li>
                        <Link href="/rendering/view-transition" className="text-signal-600 underline decoration-signal-500/40 underline-offset-4 dark:text-signal-400">页面转场 ViewTransition</Link>
                        —— 本分类的客户端转场补讲
                    </li>
                </ul>
            </TopicSection>
        </TopicPage>
    );
}
