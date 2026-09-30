/**
 * ============================================================================
 * 内部机制 · Hooks 链表(/internals/hooks-impl)
 * ============================================================================
 *
 * memoizedState 是链表。第 n 次调用对应第 n 个节点。React 19 的 use 不占这种槽。
 *
 * @module topics/internals/hooks-impl
 */

import { memo } from 'react';

import { TopicPage, TopicSection } from '../../../components/TopicPage';
import { Diagram } from '../../../components/Diagram';
import { P, Stack } from '../components/Prose';
import { SeriesNav } from '../components/SeriesNav';
import { HookSlots } from './HookSlots';

const HooksImplPage = memo(() => {
    return (
        <TopicPage
            title="内部机制 · Hooks 链表"
            description="函数组件没有实例字段。状态挂在 Fiber.memoizedState 上,靠每次渲染相同的调用顺序找回"
        >
            <SeriesNav current="hooks-impl" />

            <TopicSection
                title="1. 链表,而不是按名字索引的对象"
                note="讲解要点:Hook 的身份是它在函数里第几次被调用。源码里没有 useState 的变量名。"
            >
                <Stack>
                    <Diagram caption="mount 时往链表尾部追加,update 时沿 next 取下一个">
                        {`fiber.memoizedState
        │
        ▼
   useState ──next──► useRef ──next──► useEffect ──next──► null
   memoizedState      current          依赖数组 + 销毁函数
   queue(更新)                         

dispatchAction 闭包记住自己那个 hook 节点,
所以 setCount 不需要在下一次渲染时靠名字找回去。`}
                    </Diagram>
                    <P>
                        第一次渲染走 mount 路径,每调用一个 Hook 就新建节点接到链表上。之后的渲染走 update 路径:先把游标拨回链表头,第几次调用就取第几个节点,读出上次的 `memoizedState` 和 `queue`。少调一次、多调一次、或换了顺序,游标还会往下走,但读到的是别人的节点。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="2. 条件调用会把后面的槽全部错位"
                note="讲解要点:下面的按钮只切换示意图。真实组件里按条件调用 useState,开发环境会直接报错。"
            >
                <Stack>
                    <HookSlots />
                    <P>
                        插入发生在中间时,原来的 state 节点被下一个 Hook 读走。数字可能暂时还显示得出来,因为节点里确实存着数字,但类型已经不对:ref 的位置读到了 effect,effect 的位置走到了链表末尾。这不是「偶发的闭包过期」,是身份系统本身被破坏。
                    </P>
                    <P>
                        循环里调用 Hook 同样不安全,除非循环次数在这个组件的所有渲染里恒定。次数一变,链表长度就和调用次数对不上。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="3. 不同 Hook 存在同一个节点形状里"
                note="讲解要点:区分靠调用时的实现,不靠节点上的类型字段。useState 的 queue、useEffect 的依赖,都放在 memoizedState 或 queue 里。"
            >
                <Stack>
                    <Diagram caption="同一个 Hook 结构,memoizedState 的含义由是谁创建的决定">
                        {`useState / useReducer
  memoizedState = 当前状态
  queue = 待处理更新 + dispatch

useRef
  memoizedState = { current }

useEffect / useLayoutEffect / useInsertionEffect
  memoizedState = effect 对象(销毁、依赖、tag)
  三者的差别是 flags:Passive、layout 还是 insertion

useMemo / useCallback
  memoizedState = [缓存值, 依赖]
  渲染时比较依赖,决定要不要重算

useContext
  不把 context 值放进这条链表当状态
  渲染时读 context,并让 fiber 依赖它,值变了就要重新渲染`}
                    </Diagram>
                    <P>
                        `useContext` 的消费者会在 context 值 `Object.is` 比较失败时重新渲染。中间那层组件不会因此自动跳过:它自己若也调用了 `useContext`,值一变就重渲染;即便没调用,父组件重渲染时默认仍会带上它。能跳过中间层,靠的是把 context 放到靠下的消费者,中间用 `children` 槽或 `memo` 挡住。这是写法,不是 context 的隐式优化。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="4. use 可以写在条件里,因为它不占这条链表"
                note="讲解要点:React 19 的 use 读取 Context 或解开 Promise。它不追加 useState 那种槽,所以允许放在 if 后面。"
            >
                <Stack>
                    <P>
                        `use(promise)` 在 Promise 未完成时 suspend,完成后从缓存里读值,不需要在每次渲染占一个固定槽。`use(context)` 在调用的那一行读当前值。条件成立才调用,不会把后面的 `useState` 挤开。其它 Hook 没有这条豁免。
                    </P>
                    <P>
                        React Compiler 会重写组件,把可以缓存的表达式提成带依赖的缓存,但生成的代码仍然按固定顺序调用 Hook。编译器遵守链表,不废除链表。Actions 和 `useActionState` 走的是过渡更新的 Lane,状态还是放在这条链表的某个节点上。
                    </P>
                </Stack>
            </TopicSection>
        </TopicPage>
    );
});

HooksImplPage.displayName = 'HooksImplPage';

export default HooksImplPage;
