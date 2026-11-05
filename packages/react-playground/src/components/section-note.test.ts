/**
 * ============================================================================
 * section-note.test — 讲解要点解析契约
 * ============================================================================
 *
 * 锁住「标签 / 句子 / 字母分项 / 破折号」四种切分,避免渲染层改样式时把结构切坏。
 *
 * @module components/section-note.test
 */

import { describe, expect, it } from 'vitest';

import { parseSectionNote } from './section-note';

const IDENTITY_NOTE =
    '讲解要点:React Diff 用 key 配对新旧子节点 —— key 相同复用组件实例与 DOM(内部 state 保留),key 不同销毁重建。index 作 key 等于把「位置」当成身份:头部插入 / 反转 / 删除中间项后位置整体平移,实例原地复用,于是每行的备注 state 与数据错位。两栏共享同一份数据与操作,唯一变量就是 key —— 状态跟着人走还是留在原地,操作一次即见分晓。';

describe('parseSectionNote', () => {
    it('把讲解要点拆成标签、三句主张,以及破折号后的展开', () => {
        const parsed = parseSectionNote(IDENTITY_NOTE);

        expect(parsed.label).toBe('讲解要点');
        expect(parsed.points).toHaveLength(3);
        expect(parsed.points[0]).toEqual({
            marker: null,
            lead: 'React Diff 用 key 配对新旧子节点',
            details: ['key 相同复用组件实例与 DOM(内部 state 保留),key 不同销毁重建。'],
        });
        expect(parsed.points[1]?.lead).toContain('「位置」当成身份');
        expect(parsed.points[1]?.details).toEqual([]);
        expect(parsed.points[2]?.details).toEqual(['状态跟着人走还是留在原地,操作一次即见分晓。']);
    });

    it('没有标签、也没有第二句时保持整段', () => {
        expect(parseSectionNote('setState 支持函数式更新')).toEqual({
            label: null,
            points: [{ marker: null, lead: 'setState 支持函数式更新', details: [] }],
        });
    });

    it('问号也是断句,问自己留在标签上', () => {
        const parsed = parseSectionNote('问自己:这个值变了,屏幕要不要跟着变?要,用 state;不要,用 ref。');

        expect(parsed.label).toBe('问自己');
        expect(parsed.points.map((point) => point.lead)).toEqual([
            '这个值变了,屏幕要不要跟着变?',
            '要,用 state;不要,用 ref。',
        ]);
    });

    it('面试点的 a) b) c) 保留字母,不按句号打散', () => {
        const parsed = parseSectionNote(
            '面试点:a) index 作 key 仅在三个条件同时成立时可接受,缺一不可;b) missing key 警告只在开发环境出现。它意味着按位置配对;c) key 只参与 Diff 配对,不渲染到 DOM。',
        );

        expect(parsed.label).toBe('面试点');
        expect(parsed.points.map((point) => point.marker)).toEqual(['a', 'b', 'c']);
        expect(parsed.points[1]?.lead).toBe('missing key 警告只在开发环境出现。它意味着按位置配对');
    });

    it('「面试点 a:」里的字母是第一条序号,书名号里的冒号不构成标签', () => {
        const parsed = parseSectionNote(
            '面试点 a:React 17+ 已移除池化。面试点 b(最经典):Portal 里的事件沿组件树冒泡。',
        );

        expect(parsed.label).toBe('面试点');
        expect(parsed.points.map((point) => [point.marker, point.lead])).toEqual([
            ['a', 'React 17+ 已移除池化。'],
            ['b', '（最经典）Portal 里的事件沿组件树冒泡。'],
        ]);

        const quoted = parseSectionNote('点「命令:清空」应清掉默认文字。');
        expect(quoted.label).toBeNull();
        expect(quoted.points[0]?.lead).toContain('「命令:清空」');
    });

    it('长句开头的冒号不是标签', () => {
        const parsed = parseSectionNote('手写订阅有两个结构性缺陷:订阅时间窗口与 tearing');

        expect(parsed.label).toBeNull();
        expect(parsed.points[0]?.lead).toBe('手写订阅有两个结构性缺陷:订阅时间窗口与 tearing');
    });

    it('空白原文不产生要点', () => {
        expect(parseSectionNote('   ')).toEqual({ label: null, points: [] });
    });
});
