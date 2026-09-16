/**
 * ============================================================================
 * CodeBlock.tsx — 代码展示块
 * ============================================================================
 *
 * 梳理页专用的只读代码块:深色底 + 等宽字体 + 可选文件名标签,
 * 用于展示与本仓库实现对齐的示例代码。
 *
 * @module components/CodeBlock
 */

import { memo } from 'react';

interface CodeBlockProps {
    /** 可选的文件名 / 标题标签,显示在代码块左上角 */
    title?: string;
    /** 代码文本(保留原始缩进与换行) */
    code: string;
}

/**
 * @example
 * <CodeBlock title="runtime/RuntimeStore.ts" code={SNIPPET} />
 */
export const CodeBlock = memo(({ title, code }: CodeBlockProps) => {
    return (
        <div className="overflow-hidden rounded-lg bg-gray-900 dark:bg-slate-950">
            {title && (
                <div className="border-b border-gray-700/60 px-3 py-1.5 font-mono text-[11px] text-gray-400">
                    {title}
                </div>
            )}
            <pre className="overflow-x-auto p-3 font-mono text-xs leading-relaxed text-gray-200">
                <code>{code}</code>
            </pre>
        </div>
    );
});

CodeBlock.displayName = 'CodeBlock';
