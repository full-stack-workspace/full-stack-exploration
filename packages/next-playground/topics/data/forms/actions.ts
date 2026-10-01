/**
 * ============================================================================
 * 表单进阶 Server Actions — 有校验 vs 无校验的对照实验
 * ============================================================================
 *
 * createPost(正例):
 *   FormData → zod safeParse → 失败时 z.flattenError 拆出字段级错误回显;
 *   成功时返回 trim 后的干净数据。校验失败不抛异常、不写库,
 *   错误作为「返回值」走 useActionState 的 state 通道回客户端。
 *
 * createPostNaive(对照组):
 *   同样的入参,不校验、原样接收并回显 —— 空标题、缺分类、超长正文
 *   照单全收。它不是「坏例子」而是证据:action 是公开端点,
 *   没有 schema 就没有任何防线。
 *
 * @module topics/data/forms/actions
 */

"use server";

import { z } from "zod";

import {
    createPostSchema,
    type CreatePostState,
    type NaivePostState,
} from "./schema";

/**
 * 创建文章(带 zod 权威校验,供 useActionState 绑定)。
 *
 * @param prevState - 上一次提交结果(useActionState 约定,本例不读)
 * @param formData - 表单原始数据;永远视为不可信输入
 * @returns 字段级错误(可定位)或整单错误(不可定位),成功时回显清洗结果
 */
export async function createPost(
    prevState: CreatePostState,
    formData: FormData,
): Promise<CreatePostState> {
    void prevState;

    // safeParse 不抛异常:校验失败是「正常业务分支」,不是系统错误
    const parsed = createPostSchema.safeParse({
        title: formData.get("title"),
        body: formData.get("body"),
        category: formData.get("category"),
    });

    if (!parsed.success) {
        // flattenError 把 issues 按字段分桶:fieldErrors 回显到输入框下方,
        // formErrors(schema 级错误)归入整单通道
        const { formErrors, fieldErrors } = z.flattenError(parsed.error);
        return {
            ok: false,
            fieldErrors,
            formError: formErrors[0] ?? null,
        };
    }

    // 人为延迟:localhost 往返太快,pending 态肉眼不可见
    await new Promise((resolve) => setTimeout(resolve, 600));

    // 真实应用在这里写库;本页只回显 trim 后的干净数据作为「已处理」证据
    return { ok: true, fieldErrors: {}, formError: null, created: parsed.data };
}

/**
 * 对照组:不做任何校验的 action。
 * 原样接收并回显,让「空值、超长、非法枚举会怎样」变成可见的事实。
 */
export async function createPostNaive(
    prevState: NaivePostState,
    formData: FormData,
): Promise<NaivePostState> {
    void prevState;

    // 唯一的「处理」是把 FormData 值收窄为字符串 —— 没有它连渲染都会崩,
    // 这不叫校验,叫不炸
    return {
        submitted: true,
        received: {
            title: String(formData.get("title") ?? ""),
            body: String(formData.get("body") ?? ""),
            category: String(formData.get("category") ?? ""),
        },
    };
}
