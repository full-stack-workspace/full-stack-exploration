/**
 * ============================================================================
 * UserProvider — 模拟用户 Context
 * ============================================================================
 *
 * 站点级「当前用户」通道:Header 展示身份,专题页可切换/退出,
 * 用来演示跨很远的组件共享同一份会话数据,而不用层层 props。
 *
 * 功能特点:
 * - 内置两位模拟用户,默认登录第一位
 * - state / actions 拆 Context,改用户时未订阅 state 的组件不重渲染
 *
 * @module context/UserProvider
 */

import { createContext, use, useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export interface MockUser {
    id: string;
    name: string;
    role: string;
    email: string;
}

/** 演示用账号,不接真实登录 */
export const MOCK_USERS: MockUser[] = [
    { id: 'u-lin', name: '林晓', role: '学习者', email: 'linxiao@playground.dev' },
    { id: 'u-chen', name: '陈默', role: '导师', email: 'chenmo@playground.dev' },
];

interface UserActions {
    switchUser: (id: string) => void;
    signIn: (id: string) => void;
    signOut: () => void;
}

const UserStateContext = createContext<MockUser | null | undefined>(undefined);
const UserActionsContext = createContext<UserActions | null>(null);

function findUser(id: string): MockUser | undefined {
    return MOCK_USERS.find((user) => user.id === id);
}

/**
 * 读取当前用户;未登录时为 null。必须包在 UserProvider 内。
 */
export function useUser(): MockUser | null {
    const user = use(UserStateContext);
    if (user === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return user;
}

/**
 * 读取用户操作(切换 / 登录 / 退出)。
 */
export function useUserActions(): UserActions {
    const actions = use(UserActionsContext);
    if (actions === null) {
        throw new Error('useUserActions must be used within a UserProvider');
    }
    return actions;
}

interface UserProviderProps {
    children: ReactNode;
}

/**
 * @example
 * <UserProvider>
 *   <HeaderUser />
 * </UserProvider>
 */
export function UserProvider({ children }: UserProviderProps) {
    const [user, setUser] = useState<MockUser | null>(MOCK_USERS[0]);

    const switchUser = useCallback((id: string) => {
        const next = findUser(id);
        if (next) {
            setUser(next);
        }
    }, []);

    const signIn = useCallback((id: string) => {
        const next = findUser(id);
        if (next) {
            setUser(next);
        }
    }, []);

    const signOut = useCallback(() => {
        setUser(null);
    }, []);

    const actions = useMemo<UserActions>(
        () => ({ switchUser, signIn, signOut }),
        [switchUser, signIn, signOut],
    );

    return (
        <UserStateContext value={user}>
            <UserActionsContext value={actions}>{children}</UserActionsContext>
        </UserStateContext>
    );
}
