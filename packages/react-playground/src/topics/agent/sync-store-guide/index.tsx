/**
 * ============================================================================
 * useSyncExternalStore 深入梳理(/agent/use-sync-external-store)
 * ============================================================================
 *
 * 围绕本仓库 `src/topics/agent/` 的真实实现,系统梳理
 * useSyncExternalStore 的原理、契约与工程实践。
 *
 * 内容结构(13 节):
 *   1  它解决什么问题        7  并发一致性
 *   2  为什么手写订阅不够    8  高频流式更新的节奏分层
 *   3  API 三参数            9  职责边界
 *   4  Store 协议契约        10 常见错误清单
 *   5  分层架构              11 测试契约
 *   6  Selector 与结构共享   12 本演练设计说明
 *                              13 前往演示页
 *
 * @module topics/agent/sync-store-guide
 */

import { memo } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ExperimentOutlined } from '@ant-design/icons';

import { TopicPage, TopicSection } from '../../../components/TopicPage';
import { CodeBlock } from '../../../components/CodeBlock';
import { Diagram } from '../../../components/Diagram';

/* =================================================================
 * 正文辅助:小节正文段落
 * ================================================================ */

const P = ({ children }: { children: string }) => (
    <p className="text-sm leading-relaxed text-gray-600 dark:text-slate-300">{children}</p>
);

/** 小节内多个内容块的纵向间距容器 */
const Stack = ({ children }: { children: ReactNode }) => (
    <div className="space-y-3">{children}</div>
);

/* =================================================================
 * 页面
 * ================================================================ */

