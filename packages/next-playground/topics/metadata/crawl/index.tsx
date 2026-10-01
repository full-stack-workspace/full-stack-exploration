/**
 * ============================================================================
 * 爬虫文件与结构化数据 — Metadata 专题
 * ============================================================================
 *
 * metadata 对象覆盖不了 sitemap、robots 和 JSON-LD。
 * 前两份是本站真实的 app/sitemap.ts 与 app/robots.ts;
 * JSON-LD 写在本页的 script 里,查看源代码能看到。
 *
 * @module topics/metadata/crawl
 */

import Link from "next/link";

import { TopicPage, TopicSection } from "@/components/topic/TopicPage";

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: "爬虫文件与结构化数据",
    description: "sitemap、robots 与 JSON-LD 各自解决 metadata 对象覆盖不了的那一层。",
    inLanguage: "zh-CN",
};

export default function CrawlTopic() {
    return (
        <TopicPage
            path="/metadata/crawl"
            title="爬虫文件与结构化数据"
            description="metadata 对象负责 head 里的标题和描述。sitemap、robots 是给爬虫的文件;JSON-LD 是给搜索结果的结构化数据。三件事不要塞进同一个 export"
            references={[
                { label: "Next.js 文档:robots.txt(file conventions)", href: "https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots" },
                { label: "Next.js 文档:sitemap.xml(file conventions)", href: "https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap" },
            ]}
        >
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <TopicSection
                title="两份正在生效的文件"
                note="都从注册表或固定规则生成,不是手写的 XML"
            >
                <ul className="space-y-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        <a
                            href="/sitemap.xml"
                            className="font-medium text-ink underline decoration-signal-500 underline-offset-4 dark:text-neutral-100"
                        >
                            /sitemap.xml
                        </a>
                        <span className="mt-1 block">
                            app/sitemap.ts 读 TOPICS。新专题注册后,这份列表自动多一条,不必再维护一份 URL 清单。
                        </span>
                    </li>
                    <li>
                        <a
                            href="/robots.txt"
                            className="font-medium text-ink underline decoration-signal-500 underline-offset-4 dark:text-neutral-100"
                        >
                            /robots.txt
                        </a>
                        <span className="mt-1 block">
                            app/robots.ts 允许抓取全站,并指向上面的 sitemap。预览环境若不想被收录,改的是这里,不是每个页面的 robots 字段。
                        </span>
                    </li>
                </ul>
            </TopicSection>

            <TopicSection
                title="JSON-LD 放在页面里"
                note="查看本页源代码,能看到 application/ld+json。metadata API 没有这一种字段"
            >
                <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    标题、描述、Open Graph 继续走 metadata。只有搜索结果需要类型化信息(文章、产品、面包屑)时,才在 Server Component 里加一段 JSON-LD。不要为了「看起来完整」给每个专题都套一份。
                </p>
            </TopicSection>

            <TopicSection
                title="robots.txt 与页面级 robots 的分工"
                note="整站准入 vs 单页索引:两层各管一段,不要互相替代"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        <strong>robots.txt(app/robots.ts)管「能不能抓」</strong>:整站/整路径的准入门,
                        一个站点一份;屏蔽某段路径、换 sitemap 地址都改这里,不碰任何页面
                    </li>
                    <li>
                        <strong>页面级 robots 管「抓到了要不要索引」</strong>:写在 metadata /
                        generateMetadata 里,逐页生效。活例子就在
                        <Link
                            href="/router/dynamic-routes"
                            className="mx-1 text-signal-600 underline underline-offset-2 hover:text-signal-500 dark:text-signal-400"
                        >
                            动态路由专题
                        </Link>
                        :[id] 页对不存在的用户返回
                        <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">
                            robots: {"{ index: false }"}
                        </code>
                        ,404 详情不进搜索结果
                    </li>
                    <li>
                        注意两层是「且」的关系:robots.txt  disallow 了的路径,爬虫根本不会去抓,
                        页面里的 noindex 也就永远不被读到 —— 想让 noindex 生效,就不能 disallow 那条路径
                    </li>
                </ul>
            </TopicSection>

            <TopicSection title="三条通道怎么分" note="先问这份信息是给浏览器 head、给爬虫文件,还是给富结果">
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>标题和描述:metadata 或 generateMetadata,见流水线专题</li>
                    <li>整站有哪些 URL、能不能抓:sitemap.ts / robots.ts,一个站点各一份</li>
                    <li>富结果要的类型:页内 JSON-LD。它不参与 metadata 合并</li>
                </ul>
            </TopicSection>
        </TopicPage>
    );
}
