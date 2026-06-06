/**
 * ============================================================================
 * TaskList — 任务列表（Tabs 分组）
 * ============================================================================
 *
 * 按 status 分桶：
 * - 全部
 * - 上传中（含 paused）
 * - 已完成（含 instant）
 * - 失败
 *
 * 每桶显示对应的 TaskCard 列表；空时显示占位文案。
 *
 * @module components/TaskList
 */
"use client";

import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUploadStore } from "@/lib/upload/store";
import type { UploadTask } from "@/types/upload";
import TaskCard from "./TaskCard";

export default function TaskList() {
  // 直接订阅 tasks Map 的引用（每次 set 时 store 会生成新 Map）；
  // 派生 buckets 用 useMemo 缓存——避免 inline 计算每渲染都生成新数组，
  // 触发 useSyncExternalStore 的 "getServerSnapshot should be cached" 无限循环。
  const tasks = useUploadStore((s) => s.tasks);
  const buckets = useMemo(() => deriveBuckets(tasks), [tasks]);
  const { all, uploading, completed, failed } = buckets;

  if (all.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
        暂无任务。把文件拖到上方区域即可开始上传。
      </div>
    );
  }

  return (
    <Tabs defaultValue="all">
      <TabsList>
        <TabsTrigger value="all">全部 {all.length}</TabsTrigger>
        <TabsTrigger value="uploading">上传中 {uploading.length}</TabsTrigger>
        <TabsTrigger value="completed">已完成 {completed.length}</TabsTrigger>
        <TabsTrigger value="failed">失败 {failed.length}</TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="mt-4 flex flex-col gap-3">
        {all.map((t) => (
          <TaskCard key={t.id} task={t} />
        ))}
      </TabsContent>
      <TabsContent value="uploading" className="mt-4 flex flex-col gap-3">
        {uploading.length === 0 ? (
          <EmptyHint text="目前没有上传中的任务" />
        ) : (
          uploading.map((t) => <TaskCard key={t.id} task={t} />)
        )}
      </TabsContent>
      <TabsContent value="completed" className="mt-4 flex flex-col gap-3">
        {completed.length === 0 ? (
          <EmptyHint text="还没有完成的任务" />
        ) : (
          completed.map((t) => <TaskCard key={t.id} task={t} />)
        )}
      </TabsContent>
      <TabsContent value="failed" className="mt-4 flex flex-col gap-3">
        {failed.length === 0 ? (
          <EmptyHint text="没有失败的任务" />
        ) : (
          failed.map((t) => <TaskCard key={t.id} task={t} />)
        )}
      </TabsContent>
    </Tabs>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <p className="py-6 text-center text-xs text-muted-foreground">{text}</p>;
}

/**
 * deriveBuckets — 把 tasks Map 按状态分桶
 * 提到组件外，避免 React closure 每渲染重建函数。
 */
function deriveBuckets(tasks: Map<string, UploadTask>) {
  const all = [...tasks.values()].sort((a, b) => b.createdAt - a.createdAt);
  const uploading = all.filter(
    (t) =>
      t.status === "hashing" ||
      t.status === "checking" ||
      t.status === "uploading" ||
      t.status === "merging" ||
      t.status === "paused",
  );
  const completed = all.filter((t) => t.status === "completed" || t.status === "instant");
  const failed = all.filter((t) => t.status === "failed");
  return { all, uploading, completed, failed };
}
