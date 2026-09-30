/**
 * ============================================================================
 * index — 七组题库与连续序号
 * ============================================================================
 *
 * 序号在这里一次性编好,页面和测试都读 QUESTION_COUNT,避免目录和正文各数一遍。
 *
 * @module topics/internals/interview/bank
 */

import { ARCHITECTURE } from './architecture';
import { COMMIT } from './commit';
import { EVENTS } from './events';
import { MODEL } from './model';
import { RENDER } from './render';
import { SCHEDULER } from './scheduler';
import { STATE } from './state';
import type { InterviewGroup, NumberedGroup } from './types';

export const INTERVIEW_GROUPS: readonly InterviewGroup[] = [
    {
        id: 'g-arch',
        title: '架构与 Fiber',
        blurb: '三个包、两种树、三根指针。先能把一次更新放进这张图,再往下拆阶段。',
        questions: ARCHITECTURE,
    },
    {
        id: 'g-render',
        title: 'Render 与 Diff',
        blurb: '向下决定孩子,向上收标记。线性 Diff 是启发式,不是编辑距离。',
        questions: RENDER,
    },
    {
        id: 'g-commit',
        title: 'Commit',
        blurb: '唯一改屏幕的一段。绘制夹在 layout 和 passive 之间。',
        questions: COMMIT,
    },
    {
        id: 'g-state',
        title: '状态与 Hooks',
        blurb: '更新先入环,渲染时再归约。Hook 的身份是调用序号。',
        questions: STATE,
    },
    {
        id: 'g-sched',
        title: '调度与并发',
        blurb: 'Lane 决定这一轮算谁,Scheduler 决定何时占用主线程。',
        questions: SCHEDULER,
    },
    {
        id: 'g-events',
        title: '合成事件',
        blurb: '根上一个监听,沿 Fiber 模拟捕获和冒泡。事件池是 16 的行为。',
        questions: EVENTS,
    },
    {
        id: 'g-model',
        title: 'SSR、水合与组件模型',
        blurb: 'HTML、水合、RSC 各管一段。函数组件合拍的是可重试的渲染。',
        questions: MODEL,
    },
];

function numberGroups(groups: readonly InterviewGroup[]): readonly NumberedGroup[] {
    let number = 0;
    return groups.map((group) => ({
        ...group,
        questions: group.questions.map((question) => {
            number += 1;
            return { ...question, number };
        }),
    }));
}

export const NUMBERED_GROUPS = numberGroups(INTERVIEW_GROUPS);

export const QUESTION_COUNT = NUMBERED_GROUPS.reduce((sum, group) => sum + group.questions.length, 0);
