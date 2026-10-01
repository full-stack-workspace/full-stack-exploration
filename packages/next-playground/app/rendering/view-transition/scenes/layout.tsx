/**
 * ============================================================================
 * scenes 布局 — 页级 ViewTransition 活演示
 * ============================================================================
 *
 * 与全站 TopicPage 的 DirectionalTransition 同理:
 * 一层 <ViewTransition> 包住两个场景页,导航时按 Link 的
 * transitionTypes 取 enter/exit 类名(nav-forward / nav-back 做方向滑动,
 * 无类型时退化为 fade)。CSS 配方全部来自 globals.css 的现成配方,
 * 本文件一行样式都不写。
 *
 * 与 DirectionalTransition 一样,这是纯 Server Component 也能用的 API:
 * ViewTransition 是渲染原语,不是交互逻辑。
 *
 * @module app/rendering/view-transition/scenes/layout
 */

/// <reference types="react/canary" />

import type { ReactNode } from "react";
import { ViewTransition } from "react";

export default function ScenesLayout({ children }: { children: ReactNode }) {
    return (
        <ViewTransition
            enter={{
                "nav-forward": "nav-forward",
                "nav-back": "nav-back",
                default: "fade-in",
            }}
            exit={{
                "nav-forward": "nav-forward",
                "nav-back": "nav-back",
                default: "fade-out",
            }}
            default="none"
        >
            {children}
        </ViewTransition>
    );
}