const SyncStoreGuideTopic = memo(() => {
    return (
        <TopicPage
            title="useSyncExternalStore 深入梳理"
            description="React 为「外部可变 Store」提供的并发安全订阅协议 —— 以本仓库 Agent Runtime 实现为样本"
        >
            <div className="rounded-card border border-rose-100 bg-rose-50/60 px-4 py-3 text-xs text-rose-600 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                <ExperimentOutlined className="mr-1.5" />
                本文每一节都对应
                <Link
                    to="/agent/agent-chat"
                    className="mx-1 font-medium underline underline-offset-2 hover:text-rose-700 dark:hover:text-rose-200"
                >
                    Agent 对话运行时演示页
                </Link>
                中的真实代码与可观察现象,建议两边对照阅读。
            </div>

            {/* ---------- 1. 它解决什么问题 ---------- */}
            <TopicSection
                title="1. 它解决什么问题"
                note="Runtime Store 在 React 之外,React 需要一个标准的订阅适配器"
            >
                <Stack>
                    <P>
                        Agent 应用的会话状态(Conversation / Message / Run /
                        Part)通常不由某个组件的 useState 持有,而是由 React 之外的一个独立对象
                        管理 —— SSE、WebSocket、Worker 随时可能更新它,生命周期也比单个页面长。
                        问题随之产生:Store 变了,React 怎么知道要重渲染?重渲染时,又怎样保证
                        所有组件读到同一个版本?
                    </P>
                    <Diagram caption="useSyncExternalStore 的位置">
                        {`服务端 Agent 执行
      ↓ SSE 推送 RuntimeEvent
Runtime Store(React 之外,本仓库 runtime/RuntimeStore.ts)
      ↓ subscribe / getSnapshot
useSyncExternalStore(本仓库 react-adapter/hooks.ts)
      ↓
React UI(本仓库 agent-chat/ 各组件)`}
                    </Diagram>
                    <P>
                        它只回答三件事:现在该读哪一版数据;Store 变化时如何通知
                        React;并发渲染期间如何避免 UI 读到前后不一致的数据。它不管理
                        SSE,也不实现 Store —— 它是两者之间的标准协议。
                    </P>
                </Stack>
            </TopicSection>

            {/* ---------- 2. 为什么 useEffect + useState 不够 ---------- */}
            <TopicSection
                title="2. 为什么 useEffect + useState 不够"
                note="手写订阅有两个结构性缺陷:订阅时间窗口与 tearing"
            >
                <Stack>
                    <P>最直观的写法是在组件里 useState + useEffect 订阅:</P>
                    <CodeBlock
                        title="直觉写法(有缺陷)"
                        code={`function useRuntimeSnapshot(store) {
    const [snapshot, setSnapshot] = useState(store.getSnapshot());

    useEffect(() => {
        return store.subscribe(() => {
            setSnapshot(store.getSnapshot());
        });
    }, [store]);

    return snapshot;
}`}
                    />
                    <P>
                        缺陷一:渲染与订阅之间存在时间窗口。render 期间读到版本
                        1,而 subscribe 要等 effect 执行才建立 ——
                        窗口期内的版本 2 可能被错过(虽然可以订阅后补查,但自己写完整逻辑会
                        越来越复杂,还要处理 StrictMode 双调用、热更新等边界)。
                    </P>
                    <Diagram caption="缺陷一:订阅时间窗口">
                        {`组件 render
  ↓ 读取 Store 版本 1
Store 更新为版本 2        ← 这次更新被错过
  ↓ React 提交页面
useEffect 才开始 subscribe`}
                    </Diagram>
                    <P>
                        缺陷二:tearing(撕裂)。并发渲染允许一次渲染中途暂停;若暂停期间
                        Store 被 SSE 更新,先渲染的组件读旧版本、后渲染的组件读新版本,
                        同一帧 UI 混合两个 Store 版本。
                    </P>
                    <Diagram caption="缺陷二:并发渲染交错导致 tearing">
                        {`开始渲染组件树
  ↓ RunStatus   读取版本 10 → 显示「运行中」
React 暂停渲染,让出主线程
  ↓ SSE 到达,Store 更新为版本 11
React 继续渲染
  ↓ MessageList 读取版本 11 → 已显示完整结果

最终同帧:UI 说「仍在运行」,结果却已出现,取消按钮还可点`}
                    </Diagram>
                </Stack>
            </TopicSection>

            {/* ---------- 3. API 三参数 ---------- */}
            <TopicSection
                title="3. API 三参数"
                note="subscribe 负责通知,getSnapshot 负责读数,getServerSnapshot 服务 SSR"
            >
                <Stack>
                    <CodeBlock
                        code={`const snapshot = useSyncExternalStore(
    subscribe,        // 订阅 Store 更新,返回取消订阅函数
    getSnapshot,      // 读取客户端当前快照(必须引用稳定)
    getServerSnapshot // 可选,SSR 与 hydration 的初始快照
);`}
                    />
                    <P>
                        分工要点:subscribe 的回调不携带数据,只表示「可能变了」;React
                        收到通知后自己再调 getSnapshot,并用 Object.is
                        比较新旧快照决定是否重渲染。本仓库的封装见
                        react-adapter/hooks.ts 的 useRuntimeSnapshot。
                    </P>
                    <CodeBlock
                        title="react-adapter/hooks.ts(节选)"
                        code={`export function useRuntimeSnapshot(): RuntimeSnapshot {
    const store = useRuntimeStore();
    return useSyncExternalStore(
        store.subscribe,
        store.getSnapshot,
        store.getServerSnapshot
    );
}`}
                    />
                </Stack>
            </TopicSection>

            {/* ---------- 4. Store 协议契约 ---------- */}
            <TopicSection
                title="4. Store 协议契约"
                note="对照 runtime/RuntimeStore.ts:引用稳定、先换快照再通知"
            >
                <Stack>
                    <P>
                        契约一:getSnapshot 必须引用稳定。Store 没变时重复调用必须返回
                        同一对象引用,否则 React 的 Object.is 永远判定「变了」,会陷入无限重渲染
                        (开发环境下 React 会警告「The result of getSnapshot should be
                        cached」)。所以 Store 内部缓存一份不可变快照,只在有效更新时整体替换。
                    </P>
                    <CodeBlock
                        title="runtime/RuntimeStore.ts(节选)"
                        code={`getSnapshot = (): RuntimeSnapshot => {
    // 无有效变化时永远返回同一引用
    return this.currentSnapshot;
};

private publish(nextSnapshot: RuntimeSnapshot): boolean {
    // 重复/无效事件:reducer 原样返回 previous,此处直接跳过
    if (Object.is(nextSnapshot, this.currentSnapshot)) {
        return false;
    }
    // 契约二:先替换快照,再通知订阅者(顺序不可颠倒)
    this.currentSnapshot = nextSnapshot;
    for (const listener of this.listeners) {
        listener();
    }
    return true;
}`}
                    />
                    <P>
                        契约二:发布顺序必须是「先换快照、再通知」。若反过来先通知,
                        React 在回调里调 getSnapshot 读到的仍是旧值,更新就丢了。
                    </P>
                    <P>
                        契约三:不可变更新 + 结构共享。不能在已发布快照上原地修改
                        (根引用不变,Object.is 判定「没变」,UI 不更新);reducer
                        每次有效事件产出全新根快照,未受影响的实体复用原引用 ——
                        见 runtime/reducer.ts。
                    </P>
                </Stack>
            </TopicSection>

            {/* ---------- 5. 分层架构 ---------- */}
            <TopicSection
                title="5. 分层架构"
                note="Context 只传稳定 store 实例,快照不经过 Context"
            >
                <Stack>
                    <P>
                        不要让每个组件自己 new Store,也不要把快照塞进 Context
                        Provider —— 后者会让任何 Store 更新连坐重渲染所有读 Context
                        的组件。正确分工:Context 负责依赖注入「稳定的 store
                        实例」,数据订阅交给 useSyncExternalStore。
                    </P>
                    <CodeBlock
                        title="react-adapter/RuntimeProvider.tsx(节选)"
                        code={`// useRef 惰性创建:实例引用跨渲染稳定
const storeRef = useRef<RuntimeStore | null>(null);
if (storeRef.current === null) {
    storeRef.current = store ?? new RuntimeStore();
}

return (
    <RuntimeContext.Provider value={storeRef.current}>
        {children}
    </RuntimeContext.Provider>
);`}
                    />
                    <Diagram caption="四层职责划分">
                        {`MockSseClient      模拟服务端事件源(不了解 Store)
RuntimeStore       投影 / 去重 / 不可变快照 / 发布订阅(不了解 React)
react-adapter      Provider 注入实例 + useSyncExternalStore 订阅
UI 组件            只读快照、发命令(applyEvent / 播放控制)`}
                    </Diagram>
                </Stack>
            </TopicSection>

            {/* ---------- 6. Selector 与结构共享 ---------- */}
            <TopicSection
                title="6. Selector 与结构共享"
                note="为什么每个 token 不应刷新整个 UI —— 对照演示页渲染角标"
            >
                <Stack>
                    <P>
                        订阅整份快照意味着任何事件都触发重渲染。流式输出每秒可能产生几十条
                        part.delta,若所有组件都订整份快照,一个文本增量就会刷新侧边栏、
                        历史消息、状态徽标等全部 UI。解法是 Selector:每个组件只订阅自己关心的切片,
                        配合结构共享,切片引用不变就跳过渲染。
                    </P>
                    <CodeBlock
                        title="react-adapter/hooks.ts(节选,手写 Selector)"
                        code={`const getSelection = useCallback((): Selected => {
    const snapshot = store.getSnapshot();
    const cache = cacheRef.current;

    // 快照引用未变 → 直接复用缓存(getSnapshot 引用稳定契约)
    if (cache && Object.is(cache.snapshot, snapshot)) {
        return cache.selected;
    }
    const selected = selectorRef.current(snapshot);

    // 快照变了但选中切片等价 → 复用旧引用,React 跳过本次渲染
    if (cache && isEqual(cache.selected, selected)) {
        cacheRef.current = { snapshot, selected: cache.selected };
        return cache.selected;
    }
    cacheRef.current = { snapshot, selected };
    return selected;
}, [store, isEqual]);`}
                    />
                    <CodeBlock
                        title="runtime/reducer.ts(节选,结构共享)"
                        code={`case 'part.delta': {
    // 只有该 part 与 partsById 换引用,其余实体原样复用
    return {
        ...previous,
        version: previous.version + 1,
        partsById: {
            ...previous.partsById,
            [event.partId]: { ...previousPart, content: previousPart.content + event.delta },
        },
    };
}`}
                    />
                    <P>
                        到演示页观察:流式输出期间,只有正在接收 delta 的
                        PartRenderer 角标计数增长;MessageList、其他 part、
                        RunStatusBadge、ControlBar 全部不动。这就是「结构共享 +
                        Selector」的可视化证据。注意:React 核心的
                        useSyncExternalStore 没有内置 Selector 参数,官方提供的是
                        use-sync-external-store/with-selector 包;本演练为不新增依赖,
                        在 hooks.ts 手写了同等能力的快照缓存 + Object.is 比较。
                    </P>
                </Stack>
            </TopicSection>

            {/* ---------- 7. 并发一致性 ---------- */}
            <TopicSection
                title="7. 并发一致性"
                note={'提交前再读一次快照;"Sync" 的真正含义'}
            >
                <Stack>
                    <P>
                        useSyncExternalStore 如何避免第 2 节的
                        tearing?近似理解:渲染期间读一次快照;建立订阅后补查一次;
                        关键是在并发(可中断)渲染准备提交 DOM 之前,React 会再调一次
                        getSnapshot —— 若发现与渲染开始时版本不一致,就放弃这次非阻塞渲染,
                        改为同步(阻塞)重新渲染,保证屏幕上的组件永远反映同一版本。
                    </P>
                    <Diagram caption="提交前一致性检查">
                        {`开始渲染:V10        准备提交:发现已是 V11
        ↓                      ↓
  基于 V10 渲染          不把混合状态提交给用户
                             ↓
                        回退为阻塞渲染,重新基于 V11 渲染`}
                    </Diagram>
                    <P>
                        所以名字里的「Sync」不是「同步到服务端」,也不是「SSE
                        必须同步执行」,而是:对外部 Store 的一致性检查采用同步保障,
                        必要时放弃并发渲染也要避免提交撕裂的
                        UI。推论:startTransition 无法降低外部 Store 更新的优先级
                        —— 一致性优先于可中断性。
                    </P>
                </Stack>
            </TopicSection>

            {/* ---------- 8. 高频流式更新的节奏分层 ---------- */}
            <TopicSection
                title="8. 高频流式更新的节奏分层"
                note="useSyncExternalStore 管一致性,不管性能;性能靠节奏拆分"
            >
                <Stack>
                    <P>
                        每个 token 都发布一次快照,意味着每秒几十次 Store 通知与
                        Selector 检查。生产实现通常在投影层做受控合并:暂存一个很短时间窗口内的
                        delta,原子地合成一份新快照统一发布 ——
                        保留事件顺序与最终内容一致,只是降低发布频率。
                    </P>
                    <Diagram caption="三种节奏各归其位">
                        {`协议事实节奏   每个事件都必须按序处理、去重(不丢事件)
Store 发布节奏 多个兼容增量可合并成一次原子发布
UI 动画节奏    打字机 / 渐显属于展示层,用局部 state 实现`}
                    </Diagram>
                    <P>
                        注意边界:不要把打字机动画的每一帧写回业务 Store —— Store
                        保存「已接收的事实」,展示节奏交给 UI 局部状态或动画控制器。本演练刻意
                        一事件一发布,让事件日志与渲染角标一一对应,便于观察。
                    </P>
                </Stack>
            </TopicSection>

            {/* ---------- 9. 职责边界 ---------- */}
            <TopicSection
                title="9. 职责边界"
                note="它只负责「读」与「订阅」,其他一切都是别人的事"
            >
                <Stack>
                    <P>useSyncExternalStore 不负责:</P>
                    <CodeBlock
                        code={`创建 Store · 发起 HTTP · 建立/重连 SSE · 事件排序与去重
合并 delta · 游标恢复 · Snapshot 修复 · IndexedDB 持久化
乐观更新 · 任务取消 · 订阅粒度选择 · Markdown 解析频率`}
                    />
                    <P>
                        因此「用了 useSyncExternalStore」不等于 Runtime
                        已经并发安全或可恢复:同一 eventId 不能重复应用、sequence
                        不能倒退、run.completed 之后不能回到 running……
                        这些不变量必须由 Runtime Core 保证(本仓库落在
                        runtime/reducer.ts 的状态机与 RuntimeStore 的 eventId
                        去重上)。另外,取消 UI 订阅 ≠ 取消 Agent Run ——
                        组件卸载只是「不再关心更新」,取消任务应是显式命令
                        (演示页「取消 Run」按钮正是单独补发一条 cancelled 事件)。
                    </P>
                </Stack>
            </TopicSection>

            {/* ---------- 10. 常见错误清单 ---------- */}
            <TopicSection
                title="10. 常见错误清单"
                note="九条反例,每条附错误 / 正确对照"
            >
                <Stack>
                    <CodeBlock
                        title="① getSnapshot 每次返回新对象 → React 认为 Store 一直在变"
                        code={`// ✗ 错误:Object.is(两次调用) === false,可能无限重渲染
getSnapshot = () => ({ runs: this.runs, parts: this.parts });
// ✓ 正确:返回缓存的不可变快照,有效更新时才替换
getSnapshot = () => this.currentSnapshot;`}
                    />
                    <CodeBlock
                        title="② 原地修改快照 → 根引用不变,更新被跳过"
                        code={`// ✗ 错误:mutableState 还是同一个对象
this.snapshot.runsById[id].status = 'completed';
// ✓ 正确:不可变更新,产出新根引用(见 runtime/reducer.ts)
this.currentSnapshot = reduceRuntimeEvent(this.currentSnapshot, event);`}
                    />
                    <CodeBlock
                        title="③ 每次渲染新建 Store → 状态丢失、反复重订阅"
                        code={`// ✗ 错误:组件函数体内 new,每次 render 都是新实例
const store = new RuntimeStore();
// ✓ 正确:useRef 惰性创建一次(见 RuntimeProvider.tsx)
const ref = useRef(null);
if (ref.current === null) ref.current = new RuntimeStore();`}
                    />
                    <CodeBlock
                        title="④ subscribe 引用不稳定 → React 可能反复退订/重订"
                        code={`// ✗ 错误:内联箭头函数每次渲染都是新引用
useSyncExternalStore((l) => store.subscribe(l), store.getSnapshot);
// ✓ 正确:直接传稳定的方法引用(本仓库 store 方法均为实例箭头函数)
useSyncExternalStore(store.subscribe, store.getSnapshot);`}
                    />
                    <CodeBlock
                        title="⑤ 在 getSnapshot 里做副作用 → 渲染期被多次调用,副作用失控"
                        code={`// ✗ 错误:getSnapshot 在渲染与一致性检查期间会被反复调用
getSnapshot = () => { this.connectSSE(); return this.snapshot; };
// ✓ 正确:getSnapshot 必须是纯读取;连接等副作用放命令层/Effect`}
                    />
                    <CodeBlock
                        title="⑥ 先通知后换快照 → 订阅者读到旧值"
                        code={`// ✗ 错误:listener 回调里 getSnapshot 拿到的还是旧快照
for (const l of this.listeners) l();
this.currentSnapshot = next;
// ✓ 正确:先替换,再统一通知(见 RuntimeStore.publish)`}
                    />
                    <CodeBlock
                        title="⑦ 每个 token 都全局渲染 → 流式输出拖垮整页"
                        code={`// ✗ 错误:所有组件 useRuntimeSnapshot 订整份快照
// ✓ 正确:结构共享 + Selector 精准订阅 + 受控合并发布节奏
const part = useRuntimeSelector((s) => s.partsById[partId]);`}
                    />
                    <CodeBlock
                        title="⑧ 让订阅值直接触发 Suspense → 已显示内容被 fallback 闪替"
                        code={`// ✗ 错误:外部 Store 更新无法标记为非阻塞 Transition
const data = useRuntimeSelector((s) => s.resource.read()); // 可能抛 promise
// ✓ 正确:异步资源走框架数据层;订阅值只表达「已就绪的事实」`}
                    />
                    <CodeBlock
                        title="⑨ 指望 startTransition 降低 Store 更新优先级 → 一致性优先"
                        code={`// ✗ 误解:外部更新可以被 Transition 延后
// ✓ 事实:为保证一致性,React 会把相关 Transition 回退为阻塞更新;
//   降频应做在 Store 发布节奏上(第 8 节),而不是渲染优先级上`}
                    />
                </Stack>
            </TopicSection>

            {/* ---------- 11. 测试契约 ---------- */}
            <TopicSection
                title="11. 测试契约"
                note="对照 runtime/RuntimeStore.test.ts 与 react-adapter/hooks.test.tsx"
            >
                <Stack>
                    <P>
                        外部 Store 的质量不靠 Code Review 拍脑袋,而是固化为一组可执行契约。
                        本仓库 runtime/RuntimeStore.test.ts 覆盖:
                    </P>
                    <CodeBlock
                        title="runtime/RuntimeStore.test.ts(用例清单)"
                        code={`引用稳定     无更新时 getSnapshot 重复调用返回同一引用
有效更新     有效事件产生新快照且 version + 1
幂等去重     重复 eventId 返回原引用、不通知订阅者
非法迁移     completed 之后拒绝回到 running
订阅生命周期 subscribe 通知 → unsubscribe 后不再通知
原子性       一个事件同时改 message + conversation,订阅者看不到中间态
结构共享     更新 part-A 时 part-B / runs / messages 引用不变
无效增量     对已完成 / 不存在的 part 发 delta 不产生新快照
reset       回到空快照并通知,去重记录同步清空`}
                    />
                    <P>
                        react-adapter/hooks.test.tsx 则验证 Selector 侧契约:快照未变时
                        selector 不重算且返回引用稳定;无关切片更新时选中值复用旧引用;
                        相关切片更新时才换新引用。这些正是演示页 RenderBadge
                        现象的自动化版本。
                    </P>
                </Stack>
            </TopicSection>

            {/* ---------- 12. 本演练设计说明 ---------- */}
            <TopicSection
                title="12. 本演练设计说明"
                note="架构、文件映射,以及它与生产级 Agent 架构的刻意差距"
            >
                <Stack>
                    <Diagram caption="演示页数据流">
                        {`ControlBar(发命令)
      ↓ start / pause / setSpeed / cancel
MockSseClient(runtime/MockSseClient.ts,按剧本定时推送)
      ↓ RuntimeEvent(含 eventId,刻意混入重复/非法事件)
RuntimeStore(runtime/RuntimeStore.ts)
      ├─ eventId 去重
      ├─ reducer 纯函数投影 + 状态机校验(reducer.ts)
      └─ 先换不可变快照,再通知订阅者
              ↓ subscribe / getSnapshot
react-adapter(Provider 注入实例;hooks.ts 的 Selector 订阅)
              ↓
MessageList / MessageBubble / PartRenderer / RunStatusBadge
(RenderBadge 角标可视化各组件渲染次数;EventLogPanel 对照事件与版本)`}
                    </Diagram>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-gray-100 text-gray-400 dark:border-slate-800 dark:text-slate-500">
                                    <th className="py-2 pr-4 font-medium">文件</th>
                                    <th className="py-2 font-medium">职责</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 dark:text-slate-300">
                                <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                    <td className="py-2 pr-4 font-mono">runtime/types.ts</td>
                                    <td className="py-2">领域模型与事件协议(纯类型)</td>
                                </tr>
                                <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                    <td className="py-2 pr-4 font-mono">runtime/reducer.ts</td>
                                    <td className="py-2">纯函数事件投影:不可变更新、结构共享、状态机</td>
                                </tr>
                                <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                    <td className="py-2 pr-4 font-mono">runtime/RuntimeStore.ts</td>
                                    <td className="py-2">快照缓存、eventId 去重、发布订阅、发布顺序</td>
                                </tr>
                                <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                    <td className="py-2 pr-4 font-mono">runtime/script.ts</td>
                                    <td className="py-2">演示剧本:含重复 / 非法事件样本</td>
                                </tr>
                                <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                    <td className="py-2 pr-4 font-mono">runtime/MockSseClient.ts</td>
                                    <td className="py-2">定时回放剧本,模拟 SSE 事件源</td>
                                </tr>
                                <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                    <td className="py-2 pr-4 font-mono">react-adapter/*</td>
                                    <td className="py-2">Provider 注入 + useSyncExternalStore / Selector</td>
                                </tr>
                                <tr>
                                    <td className="py-2 pr-4 font-mono">agent-chat/*</td>
                                    <td className="py-2">演示页 UI:只读快照、发命令、渲染角标</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <P>
                        与生产级架构的刻意差距(本演练为突出协议本身而简化):无真实
                        SSE 重连与游标恢复;无服务端权威 Snapshot 修复;无增量合并降频
                        (一事件一发布,便于观察);无 IndexedDB 持久化;Run
                        为单条剧本而非并发多 Run。这些能力应落在 Runtime Core
                        与网络层,而不是 useSyncExternalStore 上 —— 这正是第 9
                        节的职责边界。
                    </P>
                </Stack>
            </TopicSection>

            {/* ---------- 13. 前往演示页 ---------- */}
            <TopicSection title="13. 动手验证" note="把本文的每一条契约变成可观察的现象">
                <Link
                    to="/agent/agent-chat"
                    className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-600"
                >
                    <ExperimentOutlined />
                    打开 Agent 对话运行时演示页
                </Link>
            </TopicSection>
        </TopicPage>
    );
});

SyncStoreGuideTopic.displayName = 'SyncStoreGuideTopic';

export default SyncStoreGuideTopic;
