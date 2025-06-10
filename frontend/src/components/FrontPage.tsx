'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Navbar } from './Navbar';
import { PostCard } from './PostCard';
import { logEvent, ActionType } from '../services/analyticsLogger';

interface Post {
  id: string;
  title: string;
  content: string;
  votes: number;
  // author: string;
  subreddit: string;
}

interface FrontPageProps {
  userId: string;
  sessionId: string;
}

export const FrontPage: React.FC<FrontPageProps> = ({ userId, sessionId }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<'hot' | 'new' | 'top'>('hot');

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:8000/posts?sort=${sort}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      } else {
        const errData = await res.json();
        setError(errData.detail || 'Failed to fetch posts');
      }
    } catch {
      setError('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  }, [userId, sort]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts, sessionId]);


  useEffect(() => {
    if (posts.length > 0) {
      console.log('First post object:', posts[0]);
      console.log('All keys in first post:', Object.keys(posts[0]));
    }
  }, [posts]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 pb-12">
      <Navbar />
      <div className="pt-24 px-4 max-w-7xl mx-auto flex gap-6">
        {/* Main Content */}
        <div className="flex-1 max-w-2xl mx-auto">
          {/* Title + Sort */}
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
              Top posts for you
            </h1>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as 'hot' | 'new' | 'top')}
              className="text-sm border border-gray-300 text-black rounded-md px-3 py-1.5 bg-white shadow-sm hover:border-gray-400 focus:outline-none"
            >
              <option value="hot">🔥 Hot</option>
              <option value="new">🆕 New</option>
              <option value="top">📈 Top</option>
            </select>
          </div>

          {error && (
            <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-md shadow">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {loading ? (
            <p className="text-center text-gray-500">Loading posts...</p>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  title={post.title}
                  // author={post.author}
                  subreddit={post.subreddit}
                  votes={post.votes}
                  content={post.content}
                  userID={userId}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="w-80 hidden lg:block">
          <div className="bg-white border rounded-xl p-4 shadow-md sticky top-24">
            <h2 className="text-base font-semibold text-gray-800 mb-2">About Deddit</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Deddit is a modern take on classic forums. Here you'll find simulated posts across
              subreddits — for demo, testing, and development purposes.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};
