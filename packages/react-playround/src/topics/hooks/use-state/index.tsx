/**
 * ============================================================================
 * useState — Hooks 专题
 * ============================================================================
 *
 * 演示 useState 的核心用法:基础状态、函数式更新(避免闭包旧值)、
 * 对象状态的不可变更新。
 *
 * @module topics/hooks/use-state
 */

import { useState } from 'react';
import { Button, Input } from 'antd';

import { TopicPage, TopicSection } from '../../../components/TopicPage';

interface Profile {
    name: string;
    age: number;
}

const UseStateTopic = () => {
    const [count, setCount] = useState(0);
    const [profile, setProfile] = useState<Profile>({ name: '小明', age: 18 });

    // 连续调用三次直接传值的 setCount,只会 +1(三次都基于同一个旧闭包值)
    const addThreeDirectly = () => {
        setCount(count + 1);
        setCount(count + 1);
        setCount(count + 1);
    };

    // 函数式更新:每次都拿到最新状态,真正 +3
    const addThreeFunctional = () => {
        setCount((c) => c + 1);
        setCount((c) => c + 1);
        setCount((c) => c + 1);
    };

    return (
        <TopicPage
            title="useState"
            description="为函数组件声明状态;setState 触发重渲染,函数式更新可拿到最新状态"
        >
            <TopicSection
                title="函数式更新 vs 直接传值"
                note='同一事件里连续调用三次 setCount:直接传值只 +1(闭包旧值),函数式更新 +3。当前计数:${count}'
            >
                <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-primary-600">{count}</span>
                    <Button onClick={addThreeDirectly}>直接传值 ×3(只 +1)</Button>
                    <Button type="primary" onClick={addThreeFunctional}>函数式更新 ×3(+3)</Button>
                    <Button onClick={() => setCount(0)}>清零</Button>
                </div>
            </TopicSection>

            <TopicSection
                title="对象状态的不可变更新"
                note="不要直接修改 state 对象,而是用展开运算符创建新对象,只覆盖需要变更的字段"
            >
                <div className="flex items-center gap-4">
                    <Input
                        value={profile.name}
                        onChange={(e) =>
                            // 正确:创建新对象,保留 age 字段
                            setProfile((p) => ({ ...p, name: e.target.value }))
                        }
                        className="w-40"
                    />
                    <Button onClick={() => setProfile((p) => ({ ...p, age: p.age + 1 }))}>
                        年龄 +1
                    </Button>
                    <span className="text-gray-700">
                        {profile.name},{profile.age} 岁
                    </span>
                </div>
            </TopicSection>
        </TopicPage>
    );
};

export default UseStateTopic;
