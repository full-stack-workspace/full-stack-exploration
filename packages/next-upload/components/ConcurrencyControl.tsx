/**
 * ============================================================================
 * ConcurrencyControl — 全局并发数滑动条
 * ============================================================================
 *
 * 调整 store 的 concurrency 字段。生效范围：所有 *新启动的* 分片调度器；
 * 已经在跑的上传槽位数不会动态变化（pipeline.runChunkPool 在启动时读快照）。
 * 调整对下一次 resume / retry 立即生效。
 *
 * @module components/ConcurrencyControl
 */
"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { CONCURRENCY_MAX,CONCURRENCY_MIN } from "@/lib/upload/constants";
import { useUploadStore } from "@/lib/upload/store";

export default function ConcurrencyControl() {
  // store 使用场景1: 读出来要渲染在 UI 界面中
  // 订阅全局并发数状态，用于渲染 UI，store 发生变化时，会自动重新渲染组件
  const concurrency = useUploadStore((s) => s.concurrency);
  // 稳定的 action，由于当前组件要根据并发数更新 UI，因此这里写进了 hook。
  // 另一种写法是：在回调函数中直接调用 useUploadStore.getState().setConcurrency(value);
  const setConcurrency = useUploadStore((s) => s.setConcurrency);

  return (
    <div className="w-full lg:w-auto lg:min-w-96">
      <div className="flex items-center gap-3 sm:gap-4">
        <Label htmlFor="concurrency-slider" className="shrink-0 whitespace-nowrap text-sm">
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
          className="min-w-0 flex-1 sm:max-w-64"
          aria-describedby="concurrency-hint"
        />
        <span className="shrink-0 whitespace-nowrap font-mono text-sm tabular-nums">
          {concurrency}
          <span className="ml-1 text-xs text-muted-foreground">
            ({CONCURRENCY_MIN}–{CONCURRENCY_MAX})
          </span>
        </span>
      </div>
      {/* 生效时机说明：新任务立即生效；进行中的槽位不变，恢复 / 重试时按新值调度 */}
      <p id="concurrency-hint" className="mt-2 text-xs leading-relaxed text-muted-foreground">
        对新任务立即生效；进行中的上传槽位不变，「恢复 / 重试」时按新值调度。
      </p>
    </div>
  );
}
