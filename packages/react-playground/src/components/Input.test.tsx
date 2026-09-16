/**
 * @file Input.test.tsx
 *
 * @description Input 组件单元测试
 * 验证默认渲染、受控输入、禁用、校验失败态与自定义 className。
 */

import { describe, it, expect, vi } from 'vitest';
import { createRef } from 'react';
import { render, screen, fireEvent } from '../test/utils';
import { Input } from './Input';

describe('Input', () => {
    it('按 placeholder 渲染文本框', () => {
        render(<Input placeholder="输入待办" />);
        expect(screen.getByPlaceholderText('输入待办')).toBeInTheDocument();
    });

    it('输入时触发 onChange,事件值为输入内容', () => {
        const onChange = vi.fn();
        render(<Input placeholder="输入待办" onChange={onChange} />);

        fireEvent.change(screen.getByPlaceholderText('输入待办'), {
            target: { value: '买牛奶' },
        });

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange.mock.calls[0][0].target.value).toBe('买牛奶');
    });

    it('disabled 时不可交互', () => {
        render(<Input placeholder="输入待办" disabled />);
        expect(screen.getByPlaceholderText('输入待办')).toBeDisabled();
    });

    it('aria-invalid 时带校验失败样式', () => {
        render(<Input placeholder="输入待办" aria-invalid />);
        expect(screen.getByPlaceholderText('输入待办')).toHaveAttribute('aria-invalid', 'true');
    });

    it('追加自定义 className', () => {
        render(<Input placeholder="输入待办" className="w-40" />);
        expect(screen.getByPlaceholderText('输入待办')).toHaveClass('w-40');
    });

    it('把 ref 挂到原生 input', () => {
        const ref = createRef<HTMLInputElement>();
        render(<Input ref={ref} placeholder="输入待办" />);
        expect(ref.current).toBeInstanceOf(HTMLInputElement);
        expect(ref.current).toBe(screen.getByPlaceholderText('输入待办'));
    });
});
