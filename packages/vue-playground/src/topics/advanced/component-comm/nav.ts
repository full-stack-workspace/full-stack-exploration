/**
 * ============================================================================
 * nav — 组件通信专题页头互链
 * ============================================================================
 *
 * 三页专题(决策梳理 / 模式演练 / 工作台实战)的互链目录,
 * 由 TopicNav 消费;新增页面在此登记,三页页头同步更新。
 *
 * @module topics/advanced/component-comm/nav
 */

export const COMM_NAV = [
    { path: '/advanced/component-comm-guide', title: '决策梳理' },
    { path: '/advanced/component-comm-playground', title: '模式演练' },
    { path: '/advanced/component-comm-practice', title: '工作台实战' },
];
