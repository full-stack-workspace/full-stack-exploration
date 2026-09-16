/**
 * ============================================================================
 * useMemo 与 memo — Hooks 专题
 * ============================================================================
 *
 * 演示两件经常被绑在一起、其实工作在不同层的事:
 * - React.memo:在「要不要执行子组件函数」这一层做 props 的 Object.is 浅比较
 * - useMemo:在「这次 render 里要不要重算」这一层复用上次的值(以及它的引用)
 *
 * 真正起作用的前提仍然是「有人用 Object.is 比较身份」。memo 没有稳定 props
 * 等于没包;useMemo 没有 memo / 依赖数组去认这份引用,也跳不过子组件。
 * 便宜的派生值应在渲染时直接算,不要为了包而包。本包没有开 React Compiler。
 *
 * @module topics/hooks/use-memo
 */

import React, { memo, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from 'antd';
import { Link } from 'react-router-dom';

import { FlowList, MEMO_BAILOUT_STEPS, USEMEMO_CACHE_STEPS } from '../../../components/FlowList';
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
 * memo 子组件:默认浅比较每个 prop。对象引用一换就会重跑。
 * ================================================================ */

interface ThemeChipProps {
    label: string;
    theme: { name: string };
}

const MemoThemeChip = memo(({ label, theme }: ThemeChipProps) => {
    const renders = useRef(0);
    renders.current += 1;

    return (
        <p className="font-mono text-xs text-gray-600 dark:text-slate-400">
            {label} · 渲染 {renders.current} 次
            <span className="ml-2 text-gray-400 dark:text-slate-500">theme={theme.name}</span>
        </p>
    );
});

MemoThemeChip.displayName = 'MemoThemeChip';

/** 没有 memo:父组件一渲染,子组件必渲染,useMemo 帮不上忙 */
const PlainThemeChip = ({ label, theme }: ThemeChipProps) => {
    const renders = useRef(0);
    renders.current += 1;

    return (
        <p className="font-mono text-xs text-gray-600 dark:text-slate-400">
            {label} · 渲染 {renders.current} 次
            <span className="ml-2 text-gray-400 dark:text-slate-500">theme={theme.name}</span>
        </p>
    );
};

PlainThemeChip.displayName = 'PlainThemeChip';

interface NameChipProps {
    label: string;
    fullName: string;
}

const MemoNameChip = memo(({ label, fullName }: NameChipProps) => {
    const renders = useRef(0);
    renders.current += 1;

    return (
        <p className="font-mono text-xs text-gray-600 dark:text-slate-400">
            {label} · 渲染 {renders.current} 次
            <span className="ml-2 text-gray-400 dark:text-slate-500">{fullName}</span>
        </p>
    );
});

MemoNameChip.displayName = 'MemoNameChip';

/* =================================================================
 * 配对探针:memo × 内联对象 / memo × useMemo / 未 memo × 两种对象
 * ================================================================ */

const PairingProbe = memo(() => {
    const [tick, setTick] = useState(0);
    const [themeName, setThemeName] = useState('indigo');

    const inlineTheme = { name: themeName };
    const stableTheme = useMemo(() => ({ name: themeName }), [themeName]);

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                <Button type="primary" onClick={() => setTick((n) => n + 1)}>
                    配对场景 · 无关状态 +1
                </Button>
                <Button onClick={() => setThemeName((name) => (name === 'indigo' ? 'amber' : 'indigo'))}>
                    配对场景 · 换主题名
                </Button>
                <span className="text-sm text-gray-500 dark:text-slate-400">tick = {tick}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
                <ProbeCard title="memo + 内联 { name }">
                    <MemoThemeChip label="memo · 内联对象" theme={inlineTheme} />
                    <p className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                        每次父组件渲染都 new 一个对象。memo 看见 theme 引用变了,照样跑。
                    </p>
                </ProbeCard>
                <ProbeCard title="memo + useMemo 对象">
                    <MemoThemeChip label="memo · useMemo 对象" theme={stableTheme} />
                    <p className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                        themeName 不变时交回同一份引用。这是唯一会跳过的一格。
                    </p>
                </ProbeCard>
                <ProbeCard title="未 memo + 内联对象">
                    <PlainThemeChip label="未 memo · 内联" theme={inlineTheme} />
                    <p className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                        没有 bailout。父组件跑了,这里必跑。
                    </p>
                </ProbeCard>
                <ProbeCard title="未 memo + 稳定对象">
                    <PlainThemeChip label="未 memo · useMemo" theme={stableTheme} />
                    <p className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                        引用稳住了也没用:没有 memo,React 根本不会去比 props。
                    </p>
                </ProbeCard>
            </div>
        </div>
    );
});

