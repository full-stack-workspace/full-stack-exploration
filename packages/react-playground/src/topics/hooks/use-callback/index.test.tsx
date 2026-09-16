/**
 * @file topics/hooks/use-callback/index.test.tsx
 *
 * @description useCallback 专题:memo 子组件只在回调身份变化时重渲染。
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

import UseCallbackTopic from './index';

function renderTopic() {
    return render(
        <MemoryRouter>
            <UseCallbackTopic />
        </MemoryRouter>,
    );
}

describe('useCallback 专题', () => {
    it('渲染机制标题与对照说明', () => {
        renderTopic();
        expect(screen.getByRole('heading', { name: 'useCallback' })).toBeInTheDocument();
        expect(screen.getByText(/useCallback\(fn, deps\) ≡ useMemo\(\(\) => fn, deps\)/)).toBeInTheDocument();
    });

    it('无关状态变化时,内联回调会拖着 memo 子组件重渲染,稳定回调不会', async () => {
        const user = userEvent.setup();
        renderTopic();

        expect(screen.getByText(/内联回调 · 渲染 1 次/)).toBeInTheDocument();
        expect(screen.getByText(/稳定回调 · 渲染 1 次/)).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: '父组件无关状态 +1' }));

        expect(screen.getByText(/内联回调 · 渲染 2 次/)).toBeInTheDocument();
        expect(screen.getByText(/稳定回调 · 渲染 1 次/)).toBeInTheDocument();
    });
});
