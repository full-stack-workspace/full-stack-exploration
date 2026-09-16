/**
 * ============================================================================
 * index.test.tsx — transition-deferred 演练页测试
 * ============================================================================
 *
 * - deferred 模式:输入即时回显,列表渲染值滞后(渲染序列中存在
 *   keyword 与 listKeyword 不一致的中间态),最终一致;
 * - stale 场景:无保护模式复现「旧响应覆盖新结果」,优化模式自动废弃。
 * 慢渲染组件统一 perItemCost 传 0,避免拖慢 CI。
 *
 * @module topics/performance/transition-deferred/index.test
 */

import { useLayoutEffect } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { InputLagDemo } from './components/InputLagDemo';
import type { RenderSnapshot } from './components/InputLagDemo';
import { StaleSearchDemo } from './components/StaleSearchDemo';
import type { SearchFn } from './components/StaleSearchDemo';
import type { SearchResponse } from '../lab/mockSearchApi';

/** 手动控制 settle 时机的 Promise */
const createDeferred = <T,>() => {
    let resolve!: (value: T) => void;
    let reject!: (error: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
};

/** 按关键字挂起响应的可控 searchFn */
const createControllableSearch = () => {
    const pending = new Map<string, ReturnType<typeof createDeferred<SearchResponse>>>();
    const searchFn: SearchFn = (keyword) => {
        const deferred = createDeferred<SearchResponse>();
        pending.set(keyword, deferred);
        return deferred.promise;
    };
    return {
        searchFn,
        respond(keyword: string, results: string[] = [`结果:${keyword}`]) {
            pending.get(keyword)?.resolve({ keyword, results });
        },
    };
};

describe('场景一:输入阻塞', () => {
    it('首屏:首次提交只含输入区与骨架,昂贵列表在低优先级更新中挂载', async () => {
        // 探针:布局效应在「首次 commit 完成、被动效应调度 transition 之前」执行,
        // 此刻记录的 DOM 才是真实首帧(test 环境的 act 会把 transition 一并 flush,
        // 直接断言最终 DOM 观察不到中间态)
        let listInFirstCommit: boolean | null = null;
        const Probe = () => {
            useLayoutEffect(() => {
                listInFirstCommit = document.querySelector('li') !== null;
            }, []);
            return null;
        };

        render(
            <>
                <InputLagDemo perItemCost={0} itemCount={10} />
                <Probe />
            </>,
        );

        // 首帧:输入区已可交互,昂贵列表未上屏(骨架占位)
        expect(screen.getByPlaceholderText(/输入过滤关键字/)).toBeInTheDocument();
        expect(listInFirstCommit).toBe(false);

        // 低优先级挂载完成后列表出现
        expect(await screen.findByText('条目 #1')).toBeInTheDocument();
    });

    it('deferred 模式:输入即时回显,列表渲染值滞后但最终一致', () => {
        const snapshots: RenderSnapshot[] = [];
        render(
            <InputLagDemo
                perItemCost={0}
                itemCount={10}
                onRenderSnapshot={(s) => snapshots.push(s)}
            />,
        );

        const input = screen.getByPlaceholderText(/输入过滤关键字/);
        fireEvent.change(input, { target: { value: 'ab' } });

        // 输入即时:受控值立即更新
        expect(input).toHaveValue('ab');

        // 列表滞后:渲染序列中必然存在「输入已变、deferred 值未追上」的中间态
        const lagFrame = snapshots.find((s) => s.keyword === 'ab' && s.listKeyword === '');
        expect(lagFrame).toBeTruthy();

        // 最终一致:最后一次渲染二者相同
        const last = snapshots[snapshots.length - 1];
        expect(last).toEqual({ keyword: 'ab', listKeyword: 'ab' });
    });
});

describe('场景三:stale 结果', () => {
    it('无保护模式:慢的旧响应后返回,覆盖新结果并触发 stale 警告', async () => {
        const api = createControllableSearch();
        render(<StaleSearchDemo searchFn={api.searchFn} />);

        const input = screen.getByPlaceholderText(/快速输入/);
        fireEvent.change(input, { target: { value: 'ab' } });
        fireEvent.change(input, { target: { value: 'abc' } });

        // 新响应先返回 → 生效
        await act(async () => api.respond('abc'));
        expect(screen.queryByText(/结果已过期/)).not.toBeInTheDocument();

        // 旧响应后返回 → 无保护,直接覆盖 → stale 复现
        await act(async () => api.respond('ab'));
        expect(screen.getByText(/结果已过期/)).toBeInTheDocument();
        expect(screen.getByText(/「ab」的响应,但当前输入是「abc」/)).toBeInTheDocument();
    });

    it('优化模式:deferred + 竞态处理,旧响应被废弃,不出现 stale', async () => {
        const api = createControllableSearch();
        render(<StaleSearchDemo searchFn={api.searchFn} />);

        // 切到优化模式
        fireEvent.click(screen.getByText('deferred + 竞态处理'));

        const input = screen.getByPlaceholderText(/快速输入/);
        fireEvent.change(input, { target: { value: 'ab' } });
        fireEvent.change(input, { target: { value: 'abc' } });

        // 乱序返回:新的先到、旧的后到
        await act(async () => api.respond('abc'));
        await act(async () => api.respond('ab'));

        // 旧响应被废弃:结果仍对应当前输入,无 stale 警告
        expect(screen.queryByText(/结果已过期/)).not.toBeInTheDocument();
        expect(screen.getByText('结果:abc')).toBeInTheDocument();
    });
});
