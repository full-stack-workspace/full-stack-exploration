/**
 * ============================================================================
 * nav.tsx — AI-Native 系列的相邻专题互链
 * ============================================================================
 *
 * ai-native 讲指标与成本,事件流如何驱动 UI 的完整链路在 Agent 实战分类;
 * 两页互链,由 components/TopicNav.test.tsx 校验每个 to 都在注册表中。
 *
 * @module topics/performance/ai-native/nav
 */

import type { TopicNavLink } from '../../../components/TopicNav';

/** 相邻专题:本条工具链的事件流如何驱动 UI,见 Agent 实战 */
export const AI_NATIVE_AGENT_NAV_LINKS: readonly TopicNavLink[] = [
    { to: '/agent/agent-chat', label: 'Agent 对话运行时(SSE → Store → UI)' },
];
