/**
 * ============================================================================
 * nav.tsx — Agent 实战分类的互链目录
 * ============================================================================
 *
 * 梳理页与对话演练页互链,集中在这一处,
 * 由 components/TopicNav.test.tsx 校验每个 to 都在注册表中。
 * 两页都只渲染「对方」那条链接,label 按对端视角写。
 *
 * @module topics/agent/nav
 */

import { BookOutlined, ExperimentOutlined } from '@ant-design/icons';

import type { TopicNavLink } from '../../components/TopicNav';

export const AGENT_NAV_LINKS: readonly TopicNavLink[] = [
    { to: '/agent/use-sync-external-store', label: '梳理页', icon: <BookOutlined /> },
    { to: '/agent/agent-chat', label: 'Agent 对话运行时演示页', icon: <ExperimentOutlined /> },
];

/**
 * 相邻专题:同一事件流的性能视角(TTFT / TTFUI / 取消计费),
 * 在 agent-chat 页头以 performance(amber)配色展示
 */
export const AGENT_CHAT_ADJACENT_LINKS: readonly TopicNavLink[] = [
    { to: '/performance/ai-native-agent', label: 'AI-Native · Agent 工具链演练' },
];
