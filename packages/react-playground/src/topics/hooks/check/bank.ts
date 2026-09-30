/**
 * ============================================================================
 * bank — Hooks 理解检验
 * ============================================================================
 *
 * @module topics/hooks/check/bank
 */

import { countQuestions, numberGroups } from '../../../components/check/numberGroups';
import type { CheckGroup } from '../../../components/check/types';
import { REDUCER_QUESTIONS, REF_QUESTIONS, STATE_QUESTIONS } from './core';
import { CONCURRENT_QUESTIONS, CUSTOM_QUESTIONS, EFFECT_QUESTIONS, LAYOUT_QUESTIONS, MEMO_QUESTIONS } from './rest';

const GROUPS: readonly CheckGroup[] = [
    {
        id: 'g-state',
        title: 'useState',
        blurb: '先把快照、批处理和不可变更新说清,再谈状态该放在哪。',
        questions: STATE_QUESTIONS,
    },
    {
        id: 'g-reducer',
        title: 'useReducer',
        blurb: 'reducer 是纯计算。请求和写入不要放进归约。',
        questions: REDUCER_QUESTIONS,
    },
    {
        id: 'g-ref',
        title: 'ref 与命令',
        blurb: 'ref 保存跨渲染的可变值,不负责让界面更新。',
        questions: REF_QUESTIONS,
    },
    {
        id: 'g-effect',
        title: 'useEffect',
        blurb: 'effect 是提交之后和外系统同步。点击、派生和首屏数据通常不该绕进来。',
        questions: EFFECT_QUESTIONS,
    },
    {
        id: 'g-layout',
        title: 'useLayoutEffect',
        blurb: '绘制前的缝只留给必须在这一帧校正的布局。',
        questions: LAYOUT_QUESTIONS,
    },
    {
        id: 'g-memo',
        title: 'useMemo 与 useCallback',
        blurb: '它们让「可以跳过」的条件成立,自己不是加速器。',
        questions: MEMO_QUESTIONS,
    },
    {
        id: 'g-custom',
        title: '自定义 Hook',
        blurb: '复用的是行为。状态仍在调用它的那个组件上。',
        questions: CUSTOM_QUESTIONS,
    },
    {
        id: 'g-concurrent',
        title: '并发与读取',
        blurb: '标出哪些更新可以晚,哪些值必须在渲染时读到。',
        questions: CONCURRENT_QUESTIONS,
    },
];

export const HOOKS_GROUPS = numberGroups(GROUPS);
export const HOOKS_COUNT = countQuestions(HOOKS_GROUPS);
