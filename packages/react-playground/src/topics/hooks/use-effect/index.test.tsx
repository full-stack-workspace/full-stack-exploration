/**
 * @file topics/hooks/use-effect/index.test.tsx
 *
 * @description useEffect 专题:依赖变化时先跑上一轮 cleanup,再跑新 setup。
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

import UseEffectTopic from './index';

function renderTopic() {
    return render(
        <MemoryRouter>
            <UseEffectTopic />
        </MemoryRouter>,
    );
}

describe('useEffect 专题', () => {
    it('渲染更新时 cleanup 的链路说明', () => {
        renderTopic();
        expect(screen.getByRole('heading', { name: 'useEffect' })).toBeInTheDocument();
        expect(
            screen.getByRole('heading', { name: '更新时:先跑上一次 return 的函数,再跑新的 setup' }),
        ).toBeInTheDocument();
    });

    it('count 变化时先跑上一轮 cleanup,且闭包仍是旧值', async () => {
        const user = userEvent.setup();
        renderTopic();

        expect(screen.getByText('setup #1 · 闭包 count=0')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'count +1' }));

        const effectLines = screen
            .getByTestId('deps-probe-log')
            .querySelectorAll('li');
        const texts = Array.from(effectLines).map((item) => item.textContent ?? '');
        expect(texts.join('\n')).toContain('cleanup #1 · 闭包 count=0');
        expect(texts.join('\n')).toContain('setup #2 · 闭包 count=1');

        const cleanupAt = texts.findIndex((line) => line.includes('cleanup #1'));
        const setupAt = texts.findIndex((line) => line.includes('setup #2'));
        expect(cleanupAt).toBeGreaterThanOrEqual(0);
        expect(setupAt).toBeGreaterThan(cleanupAt);
    });
});
