/**
 * ============================================================================
 * 表单进阶:校验与错误回显 — 数据与缓存专题
 * ============================================================================
 *
 * /rsc-boundary/server-actions 的进阶篇。三件套
 * (useActionState / useFormStatus / useOptimistic)在那边已逐个讲过,
 * 本页不重复,聚焦它没回答的问题:入参校验放哪、错误怎么建模回显。
 *
 * 活演示是两组对照:
 * - CreatePostForm:zod schema 在 Server Action 里权威校验,
 *   z.flattenError 拆出字段级错误,useActionState 把 state 带回客户端,
 *   错误画在对应输入框下方
 * - NaiveForm:同字段、不校验的 action,原样回显收到的值 ——
 *   「input 的 required 只是体验」的可运行证据
 *
 * 本组件是 Server Component;两个表单是仅有的 Client 叶子。
 *
 * @module topics/data/forms
 */

import Link from "next/link";

import { TopicPage, TopicSection } from "@/components/topic/TopicPage";

import { CreatePostForm } from "./components/CreatePostForm";
import { NaiveForm } from "./components/NaiveForm";

export default function FormsTopic() {
    return (
        <TopicPage
            path="/data/forms"
            title="表单进阶:校验与错误回显"
            description="zod 在 Server Action 里做权威校验:z.flattenError 拆出字段级错误回显到输入框下方;对照不设校验的 action 会收下什么"
            references={[
                { label: "zod 文档:Error customization(v4)", href: "https://zod.dev/error-customization" },
                { label: "Next.js 文档:Forms and Mutations", href: "https://nextjs.org/docs/app/getting-started/mutating-data" },
                { label: "React 文档:useActionState", href: "https://react.dev/reference/react/useActionState" },
            ]}
        >
            {/* 前置指引:三件套已在留言板专题讲过,这里用卡片链过去,不重复展开 */}
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 text-sm leading-relaxed text-indigo-900 dark:border-indigo-800/60 dark:bg-indigo-950/30 dark:text-indigo-200">
                本页是
                <Link
                    href="/rsc-boundary/server-actions"
                    className="mx-1 font-semibold underline underline-offset-2 hover:text-indigo-600 dark:hover:text-indigo-300"
                >
                    Server Actions 留言板
                </Link>
                的进阶篇:useActionState(结果态)/ useFormStatus(进行态)/
                useOptimistic(乐观态)的分工与渐进增强实现细节已在彼处展开,
                这里专注两件事 —— 校验放哪、错误怎么回到对应的输入框。
            </div>

            <TopicSection
                title="活演示:带 zod 校验的创建表单(可运行)"
                note="试着提交空表单、短于 10 字的正文、不选分类 —— 错误出现在对应字段下方;禁用 JS 再提交,错误照样回来"
            >
                <CreatePostForm />
            </TopicSection>

            <TopicSection
                title="对照组:不设校验的 action 会收下什么"
                note="同样的三个字段,action 里一行校验都没有 —— 提交什么它收什么"
            >
                <NaiveForm />
                <p className="mt-3 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    action 是公开的网络端点:请求可以绕过你的表单直接构造
                    (curl、Postman、被篡改的页面)。input 上的
                    required / maxLength 只是体验提示,不是防线;
                    唯一的防线在服务端,而 schema 是防线最紧凑的写法。
                </p>
            </TopicSection>

            <TopicSection
                title="校验位置:体验校验 vs 权威校验"
                note="两层校验不是重复劳动,它们服务不同的目的、面对不同的对手"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        <strong>客户端校验 = 体验</strong>:输入时即时反馈、省一次往返;
                        它面对的是「正常用户」,可以被打包体积和交互成本约束
                        (本页 input 的 maxLength 就属于这一层,且与 schema 共用常量,避免漂移)
                    </li>
                    <li>
                        <strong>服务端校验 = 权威</strong>:面对的是「任何能发 HTTP 请求的人」;
                        它必须完整、不假设客户端存在。zod schema 写在 action 里,
                        safeParse 失败是正常业务分支(返回错误),不是异常(不 throw)
                    </li>
                    <li>
                        <strong>单一数据源</strong>:两份规则手写两份必然漂移。
                        把 schema 独立成模块(schema.ts),服务端 safeParse、
                        客户端提示属性都从它派生 —— 规则改一处,两端同时生效
                    </li>
                </ul>
            </TopicSection>

            <TopicSection
                title="错误建模:fieldErrors vs formError"
                note="错误要回显,先得回答「画在哪」—— 两种错误走两条通道"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        <strong>fieldErrors(可定位)</strong>:能归属到具体字段的错误
                        (标题为空、正文太短),z.flattenError 按字段名分桶,
                        UI 画在对应输入框下方并标红边框 —— 用户知道改哪里
                    </li>
                    <li>
                        <strong>formError(不可定位)</strong>:不属于任何字段的整单错误
                        (唯一性冲突、权限不足、下游服务异常),画在表单顶部;
                        本页的 flattenError 里 schema 级 formErrors 也归入这条通道
                    </li>
                    <li>
                        <strong>别用 throw 传业务错误</strong>:throw 走的是 error.tsx
                        边界,整页被替换、表单状态丢失;校验失败是预期内的分支,
                        作为 action 返回值经 useActionState 回传,表单与输入都保住
                    </li>
                </ul>
            </TopicSection>

            <TopicSection
                title="与渐进增强的关系"
                note="校验在服务端,所以无 JS 时它依然在"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        form action 绑定的是 useActionState 的 dispatch(未包闭包):
                        无 JS 时表单退化为原生 POST,action 照常执行、schema 照常校验,
                        React 会把返回的 state 渲染进重渲的页面 —— 字段错误无 JS 同样可见
                    </li>
                    <li>
                        代价是整页刷新;JS 可用后同一套代码升级为无刷新提交。
                        正确性不依赖客户端,这就是「校验放服务端」的副产品
                    </li>
                </ul>
            </TopicSection>
        </TopicPage>
    );
}
