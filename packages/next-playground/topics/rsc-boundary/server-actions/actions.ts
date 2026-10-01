/**
 * ============================================================================
 * 留言板 Server Actions
 * ============================================================================
 *
 * "use server" 文件:导出的每个 async 函数都会编译成一个
 * 可被 <form action> 直接引用的服务端端点,客户端不需要手写 fetch。
 *
 * 安全要点:action 的入参来自网络,与 Route Handler 的入参一样不可信,
 * 校验必须在服务端重做一遍(客户端的 maxLength 只是体验,不是防线)。
 *
 * @module topics/rsc-boundary/server-actions/actions
 */

"use server";

import { revalidatePath } from "next/cache";

import {
    appendMessage,
    MESSAGE_MAX_LENGTH,
    type MessageActionState,
} from "./store";

/** 本专题路由路径,revalidatePath 的目标 */
const TOPIC_PATH = "/rsc-boundary/server-actions";

/**
 * 提交留言(供 useActionState 绑定)。
 *
 * @param prevState - 上一次提交的结果(useActionState 约定,本例不读)
 * @param formData - 表单原始数据;永远不要信任,先校验再使用
 * @returns 新的表单状态,驱动 Client 侧的报错/成功提示
 */
export async function postMessage(
    prevState: MessageActionState,
    formData: FormData,
): Promise<MessageActionState> {
    void prevState;

    // FormData 的值可能是 File 或 null,统一收窄为字符串再 trim
    const author = String(formData.get("author") ?? "").trim() || "匿名";
    const content = String(formData.get("content") ?? "").trim();

    // 服务端校验是最后一道防线:请求可以绕过前端直接打到 action
    if (!content) {
        return { ok: false, error: "留言内容不能为空" };
    }
    if (content.length > MESSAGE_MAX_LENGTH) {
        return { ok: false, error: `留言最多 ${MESSAGE_MAX_LENGTH} 字` };
    }
    if (author.length > 20) {
        return { ok: false, error: "昵称最多 20 字" };
    }

    appendMessage({ author, content });

    // 人为延迟:localhost 往返太快,pending/乐观态肉眼不可见,
    // 教学演示需要可观测的「提交中/发送中」窗口
    await new Promise((resolve) => setTimeout(resolve, 800));

    // 写入后让该路径的缓存失效,下一个渲染读到最新列表;
    // action 返回后 Next 会自动携带刷新后的 RSC 载荷,无需手动跳转
    revalidatePath(TOPIC_PATH);
    return { ok: true, error: null };
}
