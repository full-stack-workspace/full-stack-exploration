<script setup lang="ts">
/**
 * ============================================================================
 * 事件与表单 — /basics/event-form
 * ============================================================================
 *
 * 覆盖:事件绑定与修饰符、v-model 家族(文本/勾选/选择/修饰符)、
 * 自定义组件 v-model(defineModel + 自定义修饰符),
 * 以及「受控」在 Vue 语境下的真实含义。
 *
 * @module topics/basics/event-form
 */

import { ref } from 'vue';
import CodeBlock from '@/components/CodeBlock.vue';
import TopicPage from '@/components/TopicPage.vue';
import TopicSection from '@/components/TopicSection.vue';
import FancyInput from './FancyInput.vue';

/* ---- 事件与修饰符 ---- */
const eventLog = ref<string[]>([]);
const log = (msg: string) => {
    // 只保留最近 6 条,避免面板无限增长
    eventLog.value = [`${new Date().toLocaleTimeString()} ${msg}`, ...eventLog.value].slice(0, 6);
};

/* ---- v-model 家族 ---- */
const text = ref('');
const lazyText = ref('');
const trimmed = ref('');
const num = ref(0);
const agreed = ref(false);
const picked = ref('a');

/* ---- 自定义组件 v-model ---- */
const shouting = ref('');

// 代码样例放在 script 里,避免模板属性值中的引号转义问题
const defineModelSnippet = `<!-- 父组件 -->
<FancyInput v-model.uppercase="shouting" />

// 子组件 <script setup>:解构 defineModel 第二位拿到修饰符集合
const [model, modifiers] = defineModel()
if (modifiers.uppercase) value = value.toUpperCase()`;
</script>

<template>
    <TopicPage path="/basics/event-form">
        <TopicSection
            title="事件绑定与修饰符"
            description="@ 是 v-on 的缩写。修饰符把常见的 DOM 事件样板(stop/prevent/self/按键)声明在模板里,事件处理器只关心业务。"
        >
            <div
                class="cursor-pointer rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700"
                @click="log('外层 div 收到点击')"
            >
                外层容器(点我会记录)
                <div class="mt-2 flex flex-wrap gap-2">
                    <button type="button" class="rounded-md border border-gray-300 px-3 py-1 text-xs dark:border-gray-600" @click="log('普通按钮:冒泡到外层')">
                        普通按钮(冒泡)
                    </button>
                    <button type="button" class="rounded-md border border-gray-300 px-3 py-1 text-xs dark:border-gray-600" @click.stop="log('stop 按钮:不冒泡')">
                        .stop(不冒泡)
                    </button>
                    <button type="button" class="rounded-md border border-gray-300 px-3 py-1 text-xs dark:border-gray-600" @click.self="log('self 按钮:只有点自己才触发')">
                        .self
                    </button>
                    <a href="https://vuejs.org" class="rounded-md border border-gray-300 px-3 py-1 text-xs text-primary-600 dark:border-gray-600" @click.prevent="log('prevent:拦截了跳转')">
                        .prevent(拦截链接)
                    </a>
                </div>
            </div>
            <div class="mt-3 rounded-md bg-gray-50 p-3 font-mono text-xs leading-relaxed text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                <p v-if="eventLog.length === 0">事件日志(点击上方按钮)</p>
                <p v-for="(line, i) in eventLog" :key="i">{{ line }}</p>
            </div>
        </TopicSection>

        <TopicSection
            title="v-model 家族:双向绑定语法糖"
            description="v-model = :value + @input 的语法糖(组件上是 modelValue + update:modelValue)。修饰符改变同步时机与值的处理:.lazy 改到 change 才同步,.trim 去首尾空白,.number 转数值。"
        >
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div class="space-y-3 text-sm">
                    <label class="block">
                        <span class="text-xs text-gray-400">默认(每次 input 同步)</span>
                        <input v-model="text" class="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 dark:border-gray-700 dark:bg-gray-800" />
                    </label>
                    <label class="block">
                        <span class="text-xs text-gray-400">.lazy(失焦/回车才同步)</span>
                        <input v-model.lazy="lazyText" class="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 dark:border-gray-700 dark:bg-gray-800" />
                    </label>
                    <label class="block">
                        <span class="text-xs text-gray-400">.trim(去首尾空白)</span>
                        <input v-model.trim="trimmed" class="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 dark:border-gray-700 dark:bg-gray-800" />
                    </label>
                    <label class="block">
                        <span class="text-xs text-gray-400">.number(值为 number 类型)</span>
                        <input v-model.number="num" type="number" class="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 dark:border-gray-700 dark:bg-gray-800" />
                    </label>
                </div>
                <div class="rounded-md bg-gray-50 p-3 font-mono text-xs leading-loose dark:bg-gray-800">
                    <p>text = {{ JSON.stringify(text) }}</p>
                    <p>lazyText = {{ JSON.stringify(lazyText) }}</p>
                    <p>trimmed = {{ JSON.stringify(trimmed) }}</p>
                    <p>num = {{ JSON.stringify(num) }} ({{ typeof num }})</p>
                </div>
            </div>
            <div class="mt-4 flex flex-wrap items-center gap-6 text-sm">
                <label class="flex items-center gap-2">
                    <input v-model="agreed" type="checkbox" class="accent-primary-600" />
                    同意条款(checkbox → boolean):<span class="font-mono text-xs">{{ agreed }}</span>
                </label>
                <label class="flex items-center gap-2">
                    选择:
                    <select v-model="picked" class="rounded-md border border-gray-300 px-2 py-1 dark:border-gray-700 dark:bg-gray-800">
                        <option value="a">选项 A</option>
                        <option value="b">选项 B</option>
                    </select>
                    <span class="font-mono text-xs">{{ picked }}</span>
                </label>
            </div>
        </TopicSection>

        <TopicSection
            title="自定义组件 v-model:defineModel"
            description="Vue 3.4+ 的 defineModel 让自定义组件支持 v-model,还能声明自定义修饰符。下面的 FancyInput 使用 uppercase 修饰符:输入自动转大写。"
        >
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FancyInput v-model.uppercase="shouting" />
                <p class="rounded-md bg-gray-50 p-3 font-mono text-xs dark:bg-gray-800">shouting = {{ JSON.stringify(shouting) }}</p>
            </div>
            <CodeBlock class="mt-4" lang="vue" :code="defineModelSnippet" />
        </TopicSection>

        <TopicSection
            title="「受控」在 Vue 语境下的含义"
            description="React 反复强调受控组件;Vue 里 v-model 天然是受控的——值永远以响应式状态为准,DOM 只是投影。真正需要警惕的是反模式:"
        >
            <ul class="list-inside list-disc space-y-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                <li>用 ref 直接读写 DOM input 的 value,绕开响应式状态——值会漂移,reset 困难。</li>
                <li>子组件内部直接改 props(单向数据流破坏);正确做法是 emit 事件或 defineModel。</li>
                <li>同一字段多处 v-model 到不同源——收敛到一个状态源,其余用 computed 派生。</li>
            </ul>
        </TopicSection>
    </TopicPage>
</template>
