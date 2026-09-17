/**
 * ============================================================================
 * ResetStateDemo.tsx — 生产范式一:用 key 重置组件状态
 * ============================================================================
 *
 * 用户列表 + 资料表单(表单内部持有草稿 state)。切换用户时:
 * - 开启「key 重置」:<UserForm key={user.id}> —— key 变化,React 卸载
 *   旧实例、挂载新实例,草稿自动归零
 * - 关闭对照:组件被原地复用,上一个用户的草稿残留在表单里(bug 现场)
 *
 * @module topics/basics/list-key/components/ResetStateDemo
 */

import { memo, useState } from 'react';
import { Input, Switch } from 'antd';

interface User {
    id: number;
    name: string;
    email: string;
}

const USERS: User[] = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' },
    { id: 3, name: 'Carol', email: 'carol@example.com' },
];

/* =================================================================
 * 资料表单:草稿是内部 state,初始值取自 props,之后由用户编辑
 * ================================================================ */

interface UserFormProps {
    /** 当前编辑的用户 */
    user: User;
}

/**
 * 用户资料表单:邮箱与简介都是从 props 初始化的「草稿 state」。
 * 父组件通过更换 key 决定「换用户时是否整表重置」,
 * 组件自身不需要任何同步逻辑。
 *
 * @param props.user - 当前编辑的用户
 * @returns 资料编辑表单
 */
const UserForm = memo(({ user }: UserFormProps) => {
    // 草稿 state:初始值来自 props,实例存续期间完全由用户输入驱动
    const [email, setEmail] = useState(user.email);
    const [bio, setBio] = useState('');

    return (
        <div className="space-y-3 rounded-card border border-gray-100 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
            <p className="text-sm font-medium text-gray-700 dark:text-slate-200">
                正在编辑:{user.name}
            </p>
            <Input
                addonBefore="邮箱"
                size="small"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <Input.TextArea
                rows={3}
                placeholder="个人简介草稿(输入几个字,再切换用户观察)"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
            />
        </div>
    );
});

UserForm.displayName = 'UserForm';

/* =================================================================
 * 演示主体:用户列表 + 可开关的 key 重置
 * ================================================================ */

export const ResetStateDemo = memo(() => {
    const [selectedId, setSelectedId] = useState(USERS[0].id);
    const [withKey, setWithKey] = useState(true);
    const user = USERS.find((u) => u.id === selectedId) ?? USERS[0];

    return (
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
            {/* 用户列表:点击切换编辑对象 */}
            <ul className="space-y-2">
                {USERS.map((u) => (
                    <li key={u.id}>
                        <button
                            type="button"
                            onClick={() => setSelectedId(u.id)}
                            className={`w-full rounded-card border px-3 py-2 text-left text-sm transition-colors ${
                                u.id === selectedId
                                    ? 'border-primary-500 bg-primary-50 font-medium text-primary-700 dark:bg-primary-500/10 dark:text-primary-400'
                                    : 'border-gray-100 text-gray-600 hover:border-primary-300 dark:border-slate-800 dark:text-slate-300'
                            }`}
                        >
                            {u.name}
                        </button>
                    </li>
                ))}
            </ul>

            <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                    <Switch size="small" checked={withKey} onChange={setWithKey} />
                    {/* 关闭开关时给一个固定 key,等价于「不传 key」:组件被原地复用 */}
                    {'<UserForm key={user.id}>'}(关闭则复用同一实例)
                </label>
                <UserForm key={withKey ? user.id : 'fixed'} user={user} />
                <p className="text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                    玩法:在简介里输入草稿 → 切换用户。开启 key 重置时草稿自动清空(新实例);
                    关闭后草稿残留在下一位用户的表单里 —— 这就是「状态串数据」的 bug 现场。
                </p>
            </div>
        </div>
    );
});

ResetStateDemo.displayName = 'ResetStateDemo';
