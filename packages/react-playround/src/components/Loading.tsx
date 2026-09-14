/**
 * @file Loading component
 *
 * @description 内容区内的加载占位,不撑满全屏(嵌入 Layout.Content 使用)
 */
import { Spin } from 'antd';

export const Loading = () => {
    return (
        <div className="flex flex-col items-center justify-center py-24">
            <Spin size="large" />
            <p className="mt-4 text-gray-500 text-sm font-medium">加载中...</p>
        </div>
    );
};
