/**
 * ============================================================================
 * About 页 — next-upload（原理拆解）
 * ============================================================================
 *
 * 布局：左侧粘性目录 + 右侧分层讲解。
 * 讲解顺序与数据流动一致：切片哈希 → 三态判定 → 并发上传 → 流式合并，
 * 随后是客户端状态机、目录布局、已知边界。
 * 每个分层先给结论，再通过 <details> 展开设计动机，渐进呈现。
 *
 * 内容为静态（Server Component），便于搜索引擎索引。
 *
 * @module app/about/page
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "原理拆解",
  description: "next-upload 的上传协议、客户端状态机、目录布局与设计取舍。",
};

/* =================================================================
 * 目录数据（与右侧 section 锚点一一对应）
 * ================================================================ */
const TOC = [
  { id: "hash", index: "01", label: "切片与哈希" },
  { id: "check", index: "02", label: "三态判定" },
  { id: "upload", index: "03", label: "并发与重试" },
  { id: "merge", index: "04", label: "流式合并" },
  { id: "state-machine", index: "05", label: "客户端状态机" },
  { id: "storage", index: "06", label: "目录布局" },
  { id: "boundaries", index: "07", label: "已知边界" },
] as const;

/* =================================================================
 * 内部组件
 * ================================================================ */

interface SectionProps {
  id: string;
  index: string;
  title: string;
  /** 该分层对应的协议端点（可选），以等宽字体呈现 */
  endpoint?: string;
  children: React.ReactNode;
}

/**
 * Section — 原理页的一个分层
 *
 * 结构：等宽序号 + 标题 + （可选）协议端点 + 正文；
 * scroll-mt 为 sticky Header 留出锚点偏移。
 */
function Section({ id, index, title, endpoint, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-24">
      <p className="font-mono text-[11px] tracking-[0.2em] text-data-600 uppercase dark:text-data-400">
        {index}
      </p>
      <h2 className="mt-1.5 text-lg font-semibold tracking-tight">{title}</h2>
      {endpoint && (
        <p className="mt-2 inline-block rounded-md border border-border/70 bg-muted/40 px-2 py-1 font-mono text-xs">
          {endpoint}
        </p>
      )}
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-foreground/85">{children}</div>
    </section>
  );
}

/**
 * Detail — 可展开的设计动机（渐进展示，不抢主叙事）
 */
function Detail({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-lg border border-border/70 px-4 py-3">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium marker:hidden [&::-webkit-details-marker]:hidden">
        {title}
        <span
          aria-hidden="true"
          className="font-mono text-xs text-muted-foreground transition-transform group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="mt-2 text-xs leading-relaxed text-muted-foreground">{children}</div>
    </details>
  );
}

