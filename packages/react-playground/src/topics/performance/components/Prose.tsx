/**
 * ============================================================================
 * Prose — 性能专题梳理页共用排版
 * ============================================================================
 *
 * 避免每个 guide 复制一份 P / Stack。
 *
 * @module topics/performance/components/Prose
 */

import type { ReactNode } from 'react';

export const P = ({ children }: { children: ReactNode }) => (
    <p className="text-sm leading-relaxed text-gray-600 dark:text-slate-300">{children}</p>
);

export const Stack = ({ children }: { children: ReactNode }) => (
    <div className="space-y-3">{children}</div>
);
