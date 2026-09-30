/**
 * ============================================================================
 * index.test.tsx — React Compiler 专题测试
 * ============================================================================
 *
 * - 渲染冒烟:页头、SeriesNav、五个 Section 齐备;
 * - 对照实验关键行为:正确手写 memo 挡住无关渲染、真依赖变化放行;
 *   不做记忆化 / 写错的 memo 两种形态下,面板随父组件每次渲染重跑。
 *
 * @module topics/performance/react-compiler/index.test
 */

import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { render } from '../../../test/utils';
import { MemoNoiseDemo } from './components/MemoNoiseDemo';
import ReactCompilerTopic from './index';

describe('React Compiler 专题页', () => {
    it('渲染冒烟:页头、系列导航与五个 Section 齐备', () => {
        render(<ReactCompilerTopic />);

        expect(screen.getByRole('heading', { name: 'React Compiler' })).toBeInTheDocument();
        expect(screen.getByRole('navigation', { name: '性能优化系列导航' })).toBeInTheDocument();

        const sections = screen.getAllByRole('heading', { level: 2 });
        expect(sections).toHaveLength(5);
        expect(sections[0]).toHaveTextContent('Compiler 是什么');
        expect(sections[1]).toHaveTextContent('手写 memo 何时变噪音');
        expect(sections[2]).toHaveTextContent('Rules of React');
        expect(sections[3]).toHaveTextContent('判断框架');
        expect(sections[4]).toHaveTextContent('本站的态度');
    });
});

describe('手写 memo 对照实验', () => {
    // 按钮名带 (tick) 后缀与形态说明文案里的「改无关状态」区分开,避免正则误匹配
    const tickButton = () => screen.getByRole('button', { name: '改无关状态(tick)' });

    it('正确手写 memo:无关 state 变化时面板不渲染,真依赖变化才放行', () => {
        render(<MemoNoiseDemo />);
        // 默认即「正确手写 memo」形态:首次各渲染一次
        expect(screen.getByTestId('parent-renders')).toHaveTextContent('1');
        expect(screen.getByTestId('child-renders')).toHaveTextContent('1');

        // 三次无关更新:父组件照跑,面板被 memo + 稳定 props 挡住
        fireEvent.click(tickButton());
        fireEvent.click(tickButton());
        fireEvent.click(tickButton());
        expect(screen.getByTestId('parent-renders')).toHaveTextContent('4');
        expect(screen.getByTestId('child-renders')).toHaveTextContent('1');

        // 真依赖(quantity)变化:props 变了,memo 放行
        fireEvent.click(screen.getByRole('button', { name: '数量 +1(真依赖变化)' }));
        expect(screen.getByTestId('child-renders')).toHaveTextContent('2');
    });

    it('不做记忆化:父组件每次渲染都拖着面板重跑', () => {
        render(<MemoNoiseDemo />);
        fireEvent.click(screen.getByText('不做记忆化'));
        // 形态切换由 key={mode} 强制重建子树,面板计数从 1 重来
        expect(screen.getByTestId('child-renders')).toHaveTextContent('1');

        fireEvent.click(tickButton());
        fireEvent.click(tickButton());
        expect(screen.getByTestId('child-renders')).toHaveTextContent('3');
    });

    it('写错的 memo:内联 props 击穿浅比较,包了 memo 也照样渲染', () => {
        render(<MemoNoiseDemo />);
        fireEvent.click(screen.getByText('写错的 memo'));
        expect(screen.getByTestId('child-renders')).toHaveTextContent('1');

        fireEvent.click(tickButton());
        expect(screen.getByTestId('child-renders')).toHaveTextContent('2');
    });
});
