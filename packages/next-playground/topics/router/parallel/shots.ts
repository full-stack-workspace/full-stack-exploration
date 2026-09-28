/**
 * ============================================================================
 * 平行路由演示数据
 * ============================================================================
 *
 * 三条「镜头」只是可点的路由目标,用来区分:
 * 从列表点进去时被拦截成弹层,硬导航时是完整页。
 *
 * @module topics/router/parallel/shots
 */

export interface Shot {
    id: string;
    label: string;
    decision: string;
}

export const SHOTS: Shot[] = [
    {
        id: "ssg",
        label: "SSG",
        decision: "构建期渲染一次。列表上打开它,不该把列表卸掉。",
    },
    {
        id: "isr",
        label: "ISR",
        decision: "先给缓存,过期后再换。弹层关掉后,列表的滚动位置还在。",
    },
    {
        id: "stream",
        label: "Streaming",
        decision: "壳先到,慢的后补。详情可以盖在列表上,URL 仍然可分享。",
    },
];

/** 按 id 取一条镜头;没有则返回 undefined,由页面调用 notFound() */
export const getShot = (id: string): Shot | undefined =>
    SHOTS.find((shot) => shot.id === id);
