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
 * @module components/Footer
 */

import Link from "next/link";

import { CATEGORIES, getCategoryFirstPath, TOPICS } from "@/config/topics";
import { SITE_NAME, SITE_SLOGAN, SITE_THESIS } from "@/lib/topic-meta";

import { BrandMark } from "./BrandMark";

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

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-rule bg-white dark:border-neutral-800 dark:bg-neutral-950">
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
                                <p className="mt-1 text-[11px] leading-none text-copper-600 dark:text-copper-400">
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
                                        className="text-sm text-neutral-500 transition-colors hover:text-copper-600 dark:text-neutral-400 dark:hover:text-copper-400"
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
                                        className="text-sm text-neutral-500 transition-colors hover:text-copper-600 dark:text-neutral-400 dark:hover:text-copper-400"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* 版权行 */}
                <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-neutral-200/60 pt-6 sm:flex-row dark:border-neutral-800/60">
                    <p className="text-xs text-neutral-400 dark:text-neutral-500">
                        © {currentYear} Next Playground · Next.js 16 + React 19 + Tailwind CSS 4
                    </p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500">
                        {CATEGORIES.length} 个知识领域 · {TOPICS.length} 个工程专题
                    </p>
                </div>
            </div>
        </footer>
    );
}
