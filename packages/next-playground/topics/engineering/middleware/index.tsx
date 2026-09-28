/**
 * ============================================================================
 * 中间件边界与代价 — 工程化专题
 * ============================================================================
 *
 * middleware.ts 是 Next.js 请求管线的最前一站:在路由匹配与渲染之前
 * 对每个命中的请求执行,可改写、重定向、改头部、做鉴权门。
 *
 * 本页是活演示:包根 middleware.ts 对本页路径追加自定义响应头
 * x-playground-middleware: demo,用 curl 即可验证。
 *
 * @module topics/engineering/middleware
 */

import { headers } from "next/headers";

import { TopicPage, TopicSection } from "@/components/topic/TopicPage";
import { DEMO_HEADER } from "@/lib/demo-header";

/* =================================================================
 * 代码对照块
 * ================================================================ */

/** 本站 middleware.ts 全文(与包根文件保持同步) */
const MIDDLEWARE_CODE = `// middleware.ts —— 包根,与 app/ 同级
import { NextResponse, type NextRequest } from "next/server";
import { DEMO_HEADER } from "@/lib/demo-header";

export function middleware(request: NextRequest) {
    // 请求头:页面里 headers() 读得到
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(DEMO_HEADER, "demo");
    const response = NextResponse.next({
        request: { headers: requestHeaders },
    });
    // 响应头:curl -I 看得到。两个头不是同一个对象
    response.headers.set(DEMO_HEADER, "demo");
    return response;
}

// matcher:只有命中的路径才执行 middleware,其余路由零开销
export const config = {
    matcher: ["/engineering/middleware"],
};`;

/** curl 验证命令 */
const CURL_CODE = `# 生产构建后验证(dev 下同样生效):
curl -I http://localhost:3000/engineering/middleware
# HTTP/2 200
# x-playground-middleware: demo     ← 自定义头在这里

curl -I http://localhost:3000/
# HTTP/2 200
# (没有 x-playground-middleware)    ← 未命中 matcher,中间件未执行`;

/** 鉴权「门」与「账」的分工 */
const AUTH_CODE = `// ✅ 中间件做「门」:有无、过期的粗判,拦住明显未登录的请求
export function middleware(request: NextRequest) {
    const token = request.cookies.get("session")?.value;
    if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next(); // 放行,细粒度判断交给页面/接口
}

// ❌ 中间件别做「账」:权限矩阵、配额、行级数据归属这类判断
// 需要查库/读业务状态,放中间件里既慢又受运行时限制;
// 正确的位置是页面/Route Handler 内部,或受保护的数据访问层`;

/* =================================================================
 * 专题主体
 * ================================================================ */

