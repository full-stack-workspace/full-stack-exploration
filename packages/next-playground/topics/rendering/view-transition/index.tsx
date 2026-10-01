/**
 * ============================================================================
 * 页面转场 ViewTransition — 渲染策略专题(补讲已实装特性)
 * ============================================================================
 *
 * 本站早就「做了没讲」:next.config.ts 开了 experimental.viewTransition,
 * 每个专题页都被 DirectionalTransition 的 <ViewTransition> 包裹,
 * 顶栏/首页卡片的 Link 带着 transitionTypes 在跑方向感知转场。
 * 本页把这条已实装的链路讲透,并附一对可互跳的场景页作活演示。
 *
 * @module topics/rendering/view-transition
 */

import Link from "next/link";

import { TopicPage, TopicSection } from "@/components/topic/TopicPage";

/* =================================================================
 * 代码对照块(均为本站真实代码的节选)
 * ================================================================ */

/** 全站转场的三处真实接线 */
const WIRING_SNIPPET = `// ① next.config.ts —— Next 16 把 <ViewTransition> 接进路由导航
const nextConfig: NextConfig = {
  experimental: { viewTransition: true },
};

// ② components/topic/DirectionalTransition.tsx —— 每个专题页的最外层
//    enter/exit 把 transition type 映射成 CSS 类;无类型时 none,不白动
<ViewTransition
  enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
  exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
  default="none"
>
  {children}
</ViewTransition>

// ③ Link 上声明方向(components/shell/SiteShell.tsx 等)
<Link href="/" transitionTypes={["nav-back"]}>…</Link>        // 回首页:向右滑
<Link href={topic.path} transitionTypes={["nav-forward"]}>…</Link> // 进专题:向左滑`;

/** globals.css 配方节选:transition type → 类名 → 伪元素动画 */
const CSS_SNIPPET = `/* app/globals.css —— View Transition 配方(节选,本站真实样式) */
::view-transition-old(.nav-forward) {
  --slide-offset: -60px;   /* 旧页向左滑出 */
  animation: var(--duration-exit) ease-in both fade reverse,
             var(--duration-move) ease-in-out both slide reverse;
}
::view-transition-new(.nav-forward) {
  --slide-offset: 60px;    /* 新页从右滑入 */
  animation: var(--duration-enter) ease-out var(--duration-exit) both fade,
             var(--duration-move) ease-in-out both slide;
}

/* 顶栏有 backdrop-blur,旧快照会闪 —— 直接不给它拍快照 */
::view-transition-old(site-header) { display: none; }

/* reduced-motion 时全部归零:转场立刻完成,不播动画 */
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(*),
  ::view-transition-new(*) { animation-duration: 0s !important; }
}`;

/** 底层等价物:浏览器原生 View Transition API */
const PLATFORM_SNIPPET = `// React 的 <ViewTransition> 编译到底层,等价于这段原生 API:
document.startViewTransition(async () => {
    // ① 浏览器给旧画面拍快照(生成 ::view-transition-old 伪元素)
    await flushDomUpdate();              // ② React 在此提交 DOM 变更
    // ③ 浏览器给新画面拍快照(::view-transition-new),然后交叉动画两张快照
});
// transition type(nav-forward 等)会挂到 :active-view-transition-type() 上,
// React 把它简化成了 enter/exit 的对象查表 —— 你写 CSS 类名,不写伪元素回调`;

/* =================================================================
 * 专题主体
 * ================================================================ */

