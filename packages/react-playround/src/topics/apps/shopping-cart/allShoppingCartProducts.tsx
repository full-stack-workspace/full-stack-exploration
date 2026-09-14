/**
 * @file 购物车商品列表数据
 */

import { type ProductItem, Category } from './interface';

export const allShoppingCartProducts: ProductItem[] = [
    // 新鲜水果 (FreshFruit)
    {
        id: '001',
        name: 'Apple',
        category: Category.FreshFruit,
        price: 8.5,
        stock: 100,
        description: 'Fresh red apples from Fuji'
    },
    {
        id: '002',
        name: 'Orange',
        category: Category.FreshFruit,
        price: 6.0,
        stock: 0,
        description: 'Sweet navel oranges'
    },
    {
        id: '003',
        name: 'Banana',
        category: Category.FreshFruit,
        price: 4.5,
        stock: 120,
        description: 'Organic bananas'
    },
    // 肉禽蛋 (MeatEggs)
    {
        id: '004',
        name: 'Chicken Breast',
        category: Category.MeatEggs,
        price: 25.0,
        stock: 50,
        description: 'Boneless chicken breast'
    },
    {
        id: '005',
        name: 'Eggs (12 pack)',
        category: Category.MeatEggs,
        price: 15.0,
        stock: 200,
        description: 'Farm fresh eggs'
    },
    {
        id: '006',
        name: 'Pork Loin',
        category: Category.MeatEggs,
        price: 35.0,
        stock: 40,
        description: 'Lean pork loin chops'
    },
    // 蔬菜 (Vegetables)
    {
        id: '007',
        name: 'Broccoli',
        category: Category.Vegetables,
        price: 7.0,
        stock: 60,
        description: 'Fresh green broccoli'
    },
    {
        id: '008',
        name: 'Carrots',
        category: Category.Vegetables,
        price: 3.5,
        stock: 150,
        description: 'Organic carrots'
    },
    {
        id: '009',
        name: 'Tomatoes',
        category: Category.Vegetables,
        price: 5.0,
        stock: 90,
        description: 'Ripe red tomatoes'
    },
    // 其他 (Others)
    {
        id: '010',
        name: 'Milk',
        category: Category.Others,
        price: 12.0,
        stock: 100,
        description: 'Fresh whole milk'
    },
    {
        id: '011',
        name: 'Bread',
        category: Category.Others,
        price: 8.0,
        stock: 70,
        description: 'Whole wheat bread'
    },
    {
        id: '012',
        name: 'Rice',
        category: Category.Others,
        price: 15.0,
        stock: 200,
        description: 'Premium jasmine rice'
    }
];
