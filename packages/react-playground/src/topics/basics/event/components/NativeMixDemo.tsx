/**
 * ============================================================================
 * NativeMixDemo.tsx — 合成事件 × 原生事件混用(生产高频坑)
 * ============================================================================
 *
 * 经典「点击外部关闭下拉菜单」的对照实验:
 * - buggy 版:菜单内按钮调用 e.stopPropagation(),React 委托在 root,
 *   合成层的 stopPropagation 最终调用原生 stopPropagation,
 *   事件在抵达 document 前被阻断 → document 上的原生监听收不到 → 菜单关不掉
 * - fixed 版:原生监听用 menuRef.contains(e.target) 做「目标判断」,
 *   不依赖传播阻断,跨系统协作不再互相伤害
 *
 * @module topics/basics/event/components/NativeMixDemo
 */

import { memo, useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { Button, Segmented } from 'antd';

import { EventLog, useEventLog } from './EventLog';

type Mode = 'buggy' | 'fixed';

export const NativeMixDemo = memo(() => {
    const { logs, append, clear } = useEventLog();
    const [mode, setMode] = useState<Mode>('buggy');
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    /* ==== 原生监听:点击菜单外部时关闭(模拟真实项目里的全局监听) ==== */
    useEffect(() => {
        if (!open) {
            return;
        }
        const onDocumentClick = (e: globalThis.MouseEvent) => {
            // fixed 版核心:用「目标判断」代替「传播阻断」,
            // 即使内部有人 stopPropagation 也不影响这里正确决策
            if (mode === 'fixed' && menuRef.current?.contains(e.target as Node)) {
                append('原生 document 监听:点击在菜单内,忽略(contains 目标判断)');
                return;
            }
            append('原生 document 监听:收到 click → 关闭菜单');
            setOpen(false);
        };
        document.addEventListener('click', onDocumentClick);
        return () => document.removeEventListener('click', onDocumentClick);
    }, [open, mode, append]);

    const handleInnerAction = (e: MouseEvent<HTMLButtonElement>) => {
        if (mode === 'buggy') {
            // 根因:React 委托在 root container,合成层的 stopPropagation 会调原生
            // stopPropagation,事件到不了 document → 上面的原生监听永远收不到
            e.stopPropagation();
            append('菜单内按钮:stopPropagation() —— document 原生监听被阻断,菜单关不掉');
        } else {
            append('菜单内按钮:正常处理业务,不阻断传播(由原生监听自行判断目标)');
        }
    };

    return (
        <div className="space-y-4">
            <Segmented
                value={mode}
                onChange={(v) => setMode(v as Mode)}
                options={[
                    { label: 'buggy 版(stopPropagation)', value: 'buggy' },
                    { label: 'fixed 版(contains 判断)', value: 'fixed' },
                ]}
            />

            <div className="flex items-start gap-4">
                <div className="relative">
                    <Button type="primary" onClick={() => setOpen((v) => !v)}>
                        {open ? '菜单已打开(点外部试试)' : '打开菜单'}
                    </Button>
                    {open && (
                        <div
                            ref={menuRef}
                            className="absolute left-0 top-full z-10 mt-2 w-64 rounded-card border border-gray-100 bg-white p-3 shadow-card dark:border-slate-700 dark:bg-slate-800"
                        >
                            <p className="mb-2 text-xs text-gray-500 dark:text-slate-400">
                                下拉菜单(document 上挂了原生 click 监听)
                            </p>
                            <Button size="small" onClick={handleInnerAction} block>
                                菜单内操作按钮 —— 点我
                            </Button>
                        </div>
                    )}
                </div>
                <p className="flex-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                    复现路径:buggy 版打开菜单 → 点「菜单内操作按钮」→ 菜单仍然开着,
                    且日志里看不到 document 监听输出(bug 现场); 切到 fixed 版同样操作,
                    原生监听通过 contains 判断正确忽略内部点击。
                </p>
            </div>

            <EventLog logs={logs} onClear={clear} />
        </div>
    );
});

NativeMixDemo.displayName = 'NativeMixDemo';
