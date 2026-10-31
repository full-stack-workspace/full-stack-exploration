<script setup lang="ts">
/**
 * ============================================================================
 * 理解检验 — /architecture/check
 * ============================================================================
 *
 * 原理与架构分类末页:检验编译/运行时分界、VDOM Diff、
 * 编译优化三件套与渲染调度是否连成体系。
 *
 * @module topics/architecture/check
 */

import CheckList from '@/components/CheckList.vue';
import type { CheckItem } from '@/components/check-list';
import TopicPage from '@/components/TopicPage.vue';
import TopicSection from '@/components/TopicSection.vue';

const items: CheckItem[] = [
    {
        question: 'Vue 的编译时与运行时各负责什么?为什么说编译优化是 Vue 相对 React 的独有地盘?',
        answer:
            '编译时(@vue/compiler-sfc):模板 → AST → 静态分析 → 带 Patch Flag 的 render 函数。运行时:响应式、调度、执行 render、Diff、打补丁。React 的 JSX 编译只做语法转换,不产出「哪里会动」的信息,运行时只能全树对比;Vue 的模板是可静态分析的,动态性信息在构建期就写进了产物。',
        star: 2,
        point: '双引擎分界',
    },
    {
        question: 'Patch Flag 为 1(TEXT)的文本节点,Diff 时会跳过哪些检查?',
        answer:
            '跳过 props 对比、跳过子节点数组对比、跳过类型/事件检查——直接更新 textContent 一次到位。Patch Flag 的本质是「编译器告诉运行时:这个节点只有这一种东西会变」。',
        point: 'Patch Flag',
    },
    {
        question: 'Block Tree 收集 dynamicChildren 后,一个 1000 节点的页面里只有 2 个动态绑定,Diff 要访问几个节点?',
        answer:
            '约 2 个(加上沿途的 Block 边界)。静态子树整块跳过,页面大小与静态内容量不再影响更新成本——这是「Vue 大页面更新不慢」的结构性原因。',
        star: 2,
        point: 'Block Tree',
    },
    {
        question: '静态提升除了少创建对象,还保护了哪种下游优化?',
        answer:
            '保护了子组件的 props 变化检测:内联对象 prop 每次 render 都新建引用,子组件会误判 props 变化而被迫更新;提升为模块级常量后引用稳定,子组件可以安全跳过。与 React 中「inline object 击穿 memo」同构。',
        star: 3,
        point: '静态提升',
    },
    {
        question: '列表 Diff 为什么要求最长递增子序列(LIS)?它最小化的是什么?',
        answer:
            '最小化 DOM 移动次数。新列表中映射到旧列表位置递增的节点可以原地不动;LIS 外的节点才需要 insertBefore 移动。DOM 移动是最贵的列表操作,LIS 把移动压到理论下限。',
        star: 3,
        point: 'LIS',
    },
    {
        question: '同一微任务里改三次状态为什么只渲染一次?调度器靠什么去重?',
        answer:
            '组件的渲染 effect 以 job 形式进入调度队列,队列用 Set 语义按组件去重——三次 trigger 入队的是同一个 job。flush 挂在微任务上,本周期内所有修改合并成一次 render + patch。',
        point: '调度去重',
    },
    {
        question: '★ flush 时为什么父组件必须先于子组件渲染?',
        answer:
            '子组件 render 会读父级传下的 props。若子先渲染、父后渲染,子读到的就是「上一个周期的父状态 + 这个周期的父状态」混合——同一帧内数据不一致。按组件 id(创建顺序,父必小于子)升序 flush,保证父先稳定。',
        star: 3,
        point: 'flush 排序',
    },
    {
        question: '★ watch 的 flush: "post" 和在回调里 await nextTick() 有什么差别?该优先用哪个?',
        answer:
            '语义等价(都在 DOM 更新后执行),但 post 是声明式的——「我这个 watcher 依赖更新后的 DOM」直接写在选项里,读代码不用进回调找 nextTick;且 post 的调度位置由框架统一管理,时序更可控。优先 flush: "post"。',
        star: 2,
        point: 'flush 时机',
    },
];
</script>

<template>
    <TopicPage path="/architecture/check">
        <TopicSection
            title="先自答,再展开对照"
            description="覆盖编译/运行时分界、Patch Flag、Block Tree、静态提升、LIS 与调度器。卡住就回到对应专题的图解。"
        >
            <CheckList :items="items" />
        </TopicSection>
    </TopicPage>
</template>
