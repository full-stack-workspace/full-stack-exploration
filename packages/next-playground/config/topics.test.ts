/**
 * ============================================================================
 * 专题注册表契约测试 — 单一数据源的兜底校验
 * ============================================================================
 *
 * 保证顶栏/侧边栏/首页/metadata 共用的注册表(config/topics.tsx)始终合法:
 * 注册表 path → app/ 薄壳、topics/ 内容、页头 path/title/description 三处
 * 同源,任何一处漂移都会在这里被拦截。
 *
 * 纯 node 环境,不渲染组件;跑法:pnpm test
 *
 * @module config/topics.test
 */

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { CATEGORIES, TOPICS } from "./topics";

/* =================================================================
 * 工具:路径解析与 JSX 文本反转义
 * ================================================================ */

/** 包根目录(config/ 的上一级),与 pnpm 运行目录无关 */
const PKG_ROOT = path.resolve(fileURLToPath(new URL(".", import.meta.url)), "..");

/**
 * 反转义 JSX 属性文本里的 HTML 实体,使 topics/ 文件内容可与注册表原文比对
 * (如注册表里的 "use cache" 在 JSX 中写作 &quot;use cache&quot;)。
 * &amp; 必须最后还原,避免把 &amp;quot; 二次反转义。
 */
const unescapeEntities = (s: string): string =>
    s
        .replace(/&quot;/g, "\"")
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&");

const topicContentFile = (topicPath: string): string =>
    path.join(PKG_ROOT, "topics", topicPath, "index.tsx");

const routeShellFile = (topicPath: string): string =>
    path.join(PKG_ROOT, "app", topicPath, "page.tsx");

/* =================================================================
 * 结构契约:path / category / related
 * ================================================================ */

describe("专题注册表结构", () => {
    it("每条 TOPICS.path 全站唯一", () => {
        const paths = TOPICS.map((t) => t.path);
        expect(new Set(paths).size).toBe(paths.length);
    });

    it("CATEGORIES.key 全站唯一", () => {
        const keys = CATEGORIES.map((c) => c.key);
        expect(new Set(keys).size).toBe(keys.length);
    });

    it("每个专题的 category 都存在于 CATEGORIES", () => {
        const keys = CATEGORIES.map((c) => c.key);
        for (const t of TOPICS) {
            expect(keys, `${t.path} 的 category "${t.category}" 未注册`).toContain(t.category);
        }
    });

    it("每个分类至少有一个专题(分类与注册表双向一致、顶栏点击有落点)", () => {
        for (const c of CATEGORIES) {
            expect(
                TOPICS.some((t) => t.category === c.key),
                `分类 "${c.key}" 下没有任何专题`,
            ).toBe(true);
        }
    });

    it("专题 path 以其所属分类的 basePath 开头", () => {
        for (const t of TOPICS) {
            const category = CATEGORIES.find((c) => c.key === t.category);
            expect(
                t.path.startsWith(`${category?.basePath}/`),
                `${t.path} 不在分类 ${t.category} 的 basePath 下`,
            ).toBe(true);
        }
    });

    it("related 数组里每个 path 都已注册且不等于自身", () => {
        const registered = new Set(TOPICS.map((t) => t.path));
        for (const t of TOPICS) {
            for (const rel of t.related ?? []) {
                expect(registered.has(rel), `${t.path} 的 related "${rel}" 未注册`).toBe(true);
                expect(rel, `${t.path} 的 related 不能引用自身`).not.toBe(t.path);
            }
        }
    });
});

/* =================================================================
 * 文件契约:注册表 → app/ 薄壳 → topics/ 内容
 * ================================================================ */

describe("注册表与文件系统一致", () => {
    it.each(TOPICS.map((t) => [t.path] as const))(
        "%s 有对应的 app 薄壳 page.tsx",
        (topicPath) => {
            expect(existsSync(routeShellFile(topicPath))).toBe(true);
        },
    );

    it.each(TOPICS.map((t) => [t.path] as const))(
        "%s 有对应的 topics/ 内容 index.tsx",
        (topicPath) => {
            expect(existsSync(topicContentFile(topicPath))).toBe(true);
        },
    );
});

describe("专题页头与注册表同源", () => {
    for (const topic of TOPICS) {
        it(`${topic.path} 页头 path/title/description 与注册表一致`, () => {
            const file = topicContentFile(topic.path);
            expect(existsSync(file), `${file} 不存在`).toBe(true);
            // 反转义后,TopicPage 的三个属性必须与注册表逐字一致,
            // 否则面包屑/页头/卡片会出现同源信息漂移
            const content = unescapeEntities(readFileSync(file, "utf8"));
            expect(content).toContain(`path="${topic.path}"`);
            expect(content).toContain(`title="${topic.title}"`);
            expect(content).toContain(`description="${topic.description}"`);
        });
    }
});
