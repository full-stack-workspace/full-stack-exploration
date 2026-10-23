# react-playground — 原理与架构专题设计

**日期**: 2026-10-23
**状态**: 设计完成 · 待审阅
**目标包**: `packages/react-playground/`

---

## 1. 目标

在 react-playground 新增顶栏分类「原理与架构」，把现有「内部机制」十页并入这一分类。读者沿一条路径读完三层：Fiber 为什么必须长成这样，这台机器的结构怎么动，以后每一段源码钉在哪一页上。

这一版写原理、Fiber 架构，以及迁入后的机制页。源码正文不写，只在阅读地图里留下目录和加页约定。

做完之后：

- 顶栏有「原理与架构」，没有「内部机制」
- 十四页都能从页头导航走到
- `/internals/...` 打开后落到新路径
- 设计约束、工作单元、双缓冲是新正文
- Fiber、Render、Scheduler、运行时总览不再重复这几页已经讲过的开篇

## 2. 已确认的决策

| # | 决策 | 选定 |
|---|---|---|
| D1 | 落点 | react-playground 内的新分类，与基础、Hooks、进阶专题、性能优化、Agent 实战、综合应用并列 |
| D2 | 与进阶专题的关系 | 进阶专题的目录、路由、注册行保持不动 |
| D3 | 与内部机制的关系 | 取消 `internals` 分类，十页迁入新分类 |
| D4 | 第一版内容 | 原理与 Fiber 架构，加上迁入的机制页和理解检验 |
| D5 | 源码解读 | 以后按 React 19 的 `react-reconciler` 与 `scheduler` 逐章添加；这一版只定义页面模板和目录 |
| D6 | 重复内容 | 同一件事只保留一处正文。迁入页删掉或收成链接，不与新页并排再讲一遍 |

## 3. 分类

| 项 | 值 |
|---|---|
| key | `architecture` |
| basePath | `/architecture` |
| 导航名 | 原理与架构 |
| 副标题 | Fiber 的设计约束、架构取舍，以及运行时怎样把一次更新做完 |
| 图标 | 继续用 `DeploymentUnitOutlined` |
| 配色 | fuchsia，见第 8 节 |
| 目录 | `packages/react-playground/src/topics/architecture/` |
| 顶栏位置 | 进阶专题之后、性能优化之前 |

`CategoryKey` 去掉 `'internals'`，加上 `'architecture'`。`CATEGORIES` 中删除内部机制，插入本分类。页面标题、`TopicPage` 的 title 从「内部机制 · …」改为「原理与架构 · …」。页头 `SeriesNav` 从 cyan 改为 fuchsia。

点击顶栏分类时，现有逻辑会跳到该分类注册的第一个专题。第一个专题是设计约束，因此顶栏入口打开 `/architecture/constraints`。`/architecture` 继续由分类入口路由重定向到第一页，不另做分类首页。

## 4. 阅读顺序

十四页共用一个 `SeriesNav`，分组如下。

| 组 | 页面 |
|---|---|
| 为什么 | 设计约束、运行时总览 |
| Fiber 架构 | 工作单元、Fiber、双缓冲 |
| 一次更新 | Render、Commit、更新队列、Hooks 链表、Scheduler |
| 入口 | 合成事件、SSR 与水合 |
| 接着读 | 阅读地图 |
| 复盘 | 理解检验 |

源码组这一版不出现在导航里。以后加源码页时再增加一组「源码」。

### 4.1 设计约束 `/architecture/constraints`（新写）

讲清三条必须同时成立的约束：

- 主线程一帧的时间有限
- 屏幕上任何时候都是一棵完整的树
- 更新有急有缓

栈协调器只能保住完整性：调用栈不返回，点击和下一帧都排不上。

页内放本分类唯一的可操作演示。同一棵树两种走法并排：

- 栈协调：点击出现在遍历结束之后，遍历过程中点击处于等待
- 工作单元：遍历可以在当前单元结束后让出，点击在让出时被处理，不必等整棵树走完

测试要能同时看到这两种状态，而不是只看到同一句说明。

现有 Fiber 页第 1 节「栈协调器停不下来」的讲解挪到这一页。Fiber 页不再保留这一节。

