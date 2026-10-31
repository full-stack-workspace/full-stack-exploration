/**
 * ============================================================================
 * test/utils — 测试基础设施
 * ============================================================================
 *
 * withSetup:在真实组件上下文里执行组合式函数,使 onMounted/onUnmounted
 * 等生命周期钩子生效;返回结果引用与卸载函数(用于验证自动清理)。
 *
 * @module test/utils
 */

import { type App,createApp, defineComponent, h } from 'vue';

/**
 * @param composable 待测组合式函数
 * @returns result: 组合式函数返回值;unmount: 卸载宿主组件
 * @example const { result, unmount } = withSetup(() => useToggle())
 */
export function withSetup<T>(composable: () => T): { result: T; unmount: () => void; app: App } {
    let result!: T;
    const app = createApp(
        defineComponent({
            setup() {
                result = composable();
                return () => h('div');
            },
        }),
    );
    const el = document.createElement('div');
    document.body.appendChild(el);
    app.mount(el);
    return {
        result,
        unmount: () => {
            app.unmount();
            el.remove();
        },
        app,
    };
}
