/**
 * ============================================================================
 * PropsCallbackDemo — props 往下,callback 往上
 * ============================================================================
 *
 * 父组件拥有 keyword,输入框只渲染快照并上报意图;列表拿过滤后的结果。
 * 这是默认通道,购物车专题同一形状。
 *
 * @module topics/advanced/component-comm/playground/components/PropsCallbackDemo
 */

import { memo, useState } from 'react';

import { Input } from '../../../../../components/Input';

const BOOKS = ['Context 深入', '错误边界', 'Relay 数据流', '自定义 Hooks', '渲染调度'];

const FilterBar = memo(({ keyword, onKeywordChange }: { keyword: string; onKeywordChange: (value: string) => void }) => {
    return (
        <Input
            aria-label="过滤书名"
            placeholder="过滤书名"
            value={keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
        />
    );
});

FilterBar.displayName = 'FilterBar';

const BookList = memo(({ items }: { items: string[] }) => {
    if (items.length === 0) {
        return <p className="text-xs text-gray-400">没有匹配项</p>;
    }
    return (
        <ul aria-label="过滤结果" className="space-y-1 text-sm text-gray-700 dark:text-slate-300">
            {items.map((item) => (
                <li key={item}>{item}</li>
            ))}
        </ul>
    );
});

BookList.displayName = 'BookList';

export const PropsCallbackDemo = memo(() => {
    const [keyword, setKeyword] = useState('');
    const visible = BOOKS.filter((book) => book.toLowerCase().includes(keyword.trim().toLowerCase()));

    return (
        <div className="space-y-3">
            <FilterBar keyword={keyword} onKeywordChange={setKeyword} />
            <p className="font-mono text-xs text-gray-400">父级 keyword = 「{keyword || '(空)'}」</p>
            <BookList items={visible} />
        </div>
    );
});

PropsCallbackDemo.displayName = 'PropsCallbackDemo';
