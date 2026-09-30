/**
 * @file index.test.tsx
 *
 * @description 梳理页把 RSC 与 SSR 分开,并链到边界示意。
 */

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import RscGuide from './index';

describe('RSC · 深度梳理', () => {
    it('说明 RSC 不是 SSR,并链到边界示意', () => {
        render(
            <MemoryRouter>
                <RscGuide />
            </MemoryRouter>,
        );
        expect(screen.getByRole('heading', { name: 'RSC · 深度梳理' })).toBeInTheDocument();
        expect(screen.getByText(/没有 RSC 也能 SSR/)).toBeInTheDocument();
        expect(screen.getByText(/Server Component 不会在点击时于浏览器里再跑一遍/)).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: '6. 生产选型:按顺序问四件事' })).toBeInTheDocument();
        expect(screen.getByText(/重跑的是 Client 子树/)).toBeInTheDocument();
        expect(screen.getByText(/token 被序列化进 RSC 载荷/)).toBeInTheDocument();
        expect(screen.getAllByRole('link', { name: '边界示意' })[0]).toHaveAttribute(
            'href',
            '/advanced/rsc-boundary',
        );
    });
});
