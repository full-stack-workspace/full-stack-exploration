/**
 * ============================================================================
 * 构建、测量与部署 — engineering 分类专题
 * ============================================================================
 *
 * 三段工程链路:
 * 1. Turbopack 是 Next 16 的默认打包器(dev 与 build 都是)
 * 2. @next/bundle-analyzer 实装(本包真实可跑:pnpm analyze)
 * 3. 部署形态:standalone 自托管、instrumentation + OTel、after()
 *
 * 本页是静态讲解页:所有「证据」都是构建产物(报告文件、构建输出快照),
 * 不构成请求时数据。
 *
 * @module topics/engineering/build-deploy
 */

import { TopicPage, TopicSection } from "@/components/topic/TopicPage";

/* =================================================================
 * 代码块
 * ================================================================ */

/** bundle analyzer 的实装(与本站 next.config.ts / package.json 同步) */
const ANALYZER_CODE = `// next.config.ts
import withBundleAnalyzer from "@next/bundle-analyzer";

export default withBundleAnalyzer({
    enabled: process.env.ANALYZE === "true",
    // 构建机/CI 上别弹浏览器,报告写到 .next/analyze/*.html
    openAnalyzer: false,
})(nextConfig);

// package.json —— 关键在 --webpack:
// @next/bundle-analyzer 是 webpack 插件,Next 16 默认的 Turbopack
// 构建下它不产出任何报告(只会打一行警告),所以要显式回退跑一次
{ "scripts": { "analyze": "ANALYZE=true next build --webpack" } }`;

/** standalone 自托管配置(讲解片段,本站刻意未开启) */
const STANDALONE_CODE = `// next.config.ts —— 演示片段,本站并未开启
const nextConfig: NextConfig = {
    output: "standalone",
};

// 构建产物:.next/standalone/ 是一个自包含目录,
// 只含运行所需的最小 node_modules + server.js:
//   node .next/standalone/server.js
// 注意:public/ 与 .next/static/ 不会自动并入,
// 自托管时要自行拷贝(官方 Dockerfile 模板里就是两行 COPY)`;

/** instrumentation.ts + OpenTelemetry(讲解片段) */
const INSTRUMENTATION_CODE = `// instrumentation.ts —— 包根,与 app/ 同级;Next 启动时自动执行一次
export async function register() {
    // 按运行时条件加载:OTel SDK 依赖 Node API,Edge 运行时跳过
    if (process.env.NEXT_RUNTIME === "nodejs") {
        const { registerOTel } = await import("@vercel/otel");
        registerOTel({ serviceName: "next-playground" });
    }
}

// 之后所有 Server Component 渲染、fetch、Route Handler
// 都会自动产生 trace span;接入 Jaeger/Tempo/Datadog 即可观测`;

/** after():响应之后的副作用(讲解片段) */
const AFTER_CODE = `// Route Handler / Server Component / Server Action 里都能用
import { after } from "next/server";

export async function POST(request: Request) {
    const result = await doWork(request);

    // 响应先发回去,日志/指标/通知在响应之后执行:
    // 可观测性代码不再拖慢用户感知的延迟
    after(async () => {
        await logAnalytics(result);
        await flushMetrics();
    });

    return Response.json(result);
}`;

/** 本站 pnpm analyze 的真实构建输出快照(教学取样,以本地重跑为准) */
const BUILD_OUTPUT_CODE = `$ pnpm analyze          # ANALYZE=true next build --webpack
▲ Next.js 16.2.4 (webpack)
- Cache Components enabled

  Creating an optimized production build ...
Webpack Bundle Analyzer saved report to .next/analyze/nodejs.html
Webpack Bundle Analyzer saved report to .next/analyze/edge.html
Webpack Bundle Analyzer saved report to .next/analyze/client.html
✓ Compiled successfully

# 日常构建(不带 --webpack)则跑 Turbopack,快得多但不出 analyzer 报告:
$ pnpm build            # ▲ Next.js 16.2.4 (Turbopack)`;

/* =================================================================
 * 专题主体
 * ================================================================ */

