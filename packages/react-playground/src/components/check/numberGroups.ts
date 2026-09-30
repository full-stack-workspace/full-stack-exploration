/**
 * ============================================================================
 * numberGroups — 给理解检验题连续编号
 * ============================================================================
 *
 * @module components/check/numberGroups
 */

import type { CheckGroup, NumberedGroup } from './types';

export function numberGroups(groups: readonly CheckGroup[]): readonly NumberedGroup[] {
    let number = 0;
    return groups.map((group) => ({
        ...group,
        questions: group.questions.map((question) => {
            number += 1;
            return { ...question, number };
        }),
    }));
}

export function countQuestions(groups: readonly NumberedGroup[]): number {
    return groups.reduce((sum, group) => sum + group.questions.length, 0);
}
