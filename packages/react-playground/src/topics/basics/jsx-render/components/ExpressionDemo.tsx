/**
 * ============================================================================
 * ExpressionDemo.tsx — 表达式插值演示
 * ============================================================================
 *
 * 用 Segmented 切换不同的插值类型,实时观察 {} 的渲染结果:
 * 哪些值正常渲染、哪些渲染为空、0 为什么是真坑、普通对象为什么会报错
 * (报错效果用静态文案示意,避免真的让页面崩溃)。
 *
 * @module topics/basics/jsx-render/components/ExpressionDemo
 */

import { memo, useState } from 'react';
import type { ReactNode } from 'react';
import { Segmented } from 'antd';

/** 可切换的插值类型 */
type CaseKey =
    | 'string'
    | 'number'
    | 'zero'
    | 'true'
    | 'false'
    | 'null'
    | 'undefined'
    | 'array'
    | 'object';

interface ExpressionCase {
    /** Segmented 选项文案 */
    label: string;
    /** 参与插值的 JSX 写法(仅用于展示) */
    code: string;
    /** 实际插值用的值;object 不参与真实渲染,走静态报错示意 */
    value: ReactNode;
}

const CASES: Record<CaseKey, ExpressionCase> = {
    string: { label: '字符串', code: "{ 'Hello JSX' }", value: 'Hello JSX' },
    number: { label: '数字', code: '{ 42 }', value: 42 },
    zero: { label: '0(坑)', code: '{ 0 }', value: 0 },
    true: { label: 'true', code: '{ true }', value: true },
    false: { label: 'false', code: '{ false }', value: false },
    null: { label: 'null', code: '{ null }', value: null },
    undefined: { label: 'undefined', code: '{ undefined }', value: undefined },
    array: {
        label: '数组',
        code: "{ ['苹果', '香蕉', '橙子'] }",
        // 数组会被逐个渲染、且字符串之间没有分隔符
        value: ['苹果', '香蕉', '橙子'],
    },
    object: { label: '普通对象', code: "{ { name: 'React' } }", value: null },
};

/** true / false / null / undefined 会渲染为空,这是 && 短路能工作的原理 */
const rendersNothing = (value: ReactNode): boolean =>
    value === true || value === false || value === null || value === undefined;

export const ExpressionDemo = memo(() => {
    const [caseKey, setCaseKey] = useState<CaseKey>('string');
    const current = CASES[caseKey];

    return (
        <div className="space-y-4">
            <Segmented
                value={caseKey}
                onChange={(v) => setCaseKey(v as CaseKey)}
                options={Object.entries(CASES).map(([value, c]) => ({ label: c.label, value }))}
            />
            <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-500 dark:text-slate-400">当前插值:</span>
                <code className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-primary-700 dark:bg-slate-800 dark:text-primary-300">
                    {current.code}
                </code>
            </div>
            <div className="rounded-card border border-dashed border-gray-200 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                {caseKey === 'object' ? (
                    // 普通对象会直接抛错使整棵树崩溃,这里用静态文案复现报错信息
                    <p className="font-mono text-xs leading-relaxed text-red-600 dark:text-red-400">
                        Error: Objects are not valid as a React child (found: object with keys
                        {' {name}'}). If you meant to render a collection of children, use an array
                        instead.
                    </p>
                ) : (
                    <p className="text-sm text-gray-700 dark:text-slate-300">
                        渲染结果:「{current.value}」
                        {rendersNothing(current.value) && (
                            <span className="ml-2 text-xs text-gray-400 dark:text-slate-500">
                                (什么都没有渲染)
                            </span>
                        )}
                        {caseKey === 'zero' && (
                            <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                                0 是 falsy 但会真的渲染出来 —— 这就是 count && ... 翻车的原理
                            </span>
                        )}
                    </p>
                )}
            </div>
        </div>
    );
});

ExpressionDemo.displayName = 'ExpressionDemo';
