/**
 * ============================================================================
 * RSC · 深度梳理(/advanced/rsc-guide)
 * ============================================================================
 *
 * React Server Components 是组件的另一种执行环境,不是 SSR 的别名。
 * 本页讲清它是什么、解决什么、和 Client Component 如何咬合、
 * 生产里何时选用,以及边界与序列化上的注意项。
 * 练习场没有 Server 运行时,不执行 RSC。
 *
 * @module topics/advanced/rsc/guide
 */

import { memo } from 'react';
import type { ReactNode } from 'react';

import { TopicPage, TopicSection } from '../../../../components/TopicPage';
import { CodeBlock } from '../../../../components/CodeBlock';
import { Diagram } from '../../../../components/Diagram';
import { FlowList, type FlowStep } from '../../../../components/FlowList';
import { TopicNav } from '../../../../components/TopicNav';
import { RSC_NAV_LINKS, RSC_NAV_NOTE, RSC_NAV_TITLE } from '../nav';
import { RelatedTopics } from '../../../basics/fn-vs-class/components/RelatedTopics';

const P = ({ children }: { children: ReactNode }) => (
    <p className="text-sm leading-relaxed text-gray-600 dark:text-slate-300">{children}</p>
);

const Stack = ({ children }: { children: ReactNode }) => <div className="space-y-3">{children}</div>;

const REQUEST_STEPS: FlowStep[] = [
    {
        title: 'Server Component 在服务器上执行',
        hint: '可以 async,可以直接读数据库、文件和密钥。函数本身不会打进浏览器包',
        tone: 'render',
    },
    {
        title: '产出 RSC 载荷,不是一份「只有 HTML」',
        hint: '载荷描述元素树。遇到 Client Component,留下槽位和可序列化的 props',
        tone: 'commit',
    },
    {
        title: '可选:同一棵树再渲染成 HTML',
        hint: '这是 SSR。Client Component 也会在服务器上预渲染成 HTML,然后到浏览器里 hydrate',
        tone: 'paint',
    },
    {
        title: '浏览器只 hydrate 客户端边界',
        hint: '状态、事件、effect 从这里开始。Server Component 不会在点击时于浏览器里再跑一遍',
        tone: 'effect',
    },
];

