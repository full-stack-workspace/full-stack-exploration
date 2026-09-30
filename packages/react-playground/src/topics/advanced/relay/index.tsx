/**
 * ============================================================================
 * Relay 数据流 — React 进阶专题
 * ============================================================================
 *
 * 从「fragment colocation 的用户目录」查询演示出发,落到「变量查询与
 * store 缓存」交互实验,再讲透 Relay 的两个核心概念 —— fragment 静态拼装
 * 与数据边界(data masking),并以 ❌ SWR/直接 fetch vs ✅ Relay 的对照
 * 收口「为什么需要数据边界」,最后给出工程速查与面试点。
 *
 * 查询骨架(TopicPage 骨架 + Suspense 骨架屏)与交互实验均由
 * src/relay/Environment.ts 的 mock 网络层驱动(300ms 模拟延迟)。
 *
 * @module topics/advanced/relay
 */

import { memo } from 'react';

import { TopicPage, TopicSection } from '../../../components/TopicPage';
import { CodeBlock } from '../../../components/CodeBlock';
import { Diagram } from '../../../components/Diagram';
import { UserDirectory } from './components/UserDirectory';
import { UserLookupDemo } from './components/UserLookupDemo';

const RelayTopic = memo(() => {
    return (
        <TopicPage
            title="Relay 数据流"
            description="从 fragment colocation 查询演示与变量查询缓存实验,到数据边界与静态拼装的图解、SWR/直接 fetch 的对照,再到工程速查与面试点"
        >
            {/* Section 1:查询演示 —— fragment 拼装出的用户目录 */}
            <TopicSection
                title="查询演示:fragment 拼装出的用户目录(骨架屏)"
                note="讲解要点:页面顶层只有这一次查询 UserDirectoryQuery,但它自己不声明任何业务字段 —— 只取 id 作 key,再展开 UserCard / PostCard 各自声明的 fragment。relay-compiler 在构建期把所有 fragment 静态汇总成一次网络请求;加载期间 Suspense 渲染与卡片同形的骨架屏。需求变化(比如用户卡片要加头像)只改 UserCard 一个文件,查询与类型自动跟上。"
            >
                <UserDirectory />
            </TopicSection>

            {/* Section 2:交互实验 —— 变量查询与 store 缓存 */}
            <TopicSection
                title="交互实验:变量查询与 store 缓存"
                note="讲解要点:点击按钮改变查询变量 id,触发 user(id: $id) 查询。默认 fetchPolicy 是 store-or-network —— 首次查询走网络(mock 300ms),Suspense 骨架屏接管;切回已查过的用户时归一化 store 缓存命中,同步渲染、不再请求、不闪骨架。「要不要发请求」由 store 里有没有数据决定,组件无需自己维护缓存逻辑。"
            >
                <UserLookupDemo />
            </TopicSection>

            {/* Section 3:核心概念 —— fragment 与数据边界 */}
            <TopicSection
                title="核心概念:fragment colocation 与数据边界"
                note="讲解要点:fragment 与组件同文件共存(colocation),组件的数据需求就近可读、就近可改。数据边界(data masking)意味着父组件展开 fragment 后只能拿到一个「引用」,读不到里面的字段 —— UserCard 删改字段不会影响目录页的渲染逻辑;反之目录页想多用某个字段,必须回到卡片组件里声明。边界让「谁在用这个字段」永远是单点答案。"
            >
                <div className="space-y-4">
                    <CodeBlock
                        title="components/UserCard.tsx(节选)—— 组件自己声明数据需求"
                        code={`// fragment 与组件同文件共存:字段需求就写在组件旁边
export const UserCard = memo(({ user: userKey }: Props) => {
    const user = useFragment(
        graphql\`
            fragment UserCard_user on User {
                id
                name
                email      // 要加字段?只改这一个文件
            }
        \`,
        userKey,       // 父组件只能传「引用」,读不到 name / email
    });
});

// 父查询只负责拼装,不碰业务字段:
// query UserDirectoryQuery {
//     users { id ...UserCard_user }
//     posts { id ...PostCard_post }
// }`}
                    />
                    <Diagram caption="relay-compiler:把散落的 fragment 静态拼成一次请求">
                        {`构建期(relay-compiler)                     运行时

UserDirectory 的 query ─┐                  ┌─ 一次 POST,拿回全部字段
  ├─ UserCard fragment ─┼─ 静态汇总 ─────▶ │   store 归一化(按 type+id 去重)
  └─ PostCard fragment ─┘                  └─ 各组件经 fragment 引用读取自己
                                                声明过的字段(数据边界)`}
                    </Diagram>
                </div>
            </TopicSection>

            {/* Section 4:对照 —— 为什么需要数据边界 */}
            <TopicSection
                title="对照:为什么需要 Relay 的数据边界"
                note="讲解要点:SWR / 直接 fetch 模式下,「组件渲染用的字段」与「请求拿的字段」是两份各自维护的约定 —— 改字段要跨文件追请求,删字段没有任何机制报警,字段只会越积越多(over-fetch)。Relay 把两者合并成 fragment 这一个真相源,并用编译期类型与 data masking 强制守住。站点里 SWR 的用法见 next-playground 包,那里演示了客户端缓存,但没有数据边界。"
            >
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <CodeBlock
                        title="❌ SWR / 直接 fetch:字段约定靠人肉同步"
                        code={`// api.ts —— 请求拿整个对象,字段是「隐式约定」
const { data } = useSWR('/api/users/1', fetcher);

// UserCard.tsx —— 用了 name / email / avatar
// 三个月后才有人发现 avatar 早就不展示了,
// 但没人敢删:搜索不到「谁在请求它」
<p>{data.user.name}</p>

// 换个端点返回结构?所有 useSWR 调用点
// 逐个排查;类型要靠手写 interface 维持`}
                    />
                    <CodeBlock
                        title="✅ Relay:fragment 是唯一真相源"
                        code={`// UserCard.tsx —— 请求字段与消费字段是同一个声明
fragment UserCard_user on User {
    id
    name
    email
    // avatar 删掉 → 类型同步消失,
    // 还引用它的代码立刻编译报错
}

// 父组件拿到的是「引用」而非数据:
// props.user.name 直接是类型错误(data masking)
// → 想读字段,必须去 UserCard 里声明`}
                    />
                </div>
            </TopicSection>

            {/* Section 5:工程速查与面试点 */}
            <TopicSection
                title="工程速查与面试点"
                note="面试点:a) Relay 与 SWR/React Query 的本质差异不在「缓存」而在「数据边界 + 编译期校验」 —— 缓存大家都有,字段治理是 Relay 独有;b) graphql tag 在构建期被 babel-plugin-relay 替换为编译产物,运行时没有模板字符串解析;c) 改任何 graphql tag 必须重跑 pnpm relay 重新生成 artifact,src/__generated__ 永不手改;d) 本站网络层是 mock(fetchQueryWithMock),生产写法见 src/relay/Environment.ts 的 fetchQuery 示例。"
            >
                <div className="space-y-4">
                    <CodeBlock
                        title="速查清单"
                        code={`// Q1: Relay 比 SWR / React Query 多了什么?
//   缓存大家都有。独有的是:fragment colocation(数据需求与组件同文件)、
//   data masking(父组件读不到子组件的字段)、
//   relay-compiler 的编译期类型(删字段即编译报错)

// Q2: graphql\`...\` 在运行时做了什么?
//   什么都不做 —— babel-plugin-relay 在构建期把它替换成
//   对 __generated__/Xxx.graphql 的 require,运行时没有解析开销

// Q3: 改了 graphql tag 后要做什么?
//   pnpm relay(relay-compiler)重新生成 artifact 与类型;
//   __generated__ 是编译产物,永不手改

// Q4: useLazyLoadQuery 的默认缓存策略?
//   store-or-network:store 里有完整数据就直接用,否则发请求;
//   本专题 Section 2 的交互实验就是在演示它`}
                    />
                    <ul className="space-y-1.5 text-xs leading-relaxed text-gray-500 dark:text-slate-400">
                        <li className="flex gap-2">
                            <span className="text-primary-500">▸</span>
                            本站的 Relay 环境在 src/index.tsx 注入(单例 environment),网络层是
                            fetchQueryWithMock —— 300ms 延迟 + 按查询文本路由的内存数据。
                        </li>
                        <li className="flex gap-2">
                            <span className="text-primary-500">▸</span>
                            生产接入:把 src/relay/Environment.ts 的 fetchQuery 指向真实 GraphQL 服务,
                            组件层代码零改动 —— 网络层与组件之间只隔一个 Environment。
                        </li>
                        <li className="flex gap-2">
                            <span className="text-primary-500">▸</span>
                            schema 定义在 src/schema.graphql(本 demo 的 Query/User/Post),
                            relay-compiler 用它校验所有 fragment 的字段合法性。
                        </li>
                    </ul>
                </div>
            </TopicSection>
        </TopicPage>
    );
});

RelayTopic.displayName = 'RelayTopic';

export default RelayTopic;