export default function ViewTransitionTopic() {
    return (
        <TopicPage
            path="/rendering/view-transition"
            title="页面转场 ViewTransition"
            description="React 19.2 的 <ViewTransition> 经 Next 16 experimental.viewTransition 接进路由导航;本站顶栏与每个专题页已在真实使用方向感知转场 —— 本页把这条已实装的链路讲透"
            references={[
                { label: "React 文档:<ViewTransition>", href: "https://react.dev/reference/react/ViewTransition" },
                { label: "Next.js 文档:viewTransition(实验开关)", href: "https://nextjs.org/docs/app/api-reference/config/next-config-js/viewTransition" },
                { label: "MDN:View Transition API", href: "https://developer.mozilla.org/zh-CN/docs/Web/API/View_Transition_API" },
            ]}
        >
            <TopicSection
                title="活演示:两个场景互跳,看方向滑动"
                note="需要支持 View Transition 的浏览器(Chrome/Edge 111+、Safari 18+);不支持时静默退化为普通跳转,不会报错"
            >
                <div className="flex flex-wrap gap-3">
                    <Link
                        href="/rendering/view-transition/scenes/a"
                        transitionTypes={["nav-forward"]}
                        className="inline-flex rounded-md border border-rule px-3.5 py-2 text-sm font-medium text-ink hover:border-signal-500 dark:border-neutral-700 dark:text-neutral-100"
                    >
                        进入场景 A(nav-forward)
                    </Link>
                    <Link
                        href="/rendering/view-transition/scenes/b"
                        transitionTypes={["nav-forward"]}
                        className="inline-flex rounded-md border border-rule px-3.5 py-2 text-sm font-medium text-ink hover:border-signal-500 dark:border-neutral-700 dark:text-neutral-100"
                    >
                        进入场景 B(nav-forward)
                    </Link>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    两个场景页被
                    <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">
                        scenes/layout.tsx
                    </code>
                    里的一层
                    <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">
                        &lt;ViewTransition&gt;
                    </code>
                    包住;A → B 向左滑(nav-forward),B → A 向右滑(nav-back)。
                    方向信息只存在于 Link 的
                    <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">
                        transitionTypes
                    </code>
                    上,动画类名由 enter/exit 查表得出 —— 同一对边界,两种方向。
                </p>
            </TopicSection>

            <TopicSection
                title="本站的三处真实接线"
                note="这就是你每次从首页点进专题时看到的那次滑动"
            >
                <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{WIRING_SNIPPET}
                </pre>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        <strong>Next 的开关只负责「接进导航」</strong>:
                        <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">
                            experimental.viewTransition
                        </code>
                        让 Link 客户端导航触发浏览器 View Transition,并把 transitionTypes
                        传给 React;动画本身全部来自 React 组件与你的 CSS
                    </li>
                    <li>
                        <strong>DirectionalTransition 的位置是刻意的</strong>:包在 TopicPage
                        最外层(内容区),不包 layout —— 否则顶栏/侧边栏也会被拍进快照,
                        页级 enter/exit 反被吃掉
                    </li>
                    <li>
                        <strong>默认不动</strong>:enter/exit 的 default 都是 none,
                        没有声明 transitionTypes 的导航(如程序化 push)不播动画 —— 转场是显式 opt-in
                    </li>
                </ul>
            </TopicSection>

            <TopicSection
                title="底层:浏览器 View Transition API"
                note="不是 JS 逐帧动画,是浏览器对两张快照做交叉过渡"
            >
                <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{PLATFORM_SNIPPET}
                </pre>
                <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    React 19.2 的贡献是把「拍快照的时机」接进了渲染管线:Suspense 就绪、
                    转场内的 DOM 提交都发生在两张快照之间。所以
                    <strong>与 Suspense 的关系</strong>是:转场等新内容准备好才播,
                    慢数据不会播出一个半成品画面 —— 快照拍的是「提交前」与「提交后」两个稳定态。
                </p>
                <pre className="mt-4 overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{CSS_SNIPPET}
                </pre>
            </TopicSection>

            <TopicSection
                title="什么时候别用"
                note="转场是调味品:内容跳变才是体验的主体"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        <strong>reduced-motion 用户</strong>:必须给
                        <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">
                            prefers-reduced-motion
                        </code>
                        兜底(本站 globals.css 已把动画时长归零)。前庭敏感人群对滑动的忍耐度远低于你
                    </li>
                    <li>
                        <strong>低端设备与大快照</strong>:快照是整棵子树的位图,页面越大、
                        滤镜/backdrop-blur 越多,拍快照越贵;掉帧的转场不如不转
                        (本站顶栏的 backdrop-blur 就用 display:none 排除出快照)
                    </li>
                    <li>
                        <strong>内容跳跃感</strong>:新旧页面布局差异巨大(列表 → 全屏详情)
                        时,交叉淡化会暴露错位;要么用共享元素过渡(同名 viewTransitionName),
                        要么干脆不动
                    </li>
                    <li>
                        <strong>别全站默认开</strong>:给每次导航都播动画,等于把「转场」
                        贬值成噪音;本站 default 为 none,只有声明了方向的导航才动
                    </li>
                </ul>
            </TopicSection>
        </TopicPage>
    );
}
