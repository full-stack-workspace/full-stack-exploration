/**
 * ============================================================================
 * section-note — TopicSection 讲解要点的结构解析
 * ============================================================================
 *
 * 专题页的 note 是写给开发者的重点,但原文是一整段。作者已经用标签、
 * 句号、分项字母和破折号标出了结构,这里只把这些标记还原成可扫读的要点,
 * 不要求每个专题改写文案。
 *
 * @module components/section-note
 */

/** 破折号前的主张,以及破折号后的展开 */
export interface NotePoint {
    /** 分项字母(a/b/c);普通句子为 null,渲染时再编号 */
    marker: string | null;
    /** 破折号前的一句;没有破折号时是整句 */
    lead: string;
    /** 破折号后的展开,一段一个元素 */
    details: string[];
}

export interface ParsedSectionNote {
    /** 冒号前的短标签,如「讲解要点」「玩法」;没有则为 null */
    label: string | null;
    points: NotePoint[];
}

/**
 * 标签是冒号前 2–6 个字的类目名。更长的前缀是句子本身
 * (如「手写订阅有两个结构性缺陷:…」),不能当成标签切掉。
 */
const LABEL_RE = /^([^\s：:。；;——「」]{2,6}(?:\s[a-d])?)[：:]\s*/;

/** 同一段里至少两处 a) / b) / 面试点 b: 才当成枚举,避免误切正文里的单个字母 */
const LETTER_RE = /(?:^|(?<=[;；。]))\s*(?:面试点\s*)?([a-d])(?:\(([^)]{0,12})\))?[)）:：]\s*/g;

const SENTENCE_RE = /(?<=[。？?])/;

interface RawPoint {
    marker: string | null;
    text: string;
}

/**
 * 把 TopicSection 的 note 原文拆成标签和要点。
 *
 * @param note - 专题作者写在 note 上的原文
 * @returns 标签与要点;原文为空时 points 为空数组
 *
 * @example
 * parseSectionNote('讲解要点:同 key 复用。index 作 key 会错位。')
 */
export const parseSectionNote = (note: string): ParsedSectionNote => {
    const trimmed = note.trim();
    if (!trimmed) {
        return { label: null, points: [] };
    }

    let label: string | null = null;
    let body = trimmed;
    const labelMatch = LABEL_RE.exec(trimmed);
    if (labelMatch) {
        label = labelMatch[1];
        body = trimmed.slice(labelMatch[0].length);
        // 「面试点 a:…。面试点 b:…」里的 a 是第一条的序号,不是标签的一部分
        const letteredLabel = label.match(/^(.*)\s+([a-d])$/);
        if (letteredLabel) {
            label = letteredLabel[1];
            body = `${letteredLabel[2]}) ${body}`;
        }
    }

    const raw = splitLettered(body) ?? splitSentences(body);
    const points = raw.map(toPoint).filter((point) => point.lead.length > 0);
    return { label, points };
};

/** 按 a) b) 或「面试点 b:」切开;不足两项时返回 null,交给按句拆分 */
const splitLettered = (body: string): RawPoint[] | null => {
    const matches = [...body.matchAll(LETTER_RE)];
    if (matches.length < 2) {
        return null;
    }

    return matches.map((match, index) => {
        const start = (match.index ?? 0) + match[0].length;
        const end = index + 1 < matches.length ? (matches[index + 1].index ?? body.length) : body.length;
        const extra = match[2];
        const text = body.slice(start, end).replace(/[;；]\s*$/, '').trim();
        return {
            marker: match[1],
            text: extra ? `（${extra}）${text}` : text,
        };
    });
};

/** 按句号和问号切开;只有一句时保持整段,避免单条列表 */
const splitSentences = (body: string): RawPoint[] => {
    const parts = body
        .split(SENTENCE_RE)
        .map((part) => part.trim())
        .filter((part) => part.length > 0);

    if (parts.length < 2) {
        return [{ marker: null, text: body.trim() }];
    }

    return parts.map((text) => ({ marker: null, text }));
};

/** 破折号之后是对主张的展开,单独成行,不再和主张挤在同一句里 */
const toPoint = (raw: RawPoint): NotePoint => {
    let text = raw.text;
    let marker = raw.marker;

    if (!marker) {
        const inline = text.match(/^(?:面试点\s*)?([a-d])(?:\(([^)]{0,12})\))?[)）:：]\s*/);
        if (inline) {
            marker = inline[1];
            text = text.slice(inline[0].length);
            if (inline[2]) {
                text = `（${inline[2]}）${text}`;
            }
        }
    }

    const segments = text
        .split(/\s*(?:——|—)\s*/)
        .map((segment) => segment.trim())
        .filter((segment) => segment.length > 0);

    return {
        marker,
        lead: segments[0] ?? text,
        details: segments.slice(1),
    };
};
