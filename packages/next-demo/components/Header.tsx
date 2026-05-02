/**
 * ============================================================================
 * Header Component
 * ============================================================================
 *
 * 应用程序的顶部导航栏组件。
 *
 * 功能职责：
 * - 显示网站 Logo 和名称
 * - 提供主要导航链接
 * - 实现当前页面高亮指示
 * - 响应式设计（桌面端显示导航，移动端显示菜单按钮）
 *
 * 技术细节：
 * - 使用 "use client" 指令，因为需要使用 usePathname 获取当前路由
 * - 通过 Next.js Link 组件实现客户端导航
 * - 使用 Tailwind CSS 实现毛玻璃效果和响应式布局
 *
 * @module Header
 * @client
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * 导航项配置
 * 定义应用中主要页面的导航信息
 */
const navItems = [
    { href: "/", label: "首页" },
    { href: "/ai-models", label: "AI 模型" },
    { href: "/blog", label: "博客" },
    { href: "/user", label: "用户" },
    { href: "/about", label: "关于" },
];

/**
 * Header 组件
 *
 * 设计特点：
 * - 粘性定位（sticky），滚动时保持可见
 * - 毛玻璃背景（backdrop-blur）增加层次感
 * - 导航项悬浮和激活状态有视觉区分
 * - 激活状态使用底部短条指示器
 */
export default function Header() {
  const pathname = usePathname();

  /**
   * 判断当前路径是否为指定路由
   *
   * 逻辑说明：
   * - 首页 "/" 需要精确匹配
   * - 其他路由使用 startsWith 进行前缀匹配
   *   （例如 /blog 会匹配 /blog 和 /blog/123）
   *
   * @param href - 导航项的路径
   * @returns 是否当前页面
   */
  const isActiveRoute = (href: string): boolean => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200/60 bg-white/80 backdrop-blur-md dark:border-neutral-800/60 dark:bg-neutral-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo 区域 */}
        <Link href="/" className="flex items-center gap-2 group">
          {/* Logo 图标 - 带有渐变背景的圆角方形 */}
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-md shadow-primary-500/20 transition-transform duration-200 group-hover:scale-105">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          {/* 网站名称 */}
          <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            Next.js Demo
          </span>
        </Link>

        {/* 桌面端导航菜单 */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative px-5 py-2 text-sm font-medium transition-all duration-200 rounded-lg",
                isActiveRoute(item.href)
                  ? "text-primary-600 dark:text-primary-400"
                  : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50"
              )}
            >
              {item.label}
              {/* 当前页面指示器 - 底部短条 */}
              {isActiveRoute(item.href) && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary-500 rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* 移动端菜单按钮 */}
        <div className="flex items-center gap-2 md:hidden">
          <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
