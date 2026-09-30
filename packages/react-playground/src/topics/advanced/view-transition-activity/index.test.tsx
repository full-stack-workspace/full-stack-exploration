/**
 * ============================================================================
 * index.test.tsx — ViewTransition 与 Activity 专题测试
 * ============================================================================
 *
 * - 渲染冒烟:页头与四个 Section 标题就位;
 * - Activity 对照实验(Activity 已在 react@19.2 stable 导出,真实运行):
 *   · Activity 栏:隐藏 → effect 销毁日志出现,重新显示 → state 保留;
 *   · 条件卸载栏:隐藏再显示 → state 丢失(输入框归零);
 *   · display:none 栏:隐藏期间 effect 不销毁,重新显示 state 保留。
 * 心跳 tick 依赖真实定时器,不断言具体数值。
 *
 * @module topics/advanced/view-transition-activity/index.test
 */

import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ViewTransitionActivityTopic from './index';
import { ActivityLab } from './components/ActivityLab';

/** 点击全局「隐藏 / 显示全部面板」开关 */
const toggleHidden = () =>
    fireEvent.click(screen.getByRole('button', { name: /隐藏全部面板|显示全部面板/ }));

describe('ViewTransition 与 Activity 专题', () => {
    it('渲染冒烟:页头与四个 Section 标题', () => {
        render(<ViewTransitionActivityTopic />);

        expect(screen.getByRole('heading', { name: 'ViewTransition 与 Activity' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /ViewTransition 基础/ })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /addTransitionType/ })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /Activity 隐藏保活/ })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /决策指南/ })).toBeInTheDocument();
    });
});

describe('Activity 三栏对照实验', () => {
    it('Activity 栏:隐藏触发 effect 销毁,重新显示后 state 保留', () => {
        render(<ActivityLab />);

        const input = within(screen.getByTestId('lane-activity')).getByPlaceholderText(
            /在「Activity」面板输入/,
        );
        fireEvent.change(input, { target: { value: '保活证据' } });

        // 隐藏:Activity 销毁 effect(清理函数执行,日志留证)
        toggleHidden();
        expect(screen.getByText('[Activity] effect 销毁')).toBeInTheDocument();

        // 重新显示:effect 重新挂载,但 state(输入框内容)原样接上
        toggleHidden();
        const inputAgain = within(screen.getByTestId('lane-activity')).getByPlaceholderText(
            /在「Activity」面板输入/,
        );
        expect(inputAgain).toHaveValue('保活证据');
    });

    it('条件卸载栏:隐藏即销毁,重新显示后 state 丢失', () => {
        render(<ActivityLab />);

        const input = within(screen.getByTestId('lane-unmount')).getByPlaceholderText(
            /在「条件卸载」面板输入/,
        );
        fireEvent.change(input, { target: { value: '会丢的内容' } });

        toggleHidden();
        // 隐藏期间面板被占位提示替换(组件已卸载)
        expect(screen.getByText(/组件已卸载/)).toBeInTheDocument();

        toggleHidden();
        const inputAgain = within(screen.getByTestId('lane-unmount')).getByPlaceholderText(
            /在「条件卸载」面板输入/,
        );
        expect(inputAgain).toHaveValue('');
    });

    it('display:none 栏:隐藏期间 effect 不销毁,重新显示后 state 保留', () => {
        render(<ActivityLab />);

        const input = within(screen.getByTestId('lane-css')).getByPlaceholderText(
            /在「display:none」面板输入/,
        );
        fireEvent.change(input, { target: { value: 'css 保留' } });

        toggleHidden();
        // display:none 不触发任何 effect 清理 —— 这正是它与 Activity 的分水岭
        expect(screen.queryByText('[display:none] effect 销毁')).not.toBeInTheDocument();

        toggleHidden();
        const inputAgain = within(screen.getByTestId('lane-css')).getByPlaceholderText(
            /在「display:none」面板输入/,
        );
        expect(inputAgain).toHaveValue('css 保留');
    });
});
