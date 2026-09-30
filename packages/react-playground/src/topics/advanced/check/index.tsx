/**
 * ============================================================================
 * 进阶专题 · 理解检验(/advanced/check)
 * ============================================================================
 *
 * 通信、Context、错误边界、组合和数据边界。较难题标出星级和考察点。
 *
 * @module topics/advanced/check
 */

import { memo } from 'react';

import { CheckList } from '../../../components/check/CheckList';
import { ADVANCED_COUNT, ADVANCED_GROUPS } from './bank';

const AdvancedCheckPage = memo(() => {
    return (
        <CheckList
            title="进阶专题 · 理解检验"
            description={`${ADVANCED_COUNT} 道问答,覆盖通信通道、Context、错误边界、组合和数据边界。先用要点自答`}
            intro="通信和错误边界是这一类里要单独过硬的部分。星级题看的是通道该停在哪一层,以及失败会落在渲染里还是事件里。"
            groups={ADVANCED_GROUPS}
            closingTitle="对照时容易记混的四句"
            closingNote="答不上时回到通信梳理、Context 和错误边界,不要在这一页另记一套规则。"
            closing={
                <ul className="list-disc space-y-2 pl-4 text-sm leading-relaxed text-gray-600 dark:text-slate-300">
                    <li>Context 会跳过中间组件:不会。中间组件仍按自己的 state 和 props 渲染,只是不必再把数据逐层写成 props。</li>
                    <li>错误边界什么错都接:它接的是渲染和生命周期里的 throw。事件和请求里的失败要自己处理。</li>
                    <li>状态共享就上全局 store:先问数据归谁、传多远。多数共享停在最近的共同父级。</li>
                    <li>布尔开关能把一个组件变成所有模式:每加一个开关,组合数翻倍。模式不同就做成明确的变体。</li>
                </ul>
            }
        />
    );
});

AdvancedCheckPage.displayName = 'AdvancedCheckPage';

export default AdvancedCheckPage;
