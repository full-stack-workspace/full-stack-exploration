import React, { useState, useCallback } from 'react';
import { Form, Input, InputNumber, Select, DatePicker, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

import {
    INCOME_CATEGORIES,
    EXPENSE_CATEGORIES,
    type BookkeepingRecord,
} from './types';

interface FormValues {
    type: 'income' | 'expense';
    amount: number;
    category: string;
    description: string;
    date: Dayjs;
}

export interface AddRecordFormProps {
    onAdd: (record: BookkeepingRecord) => void;
}

export const AddRecordForm: React.FC<AddRecordFormProps> = ({ onAdd }) => {
    const [form] = Form.useForm<FormValues>();
    const [selectedType, setSelectedType] = useState<'income' | 'expense'>(
        'expense',
    );

    const handleTypeChange = useCallback(
        (value: 'income' | 'expense') => {
            setSelectedType(value);
            form.setFieldValue('category', undefined);
        },
        [form],
    );

    const handleSubmit = useCallback(
        (values: FormValues) => {
            const record: BookkeepingRecord = {
                id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
                type: values.type,
                amount: values.amount,
                category: values.category,
                description: values.description || '',
                date: values.date.format('YYYY-MM-DD'),
            };
            onAdd(record);
            form.resetFields();
            form.setFieldsValue({ type: 'expense', date: dayjs() });
            setSelectedType('expense');
        },
        [form, onAdd],
    );

    const categoryOptions = (
        selectedType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
    ).map((c) => ({ label: c, value: c }));

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
                添加记录
            </h2>
            <Form
                form={form}
                layout="inline"
                onFinish={handleSubmit}
                initialValues={{ type: 'expense', date: dayjs() }}
                className="flex flex-wrap gap-y-3"
            >
                <Form.Item name="type" rules={[{ required: true }]}>
                    <Select
                        style={{ width: 100 }}
                        onChange={handleTypeChange}
                        options={[
                            { label: '支出', value: 'expense' },
                            { label: '收入', value: 'income' },
                        ]}
                    />
                </Form.Item>

                <Form.Item
                    name="amount"
                    rules={[{ required: true, message: '请输入金额' }]}
                >
                    <InputNumber
                        placeholder="金额"
                        min={0.01}
                        step={0.01}
                        precision={2}
                        style={{ width: 140 }}
                        prefix="¥"
                    />
                </Form.Item>

                <Form.Item
                    name="category"
                    rules={[{ required: true, message: '请选择分类' }]}
                >
                    <Select
                        placeholder="选择分类"
                        style={{ width: 130 }}
                        options={categoryOptions}
                    />
                </Form.Item>

                <Form.Item
                    name="date"
                    rules={[{ required: true, message: '请选择日期' }]}
                >
                    <DatePicker style={{ width: 140 }} />
                </Form.Item>

                <Form.Item name="description">
                    <Input
                        placeholder="备注（可选）"
                        style={{ width: 180 }}
                    />
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        icon={<PlusOutlined />}
                    >
                        添加
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};
