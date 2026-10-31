<script setup lang="ts">
/**
 * ============================================================================
 * 模板语法与渲染 — /basics/template-render
 * ============================================================================
 *
 * 覆盖:插值与表达式边界、v-if vs v-show 对照、v-for 与 key 的身份实验,
 * 以及生产里的渲染范式(四态/权限/配置驱动)。
 *
 * @module topics/basics/template-render
 */

import { computed, ref } from 'vue';
import CodeBlock from '@/components/CodeBlock.vue';
import TopicPage from '@/components/TopicPage.vue';
import TopicSection from '@/components/TopicSection.vue';
import TemplateRenderProbe from './TemplateRenderProbe.vue';

/* ---- 插值与表达式 ---- */
const name = ref('Vue 权衡录');
const count = ref(3);
// 插值里只能放表达式,不能放语句(if/for 都不行)
const shout = computed(() => `${name.value.toUpperCase()} × ${count.value + 1}`);

/* ---- v-if vs v-show ---- */
const visible = ref(true);
// 用渲染计数对比二者:v-if 切换会重建子树,v-show 只切 display
const ifRenderCount = ref(0);
const showRenderCount = ref(0);

/* ---- v-for 与 key 身份实验 ---- */
interface Row {
    id: number;
    label: string;
}
let nextId = 4;
const rows = ref<Row[]>([
    { id: 1, label: '第一行' },
    { id: 2, label: '第二行' },
    { id: 3, label: '第三行' },
]);
const prepend = () => {
    rows.value.unshift({ id: nextId++, label: `新行 #${nextId - 1}` });
};
const shuffle = () => {
    rows.value = [...rows.value].sort(() => Math.random() - 0.5);
};
</script>

<template>
    <TopicPage path="/basics/template-render">
        <TopicSection
            title="插值与表达式:模板里能写什么"
            description="{{ }} 与指令绑定的值都只能是「表达式」——有返回值的一行求值;语句(if/for/赋值)进不了模板。复杂逻辑下沉到 computed。"
        >
            <div class="mb-4 flex flex-wrap items-center gap-3 text-sm">
                <label class="flex items-center gap-2">
                    名字
                    <input v-model="name" class="rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800" />
                </label>
                <label class="flex items-center gap-2">
                    数量
                    <input v-model.number="count" type="number" class="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800" />
                </label>
            </div>
            <p class="rounded-md bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800">
                渲染结果:<span class="font-mono text-primary-600 dark:text-primary-400">{{ shout }}</span>
            </p>
            <CodeBlock
                class="mt-4"
                lang="vue"
                :code="`<p>{{ name.toUpperCase() + ' × ' + (count + 1) }}</p>  <!-- 可以:表达式 -->
<p>{{ if (ok) 'yes' }}</p>                       <!-- 编译错误:语句 -->
<p>{{ list.forEach(...) }}</p>                   <!-- 可以但没意义:forEach 返回 undefined -->`"
            />
        </TopicSection>

        <TopicSection
            title="v-if vs v-show:销毀重建 vs 切换 display"
            description="v-if 是「真实」的条件渲染:切换时子树销毁/重建,组件状态随之重置;v-show 始终渲染,只切 CSS display。频繁切换用 v-show,条件很少变用 v-if。下方计数器状态可用于观察差异。"
        >
            <div class="mb-3 flex items-center gap-3">
                <button
                    type="button"
                    class="rounded-md bg-primary-600 px-3 py-1.5 text-sm text-white hover:bg-primary-700"
                    @click="visible = !visible"
                >
                    切换可见性(当前 {{ visible ? '显示' : '隐藏' }})
                </button>
            </div>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <h3 class="mb-2 text-sm font-semibold">v-if</h3>
                    <TemplateRenderProbe v-if="visible" label="v-if 面板" @rendered="ifRenderCount++" />
                    <p class="mt-2 text-xs text-gray-400">子树已重建 {{ ifRenderCount }} 次(隐藏时组件不存在)</p>
                </div>
                <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <h3 class="mb-2 text-sm font-semibold">v-show</h3>
                    <TemplateRenderProbe v-show="visible" label="v-show 面板" @rendered="showRenderCount++" />
                    <p class="mt-2 text-xs text-gray-400">子树已重建 {{ showRenderCount }} 次(始终只挂载一次)</p>
                </div>
            </div>
        </TopicSection>

        <TopicSection
            title="v-for 与 key:key 决定 Diff 身份"
            description="key 是 Vue 复用 DOM 节点的依据。用「就地复用」(无 key)时,行内 input 的输入状态会跟着位置走而不是跟着数据走——在下面两列的输入框里写点字,再点「头部插入」对比。"
        >
            <div class="mb-3 flex items-center gap-3">
                <button type="button" class="rounded-md bg-primary-600 px-3 py-1.5 text-sm text-white hover:bg-primary-700" @click="prepend">
                    头部插入一行
                </button>
                <button type="button" class="rounded-md border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600" @click="shuffle">
                    随机打乱
                </button>
            </div>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div class="rounded-lg border border-red-200 p-4 dark:border-red-900">
                    <h3 class="mb-2 text-sm font-semibold text-red-600 dark:text-red-400">无 key(就地复用)</h3>
                    <!-- eslint-disable-next-line vue/require-v-for-key -- 教学演示:故意不加 key 展示就地复用的坑 -->
                    <div v-for="row in rows" class="mb-2 flex items-center gap-2 text-sm">
                        <span class="w-16 shrink-0 text-gray-500">{{ row.label }}</span>
                        <input class="w-full rounded-md border border-gray-300 px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-800" placeholder="写点字再插入/打乱" />
                    </div>
                </div>
                <div class="rounded-lg border border-primary-200 p-4 dark:border-primary-900">
                    <h3 class="mb-2 text-sm font-semibold text-primary-600 dark:text-primary-400">有 key(身份跟随数据)</h3>
                    <div v-for="row in rows" :key="row.id" class="mb-2 flex items-center gap-2 text-sm">
                        <span class="w-16 shrink-0 text-gray-500">{{ row.label }}</span>
                        <input class="w-full rounded-md border border-gray-300 px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-800" placeholder="写点字再插入/打乱" />
                    </div>
                </div>
            </div>
            <p class="mt-3 text-xs leading-relaxed text-gray-400">
                三条规则:key 必须稳定唯一(用数据 id,不用 index);key 变化 = 销毁重建,可用来强制重置组件状态;不要在渲染期生成 key(Math.random()),等于每个渲染都换身份。
            </p>
        </TopicSection>

        <TopicSection
            title="生产渲染范式"
            description="真实业务里模板不只是 if/for,三种常见范式值得刻意练习。"
        >
            <ul class="list-inside list-disc space-y-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                <li><strong>四态渲染</strong>:任何异步区块都显式处理 loading / error / empty / success 四态,而不是只写成功路径。</li>
                <li><strong>权限渲染</strong>:权限判断收敛成 v-permission 自定义指令或 can() 组合式函数,模板里不出现散落的角色判断表达式。</li>
                <li><strong>配置驱动</strong>:表单/表格/菜单等重复结构用配置数组 + v-for 渲染,新增字段改配置不改模板。</li>
            </ul>
        </TopicSection>
    </TopicPage>
</template>
