import React from 'react';
import {
    RiseOutlined,
    FallOutlined,
    WalletOutlined,
} from '@ant-design/icons';

interface SummaryCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    bgGradient: string;
}

const formatAmount = (value: number) =>
    `¥ ${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const SummaryCard: React.FC<SummaryCardProps> = ({
    title,
    value,
    icon,
    color,
    bgGradient,
}) => (
    <div
        className={`rounded-2xl p-5 ${bgGradient} border border-white/60 shadow-sm hover:shadow-md transition-shadow`}
    >
        <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">{title}</span>
            <div
                className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-white text-lg`}
            >
                {icon}
            </div>
        </div>
        <div className="text-2xl font-bold text-gray-800">
            {formatAmount(value)}
        </div>
    </div>
);

export interface SummaryCardsProps {
    totalIncome: number;
    totalExpense: number;
    balance: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
    totalIncome,
    totalExpense,
    balance,
}) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SummaryCard
            title="总收入"
            value={totalIncome}
            icon={<RiseOutlined />}
            color="bg-green-500"
            bgGradient="bg-gradient-to-br from-green-50 to-emerald-50"
        />
        <SummaryCard
            title="总支出"
            value={totalExpense}
            icon={<FallOutlined />}
            color="bg-red-500"
            bgGradient="bg-gradient-to-br from-red-50 to-rose-50"
        />
        <SummaryCard
            title="余额"
            value={balance}
            icon={<WalletOutlined />}
            color="bg-indigo-500"
            bgGradient="bg-gradient-to-br from-indigo-50 to-purple-50"
        />
    </div>
);
