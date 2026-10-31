/**
 * ============================================================================
 * preferences — 持久化偏好 store
 * ============================================================================
 *
 * 状态管理分类「持久化」专题的演示 store:
 * setup 风格 store 直接复用 useLocalStorage 组合式函数,
 * 每个字段独立持久化,无需引入 pinia-plugin-persistedstate。
 * 这也是「Pinia 与 composable 天然可组合」的实证。
 *
 * @module stores/preferences
 */

import { defineStore } from 'pinia';

import { useLocalStorage } from '@/composables/lib';

export const usePreferencesStore = defineStore('preferences', () => {
    /** 列表密度:紧凑 / 舒适 */
    const density = useLocalStorage<'compact' | 'cozy'>('vue-pg-density', 'cozy');
    /** 是否在每个专题卡片显示描述 */
    const showDescription = useLocalStorage('vue-pg-show-desc', true);

    const $resetPreferences = () => {
        density.value = 'cozy';
        showDescription.value = true;
    };

    return { density, showDescription, $resetPreferences };
});
