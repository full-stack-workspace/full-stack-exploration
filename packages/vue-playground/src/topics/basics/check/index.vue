<script setup lang="ts">
/**
 * ============================================================================
 * 理解检验 — /basics/check
 * ============================================================================
 *
 * Vue 基础分类末页:检验模板语法、事件表单、组件基础与生命周期
 * 是否真正掌握。较难题标出星级和考察点。
 *
 * @module topics/basics/check
 */

import CheckList from '@/components/CheckList.vue';
import type { CheckItem } from '@/components/check-list';
import TopicPage from '@/components/TopicPage.vue';
import TopicSection from '@/components/TopicSection.vue';

const items: CheckItem[] = [
    {
        question: '模板插值 {{ }} 里能放 if 语句吗?为什么?',
        answer:
            '不能。插值和指令绑定的值都是「表达式」位置,编译期会被包进 render 函数的返回值上下文,语句没有值。需要分支时用三元表达式,或把逻辑下沉到 computed。',
        point: '模板编译',
    },
    {
        question: 'v-if 和 v-show 的初始渲染成本与切换成本分别是什么?一个每天只切一次、但内容很重的面板该用哪个?',
        answer:
            'v-if:初始为 false 时零渲染成本,但切换要销毁/重建子树;v-show:初始必渲染,切换只切 display。内容重 + 极少切换 → v-if(首屏省掉整棵子树);频繁切换 → v-show。',
        star: 2,
        point: '渲染成本模型',
    },
    {
        question: 'v-for 不加 key 时,Vue 用「就地复用」策略。用一个输入框列表说明这会带来什么 bug。',
        answer:
            '就地复用按位置复用 DOM:头部插入一行时,原第一行的 input 状态(输入值、勾选)会留在第一个位置,视觉上是「状态跟着位置走而不是跟着数据走」。key 给了节点稳定身份,插入/排序时 DOM 与状态一起跟着数据移动。',
        star: 2,
        point: 'Diff 身份',
    },
    {
        question: 'v-model.lazy 和 v-model 的同步时机差别是什么?自定义组件上 v-model 等价于什么 prop + 事件?',
        answer:
            '.lazy 把同步从 input 事件推迟到 change(失焦或回车)。组件上 v-model 等价于 :modelValue + @update:modelValue;Vue 3.4+ 子组件用 defineModel 一行声明,还能接收 .uppercase 这类自定义修饰符。',
        point: '双向绑定机制',
    },
    {
        question: '子组件能直接修改 props 吗?如果能,会发生什么;正确的替代做法有哪些?',
        answer:
            '运行时会有警告(开发环境),且破坏了单向数据流——父级再渲染时改动被覆盖,数据源头变得不可追踪。替代:emit 自定义事件;v-model / defineModel;需要跨多层时用 provide/inject 或 Pinia(见进阶与状态管理分类)。',
        star: 2,
        point: '单向数据流',
    },
    {
        question: '作用域插槽解决什么问题?举一个「状态在子、渲染权在父」的例子。',
        answer:
            '子组件持有状态(如表格的展开态、卡片的已读数),但展示形式由父级决定:子组件 <slot :row="row" /> 把数据抛出来,父级 <template #default="{ row }"> 决定怎么渲染。Element Plus 表格的自定义列就是这个模式。',
        star: 2,
        point: '组合能力',
    },
    {
        question: 'onMounted 和 onBeforeMount 的本质区别是什么?初始化 echarts 实例该放哪个?',
        answer:
            'onBeforeMount 时 DOM 尚未生成,拿不到真实节点;onMounted 时 DOM 已插入文档。echarts 这类需要测量容器尺寸的第三方 DOM 库必须放 onMounted。',
        point: 'DOM 就绪点',
    },
    {
        question: '★ 在 onUpdated 里修改响应式状态,会发生什么?如何避免?',
        answer:
            '改状态 → 再次触发更新 → 又进 onUpdated,形成无限更新循环(Vue 会检测到并报「Maximum recursive updates exceeded」)。避免:更新前加条件判断(值真的变了才改);或改用 computed/watch 表达派生关系,不在更新钩子里写状态。',
        star: 3,
        point: '更新循环',
    },
    {
        question: '★ watch 的副作用和 window.addEventListener 的副作用,在组件卸载时的命运有何不同?这说明了组合式 API 的什么设计?',
        answer:
            'watch/watchEffect 创建在组件 setup 作用域内,卸载时自动停止;手写 addEventListener 不会,必须在 onUnmounted 里 remove。说明组合式 API 把「副作用的生命周期」绑定到了组件实例上——这也是组合式函数能安全封装副作用的前提。',
        star: 3,
        point: '副作用所有权',
    },
];
</script>

<template>
    <TopicPage path="/basics/check">
        <TopicSection
            title="先自答,再展开对照"
            description="覆盖模板编译、v-if/v-show 成本模型、key 身份、v-model、单向数据流、插槽、生命周期。卡住就回到对应专题的对照演练。"
        >
            <CheckList :items="items" />
        </TopicSection>
    </TopicPage>
</template>
