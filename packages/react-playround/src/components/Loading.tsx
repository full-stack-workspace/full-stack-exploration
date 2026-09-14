/**
 * @file Loading component
 */
import { Spin } from 'antd';

export const Loading = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
            <Spin size="large" />
            <p className="mt-4 text-gray-500 text-sm font-medium">加载中...</p>
        </div>
    );
};

