/**
 * ============================================================================
 * bank.test.ts — 题库规模与结构
 * ============================================================================
 *
 * 锁住「至少五十道、每题有要点和展开、锚点不重复」。
 *
 * @module topics/internals/interview/bank.test
 */

import { describe, expect, it } from 'vitest';

import { NUMBERED_GROUPS, QUESTION_COUNT } from './bank';

describe('内部机制理解检验', () => {
    it('至少五十道,且序号连续', () => {
        expect(QUESTION_COUNT).toBeGreaterThanOrEqual(50);
        const numbers = NUMBERED_GROUPS.flatMap((group) => group.questions.map((question) => question.number));
        expect(numbers).toEqual(Array.from({ length: QUESTION_COUNT }, (_, index) => index + 1));
    });

    it('锚点唯一,每题至少三条要点和两段展开', () => {
        const ids = NUMBERED_GROUPS.flatMap((group) => group.questions.map((question) => question.id));
        expect(new Set(ids).size).toBe(ids.length);
        for (const group of NUMBERED_GROUPS) {
            for (const question of group.questions) {
                expect(question.points.length).toBeGreaterThanOrEqual(3);
                expect(question.body.length).toBeGreaterThanOrEqual(2);
            }
        }
    });
});
