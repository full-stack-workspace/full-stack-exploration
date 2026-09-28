/**
 * ============================================================================
 * Server Actions 留言板 — RSC 边界专题
 * ============================================================================
 *
 * 渐进增强留言板:本组件是 Server Component,每次请求时从内存存储
 * 读取留言列表并渲染;提交表单是唯一 Client 叶子(GuestbookForm),
 * 通过 useActionState 绑定 "use server" 的 postMessage action,
 * action 写入后 revalidatePath 让列表随响应一起刷新。
 *
 * 存储是模块级内存数组(见 store.ts),重启即失,生产换数据库。
 *
 * @module topics/rsc-boundary/server-actions
 */

import { TopicPage, TopicSection } from "@/components/topic/TopicPage";

import { GuestbookForm } from "./components/GuestbookForm";
import { listMessages } from "./store";

/** 把 ISO 时间串裁成「MM-DD HH:mm:ss」展示 */
function formatTime(iso: string): string {
    return `${iso.slice(5, 10)} ${iso.slice(11, 19)}`;
}

export default function ServerActionsTopic() {
    // Server Component 直读存储,不经过任何 HTTP 层
    const messages = listMessages();

    return (
        <TopicPage
            title="Server Actions 留言板"
            description="'use server' 变更 + <form action> 渐进增强:无 JS 也能提交;action 里 revalidatePath,列表随响应刷新"
        >
            <TopicSection
                title="留言板(可运行)"
                note="留言存于模块级内存数组,服务重启即失;禁用浏览器 JS 再提交,表单依然可用"
            >
                <GuestbookForm />
                <ul className="mt-5 space-y-3">
                    {messages.map((m) => (
                        <li
                            key={m.id}
                            className="rounded-xl border border-neutral-200/60 p-4 dark:border-neutral-800/60"
                        >
                            <div className="flex items-center justify-between gap-4">
                                <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                                    {m.author}
                                </p>
                                <p className="shrink-0 text-xs text-neutral-400 dark:text-neutral-500">
                                    {formatTime(m.createdAt)} UTC
                                </p>
                            </div>
                            <p className="mt-1 text-sm leading-relaxed break-words text-neutral-600 dark:text-neutral-400">
                                {m.content}
                            </p>
                        </li>
                    ))}
                </ul>
            </TopicSection>

            <TopicSection
                title="三个要点"
                note="渐进增强、入参安全、与 Route Handler 的分工"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        <strong>渐进增强</strong>:<code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">&lt;form action&gt;</code>
                        引用的 action 会被编译成真实的 POST 端点;JS 加载前/被禁用时表单退化为原生提交,
                        整页刷新但功能完整;JS 可用时升级为无刷新提交 + useActionState 状态反馈
                    </li>
                    <li>
                        <strong>永远不要信任入参</strong>:action 是公开的网络端点,
                        请求可以绕过你的表单直接构造;input 上的 required/maxLength 只是体验优化,
                        非空、长度、权限校验必须在 action 里重做(见 actions.ts)
                    </li>
                    <li>
                        <strong>与 Route Handler 分工</strong>:站点内部的变更(表单、按钮、乐观更新)用
                        Server Actions,省去手写端点与 fetch 封装,还自带 revalidatePath 刷新闭环;
                        对外的 HTTP 界面(第三方、移动端、webhook、需要 GET 语义的资源)用 Route Handler
                        —— 对照本分类外的 /data/route-handlers 专题
                    </li>
                </ul>
            </TopicSection>

            <TopicSection
                title="什么时候别用 Server Actions"
                note="它是「站内变更原语」,不是万能端点"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>需要被浏览器/CDN 缓存的读取:action 只支持 POST 语义,读取交给 Server Component 直取或 GET Route Handler</li>
                    <li>给非本站调用方的 API:外部系统不会带 Next 的 action 协议头,必须 Route Handler</li>
                    <li>大文件上传等长耗时传输:action 默认有请求体上限且不适合流式上传,走专用上传通道(见 next-upload 包)</li>
                </ul>
            </TopicSection>
        </TopicPage>
    );
}
