"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, usePathname, useParams } from "next/navigation";


interface Post {
    title: string;
    body: string;
}

function UserDetailContent() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const params = useParams();
    console.log(searchParams.get("id"), pathname, params);

    const [post, setPost] = useState<Post | null>(null);

    useEffect(() => {
        fetch(`https://jsonplaceholder.typicode.com/posts/${params.id}`)
            .then((res) => res.json())
            .then((data) => setPost(data));
    }, [params.id]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    用户详情页，ID: {params.id}
                </h1>
                <div className="space-y-4">
                    <div className="bg-gray-50 rounded-md p-4">
                        <p className="text-sm text-gray-500 mb-1">查询参数</p>
                        <p className="text-gray-700 font-medium">{searchParams.get("name")}</p>
                    </div>
                    <div className="bg-gray-50 rounded-md p-4">
                        <p className="text-sm text-gray-500 mb-1">路径名</p>
                        <p className="text-gray-700 font-medium">{pathname}</p>
                    </div>
                    <div className="bg-gray-50 rounded-md p-4">
                        <p className="text-sm text-gray-500 mb-1">动态参数</p>
                        <p className="text-gray-700 font-medium">{params.id}</p>
                    </div>
                </div>
                {post?.title && (
                    <div className="bg-gray-50 rounded-md p-4">
                        <p className="text-sm text-gray-500 mb-1">标题</p>
                        <p className="text-gray-700 font-medium">{post.title}</p>
                    </div>
                )}
                {post?.body && (
                    <div className="bg-gray-50 rounded-md p-4">
                        <p className="text-sm text-gray-500 mb-1">内容</p>
                        <p className="text-gray-700 font-medium">{post.body}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function LoadingFallback() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
                <p className="text-gray-500 text-center">加载中...</p>
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