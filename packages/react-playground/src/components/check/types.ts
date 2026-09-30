/**
 * ============================================================================
 * types — 理解检验问答的数据结构
 * ============================================================================
 *
 * 一题先给要点,再写展开。进阶题可以标难度和考察点。related 只链本站已有页。
 *
 * @module components/check/types
 */

export interface RelatedLink {
    to: string;
    label: string;
}

/** 3 进阶,4 较难,5 资深。不标的题按基础掌握来读。 */
export type Difficulty = 3 | 4 | 5;

export interface CheckQuestion {
    id: string;
    toc: string;
    title: string;
    note: string;
    points: readonly string[];
    body: readonly string[];
    related?: readonly RelatedLink[];
    difficulty?: Difficulty;
    /** 这题主要在看哪一种判断 */
    focus?: string;
}

export interface CheckGroup {
    id: string;
    title: string;
    blurb: string;
    questions: readonly CheckQuestion[];
}

export interface NumberedQuestion extends CheckQuestion {
    number: number;
}

export interface NumberedGroup extends Omit<CheckGroup, 'questions'> {
    questions: readonly NumberedQuestion[];
}
