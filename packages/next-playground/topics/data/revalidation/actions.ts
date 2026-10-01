/**
 * ============================================================================
 * 按需失效 Server Actions — revalidateTag 与 updateTag 的对照实验
 * ============================================================================
 *
 * 两个 action 故意只改一个变量(失效 API),其余动作完全一致,
 * 让「下一次读取的行为差异」可被肉眼观察:
 *
 * - revalidateTag(tag, "max"):stale-while-revalidate 语义。
 *   条目被标为过期,但下一次读取仍先返回旧值、后台再重建;
 *   本页表现:点击后 refresh() 带回的仍是旧时间戳,再刷一次才变
 * - updateTag(tag):立即过期,且只能在 Server Action 里调用
 *   (read-your-own-writes:写入方下一次读取必须看到自己的写入)。
 *   本页表现:点击后 refresh() 带回的就是新时间戳
 *
 * 末尾的 refresh() 让客户端路由重取本页 RSC 载荷:cacheComponents 下
 * Server Action 不再自动重渲当前路由,需要显式声明「这次变更要回读」。
 *
 * @module topics/data/revalidation/actions
 */

"use server";

import { refresh, revalidateTag, updateTag } from "next/cache";

import { REVALIDATION_TAG } from "./cached-posts";

/**
 * SWR 语义失效:标过期但不阻塞读取。
 * 适合「变了但不急」的内容 —— 读者晚几秒看到新值无所谓,响应不被重建拖慢。
 */
export async function invalidateWithRevalidateTag(): Promise<void> {
    // 第二参 "max" 是显式的 stale-while-revalidate 档案;
    // Next 16 起省略第二参会收到弃用警告
    revalidateTag(REVALIDATION_TAG, "max");
    // 让客户端立刻重取本页:这次重取拿到的仍是旧值(后台重建刚被触发),
    // 再刷新一次才能看到新时间戳 —— 差异本身就是演示内容
    refresh();
}

/**
 * 立即过期失效:下一次读取必须等新值算完。
 * 只能在 Server Action 里调用 —— 典型场景是「我刚改了数据,
 * 响应里就要带新值」(read-your-own-writes)。
 */
export async function invalidateWithUpdateTag(): Promise<void> {
    updateTag(REVALIDATION_TAG);
    // 这次重取会等缓存条目重建完成,响应里直接是新时间戳
    refresh();
}
