/**
 * @file index.test.tsx
 *
 * @description 边界示意:默认成立;把购物车改成 Server 后出现事件限制。
 */

import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import RscBoundary from './index';

describe('RSC · 边界示意', () => {
    it('默认切分成立,购物车改成 Server 后指出无法响应点击', () => {
        render(
            <MemoryRouter>
                <RscBoundary />
            </MemoryRouter>,
        );
        expect(screen.getByRole('heading', { name: 'RSC · 边界示意' })).toBeInTheDocument();
        expect(screen.getByText(/这条边界在支持 RSC 的框架里成立/)).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: '加入购物车·服务端' }));
        expect(screen.getByText(/加入购物车标成了 Server/)).toBeInTheDocument();
    });
});
