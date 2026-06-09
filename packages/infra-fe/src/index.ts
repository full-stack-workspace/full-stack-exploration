/**
 * ============================================================================
 * infra-fe — 公共 API 入口
 * ============================================================================
 *
 * 统一导出所有基础设施工具、Hooks 和类型守卫。
 * 外部消费方只需 `import { ... } from 'infra-fe'` 即可使用所有功能。
 *
 * @module src/index
 */

export { assertNever } from "./assert-never";
export { createContext } from "./create-context";
export { useDebounce } from "./use-debounce";
export { useLocalStorage } from "./use-local-storage";
export { cn } from "./utils";
