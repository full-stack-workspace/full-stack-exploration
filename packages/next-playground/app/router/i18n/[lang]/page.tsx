/**
 * ============================================================================
 * [lang] 双语演示页 — 段级 i18n 的活例子
 * ============================================================================
 *
 * - generateStaticParams 预生成 zh / en 两个版本(构建期静态产出)
 * - 页面与 generateMetadata 共用 topics/router/i18n/dictionaries.ts 的同一份字典,
 *   标题与正文同语言
 * - 非法 lang(如 /router/i18n/fr)在运行时走 notFound()
 *
 * cacheComponents 约束:非预生成的 lang 在请求时渲染,params 的读取
 * 必须包在 Suspense 边界里(外层 Page 只传 promise,内层 Content 才 await)。
 *
 * @module app/router/i18n/[lang]/page
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import {
    getDictionary,
    getOtherLocale,
    type Locale,
    LOCALES,
} from "@/topics/router/i18n/dictionaries";

interface LangPageProps {
    params: Promise<{ lang: string }>;
}

/** 预生成两种语言版本;其余 lang 在请求时渲染并走 notFound() */
export function generateStaticParams() {
    return LOCALES.map((lang) => ({ lang }));
}

/** 按 lang 产出本地化标题/描述:与页面正文读同一份字典 */
export async function generateMetadata({ params }: LangPageProps): Promise<Metadata> {
    const { lang } = await params;
    const dict = getDictionary(lang);
    if (!dict) {
        return { title: "404", robots: { index: false, follow: false } };
    }
    return { title: dict.metaTitle, description: dict.metaDescription };
}

export default function LangPage({ params }: LangPageProps) {
    return (
        <Suspense fallback={<p className="text-sm text-neutral-500">…</p>}>
            <Content params={params} />
        </Suspense>
    );
}

async function Content({ params }: LangPageProps) {
    const { lang } = await params;
    const dict = getDictionary(lang);
    // 非法语言是「预期中的空」,不是渲染错误:notFound() 交给最近的 not-found.tsx
    if (!dict) {
        notFound();
    }
    const other = getOtherLocale(lang as Locale);

    return (
        <div className="mx-auto max-w-3xl" lang={dict.htmlLang}>
            <p className="font-mono text-[11px] tracking-[0.18em] text-sky-600 dark:text-sky-400">
                /router/i18n/{lang} — generateStaticParams 预生成
            </p>
            <h1 className="mt-4 font-display text-3xl font-semibold tracking-[-0.03em] text-ink dark:text-neutral-50">
                {dict.heading}
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-400">
                {dict.greeting}
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-400">
                {dict.intro}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className="rounded-md bg-neutral-100 px-2.5 py-1.5 font-mono text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                    {dict.currentLangLabel}: {lang}
                </span>
                {/* 语言切换 = 只换 URL 的第一段,其余路径段原样保留 */}
                <Link
                    href={`/router/i18n/${other}`}
                    className="rounded-md bg-ink px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-neutral-100 dark:text-ink dark:hover:bg-white"
                >
                    {dict.switchLabel}
                </Link>
                <Link
                    href="/router/i18n"
                    className="text-sm text-neutral-500 underline underline-offset-4 hover:text-ink dark:text-neutral-400 dark:hover:text-neutral-50"
                >
                    {dict.backToTopic}
                </Link>
            </div>
        </div>
    );
}
