/**
 * ============================================
 * Tailwind CSS v4 Configuration
 * ============================================
 *
 * 本配置文件采用 Design Tokens 架构:
 *
 * ┌─────────────────────────────────────────────────────┐
 * │  CSS 自定义属性 (CSS Custom Properties)             │  ← tokens.css
 * │  --color-brand-500, --spacing-18, --shadow-card    │
 * └─────────────────────────────────────────────────────┘
 *                         ↓ 引用
 * ┌─────────────────────────────────────────────────────┐
 * │  Tailwind Config                                    │  ← 本文件
 * │  theme.extend.* = CSS 变量引用                      │
 * └─────────────────────────────────────────────────────┘
 *                         ↓ 生成
 * ┌─────────────────────────────────────────────────────┐
 * │  Tailwind 类名 (最终 CSS)                           │
 * │  bg-brand-500, p-18, shadow-card                   │
 * └─────────────────────────────────────────────────────┘
 *
 * 设计优势:
 * 1. 单一数据源 - tokens.css 是唯一真相
 * 2. 主题切换 - 通过覆盖 CSS 变量实现
 * 3. Tailwind 类名可用 - 保持开发体验
 * 4. 运行时可修改 - CSS 变量支持 JavaScript 修改
 */

/** @type {import('tailwindcss').Config} */
export default {
  /**
   * ============================================
   * Content 配置 (Content Paths)
   * ============================================
   * content 数组告诉 Tailwind 在哪些文件中查找类名，
   * 以便它能够正确生成所需的 CSS。
   *
   * 重要: Tailwind 扫描所有 content 路径中的文件，
   *       只保留实际使用的 CSS 类（Tree-shaking）
   *
   * 配置说明:
   * - "./index.html": 项目根目录的 HTML 入口
   *   (Vite 项目通常在根目录有 index.html)
   *
   * - 如果使用 Vue / Svelte，请添加 "*.vue", "*.svelte"
   * - 如果有 utils / helpers 等纯函数文件，也要加入
   * - content 路径必须准确，太宽泛会影响构建速度
  */
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      /**
       * ============================================
       * CSS 变量引用 (CSS Variable References)
       * ============================================
       * 所有 theme 配置值都通过 CSS 变量引用 tokens.css
       * 这样保证了一个真实的单一数据源
       *
       * 使用方式: var(--variable-name)
       *
       * 注意: CSS 变量引用在 Tailwind 中是字符串形式
       *       需要使用字符串包装: 'var(--xxx)'
       */

      /**
       * 1. Colors - 颜色配置
       * ============================================
       * 颜色通过 CSS 变量引用语义化颜色
       * tokens.css 中的语义层负责映射到原始颜色
       *
       * 使用方式:
       * - bg-brand-500 → background-color: var(--color-brand-500)
       * - text-accent → color: var(--color-accent)
       * - border-accent-light → border-color: var(--color-accent-light)
       */
      colors: {
        brand: {
          50: 'var(--color-brand-50)',
          100: 'var(--color-brand-100)',
          200: 'var(--color-brand-200)',
          300: 'var(--color-brand-300)',
          400: 'var(--color-brand-400)',
          500: 'var(--color-brand-500)',  // 主品牌色
          600: 'var(--color-brand-600)',
          700: 'var(--color-brand-700)',
          800: 'var(--color-brand-800)',
          900: 'var(--color-brand-900)',
        },
        accent: {
          light: 'var(--color-accent-light)',
          DEFAULT: 'var(--color-accent)',
          dark: 'var(--color-accent-dark)',
        },
      },

      /**
       * 2. Spacing - 间距配置
       * ============================================
       * 间距引用 CSS 变量，保持与设计系统一致
       *
       * 使用方式:
       * - p-18 → padding: var(--spacing-18)
       * - m-22 → margin: var(--spacing-22)
       */
      spacing: {
        '18': 'var(--spacing-18)',
        '22': 'var(--spacing-22)',
        '128': 'var(--spacing-128)',
      },

      /**
       * 3. Border Radius - 圆角配置
       * ============================================
       * 圆角引用 CSS 变量
       *
       * 使用方式:
       * - rounded-4xl → border-radius: var(--radius-4xl)
       */
      borderRadius: {
        '4xl': 'var(--radius-4xl)',
      },

      /**
       * 4. Font Family - 字体配置
       * ============================================
       * 字体栈引用 CSS 变量
       *
       * 使用方式:
       * - font-sans → font-family: var(--font-sans)
       * - font-display → font-family: var(--font-display)
       * - font-mono → font-family: var(--font-mono)
       */
      fontFamily: {
        sans: 'var(--font-sans)',
        display: 'var(--font-display)',
        mono: 'var(--font-mono)',
      },

      /**
       * 5. Font Size - 字号配置
       * ============================================
       * 字号包含 font-size 和 line-height
       * Tailwind 中 font-size 可以是 [size, { lineHeight }] 数组
       *
       * 使用方式:
       * - text-2xs → font: var(--text-2xs)
       * - text-7xl → font: var(--text-7xl)
       */
      fontSize: {
        '2xs': 'var(--text-2xs)',
        '7xl': 'var(--text-7xl)',
      },

      /**
       * 6. Box Shadow - 阴影配置
       * ============================================
       * 阴影引用 CSS 变量，便于主题切换
       *
       * 使用方式:
       * - shadow-inner-lg → box-shadow: var(--shadow-inner-lg)
       * - shadow-card → box-shadow: var(--shadow-card)
       * - shadow-card-hover → box-shadow: var(--shadow-card-hover)
       */
      boxShadow: {
        'inner-lg': 'var(--shadow-inner-lg)',
        'card': 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
      },

      /**
       * 7. Animation - 动画配置
       * ============================================
       * 动画时间引用 CSS 变量
       *
       * 使用方式:
       * - animate-fade-in → animation-duration: var(--duration-fade)
       * - animate-pulse-slow → animation-duration: var(--duration-pulse-slow)
       */
      animation: {
        'fade-in': 'fadeIn var(--duration-fade) var(--ease-default) forwards',
        'slide-up': 'slideUp var(--duration-slow) var(--ease-out) forwards',
        'pulse-slow': 'pulse var(--duration-pulse-slow) var(--ease-default) infinite',
        'bounce-slow': 'bounce var(--duration-bounce-slow) var(--ease-default) infinite',
      },

      /**
       * 8. Keyframes - 关键帧配置
       * ============================================
       * 动画帧定义，保持精简以优化性能
       */
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },

      /**
       * 9. Transition Timing Function - 缓动函数
       * ============================================
       * 缓动函数引用 CSS 变量
       *
       * 使用方式:
       * - ease-bounce-in → transition-timing-function: var(--ease-bounce-in)
       */
      transitionTimingFunction: {
        'bounce-in': 'var(--ease-bounce-in)',
      },

      /**
       * 10. Duration - 动画时长
       * ============================================
       * 单独暴露时长变量，便于精确控制
       */
      transitionDuration: {
        'fast': 'var(--duration-fast)',
        'normal': 'var(--duration-normal)',
        'slow': 'var(--duration-slow)',
      },
    },
  },

  /**
   * ============================================
   * Plugins - 自定义插件
   * ============================================
   * 插件中的配置也通过 CSS 变量引用
   * 使用 theme() 函数自动解析 CSS 变量
   *
   * 插件架构:
   * - addBase(): 基础元素样式
   * - addComponents(): 可复用组件类
   * - addUtilities(): 原子化工具类
   *
   * 注意: 第二参数 ['responsive', 'hover'] 表示支持变体
   */
  plugins: [
    function ({ addUtilities, addBase, addComponents, theme }) {
      /**
       * addBase - 基础元素重置
       * 此处为 h1 添加 7xl 字号
       */
      addBase({
        'h1': { fontSize: 'var(--text-7xl)' },
      });

      /**
       * addComponents - 可复用组件
       * 组件类引用 CSS 变量，保持与 tokens.css 一致
       *
       * 组件设计原则:
       * 1. 组件类由多个工具类组合而成
       * 2. 使用 theme() 函数引用 CSS 变量
       * 3. 支持 &:hover 等伪类选择器
       */
      addComponents({
        /**
         * .btn 基础按钮
         * 组件变量引用方式:
         * - padding → theme('spacing.2') theme('spacing.4')
         * - border-radius → theme('borderRadius.lg')
         * - font-weight → theme('fontWeight.600')
         */
        '.btn': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
          borderRadius: theme('borderRadius.lg'),
          fontWeight: 'var(--button-font-weight)',
          transitionDuration: 'var(--duration-normal)',
          transitionTimingFunction: 'var(--ease-default)',
          transitionProperty: 'all',
        },

        /**
         * .btn-primary 主按钮变体
         * 颜色引用语义变量，支持主题切换
         */
        '.btn-primary': {
          backgroundColor: theme('colors.brand.500'),
          color: 'white',
          '&:hover': {
            backgroundColor: theme('colors.brand.600'),
            transform: 'translateY(-1px)',
          },
        },

        /**
         * .card-demo 演示用卡片
         * 阴影引用组件变量，支持悬停状态
         */
        '.card-demo': {
          backgroundColor: 'white',
          borderRadius: 'var(--card-border-radius)',
          padding: 'var(--card-padding)',
          boxShadow: 'var(--card-shadow)',
          transitionDuration: 'var(--duration-slow)',
          transitionProperty: 'box-shadow',
          transitionTimingFunction: 'var(--ease-default)',
          '&:hover': {
            boxShadow: 'var(--card-shadow-hover)',
          },
        },
      });

      /**
       * addUtilities - 原子化工具类
       * 这些工具类引用 CSS 变量，支持主题切换
       *
       * 工具类设计原则:
       * 1. 单一职责 - 每个类做一件事
       * 2. 原子化 - 不可再分
       * 3. 语义化命名 - 名称表达用途
       */
      addUtilities({
        /**
         * .text-gradient 渐变文字
         * CSS 变量引用: 无 (硬编码渐变色，语义化为设计决策)
         */
        '.text-gradient': {
          backgroundImage: 'linear-gradient(135deg, var(--color-brand-500) 0%, #8b5cf6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        },

        /**
         * .glass 毛玻璃效果
         * 引用 glass 组件变量
         */
        '.glass': {
          backgroundColor: 'var(--glass-bg)',
          backdropFilter: 'blur(var(--glass-blur))',
          border: 'var(--glass-border)',
        },

        /**
         * .center-flex / .center-grid 居中布局
         * 纯工具类，无变量引用
         */
        '.center-flex': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        '.center-grid': {
          display: 'grid',
          placeItems: 'center',
        },

        /**
         * .mask-circle 圆形遮罩
         * 使用 CSS mask 实现
         */
        '.mask-circle': {
          maskImage: 'radial-gradient(circle, black 60%, transparent 100%)',
        },
      }, ['responsive', 'hover']);
    },
  ],

  /**
   * ============================================
   * Core Plugins - 核心插件配置
   * ============================================
   * preflight: false - 禁用 Tailwind 默认样式重置
   *
   * 原因: Ant Design 等 UI 库已包含自己的重置样式
   *       开启会导致样式冲突（如按钮、输入框异常）
   *
   * 最佳实践: 始终禁用 preflight，除非你只用 Tailwind
   */
  corePlugins: {
    preflight: false,
  },
}
