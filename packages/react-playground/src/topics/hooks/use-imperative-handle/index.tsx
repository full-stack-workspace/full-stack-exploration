/**
 * ============================================================================
 * useImperativeHandle — Hooks 专题
 * ============================================================================
 *
 * 演示 useImperativeHandle 的机制:父组件传来的 ref 默认会指向宿主节点;
 * 这个 hook 在 commit 时改写 current,让父组件只能调用你列出的命令。
 * 它是 useRef 的「对侧」:盒子仍由父组件持有,内容由子组件填。
 *
 * @module topics/hooks/use-imperative-handle
 */

import { memo, useImperativeHandle, useRef, useState } from 'react';
import type { ReactNode, Ref } from 'react';
import { Button } from 'antd';
import { Link } from 'react-router-dom';

import { FlowList, IMPERATIVE_HANDLE_STEPS } from '../../../components/FlowList';
import { Input } from '../../../components/Input';
import { TopicPage, TopicSection } from '../../../components/TopicPage';

/* =================================================================
 * 类型:父组件只能看到这张命令面
 * ================================================================ */

interface SearchFieldHandle {
    focus: () => void;
    selectAll: () => void;
    clear: () => void;
}

interface AnnounceHandle {
    announce: () => string;
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
 * 子组件:内部握 DOM,对外只给三条命令
 * ================================================================ */

interface SearchFieldProps {
    ref?: Ref<SearchFieldHandle>;
    initialValue?: string;
    inputTestId?: string;
}

const SearchField = memo(({ ref, initialValue = '', inputTestId }: SearchFieldProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [value, setValue] = useState(initialValue);

    useImperativeHandle(ref, () => ({
        focus: () => {
            inputRef.current?.focus();
        },
        selectAll: () => {
            const node = inputRef.current;
            if (!node) {return;}
            node.focus();
            node.select();
        },
        clear: () => {
            setValue('');
            inputRef.current?.focus();
        },
    }), []);

    return (
        <Input
            ref={inputRef}
            data-testid={inputTestId}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="内部 state,父组件看不到 value 字段"
            className="max-w-[16rem]"
            aria-label="命令输入框"
        />
    );
});

SearchField.displayName = 'SearchField';

/* =================================================================
 * 命令探针:父组件只调用 handle,不读 input.value
 * ================================================================ */

const CommandProbe = memo(() => {
    const fieldRef = useRef<SearchFieldHandle>(null);

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                <Button type="primary" onClick={() => fieldRef.current?.focus()}>
                    命令:聚焦
                </Button>
                <Button onClick={() => fieldRef.current?.selectAll()}>命令:全选</Button>
                <Button onClick={() => fieldRef.current?.clear()}>命令:清空</Button>
            </div>
            <SearchField ref={fieldRef} initialValue="react hooks" inputTestId="command-input" />
        </div>
    );
});

CommandProbe.displayName = 'CommandProbe';

/* =================================================================
 * 出口探针:裸 DOM 什么都能碰;句柄只有你列出的 key
 * ================================================================ */

const LeakProbe = memo(() => {
    const rawRef = useRef<HTMLInputElement>(null);
    const handleRef = useRef<SearchFieldHandle>(null);
    const [rawPeek, setRawPeek] = useState('还没检查');
    const [handlePeek, setHandlePeek] = useState('还没检查');

    const inspectRaw = () => {
        const node = rawRef.current;
        if (!node) {
            setRawPeek('current 仍是 null');
            return;
        }
        setRawPeek(`value="${node.value}" · type=${node.type} · 还能改 disabled / className`);
    };

    const inspectHandle = () => {
        const handle = handleRef.current;
        if (!handle) {
            setHandlePeek('current 仍是 null');
            return;
        }
        const keys = Object.keys(handle).join(', ');
        setHandlePeek(`keys: ${keys} · value in handle = ${'value' in handle}`);
    };

    return (
        <div className="grid gap-3 sm:grid-cols-2">
            <ProbeCard title="直接把 DOM 交给父组件">
                <Input
                    ref={rawRef}
                    defaultValue="secret"
                    className="max-w-full"
                    aria-label="裸 ref 输入框"
                />
                <Button className="mt-2" size="small" onClick={inspectRaw}>
                    检查裸 ref
                </Button>
                <p
                    data-testid="raw-peek"
                    className="mt-2 font-mono text-xs leading-relaxed text-gray-500 dark:text-slate-400"
                >
                    {rawPeek}
                </p>
            </ProbeCard>
            <ProbeCard title="useImperativeHandle 定制出口">
                <SearchField ref={handleRef} initialValue="secret" />
                <Button className="mt-2" size="small" type="primary" onClick={inspectHandle}>
                    检查命令句柄
                </Button>
                <p
                    data-testid="handle-peek"
                    className="mt-2 font-mono text-xs leading-relaxed text-gray-500 dark:text-slate-400"
                >
                    {handlePeek}
                </p>
            </ProbeCard>
        </div>
    );
});

