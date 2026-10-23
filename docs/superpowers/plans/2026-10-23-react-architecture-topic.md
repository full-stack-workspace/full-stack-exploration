# 原理与架构专题 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用独立分类「原理与架构」收纳 Fiber 的设计约束和现有内部机制十页，旧 `/internals` 地址仍能打开。

**Architecture:** 先把 `src/topics/internals` 整目录迁到 `src/topics/architecture`，注册表、系列导航和旧链接一起改到 `/architecture`。随后按阅读顺序补设计约束、工作单元、双缓冲、阅读地图，并删掉迁入页里与新页重复的开篇。源码七页只出现在阅读地图的纯文本目录里。

**Tech Stack:** Rsbuild、React 19、TypeScript strict、React Router 6、Vitest、Testing Library、Tailwind 3。

**Spec:** `docs/superpowers/specs/2026-10-23-react-architecture-topic-design.md`

## Global Constraints

- 分类 key 是 `architecture`，basePath 是 `/architecture`，导航名是「原理与架构」，目录是 `packages/react-playground/src/topics/architecture/`
- 顶栏位置在进阶专题之后、性能优化之前；`CategoryKey` 去掉 `'internals'`
- 进阶专题的目录、路由、注册行保持不动
- 页面标题前缀是「原理与架构 · 」
- 配色是 spec 第 8 节的 fuchsia 类名；`SeriesNav` 的 `aria-label` 是「原理与架构系列导航」
- 图标继续用 `DeploymentUnitOutlined`
- 十四页的注册顺序与 `ARCHITECTURE_SERIES` 的链接顺序一致
- 源码路径 `/architecture/source/*` 这一版不注册、不建目录、不进 `SeriesNav`
- `/internals` → `/architecture/constraints`；`/internals/interview` → `/architecture/check`；其余 `/internals/<slug>` → `/architecture/<slug>`
- `LEGACY_REDIRECTS` 的目标必须是 `TOPICS` 里的 path；裸路径不能指向 `/architecture`
- 理解检验沿用 `InterviewQuestion`；`points` 至少 3 条，`body` 至少 2 段（现有 `bank.test.ts`）
- 现有演示组件的交互不改：`WalkDemo`、`DiffDemo`、`TimingDemo`、`QueueDemo`、`HookSlots`、`SliceModel`、`PathDemo`
- 不手改 `public/sitemap.xml`
- 阅读对象约定写 React 19 的 `react-reconciler` 与 `scheduler`，但这一版不写源码页正文

## Review Focus

- 打开 `/internals/interview` 时应进入理解检验 `/architecture/check`，而不是不存在的 `/architecture/interview`。测试在 Task 1。
- 打开 `/internals` 时应进入已注册的 `/architecture/constraints`。Task 1 先锁到迁入后的第一页，Task 2 在设计约束成为第一页时把目标改成 `/architecture/constraints`。
- 阅读地图上能看见七条源码路径的文字，这些路径不是链接，也不在 `TOPICS` 和 `SeriesNav` 里。测试在 Task 8。
- Fiber 页不再出现标题「栈协调器停不下来」，遍历演示的「下一步」仍在。测试在 Task 5。
- 基础、Hooks、性能理解检验和 React Compiler 页里不再留下 `/internals/`。测试在 Task 1。

---

### Task 1: 把内部机制迁成原理与架构

**Files:**
- Modify: `packages/react-playground/src/config/topics.tsx`
- Modify: `packages/react-playground/src/config/topics.test.ts`
- Modify: `packages/react-playground/src/config/legacy-routes.ts`
- Modify: `packages/react-playground/src/config/legacy-routes.test.ts`
- Modify: `packages/react-playground/src/topics/basics/check/bank.ts`
- Modify: `packages/react-playground/src/topics/hooks/check/core.ts`
- Modify: `packages/react-playground/src/topics/hooks/check/rest.ts`
- Modify: `packages/react-playground/src/topics/performance/check/bank.ts`
- Modify: `packages/react-playground/src/topics/performance/react-compiler/index.tsx`
- Move: `packages/react-playground/src/topics/internals/` → `packages/react-playground/src/topics/architecture/`
- Move: `packages/react-playground/src/topics/architecture/interview/` → `packages/react-playground/src/topics/architecture/check/`
- Modify: `packages/react-playground/src/topics/architecture/series.ts`
- Modify: `packages/react-playground/src/topics/architecture/series.test.ts`
- Modify: `packages/react-playground/src/topics/architecture/components/SeriesNav.tsx`
- Modify: `packages/react-playground/README.md`
- Modify: `AGENTS.md`
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes: 现有 `TOPICS`、`CATEGORIES`、`resolveLegacyRedirect`、`INTERNALS_SERIES`
- Produces: `CategoryKey` 含 `'architecture'` 且不含 `'internals'`。`ArchitectureTopicKey` 与 `ARCHITECTURE_SERIES` 从 `packages/react-playground/src/topics/architecture/series.ts` 导出。`SeriesNav` 的 props 是 `{ current: ArchitectureTopicKey }`。迁入后的十个 path 为 `/architecture/runtime-map`、`/architecture/fiber`、`/architecture/render`、`/architecture/commit`、`/architecture/update-queue`、`/architecture/hooks-impl`、`/architecture/scheduler`、`/architecture/events`、`/architecture/ssr`、`/architecture/check`

- [ ] **Step 1: Write the failing test**

在 `packages/react-playground/src/config/topics.test.ts` 末尾追加：

```ts
it('原理与架构取代内部机制，进阶专题路径不变', () => {
    expect(CATEGORIES.map((c) => c.key)).not.toContain('internals');
    expect(CATEGORIES.map((c) => c.key)).toContain('architecture');
    const advancedIndex = CATEGORIES.findIndex((c) => c.key === 'advanced');
    const architectureIndex = CATEGORIES.findIndex((c) => c.key === 'architecture');
    const performanceIndex = CATEGORIES.findIndex((c) => c.key === 'performance');
    expect(architectureIndex).toBe(advancedIndex + 1);
    expect(performanceIndex).toBe(architectureIndex + 1);

    const paths = TOPICS.filter((t) => t.category === 'architecture').map((t) => t.path);
    expect(paths).toEqual([
        '/architecture/runtime-map',
        '/architecture/fiber',
        '/architecture/render',
        '/architecture/commit',
        '/architecture/update-queue',
        '/architecture/hooks-impl',
        '/architecture/scheduler',
        '/architecture/events',
        '/architecture/ssr',
        '/architecture/check',
    ]);

    expect(TOPICS.filter((t) => t.category === 'advanced').map((t) => t.path)).toEqual([
        '/advanced/component-comm-guide',
        '/advanced/component-comm-playground',
        '/advanced/component-comm-practice',
        '/advanced/context',
        '/advanced/error-boundary',
        '/advanced/relay',
        '/advanced/rsc-guide',
        '/advanced/rsc-boundary',
        '/advanced/view-transition-activity',
        '/advanced/check',
    ]);
});
```

在 `legacy-routes.test.ts` 的 `describe` 内追加：

