/**
 * ============================================================================
 * ListRenderDemo.tsx — 列表渲染基础演示
 * ============================================================================
 *
 * 内容包含:
 * - map + key 的基础列表渲染,以及 key 用 index 在「头部插入」时的
 *   状态错位现象(每行的备注输入框跟随位置而不是跟随数据)
 * - 嵌套列表与带 key 的 Fragment 分组写法
 * 更深入的 Diff 实验见「列表与 key」专题(/topics/basics/list-key)。
 *
 * @module topics/basics/jsx-render/components/ListRenderDemo
 */

import { Fragment, memo, useState } from 'react';
import { Button, Input, Segmented } from 'antd';
import { Link } from 'react-router-dom';

interface Person {
    id: number;
    name: string;
}

const INITIAL_LIST: Person[] = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Carol' },
];

interface PersonRowProps {
    /** 当前行对应的人名 */
    name: string;
}

/**
 * 带内部状态的列表行:备注输入框的值保存在组件实例里。
 * key 用 id 时实例跟随人走;key 用 index 时实例留在原地,
 * 头部插入后备注就会「串」到别人头上。
 *
 * @param props.name - 当前行人名
 * @returns 单行人名 + 备注输入框
 */
const PersonRow = memo(({ name }: PersonRowProps) => {
    const [note, setNote] = useState('');
    return (
        <li className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/50">
            <span className="w-20 shrink-0 text-sm font-medium text-gray-700 dark:text-slate-200">
                {name}
            </span>
            <Input
                size="small"
                placeholder="输入备注,再点「头部插入」观察"
                value={note}
                onChange={(e) => setNote(e.target.value)}
            />
        </li>
    );
});

PersonRow.displayName = 'PersonRow';

interface Group {
    id: string;
    title: string;
    items: string[];
}

const GROUPS: Group[] = [
    { id: 'fruits', title: '水果', items: ['苹果', '香蕉', '橙子'] },
    { id: 'veggies', title: '蔬菜', items: ['白菜', '萝卜'] },
];

export const ListRenderDemo = memo(() => {
    const [list, setList] = useState(INITIAL_LIST);
    const [keyMode, setKeyMode] = useState<'id' | 'index'>('id');

    // 头部插入是暴露 index key 问题最快的操作:所有位置整体后移
    const prepend = () =>
        setList((prev) => [{ id: Date.now(), name: `新人${prev.length + 1}` }, ...prev]);

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
                <Segmented
                    value={keyMode}
                    onChange={(v) => setKeyMode(v as 'id' | 'index')}
                    options={[
                        { label: 'key = id(正确)', value: 'id' },
                        { label: 'key = index(危险)', value: 'index' },
                    ]}
                />
                <ul className="space-y-2">
                    {list.map((person, index) => (
                        // 两种 key 策略在此切换:id 让状态跟随数据,index 让状态跟随位置
                        <PersonRow key={keyMode === 'id' ? person.id : index} name={person.name} />
                    ))}
                </ul>
                <div className="space-x-3">
                    <Button type="primary" size="small" onClick={prepend}>
                        头部插入一项
                    </Button>
                    <Button size="small" onClick={() => setList(INITIAL_LIST)}>
                        重置
                    </Button>
                </div>
                <p className="text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                    key 是 React Diff 时识别元素身份的线索;更系统的错位实验与原理见{' '}
                    <Link
                        to="/topics/basics/list-key"
                        className="text-primary-600 hover:underline dark:text-primary-400"
                    >
                        「列表与 key」专题
                    </Link>
                    。
                </p>
            </div>

            {/* 嵌套列表:Fragment 可以接收 key,分组渲染而不多包一层 DOM */}
            <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-slate-200">
                    嵌套列表 + 带 key 的 Fragment
                </h3>
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                    {GROUPS.map((group) => (
                        <Fragment key={group.id}>
                            <h4 className="mt-2 text-xs font-semibold text-gray-500 first:mt-0 dark:text-slate-400">
                                {group.title}
                            </h4>
                            <ul className="mt-1 flex flex-wrap gap-2">
                                {group.items.map((item) => (
                                    <li
                                        key={item}
                                        className="rounded bg-white px-2 py-0.5 text-xs text-gray-600 shadow-sm dark:bg-slate-900 dark:text-slate-300"
                                    >
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </Fragment>
                    ))}
                </div>
                <p className="text-xs text-gray-400 dark:text-slate-500">
                    {'<Fragment key={...}>'} 是唯一允许带 key 的 Fragment 写法,分组时不产生多余 DOM 节点。
                </p>
            </div>
        </div>
    );
});

ListRenderDemo.displayName = 'ListRenderDemo';
