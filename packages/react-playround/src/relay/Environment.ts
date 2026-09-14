import { Environment, Network, RecordSource, Store } from 'relay-runtime';

// 创建一个简单的网络层，用于处理 GraphQL 请求（生产环境使用，导出以避免被当作死代码）
export async function fetchQuery(
  operation: any,
  variables: Record<string, unknown>,
): Promise<any> {
  // 这里使用 GitHub GraphQL API 作为示例
  // 在实际项目中，你应该替换为你的 GraphQL 服务器地址
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 注意：实际使用时，不要在前端硬编码 token，应该从环境变量或配置中获取
      // Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    },
    body: JSON.stringify({
      query: operation.text,
      variables,
    }),
  });

  return await response.json();
}

// 或者使用模拟数据作为示例
async function fetchQueryWithMock(
  operation: any,
  _variables: Record<string, unknown>,
): Promise<any> {
  // 模拟 GraphQL 响应
  // 在实际项目中，这应该连接到你的 GraphQL 服务器
  return new Promise((resolve) => {
    setTimeout(() => {
      // 准备模拟数据
      const mockUsers = [
        { id: '1', name: 'Alice', email: 'alice@example.com', avatar: null },
        { id: '2', name: 'Bob', email: 'bob@example.com', avatar: null },
      ];

      const mockPosts = [
        {
          id: '1',
          title: 'Hello Relay',
          content: 'This is a sample post using Relay',
          author: { id: '1', name: 'Alice', email: 'alice@example.com' },
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'GraphQL with Relay',
          content: 'Learning how to use Relay with GraphQL',
          author: { id: '2', name: 'Bob', email: 'bob@example.com' },
          createdAt: new Date().toISOString(),
        },
      ];

      // 根据查询内容返回相应的数据
      const response: any = { data: {} };

      if (operation.text.includes('users')) {
        response.data.users = mockUsers;
      }

      if (operation.text.includes('posts')) {
        response.data.posts = mockPosts;
      }

      resolve(response);
    }, 300);
  });
}

// 创建 Relay 环境
export const environment = new Environment({
  network: Network.create(fetchQueryWithMock),
  store: new Store(new RecordSource()),
});

