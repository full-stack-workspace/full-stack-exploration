/**
 * ============================================================================
 * FlowList — 专题页时机流程图
 * ============================================================================
 *
 * Hooks 专题里用来展示「Render → Commit → Paint → Effect」这类步骤链。
 * 步骤数据由各专题传入,配色按阶段(render / commit / layout / paint / effect / state)区分。
 *
 * @module components/FlowList
 */

import { memo } from 'react';

export type FlowTone = 'render' | 'commit' | 'layout' | 'paint' | 'effect' | 'state';

export interface FlowStep {
    title: string;
    hint?: string;
    tone?: FlowTone;
}

const TONE_DOT: Record<FlowTone, string> = {
    render: 'bg-gray-600',
    commit: 'bg-slate-500',
    layout: 'bg-amber-500',
    paint: 'bg-primary-600',
    effect: 'bg-sky-500',
    state: 'bg-emerald-600',
};

/** 依赖变化时的更新链路:cleanup 永远先于同一次的新 setup;useEffect 这对发生在 Paint 之后 */
export const EFFECT_UPDATE_STEPS: FlowStep[] = [
    { title: '执行组件函数', hint: '读到新的 props / state 快照;组件并没有卸载', tone: 'render' },
    { title: 'Commit:更新 DOM', hint: '屏幕上的 DOM 已经是新的,但上一轮的订阅、定时器还在', tone: 'commit' },
    { title: '浏览器绘制', hint: '用户先看到新 UI;此时上一次 useEffect 的 cleanup 还没跑', tone: 'paint' },
    { title: '跑上一次 return 的函数', hint: 'cleanup:闭包仍是上一轮的值,用来退订、clearTimeout、断开连接', tone: 'effect' },
    { title: '跑这一次的 setup', hint: '用新快照重新订阅。顺序永远是先收尾再开始,不会两条副作用并行', tone: 'effect' },
];

/** 依赖变化时 layout 的 cleanup / setup 都在 Paint 之前,用户看不见中间帧 */
export const LAYOUT_UPDATE_STEPS: FlowStep[] = [
    { title: '执行组件函数', hint: '读到新的 props / state 快照;组件并没有卸载', tone: 'render' },
    { title: 'Commit:更新 DOM', hint: 'DOM 已是新的,像素还没画', tone: 'commit' },
    { title: '跑上一次 useLayoutEffect 的 cleanup', hint: '闭包仍是上一轮;在用户看见之前先拆掉旧的布局校正', tone: 'layout' },
    { title: '跑这一次 useLayoutEffect 的 setup', hint: '测量 / 校正新 DOM;若这里 setState,会同步再渲染,仍不露出中间帧', tone: 'layout' },
    { title: '浏览器绘制', hint: '用户这时才看到。cleanup 已经跑过了,这是和 useEffect 的差别', tone: 'paint' },
];

/** useEffect 与 useLayoutEffect 共用的对照链,两边专题保持同一套说法 */
export const EFFECT_VS_LAYOUT_STEPS: FlowStep[] = [
    { title: 'Render 阶段', tone: 'render' },
    { title: '计算 JSX', hint: '执行组件函数,得到新的虚拟 UI', tone: 'render' },
    { title: 'Commit 阶段:更新 DOM', tone: 'commit' },
    { title: 'useLayoutEffect', hint: '阻塞浏览器绘制', tone: 'layout' },
    { title: '浏览器 Paint', tone: 'paint' },
    { title: 'useEffect(通常)', hint: '绘制之后再跑,不挡住首屏', tone: 'effect' },
];

/** useCallback 稳定的是函数引用,比较的是 deps,不是函数体是否「看起来一样」 */
export const CALLBACK_IDENTITY_STEPS: FlowStep[] = [
    { title: '执行组件函数', hint: '每次渲染都会写出一个新的函数表达式', tone: 'render' },
    { title: 'useCallback 用 Object.is 比对 deps', hint: '逐项比较依赖,和 useEffect / useMemo 同一套规则', tone: 'commit' },
    { title: 'deps 没变:返回上一次的函数引用', hint: '外面拿到的仍是同一个函数,memo 和 effect 认得出', tone: 'state' },
    { title: 'deps 变了:换一份新函数', hint: '身份一换,memo 子组件会重渲染,把它放进 effect 依赖也会重跑', tone: 'effect' },
];

/** memo:在「要不要跑子组件函数」这一层做浅比较 */
export const MEMO_BAILOUT_STEPS: FlowStep[] = [
    { title: '父组件执行函数', hint: '无关 state 一变,父组件本身必跑;memo 管的是它的子组件要不要跟着跑', tone: 'render' },
    { title: '为子组件准备新的 props', hint: 'JSX 里的 { name }、() => {}、style={{ }} 每次都是新引用,即使字段看起来一样', tone: 'render' },
    { title: 'memo 对每个 prop 做 Object.is', hint: '默认浅比较:只比引用,不深入对象字段。Context 变化不走这条比较,照样重渲染', tone: 'commit' },
    { title: '全相同:跳过子组件函数', hint: '子组件内部的 hook、派生计算都不会再跑。这是 memo 唯一的收益', tone: 'state' },
    { title: '任一项不同:执行子组件函数', hint: '一个内联对象就能让前面的比较全废。所以 memo 几乎总要搭配 useMemo / useCallback', tone: 'effect' },
];

