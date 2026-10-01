/**
 * 演示 cookie 名常量。
 * 独立成文件的原因:actions.ts 是 "use server" 文件,
 * 模块级只允许导出 async 函数,常量放不进去;
 * CookiePanel(读)与 actions(写)从这里取同一个名字,避免漂移。
 *
 * @module topics/data/dynamic-apis/constants
 */

export const DEMO_COOKIE = "demo-pref";
