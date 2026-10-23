/**
 * ============================================================================
 * design — 设计判断四题
 * ============================================================================
 *
 * 先问为什么必须长成这样,再回到后面的机制题。
 *
 * @module topics/architecture/check/bank/design
 */

import type { InterviewQuestion } from './types';

export const DESIGN: readonly InterviewQuestion[] = [
    {
        id: 'q-design-screen',
        toc: '屏幕上的树',
        title: '渲染期间为什么不能改屏幕上那棵树',
        note: '先分清正在算的树和已经发布的树。',
        points: [
            '屏幕上那棵是 current。渲染发生在 workInProgress 上，渲染可以中断或整段丢掉',
            '边算边改屏幕，中断时用户会看到写了一半的界面',
            '发布发生在 Commit，而不是 Render 的中途',
        ],
        body: [
            '渲染可以停下来，也可以整段重来。如果 Render 直接改屏幕上的节点，停在中间时用户看到的就不是一棵完整的树。',
            '所以屏幕上那棵是 current。渲染发生在 workInProgress 上，渲染可以中断或整段丢掉。指针切换留到 Commit。',
        ],
        related: [{ to: '/architecture/double-buffer', label: '双缓冲' }],
    },
    {
        id: 'q-design-progress',
        toc: '进度在节点上',
        title: '进度为什么记在节点上，调用栈清空还能继续',
        note: '暂停点必须是 React 自己拿得住的数据。',
        points: [
            '子、兄弟、父和待处理的更新记在 Fiber 上，循环每一步都能从节点接着做',
            'JavaScript 调用栈不属于 React，中途返回就丢了走到哪',
            '记在节点上是为了能停，不是为了让总计算量变少',
        ],
        body: [
            '栈协调器把进度压在调用栈里。调用栈不返回，React 就没有一个自己的字段可以写下「下次从这里继续」。',
            '子、兄弟、父和待处理的更新记在 Fiber 上，循环每一步都能从节点接着做。调用栈清空之后，下一个工作单元的引用还在。',
        ],
        related: [{ to: '/architecture/work-unit', label: '工作单元' }],
    },
    {
        id: 'q-design-priority',
        toc: '两套优先级',
        title: 'Lane 和 Scheduler 各挡住哪一种失败',
        note: '一个词盖不住「算谁」和「何时让出」。',
        points: [
            'Lane 挡住「不该进入这一轮的更新混进来」；Scheduler 挡住「这一轮算完才把主线程还回去」',
            '只留 Lane 时，紧急更新进了这一轮仍可能把帧占满',
            '只留 Scheduler 时，不知道该把哪些更新留到下一轮',
        ],
        body: [
            'Lane 决定哪些更新进入这一轮。Scheduler 决定这一轮什么时候把主线程还回去。',
            'Lane 挡住「不该进入这一轮的更新混进来」；Scheduler 挡住「这一轮算完才把主线程还回去」。少掉任何一套，都会漏掉一种已经能说清的失败。',
        ],
        related: [{ to: '/architecture/scheduler', label: 'Scheduler' }],
    },
    {
        id: 'q-design-discard',
        toc: '丢掉未发布的树',
        title: '丢掉 workInProgress 之后，屏幕上为什么还是上一棵完整的树',
        note: '丢掉的是副本，不是屏幕。',
        points: [
            '丢弃的是尚未发布的那一棵。current 要到 Commit 才切换',
            'workInProgress 可以因为让出或更高优先级而整段作废',
            '用户看到的树在切换指针之前保持不变',
        ],
        body: [
            '更高优先级进来，或这一轮决定重算时，React 可以丢掉正在填的副本。',
            '丢弃的是尚未发布的那一棵。current 要到 Commit 才切换。所以屏幕上仍是上一棵完整的树。',
        ],
        related: [{ to: '/architecture/double-buffer', label: '双缓冲' }],
    },
];
