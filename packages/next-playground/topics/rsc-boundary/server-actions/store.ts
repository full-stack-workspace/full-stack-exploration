/**
 * ============================================================================
 * 留言板内存存储 — Server Actions 专题
 * ============================================================================
 *
 * 模块级数组即全部「数据库」:Node 进程存活期间跨请求共享,
 * 服务重启 / 重新部署即丢失。生产环境应替换为真实数据库
 * (Postgres / Redis / KV 等),本文件只需换成对应的读写实现。
 *
 * 注意:本文件不带 "use server",是普通服务端模块,
 * 可以被 Server Component(读列表)与 actions.ts(写入)共同 import。
 *
 * @module topics/rsc-boundary/server-actions/store
 */

/** 留言记录 */
export interface Message {
    id: number;
    author: string;
    content: string;
    /** ISO 时间串,展示时截取时分秒 */
    createdAt: string;
}

/** Server Action 的返回状态,供 useActionState 消费 */
export interface MessageActionState {
    /** 本次提交是否成功 */
    ok: boolean;
    /** 失败原因;成功或无提交时为 null */
    error: string | null;
}

/** 单条留言长度上限(字符) */
export const MESSAGE_MAX_LENGTH = 140;

/* =================================================================
 * 模块级状态(重启即失,仅作演示)
 * ================================================================ */

/** 留言数组:进程级共享,预置两条种子留言 */
const messages: Message[] = [
    {
        id: 1,
        author: "Next.js",
        content: "我是种子留言:禁用 JavaScript 再提交一条试试,表单照样工作。",
        createdAt: new Date().toISOString(),
    },
    {
        id: 2,
        author: "RSC",
        content: "提交后 action 里调了 revalidatePath,列表由服务端重新渲染。",
        createdAt: new Date().toISOString(),
    },
];

/** 自增 id 计数器 */
let nextId = messages.length + 1;

/* =================================================================
 * 读写接口
 * ================================================================ */

/** 读取留言列表(新的在前,返回拷贝避免外部改动内部状态) */
export function listMessages(): Message[] {
    return [...messages].reverse();
}

/** 追加一条留言 */
export function appendMessage(input: { author: string; content: string }): Message {
    const message: Message = {
        id: nextId++,
        author: input.author,
        content: input.content,
        createdAt: new Date().toISOString(),
    };
    messages.push(message);
    return message;
}