export default function BuildDeployTopic() {
    return (
        <TopicPage
            path="/engineering/build-deploy"
            title="构建、测量与部署"
            description="Turbopack 已是 Next 16 默认打包器;@next/bundle-analyzer 以 --webpack 回退实装(pnpm analyze 可跑,报告在 .next/analyze/);部署侧讲 standalone 自托管、instrumentation + OTel 与 after()"
            references={[
                { label: "Next.js 文档:Turbopack", href: "https://nextjs.org/docs/app/api-reference/turbopack" },
                { label: "Next.js 指南:Package Bundling(bundle-analyzer 与 experimental-analyze)", href: "https://nextjs.org/docs/app/guides/package-bundling" },
                { label: "Next.js 文档:output: standalone 自托管", href: "https://nextjs.org/docs/app/guides/self-hosting" },
                { label: "Next.js 文档:instrumentation + OpenTelemetry", href: "https://nextjs.org/docs/app/guides/open-telemetry" },
                { label: "Next.js 文档:after()", href: "https://nextjs.org/docs/app/api-reference/functions/after" },
            ]}
        >
            <TopicSection
                title="Turbopack:Next 16 的默认打包器"
                note="dev 与 build 都默认 Turbopack,不再是实验选项"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        <strong>事实</strong>:Next 16 起 next dev 与 next build 默认都跑
                        Turbopack(Rust 实现,增量编译);webpack 变成显式 opt-out
                        (--webpack 标志)
                    </li>
                    <li>
                        <strong>本站就在用</strong>:日常的 pnpm dev / pnpm build 全部是
                        Turbopack;唯一的例外是下方的 bundle 分析,因为 analyzer 是
                        webpack 插件
                    </li>
                    <li>
                        <strong>什么时候需要回退 webpack</strong>:依赖尚未迁移的 webpack
                        专属 loader/plugin(如本站实装的 @next/bundle-analyzer)、
                        或排查「疑似打包器差异」时做对照构建。回退是一次性的命令级选择,
                        不需要改配置
                    </li>
                    <li>
                        Turbopack 侧的配置(自定义 loader 规则、resolve 别名)写在
                        next.config.ts 的 turbopack 字段;webpack 函数与 turbopack
                        字段可以共存,按实际打包器各取所需
                    </li>
                </ul>
            </TopicSection>

            <TopicSection
                title="bundle 分析实装:pnpm analyze"
                note="测量先行:任何「优化包体」的动作之前,先让体积可见"
            >
                <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{ANALYZER_CODE}
                </pre>
                <pre className="mt-3 overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{BUILD_OUTPUT_CODE}
                </pre>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        报告落在 .next/analyze/ 下三份:client.html(浏览器包,
                        优化主战场)、nodejs.html(服务端运行时)、edge.html(边缘运行时,
                        本站 middleware 即在此列)
                    </li>
                    <li>
                        分析的是 webpack 构建产物,与 Turbopack 产物的分包细节会有出入;
                        Turbopack 原生的分析入口是 next experimental-analyze
                    </li>
                    <li>
                        看报告的次序:先 client.html 的 First Load 共享 chunk
                        (每页都付的成本),再按路由看独有 chunk;
                        「谁被谁引进来」比「谁最大」更常给出可执行的结论 ——
                        与 /engineering/asset-perf 的包体治理一节衔接
                    </li>
                </ul>
            </TopicSection>

            <TopicSection
                title="部署:output: standalone 自托管"
                note="讲解片段;本站刻意未开启 standalone"
            >
                <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{STANDALONE_CODE}
                </pre>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        <strong>为什么本站不开</strong>:本站是教学演示,直接用
                        next start(Vercel 部署同理)即可;standalone 的收益是
                        「自包含目录 + 最小 node_modules」,服务于 Docker 镜像体积与
                        离线部署 —— 演示站没有这两个约束,开了只增加构建产物噪音
                    </li>
                    <li>
                        <strong>什么时候需要它</strong>:自托管容器(Kubernetes/Docker)、
                        私有环境交付、对镜像层大小敏感的场景;官方
                        with-docker 示例的 Dockerfile 就是围绕 standalone 产物写的
                    </li>
                </ul>
            </TopicSection>

            <TopicSection
                title="可观测性:instrumentation + OTel,以及 after()"
                note="链路追踪回答「慢在哪」,after() 保证「记日志」本身不变慢"
            >
                <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{INSTRUMENTATION_CODE}
                </pre>
                <pre className="mt-3 overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{AFTER_CODE}
                </pre>
                <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    两者拼起来是完整的请求级观测:register() 在进程启动时挂好
                    OTel,渲染与取数自动产生 span;after() 把日志与指标上报挪到响应之后,
                    观测代码不再计入用户感知的延迟。after() 的执行模型
                    (响应发出后服务端仍保活跑完副作用)在
                    /data/dynamic-apis 专题有更细的展开。
                </p>
            </TopicSection>
        </TopicPage>
    );
}
