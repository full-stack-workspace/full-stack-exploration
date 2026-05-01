/**
 * ============================================================================
 * Home Page (首页)
 * ============================================================================
 *
 * 应用程序的首页，展示主要功能和导航入口。
 *
 * 页面结构：
 * 1. Hero Section - 主视觉区域，包含标题、副标题和行动按钮
 * 2. Features Section - 展示应用核心功能特性
 * 3. Explore Section - 导航卡片，引导用户访问其他页面
 *
 * @module page
 */

import Link from "next/link";

/**
 * ============================================================================
 * 功能特性数据
 * ============================================================================
 * 定义首页展示的四个核心功能特性
 *
 * 每个特性包含：
 * - title: 特性名称
 * - description: 特性描述
 * - icon: SVG 图标组件
 * - bgColor/textColor: 浅色模式下的配色
 * - darkBgColor/darkTextColor: 深色模式下的配色
 * - borderColor: 悬浮时的边框颜色
 */
const features = [
  {
    title: "快速开发",
    description: "使用 Next.js App Router 和 React Server Components 构建高性能应用",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    bgColor: "bg-primary-100",
    textColor: "text-primary-600",
    darkBgColor: "dark:bg-primary-900/30",
    darkTextColor: "dark:text-primary-400",
    borderColor: "hover:border-primary-200/60",
  },
  {
    title: "精美设计",
    description: "基于 Tailwind CSS 构建美观、响应式的用户界面",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
    bgColor: "bg-secondary-100",
    textColor: "text-secondary-600",
    darkBgColor: "dark:bg-secondary-900/30",
    darkTextColor: "dark:text-secondary-400",
    borderColor: "hover:border-secondary-200/60",
  },
  {
    title: "类型安全",
    description: "全程使用 TypeScript，确保代码质量和更好的开发体验",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    bgColor: "bg-success-100",
    textColor: "text-success-600",
    darkBgColor: "dark:bg-success-900/30",
    darkTextColor: "dark:text-success-400",
    borderColor: "hover:border-success-200/60",
  },
  {
    title: "现代架构",
    description: "采用最新前端技术栈和最佳实践，构建可扩展的应用",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    bgColor: "bg-accent-100",
    textColor: "text-accent-600",
    darkBgColor: "dark:bg-accent-900/30",
    darkTextColor: "dark:text-accent-400",
    borderColor: "hover:border-accent-200/60",
  },
];

/**
 * ============================================================================
 * 导航卡片数据
 * ============================================================================
 * 定义底部导航区域的三个功能入口卡片
 *
 * 每个卡片包含：
 * - href: 跳转链接
 * - title: 卡片标题
 * - description: 卡片描述
 * - icon: Emoji 图标
 * - gradient: 右上角装饰渐变
 * - 各种配色和悬浮效果类名
 */
const navCards = [
  {
    href: "/blog",
    title: "博客",
    description: "浏览最新文章",
    icon: "📝",
    gradient: "from-primary-400 to-primary-600",
    bgLight: "bg-primary-50",
    borderLight: "border-primary-100",
    textLight: "text-primary-700",
    textMutedLight: "text-primary-500",
    hoverBgLight: "hover:bg-primary-100",
    hoverBorderLight: "hover:border-primary-200",
  },
  {
    href: "/user",
    title: "用户",
    description: "查看用户列表",
    icon: "👥",
    gradient: "from-success-400 to-success-600",
    bgLight: "bg-success-50",
    borderLight: "border-success-100",
    textLight: "text-success-700",
    textMutedLight: "text-success-500",
    hoverBgLight: "hover:bg-success-100",
    hoverBorderLight: "hover:border-success-200",
  },
  {
    href: "/about",
    title: "关于",
    description: "了解更多",
    icon: "ℹ️",
    gradient: "from-accent-400 to-accent-600",
    bgLight: "bg-accent-50",
    borderLight: "border-accent-100",
    textLight: "text-accent-700",
    textMutedLight: "text-accent-500",
    hoverBgLight: "hover:bg-accent-100",
    hoverBorderLight: "hover:border-accent-200",
  },
];

/**
 * ============================================================================
 * 首页组件
 * ============================================================================
 */