```ts
it('内部机制旧地址落到原理与架构', () => {
    expect(resolveLegacyRedirect('/internals/fiber')).toBe('/architecture/fiber');
    expect(resolveLegacyRedirect('/internals/interview')).toBe('/architecture/check');
    expect(resolveLegacyRedirect('/internals')).toBe('/architecture/runtime-map');
    expect(resolveLegacyRedirect('/internals/runtime-map')).toBe('/architecture/runtime-map');
});

it('基础、Hooks、性能和 Compiler 不再链接 /internals/', () => {
    const files = [
        'src/topics/basics/check/bank.ts',
        'src/topics/hooks/check/core.ts',
        'src/topics/hooks/check/rest.ts',
        'src/topics/performance/check/bank.ts',
        'src/topics/performance/react-compiler/index.tsx',
    ];
    for (const file of files) {
        const source = require('node:fs').readFileSync(require('node:path').join(process.cwd(), file), 'utf8');
        expect(source).not.toContain('/internals/');
    }
});
```

`process.cwd()` 在 `pnpm -C packages/react-playground` 下是包目录。测试文件改用：

```ts
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
```

以及 `readFileSync(join(__dirname, '..', '..', file), 'utf8')`。`legacy-routes.test.ts` 位于 `src/config/`，`file` 以 `src/topics/...` 开头，因此 join 的起点是包根：`join(__dirname, '..', '..', file)`。

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm -C packages/react-playground exec vitest run src/config/topics.test.ts src/config/legacy-routes.test.ts`

Expected: FAIL。`architecture` 不在分类里，`/internals/fiber` 解析为 `undefined`。

- [ ] **Step 3: Move the tree and retarget registration**

```bash
git mv packages/react-playground/src/topics/internals packages/react-playground/src/topics/architecture
git mv packages/react-playground/src/topics/architecture/interview packages/react-playground/src/topics/architecture/check
```

把 `topics.tsx` 的 `CategoryKey` 改为：

```ts
export type CategoryKey = 'basics' | 'hooks' | 'advanced' | 'architecture' | 'apps' | 'agent' | 'performance';
```

用下面这个对象替换原来的 `internals` 分类对象（仍放在 `advanced` 与 `performance` 之间）：

```tsx
{
    key: 'architecture',
    basePath: '/architecture',
    title: '原理与架构',
    subtitle: 'Fiber 的设计约束、架构取舍，以及运行时怎样把一次更新做完',
    theme: {
        icon: <DeploymentUnitOutlined />,
        iconChip: 'bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-300',
        dot: 'bg-fuchsia-500',
        text: 'text-fuchsia-700 dark:text-fuchsia-300',
        hoverBorder: 'hover:border-fuchsia-200 dark:hover:border-fuchsia-700',
        banner: {
            border: 'border-fuchsia-100 dark:border-fuchsia-900',
            bg: 'bg-fuchsia-50/60 dark:bg-fuchsia-950/40',
            text: 'text-fuchsia-700 dark:text-fuchsia-300',
            linkHover: 'hover:text-fuchsia-800 dark:hover:text-fuchsia-200',
        },
    },
},
```

十行注册的 `category` 改为 `'architecture'`，`path` 与 `import()` 改为：

```ts
{ path: '/architecture/runtime-map', element: lazy(() => import('../topics/architecture/runtime-map')) },
{ path: '/architecture/fiber', element: lazy(() => import('../topics/architecture/fiber')) },
{ path: '/architecture/render', element: lazy(() => import('../topics/architecture/render')) },
{ path: '/architecture/commit', element: lazy(() => import('../topics/architecture/commit')) },
{ path: '/architecture/update-queue', element: lazy(() => import('../topics/architecture/update-queue')) },
{ path: '/architecture/hooks-impl', element: lazy(() => import('../topics/architecture/hooks-impl')) },
{ path: '/architecture/scheduler', element: lazy(() => import('../topics/architecture/scheduler')) },
{ path: '/architecture/events', element: lazy(() => import('../topics/architecture/events')) },
{ path: '/architecture/ssr', element: lazy(() => import('../topics/architecture/ssr')) },
{ path: '/architecture/check', element: lazy(() => import('../topics/architecture/check')) },
```

每行保留原来的 `title` 与 `description`，只改上面三项。

`legacy-routes.ts` 的 `LEGACY_REDIRECTS` 增加：

```ts
'/internals': '/architecture/runtime-map',
'/internals/interview': '/architecture/check',
```

`LEGACY_PREFIX_REDIRECTS` 增加 `{ from: '/internals', to: '/architecture' }`。具体规则必须仍在前缀规则之前被 `resolveLegacyRedirect` 命中。

在 `src/topics/architecture` 以及 Task 1 列出的五个站外文件中，先把 `/internals/interview` 换成 `/architecture/check`，再把剩余的 `/internals/` 换成 `/architecture/`。`check/index.tsx` 里 `current="interview"` 改为 `current="check"`。页面 `title` 里的「内部机制 · 」改为「原理与架构 · 」。`@module topics/internals` 改为 `@module topics/architecture`。

用下面的文件覆盖 `src/topics/architecture/series.ts`：

```ts
/**
 * ============================================================================
 * series.ts — 原理与架构的系列目录
 * ============================================================================
 *
 * 迁入后的十页。后续任务把设计约束、工作单元、双缓冲、阅读地图插进对应组。
 *
 * @module topics/architecture/series
 */

export type ArchitectureTopicKey =
    | 'runtime-map'
    | 'fiber'
    | 'render'
    | 'commit'
    | 'update-queue'
    | 'hooks-impl'
    | 'scheduler'
    | 'events'
    | 'ssr'
    | 'check';

export interface SeriesLink {
    key: ArchitectureTopicKey;
    to: string;
    label: string;
}

export interface ArchitectureSeries {
    id: 'why' | 'fiber' | 'update' | 'entry' | 'review';
    title: string;
    links: readonly SeriesLink[];
}

