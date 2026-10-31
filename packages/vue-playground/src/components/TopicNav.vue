<script setup lang="ts">
/**
 * ============================================================================
 * TopicNav — 多页专题页头互链横幅
 * ============================================================================
 *
 * 同一专题的多个页面(guide / playground / practice 等)页头互链,
 * 配色取注册表中所属分类的 banner 主题。当前页高亮,不可点击。
 *
 * @module components/TopicNav
 */

import { computed } from 'vue';
import { useRoute } from 'vue-router';
import type { CategoryKey } from '@/config/topics';
import { getCategoryMeta } from '@/config/topics';

const props = defineProps<{
    /** 所属分类,决定横幅配色 */
    category: CategoryKey;
    /** 互链条目,目录在各专题 nav.ts 中维护 */
    links: { path: string; title: string }[];
    /** 横幅右侧的附注(如「练习场不执行 Server Component」之类说明) */
    note?: string;
}>();

const route = useRoute();
const theme = computed(() => getCategoryMeta(props.category).theme.banner);
</script>

<template>
    <div
        class="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border px-4 py-3 text-sm"
        :class="[theme.border, theme.bg, theme.text]"
    >
        <span class="font-medium">本专题:</span>
        <template v-for="link in links" :key="link.path">
            <span v-if="link.path === route.path" class="font-semibold" aria-current="page">
                {{ link.title }}
            </span>
            <RouterLink v-else :to="link.path" class="underline-offset-2 hover:underline" :class="theme.linkHover">
                {{ link.title }}
            </RouterLink>
        </template>
        <span v-if="note" class="ml-auto text-xs opacity-70">{{ note }}</span>
    </div>
</template>
