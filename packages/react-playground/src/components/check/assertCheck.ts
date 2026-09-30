/**
 * ============================================================================
 * assertCheck — 理解检验题库的结构断言
 * ============================================================================
 *
 * @module components/check/assertCheck
 */

import { expect } from 'vitest';

import type { NumberedGroup } from './types';

export function assertCheckBank(groups: readonly NumberedGroup[], minimum: number): void {
    const questions = groups.flatMap((group) => group.questions);
    expect(questions.length).toBeGreaterThanOrEqual(minimum);
    const numbers = questions.map((question) => question.number);
    expect(numbers).toEqual(Array.from({ length: questions.length }, (_, index) => index + 1));
    const ids = questions.map((question) => question.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const question of questions) {
        expect(question.points.length).toBeGreaterThanOrEqual(3);
        expect(question.body.length).toBeGreaterThanOrEqual(2);
        if (question.difficulty) {
            expect(question.focus && question.focus.length > 0).toBe(true);
        }
    }
}
