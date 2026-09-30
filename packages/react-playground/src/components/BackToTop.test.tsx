/**
 * @file BackToTop.test.tsx
 *
 * @description 回到顶部按钮:滚动阈值显隐、点击平滑回顶、reduced-motion 时直接跳转。
 * 按钮隐藏时带 aria-hidden(会脱离可访问树),查询一律走 getByLabelText 而非 getByRole。
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import BackToTop from './BackToTop';

const TARGET_ID = 'main-content';

/** 渲染滚动容器 + 按钮;jsdom 未实现 scrollTo,逐个容器打桩 */
function renderWithContainer() {
    const utils = render(
        <div>
            <div id={TARGET_ID} data-testid="scroll-container" />
            <BackToTop />
        </div>,
    );
    const container = screen.getByTestId('scroll-container');
    container.scrollTo = vi.fn();
    return { ...utils, container };
}

/** 模拟容器滚动到指定位置并派发 scroll 事件 */
function scrollTo(container: HTMLElement, top: number) {
    container.scrollTop = top;
    fireEvent.scroll(container);
}

describe('BackToTop', () => {
    it('未滚动时按钮不可见且移出 Tab 序', () => {
        renderWithContainer();
        const button = screen.getByLabelText('回到顶部');
        expect(button).toHaveAttribute('aria-hidden', 'true');
        expect(button).toHaveAttribute('tabIndex', '-1');
    });

    it('滚动超过阈值后出现,滚回阈值内再次隐藏', () => {
        const { container } = renderWithContainer();
        const button = screen.getByLabelText('回到顶部');

        scrollTo(container, 500);
        expect(button).toHaveAttribute('aria-hidden', 'false');
        expect(button).toHaveAttribute('tabIndex', '0');

        scrollTo(container, 100);
        expect(button).toHaveAttribute('aria-hidden', 'true');
    });

    it('点击后平滑滚回容器顶部', () => {
        const { container } = renderWithContainer();
        scrollTo(container, 500);
        fireEvent.click(screen.getByLabelText('回到顶部'));
        expect(container.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });

    it('prefers-reduced-motion 用户直接跳转,不做平滑滚动', () => {
        const matchMediaSpy = vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
            matches: query === '(prefers-reduced-motion: reduce)',
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }));
        const { container } = renderWithContainer();
        scrollTo(container, 500);
        fireEvent.click(screen.getByLabelText('回到顶部'));
        expect(container.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
        matchMediaSpy.mockRestore();
    });
});
