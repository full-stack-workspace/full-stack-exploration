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

// 使用 use client 确保组件在客户端渲染
"use client";

import { Upload as UploadIcon } from "lucide-react";
import { useCallback,useRef, useState } from "react";

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
