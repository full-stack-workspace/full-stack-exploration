/**
 * ============================================================================
 * metadata 流水线 — Metadata 与 SEO 分类(梳理页)
 * ============================================================================
 *
 * App Router 给页面出 metadata 有三条通道:
 * 1. 静态 metadata 对象(export const metadata)
 * 2. generateMetadata() 动态函数(可 await params / 取数)
 * 3. 约定文件(icon、opengraph-image 等文件即配置)
 *
 * 三条通道最终合并成一棵 metadata 树:子段覆盖父段,
 * title.template 沿层级自动拼接。本页全部用本站真实代码举例。
 *
 * @module topics/metadata/guide
 */

import Link from "next/link";

import { TopicPage, TopicSection } from "@/components/topic/TopicPage";

/* =================================================================
 * 代码对照块(均摘自本仓库真实文件,路径见注释)
 * ================================================================ */

/** 静态 metadata:根 layout 的 title.default + title.template */
const STATIC_CODE = `// app/layout.tsx —— 根布局,全站 metadata 的根
// 品牌常量全部来自 config/site.ts(品牌单一数据源)
export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),   // 部署后自动取 VERCEL_URL
    title: {
        default: HOME_TITLE,           // "Next 权衡录 · 把选型放到同一把尺子上"
        template: \`%s | \${SITE_NAME}\`, // 子页标题自动套后缀
    },
    description: SITE_DESCRIPTION,
    openGraph: { type: "website", locale: "zh_CN", /* … */ },
    icons: { icon: "/favicon.ico" },
};`;

/** 薄壳页:从注册表派生静态 metadata */
const SHELL_CODE = `// app/metadata/guide/page.tsx —— 本站所有专题页的薄壳范式
import { getTopicMetadata } from "@/lib/topic-meta";
import MetadataGuideTopic from "@/topics/metadata/guide";

// 静态导出:构建期就确定,标题/描述与首页卡片同源(都读注册表)
export const metadata = getTopicMetadata("/metadata/guide");

export default function Page() {
    return <MetadataGuideTopic />;
}

// lib/topic-meta.ts 里 getTopicMetadata 做的事:
//   getTopicByPath(path) → { title, description, keywords, openGraph }
// 于是「首页卡片 / 专题页头 / <meta> 标签」三处文案永远一致`;

/** 动态 metadata:动态段的 generateMetadata */
const DYNAMIC_CODE = `// app/router/dynamic-routes/[id]/page.tsx —— 本站的活例子
export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const { id } = await params;
    const user = getUserById(Number(id));
    if (!user) return { title: "用户未找到" };
    return {
        title: \`\${user.name} - \${user.role}\`,
        openGraph: { title: \`\${user.name} - \${user.role} | \${SITE_NAME}\` },
    };
}

// page 保持 Server Component,标题就和页面写在一起。
// 只有 page 不得不 "use client" 时,才把 generateMetadata 挪到同级 layout。`;

/** 约定文件 */
const FILE_CONVENTION_CODE = `// 文件即配置:放进 app/ 对应段,Next 自动生成 <link>/<meta>
app/
├── favicon.ico            ← <link rel="icon">(本站正在用)
├── icon.png               ← 同职责,支持多尺寸与动态生成
├── opengraph-image.png    ← og:image 默认图,可按段覆盖
└── metadata/
    └── guide/
        └── opengraph-image.tsx  ← 段级覆盖:本段的分享卡片用这张

// 与 metadata 对象的关系:约定文件与 metadata 字段合并,
// 谁离页面近谁生效(段级 opengraph-image 覆盖根级 openGraph.images)`;

/* =================================================================
 * 专题主体
 * ================================================================ */

