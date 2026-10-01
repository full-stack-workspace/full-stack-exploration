/**
 * ============================================================================
 * Server Actions 留言板 — RSC 边界专题
 * ============================================================================
 *
 * 渐进增强留言板:本组件是 Server Component,每次请求时从内存存储
 * 读取留言列表;留言板整体(表单 + 列表)是唯一 Client 叶子
 * (GuestbookForm),列表经 props 下发、SSR 首屏即完整,乐观项在其上叠加。
 *
 * React 19 表单三件套在此分工:
 * - useActionState = 结果态:action 完成后的 ok/error
 * - useFormStatus  = 进行态:提交按钮的 pending
 * - useOptimistic  = 乐观态:提交即上屏,真值到达后替换、失败回滚
 *
 * action 写入后 revalidatePath 让列表随响应一起刷新。
 * 存储是模块级内存数组(见 store.ts,头注有 Serverless 多实例 caveat),
 * 重启即失,生产换 KV/DB。
 *
 * @module topics/rsc-boundary/server-actions
 */

import { TopicPage, TopicSection } from "@/components/topic/TopicPage";

import { GuestbookForm } from "./components/GuestbookForm";
import { listMessages } from "./store";

export default function ServerActionsTopic() {
    // Server Component 直读存储,不经过任何 HTTP 层
    const messages = listMessages();

    return (
        <TopicPage
            path="/rsc-boundary/server-actions"
            title="Server Actions 留言板"
            description="'use server' 变更 + <form action> 渐进增强:无 JS 也能提交;action 里 revalidatePath,列表随响应刷新"
            references={[
                { label: "Next.js 文档:Mutating Data(Server Actions)", href: "https://nextjs.org/docs/app/getting-started/mutating-data" },
                { label: "React 文档:Server Functions", href: "https://react.dev/reference/rsc/server-functions" },
            ]}
        >
            <TopicSection
                title="留言板(可运行)"
                note="留言存于模块级内存数组,服务重启即失;禁用浏览器 JS 再提交,表单依然可用"
            >
                <GuestbookForm messages={messages} />
            </TopicSection>

            <TopicSection
                title="表单三件套的分工"
                note="useActionState / useFormStatus / useOptimistic 不是互替品,各管一段时间轴"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        <strong>useActionState = 结果态</strong>:绑定 action 后拿到「上一次提交的返回值」,
                        驱动报错/成功提示;本页还借「每次派发都换新 state 对象」这一点,
                        在 effect 里精确捕获成功时刻做 form.reset()
                    </li>
                    <li>
                        <strong>useFormStatus = 进行态</strong>:必须是 <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">&lt;form&gt;</code> 的子孙组件(本页的 SubmitButton),
                        读父表单本次提交的 pending 来禁用按钮、切换文案 —— 不需要 props 透传,
                        所以它管不到 form 之外的元素
                    </li>
                    <li>
                        <strong>useOptimistic = 乐观态</strong>:提交即把留言叠上列表(虚线 + 半透明 + 「发送中」),
                        服务端确认后由 revalidatePath 带回的真值无缝顶替,失败则自动回滚、错误交给 state.error 展示
                        —— 乐观层只活到所在 transition 结束,实现细节见 GuestbookForm 头注
                    </li>
                    <li>
                        <strong>渐进增强与乐观更新的共存</strong>:乐观项必须包在 action 闭包里
                        (与 action 同属一个 transition;在 onSubmit 里另开 startTransition 会
                        与表单 transition 纠缠死锁),但 SSR 不会为客户端闭包渲染隐藏 action 字段,
                        无 JS 原生 POST 会打空。解法是 mounted 开关:水合前
                        <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">&lt;form action&gt;</code>
                        引用 useActionState 的 dispatch(隐藏字段齐全,无 JS 可提交),
                        水合后切换为乐观闭包 —— 实现细节见 GuestbookForm 头注
                    </li>
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
