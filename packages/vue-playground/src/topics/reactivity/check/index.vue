<script setup lang="ts">
/**
 * ============================================================================
 * 理解检验 — /reactivity/check
 * ============================================================================
 *
 * 响应式分类末页:检验 ref/reactive、computed/watch、
 * 响应式原理、nextTick 与 shallow 家族是否掌握。
 *
 * @module topics/reactivity/check
 */

import CheckList from '@/components/CheckList.vue';
import type { CheckItem } from '@/components/check-list';
import TopicPage from '@/components/TopicPage.vue';
import TopicSection from '@/components/TopicSection.vue';

const items: CheckItem[] = [
    {
        question: '为什么社区约定「默认 ref」而不是默认 reactive?说出 reactive 的三个能力缺口。',
        answer:
            '① 只接受对象,原始值装不进去;② 解构/展开后响应式断开(属性变成普通值);③ 不能整体替换(重新赋值即丢代理)。ref 把响应式放在「盒子」上,盒子可以传、可以换内容、原始值也能装。模板里还自动解包。',
        star: 2,
        point: 'API 边界',
    },
    {
        question: 'computed 和 method 在模板里调用,渲染三次各执行几次?这个差异的前提是什么?',
        answer:
            'method 执行 3 次(每次渲染都跑);computed 在依赖不变时只算 1 次,之后命中缓存。前提:computed 的依赖集合没变,且 computed 是惰性求值——没人读的时候连那一次都不算。',
        point: '缓存与惰性',
    },
    {
        question: 'watch 和 watchEffect 的依赖分别是「显式」和「自动」的。什么场景下自动追踪反而更合适?',
        answer:
            '依赖集合随条件动态变化时:比如 effect 里 if(a) 读 x else 读 y,手写 watch 得列两个源还得处理切换;watchEffect 每次重跑重新收集,自然跟随。另外 watchEffect 立即执行一次,适合「初始化就要同步」的场景。',
        star: 2,
        point: '依赖追踪方式',
    },
    {
        question: '用一句话说出 track 和 trigger 各自在什么时候被调用、做了什么。',
        answer:
            'track 在「读取响应式数据」时被 get 拦截调用,把当前正在执行的 effect 登记到 target.key 的依赖集合;trigger 在「写入」时被 set 拦截调用,把该属性名下的 effect 全部重新执行(实际进调度队列)。',
        point: '响应式原理',
    },
    {
        question: '为什么 ref 能装原始值而 reactive 不能?底层手段有何不同?',
        answer:
            'Proxy 只能拦截对象上的属性访问,拦不住「一个普通变量被重新赋值」。ref 造了一个带 get/set value 的盒子对象,把 track/trigger 挂在 .value 的访问器上;所以原始值也能响应。',
        star: 2,
        point: 'Proxy 的局限',
    },
    {
        question: '改了状态立刻读 DOM,读到的是新值还是旧值?为什么?怎么等到新值?',
        answer:
            '旧值。组件更新被推进微任务队列批量执行,同步代码里 DOM 还没 flush。等更新后的 DOM:await nextTick(),或 watch 的 flush: "post"。',
        point: '批量更新',
    },
    {
        question: '★ 同一个事件里 count++ 三次,组件渲染几次?如果在三次 ++ 之间插入 await,行为会变吗?',
        answer:
            '同步连改 → 渲染 1 次(批处理合并)。中间插入 await 后,第一次 ++ 后的更新任务已被调度,await 让出微任务,可能先渲染一次再继续改——最多渲染两次。结论:批处理合并的是「同一微任务周期内」的修改。',
        star: 3,
        point: '调度时机',
    },
    {
        question: '★ echarts 实例为什么要用 shallowRef(或 markRaw)保存?用普通 ref 会发生什么?',
        answer:
            'echarts 实例是巨型对象,内部读写极其频繁;普通 ref 会深递归给整个实例装 Proxy,既拖慢库的运行,代理还可能破坏实例内部对 this/私有字段的假设。shallowRef 只代理 .value 一层,实例内部保持原样。',
        star: 3,
        point: '响应式边界',
    },
    {
        question: '★ shallowRef 里嵌套字段被改了但视图没更新,除了整体替换 .value,还有什么办法让视图刷新?背后的 API 是什么?',
        answer:
            'triggerRef(shallowRef) —— 手动触发该 ref 的依赖通知。语义上是「我知道变了,替我通知」;常见搭配:高性能场景里批量原地改 + 一次 triggerRef 统一通知,避免每改一处都触发。',
        star: 3,
        point: '手动通知',
    },
];
</script>

<template>
    <TopicPage path="/reactivity/check">
        <TopicSection
            title="先自答,再展开对照"
            description="覆盖 ref/reactive 边界、computed 缓存、watch 依赖追踪、track/trigger 原理、批量更新与 shallow 家族。卡住就回到对应专题的实验。"
        >
            <CheckList :items="items" />
        </TopicSection>
    </TopicPage>
</template>
