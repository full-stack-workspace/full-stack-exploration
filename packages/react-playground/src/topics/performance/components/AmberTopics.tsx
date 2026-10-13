/**
 * ============================================================================
 * AmberTopics.tsx — 性能专题跳转到仓库已有页
 * ============================================================================
 *
 * 共享组件 RelatedTopics 的 amber 配色别名(性能分类页头系列色),
 * 保留本模块名以免改动十个引用方;新代码请直接用
 * `@/components/RelatedTopics` + `tone="amber"`。
 *
 * @module topics/performance/components/AmberTopics
 */

import { RelatedTopics } from '../../../components/RelatedTopics';
import type { RelatedTopic, RelatedTopicsTone } from '../../../components/RelatedTopics';

export type { RelatedTopic as AmberTopic };

const AMBER: RelatedTopicsTone = 'amber';

export const AmberTopics = ({ items }: { items: RelatedTopic[] }) => (
    <RelatedTopics items={items} tone={AMBER} />
);
