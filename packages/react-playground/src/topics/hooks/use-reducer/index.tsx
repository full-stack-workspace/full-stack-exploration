/**
 * ============================================================================
 * useReducer — Hooks 专题
 * ============================================================================
 *
 * 演示 useReducer 的机制:dispatch 只描述发生了什么,reducer 纯函数算出
 * 下一份 state;多次 dispatch 会批处理且按序折叠;dispatch 引用稳定。
 * 待办列表展示多字段关联更新,并对照何时仍该用 useState。
 *
 * @module topics/hooks/use-reducer
 */

import { memo, useCallback, useReducer, useRef, useState } from 'react';
import type { ChangeEvent, Dispatch, FormEvent } from 'react';
import { Button, Segmented } from 'antd';
import { Link } from 'react-router-dom';

import { FlowList, STATE_VS_REDUCER_STEPS, type FlowStep } from '../../../components/FlowList';
import { Input } from '../../../components/Input';
import { TopicPage, TopicSection } from '../../../components/TopicPage';

type TodoPriority = 'low' | 'medium' | 'high';
type TodoStatus = 'in-progress' | 'completed';

interface Todo {
    // crypto.randomUUID() 返回 string,id 必须与之对齐,否则 reducer 推不出 Todo[]
    id: string;
    text: string;
    status: TodoStatus;
    priority?: TodoPriority;
}

type TodoAction =
    | { type: 'todo_added'; payload: { text: string; priority?: TodoPriority } }
    | { type: 'todo_removed'; payload: { id: string } }
    | { type: 'todo_updated'; payload: { id: string; text: string } }
    | { type: 'todo_toggled'; payload: { id: string } }
    | { type: 'todo_priority_updated'; payload: { id: string; priority: TodoPriority } };

type ProbeAction = { type: 'inc' } | { type: 'reset' };

/** dispatch 描述事件,reducer 在排队后才跑,调用处读不到新 state */
const DISPATCH_STEPS: FlowStep[] = [
    { title: '事件里 dispatch(action)', hint: 'action 说「发生了什么」,不要在这里改原数组', tone: 'state' },
    { title: 'React 调用 reducer(prev, action)', hint: '必须纯:同样输入同样输出,返回新对象/新数组', tone: 'state' },
    { title: '同一事件里多次 dispatch 按序折叠', hint: '每次都吃上一次的返回值,最后只渲染一次', tone: 'commit' },
    { title: '执行组件函数', hint: '读到新的 state 快照;dispatch 函数本身引用不变', tone: 'render' },
];

const PRIORITY_OPTIONS: { label: string; value: TodoPriority }[] = [
    { label: '低', value: 'low' },
    { label: '中', value: 'medium' },
    { label: '高', value: 'high' },
];

const initialTodos: Todo[] = [
    { id: 'seed-read', text: '阅读 useReducer 文档', status: 'in-progress', priority: 'high' },
    { id: 'seed-refactor', text: '把分散的 setState 收进 reducer', status: 'completed', priority: 'low' },
];

/**
 * @param todos 当前列表快照
 * @param action 描述用户做了哪件事
 * @returns 下一份列表;未知 type 直接抛错,避免静默吞掉拼写错误
 */
function todosReducer(todos: Todo[], action: TodoAction): Todo[] {
    switch (action.type) {
        case 'todo_added': {
            return [
                ...todos,
                {
                    id: crypto.randomUUID(),
                    text: action.payload.text,
                    priority: action.payload.priority,
                    status: 'in-progress',
                },
            ];
        }

        case 'todo_removed': {
            return todos.filter((todo) => todo.id !== action.payload.id);
        }

        case 'todo_updated': {
            return todos.map((todo) => (
                todo.id === action.payload.id
                    ? { ...todo, text: action.payload.text }
                    : todo
            ));
        }

        case 'todo_toggled': {
            return todos.map((todo) => (
                todo.id === action.payload.id
                    ? {
                        ...todo,
                        status: todo.status === 'in-progress' ? 'completed' : 'in-progress',
                    }
                    : todo
            ));
        }

        case 'todo_priority_updated': {
            return todos.map((todo) => (
                todo.id === action.payload.id
                    ? { ...todo, priority: action.payload.priority }
                    : todo
            ));
        }

        default: {
            const _exhaustive: never = action;
            throw new Error(`Unsupported action: ${JSON.stringify(_exhaustive)}`);
        }
    }
}

function probeReducer(count: number, action: ProbeAction): number {
    switch (action.type) {
        case 'inc':
            return count + 1;
        case 'reset':
            return 0;
        default: {
            const _exhaustive: never = action;
            throw new Error(`Unsupported action: ${JSON.stringify(_exhaustive)}`);
        }
    }
}

