/**
 * @file DocumentTitle.test.tsx
 *
 * @description 标签页标题必须来自专题注册表,而不是 Rsbuild 默认名。
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

describe('getDocumentTitle', () => {
    it('首页使用站点品牌名', () => {
        expect(getDocumentTitle('/')).toBe(HOME_DOCUMENT_TITLE);
        expect(getDocumentTitle('')).toBe(HOME_DOCUMENT_TITLE);
    });

    it('专题页带上专题标题', () => {
        expect(getDocumentTitle('/topics/hooks/use-state')).toBe(
            `useState · ${SITE_NAME}`,
        );
    });

    it('分类入口带上分类名', () => {
        expect(getDocumentTitle('/topics/advanced')).toBe(`进阶专题 · ${SITE_NAME}`);
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
            <MemoryRouter initialEntries={['/topics/hooks/use-state']}>
                <DocumentTitle />
            </MemoryRouter>,
        );

        expect(document.title).toBe(`useState · ${SITE_NAME}`);
    });
});
