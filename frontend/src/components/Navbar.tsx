'use client';

import React, { useState } from 'react';
import { Home, PlusSquare, User, LogOut, Search } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [search, setSearch] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      console.log('Searching for:', search);
      // TODO: Trigger search API or redirect
    }
  };

  return (
    <nav className="w-full bg-white shadow fixed top-0 left-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-bold text-red-600 cursor-pointer hover:opacity-90">
          Deddit
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex items-center w-full max-w-md mx-6">
          <div className="relative w-full">
            <Search size={16} className="absolute left-3 top-2.5 text-black" />
            <input
              type="text"
              placeholder="Search Deddit"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm text-black rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
        </form>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6 text-sm text-gray-700">
          <button className="flex items-center gap-1 hover:text-black">
            <Home size={16} />
            Home
          </button>
          <button className="flex items-center gap-1 hover:text-black">
            <PlusSquare size={16} />
            Create Post
          </button>
          <button className="flex items-center gap-1 hover:text-black">
            <User size={16} />
            Profile
          </button>
          <button className="flex items-center gap-1 text-red-500 hover:text-red-700">
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
};
