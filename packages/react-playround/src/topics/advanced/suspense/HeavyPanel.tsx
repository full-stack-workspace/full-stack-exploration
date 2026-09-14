/**
 * @file HeavyPanel — Suspense 专题中被懒加载的"重组件"
 *
 * @description 仅用于演示 React.lazy 的按需加载,无实际业务含义
 */

const HeavyPanel = () => {
    return (
        <div className="rounded-card border border-emerald-200 bg-emerald-50 p-6">
            <h3 className="font-semibold text-emerald-700">重组件加载完成</h3>
            <p className="mt-1 text-sm text-emerald-600">
                这段内容来自一个独立的 chunk,经过模拟延迟后才渲染出来。
            </p>
        </div>
    );
};

export default HeavyPanel;
