/**
 * ============================================================================
 * UploadDropzone — 拖拽 + 点击选文件
 * ============================================================================
 *
 * 职责：
 * - 接收用户拖拽 / 选择的多文件
 * - 调用 addFiles + runTask 启动 pipeline
 * - 明确反馈当前动作：拖拽悬停时切换文案 / 图标 / 边框色，
 *   让用户知道「松开就会开始上传」，松开后立即进入 Hash 阶段
 *
 * 实现要点：
 * - 用原生 HTML5 DnD API（dragenter / dragover / dragleave / drop），不引外部库
 * - dragenter / dragleave 用计数器规避子元素引起的抖动
 *
 * @module components/UploadDropzone
 */

// 使用 use client 确保组件在客户端渲染
"use client";

import { ArrowDownToLine, FileUp } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { runTask } from "@/lib/upload/pipeline";
import { useUploadStore } from "@/lib/upload/store";
import { cn } from "@/lib/utils";

export default function UploadDropzone() {
  // 实用 useRef 创建一个 ref 对象，用于存储 input 元素
  const inputRef = useRef<HTMLInputElement | null>(null);
  // 使用 useRef 创建一个 ref 对象，用于存储拖拽计数器
  const dragCounter = useRef(0);

  // 使用 useState 创建一个状态，用于存储是否悬停
  const [hovering, setHovering] = useState(false);

  // 使用 useCallback 创建一个回调函数，用于处理文件选择
  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    // 将文件列表转换为数组
    const list = Array.from(files);
    // 调用 useUploadStore 的 action 方法 addFiles ，添加文件，返回任务 ID 列表
    // 这里只在事件回调里使用命令调用方式写到 store 里新值，并不要求更新当前 UI 组件
    // 所以使用命令调用方式，不用写进 hooks 里
    const ids = useUploadStore.getState().addFiles(list, Date.now());
    // 针对每个任务，调用 runTask 方法，启动文件上传 pipline
    ids.forEach((id) => void runTask(id));
  }, []);

  return (
    <div
      onDragEnter={(e) => {
        e.preventDefault();
        dragCounter.current++;
        if (dragCounter.current === 1) {setHovering(true);}
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        dragCounter.current = Math.max(0, dragCounter.current - 1);
        if (dragCounter.current === 0) {setHovering(false);}
      }}
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        dragCounter.current = 0;
        setHovering(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={cn(
        "group relative flex min-h-72 flex-col items-center justify-center gap-4 overflow-hidden rounded-xl border-2 border-dashed p-6 text-center transition-colors sm:p-12",
        hovering
          ? "border-data-500 bg-data-500/8"
          : "border-border bg-muted/25 hover:border-primary-400/60 hover:bg-muted/45",
      )}
    >
      <div
        aria-hidden="true"
        className="blueprint-grid pointer-events-none absolute inset-0 opacity-35 [mask-image:linear-gradient(to_bottom,transparent,black_35%,black_65%,transparent)]"
      />
      {hovering ? (
        <ArrowDownToLine className="relative size-11 text-data-500" aria-hidden="true" />
      ) : (
        <div className="relative flex size-14 items-center justify-center rounded-xl border border-border bg-background shadow-sm">
          <FileUp className="size-6 text-primary-600 dark:text-primary-400" aria-hidden="true" />
          <span className="absolute -right-1.5 -bottom-1.5 flex size-5 items-center justify-center rounded-md bg-data-500 text-[10px] font-semibold text-slate-950">
            5M
          </span>
        </div>
      )}
      <div className="relative">
        {hovering ? (
          <>
            <p className="text-sm font-medium text-data-600 dark:text-data-400">
              松开鼠标，开始上传
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              文件将立即进入 Hash 计算
            </p>
          </>
        ) : (
          <>
            <p className="text-base font-medium sm:text-lg">
              把大文件拖到这里
            </p>
            <Button
              variant="link"
              className="mt-1 h-auto p-0 text-sm text-primary-600 dark:text-primary-400"
              onClick={() => inputRef.current?.click()}
            >
              或从设备中选择文件
            </Button>
          </>
        )}
      </div>
      <p className="relative text-xs leading-relaxed text-muted-foreground">
        {hovering ? (
          "上传中可随时暂停 / 恢复"
        ) : (
          <>
            支持多文件 · 5 MiB 分片 · 可暂停与恢复
            <span className="mt-1 block font-mono text-[11px]">
              Hash → Check → Upload chunks → Merge
            </span>
          </>
        )}
      </p>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          // 处理文件选择
          handleFiles(e.target.files);
          // 重置 value，否则用户连续选同一文件第二次不会触发 onChange
          e.target.value = "";
        }}
      />
    </div>
  );
}
