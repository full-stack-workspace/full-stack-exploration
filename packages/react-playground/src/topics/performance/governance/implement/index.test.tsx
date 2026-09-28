/**
 * @file index.test.tsx
 *
 * @description 实现页对照所有权与列表规模,并链到渲染调度演练。
 */

import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import ImplementLab from './index';

describe('性能治理 · 实现六规则', () => {
    it('单一所有权不再展示 Store 副本数字', () => {
        render(
            <MemoryRouter>
                <ImplementLab />
            </MemoryRouter>,
        );
        expect(screen.getByRole('heading', { name: '性能治理 · 实现六规则' })).toBeInTheDocument();
        fireEvent.click(screen.getByText('单一所有权'));
        expect(screen.getByText(/全局 Store 副本: 不存放/)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'transition × deferred 演练' })).toHaveAttribute(
            'href',
            '/performance/transition-deferred',
        );
    });

    it('窗口化把 DOM 节点从 400 降到 12', () => {
        render(
            <MemoryRouter>
                <ImplementLab />
            </MemoryRouter>,
        );
        expect(screen.getByText(/当前 DOM 节点 400/)).toBeInTheDocument();
        fireEvent.click(screen.getByText('只挂可视 12 条'));
        expect(screen.getByText(/当前 DOM 节点 12/)).toBeInTheDocument();
    });
});