LeakProbe.displayName = 'LeakProbe';

/* =================================================================
 * 依赖探针:[] 会把 createHandle 闭包钉在首次渲染
 * ================================================================ */

interface AnnouncerProps {
    ref?: Ref<AnnounceHandle>;
    label: string;
}

const StaleAnnouncer = memo(({ ref, label }: AnnouncerProps) => {
    useImperativeHandle(ref, () => ({
        announce: () => `当前标签是 ${label}`,
        // eslint-disable-next-line react-hooks/exhaustive-deps -- 演示过期句柄
    }), []);

    return (
        <p className="font-mono text-xs text-gray-500 dark:text-slate-400">
            过期子组件 props.label = {label}
        </p>
    );
});

StaleAnnouncer.displayName = 'StaleAnnouncer';

const FreshAnnouncer = memo(({ ref, label }: AnnouncerProps) => {
    useImperativeHandle(ref, () => ({
        announce: () => `当前标签是 ${label}`,
    }), [label]);

    return (
        <p className="font-mono text-xs text-gray-500 dark:text-slate-400">
            最新子组件 props.label = {label}
        </p>
    );
});

FreshAnnouncer.displayName = 'FreshAnnouncer';

const DepsProbe = memo(() => {
    const [label, setLabel] = useState('alpha');
    const staleRef = useRef<AnnounceHandle>(null);
    const freshRef = useRef<AnnounceHandle>(null);
    const [staleText, setStaleText] = useState('还没读');
    const [freshText, setFreshText] = useState('还没读');

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                <Button onClick={() => setLabel((current) => (current === 'alpha' ? 'beta' : 'alpha'))}>
                    切换标签
                </Button>
                <span className="font-mono text-sm text-gray-600 dark:text-slate-300">
                    父组件 label = {label}
                </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
                <ProbeCard title="useImperativeHandle(..., [])">
                    <StaleAnnouncer ref={staleRef} label={label} />
                    <Button
                        className="mt-2"
                        size="small"
                        onClick={() => setStaleText(staleRef.current?.announce() ?? 'current 是 null')}
                    >
                        过期句柄:读出口令
                    </Button>
                    <p
                        data-testid="stale-announce"
                        className="mt-2 font-mono text-xs text-rose-500"
                    >
                        {staleText}
                    </p>
                </ProbeCard>
                <ProbeCard title="useImperativeHandle(..., [label])">
                    <FreshAnnouncer ref={freshRef} label={label} />
                    <Button
                        className="mt-2"
                        size="small"
                        type="primary"
                        onClick={() => setFreshText(freshRef.current?.announce() ?? 'current 是 null')}
                    >
                        最新句柄:读出口令
                    </Button>
                    <p
                        data-testid="fresh-announce"
                        className="mt-2 font-mono text-xs text-emerald-600"
                    >
                        {freshText}
                    </p>
                </ProbeCard>
            </div>
        </div>
    );
});

DepsProbe.displayName = 'DepsProbe';

/* =================================================================
 * 专题页
 * ================================================================ */

