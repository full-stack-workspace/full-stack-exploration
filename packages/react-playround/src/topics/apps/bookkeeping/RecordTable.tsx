import React from 'react';
import { Table, Tag, Button, Popconfirm, DatePicker, Space } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';

import type { BookkeepingRecord, DateRange } from './types';

const { RangePicker } = DatePicker;

export interface RecordTableProps {
    records: BookkeepingRecord[];
    onDelete: (id: string) => void;
    dateRange: DateRange;
    onDateRangeChange: (range: DateRange) => void;
}

const columns = (onDelete: (id: string) => void): ColumnsType<BookkeepingRecord> => [
    {
        title: '日期',
        dataIndex: 'date',
        key: 'date',
        width: 120,
        sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
        defaultSortOrder: 'descend',
    },
    {
        title: '类型',
        dataIndex: 'type',
        key: 'type',
        width: 90,
        filters: [
            { text: '收入', value: 'income' },
            { text: '支出', value: 'expense' },
        ],
        onFilter: (value, record) => record.type === value,
        render: (type: string) => (
            <Tag color={type === 'income' ? 'green' : 'red'}>
                {type === 'income' ? '收入' : '支出'}
            </Tag>
        ),
    },
    {
        title: '分类',
        dataIndex: 'category',
        key: 'category',
        width: 110,
    },
    {
        title: '金额',
        dataIndex: 'amount',
        key: 'amount',
        width: 130,
        sorter: (a, b) => a.amount - b.amount,
        render: (amount: number, record: BookkeepingRecord) => (
            <span
                className={`font-semibold ${record.type === 'income' ? 'text-green-600' : 'text-red-500'}`}
            >
                {record.type === 'income' ? '+' : '-'} ¥
                {amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
            </span>
        ),
    },
    {
        title: '备注',
        dataIndex: 'description',
        key: 'description',
        ellipsis: true,
    },
    {
        title: '操作',
        key: 'action',
        width: 80,
        render: (_: unknown, record: BookkeepingRecord) => (
            <Popconfirm
                title="确定删除这条记录吗？"
                onConfirm={() => onDelete(record.id)}
                okText="确定"
                cancelText="取消"
            >
                <Button type="text" danger icon={<DeleteOutlined />} size="small" />
            </Popconfirm>
        ),
    },
];

export const RecordTable: React.FC<RecordTableProps> = ({
    records,
    onDelete,
    dateRange,
    onDateRangeChange,
}) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-lg font-semibold text-gray-700">收支明细</h2>
            <Space>
                <RangePicker
                    value={dateRange}
                    onChange={(dates) => onDateRangeChange(dates as DateRange)}
                    placeholder={['开始日期', '结束日期']}
                />
                {dateRange && (
                    <Button size="small" onClick={() => onDateRangeChange(null)}>
                        清除筛选
                    </Button>
                )}
            </Space>
        </div>
        <Table<BookkeepingRecord>
            columns={columns(onDelete)}
            dataSource={records}
            rowKey="id"
            pagination={{
                pageSize: 10,
                showTotal: (total) => `共 ${total} 条记录`,
            }}
            locale={{ emptyText: '暂无记录，开始记账吧！' }}
            size="middle"
        />
    </div>
);
