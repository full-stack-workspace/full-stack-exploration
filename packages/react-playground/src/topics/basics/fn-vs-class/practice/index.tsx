/**
 * ============================================================================
 * 函数组件与类组件 · 看板实战(/topics/basics/fn-vs-class-practice)
 * ============================================================================
 *
 * 同一份行情看板:过滤、时钟、可取消报价。class 全堆在实例上;
 * 函数组件拆成渲染期派生 + useClock + useQuote。
 *
 * @module topics/basics/fn-vs-class/practice
 */

import { memo } from 'react';

import { TopicPage, TopicSection } from '../../../../components/TopicPage';
import { CodeBlock } from '../../../../components/CodeBlock';
import { ComparePane } from '../components/ComparePane';
import { NavBanner } from '../components/NavBanner';
import { RelatedTopics } from '../components/RelatedTopics';
import { WatchClass } from './WatchClass';
import { WatchFn } from './WatchFn';

const FnVsClassPractice = memo(() => {
    return (
        <TopicPage
            title="函数组件与类组件 · 看板实战"
            description="class 能做的过滤、时钟、可取消请求,函数组件用派生值 + Hook 做完,并且能单独复用、单独测"
        >
            <NavBanner current="practice" />

            <TopicSection
                title="同一份需求,两种所有权"
                note="玩法:两边都过滤 HOOK、点 TSLA 看报价从 loading 变成数字。行为应对齐。差别在于:左边时钟和请求是实例字段,换页就要把 didMount 再抄一遍;右边 useClock / useQuote 可以原样搬到别的页面。"
            >
                <ComparePane
                    classTitle="class · 一个实例上的字段和方法"
                    fnTitle="函数 · 派生 + 两个 Hook"
                    classSlot={<WatchClass />}
                    fnSlot={<WatchFn />}
                />
            </TopicSection>

            <TopicSection
                title="为什么右边更好(不是因为它更短)"
                note="短只是结果。生产里真正值钱的是:同步关系可拆、render 保持纯、请求有 abort、过滤没有第二份列表 state。"
            >
                <div className="space-y-4">
                    <CodeBlock
                        title="practice/hooks.ts(从实例上拆下来的两块)"
                        code={`function useClock(delayMs: number) {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), delayMs);
        return () => clearInterval(id);
    }, [delayMs]);
    return now;
}

function useQuote(symbolId: string | null) {
    useEffect(() => {
        if (!symbolId) return;
        const controller = new AbortController();
        fetchQuote(symbolId, controller.signal).then(setQuote);
        return () => controller.abort();
    }, [symbolId]);
}`}
                    />
                    <ul className="space-y-2 text-sm leading-relaxed text-gray-600 dark:text-slate-300">
                        <li>
                            <strong className="font-medium text-gray-800 dark:text-slate-100">过滤不进 state。</strong>
                            可见列表从 query 和静态 SYMBOLS 算出来。class 若再存一份
                            filtered,就要在每次输入后 setState,多一次事实。
                        </li>
                        <li>
                            <strong className="font-medium text-gray-800 dark:text-slate-100">时钟和报价解耦。</strong>
                            class 的 didUpdate 只盯 selectedId 还算克制;更多需求会继续往同一个实例加字段。Hook
                            的依赖数组就是边界。
                        </li>
                        <li>
                            <strong className="font-medium text-gray-800 dark:text-slate-100">换品种必 abort。</strong>
                            函数里 cleanup 做这件事几乎不可能忘;class 要记得在 loadQuote
                            开头和 willUnmount 都 abort,漏一处就是后发先至。
                        </li>
                        <li>
                            <strong className="font-medium text-gray-800 dark:text-slate-100">下一步能继续拆。</strong>
                            自定义 Hooks 专题会把 delay / abort / 竞态收成更完整的
                            useRequest。class 没有同等的「切开再组合」单位。
                        </li>
                    </ul>
                    <RelatedTopics
                        items={[
                            {
                                to: '/topics/hooks/custom-hooks-guide',
                                label: '自定义 Hooks 深入梳理',
                                why: 'useQuote 这种领域 Hook 再往上组合成 useUserSearch,树不用包 HOC',
                            },
                            {
                                to: '/topics/hooks/use-effect',
                                label: 'useEffect',
                                why: '时钟 interval 与 fetch abort 都是「与这一拍对齐」的 cleanup',
                            },
                            {
                                to: '/topics/advanced/component-comm-practice',
                                label: '组件通信 · 工作台实战',
                                why: '过滤进 URL、选中留页面,和本页「过滤派生、选中触发请求」是同一套所有权题',
                            },
                        ]}
                    />
                </div>
            </TopicSection>
        </TopicPage>
    );
});

FnVsClassPractice.displayName = 'FnVsClassPractice';

export default FnVsClassPractice;
