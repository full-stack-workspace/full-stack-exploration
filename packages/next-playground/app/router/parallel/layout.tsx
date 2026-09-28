/**
 * ============================================================================
 * 平行路由布局 — children 与 @modal 同时渲染
 * ============================================================================
 *
 * modal 这个 prop 名对应目录 @modal。槽位在编译期绑定,改这个文件会让开发服务器重新收集槽。
 * 列表页在 children 里;拦截到的详情出现在 modal 里,列表不卸载。
 *
 * @module app/router/parallel/layout
 */

import type { ReactNode } from "react";

export default function ParallelLayout({
    children,
    modal,
}: {
    children: ReactNode;
    modal: ReactNode;
}) {
    return (
        <>
            {children}
            {modal}
        </>
    );
}
