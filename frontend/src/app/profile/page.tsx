'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface User {
    id: string;
    username: string;
    bio?: string;
}

interface Post {
    id: string;
    title: string;
    content: string;
    created_at: string;
}


export default function ProfilePage() {
    const searchParams = useSearchParams();
    const userId = searchParams.get('users');

    const [user, setUser] = useState<User | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    console.log("test 1")
    console.log(`Rendering ProfilePage with userId: ${userId}`);

    useEffect(() => {
        if (!userId) return;

        const fetchProfileData = async () => {
            setLoading(true);
            try {
                console.log("test")
                console.log(`Fetching profile data for user ID: ${userId}`);
                const userRes = await fetch(`http://localhost:8000/users/${userId}`);
                const postsRes = await fetch(`http://localhost:8000/users/${userId}/posts`);

                const userData = await userRes.json();
                const userPosts = await postsRes.json();

                setUser(userData);
                setPosts(userPosts);
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [userId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>Loading profile...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>User not found.</p>
            </div>
        );
    }

    return (
        <div className="flex max-w-5xl mx-auto mt-10 space-x-6 px-4">
            {/* Sidebar */}
            <div className="w-80 bg-white border rounded-xl p-4 shadow-md">
                <h2 className="text-xl font-semibold text-gray-800">{user.username}</h2>
                <p className="text-sm text-gray-600 mt-2">
                    {user.bio || 'This user hasn’t added a bio yet.'}
                </p>
            </div>

            {/* Posts Section */}
            <div className="flex-1 space-y-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Posts by {user.username}</h1>
                {posts.length === 0 ? (
                    <p className="text-gray-500">This user hasn't posted anything yet.</p>
                ) : (
                    posts.map((post) => (
                        <div
                            key={post.id}
                            className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition"
                        >
                            <h3 className="text-lg font-semibold text-blue-700">{post.title}</h3>
                            <p className="text-sm text-gray-700 mt-1">{post.content}</p>
                            <p className="text-xs text-gray-400 mt-2">
                                Posted on {new Date(post.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}