export default async function MiddlewareTopic() {
    // headers() 读的是请求头。中间件若只改响应,这里会是 null。
    const headerStore = await headers();
    const demoHeader = headerStore.get(DEMO_HEADER);

    return (
        <TopicPage
            title="Proxy 与中间件"
            description="Next 16 的 proxy.ts 固定跑在 Node;本站仍用 middleware.ts 做边缘改头演示,页面能读到同一枚请求头。matcher 之外的路由不会经过它"
        >
            <TopicSection
                title="这一页读到的请求头"
                note="headers() 看到的是请求,不是 curl -I 里的响应。两边都写了同一个名字"
            >
                <p className="font-mono text-sm text-ink dark:text-neutral-100">
                    {DEMO_HEADER}: {demoHeader ?? "（没有。matcher 未命中,或只改了响应头）"}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    读 headers() 会让这一页变成动态渲染。这是代价的一部分:要在渲染时看见请求级信息,就不能再把整页冻成静态 HTML。
                </p>
            </TopicSection>

            <TopicSection
                title="活演示:响应头同时给 curl"
                note="包根 middleware.ts;matcher 只命中本页路径"
            >
                <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{MIDDLEWARE_CODE}
                </pre>
                <pre className="mt-3 overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{CURL_CODE}
                </pre>
                <p className="mt-3 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    源码见
                    <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">
                        packages/next-playground/middleware.ts
                    </code>
                    。页面上的字来自请求头;curl -I 看到的是响应头。运行时差异见下方「proxy.ts 与 middleware.ts」。
                </p>
            </TopicSection>

            <TopicSection
                title="执行位置:请求管线的最前一站"
                note="在路由匹配、缓存查找、渲染之前执行;部署到边缘时离用户最近"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        请求到达 → <strong>middleware</strong> → 路由匹配 → 缓存 → 渲染;
                        因此它适合做「入口级」决策:改写 URL、重定向、打头、粗鉴权
                    </li>
                    <li>
                        <strong>matcher 决定成本面</strong>:不写 matcher 等于每个请求
                        (含 _next/static、图片、favicon)都过一遍中间件;
                        本站收敛到单一路径就是为了让其余路由零开销
                    </li>
                    <li>
                        matcher 支持数组与否定模式,常见写法是
                        <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">
                            {`"/((?!_next/static|_next/image|favicon.ico).*)"`}
                        </code>
                        排除静态资产,只拦页面与 API
                    </li>
                </ul>
            </TopicSection>

            <TopicSection
                title="能做什么:改写 / 重定向 / 头部 / 鉴权门"
                note="四种职责都建立在「请求还没进渲染管线」这个事实之上"
            >
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left text-xs leading-relaxed">
                        <thead>
                            <tr className="border-b border-neutral-200 text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                                <th className="py-2 pr-4 font-semibold">能力</th>
                                <th className="py-2 pr-4 font-semibold">API</th>
                                <th className="py-2 font-semibold">典型场景</th>
                            </tr>
                        </thead>
                        <tbody className="text-neutral-600 dark:text-neutral-400">
                            <tr className="border-b border-neutral-100 dark:border-neutral-800">
                                <td className="py-2 pr-4 font-medium text-neutral-800 dark:text-neutral-100">改写 rewrite</td>
                                <td className="py-2 pr-4">NextResponse.rewrite()</td>
                                <td className="py-2">URL 不变、内容换源(多租户路径映射、A/B 实验分桶)</td>
                            </tr>
                            <tr className="border-b border-neutral-100 dark:border-neutral-800">
                                <td className="py-2 pr-4 font-medium text-neutral-800 dark:text-neutral-100">重定向 redirect</td>
                                <td className="py-2 pr-4">NextResponse.redirect()</td>
                                <td className="py-2">未登录跳 /login、地区跳转、旧链接迁移</td>
                            </tr>
                            <tr className="border-b border-neutral-100 dark:border-neutral-800">
                                <td className="py-2 pr-4 font-medium text-neutral-800 dark:text-neutral-100">头部 header</td>
                                <td className="py-2 pr-4">NextResponse.next() 后改 headers</td>
                                <td className="py-2">本站演示;给下游传请求级上下文(实验分组、追踪 ID)</td>
                            </tr>
                            <tr>
                                <td className="py-2 pr-4 font-medium text-neutral-800 dark:text-neutral-100">鉴权门 auth gate</td>
                                <td className="py-2 pr-4">读 cookie / header 粗判后放行或拦截</td>
                                <td className="py-2">「有没有票」的门口检查,见下方代码</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <pre className="mt-4 overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{AUTH_CODE}
                </pre>
            </TopicSection>

            <TopicSection
                title="Next 16:proxy.ts 与 middleware.ts"
                note="改名同时改了默认运行时。本站留着旧文件,是因为这则演示要跑在边缘上"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        <strong>proxy.ts</strong> 是新的文件约定,导出函数叫 proxy。它固定在 Node.js 运行时,不能再配 runtime
                    </li>
                    <li>
                        <strong>middleware.ts</strong> 仍能跑,默认还是 Edge,但已经废弃,构建时会警告。需要边缘上的轻量改写时,眼下仍用它
                    </li>
                    <li>两个文件不能同时存在。迁到 proxy 之后,依赖 Edge 冷启动的逻辑要重新量过延迟</li>
                    <li>matcher、NextResponse.next()、改头和重定向的写法两边相同。变的是运行时,不是 API 形状</li>
                </ul>
            </TopicSection>

            <TopicSection
                title="什么时候别用 middleware"
                note="决策要点:每个匹配请求都要付一次执行成本,且运行时是受限的"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        <strong>别读请求 body</strong>:中间件面向头部与路径工作,
                        读 body 会拖慢整条管线且 API 受限;需要 body 的判断放到
                        Route Handler / Server Action 里做
                    </li>
                    <li>
                        <strong>别做重计算与数据库查询</strong>:middleware 通常运行在受限的
                        边缘运行时(无 Node 全量 API、冷启动计入每个请求),
                        一次查询放大成「每个匹配请求一次」
                    </li>
                    <li>
                        <strong>鉴权只做「门」不做「账」</strong>:cookie 有无/过期的粗判放这里;
                        权限矩阵、配额、数据归属这类「账」必须有服务端权威校验,
                        中间件的放行永远不能替代页面/接口内的鉴权
                    </li>
                    <li>
                        <strong>一个中间件能干的,不等于都该让它干</strong>:
                        能下沉到具体路由的 rewrite 规则(next.config.ts)优先用配置,
                        静态规则不需要运行时函数
                    </li>
                </ul>
            </TopicSection>
        </TopicPage>
    );
}
