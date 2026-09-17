/**
 * ============================================================================
 * SpecialCasesDemo.tsx — 特殊场景(下):不冒泡事件 & Portal 冒泡
 * ============================================================================
 *
 * a) 不冒泡事件:scroll 不冒泡,React 也不为它模拟冒泡(父级 onScroll 收不到);
 *    focus/blur 原生不冒泡,但 React 用捕获模拟了冒泡(父级 onFocus 可以委托子输入框)
 * b) Portal 冒泡(最经典面试题):createPortal 渲染到 body 下的按钮,
 *    DOM 上的父级原生监听收不到,React 组件树里的父组件 onClick 却能收到
 *    —— 合成事件沿 React 树而非 DOM 树冒泡
 *
 * @module topics/basics/event/components/SpecialCasesDemo
 */

import { memo, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from 'antd';

import { EventLog, useEventLog } from './EventLog';

export const SpecialCasesDemo = memo(() => {
    const bubble = useEventLog();
    const { logs: portalLogs, append: appendPortal, clear: clearPortal } = useEventLog();
    const domParentRef = useRef<HTMLDivElement>(null);

    /* ==== Portal 挂载点:useState 懒初始化只创建一次,挂载到 body 下 ==== */
    const [portalNode] = useState(() => {
        const el = document.createElement('div');
        // 固定在页面右下角,直观展示它不在本卡片的 DOM 子树里
        el.className =
            'fixed bottom-6 right-6 z-50 rounded-card border border-primary-200 bg-white p-3 shadow-card dark:border-slate-700 dark:bg-slate-800';
        return el;
    });

    useEffect(() => {
        document.body.appendChild(portalNode);
        return () => {
            document.body.removeChild(portalNode);
        };
    }, [portalNode]);

    /* ==== DOM 父级上的原生监听:证明 Portal 按钮不在它的 DOM 子树中 ==== */
    useEffect(() => {
        const el = domParentRef.current;
        if (!el) {
            return;
        }
        const onNativeClick = () =>
            appendPortal('DOM 父级原生监听收到 click(Portal 按钮点击时此行不应出现)');
        el.addEventListener('click', onNativeClick);
        return () => el.removeEventListener('click', onNativeClick);
    }, [appendPortal]);

    return (
        <div className="space-y-6">
            {/* Case a:scroll 不冒泡 vs focus 模拟冒泡 */}
            <div className="space-y-3">
                <p className="text-sm font-medium text-gray-600 dark:text-slate-300">
                    a) 滚动容器 + 父级监听:scroll 上不来,focus 能上来
                </p>
                <div
                    className="space-y-3 rounded-card border border-gray-200 p-4 dark:border-slate-700"
                    onScroll={() => bubble.append('父级 onScroll 触发(scroll 不冒泡,此行不应出现)')}
                    onFocus={() => bubble.append('父级 onFocus 触发:子输入框 focus 冒泡到父级(React 用捕获模拟)')}
                    onBlur={() => bubble.append('父级 onBlur 触发(同样经 React 模拟冒泡)')}
                >
                    <div
                        className="h-20 overflow-y-auto rounded bg-gray-50 p-2 text-xs leading-relaxed text-gray-500 dark:bg-slate-800/60 dark:text-slate-400"
                        onScroll={() => bubble.append('滚动容器自身 onScroll 触发(只在自身监听有效)')}
                    >
                        {Array.from({ length: 12 }, (_, i) => (
                            <p key={i}>滚动内容 第 {i + 1} 行 —— 滚动我,观察父级是否收到 onScroll</p>
                        ))}
                    </div>
                    <input
                        placeholder="聚焦我:父级没有包我,却能通过 onFocus 委托收到"
                        className="w-72 rounded-card border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    />
                </div>
                <EventLog title="冒泡对比日志" logs={bubble.logs} onClear={bubble.clear} />
            </div>

            {/* Case b:Portal 冒泡 —— 沿 React 树而非 DOM 树 */}
            <div className="space-y-3">
                <p className="text-sm font-medium text-gray-600 dark:text-slate-300">
                    b) Portal 按钮(渲染在 body 下,页面右下角):DOM 父级收不到,React 父级收得到
                </p>
                <div
                    ref={domParentRef}
                    className="rounded-card border border-dashed border-primary-300 bg-primary-50 p-4 dark:border-primary-600 dark:bg-slate-800/60"
                    onClick={() => appendPortal('React 组件树父级 onClick 收到(Portal 沿 React 树冒泡)')}
                >
                    <p className="text-xs text-primary-700 dark:text-primary-300">
                        React 父级区域(也挂了原生 click 监听)—— 先点我本身,再点右下角 Portal 按钮对比
                    </p>
                    {createPortal(
                        <Button
                            size="small"
                            type="primary"
                            onClick={() => appendPortal('Portal 按钮自身 onClick(我在 body 下,不在父级 DOM 里)')}
                        >
                            Portal 按钮
                        </Button>,
                        portalNode,
                    )}
                </div>
                <EventLog title="Portal 日志" logs={portalLogs} onClear={clearPortal} />
            </div>
        </div>
    );
});

SpecialCasesDemo.displayName = 'SpecialCasesDemo';
