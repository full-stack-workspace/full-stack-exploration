/**
 * @file Todo.test.tsx
 *
 * @description Todo 页面集成测试
 * 通过完整渲染 <Todo /> 验证添加、筛选、操作、持久化等端到端行为。
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '../../../test/utils';
import Todo from './index';
import { TODO_STORAGE_KEY } from './types';
import type { TodoItem } from './types';

/** 向输入框输入文字并点击添加，避免重复代码 */
const addTodo = (text: string) => {
    fireEvent.change(screen.getByPlaceholderText('输入新任务，回车添加…'), {
        target: { value: text },
    });
    fireEvent.click(screen.getByRole('button', { name: '添加' }));
};

describe('Todo 页面 — 初始渲染', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('空列表时显示空态提示', () => {
        render(<Todo />);
        expect(screen.getByText('任务清单是空的')).toBeInTheDocument();
    });

    it('localStorage 有缓存数据时恢复任务列表', () => {
        const cached: TodoItem[] = [
            { id: '1', text: '缓存任务', completed: false, priority: 'medium', createdAt: 1 },
        ];
        localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(cached));

        render(<Todo />);
        expect(screen.getByText('缓存任务')).toBeInTheDocument();
    });
});

describe('Todo 页面 — 添加任务', () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => localStorage.clear());

    it('输入文本后点击添加按钮，任务出现在列表，输入框清空', () => {
        render(<Todo />);
        addTodo('买牛奶');

        expect(screen.getByText('买牛奶')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('输入新任务，回车添加…')).toHaveValue('');
    });

    it('输入文本后按 Enter，任务出现在列表', () => {
        render(<Todo />);
        const input = screen.getByPlaceholderText('输入新任务，回车添加…');
        fireEvent.change(input, { target: { value: '跑步' } });
        fireEvent.keyDown(input, { key: 'Enter' });

        expect(screen.getByText('跑步')).toBeInTheDocument();
    });

    it('输入框为空时添加按钮 disabled，列表不新增任务', () => {
        render(<Todo />);
        const btn = screen.getByRole('button', { name: '添加' });
        expect(btn).toBeDisabled();
        // 确保空态文字仍在（没有新增任务）
        expect(screen.getByText('任务清单是空的')).toBeInTheDocument();
    });

    it('输入纯空格不添加任务', () => {
        render(<Todo />);
        fireEvent.change(screen.getByPlaceholderText('输入新任务，回车添加…'), {
            target: { value: '   ' },
        });
        // 空格输入后按钮仍 disabled
        expect(screen.getByRole('button', { name: '添加' })).toBeDisabled();
    });

    it('新任务以选中优先级添加，优先级徽章文字与选择一致', () => {
        render(<Todo />);
        // 切换优先级到"高"
        fireEvent.click(screen.getByRole('button', { name: '高' }));
        addTodo('高优先级任务');

        // 任务列表中应出现高优先级标识
        const badges = screen.getAllByTitle('点击切换优先级');
        expect(badges[0]).toHaveTextContent('高');
    });
});

describe('Todo 页面 — 筛选', () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => localStorage.clear());

    const setupTodos = () => {
        render(<Todo />);
        addTodo('未完成任务');
        addTodo('已完成任务');
        // 标记第二个为已完成（最新添加在列表最上方，索引 0）
        // 未完成任务是第二条，找到对应 checkbox
        const checkboxes = screen.getAllByLabelText('标记为已完成');
        fireEvent.click(checkboxes[0]); // 把"已完成任务"标为完成
    };

    it('点击"待完成"tab，已完成任务不可见', () => {
        setupTodos();
        fireEvent.click(screen.getByRole('button', { name: '待完成' }));

        expect(screen.queryByText('已完成任务')).not.toBeInTheDocument();
        expect(screen.getByText('未完成任务')).toBeInTheDocument();
    });

    it('点击"已完成"tab，未完成任务不可见', () => {
        setupTodos();
        fireEvent.click(screen.getByRole('button', { name: '已完成' }));

        expect(screen.queryByText('未完成任务')).not.toBeInTheDocument();
        expect(screen.getByText('已完成任务')).toBeInTheDocument();
    });

    it('筛选无结果时显示"当前筛选下没有任务"', () => {
        render(<Todo />);
        addTodo('一个未完成的任务');
        // 筛选"已完成"，无结果
        fireEvent.click(screen.getByRole('button', { name: '已完成' }));

        expect(screen.getByText('当前筛选下没有任务')).toBeInTheDocument();
    });
});

