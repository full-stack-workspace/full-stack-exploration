/**
 * ============================================================================
 * index.test.tsx — React 19 Actions 专题
 * ============================================================================
 *
 * - 页面冒烟:五个 Section 标题齐备
 * - useOptimistic:点赞后立即 +1(不等响应),成功后保持
 * - useOptimistic 失败路径:乐观值自动回滚到原值并给出提示
 * - useActionState:服务端拒绝时错误回显,成功时评论入列
 * - useFormStatus:提交期间表单内探针 pending=true、表单外恒为 false
 *
 * @module topics/hooks/actions/index.test
 */

import { describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';

import { render, screen, within, waitFor } from '../../../test/utils';
import ActionsTopic from './index';
import { OptimisticLists } from './components/OptimisticLists';
import { ActionStateForm } from './components/ActionStateForm';
import { FormStatusDemo } from './components/FormStatusDemo';

const FIRST_MESSAGE = /^点赞:Actions 把提交逻辑/;

describe('React 19 Actions · 专题页', () => {
    it('冒烟:页头与五个 Section 标题渲染齐备', () => {
        render(<ActionsTopic />);

        expect(screen.getByRole('heading', { name: 'React 19 Actions' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /form action 基础/ })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /useActionState/ })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /useOptimistic/ })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /useFormStatus/ })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /决策指南/ })).toBeInTheDocument();
    });

    it('useOptimistic:点击点赞后界面立即 +1,请求成功后保持', async () => {
        const user = userEvent.setup();
        render(<OptimisticLists delay={600} />);

        const optimisticPanel = screen.getByTestId('optimistic-panel');
        const plainPanel = screen.getByTestId('plain-panel');
        const optimisticBtn = within(optimisticPanel).getByRole('button', { name: FIRST_MESSAGE });
        expect(optimisticBtn).toHaveTextContent('3');

        await user.click(optimisticBtn);
        // 关键断言:600ms 的模拟请求远未返回,乐观值已经渲染
        expect(optimisticBtn).toHaveTextContent('4');
        // 对照面板未被触碰
        expect(within(plainPanel).getByRole('button', { name: FIRST_MESSAGE })).toHaveTextContent('3');

        // 请求成功:真实 state 提交为 +1,与乐观值无缝衔接
        await waitFor(() => expect(optimisticBtn).toHaveTextContent('4'), { timeout: 3000 });
    });

    it('useOptimistic:注入失败后乐观值自动回滚到原值', async () => {
        const user = userEvent.setup();
        render(<OptimisticLists delay={300} />);

        await user.click(screen.getByRole('checkbox', { name: /注入失败/ }));

        const optimisticPanel = screen.getByTestId('optimistic-panel');
        const btn = within(optimisticPanel).getByRole('button', { name: FIRST_MESSAGE });

        await user.click(btn);
        // 失败注入下依旧先乐观 +1
        expect(btn).toHaveTextContent('4');

        // 请求失败:真实 state 从未变化,transition 结束后回落到 3,并出现回滚提示
        await waitFor(() => expect(btn).toHaveTextContent('3'), { timeout: 3000 });
        expect(within(optimisticPanel).getByRole('status')).toHaveTextContent('已自动回滚');
    });

    it('useActionState:服务端拒绝时错误回显,成功时评论入列', async () => {
        const user = userEvent.setup();
        render(<ActionStateForm delay={50} />);

        const textarea = screen.getByLabelText('评论内容');
        const submit = screen.getByRole('button', { name: '发布评论' });

        // 失败路径:内容含「失败」触发服务端拒绝,错误 return 进 state 回显
        await user.type(textarea, '这条会触发失败');
        await user.click(submit);
        await waitFor(() =>
            expect(screen.getByRole('alert')).toHaveTextContent('服务端拒绝了这条评论'),
        );
        // 失败不污染已有列表(此时列表为空,组件渲染占位文案)
        expect(screen.getByText(/还没有评论/)).toBeInTheDocument();

        // 成功路径:action 返回值替换 state,评论入列并提示成功
        await user.clear(textarea);
        await user.type(textarea, '第一条正常评论');
        await user.click(submit);
        await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('发布成功'));
        expect(screen.getByLabelText('评论列表')).toHaveTextContent('第一条正常评论');
        // 失败后留下的错误提示应被新的成功 state 覆盖
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('useFormStatus:提交期间表单内 pending=true,表单外恒为 false', async () => {
        const user = userEvent.setup();
        render(<FormStatusDemo delay={300} />);

        await user.type(screen.getByLabelText('反馈内容'), '按钮 loading 很顺滑');
        await user.click(screen.getByRole('button', { name: '提交反馈' }));

        // 关键断言:子组件读到了父表单的 pending,按钮自己进入 loading
        expect(screen.getByRole('button', { name: '提交中…' })).toBeDisabled();
        expect(screen.getByTestId('表单内探针')).toHaveTextContent('pending = true');
        // useFormStatus 只能向上找祖先 form,表单外永远 false
        expect(screen.getByTestId('表单外探针')).toHaveTextContent('pending = false');

        await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('已收到反馈'));
        expect(screen.getByTestId('表单内探针')).toHaveTextContent('pending = false');
    });
});
