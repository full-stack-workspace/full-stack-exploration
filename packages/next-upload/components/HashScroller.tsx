/**
 * ============================================================================
 * HashScroller — 初始加载的锚点滚动补偿
 * ============================================================================
 *
 * 解决的问题：
 * Next.js App Router 会接管浏览器滚动恢复（scrollRestoration = 'manual'），
 * 水合后把滚动位置重置为顶部；同时流式 SSR 下浏览器首次解析时目标锚点
 * 可能尚未到达。两者叠加导致直接访问 /#workbench 这类带 hash 的 URL 时
 * 页面停在顶部，不自动滚动。
 *
 * 做法：水合完成后若 URL 带 hash，找到目标元素补一次 scrollIntoView。
 * - 等 double rAF（两帧）再滚动，确保在 App Router 的滚动重置之后执行
 * - scroll-behavior: smooth 由 globals.css 的 html 规则提供；
 *   prefers-reduced-motion 下自动退化为瞬时滚动（motion-reduce:scroll-auto）
 * - scroll-mt-* 由目标 section 自带（为 sticky Header 留出偏移）
 *
 * @module components/HashScroller
 */
"use client";

import { useEffect } from "react";

export default function HashScroller() {
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) {
      return;
    }
    const el = document.getElementById(id);
    if (!el) {
      return;
    }
    // double rAF：跳过当前渲染帧与 App Router 水合后的滚动重置，再补锚点滚动
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.scrollIntoView();
      });
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  return null;
}
