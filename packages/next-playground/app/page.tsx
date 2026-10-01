/**
 * ============================================================================
 * Home Page — 首页(注册表驱动的专题导航 Hub)
 * ============================================================================
 *
 * Signal Lab 首页两段:
 * - 英雄区:品牌论点 + 活光谱(尺子链到已有对照页的那几格)
 * - 分类地图:CATEGORIES × getTopicsByCategory,渲染策略占更宽一格
 *
 * @module page
 */

import { CategoryMap } from "@/components/home/CategoryMap";
import { SpectrumHero } from "@/components/home/SpectrumHero";
import { DirectionalTransition } from "@/components/topic/DirectionalTransition";

export default function Home() {
    return (
        <DirectionalTransition>
            <div className="mx-auto w-full max-w-6xl">
                <SpectrumHero />
                <CategoryMap />
            </div>
        </DirectionalTransition>
    );
}
