/**
 * ============================================================================
 * CausalChain — 传统 Web 指标因果关系
 * ============================================================================
 *
 * @module topics/performance/governance/metrics-lab/components/CausalChain
 */

import { memo } from 'react';

import { Diagram } from '../../../../../components/Diagram';

export const CausalChain = memo(() => (
    <Diagram caption="先看结果指标,再用诊断指标往回追">
        {`DNS / TCP / TLS / 服务端慢 → TTFB 慢 → HTML/图到达晚 → FCP、LCP 慢

JS 长任务 / 主线程忙 → FCP、LCP、INP 一起变差
图片无尺寸 / 动态插入 → CLS 变差

验收盯 P75: LCP ≤ 2.5s · INP ≤ 200ms · CLS ≤ 0.1
INP 好,不代表搜索结果已经换完 —— 那是业务完成时间`}
    </Diagram>
));

CausalChain.displayName = 'CausalChain';
