/**
 * ============================================================================
 * Context API — 进阶专题
 * ============================================================================
 *
 * 演示 createContext → Provider → use() 这条通道:最近的 Provider 胜出,
 * value 引用一变所有订阅者重渲染。对照胖 Context、拆分 state/actions、
 * 以及把 children 从 Provider 状态中抬出去,避免无关更新。
 *
 * @module topics/advanced/context
 */

import { createContext, memo, use, useCallback, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from 'antd';
import { Link } from 'react-router-dom';

import { FlowList, type FlowStep } from '../../../components/FlowList';
import { TopicPage, TopicSection } from '../../../components/TopicPage';
import { useTheme, useThemeActions } from '../../../context/ThemeProvider';
import { MOCK_USERS, useUser, useUserActions } from '../../../context/UserProvider';

const LOOKUP_STEPS: FlowStep[] = [
    { title: 'createContext 创建通道', hint: '本身不存数据,只是树上的一个「名字」', tone: 'state' },
    { title: 'Provider 在某一层提供 value', hint: '覆盖范围是这棵子树,不是整个应用', tone: 'commit' },
    { title: 'use() / useContext 向上查找', hint: '碰到的最近一个同名 Provider 胜出', tone: 'render' },
    { title: 'value 用 Object.is 比较', hint: '引用变了,所有订阅该 Context 的消费者都会重渲染', tone: 'commit' },
];

const RoomContext = createContext('大厅');

const RoomLabel = memo(({ label }: { label: string }) => {
    const room = use(RoomContext);
    return (
        <p className="text-sm text-gray-700 dark:text-slate-300">
            {label}: <span className="font-medium text-primary-600">{room}</span>
        </p>
    );
});

RoomLabel.displayName = 'RoomLabel';

const NestedProviderProbe = memo(() => {
    return (
        <RoomContext value="大厅">
            <div className="space-y-2 rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                <RoomLabel label="外层" />
                <RoomContext value="包厢 A">
                    <div className="rounded-card border border-dashed border-primary-200 bg-white p-3 dark:border-primary-800 dark:bg-slate-900">
                        <RoomLabel label="内层" />
                    </div>
                </RoomContext>
            </div>
        </RoomContext>
    );
});

NestedProviderProbe.displayName = 'NestedProviderProbe';

const SiteContextProbe = memo(() => {
    const theme = useTheme();
    const { toggleTheme } = useThemeActions();
    const user = useUser();
    const { switchUser, signIn, signOut } = useUserActions();
    const otherUser = MOCK_USERS.find((candidate) => candidate.id !== user?.id) ?? MOCK_USERS[0];

    return (
        <div className="space-y-3">
            <p className="text-sm text-gray-700 dark:text-slate-300">
                当前主题 <span className="font-medium text-primary-600">{theme}</span>
                {' · '}
                当前用户{' '}
                <span className="font-medium text-primary-600">
                    {user ? `${user.name} (${user.role})` : '未登录'}
                </span>
            </p>
            <div className="flex flex-wrap gap-2">
                <Button onClick={toggleTheme}>切换主题(看 Header 月亮按钮)</Button>
                {user ? (
                    <>
                        <Button onClick={() => switchUser(otherUser.id)}>换成 {otherUser.name}</Button>
                        <Button onClick={signOut}>退出</Button>
                    </>
                ) : (
                    <Button type="primary" onClick={() => signIn(MOCK_USERS[0].id)}>
                        模拟登录
                    </Button>
                )}
            </div>
        </div>
    );
});

SiteContextProbe.displayName = 'SiteContextProbe';

/* =================================================================
 * 胖 Context:一份对象里塞 count + tick,改 tick 也会拖着 count 读者重渲染
 * ================================================================ */

interface FatValue {
    count: number;
    tick: number;
    bumpCount: () => void;
    bumpTick: () => void;
}

const FatContext = createContext<FatValue | null>(null);

function useFat(): FatValue {
    const value = use(FatContext);
    if (!value) {
        throw new Error('FatContext missing');
    }
    return value;
}

const FatCountReader = memo(() => {
    const { count } = useFat();
    const rendersRef = useRef(0);
    rendersRef.current += 1;

    return (
        <p className="font-mono text-xs text-gray-600 dark:text-slate-400">
            只读 count = {count} · 本组件渲染 {rendersRef.current} 次
        </p>
    );
});

FatCountReader.displayName = 'FatCountReader';

const FatTickReader = memo(() => {
    const { tick } = useFat();
    const rendersRef = useRef(0);
    rendersRef.current += 1;

    return (
        <p className="font-mono text-xs text-gray-600 dark:text-slate-400">
            只读 tick = {tick} · 本组件渲染 {rendersRef.current} 次
        </p>
    );
});

FatTickReader.displayName = 'FatTickReader';

const FatButtons = memo(() => {
    const { bumpCount, bumpTick } = useFat();
    return (
        <div className="flex flex-wrap gap-2">
            <Button size="small" onClick={bumpCount}>
                count +1
            </Button>
            <Button size="small" type="primary" onClick={bumpTick}>
                无关 tick +1
            </Button>
        </div>
    );
});

FatButtons.displayName = 'FatButtons';

const FatProvider = ({ children }: { children: ReactNode }) => {
    const [count, setCount] = useState(0);
    const [tick, setTick] = useState(0);
    const bumpCount = useCallback(() => setCount((current) => current + 1), []);
    const bumpTick = useCallback(() => setTick((current) => current + 1), []);
    // 故意每次 render 都造新对象,模拟「state 和 actions 捆在一起」
    const value: FatValue = { count, tick, bumpCount, bumpTick };

    return <FatContext value={value}>{children}</FatContext>;
};

const FatContextProbe = memo(() => {
    return (
        <FatProvider>
            <div className="space-y-2">
                <FatCountReader />
                <FatTickReader />
                <FatButtons />
            </div>
        </FatProvider>
    );
});

FatContextProbe.displayName = 'FatContextProbe';

/* =================================================================
 * 拆分 Context:count / tick / actions 各走一条通道
 * ================================================================ */

const CountStateContext = createContext(0);
const TickStateContext = createContext(0);

interface SplitActions {
    bumpCount: () => void;
    bumpTick: () => void;
}

const SplitActionsContext = createContext<SplitActions | null>(null);

const SplitCountReader = memo(() => {
    const count = use(CountStateContext);
    const rendersRef = useRef(0);
    rendersRef.current += 1;

    return (
        <p className="font-mono text-xs text-gray-600 dark:text-slate-400">
            只读 count = {count} · 本组件渲染 {rendersRef.current} 次
        </p>
    );
});

SplitCountReader.displayName = 'SplitCountReader';

const SplitTickReader = memo(() => {
    const tick = use(TickStateContext);
    const rendersRef = useRef(0);
    rendersRef.current += 1;

    return (
        <p className="font-mono text-xs text-gray-600 dark:text-slate-400">
            只读 tick = {tick} · 本组件渲染 {rendersRef.current} 次
        </p>
    );
});

SplitTickReader.displayName = 'SplitTickReader';

const SplitButtons = memo(() => {
    const actions = use(SplitActionsContext);
    if (!actions) {
        return null;
    }
    return (
        <div className="flex flex-wrap gap-2">
            <Button size="small" onClick={actions.bumpCount}>
                count +1
            </Button>
            <Button size="small" type="primary" onClick={actions.bumpTick}>
                无关 tick +1
            </Button>
        </div>
    );
});

SplitButtons.displayName = 'SplitButtons';

const SplitProvider = ({ children }: { children: ReactNode }) => {
    const [count, setCount] = useState(0);
    const [tick, setTick] = useState(0);
    const bumpCount = useCallback(() => setCount((current) => current + 1), []);
    const bumpTick = useCallback(() => setTick((current) => current + 1), []);
    const actions = useMemo<SplitActions>(
        () => ({ bumpCount, bumpTick }),
        [bumpCount, bumpTick],
    );

    return (
        <CountStateContext value={count}>
            <TickStateContext value={tick}>
                <SplitActionsContext value={actions}>{children}</SplitActionsContext>
            </TickStateContext>
        </CountStateContext>
    );
};

const SplitContextProbe = memo(() => {
    return (
        <SplitProvider>
            <div className="space-y-2">
                <SplitCountReader />
                <SplitTickReader />
                <SplitButtons />
            </div>
        </SplitProvider>
    );
});

SplitContextProbe.displayName = 'SplitContextProbe';

/* =================================================================
 * children 抬出去:Provider 自己 setState 时,没订阅 Context 的子树不重渲染
 * ================================================================ */

const IdleLeaf = memo(() => {
    const rendersRef = useRef(0);
    rendersRef.current += 1;
    return (
        <p className="font-mono text-xs text-gray-600 dark:text-slate-400">
            未订阅任何 Context · 渲染 {rendersRef.current} 次
        </p>
    );
});

IdleLeaf.displayName = 'IdleLeaf';

const HoistedProvider = ({ children }: { children: ReactNode }) => {
    const [n, setN] = useState(0);

    return (
        <div className="space-y-2">
            <Button size="small" onClick={() => setN((current) => current + 1)}>
                Provider 内部状态 +1(当前 {n})
            </Button>
            {children}
        </div>
    );
};

const HoistedChildrenProbe = memo(() => {
    return (
        <HoistedProvider>
            <IdleLeaf />
        </HoistedProvider>
    );
});

HoistedChildrenProbe.displayName = 'HoistedChildrenProbe';

/* =================================================================
 * 页面级 Locale:适合 Context 的另一类场景(与 theme/user 无关的局部通道)
 * ================================================================ */

type Locale = 'zh' | 'en';

const COPY: Record<Locale, { hello: string; hint: string }> = {
    zh: { hello: '你好,欢迎来到 Context 专题', hint: '这段文案来自最近的 LocaleProvider' },
    en: { hello: 'Hello from the Context topic', hint: 'This copy comes from the nearest LocaleProvider' },
};

const LocaleContext = createContext<Locale>('zh');

const LocaleGreeting = memo(() => {
    const locale = use(LocaleContext);
    const copy = COPY[locale];
    return (
        <div>
            <p className="text-sm font-medium text-gray-800 dark:text-slate-100">{copy.hello}</p>
            <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">{copy.hint}</p>
        </div>
    );
});

LocaleGreeting.displayName = 'LocaleGreeting';

const LocaleProbe = memo(() => {
    const [locale, setLocale] = useState<Locale>('zh');

    return (
        <LocaleContext value={locale}>
            <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                    <Button type={locale === 'zh' ? 'primary' : 'default'} onClick={() => setLocale('zh')}>
                        中文
                    </Button>
                    <Button type={locale === 'en' ? 'primary' : 'default'} onClick={() => setLocale('en')}>
                        English
                    </Button>
                </div>
                <LocaleGreeting />
            </div>
        </LocaleContext>
    );
});

LocaleProbe.displayName = 'LocaleProbe';

/* =================================================================
 * 专题页
 * ================================================================ */

const UseContextTopic = () => {
    return (
        <TopicPage
            title="Context API"
            description="createContext 开通道,Provider 在范围内供数,use() 读最近一层;value 引用一变,订阅者全部重渲染"
        >
            <TopicSection
                title="查找规则:永远读最近的 Provider"
                note="Context 不是全局单例。树上可以叠多层同名 Provider,内层覆盖外层。没包 Provider 时读到的是 createContext 的默认值。"
            >
                <FlowList steps={LOOKUP_STEPS} />
            </TopicSection>

            <TopicSection
                title="嵌套 Provider:内层覆盖外层"
                note="两个 RoomLabel 用的是同一个 Context,读到的房间名却不同——因为它们各自碰到的最近 Provider 不一样。"
            >
                <NestedProviderProbe />
            </TopicSection>

            <TopicSection
                title="站点真实用法:Theme 与模拟用户"
                note="Header 右侧的月亮按钮和用户芯片,读的就是这两个站点级 Provider。点下面的按钮,顶栏会一起变——这就是「跨很远的组件共享一份数据」。"
            >
                <SiteContextProbe />
            </TopicSection>

            <TopicSection
                title="性能问题:胖 Context 会连坐"
                note="count 和 tick 捆在同一个 value 对象里。点「无关 tick +1」时对象引用变了,只读 count 的组件也会重渲染(开发环境 Strict Mode 可能让首次多记一次)。"
            >
                <FatContextProbe />
            </TopicSection>

            <TopicSection
                title="优化一:把会变的值拆成多条 Context"
                note="站点 Theme / User 就是这样拆的:state 一条、actions 一条。点「无关 tick +1」后,左边只读 count 的渲染次数不应再涨。"
            >
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-card border border-red-100 bg-red-50/60 p-3 dark:border-red-900/60 dark:bg-red-950/40">
                        <p className="mb-2 text-xs font-medium text-red-600">胖 Context(对照)</p>
                        <FatContextProbe />
                    </div>
                    <div className="rounded-card border border-emerald-100 bg-emerald-50/60 p-3 dark:border-emerald-900/60 dark:bg-emerald-950/40">
                        <p className="mb-2 text-xs font-medium text-emerald-600">拆分后</p>
                        <SplitContextProbe />
                    </div>
                </div>
            </TopicSection>

            <TopicSection
                title="优化二:children 从 Provider 状态里抬出去"
                note="IdleLeaf 作为 children 传入,不订阅任何 Context。Provider 内部 setState 时,children 元素引用不变,React 会跳过这棵子树。组件还要用 memo,避免父级自己重渲染时把叶子带着跑。"
            >
                <HoistedChildrenProbe />
            </TopicSection>

            <TopicSection
                title="另一类适用场景:页面级语言通道"
                note="主题、当前用户、当前语言、当前工作区……这些「整棵子树都可能用到、但又不该层层 props」的值,才值得开 Context。语言切换只影响包在 LocaleProvider 里的文案,不会动 Header。"
            >
                <LocaleProbe />
            </TopicSection>

            <TopicSection
                title="不要用 Context 做的事"
                note="Context 解决的是传递距离,不是状态复杂度。高频更新、只传两三层、或其实是服务器状态时,换工具。"
            >
                <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <dt className="font-medium text-gray-700 dark:text-slate-200">只隔一两层的 props</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                            父子、爷孙直接传更清楚。为了少写一个参数就上 Context,后面谁提供的值会很难找。
                        </dd>
                    </div>
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <dt className="font-medium text-gray-700 dark:text-slate-200">高频变化的值</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                            输入草稿、指针坐标、滚动位置会让整棵订阅树跟着抖。留在局部 state,或拆成极窄的 Context。
                        </dd>
                    </div>
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <dt className="font-medium text-gray-700 dark:text-slate-200">多字段必须一起变</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                            Context 只负责分发。下一份 state 怎么算,该用 useReducer,见{' '}
                            <Link className="text-primary-600 underline-offset-2 hover:underline" to="/hooks/use-reducer">
                                useReducer 专题
                            </Link>
                            。
                        </dd>
                    </div>
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <dt className="font-medium text-gray-700 dark:text-slate-200">服务器缓存 / 请求去重</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                            列表、详情、登录态若来自接口,用 Relay / SWR 这类工具,别把响应塞进一个巨大的 Context。
                        </dd>
                    </div>
                </dl>
            </TopicSection>
        </TopicPage>
    );
};

export default UseContextTopic;
