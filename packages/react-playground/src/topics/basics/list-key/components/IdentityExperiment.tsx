/**
 * ============================================================================
 * IdentityExperiment.tsx — 双栏对照实验:key 决定元素身份
 * ============================================================================
 *
 * 同一份数据、同一套操作(头部插入 / 反转顺序 / 删除中间项 / 重置),
 * 左栏 key=id、右栏 key=index 并排渲染;每行的备注输入框是组件实例
 * 内部的 useState,用来直观呈现「状态跟随身份」:
 * - 左栏(key=id):操作后备注跟随人走 —— 实例按 key 复用
 * - 右栏(key=index):操作后备注留在原地、串到别人头上 ——
 *   「位置」被当成了身份,重排后状态与数据错位
 *
 * @module topics/basics/list-key/components/IdentityExperiment
 */

import { memo, useRef, useState } from 'react';
import { Button, Input } from 'antd';

interface Person {
    id: number;
    name: string;
}

const INITIAL_LIST: Person[] = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Carol' },
];

/* =================================================================
 * 列表行:备注是组件内部 state,用于观察「状态是否跟随身份」
 * ================================================================ */

interface PersonRowProps {
    /** 当前行对应的人名 */
    name: string;
}

/**
 * 带内部状态的列表行:备注输入框的值只存在于组件实例里。
 * Diff 时 key 相同 → 实例复用(备注保留);key 对不上 → 实例销毁重建(备注丢失/串位)。
 *
 * @param props.name - 当前行人名
 * @returns 单行人名 + 备注输入框
 */
const PersonRow = memo(({ name }: PersonRowProps) => {
    const [note, setNote] = useState('');
    return (
        <li className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 p-2 dark:border-slate-800 dark:bg-slate-800/50">
            <span className="w-14 shrink-0 text-sm font-medium text-gray-700 dark:text-slate-200">
                {name}
            </span>
            <Input
                size="small"
                placeholder="给 TA 写点备注"
                value={note}
                onChange={(e) => setNote(e.target.value)}
            />
        </li>
    );
});

PersonRow.displayName = 'PersonRow';

/* =================================================================
 * 单列渲染:key 策略由父组件注入,两栏共用同一个行组件
 * ================================================================ */

interface KeyColumnProps {
    /** 栏目标题(标注 key 策略) */
    title: string;
    /** 是否正确策略(仅影响标题配色) */
    correct: boolean;
    list: Person[];
    /** 每行的 key 取值策略:id 跟随数据,index 跟随位置 */
    getKey: (person: Person, index: number) => number;
}

/**
 * 单栏列表:除 key 策略外与另一栏完全一致,
 * 保证实验的唯一变量就是 key 本身。
 */
const KeyColumn = memo(({ title, correct, list, getKey }: KeyColumnProps) => {
    return (
        <div className="space-y-2">
            <p
                className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                    correct
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400'
                        : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                }`}
            >
                {title}
            </p>
            <ul className="space-y-2">
                {list.map((person, index) => (
                    <PersonRow key={getKey(person, index)} name={person.name} />
                ))}
            </ul>
        </div>
    );
});

KeyColumn.displayName = 'KeyColumn';

/* =================================================================
 * 实验主体:共享数据与操作按钮,双栏并排对照
 * ================================================================ */

export const IdentityExperiment = memo(() => {
    const [list, setList] = useState(INITIAL_LIST);
    // id 发号器:ref 持有,避免「取 id」变成一次额外渲染
    const nextId = useRef(INITIAL_LIST.length + 1);

    // 头部插入是暴露 index key 问题最快的操作:所有位置整体后移
    const prepend = () => {
        const id = nextId.current;
        nextId.current += 1;
        setList((prev) => [{ id, name: `新人${id}` }, ...prev]);
    };

    const reverse = () => setList((prev) => [...prev].reverse());

    // 删除中间项:其后所有位置前移,index 栏从此处开始整体错位
    const removeMiddle = () =>
        setList((prev) => {
            if (prev.length < 2) {
                return prev;
            }
            const mid = Math.floor((prev.length - 1) / 2);
            return prev.filter((_, i) => i !== mid);
        });

    const reset = () => {
        nextId.current = INITIAL_LIST.length + 1;
        setList(INITIAL_LIST);
    };

    return (
        <div className="space-y-4">
            {/* 两栏共享同一套操作,保证数据变化完全同步 */}
            <div className="flex flex-wrap gap-3">
                <Button type="primary" size="small" onClick={prepend}>
                    头部插入一项
                </Button>
                <Button size="small" onClick={reverse}>
                    反转顺序
                </Button>
                <Button size="small" onClick={removeMiddle}>
                    删除中间项
                </Button>
                <Button size="small" onClick={reset}>
                    重置
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <KeyColumn
                    title="key = id(正确)"
                    correct
                    list={list}
                    getKey={(person) => person.id}
                />
                <KeyColumn
                    title="key = index(危险)"
                    correct={false}
                    list={list}
                    getKey={(_person, index) => index}
                />
            </div>

            <p className="text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                玩法:先在两栏的同一行各输入不同备注(如给 Alice 写「A 的备注」),再点上方按钮。
                左栏备注始终跟着人走;右栏头部插入/删除中间项后,备注原地不动 —— 串到了别人头上。
            </p>
        </div>
    );
});

IdentityExperiment.displayName = 'IdentityExperiment';
