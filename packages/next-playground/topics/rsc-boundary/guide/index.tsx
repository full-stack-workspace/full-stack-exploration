/**
 * ============================================================================
 * RSC 心智模型 — Server/Client 边界专题(梳理页)
 * ============================================================================
 *
 * 纯 Server Component 梳理页,回答三个问题:
 * - 为什么 Next.js 默认所有组件都是 Server Component
 * - 每画一条 "use client" 边界,真实付出的成本是什么
 * - Client 组件想嵌 Server 内容时,为什么必须走 children 槽
 *
 * 本页无交互、无取数,是 rsc-boundary 分类的入口页;
 * 实操见 props-boundary(边界下沉)与 server-actions(变更闭环)两页。
 *
 * @module topics/rsc-boundary/guide
 */

import Link from "next/link";

import { TopicPage, TopicSection } from "@/components/topic/TopicPage";

/* =================================================================
 * 代码对照块
 * ================================================================ */

/** children 槽:错误写法 —— Client 组件 import Server 组件 */
const CHILDREN_BAD = `// ❌ ClientCounter.tsx
"use client";
// Server 组件被 import 进 Client 边界,会被当作 Client 组件处理,
// 整棵子树都被拖进客户端 bundle,RSC 优势清零
import ServerList from "./ServerList";

export function ClientCounter() {
    return (
        <div>
            <ServerList />
        </div>
    );
}`;

/** children 槽:正确写法 —— Server 内容以 children 传入 */
const CHILDREN_GOOD = `// ✅ page.tsx(Server Component)
import { ClientCounter } from "./ClientCounter";
import ServerList from "./ServerList";

export default function Page() {
    return (
        <ClientCounter>
            {/* 在服务端渲染完毕,以 RSC 载荷形式嵌入 Client 组件的槽位 */}
            <ServerList />
        </ClientCounter>
    );
}

// ✅ ClientCounter.tsx
"use client";
import { useState, type ReactNode } from "react";

// 只声明「我有一个槽」,不关心槽里是什么 —— 槽的内容不进入客户端渲染管线
export function ClientCounter({ children }: { children: ReactNode }) {
    const [n, setN] = useState(0);
    return (
        <div>
            <button onClick={() => setN(n + 1)}>点击 {n} 次</button>
            {children}
        </div>
    );
}`;

/* =================================================================
 * 专题主体
 * ================================================================ */

