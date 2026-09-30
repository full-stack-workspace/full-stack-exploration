/**
 * @file topics/hooks/use-reducer/index.test.tsx
 *
 * @description useReducer 专题:批处理折叠(dispatch ×3 真 +3)、
 * 一个 reducer 管待办的增删改与完成态、dispatch 引用稳定(memo 子组件不白跑)、
 * 第三参数 init 只在挂载时执行(total 从 42 起算)。
 */

import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import UseReducerTopic from './index';

function renderTopic() {
    return render(
        <MemoryRouter>
            <UseReducerTopic />
        </MemoryRouter>,
    );
}

describe('useReducer 专题', () => {
    it('同一事件里 dispatch ×3 按序折叠成 +3,清零回到 0', () => {
        renderTopic();

        const probe = screen.getByText(/三次 inc 会串成 \+3/).parentElement!;
        const count = () => probe.querySelector('.text-2xl');
        expect(count()).toHaveTextContent('0');

        fireEvent.click(screen.getByRole('button', { name: /dispatch ×3/ }));
        expect(count()).toHaveTextContent('3');

        fireEvent.click(screen.getByRole('button', { name: /清\s*零/ }));
        expect(count()).toHaveTextContent('0');
    });

    it('待办板:添加 / 完成态切换 / 文案修改 / 优先级 / 删除全部走 reducer', () => {
        renderTopic();

        // 种子数据:一条进行中一条已完成
        expect(screen.getByText(/当前进行中 1 条,已完成 1 条/)).toBeInTheDocument();

        // 添加:空文本时提交按钮禁用,输入后可用;先把草稿优先级切到「高」
        const draft = screen.getByLabelText('待办内容', { selector: '#todo-draft' });
        const form = draft.closest('form')!;
        expect(screen.getByRole('button', { name: /添\s*加/ })).toBeDisabled();
        fireEvent.click(within(form).getByText('高'));
        fireEvent.change(draft, { target: { value: '写 reducer 测试' } });
        fireEvent.click(screen.getByRole('button', { name: /添\s*加/ }));
        expect(screen.getByText(/当前进行中 2 条,已完成 1 条/)).toBeInTheDocument();
        expect(draft).toHaveValue('');

        // 完成态切换:把新待办标为已完成
        fireEvent.click(screen.getByRole('checkbox', { name: '将「写 reducer 测试」标记为已完成' }));
        expect(screen.getByText(/当前进行中 1 条,已完成 2 条/)).toBeInTheDocument();

        // 文案修改:dispatch todo_updated
        const rowInput = screen.getByDisplayValue('写 reducer 测试');
        fireEvent.change(rowInput, { target: { value: '写 reducer 契约测试' } });
        expect(screen.getByDisplayValue('写 reducer 契约测试')).toBeInTheDocument();

        // 行内优先级:dispatch todo_priority_updated(高 → 低)
        const row = rowInput.closest('li')!;
        fireEvent.click(within(row).getByText('低'));
        expect(screen.getByText(/"priority": "low"/)).toBeInTheDocument();
    });

    it('待办板:删光所有种子待办后渲染空态', () => {
        renderTopic();

        // 每次删完列表都会重渲染,循环里始终重新查询第一个删除按钮
        while (screen.queryAllByRole('button', { name: /删\s*除/ }).length > 0) {
            fireEvent.click(screen.getAllByRole('button', { name: /删\s*除/ })[0]);
        }
        expect(screen.getByText(/还没有待办,在上方输入一条开始演示 reducer/)).toBeInTheDocument();
    });

    it('dispatch 引用稳定:无关更新后,只吃 dispatch 的 memo 子组件不重渲染', () => {
        renderTopic();

        const unstableCard = screen.getByText('每次 render 新建的 onInc').parentElement!;
        const stableCard = screen.getByText('只传入稳定的 dispatch').parentElement!;
        expect(unstableCard).toHaveTextContent('子组件渲染 1 次');
        expect(stableCard).toHaveTextContent('子组件渲染 1 次');
        expect(screen.getByText(/dispatch 仍是同一引用:是/)).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: '无关状态 +1' }));
        // 左侧拿到新 onInc,memo 失效重渲染;右侧 props 不变,次数不动
        expect(unstableCard).toHaveTextContent('子组件渲染 2 次');
        expect(stableCard).toHaveTextContent('子组件渲染 1 次');

        // 右侧子组件自己也能通过 dispatch 驱动父级 count
        fireEvent.click(within(stableCard).getByRole('button', { name: '+1' }));
        expect(screen.getByText(/父 count = 1/)).toBeInTheDocument();

        // 左侧子组件通过内联 onInc 驱动同一份 count
        fireEvent.click(within(unstableCard).getByRole('button', { name: '+1' }));
        expect(screen.getByText(/父 count = 2/)).toBeInTheDocument();
    });

    it('第三参数 init:total 从 42 起算,无关更新不重跑 init', () => {
        renderTopic();

        expect(screen.getByText(/init 累计 1 次/)).toBeInTheDocument();

        const lazySection = screen.getByText(/init 累计 1 次/).parentElement!;
        expect(lazySection.querySelector('.text-2xl')).toHaveTextContent('42');

        fireEvent.click(screen.getByRole('button', { name: '无关状态 +1(触发子组件再渲染)' }));
        expect(screen.getByText(/init 累计 1 次/)).toBeInTheDocument();
        expect(screen.getByText(/父 tick = 1/)).toBeInTheDocument();

        // 子组件自己 +1 走的是普通 dispatch,init 仍只跑过一次
        fireEvent.click(within(lazySection).getByRole('button', { name: '+1' }));
        expect(lazySection.querySelector('.text-2xl')).toHaveTextContent('43');
        expect(screen.getByText(/init 累计 1 次/)).toBeInTheDocument();
    });
});
