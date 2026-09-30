/**
 * @file bank.test.ts
 * @description React 基础理解检验的题量和结构。
 */

import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { assertCheckBank } from '../../../components/check/assertCheck';
import { TOPICS } from '../../../config/topics';
import BasicsCheckPage from './index';
import { BASICS_GROUPS } from './bank';

describe('React 基础理解检验', () => {
    it('题量、编号和星级题的考察点齐全,并链回已注册专题', () => {
        assertCheckBank(BASICS_GROUPS, 20);
        expect(BASICS_GROUPS.map((group) => group.title)).toEqual(
            expect.arrayContaining(['事件', '函数组件与类组件', 'RSC']),
        );
        const hard = BASICS_GROUPS.flatMap((group) => group.questions).filter(
            (question) => (question.difficulty ?? 0) >= 4,
        );
        expect(hard.length).toBeGreaterThan(0);
        const registered = new Set(TOPICS.map((topic) => topic.path));
        for (const question of BASICS_GROUPS.flatMap((group) => group.questions)) {
            for (const link of question.related ?? []) {
                expect(registered.has(link.to)).toBe(true);
            }
        }
    });

    it('页面露出要点,星级题同时露出考察点', () => {
        render(createElement(MemoryRouter, null, createElement(BasicsCheckPage)));
        expect(screen.getByRole('heading', { level: 1, name: 'React 基础 · 理解检验' })).toBeInTheDocument();
        expect(screen.getAllByText('要点').length).toBeGreaterThanOrEqual(20);
        expect(screen.getAllByText(/考察点:/).length).toBeGreaterThan(0);
    });
});
