/**
 * ============================================================================
 * DocumentTitle — 浏览器标签页标题
 * ============================================================================
 *
 * 按当前路由从专题注册表派生 document.title,避免 Rsbuild 默认的
 * 「Rsbuild App」出现在标签页上。首页与未匹配路径使用站点品牌名。
 *
 * @module components/DocumentTitle
 */

import { memo, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { getCategoryByPath, getTopicByPath } from '../config/topics';

/** 站点品牌名,与 Header 品牌区、html.title 保持一致 */
export const SITE_NAME = 'React Playground';

/** 首页 / 兜底标题 */
export const HOME_DOCUMENT_TITLE = `${SITE_NAME} · 专题练习场`;

/**
 * 根据路径计算标签页标题。
 *
 * @param pathname - 不含 search 的路由路径
 * @returns 形如「useState · React Playground」的标题
 */
export function getDocumentTitle(pathname: string): string {
    const topic = getTopicByPath(pathname);
    if (topic) {
        return `${topic.title} · ${SITE_NAME}`;
    }

    const category = getCategoryByPath(pathname);
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
