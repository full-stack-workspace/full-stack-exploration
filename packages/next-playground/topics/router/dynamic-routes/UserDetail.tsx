/**
 * ============================================================================
 * UserDetail — 动态段上的用户详情
 * ============================================================================
 *
 * Server Component。用户数据由页面在服务端按 params 取好再传入,
 * 本组件不再 useParams,也不再为了标题去把整页标成 Client。
 *
 * @module topics/router/dynamic-routes/UserDetail
 */

import Image from "next/image";
import Link from "next/link";

import type { User } from "@/types/user";

const STATUS_LABEL = {
    online: "在线",
    away: "离开",
    offline: "离线",
} as const;

/**
 * @param user - getUserById 的结果。不存在的 id 在页面里已经 notFound()
 */
export default function UserDetail({ user }: { user: User }) {
    return (
        <div className="mx-auto max-w-6xl">
            <Link
                href="/router/dynamic-routes"
                className="text-sm text-neutral-500 underline decoration-rule underline-offset-4 hover:text-ink dark:hover:text-neutral-100"
            >
                返回动态路由
            </Link>
            <div className="mt-6 flex items-center gap-4">
                <Image
                    src={user.avatar}
                    alt={user.name}
                    width={72}
                    height={72}
                    className="h-[72px] w-[72px] rounded-full object-cover"
                />
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-ink dark:text-neutral-50">
                        {user.name}
                    </h1>
                    <p className="mt-1 text-sm text-neutral-500">
                        {user.role} · {STATUS_LABEL[user.status]}
                    </p>
                </div>
            </div>
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                {user.bio}
            </p>
            <p className="mt-4 font-mono text-[11px] text-neutral-400">
                /router/dynamic-routes/{user.id}
                {user.location ? ` · ${user.location}` : ""}
            </p>
        </div>
    );
}
