/**
 * ============================================================================
 * workspace — 跨 store 组合演示
 * ============================================================================
 *
 * store-design 专题的演示:workspace store 组合 counter 与 preferences,
 * 演示「store 之间可以互相引用,但引用方向必须单向分层」。
 *
 * @module stores/workspace
 */

import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { useCounterStore } from './counter';
import { usePreferencesStore } from './preferences';

export const useWorkspaceStore = defineStore('workspace', () => {
    // 组合下层 store:workspace 依赖 counter/preferences,反之不可
    const counter = useCounterStore();
    const preferences = usePreferencesStore();

    const label = ref('默认工作区');

    /** 跨 store 派生:摘要同时读两个下层 store */
    const summary = computed(
        () => `${label.value} · 计数 ${counter.count} · 密度 ${preferences.density}`,
    );

    const rename = (name: string) => (label.value = name);

    return { label, summary, rename };
});
