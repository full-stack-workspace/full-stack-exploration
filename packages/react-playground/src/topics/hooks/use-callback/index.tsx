/**
 * ============================================================================
 * useCallback — Hooks 专题
 * ============================================================================
 *
 * 演示 useCallback 的机制:它缓存的是函数身份(引用),不是让函数跑得更快。
 * 只有下游会用 Object.is 比较这份引用时才值得用——典型是 memo 子组件,
 * 以及把它放进 useEffect / useMemo 的依赖数组。
 *
 * @module topics/hooks/use-callback
 */

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Button, Switch } from 'antd';
import { Link } from 'react-router-dom';

import { CALLBACK_IDENTITY_STEPS, FlowList } from '../../../components/FlowList';
import { TopicPage, TopicSection } from '../../../components/TopicPage';

/* =================================================================
 * 小工具:记录「这个函数引用换了几次」
 * ================================================================ */

/**
 * 用 Object.is 对比前后两次传入的函数。父组件每次渲染都会调用它,
 * 所以数字涨 = 这次拿到的已经不是上一次那份引用。
 */
function useIdentityChanges(fn: (...args: never[]) => unknown): number {
    const prevRef = useRef(fn);
    const changesRef = useRef(0);
    if (!Object.is(prevRef.current, fn)) {
        changesRef.current += 1;
        prevRef.current = fn;
    }
    return changesRef.current;
}

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
 * memo 子组件:props 用 Object.is 浅比较,onPing 身份一变就会重渲染
 * ================================================================ */

interface PingChildProps {
    label: string;
    onPing: () => void;
}

const MemoPingChild = memo(({ label, onPing }: PingChildProps) => {
    const renders = useRef(0);
    renders.current += 1;

    return (
        <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-xs text-gray-600 dark:text-slate-400">
                {label} · 渲染 {renders.current} 次
            </p>
            <Button size="small" onClick={onPing}>
                ping
            </Button>
        </div>
    );
});

MemoPingChild.displayName = 'MemoPingChild';

/** 没有 memo:父组件一渲染,子组件必渲染,useCallback 帮不上忙 */
const PlainPingChild = ({ label, onPing }: PingChildProps) => {
    const renders = useRef(0);
    renders.current += 1;

    return (
        <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-xs text-gray-600 dark:text-slate-400">
                {label} · 渲染 {renders.current} 次
            </p>
            <Button size="small" onClick={onPing}>
                ping
            </Button>
        </div>
    );
};

PlainPingChild.displayName = 'PlainPingChild';

/* =================================================================
 * 身份探针:同一父组件里对照内联 vs useCallback,以及有无 memo
 * ================================================================ */

const IdentityProbe = memo(() => {
    const [tick, setTick] = useState(0);
    const [pings, setPings] = useState(0);

    const inlinePing = () => setPings((n) => n + 1);
    const stablePing = useCallback(() => setPings((n) => n + 1), []);

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                <Button type="primary" onClick={() => setTick((n) => n + 1)}>
                    父组件无关状态 +1
                </Button>
                <span className="text-sm text-gray-500 dark:text-slate-400">
                    tick = {tick} · ping = {pings}
                </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                <ProbeCard title="memo + 每次渲染新建的函数">
                    <MemoPingChild label="内联回调" onPing={inlinePing} />
                </ProbeCard>
                <ProbeCard title="memo + useCallback([])">
                    <MemoPingChild label="稳定回调" onPing={stablePing} />
                </ProbeCard>
                <ProbeCard title="没有 memo + 内联函数">
                    <PlainPingChild label="未 memo · 内联" onPing={inlinePing} />
                </ProbeCard>
                <ProbeCard title="没有 memo + useCallback">
                    <PlainPingChild label="未 memo · 稳定" onPing={stablePing} />
                </ProbeCard>
            </div>
        </div>
    );
});

IdentityProbe.displayName = 'IdentityProbe';

/* =================================================================
 * 闭包探针:[] 读快照会过期;函数式更新可保持身份;deps 正确但身份会变
 * ================================================================ */

