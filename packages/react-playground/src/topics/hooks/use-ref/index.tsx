/**
 * ============================================================================
 * useRef — Hooks 专题
 * ============================================================================
 *
 * 演示 useRef 的机制:它返回一个身份稳定的可变盒子 { current }。
 * 改 current 不排队渲染,所以适合 DOM 句柄、定时器 ID、以及让延迟回调
 * 读到「现在的值」而不是「当时那次渲染的快照」。要画到屏幕上的值仍用 state。
 *
 * @module topics/hooks/use-ref
 */

import { memo, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from 'antd';
import { Link } from 'react-router-dom';

import { FlowList, REF_BOX_STEPS, REF_VS_STATE_STEPS } from '../../../components/FlowList';
import { Input } from '../../../components/Input';
import { TopicPage, TopicSection } from '../../../components/TopicPage';

/* =================================================================
 * 展示卡片
 * ================================================================ */

interface ProbeCardProps {
    title: string;
    children: ReactNode;
}

const ProbeCard = memo(({ title, children }: ProbeCardProps) => {
    return (
        <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-xs font-medium text-gray-700 dark:text-slate-200">{title}</p>
            <div className="mt-2">{children}</div>
        </div>
    );
});

ProbeCard.displayName = 'ProbeCard';

/* =================================================================
 * 盒子探针:state 立刻上屏,ref 要等另一次渲染才被读到
 * ================================================================ */

const SnapshotVsBoxProbe = memo(() => {
    const [stateCount, setStateCount] = useState(0);
    const [tick, setTick] = useState(0);
    const boxRef = useRef(0);
    const rendersRef = useRef(0);
    rendersRef.current += 1;

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                <Button type="primary" onClick={() => setStateCount((n) => n + 1)}>
                    state +1
                </Button>
                <Button onClick={() => { boxRef.current += 1; }}>
                    ref.current +1
                </Button>
                <Button onClick={() => setTick((n) => n + 1)}>无关渲染 +1</Button>
                <span className="text-sm text-gray-500 dark:text-slate-400">
                    组件函数执行 {rendersRef.current} 次 · tick = {tick}
                </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
                <ProbeCard title="这次渲染读到的 state">
                    <p
                        data-testid="state-screen-value"
                        className="font-mono text-2xl font-bold text-primary-600"
                    >
                        {stateCount}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                        setState 会排队下一次渲染,所以点「state +1」数字马上变。
                    </p>
                </ProbeCard>
                <ProbeCard title="这次渲染读到的 ref.current">
                    <p
                        data-testid="ref-screen-value"
                        className="font-mono text-2xl font-bold text-emerald-600"
                    >
                        {boxRef.current}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                        点「ref.current +1」盒子已经加了,但这次 JSX 不会重跑。再点「无关渲染 +1」才会追上。
                    </p>
                </ProbeCard>
            </div>
        </div>
    );
});

SnapshotVsBoxProbe.displayName = 'SnapshotVsBoxProbe';

/* =================================================================
 * DOM 探针:commit 之后 current 指向真实节点
 * ================================================================ */

const FocusProbe = memo(() => {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="flex flex-wrap items-center gap-3">
            <label className="sr-only" htmlFor="use-ref-focus">点按钮后应聚焦这里</label>
            <Input
                id="use-ref-focus"
                data-testid="focus-input"
                ref={inputRef}
                placeholder="点右侧按钮,光标应跳进这里"
                className="max-w-[16rem]"
            />
            <Button type="primary" onClick={() => inputRef.current?.focus()}>
                聚焦输入框
            </Button>
        </div>
    );
});

FocusProbe.displayName = 'FocusProbe';

/* =================================================================
 * 定时器 ID:必须跨渲染活下来,但画到屏幕上只会干扰
 * ================================================================ */

