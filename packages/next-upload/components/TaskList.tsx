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

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUploadStore, selectBuckets } from "@/lib/upload/store";
import TaskCard from "./TaskCard";

export default function TaskList() {
  const buckets = useUploadStore(selectBuckets);
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