/** 把种子字符串折成数字,用来演示 useReducer 的第三参数 init */
function parseSeedTotal(seed: string): number {
    return seed.split('+').reduce((sum, part) => sum + Number(part.trim()), 0);
}

/* =================================================================
 * 列表行:完成态 / 文案 / 优先级 / 删除都通过回调 dispatch
 * ================================================================ */

interface TodoRowProps {
    todo: Todo;
    onToggle: (id: string) => void;
    onRemove: (id: string) => void;
    onTextChange: (id: string, text: string) => void;
    onPriorityChange: (id: string, priority: TodoPriority) => void;
}

const TodoRow = memo(({ todo, onToggle, onRemove, onTextChange, onPriorityChange }: TodoRowProps) => {
    const completed = todo.status === 'completed';
    const priority = todo.priority ?? 'medium';

    return (
        <li className="flex flex-col gap-3 rounded-card border border-gray-100 bg-gray-50 p-3 sm:flex-row sm:items-center">
            <button
                type="button"
                role="checkbox"
                aria-checked={completed}
                aria-label={completed ? `将「${todo.text}」标记为进行中` : `将「${todo.text}」标记为已完成`}
                onClick={() => onToggle(todo.id)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
            >
                <span
                    className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
                        completed
                            ? 'border-primary-600 bg-primary-600 text-white'
                            : 'border-gray-300 bg-white text-transparent hover:border-primary-400'
                    }`}
                >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </span>
            </button>

            <Input
                aria-label="待办内容"
                value={todo.text}
                onChange={(e) => onTextChange(todo.id, e.target.value)}
                className={completed ? 'line-through text-gray-400' : undefined}
            />

            <Segmented
                size="small"
                value={priority}
                options={PRIORITY_OPTIONS}
                onChange={(value) => onPriorityChange(todo.id, value as TodoPriority)}
            />

            <Button danger onClick={() => onRemove(todo.id)}>删除</Button>
        </li>
    );
});

TodoRow.displayName = 'TodoRow';

/* =================================================================
 * 待办板:草稿仍用 useState,列表更新全部进同一个 reducer
 * ================================================================ */

const TodoBoard = memo(() => {
    const [todoText, setTodoText] = useState('');
    const [draftPriority, setDraftPriority] = useState<TodoPriority>('medium');
    const [todos, dispatch] = useReducer(todosReducer, initialTodos);

    const completedCount = todos.filter((todo) => todo.status === 'completed').length;
    const inProgressCount = todos.length - completedCount;
    const canAdd = todoText.trim().length > 0;

    const handleTodoTextChange = (e: ChangeEvent<HTMLInputElement>) => {
        setTodoText(e.target.value);
    };

    const handleAddTodo = () => {
        const text = todoText.trim();
        if (!text) {
            return;
        }
        dispatch({
            type: 'todo_added',
            payload: {
                text,
                priority: draftPriority,
            },
        });
        setTodoText('');
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleAddTodo();
    };

    const handleToggle = useCallback((id: string) => {
        dispatch({ type: 'todo_toggled', payload: { id } });
    }, []);

    const handleRemove = useCallback((id: string) => {
        dispatch({ type: 'todo_removed', payload: { id } });
    }, []);

    const handleTextChange = useCallback((id: string, text: string) => {
        dispatch({ type: 'todo_updated', payload: { id, text } });
    }, []);

    const handlePriorityChange = useCallback((id: string, priority: TodoPriority) => {
        dispatch({ type: 'todo_priority_updated', payload: { id, priority } });
    }, []);

    return (
        <div className="space-y-4">
            <p className="text-sm text-gray-500">
                当前进行中 {inProgressCount} 条,已完成 {completedCount} 条 · 完成数是 render 里 filter 出来的,没有单独存 state
            </p>
            <form className="flex flex-col gap-3 sm:flex-row sm:items-center" onSubmit={handleSubmit}>
                <label className="sr-only" htmlFor="todo-draft">待办内容</label>
                <Input
                    id="todo-draft"
                    placeholder="输入待办,回车添加"
                    value={todoText}
                    onChange={handleTodoTextChange}
                />
                <Segmented
                    value={draftPriority}
                    options={PRIORITY_OPTIONS}
                    onChange={(value) => setDraftPriority(value as TodoPriority)}
                />
                <Button type="primary" htmlType="submit" disabled={!canAdd}>添加</Button>
            </form>

            {todos.length > 0 ? (
                <ul className="space-y-2">
                    {todos.map((todo) => (
                        <TodoRow
                            key={todo.id}
                            todo={todo}
                            onToggle={handleToggle}
                            onRemove={handleRemove}
                            onTextChange={handleTextChange}
                            onPriorityChange={handlePriorityChange}
                        />
                    ))}
                </ul>
            ) : (
                <p className="rounded-card border border-dashed border-gray-200 py-8 text-center text-sm text-gray-400">
                    还没有待办,在上方输入一条开始演示 reducer
                </p>
            )}

            <pre className="max-h-64 overflow-auto rounded-card bg-gray-50 p-3 text-xs leading-relaxed text-gray-600">
                {JSON.stringify(todos, null, 2)}
            </pre>
        </div>
    );
});

TodoBoard.displayName = 'TodoBoard';

/* =================================================================
 * 同一事件三次 dispatch:reducer 按序 +1,组件函数只再跑一次
 * ================================================================ */

const BatchDispatchProbe = memo(() => {
    const [count, dispatch] = useReducer(probeReducer, 0);
    const renderCountRef = useRef(0);
    renderCountRef.current += 1;

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
                <span className="text-2xl font-bold text-primary-600">{count}</span>
                <Button
                    type="primary"
                    onClick={() => {
                        dispatch({ type: 'inc' });
                        dispatch({ type: 'inc' });
                        dispatch({ type: 'inc' });
                    }}
                >
                    dispatch ×3(+3)
                </Button>
                <Button onClick={() => dispatch({ type: 'reset' })}>清零</Button>
            </div>
            <p className="text-sm text-gray-500">
                组件函数执行次数 {renderCountRef.current} · 三次 inc 会串成 +3,但只排队一次渲染
            </p>
        </div>
    );
});

BatchDispatchProbe.displayName = 'BatchDispatchProbe';

/* =================================================================
 * dispatch 引用稳定:无关状态变化时,只吃 dispatch 的 memo 子组件不重渲染
 * ================================================================ */

const UnstableCallbackChild = memo(({ count, onInc }: { count: number; onInc: () => void }) => {
    const renderCountRef = useRef(0);
    renderCountRef.current += 1;

    return (
        <div className="rounded-card border border-gray-100 bg-gray-50 p-3">
            <p className="text-sm font-medium text-gray-700">每次 render 新建的 onInc</p>
            <p className="mt-1 font-mono text-xs text-gray-500">
                子组件渲染 {renderCountRef.current} 次 · count = {count}
            </p>
            <Button className="mt-2" onClick={onInc}>+1</Button>
        </div>
    );
});

UnstableCallbackChild.displayName = 'UnstableCallbackChild';

const StableDispatchChild = memo(({ dispatch }: { dispatch: Dispatch<ProbeAction> }) => {
    const renderCountRef = useRef(0);
    renderCountRef.current += 1;

    return (
        <div className="rounded-card border border-gray-100 bg-gray-50 p-3">
            <p className="text-sm font-medium text-gray-700">只传入稳定的 dispatch</p>
            <p className="mt-1 font-mono text-xs text-gray-500">
                子组件渲染 {renderCountRef.current} 次 · 看不到父级 count
            </p>
            <Button className="mt-2" onClick={() => dispatch({ type: 'inc' })}>+1</Button>
        </div>
    );
});

StableDispatchChild.displayName = 'StableDispatchChild';

const DispatchIdentityProbe = memo(() => {
    const [count, dispatch] = useReducer(probeReducer, 0);
    const [unrelated, setUnrelated] = useState(0);
    const dispatchRef = useRef(dispatch);
    const sameDispatch = dispatchRef.current === dispatch;

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
                <Button onClick={() => setUnrelated((value) => value + 1)}>无关状态 +1</Button>
                <span className="text-sm text-gray-500">
                    父 count = {count} · 无关 = {unrelated} · dispatch 仍是同一引用:{sameDispatch ? '是' : '否'}
                </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
                <UnstableCallbackChild count={count} onInc={() => dispatch({ type: 'inc' })} />
                <StableDispatchChild dispatch={dispatch} />
            </div>
        </div>
    );
});

DispatchIdentityProbe.displayName = 'DispatchIdentityProbe';

/* =================================================================
 * 第三参数 init:父组件再渲染也不会重跑初始化
 * ================================================================ */

const LazyInitChild = memo(({ tick }: { tick: number }) => {
    const initRunsRef = useRef(0);
    const [total, dispatch] = useReducer(
        probeReducer,
        '10+20+12',
        (seed) => {
            initRunsRef.current += 1;
            return parseSeedTotal(seed);
        },
    );

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
                <span className="text-2xl font-bold text-primary-600">{total}</span>
                <Button type="primary" onClick={() => dispatch({ type: 'inc' })}>+1</Button>
            </div>
            <p className="font-mono text-xs text-gray-500">
                init 累计 {initRunsRef.current} 次 · 种子 10+20+12 · 父 tick = {tick}
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
            <LazyInitChild tick={tick} />
        </div>
    );
});

LazyInitProbe.displayName = 'LazyInitProbe';

/* =================================================================
 * 专题页
 * ================================================================ */

const UseReducerTopic = () => {
    return (
        <TopicPage
            title="useReducer"
            description="dispatch 描述发生了什么,reducer 纯函数算出下一份 state;适合多字段必须一起变的更新"
        >
            <TopicSection
                title="dispatch 不会改当前这次渲染"
                note="记住:调用 dispatch 的地方读不到新 state。React 先按序跑完 reducer,再让组件函数读新快照。"
            >
                <FlowList steps={DISPATCH_STEPS} />
            </TopicSection>

            <TopicSection
                title="与 useState 的完整对比"
                note="触发渲染的时机一样。useState 适合独立的值;下一份状态要看「发生了哪类事件」时,把规则收进 reducer。"
            >
                <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-start">
                    <FlowList steps={STATE_VS_REDUCER_STEPS} />
                    <div className="hidden h-full w-px bg-gray-100 lg:block" />
                    <dl className="space-y-3 text-sm text-gray-600">
                        <div>
                            <dt className="font-medium text-emerald-600">useState</dt>
                            <dd className="mt-1 text-xs leading-relaxed text-gray-400">
                                开关、计数、输入草稿。字段彼此独立,下一份值很好写。详见{' '}
                                <Link className="text-primary-600 underline-offset-2 hover:underline" to="/topics/hooks/use-state">
                                    useState 专题
                                </Link>
                                。
                            </dd>
                        </div>
                        <div>
                            <dt className="font-medium text-sky-600">useReducer(这页的主角)</dt>
                            <dd className="mt-1 text-xs leading-relaxed text-gray-400">
                                多字段关联、状态转换规则复杂、想单独测试更新逻辑、要把稳定的 dispatch 传给 memo 子组件。
                            </dd>
                        </div>
                    </dl>
                </div>
            </TopicSection>

            <TopicSection
                title="同一事件里多次 dispatch 会按序折叠"
                note="和 useState 的函数式更新一样,批处理里每一次都会吃到上一次 reducer 的返回值,所以 ×3 是真的 +3;组件函数仍只再执行一次。"
            >
                <BatchDispatchProbe />
            </TopicSection>

            <TopicSection
                title="适用场景:一个 reducer 管待办的所有更新"
                note="输入框草稿仍用 useState,因为它和列表没有共享转换规则。增删改、完成态、优先级全部 dispatch;下方 JSON 是 reducer 返回的那份数组。"
            >
                <TodoBoard />
            </TopicSection>

            <TopicSection
                title="适用场景:dispatch 引用稳定,少让子组件白跑"
                note="点「无关状态 +1」:左边每次都拿到新的 onInc,memo 失效;右边只吃 dispatch,渲染次数不应增加。dispatch 永远是同一函数。"
            >
                <DispatchIdentityProbe />
            </TopicSection>

            <TopicSection
                title="适用场景:第三参数 init,昂贵初始只跑一次"
                note="useReducer(reducer, seed, init) 的 init(seed) 只在挂载时执行。点无关 +1 后,次数应停在挂载时(Strict Mode 下可能是 2),total 从 42 起算。"
            >
                <LazyInitProbe />
            </TopicSection>

            <TopicSection
                title="不要用 useReducer 做的事"
                note="reducer 必须纯。独立草稿、能在 render 里算出来的值,都不必塞进这份 state。"
            >
                <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3">
                        <dt className="font-medium text-gray-700">独立的简单值</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400">
                            输入框草稿、弹层开关、和列表无关的 tab。继续 useState,硬收进 reducer 只会把 action 撑胖。
                        </dd>
                    </div>
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3">
                        <dt className="font-medium text-gray-700">副作用</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400">
                            请求、打点、改 document.title 不要写在 reducer 里。reducer 只返回下一份数据,副作用放事件处理函数或 effect。
                        </dd>
                    </div>
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3">
                        <dt className="font-medium text-gray-700">原地修改 prev</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400">
                            todos.push(...) 再 return todos,引用没变,React 会跳过渲染,还会把当前快照改脏。必须展开出新数组。
                        </dd>
                    </div>
                    <div className="rounded-card border border-gray-100 bg-gray-50 p-3">
                        <dt className="font-medium text-gray-700">派生数据</dt>
                        <dd className="mt-1 text-xs leading-relaxed text-gray-400">
                            已完成条数、过滤结果在 render 里算。不要为它们单独 dispatch,否则源列表一变就会不同步。
                        </dd>
                    </div>
                </dl>
            </TopicSection>
        </TopicPage>
    );
};

export default UseReducerTopic;
