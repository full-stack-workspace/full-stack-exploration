# next-upload — 大文件分片上传 Demo 设计文档

**日期**: 2026-06-06
**状态**: 设计完成 · 待实施
**目标包**: `packages/next-upload/`

---

## 0. TL;DR

为 monorepo 新增第 5 个 package —— **`next-upload`**，演示大文件分片上传的**前后端 e2e 闭环**。

**技术栈一句话**：Next.js 16 单包全栈 + React 19 + Tailwind v4 + shadcn/ui（12 组件）+ Zustand + SparkMD5 (Web Worker)。

**MVP 含 5 类能力**：
1. 默认闭环（切片 + 并发 + 服务端合并 + 整体进度）
2. 整文件 hash + 秒传 + 断点续传
3. 暂停 / 恢复 UI
4. 分片失败自动重试（指数退避）
5. 多文件拖拽 + 任务队列

**服务端状态模型**：路线 A · **文件系统作状态**（无 manifest，无锁，零元数据）。

---

## 1. 背景 与 包定位

### 1.1 monorepo 现状

现有 4 个 package：

| Package | 探索方向 | Port |
|---|---|---|
| `vite-basic` | Vue 3 + Vite 基础 | 5173 |
| `vite-server` | React + Vite Dev Server + shadcn/ui | 5174 |
| `vite-build` | React + Vite 构建优化 + AntD + Zustand | 5175 |
| `next-demo` | Next.js 16 App Router + Server Components | 3000 |

四个 package 互不依赖；以构建工具 / 框架划分。

### 1.2 与 `next-demo` 的差异化

`next-demo` 探索 **App Router + Server Components + ISR + Metadata** —— 典型"页面型应用"。`next-upload` **不重复**这条路，转去探索另外四个 Next.js 维度：

1. **Route Handlers 处理 `multipart/form-data`** —— 流式接收、原子写、流式响应
2. **Web Worker** —— 主线程不卡 hash
3. **Zustand 全局上传管理器** —— 跨路由保留任务状态
4. **AbortController 全链路串接** —— 暂停 / 取消语义干净

### 1.3 AI Coding 探索点

- **复杂客户端状态机的代码组织**：7 状态、4 用户动作、若干内部 dispatch
- **协议设计**：在零元数据约束下，让 FS 布局自然承载"秒传/续传/合并"全语义
- **Next.js 16 + Tailwind v4 + shadcn/ui 当下版本组合的集成姿势**

---

## 2. 决策摘要

整个 brainstorming 一共拍板 6 项决策，列于此处便于实施时回查：

| # | 决策点 | 选定 |
|---|---|---|
| D1 | 演示焦点 | 前后端 e2e 闭环 |
| D2 | 技术骨架 | Next.js 16 单包全栈 |
| D3 | MVP 特性 | hash + 秒传 + 续传 / 暂停恢复 UI / 自动重试 / 多文件队列 **(全选)** |
| D4 | 客户端状态库 | Zustand 全局 store |
| D5 | 服务端状态模型 | 路线 A · 文件系统作状态（无 manifest） |
| D6 | UI 组件库 | shadcn/ui 全量 12 组件 |

---

## 3. 技术栈 与 依赖

### 3.1 依赖清单

| 依赖 | 用途 | 备注 |
|---|---|---|
| `next` 16.x · `react` 19.x · `react-dom` 19.x | 框架基线 | 与 next-demo 对齐 |
| `tailwindcss` 4 · `@tailwindcss/postcss` | 样式 | 与 next-demo 对齐，沿用 `@theme` |
| `clsx` · `tailwind-merge` | `cn()` 工具 | 与 next-demo 对齐 |
| `zustand` ^5 | 上传管理器全局 store | 新引入 |
| `spark-md5` ^3 | 增量 hash（>100MB 不爆内存） | 新引入；比 Web Crypto SHA-256 在大文件上快约 5× |
| `nanoid` ^5 | 任务 ID（与文件 hash 区分） | 新引入；很轻 |
| `class-variance-authority` ^0.7 | shadcn 组件变体管理 | shadcn 必需 |
| `lucide-react` ^0.5x | 图标 | shadcn 推荐 |
| `tw-animate-css` ^1 | Tailwind v4 时代的动画 utility | **不要**装 `tailwindcss-animate`（绑死 v3） |
| `@radix-ui/react-*` | 按所选组件按需安装 | shadcn CLI 自动添加 |
| `sonner` ^1 | Toast 通知 | shadcn 推荐方案 |
| `eslint` · `eslint-config-next` · `typescript` | 工程化 | 与 next-demo 对齐 |

