/**
 * @file 购物车商品列表组件
 */

import React from 'react';
import type { ProductItem } from './interface';

// 商品分类组件
const Category: React.FC<{ category: string }> = ({ category }) => {
    return (
        <h3 className="text-lg font-bold text-gray-800">{category}</h3>
    );
}

// 商品项组件
const ProductItemComponent: React.FC<ProductItem> = ({ name, price, stock }) => {
    return (
        <div className="bg-white shadow-md rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center">
                <div className="ml-4">
                    <p className={`text-base font-bold ${!stock ? 'text-red-500' : 'text-gray-800'}`}>
                        {name}
                    </p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-base font-bold text-gray-800">${price.toFixed(2)}</p>
                <p className="text-sm text-gray-500">库存: {stock}</p>
                <button className="mt-2 px-4 py-2 bg-red-500 text-white rounded-md">Remove</button>
            </div>
        </div>
    );
};


// 商品列表组件
export const ProductList: React.FC<{ products: ProductItem[] }> = ({ products }) => {

    if (!products?.length) {
        return (
            <div className="text-center text-gray-500">
                购物车为空
            </div>
        );
    }

    const productByCategory: Record<string, ProductItem[]> = products.reduce((acc, product) => {
        acc[product.category] = acc[product.category] || [];
        acc[product.category].push(product);
        return acc;
    }, {} as Record<string, ProductItem[]>);

    return (
        <div className="space-y-4">
            {Object.entries(productByCategory).map(([category, productList]) => (
                <div key={category} className="space-y-2">
                    <Category category={category} />
                    {productList.map((product, index) => (
                        <ProductItemComponent key={index} {...product} />
                    ))}
                </div>
            ))}
        </div>
    );
}