export default function Home() {
  return (
    <div className="flex flex-col">
      {/* =====================================================================
       * Hero Section - 主视觉区域
       * =====================================================================
       * 设计特点：
       * - 渐变背景增加层次感
       * - 背景装饰性模糊圆形
       * - 动画效果增强视觉吸引力
       */}
      <section className="relative overflow-hidden bg-gradient-to-b from-neutral-50 via-white to-neutral-50 py-20 sm:py-32">
        {/* 背景装饰 - 渐变模糊圆形 */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-primary-100/30 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            {/* 技术标签徽章 - 带脉冲动画 */}
            <div className="animate-fade-in inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-sm font-medium text-primary-700 dark:border-primary-800 dark:bg-primary-900/30 dark:text-primary-300 mb-6">
              <span className="relative flex h-2 w-2">
                {/* 脉冲动画的圆点 */}
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              Next.js 16 + Tailwind CSS 4
            </div>

            {/* 主标题 - 渐变色文字 */}
            <h1 className="animate-slide-up text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl md:text-6xl lg:text-7xl mb-6">
              <span className="block">构建现代</span>
              <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 bg-clip-text text-transparent">
                Web 应用
              </span>
            </h1>

            {/* 副标题描述 */}
            <p className="animate-slide-up stagger-1 max-w-2xl text-lg text-neutral-600 sm:text-xl dark:text-neutral-400 mb-10">
              一个展示 Next.js 16、React 19 和 Tailwind CSS 4 强大功能的示例项目。
              包含服务端组件、路由系统、API 路由等核心功能。
            </p>

            {/* 行动按钮组 */}
            <div className="animate-slide-up stagger-2 flex flex-col gap-4 sm:flex-row">
              {/* 主按钮 - 渐变阴影 */}
              <Link
                href="/blog"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary-600 px-8 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition-all duration-200 hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5"
              >
                快速开始
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              {/* 次要按钮 - 边框样式 */}
              <Link
                href="/about"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-8 text-sm font-semibold text-neutral-700 shadow-sm transition-all duration-200 hover:bg-neutral-50 hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                了解更多
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
       * Features Section - 功能特性区
       * =====================================================================
       * 4 列网格布局展示核心功能
       */}
      <section className="bg-white py-20 dark:bg-neutral-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`animate-slide-up stagger-${index + 1} group relative rounded-2xl border border-neutral-200/60 bg-neutral-50/50 p-6 transition-all duration-300 ${feature.borderColor} hover:bg-white hover:shadow-xl dark:border-neutral-800/60 dark:bg-neutral-900/50 dark:hover:bg-neutral-900`}
              >
                {/* 功能图标 - 带有背景色的圆形容器 */}
                <div className={`mb-4 inline-flex rounded-xl ${feature.bgColor} ${feature.textColor} p-3 ${feature.darkBgColor} ${feature.darkTextColor}`}>
                  {feature.icon}
                </div>
                {/* 功能标题 */}
                <h3 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                  {feature.title}
                </h3>
                {/* 功能描述 */}
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
       * Explore Section - 探索导航区
       * =====================================================================
       * 3 列网格布局，展示主要功能入口
       */}
      <section className="bg-neutral-50 py-20 dark:bg-neutral-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 mb-4">
              探索更多
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              点击卡片开始探索不同的功能页面
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {navCards.map((card, index) => (
              <Link
                key={card.href}
                href={card.href}
                className={`animate-slide-up stagger-${index + 1} group relative overflow-hidden rounded-2xl border ${card.borderLight} ${card.bgLight} p-8 transition-all duration-300 ${card.hoverBgLight} ${card.hoverBorderLight} hover:shadow-xl hover:-translate-y-1`}
              >
                {/* 右上角装饰渐变圆形 */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.gradient} opacity-10 blur-2xl rounded-full transition-opacity duration-300 group-hover:opacity-20`} />

                <div className="relative">
                  {/* Emoji 大图标 */}
                  <div className="text-5xl mb-4">{card.icon}</div>
                  {/* 卡片标题 */}
                  <h3 className={`text-xl font-semibold ${card.textLight} mb-2`}>
                    {card.title}
                  </h3>
                  {/* 卡片描述 */}
                  <p className={`text-sm ${card.textMutedLight}`}>
                    {card.description}
                  </p>
                </div>

                {/* 访问链接 - 带箭头动画 */}
                <div className={`mt-6 inline-flex items-center gap-2 text-sm font-medium ${card.textLight} transition-transform duration-200 group-hover:gap-3`}>
                  访问
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
