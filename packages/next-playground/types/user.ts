/**
 * ============================================================================
 * 用户类型定义
 * ============================================================================
 *
 * 全站共享的 User 接口(纯类型,无运行时代码)。
 * 数据源 data/user 与展示组件(UserCard / UserListClient)都以它为准,
 * 可选字段(location 等)对应接口里可能缺省的画像信息。
 *
 * @module types/user
 */

export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar: string;
    status: "online" | "away" | "offline";
    projects: number;
    bio: string;
    location?: string;
    joinedDate?: string;
    followers?: number;
    following?: number;
}