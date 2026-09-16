/**
 * ============================================================================
 * index.test.tsx — Agent 对话运行时演示页冒烟测试
 * ============================================================================
 *
 * 端到端走通演示页主链路:发起 Run → 剧本事件流入 Store →
 * UI 呈现流式结果 / Run 状态迁移 / 事件日志(含被忽略的重复·非法事件)。
 *
 * @module topics/agent/agent-chat/index.test
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '../../../test/utils';

import AgentChatTopic from './index';

/** 剧本总时长远小于该值,一次性推进即可播完 */
const FULL_SCRIPT_MS = 15000;

describe('Agent 对话运行时演示页', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('初始渲染:页头、控制台与空会话提示', () => {
        render(<AgentChatTopic />);

        expect(screen.getByText('Agent 对话运行时')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /发起 Run/ })).toBeInTheDocument();
        expect(screen.getByText('会话尚未开始')).toBeInTheDocument();
        expect(screen.getByText('未开始')).toBeInTheDocument();
    });

    it('完整播完一次 Run:状态迁移、流式内容、工具卡片与产物面板全部落地', () => {
        render(<AgentChatTopic />);

        fireEvent.click(screen.getByRole('button', { name: /发起 Run/ }));
        act(() => {
            vi.advanceTimersByTime(FULL_SCRIPT_MS);
        });

        // Run 状态迁移到终态
        expect(screen.getAllByText('已完成').length).toBeGreaterThan(0);
        // text part 流式内容的结尾片段
        expect(screen.getByText(/Selector 才能精准订阅。/)).toBeInTheDocument();
        // tool part 结果摘要
        expect(screen.getByText(/检索到 3 篇相关文档/)).toBeInTheDocument();
        // artifact part 内容
        expect(screen.getByText(/Runtime Store 协议清单/)).toBeInTheDocument();
    });

    it('事件日志:重复 eventId 与非法状态迁移被标灰忽略', () => {
        render(<AgentChatTopic />);

        fireEvent.click(screen.getByRole('button', { name: /发起 Run/ }));
        act(() => {
            vi.advanceTimersByTime(FULL_SCRIPT_MS);
        });

        // 两条陷阱事件均被忽略
        const ignored = screen.getAllByText('已忽略 · 快照不变');
        expect(ignored).toHaveLength(2);
        // 重复事件文本没有进入 UI
        expect(screen.queryByText(/重复事件,不应出现/)).not.toBeInTheDocument();
    });

    it('重置会话:清空会话与事件日志,可重新发起', () => {
        render(<AgentChatTopic />);

        fireEvent.click(screen.getByRole('button', { name: /发起 Run/ }));
        act(() => {
            vi.advanceTimersByTime(FULL_SCRIPT_MS);
        });

        fireEvent.click(screen.getByRole('button', { name: /重置会话/ }));
        expect(screen.getByText('会话尚未开始')).toBeInTheDocument();
        expect(screen.getByText('未开始')).toBeInTheDocument();

        // 去重记录已清空,同一剧本可完整重放
        fireEvent.click(screen.getByRole('button', { name: /发起 Run/ }));
        act(() => {
            vi.advanceTimersByTime(FULL_SCRIPT_MS);
        });
        expect(screen.getAllByText('已完成').length).toBeGreaterThan(0);
    });

    it('暂停后继续:事件流可从断点恢复', () => {
        render(<AgentChatTopic />);

        fireEvent.click(screen.getByRole('button', { name: /发起 Run/ }));
        act(() => {
            vi.advanceTimersByTime(1000);
        });

        fireEvent.click(screen.getByRole('button', { name: /暂停/ }));
        const logLengthWhenPaused = document.querySelectorAll('.font-mono ul li').length;
        act(() => {
            vi.advanceTimersByTime(FULL_SCRIPT_MS);
        });
        // 暂停期间不再有新事件流入
        expect(document.querySelectorAll('.font-mono ul li')).toHaveLength(logLengthWhenPaused);

        fireEvent.click(screen.getByRole('button', { name: /继续/ }));
        act(() => {
            vi.advanceTimersByTime(FULL_SCRIPT_MS);
        });
        expect(screen.getAllByText('已完成').length).toBeGreaterThan(0);
    });
});
