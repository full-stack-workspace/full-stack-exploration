/**
 * ============================================================================
 * ElementNatureDemo.tsx — JSX 元素本质演示
 * ============================================================================
 *
 * 把一个 JSX 元素的渲染结果与它的运行时「真面目」并排展示:
 * typeof、Object.keys 与 props 内容,直观说明元素只是描述 UI 的
 * 普通对象,而不是 DOM 节点。
 *
 * @module topics/basics/jsx-render/components/ElementNatureDemo
 */

import { memo } from 'react';

export const ElementNatureDemo = memo(() => {
    // 元素在 render 期间被创建,此刻它还只是一个 plain object,尚未对应任何 DOM
    const element = (
        <span className="rounded bg-primary-50 px-2 py-0.5 text-sm font-medium text-primary-700 dark:bg-primary-950/50 dark:text-primary-300">
            你好,JSX
        </span>
    );

    return (
        <div className="space-y-3">
            <p className="text-sm text-gray-700 dark:text-slate-300">渲染结果:{element}</p>
            {/* 直接读取运行时对象,证明元素不是 DOM、也没有被「渲染」过 */}
            <pre className="overflow-auto rounded-card bg-gray-900 p-4 font-mono text-xs leading-relaxed text-emerald-300 dark:bg-slate-950">
                {`typeof element === '${typeof element}'
Object.keys(element) = ${JSON.stringify(Object.keys(element))}
element.type       = ${JSON.stringify(element.type)}
element.props      = ${JSON.stringify(element.props)}`}
            </pre>
            <p className="text-xs text-gray-400 dark:text-slate-500">
                上面这个对象是 render 阶段的产物;React 拿着它与上一次的结果 Diff,在 commit 阶段才创建 / 更新真实 DOM。
            </p>
        </div>
    );
});

ElementNatureDemo.displayName = 'ElementNatureDemo';