### 4.2 运行时总览 `/architecture/runtime-map`（迁入）

保留：三个包各自的职责、React Element 与 Fiber 不是同一种树、Render 与 Commit 两个阶段。

改写：

- 原第 5 节「两套优先级」收成一段，说明 Lane 与 Scheduler 各管一段，正文链到 `/architecture/scheduler`
- 原第 6 节「九页各自收口」整节挪到阅读地图。这一页不再充当系列索引

### 4.3 工作单元 `/architecture/work-unit`（新写）

可暂停要求调用栈可以是空的，进度记在节点上。因此子、兄弟、父、待处理的更新和优先级都挂在 Fiber 上。

讲清 Fiber 的身份：它是工作单元。React Element 是这一次 render 返回的描述，组件实例也不是这张链表上的节点。

用一张图列出调用栈清空之后，节点上必须留下哪些信息才能继续。三指针怎么走、字段怎么分组，链到 `/architecture/fiber`，不在这一页展开遍历演示。

### 4.4 Fiber `/architecture/fiber`（迁入）

保留：三指针（child / sibling / return）、字段分组、现有遍历演示 `WalkDemo`。

删除第 1 节，改为一句链回设计约束。第 4 节双缓冲收成一段，链到 `/architecture/double-buffer`。

### 4.5 双缓冲 `/architecture/double-buffer`（新写）

`current` 是已经发布的树，`workInProgress` 是正在算的树，`alternate` 把两棵树互相指着。渲染可以中断，也可以整段丢掉，所以不能边算边改屏幕上那棵树。Commit 才是一次发布。

页内把不变量写死：用户任何时候看到的都是一棵完整的树。mutation、layout、passive 三个子阶段链到 `/architecture/commit`，不在这一页展开时序演示。

### 4.6 Render `/architecture/render`（迁入）

开头新增一节「协调循环」：向下 `beginWork` 展开一个单元，向上 `completeWork` 收口一个单元；循环的间隙可以让出；算到一半的 `workInProgress` 可以整段丢掉，再从 `current` 重来。因此 Render 是推测性的。

保留原有的比对说明、`lastPlacedIndex` 和 `DiffDemo`。不另开「协调循环」页。

### 4.7 Commit `/architecture/commit`（迁入）

职责不变：同步改 DOM、绘制前的 layout、绘制后的 passive，以及为什么这段不能让出。`TimingDemo` 保持原有交互。标题和站内链接改为新路径。

### 4.8 更新队列 `/architecture/update-queue`（迁入）

职责不变：`setState` 先入队，Render 里再按顺序处理；批处理合并的是渲染次数。`QueueDemo` 保持原有交互。

### 4.9 Hooks 链表 `/architecture/hooks-impl`（迁入）

职责不变：`memoizedState` 按调用顺序成链；条件调用会串位。`HookSlots` 保持原有交互。

### 4.10 Scheduler `/architecture/scheduler`（迁入）

开头新增一节「两套优先级」：

- Lane 决定哪些更新进入这一轮
- Scheduler 决定这一轮什么时候把主线程还回去
- 只留其中一套，都会漏掉一种失败：紧急更新进了这一轮仍可能把帧占满，或者不知道该把哪些更新留到下一轮
- expirationTime 用一句话带过：一次渲染很难让多次更新各自进出，所以后来用 Lane 做挑选

保留原有的时间片模型 `SliceModel`。不另开「两套优先级」页。

### 4.11 合成事件 `/architecture/events`（迁入）

职责不变：监听在根容器上，分发时沿 `Fiber.return` 重放捕获和冒泡。`PathDemo` 保持原有交互。

### 4.12 SSR 与水合 `/architecture/ssr`（迁入）

职责不变：流式 HTML、`hydrateRoot` 复用已有 DOM，以及这条管线和 RSC 不是同一条。继续链到 `/advanced/rsc-guide`，不把 RSC 专题搬进来。

### 4.13 阅读地图 `/architecture/map`（新写）

两张表，加上从运行时总览第 6 节挪来的站内链接。

架构页与机制页的关系已经由页头导航表达。这一页的第一张表只记录「不要在这里重写」的站外专题：

