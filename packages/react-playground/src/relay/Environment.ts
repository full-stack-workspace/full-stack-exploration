/**
 * ============================================================================
 * Environment.ts — Relay 网络层与运行时环境
 * ============================================================================
 *
 * 本站的 Relay 单一数据源:网络层(fetch 函数)+ 归一化缓存 Store,
 * 组装成 Environment 后在 src/index.tsx 通过 RelayEnvironmentProvider 注入。
 *
 * 功能特点:
 * - fetchQuery:生产示例(直连 GitHub GraphQL API),演示真实网络层写法
 * - fetchQueryWithMock:本站实际使用的 mock 网络层,按查询文本路由到内存数据,
 *   支持 users / posts 列表查询与 user(id:) 单用户变量查询
 * - environment:全局单例,Store 默认保留查询结果,支撑「缓存命中不再请求」的演示
 *
 * @module relay/Environment
 */

import { Environment, Network, RecordSource, Store } from 'relay-runtime';
import type { GraphQLResponse, RequestParameters, Variables } from 'relay-runtime';

/**
 * 生产环境网络层示例(导出以避免被当作死代码)。
 * 这里使用 GitHub GraphQL API 作为示例,实际项目中应替换为你的 GraphQL 服务器地址。
 *
 * @param operation - relay-compiler 生成的请求参数(text 为可下发的查询文本)
 * @param variables - 查询变量
 * @returns GraphQL 响应
 */
export async function fetchQuery(
  operation: RequestParameters,
  variables: Variables,
): Promise<GraphQLResponse> {
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 注意:实际使用时,不要在前端硬编码 token,应该从环境变量或配置中获取
      // Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    },
    body: JSON.stringify({
      query: operation.text,
      variables,
    }),
  });

  return (await response.json()) as GraphQLResponse;
}

/* =================================================================
 * Mock 网络层:按查询文本路由到内存数据(本站实际使用)
 * ================================================================ */

// id 全局唯一:Relay 的归一化 store 以 type+id 为键,
// User 与 Post 若共用 id 会互相覆盖字段(编译期不拦,运行时告警)
const MOCK_USERS = [
  { id: '1', name: 'Alice', email: 'alice@example.com', avatar: null },
  { id: '2', name: 'Bob', email: 'bob@example.com', avatar: null },
];

const MOCK_POSTS = [
  {
    id: 'post-1',
    title: 'Hello Relay',
    content: 'This is a sample post using Relay',
    author: { id: '1', name: 'Alice', email: 'alice@example.com' },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'post-2',
    title: 'GraphQL with Relay',
    content: 'Learning how to use Relay with GraphQL',
    author: { id: '2', name: 'Bob', email: 'bob@example.com' },
    createdAt: new Date().toISOString(),
  },
];

/**
 * 模拟 GraphQL 响应:300ms 延迟模拟网络往返,
 * 按查询文本中包含的字段名决定返回哪些数据。
 * 在实际项目中,这个函数应该连接到你的 GraphQL 服务器。
 *
 * @param operation - 请求参数;持久化查询下 text 可能为 null,需兜底
 * @param variables - 查询变量;user(id:) 查询从这里取 id
 * @returns 符合 GraphQLResponse 形状的模拟响应
 */
async function fetchQueryWithMock(
  operation: RequestParameters,
  variables: Variables,
): Promise<GraphQLResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const text = operation.text ?? '';
      const data: Record<string, unknown> = {};

      // 列表查询:根据查询文本路由
      if (text.includes('users')) {
        data.users = MOCK_USERS;
      }

      if (text.includes('posts')) {
        data.posts = MOCK_POSTS;
      }

      // 单用户变量查询:user(id: $id);未命中返回 null(schema 允许)
      if (text.includes('user(')) {
        data.user = MOCK_USERS.find((user) => user.id === variables.id) ?? null;
      }

      resolve({ data });
    }, 300);
  });
}

// 创建 Relay 环境:mock 网络层 + 归一化 Store(默认保留查询结果,支撑缓存演示)
export const environment = new Environment({
  network: Network.create(fetchQueryWithMock),
  store: new Store(new RecordSource()),
});
