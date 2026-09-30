/**
 * ============================================================================
 * index.test.tsx — Relay 数据流专题
 * ============================================================================
 *
 * - 冒烟:页头与 5 个 Section 标题渲染
 * - 查询演示:mock 网络返回后用户 / 文章列表渲染(fragment 拼装)
 * - 交互实验:切换查询变量触发新查询(骨架屏 → 结果);不存在的 id 走空态;
 *   切回已查变量时缓存命中(无骨架屏,同步渲染)
 *
 * 说明:vitest 链路(@vitejs/plugin-react)不加载 babel-plugin-relay,
 * graphql tag 在运行时不会被编译,因此这里用 vi.mock 将 graphql tag
 * 映射到 relay-compiler 已生成的真实 artifact(等价于 babel 插件的替换行为)。
 * Environment 复用 src/relay/Environment.ts 的 mock 网络层(300ms 延迟)。
 *
 * @module topics/advanced/relay/index.test
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { RelayEnvironmentProvider } from 'react-relay';

import { environment } from '../../../relay/Environment';
import RelayTopic from './index';

/* =================================================================
 * graphql tag → 编译产物的映射(替代 babel-plugin-relay 的运行时行为)
 * ================================================================ */

vi.mock('react-relay', async (importOriginal) => {
    // react-relay 是 CJS 包,SSR 下 importOriginal 的命名导出可能挂在 default 上
    const imported = await importOriginal<Record<string, unknown> & { default?: Record<string, unknown> }>();
    const actual = { ...imported, ...(imported.default ?? {}) };
    // 静态列出本专题用到的 artifact(变量形式的动态 import 无法被 vite 静态分析)
    const artifacts: Record<string, unknown> = {
        UserDirectoryQuery: (await import('../../../__generated__/UserDirectoryQuery.graphql')).default,
        UserLookupDemoQuery: (await import('../../../__generated__/UserLookupDemoQuery.graphql')).default,
        UserCard_user: (await import('../../../__generated__/UserCard_user.graphql')).default,
        PostCard_post: (await import('../../../__generated__/PostCard_post.graphql')).default,
    };
    return {
        ...actual,
        // 从模板文本中解析出 operation / fragment 名,返回对应编译产物
        graphql: (strings: TemplateStringsArray) => {
            const text = strings.join('');
            const name = /(?:query|mutation|fragment)\s+(\w+)/.exec(text)?.[1] ?? '';
            const artifact = artifacts[name];
            if (!artifact) {
                throw new Error(`测试环境未登记的 graphql artifact:${name}`);
            }
            return artifact;
        },
    };
});

function renderTopic() {
    return render(
        <MemoryRouter>
            <RelayEnvironmentProvider environment={environment}>
                <RelayTopic />
            </RelayEnvironmentProvider>
        </MemoryRouter>,
    );
}

describe('Relay 数据流专题', () => {
    it('渲染页头与全部 Section 标题', () => {
        renderTopic();
        expect(screen.getByRole('heading', { name: 'Relay 数据流' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /fragment 拼装出的用户目录/ })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /变量查询与 store 缓存/ })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /fragment colocation 与数据边界/ })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /为什么需要 Relay 的数据边界/ })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: '工程速查与面试点' })).toBeInTheDocument();
    });

    it('查询演示:mock 网络返回后渲染用户与文章列表', async () => {
        renderTopic();
        // mock 网络层 300ms 延迟:先骨架屏,后数据
        // alice@example.com 同时出现在用户卡片与变量查询结果里,用 findAllByText 断言
        const aliceEmails = await screen.findAllByText('alice@example.com', {}, { timeout: 3000 });
        expect(aliceEmails.length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('bob@example.com').length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('Hello Relay')).toBeInTheDocument();
        expect(screen.getByText('GraphQL with Relay')).toBeInTheDocument();
        expect(screen.queryByTestId('directory-skeleton')).not.toBeInTheDocument();
    });

    it('交互实验:切换查询变量触发新查询,空态与缓存命中行为正确', async () => {
        const user = userEvent.setup();
        renderTopic();
        const panel = screen.getByTestId('relay-user-lookup');

        // 首屏默认查 Alice(首次查询,走网络)
        expect(await within(panel).findByText('alice@example.com', {}, { timeout: 3000 })).toBeInTheDocument();

        // 切到 Bob:先骨架屏,后结果
        await user.click(within(panel).getByRole('button', { name: /查 Bob/ }));
        expect(await within(panel).findByText('bob@example.com', {}, { timeout: 3000 })).toBeInTheDocument();

        // 不存在的 id:schema 允许 user 为 null,走空态文案
        await user.click(within(panel).getByRole('button', { name: /查不存在的用户/ }));
        expect(await within(panel).findByText(/用户不存在/, {}, { timeout: 3000 })).toBeInTheDocument();

        // 切回已查过的 Alice:store 缓存命中,同步渲染、不闪骨架屏
        await user.click(within(panel).getByRole('button', { name: /查 Alice/ }));
        expect(within(panel).getByText('alice@example.com')).toBeInTheDocument();
        expect(within(panel).queryByTestId('lookup-skeleton')).not.toBeInTheDocument();
    });
});