const StaleClosureProbe = memo(() => {
    const [count, setCount] = useState(0);

    // 故意闭包当前快照:deps 为空,永远加的是挂载时的 count
    const staleInc = useCallback(() => {
        setCount(count + 1);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- 演示过期闭包
    }, []);

    const freshInc = useCallback(() => {
        setCount((n) => n + 1);
    }, []);

    const depsInc = useCallback(() => {
        setCount(count + 1);
    }, [count]);

    const staleChanges = useIdentityChanges(staleInc);
    const freshChanges = useIdentityChanges(freshInc);
    const depsChanges = useIdentityChanges(depsInc);

    return (
        <div className="space-y-3">
            <p className="font-mono text-sm text-gray-700 dark:text-slate-200">count = {count}</p>
            <div className="grid gap-3 sm:grid-cols-3">
                <ProbeCard title={`闭包快照 · 身份换了 ${staleChanges} 次`}>
                    <Button size="small" onClick={staleInc}>
                        过期 +1
                    </Button>
                    <p className="mt-2 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                        useCallback([],) 里读 count,连点几次也只会从 0 到 1。
                    </p>
                </ProbeCard>
                <ProbeCard title={`函数式更新 · 身份换了 ${freshChanges} 次`}>
                    <Button size="small" type="primary" onClick={freshInc}>
                        最新 +1
                    </Button>
                    <p className="mt-2 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                        setCount(n =&gt; n + 1) 不读渲染快照,[] 也能一直对。
                    </p>
                </ProbeCard>
                <ProbeCard title={`依赖 count · 身份换了 ${depsChanges} 次`}>
                    <Button size="small" onClick={depsInc}>
                        依赖 +1
                    </Button>
                    <p className="mt-2 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                        值是对的,但 count 一变函数就换身份,memo 子组件会跟着重渲染。
                    </p>
                </ProbeCard>
            </div>
        </div>
    );
});

StaleClosureProbe.displayName = 'StaleClosureProbe';

/* =================================================================
 * effect 依赖探针:内联 handler 让无关状态也触发重订阅
 * ================================================================ */