PairingProbe.displayName = 'PairingProbe';

/* =================================================================
 * 计算探针:内联筛选每次 render 都跑;useMemo 只在 query 变时重跑
 * ================================================================ */

const FILTER_ITEMS = ['react', 'redux', 'vue', 'vite'] as const;

/**
 * 带计数的筛选。循环只是让「每次 render 都跑」在教学上可感知,
 * 真正该缓存的是「依赖没变时不要重做这份工作」,不是循环本身。
 */
function filterItems(items: readonly string[], query: string, calls: { current: number }): string[] {
    calls.current += 1;
    let sink = 0;
    for (let i = 0; i < 2500; i += 1) {
        sink += i;
    }
    void sink;
    return items.filter((item) => item.includes(query));
}

const ComputeProbe = memo(() => {
    const [tick, setTick] = useState(0);
    const [query, setQuery] = useState('react');
    const eagerCalls = useRef(0);
    const memoCalls = useRef(0);

    const eagerResult = filterItems(FILTER_ITEMS, query, eagerCalls);
    const memoResult = useMemo(() => filterItems(FILTER_ITEMS, query, memoCalls), [query]);

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                <Button type="primary" onClick={() => setTick((n) => n + 1)}>
                    计算场景 · 无关状态 +1
                </Button>
                <Button onClick={() => setQuery((q) => (q === 'react' ? 'vue' : 'react'))}>
                    切换筛选词
                </Button>
                <span className="text-sm text-gray-500 dark:text-slate-400">
                    tick = {tick} · query = {query}
                </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
                <ProbeCard title="渲染时直接筛选">
                    <p className="font-mono text-xs text-gray-600 dark:text-slate-400">
                        factory 跑了{' '}
                        <span data-testid="eager-compute-count">{eagerCalls.current}</span> 次
                    </p>
                    <p className="mt-2 font-mono text-sm text-primary-600">{eagerResult.join(', ')}</p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                        父组件任意 state 一变,这段都会再跑一遍。query 没变,结果其实一样。
                    </p>
                </ProbeCard>
                <ProbeCard title="useMemo([query])">
                    <p className="font-mono text-xs text-gray-600 dark:text-slate-400">
                        factory 跑了{' '}
                        <span data-testid="memo-compute-count">{memoCalls.current}</span> 次
                    </p>
                    <p
                        data-testid="memo-filter-result"
                        className="mt-2 font-mono text-sm text-primary-600"
                    >
                        {memoResult.join(', ')}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                        无关 tick 交回上一份数组引用;只有点「切换筛选词」才会重算。
                    </p>
                </ProbeCard>
            </div>
        </div>
    );
});

ComputeProbe.displayName = 'ComputeProbe';

/* =================================================================
 * 便宜派生:原始值在渲染时算就够。Object.is 对 string 比的是内容。
 * ================================================================ */

const CheapDerivedProbe = memo(() => {
    const [tick, setTick] = useState(0);
    const [firstName, setFirstName] = useState('Ada');
    const [lastName, setLastName] = useState('Lovelace');
    const fullName = `${firstName} ${lastName}`;

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                <label className="sr-only" htmlFor="memo-first-name">
                    名
                </label>
                <Input
                    id="memo-first-name"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    className="max-w-[8rem]"
                    placeholder="名"
                />
                <label className="sr-only" htmlFor="memo-last-name">
                    姓
                </label>
                <Input
                    id="memo-last-name"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    className="max-w-[8rem]"
                    placeholder="姓"
                />
                <Button type="primary" onClick={() => setTick((n) => n + 1)}>
                    派生场景 · 无关状态 +1
                </Button>
                <span className="text-sm text-gray-500 dark:text-slate-400">tick = {tick}</span>
            </div>
            <ProbeCard title="渲染时拼接的 string,交给 memo 子组件">
                <MemoNameChip label="memo · 派生 string" fullName={fullName} />
                <p className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                    点无关 +1,次数不应涨:「Ada Lovelace」和「Ada Lovelace」的 Object.is 为 true,不需要
                    useMemo。改名/姓才会重渲染,那是数据真的变了。
                </p>
            </ProbeCard>
        </div>
    );
});

