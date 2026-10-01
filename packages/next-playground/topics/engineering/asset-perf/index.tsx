/**
 * ============================================================================
 * Image/Font 与包体治理 — 工程化专题
 * ============================================================================
 *
 * 资产性能的三条主线:
 * 1. 图片:next/image 自动做尺寸、懒加载与格式协商
 * 2. 字体:next/font 自托管 + 零 CLS
 * 3. 包体:动态 import() 与客户端边界下沉
 *
 * 本站的 <img> 用法(components/UserCard.tsx 等)是有意保留的
 * 反面教材:lint 的 @next/next/no-img-element warning 可证。
 *
 * @module topics/engineering/asset-perf
 */

import Link from "next/link";

import { TopicPage, TopicSection } from "@/components/topic/TopicPage";

/* =================================================================
 * 代码对照块
 * ================================================================ */

/** <img> vs <Image> 对照(前者摘自本站真实代码) */
const IMG_COMPARE_CODE = `// ❌ components/UserCard.tsx —— 本站有意保留的反面教材
//    (pnpm lint 会报 @next/next/no-img-element warning)
<img
    src={user.avatar}
    alt={user.name}
    className="h-16 w-16 rounded-full object-cover"
/>
// 问题:原图多大就下载多大;没有懒加载(除非手写 loading="lazy");
//       没有格式协商(Avif/WebP);尺寸不固定时还会造成布局跳动

// ✅ 改成 next/image 之后
import Image from "next/image";

<Image
    src={user.avatar}
    alt={user.name}
    width={64}                 // 显式尺寸 → 布局稳定,CLS 归零
    height={64}
    className="rounded-full object-cover"
/>
// 获得:按需生成多尺寸(srcset)、视口外默认懒加载、
//       按 Accept 头自动协商 Avif/WebP、优化结果带缓存
// 注意:远程域名要进 next.config.ts 的 images.remotePatterns
//       (本站已为 images.unsplash.com 配置)`;

/** next/font 自托管 */
const FONT_CODE = `// app/layout.tsx —— 本站正在用的三套 next/font
import { IBM_Plex_Mono, Source_Sans_3, Syne } from "next/font/google";

const display = Syne({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-syne" });
const sans = Source_Sans_3({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-source" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex" });

// variable 把家族名写进 CSS 变量,中文继续落到苹方 / 思源
<html className={\`\${display.variable} \${sans.variable} \${mono.variable}\`}>

// 三个收益:
// 1. 自托管:字体随站点产物分发,不再依赖第三方字体 CDN 的额外连接
// 2. 零 CLS:构建期量好字体尺寸,自动生成 size-adjust 兜底字体,
//    字体加载完成前后布局不跳
// 3. 无外链请求:比 <link href="fonts.googleapis.com"> 少一轮 DNS+连接`;

/** 包体治理 */
const BUNDLE_CODE = `// ① 动态 import():重组件/低频路径拆出首屏 bundle
import dynamic from "next/dynamic";

const HeavyChart = dynamic(() => import("./HeavyChart"), {
    loading: () => <div className="h-64 animate-pulse rounded-xl bg-neutral-100" />,
});
// 只有真正渲染到这里时才下载对应 chunk

// ② 客户端边界下沉:别为一颗按钮整页 "use client"
//    页面外壳/数据/静态内容留在 Server Component,
//    交互叶子单独成 Client 组件 —— 系统性做法见 /rsc-boundary/guide

// ③ 测量先行:@next/bundle-analyzer 类工具看 chunk 构成,
//    先找到最大的 20% 再动手,而不是凭感觉拆包`;

/* =================================================================
 * 专题主体
 * ================================================================ */

export default function AssetPerfTopic() {
    return (
        <TopicPage
            path="/engineering/asset-perf"
            title="Image/Font 与包体治理"
            description="next/image 的尺寸/懒加载/格式协商、next/font 的自托管零 CLS,以及动态 import 与客户端边界下沉的包体治理"
            references={[
                { label: "Next.js 文档:<Image> 组件", href: "https://nextjs.org/docs/app/api-reference/components/image" },
                { label: "Next.js 文档:next/font", href: "https://nextjs.org/docs/app/api-reference/components/font" },
                { label: "Next.js 文档:Lazy Loading 指南", href: "https://nextjs.org/docs/app/guides/lazy-loading" },
            ]}
        >
            <TopicSection
                title="图片:本站的 <img> 是反面教材(lint 可证)"
                note="next/image 不是「更好看的 img」,而是把优化决策从人肉挪到构建管线"
            >
                <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{IMG_COMPARE_CODE}
                </pre>
                <p className="mt-3 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    运行
                    <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">
                        pnpm -C packages/next-playground lint
                    </code>
                    可以看到 components/UserCard.tsx 的
                    no-img-element warning —— 这是有意保留的对照。
                    动态路由详情页的头像已经换成 next/image,当作改完之后的样子。
                </p>
            </TopicSection>

            <TopicSection
                title="字体:next/font 自托管 + 零 CLS"
                note="字体是布局跳动的常客;next/font 把「加载中用什么兜底」变成构建期计算"
            >
                <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{FONT_CODE}
                </pre>
            </TopicSection>

            <TopicSection
                title="包体治理:动态 import 与边界下沉"
                note="首屏 JS 体积的两个最大来源:低频重组件、画得太高的 Client 边界"
            >
                <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{BUNDLE_CODE}
                </pre>
                <p className="mt-3 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    边界下沉的完整论证(为什么每条 &quot;use client&quot; 都是 bundle 切点)见
                    <Link
                        href="/rsc-boundary/guide"
                        className="mx-1 text-slate-600 underline underline-offset-2 hover:text-slate-500 dark:text-slate-400"
                    >
                        RSC 心智模型
                    </Link>
                    ;@next/bundle-analyzer 这类工具本页只提及不安装 —— 需要测量时再引入。
                </p>
            </TopicSection>

            <TopicSection
                title="什么时候别优化"
                note="决策要点:优化要有指标依据,没有指标的优化是自我感动"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        <strong>内部工具与低频路径</strong>:一天几十次访问的后台页,
                        next/image 的构建期处理与动态 import 的拆分复杂度,
                        都可能超过用户能感知到的收益
                    </li>
                    <li>
                        <strong>先测量再动手</strong>:用 Lighthouse / Web Vitals 定位到
                        具体指标(LCP、CLS、INP)与具体资产,再选对应的优化;
                        「听说 next/image 好所以全站替换」不是策略
                    </li>
                    <li>
                        <strong>保留对照的价值</strong>:本站故意留着 <code className="rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">&lt;img&gt;</code> 警告,
                        是为了让 lint 输出成为教学素材 —— 这也是「什么时候别优化」的一种答案:
                        当「不优化」本身有教学或调试价值时
                    </li>
                </ul>
            </TopicSection>
        </TopicPage>
    );
}
