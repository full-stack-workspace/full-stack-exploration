<script setup lang="ts">
/**
 * ============================================================================
 * 记账本 — /apps/bookkeeping
 * ============================================================================
 *
 * 综合应用:ElForm 校验(金额必填且为正数)、大类→子类二级联动、
 * 汇总统计(收支/结余/分类占比)与 ElTable 明细。
 *
 * @module topics/apps/bookkeeping
 */

import { ElButton, ElForm, ElFormItem, ElInput, ElInputNumber, ElOption, ElRadioButton, ElRadioGroup, ElSelect, ElTable, ElTableColumn } from 'element-plus';
import { computed, reactive, ref } from 'vue';
import TopicPage from '@/components/TopicPage.vue';
import TopicSection from '@/components/TopicSection.vue';
import { CATEGORY_MAP, useBookkeepingStore } from './store';

const store = useBookkeepingStore();

/* ---- 表单(局部草稿态 + 校验规则) ---- */
const form = reactive({
    type: 'expense' as 'expense' | 'income',
    category: '',
    sub: '',
    amount: undefined as number | undefined,
    note: '',
});
const formRef = ref<InstanceType<typeof ElForm>>();
const rules = {
    category: [{ required: true, message: '请选择分类', trigger: 'change' }],
    amount: [
        { required: true, message: '请输入金额', trigger: 'blur' },
        { type: 'number' as const, min: 0.01, message: '金额必须大于 0', trigger: 'blur' },
    ],
};

/** 二级联动:子类选项跟随大类 */
const subOptions = computed(() => CATEGORY_MAP[form.category] ?? []);

const submit = async () => {
    await formRef.value?.validate();
    store.add({
        type: form.type,
        category: form.category,
        sub: form.sub || subOptions.value[0] || '-',
        amount: form.amount!,
        note: form.note,
        date: new Date().toLocaleDateString(),
    });
    formRef.value?.resetFields();
};
</script>

<template>
    <TopicPage path="/apps/bookkeeping">
        <TopicSection title="记一笔" description="分类二级联动 + ElForm 校验;提交即入 store 并持久化。">
            <ElForm ref="formRef" :model="form" :rules="rules" class="flex flex-wrap items-end gap-3" @submit.prevent="submit">
                <ElFormItem label="类型" prop="type">
                    <ElRadioGroup v-model="form.type">
                        <ElRadioButton value="expense">支出</ElRadioButton>
                        <ElRadioButton value="income">收入</ElRadioButton>
                    </ElRadioGroup>
                </ElFormItem>
                <ElFormItem label="分类" prop="category">
                    <ElSelect v-model="form.category" class="!w-28" placeholder="大类" @change="form.sub = ''">
                        <ElOption v-for="c in Object.keys(CATEGORY_MAP)" :key="c" :label="c" :value="c" />
                    </ElSelect>
                </ElFormItem>
                <ElFormItem label="子类" prop="sub">
                    <ElSelect v-model="form.sub" class="!w-32" placeholder="先选大类" :disabled="subOptions.length === 0">
                        <ElOption v-for="s in subOptions" :key="s" :label="s" :value="s" />
                    </ElSelect>
                </ElFormItem>
                <ElFormItem label="金额" prop="amount">
                    <ElInputNumber v-model="form.amount" :min="0" :precision="2" class="!w-32" />
                </ElFormItem>
                <ElFormItem label="备注" prop="note">
                    <ElInput v-model="form.note" class="!w-40" placeholder="可选" />
                </ElFormItem>
                <ElFormItem>
                    <ElButton type="primary" native-type="submit">记录</ElButton>
                </ElFormItem>
            </ElForm>
        </TopicSection>

        <TopicSection title="汇总" description="结余 = 收入 − 支出;分类汇总只统计支出,按金额降序。">
            <div class="mb-4 grid grid-cols-3 gap-3 text-center">
                <div class="rounded-lg bg-gray-50 py-3 dark:bg-gray-800">
                    <p class="text-xs text-gray-400">收入</p>
                    <p class="font-mono text-lg font-semibold text-primary-600 dark:text-primary-400">¥{{ store.totalIncome.toFixed(2) }}</p>
                </div>
                <div class="rounded-lg bg-gray-50 py-3 dark:bg-gray-800">
                    <p class="text-xs text-gray-400">支出</p>
                    <p class="font-mono text-lg font-semibold text-red-500">¥{{ store.totalExpense.toFixed(2) }}</p>
                </div>
                <div class="rounded-lg bg-gray-50 py-3 dark:bg-gray-800">
                    <p class="text-xs text-gray-400">结余</p>
                    <p class="font-mono text-lg font-semibold" :class="store.balance >= 0 ? 'text-primary-600 dark:text-primary-400' : 'text-red-500'">
                        ¥{{ store.balance.toFixed(2) }}
                    </p>
                </div>
            </div>
            <div class="grid grid-cols-1 gap-3 lg:grid-cols-3">
                <div class="rounded-md border border-gray-200 p-3 dark:border-gray-700">
                    <p class="mb-2 text-xs font-medium text-gray-400">支出分类汇总</p>
                    <p v-if="store.byCategory.length === 0" class="text-xs text-gray-400">暂无支出</p>
                    <p v-for="c in store.byCategory" :key="c.category" class="flex justify-between py-0.5 text-sm">
                        <span>{{ c.category }}</span>
                        <span class="font-mono text-xs text-gray-500">¥{{ c.amount.toFixed(2) }}</span>
                    </p>
                </div>
                <div class="lg:col-span-2">
                    <ElTable :data="store.entries" size="small" max-height="280" empty-text="暂无账目,从上方记一笔">
                        <ElTableColumn prop="date" label="日期" width="100" />
                        <ElTableColumn label="类型" width="70">
                            <template #default="{ row }">
                                <span :class="row.type === 'income' ? 'text-primary-600 dark:text-primary-400' : 'text-red-500'">
                                    {{ row.type === 'income' ? '收入' : '支出' }}
                                </span>
                            </template>
                        </ElTableColumn>
                        <ElTableColumn label="分类" width="130">
                            <template #default="{ row }">{{ row.category }} / {{ row.sub }}</template>
                        </ElTableColumn>
                        <ElTableColumn prop="note" label="备注" min-width="100" show-overflow-tooltip />
                        <ElTableColumn label="金额" width="100" align="right">
                            <template #default="{ row }">¥{{ row.amount.toFixed(2) }}</template>
                        </ElTableColumn>
                        <ElTableColumn label="" width="60" align="center">
                            <template #default="{ row }">
                                <button type="button" class="text-xs text-gray-300 hover:text-red-500" aria-label="删除" @click="store.remove(row.id)">✕</button>
                            </template>
                        </ElTableColumn>
                    </ElTable>
                </div>
            </div>
        </TopicSection>
    </TopicPage>
</template>
