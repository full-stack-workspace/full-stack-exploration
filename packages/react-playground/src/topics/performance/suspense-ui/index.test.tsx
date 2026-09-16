/**
 * ============================================================================
 * index.test.tsx — suspense-ui 演练页测试
 * ============================================================================
 *
 * - 初始加载:先出形似骨架(fallback),资源就绪后显示内容;
 * - 回退闪烁:transition 模式更新时不出现 fallback、旧内容保持;
 *   裸 Suspense 模式则回退到骨架(对照)。
 * 数据资源统一注入可控 Promise,慢渲染组件 perItemCost 传 0。
 *
 * @module topics/performance/suspense-ui/index.test
 */

import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { wrapPromise } from '../lab/resource';
import type { SuspenseResource } from '../lab/resource';
import type { SearchResponse } from '../lab/mockSearchApi';
import { InitialSkeletonDemo } from './components/InitialSkeletonDemo';
import { NoFallbackFlashDemo } from './components/NoFallbackFlashDemo';

/** 手动控制 settle 时机的 Promise */
const createDeferred = <T,>() => {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((res) => {
        resolve = res;
    });
    return { promise, resolve };
};

/** 按查询词挂起的可控资源工厂 */
const createControllableResources = () => {
    const pending = new Map<string, ReturnType<typeof createDeferred<SearchResponse>>>();
    const createResource = (query: string): SuspenseResource<SearchResponse> => {
        const deferred = createDeferred<SearchResponse>();
        pending.set(query, deferred);
        return wrapPromise(deferred.promise);
    };
    return {
        createResource,
        respond(query: string) {
            pending.get(query)?.resolve({ keyword: query, results: [`结果:${query}`] });
        },
    };
};

describe('场景 0:初始骨架', () => {
    it('初始显示 fallback 骨架,数据资源就绪后显示内容', async () => {
        const api = createControllableResources();
        render(<InitialSkeletonDemo createResource={() => api.createResource('init')} />);

        // 资源未就绪:fallback 骨架接管
        expect(screen.getByLabelText('数据资源骨架')).toBeInTheDocument();
        expect(screen.queryByText('结果:init')).not.toBeInTheDocument();

        await act(async () => api.respond('init'));

        expect(screen.queryByLabelText('数据资源骨架')).not.toBeInTheDocument();
        expect(screen.getByText('结果:init')).toBeInTheDocument();
    });
});

describe('场景 1:回退闪烁', () => {
    it('transition 模式:更新时不出现 fallback,旧内容保持可见', async () => {
        const api = createControllableResources();
        render(<NoFallbackFlashDemo createResource={api.createResource} />);

        // 初始加载完成
        await act(async () => api.respond('cache'));
        expect(screen.getByText('结果:cache')).toBeInTheDocument();

        // 切换查询:旧内容保持,fallback 不出现
        fireEvent.click(screen.getByText('查询「render」'));
        expect(screen.getByText('结果:cache')).toBeInTheDocument();
        expect(screen.queryByLabelText('查询结果骨架')).not.toBeInTheDocument();

        // 新数据就绪:一次性切换
        await act(async () => api.respond('render'));
        expect(screen.getByText('结果:render')).toBeInTheDocument();
    });

    it('裸 Suspense 模式:更新时回退到骨架(闪烁对照)', async () => {
        const api = createControllableResources();
        render(<NoFallbackFlashDemo createResource={api.createResource} />);

        await act(async () => api.respond('cache'));
        expect(screen.getByText('结果:cache')).toBeInTheDocument();

        // 切到裸 Suspense 模式再换查询
        fireEvent.click(screen.getByText('裸 Suspense(回退闪烁)'));
        fireEvent.click(screen.getByText('查询「render」'));

        // 已显示内容被 React 保留但隐藏(display:none),骨架回退接管
        expect(screen.getByText('结果:cache')).not.toBeVisible();
        expect(screen.getByLabelText('查询结果骨架')).toBeVisible();

        await act(async () => api.respond('render'));
        expect(screen.getByText('结果:render')).toBeInTheDocument();
    });
});
