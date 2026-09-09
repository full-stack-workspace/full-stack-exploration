/**
 * ============================================================================
 * PipelineChannel — 首页 Hero 右侧的「数据通道」可视化
 * ============================================================================
 *
 * 把一次上传抽象成一条可读通道：文件 → Hash → 切片 → 合并。
 * 全站唯一的动态记忆点——连接轨道上的青色小方块持续下移，模拟数据块流动。
 *
 * 实现要点：
 * - 纯 Server Component：动画全部由 globals.css 的 data-flow keyframes 驱动，
 *   不需要任何客户端 JS；prefers-reduced-motion 下方块直接隐藏
 * - 数据是写死的示例快照（128 MB / 26 片 / 17 已上传），只用于示意协议
 *
 * @module components/PipelineChannel
 */

import { cn } from "@/lib/utils";

/* =================================================================
 * 示例快照数据（仅示意，不参与真实上传逻辑）
 * ================================================================ */

/** 示例文件的总分片数（128 MB / 4 MiB = 32） */
const TOTAL_CHUNKS = 32;
/** 已上传完成的分片数 */
const UPLOADED_CHUNKS = 17;
/** 正在传输中的分片数（并发槽位） */
const INFLIGHT_CHUNKS = 4;

/** 连接轨道高度固定 h-12，与 globals.css 的 data-flow 位移（52px）配套 */
const FLOW_DELAYS = ["0s", "0.6s", "1.2s"];

/* =================================================================
 * 内部子组件
 * ================================================================ */

/**
 * FlowLink — 节点之间的连接轨道
 *
 * 一条 1px 竖线 + 若干匀速下移的青色数据块；
 * 用不同的 animation-delay 让块在轨道上均匀分布。
 */
function FlowLink() {
  return (
    <div aria-hidden="true" className="relative ml-10 h-12 w-px -translate-x-px bg-border">
      {FLOW_DELAYS.map((delay) => (
        <span
          key={delay}
          className="motion-safe:animate-data-flow absolute left-1/2 size-1.5 -translate-x-1/2 rounded-[2px] bg-data-500 motion-reduce:hidden"
          style={{ animationDelay: delay }}
        />
      ))}
    </div>
  );
}

interface ChannelNodeProps {
  /** 左侧等宽标签（FILE / HASH / CHUNK / MERGE） */
  tag: string;
  /** 标签下方的辅助说明 */
  hint: string;
  children: React.ReactNode;
}

/**
 * ChannelNode — 通道中的一个节点
 *
 * 布局：左侧 w-20 的等宽大写标签（轨道从其中心穿过），右侧为节点内容。
 */
function ChannelNode({ tag, hint, children }: ChannelNodeProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-20 shrink-0 pt-0.5">
        <span className="font-mono text-[11px] font-medium tracking-widest text-data-600 dark:text-data-400">
          {tag}
        </span>
        <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{hint}</p>
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

/* =================================================================
 * 主组件
 * ================================================================ */

/**
 * PipelineChannel — 「文件 → Hash → 切片 → 合并」数据通道
 *
 * @example
 * <PipelineChannel />
 */
export default function PipelineChannel() {
  return (
    <div className="rounded-lg border border-border/70 bg-card/70 p-5 sm:p-6">
      {/* 通道标题 */}
      <div className="mb-5 flex items-center justify-between">
        <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
          Data Channel
        </p>
        <p className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-data-500 motion-safe:animate-pulse" />
          {UPLOADED_CHUNKS}/{TOTAL_CHUNKS} 已上传 · 并发 {INFLIGHT_CHUNKS}
        </p>
      </div>

      {/* 节点 1：文件 */}
      <ChannelNode tag="FILE" hint="原始文件">
        <p className="text-sm font-medium">video.mp4</p>
        <p className="mt-0.5 text-xs text-muted-foreground">128 MB · Blob.slice 可按需切割</p>
      </ChannelNode>

      <FlowLink />

      {/* 节点 2：Hash */}
      <ChannelNode tag="HASH" hint="Worker 内计算">
        <p className="font-mono text-xs break-all text-foreground/90">
          5f4dcc3b5aa765d61d8327deb882cf99
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">MD5 · SparkMD5 增量计算，主线程不卡</p>
      </ChannelNode>

      <FlowLink />

      {/* 节点 3：切片 */}
      <ChannelNode tag="CHUNK" hint="并发上传">
        <div
          className="flex flex-wrap gap-1"
          role="img"
          aria-label={`共 ${TOTAL_CHUNKS} 个分片，${UPLOADED_CHUNKS} 个已上传，${INFLIGHT_CHUNKS} 个传输中`}
        >
          {Array.from({ length: TOTAL_CHUNKS }, (_, i) => (
            <span
              key={i}
              className={cn(
                "size-2.5 rounded-[2px]",
                i < UPLOADED_CHUNKS && "bg-data-500",
                i >= UPLOADED_CHUNKS &&
                  i < UPLOADED_CHUNKS + INFLIGHT_CHUNKS &&
                  "bg-signal-500 motion-safe:animate-pulse",
                i >= UPLOADED_CHUNKS + INFLIGHT_CHUNKS && "border border-border bg-background",
              )}
            />
          ))}
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          4 MiB / 片 · 原子写入 <span className="font-mono">chunks/&lt;hash&gt;/&lt;index&gt;.part</span>
        </p>
      </ChannelNode>

      <FlowLink />

      {/* 节点 4：合并 */}
      <ChannelNode tag="MERGE" hint="服务端流式">
        <p className="font-mono text-xs break-all text-foreground/90">
          .uploads/merged/5f4dcc3b….bin
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">按 index 顺序流式拼接，不落两倍内存</p>
      </ChannelNode>
    </div>
  );
}
