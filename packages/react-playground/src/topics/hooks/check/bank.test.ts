/**
 * @file bank.test.ts
 * @description Hooks 理解检验的题量和结构。
 */

import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { assertCheckBank } from '../../../components/check/assertCheck';
import { TOPICS } from '../../../config/topics';
import HooksCheckPage from './index';
import { HOOKS_GROUPS } from './bank';

describe('Hooks 理解检验', () => {
    it('不少于五十题,较难题带考察点,链接都指向已注册专题', () => {
        assertCheckBank(HOOKS_GROUPS, 50);
        const hard = HOOKS_GROUPS.flatMap((group) => group.questions).filter(
            (question) => (question.difficulty ?? 0) >= 4,
        );
        expect(hard.length).toBeGreaterThan(0);
        const registered = new Set(TOPICS.map((topic) => topic.path));
        for (const question of HOOKS_GROUPS.flatMap((group) => group.questions)) {
            for (const link of question.related ?? []) {
                expect(registered.has(link.to)).toBe(true);
            }
        }
    });

    it('页面露出要点和考察点', () => {
        render(createElement(MemoryRouter, null, createElement(HooksCheckPage)));
        expect(screen.getByRole('heading', { level: 1, name: 'Hooks · 理解检验' })).toBeInTheDocument();
        expect(screen.getAllByText('要点').length).toBeGreaterThanOrEqual(50);
        expect(screen.getAllByText(/考察点:/).length).toBeGreaterThan(0);
    });
});
