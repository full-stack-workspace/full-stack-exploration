# 性能优化分类

性能优化不是渲染调度 API 清单。本分类三条系列互链:

1. **性能治理全链路** — 原则与约定 → 指标实验室 → 架构关键路径 → 实现六规则 → 排查演练
2. **AI-Native 性能** — 指标金字塔 + 流式时间轴 + Agent 工具链(并行/取消/快但错)
3. **渲染调度(已有)** — transition × deferred、Suspense 骨架、调度梳理

页头一律用 `components/SeriesNav.tsx`(amber)。新增子专题:改 `series.ts` + `config/topics.tsx`。

边界:

- 调度三页继续讲并发渲染,不重复讲 SSR/指标金字塔
- AI-Native 讲思考、生成、工具与成本,不重复讲 LCP 定义
- 治理系列不把 memo 当入口
