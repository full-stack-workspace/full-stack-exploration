import { useState } from 'react'
import { Button, Card, Typography, Input, Switch, Space } from 'antd'
import { PlusOutlined, MinusOutlined, ReloadOutlined } from '@ant-design/icons'
import { useCounterStore } from '@/store'
import { useDebounce, useToggle } from '@/hooks'

const { Title, Paragraph, Text } = Typography

/**
 * ============================================
 * Tailwind + Design Tokens 演示页面
 * ============================================
 *
 * 本文件展示基于 Design Tokens 架构的 Tailwind 使用方式。
 *
 * 数据流:
 * ┌─────────────────────────────────────────────────────┐
 * │  tokens.css (CSS 自定义属性)                        │
 * │  --color-brand-500: #0ea5e9                        │
 * │  --spacing-18: 4.5rem                              │
 * └─────────────────────────────────────────────────────┘
 *                          ↓ 被 tailwind.config.js 引用
 * ┌─────────────────────────────────────────────────────┐
 * │  tailwind.config.js                                │
 * │  colors: { brand: { 500: 'var(--color-brand-500)' }}│
 * └─────────────────────────────────────────────────────┘
 *                          ↓ 生成 CSS
 * ┌─────────────────────────────────────────────────────┐
 * │  .bg-brand-500 { background-color: #0ea5e9; }     │
 * └─────────────────────────────────────────────────────┘
 *
 * 开发体验: 仍然使用 Tailwind 类名 (bg-brand-500)
 * 架构优势: 单一数据源，主题切换，运行时可修改
 */

