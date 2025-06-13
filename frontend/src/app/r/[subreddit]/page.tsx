'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { faker } from '@faker-js/faker';
import { PostCard } from '../../../components/PostCard';
import { LeftSideBar } from '../../../components/LeftSideBar';
import { Navbar } from '../../../components/Navbar';

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
    const params = useParams();
    const subreddit = params?.subreddit as string;

    const [userId, setUserId] = useState<string>('');
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId') || '';
        setUserId(storedUserId);
    }, []);

    const fetchPosts = useCallback(async () => {
        try {
            const res = await fetch(`http://localhost:8000/posts`, {
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
    }, [userId]);

    useEffect(() => {
        if (userId) fetchPosts();
    }, [userId, fetchPosts]);

    faker.seed(subreddit.length + subreddit.charCodeAt(0));
    const bannerColor = faker.color.rgb({ format: 'css' });

    return (
        <div className="min-h-screen max-w-full bg-white pb-12 px-4">
            <Navbar 
                userId={userId}
                sessionId={window.__SESSION_ID__ || ''}
                onLogout={() => {
                    localStorage.removeItem('userId');
                    window.location.href = '/';
                }}
            />

            {/* Layout Grid */}
            <div className="pt-12 flex gap-6 mx-auto">
                <LeftSideBar userId={userId} />
                {/* Main Content */}
                <main className="flex-1 max-w-2xl mx-auto">
                    {/* Banner with generated color */}
                    <div className="relative border-b shadow-sm text-center mb-4">
                        <div
                            className="w-full h-[300px] flex flex-col justify-center items-center"
                            style={{ backgroundColor: bannerColor }}
                        >
                            <h1 className="text-4xl font-bold text-white drop-shadow">r/{subreddit}</h1>
                            <p className="text-white/90 mt-2 text-lg">Welcome to the {subreddit} community!</p>
                        </div>
                    </div>
                    {/* Posts Section */}
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
                                <PostCard
                                    key={post.id}
                                    id={post.id}
                                    title={post.title}
                                    author={post.author.username}
                                    subreddit={subreddit} //same as the subreddit name
                                    votes={post.votes}
                                    content={post.content}
                                    userID={userId}
                                />
                            ))}
                        </div>
                    )}

                </main>

                {/* Right Sidebar */}
                <aside className="hidden lg:block lg:col-span-3">
                    <div className="sticky top-20 space-y-6">

                        {/* Subreddit Info */}
                        <div className="bg-white border rounded-xl shadow-sm p-4">
                            <h2 className="text-lg font-semibold text-gray-800 mb-2">About Community</h2>
                            <p className="text-sm text-gray-600 mb-4">
                                This is the subreddit for all things {subreddit}.
                            </p>
                            <hr className="my-2" />
                            <div className="text-sm text-gray-700 space-y-1">
                                <p>📊 Members: <span className="font-semibold">1.2k</span></p>
                                <p>🟢 Online: <span className="font-semibold">57</span></p>
                            </div>
                        </div>

                        {/* Rules */}
                        <div className="bg-white border rounded-xl shadow-sm p-4">
                            <h3 className="text-md font-semibold text-gray-800 mb-2">Rules</h3>
                            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                                <li>Be respectful</li>
                                <li>No spam or self-promotion</li>
                                <li>Stay on topic</li>
                            </ul>
                        </div>

                        {/* Create Post Button */}
                        <div className="bg-white border rounded-xl shadow-sm p-4 text-center">
                            <button className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2 px-4 rounded"
                                onClick={() => {
                                    if (userId) {
                                        window.location.href = `/create-post?userId=${userId}`;
                                    } else {
                                        alert("Please log in to create a post.");
                                    }
                                }
                                }>
                                Create Post
                            </button>
                        </div>

                    </div>
                </aside>
            </div>
        </div>
    );
}
