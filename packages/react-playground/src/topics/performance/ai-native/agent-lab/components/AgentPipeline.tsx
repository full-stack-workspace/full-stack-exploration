/**
 * ============================================================================
 * AgentPipeline — Agent 工具链对照
 * ============================================================================
 *
 * 流式演练覆盖「已经在生成」。Agent 的 TTFUI 往往卡在 RAG / 工具串行。
 * 思考 token 可以很早就到(TTFT 好看),有用建议要等工具结束(TTFUI 才是验收)。
 * 取消必须打到已发出的工具请求,否则 UI 停了仍在烧 token。
 *
 * @module topics/performance/ai-native/agent-lab/components/AgentPipeline
 */

import { memo, useRef, useState } from 'react';
import { Button, Slider, Switch } from 'antd';

type Phase = 'idle' | 'thinking' | 'tools' | 'generating' | 'done' | 'stopped';
type StepId = 'think' | 'rag' | 'inv' | 'gen';
type StepStatus = 'idle' | 'running' | 'done' | 'skipped';

interface Metrics {
    ttft: number | null;
    ttfui: number | null;
    wall: number | null;
    tokens: number;
    wasted: number;
}

const EMPTY: Metrics = { ttft: null, ttfui: null, wall: null, tokens: 0, wasted: 0 };

const THINK_MS = 180;
const RAG_MS = 620;
const INV_MS = 480;
const GEN_MS = 90;
const THINK_TOKENS = 24;
const RAG_TOKENS = 60;
const INV_TOKENS = 50;
const GEN_TOKENS = 42;

const STEPS: { id: StepId; label: string }[] = [
    { id: 'think', label: '思考 / 规划' },
    { id: 'rag', label: 'RAG 检索' },
    { id: 'inv', label: '库存工具' },
    { id: 'gen', label: '有用建议' },
];

