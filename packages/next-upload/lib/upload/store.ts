/**
 * ============================================================================
 * Zustand Store — next-upload
 * ============================================================================
 *
 * 全局上传管理器。详见 spec §6.2。
 *
 * 状态机（spec §6.1）：
 *
 *        addFiles(File[])
 *               ↓
 *        ┌─────────────┐
 *        │   hashing   │── worker error ──┐
 *        └─────────────┘                  │
 *               ↓ hash ok                 │
 *        ┌─────────────┐                  │
 *        │  checking   │── api error ─────┤
 *        └─────────────┘                  │
 *         │           │                   │
 *         │ completed │ partial / new     │
 *         ↓           ↓                   │
 *    ┌─────────┐  ┌─────────────┐  pause  │
 *    │ instant │  │  uploading  │ ◄──────►│  ┌─────────┐
 *    └─────────┘  └─────────────┘  resume │  │ paused  │
 *                        │                │  └─────────┘
 *                        │ all uploaded   │
 *                        ↓                │
 *                 ┌─────────────┐         │
 *                 │   merging   │─────────┤
 *                 └─────────────┘         │
 *                        │ ok             ↓
 *                 ┌─────────────┐  ┌────────────┐
 *                 │  completed  │  │   failed   │←── retryTask() ──┐
 *                 └─────────────┘  └────────────┘                  │
 *                                        └──────────────────────────┘ (→ checking)
 *
 * 调度规则：
 * - 用户动作（addFiles/resumeTask/retryTask）后，由调用方（UI）自行调用 runTask(id)
 *   以避免 store ↔ pipeline 循环依赖。
 * - removeTask 不调用任何 pipeline 函数；它只是 abort + 从 Map 删除。
 *
 * @module lib/upload/store
 */

"use client";

import { nanoid } from "nanoid";
import { create } from "zustand";

import type { TaskStatus, UploadTask } from "@/types/upload";

import { CHUNK_SIZE, DEFAULT_CONCURRENCY } from "./constants";

interface UploadStore {
  /** 全部任务，key = task.id */
  tasks: Map<string, UploadTask>;
  /** 全局并发分片数（UI Slider 调） */
  concurrency: number;

  // 用户动作 -----------------------------------------------------
  /**
   * 添加文件，生成对应任务对象，初始状态 'hashing'
   * @returns 新创建任务的 id 列表（调用方应对每个 id 调 runTask 启动 pipeline）
   */
  addFiles: (files: File[], now: number) => string[];
  /** 暂停（abort in-flight；状态转 'paused'） */
  pauseTask: (id: string) => void;
  /** 恢复（重置 AbortController；状态转 'checking'；调用方应紧接调 runTask） */
  resumeTask: (id: string) => void;
  /** 失败 → 重试（等同 resume，仅入口状态不同） */
  retryTask: (id: string) => void;
  /** 移除（abort + 从 Map 删除；不清服务端 chunks） */
  removeTask: (id: string) => void;
  /** 调整并发数 */
  setConcurrency: (n: number) => void;

  // 内部 dispatch（pipeline 调用，命名前缀 _） ------------------
  _setHash: (id: string, hash: string) => void;
  _setHashProgress: (id: string, p: number) => void;
  _setStatus: (id: string, status: TaskStatus, error?: string | null) => void;
  _markUploaded: (id: string, index: number) => void;
  _addInflight: (id: string, index: number) => void;
  _removeInflight: (id: string, index: number) => void;
  _setMerged: (id: string, url: string, completedAt: number) => void;
}

/* =================================================================
 * Helpers
 * ================================================================ */

/**
 * 不可变更新单个 task；返回新 Map 触发 Zustand 订阅刷新
 */
function patchTask(
  tasks: Map<string, UploadTask>,
  id: string,
  patch: (t: UploadTask) => UploadTask | void,
): Map<string, UploadTask> {
  const t = tasks.get(id);
  if (!t) {return tasks;}
  const draft = { ...t };
  const out = patch(draft) ?? draft;
  const next = new Map(tasks);
  next.set(id, out);
  return next;
}

function buildTask(file: File, now: number): UploadTask {
  const totalChunks = Math.max(1, Math.ceil(file.size / CHUNK_SIZE));
  return {
    id: nanoid(),
    file,
    fileName: file.name,
    fileSize: file.size,
    fileHash: null,
    chunkSize: CHUNK_SIZE,
    totalChunks,
    uploadedIndices: new Set<number>(),
    inflightIndices: new Set<number>(),
    status: "hashing",
    error: null,
    hashProgress: 0,
    uploadProgress: 0,
    createdAt: now,
    completedAt: null,
    url: null,
    abortController: new AbortController(),
  };
}

/* =================================================================
 * Store
 * ================================================================ */

