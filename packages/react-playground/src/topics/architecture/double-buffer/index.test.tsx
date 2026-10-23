import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import DoubleBufferPage from './index';

describe('双缓冲', () => {
    it('写死屏幕上永远是完整的树，并把三个子阶段链到 Commit', () => {
        render(
            <MemoryRouter>
                <DoubleBufferPage />
            </MemoryRouter>,
        );
        expect(screen.getByRole('heading', { name: '原理与架构 · 双缓冲' })).toBeInTheDocument();
        expect(screen.getByText('用户任何时候看到的都是一棵完整的树')).toBeInTheDocument();
        const commitLinks = screen.getAllByRole('link', { name: 'Commit' });
        expect(commitLinks.length).toBeGreaterThan(0);
        for (const link of commitLinks) {
            expect(link).toHaveAttribute('href', '/architecture/commit');
        }
        expect(screen.queryByText('mutation')).not.toBeInTheDocument();
    });
});