export const ARCHITECTURE_SERIES: readonly ArchitectureSeries[] = [
    {
        id: 'why',
        title: '为什么',
        links: [{ key: 'runtime-map', to: '/architecture/runtime-map', label: '运行时总览' }],
    },
    {
        id: 'fiber',
        title: 'Fiber 架构',
        links: [{ key: 'fiber', to: '/architecture/fiber', label: 'Fiber' }],
    },
    {
        id: 'update',
        title: '一次更新',
        links: [
            { key: 'render', to: '/architecture/render', label: 'Render' },
            { key: 'commit', to: '/architecture/commit', label: 'Commit' },
            { key: 'update-queue', to: '/architecture/update-queue', label: '更新队列' },
            { key: 'hooks-impl', to: '/architecture/hooks-impl', label: 'Hooks 链表' },
            { key: 'scheduler', to: '/architecture/scheduler', label: 'Scheduler' },
        ],
    },
    {
        id: 'entry',
        title: '入口',
        links: [
            { key: 'events', to: '/architecture/events', label: '合成事件' },
            { key: 'ssr', to: '/architecture/ssr', label: 'SSR 与水合' },
        ],
    },
    {
        id: 'review',
        title: '复盘',
        links: [{ key: 'check', to: '/architecture/check', label: '理解检验' }],
    },
];
```

`series.test.ts` 改为导入 `ARCHITECTURE_SERIES`，断言每条 `to` 都在 `TOPICS`，且：

```ts
const paths = TOPICS.filter((t) => t.category === 'architecture').map((t) => t.path);
expect(paths[0]).toBe('/architecture/runtime-map');
expect(paths[paths.length - 1]).toBe('/architecture/check');
expect(paths).toHaveLength(10);
expect(ARCHITECTURE_SERIES.flatMap((series) => series.links.map((link) => link.to)).join(' ')).not.toContain(
    '/architecture/source/',
);
```

`SeriesNav.tsx` 改为导入 `ARCHITECTURE_SERIES` 与 `ArchitectureTopicKey`。容器类名：

```tsx
className="rounded-card space-y-3 border border-fuchsia-100 bg-fuchsia-50/70 px-4 py-3 text-xs text-fuchsia-900 dark:border-fuchsia-900 dark:bg-fuchsia-950/40 dark:text-fuchsia-100"
```

组标题 `text-fuchsia-800 dark:text-fuchsia-200`。当前页 `bg-fuchsia-200/80 text-fuchsia-950 dark:bg-fuchsia-800/80 dark:text-fuchsia-50`。链接 hover `hover:text-fuchsia-950 dark:hover:text-fuchsia-50`。`aria-label="原理与架构系列导航"`。

`pages.test.tsx` 的导入改为 `./check`，标题期望中的「内部机制 · 」改为「原理与架构 · 」。`demos.test.tsx` 若断言了 `/internals/` 或「内部机制」，做同样替换。

`README.md` 分类表中「内部机制」那一行先替换为迁入后的事实。Task 9 再补上设计页：

```md
| **原理与架构** | 迁入的运行时页面：Fiber、Render / Commit、更新队列、Hooks 链表、Scheduler、事件与水合；末页用问答检验 |
```

同文件「internals / performance 两个长系列」改为「architecture / performance 两个长系列」。

`AGENTS.md` 与 `CLAUDE.md` 里 category 列举中的 `internals` 改为 `architecture`，basePath 例子补上 `/architecture`。把「内部机制」那条目录说明替换为：

```md
- `src/topics/architecture/` — 「原理与架构」分类(basePath `/architecture`，插在进阶与性能之间)：运行时总览 → Fiber → Render → Commit → 更新队列 → Hooks 链表 → Scheduler → 合成事件 → SSR 与水合 → 理解检验(目录 `check/`)；页头 `SeriesNav`(fuchsia)
```

Task 9 把这一条改成十四页的最终顺序。

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm -C packages/react-playground exec vitest run src/config/topics.test.ts src/config/legacy-routes.test.ts src/topics/architecture`

Expected: PASS。

- [ ] **Step 5: Commit**

```bash
git add packages/react-playground/src/config/topics.tsx packages/react-playground/src/config/topics.test.ts packages/react-playground/src/config/legacy-routes.ts packages/react-playground/src/config/legacy-routes.test.ts packages/react-playground/src/topics/architecture packages/react-playground/src/topics/basics/check/bank.ts packages/react-playground/src/topics/hooks/check/core.ts packages/react-playground/src/topics/hooks/check/rest.ts packages/react-playground/src/topics/performance/check/bank.ts packages/react-playground/src/topics/performance/react-compiler/index.tsx packages/react-playground/README.md AGENTS.md CLAUDE.md
git commit -m "$(cat <<'EOF'
refactor(react-playground): 将内部机制迁入原理与架构

旧 /internals 地址继续可打开，顶栏不再保留已删除的分类。

EOF
)"
```

确认 `git status` 里不再出现 `src/topics/internals`。

---

### Task 2: 设计约束页

**Files:**
- Create: `packages/react-playground/src/topics/architecture/constraints/YieldCompare.tsx`
- Create: `packages/react-playground/src/topics/architecture/constraints/index.tsx`
- Create: `packages/react-playground/src/topics/architecture/constraints/index.test.tsx`
- Modify: `packages/react-playground/src/topics/architecture/series.ts`
- Modify: `packages/react-playground/src/topics/architecture/series.test.ts`
- Modify: `packages/react-playground/src/config/topics.tsx`
- Modify: `packages/react-playground/src/config/topics.test.ts`
- Modify: `packages/react-playground/src/config/legacy-routes.ts`
- Modify: `packages/react-playground/src/config/legacy-routes.test.ts`

**Interfaces:**
- Consumes: `SeriesNav`、`TopicPage`、`TopicSection`、`P`、`Stack`、`Diagram`、`ArchitectureTopicKey`
- Produces: path `/architecture/constraints`，`ArchitectureTopicKey` 增加 `'constraints'`。它是分类第一页。`LEGACY_REDIRECTS['/internals']` 改为 `'/architecture/constraints'`

- [ ] **Step 1: Write the failing test**

`constraints/index.test.tsx`：

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import ConstraintsPage from './index';

describe('设计约束', () => {
    it('同时呈现栈协调的等待和工作单元的让出', async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter>
                <ConstraintsPage />
            </MemoryRouter>,
        );

        expect(screen.getByRole('heading', { name: '原理与架构 · 设计约束' })).toBeInTheDocument();
        expect(screen.getByText('点击处于等待')).toBeInTheDocument();
        expect(screen.getByText('遍历尚未让出')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: '走完调用栈' }));
        await user.click(screen.getByRole('button', { name: '让出当前单元' }));

        expect(screen.getByText('点击出现在遍历结束之后')).toBeInTheDocument();
        expect(screen.getByText('点击在让出时被处理')).toBeInTheDocument();
    });
});
```

把 `topics.test.ts` 里原理与架构的 path 数组第一项改为 `'/architecture/constraints'`，长度改为 11。`series.test.ts` 的第一页与长度做同样修改。`legacy-routes.test.ts` 中 `/internals` 的期望改为 `'/architecture/constraints'`。

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm -C packages/react-playground exec vitest run src/topics/architecture/constraints/index.test.tsx src/config/topics.test.ts src/config/legacy-routes.test.ts`

Expected: FAIL。找不到 `./index` 或页面模块。

- [ ] **Step 3: Write minimal implementation**

`YieldCompare.tsx`：

```tsx
/**
 * ============================================================================
 * YieldCompare — 栈协调与工作单元的让出对照
 * ============================================================================
 *
 * 两种走法始终并排。栈协调要等整段遍历结束才处理点击；
 * 工作单元在当前单元结束后就可以把点击插进来。
 *
 * @module topics/architecture/constraints/YieldCompare
 */

import { memo, useState } from 'react';

export const YieldCompare = memo(() => {
    const [stackDone, setStackDone] = useState(false);
    const [unitYielded, setUnitYielded] = useState(false);

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <section aria-label="栈协调" className="rounded-lg border border-fuchsia-100 p-3 dark:border-fuchsia-900">
                <h3 className="text-sm font-medium text-fuchsia-900 dark:text-fuchsia-100">栈协调</h3>
                <button type="button" className="mt-2 underline" onClick={() => setStackDone(true)}>
                    走完调用栈
                </button>
                <p className="mt-2 text-sm">{stackDone ? '点击出现在遍历结束之后' : '点击处于等待'}</p>
            </section>
            <section aria-label="工作单元" className="rounded-lg border border-fuchsia-100 p-3 dark:border-fuchsia-900">
                <h3 className="text-sm font-medium text-fuchsia-900 dark:text-fuchsia-100">工作单元</h3>
                <button type="button" className="mt-2 underline" onClick={() => setUnitYielded(true)}>
                    让出当前单元
                </button>
                <p className="mt-2 text-sm">{unitYielded ? '点击在让出时被处理' : '遍历尚未让出'}</p>
            </section>
        </div>
    );
});

YieldCompare.displayName = 'YieldCompare';
```