export const useUploadStore = create<UploadStore>((set) => ({
  tasks: new Map(),
  concurrency: DEFAULT_CONCURRENCY,

  // 添加文件
  addFiles: (files, now) => {
    const ids: string[] = [];
    // 更新状态
    set((state) => {
      // 创建新的任务 Map
      const next = new Map(state.tasks);
      // 遍历文件，创建任务
      for (const f of files) {
        // 创建任务
        const task = buildTask(f, now);
        // 添加到任务 Map
        next.set(task.id, task);
        // 添加到 ID 列表
        ids.push(task.id);
      }
      // 返回新的任务 Map
      return { tasks: next };
    });
    return ids;
  },

  // 暂停任务
  pauseTask: (id) =>
    set((state) => {
      const t = state.tasks.get(id);
      if (!t) {return state;}
      // 仅在可暂停状态生效
      const pausable: TaskStatus[] = ["hashing", "checking", "uploading", "merging"];
      if (!pausable.includes(t.status)) {return state;}
      t.abortController.abort();
      return {
        tasks: patchTask(state.tasks, id, (d) => {
          d.status = "paused";
          d.inflightIndices = new Set();
        }),
      };
    }),

  // 恢复任务
  resumeTask: (id) =>
    set((state) => ({
      tasks: patchTask(state.tasks, id, (d) => {
        d.abortController = new AbortController();
        d.status = "checking";
        d.error = null;
        d.inflightIndices = new Set();
      }),
    })),

  // 失败 → 重试（等同 resume，仅入口状态不同）
  retryTask: (id) =>
    set((state) => ({
      tasks: patchTask(state.tasks, id, (d) => {
        d.abortController = new AbortController();
        d.status = "checking";
        d.error = null;
        d.inflightIndices = new Set();
      }),
    })),

  // 移除任务
  removeTask: (id) =>
    set((state) => {
      const t = state.tasks.get(id);
      t?.abortController.abort();
      const next = new Map(state.tasks);
      next.delete(id);
      return { tasks: next };
    }),

  // 设置全局并发数
  setConcurrency: (n) => set({ concurrency: Math.max(1, Math.min(8, n)) }),

  /* ---- 内部 dispatch（仅供 pipeline 使用） ---------------------- */

  _setHash: (id, hash) =>
    set((state) => ({
      tasks: patchTask(state.tasks, id, (d) => {
        d.fileHash = hash;
        d.hashProgress = 1;
      }),
    })),

  _setHashProgress: (id, p) =>
    set((state) => ({
      tasks: patchTask(state.tasks, id, (d) => {
        d.hashProgress = p;
      }),
    })),

  _setStatus: (id, status, error = null) =>
    set((state) => ({
      tasks: patchTask(state.tasks, id, (d) => {
        d.status = status;
        d.error = error;
      }),
    })),

  _markUploaded: (id, index) =>
    set((state) => ({
      tasks: patchTask(state.tasks, id, (d) => {
        const up = new Set(d.uploadedIndices);
        up.add(index);
        const inflight = new Set(d.inflightIndices);
        inflight.delete(index);
        d.uploadedIndices = up;
        d.inflightIndices = inflight;
        d.uploadProgress = up.size / d.totalChunks;
      }),
    })),

  _addInflight: (id, index) =>
    set((state) => ({
      tasks: patchTask(state.tasks, id, (d) => {
        const next = new Set(d.inflightIndices);
        next.add(index);
        d.inflightIndices = next;
      }),
    })),

  _removeInflight: (id, index) =>
    set((state) => ({
      tasks: patchTask(state.tasks, id, (d) => {
        const next = new Set(d.inflightIndices);
        next.delete(index);
        d.inflightIndices = next;
      }),
    })),

  _setMerged: (id, url, completedAt) =>
    set((state) => ({
      tasks: patchTask(state.tasks, id, (d) => {
        d.url = url;
        d.completedAt = completedAt;
      }),
    })),
}));

/* =================================================================
 * 派生 selector（供 UI 使用）
 * ================================================================ */

/**
 * 活跃任务数（hashing/checking/uploading/merging 之和）
 */
export const selectActiveCount = (s: UploadStore): number => {
  let c = 0;
  for (const t of s.tasks.values()) {
    if (t.status === "hashing" || t.status === "checking" || t.status === "uploading" || t.status === "merging") {c++;}
  }
  return c;
};

/**
 * 按状态分桶（用于 Tabs 计数）
 */
export const selectBuckets = (s: UploadStore) => {
  const all = [...s.tasks.values()].sort((a, b) => b.createdAt - a.createdAt);
  const uploading = all.filter(
    (t) => t.status === "hashing" || t.status === "checking" || t.status === "uploading" || t.status === "merging" || t.status === "paused",
  );
  const completed = all.filter((t) => t.status === "completed" || t.status === "instant");
  const failed = all.filter((t) => t.status === "failed");
  return { all, uploading, completed, failed };
};

/* =================================================================
 * Dev: 把 store 挂到 window，方便 Playwright 等自动化测试直接驱动
 * 仅在 NODE_ENV !== 'production' 时暴露
 * ================================================================ */
if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  (window as unknown as { __uploadStore?: typeof useUploadStore }).__uploadStore = useUploadStore;
}
