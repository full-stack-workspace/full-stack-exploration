/**
 * ============================================================================
 * CodeBlock.tsx — 代码展示块
 * ============================================================================
 *
 * 梳理页专用的只读代码块:深色底 + 等宽字体 + 可选文件名标签。
 * 传入 `language` 后按该语言做语法高亮(JS / JSX / TS / TSX / HTML 等)。
 * 专题页的每一处调用都要带上语言;省略时退回纯文本,只留给确实不是代码的片段。
 *
 * 代码块底色固定是深色面板,高亮色板只服务这块深底,不跟随页面亮暗主题切换。
 *
 * @module components/CodeBlock
 */

import { memo } from 'react';
import { Highlight, type PrismTheme } from 'prism-react-renderer';

/* =================================================================
 * 语言
 * ================================================================ */

/**
 * 可传入的语言。短名与全名等价,例如 `ts` 与 `typescript`。
 * `text` 显式关闭高亮。
 */
export type CodeLanguage =
    | 'js'
    | 'javascript'
    | 'jsx'
    | 'ts'
    | 'typescript'
    | 'tsx'
    | 'html'
    | 'xml'
    | 'svg'
    | 'css'
    | 'json'
    | 'markdown'
    | 'md'
    | 'graphql'
    | 'python'
    | 'py'
    | 'rust'
    | 'go'
    | 'sql'
    | 'yaml'
    | 'yml'
    | 'text';

interface CodeBlockProps {
    /** 可选的文件名 / 标题标签,显示在代码块左上角 */
    title?: string;
    /** 代码文本(保留原始缩进与换行) */
    code: string;
    /**
     * 语法高亮语言。
     * 传入后按 Prism 文法着色,并在标题栏右侧标出语言;
     * 省略或传 `text` 时保持纯文本。
     */
    language?: CodeLanguage;
}

/** 调用方语言名 → Prism 文法 id。HTML / XML / SVG 都走 markup 文法。 */
const PRISM_LANGUAGE: Record<Exclude<CodeLanguage, 'text'>, string> = {
    js: 'javascript',
    javascript: 'javascript',
    jsx: 'jsx',
    ts: 'typescript',
    typescript: 'typescript',
    tsx: 'tsx',
    html: 'markup',
    xml: 'markup',
    svg: 'markup',
    css: 'css',
    json: 'json',
    markdown: 'markdown',
    md: 'markdown',
    graphql: 'graphql',
    python: 'python',
    py: 'python',
    rust: 'rust',
    go: 'go',
    sql: 'sql',
    yaml: 'yaml',
    yml: 'yaml',
};

/** 标题栏右侧的短标签,用调用方传入的名字,而不是归一化后的文法 id。 */
const LANGUAGE_LABEL: Record<Exclude<CodeLanguage, 'text'>, string> = {
    js: 'JS',
    javascript: 'JavaScript',
    jsx: 'JSX',
    ts: 'TS',
    typescript: 'TypeScript',
    tsx: 'TSX',
    html: 'HTML',
    xml: 'XML',
    svg: 'SVG',
    css: 'CSS',
    json: 'JSON',
    markdown: 'Markdown',
    md: 'Markdown',
    graphql: 'GraphQL',
    python: 'Python',
    py: 'Python',
    rust: 'Rust',
    go: 'Go',
    sql: 'SQL',
    yaml: 'YAML',
    yml: 'YAML',
};

/**
 * 把调用方语言解析成可高亮的文法。`text` 与缺省都不着色。
 * @param language - 组件收到的语言
 * @returns Prism 文法 id 与标题栏标签;不需要高亮时返回 null
 */
function resolveHighlight(language: CodeLanguage | undefined): { prism: string; label: string } | null {
    if (!language || language === 'text') {
        return null;
    }
    return { prism: PRISM_LANGUAGE[language], label: LANGUAGE_LABEL[language] };
}

/* =================================================================
 * 深色面板色板
 * ================================================================ */

