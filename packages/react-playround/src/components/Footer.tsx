import React, { memo } from 'react';

const Footer: React.FC = memo(() => {
  return (
    <footer className="bg-gray-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center text-gray-600">
          <p>© 2025 Teek Blog. All rights reserved.</p>
          <p className="mt-2 text-sm">Built with React and Rsbuild</p>
        </div>
      </div>
    </footer>
  );
});

// 为使用 memo 的组件添加 displayName,方便在开发工具中调试
Footer.displayName = 'Footer';

export default Footer;
