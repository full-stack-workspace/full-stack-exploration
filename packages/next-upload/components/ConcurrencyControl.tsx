/**
 * ============================================================================
 * ConcurrencyControl — 全局并发数滑动条
 * ============================================================================
 *
 * 调整 store 的 concurrency 字段。生效范围：所有 *新启动的* 分片调度器；
 * 已经在跑的 worker 数量不会动态变化（pipeline.runChunkPool 在启动时读快照）。
 * 调整对下一次 resume / retry 立即生效。
 *
 * @module components/ConcurrencyControl
 */
"use client";

import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useUploadStore } from "@/lib/upload/store";
import { CONCURRENCY_MIN, CONCURRENCY_MAX } from "@/lib/upload/constants";

export default function ConcurrencyControl() {
  const concurrency = useUploadStore((s) => s.concurrency);
  const setConcurrency = useUploadStore((s) => s.setConcurrency);

  return (
    <div className="flex items-center gap-4">
      <Label htmlFor="concurrency-slider" className="whitespace-nowrap text-sm">
        并发数
      </Label>
      <Slider
        id="concurrency-slider"
        min={CONCURRENCY_MIN}
        max={CONCURRENCY_MAX}
        step={1}
        value={[concurrency]}
        onValueChange={(v) =>
          setConcurrency(typeof v === "number" ? v : (v[0] ?? concurrency))
        }
        className="w-64"
      />
      <span className="w-8 text-right font-mono text-sm tabular-nums">{concurrency}</span>
      <span className="text-xs text-muted-foreground">
        ({CONCURRENCY_MIN}–{CONCURRENCY_MAX})
      </span>
    </div>
  );
}
