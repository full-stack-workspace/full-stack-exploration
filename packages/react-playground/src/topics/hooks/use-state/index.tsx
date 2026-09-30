/**
 * ============================================================================
 * useState — Hooks 专题
 * ============================================================================
 *
 * 演示 useState 的机制:state 是一次渲染的快照,setState 只排队下一次
 * 渲染;同一事件里批处理;Object.is 跳过相同引用;惰性初始只跑一次。
 * 并对照适用场景,以及何时升级到 useReducer。
 *
 * @module topics/hooks/use-state
 */

import { memo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Button } from 'antd';
import { Link } from 'react-router-dom';

import { FlowList, STATE_VS_REDUCER_STEPS, type FlowStep } from '../../../components/FlowList';
import { Input } from '../../../components/Input';
import { TopicPage, TopicSection } from '../../../components/TopicPage';

interface Profile {
    name: string;
    age: number;
}

/** setState 发生在事件里,新值要等到下一次组件函数才读得到 */
const SET_STATE_STEPS: FlowStep[] = [
    { title: '事件处理函数里调用 setState', hint: '这里的 count 仍是这次渲染捕获的快照', tone: 'state' },
    { title: 'React 把更新排进队列', hint: '同一事件里多次 setState 会批成一次重渲染', tone: 'commit' },
    { title: '用 Object.is 比较新旧值', hint: '相同则跳过;对象要换新引用才算变了', tone: 'commit' },
    { title: '执行组件函数', hint: '这次才能读到新的 state 快照', tone: 'render' },
];

/* =================================================================
 * 快照探针:点击瞬间读到的值 vs 渲染后屏幕上的值
 * ================================================================ */

const SnapshotProbe = memo(() => {
    const [count, setCount] = useState(0);
    const [clickedWith, setClickedWith] = useState<number | null>(null);
    const renderCountRef = useRef(0);
    renderCountRef.current += 1;

    const addThreeDirectly = () => {
        // 三次都闭包到同一次渲染的 count,批处理后等价于 setCount(count + 1)
        setClickedWith(count);
        setCount(count + 1);
        setCount(count + 1);
        setCount(count + 1);
    };

    const addThreeFunctional = () => {
        setClickedWith(count);
        setCount((current) => current + 1);
        setCount((current) => current + 1);
        setCount((current) => current + 1);
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
                <span className="text-2xl font-bold text-primary-600">{count}</span>
                <Button onClick={addThreeDirectly}>直接传值 ×3(只 +1)</Button>
                <Button type="primary" onClick={addThreeFunctional}>函数式更新 ×3(+3)</Button>
                <Button onClick={() => { setCount(0); setClickedWith(null); }}>清零</Button>
            </div>
            <p className="text-sm text-gray-500">
                组件函数执行次数 {renderCountRef.current}
                {clickedWith === null
                    ? ' · 点一次按钮,对照「点击瞬间」和屏幕数字'
                    : ` · 点击瞬间闭包里的 count = ${clickedWith}`}
            </p>
        </div>
    );
});

SnapshotProbe.displayName = 'SnapshotProbe';

/* =================================================================
 * 原地修改 vs 换新对象:相同引用会被 Object.is 跳过
 * ================================================================ */

const MutateProbe = memo(() => {
    const [profile, setProfile] = useState<Profile>({ name: '小明', age: 18 });
    const renderCountRef = useRef(0);
    renderCountRef.current += 1;

    const mutateInPlace = () => {
        // 改了字段,但传回同一个对象,React 认为没更新
        profile.age += 1;
        setProfile(profile);
    };

    const replaceObject = () => {
        setProfile((current) => ({ ...current, age: current.age + 1 }));
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-gray-700">
                    {profile.name},{profile.age} 岁
                </span>
                <Button onClick={mutateInPlace}>原地 +1(引用不变)</Button>
                <Button type="primary" onClick={replaceObject}>换新对象 +1</Button>
            </div>
            <p className="text-sm text-gray-500">
                组件函数执行次数 {renderCountRef.current} · 原地修改后屏幕上的年龄往往不动,对象内部其实已经被改脏了
            </p>
        </div>
    );
});

MutateProbe.displayName = 'MutateProbe';

