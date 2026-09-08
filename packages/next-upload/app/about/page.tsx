/**
 * ============================================================================
 * About 页 — next-upload
 * ============================================================================
 *
 * 技术说明页：协议时序、状态机、目录布局、设计取舍。
 * 内容为静态（Server Component），便于搜索引擎索引。
 *
 * @module app/about/page
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "工作原理",
  description: "next-upload 的协议、状态机与设计取舍说明。",
};

export default function AboutPage() {
  return (
    <article className="prose prose-neutral mx-auto max-w-3xl p-4 dark:prose-invert sm:p-6">
      <h1>工作原理</h1>
      <p className="lead">
        这份说明覆盖上传协议、客户端 8 状态机、服务端目录约定，以及当前实现的设计取舍。
      </p>

      <h2>核心能力</h2>
      <ul>
        <li>浏览器内 Blob.slice 切片 + 并发上传 + 服务端流式合并</li>
        <li>Web Worker 增量 MD5（SparkMD5），主线程不卡</li>
        <li>秒传判定（merged 文件存在）+ 断点续传（按目录扫描已上传 index）</li>
        <li>暂停 / 恢复 / 失败重试（指数退避 1s/2s/4s）</li>
        <li>多文件拖拽 + 任务队列</li>
      </ul>

      <h2>服务端协议</h2>
      <table>
        <thead>
          <tr>
            <th>方法 + 路径</th>
            <th>用途</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>POST /api/upload/check</code></td>
            <td>秒传 / 续传 / 全新三态判定</td>
          </tr>
          <tr>
            <td><code>POST /api/upload/chunk</code></td>
            <td>multipart 上传单分片（原子写）</td>
          </tr>
          <tr>
            <td><code>POST /api/upload/merge</code></td>
            <td>流式合并</td>
          </tr>
          <tr>
            <td><code>GET /api/files/[hash]</code></td>
            <td>流式下载合并产物</td>
          </tr>
        </tbody>
      </table>

      <h2>客户端状态机（8 状态）</h2>
      <pre>
{`hashing → checking ─┬─ instant
                    └─ uploading ⇄ paused
                                    │
                                    ↓
                                  merging → completed
                                    │
                                    └─ failed → (retry) → checking`}
      </pre>

      <h2>目录布局</h2>
      <pre>
{`.uploads/
├── chunks/<fileHash>/<index>.part        # 上传中
├── merged/<fileHash>.bin                 # 合并完成
└── merged/<fileHash>.name                # 原文件名`}
      </pre>

      <h2>已知边界</h2>
      <ul>
        <li>任务列表 <strong>不持久化</strong>——刷新即丢；但服务端 FS 状态保留</li>
        <li>单实例 server，未引入文件锁</li>
        <li>无清理机制（孤儿 chunks 不会自动 GC）</li>
        <li>无鉴权（任何人持 hash 即可下载）</li>
        <li>chunk size 写死 5 MiB（常量里改）；并发数 UI 可调</li>
      </ul>

      <p>完整设计文档：<code>docs/superpowers/specs/2026-06-06-next-upload-design.md</code>。</p>
    </article>
  );
}
