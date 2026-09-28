/**
 * ============================================================================
 * SceneMetrics — 按场景切换北极星与诊断指标
 * ============================================================================
 *
 * 同一套「页面绿了」在传统搜索、AI 对话、语音 Agent 上含义完全不同。
 * 切换场景看哪些指标是验收、哪些只是地基、哪些此刻根本不该看。
 *
 * @module topics/performance/governance/metrics-lab/components/SceneMetrics
 */

import { memo, useState } from 'react';
import { Segmented, Tag } from 'antd';

type Scene = 'search' | 'chat' | 'voice';

type Role = 'polaris' | 'business' | 'diagnostic' | 'baseline' | 'n/a';

interface MetricRow {
    name: string;
    meaning: string;
    role: Record<Scene, Role>;
}

const ROLE_LABEL: Record<Role, { text: string; color: string }> = {
    polaris: { text: '北极星', color: 'gold' },
    business: { text: '业务完成', color: 'blue' },
    diagnostic: { text: '诊断', color: 'default' },
    baseline: { text: '基线入场券', color: 'green' },
    'n/a': { text: '此刻不看', color: 'default' },
};

const ROWS: MetricRow[] = [
    {
        name: 'LCP',
        meaning: '视口最大内容何时可见',
        role: { search: 'polaris', chat: 'baseline', voice: 'baseline' },
    },
    {
        name: 'INP',
        meaning: '点击/输入到下一帧绘制',
        role: { search: 'polaris', chat: 'baseline', voice: 'baseline' },
    },
    {
        name: 'CLS',
        meaning: '意外布局偏移累计',
        role: { search: 'polaris', chat: 'baseline', voice: 'n/a' },
    },
    {
        name: '结果更新时间',
        meaning: '筛选完成 → 列表真正换完',
        role: { search: 'business', chat: 'n/a', voice: 'n/a' },
    },
    {
        name: 'TTFT',
        meaning: '发送 → 第一个 token 到达',
        role: { search: 'n/a', chat: 'diagnostic', voice: 'diagnostic' },
    },
    {
        name: 'FTRT',
        meaning: '第一个 token 真正上屏',
        role: { search: 'n/a', chat: 'diagnostic', voice: 'n/a' },
    },
    {
        name: 'TTFUI',
        meaning: '第一个真正有用的信息出现',
        role: { search: 'n/a', chat: 'polaris', voice: 'polaris' },
    },
    {
        name: 'TPOT / 流式抖动',
        meaning: 'token 节奏是否像 PPT',
        role: { search: 'n/a', chat: 'polaris', voice: 'n/a' },
    },
    {
        name: '打断延迟',
        meaning: '用户插话后 AI 多久停声',
        role: { search: 'n/a', chat: 'n/a', voice: 'polaris' },
    },
    {
        name: '任务成功率 / 采纳率',
        meaning: '快但错会抵消一切时延收益',
        role: { search: 'n/a', chat: 'business', voice: 'business' },
    },
    {
        name: '工具 / RAG 耗时',
        meaning: '检索和 function call 是否串成瀑布',
        role: { search: 'n/a', chat: 'diagnostic', voice: 'n/a' },
    },
    {
        name: 'Token / 任务',
        meaning: '含取消后仍在跑的调用,慢和贵是同一枚硬币',
        role: { search: 'n/a', chat: 'diagnostic', voice: 'diagnostic' },
    },
];

export const SceneMetrics = memo(() => {
    const [scene, setScene] = useState<Scene>('search');

    return (
        <div className="space-y-3">
            <Segmented
                aria-label="指标场景"
                value={scene}
                onChange={(v) => setScene(v as Scene)}
                options={[
                    { label: '商品搜索', value: 'search' },
                    { label: 'AI 对话', value: 'chat' },
                    { label: '语音 Agent', value: 'voice' },
                ]}
            />
            <div className="overflow-x-auto">
                <table className="w-full min-w-[36rem] text-left text-xs">
                    <thead>
                        <tr className="border-b border-gray-100 text-gray-400 dark:border-slate-800 dark:text-slate-500">
                            <th className="py-2 font-medium">指标</th>
                            <th className="py-2 font-medium">它在问什么</th>
                            <th className="py-2 font-medium">本场景角色</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ROWS.map((row) => {
                            const role = row.role[scene];
                            const meta = ROLE_LABEL[role];
                            return (
                                <tr
                                    key={row.name}
                                    className="border-b border-gray-50 dark:border-slate-800/80"
                                >
                                    <td className="py-2 font-medium text-gray-800 dark:text-slate-100">
                                        {row.name}
                                    </td>
                                    <td className="py-2 text-gray-500 dark:text-slate-400">
                                        {row.meaning}
                                    </td>
                                    <td className="py-2">
                                        <Tag color={role === 'n/a' ? undefined : meta.color}>
                                            {meta.text}
                                        </Tag>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <p className="text-xs text-gray-400 dark:text-slate-500">
                传统 Web 用 LCP + INP + CLS 当北极星,用 TTFB / FCP / 长任务当诊断。
                AI 对话里它们降成基线:全绿只说明壳子达标,不说明思考快。
            </p>
        </div>
    );
});

SceneMetrics.displayName = 'SceneMetrics';
