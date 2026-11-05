/**
 * ============================================================================
 * CodeBlock.test — 代码块的纯文本与语法高亮
 * ============================================================================
 *
 * 不传 language 时保持整段纯文本;传入语言后关键字、注释、标签分色,
 * 标题栏标出语言名。专题页的每处 CodeBlock 都必须声明 language。
 *
 * @module components/CodeBlock.test
 */

import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { render, screen } from '../test/utils';
import { CodeBlock } from './CodeBlock';

const SNIPPET = `function hello() {
    // 中文注释
    return <div className="box">hi</div>;
}`;

describe('CodeBlock', () => {
    it('不传 language 时整段纯文本渲染,不出现语言标签', () => {
        render(<CodeBlock title="plain.ts" code={SNIPPET} />);

        expect(screen.getByText(/function hello/)).toBeInTheDocument();
        expect(screen.getByText('plain.ts')).toBeInTheDocument();
        expect(screen.queryByText('TSX')).not.toBeInTheDocument();
        expect(screen.queryByText('function')).not.toBeInTheDocument();
    });

    it('language="tsx" 时关键字、注释、标签分色,并标出 TSX', () => {
        render(<CodeBlock title="UserForm.tsx" language="tsx" code={SNIPPET} />);

        expect(screen.getByText('TSX')).toBeInTheDocument();
        expect(screen.getByText('function')).toHaveStyle({ color: '#c4b5fd' });
        expect(screen.getByText('// 中文注释')).toHaveStyle({ color: '#9ca3af', fontStyle: 'italic' });
        expect(screen.getAllByText('div')[0]).toHaveStyle({ color: '#f472b6' });
        expect(screen.getByText('className')).toHaveStyle({ color: '#fbbf24' });
        expect(screen.getByText('box')).toHaveStyle({ color: '#86efac' });
    });

    it('language="html" 按标记语言着色', () => {
        render(<CodeBlock language="html" code={'<button type="submit">保存</button>'} />);

        expect(screen.getByText('HTML')).toBeInTheDocument();
        expect(screen.getAllByText('button')[0]).toHaveStyle({ color: '#f472b6' });
        expect(screen.getByText('type')).toHaveStyle({ color: '#fbbf24' });
    });

    it('专题页的每个 CodeBlock 都声明了 language', () => {
        const root = path.resolve(__dirname, '../topics');
        const missing: string[] = [];

        const walk = (dir: string) => {
            for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    walk(fullPath);
                    continue;
                }
                if (!entry.name.endsWith('.tsx')) {
                    continue;
                }

                const source = fs.readFileSync(fullPath, 'utf8');
                let cursor = 0;
                while (cursor < source.length) {
                    const start = source.indexOf('<CodeBlock', cursor);
                    if (start < 0) {
                        break;
                    }
                    const codeAt = source.indexOf('code=', start);
                    const header = source.slice(start, codeAt === -1 ? start + 240 : codeAt);
                    if (!/\blanguage=/.test(header)) {
                        const line = source.slice(0, start).split('\n').length;
                        missing.push(`${path.relative(root, fullPath)}:${line}`);
                    }
                    cursor = start + '<CodeBlock'.length;
                }
            }
        };

        walk(root);
        expect(missing).toEqual([]);
    });

    it('language="text" 关闭高亮', () => {
        render(<CodeBlock language="text" code="const n = 1;" />);

        expect(screen.getByText('const n = 1;')).toBeInTheDocument();
        expect(screen.queryByText('TEXT')).not.toBeInTheDocument();
    });
});
