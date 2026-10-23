/**
 * ============================================================================
 * 原理与架构 · 阅读地图(/architecture/map)
 * ============================================================================
 *
 * 已经写过的专题去哪读,源码章以后加在哪。站内链出去,源码路径只占位。
 *
 * @module topics/architecture/map
 */

import { memo } from 'react';
import { Link } from 'react-router-dom';

import { TopicPage, TopicSection } from '../../../components/TopicPage';
import { P, Stack } from '../components/Prose';
import { SeriesNav } from '../components/SeriesNav';

const SOURCE_ROWS: readonly { path: string; read: string; anchor: string }[] = [
    { path: '/architecture/source/work-loop', read: 'workLoopConcurrent / performUnitOfWork', anchor: 'Render' },
    { path: '/architecture/source/begin-work', read: 'beginWork', anchor: '工作单元、Render' },
    { path: '/architecture/source/complete-work', read: 'completeWork', anchor: 'Render' },
    { path: '/architecture/source/commit', read: 'commit 三阶段的入口', anchor: '双缓冲、Commit' },
    { path: '/architecture/source/hooks', read: 'memoizedState 链表', anchor: 'Hooks 链表' },
    { path: '/architecture/source/lanes', read: 'Lane 的合并与挑选', anchor: 'Scheduler' },
    { path: '/architecture/source/scheduler', read: '时间片与让出', anchor: 'Scheduler' },
];

const MapPage = memo(() => {
    return (
        <TopicPage
            title="原理与架构 · 阅读地图"
            description="已经写过的专题去哪读，源码章以后加在哪"
        >
            <SeriesNav current="map" />

            <TopicSection
                title="1. 这些规则已经有专页"
                note="讲解要点:本系列讲运行时结构,不重复 JSX、事件 API、调度演练和 RSC 边界。"
            >
                <Stack>
                    <P>
                        列表身份的使用规则在
                        <Link className="mx-1 text-cyan-700 underline underline-offset-2 dark:text-cyan-300" to="/basics/list-key">
                            列表与 key
                        </Link>
                        。原生监听和 `stopPropagation` 的坑在
                        <Link className="mx-1 text-cyan-700 underline underline-offset-2 dark:text-cyan-300" to="/basics/event">
                            事件与合成事件
                        </Link>
                        。`useTransition` 的交互演练在
                        <Link className="mx-1 text-cyan-700 underline underline-offset-2 dark:text-cyan-300" to="/performance/transition-deferred">
                            useTransition × useDeferredValue
                        </Link>
                        。Server Component 与 SSR 不是一回事,边界在
                        <Link className="mx-1 text-cyan-700 underline underline-offset-2 dark:text-cyan-300" to="/advanced/rsc-guide">
                            RSC · 深度梳理
                        </Link>
                        。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="2. 源码架还没写"
                note="讲解要点:路径先占位,等专题落地再注册路由。读源码时对照本系列已写的页。"
            >
                <Stack>
                    <P>
                        <span>React 19 的 react-reconciler 与 scheduler</span>
                        里,下面七条是最常翻的入口。现在只记路径和该钉住哪几页,不在这里展开实现。
                    </P>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
                            <thead>
                                <tr className="border-b border-fuchsia-200 dark:border-fuchsia-800">
                                    <th className="py-2 pr-4 font-semibold">路径</th>
                                    <th className="py-2 pr-4 font-semibold">读什么</th>
                                    <th className="py-2 font-semibold">钉住</th>
                                </tr>
                            </thead>
                            <tbody>
                                {SOURCE_ROWS.map((row) => (
                                    <tr
                                        key={row.path}
                                        className="border-b border-fuchsia-100 dark:border-fuchsia-900/60"
                                    >
                                        <td className="py-2 pr-4 font-mono text-xs">
                                            <code>{row.path}</code>
                                        </td>
                                        <td className="py-2 pr-4">{row.read}</td>
                                        <td className="py-2">{row.anchor}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Stack>
            </TopicSection>
        </TopicPage>
    );
});

MapPage.displayName = 'MapPage';

export default MapPage;
