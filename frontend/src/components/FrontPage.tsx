'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from './Navbar';
import { PostCard } from './PostCard';
import { logEvent, ActionType } from '../services/analyticsLogger';
import Link from 'next/link';
import { LeftSideBar } from './LeftSideBar';

interface Author {
  username: string;
  id: string;
  created_at: string;
  updated_at: string | null;
  password: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  votes: number;
  author: Author;
  subreddit: string;
}

interface FrontPageProps {
  userId: string;
  sessionId: string;
  onLogout: () => void;
}

export const FrontPage: React.FC<FrontPageProps> = ({ userId, sessionId, onLogout }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<'hot' | 'new' | 'top'>('hot');
  const [savedPostIds, setSavedPostIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
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
    };

    fetchPosts();
  }, [userId, sort, sessionId]);

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch("http://localhost:8000/posts");
      const data = await res.json();
      setPosts(data);
    };

    const fetchSaved = async () => {
      const res = await fetch(`http://localhost:8000/users/${userId}/saved_posts`);
      const data = await res.json();
      setSavedPostIds(data.map((post: any) => post.id.toString()));
    };

    fetchPosts();
    fetchSaved();
  }, [userId]);

  return (
    <div className="min-h-screen max-w-full bg-white pb-12">
      <Navbar
        userId={userId}
        sessionId={sessionId}
        onLogout={() => {
          localStorage.removeItem("userId");
          sessionStorage.removeItem("sessionInitialized");
          sessionStorage.removeItem("sessionId");

          if (window.__SESSION_ID__) {
            delete window.__SESSION_ID__;
          }
          window.location.href = '/';
        }}
      />

      <div className="pt-12 flex gap-6 m-0">
        <LeftSideBar userId={userId} sessionId={sessionId} />

        <div className="flex-1 max-w-2xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
              Home
            </h1>
            <select
              id="sort-dropdown"
              value={sort}
              onChange={(e) => {
                const newSort = e.target.value as 'hot' | 'new' | 'top';
                setSort(newSort);
                logEvent(sessionId, ActionType.CLICK, {
                  text: `User changed sort to ${newSort}`,
                  page_url: window.location.href,
                  element_identifier: "sort-dropdown",
                });
              }}
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
            <div className="space-y-8">
              {posts.map((post) => (
                <div
                  key={post.id}
                >
                  <PostCard
                    id={post.id}
                    title={post.title}
                    author={post.author.username}
                    subreddit={post.subreddit}
                    votes={post.votes}
                    content={post.content}
                    userID={userId}
                    isInitiallySaved={savedPostIds.includes(post.id.toString())}
                  />
                </div>
              ))}
            </div>
          )}

        </div>

        <aside className="w-80 hidden lg:block space-y-6">
          <div className="sticky top-24 space-y-6">
            <div className="bg-white border rounded-xl p-4 shadow-md">
              <h2 className="text-base font-semibold text-gray-800 mb-2">About Deddit</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Deddit is a modern take on classic forums. Here you'll find simulated posts across
                subreddits — for demo, testing, and development purposes.
              </p>
            </div>

            <div className="bg-white border rounded-xl p-4 shadow-md">
              <h2 className="text-base font-semibold text-gray-800 mb-4">Popular Communities</h2>
              <ul className="space-y-4">
                {[
                  { name: "technology", members: "1.2M" },
                  { name: "science", members: "980K" },
                  { name: "gaming", members: "2.1M" },
                  { name: "music", members: "750K" },
                ].map((community) => (
                  <li key={community.name} className="flex items-center justify-between">
                    <div>
                      <Link
                        id={`popular-community-${community.name}`}
                        href={`/r/${community.name}`}
                        onClick={() =>
                          logEvent(sessionId, ActionType.CLICK, {
                            text: `User clicked on popular community r/${community.name}`,
                            page_url: window.location.href,
                            element_identifier: `popular-community-${community.name}`,
                          })
                        }
                        className="text-sm font-medium text-blue-600 hover:underline"
                      >
                        r/{community.name}
                      </Link>
                      <div className="text-xs text-gray-500">members: {community.members}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
