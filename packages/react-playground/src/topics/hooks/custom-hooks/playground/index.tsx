/**
 * ============================================================================
 * 自定义 Hooks 原子演练(/topics/hooks/custom-hooks-playground)
 * ============================================================================
 *
 * 8 个生产级基础 Hook 逐个交互演示:每个 TopicSection 包含
 * 可操作的最小场景、核心源码节选与「生产要点」说明。
 * 所有 Hook 来自本专题 lib/(含完整 renderHook 契约测试)。
 *
 * @module topics/hooks/custom-hooks/playground
 */

import { memo } from 'react';

import { TopicPage, TopicSection } from '../../../../components/TopicPage';
import { CodeBlock } from '../../../../components/CodeBlock';
import { NavBanner } from './components/NavBanner';
import { ToggleDemo } from './components/ToggleDemo';
import { PreviousDemo } from './components/PreviousDemo';
import { DebouncedDemo } from './components/DebouncedDemo';
import { LocalStorageDemo } from './components/LocalStorageDemo';
import { IntervalDemo } from './components/IntervalDemo';
import { EventListenerDemo } from './components/EventListenerDemo';
import { MediaQueryDemo } from './components/MediaQueryDemo';
import { RequestDemo } from './components/RequestDemo';

const CustomHooksPlayground = memo(() => {
    return (
        <TopicPage
            title="自定义 Hooks 原子演练"
            description="8 个生产级基础 Hook 逐个交互演示 —— 每个都可直接拷进项目使用,源码见 custom-hooks/lib/"
        >
            <NavBanner current="playground" />

            <TopicSection
                title="useToggle — 布尔状态开关"
                note="生产要点:操作函数全部 useCallback 稳定化,actions 对象 useMemo 稳定化;可直接作 memo 子组件 props 而不引发级联重渲染"
            >
                <div className="space-y-4">
                    <ToggleDemo />
                    <CodeBlock
                        title="lib/useToggle.ts(节选)"
                        code={`const toggle = useCallback(() => setValue((v) => !v), []);
const setTrue = useCallback(() => setValue(true), []);
const setFalse = useCallback(() => setValue(false), []);
// actions 对象本身也稳定化,否则每次渲染都是新对象
const actions = useMemo(() => ({ toggle, setTrue, setFalse }), [toggle, setTrue, setFalse]);`}
                    />
                </div>
            </TopicSection>

            <TopicSection
                title="usePrevious — 上一次的值"
                note="生产要点:ref 跨渲染存活、修改不触发渲染;「提交后才写入」的 effect 保证本次 render 读到的仍是上一帧的值"
            >
                <div className="space-y-4">
                    <PreviousDemo />
                    <CodeBlock
                        title="lib/usePrevious.ts(节选)"
                        code={`const previousRef = useRef<T | undefined>(undefined);
useEffect(() => {
    previousRef.current = value; // 提交后才写,render 期间读到的是旧值
}, [value]);
return previousRef.current;`}
                    />
                </div>
            </TopicSection>

            <TopicSection
                title="useDebouncedValue — 防抖值"
                note="生产要点:cleanup 重置定时器是防抖的核心;卸载时清理,避免写已卸载组件的 state"
            >
                <div className="space-y-4">
                    <DebouncedDemo />
                    <CodeBlock
                        title="lib/useDebouncedValue.ts(节选)"
                        code={`useEffect(() => {
    // 每次 value/delay 变化都重新计时,快速连续变化只有最后一次生效
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
}, [value, delay]);`}
                    />
                </div>
            </TopicSection>

            <TopicSection
                title="useLocalStorage — 持久化状态"
                note="生产要点:懒初始化只读一次 storage;写入异常只告警不阻断;函数式更新保证持久化的值与 state 恒等"
            >
                <div className="space-y-4">
                    <LocalStorageDemo />
                    <CodeBlock
                        title="lib/useLocalStorage.ts(节选)"
                        code={`const [value, setValue] = useState<T>(() => {
    try {
        const item = window.localStorage.getItem(key);
        return item !== null ? JSON.parse(item) : initialValue;
    } catch { return initialValue; } // 损坏 / 隐私模式兜底
});
// 在同一个 setState 回调里算新值并顺手持久化,不存在两份事实
setValue((prev) => { ...localStorage.setItem(key, JSON.stringify(nextValue)); return nextValue; });`}
                    />
                </div>
            </TopicSection>

            <TopicSection
                title="useInterval — 声明式定时器"
                note="生产要点:回调 ref 模式根治闭包旧值 —— interval 永远调用最新回调,且节拍不因回调变化而重置;delay 传 null 即暂停"
            >
                <div className="space-y-4">
                    <IntervalDemo />
                    <CodeBlock
                        title="lib/useInterval.ts(节选)"
                        code={`const callbackRef = useRef(callback);
useEffect(() => { callbackRef.current = callback; }, [callback]); // 只同步,不重建定时器

useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => callbackRef.current(), delay); // 永远读最新闭包
    return () => clearInterval(id);
}, [delay]);`}
                    />
                </div>
            </TopicSection>

            <TopicSection
                title="useEventListener — 声明式事件监听"
                note="生产要点:handler 走 ref,effect 只依赖 target/type;订阅与退订严格成对,StrictMode 双执行下不泄漏"
            >
                <div className="space-y-4">
                    <EventListenerDemo />
                    <CodeBlock
                        title="lib/useEventListener.ts(节选)"
                        code={`useEffect(() => { handlerRef.current = handler; }, [handler]);

useEffect(() => {
    const el = target !== null && 'current' in target ? target.current : target;
    if (!el) return;
    const listener = (event: Event) => handlerRef.current(event);
    el.addEventListener(type, listener, options);
    return () => el.removeEventListener(type, listener, options); // 成对退订
}, [target, type, options]);`}
                    />
                </div>
            </TopicSection>

            <TopicSection
                title="useMediaQuery — 响应式媒体查询"
                note="生产要点:matchMedia 是 React 之外的可变数据源,useSyncExternalStore 是标准订阅姿势;matches 为布尔原始值,Object.is 天然成立"
            >
                <div className="space-y-4">
                    <MediaQueryDemo />
                    <CodeBlock
                        title="lib/useMediaQuery.ts(节选)"
                        code={`const subscribe = useCallback((onChange) => {
    const mql = window.matchMedia(query);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
}, [query]);
const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
return useSyncExternalStore(subscribe, getSnapshot, () => false);`}
                    />
                </div>
            </TopicSection>

            <TopicSection
                title="useRequest — 生产级异步请求"
                note="生产要点:请求序号 + AbortController 双保险处理竞态(过期结果丢弃);卸载自动取消;回调全部走 ref,内联传入也安全"
            >
                <div className="space-y-4">
                    <RequestDemo />
                    <CodeBlock
                        title="lib/useRequest.ts(节选)"
                        code={`const requestId = ++requestSeqRef.current;   // 序号单调递增
abortRef.current?.abort();                    // 取消上一次在途请求
const controller = new AbortController();
...
.then((data) => {
    if (requestId !== requestSeqRef.current) {
        emit({ type: 'stale', requestId });    // 过期结果直接丢弃
        return;
    }
    setData(data); ...
})`}
                    />
                </div>
            </TopicSection>
        </TopicPage>
    );
});

CustomHooksPlayground.displayName = 'CustomHooksPlayground';

export default CustomHooksPlayground;
