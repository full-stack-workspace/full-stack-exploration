/**
 * ============================================================================
 * React 基础 · 理解检验(/basics/check)
 * ============================================================================
 *
 * 用问答把 JSX、列表 key、事件、函数组件和 RSC 再走一遍。
 * 星级题集中在事件、函数组件和 RSC 这三块核心子专题。
 *
 * @module topics/basics/check
 */

import { memo } from 'react';

import { CheckList } from '../../../components/check/CheckList';
import { BASICS_COUNT, BASICS_GROUPS } from './bank';

const BasicsCheckPage = memo(() => {
    return (
        <CheckList
            title="React 基础 · 理解检验"
            description={`${BASICS_COUNT} 道问答,分成 JSX、列表 key、事件、函数组件和 RSC。先用要点自答,星级题再看考察点`}
            intro="事件、函数组件和 RSC 里标了星级的题,是这三块要单独过一遍的。说法和前面的梳理一致:事件池是旧版本的行为,RSC 不是 SSR,函数组件也不是因为更快才被选用。"
            groups={BASICS_GROUPS}
            closingTitle="对照时容易记混的四句"
            closingNote="和旧文章对不上时,先用这四句对齐,再回到前面的专题核对。"
            closing={
                <ul className="list-disc space-y-2 pl-4 text-sm leading-relaxed text-gray-600 dark:text-slate-300">
                    <li>事件回调返回后字段被清空:那是 React 16 的事件池。17 起字段还在。</li>
                    <li>函数组件比类组件快:选用它是因为快照和组合更适合并发,不是因为每次渲染更便宜。</li>
                    <li>服务器组件就是 SSR:SSR 交付 HTML,服务器组件决定哪些代码和数据不必进浏览器包。</li>
                    <li>列表 key 用下标最省事:下标在插入、删除、排序时会对错状态。稳定 id 才是默认。</li>
                </ul>
            }
        />
    );
});

BasicsCheckPage.displayName = 'BasicsCheckPage';

export default BasicsCheckPage;
