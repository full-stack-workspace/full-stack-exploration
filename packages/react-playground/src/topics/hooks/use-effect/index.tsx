/**
 * ============================================================================
 * useEffect — Hooks 专题
 * ============================================================================
 *
 * 演示 useEffect 的执行时机:绘制之后再跑;依赖变化时先执行上一轮
 * return 的 cleanup(旧闭包),再跑新 setup。卸载时只跑最后一次 cleanup。
 *
 * @module topics/hooks/use-effect
 */

import { memo, useEffect, useRef, useState } from 'react';
import { Button, Segmented, Switch } from 'antd';
import { Link } from 'react-router-dom';

import { EFFECT_UPDATE_STEPS, EFFECT_VS_LAYOUT_STEPS, FlowList, type FlowStep } from '../../../components/FlowList';
import { Input } from '../../../components/Input';
import { TopicPage, TopicSection } from '../../../components/TopicPage';

type DepsMode = 'every' | 'once' | 'count';

/** 绘制后这条链路:effect 不挡住首屏,里面再 setState 也只会影响下一帧 */
const AFTER_PAINT_STEPS: FlowStep[] = [
    { title: '执行组件函数', hint: 'Render:计算本次要提交的 JSX', tone: 'render' },
    { title: 'React 更新 DOM', hint: 'Commit:把计算结果写进真实 DOM', tone: 'commit' },
    { title: '浏览器绘制页面', hint: '用户已经看到这一帧', tone: 'paint' },
    { title: '执行 useEffect', hint: '首次是 setup;更新时会先跑上一次 return 的函数,再跑这次 setup', tone: 'effect' },
    { title: '如果其中更新状态,再重新渲染', hint: '这是下一帧的事,中间态可能已经画出去了', tone: 'effect' },
];

const DEPS_OPTIONS: { label: string; value: DepsMode }[] = [
    { label: '每次渲染', value: 'every' },
    { label: '[] 仅挂载', value: 'once' },
    { label: '[count]', value: 'count' },
];

/* =================================================================
 * 秒表:[] 只在挂载时启动,卸载时 cleanup 清掉定时器
 * ================================================================ */

const Stopwatch = memo(() => {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    return <span className="font-mono text-xl text-primary-600">{seconds}s</span>;
});

Stopwatch.displayName = 'Stopwatch';

/* =================================================================
 * 依赖数组探针:三种 deps 策略下 setup / cleanup 何时出现
 * ================================================================ */

interface DepsProbeProps {
    mode: DepsMode;
    count: number;
    unrelated: number;
}

const DepsProbe = memo(({ mode, count, unrelated }: DepsProbeProps) => {
    const [logs, setLogs] = useState<string[]>([]);
    const seqRef = useRef(0);

    // 固定长度 deps:React 只比较公共前缀,mode 切换时不能改数组长度
    const countToken = mode === 'once' ? 0 : count;
    const unrelatedToken = mode === 'every' ? unrelated : 0;

    useEffect(() => {
        const seq = seqRef.current + 1;
        seqRef.current = seq;
        const snapshot = count;
        setLogs((prev) => [...prev, `setup #${seq} · 闭包 count=${snapshot}`].slice(-8));
        return () => {
            setLogs((prev) => [...prev, `cleanup #${seq} · 闭包 count=${snapshot}`].slice(-8));
        };
        // count 是否重跑由 countToken 决定;跑起来时闭包里的 count 就是那一次渲染的快照
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, countToken, unrelatedToken]);

    return (
            <ol
                data-testid="deps-probe-log"
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
    );
});

DepsProbe.displayName = 'DepsProbe';

/* =================================================================
 * 专题页
 * ================================================================ */

