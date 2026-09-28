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

import { TopicPage, TopicSection } from "@/components/topic/TopicPage";
import UserListClient from "@/components/UserListClient";
import { users } from "@/data/user";

export default function PropsBoundaryTopic() {
    return (
        <TopicPage
            title="Server/Client 边界"
            description="page 保持 Server Component 预渲染,交互(搜索/添加)下沉到 Client Component;初始数据以 props 跨越边界"
        >
            <TopicSection
                title="边界对照:Server 外壳 + Client 交互叶子"
                note="本组件在服务端渲染并预取数据;下面的列表是 Client Component,水合后接管搜索与添加"
            >
                <UserListClient initialUsers={users} />
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
