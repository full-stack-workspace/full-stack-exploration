<script setup lang="ts">
/**
 * ============================================================================
 * 理解检验 — /performance/check
 * ============================================================================
 *
 * 性能优化分类末页:检验懒加载、keep-alive/v-memo、
 * 虚拟列表与响应式性能边界是否掌握。
 *
 * @module topics/performance/check
 */

import CheckList from '@/components/CheckList.vue';
import type { CheckItem } from '@/components/check-list';
import TopicPage from '@/components/TopicPage.vue';
import TopicSection from '@/components/TopicSection.vue';

const items: CheckItem[] = [
    {
        question: '路由级懒加载和组件级懒加载的触发时机分别是什么?',
        answer:
            '路由级:导航到该路由时才请求页面 chunk(注册表 element: () => import(...))。组件级:defineAsyncComponent 的组件首次进入渲染时才请求——适合「同页内交互后才出现」的重组件(设置面板、图表、编辑器)。',
        point: '代码分割',
    },
    {
        question: 'keep-alive 缓存的组件,切换时走哪两个生命周期?onMounted 会再次触发吗?',
        answer:
            '切走 onDeactivated,切回 onActivated;onMounted 只在首次挂载触发一次。所以「每次进入都要做」的逻辑(如拉新数据)放 onActivated,不能依赖 onMounted。',
        point: 'keep-alive 生命周期',
    },
    {
        question: '★ v-memo 和 React 的 memo 心智模型差在哪?为什么 Vue 可以做得更精确?',
        answer:
            'memo 是组件级浅比较全部 props;v-memo 是模板里显式列出依赖数组,命中即整块子树复用上次渲染结果。Vue 能这么做是因为编译期知道每个绑定依赖什么、响应式系统知道每次更新的精确源头——「哪里会动」在框架层就是已知的,不需要浅比较去猜。',
        star: 3,
        point: 'v-memo',
    },
    {
        question: '虚拟列表把 10000 行的 DOM 压到十几行,核心机制是哪两个?',
        answer:
            '① 总高度占位:一个 height = 行数 × 行高 的容器撑出真实滚动条;② 窗口渲染:scrollTop ÷ 行高算出起止索引,只渲染可视区 + 缓冲的行,用 transform/offset 定位。DOM 数量与数据量解耦。',
        point: '虚拟滚动',
    },
    {
        question: '一个万级行的页面卡顿,你说「上 shallowRef」——同事该追问你什么?',
        answer:
            '先问「DOM 有多少个」。如果一万行全渲染了,瓶颈是 DOM 数量,解法是虚拟列表;shallowRef 只省数据代理的初始化与追踪成本。顺序:先减 DOM,再减追踪。直接上 shallowRef 是优化错了层。',
        star: 2,
        point: '瓶颈定位',
    },
    {
        question: 'deep watch 一个 5000 项的数组有什么问题?正确的写法是什么?',
        answer:
            '每次数组里任何字段变化,deep watch 都要全树递归遍历收集变更,O(n) 起步且触发频繁。正确写法:watch 具体路径(watch(() => list.length, ...)或 getter 指到真正关心的字段),或改用事件上报让变更方主动通知。',
        star: 2,
        point: 'deep watch',
    },
    {
        question: '★ 「computed 有缓存所以一定快」对吗?什么情况 computed 反而是负担?',
        answer:
            '不对。computed 的缓存只在「依赖不变、多次读取」时赚;如果它依赖的源每帧都变(如跟随鼠标位置),缓存命中率是零,还多付一次依赖追踪的开销。另外巨型 computed(大列表过滤)依赖一变全量重算——此时拆分、分页或预聚合比缓存更要紧。',
        star: 3,
        point: '缓存的边界',
    },
];
</script>

<template>
    <TopicPage path="/performance/check">
        <TopicSection
            title="先自答,再展开对照"
            description="覆盖代码分割、keep-alive、v-memo、虚拟滚动与响应式成本地图。先测量再优化,是唯一的元规则。"
        >
            <CheckList :items="items" />
        </TopicSection>
    </TopicPage>
</template>
