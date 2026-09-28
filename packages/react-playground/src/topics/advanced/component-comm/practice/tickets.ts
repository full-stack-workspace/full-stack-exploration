/**
 * ============================================================================
 * tickets.ts — 工单工作台 mock 数据
 * ============================================================================
 *
 * 状态过滤走 URL,选中项走页面 state,负责人对照站点 User Context。
 * 数据本身是静态事实,不放进 Context。
 *
 * @module topics/advanced/component-comm/practice/tickets
 */

export type TicketStatus = 'open' | 'done';

export interface Ticket {
    id: string;
    title: string;
    status: TicketStatus;
    assigneeId: string;
    body: string;
}

export const TICKETS: Ticket[] = [
    {
        id: 't-contrast',
        title: '登录页暗色对比度',
        status: 'open',
        assigneeId: 'u-lin',
        body: '输入框边框在 dark 下几乎看不见,属于主题 token,不该层层 props 从页面钻到 input。',
    },
    {
        id: 't-filter',
        title: '购物车筛选刷新丢失',
        status: 'open',
        assigneeId: 'u-chen',
        body: 'onlyShowInStock 现在活在内存。若要分享链接,应进 searchParams,而不是 Context。',
    },
    {
        id: 't-relay',
        title: 'Relay mock 超时提示',
        status: 'done',
        assigneeId: 'u-lin',
        body: '请求失败是服务器状态,走数据层,不要 throw 进错误边界,也不要广播到 AppContext。',
    },
];
