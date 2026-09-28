/**
 * @file index.test.tsx
 *
 * @description 排查页按现象给出不同的假设模板,并能填写上线档案。
 */

import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import DiagnoseLab from './index';

function renderLab() {
    return render(
        <MemoryRouter>
            <DiagnoseLab />
        </MemoryRouter>,
    );
}

describe('性能治理 · 排查演练', () => {
    it('默认输入卡的假设区分响应与查询完成时间', () => {
        renderLab();
        expect(screen.getByRole('heading', { name: '性能治理 · 排查演练' })).toBeInTheDocument();
        expect(screen.getByText(/查询完成时间可能不变/)).toBeInTheDocument();
    });

    it('切到 AI 觉得慢后,假设变成开场白而不是网关', () => {
        renderLab();
        fireEvent.click(screen.getByText('AI 觉得慢'));
        expect(screen.getByText(/压缩开场白后 TTFUI 应明显下降/)).toBeInTheDocument();
    });

    it('填入样例后六行档案里能看到证据', () => {
        renderLab();
        fireEvent.click(screen.getByRole('button', { name: '填入样例档案' }));
        expect((screen.getByLabelText('证据') as HTMLTextAreaElement).value).toMatch(
            /推荐接口与主体串行/,
        );
    });
});
