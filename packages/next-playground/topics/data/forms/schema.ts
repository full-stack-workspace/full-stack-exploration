/**
 * ============================================================================
 * 创建文章的 zod schema 与 action 状态类型 — 表单进阶专题
 * ============================================================================
 *
 * schema 独立成文件而不是写进 actions.ts 的两个原因:
 * 1. actions.ts 是 "use server" 文件,模块级只允许导出 async 函数,
 *    schema/类型这类非函数导出放不进去
 * 2. schema 同时是「服务端权威校验」与「客户端体验校验」的单一数据源:
 *    input 上的 maxLength 等提示属性从同一组常量派生,两端不会悄悄漂移
 *
 * 错误建模约定(本专题的核心决策):
 * - fieldErrors:按字段分组的错误,回显到对应输入框下方(可纠正、可定位)
 * - formError:不属于任何字段的整单错误(如冲突、权限、服务异常),
 *   回显在表单顶部
 * 两者分通道传递,UI 才知道把错误画在哪。
 *
 * @module topics/data/forms/schema
 */

import { z } from "zod";

/* =================================================================
 * 字段约束常量(schema 与表单 UI 共用)
 * ================================================================ */

export const TITLE_MAX = 40;
export const BODY_MIN = 10;
export const BODY_MAX = 500;

/** 可选分类(与 schema 的 enum 保持一致) */
export const CATEGORIES = ["engineering", "design", "notes"] as const;

/* =================================================================
 * zod schema(服务端权威校验的唯一事实源)
 * ================================================================ */

export const createPostSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, "标题不能为空")
        .max(TITLE_MAX, `标题最多 ${TITLE_MAX} 字`),
    body: z
        .string()
        .trim()
        .min(BODY_MIN, `正文至少 ${BODY_MIN} 字`)
        .max(BODY_MAX, `正文最多 ${BODY_MAX} 字`),
    category: z.enum(CATEGORIES, "请选择一个有效分类"),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

/* =================================================================
 * action 返回状态(useActionState 的 state 形状)
 * ================================================================ */

/** 带校验 action 的返回状态 */
export interface CreatePostState {
    ok: boolean;
    /** 字段级错误:字段名 → 该字段的全部错误信息(来自 z.flattenError) */
    fieldErrors: Partial<Record<keyof CreatePostInput, string[]>>;
    /** 整单错误:无法归属到具体字段时使用 */
    formError: string | null;
    /** 成功时回显服务端清洗后的数据(trim 后的值),证明「入参被处理过」 */
    created?: CreatePostInput;
}

export const INITIAL_CREATE_POST_STATE: CreatePostState = {
    ok: false,
    fieldErrors: {},
    formError: null,
};

/** 对照组(不校验 action)的返回状态 */
export interface NaivePostState {
    submitted: boolean;
    /** 服务端原样收到的值,逐字段回显「不设校验会放进什么」 */
    received: { title: string; body: string; category: string };
}

export const INITIAL_NAIVE_STATE: NaivePostState = {
    submitted: false,
    received: { title: "", body: "", category: "" },
};
