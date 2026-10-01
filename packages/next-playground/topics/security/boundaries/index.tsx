/**
 * ============================================================================
 * 信任边界:环境变量、taint 与 Server Actions — security 分类专题
 * ============================================================================
 *
 * 三个演示格,对应三条「别把服务端的东西漏给客户端 / 别信客户端传来的东西」:
 * 1. 环境变量边界:同两个变量,Server 与 Client 各读到什么(活读数)
 * 2. taint APIs:React 官方的「防手滑」保险丝(讲解演示,未开全站实验开关)
 * 3. Server Actions 入参不可信:action 是公开 HTTP 端点,校验必须在服务端
 *
 * 环境变量在请求时读取(进程启动后才确定),由薄壳页的 connection() +
 * Suspense 洞保证请求时渲染。
 *
 * @module topics/security/boundaries
 */

import { TopicPage, TopicSection } from "@/components/topic/TopicPage";

import { ClientPublicValue, ClientServerOnlyValue } from "./ClientEnvCells";

/* =================================================================
 * 演示变量名(与 .env.local 对应;未设置时读数为 undefined/未设置,
 * 对比结论不受影响)
 * ================================================================ */

const SERVER_ONLY_VAR = "PLAYGROUND_SERVER_ONLY_DEMO";
const PUBLIC_VAR = "NEXT_PUBLIC_PLAYGROUND_BOUNDARY_DEMO";

/* =================================================================
 * 代码块
 * ================================================================ */

/** taint APIs 讲解演示(本站未开启 experimental.taint) */
const TAINT_CODE = `// lib/data.ts —— 数据访问层,只应被 Server Component 调用
import "server-only"; // 第一道保险:被 client bundle import 时构建直接报错
import {
    experimental_taintObjectReference,
    experimental_taintUniqueValue,
} from "react";

export async function getUser(id: string) {
    const user = await db.user.findUnique({ where: { id } });

    // 第二道保险:整对象打污点 —— 任何把它当 props 传给
    // Client Component 的尝试,在服务端渲染时直接抛错,
    // 而不是静默序列化进 RSC 载荷
    experimental_taintObjectReference(
        "不要把整个 user 对象传给客户端,只挑需要的字段",
        user,
    );

    // 单个敏感值打污点:passwordHash 即使被「挑出来」单独传也过不去
    experimental_taintUniqueValue(
        "密码哈希永远不能离开服务端",
        user,
        user.passwordHash,
    );

    return user;
}

// 需要在 next.config.ts 开启:experimental: { taint: true }
// 本站未开启:该开关是全站性实验选项,而本站演示数据没有真实敏感字段,
// 为一段讲解改动全站运行时不值得 —— 所以本格是代码讲解,不是活演示`;

/** Server Actions 服务端校验(摘自本站留言板,与源码同步) */
const ACTION_CODE = `// topics/rsc-boundary/server-actions/actions.ts —— 本站活例子
"use server";

export async function postMessage(prevState, formData) {
    // FormData 的值可能是 File 或 null,统一收窄为字符串再 trim
    const author = String(formData.get("author") ?? "").trim() || "匿名";
    const content = String(formData.get("content") ?? "").trim();

    // 服务端校验是最后一道防线:请求可以绕过前端直接打到 action
    if (!content) {
        return { ok: false, error: "留言内容不能为空" };
    }
    if (content.length > MESSAGE_MAX_LENGTH) {
        return { ok: false, error: \`留言最多 \${MESSAGE_MAX_LENGTH} 字\` };
    }
    // ...鉴权、写库、revalidatePath
}`;

/** curl 直接打 action 端点的心智演示 */
const ACTION_CURL = `# action 就是一个公开 POST 端点(Next-Action 头里是 action ID):
curl -X POST http://localhost:3000/rsc-boundary/server-actions \\
  -H "Next-Action: <action-id>" \\
  -F 'content=绕过表单直接提交'

# 表单 UI 的 maxLength 根本拦不住这个请求 —— 它是体验,不是防线`;

