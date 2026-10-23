/**
 * @file series.test.ts
 *
 * @description 原理与架构十页的路径必须都能在专题注册表里找到,且总览排在第一、理解检验收在最后。
 */

import { describe, expect, it } from 'vitest';

import { TOPICS } from '../../config/topics';
import { ARCHITECTURE_SERIES } from './series';

describe('原理与架构系列目录', () => {
    it('SeriesNav 里的每个 path 都已注册', () => {
        const registered = new Set(TOPICS.map((t) => t.path));
        ARCHITECTURE_SERIES.forEach((series) => {
            series.links.forEach((link) => {
                expect(registered.has(link.to)).toBe(true);
            });
        });
    });

    it('设计约束是分类第一页', () => {
        const paths = TOPICS.filter((t) => t.category === 'architecture').map((t) => t.path);
        expect(paths[0]).toBe('/architecture/constraints');
        expect(paths[paths.length - 1]).toBe('/architecture/check');
        expect(paths).toHaveLength(12);
        expect(ARCHITECTURE_SERIES.flatMap((series) => series.links.map((link) => link.to)).join(' ')).not.toContain(
            '/architecture/source/',
        );
    });
});