| 题 | 链到 |
|---|---|
| 列表身份 | `/basics/list-key` |
| 原生监听与 `stopPropagation` | `/basics/event` |
| `useTransition` 的交互 | `/performance/transition-deferred` |
| Server Component 与 SSR 的边界 | `/advanced/rsc-guide` |

第二张表是源码架。单元格是目录，不是链接，因为这些路由这一版不注册：

| 以后的路径 | 读什么 | 钉住 |
|---|---|---|
| `/architecture/source/work-loop` | `workLoopConcurrent` / `performUnitOfWork` | Render |
| `/architecture/source/begin-work` | `beginWork` | 工作单元、Render |
| `/architecture/source/complete-work` | `completeWork` | Render |
| `/architecture/source/commit` | commit 三阶段的入口 | 双缓冲、Commit |
| `/architecture/source/hooks` | `memoizedState` 链表 | Hooks 链表 |
| `/architecture/source/lanes` | Lane 的合并与挑选 | Scheduler |
| `/architecture/source/scheduler` | 时间片与让出 | Scheduler |

### 4.14 理解检验 `/architecture/check`（由 interview 改名迁入）

现有六十道问答整库迁入，`related` 路径改为 `/architecture/...`。题库文件仍按 model、architecture、render、commit、state、scheduler、events 分组，分组名 `architecture` 只表示「Fiber 与运行时分工」这一组题，与分类 key 无关，不必改名。

在题库最前面增加一组「设计判断」，四题：

| id | 题干 | 结论 | 回链 |
|---|---|---|---|
| `q-design-screen` | 渲染期间为什么不能改屏幕上那棵树 | 屏幕上那棵是 `current`。渲染发生在 `workInProgress` 上，渲染可以中断或整段丢掉 | `/architecture/double-buffer` |
| `q-design-progress` | 进度为什么记在节点上，调用栈清空还能继续 | 子、兄弟、父和待处理的更新记在 Fiber 上，循环每一步都能从节点接着做 | `/architecture/work-unit` |
| `q-design-priority` | Lane 和 Scheduler 各挡住哪一种失败 | Lane 挡住「不该进入这一轮的更新混进来」；Scheduler 挡住「这一轮算完才把主线程还回去」 | `/architecture/scheduler` |
| `q-design-discard` | 丢掉 `workInProgress` 之后，屏幕上为什么还是上一棵完整的树 | 丢弃的是尚未发布的那一棵。`current` 要到 Commit 才切换 | `/architecture/double-buffer` |

每题沿用现有 `InterviewQuestion` 形状：`toc`、`title`、`note`、`points`、`related`、`body`。`points` 必须包含上表的结论。`related` 只有上表那一页。

页面标题用「理解检验」。旧路径 `/internals/interview` 指到这一页。

## 5. 以后加源码页

阅读对象是 React 19 的 `react-reconciler` 与 `scheduler`。页头写明所读的包版本。一章一页，路径是 `/architecture/source/<name>`，目录是 `src/topics/architecture/source/<name>/`。

每一页固定四段：

1. 这段代码在架构里的位置，链回第 4 节已经存在的一页
2. 顺着调用读的函数：文件名、函数名、谁调用谁
3. 它落实了哪一条设计取舍。控制流用缩短后的片段说明，不把整个源文件贴进页面
4. 机制细节链回对应的机制页

加一页时同步三处：`TOPICS` 注册一行，`series.ts` 的「源码」组加上链接，阅读地图里对应行从纯文本改成 `Link`。三处缺一处，系列测试或页面测试应失败。

这一版不创建 `source/` 目录，不注册上述七条路由。

## 6. 旧地址

`legacy-routes.ts` 的具体重定向先于前缀匹配，与现有 RSC 挪类同一规则。

具体重定向：

| 旧路径 | 新路径 |
|---|---|
| `/internals` | `/architecture/constraints` |
| `/internals/interview` | `/architecture/check` |

前缀通配：

| from | to |
|---|---|
| `/internals` | `/architecture` |

因此 `/internals/fiber` 落到 `/architecture/fiber`，其余 slug 相同的旧路径同样落过去。`/internals/interview` 命中具体规则，不会变成不存在的 `/architecture/interview`。

