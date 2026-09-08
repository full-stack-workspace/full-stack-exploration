# clsx 引入指导与说明

## clsx 是什么？

`[clsx](https://github.com/lukeed/clsx)` 是一个用于构造 `className` 字符串的小型工具。它可以接收字符串、数组、对象和条件表达式，并自动忽略 `false`、`null`、`undefined` 等无效值。

项目引入它，主要是为了清晰地表达“某个 CSS 类名在什么条件下生效”，避免在 JSX 中手工拼接容易出现多余空格、`undefined` 字符串或复杂三元表达式的类名。

在 `next-upload` 包中安装：

```bash
pnpm -C packages/next-upload add clsx
```

```tsx
clsx(
  "rounded-md px-4 py-2",
  isActive && "bg-primary text-primary-foreground",
  disabled && "cursor-not-allowed opacity-50",
  className,
);
```

## 为什么项目统一使用 `cn()`？

本项目没有让业务组件直接调用 `clsx`，而是在 `[packages/next-upload/lib/utils.ts](../../packages/next-upload/lib/utils.ts)` 中封装了 `cn()`：

```ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

`cn()` 分两步处理类名：

```mermaid
flowchart LR
    Input[字符串 / 数组 / 对象 / 条件值] --> Clsx[clsx：筛选并拼接类名]
    Clsx --> Merge[tailwind-merge：解决 Tailwind 类名冲突]
    Merge --> Result[最终 className]
```



- `clsx` 负责条件判断与类名拼接；
- `tailwind-merge` 负责识别 Tailwind CSS 中互相冲突的工具类，并保留优先级更高的类名。

例如：

```ts
cn("px-2 text-sm", isActive && "bg-primary", className);
cn("px-2", "px-4"); // => "px-4"
```

仅使用 `clsx("px-2", "px-4")` 会得到两个类名；经过 `tailwind-merge` 后，`cn()` 会保留后出现的 `px-4`。这对于允许调用方通过 `className` 覆盖组件默认样式尤其重要。

## 使用约定

- 组件中需要组合固定类名、条件类名或外部 `className` 时，统一使用 `cn()`；
- 不要为了简单且完全固定的单个类名额外调用 `cn()`；
- 将组件默认类名放在前面，把调用方传入的 `className` 放在后面，使合理的 Tailwind 样式覆盖可以生效；
- `clsx` 只决定哪些类名参与拼接，Tailwind 类名冲突由 `tailwind-merge` 处理。

更多用法可查看 [clsx 官方说明](https://github.com/lukeed/clsx)。