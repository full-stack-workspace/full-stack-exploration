/**
 * ============================================================================
 * bank.test.ts — 题库规模与结构
 * ============================================================================
 *
 * 锁住「至少五十道、每题有要点和展开、锚点不重复」。
 *
 * @module topics/architecture/check/bank.test
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

    it('设计判断排在最前，结论和回链与设计说明一致', () => {
        expect(QUESTION_COUNT).toBe(64);
        const design = NUMBERED_GROUPS[0];
        expect(design.id).toBe('g-design');
        expect(design.questions.map((question) => question.id)).toEqual([
            'q-design-screen',
            'q-design-progress',
            'q-design-priority',
            'q-design-discard',
        ]);
        expect(design.questions[0].number).toBe(1);
        expect(design.questions[0].points.join(' ')).toContain(
            '屏幕上那棵是 current。渲染发生在 workInProgress 上，渲染可以中断或整段丢掉',
        );
        expect(design.questions[0].related).toEqual([{ to: '/architecture/double-buffer', label: '双缓冲' }]);
        expect(design.questions[1].points.join(' ')).toContain(
            '子、兄弟、父和待处理的更新记在 Fiber 上，循环每一步都能从节点接着做',
        );
        expect(design.questions[1].related?.[0].to).toBe('/architecture/work-unit');
        expect(design.questions[2].points.join(' ')).toContain('Lane 挡住「不该进入这一轮的更新混进来」');
        expect(design.questions[2].points.join(' ')).toContain('Scheduler 挡住「这一轮算完才把主线程还回去」');
        expect(design.questions[2].related?.[0].to).toBe('/architecture/scheduler');
        expect(design.questions[3].points.join(' ')).toContain('丢弃的是尚未发布的那一棵。current 要到 Commit 才切换');
        expect(design.questions[3].related?.[0].to).toBe('/architecture/double-buffer');
        const allRelated = NUMBERED_GROUPS.flatMap((group) =>
            group.questions.flatMap((question) => question.related?.map((link) => link.to) ?? []),
        );
        expect(allRelated.some((to) => to.startsWith('/internals/'))).toBe(false);
    });
});
