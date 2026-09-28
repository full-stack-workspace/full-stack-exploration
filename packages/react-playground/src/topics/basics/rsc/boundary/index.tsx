/**
 * ============================================================================
 * RSC · 边界示意(/topics/basics/rsc-boundary)
 * ============================================================================
 *
 * 用一张商品页演示边界规则:事件必须在 Client,密钥必须离开 Client 图,
 * Client 不能 import Server。不启动 RSC 运行时。
 *
 * @module topics/basics/rsc/boundary
 */

import { memo } from 'react';
import type { ReactNode } from 'react';

import { TopicPage, TopicSection } from '../../../../components/TopicPage';
import { Diagram } from '../../../../components/Diagram';
import { NavBanner } from '../components/NavBanner';
import { BoundaryBoard } from './components/BoundaryBoard';

const P = ({ children }: { children: ReactNode }) => (
    <p className="text-sm leading-relaxed text-gray-600 dark:text-slate-300">{children}</p>
);

const RscBoundary = memo(() => {
    return (
        <TopicPage
            title="RSC · 边界示意"
            description="切换每一块放在 Server 还是 Client。下面的包和载荷是规则推出来的,浏览器并没有在跑 Server Component"
        >
            <NavBanner current="boundary" />

            <TopicSection
                title="1. 默认切分:读库留在服务器,点击留在叶子"
                note="玩法:先看绿色结论。再把「加入购物车」改成 Server,或把「商品正文」改成 Client,或打开 import 开关。"
            >
                <BoundaryBoard />
            </TopicSection>

            <TopicSection
                title="2. 打开 import 开关时,实际在问组合方向"
                note="讲解要点:筛选需要状态,所以壳是 Client。推荐不需要事件,可以仍是 Server。两者要同时出现,只能由 Server 父组件把推荐作为 children 传进壳。"
            >
                <Diagram caption="同一屏幕,两种模块关系">
                    {`非法
  filter-shell.tsx  ('use client')
    import { Recs } from './recs'   ← recs 是 Server Component

合法
  page.tsx  (Server)
    <FilterShell>
      <Recs />
    </FilterShell>`}
                </Diagram>
                <P>
                    把全部块都点成 Client,相当于在路由根上写了{' '}
                    <code className="font-mono text-[11px]">&apos;use client&apos;</code>
                    。页面还能交互,但 RSC 没参与,markdown 和取数都会进包。
                </P>
            </TopicSection>
        </TopicPage>
    );
});

RscBoundary.displayName = 'RscBoundary';

export default RscBoundary;
