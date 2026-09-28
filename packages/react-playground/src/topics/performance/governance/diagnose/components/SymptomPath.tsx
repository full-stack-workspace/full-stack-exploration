/**
 * ============================================================================
 * SymptomPath — 按用户现象选择排查路径
 * ============================================================================
 *
 * 先把「慢」写成可复现描述,再进入对应证据链。每条路径都带一条可验证假设模板。
 *
 * @module topics/performance/governance/diagnose/components/SymptomPath
 */

import { memo, useState } from 'react';
import { Segmented } from 'antd';

type Symptom =
    | 'lcp'
    | 'inp'
    | 'result'
    | 'scroll'
    | 'leak'
    | 'rerender'
    | 'ai-slow';

interface Path {
    evidence: string;
    first: string;
    accept: string;
    hypothesis: string;
}

const PATHS: Record<Symptom, Path> = {
    lcp: {
        evidence: 'HTML、接口、关键图片的请求瀑布;LCP 元素是谁',
        first: '服务端等待、串行依赖、资源发现过晚、首屏负载',
        accept: '主要内容更早出现(LCP / 首次可用定义)',
        hypothesis:
            '首屏慢主要来自推荐接口和主体串行。把推荐拆到独立边界后,主体 LCP 应下降;推荐完成时间可以基本不变。',
    },
    inp: {
        evidence: '主线程长任务、事件处理、React 渲染、强制布局',
        first: '同步重计算、更新范围、非紧急更新没标记、layout thrash',
        accept: '输入和点击更快得到下一帧(INP)',
        hypothesis:
            '输入卡顿主要来自结果区同步更新。将结果更新标成非紧急后,输入延迟应下降;查询完成时间可能不变。',
    },
    result: {
        evidence: '请求耗时 vs 结果处理/渲染耗时',
        first: '数据获取、解析、主线程上的派生计算',
        accept: '业务结果更快完成(约定表里的完成时间)',
        hypothesis:
            '输入已经流畅,但列表要 1.2s 才换完,瓶颈在接口而非渲染。加 Transition 不会缩短这 1.2s。',
    },
    scroll: {
        evidence: 'DOM 数量、布局/绘制轨迹、滚动事件处理',
        first: '虚拟化、读写布局、复杂绘制、高频 handler',
        accept: '目标设备滚动稳定',
        hypothesis:
            '掉帧来自 4000 个 DOM 节点的样式计算。窗口化后帧耗时应回落到 16ms 附近;数据仍全在内存则泄漏路径还在。',
    },
    leak: {
        evidence: '堆内存、DOM、监听、缓存、后台任务数量随时间',
        first: '泄漏、无界缓存、重复订阅、没清理的 Worker/计时器',
        accept: '重复操作后资源不持续异常增长',
        hypothesis:
            '用半小时变卡是聊天记录无界追加。限制保留窗口后,堆增长应封顶;单条发送延迟可以不变。',
    },
    rerender: {
        evidence: 'React Profiler 与更新来源',
        first: '状态位置、订阅粒度、Effect 链;然后才是记忆化',
        accept: '对应操作实际变快,而不只是 render 次数变少',
        hypothesis:
            '工作台每次按键全树渲染,来自一个胖 Context。拆开后输入路径渲染应变少;先加 memo 只会掩盖广播。',
    },
    'ai-slow': {
        evidence: 'TTFT / FTRT / TPOT / 工具链 / 检索;取消是否真停',
        first: '网关排队、RAG 串行、工具瀑布、上屏批处理、开场白话术',
        accept: 'TTFUI 与任务成功率一起看,禁止只报 TTFT',
        hypothesis:
            '用户觉得慢是因为前 40 个 token 都是「好的我来」。压缩开场白后 TTFUI 应明显下降;TTFT 可能几乎不变。',
    },
};

export const SymptomPath = memo(() => {
    const [symptom, setSymptom] = useState<Symptom>('inp');
    const path = PATHS[symptom];

    return (
        <div className="space-y-3">
            <Segmented
                aria-label="排查现象"
                value={symptom}
                onChange={(v) => setSymptom(v as Symptom)}
                options={[
                    { label: '首屏慢', value: 'lcp' },
                    { label: '输入卡', value: 'inp' },
                    { label: '结果晚到', value: 'result' },
                    { label: '滚动掉帧', value: 'scroll' },
                    { label: '越用越卡', value: 'leak' },
                    { label: '乱渲染', value: 'rerender' },
                    { label: 'AI 觉得慢', value: 'ai-slow' },
                ]}
            />
            <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                <div>
                    <dt className="text-xs text-gray-400">首先检查的证据</dt>
                    <dd className="mt-1 text-gray-700 dark:text-slate-200">{path.evidence}</dd>
                </div>
                <div>
                    <dt className="text-xs text-gray-400">优先处理</dt>
                    <dd className="mt-1 text-gray-700 dark:text-slate-200">{path.first}</dd>
                </div>
                <div>
                    <dt className="text-xs text-gray-400">验收重点</dt>
                    <dd className="mt-1 text-gray-700 dark:text-slate-200">{path.accept}</dd>
                </div>
                <div className="sm:col-span-2 rounded-lg border border-amber-100 bg-amber-50/60 p-3 dark:border-amber-900 dark:bg-amber-950/40">
                    <dt className="text-xs font-medium text-amber-800 dark:text-amber-200">
                        可验证假设模板
                    </dt>
                    <dd className="mt-1 text-xs leading-relaxed text-amber-900 dark:text-amber-100">
                        {path.hypothesis}
                    </dd>
                </div>
            </dl>
        </div>
    );
});

SymptomPath.displayName = 'SymptomPath';