/** useMemo:在「这次 render 里要不要重算」这一层复用上次的值 */
export const USEMEMO_CACHE_STEPS: FlowStep[] = [
    { title: '执行组件函数,跑到 useMemo', hint: 'factory 默认不会先跑;先问 deps 变了没有', tone: 'render' },
    { title: '用 Object.is 逐项比对 deps', hint: '和 useEffect / useCallback 同一套规则,数组长度也必须固定', tone: 'commit' },
    { title: 'deps 没变:交回上一次的计算结果', hint: '同一份引用。对象/数组只有这样,下游的 memo 才认得出「没变」', tone: 'state' },
    { title: 'deps 变了:再跑 factory,换一份新值', hint: '新引用会让 memo 子组件重渲染,也会让把它放进依赖的 effect 重跑', tone: 'effect' },
];

/** useRef 的盒子:身份稳定,改 current 不排队渲染 */
export const REF_BOX_STEPS: FlowStep[] = [
    { title: '首次渲染:创建一个盒子', hint: 'useRef(initial) 返回 { current: initial },这个对象身份永远不变', tone: 'render' },
    { title: '之后每次组件函数都拿到同一份引用', hint: '和 setState 返回的 setter 一样稳定;比较的是盒子,不是 current 里的值', tone: 'state' },
    { title: '改 ref.current', hint: '事件、effect,或把 current 对齐到这次快照时,只是改字段,不是 setState', tone: 'commit' },
    { title: '不排队下一次渲染', hint: '屏幕不会因为 current 变了而更新;要画出来,必须另有一份 state 触发 render', tone: 'paint' },
];

/** useRef 与 useState:都能跨渲染活下来,只有 state 会让组件函数再跑 */
export const REF_VS_STATE_STEPS: FlowStep[] = [
    { title: '事件处理函数', hint: '点击瞬间,state 仍是这次 render 的快照;ref.current 已经是盒子里的最新值', tone: 'render' },
    { title: 'setState 排队渲染 / 赋值 ref.current 不排队', hint: '两者都能跨渲染活下来,但只有 state 会让组件函数再跑', tone: 'state' },
    { title: '下一次组件函数', hint: 'state 是新快照;ref 仍是同一个盒子,current 可能已在事件里被改过', tone: 'render' },
];

/** 父组件的空盒子,由子组件在 commit 时填进精简命令面 */
export const IMPERATIVE_HANDLE_STEPS: FlowStep[] = [
    { title: '父组件先准备一个空盒子', hint: 'useRef<Handle>(null),此时 current 还是 null,和握 DOM 用的是同一个 hook', tone: 'render' },
    { title: '把盒子作为 ref 传给子组件', hint: 'React 19 里 ref 是普通 prop,不必再包 forwardRef', tone: 'commit' },
    { title: '子组件内部仍用 useRef 握真实节点', hint: 'DOM / 定时器这些实现细节留在子树里,不交给父组件', tone: 'state' },
    { title: 'useImperativeHandle 在 commit 时写入命令对象', hint: 'createHandle() 的返回值成为父盒子的 current;deps 决定这份对象何时换新', tone: 'commit' },
    { title: '父组件只在事件里调用命令', hint: 'focus / clear / scrollTo。这是命令,不是数据流;屏幕上的值仍由子组件自己的 state 画', tone: 'paint' },
];

/** useState 与 useReducer 共用的对照链:差别在「怎么算出下一份 state」,不在渲染时机 */
export const STATE_VS_REDUCER_STEPS: FlowStep[] = [
    { title: '事件处理函数', hint: '点击、输入、提交;当前这次 render 的变量还是旧快照', tone: 'render' },
    { title: 'setState 或 dispatch', hint: '只是把更新排进队列,调用处读不到新值', tone: 'state' },
    { title: '算出下一份 state', hint: 'useState:新值或 updater(prev);useReducer:reducer(prev, action)', tone: 'state' },
    { title: 'Object.is 相同则跳过', hint: '引用没变就不会重渲染', tone: 'commit' },
    { title: '执行组件函数', hint: '读到新的 state 快照,再提交 DOM', tone: 'render' },
];

interface FlowListProps {
    steps: FlowStep[];
}

export const FlowList = memo(({ steps }: FlowListProps) => {
    return (
        <ol>
            {steps.map((step, index) => {
                const isLast = index === steps.length - 1;
                const dot = TONE_DOT[step.tone ?? 'commit'];
                return (
                    <li key={step.title} className="flex gap-3">
                        <div className="flex w-7 shrink-0 flex-col items-center">
                            <span
                                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white ${dot}`}
                            >
                                {index + 1}
                            </span>
                            {isLast ? null : <span className="my-1 min-h-[16px] w-px flex-1 bg-gray-200 dark:bg-slate-700" />}
                        </div>
                        <div className={isLast ? 'pb-0' : 'pb-4'}>
                            <p className="text-sm font-medium text-gray-800 dark:text-slate-100">{step.title}</p>
                            {step.hint ? (
                                <p className="mt-0.5 text-xs leading-relaxed text-gray-400 dark:text-slate-500">{step.hint}</p>
                            ) : null}
                        </div>
                    </li>
                );
            })}
        </ol>
    );
});

FlowList.displayName = 'FlowList';
