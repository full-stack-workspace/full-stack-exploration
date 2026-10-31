/**
 * ============================================================================
 * useDark — 暗色模式 composable
 * ============================================================================
 *
 * class 策略:在 <html> 上挂/摘 .dark,与 index.css 的
 * @custom-variant dark 及 index.html 内联防闪烁脚本配套。
 * 判定顺序:localStorage → prefers-color-scheme。
 *
 * 模块级单例 ref,全站共享同一份状态。
 *
 * @module composables/useDark
 */

import { ref, watch } from 'vue';

const STORAGE_KEY = 'vue-playground-theme';

const getInitialDark = (): boolean => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark') {return true;}
    if (stored === 'light') {return false;}
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

/** 模块级单例:全站共享暗色状态 */
const isDark = ref(getInitialDark());

watch(isDark, (dark) => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
});

export function useDark() {
    const toggleDark = () => {
        isDark.value = !isDark.value;
    };
    return { isDark, toggleDark };
}
