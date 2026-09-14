/**
 * @file 购物车页面
 */

import React, { useCallback, useState, useMemo } from 'react';

import type { ProductItem } from './interface';

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { SearchBar } from './SearchBar';
import { ProductList } from './ProductList';
import { allShoppingCartProducts } from './allShoppingCartProducts';

export interface SearchInfo {
    searchText: string;
    onlyShowInStock: boolean;
};

export const ShoppingCart: React.FC = () => {
    const [searchInfo, setSearchInfo] = useState<SearchInfo>({
        searchText: '',
        onlyShowInStock: false
    });
    console.log('state:', searchInfo);

    // 使用 useMemo 缓存过滤后的商品列表
    // useMemo 的作用：
    // 1. 避免在每次渲染时都进行过滤操作，提高性能
    // 2. 只有当 searchInfo 发生变化时，才会重新计算过滤后的商品列表
    const filteredProducts = useMemo(() => {
        return allShoppingCartProducts.filter((product: ProductItem) => {
            const nameMatch = product.name.toLowerCase().includes(searchInfo.searchText.toLowerCase());
            const stockMatch = searchInfo.onlyShowInStock ? product.stock > 0 : true;
            return nameMatch && stockMatch;
        });
    }, [searchInfo]);

    const onSearch = useCallback((value: SearchInfo) => {
        console.log('onSearch in ShoppingCart', value);
        setSearchInfo(value);
    }, [searchInfo]);

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">购物车</h3>
                <SearchBar
                    placeholder="搜索商品"
                    searchInfo={searchInfo}
                    onSearch={onSearch}
                />
                <div className="mt-8">
                    <ProductList products={filteredProducts} />
                </div>
            </main>
            <Footer />
        </div>
    );
}