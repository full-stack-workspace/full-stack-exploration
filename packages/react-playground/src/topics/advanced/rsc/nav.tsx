/**
 * ============================================================================
 * nav.tsx — RSC 专题的互链目录(advanced 分类)
 * ============================================================================
 *
 * guide / boundary 两页共用,集中在这一处,
 * 由 components/TopicNav.test.tsx 校验每个 to 都在注册表中。
 * RSC_NAV_NOTE 是练习场 SPA 环境的免责声明,两页都要带。
 *
 * @module topics/advanced/rsc/nav
 */

import type { TopicNavLink } from '../../../components/TopicNav';

export const RSC_NAV_TITLE = '「RSC」专题两页联动:';

/** 练习场没有 Server 运行时,两页都不执行真正的 RSC */
export const RSC_NAV_NOTE = (
    <>
        本练习场是浏览器里的 <code className="font-mono">createRoot</code> 应用,没有 RSC
        运行时。下面是规则与流程,不是服务端组件在执行。
    </>
);

export const RSC_NAV_LINKS: readonly TopicNavLink[] = [
    { to: '/advanced/rsc-guide', label: '深度梳理' },
    { to: '/advanced/rsc-boundary', label: '边界示意' },
];