### 3.2 shadcn 组件清单（12 个，全量纳入）

**必装（6）**：`button`、`card`、`progress`、`badge`、`alert-dialog`、`sonner`
**强烈推荐（4）**：`tabs`、`dropdown-menu`、`tooltip`、`slider`
**可选（2）**：`input`、`separator`

### 3.3 不引入的依赖

| 依赖 | 不引入理由 |
|---|---|
| `react-dropzone` | 用原生 `dragover/drop` 事件，符合"暴露原理"精神 |
| `proper-lockfile` | 路线 A 无 manifest，不需要文件锁 |
| `swr` | 本 demo 无 GET 数据拉取场景 |
| `next-themes` | 复用 next-demo 手写的 `ThemeProvider` Context |
| `tailwindcss-animate` | Tailwind v3 时代产物；v4 用 `tw-animate-css` |

### 3.4 shadcn × Tailwind v4 集成要点

- 必须用 `shadcn@latest` CLI（≥ 2.4），早期版本不识别 Tailwind v4 的 `@theme`
- `globals.css` 里复用 `next-demo` 已写好的 `@custom-variant dark (&:where(.dark, .dark *));` —— 这正是 shadcn 在 v4 下官方推荐的暗色变体写法
- shadcn 的 `:root { --background ... }` + `.dark { ... }` CSS 变量与我们的 `@theme { --color-primary-* }` 共存，分别服务 shadcn 组件 vs Tailwind utility，不冲突

---

## 4. 目录架构

### 4.1 包内结构

```
packages/next-upload/
├── app/
│   ├── layout.tsx                       # ThemeProvider + Toaster + Header
│   ├── page.tsx                         # 主页：拖拽区 + 任务列表
│   ├── about/page.tsx                   # 技术说明页（讲协议、状态机、目录）
│   ├── globals.css                      # Tailwind v4 @theme + shadcn vars + @custom-variant dark
│   └── api/
│       ├── upload/
│       │   ├── check/route.ts           # 秒传 / 续传查询
│       │   ├── chunk/route.ts           # 单分片落盘
│       │   └── merge/route.ts           # 合并产物
│       └── files/[hash]/route.ts        # 下载已合并文件（流式 GET）
├── components/
│   ├── ui/                              # shadcn 12 个组件
│   ├── ThemeProvider.tsx                # 复用 next-demo 同款手写 Context
│   ├── Header.tsx                       # 含主题切换 + 活跃任务数 badge
│   ├── UploadDropzone.tsx               # 原生 dragover/drop + <input type="file" multiple>
│   ├── TaskList.tsx                     # Tabs: All / 上传中 / 已完成 / 失败
│   ├── TaskCard.tsx                     # 单任务：进度条 + 状态 badge + 操作菜单
│   └── ConcurrencyControl.tsx           # Slider (1–8)
├── data/
│   └── uploads.ts                       # 服务端 FS 数据访问层（纯函数）
├── lib/
│   ├── utils.ts                         # cn()
│   └── upload/
│       ├── store.ts                     # Zustand store
│       ├── pipeline.ts                  # per-task 调度器
│       ├── hash-worker-client.ts        # Worker 包装
│       ├── api.ts                       # 三端点 fetch 封装
│       ├── status-style.ts              # 状态 → shadcn variant / class 映射
│       └── constants.ts                 # CHUNK_SIZE / MAX_RETRY 等
├── types/
│   └── upload.ts                        # 协议 DTO + 客户端状态机类型
├── workers/
│   └── hash.worker.ts                   # SparkMD5 增量 hash
├── scripts/
│   └── make-fixture.mjs                 # 生成测试用大文件
├── components.json                      # shadcn 配置
├── next.config.ts
├── package.json / tsconfig.json / postcss.config.mjs / eslint.config.mjs
└── README.md
```

### 4.2 服务端存储布局

`.uploads/` 在**仓库根**（不在 `public/`，避免被 Next 静态资源缓存污染、被打包到 build 产物）。`.gitignore` 加 `.uploads/`。

