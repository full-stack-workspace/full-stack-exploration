/**
 * ============================================================================
 * nav.tsx — 组件通信专题的互链目录
 * ============================================================================
 *
 * guide / playground / practice 三页共用,集中在这一处,
 * 由 components/TopicNav.test.tsx 校验每个 to 都在注册表中。
 *
 * @module topics/advanced/component-comm/nav
 */

import { AppstoreOutlined, BookOutlined, PartitionOutlined } from '@ant-design/icons';

import type { TopicNavLink } from '../../../components/TopicNav';

export const COMPONENT_COMM_NAV_TITLE = '「组件通信」专题三页联动:';

export const COMPONENT_COMM_NAV_LINKS: readonly TopicNavLink[] = [
    { to: '/advanced/component-comm-guide', label: '决策梳理', icon: <BookOutlined /> },
    { to: '/advanced/component-comm-playground', label: '模式演练', icon: <AppstoreOutlined /> },
    { to: '/advanced/component-comm-practice', label: '工作台实战', icon: <PartitionOutlined /> },
];
