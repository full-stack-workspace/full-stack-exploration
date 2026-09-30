/**
 * ============================================================================
 * 性能优化 · 理解检验(/performance/check)
 * ============================================================================
 *
 * 从治理、指标、架构、调度、排查到 AI-Native。资深题标出星级和考察点,
 * 用来检验阶段和场景,而不是单点 API。
 *
 * @module topics/performance/check
 */

import { memo } from 'react';

import { CheckList } from '../../../components/check/CheckList';
import { SeriesNav } from '../components/SeriesNav';
import { PERFORMANCE_COUNT, PERFORMANCE_GROUPS } from './bank';

const PerformanceCheckPage = memo(() => {
    return (
        <CheckList
            title="性能优化 · 理解检验"
            description={`${PERFORMANCE_COUNT} 道问答,覆盖治理、指标、架构、调度、排查和 AI-Native。资深题同时看星级和考察点`}
            intro="这一页先问目标和阶段,再问某个 API 做得到什么。星级较高的题要求把实验室和现场、首次渲染和后续更新、快和正确分开。"
            groups={PERFORMANCE_GROUPS}
            nav={<SeriesNav current="check" />}
            closingTitle="对照时容易记混的四句"
            closingNote="和治理页、调度页对不上时,先用这四句把手段和目标分开。"
            closing={
                <ul className="list-disc space-y-2 pl-4 text-sm leading-relaxed text-gray-600 dark:text-slate-300">
                    <li>性能工作从 memo 开始:先删掉不必要的请求、状态和渲染范围。memo 只在跳过条件成立时有意义。</li>
                    <li>实验室分数就是用户体验:实验室守预算,现场看较慢那一截用户。两个数回答的不是同一个问题。</li>
                    <li>startTransition 能把任意大计算切开:它调度的是渲染,一个组件函数内部不会因为过渡而让出主线程。</li>
                    <li>首个 token 很快,生成式界面就快:首字不是第一次能用。取消未停的上游,费用和延迟都还在继续。</li>
                </ul>
            }
        />
    );
});

PerformanceCheckPage.displayName = 'PerformanceCheckPage';

export default PerformanceCheckPage;
