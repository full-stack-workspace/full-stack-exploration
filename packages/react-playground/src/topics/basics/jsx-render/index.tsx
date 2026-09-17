/**
 * ============================================================================
 * JSX 与渲染 — React 基础专题
 * ============================================================================
 *
 * 从「元素只是普通对象」的本质出发,讲透表达式插值、条件渲染四范式、
 * 列表与 key 基础,再落到三个生产级渲染组织方式:
 * 异步四态状态机、权限渲染、配置驱动渲染。
 *
 * 每个 TopicSection 均为「交互 Demo + CodeBlock 节选 + 生产要点 note」。
 *
 * @module topics/basics/jsx-render
 */

import { memo } from 'react';

import { TopicPage, TopicSection } from '../../../components/TopicPage';
import { CodeBlock } from '../../../components/CodeBlock';
import { Diagram } from '../../../components/Diagram';
import { ElementNatureDemo } from './components/ElementNatureDemo';
import { ExpressionDemo } from './components/ExpressionDemo';
import { ConditionalDemo } from './components/ConditionalDemo';
import { ListRenderDemo } from './components/ListRenderDemo';
import { AsyncStatusDemo } from './components/AsyncStatusDemo';
import { PermissionDemo } from './components/PermissionDemo';
import { ConfigDrivenDemo } from './components/ConfigDrivenDemo';

