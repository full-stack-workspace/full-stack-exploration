/**
 * ============================================================================
 * 原理与架构 · 设计约束(/architecture/constraints)
 * ============================================================================
 *
 * 主线程一帧、完整树、更新缓急三条约束，说明栈协调器为何必须让 Fiber 停下来。
 *
 * @module topics/architecture/constraints
 */

import { memo } from 'react';
import { Link } from 'react-router-dom';

import { TopicPage, TopicSection } from '../../../components/TopicPage';
import { Diagram } from '../../../components/Diagram';
import { P, Stack } from '../components/Prose';
import { SeriesNav } from '../components/SeriesNav';
import { YieldCompare } from './YieldCompare';

const ConstraintsPage = memo(() => {
    return (
        <TopicPage
            title="原理与架构 · 设计约束"
            description="主线程的一帧、屏幕上的完整树、更新的缓急，这三条一起把栈协调器逼停"
        >
            <SeriesNav current="constraints" />

            <TopicSection title="三条约束同时成立">
                <Stack>
                    <P>主线程一帧的时间有限；屏幕上任何时候都是一棵完整的树；更新有急有缓。</P>
                </Stack>
            </TopicSection>

            <TopicSection title="栈协调器只能保住完整性">
                <Stack>
                    <P>调用栈不返回，点击和下一帧都排不上。</P>
                    <Diagram caption="递归调用栈没有安全的暂停点">
                        {`reconcile(App)
  reconcile(Header)
    reconcile(Title)      ← 调用栈里同时压着三帧
  reconcile(List)
    reconcile(Item) ...   ← 必须等最深的返回,才能处理点击

想暂停?调用栈不属于 React,中途 return 就丢了「走到哪」。`}
                    </Diagram>
                    <YieldCompare />
                </Stack>
            </TopicSection>

            <TopicSection title="Fiber 是为了还能停下来">
                <Stack>
                    <P>
                        工作单元把遍历从调用栈里拆出来，才能在单元之间让出主线程。数据结构在{' '}
                        <Link to="/architecture/fiber" className="underline underline-offset-2">
                            Fiber
                        </Link>{' '}
                        页展开，顺序在运行时总览与工作单元之后。
                    </P>
                </Stack>
            </TopicSection>
        </TopicPage>
    );
});

ConstraintsPage.displayName = 'ConstraintsPage';

export default ConstraintsPage;
