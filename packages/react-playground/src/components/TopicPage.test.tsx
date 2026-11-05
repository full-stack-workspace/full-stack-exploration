/**
 * ============================================================================
 * TopicPage.test — 分区讲解要点的渲染
 * ============================================================================
 *
 * 确认 note 以强调块呈现,而不是灰色附注。
 *
 * @module components/TopicPage.test
 */

import { describe, expect, it } from 'vitest';

import { render, screen } from '../test/utils';
import { TopicSection } from './TopicPage';

describe('TopicSection note', () => {
    it('把讲解要点渲染成带标签和编号的强调块', () => {
        render(
            <TopicSection
                title="实验"
                note="讲解要点:React Diff 用 key 配对新旧子节点 —— key 相同复用。index 作 key 等于把「位置」当成身份。"
            >
                <p>演示</p>
            </TopicSection>,
        );

        expect(screen.getByRole('note')).toBeInTheDocument();
        expect(screen.getByText('讲解要点')).toBeInTheDocument();
        expect(screen.getByText('React Diff 用 key 配对新旧子节点')).toBeInTheDocument();
        expect(screen.getByText('key 相同复用。')).toBeInTheDocument();
        expect(screen.getByText('「位置」')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('演示')).toBeInTheDocument();
    });

    it('没有 note 时不渲染强调块', () => {
        render(
            <TopicSection title="收支明细">
                <p>表格</p>
            </TopicSection>,
        );

        expect(screen.queryByRole('note')).not.toBeInTheDocument();
    });
});
