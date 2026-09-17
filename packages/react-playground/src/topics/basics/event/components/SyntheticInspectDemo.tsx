/**
 * ============================================================================
 * SyntheticInspectDemo.tsx — 合成事件对象检查
 * ============================================================================
 *
 * 点击按钮,在日志中观察事件对象的「双重身份」:
 * React 处理器收到的是跨浏览器统一封装的 SyntheticEvent,
 * 底层原生事件挂在 e.nativeEvent 上。
 *
 * @module topics/basics/event/components/SyntheticInspectDemo
 */

import { memo } from 'react';
import type { MouseEvent } from 'react';
import { Button } from 'antd';

import { EventLog, useEventLog } from './EventLog';

export const SyntheticInspectDemo = memo(() => {
    const { logs, append, clear } = useEventLog();

    // e 的类型是 React.MouseEvent(SyntheticEvent 的子类),不是原生 MouseEvent
    const handleInspect = (e: MouseEvent<HTMLButtonElement>) => {
        append(`e.constructor.name = ${e.constructor.name} ← React 合成事件包装类`);
        append(`e.nativeEvent.constructor.name = ${e.nativeEvent.constructor.name} ← 底层原生事件`);
        append(`e.nativeEvent instanceof MouseEvent = ${e.nativeEvent instanceof MouseEvent}`);
        // 常用 API(preventDefault / stopPropagation / target 等)在两层上都可用,行为已被统一
        append(`e.target 指向真实触发节点:<${(e.target as HTMLElement).tagName.toLowerCase()}>`);
    };

    return (
        <div className="space-y-4">
            <Button type="primary" onClick={handleInspect}>
                点我检查事件对象
            </Button>
            <EventLog logs={logs} onClear={clear} />
        </div>
    );
});

SyntheticInspectDemo.displayName = 'SyntheticInspectDemo';