```
.uploads/
├── chunks/<fileHash>/<index>.part        # 上传中的分片（原子写：先 .part.tmp → rename）
├── merged/<fileHash>.bin                 # 合并完成的产物
└── merged/<fileHash>.name                # 原文件名（文本文件，下载时拼 Content-Disposition）
```

**fileHash** = SparkMD5 算出的整文件 MD5。所有协议都以它索引。原文件名旁路存为 `.name` 文本文件 —— 这是路线 A "无 manifest" 约束下的必要妥协。

---

## 5. 服务端协议

### 5.1 4 个 Route Handlers 总览

| 方法 + 路径 | 用途 |
|---|---|
| `POST /api/upload/check` | 秒传 / 续传 / 全新 三态判定 |
| `POST /api/upload/chunk` | 单个分片落盘（multipart） |
| `POST /api/upload/merge` | 合并所有分片 |
| `GET  /api/files/[hash]` | 流式下载合并产物 |

### 5.2 `POST /api/upload/check`

**请求**（JSON）:
```json
{ "fileHash": "a3f5...", "fileName": "video.mp4", "fileSize": 1289123456, "chunkSize": 5242880, "totalChunks": 246 }
```

**响应**（三态）:
```jsonc
{ "status": "completed", "url": "/api/files/a3f5..." }     // 秒传命中
{ "status": "partial", "uploaded": [0, 1, 2, 5, 6] }       // 续传
{ "status": "new" }                                        // 全新
```

**服务端逻辑**：先看 `merged/<hash>.bin` 是否存在 → 否则 `readdir(chunks/<hash>)` 解析出已上传 index 数组 → 否则返回 `new`。

### 5.3 `POST /api/upload/chunk`

**请求**：`multipart/form-data`
- `fileHash` (text)
- `index` (text, number)
- `chunk` (file Blob)

**响应**：`{ "ok": true, "index": <number> }`

**服务端逻辑**：`mkdir -p chunks/<hash>` → **原子写**：先写 `<index>.part.tmp` 再 `rename` 成 `<index>.part`。规避中断产生半文件。

### 5.4 `POST /api/upload/merge`

**请求**：`{ "fileHash", "fileName", "totalChunks" }`

**响应**：`{ "ok": true, "url": "/api/files/<hash>", "size": <number>, "mergedAt": <timestamp> }`

**服务端逻辑**：
1. `readdir(chunks/<hash>)` 确认 `0..total-1` 全部到位 —— 缺片则 400 + `{ missing: [...] }`
2. `createWriteStream(merged/<hash>.bin)`
3. 按 index 升序遍历，`createReadStream(<i>.part)` 顺序 pipe
4. 删除整个 `chunks/<hash>/` 目录
5. 返回下载 URL

**幂等性**：若 `merged/<hash>.bin` 已存在，直接返回成功。支持网络断点后客户端重发 merge。

### 5.5 `GET /api/files/[hash]`

**响应**：流式 binary
- `Content-Type: application/octet-stream`
- `Content-Length: <size>`
- `Content-Disposition: attachment; filename="<原文件名>"`（从 `merged/<hash>.name` 读取，见 §4.2）

**服务端逻辑**：`createReadStream(merged/<hash>.bin)` 转 `ReadableStream` 返回，演示 Next.js Route Handlers 的流式响应能力。

### 5.6 协议设计的几个关键决定

