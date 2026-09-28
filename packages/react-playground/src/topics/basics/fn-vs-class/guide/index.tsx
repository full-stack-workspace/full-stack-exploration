/**
 * ============================================================================
 * 函数组件与类组件 · 范式梳理(/topics/basics/fn-vs-class-guide)
 * ============================================================================
 *
 * React 新设计把 UI 当成「props + state 的计算结果」,而不是「活在实例上
 * 的可变对象」。本页对照 class 能做的事如何用函数组件 + Hooks 完成,
 * 以及为什么生产环境和并发渲染更该走新范式。
 *
 * @module topics/basics/fn-vs-class/guide
 */

import { memo } from 'react';
import type { ReactNode } from 'react';

import { TopicPage, TopicSection } from '../../../../components/TopicPage';
import { CodeBlock } from '../../../../components/CodeBlock';
import { Diagram } from '../../../../components/Diagram';
import { FlowList, type FlowStep } from '../../../../components/FlowList';
import { NavBanner } from '../components/NavBanner';
import { RelatedTopics } from '../components/RelatedTopics';

const P = ({ children }: { children: ReactNode }) => (
    <p className="text-sm leading-relaxed text-gray-600 dark:text-slate-300">{children}</p>
);

const Stack = ({ children }: { children: ReactNode }) => <div className="space-y-4">{children}</div>;

const MODEL_STEPS: FlowStep[] = [
    {
        title: '一次渲染 = 一次计算',
        hint: '函数组件被调用,读到这一拍的 props / state,返回一份 UI 描述。没有「活着的 this」要维护',
        tone: 'render',
    },
    {
        title: '提交之后屏幕才变',
        hint: '计算可以丢弃、可以重来(并发);副作用不准写在计算里,只准出现在 effect / 事件',
        tone: 'commit',
    },
    {
        title: 'effect 与这一拍对齐',
        hint: '依赖变了:先用旧闭包 cleanup,再用新闭包 setup。不是「组件实例上的 didMount / didUpdate」',
        tone: 'effect',
    },
    {
        title: '逻辑按功能切开,不按生命周期切开',
        hint: '时钟、请求、订阅各自一个 Hook;class 却要把它们拆碎塞进同一个 didMount',
        tone: 'state',
    },
];

