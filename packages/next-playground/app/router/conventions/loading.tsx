/**
 * ============================================================================
 * Loading — /router/conventions 段的加载兜底
 * ============================================================================
 *
 * 本文件是「约定文件对照」专题的真实演示素材:
 * loading.tsx 本质是 Next.js 自动给该段的 page 包一层 <Suspense>,
 * 页面组件(或其取数)未完成时渲染本组件作为 fallback。
 *
 * 触发时机:
 * - 首次渲染该段且页面取数未就绪(本页是纯静态页,正常几乎不可见)
 * - 同段导航时新页面仍在渲染期间
 *
 * @module router/conventions/loading
 */

export default function Loading() {
    // 与专题页 TopicSection 外形对齐的骨架,避免加载时布局跳动
    return (
        <div className="mx-auto w-full max-w-5xl animate-pulse">
            {/* 页头骨架:竖条 + 标题行 + 描述行 */}
            <div className="mb-8 border-l-4 border-sky-200 pl-4 dark:border-sky-800">
                <div className="h-7 w-56 rounded bg-neutral-200 dark:bg-neutral-800" />
                <div className="mt-2 h-4 w-full max-w-xl rounded bg-neutral-200 dark:bg-neutral-800" />
            </div>
            {/* 分区卡片骨架 */}
            <div className="space-y-6">
                <div className="h-40 rounded-2xl bg-neutral-200/70 dark:bg-neutral-800/70" />
                <div className="h-64 rounded-2xl bg-neutral-200/70 dark:bg-neutral-800/70" />
            </div>
        </div>
    );
}
