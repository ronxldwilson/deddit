"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Navbar } from "./Navbar";
import { PostCard } from "./PostCard";
import { logEvent, ActionType } from "../services/analyticsLogger";

interface Post {
  id: string;
  title: string;
  author: string;
  subreddit: string;
  votes: number;
}

interface FrontPageProps {
  userId: string;
  sessionId: string;
}

export const FrontPage: React.FC<FrontPageProps> = ({ userId, sessionId }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:8000/posts", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      } else {
        const errData = await res.json();
        setError(errData.detail || "Failed to fetch posts");
      }
    } catch {
      setError("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPosts();
    logEvent(sessionId, ActionType.PAGE_VIEW, {
      text: "User visited Deddit front page",
      page_url: window.location.href,
    });
  }, [fetchPosts, sessionId]);

  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      <Navbar />
      <div className="max-w-2xl mx-auto pt-20 px-4">
        {error && (
          <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-500">Loading posts...</p>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard key={post.id} {...post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
