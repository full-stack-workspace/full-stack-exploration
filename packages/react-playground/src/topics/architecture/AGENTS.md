# 原理与架构分类

十四页顺着一次更新往下走,页头 `components/SeriesNav.tsx`(fuchsia):

1. 设计约束
2. 运行时总览
3. 工作单元
4. Fiber
5. 双缓冲
6. Render
7. Commit
8. 更新队列
9. Hooks 链表
10. Scheduler
11. 合成事件
12. SSR 与水合
13. 阅读地图
14. 理解检验(题库八组、六十四道题;先要点自测,再对照展开,链回前面各页)

新增子专题:改 `series.ts` + `config/topics.tsx`。

边界:

- 列表 key 的用法、事件与 document 监听的坑、`startTransition` 的交互,链到已有专题
- SSR 页只画数据流。本包是 `createRoot` SPA,不能在这里跑 `hydrateRoot`
- 纠正旧笔记:事件池在 React 17 已移除;副作用标记是 `flags` / `subtreeFlags`;虚拟 DOM 不是「JS 对象比 DOM 快」
