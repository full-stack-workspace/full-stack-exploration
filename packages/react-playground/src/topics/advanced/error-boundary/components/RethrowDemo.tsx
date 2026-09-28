/**
 * ============================================================================
 * RethrowDemo — 把异步错误送回渲染树
 * ============================================================================
 *
 * 异步失败默认走 catch,不会被错误边界看见。
 * 开关打开时:把 Error 写进 state,下一次 render 再 throw,边界才能接管降级 UI。
 * 开关关闭时:只在组件内显示告警 —— 这也是更常见的「请求失败」写法。
 *
 * @module topics/advanced/error-boundary/components/RethrowDemo
 */

import { memo, useState } from 'react';
import { Alert, Button, Switch } from 'antd';

import { DemoErrorBoundary } from './DemoErrorBoundary';

const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

interface RequestProbeProps {
    /** true:失败后 throw 进渲染;false:只在组件内展示 */
    rethrow: boolean;
}

const RequestProbe = memo(({ rethrow }: RequestProbeProps) => {
    const [pendingError, setPendingError] = useState<Error | null>(null);
    const [localMessage, setLocalMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    if (rethrow && pendingError) {
        throw pendingError;
    }

    const run = async () => {
        setLoading(true);
        setLocalMessage(null);
        setPendingError(null);
        await delay(400);
        const error = new Error('接口 500:库存服务不可用');
        if (rethrow) {
            setPendingError(error);
        } else {
            setLocalMessage(error.message);
        }
        setLoading(false);
    };

    return (
        <div className="space-y-2">
            <Button size="small" type="primary" loading={loading} onClick={() => void run()}>
                发起会失败的请求
            </Button>
            {localMessage ? (
                <Alert type="warning" showIcon message="组件内自己消化" description={localMessage} />
            ) : null}
        </div>
    );
});

RequestProbe.displayName = 'RequestProbe';

export const RethrowDemo = memo(() => {
    const [rethrow, setRethrow] = useState(true);
    const [resetKey, setResetKey] = useState(0);

    return (
        <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                <Switch
                    size="small"
                    aria-label="失败后 throw 进渲染"
                    checked={rethrow}
                    onChange={(checked) => {
                        setRethrow(checked);
                        setResetKey((key) => key + 1);
                    }}
                />
                失败后 throw 进渲染(关闭则只在组件内显示)
            </label>
            <DemoErrorBoundary key={resetKey} name="异步重抛" onReset={() => setResetKey((key) => key + 1)}>
                <RequestProbe rethrow={rethrow} />
            </DemoErrorBoundary>
        </div>
    );
});

RethrowDemo.displayName = 'RethrowDemo';
