# [P3][S][fix][frontend] Drop aria-label from plain p/div elements

## Problem

6 处在 `<p>`/`<div>`(无 role)上写 `aria-label`,辅助技术会直接忽略——这是无效代码,还会让阅读者误以为做了无障碍处理。元素可见文本已表达内容,直接删除即可。

来源:`docs/issues/react-playground-web-interface-review-2026-10-25.md` 第 12 类。

## Scope

- `advanced/relay/components/UserDirectory.tsx:34`(骨架条;若为装饰可保留 aria-hidden 语义,但不应是 aria-label)
- `advanced/component-comm/playground/components/UrlStateDemo.tsx:59`
- `advanced/component-comm/practice/index.tsx:244`
- `advanced/error-boundary/components/BombWidget.tsx:36,59`
- `advanced/error-boundary/components/ResetRecoveryDemo.tsx:33`

## Acceptance Criteria

- [ ] 上述位置不再有无 role 元素上的 `aria-label`
- [ ] 页面可见文本与读屏输出均无回归
