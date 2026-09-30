/**
 * ============================================================================
 * nav.tsx — 自定义 Hooks 专题的互链目录
 * ============================================================================
 *
 * guide / playground / composition 三页共用,集中在这一处,
 * 由 components/TopicNav.test.tsx 校验每个 to 都在注册表中。
 *
 * @module topics/hooks/custom-hooks/nav
 */

import { AppstoreOutlined, BookOutlined, PartitionOutlined } from '@ant-design/icons';

import type { TopicNavLink } from '../../../components/TopicNav';

export const CUSTOM_HOOKS_NAV_TITLE = '「自定义 Hooks」专题三页联动:';

export const CUSTOM_HOOKS_NAV_LINKS: readonly TopicNavLink[] = [
    { to: '/hooks/custom-hooks-guide', label: '深入梳理', icon: <BookOutlined /> },
    { to: '/hooks/custom-hooks-playground', label: '原子演练', icon: <AppstoreOutlined /> },
    { to: '/hooks/custom-hooks-composition', label: '组合实战', icon: <PartitionOutlined /> },
];