1. **fileHash 是唯一键** —— 所有协议都以它索引；前端 Worker 算完再发任何请求
2. **无服务端 manifest** —— 完全由 FS 状态推导（路线 A）
3. **multipart/form-data 传 chunk** —— 比裸 body + header 通用，调试方便
4. **原子写** —— `tmp + rename` 规避半截 part
5. **合并幂等** —— 重复 merge 直接返回成功
6. **下载走 API 而非 public/** —— 体现流式响应，且为未来权限校验留口

---

## 6. 客户端架构

### 6.1 任务状态机

8 状态（`hashing` / `checking` / `uploading` / `merging` / `completed` / `instant` / `paused` / `failed`）、4 用户动作（`pauseTask` / `resumeTask` / `retryTask` / `removeTask`），其余转移均由 pipeline 内部 dispatch。终态 3 个：`completed` / `instant` / `failed`（后者可经 `retryTask` 复活）。

```
       addFiles(File[])
              ↓
       ┌─────────────┐
       │   hashing   │── worker error ──┐
       └─────────────┘                  │
              ↓ hash ok                 │
       ┌─────────────┐                  │
       │  checking   │── api error ─────┤
       └─────────────┘                  │
        │           │                   │
        │ completed │ partial / new     │
        ↓           ↓                   │
   ┌─────────┐  ┌─────────────┐  pause  │
   │ instant │  │  uploading  │ ◄──────►│  ┌─────────┐
   └─────────┘  └─────────────┘  resume │  │ paused  │
                       │                │  └─────────┘
                       │ all uploaded   │
                       ↓                │
                ┌─────────────┐         │
                │   merging   │─────────┤
                └─────────────┘         │
                       │ ok             ↓
                ┌─────────────┐  ┌────────────┐
                │  completed  │  │   failed   │←── retryTask() ──┐
                └─────────────┘  └────────────┘                  │
                                       └──────────────────────────┘ (→ checking)
```

此图必须以注释形式 ASCII 拷贝到 `lib/upload/store.ts` 与 `lib/upload/pipeline.ts` 顶部。

### 6.2 Zustand Store 形状

```ts
type TaskStatus =
  | 'hashing' | 'checking' | 'uploading' | 'merging'
  | 'completed' | 'instant' | 'paused' | 'failed'

interface UploadTask {
  id: string                       // nanoid，UI key
  file: File                       // 运行时持有，刷新即丢
  fileName: string
  fileSize: number
  fileHash: string | null          // hashing 完成前为 null
  chunkSize: number                // 一旦确定不再变
  totalChunks: number
  uploadedIndices: Set<number>     // 已成功落盘
  inflightIndices: Set<number>     // 正在传（UI 显示 "传输中 3/10"）
  status: TaskStatus
  error: string | null
  hashProgress: number             // 0..1
  uploadProgress: number           // = uploadedIndices.size / totalChunks
  createdAt: number                // caller 传入（store 内禁 Date.now）
  completedAt: number | null
  url: string | null               // /api/files/<hash>
  abortController: AbortController // pause / remove 用
}

interface UploadStore {
  tasks: Map<string, UploadTask>
  concurrency: number              // 全局，UI slider 调
  // 用户动作
  addFiles: (files: File[], now: number) => void
  pauseTask: (id: string) => void
  resumeTask: (id: string) => void
  retryTask: (id: string) => void
  removeTask: (id: string) => void
  setConcurrency: (n: number) => void
  // pipeline 内部 dispatch（命名前缀 _ 区分）
  _setHash / _setHashProgress / _markUploaded / _setStatus / _setMergedUrl / ...
}
```

### 6.3 上传管线（`lib/upload/pipeline.ts`）

per-task 调度器，伪代码：

```ts
async function runTask(taskId: string) {
  const task = store.get(taskId)

  // Phase 1: Hash
  setStatus(taskId, 'hashing')
  const hash = await hashWorkerClient.compute(task.file, p => setHashProgress(taskId, p))
  setHash(taskId, hash)

  // Phase 2: Check
  setStatus(taskId, 'checking')
  const check = await api.check({ fileHash, fileName, fileSize, chunkSize, totalChunks }, { signal })
  if (check.status === 'completed') { setStatus('instant'); setMergedUrl(check.url); return }

  // Phase 3: Concurrent upload
  setStatus(taskId, 'uploading')
  const todo = range(totalChunks).filter(i => !check.uploaded?.includes(i))
  await runChunkPool(taskId, todo, store.concurrency, signal)

  // Phase 4: Merge
  setStatus(taskId, 'merging')
  const { url } = await api.merge({ fileHash, fileName, totalChunks }, { signal })
  setMergedUrl(taskId, url)
  setStatus(taskId, 'completed')
}
```

### 6.4 chunk 池调度器

```ts
async function runChunkPool(taskId, todo, concurrency, signal) {
  const queue = [...todo]
  const workers = Array.from({ length: concurrency }, async () => {
    while (queue.length && !signal.aborted) {
      const index = queue.shift()!
      try {
        await uploadWithRetry(taskId, index, signal)
        markUploaded(taskId, index)
      } catch (err) {
        if (err.name === 'AbortError') return  // pause/remove 引发，正常退出
        throw err                              // MAX_RETRY 耗尽 → 整任务失败
      }
    }
  })
  await Promise.all(workers)  // 任一 throw 都会冒泡
}
```

### 6.5 重试策略

```ts
async function uploadWithRetry(taskId, index, signal) {
  for (let attempt = 0; attempt <= MAX_RETRY; attempt++) {
    try {
      return await api.uploadChunk({ fileHash, index, chunk: file.slice(...) }, { signal })
    } catch (err) {
      if (err.name === 'AbortError') throw err              // 不重试
      if (err.status >= 400 && err.status < 500) throw err  // 4xx 不重试
      if (attempt === MAX_RETRY) throw err
      await sleep(RETRY_BASE_MS * 2 ** attempt, signal)     // 1s → 2s → 4s
    }
  }
}
```

**重试规则**：仅在网络错误 / 5xx 上重试，4xx 视为客户端协议错误立即失败。

### 6.6 Web Worker hash

**`workers/hash.worker.ts`**：
- 消息协议（worker → main）：
  ```ts
  | { type: 'progress', value: number }   // 0..1
  | { type: 'done', hash: string }
  | { type: 'error', message: string }
  ```
- 实现：`new FileReader()` 每次 read `HASH_CHUNK_SIZE = 2 MiB` 切片 → `spark.append(arrayBuffer)` → 每 5 次 append 发一次 progress → 读完 `spark.end()` → 发 done

**主线程包装（`lib/upload/hash-worker-client.ts`）**：
- 标 `"use client"`
- Lazy 创建 worker 实例（单实例，多任务串行排队 hash，避免内存竞争）
- `compute(file, onProgress) → Promise<string>`
- 用 `new Worker(new URL('@/workers/hash.worker.ts', import.meta.url))` —— Next.js 16 + Turbopack 原生支持，无需额外打包配置

### 6.7 用户动作语义

| 动作 | 实现 | 说明 |
|---|---|---|
| `pauseTask` | `task.abortController.abort()` → in-flight 抛 AbortError → 调度器退出 → setStatus(paused) | 已上传 chunks 不丢，server 保留 |
| `resumeTask` | 新建 AbortController → 重跑 pipeline 从 Phase 2（check）开始 | check 返回 uploaded 自动跳过已完成片 |
| `retryTask` | 等同 resume，仅入口状态不同（failed → checking） | — |
| `removeTask` | abort + 从 Map 删除 | **MVP 不调** DELETE 清服务端 chunks —— 保留以便后续秒传 |

---

## 7. UI 与 组件

### 7.1 主页骨架

```
┌──────────────────────────────────────────────────────────────┐
│ Header                          [☀/🌙]  [active: 3] [About] │
├──────────────────────────────────────────────────────────────┤
│ ╔══════════════════════════════════════════════════════════╗ │
│ ║        ⬇  拖拽文件到此处，或 [点击选择文件]              ║ │
│ ║              支持多文件 · 单文件无大小限制               ║ │
│ ╚══════════════════════════════════════════════════════════╝ │
│                                                              │
│  并发数: ──●────────  4   (1 — 8)                            │
│                                                              │
│  [全部 5] [上传中 2] [已完成 2] [失败 1]                     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📄 video.mp4              [上传中]            [⋯]      │  │
│  │ 1.2 GB · 245/256 chunks · 4 inflight                   │  │
│  │ ████████████████████░░░░  92%                          │  │
│  │ MD5: a3f5…b21                                          │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📄 report.pdf             [⭐ 秒传命中]       [⋯]      │  │
│  │ 8.4 MB · 完成于 2s   [↓ 下载]                          │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### 7.2 组件 → shadcn 映射

| 组件 | shadcn 元件 |
|---|---|
| Header | `Button` + `Tooltip` + `Badge` |
| UploadDropzone | 原生 div + `Button` |
| ConcurrencyControl | `Slider` + `Label` |
| TaskList | `Tabs` + `TabsContent` |
| TaskCard | `Card` + `Progress` + `Badge` + `DropdownMenu` + `Tooltip` |
| 删除确认 | `AlertDialog` |
| 通知 | `Sonner` (Toast) |

TaskCard 上的 `⋯` 下拉菜单包含：暂停 / 恢复（视状态切换）、重试（仅 failed）、删除任务、复制下载链接（仅 completed/instant）。

### 7.3 状态徽章配色（`lib/upload/status-style.ts` 集中维护）

| status | 文案 | 样式 |
|---|---|---|
| `hashing` | 计算中 | `variant="secondary"`，图标转圈 |
| `checking` | 校验中 | `variant="secondary"` |
| `uploading` | 上传中 | 自定义 `bg-primary-500/15 text-primary-700` |
| `merging` | 合并中 | 自定义紫 |
| `paused` | 已暂停 | 自定义黄 |
| `completed` | 已完成 | `variant="default"` 绿系 |
| `instant` | ⭐ 秒传命中 | 绿系 + 星标 icon |
| `failed` | 失败 | `variant="destructive"` |

### 7.4 主题切换

完整复用 `next-demo/components/ThemeProvider.tsx` 的手写 Context 模式（**禁止**引入 `next-themes`）。Header 的主题切换按钮设 `.dark` class 到 `<html>` 上，shadcn 通过 `.dark:` 变体自动响应。

---

## 8. 代码注释规范（本 package 增量约束）

**所有规则均为硬约束、实施阶段非可选**。

### 8.1 复用 CLAUDE.md 通用约定

- 文件头 JSDoc 块（功能描述 / 功能特点 / `@module`），中文
- 段落分隔 `/* ==== ... ==== */`
- 函数 / 组件 JSDoc 含 `@param` `@returns` `@example`，中文描述
- 行内 `//` 仅解释**为什么**，不复述代码本身

