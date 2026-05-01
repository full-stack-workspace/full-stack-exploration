"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useParams } from "next/navigation";
import Link from "next/link";

interface Post {
  title: string;
  body: string;
  userId?: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string;
  status: string;
  bio: string;
  location: string;
  joinedDate: string;
  projects: number;
  followers: number;
  following: number;
}

const mockUsers: Record<number, User> = {
  1: {
    id: 1,
    name: "张明",
    email: "zhangming@example.com",
    role: "创始人 & CEO",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    status: "online",
    bio: "资深创业者，专注于产品创新与团队建设。拥有10年以上互联网行业经验，曾在多家知名企业担任高管。",
    location: "北京",
    joinedDate: "2020年3月",
    projects: 12,
    followers: 3280,
    following: 256,
  },
  2: {
    id: 2,
    name: "李娜",
    email: "lina@example.com",
    role: "技术总监",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    status: "online",
    bio: "全栈工程师，热爱开源与技术分享。精通React、Node.js、Python等技术栈。",
    location: "上海",
    joinedDate: "2020年5月",
    projects: 8,
    followers: 2156,
    following: 189,
  },
  3: {
    id: 3,
    name: "王强",
    email: "wangqiang@example.com",
    role: "设计总监",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    status: "away",
    bio: "UI/UX设计师，追求极致的用户体验。作品曾获多项国际设计大奖。",
    location: "深圳",
    joinedDate: "2020年7月",
    projects: 15,
    followers: 4521,
    following: 312,
  },
};

const statusConfig = {
  online: { color: "bg-success-500", label: "在线" },
  away: { color: "bg-warning-500", label: "离开" },
  offline: { color: "bg-neutral-400", label: "离线" },
};

function UserDetailContent() {
  const searchParams = useSearchParams();
  const params = useParams();
  const userId = Number(params.id);

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  const user = mockUsers[userId] || mockUsers[1];
  const status = statusConfig[user.status as keyof typeof statusConfig] || statusConfig.offline;

  useEffect(() => {
    setLoading(true);
    fetch(`https://jsonplaceholder.typicode.com/posts/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setPost(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-950 dark:to-neutral-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-6">
            <Link
              href="/user"
              className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-600 transition-colors dark:text-neutral-400 dark:hover:text-primary-400"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回团队列表
            </Link>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-lg dark:border-neutral-800/60 dark:bg-neutral-900">
                  <div className="text-center">
                    <div className="relative mx-auto mb-4 inline-block">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg dark:border-neutral-800"
                      />
                      <div className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-2 border-white ${status.color}`}>
                        <span className="sr-only">{status.label}</span>
                      </div>
                    </div>

                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                      {user.name}
                    </h1>
                    <p className="text-primary-600 font-medium dark:text-primary-400">{user.role}</p>

                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-success-50 px-3 py-1 text-xs font-medium text-success-600 dark:bg-success-900/30 dark:text-success-400">
                      <span className={`w-1.5 h-1.5 rounded-full ${status.color}`} />
                      {status.label}
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                      <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-neutral-600 dark:text-neutral-400">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-neutral-600 dark:text-neutral-400">{user.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-neutral-600 dark:text-neutral-400">加入于 {user.joinedDate}</span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-4 border-t border-neutral-100 pt-6 dark:border-neutral-800">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{user.projects}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-500">项目</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-secondary-600 dark:text-secondary-400">{user.followers > 1000 ? `${(user.followers / 1000).toFixed(1)}k` : user.followers}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-500">粉丝</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-accent-600 dark:text-accent-400">{user.following}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-500">关注</p>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button className="flex-1 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-700">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      联系
                    </button>
                    <button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600 shadow-sm transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-lg dark:border-neutral-800/60 dark:bg-neutral-900">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4">
                  个人简介
                </h2>
                <p className="text-neutral-600 leading-relaxed dark:text-neutral-400">
                  {user.bio}
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-lg dark:border-neutral-800/60 dark:bg-neutral-900">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4">
                  发布的文章
                </h2>

                {loading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="animate-pulse rounded-xl bg-neutral-100 p-4 dark:bg-neutral-800">
                        <div className="h-5 w-3/4 rounded bg-neutral-200 dark:bg-neutral-700 mb-2" />
                        <div className="h-4 w-full rounded bg-neutral-200 dark:bg-neutral-700 mb-2" />
                        <div className="h-4 w-2/3 rounded bg-neutral-200 dark:bg-neutral-700" />
                      </div>
                    ))}
                  </div>
                ) : post?.title ? (
                  <div className="space-y-4">
                    <div className="group relative overflow-hidden rounded-xl border border-neutral-100 p-4 transition-all duration-200 hover:border-primary-200/60 hover:shadow-md dark:border-neutral-800">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-secondary-100 text-primary-600">
                          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors dark:text-neutral-50 dark:group-hover:text-primary-400">
                            {post.title}
                          </h3>
                          <p className="mt-1 text-sm text-neutral-600 line-clamp-2 dark:text-neutral-400">
                            {post.body}
                          </p>
                          <div className="mt-3 flex items-center gap-4 text-xs text-neutral-400">
                            <span className="flex items-center gap-1">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                              </svg>
                              12 评论
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              34 点赞
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              3 分钟前
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-neutral-400">
                    <svg className="mx-auto h-12 w-12 text-neutral-300 dark:text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="mt-2 text-sm">暂无文章</p>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-lg dark:border-neutral-800/60 dark:bg-neutral-900">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4">
                  技能标签
                </h2>
                <div className="flex flex-wrap gap-2">
                  {["React", "TypeScript", "Node.js", "Python", "UI/UX", "Git", "Docker", "AWS", "GraphQL", "Tailwind CSS"].map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600 transition-colors hover:bg-primary-100 hover:text-primary-600 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-primary-900/30 dark:hover:text-primary-400"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600">
          <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
        <p className="mt-4 text-neutral-600 dark:text-neutral-400">加载中...</p>
      </div>
    </div>
  );
}

export default function UserDetail() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <UserDetailContent />
    </Suspense>
  );
}
