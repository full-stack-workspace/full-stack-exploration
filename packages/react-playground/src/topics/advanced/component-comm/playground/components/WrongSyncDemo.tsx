/**
 * ============================================================================
 * WrongSyncDemo — 用 effect 在兄弟间同步(反例)
 * ============================================================================
 *
 * 错误:子组件自己持有草稿,effect 再抄给父级。正确:草稿一开始就活在父级。
 * 打开开关看正确形状;关闭时输入会多一拍「上报」。
 *
 * @module topics/advanced/component-comm/playground/components/WrongSyncDemo
 */

import { memo, useEffect, useState } from 'react';
import { Switch } from 'antd';

import { Input } from '../../../../../components/Input';

const SyncedChild = memo(({ onDraftChange }: { onDraftChange: (value: string) => void }) => {
    const [draft, setDraft] = useState('');

    useEffect(() => {
        onDraftChange(draft);
    }, [draft, onDraftChange]);

    return (
        <Input
            aria-label="错误同步草稿"
            placeholder="写在子组件自己的 state 里"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
        />
    );
});

SyncedChild.displayName = 'SyncedChild';

const OwnedChild = memo(({ draft, onDraftChange }: { draft: string; onDraftChange: (value: string) => void }) => {
    return (
        <Input
            aria-label="父级拥有的草稿"
            placeholder="写在父级,子组件只是输入框"
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
        />
    );
});

OwnedChild.displayName = 'OwnedChild';

export const WrongSyncDemo = memo(() => {
    const [owned, setOwned] = useState(true);
    const [preview, setPreview] = useState('');

    return (
        <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                <Switch size="small" aria-label="草稿由父级拥有" checked={owned} onChange={setOwned} />
                草稿由父级拥有(关闭则子组件 effect 同步)
            </label>
            {owned ? (
                <OwnedChild draft={preview} onDraftChange={setPreview} />
            ) : (
                <SyncedChild onDraftChange={setPreview} />
            )}
            <p className="text-sm text-gray-700 dark:text-slate-300">
                父级预览: <span className="font-medium">{preview || '(空)'}</span>
            </p>
        </div>
    );
});

WrongSyncDemo.displayName = 'WrongSyncDemo';
