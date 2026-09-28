/**
 * @file index.test.tsx
 *
 * @description 流式演练在假时钟下能拆出 TTFT 与 TTFUI。
 */

import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import AiNativeLab from './index';

describe('AI-Native · 流式体验演练', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('发送后能读到 TTFT 与 TTFUI', () => {
        render(
            <MemoryRouter>
                <AiNativeLab />
            </MemoryRouter>,
        );
        expect(screen.getByRole('heading', { name: 'AI-Native · 流式体验演练' })).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: '发送' }));
        act(() => {
            vi.advanceTimersByTime(4000);
        });
        const ttft = screen.getByText('TTFT').parentElement;
        const ttfui = screen.getByText('TTFUI').parentElement;
        expect(ttft).not.toHaveTextContent('—');
        expect(ttfui).not.toHaveTextContent('—');
    });
});
