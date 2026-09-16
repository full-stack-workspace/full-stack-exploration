/**
 * ============================================================================
 * HeaderActions — Header 右侧主题切换与用户芯片
 * ============================================================================
 *
 * 分别订阅 Theme / User 的 state Context,互不牵连:
 * 切主题不会让用户芯片重渲染,切用户也不会让月亮按钮重渲染。
 *
 * @module components/HeaderActions
 */

import { memo } from 'react';
import { Button, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { MoonOutlined, SunOutlined, UserOutlined } from '@ant-design/icons';

import { useTheme, useThemeActions } from '../context/ThemeProvider';
import { MOCK_USERS, useUser, useUserActions } from '../context/UserProvider';

const HeaderThemeToggle = memo(() => {
    const theme = useTheme();
    const { toggleTheme } = useThemeActions();
    const isDark = theme === 'dark';

    return (
        <Button
            type="text"
            aria-label={isDark ? '切换到亮色' : '切换到暗色'}
            onClick={toggleTheme}
            icon={isDark ? <SunOutlined /> : <MoonOutlined />}
        />
    );
});

HeaderThemeToggle.displayName = 'HeaderThemeToggle';

const HeaderUser = memo(() => {
    const user = useUser();
    const { switchUser, signIn, signOut } = useUserActions();

    if (!user) {
        return (
            <Button type="text" onClick={() => signIn(MOCK_USERS[0].id)}>
                模拟登录
            </Button>
        );
    }

    const items: MenuProps['items'] = [
        ...MOCK_USERS.map((candidate) => ({
            key: candidate.id,
            label: `${candidate.name} · ${candidate.role}`,
            disabled: candidate.id === user.id,
        })),
        { type: 'divider' },
        { key: 'sign-out', label: '退出(模拟)', danger: true },
    ];

    const onClick: MenuProps['onClick'] = ({ key }) => {
        if (key === 'sign-out') {
            signOut();
            return;
        }
        switchUser(key);
    };

    return (
        <Dropdown menu={{ items, onClick }} trigger={['click']} placement="bottomRight">
            <button
                type="button"
                className="flex max-w-[12rem] items-center gap-2 rounded-lg px-2 py-1 text-left transition-colors hover:bg-gray-100 dark:hover:bg-slate-800"
                aria-label="当前用户菜单"
            >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700 dark:bg-primary-900 dark:text-primary-200">
                    {user.name.slice(0, 1)}
                </span>
                <span className="hidden min-w-0 sm:block">
                    <span className="block truncate text-sm font-medium text-gray-800 dark:text-slate-100">
                        {user.name}
                    </span>
                    <span className="block truncate text-xs text-gray-400 dark:text-slate-500">
                        {user.role}
                    </span>
                </span>
                <UserOutlined className="hidden text-gray-300 sm:inline dark:text-slate-600" />
            </button>
        </Dropdown>
    );
});

HeaderUser.displayName = 'HeaderUser';

export const HeaderActions = memo(() => {
    return (
        <div className="flex shrink-0 items-center gap-1">
            <HeaderThemeToggle />
            <HeaderUser />
        </div>
    );
});

HeaderActions.displayName = 'HeaderActions';
