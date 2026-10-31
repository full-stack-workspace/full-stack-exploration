<script setup lang="ts">
/**
 * ============================================================================
 * BrandMark — 品牌标识
 * ============================================================================
 *
 * 顶栏/页脚品牌区:绿色方块 Logo + 站点中英文名。
 * 品牌区不占用 h1(每页仅内容区一个 h1)。
 *
 * @module components/BrandMark
 */

import { SITE_NAME, SITE_NAME_EN } from '@/config/site';
</script>

<template>
    <RouterLink to="/" class="flex items-center gap-2.5">
        <span
            class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 text-base font-bold text-white"
            aria-hidden="true"
        >
            V
        </span>
        <span class="flex flex-col leading-tight">
            <span class="text-base font-semibold text-gray-900 dark:text-gray-100">
                {{ SITE_NAME }}
            </span>
            <span class="text-[11px] tracking-wide text-gray-400 dark:text-gray-500">
                {{ SITE_NAME_EN }}
            </span>
        </span>
    </RouterLink>
</template>
