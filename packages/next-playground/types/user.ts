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