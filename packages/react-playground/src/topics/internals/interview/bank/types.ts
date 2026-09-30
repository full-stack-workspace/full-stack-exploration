/**
 * ============================================================================
 * types — 理解检验问答的数据结构
 * ============================================================================
 *
 * 一题三段:短标题进目录,要点先出口,body 把因果写完。related 只链本站已有页。
 *
 * @module topics/internals/interview/bank/types
 */

export interface RelatedLink {
    to: string;
    label: string;
}

export interface InterviewQuestion {
    /** 页内锚点,全库唯一 */
    id: string;
    /** 目录上的短标题 */
    toc: string;
    /** 题干,页内会加上序号 */
    title: string;
    note: string;
    points: readonly string[];
    body: readonly string[];
    related?: readonly RelatedLink[];
}

export interface InterviewGroup {
    id: string;
    title: string;
    blurb: string;
    questions: readonly InterviewQuestion[];
}

export interface NumberedQuestion extends InterviewQuestion {
    number: number;
}

export interface NumberedGroup extends Omit<InterviewGroup, 'questions'> {
    questions: readonly NumberedQuestion[];
}
