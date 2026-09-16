/**
 * ============================================================================
 * useLayoutEffect — Hooks 专题
 * ============================================================================
 *
 * 演示 useLayoutEffect 相对 useEffect 的执行时机:DOM 更新之后、绘制之前
 * 同步执行;更新时 cleanup 与 setup 都在 Paint 前完成,避免露出中间帧。
 *
 * @module topics/hooks/use-layout-effect
 */

import { memo, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Button } from 'antd';
import { Link } from 'react-router-dom';

import { EFFECT_VS_LAYOUT_STEPS, FlowList, LAYOUT_UPDATE_STEPS, type FlowStep } from '../../../components/FlowList';
import { TopicPage, TopicSection } from '../../../components/TopicPage';

/** 绘制前这条链路:layout effect 可以拦住首帧,必要时再同步渲染一次 */
const BEFORE_PAINT_STEPS: FlowStep[] = [
    { title: '执行组件函数', hint: 'Render:计算本次要提交的 JSX', tone: 'render' },
    { title: 'React 更新 DOM', hint: 'Commit:把计算结果写进真实 DOM', tone: 'commit' },
    { title: '执行 useLayoutEffect', hint: '首次是 setup;更新时同一夹缝里会先跑上一次 cleanup', tone: 'layout' },
    { title: '如果其中更新状态,再同步重新渲染', hint: '会回到组件函数,首帧不会露出中间态', tone: 'layout' },
    { title: '浏览器绘制最终页面', hint: '用户这时才看到画面', tone: 'paint' },
];

/* =================================================================
 * 时机探针:每次渲染把 render / layout / effect 记到同一条时间线
 * ================================================================ */

const OrderProbe = memo(() => {
    const [tick, setTick] = useState(0);
    const [lines, setLines] = useState<string[]>([]);
    const bucketRef = useRef<string[]>([]);
    const lastTickRef = useRef(-1);

    const stamp = (label: string) => {
        bucketRef.current = [...bucketRef.current, `${label}  ·  ${performance.now().toFixed(1)} ms`].slice(-20);
    };

    // 只在 tick 变化的那次 render 画分隔;后面 setLines 引起的渲染不要再写一遍
    if (lastTickRef.current !== tick) {
        stamp(`── tick=${tick} · 执行组件函数 (Render)`);
        lastTickRef.current = tick;
    }

    useLayoutEffect(() => {
        stamp('React 已更新 DOM (Commit 刚结束)');
        stamp('执行 useLayoutEffect');
        return () => {
            stamp('useLayoutEffect cleanup');
        };
    }, [tick]);

    useEffect(() => {
        stamp('执行 useEffect (通常已绘制)');
        setLines(bucketRef.current);
        return () => {
            stamp('useEffect cleanup');
        };
    }, [tick]);

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
                <Button type="primary" onClick={() => setTick((value) => value + 1)}>
                    再渲染一次
                </Button>
                <span className="text-sm text-gray-500">当前 tick = {tick}</span>
            </div>
            <p className="text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                看最后一段 <span className="font-mono">── tick=N</span>{' '}
                之后:应是 layout cleanup → layout setup → effect cleanup → effect setup。挂载那段会多一轮 Strict Mode 的 cleanup。
            </p>
            <ol
                data-testid="layout-order-probe"
                className="space-y-1 rounded-card bg-gray-50 p-3 font-mono text-xs leading-relaxed text-gray-600 dark:bg-slate-950 dark:text-slate-400"
            >
                {lines.map((line, index) => (
                    <li key={`${line}-${index}`}>{line}</li>
                ))}
            </ol>
        </div>
    );
});

OrderProbe.displayName = 'OrderProbe';

/* =================================================================
 * 适用场景:layout 里 setState 会在绘制前同步再渲染,effect 则会先画出中间态
 * ================================================================ */

interface NudgeFrameProps {
    title: string;
    n: number;
    onSetOne: () => void;
    onReset: () => void;
}

const NudgeFrame = memo(({ title, n, onSetOne, onReset }: NudgeFrameProps) => {
    const flashed = n === 1;

    return (
        <div className="flex flex-1 flex-col gap-3 rounded-card border border-gray-100 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-sm font-medium text-gray-700">{title}</p>
            <p
                className={`text-4xl font-bold tabular-nums ${
                    flashed ? 'text-rose-500' : n === 2 ? 'text-emerald-600' : 'text-primary-600'
                }`}
            >
                {n}
            </p>
            <p className="text-xs text-gray-400">
                {flashed
                    ? '中间态 1 已经被画出来了(闪了一下)'
                    : n === 2
                        ? '最终是 2。layout 路径不会让你看到 1'
                        : '点「设为 1」,观察会不会露出中间态'}
            </p>
            <div className="flex gap-2">
                <Button type="primary" onClick={onSetOne}>
                    设为 1
                </Button>
                <Button onClick={onReset}>重置</Button>
            </div>
        </div>
    );
});

NudgeFrame.displayName = 'NudgeFrame';

const LayoutNudgeBox = memo(() => {
    const [n, setN] = useState(0);

    useLayoutEffect(() => {
        if (n === 1) {
            setN(2);
        }
    }, [n]);

    return (
        <NudgeFrame
            title="useLayoutEffect 里把 1 改成 2"
            n={n}
            onSetOne={() => setN(1)}
            onReset={() => setN(0)}
        />
    );
});

