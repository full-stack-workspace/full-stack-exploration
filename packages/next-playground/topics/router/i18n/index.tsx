/**
 * ============================================================================
 * 国际化路由 — 路由机制专题
 * ============================================================================
 *
 * 讲清段级 i18n([lang] 动态段)的最小机制:字典模块、
 * generateStaticParams 预生成、generateMetadata 本地化标题、
 * 语言切换只换第一段、非法 lang 走 notFound()。
 * 再对照 middleware 重定向与子域名两种替代方案,最后划「别自己拼」的线。
 *
 * 活演示在 app/router/i18n/[lang]/(zh 与 en 各一份)。
 *
 * @module topics/router/i18n
 */

import Link from "next/link";

import { TopicPage, TopicSection } from "@/components/topic/TopicPage";

/* =================================================================
 * 代码对照块
 * ================================================================ */

/** 段级 i18n 的目录形状(本站真实结构) */
const TREE_SNIPPET = `app/router/i18n/
├── page.tsx                ← 本专题页(讲机制)
└── [lang]/
    └── page.tsx            ← 双语演示页:/router/i18n/zh | /en

topics/router/i18n/
└── dictionaries.ts         ← zh / en 各一份词条,page 与 generateMetadata 共用`;

/** 切换语言链接的真实写法:只换 URL 第一段 */
const SWITCH_SNIPPET = `// [lang]/page.tsx(节选)—— 演示站只有一页,直接拼目标段
<Link href={\`/router/i18n/\${other}\`}>{dict.switchLabel}</Link>

// 真实站点有多级路径时,通用写法是「换第一段、保留其余」:
//   const segments = usePathname().split("/");
//   segments[1] = other;                 // ["", "zh", "docs", "x"] → ["", "en", "docs", "x"]
//   router.push(segments.join("/"));
// 要点:语言是路由状态,不是组件 state —— 可分享、可收藏、可预渲染`;

/** middleware 重定向方案的对照 */
const MIDDLEWARE_SNIPPET = `// middleware.ts —— 无语言前缀的请求,按 Accept-Language 重定向
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    if (pathname.startsWith("/zh") || pathname.startsWith("/en")) {
        return;                          // 已有语言段,放行
    }
    const lang = negotiate(request.headers.get("accept-language"));
    return NextResponse.redirect(new URL(\`/\${lang}\${pathname}\`, request.url));
}

// 与段级方案不冲突:middleware 只负责「进来时落到一个语言段上」,
// 落地之后走的仍是 [lang] 动态段那套。两者常一起用。`;

/* =================================================================
 * 专题主体
 * ================================================================ */

