/**
 * @file model.test.ts
 *
 * @description 边界规则:事件不能放 Server,密钥不能放 Client,Client 不能 import Server。
 */

import { describe, expect, it } from 'vitest';

import { explain, INITIAL_STATE } from './model';

describe('RSC 边界规则', () => {
    it('默认切分没有错误,并说明 children 槽', () => {
        const { findings, bundle, payload } = explain(INITIAL_STATE);
        expect(findings.some((item) => item.level === 'error')).toBe(false);
        expect(findings.some((item) => item.text.includes('children'))).toBe(true);
        expect(bundle).toContain('加入购物车');
        expect(bundle).not.toContain('商品正文');
        expect(payload.some((line) => line.startsWith('商品正文:服务端渲染结果'))).toBe(true);
    });

    it('把购物车标成 Server 会指出事件无法在服务端响应点击', () => {
        const { findings } = explain({
            ...INITIAL_STATE,
            side: { ...INITIAL_STATE.side, cart: 'server' },
        });
        expect(findings.some((item) => item.text.includes('加入购物车标成了 Server'))).toBe(true);
    });

    it('Client 直接 import Server 推荐是非法方向', () => {
        const { findings } = explain({ ...INITIAL_STATE, importRecIntoFilter: true });
        expect(findings.some((item) => item.text.includes('不能 import'))).toBe(true);
    });
});
