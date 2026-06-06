/**
 * ============================================================================
 * TaskCard — 单个上传任务卡片
 * ============================================================================
 *
 * 展示：
 * - 文件名 + 大小
 * - 状态徽章（来自 status-style.ts）
 * - 进度信息：x/y chunks · z inflight
 * - 进度条（hashing 阶段显示 hashProgress；其余显示 uploadProgress）
 * - fileHash（计算完成后才有）
 * - 操作菜单（DropdownMenu）：暂停/恢复/重试/删除/复制下载链接
 * - 完成态显示"下载"按钮
 *
 * @module components/TaskCard
 */
"use client";

import { useState } from "react";
import {
  FileIcon,
  MoreVertical,
  Pause,
  Play,
  RotateCcw,
  Trash2,
  Download,
  Copy,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "sonner";

import type { UploadTask } from "@/types/upload";
import { cn } from "@/lib/utils";
import { useUploadStore } from "@/lib/upload/store";
import { runTask } from "@/lib/upload/pipeline";
import { statusStyle } from "@/lib/upload/status-style";

interface TaskCardProps {
  task: UploadTask;
}

export default function TaskCard({ task }: TaskCardProps) {
  const pauseTask = useUploadStore((s) => s.pauseTask);
  const resumeTask = useUploadStore((s) => s.resumeTask);
  const retryTask = useUploadStore((s) => s.retryTask);
  const removeTask = useUploadStore((s) => s.removeTask);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const s = statusStyle(task.status);
  const isUploading = task.status === "uploading";
  const isHashing = task.status === "hashing";
  const isPaused = task.status === "paused";
  const isFailed = task.status === "failed";
  const isDone = task.status === "completed" || task.status === "instant";

  const progress = isHashing ? task.hashProgress : task.uploadProgress;
  const progressPct = Math.round(progress * 100);

  const handlePauseResume = () => {
    if (isPaused) {
      resumeTask(task.id);
      void runTask(task.id);
    } else {
      pauseTask(task.id);
    }
  };
  const handleRetry = () => {
    retryTask(task.id);
    void runTask(task.id);
  };
  const handleRemove = () => {
    if (isDone || isFailed) {
      removeTask(task.id);
    } else {
      setConfirmOpen(true);
    }
  };
  const confirmRemove = () => {
    removeTask(task.id);
    setConfirmOpen(false);
  };
  const copyUrl = () => {
    if (!task.url) return;
    void navigator.clipboard.writeText(window.location.origin + task.url);
    toast.success("下载链接已复制");
  };

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <FileIcon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />

        <div className="min-w-0 flex-1">
          {/* 顶行：文件名 + badge + 操作菜单 */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-sm font-medium">{task.fileName}</h3>
            <div className="flex items-center gap-2">
              <Badge variant={s.variant} className={cn("font-normal", s.className)}>
                {s.spinning && <Loader2 className="mr-1 inline h-3 w-3 animate-spin" />}
                {s.label}
              </Badge>
              <TaskMenu
                task={task}
                onPauseResume={handlePauseResume}
                onRetry={handleRetry}
                onRemove={handleRemove}
                onCopyUrl={copyUrl}
              />
            </div>
          </div>

          {/* 元信息行 */}
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{formatBytes(task.fileSize)}</span>
            {(isUploading || isPaused) && (
              <>
                <span>·</span>
                <span>
                  {task.uploadedIndices.size}/{task.totalChunks} chunks
                </span>
                {task.inflightIndices.size > 0 && (
                  <>
                    <span>·</span>
                    <span>{task.inflightIndices.size} inflight</span>
                  </>
                )}
              </>
            )}
            {isDone && task.completedAt && (
              <>
                <span>·</span>
                <span>{formatDuration(task.completedAt - task.createdAt)}</span>
              </>
            )}
          </div>

          {/* 进度条 */}
          {!isDone && !isFailed && (
            <div className="mt-3 flex items-center gap-2">
              <Progress value={progressPct} className="h-2 flex-1" />
              <span className="w-12 text-right font-mono text-xs tabular-nums">
                {progressPct}%
              </span>
            </div>
          )}

          {/* hash 显示 */}
          {task.fileHash && (
            <p className="mt-2 truncate font-mono text-[11px] text-muted-foreground">
              MD5: {task.fileHash}
            </p>
          )}

          {/* 错误信息 */}
          {isFailed && task.error && (
            <p className="mt-2 text-xs text-destructive">{task.error}</p>
          )}

          {/* 完成态：下载按钮（base-ui Button 没有 asChild，用 buttonVariants 套在 a 上） */}
          {isDone && task.url && (
            <div className="mt-3">
              <a
                href={task.url}
                download={task.fileName}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <Download className="mr-1 h-4 w-4" />
                下载
              </a>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除上传任务?</AlertDialogTitle>
            <AlertDialogDescription>
              「{task.fileName}」正在上传中。删除将中断上传，但服务端已上传的分片会保留——下次再传同一文件可秒传/续传。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

/* =================================================================
 * 操作菜单（抽出来便于阅读）
 * ================================================================ */

interface TaskMenuProps {
  task: UploadTask;
  onPauseResume: () => void;
  onRetry: () => void;
  onRemove: () => void;
  onCopyUrl: () => void;
}

function TaskMenu({ task, onPauseResume, onRetry, onRemove, onCopyUrl }: TaskMenuProps) {
  const isPaused = task.status === "paused";
  const isFailed = task.status === "failed";
  const isDone = task.status === "completed" || task.status === "instant";
  const isPausable =
    task.status === "hashing" ||
    task.status === "checking" ||
    task.status === "uploading" ||
    task.status === "merging";

  return (
    <TooltipProvider>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="操作">
              <MoreVertical className="h-4 w-4" />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          {isPausable && (
            <DropdownMenuItem onClick={onPauseResume}>
              <Pause className="mr-2 h-4 w-4" /> 暂停
            </DropdownMenuItem>
          )}
          {isPaused && (
            <DropdownMenuItem onClick={onPauseResume}>
              <Play className="mr-2 h-4 w-4" /> 恢复
            </DropdownMenuItem>
          )}
          {isFailed && (
            <DropdownMenuItem onClick={onRetry}>
              <RotateCcw className="mr-2 h-4 w-4" /> 重试
            </DropdownMenuItem>
          )}
          {isDone && task.url && (
            <DropdownMenuItem onClick={onCopyUrl}>
              <Copy className="mr-2 h-4 w-4" /> 复制下载链接
            </DropdownMenuItem>
          )}
          {(isPausable || isPaused || isFailed || isDone) && <DropdownMenuSeparator />}
          <DropdownMenuItem
            onClick={onRemove}
            variant="destructive"
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" /> 删除任务
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
}

/* =================================================================
 * 格式化工具
 * ================================================================ */

function formatBytes(n: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let v = n;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

function formatDuration(ms: number): string {
  const s = Math.round(ms / 1000);
  if (s < 60) return `完成于 ${s}s`;
  const m = Math.floor(s / 60);
  return `完成于 ${m}m${s % 60}s`;
}
