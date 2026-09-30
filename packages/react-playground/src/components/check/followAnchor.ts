/**
 * ============================================================================
 * followAnchor — 页内锚点滚进主内容区
 * ============================================================================
 *
 * 练习场的正文滚在顶栏下面的内容区里,不是窗口。
 * 普通 hash 有时只滚窗口,目录点击改为把目标滚进这个滚动容器。
 *
 * @module components/check/followAnchor
 */

import type { MouseEvent } from 'react';

function scrollParent(node: HTMLElement): HTMLElement | null {
    let current = node.parentElement;
    while (current) {
        const overflow = getComputedStyle(current).overflowY;
        if (overflow === 'auto' || overflow === 'scroll') {return current;}
        current = current.parentElement;
    }
    return null;
}

/** 左键单击且没有修饰键时,滚到 hash 对应的节点 */
export function followAnchor(event: MouseEvent<HTMLAnchorElement>): void {
    if (event.defaultPrevented || event.button !== 0) {return;}
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {return;}
    const hash = event.currentTarget.getAttribute('href');
    if (!hash?.startsWith('#')) {return;}
    const node = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!node) {return;}
    event.preventDefault();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    node.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
    if (scrollParent(node)) {
        history.replaceState(null, '', hash);
    }
}
