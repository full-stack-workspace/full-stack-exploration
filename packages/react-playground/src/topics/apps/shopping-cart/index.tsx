/**
 * ============================================================================
 * 购物车(/apps/shopping-cart)
 * ============================================================================
 *
 * 综合应用:商品列表、搜索过滤与状态派生计算。
 * 页面持有搜索状态(关键字 / 仅看有货),商品列表由 useMemo 从静态数据派生,
 * 骨架复用全站统一的 TopicPage / TopicSection。
 *
 * @module topics/apps/shopping-cart
 */

import { memo, useCallback, useMemo, useState } from 'react';

import { TopicPage, TopicSection } from '../../../components/TopicPage';
import type { ProductItem, SearchInfo } from './interface';
import { SearchBar } from './SearchBar';
import { ProductList } from './ProductList';
import { allShoppingCartProducts } from './allShoppingCartProducts';

const ShoppingCart = memo(() => {
    const [searchInfo, setSearchInfo] = useState<SearchInfo>({
        searchText: '',
        onlyShowInStock: false
    });

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
        setSearchInfo(value);
    }, []);

    return (
        <TopicPage
            title="购物车"
            description="商品列表、搜索过滤与状态派生计算 —— 搜索状态单向流入,列表由 useMemo 派生"
        >
            <TopicSection
                title="商品搜索"
                note="受控搜索栏:关键字与「仅显示有库存」合并为一个 SearchInfo 状态,变更即触发列表派生"
            >
                <SearchBar
                    placeholder="搜索商品"
                    searchInfo={searchInfo}
                    onSearch={onSearch}
                />
            </TopicSection>

            <TopicSection
                title="商品列表"
                note="按分类分组的商品清单,过滤逻辑纯函数化,无冗余状态"
            >
                <ProductList products={filteredProducts} />
            </TopicSection>
        </TopicPage>
    );
});

ShoppingCart.displayName = 'ShoppingCart';

export default ShoppingCart;
