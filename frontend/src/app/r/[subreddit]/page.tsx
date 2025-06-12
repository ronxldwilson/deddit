'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { PostCard } from '../../../components/PostCard';
import { LeftSideBar } from '../../../components/LeftSideBar';

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

export default function SubredditPage() {
    const { subreddit } = useParams();
    const searchParams = useSearchParams();
    const page = searchParams.get('page') || '1';

    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPosts = useCallback(async () => {
        try {
            const res = await fetch(`http://localhost:8000/posts}`, {
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
    }, []);

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto px-4 py-6">

                {/* Left Sidebar */}
                <aside className="hidden lg:block lg:col-span-3">
                    <div className="sticky top-20">
                        <LeftSideBar />
                    </div>
                </aside>

                {/* Main Content */}
                <main className="col-span-1 lg:col-span-9">
                    <div className="bg-white border rounded-xl shadow-sm p-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">r/{subreddit}</h1>

                        {loading && <p className="text-gray-500">Loading posts...</p>}
                        {error && <p className="text-red-600">{error}</p>}
                        {!loading && !error && posts.length === 0 && (
                            <p className="text-gray-500">No posts found.</p>
                        )}

                        <div className="space-y-6 mt-4">
                            {posts.map((post) => (
                                <PostCard
                                    key={post.id}
                                    id={post.id}
                                    title={post.title}
                                    author={post.author.username}
                                    subreddit={post.subreddit}
                                    votes={post.votes}
                                    content={post.content}
                                    userID="" // pass userId if available
                                />
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
