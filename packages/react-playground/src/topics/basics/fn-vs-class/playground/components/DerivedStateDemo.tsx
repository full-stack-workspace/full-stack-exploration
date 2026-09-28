/**
 * ============================================================================
 * DerivedStateDemo — 抄 props 进 state vs 用 key 重置
 * ============================================================================
 *
 * 换用户时,class 若只在 constructor / 首次 state 里抄 name,输入框卡住。
 * 函数组件把草稿做成带 key 的受控实例,换人等于换组件。
 *
 * @module topics/basics/fn-vs-class/playground/components/DerivedStateDemo
 */

import { Component, memo, useState } from 'react';
import { Button } from 'antd';

import { Input } from '../../../../../components/Input';
import { ComparePane } from '../../components/ComparePane';

interface DemoUser {
    id: string;
    name: string;
}

const USERS: DemoUser[] = [
    { id: 'u-lin', name: '林晓' },
    { id: 'u-chen', name: '陈默' },
];

class ClassCopiedName extends Component<{ user: DemoUser }, { name: string }> {
    static displayName = 'ClassCopiedName';

    state = { name: this.props.user.name };

    render() {
        return (
            <div className="space-y-2">
                <Input
                    aria-label="class 抄来的名字"
                    value={this.state.name}
                    onChange={(event) => this.setState({ name: event.target.value })}
                />
                <p className="text-[11px] text-gray-400">
                    props.user = {this.props.user.name} · state.name = {this.state.name}
                </p>
            </div>
        );
    }
}

const FnKeyedDraft = memo(({ user }: { user: DemoUser }) => {
    const [name, setName] = useState(user.name);

    return (
        <div className="space-y-2">
            <Input
                aria-label="函数按 key 重置的草稿"
                value={name}
                onChange={(event) => setName(event.target.value)}
            />
            <p className="text-[11px] text-gray-400">
                props.user = {user.name} · draft = {name}
            </p>
        </div>
    );
});

FnKeyedDraft.displayName = 'FnKeyedDraft';

export const DerivedStateDemo = memo(() => {
    const [index, setIndex] = useState(0);
    const user = USERS[index] ?? USERS[0];

    return (
        <div className="space-y-3">
            <Button
                size="small"
                aria-label="换成下一位用户"
                onClick={() => setIndex((curr) => (curr + 1) % USERS.length)}
            >
                换成下一位用户
            </Button>
            <ComparePane
                classTitle="class · 只在创建时抄 name"
                fnTitle="函数 · key=user.id 重置草稿"
                classSlot={<ClassCopiedName user={user} />}
                fnSlot={<FnKeyedDraft key={user.id} user={user} />}
            />
        </div>
    );
});

DerivedStateDemo.displayName = 'DerivedStateDemo';
