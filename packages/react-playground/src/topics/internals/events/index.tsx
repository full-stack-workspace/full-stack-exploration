/**
 * ============================================================================
 * 内部机制 · 事件(/internals/events)
 * ============================================================================
 *
 * React 17 起把委托收到根容器。分发时沿 Fiber.return 收集监听,先捕获再冒泡。
 * 插件与 document 监听的混用实验留在基础专题。
 *
 * @module topics/internals/events
 */

import { memo } from 'react';
import { Link } from 'react-router-dom';

import { TopicPage, TopicSection } from '../../../components/TopicPage';
import { Diagram } from '../../../components/Diagram';
import { P, Stack } from '../components/Prose';
import { SeriesNav } from '../components/SeriesNav';
import { PathDemo } from './PathDemo';

const EventsPage = memo(() => {
    return (
        <TopicPage
            title="内部机制 · 事件"
            description="原生事件只在根容器上听一次。React 再沿 Fiber 的 return 链把捕获和冒泡重放出来"
        >
            <SeriesNav current="events" />

            <TopicSection
                title="1. 委托点在根容器,不在 document"
                note="讲解要点:React 17 把监听从 document 挪到 createRoot 的那个 DOM 节点,一个页面上的多个 React 根互不影响。"
            >
                <Stack>
                    <Diagram caption="点击按钮之后">
                        {`浏览器
  捕获: window → document → html → body → #root → … → button
  目标: button
  冒泡: button → … → #root → body → document → window

React 注册在 #root(冒泡阶段的原生监听为主)
  事件到达 #root 时,从目标 Fiber 沿 return 收集
  onClickCapture,再收集 onClick
  按收集到的顺序调用

React 16 的监听在 document 上。
17 之后,document 上的监听默认在 React 的处理之前看不到 stopPropagation。`}
                    </Diagram>
                    <P>
                        插件或分析脚本若绑在 `document` 上,React 17 之前可以被组件的 `stopPropagation` 挡住,因为 React 也在 document 上,谁先注册谁先跑。挪到根容器之后,事件先经过 document 才进入根,组件里的 `stopPropagation` 拦不住已经在 document 上跑过的监听。这个顺序的实验在
                        <Link className="mx-1 text-cyan-700 underline underline-offset-2 dark:text-cyan-300" to="/basics/event">
                            事件与合成事件
                        </Link>
                        。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="2. 沿 return 重放,而不是再走一遍 DOM"
                note="讲解要点:React 的父子以组件树为准。Portal 的 DOM 在外面,事件仍从 Portal 里的 Fiber 冒泡到 React 父节点。"
            >
                <Stack>
                    <PathDemo />
                    <P>
                        按钮上的一次点击,顺序是 App 捕获、List 捕获、Button、List 冒泡、App 冒泡。List 并不是按钮的原生父节点这一事实在这个演示里恰好一致;若用 Portal 把按钮画到 `document.body`,DOM 上的父节点变了,React 仍沿 Fiber 的 `return` 找到 List 和 App。这是「合成」还在的那一层:路径来自 Fiber,不是来自 `event.composedPath()` 的原样重放。
                    </P>
                </Stack>
            </TopicSection>

            <TopicSection
                title="3. 事件池已经不存在"
                note="讲解要点:React 17 起不再复用 SyntheticEvent,回调返回之后事件字段仍然可读。异步里要读原生对象时,用 nativeEvent。"
            >
                <Stack>
                    <P>
                        React 16 为了减少分配,会在回调结束后把合成事件的字段清空。当时的写法是在回调里先 `persist()`,或先把需要的字段拷出来。React 17 删掉了事件池。现代浏览器上分配一个事件对象的成本,低于这套清空带来的认知成本。笔记里如果还写「合成事件在回调之后被置空」,那是 16 的行为。
                    </P>
                    <P>
                        委托仍然在。所有 `onClick` 还是进同一套监听插件,由 React 按 Fiber 路径分发。去掉的是对象复用,不是委托。
                    </P>
                </Stack>
            </TopicSection>
        </TopicPage>
    );
});

EventsPage.displayName = 'EventsPage';

export default EventsPage;
