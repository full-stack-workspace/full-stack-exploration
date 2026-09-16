/**
 * ============================================================================
 * LocalStorageDemo.tsx — useLocalStorage 演示
 * ============================================================================
 *
 * 便签 textarea:内容刷新页面后仍在。生产要点:懒初始化只读一次
 * storage;写入异常(超配额/隐私模式)只告警不阻断;函数式更新
 * 保证「持久化的值」与「state 值」恒等。
 *
 * @module topics/hooks/custom-hooks/playground/components/LocalStorageDemo
 */

import { memo } from 'react';
import { Input } from 'antd';

import { useLocalStorage } from '../../lib';

const STORAGE_KEY = 'custom-hooks-playground-note';

export const LocalStorageDemo = memo(() => {
    const [note, setNote] = useLocalStorage(STORAGE_KEY, '');

    return (
        <div className="space-y-2">
            <Input.TextArea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="写点什么,然后刷新页面 —— 它还在"
                className="max-w-lg"
            />
            <p className="text-xs text-gray-400 dark:text-slate-500">
                已自动写入 localStorage(key: {STORAGE_KEY}),{note.length} 字
            </p>
        </div>
    );
});

LocalStorageDemo.displayName = 'LocalStorageDemo';
