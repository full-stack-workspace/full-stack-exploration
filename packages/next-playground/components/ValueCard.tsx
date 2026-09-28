import { memo } from "react";

import type { Value } from "@/types/about";

interface ValueCardProps {
    value: Value;
    animationDelay?: number;
}

const valueIcons: Record<string, React.ReactNode> = {
    innovation: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
    ),
    quality: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    ),
    collaboration: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    ),
    growth: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
    ),
};

const ValueCard = memo(({
    value,
    animationDelay = 0,
}: ValueCardProps) => {
    const icon = valueIcons[value.id] || valueIcons.innovation;

    return (
        <div
            className={`animate-slide-up group relative rounded-2xl border border-neutral-200/60 bg-white p-6 transition-all duration-300 hover:border-primary-200/60 hover:shadow-xl dark:border-neutral-800/60 dark:bg-neutral-800/50 dark:hover:bg-neutral-800`}
            style={{ animationDelay: `${animationDelay}ms` }}
        >
            <div className="mb-4 inline-flex rounded-xl bg-primary-100 p-3 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                {icon}
            </div>
            <h3 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-50">
                {value.title}
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {value.description}
            </p>
        </div>
    );
});
ValueCard.displayName = "ValueCard";

export default ValueCard;