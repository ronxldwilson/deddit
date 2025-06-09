// components/Navbar.tsx
import React from 'react';

export const Navbar: React.FC = () => {
  return (
    <nav className="w-full bg-white shadow fixed top-0 left-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="text-xl font-bold text-red-600">Deddit</div>
        <div className="space-x-4">
          <button className="text-sm text-gray-600 hover:text-black">Log in</button>
          <button className="text-sm text-gray-600 hover:text-black">Sign up</button>
        </div>
      </div>
    </nav>
  );
};
