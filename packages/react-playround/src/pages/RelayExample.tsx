import { Suspense } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import type { RelayExampleQuery } from '../__generated__/RelayExampleQuery.graphql';

const RelayExample = () => {
    const data = useLazyLoadQuery<RelayExampleQuery>(
        graphql`
      query RelayExampleQuery {
        users {
          id
          name
          email
        }
        posts {
          id
          title
          content
          author {
            name
            email
          }
          createdAt
        }
      }
    `,
        {},
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Relay 示例页面</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 用户列表 */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-semibold mb-4">用户列表</h2>
                    {data.users && data.users.length > 0 ? (
                        <ul className="space-y-3">
                            {data.users.map((user) => (
                                <li
                                    key={user.id}
                                    className="border-b border-gray-200 pb-3 last:border-0"
                                >
                                    <div className="font-medium">{user.name}</div>
                                    <div className="text-sm text-gray-600">{user.email}</div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">暂无用户数据</p>
                    )}
                </div>

                {/* 文章列表 */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-semibold mb-4">文章列表</h2>
                    {data.posts && data.posts.length > 0 ? (
                        <div className="space-y-4">
                            {data.posts.map((post) => (
                                <div
                                    key={post.id}
                                    className="border-b border-gray-200 pb-4 last:border-0"
                                >
                                    <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                                    <p className="text-gray-700 mb-2">{post.content}</p>
                                    <div className="text-sm text-gray-500">
                                        作者: {post.author.name} ({post.author.email})
                                    </div>
                                    <div className="text-sm text-gray-400 mt-1">
                                        创建时间: {new Date(post.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">暂无文章数据</p>
                    )}
                </div>
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">说明</h3>
                <p className="text-blue-800 text-sm">
                    这是一个使用 Relay 进行 GraphQL 数据查询的示例页面。
                    当前使用的是模拟数据。在实际项目中，你需要：
                </p>
                <ul className="list-disc list-inside text-blue-800 text-sm mt-2 space-y-1">
                    <li>配置真实的 GraphQL 服务器地址</li>
                    <li>在 Environment.ts 中设置正确的网络层</li>
                    <li>运行 <code className="bg-blue-100 px-1 rounded">pnpm relay</code> 编译 GraphQL 查询</li>
                </ul>
            </div>
        </div>
    );
};

// 使用 Suspense 包装组件以处理加载状态
const RelayExampleWithSuspense = () => {
    return (
        <Suspense fallback={
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-gray-600">加载中...</div>
                </div>
            </div>
        }>
            <RelayExample />
        </Suspense>
    );
};

export default RelayExampleWithSuspense;

