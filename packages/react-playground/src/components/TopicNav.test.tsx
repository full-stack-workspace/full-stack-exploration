/**
 * @file TopicNav.test.tsx
 *
 * @description 专题互链横幅(TopicNav):渲染行为 + 防漂移。
 * 所有使用 TopicNav 的专题,其互链目录(nav.tsx)里的每个 to
 * 都必须存在于专题注册表,路径改名时在这里被拦截。
 */

import { describe, expect, it } from 'vitest';

import { render, screen } from '../test/utils';
import { TOPICS } from '../config/topics';
import { TopicNav } from './TopicNav';
import type { TopicNavLink } from './TopicNav';
import { FN_VS_CLASS_NAV_LINKS } from '../topics/basics/fn-vs-class/nav';
import { CUSTOM_HOOKS_NAV_LINKS } from '../topics/hooks/custom-hooks/nav';
import { COMPONENT_COMM_NAV_LINKS } from '../topics/advanced/component-comm/nav';
import { RSC_NAV_LINKS } from '../topics/advanced/rsc/nav';
import { AGENT_CHAT_ADJACENT_LINKS, AGENT_NAV_LINKS } from '../topics/agent/nav';
import { AI_NATIVE_AGENT_NAV_LINKS } from '../topics/performance/ai-native/nav';

/** 全站所有喂给 TopicNav 的互链目录 */
const ALL_NAV_LINKS: ReadonlyArray<readonly TopicNavLink[]> = [
    FN_VS_CLASS_NAV_LINKS,
    CUSTOM_HOOKS_NAV_LINKS,
    COMPONENT_COMM_NAV_LINKS,
    RSC_NAV_LINKS,
    AGENT_NAV_LINKS,
    AGENT_CHAT_ADJACENT_LINKS,
    AI_NATIVE_AGENT_NAV_LINKS,
];

describe('TopicNav 渲染', () => {
    it('渲染导语与除当前页外的链接', () => {
        render(
            <TopicNav
                title="「函数组件与类组件」专题三页联动:"
                links={FN_VS_CLASS_NAV_LINKS}
                current="/basics/fn-vs-class-guide"
                category="basics"
            />,
        );
        expect(screen.getByText(/专题三页联动/)).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /范式梳理/ })).not.toBeInTheDocument();
        expect(screen.getByRole('link', { name: /对照演练/ })).toHaveAttribute(
            'href',
            '/basics/fn-vs-class-playground',
        );
        expect(screen.getByRole('link', { name: /看板实战/ })).toHaveAttribute(
            'href',
            '/basics/fn-vs-class-practice',
        );
    });

    it('note 免责声明渲染在导语上方', () => {
        render(
            <TopicNav
                title="「RSC」专题两页联动:"
                links={RSC_NAV_LINKS}
                current="/advanced/rsc-guide"
                category="advanced"
                note="没有 RSC 运行时"
            />,
        );
        expect(screen.getByText(/没有 RSC 运行时/)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: '边界示意' })).toHaveAttribute(
            'href',
            '/advanced/rsc-boundary',
        );
    });
});

describe('TopicNav 互链目录防漂移', () => {
    it('每个 to 都存在于专题注册表', () => {
        const registered = new Set(TOPICS.map((t) => t.path));
        ALL_NAV_LINKS.forEach((links) => {
            links.forEach((link) => {
                expect(registered.has(link.to)).toBe(true);
            });
        });
    });

    it('目录内路径不重复', () => {
        ALL_NAV_LINKS.forEach((links) => {
            const paths = links.map((l) => l.to);
            expect(new Set(paths).size).toBe(paths.length);
        });
    });
});