### 8.2 本 package 增量

1. **协议层**（`app/api/upload/*/route.ts`、`data/uploads.ts`、`lib/upload/api.ts`）—— 每个 handler 顶部用大块注释**画出请求 / 响应 JSON 样例**，与本文 §5 一一对应
2. **状态机相关**（`lib/upload/store.ts`、`lib/upload/pipeline.ts`）—— 必须把 §6.1 的 ASCII 状态机图原样拷贝到文件顶部注释
3. **常量** `constants.ts` —— 每个常量都注明"为什么是这个值"（如 `CHUNK_SIZE = 5 MiB → Cloudflare/CloudFront 默认分片上限内最常用挡位`）
4. **Web Worker** `workers/hash.worker.ts` —— 顶部说明完整消息协议
5. **重试逻辑** `pipeline.ts` —— 必须注明：哪些错误重试、哪些不（4xx 不重试、5xx + 网络错误才重试）、退避序列 `1s/2s/4s`

---

## 9. 验收场景（V1–V10）

完成定义。实施阶段必须每条手工跑通。

| # | 场景 | 期望 |
|---|---|---|
| V1 | 拖 8 KiB 小文件（1 分片） | hash 瞬完 → upload → merge → 完成；下载内容字节一致 |
| V2 | 拖 22 MiB 文件（5 分片，并发 4） | DevTools Network 看到 4 路并发；进度条平滑；md5 一致 |
| V3 | V2 完成后再次拖同文件 | check 命中 completed → 直接进 `instant` 状态 |
| V4 | 拖 100 MiB，传到 ~50% 时刷新页面，再次拖同文件 | check 返回 partial → 跳过已上传 → 续传完成 |
| V5 | 拖 100 MiB，传到 ~30% 时点暂停，5s 后恢复 | 暂停后 server 上无半截 `.part.tmp`；恢复后续传完成 |
| V6 | 临时 mock chunk handler 对某些片返回 500 | 单片重试 3 次后续上；永久 500 时 → failed；点重试 → 完成 |
| V7 | 一次拖 3 个不同文件 | 3 任务并行 hash + upload；tabs 计数正确 |
| V8 | 上传中点删除 | in-flight abort，UI 即移除；server `chunks/<hash>/` **保留**（下次拖同文件可续传） |
| V9 | 切换暗色模式 | shadcn 12 组件全部正确响应；`@custom-variant dark` 生效 |
| V10 | 完成后点下载 | 流式响应（Response headers 含 `Content-Length`，大文件下载时 Next 进程内存不爆） |

