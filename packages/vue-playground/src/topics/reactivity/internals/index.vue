<script setup lang="ts">
/**
 * ============================================================================
 * 响应式原理 — /reactivity/internals
 * ============================================================================
 *
 * 手写一个迷你响应式系统(Proxy + track/trigger + effect),
 * 并用它驱动真实 DOM:右侧依赖图面板实时展示「哪个属性被哪些 effect 依赖」。
 * 目标:理解 Vue 的响应式不是魔法,是「读取时收集、写入时通知」。
 *
 * @module topics/reactivity/internals
 */

import { reactive as vueReactive, ref } from 'vue';
import CodeBlock from '@/components/CodeBlock.vue';
import TopicPage from '@/components/TopicPage.vue';
import TopicSection from '@/components/TopicSection.vue';

/* =================================================================
 * 迷你响应式系统(教学实现,约 30 行)
 * ================================================================ */

type Effect = () => void;

/** 当前正在执行的 effect(全局单点,track 时收集它) */
let activeEffect: Effect | null = null;

/** 依赖图:target → key → effect 集合;用 Vue ref 包一层只为让右侧面板能实时渲染 */
const depGraph = ref<Record<string, string[]>>({});

/** 真实存储:WeakMap<target, Map<key, Set<effect>>> */
const targetMap = new WeakMap<object, Map<string | symbol, Set<Effect>>>();

/** 读取时收集依赖:把当前 effect 记到 target.key 名下 */
function track(target: object, key: string | symbol) {
    if (!activeEffect) return;
    let depsMap = targetMap.get(target);
    if (!depsMap) targetMap.set(target, (depsMap = new Map()));
    let dep = depsMap.get(key);
    if (!dep) depsMap.set(key, (dep = new Set()));
    dep.add(activeEffect);
    // 同步到可视化面板
    const id = getObjId(target);
    depGraph.value = { ...depGraph.value, [`${id}.${String(key)}`]: [...dep].map((_, i) => `effect#${i + 1}`) };
}

/** 写入时通知:重新执行 target.key 名下的所有 effect */
function trigger(target: object, key: string | symbol) {
    targetMap.get(target)
        ?.get(key)
        ?.forEach((effect) => effect());
}

/** 注册一个副作用:立即执行一次,执行期间读到的属性都会收集它 */
function effect(fn: Effect) {
    activeEffect = fn;
    fn();
    activeEffect = null;
}

/** Proxy 代理:get 时 track,set 时 trigger */
function miniReactive<T extends object>(obj: T): T {
    return new Proxy(obj, {
        get(t, k, r) {
            track(t, k);
            return Reflect.get(t, k, r);
        },
        set(t, k, v, r) {
            const ok = Reflect.set(t, k, v, r);
            trigger(t, k);
            return ok;
        },
    });
}

/* =================================================================
 * 实验:用迷你系统驱动真实 DOM
 * ================================================================ */

// 给对象一个可读 id,用于依赖图面板
const objIds = new WeakMap<object, number>();
let nextObjId = 1;
const getObjId = (o: object) => {
    if (!objIds.has(o)) objIds.set(o, nextObjId++);
    return `obj#${objIds.get(o)}`;
};

const miniState = miniReactive({ count: 0, label: '迷你响应式' });
/** effect 渲染结果存在普通 Vue ref 里,由迷你系统的 effect 写入 */
const rendered = ref('');
const renderCount = ref(0);

// 注册 effect:读 miniState.count / label → 被收集;它们变化时这里重跑
effect(() => {
    renderCount.value++;
    rendered.value = `${miniState.label}:${miniState.count}`;
});

/* ---- 对照:这是 Vue 官方 API 做的同一件事 ---- */
const official = vueReactive({ count: 0 });

