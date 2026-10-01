/**
 * ============================================================================
 * 根级错误兜底 — global-error.tsx
 * ============================================================================
 *
 * 根布局自身抛错时的最后一道边界。Next 约定:它替换整个文档,
 * 必须自带 <html>/<body>,且必须是 Client Component(reset 依赖
 * 客户端 Error Boundary)。
 *
 * 此时 globals.css 与字体变量可能都不可用,所以全部用内联样式,
 * 只保留品牌底色与 signal 磷光,不依赖任何外部资源。
 *
 * @module app/global-error
 * @client
 */

"use client";

export default function GlobalError({
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="zh-CN">
            <body
                style={{
                    margin: 0,
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#071018",
                    color: "#F3F6F9",
                    fontFamily:
                        "system-ui, -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif",
                }}
            >
                <main style={{ maxWidth: 560, padding: "0 24px" }}>
                    {/* 五格刻度:与 BrandMark 同款,末格磷光 */}
                    <div
                        aria-hidden="true"
                        style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 48 }}
                    >
                        {[14, 20, 26, 32, 38].map((h, index) => (
                            <span
                                key={h}
                                style={{
                                    width: 6,
                                    height: h,
                                    borderRadius: 2,
                                    background: index === 4 ? "#1ECAD3" : "rgba(243,246,249,0.7)",
                                }}
                            />
                        ))}
                    </div>
                    <h1 style={{ margin: "24px 0 0", fontSize: 28, fontWeight: 600 }}>
                        站点渲染出错了
                    </h1>
                    <p style={{ margin: "12px 0 0", fontSize: 14, lineHeight: 1.8, color: "#9FB0BE" }}>
                        这是根布局之外的最后一道兜底。刷新或重试通常会恢复;若反复出现,请稍后再来。
                    </p>
                    <button
                        type="button"
                        onClick={reset}
                        style={{
                            marginTop: 28,
                            padding: "10px 20px",
                            fontSize: 14,
                            fontWeight: 500,
                            color: "#071018",
                            background: "#1ECAD3",
                            border: "none",
                            borderRadius: 8,
                            cursor: "pointer",
                        }}
                    >
                        重试
                    </button>
                </main>
            </body>
        </html>
    );
}
