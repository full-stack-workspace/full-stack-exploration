/**
 * ============================================================================
 * YieldCompare — 栈协调与工作单元的让出对照
 * ============================================================================
 *
 * 两种走法始终并排。栈协调要等整段遍历结束才处理点击；
 * 工作单元在当前单元结束后就可以把点击插进来。
 *
 * @module topics/architecture/constraints/YieldCompare
 */

import { memo, useState } from 'react';

export const YieldCompare = memo(() => {
    const [stackDone, setStackDone] = useState(false);
    const [unitYielded, setUnitYielded] = useState(false);

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <section aria-label="栈协调" className="rounded-lg border border-fuchsia-100 p-3 dark:border-fuchsia-900">
                <h3 className="text-sm font-medium text-fuchsia-900 dark:text-fuchsia-100">栈协调</h3>
                <button type="button" className="mt-2 underline" onClick={() => setStackDone(true)}>
                    走完调用栈
                </button>
                <p className="mt-2 text-sm">{stackDone ? '点击出现在遍历结束之后' : '点击处于等待'}</p>
            </section>
            <section aria-label="工作单元" className="rounded-lg border border-fuchsia-100 p-3 dark:border-fuchsia-900">
                <h3 className="text-sm font-medium text-fuchsia-900 dark:text-fuchsia-100">工作单元</h3>
                <button type="button" className="mt-2 underline" onClick={() => setUnitYielded(true)}>
                    让出当前单元
                </button>
                <p className="mt-2 text-sm">{unitYielded ? '点击在让出时被处理' : '遍历尚未让出'}</p>
            </section>
        </div>
    );
});

YieldCompare.displayName = 'YieldCompare';