export const AgentPipeline = memo(() => {
    const [parallel, setParallel] = useState(false);
    const [cancelLag, setCancelLag] = useState(0);
    const [phase, setPhase] = useState<Phase>('idle');
    const [note, setNote] = useState('等待发起任务…');
    const [steps, setSteps] = useState<Record<StepId, StepStatus>>({
        think: 'idle',
        rag: 'idle',
        inv: 'idle',
        gen: 'idle',
    });
    const [metrics, setMetrics] = useState<Metrics>(EMPTY);

    const timersRef = useRef<number[]>([]);
    const nowAbsRef = useRef(0);
    const cancelledRef = useRef(false);
    const stopClickedRef = useRef<number | null>(null);
    const billedRef = useRef(0);
    const ttftRef = useRef<number | null>(null);
    const ttfuiRef = useRef<number | null>(null);

    const clearTimers = () => {
        timersRef.current.forEach((id) => window.clearTimeout(id));
        timersRef.current = [];
    };

    const after = (ms: number, fn: () => void) => {
        const fireAt = nowAbsRef.current + ms;
        const id = window.setTimeout(() => {
            if (cancelledRef.current) {
                return;
            }
            nowAbsRef.current = fireAt;
            fn();
        }, ms);
        timersRef.current.push(id);
    };

    const patchStep = (id: StepId, status: StepStatus) => {
        setSteps((curr) => ({ ...curr, [id]: status }));
    };

    const bill = (n: number) => {
        billedRef.current += n;
    };

    const finish = (stopped: boolean) => {
        const wasted = stopped ? billedRef.current : 0;
        setMetrics({
            ttft: ttftRef.current,
            ttfui: ttfuiRef.current,
            wall: nowAbsRef.current,
            tokens: billedRef.current,
            wasted,
        });
        setPhase(stopped ? 'stopped' : 'done');
        if (stopped) {
            setNote('已停止。取消前已经发出的工具调用仍计入 token。');
        }
    };

    const startGenerate = () => {
        setPhase('generating');
        patchStep('gen', 'running');
        setNote('工具结果齐了,开始写建议…');
        after(GEN_MS, () => {
            bill(GEN_TOKENS);
            ttfuiRef.current = nowAbsRef.current;
            patchStep('gen', 'done');
            setNote('仓库 A 有 12 件,建议今天下单。');
            finish(false);
        });
    };

    const startTools = () => {
        setPhase('tools');
        if (parallel) {
            patchStep('rag', 'running');
            patchStep('inv', 'running');
            setNote('检索与库存并行调用…');
            bill(RAG_TOKENS);
            bill(INV_TOKENS);
            let remaining = 2;
            const oneDone = (id: StepId) => {
                patchStep(id, 'done');
                remaining -= 1;
                if (remaining === 0) {
                    startGenerate();
                }
            };
            after(RAG_MS, () => oneDone('rag'));
            after(INV_MS, () => oneDone('inv'));
            return;
        }
        patchStep('rag', 'running');
        setNote('先检索,再查库存(串行瀑布)…');
        bill(RAG_TOKENS);
        after(RAG_MS, () => {
            patchStep('rag', 'done');
            patchStep('inv', 'running');
            bill(INV_TOKENS);
            after(INV_MS, () => {
                patchStep('inv', 'done');
                startGenerate();
            });
        });
    };

    const start = () => {
        clearTimers();
        cancelledRef.current = false;
        stopClickedRef.current = null;
        billedRef.current = 0;
        ttftRef.current = null;
        ttfuiRef.current = null;
        nowAbsRef.current = 0;
        setMetrics(EMPTY);
        setSteps({ think: 'running', rag: 'idle', inv: 'idle', gen: 'idle' });
        setPhase('thinking');
        setNote('模型先输出规划 token…');

        after(THINK_MS, () => {
            bill(THINK_TOKENS);
            ttftRef.current = nowAbsRef.current;
            patchStep('think', 'done');
            setNote('规划完成:先检索政策,再查库存。');
            startTools();
        });
    };

    const stop = () => {
        if (phase === 'idle' || phase === 'done' || phase === 'stopped') {
            return;
        }
        stopClickedRef.current = nowAbsRef.current;
        const id = window.setTimeout(() => {
            nowAbsRef.current += cancelLag;
            cancelledRef.current = true;
            clearTimers();
            setSteps((curr) => {
                const next = { ...curr };
                (Object.keys(next) as StepId[]).forEach((key) => {
                    if (next[key] === 'running') {
                        next[key] = 'skipped';
                    }
                });
                return next;
            });
            finish(true);
        }, cancelLag);
        timersRef.current.push(id);
    };

    const running = phase === 'thinking' || phase === 'tools' || phase === 'generating';

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-slate-300">
                <label className="flex items-center gap-2">
                    <Switch
                        size="small"
                        checked={parallel}
                        onChange={setParallel}
                        aria-label="工具并行"
                    />
                    检索与库存并行
                </label>
                <label className="min-w-[12rem] flex-1 text-xs text-gray-500">
                    点取消后真实停请求 {cancelLag}ms
                    <Slider
                        aria-label="取消延迟"
                        min={0}
                        max={800}
                        value={cancelLag}
                        onChange={setCancelLag}
                    />
                </label>
            </div>
            <div className="flex gap-2">
                <Button
                    size="small"
                    type="primary"
                    aria-label="发起任务"
                    onClick={start}
                    disabled={running}
                >
                    发起任务
                </Button>
                <Button size="small" danger aria-label="取消任务" onClick={stop} disabled={!running}>
                    取消任务
                </Button>
            </div>
            <ol className="grid gap-2 sm:grid-cols-4">
                {STEPS.map((step) => {
                    const status = steps[step.id];
                    return (
                        <li
                            key={step.id}
                            className="rounded-lg border border-gray-100 bg-white px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-950"
                        >
                            <p className="font-medium text-gray-800 dark:text-slate-100">{step.label}</p>
                            <p className="mt-1 text-gray-400">
                                {status === 'idle' && '等待'}
                                {status === 'running' && '进行中'}
                                {status === 'done' && '完成'}
                                {status === 'skipped' && '已中断'}
                            </p>
                        </li>
                    );
                })}
            </ol>
            <p
                aria-live="polite"
                className="min-h-12 rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm text-gray-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
                {note}
            </p>
            <dl className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                <div>
                    <dt className="text-gray-400">TTFT</dt>
                    <dd>{metrics.ttft ?? '—'} ms</dd>
                </div>
                <div>
                    <dt className="text-gray-400">TTFUI</dt>
                    <dd>{metrics.ttfui ?? '—'} ms</dd>
                </div>
                <div>
                    <dt className="text-gray-400">墙钟</dt>
                    <dd>{metrics.wall ?? '—'} ms</dd>
                </div>
                <div>
                    <dt className="text-gray-400">已计费 token</dt>
                    <dd>{metrics.tokens}</dd>
                </div>
                <div>
                    <dt className="text-gray-400">取消时已烧掉</dt>
                    <dd>{metrics.wasted || '—'}</dd>
                </div>
            </dl>
            <p className="text-xs text-gray-400 dark:text-slate-500">
                对照:并行几乎不改 TTFT,但墙钟和 TTFUI 一起下降。取消延迟拉大后,「已烧掉」会包含已经发出的工具调用。
            </p>
        </div>
    );
});

AgentPipeline.displayName = 'AgentPipeline';
