/**
 * ============================================================================
 * Server/Client 边界 — RSC 边界专题
 * ============================================================================
 *
 * 从原 /user 页迁移:本组件是 Server Component(可被预渲染),
 * 把初始数据以 props 传给 UserListClient(Client Component),
 * 水合后由客户端接管搜索/添加交互。
 *
 * 边界要点:
 * - "use client" 是边界声明,不是「整个子树都客户端渲染」的开关
 * - 跨越边界的 props 必须可序列化(数据可以,函数不行)
 * - 边界越靠下(叶子),客户端 JS 越少
 *
 * @module topics/rsc-boundary/props-boundary
 */

import { Suspense } from "react";

import { TopicPage, TopicSection } from "@/components/topic/TopicPage";
import UserListClient from "@/components/UserListClient";
import { users } from "@/data/user";

import { PromiseSlot } from "./PromiseSlot";

/** 服务端延迟完成的说明。每次请求新建一份,不放进模块作用域以免串请求。 */
const loadBoundaryNote = (): Promise<string> =>
    new Promise((resolve) => {
        setTimeout(() => {
            resolve("这句话在服务端等了约 700ms。函数传不过边界,这个 Promise 可以:客户端用 use() 解开,等待期间由 Suspense 占位。");
        }, 700);
    });

export default function PropsBoundaryTopic() {
    return (
        <TopicPage
            path="/rsc-boundary/props-boundary"
            title="Server/Client 边界"
            description="page 保持 Server Component 预渲染,交互(搜索/添加)下沉到 Client Component;初始数据以 props 跨越边界"
            references={[
                { label: "Next.js 文档:Server and Client Components(组合与 props)", href: "https://nextjs.org/docs/app/getting-started/server-and-client-components" },
                { label: "React 文档:use()(解开跨边界的 Promise)", href: "https://react.dev/reference/react/use" },
            ]}
        >
            <TopicSection
                title="边界对照:Server 外壳 + Client 交互叶子"
                note="本组件在服务端渲染并预取数据;下面的列表是 Client Component,水合后接管搜索与添加"
            >
                <UserListClient initialUsers={users} />
            </TopicSection>

            <TopicSection
                title="什么能跨过这条边界"
                note="序列化按值走。下面的 Promise 是活的:刷新后会重新等一次"
            >
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-left text-sm leading-relaxed">
                        <thead>
                            <tr className="border-b border-rule text-xs text-neutral-500 dark:border-neutral-700">
                                <th className="py-2 pr-4 font-medium">值</th>
                                <th className="py-2 font-medium">能否交给 Client</th>
                            </tr>
                        </thead>
                        <tbody className="text-neutral-600 dark:text-neutral-400">
                            <tr className="border-b border-rule/80 dark:border-neutral-800">
                                <td className="py-2 pr-4">string / number / boolean / null / undefined、可序列化的普通对象与数组</td>
                                <td className="py-2">Flight 原生支持。上面的用户列表就是这样传进去的</td>
                            </tr>
                            <tr className="border-b border-rule/80 dark:border-neutral-800">
                                <td className="py-2 pr-4">Date、Map、Set、BigInt、TypedArray / ArrayBuffer、RegExp</td>
                                <td className="py-2">Flight 原生支持。Date 能传,但跨时区序列化后语义要留心,团队约定传 ISO 字符串也常见</td>
                            </tr>
                            <tr className="border-b border-rule/80 dark:border-neutral-800">
                                <td className="py-2 pr-4">Promise</td>
                                <td className="py-2">Flight 原生支持。Client 用 use() 解开,必须有 Suspense</td>
                            </tr>
                            <tr>
                                <td className="py-2 pr-4">普通函数、类实例、Symbol、WeakMap / WeakSet</td>
                                <td className="py-2">真的不能。要动作就改成 Server Action,或把交互留在客户端</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 border border-rule px-4 py-3 dark:border-neutral-800">
                    <Suspense
                        fallback={
                            <p className="text-sm text-neutral-500">服务端的 Promise 还没完成…</p>
                        }
                    >
                        <PromiseSlot note={loadBoundaryNote()} />
                    </Suspense>
                </div>
            </TopicSection>

            <TopicSection
                title="什么时候别把边界往上推"
                note="'use client' 写在哪一层,直接决定客户端 bundle 大小"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>只有叶子需要交互时,不要把整个页面标成 &quot;use client&quot;——那会把本可静态化的内容全部送进客户端 bundle</li>
                    <li>跨边界传参必须是可序列化数据;想传函数,改用 Server Actions 或把交互整体下移</li>
                    <li>Server Component 可以 import Client Component;反过来不行(Client 想嵌 Server,走 children 槽)</li>
                </ul>
            </TopicSection>
        </TopicPage>
    );
}
