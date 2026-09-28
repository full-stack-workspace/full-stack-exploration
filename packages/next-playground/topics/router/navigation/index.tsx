/**
 * ============================================================================
 * 导航与 Router Cache — 路由机制专题
 * ============================================================================
 *
 * 客户端导航的两套 API(Link 声明式 / useRouter 命令式)与它们背后
 * 共同的加速器:prefetch + Router Cache。
 *
 * 本页回答三件事:
 * - Link 的 prefetch 默认做了什么(prod 下视口内自动预取)
 * - useRouter 的 push / replace / back / refresh 各自改什么
 * - 「页面为什么不刷新」的排查入口(Router Cache)
 *
 * @module topics/router/navigation
 */

import Link from "next/link";

import { TopicPage, TopicSection } from "@/components/topic/TopicPage";

import { NavigationPlayground } from "./components/NavigationPlayground";

/* =================================================================
 * 专题主体
 * ================================================================ */

export default function NavigationTopic() {
    return (
        <TopicPage
            title="导航与 Router Cache"
            description="Link 的 prefetch 默认行为、useRouter 的 push/replace/back/refresh,以及「为什么页面不刷新」的排查入口"
        >
            <TopicSection
                title="Link 的 prefetch:默认就在偷偷干活"
                note="只在生产构建生效;dev 下每次点击都是完整请求"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        <strong>静态路由</strong>:生产构建下,Link 进入视口即预取整个路由的
                        RSC 载荷并存入 Router Cache —— 用户点击时「秒开」的来源
                    </li>
                    <li>
                        <strong>动态路由</strong>(运行时渲染的页面):只预取到最近的
                        loading.tsx 边界为止,即「骨架 + 静态壳」;
                        动态部分仍在点击后向服务器请求。这是设计而非缺陷:
                        预取一份注定过期的新鲜数据是浪费,预取壳则几乎免费
                    </li>
                    <li>
                        推论:想要整页预取,就把页面静态化;动态页的「点击后转圈」
                        不是 prefetch 失效,是它本来就只承诺预取到 loading 边界
                    </li>
                </ul>
            </TopicSection>

            <TopicSection
                title="useRouter:四个动词各改什么"
                note="来自 next/navigation;只改 URL 与历史栈,不触发整页刷新"
            >
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left text-xs leading-relaxed">
                        <thead>
                            <tr className="border-b border-neutral-200 text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                                <th className="py-2 pr-4 font-semibold">方法</th>
                                <th className="py-2 pr-4 font-semibold">做什么</th>
                                <th className="py-2 font-semibold">典型场景</th>
                            </tr>
                        </thead>
                        <tbody className="text-neutral-600 dark:text-neutral-400">
                            <tr className="border-b border-neutral-100 dark:border-neutral-800">
                                <td className="py-2 pr-4 font-medium text-neutral-800 dark:text-neutral-100">push</td>
                                <td className="py-2 pr-4">导航并新增一条历史记录</td>
                                <td className="py-2">常规跳转,用户可用 back 退回</td>
                            </tr>
                            <tr className="border-b border-neutral-100 dark:border-neutral-800">
                                <td className="py-2 pr-4 font-medium text-neutral-800 dark:text-neutral-100">replace</td>
                                <td className="py-2 pr-4">导航并替换当前历史记录</td>
                                <td className="py-2">登录后跳回、结算完成页 —— 不希望 back 回到中间态</td>
                            </tr>
                            <tr className="border-b border-neutral-100 dark:border-neutral-800">
                                <td className="py-2 pr-4 font-medium text-neutral-800 dark:text-neutral-100">back / forward</td>
                                <td className="py-2 pr-4">沿历史栈前进后退</td>
                                <td className="py-2">自绘「返回」按钮;命中 Router Cache 时零请求</td>
                            </tr>
                            <tr>
                                <td className="py-2 pr-4 font-medium text-neutral-800 dark:text-neutral-100">refresh</td>
                                <td className="py-2 pr-4">丢弃当前路由的 Router Cache,重新向服务器取 RSC 载荷</td>
                                <td className="py-2">数据变了但 URL 没变时的「强制重取」旋钮</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </TopicSection>

            <TopicSection
                title="动手演练(可运行)"
                note="push / replace / back / refresh 与 prefetch 对照,均在下方真实执行"
            >
                <NavigationPlayground />
            </TopicSection>

            <TopicSection
                title="「为什么页面不刷新」:先怀疑 Router Cache"
                note="导航快是因为缓存在替你做主;觉得「脏」也是同一份缓存在做主"
            >
                <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    客户端导航命中 Router Cache 时,根本不会发请求,自然不会「刷新」。
                    这一层的生命周期、失效方式与四层缓存全景,在
                    <Link
                        href="/data/cache-layers"
                        className="mx-1 text-sky-600 underline underline-offset-2 hover:text-sky-500 dark:text-sky-400"
                    >
                        四层缓存对照台
                    </Link>
                    的「④ Router Cache」一节有完整对照与可运行演示;排查顺序
                    (先退客户端缓存,再查 Full Route Cache,最后查 Data Cache)也在该页。
                </p>
            </TopicSection>

            <TopicSection
                title="什么时候别用 prefetch"
                note="预取省的是延迟,花的是服务器与用户的流量"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    <li>
                        <strong>大数据量详情页</strong>:列表里几十个 Link 每个都预取,
                        等于用户没点就替他下载了几十个页面 —— 用 prefetch={false} 或 hover 时再预取
                    </li>
                    <li>
                        <strong>低频页面</strong>:设置、帮助这类 99% 的会话不会进入的路由,
                        预取是纯浪费
                    </li>
                    <li>
                        <strong>按流量计费的 API</strong>:预取会真实触发取数
                        (动态段至少触发到 loading 边界,静态页则是整份载荷),
                        后端按调用计费时要把这个放大系数算进成本
                    </li>
                    <li>
                        决策要点:prefetch 是「赌用户会点」的投机加载;
                        点击率越低、单页越贵,越应该关掉它
                    </li>
                </ul>
            </TopicSection>
        </TopicPage>
    );
}
