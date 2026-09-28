/**
 * ============================================================================
 * ShipRecord — 上线前的六行性能档案
 * ============================================================================
 *
 * 排查给出证据链还不够。上线要能回答:改了什么、为何作用于瓶颈、前后数据、
 * 正确性与代价、以及线上如何守护。空表可以填,预设给一份可抄的样例。
 *
 * @module topics/performance/governance/diagnose/components/ShipRecord
 */

import { memo, useState } from 'react';
import { Button, Input } from 'antd';

interface RecordState {
    scene: string;
    goal: string;
    evidence: string;
    change: string;
    result: string;
    guard: string;
}

const FIELDS: { key: keyof RecordState; label: string }[] = [
    { key: 'scene', label: '场景' },
    { key: 'goal', label: '目标' },
    { key: 'evidence', label: '证据' },
    { key: 'change', label: '改动' },
    { key: 'result', label: '结果' },
    { key: 'guard', label: '守护' },
];

const SAMPLE: RecordState = {
    scene: '中端安卓 + 4G,商品搜索页输入关键词后看首屏结果',
    goal: '主体 LCP P75 < 2.5s;输入 INP P75 < 200ms;推荐允许晚到',
    evidence: '瀑布图显示推荐接口与主体串行,主体 HTML 被挡住 900ms',
    change: '推荐拆到独立 Suspense;不改查询实现,所以业务完成时间预期不变',
    result: '实验室主体 LCP 2.9s→1.8s;推荐完成 1.4s 不变;无 CLS 回归',
    guard: 'RUM 分路线监控 LCP;预算机器人拦首屏 JS +200KB;缓存 Key 含租户',
};

const EMPTY: RecordState = {
    scene: '',
    goal: '',
    evidence: '',
    change: '',
    result: '',
    guard: '',
};

export const ShipRecord = memo(() => {
    const [record, setRecord] = useState<RecordState>(EMPTY);

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <Button size="small" aria-label="填入样例档案" onClick={() => setRecord(SAMPLE)}>
                    填入样例
                </Button>
                <Button size="small" aria-label="清空档案" onClick={() => setRecord(EMPTY)}>
                    清空
                </Button>
            </div>
            <dl className="grid gap-3 sm:grid-cols-2">
                {FIELDS.map((field) => (
                    <div key={field.key} className="space-y-1">
                        <dt className="text-xs font-medium text-gray-500 dark:text-slate-400">
                            {field.label}
                        </dt>
                        <dd>
                            <Input.TextArea
                                aria-label={field.label}
                                rows={3}
                                value={record[field.key]}
                                onChange={(e) =>
                                    setRecord((curr) => ({ ...curr, [field.key]: e.target.value }))
                                }
                            />
                        </dd>
                    </div>
                ))}
            </dl>
            <p className="text-xs text-gray-400 dark:text-slate-500">
                比较时固定构建、设备、网络和数据规模。正确性(缓存失效、竞态、失败)和代价(内存、费用、维护)必须写进结果,不能只贴一个 Lighthouse 分数。
            </p>
        </div>
    );
});

ShipRecord.displayName = 'ShipRecord';