const internalsSnippet = `let activeEffect = null
const targetMap = new WeakMap()   // target → key → Set<effect>

function track(target, key) {     // get 时:收集「谁在读我」
    if (!activeEffect) return
    depOf(target, key).add(activeEffect)
}
function trigger(target, key) {   // set 时:通知「读过我的人重跑」
    depOf(target, key).forEach(effect => effect())
}
function effect(fn) { activeEffect = fn; fn(); activeEffect = null }

function reactive(obj) {
    return new Proxy(obj, {
        get(t, k, r) { track(t, k); return Reflect.get(t, k, r) },
        set(t, k, v, r) { const ok = Reflect.set(t, k, v, r); trigger(t, k); return ok },
    })
}`;
</script>

<template>
    <TopicPage path="/reactivity/internals">
        <TopicSection
            title="活的迷你响应式系统"
            description="下方数据由本页手写的 30 行响应式系统驱动(不是 Vue 的 ref)。改 count/label,观察右侧依赖图:读取时属性被登记,写入时 effect 重跑。"
        >
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div class="space-y-3">
                    <div class="flex flex-wrap items-center gap-3 text-sm">
                        <button type="button" class="rounded-md bg-primary-600 px-3 py-1.5 text-white hover:bg-primary-700" @click="miniState.count++">
                            count +1(触发 trigger)
                        </button>
                        <input
                            :value="miniState.label"
                            class="rounded-md border border-gray-300 px-2 py-1.5 dark:border-gray-700 dark:bg-gray-800"
                            @input="miniState.label = ($event.target as HTMLInputElement).value"
                        />
                    </div>
                    <p class="rounded-md bg-gray-50 px-3 py-2 font-mono text-xs dark:bg-gray-800">
                        effect 渲染结果:<span class="text-primary-600 dark:text-primary-400">{{ rendered }}</span>
                        <span class="ml-2 text-gray-400">(已执行 {{ renderCount }} 次)</span>
                    </p>
                </div>
                <div class="rounded-md bg-gray-50 p-3 font-mono text-xs leading-relaxed dark:bg-gray-800">
                    <p class="mb-1 font-semibold text-gray-600 dark:text-gray-300">依赖图(target.key → effects)</p>
                    <p v-for="(effects, key) in depGraph" :key="key" class="text-gray-500 dark:text-gray-400">
                        {{ key }} ← {{ effects.join(', ') }}
                    </p>
                </div>
            </div>
        </TopicSection>

        <TopicSection title="实现全貌(可对照读)" description="三个零件:effect 注册、track 收集、trigger 通知,Proxy 只是把「读取/写入」拦截成这两次回调。">
            <CodeBlock lang="ts" :code="internalsSnippet" />
        </TopicSection>

        <TopicSection
            title="从迷你版到 Vue 的真身:还差了哪些工程细节"
            description="教学版跑通了核心心智模型;生产版要解决的都是边角与规模问题。"
        >
            <ul class="list-inside list-disc space-y-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                <li><strong>嵌套对象</strong>:get 到对象要递归包装(Vue 是惰性的——读到哪层包哪层)。</li>
                <li><strong>effect 嵌套与清理</strong>:effect 里套 effect、分支切换后的依赖重收集(需要 effect 栈 + 每次重跑前清空旧依赖)。</li>
                <li><strong>调度</strong>:trigger 不直接同步重跑,而是进调度队列批量异步执行——这就是 next-tick 专题的主角。</li>
                <li><strong>ref 的角色</strong>:Proxy 拦不住原始值,ref 用「带 getter/setter 的盒子」把同样的 track/trigger 套在 .value 上。</li>
                <li><strong>数组与特殊操作</strong>:length、push、delete、has 等都要各自的处理(Vue 重写了数组方法)。</li>
            </ul>
            <p class="mt-3 text-xs text-gray-400">
                对照实验:上面右侧的「官方 API」计数({{ official.count }})由真正的 Vue 驱动,<button type="button" class="underline" @click="official.count++">点我 +1</button> 行为与迷你版一致。
            </p>
        </TopicSection>
    </TopicPage>
</template>
