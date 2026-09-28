/**
 * ============================================================================
 * QualityTradeoff — 快但错把 TTFUI 变成负资产
 * ============================================================================
 *
 * 质量不进看板时,优化团队会庆祝 TTFT。用户却点重新生成,墙钟和 token 翻倍。
 *
 * @module topics/performance/ai-native/agent-lab/components/QualityTradeoff
 */

import { memo, useState } from 'react';
import { Segmented } from 'antd';

type Mode = 'wrong' | 'right';

const ROWS: Record<Mode, { ttfui: string; success: string; regen: string; wall: string; tokens: string; note: string }> =
    {
        wrong: {
            ttfui: '380 ms',
            success: '0%(库存数字是编的)',
            regen: '用户立刻重来 1 次',
            wall: '380 + 920 = 1300 ms',
            tokens: '2 倍(两次工具链)',
            note: '第一次「有用信息」其实没用。TTFUI 数字很好看,任务失败。',
        },
        right: {
            ttfui: '920 ms',
            success: '一次采纳',
            regen: '0',
            wall: '920 ms',
            tokens: '1 倍',
            note: '工具结果写进答案后再上屏。慢在检索,但对。',
        },
    };

export const QualityTradeoff = memo(() => {
    const [mode, setMode] = useState<Mode>('wrong');
    const row = ROWS[mode];

    return (
        <div className="space-y-3">
            <Segmented
                aria-label="质量对照"
                value={mode}
                onChange={(v) => setMode(v as Mode)}
                options={[
                    { label: '快但错', value: 'wrong' },
                    { label: '慢但对', value: 'right' },
                ]}
            />
            <dl className="grid gap-2 text-xs sm:grid-cols-2">
                <div className="rounded-lg border border-gray-100 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950">
                    <dt className="text-gray-400">表面 TTFUI</dt>
                    <dd className="text-sm text-gray-800 dark:text-slate-100">{row.ttfui}</dd>
                </div>
                <div className="rounded-lg border border-gray-100 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950">
                    <dt className="text-gray-400">任务成功率</dt>
                    <dd className="text-sm text-gray-800 dark:text-slate-100">{row.success}</dd>
                </div>
                <div className="rounded-lg border border-gray-100 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950">
                    <dt className="text-gray-400">重新生成</dt>
                    <dd className="text-sm text-gray-800 dark:text-slate-100">{row.regen}</dd>
                </div>
                <div className="rounded-lg border border-gray-100 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950">
                    <dt className="text-gray-400">用户墙钟 / token</dt>
                    <dd className="text-sm text-gray-800 dark:text-slate-100">
                        {row.wall} · {row.tokens}
                    </dd>
                </div>
            </dl>
            <p className="text-xs text-gray-500 dark:text-slate-400">{row.note}</p>
        </div>
    );
});

QualityTradeoff.displayName = 'QualityTradeoff';
