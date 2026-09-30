/**
 * @file topics/internals/demos.test.tsx
 *
 * @description 内部机制各页交互演示的行为测试:
 * TimingDemo(layout/rAF/passive 时序)、WalkDemo(DFS 步骤)、QueueDemo(更新队列批处理)、
 * HookSlots(槽位错位)、SliceModel(时间片让出)、PathDemo(捕获/冒泡顺序)。
 */

import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { TimingDemo } from './commit/TimingDemo';
import { WalkDemo } from './fiber/WalkDemo';
import { QueueDemo } from './update-queue/QueueDemo';
import { HookSlots } from './hooks-impl/HookSlots';
import { SliceModel } from './scheduler/SliceModel';
import { PathDemo } from './events/PathDemo';

describe('TimingDemo', () => {
    const originalRaf = window.requestAnimationFrame;

    afterEach(() => {
        window.requestAnimationFrame = originalRaf;
    });

    it('点击后 layout 与 passive 依次入日志,rAF 回调在下一帧补记', () => {
        // jsdom 无 rAF,手工收集回调模拟一帧
        let rafCallback: ((now: number) => void) | null = null;
        window.requestAnimationFrame = ((cb: (now: number) => void) => {
            rafCallback = cb;
            return 1;
        }) as typeof window.requestAnimationFrame;

        render(<TimingDemo />);
        fireEvent.click(screen.getByRole('button', { name: '触发一次更新' }));

        const log = screen.getByRole('list', { name: '提交时序' });
        expect(log).toHaveTextContent('layout · tick 1');
        expect(log).toHaveTextContent('passive · tick 1');
        expect(log).not.toHaveTextContent('rAF');

        act(() => {
            rafCallback?.(0);
        });
        expect(log).toHaveTextContent('rAF · tick 1');
    });

    it('清空后日志归零,且 tick 复位后不再记录 effect', () => {
        window.requestAnimationFrame = (() => 1) as typeof window.requestAnimationFrame;

        render(<TimingDemo />);
        fireEvent.click(screen.getByRole('button', { name: '触发一次更新' }));
        expect(screen.getByRole('list', { name: '提交时序' }).children.length).toBeGreaterThan(0);

        fireEvent.click(screen.getByRole('button', { name: /清\s*空/ }));
        expect(screen.getByRole('list', { name: '提交时序' }).children).toHaveLength(0);
    });
});

describe('WalkDemo', () => {
    it('下一步沿 DFS 顺序走:App → Header → Title(先 begin 后 complete)', () => {
        render(<WalkDemo />);

        expect(screen.getByText(/App · beginWork/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '上一步' })).toBeDisabled();
        expect(screen.getByText('1 / 12')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: '下一步' }));
        expect(screen.getByText(/Header · beginWork/)).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: '下一步' }));
        fireEvent.click(screen.getByRole('button', { name: '下一步' }));
        // 叶子节点没有 child,在本节点 complete
        expect(screen.getByText(/Title · completeWork/)).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: '上一步' }));
        expect(screen.getByText(/Title · beginWork/)).toBeInTheDocument();
    });

    it('走到最后一步后下一步禁用,重置回到第一步', () => {
        render(<WalkDemo />);

        for (let i = 0; i < 12; i += 1) {
            fireEvent.click(screen.getByRole('button', { name: '下一步' }));
        }
        expect(screen.getByText(/App · completeWork/)).toBeInTheDocument();
        expect(screen.getByText('12 / 12')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '下一步' })).toBeDisabled();

        fireEvent.click(screen.getByRole('button', { name: /重\s*置/ }));
        expect(screen.getByText(/App · beginWork/)).toBeInTheDocument();
        expect(screen.getByText('1 / 12')).toBeInTheDocument();
    });
});

describe('QueueDemo', () => {
    it('两次对象式 setN 读到同一快照,结果只 +1', () => {
        render(<QueueDemo />);
        fireEvent.click(screen.getByRole('button', { name: '两次直接 +1' }));
        expect(screen.getByText('当前 n = 1')).toBeInTheDocument();
        expect(screen.getByText(/结果 \+1/)).toBeInTheDocument();
    });

    it('三次函数式更新依次排队,结果 +3', () => {
        render(<QueueDemo />);
        fireEvent.click(screen.getByRole('button', { name: '两次直接 +1' }));
        fireEvent.click(screen.getByRole('button', { name: '三次函数式 +1' }));
        expect(screen.getByText('当前 n = 4')).toBeInTheDocument();
    });

    it('setTimeout 里的两次函数式更新仍被批处理,+2', async () => {
        render(<QueueDemo />);
        fireEvent.click(screen.getByRole('button', { name: '超时里 +1 两次' }));
        expect(await screen.findByText('当前 n = 2')).toBeInTheDocument();
    });
});

describe('HookSlots', () => {
    it('默认三个稳定槽位,插入一个 Hook 后槽位整体错一位', () => {
        render(<HookSlots />);

        const slots = screen.getByRole('list', { name: 'Hook 槽位' });
        expect(slots.children).toHaveLength(3);
        expect(slots).toHaveTextContent('count = 1');

        fireEvent.click(screen.getByRole('button', { name: '中间插入一个 Hook' }));
        expect(slots.children).toHaveLength(4);
        expect(slots).toHaveTextContent('读到了 count 的节点');
        expect(slots).toHaveTextContent('链表已经到头');

        fireEvent.click(screen.getByRole('button', { name: '稳定调用' }));
        expect(slots.children).toHaveLength(3);
    });
});

describe('SliceModel', () => {
    it('预算 5ms 内走完两个单元,第三个单元让出主线程开新片', () => {
        render(<SliceModel />);

        const stepButton = screen.getByRole('button', { name: '走一个工作单元' });
        fireEvent.click(stepButton);
        fireEvent.click(stepButton);
        expect(screen.getByText(/本片已用 4ms/)).toBeInTheDocument();

        // 第三击后 spent 到 6ms ≥ 预算,标记让出并清零
        fireEvent.click(stepButton);
        expect(screen.getByText(/本片已用 0ms/)).toBeInTheDocument();
        const frames = screen.getByRole('list', { name: '时间片' });
        expect(frames).toHaveTextContent('片 1');
        expect(frames).toHaveTextContent('App → Header → Title');
        expect(frames).toHaveTextContent('让出主线程');
    });

    it('走完 6 个单元后按钮禁用,重置后回到起点', () => {
        render(<SliceModel />);

        const stepButton = screen.getByRole('button', { name: '走一个工作单元' });
        for (let i = 0; i < 6; i += 1) {
            fireEvent.click(stepButton);
        }
        expect(stepButton).toBeDisabled();

        fireEvent.click(screen.getByRole('button', { name: /重\s*置/ }));
        expect(stepButton).toBeEnabled();
        expect(screen.getByText(/本片已用 0ms/)).toBeInTheDocument();
    });
});

describe('PathDemo', () => {
    it('点击按钮后按捕获→目标→冒泡记录完整路径', () => {
        render(<PathDemo />);

        fireEvent.click(screen.getByRole('button', { name: '点在按钮上' }));

        const entries = Array.from(
            screen.getByRole('list', { name: '事件路径' }).children,
        ).map((li) => li.textContent);
        expect(entries).toEqual([
            'App 捕获',
            'List 捕获',
            'Button 冒泡',
            'List 冒泡',
            'App 冒泡',
        ]);

        fireEvent.click(screen.getByRole('button', { name: /清\s*空/ }));
        expect(screen.getByRole('list', { name: '事件路径' }).children).toHaveLength(0);
    });
});
