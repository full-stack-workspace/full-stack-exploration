## lucide-react 依赖引入指导与说明

[`lucide-react`](https://lucide.dev/guide/react) 是开源图标库 [Lucide](https://lucide.dev/) 面向 React 提供的官方组件包。它将每个图标封装为独立的 React 组件，并渲染成内联 SVG，因此可以像普通 JSX 组件一样使用，也可以通过 `size`、`color`、`strokeWidth`、`className` 等属性调整样式。

### 它有什么作用？

`lucide-react` 为界面中的常见操作和状态提供统一的视觉符号，例如上传、下载、暂停、重试、删除、主题切换和结果反馈。相比在项目中手工维护 SVG 或混用字符图标，它主要解决以下问题：

- **保持视觉一致性**：图标采用统一的线条风格，减少不同页面之间的视觉差异。
- **提升可读性和操作识别效率**：图标可以辅助文字表达按钮含义和任务状态，但不应替代必要的文本或无障碍标签。
- **便于组件化定制**：图标本身就是带有 TypeScript 类型的 React 组件，可复用现有的颜色、尺寸和 Tailwind CSS 样式。
- **控制打包体积**：每个图标都可以按名称单独导入，构建工具能够移除未使用的图标（Tree Shaking）。
- **保持清晰显示**：SVG 在不同尺寸和像素密度下仍能保持清晰，适合响应式界面。

### 为什么项目中引入它？

本仓库的 React / Next.js 示例包含较多图标化交互，例如主题切换、文件上传、任务暂停与恢复、下载、删除、重试、菜单以及成功或错误提示。引入 `lucide-react` 可以让这些场景共用同一套图标语言，也与项目使用的 shadcn/ui 组件风格保持一致，避免为每个功能重复查找、复制和维护 SVG。

### 基本用法

```tsx
import { Pause, Play, Upload } from "lucide-react";

export function UploadActions() {
  return (
    <div className="flex items-center gap-2">
      <Upload aria-hidden="true" className="size-4" />
      <button type="button" aria-label="暂停上传">
        <Pause aria-hidden="true" className="size-4" />
      </button>
      <button type="button" aria-label="继续上传">
        <Play aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}
```

推荐使用具名导入，只引入当前组件实际需要的图标。仅用于装饰或已有文字说明的图标应添加 `aria-hidden="true"`；只有图标而没有可见文字的按钮，则需要通过 `aria-label` 提供可访问名称。

### 相关链接

- [Lucide 官网与图标搜索](https://lucide.dev/)
- [lucide-react 官方指南](https://lucide.dev/guide/react)
- [Lcuide 中文网](https://lucide.nodejs.cn/guide/packages/lucide-react)