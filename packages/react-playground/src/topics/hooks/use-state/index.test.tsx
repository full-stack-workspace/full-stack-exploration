/**
 * @file topics/hooks/use-state/index.test.tsx
 *
 * @description useState 专题:快照与批处理(直接传值 ×3 只 +1,函数式 ×3 真 +3)、
 * Object.is 跳过同引用(原地修改把对象改脏但屏幕不动)、
 * 惰性初始只在挂载时求值、派生数据渲染时计算。
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import UseStateTopic from './index';

function renderTopic() {
    return render(
        <MemoryRouter>
            <UseStateTopic />
        </MemoryRouter>,
    );
}

describe('useState 专题', () => {
    it('同一事件里直接传值 ×3 只 +1,函数式更新 ×3 真 +3', () => {
        renderTopic();

        // 快照探针区域的大数字(count)初始为 0(页上有两处「组件函数执行次数」,取第一处)
        const probe = screen.getAllByText(/组件函数执行次数/)[0].parentElement!;
        expect(probe.querySelector('.text-2xl')).toHaveTextContent('0');

        fireEvent.click(screen.getByRole('button', { name: /直接传值 ×3/ }));
        expect(probe.querySelector('.text-2xl')).toHaveTextContent('1');
        expect(screen.getByText(/点击瞬间闭包里的 count = 0/)).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /函数式更新 ×3/ }));
        expect(probe.querySelector('.text-2xl')).toHaveTextContent('4');
        expect(screen.getByText(/点击瞬间闭包里的 count = 1/)).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /清\s*零/ }));
        expect(probe.querySelector('.text-2xl')).toHaveTextContent('0');
        expect(screen.getByText(/点一次按钮,对照/)).toBeInTheDocument();
    });

    it('原地修改被 Object.is 跳过:屏幕不动但对象已脏,换新对象后暴露出来', () => {
        renderTopic();

        // 页上有两处「小明,N 岁」(MutateProbe 与 ProfileForm),取第一处(MutateProbe)
        const ageText = () => screen.getAllByText(/小明,\d+ 岁/)[0];
        expect(ageText()).toHaveTextContent('小明,18 岁');

        // 原地 +1:引用不变,React 跳过重渲染,屏幕仍是 18
        fireEvent.click(screen.getByRole('button', { name: /原地 \+1/ }));
        expect(ageText()).toHaveTextContent('小明,18 岁');

        // 换新对象:基于被改脏的 19 再加 1,屏幕直接跳到 20 —— 演示原地修改的隐患
        fireEvent.click(screen.getByRole('button', { name: '换新对象 +1' }));
        expect(ageText()).toHaveTextContent('小明,20 岁');
    });

    it('表单场景:展开运算符只覆盖一个字段,其余保持原样', () => {
        renderTopic();

        fireEvent.change(screen.getByLabelText('姓名'), { target: { value: '小红' } });
        expect(screen.getByText('小红,18 岁')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: '年龄 +1' }));
        expect(screen.getByText('小红,19 岁')).toBeInTheDocument();
    });

    it('惰性初始:无关更新后表达式次数继续涨,惰性函数停在挂载时的 1 次', () => {
        renderTopic();

        expect(screen.getByText(/表达式累计 1 次/)).toBeInTheDocument();
        expect(screen.getByText(/惰性函数累计 1 次/)).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /无关状态 \+1/ }));
        expect(screen.getByText(/表达式累计 2 次/)).toBeInTheDocument();
        expect(screen.getByText(/惰性函数累计 1 次/)).toBeInTheDocument();
        // 两种写法算出的 seed 相同且稳定
        expect(screen.getAllByText(/seed = 1999000/)).toHaveLength(2);
    });

    it('派生数据:名 + 姓在渲染时拼出全名', () => {
        renderTopic();

        expect(screen.getByText('小明')).toBeInTheDocument();
        fireEvent.change(screen.getByLabelText('名'), { target: { value: '红' } });
        expect(screen.getByText('红明')).toBeInTheDocument();
        fireEvent.change(screen.getByLabelText('姓'), { target: { value: '月' } });
        expect(screen.getByText('红月')).toBeInTheDocument();
    });
});
