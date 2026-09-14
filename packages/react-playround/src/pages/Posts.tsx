import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PostCard from '../components/Card';

const Posts: React.FC = () => {
  const allPosts = [
    {
      title: 'Getting Started with Rsbuild',
      description: 'A comprehensive guide to building React applications with Rsbuild, featuring fast development and optimized production builds.',
      date: '2025-12-11',
      tags: ['Rsbuild', 'React', 'Webpack']
    },
    {
      title: 'Teek Theme Design Philosophy',
      description: 'The minimalist design approach behind the Teek theme, focusing on readability and clean aesthetics.',
      date: '2025-12-10',
      tags: ['Design', 'Theme', 'Minimalism']
    },
    {
      title: 'Modern React Development Practices',
      description: 'Best practices for building scalable and maintainable React applications in 2025.',
      date: '2025-12-09',
      tags: ['React', 'Best Practices', 'Development']
    },
    {
      title: 'CSS Grid Mastery',
      description: 'Advanced techniques for creating responsive layouts with CSS Grid.',
      date: '2025-12-08',
      tags: ['CSS', 'Grid', 'Layout']
    },
    {
      title: 'TypeScript for React Developers',
      description: 'How to leverage TypeScript to build type-safe React applications.',
      date: '2025-12-07',
      tags: ['TypeScript', 'React', 'Type Safety']
    },
    {
      title: 'Optimizing React Performance',
      description: 'Proven strategies to make your React applications faster and more efficient.',
      date: '2025-12-06',
      tags: ['React', 'Performance', 'Optimization']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">All Posts</h1>
          <p className="text-lg text-gray-600">
            Browse through all articles and tutorials.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allPosts.map((post, index) => (
            <PostCard key={index} {...post} />
          ))}
        </section>

        <div className="mt-12 flex justify-center">
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300">
              Previous
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              1
            </button>
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
              2
            </button>
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
              3
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Next
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Posts;
