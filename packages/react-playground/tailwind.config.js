/** @type {import('tailwindcss').Config} */

/**
 * Tailwind 设计 token:品牌色阶 / 圆角 / 阴影层级
 * 与 App.tsx 中 antd ConfigProvider 的 theme.token 保持一致
 */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // 品牌色(indigo 系),与 antd colorPrimary #4f46e5 对齐
                primary: {
                    50: '#eef2ff',
                    100: '#e0e7ff',
                    200: '#c7d2fe',
                    300: '#a5b4fc',
                    400: '#818cf8',
                    500: '#6366f1',
                    600: '#4f46e5',
                    700: '#4338ca',
                },
            },
            borderRadius: {
                // 卡片统一圆角,与 antd borderRadius 对齐
                card: '0.5rem',
            },
            boxShadow: {
                card: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                'card-hover': '0 8px 24px -8px rgb(79 70 229 / 0.25)',
            },
        },
    },
    plugins: [],
}
