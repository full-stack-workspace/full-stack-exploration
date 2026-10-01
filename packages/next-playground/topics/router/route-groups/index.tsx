/**
 * ============================================================================
 * 路由组与多根布局 — 路由机制专题
 * ============================================================================
 *
 * 讲清三件事:
 * 1. (folder) 路由组:组织路由而不影响 URL;
 * 2. 组级 layout:外壳按组圈定,而不是按 URL 段圈定;
 * 3. 多根布局:每个顶层组各带一份 <html>/<body> 的 root layout,
 *    营销站与应用壳共存于同一仓库。这一层本站不做活演示(会拆散全站单壳),
 *    用代码块讲清并说明原因。
 *
 * 活演示在 app/router/route-groups/(demo)/:组名不进 URL,
 * 组级 layout 用虚线描边可视化。
 *
 * @module topics/router/route-groups
 */

import Link from "next/link";

import { TopicPage, TopicSection } from "@/components/topic/TopicPage";

/* =================================================================
 * 代码对照块
 * ================================================================ */

/** 本专题的真实目录结构(节选) */
const TREE_SNIPPET = `app/router/route-groups/
├── page.tsx                ← 本专题页,URL /router/route-groups
└── (demo)/                 ← 路由组:圆括号目录名不进 URL
    ├── layout.tsx          ← 组级布局,只包组内页面
    ├── alpha/page.tsx      ← URL /router/route-groups/alpha(没有 demo 段)
    └── beta/page.tsx       ← URL /router/route-groups/beta`;

/** 多根布局的目录形状:两个顶层组,各自一份带 html/body 的 root layout */
const MULTI_ROOT_SNIPPET = `app/
├── (marketing)/            ← 营销站组
│   ├── layout.tsx          ← 自己的 root layout:含 <html>/<body>
│   │                          (大字排版、无侧边栏、带营销页脚)
│   ├── page.tsx            ← /
│   └── pricing/page.tsx    ← /pricing
└── (app)/                  ← 应用组
    ├── layout.tsx          ← 另一份 root layout:同样含 <html>/<body>
    │                          (深色壳、工作台侧边栏、数据预取)
    ├── dashboard/page.tsx  ← /dashboard
    └── settings/page.tsx   ← /settings

要点:
- 此时 app/ 下不能再有 layout.tsx —— 根布局的职责下移到了各组
- (marketing) 与 (app) 互不占 URL 段:/ 和 /dashboard 平级共存
- 两组之间导航是整页加载(根布局被换掉),组内导航才是 SPA 过渡
- 不能有两个组同时声明同一条路径(如都想出 /),构建期直接冲突报错`;

/* =================================================================
 * 专题主体
 * ================================================================ */

