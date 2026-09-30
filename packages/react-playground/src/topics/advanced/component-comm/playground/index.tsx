/**
 * ============================================================================
 * 组件通信 · 模式演练(/advanced/component-comm-playground)
 * ============================================================================
 *
 * 把决策梯子上的默认档、组合、URL、命令式 ref、错误同步做成可点对照;
 * Context / Store / Relay 只做探针并链到已有专题,避免重复讲机制。
 *
 * @module topics/advanced/component-comm/playground
 */

import { memo } from 'react';
import { Link } from 'react-router-dom';

import { TopicPage, TopicSection } from '../../../../components/TopicPage';
import { CodeBlock } from '../../../../components/CodeBlock';
import { TopicNav } from '../../../../components/TopicNav';
import { COMPONENT_COMM_NAV_LINKS, COMPONENT_COMM_NAV_TITLE } from '../nav';
import { RelatedTopics } from '../components/RelatedTopics';
import { CommandRefDemo } from './components/CommandRefDemo';
import { DrillingVsSlotDemo } from './components/DrillingVsSlotDemo';
import { LiftStateDemo } from './components/LiftStateDemo';
import { PropsCallbackDemo } from './components/PropsCallbackDemo';
import { SiteContextProbe } from './components/SiteContextProbe';
import { UrlStateDemo } from './components/UrlStateDemo';
import { WrongSyncDemo } from './components/WrongSyncDemo';

const ComponentCommPlayground = memo(() => {
    return (
        <TopicPage
            title="组件通信 · 模式演练"
            description="默认走 props,兄弟就提升,中间层用组合,远而稳才开 Context,能分享的进 URL,命令走 ref"
        >
            <TopicNav
                title={COMPONENT_COMM_NAV_TITLE}
                links={COMPONENT_COMM_NAV_LINKS}
                current="/advanced/component-comm-playground"
                category="advanced"
            />

            <TopicSection
                title="1. 默认:props 往下,callback 往上"
                note="玩法:在输入框打字。keyword 只活在父级;FilterBar 上报意图,BookList 只拿已经过滤好的数组。子组件既不存关键字,也不自己 filter。"
            >
                <div className="space-y-4">
                    <PropsCallbackDemo />
                    <p className="text-xs text-gray-400 dark:text-slate-500">
                        生产同构见{' '}
                        <Link className="text-primary-600 underline-offset-2 hover:underline" to="/apps/shopping-cart">
                            购物车
                        </Link>
                        的 SearchBar → 页面过滤 → ProductList。
                    </p>
                </div>
            </TopicSection>

            <TopicSection
                title="2. 兄弟共用:提升到最近公共父级"
                note="玩法:点左侧水果。右侧预览立刻变,两个子组件互相不 import。selectedId 若各自存一份,就要靠 effect 对齐 —— 见第 6 节反例。"
            >
                <LiftStateDemo />
            </TopicSection>

            <TopicSection
                title="3. 中间层不关心:组合代替钻探"
                note="玩法:先关掉「使用组合」看红框 Shell/Panel 都被迫声明 accent;再打开,中间层 props 里不再出现 accent,换强调色叶子仍会变。钻探的成本是类型噪音和错误的所有权暗示。"
            >
                <DrillingVsSlotDemo />
            </TopicSection>

            <TopicSection
                title="4. 远、稳、读者多:复用站点 Context,不要新开"
                note="玩法:切换主题或用户,顶栏会一起变。这就是「跨很远的组件共享一份低频事实」。工单选中项、输入草稿不要学这个形状 —— 完整机制见 Context 专题。"
            >
                <div className="space-y-4">
                    <SiteContextProbe />
                    <RelatedTopics
                        items={[
                            {
                                to: '/advanced/context',
                                label: 'Context API',
                                why: '嵌套 Provider、胖 Context 连坐、拆分 state/actions,本页探针读的就是那套 Theme / User',
                            },
                        ]}
                    />
                </div>
            </TopicSection>

            <TopicSection
                title="5. 要分享、要回退:过滤进 URL"
                note="玩法:点 Hooks / 进阶,看查询串变化。这档状态刷新后还在。当前选中的水果(第 2 节)故意不进 URL —— 会话级选中通常不该污染地址栏。"
            >
                <UrlStateDemo />
            </TopicSection>

            <TopicSection
                title="6. 反例:用 effect 把子 state 抄给父级"
                note="玩法:关掉开关后在输入框打字,草稿先活在子组件,再经 effect 抄到父级预览(多一拍,还容易和其它 effect 打架)。打开开关:输入直接改父级,预览与输入是同一份事实。"
            >
                <div className="space-y-4">
                    <WrongSyncDemo />
                    <CodeBlock
                        title="不要用 effect 当通道"
                        code={`// ✗ 子组件是第二份事实
useEffect(() => { onDraftChange(draft); }, [draft, onDraftChange]);

// ✓ 父级是唯一事实,子组件只是受控输入
<input value={draft} onChange={(e) => onDraftChange(e.target.value)} />`}
                    />
                </div>
            </TopicSection>

            <TopicSection
                title="7. 命令走 ref"
                note="玩法:点「聚焦输入框」,光标进去,屏幕上没有任何 focused state。能画出来的用数据流;操作 DOM 用命令。要收窄父级能调用的方法,再到 useImperativeHandle 专题。"
            >
                <div className="space-y-4">
                    <CommandRefDemo />
                    <RelatedTopics
                        items={[
                            {
                                to: '/hooks/use-ref',
                                label: 'useRef',
                                why: '改 current 不触发渲染,适合握 DOM 和定时器',
                            },
                            {
                                to: '/hooks/use-imperative-handle',
                                label: 'useImperativeHandle',
                                why: '父级只该拿到 focus / clear,不该拿到内部节点',
                            },
                        ]}
                    />
                </div>
            </TopicSection>

            <TopicSection
                title="8. 树外事实:本页不再演示一遍"
                note="SSE、编辑器文档、音频引擎不属于「组件之间传 props」。硬塞进 Context 会让每次事件拖着所有读者渲染。走外部 Store。"
            >
                <RelatedTopics
                    items={[
                        {
                            to: '/agent/agent-chat',
                            label: 'Agent 对话运行时',
                            why: '事件流进 RuntimeStore,UI 经选择器订阅,组件之间不互相同步会话',
                        },
                        {
                            to: '/agent/use-sync-external-store',
                            label: 'useSyncExternalStore 深入梳理',
                            why: '并发下如何订阅树外 Store,而不把整份快照当 Context value',
                        },
                        {
                            to: '/advanced/relay',
                            label: 'Relay 数据流',
                            why: '服务器列表 / 详情是缓存问题,不是父子通信问题',
                        },
                        {
                            to: '/advanced/component-comm-practice',
                            label: '工作台实战',
                            why: '下一页把 URL、提升、局部草稿、User Context 拆进同一个工单界面',
                        },
                    ]}
                />
            </TopicSection>
        </TopicPage>
    );
});

ComponentCommPlayground.displayName = 'ComponentCommPlayground';

export default ComponentCommPlayground;
