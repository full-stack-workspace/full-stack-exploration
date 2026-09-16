/**
 * ============================================================================
 * JSX 与渲染 — React 基础专题
 * ============================================================================
 *
 * 演示 JSX 的核心能力:表达式插值、条件渲染的三种写法、
 * 以及 JSX 元素本质(plain object)的直观展示。
 *
 * @module topics/basics/jsx-render
 */

import { useState } from 'react';
import { Button } from 'antd';

import { TopicPage, TopicSection } from '../../../components/TopicPage';

const JsxRenderTopic = () => {
    const [showDetail, setShowDetail] = useState(false);
    const [level, setLevel] = useState(1);

    // JSX 元素本质上是一个普通的 JavaScript 对象
    const element = <span>你好,JSX</span>;

    return (
        <TopicPage
            title="JSX 与渲染"
            description="JSX 是 React.createElement 的语法糖,元素只是描述 UI 的普通对象"
        >
            <TopicSection
                title="表达式插值"
                note="JSX 的大括号 {} 中可以放入任意返回值的表达式:变量、运算、函数调用、三元表达式"
            >
                <div className="flex items-center gap-4">
                    <Button onClick={() => setLevel((v) => Math.max(1, v - 1))}>-</Button>
                    <span className="text-gray-700">
                        当前等级:{level},双倍经验:{level * 2},{level >= 5 ? '已解锁高级副本' : '继续升级'}
                    </span>
                    <Button type="primary" onClick={() => setLevel((v) => v + 1)}>+</Button>
                </div>
            </TopicSection>

            <TopicSection
                title="条件渲染"
                note="常用三种方式:&& 短路、三元表达式、提前 return;下方演示 && 短路写法"
            >
                <div className="space-y-3">
                    <Button type="primary" onClick={() => setShowDetail((v) => !v)}>
                        {showDetail ? '收起详情' : '展开详情'}
                    </Button>
                    {showDetail && (
                        <p className="rounded-card bg-primary-50 p-4 text-sm text-primary-700">
                            这段内容仅在 showDetail 为 true 时被渲染到 DOM 中。
                        </p>
                    )}
                </div>
            </TopicSection>

            <TopicSection
                title="元素的本质"
                note="JSX 编译后是 React.createElement 调用,产物是一个描述 UI 的普通对象(注意它的 keys)"
            >
                <div className="space-y-2">
                    <p className="text-gray-700">渲染结果:{element}</p>
                    <pre className="overflow-auto rounded-card bg-gray-900 p-4 text-xs text-emerald-300">
                        {`typeof element === '${typeof element}'\nObject.keys(element) = ${JSON.stringify(Object.keys(element))}`}
                    </pre>
                </div>
            </TopicSection>
        </TopicPage>
    );
};

export default JsxRenderTopic;
