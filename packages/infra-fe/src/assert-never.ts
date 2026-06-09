/**
 * ============================================================================
 * assertNever — 穷尽性类型守卫
 * ============================================================================
 *
 * 编译时确保 switch/case 覆盖了可辨识联合（discriminated union）的所有分支。
 * 如果漏掉了某个变体，TypeScript 会报编译错误。
 *
 * 功能特点：
 * - 纯类型工具，运行时抛出异常（理论上不可达）
 * - 常用于 reducer、状态机等 discriminated union 场景
 * - Error 消息包含实际值，方便调试
 *
 * @module src/assert-never
 *
 * @example
 * ```ts
 * import { assertNever } from '@/assert-never';
 *
 * type Shape = { kind: 'circle'; radius: number }
 *            | { kind: 'square'; side: number }
 *            | { kind: 'triangle'; base: number; height: number };
 *
 * function area(shape: Shape): number {
 *   switch (shape.kind) {
 *     case 'circle':    return Math.PI * shape.radius ** 2;
 *     case 'square':    return shape.side ** 2;
 *     // 如果忘记处理 'triangle'，TypeScript 会在 default 分支报错
 *     default:          return assertNever(shape);
 *   }
 * }
 * ```
 */

/* =================================================================
 * Implementation
 * ================================================================ */

/**
 * 穷尽性检查：确保已处理 discriminated union 的所有分支。
 *
 * @param value - 经过所有 case 过滤后的剩余值（类型应为 never）
 * @returns never（永远不会正常返回）
 * @throws 如果运行时意外进入此分支
 */
export function assertNever(value: never): never {
  throw new Error(`[infra-fe] Unexpected value reached assertNever: ${JSON.stringify(value)}`);
}
