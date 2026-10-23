/**
 * ============================================================================
 * 原理与架构 · 双缓冲(/architecture/double-buffer)
 * ============================================================================
 *
 * current 是已发布到屏幕上的树，workInProgress 是正在计算的草稿树，
 * alternate 把两棵互相指着。Commit 才切换 current。
 *
 * @module topics/architecture/double-buffer
 */

import { memo } from 'react';
import { Link } from 'react-router-dom';

import { TopicPage, TopicSection } from '../../../components/TopicPage';
import { Diagram } from '../../../components/Diagram';
import { P, Stack } from '../components/Prose';
import { SeriesNav } from '../components/SeriesNav';

const DoubleBufferPage = memo(() => {
    return (
        <TopicPage
            title="原理与架构 · 双缓冲"
            description="current 保持完整，workInProgress 可以丢掉，Commit 才发布"
        >
            <SeriesNav current="double-buffer" />

            <TopicSection
                title="计算不改屏幕上那棵树"
                note="讲解要点:Render 只改 workInProgress；用户读到的始终是 current 指向的那棵完整树。"
            >
                <Stack>
                    <P>
                        React 同时维护两棵 Fiber 树：<code>current</code> 是已经发布、与屏幕和 DOM 对齐的那一棵；<code>workInProgress</code>{' '}
                        是这次更新正在计算的草稿树，Render 阶段只改它。两棵树上逻辑位置相同的节点，通过各自的 <code>alternate</code>{' '}
                        互相指着——下次更新复用节点时，在 alternate 那一侧接着写，不必从零分配。
                    </P>
                    <Diagram caption="双缓冲：两棵树，一次只发布一棵">
                        {`root.current ──→ [ current 树 ]  ← 用户与 DOM 对齐的事实
                        alternate ↕ alternate
              workInProgress 树 ← Render 在这里打标记、比对子树

Render 可以中断、整段丢掉 workInProgress，current 不变。
Commit 结束时 root.current 指向新树，旧 current 变成下次的草稿。`}
                    </Diagram>
                    <P>
                        时间片用完或更高优先级更新插队时，协调器可以放弃整段 workInProgress，从 current 重新克隆一棵草稿再算。屏幕上那棵树从头到尾都是完整的——没有「算到一半就画出来」的中间态。
                    </P>
                    <P>用户任何时候看到的都是一棵完整的树</P>
                    <P>
                        草稿怎样一次性发布到屏幕、以及发布时同步做完哪些副作用，见{' '}
                        <Link to="/architecture/commit" className="underline underline-offset-2">
                            Commit
                        </Link>
                        。
                    </P>
                </Stack>
            </TopicSection>
        </TopicPage>
    );
});

DoubleBufferPage.displayName = 'DoubleBufferPage';

export default DoubleBufferPage;
