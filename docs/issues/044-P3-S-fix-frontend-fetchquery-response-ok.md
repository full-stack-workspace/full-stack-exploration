## Problem

导出的「生产示例」网络层未检查 `response.ok`、未 catch 网络错误，非 2xx 时会把错误页 body 当 GraphQL 响应解析。文件头已声明这只是演示写法、本站实际走 mock 层，属教学示例的有意简化；但作为示例应更严谨，与文件头「实际项目中应替换」的提示呼应。

> 来源：代码健康检查报告 `docs/issues/code-health-2026-10-11-091403.md` L26

## Scope

- 修改 `packages/react-playground/src/relay/Environment.ts:29-47`

## Acceptance Criteria

- [ ] fetchQuery 对非 2xx 抛出带 status 的 Error（`if (!response.ok) throw new Error(...)`）
- [ ] mock 层（fetchQueryWithMock）行为不受影响
- [ ] `pnpm -C packages/react-playground build` 通过
