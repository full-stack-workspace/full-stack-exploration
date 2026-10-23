# 内部机制分类

十页顺着一次更新往下走,页头 `components/SeriesNav.tsx`(cyan):

1. **一次更新** — 运行时总览 → Fiber → Render → Commit
2. **状态与调度** — 更新队列 → Hooks 链表 → Scheduler
3. **入口** — 合成事件 → SSR 与水合
4. **复盘** — 理解检验(六十道问答,七组;先要点自测,再对照展开,链回前面各页)

新增子专题:改 `series.ts` + `config/topics.tsx`。

边界:

- 列表 key 的用法、事件与 document 监听的坑、`startTransition` 的交互,链到已有专题
- SSR 页只画数据流。本包是 `createRoot` SPA,不能在这里跑 `hydrateRoot`
- 纠正旧笔记:事件池在 React 17 已移除;副作用标记是 `flags` / `subtreeFlags`;虚拟 DOM 不是「JS 对象比 DOM 快」
