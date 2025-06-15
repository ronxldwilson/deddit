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
import { logEvent, ActionType } from '../services/analyticsLogger';

interface LeftSideBarProps {
  userId?: string;
  sessionId?: string;
}

export const LeftSideBar: React.FC<LeftSideBarProps> = ({ userId, sessionId }) => {
  const handleClick = (e: React.MouseEvent, text: string, identifier: string) => {
    if (!sessionId) return;

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = Math.round(rect.left);
    const y = Math.round(rect.top);

    logEvent(sessionId, ActionType.CLICK, {
      text,
      page_url: window.location.href,
      element_identifier: identifier,
      coordinates: { x, y }
    });
  };

  const handleCreatePost = (e: React.MouseEvent) => {
    handleClick(e, 'User clicked the Create Post button', 'create-post-button');

    if (userId) {
      window.location.href = `/create-post?userId=${userId}`;
    } else {
      alert('Please log in to create a post.');
    }
  };

  return (
    <aside className="w-64 hidden lg:block">
      <div className="sticky top-24 space-y-6">

        {/* Navigation Section */}
        <div className="bg-white border rounded-xl p-4 shadow-md">
          <h2 className="text-base font-semibold text-gray-800 mb-2">Navigation</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>
              <Link id='nav-home' href="/" className="flex items-center gap-2 hover:underline" onClick={(e) => handleClick(e, 'User navigated to Home', 'nav-home')}>
                <Home size={16} /> Home
              </Link>
            </li>
            <li>
              <Link id='nav-popular' href="/r/popular" className="flex items-center gap-2 hover:underline" onClick={(e) => handleClick(e, 'User navigated to Popular', 'nav-popular')}>
                <TrendingUp size={16} /> Popular
              </Link>
            </li>
            <li>
              <Link id='nav-all' href="/r/all" className="flex items-center gap-2 hover:underline" onClick={(e) => handleClick(e, 'User navigated to All', 'nav-all')}>
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
              <Link id='my-saved-posts' href={`/saved-posts/?userId=${userId}`} className="flex items-center gap-2 hover:underline" onClick={(e) => handleClick(e, 'User opened Saved Posts', 'my-saved-posts')}>
                <Bookmark size={16} /> Saved Posts
              </Link>
            </li>
            <li>
              <Link id="my-comments" href={`/my-comments/?userId=${userId}`} className="flex items-center gap-2 hover:underline" onClick={(e) => handleClick(e, 'User opened My Comments', 'my-comments')}>
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
              <Link id='community-technology' href="/r/technology" className="flex items-center gap-2 hover:underline" onClick={(e) => handleClick(e, 'User navigated to r/technology', 'community-technology')}>
                <Layers size={16} /> r/technology
              </Link>
            </li>
            <li>
              <Link id='community-gaming' href="/r/gaming" className="flex items-center gap-2 hover:underline" onClick={(e) => handleClick(e, 'User navigated to r/gaming', 'community-gaming')}>
                <Gamepad size={16} /> r/gaming
              </Link>
            </li>
            <li>
              <Link id='community-startups' href="/r/startups" className="flex items-center gap-2 hover:underline" onClick={(e) => handleClick(e, 'User navigated to r/startups', 'community-startups')}>
                <Rocket size={16} /> r/startups
              </Link>
            </li>
          </ul>
        </div>

        {/* Create Post Button */}
        <button
        id='create-post-button'
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-xl shadow flex items-center justify-center gap-2"
          onClick={handleCreatePost}
        >
          <Plus size={16} /> Create Post
        </button>
      </div>
    </aside>
  );
};
