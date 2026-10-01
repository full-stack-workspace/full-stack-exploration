/**
 * ============================================================================
 * opengraph-image — 根级 OG 分享卡片(1200×630)
 * ============================================================================
 *
 * Next.js 16 文件约定:放在 app/ 根级,全站 og:image / twitter:image 默认用它,
 * 各专题页不单独覆盖(段级 opengraph-image 的玩法见 /metadata/guide 专题)。
 *
 * 画面与 components/BrandMark.tsx 同一套视觉:night 底上五根渐次升高的
 * 刻度,最右一根是 signal 磷光 —— 首页那把渲染尺子的缩小版。
 *
 * @module app/opengraph-image
 */

import { ImageResponse } from "next/og";

import { SITE_NAME, SITE_NAME_EN, SITE_THESIS } from "@/config/site";

export const alt = `${SITE_NAME} / ${SITE_NAME_EN} — ${SITE_THESIS}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* 与 BrandMark 同比例的五格刻度:底边对齐,高度递增,末格磷光 */
const BARS = [
    { h: 70, opacity: 0.38, fill: "#ffffff" },
    { h: 100, opacity: 0.55, fill: "#ffffff" },
    { h: 130, opacity: 0.72, fill: "#ffffff" },
    { h: 160, opacity: 0.88, fill: "#ffffff" },
    { h: 190, opacity: 1, fill: "#1ECAD3" },
];

export default function OpengraphImage() {
    return new ImageResponse(
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 72,
                width: "100%",
                height: "100%",
                padding: "0 96px",
                background: "#071018",
                fontFamily: "sans-serif",
            }}
        >
            {/* 方印上的五格刻度(BrandMark 放大版) */}
            <div
                style={{
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                    gap: 22,
                    width: 320,
                    height: 320,
                    borderRadius: 64,
                    background: "#0C1620",
                    paddingBottom: 65,
                }}
            >
                {BARS.map((bar) => (
                    <div
                        key={bar.h}
                        style={{
                            width: 26,
                            height: bar.h,
                            borderRadius: 6,
                            background: bar.fill,
                            opacity: bar.opacity,
                        }}
                    />
                ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
                <div
                    style={{
                        fontSize: 30,
                        letterSpacing: 6,
                        color: "#1ECAD3",
                        marginBottom: 24,
                    }}
                >
                    {SITE_NAME_EN}
                </div>
                <div
                    style={{
                        fontSize: 96,
                        fontWeight: 700,
                        letterSpacing: -2,
                        color: "#F3F6F9",
                        lineHeight: 1.1,
                    }}
                >
                    {SITE_NAME}
                </div>
                <div
                    style={{
                        fontSize: 36,
                        color: "#9FB0BE",
                        marginTop: 32,
                    }}
                >
                    {SITE_THESIS}
                </div>
            </div>
        </div>,
        { ...size },
    );
}
