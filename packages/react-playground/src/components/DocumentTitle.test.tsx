/**
 * @file DocumentTitle.test.tsx
 *
 * @description 标签页标题必须来自专题注册表与品牌单一数据源(site.ts),
 * 而不是 Rsbuild 默认名;专题页标题必须带上分类名以区分同名的「理解检验」页。
 */

import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';

import {
    DocumentTitle,
    getDocumentTitle,
    HOME_DOCUMENT_TITLE,
    SITE_NAME,
} from './DocumentTitle';
import { SITE_SLOGAN } from '../config/site';
import { TOPICS } from '../config/topics';

describe('getDocumentTitle', () => {
    it('首页使用站点品牌名 + slogan', () => {
        expect(getDocumentTitle('/')).toBe(HOME_DOCUMENT_TITLE);
        expect(getDocumentTitle('')).toBe(HOME_DOCUMENT_TITLE);
        expect(HOME_DOCUMENT_TITLE).toBe(`${SITE_NAME} · ${SITE_SLOGAN}`);
    });

    it('专题页带上专题标题与所属分类', () => {
        expect(getDocumentTitle('/hooks/use-state')).toBe(
            `useState · Hooks · ${SITE_NAME}`,
        );
    });

    it('不同分类的同名专题(理解检验)标题互不相同', () => {
        const checkTitles = TOPICS.filter((t) => t.title === '理解检验').map((t) =>
            getDocumentTitle(t.path),
        );
        expect(checkTitles.length).toBeGreaterThan(1);
        expect(new Set(checkTitles).size).toBe(checkTitles.length);
        expect(getDocumentTitle('/basics/check')).toBe(
            `理解检验 · React 基础 · ${SITE_NAME}`,
        );
    });

    it('分类入口带上分类名', () => {
        expect(getDocumentTitle('/advanced')).toBe(`进阶专题 · ${SITE_NAME}`);
    });

    it('未知路径回落到站点品牌名', () => {
        expect(getDocumentTitle('/not-a-topic')).toBe(HOME_DOCUMENT_TITLE);
    });
});

describe('DocumentTitle', () => {
    afterEach(() => {
        document.title = '';
    });

    it('挂载后写入 document.title', () => {
        render(
            <MemoryRouter initialEntries={['/hooks/use-state']}>
                <DocumentTitle />
            </MemoryRouter>,
        );

        expect(document.title).toBe(`useState · Hooks · ${SITE_NAME}`);
    });
});
