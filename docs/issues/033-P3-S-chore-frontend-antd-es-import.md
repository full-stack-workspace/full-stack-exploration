## Problem

`import type { CheckboxChangeEvent } from 'antd/lib/checkbox'`。antd v5+ 官方推荐 `antd/es/*` 或直接从 `antd` 导出；`lib`（CommonJS）路径在 antd 6 + ESM 构建链（Rspack）下属于遗留写法，可能随版本移除。同包其他文件均用 `antd/es/*` 或从 `antd` 导入，此处不一致。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-091403.md` L15

## Scope

- 修改 `packages/react-playground/src/topics/apps/shopping-cart/SearchBar.tsx:7`

## Acceptance Criteria

- [ ] 改为 `import type { CheckboxChangeEvent } from 'antd/es/checkbox';`
- [ ] 全包无 `antd/lib/` 深路径 import
- [ ] `pnpm -C packages/react-playground build` 与 `test:run` 通过
