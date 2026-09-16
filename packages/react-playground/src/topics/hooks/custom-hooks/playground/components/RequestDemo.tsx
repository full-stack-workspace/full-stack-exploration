/**
 * ============================================================================
 * RequestDemo.tsx — useRequest 演示
 * ============================================================================
 *
 * mock 用户列表加载:自动执行 / 刷新 / 模拟失败 + 重试。
 * 生产要点:请求序号 + AbortController 双保险处理竞态;
 * 组件卸载自动取消在途请求;onSuccess/onError 走回调 ref。
 *
 * @module topics/hooks/custom-hooks/playground/components/RequestDemo
 */

import { memo } from 'react';
import { Alert, Button, List, Spin, Switch, Tag } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

import { searchUsers, setMockFailure } from '../../composition/mockUserApi';
import { useRequest, useToggle } from '../../lib';

export const RequestDemo = memo(() => {
    const [shouldFail, { toggle: toggleFail }] = useToggle(false);

    const { data: users, loading, error, refresh } = useRequest(({ signal }) =>
        searchUsers('', { signal }),
    );

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
                <Button icon={<ReloadOutlined />} onClick={refresh} loading={loading}>
                    刷新
                </Button>
                <span className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                    <Switch size="small" checked={shouldFail} onChange={() => {
                        setMockFailure(!shouldFail);
                        toggleFail();
                    }} />
                    模拟接口失败
                </span>
                <span className="text-xs text-gray-400 dark:text-slate-500">
                    卸载即取消:本组件离开页面时在途请求会被 abort
                </span>
            </div>

            {error != null && (
                <Alert
                    type="error"
                    showIcon
                    message={`请求失败:${error instanceof Error ? error.message : String(error)}`}
                    action={
                        <Button size="small" onClick={refresh}>
                            重试
                        </Button>
                    }
                />
            )}

            <Spin spinning={loading}>
                <List
                    size="small"
                    className="max-w-lg"
                    dataSource={users ?? []}
                    renderItem={(user) => (
                        <List.Item className="!px-2">
                            <span className="text-sm text-gray-700 dark:text-slate-300">{user.name}</span>
                            <Tag className="ml-2">{user.role}</Tag>
                        </List.Item>
                    )}
                />
            </Spin>
        </div>
    );
});

RequestDemo.displayName = 'RequestDemo';
