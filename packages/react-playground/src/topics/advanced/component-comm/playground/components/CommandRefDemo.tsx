/**
 * ============================================================================
 * CommandRefDemo — 命令走 ref,不走 state
 * ============================================================================
 *
 * 父组件点「聚焦」只调用 input.focus(),不把 focused 存成 state。
 * 需要收窄命令面时再看 useImperativeHandle 专题。
 *
 * @module topics/advanced/component-comm/playground/components/CommandRefDemo
 */

import { memo, useRef } from 'react';
import { Button } from 'antd';

import { Input } from '../../../../../components/Input';

export const CommandRefDemo = memo(() => {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="flex flex-wrap items-center gap-2">
            <Input ref={inputRef} aria-label="命令式聚焦输入框" placeholder="点右侧按钮聚焦我" className="max-w-xs" />
            <Button size="small" type="primary" onClick={() => inputRef.current?.focus()}>
                聚焦输入框
            </Button>
        </div>
    );
});

CommandRefDemo.displayName = 'CommandRefDemo';
