/**
 * ============================================================================
 * 组件通信 · 决策梳理(/topics/advanced/component-comm-guide)
 * ============================================================================
 *
 * 生产里「组件怎么说话」不是技巧题,是所有权题:数据归谁、传多远、
 * 变得有多勤、是数据还是命令。本页给出决策梯子,具体机制链到已有专题。
 *
 * @module topics/advanced/component-comm/guide
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

const DECISION_STEPS: FlowStep[] = [
    {
        title: '数据归谁?',
        hint: '谁创建、谁改、谁能保证合法。所有者决定通道,而不是「谁离得近谁就存一份」',
        tone: 'state',
    },
    {
        title: '要传多远?',
        hint: '父子一层用 props;中间层根本不关心这份数据 → 组合(children);跨很远且读者很多 → Context / Store',
        tone: 'render',
    },
    {
        title: '变得有多勤?',
        hint: '输入草稿、指针、滚动是高频;主题、当前用户、locale 是低频。高频不要塞进宽 Context',
        tone: 'commit',
    },
    {
        title: '是数据还是命令?',
        hint: '屏幕上的值走数据流(props / state);focus / scroll / play 才是命令,走 ref',
        tone: 'effect',
    },
];

const ComponentCommGuide = memo(() => {
    return (
        <TopicPage
            title="组件通信 · 决策梳理"
            description="先问数据归谁、传多远、变得有多勤、是数据还是命令;再选 props、组合、Context、URL 或外部 Store"
        >
            <NavBanner current="guide" />

            <TopicSection
                title="1. 通信解决的是「一份事实,多处使用」"
                note="讲解要点:组件通信不是把数据复制到每个组件里,而是让一份事实被需要它的地方读到、被有权改它的地方改到。复制两份再用 effect 对齐,是最常见的生产事故。"
            >
                <Stack>
                    <Diagram caption="一份事实,三条合法读法">
                        {`所有者(唯一可以 setState / dispatch 的地方)
        │
        ├─ 近:props 往下传,callback 往上报意图
        ├─ 中间层不关心:children 组合,别从中间人手里钻过去
        └─ 远且稳:Context / 外部 Store / URL(可分享、可回退)

非法第四条:每个组件自己存一份,再用 useEffect 互相同步`}
                    </Diagram>
                    <P>
                        本专题不发明新 API。props、Context、ref、外部 Store、Relay 在仓库里都有专题。这里要练的是
                        <strong className="font-medium text-gray-800 dark:text-slate-100"> 什么时候不该用哪一条</strong>
                        。演练页把通道对照着点;工作台页把它们拆进同一个工单界面。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="2. 四问决策:选通道之前先回答"
                note="讲解要点:生产评审里先问这四句。答不上来就先别上 Context,也别先写 EventBus。"
            >
                <FlowList steps={DECISION_STEPS} />
            </TopicSection>

            <TopicSection
                title="3. 通道梯子:从近到远,默认走最矮的一档"
                note="讲解要点:能用 props 就别上 Context;能用组合避开钻探,就别让中间层当快递员;只有「整棵子树都可能读、变化不勤」才配开通道。梯子是默认顺序,不是禁令。"
            >
                <Stack>
                    <Diagram caption="默认从下往上爬,爬得越高成本越大">
                        {`⑦ 全局事件总线 / window 自定义事件     ← 几乎不该出现在 React 树里
⑥ 外部 Store(useSyncExternalStore)     ← 树外事实、高频、多订阅
⑤ URL / searchParams                     ← 要分享、要回退、要深链
④ Context                                 ← 远、稳、读者多(主题 / 会话)
③ 组合 children / 插槽                    ← 中间层不关心这份数据
② 提升 state 到最近公共父级               ← 兄弟各要一份
① props 往下 + callback 往上              ← 默认,永远先试这个`}
                    </Diagram>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-gray-100 text-gray-400 dark:border-slate-800 dark:text-slate-500">
                                    <th className="py-2 pr-4 font-medium">场景</th>
                                    <th className="py-2 pr-4 font-medium">选</th>
                                    <th className="py-2 font-medium">别选</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 dark:text-slate-300">
                                <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                    <td className="py-2 pr-4">表单草稿、开关、当前选中项(兄弟要用)</td>
                                    <td className="py-2 pr-4">提升到页面 / 最近父级</td>
                                    <td className="py-2">Context、模块单例</td>
                                </tr>
                                <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                    <td className="py-2 pr-4">Layout 只包一层壳,不读业务数据</td>
                                    <td className="py-2 pr-4">children 组合</td>
                                    <td className="py-2">把 ticket 从 Layout 再钻给 Content</td>
                                </tr>
                                <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                    <td className="py-2 pr-4">主题、当前用户、locale</td>
                                    <td className="py-2 pr-4">窄 Context(state / actions 拆开)</td>
                                    <td className="py-2">一个巨大的 AppContext</td>
                                </tr>
                                <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                    <td className="py-2 pr-4">列表筛选要能分享、能回退</td>
                                    <td className="py-2 pr-4">URL searchParams</td>
                                    <td className="py-2">只放在内存 state(刷新即丢)</td>
                                </tr>
                                <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                    <td className="py-2 pr-4">SSE / 编辑器文档 / 非 React 运行时</td>
                                    <td className="py-2 pr-4">树外 Store + 选择器订阅</td>
                                    <td className="py-2">每次事件 setState 整份文档进 Context</td>
                                </tr>
                                <tr>
                                    <td className="py-2 pr-4">点按钮让输入框 focus</td>
                                    <td className="py-2 pr-4">ref / useImperativeHandle</td>
                                    <td className="py-2">用 state 模拟「该不该聚焦」</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Stack>
            </TopicSection>

            <TopicSection
                title="4. 默认通道:props 往下,callback 往上"
                note="讲解要点:React 的数据流是单向的。子组件不「拥有」父级的数据,它只是渲染一份快照,并通过 callback 上报意图。父级决定接不接、怎么改。购物车专题就是这条:SearchBar 上报筛选,页面过滤后再把列表 props 下去。"
            >
                <Stack>
                    <CodeBlock
                        title="子组件上报意图,不直接改父级 state"
                        code={`function FilterBar({ keyword, onKeywordChange }: Props) {
    return <input value={keyword} onChange={(e) => onKeywordChange(e.target.value)} />;
}

function Page() {
    const [keyword, setKeyword] = useState('');
    const visible = items.filter((item) => item.title.includes(keyword));
    return (
        <>
            <FilterBar keyword={keyword} onKeywordChange={setKeyword} />
            <List items={visible} />
        </>
    );
}`}
                    />
                    <P>
                        callback 要稳定时再请{' '}
                        <code className="rounded bg-gray-100 px-1 font-mono text-[11px] dark:bg-slate-800">useCallback</code>
                        ,否则 memo 子组件会跟着父级无关更新重渲染。多字段一起变、下一步必须合法时,用 reducer 代替一堆
                        setX。这两点各有专题,本页不展开。
                    </P>
                    <RelatedTopics
                        items={[
                            {
                                to: '/apps/shopping-cart',
                                label: '购物车',
                                why: 'SearchBar 回调 + 页面派生过滤列表,是生产里最常见的 props/callback 形状',
                            },
                            {
                                to: '/topics/hooks/use-callback',
                                label: 'useCallback',
                                why: '回调作为 props 传给 memo 子组件时,身份不稳会连坐重渲染',
                            },
                            {
                                to: '/topics/hooks/use-reducer',
                                label: 'useReducer',
                                why: '选中项、草稿、校验多字段必须一起变时,dispatch 比散落的 setState 更安全',
                            },
                        ]}
                    />
                </Stack>
            </TopicSection>

            <TopicSection
                title="5. 兄弟要同一份:提升到最近公共父级"
                note="讲解要点:两个兄弟谁也不该认识谁。把 state 放到它们都能看见的最近祖先,再分别 props 下去。不要在 A 里 useEffect 把值同步给 B。"
            >
                <Stack>
                    <CodeBlock
                        title="提升,而不是兄弟互相同步"
                        code={`// ✓ 父级是唯一事实
function Bench() {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    return (
        <>
            <TicketList selectedId={selectedId} onSelect={setSelectedId} />
            <TicketDetail id={selectedId} />
        </>
    );
}

// ✗ 各存一份再用 effect 对齐 —— 时序、漏同步、多一次渲染
function List({ onSelect }: { onSelect: (id: string) => void }) {
    const [id, setId] = useState<string | null>(null);
    useEffect(() => { if (id) onSelect(id); }, [id, onSelect]);
}`}
                    />
                    <P>
                        「提升到哪一层」取最近公共祖先,不是提升到 App。抬得过高,无关的整页都会因为选中项变化而重渲染。待办清单把过滤条件放在 Todo
                        根上,而不是 Header,就是这个尺度。
                    </P>
                    <RelatedTopics
                        items={[
                            {
                                to: '/apps/todo',
                                label: '待办事项清单',
                                why: '过滤、列表、输入框共享同一份 todos,所有权在页面根,不在 Context',
                            },
                        ]}
                    />
                </Stack>
            </TopicSection>

            <TopicSection
                title="6. 中间层不关心:用组合,别钻探"
                note="讲解要点:props 钻探的痛点通常不是「传了三层」,而是「中间那两层根本不该知道这份数据」。把叶子作为 children 传入,中间层只负责壳。布尔开关堆砌(isEditing / isThread)同样用组合拆成显式变体,而不是在一个组件里开十个通道。"
            >
                <Stack>
                    <CodeBlock
                        title="Shell 不认识 theme,叶子自己在 Page 里拿到"
                        code={`// ✗ 钻探:Shell / Panel 都要声明 theme,却从不使用
<Shell theme={theme}>
    <Panel theme={theme}>
        <Leaf theme={theme} />
    </Panel>
</Shell>

// ✓ 组合:中间层只排版
<Shell>
    <Panel>
        <Leaf theme={theme} />
    </Panel>
</Shell>`}
                    />
                    <P>
                        组合解决的是传递距离里的「无关中间人」,不是所有权。theme 仍然由 Page 拥有(或来自 Theme
                        Context)。需要跨很远、很多叶子都读时,再爬到 Context,而不是继续往下加参数。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="7. 远、稳、读者多:才配开 Context"
                note="讲解要点:Context 解决传递距离,不解决状态复杂度,更不解决服务器缓存。本仓库 Theme / User 已经是范本:state 一条、actions 一条。输入草稿、当前选中工单塞进 Context,是把高频更新广播给整棵订阅树。"
            >
                <RelatedTopics
                    items={[
                        {
                            to: '/topics/advanced/context',
                            label: 'Context API',
                            why: '查找规则、胖 Context 连坐、拆分与把 children 抬出 Provider,本仓库完整对照',
                        },
                    ]}
                />
            </TopicSection>

            <TopicSection
                title="8. 要分享、要回退:放进 URL"
                note="讲解要点:筛选、分页、当前 tab 这类「用户希望复制链接还能看到同一屏」的状态,属于 URL,不属于 Context。会话级选中项、未提交草稿通常不应进 URL。searchParams 是数据源,组件只是它的视图。"
            >
                <CodeBlock
                    title="过滤条件以 URL 为事实"
                    code={`const [params, setParams] = useSearchParams();
const status = params.get('status') ?? 'all';

function setStatus(next: string) {
    const nextParams = new URLSearchParams(params);
    if (next === 'all') nextParams.delete('status');
    else nextParams.set('status', next);
    setParams(nextParams, { replace: true });
}`}
                />
            </TopicSection>

            <TopicSection
                title="9. 树外事实、高频多订阅:外部 Store"
                note="讲解要点:Agent 运行时、协作文档、音频引擎这些事实并不长在 React 树上。硬塞进 Context 会让每次事件拖着所有订阅者渲染。正确形状是树外 Store + useSyncExternalStore + 细选择器。本仓库 Agent 专题就是这条链。"
            >
                <RelatedTopics
                    items={[
                        {
                            to: '/agent/use-sync-external-store',
                            label: 'useSyncExternalStore 深入梳理',
                            why: '外部 Store 的订阅协议、tear 与 Selector,决定「谁该因为这次事件重渲染」',
                        },
                        {
                            to: '/agent/agent-chat',
                            label: 'Agent 对话运行时',
                            why: 'SSE 事件进 RuntimeStore,UI 不持有会话事实,只订阅切片',
                        },
                        {
                            to: '/topics/advanced/relay',
                            label: 'Relay 数据流',
                            why: '服务器缓存 / 去重不属于组件通信;别把接口响应塞进巨大 Context',
                        },
                    ]}
                />
            </TopicSection>

            <TopicSection
                title="10. 命令不是数据:ref 只做 focus / scroll / play"
                note="讲解要点:能画在屏幕上的,用 state。点了按钮要让输入框聚焦、让列表滚到底、让播放器 pause,这是命令,走 ref。需要收窄父组件能调用的方法时,再用 useImperativeHandle,不要把整棵 DOM 交出去。"
            >
                <RelatedTopics
                    items={[
                        {
                            to: '/topics/hooks/use-ref',
                            label: 'useRef',
                            why: '盒子身份稳定,改 current 不排队渲染;命令的落点通常是 DOM 或定时器 ID',
                        },
                        {
                            to: '/topics/hooks/use-imperative-handle',
                            label: 'useImperativeHandle',
                            why: '父级只该看到 focus / clear,不该拿到内部 input 节点',
                        },
                    ]}
                />
            </TopicSection>

            <TopicSection
                title="11. 生产里不该出现的通道"
                note="讲解要点:模块级 EventTarget、window 自定义事件、在 effect 里把 props 写回父级,都会把数据流变成隐性的。第三方非 React 插件是少数例外,接进来也要在边界处翻译成 props 或 Store,不要让事件总线穿过整棵树。"
            >
                <CodeBlock
                    title="三条红线"
                    code={`// ① 用 effect 把子 state 同步给父 / 兄弟
useEffect(() => { onChange(value); }, [value]); // 多一次渲染,还容易环

// ② 模块单例当「全局通信」
export const bus = new EventTarget();
bus.dispatchEvent(new Event('cart:add')); // 谁在听?类型在哪?如何取消?

// ③ 一个 AppContext 塞齐用户、主题、当前工单、购物车
<AppContext value={{ user, theme, ticket, cart, flags }} />`}
                />
            </TopicSection>

            <TopicSection
                title="12. 落地清单与本专题三页"
                note="评审时把「这份数据的所有者」写在 PR 描述里。所有权一变,通道跟着变;通道先定、所有权后补,最后一定钻探或双写。"
            >
                <Stack>
                    <CodeBlock
                        title="评审清单"
                        code={`□ 谁是唯一可以改它的人?
□ 中间层是否根本不该看见它? → 组合
□ 读者是否又远又多、变化是否很慢? → 窄 Context
□ 刷新 / 分享 / 回退是否必须还在? → URL
□ 事实是否根本不在 React 树上? → 外部 Store
□ 这是不是其实是一条命令? → ref
□ 有没有第二份副本正在用 effect 追赶?`}
                    />
                    <P>
                        下一页把 ①②③⑤⑩⑪ 做成可点的对照;工作台页把过滤(URL)、选中(提升)、草稿(局部
                        state)、当前用户(已有 User Context)拆进同一个界面。自定义 Hook
                        负责「怎么接 React」,不负责「数据该存在哪」—— 分层见自定义 Hooks 梳理。
                    </P>
                    <RelatedTopics
                        items={[
                            {
                                to: '/topics/hooks/custom-hooks-guide',
                                label: '自定义 Hooks 深入梳理',
                                why: 'Hook 复用的是逻辑不是状态;两处调用 useXxx 不会自动同步,要同步请提升或走 Context / Store',
                            },
                            {
                                to: '/topics/advanced/component-comm-playground',
                                label: '模式演练',
                                why: '把梯子上的每一档点一遍,看错的那一档会多一次渲染或把中间层拖下水',
                            },
                            {
                                to: '/topics/advanced/component-comm-practice',
                                label: '工作台实战',
                                why: '工单列表 / 详情 / 过滤 / 评论草稿,通道一旦用错会立刻别扭',
                            },
                        ]}
                    />
                </Stack>
            </TopicSection>
        </TopicPage>
    );
});

ComponentCommGuide.displayName = 'ComponentCommGuide';

export default ComponentCommGuide;
