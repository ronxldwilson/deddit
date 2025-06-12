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

interface Comment {
    id: number;
    content: string;
    created_at: string;
    post_id: number;
    post_title: string;
}

export default function ProfilePage() {
    const searchParams = useSearchParams();
    const userId = searchParams.get('users');

    const [user, setUser] = useState<User | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [savedPosts, setSavedPosts] = useState<Post[]>([]);
    const [savedComments, setSavedComments] = useState<Comment[]>([]);

    console.log("Saved Posts:", savedPosts);
    console.log("Saved Comments:", savedComments);


    const [comments, setComments] = useState<Comment[]>([]);

    useEffect(() => {
        if (!userId) return;

        const fetchProfileData = async () => {
            setLoading(true);
            try {
                console.log("test")
                console.log(`Fetching profile data for user ID: ${userId}`);
                const userRes = await fetch(`http://localhost:8000/users/${userId}`);
                const postsRes = await fetch(`http://localhost:8000/users/${userId}/posts`);
                const commentsRes = await fetch(`http://localhost:8000/users/${userId}/comments`);


                const userData = await userRes.json();
                const userPosts = await postsRes.json();
                const userComments = await commentsRes.json();

                setUser(userData);
                setPosts(userPosts);
                setComments(userComments);
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [userId]);

    useEffect(() => {
        if (!userId) return;

        const fetchSavedItems = async () => {
            try {
                const [postsRes, commentsRes] = await Promise.all([
                    fetch(`http://localhost:8000/users/${userId}/saved_posts`),
                    fetch(`http://localhost:8000/users/${userId}/saved_comments`),
                ]);

                const savedPostsData = await postsRes.json();
                const savedCommentsData = await commentsRes.json();


                setSavedPosts(Array.isArray(savedPostsData) ? savedPostsData : []);
                setSavedComments(Array.isArray(savedCommentsData) ? savedCommentsData : []);
            } catch (error) {
                console.error('Error fetching saved items:', error);
                setSavedPosts([]);       // fallback to empty array
                setSavedComments([]);
            }
        };

        fetchSavedItems();
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


    console.log("Saved Posts:", savedPosts);
    console.log("Saved Comments:", savedComments);

    return (
        <div className="flex max-w-5xl mx-auto mt-10 space-x-6 px-4 bg-white py-6 rounded-lg shadow-md">
            {/* Sidebar */}
            <div className="w-80 bg-white border rounded-xl p-4 shadow-md">
                <h2 className="text-xl font-semibold text-gray-800">{user.username}</h2>
                <p className="text-sm text-gray-600 mt-2">
                    {user.bio || 'This user hasn’t added a bio yet.'}
                </p>
            </div>
            <div>

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

                {/* Comments Section */}
                <div className="mt-10 space-y-4">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Comments by {user.username}</h1>
                    {comments.length === 0 ? (
                        <p className="text-gray-500">This user hasn't commented yet.</p>
                    ) : (
                        comments.map((comment) => (
                            <div
                                key={comment.id}
                                className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition"
                            >
                                <p className="text-sm text-gray-700">{comment.content}</p>
                                <p className="text-xs text-gray-400 mt-2">
                                    On post <span className="font-semibold text-blue-700">{comment.post_title}</span> •{" "}
                                    {new Date(comment.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        ))
                    )}
                </div>

                {/* Saved Posts Section */}
                <div className="mt-10 space-y-4">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Saved Posts</h1>
                    {savedPosts.length === 0 ? (
                        <p className="text-gray-500">No saved posts.</p>
                    ) : (
                        savedPosts.map((post) => (
                            <div
                                key={post.id}
                                className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition"
                            >
                                <h3 className="text-lg font-semibold text-blue-700">{post.title}</h3>
                                <p className="text-sm text-gray-700 mt-1">{post.content}</p>
                                <p className="text-xs text-gray-400 mt-2">
                                    Saved on {new Date(post.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        ))
                    )}
                </div>

                {/* Saved Comments Section */}
                <div className="mt-10 space-y-4">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Saved Comments</h1>
                    {savedComments.length === 0 ? (
                        <p className="text-gray-500">No saved comments.</p>
                    ) : (
                        savedComments.map((comment) => (
                            <div
                                key={comment.id}
                                className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition"
                            >
                                <p className="text-sm text-gray-700">{comment.content}</p>
                                <p className="text-xs text-gray-400 mt-2">
                                    On post <span className="font-semibold text-blue-700">{comment.post_title}</span> •{" "}
                                    {new Date(comment.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        ))
                    )}
                </div>


            </div>
        </div>
    );
}