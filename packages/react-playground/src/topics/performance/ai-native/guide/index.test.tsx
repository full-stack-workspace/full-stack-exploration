/**
 * @file index.test.tsx
 *
 * @description 金字塔页声明 TTFUI 北极星,并链到流式演练。
 */

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import AiNativeGuide from './index';

describe('AI-Native · 指标金字塔', () => {
    it('强调快但错不如慢但对,并链到流式演练', () => {
        render(
            <MemoryRouter>
                <AiNativeGuide />
            </MemoryRouter>,
        );
        expect(screen.getByRole('heading', { name: 'AI-Native · 指标金字塔' })).toBeInTheDocument();
        expect(screen.getByText(/快但错不如慢但对/)).toBeInTheDocument();
        expect(screen.getAllByRole('link', { name: '流式体验演练' })[0]).toHaveAttribute(
            'href',
            '/performance/ai-native-lab',
        );
    });
});
