<script setup lang="ts">
/**
 * ============================================================================
 * ref vs reactive — /reactivity/ref-vs-reactive
 * ============================================================================
 *
 * 响应式分类开篇:两种声明方式的能力差异对照实验——
 * 解构丢失响应式、整体替换、模板自动解包,最后给出团队约定。
 *
 * @module topics/reactivity/ref-vs-reactive
 */

import { reactive, ref, toRef } from 'vue';
import TopicPage from '@/components/TopicPage.vue';
import TopicSection from '@/components/TopicSection.vue';

/* ---- reactive 侧(示例状态) ---- */
const state = reactive({ count: 0, label: 'reactive 对象' });

/* ---- 解构实验 ---- */
// 直接解构:拿到的是普通 number,响应式断开
const { count: destructured } = state;
// toRef:为单个属性建立响应式引用
const countRef = toRef(state, 'count');
const destructuredDemo = ref(destructured);

/* ---- 整体替换实验 ---- */
// ref 可以整体替换;reactive 不能(重新赋值会丢失响应式代理)
const refUser = ref({ name: '张三', age: 18 });
const replaceRefUser = () => {
    refUser.value = { name: '李四', age: 20 };
};
const reactiveUser = reactive({ name: '张三', age: 18 });
const patchReactiveUser = () => {
    // reactive 只能原地改字段,不能 state = {...}
    Object.assign(reactiveUser, { name: '李四', age: 20 });
};
</script>

<template>
    <TopicPage path="/reactivity/ref-vs-reactive">
        <TopicSection
            title="能力对照:一张表先看结论"
            description="两者都是响应式包装,但能力边界不同——这决定了「默认 ref」的社区共识。"
        >
            <div class="overflow-x-auto">
                <table class="w-full min-w-[560px] border-collapse text-sm">
                    <thead>
                        <tr class="border-b border-gray-200 text-left text-xs text-gray-400 dark:border-gray-700">
                            <th class="py-2 pr-4 font-medium">能力</th>
                            <th class="py-2 pr-4 font-medium">ref</th>
                            <th class="py-2 font-medium">reactive</th>
                        </tr>
                    </thead>
                    <tbody class="text-gray-600 dark:text-gray-300">
                        <tr class="border-b border-gray-100 dark:border-gray-800">
                            <td class="py-2 pr-4">持有原始值(number/string/boolean)</td>
                            <td class="py-2 pr-4 text-primary-600 dark:text-primary-400">✅ 可以</td>
                            <td class="py-2">❌ 只接受对象</td>
                        </tr>
                        <tr class="border-b border-gray-100 dark:border-gray-800">
                            <td class="py-2 pr-4">JS 中访问</td>
                            <td class="py-2 pr-4">需要 .value</td>
                            <td class="py-2">直接访问属性</td>
                        </tr>
                        <tr class="border-b border-gray-100 dark:border-gray-800">
                            <td class="py-2 pr-4">模板中访问</td>
                            <td class="py-2 pr-4">自动解包,无需 .value</td>
                            <td class="py-2">直接访问属性</td>
                        </tr>
                        <tr class="border-b border-gray-100 dark:border-gray-800">
                            <td class="py-2 pr-4">整体替换(重新赋值)</td>
                            <td class="py-2 pr-4 text-primary-600 dark:text-primary-400">✅ ref.value = 新值</td>
                            <td class="py-2 text-red-500">❌ 替换即断开响应式</td>
                        </tr>
                        <tr class="border-b border-gray-100 dark:border-gray-800">
                            <td class="py-2 pr-4">解构后仍响应</td>
                            <td class="py-2 pr-4 text-primary-600 dark:text-primary-400">✅ ref 本身可传递</td>
                            <td class="py-2 text-red-500">❌ 解构出普通值(需 toRef)</td>
                        </tr>
                        <tr>
                            <td class="py-2 pr-4">TS 类型推断</td>
                            <td class="py-2 pr-4">Ref&lt;T&gt;,形状稳定</td>
                            <td class="py-2">原地推断,深层嵌套类型易变形</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </TopicSection>

        <TopicSection
            title="实验一:解构 — reactive 的暗坑"
            description="点 +1 改的是同一个 state.count,但只有 toRef 建立的引用跟着变;直接解构出的副本永远停在初始值。"
        >
            <div class="flex flex-wrap items-center gap-4 text-sm">
                <button type="button" class="rounded-md bg-primary-600 px-3 py-1.5 text-white hover:bg-primary-700" @click="state.count++">
                    state.count +1
                </button>
                <div class="rounded-md bg-gray-50 px-3 py-2 font-mono text-xs leading-loose dark:bg-gray-800">
                    <p>state.count = {{ state.count }} <span class="text-gray-400">← 源</span></p>
                    <p>toRef 引用 = {{ countRef }} <span class="text-primary-500">← 跟着变</span></p>
                    <p>
                        直接解构 = {{ destructuredDemo }}
                        <span class="text-red-500">← 永远停在 0(响应式已断开)</span>
                    </p>
                </div>
            </div>
            <p class="mt-3 text-xs text-gray-400">
                同理:把 reactive 对象的属性当参数传出、放进新对象({...state})、或交给返回值,都会断开。ref 因为「响应式在盒子上而不在值上」,传递盒子不会断。
            </p>
        </TopicSection>

        <TopicSection
            title="实验二:整体替换 — ref 的独占能力"
            description="「整体换新对象」在业务里极常见(表单重置、接口回填)。ref 直接替换 .value;reactive 只能 Object.assign 原地打补丁。"
        >
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div class="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700">
                    <h3 class="mb-2 font-semibold">ref(可整体替换)</h3>
                    <p class="mb-2 font-mono text-xs text-gray-500">{{ refUser }}</p>
                    <button type="button" class="rounded-md border border-gray-300 px-3 py-1 text-xs dark:border-gray-600" @click="replaceRefUser">
                        refUser.value = 新对象
                    </button>
                </div>
                <div class="rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700">
                    <h3 class="mb-2 font-semibold">reactive(只能原地改)</h3>
                    <p class="mb-2 font-mono text-xs text-gray-500">{{ reactiveUser }}</p>
                    <button type="button" class="rounded-md border border-gray-300 px-3 py-1 text-xs dark:border-gray-600" @click="patchReactiveUser">
                        Object.assign 原地改
                    </button>
                </div>
            </div>
        </TopicSection>

        <TopicSection
            title="团队约定(可直接抄)"
            description="本站的取舍:能 ref 就 ref,reactive 只在白名单场景出现。"
        >
            <ul class="list-inside list-disc space-y-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                <li><strong>默认 ref</strong>:原始值、需要整体替换的对象、要在函数间传递的状态,一律 ref。</li>
                <li><strong>reactive 白名单</strong>:只用于「形状固定、不解构、不替换」的局部聚合状态(如一个表单的草稿对象),且不跨函数边界传递。</li>
                <li><strong>解构 reactive 时必须 toRef / toRefs</strong>,并在 code review 中把「直接解构 reactive」列为红线。</li>
                <li>组合式函数返回值一律用 ref 数组/对象(return { count, inc }),调用方解构安全。</li>
            </ul>
        </TopicSection>
    </TopicPage>
</template>