const UseEffectTopic = () => {
    const [keyword, setKeyword] = useState('');
    const [searchLog, setSearchLog] = useState<string[]>([]);
    const [mounted, setMounted] = useState(true);
    const [depsMode, setDepsMode] = useState<DepsMode>('count');
    const [count, setCount] = useState(0);
    const [unrelated, setUnrelated] = useState(0);

    // 依赖 [keyword]:仅当 keyword 变化时才执行;输入停止后才真正"发起搜索"
    useEffect(() => {
        if (!keyword) {
            return;
        }
        const timer = setTimeout(() => {
            setSearchLog((prev) => [`搜索:"${keyword}"`, ...prev].slice(0, 5));
        }, 500);
        // 清理函数实现防抖:keyword 连续变化时,上一个定时器被取消
        return () => clearTimeout(timer);
    }, [keyword]);

    return (
        <TopicPage
            title="useEffect"
            description="浏览器绘制之后再执行副作用;依赖一变时先跑上一次 return 的 cleanup(旧闭包),再跑新 setup。依赖没变则跳过"
        >
            <TopicSection
                title="绘制后这条链路"
                note="记住:useEffect 发生在「像素已经画完」之后。里面再 setState,用户可能已经看过中间那一帧。"
            >
                <FlowList steps={AFTER_PAINT_STEPS} />
            </TopicSection>

            <TopicSection
                title="与 useLayoutEffect 的完整对比"
                note="两条 hook 签名几乎一样,差别只在何时跑:layout 阻塞 Paint,effect 通常在 Paint 之后。更新时两边都是先 cleanup 再 setup,只是这一对发生在 Paint 的哪一侧不同。"
            >
                <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-start">
                    <FlowList steps={EFFECT_VS_LAYOUT_STEPS} />
                    <div className="hidden h-full w-px bg-gray-100 dark:bg-slate-800 lg:block" />
                    <dl className="space-y-3 text-sm text-gray-600">
                        <div>
                            <dt className="font-medium text-sky-600">useEffect(默认选它)</dt>
                            <dd className="mt-1 text-xs leading-relaxed text-gray-400">
                                订阅、请求、定时器、打点、和绘制无关的同步。不挡住首屏,也是依赖数组 + cleanup 的主场。
                            </dd>
                        </div>
                        <div>
                            <dt className="font-medium text-amber-600">useLayoutEffect</dt>
                            <dd className="mt-1 text-xs leading-relaxed text-gray-400">
                                只在「第一帧就不能错」时用:读布局、校正位置、避免闪烁。更新时它的 cleanup 在绘制前就跑完。详见{' '}
                                <Link className="text-primary-600 underline-offset-2 hover:underline" to="/topics/hooks/use-layout-effect">
                                    useLayoutEffect 专题
                                </Link>
                                。
                            </dd>
                        </div>
                    </dl>
                </div>
            </TopicSection>

            <TopicSection
                title="更新时:先跑上一次 return 的函数,再跑新的 setup"
                note="return 的不是「卸载回调」,组件还在。依赖一变,React 在绘制之后先调用上一轮返回的 cleanup(闭包仍是旧值),再执行这一轮 setup。依赖没变则两个都不跑;卸载时只跑最后一次 cleanup。"
            >
                <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-start">
                    <FlowList steps={EFFECT_UPDATE_STEPS} />
                    <div className="hidden h-full w-px bg-gray-100 dark:bg-slate-800 lg:block" />
                    <dl className="space-y-3 text-sm">
                        <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                            <dt className="font-medium text-gray-700 dark:text-slate-200">依赖变了</dt>
                            <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                                Paint 之后:cleanup(旧闭包) → setup(新闭包)。上一轮的定时器 / 订阅必须先拆掉,不会两条并行。
                            </dd>
                        </div>
                        <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                            <dt className="font-medium text-gray-700 dark:text-slate-200">依赖没变</dt>
                            <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                                组件函数照样执行、DOM 也可能更新,但这一对 effect 完全跳过。点下面的「无关状态 +1」看 [count] 模式。
                            </dd>
                        </div>
                        <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                            <dt className="font-medium text-gray-700 dark:text-slate-200">组件卸载</dt>
                            <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                                只跑最后一次 cleanup,没有新的 setup。秒表开关演示的是这一条,不是更新。
                            </dd>
                        </div>
                    </dl>
                </div>
            </TopicSection>

            <TopicSection
                title="依赖数组决定何时重跑"
                note="默认 [count]。点 count +1,应看到 cleanup(闭包 0)紧挨着新的 setup(闭包 1)。开发环境 Strict Mode 挂载时会先 setup → cleanup → setup,序号可能从 #2 起跳。切到 [] 后再点 count,不应再出新日志。"
            >
                <div className="space-y-3">
                    <Segmented
                        value={depsMode}
                        options={DEPS_OPTIONS}
                        onChange={(value) => setDepsMode(value as DepsMode)}
                    />
                    <div className="flex flex-wrap items-center gap-2">
                        <Button type="primary" onClick={() => setCount((value) => value + 1)}>
                            count +1
                        </Button>
                        <Button onClick={() => setUnrelated((value) => value + 1)}>
                            无关状态 +1
                        </Button>
                        <span className="text-sm text-gray-500">
                            count = {count} · 无关 = {unrelated}
                        </span>
                    </div>
                    <DepsProbe mode={depsMode} count={count} unrelated={unrelated} />
                </div>
            </TopicSection>

            <TopicSection
                title="适用场景:用 cleanup 对接外部系统"
                note="快速输入时,每次 keyword 变化都会先执行上一轮 return 的 clearTimeout,再设一个新定时器。停顿 500ms 后才真正「搜索」。这就是更新时 cleanup 的典型用法。"
            >
                <div className="space-y-3">
                    <label className="sr-only" htmlFor="effect-keyword">搜索关键词</label>
                    <Input
                        id="effect-keyword"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="输入关键词试试防抖搜索"
                        className="max-w-xs"
                    />
                    <ul className="space-y-1 text-sm text-gray-600">
                        {searchLog.map((log, i) => (
                            <li key={`${log}-${i}`}>{log}</li>
                        ))}
                    </ul>
                </div>
            </TopicSection>

            <TopicSection
                title="适用场景:挂载启动、卸载清理"
                note="关闭开关卸载秒表,这时没有新的 setup,只跑最后一次 cleanup 去 clearInterval。这和上面「更新时先 cleanup 再 setup」不是同一条路径。"
            >
                <div className="flex items-center gap-4">
                    <Switch checked={mounted} onChange={setMounted} />
                    {mounted ? <Stopwatch /> : <span className="text-gray-400">秒表已卸载</span>}
                </div>
            </TopicSection>

            <TopicSection
                title="不要放进 useEffect 的事"
                note="能在渲染时算出来的不要存进 state;用户点了才发生的事放到事件处理函数里。"
            >
                <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3">
                        <dt className="font-medium text-gray-700">派生数据</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400">
                            fullName = first + last,过滤列表、排序结果,在 render 里直接算,不要 effect 里 setState 同步。
                        </dd>
                    </div>
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3">
                        <dt className="font-medium text-gray-700">用户事件</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400">
                            点击提交、输入时校验,写在 onClick / onChange 里。不要「先 setSubmitted,再在 effect 里发请求」。
                        </dd>
                    </div>
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3">
                        <dt className="font-medium text-gray-700">重置 state 跟 props</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400">
                            用户切换时要清空草稿,给组件加 key,让 React 重新挂载,而不是 effect 里侦听 userId 再 setState。
                        </dd>
                    </div>
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3">
                        <dt className="font-medium text-gray-700">测量 DOM / 防闪烁</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400">
                            读宽高、校正弹层位置请用 useLayoutEffect,否则会先画出错误位置再跳一下。
                        </dd>
                    </div>
                </dl>
            </TopicSection>
        </TopicPage>
    );
};

export default UseEffectTopic;
