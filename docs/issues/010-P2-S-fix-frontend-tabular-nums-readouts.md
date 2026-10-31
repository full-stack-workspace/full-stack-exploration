# [P2][S][fix][frontend] Add tabular-nums to live numeric readouts

## Problem

9 处实时更新的数字读数(指标、计数器、金额)未用等宽数字,每次刷新数字宽度变化导致布局抖动,也不利于数值对比。

来源:`docs/issues/react-playground-web-interface-review-2026-10-25.md` 第 10 类。

## Scope

- `performance/ai-native/agent-lab/components/AgentPipeline.tsx:263`(dl 指标)
- `performance/ai-native/lab/components/StreamRig.tsx:216`(TTFT/FTRT 读数)
- `performance/lab/FrameMeter.tsx:72`(输入延迟读数)
- `advanced/view-transition-activity/components/LabPanel.tsx:97,102`、`ActivityLab.tsx:84-85`
- `hooks/use-state/index.tsx:63`、`use-reducer/index.tsx:310`、`custom-hooks/playground/components/PreviousDemo.tsx:42`
- `apps/bookkeeping/SummaryCards.tsx:37`(金额)

## Acceptance Criteria

- [ ] 清单中每处数字读数带 `tabular-nums`(或 `font-variant-numeric: tabular-nums`)
- [ ] 数字每秒/每次更新时周围布局不发生水平抖动(目测或录屏对比)
- [ ] `pnpm -C packages/react-playground type-check` 通过