export default function I18nTopic() {
    return (
        <TopicPage
            path="/router/i18n"
            title="国际化路由"
            description="语言放进 URL 第一段:[lang] 动态段 + 字典模块 + generateStaticParams 预生成,非法语言走 notFound();再对照 middleware 重定向与子域名方案,划清「什么时候别自己拼」"
            references={[
                { label: "Next.js 指南:Internationalization(App Router)", href: "https://nextjs.org/docs/app/guides/internationalization" },
                { label: "Next.js 文档:generateStaticParams", href: "https://nextjs.org/docs/app/api-reference/functions/generate-static-params" },
            ]}
        >
            <TopicSection
                title="活演示:zh / en 各一份预渲染页面"
                note="切换语言只换 URL 第一段;标题(<title>)也随语言变 —— generateMetadata 与页面读同一份字典"
            >
                <div className="flex flex-wrap gap-3">
                    <Link
                        href="/router/i18n/zh"
                        className="inline-flex rounded-md border border-rule px-3.5 py-2 text-sm font-medium text-ink hover:border-signal-500 dark:border-neutral-700 dark:text-neutral-100"
                    >
                        打开 /router/i18n/zh
                    </Link>
                    <Link
                        href="/router/i18n/en"
                        className="inline-flex rounded-md border border-rule px-3.5 py-2 text-sm font-medium text-ink hover:border-signal-500 dark:border-neutral-700 dark:text-neutral-100"
                    >
                        打开 /router/i18n/en
                    </Link>
                    <Link
                        href="/router/i18n/fr"
                        className="inline-flex rounded-md border border-dashed border-rule px-3.5 py-2 text-sm font-medium text-neutral-500 hover:border-signal-500 dark:border-neutral-700 dark:text-neutral-400"
                    >
                        打开 /router/i18n/fr(非法 lang → notFound)
                    </Link>
                </div>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">
                            generateStaticParams
                        </code>
                        在构建期预生成 zh / en 两份静态页面;语言是路由参数,天然可静态化
                    </li>
                    <li>
                        字典就是按 key 查表的普通对象
                        <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">
                            topics/router/i18n/dictionaries.ts
                        </code>
                        ;page 与 generateMetadata 共用同一份,正文与 &lt;title&gt; 不会语言错位
                    </li>
                    <li>
                        非法 lang(如 fr)不是错误而是「没有这条」:页面里
                        <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">
                            notFound()
                        </code>
                        ,由 not-found.tsx 兜底;语义与
                        <Link
                            href="/router/dynamic-routes"
                            className="mx-1 text-sky-600 underline underline-offset-2 hover:text-sky-500 dark:text-sky-400"
                        >
                            动态路由
                        </Link>
                        里不存在的 id 一致
                    </li>
                    <li>
                        cacheComponents 约束:非预生成的 lang 在请求时渲染,params 的 await
                        必须包在 Suspense 里 —— 演示页的 Page 只传 promise,内层 Content 才取值
                    </li>
                </ul>
            </TopicSection>

            <TopicSection
                title="机制拆解:目录、字典与切换链接"
                note="演示规模刻意小(一页 8 个词条),重点全在机制"
            >
                <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{TREE_SNIPPET}
                </pre>
                <pre className="mt-4 overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{SWITCH_SNIPPET}
                </pre>
            </TopicSection>

            <TopicSection
                title="三种方案对照:段级 vs middleware vs 子域名"
                note="不是互斥选项:middleware 常与段级搭配,负责「进来时落到语言段上」"
            >
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[680px] text-left text-xs leading-relaxed">
                        <thead>
                            <tr className="border-b border-neutral-200 text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                                <th className="py-2 pr-4 font-semibold">方案</th>
                                <th className="py-2 pr-4 font-semibold">URL 形态</th>
                                <th className="py-2 pr-4 font-semibold">SEO / 分享</th>
                                <th className="py-2 font-semibold">适用</th>
                            </tr>
                        </thead>
                        <tbody className="text-neutral-600 dark:text-neutral-400">
                            <tr className="border-b border-neutral-100 dark:border-neutral-800">
                                <td className="py-2 pr-4 font-medium text-neutral-800 dark:text-neutral-100">
                                    段级 [lang](本站演示)
                                </td>
                                <td className="py-2 pr-4 font-mono">/zh/docs, /en/docs</td>
                                <td className="py-2 pr-4">
                                    每种语言一条可索引 URL;hreflang 友好;可静态预生成
                                </td>
                                <td className="py-2">内容站、文档站 —— 多数场景的默认解</td>
                            </tr>
                            <tr className="border-b border-neutral-100 dark:border-neutral-800">
                                <td className="py-2 pr-4 font-medium text-neutral-800 dark:text-neutral-100">
                                    middleware 重定向
                                </td>
                                <td className="py-2 pr-4 font-mono">/docs → 302 → /zh/docs</td>
                                <td className="py-2 pr-4">
                                    裸路径按 Accept-Language 落地;只解决「第一次进哪个语言」
                                </td>
                                <td className="py-2">与段级搭配的入口协商层,不单独成方案</td>
                            </tr>
                            <tr>
                                <td className="py-2 pr-4 font-medium text-neutral-800 dark:text-neutral-100">
                                    子域名
                                </td>
                                <td className="py-2 pr-4 font-mono">zh.example.com</td>
                                <td className="py-2 pr-4">
                                    每语言独立站点权重;跨域 cookie/会话要自己处理
                                </td>
                                <td className="py-2">区域化运营(独立团队/合规/结算),不是翻译需求</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <pre className="mt-4 overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{MIDDLEWARE_SNIPPET}
                </pre>
            </TopicSection>

            <TopicSection
                title="什么时候别自己拼"
                note="演示可以手搓,生产内容站请用库"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        <strong>内容驱动的站别手搓</strong>:词条一上规模,你需要 ICU MessageFormat
                        复数规则、插值类型安全、翻译缺失回退、语言包按需加载 ——
                        这些 next-intl / react-i18next 已经解决,本站演示字典只覆盖「查表」这一格
                    </li>
                    <li>
                        <strong>内容在 CMS 里时,语言是数据不是字典</strong>:文章级多语言
                        应在 CMS 建模(locale 字段 + 关联),[lang] 段只做路由;别把正文搬进代码仓库
                    </li>
                    <li>
                        <strong>别把语言藏进 cookie/state</strong>:URL 里没有语言,链接就不可分享、
                        不可索引,也失去静态预生成的资格 —— 语言必须是路由状态
                    </li>
                    <li>
                        <strong>只有两三种语言的演示站</strong>:本站这套(字典 + generateStaticParams)
                        就够,引入完整 i18n 库是过度工程
                    </li>
                </ul>
            </TopicSection>
        </TopicPage>
    );
}
