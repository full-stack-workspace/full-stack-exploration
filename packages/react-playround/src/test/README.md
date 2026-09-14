# 测试配置说明

本项目使用 **Vitest** + **React Testing Library** 作为测试框架，支持使用 TypeScript 编写测试。

## 依赖包

### 核心依赖
- `vitest` - 测试框架（基于 Vite，原生支持 TypeScript）
- `@testing-library/react` - React 组件测试工具
- `@testing-library/jest-dom` - DOM 断言扩展
- `@testing-library/user-event` - 用户事件模拟
- `jsdom` - 浏览器环境模拟
- `@vitest/ui` - Vitest 图形化界面
- `@vitest/coverage-v8` - 代码覆盖率报告

## 测试命令

```bash
# 运行测试（watch 模式）
pnpm test

# 运行测试（UI 模式，图形化界面）
pnpm test:ui

# 运行测试一次（不 watch）
pnpm test:run

# 生成覆盖率报告
pnpm test:coverage

# Watch 模式运行测试
pnpm test:watch
```

## 测试文件规范

### 文件命名
- 测试文件应命名为 `*.test.ts` 或 `*.test.tsx`
- 或者使用 `*.spec.ts` 或 `*.spec.tsx`
- 建议与源文件放在同一目录下，或放在 `__tests__` 目录中

### 测试文件示例
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

## 测试工具函数

### 使用自定义 render 函数
项目提供了自定义的 `render` 函数，已经包含了常用的 Provider（如 BrowserRouter）：

```typescript
import { render, screen } from '../test/utils';

// 使用自定义 render，自动包含 Router 等 Provider
render(<MyComponent />);
```

### 使用标准 render
如果需要更多控制，可以直接从 `@testing-library/react` 导入：

```typescript
import { render as rtlRender } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// 手动包装 Provider
rtlRender(
  <BrowserRouter>
    <MyComponent />
  </BrowserRouter>
);
```

## 常用测试模式

### 1. 组件渲染测试
```typescript
it('应该渲染组件', () => {
  render(<Component />);
  expect(screen.getByRole('button')).toBeInTheDocument();
});
```

### 2. 用户交互测试
```typescript
import userEvent from '@testing-library/user-event';

it('应该处理用户点击', async () => {
  const user = userEvent.setup();
  render(<Button />);

  const button = screen.getByRole('button');
  await user.click(button);

  expect(screen.getByText('Clicked')).toBeInTheDocument();
});
```

### 3. 异步操作测试
```typescript
it('应该处理异步操作', async () => {
  render(<AsyncComponent />);

  // 使用 waitFor 等待异步更新
  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  });
});
```

### 4. Mock 函数测试
```typescript
import { vi } from 'vitest';

it('应该调用回调函数', () => {
  const handleClick = vi.fn();
  render(<Button onClick={handleClick} />);

  fireEvent.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### 5. React Router 测试
```typescript
import { MemoryRouter } from 'react-router-dom';

it('应该导航到正确页面', () => {
  render(
    <MemoryRouter initialEntries={['/about']}>
      <App />
    </MemoryRouter>
  );

  expect(screen.getByText('About Page')).toBeInTheDocument();
});
```

## 测试覆盖率

项目配置了代码覆盖率报告，目标阈值：
- Lines: 70%
- Functions: 70%
- Branches: 70%
- Statements: 70%

可以通过 `pnpm test:coverage` 生成覆盖率报告，报告会输出到 `coverage/` 目录。

## 注意事项

1. **测试环境**: 使用 `jsdom` 模拟浏览器环境
2. **全局设置**: 每个测试文件运行前会自动执行 `src/test/setupTests.ts`
3. **自动清理**: 每个测试后会自动清理 DOM 和 React 组件
4. **类型安全**: 使用 TypeScript 编写测试，享受完整的类型检查
5. **Relay 测试**: 如需测试 Relay 组件，需要额外的 mock 配置（参考 Relay 官方文档）

## 参考资源

- [Vitest 文档](https://vitest.dev/)
- [React Testing Library 文档](https://testing-library.com/react)
- [Jest DOM 匹配器](https://github.com/testing-library/jest-dom)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
