<script setup lang="ts">
/**
 * ============================================================================
 * 理解检验 — /state/check
 * ============================================================================
 *
 * 状态管理分类末页:检验 Pinia 核心、store 设计、持久化与通道决策。
 *
 * @module topics/state/check
 */

import CheckList from '@/components/CheckList.vue';
import type { CheckItem } from '@/components/check-list';
import TopicPage from '@/components/TopicPage.vue';
import TopicSection from '@/components/TopicSection.vue';

const items: CheckItem[] = [
    {
        question: 'setup 风格的 Pinia store 里,state / getter / action 分别对应什么?',
        answer:
            'ref/reactive → state;computed → getter;普通函数(可 async)→ action。没有 mutations——Pinia 允许 action 里直接改 state,变更追踪由 devtools 的订阅机制负责。',
        point: 'Pinia 心智模型',
    },
    {
        question: '为什么从 store 解构 state 要用 storeToRefs?直接解构会怎样?',
        answer:
            'store 实例是 reactive 对象,直接解构出普通值,响应式断开(同 ref vs reactive 的解构坑)。storeToRefs 为每个 state/getter 建立 ref 引用;actions 是普通函数,直接从 store 上解构即可。',
        point: '响应式边界',
    },
    {
        question: '切 store 按页面还是按领域?为什么?',
        answer:
            '按领域。页面是路由的产物,会随信息架构调整;领域(用户、订单、偏好)是业务的骨架,稳定得多。按页面切 store,一次路由重构就要给状态搬家;按领域切,页面只是 store 的消费者组合。',
        star: 2,
        point: '模块化原则',
    },
    {
        question: '跨 store 引用时唯一的硬规则是什么?',
        answer:
            '依赖方向单向:组合层可以 use 基础层,基础层绝不知道组合层存在。一旦出现双向引用,两个 store 都无法独立理解与测试,循环依赖还可能导致初始化顺序问题。',
        star: 2,
        point: '依赖方向',
    },
    {
        question: '$patch 相比逐字段赋值,除了少写几行还有什么实质区别?',
        answer:
            '订阅通知次数:$patch 把多处修改合并成一次变更通知,逐字段赋值每改一次通知一次。对重渲染订阅者(如持久化插件、日志上报)这是次数级的差别。',
        point: '批量提交',
    },
    {
        question: '★ 用户 token 该不该放 Pinia?localStorage 呢?',
        answer:
            'token 本身:放 httpOnly cookie(JS 读不到,天然防 XSS 窃取),Pinia 里只存「当前用户/已登录」这个事实。放 localStorage 的 token 会被任何一段注入脚本读走;放 Pinia 内存态则刷新即丢、被迫重新登录。所以:凭证走 cookie,身份快照走 store。',
        star: 3,
        point: '安全边界',
    },
    {
        question: '什么状态该放 URL 而不是 store?举一个例子。',
        answer:
            '能用 URL 表达且用户会分享/回退的状态:列表页的分页、筛选、排序、搜索词。放 URL 后刷新不丢、链接可分享、前进后退有语义。放 store 则刷新即丢,也无法把「当前视图」发给别人。',
        star: 2,
        point: '状态归属',
    },
    {
        question: 'provide/inject 和 Pinia 都能「跨层级传数据」,边界在哪?',
        answer:
            '范围与工具链:provide/inject 是一棵子树的私有通道,无 devtools、无变更记录,适合组件库内部上下文;Pinia 是应用级具名通道,有 devtools、时间旅行、持久化生态,适合业务状态。「跨多层」不是上 Pinia 的理由,「跨任意组件 + 需要可观测」才是。',
        star: 3,
        point: '通道选型',
    },
];
</script>

<template>
    <TopicPage path="/state/check">
        <TopicSection
            title="先自答,再展开对照"
            description="覆盖 Pinia 心智模型、解构陷阱、模块化、批量提交、持久化安全与通道选型。"
        >
            <CheckList :items="items" />
        </TopicSection>
    </TopicPage>
</template>
