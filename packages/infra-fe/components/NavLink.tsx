/**
 * ============================================================================
 * NavLink — 导航链接组件（演示用）
 * ============================================================================
 *
 * 带 active 状态的导航链接。不是 infra-fe 库的一部分。
 *
 * @module components/NavLink
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/utils";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={cn(
        "rounded-md px-3 py-1.5 text-sm font-medium no-underline transition-colors",
        isActive
          ? "bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-primary-200"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      )}
    >
      {children}
    </Link>
  );
}
