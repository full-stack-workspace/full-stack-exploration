/**
 * ============================================================================
 * 列表与 key — React 基础专题
 * ============================================================================
 *
 * 从「key 决定元素身份」的双栏错位实验出发,讲透同一层级的 Diff 配对
 * 机制与 key 的三条规则,再落到两个生产范式:用 key 重置组件状态、
 * 稳定 id 必须在数据创建时生成;最后收口为工程速查与面试点。
 *
 * 每个 TopicSection 均为「交互 Demo + CodeBlock/Diagram + 讲解要点 note」。
 *
 * @module topics/basics/list-key
 */

import { memo } from 'react';

import { TopicPage, TopicSection } from '../../../components/TopicPage';
import { CodeBlock } from '../../../components/CodeBlock';
import { Diagram } from '../../../components/Diagram';
import { IdentityExperiment } from './components/IdentityExperiment';
import { KeyRulesDemo } from './components/KeyRulesDemo';
import { ResetStateDemo } from './components/ResetStateDemo';
import { DynamicKeyDemo } from './components/DynamicKeyDemo';

const ListKeyTopic = memo(() => {
    return (
        <TopicPage
            title="列表与 key"
            description="从 key 决定元素身份的 Diff 配对机制与三条规则,到 id vs index 错位实验、key 重置状态与渲染期生成 key 两大生产范式,再到工程速查与面试点"
        >
            {/* Section 1:经典实验升级 —— key 决定元素身份 */}
            <TopicSection
                title="实验:key 决定元素身份(id vs index 双栏对照)"
                note="讲解要点:React Diff 用 key 配对新旧子节点 —— key 相同复用组件实例与 DOM(内部 state 保留),key 不同销毁重建。index 作 key 等于把「位置」当成身份:头部插入 / 反转 / 删除中间项后位置整体平移,实例原地复用,于是每行的备注 state 与数据错位。两栏共享同一份数据与操作,唯一变量就是 key —— 状态跟着人走还是留在原地,操作一次即见分晓。"
            >
                <IdentityExperiment />
            </TopicSection>

            {/* Section 2:Diff 配对机制与 key 的三条规则 */}
            <TopicSection
                title="Diff 配对机制与 key 的三条规则"
                note="讲解要点:Diff 只在同一层级的兄弟节点间按 key 一一配对 —— 同 key 复用、无配对卸载、新 key 挂载。规则 a) key 只需兄弟间唯一,不同列表复用同一组 key 互不干扰(下方两个列表用同一组 id 验证);规则 b) key 被 React 截获,不会出现在 props 里,需要就把 id 当普通 prop 再传一份;规则 c) key 必须放在 map 返回的最外层元素上,包一层 Fragment/组件时 key 跟着外层走。"
            >
                <div className="space-y-4">
                    <KeyRulesDemo />
                    <Diagram caption="同一层级的 Diff 配对(以 key 为身份线索)">
                        {`旧子节点                新子节点              React 的决策
[key=A] ─────────────▶ [key=A]    同 key:复用实例与 DOM,仅更新 props(state 保留)
[key=B] ── ✘                      无对应 key:卸载组件,销毁 DOM(state 一并销毁)
[key=C] ─────────────▶ [key=C]    同 key:复用,位置变化也只移动既有 DOM
                   ──▶ [key=E]    新增 key:挂载全新实例(初始 state)

若 key={index}:新旧列表按「位置」配对,重排后旧实例被错配给新数据`}
                    </Diagram>
                    <CodeBlock
                        title="规则 b / c 的正确写法"
                        code={`// 规则 b:key 不会传进组件,props.key 永远是 undefined
<UserCard key={user.id} id={user.id} />
// 组件内需要这个值?像上面一样把 id 作为普通 prop 再传一份

// 规则 c:key 要放在 map 返回的最外层元素上
// ❌ key 包在内层:外层 Fragment 的 key 仍是 null,警告依旧
{items.map((it) => (
    <Fragment>
        <dt key={it.id}>{it.term}</dt>
        <dd>{it.desc}</dd>
    </Fragment>
))}

// ✅ key 跟着最外层走;<Fragment key> 是唯一允许带 key 的 Fragment 写法
{items.map((it) => (
    <Fragment key={it.id}>
        <dt>{it.term}</dt>
        <dd>{it.desc}</dd>
    </Fragment>
))}`}
                    />
                </div>
            </TopicSection>

            {/* Section 3:生产范式一 —— 用 key 重置组件状态 */}
            <TopicSection
                title="生产范式一:用 key 重置组件状态"
                note="生产要点:「换数据时清空内部状态」首选给组件换 key —— key 变化 = React 卸载旧实例、挂载新实例,所有内部 state 自动归零,一行声明解决。反模式是 useEffect 监听 id 再手动把 props 同步进 state:多一次渲染、字段一多必漏、还容易出现「旧数据闪一帧」。官方文档明确推荐 key 重置优先于 effect 同步。"
            >
                <div className="space-y-4">
                    <ResetStateDemo />
                    <CodeBlock
                        title="key 重置 vs effect 同步"
                        code={`// ✅ 范式:key 变化 → 卸载旧实例、挂载新实例,state 自动归零
<UserForm key={selectedUser.id} user={selectedUser} />

function UserForm({ user }) {
    const [draft, setDraft] = useState(user.email); // 每个 key 下只初始化一次
    // 组件内无需任何「同步 props → state」的逻辑
}

// ❌ 反模式:同一实例里用 effect 追赶 props 变化
function UserForm({ user }) {
    const [draft, setDraft] = useState(user.email);
    useEffect(() => {
        setDraft(user.email);   // 多一次渲染;表单字段一多,漏一个就是一个 bug
        setBio('');             // ← 这种「顺手也要重置」的字段最容易被忘掉
    }, [user.id]);
}`}
                    />
                </div>
            </TopicSection>

            {/* Section 4:生产范式二 —— 渲染期动态生成 key 的坑 */}
            <TopicSection
                title="生产范式二:渲染期动态生成 key 的坑"
                note="根因:key={Math.random()} 让每次 render 的 key 全变,React 找不到任何可复用实例,整列卸载重建 —— 输入框每敲一个字就失焦,挂载计数随击键爆炸。最佳范式:稳定 id 在「数据创建时」生成一次(crypto.randomUUID() / 服务端入库 id),render 期只读取、绝不生成;index 同理只是「碰巧暂时稳定」的位置别名。面试点:React 为什么不给列表自动补稳定 key?因为「身份」是业务语义 —— 同一条数据换了位置还是不是同一条,只有数据自己知道。"
            >
                <div className="space-y-4">
                    <DynamicKeyDemo />
                    <CodeBlock
                        title="id 的生成时机"
                        code={`// ✅ 数据创建时生成一次,此后随数据稳定存在
const createTodo = (text: string): Todo => ({
    id: crypto.randomUUID(),  // 或服务端入库后返回的 id
    text,
    done: false,
});
setTodos((prev) => [...prev, createTodo(input)]);
{todos.map((t) => <TodoRow key={t.id} todo={t} />)}

// ❌ render 期生成:每次渲染都是「全新的一列」
{todos.map((t) => <TodoRow key={Math.random()} todo={t} />)}
{todos.map((t) => <TodoRow key={crypto.randomUUID()} todo={t} />)}  // 同样灾难`}
                    />
                </div>
            </TopicSection>

            {/* Section 5:工程速查与面试点 */}
            <TopicSection
                title="工程速查与面试点"
                note="面试点:a) index 作 key 仅在「纯静态展示 + 列表永不重排/增删 + 子项无内部 state」三个条件同时成立时可接受,缺一不可;b) missing key 警告只在开发环境出现,它意味着 React 已退化为按位置(等价于 index)配对,风险与 key={index} 相同;c) 受控表单列表里 key 用错 = 用户数据串行,脏数据可能随提交入库,生产事故级 bug;d) key 只参与 Diff 配对,不渲染到 DOM、不影响样式与结构。"
            >
                <div className="space-y-4">
                    <CodeBlock
                        title="速查清单"
                        code={`// Q1: index 什么时候可用作 key?—— 三个条件缺一不可
//   ✔ 纯静态展示:子项没有输入框 / 开关等内部 state
//   ✔ 列表永不重排、永不增删(或只在尾部追加)
//   ✘ 但凡有一个条件不满足,一律用稳定 id

// Q2: 不写 key 会怎样?
//   开发环境警告 "Each child in a list should have a unique key"
//   实质:React 退化为按位置配对,等价于 key={index},错位风险相同
//   生产构建不报警告,但行为一致 —— 警告只是开发期的善意提醒

// Q3: key 会渲染到 DOM 吗?
//   不会。key 只存在于 React 元素对象上参与 Diff 配对,
//   不产生任何 DOM 属性,对样式 / 结构零影响

// Q4: 受控组件列表为什么最怕 key 用错?
//   实例被错误复用时,输入框 value、勾选状态会串到别的数据行,
//   用户看到并提交的可能是「别人的数据」`}
                    />
                    <ul className="space-y-1.5 text-xs leading-relaxed text-gray-500 dark:text-slate-400">
                        <li className="flex gap-2">
                            <span className="text-primary-500">▸</span>
                            选 key 的优先级:服务端入库 id &gt; 数据创建时生成的 uuid &gt; 内容哈希;index 永远排在最后。
                        </li>
                        <li className="flex gap-2">
                            <span className="text-primary-500">▸</span>
                            key 同时影响「组件实例」与「宿主 DOM」的复用:input 的焦点、滚动位置、CSS transition 状态都挂在 DOM 上。
                        </li>
                        <li className="flex gap-2">
                            <span className="text-primary-500">▸</span>
                            反过来用:故意换 key 是「强制重置」的合法手段(本专题 Section 3 的范式)。
                        </li>
                    </ul>
                </div>
            </TopicSection>
        </TopicPage>
    );
});

ListKeyTopic.displayName = 'ListKeyTopic';

export default ListKeyTopic;
