/**
 * 测试工具函数
 * 提供常用的测试辅助函数和组件包装器
 */

import React from 'react';
import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import { ThemeProvider } from '../context/ThemeProvider';
import { UserProvider } from '../context/UserProvider';

/**
 * 自定义渲染函数，包含常用的 Provider
 * @param ui - 要渲染的 React 组件
 * @param options - 渲染选项
 * @returns 渲染结果和工具函数
 */
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      <UserProvider>
        <BrowserRouter>{children}</BrowserRouter>
      </UserProvider>
    </ThemeProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// 重新导出所有内容
export * from '@testing-library/react';

// 覆盖默认的 render 方法
export { customRender as render };

/**
 * 等待异步操作完成
 * @param ms - 等待的毫秒数
 */
export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
