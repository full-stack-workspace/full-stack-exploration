<script setup lang="ts">
/**
 * ============================================================================
 * 理解检验 — /composables/check
 * ============================================================================
 *
 * 组合式函数分类末页:检验设计原则、签名约定、自动清理与分层组合。
 *
 * @module topics/composables/check
 */

import CheckList from '@/components/CheckList.vue';
import type { CheckItem } from '@/components/check-list';
import TopicNav from '@/components/TopicNav.vue';
import TopicPage from '@/components/TopicPage.vue';
import TopicSection from '@/components/TopicSection.vue';
import { COMPOSABLES_NAV } from '../nav';

const items: CheckItem[] = [
    {
        question: '什么信号说明一段 setup 逻辑该抽成 composable?「可能会复用」算不算充分理由?',
        answer:
            '不算。充分信号:① 已在第二个组件出现;② setup 超一屏需要按「事」切分;③ 含 onMounted/onUnmounted 配对的副作用;④ 需要脱离组件单测。只为「未来可能复用」而抽,得到的是没人用的抽象。',
        point: '抽象时机',
    },
    {
        question: '为什么 composable 的返回值约定是 ref 而不是 reactive 对象?',
        answer:
            '调用方一定会解构返回值。reactive 对象解构即断连(见 ref vs reactive 专题);ref 解构后是带盒子的引用,响应式不丢。所以 lib/ 里 useToggle 返回 [state, toggle],useCounter 返回 { count, inc }——count 是 ref,不是 reactive 字段。',
        point: '返回值设计',
    },
    {
        question: '「接受 MaybeRef」参数约定解决什么问题?',
        answer:
            '调用方手里可能是普通值也可能是 ref。composable 内部 unref 归一后,两种调用都成立,签名不用分裂成 useXxx(value) / useXxxRef(ref) 两套。',
        point: '参数设计',
    },
    {
        question: 'useEventListener 把 addEventListener 包进 composable 后,调用方为什么「再也写不出泄漏」?',
        answer:
            '因为清理义务被内化了:onMounted 注册、onUnmounted 移除,且这对钩子在同一个函数里相邻,不可能「注册忘了卸」。对比裸写:监听注册在 mounted、移除在 destroyed,中间隔着整个文件,漏写无人能发现直到内存上涨。',
        star: 2,
        point: '副作用所有权',
    },
    {
        question: '★ useFetch 里「新请求 abort 旧请求」防的是什么竞态?如果两个响应乱序返回,不防护会怎样?',
        answer:
            '防「旧响应覆盖新数据」:用户快速改筛选,A 请求先发但慢、B 请求后发但快,B 的数据先落地,A 后到又把它覆盖——UI 显示的是旧筛选的结果。abort 让旧响应永远落不了地(catch 到 AbortError 直接忽略)。',
        star: 3,
        point: '异步竞态',
    },
    {
        question: '★ 组合实战里的 useUserSearch,如果把「防抖」从原子层挪到领域层之外(组件里自己 setTimeout),会丢掉什么?',
        answer:
            '① 时序逻辑散落各组件,改防抖策略要改 N 处;② 定时器清理责任回到组件,泄漏风险回归;③ 领域接口不再自包含——「搜什么、什么节奏搜」被拆开,组件需要知道实现细节。分层的目的就是让组件只面对领域语义。',
        star: 2,
        point: '分层组合',
    },
    {
        question: 'mixins 在 Vue 3 里为什么被判死刑?composable 解决了它的哪三个原罪?',
        answer:
            'mixins 三宗罪:① 数据来源不明(模板里用的属性不知道来自哪个 mixin);② 命名冲突(多个 mixin 同名字段互相覆盖);③ 隐式依赖(mixin 之间通过 this 互相调用)。composable 用显式 import、显式返回值解构、显式参数传递,三条全部化解。',
        star: 2,
        point: '范式对比',
    },
];
</script>

<template>
    <TopicPage path="/composables/check">
        <TopicNav category="composables" :links="COMPOSABLES_NAV" />
        <TopicSection
            title="先自答,再展开对照"
            description="覆盖抽象时机、签名约定、副作用所有权、异步竞态与分层纪律。卡住就回到梳理页的对照表。"
        >
            <CheckList :items="items" />
        </TopicSection>
    </TopicPage>
</template>
