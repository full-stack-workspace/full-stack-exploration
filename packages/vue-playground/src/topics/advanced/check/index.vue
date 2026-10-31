<script setup lang="ts">
/**
 * ============================================================================
 * 理解检验 — /advanced/check
 * ============================================================================
 *
 * 进阶专题末页:检验组件通信、异步组件/Suspense、Teleport/Transition、
 * 指令与插件、错误处理是否掌握。
 *
 * @module topics/advanced/check
 */

import CheckList from '@/components/CheckList.vue';
import type { CheckItem } from '@/components/check-list';
import TopicPage from '@/components/TopicPage.vue';
import TopicSection from '@/components/TopicSection.vue';

const items: CheckItem[] = [
    {
        question: '「筛选状态该放哪」——组件 ref、Pinia、URL 三者怎么选?',
        answer:
            '看要不要「可分享/可回退」。列表筛选、分页、tab 这些用户期望刷新与分享后仍在的状态归 URL query;纯视图过程的临时态(选中行、草稿)归组件 ref;跨页面共享的业务态(当前用户、偏好)归 Pinia。',
        star: 2,
        point: '状态归属',
    },
    {
        question: 'props drilling 出现在三层以上,除了逐层接力,有哪些解法?各自代价是什么?',
        answer:
            '① 组合:把消费方经插槽上提,让数据在祖先处直连(零新机制,但要改结构);② provide/inject:子树内直连(快但来源不明,范围仅限子树);③ Pinia:任意组件可达(可观测,但要建模 store)。先考虑组合,再考虑 provide,最后才是 store。',
        star: 2,
        point: '通道梯子',
    },
    {
        question: 'defineAsyncComponent 拆出去的组件 chunk 什么时候被请求?Suspense 在其中承担什么角色?',
        answer:
            '首次渲染到该组件时才请求(懒加载)。Suspense 负责「子树有异步依赖时的等待态编排」:就绪前渲染 fallback,就绪后一次性切换,避免局部闪烁。',
        point: '代码分割',
    },
    {
        question: 'Teleport 改变了什么、没改变什么?',
        answer:
            '改变:DOM 挂载位置(弹层可挂到 body,逃离层叠上下文与 overflow 裁剪)。没改变:组件树逻辑关系——props、emits、provide/inject、响应式全部照常,事件仍按组件树冒泡。',
        point: 'Teleport 语义',
    },
    {
        question: 'TransitionGroup 让列表重排有移动动画的前提是什么?',
        answer:
            '每个子节点有稳定唯一的 key。Vue 用 key 匹配新旧节点身份,再用 FLIP(记录旧位置 → 应用新位置 → 反向补间)生成移动过渡;key 不稳,身份匹配失败,动画退化为整体闪烁。',
        point: '列表过渡',
    },
    {
        question: '★ 什么情况该写自定义指令而不是组件或 composable?举两个例子。',
        answer:
            '目标是「增强单个 DOM 元素的行为」且不引入新结构时:v-focus(挂载聚焦)、v-permission(无权限即移除元素)、v-click-outside。要渲染结构用组件,要响应式逻辑用 composable;指令只占「DOM 元素横切增强」这一格。',
        star: 2,
        point: '抽象选型',
    },
    {
        question: '★ onErrorCaptured 抓不到哪三类错误?生产里的三层兜底分别是什么?',
        answer:
            '抓不到:事件处理器内的 throw、异步回调(setTimeout/Promise)、请求失败(那应建模为 error 状态)。三层兜底:局部 onErrorCaptured(隔离+降级+恢复)→ app.config.errorHandler(全局上报防白屏)→ window.onerror/unhandledrejection(最后一张网,只上报)。',
        star: 3,
        point: '错误分层',
    },
    {
        question: '★ 为什么「请求失败」不该 throw 给错误边界?',
        answer:
            '请求失败是预期内的业务状态(网络波动、404、鉴权过期),用户需要看到针对性 UI(重试按钮、空态),而错误边界的语义是「未预期的崩溃」。把失败建模进四态(loading/error/empty/success),恢复路径才是产品化的;throw 进边界只能得到一刀切的降级页。',
        star: 3,
        point: '错误建模',
    },
];
</script>

<template>
    <TopicPage path="/advanced/check">
        <TopicSection
            title="先自答,再展开对照"
            description="覆盖通道选型、代码分割、Teleport 语义、列表过渡、抽象选型与错误分层。"
        >
            <CheckList :items="items" />
        </TopicSection>
    </TopicPage>
</template>
