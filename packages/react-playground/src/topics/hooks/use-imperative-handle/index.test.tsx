/**
 * @file topics/hooks/use-imperative-handle/index.test.tsx
 *
 * @description useImperativeHandle 专题:父组件拿到的是精简命令面,不是整棵 DOM。
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

import UseImperativeHandleTopic from './index';

function renderTopic() {
    return render(
        <MemoryRouter>
            <UseImperativeHandleTopic />
        </MemoryRouter>,
    );
}

describe('useImperativeHandle 专题', () => {
    it('渲染机制标题与对照说明', () => {
        renderTopic();
        expect(screen.getByRole('heading', { name: 'useImperativeHandle' })).toBeInTheDocument();
        expect(screen.getByText('父组件先准备一个空盒子')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: '和直接把 DOM 交给父组件的差别' })).toBeInTheDocument();
    });

    it('父组件通过命令句柄清空输入,不必碰 DOM 的 value 字段', async () => {
        const user = userEvent.setup();
        renderTopic();

        const input = screen.getByTestId('command-input');
        expect(input).toHaveValue('react hooks');

        await user.click(screen.getByRole('button', { name: '命令:清空' }));

        expect(input).toHaveValue('');
        expect(input).toHaveFocus();
    });

    it('父组件调用 focus 命令后,输入框获得焦点', async () => {
        const user = userEvent.setup();
        renderTopic();

        const input = screen.getByTestId('command-input');
        expect(input).not.toHaveFocus();

        await user.click(screen.getByRole('button', { name: '命令:聚焦' }));

        expect(input).toHaveFocus();
    });

    it('检查出口时,裸 ref 能读到 value,命令句柄只暴露列出的方法', async () => {
        const user = userEvent.setup();
        renderTopic();

        await user.click(screen.getByRole('button', { name: '检查裸 ref' }));
        await user.click(screen.getByRole('button', { name: '检查命令句柄' }));

        expect(screen.getByTestId('raw-peek')).toHaveTextContent(/value=/);
        expect(screen.getByTestId('handle-peek')).toHaveTextContent(/focus/);
        expect(screen.getByTestId('handle-peek')).toHaveTextContent(/selectAll/);
        expect(screen.getByTestId('handle-peek')).toHaveTextContent(/clear/);
        expect(screen.getByTestId('handle-peek')).toHaveTextContent(/value in handle = false/);
    });

    it('空依赖的句柄会闭包旧标签,deps 写上 label 才能读到新值', async () => {
        const user = userEvent.setup();
        renderTopic();

        await user.click(screen.getByRole('button', { name: '过期句柄:读出口令' }));
        await user.click(screen.getByRole('button', { name: '最新句柄:读出口令' }));
        expect(screen.getByTestId('stale-announce')).toHaveTextContent('当前标签是 alpha');
        expect(screen.getByTestId('fresh-announce')).toHaveTextContent('当前标签是 alpha');

        await user.click(screen.getByRole('button', { name: '切换标签' }));
        await user.click(screen.getByRole('button', { name: '过期句柄:读出口令' }));
        await user.click(screen.getByRole('button', { name: '最新句柄:读出口令' }));

        expect(screen.getByTestId('stale-announce')).toHaveTextContent('当前标签是 alpha');
        expect(screen.getByTestId('fresh-announce')).toHaveTextContent('当前标签是 beta');
    });
});
