/**
 * ============================================================================
 * AppProviders — 站点级 Context 组合
 * ============================================================================
 *
 * 把 Theme / User 与 antd ConfigProvider 叠在一起,让 Header 和专题页
 * 都能读到同一份主题与模拟用户,并由当前 theme 驱动 antd 暗色算法。
 *
 * @module context/AppProviders
 */

import { ConfigProvider, theme as antdTheme } from 'antd';
import type { ReactNode } from 'react';

import { ThemeProvider, useTheme } from './ThemeProvider';
import { UserProvider } from './UserProvider';

const ANTD_TOKEN = {
    colorPrimary: '#4f46e5',
    borderRadius: 8,
} as const;

function ThemedConfigProvider({ children }: { children: ReactNode }) {
    const mode = useTheme();

    return (
        <ConfigProvider
            button={{ autoInsertSpace: false }}
            theme={{
                algorithm:
                    mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
                token: ANTD_TOKEN,
            }}
        >
            {children}
        </ConfigProvider>
    );
}

interface AppProvidersProps {
    children: ReactNode;
}

/**
 * @example
 * <AppProviders>
 *   <Router>
 *     <AppContent />
 *   </Router>
 * </AppProviders>
 */
export function AppProviders({ children }: AppProvidersProps) {
    return (
        <ThemeProvider>
            <UserProvider>
                <ThemedConfigProvider>{children}</ThemedConfigProvider>
            </UserProvider>
        </ThemeProvider>
    );
}
