/**
 * ============================================================================
 * StreamRig — 可控的 AI 流式时间轴
 * ============================================================================
 *
 * 用定时器模拟 token 到达与上屏。可调 TTFT、TPOT、开场白长度、渲染批处理、
 * 抖动,以及停止按钮的真实取消延迟。指标从同一条时间轴上读出来。
 *
 * @module topics/performance/ai-native/lab/components/StreamRig
 */

import { memo, useRef, useState } from 'react';
import { Button, Slider, Switch } from 'antd';

const FILLER = '好的，我来帮你看一下这个问题。'.split('');
const USEFUL = '根因是推荐接口和商品主体串行,把推荐拆到独立 Suspense 即可。'.split('');

interface Metrics {
    ttft: number | null;
    ftrt: number | null;
    ttfui: number | null;
    tpotAvg: number | null;
    jank: number;
    cancelMs: number | null;
}

const EMPTY: Metrics = {
    ttft: null,
    ftrt: null,
    ttfui: null,
    tpotAvg: null,
    jank: 0,
    cancelMs: null,
};

export const StreamRig = memo(() => {
    const [ttftMs, setTtftMs] = useState(400);
    const [tpotMs, setTpotMs] = useState(40);
    const [fillerOn, setFillerOn] = useState(true);
    const [batchMs, setBatchMs] = useState(0);
    const [jankBurst, setJankBurst] = useState(false);
    const [cancelLag, setCancelLag] = useState(0);
    const [text, setText] = useState('');
    const [status, setStatus] = useState<'idle' | 'running' | 'done' | 'stopped'>('idle');
    const [metrics, setMetrics] = useState<Metrics>(EMPTY);

    const timersRef = useRef<number[]>([]);
    const startRef = useRef(0);
    const arrivalsRef = useRef<number[]>([]);
    const firstPaintRef = useRef<number | null>(null);
    const usefulAtRef = useRef<number | null>(null);
    const pendingRef = useRef('');
    const displayedRef = useRef('');
    const flushTimerRef = useRef<number | null>(null);
    const cancelledRef = useRef(false);
    const stopClickedRef = useRef<number | null>(null);

    const clearTimers = () => {
        timersRef.current.forEach((id) => window.clearTimeout(id));
        timersRef.current = [];
        if (flushTimerRef.current !== null) {
            window.clearTimeout(flushTimerRef.current);
            flushTimerRef.current = null;
        }
    };

    const flushPaint = (now: number) => {
        displayedRef.current += pendingRef.current;
        pendingRef.current = '';
        setText(displayedRef.current);
        if (firstPaintRef.current === null && displayedRef.current.length > 0) {
            firstPaintRef.current = now;
        }
        const usefulStart = fillerOn ? FILLER.length : 0;
        if (usefulAtRef.current === null && displayedRef.current.length > usefulStart) {
            usefulAtRef.current = now;
        }
    };

    const receiveToken = (char: string, now: number) => {
        arrivalsRef.current.push(now);
        if (batchMs === 0) {
            pendingRef.current += char;
            flushPaint(now);
            return;
        }
        pendingRef.current += char;
        if (flushTimerRef.current === null) {
            flushTimerRef.current = window.setTimeout(() => {
                flushTimerRef.current = null;
                flushPaint(performance.now());
            }, batchMs);
        }
    };

    const finish = (stopped: boolean) => {
        const now = performance.now();
        if (pendingRef.current) {
            flushPaint(now);
        }
        const arrivals = arrivalsRef.current;
        const gaps: number[] = [];
        for (let i = 1; i < arrivals.length; i += 1) {
            gaps.push(arrivals[i] - arrivals[i - 1]);
        }
        const avg = gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : null;
        const jank = gaps.filter((g) => g > tpotMs * 3).length;
        setMetrics({
            ttft: arrivals[0] !== undefined ? Math.round(arrivals[0] - startRef.current) : null,
            ftrt: firstPaintRef.current
                ? Math.round(firstPaintRef.current - startRef.current)
                : null,
            ttfui: usefulAtRef.current
                ? Math.round(usefulAtRef.current - startRef.current)
                : null,
            tpotAvg: avg !== null ? Math.round(avg) : null,
            jank,
            cancelMs:
                stopClickedRef.current !== null
                    ? Math.round(now - stopClickedRef.current)
                    : null,
        });
        setStatus(stopped ? 'stopped' : 'done');
    };

    const start = () => {
        clearTimers();
        cancelledRef.current = false;
        stopClickedRef.current = null;
        arrivalsRef.current = [];
        firstPaintRef.current = null;
        usefulAtRef.current = null;
        pendingRef.current = '';
        displayedRef.current = '';
        setText('');
        setMetrics(EMPTY);
        setStatus('running');
        startRef.current = performance.now();

        const tokens = fillerOn ? [...FILLER, ...USEFUL] : [...USEFUL];
        tokens.forEach((char, index) => {
            let delay = ttftMs + index * tpotMs;
            if (jankBurst && index === 8) {
                delay += 420;
            }
            const id = window.setTimeout(() => {
                if (cancelledRef.current) {
                    return;
                }
                receiveToken(char, performance.now());
                if (index === tokens.length - 1) {
                    finish(false);
                }
            }, delay);
            timersRef.current.push(id);
        });
    };

    const stop = () => {
        if (status !== 'running') {
            return;
        }
        stopClickedRef.current = performance.now();
        const id = window.setTimeout(() => {
            cancelledRef.current = true;
            clearTimers();
            finish(true);
        }, cancelLag);
        timersRef.current.push(id);
    };

    return (
        <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs text-gray-500">
                    TTFT {ttftMs}ms
                    <Slider aria-label="TTFT" min={80} max={1200} value={ttftMs} onChange={setTtftMs} />
                </label>
                <label className="text-xs text-gray-500">
                    TPOT {tpotMs}ms
                    <Slider aria-label="TPOT" min={16} max={200} value={tpotMs} onChange={setTpotMs} />
                </label>
                <label className="text-xs text-gray-500">
                    上屏批处理 {batchMs}ms(拉大 FTRT−TTFT)
                    <Slider aria-label="上屏批处理" min={0} max={400} value={batchMs} onChange={setBatchMs} />
                </label>
                <label className="text-xs text-gray-500">
                    点停止后真实取消 {cancelLag}ms
                    <Slider aria-label="取消延迟" min={0} max={800} value={cancelLag} onChange={setCancelLag} />
                </label>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-slate-300">
                <label className="flex items-center gap-2">
                    <Switch size="small" checked={fillerOn} onChange={setFillerOn} aria-label="开场白" />
                    带「好的我来」开场白
                </label>
                <label className="flex items-center gap-2">
                    <Switch size="small" checked={jankBurst} onChange={setJankBurst} aria-label="中途卡顿" />
                    中途卡 420ms
                </label>
            </div>
            <div className="flex gap-2">
                <Button size="small" type="primary" aria-label="发送" onClick={start} disabled={status === 'running'}>
                    发送
                </Button>
                <Button size="small" danger aria-label="停止生成" onClick={stop} disabled={status !== 'running'}>
                    停止生成
                </Button>
            </div>
            <div
                aria-live="polite"
                className="min-h-24 rounded-lg border border-gray-100 bg-white p-3 text-sm leading-relaxed text-gray-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            >
                {text || <span className="text-gray-300">等待发送…</span>}
            </div>
            <dl className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                <div>
                    <dt className="text-gray-400">TTFT</dt>
                    <dd>{metrics.ttft ?? '—'} ms</dd>
                </div>
                <div>
                    <dt className="text-gray-400">FTRT</dt>
                    <dd>{metrics.ftrt ?? '—'} ms</dd>
                </div>
                <div>
                    <dt className="text-gray-400">TTFUI</dt>
                    <dd>{metrics.ttfui ?? '—'} ms</dd>
                </div>
                <div>
                    <dt className="text-gray-400">平均 TPOT</dt>
                    <dd>{metrics.tpotAvg ?? '—'} ms</dd>
                </div>
                <div>
                    <dt className="text-gray-400">Stream Jank</dt>
                    <dd>{metrics.jank} 次</dd>
                </div>
                <div>
                    <dt className="text-gray-400">取消响应</dt>
                    <dd>{metrics.cancelMs ?? '—'} ms</dd>
                </div>
            </dl>
            <p className="text-xs text-gray-400 dark:text-slate-500">
                建议对照:打开开场白后 TTFT 几乎不变,TTFUI 明显变差;批处理拉大后 FTRT 落后 TTFT;
                中途卡顿增加 jank,平均 TPOT 也被拉高。
            </p>
        </div>
    );
});

StreamRig.displayName = 'StreamRig';
