/**
 * @file index.test.tsx
 *
 * @description Agent 工具链在假时钟下能拆出 TTFT 与更晚的 TTFUI。
 */

import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import AgentLab from './index';

describe('AI-Native · Agent 工具链演练', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('串行跑完后 TTFUI 晚于 TTFT,并强调快但错', () => {
        render(
            <MemoryRouter>
                <AgentLab />
            </MemoryRouter>,
        );
        expect(screen.getByRole('heading', { name: 'AI-Native · Agent 工具链演练' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /快但错会把/ })).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: '发起任务' }));
        act(() => {
            vi.advanceTimersByTime(4000);
        });
        const ttft = screen.getByText('TTFT').parentElement;
        const ttfui = screen.getByText('TTFUI').parentElement;
        expect(ttft).not.toHaveTextContent('—');
        expect(ttfui).not.toHaveTextContent('—');
        const ttftMs = Number((ttft?.textContent ?? '').replace(/[^\d]/g, ''));
        const ttfuiMs = Number((ttfui?.textContent ?? '').replace(/[^\d]/g, ''));
        expect(ttfuiMs).toBeGreaterThan(ttftMs);
    });
});
