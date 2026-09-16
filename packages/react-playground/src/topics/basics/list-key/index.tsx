/**
 * ============================================================================
 * 列表与 key — React 基础专题
 * ============================================================================
 *
 * 通过经典的"输入框错位"实验演示 key 的作用:
 * key 是 React 在 Diff 时识别元素身份的线索,使用 index 作为 key
 * 在列表乱序时会导致组件内部状态与 DOM 错位。
 *
 * @module topics/basics/list-key
 */

import { useState } from 'react';
import { Button, Input, Segmented } from 'antd';

import { TopicPage, TopicSection } from '../../../components/TopicPage';

interface Person {
    id: number;
    name: string;
}

const INITIAL_LIST: Person[] = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Carol' },
];

const ListKeyTopic = () => {
    const [list, setList] = useState(INITIAL_LIST);
    const [keyMode, setKeyMode] = useState<'id' | 'index'>('id');

    // 向头部插入一项:index 作为 key 时,原有输入框内容会"串位"
    const prepend = () =>
        setList((prev) => [{ id: Date.now(), name: `新人 ${prev.length + 1}` }, ...prev]);

    const shuffle = () => setList((prev) => [...prev].reverse());

    return (
        <TopicPage
            title="列表与 key"
            description="key 帮助 React 识别元素身份;错误的 key 会让组件状态与 DOM 错位"
        >
            <TopicSection
                title="实验:key 用 id 还是 index?"
                note='先在输入框里随意输入内容,再点"头部插入"或"反转顺序":id 模式下内容跟随人走,index 模式下内容留在原地(错位)'
            >
                <div className="space-y-4">
                    <Segmented
                        value={keyMode}
                        onChange={(v) => setKeyMode(v as 'id' | 'index')}
                        options={[
                            { label: 'key = id(正确)', value: 'id' },
                            { label: 'key = index(危险)', value: 'index' },
                        ]}
                    />
                    <ul className="space-y-2">
                        {list.map((person, index) => (
                            <li
                                // 两种 key 策略在此切换,供对比实验
                                key={keyMode === 'id' ? person.id : index}
                                className="flex items-center gap-3 rounded-card border border-gray-100 bg-gray-50 p-3"
                            >
                                <span className="w-24 font-medium text-gray-700">{person.name}</span>
                                <Input placeholder="在这里输入备注,再做插入/反转实验" size="small" />
                            </li>
                        ))}
                    </ul>
                    <div className="space-x-3">
                        <Button type="primary" onClick={prepend}>头部插入一项</Button>
                        <Button onClick={shuffle}>反转顺序</Button>
                        <Button onClick={() => setList(INITIAL_LIST)}>重置列表</Button>
                    </div>
                </div>
            </TopicSection>
        </TopicPage>
    );
};

export default ListKeyTopic;
