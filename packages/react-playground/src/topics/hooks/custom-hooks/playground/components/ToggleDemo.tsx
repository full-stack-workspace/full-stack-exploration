/**
 * ============================================================================
 * ToggleDemo.tsx — useToggle 演示
 * ============================================================================
 *
 * 开关一张高亮卡片。生产要点:useToggle 的所有操作函数引用稳定,
 * 可直接作为 memo 子组件的 props / effect 依赖而不引发级联重渲染。
 *
 * @module topics/hooks/custom-hooks/playground/components/ToggleDemo
 */

import { memo } from 'react';
import { Switch } from 'antd';

import { useToggle } from '../../lib';

export const ToggleDemo = memo(() => {
    const [on, { toggle, setFalse }] = useToggle(false);

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <Switch checked={on} onChange={toggle} />
                <span className="text-sm text-gray-600 dark:text-slate-300">
                    当前状态:{on ? '开' : '关'}
                </span>
                <button
                    type="button"
                    onClick={setFalse}
                    className="text-xs text-violet-600 hover:underline dark:text-violet-400"
                >
                    一键置关(setFalse)
                </button>
            </div>
            <div
                className={`rounded-lg border p-4 text-sm transition-colors ${
                    on
                        ? 'border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-700 dark:bg-violet-950/40 dark:text-violet-300'
                        : 'border-gray-100 bg-gray-50 text-gray-400 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-500'
                }`}
            >
                {on ? '卡片已点亮 ✨ toggle 让布尔状态的三操作(切/开/关)一处定义、处处复用' : '卡片已熄灭,点击 Switch 点亮'}
            </div>
        </div>
    );
});

ToggleDemo.displayName = 'ToggleDemo';
