/**
 * 故意不存在的子路由:渲染期调用 notFound(),
 * 由上一级 app/router/errors/not-found.tsx 接住。
 */

import { notFound } from "next/navigation";

export default function MissingPage() {
    notFound();
}
