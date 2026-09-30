/**
 * ============================================================================
 * DocumentTitle — 浏览器标签页标题
 * ============================================================================
 *
 * 按当前路由从专题注册表派生 document.title,避免 Rsbuild 默认的
 * 「Rsbuild App」出现在标签页上。首页与未匹配路径使用站点品牌名 + slogan。
 * 品牌文案统一来自 src/config/site.ts。
 *
 * @module components/DocumentTitle
 */

import { memo, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { SITE_NAME, SITE_TITLE } from '../config/site';
import { getCategoryByPath, getTopicByPath } from '../config/topics';

/** 站点品牌名(从品牌单一数据源再导出,兼容既有引用) */
export { SITE_NAME };

/** 首页 / 兜底标题:站点名 + slogan */
export const HOME_DOCUMENT_TITLE = SITE_TITLE;

/**
 * 根据路径计算标签页标题。
 *
 * 专题页拼上所属分类名,避免五个分类各自的「理解检验」页标题完全相同。
 *
 * @param pathname - 不含 search 的路由路径
 * @returns 形如「useState · Hooks · React 权衡录」的标题
 */
export function getDocumentTitle(pathname: string): string {
    const topic = getTopicByPath(pathname);
    const category = getCategoryByPath(pathname);

    if (topic && category) {
        return `${topic.title} · ${category.title} · ${SITE_NAME}`;
    }
    if (topic) {
        return `${topic.title} · ${SITE_NAME}`;
    }
    if (category) {
        return `${category.title} · ${SITE_NAME}`;
    }

    return HOME_DOCUMENT_TITLE;
}

export const DocumentTitle = memo(() => {
    const { pathname } = useLocation();
    const title = getDocumentTitle(pathname);

    useLayoutEffect(() => {
        document.title = title;
    }, [title]);

    return null;
});

DocumentTitle.displayName = 'DocumentTitle';
