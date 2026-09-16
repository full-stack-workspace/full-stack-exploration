/**
 * ============================================================================
 * 自定义 Hooks 深入梳理(/topics/hooks/custom-hooks-guide)
 * ============================================================================
 *
 * 围绕本专题 custom-hooks/ 的真实实现,系统梳理自定义 Hook 的
 * 设计原则、组合设计思路与落地实践。
 *
 * 内容结构(13 节):
 *   1  逻辑复用的演进          8  原则五:竞态与取消
 *   2  自定义 Hook 的本质      9  组合设计思路与状态归属
 *   3  两条硬性规则            10 落地实践:目录 / 类型 / 何时不抽
 *   4  原则一:单一职责        11 测试策略
 *   5  原则二:API 设计        12 常见坑清单
 *   6  原则三:引用稳定性      13 本专题演练设计说明
 *   7  原则四:自清理与依赖诚实
 *
 * @module topics/hooks/custom-hooks/guide
 */

import { memo } from 'react';
import type { ReactNode } from 'react';

import { TopicPage, TopicSection } from '../../../../components/TopicPage';
import { CodeBlock } from '../../../../components/CodeBlock';
import { Diagram } from '../../../../components/Diagram';
import { NavBanner } from '../playground/components/NavBanner';

/* =================================================================
 * 正文辅助组件
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

const CustomHooksGuide = memo(() => {
    return (
        <TopicPage
            title="自定义 Hooks 深入梳理"
            description="设计原则、组合设计思路与落地实践 —— 以本专题 custom-hooks/lib 的 8 个生产级 Hook 为样本"
        >
            <NavBanner current="guide" />

            {/* ---------- 1. 逻辑复用的演进 ---------- */}
            <TopicSection
                title="1. 逻辑复用的演进"
                note="Mixin → HOC → Render Props → Hooks:每一步都在解决上一步的痛点"
            >
                <Stack>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-gray-100 text-gray-400 dark:border-slate-800 dark:text-slate-500">
                                    <th className="py-2 pr-4 font-medium">方案</th>
                                    <th className="py-2 pr-4 font-medium">做法</th>
                                    <th className="py-2 font-medium">痛点</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 dark:text-slate-300">
                                <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                    <td className="py-2 pr-4 font-mono">Mixin</td>
                                    <td className="py-2 pr-4">把方法直接混入组件</td>
                                    <td className="py-2">命名冲突、隐式依赖、来源不可追溯(React 已废弃)</td>
                                </tr>
                                <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                    <td className="py-2 pr-4 font-mono">HOC</td>
                                    <td className="py-2 pr-4">包一层组件注入 props</td>
                                    <td className="py-2">嵌套地狱、props 来源不明、ref 穿透麻烦</td>
                                </tr>
                                <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                    <td className="py-2 pr-4 font-mono">Render Props</td>
                                    <td className="py-2 pr-4">用函数 children 传递状态</td>
                                    <td className="py-2">JSX 深层嵌套、逻辑与视图耦合在渲染树里</td>
                                </tr>
                                <tr>
                                    <td className="py-2 pr-4 font-mono">Hooks</td>
                                    <td className="py-2 pr-4">函数内直接组合状态逻辑</td>
                                    <td className="py-2">无嵌套、来源清晰、可再组合 —— 代价是必须遵守调用规则(第 3 节)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <P>
                        自定义 Hook 胜出不是因为语法更短,而是它第一次让「有状态逻辑」可以像
                        普通函数一样被提取、命名、组合与测试,且不改变组件树的形状。
                    </P>
                </Stack>
            </TopicSection>

            {/* ---------- 2. 自定义 Hook 的本质 ---------- */}
            <TopicSection
                title="2. 自定义 Hook 的本质"
                note="React 不识别你的 Hook,识别的只是里面的 Hook 调用"
            >
                <Stack>
                    <P>
                        自定义 Hook 没有任何注册机制:它只是「一个调用了其他 Hook 的普通函数」。
                        React 不知道 useUserSearch 存在,它看到的是每次渲染依次执行的
                        useState、useEffect……状态按调用顺序挂在组件的 Hook 链表上。
                    </P>
                    <CodeBlock
                        code={`function useUserSearch() {
    const [keyword, setKeyword] = useState('');   // React 看到的:第 1 个 Hook
    const debounced = useDebouncedValue(keyword); // 展开后:第 2、3 个 Hook…
    // React 视角:这个组件依次调用了 N 个 Hook,与是否被「封装」无关
}`}
                    />
                    <P>
                        推论一:自定义 Hook 之间不共享状态 —— 每个组件调用 useUserSearch
                        都得到独立的一份。推论二:复用的是「逻辑」,不是「状态」;两个组件用同一个
                        Hook 不等于它们的状态同步(要同步状态请提升 state 或用 Context / 外部 Store)。
                    </P>
                </Stack>
            </TopicSection>

            {/* ---------- 3. 两条硬性规则 ---------- */}
            <TopicSection
                title="3. 两条硬性规则"
                note="use 前缀 + 顶层调用,由 eslint-plugin-react-hooks 强制保障"
            >
                <Stack>
                    <CodeBlock
                        code={`规则 1:只在顶层调用 Hook
  ✗ if (cond) { useState() } / for 循环里 / 回调里
  ✓ 无条件、固定顺序 —— React 靠「调用顺序」对号每个 Hook 的状态

规则 2:只在 React 函数中调用 Hook
  ✓ 函数组件、自定义 Hook(use 开头的函数)
  ✗ 普通函数、类组件、事件回调`}
                    />
                    <P>
                        use 前缀不是装饰:它是 eslint-plugin-react-hooks 识别 Hook
                        的唯一线索。本包的 eslint.config.js 启用了
                        react-hooks/rules-of-hooks(error)与
                        react-hooks/exhaustive-deps(warn),违反规则在 lint
                        阶段就会被拦下 —— 规则的可执行性,是团队级落地的前提。
                    </P>
                </Stack>
            </TopicSection>

            {/* ---------- 4. 原则一:单一职责 ---------- */}
            <TopicSection
                title="4. 原则一:单一职责与关注点分离"
                note="一个 Hook 只回答一个问题;stateful logic 与 UI 各司其职"
            >
                <Stack>
                    <P>
                        本专题 lib/ 的划分就是示范:useToggle 只管布尔、useInterval 只管
                        节拍、useMediaQuery 只管一条媒体查询。反例是一个 usePageHelper
                        同时管弹窗、定时器、请求与滚动 —— 它无法单独复用任何一段,也无法单独测试。
                    </P>
                    <P>
                        判据:能用一句话说清「这个 Hook 负责什么」吗?能离开当前页面独立使用吗?
                        UI 组件里剩下的应该是「渲染什么、用户点了往哪传」,所有「怎么实现」
                        都应下沉到 Hook。
                    </P>
                </Stack>
            </TopicSection>

            {/* ---------- 5. 原则二:API 设计 ---------- */}
            <TopicSection
                title="5. 原则二:API 设计"
                note="参数归一 options、tuple vs object 的选择依据、默认值先行"
            >
                <Stack>
                    <P>
                        参数面:超过两个可选参数就归一成 options 对象(见
                        lib/useRequest 的 UseRequestOptions),位置参数只留给核心输入
                        (如 useLocalStorage 的 key)。默认值要让最常见用法零配置
                        (useDebouncedValue 的 delay = 300)。
                    </P>
                    <CodeBlock
                        title="tuple vs object 的选择依据"
                        code={`// tuple:消费者必然自行命名,且数量少而固定(对齐 useState 的习惯)
const [value, actions] = useToggle();
const [note, setNote] = useLocalStorage('key', '');

// object:字段名本身就是文档,可选字段多、会逐步扩展
const { data, loading, error, run, refresh, cancel } = useRequest(fn, options);`}
                    />
                    <P>
                        判据:返回值像「一对主语 + 操作」用 tuple;像「一份多字段结果」用
                        object。不要返回「第 5 个元素才用到的神秘布尔」式的长元组。
                    </P>
                </Stack>
            </TopicSection>

            {/* ---------- 6. 原则三:引用稳定性 ---------- */}
            <TopicSection
                title="6. 原则三:引用稳定性"
                note="返回值里的函数与对象必须稳定化,否则下游 memo / effect 全部失效"
            >
                <Stack>
                    <P>
                        Hook 的返回值会被消费者放进 useEffect 依赖数组、传给 memo
                        子组件。若每次渲染都是新引用,下游优化全部失效,甚至引发死循环。
                        本专题的对照样本是 lib/useToggle:
                    </P>
                    <CodeBlock
                        title="lib/useToggle.ts(节选)"
                        code={`// 函数式更新 / 常量写入 → deps 为空 → 引用永远稳定
const toggle = useCallback(() => setValue((v) => !v), []);
const setTrue = useCallback(() => setValue(true), []);
const setFalse = useCallback(() => setValue(false), []);

// 关键细节:actions 对象本身也要 useMemo,
// 否则函数稳定了,装它们的盒子每次渲染还是新的
const actions = useMemo(() => ({ toggle, setTrue, setFalse }), [toggle, setTrue, setFalse]);`}
                    />
                    <P>
                        useRequest 同理:run / refresh / cancel 全部是 useCallback
                        稳定引用,组合方才可以放心写 [debouncedKeyword, run] 这样的依赖
                        (见 composition/useUserSearch.ts)。
                    </P>
                </Stack>
            </TopicSection>

            {/* ---------- 7. 原则四:自清理与依赖诚实 ---------- */}
            <TopicSection
                title="7. 原则四:副作用自清理与依赖诚实"
                note="对照 lib/useEventListener 与 lib/useInterval 的回调 ref 模式"
            >
                <Stack>
                    <P>
                        谁订阅谁退订:effect 里建立的定时器、监听、连接,cleanup
                        里必须成对销毁。依赖诚实:deps 数组写什么,effect 就该用什么 ——
                        撒谎的 deps 是闭包旧值 bug 的根源。
                    </P>
                    <CodeBlock
                        title="lib/useInterval.ts — 回调 ref 模式:既诚实又不断拍"
                        code={`const callbackRef = useRef(callback);
useEffect(() => { callbackRef.current = callback; }, [callback]); // 同步最新回调

useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => callbackRef.current(), delay);
    return () => clearInterval(id);
}, [delay]); // 依赖只有 delay:callback 变化不重置节拍,却永远读最新闭包`}
                    />
                    <P>
                        模式要点:把「每次渲染都变、但不该触发重建」的值移进
                        ref,effect 的依赖就只剩下真正的节拍参数。lib/useEventListener
                        的 handler、lib/useRequest 的 onSuccess/onError 都是同一招。
                    </P>
                </Stack>
            </TopicSection>

            {/* ---------- 8. 原则五:竞态与取消 ---------- */}
            <TopicSection
                title="8. 原则五:竞态与取消"
                note="对照 lib/useRequest:请求序号 + AbortController 双保险"
            >
                <Stack>
                    <P>
                        异步 Hook 的生产事故大多来自竞态:快速连续发起 A、B 两个请求,
                        A 后返回却把 B 的结果覆盖掉。useRequest 用两层防线:
                    </P>
                    <Diagram caption="竞态处理双保险(对照组合实战页日志面板)">
                        {`run A (req-1)        run B (req-2)
    ↓                    ↓ 发起时 abort req-1,序号推进到 2
  A 后返回 → requestId(1) !== 最新序号(2) → stale,丢弃
  B 先返回 → requestId(2) === 最新序号(2) → 写入 state

即使对方忽略 signal 正常返回,序号校验也兜底;反之亦然`}
                    </Diagram>
                    <CodeBlock
                        title="lib/useRequest.ts(节选)"
                        code={`const requestId = ++requestSeqRef.current;
abortRef.current?.abort();              // 防线一:让对方 promise 尽快 reject
const controller = new AbortController();
...
.then((data) => {
    if (requestId !== requestSeqRef.current) {
        emit({ type: 'stale', requestId }); // 防线二:过期结果直接丢弃
        return;
    }
    setData(data); ...
})`}
                    />
                    <P>
                        卸载安全同理:组件卸载时 abort 在途请求。到「组合实战」页快速
                        连续输入,日志面板里被标灰的「废弃」条目就是这两条防线的可视化。
                    </P>
                </Stack>
            </TopicSection>

            {/* ---------- 9. 组合设计思路 ---------- */}
            <TopicSection
                title="9. 组合设计思路"
                note="原子 Hooks → 领域 Hooks → UI 的分层;状态归属决策;受控/非受控;headless 思想"
            >
                <Stack>
                    <Diagram caption="本专题组合实战的分层(对照 composition/)">
                        {`原子 Hooks    useState / useDebouncedValue / useRequest
领域 Hook     useUserSearch —— 把三者组装出「搜索」这一业务语义
UI 组件       Input / List / Alert / 日志面板 —— 零请求细节`}
                    </Diagram>
                    <P>
                        状态归属决策(哪些留在 Hook 内、哪些暴露):keyword
                        留在 useUserSearch 内,因为它是「搜索语义的输入草稿」;
                        users/loading/error 由 useRequest 托管;日志属于可观测性,
                        也内聚在领域 Hook。判据 —— 谁最懂这段状态的语义,状态就归谁;
                        UI 只需要读结果和发意图。
                    </P>
                    <P>
                        受控 / 非受控:若调用方需要在外部驱动值(如从 URL 恢复
                        keyword),Hook 应支持「受控模式」—— 接受 value +
                        onChange,内部状态降级为兜底。headless 思想:领域 Hook
                        只输出数据与动作,不输出任何 JSX;同一 useUserSearch
                        今天驱动 antd List,明天可以原样驱动命令面板。
                    </P>
                </Stack>
            </TopicSection>

            {/* ---------- 10. 落地实践 ---------- */}
            <TopicSection
                title="10. 落地实践"
                note="目录组织与 barrel 导出、TS 类型设计、何时不该抽 Hook"
            >
                <Stack>
                    <P>
                        目录组织:可复用 Hook 集中放在 lib/,一个文件一个 Hook,
                        index.ts 做 barrel 统一出口(见 lib/index.ts)——
                        消费方只认一个 import 路径,新增 Hook 只需补一行导出。
                    </P>
                    <CodeBlock
                        title="TS 类型设计三招(对照 lib/)"
                        code={`// ① 泛型保真:输入什么类型,输出什么类型
function useDebouncedValue<T>(value: T, delay = 300): T

// ② 元组标签:tuple 返回也有可读名
function useToggle(...): [boolean, ToggleActions]

// ③ 判别联合表达状态机:事件类型即文档
type UseRequestEvent =
    | { type: 'start'; requestId: number }
    | { type: 'stale'; requestId: number }
    | { type: 'error'; requestId: number; message: string } ...`}
                    />
                    <P>
                        何时不该抽 Hook:逻辑只在一个组件用一次,直接写在组件里;
                        纯计算(无 state/effect)抽成普通函数即可,不必 Hook 化;
                        为了「看起来专业」而把两行 useState 包成 Hook,只会增加跳转成本。
                    </P>
                </Stack>
            </TopicSection>

            {/* ---------- 11. 测试策略 ---------- */}
            <TopicSection
                title="11. 测试策略"
                note="renderHook + act + fake timers;测契约,不测实现细节"
            >
                <Stack>
                    <P>
                        Hook 不能离开组件渲染,@testing-library/react 的 renderHook
                        提供了一个最小宿主组件;act 包裹触发状态更新的操作;定时器类
                        Hook 用 vi.useFakeTimers 精确控制时间。
                    </P>
                    <CodeBlock
                        title="lib/useRequest.test.tsx(节选)—— 测的是「竞态契约」"
                        code={`// 连续发起 A、B;B 先返回生效,A 后返回必须被丢弃
act(() => result.current.run('a'));
act(() => result.current.run('b'));
await act(async () => deferredB.resolve('B 的结果'));
await act(async () => deferredA.resolve('A 的结果'));

expect(result.current.data).toBe('B 的结果');           // state 未被旧请求污染
expect(events.map((e) => e.type)).toEqual(
    ['start', 'start', 'success', 'stale']);            // 生命周期事件可观测`}
                    />
                    <P>
                        测契约不测实现:断言「引用稳定」「卸载后不再触发」「过期结果被
                        丢弃」这类对外承诺;不断言内部用了几个 ref、effect 执行了几次 ——
                        那样重构实现就会无谓地打碎测试。lib/ 下 8 个测试文件共 35
                        个用例,全部遵循这一原则,可直接当范本。
                    </P>
                </Stack>
            </TopicSection>

            {/* ---------- 12. 常见坑清单 ---------- */}
            <TopicSection
                title="12. 常见坑清单"
                note="五条高频事故,每条错误 / 正确对照"
            >
                <Stack>
                    <CodeBlock
                        title="① 闭包旧值:定时器读到几个月前的 state"
                        code={`// ✗ 错误:interval 闭包固定在首次渲染,count 永远是 0
useEffect(() => { setInterval(() => setCount(count + 1), 1000); }, []);
// ✓ 正确:函数式更新,或回调 ref 模式(lib/useInterval)
useInterval(() => setCount((c) => c + 1), 1000);`}
                    />
                    <CodeBlock
                        title="② 依赖数组撒谎:用了却没写,写了却没用"
                        code={`// ✗ 错误:effect 里用了 userId,deps 却是 []
useEffect(() => { fetchUser(userId); }, []);
// ✓ 正确:依赖诚实;「不该触发重建的值」移进 ref(第 7 节)
useEffect(() => { fetchUser(userId); }, [userId]);`}
                    />
                    <CodeBlock
                        title="③ 无限循环:effect 里 setState 的对象依赖每次渲染都变"
                        code={`// ✗ 错误:options 每次渲染新对象 → effect 反复执行 → setState → 再渲染
useEffect(() => { setX(compute(options)); }, [options]);
// ✓ 正确:调用方 useMemo 稳定化 options,或 Hook 内部改用 ref 读取`}
                    />
                    <CodeBlock
                        title="④ StrictMode 双执行:effect 在开发环境挂载两次"
                        code={`// ✗ 错误:在 effect 里做「只该发生一次」的事(如上报、非幂等订阅)
useEffect(() => { trackPageView(); }, []);
// ✓ 正确:effect 必须能安全地「建立 → 清理 → 再建立」;
//   订阅类副作用写成成对的 subscribe/unsubscribe(lib/useEventListener)`}
                    />
                    <CodeBlock
                        title="⑤ SSR 注意点:首次渲染就触碰浏览器 API"
                        code={`// ✗ 错误:渲染期读 window,服务端直接抛错
const [w, setW] = useState(window.innerWidth);
// ✓ 正确:浏览器 API 放进 effect / 懒初始化守卫;
//   订阅类用 useSyncExternalStore + getServerSnapshot 兜底(lib/useMediaQuery)`}
                    />
                </Stack>
            </TopicSection>

            {/* ---------- 13. 本专题演练设计说明 ---------- */}
            <TopicSection
                title="13. 本专题演练设计说明"
                note="三页分工与文件映射;刻意简化的边界"
            >
                <Stack>
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
                                    <td className="py-2 pr-4 font-mono">custom-hooks/lib/*</td>
                                    <td className="py-2">8 个原子 Hook + renderHook 契约测试 + barrel 导出</td>
                                </tr>
                                <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                    <td className="py-2 pr-4 font-mono">custom-hooks/playground/*</td>
                                    <td className="py-2">原子演练页:每个 Hook 一个可交互最小场景</td>
                                </tr>
                                <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                    <td className="py-2 pr-4 font-mono">custom-hooks/composition/mockUserApi.ts</td>
                                    <td className="py-2">mock 搜索接口:随机延迟 / AbortSignal / 失败注入</td>
                                </tr>
                                <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                    <td className="py-2 pr-4 font-mono">custom-hooks/composition/useUserSearch.ts</td>
                                    <td className="py-2">领域 Hook:三层组合 + 请求日志内聚</td>
                                </tr>
                                <tr>
                                    <td className="py-2 pr-4 font-mono">custom-hooks/guide/*</td>
                                    <td className="py-2">本页:原则、组合思路与落地实践</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <P>
                        刻意简化的边界:useRequest 未实现缓存 / 去重 / 分页 / 轮询
                        (生产可参照 ahooks / SWR 的完整能力);mockUserApi
                        用模块级开关注入失败而非 MSW;useMediaQuery 的
                        getServerSnapshot 固定 false(本仓库为纯 CSR)。这些简化
                        不影响本文所述原则 —— 每条的「正确做法」都在 lib/ 真实代码里。
                    </P>
                </Stack>
            </TopicSection>
        </TopicPage>
    );
});

CustomHooksGuide.displayName = 'CustomHooksGuide';

export default CustomHooksGuide;
