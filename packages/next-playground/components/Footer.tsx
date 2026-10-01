/**
 * ============================================================================
 * Footer — 站点页脚
 * ============================================================================
 *
 * 三栏结构:品牌简介、专题分类导航(注册表驱动,新增分类自动出现)、
 * 外部资源链接;底部为版权行。
 *
 * 由 app/layout.tsx 挂载在 SiteShell 之后,全宽展示。
 * 本组件是 Server Component(纯链接,无交互)。
 *
 * cacheComponents 备注:版权年用 "use cache" 函数取 —
 * 新模型下 Server Component 渲染期不允许直接 new Date(),
 * 当前时间要么来自缓存产物(本组件,构建期取一次即可),
 * 要么先读过请求级数据(connection()/headers() 等)。
 *
 * @module components/Footer
 */

import Link from "next/link";

import { SITE_NAME, SITE_SLOGAN, SITE_THESIS } from "@/config/site";
import { CATEGORIES, getCategoryFirstPath, TOPICS } from "@/config/topics";

import { BrandMark } from "./BrandMark";

/**
 * 版权年:一年才变一次,构建期取一次随静态产物冻结即可。
 * "use cache" 让 new Date() 在新模型下合法(时间来自缓存产物)。
 */
async function getCopyrightYear(): Promise<number> {
    "use cache";
    return new Date().getFullYear();
}

/**
 * 外部资源链接(站内跳转一律用 Link,站外用 <a target=_blank>)
 */
const RESOURCE_LINKS = [
    { href: "https://nextjs.org/docs", label: "Next.js 文档" },
    { href: "https://react.dev", label: "React 文档" },
    { href: "https://tailwindcss.com", label: "Tailwind CSS" },
    { href: "https://vercel.com/docs", label: "Vercel 部署" },
    { href: "https://github.com/vercel/next.js", label: "Next.js GitHub" },
];

export default async function Footer() {
    const currentYear = await getCopyrightYear();

    return (
        <footer className="border-t border-mist bg-panel dark:border-neutral-800 dark:bg-night">
            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
                    {/* 品牌区 */}
                    <div className="md:col-span-5">
                        <div className="flex items-center gap-2.5">
                            <BrandMark className="h-8 w-8" />
                            <div>
                                <p className="font-display text-[15px] leading-none font-semibold tracking-[-0.03em] text-ink dark:text-neutral-50">
                                    {SITE_NAME}
                                </p>
                                <p className="mt-1 text-[11px] leading-none text-signal-600 dark:text-signal-400">
                                    {SITE_SLOGAN}
                                </p>
                            </div>
                        </div>
                        <p className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                            {SITE_THESIS}
                        </p>
                    </div>

                    {/* 专题分类(注册表派生) */}
                    <div className="md:col-span-4">
                        <h3 className="mb-4 text-sm font-semibold tracking-wide text-neutral-900 uppercase dark:text-neutral-50">
                            专题分类
                        </h3>
                        <ul className="grid grid-cols-2 gap-x-4 gap-y-3">
                            {CATEGORIES.map((c) => (
                                <li key={c.key}>
                                    <Link
                                        href={getCategoryFirstPath(c.key)}
                                        transitionTypes={["nav-forward"]}
                                        className="text-sm text-neutral-500 transition-colors hover:text-signal-600 dark:text-neutral-400 dark:hover:text-signal-400"
                                    >
                                        {c.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 外部资源 */}
                    <div className="md:col-span-3">
                        <h3 className="mb-4 text-sm font-semibold tracking-wide text-neutral-900 uppercase dark:text-neutral-50">
                            资源
                        </h3>
                        <ul className="space-y-3">
                            {RESOURCE_LINKS.map((link) => (
                                <li key={link.href}>
                                    <a
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-neutral-500 transition-colors hover:text-signal-600 dark:text-neutral-400 dark:hover:text-signal-400"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* 版权行 */}
                <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-mist pt-6 sm:flex-row dark:border-neutral-800/60">
                    <p className="text-xs text-neutral-400 dark:text-neutral-500">
                        © {currentYear} {SITE_NAME} · Next.js 16 + React 19 + Tailwind CSS 4
                    </p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500">
                        {CATEGORIES.length} 个领域 · {TOPICS.length} 个专题
                    </p>
                </div>
            </div>
        </footer>
    );
}
