/**
 * @file UserProvider.test.tsx
 *
 * @description 模拟用户 Context:默认登录、切换账号、退出。
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
    MOCK_USERS,
    UserProvider,
    useUser,
    useUserActions,
} from './UserProvider';

function UserChip() {
    const user = useUser();
    if (!user) {
        return <span data-testid="user">未登录</span>;
    }
    return (
        <span data-testid="user">
            {user.name} · {user.role}
        </span>
    );
}

function UserControls() {
    const { switchUser, signOut, signIn } = useUserActions();
    return (
        <div>
            <button type="button" onClick={() => switchUser(MOCK_USERS[1].id)}>
                切换到第二位
            </button>
            <button type="button" onClick={signOut}>
                退出
            </button>
            <button type="button" onClick={() => signIn(MOCK_USERS[0].id)}>
                登录
            </button>
        </div>
    );
}

describe('UserProvider', () => {
    it('默认登录第一位模拟用户', () => {
        render(
            <UserProvider>
                <UserChip />
            </UserProvider>,
        );

        expect(screen.getByTestId('user')).toHaveTextContent(
            `${MOCK_USERS[0].name} · ${MOCK_USERS[0].role}`,
        );
    });

    it('switchUser 切换到指定账号', async () => {
        const user = userEvent.setup();
        render(
            <UserProvider>
                <UserChip />
                <UserControls />
            </UserProvider>,
        );

        await user.click(screen.getByRole('button', { name: '切换到第二位' }));

        expect(screen.getByTestId('user')).toHaveTextContent(
            `${MOCK_USERS[1].name} · ${MOCK_USERS[1].role}`,
        );
    });

    it('signOut 后显示未登录,signIn 可重新登录', async () => {
        const user = userEvent.setup();
        render(
            <UserProvider>
                <UserChip />
                <UserControls />
            </UserProvider>,
        );

        await user.click(screen.getByRole('button', { name: '退出' }));
        expect(screen.getByTestId('user')).toHaveTextContent('未登录');

        await user.click(screen.getByRole('button', { name: '登录' }));
        expect(screen.getByTestId('user')).toHaveTextContent(MOCK_USERS[0].name);
    });

    it('在 Provider 外使用 useUser 会抛错', () => {
        expect(() => render(<UserChip />)).toThrow(
            'useUser must be used within a UserProvider',
        );
    });
});