const FnVsClassGuide = memo(() => {
    return (
        <TopicPage
            title="函数组件与类组件 · 范式梳理"
            description="UI 是计算结果,不是实例上的可变对象;用 Hooks 覆盖 class 的能力,并说明新范式为什么更适合生产"
        >
            <NavBanner current="guide" />

            <TopicSection
                title="1. 新设计想象:UI = f(props, state)"
                note="讲解要点:class 把组件想成「带着字段和方法的对象」;新范式把组件想成「纯计算」。同一份输入应得到同一份 UI 描述。能画在屏幕上的走数据流,对 DOM / 网络 / 定时器的操作走事件或 effect。"
            >
                <Stack>
                    <Diagram caption="两种心智模型">
                        {`class 模型(实例)
  this.state / this.props 会被就地改写
  生命周期是实例上的「事件」:mount → update → unmount
  延时回调里读 this.xxx,拿到的是「现在」的盒子,不是「当时」的值

函数模型(快照)
  每一次调用都是一次新的计算,闭包锁住这一拍的 props / state
  effect 声明「UI 出现在屏幕上之后,外界该与这一拍对齐」
  延时回调里读 count,拿到的是安排它时那一次渲染的值`}
                    </Diagram>
                    <P>
                        这不是语法糖口味问题。并发渲染会
                        <strong className="font-medium text-gray-800 dark:text-slate-100"> 丢弃已经算过但还没提交的渲染</strong>
                        。写在 render 里的副作用、写在
                        <code className="mx-1 rounded bg-gray-100 px-1 font-mono text-[11px] dark:bg-slate-800">UNSAFE_componentWillReceiveProps</code>
                        里的订阅,都会在「算了但没上屏」时偷偷跑掉。函数组件把计算和同步拆开,才配得上这套调度。
                    </P>
                    <FlowList steps={MODEL_STEPS} />
                </Stack>
            </TopicSection>

            <TopicSection
                title="2. 一张对照表:class 能做的,Hooks 怎么接"
                note="讲解要点:生产迁移不是「把 Component 改成 function」一句话。按能力映射,避免在函数组件里继续模拟 this。"
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-gray-100 text-gray-400 dark:border-slate-800 dark:text-slate-500">
                                <th className="py-2 pr-4 font-medium">class</th>
                                <th className="py-2 pr-4 font-medium">函数组件 + Hooks</th>
                                <th className="py-2 font-medium">注意</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 dark:text-slate-300">
                            <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                <td className="py-2 pr-4 font-mono">constructor / this.state</td>
                                <td className="py-2 pr-4 font-mono">useState(() =&gt; init)</td>
                                <td className="py-2">惰性初始只跑一次,别在函数体里每次 new 重对象</td>
                            </tr>
                            <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                <td className="py-2 pr-4 font-mono">this.setState(patch)</td>
                                <td className="py-2 pr-4 font-mono">setState(next | fn)</td>
                                <td className="py-2">class 默认合并字段;useState 替换整份,对象要展开或拆多个 state</td>
                            </tr>
                            <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                <td className="py-2 pr-4 font-mono">render()</td>
                                <td className="py-2 pr-4">函数体本身</td>
                                <td className="py-2">必须纯:不算账、不订阅、不写 DOM</td>
                            </tr>
                            <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                <td className="py-2 pr-4 font-mono">didMount + didUpdate + willUnmount</td>
                                <td className="py-2 pr-4 font-mono">useEffect(setup, deps)</td>
                                <td className="py-2">相关逻辑放同一个 effect,用 deps 表达「何时重同步」</td>
                            </tr>
                            <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                <td className="py-2 pr-4 font-mono">getDerivedStateFromProps</td>
                                <td className="py-2 pr-4">渲染期派生,或 key 重置</td>
                                <td className="py-2">能算出来的不要存;草稿用 key=id 卸掉旧实例</td>
                            </tr>
                            <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                <td className="py-2 pr-4 font-mono">shouldComponentUpdate / PureComponent</td>
                                <td className="py-2 pr-4 font-mono">memo / useMemo / useCallback</td>
                                <td className="py-2">先保证数据流正确;编译器也会帮函数组件做跳过渲染</td>
                            </tr>
                            <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                <td className="py-2 pr-4 font-mono">createRef / callback ref</td>
                                <td className="py-2 pr-4 font-mono">useRef;React 19 起 ref 是普通 prop</td>
                                <td className="py-2">命令(focus / scroll)走 ref,能画出来的走 state</td>
                            </tr>
                            <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                <td className="py-2 pr-4 font-mono">contextType / Consumer</td>
                                <td className="py-2 pr-4 font-mono">use(Context) / useContext</td>
                                <td className="py-2">React 19 用 use();class 只能订一个 contextType</td>
                            </tr>
                            <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                <td className="py-2 pr-4 font-mono">componentDidCatch</td>
                                <td className="py-2 pr-4">仍用 class 错误边界包函数树</td>
                                <td className="py-2">这是 React 19 仍保留 class 的主因,见错误边界专题</td>
                            </tr>
                            <tr>
                                <td className="py-2 pr-4 font-mono">HOC / render props / 继承</td>
                                <td className="py-2 pr-4">自定义 Hook 组合</td>
                                <td className="py-2">复用逻辑不必改组件树形状,也不用 bind this</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </TopicSection>

            <TopicSection
                title="3. 快照,不是盒子:延时回调里读到什么"
                note="讲解要点:class 的 this.state 是可变盒子,setState 改的是同一只盒子。函数组件每一次渲染都封闭一份 count。setTimeout 3 秒后,class 读到的是「现在」,函数读到的是「点击发生的那一拍」。后者才是并发下可推理的模型。"
            >
                <Stack>
                    <CodeBlock
                        title="同一句「3 秒后读 count」"
                        code={`// class:读的是盒子里此刻的值
handleLater() {
    setTimeout(() => alert(this.state.count), 3000);
}

// 函数:读的是安排定时器那一次渲染的 count
function handleLater() {
    setTimeout(() => alert(count), 3000);
}

// 若函数也要「总是最新」,显式用 ref 或函数式 setState,
// 而不是靠一个隐式可变的 this`}
                    />
                    <P>
                        「过期闭包」常被当成 Hooks 的坑。它其实是模型的诚实之处:你读到的就是那一次计算用过的值。class
                        看起来总是最新,是因为盒子被偷偷改写,事件顺序一乱就无法对照「当时屏幕上是什么」。演练页第 1
                        节可以亲手点。
                    </P>
                    <RelatedTopics
                        items={[
                            {
                                to: '/topics/hooks/use-state',
                                label: 'useState',
                                why: 'state 是一次渲染的快照;setState 只排队下一次计算',
                            },
                            {
                                to: '/topics/hooks/use-ref',
                                label: 'useRef',
                                why: '真要在回调里读「最新」而不触发渲染,用盒子,但要自己保证同步',
                            },
                        ]}
                    />
                </Stack>
            </TopicSection>

            <TopicSection
                title="4. 生命周期切碎功能;effect 按功能对齐"
                note="讲解要点:class 里「订阅聊天室」被拆到 didMount / didUpdate / willUnmount 三处,漏写 didUpdate 就会订错房间。useEffect 把建立与拆除写在一起,deps 写 roomId,换房间必然先退订再订阅。"
            >
                <Stack>
                    <CodeBlock
                        title="订阅:class 三处 vs 一个 effect"
                        code={`// class:同一功能被撕成三块,还要自己对比 prevProps
componentDidMount() { connect(this.props.roomId); }
componentDidUpdate(prev) {
    if (prev.roomId !== this.props.roomId) {
        disconnect(prev.roomId);
        connect(this.props.roomId);
    }
}
componentWillUnmount() { disconnect(this.props.roomId); }

// 函数:建立和拆除是一对,依赖写清楚
useEffect(() => {
    const session = connect(roomId);
    return () => session.disconnect();
}, [roomId]);`}
                    />
                    <P>
                        生产里 class 最常见的事故不是「不会写 didMount」,而是
                        <strong className="font-medium text-gray-800 dark:text-slate-100">
                            {' '}
                            更新分支漏了、或者把无关的时钟、请求、埋点全塞进同一个 didMount
                        </strong>
                        。函数组件允许(也要求)每个同步关系一个 effect / 一个自定义 Hook。
                    </P>
                    <RelatedTopics
                        items={[
                            {
                                to: '/topics/hooks/use-effect',
                                label: 'useEffect',
                                why: 'Paint 之后 setup;依赖变化时先 cleanup 再 setup,对应 class 三件套',
                            },
                            {
                                to: '/topics/hooks/use-layout-effect',
                                label: 'useLayoutEffect',
                                why: '对应 getSnapshotBeforeUpdate / 读布局再写 DOM,仍是「与这一拍对齐」',
                            },
                        ]}
                    />
                </Stack>
            </TopicSection>

            <TopicSection
                title="5. 能算的不要存:抛弃 getDerivedStateFromProps"
                note="讲解要点:class 常用 gDSFP 把 props 抄进 state,于是出现两份事实。函数组件默认在渲染期派生;若是「换人要丢掉的草稿」,用 key 重置,而不是在 effect 里 setState 追 props。"
            >
                <Stack>
                    <CodeBlock
                        title="派生 vs 抄一份"
                        code={`// ✗ 两份名字,还要用 gDSFP / didUpdate 对齐
static getDerivedStateFromProps(props, state) {
    if (props.user.id !== state.prevId) {
        return { name: props.user.name, prevId: props.user.id };
    }
    return null;
}

// ✓ 能算出来的,渲染时就算
const displayName = user.name.toUpperCase();

// ✓ 草稿属于内部 state,换人用 key 卸掉
<NameDraft key={user.id} initial={user.name} />`}
                    />
                    <P>
                        列表专题的 key 重置、组件通信专题的「详情
                        key=ticket.id」是同一条规则。class 没有更优雅的 API,只是更习惯把 props 再存一遍。
                    </P>
                    <RelatedTopics
                        items={[
                            {
                                to: '/topics/basics/list-key',
                                label: '列表与 key',
                                why: 'key 变了 React 认为是另一个实例,内部 state 自然清空',
                            },
                            {
                                to: '/topics/advanced/component-comm-guide',
                                label: '组件通信 · 决策梳理',
                                why: '一份事实不要抄进第二份 state 再用 effect 追',
                            },
                        ]}
                    />
                </Stack>
            </TopicSection>

            <TopicSection
                title="6. 逻辑复用:别继承,组合 Hook"
                note="讲解要点:class 复用靠继承、Mixin、HOC、render props,都会改组件树或把 this 搅在一起。自定义 Hook 是普通函数,调用它等于把状态和效果搬进当前组件,树的形状不变。"
            >
                <Stack>
                    <CodeBlock
                        title="同一套时钟 + 请求,class 抽不干净"
                        code={`// class:要复用就得 withClock(withQuote(Panel)),props 从哪来的看不清

// 函数:两行,状态仍在这个组件里
const now = useClock(1000);
const { quote, status } = useQuote(selectedId);`}
                    />
                    <P>
                        这也是新范式「更好」的工程原因:评审时能看见
                        <code className="mx-1 rounded bg-gray-100 px-1 font-mono text-[11px] dark:bg-slate-800">useQuote</code>
                        的依赖和 cleanup;测试可以
                        <code className="mx-1 rounded bg-gray-100 px-1 font-mono text-[11px] dark:bg-slate-800">renderHook</code>
                        单独跑,不必挂一整棵 class 树。看板实战页把这组对比做成可运行的两栏。
                    </P>
                    <RelatedTopics
                        items={[
                            {
                                to: '/topics/hooks/custom-hooks-guide',
                                label: '自定义 Hooks 深入梳理',
                                why: 'Hook 复用的是逻辑不是状态;两处调用不会自动同步',
                            },
                            {
                                to: '/topics/hooks/use-reducer',
                                label: 'useReducer',
                                why: '多字段必须一起变时,dispatch 替代 class 里一堆 setState 分支',
                            },
                        ]}
                    />
                </Stack>
            </TopicSection>

            <TopicSection
                title="7. 为什么生产环境更该用新范式"
                note="讲解要点:不是 class 「不能用」,是它与 React 正在加的能力(并发、编译器、use()、Activity)不在同一条设计轴上。"
            >
                <Stack>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-gray-100 text-gray-400 dark:border-slate-800 dark:text-slate-500">
                                    <th className="py-2 pr-4 font-medium">维度</th>
                                    <th className="py-2 pr-4 font-medium">class 的摩擦</th>
                                    <th className="py-2 font-medium">函数 + Hooks</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 dark:text-slate-300">
                                <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                    <td className="py-2 pr-4">并发 / 可中断渲染</td>
                                    <td className="py-2 pr-4">will* 副作用可能跑在未提交的渲染上</td>
                                    <td className="py-2">render 纯计算,effect 只在提交后跑</td>
                                </tr>
                                <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                    <td className="py-2 pr-4">功能内聚</td>
                                    <td className="py-2 pr-4">一个功能拆三个生命周期,didMount 变成垃圾场</td>
                                    <td className="py-2">一个 Hook 管一块同步关系</td>
                                </tr>
                                <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                    <td className="py-2 pr-4">this</td>
                                    <td className="py-2 pr-4">回调忘记 bind,运行时才炸</td>
                                    <td className="py-2">没有 this;事件就写在那一次渲染里</td>
                                </tr>
                                <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                    <td className="py-2 pr-4">TypeScript</td>
                                    <td className="py-2 pr-4">Props / State 泛型 + 方法绑定,样板多</td>
                                    <td className="py-2">参数和 Hook 返回值就是类型</td>
                                </tr>
                                <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                    <td className="py-2 pr-4">React 19 API</td>
                                    <td className="py-2 pr-4">use()、ref 作 prop、Activity 都不面向 class</td>
                                    <td className="py-2">先为函数组件设计</td>
                                </tr>
                                <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                    <td className="py-2 pr-4">编译器 / 自动 memo</td>
                                    <td className="py-2 pr-4">优化模型按函数组件规则来</td>
                                    <td className="py-2">保持纯渲染,编译器才敢跳过</td>
                                </tr>
                                <tr>
                                    <td className="py-2 pr-4">测试</td>
                                    <td className="py-2 pr-4">必须挂实例才能测订阅/时钟</td>
                                    <td className="py-2">renderHook 测自定义 Hook 契约</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <P>
                        迁移策略:新页面默认函数组件;旧 class 先别为了「现代化」整页重写,从抽自定义
                        Hook、把 gDSFP 改成派生、把 didMount 垃圾场拆 effect
                        开始。行为不变再换外壳。错误边界继续用 class 包在函数树外面。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="8. 唯一还该写 class 的地方"
                note="讲解要点:React 19 的 componentDidCatch / getDerivedStateFromError 仍只有 class。这不是推荐你继续用 class 写页面,而是承认「捕获渲染期异常」还在这条旧 API 上。"
            >
                <RelatedTopics
                    items={[
                        {
                            to: '/topics/advanced/error-boundary',
                            label: 'Error Boundary',
                            why: '边界本身是 class;被它包住的叶子应是函数组件。事件和 Promise 拒绝仍要自己处理',
                        },
                    ]}
                />
            </TopicSection>

            <TopicSection
                title="9. 落地清单与本专题三页"
                note="评审时问:这次计算纯不纯?副作用有没有和某一拍的 deps 绑在一起?有没有第二份 state 在抄 props?"
            >
                <Stack>
                    <CodeBlock
                        title="从 class 迁到函数时逐项打勾"
                        code={`□ render / 函数体没有订阅、没有 setState、没有写 DOM
□ this.state.a 与 this.state.b 无关 → 拆成两个 useState
□ 多字段必须一起变 → useReducer,而不是一串 setState
□ didMount 里三件无关的事 → 三个 effect 或三个 Hook
□ gDSFP 只是格式化 props → 删掉,渲染期派生
□ gDSFP 是换人清草稿 → 改成 key={id}
□ bind(this) / 箭头方法 → 事件里直接写,或 useCallback 给 memo 子组件
□ contextType 只能订一个 → 函数里随意 use() 多个 Context
□ 还在用 UNSAFE_will* → 删,逻辑搬进 effect
□ 错误边界 → 留下 class 外壳,不要把业务写进去`}
                    />
                    <P>
                        下一页把快照、卡住的派生 state、订阅三件套做成可点对照。看板页用同一份行情 UI:左边 class
                        把时钟和请求堆在实例上,右边函数组件拆
                        useClock / useQuote —— 行为对齐,可维护性不对齐。
                    </P>
                    <RelatedTopics
                        items={[
                            {
                                to: '/topics/basics/fn-vs-class-playground',
                                label: '对照演练',
                                why: '延时读数、换用户草稿、换房间订阅,左右栏同一操作不同模型',
                            },
                            {
                                to: '/topics/basics/fn-vs-class-practice',
                                label: '看板实战',
                                why: '生产形状:过滤派生、时钟、可取消请求,看 Hook 如何切开 class 的实例字段',
                            },
                        ]}
                    />
                </Stack>
            </TopicSection>
        </TopicPage>
    );
});

FnVsClassGuide.displayName = 'FnVsClassGuide';

export default FnVsClassGuide;
