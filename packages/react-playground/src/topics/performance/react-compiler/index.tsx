/**
 * ============================================================================
 * React Compiler(/performance/react-compiler)
 * ============================================================================
 *
 * 站内 use-memo / use-callback / hooks-impl 三处都提到「本包没有开 Compiler」,
 * 本专题补齐判断本身:Compiler 是什么、手写 memo 何时变噪音(渲染计数对照实验)、
 * Rules of React 为什么是前提、"use no memo" 逃逸舱、开/不开的四步判断框架,
 * 以及本练习场暂不开的理由。
 *
 * 本页不实际开启 Compiler:构建链是 Rsbuild + Babel,开启需挂
 * babel-plugin-react-compiler,属于工程决策而非演示内容,页面里只讲清楚。
 *
 * @module topics/performance/react-compiler
 */

import { memo } from 'react';

import { TopicPage, TopicSection } from '../../../components/TopicPage';
import { CodeBlock } from '../../../components/CodeBlock';
import { Diagram } from '../../../components/Diagram';
import { AmberTopics } from '../components/AmberTopics';
import { P, Stack } from '../components/Prose';
import { SeriesNav } from '../components/SeriesNav';
import { MemoNoiseDemo } from './components/MemoNoiseDemo';

const ReactCompilerTopic = memo(() => {
    return (
        <TopicPage
            title="React Compiler"
            description="自动记忆化的定位、手写 memo 的噪音对照实验、Rules of React 前提、开/不开的四步判断框架 —— 以及本练习场为什么暂不开"
        >
            <SeriesNav current="react-compiler" />

            {/* Section 1:定位 —— 记忆化从手写声明变成编译产物 */}
            <TopicSection
                title="1. Compiler 是什么:记忆化从手写声明变成编译产物"
                note="讲解要点:React Compiler(1.0 已稳定,载体是 babel-plugin-react-compiler)在构建期静态分析每个组件 / Hook 的依赖图,自动注入细粒度缓存 —— 你手写的 memo / useMemo / useCallback,它按真实依赖替你做完。产物行为不变,无关渲染被挡掉;它证明不了安全的代码就原样跳过,而不是编错。"
            >
                <Stack>
                    <P>
                        手写时代,记忆化是三条各自为战的命令:memo 在「要不要跑子组件函数」这一层浅比较,
                        useMemo 在「要不要重算这个值」这一层比对依赖,useCallback 负责函数引用身份。
                        写对的成本高(身份链一处断裂全废),写错的成本更高(自以为优化了)。
                        Compiler 把这三件事合并成一个编译期动作:读懂依赖图,在依赖没变时复用上一次的值与
                        JSX。
                    </P>
                    <Diagram caption="Compiler 在构建链中的位置">
                        {`源代码(组件 / Hook,无手写缓存)
        │
        ▼  构建期:babel-plugin-react-compiler
   静态分析依赖图(谁依赖谁、哪里可能可变)
        │
        ├── 符合 Rules of React → 注入细粒度缓存(等价 memo / useMemo / useCallback)
        │
        └── 违反规则或标了 "use no memo" → 原样输出,跳过编译(不报错)
        │
        ▼
产物:行为不变,无关渲染被自动挡掉;运行时多一份缓存数组`}
                    </Diagram>
                    <CodeBlock
                        title="源码 vs 编译产物(示意)"
                        code={`// 源码:没有任何手写缓存
function CartSummary({ items }) {
    const total = items.reduce((sum, it) => sum + it.price, 0);
    return <p>合计 ¥{total}</p>;
}

// 编译产物(示意):Compiler 注入缓存槽,按依赖精准复用
function CartSummary({ items }) {
    const $ = useMemoCache(2);      // 缓存数组,挂在 fiber 上
    let total;
    if ($[0] !== items) {           // 依赖 items 变了才重算
        total = items.reduce((sum, it) => sum + it.price, 0);
        $[0] = items;
        $[1] = total;
    } else {
        total = $[1];               // 否则复用上次的值(下游 JSX 同理)
    }
    return <p>合计 ¥{total}</p>;
}`}
                    />
                </Stack>
            </TopicSection>

            {/* Section 2:对照实验 —— 手写 memo 何时变噪音 */}
            <TopicSection
                title="2. 对照实验:手写 memo 何时变噪音"
                note="玩法:先停在「正确手写 memo」,连点「改无关状态」—— 父组件计数涨、面板不涨,这正是 Compiler 自动给你的效果;再切「写错的 memo」,同样包着 memo,面板却每次都跟着渲染 —— 一个内联对象就击穿浅比较。开了 Compiler 之后,「正确手写」一列成为默认行为,手写部分退化为需要维护的噪音;「写错」一列根本不会发生。切换形态会重建子树,计数从 1 重来。"
            >
                <Stack>
                    <MemoNoiseDemo />
                    <CodeBlock
                        title="三种形态的代码差异"
                        code={`// ❌ 不做记忆化:父组件一渲染,面板无条件重跑
<PricePanel options={{ showTax: true }} onReset={() => setQuantity(0)} />

// ✅ 正确手写:身份稳定,memo 才能挡住无关渲染
const options = useMemo(() => ({ showTax: true }), []);
const onReset = useCallback(() => setQuantity(0), []);
<PricePanelMemo options={options} onReset={onReset} />
// → 开了 Compiler,这两行缓存声明就是编译产物默认做的事,手写即噪音

// ❌ 写错的 memo:memo 包着,props 身份却每轮都换
<PricePanelMemo options={{ showTax: true }} onReset={() => setQuantity(0)} />
// → 浅比较永远失败:优化零收益,还白付一次比较`}
                    />
                </Stack>
            </TopicSection>

            {/* Section 3:规则与约束 */}
            <TopicSection
                title="3. 规则与约束:Rules of React 是 Compiler 的前提"
                note="讲解要点:Compiler 的静态分析建立在「组件是纯函数」这个假设上。违反规则的代码不会被报错,而是被静默跳过编译(bail out)—— 所以接入时先看诊断,再谈收益。"
            >
                <Stack>
                    <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-600 dark:text-slate-300">
                        <li>
                            组件与 Hook 必须是纯函数:渲染期不改 props / state、不读写
                            ref.current、不发请求。Compiler 要靠「同样的输入 → 同样的输出」才敢缓存。
                        </li>
                        <li>
                            依赖必须声明完整:Compiler 按你声明(和它推断)的依赖图缓存;隐藏的数据通道
                            (模块级可变变量、渲染期突变)会让缓存拿到过期值。
                        </li>
                        <li>Hooks 只在顶层调用:调用顺序可预测,缓存槽的位置才稳定。</li>
                        <li>
                            做不到的组件被「跳过编译」而非报错 —— 违规是静默失去优化。eslint-plugin-react-hooks
                            自 Compiler 1.0 起内置了 Compiler 诊断规则,写码期就标出这些位置。
                        </li>
                        <li>
                            逃逸舱:文件或组件顶部写「use no memo」指令,整块退出编译
                            —— 用于调试,或与编译器暂时不兼容的旧代码。
                        </li>
                    </ul>
                    <CodeBlock
                        title="逃逸舱与静默跳过"
                        code={`// 逃逸舱:文件或组件顶部声明,整块退出编译
"use no memo";

function LegacyTicker({ feed }) {
    // 渲染期读 ref / 改外部变量……Compiler 无法证明安全,跳过编译
    lastSeen.current = feed.id;
    ...
}

// 什么都不写但被跳过编译时:产物里没有缓存槽,行为不变、优化为零
// → 违规是「静默失去优化」,不是编译错误;先看 ESLint 诊断,再谈收益`}
                    />
                </Stack>
            </TopicSection>

            {/* Section 4:开/不开的判断框架 */}
            <TopicSection
                title="4. 开 / 不开:四步判断框架"
                note="讲解要点:Compiler 不是「升级 React 19 顺手打开」的开关,是一次有验收标准的接入工程。四步按顺序走,任何一步不通过都有明确的降级路径。"
            >
                <div className="grid gap-3 sm:grid-cols-2">
                    {[
                        {
                            title: '① 合规度体检',
                            body: '用 eslint-plugin-react-hooks 的 Compiler 诊断跑全仓:违规密度决定接入成本。class 组件天然被跳过;遗留代码里渲染期写 ref、mutate props 越多,可被编译的面越小。',
                        },
                        {
                            title: '② 依赖库兼容',
                            body: '第三方组件违反 Rules 时只会被跳过、不会出错,但那部分收益归零。先盘点核心交互链路用到的 UI / 状态库,确认它们不是违规大户。',
                        },
                        {
                            title: '③ 构建链支持',
                            body: '官方载体是 babel-plugin-react-compiler:本仓的 Rsbuild(@rsbuild/plugin-babel)、Vite(走 Babel 挂点的版本)、Next 都能接;纯 SWC / oxc 链路要看对应版本的支持进度。React 17/18 需另装 react-compiler-runtime。',
                        },
                        {
                            title: '④ 渐进接入与验收',
                            body: '先在新代码 / 低风险目录开启,用渲染计数(本页第 2 节的手法)验证「无关渲染确实消失」,再按目录推广;不要全仓一把梭,收益要度量出来,不是编译通过就算完。',
                        },
                    ].map((item) => (
                        <article
                            key={item.title}
                            className="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-slate-800 dark:bg-slate-950"
                        >
                            <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-100">
                                {item.title}
                            </h3>
                            <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-slate-400">
                                {item.body}
                            </p>
                        </article>
                    ))}
                </div>
            </TopicSection>

            {/* Section 5:本站的态度 */}
            <TopicSection
                title="5. 本站的态度:练习场为什么暂不开"
                note="讲解要点:教学站与生产项目的目标相反 —— 教学要暴露「手动 vs 自动」的差异,生产要把差异抹平。本页就是两者的分界限。"
            >
                <Stack>
                    <P>
                        本包的构建链是 Rsbuild + Babel,挂上 babel-plugin-react-compiler 就能开
                        —— 但刻意不开。useMemo、useCallback、Hooks
                        链表等专题正在手工对照「引用身份」与「依赖声明」,第 2
                        节的实验也靠「没被编译器插手」才成立:一旦开了
                        Compiler,这些对照会被编译产物抹平,读者反而学不到「为什么」。
                    </P>
                    <P>
                        生产项目的建议反过来:新项目(React 19 + 严格 Rules 合规)默认开,把手写 memo
                        留给「语义性引用稳定」—— 比如某个值要进 effect 依赖、或作为跨渲染的身份契约;存量项目按第
                        4 节框架先体检再渐进。还要记住 Compiler
                        是优化器不是兜底:架构分层、请求瀑布、列表规模造成的浪费它不背
                        —— 那部分仍然走性能治理全链路。
                    </P>
                    <AmberTopics
                        items={[
                            {
                                to: '/hooks/use-memo',
                                label: 'useMemo 与 memo',
                                why: '手写记忆化的身份规则:「有人比较才有效」—— 正是 Compiler 自动化的那部分',
                            },
                            {
                                to: '/hooks/use-callback',
                                label: 'useCallback',
                                why: '函数引用何时需要稳定;Compiler 时代它的大部分用法退场',
                            },
                            {
                                to: '/internals/hooks-impl',
                                label: 'Hooks 链表',
                                why: 'Compiler 注入的 useMemoCache 也是链表节点 —— 看完手写缓存,再看编译器把缓存挂在哪',
                            },
                            {
                                to: '/performance/implement-lab',
                                label: '实现六规则',
                                why: '记忆化在六规则里排最后;Compiler 不改变这个优先级',
                            },
                        ]}
                    />
                </Stack>
            </TopicSection>
        </TopicPage>
    );
});

ReactCompilerTopic.displayName = 'ReactCompilerTopic';

export default ReactCompilerTopic;
