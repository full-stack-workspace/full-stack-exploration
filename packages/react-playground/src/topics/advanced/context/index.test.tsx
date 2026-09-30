/**
 * @file topics/advanced/context/index.test.tsx
 *
 * @description Context 专题页冒烟:机制说明与站点级 Theme/User 探针能渲染。
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

import { ThemeProvider } from '../../../context/ThemeProvider';
import { MOCK_USERS, UserProvider } from '../../../context/UserProvider';
import UseContextTopic from './index';

function renderTopic() {
    return render(
        <ThemeProvider>
            <UserProvider>
                <MemoryRouter>
                    <UseContextTopic />
                </MemoryRouter>
            </UserProvider>
        </ThemeProvider>,
    );
}

describe('Context API 专题', () => {
    beforeEach(() => {
        localStorage.clear();
        document.documentElement.classList.remove('light', 'dark');
    });

    afterEach(() => {
        localStorage.clear();
        document.documentElement.classList.remove('light', 'dark');
    });

    it('渲染核心机制标题与嵌套 Provider 演示', () => {
        renderTopic();
        expect(screen.getByRole('heading', { name: 'Context API' })).toBeInTheDocument();
        expect(screen.getByText(/外层:/)).toBeInTheDocument();
        expect(screen.getByText('包厢 A')).toBeInTheDocument();
        expect(screen.getByText('大厅')).toBeInTheDocument();
    });

    it('站点探针能切换模拟用户', async () => {
        const user = userEvent.setup();
        renderTopic();

        expect(screen.getByText(`${MOCK_USERS[0].name} (${MOCK_USERS[0].role})`)).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: `换成 ${MOCK_USERS[1].name}` }));

        expect(screen.getByText(`${MOCK_USERS[1].name} (${MOCK_USERS[1].role})`)).toBeInTheDocument();
    });

    it('退出后回到未登录,模拟登录恢复用户', async () => {
        const user = userEvent.setup();
        renderTopic();

        await user.click(screen.getByRole('button', { name: /退\s*出/ }));
        expect(screen.getByText('未登录')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /退\s*出/ })).not.toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: '模拟登录' }));
        expect(screen.getByText(`${MOCK_USERS[0].name} (${MOCK_USERS[0].role})`)).toBeInTheDocument();
    });

    it('胖 Context 连坐:无关 tick +1 拖着 count 读者重渲染;拆分后不再连坐', async () => {
        const user = userEvent.setup();
        renderTopic();

        const fatPanel = screen.getByText('胖 Context(对照)').parentElement!;
        const splitPanel = screen.getByText('拆分后').parentElement!;

        // 初始各渲染 1 次(非 StrictMode)
        expect(within(fatPanel).getByText(/只读 count = 0/)).toHaveTextContent('本组件渲染 1 次');
        expect(within(splitPanel).getByText(/只读 count = 0/)).toHaveTextContent('本组件渲染 1 次');

        // 胖 Context:value 对象每次 render 都是新引用,count 读者被连坐
        await user.click(within(fatPanel).getByRole('button', { name: '无关 tick +1' }));
        expect(within(fatPanel).getByText(/只读 count = 0/)).toHaveTextContent('本组件渲染 2 次');
        expect(within(fatPanel).getByText(/只读 tick = 1/)).toBeInTheDocument();

        // 拆分后:tick 走自己的通道,只读 count 的组件不动
        await user.click(within(splitPanel).getByRole('button', { name: '无关 tick +1' }));
        expect(within(splitPanel).getByText(/只读 count = 0/)).toHaveTextContent('本组件渲染 1 次');
        expect(within(splitPanel).getByText(/只读 tick = 1/)).toBeInTheDocument();

        // 拆分后 count 通道正常工作
        await user.click(within(splitPanel).getByRole('button', { name: 'count +1' }));
        expect(within(splitPanel).getByText(/只读 count = 1/)).toBeInTheDocument();
    });

    it('children 抬出去:Provider 内部 setState 不带动未订阅的叶子', async () => {
        const user = userEvent.setup();
        renderTopic();

        const leaf = screen.getByText(/未订阅任何 Context/);
        expect(leaf).toHaveTextContent('渲染 1 次');

        const button = screen.getByRole('button', { name: /Provider 内部状态 \+1/ });
        await user.click(button);
        expect(button).toHaveTextContent('当前 1');
        expect(leaf).toHaveTextContent('渲染 1 次');
    });

    it('页面级 Locale 通道:切换语言只改 Provider 内的文案', async () => {
        const user = userEvent.setup();
        renderTopic();

        expect(screen.getByText('你好,欢迎来到 Context 专题')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'English' }));
        expect(screen.getByText('Hello from the Context topic')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /中\s*文/ }));
        expect(screen.getByText('你好,欢迎来到 Context 专题')).toBeInTheDocument();
    });
});
