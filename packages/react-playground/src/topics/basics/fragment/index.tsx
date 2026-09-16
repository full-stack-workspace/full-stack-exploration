/**
 * ============================================================================
 * Fragment — React 基础专题
 * ============================================================================
 *
 * 演示 Fragment 的使用场景:组件需要返回多个并列元素,
 * 但又不希望在 DOM 中引入多余的包裹节点。
 *
 * @module topics/basics/fragment
 */

import { useState } from 'react';
import { Button, Segmented } from 'antd';

import { TopicPage, TopicSection } from '../../../components/TopicPage';

/** 用 div 包裹的版本:DOM 中会多出一层 div */
const WithDiv = () => (
    <div className="contents-none">
        <li className="text-gray-700">列表项 A</li>
        <li className="text-gray-700">列表项 B</li>
    </div>
);

/** 用 Fragment 包裹的版本:不产生额外 DOM 节点 */
const WithFragment = () => (
    <>
        <li className="text-gray-700">列表项 A</li>
        <li className="text-gray-700">列表项 B</li>
    </>
);

const FragmentTopic = () => {
    const [mode, setMode] = useState<'div' | 'fragment'>('fragment');
    // 通过渲染次数直观说明:多余的包裹节点会干扰 ul > li 结构与样式选择器
    const [probe, setProbe] = useState('');

    return (
        <TopicPage
            title="Fragment"
            description="返回多个元素而不增加额外 DOM 节点,<>...</> 是 <Fragment> 的简写"
        >
            <TopicSection
                title="div 包裹 vs Fragment 包裹"
                note="切换两种写法,点击下方按钮查看 ul 的直接子节点——div 写法会破坏 ul > li 的语义结构"
            >
                <div className="space-y-4">
                    <Segmented
                        value={mode}
                        onChange={(v) => setMode(v as 'div' | 'fragment')}
                        options={[
                            { label: 'Fragment 包裹', value: 'fragment' },
                            { label: 'div 包裹', value: 'div' },
                        ]}
                    />
                    <ul className="rounded-card border border-dashed border-gray-200 p-4">
                        {mode === 'fragment' ? <WithFragment /> : <WithDiv />}
                    </ul>
                    <Button
                        onClick={(e) => {
                            const ul = (e.target as HTMLElement)
                                .closest('div')!
                                .querySelector('ul');
                            const tags = Array.from(ul?.children ?? []).map(
                                (n) => n.tagName.toLowerCase(),
                            );
                            setProbe(`ul 的直接子节点:[${tags.join(', ')}]`);
                        }}
                    >
                        检查 DOM 结构
                    </Button>
                    {probe && (
                        <p className="rounded-card bg-gray-50 p-3 font-mono text-xs text-gray-600">
                            {probe}
                        </p>
                    )}
                </div>
            </TopicSection>
        </TopicPage>
    );
};

export default FragmentTopic;
