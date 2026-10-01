/**
 * ============================================================================
 * DirectionalTransition — 专题/首页路由过渡
 * ============================================================================
 *
 * 包在页面骨架最外层(任何 DOM 节点之前),用 type-keyed ViewTransition
 * 响应 Link 的 transitionTypes。layout 里不要再包一层,否则页级 enter/exit
 * 会被吃掉。
 *
 * @module components/topic/DirectionalTransition
 */

/// <reference types="react/canary" />

import type { ReactNode } from "react";
import { ViewTransition } from "react";

interface DirectionalTransitionProps {
    children: ReactNode;
}

/**
 * 首页 ↔ 专题的方向滑动。无 type 时 default=none,避免每次导航都交叉淡化。
 *
 * @example
 * <DirectionalTransition>
 *   <TopicPage>...</TopicPage>
 * </DirectionalTransition>
 */
export function DirectionalTransition({ children }: DirectionalTransitionProps) {
    return (
        <ViewTransition
            enter={{
                "nav-forward": "nav-forward",
                "nav-back": "nav-back",
                default: "none",
            }}
            exit={{
                "nav-forward": "nav-forward",
                "nav-back": "nav-back",
                default: "none",
            }}
            default="none"
        >
            {children}
        </ViewTransition>
    );
}
