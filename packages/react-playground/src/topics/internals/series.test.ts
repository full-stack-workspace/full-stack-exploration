/**
 * @file series.test.ts
 *
 * @description 内部机制十页的路径必须都能在专题注册表里找到,且总览排在第一、理解检验收在最后。
 */

import { describe, expect, it } from 'vitest';

import { TOPICS } from '../../config/topics';
import { INTERNALS_SERIES } from './series';

describe('内部机制系列目录', () => {
    it('SeriesNav 里的每个 path 都已注册', () => {
        const registered = new Set(TOPICS.map((t) => t.path));
        INTERNALS_SERIES.forEach((series) => {
            series.links.forEach((link) => {
                expect(registered.has(link.to)).toBe(true);
            });
        });
    });

    it('运行时总览是分类第一页', () => {
        const paths = TOPICS.filter((t) => t.category === 'internals').map((t) => t.path);
        expect(paths[0]).toBe('/internals/runtime-map');
        expect(paths[paths.length - 1]).toBe('/internals/interview');
        expect(paths).toHaveLength(10);
    });
});
