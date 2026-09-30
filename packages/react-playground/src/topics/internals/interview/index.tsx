/**
 * ============================================================================
 * 内部机制 · 理解检验(/internals/interview)
 * ============================================================================
 *
 * 六十道问答,用来把前面九页再检验一遍。要点可见,展开默认收着。
 * 说法和前面九页一致:事件池已移除,副作用用 flags,虚拟 DOM 不是性能捷径。
 *
 * @module topics/internals/interview
 */

import { memo } from 'react';
import { Link } from 'react-router-dom';

import { CheckList } from '../../../components/check/CheckList';
import { SeriesNav } from '../components/SeriesNav';
import { NUMBERED_GROUPS, QUESTION_COUNT } from './bank';

const InterviewPage = memo(() => {
    return (
        <CheckList
            title="内部机制 · 理解检验"
            description={`${QUESTION_COUNT} 道问答,分成架构、Render、Commit、状态、调度、事件和 SSR 七组。先用要点检验自己,再对照展开`}
            intro="同一组里的题会互相引用。说法和梳理页一致:事件池是 React 16 的行为,提交标记是 flags,虚拟 DOM 不是「对象比 DOM 快」,Context 不会自动跳过中间组件。"
            groups={NUMBERED_GROUPS}
            nav={<SeriesNav current="interview" />}
            closingTitle="对照时容易记混的四句"
            closingNote="和旧文章对不上时,先用这四句把版本对齐,再回到前面的页核对。"
            closing={
                <ul className="list-disc space-y-2 pl-4 text-sm leading-relaxed text-gray-600 dark:text-slate-300">
                    <li>事件池、回调返回后字段被清空:React 16。17 起字段还在。</li>
                    <li>effectTag、nextEffect 链表:React 16 的提交导航。18 之后是 flags 和 subtreeFlags。</li>
                    <li>虚拟 DOM 比真实 DOM 快:价值是声明式和跨平台,Diff 发生在 Element 和已有 Fiber 之间。</li>
                    <li>
                        Context 会跳过中间组件:不会。能跳过靠 children 或 memo。用法在
                        <Link
                            className="mx-1 rounded-sm text-primary-700 underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 dark:text-primary-200"
                            to="/advanced/context"
                        >
                            Context API
                        </Link>
                        。
                    </li>
                </ul>
            }
        />
    );
});

InterviewPage.displayName = 'InterviewPage';

export default InterviewPage;