LayoutNudgeBox.displayName = 'LayoutNudgeBox';

const EffectNudgeBox = memo(() => {
    const [n, setN] = useState(0);

    useEffect(() => {
        if (n === 1) {
            setN(2);
        }
    }, [n]);

    return (
        <NudgeFrame
            title="useEffect 里把 1 改成 2"
            n={n}
            onSetOne={() => setN(1)}
            onReset={() => setN(0)}
        />
    );
});

EffectNudgeBox.displayName = 'EffectNudgeBox';

/* =================================================================
 * 专题页
 * ================================================================ */

const UseLayoutEffectTopic = () => {
    return (
        <TopicPage
            title="useLayoutEffect"
            description="DOM 更新之后、绘制之前同步执行;依赖一变时 cleanup 和 setup 都在 Paint 之前完成,用户看不见中间帧"
        >
            <TopicSection
                title="绘制前这条链路"
                note="记住:layout effect 发生在「DOM 已更新、像素还没画」的夹缝里。这是首次 setup 的位置;更新时会在同一夹缝里先跑上一轮 cleanup。"
            >
                <FlowList steps={BEFORE_PAINT_STEPS} />
            </TopicSection>

            <TopicSection
                title="与 useEffect 的完整对比"
                note="两条 hook 签名几乎一样,差别只在何时跑:layout 阻塞 Paint,effect 通常在 Paint 之后。更新时两边都是先 cleanup 再 setup,只是这一对发生在 Paint 的哪一侧不同。"
            >
                <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-start">
                    <FlowList steps={EFFECT_VS_LAYOUT_STEPS} />
                    <div className="hidden h-full w-px bg-gray-100 dark:bg-slate-800 lg:block" />
                    <dl className="space-y-3 text-sm text-gray-600">
                        <div>
                            <dt className="font-medium text-amber-600">useLayoutEffect</dt>
                            <dd className="mt-1 text-xs leading-relaxed text-gray-400">
                                读布局、根据测量结果改样式/位置、滚动复位、任何「第一帧就不能错」的校正。会推迟绘制,别放网络请求。
                            </dd>
                        </div>
                        <div>
                            <dt className="font-medium text-sky-600">useEffect</dt>
                            <dd className="mt-1 text-xs leading-relaxed text-gray-400">
                                订阅、请求、打点、和绘制无关的同步。默认用它;更新时它的 cleanup 发生在用户已经看见新 UI 之后。详见{' '}
                                <Link className="text-primary-600 underline-offset-2 hover:underline" to="/topics/hooks/use-effect">
                                    useEffect 专题
                                </Link>
                                。
                            </dd>
                        </div>
                    </dl>
                </div>
            </TopicSection>

            <TopicSection
                title="更新时:cleanup 仍在 Paint 之前"
                note="return 的同样不是「卸载回调」。依赖一变,React 在绘制前先调用上一轮 useLayoutEffect 的 cleanup(闭包仍是旧值),再跑这一轮 setup。用户看到的那一帧里,旧校正已经拆掉、新校正已经写完。"
            >
                <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-start">
                    <FlowList steps={LAYOUT_UPDATE_STEPS} />
                    <div className="hidden h-full w-px bg-gray-100 dark:bg-slate-800 lg:block" />
                    <dl className="space-y-3 text-sm">
                        <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                            <dt className="font-medium text-gray-700 dark:text-slate-200">依赖变了</dt>
                            <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                                Paint 之前:layout cleanup(旧闭包) → layout setup(新闭包)。然后才绘制。这是和 useEffect 的关键差别。
                            </dd>
                        </div>
                        <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                            <dt className="font-medium text-gray-700 dark:text-slate-200">同一轮里的 useEffect</dt>
                            <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                                绘制之后才轮到它:effect cleanup → effect setup。点下面「再渲染一次」,时间线应是 layout 一对 → effect 一对。
                            </dd>
                        </div>
                        <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                            <dt className="font-medium text-gray-700 dark:text-slate-200">组件卸载</dt>
                            <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                                只跑最后一次 cleanup,没有新的 setup。layout 的 cleanup 仍在卸载提交时同步执行,早于 useEffect 的 cleanup。
                            </dd>
                        </div>
                    </dl>
                </div>
            </TopicSection>

            <TopicSection
                title="点一次,看更新时四段回调的顺序"
                note="第一次渲染没有「上一轮」。再点一次,看最后一段 tick 分隔之后:layout cleanup → layout setup →(绘制)→ effect cleanup → effect setup。开发环境 Strict Mode 会在挂载时故意多跑一遍 cleanup。"
            >
                <OrderProbe />
            </TopicSection>

            <TopicSection
                title="适用场景:绘制前同步改掉中间态"
                note="两边都是「设为 1,再立刻改成 2」。layout 在绘制前就改完,你看不到 1;effect 会先画出 1 再改成 2。这就是 tooltip 定位、避免闪烁时选 layout 的原因。"
            >
                <div className="flex flex-col gap-3 sm:flex-row">
                    <LayoutNudgeBox />
                    <EffectNudgeBox />
                </div>
            </TopicSection>
        </TopicPage>
    );
};

export default UseLayoutEffectTopic;
