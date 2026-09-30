/**
 * ============================================================================
 * nav.tsx — 函数组件与类组件专题的互链目录
 * ============================================================================
 *
 * guide / playground / practice 三页共用,集中在这一处,
 * 由 components/TopicNav.test.tsx 校验每个 to 都在注册表中。
 *
 * @module topics/basics/fn-vs-class/nav
 */

import { AppstoreOutlined, BookOutlined, PartitionOutlined } from '@ant-design/icons';

import type { TopicNavLink } from '../../../components/TopicNav';

export const FN_VS_CLASS_NAV_TITLE = '「函数组件与类组件」专题三页联动:';

export const FN_VS_CLASS_NAV_LINKS: readonly TopicNavLink[] = [
    { to: '/basics/fn-vs-class-guide', label: '范式梳理', icon: <BookOutlined /> },
    { to: '/basics/fn-vs-class-playground', label: '对照演练', icon: <AppstoreOutlined /> },
    { to: '/basics/fn-vs-class-practice', label: '看板实战', icon: <PartitionOutlined /> },
];
