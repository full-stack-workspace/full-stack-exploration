<script setup lang="ts">
/**
 * ============================================================================
 * 购物车 — /apps/shopping-cart
 * ============================================================================
 *
 * 综合应用:商品列表 + 搜索过滤 + 购物车明细与派生汇总。
 * 核心演示:总价/总数不存 state,一律 computed 派生。
 *
 * @module topics/apps/shopping-cart
 */

import { ElButton, ElEmpty, ElInput } from 'element-plus';
import TopicPage from '@/components/TopicPage.vue';
import TopicSection from '@/components/TopicSection.vue';
import { useCartStore } from './store';

const store = useCartStore();
</script>

<template>
    <TopicPage path="/apps/shopping-cart">
        <TopicSection title="商品与购物车" description="搜索过滤是 computed;购物车合计也是 computed——改任何一处,派生值自动跟上。">
            <div class="grid grid-cols-1 gap-6 lg:grid-cols-5">
                <!-- 商品列表 -->
                <div class="lg:col-span-3">
                    <ElInput v-model="store.keyword" placeholder="搜索商品名或分类" class="mb-3" clearable />
                    <ElEmpty v-if="store.filteredProducts.length === 0" description="没有匹配的商品" :image-size="60" />
                    <ul v-else class="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <li
                            v-for="p in store.filteredProducts"
                            :key="p.id"
                            class="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2.5 text-sm dark:border-gray-700"
                        >
                            <div>
                                <p class="font-medium">{{ p.name }}</p>
                                <p class="text-xs text-gray-400">{{ p.category }} · ¥{{ p.price }}</p>
                            </div>
                            <ElButton size="small" type="primary" plain @click="store.add(p.id)">加入</ElButton>
                        </li>
                    </ul>
                </div>

                <!-- 购物车 -->
                <div class="rounded-md border border-gray-200 p-4 lg:col-span-2 dark:border-gray-700">
                    <h3 class="mb-3 flex items-center justify-between text-sm font-semibold">
                        购物车
                        <button v-if="store.totalCount > 0" type="button" class="text-xs font-normal text-gray-400 underline" @click="store.clear">
                            清空
                        </button>
                    </h3>
                    <ElEmpty v-if="store.cartEntries.length === 0" description="购物车是空的" :image-size="60" />
                    <template v-else>
                        <ul class="space-y-2">
                            <li v-for="e in store.cartEntries" :key="e.product.id" class="flex items-center justify-between text-sm">
                                <span>{{ e.product.name }}</span>
                                <span class="flex items-center gap-2">
                                    <button type="button" class="h-5 w-5 rounded border border-gray-300 text-xs dark:border-gray-600" @click="store.removeOne(e.product.id)">−</button>
                                    <span class="w-4 text-center font-mono text-xs">{{ e.qty }}</span>
                                    <button type="button" class="h-5 w-5 rounded border border-gray-300 text-xs dark:border-gray-600" @click="store.add(e.product.id)">+</button>
                                    <span class="w-16 text-right font-mono text-xs text-gray-500">¥{{ e.qty * e.product.price }}</span>
                                </span>
                            </li>
                        </ul>
                        <div class="mt-4 border-t border-gray-100 pt-3 text-right text-sm dark:border-gray-800">
                            共 {{ store.totalCount }} 件 ·
                            <span class="font-semibold text-primary-600 dark:text-primary-400">¥{{ store.totalPrice }}</span>
                        </div>
                    </template>
                </div>
            </div>
        </TopicSection>
    </TopicPage>
</template>
