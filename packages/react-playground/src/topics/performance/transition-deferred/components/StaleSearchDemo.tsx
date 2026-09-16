/**
 * ============================================================================
 * StaleSearchDemo.tsx — 场景三:stale 结果(旧响应覆盖新结果)
 * ============================================================================
 *
 * 搜索框 + 随机延迟 mock 接口,对照两种模式:
 * - 无保护:每次输入直接发请求并写入,慢的旧响应后返回会覆盖新结果
 *   (响应回显关键字 ≠ 当前输入时标红警告);
 * - 优化:deferred 值 + useRequest 竞态处理(序号 + AbortController,
 *   复用 custom-hooks 专题的 lib/useRequest)。
 *
 * 套件标注:本场景用 deferred(展示层滞后)+ 请求竞态处理(数据层),
 * 说明「渲染竞态」与「请求竞态」是两层问题,手段互补。
 *
 * @module topics/performance/transition-deferred/components/StaleSearchDemo
 */

import { memo, useDeferredValue, useEffect, useState } from 'react';
import { Alert, Input, List, Segmented, Tag } from 'antd';

import { useRequest } from '../../../hooks/custom-hooks/lib';
import { searchItems } from '../../lab/mockSearchApi';
import type { SearchResponse } from '../../lab/mockSearchApi';

/** 可注入的搜索函数(测试用可控 deferred 替换) */
export type SearchFn = (
    keyword: string,
    options: { signal?: AbortSignal; delay?: number },
) => Promise<SearchResponse>;

/**
 * 无保护模式的刻意乱序:关键字越短响应越慢,
 * 快速输入 a → ab → abc 时响应几乎必然倒序到达,稳定复现 stale。
 */
const staleDelayFor = (keyword: string): number => Math.max(200, 800 - keyword.length * 150);

interface StaleSearchDemoProps {
    searchFn?: SearchFn;
}

/**
 * @example
 * <StaleSearchDemo />
 */
export const StaleSearchDemo = memo(({ searchFn = searchItems }: StaleSearchDemoProps) => {
    const [protectedMode, setProtectedMode] = useState(false);
    const [keyword, setKeyword] = useState('');

    /* ---- 无保护模式: deliberately 无序号、无 abort、无失效标记 ---- */
    const [rawResponse, setRawResponse] = useState<SearchResponse | null>(null);
    useEffect(() => {
        if (protectedMode) {
            return;
        }
        searchFn(keyword, { delay: staleDelayFor(keyword) })
            .then((response) => {
                // 刻意不加任何竞态保护:谁后返回谁覆盖,不管请求发出顺序
                setRawResponse(response);
            })
            .catch(() => {});
    }, [keyword, protectedMode, searchFn]);

    /* ---- 优化模式:deferred(展示层)+ useRequest 竞态处理(数据层) ---- */
    const deferredKeyword = useDeferredValue(keyword);
    const { data: safeResponse, run } = useRequest(
        ({ signal }, kw: string) => searchFn(kw, { signal }),
        { manual: true },
    );
    useEffect(() => {
        if (protectedMode) {
            run(deferredKeyword);
        }
    }, [protectedMode, deferredKeyword, run]);

    const response = protectedMode ? (safeResponse ?? null) : rawResponse;
    // stale 检测:响应回显的关键字与当前输入不一致
    const isStale = response !== null && response.keyword !== keyword;

    return (
        <div className="space-y-4">
            <Segmented
                options={[
                    { label: '无保护(可复现 stale)', value: false },
                    { label: 'deferred + 竞态处理', value: true },
                ]}
                value={protectedMode}
                onChange={(v) => setProtectedMode(v as boolean)}
            />

            <Input
                placeholder='无保护模式下快速输入 "a" → "ab" → "abc"'
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="max-w-sm"
            />

            {isStale && (
                <Alert
                    type="error"
                    showIcon
                    message={`结果已过期(stale):列表是「${response?.keyword}」的响应,但当前输入是「${keyword}」`}
                />
            )}

            <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-slate-500">
                <span>
                    当前结果对应关键字:「{response?.keyword ?? '—'}」
                </span>
                {protectedMode && <Tag color="success">旧响应会被自动废弃</Tag>}
            </div>

            <List
                size="small"
                className="max-w-sm"
                bordered
                locale={{ emptyText: '无匹配结果' }}
                dataSource={response?.results ?? []}
                renderItem={(word) => <List.Item className="!px-3 !py-1 text-sm">{word}</List.Item>}
            />
        </div>
    );
});

StaleSearchDemo.displayName = 'StaleSearchDemo';
