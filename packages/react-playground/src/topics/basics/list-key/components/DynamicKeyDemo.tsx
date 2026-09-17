/**
 * ============================================================================
 * DynamicKeyDemo.tsx — 生产范式二:渲染期动态生成 key 的坑
 * ============================================================================
 *
 * 双栏对照「key 在哪里生成」:
 * - 左栏 key={Math.random()}:每次 render key 全变,React 找不到任何
 *   可复用实例,整列卸载重建 —— 输入框每敲一个字就失焦,挂载计数爆炸
 * - 右栏 id 在「数据创建时」用 crypto.randomUUID() 生成一次并随数据保存,
 *   render 期只读取不生成 —— 输入流畅,挂载次数稳定
 *
 * @module topics/basics/list-key/components/DynamicKeyDemo
 */

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Button } from 'antd';

/* =================================================================
 * 带挂载计数的输入框:上报真实挂载次数,直观量化「整列重建」
 * ================================================================ */

interface TrackedInputProps {
    value: string;
    placeholder?: string;
    onChange: (value: string) => void;
    /** 组件真实挂载时回调一次(重渲染但 key 不变不会触发) */
    onMount: () => void;
}

/**
 * 输入框 + 挂载探针:useEffect 空依赖(onMount 稳定)保证
 * 只有 React 真正挂载新实例时才计数,是观察「卸载重建」的探针。
 */
const TrackedInput = memo(({ value, placeholder, onChange, onMount }: TrackedInputProps) => {
    // onMount 由 useCallback 固定身份,此 effect 等价于「仅挂载时执行」
    useEffect(() => {
        onMount();
    }, [onMount]);

    return (
        <input
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-card border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        />
    );
});

TrackedInput.displayName = 'TrackedInput';

/* =================================================================
 * 右栏数据:id 在创建数据时生成一次,此后随数据稳定存在
 * ================================================================ */

interface DraftItem {
    id: string;
    text: string;
}

/** 创建一行数据 —— 稳定 id 只应该在这里(数据创建时)诞生 */
const createItem = (): DraftItem => ({ id: crypto.randomUUID(), text: '' });

/* =================================================================
 * 演示主体:同一份交互,两种 key 生成时机
 * ================================================================ */

export const DynamicKeyDemo = memo(() => {
    /* ---- 左栏:渲染期生成 key(反模式) ---- */
    const [values, setValues] = useState<string[]>(['', '']);
    // 用 ref 计数避免 setState 触发额外渲染(那会反过来再触发整列重建)
    const badMounts = useRef(0);
    const countBad = useCallback(() => {
        badMounts.current += 1;
    }, []);

    /* ---- 右栏:创建数据时生成 id(正确) ---- */
    const [items, setItems] = useState<DraftItem[]>(() => [createItem(), createItem()]);
    const goodMounts = useRef(0);
    const countGood = useCallback(() => {
        goodMounts.current += 1;
    }, []);

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {/* 左栏:灾难现场 */}
            <div className="space-y-3">
                <p className="inline-block rounded bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600 dark:bg-red-500/10 dark:text-red-400">
                    {'key={Math.random()}(灾难)'}
                </p>
                <div className="space-y-2">
                    {values.map((v, i) => (
                        <TrackedInput
                            // ❌ 每次 render 都生成新 key:旧列表里没有任何 key 能配对,整列卸载重建
                            key={Math.random()}
                            value={v}
                            placeholder="试着连续输入一句话"
                            onMount={countBad}
                            onChange={(nv) =>
                                setValues((prev) => prev.map((x, j) => (j === i ? nv : x)))
                            }
                        />
                    ))}
                </div>
                <div className="flex items-center gap-3">
                    <Button size="small" onClick={() => setValues((prev) => [...prev, ''])}>
                        新增一行
                    </Button>
                    <span className="text-xs text-red-500">
                        本列累计挂载 {badMounts.current} 次(随下次击键刷新)
                    </span>
                </div>
                <p className="text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                    在输入框里连续敲字:每敲一个字,state 更新 → 重渲染 → key 全变 →
                    所有输入框卸载重建 → 焦点丢失。挂载计数随每次击键翻倍增长。
                </p>
            </div>

            {/* 右栏:修复版 */}
            <div className="space-y-3">
                <p className="inline-block rounded bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-500/10 dark:text-primary-400">
                    id 在数据创建时生成一次(正确)
                </p>
                <div className="space-y-2">
                    {items.map((item, i) => (
                        <TrackedInput
                            // ✅ key 来自数据自身的稳定 id,重渲染时实例全部复用
                            key={item.id}
                            value={item.text}
                            placeholder="这里可以流畅输入"
                            onMount={countGood}
                            onChange={(nv) =>
                                setItems((prev) =>
                                    prev.map((x, j) => (j === i ? { ...x, text: nv } : x)),
                                )
                            }
                        />
                    ))}
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        size="small"
                        type="primary"
                        onClick={() => setItems((prev) => [...prev, createItem()])}
                    >
                        新增一行
                    </Button>
                    <span className="text-xs text-primary-600 dark:text-primary-400">
                        本列累计挂载 {goodMounts.current} 次
                    </span>
                </div>
                <p className="text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                    击键只触发重渲染,不触发重建:key 稳定,实例与 DOM 全部复用,
                    焦点不丢,挂载次数只在真正新增行时 +1。
                </p>
            </div>
        </div>
    );
});

DynamicKeyDemo.displayName = 'DynamicKeyDemo';
