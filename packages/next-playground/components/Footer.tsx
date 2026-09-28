/**
 * ============================================================================
 * Footer Component
 * ============================================================================
 *
 * 应用程序的页脚组件。
 *
 * 功能职责：
 * - 显示网站 Logo 和简介
 * - 提供页面导航链接
 * - 展示外部资源链接
 * - 显示版权信息
 *
 * 设计特点：
 * - 使用 Grid 布局实现多列响应式设计
 * - 清晰的视觉层次结构
 * - 与 Header 保持一致的配色和样式
 *
 * @module Footer
 */

import Link from "next/link";

/**
 * 页面导航链接配置
 */
const navigationLinks = [
  { href: "/", label: "首页" },
  { href: "/blog", label: "博客" },
  { href: "/user", label: "用户" },
  { href: "/about", label: "关于" },
];

/**
 * 外部资源链接配置
 */
const resourceLinks = [
  { href: "https://nextjs.org", label: "Next.js 文档" },
  { href: "https://tailwindcss.com", label: "Tailwind CSS" },
  { href: "https://react.dev", label: "React" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-200/60 bg-white dark:border-neutral-800/60 dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* 主要内容区域 - Grid 布局 */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* 品牌信息区域 */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              {/* Footer Logo */}
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-md shadow-primary-500/20">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                Next.js Demo
              </span>
            </div>
            <p className="max-w-md text-sm text-neutral-500 dark:text-neutral-400">
              一个现代化的 Next.js 应用示例，集成了 Tailwind CSS、React Server Components 和 TypeScript。展示最佳实践和精美设计。
            </p>
          </div>

          {/* 导航链接区域 */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-900 dark:text-neutral-50 mb-4">
              导航
            </h3>
            <ul className="space-y-3">
              {navigationLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-500 transition-colors hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 外部资源链接区域 */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-900 dark:text-neutral-50 mb-4">
              资源
            </h3>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-neutral-500 transition-colors hover:text-primary-600 dark:text-neutral-400 dark:hover:text-primary-400"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 版权信息区域 */}
        <div className="mt-8 border-t border-neutral-200/60 pt-8 dark:border-neutral-800/60">
          <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
            © {currentYear} Next.js Demo. 使用 Next.js 16 + Tailwind CSS 构建。
          </p>
        </div>
      </div>
    </footer>
  );
}
