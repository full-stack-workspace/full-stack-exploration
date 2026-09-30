/**
 * ============================================================================
 * Prose — 内部机制梳理页共用排版
 * ============================================================================
 *
 * @module topics/internals/components/Prose
 */

import type { ReactNode } from 'react';

export const P = ({ children }: { children: ReactNode }) => (
    <p className="text-sm leading-relaxed text-gray-600 dark:text-slate-300">{children}</p>
);

export const Stack = ({ children }: { children: ReactNode }) => (
    <div className="space-y-3">{children}</div>
);