export default function MetadataGuideTopic() {
    return (
        <TopicPage
            path="/metadata/guide"
            title="metadata 流水线"
            description="静态 metadata / generateMetadata / 约定文件的合并顺序;本站 title.template 与 getTopicMetadata 的真实例子"
            references={[
                { label: "Next.js 文档:Metadata and OG Images", href: "https://nextjs.org/docs/app/getting-started/metadata-and-og-images" },
                { label: "Next.js 文档:generateMetadata", href: "https://nextjs.org/docs/app/api-reference/functions/generate-metadata" },
            ]}
        >
            <TopicSection
                title="三条通道:静态导出 → 动态函数 → 约定文件"
                note="按「构建期确定 / 请求期计算 / 文件即配置」分工;最终合并成一棵 metadata 树"
            >
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left text-xs leading-relaxed">
                        <thead>
                            <tr className="border-b border-neutral-200 text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                                <th className="py-2 pr-4 font-semibold">通道</th>
                                <th className="py-2 pr-4 font-semibold">什么时候算出来</th>
                                <th className="py-2 pr-4 font-semibold">能不能取数/读 params</th>
                                <th className="py-2 font-semibold">本站例子</th>
                            </tr>
                        </thead>
                        <tbody className="text-neutral-600 dark:text-neutral-400">
                            <tr className="border-b border-neutral-100 dark:border-neutral-800">
                                <td className="py-2 pr-4 font-medium text-neutral-800 dark:text-neutral-100">
                                    export const metadata
                                </td>
                                <td className="py-2 pr-4">构建期(静态页)或渲染期求值一次</td>
                                <td className="py-2 pr-4">不能(就是个对象)</td>
                                <td className="py-2">根 layout、各专题薄壳页</td>
                            </tr>
                            <tr className="border-b border-neutral-100 dark:border-neutral-800">
                                <td className="py-2 pr-4 font-medium text-neutral-800 dark:text-neutral-100">
                                    generateMetadata()
                                </td>
                                <td className="py-2 pr-4">请求期 async 计算</td>
                                <td className="py-2 pr-4">能(params / searchParams / fetch)</td>
                                <td className="py-2">/router/dynamic-routes/[id]</td>
                            </tr>
                            <tr>
                                <td className="py-2 pr-4 font-medium text-neutral-800 dark:text-neutral-100">
                                    约定文件
                                </td>
                                <td className="py-2 pr-4">构建期收集(icon 可为动态 route)</td>
                                <td className="py-2 pr-4">动态 icon/og 文件可运行时生成</td>
                                <td className="py-2">app/favicon.ico</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </TopicSection>

            <TopicSection
                title="合并顺序:子覆盖父,title.template 沿层级拼接"
                note="metadata 不是「谁赢谁」,而是按路由层级逐段合并"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        <strong>标量字段子覆盖父</strong>:子段的 description 覆盖父段的;
                        子段不写就继承父段,一路兜底到根 layout
                    </li>
                    <li>
                        <strong>title.template 是例外</strong>:子段给出标题主体(如
                        「约定文件对照」),离它最近的父级 template 负责拼接,最终产出
                        <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">
                            约定文件对照 | Next 权衡录
                        </code>
                        —— 子段自己也能再定义 template,形成多级模板链
                    </li>
                    <li>
                        <strong>openGraph 整体浅合并</strong>:子段写了 openGraph.title
                        就只覆盖 title,其余 og 字段继续继承父段
                    </li>
                </ul>
            </TopicSection>

            <TopicSection
                title="本站真实例子 ①:根 layout 的静态 metadata"
                note="app/layout.tsx —— 全站的根:default 兜底 + template 后缀 + og/twitter 基线"
            >
                <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{STATIC_CODE}
                </pre>
            </TopicSection>

            <TopicSection
                title="本站真实例子 ②:薄壳页读注册表"
                note="app/*/page.tsx + lib/topic-meta.ts —— 文案三处同源,杜绝卡片与 <meta> 漂移"
            >
                <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{SHELL_CODE}
                </pre>
            </TopicSection>

            <TopicSection
                title="本站真实例子 ③:动态段的 generateMetadata"
                note="app/router/dynamic-routes/[id]/page.tsx —— 每个用户详情页一个专属标题"
            >
                <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{DYNAMIC_CODE}
                </pre>
                <p className="mt-3 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    运行效果见
                    <Link
                        href="/router/dynamic-routes"
                        className="mx-1 text-rose-600 underline underline-offset-2 hover:text-rose-500 dark:text-rose-400"
                    >
                        动态路由专题
                    </Link>
                    :点进任一用户详情,浏览器标签标题随 id 变化。
                </p>
            </TopicSection>

            <TopicSection
                title="约定文件:icon / opengraph-image"
                note="文件即配置的第三条通道,适合「图」类资产"
            >
                <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{FILE_CONVENTION_CODE}
                </pre>
            </TopicSection>

            <TopicSection
                title="什么时候别用 generateMetadata"
                note="决策要点:动态函数是请求期成本,静态内容别为它买单"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        <strong>静态内容别动态生成</strong>:标题构建期就确定的页面用
                        export const metadata;generateMetadata 意味着请求期多一次函数
                        执行,静态页用它还会拖住预渲染
                    </li>
                    <li>
                        <strong>慢查询必须进 cache()</strong>:generateMetadata 与页面组件都要
                        取同一份数据时,用 React cache() 记忆化(本站 data/blog.ts 的
                        getPosts 即此模式),否则同一请求会把慢查询跑两遍 —— 一遍为
                        <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">
                            &lt;title&gt;
                        </code>
                        ,一遍为页面;详见
                        <Link
                            href="/data/cache-layers"
                            className="mx-1 text-rose-600 underline underline-offset-2 hover:text-rose-500 dark:text-rose-400"
                        >
                            四层缓存对照台
                        </Link>
                        的 Request Memoization 一节
                    </li>
                    <li>
                        <strong>别在里面做副作用</strong>:generateMetadata 可能因预渲染、
                        爬虫、重试被多次调用,埋点/写库这类事放进这里迟早出事
                    </li>
                    <li>
                        sitemap、robots 和 JSON-LD 不走这个函数,见
                        <Link
                            href="/metadata/crawl"
                            className="mx-1 text-rose-600 underline underline-offset-2 hover:text-rose-500 dark:text-rose-400"
                        >
                            爬虫文件专题
                        </Link>
                    </li>
                </ul>
            </TopicSection>
        </TopicPage>
    );
}