const JsxRenderTopic = memo(() => {
    return (
        <TopicPage
            title="JSX 与渲染"
            description="从元素本质、表达式插值、条件与列表渲染,到异步四态、权限与配置驱动三大生产渲染范式"
        >
            <TopicSection
                title="JSX 的本质:元素是普通对象"
                note="JSX 是编译期语法糖(@babel/preset-react 的 react-jsx runtime),浏览器里根本没有 JSX;元素只是描述 UI 的不可变 plain object,创建它很便宜 —— 直到 commit 阶段才创建 / 更新真实 DOM。「触发渲染」和「DOM 更新」是两件事"
            >
                <div className="space-y-4">
                    <ElementNatureDemo />
                    <Diagram caption="JSX → 元素对象 → 真实 DOM">
                        {`JSX 源码                     编译产物(render 阶段)        commit 阶段
<Button>提交</Button>  ──▶  { type, props, key, ... }  ──▶  真实 DOM 节点
                            不可变的 plain object,只是「描述」`}
                    </Diagram>
                    <CodeBlock
                        title="JSX 与编译产物对照"
                        code={`// 你写的 JSX
const element = <Button type="primary">提交</Button>;

// react-jsx runtime 编译后等价于
import { jsx } from 'react/jsx-runtime';
const element = jsx(Button, { type: 'primary', children: '提交' });

// element 只是一个不可变的 plain object:
// { $$typeof: Symbol(react.element), type: Button, key: null,
//   props: { type: 'primary', children: '提交' } }
// 直到 React 把它 commit 到宿主环境,真实 DOM 才被创建`}
                    />
                </div>
            </TopicSection>

            <TopicSection
                title="表达式插值:什么能渲染"
                note="{} 里只能放「表达式」不能放语句(if/for 不行,要提前算好或用三元);true / false / null / undefined 渲染为空 —— 这正是 && 短路能工作的原理;而 0 和 NaN 会原样渲染出来,是条件渲染最常见的坑"
            >
                <div className="space-y-4">
                    <ExpressionDemo />
                    <CodeBlock
                        title="大括号里的能与不能"
                        code={`{/* {} 内是表达式插值:任何「有返回值」的 JS 表达式 */}
<p>{user.name}</p>               {/* 字符串 / 数字:正常渲染 */}
<p>{count * 2}</p>               {/* 运算 */}
<p>{isVip ? 'VIP' : '普通用户'}</p> {/* 三元也是表达式 */}
<ul>{list.map(renderItem)}</ul>  {/* 数组:逐个渲染,字符串间无分隔符 */}

{/* 渲染为空 —— && 短路正是靠这一条工作 */}
{true} {false} {null} {undefined}

{/* 会出事的值 */}
{0}      {/* falsy 但会真的渲染出「0」 */}
{NaN}    {/* 真的渲染出「NaN」 */}
{obj}    {/* 报错:Objects are not valid as a React child */}
{if (ok) { 'yes' }}  {/* 编译错误:{} 里不能放语句 */}`}
                    />
                </div>
            </TopicSection>

            <TopicSection
                title="条件渲染四范式"
                note="选型建议:简单开关用 &&(左侧务必转成布尔,堵住 0 / 空字符串的坑),二选一用三元,复杂前置分支用提前 return 或变量承载;分支继续膨胀就抽子组件,别让 JSX 里长出 if 丛林"
            >
                <div className="space-y-4">
                    <ConditionalDemo />
                    <CodeBlock
                        title="四种写法与适用场景"
                        code={`// 1. && 短路 —— 简单开关;左侧必须是布尔
{count > 0 && <Badge count={count} />}

// 2. 三元表达式 —— 二选一
{loggedIn ? <UserPanel /> : <LoginButton />}

// 3. 提前 return —— 小组件内的前置分支,主体 JSX 保持干净
function Panel({ data, error }) {
    if (error) { return <ErrorView error={error} />; }
    if (!data) { return <Skeleton />; }
    return <Detail data={data} />;
}

// 4. 变量承载 —— 分支较多时,在 JSX 之外先算好
let content;
if (status === 'todo') { content = <TodoView />; }
else { content = <DoneView />; }
return <section>{content}</section>;`}
                    />
                </div>
            </TopicSection>

            <TopicSection
                title="列表渲染基础:map 与 key"
                note="key 是 React Diff 时识别元素身份的线索:稳定 id 作 key,组件状态跟随数据;index 作 key,状态跟随位置,乱序 / 头部插入时就会错位。更系统的 Diff 实验见「列表与 key」专题"
            >
                <div className="space-y-4">
                    <ListRenderDemo />
                    <CodeBlock
                        title="列表渲染要点"
                        code={`{users.map((user) => (
    <UserCard key={user.id} user={user} />  // key 用稳定唯一的 id,不要用 index
))}

// 需要分组又不想多包一层 DOM:唯一允许带 key 的 Fragment 写法
{groups.map((g) => (
    <Fragment key={g.id}>
        <h3>{g.title}</h3>
        <ul>{g.items.map((it) => <li key={it}>{it}</li>)}</ul>
    </Fragment>
))}`}
                    />
                </div>
            </TopicSection>

            <TopicSection
                title="生产场景一:异步数据的四态渲染"
                note="生产要点:异步 UI 用判别联合状态机驱动渲染 —— 一个 status 字段穷举 idle / loading / error / success 全部分支,empty 与 error 都是一等公民;杜绝 isLoading && !isError && data 这类布尔 flag 排列组合(分支一多必漏)"
            >
                <div className="space-y-4">
                    <AsyncStatusDemo />
                    <CodeBlock
                        title="状态机驱动渲染(节选)"
                        code={`// 判别联合:status 是互斥且完备的分支开关
type FetchState =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'success'; data: Article[] };

const [state, setState] = useState<FetchState>({ status: 'idle' });

switch (state.status) {
    case 'idle':    return <Placeholder />;
    case 'loading': return <Skeleton />;
    case 'error':   return <ErrorView msg={state.message} onRetry={load} />;
    case 'success': return state.data.length === 0
        ? <Empty />                 // 空数据是独立分支,不与 loading 挤在一起
        : <ArticleList data={state.data} />;
}
// 反例:isLoading && !isError && data && ... —— 布尔 flag 组合爆炸`}
                    />
                </div>
            </TopicSection>

            <TopicSection
                title="生产场景二:权限渲染"
                note="生产要点:前端权限渲染只是 UX(藏按钮不挡攻击),接口必须服务端兜底;权限判断收敛到一张权限表 + Guard 组件,而不是散落在 JSX 各处的 role === 'admin' && ... 三元"
            >
                <div className="space-y-4">
                    <PermissionDemo />
                    <CodeBlock
                        title="权限表 + Guard 封装(节选)"
                        code={`// 权限表收敛到一处,是全部判断的唯一事实来源
const PERMISSIONS: Record<Role, Action[]> = {
    admin:  ['create', 'edit', 'publish', 'delete', 'viewStats'],
    editor: ['create', 'edit'],
    viewer: [],
};
const can = (role: Role, action: Action) => PERMISSIONS[role].includes(action);

// Guard 封装后,页面里不再散落三元
function Guard({ role, action, fallback = null, children }) {
    return can(role, action) ? children : fallback;
}

<Guard role={role} action="delete">
    <Button danger>删除</Button>
</Guard>`}
                    />
                </div>
            </TopicSection>

            <TopicSection
                title="生产场景三:配置驱动渲染"
                note="生产要点:低代码平台 / 后台仪表盘的核心模式 —— 配置(常来自服务端)驱动渲染,新增类型 = 在注册表加一行,符合开闭原则;配置里出现未知 type 时必须渲染兜底组件,而不是让整页白屏"
            >
                <div className="space-y-4">
                    <ConfigDrivenDemo />
                    <CodeBlock
                        title="注册表 + 兜底(节选)"
                        code={`// 注册表:新增 widget 类型 = 注册一行,不改渲染逻辑
const WIDGETS: Record<KnownType, ComponentType<WidgetProps>> = {
    stat:  StatWidget,
    chart: ChartWidget,
    todo:  TodoWidget,
};

// 渲染器:type 来自服务端是任意字符串,运行时查表 + 兜底
function WidgetRenderer({ config }: { config: WidgetConfig }) {
    const Widget = WIDGETS[config.type];
    if (!Widget) { return <UnknownWidget type={config.type} />; }
    return <Widget config={config} />;
}

// 配置来自服务端,前端只负责渲染
{dashboardConfig.map((c) => <WidgetRenderer key={c.id} config={c} />)}`}
                    />
                </div>
            </TopicSection>
        </TopicPage>
    );
});

JsxRenderTopic.displayName = 'JsxRenderTopic';

export default JsxRenderTopic;