`constraints/index.tsx` 用 `TopicPage` 标题「原理与架构 · 设计约束」，`SeriesNav current="constraints"`。三个 `TopicSection`：

1. 「三条约束同时成立」：主线程一帧的时间有限；屏幕上任何时候都是一棵完整的树；更新有急有缓。
2. 「栈协调器只能保住完整性」：调用栈不返回，点击和下一帧都排不上。放这张图，图下接 `YieldCompare`：

```tsx
<Diagram caption="递归调用栈没有安全的暂停点">
    {`reconcile(App)
  reconcile(Header)
    reconcile(Title)      ← 调用栈里同时压着三帧
  reconcile(List)
    reconcile(Item) ...   ← 必须等最深的返回,才能处理点击

想暂停?调用栈不属于 React,中途 return 就丢了「走到哪」。`}
</Diagram>
```
3. 「Fiber 是为了还能停下来」：一句收口，`Link` 到 `/architecture/fiber`，链接文字「Fiber」。

`series.ts` 的 `ArchitectureTopicKey` 增加 `'constraints'`。`id: 'why'` 的 links 改为先「设计约束」再「运行时总览」：

```ts
links: [
    { key: 'constraints', to: '/architecture/constraints', label: '设计约束' },
    { key: 'runtime-map', to: '/architecture/runtime-map', label: '运行时总览' },
],
```

`topics.tsx` 在运行时总览之前插入：

```ts
{
    path: '/architecture/constraints',
    title: '设计约束',
    category: 'architecture',
    description: '主线程的一帧、屏幕上的完整树、更新的缓急，这三条一起把栈协调器逼停',
    element: lazy(() => import('../topics/architecture/constraints')),
},
```

`LEGACY_REDIRECTS['/internals']` 改为 `'/architecture/constraints'`。

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm -C packages/react-playground exec vitest run src/topics/architecture/constraints/index.test.tsx src/topics/architecture/series.test.ts src/config/topics.test.ts src/config/legacy-routes.test.ts`

Expected: PASS。

- [ ] **Step 5: Commit**

```bash
git add packages/react-playground/src/topics/architecture/constraints packages/react-playground/src/topics/architecture/series.ts packages/react-playground/src/topics/architecture/series.test.ts packages/react-playground/src/config/topics.tsx packages/react-playground/src/config/topics.test.ts packages/react-playground/src/config/legacy-routes.ts packages/react-playground/src/config/legacy-routes.test.ts
git commit -m "$(cat <<'EOF'
feat(react-playground): 用设计约束说明 Fiber 为什么要停下来

三条约束和让出对照放在分类第一页，裸的 /internals 也落到这里。

EOF
)"
```

---

### Task 3: 工作单元页

**Files:**
- Create: `packages/react-playground/src/topics/architecture/work-unit/index.tsx`
- Create: `packages/react-playground/src/topics/architecture/work-unit/index.test.tsx`
- Modify: `packages/react-playground/src/topics/architecture/series.ts`
- Modify: `packages/react-playground/src/config/topics.tsx`
- Modify: `packages/react-playground/src/config/topics.test.ts`
- Modify: `packages/react-playground/src/topics/architecture/series.test.ts`

**Interfaces:**
- Consumes: `SeriesNav`、`Diagram`、`TopicPage`、`TopicSection`
- Produces: path `/architecture/work-unit`。`ArchitectureTopicKey` 增加 `'work-unit'`。系列中它位于运行时总览之后、Fiber 之前

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import WorkUnitPage from './index';

describe('工作单元', () => {
    it('说明进度记在节点上，并把遍历留给 Fiber 页', () => {
        render(
            <MemoryRouter>
                <WorkUnitPage />
            </MemoryRouter>,
        );
        expect(screen.getByRole('heading', { name: '原理与架构 · 工作单元' })).toBeInTheDocument();
        expect(screen.getByText(/React Element 是这一次 render 返回的描述/)).toBeInTheDocument();
        const fiberLinks = screen.getAllByRole('link', { name: 'Fiber' });
        expect(fiberLinks.length).toBeGreaterThan(0);
        for (const link of fiberLinks) {
            expect(link).toHaveAttribute('href', '/architecture/fiber');
        }
        expect(screen.queryByRole('button', { name: '下一步' })).not.toBeInTheDocument();
    });
});
```

`topics.test.ts` 与 `series.test.ts` 的路径列表在 `runtime-map` 后插入 `'/architecture/work-unit'`，长度改为 12。

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm -C packages/react-playground exec vitest run src/topics/architecture/work-unit/index.test.tsx`

Expected: FAIL。模块不存在。

- [ ] **Step 3: Write minimal implementation**

页面两节：

1. 「调用栈可以是空的」：子、兄弟、父、待处理的更新和优先级都挂在 Fiber 上。写明 Fiber 是工作单元，React Element 是这一次 render 返回的描述，组件实例不是这张链表上的节点。
2. 「清空之后节点上还留着什么」：`Diagram` 列出 `child`、`sibling`、`return`、`updateQueue`、`lanes`。段末 `Link` 到 `/architecture/fiber`，文字「Fiber」。不要引入 `WalkDemo`。

`series.ts` 的 Fiber 架构组改为：

```ts
links: [
    { key: 'work-unit', to: '/architecture/work-unit', label: '工作单元' },
    { key: 'fiber', to: '/architecture/fiber', label: 'Fiber' },
],
```

`topics.tsx` 把对应注册行插在运行时总览和 Fiber 之间。`title` 为「工作单元」，`description` 为「进度记在节点上，调用栈清空之后还能从 child、sibling、return 接着做」。

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm -C packages/react-playground exec vitest run src/topics/architecture/work-unit/index.test.tsx src/topics/architecture/series.test.ts src/config/topics.test.ts`

Expected: PASS。

- [ ] **Step 5: Commit**

```bash
git add packages/react-playground/src/topics/architecture/work-unit packages/react-playground/src/topics/architecture/series.ts packages/react-playground/src/topics/architecture/series.test.ts packages/react-playground/src/config/topics.tsx packages/react-playground/src/config/topics.test.ts
git commit -m "$(cat <<'EOF'
feat(react-playground): 把可暂停的前提写成工作单元页

遍历演示留在 Fiber 页，这一页只说明进度必须记在节点上。

EOF
)"
```

---

### Task 4: 双缓冲页

**Files:**
- Create: `packages/react-playground/src/topics/architecture/double-buffer/index.tsx`
- Create: `packages/react-playground/src/topics/architecture/double-buffer/index.test.tsx`
- Modify: `packages/react-playground/src/topics/architecture/series.ts`
- Modify: `packages/react-playground/src/config/topics.tsx`
- Modify: `packages/react-playground/src/config/topics.test.ts`
- Modify: `packages/react-playground/src/topics/architecture/series.test.ts`

**Interfaces:**
- Consumes: `TopicPage`、`TopicSection`、`Diagram`、`SeriesNav`
- Produces: path `/architecture/double-buffer`。`ArchitectureTopicKey` 增加 `'double-buffer'`。系列中它位于 Fiber 之后、Render 之前

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import DoubleBufferPage from './index';

