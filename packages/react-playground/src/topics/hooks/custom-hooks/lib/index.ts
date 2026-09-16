/**
 * ============================================================================
 * index.ts — 自定义 Hooks 库 barrel 导出
 * ============================================================================
 *
 * 统一出口:消费方 `from '../lib'` 即可拿到全部原子 Hook 与类型,
 * 新增 Hook 时在此补一行导出。
 *
 * @module topics/hooks/custom-hooks/lib
 */

export { useToggle } from './useToggle';
export type { ToggleActions } from './useToggle';

export { usePrevious } from './usePrevious';

export { useDebouncedValue } from './useDebouncedValue';

export { useLocalStorage } from './useLocalStorage';
export type { LocalStorageSetter } from './useLocalStorage';

export { useInterval } from './useInterval';

export { useEventListener } from './useEventListener';
export type { EventListenerTarget } from './useEventListener';

export { useMediaQuery } from './useMediaQuery';

export { useRequest } from './useRequest';
export type {
    RequestContext,
    UseRequestEvent,
    UseRequestOptions,
    UseRequestResult,
} from './useRequest';
