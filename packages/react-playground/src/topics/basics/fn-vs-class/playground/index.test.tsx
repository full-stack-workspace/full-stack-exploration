/**
 * ============================================================================
 * index.test.tsx — 函数组件与类组件对照演练
 * ============================================================================
 *
 * - 函数计数器 +1 只改函数栏
 * - 换用户后 class 草稿卡住,函数栏随 key 重置
 * - 换房间日志出现成对的退订 / 订阅
 *
 * @module topics/basics/fn-vs-class/playground/index.test
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

import FnVsClassPlayground from './index';

function renderPlayground() {
    return render(
        <MemoryRouter>
            <FnVsClassPlayground />
        </MemoryRouter>,
    );
}

describe('函数组件与类组件 · 对照演练', () => {
    it('函数栏 +1 只增加函数 count', async () => {
        const user = userEvent.setup();
        renderPlayground();

        expect(screen.getByLabelText('函数 当前 count')).toHaveTextContent('当前 count = 0');
        expect(screen.getByLabelText('class 当前 count')).toHaveTextContent('当前 count = 0');
        await user.click(screen.getByRole('button', { name: '函数 · +1' }));
        expect(screen.getByLabelText('函数 当前 count')).toHaveTextContent('当前 count = 1');
        expect(screen.getByLabelText('class 当前 count')).toHaveTextContent('当前 count = 0');
    });

    it('换用户后 class 仍保留手改草稿,函数栏重置', async () => {
        const user = userEvent.setup();
        renderPlayground();

        const classInput = screen.getByLabelText('class 抄来的名字');
        await user.clear(classInput);
        await user.type(classInput, '草稿卡住');
        await user.click(screen.getByRole('button', { name: '换成下一位用户' }));

        expect(classInput).toHaveValue('草稿卡住');
        expect(screen.getByLabelText('函数按 key 重置的草稿')).toHaveValue('陈默');
    });

    it('切换房间会先退订再订阅', async () => {
        const user = userEvent.setup();
        renderPlayground();

        await user.click(screen.getByRole('button', { name: '切换房间 工单' }));
        const log = screen.getByLabelText('订阅日志');
        expect(log).toHaveTextContent('函数 退订 大厅');
        expect(log).toHaveTextContent('函数 订阅 工单');
        expect(log).toHaveTextContent('class 退订 大厅');
        expect(log).toHaveTextContent('class 订阅 工单');
    });
});