const UseImperativeHandleTopic = () => {
    return (
        <TopicPage
            title="useImperativeHandle"
            description="改写父组件经 ref 拿到的 current:只交出你列出的命令,而不是整棵 DOM 或内部 state"
        >
            <TopicSection
                title="它填的是别人的盒子"
                note="useRef 是「自己握一个盒子」;useImperativeHandle 是「把命令对象写进父组件传来的那个盒子」。盒子身份仍稳定,变的是 current 指向什么。"
            >
                <FlowList steps={IMPERATIVE_HANDLE_STEPS} />
            </TopicSection>

            <TopicSection
                title="和直接把 DOM 交给父组件的差别"
                note="默认 <input ref={parentRef} /> 会在 commit 后让 parentRef.current 变成 HTMLInputElement。父组件从此能改 type、读 value、卸节点。useImperativeHandle 把这层换成你签名过的 API。"
            >
                <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <dt className="font-medium text-sky-600">useRef 握自己的盒子</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                            定时器 ID、上一拍、最新回调,都留在本组件。详见{' '}
                            <Link
                                className="text-primary-600 underline-offset-2 hover:underline"
                                to="/hooks/use-ref"
                            >
                                useRef 专题
                            </Link>
                            。父组件若要发命令,才需要把盒子传下去。
                        </dd>
                    </div>
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <dt className="font-medium text-emerald-600">useImperativeHandle 定制出口</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                            子组件内部照样 useRef 握节点;对外只暴露 focus / clear / scrollTo。React 19 里写成{' '}
                            <span className="font-mono">{'function Field({ ref })'}</span>,不必 forwardRef。
                        </dd>
                    </div>
                </dl>
            </TopicSection>

            <TopicSection
                title="适用场景:让父组件在事件里发命令"
                note="点「命令:清空」应清掉默认的 react hooks 并聚焦;「命令:聚焦」只移动光标,不改文字。「命令:全选」会选中当前内容。这些都不必把 value 提升到父组件。"
            >
                <CommandProbe />
            </TopicSection>

            <TopicSection
                title="出口变窄之后,父组件碰不到 value"
                note="两边默认值都是 secret。检查裸 ref 能读到 value 和 type;检查命令句柄只能看到 focus / selectAll / clear,value in handle = false。"
            >
                <LeakProbe />
            </TopicSection>

            <TopicSection
                title="createHandle 也会过期,deps 决定何时换新对象"
                note="先读两句口令都是 alpha。再点「切换标签」,子组件的 props.label 都会变成 beta,但空依赖那格再读仍是 alpha。和 useCallback 一样:[] 稳定身份,也稳定过期。"
            >
                <DepsProbe />
            </TopicSection>

            <TopicSection
                title="适用场景一览"
                note="问自己:父组件是要在某个时刻发一条命令,还是要长期同步一份数据?命令用句柄,数据用 props。"
            >
                <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <dt className="font-medium text-gray-700 dark:text-slate-200">焦点与选区</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                            提交失败后 focus 第一个非法输入、搜索框的「清空并聚焦」、设计器里选中画布上的节点。时机在事件里,不在 render 里。
                        </dd>
                    </div>
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <dt className="font-medium text-gray-700 dark:text-slate-200">媒体与滚动</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                            video.play / pause、地图 flyTo、虚拟列表 scrollToIndex。这些是宿主实例上的命令,不值得为了一次调用把整个节点交出去。
                        </dd>
                    </div>
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <dt className="font-medium text-gray-700 dark:text-slate-200">第三方 widget</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                            图表 resize、编辑器 insertText、地图销毁。把第三方实例藏在子组件,句柄只转发你允许的那几个方法。
                        </dd>
                    </div>
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <dt className="font-medium text-gray-700 dark:text-slate-200">配合内部 useRef</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                            句柄方法里再去读 inputRef.current。父组件永远看不到节点;卸载时子组件自己的 effect 仍负责 cleanup。
                        </dd>
                    </div>
                </dl>
            </TopicSection>

            <TopicSection
                title="不要用 useImperativeHandle 做的事"
                note="能用 props 表达的,就不要开一条命令通道。命令是逃生舱,不是默认数据流。"
            >
                <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <dt className="font-medium text-gray-700 dark:text-slate-200">把内部 state 掏给父组件</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                            getValue() / getOpen() 让数据流向反了。要读当前值,把 state 提升,或让子组件通过 onChange 往上报。
                        </dd>
                    </div>
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <dt className="font-medium text-gray-700 dark:text-slate-200">用 open() 代替 open prop</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                            对话框、抽屉、下拉的开关是 UI 状态,父组件用{' '}
                            <span className="font-mono">open</span> /{' '}
                            <span className="font-mono">onOpenChange</span>
                            {' '}就能渲染一致。句柄适合「已经打开之后,滚到某一项」。
                        </dd>
                    </div>
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <dt className="font-medium text-gray-700 dark:text-slate-200">在 render 里调用句柄</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                            current 在 commit 之后才写好,第一次 render 仍是 null。调用放在事件或{' '}
                            <Link
                                className="text-primary-600 underline-offset-2 hover:underline"
                                to="/hooks/use-layout-effect"
                            >
                                useLayoutEffect
                            </Link>
                            {' '}里。
                        </dd>
                    </div>
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <dt className="font-medium text-gray-700 dark:text-slate-200">为了 [] 去读过期闭包</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                            上面探针已经说明:子组件重渲染不等于句柄换新。方法里要用最新 props,就把它们写进 deps,或在方法里读另一只 ref。
                        </dd>
                    </div>
                </dl>
            </TopicSection>
        </TopicPage>
    );
};

export default UseImperativeHandleTopic;
