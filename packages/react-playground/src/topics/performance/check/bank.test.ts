/**
 * @file bank.test.ts
 * @description 性能优化理解检验的题量和结构。
 */

import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { assertCheckBank } from '../../../components/check/assertCheck';
import { TOPICS } from '../../../config/topics';
import PerformanceCheckPage from './index';
import { PERFORMANCE_GROUPS } from './bank';

describe('性能优化理解检验', () => {
    it('不少于四十题,资深题带考察点,并覆盖治理与 AI-Native', () => {
        assertCheckBank(PERFORMANCE_GROUPS, 40);
        expect(PERFORMANCE_GROUPS.map((group) => group.title)).toEqual(
            expect.arrayContaining(['治理体系', 'AI-Native']),
        );
        const senior = PERFORMANCE_GROUPS.flatMap((group) => group.questions).filter(
            (question) => question.difficulty === 5,
        );
        expect(senior.length).toBeGreaterThan(0);
        const registered = new Set(TOPICS.map((topic) => topic.path));
        for (const question of PERFORMANCE_GROUPS.flatMap((group) => group.questions)) {
            for (const link of question.related ?? []) {
                expect(registered.has(link.to)).toBe(true);
            }
        }
    });

    it('页面露出要点、考察点,并标出当前系列', () => {
        render(createElement(MemoryRouter, null, createElement(PerformanceCheckPage)));
        expect(screen.getByRole('heading', { level: 1, name: '性能优化 · 理解检验' })).toBeInTheDocument();
        expect(screen.getAllByText('要点').length).toBeGreaterThanOrEqual(40);
        expect(screen.getAllByText(/考察点:/).length).toBeGreaterThan(0);
        expect(screen.getByRole('navigation', { name: '性能优化系列导航' })).toBeInTheDocument();
    });
});
