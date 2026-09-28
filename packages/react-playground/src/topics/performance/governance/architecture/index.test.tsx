/**
 * @file index.test.tsx
 *
 * @description 架构页打开「推荐阻塞主体」后必须出现互挡警告。
 */

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import ArchitectureGuide from './index';

describe('性能治理 · 架构关键路径', () => {
    it('打开推荐阻塞后写出互挡结论', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <ArchitectureGuide />
            </MemoryRouter>,
        );
        expect(screen.getByRole('heading', { name: '性能治理 · 架构关键路径' })).toBeInTheDocument();
        await user.click(screen.getByRole('switch', { name: '推荐阻塞商品主体' }));
        expect(screen.getByText(/推荐与主体共同等待/)).toBeInTheDocument();
    });
});
