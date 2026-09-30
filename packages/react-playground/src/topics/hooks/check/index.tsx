/**
 * ============================================================================
 * Hooks · 理解检验(/hooks/check)
 * ============================================================================
 *
 * 覆盖 state、reducer、ref、effect、缓存、自定义 Hook 和并发读取。
 * 较难的题标出星级和考察点。
 *
 * @module topics/hooks/check
 */

import { memo } from 'react';

import { CheckList } from '../../../components/check/CheckList';
import { HOOKS_COUNT, HOOKS_GROUPS } from './bank';

const HooksCheckPage = memo(() => {
    return (
        <CheckList
            title="Hooks · 理解检验"
            description={`${HOOKS_COUNT} 道问答,从 useState 到并发读取。先用要点自答,较难的题同时看星级和考察点`}
            intro="effect、闭包和并发那几组会互相咬合。星级标在容易靠记忆答偏的题上,考察点写的是这题真正要站住的判断。"
            groups={HOOKS_GROUPS}
            closingTitle="对照时容易记混的四句"
            closingNote="答完回到对应的 Hook 页,用演练把这四句核对一遍。"
            closing={
                <ul className="list-disc space-y-2 pl-4 text-sm leading-relaxed text-gray-600 dark:text-slate-300">
                    <li>useEffect 就是 componentDidMount 加 DidUpdate:依赖不同,时机也不同,不要逐个生命周期去找替身。</li>
                    <li>闭包旧了就加进依赖数组:有的值是事件当时的意图,不该因为身份变化把 effect 重跑。</li>
                    <li>memo 能挡住 Context:挡不住。组件自己读了 Context,value 变了它仍会渲染。</li>
                    <li>useMemo 是性能开关,默认全包:它只在跳过的计算真的贵、且依赖稳定时才有收益。</li>
                </ul>
            }
        />
    );
});

HooksCheckPage.displayName = 'HooksCheckPage';

export default HooksCheckPage;
