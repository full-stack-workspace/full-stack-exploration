# next-upload — 大文件分片上传 Demo

> Next.js 16 + Tailwind CSS 4 + shadcn/ui + Zustand + SparkMD5(Web Worker)
> Port: **3001**

完整设计：[`docs/superpowers/specs/2026-06-06-next-upload-design.md`](../../docs/superpowers/specs/2026-06-06-next-upload-design.md)

## 快速开始

```bash
# 从仓库根目录
pnpm install
pnpm dev:upload         # → http://localhost:3001
```

## 核心能力

- **e2e 分片上传**：浏览器 Blob.slice → 并发上传 → 服务端流式合并
- **秒传 / 续传**：整文件 MD5（Web Worker 增量算）+ 服务端按目录扫描已上传 index
- **暂停 / 恢复 / 重试**：AbortController 全链路；指数退避 1s/2s/4s
- **多文件队列**：拖拽 / 点选；状态机 8 状态
- **流式下载**：合并产物通过 Route Handler 流式响应（不放 `public/`）

## 服务端协议

| 方法 + 路径 | 用途 |
|---|---|
| `POST /api/upload/check` | 秒传 / 续传 / 全新三态判定 |
| `POST /api/upload/chunk` | multipart 上传单分片（原子写） |
| `POST /api/upload/merge` | 流式合并 |
| `GET  /api/files/[hash]` | 流式下载合并产物 |

详见 spec §5。

## 目录布局

```
packages/next-upload/
├── app/                            # Next.js App Router
├── components/                     # React 组件（含 shadcn ui/）
├── data/uploads.ts                 # 服务端 FS 数据访问层
├── lib/upload/                     # 客户端业务逻辑
├── types/upload.ts                 # 共享类型 + 协议 DTO
├── workers/hash.worker.ts          # SparkMD5 Web Worker
└── scripts/make-fixture.mjs        # 生成测试用大文件
```

服务端运行时数据：`packages/next-upload/.uploads/`（已加 .gitignore）。

## 手动验证 V1–V10

详细场景见 spec §9。这里给出最常用 5 条：

```bash
# 生成测试文件
node scripts/make-fixture.mjs 22      # 22 MiB
node scripts/make-fixture.mjs 100     # 100 MiB

# V1: 小文件
# 拖一个 8 KiB 文件 → 应瞬完
echo "tiny" > /tmp/tiny.txt   # 然后浏览器拖 /tmp/tiny.txt

# V2: 多分片
# 拖 fixture/22MB.bin → DevTools Network 看 4 并发

# V3: 秒传
# V2 完成后再次拖 fixture/22MB.bin → 应直接进 instant 状态

# V4: 续传
# 拖 fixture/100MB.bin，传到 ~50% 时刷新页面，再拖同一文件 → 应跳过已传分片

# V5: 暂停/恢复
# 拖 fixture/100MB.bin → 点暂停 → 5s 后恢复
```

## 已知边界

1. 任务列表不持久化（刷新即丢；服务端 FS 状态保留）
2. 单实例 server，未引入文件锁
3. 无清理机制（孤儿 chunks 不会自动 GC）
4. 无鉴权（任何人持 hash 即可下载）
5. chunk size 写死 4 MiB（受 Vercel Functions 请求体 4.5 MB 硬上限约束）；并发数 UI 可调（1–8）
6. hash worker 单实例，多文件 hash 串行排队

## Dev / 自动化测试用环境变量

`packages/next-upload/app/api/upload/chunk/route.ts` 读这两个环境变量。生产部署不设即零开销。

| 环境变量 | 说明 |
|---|---|
| `NEXT_UPLOAD_DEV_THROTTLE_MS=N` | 每个分片落盘前 sleep N 毫秒，模拟慢网络。用于在 localhost 上能稳定演示 pause/resume 与续传场景（默认网络太快上传几秒就结束，没法在中间触发 UI 动作）。 |
| `NEXT_UPLOAD_DEV_FAIL_INDEX=3,7` | 指定的 chunk index 在 server 永远返回 500，触发指数退避重试（1s→2s→4s）+ MAX_RETRY 耗尽后整任务转 failed。用于演示 V6 重试逻辑。 |

dev 模式下 `useUploadStore` 和 `runTask` 也会挂到 `window.__uploadStore` / `window.__runTask`，方便 DevTools / Playwright 直接驱动状态机做自动化验证。生产构建（NODE_ENV=production）不暴露。

示例：模拟慢网络 + chunk 3 永远失败：

```bash
NEXT_UPLOAD_DEV_THROTTLE_MS=500 NEXT_UPLOAD_DEV_FAIL_INDEX=3 pnpm dev:upload
```

## 脚本

| 脚本 | 用途 |
|---|---|
| `pnpm dev` | dev server 起在 :3001 |
| `pnpm build` | 生产构建 |
| `pnpm start` | 起生产构建 |
| `pnpm lint` / `pnpm fix` | ESLint |
| `pnpm type-check` | tsc --noEmit |