CheapDerivedProbe.displayName = 'CheapDerivedProbe';

/* =================================================================
 * 专题页
 * ================================================================ */

const UseMemoTopic: React.FC = () => {
    return (
        <TopicPage
            title="useMemo 与 memo"
            description="memo 决定子组件函数要不要跑;useMemo 决定这次 render 要不要重算。两者都在比 Object.is,配对才有收益。"
        >
            <TopicSection
                title="先分清两层"
                note="问自己:要跳过的是「子组件这次别跑」,还是「这段计算这次别重做」?答案指向不同的 API,经常要一起用。"
            >
                <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <dt className="font-medium text-gray-700 dark:text-slate-200">React.memo(Component)</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                            包在子组件外面。父组件更新后,默认对每个 prop 做 Object.is;全相同就跳过子组件函数。Context 变化不走这条比较。
                        </dd>
                    </div>
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <dt className="font-medium text-gray-700 dark:text-slate-200">useMemo(factory, deps)</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                            写在本次 render 里。deps 用 Object.is 逐项比对,没变就交回上一次的值(同一份引用)。factory 不该有副作用。
                        </dd>
                    </div>
                </dl>
            </TopicSection>

            <TopicSection
                title="memo 何时跳过子组件"
                note="父组件本身拦不住。memo 比较的是传下去的每一项 prop,默认不深入对象字段。"
            >
                <FlowList steps={MEMO_BAILOUT_STEPS} />
            </TopicSection>

            <TopicSection
                title="useMemo 何时交回旧值"
                note="和 useEffect / useCallback 同一套 deps 规则。缓存的是值的身份,不是让 factory 里的算法变快。"
            >
                <FlowList steps={USEMEMO_CACHE_STEPS} />
            </TopicSection>

            <TopicSection
                title="和 useCallback 是同一件事"
                note="useCallback 没有更魔法的缓存。它就是「把函数本身当成 useMemo 的返回值」。"
            >
                <p className="rounded-card border border-gray-100 bg-gray-50 px-3 py-2 font-mono text-sm text-gray-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                    useCallback(fn, deps) ≡ useMemo(() =&gt; fn, deps)
                </p>
                <p className="mt-3 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                    函数用{' '}
                    <Link
                        className="text-primary-600 underline-offset-2 hover:underline"
                        to="/topics/hooks/use-callback"
                    >
                        useCallback
                    </Link>
                    ,对象和数组用 useMemo,比较规则完全一样。
                </p>
            </TopicSection>

            <TopicSection
                title="真正起作用的前提:memo 和稳定引用配对"
                note="点「配对场景 · 无关状态 +1」:只有「memo · useMemo 对象」次数不涨。另外三格都会涨。换主题名四格一起涨,那是数据真的变了。开发环境 Strict Mode 下每次更新可能 +2。"
            >
                <PairingProbe />
            </TopicSection>

            <TopicSection
                title="跳过这次 render 里的重复计算"
                note="点「计算场景 · 无关状态 +1」:左边次数涨、右边停住。点「切换筛选词」两边都涨,结果变成 vue。开发环境 Strict Mode 下挂载和更新可能各多跑一轮。"
            >
                <ComputeProbe />
            </TopicSection>

            <TopicSection
                title="便宜的派生值:渲染时算就够"
                note="string / number / boolean 的 Object.is 比的是值。拼接全名再传给 memo 子组件,无关更新本来就会跳过,再包 useMemo 只是多一次 deps 比较。"
            >
                <CheapDerivedProbe />
            </TopicSection>

            <TopicSection
                title="适用场景"
                note="问自己:有没有人用 Object.is 比较这份引用,或这段计算是否真的贵到需要跳过?没有比较、也不贵,就没有收益。"
            >
                <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <dt className="font-medium text-gray-700 dark:text-slate-200">memo 子组件的对象 / 数组 props</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                            列表行、图表、编辑器这类渲染贵的子组件,用 memo 包住后,把 options / columns / style 用 useMemo 稳住。回调则用{' '}
                            <Link
                                className="text-primary-600 underline-offset-2 hover:underline"
                                to="/topics/hooks/use-callback"
                            >
                                useCallback
                            </Link>
                            。上面配对探针就是这件事。
                        </dd>
                    </div>
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <dt className="font-medium text-gray-700 dark:text-slate-200">贵的派生(筛选、排序、聚合)</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                            输入没变、父组件却因无关 state 重渲染时,useMemo 避免把同一份列表再筛一遍。依赖必须写全,漏了会拿到过期结果。
                        </dd>
                    </div>
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <dt className="font-medium text-gray-700 dark:text-slate-200">Context value 的引用</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                            Provider 的 value=&#123;&#123; state, actions &#125;&#125; 每次都是新对象,下游全员重渲染。站点 Theme / User 把 value 用 useMemo 稳住,并拆成两个 Context,详见{' '}
                            <Link
                                className="text-primary-600 underline-offset-2 hover:underline"
                                to="/topics/advanced/context"
                            >
                                Context API 专题
                            </Link>
                            。
                        </dd>
                    </div>
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <dt className="font-medium text-gray-700 dark:text-slate-200">其他 Hook 的依赖</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                            把对象放进 useEffect / useMemo 的 deps 时,内联字面量会让后面的 Hook 每渲染都重跑。先用 useMemo 交出稳定引用,再写进依赖。和{' '}
                            <Link
                                className="text-primary-600 underline-offset-2 hover:underline"
                                to="/topics/hooks/use-state"
                            >
                                useState 的 Object.is 跳过
                            </Link>
                            是同一套比较。
                        </dd>
                    </div>
                </dl>
            </TopicSection>

            <TopicSection
                title="不要用 memo / useMemo 做的事"
                note="比较 deps 也有成本。没有身份比较的下游,或结果已经是原始值,包一层只是多跑一次 Object.is。"
            >
                <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <dt className="font-medium text-gray-700 dark:text-slate-200">便宜的派生值</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                            first + last、count &gt; 0、items.length 在渲染时算即可。useMemo 的调用和 deps 比对往往比表达式本身更贵。
                        </dd>
                    </div>
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <dt className="font-medium text-gray-700 dark:text-slate-200">没有 memo 的子组件</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                            父组件渲染,子组件就会渲染。useMemo 不能跳过「父已更新」这条路径,上面配对探针的下两格已经演示过。
                        </dd>
                    </div>
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <dt className="font-medium text-gray-700 dark:text-slate-200">改缓存对象的字段</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                            useMemo 交回的是同一份引用。cached.items.push(x) 会静默污染上一轮,下游 memo 还以为没变。要新数据就返回新对象。
                        </dd>
                    </div>
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <dt className="font-medium text-gray-700 dark:text-slate-200">指望 memo 挡住 Context</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                            子组件 use() 了 Context,Provider value 一换,memo 挡不住。该拆 Context 或让订阅面变窄,不是再包一层 memo。
                        </dd>
                    </div>
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <dt className="font-medium text-gray-700 dark:text-slate-200">见组件 / 见计算就包一层</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                            本包没有开 React Compiler。Compiler 会自动稳住身份时,手写 memo / useMemo 常常是噪音;现在仍然手写,也只包「真有人比较,或计算确实贵」的那几处。
                        </dd>
                    </div>
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <dt className="font-medium text-gray-700 dark:text-slate-200">在 factory 里发请求、改 DOM</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                            useMemo 可能被 React 丢弃重跑(尤其未来的 Compiler)。副作用放 effect;渲染路径只做纯计算。
                        </dd>
                    </div>
                </dl>
            </TopicSection>
        </TopicPage>
    );
};

export default UseMemoTopic;