const TimerProbe = memo(() => {
    const [running, setRunning] = useState(false);
    const [ticks, setTicks] = useState(0);
    const idRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const stop = () => {
        if (idRef.current != null) {
            clearInterval(idRef.current);
            idRef.current = null;
        }
        setRunning(false);
    };

    const start = () => {
        if (idRef.current != null) return;
        idRef.current = setInterval(() => {
            setTicks((n) => n + 1);
        }, 1000);
        setRunning(true);
    };

    useEffect(() => {
        return () => {
            if (idRef.current != null) {
                clearInterval(idRef.current);
            }
        };
    }, []);

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                <Button type="primary" onClick={start} disabled={running}>
                    开始计时
                </Button>
                <Button onClick={stop} disabled={!running}>
                    停止计时
                </Button>
                <Button
                    onClick={() => {
                        stop();
                        setTicks(0);
                    }}
                >
                    清零
                </Button>
                <span className="font-mono text-sm text-gray-600 dark:text-slate-300">
                    {ticks}s · {running ? '盒子里握着 interval id' : '盒子是空的'}
                </span>
            </div>
            <p className="text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                ticks 是 UI,必须用 state;interval id 只给 clearInterval 用,放进 state 会多一次无意义渲染。
            </p>
        </div>
    );
});

TimerProbe.displayName = 'TimerProbe';

/* =================================================================
 * 最新值通道:延迟回调里闭包是快照,ref.current 是现在
 * ================================================================ */

const LatestValueProbe = memo(() => {
    const [count, setCount] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);
    const countRef = useRef(count);
    // 把盒子对齐到这次快照:官方允许的「render 里调整」。
    // 不要在这里根据 current 做会画到屏幕上的分支,Strict Mode 双调用会把盒子改乱。
    countRef.current = count;

    const scheduleStale = () => {
        const snapshot = count;
        window.setTimeout(() => {
            setLogs((prev) => [`闭包读到 ${snapshot}`, ...prev].slice(0, 6));
        }, 1500);
    };

    const scheduleLatest = () => {
        window.setTimeout(() => {
            setLogs((prev) => [`ref 读到 ${countRef.current}`, ...prev].slice(0, 6));
        }, 1500);
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                <Button onClick={() => setCount((n) => n + 1)}>延迟场景 count +1</Button>
                <Button onClick={scheduleStale}>1.5 秒后读闭包</Button>
                <Button type="primary" onClick={scheduleLatest}>
                    1.5 秒后读 ref
                </Button>
                <span className="font-mono text-sm text-gray-600 dark:text-slate-300">count = {count}</span>
            </div>
            <p className="text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                先把 count 加到 1,点两个「1.5 秒后…」,再在等待期间继续 +1。到期后闭包仍是 1,ref 是后来的值。
            </p>
            <ol
                data-testid="latest-log"
                className="space-y-1 rounded-card bg-gray-50 p-3 font-mono text-xs leading-relaxed text-gray-600 dark:bg-slate-950 dark:text-slate-400"
            >
                {logs.length > 0 ? (
                    logs.map((line, index) => (
                        <li key={`${line}-${index}`}>{line}</li>
                    ))
                ) : (
                    <li className="text-gray-400">还没有日志</li>
                )}
            </ol>
        </div>
    );
});

LatestValueProbe.displayName = 'LatestValueProbe';

/* =================================================================
 * 上一拍:render 时读盒子,effect 里写入本拍,所以永远慢一拍
 * ================================================================ */

const PreviousValueProbe = memo(() => {
    const [count, setCount] = useState(0);
    const prevRef = useRef<number | undefined>(undefined);
    const previous = prevRef.current;

    useEffect(() => {
        prevRef.current = count;
    });

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
                <Button type="primary" onClick={() => setCount((n) => n + 1)}>
                    上一次场景 +1
                </Button>
                <p
                    data-testid="previous-probe"
                    className="font-mono text-sm text-gray-700 dark:text-slate-200"
                >
                    当前 {count} · 上一次 {previous === undefined ? '—' : previous}
                </p>
            </div>
            <p className="text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                渲染阶段只读 prevRef,effect 里才写入这次的 count。这样 Strict Mode 双调用也不会在 render 里把「上一拍」提前覆盖掉。
            </p>
        </div>
    );
});

