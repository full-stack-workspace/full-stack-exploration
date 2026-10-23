import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { TOPICS } from '../../../config/topics';
import MapPage from './index';

const SOURCE_PATHS = [
    '/architecture/source/work-loop',
    '/architecture/source/begin-work',
    '/architecture/source/complete-work',
    '/architecture/source/commit',
    '/architecture/source/hooks',
    '/architecture/source/lanes',
    '/architecture/source/scheduler',
];

describe('阅读地图', () => {
    it('站内专题是链接，源码架只是文字', () => {
        render(
            <MemoryRouter>
                <MapPage />
            </MemoryRouter>,
        );
        expect(screen.getByRole('link', { name: '列表与 key' })).toHaveAttribute('href', '/basics/list-key');
        expect(screen.getByRole('link', { name: '事件与合成事件' })).toHaveAttribute('href', '/basics/event');
        expect(screen.getByRole('link', { name: 'useTransition × useDeferredValue' })).toHaveAttribute(
            'href',
            '/performance/transition-deferred',
        );
        expect(screen.getByRole('link', { name: 'RSC · 深度梳理' })).toHaveAttribute('href', '/advanced/rsc-guide');
        expect(screen.getByText('React 19 的 react-reconciler 与 scheduler')).toBeInTheDocument();

        for (const path of SOURCE_PATHS) {
            expect(screen.getByText(path)).toBeInTheDocument();
            expect(screen.queryByRole('link', { name: path })).not.toBeInTheDocument();
        }
        const registered = TOPICS.map((topic) => topic.path);
        for (const path of SOURCE_PATHS) {
            expect(registered).not.toContain(path);
        }
    });
});
