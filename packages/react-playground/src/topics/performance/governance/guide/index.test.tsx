/**
 * @file index.test.tsx
 *
 * @description 原则页给出三目标,并链到指标实验室。
 */

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import GovernanceGuide from './index';

function renderGuide() {
    return render(
        <MemoryRouter>
            <GovernanceGuide />
        </MemoryRouter>,
    );
}

describe('性能治理 · 原则与约定', () => {
    it('给出三目标和五原则,并链到指标实验室', () => {
        renderGuide();
        expect(screen.getByRole('heading', { name: '性能治理 · 原则与约定' })).toBeInTheDocument();
        expect(screen.getByText('尽早可用')).toBeInTheDocument();
        expect(screen.getByText('及时响应')).toBeInTheDocument();
        expect(screen.getByText('成本可控')).toBeInTheDocument();
        expect(screen.getByLabelText('首次可用的定义')).toHaveValue('搜索框可操作,首批结果和关键图片可见');
        expect(screen.getAllByRole('link', { name: '指标实验室' })[0]).toHaveAttribute(
            'href',
            '/performance/metrics-lab',
        );
    });
});
