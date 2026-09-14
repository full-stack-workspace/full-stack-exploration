/**
 * @file 搜索栏组件
 */

import React, { useCallback } from "react";
import { Input, Checkbox, Button } from 'antd';
import type { CheckboxChangeEvent } from 'antd/lib/checkbox';
import type { SearchInfo } from './index';

// 搜索栏组件的属性接口
interface SearchBarProps {
    placeholder?: string;
    searchInfo: SearchInfo;
    onSearch: (value: SearchInfo) => void;
};

export const SearchBar: React.FC<SearchBarProps> = ({ placeholder, searchInfo, onSearch }) => {

    const onInputChangeHandler = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newSearchText = e.target.value;
        onSearch?.({
            searchText: newSearchText,
            onlyShowInStock: searchInfo?.onlyShowInStock || false,
        });
    }, [searchInfo, onSearch]);

    const onCheckboxChangeHandler = useCallback((e: CheckboxChangeEvent) => {
        const newChecked = e.target.checked;
        onSearch?.({
            searchText: searchInfo?.searchText || '',
            onlyShowInStock: newChecked,
        });
    }, [searchInfo, onSearch]);

    const onSearchHandler = useCallback(() => {
        onSearch?.({
            searchText: searchInfo?.searchText || '',
            onlyShowInStock: searchInfo?.onlyShowInStock || false,
        });
    }, [searchInfo, onSearch]);

    return (
        <div className="flex items-center bg-white rounded-md shadow-md p-2">
            <div className="flex flex-col gap-2">
                <Input
                    type="text"
                    placeholder={placeholder || 'Search...'}
                    value={searchInfo?.searchText || ''}
                    onChange={onInputChangeHandler}
                />
                <Checkbox checked={searchInfo?.onlyShowInStock || false} onChange={onCheckboxChangeHandler}>
                    仅显示有库存商品
                </Checkbox>
            </div>
            <Button type="primary" onClick={onSearchHandler}>搜索</Button>
        </div>
    );
}
