# 测试配置指南

本项目已配置完整的单测环境，使用 **Vitest** + **React Testing Library**，支持使用 TypeScript 编写测试。

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 运行测试

```bash
# 运行所有测试（watch 模式）
pnpm test

# 运行测试一次（CI 环境）
pnpm test:run

# 生成覆盖率报告
pnpm test:coverage

# 使用 UI 界面运行测试
pnpm test:ui
```

## 项目结构

```
react-playround/
├── vitest.config.ts          # Vitest 配置文件
├── src/
│   ├── vitest.d.ts           # Vitest 类型定义
│   ├── test/
│   │   ├── setupTests.ts     # 测试环境全局配置
│   │   ├── utils.tsx         # 测试工具函数
│   │   ├── example.test.ts   # 基础测试示例
│   │   └── README.md         # 详细测试文档
│   └── components/
│       └── Header.test.tsx   # 组件测试示例
└── coverage/                 # 测试覆盖率报告（自动生成）
```

## 测试文件命名规范

- 测试文件命名：`*.test.ts` 或 `*.test.tsx`
- 或使用：`*.spec.ts` 或 `*.spec.tsx`
- 建议与源文件放在同一目录下

## 编写测试示例

### 基础组件测试

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/utils';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('应该正确渲染', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### 用户交互测试

```typescript
import { describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../test/utils';
import Button from './Button';

describe('Button', () => {
  it('应该处理点击事件', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick} />);
    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## 配置说明

### Vitest 配置

- **测试环境**: `jsdom` (模拟浏览器环境)
- **全局 API**: 已启用 (`globals: true`)
- **TypeScript**: 原生支持，无需额外配置
- **覆盖率**: v8 提供器，支持多种格式输出

### 测试工具函数

项目提供了自定义的 `render` 函数，已包含常用 Provider（如 BrowserRouter）：

```typescript
import { render, screen } from '../test/utils';
// render 已自动包含 Router 等 Provider
```

### 全局 Mock

测试环境已自动配置以下 Mock：
- `window.matchMedia` (Ant Design 等组件库需要)
- `IntersectionObserver`
- `ResizeObserver`

## 覆盖率目标

当前配置的覆盖率阈值：
- Lines: 70%
- Functions: 70%
- Branches: 70%
- Statements: 70%

## 更多文档

详细的使用说明和最佳实践，请参考：
- [测试工具文档](./src/test/README.md)
- [Vitest 官方文档](https://vitest.dev/)
- [React Testing Library 文档](https://testing-library.com/react)

## 注意事项

1. **类型安全**: 使用 TypeScript 编写测试，享受完整的类型检查
2. **自动清理**: 每个测试后会自动清理 DOM 和组件
3. **Relay 测试**: 如需测试 Relay 组件，需要额外的 mock 配置
4. **ESLint**: 测试文件已配置更宽松的 ESLint 规则

## 常见问题

### Q: 如何测试使用 React Router 的组件？

A: 使用项目提供的 `render` 函数，已自动包含 `BrowserRouter`：

```typescript
import { render } from '../test/utils';
render(<MyComponent />); // 自动包含 Router
```

### Q: 如何测试异步操作？

A: 使用 `waitFor` 等待异步更新：

```typescript
import { waitFor } from '@testing-library/react';
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

### Q: 如何 Mock API 请求？

A: 使用 `vi.fn()` 创建 mock 函数：

```typescript
import { vi } from 'vitest';

const mockFetch = vi.fn(() => Promise.resolve({
  json: () => Promise.resolve({ data: 'test' })
}));
global.fetch = mockFetch;
```
