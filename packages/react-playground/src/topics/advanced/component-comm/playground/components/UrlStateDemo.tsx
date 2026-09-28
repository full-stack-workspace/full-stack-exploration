/**
 * ============================================================================
 * UrlStateDemo — 过滤条件以 URL 为事实
 * ============================================================================
 *
 * tab 写进 searchParams。刷新 / 分享应看到同一档。这不是 Context 的活。
 *
 * @module topics/advanced/component-comm/playground/components/UrlStateDemo
 */

import { memo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from 'antd';

type Tab = 'all' | 'hooks' | 'advanced';

const TABS: { id: Tab; label: string }[] = [
    { id: 'all', label: '全部' },
    { id: 'hooks', label: 'Hooks' },
    { id: 'advanced', label: '进阶' },
];

function isTab(value: string | null): value is Tab {
    return value === 'all' || value === 'hooks' || value === 'advanced';
}

export const UrlStateDemo = memo(() => {
    const [params, setParams] = useSearchParams();
    const raw = params.get('tab');
    const tab: Tab = isTab(raw) ? raw : 'all';

    const setTab = (next: Tab) => {
        const nextParams = new URLSearchParams(params);
        if (next === 'all') {
            nextParams.delete('tab');
        } else {
            nextParams.set('tab', next);
        }
        setParams(nextParams, { replace: true });
    };

    const query = params.toString();

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
                {TABS.map((item) => (
                    <Button
                        key={item.id}
                        size="small"
                        type={tab === item.id ? 'primary' : 'default'}
                        aria-label={`查询档 ${item.label}`}
                        onClick={() => setTab(item.id)}
                    >
                        {item.label}
                    </Button>
                ))}
            </div>
            <p className="font-mono text-xs text-gray-500 dark:text-slate-400" aria-label="当前查询串">
                当前查询串:{query ? `?${query}` : '(空,视为 tab=all)'}
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500">
                现在看到的档是「{TABS.find((item) => item.id === tab)?.label}」。复制地址栏再打开,应停在同一档。
            </p>
        </div>
    );
});

UrlStateDemo.displayName = 'UrlStateDemo';
