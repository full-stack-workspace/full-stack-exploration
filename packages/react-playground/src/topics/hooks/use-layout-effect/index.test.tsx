/**
 * @file topics/hooks/use-layout-effect/index.test.tsx
 *
 * @description useLayoutEffect 专题:更新时 layout cleanup 先于新 setup,且发生在 Paint 前。
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

import UseLayoutEffectTopic from './index';

function renderTopic() {
    return render(
        <MemoryRouter>
            <UseLayoutEffectTopic />
        </MemoryRouter>,
    );
}

describe('useLayoutEffect 专题', () => {
    it('渲染更新时 cleanup 的链路说明', () => {
        renderTopic();
        expect(screen.getByRole('heading', { name: 'useLayoutEffect' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: '更新时:cleanup 仍在 Paint 之前' })).toBeInTheDocument();
        expect(screen.getByText('跑上一次 useLayoutEffect 的 cleanup')).toBeInTheDocument();
    });

    it('再渲染一次时,上一轮 layout cleanup 出现在新 setup 之前', async () => {
        const user = userEvent.setup();
        renderTopic();

        await user.click(screen.getByRole('button', { name: '再渲染一次' }));

        const timeline = Array.from(screen.getByTestId('layout-order-probe').querySelectorAll('li')).map(
            (item) => item.textContent ?? '',
        );
        let start = 0;
        timeline.forEach((line, index) => {
            if (line.includes('── tick=')) {
                start = index;
            }
        });
        const slice = timeline.slice(start);
        const layoutCleanup = slice.findIndex((line) => line.includes('useLayoutEffect cleanup'));
        const layoutSetup = slice.findIndex((line) => line.includes('执行 useLayoutEffect'));
        const effectCleanup = slice.findIndex((line) => line.includes('useEffect cleanup'));
        const effectSetup = slice.findIndex((line) => line.includes('执行 useEffect'));

        expect(layoutCleanup).toBeGreaterThanOrEqual(0);
        expect(layoutSetup).toBeGreaterThan(layoutCleanup);
        expect(effectCleanup).toBeGreaterThan(layoutSetup);
        expect(effectSetup).toBeGreaterThan(effectCleanup);
    });
});
