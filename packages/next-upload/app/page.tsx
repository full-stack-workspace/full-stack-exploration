/**
 * ============================================================================
 * 主页（占位） — next-upload
 * ============================================================================
 *
 * 当前为占位页，仅用于验证 dev server 能起。
 * Task H2 会替换为真正的上传任务面板。
 *
 * @module app/page
 */
export default function HomePage() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-bold">next-upload — 大文件分片上传 Demo</h1>
      <p className="mt-4 text-sm text-muted-foreground">脚手架占位页。Phase H 会替换为完整 UI。</p>
    </main>
  );
}