/* =================================================================
 * 对象字段的不可变更新(表单场景)
 * ================================================================ */

const ProfileForm = memo(() => {
    const [profile, setProfile] = useState<Profile>({ name: '小明', age: 18 });

    const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        setProfile((current) => ({ ...current, name: e.target.value }));
    };

    return (
        <div className="flex flex-wrap items-center gap-3">
            <label className="sr-only" htmlFor="profile-name">姓名</label>
            <Input
                id="profile-name"
                value={profile.name}
                onChange={handleNameChange}
                className="max-w-[10rem]"
            />
            <Button onClick={() => setProfile((current) => ({ ...current, age: current.age + 1 }))}>
                年龄 +1
            </Button>
            <span className="text-sm text-gray-700">
                {profile.name},{profile.age} 岁
            </span>
        </div>
    );
});

ProfileForm.displayName = 'ProfileForm';

/* =================================================================
 * 惰性初始:表达式每次 render 都求值,函数形式只在挂载时跑
 * ================================================================ */

function computeSeed(calls: { current: number }): number {
    calls.current += 1;
    let total = 0;
    for (let i = 0; i < 2000; i += 1) {
        total += i;
    }
    return total;
}

const EagerInitChild = memo(({ tick }: { tick: number }) => {
    const callsRef = useRef(0);
    // 参数先求值再传给 useState:父组件每次无关更新都会再跑一遍
    const [seed] = useState(computeSeed(callsRef));

    return (
        <div className="rounded-card border border-gray-100 bg-gray-50 p-3">
            <p className="text-sm font-medium text-gray-700">useState(computeSeed())</p>
            <p className="mt-1 font-mono text-xs text-gray-500">
                表达式累计 {callsRef.current} 次 · seed = {seed} · tick = {tick}
            </p>
        </div>
    );
});

EagerInitChild.displayName = 'EagerInitChild';

const LazyInitChild = memo(({ tick }: { tick: number }) => {
    const callsRef = useRef(0);
    const [seed] = useState(() => computeSeed(callsRef));

    return (
        <div className="rounded-card border border-gray-100 bg-gray-50 p-3">
            <p className="text-sm font-medium text-gray-700">{'useState(() => computeSeed())'}</p>
            <p className="mt-1 font-mono text-xs text-gray-500">
                惰性函数累计 {callsRef.current} 次 · seed = {seed} · tick = {tick}
            </p>
        </div>
    );
});

LazyInitChild.displayName = 'LazyInitChild';

const LazyInitProbe = memo(() => {
    const [tick, setTick] = useState(0);

    return (
        <div className="space-y-3">
            <Button onClick={() => setTick((value) => value + 1)}>无关状态 +1(触发子组件再渲染)</Button>
            <div className="grid gap-3 sm:grid-cols-2">
                <EagerInitChild tick={tick} />
                <LazyInitChild tick={tick} />
            </div>
        </div>
    );
});

LazyInitProbe.displayName = 'LazyInitProbe';

/* =================================================================
 * 派生数据:render 里算,不要再存一份 state
 * ================================================================ */

const DerivedProbe = memo(() => {
    const [firstName, setFirstName] = useState('小');
    const [lastName, setLastName] = useState('明');
    const fullName = `${firstName}${lastName}`;

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
                <label className="sr-only" htmlFor="first-name">名</label>
                <Input
                    id="first-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="max-w-[8rem]"
                    placeholder="名"
                />
                <label className="sr-only" htmlFor="last-name">姓</label>
                <Input
                    id="last-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="max-w-[8rem]"
                    placeholder="姓"
                />
            </div>
            <p className="text-sm text-gray-700">
                全名 <span className="font-medium text-primary-600">{fullName}</span>
                <span className="text-gray-400"> · 渲染时拼出来,没有第三份 state</span>
            </p>
        </div>
    );
});

DerivedProbe.displayName = 'DerivedProbe';

/* =================================================================
 * 专题页
 * ================================================================ */

