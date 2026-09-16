/**
 * ============================================================================
 * DebouncedDemo.tsx — useDebouncedValue 演示
 * ============================================================================
 *
 * 输入框对比「击键次数 vs 防抖后触发次数」。生产要点:防抖把
 * 高频事件流折叠成一次有效动作,是搜索建议、表单校验的标配;
 * cleanup 重置定时器 + 卸载清理,二者缺一不可。
 *
 * @module topics/hooks/custom-hooks/playground/components/DebouncedDemo
 */

import { memo, useEffect, useState } from 'react';
import { Input, Tag } from 'antd';

import { useDebouncedValue } from '../../lib';

export const DebouncedDemo = memo(() => {
    const [keyword, setKeyword] = useState('');
    const [keystrokes, setKeystrokes] = useState(0);
    const [triggers, setTriggers] = useState(0);
    const debouncedKeyword = useDebouncedValue(keyword, 500);

    // 防抖值真正变化才记一次「有效触发」(跳过首次挂载)
    useEffect(() => {
        if (debouncedKeyword !== '') {
            setTriggers((t) => t + 1);
        }
    }, [debouncedKeyword]);

    return (
        <div className="space-y-3">
            <Input
                placeholder="快速连续输入试试…"
                value={keyword}
                onChange={(e) => {
                    setKeyword(e.target.value);
                    setKeystrokes((k) => k + 1);
                }}
                className="max-w-sm"
            />
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                <Tag color="default">击键 {keystrokes} 次</Tag>
                <Tag color="violet">防抖后有效触发 {triggers} 次</Tag>
                <span className="text-xs text-gray-400 dark:text-slate-500">
                    防抖值:「{debouncedKeyword}」
                </span>
            </div>
        </div>
    );
});

DebouncedDemo.displayName = 'DebouncedDemo';
