/**
 * ============================================================================
 * CatchScopeDemo — 渲染期 / 事件 / 异步,谁会被边界接住
 * ============================================================================
 *
 * 三种 throw 对照:只有「渲染期 throw」会启动错误边界。
 * 事件与异步回调里的 throw 边界看不见,必须就地 try/catch
 * (演示里把逃逸信息写进旁路状态,避免未捕获异常弹出构建器 overlay)。
 *
 * @module topics/advanced/error-boundary/components/CatchScopeDemo
 */

import { memo, useState } from 'react';
import { Alert, Button } from 'antd';

import { DemoErrorBoundary } from './DemoErrorBoundary';

type EscapeNote = { source: 'event' | 'async'; message: string };

const ScopeProbe = memo(({ onEscape }: { onEscape: (note: EscapeNote) => void }) => {
    const [shouldBoom, setShouldBoom] = useState(false);

    if (shouldBoom) {
        throw new Error('渲染期抛错:边界会接住这条');
    }

    return (
        <div className="flex flex-wrap gap-2">
            <Button type="primary" danger size="small" onClick={() => setShouldBoom(true)}>
                渲染期 throw
            </Button>
            <Button
                size="small"
                onClick={() => {
                    try {
                        throw new Error('onClick 里 throw');
                    } catch (caught) {
                        const message = caught instanceof Error ? caught.message : String(caught);
                        onEscape({ source: 'event', message });
                    }
                }}
            >
                事件处理 throw
            </Button>
            <Button
                size="small"
                onClick={() => {
                    window.setTimeout(() => {
                        try {
                            throw new Error('setTimeout 里 throw');
                        } catch (caught) {
                            const message = caught instanceof Error ? caught.message : String(caught);
                            onEscape({ source: 'async', message });
                        }
                    }, 120);
                }}
            >
                异步 throw
            </Button>
        </div>
    );
});

ScopeProbe.displayName = 'ScopeProbe';

export const CatchScopeDemo = memo(() => {
    const [resetKey, setResetKey] = useState(0);
    const [escaped, setEscaped] = useState<EscapeNote | null>(null);

    return (
        <div className="space-y-3">
            <DemoErrorBoundary
                name="捕获范围"
                onReset={() => {
                    setResetKey((key) => key + 1);
                    setEscaped(null);
                }}
                onCatch={() => setEscaped(null)}
            >
                <ScopeProbe key={resetKey} onEscape={setEscaped} />
            </DemoErrorBoundary>
            {escaped ? (
                <Alert
                    type="warning"
                    showIcon
                    message="边界没有介入"
                    description={
                        escaped.source === 'event'
                            ? `事件处理自己接住了「${escaped.message}」。组件仍在运行,虚线框没有被替换。`
                            : `异步回调自己接住了「${escaped.message}」。setTimeout / Promise 同样不在边界的捕获范围里。`
                    }
                />
            ) : null}
        </div>
    );
});

CatchScopeDemo.displayName = 'CatchScopeDemo';