/**
 * 一个 token 可能同时带多个类型,着色时靠后的类型覆盖靠前的。
 * JSX 组件名是 tag + class-name,因此取青色;只有 tag 的原生标签保持粉色。
 */
const CODE_THEME: PrismTheme = {
    plain: {
        color: '#e5e7eb',
        backgroundColor: 'transparent',
    },
    styles: [
        { types: ['comment', 'prolog', 'doctype', 'cdata'], style: { color: '#9ca3af', fontStyle: 'italic' } },
        { types: ['punctuation', 'script-punctuation'], style: { color: '#94a3b8' } },
        { types: ['operator', 'arrow'], style: { color: '#c4b5fd' } },
        { types: ['keyword', 'atrule'], style: { color: '#c4b5fd' } },
        { types: ['tag'], style: { color: '#f472b6' } },
        { types: ['attr-name'], style: { color: '#fbbf24' } },
        { types: ['string', 'attr-value', 'char', 'inserted'], style: { color: '#86efac' } },
        { types: ['boolean', 'number', 'constant', 'symbol'], style: { color: '#fcd34d' } },
        { types: ['function'], style: { color: '#7dd3fc' } },
        { types: ['class-name', 'maybe-class-name', 'builtin'], style: { color: '#67e8f9' } },
        { types: ['property', 'property-access'], style: { color: '#bae6fd' } },
        { types: ['regex', 'important', 'variable'], style: { color: '#fdba74' } },
    ],
};

/* =================================================================
 * 高亮渲染
 * ================================================================ */

interface HighlightedCodeProps {
    code: string;
    /** Prism 文法 id,如 tsx / markup / javascript */
    prismLanguage: string;
}

/**
 * 按行渲染 token。每行单独成块并保留空白,空行用不换行空格撑住行高,
 * 否则 Prism 给出的 `\n` 放进块级元素后会被折掉。
 */
function HighlightedCode({ code, prismLanguage }: HighlightedCodeProps) {
    return (
        <Highlight theme={CODE_THEME} code={code} language={prismLanguage}>
            {({ tokens, getLineProps, getTokenProps }) => (
                <pre className="overflow-x-auto p-3 font-mono text-xs leading-relaxed">
                    <code>
                        {tokens.map((line, lineIndex) => {
                            const lineProps = getLineProps({ line });
                            const isEmpty = line.every((token) => token.empty);

                            return (
                                <div
                                    key={lineIndex}
                                    {...lineProps}
                                    className="min-h-[1.625em] whitespace-pre"
                                >
                                    {isEmpty
                                        ? '\u00a0'
                                        : line.map((token, tokenIndex) => (
                                              <span key={tokenIndex} {...getTokenProps({ token })} />
                                          ))}
                                </div>
                            );
                        })}
                    </code>
                </pre>
            )}
        </Highlight>
    );
}

/* =================================================================
 * CodeBlock
 * ================================================================ */

/**
 * @example
 * <CodeBlock title="UserForm.tsx" language="tsx" code={SNIPPET} />
 */
export const CodeBlock = memo(({ title, code, language }: CodeBlockProps) => {
    const highlight = resolveHighlight(language);

    return (
        <div className="overflow-hidden rounded-lg bg-gray-900 dark:bg-slate-950">
            {(title || highlight) && (
                <div className="flex items-center justify-between gap-3 border-b border-gray-700/60 px-3 py-1.5">
                    <span className="min-w-0 truncate font-mono text-[11px] text-gray-400">{title}</span>
                    {highlight && (
                        <span className="shrink-0 font-mono text-[10px] font-medium uppercase tracking-wider text-gray-500">
                            {highlight.label}
                        </span>
                    )}
                </div>
            )}
            {highlight ? (
                <HighlightedCode code={code} prismLanguage={highlight.prism} />
            ) : (
                <pre className="overflow-x-auto p-3 font-mono text-xs leading-relaxed text-gray-200">
                    <code>{code}</code>
                </pre>
            )}
        </div>
    );
});

CodeBlock.displayName = 'CodeBlock';
