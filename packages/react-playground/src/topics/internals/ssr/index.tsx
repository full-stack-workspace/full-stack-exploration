/**
 * ============================================================================
 * 内部机制 · SSR 与水合(/internals/ssr)
 * ============================================================================
 *
 * 本练习场是 createRoot 的客户端应用,不能在这里跑 hydrateRoot。
 * 这一页只讲服务端渲染和水合的数据流,以及它和 RSC 的差别。
 *
 * @module topics/internals/ssr
 */

import { memo } from 'react';
import { Link } from 'react-router-dom';

import { TopicPage, TopicSection } from '../../../components/TopicPage';
import { Diagram } from '../../../components/Diagram';
import { P, Stack } from '../components/Prose';
import { SeriesNav } from '../components/SeriesNav';

const SsrPage = memo(() => {
    return (
        <TopicPage
            title="内部机制 · SSR 与水合"
            description="服务端先产出 HTML,客户端用 hydrateRoot 把已有 DOM 绑到 Fiber 上。这一页是示意:练习场没有服务端渲染"
        >
            <SeriesNav current="ssr" />

            <TopicSection
                title="1. 这一页为什么没有可运行的水合"
                note="讲解要点:入口是 createRoot。水合需要服务端已经写出带标记的 HTML,再在同一段 DOM 上挂 Fiber。"
            >
                <Stack>
                    <P>
                        练习场在浏览器里用 `createRoot` 从空容器挂上整棵树,DOM 全部由客户端创建。`hydrateRoot` 要求容器里已经有和服务端渲染一致的子节点,它会复用这些节点,而不是再 `createElement` 一遍。这里没有服务端这次输出,所以演示会变成「再讲一遍 createRoot」。下面用数据流把两端对齐。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="2. 服务端:边渲染边把 HTML 推出去"
                note="讲解要点:renderToPipeableStream 遇到 Suspense 可以先把壳推走,等数据到了再补上那一块。"
            >
                <Stack>
                    <Diagram caption="流式 SSR">
                        {`请求
  │
  ▼
renderToPipeableStream(element)
  │
  ├─ 已经算完的壳  → 写入响应(用户先看到布局)
  │
  ├─ Suspense 边界还在等数据
  │     先输出 fallback 的 HTML,并留下可以替换的标记
  │
  └─ 数据到了 → 再推一段 HTML + 一段内联脚本
        浏览器把 fallback 换成真实内容

客户端还没执行 React,字已经在页面上。`}
                    </Diagram>
                    <P>
                        这仍然是「组件在服务端执行,产出 HTML」。组件函数会跑,只是宿主不是 DOM,而是能输出标记的渲染器。`useEffect` 不会在服务端跑,它是提交之后、绘制之后的客户端生命周期。`useLayoutEffect` 在服务端没有布局可读,服务端渲染里出现它,React 会警告。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="3. 水合:把现有 DOM 绑到 Fiber,而不是重画"
                note="讲解要点:hydrateRoot 走和客户端渲染相似的 beginWork,但 completeWork 复用节点并核对文本。对不上就报水合失败。"
            >
                <Stack>
                    <Diagram caption="hydrateRoot(container, element)">
                        {`已有 DOM                         新建的 Fiber
  <div id="root">                  HostRoot
    <h1>标题</h1>   ←── stateNode ──  h1 Fiber
    <p>正文</p>     ←── stateNode ──  p Fiber

核对:标签、文本、属性是否和服务端输出一致
一致 → 复用节点,挂上事件监听(事件本来就不在 HTML 里)
不一致 → React 19 把不匹配收成一次错误,并用客户端渲染换掉那棵子树

选择性水合:
  Suspense 的内容稍后到达时,优先水合用户正在点击的那一块`}
                    </Diagram>
                    <P>
                        HTML 里没有事件监听。水合完成前,React 会把提前发生的点击先记下,等对应 Fiber 绑好再重放。所以「字先出来、按钮稍后再能点」是这套模型的正常间隙,不是网络又加载了一个按钮组件那么简单:按钮的 DOM 可以已经在,监听还要等水合走到它。
                    </P>
                    <P>
                        React 19 对水合不匹配会在开发环境给出一次错误,并在客户端重渲那棵对不上的子树,避免整页卡在半水合状态。重渲能恢复交互,但服务端白做的那一段 HTML 被扔掉了,原因(日期、随机数、非法 HTML 嵌套)仍然要修。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="4. 和 RSC 不是同一条管线"
                note="讲解要点:SSR 的组件在服务端执行并产出 HTML。RSC 产出的是描述 UI 的载荷,客户端组件仍然在浏览器里执行。"
            >
                <Stack>
                    <Diagram caption="两种「在服务器上」">
                        {`SSR / 水合
  同一套组件 → HTML → hydrateRoot → 客户端再执行这套组件

RSC
  服务器组件 → 载荷(不含水合所需的客户端逻辑)
  客户端组件 → 仍然在浏览器执行,可以再被 SSR 预渲染成 HTML

没有 RSC 也可以 SSR。
有 RSC 时,服务器组件不会在浏览器里再跑一遍。`}
                    </Diagram>
                    <P>
                        选型、边界和「练习场为什么跑不了服务器组件」在
                        <Link className="mx-1 text-cyan-700 underline underline-offset-2 dark:text-cyan-300" to="/advanced/rsc-guide">
                            RSC 梳理
                        </Link>
                        。本页只固定一件事:水合绑定的是已经写成 HTML 的那棵树,RSC 载荷本身不是 HTML。
                    </P>
                </Stack>
            </TopicSection>
        </TopicPage>
    );
});

SsrPage.displayName = 'SsrPage';

export default SsrPage;
