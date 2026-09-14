import React, { memo } from 'react';

const Header: React.FC = memo(() => {
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-gray-800">Teek</div>
          <nav className="space-x-6">
            <a href="/" className="text-gray-700 hover:text-gray-900 font-medium">Home</a>
            <a href="/hooks" className="text-gray-700 hover:text-gray-900 font-medium">Hooks</a>
            <a href="/shopping-cart" className="text-gray-700 hover:text-gray-900 font-medium">Shopping Cart</a>
            <a href="/relay-example" className="text-gray-700 hover:text-gray-900 font-medium">Relay Example</a>
          </nav>
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;
