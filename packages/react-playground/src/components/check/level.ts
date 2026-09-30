/**
 * ============================================================================
 * level — 理解检验的难度标记
 * ============================================================================
 *
 * 3 进阶,4 较难,5 资深。目录和题卡共用同一套说法。
 *
 * @module components/check/level
 */

import type { Difficulty } from './types';

export const LEVEL: Record<Difficulty, { label: string; className: string }> = {
    3: {
        label: '进阶',
        className: 'bg-primary-50 text-primary-700 dark:bg-primary-700/30 dark:text-primary-200',
    },
    4: {
        label: '较难',
        className: 'bg-amber-50 text-amber-900 dark:bg-amber-400/15 dark:text-amber-100',
    },
    5: {
        label: '资深',
        className: 'bg-amber-100 text-amber-950 dark:bg-amber-300/20 dark:text-amber-50',
    },
};
