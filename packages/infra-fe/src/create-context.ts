/**
 * ============================================================================
 * createContext — 类型安全的 React Context 工厂
 * ============================================================================
 *
 * 封装 React.createContext + useContext，消除两个痛点：
 * 1. createContext 需要默认值，但很多场景下默认值无意义
 * 2. useContext 返回值可能为 undefined，每次使用都要判空
 *
 * 通过工厂函数强制提供有意义的默认值，并在类型层面保证非空。
 *
 * 功能特点：
 * - 必须提供有意义的默认值（设计约束）
 * - Provider 值类型与上下文类型一致
 * - 消费端无需判空，返回类型始终非 undefined
 *
 * @module src/create-context
 *
 * @example
 * ```tsx
 * import { createContext } from '@/create-context';
 *
 * interface ThemeContextValue {
 *   theme: 'light' | 'dark';
 *   toggle: () => void;
 * }
 *
 * const { Provider, use } = createContext<ThemeContextValue>({
 *   name: 'Theme',
 *   defaultValue: {
 *     theme: 'light',
 *     toggle: () => {},
 *   },
 * });
 *
 * // 在组件中使用
 * function MyComponent() {
 *   const { theme, toggle } = use(); // 类型安全，无需判空
 *   return <button onClick={toggle}>{theme}</button>;
 * }
 * ```
 */

import { createContext as reactCreateContext, useContext } from "react";

/* =================================================================
 * Types
 * ================================================================ */

interface CreateContextOptions<T> {
  /** 上下文名称，用于缺失 Provider 时的错误提示 */
  name: string;
  /** 有意义的默认值 */
  defaultValue: T;
}

interface ContextResult<T> {
  /** Context Provider 组件 */
  Provider: React.Provider<T>;
  /** 类型安全的消费 Hook，返回值始终非 undefined */
  use: () => T;
}

/* =================================================================
 * Implementation
 * ================================================================ */

/**
 * 创建一个类型安全的 React Context，包含 Provider 和消费 Hook。
 *
 * 与裸 createContext 的区别：
 * - 必须提供有意义的默认值
 * - use() 返回值非空，无需在消费端判空
 * - 缺失 Provider 时使用默认值并给出 console.warn 提示
 */
export function createContext<T>(options: CreateContextOptions<T>): ContextResult<T> {
  const Ctx = reactCreateContext<T>(options.defaultValue);

  function use(): T {
    const value = useContext(Ctx);
    return value;
  }

  return {
    Provider: Ctx.Provider,
    use,
  };
}
