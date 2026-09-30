/**
 * ============================================================================
 * index.test.tsx — 组件通信决策梳理页
 * ============================================================================
 *
 * 冒烟:页头、四问、通道梯子与跳转卡片能渲染。
 *
 * @module topics/advanced/component-comm/guide/index.test
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import ComponentCommGuide from './index';

function renderGuide() {
    return render(
        <MemoryRouter>
            <ComponentCommGuide />
        </MemoryRouter>,
    );
}

describe('组件通信 · 决策梳理', () => {
    it('渲染决策四问与已有专题跳转', () => {
        renderGuide();
        expect(screen.getByRole('heading', { name: '组件通信 · 决策梳理' })).toBeInTheDocument();
        expect(screen.getByText('数据归谁?')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Context API' })).toHaveAttribute(
            'href',
            '/advanced/context',
        );
        expect(screen.getByRole('link', { name: 'useSyncExternalStore 深入梳理' })).toHaveAttribute(
            'href',
            '/agent/use-sync-external-store',
        );
    });
});
