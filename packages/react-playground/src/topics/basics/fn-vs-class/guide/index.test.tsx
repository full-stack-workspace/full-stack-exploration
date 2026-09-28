/**
 * ============================================================================
 * index.test.tsx — 函数组件与类组件范式梳理页
 * ============================================================================
 *
 * 冒烟:页头、对照表关键句与已有专题跳转能渲染。
 *
 * @module topics/basics/fn-vs-class/guide/index.test
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import FnVsClassGuide from './index';

function renderGuide() {
    return render(
        <MemoryRouter>
            <FnVsClassGuide />
        </MemoryRouter>,
    );
}

describe('函数组件与类组件 · 范式梳理', () => {
    it('渲染新模型要点与错误边界跳转', () => {
        renderGuide();
        expect(screen.getByRole('heading', { name: '函数组件与类组件 · 范式梳理' })).toBeInTheDocument();
        expect(screen.getByText('一次渲染 = 一次计算')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Error Boundary' })).toHaveAttribute(
            'href',
            '/topics/advanced/error-boundary',
        );
        expect(screen.getByRole('link', { name: 'useState' })).toHaveAttribute('href', '/topics/hooks/use-state');
    });
});
