interface Post {
    title: string;
    body: string;
    id: number;
}

export default async function BlogPage() {
    // 直接从json获取博客列表
    // const res = await fetch("https://jsonplaceholder.typicode.com/posts");
    // const posts: Post[] = await res.json();
    // 从api获取博客列表
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/blog`);
    const posts: Post[] = await res.json();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Blog Posts
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Latest articles and updates from our team
                    </p>
                </header>

                <div className="grid gap-6 md:grid-cols-2">
                    {posts.slice(0, 10).map((post) => (
                        <article
                            key={post.id}
                            className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 group"
                        >
                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold">
                                        {post.id}
                                    </span>
                                    <span className="text-xs text-gray-400 uppercase tracking-wide">
                                        Article
                                    </span>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                                    {post.title ?? "No Title"}
                                </h2>
                                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                                    {post.body ?? "No Body"}
                                </p>
                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-xs text-gray-400">
                                        Post #{post.id}
                                    </span>
                                    <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200">
                                        Read more →
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    );
}
