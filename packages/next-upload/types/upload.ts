/**
 * ============================================================================
 * 上传相关类型 — next-upload
 * ============================================================================
 *
 * 本文件集中定义：
 * - 客户端任务状态（TaskStatus）与任务对象（UploadTask）
 * - 三个上传 API 端点的请求 / 响应 DTO（CheckRequest / CheckResponse / ChunkResponse / MergeRequest / MergeResponse）
 * - 内部错误类型（HttpError）
 *
 * 状态机文档见 spec §6.1。
 *
 * @module types/upload
 */

/* =================================================================
 * 任务状态机
 * ================================================================ */

/**
 * 8 种任务状态：
 * - hashing   计算文件 hash
 * - checking  调用 /api/upload/check
 * - uploading 并发上传分片
 * - merging   调用 /api/upload/merge
 * - completed 上传成功（含合并）
 * - instant   秒传命中（check 直接返回 completed）
 * - paused    用户手动暂停
 * - failed    单分片超过 MAX_RETRY 或致命错误
 *
 * 终态：completed | instant | failed（后者可经 retryTask 复活到 checking）
 */
export type TaskStatus =
  | "hashing"
  | "checking"
  | "uploading"
  | "merging"
  | "completed"
  | "instant"
  | "paused"
  | "failed";

/**
 * 单个上传任务的完整状态
 *
 * 注意：
 * - `file`、`abortController` 是运行时引用，不应被序列化或持久化
 * - `uploadedIndices` / `inflightIndices` 使用 Set 便于增删；UI 用 .size 显示
 * - `createdAt` 由调用方传入，避免 store 内部使用 Date.now() 影响测试
 */
export interface UploadTask {
  id: string;
  file: File;
  fileName: string;
  fileSize: number;
  fileHash: string | null;
  chunkSize: number;
  totalChunks: number;
  uploadedIndices: Set<number>;
  inflightIndices: Set<number>;
  status: TaskStatus;
  error: string | null;
  hashProgress: number; // 0..1
  uploadProgress: number; // 0..1
  createdAt: number;
  completedAt: number | null;
  url: string | null;
  abortController: AbortController;
}

/* =================================================================
 * 协议 DTO — 严格对应 spec §5
 * ================================================================ */

/**
 * POST /api/upload/check 请求体
 */
export interface CheckRequest {
  fileHash: string;
  fileName: string;
  fileSize: number;
  chunkSize: number;
  totalChunks: number;
}

/**
 * POST /api/upload/check 响应（三态）
 */
export type CheckResponse =
  | { status: "completed"; url: string }
  | { status: "partial"; uploaded: number[] }
  | { status: "new" };

/**
 * POST /api/upload/chunk 响应
 * （请求体是 multipart/form-data：fileHash, index, chunk）
 */
export interface ChunkResponse {
  ok: true;
  index: number;
}

/**
 * POST /api/upload/merge 请求体
 */
export interface MergeRequest {
  fileHash: string;
  fileName: string;
  totalChunks: number;
}

/**
 * POST /api/upload/merge 响应
 */
export interface MergeResponse {
  ok: true;
  url: string;
  size: number;
  mergedAt: number;
}

/* =================================================================
 * 错误类型
 * ================================================================ */

/**
 * HttpError — 包装 fetch 失败 / 非 2xx 响应
 * 用于在 pipeline.uploadWithRetry 中根据 status 区分 4xx（不重试）与 5xx（重试）
 */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}