const UseStateTopic = () => {
    return (
        <TopicPage
            title="useState"
            description="state 是一次渲染的快照;setState 只排队下一次渲染,同一事件里会批处理"
        >
            <TopicSection
                title="setState 不会改当前这次渲染"
                note="记住:事件处理函数里读到的 count,是这次 render 捕获的快照。新值要等组件函数再跑一遍才出现。"
            >
                <FlowList steps={SET_STATE_STEPS} />
            </TopicSection>

            <TopicSection
                title="与 useReducer 的完整对比"
                note="两条 hook 触发渲染的时机一样,差别只在下一份 state 怎么算:直接给值 / updater,还是 dispatch 进 reducer。"
            >
                <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-start">
                    <FlowList steps={STATE_VS_REDUCER_STEPS} />
                    <div className="hidden h-full w-px bg-gray-100 lg:block" />
                    <dl className="space-y-3 text-sm text-gray-600">
                        <div>
                            <dt className="font-medium text-emerald-600">useState(默认选它)</dt>
                            <dd className="mt-1 text-xs leading-relaxed text-gray-400">
                                彼此独立的值:开关、计数、输入草稿。下一份状态很好写,用函数式更新就能基于最新值。
                            </dd>
                        </div>
                        <div>
                            <dt className="font-medium text-sky-600">useReducer</dt>
                            <dd className="mt-1 text-xs leading-relaxed text-gray-400">
                                多字段必须一起变、更新规则复杂、想把「发生了什么」从 UI 里抽出来时再升级。详见{' '}
                                <Link className="text-primary-600 underline-offset-2 hover:underline" to="/hooks/use-reducer">
                                    useReducer 专题
                                </Link>
                                。
                            </dd>
                        </div>
                    </dl>
                </div>
            </TopicSection>

            <TopicSection
                title="同一事件里批处理:直接传值 vs 函数式更新"
                note="三次 setCount(count + 1) 都基于同一快照,批完只 +1;三次 setCount(c => c + 1) 会串起来,真正 +3。开发环境 Strict Mode 可能让首次挂载多跑一遍组件函数。"
            >
                <SnapshotProbe />
            </TopicSection>

            <TopicSection
                title="Object.is:原地修改会被跳过"
                note="setState 传入同一个对象引用时,React 直接跳过重渲染。数组、对象、Map 都要换新引用;不要改原状态再塞回去。"
            >
                <MutateProbe />
            </TopicSection>

            <TopicSection
                title="适用场景:用展开运算符改对象字段"
                note="姓名输入、年龄按钮只覆盖一个字段,其余保持原样。这是 useState 管表单草稿的典型写法。"
            >
                <ProfileForm />
            </TopicSection>

            <TopicSection
                title="适用场景:惰性初始,昂贵计算只跑一次"
                note="点「无关状态 +1」后,左边表达式次数继续涨,右边惰性函数应停在挂载时的次数(Strict Mode 下可能是 2)。seed 本身不会变。"
            >
                <LazyInitProbe />
            </TopicSection>

            <TopicSection
                title="适用场景:派生数据在渲染时计算"
                note="全名能从名 + 姓直接拼出来,就不要再 useState 存一份,也别用 effect 去同步。"
            >
                <DerivedProbe />
            </TopicSection>

            <TopicSection
                title="不要用 useState 做的事"
                note="能算出来的别存;必须一起变的多份状态,与其散落在一堆 setter 里,不如收进 reducer。"
            >
                <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3">
                        <dt className="font-medium text-gray-700">派生数据</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400">
                            过滤列表、已完成条数、fullName,在 render 里算。存进 state 会和源数据打架。
                        </dd>
                    </div>
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3">
                        <dt className="font-medium text-gray-700">会过期的闭包值</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400">
                            定时器、连续点击里要用最新值,写函数式更新拿到 prev,不要读渲染当时的 count。
                        </dd>
                    </div>
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3">
                        <dt className="font-medium text-gray-700">多字段关联更新</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400">
                            购物车加减库存、向导上一步下一步、待办的增删改完成态,散落的 setter 很难保证一致。
                        </dd>
                    </div>
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3">
                        <dt className="font-medium text-gray-700">可变数据结构</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400">
                            push、直接改 obj.x 都不会触发渲染,甚至把 state 改脏。始终返回新数组 / 新对象。
                        </dd>
                    </div>
                </dl>
            </TopicSection>
        </TopicPage>
    );
};

export default UseStateTopic;