const EffectDepsProbe = memo(() => {
    const [keyword, setKeyword] = useState('react');
    const [tick, setTick] = useState(0);
    const [stable, setStable] = useState(true);
    const [logs, setLogs] = useState<string[]>([]);

    // 依赖数组长度必须固定:React 用公共前缀做 Object.is,变长会被当成「没变」
    const tickToken = stable ? 0 : tick;
    const handler = useCallback(() => {
        // 订阅目标只是占位,真正比较的是这份函数的引用
    }, [keyword, tickToken]);

    const handlerChanges = useIdentityChanges(handler);

    useEffect(() => {
        setLogs((prev) => [`订阅 handler · keyword="${keyword}"`, ...prev].slice(0, 6));
        return () => {
            setLogs((prev) => ['退订 handler', ...prev].slice(0, 6));
        };
        // handler 身份已经编码了 keyword / tick 该不该重订
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [handler]);

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                    <Switch checked={stable} onChange={setStable} />
                    {stable ? '第二项钉死为 0' : '第二项跟着 tick'}
                </label>
                <Button onClick={() => setTick((n) => n + 1)}>无关 tick +1</Button>
                <Button onClick={() => setKeyword((k) => (k === 'react' ? 'hooks' : 'react'))}>
                    切换 keyword
                </Button>
                <span className="text-sm text-gray-500 dark:text-slate-400">
                    tick = {tick} · token = {tickToken} · keyword = {keyword} · 身份换了 {handlerChanges} 次
                </span>
            </div>
            <ol className="space-y-1 rounded-card bg-gray-50 p-3 font-mono text-xs leading-relaxed text-gray-600 dark:bg-slate-950 dark:text-slate-400">
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

EffectDepsProbe.displayName = 'EffectDepsProbe';

/* =================================================================
 * 专题页
 * ================================================================ */

const UseCallbackTopic = () => {
    return (
        <TopicPage
            title="useCallback"
            description="缓存函数身份,不让函数跑得更快;只有 memo 子组件或 effect/memo 依赖会比较这份引用时,才值得用"
        >
            <TopicSection
                title="它稳定的是函数身份"
                note="每次 render 都会写出一个新的函数表达式。useCallback 做的事只有一件:deps 用 Object.is 没变时,把上一次那份引用交回去。"
            >
                <FlowList steps={CALLBACK_IDENTITY_STEPS} />
            </TopicSection>

            <TopicSection
                title="和 useMemo 是同一件事"
                note="useCallback 没有更魔法的缓存。它就是「把函数本身当成 useMemo 的返回值」。"
            >
                <p className="rounded-card border border-gray-100 bg-gray-50 px-3 py-2 font-mono text-sm text-gray-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                    useCallback(fn, deps) ≡ useMemo(() =&gt; fn, deps)
                </p>
                <dl className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <dt className="font-medium text-gray-700 dark:text-slate-200">useCallback</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                            缓存函数引用。适合交给 memo 子组件,或放进别的 Hook 依赖数组。
                        </dd>
                    </div>
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <dt className="font-medium text-gray-700 dark:text-slate-200">useMemo</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                            缓存计算结果(对象、数组、派生值)。函数只是其中一种可缓存的值。对象 / memo 的配对见{' '}
                            <Link
                                className="text-primary-600 underline-offset-2 hover:underline"
                                to="/hooks/use-memo"
                            >
                                useMemo 与 memo 专题
                            </Link>
                            。
                        </dd>
                    </div>
                </dl>
            </TopicSection>

            <TopicSection
                title="真正起作用的前提:有人比较身份"
                note="点「父组件无关状态 +1」:带 memo 的内联回调会跟着重渲染,稳定回调会跳过;没有 memo 的两格无论回调稳不稳都会涨。开发环境 Strict Mode 下每次更新可能 +2。"
            >
                <IdentityProbe />
            </TopicSection>

            <TopicSection
                title="稳定身份时别读过期快照"
                note="空依赖 + 直接读 count 会闭包挂载时的值;函数式 setState 既能拿最新值,又能保持 []。把 count 放进 deps 值是对的,但身份会跟着变。"
            >
                <StaleClosureProbe />
            </TopicSection>

            <TopicSection
                title="放进 useEffect 依赖时,函数身份一换就会重订"
                note="打开开关时第二项钉死为 0,点「无关 tick +1」不应出现新日志、身份次数也不涨。关掉后第二项跟着 tick,无关状态也会重订。切 keyword 两种模式都会重跑。"
            >
                <EffectDepsProbe />
            </TopicSection>

            <TopicSection
                title="适用场景"
                note="问自己:下游有没有用 Object.is 比较这份函数?没有比较,就没有收益。"
            >
                <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <dt className="font-medium text-gray-700 dark:text-slate-200">memo 子组件的回调 props</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                            列表行、图表、编辑器这类渲染贵的子组件,用 memo 包住后再把 onToggle / onChange 用 useCallback 稳住。本站{' '}
                            <Link
                                className="text-primary-600 underline-offset-2 hover:underline"
                                to="/hooks/use-reducer"
                            >
                                useReducer 专题
                            </Link>
                            里的 TodoRow 就是这个模式。
                        </dd>
                    </div>
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <dt className="font-medium text-gray-700 dark:text-slate-200">effect / memo 的依赖</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                            订阅、防抖、把回调交给 WebSocket 时,内联函数会让 cleanup 每渲染都跑一遍。先稳住函数,再把它写进依赖。
                        </dd>
                    </div>
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <dt className="font-medium text-gray-700 dark:text-slate-200">Context 里拆出来的 actions</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                            只读 state 的组件不该因为 setter 换身份而重渲染。站点 Theme / User 把 actions 单独放一个 Context,详见{' '}
                            <Link
                                className="text-primary-600 underline-offset-2 hover:underline"
                                to="/advanced/context"
                            >
                                Context API 专题
                            </Link>
                            。
                        </dd>
                    </div>
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <dt className="font-medium text-gray-700 dark:text-slate-200">配合函数式更新或稳定 dispatch</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                            setState(prev =&gt; …) 和 useReducer 的 dispatch 本身引用稳定,回调才能安心写 []。不要为了 [] 去读过期的 count。
                        </dd>
                    </div>
                </dl>
            </TopicSection>

            <TopicSection
                title="不要用 useCallback 做的事"
                note="比较 deps 也有成本。没有身份比较的下游,包一层只是多跑一次 Object.is。"
            >
                <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <dt className="font-medium text-gray-700 dark:text-slate-200">便宜的 DOM 事件</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                            &lt;button onClick=&#123;() =&gt; setOpen(true)&#125;&gt; 没有 memo 子组件在比较这份函数,包 useCallback 不会少一次渲染。
                        </dd>
                    </div>
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <dt className="font-medium text-gray-700 dark:text-slate-200">没有 memo 的子组件</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                            父组件渲染,子组件就会渲染。useCallback 不能跳过「父已更新」这条路径,上面探针的下两格已经演示过。
                        </dd>
                    </div>
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <dt className="font-medium text-gray-700 dark:text-slate-200">让函数本身更快</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                            点 ping 时跑的还是那份逻辑。缓存的是引用,不是调用开销;重计算请用 useMemo,或把贵活移出渲染路径。
                        </dd>
                    </div>
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <dt className="font-medium text-gray-700 dark:text-slate-200">见函数就包一层</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                            本包没有开 React Compiler。Compiler 会自动稳住身份时,手写 useCallback 常常是噪音;现在仍然手写,也只包「真有人比较」的那几个。
                        </dd>
                    </div>
                </dl>
            </TopicSection>
        </TopicPage>
    );
};

export default UseCallbackTopic;