/* =================================================================
 * 专题主体
 * ================================================================ */

export default function SecurityBoundariesTopic() {
    // 请求时读取进程环境:薄壳页已用 connection() 声明本页每请求渲染
    const serverOnly = process.env[SERVER_ONLY_VAR];
    const publicVar = process.env[PUBLIC_VAR];

    return (
        <TopicPage
            path="/security/boundaries"
            title="信任边界:环境变量、taint 与 Server Actions"
            description="三条边界各一格:同两个环境变量在 Server/Client 两侧的对照读数、React taint APIs 的防手滑保险丝、以及「Server Action 是公开 HTTP 端点」的入参校验心智"
            references={[
                { label: "React 文档:experimental_taintObjectReference", href: "https://react.dev/reference/react/experimental_taintObjectReference" },
                { label: "React 文档:experimental_taintUniqueValue", href: "https://react.dev/reference/react/experimental_taintUniqueValue" },
                { label: "Next.js 文档:Server Actions 安全(鉴权、入参校验、闭包加密)", href: "https://nextjs.org/docs/app/guides/authentication" },
                { label: "server-only 包", href: "https://www.npmjs.com/package/server-only" },
            ]}
        >
            <TopicSection
                title="环境变量边界:同两个变量,两侧各读到什么"
                note="演示变量定义在本包 .env.local(gitignored);没建文件时两侧读数为空,对比结论不变"
            >
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-xs leading-relaxed">
                        <thead>
                            <tr className="border-b border-neutral-200 text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                                <th className="py-2 pr-4 font-semibold">变量</th>
                                <th className="py-2 pr-4 font-semibold">Server Component 读到</th>
                                <th className="py-2 font-semibold">Client Component 读到</th>
                            </tr>
                        </thead>
                        <tbody className="text-neutral-600 dark:text-neutral-400">
                            <tr className="border-b border-neutral-100 dark:border-neutral-800">
                                <td className="py-2.5 pr-4 font-mono break-all text-neutral-800 dark:text-neutral-100">
                                    {SERVER_ONLY_VAR}
                                </td>
                                <td className="py-2.5 pr-4">
                                    {serverOnly ? (
                                        <span className="font-mono break-all text-emerald-700 dark:text-emerald-400">
                                            {serverOnly}
                                        </span>
                                    ) : (
                                        <span className="font-mono text-neutral-400">
                                            undefined(未设置 .env.local)
                                        </span>
                                    )}
                                </td>
                                <td className="py-2.5">
                                    <ClientServerOnlyValue />
                                    <span className="ml-2 text-neutral-400">
                                        构建期不替换,恒为 undefined
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td className="py-2.5 pr-4 font-mono break-all text-neutral-800 dark:text-neutral-100">
                                    {PUBLIC_VAR}
                                </td>
                                <td className="py-2.5 pr-4">
                                    {publicVar ? (
                                        <span className="font-mono break-all text-emerald-700 dark:text-emerald-400">
                                            {publicVar}
                                        </span>
                                    ) : (
                                        <span className="font-mono text-neutral-400">
                                            undefined(未设置 .env.local)
                                        </span>
                                    )}
                                </td>
                                <td className="py-2.5">
                                    <ClientPublicValue />
                                    <span className="ml-2 text-neutral-400">
                                        构建期内联成字面量,随 bundle 公开分发
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        <strong>NEXT_PUBLIC_ 前缀 = 公开承诺</strong>:它的值会被构建期
                        内联进客户端 JS,任何人打开 DevTools 就能搜到 —— 只放「本来就公开」
                        的配置(站点 URL、公开 SDK key),永远不放密钥
                    </li>
                    <li>
                        <strong>无前缀变量进不了 client bundle</strong>:上表右上的
                        undefined 就是保护本身;真正要兜底的是约定 —— 密钥变量不加前缀,
                        数据访问层文件顶部 import &quot;server-only&quot;,被 client
                        引用时构建直接报错
                    </li>
                    <li>
                        注意读取方式的差异:Server 侧 process.env[NAME] 在请求时读进程环境;
                        Client 侧必须逐字写 process.env.NAME,动态键不会被替换
                    </li>
                </ul>
            </TopicSection>

            <TopicSection
                title="taint APIs:防「手滑」的保险丝(讲解演示)"
                note="本站未开启 experimental.taint 全站实验开关,本格为代码讲解;开启方式在代码块注释里"
            >
                <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    环境变量靠「不内联」保护,但 RSC 还有另一条泄漏通道:把服务端数据
                    当 props 传给 Client Component 时会被序列化进 RSC 载荷,随页面发给浏览器。
                    正确做法是「只挑需要的字段」;taint APIs 是这条纪律的强制保险 ——
                    打上污点的对象/值一旦被传给客户端,服务端渲染直接抛错。
                </p>
                <pre className="mt-4 overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{TAINT_CODE}
                </pre>
                <p className="mt-3 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    分工:taintObjectReference 管「整行记录别出去」,taintUniqueValue
                    管「这个值本身别出去」;两者都只防手滑,不防故意的恶意代码 ——
                    它们替代不了「只挑字段」的纪律。
                </p>
            </TopicSection>

            <TopicSection
                title="Server Actions:入参不可信"
                note="活例子见本站留言板专题 /rsc-boundary/server-actions"
            >
                <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    每个 &quot;use server&quot; 函数都会编译成一个带 action ID 的公开
                    POST 端点。表单 UI、maxLength、客户端校验都可以被绕过 ——
                    任何人拿 curl 就能直接打这个端点:
                </p>
                <pre className="mt-4 overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{ACTION_CURL}
                </pre>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        <strong>闭包加密 ≠ 防伪</strong>:.bind 绑定的闭包变量确实加密传输
                        (机密性),但客户端提交的参数是攻击者完全可控的(完整性为零);
                        加密解决的是「别被偷看」,不是「可以信任」
                    </li>
                    <li>
                        <strong>知道 action ID 就能调用</strong>:所以鉴权(session、
                        权限、数据归属)必须在 action 体内重做,不能假设「这个按钮只有
                        管理员看得见」
                    </li>
                    <li>
                        <strong>校验在服务端重做一遍</strong>:下面是本站留言板的真实做法;
                        字段更多时用 zod 这类 schema 库(本包已装)收口,比手写 if 更稳
                    </li>
                </ul>
                <pre className="mt-4 overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{ACTION_CODE}
                </pre>
            </TopicSection>

            <TopicSection
                title="安全检查清单"
                note="本专题三格 + /security/headers 的响应头,收拢成上线前的过一遍"
            >
                <ul className="space-y-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    {[
                        "响应头:nosniff / frame 保护 / Referrer-Policy / Permissions-Policy 已下发;CSP 先 Report-Only 收报告,再用 proxy.ts nonce 切强制",
                        "环境变量:密钥一律不带 NEXT_PUBLIC_ 前缀;数据访问层 import \"server-only\"",
                        "跨边界 props:只挑字段,不传整行记录;有真实敏感数据时开 experimental.taint 兜底",
                        "Server Actions / Route Handlers:入参 schema 校验 + 鉴权逐请求重做,不依赖 UI 层的隐藏与禁用",
                        "依赖面:next 与第三方包保持更新,构建产物里没有意料之外的密钥串(可 grep .next 验证)",
                    ].map((item) => (
                        <li key={item} className="flex gap-2.5">
                            <span
                                aria-hidden="true"
                                className="mt-1 inline-block h-3.5 w-3.5 shrink-0 rounded-sm border border-neutral-300 dark:border-neutral-600"
                            />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </TopicSection>
        </TopicPage>
    );
}
