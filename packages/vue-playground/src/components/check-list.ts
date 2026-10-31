/**
 * ============================================================================
 * check-list — 理解检验题类型
 * ============================================================================
 *
 * CheckList.vue 的题目类型定义。Vue SFC 的 <script setup> 不允许
 * ES module 导出,类型因此独立成文件。
 *
 * @module components/check-list
 */

/** 单道检验题 */
export interface CheckItem {
    /** 题目 */
    question: string;
    /** 参考答案(先自答,再展开对照) */
    answer: string;
    /** 难度星级(1-3,可选;较难题标出) */
    star?: 1 | 2 | 3;
    /** 考察点(可选,星级题建议标出) */
    point?: string;
}
