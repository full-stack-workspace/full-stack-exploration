/**
 * ============================================================================
 * PermissionDemo.tsx — 权限渲染演示
 * ============================================================================
 *
 * 切换角色(admin / editor / viewer),同一页面按角色渲染不同的
 * 操作按钮与区块。权限判断收敛到一张 PERMISSIONS 表 + Guard 组件,
 * JSX 里不再散落三元。
 *
 * @module topics/basics/jsx-render/components/PermissionDemo
 */

import { memo, useState } from 'react';
import type { ReactNode } from 'react';
import { Button, Segmented } from 'antd';

type Role = 'admin' | 'editor' | 'viewer';

type Action = 'create' | 'edit' | 'publish' | 'delete' | 'viewStats';

/** 权限表:全部判断的唯一事实来源,改权限只动这里 */
const PERMISSIONS: Record<Role, Action[]> = {
    admin: ['create', 'edit', 'publish', 'delete', 'viewStats'],
    editor: ['create', 'edit'],
    viewer: [],
};

/**
 * 判断某角色是否可执行某操作
 *
 * @param role - 当前角色
 * @param action - 目标操作
 * @returns 有权限返回 true
 * @example
 * can('editor', 'delete'); // false
 */
const can = (role: Role, action: Action): boolean => PERMISSIONS[role].includes(action);

interface GuardProps {
    role: Role;
    action: Action;
    /** 无权限时的兜底渲染,默认不渲染任何内容 */
    fallback?: ReactNode;
    children: ReactNode;
}

/**
 * 权限守卫:有权限渲染 children,否则渲染 fallback
 *
 * @example
 * <Guard role={role} action="delete">
 *   <Button danger>删除</Button>
 * </Guard>
 */
const Guard = memo(({ role, action, fallback = null, children }: GuardProps) => {
    return can(role, action) ? <>{children}</> : <>{fallback}</>;
});

Guard.displayName = 'Guard';

const ROLE_LABELS: Record<Role, string> = {
    admin: '管理员',
    editor: '编辑',
    viewer: '访客',
};

export const PermissionDemo = memo(() => {
    const [role, setRole] = useState<Role>('editor');

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <Segmented
                    value={role}
                    onChange={(v) => setRole(v as Role)}
                    options={Object.entries(ROLE_LABELS).map(([value, label]) => ({
                        label,
                        value,
                    }))}
                />
                <span className="text-xs text-gray-400 dark:text-slate-500">
                    当前角色({ROLE_LABELS[role]})可执行:
                    {PERMISSIONS[role].length > 0 ? PERMISSIONS[role].join(' / ') : '仅浏览'}
                </span>
            </div>

            {/* 同一篇文章卡片,按角色渲染出完全不同的操作面 */}
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                <h3 className="text-sm font-medium text-gray-700 dark:text-slate-200">
                    《React 渲染机制深入浅出》
                </h3>
                <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
                    草稿 · 更新于 2 小时前
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                    <Guard role={role} action="create">
                        <Button size="small" type="primary">
                            新建文章
                        </Button>
                    </Guard>
                    <Guard role={role} action="edit">
                        <Button size="small">编辑</Button>
                    </Guard>
                    <Guard role={role} action="publish">
                        <Button size="small">发布</Button>
                    </Guard>
                    <Guard role={role} action="delete">
                        <Button size="small" danger>
                            删除
                        </Button>
                    </Guard>
                    {PERMISSIONS[role].length === 0 && (
                        <span className="text-xs text-gray-400 dark:text-slate-500">
                            访客身份:所有操作按钮都不渲染,而不是置灰
                        </span>
                    )}
                </div>
            </div>

            {/* 整个区块级权限:运营数据仅管理员可见 */}
            <Guard
                role={role}
                action="viewStats"
                fallback={
                    <p className="rounded-lg border border-dashed border-gray-200 p-3 text-center text-xs text-gray-400 dark:border-slate-700 dark:text-slate-500">
                        运营数据面板仅管理员可见(切到「管理员」试试)
                    </p>
                }
            >
                <div className="rounded-lg bg-primary-50 p-4 text-sm text-primary-700 dark:bg-primary-950/50 dark:text-primary-300">
                    运营数据面板:今日阅读 12,386 · 点赞 842 · 分享 129
                </div>
            </Guard>
        </div>
    );
});

PermissionDemo.displayName = 'PermissionDemo';
