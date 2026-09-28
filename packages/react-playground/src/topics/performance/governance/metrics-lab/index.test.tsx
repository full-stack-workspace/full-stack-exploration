/**
 * @file index.test.tsx
 *
 * @description 指标实验室按场景切换北极星角色。
 */

import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import MetricsLab from './index';

function renderLab() {
    return render(
        <MemoryRouter>
            <MetricsLab />
        </MemoryRouter>,
    );
}

describe('性能治理 · 指标实验室', () => {
    it('默认商品搜索里 LCP 是北极星', () => {
        renderLab();
        expect(screen.getByRole('heading', { name: '性能治理 · 指标实验室' })).toBeInTheDocument();
        expect(screen.getAllByText('北极星').length).toBeGreaterThan(0);
        expect(screen.getByText('LCP')).toBeInTheDocument();
    });

    it('切到 AI 对话后 TTFUI 成为北极星', () => {
        renderLab();
        fireEvent.click(screen.getByText('AI 对话'));
        const ttfuiRow = screen.getByText('TTFUI').closest('tr');
        expect(ttfuiRow).toHaveTextContent('北极星');
        const lcpRow = screen.getByText('LCP').closest('tr');
        expect(lcpRow).toHaveTextContent('基线入场券');
    });
});
