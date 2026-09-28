/**
 * ============================================================================
 * PactCard — 关键页面的性能约定表
 * ============================================================================
 *
 * 需求阶段就要写清「快」的业务含义。本组件用商品搜索页做一份可改的约定,
 * 生成验收口径;不是装饰表,改字段会改变下方验收清单。
 *
 * @module topics/performance/governance/components/PactCard
 */

import { memo, useState } from 'react';
import { Input, Select } from 'antd';

interface PactState {
    task: string;
    firstUseful: string;
    urgent: string;
    later: string;
    staleOk: string;
    freshness: string;
    device: string;
}

const INITIAL: PactState = {
    task: '输入条件,查看结果,进入商品详情',
    firstUseful: '搜索框可操作,首批结果和关键图片可见',
    urgent: '输入回显、点击、选中反馈',
    later: '推荐内容、结果统计、屏外图片',
    staleOk: '旧结果可保留,但必须标明正在更新及所属条件',
    freshness: '商品介绍可缓存;交易前价格和库存必须重新确认',
    device: '目标中端安卓 + 4G,列表上限 200 条/页',
};

const FIELDS: { key: keyof PactState; label: string }[] = [
    { key: 'task', label: '用户的主要任务' },
    { key: 'firstUseful', label: '首次可用的定义' },
    { key: 'urgent', label: '必须立即响应' },
    { key: 'later', label: '可以稍后完成' },
    { key: 'staleOk', label: '可以暂时展示旧内容' },
    { key: 'freshness', label: '数据新鲜度' },
    { key: 'device', label: '目标运行条件' },
];

export const PactCard = memo(() => {
    const [preset, setPreset] = useState<'search' | 'chat' | 'voice'>('search');
    const [pact, setPact] = useState<PactState>(INITIAL);

    const applyPreset = (next: typeof preset) => {
        setPreset(next);
        if (next === 'search') {
            setPact(INITIAL);
            return;
        }
        if (next === 'chat') {
            setPact({
                task: '提问,看到第一个有用信息,必要时停止或追问',
                firstUseful: '输入框可操作;发送后出现思考反馈,并在预算内见到第一条有用信息',
                urgent: '发送按钮、停止生成、输入回显',
                later: '完整回答、引用展开、推荐追问',
                staleOk: '上一次回答可留在屏幕;新回答必须标所属提问',
                freshness: '工具调用结果当场有效;知识库可缓存但要标明时间',
                device: '桌面 Chrome + 云端模型,单次上下文不超过窗口 80%',
            });
            return;
        }
        setPact({
            task: '说话,被听懂,在对话感时限内被接话或被允许打断',
            firstUseful: 'VAD 判定说完后,AI 在 300ms 内开始出声或给出可视反馈',
            urgent: '打断(barge-in)、停止、静音指示',
            later: '转写全文、会后摘要',
            staleOk: '不允许播过期回复;旧音频必须立刻掐掉',
            freshness: '实时音频不可缓存;模型热加载可复用',
            device: '中端手机 + 弱网,本地小模型可作降级',
        });
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                <span>场景预设</span>
                <Select
                    aria-label="性能约定场景"
                    size="small"
                    value={preset}
                    className="min-w-40"
                    onChange={applyPreset}
                    options={[
                        { value: 'search', label: '商品搜索页(传统 Web)' },
                        { value: 'chat', label: 'AI 对话(AI-Native)' },
                        { value: 'voice', label: '语音 Agent(实时)' },
                    ]}
                />
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
                                value={pact[field.key]}
                                onChange={(e) =>
                                    setPact((curr) => ({ ...curr, [field.key]: e.target.value }))
                                }
                            />
                        </dd>
                    </div>
                ))}
            </dl>
            <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-3 text-xs leading-relaxed text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
                <p className="font-semibold">据此写出的验收口径</p>
                <ul className="mt-2 list-disc space-y-1 pl-4">
                    <li>首次可用: {pact.firstUseful}</li>
                    <li>
                        紧急操作必须立刻有视觉反馈;「{pact.later}」不得阻塞「{pact.urgent}」
                    </li>
                    <li>业务完成时间按任务验收,不能用一次 Lighthouse 分数代替</li>
                    <li>目标条件: {pact.device}</li>
                </ul>
            </div>
        </div>
    );
});

PactCard.displayName = 'PactCard';
