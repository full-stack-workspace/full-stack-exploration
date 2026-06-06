/**
 * ============================================================================
 * UploadDropzone — 拖拽 + 点击选文件
 * ============================================================================
 *
 * 职责：
 * - 接收用户拖拽 / 选择的多文件
 * - 调用 addFiles + runTask 启动 pipeline
 * - 高亮 dragover 视觉反馈（用 Tailwind class 切换）
 *
 * 实现要点：
 * - 用原生 HTML5 DnD API（dragenter / dragover / dragleave / drop），不引外部库
 * - dragenter / dragleave 用计数器规避子元素引起的抖动
 *
 * @module components/UploadDropzone
 */
"use client";

import { useRef, useState, useCallback } from "react";
import { Upload as UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUploadStore } from "@/lib/upload/store";
import { runTask } from "@/lib/upload/pipeline";

export default function UploadDropzone() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dragCounter = useRef(0);
  const [hovering, setHovering] = useState(false);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    const ids = useUploadStore.getState().addFiles(list, Date.now());
    ids.forEach((id) => void runTask(id));
  }, []);

  return (
    <div
      onDragEnter={(e) => {
        e.preventDefault();
        dragCounter.current++;
        if (dragCounter.current === 1) setHovering(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        dragCounter.current = Math.max(0, dragCounter.current - 1);
        if (dragCounter.current === 0) setHovering(false);
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
        "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-12 transition-all",
        hovering
          ? "border-primary-500 bg-primary-500/5 scale-[1.01]"
          : "border-border bg-muted/30 hover:bg-muted/50",
      )}
    >
      <UploadIcon className="h-10 w-10 text-muted-foreground" />
      <div className="text-center">
        <p className="text-sm">
          <span className="font-medium">拖拽文件到此处</span>，或
        </p>
        <Button
          variant="link"
          className="mt-1 h-auto p-0 text-primary-600 dark:text-primary-400"
          onClick={() => inputRef.current?.click()}
        >
          点击选择文件
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">支持多文件 · 单文件无大小限制</p>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
