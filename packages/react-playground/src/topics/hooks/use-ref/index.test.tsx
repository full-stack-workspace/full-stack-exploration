/**
 * @file topics/hooks/use-ref/index.test.tsx
 *
 * @description useRef 专题:改 current 不触发渲染;盒子可跨渲染保存 DOM / 最新值。
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

import UseRefTopic from './index';

function renderTopic() {
    return render(
        <MemoryRouter>
            <UseRefTopic />
        </MemoryRouter>,
    );
}

describe('useRef 专题', () => {
    it('渲染机制标题与对照说明', () => {
        renderTopic();
        expect(screen.getByRole('heading', { name: 'useRef' })).toBeInTheDocument();
        expect(screen.getByText('首次渲染:创建一个盒子')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: '和 useState 的完整对比' })).toBeInTheDocument();
    });

    it('改 ref.current 屏幕仍停在旧值,要等另一次渲染才读到新盒子', async () => {
        const user = userEvent.setup();
        renderTopic();

        expect(screen.getByTestId('state-screen-value')).toHaveTextContent('0');
        expect(screen.getByTestId('ref-screen-value')).toHaveTextContent('0');

        await user.click(screen.getByRole('button', { name: 'ref.current +1' }));
        await user.click(screen.getByRole('button', { name: 'ref.current +1' }));

        expect(screen.getByTestId('ref-screen-value')).toHaveTextContent('0');
        expect(screen.getByTestId('state-screen-value')).toHaveTextContent('0');

        await user.click(screen.getByRole('button', { name: '无关渲染 +1' }));

        expect(screen.getByTestId('ref-screen-value')).toHaveTextContent('2');
        expect(screen.getByTestId('state-screen-value')).toHaveTextContent('0');
    });

    it('setState 会立刻把新快照画到屏幕上', async () => {
        const user = userEvent.setup();
        renderTopic();

        await user.click(screen.getByRole('button', { name: 'state +1' }));

        expect(screen.getByTestId('state-screen-value')).toHaveTextContent('1');
    });

    it('点击聚焦按钮后输入框获得焦点', async () => {
        const user = userEvent.setup();
        renderTopic();

        const input = screen.getByTestId('focus-input');
        expect(input).not.toHaveFocus();

        await user.click(screen.getByRole('button', { name: '聚焦输入框' }));

        expect(input).toHaveFocus();
    });

    it('记住上一次渲染的值:当前 +1 后,上一次停在旧快照', async () => {
        const user = userEvent.setup();
        renderTopic();

        expect(screen.getByTestId('previous-probe')).toHaveTextContent(/当前 0/);
        expect(screen.getByTestId('previous-probe')).toHaveTextContent(/上一次 —/);

        await user.click(screen.getByRole('button', { name: '上一次场景 +1' }));

        expect(screen.getByTestId('previous-probe')).toHaveTextContent(/当前 1/);
        expect(screen.getByTestId('previous-probe')).toHaveTextContent(/上一次 0/);
    });
});

describe('useRef 专题 · 延迟读取', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('超时回调里闭包仍是点击时的 count,ref 读到之后改过的最新值', () => {
        renderTopic();

        fireEvent.click(screen.getByRole('button', { name: '延迟场景 count +1' }));
        fireEvent.click(screen.getByRole('button', { name: '1.5 秒后读闭包' }));
        fireEvent.click(screen.getByRole('button', { name: '1.5 秒后读 ref' }));
        fireEvent.click(screen.getByRole('button', { name: '延迟场景 count +1' }));

        act(() => {
            vi.advanceTimersByTime(1500);
        });

        const log = screen.getByTestId('latest-log').textContent ?? '';
        expect(log).toContain('闭包读到 1');
        expect(log).toContain('ref 读到 2');
    });
});
