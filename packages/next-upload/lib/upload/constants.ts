/**
 * ============================================================================
 * 上传相关常量 — next-upload
 * ============================================================================
 *
 * 所有常量都附带"为什么是这个值"的说明（spec §8.2 强制要求）。
 *
 * @module lib/upload/constants
 */

/**
 * 分片大小：5 MiB
 *
 * 为什么是这个值：
 * - Cloudflare / CloudFront / S3 multipart 默认分片范围内最常用挡位
 * - 太小（如 256 KiB）→ 1 GB 文件会切出 4000+ 个 HTTP 请求，握手开销暴涨
 * - 太大（如 50 MiB）→ 暂停 / 重试粒度太粗，单次失败重传太贵
 */
export const CHUNK_SIZE = 5 * 1024 * 1024;

/**
 * 默认并发分片数：4
 *
 * 为什么是这个值：
 * - 浏览器同源连接上限通常是 6（Chrome / Firefox / Safari 一致）
 * - 留 2 个 slot 给页面其他 fetch（API 探活、下载预览等）
 * - UI Slider 允许调整 1–8
 */
export const DEFAULT_CONCURRENCY = 4;

/**
 * 单分片最大重试次数：3
 *
 * 为什么是这个值：
 * - 总尝试 = 1（首次）+ 3（重试）= 4 次
 * - 退避序列 1s + 2s + 4s = 7s 等待 + 4 次请求
 * - 7s 内仍连不通 server，再等也无意义；判失败更人性化
 */
export const MAX_RETRY = 3;

/**
 * 重试退避基数：1000ms
 *
 * 实际退避序列：1s → 2s → 4s（指数 2^attempt）
 * 设计为：第 attempt 次重试前 sleep(RETRY_BASE_MS * 2 ** attempt)
 */
export const RETRY_BASE_MS = 1000;

/**
 * Hash 时按 2 MiB 切片喂给 SparkMD5
 *
 * 为什么是这个值：
 * - 足够大：减少 FileReader 调用次数（1 GB 文件 → 512 次 read）
 * - 足够小：worker 内部不会一次分配过大 ArrayBuffer 引发 OOM
 * - 与 CHUNK_SIZE 解耦：hash 切片只影响内存，与上传协议无关
 */
export const HASH_CHUNK_SIZE = 2 * 1024 * 1024;

/**
 * 并发滑动条范围：1–8
 */
export const CONCURRENCY_MIN = 1;
export const CONCURRENCY_MAX = 8;
