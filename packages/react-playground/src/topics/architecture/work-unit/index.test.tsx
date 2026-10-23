import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import WorkUnitPage from './index';

describe('工作单元', () => {
    it('说明进度记在节点上，并把遍历留给 Fiber 页', () => {
        render(
            <MemoryRouter>
                <WorkUnitPage />
            </MemoryRouter>,
        );
        expect(screen.getByRole('heading', { name: '原理与架构 · 工作单元' })).toBeInTheDocument();
        expect(screen.getByText(/React Element 是这一次 render 返回的描述/)).toBeInTheDocument();
        const fiberLinks = screen.getAllByRole('link', { name: 'Fiber' });
        expect(fiberLinks.length).toBeGreaterThan(0);
        for (const link of fiberLinks) {
            expect(link).toHaveAttribute('href', '/architecture/fiber');
        }
        expect(screen.queryByRole('button', { name: '下一步' })).not.toBeInTheDocument();
    });
});
