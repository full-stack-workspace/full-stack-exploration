/**
 * @file topics/basics/fragment/index.test.tsx
 *
 * @description Fragment 专题:DOM 探针证明 div 包裹会多出一层节点、Fragment 不会,
 * 切换写法后 ul 的直接子节点随之变化。
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import FragmentTopic from './index';

function renderTopic() {
    return render(
        <MemoryRouter>
            <FragmentTopic />
        </MemoryRouter>,
    );
}

describe('Fragment 专题', () => {
    it('Fragment 写法:ul 的直接子节点只有两个 li', () => {
        renderTopic();

        fireEvent.click(screen.getByRole('button', { name: '检查 DOM 结构' }));
        expect(screen.getByText('ul 的直接子节点:[li, li]')).toBeInTheDocument();
    });

    it('切到 div 写法:探针读到多出来的一层 div', () => {
        renderTopic();

        fireEvent.click(screen.getByText('div 包裹'));
        fireEvent.click(screen.getByRole('button', { name: '检查 DOM 结构' }));
        expect(screen.getByText('ul 的直接子节点:[div]')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Fragment 包裹'));
        fireEvent.click(screen.getByRole('button', { name: '检查 DOM 结构' }));
        expect(screen.getByText('ul 的直接子节点:[li, li]')).toBeInTheDocument();
    });
});
