# Relay 配置和使用说明

## 安装依赖

首先，运行以下命令安装所有依赖（包括 Babel 插件）：

```bash
pnpm install
```

**重要**：确保 `babel-plugin-relay` 已安装。如果安装后仍然出现错误，请手动安装：

```bash
pnpm add -D babel-plugin-relay
```

## 配置说明

### 1. Relay Compiler 配置

项目已配置 `relay.config.json`，配置了以下内容：
- `src`: GraphQL 查询和 fragments 的源目录
- `schema`: GraphQL schema 文件路径
- `language`: 使用 TypeScript
- `artifactDirectory`: 生成文件的输出目录

### 2. Relay Environment

Relay Environment 配置文件位于 `src/relay/Environment.ts`。

当前使用的是模拟数据，用于演示目的。在实际项目中，你需要：

1. 修改 `fetchQueryWithMock` 函数，连接到你的 GraphQL 服务器
2. 或者使用 `fetchQuery` 函数并配置正确的 API 端点

### 3. GraphQL Schema

示例 schema 文件位于 `src/schema.graphql`。在实际项目中，你应该：

1. 从你的 GraphQL 服务器获取真实的 schema
2. 运行 `get-graphql-schema` 工具从服务器下载 schema

## 使用步骤

### 1. 运行 Relay Compiler

在开发过程中，每次修改 GraphQL 查询后，都需要运行 Relay Compiler：

```bash
pnpm relay
```

或者，你可以使用 watch 模式（需要安装 `--watch` 参数支持）：

```bash
pnpm relay --watch
```

### 2. 访问示例页面

启动开发服务器：

```bash
pnpm dev
```

然后访问 `http://localhost:3000/relay-example` 查看 Relay 示例页面。

## 示例页面功能

Relay 示例页面 (`/relay-example`) 展示了：

1. 使用 `useLazyLoadQuery` hook 查询数据
2. 使用 GraphQL 查询语法
3. 使用 Suspense 处理加载状态
4. 展示用户列表和文章列表

## 下一步

1. 配置真实的 GraphQL 服务器地址
2. 更新 `src/relay/Environment.ts` 中的网络层
3. 从服务器获取真实的 GraphQL schema
4. 创建更多查询和 mutations
5. 添加错误处理

