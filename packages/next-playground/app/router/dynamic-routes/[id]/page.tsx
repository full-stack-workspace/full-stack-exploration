/**
 * 动态段详情:渲染 Client 演示组件(useParams + SWR)。
 * metadata 由同级 layout.tsx 的 generateMetadata 提供(本页是 Client 入口,不能导出)。
 */

import UserDetailDemo from "@/topics/router/dynamic-routes/UserDetailDemo";

export default function Page() {
    return <UserDetailDemo />;
}