describe('双缓冲', () => {
    it('写死屏幕上永远是完整的树，并把三个子阶段链到 Commit', () => {
        render(
            <MemoryRouter>
                <DoubleBufferPage />
            </MemoryRouter>,
        );
        expect(screen.getByRole('heading', { name: '原理与架构 · 双缓冲' })).toBeInTheDocument();
        expect(screen.getByText('用户任何时候看到的都是一棵完整的树')).toBeInTheDocument();
        const commitLinks = screen.getAllByRole('link', { name: 'Commit' });
        expect(commitLinks.length).toBeGreaterThan(0);
        for (const link of commitLinks) {
            expect(link).toHaveAttribute('href', '/architecture/commit');
        }
        expect(screen.queryByText('mutation')).not.toBeInTheDocument();
    });
});
```

链接文字用「Commit」。正文可以写 `current`、`workInProgress`、`alternate`，不要写 mutation、layout、passive 这三个阶段名。路径列表在 `fiber` 后插入 `'/architecture/double-buffer'`，长度改为 13。

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm -C packages/react-playground exec vitest run src/topics/architecture/double-buffer/index.test.tsx`

Expected: FAIL。模块不存在。

- [ ] **Step 3: Write minimal implementation**

一节「计算不改屏幕上那棵树」：`current` 是已经发布的树，`workInProgress` 是正在算的树，`alternate` 把两棵树互相指着。渲染可以中断，也可以整段丢掉。单独一段，原文就是「用户任何时候看到的都是一棵完整的树」。段末 `Link` 到 `/architecture/commit`，文字「Commit」。不要放入 `TimingDemo`。

`series.ts` 的 Fiber 架构组三链接顺序：工作单元、Fiber、双缓冲。`topics.tsx` 注册行插在 Fiber 与 Render 之间。`title`「双缓冲」，`description`「current 保持完整，workInProgress 可以丢掉，Commit 才发布」。

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm -C packages/react-playground exec vitest run src/topics/architecture/double-buffer/index.test.tsx src/topics/architecture/series.test.ts src/config/topics.test.ts`

Expected: PASS。

- [ ] **Step 5: Commit**

```bash
git add packages/react-playground/src/topics/architecture/double-buffer packages/react-playground/src/topics/architecture/series.ts packages/react-playground/src/topics/architecture/series.test.ts packages/react-playground/src/config/topics.tsx packages/react-playground/src/config/topics.test.ts
git commit -m "$(cat <<'EOF'
feat(react-playground): 用双缓冲页保住屏幕上的完整树

Commit 的三个子阶段留在原页，这里只写发布前后的不变量。

