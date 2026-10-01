/**
 * ============================================================================
 * CheckList — 理解检验题目列表(纯静态问答)
 * ============================================================================
 *
 * 各分类「理解检验」专题页共用的题目渲染骨架,参照 react-playground
 * 的 check 页形态做的克制版:分组 + 连续编号题目卡片 + 星级难度 /
 * 考察点标注,答案用原生 <details> 折叠 —— 纯 Server Component,
 * 不需要任何客户端 JS,也不做交互计分。
 *
 * 功能特点：
 * - 题目按分组(TopicSection)组织,组内组间连续编号
 * - difficulty(1-5)渲染为星级,focus 渲染为「考察点」徽标
 * - 答案段落默认折叠,展开后附「回到专题」回链
 *
 * @module components/topic/CheckList
 */

import Link from "next/link";

import { TopicSection } from "./TopicPage";

/** 单道题:决策/机制问法,答案附「为什么」 */
export interface CheckQuestion {
    /** 稳定 id(key 用) */
    id: string;
    /** 题目正文 */
    title: string;
    /** 题干补充(灰字小字) */
    note?: string;
    /** 难度星级 1-5;省略表示基础题 */
    difficulty?: number;
    /** 考察点标签,与星级一起出现 */
    focus?: string;
    /** 答案段落(默认折叠在 <details> 里) */
    answer: string[];
    /** 答案末尾的「回到专题」回链 */
    related?: Array<{ href: string; label: string }>;
}

/** 题目分组:一组一个 TopicSection */
export interface CheckGroup {
    id: string;
    title: string;
    /** 分组导语 */
    blurb?: string;
    questions: CheckQuestion[];
}

/** 难度星级,如 ★★★☆☆ */
function stars(level: number): string {
    return "★".repeat(level) + "☆".repeat(5 - level);
}

/**
 * 渲染整张检验卷:每组一个 TopicSection,题目跨组连续编号。
 *
 * @param groups - 题目分组(顺序即展示顺序)
 * @example
 * <CheckList groups={RENDERING_GROUPS} />
 */
export function CheckList({ groups }: { groups: CheckGroup[] }) {
    // 预算各组起始题号(纯函数推导),让编号跨组连续(Q1…Qn)
    const entries = groups.map((group, gi) => ({
        group,
        start: groups
            .slice(0, gi)
            .reduce((sum, g) => sum + g.questions.length, 0),
    }));

    return (
        <>
            {entries.map(({ group, start }) => (
                <TopicSection key={group.id} title={group.title} note={group.blurb}>
                    <ol className="space-y-4">
                        {group.questions.map((question, i) => (
                            <li
                                key={question.id}
                                className="rounded-xl border border-neutral-200/70 bg-white/60 p-4 dark:border-neutral-800 dark:bg-neutral-900/40"
                            >
                                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                    <span className="font-mono text-[11px] text-neutral-400 dark:text-neutral-500">
                                        Q{start + i + 1}
                                    </span>
                                    <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                                        {question.title}
                                    </p>
                                    {question.difficulty !== undefined && (
                                        <span
                                            className="font-mono text-[11px] text-amber-500 dark:text-amber-400"
                                            aria-label={`难度 ${question.difficulty}/5`}
                                        >
                                            {stars(question.difficulty)}
                                        </span>
                                    )}
                                    {question.focus && (
                                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                                            考察点:{question.focus}
                                        </span>
                                    )}
                                </div>
                                {question.note && (
                                    <p className="mt-1.5 text-xs leading-relaxed text-neutral-400 dark:text-neutral-500">
                                        {question.note}
                                    </p>
                                )}
                                <details className="mt-3">
                                    <summary className="cursor-pointer text-xs font-medium text-signal-600 transition-colors hover:text-signal dark:text-signal-400">
                                        参考答案与「为什么」
                                    </summary>
                                    <div className="mt-2 space-y-2 border-l-2 border-signal/30 pl-3">
                                        {question.answer.map((paragraph, j) => (
                                            <p
                                                key={j}
                                                className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400"
                                            >
                                                {paragraph}
                                            </p>
                                        ))}
                                        {question.related && question.related.length > 0 && (
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                回到专题:
                                                {question.related.map((link) => (
                                                    <Link
                                                        key={link.href}
                                                        href={link.href}
                                                        className="ml-2 text-signal-600 underline decoration-signal-500/40 underline-offset-4 transition-colors hover:decoration-signal-500 dark:text-signal-400"
                                                    >
                                                        {link.label}
                                                    </Link>
                                                ))}
                                            </p>
                                        )}
                                    </div>
                                </details>
                            </li>
                        ))}
                    </ol>
                </TopicSection>
            ))}
        </>
    );
}
