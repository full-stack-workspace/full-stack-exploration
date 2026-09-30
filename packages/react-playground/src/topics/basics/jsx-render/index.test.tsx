/**
 * @file topics/basics/jsx-render/index.test.tsx
 *
 * @description JSX 与渲染专题:四范式条件渲染(含 0 的坑)、key 策略对组件状态的影响、
 * 异步四态状态机、权限渲染、配置驱动 + 未知类型兜底。
 */

import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import JsxRenderTopic from './index';

function renderTopic() {
    return render(
        <MemoryRouter>
            <JsxRenderTopic />
        </MemoryRouter>,
    );
}

describe('JSX 与渲染专题', () => {
    it('渲染六个小节的演示与标题', () => {
        renderTopic();
        expect(screen.getByRole('heading', { name: 'JSX 与渲染' })).toBeInTheDocument();
        expect(screen.getByText('JSX 的本质:元素是普通对象')).toBeInTheDocument();
        expect(screen.getByText('条件渲染四范式')).toBeInTheDocument();
        expect(screen.getByText('生产场景三:配置驱动渲染')).toBeInTheDocument();
    });

    it('&& 短路:count 减到 0 时错误写法真的渲染出 0,正确写法渲染为空', () => {
        renderTopic();

        fireEvent.click(screen.getByRole('button', { name: '-' }));
        expect(screen.getByText('count = 0')).toBeInTheDocument();
        expect(screen.getByText('← 屏幕上真的出现了一个 0!')).toBeInTheDocument();
        expect(screen.getByText('← false 渲染为空,干净')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: '+' }));
        expect(screen.getByText('count = 1')).toBeInTheDocument();
        expect(screen.queryByText('← 屏幕上真的出现了一个 0!')).not.toBeInTheDocument();
    });

    it('三元与提前 return:切换登录态、隐藏详情后对应 DOM 消失', () => {
        renderTopic();

        expect(screen.getByText(/欢迎回来,管理员/)).toBeInTheDocument();
        fireEvent.click(screen.getByRole('switch'));
        expect(screen.getByText('请先登录后再继续操作')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: '隐藏详情' }));
        expect(screen.queryByText(/详情面板:只有 visible/)).not.toBeInTheDocument();
        expect(screen.getByText(/DetailPanel 内部 if \(!visible\) return null/)).toBeInTheDocument();
    });

    it('key = id 时备注跟随数据,头部插入后不串行', async () => {
        renderTopic();

        const firstInput = screen.getAllByPlaceholderText('输入备注,再点「头部插入」观察')[0];
        fireEvent.change(firstInput, { target: { value: '给 Alice 的备注' } });

        fireEvent.click(screen.getByRole('button', { name: '头部插入一项' }));

        // key = id:新行插到最前,备注跟着 Alice 走到第二行
        const inputs = screen.getAllByPlaceholderText('输入备注,再点「头部插入」观察');
        expect(inputs).toHaveLength(4);
        expect(inputs[0]).toHaveValue('');
        expect(inputs[1]).toHaveValue('给 Alice 的备注');

        fireEvent.click(screen.getByRole('button', { name: /重\s*置/ }));
        expect(screen.getAllByPlaceholderText('输入备注,再点「头部插入」观察')).toHaveLength(3);
    });

    it('权限渲染:编辑看不到发布/删除,访客什么都不渲染,管理员可见运营数据', () => {
        renderTopic();

        // 默认编辑:create + edit
        expect(screen.getByRole('button', { name: '新建文章' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /编\s*辑/ })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /发\s*布/ })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /删\s*除/ })).not.toBeInTheDocument();
        expect(screen.getByText(/运营数据面板仅管理员可见/)).toBeInTheDocument();

        fireEvent.click(screen.getByText('访客'));
        expect(screen.queryByRole('button', { name: '新建文章' })).not.toBeInTheDocument();
        expect(screen.getByText(/访客身份:所有操作按钮都不渲染/)).toBeInTheDocument();

        fireEvent.click(screen.getByText('管理员'));
        expect(screen.getByRole('button', { name: /删\s*除/ })).toBeInTheDocument();
        expect(screen.getByText(/运营数据面板:今日阅读/)).toBeInTheDocument();
    });

    it('配置驱动:配置 B 含未注册的 heatmap,渲染 UnknownWidget 兜底', () => {
        renderTopic();

        expect(screen.getByText('今日订单')).toBeInTheDocument();
        expect(screen.queryByText(/未知 widget 类型/)).not.toBeInTheDocument();

        fireEvent.click(screen.getByText('配置 B(发布看板,含未知类型)'));
        expect(screen.getByText('在线人数')).toBeInTheDocument();
        expect(screen.getByText('未知 widget 类型:heatmap')).toBeInTheDocument();
    });
});

describe('JSX 与渲染专题 · 异步四态', () => {
    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    const runOnce = (randomValue: number) => {
        vi.spyOn(Math, 'random').mockReturnValue(randomValue);
        renderTopic();
        fireEvent.click(screen.getByRole('button', { name: '发起请求' }));
        // loading 骨架出现
        expect(screen.getByLabelText('加载中')).toBeInTheDocument();
        act(() => {
            vi.advanceTimersByTime(800);
        });
    };

    it('成功分支:渲染文章列表', () => {
        vi.useFakeTimers();
        runOnce(0.9);
        expect(screen.getByText('React 19 渲染机制速览')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /重新请求/ })).toBeInTheDocument();
    });

    it('空数据分支:empty 是独立界面', () => {
        vi.useFakeTimers();
        runOnce(0.4);
        expect(screen.getByText(/暂无数据/)).toBeInTheDocument();
    });

    it('失败分支:展示错误与重试,重试后回到 loading', () => {
        vi.useFakeTimers();
        runOnce(0.1);
        expect(screen.getByText('请求超时,请检查网络后重试')).toBeInTheDocument();

        vi.spyOn(Math, 'random').mockReturnValue(0.9);
        fireEvent.click(screen.getByRole('button', { name: /重\s*试/ }));
        expect(screen.getByLabelText('加载中')).toBeInTheDocument();
        act(() => {
            vi.advanceTimersByTime(800);
        });
        expect(screen.getByText('React 19 渲染机制速览')).toBeInTheDocument();
    });
});
