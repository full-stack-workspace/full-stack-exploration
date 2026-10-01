/**
 * ============================================================================
 * i18n 演示字典 — zh / en 双份词条
 * ============================================================================
 *
 * 段级 i18n 的最小骨架:语言是路由参数([lang] 动态段),
 * 词条是普通的按 key 查表对象,page 与 generateMetadata 共用同一份字典,
 * 保证「页面内容」与「<title>/<meta>」同源。
 *
 * 规模刻意保持小(8 个词条)—— 重点是机制,不是翻译量。
 *
 * @module topics/router/i18n/dictionaries
 */

/** 本站演示支持的语言;也是 [lang] 段的合法取值 */
export const LOCALES = ["zh", "en"] as const;

export type Locale = (typeof LOCALES)[number];

/** 单语言词条形状:zh 为基准,en 必须与之同构 */
export interface Dictionary {
    /** <html lang> 与 metadata 用的语言码 */
    htmlLang: string;
    /** generateMetadata 产出的本地化标题/描述 */
    metaTitle: string;
    metaDescription: string;
    /** 页面正文词条 */
    heading: string;
    greeting: string;
    intro: string;
    currentLangLabel: string;
    switchLabel: string;
    backToTopic: string;
}

const zh: Dictionary = {
    htmlLang: "zh-CN",
    metaTitle: "i18n 演示 · 中文",
    metaDescription: "段级国际化演示:[lang] 动态段 + 字典模块 + generateStaticParams 预生成",
    heading: "你好,世界",
    greeting: "这一页的所有词条都来自 zh 字典。",
    intro: "语言是 URL 的第一段:/router/i18n/zh。切换语言就是切换这一段,其余路径保持不变。",
    currentLangLabel: "当前语言",
    switchLabel: "切换到 English",
    backToTopic: "回到国际化路由专题",
};

const en: Dictionary = {
    htmlLang: "en-US",
    metaTitle: "i18n Demo · English",
    metaDescription: "Segment-level i18n demo: [lang] dynamic segment + dictionary module + generateStaticParams",
    heading: "Hello, world",
    greeting: "Every string on this page comes from the en dictionary.",
    intro: "The locale is the first URL segment: /router/i18n/en. Switching language means swapping that segment; the rest of the path stays put.",
    currentLangLabel: "Current locale",
    switchLabel: "切换到中文",
    backToTopic: "Back to the i18n routing topic",
};

/** 字典表:lang → 词条 */
const DICTIONARIES: Record<Locale, Dictionary> = { zh, en };

/**
 * 按 lang 取字典;非法 lang 返回 undefined,由调用方决定 notFound()。
 *
 * @param lang - [lang] 动态段取值
 * @returns 词条对象;不支持的语言返回 undefined
 */
export function getDictionary(lang: string): Dictionary | undefined {
    return (DICTIONARIES as Record<string, Dictionary>)[lang];
}

/** 取「另一种」语言,用于切换链接(演示只有两种语言时够用) */
export function getOtherLocale(lang: Locale): Locale {
    return lang === "zh" ? "en" : "zh";
}
