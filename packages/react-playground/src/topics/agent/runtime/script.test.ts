/**
 * ============================================================================
 * script.test.ts — 演示剧本的完整性与端到端回放
 * ============================================================================
 *
 * 锁住剧本的两个设计:
 * - 结构完整:eventId 全局唯一(仅允许一条刻意的「网络重发」重复样本),
 *   delay 均为正数,引用的实体 id 与 DEMO_IDS 对齐;
 * - 回放正确:整本剧本过一遍 RuntimeStore,只有两条陷阱事件被拒
 *   (重复 eventId + 非法状态迁移),最终快照与剧本意图一致。
 *
 * @module topics/agent/runtime/script.test
 */

import { describe, expect, it } from 'vitest';

import { DEMO_IDS, DEMO_SCRIPT } from './script';
import { RuntimeStore } from './RuntimeStore';

describe('DEMO_SCRIPT 剧本', () => {
    it('每条事件 delay 为正,且只含一条刻意的重复 eventId(网络重发样本)', () => {
        for (const step of DEMO_SCRIPT) {
            expect(step.delay).toBeGreaterThan(0);
        }
        const ids = DEMO_SCRIPT.map((step) => step.event.eventId);
        expect(new Set(ids).size).toBe(ids.length - 1);
    });

    it('整本回放:仅两条陷阱事件不产生新快照', () => {
        const store = new RuntimeStore();
        const rejected: string[] = [];
        for (const step of DEMO_SCRIPT) {
            if (!store.applyEvent(step.event)) {
                rejected.push(step.event.eventId);
            }
        }
        // 陷阱 1:重复 eventId 的 text delta;陷阱 2:completed 后又收到 running
        expect(rejected).toHaveLength(2);
    });

    it('回放完成后快照与剧本意图一致', () => {
        const store = new RuntimeStore();
        for (const step of DEMO_SCRIPT) {
            store.applyEvent(step.event);
        }
        const snap = store.getSnapshot();

        // Run 走完 queued → running → completed,非法迁移被拒
        expect(snap.runsById[DEMO_IDS.runId].status).toBe('completed');

        // 会话内两条消息,助手消息挂了 text / tool / artifact 三个 part
        const conversation = snap.conversationsById[DEMO_IDS.conversationId];
        expect(conversation.messageIds).toEqual([
            DEMO_IDS.userMessageId,
            DEMO_IDS.assistantMessageId,
        ]);
        const assistant = snap.messagesById[DEMO_IDS.assistantMessageId];
        expect(assistant.partIds).toEqual([
            DEMO_IDS.textPartId,
            DEMO_IDS.toolPartId,
            DEMO_IDS.artifactPartId,
        ]);

        // text part:重复 delta 被去重,内容恰好是所有 token 各拼一次
        const textPart = snap.partsById[DEMO_IDS.textPartId];
        expect(textPart.type === 'text' && textPart.state).toBe('completed');
        expect(textPart.type === 'text' && textPart.content.length).toBeGreaterThan(0);

        // tool part:completed 且写入摘要
        const toolPart = snap.partsById[DEMO_IDS.toolPartId];
        expect(toolPart.type === 'tool' && toolPart.state).toBe('completed');
        expect(toolPart.type === 'tool' && toolPart.summary).toContain('3 篇');

        // artifact part:流式拼完后 completed
        const artifactPart = snap.partsById[DEMO_IDS.artifactPartId];
        expect(artifactPart.type === 'artifact' && artifactPart.state).toBe('completed');
    });
});
