import type { Stat, Value, TeamMember, AboutPageData } from "@/types/about";

export const stats: Stat[] = [
    { value: "10+", label: "年经验" },
    { value: "500+", label: "完成项目" },
    { value: "100+", label: "客户" },
    { value: "50+", label: "团队成员" },
];

export const values: Value[] = [
    {
        id: "innovation",
        title: "创新",
        description: "我们不断探索新技术和方法，为客户创造独特的解决方案",
    },
    {
        id: "quality",
        title: "品质",
        description: "我们追求卓越，确保每个项目都达到最高质量标准",
    },
    {
        id: "collaboration",
        title: "合作",
        description: "我们重视与客户的紧密合作，确保项目成功交付",
    },
    {
        id: "growth",
        title: "成长",
        description: "我们鼓励持续学习和发展，保持技术领先地位",
    },
];

export const team: TeamMember[] = [
    {
        name: "张明",
        role: "创始人 & CEO",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    },
    {
        name: "李娜",
        role: "技术总监",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    },
    {
        name: "王强",
        role: "设计总监",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    },
    {
        name: "陈静",
        role: "产品经理",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    },
];

export const aboutPageData: AboutPageData = {
    stats,
    values,
    team,
};