describe('Todo 页面 — 任务操作', () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => {
        localStorage.clear();
        // 确保 fake timers 不泄漏到后续测试（即使测试中途失败）
        vi.useRealTimers();
    });

    it('点击 checkbox 标记完成，文本出现删除线', () => {
        render(<Todo />);
        addTodo('待完成任务');

        fireEvent.click(screen.getByLabelText('标记为已完成'));
        expect(screen.getByText('待完成任务').className).toContain('line-through');
    });

    it('点击"全部完成"，所有任务被标记，checkbox aria-label 全部变为"标记为未完成"', () => {
        render(<Todo />);
        addTodo('任务 A');
        addTodo('任务 B');

        fireEvent.click(screen.getByRole('button', { name: '全部完成' }));
        const unchecks = screen.getAllByLabelText('标记为未完成');
        expect(unchecks).toHaveLength(2);
    });

    it('全部已完成时，"全部完成"按钮文字变为"取消全选"', () => {
        render(<Todo />);
        addTodo('唯一任务');
        fireEvent.click(screen.getByLabelText('标记为已完成'));

        expect(screen.getByRole('button', { name: '取消全选' })).toBeInTheDocument();
    });

    it('点击"清除已完成"，已完成任务从列表消失', () => {
        render(<Todo />);
        addTodo('待删除任务');
        fireEvent.click(screen.getByLabelText('标记为已完成'));
        fireEvent.click(screen.getByRole('button', { name: /清除已完成/ }));

        expect(screen.queryByText('待删除任务')).not.toBeInTheDocument();
    });

    it('第一次点击"全部清空"出现二次确认文案', () => {
        render(<Todo />);
        addTodo('任务');

        fireEvent.click(screen.getByRole('button', { name: '全部清空' }));
        expect(screen.getByText('再次点击确认清空')).toBeInTheDocument();
    });

    it('3 秒内未确认，"全部清空"按钮自动恢复', async () => {
        vi.useFakeTimers();
        render(<Todo />);
        addTodo('任务');

        fireEvent.click(screen.getByRole('button', { name: '全部清空' }));
        expect(screen.getByText('再次点击确认清空')).toBeInTheDocument();

        // 用 async act 推进虚拟时钟并等待 React 状态更新完成
        await act(async () => {
            vi.advanceTimersByTime(3000);
        });

        // 不依赖 waitFor（其内部使用 setInterval，在 fake timers 下会死锁）
        expect(screen.getByRole('button', { name: '全部清空' })).toBeInTheDocument();
    });

    it('二次点击确认清空，列表清空并显示空态提示', () => {
        render(<Todo />);
        addTodo('任务 1');
        addTodo('任务 2');

        // 第一次点击
        fireEvent.click(screen.getByRole('button', { name: '全部清空' }));
        // 第二次确认
        fireEvent.click(screen.getByRole('button', { name: '再次点击确认清空' }));

        expect(screen.getByText('任务清单是空的')).toBeInTheDocument();
    });
});

describe('Todo 页面 — 数据持久化', () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => localStorage.clear());

    it('添加任务后 localStorage 写入正确数据', () => {
        const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
        render(<Todo />);
        // addTodo 内部 fireEvent 已被 RTL 包裹在 act 中，useEffect 会同步刷新
        addTodo('持久化任务');

        const calls = setItemSpy.mock.calls.filter(([key]) => key === TODO_STORAGE_KEY);
        expect(calls.length).toBeGreaterThan(0);
        const lastCall = calls[calls.length - 1];
        const stored = JSON.parse(lastCall[1] as string) as TodoItem[];
        expect(stored.some(t => t.text === '持久化任务')).toBe(true);
    });
});
