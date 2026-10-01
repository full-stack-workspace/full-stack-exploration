/**
 * ============================================================================
 * ClientEnvCells — 客户端视角的环境变量读数
 * ============================================================================
 *
 * Client Component 里对 process.env 的引用是「构建期文本替换」:
 * 只有 NEXT_PUBLIC_ 前缀的变量会被替换成真实值并打进 bundle,
 * 无前缀变量保持 undefined —— 本组件把这两个结果原样渲染出来,
 * 与同表里的服务端读数形成对照。
 *
 * 注意:必须逐字引用变量名,动态访问 process.env[name] 不会被替换。
 *
 * @module topics/security/boundaries/ClientEnvCells
 * @client
 */

"use client";

const MISSING = "undefined";

function ClientValue({ value }: { value: string | undefined }) {
    if (value === undefined) {
        return (
            <span className="font-mono text-xs font-semibold text-red-600 dark:text-red-400">
                {MISSING}
            </span>
        );
    }
    return (
        <span className="font-mono text-xs break-all text-emerald-700 dark:text-emerald-400">
            {value}
        </span>
    );
}

/** 客户端读无前缀的服务端变量:构建期不替换,恒为 undefined */
export function ClientServerOnlyValue() {
    return <ClientValue value={process.env.PLAYGROUND_SERVER_ONLY_DEMO} />;
}

/** 客户端读 NEXT_PUBLIC_ 变量:构建期内联成字面量,随 bundle 公开分发 */
export function ClientPublicValue() {
    return <ClientValue value={process.env.NEXT_PUBLIC_PLAYGROUND_BOUNDARY_DEMO} />;
}
