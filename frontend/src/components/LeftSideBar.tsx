'use client';

import React from 'react';
import Link from 'next/link';
import {
  Home,
  TrendingUp,
  Globe,
  Bookmark,
  MessageCircle,
  Layers,
  Gamepad,
  Rocket,
  Plus
} from 'lucide-react';

interface LeftSideBarProps {
  userId?: string;
  sessionId?: string;
}

export const LeftSideBar: React.FC<LeftSideBarProps> = ({ userId, sessionId }) => {
  return (
    <aside className="w-64 hidden lg:block">
      <div className="sticky top-24 space-y-6">

        {/* Navigation Section */}
        <div className="bg-white border rounded-xl p-4 shadow-md">
          <h2 className="text-base font-semibold text-gray-800 mb-2">Navigation</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>
              <Link href="/" className="flex items-center gap-2 hover:underline">
                <Home size={16} /> Home
              </Link>
            </li>
            <li>
              <Link href="/r/popular" className="flex items-center gap-2 hover:underline">
                <TrendingUp size={16} /> Popular
              </Link>
            </li>
            <li>
              <Link href="/r/all" className="flex items-center gap-2 hover:underline">
                <Globe size={16} /> All
              </Link>
            </li>
          </ul>
        </div>

        {/* My Stuff Section */}
        <div className="bg-white border rounded-xl p-4 shadow-md">
          <h2 className="text-base font-semibold text-gray-800 mb-2">My Stuff</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>
              <Link href={`/saved-posts/?userId=${userId}`} className="flex items-center gap-2 hover:underline">
                <Bookmark size={16} /> Saved Posts
              </Link>
            </li>
            <li>
              <Link href={`/my-comments/?userId=${userId}`} className="flex items-center gap-2 hover:underline">
                <MessageCircle size={16} /> My Comments
              </Link>
            </li>
          </ul>
        </div>

        {/* Your Communities Section */}
        <div className="bg-white border rounded-xl p-4 shadow-md">
          <h2 className="text-base font-semibold text-gray-800 mb-2">Your Communities</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>
              <Link href="/r/technology" className="flex items-center gap-2 hover:underline">
                <Layers size={16} /> r/technology
              </Link>
            </li>
            <li>
              <Link href="/r/gaming" className="flex items-center gap-2 hover:underline">
                <Gamepad size={16} /> r/gaming
              </Link>
            </li>
            <li>
              <Link href="/r/startups" className="flex items-center gap-2 hover:underline">
                <Rocket size={16} /> r/startups
              </Link>
            </li>
          </ul>
        </div>

        {/* Create Post Button */}
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-xl shadow flex items-center justify-center gap-2"
          onClick={() => {
            if (userId) {
              window.location.href = `/create-post?userId=${userId}`;
            } else {
              alert("Please log in to create a post.");
            }
          }}
        >
          <Plus size={16} /> Create Post
        </button>
      </div>
    </aside>
  );
};
