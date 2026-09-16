/**
 * ============================================================================
 * Input — 通用文本输入
 * ============================================================================
 *
 * 对原生 `<input>` 的轻量封装,视觉对齐 playground 的 primary 色阶与卡片圆角。
 * 不引入额外状态,受控/非受控均由调用方通过原生 value/defaultValue 决定。
 *
 * 功能特点:
 * - 透传全部原生 input 属性(含 React 19 的 ref)
 * - className 可覆盖或追加默认样式
 * - 通过 aria-invalid 呈现校验失败态,不额外增加 boolean 变体 prop
 *
 * @module components/Input
 */

import { memo } from 'react';
import type { ComponentProps } from 'react';

const INPUT_CLASSNAME =
    'h-8 w-full min-w-0 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-800 shadow-sm outline-none transition-colors duration-200 placeholder:text-gray-400 focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/30 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 aria-[invalid=true]:border-red-500 aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-red-500/20';

export type InputProps = ComponentProps<'input'>;

/**
 * @param props 原生 input 属性;className 会追加在默认样式之后
 * @returns 带统一焦点环与禁用态的 input
 * @example
 * <Input placeholder="输入待办" value={text} onChange={(e) => setText(e.target.value)} />
 */
export const Input = memo(({ className, type = 'text', ref, ...props }: InputProps) => {
    return (
        <input
            ref={ref}
            type={type}
            className={className ? `${INPUT_CLASSNAME} ${className}` : INPUT_CLASSNAME}
            {...props}
        />
    );
});

Input.displayName = 'Input';
