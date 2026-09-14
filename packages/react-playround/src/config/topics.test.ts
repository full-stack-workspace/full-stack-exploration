/**
 * @file topics.test.ts
 *
 * @description 专题注册表完整性测试:保证路由、导航、首页共用的
 * 单一数据源始终处于合法状态,新增专题时能在 CI 中拦截注册错误
 */

import { describe, expect, it } from 'vitest';

import {
    CATEGORIES,
    getCategoryByPath,
    getTopicsByCategory,
    TOPICS,
} from './topics';

describe('专题注册表', () => {
    it('每个专题的 path 全站唯一', () => {
        const paths = TOPICS.map((t) => t.path);
        expect(new Set(paths).size).toBe(paths.length);
    });

    it('每个专题的 category 都是合法分类', () => {
        const validKeys = CATEGORIES.map((c) => c.key);
        TOPICS.forEach((t) => {
            expect(validKeys).toContain(t.category);
        });
    });

    it('专题 path 必须以其所属分类的 basePath 开头', () => {
        TOPICS.forEach((t) => {
            const category = CATEGORIES.find((c) => c.key === t.category);
            expect(t.path.startsWith(`${category?.basePath}/`)).toBe(true);
        });
    });

    it('每个专题都有标题、描述与懒加载组件', () => {
        TOPICS.forEach((t) => {
            expect(t.title.trim().length).toBeGreaterThan(0);
            expect(t.description.trim().length).toBeGreaterThan(0);
            expect(t.element).toBeDefined();
        });
    });

    it('每个分类至少有一个专题(顶部导航点击有落点)', () => {
        CATEGORIES.forEach((c) => {
            expect(getTopicsByCategory(c.key).length).toBeGreaterThan(0);
        });
    });

    it('getCategoryByPath 能正确推导专题所属分类', () => {
        TOPICS.forEach((t) => {
            expect(getCategoryByPath(t.path)?.key).toBe(t.category);
        });
    });

    it('getCategoryByPath 对首页与未知路径返回 undefined', () => {
        expect(getCategoryByPath('/')).toBeUndefined();
        expect(getCategoryByPath('/not-exists')).toBeUndefined();
    });
});
