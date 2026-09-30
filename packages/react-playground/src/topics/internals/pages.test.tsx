/**
 * ============================================================================
 * pages.test.tsx — 内部机制九页冒烟
 * ============================================================================
 *
 * 每页能渲染标题,总览页和理解检验页的链接指向已有专题。
 *
 * @module topics/internals/pages.test
 */

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ComponentType } from 'react';

import RuntimeMap from './runtime-map';
import FiberPage from './fiber';
import RenderPage from './render';
import CommitPage from './commit';
import UpdateQueuePage from './update-queue';
import HooksImplPage from './hooks-impl';
import SchedulerPage from './scheduler';
import EventsPage from './events';
import SsrPage from './ssr';
import InterviewPage from './interview';

function renderPage(Page: ComponentType) {
    return render(
        <MemoryRouter>
            <Page />
        </MemoryRouter>,
    );
}

const PAGES: { name: string; Page: ComponentType }[] = [
    { name: '内部机制 · 运行时总览', Page: RuntimeMap },
    { name: '内部机制 · Fiber', Page: FiberPage },
    { name: '内部机制 · Render', Page: RenderPage },
    { name: '内部机制 · Commit', Page: CommitPage },
    { name: '内部机制 · 状态更新', Page: UpdateQueuePage },
    { name: '内部机制 · Hooks 链表', Page: HooksImplPage },
    { name: '内部机制 · Scheduler', Page: SchedulerPage },
    { name: '内部机制 · 事件', Page: EventsPage },
    { name: '内部机制 · SSR 与水合', Page: SsrPage },
    { name: '内部机制 · 理解检验', Page: InterviewPage },
];

describe('内部机制页面', () => {
    it.each(PAGES)('渲染 $name', ({ name, Page }) => {
        renderPage(Page);
        expect(screen.getByRole('heading', { name })).toBeInTheDocument();
    });

    it('总览页链到列表、事件、调度演练和 RSC', () => {
        renderPage(RuntimeMap);
        expect(screen.getByRole('link', { name: '列表与 key' })).toHaveAttribute('href', '/basics/list-key');
        expect(screen.getByRole('link', { name: '事件与合成事件' })).toHaveAttribute('href', '/basics/event');
        expect(screen.getByRole('link', { name: 'useTransition × useDeferredValue' })).toHaveAttribute(
            'href',
            '/performance/transition-deferred',
        );
        expect(screen.getByRole('link', { name: 'RSC · 深度梳理' })).toHaveAttribute(
            'href',
            '/advanced/rsc-guide',
        );
    });

    it('理解检验给出要点,并链回 Fiber 与函数组件梳理', () => {
        renderPage(InterviewPage);
        expect(screen.getAllByText('要点').length).toBeGreaterThanOrEqual(50);
        expect(screen.getByRole('heading', { name: '1. 为什么 React 要用 Fiber 换掉栈协调器？' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: '架构与 Fiber' })).toBeInTheDocument();
        expect(screen.getAllByRole('link', { name: 'Fiber' }).length).toBeGreaterThan(0);
        const guideLinks = screen.getAllByRole('link', { name: '函数组件与类组件' });
        expect(guideLinks.length).toBeGreaterThan(0);
        for (const link of guideLinks) {
            expect(link).toHaveAttribute('href', '/basics/fn-vs-class-guide');
        }
    });
});
