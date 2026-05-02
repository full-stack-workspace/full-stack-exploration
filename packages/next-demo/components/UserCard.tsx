import Link from "next/link";
import { memo } from "react";
import type { User } from "@/types/user";
import { cn } from "@/lib/utils";

interface UserCardProps {
    user: User;
    animationDelay?: number;
}

const statusColors = {
    online: "bg-success-500",
    away: "bg-warning-500",
    offline: "bg-neutral-400",
};

const UserCard = memo(function UserCard({
    user,
    animationDelay = 0,
}: UserCardProps) {
    return (
        <Link
            key={user.id}
            href={`/user/${user.id}`}
            className="animate-slide-up group block rounded-2xl border border-neutral-200/60 bg-white p-6 transition-all duration-300 hover:border-success-200/60 hover:shadow-lg dark:border-neutral-800/60 dark:bg-neutral-900 dark:hover:border-success-800/60"
            style={{ animationDelay: `${animationDelay}ms` }}
        >
            <div className="flex items-center gap-4 mb-4">
                <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-full overflow-hidden shadow-md transition-shadow duration-300 group-hover:shadow-lg group-hover:shadow-success-500/20">
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>
                    <div className={cn("absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white", statusColors[user.status])}>
                        <span className="sr-only">{user.status}</span>
                    </div>
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-neutral-900 group-hover:text-success-600 transition-colors dark:text-neutral-50 dark:group-hover:text-success-400 truncate">
                        {user.name}
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">{user.role}</p>
                </div>
            </div>

            <p className="text-sm text-neutral-500 line-clamp-2 mb-4 dark:text-neutral-400">
                {user.bio}
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <span className="text-xs text-neutral-400 dark:text-neutral-500">
                    {user.projects} 项目
                </span>
                <span className="text-xs font-medium text-success-600 dark:text-success-400 group-hover:underline">
                    查看详情 →
                </span>
            </div>
        </Link>
    );
});

export default UserCard;