export default function RscGuideTopic() {
    return (
        <TopicPage
            path="/rsc-boundary/guide"
            title="RSC 心智模型"
            description="为什么默认 Server:RSC 载荷是序列化的 UI 描述;每条 'use client' 边界都是一次 bundle 切点与序列化约束;Client 嵌 Server 走 children 槽"
            references={[
                { label: "Next.js 文档:Server and Client Components", href: "https://nextjs.org/docs/app/getting-started/server-and-client-components" },
                { label: "React 文档:Server Components", href: "https://react.dev/reference/rsc/server-components" },
            ]}
        >
            <TopicSection
                title="为什么默认是 Server Component"
                note="客户端 JS 不是默认配置,而是显式 opt-in"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        App Router 里所有组件默认在服务端渲染并可直接预渲染成静态产物;
                        只有写了
                        <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">
                            &quot;use client&quot;
                        </code>
                        的模块才会进入客户端 bundle。交互能力(state/effect/浏览器
                        API)是用客户端体积换来的,所以要按叶子粒度申请
                    </li>
                    <li>
                        服务端渲染的产出物是 <strong>RSC 载荷</strong>:一种序列化的
                        <strong>UI 描述</strong>(组件树 + props 的流式格式)。
                        它不是 HTML(HTML 由它驱动生成),也不是 JSON 数据(它描述的是界面而不是接口返回值);
                        客户端拿到它后与已有 DOM  reconcile,无需重新下载整棵组件树的代码
                    </li>
                    <li>
                        推论:Server Component 的代码本身<strong>永远不会被发送到浏览器</strong>
                        —— 数据查询、密钥、重型依赖留在服务端,是它超越「SSR 模板」的根本原因
                    </li>
                </ul>
            </TopicSection>

            <TopicSection
                title="边界成本:每条 'use client' 都要付两次钱"
                note="边界不是免费的分组标记,而是真实的工程开销"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        <strong>一份客户端 bundle 切点</strong>:该模块及其 import
                        链全部进入客户端产物,需要被下载、解析、水合。边界画得越高,切进来的代码越多
                    </li>
                    <li>
                        <strong>一次序列化约束</strong>:跨越边界的 props 必须可序列化
                        (数据可以,函数/类实例/JSX 以外的运行时对象不行);
                        想传回调,要么改用 Server Actions,要么把交互整体下移
                    </li>
                    <li>
                        因此边界的正确位置是<strong>尽可能靠下的叶子</strong>:
                        页面外壳、数据、静态内容留在 Server,只有真正交互的控件下沉为 Client
                        (实操对照见下方 props-boundary 专题)
                    </li>
                </ul>
            </TopicSection>

            <TopicSection
                title="children 槽:Client 组件嵌 Server 内容的唯一正确姿势"
                note="Client 不能 import Server,但可以接收 Server 渲染好的 children"
            >
                <div className="grid gap-4 lg:grid-cols-2">
                    <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{CHILDREN_BAD}
                    </pre>
                    <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{CHILDREN_GOOD}
                    </pre>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    原理:children 对 Client 组件而言是一个「已经渲染好的 RSC 载荷占位」,
                    它在服务端求值,Client 组件只负责把它放进自己的 DOM 槽位;
                    而 import 会把模块拉进自己的编译单元,边界随之吞掉整棵子树。
                </p>
            </TopicSection>

            <TopicSection
                title="什么时候别把边界往上推"
                note="决策要点:先问「谁真的需要交互」,再问边界画在哪"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        整页标
                        <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">
                            &quot;use client&quot;
                        </code>
                        图省事 = 放弃预渲染 + 全量客户端 bundle + 失去服务端直取数据的能力,三种成本一起付
                    </li>
                    <li>
                        表单变更不要本能地写 onSubmit + fetch 自己的 API:
                        站点内部的提交优先 Server Actions,少一次边界序列化、自带渐进增强
                    </li>
                    <li>
                        判断顺序:这段 UI 需要 state/effect/浏览器 API 吗?不需要就保持 Server;
                        需要就把那一片叶子单独抽成 Client 组件,而不是提升整页
                    </li>
                </ul>
            </TopicSection>

            <TopicSection
                title="本分类的另两页"
                note="心智模型落地为两种实操:边界下沉与变更闭环"
            >
                <div className="grid gap-3 sm:grid-cols-2">
                    <Link
                        href="/rsc-boundary/props-boundary"
                        className="group rounded-xl border border-neutral-200/60 p-4 transition-colors hover:border-indigo-300 dark:border-neutral-800/60 dark:hover:border-indigo-700"
                    >
                        <p className="text-sm font-semibold text-neutral-800 group-hover:text-indigo-600 dark:text-neutral-100 dark:group-hover:text-indigo-400">
                            Server/Client 边界 →
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                            props-boundary:初始数据以可序列化 props 跨边界,交互下沉到叶子 Client 组件
                        </p>
                    </Link>
                    <Link
                        href="/rsc-boundary/server-actions"
                        className="group rounded-xl border border-neutral-200/60 p-4 transition-colors hover:border-indigo-300 dark:border-neutral-800/60 dark:hover:border-indigo-700"
                    >
                        <p className="text-sm font-semibold text-neutral-800 group-hover:text-indigo-600 dark:text-neutral-100 dark:group-hover:text-indigo-400">
                            Server Actions 留言板 →
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                            server-actions:&quot;use server&quot; 变更 + 渐进增强表单 + revalidatePath 刷新
                        </p>
                    </Link>
                </div>
            </TopicSection>
        </TopicPage>
    );
}