/* =================================================================
 * 页面
 * ================================================================ */

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      {/* 页头 */}
      <header className="max-w-2xl">
        <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
          Protocol & Design
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">原理拆解</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          沿着一次上传的数据流动逐层拆开：浏览器内切片与哈希、三态判定、并发上传、
          服务端流式合并，最后是状态机、目录约定与当前实现的已知边界。
        </p>
      </header>

      <div className="mt-10 grid gap-12 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-16">
        {/* 左侧粘性目录 */}
        <aside className="hidden lg:block">
          <nav aria-label="原理目录" className="sticky top-24">
            <ol className="space-y-1 border-l border-border/70">
              {TOC.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="-ml-px flex items-baseline gap-2.5 border-l-2 border-transparent py-1.5 pl-4 text-sm text-muted-foreground transition-colors hover:border-data-500 hover:text-foreground"
                  >
                    <span className="font-mono text-[11px] text-data-600 dark:text-data-400">
                      {item.index}
                    </span>
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        {/* 右侧分层讲解 */}
        <div className="min-w-0 max-w-3xl space-y-14">
          {/* 01 切片与哈希 */}
          <Section id="hash" index="01" title="切片与哈希">
            <p>
              文件进入工作台后先被{" "}
              <code className="font-mono text-[13px]">Blob.slice</code> 切成 5 MiB
              的分片——切割是惰性的，只有真正发送的那一片才会进内存。同时，SparkMD5 在 Web
              Worker 里按 2 MiB 的切片增量计算整文件 MD5，作为后续所有判定的唯一身份。
            </p>
            <Detail title="为什么分片是 5 MiB？">
              太小（如 256 KiB）时 1 GB 文件会切出 4000+ 个 HTTP 请求，握手开销暴涨；
              太大（如 50 MiB）时暂停 / 重试粒度太粗，单次失败重传太贵。
              5 MiB 是 Cloudflare / S3 multipart 体系里最常用的挡位。常量在{" "}
              <code className="font-mono">lib/upload/constants.ts</code>，每个值都附了理由。
            </Detail>
            <Detail title="Hash 为什么另用 2 MiB 的切片？">
              Hash 切片只影响内存占用与 FileReader 调用次数，与上传协议无关，所以与 5 MiB
              解耦：2 MiB 足够大（1 GB 文件只读 512 次），又足够小（Worker 内不会一次分配过大的
              ArrayBuffer）。
            </Detail>
          </Section>

          {/* 02 三态判定 */}
          <Section id="check" index="02" title="三态判定" endpoint="POST /api/upload/check">
            <p>
              哈希算完后，客户端拿着 MD5 问服务端「这个文件你还要多少」。服务端不查数据库，
              直接看文件系统，给出三种结论之一：
            </p>
            <div className="overflow-x-auto rounded-lg border border-border/70">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/70 bg-muted/40">
                    <th className="px-3 py-2 font-medium">结论</th>
                    <th className="px-3 py-2 font-medium">判定条件</th>
                    <th className="px-3 py-2 font-medium">客户端行为</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  <tr>
                    <td className="px-3 py-2 font-medium text-emerald-600 dark:text-emerald-400">秒传</td>
                    <td className="px-3 py-2 font-mono">merged/&lt;hash&gt;.bin 已存在</td>
                    <td className="px-3 py-2 text-muted-foreground">直接完成，返回下载链接</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-data-600 dark:text-data-400">续传</td>
                    <td className="px-3 py-2 font-mono">chunks/&lt;hash&gt;/ 下有分片</td>
                    <td className="px-3 py-2 text-muted-foreground">跳过已上传 index，只传缺口</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium">全新</td>
                    <td className="px-3 py-2 font-mono">两者都不存在</td>
                    <td className="px-3 py-2 text-muted-foreground">从 0 号分片开始完整上传</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              也就是说，「上传会话」不是一条数据库记录，而是目录里已经落盘的那些文件——
              暂停、刷新、隔天再传，都走同一条恢复路径。
            </p>
          </Section>

          {/* 03 并发与重试 */}
          <Section id="upload" index="03" title="并发与重试" endpoint="POST /api/upload/chunk">
            <p>
              缺口分片进入并发池：调度器启动时读取一次并发数快照，维持 N 个在途请求，
              每完成一片立刻补下一片。单个分片以 multipart 提交，服务端先写临时文件再
              rename 成 <code className="font-mono text-[13px]">&lt;index&gt;.part</code>
              ——目录里出现的分片一定是完整的。
            </p>
            <p>
              单片失败按 1s → 2s → 4s 指数退避重试，最多 3 次；7
              秒内仍连不通就判定整个任务失败，把决定权交还给用户。
            </p>
            <Detail title="为什么默认并发是 4？">
              浏览器对同一来源的连接上限通常是 6（Chrome / Firefox / Safari 一致）。留 2
              个槽位给页面自身的其他请求（API 探活、下载预览等），所以默认 4，滑杆允许在
              1–8 之间调整。调整对新任务立即生效；进行中的槽位不变，恢复 / 重试时按新值调度。
            </Detail>
          </Section>

          {/* 04 流式合并 */}
          <Section id="merge" index="04" title="流式合并" endpoint="POST /api/upload/merge">
            <p>
              所有分片到齐后，服务端按 index 顺序把{" "}
              <code className="font-mono text-[13px]">.part</code> 文件以流的方式拼接进{" "}
              <code className="font-mono text-[13px]">merged/&lt;hash&gt;.bin</code>
              ——读一段写一段，内存占用与文件大小无关。原文件名单独存在{" "}
              <code className="font-mono text-[13px]">&lt;hash&gt;.name</code> 里。
            </p>
            <p>
              下载走 <code className="font-mono text-[13px]">GET /api/files/[hash]</code>
              ，同样是流式响应，支持大文件边下边播。
            </p>
          </Section>

          {/* 05 客户端状态机 */}
          <Section id="state-machine" index="05" title="客户端状态机">
            <p>
              每个任务在客户端是一台 8 状态机，由 Zustand 持有；暂停本质上是
              AbortController 中断在途请求，恢复则换一个新控制器从 check 重新进入管道：
            </p>
            <pre className="overflow-x-auto rounded-lg border border-border/70 bg-muted/40 p-4 font-mono text-xs leading-relaxed">
{`hashing → checking ─┬─ instant
                    └─ uploading ⇄ paused
                                    │
                                    ↓
                                  merging → completed
                                    │
                                    └─ failed → (retry) → checking`}
            </pre>
            <p className="text-xs text-muted-foreground">
              instant 与 completed 都视为完成态；failed 会保留错误信息，重试从 check 重新开始，
              因此天然享受续传。
            </p>
          </Section>

          {/* 06 目录布局 */}
          <Section id="storage" index="06" title="目录布局">
            <p>服务端没有 manifest、没有数据库，文件系统布局本身就是上传会话状态：</p>
            <pre className="overflow-x-auto rounded-lg border border-border/70 bg-muted/40 p-4 font-mono text-xs leading-relaxed">
{`.uploads/
├── chunks/<fileHash>/<index>.part        # 上传中
├── merged/<fileHash>.bin                 # 合并完成
└── merged/<fileHash>.name                # 原文件名`}
            </pre>
          </Section>

          {/* 07 已知边界 */}
          <Section id="boundaries" index="07" title="已知边界">
            <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
              <li>
                任务列表<strong className="text-foreground">不持久化</strong>
                ——刷新即丢；但服务端文件系统状态保留
              </li>
              <li>单实例 server，未引入文件锁</li>
              <li>无清理机制（孤儿 chunks 不会自动 GC）</li>
              <li>无鉴权（任何人持 hash 即可下载）</li>
              <li>
                chunk size 写死 5 MiB（
                <code className="font-mono text-[13px]">lib/upload/constants.ts</code>
                里改）；并发数 UI 可调
              </li>
            </ul>
            <p className="text-xs text-muted-foreground">
              完整设计文档：
              <code className="font-mono">docs/superpowers/specs/2026-06-06-next-upload-design.md</code>
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