EOF
)"
```

---

### Task 5: Fiber 页去掉重复开篇

**Files:**
- Modify: `packages/react-playground/src/topics/architecture/fiber/index.tsx`
- Modify: `packages/react-playground/src/topics/architecture/pages.test.tsx`

**Interfaces:**
- Consumes: `/architecture/constraints`、`/architecture/double-buffer`、现有 `WalkDemo`
- Produces: Fiber 页保留三指针、字段分组和「下一步」按钮；不再包含「栈协调器停不下来」和「alternate 把两棵树的对应节点缝在一起」

- [ ] **Step 1: Write the failing test**

在 `pages.test.tsx` 追加：

```tsx
it('Fiber 页把栈协调和双缓冲交给前面的架构页', () => {
    renderPage(FiberPage);
    expect(screen.queryByRole('heading', { name: '1. 栈协调器停不下来' })).not.toBeInTheDocument();
    expect(screen.queryByText('alternate 把两棵树的对应节点缝在一起')).not.toBeInTheDocument();
    for (const link of screen.getAllByRole('link', { name: '设计约束' })) {
        expect(link).toHaveAttribute('href', '/architecture/constraints');
    }
    for (const link of screen.getAllByRole('link', { name: '双缓冲' })) {
        expect(link).toHaveAttribute('href', '/architecture/double-buffer');
    }
    expect(screen.getByRole('button', { name: '下一步' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '1. 三个指针走完整棵树' })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm -C packages/react-playground exec vitest run src/topics/architecture/pages.test.tsx`

Expected: FAIL。标题「1. 栈协调器停不下来」仍在。

- [ ] **Step 3: Write minimal implementation**

删除 Fiber 页第 1 节整段（含「递归调用栈没有安全的暂停点」图）。在 `SeriesNav` 后加一句：

```tsx
<P>
    栈协调器为什么停不下来，写在
    <Link className="mx-1 text-fuchsia-700 underline underline-offset-2 dark:text-fuchsia-300" to="/architecture/constraints">
        设计约束
    </Link>
    。
</P>
```

原第 2 节标题改为「1. 三个指针走完整棵树」。原第 3 节标题改为「2. 字段里真正要记住的」。删除原第 4 节的图和两段长文，换成一句：

```tsx
<P>
    屏幕上那棵树为什么不能边算边改，写在
    <Link className="mx-1 text-fuchsia-700 underline underline-offset-2 dark:text-fuchsia-300" to="/architecture/double-buffer">
        双缓冲
    </Link>
    。
</P>
```

保留指向 `/performance/render-scheduling-guide` 的链接，放在这句后面。

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm -C packages/react-playground exec vitest run src/topics/architecture/pages.test.tsx src/topics/architecture/fiber`

Expected: PASS。同时跑 `src/topics/architecture/demos.test.tsx`。

- [ ] **Step 5: Commit**

```bash
git add packages/react-playground/src/topics/architecture/fiber/index.tsx packages/react-playground/src/topics/architecture/pages.test.tsx
git commit -m "$(cat <<'EOF'
refactor(react-playground): Fiber 页只保留指针、字段和遍历

栈协调与双缓冲的正文已经有专页，这里改成回链。

EOF
)"
```

---

### Task 6: Render 页补上协调循环

**Files:**
- Modify: `packages/react-playground/src/topics/architecture/render/index.tsx`
- Modify: `packages/react-playground/src/topics/architecture/pages.test.tsx`

**Interfaces:**
- Consumes: 现有 `DiffDemo`
- Produces: Render 页第一节标题为「1. 协调循环可以让出，也可以丢掉」；原「1. 一个工作单元里的向下和向上」改为第 2 节

- [ ] **Step 1: Write the failing test**

```tsx
it('Render 页先讲可让出可丢弃的循环，再保留比对演示', () => {
    renderPage(RenderPage);
    expect(screen.getByRole('heading', { name: '1. 协调循环可以让出，也可以丢掉' })).toBeInTheDocument();
    expect(screen.getByText(/Render 是推测性的/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '2. 一个工作单元里的向下和向上' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '尾部插入 e' })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm -C packages/react-playground exec vitest run src/topics/architecture/pages.test.tsx`

Expected: FAIL。找不到新标题。

- [ ] **Step 3: Write minimal implementation**

在现有第一节之前插入：

```tsx
<TopicSection
    title="1. 协调循环可以让出，也可以丢掉"
    note="讲解要点:向下 beginWork，向上 completeWork。间隙可以让出。算到一半的 workInProgress 可以整段丢掉。"
>
    <Stack>
        <P>
            一次更新是循环。向下 beginWork 展开一个单元，向上 completeWork 收口一个单元。时间不够就把下一个单元记下来。算到一半的 workInProgress 可以整段丢掉，再从 current 重来。因此 Render 是推测性的。
        </P>
    </Stack>
</TopicSection>
```

原第一节标题改为「2. 一个工作单元里的向下和向上」。其余标题改为：

- 「3. 两条假设,把树比较从立方降到线性」
- 「4. 多个孩子:先吃掉相同前缀,再按 key 查表」
- 「5. bailout:子树可以整段跳过」
- 「6. 这段计算可以被扔掉」

保留 `DiffDemo` 与 `lastPlacedIndex` 的正文。

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm -C packages/react-playground exec vitest run src/topics/architecture/pages.test.tsx src/topics/architecture/demos.test.tsx`

Expected: PASS。

- [ ] **Step 5: Commit**

```bash
git add packages/react-playground/src/topics/architecture/render/index.tsx packages/react-playground/src/topics/architecture/pages.test.tsx
git commit -m "$(cat <<'EOF'
feat(react-playground): Render 页先说明循环为何可以丢掉

比对和 lastPlacedIndex 仍留在后面，不另开协调循环页。

EOF
)"
```

---

### Task 7: Scheduler 补两套优先级，运行时总览收成链接

**Files:**
- Modify: `packages/react-playground/src/topics/architecture/scheduler/index.tsx`
- Modify: `packages/react-playground/src/topics/architecture/runtime-map/index.tsx`
- Modify: `packages/react-playground/src/topics/architecture/pages.test.tsx`

**Interfaces:**
- Consumes: 现有 `SliceModel`、`/architecture/scheduler`
- Produces: Scheduler 新增第一节「1. 只留一套会漏掉一种失败」。运行时总览不再包含标题「5. 两套优先级,不要合成一个词」，改为链到 Scheduler

- [ ] **Step 1: Write the failing test**

```tsx
it('Scheduler 写明只留一套优先级会漏掉的失败', () => {
    renderPage(SchedulerPage);
    expect(screen.getByRole('heading', { name: '1. 只留一套会漏掉一种失败' })).toBeInTheDocument();
    expect(screen.getByText(/紧急更新进了这一轮仍可能把帧占满/)).toBeInTheDocument();
    expect(screen.getByText(/不知道该把哪些更新留到下一轮/)).toBeInTheDocument();
    expect(screen.getByText(/后来用 Lane 做挑选/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '走一个工作单元' })).toBeInTheDocument();
});

it('运行时总览把两套优先级指到 Scheduler', () => {
    renderPage(RuntimeMap);
    expect(screen.queryByRole('heading', { name: '5. 两套优先级,不要合成一个词' })).not.toBeInTheDocument();
    const links = screen.getAllByRole('link', { name: 'Scheduler' });
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
        expect(link).toHaveAttribute('href', '/architecture/scheduler');
    }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm -C packages/react-playground exec vitest run src/topics/architecture/pages.test.tsx`

Expected: FAIL。Scheduler 的第一节仍是「1. 两套优先级,不要合成一个词」。

- [ ] **Step 3: Write minimal implementation**

Scheduler 页在现有内容前插入：

```tsx
<TopicSection
    title="1. 只留一套会漏掉一种失败"
    note="讲解要点:Lane 管这一轮算谁。Scheduler 管这一轮何时把主线程还回去。"
>
    <Stack>
        <P>
            只留 Lane，紧急更新进了这一轮仍可能把帧占满。只留 Scheduler，不知道该把哪些更新留到下一轮。expirationTime 一次渲染很难让多次更新各自进出，所以后来用 Lane 做挑选。
        </P>
    </Stack>
</TopicSection>
```

原「1. 两套优先级,不要合成一个词」改为「2. 两套优先级,不要合成一个词」。「2. 5 毫秒是让出点,不是渲染的工期」改为第 3 节。「3. 饥饿与过期」改为第 4 节。保留 `SliceModel`。

运行时总览第 5 节替换为：

```tsx
<TopicSection
    title="5. 两套优先级各管一段"
    note="讲解要点:Lane 决定哪些更新进入这一轮，Scheduler 决定何时把主线程还回去。失败模式在 Scheduler 页。"
>
    <Stack>
        <P>
            Lane 决定哪些更新进入这一轮，Scheduler 决定这一轮什么时候把主线程还回去。两种失败模式写在
            <Link className="mx-1 text-fuchsia-700 underline underline-offset-2 dark:text-fuchsia-300" to="/architecture/scheduler">
                Scheduler
            </Link>
            。
        </P>
    </Stack>
</TopicSection>
```

第 6 节这一任务先留着，Task 8 再挪走。

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm -C packages/react-playground exec vitest run src/topics/architecture/pages.test.tsx src/topics/architecture/demos.test.tsx`

Expected: PASS。总览页现有的「列表与 key」链接测试仍通过。

- [ ] **Step 5: Commit**

```bash
git add packages/react-playground/src/topics/architecture/scheduler/index.tsx packages/react-playground/src/topics/architecture/runtime-map/index.tsx packages/react-playground/src/topics/architecture/pages.test.tsx
git commit -m "$(cat <<'EOF'
feat(react-playground): 把两套优先级的失败模式写进 Scheduler

运行时总览只保留一句并链过来，时间片演示仍在原页。

EOF
)"
```

---

### Task 8: 阅读地图，并让总览不再当索引

**Files:**
- Create: `packages/react-playground/src/topics/architecture/map/index.tsx`
- Create: `packages/react-playground/src/topics/architecture/map/index.test.tsx`
- Modify: `packages/react-playground/src/topics/architecture/runtime-map/index.tsx`
- Modify: `packages/react-playground/src/topics/architecture/pages.test.tsx`
- Modify: `packages/react-playground/src/topics/architecture/series.ts`
- Modify: `packages/react-playground/src/topics/architecture/series.test.ts`
- Modify: `packages/react-playground/src/config/topics.tsx`
- Modify: `packages/react-playground/src/config/topics.test.ts`

**Interfaces:**
- Consumes: 运行时总览第 6 节现有的四个站内链接
- Produces: path `/architecture/map`。`ArchitectureTopicKey` 增加 `'map'`。`ArchitectureSeries.id` 增加 `'next'`。分类共十四页，顺序以本节 `topics.test.ts` 的数组为准。源码七条路径是文本，不是 `Link`

- [ ] **Step 1: Write the failing test**

`map/index.test.tsx`：

```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { TOPICS } from '../../../config/topics';
import MapPage from './index';

const SOURCE_PATHS = [
    '/architecture/source/work-loop',
    '/architecture/source/begin-work',
    '/architecture/source/complete-work',
    '/architecture/source/commit',
    '/architecture/source/hooks',
    '/architecture/source/lanes',
    '/architecture/source/scheduler',
];

describe('阅读地图', () => {
    it('站内专题是链接，源码架只是文字', () => {
        render(
            <MemoryRouter>
                <MapPage />
            </MemoryRouter>,
        );
        expect(screen.getByRole('link', { name: '列表与 key' })).toHaveAttribute('href', '/basics/list-key');
        expect(screen.getByRole('link', { name: '事件与合成事件' })).toHaveAttribute('href', '/basics/event');
        expect(screen.getByRole('link', { name: 'useTransition × useDeferredValue' })).toHaveAttribute(
            'href',
            '/performance/transition-deferred',
        );
        expect(screen.getByRole('link', { name: 'RSC · 深度梳理' })).toHaveAttribute('href', '/advanced/rsc-guide');
        expect(screen.getByText('React 19 的 react-reconciler 与 scheduler')).toBeInTheDocument();

        for (const path of SOURCE_PATHS) {
            expect(screen.getByText(path)).toBeInTheDocument();
            expect(screen.queryByRole('link', { name: path })).not.toBeInTheDocument();
        }
        const registered = TOPICS.map((topic) => topic.path);
        for (const path of SOURCE_PATHS) {
            expect(registered).not.toContain(path);
        }
    });
});
```

`pages.test.tsx` 里「总览页链到列表、事件、调度演练和 RSC」改成渲染 `MapPage`，或者删掉该用例（地图测试已覆盖）。总览页改为：

```tsx
it('运行时总览不再充当系列索引', () => {
    renderPage(RuntimeMap);
    expect(screen.queryByRole('link', { name: '列表与 key' })).not.toBeInTheDocument();
    expect(screen.queryByText('/architecture/source/work-loop')).not.toBeInTheDocument();
});
```

`topics.test.ts` 与 `series.test.ts` 的路径数组改为：

```ts
[
    '/architecture/constraints',
    '/architecture/runtime-map',
    '/architecture/work-unit',
    '/architecture/fiber',
    '/architecture/double-buffer',
    '/architecture/render',
    '/architecture/commit',
    '/architecture/update-queue',
    '/architecture/hooks-impl',
    '/architecture/scheduler',
    '/architecture/events',
    '/architecture/ssr',
    '/architecture/map',
    '/architecture/check',
]
```

长度 14。`series.test.ts` 继续断言导航路径字符串不包含 `/architecture/source/`。

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm -C packages/react-playground exec vitest run src/topics/architecture/map/index.test.tsx src/topics/architecture/pages.test.tsx src/config/topics.test.ts`

Expected: FAIL。地图模块不存在。

- [ ] **Step 3: Write minimal implementation**

`map/index.tsx` 标题「原理与架构 · 阅读地图」，`SeriesNav current="map"`。两节：

1. 「这些规则已经有专页」。四个 `Link`，名称和 href 与测试一致。
2. 「源码架还没写」。第一句包含「React 19 的 react-reconciler 与 scheduler」。用表格或定义列表渲染七行，路径用 `<span>` 或 `<code>` 的文本节点，不要用 `Link` 或 `<a>`。行内容：

| 文本路径 | 读什么 | 钉住 |
|---|---|---|
| `/architecture/source/work-loop` | `workLoopConcurrent` / `performUnitOfWork` | Render |
| `/architecture/source/begin-work` | `beginWork` | 工作单元、Render |
| `/architecture/source/complete-work` | `completeWork` | Render |
| `/architecture/source/commit` | commit 三阶段的入口 | 双缓冲、Commit |
| `/architecture/source/hooks` | `memoizedState` 链表 | Hooks 链表 |
| `/architecture/source/lanes` | Lane 的合并与挑选 | Scheduler |
| `/architecture/source/scheduler` | 时间片与让出 | Scheduler |

从 `runtime-map/index.tsx` 删除第 6 节整节，包括那四个链接。

`series.ts` 在复盘组之前增加：

```ts
{
    id: 'next',
    title: '接着读',
    links: [{ key: 'map', to: '/architecture/map', label: '阅读地图' }],
},
```

`ArchitectureSeries['id']` 加上 `'next'`，`ArchitectureTopicKey` 加上 `'map'`。`topics.tsx` 在 SSR 与理解检验之间注册 `path: '/architecture/map'`，`title: '阅读地图'`，`description: '已经写过的专题去哪读，源码章以后加在哪'`。

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm -C packages/react-playground exec vitest run src/topics/architecture/map/index.test.tsx src/topics/architecture/pages.test.tsx src/topics/architecture/series.test.ts src/config/topics.test.ts src/config/legacy-routes.test.ts`

Expected: PASS。前缀迁移测试会把 `/architecture/map` 反映射为 `/internals/map` 再解析回来，这个 path 应仍等于 `/architecture/map`。

- [ ] **Step 5: Commit**

```bash
git add packages/react-playground/src/topics/architecture/map packages/react-playground/src/topics/architecture/runtime-map/index.tsx packages/react-playground/src/topics/architecture/pages.test.tsx packages/react-playground/src/topics/architecture/series.ts packages/react-playground/src/topics/architecture/series.test.ts packages/react-playground/src/config/topics.tsx packages/react-playground/src/config/topics.test.ts
git commit -m "$(cat <<'EOF'
feat(react-playground): 用阅读地图接住站外专题和源码目录

源码路径先不注册。运行时总览不再重复整份系列索引。

EOF
)"
```

---

### Task 9: 理解检验加上四道设计判断

**Files:**
- Create: `packages/react-playground/src/topics/architecture/check/bank/design.ts`
- Modify: `packages/react-playground/src/topics/architecture/check/bank/index.ts`
- Modify: `packages/react-playground/src/topics/architecture/check/bank.test.ts`
- Modify: `packages/react-playground/src/topics/architecture/pages.test.tsx`
- Modify: `packages/react-playground/src/topics/architecture/check/index.tsx`
- Modify: `packages/react-playground/README.md`
- Modify: `AGENTS.md`
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes: `InterviewQuestion`、`INTERVIEW_GROUPS`、`QUESTION_COUNT`、`numberGroups`
- Produces: 分组 `id: 'g-design'`，标题「设计判断」，排在 `INTERVIEW_GROUPS` 第一位。四题 id 为 `q-design-screen`、`q-design-progress`、`q-design-priority`、`q-design-discard`。`QUESTION_COUNT` 为 64

- [ ] **Step 1: Write the failing test**

在 `bank.test.ts` 追加：

```ts
it('设计判断排在最前，结论和回链与设计说明一致', () => {
    expect(QUESTION_COUNT).toBe(64);
    const design = NUMBERED_GROUPS[0];
    expect(design.id).toBe('g-design');
    expect(design.questions.map((question) => question.id)).toEqual([
        'q-design-screen',
        'q-design-progress',
        'q-design-priority',
        'q-design-discard',
    ]);
    expect(design.questions[0].number).toBe(1);
    expect(design.questions[0].points.join(' ')).toContain(
        '屏幕上那棵是 current。渲染发生在 workInProgress 上，渲染可以中断或整段丢掉',
    );
    expect(design.questions[0].related).toEqual([{ to: '/architecture/double-buffer', label: '双缓冲' }]);
    expect(design.questions[1].points.join(' ')).toContain(
        '子、兄弟、父和待处理的更新记在 Fiber 上，循环每一步都能从节点接着做',
    );
    expect(design.questions[1].related?.[0].to).toBe('/architecture/work-unit');
    expect(design.questions[2].points.join(' ')).toContain('Lane 挡住「不该进入这一轮的更新混进来」');
    expect(design.questions[2].points.join(' ')).toContain('Scheduler 挡住「这一轮算完才把主线程还回去」');
    expect(design.questions[2].related?.[0].to).toBe('/architecture/scheduler');
    expect(design.questions[3].points.join(' ')).toContain('丢弃的是尚未发布的那一棵。current 要到 Commit 才切换');
    expect(design.questions[3].related?.[0].to).toBe('/architecture/double-buffer');
    const allRelated = NUMBERED_GROUPS.flatMap((group) =>
        group.questions.flatMap((question) => question.related?.map((link) => link.to) ?? []),
    );
    expect(allRelated.some((to) => to.startsWith('/internals/'))).toBe(false);
});
```

`pages.test.tsx` 里原来的「1. 为什么 React 要用 Fiber 换掉栈协调器？」改为「5. 为什么 React 要用 Fiber 换掉栈协调器？」。追加断言标题「1. 渲染期间为什么不能改屏幕上那棵树」。`check/index.tsx` 的 description 仍使用 `QUESTION_COUNT`，测试渲染后的描述应包含「64 道问答」。intro 文案若写死「七组」，改为「八组」。

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm -C packages/react-playground exec vitest run src/topics/architecture/check/bank.test.ts src/topics/architecture/pages.test.tsx`

Expected: FAIL。`QUESTION_COUNT` 仍是 60，第一组不是 `g-design`。

- [ ] **Step 3: Write minimal implementation**

`design.ts` 导出 `DESIGN: readonly InterviewQuestion[]`。四题的 `title` 使用 spec 表里的题干，`points` 恰好三条，其中一条是 spec 表里的结论原文。`body` 两段，把结论再写开，不引入新的机制主张。`related` 只有 spec 表里的那一页。

```ts
export const DESIGN: readonly InterviewQuestion[] = [
    {
        id: 'q-design-screen',
        toc: '屏幕上的树',
        title: '渲染期间为什么不能改屏幕上那棵树',
        note: '先分清正在算的树和已经发布的树。',
        points: [
            '屏幕上那棵是 current。渲染发生在 workInProgress 上，渲染可以中断或整段丢掉',
            '边算边改屏幕，中断时用户会看到写了一半的界面',
            '发布发生在 Commit，而不是 Render 的中途',
        ],
        body: [
            '渲染可以停下来，也可以整段重来。如果 Render 直接改屏幕上的节点，停在中间时用户看到的就不是一棵完整的树。',
            '所以屏幕上那棵是 current。渲染发生在 workInProgress 上，渲染可以中断或整段丢掉。指针切换留到 Commit。',
        ],
        related: [{ to: '/architecture/double-buffer', label: '双缓冲' }],
    },
    {
        id: 'q-design-progress',
        toc: '进度在节点上',
        title: '进度为什么记在节点上，调用栈清空还能继续',
        note: '暂停点必须是 React 自己拿得住的数据。',
        points: [
            '子、兄弟、父和待处理的更新记在 Fiber 上，循环每一步都能从节点接着做',
            'JavaScript 调用栈不属于 React，中途返回就丢了走到哪',
            '记在节点上是为了能停，不是为了让总计算量变少',
        ],
        body: [
            '栈协调器把进度压在调用栈里。调用栈不返回，React 就没有一个自己的字段可以写下「下次从这里继续」。',
            '子、兄弟、父和待处理的更新记在 Fiber 上，循环每一步都能从节点接着做。调用栈清空之后，下一个工作单元的引用还在。',
        ],
        related: [{ to: '/architecture/work-unit', label: '工作单元' }],
    },
    {
        id: 'q-design-priority',
        toc: '两套优先级',
        title: 'Lane 和 Scheduler 各挡住哪一种失败',
        note: '一个词盖不住「算谁」和「何时让出」。',
        points: [
            'Lane 挡住「不该进入这一轮的更新混进来」；Scheduler 挡住「这一轮算完才把主线程还回去」',
            '只留 Lane 时，紧急更新进了这一轮仍可能把帧占满',
            '只留 Scheduler 时，不知道该把哪些更新留到下一轮',
        ],
        body: [
            'Lane 决定哪些更新进入这一轮。Scheduler 决定这一轮什么时候把主线程还回去。',
            'Lane 挡住「不该进入这一轮的更新混进来」；Scheduler 挡住「这一轮算完才把主线程还回去」。少掉任何一套，都会漏掉一种已经能说清的失败。',
        ],
        related: [{ to: '/architecture/scheduler', label: 'Scheduler' }],
    },
    {
        id: 'q-design-discard',
        toc: '丢掉未发布的树',
        title: '丢掉 workInProgress 之后，屏幕上为什么还是上一棵完整的树',
        note: '丢掉的是副本，不是屏幕。',
        points: [
            '丢弃的是尚未发布的那一棵。current 要到 Commit 才切换',
            'workInProgress 可以因为让出或更高优先级而整段作废',
            '用户看到的树在切换指针之前保持不变',
        ],
        body: [
            '更高优先级进来，或这一轮决定重算时，React 可以丢掉正在填的副本。',
            '丢弃的是尚未发布的那一棵。current 要到 Commit 才切换。所以屏幕上仍是上一棵完整的树。',
        ],
        related: [{ to: '/architecture/double-buffer', label: '双缓冲' }],
    },
];
```

`bank/index.ts` 把 `DESIGN` 组成第一组：

```ts
{
    id: 'g-design',
    title: '设计判断',
    blurb: '先问为什么必须长成这样，再回到后面的机制题。',
    questions: DESIGN,
},
```

`check/index.tsx` 的 description 继续用模板字符串里的 `QUESTION_COUNT`。intro 里的「七组」改为「八组」。

把 `README.md` 的原理与架构行换成：

```md
| **原理与架构** | 设计约束、Fiber 架构，以及迁入的运行时页面：Render / Commit、更新队列、Hooks 链表、Scheduler、事件与水合；末页用问答检验 |
```

`AGENTS.md` 与 `CLAUDE.md` 的该分类说明换成：

```md
- `src/topics/architecture/` — 「原理与架构」分类(basePath `/architecture`，插在进阶与性能之间)：设计约束 → 运行时总览 → 工作单元 → Fiber → 双缓冲 → Render → Commit → 更新队列 → Hooks 链表 → Scheduler → 合成事件 → SSR 与水合 → 阅读地图 → 理解检验(目录 `check/`)；页头 `SeriesNav`(fuchsia)。源码架只列在阅读地图，不注册路由
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm -C packages/react-playground test:run`

Expected: PASS。全包 原有测试加上本计划新增的用例都通过。`QUESTION_COUNT` 为 64。

- [ ] **Step 5: Commit**

```bash
git add packages/react-playground/src/topics/architecture/check packages/react-playground/src/topics/architecture/pages.test.tsx packages/react-playground/README.md AGENTS.md CLAUDE.md
git commit -m "$(cat <<'EOF'
feat(react-playground): 理解检验先考四道设计判断

原有六十道仍在后面，回链只指向已经迁入的架构页。

EOF
)"
```

---

## Spec coverage

| Spec | Task |
|---|---|
| 新分类、位置、配色、取消 internals | Task 1 |
| 十页迁入、标题、SeriesNav、演示不改交互 | Task 1 |
| 旧地址与站外链接 | Task 1，裸路径目标在 Task 2 改为设计约束 |
| README、AGENTS.md、CLAUDE.md | Task 1 |
| 设计约束与让出演示 | Task 2 |
| 工作单元 | Task 3 |
| 双缓冲 | Task 4 |
| Fiber 页删重复 | Task 5 |
| Render 协调循环 | Task 6 |
| Scheduler 两套优先级；总览第 5 节收成链接 | Task 7 |
| 阅读地图、总览第 6 节移走、源码架不注册 | Task 8 |
| 四道设计判断、六十道保留、related 无旧路径 | Task 9 |
| 不写源码页、不改进行专题、不手改 sitemap | 无对应实现任务 |
