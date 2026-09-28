/**
 * ============================================================================
 * 缓存策略设计 — 工程化专题(决策表页)
 * ============================================================================
 *
 * 「一个页面该用什么缓存方案」不是背配置,而是回答三个问题:
 * 1. 数据归属:所有人共享,还是按会话/按人不同?
 * 2. 新鲜度要求:过期多久算事故?
 * 3. 变更触发方式:到期自动重取,还是由事件主动失效?
 *
 * 三个答案收敛到一行配置:revalidate / revalidateTag /
 * force-dynamic / "use cache"。机制细节在 /data/cache-layers,
 * 本页只讲决策。
 *
 * @module topics/engineering/caching-strategy
 */

import Link from "next/link";

import { TopicPage, TopicSection } from "@/components/topic/TopicPage";

/* =================================================================
 * 示意块
 * ================================================================ */

/** 决策流程 */
const DECISION_FLOW = `给一个页面定缓存方案,依次回答三问:

  ① 数据归属:内容对所有访客一样吗?
  │
  ├── 不一样(会话/个人数据)
  │     → 不进共享缓存:force-dynamic +  cookies()/headers() 取会话
  │       或干脆下沉为客户端取数(SWR,见 /data/client-fetching)
  │
  └── 一样(公共内容)
        │
        ② 新鲜度要求:数据过期多久算事故?
        │
        ├── 一秒都不行(行情、库存、计数器)
        │     → force-dynamic,每请求实时渲染;别用任何页面级缓存
        │
        ├── 分钟~小时级可接受(榜单、资讯流)
        │     → export const revalidate = <秒数>(时间驱动 ISR)
        │
        └── 几乎不变,但变了要立即生效(文档、商品详情)
              │
              ③ 变更触发方式:谁通知缓存失效?
              ├── 定时轮询就够 → 长周期 revalidate(如 86400)
              └── 内容系统/后台有 webhook → revalidateTag / revalidatePath
                    按需失效,平时永久静态(Next 16 亦可整段标 "use cache"
                    + cacheTag,见 /rendering/ppr)`;

/* =================================================================
 * 专题主体
 * ================================================================ */

export default function CachingStrategyTopic() {
    return (
        <TopicPage
            title="缓存策略设计"
            description="给一个页面定缓存方案的决策流程:数据归属 → 新鲜度要求 → 变更触发方式,落到 revalidate / revalidateTag / force-dynamic / use cache"
        >
            <TopicSection
                title="决策流程:三问收敛到一行配置"
                note="先定性,再定量;跳过第一问直接讨论 revalidate 多少秒,是缓存事故的主要来源"
            >
                <pre className="overflow-x-auto rounded-xl bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100 dark:bg-neutral-950">
{DECISION_FLOW}
                </pre>
            </TopicSection>

            <TopicSection
                title="三个场景卡:照流程走一遍"
                note="同样的问题清单,不同的答案组合出完全不同的配置"
            >
                <div className="grid gap-3 lg:grid-cols-3">
                    {/* 营销页 */}
                    <div className="rounded-xl border border-neutral-200/60 p-4 dark:border-neutral-800/60">
                        <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                            营销页 / 落地页
                        </p>
                        <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                            <li>① 归属:所有人一样 ✓</li>
                            <li>② 新鲜度:小时级可接受</li>
                            <li>③ 触发:发布频率低,定时即可</li>
                        </ul>
                        <p className="mt-3 rounded-lg bg-neutral-100 px-2 py-1.5 font-mono text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                            export const revalidate = 3600
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                            长 ISR:构建后整页静态进 CDN,过期后后台再生;
                            流量越大越划算,首字节成本趋近于零
                        </p>
                    </div>

                    {/* 仪表盘 */}
                    <div className="rounded-xl border border-neutral-200/60 p-4 dark:border-neutral-800/60">
                        <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                            仪表盘 / 监控页
                        </p>
                        <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                            <li>① 归属:按登录人不同 ✗</li>
                            <li>② 新鲜度:秒级</li>
                            <li>③ 触发:持续变化,无所谓失效</li>
                        </ul>
                        <p className="mt-3 rounded-lg bg-neutral-100 px-2 py-1.5 font-mono text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                            export const dynamic = &quot;force-dynamic&quot;
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                            首屏 SSR 出骨架与基础数据,高频指标下沉客户端轮询
                            (SWR refreshInterval);页面级缓存在这里只制造脏数据
                        </p>
                    </div>

                    {/* 内容站 */}
                    <div className="rounded-xl border border-neutral-200/60 p-4 dark:border-neutral-800/60">
                        <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                            内容站 / 商品详情
                        </p>
                        <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                            <li>① 归属:所有人一样 ✓</li>
                            <li>② 新鲜度:平时无所谓,改稿须立即生效</li>
                            <li>③ 触发:CMS 有发布 webhook</li>
                        </ul>
                        <p className="mt-3 rounded-lg bg-neutral-100 px-2 py-1.5 font-mono text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                            revalidateTag(&quot;post-123&quot;)
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                            平时永久静态(ISR 不设时限);CMS webhook 调 Route Handler,
                            按 tag 精准失效 —— 既有静态的成本,又有按需的新鲜度
                        </p>
                    </div>
                </div>
            </TopicSection>

            <TopicSection
                title="决策要点:什么时候别上缓存方案"
                note="缓存是默认项之外的优化,不是每个页面都配拥有策略"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        <strong>拿不准就先动态</strong>:force-dynamic 是安全的默认值,
                        缓存策略要在想清楚「脏了谁受影响」之后再引入;先缓存后排查,
                        比先动态后优化痛苦得多
                    </li>
                    <li>
                        <strong>低流量页面别精心调参</strong>:一天几十次访问的后台页,
                        ISR/tag 体系带来的运维复杂度超过省下的渲染成本
                    </li>
                    <li>
                        <strong>别让标签体系失控</strong>:revalidateTag 的威力来自
                        精准的标签设计;标签命名没有规范(谁打、打几个、什么粒度)时,
                        按需失效很快退化成 revalidatePath(&quot;/&quot;) 式的全站轰炸
                    </li>
                    <li>
                        机制底座(四层缓存各自的失效方式与排查顺序)见
                        <Link
                            href="/data/cache-layers"
                            className="mx-1 text-slate-600 underline underline-offset-2 hover:text-slate-500 dark:text-slate-400"
                        >
                            四层缓存对照台
                        </Link>
                        ;本页是它的「选型上游」
                    </li>
                </ul>
            </TopicSection>
        </TopicPage>
    );
}