const RscGuide = memo(() => {
    return (
        <TopicPage
            title="RSC · 深度梳理"
            description="Server Component 在服务器上执行并留下载荷;Client Component 才拥有状态和事件。二者靠边界和 children 槽组合,不是二选一"
        >
            <TopicNav
                title={RSC_NAV_TITLE}
                links={RSC_NAV_LINKS}
                current="/advanced/rsc-guide"
                category="advanced"
                note={RSC_NAV_NOTE}
            />

            <TopicSection
                title="1. 先把三个名字分开"
                note="讲解要点:RSC、SSR、Client Component 回答的是不同问题。混成「服务端渲染」会在选型和排错时走错层。"
            >
                <Stack>
                    <Diagram caption="三种机制各管一件事">
                        {`SSR
  把一棵 React 树渲染成 HTML,加快首屏。
  树里可以全是 Client Component。没有 RSC 也能 SSR。

RSC(React Server Components)
  一种组件。它的函数在服务器(或构建期)执行,
  实现不进入浏览器包,结果放进 RSC 载荷。

Client Component
  带 'use client' 边界的组件。可以有状态、事件、浏览器 API。
  在支持 SSR 的框架里,它仍会先在服务器上渲染成 HTML,再 hydrate。
  'use client' 的意思是「从此进入客户端模块图」,不是「只在浏览器跑」。`}
                    </Diagram>
                    <P>
                        本仓库里真正能跑这套模型的是 <code className="font-mono text-[11px]">packages/next-playground</code>
                        (Next.js App Router:没有指令的模块默认是 Server Component)。
                        react-playground 只有 <code className="font-mono text-[11px]">react-dom/client</code> 的{' '}
                        <code className="font-mono text-[11px]">createRoot</code>,所有专题页都是 Client Component。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="2. RSC 是什么"
                note="讲解要点:它仍是 React 组件,输入 props、返回 React 元素。差别是执行地点和产物。产物是给客户端运行时消费的载荷,组件函数留在服务器。"
            >
                <Stack>
                    <P>
                        传统组件(本练习场的全部页面)在浏览器里执行:打包器把函数放进 JS,用户交互后再调用它。
                        Server Component 在请求时或构建时执行。浏览器收到的是已经展开的 UI 描述,外加若干客户端槽位。
                        改客户端 state 不会重新调用 Server Component;要新的服务端结果,需要一次导航、
                        <code className="mx-1 font-mono text-[11px]">router.refresh</code>
                        或 Server Action 之后的刷新。
                    </P>
                    <FlowList steps={REQUEST_STEPS} />
                    <P>
                        框架负责把两端接上(Next.js、React Router 的 RSC 模式等)。只安装{' '}
                        <code className="font-mono text-[11px]">react</code> 不会凭空出现服务器。
                        还需要能区分 <code className="font-mono text-[11px]">react-server</code> 条件导出的打包器,以及 Flight 协议的运行时。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="3. 它解决什么,用在什么场景"
                note="讲解要点:价值是「这段 UI 的实现和秘密不必到浏览器」,以及「取数可以写在要用它的组件旁边」。不是为了让点击更快。"
            >
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-600 dark:text-slate-300">
                    <li>
                        <strong className="font-medium text-gray-800 dark:text-slate-100">数据靠着 UI 读。</strong>
                        异步 Server Component 可以直接 <code className="font-mono text-[11px]">await</code> 查询。
                        只读正文、价格、权限裁剪后的菜单,不必先在客户端 <code className="font-mono text-[11px]">useEffect</code> 再请求一遍。
                    </li>
                    <li>
                        <strong className="font-medium text-gray-800 dark:text-slate-100">密钥和重库留在服务器。</strong>
                        数据库连接、未公开的环境变量、只为把 Markdown / 代码高亮渲染成 HTML 的解析器,可以不进包。
                    </li>
                    <li>
                        <strong className="font-medium text-gray-800 dark:text-slate-100">慢数据单独流。</strong>
                        父级用 Suspense 包住慢的 Server Component,壳和快的区域先到,慢的区域后补进载荷。
                    </li>
                    <li>
                        <strong className="font-medium text-gray-800 dark:text-slate-100">不适合包办交互。</strong>
                        输入、选中、拖拽、订阅浏览器事件、依赖 <code className="font-mono text-[11px]">window</code> 的图,仍然是 Client Component。
                    </li>
                </ul>
            </TopicSection>

            <TopicSection
                title="4. 和 Client Component 的区别"
                note="讲解要点:对照的是执行环境、包和能力,不是「高级组件 vs 低级组件」。多数页面是一棵混合树。"
            >
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[36rem] text-left text-xs">
                        <thead>
                            <tr className="border-b border-gray-100 text-gray-400 dark:border-slate-800">
                                <th className="py-2 pr-3 font-medium"> </th>
                                <th className="py-2 pr-3 font-medium">Server Component</th>
                                <th className="py-2 font-medium">Client Component</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 dark:text-slate-300">
                            <tr className="border-b border-gray-50 dark:border-slate-800/80">
                                <td className="py-2 pr-3 font-medium text-gray-800 dark:text-slate-100">函数在哪执行</td>
                                <td className="py-2 pr-3">服务器或构建期,每次请求(或缓存命中)一次</td>
                                <td className="py-2">浏览器里随 state 再次执行;SSR 时也会在服务器预渲染 HTML</td>
                            </tr>
                            <tr className="border-b border-gray-50 dark:border-slate-800/80">
                                <td className="py-2 pr-3 font-medium text-gray-800 dark:text-slate-100">实现进不进包</td>
                                <td className="py-2 pr-3">不进。进载荷的是渲染结果</td>
                                <td className="py-2">进。文件和它 import 的模块组成客户端图</td>
                            </tr>
                            <tr className="border-b border-gray-50 dark:border-slate-800/80">
                                <td className="py-2 pr-3 font-medium text-gray-800 dark:text-slate-100">数据与密钥</td>
                                <td className="py-2 pr-3">可以直接 await 数据源</td>
                                <td className="py-2">只能拿到序列化后的 props,或自己再发请求</td>
                            </tr>
                            <tr className="border-b border-gray-50 dark:border-slate-800/80">
                                <td className="py-2 pr-3 font-medium text-gray-800 dark:text-slate-100">状态与事件</td>
                                <td className="py-2 pr-3">不能 useState / useEffect / onClick</td>
                                <td className="py-2">可以。交互叶子放这里</td>
                            </tr>
                            <tr>
                                <td className="py-2 pr-3 font-medium text-gray-800 dark:text-slate-100">指令</td>
                                <td className="py-2 pr-3">支持 RSC 的框架里,无指令即 Server</td>
                                <td className="py-2">文件首行 &apos;use client&apos;</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </TopicSection>

            <TopicSection
                title="5. 关联:边界只能单向 import,组合靠槽"
                note="讲解要点:Server 可以渲染 Client 并传入可序列化 props。Client 不能 import Server。要在客户端壳里显示服务端 UI,让 Server 父组件把那段 UI 当作 children 传下来。"
            >
                <Stack>
                    <Diagram caption="谁能引用谁">
                        {`Server 父组件
  ├─ import Client 按钮          可以,props 必须可序列化
  ├─ import 另一个 Server 组件   可以,包括 async
  └─ <ClientShell>               壳是 Client
        {children}               children 由 Server 父组件事先创建
     </ClientShell>

Client 文件
  └─ import Server 组件          不可以。构建直接失败`}
                    </Diagram>
                    <CodeBlock
                        title="Server 父组件把推荐填进客户端壳"
                        code={`// page.tsx — Server Component
import { FilterShell } from './filter-shell';
import { Recs } from './recs';

export default async function Page({ id }: { id: string }) {
    return (
        <FilterShell productId={id}>
            <Recs productId={id} />
        </FilterShell>
    );
}`}
                    />
                    <CodeBlock
                        title="filter-shell.tsx — 只有壳进入客户端包"
                        code={`'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';

export function FilterShell({
    productId,
    children,
}: {
    productId: string;
    children: ReactNode;
}) {
    const [size, setSize] = useState('M');
    return (
        <section>
            <button type="button" onClick={() => setSize('L')}>
                {productId} / {size}
            </button>
            {children}
        </section>
    );
}`}
                    />
                    <P>
                        传过边界的 props 必须能被 Flight 序列化:普通对象、数组、字符串、数字,以及 Date、Map、Set 等协议支持的类型,
                        还有 <code className="font-mono text-[11px]">&apos;use server&apos;</code> 的函数引用(Server Action)。
                        不能传事件处理函数、类实例、DOM 节点。React 19 里也可以把 Promise 传给客户端,再用{' '}
                        <code className="font-mono text-[11px]">use()</code> 读取。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="6. 生产选型:按顺序问四件事"
                note="讲解要点:先确认宿主真的会跑 Server Component,再看下一次更新谁触发、实现能不能出现在浏览器、服务器离数据有多近。顺序反了就会为了一个按钮讨论数据库。"
            >
                <Stack>
                    <Diagram caption="四问,上一问否掉了就不用往下">
                        {`1 这段代码跑在有 RSC 运行时的宿主里吗?
     否 → Vite / Rsbuild SPA、本练习场、Storybook、要发到 npm 的库
           写成普通组件。文件头不要写自己不会执行的指令。
     是 → Next.js App Router,或明确打开了 RSC 的框架。继续。

2 下一次界面变化由谁触发?
     浏览器里的 state(每个按键、拖拽、播放头)
        → Client Component。Server 不会跟着 setState 再执行。
     下一次请求(导航、searchParams、cookie、刷新)
        → 可以是 Server Component。继续。

3 计算过程或原始数据能不能出现在浏览器?
     不能(密钥、未授权的行、只存在于服务器的 SDK)
        → Server Component。只把用户该看见的结果放进载荷。
     能,而且接下来还要在本地接着算(小列表筛选、图表 hover)
        → 服务器取数,把可序列化结果交给 Client 叶子。
     能,但模块只为生成标记且很大(markdown、语法高亮)
        → 优先留在服务器,避免进包。

4 服务器离数据近不近?
     同区域、同一信任边界里的数据库 → await 在 Server Component 里,少一次浏览器往返。
     服务器只是再去调一个浏览器本来就能访问的公开 HTTP,而且函数冷启动很远
        → 先量延迟。RSC 去掉的是包和重复请求,不会把远距离调用变近。`}
                    </Diagram>
                    <P>
                        第一问把「选不选 RSC」和「这个仓库能不能跑 RSC」分开。本练习场和纯客户端脚手架没有 Flight 运行时,讨论边界只会得到一份永远不会在服务器执行的文件。组件库同理:库不知道调用方有没有服务器,取数留在应用的 Server Component,库组件保持在客户端也能渲染。
                    </P>
                    <P>
                        第二问决定刷新模型。Server Component 在一次请求(或一次构建)里执行完,结果写入载荷。用户随后在浏览器里{' '}
                        <code className="font-mono text-[11px]">setState</code>,重跑的是 Client 子树。商品正文不会因为规格按钮的本地 state 再去查库。若规格必须改变查询,把规格写进 URL 再导航,或走 Server Action 之后刷新,让服务器重新执行相关组件。
                    </P>
                    <P>
                        第三问防止两种常见事故:把密钥当作 props 传给客户端(载荷里谁都能看见),以及为了「全程 RSC」让每个按键都打回服务器。一份已经在载荷里的小列表,筛选放在 Client 更合适。一份受权限约束、大到不该整份下发的列表,筛选条件进 URL,由 Server Component 查完再渲染。
                    </P>
                    <P>
                        第四问防止把「在服务器执行」理解成「一定更快」。组件和数据库在同一区域时,浏览器少一次「先下 JS,再请求接口」的往返,这是收益。若 Server Component 自己还要跨地域调用公开 API,延迟里会加上函数启动和那段网络,要和「浏览器直接请求就近接口」比过再定,而不是按名字选。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="7. 落到一张商品页上"
                note="讲解要点:按区域写归属和原因。同一路由里 Server 与 Client 混在一起是常态,不是过渡形态。"
            >
                <Stack>
                    <Diagram caption="商品页:谁在服务器执行,谁进包">
                        {`布局壳、标题、面包屑
  Server。无请求级个性化时甚至可以在构建期生成。
  不要在这里读 cookie,否则整棵树都会变成每次请求都要算。

商品正文(Markdown)
  Server。解析库留在服务器,载荷里只留渲染结果。

价格与库存
  Server,请求时读,缓存 key 带上用户与币种。
  数字可以进载荷;查价用的 token 不能进。

规格按钮、数量、加入购物车
  Client 叶子。state 与点击在这里。
  提交用 Server Action 的函数引用,不把 db 传进浏览器。

规格一变就要重查库存
  规格写入 searchParams,Server 重新执行价格组件。
  不要在 Client 里调用「上面那个 async 组件」。

需要 hover / 缩放的图表
  Client,数据用 props 传入。只画一次的 SVG 可以留在 Server。

推荐、评论
  各自的 Server Component,外套 Suspense。
  不依赖正文结果的读取和正文同时开始。`}
                    </Diagram>
                    <P>
                        构建期执行和请求时执行都是 Server Component,差别在有没有请求数据。营销页、文档、不区分用户的文章可以在构建时生成,结果放在 CDN 上,运行时不再为每个访客跑函数。一读{' '}
                        <code className="font-mono text-[11px]">cookie</code>、<code className="font-mono text-[11px]">headers</code>{' '}
                        或未缓存的个性化查询,这条路由就变成动态的。把这种读取放在根布局里,下面所有页面都会跟着变成动态。个性化的读取下沉到真正依赖它的那段 Server Component。
                    </P>
                    <P>
                        实时往外长的界面,例如逐 token 的回答,不要做成「每个 token 重新执行一次 Server Component」。壳和输入是 Client;已经完成、可缓存的正文可以在下一次请求里由 Server Component 渲染。流本身是客户端订阅。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="8. 这些工作留在客户端"
                note="讲解要点:Client Component 不是退路。状态、浏览器 API、以及「数据已经在手、后面只在本地变」都属于它。"
            >
                <Stack>
                    <P>
                        输入法组合、拖拽、播放进度、地图和富文本编辑器,依赖浏览器事件或只提供客户端入口的库,边界就画在这些叶子上。叶子接收的 props 是已经算好的 id、初始值和序列化数据。叶子文件不要再 import 数据库模块去「顺便」取初始值,初始值由外面的 Server Component 查好传进来。
                    </P>
                    <P>
                        本地筛选一份短列表、在已加载的序列上做 hover,也留在客户端。每次按键都刷新 Server Component,会把一次内存过滤变成一次服务端渲染加一次载荷传输。列表大、结果因人而异、或不能把全量数据交给浏览器时,再把条件放进 URL,让服务器查询。
                    </P>
                    <P>
                        点击之后的响应快慢,仍由客户端渲染、主线程和网络决定。Server Component 减少的是包体积,以及「为了把只读内容画出来而在浏览器里再请求一次」。它不替代 Transition、虚拟列表,也不缩短数据库自己的查询时间。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="9. 实践:传染的是 import 图,不是视觉上的子节点"
                note="讲解要点:'use client' 写在文件第一行,作用于这个模块以及它 import 的模块。嵌在客户端壳里面的界面,仍可以由外层 Server 作为 children 创建。"
            >
                <Stack>
                    <Diagram caption="同一视觉嵌套,两种模块关系">
                        {`页面(Server)
  import FilterShell          可以,壳是 Client
  import Recs                 可以,推荐是 Server
  return (
    <FilterShell>
      <Recs />                 Recs 由 Server 创建,再作为 children 传入
    </FilterShell>
  )

FilterShell.tsx  'use client'
  import Recs from './recs'    不可以。Client 的 import 图里不能有 Server 模块
  壳里的 {children}            可以。children 不是这个文件 import 来的`}
                    </Diagram>
                    <P>
                        所以「把 <code className="font-mono text-[11px]">&apos;use client&apos;</code> 下沉」指的是缩小这个文件的 import 图:只引入按钮、输入和纯函数,不要在壳文件里引入正文、推荐和 markdown。布局如果自己 import 了整页组件,那些组件都会进客户端包;布局如果只渲染{' '}
                        <code className="font-mono text-[11px]">{`{children}`}</code>,框架仍可以把 Server 页面作为 children 传进来。根布局上的指令不会用魔法把 children 改成客户端模块,它会把这个文件直接 import 的东西改成客户端模块。
                    </P>
                    <P>
                        共享的 <code className="font-mono text-[11px]">lib/format.ts</code> 一旦被 Client 引用,就进入浏览器包。这个文件里不能再 import 数据库。需要查库的价格函数放到单独文件,并加上{' '}
                        <code className="font-mono text-[11px]">server-only</code>,让误引用在构建期失败,而不是在浏览器里露出连接串。纯格式化保持无依赖,Server 和 Client 都可以引用。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="10. 实践:客户端 state 不会重新执行 Server Component"
                note="讲解要点:交互要的是新的服务端结果时,走导航或 Action 后的刷新。交互只改本地视图时,不要设计成调用上层 async 组件。"
            >
                <Stack>
                    <Diagram caption="点一次规格按钮,谁会再执行">
                        {`FilterShell  setSize('L')
  → 只重跑这个 Client 组件
  → 商品正文、价格的 Server 函数不会再被调用
  → 载荷里上一次的正文保持不变

库存必须按新规格重查
  → router 把 ?size=L 写进地址
  → 服务器重新执行价格这个 Server Component
  → 新的数字进入下一次载荷

错误预期
  → 在 Client 里 import 并调用 async function Price()
     Client 不能 import Server 模块,这次调用也不会发生`}
                    </Diagram>
                    <P>
                        设计接口时先写「这次点击要不要新的授权数据」。不要,就把已有数据放进 props,后面的派生放在 Client。要,就让点击改变 URL 或调用 Server Action,由服务器重算,而不是让客户端持有一个永远不会再执行的 async 组件引用。
                    </P>
                    <CodeBlock
                        title="需要新查询时,把条件放进地址"
                        code={`'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export function SizePicker({ sizes }: { sizes: string[] }) {
    const router = useRouter();
    const params = useSearchParams();
    return sizes.map((size) => (
        <button
            key={size}
            type="button"
            onClick={() => {
                const next = new URLSearchParams(params);
                next.set('size', size);
                router.push(\`?$\{next.toString()}\`);
            }}
        >
            {size}
        </button>
    ));
}`}
                    />
                    <P>
                        上面的按钮是 Client。读取 <code className="font-mono text-[11px]">searchParams</code> 并{' '}
                        <code className="font-mono text-[11px]">await getStock(id, size)</code> 的价格组件留在 Server。按钮不接收数据库句柄。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="11. 实践:无关的读取并行,慢的一块单独 Suspense"
                note="讲解要点:父级连续 await 会让推荐等正文。有数据依赖的读取不能假装并行。慢查询用 Suspense 包住,壳先进入载荷。"
            >
                <Stack>
                    <Diagram caption="同一次请求里的时间">
                        {`父组件里连续 await
  0ms     开始查商品
  400ms   商品返回,这时才开始查推荐
  800ms   推荐返回,整页一起提交
          壳也被最慢的查询拖住

拆成同级 Server Component
  0ms     壳(无 await)进入载荷
  0ms     Product 与 Recs 同时开始
  400ms   谁先返回谁替换自己的骨架
          另一块继续等

有真实依赖时不要拆假并行
  推荐要商品的类目 → 先 await 商品,再在子组件里查推荐
  或者商品查完把类目传给推荐组件`}
                    </Diagram>
                    <P>
                        Suspense 的边界按「用户能单独理解的一块」来画,和性能专题里的区域表是同一件事。推荐的骨架可以晚一点换成列表,不应当把标题和购买按钮一起藏进同一个 fallback。fallback 本身要轻,不要在 fallback 里再发请求。
                    </P>
                    <CodeBlock
                        title="壳不 await;两块慢数据各管各的"
                        code={`import { Suspense } from 'react';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    return (
        <>
            <h1>商品</h1>
            <Suspense fallback={<p>正在读取商品…</p>}>
                <Product params={params} />
            </Suspense>
            <Suspense fallback={<p>正在读取推荐…</p>}>
                <Recs params={params} />
            </Suspense>
        </>
    );
}`}
                    />
                    <P>
                        React 19 也可以把 Promise 作为 props 传给 Client,在客户端用 <code className="font-mono text-[11px]">use()</code>{' '}
                        读取。这适合「数据流已经开始,交互叶子要等同一个 Promise」。它不把 Client 变成 Server,密钥仍然不能放进这个 Promise 的结果里。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="12. 实践:缓存有三层,key 里要有身份"
                note="讲解要点:请求内去重、跨请求复用、浏览器缓存解决的是三次不同的重复。漏掉用户或租户,后一次请求会看到前一次的价格。"
            >
                <Stack>
                    <Diagram caption="三层缓存各活多久">
                        {`React.cache(getUser)
  同一次服务端渲染里,布局和页面都读当前用户
  查询只发生一次。请求结束即丢。
  这不是 CDN,也不是 localStorage。

框架的跨请求缓存(fetch cache、显式 cache)
  下一次请求还想复用「60 秒内不变」的商品介绍
  key 必须包含会改变结果的输入:id、租户、币种、是否草稿
  漏了登录用户,A 会看到 B 的协议价

浏览器里的 HTTP 缓存 / SWR
  只管客户端后来发出的请求
  不管 Server Component 那次 await`}
                    </Diagram>
                    <P>
                        介绍文案和协议价不要放进同一个缓存条目。介绍可以按商品 id 复用;价格的 key 至少包含用户、币种和渠道。写操作(下单、改库存)不走这层复用,成功后要让相关读取失效,否则刷新仍看到旧库存。失效范围按 key,不要为了省事清掉整站缓存。
                    </P>
                    <P>
                        <code className="font-mono text-[11px]">React.cache()</code> 的参数按引用比较。每次调用都新写一个{' '}
                        <code className="font-mono text-[11px]">{`{ id }`}</code> 对象,去重会失效。传入稳定的原始值,例如{' '}
                        <code className="font-mono text-[11px]">getProduct(id)</code>,而不是每次新建的参数对象。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="13. 实践:秘密留在服务器的执行过程里"
                note="讲解要点:模块不进包,不等于运行结果不进浏览器。props、渲染出的文本、Server Action 的参数都会到客户端。"
            >
                <Stack>
                    <Diagram caption="token 在哪一步离开服务器">
                        {`安全
  const token = process.env.PRICE_TOKEN     只在服务器模块里
  const price = await fetchPrice(id, token) 用 token 换回用户该看的数字
  return <PriceTag amount={price.amount} /> 载荷里只有金额

不安全
  return <ClientChart token={token} />
  token 被序列化进 RSC 载荷,浏览器源码里可见

同样不安全
  把内部成本、其他用户的行、未过滤的 SQL 结果放进 props
  「组件是 Server」不会把这些字段藏起来`}
                    </Diagram>
                    <P>
                        环境变量同理。没有公开前缀的变量只在服务器进程里。一旦为了方便写进 Client 组件,或经过 props 传过去,它就出现在包或载荷中。公开前缀的变量当作「本来就要给浏览器」来设计。
                    </P>
                    <P>
                        Server Action 是公开的 HTTP 端点,不是「只有我们的按钮能调用的函数」。函数体内要自己确认登录和权限,再写数据库。只在页面外层做鉴权不够:任何人都可以直接向这个端点提交{' '}
                        <code className="font-mono text-[11px]">productId</code>。Action 的参数同样会被客户端看见和伪造,不能把「调用方是自己人」写进参数里信任。
                    </P>
                    <CodeBlock
                        title="鉴权写在 Action 里面"
                        code={`'use server';

import { auth } from '../auth';
import { db } from '../db';

export async function addToCart(productId: string) {
    const user = await auth();
    if (!user) {
        throw new Error('需要登录');
    }
    await db.cart.add({ userId: user.id, productId });
}`}
                    />
                </Stack>
            </TopicSection>

            <TopicSection
                title="14. 实践:Provider、错误和目录"
                note="讲解要点:有状态的 Provider 是 Client,但可以由 Server 页面包住服务端 children。渲染期抛错走框架的错误界面,不在 Server Component 里写 effect。"
            >
                <Stack>
                    <P>
                        主题、登录态展示如果要在客户端变化,Provider 文件带{' '}
                        <code className="font-mono text-[11px]">&apos;use client&apos;</code>。Server 页面可以写成{' '}
                        <code className="font-mono text-[11px]">&lt;ThemeProvider&gt;&lt;ProductBody /&gt;&lt;/ThemeProvider&gt;</code>
                        。<code className="font-mono text-[11px]">ProductBody</code> 仍由页面这个 Server 模块创建。不要把正文 import 写进 Provider 文件,否则正文进入客户端图。
                    </P>
                    <P>
                        Server Component 在渲染中抛错时,由框架的错误界面接住。Next.js 的{' '}
                        <code className="font-mono text-[11px]">error.tsx</code> 是 Client Component,可以用 state 做重试。它接不住根布局里的错误,根上的失败要单独的全局错误界面。未登录应重定向或返回明确的 401,不要靠错误界面把权限失败显示成「出错了」。Error Boundary 的类组件也只存在于客户端。
                    </P>
                    <P>
                        目录按交互切文件,不按「components/client」堆一个大入口。
                        <code className="font-mono text-[11px]">page.tsx</code> 负责组合和取数,
                        <code className="font-mono text-[11px]">add-to-cart.tsx</code> 只放按钮。这样评审时看文件名就知道哪一段会进包。测试上,Server Component 是异步函数,断言它返回的元素和它调用的数据函数;本练习场没有服务器,不能靠这里的按钮证明生产边界已经生效。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="15. 到示意里把边界切一遍"
                note="玩法在下一页:给商品页的五块指定 Server 或 Client,并打开「筛选 import 推荐」。结论是规则判断,页面不会变成服务器。"
            >
                <RelatedTopics
                    items={[
                        {
                            to: '/advanced/rsc-boundary',
                            label: '边界示意',
                            why: '切换归属,看包、载荷,以及 Client import Server 为什么不成立',
                        },
                        {
                            to: '/performance/suspense-ui',
                            label: 'Suspense 骨架',
                            why: '慢的 Server Component 要用边界隔开,避免整页等最慢的一块',
                        },
                        {
                            to: '/performance/architecture-guide',
                            label: '架构关键路径',
                            why: '何时生成、哪些代码到浏览器,和 RSC 边界是同一张区域表',
                        },
                        {
                            to: '/hooks/use-effect',
                            label: 'useEffect',
                            why: '客户端请求的位置。能在 Server Component 里 await 的读取,不必再进 effect',
                        },
                    ]}
                />
            </TopicSection>
        </TopicPage>
    );
});

RscGuide.displayName = 'RscGuide';

export default RscGuide;
