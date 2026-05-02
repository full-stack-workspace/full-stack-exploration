/**
 * ============================================================================
 * About Page (关于我们页面)
 * ============================================================================
 *
 * 展示公司/团队信息的页面。
 *
 * 页面结构：
 * 1. Hero Section - 公司愿景和行动按钮
 * 2. Story Section - 公司故事和成就数据
 * 3. Values Section - 核心价值观展示
 * 4. Team Section - 团队成员展示
 * 5. CTA Section - 行动召唤区块
 *
 * @module about/page
 */

import Image from "next/image";
import Link from "next/link";
import { aboutPageData } from "@/data/about";
import ValueCard from "@/components/ValueCard";
import TeamMemberCard from "@/components/TeamMemberCard";

export default function AboutPage() {
    const { stats, values, team } = aboutPageData;

    return (
        <div className="flex flex-col">
            <section className="relative overflow-hidden bg-gradient-to-b from-neutral-50 to-white py-20 sm:py-32 dark:from-neutral-900 dark:to-neutral-950">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-secondary-100/30 via-primary-100/20 to-transparent rounded-full blur-3xl dark:from-secondary-900/20 dark:via-primary-900/10 dark:to-transparent" />
                </div>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-3xl text-center">
                        <h1 className="animate-slide-up text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl mb-6 dark:text-neutral-50">
                            关于我们
                        </h1>
                        <p className="animate-slide-up stagger-1 text-lg text-neutral-600 sm:text-xl dark:text-neutral-400 mb-8">
                            我们是一支充满激情的团队，致力于构建卓越的数字产品。
                            从概念到实现，我们与客户紧密合作，创造有影响力的解决方案。
                        </p>
                        <div className="animate-slide-up stagger-2 flex justify-center gap-4">
                            <Link
                                href="/blog"
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary-600 px-8 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition-all duration-200 hover:bg-primary-700 hover:shadow-xl hover:-translate-y-0.5 dark:bg-primary-500 dark:hover:bg-primary-600"
                            >
                                浏览博客
                            </Link>
                            <Link
                                href="/user"
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-8 text-sm font-semibold text-neutral-700 shadow-sm transition-all duration-200 hover:bg-neutral-50 hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                            >
                                联系团队
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-white py-20 dark:bg-neutral-950">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-12 lg:grid-cols-2 items-center">
                        <div className="relative">
                            <div className="aspect-w-16 aspect-h-10 rounded-2xl overflow-hidden shadow-2xl shadow-neutral-500/20 dark:shadow-neutral-950/50">
                                <Image
                                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                    alt="团队协作"
                                    className="object-cover w-full h-full"
                                    width={800}
                                    height={500}
                                />
                            </div>
                            <div className="absolute -bottom-6 -right-6 bg-gradient-to-br from-primary-500 to-primary-700 text-white p-6 rounded-2xl shadow-xl hidden sm:block dark:bg-primary-600">
                                <p className="text-4xl font-bold">10+</p>
                                <p className="text-sm opacity-90">年行业经验</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <p className="text-primary-600 font-semibold text-sm uppercase tracking-wide mb-2 dark:text-primary-400">
                                    我们的故事
                                </p>
                                <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 leading-tight dark:text-neutral-50">
                                    构建有意义的数字体验
                                </h2>
                            </div>
                            <p className="text-neutral-600 text-lg leading-relaxed dark:text-neutral-400">
                                自成立以来，我们始终坚持以客户为中心，以技术为驱动。通过整合创新设计与卓越工程，我们帮助数百家企业实现了数字化转型，创造了对用户真正有价值的产品。
                            </p>
                            <p className="text-neutral-600 leading-relaxed dark:text-neutral-400">
                                我们相信，优秀的产品源于对细节的极致追求。从用户研究到视觉设计，从技术架构到开发实现，每一个环节我们都倾注全力，只为交付超出期望的成果。
                            </p>
                            <div className="grid grid-cols-2 gap-6 pt-4">
                                {stats.map((stat) => (
                                    <div key={stat.label}>
                                        <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{stat.value}</p>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-500">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-neutral-50 py-20 dark:bg-neutral-900">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <p className="text-primary-600 font-semibold text-sm uppercase tracking-wide mb-2 dark:text-primary-400">
                            核心价值
                        </p>
                        <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-50 mb-4">
                            我们坚持的原则
                        </h2>
                        <p className="max-w-2xl mx-auto text-neutral-600 dark:text-neutral-400">
                            这些价值观指导着我们的每一个决策和行动
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {values.map((value, index) => (
                            <ValueCard
                                key={value.id}
                                value={value}
                                animationDelay={index * 100}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-white py-20 dark:bg-neutral-950">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <p className="text-primary-600 font-semibold text-sm uppercase tracking-wide mb-2 dark:text-primary-400">
                            团队成员
                        </p>
                        <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-50 mb-4">
                            背后的大脑
                        </h2>
                        <p className="max-w-2xl mx-auto text-neutral-600 dark:text-neutral-400">
                            认识一下让这一切成为可能的优秀人才
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {team.map((member, index) => (
                            <TeamMemberCard
                                key={member.name}
                                member={member}
                                animationDelay={index * 100}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-gradient-to-r from-primary-600 to-secondary-600 py-20 dark:from-primary-700 dark:to-secondary-700">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                        准备好开始你的项目了吗？
                    </h2>
                    <p className="max-w-2xl mx-auto text-primary-100 text-lg mb-8">
                        无论你有何种想法或需求，我们都非常乐意帮助你实现。
                        让我们一起创造卓越的数字产品。
                    </p>
                    <Link
                        href="/user"
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-8 text-sm font-semibold text-primary-600 shadow-lg transition-all duration-200 hover:bg-neutral-50 hover:shadow-xl hover:-translate-y-0.5 dark:text-primary-700"
                    >
                        联系我们
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            </section>
        </div>
    );
}