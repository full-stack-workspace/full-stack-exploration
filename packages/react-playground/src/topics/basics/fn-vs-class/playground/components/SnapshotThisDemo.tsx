/**
 * ============================================================================
 * SnapshotThisDemo — 延时回调读的是盒子还是快照
 * ============================================================================
 *
 * class 的 this.state 会被就地改写,稍后读到最新值。
 * 函数组件闭包锁住点击发生的那一拍。这是新模型,不是缺陷。
 *
 * @module topics/basics/fn-vs-class/playground/components/SnapshotThisDemo
 */

import { Component, memo, useState } from 'react';
import { Button } from 'antd';

import { ComparePane } from '../../components/ComparePane';

const DELAY_MS = 800;

class ClassSnapshot extends Component<object, { count: number; later: string }> {
    static displayName = 'ClassSnapshot';

    state = { count: 0, later: '(还没读)' };

    render() {
        const { count, later } = this.state;
        return (
            <div className="space-y-2">
                <p className="font-mono text-xs text-gray-500" aria-label="class 当前 count">
                    当前 count = {count}
                </p>
                <div className="flex flex-wrap gap-2">
                    <Button size="small" onClick={() => this.setState((curr) => ({ count: curr.count + 1 }))}>
                        class · +1
                    </Button>
                    <Button
                        size="small"
                        type="primary"
                        onClick={() => {
                            window.setTimeout(() => {
                                this.setState({ later: `读到 ${this.state.count}` });
                            }, DELAY_MS);
                        }}
                    >
                        class · {DELAY_MS}ms 后读
                    </Button>
                </div>
                <p className="text-sm text-amber-800 dark:text-amber-300" aria-label="class 延时读数">
                    {later}
                </p>
            </div>
        );
    }
}

const FnSnapshot = memo(() => {
    const [count, setCount] = useState(0);
    const [later, setLater] = useState('(还没读)');

    return (
        <div className="space-y-2">
            <p className="font-mono text-xs text-gray-500" aria-label="函数 当前 count">
                当前 count = {count}
            </p>
            <div className="flex flex-wrap gap-2">
                <Button size="small" onClick={() => setCount((curr) => curr + 1)}>
                    函数 · +1
                </Button>
                <Button
                    size="small"
                    type="primary"
                    onClick={() => {
                        window.setTimeout(() => {
                            setLater(`读到 ${count}`);
                        }, DELAY_MS);
                    }}
                >
                    函数 · {DELAY_MS}ms 后读
                </Button>
            </div>
            <p className="text-sm text-indigo-800 dark:text-indigo-300" aria-label="函数 延时读数">
                {later}
            </p>
        </div>
    );
});

FnSnapshot.displayName = 'FnSnapshot';

export const SnapshotThisDemo = memo(() => {
    return (
        <ComparePane
            classTitle="class · 读 this.state(盒子)"
            fnTitle="函数 · 读那一拍的 count(快照)"
            classSlot={<ClassSnapshot />}
            fnSlot={<FnSnapshot />}
        />
    );
});

SnapshotThisDemo.displayName = 'SnapshotThisDemo';
