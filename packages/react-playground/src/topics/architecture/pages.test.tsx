/**
 * ============================================================================
 * pages.test.tsx — 内部机制九页冒烟
 * ============================================================================
 *
 * 每页能渲染标题,总览页和理解检验页的链接指向已有专题。
 *
 * @module topics/architecture/pages.test
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
import InterviewPage from './check';

function renderPage(Page: ComponentType) {
    return render(
        <MemoryRouter>
            <Page />
        </MemoryRouter>,
    );
}

const PAGES: { name: string; Page: ComponentType }[] = [
    { name: '原理与架构 · 运行时总览', Page: RuntimeMap },
    { name: '原理与架构 · Fiber', Page: FiberPage },
    { name: '原理与架构 · Render', Page: RenderPage },
    { name: '原理与架构 · Commit', Page: CommitPage },
    { name: '原理与架构 · 状态更新', Page: UpdateQueuePage },
    { name: '原理与架构 · Hooks 链表', Page: HooksImplPage },
    { name: '原理与架构 · Scheduler', Page: SchedulerPage },
    { name: '原理与架构 · 事件', Page: EventsPage },
    { name: '原理与架构 · SSR 与水合', Page: SsrPage },
    { name: '原理与架构 · 理解检验', Page: InterviewPage },
];

describe('内部机制页面', () => {
    it.each(PAGES)('渲染 $name', ({ name, Page }) => {
        renderPage(Page);
        expect(screen.getByRole('heading', { name })).toBeInTheDocument();
    });

    it('运行时总览不再充当系列索引', () => {
        renderPage(RuntimeMap);
        expect(screen.queryByRole('link', { name: '列表与 key' })).not.toBeInTheDocument();
        expect(screen.queryByText('/architecture/source/work-loop')).not.toBeInTheDocument();
    });

    it('Render 页先讲可让出可丢弃的循环，再保留比对演示', () => {
        renderPage(RenderPage);
        expect(screen.getByRole('heading', { name: '1. 协调循环可以让出，也可以丢掉' })).toBeInTheDocument();
        expect(screen.getByText(/Render 是推测性的/)).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: '2. 一个工作单元里的向下和向上' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '尾部插入 e' })).toBeInTheDocument();
    });

    it('Fiber 页把栈协调和双缓冲交给前面的架构页', () => {
        renderPage(FiberPage);
        expect(screen.queryByRole('heading', { name: '1. 栈协调器停不下来' })).not.toBeInTheDocument();
        expect(screen.queryByText('alternate 把两棵树的对应节点缝在一起')).not.toBeInTheDocument();
        for (const link of screen.getAllByRole('link', { name: '设计约束' })) {
            expect(link).toHaveAttribute('href', '/architecture/constraints');
        }
        for (const link of screen.getAllByRole('link', { name: '双缓冲' })) {
            expect(link).toHaveAttribute('href', '/architecture/double-buffer');
        }
        expect(screen.getByRole('button', { name: '下一步' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: '1. 三个指针走完整棵树' })).toBeInTheDocument();
    });

    it('Scheduler 写明只留一套优先级会漏掉的失败', () => {
        renderPage(SchedulerPage);
        expect(screen.getByRole('heading', { name: '1. 只留一套会漏掉一种失败' })).toBeInTheDocument();
        expect(screen.getByText(/紧急更新进了这一轮仍可能把帧占满/)).toBeInTheDocument();
        expect(screen.getByText(/不知道该把哪些更新留到下一轮/)).toBeInTheDocument();
        expect(screen.getByText(/后来用 Lane 做挑选/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '走一个工作单元' })).toBeInTheDocument();
    });

    it('运行时总览把两套优先级指到 Scheduler', () => {
        renderPage(RuntimeMap);
        expect(screen.queryByRole('heading', { name: '5. 两套优先级,不要合成一个词' })).not.toBeInTheDocument();
        const links = screen.getAllByRole('link', { name: 'Scheduler' });
        expect(links.length).toBeGreaterThan(0);
        for (const link of links) {
            expect(link).toHaveAttribute('href', '/architecture/scheduler');
        }
    });

    it('理解检验给出要点,并链回 Fiber 与函数组件梳理', () => {
        renderPage(InterviewPage);
        expect(screen.getByText(/64 道问答/)).toBeInTheDocument();
        expect(screen.getAllByText('要点').length).toBeGreaterThanOrEqual(50);
        expect(screen.getByRole('heading', { name: '1. 渲染期间为什么不能改屏幕上那棵树' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: '5. 为什么 React 要用 Fiber 换掉栈协调器？' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: '设计判断' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: '架构与 Fiber' })).toBeInTheDocument();
        expect(screen.getAllByRole('link', { name: 'Fiber' }).length).toBeGreaterThan(0);
        const guideLinks = screen.getAllByRole('link', { name: '函数组件与类组件' });
        expect(guideLinks.length).toBeGreaterThan(0);
        for (const link of guideLinks) {
            expect(link).toHaveAttribute('href', '/basics/fn-vs-class-guide');
        }
    });
});