### 9.1 验证脚手架

不引入测试框架（与仓库现状一致）。

**`packages/next-upload/scripts/make-fixture.mjs`**：
```js
// 用法：node scripts/make-fixture.mjs 100   → 生成 fixture/100MB.bin
// 用 crypto.randomBytes 保证内容随机，避免触发 hash 误碰撞
```

`.gitignore` 加 `fixture/`。

`packages/next-upload/README.md` 末尾写"如何手动跑通 V1–V10"步骤。

---

## 10. 已知边界

写入 `packages/next-upload/README.md` 的 "Known Limitations" 段。

1. 任务列表**不持久化** —— 刷新即丢，但 server FS 状态保留
2. **单实例 server** —— 文件锁未引入；多用户并发上传同 hash 时存在合并竞态（demo 范围可接受）
3. **无清理机制** —— 长期运行 `.uploads/chunks/` 会堆积孤儿；未来扩展点
4. **无鉴权** —— `/api/files/[hash]` 任何人持 hash 即可下载
5. **chunk size 写死 5 MiB** —— 不暴露给 UI 调（常量里改）；并发数 UI 可调
6. **hash worker 单实例** —— 多文件拖入时 hash 串行排队（避免内存竞争），upload 阶段并行

---

## 11. 集成点（根仓库变更）

