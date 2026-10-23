/**
 * @file DiffDemo.test.ts
 *
 * @description 锁住 lastPlacedIndex 教学模型:头部插入不把旧节点都标成移动,交换只移动往回跳的那一个。
 */

import { describe, expect, it } from 'vitest';

import { diffKeys } from './DiffDemo';

const PREV = ['a', 'b', 'c', 'd'];

describe('diffKeys', () => {
    it('尾部插入只新建最后一项', () => {
        expect(diffKeys(PREV, ['a', 'b', 'c', 'd', 'e']).map((row) => row.op)).toEqual([
            '复用',
            '复用',
            '复用',
            '复用',
            '新建',
        ]);
    });

    it('头部插入只新建新 key,旧节点留在原地', () => {
        expect(diffKeys(PREV, ['e', 'a', 'b', 'c', 'd']).map((row) => `${row.op}:${row.key}`)).toEqual([
            '新建:e',
            '复用:a',
            '复用:b',
            '复用:c',
            '复用:d',
        ]);
    });

    it('交换相邻两项时,只有旧序号更小的那个标记为移动', () => {
        expect(diffKeys(PREV, ['a', 'c', 'b', 'd']).map((row) => `${row.op}:${row.key}`)).toEqual([
            '复用:a',
            '复用:c',
            '移动:b',
            '复用:d',
        ]);
    });

    it('删除中间项后,后面的 key 仍复用', () => {
        expect(diffKeys(PREV, ['a', 'c', 'd']).map((row) => `${row.op}:${row.key}`)).toEqual([
            '复用:a',
            '复用:c',
            '复用:d',
            '删除:b',
        ]);
    });
});
