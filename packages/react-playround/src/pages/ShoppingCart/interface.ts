/**
 * @file 购物车商品列表组件接口定义
 */

export enum Category {
    FreshFruit = '新鲜水果',
    MeatEggs = '肉禽蛋',
    Vegetables = '蔬菜',
    Others = '其他'
}

export interface ProductItem {
    id: string;
    name: string;
    category: Category;
    price: number;
    stock: number;
    description?: string;
}

