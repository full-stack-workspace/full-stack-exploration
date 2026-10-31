/**
 * ============================================================================
 * tickets — 工单工作台 mock 数据
 * ============================================================================
 *
 * 组件通信实战页的模拟数据与类型。静态数据,无网络依赖。
 *
 * @module topics/advanced/component-comm/tickets
 */

export interface Ticket {
    id: number;
    title: string;
    status: 'open' | 'doing' | 'done';
    assignee: string;
    priority: '高' | '中' | '低';
}

export const TICKETS: Ticket[] = [
    { id: 101, title: '支付回调偶发超时', status: 'open', assignee: '张三', priority: '高' },
    { id: 102, title: '订单列表分页错位', status: 'doing', assignee: '李四', priority: '中' },
    { id: 103, title: '导出 CSV 中文乱码', status: 'open', assignee: '王五', priority: '低' },
    { id: 104, title: '登录页验证码加载失败', status: 'done', assignee: '张三', priority: '高' },
    { id: 105, title: '库存扣减并发冲突', status: 'doing', assignee: '赵六', priority: '高' },
    { id: 106, title: '搜索建议延迟过高', status: 'open', assignee: '李四', priority: '中' },
];

export const STATUS_LABEL: Record<Ticket['status'], string> = {
    open: '待处理',
    doing: '进行中',
    done: '已完成',
};
