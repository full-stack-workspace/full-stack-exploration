/**
 * ============================================================================
 * useEffect — Hooks 专题
 * ============================================================================
 *
 * 演示 useEffect 的执行时机:依赖数组如何控制触发,
 * 以及清理函数(cleanup)在定时器场景下避免泄漏的作用。
 *
 * @module topics/hooks/use-effect
 */

import { useEffect, useState } from 'react';
import { Switch } from 'antd';

import { TopicPage, TopicSection } from '../../../components/TopicPage';

/** 秒表组件:挂载时启动定时器,卸载(或重启)时通过清理函数停止 */
const Stopwatch = () => {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
        // 清理函数:组件卸载或 effect 重新执行前调用,防止定时器泄漏
        return () => clearInterval(timer);
    }, []);

    return <span className="font-mono text-xl text-primary-600">{seconds}s</span>;
};

const UseEffectTopic = () => {
    const [keyword, setKeyword] = useState('');
    const [searchLog, setSearchLog] = useState<string[]>([]);
    const [mounted, setMounted] = useState(true);

    // 依赖 [keyword]:仅当 keyword 变化时才执行;输入停止后才真正"发起搜索"
    useEffect(() => {
        if (!keyword) {
            return;
        }
        const timer = setTimeout(() => {
            setSearchLog((prev) => [`搜索:"${keyword}"`, ...prev].slice(0, 5));
        }, 500);
        // 清理函数实现防抖:keyword 连续变化时,上一个定时器被取消
        return () => clearTimeout(timer);
    }, [keyword]);

    return (
        <TopicPage
            title="useEffect"
            description="在渲染之后执行副作用;依赖数组控制时机,清理函数负责收尾"
        >
            <TopicSection
                title="依赖数组 + 清理函数实现防抖"
                note="快速输入时不会每次都触发搜索——清理函数会取消上一个未执行的定时器,停顿 500ms 后才执行"
            >
                <div className="space-y-3">
                    <input
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="输入关键词试试防抖搜索"
                        className="w-64 rounded-card border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary-400"
                    />
                    <ul className="space-y-1 text-sm text-gray-600">
                        {searchLog.map((log, i) => (
                            <li key={`${log}-${i}`}>{log}</li>
                        ))}
                    </ul>
                </div>
            </TopicSection>

            <TopicSection
                title="挂载与卸载:定时器的生命周期"
                note="关闭开关卸载秒表组件,其 useEffect 的清理函数会停止定时器;重新打开从 0 开始"
            >
                <div className="flex items-center gap-4">
                    <Switch checked={mounted} onChange={setMounted} />
                    {mounted ? <Stopwatch /> : <span className="text-gray-400">秒表已卸载</span>}
                </div>
            </TopicSection>
        </TopicPage>
    );
};

export default UseEffectTopic;