export default function HomeView() {
  const { count, increment, decrement, reset } = useCounterStore()
  const { value: isDark, toggle: toggleTheme } = useToggle(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)

  return (
    <div className="home p-6">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>

        {/**
         * =============================================
         * 演示 1: card-demo 组件类
         * =============================================
         * card-demo: 在 tailwind.config.js plugins.addComponents 中定义
         * 引用 CSS 变量: --card-border-radius, --card-padding, --card-shadow
         *
         * CSS 变量定义在 tokens.css 组件变量区域
         */}
        <Card className="card-demo">
          {/**
           * =============================================
           * 演示 2: text-gradient + font-display
           * =============================================
           * text-gradient: 在 plugins.addUtilities 中定义
           * 使用 CSS 变量: var(--color-brand-500)
           *
           * font-display: 引用 var(--font-display)
           * 定义在 tokens.css 的 --font-display
           */}
          <Title level={2} className="text-gradient font-display">
            Design Tokens Demo
          </Title>
          <Paragraph>
            Explore Tailwind + CSS Variables + Design Tokens architecture!
          </Paragraph>
        </Card>

        {/**
         * =============================================
         * 演示 3: 自定义颜色 brand-500/600, accent/accent-light
         * =============================================
         * 所有颜色通过 CSS 变量引用:
         * - bg-brand-500 → var(--color-brand-500) → var(--color-sky-500)
         * - bg-accent → var(--color-accent) → var(--color-amber-600)
         *
         * 三层层级:
         * 1. Semantic (品牌色) → 2. Primitive (原始色) → 3. HSL 值
         */}
        <Card title="Colors (CSS Variables)" className="card-demo">
          <Space wrap>
            {/**
             * CSS 变量来源: tokens.css
             * --color-brand-500 → var(--color-sky-500) → #0ea5e9
             */}
            <div className="w-18 h-18 rounded-4xl bg-brand-500 shadow-card flex center-flex">
              <span className="text-white font-bold">brand-500</span>
            </div>
            <div className="w-18 h-18 rounded-4xl bg-brand-600 shadow-card flex center-flex">
              <span className="text-white font-bold">brand-600</span>
            </div>
            <div className="w-18 h-18 rounded-4xl bg-accent shadow-card flex center-flex">
              <span className="text-white font-bold">accent</span>
            </div>
            <div className="w-18 h-18 rounded-4xl bg-accent-light shadow-card flex center-flex">
              <span className="text-white font-bold">accent-light</span>
            </div>
          </Space>
        </Card>

        {/**
         * =============================================
         * 演示 4: 自定义 spacing-22 + rounded-4xl + shadow-inner-lg
         * =============================================
         * CSS 变量来源: tokens.css
         * - --spacing-22: 5.5rem
         * - --radius-4xl: 2rem
         * - --shadow-inner-lg: inset 0 2px 4px 0 rgb(0 0 0 / 0.05)
         */}
        <Card title="Spacing & Radius & Shadow" className="card-demo">
          <Space direction="vertical">
            <div className="bg-brand-300 rounded-4xl p-22 text-center shadow-inner-lg">
              <Text className="text-gradient font-display font-bold">
                p-22 + rounded-4xl + shadow-inner-lg
              </Text>
            </div>
          </Space>
        </Card>

        {/**
         * =============================================
         * 演示 5: 自定义动画 animate-fade-in/slide-up/pulse-slow/bounce-slow
         * =============================================
         * CSS 变量来源: tokens.css
         * - --duration-fade: 500ms
         * - --duration-slow: 300ms
         * - --duration-pulse-slow: 3s
         * - --duration-bounce-slow: 2s
         * - --ease-default: cubic-bezier(0.4, 0, 0.2, 1)
         *
         * Tailwind 配置文件引用这些变量，生成最终的 animation 类
         */}
        <Card title="Animations (CSS Variables)" className="card-demo">
          <Space wrap>
            <div className="w-32 h-32 bg-brand-400 rounded-xl animate-fade-in shadow-inner-lg center-flex">
              <span className="text-white text-2xs">fade-in</span>
            </div>
            <div className="w-32 h-32 bg-brand-500 rounded-xl animate-slide-up shadow-inner-lg center-flex">
              <span className="text-white text-2xs">slide-up</span>
            </div>
            <div className="w-32 h-32 bg-accent rounded-xl animate-pulse-slow shadow-inner-lg center-flex">
              <span className="text-white text-2xs">pulse-slow</span>
            </div>
            <div className="w-32 h-32 bg-brand-700 rounded-xl animate-bounce-slow shadow-inner-lg center-flex">
              <span className="text-white text-2xs">bounce-slow</span>
            </div>
          </Space>
        </Card>

        {/**
         * =============================================
         * 演示 6: @apply 风格的组件类 (btn, btn-primary)
         * =============================================
         * 组件类通过 plugins.addComponents 定义
         * 内部引用 CSS 变量:
         * - --button-font-weight
         * - --duration-normal
         * - --color-brand-500
         *
         * 使用 @apply 可以在普通 CSS 中使用这些组件类
         */}
        <Card title="Component Classes (btn, btn-primary)" className="card-demo">
          <Space wrap>
            <button className="btn bg-gray-100 hover:bg-gray-200 shadow-inner-lg">
              Default Btn
            </button>
            <button className="btn btn-primary shadow-card-hover">
              Primary Btn
            </button>
          </Space>
        </Card>

        {/**
         * =============================================
         * 演示 7: 自定义工具类 (text-gradient, glass, mask-circle)
         * =============================================
         * 这些工具类通过 plugins.addUtilities 定义
         *
         * .text-gradient: 引用 var(--color-brand-500)
         * .glass: 引用 --glass-bg, --glass-blur, --glass-border
         * .mask-circle: 使用 CSS mask-image 技术
         */}
        <Card title="Utility Classes" className="card-demo">
          <Space direction="vertical" size="middle">
            <Paragraph className="text-7xl font-display text-gradient m-0">
              Gradient Text
            </Paragraph>

            <div className="glass rounded-xl p-6 center-flex">
              <Text className="text-white">Glass Effect</Text>
            </div>

            <div className="w-48 h-48 bg-gradient-to-br from-brand-400 to-accent center-flex mask-circle">
              <Text className="text-white font-bold">Circle Mask</Text>
            </div>
          </Space>
        </Card>

        {/**
         * =============================================
         * 演示 8: 自定义字体 font-display + font-mono
         * =============================================
         * CSS 变量来源: tokens.css
         * - --font-display: 'Poppins', sans-serif
         * - --font-mono: 'Fira Code', monospace
         */}
        <Card title="Font Families" className="card-demo">
          <Space direction="vertical">
            <Text className="font-display text-7xl">Poppins Display</Text>
            <Text className="font-mono text-brand-600">Fira Code Mono</Text>
          </Space>
        </Card>

        {/**
         * =============================================
         * 演示 9: 主题切换 (Theme Switching)
         * =============================================
         * 通过切换 data-theme 属性实现暗色主题
         * 主题变量覆盖定义在 tokens.css 的 [data-theme="dark"]
         *
         * 使用方式:
         * document.documentElement.setAttribute('data-theme', 'dark')
         */}
        <Card title="Theme Switching (data-theme)" className="card-demo">
          <Space direction="vertical">
            <Space>
              <Text>Dark Mode:</Text>
              <Switch checked={isDark} onChange={toggleTheme} />
            </Space>
            <Paragraph style={{ marginTop: '10px' }}>
              {isDark ? 'Dark theme enabled (data-theme="dark")' : 'Light theme (data-theme="light")'}
            </Paragraph>
          </Space>
        </Card>

        {/**
         * =============================================
         * 原有功能演示 (Zustand Counter / Debounce / Toggle)
         * =============================================
         */}
        <Card title="Zustand Counter" className="card-demo">
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={increment}
            >
              Increment
            </Button>
            <Button icon={<MinusOutlined />} onClick={decrement}>
              Decrement
            </Button>
            <Button icon={<ReloadOutlined />} onClick={reset}>
              Reset
            </Button>
          </Space>
          <Title level={3} style={{ marginTop: '20px' }}>
            Count: {count}
          </Title>
        </Card>

        <Card title="Debounce Example" className="card-demo">
          <Input
            placeholder="Type something..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ marginBottom: '10px' }}
          />
          <Text>Debounced value: {debouncedSearch}</Text>
        </Card>

        <Card title="Toggle Example" className="card-demo">
          <Space>
            <Text>Dark Mode:</Text>
            <Switch checked={isDark} onChange={toggleTheme} />
          </Space>
          <Paragraph style={{ marginTop: '10px' }}>
            Dark mode is {isDark ? 'enabled' : 'disabled'}
          </Paragraph>
        </Card>

      </Space>
    </div>
  )
}
