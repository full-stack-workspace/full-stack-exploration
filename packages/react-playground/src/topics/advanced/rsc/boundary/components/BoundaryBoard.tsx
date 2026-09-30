/**
 * ============================================================================
 * BoundaryBoard — 商品页的 RSC / Client 切分示意
 * ============================================================================
 *
 * 切换每个区域的归属,以及筛选是否直接 import 推荐。
 * 结论来自 model.ts。浏览器不会因此启动 Server Component。
 *
 * @module topics/advanced/rsc/boundary/components/BoundaryBoard
 */

import { memo, useState } from 'react';
import { Switch } from 'antd';

import { explain, INITIAL_STATE, PIECES, type Side } from '../model';

const LEVEL_CLASS = {
    error: 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-100',
    warn: 'border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100',
    ok: 'border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100',
} as const;

export const BoundaryBoard = memo(() => {
    const [side, setSide] = useState(INITIAL_STATE.side);
    const [importRecIntoFilter, setImportRecIntoFilter] = useState(false);
    const report = explain({ side, importRecIntoFilter });

    const setPiece = (id: string, next: Side) => {
        setSide((curr) => ({ ...curr, [id]: next }));
    };

    return (
        <div className="space-y-4">
            <ul className="grid gap-3">
                {PIECES.map((piece) => {
                    const current = side[piece.id] ?? 'server';
                    return (
                        <li
                            key={piece.id}
                            className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-950"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-800 dark:text-slate-100">
                                        {piece.title}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">{piece.job}</p>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        type="button"
                                        aria-pressed={current === 'server'}
                                        aria-label={`${piece.title}·服务端`}
                                        className={`rounded-full px-2 py-1 text-xs ${
                                            current === 'server'
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-white text-gray-500 dark:bg-slate-900 dark:text-slate-400'
                                        }`}
                                        onClick={() => setPiece(piece.id, 'server')}
                                    >
                                        Server
                                    </button>
                                    <button
                                        type="button"
                                        aria-pressed={current === 'client'}
                                        aria-label={`${piece.title}·客户端`}
                                        className={`rounded-full px-2 py-1 text-xs ${
                                            current === 'client'
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-white text-gray-500 dark:bg-slate-900 dark:text-slate-400'
                                        }`}
                                        onClick={() => setPiece(piece.id, 'client')}
                                    >
                                        Client
                                    </button>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                <Switch
                    size="small"
                    checked={importRecIntoFilter}
                    onChange={setImportRecIntoFilter}
                    aria-label="在筛选组件里 import 推荐列表"
                />
                在规格筛选文件里直接 import 推荐列表
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
                <section className="rounded-lg border border-gray-100 p-3 dark:border-slate-800">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-slate-400">会进浏览器包</h3>
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-gray-700 dark:text-slate-200">
                        {report.bundle.length === 0 ? <li>这一刀没有客户端模块</li> : null}
                        {report.bundle.map((name) => (
                            <li key={name}>{name}</li>
                        ))}
                    </ul>
                </section>
                <section className="rounded-lg border border-gray-100 p-3 dark:border-slate-800">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-slate-400">RSC 载荷里有什么</h3>
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-gray-700 dark:text-slate-200">
                        {report.payload.map((line) => (
                            <li key={line}>{line}</li>
                        ))}
                    </ul>
                </section>
            </div>
            <ul className="space-y-2">
                {report.findings.map((finding) => (
                    <li
                        key={finding.text}
                        className={`rounded-lg border px-3 py-2 text-xs leading-relaxed ${LEVEL_CLASS[finding.level]}`}
                    >
                        {finding.text}
                    </li>
                ))}
            </ul>
        </div>
    );
});

BoundaryBoard.displayName = 'BoundaryBoard';
