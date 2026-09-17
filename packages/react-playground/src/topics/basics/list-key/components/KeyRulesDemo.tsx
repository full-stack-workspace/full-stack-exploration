/**
 * ============================================================================
 * KeyRulesDemo.tsx — key 三条规则的最小可交互验证
 * ============================================================================
 *
 * a) key 只需在「同一层级的兄弟节点间」唯一:
 *    两个列表复用同一组 id 作 key,各自行的点赞计数互不干扰
 * b) key 不会作为 prop 传进组件:
 *    组件显式读取 props.key,结果是 undefined(需要就把 id 当普通 prop 再传一份)
 *
 * @module topics/basics/list-key/components/KeyRulesDemo
 */

import { memo, useState } from 'react';
import { Button } from 'antd';

/* =================================================================
 * 规则 a:两个列表复用同一组 key —— 唯一性的作用域是「兄弟节点」
 * ================================================================ */

interface Skill {
    id: number;
    name: string;
}

// 两组数据故意使用完全相同的 id:1、2、3
const FRONTEND_SKILLS: Skill[] = [
    { id: 1, name: 'React' },
    { id: 2, name: 'TypeScript' },
    { id: 3, name: 'CSS' },
];

const BACKEND_SKILLS: Skill[] = [
    { id: 1, name: 'Node.js' },
    { id: 2, name: 'PostgreSQL' },
    { id: 3, name: 'Redis' },
];

interface LikeRowProps {
    /** 技能名 */
    name: string;
}

/**
 * 带内部点赞计数的行:若 key 要求全局唯一,
 * 两个列表里 id 相同的行会互相干扰 —— 实际上并不会。
 *
 * @param props.name - 技能名
 * @returns 技能名 + 点赞按钮(计数为内部 state)
 */
const LikeRow = memo(({ name }: LikeRowProps) => {
    const [likes, setLikes] = useState(0);
    return (
        <li className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-1.5 dark:border-slate-800 dark:bg-slate-800/50">
            <span className="text-sm text-gray-700 dark:text-slate-200">{name}</span>
            <Button size="small" onClick={() => setLikes((n) => n + 1)}>
                👍 {likes}
            </Button>
        </li>
    );
});

LikeRow.displayName = 'LikeRow';

/* =================================================================
 * 规则 b:key 被 React 截获,不会出现在 props 里
 * ================================================================ */

interface KeyProbeProps {
    /** 与 key 相同的值,作为普通 prop 再传一份 */
    id: number;
}

/**
 * 探针组件:同时接收 key={42} 与 id={42},
 * 渲染时读到的 props.id 是 42,props.key 却是 undefined。
 *
 * @param props.id - 普通 prop 传入的 id
 * @returns 两个值的对比展示
 */
const KeyProbe = memo((props: KeyProbeProps) => {
    // React 在创建元素时就把 key 从 props 中剥离,组件内永远读不到
    const leakedKey = (props as unknown as Record<string, unknown>).key;
    return (
        <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 font-mono text-xs text-gray-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
            {'<KeyProbe key={42} id={42} />'} → props.id ={' '}
            <span className="font-semibold text-primary-600 dark:text-primary-400">{props.id}</span>
            ,props.key ={' '}
            <span className="font-semibold text-red-500">{String(leakedKey)}</span>
        </div>
    );
});

KeyProbe.displayName = 'KeyProbe';

/* =================================================================
 * 演示主体
 * ================================================================ */

export const KeyRulesDemo = memo(() => {
    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {/* 规则 a:同一组 id 在两个列表里各自独立 */}
            <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600 dark:text-slate-300">
                    a) 两个列表复用同一组 key(1、2、3)
                </p>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <p className="text-xs text-gray-400 dark:text-slate-500">前端组</p>
                        <ul className="space-y-2">
                            {FRONTEND_SKILLS.map((s) => (
                                <LikeRow key={s.id} name={s.name} />
                            ))}
                        </ul>
                    </div>
                    <div className="space-y-2">
                        <p className="text-xs text-gray-400 dark:text-slate-500">后端组</p>
                        <ul className="space-y-2">
                            {BACKEND_SKILLS.map((s) => (
                                <LikeRow key={s.id} name={s.name} />
                            ))}
                        </ul>
                    </div>
                </div>
                <p className="text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                    给「React」点赞不会影响「Node.js」— key 的唯一性只约束同一层级的兄弟节点,
                    不同父级下的列表互不可见,自然允许重复。
                </p>
            </div>

            {/* 规则 b:props.key 读不到 */}
            <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600 dark:text-slate-300">
                    b) key 不会传进组件
                </p>
                <KeyProbe key={42} id={42} />
                <p className="text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                    key 是 React 用于 Diff 的「元信息」,不属于 props;组件内若需要这个值,
                    把 id 作为普通 prop 再传一份即可(如上图的 id={42})。
                </p>
            </div>
        </div>
    );
});

KeyRulesDemo.displayName = 'KeyRulesDemo';
