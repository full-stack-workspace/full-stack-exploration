/**
 * ============================================================================
 * SiteContextProbe — 复用站点 Theme / User,不新开通道
 * ============================================================================
 *
 * 主题和当前用户已经在 AppProviders 里。通信专题要做的是「识别这是 Context
 * 该管的低频、远距离事实」,而不是再造一份。
 *
 * @module topics/advanced/component-comm/playground/components/SiteContextProbe
 */

import { memo } from 'react';
import { Button } from 'antd';

import { useTheme, useThemeActions } from '../../../../../context/ThemeProvider';
import { MOCK_USERS, useUser, useUserActions } from '../../../../../context/UserProvider';

export const SiteContextProbe = memo(() => {
    const theme = useTheme();
    const { toggleTheme } = useThemeActions();
    const user = useUser();
    const { switchUser } = useUserActions();
    const other = MOCK_USERS.find((candidate) => candidate.id !== user?.id) ?? MOCK_USERS[0];

    return (
        <div className="space-y-3">
            <p className="text-sm text-gray-700 dark:text-slate-300">
                主题 <span className="font-medium text-primary-600">{theme}</span>
                {' · '}
                用户{' '}
                <span className="font-medium text-primary-600">{user ? `${user.name} (${user.role})` : '未登录'}</span>
            </p>
            <div className="flex flex-wrap gap-2">
                <Button size="small" onClick={toggleTheme}>
                    切换主题(顶栏月亮会一起变)
                </Button>
                {user ? (
                    <Button size="small" onClick={() => switchUser(other.id)}>
                        换成 {other.name}
                    </Button>
                ) : null}
            </div>
        </div>
    );
});

SiteContextProbe.displayName = 'SiteContextProbe';