export default function RouteGroupsTopic() {
    return (
        <TopicPage
            path="/router/route-groups"
            title="路由组与多根布局"
            description="(folder) 组织路由却不占 URL 段:组级 layout 按组圈定外壳,多根布局让营销站与应用壳在同一仓库共存;本页附带一个真实路由组活演示"
            references={[
                { label: "Next.js 文档:Route Groups", href: "https://nextjs.org/docs/app/api-reference/file-conventions/route-groups" },
                { label: "Next.js 文档:Layouts(多根布局)", href: "https://nextjs.org/docs/app/getting-started/layouts-and-pages" },
            ]}
        >
            <TopicSection
                title="活演示:(demo) 组名不进 URL"
                note="点进 alpha / beta:地址栏里没有 demo;虚线框是组级 layout,组内导航时它保持挂载"
            >
                <div className="flex flex-wrap gap-3">
                    <Link
                        href="/router/route-groups/alpha"
                        className="inline-flex rounded-md border border-rule px-3.5 py-2 text-sm font-medium text-ink hover:border-signal-500 dark:border-neutral-700 dark:text-neutral-100"
                    >
                        打开 /router/route-groups/alpha
                    </Link>
                    <Link
                        href="/router/route-groups/beta"
                        className="inline-flex rounded-md border border-rule px-3.5 py-2 text-sm font-medium text-ink hover:border-signal-500 dark:border-neutral-700 dark:text-neutral-100"
                    >
                        打开 /router/route-groups/beta
                    </Link>
                </div>
                <pre className="mt-4 overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{TREE_SNIPPET}
                </pre>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        圆括号目录是纯组织手段:它把「文件放在哪」与「URL 长什么样」解耦,
                        解决的是路由目录越长越乱的问题,不产生任何新路径
                    </li>
                    <li>
                        组级 layout 按组圈定作用范围:alpha / beta 共享
                        <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">
                            (demo)/layout.tsx
                        </code>
                        的虚线外壳,而本专题页(组的同级)不受它影响
                    </li>
                    <li>
                        组内导航与普通嵌套路由同规则:layout 保持挂载,只有 page 段被替换 ——
                        在 alpha / beta 间往返即可观察到虚线框不重渲染
                    </li>
                </ul>
            </TopicSection>

            <TopicSection
                title="多根布局:一个仓库,两套 html/body"
                note="本站不做活演示的原因:多根布局要求 app/ 下没有总根 layout,会直接拆散本站的全站单壳"
            >
                <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    当顶层路由组各自放一份包含
                    <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">
                        &lt;html&gt;/&lt;body&gt;
                    </code>
                    的 layout.tsx 时,就得到了多根布局:同一应用里并存两套互不共享的页面骨架。
                    典型场景是营销站(轻快、无壳)与登录后的工作台(重壳、常驻导航)长在同一仓库。
                </p>
                <pre className="mt-4 overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{MULTI_ROOT_SNIPPET}
                </pre>
                <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <strong>为什么本站只用代码块讲它:</strong>
                    本站所有页面共享一个根 layout + SiteShell(单壳端点,见下节)。
                    真要演示多根布局,就得删掉
                    <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">
                        app/layout.tsx
                    </code>
                    并把全站页面迁进组里 —— 为了演示一个模式而拆散全站壳层,代价远大于收益,
                    这里选择把决策条件讲透,而不是硬演。
                </p>
            </TopicSection>

            <TopicSection
                title="对照本站:单壳端点"
                note="单壳不是缺陷,是多数站点的正确默认"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        本站结构是
                        <code className="mx-1 rounded bg-neutral-100 px-1 py-0.5 text-xs dark:bg-neutral-800">
                            app/layout.tsx(根)+ SiteShell(顶栏/侧边栏)
                        </code>
                        包一切:任何导航都是 SPA 过渡,壳层永不卸载 —— 这正是
                        <Link
                            href="/rendering/view-transition"
                            className="mx-1 text-sky-600 underline underline-offset-2 hover:text-sky-500 dark:text-sky-400"
                        >
                            页面转场
                        </Link>
                        能全站丝滑的前提
                    </li>
                    <li>
                        单壳的推论:所有页面共享同一套字体、主题脚本与导航状态;
                        任何「这页不想要壳」的需求(打印页、嵌入页)才需要考虑多根布局或组级取舍
                    </li>
                    <li>
                        组级 layout 在单壳内依然有用:本页的 (demo) 组就是例子 ——
                        不新增 URL 层级,就给一小撮页面加了一段共享外壳
                    </li>
                </ul>
            </TopicSection>

            <TopicSection
                title="什么时候别用"
                note="决策要点:路由组是组织工具,不是功能开关"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        <strong>别为「目录好看」提前建组</strong>:三五个页面的扁平目录不需要组;
                        组的价值在规模上来之后(按团队/按壳层切分),提前分组只会多一层心智负担
                    </li>
                    <li>
                        <strong>别指望组隔离数据或权限</strong>:路由组是纯文件系统约定,
                        不做任何运行时隔离;权限边界要靠服务端校验(见
                        <Link
                            href="/router/errors"
                            className="mx-1 text-sky-600 underline underline-offset-2 hover:text-sky-500 dark:text-sky-400"
                        >
                            错误与未找到
                        </Link>
                        的 unauthorized/forbidden),不靠目录形状
                    </li>
                    <li>
                        <strong>多根布局别用在「只是风格不同」的页面上</strong>:
                        跨根导航是整页加载(丢 SPA 过渡、丢客户端状态),只有两套骨架真的互不共享
                        (营销站 vs 应用壳)时才值得;换个配色、换个页头用组级 layout 就够
                    </li>
                    <li>
                        <strong>同名冲突要当心</strong>:不同组解析出同一路径(如两个组都有 page.tsx 出 /)
                        会在构建期报错;路径唯一性的责任从目录深度转移到了你自己
                    </li>
                </ul>
            </TopicSection>
        </TopicPage>
    );
}
