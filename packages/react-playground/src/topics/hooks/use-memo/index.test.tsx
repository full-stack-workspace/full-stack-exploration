/**
 * @file topics/hooks/use-memo/index.test.tsx
 *
 * @description useMemo 与 memo 专题:身份配对才能跳过渲染;无关更新不应重算。
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

import UseMemoTopic from './index';

function renderTopic() {
    return render(
        <MemoryRouter>
            <UseMemoTopic />
        </MemoryRouter>,
    );
}

describe('useMemo 与 memo 专题', () => {
    it('渲染机制标题与对照说明', () => {
        renderTopic();
        expect(screen.getByRole('heading', { name: 'useMemo 与 memo' })).toBeInTheDocument();
        expect(screen.getByText('memo 对每个 prop 做 Object.is')).toBeInTheDocument();
        expect(screen.getByText(/useCallback\(fn, deps\) ≡ useMemo\(\(\) => fn, deps\)/)).toBeInTheDocument();
    });

    it('无关状态变化时,只有「memo + 稳定对象」会跳过子组件渲染', async () => {
        const user = userEvent.setup();
        renderTopic();

        expect(screen.getByText(/memo · 内联对象 · 渲染 1 次/)).toBeInTheDocument();
        expect(screen.getByText(/memo · useMemo 对象 · 渲染 1 次/)).toBeInTheDocument();
        expect(screen.getByText(/未 memo · 内联 · 渲染 1 次/)).toBeInTheDocument();
        expect(screen.getByText(/未 memo · useMemo · 渲染 1 次/)).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: '配对场景 · 无关状态 +1' }));

        expect(screen.getByText(/memo · 内联对象 · 渲染 2 次/)).toBeInTheDocument();
        expect(screen.getByText(/memo · useMemo 对象 · 渲染 1 次/)).toBeInTheDocument();
        expect(screen.getByText(/未 memo · 内联 · 渲染 2 次/)).toBeInTheDocument();
        expect(screen.getByText(/未 memo · useMemo · 渲染 2 次/)).toBeInTheDocument();
    });

    it('无关渲染不会让 useMemo 的筛选再跑,内联计算每次都会再跑', async () => {
        const user = userEvent.setup();
        renderTopic();

        expect(screen.getByTestId('eager-compute-count')).toHaveTextContent('1');
        expect(screen.getByTestId('memo-compute-count')).toHaveTextContent('1');

        await user.click(screen.getByRole('button', { name: '计算场景 · 无关状态 +1' }));

        expect(screen.getByTestId('eager-compute-count')).toHaveTextContent('2');
        expect(screen.getByTestId('memo-compute-count')).toHaveTextContent('1');
    });

    it('筛选词变化时,useMemo 也会重新计算', async () => {
        const user = userEvent.setup();
        renderTopic();

        await user.click(screen.getByRole('button', { name: '切换筛选词' }));

        expect(screen.getByTestId('memo-compute-count')).toHaveTextContent('2');
        expect(screen.getByTestId('eager-compute-count')).toHaveTextContent('2');
        expect(screen.getByTestId('memo-filter-result')).toHaveTextContent('vue');
    });
});
