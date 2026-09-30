/**
 * 测试环境配置
 * 在每个测试文件运行前执行
 */

import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// 扩展 Vitest 的 expect 方法，添加 jest-dom 的匹配器
expect.extend(matchers);

// 每个测试后清理 DOM
afterEach(() => {
  cleanup();
  document.documentElement.classList.remove('light', 'dark');
});

// Mock window.matchMedia（某些组件库如 Ant Design 需要）
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver（某些组件可能需要）
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock ResizeObserver（某些组件可能需要）
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// antd Table 等组件会用 window.getComputedStyle(el, pseudoElt) 读伪元素样式,
// jsdom 只实现了单参数版本,带伪元素参数时会往 stderr 刷
// "Not implemented: window.getComputedStyle(elt, pseudoElt)"。
// 这里包一层丢掉第二个参数,走 jsdom 已实现的路径,消除噪音。
const originalGetComputedStyle = window.getComputedStyle.bind(window);
Object.defineProperty(window, 'getComputedStyle', {
  writable: true,
  value: (el: Element) => originalGetComputedStyle(el),
});

// 注意:这里刻意不过滤 console。React 19 的 act 警告是有价值的信号 ——
// 若某条用例触发 act 警告,应改用 user-event / waitFor / act 修测试本身,
// 而不是在全局把警告吞掉。
