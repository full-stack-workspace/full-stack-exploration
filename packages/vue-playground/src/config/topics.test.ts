/**
 * ============================================================================
 * 注册表契约测试 — topics.test.ts
 * ============================================================================
 *
 * 保证「注册表驱动全站」约定不被破坏:
 * - path 全站唯一,且以所属分类 basePath 开头
 * - category 必须存在于 CATEGORIES
 * - title / description 非空(首页卡片与页头直接展示)
 * - 分类 key 与 basePath 一一对应、不重复
 *
 * 新增专题注册后跑 `pnpm test:run` 即可校验。
 *
 * @module config/topics.test
 */

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { CATEGORIES, getCategoryMeta,TOPICS } from './topics';

describe('CATEGORIES 分类定义', () => {
    it('分类 key 唯一', () => {
        const keys = CATEGORIES.map((c) => c.key);
        expect(new Set(keys).size).toBe(keys.length);
    });

    it('basePath 唯一且与 key 同名(裸前缀约定)', () => {
        const basePaths = CATEGORIES.map((c) => c.basePath);
        expect(new Set(basePaths).size).toBe(basePaths.length);
        for (const c of CATEGORIES) {
            expect(c.basePath).toBe(`/${c.key}`);
        }
    });

    it('每个分类具备完整的展示信息', () => {
        for (const c of CATEGORIES) {
            expect(c.title.trim()).not.toBe('');
            expect(c.subtitle.trim()).not.toBe('');
            expect(c.theme.icon).toBeTruthy();
        }
    });
});

describe('TOPICS 专题注册', () => {
    it('path 全站唯一', () => {
        const paths = TOPICS.map((t) => t.path);
        expect(new Set(paths).size).toBe(paths.length);
    });

    it('每个专题的 category 必须存在,且 path 以分类 basePath 开头', () => {
        for (const t of TOPICS) {
            const category = getCategoryMeta(t.category);
            expect(category).toBeTruthy();
            expect(t.path.startsWith(`${category.basePath}/`)).toBe(true);
        }
    });

    it('每个专题具备标题、描述与懒加载组件', () => {
        for (const t of TOPICS) {
            expect(t.title.trim()).not.toBe('');
            expect(t.description.trim()).not.toBe('');
            expect(typeof t.element).toBe('function');
        }
    });

    it('注册表中每个懒加载 import 的目标文件真实存在', () => {
        // 从源码静态提取 import('@/topics/...') 路径,逐个校验文件存在
        // (专题目录可能与子路径不同名,如 /advanced/component-comm-guide → component-comm/guide,
        //  因此不推导目录,直接校验 import 目标)
        const source = readFileSync(resolve('src/config/topics.ts'), 'utf-8');
        const importPaths = [...source.matchAll(/import\('@\/topics\/([^']+)'\)/g)].map((m) => m[1]);
        expect(importPaths.length).toBe(TOPICS.length);
        for (const p of importPaths) {
            const abs = resolve('src/topics', p);
            expect(existsSync(abs), `专题文件缺失:${p}`).toBe(true);
        }
    });

    it('每个分类至少有一个专题(空分类不上线)', () => {
        for (const c of CATEGORIES) {
            const count = TOPICS.filter((t) => t.category === c.key).length;
            expect(count, `分类 ${c.key} 没有专题`).toBeGreaterThan(0);
        }
    });
});
