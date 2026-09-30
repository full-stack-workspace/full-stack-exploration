/**
 * ============================================================================
 * legacy-routes.ts — 旧路径重定向表
 * ============================================================================
 *
 * 信息架构调整前的地址保持可访问。两类规则:
 * 1. 具体重定向 LEGACY_REDIRECTS:单条旧路径 → 新路径
 * 2. 前缀通配 LEGACY_PREFIX_REDIRECTS:basePath 统一为裸前缀前的
 *    '/topics/<key>/*' 整组迁移到 '/<key>/*'
 *
 * React Router 6 按路由特异性匹配(静态 > 通配),具体重定向天然优先于
 * 前缀通配;resolveLegacyRedirect 用同样的「先查表再匹配前缀」顺序,
 * 供单测验证迁移结果与注册表一致。
 *
 * @module config/legacy-routes
 */

/* ---- 具体重定向:放在通配之前生效 ---- */
export const LEGACY_REDIRECTS: Record<string, string> = {
    '/todo': '/apps/todo',
    '/bookkeeping': '/apps/bookkeeping',
    '/shopping-cart': '/apps/shopping-cart',
    '/relay-example': '/advanced/relay',
    '/topics/hooks/use-context': '/advanced/context',
    '/topics/advanced/suspense': '/performance/suspense-ui',
    // RSC 专题从 basics 挪到 advanced:必须先于 '/topics/basics/*' 通配命中
    '/topics/basics/rsc-guide': '/advanced/rsc-guide',
    '/topics/basics/rsc-boundary': '/advanced/rsc-boundary',
};

/* ---- 前缀通配:basePath 统一为裸前缀前的整组迁移 ---- */
export const LEGACY_PREFIX_REDIRECTS: ReadonlyArray<{ from: string; to: string }> = [
    { from: '/topics/basics', to: '/basics' },
    { from: '/topics/hooks', to: '/hooks' },
    { from: '/topics/advanced', to: '/advanced' },
];

/**
 * 解析旧路径的新地址;无需迁移时返回 undefined。
 * 具体重定向优先于前缀通配(与 React Router 6 的路由特异性一致)。
 *
 * @param pathname - 不含 search 的路由路径
 * @returns 迁移目标路径,或 undefined 表示不是旧路径
 */
export const resolveLegacyRedirect = (pathname: string): string | undefined => {
    const exact = LEGACY_REDIRECTS[pathname];
    if (exact) {
        return exact;
    }
    const prefix = LEGACY_PREFIX_REDIRECTS.find(
        (p) => pathname === p.from || pathname.startsWith(`${p.from}/`),
    );
    if (!prefix) {
        return undefined;
    }
    return pathname.replace(prefix.from, prefix.to);
};
