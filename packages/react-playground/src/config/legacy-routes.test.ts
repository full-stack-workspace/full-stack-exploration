/**
 * @file legacy-routes.test.ts
 *
 * @description 旧路径迁移规则:具体重定向优先于前缀通配(RSC 挪类),
 * 且所有迁移目标都必须存在于专题注册表,防止目标页再改名后漂移。
 */

import { describe, expect, it } from 'vitest';

import { LEGACY_REDIRECTS, LEGACY_PREFIX_REDIRECTS, resolveLegacyRedirect } from './legacy-routes';
import { TOPICS } from './topics';

describe('旧路径重定向', () => {
    it('basePath 统一前的 /topics/<key>/* 整组迁移到裸前缀', () => {
        expect(resolveLegacyRedirect('/topics/basics/jsx-render')).toBe('/basics/jsx-render');
        expect(resolveLegacyRedirect('/topics/hooks/use-state')).toBe('/hooks/use-state');
        expect(resolveLegacyRedirect('/topics/advanced/context')).toBe('/advanced/context');
        // 分类入口本身(无尾段)也迁移
        expect(resolveLegacyRedirect('/topics/basics')).toBe('/basics');
    });

    it('RSC 挪类:具体重定向优先于 basics 通配,不落到 /basics/rsc-*', () => {
        expect(resolveLegacyRedirect('/topics/basics/rsc-guide')).toBe('/advanced/rsc-guide');
        expect(resolveLegacyRedirect('/topics/basics/rsc-boundary')).toBe('/advanced/rsc-boundary');
    });

    it('既有具体重定向的目标随裸前缀更新', () => {
        expect(resolveLegacyRedirect('/topics/hooks/use-context')).toBe('/advanced/context');
        expect(resolveLegacyRedirect('/relay-example')).toBe('/advanced/relay');
        expect(resolveLegacyRedirect('/topics/advanced/suspense')).toBe('/performance/suspense-ui');
        expect(resolveLegacyRedirect('/todo')).toBe('/apps/todo');
    });

    it('新路径与普通未知路径不迁移', () => {
        expect(resolveLegacyRedirect('/basics/jsx-render')).toBeUndefined();
        expect(resolveLegacyRedirect('/advanced/rsc-guide')).toBeUndefined();
        expect(resolveLegacyRedirect('/not-exists')).toBeUndefined();
    });

    it('所有迁移目标都已在专题注册表中', () => {
        const registered = new Set(TOPICS.map((t) => t.path));
        Object.values(LEGACY_REDIRECTS).forEach((to) => {
            expect(registered.has(to)).toBe(true);
        });
        LEGACY_PREFIX_REDIRECTS.forEach(({ from, to }) => {
            // 通配规则抽样:把旧前缀下曾经存在的路径映射后必须命中注册表
            TOPICS.filter((t) => t.path.startsWith(`${to}/`)).forEach((t) => {
                expect(resolveLegacyRedirect(t.path.replace(to, from))).toBe(t.path);
            });
        });
    });
});