### 11.1 根 `package.json`

```diff
{
  "scripts": {
+   "dev:upload": "pnpm -C packages/next-upload dev",
+   "build:upload": "pnpm -C packages/next-upload build"
  }
}
```

### 11.2 `packages/next-upload/package.json`

`scripts.dev`: `next dev -p 3001`（避免与 next-demo 的 3000 冲突）

### 11.3 根 `.gitignore`

```diff
+ .uploads/
+ packages/next-upload/fixture/
```

### 11.4 根 `README.md`

Packages 表追加一行：

> `next-upload` · Next.js 16 全栈分片上传：Route Handlers + Web Worker hash + Zustand 状态机 + shadcn/ui 集成 — 验证 AI 在"复杂客户端状态机 + 协议设计"题型下的产出 · Port 3001

"AI Coding 亮点"段落追加一句：

> **next-upload** 演示 Next.js 16 Route Handlers 处理 `multipart/form-data` + Web Worker hash + Zustand 状态机 + shadcn/ui 完整集成。

### 11.5 `pnpm-workspace.yaml`

不动（`packages/*` 自动覆盖）。

---

## 12. 常量（`lib/upload/constants.ts`）

```ts
/**
 * 分片大小：5 MiB
 * 为什么是这个值：Cloudflare / CloudFront / S3 multipart 默认分片上限范围内最常用挡位；
 * 太小则 HTTP 请求数膨胀，太大则暂停粒度太粗。
 */
export const CHUNK_SIZE = 5 * 1024 * 1024

/**
 * 默认并发数：4
 * 为什么是这个值：浏览器同源连接上限通常是 6，留头给页面其他 fetch。
 */
export const DEFAULT_CONCURRENCY = 4

/**
 * 最大重试次数：3
 */
export const MAX_RETRY = 3

/**
 * 重试退避基数：1000ms
 * 实际退避序列：1s → 2s → 4s（指数）
 */
export const RETRY_BASE_MS = 1000

/**
 * Hash 时按 2 MiB 切片 feed 给 SparkMD5
 * 为什么是这个值：足够大以减少 FileReader 调用次数，又足够小以保证主线程响应（worker 内也不希望一次分配过大 ArrayBuffer）。
 */
export const HASH_CHUNK_SIZE = 2 * 1024 * 1024
```

---

## 附录 A — 决策日志

| # | 决策点 | 选定 | 备选 | 选定理由 |
|---|---|---|---|---|
| D1 | 演示焦点 | e2e 闭环 | 生产级 / 纯前端 mock / 云原生 presigned | 平衡——可看见前后端协议，又不过度膨胀 |
| D2 | 技术骨架 | Next.js 16 单包全栈 | Vite + Hono / Vite + Fastify / Nuxt 3 | 全栈在一处部署最快；与 next-demo 探索点不重叠 |
| D3 | MVP 特性 | 全选 | 任选 | 用户希望"小而全"的近生产 demo |
| D4 | 客户端状态库 | Zustand | Jotai / useReducer + Context | 任务队列状态机适合单一全局 store；与 vite-build 形成对照 |
| D5 | 服务端状态模型 | 路线 A · FS 作状态 | Manifest JSON + 文件锁 | 客户端状态机已足够复杂，服务端保持极简以聚焦 |
| D6 | UI 组件库 | shadcn 全量 12 | 必装 6 / 不用 shadcn | UI 形状高度契合 shadcn；vite-server 已有 shadcn 经验 |

---

**Spec 结束。**

下一步：实施阶段进入 writing-plans skill 撰写分步实施计划。
