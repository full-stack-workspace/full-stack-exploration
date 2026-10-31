# vue-playground — Vue 权衡录 / Vue Tradeoffs

Vite 8 + Vue 3 + TypeScript + Pinia 的专题学习站,与 react-playground(React 权衡录)对齐:按专题组织**可运行的对照演练**,而不是 API 罗列。

- 方案与分期计划:[`docs/vue-playground-design.md`](../../docs/vue-playground-design.md)
- 技术栈:Vite 8 · Vue 3(`<script setup>`)· TypeScript strict · vue-router 5 · Pinia · Element Plus · Tailwind CSS 4 · Vitest

## 常用命令

```bash
pnpm dev          # 开发服务器(端口 5176)
pnpm build        # vue-tsc + vite build
pnpm type-check   # vue-tsc --noEmit
pnpm test:run     # 契约测试(CI 模式)
pnpm lint         # ESLint(包级 flat config)
```

## 新增一个专题

1. 在 `src/topics/<category>/<name>/` 新建目录与 `index.vue`(category 必须是注册表已有的分类 key)
2. 在 `src/config/topics.ts` 的 `TOPICS` 中注册一行(path / title / category / description / element 懒加载)
3. 路由、顶部导航、首页卡片、面包屑、`document.title` 全部自动生效
4. 跑 `pnpm test:run` 校验注册表契约(path 唯一、category 存在、basePath 前缀匹配)

## 约定

- **注册表是全站单一数据源**:`config/topics.ts` 驱动路由与导航,不手写第二份路由表
- **品牌单一数据源**:`config/site.ts`;index.html 标题经 vite.config.ts 的 transformIndexHtml 注入
- 专题页骨架统一使用 `TopicPage`(必填 `path`)+ `TopicSection`;多页专题页头用 `TopicNav` 互链
- 导航一律用 vue-router(`RouterLink` / `useRouter`),禁止 `<a href>` 站内跳转
- 暗色模式:class 策略,`useDark` composable(localStorage → prefers-color-scheme),index.html 内联脚本防闪烁
- 壳层约定:品牌区不占 h1;`/:pathMatch(.*)*` 渲染 NotFound,不静默跳回首页
