/**
 * ============================================================================
 * 渲染调度深入梳理(/performance/render-scheduling-guide)
 * ============================================================================
 *
 * 围绕本专题 performance/ 的真实实现,系统梳理客户端渲染任务调度:
 * 并发渲染心智模型、useTransition / useDeferredValue / Suspense
 * 三件套协作模型、渲染竞态场景目录与工程实践细节。
 * 边界声明:不涉 SSR / 架构级渲染策略(属「性能优化」系列第一专题)。
 *
 * @module topics/performance/render-scheduling-guide
 */

import { memo } from 'react';
import type { ReactNode } from 'react';

import { TopicPage, TopicSection } from '../../../components/TopicPage';
import { CodeBlock } from '../../../components/CodeBlock';
import { Diagram } from '../../../components/Diagram';
import { NavBanner } from '../transition-deferred/components/NavBanner';

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

const RenderSchedulingGuide = memo(() => {
    return (
        <TopicPage
            title="渲染调度深入梳理"
            description="紧急 vs 非紧急的分类思维,Suspense × transition × deferred 的分工协作 —— 以本专题 performance/ 实现为样本"
        >
            <NavBanner current="guide" />

            {/* ---------- 1. 问题的本质 ---------- */}
            <TopicSection
                title="1. 问题的本质"
                note="同步渲染的阻塞模型;16.6ms 帧预算;INP 指标"
            >
                <Stack>
                    <P>
                        React 默认的渲染是同步的:一次 setState 触发的渲染会一口气跑完整棵
                        受影响子树,期间主线程被占满,输入、点击、动画全部排队。浏览器要维持
                        60fps,每帧预算只有约 16.6ms —— 一次 500ms 的昂贵渲染意味着
                        30 帧里用户看到的是一个完全冻结的页面。
                    </P>
                    <Diagram caption="同步渲染阻塞(对照演示页场景一同步模式)">
                        {`击键 → setState → 同步渲染 5000 项 SlowList(500ms)
                      ↓ 期间主线程占满
              第二次击键 → 排队等待 → 输入框迟迟不回显

INP(Interaction to Next Paint)衡量的正是
「交互 → 下一帧绘制」的延迟,它直接决定用户对「卡」的感知`}
                    </Diagram>
                    <P>
                        本专题 lab/SlowList.tsx 用 busyWork 人为制造可控的昂贵渲染,
                        lab/useFrameStats.ts + FrameMeter 把每帧耗时画成条图 ——
                        卡不卡,先看帧条,再谈优化。
                    </P>
                </Stack>
            </TopicSection>

            {/* ---------- 2. 并发渲染心智模型 ---------- */}
            <TopicSection
                title="2. 并发渲染心智模型"
                note="可中断 / 可恢复渲染;更新优先级(lanes 概念级)"
            >
                <Stack>
                    <P>
                        并发渲染的核心不是「同时渲染两棵树」,而是「渲染可以被
                        打断、让位、恢复、抛弃」。React 内部用 lanes(车道)给更新
                        分配优先级:紧急更新(输入回显)走快车道,立即渲染;
                        非紧急更新(昂贵列表)走慢车道,可中断 ——
                        每次让出主线程,浏览器就能处理一次输入、绘制一帧。
                    </P>
                    <Diagram caption="同一棵组件树,两条车道">
                        {`紧急更新(输入值)      ──→ 立即渲染、立即提交
非紧急更新(过滤列表)  ──→ 开始渲染 → 让位 → 恢复 → 就绪后提交
                              ↑ 期间若有新的紧急更新,慢车道渲染被打断重来`}
                    </Diagram>
                    <P>
                        注意:并发渲染不减少工作量,它只重排工作的执行时机。
                        列表还是要渲染 5000 项,只是不再挡在输入前面 ——
                        这是理解后续所有手段的前提。
                    </P>
                </Stack>
            </TopicSection>

            {/* ---------- 3. 紧急 vs 非紧急更新 ---------- */}
            <TopicSection
                title="3. 紧急 vs 非紧急更新"
                note="分类思维是全部手段的前提"
            >
                <Stack>
                    <P>
                        使用任何调度手段前,先回答:这个更新,用户期待它「立刻」
                        还是「尽快」?输入回显、点击反馈、选中态 —— 紧急,
                        延迟 50ms 都能被感知;过滤结果、Tab 内容、统计数字 ——
                        非紧急,晚几百毫秒无所谓,只要别卡住前者。
                    </P>
                    <CodeBlock
                        title="transition-deferred/components/InputLagDemo.tsx(节选)"
                        code={`markInput();
setKeyword(value);                       // 紧急:输入回显
if (mode === 'transition') {
    startTransition(() => setListKeyword(value)); // 非紧急:昂贵列表渲染
}`}
                    />
                </Stack>
            </TopicSection>

            {/* ---------- 4. useTransition ---------- */}
            <TopicSection
                title="4. useTransition"
                note="API、isPending 语义、适用判据"
            >
                <Stack>
                    <CodeBlock
                        code={`const [isPending, startTransition] = useTransition();

startTransition(() => {
    setListKeyword(value); // 这个状态更新被标为非紧急
});
// isPending:存在尚未提交的非紧急渲染 → 驱动「旧 UI 仍在追赶」的反馈`}
                    />
                    <P>
                        语义要点:被 transition 包裹的更新如果触发昂贵渲染,React
                        会先保持当前 UI(旧状态),在后台准备新 UI,就绪后一次性提交;
                        isPending 在这期间为 true。适用判据:状态在你手里(本地
                        useState/useReducer),且更新会触发昂贵渲染。不适用的情形
                        见第 10 节常见误用。
                    </P>
                </Stack>
            </TopicSection>

            {/* ---------- 5. useDeferredValue ---------- */}
            <TopicSection
                title="5. useDeferredValue"
                note="与 transition 的等价关系;与防抖/节流的本质区别"
            >
                <Stack>
                    <CodeBlock
                        code={`const deferredKeyword = useDeferredValue(keyword);
// 紧急渲染中 deferredKeyword 先返回旧值,
// React 在后台用新值重试渲染,就绪后提交;
// 滞后期间 deferredKeyword !== keyword → StaleBadge 的依据`}
                    />
                    <P>
                        与 transition 的等价:底层是同一种调度。选择依据是
                        「你能改哪一端」—— 状态由你 set 的,用 transition 包
                        set 动作;值来自 props / 上游(改不了别人的 set),用
                        deferred 包值本身。
                    </P>
                    <P>
                        与防抖/节流的本质区别:防抖是「延迟工作的开始」(按时间
                        截流),deferred 是「重排工作的优先级」(立刻开始,但可
                        被紧急更新打断)。防抖在低端机上依旧卡顿,只是卡得少;
                        deferred 在高端机上几乎无感,在低端机上差异反而更明显 ——
                        工作没有变少,但永远让位于输入。
                    </P>
                </Stack>
            </TopicSection>

            {/* ---------- 6. 三件套协作模型(核心章节) ---------- */}
            <TopicSection
                title="6. Suspense × transition × deferred 协作模型"
                note="核心章节:三者是分工协作关系,不存在「二选一」"
            >
                <Stack>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-gray-100 text-gray-400 dark:border-slate-800 dark:text-slate-500">
                                    <th className="py-2 pr-4 font-medium">手段</th>
                                    <th className="py-2 pr-4 font-medium">管什么</th>
                                    <th className="py-2 font-medium">不管什么</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 dark:text-slate-300">
                                <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                    <td className="py-2 pr-4 font-mono">Suspense</td>
                                    <td className="py-2 pr-4">资源未就绪时的声明式 UI(初始骨架 / 边界)</td>
                                    <td className="py-2">不调度更新时机、不减少渲染工作量</td>
                                </tr>
                                <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                    <td className="py-2 pr-4 font-mono">useTransition</td>
                                    <td className="py-2 pr-4">把本地状态更新标为非紧急,保留旧 UI,isPending 反馈</td>
                                    <td className="py-2">不处理资源等待本身</td>
                                </tr>
                                <tr>
                                    <td className="py-2 pr-4 font-mono">useDeferredValue</td>
                                    <td className="py-2 pr-4">让派生值滞后于输入,配合 stale 视觉反馈</td>
                                    <td className="py-2">不发起 / 取消任何工作</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <Diagram caption="组合范式:三种典型时刻各用哪几件套">
                        {`初始加载   = Suspense 骨架(场景 0)
条件切换   = transition 保持旧 UI + Suspense 等待新资源(场景 1、Tab 切换)
派生渲染   = deferred 滞后 + stale 反馈(场景一、场景三)`}
                    </Diagram>
                    <P>
                        逐场景对照:Tab 切换场景(三件套)—— transition
                        管更新时机(点击后当前 Tab 保持可交互),Suspense 管资源等待
                        (首次进入出骨架),chunk 缓存后 transition 只负责调度;
                        回退闪烁场景(二件套)—— 同一边界、两种时机,初始骨架归
                        Suspense,更新保持旧 UI 归 transition;输入阻塞场景
                        (deferred / transition)—— 无资源等待,Suspense 不出场;
                        stale 结果场景 —— deferred 管展示层滞后,请求竞态归
                        数据层(序号 + AbortController)。明确反对「只选一个」的
                        误读:它们各管一段,组合才是完整答案。
                    </P>
                </Stack>
            </TopicSection>

            {/* ---------- 7. 渲染竞态场景目录 ---------- */}
            <TopicSection
                title="7. 渲染竞态场景目录"
                note="症状 → 根因 → 手段,逐行标注协作组合"
            >
                <Stack>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-gray-100 text-gray-400 dark:border-slate-800 dark:text-slate-500">
                                    <th className="py-2 pr-4 font-medium">场景</th>
                                    <th className="py-2 pr-4 font-medium">症状 / 根因</th>
                                    <th className="py-2 font-medium">手段(协作组合)</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 dark:text-slate-300">
                                <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                    <td className="py-2 pr-4">输入阻塞</td>
                                    <td className="py-2 pr-4">击键卡顿 / 昂贵渲染同步执行</td>
                                    <td className="py-2">deferred 或 transition(二选一即可,语义相同)</td>
                                </tr>
                                <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                    <td className="py-2 pr-4">Tab 切换</td>
                                    <td className="py-2 pr-4">点击后整页冻结 / 同步切到重型子树</td>
                                    <td className="py-2">lazy + Suspense + transition 三件套</td>
                                </tr>
                                <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                    <td className="py-2 pr-4">stale 结果</td>
                                    <td className="py-2 pr-4">旧响应覆盖新结果 / 数据层乱序</td>
                                    <td className="py-2">deferred(展示层)+ 序号 / AbortController(数据层)</td>
                                </tr>
                                <tr>
                                    <td className="py-2 pr-4">回退闪烁</td>
                                    <td className="py-2 pr-4">更新时内容瞬消 / 同步更新触发边界回退</td>
                                    <td className="py-2">Suspense + transition(保持旧 UI)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Stack>
            </TopicSection>

            {/* ---------- 8. 设计原则 ---------- */}
            <TopicSection
                title="8. 设计原则"
                note="先测量后优化;memo 减工作量 vs transition 调优先级,互不替代"
            >
                <Stack>
                    <P>
                        先测量后优化:用 React Profiler 找到真正昂贵的子树,
                        用帧条图(lab/FrameMeter)确认瓶颈在渲染而非网络。
                        没有数据的优化只是仪式。
                    </P>
                    <P>
                        两条正交的优化轴:memo / useMemo / 虚拟列表减少
                        「工作量」;transition / deferred 调整「工作时机」。
                        渲染 10 万行列表,transition 只让卡顿移出输入路径,
                        总量没变,虚拟列表才是解;反之已经很快的组件,
                        memo 只是徒增复杂度。二者互不替代,按瓶颈各选各的。
                    </P>
                </Stack>
            </TopicSection>

            {/* ---------- 9. 工程实践 ---------- */}
            <TopicSection
                title="9. 工程实践"
                note="isPending 的 UX 规范;StaleBadge 模式;骨架形似原则;边界粒度原则"
            >
                <Stack>
                    <P>
                        isPending 的 UX 规范:旧 UI 降透明度 / 角落小指示
                        (本专题全部场景的写法),绝不用 spinner 替换内容 ——
                        那等于自己实现了「回退闪烁」。StaleBadge 模式:
                        deferred 值滞后期间显式标注「结果滞后中」
                        (InputLagDemo),滞后是刻意的调度结果,但要让用户知情。
                    </P>
                    <P>
                        骨架形似原则:fallback 要与最终布局同构(尺寸、结构
                        对齐),否则加载完成瞬间发生布局位移,骨架反而成了
                        二次打扰(对照 suspense-ui 的 ResultSkeleton / DocSkeleton)。
                        边界粒度原则:按数据依赖与视觉区块划分(场景 2),
                        不是越细越好 —— 每个边界都是一次独立的「等待 → 替换」,
                        过细会出现此起彼伏的骨架海。
                    </P>
                </Stack>
            </TopicSection>

            {/* ---------- 10. 常见误用 ---------- */}
            <TopicSection
                title="10. 常见误用"
                note="五条高频错误,每条错误 / 正确对照"
            >
                <Stack>
                    <CodeBlock
                        title="① 把 transition 当银弹:渲染本身昂贵时,memo / 虚拟列表才是解"
                        code={`// ✗ 错误:10 万行列表指望 transition 救命 —— 工作量没变,只是挪了时机
startTransition(() => setShowHugeList(true));
// ✓ 正确:先减工作量(虚拟列表),再谈调度;两轴正交(第 8 节)`}
                    />
                    <CodeBlock
                        title="② 把 deferred 用在受控输入本身:输入回显必须同步"
                        code={`// ✗ 错误:输入框绑定 deferred 值,打字会「慢半拍」
<input value={deferredKeyword} />
// ✓ 正确:输入框绑定原值,昂贵派生(列表)才用 deferred 值
<input value={keyword} /> <SlowList keyword={deferredKeyword} />`}
                    />
                    <CodeBlock
                        title="③ 在 transition 回调里做昂贵计算:它只调度渲染,不调度计算"
                        code={`// ✗ 错误:昂贵同步计算照样阻塞 —— startTransition 不搬运 CPU 工作
startTransition(() => { const r = heavyCompute(data); setResult(r); });
// ✓ 正确:计算移出(Web Worker / 分片 / 缓存),transition 只管渲染提交`}
                    />
                    <CodeBlock
                        title="④ 指望 transition 降低外部 Store 更新优先级(回扣 Agent 专题)"
                        code={`// ✗ 误解:useSyncExternalStore 订阅的更新可以包进 transition 延后
// ✓ 事实:为保证一致性,React 会把相关 transition 回退为阻塞更新;
//   外部 Store 的降频要做在发布节奏上(见 Agent 专题梳理页第 8 节)`}
                    />
                    <CodeBlock
                        title="⑤ 以为 deferred / transition 能保护首挂载:它们只调度「更新」"
                        code={`// ✗ 后果:页面进入时同步挂载 5000 项昂贵列表,首屏本身卡死
//   (本专题 InputLagDemo 曾真实踩过:deferred 模式下进入页面依然卡)
// ✓ 正确:首屏先交付可交互区域,昂贵子树经 startTransition 低优先级挂载
const [mounted, setMounted] = useState(false);
useEffect(() => {
    startTransition(() => setMounted(true)); // 首帧之后、可中断
}, []);`}
                    />
                </Stack>
            </TopicSection>

            {/* ---------- 11. 边界与定位 ---------- */}
            <TopicSection
                title="11. 边界与定位"
                note="本专题只解决客户端渲染调度"
            >
                <Stack>
                    <P>
                        「性能优化」系列第一专题是架构 / SSR 渲染策略(渲染在哪里
                        发生:SSR / SSG / CSR / 流式),本专题是第二专题(渲染任务
                        在客户端如何排期)。二者分工:第一专题决定「多少 HTML /
                        JS 要送达、首屏谁先」;本专题决定「送达之后,交互中的
                        昂贵更新如何不卡住输入」。SSR 解决不了的交互期卡顿,
                        正是 transition / deferred / Suspense 的战场;反过来,
                        本专题手段也无法替代合理的渲染架构。
                    </P>
                </Stack>
            </TopicSection>

            {/* ---------- 12. 测试与度量 ---------- */}
            <TopicSection
                title="12. 测试与度量"
                note="对照本专题真实测试文件;Profiler 与 INP"
            >
                <Stack>
                    <P>
                        transition / deferred 的行为可以测试,关键思路是断言
                        「中间态与终态」而非内部实现:
                    </P>
                    <CodeBlock
                        title="transition-deferred/index.test.tsx(节选)"
                        code={`// 渲染序列中必然存在「输入已变、deferred 值未追上」的中间态
const lagFrame = snapshots.find((s) => s.keyword === 'ab' && s.listKeyword === '');
expect(lagFrame).toBeTruthy();
// 最终一致:最后一次渲染二者相同
expect(snapshots.at(-1)).toEqual({ keyword: 'ab', listKeyword: 'ab' });`}
                    />
                    <CodeBlock
                        title="suspense-ui/index.test.tsx(节选)"
                        code={`// transition 模式:更新期间旧内容保持,fallback 不出现
fireEvent.click(screen.getByText('查询「render」'));
expect(screen.getByText('结果:cache')).toBeInTheDocument();
expect(screen.queryByLabelText('查询结果骨架')).not.toBeInTheDocument();`}
                    />
                    <P>
                        慢渲染组件在测试中统一 perItemCost 传 0,验证的是调度
                        语义而不是真的卡。度量侧:开发期用 React Profiler
                        定位昂贵子树,线上用 INP(Web Vitals)跟踪交互延迟,
                        帧条图(lab/FrameMeter)则是演示与教学场景的轻量替代。
                    </P>
                </Stack>
            </TopicSection>

            {/* ---------- 13. 本演练设计说明 ---------- */}
            <TopicSection
                title="13. 本演练设计说明"
                note="文件映射、教学装置与刻意简化;三页互链见页头横幅"
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
                                    <td className="py-2 pr-4 font-mono">lab/slow.ts + SlowList.tsx</td>
                                    <td className="py-2">可控昂贵渲染道具(busyWork × 条目数)</td>
                                </tr>
                                <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                    <td className="py-2 pr-4 font-mono">lab/useFrameStats.ts + FrameMeter.tsx</td>
                                    <td className="py-2">rAF 帧耗时 / 输入延迟采样与条图可视化</td>
                                </tr>
                                <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                    <td className="py-2 pr-4 font-mono">lab/resource.ts</td>
                                    <td className="py-2">wrapPromise:Suspense 三态协议教学道具</td>
                                </tr>
                                <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                    <td className="py-2 pr-4 font-mono">lab/mockSearchApi.ts</td>
                                    <td className="py-2">随机延迟 + AbortSignal 的搜索接口(响应回显关键字)</td>
                                </tr>
                                <tr className="border-b border-gray-50 dark:border-slate-800/60">
                                    <td className="py-2 pr-4 font-mono">transition-deferred/*</td>
                                    <td className="py-2">输入阻塞 / Tab 三件套 / stale 结果三场景</td>
                                </tr>
                                <tr>
                                    <td className="py-2 pr-4 font-mono">suspense-ui/*</td>
                                    <td className="py-2">初始骨架 / 回退闪烁 / 边界粒度三场景</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <P>
                        刻意简化:FrameMeter 只做演示级采样(生产用 Profiler /
                        Performance API);wrapPromise 不带缓存与失效(生产用
                        框架数据层);stale 场景的无保护模式刻意让短关键字响应更慢,
                        以稳定复现乱序。每条简化都不影响本文所述调度语义 ——
                        正确做法都在 lab/ 与两个演示页的真实代码里。
                    </P>
                </Stack>
            </TopicSection>
        </TopicPage>
    );
});

RenderSchedulingGuide.displayName = 'RenderSchedulingGuide';

export default RenderSchedulingGuide;