`/internals` 必须指向已注册专题。分类入口 `/architecture` 不在 `TOPICS` 里，不能作为 `LEGACY_REDIRECTS` 的目标。裸路径 `/internals` 落到设计约束。

路由器侧：具体规则注册为静态 `Route`；前缀沿用现有 `${from}/*`。裸路径靠具体规则命中，不依赖 splat 是否匹配无尾段。

站内已经写死的旧链接改为新路径：

- `src/topics/basics/check/bank.ts`
- `src/topics/hooks/check/core.ts`
- `src/topics/hooks/check/rest.ts`
- `src/topics/performance/check/bank.ts`
- `src/topics/performance/react-compiler/index.tsx`
- 迁入页内部的 `Link`、题库 `related`、系列导航

## 7. 目录与注册

```
src/topics/architecture/
  series.ts
  series.test.ts
  components/SeriesNav.tsx
  components/Prose.tsx
  constraints/
  runtime-map/
  work-unit/
  fiber/
  double-buffer/
  render/
  commit/
  update-queue/
  hooks-impl/
  scheduler/
  events/
  ssr/
  map/
  check/
    bank/
```

`src/topics/internals/` 删除。演示组件随页目录移动，不改交互：`WalkDemo`、`DiffDemo`、`TimingDemo`、`QueueDemo`、`HookSlots`、`SliceModel`、`PathDemo`。

`src/config/topics.tsx` 按第 4 节的顺序注册十四行，`category` 全部是 `'architecture'`，`path` 全部以 `/architecture/` 开头。`element` 从 `../topics/architecture/...` 懒加载。

`README.md` 的分类表用「原理与架构」替换「内部机制」那一行，说明里写上设计约束、Fiber 架构和迁入的运行时页面。`AGENTS.md` 里 react-playground 对 `internals` 分类的描述改为 `architecture`，避免后续改动再按已删除的分类加页。

sitemap 从注册表生成，不手改 `public/sitemap.xml`。

## 8. 配色

`CATEGORIES` 中本分类的 `theme`：

| 字段 | 类名 |
|---|---|
| iconChip | `bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-300` |
| dot | `bg-fuchsia-500` |
| text | `text-fuchsia-700 dark:text-fuchsia-300` |
| hoverBorder | `hover:border-fuchsia-200 dark:hover:border-fuchsia-700` |
| banner.border | `border-fuchsia-100 dark:border-fuchsia-900` |
| banner.bg | `bg-fuchsia-50/60 dark:bg-fuchsia-950/40` |
| banner.text | `text-fuchsia-700 dark:text-fuchsia-300` |
| banner.linkHover | `hover:text-fuchsia-800 dark:hover:text-fuchsia-200` |

`SeriesNav` 使用同一套 fuchsia，当前页是纯文本，其余用 `Link`。`aria-label` 为「原理与架构系列导航」。

## 9. 测试

现有注册表测试继续生效：路径唯一、`category` 合法、`path` 以所属 `basePath` 开头、每个分类至少一页。

`series.test.ts`：

- `SeriesNav` 里每条 `to` 都在 `TOPICS` 中
- 本分类第一页是 `/architecture/constraints`
- 最后一页是 `/architecture/check`
- 共十四页
- 导航中不出现 `/architecture/source/`

`legacy-routes.test.ts` 增加：

- `/internals/fiber` → `/architecture/fiber`
- `/internals/interview` → `/architecture/check`
- `/internals` → `/architecture/constraints`
- 迁移目标都在注册表中（沿用现有断言）

理解检验：

- 原有六十道仍在，且 `related` 不再指向 `/internals/`
- 四道设计判断的 id、结论和回链与第 4.14 节一致

设计约束页：两种走法的可见结果不同。

迁入的 `pages.test.tsx`、`demos.test.tsx`、`bank.test.ts` 随目录移动。断言中的「内部机制」和 `/internals/` 改为新标题和新路径。演示的交互断言保持原意。

## 10. 这一版不做

- 七个源码页的正文、目录和路由
- 重写现有演示的交互
- 改动进阶专题的页面和注册
- 应用层的状态归属、模块切分
- 完整的协调器模拟器
- 手改 sitemap
