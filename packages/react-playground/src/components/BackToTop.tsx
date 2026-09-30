/**
 * ============================================================================
 * BackToTop — 回到顶部按钮
 * ============================================================================
 *
 * 壳层右下角悬浮按钮:主内容区(Content)向下滚动超过阈值后淡入,
 * 点击平滑滚回顶部;未滚动或回到阈值以内时淡出并移出 Tab 序。
 *
 * 功能特点:
 * - 监听的是 Content 滚动容器而非 window(壳层锁死视口,唯一滚动区是 Content)
 * - 尊重 prefers-reduced-motion:减弱动态偏好的用户直接跳转,不做平滑滚动
 * - 始终挂载、用透明度/位移动画过渡,避免滚动临界处的挂载抖动
 *
 * @module components/BackToTop
 */

import { memo, useEffect, useState } from 'react';
import { ArrowUpOutlined } from '@ant-design/icons';

/** 滚动超过该距离(px)才显示按钮 */
const SHOW_AFTER_PX = 320;

interface BackToTopProps {
    /** 滚动容器的元素 id,默认是壳层主内容区 */
    targetId?: string;
}

/**
 * 回到顶部悬浮按钮。
 *
 * @param targetId - 滚动容器元素 id;默认 `main-content`(App 壳层 Content)
 * @example
 * <BackToTop />
 */
const BackToTop = memo<BackToTopProps>(function BackToTop({ targetId = 'main-content' }) {
    const [visible, setVisible] = useState(false);

    // 滚动监听挂在 Content 容器上;passive 监听不阻塞滚动帧
    useEffect(() => {
        const container = document.getElementById(targetId);
        if (!container) {
            return;
        }
        const onScroll = () => setVisible(container.scrollTop > SHOW_AFTER_PX);
        container.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => container.removeEventListener('scroll', onScroll);
    }, [targetId]);

    const handleClick = () => {
        const container = document.getElementById(targetId);
        if (!container) {
            return;
        }
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        container.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-label="回到顶部"
            aria-hidden={!visible}
            tabIndex={visible ? 0 : -1}
            className={`fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-primary-600 shadow-card backdrop-blur-md transition-all duration-300 hover:shadow-card-hover dark:border-slate-700 dark:bg-slate-800/90 dark:text-primary-400 ${
                visible
                    ? 'translate-y-0 opacity-100'
                    : 'pointer-events-none translate-y-3 opacity-0'
            }`}
        >
            <ArrowUpOutlined />
        </button>
    );
});

BackToTop.displayName = 'BackToTop';

export default BackToTop;
