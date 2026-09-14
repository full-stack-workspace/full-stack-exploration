import type { ReactNode } from 'react';

export interface NavItem {
    key: string;
    label: ReactNode | string;
    icon?: string;
    children?: NavItem[];
}

enum NavPathKey {
    Home = '/',
    Fragment = '/fragment',
    Event = '/event',
    Hooks = '/hooks',
    useState = '/hooks/useState',
    useEffect = '/hooks/useEffect',
    ShoppingCart = '/shopping-cart',
    RelayExample = '/relay-example',
    Todo = '/todo',
    Bookkeeping = '/bookkeeping',
};

export const mainNavItems: NavItem[] = [
    {
        key: NavPathKey.Home,
        label: (
            <a href="/">基础知识</a>
        ),

    },
    {
        key: NavPathKey.Hooks,
        label: (
            <a href="/hooks">Hooks</a>
        ),
    },
    {
        key: NavPathKey.ShoppingCart,
        label: (
            <a href="/shopping-cart">Shopping Cart</a>
        ),
    },
    {
        key: NavPathKey.RelayExample,
        label: (
            <a href="/relay-example">Relay Example</a>
        ),
    },
    {
        key: NavPathKey.Todo,
        label: (
            <a href="/todo">待办事项清单</a>
        ),
    },
    {
        key: NavPathKey.Bookkeeping,
        label: (
            <a href="/bookkeeping">记账本</a>
        ),
    },
];

export const sideNavItems: Record<string, NavItem[]> = {
    [NavPathKey.Home]: [
        { key: NavPathKey.Fragment, label: 'Fragment' },
        { key: NavPathKey.Event, label: '事件与合成事件' }
    ],
    [NavPathKey.Hooks]: [
        { key: NavPathKey.useState, label: 'useState' },
        { key: NavPathKey.useEffect, label: 'useEffect' },
    ],
};
