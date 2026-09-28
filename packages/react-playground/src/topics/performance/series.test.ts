/**
 * @file series.test.ts
 *
 * @description 性能三条系列的路径必须都能在专题注册表里找到。
 */

import { describe, expect, it } from 'vitest';

import { TOPICS } from '../../config/topics';
import { PERFORMANCE_SERIES } from './series';

describe('性能优化系列目录', () => {
    it('SeriesNav 里的每个 path 都已注册', () => {
        const registered = new Set(TOPICS.map((t) => t.path));
        PERFORMANCE_SERIES.forEach((series) => {
            series.links.forEach((link) => {
                expect(registered.has(link.to)).toBe(true);
            });
        });
    });

    it('治理系列排在渲染调度之前,侧栏先看到原则再看到 API', () => {
        const paths = TOPICS.filter((t) => t.category === 'performance').map((t) => t.path);
        expect(paths[0]).toBe('/performance/governance-guide');
        expect(paths.indexOf('/performance/governance-guide')).toBeLessThan(
            paths.indexOf('/performance/transition-deferred'),
        );
    });
});
