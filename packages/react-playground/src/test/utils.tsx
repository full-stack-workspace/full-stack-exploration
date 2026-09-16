/**
 * 测试工具函数
 * 提供常用的测试辅助函数和组件包装器
 */

import React from 'react';
import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

/**
 * 自定义渲染函数，包含常用的 Provider
 * @param ui - 要渲染的 React 组件
 * @param options - 渲染选项
 * @returns 渲染结果和工具函数
 */
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <BrowserRouter>{children}</BrowserRouter>;
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

/**
 * Mock 函数创建器（使用 Vitest 的 vi）
 */
export const createMockFunction = <T extends (...args: any[]) => any>(
  implementation?: T,
): ReturnType<typeof vi.fn> => {
  return vi.fn(implementation) as any;
};
