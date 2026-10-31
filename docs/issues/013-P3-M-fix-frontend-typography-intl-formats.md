# [P3][M][fix][frontend] Fix typography, autocomplete and Intl formats

## Problem

一组文案与格式类规范违规:ASCII 三点省略号、placeholder 结尾缺 `…`、email 输入缺 `autocomplete`/`spellCheck`、硬编码金额格式、代码块缺 `translate="no"`(自动翻译会破坏代码标识符)。

来源:`docs/issues/react-playground-web-interface-review-2026-10-25.md` 第 13 类。

## Scope

- `...` → `…`:`components/Loading.tsx:12`、`apps/shopping-cart/SearchBar.tsx:47`
- placeholder 结尾补 `…`:`hooks/actions/components/ActionStateForm.tsx:70`、`hooks/use-effect/index.tsx:231`、`use-imperative-handle/index.tsx:92`、`use-reducer/index.tsx:258`、`use-ref/index.tsx:111`、`apps/bookkeeping/AddRecordForm.tsx`(各 placeholder)
- email 输入补 `autocomplete="email"` + `spellCheck={false}`:`hooks/actions/components/FormActionBasic.tsx:61,117`(:61 同时补 `name`)
- 硬编码金额 → `Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' })`:`performance/react-compiler/components/MemoNoiseDemo.tsx:68`、`apps/shopping-cart/ProductList.tsx:27`
- `components/CodeBlock.tsx:34` — `<code>` 元素加 `translate="no"`

## Acceptance Criteria

- [ ] `grep -rn '\.\.\.' src/components src/topics --include=*.tsx`(文案范围内)无 ASCII 三点残留
- [ ] 清单中 placeholder 均以 `…` 结尾
- [ ] 金额输出为 `¥x,xxx.xx` 本地化格式
- [ ] 浏览器自动翻译页面时代码块内容不被翻译