PreviousValueProbe.displayName = 'PreviousValueProbe';

/* =================================================================
 * 专题页
 * ================================================================ */

const UseRefTopic = () => {
    return (
        <TopicPage
            title="useRef"
            description="返回一个身份稳定的可变盒子;改 current 不触发渲染,适合 DOM、实例字段,以及让延迟回调读到最新值"
        >
            <TopicSection
                title="它是一个不会触发渲染的盒子"
                note="可以把它想成「永远不 setState 的那份 state」:首次渲染 new 一个 { current },之后一直把同一份对象交回来。"
            >
                <FlowList steps={REF_BOX_STEPS} />
            </TopicSection>

            <TopicSection
                title="和 useState 的完整对比"
                note="两条 hook 都能让值在重渲染之间活下来。差别只有一件事:改它会不会让组件函数再跑一遍。"
            >
                <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-start">
                    <FlowList steps={REF_VS_STATE_STEPS} />
                    <div className="hidden h-full w-px bg-gray-100 dark:bg-slate-800 lg:block" />
                    <dl className="space-y-3 text-sm text-gray-600 dark:text-slate-400">
                        <div>
                            <dt className="font-medium text-emerald-600">useRef</dt>
                            <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                                可变盒子。current 随时可改、立刻能读,但 JSX 不会因此重跑。适合句柄、ID、上一拍、最新回调。
                            </dd>
                        </div>
                        <div>
                            <dt className="font-medium text-sky-600">useState</dt>
                            <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                                一次渲染的快照。setState 只排队下一次渲染。要画到屏幕上,或要驱动子组件,用它。详见{' '}
                                <Link
                                    className="text-primary-600 underline-offset-2 hover:underline"
                                    to="/topics/hooks/use-state"
                                >
                                    useState 专题
                                </Link>
                                。
                            </dd>
                        </div>
                    </dl>
                </div>
            </TopicSection>

            <TopicSection
                title="点一次,对照「屏幕上的数字」和「盒子里的数字」"
                note="点「ref.current +1」两次,右边应仍是 0;再点「无关渲染 +1」,右边才会变成 2。左边的 state 则每次点击立刻变。开发环境 Strict Mode 可能让首次挂载多跑一遍组件函数。"
            >
                <SnapshotVsBoxProbe />
            </TopicSection>

            <TopicSection
                title="适用场景:拿到 DOM 节点"
                note="把 ref 交给宿主组件后,commit 结束 current 才指向节点。事件里调用 focus / play / scrollIntoView,不要在第一次 render 里读它——那时还是 null。"
            >
                <FocusProbe />
                <p className="mt-3 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                    React 19 里 ref 是普通 prop,不必再包 forwardRef。本站{' '}
                    <span className="font-mono">Input</span> 就是{' '}
                    <span className="font-mono">{'function Input({ ref, ...props })'}</span> 这种写法。
                </p>
            </TopicSection>

            <TopicSection
                title="适用场景:存定时器 ID,不必画到屏幕上"
                note="开始 / 停止只改盒子里的 id;屏幕上的秒数仍用 state。卸载时用 effect 的 cleanup 清掉,避免漏网的 interval。"
            >
                <TimerProbe />
            </TopicSection>

            <TopicSection
                title="适用场景:延迟回调里读最新值,而不是过期快照"
                note="setTimeout / 原生事件 / WebSocket 回调不会重新订阅,里面直接读 count 会闭包到调度那一次渲染。render 里把 count 写进 ref,回调读 current,就能拿到后来改过的值。这和把 count 放进 useEffect 依赖是两条路:前者不重订,后者会重跑 setup。"
            >
                <LatestValueProbe />
                <p className="mt-3 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                    订阅类副作用仍应走{' '}
                    <Link
                        className="text-primary-600 underline-offset-2 hover:underline"
                        to="/topics/hooks/use-effect"
                    >
                        useEffect
                    </Link>
                    {' '}的 cleanup;ref 只负责「回调里要最新值,但不要因为值变了就拆掉订阅」。React 19.2 的{' '}
                    <span className="font-mono">useEffectEvent</span> 是这个模式的官方形状,底层仍是「稳定函数 + 最新闭包」。
                </p>
            </TopicSection>

            <TopicSection
                title="适用场景:记住上一次渲染的值"
                note="比较「这次」和「上次」——动画方向、是否刚从 0 变成有值——需要上一拍快照。render 里读、effect 里写,盒子永远慢一拍。"
            >
                <PreviousValueProbe />
            </TopicSection>

            <TopicSection
                title="适用场景一览"
                note="问自己:这个值变了,屏幕要不要跟着变?要,用 state;不要,用 ref。"
            >
                <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <dt className="font-medium text-gray-700 dark:text-slate-200">宿主实例</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                            input.focus、video.pause、canvas.getContext、第三方图表的 dispose。commit 之后才能读到节点。
                        </dd>
                    </div>
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <dt className="font-medium text-gray-700 dark:text-slate-200">实例字段</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                            类组件里的 this.timerId / this.pending。函数组件没有实例,就用 ref 充当那块可变内存。
                        </dd>
                    </div>
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <dt className="font-medium text-gray-700 dark:text-slate-200">最新值 / 最新回调</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                            让长期活着的监听器读到新 props,却不把 props 写进依赖。本站 useCallback 专题的身份探针,内部也是用 ref 数「引用换了几次」。
                        </dd>
                    </div>
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <dt className="font-medium text-gray-700 dark:text-slate-200">callback ref</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                            节点挂上/卸下时要立刻测量或对接第三方库,用函数 ref{' '}
                            <span className="font-mono">{'(node) => { ... }'}</span>
                            。对象 ref 只在你稍后的事件里才去读 current。
                        </dd>
                    </div>
                </dl>
            </TopicSection>

            <TopicSection
                title="不要用 useRef 做的事"
                note="ref 不是「更快的 state」。跳过渲染省下的,是用户看不到的更新——也就是 bug。"
            >
                <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <dt className="font-medium text-gray-700 dark:text-slate-200">要画到屏幕上的值</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                            计数、开关、输入草稿。上面探针已经说明:current 变了,JSX 不会重跑,用户看到的还是旧帧。
                        </dd>
                    </div>
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <dt className="font-medium text-gray-700 dark:text-slate-200">依赖数组里写 ref.current</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                            改 current 不会触发 Object.is 那次比较。effect / memo / callback 都不会因此重跑,写进去等于没写。要比就比会变的 state / props。
                        </dd>
                    </div>
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <dt className="font-medium text-gray-700 dark:text-slate-200">在第一次 render 里读 DOM</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                            渲染时 current 仍是初始值(通常 null)。读布局、量宽高,放到{' '}
                            <Link
                                className="text-primary-600 underline-offset-2 hover:underline"
                                to="/topics/hooks/use-layout-effect"
                            >
                                useLayoutEffect
                            </Link>
                            ;和绘制无关的订阅仍用 useEffect。
                        </dd>
                    </div>
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <dt className="font-medium text-gray-700 dark:text-slate-200">用盒子代替不可变更新</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                            往 ref 里塞可变对象再到处改,调试时看不到「哪次渲染对应哪份数据」。UI 数据留在 state;ref 只握句柄和瞬态。
                        </dd>
                    </div>
                </dl>
            </TopicSection>
        </TopicPage>
    );
};

export default UseRefTopic;
